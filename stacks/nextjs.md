---
resumo: Padrão Next.js do ecossistema - Next 16 com App Router, conteúdo tipado, MDX, CSP sem nonce, SEO, acessibilidade e testes.
atualizado: 2026-10-26
fontes:
  - https://github.com/cleberSan/portfolio-web
---

# Next.js

Referência viva: **portfolio-web** ([cartão](../projetos/portfolio-web.md)).

## Versões

Next.js 16.4, React 19.3, TypeScript estrito, Tailwind 4, Node 22 (`.nvmrc` e `engines`). O Next 16 muda APIs e convenções em relação ao que o modelo conhece: **leia `node_modules/next/dist/docs/`** antes de codar (o `AGENTS.md` do repositório pede isso e é regravado pelo `next dev`).

## Organização

```
src/app/            rotas (App Router), opengraph-image.tsx por página, sitemap.ts, robots.ts
src/components/     componentes com teste ao lado (*.test.tsx)
src/content/        conteúdo tipado em TS (perfil, projetos, posts) e MDX do diário
src/config/         site, URL do site, cabeçalhos de segurança, backend da demo
src/lib/            funções puras (formatação, metadados, SEO, cliente da demo)
src/proxy.ts        intercepta só /diario/:slug para 404 real
e2e/                Playwright (desktop e mobile)
```

- **Conteúdo é código tipado**: um registro em `src/content/*.ts` é a única fonte; testes conferem que registro e arquivos batem (slug seguro, data válida, MDX existente).
- **Páginas estáticas** com Cache Components; `generateStaticParams` para posts; página exporta `ensureStatic = 'navigation'` para o build falhar se virar dinâmica.
- Import dinâmico do MDX usa o slug do registro, nunca o texto da URL.
- Links em MDX passam por um `SmartLink` que só aceita rota interna, âncora e `https`.

## Segurança

- CSP **sem nonce** (páginas estáticas): `default-src 'self'`, `script-src 'self' 'unsafe-inline'` (payload RSC inline), `script-src-attr 'none'`, `connect-src` só com a própria origem e o backend da demo, `frame-ancestors 'none'`, `object-src 'none'`. HSTS 2 anos com preload, `nosniff`, `DENY`, `Permissions-Policy`, COOP ([snippet](../snippets/typescript/cabecalhos-e-csp.md)).
- Consequência: tema por `prefers-color-scheme`, sem botão (um botão sem flash precisaria de script inline).
- `NEXT_PUBLIC_*` vai para o navegador; nada secreto ali.
- E2E falha com qualquer erro de console, o que pega violação de CSP.

## SEO e acessibilidade

- `metadata` por página, Open Graph gerado no build, canonical, sitemap, robots (só produção indexa; previews bloqueiam), JSON-LD schema.org.
- axe WCAG 2.2 AA nos temas claro e escuro, em desktop e mobile; `prefers-reduced-motion` respeitado; skip link; foco visível.

## Testes

- Vitest 5 + Testing Library, AAA, cobertura 80% em linhas, branches, funções e statements.
- Playwright sobre `next start` do build de produção; servidor de teste em `127.0.0.1`; `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` opcional.
- Backend fictício por rota interceptada nos E2E (ex.: `https://demo.careflow.test`).

## Deploy

Vercel Hobby pela integração com o GitHub, `vercel.json` com `npm ci` e `npm run build`, domínio por `VERCEL_PROJECT_PRODUCTION_URL`. Hobby é **não comercial**. Ver [hospedagem-gratuita.md](hospedagem-gratuita.md).
