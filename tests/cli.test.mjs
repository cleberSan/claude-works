import assert from "node:assert/strict";
import path from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import { consoleOutput, isMain, parseOptions, REPOSITORY_ROOT, todayIso } from "../utils/cli.mjs";

describe("parseOptions", () => {
  const spec = /** @type {const} */ ({ destino: "string", simular: "boolean" });

  it("lê valor separado, valor com = e flag", () => {
    const { options, positionals, errors } = parseOptions(["--destino", "x", "solto", "--simular"], spec);
    assert.deepEqual(options, { destino: "x", simular: true });
    assert.deepEqual(positionals, ["solto"]);
    assert.deepEqual(errors, []);
    assert.deepEqual(parseOptions(["--destino=a=b"], spec).options, { destino: "a=b" });
    assert.deepEqual(parseOptions(["--destino="], spec).options, { destino: "" });
  });

  it("acusa opção desconhecida e opção sem valor", () => {
    assert.deepEqual(parseOptions(["--forca"], spec).errors, ["opção desconhecida: --forca"]);
    assert.deepEqual(parseOptions(["--destino"], spec).errors, ["--destino precisa de um valor"]);
    assert.deepEqual(parseOptions(["--destino", "--simular"], spec).errors, ["--destino precisa de um valor"]);
    assert.deepEqual(parseOptions(["--toString"], spec).errors, ["opção desconhecida: --toString"]);
  });
});

describe("isMain", () => {
  const self = fileURLToPath(import.meta.url);

  it("reconhece o arquivo chamado pelo node", () => {
    assert.equal(isMain(import.meta.url, self), true);
  });

  it("recusa outro arquivo, caminho inexistente ou entrada vazia", () => {
    assert.equal(isMain(import.meta.url, path.join(REPOSITORY_ROOT, "package.json")), false);
    assert.equal(isMain(import.meta.url, path.join(REPOSITORY_ROOT, "nao-existe.mjs")), false);
    assert.equal(isMain(import.meta.url, ""), false);
  });

  it("usa process.argv[1] quando não recebe a entrada", () => {
    assert.equal(typeof isMain(import.meta.url), "boolean");
  });
});

describe("todayIso", () => {
  it("formata a data em UTC", () => {
    assert.equal(todayIso(new Date("2026-10-26T23:59:59Z")), "2026-10-26");
    assert.match(todayIso(), /^\d{4}-\d{2}-\d{2}$/);
  });
});

describe("consoleOutput", () => {
  it("manda out para stdout e err para stderr", (t) => {
    // Arrange
    const log = t.mock.method(console, "log", () => {});
    const error = t.mock.method(console, "error", () => {});

    // Act
    consoleOutput.out("saida");
    consoleOutput.err("erro");

    // Assert
    assert.deepEqual(log.mock.calls[0].arguments, ["saida"]);
    assert.deepEqual(error.mock.calls[0].arguments, ["erro"]);
  });
});
