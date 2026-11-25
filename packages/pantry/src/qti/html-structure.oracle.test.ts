/**
 * Four rules of the information model the XSD does not state, each refused where it is broken and
 * admitted beside it (spec readings 238 to 241):
 *
 * - **250:** a `col`'s and a `colgroup`'s `span` is "a valid non-negative integer greater than zero"
 *   (§5.31, §5.32), where the XSD's `xs:int` admits 0 and negatives;
 * - **251:** "If a table directly contains a col then it must not contain any colgroup elements"
 *   (§5.142.3) and "If a table contains a colgroup it must not directly contain any col elements"
 *   (§5.142.4), where the XSD's sequence admits `col`s then `colgroup`s;
 * - **252:** a `figure`'s `figcaption` has multiplicity [0..1] (§5.54.1; the binding's Schematron,
 *   §5.1.1), where the XSD's unbounded choice repeats it;
 * - **253:** a `qti-math-operator` named `atan2` takes two sub-expressions and one of any other name
 *   takes one (§5.91, §8.25), where its class admits one or more.
 *
 * Oracle: the specification as a checker, each case's verdict written apart from both
 * implementations ({@link expectedOf}), against the law oracle (`#pantry/test/oracle.ts` `judge`);
 * and a second implementation, the laws the import's rows break on the host, against the law oracle
 * (`#pantry/test/gen/genetic/judge.ts` `judgeOne`): no case shows any disagreement.
 *
 * Bound: an item whose body holds one table, one figure or neither, and whose response processing
 * sets one outcome from one math operator or from none: each span spelling on a `col` and on an
 * empty `colgroup`, each column shape of a table, a figure of zero to two captions, and three names
 * under one to three operands: 27 packages, exhausted.
 */
import { NodeServices } from "@effect/platform-node";
import { assert, layer } from "@effect/vitest";
import { exhaust } from "@bjornpagen/testing/explore";
import { requiredInSpace } from "@bjornpagen/testing/features";
import { int } from "@bjornpagen/testing/gen";
import { searched } from "@bjornpagen/testing/vitest";
import { Duration, Effect, Match, Option } from "effect";
import { grammar } from "#pantry/grammar/install.ts";
import type { PackageEntries } from "#pantry/test/gen/every-relation.ts";
import { genomeOf } from "#pantry/test/gen/genetic/genome.ts";
import { judgeOne, shownDisagreement } from "#pantry/test/gen/genetic/judge.ts";
import { filesOf } from "#pantry/test/oracle-complete/mutation.ts";
import { judge, lawsOf } from "#pantry/test/oracle.ts";
import { scratchDirectory } from "#pantry/test/scratch.ts";

/**
 * The oracle's law tables over the composed grammar.
 */
const laws = lawsOf(grammar);

/**
 * The namespace of every QTI 3.0 document of the box.
 */
const asi = "http://www.imsglobal.org/xsd/imsqtiasi_v3p0";

/**
 * A `span` as a case writes it: unwritten, or a spelling of `xs:int`.
 */
const spans = ["unwritten", "1", "3", "0", "-2"] as const;

/**
 * An element of {@link spans}.
 */
type Span = (typeof spans)[number];

/**
 * A table's columns as a case lays them out: none, `col`s alone, `colgroup`s alone, `col`s then
 * `colgroup`s, which the XSD admits and §5.142.3 forbids, or a `colgroup` then a `col`, which the
 * XSD's order forbids too.
 */
const columnLayouts = [
  "none",
  "col",
  "colgroup",
  "col then colgroup",
  "colgroup then col",
] as const;

/**
 * An element of {@link columnLayouts}.
 */
type Columns = (typeof columnLayouts)[number];

/**
 * A math operator's name a case writes: a one-argument float function, the two-argument one, and
 * a one-argument integer function.
 */
const operatorNames = ["sin", "atan2", "floor"] as const;

/**
 * An element of {@link operatorNames}.
 */
type OperatorName = (typeof operatorNames)[number];

/**
 * One case of the box.
 */
type Case =
  | { readonly _tag: "span"; readonly on: "col" | "colgroup"; readonly span: Span }
  | { readonly _tag: "table"; readonly columns: Columns }
  | { readonly _tag: "figure"; readonly captions: 0 | 1 | 2 }
  | { readonly _tag: "operator"; readonly name: OperatorName; readonly operands: 1 | 2 | 3 };

/**
 * Every case of the box.
 */
const cases: readonly Case[] = [
  ...(["col", "colgroup"] as const).flatMap((on) =>
    spans.map((span): Case => ({ _tag: "span", on, span })),
  ),
  ...columnLayouts.map((columns): Case => ({ _tag: "table", columns })),
  ...([0, 1, 2] as const).map((captions): Case => ({ _tag: "figure", captions })),
  ...operatorNames.flatMap((name) =>
    ([1, 2, 3] as const).map((operands): Case => ({ _tag: "operator", name, operands })),
  ),
];

/**
 * Write a case as text.
 *
 * @param input - The case.
 * @returns Its text.
 */
const literalOf = (input: Case): string =>
  Match.valueTags(input, {
    figure: ({ captions }) => `figure of ${String(captions)} captions`,
    operator: ({ name, operands }) => `${name} over ${String(operands)} operands`,
    span: ({ on, span }) => `${on} span ${span}`,
    table: ({ columns }) => `table columns ${columns}`,
  });

/**
 * Whether the specification refuses a case, decided from the information model's text alone: a
 * span that is unwritten or a positive integer is admitted (§5.31, §5.32); a table holds `col`s or
 * `colgroup`s, not both, the XSD's order kept (§5.142.3, §5.142.4); a figure holds at most one
 * caption (§5.54.1); `atan2` takes two operands and every other name one (§5.91, §8.25).
 *
 * @param input - The case.
 * @returns Whether it is refused.
 */
const expectedOf = (input: Case): boolean =>
  Match.valueTags(input, {
    figure: ({ captions }) => captions > 1,
    operator: ({ name, operands }) => operands !== (name === "atan2" ? 2 : 1),
    span: ({ span }) => span === "0" || span === "-2",
    table: ({ columns }) => columns === "col then colgroup" || columns === "colgroup then col",
  });

/**
 * The one row every table of the box holds after its columns.
 */
const row = "<tr><td>x</td></tr>";

/**
 * The caption a figure of the box holds, as written.
 */
const caption = "<figcaption>A caption</figcaption>";

/**
 * Each column layout's markup.
 */
const columnsOf: Readonly<Record<Columns, string>> = {
  col: "<col/><col/>",
  "col then colgroup": "<col/><colgroup><col/></colgroup>",
  colgroup: "<colgroup><col/></colgroup><colgroup/>",
  "colgroup then col": "<colgroup><col/></colgroup><col/>",
  none: "",
};

/**
 * The body a case's item holds.
 *
 * @param input - The case.
 * @returns Its markup.
 */
const bodyOf = (input: Case): string =>
  Match.valueTags(input, {
    figure: ({ captions }) =>
      `<figure>${captions > 0 ? caption : ""}<p>x</p>${captions > 1 ? caption : ""}</figure>`,
    operator: () => "<p>x</p>",
    span: ({ on, span }) =>
      `<table><${on}${span === "unwritten" ? "" : ` span="${span}"`}/>${row}</table>`,
    table: ({ columns }) => `<table>${columnsOf[columns]}${row}</table>`,
  });

/**
 * The response processing a case's item holds: none but a math operator's, which sets `SCORE`
 * (float) or `COUNT` (integer, for `floor`'s integer result) from its operands.
 *
 * @param input - The case.
 * @returns Its markup.
 */
const processingOf = (input: Case): string => {
  if (input._tag !== "operator") {
    return "";
  }

  const operand = '<qti-base-value base-type="float">1.5</qti-base-value>';
  const outcome = input.name === "floor" ? "COUNT" : "SCORE";

  return `<qti-response-processing><qti-set-outcome-value identifier="${outcome}"><qti-math-operator name="${input.name}">${operand.repeat(input.operands)}</qti-math-operator></qti-set-outcome-value></qti-response-processing>`;
};

/**
 * The manifest of every case: the item, a resource listing its own file.
 */
const manifest = `<?xml version="1.0" encoding="UTF-8"?>
<manifest xmlns="http://www.imsglobal.org/xsd/qti/qtiv3p0/imscp_v1p1" identifier="M"><metadata><schema>QTI Package</schema><schemaversion>3.0.1</schemaversion></metadata><organizations/><resources><resource identifier="I" type="imsqti_item_xmlv3p0" href="item.xml"><file href="item.xml"/></resource></resources></manifest>`;

/**
 * Write a case's package.
 *
 * @param input - The case.
 * @returns Its entries.
 */
const packageOf = (input: Case): PackageEntries => {
  const item = `<?xml version="1.0" encoding="UTF-8"?>
<qti-assessment-item xmlns="${asi}" identifier="i" title="I" adaptive="false" time-dependent="false"><qti-outcome-declaration identifier="SCORE" cardinality="single" base-type="float"/><qti-outcome-declaration identifier="COUNT" cardinality="single" base-type="integer"/><qti-item-body>${bodyOf(input)}</qti-item-body>${processingOf(input)}</qti-assessment-item>`;
  const text = new TextEncoder();

  return new Map([
    ["imsmanifest.xml", text.encode(manifest)],
    ["item.xml", text.encode(item)],
  ]);
};

/**
 * A situation the box must reach: each rule refused and admitted.
 */
type Situation =
  | "span refused"
  | "span admitted"
  | "table columns refused"
  | "table columns admitted"
  | "figure refused"
  | "figure admitted"
  | "operator refused"
  | "operator admitted";

layer(NodeServices.layer, { excludeTestServices: true })(
  "spec readings 238 to 241: span, table columns, figure captions and math operator arity",
  (it) => {
    it.effect(
      "refuses exactly what the information model forbids, on the import's rows as in the law oracle",
      (ctx) =>
        searched(
          ctx,
          Effect.gen(function* htmlStructureRuns() {
            const directory = yield* scratchDirectory("html-structure-");
            const bench = { directory, grammar, laws };

            return yield* exhaust(
              {
                box: "an item holding one table, figure or math operator: each span spelling on a col and an empty colgroup, each column shape, zero to two figure captions, and sin, atan2 and floor over one to three operands",
                caseHang: Duration.minutes(5),
                concurrency: 1,
                coverage: requiredInSpace<Situation>([
                  "span refused",
                  "span admitted",
                  "table columns refused",
                  "table columns admitted",
                  "figure refused",
                  "figure admitted",
                  "operator refused",
                  "operator admitted",
                ]),
                generator: int(0, cases.length - 1),
                literal: (at) =>
                  Option.match(Option.fromUndefinedOr(cases[at]), {
                    onNone: () => String(at),
                    onSome: literalOf,
                  }),
                oracle: {
                  kind: "specification",
                  name: "the information model's §5.31, §5.32, §5.142, §5.54 and §5.91 read apart, and the law oracle against the import's rows",
                },
                suite: "pantry/html-structure",
              },
              (at, c) =>
                Effect.gen(function* htmlStructureCase() {
                  const input = cases[at];
                  assert.isDefined(input, `no case ${String(at)}`);
                  if (input === undefined) {
                    return;
                  }

                  const refused = expectedOf(input);
                  const rule = {
                    figure: "figure",
                    operator: "operator",
                    span: "span",
                    table: "table columns",
                  } as const;
                  c.note(`${rule[input._tag]} ${refused ? "refused" : "admitted"}`);

                  const entries = packageOf(input);
                  const judgment = yield* judge(filesOf(entries), grammar, laws);
                  const breaches =
                    judgment._tag === "Judged" ? judgment.breaches.map(({ law }) => law) : [];
                  assert.strictEqual(
                    judgment._tag !== "Judged" || breaches.length > 0,
                    refused,
                    `${literalOf(input)}: the oracle's ${judgment._tag} [${breaches.join(", ")}]`,
                  );
                  if (input._tag === "operator" && refused) {
                    assert.include(breaches, "Arity", literalOf(input));
                  }

                  const judged = yield* judgeOne(yield* genomeOf(entries), bench, at);
                  assert.deepStrictEqual(
                    judged.disagreements.map(shownDisagreement),
                    [],
                    `${literalOf(input)}: the oracle ${judged.summary.oracle}; the import ${judged.summary.import}`,
                  );
                }),
            );
          }).pipe(Effect.scoped),
        ),
    );
  },
);
