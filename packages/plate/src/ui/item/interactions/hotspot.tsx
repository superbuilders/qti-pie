/**
 * Hotspot (Q-10) in the server shell: what renders a `qti-hotspot-interaction`'s payload node, its
 * island in `answering` and its server markup in `review` and `solution`.
 *
 * The island (`#plate/ui/hotspot/hotspot.tsx`) takes the author's image, its size as written on
 * it, and the hotspots in document order, each named by its `hotspot-label` or else by its place
 * among them, all read here from the payload node, so no prop carries the correct response or a
 * mapping. The review draws the same parts with no island, in the stage's frame
 * (`#plate/ui/graphic/frame.tsx`): the image, its areas' marks over it where the author wrote both
 * of the image's dimensions, since the server cannot measure an image, and the list of hotspots,
 * each picked one `data-selected` and each one the review marks `data-mark`, each marked as a
 * Choice's options are (`marksOf` in `#plate/ui/picks/marks.ts`).
 *
 * The stage's region and the list are named apart: the list is a group of controls, so plate names
 * it where the author named it by nothing ("Answer", numbered among the item's unnamed controls),
 * and the region is the picture, which its image's own name, then the catalog's word for a picture,
 * names then.
 *
 * @module
 */
import type { ReactNode } from "react";
import type { Paired } from "#plate/payload.ts";
import { CheckBadge, CornerPin, GraphicMark } from "#plate/ui/graphic/drawn.tsx";
import { StageFrame, reviewStageOf } from "#plate/ui/graphic/frame.tsx";
import { paintedOf } from "#plate/graphic/geometry.ts";
import { graphicKeys } from "#plate/ui/graphic/labels.ts";
import { Hotspot } from "#plate/ui/hotspot/hotspot.tsx";
import { hotspotKeys } from "#plate/ui/hotspot/labels.ts";
import type { IslandContext, ReviewContext } from "#plate/ui/item/context.ts";
import { contentOf } from "#plate/ui/item/interactions/answering.tsx";
import { namedAreasOf } from "#plate/interactions/area-names.ts";
import { spokenAreasOf } from "#plate/ui/item/interactions/areas.ts";
import {
  controlNameOf,
  groupNameOf,
  labelsOf,
  ownName,
  promptAt,
  rootOf,
} from "#plate/ui/item/interactions/labels.ts";
import { markingOf } from "#plate/ui/item/interactions/marks.ts";
import { marksOf, pickParts } from "#plate/ui/picks/marks.ts";
import { groupSlotOf, picksOf } from "#plate/interactions/picks.ts";
import { ReviewedPick } from "#plate/ui/picks/review.tsx";
import { PromptPart } from "#plate/ui/prompt.tsx";

/**
 * Render a Hotspot's island.
 *
 * @param paired The Hotspot and its payload node.
 * @param paired.model The redacted model node: the author's `data-max-selections-message`, its
 *   `data-*`, and its place among the item's unnamed controls.
 * @param paired.payload Its payload node: its image, hotspots, binding, `max-choices`, prompt and
 *   names.
 * @param context What the page may know of the render.
 * @returns The island.
 */
export const island = (
  { model, payload: node }: Paired<"hotspot">,
  context: IslandContext,
): ReactNode => {
  const prompt = promptAt(node.prompt, node.response, context);

  return (
    <Hotspot
      hotspots={spokenAreasOf(node.choices, context)}
      image={contentOf(node.image, "flow", context)}
      labels={labelsOf(hotspotKeys, context.locale, { limit: model.messages.max })}
      name={node.formName}
      naming={controlNameOf(prompt, node, ownName(model, context), context)}
      picks={picksOf(node)}
      prompt={prompt}
      root={rootOf(model, context)}
      size={node.size}
      stageNaming={groupNameOf(prompt, node, context)}
    />
  );
};

/**
 * Render a Hotspot's review or solution: its image in the stage's frame, the areas' marks over it
 * where the server knows the image's size, and its list of hotspots, each marked as a Choice's
 * options are, on its area's mark and its row alike, a picked area with its check badge, and each
 * row holding its mark's words. The frame is sized by the smallest area, as the island's stage is.
 *
 * @param paired The Hotspot and its payload node.
 * @param paired.model The redacted model node: its `data-*`, and its place among the item's
 *   unnamed controls.
 * @param paired.payload Its payload node: its image, hotspots and the identifiers it shows picked.
 * @param context What the shell knows of the item and the render.
 * @returns The markup.
 */
export const review = (
  { model, payload: node }: Paired<"hotspot">,
  context: ReviewContext,
): ReactNode => {
  const { locale } = context;
  const prompt = promptAt(node.prompt, node.response, context);
  const picked = new Set(node.restore);
  const reviewOf = marksOf(node.restore, markingOf(node.response, context));
  const hotspots = namedAreasOf(node.choices, locale);

  return (
    <div {...rootOf(model, context)} data-slot="plate-hotspot">
      <PromptPart prompt={prompt} />
      <StageFrame
        image={context.content(node.image, { position: "flow" })}
        labels={labelsOf(graphicKeys, context.locale, {})}
        marks={({ size }) =>
          paintedOf(hotspots, size).map(({ area, drawing }) => (
            <GraphicMark
              key={area.identifier}
              area={area}
              {...pickParts[reviewOf(area.identifier)].attributes}
              drawing={drawing}
            />
          ))
        }
        naming={groupNameOf(prompt, node, context)}
        pins={({ size }) =>
          hotspots.map((hotspot) =>
            picked.has(hotspot.identifier) ? (
              <CornerPin key={hotspot.identifier} area={hotspot} size={size}>
                <CheckBadge />
              </CornerPin>
            ) : null,
          )
        }
        stage={reviewStageOf(hotspots, node.size)}
      />
      <div
        {...controlNameOf(prompt, node, ownName(model, context), context)}
        data-slot={groupSlotOf(picksOf(node))}
        role="group"
      >
        {hotspots.map((hotspot) => (
          <ReviewedPick
            key={hotspot.identifier}
            element="div"
            locale={locale}
            review={reviewOf(hotspot.identifier)}
            slot="plate-hotspot-option"
          >
            <span data-slot="plate-hotspot-label">{hotspot.label}</span>
          </ReviewedPick>
        ))}
      </div>
    </div>
  );
};
