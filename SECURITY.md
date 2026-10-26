# Política de segurança

## Reportar

Encontrou um segredo, um dado pessoal ou qualquer informação que não deveria estar pública neste repositório? **Não abra issue pública.** Use o [reporte privado de vulnerabilidades do GitHub](https://github.com/cleberSan/claude-works/security/advisories/new). O retorno inicial acontece em até 5 dias úteis.

Vale também para falhas nos scripts (ex.: um modelo que grava fora da pasta pedida).

## Escopo

- Conteúdo da base: segredos, identificadores de conta de nuvem, contatos, CPF, dados de clientes.
- Scripts de `scripts/` e `utils/`.
- Workflows de `.github/workflows/`.

Os projetos documentados (careflow, portfolio-web, lojinha-da-lua) têm a própria política no repositório de cada um.

## Práticas adotadas

- Nenhum segredo versionado; chaves ficam em GitHub secrets ou no cofre do provedor.
- O validador (`npm run validar`) barra no CI os formatos comuns de chave de API, token do GitHub, chave AWS e Google, chave privada, OCID, senha literal, e-mail, celular e CPF, sem repetir o valor no log.
- Workflows com permissão mínima, `persist-credentials: false` e só actions oficiais (`actions/*`, `github/*`).
- CodeQL (`security-extended`) para JavaScript e para os próprios workflows; revisão de dependências em PR; Dependabot semanal para as actions.
- Scripts sem dependências externas, que nunca sobrescrevem arquivo existente.
