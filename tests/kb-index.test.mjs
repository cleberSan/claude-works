import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { buildIndex, classifyFile, estimateTokens, formatTokens } from "../utils/kb-index.mjs";

describe("classifyFile", () => {
  it("classifica cada tipo de arquivo da base", () => {
    const cases = {
      "memorias/decisoes.md": ["content", "decisoes.md"],
      "projetos/careflow/README.md": ["content", "careflow/README.md"],
      "templates/adr.md": ["template", "adr.md"],
      "templates/post-diario.mdx": ["template", "post-diario.mdx"],
      "pipelines/ci-node.yml": ["pipeline", "ci-node.yml"],
      "pipelines/README.md": ["content", "README.md"],
      ".claude/skills/novo-adr/SKILL.md": ["skill", "novo-adr"],
      ".claude/agents/qa-destrutivo.md": ["subagent", "qa-destrutivo"],
      "scripts/README.md": ["content", "README.md"],
    };
    for (const [file, [kind, label]] of Object.entries(cases)) {
      const classification = classifyFile(file);
      assert.equal(classification?.kind, kind, file);
      assert.equal(classification?.label, label, file);
    }
  });

  it("deixa de fora raiz, testes, código e arquivos auxiliares", () => {
    for (const file of [
      "README.md",
      "CLAUDE.md",
      "INDICE.md",
      "tests/a.test.mjs",
      "utils/files.mjs",
      "scripts/indice.mjs",
      ".github/pull_request_template.md",
      ".claude/skills/novo-adr/referencia.md",
      ".claude/agents/sub/x.md",
      "templates/notas.txt",
      "pipelines/x.json",
      "memorias/imagem.png",
    ]) {
      assert.equal(classifyFile(file), undefined, file);
    }
  });
});

describe("estimateTokens e formatTokens", () => {
  it("estima por caracteres e arredonda em centenas", () => {
    assert.equal(estimateTokens("a".repeat(35)), 10);
    assert.equal(formatTokens(10), "~100");
    assert.equal(formatTokens(949), "~900");
    assert.equal(formatTokens(951), "~1,0k");
    assert.equal(formatTokens(2149), "~2,1k");
  });
});

describe("buildIndex", () => {
  it("agrupa por seção na ordem do mapa, ordena e soma", () => {
    // Arrange
    const entries = [
      { file: "stacks/dotnet.md", summary: "Stack .NET.", tokens: 500 },
      { file: "memorias/z.md", summary: "Z.", tokens: 300 },
      { file: "memorias/a.md", summary: "A.", tokens: 200 },
      { file: ".claude/skills/novo-adr/SKILL.md", summary: "Skill.", tokens: 100 },
    ];

    // Act
    const index = buildIndex(entries);

    // Assert
    const lines = index.split("\n");
    const order = lines.filter((line) => line.startsWith("## ") || line.startsWith("- "));
    assert.deepEqual(order, [
      "## Memórias (`memorias/`)",
      "- [a.md](memorias/a.md) ~200: A.",
      "- [z.md](memorias/z.md) ~300: Z.",
      "## Stacks (`stacks/`)",
      "- [dotnet.md](stacks/dotnet.md) ~500: Stack .NET.",
      "## Skills do Claude Code (`.claude/skills/`)",
      "- [novo-adr](.claude/skills/novo-adr/SKILL.md) ~100: Skill.",
    ]);
    assert.match(index, /Total: 4 arquivos, ~1,1k tokens/);
    assert.ok(index.startsWith("<!-- Gerado por"));
    assert.ok(index.endsWith("\n"));
  });
});
