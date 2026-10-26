import { readFile } from "node:fs/promises";
import path from "node:path";
import { isTextFile, listFiles } from "./files.mjs";
import { extractSummary, isValidDate, parseFrontMatter } from "./frontmatter.mjs";
import { buildIndex, classifyFile, estimateTokens, INDEX_FILE } from "./kb-index.mjs";
import { extractLinks, isLocalLink, resolveLink } from "./markdown.mjs";
import { findSensitiveData } from "./sensitive.mjs";
import { findPlaceholders, stripTemplateHeader } from "./templates.mjs";

/** Acima disso o arquivo deixa de ser "leia só o que precisa": divida. */
export const MAX_FILE_BYTES = 16 * 1024;
/** O resumo vai inteiro para o índice; curto mantém o índice barato. */
export const MAX_SUMMARY_LENGTH = 250;
/** Limite do Claude Code para `description` de skill. */
export const MAX_DESCRIPTION_LENGTH = 1024;

const NAME_FORMAT = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const RESERVED_NAME = /claude|anthropic/;
const DECLARED_VARIABLES = /Variáveis ([A-Z0-9_, ]+)\./;

/**
 * @typedef {{ files: string[], texts: Map<string, string> }} Repository
 * @typedef {{ file: string, line?: number, rule: string, message: string }} Problem
 * @typedef {import("./kb-index.mjs").Classification} Classification
 * @typedef {import("./kb-index.mjs").IndexEntry} IndexEntry
 */

/**
 * Lê a lista de arquivos e o conteúdo dos arquivos de texto.
 * @param {string} root
 * @returns {Promise<Repository>}
 */
export async function loadRepository(root) {
  const files = await listFiles(root);
  const texts = new Map();
  for (const file of files) {
    if (isTextFile(file)) texts.set(file, await readFile(path.join(root, file), "utf8"));
  }
  return { files, texts };
}

/**
 * Entradas do índice: arquivos indexáveis que têm resumo.
 * @param {Repository} repository
 * @returns {IndexEntry[]}
 */
export function collectIndexEntries(repository) {
  /** @type {IndexEntry[]} */
  const entries = [];
  for (const file of repository.files) {
    const text = repository.texts.get(file);
    if (text === undefined || !classifyFile(file)) continue;
    const summary = extractSummary(text);
    if (summary) entries.push({ file, summary, tokens: estimateTokens(text) });
  }
  return entries;
}

/** @returns {Problem[]} */
function checkContent(file, data, today) {
  const updated = data.atualizado;
  if (typeof updated !== "string" || !isValidDate(updated)) {
    return [{ file, rule: "atualizado", message: "atualizado deve ser uma data AAAA-MM-DD válida" }];
  }
  if (updated > today) return [{ file, rule: "atualizado", message: `atualizado (${updated}) está no futuro` }];
  return [];
}

/** @returns {Problem[]} */
function checkTemplate(file, text, summary) {
  const placeholders = findPlaceholders(stripTemplateHeader(text));
  const declared = DECLARED_VARIABLES.exec(summary)?.[1].split(",").map((name) => name.trim()).sort() ?? [];
  if (placeholders.join() === declared.join()) return [];
  return [{ file, line: 1, rule: "modelo", message: `o resumo declara [${declared.join(", ")}] mas o modelo usa [${placeholders.join(", ")}]; escreva "Variáveis A, B." no resumo` }];
}

/** @returns {Problem[]} */
function checkClaudeCodeFile(file, data, classification) {
  const kind = classification.kind === "skill" ? "skill" : "subagente";
  if (!data) return [{ file, rule: kind, message: "falta o front matter com name e description" }];

  /** @type {Problem[]} */
  const problems = [];
  const { name, description } = data;
  if (name !== classification.name) {
    problems.push({ file, rule: kind, message: `name deve ser "${classification.name}" (o nome ${kind === "skill" ? "da pasta" : "do arquivo"})` });
  } else if (!NAME_FORMAT.test(name) || name.length > 64 || RESERVED_NAME.test(name)) {
    problems.push({ file, rule: kind, message: "name: minúsculas, números e hífens, até 64 caracteres, sem claude ou anthropic" });
  }
  if (typeof description !== "string" || description.length === 0) {
    problems.push({ file, rule: kind, message: "falta description (é ela que decide quando o Claude usa)" });
  } else if (description.length > MAX_DESCRIPTION_LENGTH) {
    problems.push({ file, rule: kind, message: `description com ${description.length} caracteres; o limite é ${MAX_DESCRIPTION_LENGTH}` });
  }
  return problems;
}

/**
 * Regras dos arquivos que entram no índice.
 * @param {string} file
 * @param {string} text
 * @param {Classification} classification
 * @param {string} today
 * @returns {Problem[]}
 */
function checkIndexedFile(file, text, classification, today) {
  /** @type {Problem[]} */
  const problems = [];
  const bytes = Buffer.byteLength(text);
  if (bytes > MAX_FILE_BYTES) {
    problems.push({ file, rule: "tamanho", message: `${(bytes / 1024).toFixed(1)} KB; o limite é 16 KB, divida o assunto` });
  }

  const { data, error } = parseFrontMatter(text);
  if (error) return [...problems, { file, line: 1, rule: "front-matter", message: error }];

  if (classification.kind === "skill" || classification.kind === "subagent") {
    return [...problems, ...checkClaudeCodeFile(file, data, classification)];
  }
  if (classification.kind === "content" && !data) {
    return [...problems, { file, line: 1, rule: "front-matter", message: "falta o front matter com resumo e atualizado" }];
  }

  const summary = extractSummary(text);
  if (!summary) {
    const where = classification.kind === "content" ? "resumo: no front matter" : "comentário resumo: na primeira linha";
    return [...problems, { file, line: 1, rule: "resumo", message: `falta o resumo (${where})` }];
  }
  if (summary.length > MAX_SUMMARY_LENGTH) {
    problems.push({ file, line: 1, rule: "resumo", message: `resumo com ${summary.length} caracteres; o limite é ${MAX_SUMMARY_LENGTH}` });
  }

  if (classification.kind === "content") problems.push(...checkContent(file, data, today));
  if (classification.kind === "template") problems.push(...checkTemplate(file, text, summary));
  return problems;
}

/**
 * Links locais que apontam para arquivo ou pasta que não existe (ou saem do repositório).
 * @returns {Problem[]}
 */
function checkLinks(file, text, existing) {
  /** @type {Problem[]} */
  const problems = [];
  for (const { href, line } of extractLinks(text)) {
    if (!isLocalLink(href)) continue;
    const target = resolveLink(file, href);
    if (target === undefined) {
      problems.push({ file, line, rule: "link", message: `link para fora do repositório: ${href}` });
    } else if (!existing.has(target)) {
      problems.push({ file, line, rule: "link", message: `link quebrado: ${href}` });
    }
  }
  return problems;
}

/** @returns {Problem[]} */
function checkSensitiveData(file, text) {
  return findSensitiveData(text).map(({ id, description, line, excerpt }) => ({
    file,
    line,
    rule: "dado-sensivel",
    message: `${description} (${id}): ${excerpt}. O repositório é público; tire o dado ou troque por exemplo`,
  }));
}

/**
 * Valida a base inteira.
 * @param {Repository} repository
 * @param {{ today: string }} options data de hoje em AAAA-MM-DD (datas futuras são erro)
 * @returns {Problem[]}
 */
export function validateRepository(repository, { today }) {
  /** Arquivos e todas as pastas que os contêm, para conferir links. */
  const existing = new Set(["."]);
  for (const file of repository.files) {
    existing.add(file);
    for (let dir = path.posix.dirname(file); dir !== "."; dir = path.posix.dirname(dir)) existing.add(dir);
  }

  /** @type {Problem[]} */
  const problems = [];
  for (const file of repository.files) {
    const text = repository.texts.get(file);
    if (text === undefined) continue;
    const classification = classifyFile(file);
    if (classification) problems.push(...checkIndexedFile(file, text, classification, today));
    // Links de modelo apontam para o repositório que vai recebê-lo, não para esta base.
    if (/\.mdx?$/.test(file) && classification?.kind !== "template") problems.push(...checkLinks(file, text, existing));
    problems.push(...checkSensitiveData(file, text));
  }

  const index = repository.texts.get(INDEX_FILE);
  if (index === undefined) {
    problems.push({ file: INDEX_FILE, rule: "indice", message: "não existe; rode npm run indice" });
  } else if (index.replace(/\r\n/g, "\n") !== buildIndex(collectIndexEntries(repository))) {
    problems.push({ file: INDEX_FILE, rule: "indice", message: "desatualizado; rode npm run indice e commite o resultado" });
  }

  return problems.sort((a, b) => a.file.localeCompare(b.file, "en") || (a.line ?? 0) - (b.line ?? 0));
}

/** Uma linha por problema, no formato arquivo:linha [regra] mensagem. */
export function formatProblem({ file, line, rule, message }) {
  return `${file}${line ? `:${line}` : ""} [${rule}] ${message}`;
}
