---
resumo: portfolio-web, o site pessoal em Next.js 16 - rotas, onde fica cada conteúdo, visual, testes, deploy na Vercel e tarefas comuns.
atualizado: 2026-10-27
fontes:
  - https://github.com/cleberSan/portfolio-web
  - https://portfolio-web-psi-rust.vercel.app
---

# portfolio-web

Site pessoal do Cleber: mostra quem ele é, com o que e como trabalha. Home de página única no formato de portfólio (cases, atuação, trajetória, contato), projetos com estudo de caso, diário de bordo do CareFlow e o **Painel de Privacidade e Resiliência**. Home e Sobre também em inglês (`/en`, `/en/about`). Repositório <https://github.com/cleberSan/portfolio-web> (MIT). No ar em <https://portfolio-web-psi-rust.vercel.app> (nome automático da Vercel, sem domínio próprio).

## Stack

Next.js **16.4** (App Router, Cache Components, `@next/mdx`), React **19.3**, TypeScript estrito, Tailwind **4**, Vitest **5** + Testing Library, Playwright **1.64** + `@axe-core/playwright`, ESLint 9, Prettier. Node **22** (`.nvmrc`, `engines: 22.x`). Ver [stacks/nextjs.md](../stacks/nextjs.md).

> O Next.js 16 tem APIs diferentes do que o modelo conhece: o `AGENTS.md` do repositório manda ler `node_modules/next/dist/docs/` antes de codar.

## Rotas

| Rota | Conteúdo | Arquivo de conteúdo |
|---|---|---|
| `/` | Página única: topo com KPIs e topologia; 01 Cases (problema, abordagem, resultado), 02 Atuação, 03 Quem sou (princípios, IA, portões do CI), 04 Habilidades, 05 Trajetória, 06 Diário, 07 Contato. O menu aponta para essas âncoras e para as páginas | `src/components/home/`, `src/config/site.ts`, `src/content/profile.ts`, `cases.ts`, `engineering.ts` |
| `/en`, `/en/about` | Home e Sobre em inglês, mesmo layout | `src/components/home/home-text.ts`, `src/components/about/about-text.ts`, `src/content/*.en.ts` |
| `/projetos` | Lista de projetos | `src/app/(pt)/projetos/page.tsx` |
| `/projetos/careflow` | Arquitetura, princípios, roadmap, vídeo "O fluxo em um minuto", botões Ver demonstração e Ver código | `src/content/careflow.ts`, `public/videos/` |
| `/projetos/careflow/painel` | Painel: replay da gravação do CI e modo ao vivo quando há backend | `src/content/painel/gravacao.json`, `src/components/painel/` |
| `/projetos/lojinha-da-lua` | Estudo de caso da loja | `src/content/lojinha.ts` |
| `/diario`, `/diario/<slug>` | Diário de bordo, um post por fase | `src/content/posts.ts`, `src/content/diario/*.mdx` |
| `/stack` | Tecnologias com links para onde aparecem em código público | `src/content/stack.ts` |
| `/sobre` | Experiência, forma de trabalho, contato | `src/components/about/`, `src/content/profile.ts` |

As páginas em português ficam no grupo de rotas `src/app/(pt)/`; as URLs não levam o grupo. `/curriculo` não existe mais e redireciona (301) para `/sobre`.

Também: `sitemap.ts` (com alternates de idioma), `robots.ts`, imagens Open Graph por página (`opengraph-image.tsx`; as padrão são route handlers em `/opengraph-image` e `/en/opengraph-image`), JSON-LD (`components/json-ld.tsx`), `proxy.ts` (404 real para slug inexistente do diário), `global-not-found.tsx` (404 de URL que não casa com nenhum layout).

## Idiomas (ADR-0006)

- Dois layouts raiz: `src/app/(pt)/layout.tsx` (`lang="pt-BR"`) e `src/app/en/layout.tsx` (`lang="en"`), para o `<html lang>` vir certo no HTML estático sem proxy nem nonce. Trocar de idioma recarrega a página.
- Seletor **PT-BR | EN** no cabeçalho: links `<a>` simples com `hrefLang`, sem script nem cookie; leva à página equivalente (`/sobre` ↔ `/en/about`) ou à home do outro idioma. Sem redirecionamento pelo idioma do navegador.
- Textos em inglês em `src/content/*.en.ts`, indexados pelos ids e nomes do português: faltou uma tradução, não compila. `src/test-utils/portuguese.ts` aponta português esquecido no inglês.
- Projetos, diário e Painel só em português; a partir do inglês, os links para eles dizem "(in Portuguese)" e levam `hrefLang="pt-BR"`. Posts do diário na home em inglês ficam num `<div lang="pt-BR">`.
- SEO: `hreflang` (pt-BR, en, x-default → português), `og:locale` e alternates no sitemap (`src/i18n/routes.ts`).

## Visual "Sala de controle"

- Tokens em `src/app/globals.css`: `--background`, `--foreground`, `--surface`, `--border`, `--muted`, `--accent` (ciano `#67e8f9` no escuro, `#0e7490` no claro), `--ok`, `--warn`, `--grid-line`; fontes IBM Plex Sans e Plex Mono por `next/font` (self-hosted).
- Tema segue o sistema (`prefers-color-scheme`), **sem botão**: um botão sem flash precisaria de script inline, que a CSP sem nonce não permite.
- Componente `Topology` (SVG com pulsos por `offset-path`, escondido com `prefers-reduced-motion`), eyebrows em mono, faixa de KPIs (7 anos, 6 setores, 7 empresas).
- Componentes novos usam os tokens; nada de cor solta.

## Segurança

- CSP completa **sem nonce** (ADR-0003), HSTS com preload, `nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy`, `Permissions-Policy`, COOP. Fonte única: `src/config/security-headers.ts`. Snippet: [snippets/typescript/cabecalhos-e-csp.md](../snippets/typescript/cabecalhos-e-csp.md).
- `connect-src` ganha só a origem de `NEXT_PUBLIC_CAREFLOW_DEMO_URL` quando ela existe.
- Links do MDX passam pelo `SmartLink`: só rota interna, âncora e `https`.
- Nenhuma variável do site é secreta; `NEXT_PUBLIC_` vai para o navegador.

## ADRs

| ADR | Decisão |
|---|---|
| 0000 | Registrar decisões com ADR |
| 0001 | Stack e portões de qualidade (Next 16, Tailwind 4, Vitest 80% em linhas/branches/funções/statements, Playwright) |
| 0002 | Cabeçalhos de segurança e CSP (política de script/style decidida no 0003) |
| 0003 | CSP completa sem nonce, para manter páginas estáticas |
| 0004 | Diário em MDX com registro tipado e 404 real (`proxy.ts`), `ensureStatic` |
| 0005 | Vercel pela integração com GitHub; domínio detectado por `VERCEL_PROJECT_PRODUCTION_URL`; Node 22 e `npm ci` pelo `vercel.json` |
| 0006 | Versão em inglês com um layout raiz por idioma (home e Sobre) |

## Testes e CI

- Unidade: Vitest com cobertura mínima de 80% nas quatro métricas; teste ao lado do arquivo (`*.test.ts[x]`).
- E2E (`e2e/`): Playwright em **desktop (Desktop Chrome) e mobile (Pixel 7)** sobre o build de produção (`next start`), com axe WCAG 2.2 AA nos temas claro e escuro, cabeçalhos HTTP, navegação, Painel (`e2e/fixtures.ts` simula o backend `https://demo.careflow.test`). Falha se o console registrar erro (pega violação de CSP).
- Contato: LinkedIn, GitHub, telefone e WhatsApp em `site.contact` (autorizados em 2026-10-27). Testes de unidade e E2E garantem que não há e-mail nem endereço em nenhuma página.
- Um teste confere que cada portão do painel "Pipeline deste site" existe nos workflows (`src/content/engineering.ts`).
- O site não é currículo online: não fala em busca de vaga nem disponibilidade (pedido do Cleber, 2026-10-27); testes de unidade barram esse texto em português e em inglês.
- A seção da home se chama "Atuação", não "Serviços": o site não oferece serviço, e a Vercel Hobby é de uso não comercial.
- CI "Lint, tipos, testes e build": `npm ci` → `npm audit --omit=dev --audit-level=moderate` → format → lint → typecheck (`next typegen && tsc`) → cobertura → build → E2E. Revisão de dependências bloqueia severidade moderada e GPL-3.0/AGPL-3.0 em runtime.

## Variáveis

| Variável | Uso |
|---|---|
| `SITE_URL` | Origem pública; opcional (a Vercel informa o domínio de produção) |
| `VERCEL_ENV`, `VERCEL_PROJECT_PRODUCTION_URL` | Preenchidas pela Vercel; só produção libera indexação |
| `NEXT_PUBLIC_CAREFLOW_DEMO_URL` | Liga o Painel ao vivo e entra no `connect-src`; lida no build (mudar exige redeploy) |

## Deploy

- Vercel **Hobby** (uso não comercial; oferecer serviço pago no site exigiria Pro). Merge na `main` publica; cada PR ganha preview fora dos buscadores.
- Rollback: promover a publicação anterior no painel da Vercel.
- Conector da Vercel disponível nas sessões: lê projetos e deploys, edita configurações.

## Tarefas comuns

- **Post novo no diário:** `src/content/diario/<slug>.mdx` começando em `##` + entrada em `src/content/posts.ts` (título, descrição, data, fase, tags). `npm test` confere que registro e arquivo batem. Modelo: [templates/post-diario.mdx](../templates/post-diario.mdx).
- **Fase do CareFlow mudou de status:** `careflowPhases` em `src/content/careflow.ts` (`concluida` ou `planejada`, `postSlug`).
- **Atualizar o Painel:** baixar o artefato `panel-recording` do CI do careflow e copiar byte a byte para `src/content/painel/gravacao.json`.
- **Perfil mudou:** editar `src/content/profile.ts` e `profile.en.ts` e atualizar `profile.asOf`.
- **Texto novo na home ou no Sobre:** a versão em inglês vai em `home-text.ts`, `about-text.ts` ou no `*.en.ts` do conteúdo.
- **Novo estudo de caso:** `src/content/<projeto>.ts` + `src/app/projetos/<projeto>/page.tsx` + `opengraph-image.tsx` + entrada em `/projetos` e no sitemap, com teste.
- **Build local para E2E:** `NEXT_PUBLIC_CAREFLOW_DEMO_URL=https://demo.careflow.test npm run build && npm run test:e2e`.

## Pendências conhecidas

- O texto do site diz "7 anos" de carreira e o LinkedIn diz "mais de 6": alinhar quando o perfil for revisado.
- Domínio próprio ainda não existe (o HSTS com `includeSubDomains; preload` exige HTTPS em todo subdomínio dele).
