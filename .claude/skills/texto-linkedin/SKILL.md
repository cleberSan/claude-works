---
name: texto-linkedin
description: Escreve post ou resposta de comentário para o LinkedIn do Cleber com fatos conferidos nos repositórios, dentro do limite de caracteres, entregue como arquivo só com o texto.
---

# Texto para o LinkedIn

## Quando usar

O Cleber pede post, legenda de vídeo, texto do perfil ou resposta a comentário.

## Antes de começar

Leia `projetos/linkedin.md` (o que já saiu e onde estão os arquivos) e o cartão do projeto do assunto.

## Passos

1. Junte os fatos no repositório (ADR, README, post do diário, métricas publicadas). Anote a fonte de cada número.
2. Escreva em português, primeira pessoa do Cleber, frases curtas, gancho na primeira linha, uma ideia por parágrafo, link do site ou do repositório no fim.
3. Comentário: responda à pergunta da pessoa primeiro; corrija premissa errada com o fato e o ADR (ex.: dupla reserva é exclusion constraint GiST, ADR-0002; MassTransit saiu por licença, ADR-0006).
4. Conte: `wc -m arquivo.txt`. Post ≤ 3.000; comentário ≤ 1.250.
5. Salve em `/mnt/project-files/portfolio/linkedin/<nome>.txt` **só com o texto**; anexe na resposta e informe a contagem.

## Regras

- Nunca "Clean Architecture" para o CareFlow (é Vertical Slices + DDD).
- Sem promessa clínica; dados sintéticos sempre ditos como tal.
- Sem dado pessoal de ninguém; sem assunto de carreira que ele não pediu.
- O Cleber publica e confere os links no Post Inspector.
