/**
 * Order (Q-12) in the server shell: what renders a `qti-order-interaction`'s payload node, its
 * island in `answering` (`#plate/ui/order/order.tsx`) and its server markup in `review` and
 * `solution`.
 *
 * The island takes its choices as presented, its orientation, and its positions and how many of
 * them its response requires, the payload's bounds (reading 18), which `redact` counts once. The
 * review shows each answer once: the numbered positions holding the choices the response places,
 * each position marked against the host's solution, the right choice standing in a position whose
 * answer is not it, and a bank of only the choices the response leaves out, none when it leaves
 * none out.
 *
 * @module
 */
import { Option } from "effect";
import type { ReactNode } from "react";
import { numeral } from "#plate/messages.ts";
import type { Locale } from "#plate/messages.ts";
import type { Paired } from "#plate/payload.ts";
import { flag } from "#plate/ui/attributes.ts";
import type { IslandContext, ReviewContext } from "#plate/ui/item/context.ts";
import { contentOf } from "#plate/ui/item/interactions/answering.tsx";
import { bankChipPart, chipPart } from "#plate/ui/item/interactions/chips.tsx";
import { groupNameOf, labelsOf, promptAt, rootOf } from "#plate/ui/item/interactions/labels.ts";
import { markingOf, slotsOf } from "#plate/ui/item/interactions/marks.ts";
import type { Slot } from "#plate/ui/item/interactions/marks.ts";
import { PromptPart } from "#plate/ui/prompt.tsx";
import { chipName } from "#plate/ui/item/interactions/text.ts";
import { orderKeys } from "#plate/ui/order/labels.ts";
import { Order } from "#plate/ui/order/order.tsx";

/**
 * Give the choice a review shows missing at a position: the right choice of a wrong position, or
 * of a position with no answer.
 *
 * @param slot The position.
 * @returns The choice's identifier, or none.
 */
const missingAt = (slot: Slot): readonly string[] => {
  switch (slot.kind) {
    case "empty": {
      return [];
    }
    case "given": {
      return slot.mark.kind === "wrong" ? Option.toArray(slot.mark.missed) : [];
    }
    case "missed-only": {
      return [slot.chip];
    }
    default: {
      return slot satisfies never;
    }
  }
};

/**
 * Each choice's content as a review writes it, by identifier: `original`, with the author's ids,
 * for the one chip that shows the choice where it stands (in the bank, or in the position it was
 * given at), and `copy`, with none of them, for a `missed` chip, which always repeats a choice the
 * review shows elsewhere too, in the bank or at the position the response gave it, so no `id`
 * stands twice.
 */
interface Writings {
  readonly copy: ReadonlyMap<string, ReactNode>;
  readonly original: ReadonlyMap<string, ReactNode>;
}

/**
 * Write the chips a position holds in a review: the answer given there, marked as its slot says,
 * and after it, at a wrong position, the right choice, `missed`, written as a copy; or the right
 * choice alone, a copy too, where no answer was given; or none.
 *
 * @param slot The position.
 * @param writings Each choice's content, written as its original and as a copy.
 * @param locale The locale of plate's own text.
 * @returns The position's chips.
 */
const chipsAt = (slot: Slot, writings: Writings, locale: Locale): ReactNode => {
  switch (slot.kind) {
    case "empty": {
      return null;
    }
    case "given": {
      const given = writings.original.get(slot.chip);

      switch (slot.mark.kind) {
        case "unmarked": {
          return chipPart(given, undefined, "given", locale);
        }
        case "right": {
          return chipPart(given, "right", "given", locale);
        }
        case "wrong": {
          return [
            chipPart(given, "wrong", "given", locale),
            ...Option.toArray(slot.mark.missed).map((missed) =>
              chipPart(writings.copy.get(missed), "missed", "missed", locale),
            ),
          ];
        }
        default: {
          return slot.mark satisfies never;
        }
      }
    }
    case "missed-only": {
      return chipPart(writings.copy.get(slot.chip), "missed", "missed", locale);
    }
    default: {
      return slot satisfies never;
    }
  }
};

/**
 * Render an Order's island: its choices as presented, and as many positions as the most choices
 * its response may place, of which it must fill the fewest before it posts.
 *
 * @param paired The Order.
 * @param paired.payload Its payload: its choices as presented, its bounds, its orientation and
 *   names.
 * @param context What the page may know of the render.
 * @returns The island.
 */
export const island = (
  { model, payload: node }: Paired<"order">,
  context: IslandContext,
): ReactNode => {
  const prompt = promptAt(node.prompt, node.response, context);

  return (
    <Order
      choices={node.choices.map((choice, index) => ({
        content: contentOf(choice.content, "phrasing", context),
        copy: context.content(choice.content, { position: "phrasing", writing: "copy" }),
        identifier: choice.identifier,
        label: chipName(
          choice.content,
          Option.none(),
          { count: node.choices.length, n: index + 1 },
          context.locale,
        ),
      }))}
      labels={labelsOf(orderKeys, context.locale, {})}
      name={node.formName}
      naming={groupNameOf(prompt, node, context)}
      orientation={Option.getOrUndefined(node.orientation)}
      positions={node.maxChoices}
      prompt={prompt}
      required={node.minChoices}
      root={rootOf(model, context)}
    />
  );
};

/**
 * Render an Order's review: its numbered positions holding the choices the response places, each
 * position marked when the review marks, the right choice standing in a position whose answer is
 * not it, after its bank, which holds only the choices the response leaves out and is not written
 * when it leaves none out. A placed choice stands in its position alone, so the review shows each
 * answer once; a choice left out that a position shows missing says so in the bank too.
 *
 * @param paired The Order.
 * @param paired.payload Its payload: its choices as presented, the order it shows, and the most
 *   choices it may place, one position each.
 * @param context What the shell knows.
 * @returns The markup.
 */
export const review = (
  { model, payload: node }: Paired<"order">,
  context: ReviewContext,
): ReactNode => {
  const { locale } = context;
  const prompt = promptAt(node.prompt, node.response, context);
  const slots = slotsOf(node.placed, markingOf(node.response, context), node.maxChoices);
  const placed = new Set(node.placed);
  const missing = new Set(slots.flatMap(missingAt));
  const left = node.choices.filter((choice) => !placed.has(choice.identifier));
  const writings: Writings = {
    copy: new Map(
      node.choices.map((choice) => [
        choice.identifier,
        context.content(choice.content, { position: "phrasing", writing: "copy" }),
      ]),
    ),
    original: new Map(
      node.choices.map((choice) => [
        choice.identifier,
        context.content(choice.content, { position: "phrasing" }),
      ]),
    ),
  };
  const orientation = Option.getOrUndefined(node.orientation);

  return (
    <div
      {...rootOf(model, context)}
      {...groupNameOf(prompt, node, context)}
      data-orientation={orientation}
      data-slot="plate-order"
      role="group"
    >
      <PromptPart prompt={prompt} />
      <div data-slot="plate-placement">
        {left.length === 0 ? null : (
          <div data-slot="plate-placement-dock">
            <div data-slot="plate-placement-bank">
              {left.map((choice) =>
                bankChipPart(
                  writings.original.get(choice.identifier),
                  { copies: false, state: missing.has(choice.identifier) ? "left" : "rest" },
                  choice.identifier,
                  locale,
                ),
              )}
            </div>
          </div>
        )}
        <ol data-slot="plate-order-positions" role="list">
          {slots.map((slot, index) => (
            // A position is a place, not an item: its place is its key.
            <li
              key={index}
              data-empty={flag(slot.kind === "empty")}
              data-slot="plate-placement-target"
            >
              <div data-slot="plate-placement-target-label">{numeral(locale, index + 1)}</div>
              {chipsAt(slot, writings, locale)}
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
};
