import { readdir } from "node:fs/promises";
import path from "node:path";

/** Pastas que nunca fazem parte da base. */
export const IGNORED_DIRECTORIES = new Set([".git", "node_modules", "coverage", ".cache"]);

/**
 * Lista os arquivos abaixo de `root`, com caminho relativo em formato POSIX e em ordem estável.
 * @param {string} root
 * @param {{ ignore?: Set<string> }} [options]
 * @returns {Promise<string[]>}
 */
export async function listFiles(root, options = {}) {
  const ignore = options.ignore ?? IGNORED_DIRECTORIES;
  /** @type {string[]} */
  const found = [];

  async function walk(relative) {
    const entries = await readdir(path.join(root, relative), { withFileTypes: true });
    for (const entry of entries) {
      const child = relative === "" ? entry.name : `${relative}/${entry.name}`;
      if (entry.isDirectory()) {
        if (!ignore.has(entry.name)) await walk(child);
      } else if (entry.isFile()) {
        found.push(child);
      }
    }
  }

  await walk("");
  return found.sort((a, b) => a.localeCompare(b, "en"));
}

/** Extensões tratadas como texto na varredura de dados sensíveis. */
export const TEXT_EXTENSIONS = new Set([".md", ".mdx", ".mjs", ".js", ".json", ".yml", ".yaml", ".sh", ".txt", ".editorconfig", ".gitignore", ".nvmrc"]);

/** O arquivo é texto que a base versiona (pelo nome ou pela extensão)? */
export function isTextFile(relativePath) {
  const base = path.posix.basename(relativePath);
  const extension = base.startsWith(".") && !base.slice(1).includes(".") ? base : path.posix.extname(base);
  return TEXT_EXTENSIONS.has(extension) || base === "CODEOWNERS";
}
