---
resumo: portfolio-web, o site pessoal em Next.js 16 - rotas, onde fica cada conteúdo, visual, testes, deploy na Vercel e tarefas comuns.
atualizado: 2026-10-26
fontes:
  - https://github.com/cleberSan/portfolio-web
  - https://portfolio-web-psi-rust.vercel.app
---

# portfolio-web

Site pessoal do Cleber: apresentação centrada nele (trajetória, competências), projetos com estudo de caso, diário de bordo do CareFlow e o **Painel de Privacidade e Resiliência**. Repositório <https://github.com/cleberSan/portfolio-web> (MIT). No ar em <https://portfolio-web-psi-rust.vercel.app> (nome automático da Vercel, sem domínio próprio).

## Stack

Next.js **16.4** (App Router, Cache Components, `@next/mdx`), React **19.3**, TypeScript estrito, Tailwind **4**, Vitest **5** + Testing Library, Playwright **1.64** + `@axe-core/playwright`, ESLint 9, Prettier. Node **22** (`.nvmrc`, `engines: 22.x`). Ver [stacks/nextjs.md](../stacks/nextjs.md).

> O Next.js 16 tem APIs diferentes do que o modelo conhece: o `AGENTS.md` do repositório manda ler `node_modules/next/dist/docs/` antes de codar.

## Rotas

| Rota | Conteúdo | Arquivo de conteúdo |
|---|---|---|
| `/` | Apresentação, KPIs, topologia animada, trajetória, competências, posts recentes | `src/config/site.ts`, `src/content/profile.ts` |
| `/projetos` | Lista de projetos | `src/app/projetos/page.tsx` |
| `/projetos/careflow` | Arquitetura, princípios, roadmap, vídeo "O fluxo em um minuto", botões Ver demonstração e Ver código | `src/content/careflow.ts`, `public/videos/` |
| `/projetos/careflow/painel` | Painel: replay da gravação do CI e modo ao vivo quando há backend | `src/content/painel/gravacao.json`, `src/components/painel/` |
| `/projetos/lojinha-da-lua` | Estudo de caso da loja | `src/content/lojinha.ts` |
| `/diario`, `/diario/<slug>` | Diário de bordo, um post por fase | `src/content/posts.ts`, `src/content/diario/*.mdx` |
| `/stack` | Tecnologias com links para onde aparecem em código público | `src/content/stack.ts` |
| `/sobre` | Experiência, forma de trabalho, contato (LinkedIn e GitHub) | `src/content/profile.ts` |

Também: `sitemap.ts`, `robots.ts`, imagens Open Graph por página (`opengraph-image.tsx`), JSON-LD (`components/json-ld.tsx`), `proxy.ts` (404 real para slug inexistente do diário).

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

## Testes e CI

- Unidade: Vitest com cobertura mínima de 80% nas quatro métricas; teste ao lado do arquivo (`*.test.ts[x]`).
- E2E (`e2e/`): Playwright em **desktop (Desktop Chrome) e mobile (Pixel 7)** sobre o build de produção (`next start`), com axe WCAG 2.2 AA nos temas claro e escuro, cabeçalhos HTTP, navegação, Painel (`e2e/fixtures.ts` simula o backend `https://demo.careflow.test`). Falha se o console registrar erro (pega violação de CSP).
- Teste garante que não há e-mail, telefone nem endereço no site.
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
- **Perfil mudou:** editar `src/content/profile.ts` e atualizar `profile.asOf`.
- **Novo estudo de caso:** `src/content/<projeto>.ts` + `src/app/projetos/<projeto>/page.tsx` + `opengraph-image.tsx` + entrada em `/projetos` e no sitemap, com teste.
- **Build local para E2E:** `NEXT_PUBLIC_CAREFLOW_DEMO_URL=https://demo.careflow.test npm run build && npm run test:e2e`.

## Pendências conhecidas

- O texto do site diz "7 anos" de carreira e o LinkedIn diz "mais de 6": alinhar quando o perfil for revisado.
- Domínio próprio ainda não existe (o HSTS com `includeSubDomains; preload` exige HTTPS em todo subdomínio dele).
