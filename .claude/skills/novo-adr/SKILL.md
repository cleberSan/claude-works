---
name: novo-adr
description: Escreve um ADR no formato dos repositórios do Cleber (docs/adr/NNNN-titulo.md com Status, Data, Contexto, Decisão, Alternativas, Consequências). Use quando uma decisão de arquitetura, segurança, dados ou operação for tomada ou mudar.
---

# Novo ADR

## Quando usar

Decisão com impacto em arquitetura, segurança, dados, operação, custo ou licença; ou mudança de rumo de um ADR aceito.

## Passos

1. Liste `docs/adr/` e use o próximo número livre com 4 dígitos (o careflow pulou o 0005; não reaproveite números).
2. Nome do arquivo: `NNNN-titulo-em-kebab-case.md`, em português sem acento.
3. Gere a partir do modelo: `npm run modelo -- templates/adr.md <repo>/docs/adr/NNNN-titulo.md NUMERO=NNNN TITULO="..." DATA=AAAA-MM-DD`.
4. **Contexto:** problema e fatos verificados com link e data.
5. **Decisão:** itens com negrito; nomes reais de arquivos, classes, rotas e configurações; quem decidiu quando foi escolha do Cleber.
6. **Alternativas:** cada uma com o motivo concreto de não ter sido escolhida (inclua a paga e a mais simples).
7. **Consequências:** garantias e o teste que prova cada uma; riscos residuais; o que reabre a decisão.
8. Status `proposto` no PR; `aceito` quando o Cleber aprovar o PR.
9. Linke o ADR no README (roadmap) e no cartão do projeto desta base.

## Regras

- ADR aceito não é editado: mudança de rumo gera ADR novo, e o antigo ganha "Status: substituído pelo ADR-NNNN" (único ajuste permitido).
- Sem segredo, sem dado pessoal, sem promessa clínica ou jurídica.
- Texto direto, em português, frases completas.
