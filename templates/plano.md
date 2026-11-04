<!-- resumo: Modelo de plano (SDD) para docs/specs/NNNN-titulo/plano.md - como atender a spec: contexto, fatos, desenho, contratos, segurança, observabilidade, teste por critério, riscos e rollback. Variáveis DATA, NUMERO, TITULO. -->
# Plano {{NUMERO}}: {{TITULO}}

- Spec: [spec.md](spec.md)
- Data: {{DATA}}

## Contexto técnico

<!-- O que já existe e restringe a solução: serviços, arquivos, ADRs vigentes (com link). -->

## Fatos verificados

<!-- Fato externo com fonte e data: limite de plano, licença, versão, preço. Sem fato externo: "Nenhum". -->

## Desenho

<!-- Fatias verticais ou componentes, fluxo principal, diagrama mermaid se ajudar. Nomes reais de arquivos e classes. -->

## Contratos e dados

<!-- Rotas e escopos, eventos (tipo novo é .vN), schema, migration e RLS, retenção, URL pública. "Sem mudança" se for o caso. -->

## Segurança

<!-- Ameaça → mitigação → teste: autorização, isolamento, entrada, segredos, dado pessoal em log ou telemetria, cabeçalhos e CSP. -->

## Observabilidade

<!-- Spans, métricas e logs novos; o que quem opera vê quando falha. -->

## Testes por critério

| Critério | Teste e tipo | Onde |
|---|---|---|
| CA-01 | <!-- unidade, integração, E2E, concorrência --> | <!-- caminho --> |

## Riscos, entrega e rollback

<!-- Risco → impacto → mitigação. Ordem de merge entre repositórios, migração reversível, como voltar. -->

## Decisões

<!-- ADR novo (skill novo-adr) ou "nenhuma decisão nova: segue o ADR-NNNN". Escolha do Cleber vira card antes. -->
