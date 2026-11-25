/**
 * A review's marks on every interaction's answers ({@link AnswerMark}), as the host hands them: the
 * database's `AttemptMark` rows for the attempt the review shows, which judge each part of a
 * response against the correct response in force as `qti-match` compares them (`same`, a multiple
 * as a bag, an ordered value by place, a point by area where an area mapping scores it). Plate
 * judges no answer: each review lays the marks it is handed on the parts it shows, and draws none
 * it is not handed. A review that withholds the solution draws no `missed` mark ({@link Reveals}).
 *
 * The shell marks, and the core does not: `<Item>` hands the marks to a `review` alone
 * ({@link ReviewContext.shows}), the one gate; each response's {@link Marking} reads them.
 *
 * @module
 */
import { Array as Arr, Function, Option, Record as Rec } from "effect";
import { format } from "#plate/model/values.ts";
import type { Single } from "#plate/model/values.ts";
import type { Reveals, ReviewContext } from "#plate/ui/item/context.ts";

/**
 * A mark a `review` writes on a part of a response: `right` on a value the candidate gave that the
 * correct response holds, `wrong` on one it does not hold, and `missed` on a value of the correct
 * response no given value took. A value is right when it matches the correct response as
 * `qti-match` compares them, not when it scored: an item whose `qti-mapping` credits other answers
 * than its correct response still marks those `wrong`.
 */
export type AnswerMark = "missed" | "right" | "wrong";

/**
 * One mark the host hands a review, an `AttemptMark` row: the value it names, at its place (an
 * `ordered` response's place from 0, else 0), its mark, and how many copies of the value it
 * covers, at least one.
 */
export interface PartMark {
  readonly copies: bigint;
  readonly mark: AnswerMark;
  readonly place: number;
  readonly value: Single;
}

/**
 * How a review marks one response's parts: `marked`, by the marks the host handed for it, at least
 * one, showing of the correct response what `reveals` says; `unmarked`, the candidate's answers
 * with no marks, since the host handed none (as the database gives none for a response with no
 * correct response in force); `solution`, the correct responses, which a solution shows and marks
 * nothing on.
 */
export type Marking =
  | {
      readonly kind: "marked";
      readonly parts: readonly PartMark[];
      readonly reveals: Reveals;
    }
  | { readonly kind: "solution" }
  | { readonly kind: "unmarked" };

/**
 * Give how a review marks one response's parts, from what the render shows (`ReviewContext.shows`).
 *
 * @param response The response identifier.
 * @param context What the shell knows: what the render shows.
 * @returns The marking.
 */
export const markingOf = (response: string, context: Pick<ReviewContext, "shows">): Marking => {
  if (context.shows.kind === "solution") {
    return { kind: "solution" };
  }

  return context.shows.marks.pipe(
    Option.flatMap((marks) =>
      Rec.get(marks.parts, response).pipe(
        Option.filter((parts) => parts.length > 0),
        Option.map((parts) => ({ parts, reveals: marks.reveals })),
      ),
    ),
    Option.match({
      onNone: (): Marking => ({ kind: "unmarked" }),
      onSome: ({ parts, reveals }): Marking => ({ kind: "marked", parts, reveals }),
    }),
  );
};

/**
 * Give the marks a review draws of a response's: every one where it shows the solution, and none
 * `missed` where it marks the candidate's own answers alone, which never reveals a correct
 * response they did not give ({@link Reveals}).
 *
 * @param marking The response's marks.
 * @returns The marks it draws, in the order handed.
 */
const drawnOf = (marking: Extract<Marking, { readonly kind: "marked" }>): readonly PartMark[] =>
  marking.reveals === "solution"
    ? marking.parts
    : marking.parts.filter((part) => part.mark !== "missed");

/**
 * Whether the candidate's response matches its correct response whole, as `qti-match` compares
 * them: none of its parts is marked `wrong` or `missed`, whatever the review reveals of them.
 *
 * @param marking The response's marks.
 * @returns Whether it matches.
 */
export const matchedWhole = (marking: Extract<Marking, { readonly kind: "marked" }>): boolean =>
  marking.parts.every((part) => part.mark === "right");

/**
 * Give the marks of one kind the review draws, in the order handed.
 *
 * @param marking The response's marks.
 * @param mark The mark.
 * @returns Its parts.
 */
export const partsMarked = (
  marking: Extract<Marking, { readonly kind: "marked" }>,
  mark: AnswerMark,
): readonly PartMark[] => drawnOf(marking).filter((part) => part.mark === mark);

/**
 * Give the values one mark covers that the review draws, each as often as the mark covers it, in
 * the order handed.
 *
 * @param marking The response's marks.
 * @param mark The mark.
 * @returns The values.
 */
export const valuesMarked = (
  marking: Extract<Marking, { readonly kind: "marked" }>,
  mark: AnswerMark,
): readonly Single[] =>
  partsMarked(marking, mark).flatMap((part) =>
    Array.from({ length: Number(part.copies) }, () => part.value),
  );

/**
 * Give the correct response the marks name, where the review shows the solution: the values of its
 * `right` and `missed` marks, each as often as its mark covers it, in place order; none where the
 * review marks the candidate's own answers alone.
 *
 * @param marking The response's marks.
 * @returns The correct response's values, none where the review withholds it.
 */
export const correctShown = (
  marking: Extract<Marking, { readonly kind: "marked" }>,
): Option.Option<readonly Single[]> =>
  marking.reveals === "solution"
    ? Option.some(
        marking.parts
          .filter((part) => part.mark !== "wrong")
          .toSorted((left, right) => left.place - right.place)
          .flatMap((part) => Array.from({ length: Number(part.copies) }, () => part.value)),
      )
    : Option.none();

/**
 * The marks of a bag's answers as a review lays them out, and the parts of the correct response it
 * shows missed.
 *
 * @template T An answer, as the bag holds it.
 */
interface BagMarks<T> {
  /**
   * The mark of each answer given, in the order given, none for an answer no mark is handed.
   */
  readonly given: readonly (Exclude<AnswerMark, "missed"> | undefined)[];
  /**
   * The correct values handed `missed`, each as often as the mark covers it.
   */
  readonly missed: readonly T[];
}

/**
 * Lay a bag's handed marks on its answers: of the copies of one value the candidate gave, as many
 * as its `right` mark covers are right, in the order given, then as many as its `wrong` mark covers
 * are wrong; the `missed` values follow. Two answers are copies of one value when they have the
 * same key, as a `pair` in either order is one pair.
 *
 * @template T An answer, as the bag holds it.
 * @param given The answers given, as the review shows them.
 * @param marking The response's marks.
 * @param answersOf Read handed values as answers.
 * @param key The text two answers share exactly when they are copies of one value.
 * @returns The marks, and the missed answers.
 */
export const bagMarks = <T>(
  given: readonly T[],
  marking: Extract<Marking, { readonly kind: "marked" }>,
  answersOf: (values: readonly Single[]) => readonly T[],
  key: (answer: T) => string,
): BagMarks<T> => {
  const left = new Map<string, number>();

  for (const mark of ["right", "wrong"] as const) {
    for (const answer of answersOf(valuesMarked(marking, mark))) {
      const at = `${mark} ${key(answer)}`;

      left.set(at, (left.get(at) ?? 0) + 1);
    }
  }

  const take = (mark: "right" | "wrong", answer: T): boolean => {
    const at = `${mark} ${key(answer)}`;
    const copies = left.get(at) ?? 0;

    if (copies === 0) {
      return false;
    }

    left.set(at, copies - 1);

    return true;
  };

  return {
    given: given.map((answer): Exclude<AnswerMark, "missed"> | undefined => {
      if (take("right", answer)) {
        return "right";
      }

      return take("wrong", answer) ? "wrong" : undefined;
    }),
    missed: answersOf(valuesMarked(marking, "missed")),
  };
};

/**
 * A point a review lists, as its text writes the point's two coordinates.
 */
interface ListedPoint {
  readonly x: string;
  readonly y: string;
}

/**
 * Lay a point response's handed marks on the points a review lists, a Select Point's or a
 * Position Object's: each point with the mark handed its point, which the database gives by area
 * where an area mapping scores the response (proposal 2026-11-18-grading-in-sql, Decision 6:
 * right in an area mapped above 0 that no point before it reached, else wrong), then the correct
 * points handed `missed`; with no marks, none.
 *
 * @param points The points listed, in order.
 * @param marking The marks handed for the response.
 * @returns Each listed point's mark, none where the review marks nothing, and the missed points.
 */
export const pointMarksOf = (
  points: readonly ListedPoint[],
  marking: Marking,
): {
  readonly given: readonly (Exclude<AnswerMark, "missed"> | undefined)[];
  readonly missed: readonly ListedPoint[];
} =>
  marking.kind === "marked"
    ? bagMarks(
        points,
        marking,
        (values) =>
          values.flatMap((single): readonly ListedPoint[] =>
            single.baseType === "point"
              ? [{ x: String(single.value[0]), y: String(single.value[1]) }]
              : [],
          ),
        (point) => `${point.x} ${point.y}`,
      )
    : { given: points.map(Function.constUndefined), missed: [] };

/**
 * The mark of an answer a review shows in one position of a sequence: none where the review marks
 * nothing; `right` where the right mark is handed at its position; `wrong` where the wrong one is,
 * with the correct value of the position where its `missed` mark is handed there.
 */
type SlotMark =
  | { readonly kind: "right" }
  | { readonly kind: "unmarked" }
  | { readonly kind: "wrong"; readonly missed: Option.Option<string> };

/**
 * One position of a sequence as a review shows it, Order's and Graphic Order's: `empty`, no answer
 * and nothing missed there; `given`, the answer given there with its mark; `missed-only`, no
 * answer, where the correct sequence holds `chip`.
 */
export type Slot =
  | { readonly chip: string; readonly kind: "given"; readonly mark: SlotMark }
  | { readonly chip: string; readonly kind: "missed-only" }
  | { readonly kind: "empty" };

/**
 * Lay a sequence's answers out by position, as a review shows them: each answer with the mark
 * handed at its position, and, where the review shows the solution, the correct value handed
 * `missed` at a position beside its wrong answer, or alone where it has none; with no marks, each
 * answer unmarked. Every position past these is empty.
 *
 * @param given The answers given, in order, as lexical forms.
 * @param marking How the review marks the response.
 * @param positions How many positions the interaction shows.
 * @returns One slot per position, as many as the most of `positions`, the answers given and the
 *   positions the marks name.
 */
export const slotsOf = (
  given: readonly string[],
  marking: Marking,
  positions: number,
): readonly Slot[] => {
  const parts = marking.kind === "marked" ? drawnOf(marking) : [];
  const at = (place: number, mark: AnswerMark): Option.Option<string> =>
    Option.map(
      Option.fromUndefinedOr(
        parts.find((candidate) => candidate.place === place && candidate.mark === mark),
      ),
      (part) => format(part.value),
    );
  const length = Arr.reduce(parts, Math.max(positions, given.length), (most, part) =>
    Math.max(most, part.place + 1),
  );

  return Array.from({ length }, (_, index): Slot => {
    const chip = given[index];
    const missed = at(index, "missed");

    if (chip === undefined) {
      return Option.match(missed, {
        onNone: (): Slot => ({ kind: "empty" }),
        onSome: (right): Slot => ({ chip: right, kind: "missed-only" }),
      });
    }

    if (Option.isSome(at(index, "right"))) {
      return { chip, kind: "given", mark: { kind: "right" } };
    }

    return Option.isSome(at(index, "wrong"))
      ? { chip, kind: "given", mark: { kind: "wrong", missed } }
      : { chip, kind: "given", mark: { kind: "unmarked" } };
  });
};
