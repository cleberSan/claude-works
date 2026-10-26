---
resumo: Glossário do ecossistema - termos de domínio, segurança, mensageria e operação usados nos projetos, com o nome no código.
atualizado: 2026-10-26
---

# Glossário

| Termo | Significado | No código ou na doc |
|---|---|---|
| ADR | Registro de decisão arquitetural | `docs/adr/NNNN-*.md` |
| Agenda | Serviço de consultas sem dupla reserva | `Scheduling` |
| Alarme | Sinal de gravidade por regra na queixa; só sobe a prioridade | Triage |
| Base legal | Fundamento LGPD do tratamento (consentimento, tutela da saúde) | Consent |
| Blind index | HMAC do CPF com chave da clínica para buscar sem guardar o CPF | PatientVault |
| BFF | Backend do Painel que fala com os serviços | `Demo` |
| Card | Pergunta de múltipla escolha ao Cleber com opção recomendada | threads do projeto |
| Clínica | Tenant do CareFlow | claim `tenant_id`, `app.tenant_id` |
| Cofre | Serviço que guarda dado pessoal cifrado | `PatientVault` |
| Crypto-shredding | Eliminar destruindo a chave (DEK) do paciente | Rights, PatientVault |
| DEK / KEK | Chave de dados / chave que embrulha chaves | envelope encryption |
| Despachante | Processo que publica o Outbox | `MessageRelay`, login `<svc>_dispatcher` |
| Diário de bordo | Posts por fase no site | `/diario`, `src/content/diario` |
| DLQ | Fila de mensagens mortas | `careflow.{serviço}` + dead letter |
| `erasure-replay` | Reaplicar eliminações depois de restaurar backup | `POST /v1/subject-requests/{id}/erasure-replay` |
| Exclusion constraint | Restrição GiST que impede intervalos sobrepostos | `ex_appointments_no_overlap` |
| Fatia vertical | Caso de uso com request, handler e endpoint juntos | `Features/` |
| FHIR R4 | Padrão de interoperabilidade de saúde | Bundle no pacote do titular |
| Gravação | Execução real registrada pelo CI e reproduzida no site | `panel-recording`, `gravacao.json`, cassetes da triagem |
| Idempotency-Key | Cabeçalho que torna a criação repetível | `IdempotencyKey`, `Idempotent-Replayed` |
| Ilha | Componente React hidratado só onde há interação | Astro `client:*` |
| Inbox | Registro de mensagens já processadas por consumidor | `inbox_messages` |
| Instance principal | Identidade da VM na OCI, sem credencial em disco | OCI Vault, Object Storage |
| Interruptor | Liga/desliga do Painel ao vivo sem redeploy | `Demo:Switch:Enabled` |
| Mascaramento | Troca de dado pessoal por marcador antes da IA | `ComplaintMasker` |
| Outbox | Eventos gravados na mesma transação do negócio | `outbox_messages`, `db.Enqueue` |
| Painel | Painel de Privacidade e Resiliência do site | `/projetos/careflow/painel` |
| `patientRef` | Pseudônimo do paciente fora do cofre | todos os serviços |
| Pedido do titular | Acesso, portabilidade ou eliminação (LGPD) | `Rights`, `/v1/subject-requests` |
| Projeção | Cópia local alimentada por eventos | `patient_statuses` na agenda |
| Replay | Modo do Painel que reproduz a gravação | site sem backend |
| RLS | Row-Level Security do PostgreSQL por clínica | política `tenant_isolation` |
| Robô | VM que tenta criar a A1 na Oracle | `careflow-cacador`, `a1-hunter.sh` |
| Sala de controle | Direção visual do site | tokens em `globals.css` |
| Token de serviço | JWT curto P-256 entre serviços | `ServiceTokens`, `vault.contact.read` |
| Triagem | Sugestão de prioridade com IA e revisão humana | `Triage`, `/v1/triages` |
