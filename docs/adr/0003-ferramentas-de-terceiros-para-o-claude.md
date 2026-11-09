---
resumo: ADR-0003 da base - spec-kit, claude-mem e ECC avaliados para economizar tokens e recusados como ferramenta; três ideias adaptadas com texto próprio, skill até 4 KB e regra para plugin ou hook de terceiro.
atualizado: 2026-11-09
---

# ADR-0003: Ferramentas de terceiros para o Claude (spec-kit, claude-mem, ECC)

- Status: aceito
- Data: 2026-11-09

## Contexto

Em 2026-11-09 o Cleber pediu para adicionar três projetos ao processo para economizar tokens: spec-kit, claude-mem e "everything claude code". O trabalho roda em threads do Claude Code na nuvem: cada thread nasce num contêiner novo, clonado dos repositórios, e o contêiner é descartado depois. A memória entre threads é a memória do projeto (privada) mais esta base.

Código lido em 2026-11-09, sem executar nada, nos commits citados. Tamanhos medidos com `wc -c`; tokens estimados a 4 caracteres por token.

- **GitHub Spec Kit** ([github/spec-kit](https://github.com/github/spec-kit), commit `a60bd9b`): MIT, v1.3.2 (a 1.0 saiu em outubro de 2026). CLI Python `specify`; no Claude Code instala 9 skills `speckit-*` em `.claude/skills` e a pasta `.specify/` em cada repositório; o núcleo não instala hook. Os prompts do ciclo do README (specify, plan, tasks, implement, converge) somam 64 KB (~16 mil tokens); os 9 comandos, 150 KB. O próprio integrador com o Claude registra que `/speckit-analyze` devolve 300 a 500 linhas para a conversa e já travou sessões longas.
- **claude-mem** ([thedotmack/claude-mem](https://github.com/thedotmack/claude-mem), commit `989a98a`): Apache-2.0, v15.13.0. Plugin com hooks em 9 eventos (inclusive antes e depois de toda ferramenta), serviço local em Bun e servidor MCP. Um segundo agente "observador" (padrão: Claude Haiku no plano do usuário) resume cada chamada de ferramenta; tudo vai para `~/.claude-mem` (SQLite e Chroma), inclusive capturas de tela por padrão. Telemetria anônima ligada por padrão; login e sync em nuvem opcionais; o teste de 30 dias do observador pago pede forma de pagamento.
- **ECC** ([affaan-m/ECC](https://github.com/affaan-m/ECC), commit `d2ef268`, antigo everything-claude-code): MIT, v2.2.3. Plugin com 314 skills, 71 agentes, 98 comandos, regras por linguagem e 27 hooks. Nome e descrição das skills somam 102 KB (~25 mil tokens), listados em toda sessão. No perfil padrão, um hook nega a primeira edição de cada arquivo e outro grava observações para um observador opcional (`claude --model haiku`). Existem cópias com o mesmo nome (por exemplo `WorldFlowAI/everything-claude-code`, sem licença); o próprio ECC pede instalar só das fontes oficiais.
- **Fluxo atual:** a skill [`sdd`](../../.claude/skills/sdd/SKILL.md), a memória do processo e os modelos de spec, plano e tarefas somam 14 KB (~3,6 mil tokens). Nenhum repositório tinha spec escrita até 2026-11-09, então o gatilho de reabertura do [ADR-0002](0002-spec-driven-development.md) não ocorreu.
- **Nesta base:** as skills de `.claude/skills` não aparecem como skills carregadas nas threads; a thread lê o `SKILL.md` como arquivo, guiada pelo [CLAUDE.md](../../CLAUDE.md). Skill que carrega em toda sessão é a da conta do Cleber, salva nas configurações do claude.ai.

A análise completa, com riscos e fontes, foi entregue ao Cleber na thread do projeto em 2026-11-09.

## Decisão

Decisão de Cleber em card, 2026-11-09, entre recusar e adaptar (recomendada), adotar o spec-kit, testar o ECC mínimo no PC dele e não mudar nada.

- **Nenhum dos três é instalado** nos repositórios, nas threads ou no ambiente da nuvem. O spec-kit continua recusado pelos motivos do ADR-0002; o claude-mem e o ECC, pelos motivos em Alternativas.
- **Três ideias adaptadas com texto próprio**, sem copiar código ou prompt (logo, sem obrigação de licença):
  - passo **Consistência** na skill `sdd` e no [processo SDD](../../memorias/spec-driven-development.md), antes do portão, inspirado no `/speckit-analyze`: checagem curta, sem relatório;
  - regra **não afrouxar lint, formatação, cobertura ou CI para o PR passar**, inspirada no hook `config-protection` do ECC, em [convencoes-de-trabalho.md](../../memorias/convencoes-de-trabalho.md);
  - [memorias/economia-de-tokens.md](../../memorias/economia-de-tokens.md), inspirado no guia de tokens e na skill `context-budget` do ECC, com o que economiza no nosso ambiente; o passo 2 do CLAUDE.md passa a procurar o assunto no INDICE.md com `grep`.
- **Skill e subagente até 4 KB**, conferido pelo validador (regra `tamanho`), porque entram inteiros no contexto quando acionados.
- **Regra para o futuro:** ferramenta de terceiro que roda sozinha para o Claude (plugin, hook, servidor MCP, observador em segundo plano) só entra com ADR que mostre licença, o que grava, para onde manda dados, custo e ganho medido em tokens.

## Alternativas

- **Adotar o spec-kit no lugar da skill `sdd`:** mesmo fluxo com cerca de 4 vezes mais instrução por mudança, sem níveis, modelos em inglês e uma constitution que duplica o CLAUDE.md e os ADRs; cerca de 12 arquivos por repositório, vezes três, com upgrade a cada release. Sair da fase experimental enfraquece só um dos motivos do ADR-0002.
- **claude-mem:** a memória fica em `~/.claude-mem`, que some com o contêiner da thread; mantê-la exigiria sync com serviço de terceiro. Grava toda leitura e saída de comando (segredo lido entra junto; a única barreira é marcar `<private>` à mão), paga um segundo agente por chamada de ferramenta e o modo pago pede cartão, contra a regra de custo zero. Duplica a memória do projeto e o índice desta base.
- **ECC inteiro:** ~25 mil tokens fixos de descrição de skill por sessão; 27 hooks de terceiro rodando a cada ferramenta e mudando a cada atualização sem PR nosso; regras e agentes que competem com o CLAUDE.md, o ADR-0001 do careflow e os subagentes desta base; o portão da primeira edição aumenta os turnos.
- **ECC mínimo só no PC do Cleber:** possível (instalação sem hooks), mas não chega às threads, onde o trabalho acontece. Fica a critério dele, fora dos repositórios.
- **Copiar skills do ECC para `.claude/skills`:** não ativaria nada nas threads, aumentaria a base e traria texto em inglês a manter com aviso de licença.

## Consequências

- Nada de terceiro roda nas threads e o custo fixo de contexto não cresce.
- O passo Consistência pega critério sem teste ou sem tarefa antes do pedido de OK, sem o relatório longo do spec-kit.
- O validador barra skill ou subagente acima de 4 KB (testes em `tests/validation.test.mjs`); detalhe vai para `memorias/`, com link.
- **Risco:** a economia das práticas não é medida automaticamente. Se o custo das threads continuar alto, medir antes de trocar de ferramenta (por exemplo, o tamanho do contexto inicial de uma thread).
- **Reabre se:** uma das três passar a funcionar nas threads da nuvem sem hook de terceiro e com ganho medido, ou as primeiras cinco specs mostrarem falta dos comandos prontos do spec-kit (gatilho do ADR-0002).
