<!-- resumo: Corpo de PR no padrão dos repositórios (Antes, Depois, Como, Checklist), com riscos, testes e ordem de merge. -->
## Antes

<!-- Como era e qual o problema, em 1 a 3 frases. -->

## Depois

<!-- O que muda para quem usa ou opera. Prints ou links de prévia quando houver tela. -->

## Como

<!-- Decisões técnicas, arquivos principais, ADR criado ou atualizado. -->

### Riscos e rollback

<!-- O que pode quebrar, como perceber e como voltar. Ordem de merge se depender de outro PR (ex.: careflow antes do site). -->

### Testes

<!-- Unidade, integração, E2E: o que foi coberto e o que não foi (e por quê). Cobertura do CI. -->

## Checklist

- [ ] Testes cobrem cenários felizes, de erro e limites
- [ ] Nenhum dado pessoal real, segredo ou dado sensível em código, logs ou testes
- [ ] ADR criado ou atualizado se houve decisão arquitetural
- [ ] Observabilidade considerada (logs estruturados, traces, métricas)
- [ ] Acessibilidade verificada quando há tela (semântica, contraste, teclado)
- [ ] Base de conhecimento (claude-works) atualizada se mudou fato, decisão ou convenção
