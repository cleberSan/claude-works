---
resumo: CareFlow, o projeto vitrine - o que é, estado atual, estrutura do repositório, ADRs e por onde começar.
atualizado: 2026-10-30
fontes:
  - https://github.com/cleberSan/careflow
---

# CareFlow

Plataforma multi-clínica de **agendamento e triagem assistida por IA**, com **privacidade por design (LGPD)**, em .NET 10 com microsserviços. É uma **demonstração**: dados 100% sintéticos, sem diagnóstico e sem promessa clínica. Repositório: <https://github.com/cleberSan/careflow> (MIT).

## Estado (2026-10-26)

- Fases 0 a 9 concluídas; **fase 10 (testes de carga e deploy gradual) planejada, não iniciada**.
- Código da hospedagem pronto (fase 9), mas o backend **ainda não está no ar**: a Oracle não tem capacidade A1 gratuita em São Paulo. Um robô na própria Oracle tenta criar a VM. Enquanto isso, o Painel do site roda em **replay** da gravação do CI. Detalhes: [operacao.md](operacao.md).
- A página do CareFlow no site tem os botões "Ver demonstração" (Painel) e "Ver código", e a seção em vídeo "O fluxo em um minuto".

## Arquivos deste projeto

| Arquivo | Conteúdo |
|---|---|
| [arquitetura.md](arquitetura.md) | Serviços, dados, segurança, mensageria, observabilidade, diagrama |
| [fases.md](fases.md) | Fase a fase: entrega, decisões, PRs, ADR, o que ficou para depois |
| [convencoes.md](convencoes.md) | Código, banco, testes, cobertura, segredos locais, como rodar |
| [operacao.md](operacao.md) | Hospedagem na Oracle, workflows de deploy, backup, robô, pendências |
| [../../apis/careflow.md](../../apis/careflow.md) | Endpoints, escopos e eventos |

## Estrutura do repositório

```
src/Services/<Serviço>/        Api (fatias verticais em Features/) e Domain quando há regra rica
src/BuildingBlocks/            CareFlow.BuildingBlocks (Result, Error, tenancy, SealedBox, LogMask)
                               .AspNetCore (ProblemDetails, OTel, redação, tokens de serviço, políticas)
                               .Messaging (RabbitMQ, Outbox, Inbox, topologia)
                               .Persistence (RLS, interceptor de clínica, purga do Demo)
                               CareFlow.Contracts (eventos de integração, política de retenção)
tests/CareFlow.<Serviço>.{UnitTests,IntegrationTests}, EndToEndTests, SmokeTests, Testing, Triage.Evaluation
eval/triage/                   cases.json (57 casos sintéticos) e recordings/ (respostas gravadas)
deploy/                        docker/ (Dockerfile), postgres/ (init-dev.sql), observability/, prod/ (compose,
                               Caddy, scripts da VM em prod/bin), oracle/ (provision.sh, a1-hunter.sh, cloud-init)
docs/adr/, docs/operacao/      decisões e passo a passo da hospedagem
```

Serviços: **Scheduling, PatientVault, Consent, Audit, Notifications, Triage, Rights, Demo** (backend do Painel).

## ADRs

| ADR | Decisão em uma linha |
|---|---|
| [0000](https://github.com/cleberSan/careflow/blob/main/docs/adr/0000-registrar-decisoes-com-adr.md) | Toda decisão relevante vira ADR; ADR aceito não é editado, é substituído |
| [0001](https://github.com/cleberSan/careflow/blob/main/docs/adr/0001-arquitetura-base.md) | .NET 10, monorepo, Vertical Slices + DDD, Result Pattern, warnings como erro, CPM + lock files, cobertura 80% |
| [0002](https://github.com/cleberSan/careflow/blob/main/docs/adr/0002-agenda-sem-dupla-reserva.md) | Exclusion constraint GiST `[início, fim)` por profissional; `23P01` vira 409; Idempotency-Key obrigatória |
| [0003](https://github.com/cleberSan/careflow/blob/main/docs/adr/0003-row-level-security-por-clinica.md) | RLS com `FORCE` em toda tabela de clínica; `app.tenant_id` por conexão; falha fechada |
| [0004](https://github.com/cleberSan/careflow/blob/main/docs/adr/0004-patient-vault-cifragem-por-campo.md) | AES-256-GCM por campo, envelope encryption, KMS atrás de interface, blind index do CPF |
| — | Não existe ADR-0005 no careflow (número pulado) |
| [0006](https://github.com/cleberSan/careflow/blob/main/docs/adr/0006-mensageria-outbox-inbox-rabbitmq.md) | Camada própria sobre RabbitMQ.Client 7: Outbox, Inbox, filas quorum, DLQ, clínica no cabeçalho |
| [0007](https://github.com/cleberSan/careflow/blob/main/docs/adr/0007-auditoria-com-cadeia-hmac.md) | Auditoria append-only com cadeia HMAC-SHA256 por clínica |
| [0008](https://github.com/cleberSan/careflow/blob/main/docs/adr/0008-consentimento-e-propagacao-para-a-agenda.md) | Consentimento por finalidade; projeção na agenda; revogação cancela consultas futuras |
| [0009](https://github.com/cleberSan/careflow/blob/main/docs/adr/0009-notificacoes-com-fallback-e-falhas-injetaveis.md) | Fallback WhatsApp → SMS → e-mail, circuit breaker, falhas injetáveis, contato lido no cofre |
| [0010](https://github.com/cleberSan/careflow/blob/main/docs/adr/0010-observabilidade-e-painel-de-privacidade.md) | OpenTelemetry ponta a ponta sem PII; Painel por replay; hospedagem revista no 0013 |
| [0011](https://github.com/cleberSan/careflow/blob/main/docs/adr/0011-triagem-com-ia-pseudonimizada.md) | Triagem com Claude Haiku 5.5 sobre texto mascarado, guardrails, respostas gravadas no CI |
| [0012](https://github.com/cleberSan/careflow/blob/main/docs/adr/0012-direitos-do-titular-e-fhir.md) | Direitos do titular, crypto-shredding por paciente, Bundle FHIR R4 com Firely |
| [0013](https://github.com/cleberSan/careflow/blob/main/docs/adr/0013-demonstracao-hospedada-na-oracle.md) | Demonstração numa VM Always Free da Oracle, Caddy, DuckDNS, OCI Vault, deploy aprovado com rollback |
| [0014](https://github.com/cleberSan/careflow/blob/main/docs/adr/0014-atualizacao-de-dependencias-sem-auto-merge.md) | Dependabot mensal, agrupado e com cooldown, sem auto-merge (NU1004 nos lock files; merge pelo `GITHUB_TOKEN` não publicaria as imagens). PR vermelho com NU1004: `dotnet restore --force-evaluate` no branch |

## Riscos residuais registrados (ADR-0012 e ADR-0013)

- **Retenção sem rotina:** a política diz até quando cada item fica, mas nada apaga o que venceu.
- **Chave do Rights sem rotação** (`Rights:Keys:KeyEncryptionKey`); trocar invalida pacotes de até 7 dias.
- **Código por SMS/WhatsApp** como prova de identidade: quem controla o chip controla o pedido.
- **Restauração** depende de rodar `erasure-replay`; o CI ensaia, o runbook lembra.
- **Uma VM só**, segredos da VM sem cópia, chave HS256 compartilhada entre Demo e serviços (sem IdP), um usuário no RabbitMQ.
- **Rollback depois de migration** só se o esquema novo for compatível com o código anterior; migration que atualiza linhas sob FORCE RLS precisa definir a clínica.
- **Auditoria sem retenção**; cota Always Free pode ser recuperada pela Oracle.

## Fontes fora do repositório

- Plano original: `/mnt/project-files/portfolio/plano-inicial.md` (parte mudou: sem YARP/Keycloak, sem MassTransit, sem Redis, nuvem Oracle). Valem os ADRs.
- Decisões por fase: `/mnt/project-files/portfolio/fase-N-decisoes.md` (fases 7, 8 e 9).
