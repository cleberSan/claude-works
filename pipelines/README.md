---
resumo: Portões de qualidade e regras dos workflows do GitHub Actions, checks obrigatórios por repositório e os modelos prontos para copiar.
atualizado: 2026-10-26
---

# Pipelines

## Modelos nesta pasta

| Arquivo | Copiar para | Uso |
|---|---|---|
| [ci-dotnet.yml](ci-dotnet.yml) | `.github/workflows/ci.yml` | .NET: restore travado, format, build, testes com cobertura 80%, revisão de dependências |
| [ci-node.yml](ci-node.yml) | `.github/workflows/ci.yml` | Next.js ou Astro: audit, format, lint, tipos, cobertura, build, E2E |
| [codeql.yml](codeql.yml) | `.github/workflows/codeql.yml` | CodeQL `security-extended` (ajuste a matriz de linguagens; `actions` sempre) |
| [conferencia-producao.yml](conferencia-producao.yml) | `.github/workflows/producao.yml` | E2E diário contra produção com issue de alerta |
| [dependabot.yml](dependabot.yml) | `.github/dependabot.yml` | npm, NuGet e Actions semanais e agrupados |

O script `node scripts/iniciar-repositorio.mjs` copia os modelos certos para um repositório novo ([scripts/README.md](../scripts/README.md)).

## Regras de todo workflow

- `permissions: contents: read` no topo; escrita só no job que precisa (ex.: `issues: write` no alerta, `security-events: write` no CodeQL).
- `actions/checkout` com `persist-credentials: false`.
- **Só actions oficiais** (`actions/*`, `github/*`). Action de terceiro com tag móvel vira alerta do CodeQL; buildx e login de registry pelo próprio Docker do runner.
- `concurrency` por workflow e ref; `cancel-in-progress` no CI, nunca em deploy ou conferência de produção.
- `timeout-minutes` em todo job.
- Artefatos com `retention-days` (14 para relatórios, 30 para gravações) e `if-no-files-found` explícito.
- Agendamentos fora da hora cheia (`23 4 * * 1`, `23 9 * * *`).
- Segredo só por `secrets.*` em environment com aprovação quando é deploy; nunca ecoado.
- Glob em diretório só do root dentro do runner: `sudo bash -c '...'`.

## Checks obrigatórios (proteção do `main`)

| Repositório | Checks |
|---|---|
| careflow | `Build, formatação e testes`, `Revisão de dependências`, `CodeQL` |
| portfolio-web | `Lint, tipos, testes e build`, `Revisão de dependências`, `CodeQL` |
| lojinha-da-lua | `Lint, tipos, testes e build`, `Revisão de dependências`, `CodeQL` |
| claude-works | `Validar base e scripts`, `CodeQL` (sugerido; o Cleber configura) |

Proteção: exigir PR, checks acima, sem bypass. Aprovação obrigatória desligada (o autor dos PRs é a conta do Cleber e o GitHub não deixa aprovar o próprio PR).

## Workflows especiais que já existem

| Repositório | Workflow | Destaque |
|---|---|---|
| careflow | Imagens | 8 imagens arm64 no GHCR por commit, sem emulação |
| careflow | Stack de produção | sobe a stack de produção inteira num runner em todo PR: deploy, fumaça na 443, interruptor, backup e restauração |
| careflow | Deploy da demonstração | manual, environment `production` com aprovação, fumaça e rollback automático |
| careflow | Interruptor do Painel ao vivo | liga/desliga o Demo sem redeploy |
| careflow | Gravar respostas da triagem | chamadas reais ao modelo com teto; secret só ali |
| lojinha-da-lua | Site no ar | modelo [conferencia-producao.yml](conferencia-producao.yml) |

## Deploy dos sites

Não há workflow de deploy: Vercel e Cloudflare publicam pelo app do GitHub quando o `main` muda. Por isso a proteção do `main` é o portão de qualidade.
