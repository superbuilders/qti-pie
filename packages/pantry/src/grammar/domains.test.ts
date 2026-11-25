/**
 * The value-domain compiler's laws, each against an oracle that is not the compiler:
 *
 * - **The whitespace fold (spec-alignment §9.6).** XML Schema Part 2, 4.3.6, written here as a
 *   five-line normalization, is the oracle: a raw form is in a domain iff its normalization is in
 *   the domain's exact language. Searched over every definition the leaf resolves, on forms drawn
 *   from each definition's own language and perturbed by named whitespace variants.
 * - **The translation of XSD regular expressions.** `xmllint`, the XSD's own validator, judges every
 *   pattern facet the pinned XSDs state, each as the one facet of an `xs:string` restriction, on
 *   words of the pattern and their mutants.
 * - **Integer intervals.** `bigint` comparison, over every interval of a small box, exhausted.
 * - **`xs:date`.** A naive calendar: the Gregorian month lengths and leap rule.
 * - **The name tables.** XML 1.0 (Second Edition)'s Appendix B, read from the cached specification.
 * - **The shared syntax.** PostgreSQL's and JavaScript's regular expression grammars, turned into a
 *   checker of the subset both read.
 */
import { regex as arkregex } from "arkregex";
import { globSync, readFileSync } from "node:fs";
import path from "node:path";
import { assert, describe, it } from "@effect/vitest";
import { regexMaxRepeat } from "@bjornpagen/grizzle";
import { drawn, exhaust, explore } from "@bjornpagen/testing/explore";
import { required, requiredInSpace } from "@bjornpagen/testing/features";
import { element, int, weighted } from "@bjornpagen/testing/gen";
import type { Gen } from "@bjornpagen/testing/gen";
import { notesOnly } from "@bjornpagen/testing/sense";
import { completeShrink } from "@bjornpagen/testing/shrink";
import { searched } from "@bjornpagen/testing/vitest";
import { Array as Arr, Duration, Effect, Formatter, Option, pipe, Result } from "effect";
import { anyUriPattern, compile, languageOf, patternFlags } from "#pantry/grammar/domains.ts";
import type { CodeSet, Reading, Regex } from "#pantry/grammar/domains.ts";
import {
  attributeDeclarations,
  globalAttributes,
  openAttribute,
  textTypes,
} from "#pantry/vocab/inventory/attributes.ts";
import { builtinDomainOf } from "#pantry/vocab/derive/domains.ts";
import type { Domain, Facet } from "#pantry/vocab/inventory/types.ts";
import { searchWidth } from "#pantry/test/settings.ts";

/**
 * Every distinct definition the leaf resolves, once each with a declaration it types: the leaf
 * states each definition once and its declarations share it.
 */
const leafDomains: readonly { readonly domain: Domain; readonly where: string }[] = [
  ...new Map(
    [
      ...attributeDeclarations.map(({ domain, kind, name }) => ({
        domain,
        where: `${kind}@${name}`,
      })),
      ...textTypes.map(({ domain, kind }) => ({ domain, where: `${kind} text` })),
      ...globalAttributes.map(({ domain, name }) => ({ domain, where: name })),
      { domain: openAttribute.domain, where: "open name" },
    ].map((entry) => [entry.domain, entry] as const),
  ).values(),
];

/**
 * Definitions no pinned XSD states, under each class, whose languages hold what the leaf's do not:
 * a space inside a word, and a class that holds a tab but no space. Over the leaf alone the
 * `replace` fold is observable nowhere (every pinned `replace` language that holds a space already
 * holds the three breaks), so a fold that did nothing would pass; these make it seen.
 */
const syntheticDomains = pipe(
  [
    ["replace", "a b"],
    ["replace", "[^ ]+"],
    ["replace", String.raw`x\sy`],
    ["collapse", "a b( c)*"],
    ["preserve", "a b"],
    ["collapse", anyUriPattern],
    ["collapse", " ?a"],
    ["collapse", "( a)*b"],
    ["collapse", "([ x]|y)+z"],
  ] as const,
  Arr.map(
    ([whiteSpace, pattern]) =>
      ({
        domain: {
          _tag: "atomic",
          builtin: "string",
          facets: [{ facet: "whiteSpace", value: whiteSpace }],
          patterns: [[pattern]],
          primitive: "string",
        },
        where: `synthetic ${whiteSpace} ${pattern}`,
      }) satisfies { readonly domain: Domain; readonly where: string },
  ),
);

/**
 * The definitions the fold is searched over, a non-empty list to draw from: the leaf's, then the
 * synthetic ones, which are never none.
 */
const leafChoices = Arr.appendAll(leafDomains, syntheticDomains);

/**
 * Compile a definition to a host regex, failing the test that reads it when it does not compile.
 *
 * @param domain - The definition.
 * @param reading - How its whitespace is read.
 * @returns The regex.
 */
const regexOf = (domain: Domain, reading: Reading): RegExp =>
  arkregex.as(Result.getOrThrow(compile(domain, reading)).pattern, patternFlags);

/**
 * The host regexes a suite has compiled, by definition and reading.
 */
type Regexes = Map<Domain, Map<Reading, RegExp>>;

/**
 * The host regex of a definition, compiled on the suite's first ask and held for the rest.
 *
 * @param regexes - The suite's compiled regexes.
 * @param domain - The definition.
 * @param reading - How its whitespace is read.
 * @returns The regex.
 */
const cachedRegex = (regexes: Regexes, domain: Domain, reading: Reading): RegExp => {
  const byReading = regexes.get(domain) ?? new Map<Reading, RegExp>();
  const known = byReading.get(reading) ?? regexOf(domain, reading);
  byReading.set(reading, known);
  regexes.set(domain, byReading);

  return known;
};

/**
 * The whitespace class a definition states, as the leaf's `whiteSpace` facet in force gives it; a
 * union has none of its own.
 *
 * @param domain - The definition.
 * @returns Its class.
 */
const classOf = (domain: Domain): "collapse" | "preserve" | "replace" | "union" => {
  const stated = domain.facets.find(({ facet }) => facet === "whiteSpace")?.value;

  return stated === "collapse" || stated === "preserve" || stated === "replace" ? stated : "union";
};

/**
 * XML Schema Part 2, 4.3.6: `preserve` keeps a value, `replace` turns each tab, line feed and
 * carriage return into a space, and `collapse` also makes each run of spaces one and drops a space
 * at either end. Only `#x20` is trimmed, never another Unicode space (`String.prototype.trim` would
 * strip a no-break space too, which XSD keeps).
 *
 * @param raw - The value as written.
 * @param whiteSpace - The class.
 * @returns The normalized value.
 */
const normalized = (raw: string, whiteSpace: string): string => {
  if (whiteSpace === "preserve") {
    return raw;
  }

  const replaced = raw.replaceAll(arkregex("[\t\n\r]", "gu"), " ");

  return whiteSpace === "replace"
    ? replaced
    : replaced.replaceAll(arkregex(" +", "gu"), " ").replaceAll(arkregex("^ | $", "gu"), "");
};

/**
 * Whether XML Schema accepts a raw form under a definition, by the oracle: an atomic or list
 * definition's exact language must hold the form once normalized by the definition's own class,
 * and a union's holds it when one member's does (Part 1, 3.14.4, each member normalizing as it
 * reads).
 *
 * @param regexes - The suite's compiled regexes.
 * @param domain - The definition.
 * @param raw - The form as written.
 * @returns Whether it is valid.
 */
const xsdAccepts = (regexes: Regexes, domain: Domain, raw: string): boolean =>
  domain._tag === "union"
    ? domain.members.some((member) => xsdAccepts(regexes, member, raw))
    : cachedRegex(regexes, domain, "exact").test(normalized(raw, classOf(domain)));

/**
 * Draw one character of a set, near the start of one of its runs, where the boundaries are.
 *
 * @param set - The set.
 * @returns The generator.
 * @throws {Error} When the set holds no character: a chars node of no character is a defect of the
 *   tree, since the compiler writes the empty set as nothing.
 */
const characterOf =
  (set: CodeSet): Gen<string> =>
  (source) => {
    if (!Arr.isReadonlyArrayNonEmpty(set)) {
      throw new Error(
        "A chars node of a domain's tree holds no character, and the compiler writes an empty set as nothing. Correct the tree the word is drawn from.",
      );
    }

    const [lo, hi] = source.draw(element(set));

    return String.fromCodePoint(source.draw(int(lo, Math.min(hi, lo + 40))));
  };

/**
 * Draw a word of a language tree: every set a character of it, every repetition a few times past
 * its least. A tree holds no intersection, which the compiler builds as its product, so every word
 * drawn is in the language.
 *
 * @param tree - The tree.
 * @returns The generator.
 */
const wordOf =
  (tree: Regex): Gen<string> =>
  (source) => {
    switch (tree._tag) {
      case "chars": {
        return source.draw(characterOf(tree.set));
      }
      case "seq": {
        return tree.parts.map((part) => source.draw(wordOf(part))).join("");
      }
      case "alt": {
        const [first, ...rest] = tree.arms;

        return first === undefined
          ? ""
          : source.draw(wordOf(source.draw(element([first, ...rest]))));
      }
      case "repeat": {
        const extra = Option.match(tree.max, {
          onNone: () => 3,
          onSome: (most) => Math.min(3, most - tree.min),
        });
        const times = source.draw(int(tree.min, tree.min + extra));

        return Array.from({ length: times }, () => source.draw(wordOf(tree.body))).join("");
      }
    }
  };

/**
 * A run of one to three XML whitespace characters.
 */
const whitespaceRun: Gen<string> = (source) =>
  Array.from({ length: source.draw(int(1, 3)) }, () =>
    source.draw(element([" ", "\t", "\n", "\r"])),
  ).join("");

/**
 * Characters that are wild at a domain's edges: XML's whitespace, a no-break space, a name
 * character outside the Second Edition's tables, a combining mark, a supplementary character.
 */
const wildCharacters = [
  " ",
  "\t",
  "\n",
  "\r",
  " ",
  "Ⰰ",
  "ஃ",
  "̀",
  "\u{1F600}",
  "-",
  "+",
  ".",
  "0",
] as const;

/**
 * The named variants a raw form is drawn as (doctrine rule 6), each from a word of the language:
 * the word itself; outer whitespace; each space a run; each space a tab, line feed or carriage
 * return; a whitespace character inside; a character doubled; a wild character inside.
 */
const variants = ["as-is", "outer", "runs", "breaks", "inner", "doubled", "wild"] as const;

/**
 * A raw form: a definition of the leaf, the member whose language it is drawn from, and one
 * variant of one of its words.
 */
interface RawCase {
  readonly raw: string;
  readonly variant: (typeof variants)[number];
  readonly where: string;
  readonly domain: Domain;
}

/**
 * Spell a value for a failure's message, every character outside printable ASCII as its code point.
 *
 * @param value - The value.
 * @returns Its spelling.
 */
const spelled = (value: string): string =>
  JSON.stringify(
    Array.from(value, String)
      .map((point) =>
        arkregex("^[\\u0021-\\u007E]$", "u").test(point)
          ? point
          : `\\u{${(point.codePointAt(0) ?? 0).toString(16)}}`,
      )
      .join(""),
  );

/**
 * Insert a string at a drawn place of another.
 *
 * @param word - The word.
 * @param inserted - What goes in.
 * @returns The generator.
 */
const insertedInto =
  (word: string, inserted: string): Gen<string> =>
  (source) => {
    const points = Array.from(word, String);
    const at = source.draw(int(0, points.length));

    return [...points.slice(0, at), inserted, ...points.slice(at)].join("");
  };

/**
 * Draw a raw form of a leaf definition.
 */
const rawCase: Gen<RawCase> = (source) => {
  const { domain, where } = source.draw(element(leafChoices));
  const members = domain._tag === "union" ? domain.members : [domain];
  const [head, ...tail] = members;
  const member = head === undefined ? domain : source.draw(element([head, ...tail]));
  const word = source.draw(wordOf(Result.getOrThrow(languageOf(member))));
  const variant = source.draw(
    weighted([
      [2, () => "as-is" as const],
      [3, () => "outer" as const],
      [3, () => "runs" as const],
      [2, () => "breaks" as const],
      [2, () => "inner" as const],
      [1, () => "doubled" as const],
      [1, () => "wild" as const],
    ]),
  );
  const raw = ((): string => {
    switch (variant) {
      case "as-is": {
        return word;
      }
      case "outer": {
        return `${source.draw(whitespaceRun)}${word}${source.draw(whitespaceRun)}`;
      }
      case "runs": {
        return word.replaceAll(" ", () => source.draw(whitespaceRun));
      }
      case "breaks": {
        return word.replaceAll(" ", () => source.draw(element(["\t", "\n", "\r"])));
      }
      case "inner": {
        return source.draw(insertedInto(word, source.draw(whitespaceRun)));
      }
      case "doubled": {
        const points = Array.from(word, String);
        const at = source.draw(int(0, Math.max(0, points.length - 1)));

        return [...points.slice(0, at + 1), ...points.slice(at)].join("");
      }
      case "wild": {
        return source.draw(insertedInto(word, source.draw(element(wildCharacters))));
      }
    }
  })();

  return { domain, raw, variant, where };
};

/**
 * The features the fold's search steers by: (the definition's class, the verdict), so each class
 * is seen both accepting and refusing.
 */
const foldFeatures = [
  "collapse accepted",
  "collapse refused",
  "replace accepted",
  "replace refused",
  "preserve accepted",
  "preserve refused",
  "union accepted",
  "union refused",
  "synthetic accepted",
  "synthetic refused",
] as const;

/**
 * The empty language's pattern, which `xs:NOTATION`'s definition compiles to, its value space the
 * notations a schema declares and no pinned XSD declaring one (XML Schema Part 2, §3.2.19): what a
 * definition whose lexical space holds no value compiles to.
 */
const emptyPattern = Result.getOrThrow(
  compile(Result.getOrThrow(builtinDomainOf("NOTATION")), "xsd"),
).pattern;

describe("The whitespace fold", () => {
  const regexes: Regexes = new Map();

  it.effect(
    "accepts a raw form exactly when its XSD normalization is in the domain's exact language, over every definition the leaf resolves",
    (ctx) =>
      searched(
        ctx,
        explore(
          {
            caseHang: Duration.minutes(1),
            concurrency: searchWidth,
            coverage: required(foldFeatures, { cases: 600, sense: notesOnly }),
            draw: drawn(rawCase),
            kept: [],
            literal: Formatter.format,
            oracle: {
              kind: "specification",
              name: "XML Schema Part 2 §4.3.6's normalization, then the domain's exact language (xsdAccepts)",
            },
            runs: 1500,
            shrink: completeShrink,
            steerEvery: 32,
            suite: "grammar/domains/fold",
          },
          (drawnCase, c) =>
            Effect.sync(() => {
              const expected = xsdAccepts(regexes, drawnCase.domain, drawnCase.raw);
              const verdict = cachedRegex(regexes, drawnCase.domain, "xsd").test(drawnCase.raw);
              const group = drawnCase.where.startsWith("synthetic")
                ? "synthetic"
                : classOf(drawnCase.domain);
              c.note(verdict ? (`${group} accepted` as const) : (`${group} refused` as const));

              assert.strictEqual(
                verdict,
                expected,
                `${drawnCase.where} (${drawnCase.variant}) ${spelled(drawnCase.raw)}`,
              );
            }),
        ),
      ),
  );
});

/**
 * What one escape of a pattern takes: how many characters past its backslash, and each way it
 * leaves the shared syntax.
 */
interface EscapeReading {
  readonly length: number;
  readonly problems: readonly string[];
}

/**
 * Read one escape of a pattern: `\uXXXX`, a letter escape of a line break or tab, or an escape of
 * a metacharacter of the place it stands in.
 *
 * @param points - The pattern's code points.
 * @param at - Where its backslash stands.
 * @param inClass - Whether it stands inside a bracket expression.
 * @returns How many characters past the backslash it takes, and how it leaves the shared syntax.
 */
const escapeAt = (points: readonly string[], at: number, inClass: boolean): EscapeReading => {
  const next = points[at + 1] ?? "";
  if (next === "u") {
    return {
      length: 5,
      problems: arkregex("^[0-9A-F]{4}$", "u").test(points.slice(at + 2, at + 6).join(""))
        ? []
        : [`a \\u not of four hex digits at ${at}`],
    };
  }

  const meta = inClass ? arkregex("[\\\\\\]^\\-[]", "u") : arkregex("[\\\\^$.|?*+()[\\]{}]", "u");

  return {
    length: 1,
    problems:
      arkregex("[tnr]", "u").test(next) || meta.test(next) ? [] : [`the escape \\${next} at ${at}`],
  };
};

/**
 * Check a pattern against the syntax PostgreSQL's advanced regular expressions and JavaScript's
 * `u`-flag regular expressions share: a bracket expression holds code points, ranges and escapes
 * of a code point; outside one, an escape is of a metacharacter or a code point; a group is
 * `(?:`, never a lookaround, which grizzle's `str.regex` grammar refuses (`scalar/regex/parse.ts`);
 * a quantifier's counts are at most grizzle's `regexMaxRepeat`, PostgreSQL's `RE_DUP_MAX`; and no
 * `.`, no class shorthand, no backreference, no `\x` and no `\u{…}`.
 *
 * @param pattern - The pattern.
 * @returns Each way it leaves the shared syntax.
 */
const outsideSharedSyntax = (pattern: string): readonly string[] => {
  const problems: string[] = [];
  const points = Array.from(pattern, String);
  let inClass = false;
  for (let at = 0; at < points.length; at += 1) {
    const point = points[at] ?? "";
    if (point === "\\") {
      const escape = escapeAt(points, at, inClass);
      for (const each of escape.problems) {
        problems.push(each);
      }
      at += escape.length;
    } else if (inClass) {
      inClass = point !== "]";
    } else if (point === "[") {
      inClass = true;
      if (points[at + 1] === "]") {
        problems.push(`an empty class at ${at}`);
      }
    } else if (point === ".") {
      problems.push(`a . at ${at}`);
    } else if (point === "(" && points[at + 1] === "?") {
      if (points[at + 2] !== ":") {
        problems.push(`a group (?${points[at + 2] ?? ""} at ${at}`);
      }
    } else if (point === "(") {
      problems.push(`a capturing group at ${at}`);
    } else if (point === "{") {
      const close = points.indexOf("}", at);
      const counts = points
        .slice(at + 1, close)
        .join("")
        .split(",")
        .filter((count) => count !== "")
        .map(Number);
      if (counts.some((count) => count > regexMaxRepeat)) {
        problems.push(`a repetition count above ${regexMaxRepeat} at ${at}`);
      }
    }
  }

  return problems;
};

describe("The shared syntax", () => {
  it("writes every domain the leaf resolves, under both readings, in the syntax PostgreSQL and JavaScript share", () => {
    const problems = leafDomains.flatMap(({ domain, where }) =>
      (["xsd", "exact"] as const).flatMap((reading) => {
        const { pattern } = Result.getOrThrow(compile(domain, reading));
        assert.instanceOf(arkregex.as(pattern, patternFlags), RegExp);

        return outsideSharedSyntax(pattern).map((problem) => `${where} (${reading}): ${problem}`);
      }),
    );

    assert.isAbove(leafDomains.length, 150);
    assert.deepStrictEqual(problems, []);
  });
});

/**
 * The length facets an exhaustive case states: each of `length`, `minLength` and `maxLength`
 * absent or a count from 0 to 3, consistent or not.
 */
interface LengthCase {
  readonly lengths: Readonly<Partial<Record<"length" | "maxLength" | "minLength", number>>>;
  readonly variety: "atomic" | "list";
}

/**
 * Whether a count is one every length facet of a case admits, as XML Schema Part 2 reads each facet
 * on its own (4.3.1.3, 4.3.2.3 and 4.3.3.3): the length equals `length`, is at least `minLength`
 * and at most `maxLength`.
 *
 * @param lengths - The case's length facets.
 * @param count - A length, in characters or list items.
 * @returns Whether every facet admits it.
 */
const lengthHolds = (lengths: LengthCase["lengths"], count: number): boolean =>
  (lengths.length === undefined || count === lengths.length) &&
  (lengths.minLength === undefined || count >= lengths.minLength) &&
  (lengths.maxLength === undefined || count <= lengths.maxLength);

describe("Length facets", () => {
  it.effect(
    "admit exactly the values of a length every length facet admits, and none where no length is admitted, never writing a quantifier whose least passes its most: every combination of length, minLength and maxLength, each absent or 0 to 3, on a string and on a list of NMTOKENs, exhausted",
    (ctx) =>
      // Beside the oracle, JavaScript's regular expression compiler refuses a quantifier such as
      // `{3,2}`, as PostgreSQL's does. The cases need not satisfy 4.3.1.4 or 4.3.2.4: the deriver
      // refuses those, and the compiler must read the facets it is given as the language they
      // state, an empty one included.
      searched(
        ctx,
        exhaust(
          {
            box: "every combination of length, minLength and maxLength, each absent or 0 to 3, on a string and on a list of NMTOKENs: 250 cases, each judged on every length 0 to 4",
            caseHang: Duration.minutes(1),
            concurrency: searchWidth,
            coverage: requiredInSpace<"admitted" | "crossed" | "list" | "length outside">([
              "admitted",
              "crossed",
              "length outside",
              "list",
            ]),
            generator: (source): LengthCase => {
              const variety = source.draw(element(["atomic", "list"] as const));
              const lengths: Partial<Record<"length" | "maxLength" | "minLength", number>> = {};
              for (const name of ["length", "minLength", "maxLength"] as const) {
                const count = source.draw(int(0, 4));
                if (count > 0) {
                  lengths[name] = count - 1;
                }
              }

              return { lengths, variety };
            },
            literal: Formatter.format,
            oracle: {
              kind: "specification",
              name: "XML Schema Part 2 4.3.1.3 to 4.3.3.3, each length facet a condition on a value's length (lengthHolds)",
            },
            suite: "grammar/domains/lengths",
          },
          ({ lengths, variety }, c) =>
            Effect.sync(() => {
              const facets = (["length", "minLength", "maxLength"] as const).flatMap(
                (name): readonly Facet[] => {
                  const held = lengths[name];

                  return held === undefined ? [] : [{ facet: name, value: String(held) }];
                },
              );
              const domain: Domain =
                variety === "atomic"
                  ? {
                      _tag: "atomic",
                      builtin: "string",
                      facets: [{ facet: "whiteSpace", value: "preserve" }, ...facets],
                      patterns: [],
                      primitive: "string",
                    }
                  : {
                      _tag: "list",
                      facets: [{ facet: "whiteSpace", value: "collapse" }, ...facets],
                      item: Result.getOrThrow(builtinDomainOf("NMTOKEN")),
                      patterns: [],
                    };
              const counts = [0, 1, 2, 3, 4];
              const admitted = counts.filter((count) => lengthHolds(lengths, count));
              if (variety === "list") {
                c.note("list");
              }

              if (
                lengths.minLength !== undefined &&
                lengths.maxLength !== undefined &&
                lengths.minLength > lengths.maxLength
              ) {
                c.note("crossed");
              }

              const { length: exact, ...bounds } = lengths;
              if (exact !== undefined && !lengthHolds(bounds, exact)) {
                c.note("length outside");
              }

              const { pattern } = Result.getOrThrow(compile(domain, "exact"));
              if (admitted.length === 0) {
                assert.strictEqual(
                  pattern,
                  emptyPattern,
                  `${Formatter.format(lengths)} admits no length, and compiles to the empty language`,
                );

                return;
              }

              c.note("admitted");

              const regex = arkregex.as(pattern, patternFlags);

              for (const count of counts) {
                const value =
                  variety === "atomic"
                    ? "a".repeat(count)
                    : Array.from({ length: count }, () => "a").join(" ");
                assert.strictEqual(
                  regex.test(value),
                  lengthHolds(lengths, count),
                  `${Formatter.format(lengths)} on ${JSON.stringify(value)}`,
                );
              }
            }),
        ),
      ),
  );
});

/**
 * The text a module that reads `xs:boolean`'s truth itself would spell: an alternation of the true
 * literals, an array of them, or a comparison with `"true"`. `grammar/domains.ts` states the one
 * reading, and a test may state the specification's as its oracle; no other module spells one.
 */
const booleanSpellings = [
  arkregex("\\(\\?:true\\|1\\)", "u"),
  arkregex('\\["true", "1"\\]', "u"),
  arkregex('[=]== "true"|"true" ===', "u"),
] as const;

describe("xs:boolean", () => {
  it("is read in grammar/domains.ts alone: no other module spells a truth of its own", () => {
    /**
     * Oracle: the source text, against the spellings a reading of xs:boolean's truth takes, each
     * one shown matching the reading it stands for. Bound: every module under src but the tests.
     */
    const witnesses = [
      String.raw`const trueForm = /^[\t\n\r ]*(?:true|1)[\t\n\r ]*$/u;`,
      `export const booleanTrue = ["true", "1"] as const;`,
      `(form) => form === "true" || form === "1",`,
      `return mixed.value === "true";`,
    ];
    assert.deepStrictEqual(
      witnesses.filter((witness) => !booleanSpellings.some((spelling) => spelling.test(witness))),
      [],
      "each spelling a copy took is one the census finds",
    );

    const sourceRoot = path.resolve(import.meta.dirname, "..");
    const readers = globSync("**/*.ts", { cwd: sourceRoot })
      .filter((file) => !file.endsWith(".test.ts") && file !== "grammar/domains.ts")
      .filter((file) => {
        const text = readFileSync(path.join(sourceRoot, file), "utf-8");

        return booleanSpellings.some((spelling) => spelling.test(text));
      })
      .toSorted();

    assert.deepStrictEqual(readers, []);
  });
});
