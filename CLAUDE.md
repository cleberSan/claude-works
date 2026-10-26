# claude-works

Base de conhecimento do ecossistema de desenvolvimento de Cleber Costa Santos. Consulte aqui antes de reler históricos de conversa, threads ou repositórios inteiros. O repositório é **público**: só entram fatos que podem estar na internet.

## Como ler (economia de tokens)

1. Se os fatos-chave abaixo respondem, pare aqui.
2. Senão, abra o [INDICE.md](INDICE.md) (uma linha por arquivo, gerado) e leia **só** o arquivo do assunto. Todo arquivo começa com `resumo:` e `atualizado:`; para triagem, `head -5` basta.
3. Detalhe de decisão mora no ADR do repositório de origem; os cartões de projeto trazem o link. Abra o ADR só para citar ou conferir.
4. Isto é um retrato com data (`atualizado:`). Antes de afirmar estado de PR, versão, deploy ou CI, confira no repositório.

## Fatos-chave

- **Dono:** Cleber Costa Santos, GitHub `cleberSan`, engenheiro full-stack sênior (.NET, mensageria, React/Angular, AWS/Azure). Escreve em português; quer postura Staff: riscos, segurança, testes, observabilidade e trade-offs com uma recomendação.
- **Repositórios** (públicos, `main` protegido, PR com CI verde, sem bypass):
  - `careflow`: projeto vitrine. Agenda multi-clínica e triagem com IA, privacidade por design (LGPD), dados 100% sintéticos. .NET 10, PostgreSQL, RabbitMQ, OpenTelemetry. Fases 0 a 9 concluídas, 10 planejada.
  - `portfolio-web`: site pessoal (Next.js 16) com diário de bordo e o Painel do CareFlow. https://portfolio-web-psi-rust.vercel.app
  - `lojinha-da-lua`: catálogo de uma loja real com pedido pelo WhatsApp (Astro 7 + ilha React, Cloudflare). https://lojinha-da-lua.clebersan.workers.dev
  - `claude-works`: esta base.
- **Checks obrigatórios:** careflow `Build, formatação e testes`; sites `Lint, tipos, testes e build`; todos `Revisão de dependências` e `CodeQL`. Cobertura mínima de 80%.
- **Regras que valem sempre:**
  - Custo zero: hospedagem e serviços gratuitos, sem risco de cobrança. Nada pago, upgrade de conta, licença restritiva, troca de biblioteca ou mudança de escopo sem perguntar antes, com uma opção recomendada.
  - Segredo só em GitHub secrets ou cofre do provedor. Nunca pedir chave ou senha no chat; o Claude não entra nas contas dele.
  - Toda decisão de arquitetura, segurança, dados ou operação vira ADR (`docs/adr/NNNN-titulo.md`).
  - Só dados sintéticos; nenhuma promessa clínica ou jurídica; dado de terceiro só da fonte dele.
  - O CareFlow é **Vertical Slices + DDD** (ADR-0001). Nunca dizer que usa Clean Architecture.
  - Contato público do Cleber: só LinkedIn e GitHub.

## Mapa

| Pasta | Para quê | Comece por |
|---|---|---|
| `memorias/` | Perfil, convenções de trabalho, decisões, lições, ambiente | `convencoes-de-trabalho.md` |
| `projetos/` | Um cartão por projeto, com fases, ADRs e pendências | `careflow/README.md` |
| `stacks/` | .NET, Next.js, Astro, testes, segurança, observabilidade, hospedagem, IA | o da tecnologia |
| `apis/` | Padrões HTTP, catálogo do CareFlow, APIs externas | `padroes-http.md` |
| `snippets/` | Código real dos projetos, recortado e comentado | o do padrão |
| `templates/` | ADR, PR, prompt de fase, decisões, cartão de projeto, checklists | o do artefato |
| `pipelines/` | Workflows do GitHub Actions prontos para copiar | `README.md` |
| `agents/` | Fluxos de agentes autônomos (quem faz o quê, quando parar) | `README.md` |
| `.claude/skills/`, `.claude/agents/` | Skills e subagentes que o Claude Code carrega | `INDICE.md` |
| `scripts/`, `utils/` | Validador, índice, gerador de modelos, novo repositório, ambiente | `scripts/README.md` |
| `docs/` | ADRs e glossário desta base | `glossario.md` |

## Como escrever aqui

- Um assunto por arquivo, no lugar certo do mapa. Arquivo novo parte de um modelo em `templates/` (via `npm run modelo`).
- Fato, não narrativa: listas, tabelas, links. Até 16 KB por arquivo; passou, divida.
- Front matter com `resumo:` (uma linha) e `atualizado: AAAA-MM-DD`. Depois, `npm run indice`.
- Prefira link para o ADR ou doc do repositório a copiar conteúdo.
- **Nunca:** segredo, chave, OCID, e-mail, telefone ou endereço de pessoa ou loja, CPF (mesmo sintético), assunto pessoal de carreira, incidente com credencial. O CI barra parte disso; o resto é com você.
- Antes do PR: `npm run validar && npm test`. Mudança entra por PR revisado pelo Cleber (skill `kb-atualizar`).
