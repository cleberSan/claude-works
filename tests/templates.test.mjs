import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  findPlaceholders,
  parseAssignments,
  renderTemplate,
  selectDependabotEcosystems,
  setCodeqlLanguages,
  stripTemplateHeader,
} from "../utils/templates.mjs";

describe("findPlaceholders", () => {
  it("lista variáveis únicas em ordem e ignora expressões do Actions", () => {
    const text = "{{TITULO}} {{DATA}} {{TITULO}} ${{ matrix.language }} {{minusculo}}";
    assert.deepEqual(findPlaceholders(text), ["DATA", "TITULO"]);
  });
});

describe("stripTemplateHeader", () => {
  it("tira o comentário de resumo e a linha em branco seguinte", () => {
    assert.equal(stripTemplateHeader("<!-- resumo: x -->\n\n# T\n"), "# T\n");
    assert.equal(stripTemplateHeader("{/* resumo: x */}\n## T"), "## T");
  });

  it("tira resumo e instrução de cópia dos workflows", () => {
    assert.equal(stripTemplateHeader("# resumo: x\n# Copie para .github/workflows/ci.yml.\nname: CI\n"), "name: CI\n");
  });

  it("não mexe em arquivo sem cabeçalho", () => {
    assert.equal(stripTemplateHeader("# Título\n<!-- resumo: x -->"), "# Título\n<!-- resumo: x -->");
  });
});

describe("renderTemplate", () => {
  it("preenche variáveis e aponta faltantes e sobras", () => {
    // Arrange
    const template = "<!-- resumo: x -->\n# {{TITULO}} em {{DATA}}";

    // Act
    const result = renderTemplate(template, { TITULO: "Teste", EXTRA: "?" });

    // Assert
    assert.equal(result.output, "# Teste em {{DATA}}");
    assert.deepEqual(result.missing, ["DATA"]);
    assert.deepEqual(result.unused, ["EXTRA"]);
  });

  it("insere o valor literalmente, sem expandir padrões de replace nem variáveis", () => {
    const { output } = renderTemplate("{{A}}", { A: "$& {{A}} $1" });
    assert.equal(output, "$& {{A}} $1");
  });
});

describe("parseAssignments", () => {
  it("lê CHAVE=valor, inclusive com = no valor", () => {
    const { values, errors } = parseAssignments(["TITULO=Testes de carga", "URL=a=b", "VAZIO="]);
    assert.deepEqual(values, { TITULO: "Testes de carga", URL: "a=b", VAZIO: "" });
    assert.deepEqual(errors, []);
  });

  it("recusa argumento sem = ou com chave fora do padrão", () => {
    const { errors } = parseAssignments(["TITULO", "titulo=x", "=x"]);
    assert.equal(errors.length, 3);
  });
});

describe("selectDependabotEcosystems", () => {
  const template = [
    "version: 2",
    "updates:",
    "  - package-ecosystem: npm",
    "    directory: /",
    "",
    "  - package-ecosystem: nuget",
    "    directory: /",
    "",
    "  - package-ecosystem: github-actions",
    "    directory: /",
    "",
  ].join("\n");

  it("mantém só os ecossistemas pedidos", () => {
    const output = selectDependabotEcosystems(template, ["nuget", "github-actions"]);
    assert.equal(output, "version: 2\nupdates:\n  - package-ecosystem: nuget\n    directory: /\n\n  - package-ecosystem: github-actions\n    directory: /\n");
  });

  it("descarta blocos sem ecossistema", () => {
    const output = selectDependabotEcosystems("version: 2\nupdates:\n  # comentário solto\n\n  - package-ecosystem: npm\n", ["npm"]);
    assert.equal(output, "version: 2\nupdates:\n  - package-ecosystem: npm\n");
  });
});

describe("setCodeqlLanguages", () => {
  it("troca a matriz de linguagens", () => {
    const output = setCodeqlLanguages("    matrix:\n        language: [javascript-typescript, actions]\n", ["csharp", "actions"]);
    assert.equal(output, "    matrix:\n        language: [csharp, actions]\n");
  });
});
