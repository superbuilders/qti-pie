"use client";

/**
 * The Graphic Gap Match interaction's client island (`qti-graphic-gap-match-interaction`): a bank
 * of gap texts and gap images the child places on the hotspots of the author's image, by a drag, a
 * tap on a choice and then a hotspot, or the keyboard, and each choice on a hotspot is one
 * `directedPair` of the response, the choice first.
 *
 * It stands on two shared pieces. The placement primitive (`#plate/ui/placement/parts.tsx`) holds
 * the bank, the targets and every rule, as it does for Gap Match. The graphic stage
 * (`#plate/ui/graphic/stage.tsx`) draws the image and each hotspot's area over it, and here each
 * area is a target of the primitive: a tap on it while a choice is held, or a drag released on it,
 * puts the choice there, the first listed of two overlapping areas taking the point (QTI 3.0
 * information model 5.60, after 5.67). The areas are pointer targets only: the image's overlay is
 * hidden from assistive technology, and below the image every hotspot is a target again, a row
 * named by its `hotspot-label` holding the choices placed there and a place to put one, which a
 * keyboard, a screen reader and a finger use alike, at a K–3 target's full size, and the only way
 * to a hotspot whose area the stage cannot draw. While a row's control has keyboard focus, its area
 * on the image shows it too.
 *
 * QTI decides the board (5.60): the gap choices are the sources and the hotspots the targets. A
 * hotspot holds up to its `match-max` choices, 0 being no limit; a choice goes to up to its
 * `match-max` hotspots, and "the same choice may be associated with an qti-associable-hotspot
 * multiple times, in which case the corresponding directed pair appears multiple times in the value
 * of the response variable" (QTI 3.0 implementation guide), each repeat counting against the
 * choice's `match-max`; `max-associations` caps the pairs; and a pair stands only where the
 * `match-group` of each side, when it lists any, names the other. A drop on a hotspot that holds
 * its one choice trades places, as a gap's does; a hotspot that holds more refuses once full, since
 * which choice would leave is not the child's to guess.
 *
 * @module
 * @see https://www.imsglobal.org/spec/qti/v3p0/info/index.html#Data_GraphicGapMatchInteraction
 */
import { useMemo, useState } from "react";
import type { FocusEvent, ReactNode } from "react";
import { flag } from "#plate/ui/attributes.ts";
import type { Authored, NameAttributes } from "#plate/ui/attributes.ts";
import type { GraphicGapMatchLabels } from "#plate/ui/graphic-gap-match/labels.ts";
import type { ChoiceMeasure } from "#plate/ui/graphic-gap-match/fit.ts";
import { PlacedChoices } from "#plate/ui/graphic-gap-match/placed.tsx";
import type { PlacedIn } from "#plate/ui/graphic-gap-match/placed.tsx";
import { DrawnArea, GraphicMark } from "#plate/ui/graphic/drawn.tsx";
import type { AuthoredSize } from "#plate/interactions/image-size.ts";
import { GraphicStage, useGraphicStage } from "#plate/ui/graphic/stage.tsx";
import type { StageArea } from "#plate/ui/graphic/stage.tsx";
import { isOne } from "#plate/ui/limit.ts";
import type { Limit } from "#plate/ui/limit.ts";
import { chipRuleOf, placementsOf, textsOf } from "#plate/ui/placement/associable.ts";
import type { AssociableChoice } from "#plate/ui/placement/associable.ts";
import type { Pairs, PairsBoard } from "#plate/ui/placement/machine.ts";
import {
  PlacementBank,
  PlacementChip,
  PlacementMessage,
  PlacementRoot,
  PlacementSlot,
  PlacementTarget,
  PlacementTargetLabel,
} from "#plate/ui/placement/parts.tsx";
import { PromptPart } from "#plate/ui/prompt.tsx";
import type { Prompt } from "#plate/ui/prompt.tsx";
import { spokenBeside } from "#plate/ui/read-aloud/spoken.tsx";
import type { Spoken } from "#plate/ui/read-aloud/spoken.tsx";
import { useResponse } from "#plate/ui/responses.tsx";

/**
 * One `qti-gap-text` or `qti-gap-img` as the island takes it: an associable choice, and its
 * content measured, which decides whether a hotspot's box on the image has room for it
 * (`#plate/ui/graphic-gap-match/fit.ts`).
 */
export interface GapChoice extends AssociableChoice {
  readonly measure: ChoiceMeasure;
}

/**
 * One `qti-associable-hotspot` as the island takes it: its area, `shape` and `coords` as written,
 * which the stage resolves once it knows the image's size; its identifier, the target of the pairs
 * that name it; its name; its limits; and its read-aloud, which stands after its name in its row.
 */
export interface GraphicGapHotspot extends StageArea, Spoken {
  /**
   * The hotspot's name, which its row shows and announcements say: the author's `hotspot-label`
   * where it is written and not blank, else plate's "Area n of count", its place among the
   * hotspots in document order, so every target has a name (WCAG 1.1.1).
   */
  readonly label: string;
  /**
   * The hotspot's `match-group`, the choices it takes, empty when the author wrote none, which
   * means any.
   */
  readonly matchGroup: readonly string[];
  /**
   * The hotspot's `match-max`, how many choices it holds, a repeat counting each time; the server
   * writes 0 as no limit (see {@link Limit}).
   */
  readonly matchMax: Limit;
}

/**
 * What the server gives a Graphic Gap Match's island, as QTI's
 * `qti-graphic-gap-match-interaction` and plate's presentation of it say.
 *
 * @see https://www.imsglobal.org/spec/qti/v3p0/info/index.html#Data_GraphicGapMatchInteraction
 */
export interface GraphicGapMatchProps extends Authored<NameAttributes> {
  /**
   * The gap texts and gap images, in display order, the server's: each one chip in the bank, in
   * each row that holds it, and on the image. A gap image's `label` is its `object-label`, else
   * its image's alternative text, else plate's "Choice n of count" (WCAG 1.1.1). A `matchMax` other
   * than 1 makes the chip a stack of copies.
   */
  readonly gapChoices: readonly GapChoice[];
  /**
   * The hotspots in document order, the order the list below the image shows them in and the
   * order QTI gives them priority in where their areas overlap. They never shuffle, and a
   * Graphic Gap Match has no `default` hotspot.
   */
  readonly hotspots: readonly GraphicGapHotspot[];
  /**
   * The author's image, its `img`, `picture` or `object`, as the server rendered it, its URL
   * resolved and its alternative text kept.
   */
  readonly image: ReactNode;
  /**
   * The placement primitive's words, the author's `data-max-selections-message` as
   * `totalReached` where the interaction has one, and the stage's.
   */
  readonly labels: GraphicGapMatchLabels;
  /**
   * `max-associations`: how many pairs the hotspots hold in all. The server writes the XSD's
   * default of 1 when the author wrote none, and no limit for 0 (see {@link Limit}).
   * `min-associations` and `match-min` are not props: they decide whether a submitted response is
   * valid, which the server judges, and a child is never stopped short of them.
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
 * Build a Graphic Gap Match's placement board from what the server gave the island.
 *
 * @param gapChoices The gap choices, the chips, each placed up to its `match-max`, a repeat
 *   counting each time, and only on the hotspots its `match-group` lists, when it lists any.
 * @param hotspots The hotspots, the targets, each holding up to its `match-max` choices, and only
 *   the ones its `match-group` lists, when it lists any.
 * @param maxAssociations `max-associations`, the total.
 * @returns The board: a pair may repeat, and a drop on a full hotspot that holds one choice swaps.
 */
const boardOf = (
  gapChoices: GraphicGapMatchProps["gapChoices"],
  hotspots: GraphicGapMatchProps["hotspots"],
  maxAssociations: Limit,
): PairsBoard => ({
  chips: gapChoices.map(chipRuleOf),
  kind: "pairs",
  repeats: true,
  swap: true,
  targets: hotspots.map(({ identifier, matchGroup, matchMax }) => ({
    capacity: matchMax,
    chips: matchGroup,
    id: identifier,
  })),
  total: maxAssociations,
});

/**
 * Lay the placements out by hotspot, for the image: each hotspot with the choices it holds, in the
 * order placed, a repeat as often as it repeats. A placement of a choice the island does not show
 * draws nothing.
 *
 * @param hotspots The hotspots.
 * @param gapChoices The gap choices, by identifier.
 * @param placements The placements.
 * @returns Each hotspot and its choices.
 */
const placedOf = (
  hotspots: readonly GraphicGapHotspot[],
  gapChoices: ReadonlyMap<string, GapChoice>,
  placements: Pairs,
): readonly PlacedIn[] =>
  hotspots.map((hotspot) => ({
    area: hotspot,
    choices: placements.flatMap(({ chip, target }, index) => {
      const choice = gapChoices.get(chip);

      return target !== hotspot.identifier || choice === undefined
        ? []
        : [
            {
              content: choice.content,
              key: `${chip} ${String(index)}`,
              mark: undefined,
              measure: choice.measure,
            },
          ];
    }),
    identifier: hotspot.identifier,
  }));

/**
 * Draw the choices each hotspot holds on the image, the same on the server and in the browser, the
 * page's width choosing which stand there. It reads the stage's image size and floor width, so it
 * renders only inside the stage's pins.
 *
 * @param props.placed The hotspots and the choices each holds.
 * @returns The drawn choices.
 */
const StagePlaced = (props: { readonly placed: readonly PlacedIn[] }) => {
  const { floor, size } = useGraphicStage();

  return <PlacedChoices floor={floor} placed={props.placed} size={size} />;
};

/**
 * Render a Graphic Gap Match for the child to answer, holding its response in the item's
 * `<Responses>`.
 *
 * The parts:
 *
 * - `plate-graphic-gap-match`, the root, a group named by `naming`, with the author's `data-*` and
 *   `class`;
 * - `plate-prompt`, the prompt, when there is one;
 * - `plate-placement`, the primitive's root, holding the rest;
 * - `plate-placement-bank`, the bank, a chip per gap choice in display order, which stays as a
 *   placeholder once it has no uses left, a choice the candidate hears read aloud standing with its
 *   control in `plate-graphic-gap-match-choice`, and its `plate-placement-slot`, named by the
 *   `bankSlot` label, which puts a placed choice back;
 * - The graphic stage's parts, `plate-graphic`, the region named as the root is, and below it: each
 *   hotspot's `plate-graphic-mark`, its two-tone outline, `data-placed` while the hotspot holds a
 *   choice and `data-focus-visible` while its row's control has keyboard focus, holding a `g` that
 *   is the primitive's `plate-placement-target` for the hotspot, with `data-over` and
 *   `data-refuses` while a drag is over it, around the area's hit shape, `plate-graphic-area`; and
 *   in the stage's pins the choices each hotspot holds (`#plate/ui/graphic-gap-match/placed.tsx`);
 * - `plate-graphic-gap-match-targets`, the list of hotspots below the image, in document order: each
 *   hotspot a `plate-placement-target`, a group named by the hotspot's name through `aria-label`,
 *   so it and its slot are named in the server's markup too, before the primitive reads the page,
 *   showing the name in its `plate-placement-target-label`, hidden from assistive technology since
 *   it repeats the group's name, then, where the candidate hears the hotspot read aloud,
 *   read-aloud's control, which a press places nothing by, then a `plate-placement-chip` per choice
 *   placed there and, unless it holds the one choice it takes, a `plate-placement-slot` that puts
 *   the held choice there, named by the `slot` label with the hotspot's name;
 * - `plate-placement-message`, the latest refusal, as the primitive announced it.
 *
 * Every change goes through the primitive's machine, which refuses a move before any state changes
 * and announces why: a choice with no uses left (`chipUsedUp`), a hotspot full past its
 * `match-max` (`targetFull`), a pair past `max-associations` (`totalReached`), and a pair either
 * side's `match-group` leaves out (`notInGroup`). The response is written whole on every change.
 *
 * @param props The interaction, its response's entry name and its labels
 *   ({@link GraphicGapMatchProps}).
 * @returns The Graphic Gap Match, its placements bound to the response.
 */
export const GraphicGapMatch = (props: GraphicGapMatchProps) => {
  const { gapChoices, hotspots, image, labels, maxAssociations, name, naming, prompt, root, size } =
    props;
  const [texts, set] = useResponse(name);
  const [focused, setFocused] = useState<string>();
  const board = useMemo(
    () => boardOf(gapChoices, hotspots, maxAssociations),
    [gapChoices, hotspots, maxAssociations],
  );
  const choices = useMemo(
    () => new Map(gapChoices.map((choice) => [choice.identifier, choice])),
    [gapChoices],
  );
  const placements = useMemo(() => placementsOf(texts), [texts]);
  const placed = new Set(placements.map(({ target }) => target));

  /**
   * Show a row's focus on its area while the control that took it shows a keyboard focus.
   *
   * @param identifier The row's hotspot.
   * @param event The focus that entered the row.
   */
  const focusRow = (identifier: string, event: FocusEvent) => {
    setFocused(event.target.matches(":focus-visible") ? identifier : undefined);
  };

  /**
   * Stop showing a row's focus on its area once focus leaves its control.
   *
   * @param identifier The row's hotspot.
   */
  const blurRow = (identifier: string) => {
    setFocused((shown) => (shown === identifier ? undefined : shown));
  };

  return (
    <div {...naming} {...root} data-slot="plate-graphic-gap-match" role="group">
      <PromptPart prompt={prompt} />
      <PlacementRoot
        board={board}
        labels={labels}
        placements={placements}
        onPlacementsChange={(next: Pairs) => {
          set(textsOf(next));
        }}
      >
        <PlacementBank>
          {gapChoices.map((choice) =>
            spokenBeside(
              <PlacementChip
                key={choice.identifier}
                aria-label={choice.label}
                value={choice.identifier}
              >
                {choice.content}
              </PlacementChip>,
              choice,
              { key: choice.identifier, slot: "plate-graphic-gap-match-choice" },
            ),
          )}
          <PlacementSlot />
        </PlacementBank>
        <GraphicStage
          labels={labels}
          pins={<StagePlaced placed={placedOf(hotspots, choices, placements)} />}
          naming={naming}
          size={size}
          targets={{
            areas: hotspots,
            kind: "areas",
            renderArea: (area, drawing) => (
              <GraphicMark
                area={area}
                data-focus-visible={flag(focused === area.identifier)}
                data-placed={flag(placed.has(area.identifier))}
                drawing={drawing}
              >
                <PlacementTarget
                  name={{ by: "aria-label", text: area.label }}
                  render={<g />}
                  spot={{ id: area.identifier, kind: "target" }}
                >
                  <DrawnArea area={area} drawing={drawing} />
                </PlacementTarget>
              </GraphicMark>
            ),
            selected: [],
          }}
        >
          {image}
        </GraphicStage>
        <div data-slot="plate-graphic-gap-match-targets">
          {hotspots.map((hotspot) => (
            <PlacementTarget
              key={hotspot.identifier}
              name={{ by: "aria-label", text: hotspot.label }}
              spot={{ id: hotspot.identifier, kind: "target" }}
              onBlur={() => {
                blurRow(hotspot.identifier);
              }}
              onFocus={(event) => {
                focusRow(hotspot.identifier, event);
              }}
            >
              {({ chips }) => (
                <>
                  <PlacementTargetLabel aria-hidden="true">{hotspot.label}</PlacementTargetLabel>
                  {hotspot.readAloud}
                  {chips.map((chip, index) => (
                    <PlacementChip
                      key={`${chip} ${String(index)}`}
                      aria-label={choices.get(chip)?.label}
                      value={chip}
                    >
                      {choices.get(chip)?.content}
                    </PlacementChip>
                  ))}
                  {isOne(hotspot.matchMax) && chips.length > 0 ? null : <PlacementSlot />}
                </>
              )}
            </PlacementTarget>
          ))}
        </div>
        <PlacementMessage />
      </PlacementRoot>
    </div>
  );
};
