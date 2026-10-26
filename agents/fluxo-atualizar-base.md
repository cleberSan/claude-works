---
resumo: Fluxo para manter esta base atualizada depois de PRs mesclados, decisões e lições, inclusive como rotina agendada.
atualizado: 2026-10-26
---

# Fluxo: atualizar a base

Entrada: PRs mesclados, decisões ou lições desde a última atualização. Saída: PR no claude-works. Skill equivalente: `kb-atualizar`.

## Passos

1. Listar o que mudou: PRs mesclados nos três repositórios (título, número, data), cards respondidos, lições.
2. `curador-kb`:
   - estado e histórico no cartão do projeto (`projetos/`);
   - decisão nova no fim da tabela certa de `memorias/decisoes.md`;
   - rotas e eventos em `apis/careflow.md`;
   - lição em `memorias/licoes-aprendidas.md`;
   - versão de pacote só quando mudar algo relevante para quem lê.
3. `npm run indice && npm run validar && npm test`.
4. PR `docs(kb): ...`; o Cleber revisa.

## Como rotina

Prompt sugerido para uma rotina semanal do Claude Code: "No claude-works, siga agents/fluxo-atualizar-base.md para o que foi mesclado nos repositórios careflow, portfolio-web e lojinha-da-lua nos últimos 7 dias; abra um PR se houver mudança." Criar a rotina é decisão do Cleber.
