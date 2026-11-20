/**
 * Read-aloud beside a choice: what an island or the server shell is given of read-aloud for one
 * choice, and how a choice's part stands beside its control. Safe to import on the server and in an
 * island alike: it holds no state, so the server shell writes a Hot Text's hottext beside its
 * control in its line as an island writes a chip beside its control in its bank. The control
 * itself is read-aloud's island (`#plate/ui/read-aloud/read-aloud.tsx`).
 *
 * @module
 */
import type { Key, ReactElement, ReactNode } from "react";

/**
 * What a choice is given of read-aloud: `readAloud`, read-aloud's control for the catalog the
 * choice references, absent where the candidate hears none (`spokenOf` in
 * `#plate/ui/item/interactions/answering.tsx`).
 */
export interface Spoken {
  readonly readAloud?: ReactNode;
}

/**
 * Write a choice's part with read-aloud's control beside it, the two in a `span` of the kind's own
 * slot, so they wrap as one item of the row or the line they stand in; the part alone where the
 * candidate hears none. The control stands beside the part, never in it: a chip is a button.
 *
 * @param part The choice's part, such as its chip in the bank, keyed as `at.key`.
 * @param spoken The choice's control, or none.
 * @param at The key the written part takes among its siblings, and the slot of the `span`.
 * @param at.key The key.
 * @param at.slot The slot.
 * @returns The part, beside its control where it has one.
 */
export const spokenBeside = (
  part: ReactElement,
  { readAloud }: Spoken,
  at: { readonly key: Key; readonly slot: string },
): ReactNode =>
  readAloud === undefined ? (
    part
  ) : (
    <span data-slot={at.slot} key={at.key}>
      {part}
      {readAloud}
    </span>
  );
