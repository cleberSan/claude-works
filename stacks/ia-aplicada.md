---
resumo: Como o ecossistema usa LLM em produto (triagem do CareFlow) e no desenvolvimento - modelo, SDK, guardrails, gravações, avaliação e custos.
atualizado: 2026-10-26
fontes:
  - https://github.com/cleberSan/careflow/blob/main/docs/adr/0011-triagem-com-ia-pseudonimizada.md
---

# IA aplicada

## No produto: triagem do CareFlow

- **Modelo:** Claude Haiku 5.5 pelo **SDK oficial C# da Anthropic** (pacote `Anthropic`, MIT), atrás de uma interface com três provedores: `Fake` (regras), `Recorded` (respostas gravadas) e `Anthropic` (real, com `MaxCalls`).
- **Sem dado pessoal no provedor:** só texto mascarado e faixa etária saem; sem pseudônimo, sem clínica. Mais de 50% mascarado: não sai.
- **Ordem do motor:** alarmes por regra (texto original) → consentimento `ai-triage` → detector de prompt injection → mascaramento → modelo → JSON Schema → guard de linguagem clínica → piso dos alarmes (modelo nunca rebaixa).
- **Humano no circuito:** toda triagem termina com o profissional confirmando ou corrigindo; desvios caem para só regras.
- **Auditoria:** SHA-256 do pedido enviado (evento `audit.content-disclosed`), nunca o texto.
- **Mascaramento próprio** (`ComplaintMasker`): nome (inclusive do cadastro, só em memória), CPF, sequências longas de dígitos, telefone, e-mail, link, @usuário, datas, idade, endereço; preserva números clínicos (temperatura, pressão, dor). Bibliotecas como Presidio foram descartadas (Python, inglês).

## Gravações e avaliação

- 57 casos sintéticos em `eval/triage/cases.json`; cassetes em `eval/triage/recordings/` nomeados pelo SHA-256 do prompt.
- CI e Painel reproduzem as gravações: **custo zero por build** e resultado determinístico.
- Workflow manual `triage-recordings.yml` faz as chamadas reais com teto e publica gravações e relatório como artefato; o Cleber baixa o zip e anexa na thread (a sessão não baixa artefatos).
- Métricas v2: 76,6% exata, 93,6% a até um nível, 8,5% de subtriagem, 0 recusas. Mudou o prompt? Suba a versão (`triage-v2`) e grave de novo.
- A v1 mostrou justificativas com hipótese de doença; meça linguagem clínica antes de publicar.

## Custos e chaves

- Chave só em secret do GitHub, com limite de gasto baixo na conta da Anthropic; nunca no chat.
- Demonstração pública usa gravações; chamada real exige `Triage:Model:LiveCallsEnabled=true` em ambiente exposto e fica desligada.

## No desenvolvimento

- Claude Code no fluxo do Cleber: threads por fase, PRs revisados por ele, contexto versionado (CLAUDE.md, ADRs, esta base).
- Esta base existe para o Claude ler menos e acertar mais: [CLAUDE.md](../CLAUDE.md), skills em `.claude/skills/`, subagentes em `.claude/agents/`, fluxos em [agents/](../agents/README.md).
- Ao escolher modelo para algo novo: confira a documentação atual da Anthropic (skill `claude-api` do Claude Code) em vez de memória.
