/**
 * A placement bank's caption: the words over a Gap Match's and a Graphic Gap Match's bank that tell
 * a child to drag a choice into place, where the host asks for them (`bankCaption`), which an
 * island's bank and a review's write alike. It holds no client state, so the server and an island
 * import it alike.
 *
 * @module
 */
import type { ReactNode } from "react";

/**
 * Write a bank's caption, the `plate-placement-caption` part, at the head of its dock, over the
 * bank, so a screen reader meets the words before the choices they speak of.
 *
 * @param props The caption.
 * @param props.caption The words, or undefined where the host asks for none.
 * @returns The `plate-placement-caption` part, or nothing.
 */
export const BankCaption = ({ caption }: { readonly caption: string | undefined }): ReactNode =>
  caption === undefined ? null : <p data-slot="plate-placement-caption">{caption}</p>;
