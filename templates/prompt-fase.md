<!-- resumo: Modelo do prompt-fase-N.md que o Cleber cola no chat do projeto para abrir a próxima fase. Variáveis PROJETO, FASE, TITULO. -->
Vamos começar a fase {{FASE}} do {{PROJETO}}: {{TITULO}}.

Escopo:
* <!-- entrega 1, com o critério de pronto -->
* <!-- entrega 2 -->
* Testes:
  - unitários e de integração de <!-- regra nova -->;
  - <!-- E2E, carga, fumaça, conforme a fase -->;
  - Playwright com axe nos dois temas no site, se a fase mexer em tela.
* ADR das decisões, post da fase no diário do site e roadmap do site atualizado.

Pontos herdados:
* <!-- Fase anterior (ADR-NNNN): o que ficou adiado ou o risco que esta fase precisa respeitar. -->
* <!-- Pesquisa feita (data, thread): fatos que não devem ser refeitos. -->

Regras de sempre: só dados sintéticos, sem promessa clínica nem jurídica, PRs separados no careflow e no site (o do site entra depois do careflow), revisados por mim com CI verde e cobertura mínima de 80%. Hospedagem e serviços só gratuitos, sem risco de cobrança. Nunca peça para eu colar chave ou senha no chat. Me pergunte antes de codar se alguma decisão mudar o escopo ou trouxer custo ou licença, em especial:
* <!-- decisão 1 que é minha, com as opções que você enxerga -->
* <!-- decisão 2 -->
