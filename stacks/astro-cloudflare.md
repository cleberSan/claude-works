---
resumo: Padrão Astro + Cloudflare Workers do ecossistema - site estático com ilhas React, CSP por hash, catálogo validado e deploy grátis com prévia por PR.
atualizado: 2026-10-26
fontes:
  - https://github.com/cleberSan/lojinha-da-lua
---

# Astro 7 + Cloudflare Workers

Referência viva: **lojinha-da-lua** ([cartão](../projetos/lojinha-da-lua.md)). Escolha quando o site é comercial (Vercel Hobby e GitHub Pages proíbem) ou quando zero JavaScript por padrão importa.

## Versões

Astro 7.4, `@astrojs/react` 7, React 19, TypeScript 6 com `astro/tsconfigs/strictest`, Wrangler 4, Node 24 (`.nvmrc`). `@astrojs/check` aceita TypeScript 5 ou 6 (não 7).

## Organização

- **Regras puras em `src/domain/`** (dinheiro, telefone, mensagem, pedido, SEO), testadas sem Astro.
- **Conteúdo em coleção** (`src/content.config.ts`) com schema zod (`astro/zod`): preço em centavos inteiros, slug, variações e imagem fora do formato quebram o build.
- **Configuração tipada e validada** em `src/config/` (loja, site, segurança).
- **Ilhas React** só onde há interação (`client:visible` com `rootMargin`, `client:load`); estado lido com `useSyncExternalStore` direto do `localStorage`, sem biblioteca de estado. Um E2E garante zero JS nas outras páginas.
- Imagens por `astro:assets` (AVIF + WebP, várias larguras); `build.inlineStylesheets: "never"`; `build.format: "file"` (URLs sem barra final).

## Segurança

- CSP do Astro (`security.csp`) no `<meta>` com **hashes** para scripts e estilos, sem `unsafe-inline`; cabeçalho HTTP só com o que o `<meta>` não cobre (`frame-ancestors`, `base-uri`, `form-action`, `object-src`).
- Uma fonte (`src/config/security.ts`); uma integração no `astro.config.mjs` grava `dist/_headers` no fim do build.
- Links externos só `https` com `rel="noopener noreferrer"`.
- `localStorage` lido de forma defensiva: versão, limites, tipos, `Map` em vez de objeto (evita `__proto__`).

## Deploy na Cloudflare

- `wrangler.jsonc` publica `dist/` como **arquivos estáticos de um Worker**, sem código de servidor (requisição a estático não conta no limite grátis).
- **Workers Builds** pelo app da Cloudflare no GitHub (só o repositório selecionado): merge na `main` publica; outras branches rodam `wrangler preview` e geram link de prévia (exige `"previews": {}`).
- `workers_dev` e `preview_urls` ligados na configuração (não no painel), para nenhum ajuste manual desligar o endereço sem PR.
- Endereço de produção no código; variável de build só para E2E (abas Production e Previews Base não compartilham variáveis).
- Rollback em **Deployments** no painel do Worker. Sem servidor, monitoramento é um teste agendado contra a produção.

## Testes

- Vitest com 80%; E2E Playwright + axe em desktop e celular sobre `wrangler dev` (mesmo runtime e mesmo `_headers` de produção), build com `SITE_URL=http://127.0.0.1:8787`.
- A mesma suíte roda contra a produção com `E2E_BASE_URL` ([pipeline](../pipelines/conferencia-producao.yml)).
- Nunca `pkill -f "wrangler dev"` dentro de comando composto.
