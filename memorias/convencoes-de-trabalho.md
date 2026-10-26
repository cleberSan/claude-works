---
resumo: Como o trabalho anda - projeto no Claude, uma thread por fase, cards de decisão, PRs, ordem de merge, entrega de textos.
atualizado: 2026-10-26
---

# Convenções de trabalho

## Projeto no Claude

- O trabalho roda num projeto do Claude ("Portfolio Pessoal") com um chat principal e uma **thread por tarefa ou fase**. A thread recebe o pedido, posta um checklist de progresso e responde com o resultado.
- **Pasta compartilhada do projeto:** `/mnt/project-files/` (sobrevive às threads). Convenção de subpastas:
  - `portfolio/`: plano inicial, `prompt-fase-N.md`, `fase-N-decisoes.md`.
  - `portfolio/linkedin/`: textos e vídeos para o LinkedIn.
  - `lojinha-da-lua/`: prévias de tela por PR, scripts de imagem.
  - `lojinhalua/`: material original enviado pela loja (não versionar no repositório público sem decisão).
- **Memória do projeto** (privada, carregada em toda thread) guarda fatos que não podem ir para um repositório público. Esta base guarda o que pode.

## Ciclo de uma fase

1. Cleber cola `prompt-fase-N.md` no chat do projeto; o coordenador abre a thread da fase.
2. A thread levanta fatos (licenças, limites de plano, preços), escreve `fase-N-decisoes.md` ([modelo](../templates/decisoes-fase.md)) e manda **cards** só com o que é decisão dele.
3. Enquanto ele não responde, segue na opção recomendada, sem passos irreversíveis.
4. Branch com o mesmo nome nos dois repositórios; PR do careflow (código + ADR + README) e PR do site (post do diário + roadmap + links para o ADR).
5. CI verde, cobertura ≥ 80%, Cleber revisa e faz o merge. **O PR do site entra depois do careflow**, porque linka ADR no `main`.
6. No fim: atualizar esta base (skill `kb-atualizar`) e escrever `prompt-fase-(N+1).md` ([modelo](../templates/prompt-fase.md)).

Fluxo automatizado equivalente: [agents/fluxo-fase.md](../agents/fluxo-fase.md).

## Git e PR

- Branch a partir de `main` (`feat/...`, `fix/...`, `chore/...`, `docs/...`, ou o nome dado pela sessão).
- **Conventional Commits em português**: `feat(deploy): ...`, `fix(testes): ...`, `docs(fase-9): ...`, `chore(deps): ...`.
- PR em rascunho com o template do repositório: **Antes, Depois, Como, Checklist** ([modelo](../templates/pull-request.md)).
- Cleber é **assignee**. Pedido de revisão para ele falha porque o PR sai da conta dele (o GitHub não deixa o autor revisar).
- Ele às vezes usa **Update branch** no GitHub: faça `git fetch` antes de push.
- `merged_by` no GitHub mostra `cleberSan` mesmo quando quem agiu foi um conector na conta dele; confira o histórico antes de concluir quem fez o merge.
- Sem actions de terceiros nos workflows; só `actions/*` e `github/*` ([pipelines](../pipelines/README.md)).

## Respostas na thread

- Primeiro a resposta ou a decisão necessária; detalhe em arquivo anexo, não em mensagem longa.
- Pedido de ação dele (console, Vercel, Oracle): passo a passo com link, e o trabalho que não depende disso continua.
- Ao terminar: checklist fechado, uma mensagem com o resultado e o link.

## Textos para publicar

- Entregar **um arquivo só com o texto a colar** (`.txt`). Um `.md` inteiro com checklist já estourou o limite de 3.000 caracteres do LinkedIn.
- Detalhes na skill `texto-linkedin` e em [projetos/linkedin.md](../projetos/linkedin.md).

## Conteúdo

- CareFlow: só dados sintéticos; nenhuma promessa clínica ou jurídica; CPF e telefone mascarados em tudo que é publicado.
- Loja: preço, prazo, contato e texto só da própria loja; nada inventado.
- Site: perfil só com fatos do LinkedIn dele; atualizar `profile.asOf` quando o perfil mudar.
