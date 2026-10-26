#!/usr/bin/env node
// resumo: Gera o INDICE.md a partir do resumo de cada arquivo (ou só confere com --verificar). Uso: npm run indice.
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { consoleOutput, isMain, parseOptions, REPOSITORY_ROOT } from "../utils/cli.mjs";
import { buildIndex, classifyFile, INDEX_FILE } from "../utils/kb-index.mjs";
import { collectIndexEntries, loadRepository } from "../utils/validation.mjs";

const HELP = `Uso: npm run indice [-- --verificar] [-- --raiz <pasta>]

Regera o ${INDEX_FILE}. Com --verificar, não escreve: sai com código 1 se o índice estiver velho.`;

async function readOrUndefined(file) {
  try {
    return await readFile(file, "utf8");
  } catch (error) {
    if (/** @type {NodeJS.ErrnoException} */ (error).code === "ENOENT") return undefined;
    throw error;
  }
}

/**
 * @param {string[]} args
 * @param {{ root?: string } & Partial<import("../utils/cli.mjs").Output>} [context]
 * @returns {Promise<number>}
 */
export async function main(args, context = {}) {
  const { out, err } = { ...consoleOutput, ...context };
  const { options, errors } = parseOptions(args, { raiz: "string", verificar: "boolean", ajuda: "boolean" });
  if (options.ajuda || errors.length > 0) {
    for (const error of errors) err(error);
    out(HELP);
    return errors.length > 0 ? 2 : 0;
  }

  const root = typeof options.raiz === "string" ? options.raiz : (context.root ?? REPOSITORY_ROOT);
  const repository = await loadRepository(root);
  const entries = collectIndexEntries(repository);
  const index = buildIndex(entries);
  const target = path.join(root, INDEX_FILE);
  const current = await readOrUndefined(target);

  const withoutSummary = repository.files.filter((file) => classifyFile(file) && !entries.some((entry) => entry.file === file));
  for (const file of withoutSummary) err(`${file}: sem resumo, ficou fora do índice (rode npm run validar).`);

  if (current?.replace(/\r\n/g, "\n") === index) {
    out(`${INDEX_FILE} já está em dia (${entries.length} arquivos).`);
    return 0;
  }
  if (options.verificar) {
    err(`${INDEX_FILE} desatualizado. Rode npm run indice e commite o resultado.`);
    return 1;
  }
  await writeFile(target, index, "utf8");
  out(`${INDEX_FILE} ${current === undefined ? "criado" : "atualizado"} (${entries.length} arquivos).`);
  return 0;
}

if (isMain(import.meta.url)) process.exitCode = await main(process.argv.slice(2));
