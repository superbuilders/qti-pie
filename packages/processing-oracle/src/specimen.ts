/**
 * Generated items: specimen's cases, each an item the testing library's search drew and a
 * response with the SCORE it earns once submitted (validate-responses off, QTI's default, Table
 * 7.19.7, as the served path delivers), computed from the kind's own settings independent of any
 * grader (`@qti-pie/specimen`'s `answers`). The fixed floor (200 cases) and a sample of the whole
 * space under a stated seed are replayed, SCORE against SCORE.
 *
 * @module
 */
import { floorCases } from "@qti-pie/specimen/floor";
import type { Case } from "@qti-pie/specimen/specimen";
import { anyQuery, sample } from "@qti-pie/specimen/specimen";
import type { Engine } from "#processing-oracle/engine.ts";
import { kindOf } from "#processing-oracle/replay.ts";
import type { RecordedValue, RecordedValues } from "#processing-oracle/recording.ts";
import { fieldDiffers, valuesDiffer } from "#processing-oracle/verdict.ts";
import type { Difference } from "#processing-oracle/verdict.ts";

/**
 * A posted single, as plate's model holds it.
 */
type Posted = Case["response"]["posted"][string];

/**
 * A posted single of a value.
 */
type PostedSingle = Extract<Posted, { readonly values: unknown }>["values"][number];

/**
 * A posted single's lexical form.
 *
 * @param single The single.
 * @returns Its lexical form.
 */
const lexicalOf = (single: PostedSingle): string => {
  switch (single.baseType) {
    case "boolean": {
      return single.value ? "true" : "false";
    }
    case "integer":
    case "float":
    case "duration": {
      return String(single.value);
    }
    case "point": {
      return `${String(single.value[0])} ${String(single.value[1])}`;
    }
    case "pair":
    case "directedPair": {
      return `${single.value[0]} ${single.value[1]}`;
    }
    case "file": {
      return single.value.name;
    }
    case "identifier":
    case "string":
    case "uri": {
      return single.value;
    }
  }
};

/**
 * A posted response as a recorded value; a record (no specimen kind posts one) is none.
 *
 * @param posted The posted response.
 * @returns The recorded value, or undefined for a record.
 */
const recordedOf = (posted: Posted): RecordedValue | undefined =>
  posted.cardinality === "record"
    ? undefined
    : {
        baseType: posted.baseType,
        cardinality: posted.cardinality,
        values: posted.values.map(lexicalOf),
      };

/**
 * A case's posted responses as recorded values.
 *
 * @param c The case.
 * @returns The responses.
 */
const responsesOf = (c: Case): RecordedValues =>
  Object.fromEntries(
    Object.entries(c.response.posted).flatMap(([name, posted]) => {
      const value = recordedOf(posted);

      return value === undefined ? [] : [[name, value] as const];
    }),
  );

/**
 * The seed every generated case is answered under: no specimen kind draws.
 */
const fixedDecision = "00000000-0000-4000-8000-000000000000";

/**
 * The seed the oracle samples the whole space under, beside the floor: stated, so a run replays.
 */
export const sampleSeed = 20_261_126;

/**
 * How many cases the sample draws.
 */
export const sampleSize = 2000;

/**
 * Every generated case the oracle replays, each with its key: the floor's by index, the sample's
 * by index under {@link sampleSeed}.
 */
export const generatedCases = (): readonly (readonly [string, Case])[] => [
  ...floorCases.map((c, at) => [`specimen|floor|${String(at)}`, c] as const),
  ...sample(anyQuery, sampleSeed, sampleSize).map(
    (c, at) => [`specimen|sample-${String(sampleSeed)}|${String(at)}`, c] as const,
  ),
];

/**
 * The differences of the generated cases: each item compiled, its response submitted with
 * validation off, its SCORE against the SCORE its kind states.
 *
 * @param engine The engine.
 * @param cases The cases, each with its key.
 * @returns Their differences.
 */
export const specimenDiffers = (
  engine: Engine,
  cases: readonly (readonly [string, Case])[],
): readonly Difference[] =>
  cases.flatMap(([key, c]) => {
    const compiled = engine.item(new TextEncoder().encode(c.item.xml));
    if (compiled.kind === "refused") {
      return fieldDiffers(key, "compiled", "accepted", `refused: ${compiled.reason}`);
    }

    const seed = {
      decisionSeed: fixedDecision,
      identifier: compiled.identifier,
      package: "specimen",
    };
    const view = compiled.answer({
      recorded: new Map(),
      responses: responsesOf(c),
      seed,
      session: { duration: 0, numAttempts: 0, prior: undefined },
      take: compiled.take(seed),
      validate: false,
    });
    if (view.kind !== "done") {
      return fieldDiffers(key, "kind", "done", kindOf(view));
    }

    const score = view.outcomes["SCORE"];

    return valuesDiffer(
      key,
      "outcomes",
      { SCORE: { baseType: "float", cardinality: "single", values: [String(c.response.score)] } },
      score === undefined ? {} : { SCORE: score },
    );
  });
