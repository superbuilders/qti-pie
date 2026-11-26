/**
 * TeX's Greek letter commands (tex-normal's one TeX token, math-canonical's names), each as the
 * letter it writes, a variant as the letter it varies.
 *
 * @module
 */

/**
 * TeX's Greek letter commands, each as the letter it writes (a variant as the letter it varies).
 */
export const greekLetters = {
  Delta: "Δ",
  Gamma: "Γ",
  Lambda: "Λ",
  Omega: "Ω",
  Phi: "Φ",
  Pi: "Π",
  Psi: "Ψ",
  Sigma: "Σ",
  Theta: "Θ",
  Upsilon: "Υ",
  Xi: "Ξ",
  alpha: "α",
  beta: "β",
  chi: "χ",
  delta: "δ",
  epsilon: "ε",
  eta: "η",
  gamma: "γ",
  iota: "ι",
  kappa: "κ",
  lambda: "λ",
  mu: "μ",
  nu: "ν",
  omega: "ω",
  omicron: "ο",
  phi: "φ",
  pi: "π",
  psi: "ψ",
  rho: "ρ",
  sigma: "σ",
  tau: "τ",
  theta: "θ",
  upsilon: "υ",
  varepsilon: "ε",
  varphi: "φ",
  varpi: "π",
  varrho: "ρ",
  varsigma: "ς",
  vartheta: "θ",
  xi: "ξ",
  zeta: "ζ",
} as const satisfies Readonly<Record<string, string>>;

/**
 * Whether a command's name is a Greek letter's.
 *
 * @param name - The name, its backslash removed.
 * @returns Whether it is.
 */
export const isGreekCommand = (name: string): name is keyof typeof greekLetters =>
  Object.hasOwn(greekLetters, name);
