#!/usr/bin/env node
// resumo: Prepara um repositório novo no padrão do ecossistema (CI, CodeQL, Dependabot, PR, CODEOWNERS, ADR-0000, SECURITY, README) sem sobrescrever nada.
import { mkdir, readFile, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { consoleOutput, isMain, parseOptions, REPOSITORY_ROOT, todayIso } from "../utils/cli.mjs";
import { isValidDate } from "../utils/frontmatter.mjs";
import { renderTemplate, selectDependabotEcosystems, setCodeqlLanguages, stripTemplateHeader } from "../utils/templates.mjs";

const HELP = `Uso: node scripts/iniciar-repositorio.mjs --destino <pasta> --stack dotnet|node --nome <repo>
         [--dono cleberSan] [--descricao "Uma frase"] [--data AAAA-MM-DD] [--simular]

Copia para o clone em <pasta>: workflows de CI e CodeQL, Dependabot, template de PR,
CODEOWNERS, ADR-0000, SECURITY.md e README.md. Arquivo que já existe é mantido.
--simular mostra o plano sem escrever nada.`;

/** O que muda por stack. Os checks são os nomes dos jobs dos modelos em pipelines/. */
export const STACKS = Object.freeze({
  dotnet: {
    label: ".NET 10",
    ci: "ci-dotnet.yml",
    codeql: ["csharp", "actions"],
    ecosystems: ["nuget", "github-actions"],
    check: "Build, formatação e testes",
    requirements: "global.json, Directory.Packages.props e packages.lock.json (restore --locked-mode)",
  },
  node: {
    label: "Node.js 24",
    ci: "ci-node.yml",
    codeql: ["javascript-typescript", "actions"],
    ecosystems: ["npm", "github-actions"],
    check: "Lint, tipos, testes e build",
    requirements: ".nvmrc, package-lock.json e os scripts format:check, lint, typecheck, test:coverage, build e test:e2e",
  },
});

const REPOSITORY_NAME = /^(?!\.{1,2}$)[A-Za-z0-9._-]{1,100}$/;
const GITHUB_LOGIN = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9])){0,38}$/;

/**
 * @typedef {{ stack: keyof typeof STACKS, name: string, owner: string, description: string, date: string }} Settings
 * @typedef {{ target: string, content: string }} PlannedFile
 */

/** Preenche um modelo de templates/ e falha alto se faltar variável (erro de quem mantém a base). */
function fill(text, values, source) {
  const { output, missing } = renderTemplate(text, values);
  if (missing.length > 0) throw new Error(`templates/${source} usa variáveis sem valor: ${missing.join(", ")}`);
  return output;
}

/**
 * Arquivos a criar, com conteúdo pronto.
 * @param {string} root raiz do claude-works
 * @param {Settings} settings
 * @returns {Promise<PlannedFile[]>}
 */
export async function planRepository(root, { stack, name, owner, description, date }) {
  const profile = STACKS[stack];
  const read = (relative) => readFile(path.join(root, relative), "utf8");

  return [
    { target: ".github/workflows/ci.yml", content: stripTemplateHeader(await read(`pipelines/${profile.ci}`)) },
    { target: ".github/workflows/codeql.yml", content: setCodeqlLanguages(stripTemplateHeader(await read("pipelines/codeql.yml")), profile.codeql) },
    { target: ".github/dependabot.yml", content: selectDependabotEcosystems(stripTemplateHeader(await read("pipelines/dependabot.yml")), profile.ecosystems) },
    { target: ".github/pull_request_template.md", content: fill(await read("templates/pull-request.md"), {}, "pull-request.md") },
    { target: ".github/CODEOWNERS", content: `* @${owner}\n` },
    { target: "docs/adr/0000-registrar-decisoes-com-adr.md", content: fill(await read("templates/adr-0000.md"), { NOME: name, DATA: date }, "adr-0000.md") },
    { target: "SECURITY.md", content: fill(await read("templates/security.md"), { DONO: owner, NOME: name }, "security.md") },
    {
      target: "README.md",
      content: fill(await read("templates/readme-repositorio.md"), { NOME: name, DONO: owner, DESCRICAO: description, STACK: profile.label }, "readme-repositorio.md"),
    },
  ];
}

/** Confere as opções e devolve as configurações ou a lista de erros. */
export function readSettings(options, today) {
  /** @type {string[]} */
  const errors = [];
  const text = (key, fallback) => (typeof options[key] === "string" ? options[key] : fallback);
  const destination = text("destino", undefined);
  const stack = text("stack", undefined);
  const name = text("nome", undefined);
  const owner = text("dono", "cleberSan");
  const description = text("descricao", "Descreva o projeto em uma frase.");
  const date = text("data", today);

  if (!destination) errors.push("--destino é obrigatório (a pasta do clone)");
  if (!stack || !Object.hasOwn(STACKS, stack)) errors.push(`--stack deve ser ${Object.keys(STACKS).join(" ou ")}`);
  if (!name || !REPOSITORY_NAME.test(name)) errors.push("--nome deve ser o nome do repositório (letras, números, ponto, hífen, sublinhado)");
  if (!GITHUB_LOGIN.test(owner)) errors.push("--dono deve ser um login do GitHub válido");
  if (/[\r\n]/.test(description) || description.trim() === "") errors.push("--descricao deve ser uma frase em uma linha");
  if (!isValidDate(date)) errors.push("--data deve ser AAAA-MM-DD");

  if (errors.length > 0) return { errors };
  return { errors, destination, settings: /** @type {Settings} */ ({ stack, name, owner, description: description.trim(), date }) };
}

/** Passos que a sessão não faz (configuração do repositório no GitHub). */
export function nextSteps({ stack }) {
  const profile = STACKS[stack];
  return [
    "Próximos passos:",
    "  1. Revise os arquivos e complete os comentários do README e do template de PR.",
    "  2. Escreva o ADR-0001 de stack e qualidade (skill novo-adr) e o CONTRIBUTING.md.",
    `  3. O CI espera ${profile.requirements}.`,
    "  4. No GitHub (só o dono do repositório):",
    `     - proteger o main: exigir PR e os checks "${profile.check}", "Revisão de dependências" e "CodeQL", sem bypass;`,
    "     - ligar Dependency graph, secret scanning, push protection e o reporte privado de vulnerabilidades;",
    "     - instalar o app de deploy (Vercel ou Cloudflare) só neste repositório, se houver.",
    "  5. Registre o projeto no claude-works (templates/cartao-projeto.md, skill kb-atualizar).",
  ];
}

/**
 * @param {string[]} args
 * @param {{ root?: string, cwd?: string, today?: string } & Partial<import("../utils/cli.mjs").Output>} [context]
 * @returns {Promise<number>}
 */
export async function main(args, context = {}) {
  const { out, err } = { ...consoleOutput, ...context };
  const { options, positionals, errors } = parseOptions(args, {
    destino: "string",
    stack: "string",
    nome: "string",
    dono: "string",
    descricao: "string",
    data: "string",
    simular: "boolean",
    ajuda: "boolean",
  });
  if (options.ajuda) {
    out(HELP);
    return 0;
  }

  const parsed = readSettings(options, context.today ?? todayIso());
  const allErrors = [...errors, ...positionals.map((arg) => `argumento inesperado: ${arg}`), ...parsed.errors];
  if (allErrors.length > 0 || !parsed.settings || !parsed.destination) {
    for (const error of allErrors) err(error);
    out(HELP);
    return 2;
  }

  const cwd = context.cwd ?? process.env.INIT_CWD ?? process.cwd();
  const destination = path.resolve(cwd, parsed.destination);
  const isDirectory = await stat(destination).then((info) => info.isDirectory(), () => false);
  if (!isDirectory) {
    err(`--destino não é uma pasta existente: ${parsed.destination}`);
    return 1;
  }

  const plan = await planRepository(context.root ?? REPOSITORY_ROOT, parsed.settings);
  for (const { target, content } of plan) {
    const file = path.join(destination, target);
    if (options.simular) {
      const exists = await stat(file).then(() => true, () => false);
      out(exists ? `mantido   ${target} (já existe)` : `criaria   ${target}`);
      continue;
    }
    // Sem conferir antes: "wx" cria ou falha num passo só, sem janela entre checar e gravar.
    await mkdir(path.dirname(file), { recursive: true });
    try {
      await writeFile(file, content, { encoding: "utf8", flag: "wx" });
      out(`criado    ${target}`);
    } catch (error) {
      if (/** @type {NodeJS.ErrnoException} */ (error).code !== "EEXIST") throw error;
      out(`mantido   ${target} (já existe)`);
    }
  }

  out("");
  for (const line of nextSteps(parsed.settings)) out(line);
  return 0;
}

if (isMain(import.meta.url)) process.exitCode = await main(process.argv.slice(2));
