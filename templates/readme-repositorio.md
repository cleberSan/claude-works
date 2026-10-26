<!-- resumo: Modelo de README de repositório novo no padrão do ecossistema (badges, propósito, o que tem, qualidade, decisões, como rodar, licença). Variáveis NOME, DONO, DESCRICAO, STACK. -->
# {{NOME}}

[![CI](https://github.com/{{DONO}}/{{NOME}}/actions/workflows/ci.yml/badge.svg)](https://github.com/{{DONO}}/{{NOME}}/actions/workflows/ci.yml)
[![CodeQL](https://github.com/{{DONO}}/{{NOME}}/actions/workflows/codeql.yml/badge.svg)](https://github.com/{{DONO}}/{{NOME}}/actions/workflows/codeql.yml)
[![Licença: MIT](https://img.shields.io/badge/licen%C3%A7a-MIT-blue.svg)](LICENSE)

{{DESCRICAO}}

Construído com {{STACK}}.

## O que tem

<!-- Tabela de rotas ou serviços. -->

## Qualidade

- Testes com cobertura mínima de 80% no CI.
- CodeQL, revisão de dependências e Dependabot.
- <!-- Segurança, acessibilidade, observabilidade específicas. -->

## Decisões

As decisões arquiteturais estão em [docs/adr](docs/adr).

## Rodando localmente

Veja [CONTRIBUTING.md](CONTRIBUTING.md).

## Licença

[MIT](LICENSE)
