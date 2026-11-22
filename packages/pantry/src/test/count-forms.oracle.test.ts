/**
 * A count's value, read by XML Schema 1.1 Part 2's lexical mapping on both sides (lane NIL's NS5):
 * each form of the box written as the every-relation item's choice interaction's `max-choices` or
 * `min-choices`, its response single or multiple. `0`, `+0`, `-0` and `00` all read 0 (§3.3.13's
 * lexical space and §3.3.20: nonNegativeInteger admits a `-` before a zero), `+1` and ` 1` read 1,
 * and `-1` reads none, which the value domain refuses alone.
 *
 * Oracle: the specification as a checker, §3.3.20's map by hand (`expected`), against both
 * implementations of it: the law oracle's (`integerOf` after `typedValueOf`, its verdict), and the
 * import's (`countValueOf`, its LeastCount and MostCount rows, and the laws its rows break on the
 * host). A most of 0 under a single response is refused by "Binding cardinality" (reading 92: a
 * most of 0 binds no limit, so the response must be multiple), and a most of 1 is accepted.
 */
import { exhaust } from "@bjornpagen/testing/explore";
import { requiredInSpace } from "@bjornpagen/testing/features";
import { element } from "@bjornpagen/testing/gen";
import type { Gen } from "@bjornpagen/testing/gen";
import { searched } from "@bjornpagen/testing/vitest";
import { NodeServices } from "@effect/platform-node";
import { assert, layer } from "@effect/vitest";
import { Array as Arr, Duration, Effect, Formatter, Option, pipe } from "effect";
import { readProgram } from "#pantry/import/program.ts";
import { readEntries } from "#pantry/package/read.ts";
import { Qti } from "#pantry/qti/schema.ts";
import { everyRelationPackage, scopedPackage } from "#pantry/test/gen/every-relation.ts";
import type { PackageEntries } from "#pantry/test/gen/every-relation.ts";
import { previewRowsOf, judge, judgedLaws } from "#pantry/test/host-judge.ts";
import { rulesOf } from "#pantry/import/refusal.ts";
import { oracleVerdict } from "#pantry/test/oracle-verdict.ts";
import { nameOf } from "#pantry/test/package-name.ts";
import { nodePlacesOf, placeKey } from "#pantry/test/places.ts";
import type { PlacedNode } from "#pantry/test/places.ts";

/**
 * The forms of the box, each with the value §3.3.20 gives it, none for a form outside
 * nonNegativeInteger's value space.
 */
const valued = [
  ["0", 0n],
  ["+0", 0n],
  ["-0", 0n],
  ["00", 0n],
  ["+1", 1n],
  ["-1", undefined],
  [" 1", 1n],
] as const;

/**
 * {@link valued}, by form.
 */
const expected: ReadonlyMap<string, bigint | undefined> = new Map(valued);

/**
 * One case: a form, the count it is written as, and the response's cardinality.
 */
interface FormCase {
  readonly cardinality: "multiple" | "single";
  readonly count: "max-choices" | "min-choices";
  readonly form: string;
}

/**
 * Every case of the box: the 7 forms as the most choices, under a single response, 7 in all. Both
 * counts are read by one `nonNegativeInteger` map, and a single response is the cardinality a count
 * of 0 breaks Binding cardinality under, so each form meets every situation it can show: a value,
 * a signed zero, no value, and a binding the count does not fit.
 */
const formCases: Gen<FormCase> = (source) => ({
  cardinality: source.draw(element(["single"] as const)),
  count: source.draw(element(["max-choices"] as const)),
  form: source.draw(
    element(
      pipe(
        valued,
        Arr.map(([form]) => form),
      ),
    ),
  ),
});

/**
 * The every-relation item's choice interaction's counts, and its response's declaration.
 */
const written = {
  counts: 'max-choices="1" min-choices="0"',
  response: '<qti-response-declaration identifier="RESPONSE" cardinality="single"',
} as const;

/**
 * The every-relation item.
 */
const itemPath = "items/item.xml";

/**
 * Write a case's package: the every-relation package with the case's form as the item's choice
 * interaction's count, the other count as written there, and its response of the case's
 * cardinality.
 *
 * @param drawn - The case.
 * @returns The package's entries.
 */
const packageOf = (drawn: FormCase): PackageEntries => {
  const entries = everyRelationPackage({ choices: 2, hotspots: 1, hottexts: 1 });
  const text = new TextDecoder().decode(entries.get(itemPath));
  assert.lengthOf(text.split(written.counts), 2, "the choice interaction's counts");
  assert.lengthOf(text.split(written.response), 2, "the bound response's declaration");

  const counts =
    drawn.count === "max-choices"
      ? `max-choices="${drawn.form}" min-choices="0"`
      : `max-choices="1" min-choices="${drawn.form}"`;
  const edited = text
    .replace(written.counts, () => counts)
    .replace(written.response, () =>
      written.response.replace('cardinality="single"', `cardinality="${drawn.cardinality}"`),
    );

  return new Map([...entries, [itemPath, new TextEncoder().encode(edited)]]);
};

/**
 * The rules a case is refused under, by §3.3.20's map and reading 92: the value domain's where the
 * form has no value, and Binding cardinality's where a single response binds a most of 0; else
 * none.
 *
 * @param drawn - The case.
 * @returns The rules, empty where the case is accepted.
 */
const expectedRules = (drawn: FormCase): ReadonlySet<string> => {
  const value = expected.get(drawn.form);
  if (value === undefined) {
    return new Set(["attribute-lexical"]);
  }

  return drawn.count === "max-choices" && value === 0n && drawn.cardinality === "single"
    ? new Set(["binding-fit"])
    : new Set();
};

/**
 * The rules a case's import rows break on the host: the value domain's where the form has no
 * value, and none else. Binding cardinality's refusal of a most of 0 under a single response reads
 * the most through a query (`SingleBindingMost`, `#pantry/qti/overlay-queries/interaction.ts`),
 * which the database alone judges; the case's `MostCount` row holds the most it reads.
 *
 * @param drawn - The case.
 * @returns The rules, empty where the host finds none broken.
 */
const hostRules = (drawn: FormCase): ReadonlySet<string> =>
  expected.get(drawn.form) === undefined ? new Set(["attribute-lexical"]) : new Set();

/**
 * Read which count rows are a choice interaction's, the one element of the item the case edits: a
 * count's kind is its node's.
 *
 * @param places - The package's nodes by place (`nodePlacesOf`).
 * @returns Whether a count row, by its element's place, is one.
 */
const choiceOf =
  (places: ReadonlyMap<string, PlacedNode>) =>
  (row: { readonly path: string; readonly start: bigint }): boolean =>
    places.get(placeKey(row.path, row.start))?.kind === "qti-choice-interaction";

/**
 * Every law the host judges, read once.
 */
const laws = judgedLaws(Qti);

/**
 * A situation the box must reach.
 */
type Situation = "accepted" | "binding cardinality" | "no value" | "signed zero";

layer(NodeServices.layer, { excludeTestServices: true })("a count's value", (it) => {
  it.effect(
    "reads each form of a count by §3.3.20's map, in the law oracle and in the import alike",
    (ctx) =>
      // Oracle: XML Schema 1.1 Part 2 §3.3.13 and §3.3.20 by hand, and reading 92. Bound: the
      // seven forms as the most choices, under a single response: 7 packages.
      searched(
        ctx,
        exhaust(
          {
            box: "0, +0, -0, 00, +1, -1 and ' 1' as max-choices, under a single response",
            caseHang: Duration.minutes(2),
            concurrency: 1,
            coverage: requiredInSpace<Situation>([
              "accepted",
              "binding cardinality",
              "no value",
              "signed zero",
            ]),
            generator: formCases,
            literal: Formatter.format,
            oracle: {
              kind: "specification",
              name: "XML Schema 1.1 Part 2 §3.3.20's lexical mapping by hand, and reading 92",
            },
            suite: "test/count-forms",
          },
          (drawn, c) =>
            Effect.scoped(
              Effect.gen(function* oneCase() {
                const rules = expectedRules(drawn);
                c.note(rules.has("binding-fit") ? "binding cardinality" : "accepted");
                if (expected.get(drawn.form) === undefined) {
                  c.note("no value");
                }

                if (drawn.form === "-0" || drawn.form === "+0") {
                  c.note("signed zero");
                }

                const dir = yield* scopedPackage(packageOf(drawn));
                const verdict = yield* oracleVerdict(yield* readEntries(dir));
                const program = yield* readProgram(dir, nameOf(dir));
                const label = Formatter.format(drawn);

                assert.deepStrictEqual(
                  verdict.kind === "accepted" ? [] : [...verdict.rules].toSorted(),
                  [...rules].toSorted(),
                  `${label}: the law oracle`,
                );

                const { broken } = judge(previewRowsOf(program.inputs), laws);
                const [first, ...rest] = broken.map(({ law }) => law);
                const rule =
                  first === undefined
                    ? Option.none()
                    : Option.orElse(Arr.head(rulesOf([first, ...rest])), () =>
                        Option.some("unnamed"),
                      );
                assert.deepStrictEqual(
                  Option.toArray(rule),
                  [...hostRules(drawn)],
                  `${label}: the import's rows break ${broken.map(({ law }) => Formatter.format(law)).join("; ") || "no law"}`,
                );

                const value = expected.get(drawn.form);
                const choice = choiceOf(nodePlacesOf(program.inputs));
                const counted =
                  drawn.count === "max-choices"
                    ? program.inputs.MostCount.values()
                        .filter(choice)
                        .map(({ most, mostValue }) => [most, mostValue] as const)
                        .toArray()
                    : program.inputs.LeastCount.values()
                        .filter(choice)
                        .map(({ least, leastValue }) => [least, leastValue] as const)
                        .toArray();
                const collapsed = drawn.form.trim();
                assert.strictEqual(
                  counted.some(([form, integer]) => form === collapsed && integer === value),
                  value !== undefined,
                  `${label}: the import's row of the count, ${Formatter.format(counted)}`,
                );
              }),
            ),
        ),
      ),
    600_000,
  );
});
