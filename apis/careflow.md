---
resumo: Catálogo da API do CareFlow - endpoints e escopos de cada serviço, eventos de integração e categorias de retenção.
atualizado: 2026-10-26
fontes:
  - https://github.com/cleberSan/careflow/blob/main/README.md
  - https://github.com/cleberSan/careflow/tree/main/src/BuildingBlocks/CareFlow.Contracts
---

# API do CareFlow

Retrato de 2026-10-26. Fonte da verdade: README do careflow e os arquivos `.http` de cada API. Todas as rotas exigem JWT com `tenant_id`, exceto onde dito.

## Endpoints

| Serviço | Método e rota | Escopo |
|---|---|---|
| Scheduling | `POST /v1/appointments` (exige `Idempotency-Key`) | `scheduling.write` |
| | `GET /v1/appointments/{id}` | `scheduling.read` |
| | `POST /v1/appointments/{id}/cancel` | `scheduling.write` |
| | `GET /v1/professionals/{id}/appointments?from=&to=` | `scheduling.read` |
| PatientVault | `POST /v1/patients` | `vault.write` |
| | `GET /v1/patients/{patientRef}` | `vault.read` |
| | `PUT /v1/patients/{patientRef}` (exige `If-Match`) | `vault.write` |
| | `POST /v1/patients/lookup` (por CPF via blind index) | `vault.read` |
| | `GET /v1/patients/{patientRef}/contact` | `vault.contact.read` (token de serviço) |
| | `POST /v1/keys/rotation` | `vault.keys` |
| | `POST /v1/keys/maintenance?batchSize=` | `vault.keys` |
| | `DELETE /v1/keys/{version}` | `vault.keys` |
| Consent | `PUT /v1/patients/{patientRef}/consents/{purpose}` | `consent.write` |
| | `POST /v1/patients/{patientRef}/consents/{purpose}/revoke` | `consent.write` |
| | `GET /v1/patients/{patientRef}/consents` | `consent.read` |
| Audit | `GET /v1/audit/entries?resourceId=&after=&limit=` | `audit.read` |
| | `GET /v1/audit/verification` | `audit.read` |
| Notifications | `GET /v1/appointments/{id}/notifications` | `notifications.read` |
| | `GET /v1/settings`, `PUT /v1/settings` | `notifications.admin` |
| Triage | `POST /v1/triages` | `triage.submit` |
| | `GET /v1/triages/{id}` | `triage.read` ou `triage.review` |
| | `POST /v1/triages/{id}/review` (`confirm` ou `correct`) | `triage.review` |
| | `GET /v1/patients/{patientRef}/ai-consent` | `triage.read` ou `triage.review` |
| Rights | `POST /v1/subject-requests` | `rights.write` |
| | `GET /v1/subject-requests/{id}` | `rights.read` |
| | `POST /v1/subject-requests/{id}/identity-confirmation` | `rights.write` |
| | `POST /v1/subject-requests/{id}/download-links` | `rights.write` |
| | `POST /v1/downloads` | anônima, token no corpo, uso único |
| | `POST /v1/subject-requests/{id}/erasure-replay` | `rights.admin` |
| Todos (Demo) | `DELETE /v1/demo/clinic-data` (só com `Demo:PurgeEnabled`) | política de purga |
| Demo (borda) | `/demo/v1/*`, incluindo `/demo/v1/status` | sessão por token Bearer |

Finalidades de consentimento: `scheduling`, `notifications`, `ai-triage`. Estados de pedido do titular: `received`, `in-progress`, `completed`, `denied`. Prioridades da triagem: emergência, urgente, pouco urgente, não urgente.

## Eventos de integração

Exchange `careflow.events`, routing key = tipo. Clínica no cabeçalho `careflow-tenant-id`. Contratos em `src/BuildingBlocks/CareFlow.Contracts`.

| Evento | Publicado por | Consumido por |
|---|---|---|
| `patient.registered` | PatientVault | Scheduling |
| `consent.granted` | Consent | Scheduling, Notifications, Triage |
| `consent.revoked` | Consent | Scheduling (bloqueia e cancela futuras), Notifications, Triage |
| `appointment.booked` | Scheduling | Notifications (confirmação e lembrete) |
| `appointment.cancelled` | Scheduling | Notifications (aviso de cancelamento) |
| `audit.data-access` | todos com dado de paciente | Audit |
| `audit.content-disclosed` | Triage (SHA-256 do que saiu para o modelo) | Audit |
| `rights.subject-request-opened` | Rights | Vault, Scheduling, Consent, Notifications, Triage, Audit |
| `rights.subject-request-answered` | serviços acima | Rights |
| `rights.identity-verification-requested` | Rights (código cifrado) | Notifications |
| `rights.identity-verification-dispatched` | Notifications | Rights |
| `rights.erasure-reapplied` | Rights, após `erasure-replay` (restauração de backup) | Vault, Scheduling, Consent, Notifications, Triage |

## Categorias de retenção (`RetentionPolicy`)

`vault.personal-data`, `vault.cpf-index`, `vault.pseudonym`, `scheduling.future-appointments`, `scheduling.past-appointments`, `consent.history`, `notifications.pending`, `notifications.provider-reference`, `notifications.records`, `triage.text`, `triage.decision`, `audit.trail`. A versão da política vai no comprovante de eliminação.
