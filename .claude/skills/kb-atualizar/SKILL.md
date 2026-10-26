---
name: kb-atualizar
description: Atualiza a base claude-works do Cleber depois de uma entrega, decisão ou lição - fato no arquivo certo, índice, validação e PR. Use ao fim de cada fase ou PR relevante e quando ele pedir para registrar algo.
---

# Atualizar a base claude-works

## Quando usar

- Fase concluída, PR mesclado que muda estado, rota, evento ou convenção.
- Card respondido pelo Cleber (decisão nova).
- Algo custou tempo e não pode se repetir (lição).
- O Cleber pede "registre isso" ou "atualize a base".

## Onde cada fato vai

| Fato | Arquivo |
|---|---|
| Estado, PRs, pendências de um projeto | `projetos/<projeto>.md` ou `projetos/careflow/*.md` |
| Decisão do Cleber (data, opção, porquê, registro) | `memorias/decisoes.md`, tabela do projeto |
| Convenção de trabalho nova | `memorias/convencoes-de-trabalho.md` |
| Lição técnica (sintoma, causa, o que fazer) | `memorias/licoes-aprendidas.md` |
| Armadilha do container | `memorias/ambiente-cloud.md` |
| Rota, escopo, evento | `apis/careflow.md` (ou novo arquivo em `apis/`) |
| Padrão de código reutilizável | `snippets/<stack>/` |
| Workflow reutilizável | `pipelines/` |
| Tecnologia ou serviço | `stacks/` |

## Passos

1. Leia `CLAUDE.md` e `INDICE.md`; abra só os arquivos da tabela acima que mudam.
2. Edite o fato no lugar (não reescreva o arquivo); prefira link para o ADR a copiar texto.
3. Atualize `atualizado:` de cada arquivo tocado. Arquivo novo: `npm run modelo -- templates/arquivo-da-base.md <destino> TITULO=... RESUMO=... DATA=AAAA-MM-DD`.
4. `npm run indice` (regera `INDICE.md`), depois `npm run validar && npm test`.
5. Branch, commit `docs(kb): <o que mudou>`, PR com o template; Cleber como assignee.

## Regras

- O repositório é **público**. Nunca: segredo, chave, OCID, e-mail, telefone ou endereço de pessoa ou loja, CPF, busca de emprego, incidente com credencial, dado de cliente. Na dúvida, deixe de fora e pergunte.
- Fato com data; estado que muda rápido (CI, deploy) com a data da observação.
- Arquivo até 16 KB; passou, divida e atualize o índice.
- Fato privado mas útil vai para a memória do projeto, não para cá.
