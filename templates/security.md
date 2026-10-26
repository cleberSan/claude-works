<!-- resumo: SECURITY.md padrão para repositório novo (reporte privado, escopo, práticas), usado pelo iniciar-repositorio. Variáveis DONO, NOME. -->
# Política de segurança

## Reportar uma vulnerabilidade

Não abra issue pública para vulnerabilidades. Use o [reporte privado de vulnerabilidades do GitHub](https://github.com/{{DONO}}/{{NOME}}/security/advisories/new). O retorno inicial acontece em até 5 dias úteis.

## Práticas adotadas

- Segredos nunca são versionados; ficam em GitHub secrets ou no cofre do provedor.
- Análise estática com CodeQL e revisão de dependências em todo PR.
- Atualizações de dependências semanais via Dependabot.
- Nenhum dado pessoal real em código, testes, issues ou PRs.
