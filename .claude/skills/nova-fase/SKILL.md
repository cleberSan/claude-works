---
name: nova-fase
description: Conduz uma fase de projeto do Cleber (ex.: fase 10 do CareFlow) do prompt colado até os PRs no careflow e no site, com cards de decisão, ADR, post do diário e o prompt da fase seguinte.
---

# Nova fase

## Quando usar

O Cleber colou um `prompt-fase-N.md` ou pediu para começar uma fase do roadmap.

## Antes de começar

1. Leia `CLAUDE.md`, `projetos/careflow/README.md`, `projetos/careflow/fases.md` e o ADR mais recente.
2. Releia os "Pontos herdados" do prompt e os riscos residuais dos ADRs anteriores.

## Passos

1. **Checklist** de progresso visível na thread.
2. **Fatos**: tudo que depende de terceiros (limites, licenças, preços) com fonte e data. Arquivo `/mnt/project-files/portfolio/fase-N-decisoes.md` a partir de `templates/decisoes-fase.md`.
3. **Cards** só para decisões do Cleber (custo, licença, escopo, biblioteca, consistência), cada um com opção recomendada e consequência. Siga na recomendada no que for reversível.
4. **Branch** com o mesmo nome no careflow e no portfolio-web.
5. **careflow**: código em fatias verticais, testes (unidade, integração, E2E, concorrência, outra clínica, PII em telemetria), ADR (`templates/adr.md`), README (roadmap e tabela de rotas), CONTRIBUTING se mudou o setup local.
6. **Verificar** como o CI: format, build, testes com cobertura 80%; revisão de segurança e Staff (agentes `guardiao-seguranca` e `revisor-staff` se o Cleber pediu agentes).
7. **PR do careflow** em rascunho (template Antes/Depois/Como/Checklist), Cleber como assignee.
8. **portfolio-web**: post do diário (`templates/post-diario.mdx`), entrada em `posts.ts`, status em `careflowPhases`, links para o ADR. PR do site **entra depois** do careflow.
9. **Fechar**: skill `kb-atualizar`; `prompt-fase-(N+1).md` a partir de `templates/prompt-fase.md`.

## Regras

- Só dados sintéticos; nenhuma promessa clínica ou jurídica.
- Hospedagem e serviços só grátis, sem risco de cobrança.
- Nunca pedir chave ou senha no chat; passos de console viram passo a passo para o Cleber.
- Merge é do Cleber.
