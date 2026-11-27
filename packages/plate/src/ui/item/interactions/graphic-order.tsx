/**
 * Graphic Order (Q-9) in the server shell: what renders a `qti-graphic-order-interaction`'s payload
 * node, its island in `answering` and its server markup in `review` and `solution`.
 *
 * The island (`#plate/ui/graphic-order/graphic-order.tsx`) takes the author's image, its size as
 * written on it, the hotspots in document order, each named by its `hotspot-label` or else by its
 * place among them, and the number of positions, all read here from the payload and model nodes,
 * so no prop carries the correct response. The review draws the same parts with no island: the
 * image, its areas over it where the author wrote both of the image's dimensions, since the server
 * cannot measure an image, each ordered area's badge, the bank and the numbered positions holding
 * the order shown, each position marked as an Order's is, the response a sequence.
 *
 * @module
 */
import { Option } from "effect";
import type { ReactNode } from "react";
import { numeral } from "#plate/messages.ts";
import type { Locale } from "#plate/messages.ts";
import type { Paired } from "#plate/payload.ts";
import { flag } from "#plate/ui/attributes.ts";
import { Badge } from "#plate/ui/graphic-order/badge.tsx";
import { GraphicOrder } from "#plate/ui/graphic-order/graphic-order.tsx";
import { graphicOrderKeys } from "#plate/ui/graphic-order/labels.ts";
import { CornerPin, GraphicMark } from "#plate/ui/graphic/drawn.tsx";
import { StageFrame, reviewStageOf } from "#plate/ui/graphic/frame.tsx";
import { paintedOf } from "#plate/graphic/geometry.ts";
import { graphicKeys } from "#plate/ui/graphic/labels.ts";
import type { IslandContext, ReviewContext } from "#plate/ui/item/context.ts";
import { contentOf } from "#plate/ui/item/interactions/answering.tsx";
import { namedAreasOf } from "#plate/interactions/area-names.ts";
import { spokenAreasOf } from "#plate/ui/item/interactions/areas.ts";
import { groupNameOf, labelsOf, promptAt, rootOf } from "#plate/ui/item/interactions/labels.ts";
import { markingOf, slotsOf } from "#plate/ui/item/interactions/marks.ts";
import type { AnswerMark, Slot } from "#plate/ui/item/interactions/marks.ts";
import { bankChipPart, chipPart } from "#plate/ui/item/interactions/chips.tsx";
import { PromptPart } from "#plate/ui/prompt.tsx";

/**
 * Render a Graphic Order's island.
 *
 * @param paired The Graphic Order and its payload node.
 * @param paired.model The redacted model node: its `data-*`.
 * @param paired.payload Its payload node: its image, hotspots, binding, prompt and names, and its
 *   effective `max-choices` and `min-choices` (plate's reading `order-min-choices`), the positions
 *   it shows and the fewest it fills.
 * @param context What the page may know of the render.
 * @returns The island.
 */
export const island = (
  { model, payload: node }: Paired<"graphic-order">,
  context: IslandContext,
): ReactNode => {
  const prompt = promptAt(node.prompt, node.response, context);

  return (
    <GraphicOrder
      hotspots={spokenAreasOf(node.hotspots, context)}
      image={contentOf(node.image, "flow", context)}
      labels={labelsOf(graphicOrderKeys, context.locale, {})}
      naming={groupNameOf(prompt, node, context)}
      positions={Number(node.maxChoices)}
      prompt={prompt}
      required={Number(node.minChoices)}
      response={node.declared}
      root={rootOf(model, context)}
      size={node.size}
    />
  );
};

/**
 * Give the mark of the answer a position holds: its slot's `right` or `wrong`; none where the
 * position holds no answer or the review marks nothing.
 *
 * @param slot The position, as the review lays it out ({@link slotsOf}).
 * @returns The mark, or none.
 */
const givenMarkOf = (slot: Slot): AnswerMark | undefined =>
  slot.kind === "given" && slot.mark.kind !== "unmarked" ? slot.mark.kind : undefined;

/**
 * Give the hotspot a review shows missing at a position: the right one of a wrong position, or of
 * a position with no answer.
 *
 * @param slot The position.
 * @returns The hotspot's identifier, none where nothing is missing there.
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
 * Mark each hotspot's area as a review marks it: an ordered one by its position's mark, `right`
 * where the correct sequence holds it there and `wrong` where not; one the correct sequence holds
 * that the order leaves out `missed`; none where the review marks nothing.
 *
 * @param slots The positions as the review lays them out.
 * @returns Each marked hotspot's mark, by identifier.
 */
const areaMarksOf = (slots: readonly Slot[]): ReadonlyMap<string, AnswerMark> => {
  const given = new Map(
    slots.flatMap((slot): readonly (readonly [string, AnswerMark])[] => {
      const mark = givenMarkOf(slot);

      return slot.kind === "given" && mark !== undefined ? [[slot.chip, mark]] : [];
    }),
  );

  return new Map([
    ...slots
      .flatMap(missingAt)
      .filter((identifier) => !given.has(identifier))
      .map((identifier): readonly [string, AnswerMark] => [identifier, "missed"]),
    ...given,
  ]);
};

/**
 * Write the chips a position holds in a review: the answer given there, marked as its slot says,
 * and after it, at a wrong position, the right hotspot, `missed`; or the right hotspot alone where
 * no answer was given; or none.
 *
 * @param slot The position.
 * @param names Each hotspot's name, by identifier.
 * @param locale The locale of plate's own text.
 * @returns The chips.
 */
const chipsAt = (slot: Slot, names: ReadonlyMap<string, string>, locale: Locale): ReactNode => {
  switch (slot.kind) {
    case "empty": {
      return null;
    }
    case "given": {
      const given = names.get(slot.chip);

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
              chipPart(names.get(missed), "missed", "missed", locale),
            ),
          ];
        }
        default: {
          return slot.mark satisfies never;
        }
      }
    }
    case "missed-only": {
      return chipPart(names.get(slot.chip), "missed", "missed", locale);
    }
    default: {
      return slot satisfies never;
    }
  }
};

/**
 * Render a Graphic Order's review or solution: its image, its areas over it where the server knows
 * the image's size, each ordered one `data-placed` with its badge, its bank, and its numbered
 * positions holding the order shown, each position marked when the review marks, the right
 * hotspot standing in a position whose answer is not it. A marked position's chip holds its mark's
 * words, so the list says everything the image shows.
 *
 * The bank holds only the hotspots the order leaves out, as an Order's review does, and is not
 * written where it leaves none out, so each answer shows once: a review has no finger to keep
 * still, which the island's placeholders are for. A hotspot left out that a position shows
 * missing is the bank's `left` chip, with `data-missed` and its words.
 *
 * @param paired The Graphic Order and its payload node.
 * @param paired.model The redacted model node: its `data-*`.
 * @param paired.payload Its payload node: its image, hotspots, the order it shows and its
 *   effective `max-choices`, which counts the positions.
 * @param context What the shell knows of the item and the render.
 * @returns The markup.
 */
export const review = (
  { model, payload: node }: Paired<"graphic-order">,
  context: ReviewContext,
): ReactNode => {
  const { locale } = context;
  const prompt = promptAt(node.prompt, node.response, context);
  const slots = slotsOf(node.ordered, markingOf(node.response, context), Number(node.maxChoices));
  const areaMarks = areaMarksOf(slots);
  const hotspots = namedAreasOf(node.hotspots, locale);
  const hotspotNames = new Map(hotspots.map((hotspot) => [hotspot.identifier, hotspot.label]));
  const placed = new Set(node.ordered);
  const unplaced = new Set(slots.flatMap(missingAt));
  const left = hotspots.filter((hotspot) => !placed.has(hotspot.identifier));
  const names = groupNameOf(prompt, node, context);

  return (
    <div {...rootOf(model, context)} {...names} data-slot="plate-graphic-order" role="group">
      <PromptPart prompt={prompt} />
      <div data-slot="plate-placement">
        <StageFrame
          image={context.content(node.image, { position: "flow" })}
          labels={labelsOf(graphicKeys, context.locale, {})}
          marks={({ size }) =>
            paintedOf(hotspots, size).map(({ area, drawing }) => (
              <GraphicMark
                key={area.identifier}
                area={area}
                data-mark={areaMarks.get(area.identifier)}
                data-placed={flag(placed.has(area.identifier))}
                drawing={drawing}
              />
            ))
          }
          naming={names}
          pins={({ size }) =>
            node.ordered.map((identifier, index) => {
              const hotspot = hotspots.find((each) => each.identifier === identifier);
              const slot = slots[index];

              return hotspot === undefined ? null : (
                <CornerPin key={identifier} area={hotspot} size={size}>
                  <Badge mark={slot === undefined ? undefined : givenMarkOf(slot)}>
                    {numeral(locale, index + 1)}
                  </Badge>
                </CornerPin>
              );
            })
          }
          stage={reviewStageOf(hotspots, node.size, "enhanced")}
        />
        {left.length === 0 ? null : (
          <div data-slot="plate-placement-dock">
            <div data-slot="plate-placement-bank">
              {left.map((hotspot) =>
                bankChipPart(
                  hotspot.label,
                  { copies: false, state: unplaced.has(hotspot.identifier) ? "left" : "rest" },
                  hotspot.identifier,
                  locale,
                ),
              )}
            </div>
          </div>
        )}
        <ol data-slot="plate-graphic-order-positions" role="list">
          {slots.map((slot, index) => (
            // A position is a place, not an item: its place is its key.
            <li
              key={index}
              data-empty={flag(slot.kind === "empty")}
              data-slot="plate-placement-target"
            >
              <div data-slot="plate-placement-target-label">{numeral(locale, index + 1)}</div>
              {chipsAt(slot, hotspotNames, locale)}
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
};
