/**
 * The Position Object primitive: the UI SDK behaviour of a `qti-position-object-stage`, one stage
 * image on which the child places copies of each of its interactions' objects, by a tap and a tap,
 * a drag, or the keyboard, every way running the same step and saying the same words.
 *
 * - **Tap.** A tap on an object picks up a new copy of it, which waits at the middle of the stage; a
 *   tap on the stage puts the held copy there, and does nothing while none is held; a tap on a
 *   placed copy, on the stage or in its object's list, picks it up. A tap on the held copy, or on
 *   its object while a copy its object gave is held, a new copy or, where the limit is one, the
 *   copy placed, puts the copy on the stage where it waits; a tap on its object while a placed copy
 *   picked up from the stage or its list is held takes that copy off. A tap outside the stage's
 *   island, or focus leaving it, puts a held copy back. A tap is a click, so it acts on release, on
 *   the part it was pressed on (WCAG 2.5.2).
 * - **Drag.** A press on an object that moves past a threshold drags a copy of it, raised for fingers
 *   and pens, which tap with a little drift; there is no long press. Over the stage the copy is
 *   drawn where it would land, its centre point under the pointer, and a release there puts it
 *   there; a release anywhere else puts it back. A press on a placed copy that moves drags that
 *   copy over the stage, held to its edges. Escape, or the browser taking the pointer, puts it
 *   back. Every drag has the tap's single-pointer way and the keys' way (WCAG 2.5.7).
 * - **Keys.** Space or Enter presses, as a tap; the arrow keys move a held copy one pixel of the
 *   stage image, ten with Shift, held to the stage, on its own control, or on its object's button
 *   where that button gave it; Escape puts it back; Delete or Backspace on a placed copy's control
 *   takes it off. A control with keyboard focus names its copy, whose mark on the stage shows the
 *   focus too ({@link PositionRootState.focused}), as does the mark of the copy an object's button
 *   holds while that button has it.
 *
 * Each placement is the point QTI records, where the object's centre point lands on the stage, in
 * the stage image's own pixels and on a whole pixel; it is one `point` value of the response, its x
 * then its y (`#plate/ui/position-object/points.ts`). A copy past an object's limit is refused
 * before any state changes, announced and shown (WCAG 4.1.3), except where the limit is one, when
 * the tap picks up the copy already placed. Every text comes from the `labels` option, filled with
 * the object's name as its `object` part shows it.
 *
 * @module
 * @see https://www.imsglobal.org/spec/qti/v3p0/info/index.html#Root_PositionObjectInteraction
 * @see https://ui-sdk.dev/docs/core/kernel/define-a-primitive
 */
import {
  announce,
  bindDrag,
  bindDragPreview,
  createAutoScroll,
  createChange,
  createFocusRecovery,
  dragThreshold,
  elements,
  labelOf,
  prepareAnnouncements,
} from "@ui-sdk/core";
import type { ChangeDetails, DragPreview } from "@ui-sdk/core";
import { definePrimitive } from "#plate/ui/define-primitive.ts";
import type { ImageSize } from "#plate/interactions/image-size.ts";
import { flag } from "#plate/ui/attributes.ts";
import { PositionObjectOffStage } from "#plate/ui/defects.ts";
import type { ImagePoint } from "#plate/graphic/geometry.ts";
import { fillLabel } from "#plate/ui/labels.ts";
import { reached } from "#plate/placement/limit.ts";
import type { Limit } from "#plate/placement/limit.ts";
import type { Declared } from "#plate/model/values.ts";
import { middleOf, pointOn, withPoints } from "#plate/ui/position-object/points.ts";
import type { Placements } from "#plate/ui/position-object/points.ts";
import type { PositionObjectLabels } from "#plate/ui/position-object/labels.ts";

/**
 * Why the placements changed: `item-press` for a tap, a click, or Space or Enter; `drag` for a
 * pointer drag; `remove-press` for Delete or Backspace on a placed copy.
 */
type PositionReason = "drag" | "item-press" | "remove-press";

/**
 * What made a change to the placements, and the event behind it where one is: a tap the stage
 * reports once it is released there carries none.
 */
type PositionDetails = Readonly<{ event: Event | undefined; reason: PositionReason }>;

/**
 * One interaction of the stage as the primitive holds it: the response it binds, and how many
 * copies of its object the child may place. Its object's name is read from the page, from its
 * `object` part, as announcements say it.
 */
export interface StageObject {
  /**
   * How many copies may be placed: one for a `single` response; `max-choices` for a `multiple`
   * one, where 0 is no limit (QTI 3.0 information model 5.107.3).
   */
  readonly limit: Limit;
  /**
   * The response its copies write, as its declaration types it: a `point` response, one value per
   * copy. Its identifier names the interaction to its parts.
   */
  readonly response: Declared<"point", "multiple" | "single">;
}

/**
 * What the primitive takes: the stage's interactions, the stage image's size, every interaction's
 * placed copies, and the labels.
 */
interface PositionOptions {
  readonly labels: PositionObjectLabels;
  readonly objects: readonly StageObject[];
  /**
   * Asks for new placements after a child's move, with UI SDK's change details.
   */
  readonly onPlacementsChange: (
    placements: Placements,
    details: ChangeDetails<PositionReason>,
  ) => void;
  /**
   * Every interaction's placed copies, by its response's identifier: the island's responses.
   */
  readonly placements: Placements;
  /**
   * The stage image's size, the pixel space every point is in.
   */
  readonly size: ImageSize;
}

/**
 * The copy the child holds: whose object it is, which placed copy, or a new one, where it would
 * land now, whether a pointer drags it, and whether its object gave it.
 */
export interface HeldCopy {
  /**
   * Where the copy lands if it is put down now, on a whole pixel of the stage; none while a new
   * copy is dragged off the stage.
   */
  readonly at: ImagePoint | null;
  readonly dragging: boolean;
  /**
   * Whether its object's button gave it: a new copy, or, where the limit is one, the copy placed.
   * A press on that button again puts such a copy down where it waits, as the press that gave it
   * started, so the key that picked a copy up is the key that puts it down; a press there while a
   * copy picked up from the stage or its list is held takes that copy off. The button shows it
   * pressed while it holds the copy it gave.
   */
  readonly given: boolean;
  /**
   * The placed copy's place among its object's, none for a new copy.
   */
  readonly index: number | null;
  /**
   * The identifier of the response of the interaction whose object it is.
   */
  readonly name: string;
}

/**
 * A copy of an object, or an object itself, by its interaction's response's identifier and its
 * place among its object's copies, none for the object.
 */
export interface CopyKey {
  readonly index: number | null;
  readonly name: string;
}

/**
 * What the root's render functions see: the copy held, if one is; every placed copy by its
 * interaction's response's identifier; and the control with keyboard focus, whose copy on the stage
 * shows it.
 */
interface PositionRootState {
  readonly focused: CopyKey | null;
  readonly held: HeldCopy | null;
  readonly placed: Readonly<Record<string, readonly ImagePoint[]>>;
}

/**
 * What an interaction's group shows: its placed copies, and whether no more may be placed and
 * whether a copy of its object is held.
 */
interface PositionGroupState {
  readonly full: boolean;
  readonly picked: boolean;
  readonly placed: readonly ImagePoint[];
}

/**
 * What the message part's render functions see: the latest refusal's text.
 */
interface PositionMessageState {
  readonly text: string;
}

/**
 * Everything the primitive keeps: its options, the copy held, the control with keyboard focus, and
 * the latest refusal.
 */
interface State {
  readonly focused: CopyKey | null;
  readonly held: HeldCopy | null;
  readonly labels: PositionObjectLabels;
  readonly message: string | null;
  readonly objects: readonly StageObject[];
  readonly placements: Placements;
  readonly size: ImageSize;
}

/**
 * An interaction's part's props: its response's identifier. `id` keys the part, made by the
 * adapter, so each interaction's group and object are parts of their own, whose handlers read their
 * own interaction (`definePrimitive` in `#plate/ui/define-primitive.ts`).
 */
interface ObjectProps {
  readonly id?: string;
  readonly name: string;
}

/**
 * A placed copy's part's props: its interaction's response's identifier and the copy's place among
 * its object's copies. `id` keys the part, made by the adapter, so each copy's control and mark are
 * parts of their own, whose handlers read their own copy's place: a press or Delete on one copy
 * acts on that copy, and picking it up binds no other copy's control in its stead, so focus stays
 * on it.
 */
interface CopyProps {
  readonly id?: string;
  readonly index: number;
  readonly name: string;
}

/**
 * A placed copy's control's props: the copy's, and its object's name, which the control's name
 * says.
 */
interface CopyControlProps extends CopyProps {
  readonly object: string;
}

/**
 * The layer's props: the stage's pointer geometry, from the stage it is drawn in. `id` keys the
 * part, made by the adapter, as every slot whose parts take props declares one.
 */
interface LayerProps {
  readonly id?: string;
  /**
   * Map a pointer's viewport position to the stage image's pixels (`StageView.pointAt` in
   * `#plate/ui/graphic/stage.tsx`).
   */
  readonly pointAt: (clientX: number, clientY: number) => ImagePoint | undefined;
}

/**
 * How far a finger or pen moves, in CSS pixels, before a press is a drag. UI SDK's `dragThreshold`
 * of 3 suits a mouse; a child's fingertip drifts further during a tap, and Android's own touch slop
 * is 8 dp, so a touch or pen press waits for more, as the placement primitive's does.
 */
const touchThreshold = 10;

/**
 * How far an arrow key moves a held copy, in the stage image's pixels, and how far with Shift.
 */
const steps = { large: 10, small: 1 } as const;

/**
 * The arrow keys, and which way each moves a copy across and down.
 */
const arrows: ReadonlyMap<string, readonly [x: number, y: number]> = new Map([
  ["ArrowDown", [0, 1]],
  ["ArrowLeft", [-1, 0]],
  ["ArrowRight", [1, 0]],
  ["ArrowUp", [0, -1]],
]);

/**
 * Find an interaction of the stage by its response's identifier. Every part is rendered with the
 * identifier of an interaction its stage holds, so one the stage does not hold is a defect, thrown.
 *
 * @param state The primitive's state.
 * @param name The response's identifier.
 * @returns The interaction.
 * @throws {PositionObjectOffStage} For an identifier the stage does not hold.
 */
const objectOf = (state: State, name: string): StageObject => {
  const object = state.objects.find((each) => each.response.identifier === name);

  if (object === undefined) {
    throw new PositionObjectOffStage({ name });
  }

  return object;
};

/**
 * Read an interaction's placed copies from the placements, none before its response holds any.
 *
 * @param state The primitive's state.
 * @param object The interaction.
 * @returns Its points, in the order they were placed.
 */
const placedOf = (state: State, object: StageObject): readonly ImagePoint[] =>
  state.placements.get(object.response.identifier) ?? [];

/**
 * Report whether an interaction has placed as many copies as it may.
 *
 * @param state The primitive's state.
 * @param object The interaction.
 * @returns Whether one more copy would pass its limit.
 */
const fullOf = (state: State, object: StageObject): boolean =>
  reached(object.limit, placedOf(state, object).length);

/**
 * Report whether a copy is the one held.
 *
 * @param held The copy held, if any.
 * @param name The interaction's response's identifier.
 * @param index The placed copy's place, none for a new copy.
 * @returns Whether it is held.
 */
const holds = (held: HeldCopy | null, name: string, index: number | null): boolean =>
  held?.name === name && held.index === index;

/**
 * Give every placed copy, by its interaction's response's identifier.
 *
 * @param state The primitive's state.
 * @returns The points of each interaction.
 */
const placedByName = (state: State): Readonly<Record<string, readonly ImagePoint[]>> =>
  Object.fromEntries(
    state.objects.map((object) => [object.response.identifier, placedOf(state, object)]),
  );

/**
 * Write a point's coordinates for a label.
 *
 * @param point The point.
 * @returns Its `x` and `y`, as the label's placeholders take them.
 */
const coordinates = (point: ImagePoint): Readonly<Record<"x" | "y", number>> => ({
  x: point.x,
  y: point.y,
});

/**
 * The Position Object primitive, `data-slot="plate-position-object"` and its parts: `group`,
 * `object`, `copy`, `layer`, `token` and `message`. Render it with the parts in
 * `#plate/ui/position-object/position-object.tsx`.
 */
export const positionObject = definePrimitive({
  agent: { actions: [] },
  api: (context) => {
    const { store } = context;
    const change = createChange(context);
    let drag: { readonly end: () => void; readonly stop: () => void } | undefined;

    /**
     * Map a pointer's viewport position to the stage image's pixels, through the layer drawn in the
     * stage.
     *
     * @param clientX The pointer's `clientX`.
     * @param clientY The pointer's `clientY`.
     * @returns The point, none while the stage's overlay is not on the page.
     */
    const pointAt = (clientX: number, clientY: number): ImagePoint | undefined =>
      elements<LayerProps>(context, "layer")[0]?.props.pointAt(clientX, clientY);

    /**
     * Give the whole pixel of the stage a pointer is over.
     *
     * @param clientX The pointer's `clientX`.
     * @param clientY The pointer's `clientY`.
     * @returns The point, none where the pointer is off the stage, as a held copy's `at` says it.
     */
    const stageAt = (clientX: number, clientY: number): ImagePoint | null => {
      const point = pointAt(clientX, clientY);
      const { size } = store.get();

      return point === undefined ||
        point.x < 0 ||
        point.y < 0 ||
        point.x > size.width ||
        point.y > size.height
        ? null
        : pointOn(point, size);
    };

    /**
     * Find an interaction's `object` part on the page.
     *
     * @param name The interaction's response's identifier.
     * @returns The part's element, if one is bound.
     */
    const objectElement = (name: string): HTMLElement | undefined =>
      elements<ObjectProps>(context, "object").find((part) => part.props.name === name)?.el;

    /**
     * Fill a label with an interaction's object's name, as its `object` part shows it, its text,
     * else its `aria-label`, and the values given.
     *
     * @param label The label.
     * @param object The interaction.
     * @param values The other placeholders' values.
     * @returns The text.
     */
    const say = (
      label: string,
      object: StageObject,
      values: Readonly<Record<string, number>>,
    ): string => {
      const el = objectElement(object.response.identifier);

      return fillLabel(label, { ...values, object: el === undefined ? "" : labelOf(el) });
    };

    /**
     * Pick a copy up, announcing it.
     *
     * @param object The interaction whose object it is.
     * @param index The placed copy's place, none for a new copy.
     * @param at Where it waits.
     * @param dragging Whether a pointer drags it.
     * @param given Whether its object's button gave it.
     */
    const pickUp = (
      object: StageObject,
      index: number | null,
      at: ImagePoint | null,
      dragging: boolean,
      given: boolean,
    ) => {
      store.set({
        held: { at, dragging, given, index, name: object.response.identifier },
        message: null,
      });
      announce(say(store.get().labels.picked, object, {}), { priority: "assertive" });
    };

    /**
     * Pick up a new copy of an interaction's object, waiting at the middle of the stage, or, for a
     * drag, nowhere until it is over the stage; where the interaction has placed as many as it may,
     * pick up its one copy when its limit is one, and otherwise refuse, announcing why, before
     * anything changes.
     *
     * @param object The interaction.
     * @param dragging Whether a pointer drags it.
     * @returns Whether a copy of the object is held now.
     */
    const pickNew = (object: StageObject, dragging: boolean): boolean => {
      const state = store.get();
      const placed = placedOf(state, object);

      if (!fullOf(state, object)) {
        pickUp(object, null, dragging ? null : middleOf(state.size), dragging, true);

        return true;
      }

      const [only] = placed;

      if (object.limit.kind === "at-most" && object.limit.n === 1 && only !== undefined) {
        pickUp(object, 0, dragging ? null : only, dragging, true);

        return true;
      }

      const text = say(state.labels.full, object, {});

      store.set({ message: text });
      announce(text, { priority: "assertive" });

      return false;
    };

    /**
     * Put the held copy back where it was, announcing it.
     */
    const putDown = () => {
      const { held } = store.get();

      if (held === null) {
        return;
      }

      store.set({ held: null, message: null });
      announce(say(store.get().labels.canceled, objectOf(store.get(), held.name), {}), {
        priority: "assertive",
      });
    };

    /**
     * Ask the host for an interaction's new points, and announce what happened once it takes them;
     * a host that cancels the change leaves the copy held.
     *
     * @param object The interaction.
     * @param points Its points now.
     * @param text What happened.
     * @param details What made the change, and the event behind it where one is.
     */
    const commit = (
      object: StageObject,
      points: readonly ImagePoint[],
      text: string,
      details: PositionDetails,
    ) => {
      const next = withPoints(store.get().placements, object.response.identifier, points);

      if (!change("placements", next, details)) {
        return;
      }

      store.set({ held: null, message: null });
      announce(text, { priority: "assertive" });
    };

    /**
     * Put the held copy down at a point: a new copy joins its object's copies, a placed one moves
     * there, and one put down where it was is put back.
     *
     * @param point Where, on a whole pixel of the stage.
     * @param details What made the move, and the event behind it where one is.
     */
    const putAt = (point: ImagePoint, details: PositionDetails) => {
      const state = store.get();
      const { held } = state;

      if (held === null) {
        return;
      }

      const object = objectOf(state, held.name);
      const placed = placedOf(state, object);

      if (held.index === null) {
        commit(
          object,
          [...placed, point],
          say(state.labels.placed, object, coordinates(point)),
          details,
        );

        return;
      }

      const was = placed[held.index];

      if (was === undefined || (was.x === point.x && was.y === point.y)) {
        putDown();

        return;
      }

      commit(
        object,
        placed.map((each, index) => (index === held.index ? point : each)),
        say(state.labels.moved, object, coordinates(point)),
        details,
      );
    };

    /**
     * Take a placed copy off the stage.
     *
     * @param object The interaction.
     * @param index The copy's place among its object's.
     * @param details What made the change, and the event behind it where one is.
     */
    const takeOff = (object: StageObject, index: number, details: PositionDetails) => {
      const state = store.get();

      commit(
        object,
        placedOf(state, object).filter((_, each) => each !== index),
        say(state.labels.removed, object, {}),
        details,
      );
    };

    /**
     * End the running drag, if any: its copy and its scrolling, where it shows them.
     */
    const endDrag = () => {
      drag?.end();
      drag = undefined;
    };

    const recovery = createFocusRecovery<CopyProps>({
      fallback: (lost) => objectElement(lost.props.name),
    });

    context.onDestroy(() => {
      drag?.stop();
      endDrag();
    });
    context.onDestroy(
      store.subscribe(() => {
        const state = store.get();
        const { held } = state;

        if (
          held !== null &&
          held.index !== null &&
          placedOf(state, objectOf(state, held.name))[held.index] === undefined
        ) {
          store.set({ held: null });
        }
      }),
    );

    return {
      /**
       * Join a placed copy's control to focus recovery, so focus goes to its object when the copy
       * is taken off.
       *
       * @param el The control's element.
       * @param part The control's part.
       * @returns The cleanup.
       */
      bindCopy: (el: HTMLElement, part: { key: string; props: CopyProps }) =>
        recovery.bind(el, part),

      /**
       * Join the root: prepare the live regions before the first announcement, and put a held copy
       * back when a press lands outside the island or focus leaves it.
       *
       * @param el The root's element.
       * @returns The cleanup.
       */
      bindRoot: (el: HTMLElement) => {
        const doc = el.ownerDocument;
        const outside = (event: PointerEvent) => {
          if (event.target instanceof Node && !el.contains(event.target)) {
            putDown();
          }
        };
        const leave = (event: FocusEvent) => {
          if (event.relatedTarget instanceof Node && !el.contains(event.relatedTarget)) {
            putDown();
          }
        };

        prepareAnnouncements(doc);
        doc.addEventListener("pointerdown", outside, true);
        el.addEventListener("focusout", leave);

        return () => {
          doc.removeEventListener("pointerdown", outside, true);
          el.removeEventListener("focusout", leave);
        };
      },

      /**
       * Start following a press on a placed copy on the stage, which drags it once it moves past
       * the threshold, its offset from the pointer kept and its place held to the stage. The copy
       * captures the pointer, so a press that never moves is released on it and clicks it.
       *
       * A placed copy is dragged where it stands: no copy follows the pointer, and nothing scrolls.
       *
       * @param event The press.
       * @param el The copy's element on the stage.
       * @param name The interaction's response's identifier.
       * @param index The copy's place among its object's.
       */
      dragCopy: (event: PointerEvent, el: HTMLElement, name: string, index: number) => {
        const state = store.get();
        const object = objectOf(state, name);
        const start = placedOf(state, object)[index];
        const from = pointAt(event.clientX, event.clientY);

        if (
          event.button !== 0 ||
          !event.isPrimary ||
          drag !== undefined ||
          start === undefined ||
          from === undefined
        ) {
          return;
        }

        let started = false;

        drag = {
          end: () => {},
          stop: bindDrag(el, event, {
            cancelOnEscape: true,
            onEnd: (end, canceled) => {
              const { held } = store.get();

              endDrag();

              if (!started || held === null) {
                return;
              }

              if (canceled || held.at === null) {
                putDown();

                return;
              }

              putAt(held.at, { event: end, reason: "drag" });
            },
            onMove: ({ x, y }) => {
              const { held, size } = store.get();
              const now = pointAt(x, y);

              if (held !== null && now !== undefined) {
                store.set({
                  held: {
                    ...held,
                    at: pointOn({ x: start.x + now.x - from.x, y: start.y + now.y - from.y }, size),
                  },
                });
              }
            },
            onStart: () => {
              started = true;
              pickUp(object, index, start, true, false);
            },
            threshold: event.pointerType === "mouse" ? dragThreshold : touchThreshold,
          }),
        };
      },

      /**
       * Start following a press on an object, which drags a new copy of it once it moves past the
       * threshold: a copy of the object follows the pointer, and over the stage the copy is drawn
       * where it would land, its centre point under the pointer.
       *
       * @param event The press.
       * @param el The object's element.
       * @param name The interaction's response's identifier.
       */
      dragNew: (event: PointerEvent, el: HTMLElement, name: string) => {
        const object = objectOf(store.get(), name);

        if (event.button !== 0 || !event.isPrimary || drag !== undefined) {
          return;
        }

        const from = { x: event.clientX, y: event.clientY };
        let last = from;
        let started = false;
        /**
         * The copy that follows the pointer and the scrolling it drives, once the drag has started.
         */
        let carried:
          | { readonly preview: DragPreview; readonly scroll: ReturnType<typeof createAutoScroll> }
          | undefined;
        const hover = (x: number, y: number) => {
          const { held } = store.get();
          const at = stageAt(x, y);

          carried?.preview.el.toggleAttribute("data-over", at !== null);

          if (held !== null) {
            store.set({ held: { ...held, at } });
          }
        };

        drag = {
          end: () => {
            carried?.preview.remove();
            carried?.scroll.stop();
          },
          stop: bindDrag(el, event, {
            cancelOnEscape: true,
            onEnd: (end, canceled) => {
              const { held } = store.get();

              endDrag();

              if (!started || held === null) {
                return;
              }

              if (canceled || held.at === null) {
                putDown();

                return;
              }

              putAt(held.at, { event: end, reason: "drag" });
            },
            onMove: ({ x, y }) => {
              last = { x, y };
              carried?.preview.move(x, y);
              carried?.scroll.update(x, y);
              hover(x, y);
            },
            onStart: () => {
              if (!pickNew(object, true)) {
                return false;
              }

              const preview = bindDragPreview(el, from);

              preview.el.dataset["slot"] = "plate-position-object-preview";
              started = true;
              carried = {
                preview,
                scroll: createAutoScroll({
                  ignore: () => preview.el,
                  onScroll: () => {
                    hover(last.x, last.y);
                  },
                }),
              };

              return true;
            },
            threshold: event.pointerType === "mouse" ? dragThreshold : touchThreshold,
          }),
        };
      },

      /**
       * Handle a key on an object or a placed copy's control: the arrow keys move the held copy, on
       * an object the copy it gave (`HeldCopy.given`), on a placed copy's control that copy, one
       * pixel or ten with Shift, held to the stage; Escape puts it back; Delete or Backspace on a
       * placed copy takes it off. So the arrows move a copy only on the control whose Enter puts it
       * down, never on an object's button while a copy picked up from its list is held, where
       * Enter takes it off.
       *
       * @param event The key press.
       * @param name The interaction's response's identifier.
       * @param index The placed copy's place, none on the object.
       */
      keydown: (event: KeyboardEvent, name: string, index: number | null) => {
        const state = store.get();
        const { held } = state;
        const object = objectOf(state, name);
        const way = arrows.get(event.key);

        if (event.key === "Escape" && held !== null) {
          event.preventDefault();
          event.stopPropagation();
          putDown();

          return;
        }

        if ((event.key === "Delete" || event.key === "Backspace") && index !== null) {
          event.preventDefault();
          takeOff(object, index, { event, reason: "remove-press" });

          return;
        }

        if (
          way === undefined ||
          held === null ||
          held.name !== name ||
          held.at === null ||
          (index === null ? !held.given : held.index !== index)
        ) {
          return;
        }

        const step = event.shiftKey ? steps.large : steps.small;
        const at = pointOn(
          { x: held.at.x + way[0] * step, y: held.at.y + way[1] * step },
          state.size,
        );

        event.preventDefault();
        store.set({ held: { ...held, at } });
        announce(fillLabel(state.labels.at, coordinates(at)));
      },

      /**
       * Mirror a control's keyboard focus on its copy on the stage: a control that matches
       * `:focus-visible` when it takes focus, as a keyboard's focus does and a pointer's does not,
       * names its copy, and one that loses focus names none.
       *
       * @param el The control's element.
       * @param key The copy, or the object, the control stands for.
       * @param focused Whether the control took focus or lost it.
       */
      mirrorFocus: (el: HTMLElement, key: CopyKey, focused: boolean) => {
        const shown = focused && el.matches(":focus-visible") ? key : null;
        const was = store.get().focused;

        if (shown?.name !== was?.name || shown?.index !== was?.index) {
          store.set({ focused: shown });
        }
      },

      /**
       * Handle a press on a placed copy, on the stage or in its object's list: put it down where it
       * waits when it is the one held, else pick it up.
       *
       * @param name The interaction's response's identifier.
       * @param index The copy's place among its object's.
       * @param event The click.
       */
      pressCopy: (name: string, index: number, event: Event | undefined) => {
        const state = store.get();
        const { held } = state;
        const object = objectOf(state, name);
        const point = placedOf(state, object)[index];

        if (point === undefined) {
          return;
        }

        if (held?.name === name && held.index === index && held.at !== null) {
          putAt(held.at, { event, reason: "item-press" });

          return;
        }

        pickUp(object, index, point, false, false);
      },

      /**
       * Handle a press on an object: while a copy it gave is held, a new copy or, where the limit
       * is one, the copy placed, put that copy down where it waits; while a placed copy of it
       * picked up from the stage or its list is held, take that copy off; else pick up a new copy,
       * or, where the limit is one, the copy placed.
       *
       * @param name The interaction's response's identifier.
       * @param event The click.
       */
      pressObject: (name: string, event: Event | undefined) => {
        const state = store.get();
        const { held } = state;
        const object = objectOf(state, name);

        if (held?.name === name && held.given && held.at !== null) {
          putAt(held.at, { event, reason: "item-press" });

          return;
        }

        if (held?.name === name && !held.given && held.index !== null) {
          takeOff(object, held.index, { event, reason: "item-press" });

          return;
        }

        pickNew(object, false);
      },

      /**
       * Handle a tap on the stage, at a point of the stage image, as the stage reports it once it
       * is released there, with no event of its own: put the held copy there.
       *
       * @param point The point, in the stage image's pixels.
       */
      pressStage: (point: ImagePoint) => {
        if (store.get().held !== null) {
          putAt(pointOn(point, store.get().size), { event: undefined, reason: "item-press" });
        }
      },

      recovery,
    };
  },
  controlled: ["placements"],
  name: "plate-position-object",
  options: {
    labels: "value",
    objects: "value",
    onPlacementsChange: "callback",
    placements: "value",
    size: "value",
  },
  slots: (slot) => ({
    copy: slot<CopyControlProps>({
      attrs: (state, part) => {
        const { index, name } = part.props;
        const point = placedOf(state, objectOf(state, name))[index];
        const picked = holds(state.held, name, index);

        return {
          "aria-label":
            point === undefined
              ? undefined
              : fillLabel(state.labels.position, {
                  ...coordinates(point),
                  n: index + 1,
                  object: part.props.object,
                }),
          "aria-pressed": String(picked),
          "data-picked": flag(picked),
          type: "button",
        };
      },
      bind: (el, part) => part.api.bindCopy(el, part),
      focus: "native",
      on: {
        blur: (_event, { api, el, props }) => {
          if (el !== undefined) {
            api.mirrorFocus(el, { index: props.index, name: props.name }, false);
          }
        },
        focus: (_event, { api, el, props }) => {
          if (el !== undefined) {
            api.mirrorFocus(el, { index: props.index, name: props.name }, true);
          }
        },
        keydown: (event, { api, props }) => {
          api.keydown(event, props.name, props.index);
        },
      },
      press: ({ api, props }, event) => {
        api.pressCopy(props.name, props.index, event);
      },
      props: { id: "id", index: "number", name: "string", object: "string" },
      role: "button",
    }),
    group: slot<ObjectProps, PositionGroupState>({
      attrs: (state, part) => ({
        "aria-roledescription": state.labels.role,
        "data-full": flag(fullOf(state, objectOf(state, part.props.name))),
        "data-picked": flag(state.held?.name === part.props.name),
      }),
      props: { id: "id", name: "string" },
      /**
       * An application, not a group: a screen reader in browse mode keeps the arrow keys for
       * itself in a group, and hands them on in an application, where they move a held copy.
       */
      role: "application",
      state: (state, part) => {
        const object = objectOf(state, part.props.name);

        return {
          full: fullOf(state, object),
          picked: state.held?.name === part.props.name,
          placed: placedOf(state, object),
        };
      },
    }),
    layer: slot<LayerProps>({
      props: { id: "id", pointAt: "value" },
    }),
    message: slot<object, PositionMessageState>({
      present: (state) => state.message !== null,
      state: (state) => ({ text: state.message ?? "" }),
    }),
    object: slot<ObjectProps>({
      attrs: (state, part) => {
        const { held } = state;
        const { name } = part.props;
        const picked = held?.name === name && held.given;

        return {
          "aria-pressed": String(picked),
          "data-dragging": flag(picked && held.dragging),
          "data-full": flag(fullOf(state, objectOf(state, name))),
          "data-picked": flag(picked),
          type: "button",
        };
      },
      focus: "native",
      on: {
        blur: (_event, { api, el, props }) => {
          if (el !== undefined) {
            api.mirrorFocus(el, { index: null, name: props.name }, false);
          }
        },
        contextmenu: (event) => {
          event.preventDefault();
        },
        dragstart: (event) => {
          event.preventDefault();
        },
        focus: (_event, { api, el, props }) => {
          if (el !== undefined) {
            api.mirrorFocus(el, { index: null, name: props.name }, true);
          }
        },
        keydown: (event, { api, props }) => {
          api.keydown(event, props.name, null);
        },
        pointerdown: (event, { api, el, props }) => {
          if (el !== undefined) {
            api.dragNew(event, el, props.name);
          }
        },
      },
      press: ({ api, props }, event) => {
        api.pressObject(props.name, event);
      },
      props: { id: "id", name: "string" },
      role: "button",
    }),
    root: slot<object, PositionRootState>({
      attrs: (state) => ({
        "data-dragging": flag(state.held?.dragging === true),
        "data-picked": flag(state.held !== null),
      }),
      bind: (el, part) => part.api.bindRoot(el),
      state: (state) => ({
        focused: state.focused,
        held: state.held,
        placed: placedByName(state),
      }),
    }),
    token: slot<CopyProps>({
      attrs: (state, part) => {
        const { held } = state;
        const picked = holds(held, part.props.name, part.props.index);

        return {
          "data-dragging": flag(picked && held?.dragging === true),
          "data-picked": flag(picked),
        };
      },
      on: {
        click: (event, { api, props }) => {
          api.pressCopy(props.name, props.index, event);
        },
        pointerdown: (event, { api, el, props }) => {
          if (el !== undefined) {
            api.dragCopy(event, el, props.name, props.index);
          }
        },
      },
      props: { id: "id", index: "number", name: "string" },
    }),
  }),
  state: (options: PositionOptions): State => ({
    focused: null,
    held: null,
    labels: options.labels,
    message: null,
    objects: options.objects,
    placements: options.placements,
    size: options.size,
  }),
  sync: (options) => ({
    labels: options.labels,
    objects: options.objects,
    placements: options.placements,
    size: options.size,
  }),
});
