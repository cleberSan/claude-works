---
resumo: Padrões de segurança aplicados nos projetos - OWASP Top 10 na prática, cabeçalhos e CSP, isolamento, criptografia, segredos, supply chain e LGPD.
atualizado: 2026-10-30
---

# Segurança

## OWASP Top 10 na prática

| Risco | Como os projetos tratam |
|---|---|
| Broken access control / IDOR | Escopo por rota, clínica da claim `tenant_id`, filtro global + RLS com `FORCE`, 404 para recurso de outra clínica, menor privilégio entre papéis (quem envia não revisa) |
| Falhas criptográficas | AES-256-GCM por campo com AAD, envelope encryption, KMS atrás de interface, HMAC para índices, HSTS com preload |
| Injeção | EF/Npgsql parametrizados; identificador SQL de migration validado por whitelist; `encodeURIComponent` em links do WhatsApp; prompt injection barrada antes do LLM |
| Design inseguro | ADR por decisão, garantias no banco (constraints), falha fechada (sem clínica, nenhuma linha) |
| Configuração incorreta | Provedores locais de chave e emissores de token recusados em produção; health falha com login superusuário; só `/demo/v1/*` exposto |
| Componentes vulneráveis | Lock files, Dependabot com cooldown de 7 dias, revisão de dependências (moderada+), `npm audit`, CodeQL `security-extended` |
| Falhas de identificação | JWT com escopo; token de serviço P-256 curto; sessão do Painel por token opaco de 32 bytes guardado como hash |
| Integridade de software | Só actions oficiais; imagens por commit; deploy com aprovação e rollback |
| Log e monitoramento | Logs estruturados sem PII, trilha de auditoria HMAC, alarme por issue quando a produção falha |
| SSRF | Sem URL arbitrária vinda do usuário; CSP `connect-src` só com hosts conhecidos |

## Web

- CSP: sem nonce (Next, páginas estáticas) ou por hash (Astro). Sempre `object-src 'none'`, `frame-ancestors 'none'`, `base-uri`, `form-action`; `script-src-attr 'none'` quando possível.
- Cabeçalhos: HSTS `max-age=63072000; includeSubDomains; preload`, `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy` negando câmera, microfone, localização (e pagamento, USB, tópicos), `Cross-Origin-Opener-Policy: same-origin`.
- Uma fonte de verdade para cabeçalhos, testada por unidade e conferida no E2E.
- Links externos `https` com `noopener noreferrer`; nada de `target=_blank` sem `rel`.
- CORS só com a origem do site, sem credenciais; cookie `__Host-` quando o mesmo site; token em memória quando sites diferentes.

## Segredos

- Nunca no repositório, no chat, em log ou em `NEXT_PUBLIC_*`.
- Desenvolvimento: user secrets (.NET). CI: GitHub secrets e environments com aprovação. Produção: gerados na VM (0600, root) ou cofre do provedor (OCI Vault por instance principal, sem credencial na VM).
- Chave de API de terceiro (ex.: Anthropic) só em secret do GitHub, com limite de gasto baixo e teto de chamadas por execução.
- Integração de deploy pelo app do provedor (Vercel, Cloudflare) em vez de token no GitHub; app instalado só no repositório necessário.

## Supply chain

- Restore travado por lock file; versões centralizadas; Dependabot agrupado, com cooldown de 7 dias (versão comprometida costuma sair do registro antes).
- Auto-merge do Dependabot só de baixo risco e só depois dos checks; troca de mantenedores, commit sem assinatura ou de outra pessoa e action de terceiros vão para revisão ([pipelines](../pipelines/README.md#dependabot-e-auto-merge-2026-10-30)).
- Revisão de dependências bloqueia GPL-3.0 e AGPL-3.0 (imagens AGPL só sem modificação e fora do produto distribuído).
- Licença de cada pacote novo conferida no pacote publicado; aviso em `THIRD-PARTY-NOTICES.md` quando a licença exige.
- Workflows com `permissions: contents: read` no topo, `persist-credentials: false`, job com escrita isolado e mínimo.

## LGPD e dados

- Minimização: só o cofre tem dado pessoal; o resto usa pseudônimo.
- Consentimento por finalidade, revogação propagada, base legal registrada com versão do termo.
- Direitos do titular: acesso, portabilidade (FHIR R4), eliminação por crypto-shredding com comprovante.
- IA: só texto mascarado sai; auditoria guarda só o SHA-256 do que saiu.
- Demo: dados 100% sintéticos; CPF e telefone mascarados no que é publicado; limpeza garantida das clínicas de visitantes.

## Checklist rápido de PR

Entrada validada? Saída sem dado sensível? Autorização por recurso e por clínica? Segredo fora do código? Dependência nova com licença conferida? Log sem PII? Teste do caminho de erro? CSP/cabeçalhos intactos?
