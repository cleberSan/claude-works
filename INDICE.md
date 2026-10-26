<!-- Gerado por `npm run indice` a partir do resumo de cada arquivo. Não edite à mão. -->
# Índice

Uma linha por arquivo: nome, tokens estimados e resumo. Comece pelo [CLAUDE.md](CLAUDE.md) e abra só o que o assunto pede.

## Memórias (`memorias/`)

- [ambiente-cloud.md](memorias/ambiente-cloud.md) ~900: Armadilhas do container do Claude Code na nuvem e como rodar build, testes e E2E dos três projetos nele.
- [convencoes-de-trabalho.md](memorias/convencoes-de-trabalho.md) ~1,0k: Como o trabalho anda - projeto no Claude, uma thread por fase, cards de decisão, PRs, ordem de merge, entrega de textos.
- [decisoes.md](memorias/decisoes.md) ~1,8k: Linha do tempo das decisões do Cleber em todos os projetos, com o porquê e onde estão registradas.
- [licoes-aprendidas.md](memorias/licoes-aprendidas.md) ~1,2k: Lições técnicas que custaram tempo (cobertura, Polly, CI, Oracle, cookies, LLM, imagens, Cloudflare) para não repetir.
- [perfil-e-preferencias.md](memorias/perfil-e-preferencias.md) ~1,0k: Quem é o Cleber (só fatos públicos), como ele quer as respostas e o que é decisão dele.

## Projetos (`projetos/`)

- [careflow/arquitetura.md](projetos/careflow/arquitetura.md) ~2,4k: Arquitetura do CareFlow - serviços e o que cada um guarda, fluxo de eventos, segurança em camadas, observabilidade e diagrama.
- [careflow/convencoes.md](projetos/careflow/convencoes.md) ~2,0k: Convenções de código, banco, testes e cobertura do CareFlow, mais como rodar local e onde ficam as chaves de desenvolvimento.
- [careflow/fases.md](projetos/careflow/fases.md) ~1,9k: As fases 0 a 10 do CareFlow - entrega, decisões do Cleber, PRs nos dois repositórios, ADR e o que ficou para depois.
- [careflow/operacao.md](projetos/careflow/operacao.md) ~1,4k: Operação da demonstração do CareFlow - hospedagem Oracle Always Free, provisionamento, robô da A1, deploy, backup, interruptor e o que falta o Cleber fazer.
- [careflow/README.md](projetos/careflow/README.md) ~1,9k: CareFlow, o projeto vitrine - o que é, estado atual, estrutura do repositório, ADRs e por onde começar.
- [linkedin.md](projetos/linkedin.md) ~600: Presença no LinkedIn - o que já foi publicado sobre o CareFlow, onde estão os textos e vídeos, limites e regras para novos posts.
- [lojinha-da-lua.md](projetos/lojinha-da-lua.md) ~1,8k: lojinha-da-lua, catálogo de uma loja real com pedido pelo WhatsApp - stack, rotas, regras de conteúdo da loja, ADRs, deploy na Cloudflare e tarefas comuns.
- [portfolio-web.md](projetos/portfolio-web.md) ~1,9k: portfolio-web, o site pessoal em Next.js 16 - rotas, onde fica cada conteúdo, visual, testes, deploy na Vercel e tarefas comuns.

## Stacks (`stacks/`)

- [astro-cloudflare.md](stacks/astro-cloudflare.md) ~900: Padrão Astro + Cloudflare Workers do ecossistema - site estático com ilhas React, CSP por hash, catálogo validado e deploy grátis com prévia por PR.
- [dotnet.md](stacks/dotnet.md) ~1,4k: Padrão .NET do ecossistema - versões, estrutura de solução, qualidade no build, Minimal APIs, EF Core com Npgsql, resiliência, mensageria e o que evitar.
- [hospedagem-gratuita.md](stacks/hospedagem-gratuita.md) ~900: Onde hospedar de graça e sem risco de cobrança - Vercel, Cloudflare, Oracle Always Free, GitHub, DuckDNS - com limites, regras de uso e o que já foi descartado.
- [ia-aplicada.md](stacks/ia-aplicada.md) ~800: Como o ecossistema usa LLM em produto (triagem do CareFlow) e no desenvolvimento - modelo, SDK, guardrails, gravações, avaliação e custos.
- [nextjs.md](stacks/nextjs.md) ~900: Padrão Next.js do ecossistema - Next 16 com App Router, conteúdo tipado, MDX, CSP sem nonce, SEO, acessibilidade e testes.
- [observabilidade.md](stacks/observabilidade.md) ~600: Padrão de observabilidade - OpenTelemetry ponta a ponta, trace atravessando o broker, métricas de negócio, redação de PII e stack local gratuita.
- [seguranca.md](stacks/seguranca.md) ~1,2k: Padrões de segurança aplicados nos projetos - OWASP Top 10 na prática, cabeçalhos e CSP, isolamento, criptografia, segredos, supply chain e LGPD.
- [testes.md](stacks/testes.md) ~1,0k: Estratégia de testes do ecossistema - pirâmide por stack, cobertura de 80% medida certo, concorrência, segurança, E2E com axe e o que cada camada prova.

## APIs (`apis/`)

- [careflow.md](apis/careflow.md) ~1,3k: Catálogo da API do CareFlow - endpoints e escopos de cada serviço, eventos de integração e categorias de retenção.
- [externas.md](apis/externas.md) ~900: Serviços e APIs de terceiros usados nos projetos - para quê, como autentica, onde fica a credencial e cuidados.
- [padroes-http.md](apis/padroes-http.md) ~1,1k: Padrões para APIs HTTP no ecossistema - rotas, escopos, multi-tenant, erros ProblemDetails com código estável, idempotência, concorrência, paginação e limites.

## Snippets (`snippets/`)

- [dotnet/idempotencia.md](snippets/dotnet/idempotencia.md) ~1,6k: Criação idempotente com Idempotency-Key, impressão digital do corpo e constraint no banco, tratando a corrida entre retentativas, como na reserva do CareFlow.
- [dotnet/outbox-inbox.md](snippets/dotnet/outbox-inbox.md) ~1,0k: Outbox transacional e Inbox idempotente sobre RabbitMQ.Client, como no CareFlow - tabelas, SQL do despachante, processamento e garantias.
- [dotnet/result-e-problemdetails.md](snippets/dotnet/result-e-problemdetails.md) ~1,6k: Result Pattern (Result, Result<T>, Error, ErrorType) e conversão para ProblemDetails RFC 9457 com código estável, como no CareFlow.
- [dotnet/rls-por-clinica.md](snippets/dotnet/rls-por-clinica.md) ~1,2k: Row-Level Security por clínica no PostgreSQL com EF Core - interceptor que grava app.tenant_id, extensões de migration e regras de papéis.
- [typescript/cabecalhos-e-csp.md](snippets/typescript/cabecalhos-e-csp.md) ~1,1k: Cabeçalhos de segurança e CSP em TypeScript - versão sem nonce do Next.js (portfolio-web) e versão por hash do Astro (lojinha), com fonte única e testes.
- [typescript/estado-no-localstorage.md](snippets/typescript/estado-no-localstorage.md) ~1,3k: Estado de ilha React guardado no localStorage com leitura defensiva e useSyncExternalStore, sem biblioteca de estado, como o Montar pedido da lojinha.
- [typescript/playwright-axe.md](snippets/typescript/playwright-axe.md) ~1,0k: Configuração Playwright dos sites - build de produção, desktop e mobile, axe nos dois temas, falha com erro de console (pega CSP) e backend simulado.

## Modelos (`templates/`)

- [adr-0000.md](templates/adr-0000.md) ~300: ADR-0000 pronto para repositório novo (registrar decisões com ADR), usado pelo iniciar-repositorio. Variáveis NOME, DATA.
- [adr.md](templates/adr.md) ~200: Modelo de ADR no formato dos repositórios (Status, Data, Contexto, Decisão, Alternativas, Consequências). Variáveis NUMERO, TITULO, DATA.
- [agente.md](templates/agente.md) ~200: Modelo de subagente para .claude/agents/<nome>.md (name, description, tools, papel, entradas, saídas, limites). Variáveis NOME, DESCRICAO.
- [arquivo-da-base.md](templates/arquivo-da-base.md) ~100: Modelo genérico para um arquivo novo da base (memorias, stacks, apis, snippets) com front matter e seções enxutas. Variáveis TITULO, RESUMO, DATA.
- [cartao-projeto.md](templates/cartao-projeto.md) ~300: Modelo de cartão de projeto para projetos/ (o que é, estado, stack, rotas ou serviços, ADRs, testes, deploy, tarefas comuns, pendências). Variáveis NOME, RESUMO, DATA, REPO.
- [checklist-api.md](templates/checklist-api.md) ~600: Checklist para um serviço ou endpoint .NET novo - contrato, autorização, multi-tenant, erros, idempotência, dados, mensageria, observabilidade e testes.
- [checklist-site.md](templates/checklist-site.md) ~700: Checklist para um site novo no padrão do ecossistema - segurança, SEO, acessibilidade, testes, privacidade, deploy gratuito e conferência em produção.
- [decisoes-fase.md](templates/decisoes-fase.md) ~300: Modelo do fase-N-decisoes.md (pasta do projeto) - fatos verificados, perguntas em card, respostas, entrega e riscos. Variáveis FASE, TITULO, DATA.
- [post-diario.mdx](templates/post-diario.mdx) ~400: Modelo de post do diário do portfolio-web (MDX começando em ##, seções do problema ao próximo passo) e a entrada em posts.ts. Variáveis FASE, SLUG, TITULO, DESCRICAO, DATA.
- [prompt-fase.md](templates/prompt-fase.md) ~400: Modelo do prompt-fase-N.md que o Cleber cola no chat do projeto para abrir a próxima fase. Variáveis PROJETO, FASE, TITULO.
- [pull-request.md](templates/pull-request.md) ~300: Corpo de PR no padrão dos repositórios (Antes, Depois, Como, Checklist), com riscos, testes e ordem de merge.
- [readme-repositorio.md](templates/readme-repositorio.md) ~300: Modelo de README de repositório novo no padrão do ecossistema (badges, propósito, o que tem, qualidade, decisões, como rodar, licença). Variáveis NOME, DONO, DESCRICAO, STACK.
- [security.md](templates/security.md) ~200: SECURITY.md padrão para repositório novo (reporte privado, escopo, práticas), usado pelo iniciar-repositorio. Variáveis DONO, NOME.
- [skill.md](templates/skill.md) ~200: Modelo de SKILL.md para .claude/skills/<nome>/ (front matter name e description, quando usar, passos, regras, saída). Variáveis NOME, DESCRICAO.

## Pipelines (`pipelines/`)

- [ci-dotnet.yml](pipelines/ci-dotnet.yml) ~600: CI .NET no padrão do careflow - restore travado, format, build, testes com cobertura mínima de 80% e revisão de dependências.
- [ci-node.yml](pipelines/ci-node.yml) ~700: CI Node (Next.js ou Astro) no padrão dos sites - audit, format, lint, tipos, cobertura 80%, build, E2E com Playwright e revisão de dependências.
- [codeql.yml](pipelines/codeql.yml) ~300: CodeQL security-extended para a linguagem do repositório e para os próprios workflows, em push, PR e semanalmente.
- [conferencia-producao.yml](pipelines/conferencia-producao.yml) ~800: Roda a suíte E2E todo dia contra o site publicado e abre (ou comenta) uma issue quando a execução agendada falha.
- [dependabot.yml](pipelines/dependabot.yml) ~200: Dependabot semanal agrupado para npm, NuGet e GitHub Actions, no padrão dos repositórios.
- [README.md](pipelines/README.md) ~1,0k: Portões de qualidade e regras dos workflows do GitHub Actions, checks obrigatórios por repositório e os modelos prontos para copiar.

## Fluxos de agentes (`agents/`)

- [fluxo-atualizar-base.md](agents/fluxo-atualizar-base.md) ~300: Fluxo para manter esta base atualizada depois de PRs mesclados, decisões e lições, inclusive como rotina agendada.
- [fluxo-conteudo.md](agents/fluxo-conteudo.md) ~300: Fluxo para produzir conteúdo público (post do diário, LinkedIn, resposta a comentário) com fatos conferidos, limites de caracteres e entrega em arquivo.
- [fluxo-correcao-bug.md](agents/fluxo-correcao-bug.md) ~300: Fluxo de correção de bug sem suposição - evidência, hipóteses por probabilidade, reprodução por teste, causa raiz, correção, regressão e prevenção.
- [fluxo-fase.md](agents/fluxo-fase.md) ~600: Fluxo de uma fase de projeto com agentes - pesquisa, cards, implementação no careflow, QA, segurança, revisão, PR do site, conteúdo e atualização da base.
- [fluxo-revisao-pr.md](agents/fluxo-revisao-pr.md) ~300: Fluxo de revisão de PR com agentes em paralelo (segurança, Staff, QA), consolidação de achados e correção antes de pedir a revisão do Cleber.
- [README.md](agents/README.md) ~900: Fluxos de agentes autônomos do ecossistema - quais agentes existem, como se encadeiam, onde o humano aprova e quando parar.

## Skills do Claude Code (`.claude/skills/`)

- [analise-staff](.claude/skills/analise-staff/SKILL.md) ~500: Estrutura uma resposta de implementação no padrão que o Cleber pede (Análise, Riscos, Arquitetura, Implementação, Segurança, Testes, Performance, Code Review, Conclusão) com trade-offs e uma recomendação.
- [investigar-bug](.claude/skills/investigar-bug/SKILL.md) ~400: Investiga e corrige bug sem suposição - evidência, hipóteses por probabilidade, reprodução por teste, causa raiz, correção, regressão e prevenção - no padrão que o Cleber pede.
- [kb-atualizar](.claude/skills/kb-atualizar/SKILL.md) ~600: Atualiza a base claude-works do Cleber depois de uma entrega, decisão ou lição - fato no arquivo certo, índice, validação e PR. Use ao fim de cada fase ou PR relevante e quando ele pedir para registrar algo.
- [nova-fase](.claude/skills/nova-fase/SKILL.md) ~600: Conduz uma fase de projeto do Cleber (ex.: fase 10 do CareFlow) do prompt colado até os PRs no careflow e no site, com cards de decisão, ADR, post do diário e o prompt da fase seguinte.
- [novo-adr](.claude/skills/novo-adr/SKILL.md) ~500: Escreve um ADR no formato dos repositórios do Cleber (docs/adr/NNNN-titulo.md com Status, Data, Contexto, Decisão, Alternativas, Consequências). Use quando uma decisão de arquitetura, segurança, dados ou operação for tomada ou mudar.
- [novo-repositorio](.claude/skills/novo-repositorio/SKILL.md) ~500: Prepara um repositório novo do Cleber no padrão do ecossistema - CI, CodeQL, Dependabot, template de PR, CODEOWNERS, ADR-0000, README, CONTRIBUTING e SECURITY - e lista o que só ele pode configurar no GitHub.
- [texto-linkedin](.claude/skills/texto-linkedin/SKILL.md) ~400: Escreve post ou resposta de comentário para o LinkedIn do Cleber com fatos conferidos nos repositórios, dentro do limite de caracteres, entregue como arquivo só com o texto.

## Subagentes do Claude Code (`.claude/agents/`)

- [curador-kb](.claude/agents/curador-kb.md) ~400: Atualiza a base claude-works depois de uma entrega - estado do projeto, decisões, lições, APIs, índice - mantendo arquivos curtos, públicos e validados. Use ao fim de cada fase, PR relevante ou decisão do Cleber.
- [guardiao-seguranca](.claude/agents/guardiao-seguranca.md) ~500: Revisão de segurança e privacidade de um diff - segredos, dados pessoais, OWASP Top 10, autorização por clínica, RLS, CSP e cabeçalhos, supply chain e licenças. Bloqueia o PR quando acha problema real.
- [implementador](.claude/agents/implementador.md) ~500: Implementa uma mudança com escopo fechado num dos repositórios seguindo as convenções da base (fatias verticais, Result, RLS, testes AAA, cobertura 80%), roda build e testes e devolve o diff pronto para revisão.
- [pesquisador-fatos](.claude/agents/pesquisador-fatos.md) ~500: Levanta e confere fatos externos com fonte e data (limites de plano gratuito, licenças de pacotes, preços, versões, mudanças de API) antes de uma decisão. Use antes de cards de decisão e de ADRs.
- [qa-destrutivo](.claude/agents/qa-destrutivo.md) ~500: Tenta quebrar uma mudança antes do PR - concorrência, entrada inválida, acesso de outra clínica, falha de dependência, regressão - e escreve os testes que provam o problema. Use depois do implementador e antes da revisão.
- [redator-tecnico](.claude/agents/redator-tecnico.md) ~400: Escreve post do diário do site, texto para o LinkedIn ou resposta a comentário a partir de fatos conferidos no código e nos ADRs, dentro dos limites de caracteres. Use no fim de fase ou quando o Cleber pedir texto para publicar.
- [revisor-staff](.claude/agents/revisor-staff.md) ~500: Revisão de PR com olhar de engenheiro Staff - corretude, arquitetura (Vertical Slices + DDD), testes, performance, observabilidade, legibilidade e aderência às convenções da base. Use antes de pedir a revisão do Cleber.

## Scripts (`scripts/`)

- [README.md](scripts/README.md) ~1,4k: Scripts da base (validar, indice, tokens, modelo, iniciar-repositorio, ambiente-cloud) e módulos de utils/ - uso, opções, códigos de saída e como estender.

## Docs (`docs/`)

- [adr/0000-registrar-decisoes-com-adr.md](docs/adr/0000-registrar-decisoes-com-adr.md) ~200: ADR-0000 da base - decisões sobre a própria base viram ADR, no mesmo formato dos outros repositórios.
- [adr/0001-base-em-camadas-e-publica.md](docs/adr/0001-base-em-camadas-e-publica.md) ~700: ADR-0001 da base - leitura em camadas para gastar poucos tokens, conteúdo só público, português, índice gerado e validador sem dependências no CI.
- [glossario.md](docs/glossario.md) ~1,0k: Glossário do ecossistema - termos de domínio, segurança, mensageria e operação usados nos projetos, com o nome no código.

Total: 75 arquivos, ~60,2k tokens. Ler tudo raramente compensa.
