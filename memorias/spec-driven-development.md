---
resumo: Spec-Driven Development no ecossistema - quando vale (direto, leve, completo), spec, plano e tarefas em docs/specs, critérios de aceite CA-NN, portão do Cleber e rastreio até o teste.
atualizado: 2026-11-09
---

# Spec-Driven Development (SDD)

Pedido novo de implementação segue **spec → plano → tarefas → código**, com os artefatos versionados no repositório da mudança. Decisão e alternativas: [ADR-0002](../docs/adr/0002-spec-driven-development.md). Passo a passo para o Claude: skill [`sdd`](../.claude/skills/sdd/SKILL.md).

## Níveis

Classifique pelo gatilho, não pelo tamanho percebido. O Cleber pode mudar o nível no pedido ("sem spec", "spec completa").

| Nível | Quando | Artefatos | Portão |
|---|---|---|---|
| **Direto** | Dependabot, texto ou preço vindo da loja, documentação, atualização desta base, refatoração sem mudança de comportamento, bug com causa clara (o teste de regressão é a spec; skill `investigar-bug`) | Só o PR | Revisão do PR |
| **Leve** | Comportamento novo ou alterado, pequeno, num repositório só, sem nenhum gatilho do completo | `spec.md` com a seção curta de plano e tarefas | Revisão do PR |
| **Completo** | Qualquer gatilho abaixo | `spec.md`, `plano.md`, `tarefas.md` | OK do Cleber na spec antes de implementar |

Gatilhos do completo:

- fase do roadmap;
- contrato público novo ou alterado: rota, escopo, evento, schema, migration, URL pública;
- dado pessoal, autorização, isolamento por clínica, LGPD, CSP ou cabeçalhos de segurança;
- mais de um repositório ou mais de um PR;
- dependência, serviço externo, custo ou licença;
- pergunta aberta que muda o escopo.

## Onde fica

- `docs/specs/NNNN-titulo-em-kebab-case/` no repositório da mudança principal, ao lado de `docs/adr/`. Número com 4 dígitos, o próximo livre, nunca reaproveitado.
- Mudança em mais de um repositório: a spec mora no do núcleo (numa fase, o careflow) e o PR do outro linka para ela.
- Modelos só nesta base: `npm run modelo -- spec|plano|tarefas <destino> ...` ([templates](../templates)).
- Repositório público: spec segue as regras de conteúdo do [CLAUDE.md](../CLAUDE.md) (sem segredo, dado pessoal, conta de nuvem, contato). Contexto privado fica na memória do projeto.

## Artefatos

| Arquivo | Responde | Não entra |
|---|---|---|
| `spec.md` | O quê e por quê: problema, objetivo, fora de escopo, critérios de aceite, não funcionais, perguntas abertas | Nome de classe, tabela, biblioteca |
| `plano.md` | Como: contexto técnico, fatos com fonte e data, desenho, contratos e dados, segurança, observabilidade, teste por critério, riscos e rollback, ADRs que nascem | Requisito novo (volta para a spec) |
| `tarefas.md` | Em que ordem: uma tarefa por commit, com prova e critérios cobertos | Tarefa sem prova verificável |

### Critérios de aceite

- ID `CA-NN`, um comportamento por critério, verificável por teste automatizado.
- Notação EARS em português:
  - `QUANDO <gatilho>, <sistema> DEVE <resposta>.`
  - `SE <condição indesejada>, ENTÃO <sistema> DEVE <resposta>.`
  - `ENQUANTO <estado>, <sistema> DEVE <resposta>.`
  - `<sistema> DEVE <regra sempre válida>.`
- Cubra caminho feliz, erro, limite e acesso indevido (outra clínica, sem escopo). Meta numérica nos não funcionais ("p95 abaixo de 300 ms com 50 usuários"), nunca "rápido".
- Pergunta sem resposta fica marcada `[A DECIDIR]` com opções e a recomendada; vira card.

### Status da spec

`rascunho` → `aprovada` (data do OK) → `implementada` (no PR que conclui). Também `abandonada` ou `substituída pela spec NNNN`.

Spec é **por mudança**, como o ADR: depois de implementada só o status muda. Comportamento novo ganha spec nova que cita a anterior. O comportamento atual está no código, nos testes e no README.

## Ciclo

1. **Classificar** e dizer o nível na primeira resposta da thread.
2. **Spec** e cards das perguntas `[A DECIDIR]` que são decisão do Cleber.
3. **Plano e tarefas** (completo).
4. **Consistência**: numa passada, sem relatório, todo critério tem teste no plano e tarefa; nada do plano ou das tarefas fica fora da spec; todo `[A DECIDIR]` virou card. No completo, antes do portão; no leve, antes de implementar. Ideia adaptada do `/speckit-analyze` ([ADR-0003](../docs/adr/0003-ferramentas-de-terceiros-para-o-claude.md)).
5. **Portão** (completo): branch com spec e plano, PR em rascunho, pedido de OK com o link. Enquanto espera, a thread adianta pesquisa e o esqueleto dos testes dos critérios, nada que dependa de pergunta aberta.
6. **Implementar** na ordem das tarefas, uma por commit, marcando `[x]`. O checklist de progresso da thread espelha `tarefas.md`.
7. **Mudou no caminho?** A spec muda primeiro, no mesmo branch; mudança de escopo vira card. Spec e código nunca divergem no merge.
8. **Fechar**: todo critério com teste, CI verde, status `implementada`, PR com a tabela critério → teste.

## Rastreio até o teste

- O teste que prova um critério leva o comentário `spec NNNN CA-NN` logo acima (C# e TypeScript igual). Conferência: `grep -rn "spec 0003 CA-" tests/ src/ e2e/`.
- O PR mostra a tabela critério → teste na seção Testes; o `revisor-staff` confere critério sem teste e código fora da spec.

## Como se encaixa no que já existe

| Artefato | Papel com SDD |
|---|---|
| ADR | Continua para decisão (por que A e não B), imutável. A spec cita os ADRs que a restringem; o plano diz quais nascem |
| `prompt-fase-N.md` | Entrada da spec da fase |
| `fase-N-decisoes.md` | Opcional: só contexto que não pode ir para repositório público |
| Template de PR | Linha "Spec" e item de checklist sobre critérios cobertos |
| `checklist-api.md`, `checklist-site.md` | Usados ao escrever o plano |
| Cards | Perguntas `[A DECIDIR]` que são decisão do Cleber |

## Exemplo (hipotético)

Pedido: limitar requisições na reserva de consultas (pendência das fases 0 a 2). Gatilho: contrato público (resposta 429) → **completo**, spec no careflow.

- **CA-01:** QUANDO um cliente passar de N reservas por minuto, a API de agenda DEVE responder 429 com ProblemDetails e o cabeçalho `Retry-After`.
- **CA-02:** SE o limite for atingido por uma clínica, ENTÃO as outras clínicas DEVEM continuar atendidas normalmente.
- **CA-03:** QUANDO o limite rejeitar uma requisição, o serviço DEVE incrementar uma métrica de rejeição por rota, sem dado pessoal.
- Plano: limitador nativo do ASP.NET Core por clínica; teste de integração por critério; ADR só se a escolha da chave de partição for decisão nova.
