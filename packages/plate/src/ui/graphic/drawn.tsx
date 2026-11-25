/**
 * One area of a graphic interaction as the stage's overlay draws it: what the image stage draws
 * for each area while the child answers, and what a graphic interaction's review draws on the
 * server with no island. Safe to import on the server and the client: nothing here holds a hook or
 * state, so a server component and a client island draw the same shapes from it.
 *
 * Each area is drawn twice over, for two jobs. Its mark, `plate-graphic-mark`, is what the child
 * sees: the outline as two strokes, a light one under a dark one, so whatever the picture's colour
 * one of the two stands out from it (WCAG 2.2's 1.4.11 Non-text Contrast), with the area's state
 * on the group. Its hit shape, `plate-graphic-area`, is what a pointer lands on: the area's own
 * geometry, unpainted, taking the pointer on its fill. The marks take no pointer at all, so a
 * ring's stroke, which reaches past the area's edge, never takes a tap meant for a neighbour.
 *
 * @module
 * @see https://www.w3.org/TR/WCAG22/#non-text-contrast
 */
import type { ReactNode, SVGAttributes } from "react";
import type { ArrowDirection } from "#plate/interactions/area.ts";
import type { ImageSize } from "#plate/interactions/image-size.ts";
import type { AnswerMark } from "#plate/ui/item/interactions/marks.ts";
import { Pin } from "#plate/ui/graphic/frame.tsx";
import { cornerOf, drawingOf, interiorOf } from "#plate/graphic/geometry.ts";
import type { Drawing, GraphicArea, ImagePoint } from "#plate/graphic/geometry.ts";

/**
 * An SVG shape's attributes, its `data-*` state among them.
 */
type DrawnAttributes = SVGAttributes<SVGElement> & {
  readonly [name: `data-${string}`]: string | undefined;
};

/**
 * Draw a drawing as its SVG element, with the attributes given.
 *
 * @param drawing The drawing, from `drawingOf`.
 * @param own The element's other attributes.
 * @returns The `circle`, `ellipse`, `polygon` or `rect`.
 */
const elementOf = (drawing: Drawing, own: DrawnAttributes): ReactNode => {
  switch (drawing.element) {
    case "circle": {
      return <circle {...own} cx={drawing.cx} cy={drawing.cy} r={drawing.r} />;
    }
    case "ellipse": {
      return <ellipse {...own} cx={drawing.cx} cy={drawing.cy} rx={drawing.rx} ry={drawing.ry} />;
    }
    case "polygon": {
      return (
        <polygon
          {...own}
          fillRule="evenodd"
          points={drawing.vertices.map(([x, y]) => `${String(x)},${String(y)}`).join(" ")}
        />
      );
    }
    case "rect": {
      return (
        <rect {...own} height={drawing.height} width={drawing.width} x={drawing.x} y={drawing.y} />
      );
    }
  }
};

/**
 * Draw one area's hit shape, `data-slot="plate-graphic-area"` with `data-area` its QTI `shape`, in
 * the overlay's pixels: its exact geometry, which the stylesheet leaves unpainted. It takes the
 * pointer on its fill alone, `pointer-events="visibleFill"` whatever it is painted with, so a
 * pointer just past the area's edge never reaches it; the overlay itself takes none, so the
 * topmost area under a pointer is the one `paintedOf` puts there. An island passes it as an
 * area's element, or as a part's `render` element, with its handlers.
 *
 * @param props.area The area, whose `shape` it marks.
 * @param props.drawing Its drawing, from `drawingOf`.
 * @param props The shape's other SVG attributes: the island's `data-*` state, its handlers.
 * @returns The shape.
 */
export const DrawnArea = (
  props: { readonly area: GraphicArea; readonly drawing: Drawing } & SVGAttributes<SVGElement>,
) => {
  const { area, drawing, ...rest } = props;

  return elementOf(drawing, {
    ...rest,
    "data-area": area.geometry,
    "data-slot": "plate-graphic-area",
    pointerEvents: "visibleFill",
  });
};

/**
 * Draw one area's mark, `<g data-slot="plate-graphic-mark">` with `data-area` its QTI `shape` and
 * the area's state on it: its outline twice, `data-tone="light"` under `data-tone="ink"`, neither
 * taking the pointer, then whatever the mark holds above them, such as the area's hit shape. The
 * stylesheet strokes the two tones by the state and draws no outline for a `default` area, the
 * whole image.
 *
 * @param props.area The area, whose `shape` it marks.
 * @param props.children What the mark holds above its outline: its hit shape, for an area the
 *   child taps.
 * @param props.drawing Its drawing, from `drawingOf`.
 * @param props The group's other attributes: the area's state, `data-selected`,
 *   `data-focus-visible`, `data-placed`, and in a review `data-mark`.
 * @returns The mark.
 */
export const GraphicMark = (
  props: {
    readonly area: GraphicArea;
    readonly children?: ReactNode;
    readonly drawing: Drawing;
  } & SVGAttributes<SVGGElement>,
) => {
  const { area, children, drawing, ...rest } = props;

  return (
    <g {...rest} data-area={area.geometry} data-slot="plate-graphic-mark">
      {elementOf(drawing, { "data-tone": "light", pointerEvents: "none" })}
      {elementOf(drawing, { "data-tone": "ink", pointerEvents: "none" })}
      {children}
    </g>
  );
};

/**
 * Draw a line between two areas, from one's interior point to the other's (`interiorOf`), in the
 * image's pixels, `data-slot="plate-graphic-associate-line"`: two copies, a light one under an ink
 * one, so it shows against any picture. A Graphic Associate's island draws each pair's line with
 * it, and its review each box's.
 *
 * @param props.from One area, none where the pair names no area.
 * @param props.mark The review's mark on the pair, none while the child answers and where the
 *   review marks nothing.
 * @param props.size The image's size, the pixel space of the areas' coordinates.
 * @param props.to The other area, none where the pair names no area.
 * @returns The line, or nothing where either area is absent or holds no point.
 */
export const PairLine = (props: {
  readonly from: GraphicArea | undefined;
  readonly mark: AnswerMark | undefined;
  readonly size: ImageSize;
  readonly to: GraphicArea | undefined;
}) => {
  const { from, mark, size, to } = props;
  const fromDrawing = from === undefined ? undefined : drawingOf(from, size);
  const toDrawing = to === undefined ? undefined : drawingOf(to, size);
  if (fromDrawing === undefined || toDrawing === undefined) {
    return null;
  }

  const [a, b] = [interiorOf(fromDrawing), interiorOf(toDrawing)];

  return (
    <g aria-hidden="true" data-mark={mark} data-slot="plate-graphic-associate-line">
      <line data-tone="light" x1={a.x} x2={b.x} y1={a.y} y2={b.y} />
      <line data-tone="ink" x1={a.x} x2={b.x} y1={a.y} y2={b.y} />
    </g>
  );
};

/**
 * The check mark's path, in a box one unit across centred on the origin.
 */
const checkPath = "M -0.32 0.02 L -0.1 0.24 L 0.34 -0.22";

/**
 * The radius of a badge pinned in an area's corner, in CSS px: a 28 px disc, a picked area's check
 * badge and a Graphic Order's position number alike.
 */
export const badgeRadius = 14;

/**
 * Pin a badge inside an area's corner, the point of its outline farthest toward the image's top
 * right (`cornerOf`): its pin at that point and its badge's middle a radius left of it and below
 * it, so a badge drawn round the origin touches the area's outline there, stays clear of what the
 * area's middle holds, the picture's own label or part, and stays inside the area's box and the
 * image. One rule places every badge on an area.
 *
 * @param props.area The area.
 * @param props.children The badge, in CSS px round the origin, {@link badgeRadius} across its
 *   middle.
 * @param props.size The image's size, the pixel space of the area's coordinates.
 * @returns The pinned badge, or none for an area that holds no point.
 */
export const CornerPin = (props: {
  readonly area: GraphicArea;
  readonly children: ReactNode;
  readonly size: ImageSize;
}) => {
  const { area, children, size } = props;
  const drawing = drawingOf(area, size);

  return drawing === undefined ? null : (
    <Pin at={cornerOf(drawing)} size={size}>
      <g transform={`translate(${String(-badgeRadius)} ${String(badgeRadius)})`}>{children}</g>
    </Pin>
  );
};

/**
 * The side of an arrow's box, in CSS px: AlphaTest's player's 16 px arrow (`w-4 h-4`).
 */
const arrowSize = 16;

/**
 * The space between an arrow and the area it stands beside, in CSS px: AlphaTest's player's 2 px
 * margin (`mb-0.5`, `mt-0.5`).
 */
const arrowGap = 2;

/**
 * Each arrow's path, in a box 24 units across, AlphaTest's player's lucide `ArrowUp` and
 * `ArrowDown`: a shaft and its head, pointing up or down.
 */
const arrowPaths = {
  down: "M 12 5 V 19 M 19 12 L 12 19 L 5 12",
  up: "M 12 19 V 5 M 5 12 L 12 5 L 19 12",
} as const satisfies Readonly<Record<ArrowDirection, string>>;

/**
 * Pin an arrow beside an area, `<g data-slot="plate-graphic-arrow">`, as its author's class asks
 * (`plate-arrow-up`, `plate-arrow-down`), at the point of the area's box `#plate/graphic/arrows.ts`
 * gives: rising from it pointing up, or hanging from it pointing down, 16 px tall and
 * {@link arrowGap} clear of the box, at the page's own size, drawn in the text's colour, as
 * AlphaTest's player drew one beside its drop box. It takes no pointer, so a tap beside the area
 * reaches what is under it.
 *
 * @param props.at The point of the area's box it stands on, in the image's pixels.
 * @param props.direction The arrow's direction.
 * @param props.size The image's size, the pixel space of the point.
 * @returns The pinned arrow.
 */
export const ArrowPin = (props: {
  readonly at: ImagePoint;
  readonly direction: ArrowDirection;
  readonly size: ImageSize;
}) => {
  const { at, direction, size } = props;
  const top = direction === "up" ? -(arrowGap + arrowSize) : arrowGap;

  return (
    <Pin at={at} size={size}>
      <g
        data-slot="plate-graphic-arrow"
        pointerEvents="none"
        transform={`translate(${String(-arrowSize / 2)} ${String(top)}) scale(${String(arrowSize / 24)})`}
      >
        <path
          d={arrowPaths[direction]}
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
        />
      </g>
    </Pin>
  );
};

/**
 * The width of the box the check's path is drawn in, in CSS px: the glyph about 17 px across in
 * the disc.
 */
const glyphSize = 26;

/**
 * Draw the badge that marks a picked area, `<g data-slot="plate-graphic-check">`: a disc,
 * `plate-graphic-check-disc`, holding the check's path, `plate-graphic-check-glyph`, in CSS px
 * round its origin, which {@link CornerPin} places inside the area's corner. It takes no pointer.
 * Its picked state is told by more than the ring's colour (1.4.1 Use of Color).
 *
 * @returns The badge.
 * @see https://www.w3.org/TR/WCAG22/#use-of-color
 */
export const CheckBadge = () => (
  <g data-slot="plate-graphic-check" pointerEvents="none">
    <circle data-slot="plate-graphic-check-disc" r={badgeRadius} />
    <path
      d={checkPath}
      data-slot="plate-graphic-check-glyph"
      fill="none"
      transform={`scale(${String(glyphSize)})`}
    />
  </g>
);
