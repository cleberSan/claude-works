<!-- resumo: Modelo de tarefas (SDD) para docs/specs/NNNN-titulo/tarefas.md - lista ordenada, uma tarefa por commit, cada uma com prova e critérios cobertos. Variáveis NUMERO, TITULO. -->
# Tarefas {{NUMERO}}: {{TITULO}}

Spec: [spec.md](spec.md) · Plano: [plano.md](plano.md)

<!-- Regras:
     - Em ordem de execução; cada tarefa cabe num commit e deixa o build verde.
     - Teste junto ou antes do código; a prova é um teste ou comando que outra pessoa roda.
     - Marque [x] no commit que conclui a tarefa.
     - Tarefa nova no caminho entra aqui antes de ser feita; se mudar o escopo, a spec muda primeiro. -->

- [ ] **T01** <!-- verbo + o quê --> — arquivos: <!-- caminhos --> — prova: <!-- teste ou comando --> — cobre: CA-01
- [ ] **T02** <!-- ... -->
- [ ] **T03** Documentação: README, ADR, CONTRIBUTING se mudou o setup local
- [ ] **T04** Fechar: todo critério com teste (`grep -rn "spec {{NUMERO}} CA-"`), CI verde, spec com status `implementada`
