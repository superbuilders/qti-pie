/**
 * What Text Entry's and Extended Text's islands share: which typed texts a response posts, the
 * `pattern-mask` check that shows a box's hint, and each box's own text, held beside the response.
 *
 * A box is one native text control, a Text Entry's `input` or one of an Extended Text's
 * `textarea`s. Its text is the child's, exactly as typed; the response holds the texts that are
 * answers, in the boxes' order, each as typed, which is plate's lexical form of a typed value. The
 * two differ only by the boxes that hold no answer, so the boxes keep their own text and the
 * response is derived from it on every change.
 *
 * The module is imported by client modules only.
 *
 * @module
 */
import { Option, Result } from "effect";
import { useMemo, useState } from "react";
import { decodeValue, postedLexical } from "#plate/form/encoding.ts";
import { compile, matches } from "#plate/model/regex.ts";
import type { Matcher } from "#plate/model/regex.ts";
import { format } from "#plate/model/values.ts";
import { useResponse } from "#plate/ui/responses.tsx";

/**
 * How a box's text is read as an answer: as plate's server decodes the same text.
 */
export interface TypedReading {
  /**
   * The number base an `integer` answer is written in, the interaction's `base`: an integer from 2
   * to 36, 10 when the author wrote none (the XSD's default).
   */
  readonly base: number;
  /**
   * The base type of the response the box writes. A record response is typed as a `string`, the
   * text its fields are read from.
   */
  readonly baseType: "float" | "integer" | "string";
  /**
   * Whether a `string` of white space alone is no answer, as QTI's `TextFormatEnum` asks of
   * `plain` and `preformatted` text: "where a response consists only of white-space characters …
   * it should be treated as an empty string (NULL)". Otherwise only empty text is no answer.
   */
  readonly blankIsEmpty: boolean;
}

/**
 * Decide whether a box's text is an answer the response posts: whether the form encoding reads a
 * value from it ({@link postedLexical}), so blank text is no number, and a `string` is none when
 * empty or, with `blankIsEmpty`, when it holds XML white space alone.
 *
 * @param text The box's text, as typed.
 * @param reading How the box's text is read.
 * @returns Whether the text posts.
 * @see https://www.imsglobal.org/spec/qti/v3p0/info/index.html#Enumerated_TextFormatEnum
 */
const posts = (text: string, reading: TypedReading): boolean =>
  Option.isSome(postedLexical(reading.baseType, text, reading.blankIsEmpty));

/**
 * Decide whether a box's text fails a `pattern-mask`, as plate's server checks it.
 *
 * The text is decoded as the box's base type and matched in the value's lexical form (reading
 * 54): a `string` as typed, its line breaks made LF; an `integer`, read in `base`, as its decimal
 * digits; a `float` as the shortest decimal that reads back to it. A text that is no value of a
 * numeric base type fails, as it is no number the mask could match, and the server refuses it
 * with the author's `data-patternmask-message`. A text that posts nothing is no answer, and fails
 * nothing.
 *
 * @param matcher The `pattern-mask`, compiled.
 * @param text The box's text, as typed.
 * @param reading How the box's text is read.
 * @returns Whether the text is an answer the mask refuses.
 */
const fails = (matcher: Matcher, text: string, reading: TypedReading): boolean =>
  posts(text, reading) &&
  Result.match(
    decodeValue(
      [["", text]],
      { baseType: reading.baseType, cardinality: "single", name: "" },
      { base: reading.base },
    ),
    {
      onFailure: () => true,
      onSuccess: (value) => value.values.some((single) => !matches(matcher, format(single))),
    },
  );

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
 * The boxes, and the response's texts they were last laid out from or wrote.
 */
interface Laid {
  readonly boxes: Boxes;
  readonly seen: readonly string[];
}

/**
 * Lay a response's texts out in boxes: one text to a box, in order, as many boxes as the counts
 * give for that many texts, and the boxes past the texts empty. No box shows its hint.
 *
 * @param texts The response's texts.
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
 * How a box's text stands in its response: `write` makes the posted text from the text a box shows,
 * `read` the text a box shows from a posted one, each the other's inverse on what `write` makes.
 */
export interface Written {
  readonly write: (text: string) => string;
  readonly read: (posted: string) => string;
}

/**
 * Typed text as it is posted: the text itself.
 */
export const asTyped: Written = { read: (posted) => posted, write: (text) => text };

/**
 * Hold the text of an interaction's boxes beside its response, write the response on every
 * change, and say which boxes show their hint.
 *
 * The response holds only the texts that post ({@link posts}), in the boxes' order, so a box the
 * child empties posts nothing and the boxes after it keep their places: the boxes keep their own
 * text, and every change writes the response from it. When the response changes from outside,
 * the host restoring a value or setting a refused save back, the boxes are laid out afresh from
 * the response's texts, one to a box from the first, and none shows its hint. That is detected
 * while rendering, by the texts being others than the ones last laid out or written, which
 * `useResponse` keeps as one array while they stay the same; the same render shows the new layout
 * and stores it, so no frame shows the old text.
 *
 * A box's hint waits for the child to finish: it shows once the box loses focus holding text that
 * fails the `pattern-mask`, so a child typing `12` toward `123` sees nothing after the `1`. It
 * goes as soon as the text matches, on the keystroke that makes it match, and comes back only at
 * the next loss of focus with failing text.
 *
 * @param options.counts How many boxes the interaction shows.
 * @param options.name The entry name the response posts under.
 * @param options.patternMask The interaction's `pattern-mask`, none when the author wrote none. A
 *   pattern plate's reader refuses checks nothing; the server shows its notice in place of the
 *   interaction, so no island receives one.
 * @param options.reading How each box's text is read.
 * @param options.written How a box's text is written into the response and read back from it: the
 *   text itself for typed text, the XHTML an `xhtml` Extended Text posts ({@link Written}). The
 *   hint judges the text the box shows.
 * @returns The boxes, in order; the setter of one box's text by its index, for its value changes;
 *   and the handler of one box losing focus by its index, for its `blur`.
 * @see https://react.dev/reference/react/useState#storing-information-from-previous-renders
 */
export const useBoxes = (options: {
  readonly counts: BoxCounts;
  readonly name: string;
  readonly patternMask: string | undefined;
  readonly reading: TypedReading;
  readonly written: Written;
}): readonly [
  boxes: Boxes,
  write: (index: number, text: string) => void,
  leave: (index: number) => void,
] => {
  const { counts, name, patternMask, reading, written } = options;
  const [texts, set] = useResponse(name);
  const [layout, setLayout] = useState<Laid>(() => ({
    boxes: laid(texts.map(written.read), counts),
    seen: texts,
  }));
  const matcher = useMemo(
    () => Option.fromUndefinedOr(patternMask).pipe(Option.flatMap(compile)),
    [patternMask],
  );
  const failing = (text: string) =>
    Option.exists(matcher, (compiled) => fails(compiled, text, reading));
  let current = layout;
  if (layout.seen !== texts) {
    current = { boxes: laid(texts.map(written.read), counts), seen: texts };
    setLayout(current);
  }

  const write = (index: number, text: string) => {
    const boxes = withBox(current.boxes, index, (box) => ({
      flagged: box.flagged && failing(text),
      text,
    }));
    const next = boxes
      .map((box) => box.text)
      .filter((each) => posts(each, reading))
      .map(written.write);

    setLayout({ boxes, seen: next });
    set(next);
  };

  const leave = (index: number) => {
    setLayout((prior) => ({
      ...prior,
      boxes: withBox(prior.boxes, index, (box) => ({ ...box, flagged: failing(box.text) })),
    }));
  };

  return [current.boxes, write, leave];
};
