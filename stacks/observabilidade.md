---
resumo: Padrão de observabilidade - OpenTelemetry ponta a ponta, trace atravessando o broker, métricas de negócio, redação de PII e stack local gratuita.
atualizado: 2026-10-26
fontes:
  - https://github.com/cleberSan/careflow/blob/main/docs/adr/0010-observabilidade-e-painel-de-privacidade.md
---

# Observabilidade

## Princípios

- **Um trace por fluxo de negócio**, inclusive através do broker: o `traceparent` viaja no envelope do Outbox até o Inbox.
- **Telemetria sem dado pessoal**, provada por teste que varre o que foi exportado.
- Métrica de negócio, não só técnica: reservas, conflitos, replays, inelegíveis, fallbacks, estado do circuito, Outbox pendente, mensagens mortas, propagação da revogação.
- Logs estruturados com `LoggerMessage` gerado; sem interpolação; correlação pelo trace.

## .NET

- `AddCareFlowObservability(nomeDoServiço, meterName)` (building block) liga traces, métricas e logs; exporta OTLP quando `OTEL_EXPORTER_OTLP_ENDPOINT` existe.
- Instrumentação: ASP.NET Core, HttpClient, Npgsql (`Npgsql.OpenTelemetry`), spans próprios `CareFlow.Messaging` de publicação e consumo.
- Redação no serviço (`TelemetryRedaction`) e de novo no Collector; baggage vindo de fora é descartado; consultas sem pai filtradas.
- Health: `/health/live` e `/health/ready`; canal degradado em `/health/channels` (Notifications).

## Stack local e na VM (gratuita)

- OpenTelemetry Collector → Tempo (traces), Loki (logs), Prometheus (métricas) → Grafana com dashboards versionados em `deploy/observability/grafana`.
- Imagens AGPL usadas sem modificação, só local e na VM; Grafana na VM só por túnel SSH, retenção de 3 dias.
- Grafana Cloud Free foi avaliado (10 mil séries, 50 GB de logs e traces, 14 dias) e preterido para manter tudo na VM.

## Sites

- Sem backend (lojinha): monitoramento é a suíte E2E agendada contra produção, que abre issue na falha.
- Painel do portfolio-web mostra trace (cascata), logs mascarados e estado de resiliência a partir da gravação do CI.

## Checklist

Fluxo novo tem span e métrica? O atributo pode carregar PII? O log tem o nível certo e nenhum dado pessoal? Há dashboard ou alerta para a falha que importa? O teste de varredura de PII cobre o fluxo?
