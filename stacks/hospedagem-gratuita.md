---
resumo: Onde hospedar de graça e sem risco de cobrança - Vercel, Cloudflare, Oracle Always Free, GitHub, DuckDNS - com limites, regras de uso e o que já foi descartado.
atualizado: 2026-10-26
---

# Hospedagem gratuita

Regra do Cleber: **gratuito e sem risco de cobrança**. Pesquisa de outubro de 2026; planos mudam sem aviso, então confira a página oficial antes de decidir.

## Em uso

| Serviço | Para quê | Limites e regras que importam |
|---|---|---|
| **Vercel Hobby** | portfolio-web | Só **uso não comercial** (oferecer serviço pago exigiria Pro). Container Runtime dorme após 5 min ocioso; daemons com 10 vCPU-h/mês por time. Não hospeda Postgres nem RabbitMQ. Integração pelo app do GitHub, sem token. |
| **Cloudflare Workers (estático)** | lojinha-da-lua | Permite uso comercial, sem cartão; requisição a arquivo estático não conta no limite grátis; código de servidor conta (100 mil/dia). Workers Builds pelo app do GitHub; prévia por branch com `wrangler preview`. |
| **Oracle Cloud Always Free** | backend do CareFlow (pendente) | A1 Flex ARM **2 OCPU/12 GB** no total (cortado de 4/24 em 2026-06-15), 200 GB de block volume, 5 backups. Só na região principal. VM ociosa 7 dias (CPU p95, rede e memória < 20%) pode ser recuperada. Vault com chave por software grátis; Object Storage 20 GB e 50 mil requisições/mês. Pede cartão para identidade. **Nunca** mudar para Pay As You Go sem decisão explícita. |
| **GitHub** (público) | código, CI, GHCR, conferência de produção | Actions gratuito em repositório público; GHCR com pacote público; environments com aprovação. |
| **DuckDNS** | subdomínio do backend com HTTPS | Grátis; token fica na VM; certificado via Let's Encrypt pelo Caddy (TLS-ALPN na 443). |
| **Let's Encrypt** | TLS | Grátis, renovação automática pelo Caddy. |

## Descartados (e por quê)

| Opção | Motivo |
|---|---|
| GitHub Pages | Proíbe e-commerce e negócio online |
| Netlify Free | 300 créditos/mês, 15 por deploy; estourar pausa todos os projetos |
| Render free | 512 MB, dorme, Postgres expira em 30 dias |
| Fly.io | Só trial |
| Google Cloud Run | Exige conta de faturamento; escala a zero |
| Koyeb, Miget | 256–512 MB por serviço ou cartão; a stack do CareFlow pede ~7 GB |
| Hugging Face Docker Spaces | Pago desde julho de 2026 |
| Codespaces | Não serve ao público |
| PC pessoal + ngrok | Máquina pessoal exposta, depende do PC ligado, 20 mil requisições/mês |
| Grafana Cloud Free | Funciona, mas a decisão foi manter observabilidade na VM |
| Backblaze B2 | 10 GB grátis, cobrança acima; preferido o Object Storage da própria Oracle |
| AWS / Azure | Custo; o Cleber conhece bem, mas não para o portfólio |

## Como decidir

1. O uso é comercial? Então nada de Vercel Hobby nem GitHub Pages.
2. Precisa de processo contínuo (consumidor, despachante, banco)? Só VM (Oracle) resolve de graça.
3. Pede cartão? Pode, se não houver cobrança automática acima do grátis; documente a trava (ex.: cota).
4. Registre num ADR com a data da pesquisa e o link da página de limites.
