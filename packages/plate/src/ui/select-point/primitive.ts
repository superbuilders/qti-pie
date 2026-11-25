/**
 * The Select Point primitive: the UI SDK behaviour under the Select Point island, over the pure
 * steps of `#plate/ui/select-point/points.ts`. A child marks points on the image, moves them and
 * removes them, by a tap, a drag or the keyboard, and every way runs the same step and says the
 * same words.
 *
 * - **Tap.** A tap on the image, released on it, marks a point where it is released; for a response
 *   of one point, it moves the point there. A tap on a point's marker, released before it moves
 *   past the threshold, removes the point.
 * - **Drag.** A press on a marker that moves past a threshold drags the point; a fingertip drifts
 *   further during a tap than a mouse, so a touch or pen waits for more, and there is no long
 *   press. A release on the image puts the point there, at the nearest whole pixel; a release off
 *   the image, Escape, or the browser taking the pointer puts it back. A press alone commits
 *   nothing (WCAG 2.5.2).
 * - **Keys.** The stage's region, the image's one tab stop, holds a cross, and the board around it
 *   takes the keys pressed there: the arrows move the cross one of the image's own pixels, ten with
 *   Shift, say where it is and bring it into view; Enter or Space does what a tap at the cross
 *   does; Delete or Backspace removes the point whose marker the cross is on. Every point is also a
 *   button in a list after the image, one roving group: the arrows, Home and End move among them,
 *   and a press, Delete or Backspace removes one.
 *
 * A mark past `max-choices` is refused before any state changes, announced, and shown in the limit
 * part; every point stays removable, so the child can always take one back. The live regions are
 * prepared on mount, since some screen readers read only a region that was there before its text
 * changed. Focus moves, after a point's button is removed, to the button that takes its place,
 * else the last, else the stage's region.
 *
 * Each gesture and key reaches the api as plain data, a marker's index and positions in the image's
 * pixels, through methods that need no page: `pressMarker`, `dragMarker`,
 * `releaseMarker` and `cancelMarker` for a pointer on a marker, `pressImage` for a tap the stage
 * reports, `pressKey` for the board's keys, and `removePoint` for a point's button. The parts'
 * handlers only map the page's events onto them.
 *
 * @module
 * @see https://ui-sdk.dev/docs/core/kernel/define-a-primitive
 */
import {
  announce,
  bindDrag,
  createChange,
  createFocusRecovery,
  createRovingFocus,
  dragThreshold,
  prepareAnnouncements,
} from "@ui-sdk/core";
import type { ChangeDetails } from "@ui-sdk/core";
import { definePrimitive } from "#plate/ui/define-primitive.ts";
import type { ImageSize } from "#plate/interactions/image-size.ts";
import { flag } from "#plate/ui/attributes.ts";
import type { ImagePoint } from "#plate/graphic/geometry.ts";
import { fillLabel } from "#plate/ui/labels.ts";
import type { SelectPointLabels } from "#plate/ui/select-point/labels.ts";
import { markSlot, reachOf } from "#plate/ui/select-point/marker.tsx";
import type { MarkerScale } from "#plate/ui/select-point/marker.tsx";
import {
  isOnImage,
  mark,
  markerAt,
  middleOf,
  move,
  nudge,
  pointOn,
  pressAt,
  remove,
} from "#plate/ui/select-point/points.ts";
import type { Picks } from "#plate/interactions/picks.ts";
import type { Point, Step } from "#plate/ui/select-point/points.ts";

/**
 * Why the points changed: `press` for a tap on the image, or Enter or Space on the board; `drag`
 * for a marker dragged; `remove-press` for a tap on a marker, Delete or Backspace, or a press on a
 * point's button.
 */
type SelectPointReason = "drag" | "press" | "remove-press";

/**
 * Why a step changes the points, and the DOM event behind it where one is: a tap the stage reports
 * once it is released there carries none.
 */
type SelectPointDetails = Readonly<{ event: Event | undefined; reason: SelectPointReason }>;

/**
 * What the Select Point root takes: the points, controlled, which the island derives from the
 * response it holds and writes the response back from `onPointsChange`, so a step the host refuses
 * never shows; how many points the child marks; the image's size, the pixel space the points are
 * in; and the labels. A new `picks`, `size` or `labels` object on every render costs a render of
 * every part, so an island keeps them stable.
 */
interface SelectPointOptions {
  readonly labels: SelectPointLabels;
  /**
   * Asks for new points after a child's step, with UI SDK's change details.
   */
  readonly onPointsChange: (
    points: readonly Point[],
    details: ChangeDetails<SelectPointReason>,
  ) => void;
  readonly picks: Picks;
  readonly points: readonly Point[];
  readonly size: ImageSize;
}

/**
 * A point being dragged: its index, and where it is drawn now, at the whole pixel under the
 * pointer, off the image included.
 */
export interface Dragged {
  readonly at: Point;
  readonly index: number;
}

/**
 * A press on a marker, from the press until it lifts or is cancelled: the marker's index, where
 * the point is drawn, and whether the press has moved past the threshold, which makes it a drag.
 */
interface Pressed {
  readonly at: Point;
  readonly index: number;
  readonly moved: boolean;
}

/**
 * The primitive's state: what its options give, the keyboard's cross, the press on a marker, the
 * point whose button has keyboard focus, the latest refusal's text, and the point list's tab stop.
 */
interface State {
  readonly cross: Point;
  readonly focused: number | null;
  readonly labels: SelectPointLabels;
  readonly message: string | null;
  readonly picks: Picks;
  readonly points: readonly Point[];
  readonly pointStop: string | null;
  readonly pressed: Pressed | null;
  readonly size: ImageSize;
}

/**
 * What the board shows its content: the cross, the point dragged and the point whose button has
 * keyboard focus, which the island's marks draw.
 */
export interface SelectPointBoardState {
  readonly cross: Point;
  readonly drag: Dragged | null;
  readonly focused: number | null;
}

/**
 * What the limit part shows: the latest refusal's text, as it was announced.
 */
interface SelectPointLimitState {
  readonly text: string;
}

/**
 * A point's button's props: its index among the points, and `value`, its index as text, which keys
 * the part for its roving group. `id` keys the part too, made by the adapter.
 */
interface PointProps {
  readonly id?: string;
  readonly index: number;
  readonly value: string;
}

/**
 * How far a finger or pen moves, in CSS pixels, before a press on a marker is a drag. UI SDK's
 * `dragThreshold` of 3 suits a mouse; a child's fingertip drifts further during a tap, and
 * Android's own touch slop is 8 dp, so a touch or pen press waits for more, as the placement
 * primitive's does.
 */
const touchThreshold = 10;

/**
 * The `data-slot` of the stage's overlay, whose screen matrix maps a pointer to the image's pixels.
 */
const overlaySlot = "plate-graphic-overlay";

/**
 * The `data-slot` of the stage's region, the image's one tab stop.
 */
const regionSlot = "plate-graphic";

/**
 * The `data-slot` of the keyboard's cross, which a move of it brings into view.
 */
const crossSlot = "plate-select-point-cross";

/**
 * Join cleanups into one.
 *
 * @param cleanups The cleanups, run in order.
 * @returns The cleanup that runs them all.
 */
const allOf =
  (cleanups: readonly (() => void)[]): (() => void) =>
  () => {
    for (const cleanup of cleanups) {
      cleanup();
    }
  };

/**
 * Write what a step says: the point marked, moved or removed, by its number and where it is.
 *
 * @param step A step that went through.
 * @param labels The labels.
 * @returns The announcement.
 */
const describe = (
  step: Exclude<Step, { readonly kind: "refused" }>,
  labels: SelectPointLabels,
): string => {
  const n = step.index + 1;

  if (step.kind === "removed") {
    return fillLabel(labels.removed, { n });
  }

  return fillLabel(step.kind === "marked" ? labels.marked : labels.moved, {
    n,
    x: step.at.x,
    y: step.at.y,
  });
};

/**
 * Give the whole pixel nearest a position, off the image included, where a dragged point is drawn.
 *
 * @param at The position, in the image's pixels.
 * @returns The pixel.
 */
const pixelAt = (at: ImagePoint): Point => ({ x: Math.round(at.x), y: Math.round(at.y) });

/**
 * Report whether a key press has a modifier the board leaves to other shortcuts: Alt, Control or
 * Command. Shift is the board's own, for the cross's far step.
 *
 * @param event The key press.
 * @returns Whether it has one.
 */
const modified = (event: KeyboardEvent): boolean => event.altKey || event.ctrlKey || event.metaKey;

/**
 * The Select Point primitive, `data-slot="plate-select-point"`, and its parts: `board`, `point`
 * and `limit`. The island renders it in `#plate/ui/select-point/select-point.tsx`.
 */
export const selectPoint = definePrimitive({
  agent: { actions: [] },
  api: (context) => {
    const { store } = context;
    const change = createChange(context);
    const pointFocus = createRovingFocus<State, PointProps>(context, {
      key: "pointStop",
      slot: "point",
    });
    let board: HTMLElement | undefined;
    let stop: (() => void) | undefined;
    const recovery = createFocusRecovery<PointProps>({
      fallback: (lost) => {
        const items = pointFocus.items();

        const region = board?.querySelector(`[data-slot="${regionSlot}"]`);

        return (
          (items[lost.props.index] ?? items.at(-1))?.el ??
          (region instanceof HTMLElement ? region : undefined)
        );
      },
    });

    context.onDestroy(() => {
      stop?.();
    });

    /**
     * Read the stage's overlay inside the board, and its screen matrix. While no board is bound,
     * as off the page, it reads nothing, and touches none of the page's globals.
     *
     * @returns The matrix from the image's pixels to the viewport, or none while the overlay is
     *   not on the page.
     */
    const overlayMatrix = (): DOMMatrix | null => {
      if (board === undefined) {
        return null;
      }

      const overlay = board.querySelector(`[data-slot="${overlaySlot}"]`);

      return overlay instanceof SVGSVGElement ? overlay.getScreenCTM() : null;
    };

    /**
     * Map a viewport position to the image's pixels, through the overlay's screen matrix, as the
     * stage maps a tap: the overlay's `viewBox` is the image's pixel space, whatever the page
     * scales the image to.
     *
     * @param clientX The pointer's `clientX`.
     * @param clientY The pointer's `clientY`.
     * @returns The point, or none while the overlay is not on the page.
     */
    const imagePointAt = (clientX: number, clientY: number): ImagePoint | undefined => {
      const matrix = overlayMatrix();
      if (matrix === null) {
        return undefined;
      }

      const { x, y } = new DOMPoint(clientX, clientY).matrixTransform(matrix.inverse());

      return { x, y };
    };

    /**
     * Give the image's scale on the page now, from the overlay's screen matrix, which is what the
     * marks are drawn by, so the cross reaches a marker exactly where a tap does: 1 while the
     * overlay is not on the page.
     *
     * @returns The scale.
     */
    const scaleNow = (): MarkerScale => {
      const matrix = overlayMatrix();

      return matrix === null || matrix.a <= 0 || matrix.d <= 0
        ? { x: 1, y: 1 }
        : { x: matrix.a, y: matrix.d };
    };

    /**
     * Commit a step: ask the host for its points, move the cross to a point marked or moved, and
     * announce what happened; or show and announce the refusal, changing nothing. A host that
     * cancels the change leaves the points as they were.
     *
     * @param step The step.
     * @param details Why, and the DOM event behind it where one is.
     */
    const commit = (step: Step, details: SelectPointDetails) => {
      const { labels } = store.get();

      if (step.kind === "refused") {
        const text = fillLabel(labels.limit, { n: step.limit });

        store.set({ message: text });
        announce(text, { priority: "assertive" });

        return;
      }

      if (!change("points", step.points, details)) {
        return;
      }

      store.set(step.kind === "removed" ? { message: null } : { cross: step.at, message: null });
      announce(describe(step, labels));
    };

    /**
     * Take a key on the board, as plain data: an arrow moves the cross and says where it is,
     * Enter or Space presses at it, and Delete or Backspace removes the point whose marker it is
     * on. Every key during a press on a marker is the press's.
     *
     * @param key The key, `KeyboardEvent.key`.
     * @param far Whether Shift is held.
     * @param event The key press.
     * @returns Whether the key was the board's, so its default action is stopped.
     */
    const pressKey = (key: string, far: boolean, event: Event): boolean => {
      const state = store.get();
      if (state.pressed !== null) {
        return false;
      }

      const next = nudge(state.cross, key, far, state.size);
      if (next !== undefined) {
        store.set({ cross: next });
        announce(fillLabel(state.labels.cross, { x: next.x, y: next.y }));

        return true;
      }

      const reach = reachOf(scaleNow());

      if (key === "Enter" || key === " ") {
        commit(pressAt(state.points, state.cross, state.picks, reach), { event, reason: "press" });

        return true;
      }

      const hit =
        key === "Delete" || key === "Backspace"
          ? markerAt(state.points, state.cross, reach)
          : undefined;

      if (hit === undefined) {
        return false;
      }

      commit(remove(state.points, hit), { event, reason: "remove-press" });

      return true;
    };

    /**
     * Begin a press on a marker: nothing changes until it lifts.
     *
     * @param index The marker's point's index.
     * @returns Whether the press began: not while another is held, nor for no point.
     */
    const pressMarker = (index: number): boolean => {
      const { pressed, points } = store.get();
      const at = points[index];
      if (pressed !== null || at === undefined) {
        return false;
      }

      store.set({ pressed: { at, index, moved: false } });

      return true;
    };

    /**
     * Move a press on a marker past the threshold, which makes it a drag, the point drawn at the
     * whole pixel under the pointer.
     *
     * @param at The pointer, in the image's pixels, none while the overlay is not on the page.
     */
    const dragMarker = (at: ImagePoint | undefined) => {
      const { pressed } = store.get();
      if (pressed !== null) {
        store.set({
          pressed: {
            at: at === undefined ? pressed.at : pixelAt(at),
            index: pressed.index,
            moved: true,
          },
        });
      }
    };

    /**
     * Lift a press on a marker: one that never moved is a tap, which removes the point; a drag
     * released on the image moves the point there, at the nearest whole pixel; a drag released
     * off it, or where the overlay cannot say, puts it back.
     *
     * @param at Where it lifted, in the image's pixels, none while the overlay is not on the page.
     * @param event The release.
     */
    const releaseMarker = (at: ImagePoint | undefined, event: Event) => {
      const { points, pressed, size } = store.get();
      if (pressed === null) {
        return;
      }

      store.set({ pressed: null });

      if (!pressed.moved) {
        commit(remove(points, pressed.index), { event, reason: "remove-press" });
      } else if (at !== undefined && isOnImage(at, size)) {
        commit(move(points, pressed.index, pointOn(at, size)), { event, reason: "drag" });
      }
    };

    /**
     * Cancel a press on a marker, as Escape or the browser taking the pointer does: the point
     * stays where it was.
     */
    const cancelMarker = () => {
      store.set({ pressed: null });
    };

    return {
      /**
       * Join the board: hold it, for the overlay's geometry and its region, focus's last place to
       * go.
       *
       * @param el The board's element.
       * @returns The cleanup.
       */
      bindBoard: (el: HTMLElement) => {
        board = el;

        return () => {
          board = undefined;
        };
      },

      /**
       * Join a point's button to its roving group and to focus recovery.
       *
       * @param el The button's element.
       * @param part The button's part.
       * @returns The cleanup.
       */
      bindPoint: (el: HTMLElement, part: { key: string; props: PointProps }) =>
        allOf([pointFocus.bind(el, part), recovery.bind(el, part)]),

      /**
       * Join the root: prepare the live regions before the first announcement.
       *
       * @param el The root's element.
       */
      bindRoot: (el: HTMLElement) => {
        prepareAnnouncements(el.ownerDocument);
      },

      cancelMarker,

      dragMarker,

      /**
       * Note which point's button has keyboard focus, so its marker shows it, or that none has.
       *
       * @param index The point's index, or none when no button has keyboard focus.
       */
      focusPoint: (index: number | null) => {
        store.set({ focused: index });
      },

      /**
       * Handle a key pressed in the stage's region, through {@link pressKey}, and bring the cross
       * into view once a move of it is drawn, since the region scrolls across where its container
       * is narrower than the stage. A key with Alt, Control or Command is left to other shortcuts.
       *
       * @param event The key press.
       */
      keydownBoard: (event: KeyboardEvent) => {
        const { cross } = store.get();
        if (modified(event) || !pressKey(event.key, event.shiftKey, event)) {
          return;
        }

        event.preventDefault();

        if (store.get().cross !== cross) {
          requestAnimationFrame(() => {
            board
              ?.querySelector(`[data-slot="${crossSlot}"]`)
              ?.scrollIntoView({ block: "nearest", inline: "nearest" });
          });
        }
      },

      /**
       * Handle a key on a point's button: Delete or Backspace removes its point, and the arrows,
       * Home and End move among the buttons.
       *
       * @param event The key press.
       * @param el The button's element.
       * @param index The point's index.
       */
      keydownPoint: (event: KeyboardEvent, el: HTMLElement, index: number) => {
        if (!modified(event) && (event.key === "Delete" || event.key === "Backspace")) {
          event.preventDefault();
          commit(remove(store.get().points, index), { event, reason: "remove-press" });

          return;
        }

        pointFocus.keydown(event, el);
      },

      pointFocus,

      /**
       * Follow a press on the board that lands on a marker: {@link pressMarker}, then
       * {@link dragMarker} past the threshold and {@link releaseMarker} or {@link cancelMarker}
       * when it ends. A press anywhere else on the board is the stage's, whose tap marks a point.
       * UI SDK swallows the click a drag past its `dragThreshold` sends, and the stage leaves
       * every click on a mark alone, so the release is the gesture's one effect.
       *
       * @param event The press.
       * @param el The board's element, which follows the pointer.
       */
      pointerdown: (event: PointerEvent, el: HTMLElement) => {
        const marker =
          event.target instanceof Element
            ? event.target.closest(`[data-slot="${markSlot}"]`)
            : null;
        const index = marker instanceof SVGElement ? Number(marker.dataset["index"]) : Number.NaN;

        if (
          event.button !== 0 ||
          !event.isPrimary ||
          stop !== undefined ||
          !Number.isInteger(index) ||
          !pressMarker(index)
        ) {
          return;
        }

        stop = bindDrag(el, event, {
          cancelOnEscape: true,
          onEnd: (end, canceled) => {
            stop = undefined;

            if (canceled) {
              cancelMarker();
            } else {
              releaseMarker(imagePointAt(end.clientX, end.clientY), end);
            }
          },
          onMove: ({ x, y }) => {
            dragMarker(imagePointAt(x, y));
          },
          threshold: event.pointerType === "mouse" ? dragThreshold : touchThreshold,
        });
      },

      /**
       * Take a tap on the image, as the stage reports it once it is released there: mark a point
       * there, at the nearest whole pixel on the image.
       *
       * @param at The tap, in the image's pixels.
       */
      pressImage: (at: ImagePoint) => {
        const { picks, points, size } = store.get();

        commit(mark(points, pointOn(at, size), picks), { event: undefined, reason: "press" });
      },

      pressKey,

      pressMarker,

      recovery,

      releaseMarker,

      /**
       * Remove a point, from its button: a press, or Delete or Backspace on it.
       *
       * @param index The point's index.
       * @param event The click or the key press.
       */
      removePoint: (index: number, event: Event | undefined) => {
        commit(remove(store.get().points, index), { event, reason: "remove-press" });
      },
    };
  },
  controlled: ["points"],
  name: "plate-select-point",
  options: {
    labels: "value",
    onPointsChange: "callback",
    picks: "value",
    points: "value",
    size: "value",
  },
  slots: (slot) => ({
    board: slot<object, SelectPointBoardState>({
      attrs: (state) => ({
        "data-dragging": flag(state.pressed?.moved === true),
      }),
      bind: (el, part) => part.api.bindBoard(el),
      on: {
        keydown: (event, { api }) => {
          if (event instanceof KeyboardEvent) {
            api.keydownBoard(event);
          }
        },
        pointerdown: (event, { api, el }) => {
          if (el !== undefined && event instanceof PointerEvent) {
            api.pointerdown(event, el);
          }
        },
      },
      state: (state) => ({
        cross: state.cross,
        drag:
          state.pressed === null || !state.pressed.moved
            ? null
            : { at: state.pressed.at, index: state.pressed.index },
        focused: state.focused,
      }),
    }),
    limit: slot<object, SelectPointLimitState>({
      present: (state) => state.message !== null,
      state: (state) => ({ text: state.message ?? "" }),
    }),
    point: slot<PointProps>({
      attrs: (state, part) => ({
        tabindex: part.api.pointFocus.tabIndex(state, part),
        type: "button",
      }),
      bind: (el, part) => part.api.bindPoint(el, part),
      focus: "roving",
      on: {
        blur: (_event, { api }) => {
          api.focusPoint(null);
        },
        focus: (_event, { api, el, props }) => {
          api.focusPoint(el?.matches(":focus-visible") === true ? props.index : null);
        },
        keydown: (event, { api, el, props }) => {
          if (el !== undefined && event instanceof KeyboardEvent) {
            api.keydownPoint(event, el, props.index);
          }
        },
      },
      press: ({ api, props }, event) => {
        api.removePoint(props.index, event);
      },
      props: { id: "id", index: "number", value: "string" },
      role: "button",
    }),
    root: slot({
      attrs: (state) => ({
        "data-dragging": flag(state.pressed?.moved === true),
        "data-full": flag(state.picks.kind === "at-most" && state.points.length >= state.picks.n),
      }),
      bind: (el, part) => {
        part.api.bindRoot(el);
      },
      role: "group",
    }),
  }),
  state: (options: SelectPointOptions): State => ({
    cross: middleOf(options.size),
    focused: null,
    labels: options.labels,
    message: null,
    picks: options.picks,
    pointStop: null,
    points: options.points,
    pressed: null,
    size: options.size,
  }),
  sync: (options) => ({
    labels: options.labels,
    picks: options.picks,
    points: options.points,
    size: options.size,
  }),
});
