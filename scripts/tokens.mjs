#!/usr/bin/env node
// resumo: Mostra quanto custa ler a base - tokens estimados por seção, os arquivos mais pesados e a leitura mínima. Uso: npm run tokens.
import { consoleOutput, isMain, parseOptions, REPOSITORY_ROOT } from "../utils/cli.mjs";
import { classifyFile, estimateTokens, formatTokens, INDEX_FILE, SECTIONS } from "../utils/kb-index.mjs";
import { loadRepository } from "../utils/validation.mjs";

const HELP = `Uso: npm run tokens [-- --top <N>] [-- --pasta <prefixo>] [-- --raiz <pasta>]

Estimativa (caracteres ÷ 3,5), boa para decidir o que abrir. --pasta filtra por prefixo
(ex.: projetos/careflow/); --top define quantos arquivos listar (padrão 10).`;

/**
 * @param {string[]} args
 * @param {{ root?: string } & Partial<import("../utils/cli.mjs").Output>} [context]
 * @returns {Promise<number>}
 */
export async function main(args, context = {}) {
  const { out, err } = { ...consoleOutput, ...context };
  const { options, errors } = parseOptions(args, { raiz: "string", top: "string", pasta: "string", ajuda: "boolean" });
  const top = options.top === undefined ? 10 : Number(options.top);
  if (!Number.isInteger(top) || top < 1) errors.push("--top precisa ser um inteiro maior que zero");
  if (options.ajuda || errors.length > 0) {
    for (const error of errors) err(error);
    out(HELP);
    return errors.length > 0 ? 2 : 0;
  }

  const root = typeof options.raiz === "string" ? options.raiz : (context.root ?? REPOSITORY_ROOT);
  const prefix = typeof options.pasta === "string" ? options.pasta : "";
  const { texts } = await loadRepository(root);

  const files = [...texts]
    .filter(([file]) => classifyFile(file) && file.startsWith(prefix))
    .map(([file, text]) => ({ file, tokens: estimateTokens(text) }));
  if (files.length === 0) {
    err(`Nenhum arquivo da base em "${prefix}".`);
    return 1;
  }

  const minimum = ["CLAUDE.md", INDEX_FILE].reduce((sum, file) => sum + estimateTokens(texts.get(file) ?? ""), 0);
  const total = files.reduce((sum, { tokens }) => sum + tokens, 0);
  out(`Leitura mínima (CLAUDE.md + ${INDEX_FILE}): ${formatTokens(minimum)} tokens`);
  out(`Arquivos${prefix ? ` em ${prefix}` : ""}: ${files.length}, ${formatTokens(total)} tokens`);

  out("");
  out("Por seção:");
  for (const section of SECTIONS) {
    const inSection = files.filter(({ file }) => file.startsWith(section.prefix));
    if (inSection.length === 0) continue;
    const sum = inSection.reduce((acc, { tokens }) => acc + tokens, 0);
    out(`  ${section.prefix.padEnd(18)} ${String(inSection.length).padStart(3)} arquivos  ${formatTokens(sum).padStart(7)}`);
  }

  out("");
  out(`Mais pesados (top ${Math.min(top, files.length)}):`);
  for (const { file, tokens } of [...files].sort((a, b) => b.tokens - a.tokens || a.file.localeCompare(b.file, "en")).slice(0, top)) {
    out(`  ${formatTokens(tokens).padStart(7)}  ${file}`);
  }
  return 0;
}

if (isMain(import.meta.url)) process.exitCode = await main(process.argv.slice(2));
