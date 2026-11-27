/**
 * Graphic Associate (Q-7) in the server shell: what renders a `qti-graphic-associate-interaction`'s
 * payload node, its island in `answering` (`#plate/ui/graphic-associate/graphic-associate.tsx`) and
 * its server markup in `review` and `solution`, both from the payload node alone, as the core's
 * `redact` gave it.
 *
 * The island takes the author's image, its size as written on it, and the hotspots in document
 * order, each with its area, its `match-group` and `match-max`, and its name, its `hotspot-label`
 * or else its place among them, so no prop carries the correct response. The review draws the same
 * parts with no island, in the stage's frame (`#plate/ui/graphic/frame.tsx`): the image, its areas'
 * marks and a line for each pair shown where the author wrote both of the image's dimensions, then
 * the bank and a box per pair, each marked as a pair is: right where the correct response holds its
 * two hotspots in either order, "so (A,B) and (B,A) are equivalent" (QTI 3.0 information model
 * 8.13), the correct pairs not given after them, `missed`.
 *
 * @module
 */
import type { ReactNode } from "react";
import { countsOf } from "#plate/interactions/counts.ts";
import type { Paired } from "#plate/payload.ts";
import { flag } from "#plate/ui/attributes.ts";
import { GraphicAssociate } from "#plate/ui/graphic-associate/graphic-associate.tsx";
import type { GraphicAssociateArea } from "#plate/ui/graphic-associate/graphic-associate.tsx";
import { graphicAssociateKeys } from "#plate/ui/graphic-associate/labels.ts";
import { GraphicMark, PairLine } from "#plate/ui/graphic/drawn.tsx";
import { StageFrame, reviewStageOf } from "#plate/ui/graphic/frame.tsx";
import { paintedOf } from "#plate/graphic/geometry.ts";
import { graphicKeys } from "#plate/ui/graphic/labels.ts";
import type { IslandContext, ReviewContext } from "#plate/ui/item/context.ts";
import { contentOf } from "#plate/ui/item/interactions/answering.tsx";
import { namedAreasOf } from "#plate/interactions/area-names.ts";
import { spokenAreasOf } from "#plate/ui/item/interactions/areas.ts";
import { limitOf } from "#plate/placement/limit.ts";
import { groupNameOf, labelsOf, promptAt, rootOf } from "#plate/ui/item/interactions/labels.ts";
import { markingOf } from "#plate/ui/item/interactions/marks.ts";
import { boxesShown } from "#plate/ui/item/interactions/pair-boxes.ts";
import { halfName } from "#plate/ui/placement/associable.ts";
import { bankChipPart, bankedOf } from "#plate/ui/item/interactions/chips.tsx";
import { markPart, wordsOfMark } from "#plate/ui/item/interactions/words.tsx";
import { PromptPart } from "#plate/ui/prompt.tsx";

/**
 * Give the hotspots as the island and the review show them, in document order: each one named, by
 * {@link namedAreasOf}, or by {@link spokenAreasOf} with its read-aloud for the island, with its
 * `match-group` and its `match-max`, 0 being no limit.
 *
 * @param hotspots The hotspots, each named.
 * @returns The hotspots.
 */
const areasOf = (
  hotspots: readonly (Omit<GraphicAssociateArea, "matchMax"> & { readonly matchMax: bigint })[],
): readonly GraphicAssociateArea[] =>
  hotspots.map((hotspot) => ({
    ...hotspot,
    matchMax: limitOf(hotspot.matchMax),
  }));

/**
 * Render a Graphic Associate's island.
 *
 * The island's `maxAssociations` is the payload's `max-associations` (5.59.2), the XSD's default of
 * 1 where the author wrote none and 0 no limit: an item bound to a `single` response opens only
 * with 1 there (plate's reading `binding-and-count-sentences`), so the island never posts a
 * `single` response twice.
 *
 * @param paired The Graphic Associate and its payload node.
 * @param paired.payload Its payload node: its image, hotspots, `max-associations`, prompt and
 *   names.
 * @param context What the page may know of the render.
 * @returns The island.
 */
export const island = (
  { model, payload: node }: Paired<"graphic-associate">,
  context: IslandContext,
): ReactNode => {
  const prompt = promptAt(node.prompt, node.response, context);

  return (
    <GraphicAssociate
      areas={areasOf(spokenAreasOf(node.hotspots, context))}
      image={contentOf(node.image, "flow", context)}
      labels={labelsOf(graphicAssociateKeys, context.locale, {})}
      maxAssociations={limitOf(node.maxAssociations)}
      naming={groupNameOf(prompt, node, context)}
      prompt={prompt}
      response={node.declared}
      root={rootOf(model, context)}
      size={node.size}
    />
  );
};

/**
 * Render a Graphic Associate's review or solution: its image in the stage's frame, each area's mark
 * `data-placed` where a pair shown holds it and a line for each pair, then its bank and a box for
 * each pair the payload shows, each pair marked when the review marks, the correct pairs not given
 * after them, `missed`.
 *
 * The markup is the island's parts, without the empty box a new pair begins in:
 * `plate-graphic-associate`, `plate-prompt`, the stage's `plate-graphic` holding each area's
 * `plate-graphic-mark` and each pair's `plate-graphic-associate-line`, with its `data-mark`, where
 * the author wrote both of the image's dimensions, since the server cannot measure an image; then
 * `plate-placement`, its bank of `plate-placement-chip`s (`bankChipPart`: `data-copies` for a
 * hotspot with copies, `data-used` once it is in as many pairs as its `match-max` allows, and
 * `data-missed` with the mark's words while it has a use left and a missed box shows it), and
 * `plate-placement-boxes`, each `plate-placement-box`
 * `data-paired`, with its `data-mark` and its mark's words in `review` by the host's marks,
 * holding its two halves, each a `plate-placement-target` named as the island names it with its
 * hotspot's `plate-placement-chip`.
 *
 * @param paired The Graphic Associate and its payload node.
 * @param paired.payload Its payload node: its image, hotspots and the pairs it shows, the candidate's in
 *   `review` and the correct ones in `solution`.
 * @param context What the shell knows of the item and the render.
 * @returns The markup.
 */
export const review = (
  { model, payload: node }: Paired<"graphic-associate">,
  context: ReviewContext,
): ReactNode => {
  const { locale } = context;
  const labels = labelsOf(graphicAssociateKeys, locale, {});
  const prompt = promptAt(node.prompt, node.response, context);
  const names = groupNameOf(prompt, node, context);
  const areas = areasOf(namedAreasOf(node.hotspots, locale));
  const byIdentifier = new Map(areas.map((area) => [area.identifier, area]));
  const given = node.pairs;
  const boxes = boxesShown(given, markingOf(node.response, context));
  const uses = countsOf(given.flat());
  const placed = new Set(given.flat());
  const missed = new Set(boxes.flatMap((box) => (box.mark === "missed" ? box.pair : [])));

  return (
    <div {...rootOf(model, context)} {...names} data-slot="plate-graphic-associate" role="group">
      <PromptPart prompt={prompt} />
      <StageFrame
        image={context.content(node.image, { position: "flow" })}
        labels={labelsOf(graphicKeys, context.locale, {})}
        marks={({ size }) => (
          <>
            {paintedOf(areas, size).map(({ area, drawing }) => (
              <GraphicMark
                key={area.identifier}
                area={area}
                data-placed={flag(placed.has(area.identifier))}
                drawing={drawing}
              />
            ))}
            {boxes.map(({ mark, pair: [first, second] }, index) => (
              // A box is a place, not an item: its place is its key.
              <PairLine
                key={index}
                from={byIdentifier.get(first)}
                mark={mark}
                size={size}
                to={byIdentifier.get(second)}
              />
            ))}
          </>
        )}
        naming={names}
        stage={reviewStageOf(areas, node.size, "enhanced")}
      />
      <div data-slot="plate-placement">
        <div data-slot="plate-placement-dock">
          <div data-slot="plate-placement-bank">
            {node.hotspots.map((hotspot) =>
              bankChipPart(
                byIdentifier.get(hotspot.identifier)?.label,
                bankedOf(
                  hotspot.matchMax,
                  uses.get(hotspot.identifier) ?? 0n,
                  missed.has(hotspot.identifier),
                ),
                hotspot.identifier,
                locale,
              ),
            )}
          </div>
        </div>
        <ol data-slot="plate-placement-boxes" role="list">
          {boxes.map(({ mark, pair }, index) => (
            // A box is a place, not an item: its place is its key.
            <li key={index} data-mark={mark} data-paired="" data-slot="plate-placement-box">
              {([0, 1] as const).map((side) => (
                // A half is a place too, the first or the second.
                <div
                  key={side}
                  aria-label={halfName(labels, { box: index, side })}
                  data-slot="plate-placement-target"
                  role="group"
                >
                  <span data-slot="plate-placement-chip">
                    {byIdentifier.get(pair[side])?.label}
                  </span>
                </div>
              ))}
              {markPart(wordsOfMark(mark), locale)}
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
};
