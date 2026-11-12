---
resumo: cesta-certa, comparador da compra do mês entre mercados próximos - estado por PR, stack, rotas, dados só no aparelho, ADRs, deploy na Cloudflare e pendências.
atualizado: 2026-11-12
fontes:
  - https://github.com/cleberSan/cesta-certa
---

# cesta-certa

**Cesta Certa**: site feito primeiro para o celular que compara o preço da lista de compras do mês entre os mercados próximos, pelo objetivo de quem compra, e abre a rota no Waze ou no Google Maps. É de uso próprio do Cleber e peça do portfólio (localização com privacidade, dados só no aparelho, otimizador determinístico, IA com custo limitado). Repositório <https://github.com/cleberSan/cesta-certa>, MIT. **Em construção:** [spec 0001](https://github.com/cleberSan/cesta-certa/blob/main/docs/specs/0001-mvp-compra-do-mes/spec.md) (40 critérios de aceite, SDD completo) aprovada em 2026-11-10; o MVP entra em cinco PRs de código.

## Regras do produto (não negociáveis)

- **Preço só de fonte própria:** nota fiscal de quem usa (NFC-e pelo QR Code) e preço digitado no mercado, sempre com fonte e data. Sem raspagem de site de mercado e sem prometer "preço de hoje". Primeiro leitor de nota: São Paulo; cada UF tem página própria.
- **Dados da pessoa só no aparelho** (ADR-0002): lista, preços e ponto escolhido ficam no IndexedDB; nenhuma rota do servidor os recebe e as coordenadas não saem do aparelho.
- **Sem cidade fixa:** o app pergunta a localização a quem abre, explica o motivo e só pede ao navegador depois de um toque; quem nega escolhe a cidade ou marca um ponto.
- **Assistente com Claude pelo servidor, só para o dono:** código de acesso, 30 perguntas por dia e 300 por mês, aceite antes de enviar a lista. Chave e código só como segredos do Worker. Visitantes veem respostas gravadas.
- Mercados vêm do OpenStreetMap (ODbL, com atribuição). A demonstração pública usa mercados e preços fictícios.
- Bibliotecas aprovadas junto com a spec, ainda não instaladas: `maplibre-gl`, `@anthropic-ai/sdk` e um leitor de QR Code. Qualquer outra pede pergunta antes.

## Estado (2026-11-12)

| PR | Tarefas | Conteúdo | Estado |
|---|---|---|---|
| #1 | T00 | Spec, plano, tarefas e base de documentação | Mesclado 2026-11-10 |
| #2 | T01 a T03 | CI, esqueleto Astro + Worker de `/api`, consulta da NFC-e de SP em `/nota`, ADR-0001 | Mesclado 2026-11-11; T03 aberta até o teste com nota real em produção |
| #5 | T04, T05 | Lista em `/lista`, exportar e importar em `/dados`, ADR-0002 | Mesclado 2026-11-12 |
| 3 de 5 | T06 a T10 | Base nacional de mercados, localização, mercado próprio, rota, mapa, ADR-0005 | Em andamento |
| 4 de 5 | T11 a T13 | Nota fiscal no app, preço digitado, preço por unidade | A fazer |
| 5 de 5 | T14 a T19 | Objetivo e ranking, assistente, demonstração, offline, fechamento | A fazer |

A ordem e o que cada tarefa cobre estão em [tarefas.md](https://github.com/cleberSan/cesta-certa/blob/main/docs/specs/0001-mvp-compra-do-mes/tarefas.md). O critério CA-04 (cópia completa dos dados) fica parcial até os armazéns de mercados e preços entrarem.

## Stack

Astro **7.4** estático (`build.format: "file"`, CSP por hash), React **19** em ilhas (`client:load`), TypeScript 6 com `astro/tsconfigs/strictest`, um **Worker da Cloudflare só para `/api`** (`run_worker_first`; arquivo estático não executa código), Wrangler 4, Vitest 5, Playwright 1.64 + axe (WCAG 2.2 AA, desktop e Pixel 7), ESLint 10, Node **24**. Sem biblioteca de armazenamento. Ver [stacks/astro-cloudflare.md](../stacks/astro-cloudflare.md).

## Rotas

| Rota | Conteúdo |
|---|---|
| `/` | Apresentação e o que já dá para testar |
| `/lista` | Lista do mês (ilha): criar, editar, duplicar, aviso de item repetido; `noindex` |
| `/dados` | Exportar e importar a cópia das listas em arquivo (ilha); `noindex` |
| `/nota` | Página de teste da consulta de NFC-e, com diagnóstico técnico; `noindex` |
| `/privacidade`, `/sobre` | O que fica no aparelho e o que passa pelo servidor; o projeto |
| `POST /api/nfce/consultar` | Busca a página pública da nota na Sefaz e devolve itens e preços. Só a própria origem, lista de endereços por UF, 8 s, 512 KB, 2 redirecionamentos; erros em `application/problem+json` com `traceId` |

## Estrutura

```
src/features/lista/         domínio puro da lista (lista.ts), sessão com fila (sessao.ts), telas
src/features/dados/         cópia em arquivo: copia.ts, textos.ts, SeusDados.tsx
src/features/precos/nfce/   cliente da consulta e tela de teste
src/shared/armazenamento/   porta Banco (banco.ts), indexeddb.ts, memoria.ts, migracoes.ts, arquivo.ts
src/shared/                 resultado, dinheiro, texto, identificador, seo, contratos/ (tipos da API)
src/config/                 site.ts (productionSiteUrl, noindexPaths), security.ts (CSP e cabeçalhos)
worker/                     index.ts, api.ts, http/, observabilidade/, nfce/ (ufs/sp.ts é o leitor de SP)
e2e/                        specs por tela; fixtures.ts falha com erro de console e com requisição a outra origem
docs/specs/, docs/adr/      spec 0001 (spec, plano, tarefas) e ADRs
```

## Dados no aparelho (ADR-0002)

- IndexedDB `cesta-certa`, **versão 1 só com `listas` e `itens`**. `mercadosProprios` (T08), `associacoes` (T11) e `observacoesDePreco` (T12) entram cada um por migração nova no PR da sua tarefa; migração publicada não se edita.
- As fatias falam com a porta `Banco` (`lerTudo`, `aplicar`, `substituirTudo`). O adaptador do IndexedDB fica fora da cobertura de unidade e é provado pelo E2E.
- Registro lido do aparelho ou de arquivo é reconstruído campo a campo. Leitura do aparelho tolera registro ruim (fica de fora, a tela avisa, nada é apagado); importação é rígida (um registro inválido recusa o arquivo).
- Cópia: JSON `{ app, versao, exportadoEm, dados }`, até 5 MB, lido e gerado no aparelho. Importar substitui tudo numa transação, depois de confirmação, e avisa as outras abas por `BroadcastChannel`. Armazém novo sobe a versão do arquivo e o app continua lendo as anteriores.
- Rollback de deploy depois de uma migração: o app antigo não abre o banco mais novo e pede para recarregar; nada se perde, mas a lista fica indisponível até o app novo voltar.

## ADRs

| ADR | Decisão |
|---|---|
| 0000 | Registrar decisões com ADR |
| 0001 | Astro estático com ilhas React e um Worker da Cloudflare para a API; custo zero |
| 0002 | Dados da pessoa só no aparelho, IndexedDB com migração versionada, cópia por arquivo |
| 0003 (planejado) | Fontes de preço do MVP: nota fiscal própria e digitado, sem raspagem |
| 0004 (planejado) | Assistente pelo servidor, código de acesso, limites e respostas gravadas |
| 0005 (PR 3) | Mapa com MapLibre e OpenFreeMap; base mensal do OSM em células; pedido de localização |

## Testes, CI e deploy

- Checks obrigatórios: `Lint, tipos, testes e build`, `Revisão de dependências`, `CodeQL`. O CI roda auditoria de produção, format, lint, `astro check`, Vitest com 80%, build e E2E sobre `wrangler dev`.
- Cada critério de aceite tem teste marcado com `// spec 0001 CA-NN`; uma tarefa por commit, cada commit verde.
- Em 2026-11-12: 862 testes de unidade e 282 E2E (desktop e celular). Safari e Firefox não estão no CI.
- **Cloudflare Workers Builds** pelo app da Cloudflare: a `main` publica; cada branch gera prévia, e o endereço chega num comentário da Cloudflare no PR alguns minutos depois do build. Endereço de produção em `productionSiteUrl` (`src/config/site.ts`).
- O container do Claude não alcança `workers.dev`: produção e prévia são conferidas pelo Cleber, por print.
- Rollback: **Deployments** no painel do Worker (ver a ressalva de migração acima).
- Dependabot semanal com cooldown de 7 dias; sem auto-merge decidido neste repositório.

## Tarefas comuns

- **Rodar local:** `SITE_URL=http://127.0.0.1:8787 npm run build` e depois `npm run test:e2e`; sempre refaça o build antes do E2E.
- **Armazém novo:** migração nova em `migracoes.ts` + versão nova em `arquivo.ts` (lendo a anterior) + testes, no mesmo commit.
- **Leitor de nota de outra UF:** `worker/nfce/ufs/<uf>.ts` com fixture sintética e o endereço da Sefaz na lista permitida de `ufs/indice.ts`.
- **Rota nova:** `e2e/routes.ts` (rotas, `noindex`, páginas com ilha) e `noindexPaths` em `src/config/site.ts`.
- **Texto de tela:** fica em `textos.ts` da fatia, testado; mensagem de recusa diz o que aconteceu e que nada foi alterado.

## Pendências

- **Cleber:** testar `/nota` em produção com uma nota real e mandar o print (fecha a T03; o leitor de SP só foi provado com página sintética).
- **Cleber:** decidir os PRs do Dependabot abertos em 2026-11-12 (#3 agrupado, #4 TypeScript 7; `@astrojs/check` aceita só TS 5 ou 6).
- A API ainda não tem limite de requisições; conferir o binding de rate limiting no plano grátis antes do PR 4.
- Antes da T16, o Cleber cria a chave da Anthropic e o código de acesso como segredos do Worker (nunca no chat).
- Conferência agendada contra a produção entra na T19.
