---
resumo: Fluxo de correção de bug sem suposição - evidência, hipóteses por probabilidade, reprodução por teste, causa raiz, correção, regressão e prevenção.
atualizado: 2026-10-26
---

# Fluxo: correção de bug

Entrada: sintoma (log, CI vermelho, relato). Saída: PR com teste que falhava antes e passa depois, e a análise.

## Passos

1. **Evidência**: saída exata do erro, commit, ambiente, desde quando. CI vermelho no `main` também? Então não é deste PR.
2. **Hipóteses** ordenadas por probabilidade, cada uma com o que a confirmaria ou descartaria.
3. **Reproduzir com teste** (`qa-destrutivo`): o menor teste que falha pelo motivo certo.
4. **Causa raiz**: por que o código permitiu; onde mais o mesmo padrão aparece (`grep`).
5. **Corrigir** (`implementador`) na causa, não no sintoma; teste passa; vizinhos continuam passando.
6. **Revisar** (`guardiao-seguranca` se tocar dado, autorização ou segredo; `revisor-staff` sempre).
7. **Prevenir**: teste de regressão fica; lição em `memorias/licoes-aprendidas.md` se custou tempo (`curador-kb`).

## Relatório no PR

```
Causa provável: ...
Impacto: ...            Severidade: alta | média | baixa
Risco de regressão: ... Como foi testado: ...
Prevenção: ...
```
