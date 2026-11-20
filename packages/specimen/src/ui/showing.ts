/**
 * The states plate's UI suite shows an item in, and the responses it shows: each response drawn
 * from the item's correct response by one {@link Derivation}, and judged against it by QTI's
 * `qti-match` as the suite restates it ({@link classOf}), never by plate's own comparison.
 *
 * Test support for plate's UI suite under `src/ui/`; it reads plate through its public entries
 * alone.
 *
 * @module
 */
import { Array as Arr, Option } from "effect";
import { format } from "@qti-pie/plate";
import type { ResponseValue, Value } from "@qti-pie/plate";

/**
 * One value of a response, of one base type.
 */
type Single = Value["values"][number];

/**
 * How a shown response is drawn from the item's correct response: `solution`, the correct
 * response itself; `nothing`, NULL; `part`, part of it right and the rest not ({@link derived});
 * and `away`, a value of the same type with no part right.
 */
export type Derivation = "away" | "nothing" | "part" | "solution";

/**
 * Where a shown response comes from: drawn from the item's correct response by a
 * {@link Derivation}, or `given`, the response the item's source gives the child, as a generated
 * case's description does.
 */
export type Drawing = Derivation | "given";

/**
 * Every derivation, in the order the suite enumerates them.
 */
export const derivations = [
  "solution",
  "nothing",
  "part",
  "away",
] as const satisfies readonly Derivation[];

/**
 * Whether a review shows the item's correct response to mark against: `shown`, as Cameron's
 * shadow tests show it (`show-solution="true"`), or `withheld`, as the pilot shows a review.
 */
export type SolutionShown = "shown" | "withheld";

/**
 * A state the suite shows an item in: `answering`, its islands restored to a shown response;
 * `review`, a drawn response scored and shown back, with or without the correct response to mark
 * it against; and `solution`, the correct responses.
 */
export type Showing =
  | { readonly derived: Drawing; readonly mode: "answering" }
  | { readonly derived: Drawing; readonly mode: "review"; readonly solution: SolutionShown }
  | { readonly mode: "solution" };

/**
 * Every showing of a derived response, the space of states the suite holds each corpus item in:
 * four answering, eight review and one solution.
 */
export const showings: Arr.NonEmptyReadonlyArray<Showing> = Arr.append(
  [
    ...derivations.map((derived): Showing => ({ derived, mode: "answering" })),
    ...derivations.flatMap((derived) =>
      (["shown", "withheld"] as const).map((solution): Showing => ({
        derived,
        mode: "review",
        solution,
      })),
    ),
  ],
  { mode: "solution" },
);

/**
 * Every showing of the response an item's source gives: answering, review with the solution shown
 * and withheld, and solution.
 */
export const givenShowings: Arr.NonEmptyReadonlyArray<Showing> = [
  { derived: "given", mode: "answering" },
  { derived: "given", mode: "review", solution: "shown" },
  { derived: "given", mode: "review", solution: "withheld" },
  { mode: "solution" },
];

/**
 * Name a showing as a failure and a coverage note name it.
 *
 * @param showing The showing.
 * @returns Its mode, then its derivation, then whether the solution is shown.
 */
export const showingName = (showing: Showing): string => {
  switch (showing.mode) {
    case "answering": {
      return `answering ${showing.derived}`;
    }
    case "review": {
      return `review ${showing.derived} (solution ${showing.solution})`;
    }
    case "solution": {
      return "solution";
    }
    default: {
      return showing satisfies never;
    }
  }
};

/**
 * The class of a shown response against its correct response, by `qti-match` (QTI 3.0 information
 * model, Match): `right` when it matches; `empty` when it is NULL; `partial` when some of its
 * values the correct response credits (a `single` never is); `wrong` when none; and `unjudged`
 * when there is no correct response to match, NULL or a record, which `qti-match` does not compare.
 *
 * @see https://www.imsglobal.org/spec/qti/v3p0/info#Root_Match
 */
export type ResponseClass = "empty" | "partial" | "right" | "unjudged" | "wrong";

/**
 * Tell whether two singles are one value as `qti-match` compares them: a `pair` in either order,
 * every other base type by its value, read here through its lexical form.
 *
 * @param left One single.
 * @param right The other.
 * @returns Whether they are the same value.
 */
const sameSingle = (left: Single, right: Single): boolean => {
  if (left.baseType === "pair" && right.baseType === "pair") {
    return (
      (left.value[0] === right.value[0] && left.value[1] === right.value[1]) ||
      (left.value[0] === right.value[1] && left.value[1] === right.value[0])
    );
  }

  return left.baseType === right.baseType && format(left) === format(right);
};

/**
 * Count the values of a shown response its correct response credits: for an `ordered` one, those
 * at the position the correct sequence gives them; for any other, those the correct response's
 * bag still holds a copy of.
 *
 * @param shown The shown value.
 * @param correct The correct value, of the same cardinality.
 * @returns How many of the shown values are credited.
 */
const credited = (shown: Value, correct: Value): number => {
  if (correct.cardinality === "ordered") {
    return shown.values.filter((single, index) => {
      const expected = correct.values[index];

      return expected !== undefined && sameSingle(single, expected);
    }).length;
  }

  const left = [...correct.values];

  return shown.values.filter((single) => {
    const at = left.findIndex((candidate) => sameSingle(single, candidate));

    if (at === -1) {
      return false;
    }

    left.splice(at, 1);

    return true;
  }).length;
};

/**
 * Judge a shown response against its correct response, as {@link ResponseClass} defines.
 *
 * @param shown The shown response.
 * @param correct The correct response.
 * @returns The class.
 */
export const classOf = (shown: ResponseValue, correct: ResponseValue): ResponseClass => {
  if (correct.cardinality === "record" || correct.values.length === 0) {
    return "unjudged";
  }

  if (shown.cardinality === "record" || shown.values.length === 0) {
    return "empty";
  }

  const count = credited(shown, correct);

  if (count === correct.values.length && count === shown.values.length) {
    return "right";
  }

  return count > 0 ? "partial" : "wrong";
};

/**
 * Judge an item's shown responses together: `unjudged` when none is judged; `right` when every
 * judged one is right; `empty` when every judged one is empty; `wrong` when none is right or
 * partial; and `partial` otherwise, some right in part and some not.
 *
 * @param classes The class of each response.
 * @returns The item's class.
 */
export const itemClassOf = (classes: readonly ResponseClass[]): ResponseClass => {
  const judged = classes.filter((each) => each !== "unjudged");

  if (judged.length === 0) {
    return "unjudged";
  }

  if (judged.every((each) => each === "right")) {
    return "right";
  }

  if (judged.every((each) => each === "empty")) {
    return "empty";
  }

  return judged.some((each) => each === "right" || each === "partial") ? "partial" : "wrong";
};

/**
 * Give NULL of a response's type.
 *
 * @param correct The correct response, whose type it takes.
 * @returns NULL: no values, or a record of no field.
 */
const nullLike = (correct: ResponseValue): ResponseValue =>
  correct.cardinality === "record"
    ? { cardinality: "record", fields: [] }
    : { baseType: correct.baseType, cardinality: correct.cardinality, values: [] };

/**
 * Give a single of the same base type that is not the given one: another of the interaction's
 * identifiers, the number one more, the point one further each way, the other boolean, or the
 * text with `x` after it; none for a base type the suite draws no other value of (a file, a URI).
 *
 * @param single The single.
 * @param offered The identifiers the interaction offers, in document order.
 * @returns Another single, or none.
 */
const otherSingle = (single: Single, offered: readonly string[]): Option.Option<Single> => {
  switch (single.baseType) {
    case "identifier": {
      return Option.map(
        Arr.findFirst(offered, (identifier) => identifier !== single.value),
        (value): Single => ({ baseType: "identifier", value }),
      );
    }
    case "pair":
    case "directedPair": {
      const [first, second] = single.value;

      return Option.map(
        Arr.findFirst(offered, (identifier) => identifier !== first && identifier !== second),
        (other): Single => ({ baseType: single.baseType, value: [first, other] }),
      );
    }
    case "integer": {
      return Option.some({ baseType: "integer", value: single.value + 1n });
    }
    case "float":
    case "duration": {
      return Option.some({ baseType: single.baseType, value: single.value + 1 });
    }
    case "point": {
      return Option.some({
        baseType: "point",
        value: [single.value[0] + 1n, single.value[1] + 1n],
      });
    }
    case "boolean": {
      return Option.some({ baseType: "boolean", value: !single.value });
    }
    case "string": {
      return Option.some({ baseType: "string", value: `${single.value}x` });
    }
    case "uri":
    case "file": {
      return Option.none();
    }
    default: {
      return single satisfies never;
    }
  }
};

/**
 * Give a value of the correct response's type of which no part is right: for an `ordered`
 * response of two or more values, its sequence turned by one, so every value leaves its place;
 * for two or more pairs, the pairs' second members turned by one; for a `multiple` response of
 * identifiers, one the interaction offers that it does not hold; and otherwise another value in
 * place of its first ({@link otherSingle}). None for NULL, a record, or a value the suite draws no
 * other of.
 *
 * @param correct The correct response.
 * @param offered The identifiers the interaction that binds it offers, in document order.
 * @returns The value, or none.
 */
const awayFrom = (correct: ResponseValue, offered: readonly string[]): Option.Option<Value> => {
  if (correct.cardinality === "record") {
    return Option.none();
  }

  const { values } = correct;
  const [head, ...rest] = values;

  if (head === undefined) {
    return Option.none();
  }

  if (correct.cardinality === "ordered" && rest.length > 0) {
    return Option.some({ ...correct, values: [...rest, head] });
  }

  const pairs = values.flatMap((single) =>
    single.baseType === "pair" || single.baseType === "directedPair" ? [single] : [],
  );
  const [firstPair, ...laterPairs] = pairs;

  if (firstPair !== undefined && laterPairs.length > 0 && pairs.length === values.length) {
    const turned = [...laterPairs, firstPair].map((pair) => pair.value[1]);

    return Option.some({
      ...correct,
      values: Arr.zipWith(pairs, turned, (pair, second): Single => ({
        baseType: pair.baseType,
        value: [pair.value[0], second],
      })),
    });
  }

  const identifiers = values.flatMap((single) =>
    single.baseType === "identifier" ? [single.value] : [],
  );

  if (correct.cardinality === "multiple" && identifiers.length === values.length) {
    return Option.map(
      Arr.findFirst(offered, (identifier) => !identifiers.includes(identifier)),
      (value): Value => ({ ...correct, values: [{ baseType: "identifier", value }] }),
    );
  }

  return Option.map(otherSingle(head, offered), (single): Value => ({
    ...correct,
    values: [single],
  }));
};

/**
 * Give the first value of the correct response alone, which credits some of it and misses the
 * rest: none for a response of fewer than two values.
 *
 * @param correct The correct response.
 * @returns The value, or none.
 */
const firstOf = (correct: ResponseValue): Option.Option<Value> =>
  correct.cardinality !== "record" && correct.values.length > 1
    ? Option.map(Arr.head(correct.values), (single): Value => ({ ...correct, values: [single] }))
    : Option.none();

/**
 * One response an item's page posts, with what the suite draws it from: its identifier, its
 * correct response, and the identifiers the interaction that binds it offers.
 */
export interface Drawable {
  readonly correct: ResponseValue;
  readonly identifier: string;
  readonly offered: readonly string[];
}

/**
 * Draw the responses of an item by a derivation, one for each response its page posts: under
 * `solution`, each its correct response; under `nothing`, each NULL; under `away`, each a value of
 * which no part is right where the suite can draw one, else NULL; and under `part`, each response
 * of two or more values its first value alone, the rest at the solution, or, where no response
 * holds two values but the item posts two or more, the first at the solution and the rest away.
 *
 * @param responses The responses the page posts, in posting order.
 * @param derivation The derivation.
 * @returns The responses by identifier; none under `part` for an item with no way to be partly
 *   right, one response of one value.
 */
export const derived = (
  responses: readonly Drawable[],
  derivation: Derivation,
): Option.Option<Readonly<Record<string, ResponseValue>>> => {
  const each = (
    draw: (response: Drawable, index: number) => ResponseValue,
  ): Readonly<Record<string, ResponseValue>> =>
    Object.fromEntries(
      responses.map((response, index) => [response.identifier, draw(response, index)]),
    );
  const away = (response: Drawable): ResponseValue =>
    Option.getOrElse(awayFrom(response.correct, response.offered), () =>
      nullLike(response.correct),
    );

  switch (derivation) {
    case "solution": {
      return Option.some(each((response) => response.correct));
    }
    case "nothing": {
      return Option.some(each((response) => nullLike(response.correct)));
    }
    case "away": {
      return Option.some(each(away));
    }
    case "part": {
      if (responses.some((response) => Option.isSome(firstOf(response.correct)))) {
        return Option.some(
          each((response) => Option.getOrElse(firstOf(response.correct), () => response.correct)),
        );
      }

      return responses.length > 1
        ? Option.some(each((response, index) => (index === 0 ? response.correct : away(response))))
        : Option.none();
    }
    default: {
      return derivation satisfies never;
    }
  }
};
