---
name: sdd
description: Conduz um pedido novo de implementação do Cleber por Spec-Driven Development - classifica o nível (direto, leve, completo), escreve spec, plano e tarefas em docs/specs do repositório, pede o OK quando o nível exige, implementa por tarefa e liga cada critério de aceite a um teste.
---

# SDD: spec → plano → tarefas → código

## Quando usar

- Pedido novo de implementação, inclusive fase do roadmap (a skill `nova-fase` usa esta).
- Não use no nível direto: Dependabot, texto ou preço vindo da loja, documentação, atualização desta base, refatoração sem mudança de comportamento, bug com causa clara (este segue `investigar-bug`).

## Antes de começar

1. Leia `memorias/spec-driven-development.md` (níveis, gatilhos, regras) e o cartão do projeto em `projetos/`.
2. Liste `docs/specs/` e `docs/adr/` do repositório: próximo número livre e ADRs que restringem a mudança.

## Passos

1. **Nível:** classifique pelos gatilhos e diga na primeira resposta da thread ("Nível completo: muda contrato público"). O Cleber pode mudar.
2. **Spec:** `npm run modelo -- spec ../<repo>/docs/specs/NNNN-titulo/spec.md NUMERO=NNNN TITULO="..." DATA=AAAA-MM-DD NIVEL=leve` (ou `completo`). Preencha problema, objetivo, fora de escopo, critérios `CA-NN` em EARS (com erro, limite e acesso indevido), não funcionais com meta numérica e perguntas `[A DECIDIR]`.
3. **Cards:** cada `[A DECIDIR]` que é decisão do Cleber (escopo, custo, licença, biblioteca, consistência) vira card com opção recomendada.
4. **Plano e tarefas** (completo): modelos `plano` (`NUMERO`, `TITULO`, `DATA`) e `tarefas` (`NUMERO`, `TITULO`). Fatos externos com fonte e data, teste por critério, riscos e rollback, ADR quando houver decisão (`novo-adr`). Use `templates/checklist-api.md` ou `checklist-site.md`.
5. **Portão** (completo): commit `docs(spec): <título>`, push, PR em rascunho só com spec e plano, e uma mensagem ao Cleber com o link pedindo OK. Enquanto espera: pesquisa e esqueleto dos testes dos critérios, nada que dependa de pergunta aberta. No leve, siga direto.
6. **Aprovada:** status `aprovada` com a data do OK. Implemente na ordem de `tarefas.md`, uma tarefa por commit, marcando `[x]`. O checklist de progresso da thread espelha as tarefas.
7. **Testes:** cada critério tem ao menos um teste com o comentário `spec NNNN CA-NN` logo acima.
8. **Mudou no caminho:** a spec muda primeiro (commit `docs(spec)`), depois o código. Mudança de escopo vira card.
9. **Fechar:** `grep -rn "spec NNNN CA-"` nas pastas de teste cobre todos os critérios; CI verde; status `implementada`; PR com a linha "Spec" e a tabela critério → teste; skill `kb-atualizar` se mudou fato da base.

## Regras

- Spec diz o quê e por quê; plano diz como. Classe, tabela e biblioteca não entram na spec.
- Spec implementada não é reescrita, só muda o status; comportamento novo ganha spec nova que cita a anterior.
- Repositório público: nada de segredo, dado pessoal, conta de nuvem, e-mail ou telefone na spec.
- Merge é do Cleber; na lojinha-da-lua o Claude nunca faz merge.

## Saída

- `docs/specs/NNNN-titulo/` no PR, PR com link para a spec e a tabela critério → teste, checklist da thread fechado.
