---
resumo: Padrão .NET do ecossistema - versões, estrutura de solução, qualidade no build, Minimal APIs, EF Core com Npgsql, resiliência, mensageria e o que evitar.
atualizado: 2026-10-26
fontes:
  - https://github.com/cleberSan/careflow/blob/main/docs/adr/0001-arquitetura-base.md
---

# .NET

Referência viva: o repositório **careflow**. Detalhes do projeto em [projetos/careflow/convencoes.md](../projetos/careflow/convencoes.md).

## Versões e ferramentas

- **.NET 10 (LTS)**, SDK fixado em `global.json` (`rollForward: latestFeature`), C# `latest`, `Nullable` e `ImplicitUsings` ligados.
- Solução em `.slnx`. Ferramentas locais em `dotnet-tools.json`.
- **Central Package Management** (`Directory.Packages.props`) + **lock files** (`RestorePackagesWithLockFile`, `RestoreLockedMode` no CI). Atualizar pacote: `dotnet restore --force-evaluate` e commitar os `packages.lock.json`.
- No container do Claude: `apt-get install -y dotnet-sdk-10.0` ([ambiente](../memorias/ambiente-cloud.md)).

## Qualidade no build

```xml
<TreatWarningsAsErrors>true</TreatWarningsAsErrors>
<AnalysisLevel>latest-recommended</AnalysisLevel>
<EnforceCodeStyleInBuild>true</EnforceCodeStyleInBuild>
<GenerateDocumentationFile>true</GenerateDocumentationFile>
<NoWarn>$(NoWarn);CS1591</NoWarn>
<Deterministic>true</Deterministic>
<ContinuousIntegrationBuild Condition="'$(CI)' == 'true'">true</ContinuousIntegrationBuild>
```

- `.editorconfig` versionado; `dotnet format --verify-no-changes` no CI.
- Supressão de analisador só com `#pragma` local e justificativa no comentário.

## Arquitetura

- **Vertical Slices** por caso de uso; **DDD** só onde há regra rica (agregado com fábrica que devolve `Result`). Não chamar de Clean Architecture.
- **Result Pattern** para fluxo de negócio; exception só para bug e infraestrutura. Borda HTTP converte `Error` em **ProblemDetails (RFC 9457)** com `code` estável ([snippet](../snippets/dotnet/result-e-problemdetails.md)).
- `BuildingBlocks` mínimo: só o que dois serviços usam.
- DI nativa, `IOptions` com validação na subida, `TimeProvider` injetado, `CancellationToken` em todo método assíncrono, `ConfigureAwait(false)` em biblioteca.
- `LoggerMessage` gerado por atributo; nada de interpolação em log; nenhum dado pessoal.

## HTTP

- **Minimal APIs** com `TypedResults`, `MapGroup` por recurso, `WithSummary`, OpenAPI só em desenvolvimento.
- Autenticação JWT Bearer com `MapInboundClaims = false`; políticas por escopo e por clínica.
- `UseExceptionHandler()` + `UseStatusCodePages()` para nunca vazar stack trace.
- Health: `/health/live` sem checks, `/health/ready` com tag `ready`; dependência que não deve derrubar o serviço (broker) fica fora do `ready`, como degradada.
- Padrões de API em [apis/padroes-http.md](../apis/padroes-http.md).

## Dados

- **EF Core 10 + Npgsql**, um banco por serviço, migrations por serviço. Em produção, migrations num container de uma execução antes da API.
- **Garantia no banco**: constraint (unique, exclusion GiST) em vez de checagem prévia sujeita a TOCTOU; traduzir violação pelo nome da constraint.
- **Multi-tenant**: `tenant_id` em toda tabela de clínica, filtro global no EF e **Row-Level Security** com `FORCE` ([snippet](../snippets/dotnet/rls-por-clinica.md)).
- Login da API sem privilégio de dono; readiness falha se for superusuário ou tiver `BYPASSRLS`.
- Concorrência otimista com `If-Match`/ETag; `FOR SHARE`/`FOR UPDATE SKIP LOCKED` quando a regra pede trava.
- Idempotência de criação com `Idempotency-Key` + índice único ([snippet](../snippets/dotnet/idempotencia.md)).

## Resiliência e mensageria

- HTTP de saída com `Microsoft.Extensions.Http.Resilience` (Polly v8): timeout, retry com jitter, circuit breaker; estado do circuito pelos callbacks de transição.
- Mensageria com **Outbox/Inbox** próprios sobre `RabbitMQ.Client` 7 ([snippet](../snippets/dotnet/outbox-inbox.md)). MassTransit não (licença comercial na v9).

## Criptografia

- AES-256-GCM por campo com AAD; envelope encryption com KMS atrás de interface (`IKeyManagementService`); implementação local recusada fora de desenvolvimento.
- HMAC para blind index e cadeia de auditoria; HKDF para subchaves; P-256 para tokens de serviço.
- Chave de desenvolvimento só em **user secrets**.

## Testes

Ver [stacks/testes.md](testes.md): xUnit v3 + Microsoft.Testing.Platform, coverlet.MTP com limite de 80%, Testcontainers, `WebApplicationFactory`.

## Containers

- Imagem de runtime `mcr.microsoft.com/dotnet/aspnet:10.0-noble-chiseled-extra` (sem shell, usuário sem privilégio, ICU e tzdata).
- Publicação framework-dependent sem RID: compila na arquitetura do runner e roda em arm64 sem emulação.
- Health check sem curl: o próprio binário responde `--health-probe <url>`.

## Evitar

Service Locator, `async void`, `.Result`/`.Wait()`, exception para regra de negócio, reflection desnecessária, helpers estáticos com estado, `SELECT *` implícito em projeção grande, N+1 (use projeção e `AsNoTracking` em leitura).
