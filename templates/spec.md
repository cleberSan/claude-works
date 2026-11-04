<!-- resumo: Modelo de spec (SDD) para docs/specs/NNNN-titulo/spec.md - problema, fora de escopo, critérios de aceite CA-NN em EARS, não funcionais e perguntas abertas. Variáveis DATA, NIVEL, NUMERO, TITULO. -->
# Spec {{NUMERO}}: {{TITULO}}

- Status: rascunho
- Data: {{DATA}}
- Nível: {{NIVEL}}
- PRs: <!-- repositório#N, quando abrir -->
- Relacionados: <!-- ADRs vigentes que restringem, spec anterior, prompt da fase -->

## Problema

<!-- Quem tem o problema, o que acontece hoje e por que importa. Duas a cinco frases, sem solução técnica. -->

## Objetivo

<!-- O resultado esperado, medível quando der. -->

## Fora de escopo

- <!-- O que não entra, para ninguém implementar "de brinde". -->

## Critérios de aceite

<!-- Um comportamento por critério, verificável por teste automatizado, em EARS:
     QUANDO <gatilho>, <sistema> DEVE <resposta>.
     SE <condição indesejada>, ENTÃO <sistema> DEVE <resposta>.
     ENQUANTO <estado>, <sistema> DEVE <resposta>.
     <sistema> DEVE <regra sempre válida>.
     Cubra caminho feliz, erro, limite e acesso indevido (outra clínica, sem escopo). -->

- **CA-01:** QUANDO <!-- gatilho -->, <!-- sistema --> DEVE <!-- resposta -->.
- **CA-02:** SE <!-- condição indesejada -->, ENTÃO <!-- sistema --> DEVE <!-- resposta -->.

## Requisitos não funcionais

<!-- Só os que valem para esta mudança; apague os outros. Meta numérica, nunca "rápido". -->

- **Segurança e privacidade:** <!-- autorização, isolamento, dado pessoal, LGPD, OWASP -->
- **Performance:** <!-- p95, vazão, tamanho de página ou pacote -->
- **Observabilidade:** <!-- span, métrica de negócio, log sem dado pessoal -->
- **Acessibilidade:** <!-- tela: WCAG 2.2 AA, teclado, temas claro e escuro -->
- **Custo:** zero; serviço novo só gratuito e sem risco de cobrança.

## Perguntas abertas

<!-- Cada uma com opções e a recomendada; a que é decisão do Cleber vira card. A spec só fica "aprovada" sem pergunta que mude o escopo. Sem perguntas: "Nenhuma". -->

- [A DECIDIR] <!-- pergunta -->. Opções: A (recomendada, porque ...), B.

## Plano e tarefas (só no nível leve)

<!-- No nível completo, apague esta seção: o como vai para plano.md e tarefas.md. -->

- Como: <!-- duas a quatro linhas: abordagem, arquivos principais, ADR se houver -->
- [ ] **T01** <!-- verbo + o quê --> — prova: <!-- teste ou comando --> — cobre: CA-01
