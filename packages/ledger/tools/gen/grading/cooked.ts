/**
 * Holds a generated `src/grading.ts` to the machine's SQL: each `fn.body` template, cooked as
 * ECMAScript cooks a template (its template value, ECMA-262 §13.2.8.6: every escape sequence read,
 * each placeholder read as its row type's SQL name), is that function's SQL body byte for byte, and
 * every SQL function has one. The oracle is the language's reading of the template, not the
 * generator's escaping.
 */
/**
 * A PascalCase row type's SQL name.
 *
 * @param pascal The name.
 * @returns Its snake_case spelling.
 */
const snake = (pascal: string): string =>
  pascal.replaceAll(/(?<!^)(?<upper>[A-Z])/gu, "_$<upper>").toLowerCase();

/**
 * A camelCase function's SQL name.
 *
 * @param camel The name.
 * @returns Its snake_case spelling.
 */
const camelToSnake = (camel: string): string =>
  camel.replaceAll(/(?<upper>[A-Z])/gu, "_$<upper>").toLowerCase();

/**
 * The single-character escapes of a template, ECMA-262's SingleEscapeCharacter.
 */
const single = new Map([
  ['"', '"'],
  ["'", "'"],
  ["\\", "\\"],
  ["b", "\b"],
  ["f", "\f"],
  ["n", "\n"],
  ["r", "\r"],
  ["t", "\t"],
  ["v", "\v"],
]);

/**
 * A template's cooked text, from its source between the backticks: each escape sequence read (a
 * line continuation none, `\0`, `\x`, `\u` and `\u{}` their code points, a single escape its
 * character, any other character itself), each substitution `${Name}` its row type's SQL name.
 *
 * @param source The template's source.
 * @returns Its text.
 */
const cooked = (source: string): string => {
  let out = "";
  let i = 0;
  while (i < source.length) {
    const c = source.charAt(i);
    if (c === "$" && source.charAt(i + 1) === "{") {
      const end = source.indexOf("}", i);
      out += snake(source.slice(i + 2, end));
      i = end + 1;
    } else if (c === "\\") {
      const e = source.charAt(i + 1);
      if (e === "\r" && source.charAt(i + 2) === "\n") {
        i += 3;
      } else if (e === "\n" || e === "\r" || e === "\u2028" || e === "\u2029") {
        i += 2;
      } else if (e === "0") {
        out += "\0";
        i += 2;
      } else if (e === "x") {
        out += String.fromCodePoint(Number.parseInt(source.slice(i + 2, i + 4), 16));
        i += 4;
      } else if (e === "u" && source.charAt(i + 2) === "{") {
        const end = source.indexOf("}", i);
        out += String.fromCodePoint(Number.parseInt(source.slice(i + 3, end), 16));
        i = end + 1;
      } else if (e === "u") {
        out += String.fromCodePoint(Number.parseInt(source.slice(i + 2, i + 6), 16));
        i += 6;
      } else {
        out += single.get(e) ?? e;
        i += 2;
      }
    } else if (c === "\r") {
      // A template reads a CR or a CR LF in its source as an LF (ECMA-262 §13.2.8.6).
      out += "\n";
      i += source.charAt(i + 1) === "\n" ? 2 : 1;
    } else {
      out += c;
      i += 1;
    }
  }

  return out;
};

/**
 * The functions whose generated body is not their SQL body, and those the module or the SQL lacks.
 *
 * @param module The formatted module's text.
 * @param bodies Each SQL function's body, by its name.
 * @returns Their names.
 */
export const uncookedBodies = (module: string, bodies: ReadonlyMap<string, string>): string[] => {
  const generated = new Map(
    [
      ...module.matchAll(
        /export const (?<name>\w+) = fn\("\w+", \{[\s\S]*?\n\s*body: fn\.body`(?<source>(?:[^`\\]|\\[\s\S])*)`/gu,
      ),
    ].map(
      (m) => [camelToSnake(m.groups?.["name"] ?? ""), cooked(m.groups?.["source"] ?? "")] as const,
    ),
  );

  return [...new Set([...bodies.keys(), ...generated.keys()])].filter(
    (name) => generated.get(name) !== bodies.get(name),
  );
};
