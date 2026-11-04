---
resumo: ADR-0002 da base - pedido novo segue Spec-Driven Development (spec, plano, tarefas, código) em docs/specs dos repositórios, em três níveis, com modelos e skill próprios e sem ferramenta nova.
atualizado: 2026-11-04
---

# ADR-0002: Especificar antes de implementar (Spec-Driven Development)

- Status: aceito
- Data: 2026-11-04

## Contexto

Hoje um pedido anda assim: o Cleber escreve no chat do projeto, uma thread levanta fatos, manda cards e implementa; o resultado aparece no PR. O porquê das decisões de arquitetura fica nos ADRs, mas o **o quê** de cada mudança (comportamento esperado, fora de escopo, critério de pronto) fica espalhado entre o chat, o `prompt-fase-N.md`, o `fase-N-decisoes.md` (fora do repositório) e a descrição do PR. O Cleber só vê o fluxo inteiro quando o código já está pronto, e quem lê o repositório depois não acha o requisito que um teste prova.

Em 2026-11-04 o Cleber pediu adotar Spec-Driven Development nas novas implementações, para o fluxo ser mapeado, criado e implementado como um todo e ele acompanhar melhor o que é feito.

Ferramentas conhecidas (consulta em 2026-11-04):

- **GitHub Spec Kit** ([repositório](https://github.com/github/spec-kit), [guia](https://codemyspec.com/blog/github-spec-kit-guide)): licença MIT; CLI `specify` em Python (uv ou pipx); comandos `/speckit.constitution`, `specify`, `plan`, `tasks`, `implement`, `clarify`, `analyze`; cria `.specify/` (constitution, scripts, modelos) e `specs/<feature>/` com `spec.md`, `plan.md`, `tasks.md`, `research.md`, `data-model.md` e `contracts/`. O próprio material diz que é experimental e que pesa em mudança pequena.
- **OpenSpec** ([repositório](https://github.com/Fission-AI/OpenSpec)): licença MIT; CLI npm `@fission-ai/openspec`; spec viva em `openspec/specs/` e cada mudança em `openspec/changes/<nome>/` (`proposal.md`, specs delta, `design.md`, `tasks.md`), arquivada depois do merge.
- **Kiro** ([conceitos](https://kiro.dev/docs/specs/concepts)): IDE próprio com `requirements.md` em notação EARS, `design.md` e `tasks.md`.

## Decisão

Processo completo em [memorias/spec-driven-development.md](../../memorias/spec-driven-development.md); passos para o Claude na skill [`sdd`](../../.claude/skills/sdd/SKILL.md).

- **Fluxo:** pedido → nível → spec (o quê e por quê) → plano (como) → tarefas → implementação por tarefa → PR que liga cada critério de aceite a um teste.
- **Três níveis, por gatilho objetivo:** *direto* (só PR: Dependabot, texto da loja, documentação, esta base, refatoração, bug com causa clara), *leve* (só `spec.md`, com plano e tarefas curtos) e *completo* (`spec.md`, `plano.md`, `tarefas.md`) quando há fase do roadmap, contrato público, dado pessoal ou segurança, mais de um repositório ou PR, dependência, custo ou licença, ou pergunta que muda o escopo.
- **Onde:** `docs/specs/NNNN-titulo/` no repositório da mudança principal, ao lado de `docs/adr/`; numa mudança em vários repositórios, a spec mora no do núcleo e os outros PRs linkam.
- **Critérios de aceite** com ID `CA-NN`, em EARS em português (`QUANDO ... DEVE ...`), cada um verificável por teste; o teste carrega o comentário `spec NNNN CA-NN`.
- **Portão do Cleber só no nível completo** (decisão de Cleber em card, 2026-11-04, entre esperar só no completo, nunca esperar ou esperar sempre): a thread abre o PR em rascunho com spec e plano e só implementa depois do OK dele; enquanto espera, adianta pesquisa e o esqueleto dos testes. No leve, segue direto e ele revisa no PR. Perguntas `[A DECIDIR]` viram cards.
- **Spec por mudança, não documento vivo:** `rascunho` → `aprovada` → `implementada`; depois disso só o status muda, e comportamento novo ganha spec nova. O comportamento atual está no código, nos testes e no README.
- **Encaixe:** ADR continua para decisão; `prompt-fase-N.md` vira a entrada da spec; `fase-N-decisoes.md` fica opcional, só para contexto que não pode ir a repositório público; o template de PR ganha a linha "Spec" e o item de critérios cobertos.
- **Sem ferramenta nova:** modelos `templates/spec.md`, `plano.md`, `tarefas.md` e `specs-readme.md`, gerados com `npm run modelo`; o `iniciar-repositorio` já cria `docs/specs/README.md`.
- **Nos repositórios:** careflow ADR-0015, portfolio-web ADR-0008 e lojinha-da-lua ADR-0011 registram a adoção em cada um.

## Alternativas

- **GitHub Spec Kit:** MIT, mas traz um CLI Python e cerca de uma dúzia de arquivos por repositório, modelos em inglês e uma "constitution" que duplica o CLAUDE.md e os ADRs; sendo experimental, cada release vira atualização a revisar. Reabre se os comandos prontos fizerem falta.
- **OpenSpec:** MIT e em Node, e a spec viva é boa para produto com muitas mãos; aqui dobraria a manutenção (atualizar a spec viva a cada mudança) para um dono só.
- **Kiro:** exige outro IDE; o fluxo do ecossistema é o Claude Code.
- **Spec só na descrição do PR:** chega junto com o código, sem portão antes, e não fica no repositório (mesmo motivo do ADR-0000).
- **Nível completo para tudo:** a spec ficaria maior que a mudança em Dependabot, texto ou bug simples; o próprio material do Spec Kit desaconselha.
- **Modelos copiados em cada repositório:** autocontido, mas quatro cópias divergindo. O `docs/specs/README.md` de cada repositório resume o processo e linka os modelos desta base.

## Consequências

- O Cleber vê e aprova o comportamento antes do código nas mudanças grandes; o PR fica mais fácil de revisar com a tabela critério → teste.
- Custo de escrita a cada pedido com spec, menor no nível leve; o nível direto não muda nada.
- **Risco de burocracia:** gatilhos objetivos e o Cleber pode mudar o nível no pedido. Se depois das primeiras cinco specs o custo superar o ganho, este ADR reabre.
- **Risco de spec e código divergirem:** a spec muda antes do código no mesmo branch, o `revisor-staff` confere, e o status só vira `implementada` com todos os critérios testados.
- **Numeração concorrente** entre threads aparece como conflito de pasta no PR; renumera-se antes do merge.
- **Conteúdo público:** o validador desta base não roda nos repositórios dos projetos; a revisão do PR confere as regras de conteúdo da spec.
- Fica para depois: conferir por script que todo `CA-NN` tem teste, se a disciplina do comentário falhar.
