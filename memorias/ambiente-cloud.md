---
resumo: Armadilhas do container do Claude Code na nuvem e como rodar build, testes e E2E dos três projetos nele.
atualizado: 2026-10-26
---

# Ambiente do Claude Code na nuvem

Vale para as sessões em container (claude.ai/code, threads de projeto). O script [`scripts/ambiente-cloud.sh`](../scripts/ambiente-cloud.sh) automatiza a parte repetitiva.

## O que a sessão não faz

- Criar repositório, mudar configurações do repositório (proteção de branch, secrets, environments) ou tornar pacote público: o Cleber faz e a thread manda o passo a passo.
- Baixar artefatos do GitHub Actions: o proxy bloqueia o host de blobs. Peça ao Cleber o `.zip` do artefato anexado na thread.
- Abrir navegador nas contas dele: as threads não têm ferramentas de navegador. Peça print.
- Conector da Vercel: lê projetos e deploys e edita configurações; não apaga; logs de build voltaram 403.

## .NET (careflow)

- O download direto da Microsoft é bloqueado. Instale pelo arquivo do Ubuntu: `apt-get install -y dotnet-sdk-10.0` (`scripts/ambiente-cloud.sh dotnet`).
- Restore com lock file: `dotnet restore --locked-mode`. Atualizou pacote: `dotnet restore --force-evaluate` e commite os `packages.lock.json`.

## Docker e Testcontainers

- Depois de reiniciar o container, suba o daemon: `dockerd` em segundo plano (`scripts/ambiente-cloud.sh docker`).
- O Docker Hub devolve 429. Puxe do espelho e renomeie: `docker pull mirror.gcr.io/library/rabbitmq:4.1-alpine && docker tag mirror.gcr.io/library/rabbitmq:4.1-alpine rabbitmq:4.1-alpine` (`scripts/ambiente-cloud.sh imagem rabbitmq:4.1-alpine`).
- Defina `TESTCONTAINERS_RYUK_DISABLED=true` localmente.
- Volume do Postgres anterior a uma fase que criou banco novo: `docker compose down -v && docker compose up -d` uma vez (o init só roda na criação do volume).
- Chaves locais (KEK do cofre, HMAC da auditoria, pares P-256) vão em user secrets, conforme o CONTRIBUTING do careflow.

## Playwright (sites)

- Chromium já instalado em `/opt/pw-browsers/chromium`. **Não** rode `playwright install`.
- Use `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/opt/pw-browsers/chromium`.
- Em 2026-10-16 o portfolio-web pediu também `PLAYWRIGHT_BROWSERS_PATH` com `chromium_headless_shell-1248` como link para o binário 1194. Versões mudam; confira a mensagem de erro antes de repetir.
- Build do portfolio-web para E2E: `NEXT_PUBLIC_CAREFLOW_DEMO_URL=https://demo.careflow.test npm run build` (senão os testes do Painel ao vivo falham).
- Build da lojinha para E2E: `SITE_URL=http://127.0.0.1:8787 npm run build`, depois `npm run test:e2e` (sobe `wrangler dev`).

## Processos

- Parar servidor do Next: `pkill -f "^next-server"`. `pgrep -x` não acha; `pkill -f "next start"` mata o próprio shell.
- Nunca `pkill -f "wrangler dev"` dentro de comando composto (mata o shell que contém o texto).
- Sem `sleep` longo em primeiro plano; use processos em segundo plano e confira o estado.

## Rede

- Saída HTTPS passa por um proxy com CA própria (`/root/.ccr/ca-bundle.crt`). Não desligue verificação TLS.
- Clones: um por vez por repositório; `git fetch origin main` antes de push a partir de clone raso.
