---
resumo: Fluxo de uma fase de projeto com agentes - pesquisa, spec aprovada, cards, implementação no careflow, QA, segurança, revisão, PR do site, conteúdo e atualização da base.
atualizado: 2026-11-04
---

# Fluxo: fase de projeto

Entrada: `prompt-fase-N.md` colado pelo Cleber. Saída: PR no careflow, PR no portfolio-web, base atualizada, `prompt-fase-(N+1).md`. Skill equivalente: `nova-fase`.

```mermaid
flowchart TD
  P[prompt-fase-N] --> F[pesquisador-fatos]
  F --> SP[spec, plano e tarefas]
  SP --> D{decisão do Cleber?}
  D -- sim --> C[cards com opção recomendada] --> OK
  D -- não --> OK{OK do Cleber na spec}
  OK --> I[implementador: careflow]
  I --> Q[qa-destrutivo]
  Q -->|achados| I
  Q --> G[guardiao-seguranca]
  G -->|bloqueia| I
  G --> R[revisor-staff]
  R -->|ajustes| I
  R --> PR1[PR careflow + CI verde]
  PR1 --> S[implementador: portfolio-web + redator-tecnico]
  S --> PR2[PR site, entra depois do careflow]
  PR2 --> K[curador-kb + prompt da próxima fase]
```

## Passos

1. **Ler**: `CLAUDE.md`, `memorias/spec-driven-development.md`, `projetos/careflow/README.md`, `projetos/careflow/fases.md`, o ADR da fase anterior.
2. **Pesquisar** (`pesquisador-fatos`): cada ponto do prompt que depende de fato externo, com fonte e data no `plano.md`.
3. **Especificar** (skill `sdd`, nível completo): `spec.md`, `plano.md` e `tarefas.md` em `careflow/docs/specs/`; PR em rascunho com spec e plano.
4. **Cards**: só o que é decisão do Cleber, com opção recomendada. Seguir na recomendada no que for reversível; código só depois do OK na spec.
5. **Implementar** (`implementador`) no careflow na ordem de `tarefas.md`: domínio e testes, endpoints, eventos, observabilidade, ADR, README.
6. **Quebrar** (`qa-destrutivo`) e **proteger** (`guardiao-seguranca`); voltar ao implementador até não haver achado bloqueante.
7. **Revisar** (`revisor-staff`, inclusive aderência à spec); corrigir; CI verde com cobertura ≥ 80%.
8. **PR do careflow** com a tabela critério → teste e a spec `implementada`, Cleber como assignee.
9. **Site** (`implementador` + `redator-tecnico`): post do diário, `careflowPhases`, links para o ADR. PR do site só entra depois do careflow.
10. **Fechar** (`curador-kb`): `projetos/careflow/*`, `memorias/decisoes.md`, lições; escrever `prompt-fase-(N+1).md` ([modelo](../templates/prompt-fase.md)).

## Parada

- Card sem resposta ou spec sem OK e o próximo passo depende disso: entregar o que não depende e esperar.
- Dois ciclos sem CI verde: relatar a falha com a saída e a hipótese.
