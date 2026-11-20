/**
 * The attributes plate writes on an interaction's parts: its state attributes, the `data-*`
 * attributes the stylesheet keys on; what names a group or a control; and what the author wrote on
 * the interaction's root. Safe to import on the server and in an island alike.
 *
 * @module
 */

/**
 * An author's `data-*` attributes, by name, as the shell writes them on an interaction's root:
 * each one securing kept that plate does not reserve (decision D24).
 */
type AuthorData = Readonly<Record<`data-${string}`, string>>;

/**
 * Write a boolean state as a `data-*` attribute: present and empty while it holds, absent
 * otherwise, as `data-picked` and `data-selected` are.
 *
 * @param on Whether the state holds.
 * @returns The attribute's value, or none to leave it off.
 */
export const flag = (on: boolean): "" | undefined => (on ? "" : undefined);

/**
 * The attribute that names a group or a control by the text of other elements: the ids of its
 * prompt, or the author's `aria-labelledby` ids that name an element of the item, scoped.
 */
interface LabelledBy {
  readonly "aria-label"?: never;
  readonly "aria-labelledby": string;
}

/**
 * The attribute that names a group or a control by a text of its own: the author's `aria-label`,
 * or plate's own name for a control nothing else names.
 */
export interface Labelled {
  readonly "aria-label": string;
  readonly "aria-labelledby"?: never;
}

/**
 * No attribute: a group nothing names, which a screen reader announces by its role alone.
 */
export interface Unnamed {
  readonly "aria-label"?: never;
  readonly "aria-labelledby"?: never;
}

/**
 * What names a group or a control that something names, the one attribute to spread on it.
 */
export type Named = Labelled | LabelledBy;

/**
 * What names a group or a control, resolved once on the server
 * (`groupNameOf` in `#plate/ui/item/interactions/labels.ts`): at most one attribute, spread on the
 * part it names, so no island or review weighs the author's names again. A kind's own name type
 * holds only the arms it can take: {@link Named} for a control plate always names.
 */
export type NameAttributes = Named | Unnamed;

/**
 * The author's `class` on an interaction's root, as its island's or review's root carries it:
 * QTI's vocabulary classes (`qti-orientation-*`, `qti-labels-*`, `qti-choices-stacking-*`) style
 * the interaction. Undefined where the author wrote none.
 */
export interface ClassRoot {
  readonly className: string | undefined;
}

/**
 * What the author wrote on an interaction's root that its island's or review's root carries: the
 * class, and the author's `data-*` (decision D24), for every kind whose model holds them, all but a
 * Portable Custom Interaction, whose `data-*` are its properties.
 */
export type DataRoot = AuthorData & ClassRoot;

/**
 * The props every island takes of what the author wrote: `root`, spread on its root, and `naming`,
 * spread on the group or control it names.
 *
 * @template N The names the kind's group or control can take.
 * @template R What the kind's root carries: {@link DataRoot}, or {@link ClassRoot} for a kind whose
 *   model holds no author `data-*`.
 */
export interface Authored<N extends NameAttributes, R extends ClassRoot = DataRoot> {
  readonly naming: N;
  readonly root: R;
}
