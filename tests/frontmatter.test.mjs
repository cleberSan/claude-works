import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { extractSummary, isValidDate, parseFrontMatter } from "../utils/frontmatter.mjs";

describe("parseFrontMatter", () => {
  it("lê chaves, listas, aspas e valor vazio", () => {
    // Arrange
    const text = ["---", "resumo: \"Com aspas\"", "atualizado: 2026-10-26", "fontes:", "  - https://a.test", "  - 'b'", "", "vazio:", "---", "corpo"].join("\n");

    // Act
    const { data, body, error } = parseFrontMatter(text);

    // Assert
    assert.equal(error, undefined);
    assert.deepEqual(data, { resumo: "Com aspas", atualizado: "2026-10-26", fontes: ["https://a.test", "b"], vazio: [] });
    assert.equal(body, "corpo");
  });

  it("devolve data nula quando não há front matter", () => {
    const { data, body } = parseFrontMatter("# Título\n");
    assert.equal(data, null);
    assert.equal(body, "# Título\n");
  });

  it("aceita quebra de linha do Windows", () => {
    const { data } = parseFrontMatter("---\r\nresumo: x\r\n---\r\ncorpo");
    assert.deepEqual(data, { resumo: "x" });
  });

  it("acusa front matter sem fechamento", () => {
    const { data, error } = parseFrontMatter("---\nresumo: x\n");
    assert.equal(data, null);
    assert.match(error ?? "", /fechamento/);
  });

  it("acusa linha que não é chave nem item de lista", () => {
    const { error } = parseFrontMatter("---\nisto não é chave\n---\n");
    assert.match(error ?? "", /linha inválida/);
  });

  it("acusa item de lista antes de qualquer chave", () => {
    const { error } = parseFrontMatter("---\n  - solto\n---\n");
    assert.match(error ?? "", /linha inválida/);
  });

  it("transforma chave com valor em lista quando aparecem itens depois", () => {
    const { data } = parseFrontMatter("---\nchave: valor\n  - item\n---\n");
    assert.deepEqual(data, { chave: ["item"] });
  });
});

describe("extractSummary", () => {
  it("prefere resumo e cai para description", () => {
    assert.equal(extractSummary("---\nresumo: A\ndescription: B\n---\n"), "A");
    assert.equal(extractSummary("---\nname: x\ndescription: B\n---\n"), "B");
  });

  it("ignora resumo em lista e devolve undefined sem resumo", () => {
    assert.equal(extractSummary("---\nresumo:\n  - a\n---\n"), undefined);
    assert.equal(extractSummary("---\nname: x\n---\n"), undefined);
  });

  it("lê o comentário de resumo da primeira linha em cada formato", () => {
    assert.equal(extractSummary("<!-- resumo: Markdown -->\n# x"), "Markdown");
    assert.equal(extractSummary("{/* resumo: MDX */}\n## x"), "MDX");
    assert.equal(extractSummary("# resumo: YAML\nname: x"), "YAML");
    assert.equal(extractSummary("// resumo: JS\nexport {}"), "JS");
  });

  it("devolve undefined sem front matter nem comentário", () => {
    assert.equal(extractSummary("# Título\n<!-- resumo: tarde demais -->"), undefined);
    assert.equal(extractSummary(""), undefined);
  });
});

describe("isValidDate", () => {
  it("aceita data real AAAA-MM-DD", () => {
    assert.equal(isValidDate("2026-10-26"), true);
    assert.equal(isValidDate("2024-02-29"), true);
  });

  it("recusa data inexistente, formato errado e não texto", () => {
    assert.equal(isValidDate("2026-02-30"), false);
    assert.equal(isValidDate("2025-02-29"), false);
    assert.equal(isValidDate("26/10/2026"), false);
    assert.equal(isValidDate("2026-10-26T00:00"), false);
    assert.equal(isValidDate(["2026-10-26"]), false);
    assert.equal(isValidDate(undefined), false);
  });
});
