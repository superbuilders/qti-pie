/**
 * Graphic Gap Match (Q-8) in the server shell: what renders a
 * `qti-graphic-gap-match-interaction`'s payload node, its island in `answering` and its server
 * markup in `review` and `solution`.
 *
 * The island (`#plate/ui/graphic-gap-match/graphic-gap-match.tsx`) takes the author's image, its
 * size as written on it, the gap choices as presented, each with its `match-group` and
 * `match-max`, and the hotspots in document order, each named by its `hotspot-label` or else by
 * its place among them, all read here from the payload node, so no prop carries the correct
 * response. The review draws the same parts with no island: the bank, the image with each
 * hotspot's area and the choices it holds over it, where the author wrote both of the image's
 * dimensions, since the server cannot measure an image, and the list of hotspots, each holding the
 * choices the response puts there, each pair marked when the review marks, the response a bag in
 * which a pair may repeat. A hotspot's row in either is `data-unnamed` where its name is plate's,
 * the author having named it nothing, and either draws an arrow beside each hotspot whose author's
 * class `plate-arrow-up` or `plate-arrow-down` asks for one.
 *
 * @module
 */
import type { ReactNode } from "react";
import { Option } from "effect";
import type { ArrowDirection } from "#plate/interactions/area.ts";
import { countsOf } from "#plate/interactions/counts.ts";
import { scopedId } from "#plate/form/encoding.ts";
import type { Locale } from "#plate/messages.ts";
import type { PayloadOf } from "#plate/model/interactions.ts";
import { flag } from "#plate/ui/attributes.ts";
import type { ChoiceMeasure } from "#plate/ui/graphic-gap-match/fit.ts";
import { HotspotArrows } from "#plate/ui/graphic-gap-match/arrows.tsx";
import { GraphicGapMatch } from "#plate/ui/graphic-gap-match/graphic-gap-match.tsx";
import type { GraphicGapHotspot } from "#plate/ui/graphic-gap-match/graphic-gap-match.tsx";
import { graphicGapMatchKeys } from "#plate/ui/graphic-gap-match/labels.ts";
import { PlacedChoices } from "#plate/ui/graphic-gap-match/placed.tsx";
import { GraphicMark } from "#plate/ui/graphic/drawn.tsx";
import { StageFrame, reviewStageOf } from "#plate/ui/graphic/frame.tsx";
import { paintedOf } from "#plate/ui/graphic/geometry.ts";
import { floorWidthOf } from "#plate/ui/graphic/scale.ts";
import { sizeOf } from "#plate/ui/graphic/size.ts";
import { graphicKeys } from "#plate/ui/graphic/labels.ts";
import type { IslandContext, ReviewContext } from "#plate/ui/item/context.ts";
import { associableOf, contentOf } from "#plate/ui/item/interactions/answering.tsx";
import { namedAreasOf, spokenAreasOf } from "#plate/ui/item/interactions/areas.ts";
import { limitOf } from "#plate/ui/item/interactions/facts.ts";
import { groupNameOf, labelsOf, promptAt, rootOf } from "#plate/ui/item/interactions/labels.ts";
import { markingOf } from "#plate/ui/item/interactions/marks.ts";
import {
  bankChipPart,
  bankedOf,
  chipPart,
  missedOf,
  pairsByTarget,
} from "#plate/ui/item/interactions/chips.tsx";
import { PromptPart } from "#plate/ui/prompt.tsx";
import { shownText } from "#plate/ui/item/interactions/text.ts";
import type { Paired } from "#plate/payload.ts";

/**
 * Give the hotspots as the island and the review show them, in document order: each one named, by
 * {@link namedAreasOf}, or by {@link spokenAreasOf} with its read-aloud for the island, with its
 * `match-group`, its `match-max`, 0 being no limit, and the arrow its author asks for.
 *
 * @param hotspots The hotspots, each named.
 * @returns The hotspots.
 */
const hotspotsOf = (
  hotspots: readonly (Omit<GraphicGapHotspot, "arrow" | "matchMax"> & {
    readonly arrow: Option.Option<ArrowDirection>;
    readonly matchMax: bigint;
  })[],
): readonly GraphicGapHotspot[] =>
  hotspots.map((hotspot) => ({
    ...hotspot,
    arrow: Option.getOrUndefined(hotspot.arrow),
    matchMax: limitOf(hotspot.matchMax),
  }));

/**
 * Measure a gap choice's content for the fit on the image (`#plate/ui/graphic-gap-match/fit.ts`):
 * a gap text's words, as it shows them; a gap image's size, where its author wrote both of its
 * dimensions; else an image whose size only the browser knows.
 *
 * @param choice The choice: its content, and the size written on its image.
 * @param locale The locale a notice inside it is written in.
 * @returns The measure.
 */
const measureOf = (
  choice: PayloadOf<"graphic-gap-match">["choices"][number],
  locale: Locale,
): ChoiceMeasure => {
  const text = shownText(choice.content, locale);
  if (text !== "") {
    return { kind: "text", words: text.split(" ") };
  }

  const size = sizeOf(choice.size);

  return size === undefined
    ? { kind: "unsized" }
    : { height: size.height, kind: "image", width: size.width };
};

/**
 * Render a Graphic Gap Match's island.
 *
 * @param paired The Graphic Gap Match and its payload node.
 * @param paired.model The redacted model node: the author's `data-max-selections-message`.
 * @param paired.payload Its payload node: its image, gap choices as presented, hotspots, `max-associations`,
 *   prompt and names.
 * @param context What the page may know of the render.
 * @returns The island.
 */
export const island = (
  { model, payload: node }: Paired<"graphic-gap-match">,
  context: IslandContext,
): ReactNode => {
  const prompt = promptAt(node.prompt, node.response, context);

  return (
    <GraphicGapMatch
      gapChoices={node.choices.map((choice, index) => ({
        ...associableOf(choice, { count: node.choices.length, n: index + 1 }, "phrasing", context),
        measure: measureOf(choice, context.locale),
      }))}
      hotspots={hotspotsOf(spokenAreasOf(node.hotspots, context))}
      image={contentOf(node.image, "flow", context)}
      labels={labelsOf(graphicGapMatchKeys, context.locale, { totalReached: model.messages.max })}
      maxAssociations={limitOf(node.maxAssociations)}
      name={node.formName}
      naming={groupNameOf(prompt, node, context)}
      prompt={prompt}
      root={rootOf(model, context)}
      size={node.size}
    />
  );
};

/**
 * Render a Graphic Gap Match's review or solution: its bank, its image in the stage's frame with
 * each hotspot's mark and the choices each holds over it where the server knows the image's size,
 * and its list of hotspots, each holding the choices the response puts there, a repeated pair as
 * often as it repeats, each marked when the review marks, then each correct pair missed in its
 * hotspot. The frame is sized by the smallest area, as the island's stage is, and the choices on
 * the image are pinned over their areas at the page's own size, chosen and laid out as the
 * island's are (`#plate/ui/graphic-gap-match/fit.ts`).
 *
 * @param paired The Graphic Gap Match and its payload node.
 * @param paired.payload Its payload node: its image, gap choices as presented, hotspots and the pairs it
 *   shows.
 * @param context What the shell knows of the item and the render.
 * @returns The markup.
 */
export const review = (
  { model, payload: node }: Paired<"graphic-gap-match">,
  context: ReviewContext,
): ReactNode => {
  const { locale } = context;
  const prompt = promptAt(node.prompt, node.response, context);
  const byHotspot = pairsByTarget(node.pairs, markingOf(node.response, context));
  const unplaced = missedOf(byHotspot);
  const uses = countsOf(node.pairs.map((pair) => pair.chip));
  const hotspots = hotspotsOf(namedAreasOf(node.hotspots, locale));
  const names = groupNameOf(prompt, node, context);
  const contents = new Map(
    node.choices.map((choice) => [
      choice.identifier,
      context.content(choice.content, { position: "phrasing" }),
    ]),
  );
  const measures = new Map(
    node.choices.map((choice) => [choice.identifier, measureOf(choice, locale)]),
  );
  const placed = hotspots.map((hotspot) => ({
    area: hotspot,
    choices: (byHotspot.get(hotspot.identifier) ?? []).flatMap((chip, at) => {
      const content = contents.get(chip.identifier);
      const key = `${chip.identifier} ${String(at)}`;
      const measure = measures.get(chip.identifier);

      if (measure === undefined) {
        return [];
      }

      return [{ content, key, mark: chip.mark, measure }];
    }),
    identifier: hotspot.identifier,
  }));

  return (
    <div {...rootOf(model, context)} {...names} data-slot="plate-graphic-gap-match" role="group">
      <PromptPart prompt={prompt} />
      <div data-slot="plate-placement">
        <div data-slot="plate-placement-dock">
          <div data-slot="plate-placement-bank">
            {node.choices.map((choice) =>
              bankChipPart(
                contents.get(choice.identifier),
                bankedOf(
                  choice.matchMax,
                  uses.get(choice.identifier) ?? 0n,
                  unplaced.has(choice.identifier),
                ),
                choice.identifier,
                locale,
              ),
            )}
          </div>
        </div>
        <StageFrame
          image={context.content(node.image, { position: "flow" })}
          labels={labelsOf(graphicKeys, context.locale, {})}
          marks={({ size }) =>
            paintedOf(hotspots, size).map(({ area, drawing }) => (
              <GraphicMark
                key={area.identifier}
                area={area}
                data-placed={flag(byHotspot.has(area.identifier))}
                drawing={drawing}
              />
            ))
          }
          naming={names}
          pins={({ scale, size }) => (
            <>
              <HotspotArrows hotspots={hotspots} size={size} />
              <PlacedChoices floor={floorWidthOf(size, scale)} placed={placed} size={size} />
            </>
          )}
          stage={reviewStageOf(hotspots, node.size)}
        />
        <div data-slot="plate-graphic-gap-match-targets">
          {hotspots.map((hotspot, index) => {
            const labelId = scopedId(context.instance, node.response, "target", index);
            const chips = byHotspot.get(hotspot.identifier) ?? [];

            return (
              <div
                key={hotspot.identifier}
                aria-labelledby={labelId}
                data-empty={flag(chips.length === 0)}
                data-slot="plate-placement-target"
                data-unnamed={flag(hotspot.unnamed)}
                role="group"
              >
                <div data-slot="plate-placement-target-label" id={labelId}>
                  {hotspot.label}
                </div>
                {chips.map((chip, at) =>
                  chipPart(
                    contents.get(chip.identifier),
                    chip.mark,
                    `${chip.identifier} ${String(at)}`,
                    locale,
                  ),
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
