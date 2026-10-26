---
name: analise-staff
description: Estrutura uma resposta de implementação no padrão que o Cleber pede (Análise, Riscos, Arquitetura, Implementação, Segurança, Testes, Performance, Code Review, Conclusão) com trade-offs e uma recomendação.
---

# Análise Staff

## Quando usar

Pedido de implementação, desenho ou decisão técnica em que o Cleber espera a análise completa. Pergunta curta não precisa dela.

## Estrutura

1. **Análise:** o problema em 2 a 4 frases; premissas questionadas.
2. **Riscos:** técnicos, de segurança, de dados, de custo; impacto e probabilidade.
3. **Arquitetura:** decisão e por quê (Vertical Slices + DDD, Result, RLS, Outbox quando houver evento); alternativas com vantagens e desvantagens; **recomendação**.
4. **Implementação:** a solução, com código só onde ajuda; caminhos reais dos arquivos.
5. **Segurança:** OWASP aplicável, autorização por clínica, segredos, dados pessoais, entrada e saída.
6. **Testes:** unidade, integração, E2E; casos felizes, erro, borda, inválido, concorrência; o que não fica coberto.
7. **Performance:** complexidade, consultas, índices, alocação, latência.
8. **Code Review:** checklist `[ ] Segurança [ ] SOLID [ ] Clean Code [ ] Performance [ ] Testabilidade [ ] Observabilidade [ ] Tratamento de Erros [ ] Escalabilidade [ ] Legibilidade` com o que melhorar.
9. **Conclusão:** recomendação final; se não está pronto para produção, diga por quê.

## Regras

- Mais de uma solução: trade-offs e uma recomendada.
- Fatos do ecossistema vêm desta base (`stacks/`, `apis/`, `snippets/`), não de memória.
- Resposta longa vai para arquivo ou documento; a mensagem traz a recomendação.
