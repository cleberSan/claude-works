import assert from "node:assert/strict";
import { mkdir, readFile, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { describe, it } from "node:test";
import { main as iniciarRepositorio, nextSteps, planRepository, readSettings, STACKS } from "../scripts/iniciar-repositorio.mjs";
import { main as indice } from "../scripts/indice.mjs";
import { listTemplates, main as modelo, templateCandidates } from "../scripts/modelo.mjs";
import { main as tokens } from "../scripts/tokens.mjs";
import { escapeAnnotation, formatAnnotation, main as validar } from "../scripts/validar-kb.mjs";
import { REPOSITORY_ROOT } from "../utils/cli.mjs";
import { captureOutput, contentFile, fake, makeTempDir, writeTree } from "./helpers.mjs";

const TODAY = "2026-10-26";
const exists = (file) => stat(file).then(() => true, () => false);

/** Base mínima válida numa pasta temporária, com o índice gerado. */
async function makeBase(t, extra = {}) {
  const root = await makeTempDir(t);
  await writeTree(root, {
    "CLAUDE.md": "# Base\n\nVeja o [índice](INDICE.md).\n",
    "memorias/a.md": contentFile("Memória A.", "2026-10-01", "# A\n\n" + "texto ".repeat(200)),
    "projetos/careflow/README.md": contentFile("Cartão do CareFlow."),
    ...extra,
  });
  assert.equal(await indice([], { root, ...captureOutput() }), 0);
  return root;
}

describe("validar-kb", () => {
  it("passa na base válida", async (t) => {
    const root = await makeBase(t);
    const output = captureOutput();

    const code = await validar([], { root, today: TODAY, env: {}, ...output });

    assert.equal(code, 0);
    assert.match(output.lines.out[0], /Base válida: 4 arquivos/);
  });

  it("lista os problemas e sai com 1", async (t) => {
    const root = await makeBase(t);
    await writeFile(path.join(root, "CLAUDE.md"), `# Base\n\n[x](nao-existe.md) ${fake.cpf()}\n`);
    const output = captureOutput();

    const code = await validar(["--raiz", root], { today: TODAY, env: {}, ...output });

    assert.equal(code, 1);
    assert.deepEqual(output.lines.err.slice(0, 2).map((line) => line.split(" [")[1].split("]")[0]), ["link", "dado-sensivel"]);
    assert.match(output.lines.err.at(-1) ?? "", /2 problema\(s\)/);
  });

  it("vira anotação no GitHub Actions", async (t) => {
    const root = await makeBase(t);
    await writeFile(path.join(root, "CLAUDE.md"), "[x](nao-existe.md)\n");
    const output = captureOutput();

    await validar([], { root, today: TODAY, env: { GITHUB_ACTIONS: "true" }, ...output });

    assert.equal(output.lines.err[0], "::error file=CLAUDE.md,line=1,title=link::link quebrado: nao-existe.md");
  });

  it("mostra a ajuda e recusa opção desconhecida", async () => {
    const help = captureOutput();
    assert.equal(await validar(["--ajuda"], help), 0);
    assert.match(help.lines.out[0], /^Uso:/);

    const wrong = captureOutput();
    assert.equal(await validar(["--forca"], wrong), 2);
    assert.deepEqual(wrong.lines.err, ["opção desconhecida: --forca"]);
  });

  it("escapa texto de anotação para não abrir outro comando", () => {
    assert.equal(escapeAnnotation("a%b\r\n::c"), "a%25b%0D%0A::c");
    assert.equal(escapeAnnotation("a:b,c", true), "a%3Ab%2Cc");
    assert.equal(formatAnnotation({ file: "INDICE.md", rule: "indice", message: "velho" }), "::error file=INDICE.md,title=indice::velho");
  });
});

describe("indice", () => {
  it("cria, reconhece em dia, verifica e atualiza o índice", async (t) => {
    // Arrange
    const root = await makeTempDir(t);
    await writeTree(root, { "memorias/a.md": contentFile("A.") });
    const first = captureOutput();

    // Act + Assert: cria
    assert.equal(await indice([], { root, ...first }), 0);
    assert.match(first.lines.out[0], /INDICE\.md criado \(1 arquivos\)/);
    assert.match(await readFile(path.join(root, "INDICE.md"), "utf8"), /\[a\.md\]\(memorias\/a\.md\)/);

    // em dia
    const second = captureOutput();
    assert.equal(await indice(["--verificar"], { root, ...second }), 0);
    assert.match(second.lines.out[0], /já está em dia/);

    // velho
    await writeTree(root, { "memorias/b.md": contentFile("B."), "memorias/sem-resumo.md": "# nada\n" });
    const check = captureOutput();
    assert.equal(await indice(["--verificar", `--raiz=${root}`], check), 1);
    assert.deepEqual(check.lines.err, ["memorias/sem-resumo.md: sem resumo, ficou fora do índice (rode npm run validar).", "INDICE.md desatualizado. Rode npm run indice e commite o resultado."]);

    // atualiza
    const update = captureOutput();
    assert.equal(await indice([], { root, ...update }), 0);
    assert.match(update.lines.out[0], /atualizado \(2 arquivos\)/);
  });

  it("mostra a ajuda e recusa opção desconhecida", async () => {
    assert.equal(await indice(["--ajuda"], captureOutput()), 0);
    assert.equal(await indice(["--forca"], captureOutput()), 2);
  });

  it("propaga erro de leitura que não é arquivo ausente", async (t) => {
    const root = await makeTempDir(t);
    await mkdir(path.join(root, "INDICE.md"));
    await assert.rejects(indice([], { root, ...captureOutput() }), /EISDIR/);
  });
});

describe("tokens", () => {
  it("mostra leitura mínima, seções e os mais pesados", async (t) => {
    const root = await makeBase(t);
    const output = captureOutput();

    assert.equal(await tokens(["--top", "1"], { root, ...output }), 0);

    const text = output.lines.out.join("\n");
    assert.match(text, /Leitura mínima \(CLAUDE\.md \+ INDICE\.md\): ~\d/);
    assert.match(text, /Arquivos: 2, /);
    assert.match(text, /memorias\/ +1 arquivos/);
    assert.match(text, /Mais pesados \(top 1\):\n +~[\d,k]+ +memorias\/a\.md$/);
  });

  it("filtra por pasta e avisa quando não acha nada", async (t) => {
    const root = await makeBase(t);
    const filtered = captureOutput();
    assert.equal(await tokens(["--pasta", "projetos/careflow/"], { root, ...filtered }), 0);
    assert.match(filtered.lines.out[1], /Arquivos em projetos\/careflow\/: 1/);

    const empty = captureOutput();
    assert.equal(await tokens(["--pasta", "nada/", `--raiz=${root}`], empty), 1);
    assert.match(empty.lines.err[0], /Nenhum arquivo/);
  });

  it("valida --top e mostra a ajuda", async () => {
    const wrong = captureOutput();
    assert.equal(await tokens(["--top", "0"], wrong), 2);
    assert.match(wrong.lines.err[0], /--top/);
    assert.equal(await tokens(["--ajuda"], captureOutput()), 0);
  });
});

describe("modelo", () => {
  it("lista os modelos com variáveis e resumo", async () => {
    const output = captureOutput();
    assert.equal(await modelo(["--listar"], output), 0);
    assert.ok(output.lines.out.some((line) => /^adr\.md +\[DATA, NUMERO, TITULO\] Modelo de ADR/.test(line)));
  });

  it("gera o arquivo na pasta de quem chamou e nunca sobrescreve", async (t) => {
    // Arrange
    const cwd = await makeTempDir(t);
    const args = ["templates/adr.md", "docs/adr/0014-carga.md", "NUMERO=0014", "TITULO=Testes de carga", "DATA=2026-11-02"];

    // Act
    const created = captureOutput();
    const code = await modelo(args, { cwd, ...created });

    // Assert
    assert.equal(code, 0);
    const content = await readFile(path.join(cwd, "docs/adr/0014-carga.md"), "utf8");
    assert.match(content, /^# ADR-0014: Testes de carga\n/);
    assert.doesNotMatch(content, /resumo:|\{\{/);

    const again = captureOutput();
    assert.equal(await modelo([...args.slice(0, 2), "NUMERO=9999", "TITULO=x", "DATA=2026-11-02"], { cwd, ...again }), 1);
    assert.match(again.lines.err[0], /já existe/);
    assert.equal(await readFile(path.join(cwd, "docs/adr/0014-carga.md"), "utf8"), content);
  });

  it("acusa variável faltando sem criar arquivo, e avisa sobra", async (t) => {
    const cwd = await makeTempDir(t);
    const missing = captureOutput();
    assert.equal(await modelo(["adr", "x.md", "NUMERO=1", "TITULOS=x"], { cwd, ...missing }), 1);
    assert.match(missing.lines.err[0], /faltam variáveis: DATA, TITULO/);
    assert.equal(await exists(path.join(cwd, "x.md")), false);

    const extra = captureOutput();
    assert.equal(await modelo(["checklist-api", "y.md", "SOBRA=1"], { cwd, ...extra }), 0);
    assert.match(extra.lines.err[0], /não usa SOBRA/);
  });

  it("recusa modelo desconhecido, argumento inválido e uso incompleto", async (t) => {
    const cwd = await makeTempDir(t);
    const unknown = captureOutput();
    assert.equal(await modelo(["nao-existe", "x.md"], { cwd, ...unknown }), 1);
    assert.match(unknown.lines.err[0], /Disponíveis: .*adr\.md/);

    assert.equal(await modelo(["adr", "x.md", "titulo=x"], { cwd, ...captureOutput() }), 2);
    const incomplete = captureOutput();
    assert.equal(await modelo(["adr"], { cwd, ...incomplete }), 2);
    assert.deepEqual(incomplete.lines.err, ["informe o modelo e o destino"]);
    assert.equal(await modelo(["--ajuda"], captureOutput()), 0);
    assert.equal(await modelo(["--forca", "a", "b"], captureOutput()), 2);
  });

  it("aceita o nome do modelo de várias formas, só dentro de templates/", () => {
    assert.deepEqual(templateCandidates("adr"), ["adr.md", "adr.mdx"]);
    assert.deepEqual(templateCandidates("./templates/post-diario.mdx"), ["post-diario.mdx"]);
    assert.deepEqual(templateCandidates("templates\\adr.md"), ["adr.md"]);
    assert.deepEqual(templateCandidates("../segredo.md"), []);
    assert.deepEqual(templateCandidates("templates/"), []);
  });

  it("todos os modelos reais declaram as variáveis e geram sem sobra", async () => {
    for (const { name, text, variables } of await listTemplates(REPOSITORY_ROOT)) {
      assert.doesNotMatch(text.split("\n")[1] ?? "", /resumo:/, name);
      for (const variable of variables) assert.match(variables.join(), new RegExp(variable), name);
    }
  });
});

describe("iniciar-repositorio", () => {
  const baseArgs = (destination, stack = "dotnet") => ["--destino", destination, "--stack", stack, "--nome", "novo-servico", "--descricao", "Serviço de teste."];

  it("cria o padrão do ecossistema para .NET sem deixar variável nem cabeçalho de modelo", async (t) => {
    // Arrange
    const destination = await makeTempDir(t);
    const output = captureOutput();

    // Act
    const code = await iniciarRepositorio(baseArgs(destination), { today: TODAY, ...output });

    // Assert
    assert.equal(code, 0);
    const read = (relative) => readFile(path.join(destination, relative), "utf8");
    assert.equal(await read(".github/CODEOWNERS"), "* @cleberSan\n");
    assert.match(await read(".github/workflows/codeql.yml"), /language: \[csharp, actions\]/);
    const dependabot = await read(".github/dependabot.yml");
    assert.match(dependabot, /package-ecosystem: nuget/);
    assert.doesNotMatch(dependabot, /package-ecosystem: npm/);
    assert.match(await read("README.md"), /github\.com\/cleberSan\/novo-servico\/actions/);
    assert.match(await read("docs/adr/0000-registrar-decisoes-com-adr.md"), /Data: 2026-10-26/);
    for (const { target } of await planRepository(REPOSITORY_ROOT, { stack: "dotnet", name: "x", owner: "o", description: "d", date: TODAY })) {
      const content = await read(target);
      assert.doesNotMatch(content, /\{\{[A-Z_]+\}\}|^# resumo:|^<!-- resumo:|^# Copie para/m, target);
    }
    assert.ok(output.lines.out.includes("criado    .github/workflows/ci.yml"));
    assert.ok(output.lines.out.some((line) => line.includes('"Build, formatação e testes"')));
  });

  it("mantém o que já existe e só simula com --simular", async (t) => {
    const destination = await makeTempDir(t);
    await writeTree(destination, { "README.md": "# Meu README\n" });

    const simulated = captureOutput();
    assert.equal(await iniciarRepositorio([...baseArgs(destination, "node"), "--simular"], { today: TODAY, ...simulated }), 0);
    assert.ok(simulated.lines.out.includes("mantido   README.md (já existe)"));
    assert.ok(simulated.lines.out.includes("criaria   .github/workflows/ci.yml"));
    assert.equal(await exists(path.join(destination, ".github")), false);

    assert.equal(await iniciarRepositorio(baseArgs(destination, "node"), { today: TODAY, ...captureOutput() }), 0);
    assert.equal(await readFile(path.join(destination, "README.md"), "utf8"), "# Meu README\n");
    assert.match(await readFile(path.join(destination, ".github/workflows/codeql.yml"), "utf8"), /javascript-typescript, actions/);
  });

  it("resolve o destino a partir da pasta de quem chamou", async (t) => {
    const cwd = await makeTempDir(t);
    await mkdir(path.join(cwd, "clone"));
    assert.equal(await iniciarRepositorio(["--destino", "clone", "--stack", "node", "--nome", "x"], { cwd, today: TODAY, ...captureOutput() }), 0);
    assert.equal(await exists(path.join(cwd, "clone/SECURITY.md")), true);
  });

  it("recusa opções inválidas antes de escrever", async (t) => {
    const destination = await makeTempDir(t);
    const output = captureOutput();
    const code = await iniciarRepositorio(["--stack", "java", "--nome", "..", "--dono", "-mau", "--descricao", "duas\nlinhas", "--data", "2026-02-30", "extra"], { ...output });
    assert.equal(code, 2);
    assert.deepEqual(output.lines.err, [
      "argumento inesperado: extra",
      "--destino é obrigatório (a pasta do clone)",
      "--stack deve ser dotnet ou node",
      "--nome deve ser o nome do repositório (letras, números, ponto, hífen, sublinhado)",
      "--dono deve ser um login do GitHub válido",
      "--descricao deve ser uma frase em uma linha",
      "--data deve ser AAAA-MM-DD",
    ]);

    const missing = captureOutput();
    assert.equal(await iniciarRepositorio(["--destino", path.join(destination, "nao-existe"), "--stack", "node", "--nome", "x"], missing), 1);
    assert.match(missing.lines.err[0], /não é uma pasta existente/);

    assert.equal(await iniciarRepositorio(["--ajuda"], captureOutput()), 0);
  });

  it("lê padrões e monta os próximos passos por stack", () => {
    const { settings } = readSettings({ destino: ".", stack: "node", nome: "site" }, TODAY);
    assert.deepEqual(settings, { stack: "node", name: "site", owner: "cleberSan", description: "Descreva o projeto em uma frase.", date: TODAY });
    assert.ok(nextSteps({ stack: "node" }).some((line) => line.includes(STACKS.node.check)));
  });

  it("falha alto se um modelo usar variável sem valor", async (t) => {
    const root = await makeTempDir(t);
    await writeTree(root, {
      "pipelines/ci-node.yml": "name: CI\n",
      "pipelines/codeql.yml": "language: [x]\n",
      "pipelines/dependabot.yml": "version: 2\nupdates:\n  - package-ecosystem: npm\n",
      "templates/pull-request.md": "{{NOVA}}\n",
    });
    await assert.rejects(planRepository(root, { stack: "node", name: "x", owner: "o", description: "d", date: TODAY }), /pull-request\.md usa variáveis sem valor: NOVA/);
  });
});
