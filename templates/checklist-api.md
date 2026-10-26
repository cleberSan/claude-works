<!-- resumo: Checklist para um serviço ou endpoint .NET novo - contrato, autorização, multi-tenant, erros, idempotência, dados, mensageria, observabilidade e testes. -->
# Checklist de API ou serviço novo

## Contrato
- [ ] Rota `/v1/...` no plural; ação não CRUD como sub-recurso `POST`
- [ ] Request validado na borda; tamanho de corpo limitado
- [ ] Resposta tipada (`Results<..., ProblemHttpResult>`), OpenAPI com `WithSummary`

## Autorização
- [ ] Escopo `<serviço>.<ação>` por rota; escrita não implica leitura
- [ ] Clínica da claim `tenant_id`; recurso de outra clínica responde 404
- [ ] Token de serviço curto quando outro serviço chama

## Erros
- [ ] `Result`/`Error` no handler; `ToProblem()` na borda com `code` estável `Contexto.Motivo`
- [ ] Mensagem sem dado pessoal

## Escrita
- [ ] Criação com `Idempotency-Key` + índice único + impressão digital do corpo
- [ ] Alteração com `If-Match`/ETag (412/428)
- [ ] Unicidade e não sobreposição garantidas no banco, traduzidas pelo nome da constraint

## Dados
- [ ] Tabela com `tenant_id` e `EnableTenantRowLevelSecurity` na migration
- [ ] Login da API sem dono; migrations com o dono; nada de superusuário
- [ ] Dado pessoal só no cofre; aqui só `patientRef`
- [ ] Consultas com projeção, `AsNoTracking` em leitura, índice para o filtro, paginação

## Mensageria
- [ ] Evento pelo Outbox na mesma transação; consumidor pelo Inbox
- [ ] Contrato versionado em `CareFlow.Contracts`; clínica no cabeçalho
- [ ] Consumidor idempotente e com caminho de DLQ

## Observabilidade e auditoria
- [ ] Span e métrica de negócio por resultado; `LoggerMessage` sem PII
- [ ] Leitura e alteração de dado de paciente geram `audit.data-access`
- [ ] Health: dependência crítica no `ready`, opcional como degradada

## Testes
- [ ] Unidade do domínio (feliz, erro, borda, inválido)
- [ ] Integração com Postgres real: autorização cross-tenant, idempotência, concorrência
- [ ] E2E se houver evento entre serviços; varredura de PII na telemetria
- [ ] Cobertura ≥ 80% no projeto de teste certo (`testconfig.json`)

## Documentação
- [ ] ADR se houve decisão; README do repositório (tabela de rotas); `.http` com exemplo sintético
- [ ] [apis/careflow.md](../apis/careflow.md) atualizado nesta base
