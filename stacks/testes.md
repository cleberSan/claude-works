---
resumo: Estratégia de testes do ecossistema - pirâmide por stack, cobertura de 80% medida certo, concorrência, segurança, E2E com axe e o que cada camada prova.
atualizado: 2026-10-26
---

# Testes

Princípio: **qualidade do teste acima da cobertura artificial**, mas o CI barra abaixo de 80%. Todo teste em AAA (Arrange, Act, Assert), cobrindo caminho feliz, erro, borda e entrada inválida.

## Por stack

| Camada | .NET (careflow) | Next.js (portfolio-web) | Astro (lojinha-da-lua) |
|---|---|---|---|
| Unidade | xUnit v3 sobre Microsoft.Testing.Platform; domínio puro | Vitest 5 + Testing Library, teste ao lado do arquivo | Vitest 5 em `src/domain` e `src/config` |
| Integração | `WebApplicationFactory` + PostgreSQL real (Testcontainers ou `CAREFLOW_TEST_POSTGRES`) | — | — |
| Ponta a ponta | `CareFlow.EndToEndTests`: serviços num processo + Postgres + RabbitMQ reais | Playwright desktop + mobile sobre `next start` | Playwright desktop + celular sobre `wrangler dev` |
| Acessibilidade | — | axe WCAG 2.2 AA, temas claro e escuro | axe WCAG 2.1 AA |
| Produção | Fumaça pós-deploy pela URL pública (`CareFlow.SmokeTests`) | — | Mesma suíte E2E diária contra produção |
| Cobertura | coverlet.MTP `--coverlet-threshold 80` por projeto de teste | 80% em linhas, branches, funções e statements | 80% |

## O que sempre testar

- **Concorrência de verdade:** N requisições simultâneas no mesmo recurso, exatamente 1 sucesso (careflow: 20 reservas no mesmo horário).
- **Idempotência:** mesma chave e mesmo corpo devolvem o mesmo recurso; mesma chave e corpo diferente dão 409.
- **Isolamento por cliente/clínica:** recurso de outra clínica responde 404 em todo endpoint; RLS impede leitura e escrita mesmo pulando a aplicação.
- **Sem dado pessoal em logs e telemetria:** fluxos completos com log em nível Trace e varredura de spans, logs e métricas exportados atrás de nome, CPF, telefone e e-mail.
- **Mensageria:** broker fora, duplicata, desordem, mensagem envenenada indo para DLQ, nenhuma perda nem efeito duplo.
- **Segurança HTTP:** cabeçalhos e CSP conferidos no E2E; console sem erro.
- **Conteúdo:** registro e arquivos batem (posts), preços batem com a fonte (flyers), nenhum contato pessoal publicado.
- **Restauração:** backup, ensaio e restauração reaplicando eliminações (CI do careflow em todo PR).
- **IA:** avaliação reproduzível com respostas gravadas; métricas (acerto exato, a até um nível, subtriagem, recusas) publicadas como artefato.

## Medir cobertura certo (.NET)

- `testconfig.json` por projeto com `include` dos assemblies que aquele projeto deve cobrir, `excludeByFile: **/Migrations/*.cs`, `excludeByAttribute` para gerado e `ExcludeFromCodeCoverage`, `excludeAssembliesWithoutSources: MissingAll`.
- O limite vale **por módulo por suíte**: se a suíte inclui um building block, ela precisa exercitá-lo.
- Código a medir nunca no executável de teste; vai para uma biblioteca ([lição](../memorias/licoes-aprendidas.md)).

## Convenções

- Nomes .NET: `Metodo_Condicao_Resultado`. Nomes TS: `describe` pelo módulo, `it` em português descrevendo o comportamento.
- Relógio controlado (`TimeProvider`, fake timers); nada de `sleep` em teste.
- Dados sintéticos: `SyntheticPatients` no careflow; CPF publicado sempre mascarado.
- Fixture limpa estado global (filas, jobs) antes de cada teste.
- Teste que cobre bug corrigido entra no mesmo PR da correção.

## Riscos que os testes não cobrem (declarar no PR)

Carga e latência (fase 10), falha de hardware da VM, comportamento real de provedores de mensagem (simulados), mudanças de política de terceiros (planos gratuitos).
