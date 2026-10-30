---
resumo: Linha do tempo das decisões do Cleber em todos os projetos, com o porquê e onde estão registradas.
atualizado: 2026-10-30
---

# Decisões

Decisões tomadas pelo Cleber (em geral num card com opção recomendada). O registro completo fica no ADR citado. Decisão nova entra no fim da tabela do projeto.

## Transversais

| Data | Decisão | Por quê | Registro |
|---|---|---|---|
| 2026-10-14 | Projeto vitrine em saúde + LGPD (CareFlow), em vez de orquestrador de pagamentos com ledger ou motor de cotas de fundos | Ampliar além de finanças sem perder o rigor de sistemas distribuídos | `plano-inicial.md` (pasta do projeto) |
| 2026-10-14 | Repositórios públicos, licença MIT, CI com cobertura ≥ 80%, CodeQL e revisão de dependências | Qualidade visível para quem avalia o portfólio | ADR-0000 e ADR-0001 de cada repo |
| 2026-10-16 | Hospedagem só gratuita e sem risco de cobrança | AWS e Azure custam; Vercel Hobby não mantém processos contínuos | careflow ADR-0013 |
| 2026-10-19 | Não mudar a conta Oracle para Pay As You Go | Risco de cobrança; vaga não garantida | `fase-9-decisoes.md` |
| 2026-10-26 | Base de conhecimento pública `claude-works`, em português | Economizar leitura de histórico e manter o mesmo idioma dos outros repos | [docs/adr/0001](../docs/adr/0001-base-em-camadas-e-publica.md) |
| 2026-10-26 | `claude-works` também sob licença MIT | Mesmo padrão dos outros repositórios | [LICENSE](../LICENSE) |
| 2026-10-30 | Dependabot sem clique a cada PR: auto-merge criterioso nos sites (major e minor de framework manuais), careflow mensal e agrupado sem auto-merge | Atualização de baixo risco esperava dias por um clique; major é onde o comportamento quebra | portfolio-web ADR-0007, lojinha ADR-0010, careflow ADR-0014 |

## CareFlow

| Data | Decisão | Por quê | Registro |
|---|---|---|---|
| 2026-10-14 | Vertical Slices + DDD onde há regra rica (Agenda, Consentimento); Result Pattern; .NET 10 | Menos cerimônia que camadas; erros de negócio explícitos | ADR-0001 |
| 2026-10-14 | Fase 2 (agenda) antes da fase 1 (site) | Mostrar o núcleo técnico primeiro | — |
| 2026-10-14 | Sem dupla reserva por exclusion constraint GiST, não por checagem prévia | Garantia no banco, sem TOCTOU | ADR-0002 |
| 2026-10-14 | Clínica vem da claim `tenant_id` do JWT; RLS no PostgreSQL | Isolamento mesmo com bug na aplicação | ADR-0003 |
| 2026-10-14 | Blind index HMAC do CPF no cofre | Recusar duplicado sem guardar CPF em claro | ADR-0004 |
| 2026-10-15 | Mensageria própria sobre `RabbitMQ.Client` com Outbox/Inbox; MassTransit e Wolverine descartados | MassTransit v9 é comercial e a v8 perde correções no fim de 2026 | ADR-0006 |
| 2026-10-15 | Agenda valida paciente por projeção local alimentada por eventos (consistência eventual aceita) | Sem chamada síncrona ao cofre na reserva | ADR-0008 |
| 2026-10-15 | Revogação de consentimento bloqueia reservas e cancela as futuras | Revogação tem efeito real e auditável | ADR-0008 |
| 2026-10-15 | Auditoria com cadeia HMAC-SHA256 por clínica, chave fora do banco | Detecta adulteração, remoção e reordenação | ADR-0007 |
| 2026-10-15 | Notifications lê contato no cofre na hora, com token de serviço; provedores simulados; sem Redis; agendador próprio com `SKIP LOCKED` | Contato só no cofre; custo zero | ADR-0009 |
| 2026-10-15 | Painel = replay de gravação do CI; observabilidade local com imagens AGPL sem modificação; sem YARP/Keycloak (BFF do Demo) | Sem custo de hospedagem nesta fase | ADR-0010 |
| 2026-10-15 | Triagem com Claude Haiku 5.5 pelo SDK oficial C# (MIT); CI e Painel usam respostas gravadas; workflow manual com teto de chamadas | Custo zero por build e resultado reproduzível | ADR-0011 |
| 2026-10-15 | Auditoria guarda só o SHA-256 do que saiu para o modelo (evento `audit.content-disclosed`) | Prova sem reter texto | ADR-0011 |
| 2026-10-16 | Política de retenção fixa e versionada no código; identidade do titular por código de uso único; pacote cifrado por 7 dias, link de 15 min | Menos superfície; sem login de paciente | ADR-0012 |
| 2026-10-16 | Firely SDK (BSD-3) para FHIR R4 com validação no processo | Valida contra perfis base sem Java no CI | ADR-0012 |
| 2026-10-16 | Backend numa VM Oracle Always Free (A1 ARM); DuckDNS; chaves no OCI Vault (software) por instance principal; backup no Object Storage por 7 dias; observabilidade na VM | Única opção gratuita que comporta a stack (~7 GB) | ADR-0013 |
| 2026-10-18 | Robô na Oracle tenta criar a A1 enquanto não há vaga | São Paulo sem capacidade A1 por dias | careflow #18 |
| 2026-10-19 | Robô "insistente" (30 dias, pausa de 60 s) e sem upgrade pago | Manter custo zero | careflow #19 |

## portfolio-web

| Data | Decisão | Por quê | Registro |
|---|---|---|---|
| 2026-10-14 | Next.js 16 + Tailwind 4 + Vitest + Playwright com axe | Stack moderna com qualidade medida | ADR-0001 |
| 2026-10-14 | CSP completa sem nonce | Mantém páginas estáticas | ADR-0003 |
| 2026-10-14 | Diário em MDX com registro tipado e 404 real | Conteúdo versionado e seguro | ADR-0004 |
| 2026-10-14 | Vercel Hobby pela integração com o GitHub (sem token no GitHub) | Grátis; Hobby é só não comercial | ADR-0005 |
| 2026-10-18 | Visual "Sala de controle" (topologia animada, KPIs); tema segue o sistema, sem botão | Botão sem flash exigiria script inline, que a CSP sem nonce não permite | portfolio-web #19 |
| 2026-10-18 | Site centrado no Cleber (trajetória, competências) e contato só LinkedIn + GitHub | Site era centrado demais no CareFlow; privacidade | portfolio-web #20 |
| 2026-10-23 | Seção "O fluxo em um minuto" com vídeo na página do CareFlow | Mostrar o produto sem backend no ar | portfolio-web #25 |
| 2026-10-27 | Home como portfólio de página única (cases, atuação, trajetória, contato) e currículo em `/curriculo`; telefone e WhatsApp passam a ser publicados no site, e-mail e endereço continuam fora | Pedido do Cleber, com um portfólio de referência; ele autorizou o telefone | portfolio-web #29 |
| 2026-10-27 | O site não é currículo online nem fala em disponibilidade: sai a página `/curriculo` (301 para `/sobre`) | O site mostra quem ele é e como trabalha | portfolio-web #30 |
| 2026-10-27 | Home e Sobre em inglês (`/en`, `/en/about`) com seletor PT-BR \| EN; projetos, diário e Painel seguem em português | Alcance de quem lê em inglês, sem traduzir tudo de uma vez | ADR-0006, portfolio-web #31 |

## lojinha-da-lua

| Data | Decisão | Por quê | Registro |
|---|---|---|---|
| 2026-10-23 | Astro 7 estático com ilha React | Zero JavaScript por padrão | ADR-0001 |
| 2026-10-23 | Cloudflare Workers com arquivos estáticos, grátis | Vercel Hobby e GitHub Pages proíbem uso comercial | ADR-0002 |
| 2026-10-23 | Pedido pelo WhatsApp, sem backend e sem coletar dado pessoal | Simplicidade e LGPD | ADR-0005 |
| 2026-10-23 | "Montar pedido" no navegador com `localStorage` | Vários itens numa mensagem só | ADR-0006 |
| 2026-10-23 | Endereço de produção no código e conferência diária do site no ar | Variáveis de build da Cloudflare não são compartilhadas entre abas | ADR-0008 |
| 2026-10-24 | Fotos dos flyers com estampas de terceiros, risco aceito (substitui o ADR-0003) | Catálogo com imagens reais da loja | ADR-0009 |
