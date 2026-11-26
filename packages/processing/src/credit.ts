/**
 * Credit and marks, the owner's rules the SQL grader held (`credit.sql`, `marks.sql`), as facts a
 * grade carries (D5).
 *
 * - **Credit**: SCORE against the maximum (MAXSCORE, else SCORE's `normal-maximum`): none at or below
 *   0, full at or above the maximum, partial between, what it earned the score clamped to [0,
 *   maximum] at the same points. None where SCORE is no finite number or the maximum is none, not
 *   above 0, or infinite. QTI never clamps SCORE (§2.2.2.3, Table 4.5.7); the clamp is the credit's
 *   alone.
 * - **Marks**: each value a response gives `right` where the correct response holds it and no given
 *   copy before it took that copy, else `wrong`; each copy of the correct response no given value
 *   took `missed`. A single is a multiple of at most one value; an ordered value is marked place by
 *   place; values are the same as `qti-match` compares them. A point response with an area mapping
 *   is marked by area (Decision 6): a point in an area mapped above 0 that no point before it
 *   (least first by x, then y) reached is right, every other point wrong, and each such area no
 *   point reached is missed at its least correct point. A record, and a response with no correct
 *   response, has no marks but by area.
 *
 * @module
 */
import { inside } from "#processing/area.ts";
import type { AreaMapping } from "#processing/ir.ts";
import { sameSingle, single, singlesOf } from "#processing/value.ts";
import type { Point, Single, Value } from "#processing/value.ts";

/**
 * An attempt's credit: what it earned of its maximum, and the category of the pair.
 */
export interface Credit {
  readonly earned: number;
  readonly kind: "full" | "none" | "partial";
  readonly maximum: number;
}

/**
 * The credit of a score against a maximum, or `undefined` where the scores cannot say.
 *
 * @param score - SCORE.
 * @param maximum - MAXSCORE, else SCORE's `normal-maximum`.
 * @returns The credit.
 */
export const creditOf = (score: number, maximum: number): Credit | undefined => {
  if (!Number.isFinite(score) || !Number.isFinite(maximum) || maximum <= 0) {
    return undefined;
  }

  if (score <= 0) {
    return { earned: 0, kind: "none", maximum };
  }

  return score >= maximum
    ? { earned: maximum, kind: "full", maximum }
    : { earned: score, kind: "partial", maximum };
};

/**
 * One mark of a response: the value it names, its place (an ordered value's from 0, else 0), the
 * mark, and how many copies of the value it covers.
 */
export interface Mark {
  readonly copies: number;
  readonly mark: "missed" | "right" | "wrong";
  readonly place: number;
  readonly value: Single;
}

/**
 * A value's members as singles, with their places.
 *
 * @param value - The value.
 * @returns Each member and its place.
 */
const membersOf = (
  value: Value,
): readonly { readonly member: Single; readonly place: number }[] => {
  switch (value.kind) {
    case "single": {
      return [{ member: value, place: 0 }];
    }
    case "multiple":
    case "ordered": {
      const ordered = value.kind === "ordered";

      return singlesOf(value).map((member, index) => ({
        member,
        place: ordered ? index : 0,
      }));
    }
    case "null":
    case "record": {
      return [];
    }
  }
};

/**
 * Add one copy of a mark, joining it to the mark of the same value, place and kind.
 *
 * @param marks - The marks so far.
 * @param mark - The mark of one copy.
 */
const addMark = (marks: Mark[], mark: Omit<Mark, "copies">): void => {
  const index = marks.findIndex(
    (each) =>
      each.mark === mark.mark && each.place === mark.place && sameSingle(each.value, mark.value),
  );
  const found = marks[index];
  if (found === undefined) {
    marks.push({ ...mark, copies: 1 });
  } else {
    marks[index] = { ...found, copies: found.copies + 1 };
  }
};

/**
 * The marks of a response against its correct response, by `qti-match`'s reading.
 *
 * @param given - The response's value.
 * @param correct - The correct response in force.
 * @returns The marks.
 */
const bagMarks = (given: Value, correct: Value): readonly Mark[] => {
  const givens = membersOf(given);
  const corrects = membersOf(correct);
  const taken = corrects.map(() => false);
  const marks: Mark[] = [];
  for (const { member, place } of givens) {
    const index = corrects.findIndex(
      (each, at) => taken[at] !== true && each.place === place && sameSingle(each.member, member),
    );
    if (index === -1) {
      addMark(marks, { mark: "wrong", place, value: member });
    } else {
      taken[index] = true;
      addMark(marks, { mark: "right", place, value: member });
    }
  }

  for (const [index, { member, place }] of corrects.entries()) {
    if (taken[index] !== true) {
      addMark(marks, { mark: "missed", place, value: member });
    }
  }

  return marks;
};

/**
 * The points a value holds, least first by x, then y: a multiple's points are a bag, so "before" is
 * this canonical order (the lead, 2026-11-20).
 *
 * @param value - A point response's value.
 * @returns Its points, in order.
 */
const pointsOf = (value: Value): readonly Point[] =>
  membersOf(value)
    .flatMap(({ member }) => (member.base === "point" ? [member.value] : []))
    .toSorted((left, right) => {
      if (left.x !== right.x) {
        return left.x < right.x ? -1 : 1;
      }

      if (left.y === right.y) {
        return 0;
      }

      return left.y < right.y ? -1 : 1;
    });

/**
 * The marks of a point response by area (Decision 6), as `qti-map-response-point` counts it: a
 * point is in the first area, in document order, that holds it; it is right where that area is
 * mapped above 0 and no point before it reached that area, since each area counts once, else wrong;
 * each area mapped above 0 that no point reached is missed at its least correct point.
 *
 * @param given - The response's value.
 * @param correct - The correct response in force.
 * @param mapping - The response's area mapping.
 * @returns The marks.
 */
const areaMarks = (given: Value, correct: Value, mapping: AreaMapping): readonly Mark[] => {
  const areaOf = (point: Point): number =>
    mapping.entries.findIndex((entry) => inside(entry.area, point));
  const mappedAbove = (area: number): boolean => (mapping.entries[area]?.value ?? 0) > 0;
  const reached = new Set<number>();
  const marks: Mark[] = [];
  for (const point of pointsOf(given)) {
    const area = areaOf(point);
    const right = area !== -1 && mappedAbove(area) && !reached.has(area);
    if (area !== -1) {
      reached.add(area);
    }

    addMark(marks, { mark: right ? "right" : "wrong", place: 0, value: single("point", point) });
  }

  const missed = new Set<number>();
  for (const point of pointsOf(correct)) {
    const area = areaOf(point);
    if (area !== -1 && mappedAbove(area) && !reached.has(area) && !missed.has(area)) {
      missed.add(area);
      addMark(marks, { mark: "missed", place: 0, value: single("point", point) });
    }
  }

  return marks;
};

/**
 * Whether a response is a point response: its value, or the NULL of its type, of base type point.
 *
 * @param given - The response's value.
 * @returns Whether it is.
 */
const isPointResponse = (given: Value): boolean => {
  if (given.kind === "null") {
    return given.type.cardinality !== "record" && given.type.base === "point";
  }

  return given.kind !== "record" && given.base === "point";
};

/**
 * The marks of one response: by area where it is a point response with an area mapping (Decision
 * 6), else by `qti-match`'s reading against its correct response; none for a record or where it has
 * no correct response.
 *
 * @param given - The response's value.
 * @param correct - The correct response in force.
 * @param areaMapping - The response's area mapping, if it declares one.
 * @returns The marks.
 */
export const marksOf = (
  given: Value,
  correct: Value,
  areaMapping: AreaMapping | undefined,
): readonly Mark[] => {
  if (areaMapping !== undefined && isPointResponse(given)) {
    return areaMarks(given, correct, areaMapping);
  }

  return correct.kind === "null" || correct.kind === "record" || given.kind === "record"
    ? []
    : bagMarks(given, correct);
};
