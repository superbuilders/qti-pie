/**
 * The responses a render diff posts besides an item's own solution: the partly right ones of its
 * `review-partial` output ({@link partialResponses}) and the wrong ones of its `review-wrong`
 * output ({@link wrongResponses}).
 *
 * They are made from the item's own correct responses and the identifiers its XML offers, never
 * from plate's model, so the same responses are posted to both sides of a diff whatever either
 * side's plate holds.
 *
 * @module
 */
import type { Responses, ResponseValue, Single, Value } from "#plate/model/values.ts";

/**
 * Give the identifiers an item offers for one response: every `identifier` attribute inside the
 * first interaction element whose `response-identifier` names it, in document order, once each.
 *
 * @param xml The item's XML.
 * @param response The response's identifier.
 * @returns The identifiers: its choices, gaps, hotspots or gap texts, whichever the interaction
 *   holds; none when no interaction binds the response.
 */
const offeredFor = (xml: string, response: string): readonly string[] => {
  const start = new RegExp(
    `<(?<element>qti-[a-z-]+-interaction)\\b[^>]*\\bresponse-identifier="${RegExp.escape(response)}"`,
    "u",
  ).exec(xml);
  const element = start?.groups?.["element"];
  if (start === null || element === undefined) {
    return [];
  }

  const end = xml.indexOf(`</${element}>`, start.index);
  const body = xml.slice(start.index + start[0].length, end === -1 ? xml.length : end);

  return [
    ...new Set(
      [...body.matchAll(/\sidentifier="(?<id>[^"]+)"/gu)].flatMap((match) => {
        const id = match.groups?.["id"];

        return id === undefined ? [] : [id];
      }),
    ),
  ];
};

/**
 * Give a single value other than the one given, of its own base type, where one can be made: the
 * first offered identifier that differs, the other boolean, one more of a number or duration, the
 * text with a letter added, a point at the origin (or at one, one, for the origin), a pair the
 * other way round.
 *
 * @param single The correct value.
 * @param offered The identifiers the response's interaction offers.
 * @returns The wrong value; none for a value of a type no wrong one is made for (`file`, `uri`), or
 *   an identifier the interaction offers no other for.
 */
const wrongSingle = (single: Single, offered: readonly string[]): readonly Single[] => {
  switch (single.baseType) {
    case "identifier": {
      const other = offered.find((id) => id !== single.value);

      return other === undefined ? [] : [{ baseType: "identifier", value: other }];
    }
    case "boolean": {
      return [{ baseType: "boolean", value: !single.value }];
    }
    case "integer": {
      return [{ baseType: "integer", value: single.value + 1n }];
    }
    case "float":
    case "duration": {
      return [{ ...single, value: single.value + 1 }];
    }
    case "string": {
      return [{ baseType: "string", value: `${single.value}x` }];
    }
    case "point": {
      const [x, y] = single.value;

      return [{ baseType: "point", value: x === 0n && y === 0n ? [1n, 1n] : [0n, 0n] }];
    }
    case "pair":
    case "directedPair": {
      const [first, second] = single.value;

      return first === second ? [] : [{ ...single, value: [second, first] }];
    }
    case "uri":
    case "file": {
      return [];
    }
    default: {
      return single satisfies never;
    }
  }
};

/**
 * Give a pair of values with each second member moved to the next pair's, so every pairing is
 * wrong while each identifier is used as often as before.
 *
 * @param pairs The correct pairs, two or more.
 * @returns The pairs re-paired; none when every pair has the same second member.
 */
const repaired = (
  pairs: readonly Extract<Single, { readonly baseType: "pair" | "directedPair" }>[],
): readonly Single[] => {
  const rotated = pairs.map((pair, index) => {
    const next = pairs[(index + 1) % pairs.length] ?? pair;

    return { ...pair, value: [pair.value[0], next.value[1]] as const };
  });

  return rotated.some((pair, index) => pair.value[1] !== pairs[index]?.value[1]) ? rotated : [];
};

/**
 * Give a wrong value for one response, of its own base type and cardinality, from its correct
 * value.
 *
 * An ordered value is reversed. A container of identifiers is replaced by as many offered
 * identifiers outside it as it holds, at least one. A container of two or more pairs is re-paired
 * ({@link repaired}). Any other value has each member made wrong by {@link wrongSingle}.
 *
 * @param value The correct value.
 * @param offered The identifiers the response's interaction offers.
 * @returns The wrong value's members; none when no wrong value is made, as for NULL.
 */
const wrongValues = (value: Value, offered: readonly string[]): readonly Single[] => {
  const { values } = value;

  if (value.cardinality === "ordered" && values.length > 1) {
    return values.toReversed();
  }

  if (value.cardinality !== "single" && value.baseType === "identifier") {
    const held = new Set(values.map((single) => single.value));
    const outside = offered.filter((id) => !held.has(id));

    return outside
      .slice(0, Math.max(1, values.length))
      .map((id): Single => ({ baseType: "identifier", value: id }));
  }

  const pairs = values.filter(
    (single): single is Extract<Single, { readonly baseType: "pair" | "directedPair" }> =>
      single.baseType === "pair" || single.baseType === "directedPair",
  );

  if (value.cardinality !== "single" && pairs.length > 1 && pairs.length === values.length) {
    return repaired(pairs);
  }

  return values.flatMap((single) => wrongSingle(single, offered));
};

/**
 * Give the wrong responses for an item: for each response whose correct value is not NULL and not
 * a record, the wrong value {@link wrongValues} makes, when it makes one.
 *
 * @param xml The item's XML, whose interactions offer the identifiers a wrong identifier is drawn
 *   from.
 * @param correct The item's correct responses, as `solution` gives them.
 * @returns The wrong responses, by response identifier; empty when none can be made, and then the
 *   item has no `review-wrong` output.
 */
export const wrongResponses = (xml: string, correct: Responses): Responses =>
  Object.fromEntries(
    Object.entries(correct).flatMap(([identifier, value]: readonly [string, ResponseValue]) => {
      if (value.cardinality === "record" || value.values.length === 0) {
        return [];
      }

      const wrong = wrongValues(value, offeredFor(xml, identifier));

      return wrong.length === 0 ? [] : [[identifier, { ...value, values: wrong }]];
    }),
  );

/**
 * Give the partly right value of a response that holds two or more values: an ordered value with
 * its last two swapped, so the rest stay in place; any other container with its first half kept,
 * rounded up.
 *
 * @param value The correct value, of two or more values.
 * @returns The partly right value.
 */
const partialValue = (value: Value): Value => {
  const { values } = value;

  return value.cardinality === "ordered"
    ? { ...value, values: [...values.slice(0, -2), ...values.slice(-2).toReversed()] }
    : { ...value, values: values.slice(0, Math.ceil(values.length / 2)) };
};

/**
 * Report whether a value holds two or more values, so part of it can be right.
 *
 * @param value The value.
 * @returns Whether it is a container of two or more values.
 */
const several = (value: Value): boolean =>
  value.cardinality !== "single" && value.values.length > 1;

/**
 * Give the partly right responses for an item, from its correct ones.
 *
 * Where a correct response holds two or more values (a Choice of several, a Match, a Gap Match,
 * an Order), each such response is made partly right ({@link partialValue}) and every other
 * response is posted right. Where none does but two or more responses hold a value, the first
 * half of them, rounded up, is posted right and the rest left out. Records and NULL responses are
 * left out throughout.
 *
 * @param correct The item's correct responses, as `solution` gives them.
 * @returns The partly right responses, by response identifier; empty when the item has no answer
 *   that can be partly right, and then it has no `review-partial` output.
 */
export const partialResponses = (correct: Responses): Responses => {
  const answered = Object.entries(correct).flatMap(
    ([identifier, value]: readonly [string, ResponseValue]): readonly (readonly [
      string,
      Value,
    ])[] =>
      value.cardinality === "record" || value.values.length === 0 ? [] : [[identifier, value]],
  );
  if (answered.some(([, value]) => several(value))) {
    return Object.fromEntries(
      answered.map(([identifier, value]) => [
        identifier,
        several(value) ? partialValue(value) : value,
      ]),
    );
  }

  return answered.length > 1
    ? Object.fromEntries(answered.slice(0, Math.ceil(answered.length / 2)))
    : {};
};
