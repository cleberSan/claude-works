---
resumo: Fluxo de revisão de PR com agentes em paralelo (segurança, Staff, QA), consolidação de achados e correção antes de pedir a revisão do Cleber.
atualizado: 2026-10-26
---

# Fluxo: revisão de PR

Entrada: número do PR ou branch. Saída: lista consolidada de achados e, se o PR é nosso, as correções empurradas.

## Passos

1. Ler o diff inteiro e o cartão do projeto.
2. Em paralelo:
   - `guardiao-seguranca` → bloqueios e recomendações;
   - `revisor-staff` → achados por severidade com cenário de falha;
   - `qa-destrutivo` → testes que falham.
3. Consolidar: remover duplicados, manter o mais severo, descartar gosto pessoal.
4. PR nosso: corrigir bloqueios e achados altos; responder no PR o que não será feito e por quê (um comentário).
5. PR de terceiro ou só observado: relatar ao Cleber, sem comentar no PR dele.
6. CI verde → pedir revisão do Cleber com resumo de uma linha por achado tratado.

## Formato do relatório

```
Bloqueia (N) | Altos (N) | Opcionais (N)
1. arquivo:linha — problema — cenário — status (corrigido | respondido | pendente)
```

## Regras

- Nunca desligar teste, pular check ou fechar e reabrir PR para rodar CI.
- Aprovação e merge são do Cleber.
