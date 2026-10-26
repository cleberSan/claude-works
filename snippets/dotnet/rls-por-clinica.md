---
resumo: Row-Level Security por clínica no PostgreSQL com EF Core - interceptor que grava app.tenant_id, extensões de migration e regras de papéis.
atualizado: 2026-10-26
fontes:
  - https://github.com/cleberSan/careflow/tree/main/src/BuildingBlocks/CareFlow.BuildingBlocks.Persistence/RowLevelSecurity
  - https://github.com/cleberSan/careflow/blob/main/docs/adr/0003-row-level-security-por-clinica.md
---

# RLS por clínica

Isolamento que vale mesmo com bug na aplicação: o banco não devolve nem aceita linha de outra clínica.

## Interceptor: clínica na sessão a cada conexão

```csharp
/// Sem clínica, o valor fica vazio e as políticas não devolvem nenhuma linha (falha fechada).
/// O valor é de sessão (o EF consulta fora de transação explícita) e sempre sobrescrito na abertura,
/// então conexão reaproveitada do pool nunca carrega a clínica de outra requisição.
public sealed class TenantSessionInterceptor(ITenantContext tenant) : DbConnectionInterceptor
{
    public const string SettingName = "app.tenant_id";
    private const string Sql = "SELECT set_config('" + SettingName + "', @tenant_id, false)";

    public override async Task ConnectionOpenedAsync(DbConnection connection, ConnectionEndEventData eventData,
        CancellationToken cancellationToken = default)
    {
        var command = CreateCommand(connection);
        await using (command.ConfigureAwait(false))
        {
            await command.ExecuteNonQueryAsync(cancellationToken).ConfigureAwait(false);
        }
    }
    // ConnectionOpened (síncrono) faz o mesmo.

    private DbCommand CreateCommand(DbConnection connection)
    {
        var command = connection.CreateCommand();
        command.CommandText = Sql;
        var parameter = command.CreateParameter();
        parameter.ParameterName = "tenant_id";
        parameter.Value = tenant.TryGetTenantId(out var tenantId) ? tenantId.ToString() : string.Empty;
        command.Parameters.Add(parameter);
        return command;
    }
}
```

## Migration: ligar RLS numa tabela

```csharp
public static void EnableTenantRowLevelSecurity(this MigrationBuilder mb, string table, string role,
    string privileges = "SELECT, INSERT, UPDATE", string tenantColumn = "tenant_id")
{
    var predicate = $"\"{tenantColumn}\" = NULLIF(current_setting('app.tenant_id', true), '')::uuid";
    mb.Sql($"""
        ALTER TABLE "{table}" ENABLE ROW LEVEL SECURITY;
        ALTER TABLE "{table}" FORCE ROW LEVEL SECURITY;
        CREATE POLICY tenant_isolation ON "{table}" USING ({predicate}) WITH CHECK ({predicate});
        GRANT {privileges} ON "{table}" TO "{role}";
        """);
}

/// Papel da aplicação sem login; o login real é criado pela infraestrutura, com senha fora do repositório.
public static void EnsureApplicationRole(this MigrationBuilder mb, string role) =>
    mb.Sql($"""
        DO $$ BEGIN
          IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = '{role}') THEN
            CREATE ROLE "{role}" NOLOGIN NOSUPERUSER NOBYPASSRLS;
          END IF;
        END $$;
        GRANT USAGE ON SCHEMA public TO "{role}";
        """);
```

No original, todo identificador passa por uma validação que só aceita `[a-z0-9_]`: nome inesperado quebra a migration em vez de virar SQL arbitrário.

## Uso numa migration

```csharp
migrationBuilder.EnsureApplicationRole("scheduling_app");
migrationBuilder.EnableTenantRowLevelSecurity("appointments", "scheduling_app");
```

## Regras

- `FORCE` faz o RLS valer até para o dono da tabela; migration que atualiza linhas precisa definir a clínica ou rodar por clínica.
- API conecta com login membro do papel `<svc>_app` (sem dono, sem `BYPASSRLS`); readiness falha se não for assim.
- Despachante do Outbox usa outro login (`<svc>_relay`) com política própria só para Outbox/Inbox.
- Filtro global do EF por tenant continua existindo (defesa em profundidade e consultas eficientes).
- Recurso de outra clínica responde 404.
- Teste de integração: tentar ler e gravar com outra clínica na sessão e esperar zero linhas e erro de política.
