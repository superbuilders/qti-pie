/**
 * The placement primitive: the UI SDK behaviour every interaction that moves things shares, over
 * the pure {@link place} machine. A child moves a chip from the bank into a target, between
 * targets, or back, by a tap and a tap, a drag, or the keyboard, and every way runs the same
 * machine step and says the same words.
 *
 * - **Tap.** A tap on a chip picks it up; a tap on a slot, on a target's own area, or on a chip a
 *   target holds puts the held chip there; a tap on the held chip, or outside the interaction, puts
 *   it down. A tap on another bank chip, while a bank chip is held, picks that one up instead, and
 *   a tap on the bank returns a placed chip.
 * - **Drag.** A press on a chip that moves past a threshold drags a copy of it, raised for fingers
 *   and pens, which tap with a little drift; there is no long press. A release over a target or the
 *   bank, or near one the page lays out as a box, drops it there; a target drawn on an image, an
 *   SVG shape, takes only a release on its own shape. A release over nothing leaves it held, so a
 *   tap can finish the move; Escape or the browser taking the pointer puts it down.
 * - **Keys.** Chips are one roving group and slots another, each one tab stop with arrows by layout.
 *   Space or Enter picks up and places, as a press; Escape puts down; Delete or Backspace returns a
 *   placed chip.
 *
 * A refused step is decided by the machine before any state changes, announced, and shown in the
 * message part. Focus follows a moved chip to where it lands, since the framework renders it as a
 * new element and a browser without `moveBefore` drops focus when it removes the old one; but a
 * chip a pointer places on a target drawn on a picture, a Graphic Gap Match's hotspot on its stage,
 * leaves focus on that target, where the child is looking, and never scrolls the page, since the
 * chip itself lands in the list under the picture ({@link landingOf}). Every
 * text comes from the `labels` option, filled with the visible text of the chips and targets.
 *
 * @module
 * @see https://ui-sdk.dev/docs/core/kernel/define-a-primitive
 */
import { Array as Arr, Option } from "effect";
import {
  announce,
  bindDrag,
  bindDragPreview,
  createAutoScroll,
  createChange,
  createFocusRecovery,
  createRovingFocus,
  dragThreshold,
  elements,
  idPart,
  labelOf,
  prepareAnnouncements,
  spatialMove,
} from "@ui-sdk/core";
import type { ChangeDetails, DragPreview } from "@ui-sdk/core";
import { definePrimitive } from "#plate/ui/define-primitive.ts";
import { flag } from "#plate/ui/attributes.ts";
import { fillLabel } from "#plate/ui/labels.ts";
import type { PlacementLabels } from "#plate/ui/placement/labels.ts";
import {
  bank,
  bankEmpty,
  chipsIn,
  hasCopies,
  pick,
  place,
  refusalAt,
  samePlace,
  showsFull,
  usedUp,
} from "#plate/placement/machine.ts";
import type {
  Arrangement,
  Bank,
  Box,
  Boxes,
  BoxesBoard,
  Move,
  Pairs,
  PairsBoard,
  Picked,
  Place,
  Refusal,
  Sequence,
  SequenceBoard,
  Spot,
  Step,
} from "#plate/placement/machine.ts";

/**
 * Why the placements changed: `item-press` for a tap, a click, or Space or Enter on a chip or slot;
 * `drag` for a pointer drag; `remove-press` for Delete or Backspace on a placed chip.
 */
export type PlacementReason = "drag" | "item-press" | "remove-press";

/**
 * What made a drop, and the event behind it: a pointer's release, a key press or a click, or
 * undefined for a press the UI SDK reports with no event.
 */
type PlacementDetails = Readonly<{ event: Event | undefined; reason: PlacementReason }>;

/**
 * What a placement root over a sequence board takes: the board, and its placements, an occupant
 * per position, an empty position included, which no response holds, so the island keeps them
 * (`useSequence` in `#plate/ui/placement/sequence.ts`).
 */
export interface SequenceOptions {
  readonly board: SequenceBoard;
  readonly placements: Sequence;
  /**
   * Asks for new placements after a child's move, with UI SDK's change details.
   */
  readonly onPlacementsChange: (
    placements: Sequence,
    details: ChangeDetails<PlacementReason>,
  ) => void;
  readonly labels: PlacementLabels;
}

/**
 * What a placement root over a board of pairs takes: the board, and its placements, a bag of
 * pairs.
 */
export interface PairsOptions {
  readonly board: PairsBoard;
  readonly placements: Pairs;
  /**
   * Asks for new placements after a child's move, with UI SDK's change details.
   */
  readonly onPlacementsChange: (placements: Pairs, details: ChangeDetails<PlacementReason>) => void;
  readonly labels: PlacementLabels;
}

/**
 * What a placement root over a board of boxes takes: the board, and its placements, the boxes that
 * hold a chip, a box short of a pair included, which no response holds, so the island keeps them
 * (`keptBoxes` in `#plate/ui/placement/associable.ts`).
 */
export interface BoxesOptions {
  readonly board: BoxesBoard;
  readonly placements: Boxes;
  /**
   * Asks for new placements after a child's move, with UI SDK's change details.
   */
  readonly onPlacementsChange: (placements: Boxes, details: ChangeDetails<PlacementReason>) => void;
  readonly labels: PlacementLabels;
}

/**
 * What a placement root takes. The placements are controlled: the island derives them from the
 * response it holds and writes the response back from `onPlacementsChange`, so a move the host
 * refuses never shows. A new `board` or `labels` object on every render costs a render of every
 * part, so an island keeps them stable.
 */
export type PlacementOptions = SequenceOptions | PairsOptions | BoxesOptions;

/**
 * The chip the child holds, and whether it is being dragged, which it can be only while held.
 */
export interface Held {
  readonly picked: Picked;
  readonly dragging: boolean;
}

/**
 * What the root's render functions see: the chip held, if one is.
 */
export interface PlacementRootState {
  readonly held: Held | null;
}

/**
 * What a target's render functions see: the chips it holds, in order, and the states its `data-*`
 * attributes show.
 */
export interface PlacementTargetState {
  readonly chips: readonly string[];
  readonly empty: boolean;
  readonly full: boolean;
  readonly over: boolean;
  readonly refuses: boolean;
}

/**
 * What a chip's render functions see: the states its `data-*` attributes show. A K–3 child is shown
 * no counts, so how many uses are left is not among them.
 */
export interface PlacementChipState {
  readonly copies: boolean;
  readonly dragging: boolean;
  readonly picked: boolean;
  readonly used: boolean;
}

/**
 * What the message part's render functions see: the latest refusal's text.
 */
export interface PlacementMessageState {
  readonly text: string;
}

/**
 * A target's name as the page shows it, read once its parts have bound: the visible text that
 * announcements and its slot say, and whether a label part names it.
 */
interface SpotName {
  readonly spot: Spot;
  readonly text: string;
  readonly labelled: boolean;
}

/**
 * Everything the primitive keeps: the board and its placements, from the options; the labels; the
 * chip held and the place a drag is over; the roving groups' tab stops; the target names read
 * from the page; and the latest refusal.
 */
type State = Arrangement & {
  readonly labels: PlacementLabels;
  readonly held: Held | null;
  readonly over: Place | null;
  readonly chipStop: string | null;
  readonly slotStop: string | null;
  readonly names: readonly SpotName[];
  readonly message: string | null;
};

/**
 * How a target is named, for its `group` role, its slot and every announcement: `label-part`, by
 * its target label part, whose text `text` is, as a match's group and an order's position are; or
 * `aria-label`, by an `aria-label` of `text` in place of a label part, as a gap and a box's half
 * are. The primitive reads a label part's text from the page once its parts have bound, so `text`
 * is what names the target's slot in the server's render and until then.
 */
export type TargetName =
  | { readonly by: "aria-label"; readonly text: string }
  | { readonly by: "label-part"; readonly text: string };

/**
 * A target, position or half as its slot puts chips in it: the spot, and the text its
 * {@link TargetName} gives, which names the slot until the page's own name of the spot is read.
 */
export type NamedSpot = Spot & { readonly name: string };

/**
 * A chip part's props: its chip's identifier, and the place it stands in, the bank or the target
 * around it. `id` keys the part, made by the adapter, since one chip renders in the bank and in
 * every target that holds a copy.
 */
interface ChipProps {
  readonly id?: string;
  readonly value: string;
  readonly at: Place;
}

/**
 * A target part's props: the spot it is, and what names it ({@link TargetName}): its label part, or
 * the `aria-label` its caller writes in place of one. `id` keys the part, made by the adapter.
 */
interface TargetProps {
  readonly id?: string;
  readonly spot: Spot;
  readonly by: TargetName["by"];
}

/**
 * A slot part's props: the place it puts chips in, the bank or a spot with the name its caller
 * gave it.
 */
interface SlotProps {
  readonly id?: string;
  readonly to: Bank | NamedSpot;
}

/**
 * A target label part's props: the spot it names.
 */
interface LabelProps {
  readonly id?: string;
  readonly of: Spot;
}

/**
 * How far a finger or pen moves, in CSS pixels, before a press is a drag. UI SDK's `dragThreshold`
 * of 3 suits a mouse; a child's fingertip drifts further during a tap, and Android's own touch slop
 * is 8 dp, so a touch or pen press waits for more.
 */
const touchThreshold = 10;

/**
 * How far outside a target or the bank, in CSS pixels, a release still drops there, so a child's
 * near miss lands. A target drawn on an image takes none ({@link nearMissOf}).
 */
const dropMargin = 24;

/**
 * The SVG namespace, which an image's area drawn as a target is an element of.
 */
const svgNamespace = "http://www.w3.org/2000/svg";

/**
 * The parts that act on a press of their own, the primitive's chips and slots and read-aloud's
 * control beside a chip or a target (`#plate/ui/read-aloud/read-aloud.tsx`), so a child hears a
 * choice while holding another; an area's click leaves them alone.
 */
const buttonParts =
  '[data-slot="plate-placement-chip"], [data-slot="plate-placement-slot"], [data-slot="plate-read-aloud"]';

/**
 * Every part a press inside the root can mean something on; a press on none puts a held chip down.
 */
const activeParts = `${buttonParts}, [data-slot="plate-placement-target"], [data-slot="plate-placement-bank"]`;

/**
 * A part a drop can land in: its element, and the place it is.
 */
interface DropArea {
  readonly el: HTMLElement;
  readonly place: Place;
}

/**
 * The place under or near a point, and the part's element where the point is on that part, none
 * where it is only near it.
 */
interface Found {
  readonly el: HTMLElement | undefined;
  readonly place: Place;
}

/**
 * Give the target a pointer placed a chip on where focus stays after the move, in place of the
 * chip's new element: a target drawn on a picture (an element of SVG's namespace, a Graphic Gap
 * Match's hotspot on its stage) that takes focus (`tabindex`), the one the move placed the chip in,
 * whether it was empty or the chip took another's place there.
 * There the child is looking, and the chip's own new element stands in the list under the picture,
 * often out of view, so focusing it would scroll the page under the child's finger, which
 * AlphaTest's player never did (edullm-bd, 2026-11-22, from PLAYER-PARITY's _f9fa8d6c). A move
 * the keyboard made, through a slot, or onto a target laid out as a box, follows the chip.
 *
 * @param on The target part's element the pointer placed the chip on, if any.
 * @param move The move.
 * @returns The element focus goes to, or none where it follows the chip.
 */
const landingOf = (on: Element | undefined, move: Move): SVGElement | undefined =>
  on instanceof SVGElement &&
  on.hasAttribute("tabindex") &&
  (move.kind === "placed" || move.kind === "swapped")
    ? on
    : undefined;

/**
 * A part a release fell on none of, as the release measures it: its place, how far the release is
 * from its boxes, in CSS pixels, and whether it is drawn on an image, an SVG shape such as a
 * graphic interaction's hotspot, rather than laid out as a box.
 */
interface Reach {
  readonly distance: number;
  readonly drawn: boolean;
  readonly place: Place;
}

/**
 * Find where a release that fell on no part lands: the part laid out as a box nearest it within
 * {@link dropMargin}, so a child's near miss lands; never a part drawn on an image. An image's
 * area takes a release only on its own shape, the one the page's hit test finds, since its boxes
 * hold points outside a round or concave area, and a margin around it would reach into the areas
 * beside it: a release between two areas belongs to neither, as a tap there does (the graphic
 * stage's target-spacing rule, WCAG 2.5.8).
 *
 * @param reaches Every part a release can land in, measured from it.
 * @returns The place, or `null` when no box is near.
 */
const nearMissOf = (reaches: readonly Reach[]): Place | null => {
  const [nearest] = reaches
    .filter((reach) => !reach.drawn && reach.distance <= dropMargin)
    .toSorted((a, b) => a.distance - b.distance);

  return nearest === undefined ? null : nearest.place;
};

/**
 * Report whether a click landed on none of some parts.
 *
 * @param event The click.
 * @param selector The parts.
 * @returns Whether its target is outside every one of them.
 */
const missed = (event: Event, selector: string): boolean =>
  event.target instanceof Element && event.target.closest(selector) === null;

/**
 * Tell a sequence root's options from the others, by the board's kind.
 *
 * @param options The root's options.
 * @returns Whether they are a sequence root's.
 */
const sequenceOptions = (options: PlacementOptions): options is SequenceOptions =>
  options.board.kind === "sequence";

/**
 * Tell a board of boxes' root's options from the others, by the board's kind.
 *
 * @param options The root's options.
 * @returns Whether they are a board of boxes' root's.
 */
const boxesOptions = (options: PlacementOptions): options is BoxesOptions =>
  options.board.kind === "boxes";

/**
 * Read the board and its placements out of the options, together, so one kind of board's
 * placements never meet another's board. The branches read alike but are typed apart by the
 * guards: TypeScript narrows no object by a field of one of its fields, so only a guard pairs each
 * board with its own kind of placements.
 *
 * @param options The root's options.
 * @returns The arrangement.
 */
const arrangementOf = (options: PlacementOptions): Arrangement => {
  if (sequenceOptions(options)) {
    return { ...options.board, placements: options.placements };
  }

  if (boxesOptions(options)) {
    return { ...options.board, placements: options.placements };
  }

  return { ...options.board, placements: options.placements };
};

/**
 * Read the chip held out of the primitive's state.
 *
 * @param state The primitive's state.
 * @returns The chip held, or `null`.
 */
const pickedOf = (state: State): Picked | null => (state.held === null ? null : state.held.picked);

/**
 * Report whether a place would refuse the held chip, for any reason.
 *
 * @param state The primitive's state.
 * @param to A place.
 * @returns Whether a chip is held and the place would refuse it.
 */
const refusesHeld = (state: State, to: Place): boolean =>
  state.held !== null && refusalAt(state, state.held.picked, to) !== undefined;

/**
 * Report whether a placed chip is held, the only time the bank's slot has anything to do: it is
 * out of the slots' roving group otherwise, and the stylesheet hides it without moving the layout.
 *
 * @param state The primitive's state.
 * @returns Whether the held chip came from a target.
 */
const returning = (state: State): boolean =>
  state.held !== null && state.held.picked.from.kind !== "bank";

/**
 * Report whether a slot should hold the slots' tab stop, so Tab lands where the held chip can go:
 * a target's slot that would take the held chip, or any target's slot while none is held. The
 * group gives the stop to the first such slot.
 *
 * @param state The primitive's state.
 * @param to The slot's place.
 * @returns Whether the slot is preferred.
 */
const takes = (state: State, to: Place): boolean => to.kind !== "bank" && !refusesHeld(state, to);

/**
 * Find the name read from the page for a spot.
 *
 * @param state The primitive's state.
 * @param spot A target or a position.
 * @returns Its name, if its parts have bound.
 */
const nameOf = (state: State, spot: Spot): SpotName | undefined =>
  state.names.find((name) => samePlace(name.spot, spot));

/**
 * Make the id of a target's label, which the target's `aria-labelledby` names.
 *
 * @param id The instance's id.
 * @param spot The target, position or half it names.
 * @returns The label's element id.
 */
const labelId = (id: string, spot: Spot): string => {
  if (spot.kind === "half") {
    return `${id}-box-${String(spot.box)}-${String(spot.side)}-label`;
  }

  return spot.kind === "target"
    ? `${id}-target-${idPart(spot.id)}-label`
    : `${id}-position-${String(spot.index)}-label`;
};

/**
 * Measure how far a point is from an element: 0 inside any of its boxes, so a gap that wraps
 * across two lines counts only where it is drawn.
 *
 * @param el The element.
 * @param x The point's x, in viewport pixels.
 * @param y The point's y, in viewport pixels.
 * @returns The distance to its nearest box.
 */
const distanceTo = (el: Element, x: number, y: number): number => {
  const boxes = [...el.getClientRects()];

  return Arr.reduce(
    (boxes.length === 0 ? [el.getBoundingClientRect()] : boxes).map((box) =>
      Math.hypot(
        Math.max(box.left - x, 0, x - box.right),
        Math.max(box.top - y, 0, y - box.bottom),
      ),
    ),
    Number.POSITIVE_INFINITY,
    (least, each) => Math.min(least, each),
  );
};

/**
 * Compare two readings of the targets' names.
 *
 * @param a One reading.
 * @param b The other.
 * @returns Whether they name the same spots the same way, in the same order.
 */
const sameNames = (a: readonly SpotName[], b: readonly SpotName[]): boolean =>
  a.length === b.length &&
  a.every((name, index) => {
    const other = b[index];

    return (
      other !== undefined &&
      samePlace(name.spot, other.spot) &&
      name.text === other.text &&
      name.labelled === other.labelled
    );
  });

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
 * Report whether a box holds a pair: a chip in each half.
 *
 * @param box The box.
 * @returns Whether both halves hold a chip.
 */
const paired = (box: Box): box is readonly [string, string] => box[0] !== null && box[1] !== null;

/**
 * Key a pair by what it means, its two chips in sorted order, since a `pair` is unordered: "(A,B)
 * and (B,A) are equivalent" (QTI 3.0 information model 8.13). No identifier holds a space.
 *
 * @param pair The pair's two chips.
 * @returns The key.
 */
const pairKey = (pair: readonly [string, string]): string => pair.toSorted().join(" ");

/**
 * List the pairs a step on a board of boxes makes: each box the step leaves holding a pair that no
 * box held before it, in either order. A swap can make two, one in each box it touched; a swap
 * between a box's own halves, or a chip returned, makes none.
 *
 * @param before The boxes before the step.
 * @param after The boxes after it.
 * @returns The pairs made, each as its box holds it, in the order of the boxes.
 */
export const madePairs = (before: Boxes, after: Boxes): readonly (readonly [string, string])[] => {
  const held = new Set(before.filter(paired).map(pairKey));

  return after.filter(paired).filter((pair) => !held.has(pairKey(pair)));
};

/**
 * What a chip part shows: whether it is the chip held, from its place, and dragged; and, in the
 * bank, whether it is a stack of copies and whether it has no use left.
 *
 * @param state The primitive's state.
 * @param props The chip part's props.
 * @returns Its state.
 */
const chipState = (state: State, props: ChipProps): PlacementChipState => {
  const { at, value } = props;
  const { held } = state;
  const picked = held !== null && held.picked.chip === value && samePlace(held.picked.from, at);

  return {
    copies: at.kind === "bank" && hasCopies(state, value),
    dragging: picked && held.dragging,
    picked,
    used: at.kind === "bank" && usedUp(state, value),
  };
};

/**
 * What a target part shows: the chips it holds, and whether it is empty, full to the child, under
 * a drag, and refusing the held chip.
 *
 * @param state The primitive's state.
 * @param spot The target or position.
 * @returns Its state.
 */
const targetState = (state: State, spot: Spot): PlacementTargetState => {
  const chips = chipsIn(state, spot);

  return {
    chips,
    empty: chips.length === 0,
    full: showsFull(state, spot),
    over: samePlace(state.over, spot),
    refuses: refusesHeld(state, spot),
  };
};

/**
 * The placement primitive, `data-slot="plate-placement"` and its parts: `bank`, `target`,
 * `target-label`, `slot`, `chip` and `message`. Render it with {@link PlacementRoot} and the parts
 * in `#plate/ui/placement/parts.tsx`.
 */
export const placement = definePrimitive({
  agent: { actions: [] },
  api: (context) => {
    const { store } = context;
    const change = createChange(context);
    const chipFocus = createRovingFocus<State, ChipProps>(context, {
      disabled: (item) => item.props.at.kind === "bank" && usedUp(store.get(), item.props.value),
      key: "chipStop",
      move: spatialMove(),
      slot: "chip",
    });
    const slotFocus = createRovingFocus<State, SlotProps>(context, {
      claims: (state, item) => takes(state, item.props.to),
      focusable: (item) => item.props.to.kind !== "bank" || returning(store.get()),
      key: "slotStop",
      move: spatialMove(),
      preferred: (item) => takes(store.get(), item.props.to),
      remember: false,
      slot: "slot",
    });
    let root: HTMLElement | undefined;
    let pending: { readonly chip: string; readonly at: Place } | undefined;
    let drag:
      | {
          readonly stop: () => void;
          preview?: DragPreview;
          scroll?: ReturnType<typeof createAutoScroll>;
        }
      | undefined;
    let ignorePress: Picked | undefined;
    let renaming = false;

    /**
     * Find the element a chip renders as at a place, or any element of it.
     *
     * @param chip A chip identifier.
     * @param at A place.
     * @returns The element, if one is bound.
     */
    const chipElement = (chip: string, at: Place): HTMLElement | undefined => {
      const all = elements<ChipProps>(context, "chip").filter((part) => part.props.value === chip);

      return (all.find((part) => samePlace(part.props.at, at)) ?? all[0])?.el;
    };

    /**
     * Read a chip's visible text, for an announcement.
     *
     * @param chip A chip identifier.
     * @param at Where it is, when it has several elements.
     * @returns Its text, or its `aria-label` when it shows none.
     */
    const chipName = (chip: string, at: Place): string => {
      const el = chipElement(chip, at);

      return el === undefined ? "" : labelOf(el);
    };

    /**
     * Find the label part that names a target: its own, where its {@link TargetName} names it by
     * its label part. A target named by an `aria-label` is named by no label part, though it may
     * show one: an order position labelled "a." is still named "1".
     *
     * @param spot A target or a position.
     * @returns The label part, none where no label part names the target.
     */
    const namingLabel = (spot: Spot): HTMLElement | undefined =>
      elements<TargetProps>(context, "target").some(
        (part) => samePlace(part.props.spot, spot) && part.props.by === "label-part",
      )
        ? elements<LabelProps>(context, "target-label").find((part) =>
            samePlace(part.props.of, spot),
          )?.el
        : undefined;

    /**
     * Read a target's name: the text of the label part that names it ({@link namingLabel}), else
     * its `aria-label`, else its own text.
     *
     * @param spot A target or a position.
     * @returns The name the page shows or gives it.
     */
    const targetName = (spot: Spot): string => {
      const label = namingLabel(spot);
      const text = label === undefined ? "" : labelOf(label);
      const el = elements<TargetProps>(context, "target").find((part) =>
        samePlace(part.props.spot, spot),
      )?.el;

      if (text !== "" || el === undefined) {
        return text;
      }

      return el.getAttribute("aria-label") ?? labelOf(el);
    };

    /**
     * Read every bound target's name, and whether a label part names it, into state, a microtask
     * after a target or label binds or leaves, once the parts around it have bound too.
     */
    const rename = () => {
      if (renaming) {
        return;
      }

      renaming = true;
      queueMicrotask(() => {
        renaming = false;

        const names = elements<TargetProps>(context, "target").map(({ props }): SpotName => ({
          labelled: namingLabel(props.spot) !== undefined,
          spot: props.spot,
          text: targetName(props.spot),
        }));

        if (!sameNames(names, store.get().names)) {
          store.set({ names });
        }
      });
    };

    /**
     * Say what a step did, in the labels' words, naming chips and targets by what the page shows.
     * It reads the page, so it runs before the step's placements render.
     *
     * @param move What the step did.
     * @returns The announcement.
     */
    const describe = (move: Move): string => {
      const { labels } = store.get();
      const chip = chipName(move.chip, move.from);

      if (move.kind === "picked") {
        return fillLabel(labels.picked, { chip });
      }

      if (move.kind === "canceled") {
        return fillLabel(labels.canceled, { chip });
      }

      if (move.kind === "returned") {
        return fillLabel(labels.returned, { chip });
      }

      const target = targetName(move.target);

      if (move.kind === "placed") {
        return fillLabel(labels.placed, { chip, target });
      }

      const other = chipName(move.other, move.target);

      return move.otherTo.kind === "bank"
        ? fillLabel(labels.swappedBack, { chip, other, target })
        : fillLabel(labels.swapped, { chip, from: targetName(move.otherTo), other, target });
    };

    /**
     * Say the pairs a step on a board of boxes makes, after the step's own words: the `paired`
     * label once for each pair no box held before it ({@link madePairs}), naming first the chip
     * the step moved, or the chip a swap traded into the other box, so the child hears the pair
     * made (WCAG 4.1.3). It reads the page, so it runs before the step's placements render.
     *
     * @param text The step's own words.
     * @param before The arrangement before the step.
     * @param step The step, which went through.
     * @returns The words, with each pair made said after them.
     */
    const withPairs = (
      text: string,
      before: Arrangement,
      step: Extract<Step, { ok: true }>,
    ): string => {
      const { arrangement, move } = step;

      if (before.kind !== "boxes" || arrangement.kind !== "boxes") {
        return text;
      }

      const moved = move.kind === "swapped" ? [move.chip, move.other] : [move.chip];
      const said = madePairs(before.placements, arrangement.placements).map((pair) => {
        const chip = moved.find((each) => pair.includes(each)) ?? pair[0];
        const partner = pair[0] === chip ? pair[1] : pair[0];

        return fillLabel(store.get().labels.paired, {
          chip: chipName(chip, bank),
          partner: chipName(partner, bank),
        });
      });

      return [text, ...said].join(" ");
    };

    /**
     * Announce a refused step and show it in the message part; a step on a chip that has left
     * where it was picked up puts the chip down without a word, since the child did not cause it.
     *
     * @param refusal Why the step was refused.
     */
    const refused = (refusal: Refusal) => {
      if (refusal.reason === "unknown") {
        store.set({ held: null });

        return;
      }

      const chip = refusal.chip === null ? "" : chipName(refusal.chip, bank);
      const target = refusal.target === null ? "" : targetName(refusal.target);
      const partner = refusal.partner === null ? "" : chipName(refusal.partner, bank);
      const text = fillLabel(store.get().labels[refusal.reason], { chip, partner, target });

      store.set({ message: text });
      announce(text, { priority: "assertive" });
    };

    /**
     * Pick a chip up, announcing it, or announce why not.
     *
     * @param chip A chip identifier.
     * @param from The place it sits in.
     * @returns The chip held now, or undefined when the pick was refused.
     */
    const pickUp = (chip: string, from: Place): Picked | undefined => {
      const step = pick(store.get(), chip, from);

      if (!step.ok) {
        refused(step.refusal);

        return undefined;
      }

      pending = undefined;
      store.set({ held: { dragging: false, picked: step.picked }, message: null });
      announce(describe(step.move), { priority: "assertive" });

      return step.picked;
    };

    /**
     * Put the held chip down where it was, announcing it.
     */
    const putDown = () => {
      const { held } = store.get();

      if (held === null) {
        return;
      }

      const text = describe({ chip: held.picked.chip, from: held.picked.from, kind: "canceled" });

      store.set({ held: null, message: null });
      announce(text, { priority: "assertive" });
    };

    /**
     * Put a held chip down on Escape.
     *
     * @param event The key press.
     * @returns Whether it was Escape with a chip held, which it handled.
     */
    const escape = (event: KeyboardEvent): boolean => {
      if (event.key !== "Escape" || store.get().held === null) {
        return false;
      }

      event.preventDefault();
      event.stopPropagation();
      putDown();

      return true;
    };

    /**
     * Commit a drop: ask the host for the step's placements, mark where focus follows the moved
     * chip, or give it to the target drawn on a picture the pointer placed it on ({@link
     * landingOf}), and announce what happened; or announce the refusal. A host that cancels the
     * change leaves the chip held.
     *
     * @param step The machine's step.
     * @param details What made the move, and the event behind it.
     * @param on The target part's element the pointer placed the chip on, none for a move the
     *   pointer did not place on a target.
     */
    const commit = (step: Step, details: PlacementDetails, on: Option.Option<Element>) => {
      if (!step.ok) {
        refused(step.refusal);

        return;
      }

      const { move } = step;
      const text = withPairs(describe(move), store.get(), step);

      if (move.kind !== "canceled") {
        const doc = root?.ownerDocument;
        const active = doc?.activeElement;
        const inside =
          active === doc?.body || (active instanceof Node && root?.contains(active) === true);

        const landing = landingOf(Option.getOrUndefined(on), move);

        pending =
          inside && landing === undefined
            ? { at: move.kind === "returned" ? bank : move.target, chip: move.chip }
            : undefined;

        if (!change("placements", step.arrangement.placements, details)) {
          pending = undefined;

          return;
        }

        if (inside && landing !== undefined) {
          landing.focus({ preventScroll: true });
        }
      }

      store.set({ held: null, message: null });
      announce(text, { priority: "assertive" });
    };

    /**
     * Drop the held chip into a place.
     *
     * @param to A target, a position or the bank.
     * @param details What made the move, and the event behind it.
     * @param on The target part's element the pointer placed the chip on, none for a drop the
     *   pointer did not place on a target.
     */
    const dropAt = (to: Place, details: PlacementDetails, on: Option.Option<Element>) => {
      const current = store.get();

      commit(place(current, pickedOf(current), to), details, on);
    };

    /**
     * Find the target or the bank under or near a point: the one holding the topmost element under
     * it, as the page tests hits, so a target that takes the pointer only where it is drawn, as an
     * image's hotspot drawn in SVG does, is found by its shape and the first of two that overlap by
     * which is on top; else the nearest part laid out as a box within {@link dropMargin}
     * ({@link nearMissOf}). A part is found by any element it holds, its own included, since the
     * page's hit test lists the shape a pointer lands on and need not list the SVG group around it
     * that is the part.
     *
     * @param x The point's x, in viewport pixels.
     * @param y The point's y, in viewport pixels.
     * @returns The place, with the part's element where the point is on it, or `null` when none is
     *   near.
     */
    const areaAt = (x: number, y: number): Found | null => {
      const areas: readonly DropArea[] = [
        ...elements<TargetProps>(context, "target").map((part) => ({
          el: part.el,
          place: part.props.spot,
        })),
        ...elements(context, "bank").map((part) => ({ el: part.el, place: bank })),
      ];
      const under = (root?.ownerDocument.elementsFromPoint(x, y) ?? [])
        .map((el) => areas.find((area) => area.el.contains(el)))
        .find((area) => area !== undefined);

      if (under !== undefined) {
        return under;
      }

      const near = nearMissOf(
        areas.map((area) => ({
          distance: distanceTo(area.el, x, y),
          drawn: area.el.namespaceURI === svgNamespace,
          place: area.place,
        })),
      );

      return near === null ? null : { el: undefined, place: near };
    };

    /**
     * Find the place under or near a point ({@link areaAt}).
     *
     * @param x The point's x, in viewport pixels.
     * @param y The point's y, in viewport pixels.
     * @returns The place, or `null` when none is near.
     */
    const placeAt = (x: number, y: number): Place | null => areaAt(x, y)?.place ?? null;

    /**
     * Mark the place a drag is over, on its part and on the dragged copy.
     *
     * @param x The pointer's x, in viewport pixels.
     * @param y The pointer's y, in viewport pixels.
     */
    const hover = (x: number, y: number) => {
      const over = placeAt(x, y);
      const copy = drag?.preview?.el;

      if (!samePlace(store.get().over, over)) {
        store.set({ over });
      }

      copy?.toggleAttribute("data-over", over !== null);
      copy?.toggleAttribute("data-refuses", over !== null && refusesHeld(store.get(), over));
    };

    /**
     * End the running drag's copy and scrolling, if any.
     */
    const endDrag = () => {
      drag?.preview?.remove();
      drag?.scroll?.stop();
      drag = undefined;
    };

    const recovery = createFocusRecovery({
      fallback: () => {
        const next = pending === undefined ? undefined : chipElement(pending.chip, pending.at);

        return next ?? chipFocus.items()[0]?.el ?? slotFocus.items()[0]?.el;
      },
    });

    context.onDestroy(() => {
      drag?.stop();
      endDrag();
    });
    context.onDestroy(
      store.subscribe(() => {
        const state = store.get();
        const { held } = state;

        if (held === null) {
          return;
        }

        const { chip, from } = held.picked;
        const gone =
          from.kind === "bank" ? usedUp(state, chip) : !chipsIn(state, from).includes(chip);

        if (gone) {
          store.set({ held: null });
        }
      }),
    );

    return {
      /**
       * Join a chip to its roving group and to focus recovery, and give it focus when it is where
       * the chip a child just moved landed.
       *
       * @param el The chip's element.
       * @param part The chip's part.
       * @returns The cleanup.
       */
      bindChip: (el: HTMLElement, part: { key: string; props: ChipProps }) => {
        const cleanup = allOf([chipFocus.bind(el, part), recovery.bind(el, part)]);
        const landed = pending;

        if (
          landed !== undefined &&
          landed.chip === part.props.value &&
          samePlace(landed.at, part.props.at)
        ) {
          const active = el.ownerDocument.activeElement;

          pending = undefined;

          if (
            active === null ||
            active === el.ownerDocument.body ||
            root?.contains(active) === true
          ) {
            el.focus();
          }
        }

        return cleanup;
      },

      /**
       * Note a target or label part binding or leaving, so names are read again.
       *
       * @returns The cleanup, which notes it leaving.
       */
      bindNamed: () => {
        rename();

        return rename;
      },

      /**
       * Join the root: prepare the live regions before the first announcement, and put a held chip
       * down when a press lands outside the interaction or focus leaves it.
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

        root = el;
        prepareAnnouncements(doc);
        doc.addEventListener("pointerdown", outside, true);
        el.addEventListener("focusout", leave);

        return () => {
          doc.removeEventListener("pointerdown", outside, true);
          el.removeEventListener("focusout", leave);
          root = undefined;
        };
      },

      /**
       * Join a slot to its roving group and to focus recovery.
       *
       * @param el The slot's element.
       * @param part The slot's part.
       * @returns The cleanup.
       */
      bindSlot: (el: HTMLElement, part: { key: string; props: SlotProps }) =>
        allOf([slotFocus.bind(el, part), recovery.bind(el, part)]),

      chipFocus,

      /**
       * Handle a key on a chip: Escape puts a held chip down, Delete or Backspace returns a placed
       * chip to the bank, and the arrows, Home and End move within the chips.
       *
       * @param event The key press.
       * @param el The chip's element.
       * @param chip The chip's identifier.
       * @param at The place it stands in.
       */
      keydownChip: (event: KeyboardEvent, el: HTMLElement, chip: string, at: Place) => {
        if (escape(event)) {
          return;
        }

        if ((event.key === "Delete" || event.key === "Backspace") && at.kind !== "bank") {
          const current = store.get();
          const lifted = pick(current, chip, at);

          event.preventDefault();
          commit(
            lifted.ok ? place(current, lifted.picked, bank) : lifted,
            { event, reason: "remove-press" },
            Option.none(),
          );

          return;
        }

        chipFocus.keydown(event, el);
      },

      /**
       * Handle a key on a slot: Escape puts a held chip down, and the arrows, Home and End move
       * within the slots.
       *
       * @param event The key press.
       * @param el The slot's element.
       */
      keydownSlot: (event: KeyboardEvent, el: HTMLElement) => {
        if (!escape(event)) {
          slotFocus.keydown(event, el);
        }
      },

      /**
       * Start following a press on a chip, which becomes a drag once it moves past the threshold.
       *
       * @param event The press.
       * @param el The chip's element.
       * @param chip The chip's identifier.
       * @param at The place it stands in.
       */
      pointerdown: (event: PointerEvent, el: HTMLElement, chip: string, at: Place) => {
        ignorePress = undefined;

        if (
          event.button !== 0 ||
          !event.isPrimary ||
          drag !== undefined ||
          (at.kind === "bank" && usedUp(store.get(), chip))
        ) {
          return;
        }

        const from = { x: event.clientX, y: event.clientY };
        let last = from;

        drag = {
          stop: bindDrag(el, event, {
            cancelOnEscape: true,
            onEnd: (end, canceled) => {
              const dragged = drag?.preview !== undefined;

              endDrag();

              if (!dragged) {
                return;
              }

              const { held } = store.get();

              store.set({
                held: held === null ? null : { dragging: false, picked: held.picked },
                over: null,
              });

              if (canceled) {
                putDown();

                return;
              }

              const over = areaAt(end.clientX, end.clientY);

              if (over !== null) {
                dropAt(over.place, { event: end, reason: "drag" }, Option.fromUndefinedOr(over.el));
              }
            },
            onMove: ({ x, y }) => {
              last = { x, y };
              drag?.preview?.move(x, y);
              drag?.scroll?.update(x, y);
              hover(x, y);
            },
            onStart: () => {
              const picked = pickUp(chip, at);

              if (picked === undefined) {
                ignorePress = { chip, from: at };

                return false;
              }

              const preview = bindDragPreview(el, from);

              preview.el.dataset["slot"] = "plate-placement-preview";

              if (drag !== undefined) {
                drag.preview = preview;
                drag.scroll = createAutoScroll({
                  ignore: () => preview.el,
                  onScroll: () => {
                    hover(last.x, last.y);
                  },
                });
              }

              store.set({ held: { dragging: true, picked } });

              return true;
            },
            threshold: event.pointerType === "mouse" ? dragThreshold : touchThreshold,
          }),
        };
      },

      /**
       * Handle a press on a target's or the bank's own area: drop the held chip there. A press on a
       * chip or slot inside is theirs.
       *
       * @param to The area's place.
       * @param event The click.
       * @param on The target part's element pressed, none for a press on the bank.
       */
      pressArea: (to: Place, event: Event, on: Option.Option<Element>) => {
        if (store.get().held !== null && missed(event, buttonParts)) {
          dropAt(to, { event, reason: "item-press" }, on);
        }
      },

      /**
       * Handle a press on a chip: pick it up; put it down if it is the one held; pick it up
       * instead if both are bank chips; else drop the held chip where this one sits.
       *
       * @param chip The chip's identifier.
       * @param at The place it stands in.
       * @param event The click.
       */
      pressChip: (chip: string, at: Place, event: Event | undefined) => {
        const { held } = store.get();

        if (
          ignorePress !== undefined &&
          ignorePress.chip === chip &&
          samePlace(ignorePress.from, at)
        ) {
          ignorePress = undefined;

          return;
        }

        if (
          held === null ||
          (at.kind === "bank" && held.picked.from.kind === "bank" && held.picked.chip !== chip)
        ) {
          pickUp(chip, at);
        } else if (held.picked.chip === chip && samePlace(held.picked.from, at)) {
          putDown();
        } else {
          dropAt(at, { event, reason: "item-press" }, Option.none());
        }
      },

      /**
       * Handle a press on the root outside every part that means something: put a held chip down.
       *
       * @param event The click.
       */
      pressOutside: (event: Event) => {
        if (missed(event, activeParts)) {
          putDown();
        }
      },

      /**
       * Handle a press on a slot: drop the held chip into its place.
       *
       * @param to The slot's place.
       * @param event The click.
       */
      pressSlot: (to: Place, event: Event | undefined) => {
        dropAt(to, { event, reason: "item-press" }, Option.none());
      },

      recovery,

      slotFocus,
    };
  },
  controlled: ["placements"],
  name: "plate-placement",
  options: {
    board: "value",
    labels: "value",
    onPlacementsChange: "callback",
    placements: "value",
  },
  slots: (slot) => ({
    bank: slot({
      attrs: (state) => ({ "data-over": flag(samePlace(state.over, bank)) }),
      on: {
        click: (event, { api }) => {
          api.pressArea(bank, event, Option.none());
        },
      },
    }),
    chip: slot<ChipProps, PlacementChipState>({
      attrs: (state, part) => {
        const { copies, dragging, picked, used } = chipState(state, part.props);

        return {
          "aria-disabled": used ? "true" : undefined,
          "aria-pressed": String(picked),
          "data-copies": flag(copies),
          "data-dragging": flag(dragging),
          "data-picked": flag(picked),
          "data-used": flag(used),
          tabindex: part.api.chipFocus.tabIndex(state, part),
          type: "button",
        };
      },
      bind: (el, part) => part.api.bindChip(el, part),
      focus: "roving",
      on: {
        contextmenu: (event) => {
          event.preventDefault();
        },
        dragstart: (event) => {
          event.preventDefault();
        },
        keydown: (event, { api, el, props }) => {
          if (el !== undefined) {
            api.keydownChip(event, el, props.value, props.at);
          }
        },
        pointerdown: (event, { api, el, props }) => {
          if (el !== undefined) {
            api.pointerdown(event, el, props.value, props.at);
          }
        },
      },
      press: ({ api, props }, event) => {
        api.pressChip(props.value, props.at, event);
      },
      props: { at: "value", id: "id", value: "string" },
      role: "button",
      state: (state, part) => chipState(state, part.props),
    }),
    message: slot<object, PlacementMessageState>({
      present: (state) => state.message !== null,
      state: (state) => ({ text: state.message ?? "" }),
    }),
    root: slot<object, PlacementRootState>({
      attrs: (state) => ({
        "data-dragging": flag(state.held !== null && state.held.dragging),
        "data-picked": flag(state.held !== null),
      }),
      bind: (el, part) => part.api.bindRoot(el),
      on: {
        click: (event, { api }) => {
          api.pressOutside(event);
        },
      },
      state: (state) => ({ held: state.held }),
    }),
    slot: slot<SlotProps>({
      attrs: (state, part) => {
        const { to } = part.props;
        const refuses = refusesHeld(state, to);
        let label: string | undefined = state.labels.bankSlot;

        if (to.kind !== "bank") {
          const name = nameOf(state, to)?.text ?? to.name;

          label = name === "" ? undefined : fillLabel(state.labels.slot, { target: name });
        }

        return {
          "aria-disabled": refuses ? "true" : undefined,
          "aria-label": label,
          "data-empty": flag(
            to.kind === "bank" ? bankEmpty(state) : chipsIn(state, to).length === 0,
          ),
          "data-full": flag(to.kind !== "bank" && showsFull(state, to)),
          "data-over": flag(samePlace(state.over, to)),
          "data-refuses": flag(refuses),
          tabindex: part.api.slotFocus.tabIndex(state, part),
          type: "button",
        };
      },
      bind: (el, part) => part.api.bindSlot(el, part),
      focus: "roving",
      on: {
        keydown: (event, { api, el }) => {
          if (el !== undefined) {
            api.keydownSlot(event, el);
          }
        },
      },
      press: ({ api, props }, event) => {
        api.pressSlot(props.to, event);
      },
      props: { id: "id", to: "value" },
      role: "button",
    }),
    target: slot<TargetProps, PlacementTargetState>({
      attrs: (state, part) => {
        const { by, spot } = part.props;
        const { empty, full, over, refuses } = targetState(state, spot);

        return {
          "aria-labelledby":
            by === "label-part" && nameOf(state, spot)?.labelled === true
              ? labelId(part.id, spot)
              : undefined,
          "data-empty": flag(empty),
          "data-full": flag(full),
          "data-over": flag(over),
          "data-refuses": flag(refuses),
        };
      },
      bind: (_el, part) => part.api.bindNamed(),
      on: {
        click: (event, { api, el, props }) => {
          api.pressArea(props.spot, event, Option.fromUndefinedOr(el));
        },
      },
      props: { by: "string", id: "id", spot: "value" },
      role: "group",
      state: (state, part) => targetState(state, part.props.spot),
    }),
    "target-label": slot<LabelProps>({
      attrs: (_state, part) => ({ id: labelId(part.id, part.props.of) }),
      bind: (_el, part) => part.api.bindNamed(),
      props: { id: "id", of: "value" },
    }),
  }),
  state: (options: PlacementOptions): State => ({
    ...arrangementOf(options),
    chipStop: null,
    held: null,
    labels: options.labels,
    message: null,
    names: [],
    over: null,
    slotStop: null,
  }),
  sync: (options) => ({ ...arrangementOf(options), labels: options.labels }),
});
