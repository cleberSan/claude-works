import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { findSensitiveData, maskMatch, SENSITIVE_PATTERNS } from "../utils/sensitive.mjs";
import { fake } from "./helpers.mjs";

const ids = (text) => findSensitiveData(text).map((finding) => finding.id);

describe("findSensitiveData", () => {
  const positives = [
    ["chave-anthropic", fake.anthropicKey()],
    ["token-github", fake.githubToken()],
    ["token-github", fake.githubPat()],
    ["chave-aws", fake.awsKey()],
    ["chave-google", fake.googleKey()],
    ["chave-privada", fake.privateKey()],
    ["ocid", fake.ocid()],
    ["segredo-atribuido", fake.password()],
    ["email", fake.email()],
    ["telefone", fake.phone()],
    ["telefone", fake.phoneInternational()],
    ["cpf", fake.cpf()],
  ];

  for (const [id, value] of positives) {
    it(`acha ${id}`, () => {
      // Arrange
      const text = `linha um\nvalor: ${value} fim`;

      // Act
      const findings = findSensitiveData(text);

      // Assert
      assert.ok(findings.some((finding) => finding.id === id && finding.line === 2), JSON.stringify(findings));
    });
  }

  it("não repete o segredo no trecho do achado", () => {
    const key = fake.anthropicKey();
    const [finding] = findSensitiveData(key);
    assert.ok(!finding.excerpt.includes(key));
    assert.match(finding.excerpt, /caracteres/);
  });

  it("aceita e-mails de exemplo e endereços técnicos", () => {
    const at = "@";
    for (const email of [`a${at}example.com`, `b${at}exemplo.com.br`, `c${at}loja.test`, `d${at}x.invalid`, `noreply${at}anthropic.com`, `1+u${at}users.noreply.github.com`]) {
      assert.deepEqual(ids(email), [], email);
    }
  });

  it("aceita senha com valor de exemplo ou referência", () => {
    for (const line of ["password: ${{ secrets.DB_PASSWORD }}", "senha={{SENHA}}", "api_key: <sua-chave>", "secret = process.env.SECRET", "password: ********", "access_token: xxxxxxxxxx", "var senha = LerSenhaDoCofre(nome);"]) {
      assert.deepEqual(ids(line), [], line);
    }
  });

  it("não confunde data, versão, hash ou porta com telefone ou CPF", () => {
    const text = "2026-10-26 v10.0.100 sha 9a8b7c6d5e4f 127.0.0.1:8787 PR #12345 id 019a4f2e-98765-4321";
    assert.deepEqual(ids(text), []);
  });

  it("usa a lista de padrões recebida", () => {
    const only = [{ id: "x", description: "x", pattern: /proibido/g }];
    assert.deepEqual(findSensitiveData("isto é proibido", only).map((finding) => finding.id), ["x"]);
  });

  it("todo padrão tem id, descrição e flag global", () => {
    for (const { id, description, pattern } of SENSITIVE_PATTERNS) {
      assert.ok(id && description, id);
      assert.ok(pattern.flags.includes("g"), id);
    }
  });
});

describe("maskMatch", () => {
  it("mostra no máximo seis caracteres e o tamanho", () => {
    assert.equal(maskMatch("abcdefghijklmnopqrstuvwxyz"), "abcdef… (26 caracteres)");
    assert.equal(maskMatch("abc"), "a… (3 caracteres)");
  });
});
