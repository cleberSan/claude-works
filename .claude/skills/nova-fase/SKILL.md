---
name: nova-fase
description: Conduz uma fase de projeto do Cleber (ex.: fase 10 do CareFlow) do prompt colado até os PRs no careflow e no site, com spec aprovada (SDD completo), cards de decisão, ADR, post do diário e o prompt da fase seguinte.
---

# Nova fase

## Quando usar

O Cleber colou um `prompt-fase-N.md` ou pediu para começar uma fase do roadmap.

## Antes de começar

1. Leia `CLAUDE.md`, `memorias/spec-driven-development.md`, `projetos/careflow/README.md`, `projetos/careflow/fases.md` e o ADR mais recente.
2. Releia os "Pontos herdados" do prompt e os riscos residuais dos ADRs anteriores.

## Passos

1. **Checklist** de progresso visível na thread.
2. **Spec da fase** (skill `sdd`, nível completo) em `careflow/docs/specs/NNNN-fase-N-titulo/`: o prompt colado é a entrada; o escopo vira critérios `CA-NN`.
3. **Fatos**: tudo que depende de terceiros (limites, licenças, preços) com fonte e data, no `plano.md`. `/mnt/project-files/portfolio/fase-N-decisoes.md` só para o que não pode ir a repositório público.
4. **Cards** só para decisões do Cleber (custo, licença, escopo, biblioteca, consistência), cada um com opção recomendada e consequência. Siga na recomendada no que for reversível.
5. **Branch** com o mesmo nome no careflow e no portfolio-web; PR do careflow em rascunho com spec e plano, e OK do Cleber antes de implementar.
6. **careflow**: na ordem de `tarefas.md`, código em fatias verticais, testes (unidade, integração, E2E, concorrência, outra clínica, PII em telemetria) com o comentário `spec NNNN CA-NN`, ADR (`templates/adr.md`), README (roadmap e tabela de rotas), CONTRIBUTING se mudou o setup local.
7. **Verificar** como o CI: format, build, testes com cobertura 80%; revisão de segurança e Staff (agentes `guardiao-seguranca` e `revisor-staff` se o Cleber pediu agentes).
8. **PR do careflow** (template Antes/Depois/Como/Checklist, linha Spec e tabela critério → teste), spec `implementada`, Cleber como assignee.
9. **portfolio-web**: post do diário (`templates/post-diario.mdx`), entrada em `posts.ts`, status em `careflowPhases`, links para o ADR e a spec. PR do site **entra depois** do careflow.
10. **Fechar**: skill `kb-atualizar`; `prompt-fase-(N+1).md` a partir de `templates/prompt-fase.md`.

## Regras

- Só dados sintéticos; nenhuma promessa clínica ou jurídica.
- Hospedagem e serviços só grátis, sem risco de cobrança.
- Nunca pedir chave ou senha no chat; passos de console viram passo a passo para o Cleber.
- Merge é do Cleber.
