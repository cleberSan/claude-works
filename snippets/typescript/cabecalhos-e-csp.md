---
resumo: Cabeçalhos de segurança e CSP em TypeScript - versão sem nonce do Next.js (portfolio-web) e versão por hash do Astro (lojinha), com fonte única e testes.
atualizado: 2026-10-26
fontes:
  - https://github.com/cleberSan/portfolio-web/blob/main/src/config/security-headers.ts
  - https://github.com/cleberSan/lojinha-da-lua/blob/main/docs/adr/0004-csp-por-hash-e-cabecalhos.md
---

# Cabeçalhos e CSP

## Next.js: CSP sem nonce (páginas estáticas)

```ts
export type Header = { key: string; value: string };

export type SecurityHeadersOptions = {
  /** `next dev` precisa de 'unsafe-eval' para o React reconstruir stack traces. */
  isDevelopment: boolean;
  /** Backend da demonstração ao vivo; sem ele, o navegador só fala com o próprio site. */
  demoBackend?: URL;
};

export function buildContentSecurityPolicy({ isDevelopment, demoBackend }: SecurityHeadersOptions): string {
  const scriptSrc = ["'self'", "'unsafe-inline'", ...(isDevelopment ? ["'unsafe-eval'"] : [])];
  // Só a origem, nunca curinga.
  const connectSrc = ["'self'", ...(demoBackend ? [demoBackend.origin] : [])];
  return [
    "default-src 'self'",
    `script-src ${scriptSrc.join(" ")}`,
    "script-src-attr 'none'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' blob: data:",
    "font-src 'self'",
    `connect-src ${connectSrc.join(" ")}`,
    "frame-src 'none'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
  ].join("; ");
}

export function buildSecurityHeaders(options: SecurityHeadersOptions): readonly Header[] {
  return [
    { key: "Content-Security-Policy", value: buildContentSecurityPolicy(options) },
    { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
    { key: "X-Content-Type-Options", value: "nosniff" },
    { key: "X-Frame-Options", value: "DENY" },
    { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
    { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), browsing-topics=()" },
    { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  ];
}
```

Aplicado em `next.config.ts` (`headers()` para `/:path*`). `'unsafe-inline'` em script existe porque o Next injeta o payload RSC inline com conteúdo que muda a cada build; `script-src-attr 'none'` fecha handlers em atributo. `upgrade-insecure-requests` ficou de fora (HSTS já força HTTPS e quebraria o servidor HTTP dos testes).

## Astro: CSP por hash (sem `unsafe-inline`)

- `<meta>` gerado pelo Astro (`security.csp`): `default-src 'self'`, `img-src 'self' data:`, `font-src 'self'`, `connect-src 'self'`, `object-src 'none'`, `base-uri 'none'`, `form-action 'none'`, `script-src` e `style-src` com `'self'` + hashes calculados no build.
- Cabeçalho HTTP só com o que `<meta>` não cobre: `frame-ancestors 'none'; base-uri 'none'; form-action 'none'; object-src 'none'`.
- Demais cabeçalhos iguais aos do Next, com `Permissions-Policy` também negando `payment` e `usb`.
- Fonte única `src/config/security.ts`; uma integração do `astro.config.mjs` grava `dist/_headers` no fim do build (lido pela Cloudflare e pelo `wrangler dev`).
- `build.inlineStylesheets: "never"` e nenhum atributo `style`.

## Testes

Exemplo no estilo dos testes do repositório (Vitest, AAA):

```ts
it("só libera a origem do backend da demo em connect-src", () => {
  const csp = buildContentSecurityPolicy({ isDevelopment: false, demoBackend: new URL("https://demo.exemplo.test/x") });
  expect(csp).toContain("connect-src 'self' https://demo.exemplo.test");
  expect(csp).not.toContain("unsafe-eval");
});
```

E2E: confere os cabeçalhos em cada rota e falha com qualquer erro de console (violação de CSP aparece ali).
