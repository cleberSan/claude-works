import path from "node:path";

const LINK = /!?\[[^\]]*\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g;

/** Troca comentários HTML e MDX por espaços, preservando as quebras de linha (e a numeração). */
function blankComments(text) {
  const blank = (match) => match.replace(/[^\n]/g, " ");
  return text.replace(/<!--[\s\S]*?-->/g, blank).replace(/\{\/\*[\s\S]*?\*\/\}/g, blank);
}

/**
 * Links Markdown do texto, fora de blocos de código, código inline e comentários.
 * @param {string} text
 * @returns {{ href: string, line: number }[]}
 */
export function extractLinks(text) {
  /** @type {{ href: string, line: number }[]} */
  const links = [];
  let inFence = false;
  blankComments(text)
    .split(/\r?\n/)
    .forEach((rawLine, index) => {
      if (/^\s*(```|~~~)/.test(rawLine)) {
        inFence = !inFence;
        return;
      }
      if (inFence) return;
      const line = rawLine.replace(/`[^`]*`/g, "");
      for (const match of line.matchAll(LINK)) {
        links.push({ href: match[1], line: index + 1 });
      }
    });
  return links;
}

/** Link para arquivo do próprio repositório (não URL, âncora pura nem e-mail)? */
export function isLocalLink(href) {
  return !/^[a-z][a-z0-9+.-]*:/i.test(href) && !href.startsWith("#") && !href.startsWith("//");
}

/**
 * Caminho POSIX, relativo à raiz, para onde o link aponta; `undefined` se sair da raiz.
 * @param {string} fromFile caminho relativo do arquivo que contém o link
 * @param {string} href
 */
export function resolveLink(fromFile, href) {
  const withoutAnchor = decodeURIComponent(href.split("#")[0].split("?")[0]);
  if (withoutAnchor === "") return fromFile;
  const resolved = path.posix.normalize(path.posix.join(path.posix.dirname(fromFile), withoutAnchor));
  if (resolved === ".." || resolved.startsWith("../")) return undefined;
  return resolved.replace(/\/$/, "");
}
