/**
 * Front matter dos arquivos da base: um subconjunto pequeno de YAML (chave: valor e listas
 * com "  - item"), suficiente para `resumo`, `atualizado`, `fontes`, `name` e `description`.
 * Sem dependência externa de propósito (ver docs/adr/0001).
 */

const KEY_LINE = /^([A-Za-z][\w-]*):\s*(.*)$/;
const LIST_ITEM = /^\s+-\s+(.*)$/;

/** Formas aceitas de resumo na primeira linha de arquivos sem front matter. */
const SUMMARY_COMMENTS = [
  /^<!--\s*resumo:\s*(.+?)\s*-->\s*$/, // Markdown
  /^\{\/\*\s*resumo:\s*(.+?)\s*\*\/\}\s*$/, // MDX
  /^#\s*resumo:\s*(.+?)\s*$/, // YAML e shell
  /^\/\/\s*resumo:\s*(.+?)\s*$/, // JavaScript
];

function unquote(value) {
  const trimmed = value.trim();
  const quoted = /^(["'])(.*)\1$/.exec(trimmed);
  return quoted ? quoted[2] : trimmed;
}

/**
 * Lê o front matter do topo do texto.
 * @param {string} text
 * @returns {{ data: Record<string, string | string[]> | null, body: string, error?: string }}
 */
export function parseFrontMatter(text) {
  const lines = text.split(/\r?\n/);
  if (lines[0] !== "---") return { data: null, body: text };

  const end = lines.indexOf("---", 1);
  if (end === -1) return { data: null, body: text, error: "front matter sem a linha de fechamento ---" };

  /** @type {Record<string, string | string[]>} */
  const data = {};
  let currentKey = null;
  for (const line of lines.slice(1, end)) {
    if (line.trim() === "") continue;

    const item = LIST_ITEM.exec(line);
    if (item && currentKey !== null) {
      const current = data[currentKey];
      data[currentKey] = Array.isArray(current) ? [...current, unquote(item[1])] : [unquote(item[1])];
      continue;
    }

    const pair = KEY_LINE.exec(line);
    if (!pair) return { data: null, body: text, error: `linha inválida no front matter: "${line}"` };

    currentKey = pair[1];
    data[currentKey] = pair[2] === "" ? [] : unquote(pair[2]);
  }

  return { data, body: lines.slice(end + 1).join("\n") };
}

/**
 * Resumo de uma linha do arquivo: `resumo` ou `description` do front matter, ou um comentário
 * `resumo:` na primeira linha (modelos, MDX, YAML, scripts).
 * @param {string} text
 * @returns {string | undefined}
 */
export function extractSummary(text) {
  const { data } = parseFrontMatter(text);
  if (data) {
    for (const key of ["resumo", "description"]) {
      const value = data[key];
      if (typeof value === "string" && value.length > 0) return value;
    }
    return undefined;
  }

  const firstLine = text.split(/\r?\n/, 1)[0] ?? "";
  for (const pattern of SUMMARY_COMMENTS) {
    const match = pattern.exec(firstLine);
    if (match) return match[1];
  }
  return undefined;
}

/** `AAAA-MM-DD` que existe no calendário. */
export function isValidDate(value) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().startsWith(value);
}
