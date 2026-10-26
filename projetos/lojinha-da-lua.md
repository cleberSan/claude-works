---
resumo: lojinha-da-lua, catálogo de uma loja real com pedido pelo WhatsApp - stack, rotas, regras de conteúdo da loja, ADRs, deploy na Cloudflare e tarefas comuns.
atualizado: 2026-10-26
fontes:
  - https://github.com/cleberSan/lojinha-da-lua
  - https://lojinha-da-lua.clebersan.workers.dev
---

# lojinha-da-lua

Site da **Lojinha Da Lua**, loja real de produtos personalizados (camisetas em sublimação e DTF, canecas): catálogo com preço de referência e pedido pelo WhatsApp. Também é peça do portfólio (estudo de caso em `/projetos/lojinha-da-lua` no portfolio-web). Repositório <https://github.com/cleberSan/lojinha-da-lua>; código MIT, marca, logo, fotos e textos da loja com todos os direitos reservados. No ar em <https://lojinha-da-lua.clebersan.workers.dev>.

## Regras de conteúdo (não negociáveis)

- **Tudo que a loja publica vem dela:** preço, prazo, forma de pagamento, descrição, contato. Nada inventado.
- Contatos (WhatsApp e Instagram) só em `src/config/store.ts`, validados no build: celular `55DD9XXXXXXXX` e **exatamente um** número com `receivesOrders: true`. Não copie os números para outro lugar.
- Produtos ou serviços citados pela loja sem flyer e sem preço (ex.: azulejos, DTF UV) só entram quando a loja mandar os dados.
- Imagem com personagem, marca ou pessoa de terceiros só com decisão registrada (ADR-0009 aceitou as estampas dos flyers; plano de remoção no próprio ADR).
- **O Claude nunca faz merge** neste repositório, nem de Dependabot.

## Stack

Astro **7.4** estático (`astro/tsconfigs/strictest`), React **19** só em duas ilhas, TypeScript 6, zod (`astro/zod`) para catálogo e loja, Vitest 5, Playwright 1.64 + axe (WCAG 2.1 AA), Wrangler 4 (`wrangler dev` nos E2E, mesmo runtime workerd de produção). Node **24** (`.nvmrc`; Astro 7.4 pede ≥ 22.23.4). Fontes Alegreya Sans SC e Nunito (OFL) por `@fontsource`. Ver [stacks/astro-cloudflare.md](../stacks/astro-cloudflare.md).

## Rotas

| Rota | Conteúdo |
|---|---|
| `/` | Apresentação, categorias, destaques, como funciona, contato |
| `/produtos` | Catálogo (camisetas e canecas) com "a partir de" |
| `/produtos/<slug>` | Variações e preços, observações, botão "Pedir" por variação, ilha "Montar pedido" |
| `/pedido` | Revisa os itens e envia tudo numa mensagem (ilha React) |
| `/contato`, `/privacidade` | Contatos da loja; o que o site guarda (só o pedido, no aparelho) |
| 404 | Página no visual da loja com status 404 |

## Estrutura

```
src/content/produtos/<slug>.json   um produto por arquivo (preço em centavos, variações, imagem, kind foto|ilustracao)
src/content.config.ts              coleção validada pelo schema de src/domain/catalog.ts
src/domain/                        regras puras: catalog, money, phone, whatsapp, order, order-storage, seo
src/islands/                       AddToOrder, OrderBuilder, useStoredOrder (useSyncExternalStore)
src/config/                        site.ts (productionSiteUrl), store.ts (loja), security.ts (CSP e cabeçalhos)
src/assets/produtos/, marca/       imagens quadradas ≥ 1200 px; logo 704 px
e2e/                               suíte usada no CI e contra a produção (E2E_BASE_URL)
```

## ADRs

| ADR | Decisão |
|---|---|
| 0001 | Astro estático, JavaScript só onde há interação, catálogo em JSON validado por zod |
| 0002 | Cloudflare Workers com arquivos estáticos (Vercel Hobby e GitHub Pages proíbem uso comercial); deploy pelo Workers Builds, sem token no GitHub |
| 0003 | Imagens só da loja, sem terceiros (**substituído pelo 0009**) |
| 0004 | CSP por hash no `<meta>` (sem `unsafe-inline`) + cabeçalhos no `_headers`, de uma fonte só |
| 0005 | Pedido pelo WhatsApp (`wa.me` com `encodeURIComponent`), sem backend e sem dado pessoal |
| 0006 | "Montar pedido" no navegador: duas ilhas, `localStorage` versionado, leitura defensiva, limite de 1.500 caracteres na mensagem |
| 0007 | SEO e prévia de links (Open Graph, canonical, JSON-LD de loja e produto, sitemap) sem dependência |
| 0008 | Conferência diária do site no ar com a mesma suíte E2E; endereço de produção no código |
| 0009 | Fotos dos flyers com as estampas originais (Real-ESRGAN x4 local; Lanczos onde há texto) |

## Testes, CI e produção

- CI "Lint, tipos, testes e build": format, lint (`jsx-a11y-strict` no `.astro`), `astro check`, Vitest com 80%, build com `SITE_URL=http://127.0.0.1:8787`, E2E sobre `wrangler dev` em desktop e celular.
- Um teste compara os preços do catálogo com a tabela dos flyers (`flyerPrices` em `src/content/catalog.test.ts`).
- E2E garante zero JavaScript fora das páginas com ilha e nenhuma requisição para outra origem.
- **Site no ar** (`producao.yml`): todo dia 09:23 UTC roda a suíte contra a produção; falha agendada abre ou comenta a issue "Site no ar falhou na conferência agendada". Template genérico: [pipelines/conferencia-producao.yml](../pipelines/conferencia-producao.yml).

## Deploy

- **Cloudflare Workers Builds** lê o repositório pelo app da Cloudflare; merge na `main` publica; outras branches geram prévia (`wrangler preview`, exige `"previews": {}` no `wrangler.jsonc`).
- Endereço de produção em `productionSiteUrl` (`src/config/site.ts`). `SITE_URL` só para E2E; no build da Cloudflare (`WORKERS_CI=1`) uma `SITE_URL` diferente quebra o build de propósito.
- Subdomínio da conta trocado do padrão (derivado do e-mail) para o usuário público do GitHub.
- Rollback: **Deployments** no painel do Worker.

## Tarefas comuns

- **Preço:** `priceCents` no JSON do produto + `flyerPrices` no teste + `pricesAsOf` em `src/config/store.ts`, no mesmo PR.
- **Produto novo:** `src/content/produtos/<slug>.json` seguindo os existentes; imagem quadrada ≥ 1200 px em `src/assets/produtos/`.
- **Foto nova da loja:** tem preferência sobre as dos flyers; `"kind": "foto"`.
- Scripts de imagem usados no PR #8 ficam fora do repositório, na pasta do projeto (`/mnt/project-files/lojinha-da-lua/imagens/`).

## Histórico

#1 base (2026-10-23), #5 ilhas, `/contato`, `/privacidade`, SEO; #6 conferência diária; #7 crédito no rodapé para o portfólio; #8 fotos dos flyers (2026-10-24). Dependabot #3 (TypeScript 7) não instala porque `@astrojs/check` exige TS 5 ou 6.

## Pendências

- Fotos, preços e textos novos dependem da loja.
