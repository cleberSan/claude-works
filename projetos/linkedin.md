---
resumo: Presença no LinkedIn - o que já foi publicado sobre o CareFlow, onde estão os textos e vídeos, limites e regras para novos posts.
atualizado: 2026-10-26
---

# LinkedIn

Não há API: o Cleber publica sozinho. O Claude entrega o texto pronto e o material, e ele confere os links no **Post Inspector** do LinkedIn antes de publicar. Processo: skill `texto-linkedin`.

## Material (pasta do projeto `/mnt/project-files/portfolio/linkedin/`)

| Arquivo | O que é |
|---|---|
| `textos-linkedin.md` | Headline, "Sobre", seção Destaques e variantes do post de lançamento (replay e ao vivo) |
| `post-careflow-somente-texto.txt` | Texto do post de lançamento do CareFlow, pronto para colar |
| `post-careflow-video.md` | Roteiro do post com vídeo; tem um parágrafo para trocar quando o backend estiver no ar |
| `careflow-paciente-x-sistema.mp4`, `careflow-video-capa.png` | Vídeo de 59 s "paciente x sistema" e capa |
| `video-fonte/` | Fonte do vídeo (HTML animado + `render.mjs` com Playwright), para regravar |
| `post-v2-somente-texto.txt` | Segundo post: processo assistido por IA, ADRs e portões de CI |
| `resposta-comentario-*.txt` | Respostas a comentários, conferidas no código |

## Publicado

- **2026-10-18:** post de lançamento do CareFlow com o vídeo de 59 s.
- Segundo post (v2) sobre o processo: IA no ciclo, ADRs, CI com portões de qualidade.
- **2026-10-26:** resposta a comentário sobre dupla reserva e MassTransit, com fatos conferidos: exclusion constraint GiST (ADR-0002, não índice único por horário) e MassTransit descartado por licença (ADR-0006).

## Regras

- Post até **3.000** caracteres; comentário até **1.250**. Conte antes de entregar.
- Entregar `.txt` só com o texto a colar.
- Todo fato técnico conferido no repositório (ADR, código) antes. Nunca "Clean Architecture" para o CareFlow.
- Sem dado pessoal de ninguém; sem promessa clínica; números de avaliação com a fonte (post da fase 7).
- Link do site ou do repositório no texto; o vídeo do site (`public/videos/careflow-fluxo.*`) pode ser reaproveitado.
