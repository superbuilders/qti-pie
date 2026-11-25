/**
 * The metadata overlays' free tests: a statistic's `lastUpdated` domain admits exactly the days of
 * the calendar, which AL1 alone judges, and over every learning resource type of a small box the
 * law refuses exactly what QTI 3.0 Metadata §2.7.5.1 forbids (spec reading 122).
 *
 * `#pantry/qti/attribute-views.db.test.ts` reads a usage value's typed view.
 */
import { date, lexicalForm } from "@bjornpagen/grizzle";
import * as NodeServices from "@effect/platform-node/NodeServices";
import { assert, describe, it } from "@effect/vitest";
import { exhaust } from "@bjornpagen/testing/explore";
import { requiredInSpace } from "@bjornpagen/testing/features";
import { element } from "@bjornpagen/testing/gen";
import type { Gen } from "@bjornpagen/testing/gen";
import { searched } from "@bjornpagen/testing/vitest";
import { Array as Arr, Duration, Effect, Option } from "effect";
import { readXml } from "@qti-pie/crust/read.ts";
import { patternFlags } from "#pantry/grammar/domains.ts";
import { attributeRows, BaseType, grammar, ValueDomainOf } from "#pantry/grammar/install.ts";
import { piecesOf } from "#pantry/import/pieces.ts";
import { foldGrammarOf, shredGrammarOf } from "#pantry/model/composed.ts";
import { fold } from "#pantry/model/folds.ts";
import { shred } from "#pantry/model/shred.ts";
import { BaseTypePattern, unjudgedBaseTypes } from "#pantry/qti/expression-types.ts";
import { readEntries } from "#pantry/package/read.ts";
import { materialize } from "#pantry/test/fixtures.ts";
import type { FixtureName } from "#pantry/test/fixtures.ts";
import {
  databaseRefusals,
  documentRowsOf,
  readText,
  termXml,
  typeRefused,
} from "#pantry/test/gen/lom-resource-type.ts";
import type { TermSketch, TypeSketch } from "#pantry/test/gen/lom-resource-type.ts";
import { documentBreaches, judge, typedTextHolds } from "#pantry/test/oracle.ts";
import { statisticKinds } from "#pantry/vocab/terms/metadata.ts";
import { searchWidth } from "#pantry/test/settings.ts";
import { laws } from "#pantry/test/installed-laws.ts";

/**
 * Collapse a text as XML Schema's `collapse` whitespace class does: each tab, line feed and
 * carriage return a space, then each run of spaces one, then the outer one removed.
 *
 * @param text - The text.
 * @returns Its collapsed value.
 * @see {@link https://www.w3.org/TR/xmlschema-2/#rf-whiteSpace | XML Schema Part 2, whiteSpace}
 */
const collapse = (text: string): string =>
  text
    .replaceAll(/[\t\n\r]/gu, " ")
    .replaceAll(/ +/gu, " ")
    .replace(/^ /u, "")
    .replace(/ $/u, "");

/**
 * `DateDType`'s pattern as the grammar compiles it, read as a JavaScript host reads it: the domain
 * every statistic's `lastUpdated` is in.
 */
const dateDomains = [
  ...new Set(
    attributeRows
      .filter(
        ({ governor, name }) =>
          name === "lastUpdated" && statisticKinds.some((kind) => kind === governor),
      )
      .map(({ domain }) => domain),
  ),
].map(
  (domain) =>
    new RegExp(
      Option.getOrThrow(
        Option.fromNullishOr(ValueDomainOf.rows.find((row) => row.domain === domain)?.pattern),
      ),
      patternFlags,
    ),
);

/**
 * Grizzle's lexical form of `date`, the proleptic Gregorian days 0001-01-01 to 9999-12-31, as a
 * host reads it.
 */
const dateForm = new RegExp(lexicalForm(date).source, "u");

/**
 * One `lastUpdated` of the calendar box: a year, a month, a day and the whitespace around them.
 */
interface DateCase {
  readonly day: string;
  readonly month: string;
  readonly pad: string;
  readonly year: string;
}

/**
 * The years of the calendar box: none, the first, a common century, a leap century, a leap year, a
 * common year and the last, plus a five-digit year `DateDType`'s pattern facet refuses.
 */
const years = ["0000", "0001", "1900", "2000", "2024", "2023", "9999", "10000"] as const;

/**
 * The two-digit numerals from `00` up to, not including, a count: the box's months and days.
 *
 * @param count - How many numerals.
 * @returns `00`, `01` and so on, `00` first.
 */
const numerals = (count: number): readonly ["00", ...string[]] => [
  "00",
  ...Array.from({ length: count - 1 }, (_, at) => String(at + 1).padStart(2, "0")),
];

/**
 * The months of the calendar box, `00` to `13`.
 */
const months = element(numerals(14));

/**
 * The days of the calendar box, `00` to `32`.
 */
const days = element(numerals(33));

/**
 * The whitespace around a `lastUpdated` in the calendar box.
 */
const pads = element(["", " ", "\t\n"]);

/**
 * Every `lastUpdated` of the calendar box.
 *
 * @param source - The choice source.
 * @returns One case.
 */
const dateCases: Gen<DateCase> = (source) => ({
  day: days(source),
  month: months(source),
  pad: pads(source),
  year: element(years)(source),
});

/**
 * A situation the calendar box must reach: a day the calendar holds, a leap day, a day it does not,
 * and a form the facet refuses.
 */
type DateSituation = "valid" | "leap day" | "not a day" | "not the form";

describe("a statistic's lastUpdated, the calendar AL1 judges", () => {
  it.effect(
    "admits exactly DateDType's values: a day is lexicalForm(date) between whitespace",
    (ctx) =>
      // Oracle: a second implementation, the grammar's compiled `DateDType` domain (`ValueDomainOf`,
      // XML Schema Part 2's Gregorian calendar with its 0000 refused, compiled by the domain
      // deriver), against grizzle's `lexicalForm(date)`, a calendar of its own.
      // Bound: every year of 8, month 00 to 13, day 00 to 32 and padding of 3, 11,088.
      searched(
        ctx,
        exhaust(
          {
            box: "8 years, months 00 to 13, days 00 to 32, 3 paddings",
            caseHang: Duration.seconds(30),
            concurrency: searchWidth,
            coverage: requiredInSpace<DateSituation>([
              "valid",
              "leap day",
              "not a day",
              "not the form",
            ]),
            generator: dateCases,
            literal: (value) => JSON.stringify(value),
            oracle: {
              kind: "second-implementation",
              name: "the grammar's compiled DateDType domain against grizzle's lexicalForm(date)",
            },
            suite: "qti/metadata-calendar",
          },
          ({ day, month, pad, year }, c) =>
            Effect.sync(() => {
              const lexical = `${pad}${year}-${month}-${day}${pad}`;
              const pieces = piecesOf(lexical);
              const typed = dateForm.test(pieces.value);
              const domains = dateDomains.map((domain) => domain.test(lexical));
              if (year.length !== 4) {
                c.note("not the form");
              } else if (typed) {
                c.note(month === "02" && day === "29" ? "leap day" : "valid");
              } else {
                c.note("not a day");
              }

              assert.isNotEmpty(dateDomains);
              for (const admitted of domains) {
                assert.strictEqual(admitted, typed, lexical);
              }
            }),
        ),
      ),
  );
});

/**
 * The cores of the usage-value box's texts: an empty text, the boolean, integer, double and
 * identifier forms and near misses of each, two-item forms with one or two whitespace characters
 * between, and URI forms.
 */
const usageCores = [
  "",
  "true",
  "false",
  "1",
  "0",
  "+3",
  "-7",
  "0.87",
  "1e3",
  ".5",
  "INF",
  "-INF",
  "NaN",
  "A",
  "a.b",
  "_x",
  "1a",
  "a b",
  "a  b",
  "1 2",
  "1\t2",
  "1  2",
  "http://x/y",
  "a:b",
  "%zz",
  "true false",
] as const;

/**
 * The paddings the usage-value box writes on each side of a core.
 */
const usagePads = ["", " ", "\t", "\n "] as const;

/**
 * One case of the usage-value box: a base type, and a core padded on each side.
 */
interface UsageTextCase {
  readonly baseType: (typeof BaseType.handles)[number];
  readonly core: (typeof usageCores)[number];
  readonly lead: (typeof usagePads)[number];
  readonly trail: (typeof usagePads)[number];
}

/**
 * The usage-value box: every base type a usage value's `baseType` spells, by every core, by every
 * padding on each side.
 */
const usageTextCases: Gen<UsageTextCase> = (source) => ({
  baseType: source.draw(element(BaseType.handles)),
  core: source.draw(element(usageCores)),
  lead: source.draw(element(usagePads)),
  trail: source.draw(element(usagePads)),
});

/**
 * A situation the usage-value box must reach: a judged base type's text admitted and refused, and
 * an unjudged one's.
 */
type UsageTextSituation = "admitted" | "refused" | "unjudged";

/**
 * Name a usage-value case's situation, for the box's coverage.
 *
 * @param unjudged - Whether its base type is one every text is a value of.
 * @param admitted - Whether the law admits its text.
 * @returns Its situation.
 */
const usageTextSituation = (unjudged: boolean, admitted: boolean): UsageTextSituation => {
  if (unjudged) {
    return "unjudged";
  }

  return admitted ? "admitted" : "refused";
};

describe("qti/metadata.ts, the usage typed value", () => {
  it.effect(
    "judges a usage value's text as the law oracle reads a typed value written as element content",
    (ctx) =>
      // Oracle: a second implementation, the law oracle's `typedTextHolds` (reading 7's trimmed
      // element text over each base type's exact form, built from the XSD built-ins), against
      // `Usage_typed_value`'s language: `unjudgedBaseTypes`, or `BaseTypePattern`'s pattern of the
      // base type as PostgreSQL's regex reads it.
      // Bound: 11 base types by 26 cores by 4 paddings on each side, 4,576.
      searched(
        ctx,
        exhaust(
          {
            box: "11 base types, 26 cores, 4 paddings before and after",
            caseHang: Duration.seconds(30),
            concurrency: searchWidth,
            coverage: requiredInSpace<UsageTextSituation>(["admitted", "refused", "unjudged"]),
            generator: usageTextCases,
            literal: (value) => JSON.stringify(value),
            oracle: {
              kind: "second-implementation",
              name: "the law oracle's typedTextHolds against BaseTypePattern",
            },
            suite: "qti/metadata-usage-typed-value",
          },
          ({ baseType, core, lead, trail }, c) =>
            Effect.sync(() => {
              const text = `${lead}${core}${trail}`;
              const pattern = BaseTypePattern.rows.find(
                (row) => row.baseType === baseType,
              )?.pattern;
              assert.isDefined(pattern, baseType);

              const unjudged = unjudgedBaseTypes.some((handle) => handle === baseType);
              const admitted = unjudged || new RegExp(pattern ?? "", patternFlags).test(text);
              c.note(usageTextSituation(unjudged, admitted));

              assert.strictEqual(admitted, typedTextHolds(baseType, text), `${baseType} ${text}`);
            }),
        ),
      ),
  );
});

describe("qti/metadata.ts, the usage typed value by the law oracle", () => {
  it.effect("breaks Usage typed value on no usage-data fixture the importer accepts", () =>
    // Oracle: the specification as a checker, reading 105: a `ud:value` that writes `baseType`
    // and no `fieldIdentifier` is untyped text, so `usage3-integer-float` (`0.87` under integer,
    // outside a record) is accepted, as the oracle judges it.
    // Bound: `usage3-integer-float`, `usage3` (no value writes a baseType), `usage3-typed` (24 typed values outside a
    // record) and `usage3-float-padded` (a padded float outside a record).
    Effect.gen(function* usageOracle() {
      for (const [name, breaks] of [
        ["usage3", 0],
        ["usage3-integer-float", 0],
        ["usage3-typed", 0],
        ["usage3-float-padded", 0],
      ] as const satisfies readonly (readonly [FixtureName, number])[]) {
        const judgment = yield* judge(yield* readEntries(yield* materialize(name)), grammar, laws);
        assert.strictEqual(judgment._tag, "Judged", name);

        const found =
          judgment._tag === "Judged"
            ? judgment.breaches.filter(({ law }) => law === "Usage typed value")
            : [];
        assert.lengthOf(found, breaks, name);
      }
    }).pipe(Effect.provide(NodeServices.layer)),
  );
});

/**
 * The sources of the learning resource type box: none, the empty source, one of whitespace alone,
 * `LOMv1.0` bare and padded, another vocabulary, and two near misses of `LOMv1.0`.
 */
const boxSources = [
  Option.none<string>(),
  Option.some(""),
  Option.some(" "),
  Option.some("LOMv1.0"),
  Option.some(" LOMv1.0\n"),
  Option.some("MyVocab"),
  Option.some("lomv1.0"),
  Option.some("LOMv1.0x"),
] as const;

/**
 * The values of the learning resource type box: none, the two forbidden values bare, padded and
 * with their inner space doubled, the empty value, the value the binding advises, and near misses
 * of the forbidden ones: another case, a hyphen and a repetition.
 */
const boxValues = [
  Option.none<string>(),
  Option.some("exam"),
  Option.some("\texam "),
  Option.some(" self  assessment "),
  Option.some("self assessment"),
  Option.some(""),
  Option.some("exercise"),
  Option.some("Exam"),
  Option.some("self-assessment"),
  Option.some("exam exam"),
] as const;

/**
 * One case of the learning resource type box.
 */
interface ResourceTypeCase {
  readonly order: TypeSketch["order"];
  readonly source: Option.Option<string>;
  readonly value: Option.Option<string>;
}

/**
 * Every case of the box: each source, by each value, by each order of the two.
 */
const resourceTypeCases: readonly [ResourceTypeCase, ...ResourceTypeCase[]] = (() => {
  const cases = boxSources.flatMap((source) =>
    boxValues.flatMap((value) =>
      (["value first", "source first"] as const).map((order): ResourceTypeCase => ({
        order,
        source,
        value,
      })),
    ),
  );
  if (!Arr.isReadonlyArrayNonEmpty(cases)) {
    throw new Error("The learning resource type box holds no case. Give it a source and a value.");
  }

  return cases;
})();

/**
 * A term of the box, written once and plain.
 *
 * @param text - Its text.
 * @returns The term.
 */
const plainTerm = (text: string): TermSketch => ({ copies: 1, spelling: "plain", text });

/**
 * Write the manifest of one box case: an item resource whose LOM record holds the case's one
 * learning resource type.
 *
 * @param type - The type.
 * @returns The manifest's text.
 */
const resourceTypeManifest = (type: TypeSketch): string => {
  const terms =
    type.order === "value first"
      ? `${termXml("value", type.value)}${termXml("source", type.source)}`
      : `${termXml("source", type.source)}${termXml("value", type.value)}`;

  return `<manifest xmlns="http://www.imsglobal.org/xsd/qti/qtiv3p0/imscp_v1p1" identifier="M"><metadata><schema>QTI Package</schema><schemaversion>3.0.1</schemaversion></metadata><organizations/><resources><resource identifier="R" type="imsqti_item_xmlv3p0" href="item.xml"><metadata><imsmd:lom xmlns:imsmd="http://ltsc.ieee.org/xsd/LOM"><imsmd:educational><imsmd:learningResourceType>${terms}</imsmd:learningResourceType></imsmd:educational></imsmd:lom></metadata><file href="item.xml"/></resource></resources></manifest>`;
};

/**
 * A situation the learning resource type box must reach.
 */
type ResourceTypeSituation =
  | "refused, no source"
  | "refused, empty source"
  | "refused, LOMv1.0"
  | "accepted, another vocabulary"
  | "accepted, an allowed value"
  | "accepted, no value";

/**
 * Name a box case's situation, for the box's coverage.
 *
 * @param type - The case's type.
 * @param refused - Whether the specification refuses it.
 * @returns Its situation.
 */
const resourceTypeSituation = (type: TypeSketch, refused: boolean): ResourceTypeSituation => {
  const source = type.source.pipe(Option.map((term) => collapse(term.text)));
  if (refused) {
    return Option.match(source, {
      onNone: () => "refused, no source",
      onSome: (text) => (text === "" ? "refused, empty source" : "refused, LOMv1.0"),
    });
  }

  if (Option.isNone(type.value)) {
    return "accepted, no value";
  }

  return typeRefused({ ...type, source: Option.none() })
    ? "accepted, another vocabulary"
    : "accepted, an allowed value";
};

describe("qti/metadata.ts, the learning resource type", () => {
  it.effect(
    "refuses exactly the types of the LOM vocabulary whose value is exam or self assessment, as the specification, the database's laws over the rows and the law oracle each read them",
    (ctx) =>
      // Oracle: three at once. The specification as a checker, QTI 3.0 Metadata §2.7.5.1 over the
      // case (`typeRefused`, written apart from the module's constants): a value collapsing to
      // `exam` or `self assessment` under the LOM vocabulary, its source `LOMv1.0`, empty or not
      // written (the binding's default, line 1288). A second implementation, the law oracle's
      // `LOM learning resource type` over the folded manifest. And the database's statements
      // restated over the tree's insert (`databaseRefusals`): each term's string value is the one
      // the database folds from its children's `chars`, and the law's containment over those
      // folded terms refuses exactly the types the specification refuses.
      // Bound: 8 sources by 10 values by 2 orders, 160 cases.
      searched(
        ctx,
        exhaust(
          {
            box: "8 sources (none, empty, blank, LOMv1.0 bare and padded, MyVocab, lomv1.0, LOMv1.0x) by 10 values (none, exam, padded exam, self  assessment padded, self assessment, empty, exercise, Exam, self-assessment, exam exam) by 2 orders",
            caseHang: Duration.seconds(30),
            concurrency: 1,
            coverage: requiredInSpace<ResourceTypeSituation>([
              "refused, no source",
              "refused, empty source",
              "refused, LOMv1.0",
              "accepted, another vocabulary",
              "accepted, an allowed value",
              "accepted, no value",
            ]),
            generator: element(resourceTypeCases),
            literal: (value: ResourceTypeCase) => JSON.stringify(value),
            oracle: {
              kind: "specification",
              name: "QTI 3.0 Metadata §2.7.5.1 over the case, against the law oracle and the database's statements over the rows",
            },
            suite: "qti/metadata-learning-resource-type",
          },
          ({ order, source, value }: ResourceTypeCase, c) =>
            Effect.gen(function* resourceType() {
              const type: TypeSketch = {
                foreign: false,
                order,
                source: source.pipe(Option.map(plainTerm)),
                value: value.pipe(Option.map(plainTerm)),
              };
              const refused = typeRefused(type);
              c.note(resourceTypeSituation(type, refused));

              const xml = resourceTypeManifest(type);
              const document = yield* Effect.orDie(readXml(new TextEncoder().encode(xml)));
              const tree = yield* Effect.orDie(shred(document, shredGrammarOf(grammar)));
              const rows = documentRowsOf(tree);
              const refusedTypes = databaseRefusals(rows);
              const folded = yield* Effect.orDie(
                Effect.fromResult(fold(tree, foldGrammarOf(grammar))),
              );
              const oracle = documentBreaches("imsmanifest.xml", folded, laws).filter(
                ({ law }) => law === "LOM learning resource type",
              );

              assert.strictEqual(refusedTypes.size, refused ? 1 : 0, xml);
              assert.lengthOf(oracle, refused ? 1 : 0, xml);
              assert.deepStrictEqual(
                rows.terms
                  .filter(({ kind }) => kind === "lom:value")
                  .map(({ stringValue }) => stringValue),
                Option.toArray(type.value).map((term) => readText(term)),
                xml,
              );
              assert.deepStrictEqual(
                rows.terms
                  .filter(({ kind }) => kind === "lom:source")
                  .map(({ stringValue }) => stringValue),
                Option.toArray(type.source).map((term) => readText(term)),
                xml,
              );
            }),
        ),
      ),
  );
});
