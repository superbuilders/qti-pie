/**
 * The figures a Graphic Gap Match's plot draws (`figuresOf` in
 * `#plate/graphic/plot.ts`): the lines, the box plot's parts in the image's pixels,
 * scaling with it, each stroke a constant width on the page; and the number line's dots at the
 * page's own size, pinned on their ticks. The island's stage and the review draw them alike, and
 * none takes a pointer, so a tap beside a figure reaches the hotspot under it. Safe to import on
 * the server and the client: no hook or state.
 *
 * @module
 */
import type { ImageSize } from "#plate/interactions/image-size.ts";
import { Pin } from "#plate/ui/graphic/frame.tsx";
import type { Figure } from "#plate/graphic/plot.ts";

/**
 * The radius of a number line's dot, in CSS px: AlphaTest's player's 8.
 */
const pointRadius = 8;

/**
 * Draw one figure that scales with the image, or nothing for a dot, which is pinned.
 *
 * @param figure The figure.
 * @param key Its key among the figures.
 * @returns Its SVG element.
 */
const markOf = (figure: Figure, key: number) => {
  switch (figure.kind) {
    case "line":
    case "whisker": {
      const { y1, y2 } = figure.kind === "line" ? figure : { y1: figure.y, y2: figure.y };

      return (
        <line
          key={key}
          data-slot={
            figure.kind === "line" ? "plate-graphic-plot-line" : "plate-graphic-plot-whisker"
          }
          vectorEffect="non-scaling-stroke"
          x1={figure.x1}
          x2={figure.x2}
          y1={y1}
          y2={y2}
        />
      );
    }
    case "cap":
    case "median": {
      return (
        <line
          key={key}
          data-slot={figure.kind === "cap" ? "plate-graphic-plot-cap" : "plate-graphic-plot-median"}
          vectorEffect="non-scaling-stroke"
          x1={figure.x}
          x2={figure.x}
          y1={figure.top}
          y2={figure.bottom}
        />
      );
    }
    case "box": {
      return (
        <rect
          key={key}
          data-slot="plate-graphic-plot-box"
          height={figure.bottom - figure.top}
          vectorEffect="non-scaling-stroke"
          width={figure.right - figure.left}
          x={figure.left}
          y={figure.top}
        />
      );
    }
    case "ray": {
      return (
        <line
          key={key}
          data-slot="plate-graphic-plot-ray"
          vectorEffect="non-scaling-stroke"
          x1={figure.x1}
          x2={figure.x2}
          y1={figure.y}
          y2={figure.y}
        />
      );
    }
    case "point": {
      return null;
    }
    default: {
      return figure satisfies never;
    }
  }
};

/**
 * Draw a plot's figures that scale with the image, in the stage's marks: its lines, whiskers,
 * caps, box and median, `<g data-slot="plate-graphic-plot">`, which takes no pointer.
 *
 * @param props.figures The plot's figures.
 * @returns The group, empty where the plot draws none.
 */
export const PlotMarks = (props: { readonly figures: readonly Figure[] }) => (
  <g data-slot="plate-graphic-plot" pointerEvents="none">
    {props.figures.map(markOf)}
  </g>
);

/**
 * The arrowhead at a ray's end, pointing left, in CSS px round its tip: AlphaTest's player's 10 px
 * long and 12 px wide.
 */
const arrowhead = "M 0 0 L 10 -6 L 10 6 Z";

/**
 * Pin a plot's dots on their ticks, and each ray's arrowhead at its end, at the page's own size: a
 * dot a circle 8 px in radius, `plate-graphic-point-open` hollow or `plate-graphic-point-closed`
 * filled, and an arrowhead `plate-graphic-plot-arrowhead` pointing the ray's way, none taking a
 * pointer.
 *
 * @param props.figures The plot's figures.
 * @param props.size The image's size, the pixel space of the figures.
 * @returns The pinned dots and arrowheads.
 */
export const PlotPins = (props: {
  readonly figures: readonly Figure[];
  readonly size: ImageSize;
}) => (
  <>
    {props.figures.map((figure, key) =>
      figure.kind === "ray" ? (
        <Pin key={key} at={{ x: figure.x2, y: figure.y }} size={props.size}>
          <path
            d={arrowhead}
            data-slot="plate-graphic-plot-arrowhead"
            pointerEvents="none"
            transform={figure.toward === "left" ? undefined : "scale(-1 1)"}
          />
        </Pin>
      ) : null,
    )}
    {props.figures.map((figure, key) =>
      figure.kind === "point" ? (
        <Pin key={key} at={figure} size={props.size}>
          <circle
            data-slot={
              figure.dot === "open" ? "plate-graphic-point-open" : "plate-graphic-point-closed"
            }
            pointerEvents="none"
            r={pointRadius}
          />
        </Pin>
      ) : null,
    )}
  </>
);
