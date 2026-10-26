---
resumo: Fluxos de agentes autônomos do ecossistema - quais agentes existem, como se encadeiam, onde o humano aprova e quando parar.
atualizado: 2026-10-26
---

# Fluxos de agentes

Um **fluxo** encadeia agentes de responsabilidade única. A sessão principal é o **orquestrador**: dá a cada agente só a entrada que ele precisa, junta as saídas e decide o próximo passo. As definições ficam em [`.claude/agents/`](../.claude/agents), onde o Claude Code as carrega.

## Quando usar

- Quando o Cleber pedir execução com agentes ou automação (rotina agendada, `claude -p`, trabalho longo em paralelo).
- Numa thread comum, sem esse pedido, a própria sessão segue os mesmos passos sem abrir subagentes: os fluxos servem de roteiro.

## Agentes

| Agente | Responsabilidade | Escreve código? |
|---|---|---|
| `pesquisador-fatos` | Fatos externos com fonte e data (limites, licenças, preços) | Não |
| `implementador` | Código, testes, ADR e docs de um escopo fechado | Sim |
| `qa-destrutivo` | Testes que tentam quebrar a mudança | Só testes |
| `guardiao-seguranca` | Segurança, LGPD, segredos, licenças; pode bloquear | Não |
| `revisor-staff` | Revisão Staff: corretude, arquitetura, performance, observabilidade | Não |
| `redator-tecnico` | Post do diário, LinkedIn, respostas | Texto |
| `curador-kb` | Atualiza esta base depois da entrega | Base |

## Fluxos

| Fluxo | Quando |
|---|---|
| [fluxo-fase.md](fluxo-fase.md) | Fase nova de um projeto (ex.: fase 10 do CareFlow) |
| [fluxo-revisao-pr.md](fluxo-revisao-pr.md) | Antes de pedir revisão do Cleber, ou PR de terceiro |
| [fluxo-correcao-bug.md](fluxo-correcao-bug.md) | Bug em produção, CI vermelho, comportamento estranho |
| [fluxo-conteudo.md](fluxo-conteudo.md) | Post do diário, LinkedIn, resposta a comentário |
| [fluxo-atualizar-base.md](fluxo-atualizar-base.md) | Depois de PR mesclado, decisão ou lição nova |

## Regras de todo fluxo

1. **Portões humanos:** custo, licença, escopo, troca de biblioteca, passo irreversível e merge são do Cleber. O fluxo para, prepara um card com opção recomendada e segue no que não depende disso.
2. **Entrada mínima:** cada agente recebe o objetivo, os caminhos e a parte da base que importa, não o histórico inteiro.
3. **Saída estruturada:** cada agente devolve no formato da definição; o orquestrador não reinterpreta achados.
4. **Parada:** dois ciclos de correção sem CI verde, achado bloqueante de segurança sem solução clara, ou fato externo não confirmado → parar e relatar.
5. **Nada sai do repositório sem o Cleber:** sem publicar post, sem e-mail, sem mudar produção.
6. **Rastro:** decisões no `fase-N-decisoes.md` ou no PR; aprendizados no `curador-kb`.

## Execução autônoma

- **Rotina agendada** do Claude Code (claude.ai/code) com um prompt que cita o fluxo, por exemplo "siga agents/fluxo-atualizar-base.md para os PRs mesclados desde ontem".
- **Headless:** `claude -p "<pedido>"` num clone com este repositório; os subagentes de `.claude/agents/` ficam disponíveis.
- **GitHub Actions:** ação de terceiro fica fora pela regra de só actions oficiais; exceção é decisão do Cleber.
