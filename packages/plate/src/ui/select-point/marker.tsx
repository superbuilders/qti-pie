/**
 * A Select Point's marks on the image: each point's marker, and the keyboard's cross, drawn in CSS
 * pixels round their pin's origin, the point (`Pin` in `#plate/ui/graphic/frame.tsx`), and the
 * scale the stage renders a Select Point at. Safe to import on the server and the client: it holds
 * no hook and no state, so the island's pins and the review draw the same marker from it.
 *
 * A mark is sized in CSS pixels, as a child's finger meets it, whatever the page scales the image
 * to, the pin's unit being the CSS pixel, so a marker stays round and a review, which has no stage
 * measuring the page, draws it at its size too. A marker is the stage's shared mark (`GraphicMark`
 * in `#plate/ui/graphic/drawn.tsx`), a two-tone ring whose own disc is its target, 64 px across,
 * the K–3 minimum and past WCAG 2.5.5's 44: nothing outside the drawn ring takes a tap, so a tap is
 * never ambiguous between a marker and the image beside it.
 *
 * The parts, inside the stage's pins:
 *
 * - `plate-graphic-mark`, a marker, `data-area="circle"`, with `data-placed`, `data-index` its index
 *   among the points, `data-dragging` while it is dragged and `data-focus-visible` while its button
 *   in the list has keyboard focus. It holds the ring's two tones, then `plate-select-point-dot`, a
 *   dot at the point itself, `plate-select-point-number`, the point's number above it, and in the
 *   island last of all its hit shape, `plate-graphic-area`, the ring's disc, which takes the
 *   pointer on its fill whatever the stylesheet paints it;
 * - `plate-select-point-cross`, a `g` holding the cross twice, `data-tone="light"` under
 *   `data-tone="ink"`, 48 px across, at the point Enter would mark.
 *
 * @module
 */
import type { ImageSize } from "#plate/interactions/image-size.ts";
import { flag } from "#plate/ui/attributes.ts";
import { DrawnArea, GraphicMark } from "#plate/ui/graphic/drawn.tsx";
import type { Drawing, GraphicArea } from "#plate/ui/graphic/geometry.ts";
import { stageScaleOf } from "#plate/ui/graphic/scale.ts";
import type { StageScale } from "#plate/ui/graphic/scale.ts";
import type { Reach } from "#plate/ui/select-point/points.ts";

/**
 * How many CSS pixels one image pixel is drawn as on the page, across and down.
 */
export interface MarkerScale {
  readonly x: number;
  readonly y: number;
}

/**
 * The `data-slot` of a mark on the stage, `GraphicMark`'s, which a press on the board finds a
 * marker by.
 */
export const markSlot = "plate-graphic-mark";

/**
 * The radius, in CSS pixels, of a marker's ring, whose disc is its target: half the 64 px a K–3
 * control's target is at the least.
 */
const ringRadius = 32;

/**
 * The radius, in CSS pixels, of the dot at a marker's point.
 */
const dotRadius = 4;

/**
 * The size, in CSS pixels, of a marker's number, and how far above the point its middle stands.
 */
const number = { rise: 16, size: 16 } as const;

/**
 * Half the length, in CSS pixels, of each line of the keyboard's cross: 48 px across.
 */
const crossArm = 24;

/**
 * Give the scale the stage renders a Select Point at. It draws no area, and its one target is the
 * image itself, any point of which the child may mark, so the image's smaller side is its smallest
 * target: the stage never draws it under 44 px on a side. The markers and the cross are sized in
 * CSS pixels at any scale.
 *
 * @param size The image's authored size.
 * @returns The stage's scale.
 */
export const selectPointScaleOf = (size: ImageSize): StageScale =>
  stageScaleOf(Math.min(size.width, size.height));

/**
 * Give a marker's reach in the image's pixels, where a tap or the keyboard's cross takes it: its
 * ring's radius divided by the image's scale on each axis.
 *
 * @param scale The image's scale on the page.
 * @returns The reach, across and down.
 */
export const reachOf = (scale: MarkerScale): Reach => ({
  x: ringRadius / scale.x,
  y: ringRadius / scale.y,
});

/**
 * The ring of a marker as an area, round its pin's origin in CSS pixels, whose mark and hit shape
 * the stage's shared parts draw.
 */
const ringArea: GraphicArea = {
  coords: [0, 0, ringRadius].map((value) => ({ percent: false, value })),
  geometry: "circle",
};

/**
 * The ring of a marker as it is drawn, round its pin's origin in CSS pixels.
 */
const ringDrawing: Drawing = { cx: 0, cy: 0, element: "circle", r: ringRadius };

/**
 * What a marker is: `shown`, a point a review or a solution draws, which takes no pointer; or
 * `answering`, a point the child put, in the island, whose ring takes the pointer: whether it is
 * dragged, and whether its button in the list has keyboard focus.
 */
export type MarkerState =
  | { readonly kind: "shown" }
  | { readonly dragging: boolean; readonly focusVisible: boolean; readonly kind: "answering" };

/**
 * Draw a point's marker round its pin's origin, in CSS pixels: the stage's two-tone mark of its
 * ring, the dot at its point, its number, and in the island the ring's disc as its hit shape.
 *
 * @param props.index Its index among the points; its number is one more.
 * @param props.state What it is ({@link MarkerState}).
 * @returns The marker.
 */
export const Marker = (props: { readonly index: number; readonly state: MarkerState }) => {
  const { index, state } = props;
  const answering = state.kind === "answering";

  return (
    <GraphicMark
      area={ringArea}
      data-dragging={flag(answering && state.dragging)}
      data-focus-visible={flag(answering && state.focusVisible)}
      data-index={index}
      data-placed=""
      drawing={ringDrawing}
    >
      <circle data-slot="plate-select-point-dot" r={dotRadius} />
      <text
        data-slot="plate-select-point-number"
        dominantBaseline="central"
        fontSize={number.size}
        textAnchor="middle"
        y={-number.rise}
      >
        {index + 1}
      </text>
      {answering ? <DrawnArea area={ringArea} drawing={ringDrawing} /> : null}
    </GraphicMark>
  );
};

/**
 * The keyboard's cross's path, round its pin's origin in CSS pixels.
 */
const crossPath = `M ${String(-crossArm)} 0 h ${String(2 * crossArm)} M 0 ${String(-crossArm)} v ${String(2 * crossArm)}`;

/**
 * Draw the keyboard's cross round its pin's origin, twice for its two tones, in CSS pixels.
 *
 * @returns The cross.
 */
export const Cross = () => (
  <g data-slot="plate-select-point-cross">
    <path d={crossPath} data-tone="light" />
    <path d={crossPath} data-tone="ink" />
  </g>
);
