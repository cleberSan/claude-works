/**
 * Padrões de dado que não pode entrar num repositório público. Pega os formatos comuns, não
 * todos: a revisão humana continua necessária (docs/adr/0001).
 */

/** Domínios reservados para exemplo (RFC 2606 e 6761) e endereços técnicos sem dono pessoal. */
const ALLOWED_EMAIL_DOMAINS = [/(^|\.)example\.(com|org|net)$/i, /(^|\.)exemplo\.[a-z.]+$/i, /\.(test|invalid|example|localhost)$/i, /^users\.noreply\.github\.com$/i];

function isAllowedEmail(match) {
  const [local, domain = ""] = match.split("@");
  return /^(no-?reply|nao-responda)$/i.test(local) || ALLOWED_EMAIL_DOMAINS.some((pattern) => pattern.test(domain));
}

/** Valor de exemplo, variável ou referência a secret, não um segredo de verdade. */
function isPlaceholderValue(match) {
  const value = match.replace(/^[^:=]+[:=]\s*["']?/, "");
  // Chamada de função ou método em código (`senha = LerSenha(`) não é valor literal.
  if (/^[A-Za-z_$][\w$]*(?:\.[A-Za-z_$][\w$]*)*\(/.test(value)) return true;
  return /^(\$\{|\$\(|\{\{|<|\*{3}|x{3,}|\.{3}|seu[-_]|sua[-_]|exemplo|example|changeme|placeholder|secrets\.|env\.|process\.env|configuration\[)/i.test(value);
}

/**
 * @typedef {{ id: string, description: string, pattern: RegExp, allow?: (match: string) => boolean }} SensitivePattern
 * @type {readonly SensitivePattern[]}
 */
export const SENSITIVE_PATTERNS = Object.freeze([
  { id: "chave-anthropic", description: "chave da API da Anthropic", pattern: /\bsk-ant-[A-Za-z0-9_-]{16,}/g },
  { id: "token-github", description: "token do GitHub", pattern: /\b(?:gh[pousr]_[A-Za-z0-9]{30,}|github_pat_[A-Za-z0-9_]{40,})/g },
  { id: "chave-aws", description: "chave de acesso da AWS", pattern: /\b(?:AKIA|ASIA)[0-9A-Z]{16}\b/g },
  { id: "chave-google", description: "chave de API do Google", pattern: /\bAIza[0-9A-Za-z_-]{35}\b/g },
  { id: "chave-privada", description: "chave privada em PEM", pattern: /-----BEGIN (?:[A-Z]+ )*PRIVATE KEY-----/g },
  { id: "ocid", description: "identificador de recurso da Oracle Cloud (OCID)", pattern: /\bocid1\.[a-z0-9]+\.[a-z0-9-]*\.[a-z0-9-]*\.[a-z0-9]{20,}/g },
  {
    id: "segredo-atribuido",
    description: "senha, segredo ou token com valor literal",
    pattern: /\b(?:password|passwd|pwd|senha|secret|segredo|api[_-]?key|access[_-]?token|client[_-]?secret)\s*[:=]\s*["']?[^\s"'`;,)]{8,}/gi,
    allow: isPlaceholderValue,
  },
  { id: "email", description: "endereço de e-mail", pattern: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,}\b/g, allow: isAllowedEmail },
  {
    id: "telefone",
    description: "telefone celular brasileiro",
    pattern: /(?<![\w-])(?:\+?55\s?)?\(?[1-9]{2}\)?[\s-]?9\d{4}[\s-]?\d{4}(?![\w-])/g,
  },
  { id: "cpf", description: "CPF formatado (mesmo sintético)", pattern: /\b\d{3}\.\d{3}\.\d{3}-\d{2}\b/g },
]);

/** Mostra só o começo do achado: o log do CI não pode repetir o segredo. */
export function maskMatch(match) {
  const visible = match.slice(0, Math.min(6, Math.floor(match.length / 3)));
  return `${visible}… (${match.length} caracteres)`;
}

/**
 * Procura dados sensíveis no texto.
 * @param {string} text
 * @param {readonly SensitivePattern[]} [patterns]
 * @returns {{ id: string, description: string, line: number, excerpt: string }[]}
 */
export function findSensitiveData(text, patterns = SENSITIVE_PATTERNS) {
  /** @type {{ id: string, description: string, line: number, excerpt: string }[]} */
  const findings = [];
  text.split(/\r?\n/).forEach((line, index) => {
    for (const { id, description, pattern, allow } of patterns) {
      for (const match of line.matchAll(new RegExp(pattern.source, pattern.flags))) {
        if (allow?.(match[0])) continue;
        findings.push({ id, description, line: index + 1, excerpt: maskMatch(match[0]) });
      }
    }
  });
  return findings;
}
