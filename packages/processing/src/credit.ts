/**
 * Credit and marks, the owner's rules the SQL grader held (`credit.sql`, `marks.sql`), as facts a
 * grade carries (D5).
 *
 * - **Credit**: SCORE against its item's maximum, SCORE's declared `normal-maximum`, the one source
 *   of it (the ruling of 2026-11-28: partial credit is declared by the item alone): none at 0, full
 *   at the maximum, partial between, what it earned the score itself. A score outside [0, maximum]
 *   is no credit: the item declares it never reaches one, so it is a failure of the content, and
 *   nothing clamps it (QTI never clamps SCORE, §2.2.2.3).
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
import { single, singleKey, singlesOf } from "#processing/value.ts";
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
 * The credit of a score against its item's declared maximum, or the score itself where it lies
 * outside [0, maximum], which the item declares it never reaches.
 *
 * @param score - SCORE.
 * @param maximum - SCORE's `normal-maximum`, above 0.
 * @returns The credit, or the score out of range.
 */
export const creditOf = (
  score: number,
  maximum: number,
): Credit | { readonly kind: "out-of-range"; readonly score: number } => {
  if (!(score >= 0 && score <= maximum)) {
    return { kind: "out-of-range", score };
  }

  if (score === 0) {
    return { earned: 0, kind: "none", maximum };
  }

  return score === maximum
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
 * Marks being made: each mark once, in the order first made, and where each (mark, place, value)
 * stands among them, by the value's key (`singleKey`), so a mark is found in a map, never by
 * scanning the marks made so far: marking is linear in the values marked.
 */
interface Marking {
  readonly at: Map<string, number>;
  readonly marks: Mark[];
  readonly steps: Steps;
}

/**
 * The work marking does, counted: each lookup or entry of a map one step. Marking's budget is held
 * by this count, which a test reads, never by the time it takes: a bag of n values takes at most
 * five steps a value.
 */
interface Steps {
  count: number;
}

/**
 * Begin marking.
 *
 * @returns No marks yet.
 */
const marking = (steps: Steps): Marking => ({ at: new Map(), marks: [], steps });

/**
 * Add a mark, or one more copy of a mark made already. A value that matches nothing (a NaN) is a
 * mark of its own each time, as `sameSingle` holds it the same as nothing.
 *
 * @param made - The marks being made.
 * @param mark - The mark.
 */
const addMark = (made: Marking, mark: Omit<Mark, "copies">): void => {
  const key = singleKey(mark.value);
  const at = key === undefined ? undefined : `${mark.mark}\u001F${String(mark.place)}\u001F${key}`;
  made.steps.count += 1;
  const index = at === undefined ? undefined : made.at.get(at);
  const found = index === undefined ? undefined : made.marks[index];
  if (index === undefined || found === undefined) {
    if (at !== undefined) {
      made.steps.count += 1;
      made.at.set(at, made.marks.length);
    }

    made.marks.push({ ...mark, copies: 1 });
  } else {
    made.marks[index] = { ...found, copies: found.copies + 1 };
  }
};

/**
 * The marks of a response against its correct response, by `qti-match`'s reading, counting the
 * steps it takes.
 *
 * @param given - The response's value.
 * @param correct - The correct response in force.
 * @param steps - The count of its steps, added to.
 * @returns The marks.
 */
const bagMarks = (given: Value, correct: Value, steps: Steps): readonly Mark[] => {
  const corrects = membersOf(correct);
  const unmatched = new Map<string, { readonly indices: number[]; next: number }>();
  for (const [index, { member, place }] of corrects.entries()) {
    const key = singleKey(member);
    if (key === undefined) {
      continue;
    }

    const at = `${String(place)}\u001F${key}`;
    steps.count += 2;
    const queue = unmatched.get(at) ?? { indices: [], next: 0 };
    queue.indices.push(index);
    unmatched.set(at, queue);
  }

  const taken = corrects.map(() => false);
  const made = marking(steps);
  for (const { member, place } of membersOf(given)) {
    const key = singleKey(member);
    steps.count += 1;
    const queue = key === undefined ? undefined : unmatched.get(`${String(place)}\u001F${key}`);
    const index = queue?.indices[queue.next];
    if (queue === undefined || index === undefined) {
      addMark(made, { mark: "wrong", place, value: member });
    } else {
      queue.next += 1;
      taken[index] = true;
      addMark(made, { mark: "right", place, value: member });
    }
  }

  for (const [index, { member, place }] of corrects.entries()) {
    if (taken[index] !== true) {
      addMark(made, { mark: "missed", place, value: member });
    }
  }

  return made.marks;
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
  const made = marking({ count: 0 });
  for (const point of pointsOf(given)) {
    const area = areaOf(point);
    const right = area !== -1 && mappedAbove(area) && !reached.has(area);
    if (area !== -1) {
      reached.add(area);
    }

    addMark(made, { mark: right ? "right" : "wrong", place: 0, value: single("point", point) });
  }

  const missed = new Set<number>();
  for (const point of pointsOf(correct)) {
    const area = areaOf(point);
    if (area !== -1 && mappedAbove(area) && !reached.has(area) && !missed.has(area)) {
      missed.add(area);
      addMark(made, { mark: "missed", place: 0, value: single("point", point) });
    }
  }

  return made.marks;
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
    : bagMarks(given, correct, { count: 0 });
};

/**
 * The steps marking a response against its correct response by `qti-match`'s reading takes: the
 * count marking's budget is held by.
 *
 * @param given - The response's value.
 * @param correct - The correct response.
 * @returns The steps.
 */
export const markingSteps = (given: Value, correct: Value): number => {
  const steps = { count: 0 };
  bagMarks(given, correct, steps);

  return steps.count;
};
