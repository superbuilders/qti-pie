/**
 * The choices a Graphic Gap Match's hotspots hold, drawn on its image: for each hotspot that holds
 * any, their own content, as the server rendered it, in a box the hotspot's area holds
 * ({@link placedBoxOf}), so each sits wholly inside the area it went to and the child sees which
 * hotspot holds what (QTI 3.0 information model 5.60). Safe to import on the server and the client:
 * it holds no hook and no state, so the island draws it in the image stage's pins and the review
 * in its frame's pins, alike.
 *
 * The choices are cards at the label size, 24 CSS px, wherever the area's box holds them, and
 * shrink together to fit a smaller box, never past two thirds of their size, at any width the page
 * gives the image (`#plate/ui/graphic-gap-match/fit.ts`): text sized in the image's own units would
 * be a few pixels tall on a large image shown small (upstream #455). Each hotspot's box is a
 * `foreignObject` in the stage's pins, placed and sized by percentages of the image, so the browser
 * holds it over the area at any scale. Inside it the cards' layout stands in an `svg` whose
 * `viewBox` and natural size are the layout's at the label size: the stylesheet draws it at that
 * size where the box holds it, and scales it down to the box where it does not, as it would an
 * image. Which cards stand there follows the box's width: the fit gives the box's bands, the widths
 * over which its choices taken stay the same (`bandsOf`), and each band's cards stand behind two
 * gates, one that shows them from the band's narrowest width and one that hides them from the next
 * band's. A gate is a spacer as wide as its width, then a part of no width holding the sheet its
 * content lies on, which the stylesheet's wrapping sends to a second line exactly when the spacer
 * leaves no room beside it: out of the box's sight for the first gate, and into it for the second,
 * whose sheet is raised by a line. Where the box is narrower than any card needs to read at two
 * thirds of its size, no band shows and the hotspot's row holds the cards. So nothing needs
 * measuring, and the server need not know the page's width.
 *
 * Every geometry value is an SVG attribute, never a `style`, which a page whose policy has no
 * `unsafe-inline` drops.
 *
 * The parts, each inside the stage's pins, which are `aria-hidden` and take no pointer, since the
 * list of hotspots below the image says the same in text:
 *
 * - `plate-graphic-gap-match-placed`, a hotspot's `foreignObject`, over its area's box;
 * - `plate-graphic-gap-match-placed-box`, the HTML box inside it, which holds a gate per band;
 * - `plate-graphic-gap-match-placed-from`, a band's gate from its narrowest width, which keeps the
 *   cards clear of the area's ring, and in its sheet, where the band ends before the last,
 *   `plate-graphic-gap-match-placed-below`, its gate below the next band's width;
 * - In each gate, `plate-graphic-gap-match-placed-least`, its spacer, a zero-height `svg` whose
 *   `width` is the gate's width, then `plate-graphic-gap-match-placed-held`, the part of no width,
 *   holding `plate-graphic-gap-match-placed-sheet`, which lies over the box and centres what it
 *   holds;
 * - `plate-graphic-gap-match-placed-fit`, the `svg` the band's layout stands in;
 * - `plate-graphic-gap-match-placed-cards`, the HTML box inside it that lays the cards out;
 * - `plate-graphic-gap-match-placed-choice`, each choice drawn there, a repeat as often as it
 *   repeats, with `data-mark` in a review that marks it.
 *
 * @module
 */
import { Array as Arr } from "effect";
import type { ReactNode } from "react";
import { stepsOf } from "#plate/graphic/plot.ts";
import type { PlotKind } from "#plate/interactions/plot-roles.ts";
import type { ImageSize } from "#plate/interactions/image-size.ts";
import type { Limit } from "#plate/placement/limit.ts";
import type { AnswerMark } from "#plate/ui/item/interactions/marks.ts";
import { placedBoxOf } from "#plate/ui/graphic-gap-match/box.ts";
import { bandsOf } from "#plate/ui/graphic-gap-match/fit.ts";
import type { Band, ChoiceMeasure } from "#plate/ui/graphic-gap-match/fit.ts";
import { percentOf } from "#plate/ui/graphic/frame.tsx";
import type { GraphicArea } from "#plate/graphic/geometry.ts";

/**
 * One choice a hotspot holds, as the image shows it: its content, measured for the fit; its key
 * among the hotspot's choices, which tells a repeat from its first; and its mark in a review that
 * marks it, none while the child answers and where the review marks nothing.
 */
export interface PlacedChoice {
  readonly content: ReactNode;
  readonly key: string;
  readonly mark: AnswerMark | undefined;
  readonly measure: ChoiceMeasure;
}

/**
 * One hotspot and the choices it holds, in the order the list below the image shows them.
 */
export interface PlacedIn {
  readonly area: GraphicArea;
  readonly choices: readonly PlacedChoice[];
  readonly identifier: string;
}

/**
 * Lay out where the image draws a plot's placed choices: on a dot plot, each alone in its step of
 * its column, bottom first, the first placed lowest (`stepsOf` in `#plate/graphic/plot.ts`); on
 * every other plot, each hotspot's together in its area, as placed.
 *
 * @param plot The plot.
 * @param placed The hotspots, the choices each holds and the most it holds, its `match-max`.
 * @param size The image's size, the pixel space of the areas' coordinates.
 * @returns The areas the choices are drawn in, each with its choices.
 */
export const placedOnPlot = (
  plot: PlotKind,
  placed: readonly (PlacedIn & { readonly capacity: Limit })[],
  size: ImageSize,
): readonly PlacedIn[] =>
  plot === "dot-plot"
    ? placed.flatMap(({ area, capacity, choices, identifier }) =>
        Arr.zipWith(stepsOf(area, capacity, choices.length, size), choices, (step, choice) => ({
          area: step,
          choices: [choice],
          identifier: `${identifier} ${choice.key}`,
        })),
      )
    : placed;

/**
 * Draw a band's cards: the `svg` their layout stands in, at its natural size, the layout's at the
 * label size, and in it the HTML box that lays the cards out.
 *
 * @param props.band The band.
 * @param props.choices The hotspot's choices, whose places the band names.
 * @returns The cards.
 */
const BandCards = (props: { readonly band: Band; readonly choices: readonly PlacedChoice[] }) => {
  const { band, choices } = props;
  const { height, width } = band.size;

  return (
    <svg
      data-slot="plate-graphic-gap-match-placed-fit"
      height={height}
      viewBox={`0 0 ${String(width)} ${String(height)}`}
      width={width}
    >
      <foreignObject height={height} width={width}>
        <div data-slot="plate-graphic-gap-match-placed-cards">
          {band.places.flatMap((index) => {
            const choice = choices[index];

            return choice === undefined
              ? []
              : [
                  <span
                    key={choice.key}
                    data-mark={choice.mark}
                    data-slot="plate-graphic-gap-match-placed-choice"
                  >
                    {choice.content}
                  </span>,
                ];
          })}
        </div>
      </foreignObject>
    </svg>
  );
};

/**
 * The `data-slot` of each kind of gate.
 */
const gateSlots = {
  below: "plate-graphic-gap-match-placed-below",
  from: "plate-graphic-gap-match-placed-from",
} as const;

/**
 * Hold what shows only while the box it stands in is at least a width: a spacer that wide, then a
 * part of no width holding the sheet the content lies on, which wraps to a line out of the box's
 * sight wherever the spacer leaves no room beside it. A gate of `kind` "below" shows its content
 * only while the box is narrower than the width instead: its sheet is raised by a line, so the line
 * it wraps to is the one in sight.
 *
 * @param props.children The content.
 * @param props.kind `from`, shown from the width on; `below`, shown below it.
 * @param props.width The width, across in CSS px less the box's inset.
 * @returns The gate.
 */
const Gate = (props: {
  readonly children: ReactNode;
  readonly kind: "below" | "from";
  readonly width: number;
}) => {
  const { children, kind, width } = props;

  return (
    <span data-slot={gateSlots[kind]}>
      <svg
        aria-hidden="true"
        data-slot="plate-graphic-gap-match-placed-least"
        focusable="false"
        height="0"
        width={width}
      />
      <span data-slot="plate-graphic-gap-match-placed-held">
        <span data-slot="plate-graphic-gap-match-placed-sheet">{children}</span>
      </span>
    </span>
  );
};

/**
 * Draw the choices each hotspot holds on the image, each hotspot's in its own box, pinned over its
 * area, one gate per band of the widths the box can take ({@link bandsOf}), so the cards a box
 * shows are those its width holds. A hotspot that holds none, whose area holds no point, or whose
 * box can hold none of its choices, draws nothing.
 *
 * @param props.floor The stage's floor width, in CSS px, the narrowest the image is drawn
 *   (`floorWidthOf` in `#plate/graphic/scale.ts`), of which each box takes its share.
 * @param props.placed The hotspots and the choices each holds.
 * @param props.size The image's size, the pixel space of the areas' coordinates.
 * @returns The drawn choices.
 */
export const PlacedChoices = (props: {
  readonly floor: number;
  readonly placed: readonly PlacedIn[];
  readonly size: ImageSize;
}) => {
  const { floor, placed, size } = props;

  return placed.map(({ area, choices, identifier }) => {
    const box = choices.length === 0 ? undefined : placedBoxOf(area, size);
    if (box === undefined) {
      return null;
    }

    const bands = bandsOf(
      choices.map((choice) => ({ marked: choice.mark !== undefined, measure: choice.measure })),
      box,
      (box.width * floor) / size.width,
    );
    if (bands.length === 0) {
      return null;
    }

    return (
      <foreignObject
        key={identifier}
        data-slot="plate-graphic-gap-match-placed"
        height={percentOf(box.height, size.height)}
        width={percentOf(box.width, size.width)}
        x={percentOf(box.x - box.width / 2, size.width)}
        y={percentOf(box.y - box.height / 2, size.height)}
      >
        <div data-slot="plate-graphic-gap-match-placed-box">
          {bands.map((band, index) => {
            const until = bands[index + 1]?.from;
            const cards = <BandCards band={band} choices={choices} />;

            return (
              <Gate key={band.from} kind="from" width={band.from}>
                {until === undefined ? (
                  cards
                ) : (
                  <Gate kind="below" width={until}>
                    {cards}
                  </Gate>
                )}
              </Gate>
            );
          })}
        </div>
      </foreignObject>
    );
  });
};
