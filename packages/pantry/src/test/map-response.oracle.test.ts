/**
 * An item's map response and map response point (decisions 429 to 431; spec reading
 * `test-prefixed-response-reads`): a `qti-map-response` must name a response variable whose
 * declaration holds a `qti-mapping` (information model §7.22: "This expression looks up the value
 * of a response variable and then transforms it using the associated mapping, which must have been
 * declared"), and a `qti-map-response-point` one whose declaration holds an area mapping (§6.9.46:
 * "transforms it using the associated areaMapping"). So an item's map response of a response that
 * declares no mapping, or of a built-in variable such as `numAttempts`, which no declaration holds,
 * and its map response point of a point response with no area mapping, are refused under "Mapped
 * response" (P27); and its map response of a mapped response, and map response point of an
 * area-mapped one, are accepted. A `qti-correct` needs no correct response: the information model
 * defines its value where none is declared (§7.10, Correct: "looks up the declaration of a response
 * variable and returns the associated correctResponse or NULL if no correct value was declared"),
 * so an item that reads one is valid and accepted. Only its variable's kind binds it, a response's
 * ("Variable kind", §7.10.1), whose refusal of a correct of an outcome the complete oracle draws
 * (`#pantry/test/oracle-complete/expressions.ts`), a query law this file's host judge does not
 * restate.
 *
 * Each case is judged twice: by the law oracle over the package as written, and by the schema's own
 * laws over the import's rows on the host (`#pantry/test/host-judge.ts`), the first broken law's
 * rule by precedence, beside the declaration overlays' rules over a query restated on the host
 * (`#pantry/test/declaration-queries.ts`): "Mapped response" reads a map response's declaration's
 * table through a query. The two verdicts must be one, and both the case's.
 */
import * as NodeServices from "@effect/platform-node/NodeServices";
import { assert, layer } from "@effect/vitest";
import { Array as Arr, Effect, Option } from "effect";
import { readProgram } from "#pantry/import/program.ts";
import { readEntries } from "#pantry/package/read.ts";
import { Qti } from "#pantry/qti/schema.ts";
import { scopedPackage } from "#pantry/test/gen/every-relation.ts";
import { previewRowsOf, judge, judgedLaws } from "#pantry/test/host-judge.ts";
import { oracleVerdict } from "#pantry/test/oracle-verdict.ts";
import { edit, item, itemResource, manifestOf } from "#pantry/test/probe.ts";
import { declarationQueryLawsOf } from "#pantry/test/declaration-queries.ts";
import { rulesOf } from "#pantry/import/refusal.ts";
import { lawTable } from "#pantry/vocab/laws.ts";
import { nameOf } from "#pantry/test/package-name.ts";

/**
 * Every law the host judges, read once.
 */
const laws = judgedLaws(Qti);

/**
 * The base item's response with a mapping of its one correct choice.
 */
const mapped = edit(
  item,
  "</qti-correct-response>",
  `</qti-correct-response>
    <qti-mapping default-value="0"><qti-map-entry map-key="A" mapped-value="1"/></qti-mapping>`,
);

/**
 * The base item with a second response, `POINT`, of base type point, bound to no interaction.
 */
const pointed = edit(
  item,
  `<qti-outcome-declaration identifier="SCORE"`,
  `<qti-response-declaration identifier="POINT" cardinality="single" base-type="point"/>
  <qti-outcome-declaration identifier="SCORE"`,
);

/**
 * {@link pointed} with an area mapping of its point response.
 */
const areaMapped = edit(
  pointed,
  `base-type="point"/>`,
  `base-type="point">
    <qti-area-mapping default-value="0"><qti-area-map-entry shape="circle" coords="10,10,5" mapped-value="1"/></qti-area-mapping>
  </qti-response-declaration>`,
);

/**
 * Score an item by an expression: its response processing sets `SCORE` from it, in place of the
 * base item's literal.
 *
 * @param scored - The item.
 * @param expression - The expression, as written.
 * @returns The item's text.
 */
const scoredBy = (scored: string, expression: string): string =>
  edit(
    scored,
    `<qti-base-value base-type="float">1</qti-base-value></qti-set-outcome-value>`,
    `${expression}</qti-set-outcome-value>`,
  );

/**
 * One case: what it is, its item, and the rule both judges must give, `accepted` where they accept
 * it.
 */
interface MapResponseCase {
  readonly item: string;
  readonly name: string;
  readonly rule: string;
}

/**
 * The cases: the refusals of decisions 429, 430 and 431, and their controls; and a correct of a
 * response that declares no correct response, NULL by §7.10.
 */
const cases: readonly MapResponseCase[] = [
  {
    item: scoredBy(mapped, '<qti-map-response identifier="RESPONSE"/>'),
    name: "a map response of a mapped response",
    rule: "accepted",
  },
  {
    item: scoredBy(item, '<qti-map-response identifier="RESPONSE"/>'),
    name: "a map response of a response with no mapping",
    rule: "P27",
  },
  {
    item: scoredBy(item, '<qti-map-response identifier="numAttempts"/>'),
    name: "a map response of the built-in numAttempts, which has no mapping",
    rule: "P27",
  },
  {
    item: scoredBy(areaMapped, '<qti-map-response-point identifier="POINT"/>'),
    name: "a map response point of an area-mapped point response",
    rule: "accepted",
  },
  {
    item: scoredBy(pointed, '<qti-map-response-point identifier="POINT"/>'),
    name: "a map response point of a point response with no area mapping",
    rule: "P27",
  },
  {
    item: edit(item, "<qti-correct-response><qti-value>A</qti-value></qti-correct-response>", ""),
    name: "a correct of a response that declares no correct response, NULL by §7.10",
    rule: "accepted",
  },
];

/**
 * A case's package: the manifest and the item.
 *
 * @param drawn - The case.
 * @returns The package's entries.
 */
const entriesOf = (drawn: MapResponseCase): ReadonlyMap<string, Uint8Array> =>
  new Map(
    Object.entries({ "imsmanifest.xml": manifestOf(itemResource), "item.xml": drawn.item }).map(
      ([path, text]) => [path, new TextEncoder().encode(text)] as const,
    ),
  );

layer(NodeServices.layer, { excludeTestServices: true })("an item's map response", (it) => {
  it.effect(
    "refuses a map response of no mapped response and a map response point of no area-mapped one, and admits a correct of a response with no correct response, the law oracle and the import's rows alike",
    () =>
      Effect.gen(function* allCases() {
        const verdicts = yield* Effect.all(
          cases.map((drawn) =>
            Effect.scoped(
              Effect.gen(function* oneCase() {
                const dir = yield* scopedPackage(entriesOf(drawn));
                const verdict = yield* oracleVerdict(yield* readEntries(dir));
                const program = yield* readProgram(dir, nameOf(dir));
                const rows = previewRowsOf(program.inputs);
                const { broken } = judge(rows, laws);
                const [first, ...rest] = broken.map(({ law }) => law);
                const queried = Option.map(
                  Arr.head(declarationQueryLawsOf(rows)),
                  (name) => lawTable[name].rule,
                );
                const host =
                  first === undefined
                    ? Option.getOrElse(queried, () => "accepted")
                    : Option.getOrElse(Arr.head(rulesOf([first, ...rest])), () => "unnamed");
                const oracle = verdict.kind === "accepted" ? ["accepted"] : [...verdict.rules];

                return { host, name: drawn.name, oracle };
              }),
            ),
          ),
        );

        assert.deepStrictEqual(
          verdicts,
          cases.map(({ name, rule }) => ({ host: rule, name, oracle: [rule] })),
        );
      }),
  );
});
