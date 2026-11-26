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
 *   place; values are the same as `qti-match` compares them. A record, and a response with no
 *   correct response, has no marks.
 *
 * @module
 */
import { sameScalar, singlesOf } from "#processing/value.ts";
import type { Single, Value } from "#processing/value.ts";

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
): readonly { readonly place: number; readonly single: Single }[] => {
  switch (value.kind) {
    case "single": {
      return [{ place: 0, single: value }];
    }
    case "multiple":
    case "ordered": {
      const ordered = value.kind === "ordered";

      return singlesOf(value).map((member, index) => ({
        place: ordered ? index : 0,
        single: member,
      }));
    }
    case "null":
    case "record": {
      return [];
    }
  }
};

/**
 * Whether two singles are the same value, as `qti-match` compares members.
 *
 * @param left - One.
 * @param right - The other.
 * @returns Whether they are.
 */
const same = (left: Single, right: Single): boolean => {
  if (left.base !== right.base) {
    return false;
  }

  return sameScalar(left.base, left.value, right.value);
};

/**
 * Add one copy of a mark, joining it to the mark of the same value, place and kind.
 *
 * @param marks - The marks so far.
 * @param mark - The mark of one copy.
 */
const addMark = (marks: Mark[], mark: Omit<Mark, "copies">): void => {
  const index = marks.findIndex(
    (each) => each.mark === mark.mark && each.place === mark.place && same(each.value, mark.value),
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
  for (const { place, single } of givens) {
    const index = corrects.findIndex(
      (each, at) => taken[at] !== true && each.place === place && same(each.single, single),
    );
    if (index === -1) {
      addMark(marks, { mark: "wrong", place, value: single });
    } else {
      taken[index] = true;
      addMark(marks, { mark: "right", place, value: single });
    }
  }

  for (const [index, { place, single }] of corrects.entries()) {
    if (taken[index] !== true) {
      addMark(marks, { mark: "missed", place, value: single });
    }
  }

  return marks;
};

/**
 * The marks of one response by `qti-match`'s reading against its correct response; none for a
 * record or where it has no correct response.
 *
 * @param given - The response's value.
 * @param correct - The correct response in force.
 * @returns The marks.
 */
export const marksOf = (given: Value, correct: Value): readonly Mark[] =>
  correct.kind === "null" || correct.kind === "record" || given.kind === "record"
    ? []
    : bagMarks(given, correct);
