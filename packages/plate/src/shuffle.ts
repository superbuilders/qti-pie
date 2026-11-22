/**
 * The order a shuffled interaction presents its choices in: each choice that is not fixed ranked by
 * a keyed hash of its identifier, each fixed choice at its document position
 * ({@link presentedOrder}).
 *
 * "If the shuffle characteristic is 'true' then the delivery engine must randomize the order in
 * which the choices are initially presented, subject to the value of the fixed attribute of each
 * choice" (the information model's ChoiceInteraction). A choice's rank is HMAC-SHA-256 keyed by the
 * shuffle seed over the set's fields and the choice's identifier (`keyedDigest` in
 * `#plate/digest.ts`): the response's identifier, the set's name for an interaction that
 * shuffles two sets apart (Match's sources and targets), then the choice's. So the order is a
 * function of the seed and the identifiers alone, never of a position: the same seed presents the
 * same order on every request and host, and a choice added to or removed from the set leaves every
 * other choice's relative order as it was. The six shuffling interactions, Choice and Inline Choice
 * (`presented` in `#plate/interactions/choice.ts`), Order, Gap Match, Graphic Gap Match, Associate
 * and Match, all present through it.
 *
 * The seed is the served item's shuffle seed (`shuffleSeed` in `#plate/seed.ts`), which the host
 * passes as the configuration's `seed`.
 *
 * @module
 */
import { Array as Arr, Order } from "effect";
import { keyedDigest } from "#plate/digest.ts";

/**
 * Give a shuffled set's choices in the order they are presented: the choices that are not fixed in
 * ascending rank, each at a position no fixed choice holds, and each fixed choice at its document
 * position.
 *
 * @example
 *   presentedOrder(seeds.shuffle, ["RESPONSE"], choices, (choice) => choice.fixed);
 *
 * @param seed The configuration's `seed`.
 * @param set The set's fields: the identifier of the response the interaction binds, and the set's
 *   name for an interaction that shuffles more than one set apart.
 * @param choices The set's choices, in document order, each identifier once.
 * @param isFixed Whether a choice keeps its document position: its `fixed`, where its element
 *   declares one, and never for a choice whose element declares none, such as a gap text.
 * @returns The same choices, in presented order.
 */
export const presentedOrder = <Choice extends { readonly identifier: string }>(
  seed: string,
  set: readonly [response: string] | readonly [response: string, name: string],
  choices: readonly Choice[],
  isFixed: (choice: Choice) => boolean,
): readonly Choice[] => {
  const slots = choices.flatMap((choice, slot) => (isFixed(choice) ? [] : [slot]));
  const ranked = Arr.sort(
    choices
      .filter((choice) => !isFixed(choice))
      .map((choice) => ({
        choice,
        rank: keyedDigest(seed, [...set, choice.identifier]).toString("hex"),
      })),
    Order.mapInput(Order.String, ({ rank }: { readonly rank: string }) => rank),
  );
  const presented = [...choices];
  for (const [slot, { choice }] of Arr.zip(slots, ranked)) {
    presented[slot] = choice;
  }

  return presented;
};
