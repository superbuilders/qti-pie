"use client";

/**
 * The Hotspot interaction's client island (`qti-hotspot-interaction`): the child picks one or more
 * areas of the author's image, by a tap on the image or from a labelled list of its areas, and the
 * picks are the response's identifiers.
 *
 * Two inputs reach one response. On the image, the graphic stage (`#plate/ui/graphic/stage.tsx`)
 * draws each area over the picture and takes a tap as the area it falls in, as scoring's
 * `areaHolds` reads it: where areas overlap the first listed holds the point (QTI 3.0 information
 * model 5.68.6), a `default` area only what no other area holds, and the boundary is the area's
 * own. Below the image, the same areas are the options of a picks group
 * (`#plate/ui/picks/picks-group.tsx`), a radio group or checkboxes, one row per area named by its
 * `hotspot-label`: the large-target path a finger, a keyboard and a screen reader use, and the only
 * one where the image's size is unknown, an `object` the author gave no `width` and `height`,
 * which the stage never measures and so draws no area over. A tap on the image presses the area's
 * option, as a press on its row does, so both inputs run one change rule and one refusal.
 *
 * @module
 * @see https://www.imsglobal.org/spec/qti/v3p0/info/index.html#Data_HotspotInteraction
 */
import { useState } from "react";
import type { ReactNode } from "react";
import type { AuthoredSize } from "#plate/interactions/image-size.ts";
import { flag } from "#plate/ui/attributes.ts";
import type { Authored, NameAttributes, Named } from "#plate/ui/attributes.ts";
import { DrawnArea, GraphicMark } from "#plate/ui/graphic/drawn.tsx";
import { GraphicStage } from "#plate/ui/graphic/stage.tsx";
import type { StageArea } from "#plate/ui/graphic/stage.tsx";
import type { HotspotLabels } from "#plate/ui/hotspot/labels.ts";
import { PickOption, PicksGroup, usePicks } from "#plate/ui/picks/picks-group.tsx";
import type { Picks } from "#plate/interactions/picks.ts";
import { PromptPart } from "#plate/ui/prompt.tsx";
import type { Prompt } from "#plate/ui/prompt.tsx";
import { spokenBeside } from "#plate/ui/read-aloud/spoken.tsx";
import type { Spoken } from "#plate/ui/read-aloud/spoken.tsx";

/**
 * One hotspot as the island takes it: its area, its geometry and `coords` as written, in the
 * image's pixels or as percentages of the image, which the stage resolves once it knows the image's
 * size; its identifier, which a pick posts; its name in the list; and its read-aloud, which stands
 * beside its row.
 */
export interface HotspotArea extends StageArea, Spoken {
  /**
   * The hotspot's name, which its row shows and its control is named by: the author's
   * `hotspot-label` where it is written and not blank, else "Area n of count", its place among the
   * hotspots in document order (5.67.6; WCAG 1.1.1).
   */
  readonly label: string;
}

/**
 * What the server gives a Hotspot's island, as QTI's `qti-hotspot-interaction` and plate's
 * presentation of it say: what the author wrote on it (`Authored`), its list's name always given,
 * plate's own where the author named it by nothing.
 *
 * @see https://www.imsglobal.org/spec/qti/v3p0/info/index.html#Data_HotspotInteraction
 */
export interface HotspotProps extends Authored<Named> {
  /**
   * The hotspots in document order, the order QTI gives them priority in where their areas overlap
   * and the order the list shows them in: a Hotspot never shuffles. A `default` hotspot, which
   * QTI's structure rules keep last, holds whatever no other area does.
   */
  readonly hotspots: readonly HotspotArea[];
  /**
   * The author's image, its `img`, `picture` or `object`, as the server rendered it, its URL
   * resolved and its alternative text kept.
   */
  readonly image: ReactNode;
  readonly labels: HotspotLabels;
  /**
   * The entry name the response posts under, plate's `entryName` for the item's instance.
   */
  readonly name: string;
  /**
   * How many hotspots the child picks, which the server reads from the bound response's cardinality
   * and `max-choices` (5.68.2), as it reads a Choice's (`picksOf` in
   * `#plate/interactions/picks.ts`): a pick on the image or in the list replaces the last for
   * `one`, and otherwise a tap on a picked area takes it back. The response is a bag, which reads
   * no order.
   *
   * `min-choices` is not a prop: it decides whether a submitted response is valid (5.68.1), which
   * the server judges, and a child is never stopped short of it.
   */
  readonly picks: Picks;
  /**
   * The `qti-prompt`, server-rendered; none where the interaction has none.
   */
  readonly prompt: Prompt | undefined;
  /**
   * The `width` and `height` the author wrote on the image, the pixel space its areas' coordinates
   * are in; where one or both are absent the stage takes the image's natural size once it loads.
   */
  readonly size: AuthoredSize;
  /**
   * What names the stage's region, as the author named the interaction; the image's own name, then
   * the catalog's word for a picture, name it where this names it by nothing.
   */
  readonly stageNaming: NameAttributes;
}

/**
 * Render the Hotspot's stage inside its picks group, the areas over the image, each picked one
 * selected and the one whose row has keyboard focus so shown, and press the option of the area a
 * tap falls in; a tap that falls in no area, or on the image before its size is known, presses
 * nothing.
 *
 * @param props.focused The hotspot whose row's control has keyboard focus, none while no row's
 *   does.
 * @param props.hotspots The hotspots, in document order.
 * @param props.image The author's image, as the server rendered it.
 * @param props.labels The stage's words.
 * @param props.naming What names the stage's region.
 * @param props.size The size the author wrote on the image.
 * @returns The stage.
 */
const HotspotStage = (props: {
  readonly focused: string | undefined;
  readonly hotspots: readonly HotspotArea[];
  readonly image: ReactNode;
  readonly labels: HotspotLabels;
  readonly naming: NameAttributes;
  readonly size: AuthoredSize;
}) => {
  const { focused, hotspots, image, labels, naming, size } = props;
  const { picked, press } = usePicks();

  return (
    <GraphicStage
      labels={labels}
      naming={naming}
      onPress={(tap) => {
        if (tap.identifier !== undefined) {
          press(tap.identifier);
        }
      }}
      size={size}
      targets={{
        areas: hotspots,
        kind: "areas",
        renderArea: (area, drawing) => (
          <GraphicMark
            area={area}
            data-focus-visible={flag(focused === area.identifier)}
            data-selected={flag(picked.has(area.identifier))}
            drawing={drawing}
          >
            <DrawnArea area={area} drawing={drawing} />
          </GraphicMark>
        ),
        selected: [...picked],
      }}
    >
      {image}
    </GraphicStage>
  );
};

/**
 * Render a Hotspot for the child to answer, holding its response in the item's `<Responses>`.
 *
 * The parts:
 *
 * - `plate-hotspot`, the root, with the author's `data-*` and `class`, and `data-full` while
 *   checkboxes with a limit hold `max-choices` identifiers;
 * - `plate-prompt`, the prompt, which names the stage's region and the list where it names something;
 * - The graphic stage's parts, `plate-graphic` and below it, its region named by `stageNaming`, each
 *   area's `plate-graphic-mark` with `data-selected` and a check while it is picked, and with
 *   `data-focus-visible` while its row's control has keyboard focus, so a sighted keyboard user
 *   sees which area the row means;
 * - UI SDK's `radio-group` or `checkbox-group`, named by `naming`;
 * - `plate-hotspot-option`, one `label` per hotspot, with `data-selected` while it is picked. It
 *   wraps the UI SDK `radio` or `checkbox` button and the hotspot's name, so a press anywhere on it
 *   presses the control, and the stylesheet gives it the K–3 minimum height of 64 px;
 * - `plate-hotspot-label`, the hotspot's name;
 * - `plate-hotspot-row`, a hotspot the candidate hears read aloud: its `plate-hotspot-option`, then
 *   read-aloud's control, outside the `label`, so a press on it picks nothing;
 * - `plate-hotspot-limit`, the `limit` label, shown from a refused pick until the next accepted one.
 *
 * A pick past `max-choices`, from the image or the list, is refused by the picks group before the
 * response changes, then announced assertively and shown; every row and area stays live, so the
 * child can always take one back.
 *
 * @param props The interaction, its response's entry name and its labels ({@link HotspotProps}).
 * @returns The Hotspot, its image and its list bound to the response.
 */
export const Hotspot = (props: HotspotProps) => {
  const { hotspots, image, labels, name, naming, picks, prompt, root, size, stageNaming } = props;
  const [focused, setFocused] = useState<string>();

  return (
    <PicksGroup
      before={
        <>
          <PromptPart prompt={prompt} />
          <HotspotStage
            focused={focused}
            hotspots={hotspots}
            image={image}
            labels={labels}
            naming={stageNaming}
            size={size}
          />
        </>
      }
      eliminated={labels.eliminated}
      limit={labels.limit}
      naming={naming}
      picks={picks}
      response={name}
      root={{ ...root, "data-slot": "plate-hotspot" }}
    >
      {hotspots.map((hotspot) =>
        spokenBeside(
          <PickOption
            key={hotspot.identifier}
            identifier={hotspot.identifier}
            label={undefined}
            slot="plate-hotspot-option"
            onBlur={() => {
              setFocused(undefined);
            }}
            onFocus={(event) => {
              setFocused(event.target.matches(":focus-visible") ? hotspot.identifier : undefined);
            }}
          >
            <span data-slot="plate-hotspot-label">{hotspot.label}</span>
          </PickOption>,
          hotspot,
          { key: hotspot.identifier, slot: "plate-hotspot-row" },
        ),
      )}
    </PicksGroup>
  );
};
