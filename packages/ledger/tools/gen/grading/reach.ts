/**
 * The row types a generated `src/grading.ts` body names that neither its own signature nor a
 * callee's takes or returns, nor holds as a field nested in one: FNROWS A refuses a body naming a
 * heading outside its reach.
 */

/**
 * A generated function: its name, its callees, the headings its signature names and the headings
 * its body names.
 */
interface Generated {
  readonly name: string;
  readonly calls: readonly string[];
  readonly sig: readonly string[];
  readonly named: readonly string[];
}

/**
 * Each heading of a module, by name, and the capitalized words of its fields: the headings a field
 * holds rows of.
 *
 * @param text The module's text.
 * @returns The headings.
 */
const headingsOf = (text: string): ReadonlyMap<string, readonly string[]> =>
  new Map(
    [...text.matchAll(/export const (?<name>\w+) = rows\(\{(?<fields>[\s\S]*?)\n\}\)/gu)].map(
      (m) =>
        [
          m.groups?.["name"] ?? "",
          [...(m.groups?.["fields"] ?? "").matchAll(/\b(?<heading>[A-Z]\w*)\b/gu)].map(
            (x) => x.groups?.["heading"] ?? "",
          ),
        ] as const,
    ),
  );

/**
 * Each fn block of a module, whatever the order of its descriptor's keys: its body, then its calls,
 * args and returns read apart.
 *
 * @param text The module's text.
 * @param heads The module's headings.
 * @returns The functions.
 */
const functionsOf = (text: string, heads: ReadonlyMap<string, readonly string[]>): Generated[] =>
  [
    ...text.matchAll(
      /export const (?<name>\w+) = fn\("\w+", \{(?<descriptor>[\s\S]*?\n\s*body: fn\.body(?<body>`(?:[^`\\]|\\[\s\S])*`)[\s\S]*?)\n\}\)/gu,
    ),
  ].map((m) => {
    const body = m.groups?.["body"] ?? "";
    const rest = (m.groups?.["descriptor"] ?? "").replace(body, "");
    const calls = /\bcalls: \[(?<calls>[^\]]*)\]/u.exec(rest)?.groups?.["calls"] ?? "";
    const args = /\bargs: \{(?<args>[\s\S]*?)\},?\n/u.exec(rest)?.groups?.["args"] ?? "";
    const returns =
      /\breturns: (?<returns>[\s\S]*?),?\n\s*(?:volatility|\})/u.exec(rest)?.groups?.["returns"] ??
      "";

    return {
      calls: calls
        .split(",")
        .map((x) => x.trim())
        .filter((x) => x !== ""),
      name: m.groups?.["name"] ?? "",
      named: [
        ...new Set(
          [...body.matchAll(/\$\{(?<heading>\w+)\}/gu)].map((x) => x.groups?.["heading"] ?? ""),
        ),
      ],
      sig: [...`${args} ${returns}`.matchAll(/\b(?<heading>[A-Z]\w*)\b/gu)]
        .map((x) => x.groups?.["heading"] ?? "")
        .filter((h) => heads.has(h)),
    };
  });

/**
 * The headings reachable from some: each, and every heading a field of one holds rows of,
 * transitively.
 *
 * @param heads The module's headings.
 * @param hs The headings to start from.
 * @returns Every heading reachable from them.
 */
const closure = (
  heads: ReadonlyMap<string, readonly string[]>,
  hs: readonly string[],
): Set<string> => {
  const out = new Set<string>();
  const go = (h: string): void => {
    if (out.has(h)) {
      return;
    }

    out.add(h);
    for (const k of heads.get(h) ?? []) {
      go(k);
    }
  };
  for (const h of hs) {
    go(h);
  }

  return out;
};

/**
 * The functions of a module that name a heading out of reach, each with the headings.
 *
 * @param text The module's text.
 * @returns Each such function as `name: headings`.
 */
export const outOfReach = (text: string): string[] => {
  const heads = headingsOf(text);
  const fns = functionsOf(text, heads);
  const byName = new Map(fns.map((f) => [f.name, f] as const));

  return fns
    .map((f) => {
      const reach = closure(heads, [...f.sig, ...f.calls.flatMap((c) => byName.get(c)?.sig ?? [])]);

      return { name: f.name, none: f.named.filter((h) => !reach.has(h)) };
    })
    .filter((f) => f.none.length > 0)
    .map((f) => `${f.name}: ${f.none.join(", ")}`);
};
