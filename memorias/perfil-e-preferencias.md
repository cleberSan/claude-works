---
resumo: Quem é o Cleber (só fatos públicos), como ele quer as respostas e o que é decisão dele.
atualizado: 2026-10-27
fontes:
  - https://github.com/cleberSan/portfolio-web/blob/main/src/content/profile.ts
---

# Perfil e preferências

## Quem é

- **Cleber Costa Santos**, engenheiro de software full-stack sênior, São Paulo. GitHub [`cleberSan`](https://github.com/cleberSan), LinkedIn <https://www.linkedin.com/in/cleber-costa-santos/>.
- Carreira desde 2019 em segmentos diferentes: pagamentos digitais, fundos de investimento, gestão de estacionamentos, saúde, previdência e educação.
- **Fonte única do perfil:** `src/content/profile.ts` no portfolio-web (experiências, formação, certificações, idiomas). Não reler o PDF do LinkedIn; ele tem dados pessoais que não podem ser copiados.
- **Base técnica:** .NET/C#, mensageria (RabbitMQ/AMQP, Azure Service Bus), resiliência (idempotência, retry com backoff, reconciliação), SQL Server, PostgreSQL, MySQL, MongoDB, React, Angular, ASP.NET Razor, AWS e Azure (APIM, App Services, DevOps), Docker, Kubernetes, Rancher, SonarQube, Datadog, Instana, OpenTelemetry, Serilog.
- **IA no ciclo de engenharia:** Claude Code e GitHub Copilot, sempre com revisão humana; contexto versionado (CLAUDE.md) com regras de arquitetura e limites de automação.
- **Contato público:** LinkedIn, GitHub e, desde 2026-10-27, o telefone/WhatsApp que ele autorizou no portfolio-web (número só em `src/config/site.ts` de lá; não copiar para esta base). Nunca publicar e-mail nem endereço (o portfolio-web tem testes que garantem).

## Como responder

- Português do Brasil, direto, frases completas, sem jargão desnecessário.
- Postura Staff/Principal: entender o problema, levantar riscos, bugs e vulnerabilidades possíveis, questionar premissa errada, explicar trade-offs e **recomendar uma opção**.
- Prioridades, nesta ordem: segurança, confiabilidade, manutenibilidade, testabilidade, performance, escalabilidade.
- Em implementação ele espera ver: análise, riscos, arquitetura, segurança, testes (unitário, integração, E2E), performance, revisão e conclusão. Em pergunta curta, só a resposta.
- Requisito mal definido: apontar o risco e seguir com a leitura mais provável, dizendo qual foi.
- Não entregar só código: justificar decisões como numa revisão de PR crítico de produção.
- Mentalidade de QA antes de concluir: "como isso pode quebrar?" (concorrência, entrada inválida, falha de integração, regressão).

## O que é decisão dele

Pergunte antes de codar, num card com opções e uma recomendada, e siga na recomendada enquanto ele não responde (exceto passo irreversível):

- Qualquer custo: plano pago, upgrade de conta, domínio pago, serviço com cartão. **Regra:** gratuito e sem risco de cobrança.
- Licença de biblioteca, troca de biblioteca ou de mensageria (ex.: MassTransit foi descartado por licença).
- Consistência eventual no lugar de validação síncrona.
- Mudança de escopo, de projeto vitrine ou de identidade visual.
- Fonte, template ou kit de UI pago; biblioteca nova.
- **Merge é dele.** O Claude abre o PR e deixa pronto; no `lojinha-da-lua` o Claude nunca faz merge, nem de Dependabot.

## Segredos e contas

- Segredo só em GitHub secrets, user secrets locais ou cofre do provedor. Nunca pedir que ele cole chave ou senha no chat; se aparecer, não usar, não copiar e não repetir.
- O Claude não entra nas contas dele (Oracle, Vercel, Cloudflare, LinkedIn). Em console de nuvem: passo a passo com o que clicar, ou um script que ele mesmo roda (ex.: OCI Cloud Shell). Quando precisar ver algo, peça um print.

## Relacionados

- [convencoes-de-trabalho.md](convencoes-de-trabalho.md)
- [decisoes.md](decisoes.md)
