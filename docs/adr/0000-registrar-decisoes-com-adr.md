---
resumo: ADR-0000 da base - decisões sobre a própria base viram ADR, no mesmo formato dos outros repositórios.
atualizado: 2026-10-26
---

# ADR-0000: Registrar decisões com ADRs

- Status: aceito
- Data: 2026-10-26

## Contexto

O claude-works é lido por pessoas e por agentes. Mudanças de estrutura (pastas, formato, regras de validação) afetam todo fluxo que depende dele, então precisam de registro com o porquê.

## Decisão

Decisões sobre a base ficam em `docs/adr/NNNN-titulo.md`, com Status, Data, Contexto, Decisão, Alternativas e Consequências, como no careflow, no portfolio-web e no lojinha-da-lua. ADR aceito não é editado; uma mudança de rumo gera um ADR novo.

## Alternativas

- **Só a descrição do PR:** o contexto se perde e não há índice.

## Consequências

- Mudança estrutural vem com ADR no mesmo PR.
