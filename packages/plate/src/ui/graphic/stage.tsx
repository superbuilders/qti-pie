"use client";

/**
 * The image stage every graphic interaction stands on, as the child answers it: the author's
 * image in the stage's frame (`#plate/ui/graphic/frame.tsx`), and over it an SVG overlay in the
 * image's own pixels that draws the interaction's areas, takes a tap on the image as a point and
 * the area it falls in, and holds what the interaction draws on top at the image's scale, its lines
 * and copies, and over that the frame's pins, which hold what reads at the page's own size, its
 * badges, points and placed cards.
 *
 * QTI writes an area's `coords` in the image's own pixels, and the stage scales the image, so the
 * overlay's `viewBox` is that pixel space and the stylesheet lays the overlay over the image's box:
 * what it draws scales with the image, and a pointer maps back through the overlay's screen
 * matrix, whatever the scaling. The pixel space is the size the author gave the image
 * (`sizeOf` in `#plate/ui/graphic/size.ts`), else the image's natural size once the client reads
 * it: an `img`'s natural size, and an `object`'s, which reports none, read from the image its
 * `data` names. Until the size is known the overlay is absent and nothing is drawn; an image that
 * loads nothing never gets one, so its interaction offers its areas only in its list.
 *
 * The stage is sized so every area is a target a child can hit, never under 44 CSS px across
 * (`#plate/graphic/scale.ts`), from the smallest tap region, what each area keeps once those
 * listed before it take the points they share, unless the interaction gives a scale of its own, and
 * above that as large as its container and the host's height budget allow (the frame's sizing).
 * Its region is always named, and scrolls across when the page is narrower than that floor, a tab
 * stop only then, so the keyboard reaches it exactly when it has something to do. A tap commits on
 * release, where it began (`#plate/ui/graphic/press.ts`, WCAG 2.2's 2.5.2), never on press.
 *
 * Nothing is positioned by a `style` attribute: the geometry travels as SVG attributes, and the
 * stylesheet places the overlay. The overlay is `aria-hidden`: it is a pointer's way to the areas,
 * and the interaction's list of them, which the keyboard and a screen reader use, says everything
 * it shows. A list control's keyboard focus is mirrored on its area (`focused`), so a sighted
 * keyboard user sees which area a control means.
 *
 * The parts, under the primitive `plate-graphic`, beside the frame's:
 *
 * - `plate-graphic-mark`, each area's mark, with `data-area` its QTI `shape` and its state,
 *   `data-selected` and `data-focus-visible`, holding its two tones and its hit shape,
 *   `plate-graphic-area` (`GraphicMark`, `DrawnArea` in `#plate/ui/graphic/drawn.tsx`), each drawn
 *   by its island;
 * - `plate-graphic-marks`, a `g` above every area for what the interaction draws on top in the
 *   image's pixels;
 * - In the pins, the frame's `plate-graphic-pins`, the check badge inside each picked area's top
 *   right corner ({@link CheckBadge}), then what the interaction pins there;
 * - `plate-graphic-hint`, the scroll hint that describes the region while it scrolls, hidden.
 *
 * @module
 * @see https://www.imsglobal.org/spec/qti/v3p0/info#Derived_Coords
 */
import { createParts } from "@ui-sdk/react/primitive";
import { Fragment, createContext, use, useId } from "react";
import type { ReactNode } from "react";
import { definePrimitive } from "#plate/ui/define-primitive.ts";
import { StagePartOutside } from "#plate/ui/defects.ts";
import { CheckBadge, CornerPin } from "#plate/ui/graphic/drawn.tsx";
import {
  StageSpacers,
  overlayAttributes,
  pinsAttributes,
  scrollsAtReflow,
  stageNameOf,
} from "#plate/ui/graphic/frame.tsx";
import { hitOf, paintedOf } from "#plate/graphic/geometry.ts";
import type { AuthoredSize, ImageSize } from "#plate/interactions/image-size.ts";
import type { Drawing, GraphicArea, ImagePoint } from "#plate/graphic/geometry.ts";
import type { GraphicLabels } from "#plate/ui/graphic/labels.ts";
import { noPress, pressStep } from "#plate/ui/graphic/press.ts";
import type { Press, PressEvent, Spot } from "#plate/ui/graphic/press.ts";
import { floorWidthOf, smallestTargetOf, stageScaleOf } from "#plate/graphic/scale.ts";
import type { StageScale, TargetFloor } from "#plate/graphic/scale.ts";
import { sizeOf } from "#plate/ui/graphic/size.ts";
import type { NameAttributes } from "#plate/ui/attributes.ts";

/**
 * One area of the stage: its geometry, and the identifier of the hotspot it is, which a tap on it
 * reports.
 */
export interface StageArea extends GraphicArea {
  readonly identifier: string;
}

/**
 * A tap on the image: the point it was released at, in the image's pixels, and the hotspot it
 * began and ended in, none where it fell in none.
 */
export interface StagePress {
  readonly identifier: string | undefined;
  readonly point: ImagePoint;
}

/**
 * What a part drawn inside the stage reads from it, through {@link useGraphicStage}: the image's
 * pixel space, the stage's pointer geometry, for a drag that ends on the image, and its floor
 * width. A part that reads at the page's own size is pinned (`Pin` in
 * `#plate/ui/graphic/frame.tsx`), so none reads the image's scale on the page, only the least it
 * is drawn at.
 */
export interface StageView {
  /**
   * Find the hotspot a point falls in, by `hitOf`: the first listed that holds it, else the
   * default hotspot.
   *
   * @param point The point, in the image's pixels.
   * @returns The hotspot's identifier, or none.
   */
  readonly areaAt: (point: ImagePoint) => string | undefined;
  /**
   * The width the stage is never drawn below, in CSS px (`floorWidthOf`), at its scale, its own or
   * its areas'.
   */
  readonly floor: number;
  /**
   * Map a pointer's viewport position to the image's pixels, through the overlay's screen matrix.
   *
   * @param clientX The pointer's `clientX`.
   * @param clientY The pointer's `clientY`.
   * @returns The point, or none while the overlay is not on the page.
   */
  readonly pointAt: (clientX: number, clientY: number) => ImagePoint | undefined;
  readonly size: ImageSize;
}

/**
 * The stage primitive's options: the areas, the author's size, what a tap on the image calls, the
 * id of the scroll hint, and what the region is to assistive technology.
 */
interface StageOptions {
  readonly areas: readonly StageArea[];
  readonly hint: string;
  readonly onPress?: (press: StagePress) => void;
  /**
   * Whether the region scrolls at the narrowest reflow viewport, as far as the server knows the
   * stage's floor width (`scrollsAtReflow`): the region's tab stop until it is measured.
   */
  readonly reflows: boolean;
  /**
   * What the region is ({@link StageRole}): an application is always a tab stop, and described by
   * its keys.
   */
  readonly region: StageRole;
  readonly size: AuthoredSize;
}

/**
 * The stage primitive's state: the author's size, the image's natural size once it is read,
 * whether the region scrolls, the hint's id, and what the region is.
 */
interface StageState {
  readonly authored: AuthoredSize;
  readonly hint: string;
  readonly natural: ImageSize | undefined;
  readonly reflows: boolean;
  readonly region: StageRole;
  /**
   * Whether the region scrolls, as measured; none until it is.
   */
  readonly scrolls: boolean | undefined;
}

/**
 * What the stage primitive knows of its view: all of it but the floor width, which takes the
 * stage's scale ({@link viewOf}).
 */
type StagePointing = Omit<StageView, "floor">;

/**
 * What the root part shows its content: the primitive's part of the stage's view, once the image's
 * size is known, and whether the region scrolls.
 */
interface StageRootState {
  readonly scrolls: boolean;
  readonly view: StagePointing | undefined;
}

/**
 * The `data-slot` of the marks part, whose taps belong to the marks and are not the stage's.
 */
const marksSlot = "plate-graphic-marks";

/**
 * The `data-slot` of the frame's pins, whose taps belong to the pinned marks, as the marks' do.
 */
const pinsSlot = "plate-graphic-pins";

/**
 * Tell whether a pointer event belongs to the marks an island draws, which take their own taps.
 *
 * @param event The event.
 * @returns Whether its target is inside the marks part or the pins.
 */
const onMarks = (event: Event): boolean =>
  event.target instanceof Element &&
  event.target.closest(`[data-slot="${marksSlot}"], [data-slot="${pinsSlot}"]`) !== null;

/**
 * Read an image's natural size, now if it has loaded and otherwise when it does, and report it:
 * an `img`'s own, and an `object`'s from the image its `data` names, which an `object` with no
 * size is laid out at, read by loading that image apart, as an `object` reports no natural size.
 * An image that loads nothing reports none.
 *
 * @param box The image part.
 * @param report Called with the natural size.
 * @returns The cleanup, none when the part holds no `img` or `object`.
 */
const watchNatural = (
  box: HTMLElement,
  report: (natural: ImageSize) => void,
): (() => void) | undefined => {
  const image = box.querySelector("img, object");
  if (image instanceof HTMLObjectElement) {
    if (image.data === "") {
      return undefined;
    }

    const probe = new Image();
    const measured = () => {
      if (probe.naturalWidth > 0 && probe.naturalHeight > 0) {
        report({ height: probe.naturalHeight, width: probe.naturalWidth });
      }
    };

    probe.addEventListener("load", measured);
    probe.src = image.data;

    return () => {
      probe.removeEventListener("load", measured);
    };
  }

  if (!(image instanceof HTMLImageElement)) {
    return undefined;
  }

  const measure = () => {
    if (image.naturalWidth > 0 && image.naturalHeight > 0) {
      report({ height: image.naturalHeight, width: image.naturalWidth });
    }
  };

  if (image.complete) {
    measure();
  }

  image.addEventListener("load", measure);

  return () => {
    image.removeEventListener("load", measure);
  };
};

/**
 * The stage primitive, `data-slot="plate-graphic"`, and its `image` and `overlay` parts. Render it
 * with {@link GraphicStage}.
 */
const graphic = definePrimitive({
  agent: { actions: [] },
  api: (context) => {
    const { store } = context;
    let overlay: SVGSVGElement | undefined;
    let press: Press = noPress;
    const down = new Set<number>();

    /**
     * Read the image's pixel space now.
     *
     * @returns The size, or none until it is known.
     */
    const sizeNow = (): ImageSize | undefined => {
      const { authored, natural } = store.get();

      return sizeOf(authored, natural);
    };

    /**
     * Map a viewport position to the image's pixels ({@link StageView.pointAt}).
     *
     * @param clientX The `clientX`.
     * @param clientY The `clientY`.
     * @returns The point, or none while the overlay is not on the page.
     */
    const pointAt = (clientX: number, clientY: number): ImagePoint | undefined => {
      const matrix = overlay?.getScreenCTM() ?? null;
      if (matrix === null) {
        return undefined;
      }

      const { x, y } = new DOMPoint(clientX, clientY).matrixTransform(matrix.inverse());

      return { x, y };
    };

    /**
     * Find the hotspot a point falls in ({@link StageView.areaAt}).
     *
     * @param point The point, in the image's pixels.
     * @returns The hotspot's identifier, or none.
     */
    const areaAt = (point: ImagePoint): string | undefined => {
      const size = sizeNow();
      if (size === undefined) {
        return undefined;
      }

      return hitOf(context.options().areas, size, point)?.identifier;
    };

    /**
     * Find the spot a pointer is on: off the image, before its size is known or outside it; else
     * on it at its point, in the area that point falls in or in none.
     *
     * @param event The pointer event.
     * @returns The spot.
     */
    const spotOf = (event: PointerEvent): Spot => {
      const size = sizeNow();
      const point = pointAt(event.clientX, event.clientY);
      if (
        size === undefined ||
        point === undefined ||
        point.x < 0 ||
        point.y < 0 ||
        point.x > size.width ||
        point.y > size.height
      ) {
        return { kind: "off" };
      }

      return { area: areaAt(point), kind: "image", point };
    };

    /**
     * Feed one pointer event to the press, holding the pointer to the root while a press it began
     * is under way, so its release reaches the stage wherever it lands, and report a committed
     * press to `onPress`: the area it began and ended in, and the point it was released at, the
     * spot the press commits.
     *
     * @param kind What the pointer did.
     * @param event The pointer event.
     * @param root The root part, which holds the pointer.
     */
    const step = (kind: PressEvent["kind"], event: PointerEvent, root: Element | undefined) => {
      const { commit: committed, press: next } = pressStep(
        press,
        { kind, pointer: event.pointerId, spot: spotOf(event) },
        down.size,
      );

      press = next;

      if (
        kind === "down" &&
        press.kind === "pressed" &&
        press.pointer === event.pointerId &&
        root !== undefined
      ) {
        root.setPointerCapture(event.pointerId);
      }

      if (committed !== undefined) {
        context.options().onPress?.({ identifier: committed.area, point: committed.point });
      }
    };

    return {
      areaAt,

      /**
       * Read the natural size of the image inside the image part ({@link watchNatural}) into the
       * stage's state.
       *
       * @param el The image part.
       * @returns The cleanup, none when the part holds no image.
       */
      bindImage: (el: HTMLElement): (() => void) | undefined =>
        watchNatural(el, (natural) => {
          store.set({ natural });
        }),

      /**
       * Hold the overlay for the pointer geometry.
       *
       * @param el The overlay part.
       * @returns The cleanup, none when the part is not an `svg`.
       */
      bindOverlay: (el: HTMLElement): (() => void) | undefined => {
        if (!(el instanceof SVGSVGElement)) {
          return undefined;
        }

        overlay = el;

        return () => {
          overlay = undefined;
        };
      },

      /**
       * Watch whether the root, the stage's region, scrolls: whether what it holds is wider than
       * it is, whenever either's size changes.
       *
       * @param el The root part.
       * @returns The cleanup.
       */
      bindRoot: (el: HTMLElement): (() => void) => {
        const observer = new ResizeObserver(() => {
          const scrolls = el.scrollWidth > el.clientWidth;
          if (scrolls !== store.get().scrolls) {
            store.set({ scrolls });
          }
        });

        observer.observe(el);
        for (const child of el.children) {
          observer.observe(child);
        }

        return () => {
          observer.disconnect();
        };
      },

      pointAt,

      /**
       * Take a pointer leaving the stage's reach: the browser cancelling it, or the root losing
       * its hold on it. A press it began commits nothing.
       *
       * @param event The `pointercancel` or `lostpointercapture`.
       * @param root The root part.
       */
      pointerCancel: (event: PointerEvent, root: Element | undefined) => {
        if (down.delete(event.pointerId)) {
          step("cancel", event, root);
        }
      },

      /**
       * Take a pointer going down on the stage: a primary press on the image, outside the marks,
       * may begin a press, on a stage that takes presses. A tap on a mark is the mark's own, and
       * on a stage given no `onPress` every tap is its target's: the stage begins no press, so it
       * never holds the pointer, which would send the tap's `click` to the stage instead.
       *
       * @param event The `pointerdown`.
       * @param root The root part.
       */
      pointerDown: (event: PointerEvent, root: Element | undefined) => {
        if (context.options().onPress === undefined || event.button !== 0 || onMarks(event)) {
          return;
        }

        down.add(event.pointerId);
        step("down", event, root);
      },

      /**
       * Take a pointer moving while it is down: one that leaves the spot its press began on
       * spoils the press.
       *
       * @param event The `pointermove`.
       * @param root The root part.
       */
      pointerMove: (event: PointerEvent, root: Element | undefined) => {
        if (down.has(event.pointerId)) {
          step("move", event, root);
        }
      },

      /**
       * Take a pointer coming up: a press it began commits if it comes up where it went down.
       *
       * @param event The `pointerup`.
       * @param root The root part.
       */
      pointerUp: (event: PointerEvent, root: Element | undefined) => {
        if (down.delete(event.pointerId)) {
          step("up", event, root);
        }
      },
    };
  },
  name: "plate-graphic",
  options: {
    areas: "value",
    hint: "string",
    onPress: "callback",
    reflows: "boolean",
    region: "value",
    size: "value",
  },
  slots: (slot) => ({
    image: slot({
      bind: (el, part) => part.api.bindImage(el),
    }),
    overlay: slot({
      bind: (el, part) => part.api.bindOverlay(el),
    }),
    root: slot<object, StageRootState>({
      attrs: (state) => {
        const application = state.region.kind === "application";
        const ids = [
          ...(application ? [state.region.keys] : []),
          ...(state.scrolls === true ? [state.hint] : []),
        ];

        return {
          "aria-describedby": ids.length === 0 ? undefined : ids.join(" "),
          tabindex: application || (state.scrolls ?? state.reflows) ? "0" : undefined,
        };
      },
      bind: (el, part) => part.api.bindRoot(el),
      on: {
        lostpointercapture: (event, { api, el }) => {
          api.pointerCancel(event, el);
        },
        pointercancel: (event, { api, el }) => {
          api.pointerCancel(event, el);
        },
        pointerdown: (event, { api, el }) => {
          api.pointerDown(event, el);
        },
        pointermove: (event, { api, el }) => {
          api.pointerMove(event, el);
        },
        pointerup: (event, { api, el }) => {
          api.pointerUp(event, el);
        },
      },
      state: (state, { api }) => {
        const size = sizeOf(state.authored, state.natural);

        return {
          scrolls: state.scrolls === true,
          view: size === undefined ? undefined : { areaAt: api.areaAt, pointAt: api.pointAt, size },
        };
      },
    }),
  }),
  state: (options: StageOptions): StageState => ({
    authored: options.size,
    hint: options.hint,
    natural: undefined,
    reflows: options.reflows,
    region: options.region,
    scrolls: undefined,
  }),
  sync: (options) => ({
    authored: options.size,
    hint: options.hint,
    reflows: options.reflows,
    region: options.region,
  }),
});

/**
 * The parts UI SDK makes from the primitive, one per tagged slot.
 */
const parts = createParts(graphic, { image: "div", overlay: "svg", root: "div" });

/**
 * The view of the stage around a part, while its size is known.
 */
const StageContext = createContext<StageView | undefined>(undefined);

/**
 * Read the stage a part is drawn in: its pixel space, its scale and its pointer geometry.
 *
 * @returns The stage's view.
 * @throws {StagePartOutside} When it is called outside a {@link GraphicStage}'s overlay.
 */
export const useGraphicStage = (): StageView => {
  const view = use(StageContext);

  if (view === undefined) {
    throw new StagePartOutside();
  }

  return view;
};

/**
 * What a stage's region is to assistive technology: a `group`, the image an interaction's own
 * controls stand beside; or an `application`, for an interaction whose own keys work in the region,
 * as Select Point's cross does, with the role description that says what it is and `keys`, the id
 * of the part that says which keys work there, which describes the region. A screen reader in
 * browse mode keeps the arrow keys for itself in a group, and switches to focus mode and hands them
 * on in an application, so a region that takes the arrow keys is one.
 *
 * @see https://www.w3.org/TR/wai-aria-1.2/#application
 */
export type StageRole =
  | { readonly kind: "group" }
  | { readonly description: string; readonly keys: string; readonly kind: "application" };

/**
 * What a stage's taps land on, which sizes it: `areas`, an interaction's hotspots, each drawn by
 * `renderArea` (a `GraphicMark` holding a `DrawnArea`, with the island's state, or a part rendered
 * as one) and hit by a tap, the ones `selected` with a check, the smallest of their tap regions
 * setting the stage's scale; or `scaled`, an interaction whose targets are its own marks (Select
 * Point's points, Position Object's copies), which gives its scale and draws no area, since QTI
 * forbids showing the areas such a response is scored by.
 *
 * @template A The areas, with what an interaction holds of each.
 */
export type StageTargets<A extends StageArea> =
  | {
      readonly areas: readonly A[];
      /**
       * The target size the areas keep (`TargetFloor` in `#plate/graphic/scale.ts`):
       * `minimum` for a tiled lattice, else `enhanced`.
       */
      readonly floor: TargetFloor;
      readonly kind: "areas";
      readonly renderArea: (area: A, drawing: Drawing) => ReactNode;
      readonly selected: readonly string[];
    }
  | { readonly kind: "scaled"; readonly scale: StageScale };

/**
 * The areas of a stage that draws none, one array so the primitive, which compares a `value`
 * option by identity, sees no change.
 */
const noAreas: readonly StageArea[] = [];

/**
 * Give a stage's scale at a size: its own, or its areas', from the smallest of their tap regions.
 *
 * @template A The areas.
 * @param targets What the stage's taps land on.
 * @param size The image's size.
 * @returns The scale.
 */
const scaleOf = <A extends StageArea>(targets: StageTargets<A>, size: ImageSize): StageScale =>
  targets.kind === "scaled"
    ? targets.scale
    : stageScaleOf(smallestTargetOf(targets.areas, size), targets.floor);

/**
 * Tell whether a stage's region scrolls at the narrowest reflow viewport, as the server can tell
 * it: from the author's size where it is written in full, and the stage's scale. Where the size
 * waits on the image, the region is measured on the client alone.
 *
 * @template A The areas.
 * @param targets What the stage's taps land on.
 * @param size The author's size.
 * @returns Whether the region scrolls at 320 CSS px (`scrollsAtReflow`).
 */
const reflowsOf = <A extends StageArea>(targets: StageTargets<A>, size: AuthoredSize): boolean => {
  const known = sizeOf(size);
  if (known === undefined) {
    return false;
  }

  return scrollsAtReflow(floorWidthOf(known, scaleOf(targets, known)));
};

/**
 * Give the view a stage's parts read: the primitive's, once the image's size is known, with the
 * stage's floor width at its scale.
 *
 * @template A The areas.
 * @param pointing The primitive's part of the view, none until the size is known.
 * @param targets What the stage's taps land on.
 * @returns The view, none until the size is known.
 */
const viewOf = <A extends StageArea>(
  pointing: StagePointing | undefined,
  targets: StageTargets<A>,
): StageView | undefined =>
  pointing === undefined
    ? undefined
    : { ...pointing, floor: floorWidthOf(pointing.size, scaleOf(targets, pointing.size)) };

/**
 * The role a stage's region takes where its interaction gives none.
 */
const groupRole: StageRole = { kind: "group" };

/**
 * Render the image stage of a graphic interaction: the frame's region and image, and once the
 * image's pixel space is known the overlay over it, each area's mark drawn bottom first, as
 * {@link paintedOf} orders them, so that where areas overlap the first listed is topmost and a
 * `default` area lies under every other, then the island's marks above them all; over the overlay
 * the pins, a check badge in each picked area's corner and the island's pins; and the spacers that
 * size the stage. An area that holds no point is not drawn.
 *
 * A tap on the image calls `onPress` on release, where it began, with its point and the hotspot it
 * fell in, the same area scoring's `areaHolds` names, boundary included: the island picks, places
 * or puts a point by it. A stage given no `onPress` takes no press at all and holds no pointer, so
 * a tap on an area reaches the area's own element: a Graphic Gap Match's hotspots are the
 * placement primitive's targets, which take the tap that drops the held choice, and a pointer held
 * to the stage would take that tap from them.
 *
 * @param props.children The image, as the server rendered it.
 * @param props.labels The stage's words: the region's name of last resort and its scroll hint.
 * @param props.marks What the island draws above the areas, in the image's pixels, scaling with
 *   it: lines, copies. The marks part takes no pointer unless a mark asks for it, and a tap on a
 *   mark is the mark's own.
 * @param props.naming What names the interaction's group, as the server resolved it, which names
 *   the stage's region too; the image's own name, then `labels.picture`, name it where this names
 *   it by nothing ({@link stageNameOf}).
 * @param props.onPress Called with each committed tap on the image ({@link StagePress}); absent,
 *   the stage takes no press and leaves every tap to the element under it.
 * @param props.pins What the island pins over the image at the page's own size, each a `Pin`:
 *   badges, points, placed cards. The pins take no pointer unless a pin asks for it, and a tap on
 *   one is its own, as on a mark.
 * @param props.role What the region is to assistive technology ({@link StageRole}): a `group`
 *   where absent, a tab stop while it scrolls, and on the server and until it is measured wherever
 *   it scrolls at the narrowest reflow viewport (`scrollsAtReflow`), described by its scroll hint
 *   while it scrolls; an `application`, whose keys work in it, always one, described by its keys
 *   and then its scroll hint. The primitive compares it by identity, as UI SDK compares every
 *   `value` option, so a caller keeps one object per role, a constant or a memo, and a new object
 *   each render is a change each render.
 * @param props.size The author's `width` and `height` of the image ({@link AuthoredSize}).
 * @param props.targets What its taps land on, which sizes it ({@link StageTargets}): its hotspots,
 *   in document order, or its own scale.
 * @returns The stage.
 */
export const GraphicStage = <A extends StageArea>(props: {
  readonly children: ReactNode;
  readonly labels: GraphicLabels;
  readonly marks?: ReactNode;
  readonly naming: NameAttributes;
  readonly onPress?: (press: StagePress) => void;
  readonly pins?: ReactNode;
  readonly role?: StageRole;
  readonly size: AuthoredSize;
  readonly targets: StageTargets<A>;
}) => {
  const { children, labels, marks, naming, onPress, pins, role = groupRole, size, targets } = props;
  const hint = useId();

  return (
    <parts.Root
      {...stageNameOf(naming, children, labels.picture)}
      reflows={reflowsOf(targets, size)}
      areas={targets.kind === "areas" ? targets.areas : noAreas}
      aria-roledescription={role.kind === "application" ? role.description : undefined}
      hint={hint}
      region={role}
      role={role.kind}
      size={size}
      {...(onPress === undefined ? {} : { onPress })}
    >
      {({ scrolls, view: pointing }) => {
        const view = viewOf(pointing, targets);

        return (
          <>
            <parts.Image>
              {children}
              {view === undefined ? null : (
                <StageContext value={view}>
                  <parts.Overlay {...overlayAttributes(view.size)}>
                    {targets.kind === "areas"
                      ? paintedOf(targets.areas, view.size).map(({ area, drawing }) => (
                          <Fragment key={area.identifier}>
                            {targets.renderArea(area, drawing)}
                          </Fragment>
                        ))
                      : null}
                    <g data-slot={marksSlot} pointerEvents="none">
                      {marks}
                    </g>
                  </parts.Overlay>
                  <svg {...pinsAttributes} data-slot={pinsSlot}>
                    {targets.kind === "areas"
                      ? targets.areas.map((area) =>
                          targets.selected.includes(area.identifier) ? (
                            <CornerPin key={area.identifier} area={area} size={view.size}>
                              <CheckBadge />
                            </CornerPin>
                          ) : null,
                        )
                      : null}
                    {pins}
                  </svg>
                </StageContext>
              )}
            </parts.Image>
            {view === undefined ? null : <StageSpacers floor={view.floor} size={view.size} />}
            {scrolls ? (
              <span data-slot="plate-graphic-hint" hidden id={hint}>
                {labels.scroll}
              </span>
            ) : null}
          </>
        );
      }}
    </parts.Root>
  );
};
