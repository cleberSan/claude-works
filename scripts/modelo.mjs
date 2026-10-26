#!/usr/bin/env node
// resumo: Gera um arquivo a partir de um modelo de templates/, preenchendo as variáveis, sem nunca sobrescrever. Uso: npm run modelo -- <modelo> <destino> CHAVE=valor.
import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { consoleOutput, isMain, parseOptions, REPOSITORY_ROOT } from "../utils/cli.mjs";
import { extractSummary } from "../utils/frontmatter.mjs";
import { findPlaceholders, parseAssignments, renderTemplate, stripTemplateHeader } from "../utils/templates.mjs";

const HELP = `Uso:
  npm run modelo -- <modelo> <destino> [CHAVE=valor ...]
  npm run modelo -- --listar

<modelo> é o nome de um arquivo de templates/ (adr, adr.md ou templates/adr.md).
<destino> é relativo à pasta de onde você chamou o npm. Arquivo existente nunca é sobrescrito.

Exemplo:
  npm run modelo -- adr ../careflow/docs/adr/0014-testes-de-carga.md NUMERO=0014 TITULO="Testes de carga" DATA=2026-11-02`;

/**
 * Modelos disponíveis, com resumo e variáveis.
 * @param {string} root
 */
export async function listTemplates(root) {
  const directory = path.join(root, "templates");
  const names = (await readdir(directory)).filter((name) => /\.mdx?$/.test(name)).sort();
  return Promise.all(
    names.map(async (name) => {
      const text = await readFile(path.join(directory, name), "utf8");
      return { name, text, summary: extractSummary(text) ?? "", variables: findPlaceholders(stripTemplateHeader(text)) };
    }),
  );
}

/** Nomes de arquivo aceitos para o que a pessoa digitou ("adr" acha adr.md ou adr.mdx). */
export function templateCandidates(input) {
  const normalized = input.replaceAll("\\", "/").replace(/^\.\//, "");
  const relative = normalized.startsWith("templates/") ? normalized.slice("templates/".length) : normalized;
  if (relative === "" || relative.includes("/")) return [];
  return /\.mdx?$/.test(relative) ? [relative] : [`${relative}.md`, `${relative}.mdx`];
}

/**
 * @param {string[]} args
 * @param {{ root?: string, cwd?: string } & Partial<import("../utils/cli.mjs").Output>} [context]
 * @returns {Promise<number>}
 */
export async function main(args, context = {}) {
  const { out, err } = { ...consoleOutput, ...context };
  const { options, positionals, errors } = parseOptions(args, { listar: "boolean", ajuda: "boolean" });
  const root = context.root ?? REPOSITORY_ROOT;

  if (options.listar) {
    for (const { name, summary, variables } of await listTemplates(root)) {
      out(`${name.padEnd(24)} ${variables.length > 0 ? `[${variables.join(", ")}] ` : ""}${summary}`);
    }
    return 0;
  }
  if (options.ajuda || errors.length > 0 || positionals.length < 2) {
    for (const error of errors) err(error);
    if (!options.ajuda && errors.length === 0) err("informe o modelo e o destino");
    out(HELP);
    return options.ajuda ? 0 : 2;
  }

  const [templateName, destination, ...assignments] = positionals;
  const templates = await listTemplates(root);
  const candidates = templateCandidates(templateName);
  const template = templates.find(({ name }) => candidates.includes(name));
  if (!template) {
    err(`modelo não encontrado: ${templateName}. Disponíveis: ${templates.map(({ name }) => name).join(", ")}`);
    return 1;
  }

  const { values, errors: assignmentErrors } = parseAssignments(assignments);
  if (assignmentErrors.length > 0) {
    for (const error of assignmentErrors) err(error);
    return 2;
  }

  const { output, missing, unused } = renderTemplate(template.text, values);
  if (missing.length > 0) {
    err(`faltam variáveis: ${missing.join(", ")} (o modelo ${template.name} usa ${template.variables.join(", ")})`);
    return 1;
  }
  if (unused.length > 0) err(`aviso: o modelo ${template.name} não usa ${unused.join(", ")}`);

  const cwd = context.cwd ?? process.env.INIT_CWD ?? process.cwd();
  const target = path.resolve(cwd, destination);
  await mkdir(path.dirname(target), { recursive: true });
  try {
    await writeFile(target, output, { encoding: "utf8", flag: "wx" });
  } catch (error) {
    if (/** @type {NodeJS.ErrnoException} */ (error).code !== "EEXIST") throw error;
    err(`já existe, não sobrescrevo: ${destination}`);
    return 1;
  }
  out(`Criado: ${destination} (a partir de templates/${template.name})`);
  return 0;
}

if (isMain(import.meta.url)) process.exitCode = await main(process.argv.slice(2));
