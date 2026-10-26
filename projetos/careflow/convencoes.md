---
resumo: Convenções de código, banco, testes e cobertura do CareFlow, mais como rodar local e onde ficam as chaves de desenvolvimento.
atualizado: 2026-10-26
fontes:
  - https://github.com/cleberSan/careflow/blob/main/CONTRIBUTING.md
  - https://github.com/cleberSan/careflow/blob/main/Directory.Build.props
---

# Convenções do CareFlow

## Build e dependências

- `global.json`: SDK `10.0.100` com `rollForward: latestFeature`; runner de testes **Microsoft.Testing.Platform**.
- `Directory.Build.props`: `net10.0`, `Nullable`, `TreatWarningsAsErrors`, `AnalysisLevel latest-recommended`, `EnforceCodeStyleInBuild`, `GenerateDocumentationFile` (sem CS1591), `Deterministic`, `ContinuousIntegrationBuild` no CI, `RestorePackagesWithLockFile` e `RestoreLockedMode` no CI.
- `Directory.Packages.props` (CPM): versões centralizadas. Pacotes principais em 2026-10-26: EF Core/ASP.NET 10.0.13, Npgsql 10.0.3, RabbitMQ.Client 7.2.2, OpenTelemetry 1.19, Microsoft.Extensions.Http.Resilience 10.11.0, Anthropic 12.57.0, Hl7.Fhir.R4 6.7.0, Firely.Fhir.Validation.R4 3.5.0, OCI.DotNetSDK.Keymanagement 147.1.0, xunit.v3 4.0.2, coverlet.MTP 10.1.0, Testcontainers 4.16.0.
- Licenças: CI bloqueia GPL-3.0 e AGPL-3.0 em dependência; BSD-3 e similares entram em `THIRD-PARTY-NOTICES.md`.

## Código

- **Fatia vertical por caso de uso:** `Features/<Agregado>/<CasoDeUso>.cs` com request, handler e endpoint juntos; `Common/` para HTTP, segurança, auditoria e métricas do serviço; `Infrastructure/Persistence` para DbContext, configurações e migrations.
- **Domínio** em projeto próprio só onde há regra rica (`CareFlow.Scheduling.Domain`, Consent); erros do domínio em classes estáticas (`AppointmentErrors`).
- **Result Pattern:** `Result`, `Result<T>`, `Error` (tipos: Validation, NotFound, Conflict, Unauthorized, Forbidden, PreconditionFailed, PreconditionRequired, Gone, Failure). Exception só para erro de programação e infraestrutura. Snippet: [snippets/dotnet/result-e-problemdetails.md](../../snippets/dotnet/result-e-problemdetails.md).
- **Códigos de erro estáveis** em português, `Contexto.Motivo`: `Agenda.HorarioIndisponivel`, `Agenda.PacienteAindaNaoConhecido`, `Idempotencia.ChaveReutilizada`. Mensagem sem dado pessoal.
- **Minimal APIs** com `TypedResults`, `WithSummary`, OpenAPI só em desenvolvimento, `UseExceptionHandler` + `UseStatusCodePages`, health `/health/live` (sem checks) e `/health/ready` (tag `ready`).
- Logs com `LoggerMessage` gerado (`partial` + atributo), sem clínica, pseudônimo ou PII; `LogMask` quando precisar citar algo.
- `TimeProvider` injetado (testes controlam o relógio), `CancellationToken` em tudo, `ConfigureAwait(false)` nas bibliotecas.
- `BuildingBlocks` só recebe o que dois ou mais serviços usam.

## Banco

- Um banco por serviço (`careflow_<serviço>`), criado por `deploy/postgres/init-dev.sql` no desenvolvimento.
- Logins: `<svc>_api` (papel `<svc>_app`, sem dono), `<svc>_dispatcher` (papel `<svc>_relay`), migrations com o dono. Connection strings `ConnectionStrings:<Svc>`, `<Svc>Migrations`, `<Svc>Relay`.
- **Tabela nova com dado de clínica:** coluna `tenant_id` + `migrationBuilder.EnableTenantRowLevelSecurity(tabela, papel)` na migration. Snippet: [snippets/dotnet/rls-por-clinica.md](../../snippets/dotnet/rls-por-clinica.md).
- Violação de constraint traduzida por nome (`IsUniqueViolation(nomeDoÍndice)`, `IsExclusionViolation(...)`), nunca por texto de mensagem.
- Em desenvolvimento a API aplica migrations na subida; em produção, container de uma execução (`Database:MigrateAndExit`).

## Testes

- xUnit v3 sobre MTP, padrão **AAA**, nomes `Metodo_Condicao_Resultado` (ex.: `Book_WithEndNotAfterStart_FailsWithInvalidInterval`).
- Por serviço: `UnitTests` (domínio puro) e `IntegrationTests` (`WebApplicationFactory` + PostgreSQL real por Testcontainers ou `CAREFLOW_TEST_POSTGRES`).
- `tests/CareFlow.EndToEndTests`: serviços num processo com PostgreSQL e RabbitMQ reais; derruba o broker, duplica, desordena e manda para DLQ; varre telemetria atrás de PII.
- `tests/CareFlow.Testing`: `PostgresTestServer`, `SyntheticPatients`, `CapturingLoggerProvider`.
- Testes de integração usam `Messaging:Enabled=false` e entregam eventos pela fixture (`DeliverAsync` via `InboxProcessor`).
- Concorrência testada de verdade: 20 reservas simultâneas do mesmo horário exigem exatamente 1 sucesso.
- **Cobertura:** `dotnet test --coverlet --coverlet-threshold 80`, por projeto de teste via `testconfig.json` (`include`/`exclude`, `excludeByFile: **/Migrations/*.cs`, `excludeAssembliesWithoutSources: MissingAll`). Código medido fica em biblioteca, nunca no executável de teste ([lições](../../memorias/licoes-aprendidas.md)).

## Rodar local

```bash
docker compose up -d                       # Postgres, RabbitMQ e observabilidade
dotnet restore && dotnet format --verify-no-changes
dotnet build -c Release
dotnet test -c Release --coverlet --coverlet-output-format cobertura
dotnet run --project src/Services/Scheduling/CareFlow.Scheduling.Api
dotnet user-jwts create --project <Api> --scope "<escopos>" --claim tenant_id=11111111-1111-1111-1111-111111111111 -o token
```

Chaves de desenvolvimento nos **user secrets** (nunca em arquivo versionado):

| Serviço | Chave | Conteúdo |
|---|---|---|
| PatientVault | `KeyManagement:Local:Keys:dev-1` | 32 bytes Base64 (KEK local) |
| PatientVault | `InternalAuth:PublicKey` | pública P-256 (DER Base64) dos tokens de serviço |
| Audit | `Audit:Chain:Keys:dev-1` | 32 bytes Base64 (HMAC da cadeia) |
| Notifications, Triage | `ServiceTokens:Local:PrivateKey` | privada P-256 PKCS#8 Base64 |
| Rights e Notifications | par P-256 da confirmação de identidade e chave de 32 bytes do Rights | ver CONTRIBUTING |
| Triage | `ANTHROPIC_API_KEY` | só para `Triage:Model:Provider=Anthropic`; padrão é `Fake` |

Provedores da triagem: `Fake` (regras, sem rede), `Recorded` (`Triage:Model:RecordingsPath=eval/triage/recordings`), `Anthropic` (real, com `Triage:Model:MaxCalls`).

## Workflows

| Workflow | Quando | O que faz |
|---|---|---|
| CI | push na main, PR | restore travado, format, build, testes com cobertura 80%, artefatos `coverage`, `triage-evaluation`, `panel-recording`; revisão de dependências |
| CodeQL | push, PR, semanal | C# e workflows, `security-extended` |
| Imagens | push, PR, manual | 8 imagens arm64 no GHCR (`ghcr.io/clebersan/careflow:<serviço>-<commit>`) |
| Stack de produção | PR, manual | sobe a stack de produção num runner: deploy, fumaça na 443, interruptor, backup, restauração com `erasure-replay` |
| Deploy da demonstração | manual, environment `production` | deploy por SSH, fumaça na URL pública, rollback automático |
| Interruptor do Painel ao vivo | manual | liga ou desliga o Demo sem redeploy |
| Gravar respostas da triagem | manual (e PR do próprio workflow) | chamadas reais ao modelo com teto; artefatos `triage-recordings` |
