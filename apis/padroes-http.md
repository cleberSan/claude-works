---
resumo: Padrões para APIs HTTP no ecossistema - rotas, escopos, multi-tenant, erros ProblemDetails com código estável, idempotência, concorrência, paginação e limites.
atualizado: 2026-10-26
fontes:
  - https://github.com/cleberSan/careflow/blob/main/README.md
---

# Padrões HTTP

Extraídos do CareFlow e válidos para qualquer API nova do ecossistema. Checklist em [templates/checklist-api.md](../templates/checklist-api.md).

## Rotas

- Prefixo de versão: `/v1/...`. Recurso no plural, em inglês, kebab-case: `/v1/appointments`, `/v1/subject-requests`.
- Ação que não é CRUD vira sub-recurso com `POST`: `/v1/appointments/{id}/cancel`, `/v1/subject-requests/{id}/identity-confirmation`.
- Rotas de borda pública ganham prefixo próprio e são as únicas expostas (`/demo/v1/*` no Caddy).
- Health fora da versão: `/health/live`, `/health/ready`.

## Autenticação e autorização

- JWT Bearer com escopos `<serviço>.<ação>`: `scheduling.read`, `scheduling.write`, `vault.keys`, `rights.admin`, `notifications.admin`, `triage.submit`, `triage.review`.
- **Menor privilégio:** escrita não implica leitura (`vault.write` não lê), quem envia não revisa.
- **Clínica pela claim `tenant_id`**, nunca por parâmetro. Recurso de outra clínica responde **404** (não 403, para não confirmar existência).
- Serviço a serviço: token curto assinado (P-256), por clínica, com escopo estreito (`vault.contact.read`).
- Rota anônima só com token no **corpo** e uso único (ex.: `POST /v1/downloads`).

## Erros

- **ProblemDetails (RFC 9457)** com extensão `code` estável e `traceId`; título é a frase do status.
- Código em português, `Contexto.Motivo`: `Agenda.HorarioIndisponivel`, `Agenda.PacienteAindaNaoConhecido`, `Idempotencia.ChaveInvalida`, `Idempotencia.ChaveReutilizada`.
- Mensagem nunca carrega dado pessoal.

| Tipo de erro | Status |
|---|---|
| Validation | 400 |
| Unauthorized | 401 |
| Forbidden | 403 |
| NotFound | 404 |
| Conflict | 409 |
| Gone (eliminado de propósito) | 410 |
| PreconditionFailed (ETag velho) | 412 |
| PreconditionRequired (faltou `If-Match`) | 428 |
| Limite excedido | 429 com `Retry-After` |
| Serviço desligado por interruptor | 503 com `Retry-After` |

## Idempotência

- Criação exige `Idempotency-Key` (1 a 64 de `[A-Za-z0-9_-]`).
- Índice único `(tenant_id, idempotency_key)` + impressão digital SHA-256 do corpo canônico.
- Mesma chave e mesmo corpo: devolve o recurso original com `Idempotent-Replayed: true`. Mesma chave e corpo diferente: 409.
- Corrida entre retentativas: se a constraint de negócio dispara mas a vencedora tem a mesma chave, é replay, não conflito. Snippet: [snippets/dotnet/idempotencia.md](../snippets/dotnet/idempotencia.md).

## Concorrência

- Alteração exige `If-Match` com o ETag lido; sem ele 428, desatualizado 412.
- Regra que depende de outro registro trava com `FOR SHARE` na mesma transação; fila de trabalho com `FOR UPDATE SKIP LOCKED`.
- Garantia de unicidade ou não sobreposição no banco (constraint), traduzida pelo nome.

## Consistência eventual

- Quando a API depende de projeção alimentada por eventos, responda 409 com código explícito (`Agenda.PacienteAindaNaoConhecido`) e oriente a repetir com a mesma `Idempotency-Key`.

## Paginação e consulta

- Cursor (`after`, `limit`) em listas que crescem (auditoria); intervalo explícito (`from`, `to`) em agenda. Limite máximo no servidor.

## Limites e entrada

- Tamanho de corpo limitado na borda e no serviço (8 KB no Caddy, 4 KB no Demo, 16 KiB na triagem).
- Rate limiting por IP, por sessão e por clínica nas ações caras; teto de recursos simultâneos.
- Validação na borda; tipos fortes no domínio; texto livre com tamanho mínimo e máximo.

## Observabilidade e auditoria

- Toda leitura e alteração de dado de paciente vira evento de auditoria (quem, o quê, quando, recurso).
- Métricas por resultado (sucesso, conflito, replay, inelegível); span por caso de uso.
