---
resumo: Scripts da base (validar, indice, tokens, modelo, iniciar-repositorio, ambiente-cloud) e módulos de utils/ - uso, opções, códigos de saída e como estender.
atualizado: 2026-10-26
---

# Scripts e utils

Node 24 sem dependências (só `node:*`), ESM, testes com `node:test` e cobertura mínima de 80% ([ADR-0001](../docs/adr/0001-base-em-camadas-e-publica.md)). Todo script exporta `main(args, contexto)` e devolve o código de saída, para os testes rodarem sem subprocesso.

## Comandos

| Comando | O que faz | Saída |
|---|---|---|
| `npm run validar` | Confere a base inteira (regras abaixo) | 0 ok, 1 problema, 2 uso errado |
| `npm run indice` | Regera o [INDICE.md](../INDICE.md) a partir dos resumos | 0; `-- --verificar` sai 1 se estiver velho |
| `npm run tokens` | Tokens estimados por seção, mais pesados e leitura mínima | `-- --top 5`, `-- --pasta projetos/careflow/` |
| `npm run modelo -- <modelo> <destino> CHAVE=valor` | Gera arquivo a partir de `templates/`, sem sobrescrever | `-- --listar` mostra modelos e variáveis |
| `npm run iniciar-repositorio -- --destino <pasta> --stack dotnet\|node --nome <repo>` | Padrão do ecossistema num clone novo | `--simular` só mostra o plano |
| `npm test` | Testes com cobertura (linhas, ramos e funções ≥ 80%) | |
| `scripts/ambiente-cloud.sh <comando>` | Container do Claude Code: `verificar`, `dotnet`, `docker`, `imagem <nome:tag>`, `playwright` | |

Caminhos de destino (`modelo`, `iniciar-repositorio`) são relativos à pasta de onde o `npm` foi chamado (`INIT_CWD`), não à raiz da base. Exemplo de ADR direto no careflow:

```bash
npm run modelo -- adr ../careflow/docs/adr/0014-testes-de-carga.md NUMERO=0014 TITULO="Testes de carga" DATA=2026-11-02
```

## Regras do validador

| Regra | Vale para | Erro quando |
|---|---|---|
| `resumo` | arquivos do índice | falta resumo ou passa de 250 caracteres |
| `front-matter` | arquivos de conteúdo | falta front matter ou há linha inválida |
| `atualizado` | arquivos de conteúdo | data ausente, inválida ou no futuro |
| `modelo` | `templates/` | variáveis `{{X}}` diferentes das declaradas em "Variáveis A, B." no resumo |
| `skill`, `subagente` | `.claude/skills/*/SKILL.md`, `.claude/agents/*.md` | `name` diferente da pasta ou arquivo, fora do formato, ou sem `description` |
| `tamanho` | arquivos do índice | acima de 16 KB |
| `link` | todo `.md` e `.mdx` (menos modelos) | link local para arquivo ou pasta que não existe, ou para fora do repositório |
| `dado-sensivel` | todo arquivo de texto | chave de API, token do GitHub, chave AWS ou Google, chave privada, OCID, senha literal, e-mail, celular, CPF |
| `indice` | `INDICE.md` | ausente ou diferente do gerado |

No GitHub Actions cada problema vira anotação `::error` no arquivo e linha do PR. O trecho encontrado sai mascarado (o log não repete o segredo).

Quem entra no índice: `.md` das pastas do mapa, `templates/*.md(x)`, `pipelines/*.yml`, `SKILL.md` e subagentes. Raiz, `tests/`, `utils/`, código dos scripts e `.github/` ficam fora.

### Exceções aceitas

- E-mail de domínio de exemplo (`example.com`, `exemplo.*`, `.test`, `.invalid`), `noreply@` e `users.noreply.github.com`.
- Senha com valor de exemplo ou referência: `${{ secrets.X }}`, `{{X}}`, `<senha>`, `process.env.X`, `***`.
- Nos testes, o dado falso é montado em tempo de execução (`"sk-" + "ant-" + ...`) para o próprio repositório passar na varredura.

## utils/

| Módulo | Exporta |
|---|---|
| `frontmatter.mjs` | `parseFrontMatter`, `extractSummary`, `isValidDate` (subconjunto de YAML: `chave: valor` e listas) |
| `markdown.mjs` | `extractLinks` (ignora código e comentários), `isLocalLink`, `resolveLink` |
| `files.mjs` | `listFiles` (ordem estável, ignora `.git`, `node_modules`, `coverage`), `isTextFile` |
| `sensitive.mjs` | `SENSITIVE_PATTERNS`, `findSensitiveData`, `maskMatch` |
| `kb-index.mjs` | `SECTIONS`, `classifyFile`, `buildIndex`, `estimateTokens`, `formatTokens` |
| `templates.mjs` | `findPlaceholders`, `renderTemplate`, `stripTemplateHeader`, `parseAssignments`, `selectDependabotEcosystems`, `setCodeqlLanguages` |
| `validation.mjs` | `loadRepository`, `collectIndexEntries`, `validateRepository`, `formatProblem` |
| `cli.mjs` | `parseOptions`, `isMain`, `todayIso`, `consoleOutput`, `REPOSITORY_ROOT` |

## Estender

- **Padrão sensível novo:** acrescente em `SENSITIVE_PATTERNS` com `id`, `description`, `pattern` (flag `g`) e, se preciso, `allow`. Teste o positivo (montado em tempo de execução) e um falso positivo conhecido.
- **Seção nova da base:** acrescente em `SECTIONS` (ordem do mapa do CLAUDE.md), atualize o mapa e rode `npm run indice`.
- **Script novo:** exporte `main(args, contexto)`, use `parseOptions` (opção desconhecida é erro), escreva com `flag: "wx"` quando não puder sobrescrever, e teste pelo `main`.
- Identificadores em inglês; comentários e mensagens em português.
