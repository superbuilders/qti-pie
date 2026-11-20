/**
 * One copy of a Position Object's object drawn on the stage: what the stage island's overlay draws
 * at each placed copy while the child answers, and what a review draws on the server with no
 * island. Safe to import on the server and the client: it holds no hook and no state, so a server
 * component and a client island draw the same copy from it.
 *
 * The overlay draws in the stage image's own pixels, and a copy stands at the point QTI records,
 * where the object's centre point lands, so the object is drawn from that point less its centre
 * point: an SVG `image` of the object at its own size, placed by attributes alone, since a page
 * whose policy has no `unsafe-inline` drops a `style` attribute. An object whose image gives no
 * address or no size in pixels is drawn as a marker at the point instead, a circle as wide as the
 * smallest target the stage may show unscaled (WCAG 2.5.8). Every copy wears the stage's two-tone
 * mark around what it draws, so it shows against any picture (WCAG 1.4.11).
 *
 * @module
 * @see https://www.imsglobal.org/spec/qti/v3p0/info/index.html#Root_PositionObjectInteraction
 * @see https://www.w3.org/TR/WCAG22/#target-size-minimum
 */
import type { ImageSize } from "#plate/interactions/image-size.ts";

/**
 * The object image a copy is drawn as: its address, as the page writes its `src` or `data`, and
 * its `width` and `height` in pixels, as the author wrote them.
 */
export interface DrawnImage {
  readonly href: string;
  readonly size: ImageSize;
}

/**
 * How a copy of an object is drawn: its centre point, and the object image, where it can be drawn.
 */
export interface ObjectDrawing {
  /**
   * The point of the object that lands on the position, from the object image's top left corner,
   * in its pixels: the author's `center-point`, else the middle of the image (QTI 3.0 information
   * model 5.107.1).
   */
  readonly centerPoint: readonly [x: number, y: number];
  /**
   * The object image; absent where it has no address the page writes, or the author wrote its
   * `width` or `height` in no pixels, and the copy is drawn as a marker.
   */
  readonly image?: DrawnImage;
}

/**
 * The state a copy's mark shows: `data-placed` on a copy placed on the stage, `data-selected` on
 * the copy held, and `data-focus-visible` on the copy whose control has keyboard focus.
 */
export interface MarkState {
  readonly focusVisible: boolean;
  readonly placed: boolean;
  readonly selected: boolean;
}

/**
 * The diameter of the marker drawn for an object that cannot be drawn as its image, in the stage
 * image's pixels: the smallest target WCAG 2.5.8 admits, so the stage needs no more scale for it
 * than for an image that size.
 */
const markerDiameter = 24;

/**
 * Give the target a copy of an object is, in the stage image's pixels: the diameter of the largest
 * circle inside what it draws, the shorter side of its image, or the marker's diameter.
 *
 * @param drawing How the object is drawn.
 * @returns The diameter.
 */
const targetOf = (drawing: ObjectDrawing): number => {
  const { image } = drawing;

  return image === undefined ? markerDiameter : Math.min(image.size.width, image.size.height);
};

/**
 * Give the smallest target among a stage's copies, the measure its scale is read from
 * (`stageScaleOf` in `#plate/ui/graphic/scale.ts`): a Position Object's stage shows no area, so its
 * targets are the copies the child places, each as large as its object.
 *
 * @param drawings How each of the stage's objects is drawn.
 * @returns The smallest diameter, in the stage image's pixels; infinite for no object.
 */
export const smallestCopyOf = (drawings: readonly ObjectDrawing[]): number =>
  Math.min(...drawings.map(targetOf), Number.POSITIVE_INFINITY);

/**
 * Draw a copy of an object at the origin of the copy it stands for, which its caller translates to
 * the copy's position: its image with its centre point at the origin, or, where it has no address
 * or no size, a marker centred there; then the stage's two-tone mark around it, its outline twice,
 * the light tone's wider stroke under the ink's.
 *
 * - `plate-position-object-image`, the object's `image`, `aria-hidden` with the overlay;
 * - `plate-position-object-marker`, the marker, a `circle`;
 * - `plate-graphic-mark`, the mark, holding a `rect` around the image, or a `circle` around the
 *   marker, with `data-tone="light"` and then with `data-tone="ink"`, neither taking the pointer,
 *   as the stage's own marks are (`GraphicMark` in `#plate/ui/graphic/drawn.tsx`), and the copy's
 *   state ({@link MarkState}) on it.
 *
 * @param props.drawing How the object is drawn.
 * @param props.state What the copy's mark shows.
 * @returns The drawing.
 */
export const ObjectCopy = (props: {
  readonly drawing: ObjectDrawing;
  readonly state: MarkState;
}) => {
  const { drawing, state } = props;
  const [x, y] = drawing.centerPoint;
  const { image } = drawing;
  const outline = (tone: "ink" | "light") =>
    image === undefined ? (
      <circle data-tone={tone} fill="none" pointerEvents="none" r={markerDiameter / 2} />
    ) : (
      <rect
        data-tone={tone}
        fill="none"
        height={image.size.height}
        pointerEvents="none"
        width={image.size.width}
        x={-x}
        y={-y}
      />
    );

  return (
    <>
      {image === undefined ? (
        <circle data-slot="plate-position-object-marker" r={markerDiameter / 2} />
      ) : (
        <image
          data-slot="plate-position-object-image"
          height={image.size.height}
          href={image.href}
          preserveAspectRatio="none"
          width={image.size.width}
          x={-x}
          y={-y}
        />
      )}
      <g
        data-focus-visible={state.focusVisible ? "" : undefined}
        data-placed={state.placed ? "" : undefined}
        data-selected={state.selected ? "" : undefined}
        data-slot="plate-graphic-mark"
      >
        {outline("light")}
        {outline("ink")}
      </g>
    </>
  );
};

/**
 * Give the transform that moves a copy's drawing to its position, as an SVG attribute.
 *
 * @param point The position, in the stage image's pixels.
 * @param point.x The position from the stage image's left.
 * @param point.y The position from the stage image's top.
 * @returns The `transform` attribute.
 */
export const placedAt = (point: { readonly x: number; readonly y: number }): string =>
  `translate(${String(point.x)} ${String(point.y)})`;
