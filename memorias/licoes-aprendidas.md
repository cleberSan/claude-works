---
resumo: Lições técnicas que custaram tempo (cobertura, Polly, CI, Dependabot, Oracle, cookies, LLM, imagens, Cloudflare) para não repetir.
atualizado: 2026-10-30
---

# Lições aprendidas

Cada item: o sintoma, a causa e o que fazer. Origem entre parênteses.

## .NET, testes e cobertura

- **Cobertura some no CI.** Com `ContinuousIntegrationBuild` os caminhos viram `/_/` e o coverlet descartava por "sem fontes" o assembly que era ao mesmo tempo código e teste; nada era medido e o limite de 80% falhava. Instrumentar o próprio executável de testes também derrubou o host ("Unable to get nested type properties", código 134). Saída: código medido sempre numa **biblioteca separada** do projeto de teste (ex.: `CareFlow.SmokeTests.Target`), com `excludeAssembliesWithoutSources: MissingAll`. (careflow 4978a98, 69d33b1)
- **Limite de cobertura é por módulo e por suíte.** Uma suíte que inclui `BuildingBlocks.AspNetCore` precisa exercitá-lo em ≥ 80%. Controle por projeto de teste com `testconfig.json` (include/exclude). (fase 4, fase 6)
- **Polly:** `CloseAsync` num circuito já fechado não zera as métricas de amostragem; isolar e depois fechar zera. (fase 5)
- **Estado do circuit breaker:** um provedor de estado compartilhado quebrou quando o pipeline foi construído duas vezes; leia o estado pelos callbacks de transição do Polly. (fase 6)
- **Despachante global em teste:** limpe `notification_jobs` antes de cada teste, senão um teste processa o trabalho de outro. (fase 5)
- **`.gitignore` de .NET esconde `bin/`** em qualquer lugar, inclusive `deploy/prod/bin` com scripts. Adicione exceção. (fase 9)

## GitHub Actions

- Glob em diretório só do root (`/etc/careflow/env/*.env`, 0700) precisa de `sudo bash -c '...'`; o glob expande antes do `sudo`. (fase 9)
- Action de terceiro com tag móvel é alerta do CodeQL. Use só `actions/*` e `github/*`, ou fixe por SHA. (fase 9)
- Dependabot de TypeScript 7 quebrou `npm ci` porque `@astrojs/check` exige TS ^5 ou ^6 como peer. Não dá para aceitar sem a dependência acompanhar. (lojinha)

## Dependabot e auto-merge

- **Merge feito pelo `GITHUB_TOKEN` não dispara workflows de `push`.** Auto-merge ligado por um workflow com o token padrão mescla sem rodar CI, CodeQL ou Imagens na `main`. Nos sites o deploy é pelo app do provedor e não muda; no careflow as imagens do commit não seriam publicadas e o deploy pararia. Saída: token de GitHub App. (careflow ADR-0014)
- **NU1004 em PR de NuGet.** Com Central Package Management, pinagem transitiva e `restore --locked-mode`, o Dependabot atualiza o `packages.lock.json` de quem referencia o pacote direto, mas não o de quem recebe por referência de projeto. Saída: `dotnet restore --force-evaluate` no branch, conferir que só lock files mudaram, push. (careflow ADR-0014)
- **PR só desatualizado não é refeito.** Com "branch atualizado" exigido, o Dependabot faz rebase quando há conflito, não quando a `main` andou; o segundo PR automático fica parado. Saída: um grupo de minor e patch por semana e actions em outro dia; se parar, `@dependabot rebase`.
- **Workflow novo não avalia PR antigo.** O auto-merge só decide quando o PR recebe um evento. PR aberto antes do workflow precisa de `@dependabot rebase` (ou espera a próxima rodada). (portfolio-web #23, lojinha #10)
- **Mudar o `dependabot.yml` dispara uma rodada na hora.** PRs de grupos que deixaram de existir são fechados com "no longer updatable" e voltam no formato novo. (2026-10-30)
- **`dependabot/fetch-metadata` confere só o primeiro commit.** Para decidir merge, confira pela API que todos os commits do PR são do Dependabot e têm assinatura verificada.

## Oracle Cloud (Always Free)

- Cloud Shell roda em modo FIPS e recusa `ed25519`: gere chave RSA 4096. (careflow #15)
- Always Free só vale na região principal. São Paulo tem um domínio de disponibilidade e ficou dias sem capacidade A1, nos tamanhos 2/12 e 1/6. (fase 9)
- A Oracle cortou a A1 gratuita de 4/24 para 2/12 em 2026-06-15 sem aviso. VM ociosa por 7 dias (CPU p95, rede e memória < 20%) pode ser recuperada.
- Cada chamada da CLI de lançamento leva ~1 min na E2.1.Micro (a própria CLI repete o erro de capacidade). (careflow #18, #19)

## Web

- **Cookie entre sites:** `vercel.app` e `duckdns.org` são sites diferentes, então cookie `SameSite=Strict` não vai. Sessão do Painel ao vivo virou token curto em `Authorization: Bearer`, guardado só na memória da página. (fase 9)
- **Tema sem flash** exige script inline; com CSP sem nonce, a escolha foi seguir o tema do sistema, sem botão. (portfolio-web #19)
- **Cloudflare Workers Builds:** as abas de variáveis "Production" e "Previews Base" não compartilham valores. O endereço de produção foi para o código. `wrangler preview` exige o bloco `"previews": {}` no `wrangler.jsonc`. (lojinha ADR-0008)
- **Next.js 16** reescreve o bloco de regras no `AGENTS.md` ao rodar `next dev`; commitar o bloco mantém a árvore limpa.

## Dados e IA

- **CPF sintético válido pode ser de alguém real.** Gravação publicada mascara CPF e telefone até os 2 últimos dígitos. (fase 6)
- **LLM e linguagem clínica:** a primeira gravação teve 7 justificativas citando doença como hipótese. O guard de linguagem clínica foi apertado e o prompt subiu para `triage-v2`. Meça antes de publicar. (fase 7)
- **Super-resolução inventa dígitos** em texto pequeno (Real-ESRGAN). Para áreas com telefone ou @, use Lanczos. (lojinha ADR-0009)

## Comunicação

- LinkedIn: post até 3.000 caracteres, comentário até 1.250. Entregue arquivo só com o texto.
- Hugging Face Docker Spaces passou a ser pago em julho de 2026; não serve mais como hospedagem grátis.
