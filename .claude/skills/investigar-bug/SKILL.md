---
name: investigar-bug
description: Investiga e corrige bug sem suposição - evidência, hipóteses por probabilidade, reprodução por teste, causa raiz, correção, regressão e prevenção - no padrão que o Cleber pede.
---

# Investigar bug

## Quando usar

Erro em produção, CI vermelho, teste intermitente, comportamento diferente do esperado.

## Passos

1. **Evidência:** saída exata, commit, ambiente, desde quando, frequência. CI: o `main` também falha?
2. **Lições conhecidas:** procure o sintoma em `memorias/licoes-aprendidas.md` e `memorias/ambiente-cloud.md`.
3. **Hipóteses** ordenadas por probabilidade, cada uma com o teste que confirma ou descarta.
4. **Reprodução:** o menor teste automatizado que falha pelo motivo certo.
5. **Causa raiz:** por que o código permitiu; mesmo padrão em outros lugares (`grep`).
6. **Correção** na causa; teste passa; suíte inteira passa como no CI.
7. **Prevenção:** teste de regressão; lição nova na base (skill `kb-atualizar`) se custou tempo.

## Relatório

```
Causa provável:
Impacto:                 Severidade:
Risco de regressão:
Plano de testes:
Checklist de validação:
Prevenção:
```

## Regras

- Nunca desligar ou pular teste para ficar verde.
- Sem mexer em produção sem o Cleber.
