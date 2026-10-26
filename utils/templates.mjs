/**
 * Modelos de `templates/` e `pipelines/`: variáveis `{{NOME}}` e o cabeçalho que descreve o
 * próprio modelo (comentário `resumo:` e, nos workflows, a linha "Copie para ...").
 */

const PLACEHOLDER = /\{\{([A-Z][A-Z0-9_]*)\}\}/g;
const HEADER_LINES = [/^<!--\s*resumo:.*-->\s*$/, /^\{\/\*\s*resumo:.*\*\/\}\s*$/, /^#\s*resumo:/, /^\/\/\s*resumo:/, /^#\s*Copie para /];

/** Nomes das variáveis do modelo, em ordem alfabética. */
export function findPlaceholders(text) {
  return [...new Set([...text.matchAll(PLACEHOLDER)].map((match) => match[1]))].sort();
}

/** Tira as linhas que descrevem o modelo (não fazem parte do arquivo gerado). */
export function stripTemplateHeader(text) {
  const lines = text.split("\n");
  let start = 0;
  while (start < lines.length && HEADER_LINES.some((pattern) => pattern.test(lines[start]))) start += 1;
  while (start < lines.length && lines[start].trim() === "") start += 1;
  return lines.slice(start).join("\n");
}

/**
 * Preenche o modelo. Variável sem valor fica como está e volta em `missing`; valor que ninguém
 * usa volta em `unused` (provável erro de digitação).
 * @param {string} text
 * @param {Record<string, string>} values
 */
export function renderTemplate(text, values) {
  const body = stripTemplateHeader(text);
  const placeholders = findPlaceholders(body);
  const missing = placeholders.filter((name) => !Object.hasOwn(values, name));
  const unused = Object.keys(values).filter((name) => !placeholders.includes(name)).sort();
  const output = body.replace(PLACEHOLDER, (whole, name) => (Object.hasOwn(values, name) ? values[name] : whole));
  return { output, missing, unused };
}

/**
 * Lê argumentos `CHAVE=valor`. Chave fora do padrão das variáveis vira erro.
 * @param {string[]} args
 */
export function parseAssignments(args) {
  /** @type {Record<string, string>} */
  const values = {};
  /** @type {string[]} */
  const errors = [];
  for (const arg of args) {
    const separator = arg.indexOf("=");
    const key = separator === -1 ? arg : arg.slice(0, separator);
    if (separator === -1 || !/^[A-Z][A-Z0-9_]*$/.test(key)) {
      errors.push(`argumento inválido "${arg}": use CHAVE=valor, com a chave em maiúsculas`);
      continue;
    }
    values[key] = arg.slice(separator + 1);
  }
  return { values, errors };
}

/**
 * Mantém só os ecossistemas pedidos no `dependabot.yml` modelo (um bloco por ecossistema,
 * separados por linha em branco).
 * @param {string} text
 * @param {string[]} ecosystems
 */
export function selectDependabotEcosystems(text, ecosystems) {
  const [head, updates = ""] = text.split(/^updates:\n/m);
  const blocks = updates.split(/\n\s*\n/).filter((block) => {
    const ecosystem = /package-ecosystem:\s*([\w-]+)/.exec(block)?.[1];
    return ecosystem !== undefined && ecosystems.includes(ecosystem);
  });
  return `${head}updates:\n${blocks.map((block) => block.replace(/\n+$/, "")).join("\n\n")}\n`;
}

/**
 * Troca a matriz de linguagens do `codeql.yml` modelo.
 * @param {string} text
 * @param {string[]} languages
 */
export function setCodeqlLanguages(text, languages) {
  return text.replace(/^(\s*language:\s*)\[[^\]]*\]/m, `$1[${languages.join(", ")}]`);
}
