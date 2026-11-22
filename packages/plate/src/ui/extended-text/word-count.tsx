/**
 * An essay's word count, under its one box, as AlphaTest's player wrote it under every essay, plain
 * or rich, answering or in review (mastery-track-player 941a86a, `ExtendedTextInteraction.tsx` line
 * 848): "1 word", or "N words" for any other count, by the one definition of a word plate's essays
 * and the ledger's word minimum share (`#plate/words.ts`). A plain answer is counted as typed, a
 * rich one on its text, each paragraph's, header's and list item's end a space (`textOfXhtml`).
 *
 * Imported by the essays' islands and by their review alike.
 *
 * @module
 */
import { fillLabel } from "#plate/ui/labels.ts";
import { wordsIn } from "#plate/words.ts";
import type { WordText } from "#plate/words.ts";

/**
 * What the count says: `one` at one word, `other` with `{n}` for any other count.
 */
export interface WordCountLabels {
  readonly one: string;
  readonly other: string;
}

/**
 * Render an essay's word count.
 *
 * The part: `plate-word-count`, a polite live region holding the count's words.
 *
 * @param props The answer's text, how it is read, and the count's words.
 * @param props.labels What the count says ({@link WordCountLabels}).
 * @param props.read How the text is read: `plain` as typed, `rich` with zero-width characters as
 *   nothing.
 * @param props.text The answer's text: a plain answer as typed, a rich one's `textOfXhtml`.
 * @returns The count.
 */
export const WordCount = ({
  labels,
  read,
  text,
}: {
  readonly labels: WordCountLabels;
  readonly read: WordText;
  readonly text: string;
}) => {
  const words = wordsIn(text, read);

  return (
    <p aria-live="polite" data-slot="plate-word-count">
      {words === 1 ? labels.one : fillLabel(labels.other, { n: words })}
    </p>
  );
};
