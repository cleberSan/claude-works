import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { extractLinks, isLocalLink, resolveLink } from "../utils/markdown.mjs";

describe("extractLinks", () => {
  it("acha links e imagens com a linha certa", () => {
    // Arrange
    const text = "# T\n\nVeja [a](a.md) e ![img](img/x.png \"título\").\n[b](https://b.test)";

    // Act
    const links = extractLinks(text);

    // Assert
    assert.deepEqual(links, [
      { href: "a.md", line: 3 },
      { href: "img/x.png", line: 3 },
      { href: "https://b.test", line: 4 },
    ]);
  });

  it("ignora blocos de código, código inline e comentários, sem perder a numeração", () => {
    const text = [
      "```md",
      "[dentro](x.md)",
      "```",
      "~~~",
      "[til](y.md)",
      "~~~",
      "`[inline](z.md)`",
      "<!-- [html](h.md)",
      "continua -->",
      "{/* [mdx](m.md) */}",
      "[fora](ok.md)",
    ].join("\n");

    assert.deepEqual(extractLinks(text), [{ href: "ok.md", line: 11 }]);
  });
});

describe("isLocalLink", () => {
  it("separa arquivo do repositório de URL, âncora e e-mail", () => {
    assert.equal(isLocalLink("docs/a.md"), true);
    assert.equal(isLocalLink("../b.md#secao"), true);
    assert.equal(isLocalLink("https://a.test"), false);
    assert.equal(isLocalLink("mailto:alguem@example.com"), false);
    assert.equal(isLocalLink("#secao"), false);
    assert.equal(isLocalLink("//cdn.test/x.js"), false);
  });
});

describe("resolveLink", () => {
  it("resolve relativo ao arquivo, sem âncora nem query", () => {
    assert.equal(resolveLink("projetos/careflow/README.md", "../../docs/a.md#x"), "docs/a.md");
    assert.equal(resolveLink("memorias/a.md", "b.md?raw=1"), "memorias/b.md");
    assert.equal(resolveLink("README.md", "scripts/"), "scripts");
    assert.equal(resolveLink("a/b.md", "c%20d.md"), "a/c d.md");
  });

  it("âncora pura aponta para o próprio arquivo", () => {
    assert.equal(resolveLink("a/b.md", "#topo"), "a/b.md");
  });

  it("devolve undefined quando o link sai da raiz", () => {
    assert.equal(resolveLink("README.md", "../fora.md"), undefined);
    assert.equal(resolveLink("a/b.md", "../.."), undefined);
  });
});
