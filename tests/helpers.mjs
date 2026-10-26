// Apoio dos testes: pastas temporárias, saída capturada e dados falsos montados em tempo de execução.
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

/** Cria uma pasta temporária e registra a limpeza no fim do teste. */
export async function makeTempDir(t) {
  const dir = await mkdtemp(path.join(os.tmpdir(), "claude-works-"));
  t.after(() => rm(dir, { recursive: true, force: true }));
  return dir;
}

/** Grava `{ "caminho/relativo": "conteúdo" }` dentro de `root`. */
export async function writeTree(root, files) {
  for (const [relative, content] of Object.entries(files)) {
    const target = path.join(root, relative);
    await mkdir(path.dirname(target), { recursive: true });
    await writeFile(target, content, "utf8");
  }
}

/** Saída dos scripts guardada em listas. */
export function captureOutput() {
  /** @type {{ out: string[], err: string[] }} */
  const lines = { out: [], err: [] };
  return { out: (line) => lines.out.push(line), err: (line) => lines.err.push(line), lines };
}

/**
 * Dados sensíveis falsos. Montados por partes para o próprio repositório passar na varredura
 * do validador (que lê os testes também).
 */
export const fake = {
  anthropicKey: () => ["sk", "ant", "api03", "A".repeat(24)].join("-"),
  githubToken: () => `ghp${"_"}${"a1B2".repeat(9)}`,
  githubPat: () => `github${"_pat_"}${"x".repeat(45)}`,
  awsKey: () => `AKIA${"ABCDEFGHIJKLMNOP"}`,
  googleKey: () => `AIza${"S".repeat(35)}`,
  privateKey: () => `-----BEGIN ${"RSA PRIVATE KEY"}-----`,
  ocid: () => ["ocid1", "instance", "oc1", "sa-saopaulo-1", "a".repeat(30)].join("."),
  password: () => `pass${"word"}=${"Sup3rS3creta!"}`,
  email: () => `fulano${"@"}gmail.com`,
  phone: () => `(11) ${"98765"}-4321`,
  phoneInternational: () => `+55 11 ${"98765"} 4321`,
  cpf: () => `123.456${".789"}-09`,
};

/** Arquivo de conteúdo válido (front matter com resumo e atualizado). */
export function contentFile(summary = "Resumo de teste.", updated = "2026-10-01", body = "# Título\n") {
  return `---\nresumo: ${summary}\natualizado: ${updated}\n---\n\n${body}`;
}
