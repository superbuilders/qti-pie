import type { Fragments } from "#tools/gen/grade/fragments.ts";
import {
  count,
  endOf,
  groupOf,
  indexOf,
  matchesOf,
  must,
  replaceFirst,
} from "#tools/gen/grade/text.ts";

/**
 * The sittings stage of grade.ts (v6b″), the last: the BINDLEVEL cutover
 * of grade.ts, after the admission stage, so admission's own readers, derived from
 * gradeArgumentsOf's and memberValuesOf's text, are derived from it as before. The ledger states
 * its subject sittings as the `sittings` relation parameter { child, stage } everywhere (the
 * lead's ledger shape, GRADING-SQL's ruling (B)); its heading is `sittingHeading`
 * (`#ledger/sitting-queries.ts`). The take's builders (TAKEN) state theirs as the item sessions
 * the take writes in their stratum, the `takenSessions` relation parameter of SessionSeed's
 * heading, since no read of a stratum sees what it writes.
 *
 * Over the builders TARGETS names:
 *
 * - The key fragment, scalar `child` and `stage` parameters, becomes the heading and a rule's
 *   `sittings` bind;
 * - Each root that read the scalars matches the call's `sittings` (`r.relation("sittings",
 *   sittingHeading)`);
 * - Every bind to the scalars binds `sittings` instead, in the rule that reads the bound query.
 *   grizzle has no statement-level relation parameter (`param` is scalar; `r.relation` is a
 *   rule's), so each statement-level bound query, hoisted once per statement before, becomes a
 *   function of the reading rule (`<name>In(r)`), and each rule that read it holds it as a local of
 *   the same name.
 */

/**
 * The builders the stage rewrites, each of which must stand in the text.
 */
const TARGETS = [
  "gradeArgumentsOf",
  "attemptArgumentsOf",
  "gradeAttemptOf",
  "testTreeOf",
  "memberValuesOf",
  "memberAdmissionArgumentsOf",
  "memberAnswerAdmissionOf",
  "takeArgumentsOf",
  "takeValuesOf",
] as const;

/**
 * The target builders whose key is the taken sessions, the take's `takenSessions` relation
 * parameter, not the call's sittings.
 */
const TAKEN: ReadonlySet<string> = new Set(["takeArgumentsOf", "takeValuesOf"]);

/**
 * A rule's body: its parameter's name, and the indices of the braces that open and close it.
 */
interface RuleBody {
  readonly close: number;
  readonly open: number;
  readonly param: string;
}

/**
 * The index after a string literal that opens at `k`, skipping its escapes.
 *
 * @param text The text.
 * @param k Where the string's quote stands.
 * @returns The index of its closing quote.
 */
const stringEnd = (text: string, k: number): number => {
  const quote = text.charAt(k);
  let j = k + 1;
  while (text.charAt(j) !== quote) {
    must(j < text.length, "a closed string");
    j += text.charAt(j) === "\\" ? 2 : 1;
  }

  return j;
};

/**
 * Whether a character opens a string literal.
 *
 * @param c The character.
 * @returns Whether it is a quote.
 */
const isQuote = (c: string): boolean => c === '"' || c === "'" || c === "`";

/**
 * The index of the bracket closing the one at `text[i]`, skipping strings and comments.
 *
 * @param text The text.
 * @param i Where the opening bracket stands.
 * @returns The index of its closing bracket.
 */
const scanClose = (text: string, i: number): number => {
  let depth = 0;
  for (let k = i; k < text.length; k += 1) {
    const c = text.charAt(k);
    if (isQuote(c)) {
      k = stringEnd(text, k);
    } else if (text.startsWith("//", k)) {
      k = indexOf(text, "\n", k);
    } else if (text.startsWith("/*", k)) {
      k = indexOf(text, "*/", k) + 1;
    } else if ("({[".includes(c)) {
      depth += 1;
    } else if (")}]".includes(c)) {
      depth -= 1;
      if (depth === 0) {
        return k;
      }
    }
  }
  throw new Error("grade.ts generator: an unclosed bracket");
};

/**
 * The text with every comment and string blanked to spaces, its offsets and line breaks kept.
 *
 * @param text The text.
 * @returns The text masked.
 */
const masked = (text: string): string => {
  const out = text.split("");
  const blank = (from: number, to: number) => {
    for (let x = from; x < to; x += 1) {
      out[x] = text.charAt(x) === "\n" ? "\n" : " ";
    }
  };
  let k = 0;
  while (k < text.length) {
    const c = text.charAt(k);
    if (isQuote(c)) {
      const j = stringEnd(text, k);
      blank(k + 1, j);
      k = j + 1;
    } else if (text.startsWith("/*", k)) {
      const j = indexOf(text, "*/", k) + 2;
      blank(k, j);
      k = j;
    } else if (text.startsWith("//", k)) {
      const j = indexOf(text, "\n", k);
      blank(k, j);
      k = j;
    } else {
      k += 1;
    }
  }

  return out.join("");
};

/**
 * Every `.rule((p) => { … })` body of the text.
 *
 * @param text The text.
 * @returns The bodies.
 */
const rulesOf = (text: string): RuleBody[] =>
  matchesOf(text, /\.rule\(\((?<param>\w+)\) => \{/gu).map((match) => {
    const open = endOf(match) - 1;

    return { close: scanClose(text, open), open, param: groupOf(match, "param") };
  });

/**
 * The innermost rule body that holds a position: of those that do, the first that opens last.
 *
 * @param rules The rule bodies.
 * @param pos The position.
 * @returns The body, or nothing where none holds it.
 */
const innermost = (rules: readonly RuleBody[], pos: number): RuleBody | undefined => {
  let best: RuleBody | undefined;
  for (const rule of rules) {
    if (rule.open < pos && pos < rule.close && (best === undefined || rule.open > best.open)) {
      best = rule;
    }
  }

  return best;
};

/**
 * The `;` that ends the statement starting at `i`, at bracket depth 0.
 *
 * @param text The text.
 * @param i Where the statement starts.
 * @returns The index of its `;`.
 */
const statementEnd = (text: string, i: number): number => {
  let depth = 0;
  for (let k = i; k < text.length; k += 1) {
    const c = text.charAt(k);
    if (isQuote(c)) {
      k = stringEnd(text, k);
    } else if (text.startsWith("/*", k)) {
      k = indexOf(text, "*/", k) + 1;
    } else if ("({[".includes(c)) {
      depth += 1;
    } else if (")}]".includes(c)) {
      depth -= 1;
    } else if (c === ";" && depth === 0) {
      return k;
    }
  }
  throw new Error("grade.ts generator: a statement with no end");
};

/**
 * Each bind to the scalar key, and its form over a rule's parameter `p`.
 */
const KEY_BINDS: readonly (readonly [RegExp, (p: string) => string])[] = [
  [/bySession\((?:gradedSitting|session|_session)\)/gu, (p) => `bySession(${p})`],
  [/\.bind\(sitting\)/gu, (p) => `.bind(sittingsIn(${p}))`],
  [/\.bind\(answeredKey\)/gu, (p) => `.bind(memberKeyIn(${p}))`],
];

/**
 * A read of the scalar key's fields.
 */
const KEY_FIELDS = /\b(?:session|sitting|answeredKey)\.(?<field>child|stage|item)\b/gu;

/**
 * Text as a pattern that matches it alone.
 *
 * @param text The text.
 * @returns The pattern's source.
 */
const literal = (text: string): string => text.replaceAll(/[\\^$.*+?()[\]{}|/]/gu, String.raw`\$&`);

/**
 * Each key fragment and what it becomes: the graded sitting's (gradeArgumentsOf's,
 * attemptArgumentsOf's and gradeAttemptOf's, and the take's taken sessions), the test run's
 * sitting (testTreeOf's and memberValuesOf's), and a test member's answered key and its rule form
 * (admission's).
 *
 * @param fragment The generator's fragments.
 * @param name The builder's name.
 * @returns The fragments' patterns and replacements.
 */
const keyFragments = (
  fragment: Fragments,
  name: string,
): readonly (readonly [RegExp, string])[] => [
  [
    new RegExp(
      `${literal("  /**\n   * The graded sitting: the call's `child` and `stage`")}[\\s\\S]*?\\*/${literal(`
  const gradedSitting = {
    child: param("child", LearnerId),
    stage: param("stage", pg.bigint),
  } as const;
  type GradedSession = typeof gradedSitting;

  /**
   * A query over the sitting's key, bound to the call's parameters: every parameter it reads, the
   * call's own.
   */
  const bySession = (session: GradedSession) => ({ child: session.child, stage: session.stage });
`)}`,
      "gu",
    ),
    fragment(TAKEN.has(name) ? "sittings/taken-sessions" : "sittings/graded-sitting"),
  ],
  [
    new RegExp(
      literal(`  const sitting = {
    child: param("child", LearnerId),
    stage: param("stage", pg.bigint),
  } as const;
`),
      "gu",
    ),
    fragment("sittings/sittings-in"),
  ],
  [
    new RegExp(
      literal(`  const answeredKey = {
    child: param("child", LearnerId),
    item: param("item", fields.Named.fields.identifier),
    stage: param("stage", pg.bigint),
  } as const;
`),
      "gu",
    ),
    `  const memberKeyIn = (r: Rule<DeliveryLevel>) => ({
    item: r.param("item", fields.Named.fields.identifier),
    sittings: r.relation("sittings", sittingHeading),
  });
`,
  ],
  [
    new RegExp(
      literal(`  const keyIn = <S>(r: Rule<S>) => ({
    child: r.param("child", LearnerId),
    item: r.param("item", fields.Named.fields.identifier),
    stage: r.param("stage", pg.bigint),
  });
`),
      "gu",
    ),
    `  const keyIn = <S>(r: Rule<S>) => ({
    item: r.param("item", fields.Named.fields.identifier),
    sittings: r.relation("sittings", sittingHeading),
  });
`,
  ],
];

/**
 * An edit of a builder's text: the span it replaces and its replacement.
 */
type Edit = readonly [start: number, end: number, by: string];

/**
 * A statement-level bound query over the key: its name, where its statement begins, where its
 * right side begins, and its `;`.
 */
interface Hoisted {
  readonly end: number;
  readonly name: string;
  readonly rhs: number;
  readonly start: number;
}

/**
 * The statement-level bound queries over the key: each `  const NAME = …;` outside every rule
 * that holds a key bind outside every rule.
 *
 * @param t The builder's text.
 * @param rules Its rule bodies.
 * @returns The hoisted queries.
 */
const hoistedOf = (t: string, rules: readonly RuleBody[]): Hoisted[] =>
  matchesOf(t, /^ {2}const (?<name>\w+) = /gmu).flatMap((match) => {
    if (innermost(rules, match.index) !== undefined) {
      return [];
    }

    const rhs = endOf(match);
    const end = statementEnd(t, rhs);
    const binds = KEY_BINDS.some(([pattern]) =>
      matchesOf(t.slice(rhs, end), pattern).some(
        (bind) => innermost(rules, rhs + bind.index) === undefined,
      ),
    );

    return binds ? [{ end, name: groupOf(match, "name"), rhs, start: match.index }] : [];
  });

/**
 * A word's pattern.
 *
 * @param word The word.
 * @param flags The pattern's flags.
 * @returns The pattern.
 */
const wordPattern = (word: string, flags: string): RegExp => new RegExp(`\\b${word}\\b`, flags);

/**
 * The builder's key fragment, of which it holds one, as its heading or its rule's bind.
 *
 * @param source The builder's text.
 * @param name The builder's name.
 * @param fragment The generator's fragments.
 * @returns The text with its key fragment replaced.
 */
const withSittingsKey = (source: string, name: string, fragment: Fragments): string => {
  let fragments = 0;
  let t = source;
  for (const [pattern, by] of keyFragments(fragment, name)) {
    fragments += matchesOf(t, pattern).length;
    t = t.replaceAll(pattern, () => by);
  }
  must(fragments === 1, `${name}: one key fragment, not ${String(fragments)}`);

  return t;
};

/**
 * Step 1: each statement-level hoist over the key becomes a function of the reading rule, and its
 * right side reads the hoists it reads outside its rules through theirs.
 *
 * @param t The builder's text.
 * @param rules Its rule bodies.
 * @param hoisted Its hoists.
 * @returns The edits.
 */
const hoistEdits = (t: string, rules: readonly RuleBody[], hoisted: readonly Hoisted[]): Edit[] => {
  const tm = masked(t);
  const reads = new RegExp(`\\b(?<reader>${hoisted.map(({ name }) => name).join("|")})\\b`, "gu");

  return hoisted.flatMap(({ end, name, rhs, start }): Edit[] => {
    const rhsRules = rules.filter(({ open }) => rhs <= open && open < end);

    return [
      [start, rhs, `  const ${name}In = (r: Rule<DeliveryLevel>) =>\n    `],
      ...matchesOf(tm.slice(rhs, end), reads).flatMap((read): Edit[] => {
        const pos = rhs + read.index;
        const reader = groupOf(read, "reader");

        return innermost(rhsRules, pos) === undefined
          ? [[pos, pos + reader.length, `${reader}In(r)`]]
          : [];
      }),
    ];
  });
};

/**
 * Step 2: every key bind binds the innermost rule's parameter, else the hoist's own `r`.
 *
 * @param t The builder's text.
 * @param rules Its rule bodies.
 * @param hoisted Its hoists.
 * @param name The builder's name.
 * @returns The edits.
 */
const bindEdits = (
  t: string,
  rules: readonly RuleBody[],
  hoisted: readonly Hoisted[],
  name: string,
): Edit[] =>
  KEY_BINDS.flatMap(([pattern, form]) =>
    matchesOf(t, pattern).map((bind): Edit => {
      const pos = bind.index;
      const rule = innermost(rules, pos);
      must(
        rule !== undefined || hoisted.some(({ end, rhs }) => rhs <= pos && pos < end),
        `${name}: a key bind in a rule or a hoist at ${t.slice(Math.max(0, pos - 80), pos + 40)}`,
      );

      return [pos, endOf(bind), form(rule?.param ?? "r")];
    }),
  );

/**
 * What a read of the scalar key's field becomes in a rule over parameter `p`.
 *
 * @param field The field.
 * @param p The rule's parameter.
 * @returns The read over the call's sittings.
 */
const sittingsField = (field: string, p: string): string => {
  if (field === "child") {
    return "sittingChild";
  }

  return field === "stage" ? "sittingStage" : `${p}.param("item", fields.Named.fields.identifier)`;
};

/**
 * Step 3: each rule's reads of a hoist hold it as a local, and each root reads the call's
 * sittings.
 *
 * @param t The builder's text.
 * @param rules Its rule bodies.
 * @param names Its hoists' names.
 * @param name The builder's name.
 * @returns The edits.
 */
const ruleEdits = (
  t: string,
  rules: readonly RuleBody[],
  names: readonly string[],
  name: string,
): Edit[] =>
  rules.flatMap(({ close: b, open: a, param: p }): Edit[] => {
    let own = masked(t.slice(a, b));
    for (const nested of rules
      .filter(({ open }) => a < open && open < b)
      .toSorted((x, y) => y.open - x.open)) {
      own =
        own.slice(0, nested.open - a) +
        " ".repeat(nested.close - nested.open) +
        own.slice(nested.close - a);
    }
    const edits: Edit[] = [];
    const used = names.filter((hoist) => wordPattern(hoist, "u").test(own));
    let head = used.map((hoist) => `\n    const ${hoist} = ${hoist}In(${p});`).join("");
    const keyFields = matchesOf(own, KEY_FIELDS);
    if (keyFields.length > 0) {
      head += `\n    const sittings = ${p}.relation("sittings", sittingHeading);\n    const { child: sittingChild, stage: sittingStage } = v(sittings, "subjectSitting");`;
      for (const field of keyFields) {
        edits.push([a + field.index, a + endOf(field), sittingsField(groupOf(field, "field"), p)]);
      }
      const ret = new RegExp(`return ${p}\\s*\\n\\s*\\.match\\(`, "u").exec(own);
      must(ret !== null, `${name}: a root's return in ${own.slice(0, 300)}`);

      const at = a + endOf(ret) - ".match(".length;
      edits.push([
        at,
        at,
        ".match(sittings, { child: sittingChild, stage: sittingStage })\n        ",
      ]);
    }

    return head === "" ? edits : [...edits, [a + 1, a + 1, head]];
  });

/**
 * The text with its edits applied, right to left, so each applies where it was found.
 *
 * @param source The text.
 * @param edits The edits.
 * @returns The text edited.
 */
const applied = (source: string, edits: readonly Edit[]): string => {
  let t = source;
  for (const [s, e, by] of edits.toSorted(([s1, e1], [s2, e2]) => s2 - s1 || e2 - e1)) {
    t = t.slice(0, s) + by + t.slice(e);
  }

  return t;
};

/**
 * Step 4: no statement-level read of a hoist is left, and no scalar key.
 *
 * @param t The builder's text, edited.
 * @param names Its hoists' names.
 * @param name The builder's name.
 */
const mustReadSittings = (t: string, names: readonly string[], name: string): void => {
  const rules = rulesOf(t);
  const tm = masked(t);
  for (const hoist of names) {
    for (const read of matchesOf(tm, wordPattern(hoist, "gu"))) {
      const end = endOf(read);
      if (t.slice(end, end + 2) !== "In" && !/^\s*:/u.test(tm.slice(end))) {
        must(
          innermost(rules, read.index) !== undefined ||
            t.slice(Math.max(0, read.index - 10), read.index).endsWith("const "),
          `${name}: ${hoist} read at the statement level`,
        );
      }
    }
  }
  must(
    !/[^.\w]param\("(?:child|stage)"|r\.param\("(?:child|stage)"/u.test(t),
    `${name}: no scalar key`,
  );
};

/**
 * Step 5: a reader that no longer reads its `session` names it unused.
 *
 * @param source The builder's text, edited.
 * @returns The text with each unread parameter named so.
 */
const unreadSessions = (source: string): string => {
  let t = source;
  for (const reader of matchesOf(
    t,
    /const \w+ = \((?<session>session): GradedSession\b/dgu,
  ).toReversed()) {
    const group = reader.indices?.groups?.["session"];
    must(group !== undefined, "the reader's session parameter");

    const [from, to] = group;
    const bodyEnd = statementEnd(t, indexOf(t, "= ", reader.index) + 2);
    if (!/\bsession\b/u.test(masked(t).slice(endOf(reader), bodyEnd))) {
      t = `${t.slice(0, from)}_session${t.slice(to)}`;
    }
  }

  return t;
};

/**
 * A reader that step 5 found reading no `session`: its head, up to its body.
 */
const UNREAD_READER = /^ {2}const (?<reader>\w+) = \(_session: GradedSession\) =>\s*/gmu;

/**
 * Step 7: each reader that reads no `session` is one query value, built once per builder: its
 * definition becomes its body, and each call of it the value. Steps 5 and 7 run to a fixed point,
 * since a reader whose only read of its `session` was a call of another reader reads none once that
 * call is a value. Every rule binds the value it reads
 * (`<hoist>In`), and grizzle emits one copy of a value that rules and call arguments read, where a
 * reader called once per reading rule built each rule its own copy: the grade statement's runs core
 * was emitted once per machine argument, 29 times, and once more for the inserts, which read
 * `args.gradable`, one value (COMPILE-AT-PUBLISH C1).
 *
 * @param source The builder's text, edited.
 * @param name The builder's name.
 * @returns The text with each such reader a value.
 */
const readerValues = (source: string, name: string): string => {
  const readers = matchesOf(source, UNREAD_READER);
  let t = source;
  for (const head of readers.toReversed()) {
    t = `${t.slice(0, head.index)}  const ${groupOf(head, "reader")} = ${t.slice(endOf(head))}`;
  }
  for (const head of readers) {
    const reader = groupOf(head, "reader");
    t = t.replaceAll(new RegExp(`\\b${reader}\\((?:gradedSitting|_?session)\\)`, "gu"), reader);
    must(
      !new RegExp(`\\b${reader}\\(`, "u").test(masked(t)),
      `${name}: ${reader} is called nowhere, every read its value`,
    );
  }

  return t;
};

/**
 * The graded sitting's type alias, as the graded sitting's fragment declares it.
 */
const SESSION_ALIAS = "  type GradedSession = typeof gradedSitting;\n";

/**
 * Step 6: a builder that names GradedSession nowhere but in its alias (the take's write, whose
 * readers are all its arguments builder's) drops the alias.
 *
 * @param t The builder's text, edited.
 * @returns The text without an unread alias.
 */
const unreadAlias = (t: string): string =>
  t.includes(SESSION_ALIAS) && matchesOf(masked(t), /\bGradedSession\b/gu).length === 1
    ? replaceFirst(t, SESSION_ALIAS, "")
    : t;

/**
 * One builder's text over the call's sittings.
 *
 * @param source The builder's text.
 * @param name The builder's name.
 * @param fragment The generator's fragments.
 * @returns The text rewritten.
 */
const transform = (source: string, name: string, fragment: Fragments): string => {
  const t = withSittingsKey(source, name, fragment);
  const rules = rulesOf(t);
  const hoisted = hoistedOf(t, rules);
  const names = hoisted.map((hoist) => hoist.name);
  for (const hoist of names) {
    must(!wordPattern(`${hoist}In`, "u").test(t), `${name}: ${hoist}In is free`);
  }
  const edited = applied(t, [
    ...hoistEdits(t, rules, hoisted),
    ...bindEdits(t, rules, hoisted, name),
    ...ruleEdits(t, rules, names, name),
  ]);
  mustReadSittings(edited, names, name);

  let settled = edited;
  for (let previous = ""; previous !== settled;) {
    previous = settled;
    settled = readerValues(unreadSessions(settled), name);
  }

  return unreadAlias(settled);
};

/**
 * The builders the stage rewrites, by name.
 */
const TARGET_NAMES: ReadonlySet<string> = new Set(TARGETS);

/**
 * The sittings import, beside the scalars' import it follows.
 */
const SCALARS_IMPORT = 'import { QtiInteger } from "#ledger/scalars.ts";\n';

/**
 * The sittings stage: every target builder over the call's sittings, and the heading's import.
 *
 * @param src The take stage's text, formatted.
 * @param fragment The generator's fragments.
 * @returns The stage's text.
 */
export const sittingsStage = (src: string, fragment: Fragments): string => {
  const starts = matchesOf(src, /^export const (?<builder>\w+) = /gmu);
  const seen = new Set<string>();
  const parts: string[] = [];
  let last = 0;
  for (const [i, start] of starts.entries()) {
    const builder = groupOf(start, "builder");
    if (TARGET_NAMES.has(builder)) {
      const end = starts[i + 1]?.index ?? src.length;
      parts.push(
        src.slice(last, start.index),
        transform(src.slice(start.index, end), builder, fragment),
      );
      seen.add(builder);
      last = end;
    }
  }
  parts.push(src.slice(last));
  must(
    seen.size === TARGETS.length && TARGETS.every((target) => seen.has(target)),
    `every target builder: ${[...seen].join(", ")}`,
  );

  const text = parts.join("");
  must(count(text, SCALARS_IMPORT) === 1, "the scalars' one import");

  return replaceFirst(
    text,
    SCALARS_IMPORT,
    `${SCALARS_IMPORT}import { sittingHeading } from "#ledger/sitting-queries.ts";\n`,
  );
};
