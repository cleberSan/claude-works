<!-- resumo: Checklist para um site novo no padrão do ecossistema - segurança, SEO, acessibilidade, testes, privacidade, deploy gratuito e conferência em produção. -->
# Checklist de site novo

## Base
- [ ] Next.js (portfólio, conteúdo com demo) ou Astro (estático, comercial, zero JS por padrão); ADR-0001 com a escolha
- [ ] TypeScript estrito, Prettier, ESLint (com a11y), Node fixado em `.nvmrc` e `engines`
- [ ] `README`, `CONTRIBUTING`, `SECURITY`, `LICENSE`, `CODEOWNERS`, template de PR, Dependabot (npm e actions)

## Segurança
- [ ] CSP completa (sem nonce no Next estático, por hash no Astro), `object-src 'none'`, `frame-ancestors 'none'`
- [ ] HSTS 2 anos com preload, `nosniff`, `DENY`, `Referrer-Policy`, `Permissions-Policy`, COOP
- [ ] Cabeçalhos de uma fonte só, testados por unidade e conferidos no E2E
- [ ] Links externos `https` com `rel="noopener noreferrer"`; links de MDX filtrados
- [ ] Nada secreto em variável pública (`NEXT_PUBLIC_`, `PUBLIC_`)

## SEO
- [ ] `title` e descrição por página, canonical, Open Graph com imagem gerada no build
- [ ] `sitemap.xml`, `robots.txt` (prévias não indexam), JSON-LD schema.org
- [ ] 404 real com status 404

## Acessibilidade
- [ ] axe WCAG 2.2 AA (ou 2.1 AA) nos temas claro e escuro, desktop e mobile
- [ ] Um `h1` por página, skip link, foco visível, navegação por teclado
- [ ] `prefers-reduced-motion` e `prefers-color-scheme` respeitados

## Testes e CI
- [ ] Vitest com 80% em linhas, branches, funções e statements
- [ ] Playwright sobre o build de produção, falhando com erro de console
- [ ] CI: format, lint, tipos, cobertura, build, E2E; CodeQL; revisão de dependências; `npm audit` de produção

## Privacidade
- [ ] Nenhum contato pessoal além do que o dono autorizou por escrito; e-mail e endereço só com pedido explícito (teste que garante)
- [ ] Nenhum rastreador de terceiros; fontes self-hosted
- [ ] Página de privacidade se guardar qualquer coisa no aparelho

## Deploy
- [ ] Hospedagem grátis compatível com o uso (comercial: Cloudflare; não comercial: Vercel Hobby)
- [ ] Integração pelo app do provedor, só no repositório; nenhum token no GitHub
- [ ] `main` protegido com os checks obrigatórios, sem bypass
- [ ] Prévia por PR; rollback documentado
- [ ] Conferência agendada contra produção quando não há backend ([pipeline](../pipelines/conferencia-producao.yml))
