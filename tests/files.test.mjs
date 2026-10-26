import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { isTextFile, listFiles } from "../utils/files.mjs";
import { makeTempDir, writeTree } from "./helpers.mjs";

describe("listFiles", () => {
  it("lista em ordem estável, com caminho POSIX, ignorando pastas de build", async (t) => {
    // Arrange
    const root = await makeTempDir(t);
    await writeTree(root, {
      "b.md": "",
      "a/z.md": "",
      "a/c/d.md": "",
      ".git/config": "",
      "node_modules/x/index.js": "",
      "coverage/lcov.info": "",
    });

    // Act
    const files = await listFiles(root);

    // Assert
    assert.deepEqual(files, ["a/c/d.md", "a/z.md", "b.md"]);
  });

  it("aceita outra lista de pastas ignoradas", async (t) => {
    const root = await makeTempDir(t);
    await writeTree(root, { "x/a.md": "", "y/b.md": "" });

    assert.deepEqual(await listFiles(root, { ignore: new Set(["x"]) }), ["y/b.md"]);
  });
});

describe("isTextFile", () => {
  it("reconhece texto pela extensão ou pelo nome", () => {
    for (const file of ["a.md", "b/c.mdx", "s.mjs", "w.yml", "x.yaml", "y.sh", "p.json", ".gitignore", ".editorconfig", ".nvmrc", ".github/CODEOWNERS"]) {
      assert.equal(isTextFile(file), true, file);
    }
  });

  it("deixa binários e desconhecidos de fora", () => {
    for (const file of ["img.png", "video.mp4", "LICENSE", "a.tar.gz", ".env.local"]) {
      assert.equal(isTextFile(file), false, file);
    }
  });
});
