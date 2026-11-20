"use client";

/**
 * The Graphic Associate interaction's client island (`qti-graphic-associate-interaction`): the
 * child pairs areas of the author's image with each other, and each pair is one `pair` of the
 * response, the two areas' identifiers in either order, since "(A,B) and (B,A) are equivalent"
 * (QTI 3.0 information model 8.13).
 *
 * The areas are the chips of a board of boxes (`#plate/ui/placement/machine.ts`), as Associate's
 * choices are, and each pair is made in a box of two halves, so two inputs reach one response
 * through one machine:
 *
 * - **The list.** Below the image the areas are the bank's chips, named by their `hotspot-label`, and
 *   the boxes hold the pairs as text. It is the placement primitive's own board: a tap and a tap, a
 *   drag, or the keyboard moves a chip into a half, and a screen reader hears each step. It is the
 *   large-target path, the keyboard's and a screen reader's, and the only one where the image's
 *   size is unknown.
 * - **The image.** The graphic stage (`#plate/ui/graphic/stage.tsx`) draws each area over the
 *   picture, and a tap on one puts it in the open box (`tapStep` in
 *   `#plate/ui/graphic-associate/taps.ts`): a first tap starts a pair, a tap on a second area
 *   completes it, and a tap on the area waiting alone takes it back. The image takes taps only: a
 *   drag's copy of an SVG shape shows nothing, so drags start from the list's chips.
 *
 * The overlay draws a line between the areas of each pair, which, like the whole overlay, is
 * `aria-hidden`: the boxes say every pair as text.
 *
 * @module
 * @see https://www.imsglobal.org/spec/qti/v3p0/info/index.html#Data_GraphicAssociateInteraction
 */
import { announce } from "@ui-sdk/core";
import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import type { AuthoredSize } from "#plate/interactions/image-size.ts";
import { flag } from "#plate/ui/attributes.ts";
import type { Authored, NameAttributes } from "#plate/ui/attributes.ts";
import type { GraphicAssociateLabels } from "#plate/ui/graphic-associate/labels.ts";
import { openHalf, tapStep } from "#plate/ui/graphic-associate/taps.ts";
import { DrawnArea, GraphicMark, PairLine } from "#plate/ui/graphic/drawn.tsx";
import { GraphicStage, useGraphicStage } from "#plate/ui/graphic/stage.tsx";
import type { StageArea, StagePress } from "#plate/ui/graphic/stage.tsx";
import { fillLabel } from "#plate/ui/labels.ts";
import type { Limit } from "#plate/ui/limit.ts";
import { halfName } from "#plate/ui/placement/associable.ts";
import type { AssociableChoice } from "#plate/ui/placement/associable.ts";
import { PairBoxes, usePairBoxes } from "#plate/ui/placement/boxes.tsx";
import type { ChipFocusProps } from "#plate/ui/placement/boxes.tsx";
import type { Boxes, BoxesArrangement, Refusal } from "#plate/ui/placement/machine.ts";
import {
  PlacementBank,
  PlacementChip,
  PlacementMessage,
  PlacementRoot,
  PlacementSlot,
} from "#plate/ui/placement/parts.tsx";
import { madePairs } from "#plate/ui/placement/primitive.ts";
import type { Held } from "#plate/ui/placement/primitive.ts";
import { PromptPart } from "#plate/ui/prompt.tsx";
import type { Prompt } from "#plate/ui/prompt.tsx";
import { spokenBeside } from "#plate/ui/read-aloud/spoken.tsx";
import type { Spoken } from "#plate/ui/read-aloud/spoken.tsx";

/**
 * One `qti-associable-hotspot` as the island takes it: its area, `shape` and `coords` as written,
 * which the stage resolves once it knows the image's size; its identifier, which a pair posts; its
 * name; the limits on the pairs it may be in; and its read-aloud, which stands beside its chip in
 * the bank.
 */
export interface GraphicAssociateArea extends StageArea, Spoken {
  /**
   * The area's name, which its chip shows and announcements say: the author's `hotspot-label`
   * where it is written and not blank, else "Area n of count", its place among the areas in
   * document order (QTI 3.0 information model 5.7.6; WCAG 1.1.1).
   */
  readonly label: string;
  /**
   * The area's `match-group`, the areas it may pair with, empty for any (5.7.4).
   */
  readonly matchGroup: readonly string[];
  /**
   * The area's `match-max`, how many pairs it may be in, which QTI requires (5.7.8); the server
   * writes 0 as no limit.
   */
  readonly matchMax: Limit;
}

/**
 * What the server gives a Graphic Associate's island, as QTI's `qti-graphic-associate-interaction`
 * and plate's presentation of it say.
 *
 * Validity is not a prop: `min-associations` (5.59.1) and each area's `match-min` (5.7.9) decide
 * whether a submitted response is valid, which the server judges, and a child is never stopped
 * short of them.
 *
 * @see https://www.imsglobal.org/spec/qti/v3p0/info/index.html#Data_GraphicAssociateInteraction
 */
export interface GraphicAssociateProps extends Authored<NameAttributes> {
  /**
   * The areas in document order, the order QTI gives them priority in where they overlap and the
   * order the list shows them in: a Graphic Associate never shuffles.
   */
  readonly areas: readonly GraphicAssociateArea[];
  /**
   * The author's image, its `img`, `picture` or `object`, as the server rendered it, its URL
   * resolved and its alternative text kept.
   */
  readonly image: ReactNode;
  readonly labels: GraphicAssociateLabels;
  /**
   * `max-associations` (5.59.2): how many pairs the response holds at most, and so how many boxes
   * the list offers. The server writes the XSD's default of 1 when the author wrote none, and no
   * limit for 0 (see {@link Limit}). A `single` response has at most 1 here, so it never posts two
   * entries.
   */
  readonly maxAssociations: Limit;
  /**
   * The entry name the response posts under, plate's `entryName` for the item's instance.
   */
  readonly name: string;
  /**
   * The `qti-prompt`, server-rendered; none where the interaction has none.
   */
  readonly prompt: Prompt | undefined;
  /**
   * The `width` and `height` the author wrote on the image, the pixel space its areas' coordinates
   * are in; where one or both are absent the stage takes the image's natural size once it loads.
   */
  readonly size: AuthoredSize;
}

/**
 * Draw a line between the areas of each pair, from one area's interior point to the other's, in
 * the image's pixels: two copies, a light one under an ink one, so it shows against any picture.
 * It reads the stage's pixel space, never the page's layout, so a stage drawn while hidden draws
 * its lines once shown (#451), and each line has its own stroke, never one of its areas' states.
 *
 * @param props.areas The areas, by identifier.
 * @param props.boxes The boxes the list shows; only full ones are drawn.
 * @returns The lines, each a `plate-graphic-associate-line` group.
 */
const PairLines = (props: {
  readonly areas: ReadonlyMap<string, GraphicAssociateArea>;
  readonly boxes: Boxes;
}) => {
  const { areas, boxes } = props;
  const { size } = useGraphicStage();

  return boxes.map(([first, second]) => (
    <PairLine
      key={`${String(first)} ${String(second)}`}
      from={first === null ? undefined : areas.get(first)}
      mark={undefined}
      size={size}
      to={second === null ? undefined : areas.get(second)}
    />
  ));
};

/**
 * Render a Graphic Associate for the child to answer, holding its response in the item's
 * `<Responses>`.
 *
 * The parts:
 *
 * - `plate-graphic-associate`, the root, a group named by `naming`, with the author's `data-*` and
 *   `class`;
 * - `plate-prompt`, the prompt;
 * - `plate-placement`, the primitive's root, with `data-picked` while a chip is held and
 *   `data-dragging` while one is dragged;
 * - The graphic stage's parts, `plate-graphic`, the region named as the group is, and below it each
 *   area's `plate-graphic-mark`, its two-tone ring, with `data-selected` while it is the chip the
 *   list holds or the area waiting alone in the open box, a `plate-graphic-check` drawn over it
 *   then, `data-placed` while it is in a pair, and `data-focus-visible` while its bank chip or a
 *   chip a box holds for it has keyboard focus; and above the areas, a
 *   `plate-graphic-associate-line` per pair, `aria-hidden`, holding two `line`s,
 *   `data-tone="light"` then `data-tone="ink"`;
 * - `plate-graphic-associate-message`, the latest refusal of a tap on the image, as it was announced,
 *   until the next move;
 * - `plate-placement-bank`, the bank, one `plate-placement-chip` per area showing its name, with
 *   `data-used` once the area is in as many pairs as its `match-max` allows, an area the candidate
 *   hears read aloud standing with its control in `plate-graphic-associate-choice`, then the bank's
 *   slot;
 * - `plate-placement-message`, the latest refusal in the list, as it was announced;
 * - `plate-placement-boxes`, the pairs as text, one `plate-placement-box` per box
 *   ({@link PairBoxes}), each two `plate-placement-target` halves named by the `box` label.
 *
 * A pair joins two different areas, once, where both areas' `match-group`s allow it; an area is in
 * at most its `match-max` pairs, and the boxes hold at most `max-associations`. Each refusal is the
 * machine's, made before the response changes, announced, and shown, whichever input made the
 * move. A box posts only once both halves are full, so a move that leaves the pairs as they were
 * posts nothing.
 *
 * @param props The interaction, its response's entry name and its labels
 *   ({@link GraphicAssociateProps}).
 * @returns The Graphic Associate, its image and its list bound to the response.
 * @see {@link PlacementRoot}
 */
export const GraphicAssociate = (props: GraphicAssociateProps) => {
  const { areas, image, labels, maxAssociations, name, naming, prompt, root, size } = props;
  const pairs = usePairBoxes(name, areas, maxAssociations);
  const [message, setMessage] = useState<string | null>(null);
  const [focused, setFocused] = useState<string>();
  const areasBy = useMemo(() => new Map(areas.map((area) => [area.identifier, area])), [areas]);
  const chips = useMemo(
    () =>
      areas.map((area): AssociableChoice => ({
        content: area.label,
        identifier: area.identifier,
        label: undefined,
        matchGroup: area.matchGroup,
        matchMax: area.matchMax,
      })),
    [areas],
  );
  const { placements } = pairs.root;
  const arrangement: BoxesArrangement = { ...pairs.root.board, placements };
  const waiting = openHalf(arrangement)?.waiting ?? null;
  const paired = new Set(
    placements.flatMap((box) => (box[0] === null || box[1] === null ? [] : box)),
  );

  /**
   * Name a chip as the list shows it: its area's name.
   *
   * @param chip The chip's identifier, if any.
   * @returns The name, empty for none.
   */
  const chipName = (chip: string | null): string =>
    chip === null ? "" : (areasBy.get(chip)?.label ?? "");

  /**
   * Give an area's chip, in the bank or in a box, the handlers that mirror its keyboard focus onto
   * its area on the image, so a sighted keyboard user sees which area the chip means (stage-a11y
   * A3).
   *
   * @param identifier The area.
   * @returns The `onFocus` and `onBlur` props.
   */
  const mirrored = (identifier: string): ChipFocusProps => ({
    onBlur: () => {
      setFocused((current) => (current === identifier ? undefined : current));
    },
    onFocus: (event) => {
      setFocused(event.currentTarget.matches(":focus-visible") ? identifier : undefined);
    },
  });

  /**
   * Show the boxes a move left, and post their pairs where a pair changed.
   *
   * @param next The boxes.
   */
  const change = (next: Boxes) => {
    setMessage(null);
    pairs.root.onPlacementsChange(next);
  };

  /**
   * Say why a tap was refused, in the labels' words, and show it; a tap on an area the board
   * lacks says nothing, as the primitive says nothing for a move the child did not cause.
   *
   * @param refusal The machine's refusal.
   */
  const refuse = (refusal: Refusal) => {
    if (refusal.reason === "unknown") {
      return;
    }

    const target = refusal.target?.kind === "half" ? halfName(labels, refusal.target) : "";
    const text = fillLabel(labels[refusal.reason], {
      chip: chipName(refusal.chip),
      partner: chipName(refusal.partner),
      target,
    });

    setMessage(text);
    announce(text, { priority: "assertive" });
  };

  /**
   * Take a tap on the image: put its area in the open box, or take it back, as {@link tapStep}
   * decides, and say it as the primitive says a step, the pair it makes included. A tap that falls
   * in no area does nothing, and one made while the list holds a chip only puts that chip down,
   * which the primitive does for every press outside its parts, so one tap does one thing.
   *
   * @param tap The tap: the area it falls in, none where it falls in no area.
   * @param held The chip the list holds, if any.
   */
  const press = (tap: StagePress, held: Held | null) => {
    if (held !== null || tap.identifier === undefined) {
      return;
    }

    const step = tapStep(arrangement, tap.identifier);

    if (!step.ok) {
      refuse(step.refusal);

      return;
    }

    if (step.arrangement.kind !== "boxes") {
      return;
    }

    const { move } = step;
    const next = step.arrangement.placements;
    const chip = chipName(move.chip);
    const words =
      move.kind === "placed" && move.target.kind === "half"
        ? fillLabel(labels.placed, {
            chip,
            target: halfName(labels, move.target),
          })
        : fillLabel(labels.returned, { chip });
    const said = madePairs(placements, next).map(([first, second]) =>
      fillLabel(labels.paired, {
        chip: chipName(first === move.chip ? first : second),
        partner: chipName(first === move.chip ? second : first),
      }),
    );

    change(next);
    announce([words, ...said].join(" "), { priority: "assertive" });
  };

  return (
    <div {...naming} {...root} data-slot="plate-graphic-associate" role="group">
      <PromptPart prompt={prompt} />
      <PlacementRoot {...pairs.root} labels={labels} onPlacementsChange={change}>
        {({ held }) => {
          const selected = [waiting, held?.picked.chip ?? null].filter(
            (chip): chip is string => chip !== null,
          );

          return (
            <>
              <GraphicStage
                labels={labels}
                marks={<PairLines areas={areasBy} boxes={placements} />}
                naming={naming}
                onPress={(tap) => {
                  press(tap, held);
                }}
                size={size}
                targets={{
                  areas,
                  kind: "areas",
                  renderArea: (area, drawing) => (
                    <GraphicMark
                      area={area}
                      data-focus-visible={flag(focused === area.identifier)}
                      data-placed={flag(paired.has(area.identifier))}
                      data-selected={flag(selected.includes(area.identifier))}
                      drawing={drawing}
                    >
                      <DrawnArea area={area} drawing={drawing} />
                    </GraphicMark>
                  ),
                  selected,
                }}
              >
                {image}
              </GraphicStage>
              {message === null ? null : (
                <p data-slot="plate-graphic-associate-message">{message}</p>
              )}
              <PlacementBank>
                {areas.map((area) =>
                  spokenBeside(
                    <PlacementChip
                      key={area.identifier}
                      value={area.identifier}
                      {...mirrored(area.identifier)}
                    >
                      {area.label}
                    </PlacementChip>,
                    area,
                    { key: area.identifier, slot: "plate-graphic-associate-choice" },
                  ),
                )}
                <PlacementSlot />
              </PlacementBank>
              <PlacementMessage />
              <PairBoxes boxes={pairs.shown} chipProps={mirrored} chips={chips} labels={labels} />
            </>
          );
        }}
      </PlacementRoot>
    </div>
  );
};
