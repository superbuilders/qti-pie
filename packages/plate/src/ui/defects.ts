/**
 * The defects of plate's client parts: a part rendered outside the part whose context it reads,
 * which only a host or an island composing plate's parts wrongly can cause, never an item. Each is
 * thrown while rendering, never returned, so React's nearest error boundary shows it to the
 * developer who composed the parts. Safe to import on the server and the client: it imports only
 * `effect`'s `Data`.
 *
 * @module
 */
import { Data } from "effect";

/**
 * `useResponse` was called outside a `<Responses>`, whose entries it reads and writes: the host
 * rendered an item's islands without wrapping them in `<Responses value onChange>`.
 */
export class ResponsesMissing extends Data.TaggedError("ResponsesMissing") {
  /**
   * What was called outside what, and what to wrap it in.
   */
  override get message(): string {
    return "useResponse needs an enclosing <Responses>; render the item inside one.";
  }
}

/**
 * A `Gap` was rendered outside a `GapMatch`, whose gap texts and labels it reads: the server placed
 * a gap somewhere other than its interaction's sentence, the `children` of its `GapMatch`.
 */
export class GapOutsideGapMatch extends Data.TaggedError("GapOutsideGapMatch") {
  /**
   * Which part was misplaced, and where it belongs.
   */
  override get message(): string {
    return "A Gap needs an enclosing GapMatch; render each gap inside its interaction's children.";
  }
}

/**
 * A part of a picks group was rendered outside its `PicksGroup`, whose picks it reads: the server
 * placed an option somewhere other than inside its interaction's group.
 */
export class PickOutsidePicksGroup extends Data.TaggedError("PickOutsidePicksGroup") {
  /**
   * Which part was misplaced, and where it belongs.
   */
  override get message(): string {
    return "A PickOption or usePicks needs an enclosing PicksGroup; render each option inside its interaction's group.";
  }
}

/**
 * A chip, a slot or a target's label of the placement primitive was rendered outside both a
 * `PlacementBank` and a `PlacementTarget`, which tell it where it stands.
 */
export class PlacementPartOutside extends Data.TaggedError("PlacementPartOutside")<{
  /**
   * The part's component name, such as `PlacementChip`.
   */
  readonly part: string;
}> {
  /**
   * Which part was misplaced, and the two parts it may stand in.
   */
  override get message(): string {
    return `A ${this.part} needs an enclosing PlacementBank or PlacementTarget; render it inside one.`;
  }
}

/**
 * A part of a Position Object stage named an interaction the stage does not hold: the server
 * rendered a `PositionObject` inside a stage other than its own `qti-position-object-stage`.
 */
export class PositionObjectOffStage extends Data.TaggedError("PositionObjectOffStage")<{
  /**
   * The entry name the part was rendered with.
   */
  readonly name: string;
}> {
  /**
   * Which name the stage does not hold, and where its part belongs.
   */
  override get message(): string {
    return `No interaction of this stage posts under "${this.name}"; render each PositionObject inside its own stage.`;
  }
}

/**
 * A plate primitive was defined with no `options` schema, which UI SDK's adapters need to type its
 * options and its parts' props (`adapted` in `#plate/ui/adapted.ts`).
 */
export class PrimitiveWithoutOptions extends Data.TaggedError("PrimitiveWithoutOptions") {
  /**
   * What the primitive lacks, and where it belongs.
   */
  override get message(): string {
    return "A plate primitive needs an options schema in its definePrimitive definition.";
  }
}

/**
 * A read-aloud control was rendered outside a `ReadAloudItem`, whose session plays it: something
 * other than `<Item>`, which holds one around every control it writes, rendered the control.
 */
export class ReadAloudOutsideItem extends Data.TaggedError("ReadAloudOutsideItem") {
  /**
   * Which part was misplaced, and where it belongs.
   */
  override get message(): string {
    return "A ReadAloud needs an enclosing ReadAloudItem; render it inside <Item>, which holds one.";
  }
}

/**
 * A part of the image stage was rendered outside a `GraphicStage`, whose view it reads: an island
 * drew something meant for the overlay elsewhere.
 */
export class StagePartOutside extends Data.TaggedError("StagePartOutside") {
  /**
   * What was called outside what, and where it belongs.
   */
  override get message(): string {
    return "useGraphicStage needs an enclosing GraphicStage; render the part inside its marks.";
  }
}

/**
 * A `PlacementTargetLabel` was rendered in the bank: a label names the target it stands in, and the
 * bank is no target.
 */
export class TargetLabelInBank extends Data.TaggedError("TargetLabelInBank") {
  /**
   * Which part was misplaced, and where it belongs.
   */
  override get message(): string {
    return "A PlacementTargetLabel names its target; render it inside a PlacementTarget, not the bank.";
  }
}
