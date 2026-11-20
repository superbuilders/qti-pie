/**
 * The marks the owner's area rule gives an attempt's points (Bjorn, final, 2026-11-18): a Select
 * Point or a Position Object review marks each point by area, as `qti-map-response-point` counts
 * it, which restates plate's UI suite's M1 for the response types an area mapping scores.
 *
 * - The areas are the response's `qti-area-map-entry` elements, in document order. A point is in the
 *   first that holds it, by plate's exact area test ({@link areaHolds}, the boundary inside), as
 *   `qti-map-response-point` maps a point by the first area listed where areas overlap.
 * - A point is `right` when that area is mapped above 0 and no point before it was in that area,
 *   since each area is counted once; every other point is `wrong`: one in no area, one in an area
 *   mapped at 0 or below, and one in an area a point before it reached.
 * - `missed` lists, for each area mapped above 0 that no point reached, that area's correct point:
 *   the first point of the correct response in force (the record's, set by template processing,
 *   else the declaration's) that is in it. An area holding no correct point names none.
 *
 * It is written apart from every grader, plate's and the database's, as `owner-credit.ts` is: the
 * table of the rule the database's marks relation is held to. Plate's review draws no mark on these
 * points (its ruling R4), so the golden records the rule as its own field. A response whose area
 * mapping writes a coordinate with `%` is not scored (`area-coords-percent`), so it has no marks
 * here.
 *
 * @module
 */
import { Array as Arr, Option } from "effect";
import { areaHolds } from "#plate/engine/expressions/shapes.ts";
import { toFloat } from "#plate/engine/numbers.ts";
import { interactionsIn } from "#plate/model/interactions.ts";
import type { AreaMapEntry, AreaMapping } from "#plate/model/item.ts";
import type { ItemRecord } from "#plate/model/record.ts";
import { format } from "#plate/model/values.ts";
import type { Single, Value } from "#plate/model/values.ts";
import type { Accepted } from "#plate/validate/verdict.ts";

/**
 * A point the attempt gives, as its value's lexical form, and the mark the rule gives it.
 */
export type GoldenAreaMark = readonly [point: string, mark: "right" | "wrong"];

/**
 * The rule's marks of one response: each point given, in the order given, and each area's correct
 * point that no point reached, in the correct response's order.
 */
export interface GoldenAreaMarks {
  readonly given: readonly GoldenAreaMark[];
  readonly missed: readonly string[];
}

/**
 * The points of a value.
 */
type Point = Extract<Single, { readonly baseType: "point" }>;

/**
 * Give a value's points, in order; none for no value.
 *
 * @param value The value.
 * @returns Its points.
 */
const pointsOf = (value: Option.Option<Value>): readonly Point[] =>
  Option.match(value, {
    onNone: () => [],
    onSome: (held) =>
      held.values.flatMap((single) => (single.baseType === "point" ? [single] : [])),
  });

/**
 * Find the area a point is in: the first, in document order, that holds it.
 *
 * @param mapping The area mapping.
 * @param point The point.
 * @returns The area's entry, none when no area holds the point.
 */
const areaOf = (mapping: AreaMapping, point: Point): Option.Option<AreaMapEntry> =>
  Arr.findFirst(mapping.entries, (entry) =>
    areaHolds[entry.shape](entry.coords, toFloat(point.value[0]), toFloat(point.value[1])),
  );

/**
 * Mark a response's points by its area mapping.
 *
 * @param mapping The response's area mapping.
 * @param given The points the attempt gives.
 * @param correct The points of the correct response in force.
 * @returns The marks.
 */
const marked = (
  mapping: AreaMapping,
  given: readonly Point[],
  correct: readonly Point[],
): GoldenAreaMarks => {
  const reached = new Set<AreaMapEntry>();
  const marks = given.map((point): GoldenAreaMark => [
    format(point),
    Option.match(areaOf(mapping, point), {
      onNone: () => "wrong",
      onSome: (area) => {
        const first = !reached.has(area);

        reached.add(area);

        return first && area.mappedValue > 0 ? "right" : "wrong";
      },
    }),
  ]);
  const named = new Set<AreaMapEntry>();
  const missed = correct.flatMap((point): readonly string[] =>
    Option.match(
      Option.filter(
        areaOf(mapping, point),
        (area) => area.mappedValue > 0 && !reached.has(area) && !named.has(area),
      ),
      {
        onNone: () => [],
        onSome: (area) => {
          named.add(area);

          return [format(point)];
        },
      },
    ),
  );

  return { given: marks, missed };
};

/**
 * Give the rule's marks of an attempt: for each response a Select Point or a Position Object binds
 * whose declaration holds an area mapping, by identifier in code-point order.
 *
 * @param accepted The item.
 * @param record The record after the attempt: its responses, and the correct responses template
 *   processing set.
 * @returns The marks of each such response; none when the item binds no such response.
 */
export const areaMarks = (
  accepted: Accepted,
  record: ItemRecord,
): Readonly<Record<string, GoldenAreaMarks>> => {
  const { item } = accepted;
  const bound = new Set(
    interactionsIn(item.body).flatMap((interaction) =>
      interaction.kind === "select-point" || interaction.kind === "position-object"
        ? [interaction.response]
        : [],
    ),
  );

  return Object.fromEntries(
    [...item.responses.values()]
      .filter((declaration) => bound.has(declaration.identifier))
      .toSorted(
        (left, right) =>
          Number(left.identifier > right.identifier) - Number(left.identifier < right.identifier),
      )
      .flatMap((declaration) =>
        Option.match(declaration.areaMapping.pipe(Option.filter((mapping) => !mapping.percent)), {
          onNone: () => [],
          onSome: (mapping) => [
            [
              declaration.identifier,
              marked(
                mapping,
                pointsOf(Option.fromUndefinedOr(record.responses[declaration.identifier])),
                pointsOf(
                  Option.orElse(
                    Option.fromUndefinedOr(record.correct[declaration.identifier]),
                    () => declaration.correct,
                  ),
                ),
              ),
            ] as const,
          ],
        }),
      ),
  );
};
