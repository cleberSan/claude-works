---
resumo: Outbox transacional e Inbox idempotente sobre RabbitMQ.Client, como no CareFlow - tabelas, SQL do despachante, processamento e garantias.
atualizado: 2026-10-26
fontes:
  - https://github.com/cleberSan/careflow/tree/main/src/BuildingBlocks/CareFlow.BuildingBlocks.Messaging
  - https://github.com/cleberSan/careflow/blob/main/docs/adr/0006-mensageria-outbox-inbox-rabbitmq.md
---

# Outbox e Inbox

Entrega **pelo menos uma vez** com efeito **exatamente uma vez** por consumidor. Camada própria (~1.700 linhas) porque MassTransit v9 é comercial.

## Publicar: Outbox na mesma transação

```csharp
db.Appointments.Add(appointment);
db.RecordAccess(tenantId, "scheduling", actor, "appointment.booked", "patient", patientRef, now); // auditoria
db.PublishBooked(appointment, now);   // db.Enqueue(evento) grava em outbox_messages
await db.SaveChangesAsync(ct);        // negócio + auditoria + evento: tudo ou nada
```

## Despachar: lote travado sem disputa

```sql
SELECT id, tenant_id, type, payload, occurred_at, trace_parent, attempts
FROM outbox_messages
WHERE dispatched_at IS NULL AND next_attempt_at <= @now
ORDER BY next_attempt_at, id
LIMIT @batch
FOR UPDATE SKIP LOCKED
```

- `BackgroundService` publica cada mensagem **esperando a confirmação do broker** e só então marca `dispatched_at`.
- Caiu entre a confirmação e o commit: publica de novo; o Inbox descarta.
- Falha: `attempts` + `next_attempt_at` com backoff exponencial e jitter; o lote para (não martela broker fora).
- Lote cheio: emenda o próximo sem esperar. Ids UUID v7 crescentes mantêm a ordem.
- Limpeza periódica de Outbox despachado e Inbox antigo.

## Consumir: Inbox idempotente

```csharp
scope.ServiceProvider.GetRequiredService<TenantScope>().Enter(context.TenantId); // RLS vale no consumo
var transaction = await db.Database.BeginTransactionAsync(ct);
await using (transaction)
{
    var seen = await db.Set<InboxMessage>()
        .AnyAsync(m => m.Consumer == consumer && m.MessageId == context.MessageId, ct);
    if (seen) return ProcessOutcome.Duplicate;

    db.Set<InboxMessage>().Add(new InboxMessage { TenantId = context.TenantId, Consumer = consumer,
        MessageId = context.MessageId, Type = context.EventType, ProcessedAt = time.GetUtcNow() });

    if (!await dispatcher(scope.ServiceProvider, body, context, ct)) return ProcessOutcome.Invalid;

    await db.SaveChangesAsync(ct);   // duas entregas simultâneas disputam a PK; só uma confirma
    await transaction.CommitAsync(ct);
    return ProcessOutcome.Processed;
}
```

## Topologia

- Exchange topic `careflow.events`; routing key = tipo do evento (`appointment.booked`).
- Fila quorum `careflow.{serviço}` com `x-delivery-limit` e DLQ própria; exchange alternativo → `careflow.unrouted`.
- Publicador e consumidor declaram o que usam (idempotente): ordem de subida não importa.
- Clínica no cabeçalho `careflow-tenant-id`, nunca no corpo; `traceparent` no envelope.
- Inválida (sem handler, corpo ilegível, sem clínica) → DLQ direto; falha passageira → requeue com espera crescente até o limite.

## Banco e papéis

- API só faz `INSERT` no Outbox, só na sua clínica.
- Despachante com login `<svc>_dispatcher` (papel `<svc>_relay`): lê e atualiza Outbox/Inbox de todas as clínicas por política própria, sem acesso às tabelas de negócio.

## Testes que provam

Broker fora (eventos esperam no Outbox, serviço segue atendendo), duplicata (aplicada uma vez), desordem, mensagem envenenada (DLQ), dois despachantes ao mesmo tempo (nenhuma publicação dupla por disputa de lote).
