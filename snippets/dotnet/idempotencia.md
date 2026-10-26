---
resumo: Criação idempotente com Idempotency-Key, impressão digital do corpo e constraint no banco, tratando a corrida entre retentativas, como na reserva do CareFlow.
atualizado: 2026-10-26
fontes:
  - https://github.com/cleberSan/careflow/blob/main/src/Services/Scheduling/CareFlow.Scheduling.Api/Features/Appointments/BookAppointment.cs
  - https://github.com/cleberSan/careflow/blob/main/docs/adr/0002-agenda-sem-dupla-reserva.md
---

# Idempotência na criação

## Cabeçalho

```csharp
/// Idempotency-Key (draft-ietf-httpapi-idempotency-key-header): obrigatório nas criações.
internal static partial class IdempotencyKey
{
    public const string HeaderName = "Idempotency-Key";
    public const string ReplayedHeaderName = "Idempotent-Replayed";

    public static readonly Error Invalid = Error.Validation("Idempotencia.ChaveInvalida",
        "Envie o cabeçalho Idempotency-Key com 1 a 64 caracteres entre letras, números, '-' e '_'.");
    public static readonly Error ReusedWithDifferentPayload = Error.Conflict("Idempotencia.ChaveReutilizada",
        "Esta Idempotency-Key já foi usada com outro conteúdo.");

    public static Result<string> Validate(string? value) =>
        value is not null && Pattern().IsMatch(value) ? Result.Success(value) : Result.Failure<string>(Invalid);

    [GeneratedRegex("^[A-Za-z0-9_-]{1,64}$", RegexOptions.CultureInvariant)]
    private static partial Regex Pattern();
}
```

## Banco

```csharp
builder.Property(a => a.IdempotencyKey).HasColumnName("idempotency_key").HasMaxLength(64);
builder.HasIndex(a => new { a.TenantId, a.IdempotencyKey })
    .IsUnique()
    .HasDatabaseName("ux_appointments_tenant_idempotency_key");
```

## Handler (essência)

```csharp
var fingerprint = Fingerprint(request);                    // SHA-256 do corpo canônico
var existing = await FindByIdempotencyKeyAsync(key, ct);
if (existing is not null) return Replay(existing, fingerprint);

// ... cria o agregado (Result) e salva numa transação
switch (await SaveAsync(appointment, actor, now, ct))
{
    case SaveOutcome.Saved:
        return new BookingOutcome(appointment, Replayed: false);
    case SaveOutcome.SlotTaken:
        // Retentativas simultâneas com a mesma chave disputam o mesmo horário: a exclusion constraint
        // pode disparar antes do índice de idempotência. Se a vencedora tem esta chave, é replay.
        var sameKey = await FindByIdempotencyKeyAsync(key, ct);
        return sameKey is not null ? Replay(sameKey, fingerprint) : AppointmentErrors.SlotUnavailable;
    default: // KeyTaken: outra requisição com a mesma chave venceu
        var winner = await FindByIdempotencyKeyAsync(key, ct)
            ?? throw new InvalidOperationException("Violação de idempotência sem registro correspondente.");
        return Replay(winner, fingerprint);
}

static string Fingerprint(BookAppointmentRequest r) =>
    Convert.ToHexStringLower(SHA256.HashData(Encoding.UTF8.GetBytes(string.Join('|',
        r.ProfessionalId.ToString("N"), r.PatientRef.ToString("N"),
        r.StartsAt.UtcTicks.ToString(CultureInfo.InvariantCulture),
        r.EndsAt.UtcTicks.ToString(CultureInfo.InvariantCulture)))));

Result<BookingOutcome> Replay(Appointment existing, string fingerprint) =>
    existing.RequestFingerprint == fingerprint
        ? new BookingOutcome(existing, Replayed: true)
        : IdempotencyKey.ReusedWithDifferentPayload;
```

## Salvar sem TOCTOU

```csharp
try
{
    await db.SaveChangesAsync(ct);          // o banco decide a corrida
    await transaction.CommitAsync(ct);
    return SaveOutcome.Saved;
}
catch (DbUpdateException ex) when (ex.IsExclusionViolation("ex_appointments_no_overlap"))
{
    db.ChangeTracker.Clear();
    return SaveOutcome.SlotTaken;
}
catch (DbUpdateException ex) when (ex.IsUniqueViolation("ux_appointments_tenant_idempotency_key"))
{
    db.ChangeTracker.Clear();
    return SaveOutcome.KeyTaken;
}
```

## Constraint (migration)

```csharp
// Duas consultas ativas do mesmo profissional, na mesma clínica, não podem ter [início, fim) sobrepostos.
migrationBuilder.Sql(
    """
    ALTER TABLE appointments
        ADD CONSTRAINT ex_appointments_no_overlap
        EXCLUDE USING gist (
            tenant_id WITH =,
            professional_id WITH =,
            tstzrange(starts_at, ends_at, '[)') WITH &&
        )
        WHERE (status = 'Booked');
    """);
```

Exige a extensão `btree_gist` (`HasPostgresExtension`).

## Endpoint

```csharp
public static async Task<Results<Created<AppointmentResponse>, ProblemHttpResult>> HandleAsync(
    [FromHeader(Name = IdempotencyKey.HeaderName)] string? idempotencyKey,
    BookAppointmentRequest request, BookAppointmentHandler handler, HttpResponse response, CancellationToken ct)
{
    var key = IdempotencyKey.Validate(idempotencyKey);
    if (key.IsFailure) return key.Error.ToProblem();

    var result = await handler.HandleAsync(request, key.Value, AuditActor.From(response.HttpContext.User), ct);
    if (result.IsFailure) return result.Error.ToProblem();

    var (appointment, replayed) = result.Value;
    if (replayed) response.Headers[IdempotencyKey.ReplayedHeaderName] = "true";
    return TypedResults.Created($"/v1/appointments/{appointment.Id}", AppointmentResponse.From(appointment));
}
```

## Resposta

- 201 com o recurso na primeira vez; replay devolve o mesmo corpo com `Idempotent-Replayed: true`.
- Testes: mesma chave e corpo (replay), mesma chave e corpo diferente (409), 20 requisições simultâneas no mesmo horário (1 sucesso), retentativas simultâneas com a mesma chave (1 recurso).
