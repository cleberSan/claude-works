---
resumo: Serviços e APIs de terceiros usados nos projetos - para quê, como autentica, onde fica a credencial e cuidados.
atualizado: 2026-10-26
---

# APIs e integrações externas

| Serviço | Onde | Como integra | Credencial | Cuidados |
|---|---|---|---|---|
| **Anthropic (Claude)** | careflow Triage | SDK oficial C# `Anthropic` (MIT), modelo Claude Haiku 5.5, saída validada por JSON Schema | `ANTHROPIC_API_KEY` só em secret do GitHub (workflow manual) ou user secret local | Teto de chamadas (`MaxCalls`), limite de gasto na conta, só texto mascarado, demo pública usa gravações |
| **OCI Vault (KMS)** | careflow PatientVault em produção | `OCI.DotNetSDK.Keymanagement` (UPL 1.0/Apache 2.0), chave mestra por software | Instance principal da VM (sem credencial em disco) | Perder a conta perde as chaves; aceitável com dados sintéticos |
| **OCI Object Storage** | backup do Postgres | CLI na VM | Instance principal | Ciclo de vida de 7 dias; 20 GB grátis |
| **OCI Compute** | provisionamento | `provision.sh` no Cloud Shell; robô com CLI | Sessão do Cleber no Cloud Shell; robô por instance principal restrita ao compartimento | Nunca Pay As You Go; Cloud Shell é FIPS (RSA) |
| **DuckDNS** | subdomínio do backend | Timer na VM atualiza o IP | Token do DuckDNS na VM | Nunca no repositório |
| **Let's Encrypt** | TLS do backend | Caddy, desafio TLS-ALPN-01 na 443 | — | Porta 80 fechada |
| **GitHub** | todos | Actions, GHCR, `gh` nos workflows (issue de alerta), app da Vercel e da Cloudflare | `GITHUB_TOKEN` com permissão mínima por job; deploy por chave SSH em environment com aprovação | Só actions `actions/*` e `github/*` |
| **Vercel** | portfolio-web | App do GitHub (deploy por push, preview por PR) | Nenhuma no GitHub | Hobby não comercial |
| **Cloudflare Workers Builds** | lojinha-da-lua | App do GitHub (deploy por push, prévia por branch) | Nenhuma no GitHub | Variáveis de build não compartilhadas entre abas |
| **WhatsApp (`wa.me`)** | lojinha-da-lua | Link com texto `encodeURIComponent`; sem API | — | Mensagem até 1.500 caracteres; número só em `store.ts` |
| **Provedores de mensagem** | careflow Notifications | **Simulados** por `HttpMessageHandler` imitando API com `Idempotency-Key` | — | Nenhum envio real |
| **HL7 FHIR R4** | careflow Rights | Firely SDK (BSD-3), validação no processo | — | Aviso em `THIRD-PARTY-NOTICES.md` |
| **LinkedIn** | divulgação | **Sem API**: o Cleber publica; Post Inspector para conferir links | — | Limites de 3.000 (post) e 1.250 (comentário) caracteres |

## Regras para adicionar uma integração

1. Existe opção gratuita sem cobrança automática? Se não, é decisão do Cleber.
2. Licença do SDK conferida no pacote publicado; registrar no ADR e em `THIRD-PARTY-NOTICES` se exigir.
3. Credencial com menor privilégio, fora do repositório, de preferência sem segredo (app do provedor, instance principal, OIDC).
4. Resiliência na chamada (timeout, retry com jitter, circuit breaker) e fallback definido.
5. Dado pessoal minimizado ou mascarado antes de sair; o que saiu fica auditado (hash, não conteúdo).
6. Teste com o provedor simulado ou gravado; chamada real só em workflow manual com teto.
