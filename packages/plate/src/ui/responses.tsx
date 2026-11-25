"use client";

/**
 * An item's responses on the client: the typed values its islands hold, which the host holds as
 * React state ({@link Held}, `#plate/held.ts`) and each interaction island reads and writes
 * through one context, by its response's declaration. What the islands hold is what the item posts:
 * the host posts what the state's contract gives (`savedOf`, `answerOf`), encoded by plate's one
 * codec (`PostedResponses`, `@qti-pie/plate/codec`), which its server decodes once with the same
 * Schema.
 *
 * @module
 */
import { Option } from "effect";
import { createContext, use, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { isRecordValue } from "#plate/model/values.ts";
import type {
  Declared,
  RecordDeclared,
  ResponseValue,
  Responses as ResponsesOf,
  Single,
  Value,
} from "#plate/model/values.ts";
import { ResponseMistyped, ResponsesMissing, ResponseUnheld } from "#plate/ui/defects.ts";
import type { Held, Typed } from "#plate/held.ts";
import type { Key } from "#plate/ui/text-entry/keypad.ts";

/**
 * What a host's `onChange` is called with: the state after a child's change, and the responses the
 * change wrote, by identifier. A write names its response even when it leaves the response's value
 * as it was, so a host tells a response the child has changed from one still at the value it
 * started at, as a default the child never touched (QTI 3.0 information model 2.2.2.2; spec reading
 * `response-default`).
 */
type OnChange = (next: Held, written: readonly string[]) => void;

/**
 * Type a key into a box, as the box's own keyboard types it.
 */
type Typer = (key: Key) => void;

/**
 * What the context carries: the host's state and its setter, and the typers of the boxes mounted,
 * by response, which a keypad types through, plate's own or the host's ({@link useTyping}).
 */
interface ResponsesValue {
  readonly held: Held;
  readonly onChange: OnChange;
  readonly typers: Map<string, Typer>;
}

/**
 * The context `<Responses>` gives the islands inside it; undefined outside one.
 */
const ResponsesContext = createContext<ResponsesValue | undefined>(undefined);

/**
 * Hold an item's responses for its islands. The host owns the state, and keeps the contract of
 * `#plate/held.ts`: it starts from `heldOf` of the server's start, saves `savedOf`, and answers
 * only what `answerOf` gives, with the End Attempt `endedOf` reads from its form's entries.
 *
 * @param props.value The state the item holds now.
 * @param props.onChange Called with the state after a child's change, and the responses that change
 *   wrote ({@link OnChange}).
 * @param props.children The item, with its islands, and any host part that types into its boxes.
 * @returns The item.
 */
export const Responses = ({
  value,
  onChange,
  children,
}: Readonly<{
  value: Held;
  onChange: OnChange;
  children: ReactNode;
}>) => {
  const [typers] = useState(() => new Map<string, Typer>());
  const responses = useMemo(() => ({ held: value, onChange, typers }), [value, onChange, typers]);

  return <ResponsesContext value={responses}>{children}</ResponsesContext>;
};

/**
 * Read the context, which only a `<Responses>` gives.
 *
 * @returns The context.
 * @throws {ResponsesMissing} Outside a `<Responses>`.
 */
const useResponses = (): ResponsesValue => {
  const responses = use(ResponsesContext);

  if (responses === undefined) {
    throw new ResponsesMissing();
  }

  return responses;
};

/**
 * Give the value the state holds for a response.
 *
 * @param held The state.
 * @param identifier The response's identifier.
 * @returns The value.
 * @throws {ResponseUnheld} When the state holds none: the host did not start from the server's
 *   start, which holds every response the page shows.
 */
const heldValue = (held: Held, identifier: string): ResponseValue => {
  const value = Object.hasOwn(held.responses, identifier) ? held.responses[identifier] : undefined;

  if (value === undefined) {
    throw new ResponseUnheld({ response: identifier });
  }

  return value;
};

/**
 * How an island reads its response's singles and writes them back: the value one single holds of
 * the island's kind, none for a single of another base type, and the single a value is. Plate's
 * islands read through the codecs below, one per kind of value they write.
 *
 * @template V The value an island holds of one single.
 */
export interface SingleCodec<V> {
  readonly read: (single: Single) => Option.Option<V>;
  readonly write: (value: V) => Single;
}

/**
 * An identifier's text: a Choice's, an Inline Choice's, a Hotspot's, a Hottext's, an Order's and a
 * Graphic Order's choices.
 */
export const identifierSingles: SingleCodec<string> = {
  read: (single) => (single.baseType === "identifier" ? Option.some(single.value) : Option.none()),
  write: (value) => ({ baseType: "identifier", value }),
};

/**
 * A pair's two identifiers, as written: an Associate's and a Graphic Associate's boxes.
 */
export const pairSingles: SingleCodec<readonly [string, string]> = {
  read: (single) => (single.baseType === "pair" ? Option.some(single.value) : Option.none()),
  write: (value) => ({ baseType: "pair", value }),
};

/**
 * A directed pair's source and target: a Match's, a Gap Match's and a Graphic Gap Match's
 * placements.
 */
export const directedPairSingles: SingleCodec<readonly [string, string]> = {
  read: (single) =>
    single.baseType === "directedPair" ? Option.some(single.value) : Option.none(),
  write: (value) => ({ baseType: "directedPair", value }),
};

/**
 * A point's two coordinates, x then y: a Select Point's and a Position Object's points.
 */
export const pointSingles: SingleCodec<readonly [bigint, bigint]> = {
  read: (single) => (single.baseType === "point" ? Option.some(single.value) : Option.none()),
  write: (value) => ({ baseType: "point", value }),
};

/**
 * An integer: a Media's count of plays.
 */
export const integerSingles: SingleCodec<bigint> = {
  read: (single) => (single.baseType === "integer" ? Option.some(single.value) : Option.none()),
  write: (value) => ({ baseType: "integer", value }),
};

/**
 * Give the values a response holds, read through an island's codec.
 *
 * @param value The value the state holds.
 * @param declared The response's declaration.
 * @param codec The island's codec.
 * @returns Its singles' values, in order.
 * @throws {ResponseMistyped} When the state holds a value of another type than the declaration's.
 */
const valuesIn = <V,>(
  value: ResponseValue,
  declared: Declared,
  codec: SingleCodec<V>,
): readonly V[] => {
  if (
    isRecordValue(value) ||
    value.baseType !== declared.baseType ||
    value.cardinality !== declared.cardinality
  ) {
    throw new ResponseMistyped({ response: declared.identifier });
  }

  return value.values.flatMap((single) => Option.toArray(codec.read(single)));
};

/**
 * Construct a response's value from its singles' values, as its declaration types it.
 *
 * @param declared The response's declaration.
 * @param codec The island's codec.
 * @param values The singles' values, in order.
 * @returns The value.
 */
const valueOf = <V,>(declared: Declared, codec: SingleCodec<V>, values: readonly V[]): Value => ({
  baseType: declared.baseType,
  cardinality: declared.cardinality,
  values: values.map(codec.write),
});

/**
 * Give the state with some responses written, every other response and every box kept as it was.
 *
 * @param held The state.
 * @param written The values written, by identifier.
 * @param typed The boxes written, by identifier, for a typed response; `{}` for none.
 * @returns The next state.
 */
const writtenInto = (
  held: Held,
  written: ResponsesOf,
  typed: Readonly<Record<string, Typed>>,
): Held => ({
  responses: { ...held.responses, ...written },
  typed: { ...held.typed, ...typed },
});

/**
 * Read and write the values one response holds, through the island's codec: an identifier's text,
 * a pair's two identifiers, a point's two coordinates. Writing replaces the response's value whole,
 * typed as its declaration types it, and keeps every other response as it is.
 *
 * The values keep their identity while the response's value does: another response changing leaves
 * this one's array as it was, so an island's memos over it hold.
 *
 * @param declared The response's declaration, as the server handed the island it.
 * @param codec How the island reads and writes its singles.
 * @returns The response's values in order, and a setter for them.
 * @throws {ResponsesMissing} Outside a `<Responses>`.
 * @throws {ResponseUnheld} When the state holds no value of the response.
 * @throws {ResponseMistyped} When it holds a value of another type.
 */
export const useResponse = <V,>(
  declared: Declared,
  codec: SingleCodec<V>,
): readonly [values: readonly V[], set: (next: readonly V[]) => void] => {
  const { held, onChange } = useResponses();
  const value = heldValue(held, declared.identifier);
  const values = useMemo(() => valuesIn(value, declared, codec), [value, declared, codec]);

  const set = (next: readonly V[]) => {
    onChange(writtenInto(held, { [declared.identifier]: valueOf(declared, codec, next) }, {}), [
      declared.identifier,
    ]);
  };

  return [values, set];
};

/**
 * The values several responses hold, by identifier, and the held values they were read from.
 */
interface Kept<V> {
  readonly sources: readonly ResponseValue[];
  readonly values: ReadonlyMap<string, readonly V[]>;
}

/**
 * Read and write, together, the values several responses of one kind hold: an island holding
 * several interactions writes all of theirs at once, so two of them never overwrite each other, as
 * two {@link useResponse} setters called in one event would: each builds the host's state from the
 * same render.
 *
 * The values keep their identity while every response's value does, as {@link useResponse}'s do.
 *
 * @param declared The responses' declarations.
 * @param codec How the island reads and writes their singles.
 * @returns Each response's values by identifier, and a setter for all of them.
 * @throws {ResponsesMissing} Outside a `<Responses>`.
 * @throws {ResponseUnheld} When the state holds no value of one of them.
 * @throws {ResponseMistyped} When it holds a value of another type.
 * @see https://react.dev/reference/react/useState#storing-information-from-previous-renders
 */
export const useResponsesOf = <V,>(
  declared: readonly Declared[],
  codec: SingleCodec<V>,
): readonly [
  values: ReadonlyMap<string, readonly V[]>,
  set: (next: ReadonlyMap<string, readonly V[]>) => void,
] => {
  const { held, onChange } = useResponses();
  const sources = declared.map((each) => heldValue(held, each.identifier));
  const read = (): Kept<V> => ({
    sources,
    values: new Map(
      declared.flatMap((each, index) => {
        const source = sources[index];

        return source === undefined ? [] : [[each.identifier, valuesIn(source, each, codec)]];
      }),
    ),
  });
  const [kept, keep] = useState(read);
  const same =
    kept.sources.length === sources.length &&
    kept.sources.every((source, index) => source === sources[index]);
  const current = same ? kept : read();

  if (current !== kept) {
    keep(current);
  }

  const set = (next: ReadonlyMap<string, readonly V[]>) => {
    onChange(
      writtenInto(
        held,
        Object.fromEntries(
          declared.map((each) => [
            each.identifier,
            valueOf(each, codec, next.get(each.identifier) ?? []),
          ]),
        ),
        {},
      ),
      declared.map((each) => each.identifier),
    );
  };

  return [current.values, set];
};

/**
 * Read and write a response of any declaration whole, a record's among them: a Portable Custom
 * Interaction's, whose module speaks QTI values of whatever type its response declares.
 *
 * @param declared The response's declaration.
 * @returns The response's value, and a setter for it.
 * @throws {ResponsesMissing} Outside a `<Responses>`.
 * @throws {ResponseUnheld} When the state holds no value of the response.
 */
export const useResponseValue = (
  declared: Declared | RecordDeclared,
): readonly [value: ResponseValue, set: (next: ResponseValue) => void] => {
  const { held, onChange } = useResponses();
  const value = heldValue(held, declared.identifier);

  const set = (next: ResponseValue) => {
    onChange(writtenInto(held, { [declared.identifier]: next }, {}), [declared.identifier]);
  };

  return [value, set];
};

/**
 * What a typed response's boxes hold, read and written together with its value: the boxes the child
 * typed into ({@link Typed}), none before the first keystroke, when the boxes show the value.
 */
export interface TypedResponse {
  readonly typed: Typed | undefined;
  readonly value: ResponseValue;
}

/**
 * Read and write a typed response, a Text Entry's or an Extended Text's: its boxes' texts as the
 * child typed them and the value read from them, written together, so the state holds what each box
 * shows and the value it posts. Its `type` registers the box's typer under the response for
 * {@link useTyping}, a host keypad's keys typing as the box's own keyboard does.
 *
 * @param declared The response's declaration.
 * @param typer How the island types a key into its box, none for an Extended Text, whose boxes no
 *   host keypad types into.
 * @returns What the response holds, and a setter of its boxes and the value read from them.
 * @throws {ResponsesMissing} Outside a `<Responses>`.
 * @throws {ResponseUnheld} When the state holds no value of the response.
 */
export const useTypedResponse = (
  declared: Declared | RecordDeclared,
  typer: Typer | undefined,
): readonly [held: TypedResponse, set: (typed: Typed, value: ResponseValue) => void] => {
  const { held, onChange, typers } = useResponses();
  const value = heldValue(held, declared.identifier);
  const typed = Object.hasOwn(held.typed, declared.identifier)
    ? held.typed[declared.identifier]
    : undefined;
  const { identifier } = declared;

  useEffect((): (() => void) | undefined => {
    if (typer === undefined) {
      return undefined;
    }

    typers.set(identifier, typer);

    return () => {
      if (typers.get(identifier) === typer) {
        typers.delete(identifier);
      }
    };
  }, [identifier, typer, typers]);

  const set = (next: Typed, read: ResponseValue) => {
    onChange(writtenInto(held, { [identifier]: read }, { [identifier]: next }), [identifier]);
  };

  return [useMemo(() => ({ typed, value }), [typed, value]), set];
};

/**
 * Type into a response's Text Entry from a keypad: plate's own, which the server writes after the
 * item's body (`textEntryKeypad` `on-screen`, `#plate/ui/text-entry/keys.tsx`), or a host's own,
 * where the host composed a Text Entry renderer whose box asks the device for no keyboard. The key
 * types at the end of the box's text, or deletes its last character, as a calculator's keys do
 * (`pressed` in `#plate/ui/text-entry/keypad.ts`), and the box takes or refuses it as it does a
 * keystroke, so the box shows exactly what the child typed and its response is read from that text.
 * A key pressed while no Text Entry of the response is mounted types nothing: a keypad stands
 * beside a Text Entry.
 *
 * @param identifier The response's identifier.
 * @returns The keypad's press.
 * @throws {ResponsesMissing} Outside a `<Responses>`: the keypad stands inside the item's
 *   `<Responses>`.
 */
export const useTyping = (identifier: string): Typer => {
  const { typers } = useResponses();

  return (key) => {
    typers.get(identifier)?.(key);
  };
};
