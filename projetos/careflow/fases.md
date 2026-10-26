---
resumo: As fases 0 a 10 do CareFlow - entrega, decisões do Cleber, PRs nos dois repositórios, ADR e o que ficou para depois.
atualizado: 2026-10-26
---

# Fases do CareFlow

Cada fase termina em algo publicável: PR no careflow (código + ADR), PR no portfolio-web (post no diário + roadmap) e, às vezes, post no LinkedIn. Posts do diário: `/diario/<slug>` no site.

## Resumo

| Fase | Entrega | careflow | portfolio-web | ADR | Post |
|---|---|---|---|---|---|
| 0 | Padrões, CI com qualidade e segurança, ADRs iniciais | #1 | #1 | 0000, 0001 | `fase-0-fundacao` |
| 1 | Site v1: home, sobre, stack, diário em MDX, SEO, E2E com axe; deploy na Vercel | — | #2, #3 | site 0001–0005 | — |
| 2 | Agenda multi-clínica sem dupla reserva | #2 | — | 0002 | `fase-2-agenda-sem-dupla-reserva` |
| 3 | Cofre do paciente: cifragem por campo e RLS | #4 | #9 | 0003, 0004 | `fase-3-cofre-do-paciente` |
| 4 | Consentimento, auditoria HMAC, Outbox/Inbox | #5 | #10 | 0006, 0007, 0008 | `fase-4-consentimento-e-auditoria` |
| 5 | Notificações com fallback e falhas injetáveis | #6 | #11 | 0009 | `fase-5-notificacoes-com-fallback` |
| 6 | OpenTelemetry e Painel de Privacidade e Resiliência | #7, #8 | #12 | 0010 | `fase-6-observabilidade-e-painel` |
| 7 | Triagem com IA, pseudonimização e guardrails | #9, #10 | #13, #14 | 0011 | `fase-7-triagem-com-ia` |
| 8 | Direitos do titular e Bundle HL7 FHIR R4 | #11 | #16 | 0012 | `fase-8-direitos-do-titular` |
| 9 | CareFlow no ar de graça: stack de produção, deploy, backup | #12 a #19 | #17 | 0013 | `fase-9-careflow-no-ar` |
| 10 | Testes de carga e deploy gradual | planejada | planejada | — | — |

PRs do site fora das fases: #15 (destaque de demonstração e código), #18 (LinkedIn como contato, prévias), #19 (visual "Sala de controle"), #20 (site centrado no Cleber), #25 (vídeo "O fluxo em um minuto").

## Detalhe por fase

### 0. Fundação (2026-10-14)
- Monorepo .NET 10, `global.json` com Microsoft.Testing.Platform, CPM + lock files, warnings como erro, `dotnet format` no CI, CodeQL `security-extended` para C# e workflows, Dependabot, revisão de dependências.

### 2. Agenda (2026-10-14)
- Exclusion constraint GiST com `btree_gist` sobre `[início, fim)` por `(tenant_id, professional_id)` enquanto `Booked`; violação `23P01` → 409 `Agenda.HorarioIndisponivel`. Testado com 20 reservas simultâneas.
- `Idempotency-Key` obrigatória (1 a 64 caracteres `[A-Za-z0-9_-]`), índice único por clínica, impressão digital SHA-256 do pedido; mesma chave com outro conteúdo → 409 `Idempotencia.ChaveReutilizada`; replay devolve `Idempotent-Replayed`.
- Adiado: cadastro de profissionais, rate limiting.

### 3. Cofre (2026-10-14/15)
- Decisões do Cleber: blind index do CPF incluído; validação do `patientRef` pela agenda fica para a fase 4 via eventos.
- RLS em toda tabela de clínica; interceptor do EF grava `app.tenant_id`; migrations com login dono, API sem dono; readiness recusa superusuário e `BYPASSRLS`.
- Adiado e feito depois: DEK por paciente e crypto-shredding (fase 8), KMS de nuvem (fase 9). Ainda adiado: rate limiting na busca por CPF.

### 4. Consentimento e auditoria (2026-10-15)
- Decisões: mensageria própria (sem MassTransit), projeção local na agenda com consistência eventual, revogação cancela futuras, cadeia HMAC por clínica com chave fora do banco.
- Convenções criadas: login de despachante por serviço (`{svc}_relay`), testes com `Messaging:Enabled=false` + `DeliverAsync` da fixture, `tests/CareFlow.EndToEndTests` com os 4 serviços, Postgres e RabbitMQ reais.
- Adiado: ancoragem externa da auditoria, retenção, aviso ao paciente (fase 5).

### 5. Notificações (2026-10-15)
- Decisões: contato lido sob demanda em rota estreita do cofre (`GET /v1/patients/{ref}/contact`, escopo `vault.contact.read`, auditado) com token de serviço por clínica; provedores simulados; sem Redis; agendador próprio.
- Setup local: par P-256 nos user secrets (privada no Notifications, pública no cofre).

### 6. Observabilidade e Painel (2026-10-15)
- Decisões: sem hospedagem nesta fase (CI grava, site reproduz); stack local de observabilidade; sem YARP/Keycloak, BFF do Demo com emissor HS256 local recusado em produção; cookie `__Host-`.
- Atualizar o Painel: artefato `panel-recording` do CI (ou `PanelRecordingTests` com `CAREFLOW_PANEL_RECORDING` e `CAREFLOW_COMMIT`) → copiar byte a byte para `src/content/painel/gravacao.json` do site (ignorado pelo Prettier).

### 7. Triagem com IA (2026-10-15/16)
- Decisões: Claude Haiku 5.5 pelo SDK oficial C# (MIT); CI e Painel com respostas gravadas (cassetes nomeados pelo SHA-256 do prompt, casos em `eval/triage/cases.json`); workflow manual `triage-recordings.yml` com teto de chamadas faz as chamadas reais; regras próprias de mascaramento; auditoria guarda só o SHA-256 do pedido.
- Resultado da avaliação v2 (57 casos sintéticos): **76,6% exata, 93,6% a até um nível, 8,5% de subtriagem, 0 recusas**. A v1 teve 7 justificativas citando doença; o guard foi apertado e o prompt virou `triage-v2`.
- A chave da API fica só em secret do GitHub, com limite de gasto baixo.

### 8. Direitos do titular e FHIR (2026-10-16)
- Decisões: política de retenção fixa e versionada no código; Firely SDK (BSD-3) com validação no processo e `THIRD-PARTY-NOTICES`; identidade por código de uso único ao contato do cadastro; pacote cifrado por até 7 dias no banco do Rights, link de 15 min e uso único.
- Risco tratado: backup anterior à eliminação ainda tem a DEK embrulhada → registro de eliminações reaplicado em toda restauração, com teste.

### 9. CareFlow no ar (2026-10-16 a 19)
- Decisões: DuckDNS + Let's Encrypt (Caddy, TLS-ALPN na 443); OCI Vault com chave por software via instance principal; backup no Object Storage por 7 dias; observabilidade enxuta na VM.
- Entregue: `deploy/prod` (compose, Caddy, scripts), workflows Imagens, Deploy (aprovação manual, fumaça, rollback), Interruptor e Stack de produção (sobe a stack num runner em todo PR), runbook `docs/operacao/demonstracao-hospedada.md`.
- Bloqueio: sem capacidade A1 em São Paulo. PRs #15 a #19 são ajustes reais do `provision.sh` e o robô `careflow-cacador`. Ver [operacao.md](operacao.md).

### 10. Testes de carga e deploy gradual (planejada)
- Plano original: k6 com metas de p95/p99 publicadas e deploy gradual (canary). Depende de ambiente no ar ou de rodar a carga num runner.
- Ao começar, o prompt da fase deve trazer: metas de latência, onde roda a carga (runner do GitHub é grátis em repositório público), como medir sem custo e o que muda no deploy.
