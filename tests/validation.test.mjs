import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { buildIndex } from "../utils/kb-index.mjs";
import { collectIndexEntries, formatProblem, loadRepository, validateRepository } from "../utils/validation.mjs";
import { contentFile, fake, makeTempDir, writeTree } from "./helpers.mjs";

const TODAY = "2026-10-26";

/** Repositório em memória; valor null é arquivo binário (existe, mas não é lido). */
function repository(files) {
  const list = Object.keys(files).sort((a, b) => a.localeCompare(b, "en"));
  const texts = new Map(Object.entries(files).filter(([, text]) => text !== null));
  return { files: list, texts };
}

/** Repositório com o INDICE.md gerado a partir dos próprios arquivos. */
function withIndex(files) {
  return repository({ ...files, "INDICE.md": buildIndex(collectIndexEntries(repository(files))) });
}

const VALID = Object.freeze({
  "CLAUDE.md": "# Base\n\nVeja [memorias](memorias/), [a](memorias/a.md#x), [logo](img/logo.png) e [site](https://a.test).\n",
  "img/logo.png": null,
  "memorias/a.md": contentFile("Memória A.", "2026-10-01", "# A\n\n[voltar](../CLAUDE.md)\n"),
  "templates/adr.md": "<!-- resumo: Modelo de ADR. Variáveis DATA, TITULO. -->\n# {{TITULO}}\n\n{{DATA}} e [licença](LICENSE)\n",
  "templates/checklist.md": "<!-- resumo: Checklist sem variáveis. -->\n- [ ] item\n",
  "pipelines/ci.yml": "# resumo: CI de teste.\nname: CI\n",
  ".claude/skills/novo-adr/SKILL.md": "---\nname: novo-adr\ndescription: Cria ADR.\n---\n# Skill\n",
  ".claude/agents/revisor.md": "---\nname: revisor\ndescription: Revisa PR.\ntools: Read, Grep\n---\n# Agente\n",
});

/** Regras dos problemas encontrados com `overrides` aplicados à base válida. */
function rulesWith(overrides) {
  return validateRepository(withIndex({ ...VALID, ...overrides }), { today: TODAY }).map((problem) => problem.rule);
}

function problemsWith(overrides) {
  return validateRepository(withIndex({ ...VALID, ...overrides }), { today: TODAY });
}

describe("validateRepository", () => {
  it("aceita a base válida", () => {
    assert.deepEqual(validateRepository(withIndex(VALID), { today: TODAY }), []);
  });

  describe("arquivos de conteúdo", () => {
    it("exige front matter", () => {
      assert.deepEqual(rulesWith({ "memorias/a.md": "# Sem front matter\n" }), ["front-matter"]);
    });

    it("acusa front matter malformado", () => {
      const [problem] = problemsWith({ "memorias/a.md": "---\nlinha ruim\n---\n" });
      assert.equal(problem.rule, "front-matter");
      assert.match(problem.message, /linha inválida/);
    });

    it("exige resumo", () => {
      const [problem] = problemsWith({ "memorias/a.md": "---\natualizado: 2026-10-01\n---\n" });
      assert.equal(problem.rule, "resumo");
      assert.match(problem.message, /no front matter/);
    });

    it("limita o tamanho do resumo", () => {
      assert.deepEqual(rulesWith({ "memorias/a.md": contentFile("x".repeat(251)) }), ["resumo"]);
      assert.deepEqual(rulesWith({ "memorias/a.md": contentFile("x".repeat(250)) }), []);
    });

    it("exige atualizado válido e não futuro", () => {
      assert.deepEqual(rulesWith({ "memorias/a.md": "---\nresumo: x\n---\n" }), ["atualizado"]);
      assert.deepEqual(rulesWith({ "memorias/a.md": contentFile("x", "2026-13-01") }), ["atualizado"]);
      assert.deepEqual(rulesWith({ "memorias/a.md": contentFile("x", "2026-10-27") }), ["atualizado"]);
      assert.deepEqual(rulesWith({ "memorias/a.md": contentFile("x", TODAY) }), []);
    });

    it("limita o arquivo a 16 KB", () => {
      assert.deepEqual(rulesWith({ "memorias/a.md": contentFile("x", "2026-10-01", "y".repeat(16 * 1024)) }), ["tamanho"]);
    });
  });

  describe("modelos e workflows", () => {
    it("exige que o resumo declare as variáveis usadas", () => {
      const [problem] = problemsWith({ "templates/adr.md": "<!-- resumo: ADR. Variáveis DATA. -->\n{{TITULO}} {{DATA}}\n" });
      assert.equal(problem.rule, "modelo");
      assert.match(problem.message, /\[DATA\].*\[DATA, TITULO\]/);
      assert.deepEqual(rulesWith({ "templates/adr.md": "<!-- resumo: ADR sem declarar. -->\n{{TITULO}}\n" }), ["modelo"]);
    });

    it("exige o comentário de resumo na primeira linha", () => {
      const [problem] = problemsWith({ "pipelines/ci.yml": "name: CI\n" });
      assert.equal(problem.rule, "resumo");
      assert.match(problem.message, /primeira linha/);
    });
  });

  describe("skills e subagentes", () => {
    it("exige name igual à pasta ou ao arquivo", () => {
      const [skill] = problemsWith({ ".claude/skills/novo-adr/SKILL.md": "---\nname: outro\ndescription: x\n---\n" });
      assert.match(skill.message, /"novo-adr" \(o nome da pasta\)/);
      const [agent] = problemsWith({ ".claude/agents/revisor.md": "---\nname: outro\ndescription: x\n---\n" });
      assert.equal(agent.rule, "subagente");
      assert.match(agent.message, /do arquivo/);
    });

    it("recusa nome fora do formato ou reservado", () => {
      assert.deepEqual(rulesWith({ ".claude/skills/Novo_ADR/SKILL.md": "---\nname: Novo_ADR\ndescription: x\n---\n" }), ["skill"]);
      assert.deepEqual(rulesWith({ ".claude/skills/claude-ajuda/SKILL.md": "---\nname: claude-ajuda\ndescription: x\n---\n" }), ["skill"]);
    });

    it("exige description dentro do limite", () => {
      assert.deepEqual(rulesWith({ ".claude/skills/novo-adr/SKILL.md": "---\nname: novo-adr\n---\n" }), ["skill"]);
      assert.deepEqual(rulesWith({ ".claude/skills/novo-adr/SKILL.md": `---\nname: novo-adr\ndescription: ${"x".repeat(1025)}\n---\n` }), ["skill"]);
    });

    it("exige front matter", () => {
      const [problem] = problemsWith({ ".claude/agents/revisor.md": "# Só título\n" });
      assert.equal(problem.rule, "subagente");
      assert.match(problem.message, /name e description/);
    });
  });

  describe("links", () => {
    it("acusa link quebrado com a linha", () => {
      const [problem] = problemsWith({ "CLAUDE.md": "# Base\n\n[x](memorias/nao-existe.md)\n" });
      assert.deepEqual([problem.rule, problem.line], ["link", 3]);
    });

    it("acusa link que sai do repositório", () => {
      const [problem] = problemsWith({ "memorias/a.md": contentFile("x", "2026-10-01", "[fora](../../fora.md)") });
      assert.match(problem.message, /para fora/);
    });
  });

  describe("dados sensíveis", () => {
    it("varre todo arquivo de texto, inclusive fora do índice", () => {
      const problems = problemsWith({ "tests/x.test.mjs": `const contato = "${fake.email()}";\n` });
      assert.deepEqual(problems.map((problem) => [problem.file, problem.rule]), [["tests/x.test.mjs", "dado-sensivel"]]);
      assert.ok(!problems[0].message.includes(fake.email()));
    });
  });

  describe("índice", () => {
    it("acusa índice ausente ou desatualizado", () => {
      const files = { ...VALID };
      assert.deepEqual(validateRepository(repository(files), { today: TODAY }).map((problem) => problem.rule), ["indice"]);
      const outdated = repository({ ...files, "INDICE.md": "# Índice velho\n" });
      assert.match(validateRepository(outdated, { today: TODAY })[0].message, /desatualizado/);
    });

    it("aceita o índice com quebra de linha do Windows", () => {
      const base = withIndex(VALID);
      base.texts.set("INDICE.md", /** @type {string} */ (base.texts.get("INDICE.md")).replace(/\n/g, "\r\n"));
      assert.deepEqual(validateRepository(base, { today: TODAY }), []);
    });
  });

  it("ordena por arquivo e linha", () => {
    const problems = problemsWith({ "CLAUDE.md": "[a](x.md)\n[b](y.md)\n", "memorias/a.md": "# sem front matter\n" });
    assert.deepEqual(problems.map((problem) => `${problem.file}:${problem.line}`), ["CLAUDE.md:1", "CLAUDE.md:2", "memorias/a.md:1"]);
  });
});

describe("formatProblem", () => {
  it("escreve arquivo, linha, regra e mensagem", () => {
    assert.equal(formatProblem({ file: "a.md", line: 3, rule: "link", message: "quebrado" }), "a.md:3 [link] quebrado");
    assert.equal(formatProblem({ file: "INDICE.md", rule: "indice", message: "velho" }), "INDICE.md [indice] velho");
  });
});

describe("loadRepository", () => {
  it("lista todos os arquivos e lê só os de texto", async (t) => {
    // Arrange
    const root = await makeTempDir(t);
    await writeTree(root, { "a.md": "# A\n", "img/x.png": "binário", "s/b.mjs": "export {};\n" });

    // Act
    const { files, texts } = await loadRepository(root);

    // Assert
    assert.deepEqual(files, ["a.md", "img/x.png", "s/b.mjs"]);
    assert.deepEqual([...texts.keys()], ["a.md", "s/b.mjs"]);
  });
});
