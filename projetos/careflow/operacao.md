---
resumo: Operação da demonstração do CareFlow - hospedagem Oracle Always Free, provisionamento, robô da A1, deploy, backup, interruptor e o que falta o Cleber fazer.
atualizado: 2026-10-26
fontes:
  - https://github.com/cleberSan/careflow/blob/main/docs/operacao/demonstracao-hospedada.md
  - https://github.com/cleberSan/careflow/blob/main/docs/adr/0013-demonstracao-hospedada-na-oracle.md
---

# Operação do CareFlow

## Estado (2026-10-26)

- **Backend fora do ar**: São Paulo sem capacidade A1 gratuita desde 2026-10-18. Robô `careflow-cacador` v2 tentando (30 dias desde 2026-10-19 ~14:29Z). Em 2026-10-23 estava na rodada 151, mais lento que no primeiro dia (causa desconhecida).
- O site funciona sem backend: o Painel cai sozinho no **replay** quando `NEXT_PUBLIC_CAREFLOW_DEMO_URL` não existe ou não responde.
- Conduta combinada: deixar o robô sozinho, rodar o comando de status uma vez por dia e seguir com outro trabalho.

## Desenho (ADR-0013)

- Uma VM Ampere A1 (ARM; 2 OCPU/12 GB, ou 1/6 se só houver essa) roda `deploy/prod/compose.yaml`: Caddy, Postgres, RabbitMQ, migrations, 8 serviços e observabilidade enxuta. Limites de memória somando < 8 GB, `restart: unless-stopped`, raiz só leitura, `cap_drop: ALL`, `no-new-privileges`.
- Ambiente .NET `Demo` (exposto à internet): recusa chaves locais e o modelo real sem trava explícita.
- Imagens `aspnet:10.0-noble-chiseled-extra` (sem shell); saúde pelo próprio binário (`--health-probe`).
- Entrada: só 443 (Caddy, Let's Encrypt TLS-ALPN, DuckDNS); só `/demo/v1/*` passa; VCN libera 22 e 443; SSH só por chave; atualizações automáticas.
- Redes do compose: `edge` (Caddy, Demo), `backend` interna sem saída, `egress` só para o cofre falar com o OCI Vault.
- Segredos gerados na VM por `careflow-generate-secrets` em `/etc/careflow/env/*.env` (root, 0600); nada passa pelo GitHub.
- Chave mestra no **OCI Vault** (software, grátis) por **instance principal**; backup diário do Postgres no **Object Storage** com ciclo de vida de 7 dias.

## Provisionamento

Cleber roda no **OCI Cloud Shell** (região `sa-saopaulo-1`), idempotente:

```bash
bash <(curl -fsSL https://raw.githubusercontent.com/cleberSan/careflow/main/deploy/oracle/provision.sh)
```

- Cria compartimento, VCN (22/443), chave SSH RSA 4096 (Cloud Shell é FIPS), Vault, bucket e a VM. Sem vaga: cria o robô.
- Rodar de novo mostra o status. Com a A1 criada, o script tira a permissão do robô e termina o resto.
- **Nunca** clicar em "Upgrade" para Pay As You Go (decisão de 2026-10-19). Se um dia for reconsiderado: trava de cota da OCI antes do upgrade. Custos estimados: R$ 0 no tamanho grátis, ~R$ 73/mês em 3/18 e ~R$ 146/mês em 4/24.

## Robô `careflow-cacador`

- VM E2.1.Micro (Always Free) com `deploy/oracle/a1-hunter.sh`; sem SSH nem chave; permissão só no compartimento `careflow` por instance principal.
- v2 (careflow #19): pausa de 60 s, 30 dias, checagem de existência e status a cada 5 rodadas nas tags livres, versão na tag `careflow-robo-versao`; apaga a si mesmo quando consegue.
- Rodar o `provision.sh` troca um robô antigo esperando ele ser apagado (duas A1 estourariam a cota grátis).

## Quando a A1 existir: o que é do Cleber

1. Rodar o `provision.sh` de novo.
2. Criar o subdomínio no DuckDNS e o token na VM (passo do runbook).
3. Criar o environment `production` no GitHub com o secret `DEPLOY_SSH_KEY` e as variáveis `DEPLOY_KNOWN_HOSTS`, `CAREFLOW_DEMO_HOST` e `CAREFLOW_SITE_ORIGIN` (nomes no `deploy.yml`).
4. Tornar público o pacote `careflow` no GHCR.
5. Disparar **Deploy da demonstração** e aprovar.
6. Definir `NEXT_PUBLIC_CAREFLOW_DEMO_URL` na Vercel e fazer redeploy do site (a CSP inclui o host sozinha).
7. Atualizar o post do LinkedIn (há um parágrafo pronto para trocar quando o backend estiver no ar).

## Rotina

- **Deploy:** workflow manual, aprovação no environment `production`, deploy por SSH pelo `careflow-deploy` (migrations, saúde, registro da versão), fumaça na URL pública (inclui porta 80 fechada), rollback automático para a imagem anterior.
- **Interruptor:** workflow "Interruptor do Painel ao vivo" ou `careflow-deploy demo on|off` na VM; desligado, `/demo/v1/status` responde `desligado` e o resto 503 com `Retry-After`.
- **Backup e restauração:** `careflow-backup`, `careflow-restore`, `careflow-restore-drill`; restaurar exige `erasure-replay` (o CI ensaia em todo PR).
- **Grafana:** só por túnel SSH para o loopback da VM.
- **Ociosidade:** o Painel e os timers mantêm a VM acima dos 20% de memória; não há garantia contratual.

## Alternativas descartadas (2026-10-19)

Vercel (containers dormem em 5 min; daemons com 10 vCPU-h/mês no Hobby), Render/Koyeb/Miget (256–512 MB ou cartão), Fly.io (só trial), Cloud Run (conta de faturamento), Hugging Face Docker Spaces (pago desde 2026-07), Codespaces (não serve ao público), PC do Cleber com ngrok (máquina pessoal exposta, 20 mil requisições/mês).
