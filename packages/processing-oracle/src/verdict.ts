/**
 * The verdict of a replay: every place the processing package's result differs from the recorded
 * truth, each named by where it is, and the rulings that account for them. The cutover waits on
 * exactly this list: a difference no ruling names fails, and so does a ruling no difference needs,
 * so the rulings file always states every value the package moves and why.
 *
 * @module
 */
import { Schema } from "effect";
import { valueForm } from "#processing-oracle/lexical.ts";
import type { RecordedValue, RecordedValues } from "#processing-oracle/recording.ts";

/**
 * Where one difference is: the recorded line's key (set, document, decision seed, case and
 * attempt, or `begun` for the session a seed began with) and the field that differs, an outcome's
 * or template value's identifier qualified by its map (`outcomes.SCORE`, `templates.iA`), or a
 * whole-attempt field (`completionStatus`, `credit`, `refused`, `kind`).
 */
export interface Place {
  readonly field: string;
  readonly key: string;
}

/**
 * One difference: its place and both sides, each as its canonical JSON (absent written `null`).
 */
export interface Difference extends Place {
  readonly graded: string;
  readonly recorded: string;
}

/**
 * The key of one recorded attempt.
 *
 * @param line Its line's parts: set, document, decision seed and case name.
 * @param line.set The set.
 * @param line.document The document, `<package>/<path>`.
 * @param line.decisionSeed The decision seed.
 * @param attempt The attempt's case and its index in the case's attempts, or `begun`.
 * @returns The key.
 */
export const keyOf = (
  line: { readonly decisionSeed: string; readonly document: string; readonly set: string },
  attempt: { readonly case: string; readonly index: number } | "begun",
): string =>
  [
    line.set,
    line.document,
    line.decisionSeed,
    attempt === "begun" ? "begun" : `${attempt.case}#${String(attempt.index)}`,
  ].join("|");

/**
 * A value's canonical JSON, or `null` for one the side lacks.
 *
 * @param value The value.
 * @returns Its JSON.
 */
const written = (value: RecordedValue | undefined): string =>
  value === undefined ? "null" : JSON.stringify(valueForm(value));

/**
 * The differences between two maps of values, by identifier: each identifier one side holds that
 * the other lacks or holds as another value (canonically, {@link valueForm}).
 *
 * @param key The line's key.
 * @param map The map's name, which qualifies each identifier.
 * @param recorded The recorded values.
 * @param graded The graded values.
 * @returns The differences, by identifier.
 */
export const valuesDiffer = (
  key: string,
  map: string,
  recorded: RecordedValues,
  graded: RecordedValues,
): readonly Difference[] =>
  [...new Set([...Object.keys(recorded), ...Object.keys(graded)])]
    .toSorted()
    .flatMap((identifier) => {
      const left = written(recorded[identifier]);
      const right = written(graded[identifier]);

      return left === right
        ? []
        : [{ field: `${map}.${identifier}`, graded: right, key, recorded: left }];
    });

/**
 * A whole-attempt field's side: data JSON writes as it is.
 */
export type FieldSide =
  | boolean
  | number
  | string
  | null
  | readonly FieldSide[]
  | { readonly [name: string]: FieldSide };

/**
 * The difference of one whole-attempt field, if its sides differ.
 *
 * @param key The line's key.
 * @param field The field.
 * @param recorded The recorded side, as JSON-able data.
 * @param graded The graded side.
 * @returns The difference, if any.
 */
export const fieldDiffers = (
  key: string,
  field: string,
  recorded: FieldSide,
  graded: FieldSide,
): readonly Difference[] => {
  const left = JSON.stringify(recorded);
  const right = JSON.stringify(graded);

  return left === right ? [] : [{ field, graded: right, key, recorded: left }];
};

/**
 * One ruling: a difference the cutover accepts, the value the package gives, the QTI 3.0.1
 * reading that decides it (section or table, and the words) and the mom test (would a parent
 * accept the changed grade, and why). A ruling names one line by its key, or a class of one
 * source's lines by its source's key prefix and `*` (`bank-shadows|*`): every line of the source
 * whose difference has exactly this field and these two sides (a refusal's side carries its
 * reasons' codes, so a class is one reading).
 */
export const RulingSchema = Schema.Struct({
  field: Schema.String,
  graded: Schema.String,
  key: Schema.String,
  mom: Schema.String,
  reading: Schema.Struct({ section: Schema.String, text: Schema.String }),
  recorded: Schema.String,
});

/**
 * One ruling.
 */
export type Ruling = typeof RulingSchema.Type;

/**
 * The rulings file: every ruling, sorted by key then field.
 */
export const RulingsSchema = Schema.Array(RulingSchema);

/**
 * A place's one text, which orders and matches differences and rulings.
 *
 * @param place The place.
 * @returns Its text.
 */
const placeText = (place: Place): string => `${place.key}\u0000${place.field}`;

/**
 * The verdict of differences against rulings: the differences no ruling accounts for (none, or a
 * ruling whose sides are not the difference's), and the rulings no difference needs.
 */
export interface Verdict {
  readonly stale: readonly Ruling[];
  readonly unruled: readonly Difference[];
}

/**
 * Hold the differences to the rulings: each difference must be ruled with exactly its two sides,
 * and each ruling must rule a difference the replay found.
 *
 * @param differences The replay's differences.
 * @param rulings The rulings.
 * @returns The verdict, empty on both sides when the replay is accounted for.
 */
export const verdictOf = (
  differences: readonly Difference[],
  rulings: readonly Ruling[],
): Verdict => {
  const sidesText = (side: Pick<Difference, "field" | "graded" | "recorded">) =>
    `${side.field}\u0000${side.recorded}\u0000${side.graded}`;
  const ruled = new Map(
    rulings
      .filter((ruling) => !ruling.key.endsWith("*"))
      .map((ruling) => [placeText(ruling), ruling]),
  );
  const classes = new Map<string, Ruling[]>();
  for (const ruling of rulings.filter((each) => each.key.endsWith("*"))) {
    const held = classes.get(sidesText(ruling));
    if (held === undefined) {
      classes.set(sidesText(ruling), [ruling]);
    } else {
      held.push(ruling);
    }
  }

  const used = new Set<Ruling>();
  const unruled = differences.filter((difference) => {
    const exact = ruled.get(placeText(difference));
    if (
      exact !== undefined &&
      exact.recorded === difference.recorded &&
      exact.graded === difference.graded
    ) {
      used.add(exact);

      return false;
    }

    const kind = classes
      .get(sidesText(difference))
      ?.find((ruling) => difference.key.startsWith(ruling.key.slice(0, -1)));
    if (kind !== undefined) {
      used.add(kind);

      return false;
    }

    return true;
  });

  return { stale: rulings.filter((ruling) => !used.has(ruling)), unruled };
};
