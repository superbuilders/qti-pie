/**
 * What a host holds of an item's responses while the child answers it, and the contract every host
 * keeps with it, `@qti-pie/plate/ui/props` (and `@qti-pie/plate/ui/client`): the {@link Held} state
 * plate's `<Responses>` reads and writes, and the functions that decide what a host posts from it,
 * so edullm's QTI app and metis cannot diverge. A host posts what they give encoded by plate's one
 * codec, `PostedResponses` (`@qti-pie/plate/codec`), and its server decodes it once with the same
 * Schema.
 *
 * - **A save never refuses.** Every save, and the submit a timed deadline forces, posts
 *   {@link savedOf}: every response as its island holds it, and each {@link Unread} response as
 *   NULL, since the screen holds no value of its type.
 * - **An answer is gated.** An answer, a submit or a skip the child triggers posts only what
 *   {@link answerOf} succeeds with. While a box holds text that is no value of its base type, it
 *   fails with {@link Unread}, and the host posts nothing and tells the child their answer could
 *   not be read, so they can change it.
 * - **An End Attempt ends the attempt.** Its button submits the host's form and posts which End
 *   Attempt it is (HTML's submitter), which {@link endedOf} reads from the form's entries; the
 *   answer {@link answerOf} gives for it holds that response `true`, every other End Attempt
 *   `false`.
 * - **The start is the server's.** A host starts each item from {@link heldOf} of the responses the
 *   server gives the attempt (`startingOf` in `@qti-pie/ledger/served-item.ts`): every response the
 *   page shows, and every End Attempt response at `false`. An island whose response the state does
 *   not hold is a defect.
 *
 * Nothing here renders, and nothing here loads more of `effect` than a page may, so a host's client
 * and its server read it alike.
 *
 * @module
 */
import { Data, Option, Result } from "effect";
import { endedName } from "#plate/instance.ts";
import { isNullResponse, isRecordValue } from "#plate/model/values.ts";
import type { RecordValue, Responses, ResponseValue, Single, Value } from "#plate/model/values.ts";

/**
 * The boxes of one typed response, a Text Entry's `input` or an Extended Text's `textarea`s: each
 * box's text, exactly as the child typed it, in the boxes' order, empty boxes included, and whether
 * a box holds text that is no value of the response's base type, `unread`
 * (`#plate/model/typed-text.ts`). The response's value is read from the texts, so the state holds
 * both, and a box shows the child's own text, `05` or `1.50` or a half-typed `1e`, across every
 * render, a remount among them.
 */
export interface Typed {
  readonly texts: readonly string[];
  readonly unread: boolean;
}

/**
 * An item's responses as the host holds them while the child answers: `responses`, each response
 * the page shows by identifier, its value as its island holds it, an unread one NULL; and `typed`,
 * the boxes of each typed response the child has typed into ({@link Typed}). A typed response with
 * no `typed` entry shows its value written back into its boxes.
 */
export interface Held {
  readonly responses: Responses;
  readonly typed: Readonly<Record<string, Typed>>;
}

/**
 * Give the state an item starts from: the responses the server gives the attempt, and no box typed
 * into yet.
 *
 * @param responses The responses the attempt starts from, the server's `startingOf`, or a save's
 *   responses laid over it.
 * @returns The state.
 */
export const heldOf = (responses: Responses): Held => ({ responses, typed: {} });

/**
 * Give the responses a save posts, and the submit a timed deadline forces: every response as its
 * island holds it, each unread one NULL. A save never refuses.
 *
 * @param held The state.
 * @returns The responses.
 */
export const savedOf = (held: Held): Responses => held.responses;

/**
 * An answer the child triggered while some box holds text that is no value of its response's base
 * type, such as `abc` in a box that asks for a whole number: nothing is posted, and the host tells
 * the child their answer could not be read, so they can change it.
 */
export class Unread extends Data.TaggedError("Unread")<{
  /**
   * The responses whose boxes hold such text, at least one.
   */
  readonly responses: readonly [string, ...string[]];
}> {
  /**
   * The responses and what to change, in one line.
   */
  override get message(): string {
    return `The text typed for ${this.responses.map((response) => JSON.stringify(response)).join(", ")} is no value of its response's type; change it before answering.`;
  }
}

/**
 * An End Attempt's press named a response the state holds no End Attempt response of, a single
 * boolean: a page whose End Attempt and `<Responses>` disagree, which plate's start rules out.
 */
export class EndedUnheld extends Data.TaggedError("EndedUnheld")<{
  /**
   * The response the press named.
   */
  readonly response: string;
}> {
  /**
   * Which response, and what to start from.
   */
  override get message(): string {
    return `The End Attempt pressed names ${JSON.stringify(this.response)}, which <Responses>' state holds no End Attempt response of; start the item from heldOf of the server's startingOf, which holds every End Attempt at false.`;
  }
}

/**
 * Read which End Attempt's press submitted a host's form, from the form's entries: the identifier
 * its button posts under the item instance's `endedName`, none for a submit by any other control.
 * Only plate's button posts under that name, and only text; anything else there names no End
 * Attempt, which {@link answerOf} dies on.
 *
 * @param form The form's entries, as the host's form action receives them.
 * @param instance The item instance token the page renders the item under.
 * @returns The End Attempt's response, or none.
 */
export const endedOf = (form: FormData, instance: string): Option.Option<string> =>
  Option.map(Option.fromNullishOr(form.get(endedName(instance))), String);

/**
 * The value of the End Attempt whose press ended the attempt: a single boolean `true`.
 */
const pressed: Value = {
  baseType: "boolean",
  cardinality: "single",
  values: [{ baseType: "boolean", value: true }],
};

/**
 * Give the responses an answer, a submit or a skip the child triggers posts, or refuse it while a
 * box holds text that is no value of its base type. The End Attempt whose press ended the attempt,
 * where one did, holds `true` (QTI 3.0.1 information model §5.45: "If the candidate invokes
 * response processing using an endAttemptInteraction then the associated response variable is set
 * to 'true'"), and every other End Attempt the `false` the state holds it at ("If response
 * processing is invoked in any other way ... then the associated response variable is set to
 * 'false'").
 *
 * @param held The state.
 * @param ended The End Attempt whose press ended the attempt ({@link endedOf}), none for another
 *   way of ending it.
 * @returns The responses, or {@link Unread} naming each unread response.
 * @throws {EndedUnheld} When the End Attempt names a response the state holds no single boolean of.
 */
export const answerOf = (
  held: Held,
  ended: Option.Option<string>,
): Result.Result<Responses, Unread> => {
  const unread = Object.entries(held.typed).flatMap(([response, typed]) =>
    typed.unread ? [response] : [],
  );
  const [first, ...rest] = unread;

  if (first !== undefined) {
    return Result.fail(new Unread({ responses: [first, ...rest] }));
  }

  return Result.succeed(
    Option.match(ended, {
      onNone: () => held.responses,
      onSome: (response) => {
        const value = Object.hasOwn(held.responses, response)
          ? held.responses[response]
          : undefined;

        if (value?.cardinality !== "single" || value.baseType !== "boolean") {
          throw new EndedUnheld({ response });
        }

        return { ...held.responses, [response]: pressed };
      },
    }),
  );
};

/**
 * Tell whether two singles are the same entry of a held answer: of one base type, and equal as the
 * child's answer reads, a `pair` in either order, a `directedPair` in order, a `point` when both
 * coordinates are, an integer, a float and a duration by value (`===`, so `0` is `-0` and no NaN is
 * any) and an identifier, a string and a URI by code point. A `file` is the same entry when the
 * name, size and type plate holds of it are: plate holds no file's octets, so this is no file
 * identity. QTI 3.0.1's file value is its octets qualified by a content-type and a filename
 * (information model §8.14, BaseTypeEnum), and whether two files are the same value is the
 * database's to decide; no island writes a file, so a host's state holds a file response only as
 * NULL.
 *
 * @param left One single.
 * @param right The other.
 * @returns Whether they are the same entry.
 */
const sameEntry = (left: Single, right: Single): boolean => {
  if (left.baseType === "file" && right.baseType === "file") {
    return (
      left.value.name === right.value.name &&
      left.value.size === right.value.size &&
      left.value.type === right.value.type
    );
  }

  if (left.baseType === "pair" && right.baseType === "pair") {
    const [a, b] = left.value;
    const [c, d] = right.value;

    return (a === c && b === d) || (a === d && b === c);
  }

  if (left.baseType === "directedPair" && right.baseType === "directedPair") {
    return left.value[0] === right.value[0] && left.value[1] === right.value[1];
  }

  if (left.baseType === "point" && right.baseType === "point") {
    return left.value[0] === right.value[0] && left.value[1] === right.value[1];
  }

  return left.baseType === right.baseType && left.value === right.value;
};

/**
 * Tell whether two equally long lists hold the same entries as multisets, as a `multiple` answer
 * reads: each entry of one pairs with its own entry of the other, repeats counted.
 *
 * @param left One list.
 * @param right The other, of the same length.
 * @returns Whether they hold the same entries.
 */
const sameBag = (left: readonly Single[], right: readonly Single[]): boolean => {
  const unpaired = [...right];

  return left.every((single) => {
    const index = unpaired.findIndex((other) => sameEntry(single, other));
    if (index === -1) {
      return false;
    }

    unpaired.splice(index, 1);

    return true;
  });
};

/**
 * Tell whether two records hold the same fields, in any order, each the same entry
 * ({@link sameEntry}). A record names each identifier once (`RecordValueSchema`), so a map of one's
 * fields reads the other's in linear time.
 *
 * @param left One record.
 * @param right The other.
 * @returns Whether they hold the same fields.
 */
const sameFields = (left: RecordValue, right: RecordValue): boolean => {
  const fields = new Map(left.fields.map((field) => [field.identifier, field.value]));

  return (
    fields.size === right.fields.length &&
    right.fields.every(({ identifier, value }) => {
      const other = fields.get(identifier);

      return other !== undefined && sameEntry(other, value);
    })
  );
};

/**
 * Tell whether two non-NULL values of a response hold the same entries: of one base type and
 * cardinality and as many values, a `multiple` as a multiset ({@link sameBag}) and a `single` or
 * `ordered` in order.
 *
 * @param left One value.
 * @param right The other.
 * @returns Whether they hold the same entries.
 */
const sameValues = (left: Value, right: Value): boolean =>
  left.baseType === right.baseType &&
  left.cardinality === right.cardinality &&
  left.values.length === right.values.length &&
  (left.cardinality === "multiple"
    ? sameBag(left.values, right.values)
    : left.values.every((single, index) => {
        const other = right.values[index];

        return other !== undefined && sameEntry(single, other);
      }));

/**
 * Report whether two values of a response are the same answer as the host holds it: both NULL
 * ({@link isNullResponse}), or neither and holding the same entries, a value's ({@link sameValues})
 * or a record's fields in any order ({@link sameFields}). It is the host's test of whether the
 * child changed a response from its start, never a grade: whether an answer matches a correct
 * response is the database's (`qti-match`, in its statements).
 *
 * @param left One value.
 * @param right The other.
 * @returns Whether they are the same.
 */
export const sameResponse = (left: ResponseValue, right: ResponseValue): boolean => {
  if (isNullResponse(left) || isNullResponse(right)) {
    return isNullResponse(left) && isNullResponse(right);
  }

  if (isRecordValue(left) || isRecordValue(right)) {
    return isRecordValue(left) && isRecordValue(right) && sameFields(left, right);
  }

  return sameValues(left, right);
};

/**
 * Report whether two sets of responses are the same answers: the same identifiers, each the same
 * value ({@link sameResponse}), as a host tells a response the child changed from one at its start.
 *
 * @param left One set.
 * @param right The other.
 * @returns Whether they are the same.
 */
export const sameResponses = (left: Responses, right: Responses): boolean => {
  const keys = Object.keys(left);

  return (
    keys.length === Object.keys(right).length &&
    keys.every((identifier) => {
      const value = left[identifier];
      const other = Object.hasOwn(right, identifier) ? right[identifier] : undefined;

      return value !== undefined && other !== undefined && sameResponse(value, other);
    })
  );
};
