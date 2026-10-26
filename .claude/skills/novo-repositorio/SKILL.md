---
name: novo-repositorio
description: Prepara um repositório novo do Cleber no padrão do ecossistema - CI, CodeQL, Dependabot, template de PR, CODEOWNERS, ADR-0000, README, CONTRIBUTING e SECURITY - e lista o que só ele pode configurar no GitHub.
---

# Novo repositório

## Quando usar

O Cleber criou um repositório vazio (a sessão não cria repositórios) e pediu a base, ou um projeto novo vai começar.

## Passos

1. Pergunte só o que muda a estrutura e ainda não está claro: stack (.NET ou Node), público ou privado, uso comercial (decide a hospedagem).
2. No clone, rode: `node <claude-works>/scripts/iniciar-repositorio.mjs --destino . --stack dotnet|node --nome <repo>`. Ele copia workflows, Dependabot, template de PR, CODEOWNERS, ADR-0000 e SECURITY.md, sem sobrescrever o que já existe.
3. Escreva o ADR-0001 de stack e qualidade (`skill novo-adr`) e o README (`templates/readme-repositorio.md`).
4. Ajuste o CodeQL para a linguagem (`csharp` ou `javascript-typescript`; `actions` sempre).
5. CONTRIBUTING com: branch a partir de `main`, Conventional Commits em português, como rodar local, variáveis, deploy.
6. Primeiro PR em rascunho; CI verde.
7. Acrescente o cartão do projeto nesta base (`templates/cartao-projeto.md`) com a skill `kb-atualizar`.

## O que só o Cleber faz (mande o passo a passo)

- Proteger o `main`: exigir PR e os checks (`Build, formatação e testes` ou `Lint, tipos, testes e build`, `Revisão de dependências`, `CodeQL`), sem bypass, sem aprovação obrigatória.
- Ligar Dependency graph e, em repositório público, conferir secret scanning e push protection.
- Instalar o app de deploy (Vercel ou Cloudflare) só neste repositório.
- Criar secrets e environments, se houver deploy por workflow.

## Regras

- Licença MIT no código; marca e conteúdo de terceiros fora da licença, dito no README.
- Nada pago sem decisão do Cleber.
