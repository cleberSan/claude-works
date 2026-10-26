---
resumo: Fluxo para produzir conteúdo público (post do diário, LinkedIn, resposta a comentário) com fatos conferidos, limites de caracteres e entrega em arquivo.
atualizado: 2026-10-26
---

# Fluxo: conteúdo

Entrada: assunto e canal. Saída: arquivo pronto para o Cleber colar ou PR com o post do diário.

## Passos

1. Ler `projetos/linkedin.md` (o que já saiu) e o cartão do projeto.
2. `redator-tecnico` junta fatos do repositório (ADR, README, métricas publicadas) e escreve.
3. Conferência: cada número e nome técnico tem fonte; nenhuma promessa clínica; nada de "Clean Architecture" para o CareFlow; nenhum dado pessoal.
4. Contar caracteres (`wc -m`): post até 3.000, comentário até 1.250.
5. Entregar: LinkedIn em `.txt` só com o texto, na pasta `/mnt/project-files/portfolio/linkedin/`; diário como PR no portfolio-web.
6. Registrar em `projetos/linkedin.md` o que foi publicado quando o Cleber confirmar (`curador-kb`).

## Regras

- O Cleber publica; o fluxo nunca posta.
- Links conferidos no Post Inspector pelo Cleber antes de publicar.
