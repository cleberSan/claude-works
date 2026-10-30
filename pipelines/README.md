---
resumo: Portões de qualidade e regras dos workflows do GitHub Actions, checks obrigatórios por repositório, Dependabot com auto-merge criterioso e os modelos prontos para copiar.
atualizado: 2026-10-30
---

# Pipelines

## Modelos nesta pasta

| Arquivo | Copiar para | Uso |
|---|---|---|
| [ci-dotnet.yml](ci-dotnet.yml) | `.github/workflows/ci.yml` | .NET: restore travado, format, build, testes com cobertura 80%, revisão de dependências |
| [ci-node.yml](ci-node.yml) | `.github/workflows/ci.yml` | Next.js ou Astro: audit, format, lint, tipos, cobertura, build, E2E |
| [codeql.yml](codeql.yml) | `.github/workflows/codeql.yml` | CodeQL `security-extended` (ajuste a matriz de linguagens; `actions` sempre) |
| [conferencia-producao.yml](conferencia-producao.yml) | `.github/workflows/producao.yml` | E2E diário contra produção com issue de alerta |
| [dependabot.yml](dependabot.yml) | `.github/dependabot.yml` | npm e Actions semanais, NuGet mensal, cooldown de 7 dias, grupos |
| [dependabot-auto-merge.yml](dependabot-auto-merge.yml) | `.github/workflows/dependabot-auto-merge.yml` | Auto-merge só do que é de baixo risco (sites); troque o repositório no `if` e o `FRAMEWORK` |

O script `node scripts/iniciar-repositorio.mjs` copia os modelos certos para um repositório novo ([scripts/README.md](../scripts/README.md)). O auto-merge do Dependabot não entra no script: copie à mão quando o repositório tiver deploy pela `main` e checks que bastem.

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

## Dependabot e auto-merge (2026-10-30)

Nenhum repositório exige aprovação; o PR do Dependabot só esperava alguém clicar em mesclar. Nos sites, o workflow [dependabot-auto-merge.yml](dependabot-auto-merge.yml) liga o auto-merge do GitHub, que mescla (squash) só depois de todos os checks obrigatórios.

| Atualização | Destino |
|---|---|
| Patch ou minor de pacote npm | auto-merge |
| Patch do framework; minor do framework (`FRAMEWORK`: Next, React, Tailwind no portfolio-web; Astro, `@astrojs/*`, React na lojinha) | auto-merge; minor fica manual |
| Major de qualquer pacote | manual |
| Actions oficiais (`actions/*`, `github/*`), qualquer versão | auto-merge |
| Action de terceiros, o próprio `dependabot/fetch-metadata`, troca de mantenedores | manual |
| Commit de outra pessoa ou sem assinatura, metadados ilegíveis, tipo desconhecido | manual, e o auto-merge é desligado |

| Repositório | Política | ADR |
|---|---|---|
| portfolio-web | npm segunda 5h, actions quarta 5h, auto-merge | [0007](https://github.com/cleberSan/portfolio-web/blob/main/docs/adr/0007-dependabot-com-auto-merge.md) |
| lojinha-da-lua | npm segunda 4h (antes da conferência das 6h23), actions quarta 5h, auto-merge | [0010](https://github.com/cleberSan/lojinha-da-lua/blob/main/docs/adr/0010-dependabot-com-auto-merge.md) |
| careflow | NuGet e actions mensais, grupos (OpenTelemetry, FHIR, testes, `dotnet`), SDKs da Anthropic e da Oracle, `RabbitMQ.Client` e `Newtonsoft.Json` em PR próprio, **sem auto-merge** | [0014](https://github.com/cleberSan/careflow/blob/main/docs/adr/0014-atualizacao-de-dependencias-sem-auto-merge.md) |
| claude-works | Actions semanais, merge manual | — |

- **Desenho do workflow:** `pull_request` (nunca `pull_request_target`), sem checkout, `permissions: {}` no topo e escrita só no job; `fetch-metadata` fixado por SHA; confere pela API que **todos** os commits são do Dependabot e assinados (o `fetch-metadata` olha só o primeiro); `gh pr merge --auto --squash --match-head-commit`; a decisão e o motivo vão para o resumo do job.
- **Só o dono liga:** Settings → General → Pull Requests → **Allow auto-merge** (ligado em portfolio-web e lojinha em 2026-10-30). Opcional: exigir o check do provedor (`Vercel`, `Workers Builds: lojinha-da-lua`).
- **Pausar:** desligar Allow auto-merge ou desativar o workflow. **Desfazer:** rollback no provedor e `git revert` do squash.
- **Por que o careflow não tem:** lock files (NU1004, ver [lições](../memorias/licoes-aprendidas.md)) e o merge pelo `GITHUB_TOKEN` não dispara o workflow Imagens, então o deploy pararia. Caminho registrado no ADR-0014: um GitHub App do Cleber (decisão dele).

## Deploy dos sites

Não há workflow de deploy: Vercel e Cloudflare publicam pelo app do GitHub quando o `main` muda. Por isso a proteção do `main` é o portão de qualidade.
