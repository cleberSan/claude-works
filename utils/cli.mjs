import { realpathSync } from "node:fs";
import { fileURLToPath } from "node:url";

/**
 * O módulo foi chamado direto pelo node (e não importado por um teste)?
 * @param {string} moduleUrl `import.meta.url` do script
 * @param {string | undefined} [entry] caminho que o node recebeu
 */
export function isMain(moduleUrl, entry = process.argv[1]) {
  if (!entry) return false;
  try {
    return realpathSync(entry) === realpathSync(fileURLToPath(moduleUrl));
  } catch {
    return false;
  }
}

/** Data de hoje (UTC) em AAAA-MM-DD. */
export function todayIso(now = new Date()) {
  return now.toISOString().slice(0, 10);
}

/**
 * Lê `--opcao valor` e `--flag`. Opção desconhecida ou sem valor vira erro, nunca é ignorada.
 * @param {string[]} args
 * @param {Record<string, "string" | "boolean">} spec
 */
export function parseOptions(args, spec) {
  /** @type {Record<string, string | boolean>} */
  const options = {};
  /** @type {string[]} */
  const positionals = [];
  /** @type {string[]} */
  const errors = [];

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (!arg.startsWith("--")) {
      positionals.push(arg);
      continue;
    }
    const [name, inline] = arg.slice(2).split(/=(.*)/s, 2);
    const type = Object.hasOwn(spec, name) ? spec[name] : undefined;
    if (type === undefined) {
      errors.push(`opção desconhecida: --${name}`);
    } else if (type === "boolean") {
      options[name] = true;
    } else if (inline !== undefined) {
      options[name] = inline;
    } else if (index + 1 < args.length && !args[index + 1].startsWith("--")) {
      options[name] = args[(index += 1)];
    } else {
      errors.push(`--${name} precisa de um valor`);
    }
  }
  return { options, positionals, errors };
}

/**
 * Saída padrão dos scripts; os testes trocam por funções que guardam as linhas.
 * @typedef {{ out: (line: string) => void, err: (line: string) => void }} Output
 * @type {Output}
 */
export const consoleOutput = { out: (line) => console.log(line), err: (line) => console.error(line) };

/** Raiz do claude-works (a pasta acima de utils/). */
export const REPOSITORY_ROOT = fileURLToPath(new URL("..", import.meta.url));
