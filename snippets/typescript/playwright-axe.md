---
resumo: Configuração Playwright dos sites - build de produção, desktop e mobile, axe nos dois temas, falha com erro de console (pega CSP) e backend simulado.
atualizado: 2026-10-26
fontes:
  - https://github.com/cleberSan/portfolio-web/tree/main/e2e
  - https://github.com/cleberSan/portfolio-web/blob/main/playwright.config.ts
---

# Playwright + axe

## Configuração

```ts
import { defineConfig, devices } from "@playwright/test";

const port = Number(process.env.E2E_PORT ?? 3100);
const baseURL = `http://127.0.0.1:${port}`;
const isCI = Boolean(process.env.CI);
// Chromium já instalado (containers sem download do Playwright).
const executablePath = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH || undefined;

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 1 : 0,
  reporter: isCI ? [["github"], ["html", { open: "never" }]] : "list",
  use: { baseURL, trace: "retain-on-failure", launchOptions: { executablePath } },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile", use: { ...devices["Pixel 7"] } },
  ],
  // Build de produção: mesmos cabeçalhos e HTML que vão ao ar.
  webServer: {
    command: `npm run start -- --hostname 127.0.0.1 --port ${port}`,
    url: baseURL,
    reuseExistingServer: !isCI,
    timeout: 60_000,
  },
});
```

Na lojinha, o `webServer` é `wrangler dev` (runtime da Cloudflare) e, com `E2E_BASE_URL`, não sobe servidor: a mesma suíte roda contra a produção.

## Fixture: todo teste falha com erro no navegador

```ts
export const test = base.extend<{ allowedBrowserErrors: RegExp[] } & { browserErrors: string[] }>({
  allowedBrowserErrors: [[], { option: true }],
  browserErrors: [
    async ({ page, allowedBrowserErrors }, provide) => {
      const errors: string[] = [];
      const record = (text: string) => {
        if (!allowedBrowserErrors.some((p) => p.test(text))) errors.push(text);
      };
      page.on("console", (m) => { if (m.type() === "error") record(m.text()); });
      page.on("pageerror", (e) => record(e.message));
      await provide(errors);
      expect(errors, "o navegador não deve registrar erros").toEqual([]);
    },
    { auto: true },
  ],
});
```

Violação de CSP vira erro de console, então script bloqueado não passa despercebido.

## Acessibilidade nos dois temas

```ts
for (const path of allPages) {
  for (const colorScheme of ["light", "dark"] as const) {
    test(`${path} sem violações WCAG 2.2 AA no tema ${colorScheme}`, async ({ page }) => {
      // Arrange
      await page.emulateMedia({ colorScheme });
      await page.goto(path);
      // Act
      const results = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
        .analyze();
      // Assert
      expect(results.violations).toEqual([]);
    });
  }
}
```

## Backend simulado

`page.route("https://demo.careflow.test/**", ...)` responde como o serviço real, com CORS só para a origem do site; o padrão é o interruptor desligado, para as páginas caírem no replay sem erro de rede. O build dos testes usa `NEXT_PUBLIC_CAREFLOW_DEMO_URL=https://demo.careflow.test`.

## Também testar

Status 200 e um único `h1` por página, título, cabeçalhos HTTP por rota, 404 real, navegação por teclado, `prefers-reduced-motion`, nenhuma requisição para outra origem (lojinha).
