#!/usr/bin/env node
// resumo: Valida a base (front matter, resumo, índice em dia, links, tamanho, skills, subagentes e dados sensíveis). Uso: npm run validar.
import { consoleOutput, isMain, parseOptions, REPOSITORY_ROOT, todayIso } from "../utils/cli.mjs";
import { formatProblem, loadRepository, validateRepository } from "../utils/validation.mjs";

const HELP = `Uso: npm run validar [-- --raiz <pasta>]

Confere a base inteira e sai com código 1 se houver problema. No GitHub Actions, cada
problema também vira anotação no arquivo do PR.`;

/** Escapa texto para comando de workflow do GitHub Actions (não deixa abrir outro comando). */
export function escapeAnnotation(value, isProperty = false) {
  const escaped = value.replace(/%/g, "%25").replace(/\r/g, "%0D").replace(/\n/g, "%0A");
  return isProperty ? escaped.replace(/:/g, "%3A").replace(/,/g, "%2C") : escaped;
}

/** @param {import("../utils/validation.mjs").Problem} problem */
export function formatAnnotation({ file, line, rule, message }) {
  const location = `file=${escapeAnnotation(file, true)}${line ? `,line=${line}` : ""}`;
  return `::error ${location},title=${escapeAnnotation(rule, true)}::${escapeAnnotation(message)}`;
}

/**
 * @param {string[]} args
 * @param {{ root?: string, today?: string, env?: NodeJS.ProcessEnv } & Partial<import("../utils/cli.mjs").Output>} [context]
 * @returns {Promise<number>} código de saída
 */
export async function main(args, context = {}) {
  const { out, err } = { ...consoleOutput, ...context };
  const { options, errors } = parseOptions(args, { raiz: "string", ajuda: "boolean" });
  if (options.ajuda || errors.length > 0) {
    for (const error of errors) err(error);
    out(HELP);
    return errors.length > 0 ? 2 : 0;
  }

  const root = typeof options.raiz === "string" ? options.raiz : (context.root ?? REPOSITORY_ROOT);
  const repository = await loadRepository(root);
  const problems = validateRepository(repository, { today: context.today ?? todayIso() });
  if (problems.length === 0) {
    out(`Base válida: ${repository.files.length} arquivos conferidos.`);
    return 0;
  }

  const annotate = (context.env ?? process.env).GITHUB_ACTIONS === "true";
  for (const problem of problems) err(annotate ? formatAnnotation(problem) : formatProblem(problem));
  err(`${problems.length} problema(s). Corrija e rode de novo.`);
  return 1;
}

if (isMain(import.meta.url)) process.exitCode = await main(process.argv.slice(2));
