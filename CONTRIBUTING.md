# Contribuindo

Esta base muda junto com os projetos: fase entregue, decisão tomada, lição aprendida. Quem escreve na maior parte das vezes é o Claude, numa thread ou sessão, e quem revisa é o Cleber.

## Requisitos

- Node 24 (o CI usa o `.nvmrc`); funciona a partir do 22.12. Nenhuma dependência para instalar.
- `shellcheck` para mexer em `scripts/*.sh` (o CI roda).

## Fluxo

1. Branch a partir do `main` atualizado.
2. Edite o fato no arquivo certo (tabela em [.claude/skills/kb-atualizar/SKILL.md](.claude/skills/kb-atualizar/SKILL.md)); arquivo novo sai de um modelo:

   ```bash
   npm run modelo -- arquivo-da-base stacks/mensageria.md TITULO="Mensageria" RESUMO="..." DATA=2026-11-02
   ```

3. Atualize `atualizado:` nos arquivos tocados e rode:

   ```bash
   npm run indice && npm run validar && npm test
   ```

4. Commit em [Conventional Commits](https://www.conventionalcommits.org/pt-br/), em português: `docs(kb): registra fase 10 do careflow`, `feat(scripts): ...`, `fix(validador): ...`, `test: ...`, `ci: ...`.
5. PR em rascunho com o [template](.github/pull_request_template.md), Cleber como assignee. CI verde (`Validar base e scripts`, `Revisão de dependências`, `CodeQL`). O merge é do Cleber.

## Como escrever

- Um assunto por arquivo, até 16 KB. Passou disso, divida e rode `npm run indice`.
- Front matter com `resumo:` (uma linha, até 250 caracteres; é o que vai para o índice) e `atualizado: AAAA-MM-DD`.
- Fato, não narrativa: listas, tabelas, links. Estado volátil (CI, deploy, PR aberto) sempre com data.
- Prefira link para o ADR ou o código do repositório de origem a copiar texto. Em `snippets/`, código real com a fonte no front matter (`fontes:`).
- Modelos em `templates/` começam com `<!-- resumo: ... Variáveis A, B. -->` e usam `{{A}}`. O validador confere se as variáveis declaradas batem com as usadas.
- Skills: `.claude/skills/<nome>/SKILL.md` com `name` igual à pasta e `description` dizendo **quando** usar. Subagentes: `.claude/agents/<nome>.md` com `name`, `description` e `tools`.
- O CareFlow é Vertical Slices + DDD ([ADR-0001 do careflow](https://github.com/cleberSan/careflow/blob/main/docs/adr/0001-arquitetura-base.md)); nunca escreva que usa Clean Architecture.

## Nunca

Segredo, chave, OCID, e-mail, telefone ou endereço de pessoa ou loja, CPF (mesmo sintético), assunto pessoal de carreira, incidente com credencial, dado de cliente. Fato privado e útil vai para a memória do projeto no Claude, não para cá. Na dúvida, deixe de fora e pergunte.

## Código dos scripts

- ESM, sem dependências externas; identificadores em inglês, comentários e mensagens em português.
- Todo script exporta `main(args, contexto)` e devolve o código de saída; opção desconhecida é erro.
- Testes com `node:test` no padrão AAA, cobrindo erro e borda, não só o caminho feliz. Dado sensível falso é montado em tempo de execução (veja `tests/helpers.mjs`) para o repositório passar na própria varredura.
