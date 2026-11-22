/**
 * The string operations the grade.ts generator's stages splice text with: a lookup that misses
 * fails the stage, and a replacement is literal text, never a pattern.
 */

/**
 * Fails the stage with `what` unless `holds`.
 *
 * @param holds Whether the stage's expectation of its input holds.
 * @param what What was expected, for the failure's message.
 */
export const must: (holds: boolean, what: string) => asserts holds = (holds, what) => {
  if (!holds) {
    throw new Error(`grade.ts generator: ${what}`);
  }
};

/**
 * The first index of `part` in `text` at or after `from`, which must exist.
 *
 * @param text The text searched.
 * @param part The text sought.
 * @param from Where the search starts.
 * @returns The index.
 */
export const indexOf = (text: string, part: string, from = 0): number => {
  const at = text.indexOf(part, from);
  must(at !== -1, `no ${JSON.stringify(part.slice(0, 80))} after ${String(from)}`);

  return at;
};

/**
 * The last index of `part` in `text`, which must exist.
 *
 * @param text The text searched.
 * @param part The text sought.
 * @returns The index.
 */
export const lastIndexOf = (text: string, part: string): number => {
  const at = text.lastIndexOf(part);
  must(at !== -1, `no ${JSON.stringify(part.slice(0, 80))}`);

  return at;
};

/**
 * The last index of a whole `part` that ends at or before `end`, or -1.
 *
 * @param text The text searched.
 * @param part The text sought.
 * @param end Where every match must end by.
 * @returns The index, or -1.
 */
export const lastIndexBefore = (text: string, part: string, end: number): number =>
  end < part.length ? -1 : text.lastIndexOf(part, end - part.length);

/**
 * How many times `part` occurs in `text`, without overlap.
 *
 * @param text The text searched.
 * @param part The text counted.
 * @returns The count.
 */
export const count = (text: string, part: string): number => text.split(part).length - 1;

/**
 * `text` with every occurrence of `part` replaced by `by`, read as text.
 *
 * @param text The text.
 * @param part The text replaced.
 * @param by Its replacement.
 * @returns The text replaced.
 */
export const replaceAll = (text: string, part: string, by: string): string =>
  text.replaceAll(part, () => by);

/**
 * `text` with the first occurrence of `part` replaced by `by`, read as text
 * (`str.replace(part, by, 1)`).
 *
 * @param text The text.
 * @param part The text replaced.
 * @param by Its replacement.
 * @returns The text replaced.
 */
export const replaceFirst = (text: string, part: string, by: string): string =>
  text.replace(part, () => by);

/**
 * The lines of `text`, each with its line break (`str.splitlines(True)` over text broken by
 * `\n` alone).
 *
 * @param text The text.
 * @returns Its lines.
 */
const linesOf = (text: string): string[] => text.match(/[^\n]*\n|[^\n]+$/gu) ?? [];

/**
 * `text` with every line that holds more than white space indented by `indent`.
 *
 * @param text The text.
 * @param indent What each line is indented by.
 * @returns The text indented.
 */
export const indented = (text: string, indent: string): string =>
  linesOf(text)
    .map((line) => (line.trim() === "" ? line : indent + line))
    .join("");

/**
 * The name with its first letter upper case.
 *
 * @param name The name.
 * @returns The name capitalized.
 */
export const capitalized = (name: string): string => name.charAt(0).toUpperCase() + name.slice(1);

/**
 * A snake_case name in camelCase.
 *
 * @param name The name.
 * @returns The name in camelCase.
 */
export const camel = (name: string): string => {
  const [first = "", ...rest] = name.split("_");

  return first + rest.map(capitalized).join("");
};

/**
 * Every match of a global pattern over `text`, in order.
 *
 * @param text The text.
 * @param pattern The pattern, global.
 * @returns The matches.
 */
export const matchesOf = (text: string, pattern: RegExp): RegExpExecArray[] => [
  ...text.matchAll(pattern),
];

/**
 * The end of a match: the index just after it.
 *
 * @param match The match.
 * @returns Its end.
 */
export const endOf = (match: RegExpExecArray): number => match.index + match[0].length;

/**
 * The text of a match's named group, which must have matched.
 *
 * @param match The match.
 * @param group The group's name.
 * @returns The group's text.
 */
export const groupOf = (match: RegExpExecArray, group: string): string => {
  const text = match.groups?.[group];
  must(text !== undefined, `group ${group} of ${JSON.stringify(match[0])}`);

  return text;
};

/**
 * Two texts' order by their UTF-16 code units, which for the generator's ASCII names is their
 * code point order.
 *
 * @param a A text.
 * @param b Another.
 * @returns Their order.
 */
export const byCodeUnits = (a: string, b: string): number => {
  if (a < b) {
    return -1;
  }

  return a > b ? 1 : 0;
};

/**
 * How a character moves the depth of a bracket pair.
 *
 * @param c The character.
 * @param open The pair's opening bracket.
 * @param close Its closing bracket.
 * @returns 1 for the opening bracket, -1 for the closing one, else 0.
 */
export const depthStep = (c: string, open: string, close: string): number => {
  if (c === open) {
    return 1;
  }

  return c === close ? -1 : 0;
};

/**
 * The first match of a pattern over `text`, which must exist.
 *
 * @param text The text.
 * @param pattern The pattern.
 * @returns The match.
 */
export const matchOf = (text: string, pattern: RegExp): RegExpExecArray => {
  const match = new RegExp(pattern.source, pattern.flags.replace("g", "")).exec(text);
  must(match !== null, `no match of /${pattern.source}/ in ${JSON.stringify(text.slice(0, 300))}`);

  return match;
};

/**
 * `text` with the first match of `pattern` replaced, of which there must be one (`re.subn(…,
 * count=1)` asserted to have replaced).
 *
 * @param text The text.
 * @param pattern The pattern, not global.
 * @param by The replacement of the match.
 * @param what What the replacement does, for the failure's message.
 * @returns The text replaced.
 */
export const replaceMatch = (
  text: string,
  pattern: RegExp,
  by: (match: RegExpExecArray) => string,
  what: string,
): string => {
  const match = pattern.exec(text);
  must(match !== null, `${what}: no match in ${JSON.stringify(text.slice(0, 400))}`);

  return text.slice(0, match.index) + by(match) + text.slice(endOf(match));
};

/**
 * Every rule arrow `(r) => { … }` of `text`, in order, each to the brace closing its body.
 *
 * @param text The text.
 * @returns The arrows' texts.
 */
export const arrows = (text: string): string[] => {
  const out: string[] = [];
  const head = "(r) => {";
  let from = text.indexOf(head);
  while (from >= 0) {
    let depth = 0;
    let k = from + "(r) => ".length;
    for (; ; k += 1) {
      const c = text.charAt(k);
      must(k < text.length, "a closed rule body");
      depth += depthStep(c, "{", "}");
      if (c === "}" && depth === 0) {
        break;
      }
    }
    out.push(text.slice(from, k + 1));
    from = text.indexOf(head, k + 1);
  }

  return out;
};

/**
 * The text of one reader of a closure, from its head to the closure's next member (its JSDoc, a
 * const or the return).
 *
 * @param block The closure's text.
 * @param head The reader's head.
 * @returns The reader's text.
 */
export const readerOf = (block: string, head: string): string => {
  const at = indexOf(block, head);
  const stops = ["\n  /**\n", "\n  const ", "\n  return "]
    .map((member) => block.indexOf(member, at + 1))
    .filter((stop) => stop >= 0);
  must(stops.length > 0, `a member after ${head.trim()}`);

  return block.slice(at, Math.min(...stops));
};
