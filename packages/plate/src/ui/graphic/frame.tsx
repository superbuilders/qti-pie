/**
 * The frame every graphic interaction's image stands in, as plain markup: the scroll region, the
 * image with its overlay over it, and the sizing that makes every area a target a child can hit
 * (`#plate/ui/graphic/scale.ts`). A review renders it on the server as it is; the answering stage
 * (`#plate/ui/graphic/stage.tsx`) renders the same parts with its own behaviour bound to them.
 * Safe to import on the server and the client: nothing here holds a hook or state.
 *
 * The parts:
 *
 * - `plate-graphic`, the root and the stage's scroll region: a `group` always named, by the
 *   interaction's prompt or names, else its image's own, else the catalog's word for a picture; the
 *   stage scrolls across inside it when its container is narrower than its floor width and the page
 *   never does (WCAG 2.2's 1.4.10 Reflow allows that for a picture that needs its layout), and the
 *   answering stage makes it a tab stop while it scrolls, so a keyboard can scroll it (2.1.1);
 * - `plate-graphic-image`, the box holding the server's image and, over it, the overlay and the pins;
 * - `plate-graphic-overlay`, an `svg` in the image's authored pixels (`viewBox`), `aria-hidden`,
 *   holding the areas' marks, which scale with the image;
 * - `plate-graphic-pins`, an `svg` over the overlay with no `viewBox`, `aria-hidden`, so one of its
 *   units is one CSS px whatever the image's scale: the marks that read at the page's own size, a
 *   badge, a placed card, a point's marker, each pinned to a point of the image by percentages of
 *   its size ({@link Pin});
 * - `plate-graphic-floor`, a zero-height `svg` whose `width` is the stage's floor width;
 * - `plate-graphic-fit`, a `span` holding an `svg` in the image's authored proportions (`viewBox`),
 *   which the stylesheet sets at the host's height budget for the picture
 *   (`--plate-stage-block-size`), so that its width is the widest the image may be drawn under it.
 *
 * Every number travels as an SVG attribute, never a `style`, which a page whose policy has no
 * `unsafe-inline` drops. The stylesheet lays the root out as one column at most as wide as its
 * container (`fit-content(100%)`): the floor spacer holds the column's least width, and the fit
 * one, in a box that clips, its greatest, so the column is the floor width, or the container's
 * width up to the width the height budget gives the image, whichever is greater, on first paint;
 * and the image fills the column, its overlay scaling with it and its pins standing where they
 * belong on it. The image is drawn as large as its container and the budget allow, above or below
 * its author's size, and never so small that an area is under 44 px across
 * (`#plate/ui/graphic/scale.ts`). The two spacers stand only where the image's size is known, and
 * the image keeps its own size until then, within the container and the budget.
 *
 * @module
 * @see https://www.w3.org/TR/WCAG22/#reflow
 */
import { Predicate } from "effect";
import { Children, isValidElement } from "react";
import type { ReactElement, ReactNode } from "react";
import type { AuthoredSize, ImageSize } from "#plate/interactions/image-size.ts";
import type { NameAttributes, Named } from "#plate/ui/attributes.ts";
import type { GraphicArea, ImagePoint } from "#plate/ui/graphic/geometry.ts";
import type { GraphicLabels } from "#plate/ui/graphic/labels.ts";
import { floorWidthOf, smallestTargetOf, stageScaleOf } from "#plate/ui/graphic/scale.ts";
import type { StageScale } from "#plate/ui/graphic/scale.ts";
import { sizeOf } from "#plate/ui/graphic/size.ts";
import { collapsedText } from "#plate/model/whitespace.ts";

/**
 * The props of an element of the server's image the name reads: an `img`'s `alt`, whether it is
 * hidden from assistive technology, and its children.
 */
interface NamedProps {
  readonly alt?: unknown;
  readonly "aria-hidden"?: unknown;
  readonly children?: ReactNode;
}

/**
 * Give the text content shows, as `textContent` would: every string and number below it,
 * nothing below an element hidden from assistive technology.
 *
 * @param node The content.
 * @returns The text, uncollapsed.
 */
const textOf = (node: ReactNode): string =>
  Children.toArray(node)
    .map((child) => {
      if (Predicate.isString(child) || Predicate.isNumber(child)) {
        return String(child);
      }

      return isValidElement<NamedProps>(child) && child.props["aria-hidden"] !== "true"
        ? textOf(child.props.children)
        : "";
    })
    .join("");

/**
 * Give the name an element of the image gives itself: an `img`'s `alt`, an `object`'s fallback
 * content, its text alternative; empty for any other element, or one whose text is blank.
 *
 * @param element The element.
 * @returns The name, collapsed.
 */
const ownNameOf = (element: ReactElement<NamedProps>): string => {
  const { alt, children } = element.props;

  if (element.type === "img") {
    return Predicate.isString(alt) ? collapsedText(alt) : "";
  }

  return element.type === "object" ? collapsedText(textOf(children)) : "";
};

/**
 * Find the name an image gives itself, as the server rendered it: the first `img`'s `alt` that is
 * not blank, or an `object`'s fallback content, its text alternative; none below an element hidden
 * from assistive technology.
 *
 * @param node The image, as the server rendered it.
 * @returns The name, collapsed, or none where the image gives none.
 * @see https://www.w3.org/TR/html-aam-1.0/#img-element-accessible-name-computation
 */
const imageNameOf = (node: ReactNode): string | undefined => {
  for (const child of Children.toArray(node)) {
    if (isValidElement<NamedProps>(child) && child.props["aria-hidden"] !== "true") {
      const own = ownNameOf(child);
      const found = own === "" ? imageNameOf(child.props.children) : own;
      if (found !== undefined) {
        return found;
      }
    }
  }

  return undefined;
};

/**
 * Give the attribute that names a stage's region: what names its interaction's group, the ids of
 * its prompt or the author's `aria-labelledby`, else the author's `aria-label`; where nothing
 * does, the name its image gives itself (`imageNameOf`), else the catalog's word for a picture, so
 * a region is named whatever the interaction writes (WCAG 2.2's 4.1.2 Name, Role, Value). While
 * the region scrolls, the answering stage describes it by its scroll hint too
 * (`aria-describedby`), so it reads as its name, its role, then "Scroll to see the whole image".
 *
 * @param naming What names the interaction's group, as the server resolved it.
 * @param image The image, as the server rendered it.
 * @param picture The catalog's word for a picture, the name of last resort.
 * @returns The attribute.
 */
export const stageNameOf = (naming: NameAttributes, image: ReactNode, picture: string): Named => {
  const labelledBy = naming["aria-labelledby"];
  if (labelledBy !== undefined) {
    return { "aria-labelledby": labelledBy };
  }

  return { "aria-label": naming["aria-label"] ?? imageNameOf(image) ?? picture };
};

/**
 * The overlay's attributes but its part's own: hidden from assistive technology, its `viewBox` the
 * image's authored pixels and stretched over the image's box as an image given both dimensions is,
 * taking no pointer itself.
 *
 * @param size The image's authored size.
 * @returns The attributes.
 */
export const overlayAttributes = (size: ImageSize) =>
  ({
    "aria-hidden": "true",
    focusable: "false",
    pointerEvents: "none",
    preserveAspectRatio: "none",
    viewBox: `0 0 ${String(size.width)} ${String(size.height)}`,
  }) as const;

/**
 * The pins' attributes but their part's own: hidden from assistive technology as the overlay is,
 * with no `viewBox`, so its unit is the CSS px, laid over the image's box by the stylesheet, and
 * taking no pointer itself, a pin taking it only where a hit shape of its own asks for it.
 */
export const pinsAttributes = {
  "aria-hidden": "true",
  focusable: "false",
  height: "100%",
  overflow: "visible",
  pointerEvents: "none",
  width: "100%",
} as const;

/**
 * Give a coordinate as a percentage of its side of the image, as an attribute of the pins writes
 * it.
 *
 * @param value The coordinate, in the image's pixels.
 * @param side The side it is along, in the image's pixels.
 * @returns The percentage, with its sign.
 */
export const percentOf = (value: number, side: number): string =>
  `${String((value / side) * 100)}%`;

/**
 * Pin a mark that reads at the page's own size to a point of the image: a nested `svg`,
 * `data-slot="plate-graphic-pin"`, whose origin is the point, given as percentages of the image's
 * size, so the browser places it wherever the stage draws the image, and inside which one unit is
 * one CSS px. What it holds is drawn round its origin, past the pin's box (`overflow`).
 *
 * @param props.at The point, in the image's pixels.
 * @param props.children The mark, in CSS px round the origin.
 * @param props.size The image's size, the pixel space of the point.
 * @returns The pin.
 */
export const Pin = (props: {
  readonly at: ImagePoint;
  readonly children: ReactNode;
  readonly size: ImageSize;
}) => {
  const { at, children, size } = props;

  return (
    <svg
      data-slot="plate-graphic-pin"
      overflow="visible"
      x={percentOf(at.x, size.width)}
      y={percentOf(at.y, size.height)}
    >
      {children}
    </svg>
  );
};

/**
 * The narrowest viewport a page must reflow at, in CSS px: WCAG 2.2's 1.4.10 Reflow asks content
 * to read without scrolling in two directions "at a width equivalent to 320 CSS pixels", the width
 * of a small phone and of a 1280 px screen at 400% zoom. A stage wider than that, inside its
 * region, scrolls there.
 *
 * @see https://www.w3.org/TR/WCAG22/#reflow
 */
const reflowWidth = 320;

/**
 * The padding of the stage's region on each side, in CSS px: the stylesheet's `0.5rem` on
 * `plate-graphic`, at the default root font size, so an area's ring at the image's edge is not
 * clipped by the scroll box.
 */
const regionPadding = 8;

/**
 * Tell whether a stage's region scrolls at the narrowest reflow viewport ({@link reflowWidth}):
 * its floor width and its padding are wider than the viewport less its padding. The server cannot
 * know the page's width, but where this holds the region scrolls on the page a child may well have,
 * and a keyboard must reach it to scroll it (2.1.1): Chrome and Firefox make a scroll container a
 * tab stop themselves, and Safari does not, so the server makes the region one.
 *
 * @param floor The stage's floor width, in CSS px (`floorWidthOf`).
 * @returns Whether its region scrolls at 320 CSS px.
 */
export const scrollsAtReflow = (floor: number): boolean =>
  floor + regionPadding > reflowWidth - regionPadding;

/**
 * Render the stage's two sizing spacers: `plate-graphic-floor`, a zero-height `svg` whose `width`
 * attribute is the stage's floor width, and `plate-graphic-fit`, holding an `svg` whose `viewBox`
 * is the image's authored pixels, so its proportions are the image's and the stylesheet gives it
 * the height budget's height.
 *
 * @param props.floor The stage's floor width, in CSS px (`floorWidthOf`).
 * @param props.size The image's authored size.
 * @returns The spacers.
 */
export const StageSpacers = (props: { readonly floor: number; readonly size: ImageSize }) => {
  const { floor, size } = props;

  return (
    <>
      <svg
        aria-hidden="true"
        data-slot="plate-graphic-floor"
        focusable="false"
        height="0"
        width={floor}
      />
      <span data-slot="plate-graphic-fit">
        <svg
          aria-hidden="true"
          focusable="false"
          viewBox={`0 0 ${String(size.width)} ${String(size.height)}`}
        />
      </span>
    </>
  );
};

/**
 * A review's stage, as the server can draw it: `sized`, where the author wrote both of the image's
 * dimensions, with the pixel space its marks are drawn in and the scale its smallest target gives
 * it; or `unsized`, where only the browser can read the size, and the image stands alone, with no
 * overlay and no sizing, its areas said by the list beside it.
 */
type ReviewStage =
  | { readonly kind: "sized"; readonly scale: StageScale; readonly size: ImageSize }
  | { readonly kind: "unsized" };

/**
 * A review's stage whose size the server knows.
 */
type SizedStage = Extract<ReviewStage, { readonly kind: "sized" }>;

/**
 * Give a review's stage for an interaction whose targets are its areas: sized by the author's size
 * where it is written in full, at the scale its smallest area gives it, as the answering stage is;
 * else unsized.
 *
 * @param areas The interaction's areas, in document order.
 * @param authored The size the author wrote on the image.
 * @returns The stage.
 */
export const reviewStageOf = (
  areas: readonly GraphicArea[],
  authored: AuthoredSize,
): ReviewStage => {
  const size = sizeOf(authored);

  return size === undefined
    ? { kind: "unsized" }
    : { kind: "sized", scale: stageScaleOf(smallestTargetOf(areas, size)), size };
};

/**
 * Render a graphic interaction's stage as plain markup, as a review shows it: the region, the
 * image, and on a sized stage the overlay holding the marks, the pins holding the marks that read
 * at the page's size, and the spacers that size the stage by its scale and proportions.
 *
 * The region is a named `group`, a tab stop wherever it scrolls at the narrowest reflow viewport
 * ({@link scrollsAtReflow}): a review renders without script, which cannot tell whether the region
 * scrolls on the page it stands on, and a region that never scrolls gives the keyboard nothing to
 * do.
 *
 * @param props.image The image, as the server rendered it.
 * @param props.labels The stage's words: the word for a picture.
 * @param props.marks Draw what the overlay holds of a sized stage, in the image's pixels: each
 *   area's mark, a kind's own marks; none where the kind draws nothing there.
 * @param props.naming What names the interaction's group; the image's own name, then the
 *   catalog's word for a picture, name the region where it names it by nothing
 *   ({@link stageNameOf}).
 * @param props.pins Draw what the pins hold of a sized stage, each mark a {@link Pin}: a badge, a
 *   placed card, a point's marker; none where the kind pins nothing.
 * @param props.stage The stage ({@link ReviewStage}).
 * @returns The stage.
 */
export const StageFrame = (props: {
  readonly image: ReactNode;
  readonly labels: GraphicLabels;
  readonly marks?: (stage: SizedStage) => ReactNode;
  readonly naming: NameAttributes;
  readonly pins?: (stage: SizedStage) => ReactNode;
  readonly stage: ReviewStage;
}) => {
  const { image, labels, marks, naming, pins, stage } = props;
  const floor = stage.kind === "sized" ? floorWidthOf(stage.size, stage.scale) : 0;

  return (
    <div
      {...stageNameOf(naming, image, labels.picture)}
      data-slot="plate-graphic"
      role="group"
      tabIndex={scrollsAtReflow(floor) ? 0 : undefined}
    >
      <div data-slot="plate-graphic-image">
        {image}
        {stage.kind === "sized" ? (
          <svg {...overlayAttributes(stage.size)} data-slot="plate-graphic-overlay">
            {marks?.(stage)}
          </svg>
        ) : null}
        {stage.kind === "sized" && pins !== undefined ? (
          <svg {...pinsAttributes} data-slot="plate-graphic-pins">
            {pins(stage)}
          </svg>
        ) : null}
      </div>
      {stage.kind === "sized" ? <StageSpacers floor={floor} size={stage.size} /> : null}
    </div>
  );
};
