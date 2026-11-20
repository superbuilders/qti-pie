"use client";

/**
 * The Graphic Order interaction's client island (`qti-graphic-order-interaction`): the child puts
 * the areas of the author's image in order, by moving each into numbered positions, and the areas'
 * identifiers in position order are the response.
 *
 * It is the Order island (`#plate/ui/order/order.tsx`) with the image's areas as its chips. The
 * placement primitive (`#plate/ui/placement/parts.tsx`) holds a sequence board: each hotspot is one
 * chip, placed at most once, and each position holds one. A chip lands in the position it is put
 * in, and a chip dropped on a taken position trades places with the chip there. The response posts
 * as an Order's does (`useSequence` in `#plate/ui/placement/sequence.ts`).
 *
 * Two inputs reach the chips. Below the image, each hotspot is a chip named by its `hotspot-label`,
 * in a bank above the positions: a tap picks it up and a tap on a position places it, a drag moves
 * it, and the keyboard and a screen reader work the same chips. On the image, the graphic stage
 * (`#plate/ui/graphic/stage.tsx`) draws each area and takes a tap as the area it falls in, as
 * scoring's `areaHolds` reads it. There one tap orders an area, the classic graphic-order rule
 * (`#plate/ui/graphic-order/taps.ts`): a tap on an area left out of the order puts it in the first
 * empty position, and a tap on an ordered area takes it out, leaving its position empty. Each step
 * is announced, and a tap while every position is taken is refused, announced and shown. The chips
 * stay the way to put an area in a chosen position, and to drag one: an area is not
 * dragged, since a dragged copy of an SVG shape shows nothing. The stage stays a pointer's way in,
 * `aria-hidden`, and the chips say everything it shows (WCAG 2.2, 2.5.7 and 4.1.2).
 *
 * The stage draws every area, as "the delivery engine must clearly indicate all defined area(s) of
 * the image" (QTI 3.0 information model 5.61), and an ordered area shows its position as a badge,
 * its number in SVG text at a point inside the area, drawn above every area so that no other area
 * paints over it.
 *
 * An untouched order posts nothing. The positions start empty, so the response stays NULL, "the
 * candidate has not offered a response" (5.115), until the child has ordered the areas.
 *
 * @module
 * @see https://www.imsglobal.org/spec/qti/v3p0/info/index.html#Data_GraphicOrderInteraction
 */
import { announce } from "@ui-sdk/core";
import { useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import { flag } from "#plate/ui/attributes.ts";
import type { Authored, NameAttributes } from "#plate/ui/attributes.ts";
import { CornerPin, DrawnArea, GraphicMark } from "#plate/ui/graphic/drawn.tsx";
import { Badge } from "#plate/ui/graphic-order/badge.tsx";
import type { GraphicOrderLabels } from "#plate/ui/graphic-order/labels.ts";
import { tapStep } from "#plate/ui/graphic-order/taps.ts";
import type { AuthoredSize } from "#plate/interactions/image-size.ts";
import { GraphicStage, useGraphicStage } from "#plate/ui/graphic/stage.tsx";
import type { StageArea, StagePress } from "#plate/ui/graphic/stage.tsx";
import { fillLabel } from "#plate/ui/labels.ts";
import type { Position, Sequence } from "#plate/ui/placement/machine.ts";
import {
  PlacementBank,
  PlacementChip,
  PlacementMessage,
  PlacementRoot,
  PlacementSlot,
  PlacementTarget,
  PlacementTargetLabel,
} from "#plate/ui/placement/parts.tsx";
import type { PlacementRootState } from "#plate/ui/placement/primitive.ts";
import { useSequence } from "#plate/ui/placement/sequence.ts";
import { PromptPart } from "#plate/ui/prompt.tsx";
import type { Prompt } from "#plate/ui/prompt.tsx";

/**
 * One hotspot as the island takes it: its area, `shape` and `coords` as written, which the stage
 * resolves once it knows the image's size; its identifier, which the response holds; and its name,
 * which its chip shows.
 */
export interface GraphicOrderArea extends StageArea {
  /**
   * The hotspot's name, which its chip shows and announcements read: the author's `hotspot-label`
   * where it is written and not blank, else "Area n of count", its place among the hotspots in
   * document order (5.67.6; WCAG 1.1.1).
   */
  readonly label: string;
}

/**
 * What the server gives a Graphic Order's island, as QTI's `qti-graphic-order-interaction` and
 * plate's presentation of it say.
 *
 * @see https://www.imsglobal.org/spec/qti/v3p0/info/index.html#Data_GraphicOrderInteraction
 */
export interface GraphicOrderProps extends Authored<NameAttributes> {
  /**
   * The hotspots in document order, the order the bank offers their chips in, since "the order in
   * which the choices are given must be the order in which they are offered" (5.61.5), and the
   * order QTI gives them priority in where their areas overlap: a Graphic Order never shuffles. A
   * `default` hotspot, which QTI's structure rules keep last, holds whatever no other area does.
   */
  readonly hotspots: readonly GraphicOrderArea[];
  /**
   * The author's image, its `img`, `picture` or `object`, as the server rendered it, its URL
   * resolved and its alternative text kept.
   */
  readonly image: ReactNode;
  /**
   * The texts the island writes for the child, from plate's message catalog
   * (`graphicOrderLabels` in `#plate/ui/graphic-order/labels.ts`): an Order's, since a Graphic
   * Order's chips are named and its positions numbered as an Order's are, which a tap on the image
   * says too, and its stage's.
   */
  readonly labels: GraphicOrderLabels;
  /**
   * The entry name the response posts under, plate's `entryName` for the item's instance.
   */
  readonly name: string;
  /**
   * How many positions the Graphic Order shows, which the server derives from `max-choices` and
   * `min-choices` as it does an Order's (plate's reading 18): with a `min-choices`, the
   * `max-choices` written beside it, or one per hotspot when there is none, since "If unspecified,
   * all of the choices may be ordered" (5.61.2); without one, one per hotspot, since then "all of
   * the choices must be ordered and max-choices is ignored" (5.61.1).
   */
  readonly positions: number;
  /**
   * The `qti-prompt`, server-rendered; none where the interaction has none.
   */
  readonly prompt: Prompt | undefined;
  /**
   * How many positions the response must fill before it posts, as an Order's: the `min-choices`
   * written, or one per hotspot when there is none (5.61.1). It never stops a child ordering an
   * area or taking one out; whether a submitted response is valid the server judges.
   */
  readonly required: number;
  /**
   * The `width` and `height` the author wrote on the image, the pixel space its areas' coordinates
   * are in; where one or both are absent the stage takes the image's natural size once it loads.
   */
  readonly size: AuthoredSize;
}

/**
 * Draw each ordered hotspot's badge, its position's number, inside its area's top-right corner,
 * where a picked area's check stands (`CornerPin`), clear of the label or part the area's middle
 * holds, at the page's own size ({@link Badge}). The stage's pins stand above every area, so no
 * area paints over one. A hotspot whose area holds no point has no badge, and its position is in
 * the positions alone.
 *
 * Rendered inside the stage's pins, which it reads the image's size from.
 *
 * @param props.hotspots The hotspots, by identifier.
 * @param props.placements The positions' occupants.
 * @returns The badges.
 */
const Badges = (props: {
  readonly hotspots: ReadonlyMap<string, GraphicOrderArea>;
  readonly placements: Sequence;
}) => {
  const { hotspots, placements } = props;
  const { size } = useGraphicStage();

  return placements.map((identifier, index) => {
    if (identifier === null) {
      return null;
    }

    const area = hotspots.get(identifier);

    return area === undefined ? null : (
      <CornerPin key={identifier} area={area} size={size}>
        <Badge mark={undefined}>{index + 1}</Badge>
      </CornerPin>
    );
  });
};

/**
 * Render a Graphic Order for the child to answer, holding its response in the item's
 * `<Responses>`.
 *
 * The parts:
 *
 * - `plate-graphic-order`, the root, a group named by `naming`, with the author's `data-*` and
 *   `class`;
 * - `plate-prompt`, the prompt;
 * - The placement primitive's root, `plate-placement`, with `data-picked` while a chip is held and
 *   `data-dragging` during a drag;
 * - The graphic stage's parts, `plate-graphic` and below it, its region named as the group is, each
 *   area's `plate-graphic-mark` with `data-placed` while its hotspot is ordered, `data-picked`
 *   while its chip is held, and `data-focus-visible` while its chip has keyboard focus, as
 *   `:focus-visible` tells it, so a sighted keyboard user sees which area a chip means; and in the
 *   stage's pins, each ordered area's badge, `plate-graphic-order-badge`, holding
 *   `plate-graphic-order-badge-disc` and `plate-graphic-order-badge-number`;
 * - `plate-placement-bank`, the bank: a `plate-placement-chip` per hotspot in document order, showing
 *   its name, which an ordered hotspot leaves as a layout-holding placeholder (`data-used`), then a
 *   `plate-placement-slot` that returns a held placed chip;
 * - `plate-graphic-order-positions`, the positions, an `ol`, as many as `positions`. It says
 *   `role="list"` outright, as an Order's does, since WebKit stops exposing a list without markers
 *   as a list;
 * - `plate-placement-target`, each position, an `li` holding its number,
 *   `plate-placement-target-label`, then the chip placed there, or while it is empty a
 *   `plate-placement-slot` that puts the held chip in that position;
 * - `plate-placement-message`, the latest refusal of a move in the list, as it was announced;
 * - `plate-graphic-order-refusal`, the refusal of a tap on the image while every position is taken,
 *   as it was announced, until the next step goes through.
 *
 * Each step and refusal is announced with the `labels`, naming each hotspot by its chip's text and
 * each position by its number, through the page's live region: the primitive says a move in the
 * list, and the island a tap on the image, `placed` for an area put in, `returned` for one taken
 * out, and `totalReached` for one refused (WCAG 4.1.3).
 *
 * @param props The interaction, its response's entry name and its labels
 *   ({@link GraphicOrderProps}).
 * @returns The Graphic Order, its image and its positions bound to the response.
 */
export const GraphicOrder = (props: GraphicOrderProps) => {
  const { hotspots, image, labels, name, naming, positions, prompt, required, root, size } = props;
  const sequence = useSequence(name, hotspots, positions, required);
  const { placements } = sequence;
  const [focused, setFocused] = useState<string>();
  const [refusal, setRefusal] = useState<string>();
  const tapped = useRef(false);
  const spots = useMemo(
    () => Array.from({ length: positions }, (_, index): Position => ({ index, kind: "position" })),
    [positions],
  );
  const byIdentifier = useMemo(
    () => new Map(hotspots.map((hotspot) => [hotspot.identifier, hotspot])),
    [hotspots],
  );
  const placed = new Set(placements);

  /**
   * Read a hotspot's name, as its chip shows it.
   *
   * @param identifier The hotspot.
   * @returns Its name.
   */
  const nameOf = (identifier: string): string => byIdentifier.get(identifier)?.label ?? identifier;

  /**
   * Take a tap on the image, which the stage commits on release, as one step on the order
   * ({@link tapStep}): the hotspot it falls in goes in the first empty position, or leaves the
   * order if it is in it, and the step is announced in the labels' words, each hotspot named as its
   * chip shows it and each position by its number; a tap while every position is taken changes
   * nothing, and is announced and shown. It notes the tap, so the root's own handler does not read
   * the click that follows the release as one outside every part, which would put a chip held in
   * the list down. A tap in no area is left to the root.
   *
   * @param tap The tap: the hotspot it falls in, none where it falls in no area.
   */
  const press = (tap: StagePress) => {
    const { identifier } = tap;
    if (identifier === undefined) {
      return;
    }

    tapped.current = true;

    const step = tapStep(placements, identifier);
    const chip = nameOf(identifier);

    if (step.kind === "full") {
      setRefusal(labels.totalReached);
      announce(labels.totalReached, { priority: "assertive" });

      return;
    }

    setRefusal(undefined);
    sequence.onPlacementsChange(step.placements);
    announce(
      step.kind === "placed"
        ? fillLabel(labels.placed, { chip, target: String(step.index + 1) })
        : fillLabel(labels.returned, { chip }),
      { priority: "assertive" },
    );
  };

  /**
   * Give a chip's handlers that mirror its keyboard focus onto its area.
   *
   * @param identifier The chip's hotspot.
   * @returns The `onFocus` and `onBlur` props.
   */
  const mirrored = (identifier: string) => ({
    onBlur: () => {
      setFocused((current) => (current === identifier ? undefined : current));
    },
    onFocus: (event: { readonly currentTarget: Element }) => {
      setFocused(event.currentTarget.matches(":focus-visible") ? identifier : undefined);
    },
  });

  const content = ({ held }: PlacementRootState) => (
    <>
      <GraphicStage
        labels={labels}
        pins={<Badges hotspots={byIdentifier} placements={placements} />}
        naming={naming}
        onPress={press}
        size={size}
        targets={{
          areas: hotspots,
          kind: "areas",
          renderArea: (area, drawing) => (
            <GraphicMark
              area={area}
              data-focus-visible={flag(focused === area.identifier)}
              data-picked={flag(held?.picked.chip === area.identifier)}
              data-placed={flag(placed.has(area.identifier))}
              drawing={drawing}
            >
              <DrawnArea area={area} drawing={drawing} />
            </GraphicMark>
          ),
          selected: [],
        }}
      >
        {image}
      </GraphicStage>
      <PlacementBank>
        {hotspots.map((hotspot) => (
          <PlacementChip
            key={hotspot.identifier}
            value={hotspot.identifier}
            {...mirrored(hotspot.identifier)}
          >
            {hotspot.label}
          </PlacementChip>
        ))}
        <PlacementSlot />
      </PlacementBank>
      <ol data-slot="plate-graphic-order-positions" role="list">
        {spots.map((spot) => (
          <PlacementTarget
            key={spot.index}
            name={{ by: "label-part", text: String(spot.index + 1) }}
            render={<li />}
            spot={spot}
          >
            {({ chips }) => (
              <>
                <PlacementTargetLabel>{spot.index + 1}</PlacementTargetLabel>
                {chips.map((chip) => (
                  <PlacementChip key={chip} value={chip} {...mirrored(chip)}>
                    {byIdentifier.get(chip)?.label}
                  </PlacementChip>
                ))}
                {chips.length === 0 ? <PlacementSlot /> : null}
              </>
            )}
          </PlacementTarget>
        ))}
      </ol>
      <PlacementMessage />
      {refusal === undefined ? null : <p data-slot="plate-graphic-order-refusal">{refusal}</p>}
    </>
  );

  return (
    <div {...root} data-slot="plate-graphic-order" role="group" {...naming}>
      <PromptPart prompt={prompt} />
      <PlacementRoot
        board={sequence.board}
        labels={labels}
        placements={placements}
        onClick={(event) => {
          if (tapped.current) {
            tapped.current = false;
            event.preventDefault();
          }
        }}
        onPlacementsChange={(next: Sequence) => {
          setRefusal(undefined);
          sequence.onPlacementsChange(next);
        }}
        onPointerDown={() => {
          tapped.current = false;
        }}
      >
        {content}
      </PlacementRoot>
    </div>
  );
};
