/**
 * A declaration's optional attributes, each written, unwritten or spelling nothing, held three
 * ways: the specification by hand (`expectedOf`), the law oracle's verdict, and the import's rows,
 * read for which rows exist and judged on the host by the schema's own statements.
 *
 * A value that may be missing is a row of its own relation, written only where it is (AGENTS.md,
 * Schema intent). Before, the import wrote `""` for an unwritten `base-type`, `mastery-value`,
 * `normal-minimum` and `normal-maximum`, `none` for an unwritten or unspelled field `base-type`,
 * and a record field whose unwritten `field-identifier` was `""`. So:
 *
 * - A value of a single variable that wrote `base-type` alone was refused under `derived`, its
 *   field's empty identifier, where no law refuses it: the attribute types nothing there (§7.46.2),
 *   so the value is admitted (the genetic differential's class 10; SV-LAW-01);
 * - Nothing proved an outcome range's `""` stood for an unwritten attribute (lane NIL's audit, B14);
 * - `E1_derived` and the reverse copy of a declaration's base type read `""` as "unwritten".
 *
 * Now no row copies a declaration's base type or a value's field or base type: each is its
 * attribute, read by a view or a query only where it is written and, for a code, spells one
 * (`#pantry/qti/names.ts`, `#pantry/qti/overlay-queries/declaration.ts`), read here as the views
 * read it; and `MasteryValue`, `NormalMinimum` and `NormalMaximum` are views of the doubles the
 * attributes name, each a row exactly where its attribute is written and names a double
 * (`#pantry/qti/names.ts`), but that a normal minimum unwritten in this box's 3.0.1 package is its
 * XSD default, `0.0` (spec reading 149, held by
 * `#pantry/test/normal-minimum-default.oracle.test.ts`), each pair of them their join. A record has
 * no base type, and no row copies a declaration's (B12; decision S3).
 *
 * The host reads a `Logic.when` term and `Text.parseDouble` (`#pantry/test/predicates.ts`), so
 * it judges `Mastery_range` over each pair's join, restated over the host's rows
 * (`#pantry/test/declaration-queries.ts`), and the database judges it too.
 */
import { NodeServices } from "@effect/platform-node";
import { assert, layer } from "@effect/vitest";
import { exhaust } from "@bjornpagen/testing/explore";
import { requiredInSpace } from "@bjornpagen/testing/features";
import { int } from "@bjornpagen/testing/gen";
import { searched } from "@bjornpagen/testing/vitest";
import { Array as Arr, Duration, Effect, Formatter, Option } from "effect";
import { grammar } from "#pantry/grammar/install.ts";
import { readProgram } from "#pantry/import/program.ts";
import type { PackageInputs } from "#pantry/import/write.ts";
import { Qti } from "#pantry/qti/schema.ts";
import { scopedPackage } from "#pantry/test/gen/every-relation.ts";
import type { PackageEntries } from "#pantry/test/gen/every-relation.ts";
import { previewRowsOf, judge as judgeHost, judgedLaws } from "#pantry/test/host-judge.ts";
import { filesOf } from "#pantry/test/oracle-complete/mutation.ts";
import { declarationQueryLawsOf, viewedDeclarationsOf } from "#pantry/test/declaration-queries.ts";
import { nodePlacesOf, placeKey } from "#pantry/test/places.ts";
import { judge, ruleOf, shownBreach } from "#pantry/test/oracle.ts";
import { lawTable } from "#pantry/vocab/laws.ts";
import type { LawName } from "#pantry/test/oracle.ts";
import { lawNameOf, rulesOf } from "#pantry/import/refusal.ts";
import { laws } from "#pantry/test/installed-laws.ts";
import { searchTimeout } from "#pantry/test/settings.ts";

/**
 * Every law the host judges, read once.
 */
const hostLaws = judgedLaws(Qti);

/**
 * The QTI 3 ASI namespace, of every item element.
 */
const asi = "http://www.imsglobal.org/xsd/imsqtiasi_v3p0";

/**
 * An attribute's state in a case: written as a value of its type, unwritten, or written as no value
 * of it.
 */
type Written = "spelled" | "unwritten" | "unspelled";

/**
 * The states every attribute of the box takes.
 */
const writtenStates = ["spelled", "unwritten", "unspelled"] as const satisfies readonly Written[];

/**
 * A declaration's own base type: a single or a record outcome, its `base-type` in one state.
 */
interface DeclarationCase {
  readonly baseType: Written;
  readonly cardinality: "record" | "single";
  readonly kind: "declaration";
}

/**
 * A value's field attributes: one `qti-value` of a single integer outcome's or a record outcome's
 * default, its `field-identifier` written or not, its `base-type` in one state, and its text an
 * integer or not.
 */
interface FieldCase {
  readonly baseType: Written;
  readonly cardinality: "record" | "single";
  readonly field: boolean;
  readonly kind: "field";
  readonly text: "1" | "x";
}

/**
 * An outcome's scale: each of its `mastery-value`, `normal-minimum` and `normal-maximum` unwritten,
 * written as a double in or out of order, or written as no double.
 */
interface ScaleCase {
  readonly kind: "scale";
  readonly mastery: string | undefined;
  readonly maximum: string | undefined;
  readonly minimum: string | undefined;
}

/**
 * One case of the box.
 */
type Case = DeclarationCase | FieldCase | ScaleCase;

/**
 * The scale texts: a mastery value of 1, a minimum of 0 (below it) or 2 (above it), a maximum of 3
 * (above it) or 0.5 (below it, and above normal-maximum's exclusive bound 0, reading 16), and `x`,
 * no double, each unwritten too.
 */
const scaleTexts = {
  mastery: ["1", "x", undefined],
  maximum: ["3", "0.5", "x", undefined],
  minimum: ["0", "2", "x", undefined],
} as const;

/**
 * Every case: 2 × 3 declarations, 2 × 2 × 3 × 2 values, and 3 × 4 × 4 scales, 78 in all.
 */
const cases: readonly Case[] = [
  ...(["single", "record"] as const).flatMap((cardinality) =>
    writtenStates.map((baseType): Case => ({ baseType, cardinality, kind: "declaration" })),
  ),
  ...(["single", "record"] as const).flatMap((cardinality) =>
    [true, false].flatMap((field) =>
      writtenStates.flatMap((baseType) =>
        (["1", "x"] as const).map((text): Case => ({
          baseType,
          cardinality,
          field,
          kind: "field",
          text,
        })),
      ),
    ),
  ),
  ...scaleTexts.mastery.flatMap((mastery) =>
    scaleTexts.minimum.flatMap((minimum) =>
      scaleTexts.maximum.map((maximum): Case => ({ kind: "scale", mastery, maximum, minimum })),
    ),
  ),
];

/**
 * A `base-type` as a state writes it: an attribute spelling the type, none, or the type with a
 * space before it, which the preserving enumeration spells nothing as (spec reading 7).
 *
 * @param state - The state.
 * @param spelled - The type it spells.
 * @returns The attribute's text, with its leading space, or nothing.
 */
const baseTypeAttribute = (state: Written, spelled: string): string =>
  ({ spelled: ` base-type="${spelled}"`, unspelled: ` base-type=" ${spelled}"`, unwritten: "" })[
    state
  ];

/**
 * An optional attribute's text.
 *
 * @param name - Its name.
 * @param value - Its value, none where unwritten.
 * @returns Its text, with its leading space, or nothing.
 */
const optional = (name: string, value: string | undefined): string =>
  value === undefined ? "" : ` ${name}="${value}"`;

/**
 * Write a case's declaration, the item's one.
 *
 * @param drawn - The case.
 * @returns The declaration's XML.
 */
const declarationOf = (drawn: Case): string => {
  switch (drawn.kind) {
    case "declaration": {
      return `<qti-outcome-declaration identifier="O" cardinality="${drawn.cardinality}"${baseTypeAttribute(drawn.baseType, "float")}/>`;
    }
    case "field": {
      const own = drawn.cardinality === "record" ? "" : ' base-type="integer"';

      return `<qti-outcome-declaration identifier="O" cardinality="${drawn.cardinality}"${own}><qti-default-value><qti-value${optional("field-identifier", drawn.field ? "f" : undefined)}${baseTypeAttribute(drawn.baseType, "integer")}>${drawn.text}</qti-value></qti-default-value></qti-outcome-declaration>`;
    }
    case "scale": {
      return `<qti-outcome-declaration identifier="O" cardinality="single" base-type="float"${optional("mastery-value", drawn.mastery)}${optional("normal-minimum", drawn.minimum)}${optional("normal-maximum", drawn.maximum)}/>`;
    }
    default: {
      return drawn satisfies never;
    }
  }
};

/**
 * Write a case's package: an item holding its declaration, and the manifest that lists it, each
 * file's text encoded as UTF-8.
 *
 * @param drawn - The case.
 * @returns The package's entries.
 */
const packageOf = (drawn: Case): PackageEntries =>
  new Map(
    Object.entries({
      "imsmanifest.xml": `<manifest xmlns="http://www.imsglobal.org/xsd/qti/qtiv3p0/imscp_v1p1" identifier="M"><metadata><schema>QTI Package</schema><schemaversion>3.0.1</schemaversion></metadata><organizations/><resources><resource identifier="I" type="imsqti_item_xmlv3p0" href="item.xml"><file href="item.xml"/></resource></resources></manifest>`,
      "item.xml": `<qti-assessment-item xmlns="${asi}" identifier="item" title="Item" time-dependent="false">${declarationOf(drawn)}<qti-item-body><p>Hi</p></qti-item-body></qti-assessment-item>`,
    }).map(([path, text]) => [path, new TextEncoder().encode(text)] as const),
  );

/**
 * The normal minimum of a scale case that writes none: QTI 3.0.1's XSD default (information model
 * §4.5.8: "Default = "0.0""; spec reading 149).
 */
const minimumDefault = "0.0";

/**
 * A scale case's normal minimum: the one it writes, or else {@link minimumDefault}.
 *
 * @param drawn - The case.
 * @returns The minimum's lexical form.
 */
const minimumOf = (drawn: ScaleCase): string => drawn.minimum ?? minimumDefault;

/**
 * Whether a scale text is a double, the language `Mastery_range` orders: every text of the box but
 * `x`.
 *
 * @param text - The text, none where unwritten.
 * @returns Its value, none where it is unwritten or no double.
 */
const doubleOf = (text: string | undefined): Option.Option<number> =>
  text === undefined || text === "x" ? Option.none() : Option.some(Number(text));

/**
 * Whether two scale attributes are written as doubles out of order.
 *
 * @param low - The one that must not be above.
 * @param high - The one that must not be below.
 * @returns Whether both are doubles and the first is above the second.
 */
const disordered = (low: string | undefined, high: string | undefined): boolean =>
  Option.match(Option.all([doubleOf(low), doubleOf(high)]), {
    onNone: () => false,
    onSome: ([l, h]) => l > h,
  });

/**
 * The laws a case breaks, by the specification:
 *
 * - **a declaration's base type** (information model tables 4.5.3: "Variables with record cardinality
 *   have no base-type", and every other variable's value space "is identified with a base-type"): a
 *   record that writes one and a single that writes none break Declaration base type; one spelling
 *   nothing breaks its value domain alone, since a preserving enumeration's padded form is no value
 *   (XML Schema 1.1 Part 2 §4.3.6; lane NIL's audit, B11);
 * - **a value's field attributes** (§8.16, record: "a set of independent values each identified by
 *   its own identifier and having its own base-type"; §7.46.1 and §7.46.2: each "is only used for"
 *   a value "that forms part of a record"): a record's value must write both, or it breaks Value
 *   cardinality, where an attribute written counts as written whatever it spells, and any other
 *   set's value may write either, which names and types nothing there (SV-LAW-01); a base type
 *   spelling nothing breaks its value domain; the text breaks Typed value where it is no integer
 *   and the type it is read in, the set's, or a record's field's own where that spells one, is
 *   integer;
 * - **an outcome's scale** (reading 9: the Schematron's OUTCOMEDEC 1, each pair judged where both
 *   have a value, as `xs:double` values): a written mastery value below the minimum, written or
 *   3.0.1's default (reading 149), or above a written maximum breaks Mastery range; a text that is
 *   no double breaks its value domain.
 *
 * @param drawn - The case.
 * @returns The laws, empty where the case is lawful.
 */
const expectedOf = (drawn: Case): ReadonlySet<LawName> => {
  switch (drawn.kind) {
    case "declaration": {
      if (drawn.baseType === "unspelled") {
        return new Set(["value domain"]);
      }

      return (drawn.cardinality === "record") === (drawn.baseType === "spelled")
        ? new Set(["Declaration base type"])
        : new Set();
    }
    case "field": {
      const record = drawn.cardinality === "record";
      const baseWritten = drawn.baseType !== "unwritten";
      const counted = !record || (drawn.field && baseWritten);
      const typed = record ? drawn.baseType === "spelled" : true;

      return new Set<LawName>([
        ...(counted ? [] : ["Value cardinality" as const]),
        ...(drawn.baseType === "unspelled" ? ["value domain" as const] : []),
        ...(typed && drawn.text === "x" ? ["Typed value" as const] : []),
      ]);
    }
    case "scale": {
      const texts = [drawn.mastery, drawn.minimum, drawn.maximum];

      return new Set<LawName>([
        ...(texts.includes("x") ? ["value domain" as const] : []),
        ...(disordered(minimumOf(drawn), drawn.mastery) || disordered(drawn.mastery, drawn.maximum)
          ? ["Mastery range" as const]
          : []),
      ]);
    }
    default: {
      return drawn satisfies never;
    }
  }
};

/**
 * The row a written scale attribute has, as a list of its fields, none where unwritten.
 *
 * @param value - The attribute's lexical form, none where unwritten.
 * @returns The rows' fields.
 */
const scaleRow = (value: string | undefined): readonly (readonly string[])[] =>
  value === undefined ? [] : [[value]];

/**
 * Hold a case's rows to what its declaration writes: each optional attribute's row, or its view's,
 * exists exactly where the attributes it reads are written (and, for a base type's code, spell
 * one), holding them as written, and the declaration keeps its cardinality whatever its base type
 * spells (spec reading 158).
 *
 * @param drawn - The case.
 * @param inputs - The import's rows.
 * @param label - The case, for a failure's message.
 */
const assertRows = (drawn: Case, inputs: PackageInputs, label: string): void => {
  switch (drawn.kind) {
    case "declaration": {
      const viewed = viewedDeclarationsOf(inputs);
      assert.deepStrictEqual(
        viewed.flatMap(({ baseType }) => (baseType === undefined ? [] : [baseType])),
        drawn.baseType === "spelled" ? ["float"] : [],
        `${label}: DeclarationBaseType`,
      );
      assert.strictEqual(viewed.length, 1, `${label}: one declaration`);
      assert.deepStrictEqual(
        viewed.flatMap(({ cardinality }) => (cardinality === undefined ? [] : [cardinality])),
        [drawn.cardinality],
        `${label}: DeclarationCardinality`,
      );
      break;
    }
    case "field": {
      // A field is its value's two attributes as written, each read by a query where it stands.
      const places = nodePlacesOf(inputs);
      const valueAttributes = (name: string) =>
        [...inputs.Attribute.values()].flatMap((attribute) =>
          attribute.name === name &&
          places.get(placeKey(attribute.path, attribute.start))?.kind === "qti-value"
            ? [attribute.lexical]
            : [],
        );
      assert.deepStrictEqual(
        valueAttributes("field-identifier"),
        drawn.field ? ["f"] : [],
        `${label}: the field's identifier`,
      );
      assert.deepStrictEqual(
        valueAttributes("base-type").filter((lexical) => lexical === "integer"),
        drawn.baseType === "spelled" ? ["integer"] : [],
        `${label}: the value's own base type`,
      );
      break;
    }
    case "scale": {
      // A scale is its declaration's three attributes as written, each read by a view where it
      // stands (`MasteryValue`, `NormalMinimum`, `NormalMaximum` of `#pantry/qti/names.ts`).
      const scaleAttributes = (name: string) =>
        [...inputs.Attribute.values()].flatMap((attribute) =>
          attribute.name === name ? [[attribute.lexical]] : [],
        );
      assert.deepStrictEqual(
        scaleAttributes("mastery-value"),
        scaleRow(drawn.mastery),
        `${label}: mastery-value`,
      );
      assert.deepStrictEqual(
        scaleAttributes("normal-minimum"),
        scaleRow(drawn.minimum),
        `${label}: normal-minimum`,
      );
      assert.deepStrictEqual(
        scaleAttributes("normal-maximum"),
        scaleRow(drawn.maximum),
        `${label}: normal-maximum`,
      );
      break;
    }
    default: {
      drawn satisfies never;
    }
  }
};

/**
 * Name the situation a case's laws reach: none broken, one, or several.
 *
 * @param expected - The laws.
 * @returns The situation.
 */
const reachedBy = (expected: ReadonlySet<LawName>): Situation => {
  if (expected.size === 0) {
    return "accepted";
  }

  return expected.size === 1 ? "alone" : "several";
};

/**
 * A situation the box must reach.
 */
type Situation = "accepted" | "alone" | "pair" | "several";

/**
 * A part of the box, which one search exhausts: a declaration's base type; a value's field
 * attributes under a single or a record set; or an outcome's scale, by its mastery value.
 */
type Part =
  | "declaration"
  | "field under a single set"
  | "field under a record set"
  | "scale with a mastery value of 1"
  | "scale with a mastery value of x"
  | "scale with no mastery value";

/**
 * Name the part of the box a case is in.
 *
 * @param drawn - The case.
 * @returns Its part.
 */
const partOf = (drawn: Case): Part => {
  switch (drawn.kind) {
    case "declaration": {
      return "declaration";
    }
    case "field": {
      return drawn.cardinality === "single"
        ? "field under a single set"
        : "field under a record set";
    }
    case "scale": {
      if (drawn.mastery === undefined) {
        return "scale with no mastery value";
      }

      return drawn.mastery === "1"
        ? "scale with a mastery value of 1"
        : "scale with a mastery value of x";
    }
    default: {
      return drawn satisfies never;
    }
  }
};

/**
 * The parts of the box, each searched as its own case.
 */
const parts: readonly Part[] = [
  "declaration",
  "field under a single set",
  "field under a record set",
  "scale with a mastery value of 1",
  "scale with a mastery value of x",
  "scale with no mastery value",
];

/**
 * The situations a part's search must reach, so the searches together require every situation the
 * whole box did: a declaration's base type and a scale with no mastery value reach an accepted case
 * and a case of one law; a value's field attributes several laws too; a scale with a mastery value
 * of 1 every situation; and one of `x`, which is no double, a case of one law alone, and a mastery
 * value beside the normal range ("pair"), as every written mastery value is.
 *
 * @param part - The part.
 * @returns The situations.
 */
const situationsAt = (part: Part): Arr.NonEmptyReadonlyArray<Situation> => {
  switch (part) {
    case "declaration":
    case "scale with no mastery value": {
      return ["accepted", "alone"];
    }
    case "field under a single set":
    case "field under a record set": {
      return ["accepted", "alone", "several"];
    }
    case "scale with a mastery value of 1": {
      return ["accepted", "alone", "several", "pair"];
    }
    case "scale with a mastery value of x": {
      return ["alone", "pair"];
    }
    default: {
      return part satisfies never;
    }
  }
};

layer(NodeServices.layer, { excludeTestServices: true })(
  "a declaration's optional attributes have a row exactly where written, and the law oracle, the import's rows and the specification give one verdict",
  (it) => {
    for (const part of parts) {
      const ofPart = cases.filter((held) => partOf(held) === part);

      it.effect(
        `over a ${part}`,
        (ctx) =>
          // Oracle: the specification as a checker by hand (`expectedOf`): the information model's
          // tables 4.5.3 and 7.46.1 to 7.46.2, XML Schema 1.1 Part 2 §4.3.6, and reading 9. Bound:
          // a single or a record declaration's base type in 3 states, a value's field identifier in
          // 2 and its base type in 3 under a single or a record set with an integer text or not, and
          // an outcome's mastery value, normal minimum and normal maximum each unwritten, in order,
          // out of order or no double: 78 packages, exhausted, one part of the box to a case.
          searched(
            ctx,
            exhaust(
              {
                box: `a ${part}, each attribute written, unwritten or spelling nothing`,
                caseHang: Duration.minutes(2),
                concurrency: 1,
                coverage: requiredInSpace<Situation>(situationsAt(part)),
                generator: int(0, ofPart.length - 1),
                literal: (at) => Formatter.format(ofPart[at]),
                oracle: {
                  kind: "specification",
                  name: "the information model's base-type, field and scale characteristics, by hand",
                },
                suite: `test/unwritten-declaration-attributes/${part.replaceAll(" ", "-")}`,
              },
              (at, c) =>
                Effect.scoped(
                  Effect.gen(function* oneCase() {
                    const drawn = ofPart[at];
                    assert.isDefined(drawn, `no case ${String(at)}`);
                    if (drawn === undefined) {
                      return;
                    }

                    const label = Formatter.format(drawn);
                    const expected = expectedOf(drawn);
                    c.note(reachedBy(expected));
                    if (drawn.kind === "scale" && drawn.mastery !== undefined) {
                      c.note("pair");
                    }

                    const entries = packageOf(drawn);
                    const judgment = yield* judge(filesOf(entries), grammar, laws);
                    assert.strictEqual(judgment._tag, "Judged", `${label}: the codec refuses it`);

                    const breaches = judgment._tag === "Judged" ? judgment.breaches : [];
                    assert.deepStrictEqual(
                      [...new Set(breaches.map(({ law }) => law))].toSorted(),
                      [...expected].toSorted(),
                      `${label}: the law oracle:\n${breaches.map((breach) => `  ${shownBreach(breach, grammar)}`).join("\n")}`,
                    );

                    const { inputs } = yield* readProgram(yield* scopedPackage(entries), "scoped");
                    assertRows(drawn, inputs, label);

                    // The host judges every law, and its refusal is named by the rule the catalog's
                    // precedence puts first, as the database's is. A declaration whose base type
                    // spells nothing has no base type alone, so its value domain is the one law it
                    // breaks (spec reading 158).
                    const rows = previewRowsOf(inputs);
                    const { broken } = judgeHost(rows, hostLaws);
                    // The declaration and mapping overlays' rules over a query are the database's alone,
                    // restated here.
                    const queried = declarationQueryLawsOf(rows);
                    const brokenNames = [
                      ...broken.map(({ law }) =>
                        Option.getOrElse(lawNameOf(law), () => Formatter.format(law)),
                      ),
                      ...queried,
                    ];
                    const shown =
                      broken.map(({ law }) => Formatter.format(law)).join("; ") || "no law";
                    assert.sameMembers(
                      [...new Set(brokenNames)],
                      [...expected],
                      `${label}: the import's rows break ${shown}`,
                    );

                    const brokenLaws = broken.map(({ law }) => law);
                    const rule = Arr.isReadonlyArrayNonEmpty(brokenLaws)
                      ? Arr.head(rulesOf(brokenLaws))
                      : Option.map(Arr.head(queried), (name) => lawTable[name].rule);
                    const rules = [...expected].map((law) => ruleOf(law));

                    assert.isTrue(
                      Option.match(rule, {
                        onNone: () => expected.size === 0,
                        onSome: (named) => rules.includes(named),
                      }),
                      `${label}: the import's refusal names ${Option.getOrElse(rule, () => "none")}, the specification ${rules.join(", ") || "none"}`,
                    );
                  }),
                ),
            ),
          ),
        searchTimeout,
      );
    }
  },
);
