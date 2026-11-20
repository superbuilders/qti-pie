import { Array as Arr } from "effect";

/**
 * A place in a text: its line and its column, both from 1 as `saxes` counts them, a column
 * counting code points.
 */
export interface Position {
  readonly column: number;
  readonly line: number;
}

/**
 * The line break forms XML 1.0 section 2.11 folds to one line feed: `\r\n`, a lone `\r` and `\n`,
 * each of which ends a line.
 */
export const LINE_BREAK = /\r\n|[\n\r]/gu;

/**
 * Find the position of `offset` in `source`.
 *
 * @param source - The text the offset lies in.
 * @param offset - A position in `source`, possibly its length.
 * @returns The line and column of the character at `offset`.
 */
export const positionOf = (source: string, offset: number): Position => {
  const before = source.slice(0, offset);
  let line = 1;
  let lineStart = 0;
  for (const lineBreak of before.matchAll(LINE_BREAK)) {
    line += 1;
    lineStart = lineBreak.index + lineBreak[0].length;
  }

  return { column: Arr.fromIterable(before.slice(lineStart)).length + 1, line };
};
