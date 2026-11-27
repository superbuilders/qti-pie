/**
 * How many of a picks group's options a child picks: a Choice's choices, a Hot Text's hottexts and
 * a Hotspot's areas, each of which QTI bounds by the same two facts, the bound response's
 * cardinality and `max-choices` (QTI 3.0 information model 5.30.2, 5.66.1, 5.68.2). The server
 * reads them here once, and the island and the review read the {@link Picks} it gives. Safe to
 * import on the server.
 *
 * @module
 */

/**
 * How many options a child picks: `one`, as a radio group, where a pick replaces the last; `any`
 * number, as checkboxes; or `at-most` `n`, as checkboxes where a pick past `n` is refused. `n` is a
 * whole number from 2, since a limit of 1 is `one`. A press on a picked area of a Hotspot's image
 * takes it back whatever the kind ({@link pressedOf}).
 *
 * `min-choices` is no part of it: it decides whether a submitted response is valid (5.30.3), which
 * the server judges, and a child is never stopped short of it.
 */
export type Picks =
  | { readonly kind: "any" }
  | { readonly kind: "at-most"; readonly n: number }
  | { readonly kind: "one" };

/**
 * Read how many options a child picks, the one rule every picks group follows: one for a `single`
 * response, or a `multiple` one whose `max-choices` is 1, the XSD's default where the author wrote
 * none; any number for a `max-choices` of 0, which QTI writes for no limit; else at most
 * `max-choices`.
 *
 * @param binding The interaction's bound cardinality and `max-choices`, its default written.
 * @param binding.cardinality The bound response's cardinality.
 * @param binding.maxChoices `max-choices`, held exactly.
 * @returns The picks.
 */
export const picksOf = (binding: {
  readonly cardinality: "multiple" | "single";
  readonly maxChoices: bigint;
}): Picks => {
  if (binding.cardinality === "single" || binding.maxChoices === 1n) {
    return { kind: "one" };
  }

  return binding.maxChoices === 0n
    ? { kind: "any" }
    : { kind: "at-most", n: Number(binding.maxChoices) };
};

/**
 * Give the picks a press on an area of a Hotspot's image leaves, before any limit refuses them: a
 * press on a picked area takes it back, so the one pick's response is NULL again, and several picks
 * lose that one; a press on any other area picks it, in place of the one pick, or beside the picks
 * of several, in the order pressed. The image takes a pick back for one pick as for several, as a
 * second tap on a ringed area clears it, while the list's radio group, which ARIA's radio group
 * pattern governs, never clears its one checked radio: a tap on the image is the only way back to
 * no answer there.
 *
 * @param picks How many options the child picks.
 * @param picked The identifiers picked now, in order, each once.
 * @param identifier The pressed area's identifier.
 * @returns The identifiers picked after the press, in order, each once.
 */
export const pressedOf = (
  picks: Picks,
  picked: readonly string[],
  identifier: string,
): readonly string[] => {
  if (picked.includes(identifier)) {
    return picked.filter((each) => each !== identifier);
  }

  return picks.kind === "one" ? [identifier] : [...picked, identifier];
};

/**
 * The UI SDK group a picks group is, whose `data-slot` a review writes on its group as the island's
 * own group carries it: a radio group for one pick, else a checkbox group.
 */
export type GroupSlot = "checkbox-group" | "radio-group";

/**
 * Give the UI SDK group a picks group is.
 *
 * @param picks How many options the child picks.
 * @returns `radio-group` for one pick, else `checkbox-group`.
 */
export const groupSlotOf = (picks: Picks): GroupSlot =>
  picks.kind === "one" ? "radio-group" : "checkbox-group";
