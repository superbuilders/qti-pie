/**
 * What Text Entry's and Extended Text's islands share: which typed texts a response holds, the
 * `pattern-mask` check that shows a box's hint, and each box's own text, held beside the response.
 *
 * A box is one native text control, a Text Entry's `input` or one of an Extended Text's
 * `textarea`s. Its text is the child's, exactly as typed, and the state `<Responses>` holds keeps
 * it so (`Typed` in `#plate/held.ts`); the response's value is read from the texts that are
 * answers, in the boxes' order, by plate's one reading of typed text
 * (`#plate/model/typed-text.ts`). A box takes only a text on the way to an answer it may post
 * (`typedEntry`): an `integer` box never holds `abc`, `09` or `9.`, nor a text that begins no text
 * its `pattern-mask` matches. A box whose text is no value of its base type, a lone `-` in an
 * integer box or `1e` in a float box, leaves the response unread: its value is NULL, and the host
 * refuses an answer until the child changes it.
 *
 * The module is imported by client modules only.
 *
 * @module
 */
import { Option, Result } from "effect";
import { useMemo, useState } from "react";
import { compile, matches } from "#plate/model/regex.ts";
import type { Matcher } from "#plate/model/regex.ts";
import {
  readTyped,
  takesTyped,
  typedEntry,
  typedLexical,
  typedResponseOf,
  typedText,
} from "#plate/model/typed-text.ts";
import type { TypedDeclared, TypedReading, Written } from "#plate/model/typed-text.ts";
import { format, isRecordValue } from "#plate/model/values.ts";
import type { ResponseValue, Single } from "#plate/model/values.ts";
import type { Typed } from "#plate/held.ts";
import { useTypedResponse } from "#plate/ui/responses.tsx";
import type { TypedResponse } from "#plate/ui/responses.tsx";
import type { Key } from "#plate/ui/text-entry/keypad.ts";

export type { TypedDeclared, TypedReading } from "#plate/model/typed-text.ts";

/**
 * Decide whether a box's text is an answer: whether plate's reading of typed text reads a value
 * from it ({@link typedLexical}), so blank text is no number, and a `string` is none when empty or,
 * with `blankIsEmpty`, when it holds XML white space alone.
 *
 * @param text The box's text, as typed.
 * @param reading How the box's text is read.
 * @returns Whether the text is an answer.
 * @see https://www.imsglobal.org/spec/qti/v3p0/info/index.html#Enumerated_TextFormatEnum
 */
const posts = (text: string, reading: TypedReading): boolean =>
  Option.isSome(typedLexical(text, reading));

/**
 * Decide whether a box's text fails a `pattern-mask`, as the database's admission checks it.
 *
 * The text is read as the box's base type and matched in the value's lexical form (reading 54): a
 * `string` as typed, its line breaks made LF; an `integer`, read in `base`, as its decimal digits;
 * a `float` as the shortest decimal that reads back to it. A text that is no value of a numeric
 * base type fails, as it is no number the mask could match. A text that is no answer fails
 * nothing.
 *
 * @param matcher The `pattern-mask`, compiled.
 * @param text The box's text, as typed.
 * @param reading How the box's text is read.
 * @returns Whether the text is an answer the mask refuses.
 */
const fails = (matcher: Matcher, text: string, reading: TypedReading): boolean =>
  posts(text, reading) &&
  Result.match(readTyped(text, { ...reading, blankIsEmpty: false }), {
    onFailure: () => true,
    onSuccess: (single) => Option.exists(single, (read) => !matches(matcher, format(read))),
  });

/**
 * Give the virtual keyboard a box asks for: digits for an `integer` in a base whose digits are all
 * decimal, a decimal keypad for a `float`, and the text keyboard otherwise. An integer in a base
 * above 10 takes letters as digits, which a numeric keypad cannot type.
 *
 * @param reading How the box's text is read.
 * @returns The `inputMode` to write, or none for the text keyboard.
 * @see https://html.spec.whatwg.org/multipage/interaction.html#input-modalities:-the-inputmode-attribute
 */
export const inputModeOf = (reading: TypedReading): "decimal" | "numeric" | undefined => {
  if (reading.baseType === "float") {
    return "decimal";
  }

  return reading.baseType === "integer" && reading.base <= 10 ? "numeric" : undefined;
};

/**
 * One box as an island renders it: the text it shows, and whether it shows its hint, the
 * `pattern-mask` message, with its field marked invalid.
 */
export interface Box {
  readonly flagged: boolean;
  readonly text: string;
}

/**
 * An interaction's boxes, in order: at least one.
 */
export type Boxes = readonly [Box, ...Box[]];

/**
 * How many boxes an interaction shows, which the server derives: `shown` for a response holding no
 * more texts than that, and for one holding more, one box per text up to `most`, so restoring a
 * response drops no answer. Both are at least 1, and `most` is at least `shown`.
 */
export interface BoxCounts {
  readonly shown: number;
  readonly most: number;
}

/**
 * The boxes, and what of the state they were last laid out from or wrote: the boxes the state
 * holds, or the value they were laid out from before the child typed.
 */
interface Laid {
  readonly boxes: Boxes;
  readonly seen: ResponseValue | Typed;
}

/**
 * Lay texts out in boxes: one text to a box, in order, as many boxes as the counts give for that
 * many texts, and the boxes past the texts empty. No box shows its hint.
 *
 * @param texts The texts.
 * @param counts How many boxes the interaction shows.
 * @returns The boxes.
 */
const laid = (texts: readonly string[], counts: BoxCounts): Boxes => {
  const count = Math.max(counts.shown, Math.min(texts.length, counts.most));
  const [first = "", ...rest] = texts;

  return [
    { flagged: false, text: first },
    ...Array.from({ length: count - 1 }, (_, index): Box => ({
      flagged: false,
      text: rest[index] ?? "",
    })),
  ];
};

/**
 * Change one box, leaving the others as they are.
 *
 * @param boxes The boxes.
 * @param index The box's index.
 * @param change The box's next state, from its present one.
 * @returns The boxes, with that one changed.
 */
const withBox = (boxes: Boxes, index: number, change: (box: Box) => Box): Boxes => {
  const [first, ...rest] = boxes;

  return index === 0
    ? [change(first), ...rest]
    : [first, ...rest.map((box, at) => (at === index - 1 ? change(box) : box))];
};

/**
 * Give the texts a value shows in its boxes before the child types: a record's `stringValue`, the
 * text it was typed as, and each single of any other value written back as a box shows it, an
 * integer in the interaction's `base` ({@link typedText}).
 *
 * @param value The value.
 * @param reading How a box's text is read.
 * @param written How a box's text stands in its response.
 * @returns The texts, in order.
 */
const textsOf = (value: ResponseValue, reading: TypedReading, written: Written): string[] => {
  const singles: readonly Single[] = isRecordValue(value)
    ? value.fields.flatMap((field) => (field.identifier === "stringValue" ? [field.value] : []))
    : value.values;

  return singles.flatMap((single) =>
    single.baseType === "string" || single.baseType === "integer" || single.baseType === "float"
      ? [written.read(typedText(single, reading.base))]
      : [],
  );
};

/**
 * Lay out a typed response's boxes from what the state holds: the boxes the child typed into, as
 * typed, or before that the value's texts.
 *
 * @param held What the response holds.
 * @param counts How many boxes the interaction shows.
 * @param reading How a box's text is read.
 * @param written How a box's text stands in its response.
 * @returns The boxes, and what they were laid out from.
 */
const layoutOf = (
  held: TypedResponse,
  counts: BoxCounts,
  reading: TypedReading,
  written: Written,
): Laid =>
  held.typed === undefined
    ? { boxes: laid(textsOf(held.value, reading, written), counts), seen: held.value }
    : { boxes: laid(held.typed.texts, counts), seen: held.typed };

/**
 * Hold the text of an interaction's boxes in the item's state beside its response, write both on
 * every change, and say which boxes show their hint.
 *
 * The state holds every box's text as typed, empty boxes among them, and the value read from the
 * texts that are answers, in the boxes' order (`typedResponseOf` in `#plate/model/typed-text.ts`):
 * a box the child empties is no answer, and the boxes after it keep their places. When the state
 * changes from outside, the host restoring a save or starting the item afresh, the boxes are laid
 * out again from what it holds, and none shows its hint. That is detected while rendering, by the
 * state holding another `Typed` or value than the one last laid out or written; the same render
 * shows the new layout and stores it, so no frame shows the old text.
 *
 * A box takes a keystroke only where it leaves a text the box takes (`typedEntry` in
 * `#plate/model/typed-text.ts`): `write` refuses any other, and the box keeps its text. A box's
 * hint waits for the child to finish: it shows once the box loses focus holding text that fails the
 * `pattern-mask`, so a child typing `12` toward `123` sees nothing after the `1`. It goes as soon
 * as the text matches, on the keystroke that makes it match, and comes back only at the next loss
 * of focus with failing text.
 *
 * @param options.counts How many boxes the interaction shows.
 * @param options.declared The response's declaration.
 * @param options.patternMask The interaction's `pattern-mask`, none when the author wrote none. A
 *   pattern plate's reader refuses checks nothing; the server shows its notice in place of the
 *   interaction, so no island receives one.
 * @param options.reading How each box's text is read.
 * @param options.typer How a host keypad's key types into the box, a Text Entry's; none for an
 *   Extended Text.
 * @param options.written How a box's text is written into the response and read back from it: the
 *   text itself for typed text, the XHTML an `xhtml` Extended Text holds ({@link Written}). The
 *   hint judges the text the box shows.
 * @returns The boxes, in order; the setter of one box's text by its index, for its value changes,
 *   which says whether the box took the text; and the handler of one box losing focus by its index,
 *   for its `blur`.
 * @see https://react.dev/reference/react/useState#storing-information-from-previous-renders
 */
export const useBoxes = (options: {
  readonly counts: BoxCounts;
  readonly declared: TypedDeclared;
  readonly patternMask: string | undefined;
  readonly reading: TypedReading;
  readonly typer: ((key: Key) => void) | undefined;
  readonly written: Written;
}): readonly [
  boxes: Boxes,
  write: (index: number, text: string) => boolean,
  leave: (index: number) => void,
] => {
  const { counts, declared, patternMask, reading, typer, written } = options;
  const { base, baseType } = reading;
  const [held, set] = useTypedResponse(declared, typer);
  const [layout, setLayout] = useState<Laid>(() => layoutOf(held, counts, reading, written));
  const matcher = useMemo(
    () => Option.fromUndefinedOr(patternMask).pipe(Option.flatMap(compile)),
    [patternMask],
  );
  const entry = useMemo(
    () => typedEntry({ base, baseType }, patternMask),
    [base, baseType, patternMask],
  );
  const failing = (text: string) =>
    Option.exists(matcher, (compiled) => fails(compiled, text, reading));
  let current = layout;
  if (layout.seen !== (held.typed ?? held.value)) {
    current = layoutOf(held, counts, reading, written);
    setLayout(current);
  }

  const write = (index: number, text: string): boolean => {
    if (!takesTyped(entry, text)) {
      return false;
    }

    const boxes = withBox(current.boxes, index, (box) => ({
      flagged: box.flagged && failing(text),
      text,
    }));
    const [typed, value] = typedResponseOf(
      boxes.map((box) => box.text),
      declared,
      reading,
      written,
    );

    setLayout({ boxes, seen: typed });
    set(typed, value);

    return true;
  };

  const leave = (index: number) => {
    setLayout((prior) => ({
      ...prior,
      boxes: withBox(prior.boxes, index, (box) => ({ ...box, flagged: failing(box.text) })),
    }));
  };

  return [current.boxes, write, leave];
};
