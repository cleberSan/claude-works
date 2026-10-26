---
resumo: ADR-0001 da base - leitura em camadas para gastar poucos tokens, conteúdo só público, português, índice gerado e validador sem dependências no CI.
atualizado: 2026-10-26
---

# ADR-0001: Base em camadas, pública e validada

- Status: proposto
- Data: 2026-10-26

## Contexto

O Cleber criou o claude-works para servir de base ao Claude em chats e projetos, economizando tokens e leitura de histórico. O repositório é público. Os projetos dele já têm ADRs e READMEs detalhados, e a memória do projeto no Claude guarda fatos privados.

## Decisão

- **Camadas de leitura:**
  1. `CLAUDE.md` (carregado sozinho pelo Claude Code): fatos-chave, mapa e regras, curto.
  2. `INDICE.md`: uma linha por arquivo, **gerado** a partir do `resumo:` de cada um.
  3. Arquivos de assunto (até 16 KB), com `resumo:` e `atualizado:` no topo.
  4. Fonte original (ADR, código) por link, só para citar ou conferir.
- **Só conteúdo público.** Fica fora: segredo, identificador de conta de nuvem, contato pessoal ou de terceiros, CPF, assunto de carreira, incidente com credencial. Fato privado continua na memória do projeto.
- **Português**, como os outros repositórios do Cleber. Custa um pouco mais de tokens que inglês, mas ele revisa e edita o conteúdo.
- **Link em vez de cópia** para ADRs; cópia só de trechos de código reutilizáveis (`snippets/`), com a fonte.
- **Funcional no Claude Code:** skills em `.claude/skills/` e subagentes em `.claude/agents/`, onde ele os carrega quando o repositório é anexado; os fluxos que os encadeiam ficam visíveis em `agents/`.
- **Validador sem dependências** (`scripts/validar-kb.mjs`, Node 24, `node:test`) no CI: front matter, índice em dia, links locais, tamanho e padrões de dado sensível. Testes com cobertura mínima de 80%, como nos outros repositórios.

## Alternativas

- **Um arquivo grande:** simples, mas todo uso pagaria a leitura inteira.
- **Inglês:** menos tokens, mas fora do padrão dos repositórios e menos confortável para revisão.
- **Repositório privado com tudo:** permitiria fatos privados, mas a memória do projeto já cumpre esse papel e o público mostra o processo no portfólio.
- **Validador em Python ou com dependências (gray-matter, markdownlint):** mais recursos, mas exigiria lock file, Dependabot e revisão de licenças para pouco ganho.

## Consequências

- Qualquer mudança passa por `npm run indice && npm run validar && npm test`.
- O validador pega padrões comuns de segredo e dado pessoal, não todos; a revisão humana continua necessária.
- Retrato com data: quem lê confere estado volátil (CI, deploy, PR) no repositório de origem.
