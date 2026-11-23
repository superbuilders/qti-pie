"use client";

/**
 * The placement primitive's React parts, which an island composes: a root, a bank of chips, and
 * targets that hold chips and slots, anywhere inside the root, a server-rendered sentence's gaps
 * included, since a part finds its root through React context. The primitive stands under every
 * interaction that moves things: match, gap match and order, associate's boxes of pairs, and the
 * graphic kinds, whose targets or chips may be an image's hotspots. Its pure machine
 * (`#plate/placement/machine.ts`) decides what a child may do; these parts take a tap, a drag or
 * a key and say what happened.
 *
 * An island renders a {@link PlacementRoot} with the interaction's board, the placements its
 * response holds and the labels the server gave it, and inside it a {@link PlacementBank} of
 * {@link PlacementChip}s and a {@link PlacementTarget} per target. Each target holds its placed
 * chips and, where a child can put one, a {@link PlacementSlot}; a {@link PlacementMessage} shows
 * the latest refusal. The bank and each target tell the chips and slots inside them where they
 * stand. UI SDK writes every part's `data-slot`, ARIA and state attributes; no part takes a class
 * or a style of its own.
 *
 * - {@link PlacementRoot}, `plate-placement`: the interaction's state, with `data-picked` while a
 *   chip is held and `data-dragging` while one is dragged.
 * - {@link PlacementBank}, `plate-placement-bank`: where chips start and come back to, with
 *   `data-over` while a drag is over it, in its `plate-placement-dock`, the box a theme pins.
 * - {@link PlacementTarget}, `plate-placement-target`: one target or position, a `group` named by its
 *   label part or its caller's `aria-label`, with `data-over`, `data-empty`, `data-full` and
 *   `data-refuses`.
 * - {@link PlacementTargetLabel}, `plate-placement-target-label`: a target's visible name.
 * - {@link PlacementSlot}, `plate-placement-slot`: the button that puts the held chip in its target,
 *   or back in the bank, with its target's attributes and its own name from the `slot` or
 *   `bankSlot` label.
 * - {@link PlacementChip}, `plate-placement-chip`: a chip, a toggle button pressed while held, with
 *   `data-picked`, `data-dragging`, and in the bank `data-copies` and `data-used`.
 * - {@link PlacementMessage}, `plate-placement-message`: the latest refusal, as it was announced.
 *
 * The copy a drag shows is `data-slot="plate-placement-preview"`, with `data-over` and
 * `data-refuses` for the place under it.
 *
 * @module
 * @see https://ui-sdk.dev/docs/react/rendering
 */
import { createParts } from "@ui-sdk/react/primitive";
import type { PartProps } from "@ui-sdk/react/primitive";
import { createContext, use, useMemo } from "react";
import { adapted } from "#plate/ui/adapted.ts";
import { BankCaption } from "#plate/ui/placement/caption.tsx";
import { PlacementPartOutside, TargetLabelInBank } from "#plate/ui/defects.ts";
import { bank } from "#plate/placement/machine.ts";
import type { Bank, Spot } from "#plate/placement/machine.ts";
import { placement } from "#plate/ui/placement/primitive.ts";
import type {
  NamedSpot,
  PlacementChipState,
  PlacementMessageState,
  PlacementOptions,
  PlacementRootState,
  PlacementTargetState,
  TargetName,
} from "#plate/ui/placement/primitive.ts";

/**
 * A part's element props with an `id` that is a string when given: UI SDK keys a part by its `id`,
 * which `exactOptionalPropertyTypes` holds apart from React's `string | undefined`.
 */
type WithId<Props> = Omit<Props, "id"> & { readonly id?: string };

/**
 * Where the chips and slots inside a part stand: the bank, or a target, position or half with the
 * name that names its slot.
 */
type Standing = Bank | NamedSpot;

/**
 * The place the enclosing bank or target gives the parts inside it; undefined outside both.
 */
const StandingContext = createContext<Standing | undefined>(undefined);

/**
 * The parts UI SDK makes from the primitive, one per tagged slot.
 */
const parts = createParts(adapted(placement), {
  bank: "div",
  chip: "button",
  message: "p",
  root: "div",
  slot: "button",
  target: "div",
  "target-label": "div",
});

/**
 * Read where the enclosing bank or target says a part stands.
 *
 * @param part The part's component name, for the error.
 * @returns The standing.
 * @throws {PlacementPartOutside} When the part is rendered outside both a bank and a target.
 */
const useStanding = (part: string): Standing => {
  const standing = use(StandingContext);

  if (standing === undefined) {
    throw new PlacementPartOutside({ part });
  }

  return standing;
};

/**
 * Render the interaction's root, which holds the primitive's state for every part inside it.
 *
 * @param props The {@link PlacementOptions} and the root `div`'s props; its `className`, `style`
 *   and `children` may be functions of {@link PlacementRootState}.
 * @returns The root.
 */
export const PlacementRoot = (
  props: PlacementOptions &
    WithId<Omit<PartProps<"div", PlacementRootState>, keyof PlacementOptions>>,
) => <parts.Root {...props} />;

/**
 * Render the bank, where chips start and where a drop or a tap returns a placed chip, inside its
 * dock, under its caption where it has one.
 *
 * The dock, `plate-placement-dock`, is a plain `div` around the bank and its caption and nothing
 * else, the box a theme pins to the screen while the child answers: a sticky box can style what is
 * inside it by whether it is stuck (`container-type: scroll-state`), never itself, so with the bank
 * as the sticky box a theme could not cap the pinned tray only while it is pinned. The bank stays
 * the chips' parent, the tray and the place a drop lands in; the dock takes no press and no drop.
 *
 * @param props.caption The words over the bank ({@link BankCaption}), undefined for none.
 * @param props The bank `div`'s other props.
 * @returns The bank in its dock.
 */
export const PlacementBank = (
  props: { readonly caption?: string | undefined } & WithId<PartProps<"div">>,
) => {
  const { caption, ...rest } = props;

  return (
    <div data-slot="plate-placement-dock">
      <BankCaption caption={caption} />
      <StandingContext value={bank}>
        <parts.Bank {...rest} />
      </StandingContext>
    </div>
  );
};

/**
 * Render a target, a sequence's position, or a half of a box, named as its {@link TargetName} says:
 * by its {@link PlacementTargetLabel}, or by an `aria-label` in place of one. Its slot is named by
 * the name's text from the server's render on, so no slot is a button without a name. An inline gap
 * renders a `span` through `render`, an order position an `li`, and an image's hotspot an SVG shape
 * inside the image's overlay, which a drop finds by the shape it draws when the shape alone takes
 * the pointer.
 *
 * @param props.name How the target is named.
 * @param props.spot The target, position or half, from the board.
 * @param props.children The target's content: its label, its placed chips and its slot, or a
 *   function of {@link PlacementTargetState} that renders them.
 * @param props The target `div`'s other props.
 * @returns The target.
 */
export const PlacementTarget = (
  props: { readonly name: TargetName; readonly spot: Spot } & WithId<
    Omit<PartProps<"div", PlacementTargetState>, "aria-label" | "aria-labelledby">
  >,
) => {
  const { name, spot, ...rest } = props;
  const { by, text } = name;
  const standing = useMemo((): Standing => ({ ...spot, name: text }), [spot, text]);

  return (
    <StandingContext value={standing}>
      <parts.Target
        {...rest}
        {...(by === "aria-label" ? { "aria-label": text } : {})}
        by={by}
        spot={spot}
      />
    </StandingContext>
  );
};

/**
 * Render a target's visible name, inside its target.
 *
 * @param props The label `div`'s props.
 * @returns The label.
 * @throws {PlacementPartOutside} When it is rendered outside both a bank and a target.
 * @throws {TargetLabelInBank} When it is rendered in the bank rather than a
 *   {@link PlacementTarget}.
 */
export const PlacementTargetLabel = (props: Omit<PartProps<"div">, "id">) => {
  const place = useStanding("PlacementTargetLabel");

  if (place.kind === "bank") {
    throw new TargetLabelInBank();
  }

  return <parts.TargetLabel {...props} of={place} />;
};

/**
 * Render a slot: in a target, the button that puts the held chip there; in the bank, the button
 * that puts a placed chip back. A caller's `aria-label` replaces its own.
 *
 * @param props The slot `button`'s props.
 * @returns The slot.
 * @throws {PlacementPartOutside} When it is rendered outside both a bank and a target.
 */
export const PlacementSlot = (props: Omit<PartProps<"button">, "id">) => (
  <parts.Slot {...props} to={useStanding("PlacementSlot")} />
);

/**
 * Render a chip, in the bank or in the target around it: one per bank chip, kept when used up as a
 * placeholder, and one per placement in its target.
 *
 * @param props.value The chip's identifier, from the board.
 * @param props.children The chip's content, or a function of {@link PlacementChipState} that
 *   renders it.
 * @param props The chip `button`'s other props.
 * @returns The chip.
 * @throws {PlacementPartOutside} When it is rendered outside both a bank and a target.
 */
export const PlacementChip = (
  props: { readonly value: string } & Omit<PartProps<"button", PlacementChipState>, "id" | "value">,
) => {
  const place = useStanding("PlacementChip");

  return <parts.Chip {...props} at={place} />;
};

/**
 * Render the latest refusal's text, as it was announced, until the next step that goes through.
 *
 * @param props The message `p`'s props.
 * @returns The message, or nothing while there is none.
 */
export const PlacementMessage = (
  props: WithId<Omit<PartProps<"p", PlacementMessageState>, "children">>,
) => <parts.Message {...props}>{(state) => state.text}</parts.Message>;
