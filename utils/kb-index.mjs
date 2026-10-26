import path from "node:path";

/** Seções do índice, na ordem do mapa do CLAUDE.md. */
export const SECTIONS = Object.freeze([
  { prefix: "memorias/", title: "Memórias" },
  { prefix: "projetos/", title: "Projetos" },
  { prefix: "stacks/", title: "Stacks" },
  { prefix: "apis/", title: "APIs" },
  { prefix: "snippets/", title: "Snippets" },
  { prefix: "templates/", title: "Modelos" },
  { prefix: "pipelines/", title: "Pipelines" },
  { prefix: "agents/", title: "Fluxos de agentes" },
  { prefix: ".claude/skills/", title: "Skills do Claude Code" },
  { prefix: ".claude/agents/", title: "Subagentes do Claude Code" },
  { prefix: "scripts/", title: "Scripts" },
  { prefix: "docs/", title: "Docs" },
]);

export const INDEX_FILE = "INDICE.md";

/** Caracteres por token na estimativa. Português com Markdown fica perto de 3,5. */
const CHARS_PER_TOKEN = 3.5;

/** Estimativa de tokens, sem tokenizador: serve para decidir o que abrir, não para cobrança. */
export function estimateTokens(text) {
  return Math.ceil(text.length / CHARS_PER_TOKEN);
}

/** "~800", "~2,1k": arredondado em centenas para o índice não mudar a cada vírgula. */
export function formatTokens(tokens) {
  const hundreds = Math.max(1, Math.round(tokens / 100));
  return hundreds < 10 ? `~${hundreds * 100}` : `~${(hundreds / 10).toFixed(1).replace(".", ",")}k`;
}

/**
 * @typedef {"content" | "template" | "pipeline" | "skill" | "subagent"} FileKind
 * @typedef {{ section: (typeof SECTIONS)[number], kind: FileKind, label: string, name?: string }} Classification
 */

/**
 * Diz se o arquivo entra no índice e de que tipo é; `undefined` para o que fica de fora
 * (raiz, testes, utils, código dos scripts, .github).
 * @param {string} file caminho POSIX relativo à raiz
 * @returns {Classification | undefined}
 */
export function classifyFile(file) {
  const section = SECTIONS.find((candidate) => file.startsWith(candidate.prefix));
  if (!section) return undefined;
  const rest = file.slice(section.prefix.length);
  const extension = path.posix.extname(file);

  if (section.prefix === ".claude/skills/") {
    const name = /^([^/]+)\/SKILL\.md$/.exec(rest)?.[1];
    return name ? { section, kind: "skill", label: name, name } : undefined;
  }
  if (section.prefix === ".claude/agents/") {
    const name = /^([^/]+)\.md$/.exec(rest)?.[1];
    return name ? { section, kind: "subagent", label: name, name } : undefined;
  }
  if (section.prefix === "templates/") {
    return [".md", ".mdx"].includes(extension) ? { section, kind: "template", label: rest } : undefined;
  }
  if (section.prefix === "pipelines/" && extension === ".yml") return { section, kind: "pipeline", label: rest };
  return extension === ".md" ? { section, kind: "content", label: rest } : undefined;
}

/**
 * @typedef {{ file: string, summary: string, tokens: number }} IndexEntry
 */

/**
 * Gera o INDICE.md: uma linha por arquivo com nome, tokens estimados e resumo.
 * @param {IndexEntry[]} entries
 */
export function buildIndex(entries) {
  const lines = [
    "<!-- Gerado por `npm run indice` a partir do resumo de cada arquivo. Não edite à mão. -->",
    "# Índice",
    "",
    "Uma linha por arquivo: nome, tokens estimados e resumo. Comece pelo [CLAUDE.md](CLAUDE.md) e abra só o que o assunto pede.",
  ];

  let total = 0;
  for (const section of SECTIONS) {
    const inSection = entries
      .map((entry) => ({ entry, classification: classifyFile(entry.file) }))
      .filter(({ classification }) => classification?.section === section)
      .sort((a, b) => a.entry.file.localeCompare(b.entry.file, "en"));
    if (inSection.length === 0) continue;

    lines.push("", `## ${section.title} (\`${section.prefix}\`)`, "");
    for (const { entry, classification } of inSection) {
      total += entry.tokens;
      lines.push(`- [${/** @type {Classification} */ (classification).label}](${entry.file}) ${formatTokens(entry.tokens)}: ${entry.summary}`);
    }
  }

  lines.push("", `Total: ${entries.length} arquivos, ${formatTokens(total)} tokens. Ler tudo raramente compensa.`, "");
  return lines.join("\n");
}
