/**
 * The attribute grammar's laws, each against an oracle that is not the generator:
 *
 * - **The XSD's attribute uses.** An independent reading of the pinned XSDs (`loadXsd` and
 *   `xsdContents` of `src/test/gen/grammar.ts`, written from XML Schema Part 1 apart from the
 *   vocabulary deriver) gives each kind its declared names and uses; `AttributeGrammar` must admit
 *   exactly those, with the XSD's use, beside the document layer's names.
 * - **The spec readings' text.** Each reading of `docs/spec-readings.md` that narrows a value is
 *   checked on every attribute it names, and the XSD's own reading of the same type is checked
 *   everywhere else; readings `aria-keyshorts`, `schematron-intent`, `inclusion-cycles` and
 *   `bdo-dir`, which add, take away and require an attribute, are restated beside the XSD reading,
 *   and reading `extension-attribute-lists` beside the document layer's `xml:` names, its covered
 *   elements from the Schematron's leaf, which its own test reads against the XSDs' raw text.
 *   Reading `schematron-intent`'s two ARIA role rules are read from the XSDs' raw text too, reading
 *   `mime-type`'s MIME types against an RFC 2045 reader by exhaustion and by a swarm-weighted
 *   search, and reading `default-shape-coords`'s `coords`, which follows the XSD, against a reader
 *   of `CoordsDType`.
 * - **The XSD's values, for the departures of the old grammar.** Each value the XSD admits and the
 *   old grammar refused is admitted, read from the leaf's own resolution of the XSD.
 * - **Structural laws:** positions a bijection onto 0..n−1 in `AttributeName` order; `TextDomain` a
 *   row for every text type; `ValueIdentity` derived from the built-in alone; the generator's
 *   refusals as named invalid inputs.
 */
import { regex } from "arkregex";
import type { TestContext } from "vitest";
import * as NodeServices from "@effect/platform-node/NodeServices";
import { assert, beforeAll, describe, it } from "@effect/vitest";
import { nonEmpty } from "@bjornpagen/testing/assert";
import { drawn, exhaust, explore } from "@bjornpagen/testing/explore";
import { required, requiredInSpace } from "@bjornpagen/testing/features";
import { array, element, int, map, weighted } from "@bjornpagen/testing/gen";
import type { Gen } from "@bjornpagen/testing/gen";
import { notesOnly } from "@bjornpagen/testing/sense";
import { completeShrink } from "@bjornpagen/testing/shrink";
import { swarm, swarmChoice } from "@bjornpagen/testing/swarm";
import type { Swarm } from "@bjornpagen/testing/swarm";
import { searched } from "@bjornpagen/testing/vitest";
import { agree, exact, set as setOf, structuralHash } from "@bjornpagen/testing/oracle";
import { Array as Arr, Duration, Effect, FileSystem, Formatter, Option, Result } from "effect";
import { codePointOrder } from "@qti-pie/crust/charset.ts";
import { XML_NAMESPACE } from "@qti-pie/crust/tree.ts";
import {
  attributeCounts,
  baseTypes,
  generate,
  readDeclarations,
  readingUses,
  specReadings,
} from "#pantry/grammar/attributes.ts";
import type { AttributeGrammar, Declared, ValueDomain } from "#pantry/grammar/attributes.ts";
import { roster } from "#pantry/grammar/closed.ts";
import { declaredRelation, rowFaultOf } from "#pantry/test/declared.ts";
import { boxHolds } from "#pantry/test/box.ts";
import { searchWidth } from "#pantry/test/settings.ts";
import type { Roster } from "#pantry/grammar/closed.ts";
import { composed, processCompiler } from "#pantry/grammar/compose.ts";
import { patternFlags } from "#pantry/grammar/domains.ts";
import { openClasses } from "#pantry/grammar/kinds.ts";
import { loadXsd, XsdOracleLayer, xsdContents } from "#pantry/test/gen/grammar.ts";
import { xsdDirectory } from "#pantry/vocab/derive/sources.ts";
import type { SourcePath } from "#pantry/vocab/derive/sources.ts";
import { xsdCachePresent } from "#pantry/test/xsd-catalog.ts";
import {
  attributeDeclarations,
  attributeWildcards,
  globalAttributes,
  textTypes,
} from "#pantry/vocab/inventory/attributes.ts";
import { coveredElements } from "#pantry/vocab/inventory/extensions.ts";
import type { Domain } from "#pantry/vocab/inventory/types.ts";

/**
 * The leaf's rosters: every kind that declares an attribute or has text, and every attribute name.
 */
const rosters = {
  kinds: roster("NodeKind", [
    ...new Set([
      ...attributeDeclarations.map(({ kind }) => kind),
      ...textTypes.map(({ kind }) => kind),
    ]),
  ]),
  names: roster("AttributeName", [...new Set(attributeDeclarations.map(({ name }) => name))]),
} as const;

/**
 * The inputs of a grammar no `xsi:type` governs: no governor, and an empty `TypeName` roster.
 */
const ungoverned = {
  governed: [],
  governors: [],
  typeName: roster("TypeName", []),
  typeTexts: [],
} as const;

/**
 * The attribute grammar of the whole leaf, no document layer: every declaration the pinned XSDs
 * state, and every text type.
 */
const leafGrammar: AttributeGrammar = Result.getOrThrow(
  generate(
    { declarations: attributeDeclarations, texts: textTypes, ...rosters, ...ungoverned },
    processCompiler,
  ),
);

/**
 * The domain of an attribute row, by its handle.
 */
const domainsByHandle: ReadonlyMap<string, ValueDomain> = new Map(
  leafGrammar.domains.map((domain) => [domain.handle, domain]),
);

/**
 * The domain a kind's attribute is read under.
 *
 * @param kind - The kind.
 * @param name - The attribute.
 * @returns The domain, none where the kind does not admit the name.
 */
const domainAt = (kind: string, name: string): Option.Option<ValueDomain> =>
  Option.flatMap(leafGrammar.admission.lookup({ kind, name }), ({ domain }) =>
    Option.fromNullishOr(domainsByHandle.get(domain)),
  );

/**
 * Whether a domain's pattern matches a raw lexical form, as the attribute CHECK reads it.
 *
 * @param domain - The domain.
 * @param raw - The form as written.
 * @returns Whether it matches.
 */
const matches = (domain: ValueDomain, raw: string): boolean =>
  regex.as(domain.pattern, patternFlags).test(raw);

/**
 * Every kind that declares a name, each once.
 *
 * @param name - The attribute.
 * @returns The kinds.
 */
const declarersOf = (name: string): readonly { readonly kind: string }[] =>
  attributeDeclarations.filter((declared) => declared.name === name).map(({ kind }) => ({ kind }));

/**
 * The enumeration values a definition states.
 *
 * @param domain - The definition.
 * @returns Its values.
 */
const enumerationOf = (domain: Domain): readonly string[] =>
  domain.facets.flatMap(({ facet, value }) => (facet === "enumeration" ? [value] : []));

/**
 * Draw a form of a lexical box: every string of up to `most` of `pieces`, run together.
 *
 * @param pieces - What a form is written with.
 * @param most - The most pieces a form holds.
 * @returns The box's generator.
 */
const formsOf = (pieces: Arr.NonEmptyReadonlyArray<string>, most: number): Gen<string> =>
  map(array(element(pieces), { max: most, min: 0 }), (written) => written.join(""));

/**
 * How many forms {@link formsOf} draws from `pieces` pieces: every count of them from none to
 * `most`, each piece any of them.
 *
 * @param pieces - How many pieces there are.
 * @param most - The most pieces a form holds.
 * @returns The count.
 */
const formCount = (pieces: number, most: number): number =>
  Array.from({ length: most + 1 }, (_, length) => pieces ** length).reduce(
    (sum, each) => sum + each,
    0,
  );

/**
 * An attribute a lexical box reads: a kind's name, under the domain the leaf grammar admits it in.
 */
interface Target {
  readonly kind: string;
  readonly name: string;
}

/**
 * Every kind of the leaf that declares a name, as the box's targets.
 *
 * @param name - The attribute.
 * @returns Its declarers' targets; fails the test where none declares it.
 */
const targetsOf = (name: string): Arr.NonEmptyReadonlyArray<Target> =>
  nonEmpty(
    declarersOf(name).map(({ kind }) => ({ kind, name })),
    `the kinds that declare ${name}`,
  );

/**
 * What a form of a lexical box reaches: the oracle admits it, or refuses it.
 */
type Verdict = "accepted" | "refused";

/**
 * A lexical box: every target with every form, each read under the target's domain and held to an
 * oracle that reads the specification, not the pattern.
 */
interface LexicalBox {
  readonly accepts: (target: Target, form: string) => boolean;
  readonly box: string;
  readonly forms: Gen<string>;
  readonly formsPerTarget: number;
  readonly oracle: string;
  readonly reaches: Arr.NonEmptyReadonlyArray<Verdict>;
  readonly suite: string;
  readonly targets: Arr.NonEmptyReadonlyArray<Target>;
}

/**
 * Exhaust a lexical box: hold its size to its targets times its forms, then read every form under
 * every target's domain as `matches` does, against the box's oracle.
 *
 * @param ctx - The test's context.
 * @param lexical - The box.
 * @returns The search; fails at the first form the domain and the oracle judge apart.
 */
const exhaustLexical = (ctx: TestContext, lexical: LexicalBox) => {
  const generator: Gen<{ readonly form: string; readonly target: Target }> = (source) => ({
    target: source.draw(element(lexical.targets)),
    form: source.draw(lexical.forms),
  });

  return Effect.andThen(
    boxHolds(generator, lexical.targets.length * lexical.formsPerTarget),
    searched(
      ctx,
      exhaust(
        {
          box: lexical.box,
          caseHang: Duration.seconds(30),
          concurrency: searchWidth,
          coverage: requiredInSpace<Verdict>(lexical.reaches),
          generator,
          literal: Formatter.format,
          oracle: { kind: "specification", name: lexical.oracle },
          suite: lexical.suite,
        },
        ({ form, target }, c) =>
          Effect.sync(() => {
            const expected = lexical.accepts(target, form);
            c.note(expected ? "accepted" : "refused");

            assert.strictEqual(
              matches(Option.getOrThrow(domainAt(target.kind, target.name)), form),
              expected,
              `${target.kind}@${target.name} on ${JSON.stringify(form)}`,
            );
          }),
      ),
    ),
  );
};

/**
 * XML Schema 1.0's `xs:double` lexical space (Part 2 §3.2.5.1), as printed: a decimal mantissa
 * and an optional exponent, `INF`, `-INF` and `NaN`, and no `+INF`, which 1.0 does not write
 * (reading `anyuri-lexical`'s edition).
 */
const xsDouble = regex(
  "^(?:[+-]?(?:[0-9]+(?:\\.[0-9]*)?|\\.[0-9]+)(?:[Ee][+-]?[0-9]+)?|-?INF|NaN)$",
  "u",
);

/**
 * The pieces a double's box writes its forms with: digits, a decimal point, an exponent, both
 * signs, the three names and two whitespace characters `collapse` reads.
 */
const doublePieces = ["0", "2.5", ".", "e3", "-", "+", "INF", "NaN", " ", "\t"] as const;

describe("The departures from the XSD", () => {
  it.effect(
    `are gone: a slider's step is NonNegativeDoubleDType, its lexical space XML Schema 1.0's xs:double less NaN, collapsed, on every form of up to 3 of ${String(doublePieces.length)} pieces, and zero its bound`,
    (ctx) =>
      Effect.andThen(
        exhaustLexical(ctx, {
          accepts: (_, form) => {
            const collapsed = collapseXml(form);

            return xsDouble.test(collapsed) && collapsed !== "NaN";
          },
          box: "every form of up to 3 of 0, 2.5, the point, e3, both signs, INF, NaN, the space and the tab, on the slider's step",
          forms: formsOf(doublePieces, 3),
          formsPerTarget: formCount(doublePieces.length, 3),
          oracle:
            "XML Schema Part 2 §4.3.6's collapse, then 1.0's xs:double lexical space (§3.2.5.1) less NaN, which meets no bound and so is no value of the bounded type (the spec reading on NonNegativeDouble); the bound judges the value apart",
          reaches: ["accepted", "refused"],
          suite: "grammar/attributes/slider-step",
          targets: [{ kind: "qti-slider-interaction", name: "step" }],
        }),
        Effect.sync(() => {
          assert.deepStrictEqual(
            Option.getOrThrow(domainAt("qti-slider-interaction", "step")).bound,
            Option.some({ facet: "minInclusive", value: 0 }),
          );
        }),
      ),
  );

  it("are gone: a cell's headers are a plain list of identifiers in the attribute grammar, with no IDREF identity, since reading `cell-headers`'s same-table rule is an overlay's law", () => {
    for (const { kind, name } of targetsOf("headers")) {
      const headers = Option.getOrThrow(domainAt(kind, name));

      assert.isTrue(
        matches(headers, "a b  c"),
        `${kind}'s headers are a list of identifiers: reading \`cell-headers\`'s rule, each token unique and the id of a th of the cell's own table, is src/qti/overlay-queries/html.ts's (HeaderToken's key and CellToken's containment in TableHeader, over the tokens HeaderToken splits from the lexical form), and the grammar reads no reference on them`,
      );
      assert.deepStrictEqual(headers.identity, Option.none());
    }
  });

  it("are gone: param@valuetype is required, and xml:base is admitted on every content-packaging kind that declares it", () => {
    assert.strictEqual(
      Option.getOrThrow(leafGrammar.admission.lookup({ kind: "param", name: "valuetype" })).use,
      "required",
    );
    for (const { kind, name } of targetsOf("xml:base").filter((target) =>
      target.kind.startsWith("cp:"),
    )) {
      const base = Option.getOrThrow(domainAt(kind, name));

      assert.isTrue(matches(base, " ../items/ "), kind);
    }
  });
});

/**
 * RFC 5646's 26 grandfathered tags (§2.1, the `irregular` and `regular` productions), as the RFC
 * writes them.
 */
const grandfathered = [
  "en-GB-oed",
  "i-ami",
  "i-bnn",
  "i-default",
  "i-enochian",
  "i-hak",
  "i-klingon",
  "i-lux",
  "i-mingo",
  "i-navajo",
  "i-pwn",
  "i-tao",
  "i-tay",
  "i-tsu",
  "sgn-BE-FR",
  "sgn-BE-NL",
  "sgn-CH-DE",
  "art-lojban",
  "cel-gaulish",
  "no-bok",
  "no-nyn",
  "zh-guoyu",
  "zh-hakka",
  "zh-min",
  "zh-min-nan",
  "zh-xiang",
] as const;

/**
 * One subtag of each class RFC 5646's productions tell apart: singletons, `x` in both cases, two
 * and three letters, three digits, four letters, a digit and three alphanumerics, five to eight
 * alphanumerics, nine letters, and alphanumerics no production takes.
 */
const subtagSamples = [
  "a",
  "x",
  "X",
  "i",
  "1",
  "en",
  "EN",
  "12",
  "a1",
  "eng",
  "123",
  "419",
  "Latn",
  "1abc",
  "abc1",
  "US",
  "variant",
  "abcdefgh",
  "abcdefghi",
  "1996",
  "ab",
  "sgn",
] as const;

/**
 * Whether a value is a well-formed BCP 47 language tag, RFC 5646's `Language-Tag` (§2.1, Figure
 * 1), read subtag by subtag: a grandfathered tag in any case; or `x` and private-use subtags; or a
 * language of two to eight letters, up to three three-letter extlangs after one of two or three, a
 * script, a region, variants, extensions each a singleton other than `x` with subtags of two to
 * eight, and a private-use tail. Each production is told apart by its subtags' lengths and
 * classes, so the first that fits is the one, and no step looks back.
 *
 * @param value - The value.
 * @returns Whether it is well-formed.
 */
const isLanguageTag = (value: string): boolean => {
  if (grandfathered.some((tag) => tag.toLowerCase() === value.toLowerCase())) {
    return true;
  }

  const subtags = value.split("-");
  const at = (index: number): string => subtags[index] ?? "";
  if (!subtags.every((subtag) => regex("^[A-Za-z0-9]{1,8}$", "u").test(subtag))) {
    return false;
  }

  if (regex("^[Xx]$", "u").test(at(0))) {
    return subtags.length > 1;
  }

  if (!regex("^[A-Za-z]{2,8}$", "u").test(at(0))) {
    return false;
  }

  let next = 1;
  const take = (production: RegExp): boolean => {
    const taken = next < subtags.length && production.test(at(next));
    next += taken ? 1 : 0;

    return taken;
  };
  const takeAll = (production: RegExp): number => {
    let count = 0;
    while (take(production)) {
      count += 1;
    }

    return count;
  };
  for (let extlangs = 0; at(0).length <= 3 && extlangs < 3 && take(regex("^[A-Za-z]{3}$", "u"));) {
    extlangs += 1;
  }

  take(regex("^[A-Za-z]{4}$", "u"));
  take(regex("^(?:[A-Za-z]{2}|[0-9]{3})$", "u"));
  takeAll(regex("^(?:[A-Za-z0-9]{5,8}|[0-9][A-Za-z0-9]{3})$", "u"));
  while (take(regex("^[0-9A-WY-Za-wy-z]$", "u"))) {
    if (takeAll(regex("^[A-Za-z0-9]{2,8}$", "u")) === 0) {
      return false;
    }
  }

  if (take(regex("^[Xx]$", "u"))) {
    return next < subtags.length;
  }

  return next === subtags.length;
};

/**
 * The conversion specifiers a value writes, read left to right as C reads a format string (C11
 * §7.21.6.1): a character that is not `%` is text, `%%` writes a `%` and converts nothing, and
 * every other `%` begins a specifier of flags, a width and an optional precision of `.` and
 * digits, well-formed where one of the information model's codes ends it (§2.3.4). A malformed
 * specifier ends where its code would stand, and the walk reads on from there.
 *
 * @param value - The value.
 * @returns Whether each specifier is well-formed, in the order written.
 */
const printfSpecifiers = (value: string): readonly boolean[] => {
  const points = Array.from(value, String);
  const specifiers: boolean[] = [];
  let next = 0;
  const takeWhile = (characters: string): void => {
    while (next < points.length && characters.includes(points[next] ?? "")) {
      next += 1;
    }
  };
  while (next < points.length) {
    if (points[next] === "%" && points[next + 1] === "%") {
      next += 2;
    } else if (points[next] === "%") {
      next += 1;
      takeWhile("#0 +-");
      takeWhile("0123456789");
      if (points[next] === ".") {
        next += 1;
        takeWhile("0123456789");
      }

      const code = points[next];
      const wellFormed = code !== undefined && "EefGgrRiodXx".includes(code);
      specifiers.push(wellFormed);
      next += wellFormed ? 1 : 0;
    } else {
      next += 1;
    }
  }

  return specifiers;
};

/**
 * Whether a value is a printf format string over the information model's conversion codes (§2.3.4):
 * every specifier it writes is well-formed ({@link printfSpecifiers}), however many it writes, none
 * included (spec reading `format-conversion-count` sets aside reading `printed-variable-format`'s
 * one).
 *
 * @param value - The value.
 * @returns Whether it is a format.
 */
const isPrintfFormat = (value: string): boolean => printfSpecifiers(value).every(Boolean);

/**
 * What a generated format is, for the search's coverage: how many specifiers it writes, none, one,
 * two or several, and whether one of them is malformed. A format of none has no specifier to
 * break, so the search must reach the six others, each count well-formed and malformed.
 *
 * Reading `format-conversion-count` (PR #46, comment 6701102861): a format with two or more
 * conversions is accepted and stored as written; reading `printed-variable-format`'s codes still
 * judge each one. So a domain that refuses a second conversion, or admits a malformed one beside a
 * well-formed one, fails the search.
 */
const printfNotes = [
  "none",
  "one",
  "one malformed",
  "two",
  "two malformed",
  "several",
  "several malformed",
] as const;

/**
 * A {@link printfNotes} note.
 */
type PrintfNote = (typeof printfNotes)[number];

/**
 * Note a format for the search ({@link printfNotes}).
 *
 * @param value - The value.
 * @returns Its note.
 */
const printfNote = (value: string): PrintfNote => {
  const specifiers = printfSpecifiers(value);
  const malformed = specifiers.includes(false);
  if (specifiers.length === 0) {
    return "none";
  }

  if (specifiers.length === 1) {
    return malformed ? "one malformed" : "one";
  }

  if (specifiers.length === 2) {
    return malformed ? "two malformed" : "two";
  }

  return malformed ? "several malformed" : "several";
};

/**
 * The pieces a generated format is drawn from, each a swarm feature: text with no `%`, the escape
 * `%%`, a well-formed specifier's code, a code the information model does not list, and a `%`
 * alone. A specifier's flags, width and precision are drawn apart ({@link printfMiddle}). A piece's
 * class says how it was drawn, never what the format is: pieces run together, so `%` and `5i` read
 * as one specifier, and the note reads the format as written.
 */
const printfClasses = {
  bare: ["%"],
  code: ["E", "e", "f", "G", "g", "r", "R", "i", "o", "X", "x"],
  escape: ["%%"],
  text: ["a", "Score: ", " of ", "5", ".", "-", "é", "\u{1F600}", "\u00A0"],
  unlisted: ["d", "u", "s", "c", "q", "%", ""],
} as const;

/**
 * A {@link printfClasses} feature.
 */
type PrintfClass = keyof typeof printfClasses;

/**
 * The features in the order a swarm draws them, text first, the floor.
 */
const printfClassNames = [
  "text",
  "escape",
  "code",
  "unlisted",
  "bare",
] as const satisfies readonly PrintfClass[];

/**
 * Draw a specifier's middle: up to three flags, a width of up to two digits, and, half the time, a
 * precision of `.` and up to two digits.
 */
const printfMiddle: Gen<string> = (source) => {
  const flags = source.draw(array(element(["#", "0", " ", "+", "-"] as const), { max: 3, min: 0 }));
  const width = source.draw(array(element(["0", "1", "5", "9"] as const), { max: 2, min: 0 }));
  const precision = source.draw(element([false, true] as const))
    ? `.${source.draw(array(element(["0", "2", "7"] as const), { max: 2, min: 0 })).join("")}`
    : "";

  return `${flags.join("")}${width.join("")}${precision}`;
};

/**
 * Draw one piece of a format under a swarm: for a code or an unlisted one, a specifier of `%`, its
 * middle ({@link printfMiddle}) and the code; for any other class, the class's text.
 *
 * @param mix - The case's swarm.
 * @returns The generator.
 */
const printfPieceOf =
  (mix: Swarm<PrintfClass>): Gen<string> =>
  (source) => {
    const drawnClass = source.draw(swarmChoice(mix, printfClassNames));
    const piece = source.draw(element(printfClasses[drawnClass]));

    return drawnClass === "code" || drawnClass === "unlisted"
      ? `%${source.draw(printfMiddle)}${piece}`
      : piece;
  };

/**
 * Draw a format under one swarm: up to eight pieces run together.
 */
const printfCase: Gen<string> = (source) => {
  const mix = source.draw(swarm(printfClassNames));

  return source.draw(array(printfPieceOf(mix), { max: 8, min: 0 })).join("");
};

/**
 * RFC 2045's tspecials (§5.1), as the RFC lists them.
 */
const tspecials = '()<>@,;:\\"/[]?=';

/**
 * The rules {@link mediaTypeFault} tells apart, `valid` first.
 */
const mediaTypeFaults = [
  "valid",
  "space",
  "control",
  "delete",
  "non-ascii",
  "tspecial",
  "no-slash",
  "two-slashes",
  "empty-type",
  "empty-subtype",
] as const;

/**
 * A rule of RFC 2045's media type a value breaks, or `valid`.
 */
type MediaTypeFault = (typeof mediaTypeFaults)[number];

/**
 * The rule of RFC 2045's media type one code point breaks, wherever it stands: a space, a control
 * (`U+0000` to `U+001F`, which XML admits as text only for tab, line feed and carriage return, and
 * `U+007F`, which it admits, told apart as `delete`), a character outside US-ASCII, or a tspecial
 * but the slash; none for a token's character or the slash.
 *
 * @param point - The code point.
 * @returns The rule, if it breaks one.
 */
const pointFault = (point: string): MediaTypeFault | undefined => {
  const code = point.codePointAt(0) ?? 0;
  if (code === 0x20) {
    return "space";
  }

  if (code < 0x20) {
    return "control";
  }

  if (code === 0x7f) {
    return "delete";
  }

  if (code > 0x7f) {
    return "non-ascii";
  }

  return tspecials.includes(point) && point !== "/" ? "tspecial" : undefined;
};

/**
 * The first rule of RFC 2045's media type that a value breaks, read code point by code point, or
 * `valid`: `type "/" subtype`, each a token, "1*<any (US-ASCII) CHAR except SPACE, CTLs, or
 * tspecials>" (§5.1). The value is read as `MimeTypeDType`'s `replace` leaves it, a tab or a line
 * break a space.
 *
 * @param raw - The value as written.
 * @returns The rule it breaks first: a character's ({@link pointFault}), then the slash's.
 */
const mediaTypeFault = (raw: string): MediaTypeFault => {
  const points = Array.from(raw.replaceAll(regex("[\t\n\r]", "gu"), " "), String);
  const slash = points.indexOf("/");
  const first = points.map(pointFault).find((fault) => fault !== undefined);
  if (first !== undefined) {
    return first;
  }

  if (slash === -1) {
    return "no-slash";
  }

  if (points.includes("/", slash + 1)) {
    return "two-slashes";
  }

  if (slash === 0) {
    return "empty-type";
  }

  return slash === points.length - 1 ? "empty-subtype" : "valid";
};

/**
 * Collapse a value's whitespace as XML Schema's `collapse` does (Part 2, §4.3.6): each run of tab,
 * line feed, carriage return and space one space, and none at either end. JavaScript's `trim`
 * strips every Unicode space, `U+00A0` among them, which no XML whitespace class touches.
 *
 * @param raw - The value as written.
 * @returns It collapsed.
 */
const collapseXml = (raw: string): string =>
  raw
    .replaceAll(regex("[\t\n\r ]+", "gu"), " ")
    .replace(regex("^ ", "u"), "")
    .replace(regex(" $", "u"), "");

/**
 * Every rule of RFC 2045's media type a value breaks, where {@link mediaTypeFault} names the first:
 * each character's ({@link pointFault}), and the slash's, none for a media type.
 *
 * @param raw - The value as written.
 * @returns The rules, none for a media type.
 */
const mediaTypeFaultsOf = (raw: string): ReadonlySet<MediaTypeFault> => {
  const points = Array.from(raw.replaceAll(regex("[\t\n\r]", "gu"), " "), String);
  const slashes = points.flatMap((point, at) => (point === "/" ? [at] : []));
  const [slash] = slashes;

  return new Set([
    ...points.flatMap((point) => Option.toArray(Option.fromNullishOr(pointFault(point)))),
    ...(slash === undefined ? ["no-slash" as const] : []),
    ...(slashes.length > 1 ? ["two-slashes" as const] : []),
    ...(slashes.length === 1 && slash === 0 ? ["empty-type" as const] : []),
    ...(slashes.length === 1 && slash === points.length - 1 ? ["empty-subtype" as const] : []),
  ]);
};

/**
 * What a generated value is, for the search's coverage: `valid`, the one rule it breaks alone, or
 * `mixed` for more than one, so the search must reach each rule broken by itself, the value nearest
 * a media type that breaks it.
 */
const mediaTypeNotes = [...mediaTypeFaults, "mixed"] as const;

/**
 * A {@link mediaTypeNotes} note.
 */
type MediaTypeNote = (typeof mediaTypeNotes)[number];

/**
 * Note a value for the search ({@link mediaTypeNotes}).
 *
 * @param raw - The value as written.
 * @returns Its note.
 */
const mediaTypeNote = (raw: string): MediaTypeNote => {
  const faults = [...mediaTypeFaultsOf(raw)];
  const [only] = faults;
  if (only === undefined) {
    return "valid";
  }

  return faults.length === 1 ? only : "mixed";
};

/**
 * What a generated list of media types is, for the search's coverage: `list-valid`, `list-empty`
 * for no item, the one rule its items break alone, or `list-mixed`. A space never breaks an item,
 * since spaces part the items.
 */
const mediaTypeListNotes = [
  "list-valid",
  "list-empty",
  "list-control",
  "list-delete",
  "list-non-ascii",
  "list-tspecial",
  "list-no-slash",
  "list-two-slashes",
  "list-empty-type",
  "list-empty-subtype",
  "list-mixed",
] as const;

/**
 * A {@link mediaTypeListNotes} note.
 */
type MediaTypeListNote = (typeof mediaTypeListNotes)[number];

/**
 * Note a list of media types for the search, as `MimeTypeListDType`'s list reads it: its
 * whitespace collapsed, then every rule its items break ({@link mediaTypeFaultsOf}).
 *
 * @param raw - The value as written.
 * @returns Its note.
 */
const mediaTypeListNote = (raw: string): MediaTypeListNote => {
  const collapsed = collapseXml(raw);
  const faults = [...new Set(collapsed.split(" ").flatMap((item) => [...mediaTypeFaultsOf(item)]))];
  const [only] = faults;
  if (collapsed === "") {
    return "list-empty";
  }

  if (only === undefined || only === "valid" || only === "space") {
    return faults.length <= 1 ? "list-valid" : "list-mixed";
  }

  return faults.length === 1 ? `list-${only}` : "list-mixed";
};

/**
 * Whether a value is a list of RFC 2045 media types: no item, or items each a media type, as
 * {@link mediaTypeFault} reads each item.
 *
 * @param raw - The value as written.
 * @returns Whether it is.
 */
const isMediaTypeList = (raw: string): boolean => {
  const collapsed = collapseXml(raw);

  return collapsed === "" || collapsed.split(" ").every((item) => mediaTypeFault(item) === "valid");
};

/**
 * The symbols the media type's small scope is drawn from: letters of both cases, a digit, token
 * punctuation (`+`, `*`, `{`, `~`), the slash, a space, a tab, tspecials (`(`, `;`, `=`, `"`, `\`),
 * `U+007F` and a letter outside US-ASCII.
 */
const mediaTypeSymbols = [
  "a",
  "Z",
  "0",
  "+",
  "*",
  "{",
  "~",
  "/",
  " ",
  "\t",
  "(",
  ";",
  "=",
  '"',
  "\\",
  "\u007F",
  "é",
] as const;

/**
 * Every string of at most four {@link mediaTypeSymbols}, 88,741 of them.
 */
const mediaTypeScope: readonly string[] = (() => {
  const strings = [""];
  let level: readonly string[] = [""];
  for (let length = 1; length <= 4; length += 1) {
    level = level.flatMap((head) => mediaTypeSymbols.map((symbol) => `${head}${symbol}`));
    for (const each of level) {
      strings.push(each);
    }
  }

  return strings;
})();

/**
 * The classes of character a generated MIME value is drawn from, each a swarm feature: token
 * characters, upper-case letters, the space, the tab, a line break, the tspecials but the slash,
 * the C0 controls a JavaScript string holds and XML does not, `U+007F`, the control XML admits,
 * and characters outside US-ASCII. The slash
 * that joins type and subtype is drawn apart, by the value's shape.
 */
const mediaTypeClasses = {
  control: ["\u001F", "\u0000", "\u0001"],
  delete: ["\u007F"],
  lineBreak: ["\n", "\r"],
  nonAscii: ["é", "\u00A0", "\u{1F600}", "ﬁ", "\u0430"],
  space: [" "],
  tab: ["\t"],
  token: [
    "a",
    "z",
    "0",
    "9",
    "-",
    "+",
    ".",
    "!",
    "#",
    "$",
    "%",
    "&",
    "'",
    "*",
    "^",
    "_",
    "`",
    "{",
    "|",
    "}",
    "~",
  ],
  tspecial: ["(", ")", "<", ">", "@", ",", ";", ":", "\\", '"', "[", "]", "?", "="],
  upper: ["A", "Z", "X"],
} as const;

/**
 * A {@link mediaTypeClasses} feature.
 */
type MediaTypeClass = keyof typeof mediaTypeClasses;

/**
 * The features in the order a swarm draws them, a token's characters first, the floor.
 */
const mediaTypeClassNames = [
  "token",
  "upper",
  "space",
  "tab",
  "lineBreak",
  "tspecial",
  "control",
  "delete",
  "nonAscii",
] as const satisfies readonly MediaTypeClass[];

/**
 * Draw one part of a MIME value, a type or subtype or a third: up to eight characters, each from a
 * class the swarm turns on, at its weight.
 *
 * @param mix - The case's swarm.
 * @returns The generator.
 */
const mediaTypePart =
  (mix: Swarm<MediaTypeClass>): Gen<string> =>
  (source) => {
    const length = source.draw(int(0, 8));
    let part = "";
    for (let at = 0; at < length; at += 1) {
      part += source.draw(
        element(mediaTypeClasses[source.draw(swarmChoice(mix, mediaTypeClassNames))]),
      );
    }

    return part;
  };

/**
 * Draw a MIME value under a swarm: one to four parts joined by slashes, two, a type and a subtype,
 * six times in eight.
 *
 * @param mix - The case's swarm.
 * @returns The generator.
 */
const mediaTypeValue =
  (mix: Swarm<MediaTypeClass>): Gen<string> =>
  (source) => {
    const partCount = source.draw(
      weighted<number>([
        [1, int(1, 1)],
        [6, int(2, 2)],
        [1, int(3, 4)],
      ]),
    );

    return Array.from({ length: partCount }, () => source.draw(mediaTypePart(mix))).join("/");
  };

/**
 * The whitespace a generated list puts between its items and around them.
 */
const listGap = element([" ", "  ", "\t", "\n", " \r\n "] as const);

/**
 * Draw a MIME value and a list of them under one swarm: the list is up to three values between
 * runs of whitespace, with whitespace before and after at times.
 */
const mediaTypeCase: Gen<{ readonly list: string; readonly value: string }> = (source) => {
  const mix = source.draw(swarm(mediaTypeClassNames));
  const value = source.draw(mediaTypeValue(mix));
  const items = source.draw(array(mediaTypeValue(mix), { max: 3, min: 0 }));
  const inner = items.map((item, at) => (at === 0 ? item : `${source.draw(listGap)}${item}`));
  const before = source.draw(element(["", " ", "\t"] as const));
  const after = source.draw(element(["", " ", "\n"] as const));

  return { list: `${before}${inner.join("")}${after}`, value };
};

/**
 * Whether a token of a `CoordsDType` is one: digits and an optional `%`.
 *
 * @param token - The token.
 * @returns Whether it is.
 */
const isCoordsToken = (token: string): boolean => {
  const points = Array.from(token, String);
  const digits = points.at(-1) === "%" ? points.slice(0, -1) : points;

  return digits.length > 0 && digits.every((point) => point >= "0" && point <= "9");
};

/**
 * Whether a value is a `CoordsDType`, read token by token: after `replace`, three, four, or an even
 * number of six or more comma-separated tokens, each one {@link isCoordsToken} accepts (the XSD's
 * pattern, and the information model's Coords, §7.9).
 *
 * @param raw - The value as written.
 * @returns Whether it is.
 */
const isCoords = (raw: string): boolean => {
  const tokens = raw.replaceAll(regex("[\t\n\r]", "gu"), " ").split(",");
  const count = tokens.length;

  return (
    (count === 3 || count === 4 || (count >= 6 && count % 2 === 0)) && tokens.every(isCoordsToken)
  );
};

/**
 * A word every domain of a numeric type accepts, and the same word with outer whitespace.
 */
const spaced = [" 1", "1 ", "\t1\n"] as const;

describe("The spec readings", () => {
  it("read 7: a typed QTI value a string-typed attribute carries is exact, its outer whitespace kept, and one the XSD types xs:double is collapsed, as the XSD reads it", () => {
    /**
     * Oracle: reading `typed-value-whitespace` as amended (docs/spec-readings.md): map-key, the two
     * tables' default-value and an interpolation entry's target-value are string-typed and exact;
     * the xs:double typed-value attributes read as XML Schema Part 2 §4.3.6 reads xs:double,
     * whitespace collapsed.
     */
    const listed = specReadings.filter(({ reading }) => reading === "typed-value-whitespace");
    assert.isAbove(listed.length, 0);
    for (const reading of listed) {
      for (const kind of Option.getOrElse(reading.kinds, () => [])) {
        if (!declarersOf(reading.name).some((declarer) => declarer.kind === kind)) {
          continue;
        }

        const domain = Option.getOrThrow(domainAt(kind, reading.name));
        assert.include(["string", "anySimpleType"], domain.primitive, `${kind}@${reading.name}`);
        for (const value of spaced) {
          assert.isTrue(matches(domain, value), `${kind}@${reading.name} ${JSON.stringify(value)}`);
        }
      }
    }

    const doubles = [
      ["qti-map-entry", "mapped-value"],
      ["qti-area-map-entry", "mapped-value"],
      ["qti-mapping", "lower-bound"],
      ["qti-mapping", "upper-bound"],
      ["qti-mapping", "default-value"],
      ["qti-area-mapping", "lower-bound"],
      ["qti-area-mapping", "upper-bound"],
      ["qti-area-mapping", "default-value"],
      ["qti-interpolation-table-entry", "source-value"],
      ["ud:mapping", "defaultValue"],
      ["ud:mapping", "lowerBound"],
      ["ud:mapping", "upperBound"],
      ["ud:mapEntry", "mappedValue"],
    ] as const;
    let judged = 0;
    for (const [kind, name] of doubles) {
      if (!declarersOf(name).some((declarer) => declarer.kind === kind)) {
        continue;
      }

      const domain = Option.getOrThrow(domainAt(kind, name));
      judged += 1;
      for (const value of spaced) {
        assert.isTrue(matches(domain, value), `${kind}@${name} ${JSON.stringify(value)}`);
      }
    }

    assert.isAbove(judged, 0);
  });

  it("read 8: a match table entry's target-value is any value, read by the overlay as the outcome's base type", () => {
    const target = Option.getOrThrow(domainAt("qti-match-table-entry", "target-value"));
    for (const value of ["0.5", "true", "a b", "", "identifier"]) {
      assert.isTrue(matches(target, value), value);
    }
  });

  it("read 14, restated: a text-entry interaction's response-identifier and string-identifier are IDREFs, as the XSD types them", () => {
    for (const name of ["response-identifier", "string-identifier"]) {
      assert.deepStrictEqual(
        Option.getOrThrow(domainAt("qti-text-entry-interaction", name)).identity,
        Option.some("IDREF"),
        name,
      );
    }
  });

  it("read 15: a variable-identifier-ref is an IDREF, as the XSD and the information model type it", () => {
    /**
     * Oracle: the XSD's `UniqueIdentifierRefDType`, an `xs:IDREF` restriction (xsd:24140), and the
     * information model's §4.5.11 data type, `UniqueIdentifierRef`.
     */
    const ref = Option.getOrThrow(domainAt("qti-outcome-declaration", "variable-identifier-ref"));

    assert.deepStrictEqual(ref.identity, Option.some("IDREF"));
    assert.isTrue(matches(ref, " EXT "));
    assert.isFalse(matches(ref, "1EXT"));
  });

  it("read 16: normal-maximum is greater than zero", () => {
    assert.deepStrictEqual(
      Option.getOrThrow(domainAt("qti-outcome-declaration", "normal-maximum")).bound,
      Option.some({ facet: "minExclusive", value: 0 }),
    );
  });

  it("read 17: an item's and a test's rubric block's view lists at least one view, an outcome declaration's may list none, every declaring kind against every list of at most two views and the empty and blank values", () => {
    /**
     * Oracle: the information model's RubricBlock and TestRubricBlock `view`, "A list from an
     * enumerated value set" of multiplicity [1] (§5.120.2, §5.160.1), and OutcomeDeclaration's of
     * [0..1] (§4.5.4); a list of n views is one of the six names, n times, between whitespace.
     * Bound: every list of 0 to 2 of the six views, a blank value and a name outside the six.
     */
    const views = ["author", "candidate", "proctor", "scorer", "testConstructor", "tutor"];
    const lists = [
      [],
      ...views.map((view) => [view]),
      ...views.flatMap((left) => views.map((right) => [left, right])),
    ];
    const atLeastOne = new Set(["qti-rubric-block", "qti-rubric-block.test"]);
    for (const { kind } of declarersOf("view")) {
      const domain = Option.getOrThrow(domainAt(kind, "view"));
      const wrong = [
        ...lists.filter(
          (list) => matches(domain, list.join(" ")) !== (list.length > 0 || !atLeastOne.has(kind)),
        ),
        ...[" \t "].filter((blank) => matches(domain, blank) === atLeastOne.has(kind)),
        ...["viewer", "author viewer"].filter((value) => matches(domain, value)),
      ];

      assert.deepStrictEqual(wrong, [], kind);
    }
  });

  it("read 18 and 92: an order, graphic-order or position object interaction's min-choices is at least 1, every other kind's at least 0", () => {
    /**
     * Reading `order-min-choices`: "If specified, min-choices must be 1 or greater" of the order
     * interactions (§5.97.2, §5.61.1); reading `binding-and-count-sentences`: the same sentence of
     * the position object (§5.107.2).
     */
    const floored = new Set([
      "qti-order-interaction",
      "qti-graphic-order-interaction",
      "qti-position-object-interaction",
    ]);
    for (const { kind } of declarersOf("min-choices")) {
      const domain = Option.getOrThrow(domainAt(kind, "min-choices"));

      assert.strictEqual(matches(domain, "0"), !floored.has(kind), kind);
      assert.strictEqual(matches(domain, "+0"), !floored.has(kind), kind);
      assert.isTrue(matches(domain, " 1 "), kind);
    }
  });

  it("read 232: a position object interaction's center-point is two xs:int values, its horizontal then its vertical offset, every list of none to four integers and the blank and the out-of-range values", () => {
    /**
     * Oracle: the information model's PositionObjectInteraction `center-point`, an IntegerList "in
     * horizontal, vertical order" (§5.107.1), so two `Int` values, each in xs:int's lexical space
     * and range (XML Schema Part 2 §3.3.17), the list's items between whitespace (§4.3.6,
     * collapse). Bound: every list of 0 to 4 integers drawn from signed, padded and edge forms.
     */
    const items = ["0", "1", "-3", "+1", "007", "2147483647", "-2147483648"];
    const lists = [
      [],
      ...items.map((item) => [item]),
      ...items.flatMap((left) => items.map((right) => [left, right])),
      ["1", "2", "3"],
      ["1", "2", "3", "4"],
    ];
    const domain = Option.getOrThrow(domainAt("qti-position-object-interaction", "center-point"));
    const wrong = [
      ...lists.filter((list) => matches(domain, list.join(" ")) !== (list.length === 2)),
      ...lists
        .filter((list) => list.length === 2)
        .filter((list) => !matches(domain, ` ${list.join("\t \n")} `)),
      ...[" ", "1 2147483648", "1 a", "1.5 2"].filter((value) => matches(domain, value)),
    ];

    assert.deepStrictEqual(wrong, []);
  });

  it("read 42, restated: a voice's languages are ranges both SSML's prose and its normative schema admit, so * is refused", () => {
    /**
     * SSML 1.1 §3.2.1 (each token an Extended Language Range, `und` and `zxx` disallowed) beside
     * Appendix D's `xs:NMTOKENS` (§2.2.2: conformance includes "the constraints expressed in the
     * Core Schema"); `*` is a range subtag of RFC 4647 §2.2 and no XML name character.
     */
    const domain = Option.getOrThrow(domainAt("ssml:voice", "languages"));

    for (const value of ["", "en", "en-US", "en-GB:en-US", "fr ja", "x-klingon"]) {
      assert.isTrue(matches(domain, value), value);
    }

    for (const value of ["*", "en-*", "*-US", "en:*", "und", "ZXX", "en und"]) {
      assert.isFalse(matches(domain, value), value);
    }
  });

  it("read 85: an xi:include's parse is the XSD's xml or text, its whitespace collapsed as its token", () => {
    /**
     * The XSD's `xi:parseType` admits `xml` and `text` (`w3/XInclude.xsd` lines 31 to 36); "Values
     * other than "xml" and "text" are a fatal error" (XInclude 1.0 §3.1). Section 2.12 of the
     * information model, which would admit `xml` alone, is not normative (§2).
     */
    const domain = Option.getOrThrow(domainAt("xi:include", "parse"));

    assert.isTrue(matches(domain, "xml") && matches(domain, " xml "));
    assert.isTrue(matches(domain, "text") && matches(domain, " text "));
    assert.isFalse(matches(domain, "XML") || matches(domain, "html"));
  });

  it("read 2: every MathML kind's xref is an IDREF, so it names an id of its document", () => {
    const declarers = attributeDeclarations.filter(
      ({ kind, name }) => kind.startsWith("m:") && name === "xref",
    );
    assert.isAbove(declarers.length, 0);
    for (const { kind } of declarers) {
      const xref = Option.getOrThrow(domainAt(kind, "xref"));

      assert.deepStrictEqual(xref.identity, Option.some("IDREF"), `${kind}@xref`);
      assert.isTrue(matches(xref, "a1") && matches(xref, " a1 "), `${kind}@xref`);
      assert.isFalse(matches(xref, "a b") || matches(xref, "1a") || matches(xref, ""), kind);
    }
  });

  it("read 2, decision 327: an mglyph's alt, src and index are each optional and attributeCounts counts none of them, so a bare mglyph is accepted", () => {
    assert.isFalse(attributeCounts.some(({ kind }) => kind === "m:mglyph"));
    for (const name of ["alt", "src", "index"]) {
      const declarers = declarersOf(name).filter(({ kind }) => kind === "m:mglyph");
      assert.isAbove(declarers.length, 0, name);
      for (const { kind } of declarers) {
        assert.strictEqual(
          Option.getOrThrow(leafGrammar.admission.lookup({ kind, name })).use,
          "optional",
          name,
        );
      }
    }
  });

  it("read 46: every count, and figures, holds a signed 64-bit integer exactly", () => {
    for (const name of [
      "max-choices",
      "min-choices",
      "max-associations",
      "min-associations",
      "match-max",
      "match-min",
      "max-plays",
      "min-plays",
    ]) {
      const declarers = declarersOf(name);
      assert.isAbove(declarers.length, 0, name);
      for (const { kind } of declarers) {
        const domain = Option.getOrThrow(domainAt(kind, name));

        assert.isTrue(matches(domain, "9223372036854775807"), `${kind}@${name}`);
        assert.isTrue(matches(domain, " +09223372036854775807 "), `${kind}@${name}`);
        assert.isFalse(matches(domain, "9223372036854775808"), `${kind}@${name}`);
        assert.isFalse(matches(domain, "-1"), `${kind}@${name}`);
      }
    }

    for (const kind of ["qti-round-to", "qti-equal-rounded"]) {
      const figures = Option.getOrThrow(domainAt(kind, "figures"));

      assert.isTrue(matches(figures, "-9223372036854775808"), kind);
      assert.isFalse(matches(figures, "-9223372036854775809"), kind);
      assert.isFalse(matches(figures, "9223372036854775808"), kind);
      assert.isTrue(matches(figures, "FIGURES"), kind);
    }
  });

  it("read 2: a MathML number has no explicit +, and a content cn's base is a positive integer", () => {
    /**
     * MathML 3 §2.1.5.1: number is "an optional prefix of "-" (U+002D), followed by an unsigned
     * number", and "An explicit plus sign ('+') is not allowed as part of a numerical value";
     * §4.2.1.3: base "is a base 10 positive integer". The XSD types number xs:decimal and leaves
     * base untyped.
     */
    const numbers = declarersOf("scriptsizemultiplier");
    assert.isAbove(numbers.length, 0);
    for (const { kind } of numbers) {
      const domain = Option.getOrThrow(domainAt(kind, "scriptsizemultiplier"));

      for (const value of ["0.71", "-0.5", ".5", "5.", "2", " 0.6 "]) {
        assert.isTrue(matches(domain, value), `${kind} ${value}`);
      }

      for (const value of ["+0.5", "+.5", "+2", ".", "-", "1e2", ""]) {
        assert.isFalse(matches(domain, value), `${kind} ${value}`);
      }
    }

    const base = Option.getOrThrow(domainAt("m:cn", "base"));

    for (const value of ["16", "2", " 2 ", "010"]) {
      assert.isTrue(matches(base, value), value);
    }

    for (const value of ["+10", "0", "000", "-2", "1.0", "ten", ""]) {
      assert.isFalse(matches(base, value), value);
    }
  });

  it("read 120: a qti-index's n is at least 1 where it is a number, any NCName otherwise", () => {
    /**
     * Information model §5.72, Index: "'n' must be a positive integer"; the XSD's xs:int member
     * admits 0 and negatives, and reading `count-range` keeps no larger range for it.
     */
    const n = Option.getOrThrow(domainAt("qti-index", "n"));

    for (const value of ["1", "+1", "01", " 2 ", "2147483647", "N", "i", "INDEX_1"]) {
      assert.isTrue(matches(n, value), value);
    }

    for (const value of ["0", "-0", "+0", "00", "-1", "2147483648", "1.5", ""]) {
      assert.isFalse(matches(n, value), value);
    }
  });

  it("read 123: a bdo's dir is required and is ltr or rtl, never auto; another kind's dir keeps auto", () => {
    /**
     * Information model §5.11, BDO: "Authors must specify the dir attribute on this tag, with the
     * value ltr ... or rtl ... The auto value must not be specified". The XSD declares dir
     * optional, defaulting to auto (`readDeclarations` reads the use; the composed grammar's use
     * is the XSD uses test's).
     */
    const bdo = attributeDeclarations.filter(({ kind }) => kind === "bdo");
    const read = readDeclarations(bdo);

    assert.deepStrictEqual(
      read.filter(({ use }, at) => use !== bdo[at]?.use).map(({ name, use }) => `${name} ${use}`),
      ["dir required"],
    );
    assert.deepStrictEqual(
      read.filter(({ name }) => name === "dir").map((declared) => declared.default),
      [Option.none()],
    );
    assert.deepStrictEqual(readingUses, [{ kind: "bdo", name: "dir", reading: "bdo-dir" }]);

    const dir = Option.getOrThrow(domainAt("bdo", "dir"));
    const span = Option.getOrThrow(domainAt("span", "dir"));

    assert.isTrue(matches(dir, "ltr") && matches(dir, "rtl"));
    assert.isFalse(matches(dir, "auto") || matches(dir, "") || matches(dir, " rtl"));
    assert.isTrue(matches(span, "auto"));
  });

  it("read 124 and 125: each media URL holds something other than spaces, every declaring kind against blank and spaced values", () => {
    /**
     * Information model: audio and video src, video poster, source src and track src "must
     * contain a valid non-empty URL potentially surrounded by spaces" (§5.9.1, §5.166.1,
     * §5.166.9, §5.135.1, §5.163.2); HTML: a srcset "must consist of one or more image candidate
     * strings", each a valid non-empty URL. Oracle: after replace, a character other than a space.
     */
    const urls = [
      ["audio", "src"],
      ["source", "src"],
      ["source", "srcset"],
      ["track", "src"],
      ["video", "poster"],
      ["video", "src"],
    ] as const;
    const values = ["", " ", "\t", " \n ", "\r\n", "a", " a ", "\ta", "a b.png 2x", "%20"];
    for (const [kind, name] of urls) {
      const domain = Option.getOrThrow(domainAt(kind, name));
      const wrong = values.filter(
        (value) =>
          matches(domain, value) !==
          regex("[^ ]", "u").test(value.replaceAll(regex("[\t\n\r]", "gu"), " ")),
      );

      assert.deepStrictEqual(wrong, [], `${kind}@${name}`);
    }
  });

  it("read 129: xml:lang, lang and srclang hold BCP 47 tags, against an independent RFC 5646 recogniser on every tag of up to two subtags and the named longer forms", () => {
    /**
     * Oracle: RFC 5646 §2.1's ABNF walked subtag by subtag (`isLanguageTag`), not the pattern.
     * Bound: every tag of one or two subtags over `subtagSamples`, the 26 grandfathered tags in two
     * cases, and the named forms of the plan, which hold the longer tags whose subtags' order
     * decides them (script before region, extlangs, variants, extensions, a private-use tail); an
     * `xml:lang` or a `lang` may also be empty (XML 1.0 §2.12; information model §5.15.3), but not
     * on an item or a stimulus (§4.1.4, §4.3.4) and never a `srclang` (§5.163.3).
     */
    const tags = [
      ...subtagSamples.flatMap((first) => [
        first,
        ...subtagSamples.map((second) => `${first}-${second}`),
      ]),
      ...grandfathered.flatMap((tag) => [tag, tag.toUpperCase()]),
      "zh-Hant-TW",
      "de-CH-1996",
      "EN-us",
      "de-a-value",
      "en--x",
      "en-a",
      "en-US-x",
      "a-value",
      "en_US x",
      "english language",
      "1a",
      "en-",
      "-en",
      "zh-yue-HK",
      "en-Latn-US-1996-a-bc-x-ab",
      "en-abc-def-ghi",
      "en-abc-def-ghi-jkl",
      "en-US-US",
      "de-1996-1996",
      "en-a-bc-a-de",
      "x-a-b-c",
      "en-x",
    ];
    const roots = new Set(["qti-assessment-item", "qti-assessment-stimulus"]);
    const attributes = [
      ...declarersOf("xml:lang").map((at) => ({
        ...at,
        empty: !roots.has(at.kind),
        name: "xml:lang",
      })),
      ...declarersOf("lang").map((at) => ({ ...at, empty: true, name: "lang" })),
      ...declarersOf("srclang").map((at) => ({ ...at, empty: false, name: "srclang" })),
    ];
    const checked = new Map<string, readonly string[]>();

    assert.isAbove(tags.length, 500);
    assert.isAbove(attributes.length, 200);
    for (const { empty, kind, name } of attributes) {
      const domain = Option.getOrThrow(domainAt(kind, name));
      const wrong =
        checked.get(`${domain.handle} ${String(empty)}`) ??
        [...tags, "", "en ", " en"].filter(
          (value) =>
            matches(domain, value) !==
            (value === "" ? empty : isLanguageTag(name === "xml:lang" ? value.trim() : value)),
        );
      checked.set(`${domain.handle} ${String(empty)}`, wrong);

      assert.deepStrictEqual(wrong.slice(0, 20), [], `${kind}@${name}`);
    }
  });

  it("read 132 and 161: a printed variable's format is a printf format string over the listed codes, of any number of conversions, against an independent recogniser on every string of one to four pieces", () => {
    /**
     * Information model §2.3.4: each conversion specifier is "%", flags of "#", "0", "-", " " and
     * "+", an optional width, an optional precision ("." and zero or more digits), and one of E, e,
     * f, G, g, r, R, i, o, X or x; the rest of a C format string is text and "%%". Reading
     * `format-conversion-count` sets aside reading `printed-variable-format`'s one specifier: QTI
     * bans no second conversion (PR #46, comment 6701102861), so a format holds any number, none
     * included, and is stored as written. Oracle: `isPrintfFormat`, a left-to-right walk of the
     * string that reads each specifier, not the pattern. Bound: every string of one to four pieces
     * (30,940), which reaches each count of specifiers, none to several, well-formed and
     * malformed.
     */
    const pieces = ["%", "%%", "%i", "d", "f", ".", "5", " ", "#", "-", "x", "q", "é"];
    const strings = [
      "",
      "%.2f",
      "%.f",
      "%5.2e",
      "Score: %i%%",
      "%#x",
      "%-+ #012.3E",
      "2f%",
      "100%%",
      "%i of %i",
      "%%%e%%%G",
    ];
    let level: readonly string[] = [""];
    for (let length = 1; length <= 4; length += 1) {
      level = level.flatMap((head) => pieces.map((piece) => `${head}${piece}`));
      for (const each of level) {
        strings.push(each);
      }
    }

    assert.deepStrictEqual(
      printfNotes.filter((note) => !strings.some((value) => printfNote(value) === note)),
      [],
      "the bound reaches every count of specifiers, well-formed and malformed",
    );

    const format = Option.getOrThrow(domainAt("qti-printed-variable", "format"));
    const wrong = strings.filter((value) => matches(format, value) !== isPrintfFormat(value));

    assert.deepStrictEqual(wrong.slice(0, 20), []);
    assert.isTrue(
      matches(format, "%.2f") &&
        matches(format, "Score: %i%%") &&
        matches(format, "100%%") &&
        matches(format, "%i of %i") &&
        matches(format, "%%%e%%%G") &&
        matches(format, "%i, %.2f and %#x") &&
        matches(format, "%d") &&
        matches(format, "%d %d") &&
        matches(format, "%i of %d"),
    );
    assert.isFalse(matches(format, "%") || matches(format, "%q") || matches(format, "%i of %"));
  });

  it.effect(
    "read 161, searched: generated formats of any number of specifiers, swarm-weighted over five kinds of piece, judged as the independent recogniser judges them, each count of specifiers reached well-formed and malformed",
    (ctx) =>
      searched(
        ctx,
        explore(
          {
            caseHang: Duration.minutes(1),
            coverage: required<PrintfNote>(printfNotes, { cases: 600, sense: notesOnly }),
            draw: drawn(printfCase),
            kept: [],
            literal: Formatter.format,
            oracle: {
              kind: "specification",
              name: "information model §2.3.4's conversion specifier and C11 §7.21.6.1's format string read character by character (printfSpecifiers, isPrintfFormat), not the pattern",
            },
            runs: 800,
            shrink: completeShrink,
            steerEvery: 16,
            suite: "grammar/attributes/printf-format",
          },
          (value, c) =>
            Effect.sync(() => {
              c.note(printfNote(value));

              const format = Option.getOrThrow(domainAt("qti-printed-variable", "format"));

              assert.strictEqual(
                matches(format, value),
                isPrintfFormat(value),
                JSON.stringify(value),
              );
            }),
        ),
      ),
  );

  it("read 9: an h1's role is heading, tab or presentation, and every other kind's ARIA role keeps each role the XSD lists, every declarer against every listed role and the near misses", () => {
    /**
     * ASI binding §5.3.1, RULE ARIA ROLE 1b: "The 'h1' tag may have an ARIA role value of
     * 'heading' or 'tab' or 'presentation' only". Oracle: the XSD's enumeration, from the leaf's
     * own resolution, and the rule's three names restated here; the Schematron's text itself is
     * the cached suite's below. SSML's `role` is a list of QNames, no enumeration, and is left out.
     */
    const allowed = new Set(["heading", "tab", "presentation"]);
    const nearMisses = [
      "Heading",
      " heading",
      "heading ",
      "heading tab",
      "",
      "tab\t",
      "none",
      "h1",
    ];
    const declarers = attributeDeclarations.filter(
      ({ domain, name }) => name === "role" && enumerationOf(domain).length > 0,
    );
    let checked = 0;
    for (const { domain, kind } of declarers) {
      const roles = enumerationOf(domain);
      const held = Option.getOrThrow(domainAt(kind, "role"));
      const wrong = [...roles, ...nearMisses].filter(
        (value) =>
          matches(held, value) !== (roles.includes(value) && (kind !== "h1" || allowed.has(value))),
      );

      assert.deepStrictEqual(wrong, [], `${kind}@role`);
      checked += 1;
    }

    assert.isAbove(checked, 100);
    assert.isTrue(declarers.some(({ kind }) => kind === "h1"));
    assert.isTrue(
      declarers.every(({ domain }) =>
        [...allowed].every((role) => enumerationOf(domain).includes(role)),
      ),
    );
  });

  it("read 9: a source carries no role, and it is the only declaration the readings drop", () => {
    /**
     * ASI binding §5.3.1, RULE ARIA ROLE 1a: "The 'source' tag must not have an ARIA role
     * attribute", where the XSD declares it; an `xi:include`'s `xpointer`, which the XSD declares,
     * is kept (reading `inclusion-cycles`). Oracle: the leaf's declarations, every one, against
     * those `readDeclarations` keeps.
     */
    const kept = new Set(
      readDeclarations(attributeDeclarations).map(({ kind, name }) => `${kind} ${name}`),
    );
    const dropped = [...new Set(attributeDeclarations.map(({ kind, name }) => `${kind} ${name}`))]
      .filter((declared) => !kept.has(declared))
      .toSorted();

    assert.deepStrictEqual(dropped, ["source role"]);
    assert.isTrue(kept.has("h1 role") && kept.has("video role") && kept.has("source type"));
    assert.isTrue(kept.has("xi:include xpointer"));
  });

  /**
   * Oracle: the composed grammar's rows themselves, every governor's and every open class's,
   * against the rule; spec reading `extension-attribute-lists` leaves `source`, which the
   * Schematron's extension rules cover, the `data-*` class alone, so a `role` there is no name it
   * admits.
   */
  const sourceHasNoRole = Effect.gen(function* sourceHasNoRole() {
    const { attributes } = yield* Effect.fromResult(composed());
    assert.deepStrictEqual(
      attributes.admission.lookup({ kind: "source", name: "role" }),
      Option.none(),
    );
    assert.deepStrictEqual(
      openClasses.filter((open) =>
        Option.isSome(attributes.admission.lookup({ kind: "source", name: open })),
      ),
      ["data-*"],
    );
    assert.strictEqual(attributes.admission.lookup({ kind: "h1", name: "role" })._tag, "Some");

    assert.deepStrictEqual(
      attributes.governed.rows.filter(
        ({ governor, name }) => governor.startsWith("source ") && name === "role",
      ),
      [],
    );
  });

  it.effect(
    "read 9: the composed grammar admits no role on a source, under its kind, any governor or any open class but data-*",
    () => sourceHasNoRole,
  );

  it("read 135: every MIME type is RFC 2045's two tokens and a slash, and each item of the upload's list, against an independent reader on every string of up to four symbols and the named cases", () => {
    /**
     * Information model §7.25, MimeType: "The mime type (type and subtype), as defined by
     * [RFC 2045]"; §5.1.2 and §5.135.2: "its value must be a valid MIME type". RFC 2045 §5.1:
     * `type "/" subtype`, each a token, "1*<any (US-ASCII) CHAR except SPACE, CTLs, or
     * tspecials>". Oracle: `mediaTypeFault`, a code-point walk of the RFC's sentence, not the
     * pattern. Bound: every string of at most four of `mediaTypeSymbols` (88,741), each declarer,
     * then the named cases with the verdicts the reading states.
     */
    const declarers = attributeDeclarations
      .filter(({ type }) => type.type === "MimeTypeDType")
      .map(({ kind, name }) => `${kind}@${name}`)
      .toSorted();

    assert.deepStrictEqual(declarers, [
      "a@type",
      "object@type",
      "param@type",
      "qti-calculator-info@mime-type",
      "qti-digital-material@mime-type",
      "qti-file-href.card@mime-type",
      "qti-stylesheet@type",
      "source@type",
    ]);

    const named: readonly (readonly [string, boolean])[] = [
      ["image/png", true],
      ["IMAGE/PNG", true],
      ["image/svg+xml", true],
      ["application/vnd.ms-excel", true],
      ["x-world/x-vrml", true],
      ["*/*", true],
      ["text/x-{a}~|`'!#$%&^_.", true],
      [`${"a".repeat(200)}/${"b".repeat(300)}`, true],
      [" image/png", false],
      ["image/png ", false],
      ["image /png", false],
      ["image/ png", false],
      ["a b/c", false],
      ["image/png\t", false],
      ["\nimage/png", false],
      ["image/png\r", false],
      ["image/png\u007F", false],
      ["image", false],
      ["/png", false],
      ["image/", false],
      ["/", false],
      ["", false],
      ["a/b/c", false],
      ["a//b", false],
      ["text/html;charset=utf-8", false],
      ["text/html; charset=utf-8", false],
      ["é/x", false],
      ["a(b)/c", false],
      ["a@b/c", false],
      ["[a]/b", false],
      ["a/b=c", false],
      ['a/"b"', false],
      ["\u00A0", false],
      ["image/png\u00A0", false],
      ["\uFEFFimage/png", false],
    ];
    const checked = new Map<string, readonly string[]>();
    for (const at of declarers) {
      const [kind = "", name = ""] = at.split("@");
      if (!declarersOf(name).some((declarer) => declarer.kind === kind)) {
        continue;
      }

      const domain = Option.getOrThrow(domainAt(kind, name));
      const wrong =
        checked.get(domain.handle) ??
        mediaTypeScope.filter(
          (value) => matches(domain, value) !== (mediaTypeFault(value) === "valid"),
        );
      checked.set(domain.handle, wrong);

      assert.deepStrictEqual(wrong.slice(0, 20), [], at);
      for (const [value, valid] of named) {
        assert.strictEqual(matches(domain, value), valid, `${at} ${JSON.stringify(value)}`);
        assert.strictEqual(
          mediaTypeFault(value) === "valid",
          valid,
          `the reader on ${JSON.stringify(value)}`,
        );
      }
    }

    const upload = Option.getOrThrow(domainAt("qti-upload-interaction", "type"));
    const lists = [
      ...mediaTypeScope,
      ...named.flatMap(([first]) => named.map(([second]) => `${first} ${second}`)),
      " image/png  text/plain ",
      "image/png\ttext/plain\n",
      "\u00A0",
      " \u00A0 ",
      "image/png\u00A0text/plain",
    ];
    const wrong = lists.filter((value) => matches(upload, value) !== isMediaTypeList(value));

    assert.deepStrictEqual(wrong.slice(0, 20), []);
    assert.isTrue(matches(upload, " image/png  text/plain ") && matches(upload, ""));
    assert.isFalse(
      matches(upload, "image/png a(b)/c") || matches(upload, "image/png\u007F text/plain"),
    );
  });

  it.effect(
    "read 135, searched: generated MIME values and lists, swarm-weighted over nine character classes, judged as the independent reader judges them, each rule of the reader reached alone",
    (ctx) =>
      searched(
        ctx,
        explore(
          {
            caseHang: Duration.minutes(1),
            coverage: required<MediaTypeNote | MediaTypeListNote>(
              [...mediaTypeNotes, ...mediaTypeListNotes],
              { cases: 600, sense: notesOnly },
            ),
            draw: drawn(mediaTypeCase),
            kept: [],
            literal: Formatter.format,
            oracle: {
              kind: "specification",
              name: "RFC 2045 §5.1's media type read code point by code point (mediaTypeFault, isMediaTypeList), not the pattern",
            },
            runs: 800,
            shrink: completeShrink,
            steerEvery: 16,
            suite: "grammar/attributes/media-type",
          },
          ({ list, value }, c) =>
            Effect.sync(() => {
              const fault = mediaTypeFault(value);
              const valid = isMediaTypeList(list);
              c.note(mediaTypeNote(value));
              c.note(mediaTypeListNote(list));

              assert.strictEqual(
                mediaTypeFaultsOf(value).size === 0,
                fault === "valid",
                "the reader's two readings agree",
              );

              const single = Option.getOrThrow(domainAt("a", "type"));
              const upload = Option.getOrThrow(domainAt("qti-upload-interaction", "type"));

              assert.strictEqual(matches(single, value), fault === "valid", JSON.stringify(value));
              assert.strictEqual(matches(upload, list), valid, JSON.stringify(list));
            }),
        ),
      ),
  );

  /**
   * Information model §7.9, Coords: "(e) default: no coordinates should be given", a best
   * practice (§1.3); coords has multiplicity [1] on every class with a shape (§5.7.6,
   * §5.67.5, §5.75.2, §7.4.2), and "A value of a shape is always accompanied by coordinates"
   * (§8.29). The grammar reads the XSD's required CoordsDType, by no reading of its own.
   * Oracle: `isCoords`, the pattern's counts read token by token, and the XSD's use from the
   * leaf. Bound: every list of one to eight tokens over four samples (87,380), each kind with
   * a default shape, under its kind and every governor of it.
   */
  const defaultAreaCoords = Effect.gen(function* defaultAreaCoords() {
    const { attributes } = yield* Effect.fromResult(composed());
    const byHandle = new Map(attributes.domains.map((domain) => [domain.handle, domain]));
    const areaKinds = attributeDeclarations
      .filter(({ domain, name }) => name === "shape" && enumerationOf(domain).includes("default"))
      .map(({ kind }) => kind)
      .toSorted();

    assert.deepStrictEqual(areaKinds, [
      "qti-area-map-entry",
      "qti-associable-hotspot",
      "qti-hotspot-choice",
      "qti-inside",
    ]);

    const samples = ["15", "5%", "", " 1"] as const;
    const levels: (readonly string[])[] = [samples];
    for (let length = 2; length <= 8; length += 1) {
      levels.push(
        (levels.at(-1) ?? []).flatMap((head) => samples.map((sample) => `${head},${sample}`)),
      );
    }

    const lists = [
      ...levels.flat(),
      "0 0 1 1",
      "0,0,1,1,",
      ",0,0,1",
      "0,0,1\t",
      "\t0,0,1",
      "-1,0,1",
      "1.5,0,1",
      "0,0,1%%",
    ];

    assert.strictEqual(lists.length, 87_380 + 8);

    const rows = [
      ...attributes.admission.rows.map((row) => ({ ...row, at: row.kind })),
      ...attributes.governed.rows.map((row) => ({ ...row, at: row.governor })),
    ].filter(
      ({ at, name }) =>
        name === "coords" && areaKinds.some((kind) => at === kind || at.startsWith(`${kind} `)),
    );
    const checked = new Map<string, readonly string[]>();
    for (const { at, domain: handle, use } of rows) {
      const domain = byHandle.get(handle);
      const wrong =
        checked.get(handle) ??
        lists.filter((value) => domain === undefined || matches(domain, value) !== isCoords(value));
      checked.set(handle, wrong);

      assert.strictEqual(use, "required", at);
      assert.strictEqual(handle, "CoordsDType", at);
      assert.deepStrictEqual(wrong.slice(0, 20), [], at);
    }

    assert.isAtLeast(rows.length, areaKinds.length);
    assert.isFalse(specReadings.some(({ name }) => name === "coords" || name === "shape"));
    assert.strictEqual(
      Option.getOrThrow(
        attributes.admission.lookup({ kind: "qti-media-interaction", name: "coords" }),
      ).use,
      "optional",
    );
  });

  it.effect(
    "read 136: a default shape's coords is required and a CoordsDType, as every shape's is, every kind with a default shape in the composed grammar against an independent reader on every list of up to eight tokens",
    () => defaultAreaCoords,
  );
});

/**
 * The identity type a definition's built-in makes it, by XML Schema Part 1's ID/IDREF rules: an
 * atomic `ID` or `IDREF`, or a list of `IDREF`s.
 *
 * @param domain - The definition.
 * @returns Its identity type, or none.
 */
const identityOf = (domain: Domain): Option.Option<string> => {
  if (domain._tag === "atomic") {
    return domain.builtin === "ID" || domain.builtin === "IDREF"
      ? Option.some(domain.builtin)
      : Option.none();
  }

  return domain._tag === "list" && domain.item._tag === "atomic" && domain.item.builtin === "IDREF"
    ? Option.some("IDREFS")
    : Option.none();
};

/**
 * The spec readings that apply to a kind's attribute, by slug: those naming the attribute on
 * every kind that declares it, or on this kind.
 *
 * @param kind - The kind.
 * @param name - The attribute.
 * @returns The readings' slugs, in code-point order.
 */
const readingSlugsOf = (kind: string, name: string): readonly string[] =>
  [
    ...new Set(
      specReadings
        .filter(
          (reading) =>
            reading.name === name &&
            Option.match(reading.kinds, { onNone: () => true, onSome: (on) => on.includes(kind) }),
        )
        .map(({ reading }) => reading),
    ),
  ].toSorted(codePointOrder);

/**
 * The readings a domain's handle names: the slugs of its ` (…)` part, none without one.
 *
 * @param handle - The handle.
 * @returns The slugs, in code-point order.
 */
const readingsNamed = (handle: string): readonly string[] =>
  Option.match(
    Option.fromNullishOr(
      regex(" \\((?<slugs>[a-z][a-z0-9-]*(?:, [a-z][a-z0-9-]*)*)\\)", "u").exec(handle)?.groups,
    ),
    {
      onNone: () => [],
      onSome: ({ slugs }) => slugs.split(", "),
    },
  ).toSorted(codePointOrder);

describe("The value domains' names", () => {
  it("name the spec readings of an attribute each was compiled for, and only those, every domain of the leaf", () => {
    /**
     * Oracle: the specification as a checker, the roster's naming rule: a domain is named after
     * the type it was first compiled from, a reading's with the reading, so its handle's readings
     * are exactly those that apply to some attribute it is the domain of, and a handle naming none
     * is some unread attribute's or text's domain.
     */
    const readingsOfDomain = new Map<string, Set<string>>();
    const add = (domain: string, readings: readonly string[]) => {
      readingsOfDomain.set(
        domain,
        (readingsOfDomain.get(domain) ?? new Set<string>()).add(readings.join(", ")),
      );
    };
    for (const { domain, kind, name } of leafGrammar.admission.rows) {
      add(domain, readingSlugsOf(kind, name));
    }

    for (const { domain } of leafGrammar.text.rows) {
      add(domain, []);
    }

    assert.deepStrictEqual(
      leafGrammar.domains
        .filter(
          ({ handle }) =>
            !(readingsOfDomain.get(handle) ?? new Set()).has(readingsNamed(handle).join(", ")),
        )
        .map(({ handle }) => [handle, [...(readingsOfDomain.get(handle) ?? [])]]),
      [],
    );
  });
});

describe("The attribute grammar's structure", () => {
  it("numbers each kind's admitted names 0 to n − 1 in AttributeName code order, a bijection", () => {
    const byKind = Map.groupBy(leafGrammar.admission.rows, ({ kind }) => kind);
    for (const [key, rows] of byKind) {
      const ordered = rows.toSorted(
        (left, right) =>
          Option.getOrThrow(rosters.names.codeOf(left.name)) -
          Option.getOrThrow(rosters.names.codeOf(right.name)),
      );

      assert.deepStrictEqual(
        ordered.map(({ position }) => Number(position)),
        ordered.map((_, at) => at),
        key,
      );
    }

    assert.strictEqual(
      leafGrammar.positions.handles.length,
      Arr.reduce(
        [...byKind.values()].map((rows) => rows.length),
        Number.NEGATIVE_INFINITY,
        (most, each) => Math.max(most, each),
      ),
    );
  });

  it("admits each declaration of the leaf, with its use, and nothing else", () => {
    const stated = new Set(
      attributeDeclarations.map(({ kind, name, use }) => `${kind} ${name} ${use}`),
    );
    const admitted = new Set(
      leafGrammar.admission.rows.map(({ kind, name, use }) => `${kind} ${name} ${use}`),
    );

    assert.deepStrictEqual([...admitted.symmetricDifference(stated)], []);
  });

  it("gives every simple-content kind of the leaf its text's domain (A9)", () => {
    const stated = new Set(textTypes.map(({ kind }) => kind));
    const held = new Set(leafGrammar.text.rows.map(({ kind }) => kind));

    assert.deepStrictEqual([...held.symmetricDifference(stated)], []);
    for (const kind of [
      "cp:schema",
      "cp:schemaversion",
      "qmd:toolName",
      "qmd:interactionType",
      "drd:hazard",
      "lom:string",
      "ud:value",
    ]) {
      assert.isTrue(Option.isSome(leafGrammar.text.lookup({ kind })), kind);
    }
  });

  it("derives each domain's identity from the built-in its type restricts, and from nothing else", () => {
    for (const declared of attributeDeclarations) {
      /**
       * Whether reading `mathml-validity` reads the declaration as other than its type: MathML's
       * `xref`, an IDREF.
       */
      const readAsOther = declared.kind.startsWith("m:") && declared.name === "xref";
      if (!readAsOther) {
        assert.deepStrictEqual(
          Option.getOrThrow(domainAt(declared.kind, declared.name)).identity,
          identityOf(declared.domain),
          `${declared.kind}@${declared.name}`,
        );
      }
    }

    assert.deepStrictEqual(leafGrammar.identity.rows.map(({ identity }) => identity).toSorted(), [
      "ID",
      "IDREF",
      "IDREFS",
    ]);
  });

  it("holds the BaseType roster's members as the XSD's base-type enumeration", () => {
    const declared = attributeDeclarations.find(
      ({ kind, name }) => kind === "qti-response-declaration" && name === "base-type",
    );

    assert.deepStrictEqual(
      [...baseTypes].toSorted(),
      [...(declared === undefined ? [] : enumerationOf(declared.domain))].toSorted(),
    );
  });
});

/**
 * One toy declaration over a toy kind.
 *
 * @param kind - The kind.
 * @param name - The attribute.
 * @param pattern - Its one XSD pattern.
 * @returns The declaration.
 */
const toyDeclaration = (kind: string, name: string, pattern: string): Declared => ({
  domain: {
    _tag: "atomic",
    builtin: "string",
    facets: [{ facet: "whiteSpace", value: "preserve" }],
    patterns: [[pattern]],
    primitive: "string",
  },
  kind,
  name,
  type: { inline: Option.none(), type: "Toy", whiteSpace: "preserve" },
  use: "optional",
});

/**
 * Generate a toy grammar over the toy rosters.
 *
 * @param declarations - The declarations.
 * @param kinds - The kind roster.
 * @returns The generator's result.
 */
const toyGenerate = (declarations: readonly Declared[], kinds: Roster<string>) =>
  generate(
    {
      declarations,
      kinds,
      names: roster("AttributeName", ["a", "b"]),
      texts: [],
      ...ungoverned,
    },
    processCompiler,
  );

describe("The attribute grammar's refusals", () => {
  const kinds = roster("NodeKind", ["k"]);

  it("state a kind that declares a name twice, in two domains, as AttributeGrammar rows grizzle refuses as two facts at one key", () => {
    /**
     * The generator checks no row: grizzle refuses the key when it declares the relation
     * (`#pantry/test/declared.ts`).
     */
    const result = toyGenerate(
      [toyDeclaration("k", "a", "x"), toyDeclaration("k", "a", "y")],
      kinds,
    );

    assert.isTrue(
      Result.isSuccess(result) &&
        Result.match(declaredRelation(result.success.admission), {
          onFailure: rowFaultOf,
          onSuccess: () => "declared",
        }) === "two facts at one key",
    );
  });

  it("state a kind outside its roster as AttributeGrammar rows grizzle refuses, and refuse a name outside AttributeName, which a position is read from", () => {
    const outsideKind = toyGenerate([toyDeclaration("j", "a", "x")], kinds);
    const outsideName = toyGenerate([toyDeclaration("k", "c", "x")], kinds);

    assert.isTrue(
      Result.isSuccess(outsideKind) &&
        Result.match(declaredRelation(outsideKind.success.admission), {
          onFailure: rowFaultOf,
          onSuccess: () => "declared",
        }) === "outside its roster",
    );
    assert.isTrue(Result.isFailure(outsideName) && outsideName.failure._tag === "OutsideCodeSpace");
  });

  it("refuse a declaration whose domain does not compile, naming it", () => {
    const result = toyGenerate([toyDeclaration("k", "b", "[]")], kinds);

    assert.isTrue(Result.isFailure(result) && result.failure._tag === "UncompiledDomain");
    assert.include(Result.isFailure(result) ? result.failure.message : "", "k@b");
  });

  it("intern one domain per definition, whichever declarations share it", () => {
    const result = Result.getOrThrow(
      toyGenerate([toyDeclaration("k", "a", "x"), toyDeclaration("k", "b", "x")], kinds),
    );

    assert.strictEqual(result.domains.length, 1);
    assert.strictEqual(result.valueDomain.rows.length, 1);
  });
});

/**
 * The pinned schema sets the XSD reading walks.
 */
const schemas: readonly SourcePath[] = [
  "imsqti_asiv3p0p1_v1p0.xsd",
  "imsqtiv3p0p1_imscpv1p2_v1p0.xsd",
];

/**
 * The open classes, the `AttributeName` handles of names no declaration states, from their owner's
 * roster, so a class the roster gains is set aside here too.
 */
const openNames: ReadonlySet<string> = new Set(openClasses);

/**
 * Whether a name is one the composition states beside the XSD's declarations: an XML Schema
 * instance attribute, or an open class.
 *
 * @param name - An attribute handle.
 * @returns Whether it is the layer's.
 */
const isLayerName = (name: string): boolean => name.startsWith("xsi:") || openNames.has(name);

describe("The XSD's attribute uses", () => {
  beforeAll(xsdCachePresent);

  it.effect(
    "are what the composed grammar admits on every kind the XSD reading reaches, with the XSD's use, the layer's names aside",
    () =>
      Effect.gen(function* attributeUsesAreTheXsds() {
        const { attributes, kinds } = yield* Effect.fromResult(composed());
        const differences: string[] = [];
        let compared = 0;
        for (const root of schemas) {
          const { set } = yield* loadXsd(root);
          const { contents } = xsdContents(set, (namespace, local, parent) =>
            kinds.nodeKind.has(parent) ? kinds.resolve(namespace, local, parent) : Option.none(),
          );
          for (const [kind, models] of contents) {
            const expected = new Map<string, string>();
            for (const model of models) {
              for (const use of model.attributes) {
                if (use.use !== "prohibited") {
                  expected.set(
                    use.name.namespace === XML_NAMESPACE ? `xml:${use.name.local}` : use.name.local,
                    use.use,
                  );
                }
              }
            }

            /**
             * Whether spec reading `schematron-intent` takes the kind's `role` away: a `source`
             * carries none (the Schematron's RULE ARIA ROLE 1a). Spec reading `aria-keyshorts`
             * keeps the XSD's `aria-keyshorts` alone, no second spelling beside it, and spec
             * reading `bdo-dir` makes a `bdo` carry `dir` (§5.11, `readingUses` below).
             */
            const roleless = kind === "source";
            if (roleless) {
              expected.delete("role");
            }

            for (const readingUse of readingUses.filter((use) => use.kind === kind)) {
              if (expected.has(readingUse.name)) {
                expected.set(readingUse.name, "required");
              }
            }

            const admitted = new Map<string, string>(
              attributes.admission.rows
                .filter(
                  (row) =>
                    row.kind === kind &&
                    !isLayerName(row.name) &&
                    ((!row.name.startsWith("xml:") && !row.name.startsWith("xlink:")) ||
                      expected.has(row.name) ||
                      !models.some(({ anyAttribute }) => anyAttribute)),
                )
                .map(({ name, use }) => [name, use] as const),
            );
            compared += admitted.size;
            for (const [name, use] of expected) {
              if (admitted.get(name) !== use) {
                differences.push(
                  `${kind}@${name}: the XSD declares it ${use}, the grammar ${admitted.get(name) ?? "does not admit it"}`,
                );
              }
            }

            for (const name of admitted.keys()) {
              if (!expected.has(name)) {
                differences.push(
                  `${kind}@${name}: the grammar admits it, the XSD does not declare it`,
                );
              }
            }
          }
        }

        assert.isAbove(compared, 5000);
        assert.deepStrictEqual(differences, []);
      }).pipe(Effect.provide(XsdOracleLayer)),
  );
});

/**
 * The four attributes `xml.xsd` declares globally.
 */
const xmlGlobals = globalAttributes.filter(({ name }) => name.startsWith("xml:"));

describe("The document layer", () => {
  beforeAll(xsdCachePresent);

  it.effect(
    "admits xml.xsd's four globals under their own domains on every kind whose lax or strict attribute wildcard admits the XML namespace, and under the open domain where it skips",
    () =>
      Effect.gen(function* layerFollowsTheWildcards() {
        const { attributes, kinds } = yield* Effect.fromResult(composed());
        const byHandle = new Map(attributes.domains.map((domain) => [domain.handle, domain]));
        /**
         * Spec reading `extension-attribute-lists`: on an element the Schematron's extension rules
         * cover, an `xml:` name the kind does not declare is no `data-` extension, so it is refused
         * there; but on `qti-custom-interaction`, whose `extension` characteristic is a
         * `NamespaceLax` (information model §5.36.1), it is one of that characteristic's.
         */
        const covered = new Set(
          coveredElements
            .filter(({ element: covers }) => covers.local !== "qti-custom-interaction")
            .map(({ element: covers }) => `{${covers.namespace}}${covers.local}`),
        );
        const coveredAt = (kind: string): boolean =>
          Option.exists(kinds.elementName.lookup({ kind }), ({ local, namespace }) =>
            covered.has(`{${namespace}}${local}`),
          );
        const missing: string[] = [];
        let checked = 0;
        let refused = 0;
        for (const wildcard of attributeWildcards.filter(
          ({ namespace }) => namespace !== "##local",
        )) {
          for (const global of xmlGlobals) {
            /**
             * Whether XML Schema 1.0 Part 1 §3.4.4 clause 5.2 (spec reading `wildcard-xml-id`) bars
             * the attribute: a custom interaction declares an ID-typed `id`, so its `##other`
             * wildcard admits no wild `xml:id`.
             */
            const wildId = wildcard.kind === "qti-custom-interaction" && global.name === "xml:id";
            if (wildId) {
              continue;
            }

            const row = attributes.admission.lookup({ kind: wildcard.kind, name: global.name });
            const declared = attributeDeclarations.some(
              ({ kind, name }) => kind === wildcard.kind && name === global.name,
            );
            checked += 1;
            if (!declared && coveredAt(wildcard.kind)) {
              refused += 1;
              if (Option.isSome(row)) {
                missing.push(
                  `${wildcard.kind}@${global.name} is admitted, though reading \`extension-attribute-lists\` refuses it`,
                );
              }
            } else if (Option.isNone(row)) {
              missing.push(`${wildcard.kind}@${global.name}`);
            } else if (!declared) {
              const domain = byHandle.get(row.value.domain);
              const lax = wildcard.processing !== "skip";
              const accepts = (value: string) => domain !== undefined && matches(domain, value);
              if (lax && global.name === "xml:space" && accepts("neither")) {
                missing.push(
                  `${wildcard.kind}@xml:space reads no xml.xsd type under ${wildcard.processing}`,
                );
              }

              if (!lax && !accepts("neither")) {
                missing.push(`${wildcard.kind}@${global.name} is validated under skip`);
              }
            }
          }
        }

        assert.isAbove(checked, 1000);
        assert.isAbove(refused, 0);
        assert.deepStrictEqual(missing, []);

        /**
         * A lax wildcard's kind (LOM's string) and a skip one's (MathML's): spec reading
         * `language-tags`, XML 1.0 §2.12, makes every xml:lang a BCP 47 tag or empty under both
         * alike.
         */
        const wildcardKinds = ["lom:string", "m:mi"];
        for (const kind of wildcardKinds) {
          const lang = Option.getOrThrow(attributes.admission.lookup({ kind, name: "xml:lang" }));
          const domain = byHandle.get(lang.domain);

          assert.isTrue(
            domain !== undefined &&
              matches(domain, "en") &&
              matches(domain, "") &&
              !matches(domain, "en_US"),
            kind,
          );
        }
      }),
  );
});

/**
 * The ASI XSD whose embedded Schematron states `RULE_SET_ARIA_ROLES_1`.
 */
const ariaRuleSource: SourcePath = "imsqti_asiv3p0p1_v1p0.xsd";

/**
 * The rules of `RULE_SET_ARIA_ROLES_1` in an ASI XSD's raw text, from the pattern's start tag to
 * the next `</sch:pattern>`: each rule's `//qti:<local>` context and its one assertion's test.
 *
 * @param text - The XSD's text.
 * @returns The tests, by context's local name, in the text's order.
 */
const ariaRulesIn = (text: string): ReadonlyMap<string, string> => {
  const start = text.indexOf('<sch:pattern abstract="false" id="RULE_SET_ARIA_ROLES_1">');
  const body = start === -1 ? "" : text.slice(start, text.indexOf("</sch:pattern>", start));

  return new Map(
    [
      ...body.matchAll(
        regex(
          '<sch:rule abstract="false" context="//qti:(?<local>[a-z0-9-]+)">\\s*<sch:assert test="(?<test>[^"]*)">',
          "gu",
        ),
      ),
    ].map((found) => [found.groups?.["local"] ?? "", found.groups?.["test"] ?? ""] as const),
  );
};

describe("The Schematron's ARIA role rules", () => {
  beforeAll(xsdCachePresent);

  /**
   * Oracle: the pinned XSDs as text, read by regular expressions and no XML reader (spec reading
   * `schematron-intent`): RULE ARIA ROLE 1a's test, `count(@role)=0` on `//qti:source`, and RULE
   * ARIA ROLE 1b's, `count(@role)=0 or (count(@role)=1 and (@role='…' or …))` on `//qti:h1`.
   */
  const ariaRolesFromTheText = Effect.gen(function* ariaRolesFromTheText() {
    const fs = yield* FileSystem.FileSystem;
    const directory = yield* xsdDirectory;
    const { attributes } = yield* Effect.fromResult(composed());
    const byHandle = new Map(attributes.domains.map((domain) => [domain.handle, domain]));
    const rules = ariaRulesIn(yield* fs.readFileString(`${directory}/${ariaRuleSource}`));
    const heading = rules.get("h1") ?? "";
    const allowed = [...heading.matchAll(regex("@role='(?<role>[a-z]+)'", "gu"))].map(
      (found) => found.groups?.["role"] ?? "",
    );

    yield* agree(
      [
        ["RULE ARIA ROLE 1a's and 1b's elements", ["source", "h1"]],
        ["the rules read", [...rules.keys()]],
      ],
      setOf(structuralHash, exact),
    );
    assert.strictEqual(rules.get("source"), "count(@role)=0");
    assert.match(
      heading,
      regex.as(
        "^count\\(@role\\)=0 or \\(count\\(@role\\)=1 and \\(@role='[a-z]+'(?: or @role='[a-z]+')*\\)\\)$",
        "u",
      ),
    );
    assert.isTrue(
      Option.isNone(attributes.admission.lookup({ kind: "source", name: "role" })),
      "RULE ARIA ROLE 1a",
    );

    const row = Option.getOrThrow(attributes.admission.lookup({ kind: "h1", name: "role" }));
    const domain = byHandle.get(row.domain);
    const listed = attributeDeclarations.find(({ kind, name }) => kind === "h1" && name === "role");
    const roles = listed === undefined ? [] : enumerationOf(listed.domain);
    const wrong = roles.filter(
      (role) => domain === undefined || matches(domain, role) !== allowed.includes(role),
    );

    assert.isAbove(roles.length, 70);
    assert.deepStrictEqual(allowed.toSorted(), ["heading", "presentation", "tab"]);
    assert.deepStrictEqual(wrong, [], "RULE ARIA ROLE 1b");
  }).pipe(Effect.provide(NodeServices.layer));

  it.effect(
    "are what the composed grammar reads, from the ASI XSD's own text: no role on a source, and an h1's role the values the rule's test names, of those the XSD lists",
    () => ariaRolesFromTheText,
  );
});
