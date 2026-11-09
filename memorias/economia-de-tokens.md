---
resumo: O que economiza tokens no ecossistema - esforço e modelo pelo nível SDD, como ler a base, tamanho de skill e da memória do projeto, e o que não instalar.
atualizado: 2026-11-09
---

# Economia de tokens

Abra ao montar uma thread, escrever ou revisar uma skill, ou mexer na memória do projeto. Decisão e números: [ADR-0003](../docs/adr/0003-ferramentas-de-terceiros-para-o-claude.md).

## Onde o token vai

Medido em 2026-11-09 com `wc -c`, a ~4 caracteres por token.

| O quê | Tamanho | Tokens | Quando entra |
|---|---|---|---|
| Índice da memória do projeto | 11,6 KB | ~2,9 mil | Toda thread |
| CLAUDE.md desta base | 5,2 KB | ~1,3 mil | Thread com o claude-works montado |
| INDICE.md | 19,3 KB | ~4,8 mil | Se aberto inteiro |
| Skill `sdd`, processo e modelos | 14 KB | ~3,6 mil | Pedido com spec |

## Práticas

1. **Esforço e modelo pelo nível SDD.** Nível direto (Dependabot, texto da loja, documentação, esta base) com esforço menor ou modelo mais leve; leve e completo no padrão. É a maior alavanca e não depende de ferramenta.
2. **Índice com grep.** `grep -i "assunto" INDICE.md` devolve só as linhas do assunto; depois abra só o arquivo certo.
3. **Ler pouco.** `head -5` para triagem (resumo e data), `grep -n` antes de abrir, trecho com início e fim em arquivo grande.
4. **Ler uma vez.** Não reler o que já está na conversa nem colar arquivo inteiro na resposta.
5. **Resposta curta.** Resultado primeiro; detalhe em arquivo ou doc ([convenções](convencoes-de-trabalho.md#respostas-na-thread)).
6. **Subagente, workflow e pesquisa profunda só quando o Cleber pede.** Cada um começa do zero e relê o contexto.
7. **Skill e subagente até 4 KB**, com descrição de uma linha; detalhe em `memorias/` com link. O validador confere.
8. **Memória do projeto enxuta.** Uma linha por assunto no índice, detalhe no arquivo do assunto; status de PR já mergeado sai do índice. Meta de até 6 KB.

## O que não instalar

- **Plugin com hook de terceiro** (claude-mem, ECC): roda a cada ferramenta, grava fora do repositório e some com o contêiner da thread.
- **Pacote com centenas de skills:** a descrição de cada uma entra em toda sessão.
- **Observador em segundo plano** (outro modelo resumindo a sessão): troca contexto por chamadas extras ao modelo.
- Qualquer exceção passa por ADR com licença, o que grava, para onde manda dados, custo e ganho medido.

## Relacionados

- [spec-driven-development.md](spec-driven-development.md)
- [ambiente-cloud.md](ambiente-cloud.md)
- [convencoes-de-trabalho.md](convencoes-de-trabalho.md)
