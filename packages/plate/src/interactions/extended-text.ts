/**
 * Extended Text (Q-5), the `qti-extended-text-interaction`: its model node, parse and redaction,
 * on the module shape the interaction-module contract states, with the facts of a text control it
 * shares with Text Entry (`#plate/interactions/text-entry.ts`). The QTI database judges its
 * responses (`max-strings`, `min-strings`, `pattern-mask`) when an answer is posted.
 *
 * An Extended Text shows one Control for a `single` binding and for a record one, a string control
 * whose text gives the record's fields, whatever its `max-strings` and a `min-strings` of 100 or
 * less; a `multiple` or `ordered` one shows as many as its payload counts ({@link controlsOf}),
 * every one posting under the response's one name. An `xhtml` Extended Text's response is the XHTML
 * its island writes from the text typed (`#plate/interactions/xhtml-text.ts`), a `string` plate
 * never renders as markup. Any other binding is the notice naming
 * the one it breaks, and a `format` outside `plain`, `preformatted` and `xhtml` is the notice
 * `format="…"`.
 *
 * @module
 * @see https://www.imsglobal.org/spec/qti/v3p0/info#Root_ExtendedTextInteraction
 */
import { Option } from "effect";
import { controlCap, exceedsControlCap } from "#plate/control-cap.ts";
import type { SourceElement } from "#plate/document/source.ts";
import { promptRegion } from "#plate/interactions/contract.ts";
import type {
  ByLevel,
  InteractionModule,
  ModuleInteraction,
  ModuleParseContext,
  Parsed,
} from "#plate/interactions/contract.ts";
import {
  bindText,
  textBaseTypes,
  textControlPayload,
  textFields,
  withRecords,
  writeIn,
} from "#plate/interactions/text-entry.ts";
import type { TextControlPayload, TextFields } from "#plate/interactions/text-entry.ts";
import type { Level, ModelLevel, Nodes, RedactedLevel, Unsupported } from "#plate/model/item.ts";

/**
 * Extended Text's identifier in the QTI 3.0 conformance list, Appendix A.
 */
const feature = "Q-5";

/**
 * The QTI element Extended Text is read from.
 */
const element = "qti-extended-text-interaction";

/**
 * The binding Extended Text renders with besides a record: "The qti-extended-text-interaction must
 * be bound to a response variable of single, multiple, ordered or record cardinality. [...]
 * Otherwise it must have a base-type of string, integer or float" (section 5.48).
 */
const binding = {
  baseTypes: textBaseTypes,
  cardinalities: ["single", "multiple", "ordered"],
} as const;

/**
 * The `format`s Extended Text renders with, TextFormatEnum's three values; an absent `format` is
 * `plain`, the XSD's default.
 */
const formats = ["plain", "preformatted", "xhtml"] as const;

/**
 * A `qti-extended-text-interaction` (Q-5): a Text Entry's fields, its prompt, `expected-lines`, a
 * `format` of `plain` (the default), `preformatted` or `xhtml`, and its binding's cardinality with
 * `max-strings` and `min-strings`.
 *
 * @template L The level of its content.
 */
export interface ExtendedTextInteraction<L extends Level = ModelLevel>
  extends TextFields, ModuleInteraction<"extended-text"> {
  /**
   * The bound response's cardinality: `single`; a container, `multiple` or `ordered`, whose
   * strings each take a Control of their own; or `record` for a record response, whose fields the
   * typed text gives.
   */
  readonly cardinality: "multiple" | "ordered" | "record" | "single";
  /**
   * `expected-lines`: a count, held exactly, with no upper bound.
   */
  readonly expectedLines: Option.Option<bigint>;
  readonly format: (typeof formats)[number];
  /**
   * `max-strings`: a count, held exactly, with no upper bound (reading 46 does not list it). `0`
   * restricts nothing, as `max-choices` reads it (reading 53).
   */
  readonly maxStrings: Option.Option<bigint>;
  /**
   * `min-strings`, 0 when absent: a count, held exactly, with no upper bound. One above 100 shows
   * the notice `min-strings>100` in place of the Controls.
   */
  readonly minStrings: bigint;
  readonly prompt: Option.Option<Nodes<L>>;
}

/**
 * An Extended Text's model node at each level.
 */
interface ExtendedTextByLevel extends ByLevel {
  readonly node: ExtendedTextInteraction<this["level"]>;
}

/**
 * An Extended Text as the page may know it: a text control with `expected-lines`, a `format`, a
 * Prompt, its binding's cardinality, and its `n` Controls with the text each restores, or the
 * notice that stands in their place.
 */
export interface ExtendedTextPayload extends TextControlPayload {
  /**
   * How many boxes its island shows: `shown` for a response holding no more strings than that, and
   * one box per string up to `most` for one holding more. A `single` or `record` binding shows one
   * box, and at most one. A container shows `max-strings` boxes when it is from 1 to 10, else the
   * greater of 10 and `min-strings`, and `most` is `max-strings` when it is not 0, else 100; both
   * at most 100 (reading 53), and both 0 when `min-strings` exceeds 100.
   */
  readonly boxes: { readonly most: number; readonly shown: number };
  readonly cardinality: ExtendedTextInteraction["cardinality"];
  readonly expectedLines: Option.Option<bigint>;
  readonly format: ExtendedTextInteraction["format"];
  /**
   * The number of Controls: 1 for a `single` or a `record` binding; for a container,
   * `max-strings` when it is from 1 to 10, else the greater of 10 and `min-strings`, so
   * `max-strings="0"` and an absent one give at least 10 (reading 53). It also covers every member
   * of the value it restores, up to a nonzero `max-strings`. At most 100, and 0 when
   * `min-strings` exceeds 100.
   */
  readonly n: number;
  /**
   * The cap's notice's feature, `min-strings>100`: in place of the Controls when
   * `min-strings` exceeds 100, `n` then 0, or beside the first 100 Controls when the value restored
   * holds more members than they do; none otherwise.
   */
  readonly notice: Option.Option<string>;
  readonly prompt: Option.Option<Nodes<RedactedLevel>>;
  /**
   * The text each Control shows, one per Control in order: the view's values, each written as a
   * Text Entry writes one (`writeIn` in `#plate/interactions/text-entry.ts`); empty for a Control
   * with none.
   */
  readonly restores: readonly string[];
}

/**
 * The number of Controls a container renders when `max-strings` does not fix it.
 */
const defaultControls = 10n;

/**
 * Give the larger of two counts.
 *
 * @param left One count.
 * @param right The other.
 * @returns The larger.
 */
const larger = (left: bigint, right: bigint): bigint => (left > right ? left : right);

/**
 * Give the smaller of two counts.
 *
 * @param left One count.
 * @param right The other.
 * @returns The smaller.
 */
const smaller = (left: bigint, right: bigint): bigint => (left < right ? left : right);

/**
 * How many Controls an Extended Text renders, the boxes its island shows, and whether the cap's
 * notice shows.
 */
interface Controls {
  readonly boxes: ExtendedTextPayload["boxes"];
  readonly n: number;
  /**
   * Whether the cap of 100 Controls holds back what the item or its value asks for: `min-strings`
   * above 100, or a value with more members than 100 Controls hold.
   */
  readonly overCap: boolean;
}

/**
 * Count the Controls an Extended Text renders.
 *
 * A `single` binding and a record one have one Control, the string control a record's text is
 * typed in. A container has `max-strings` Controls when it is from 1 to 10, else the greater of 10
 * and `min-strings`; `max-strings="0"` restricts nothing (reading 53). So restoring drops no
 * answer silently, `n` also covers each member the restored value holds, up to `max-strings` when
 * it restricts and up to the cap of 100. Over the cap, the first 100 show beside the cap's notice;
 * a `min-strings` above 100 leaves no Control, the notice in their place, for any binding.
 *
 * The island's boxes are the same count before any value: `shown` is the Controls `max-strings`
 * or `min-strings` asks for, and `most` is `max-strings` when it restricts, else the cap.
 *
 * @param interaction The Extended Text.
 * @param members How many members the value to restore holds.
 * @returns The count, from 0 to 100, the island's boxes, and whether the cap's notice shows.
 */
const controlsOf = (interaction: ExtendedTextInteraction, members: number): Controls => {
  if (exceedsControlCap(interaction.minStrings)) {
    return { boxes: { most: 0, shown: 0 }, n: 0, overCap: true };
  }

  if (interaction.cardinality === "single" || interaction.cardinality === "record") {
    return { boxes: { most: 1, shown: 1 }, n: 1, overCap: false };
  }

  const limit = interaction.maxStrings.pipe(Option.filter((maxStrings) => maxStrings > 0n));
  const asked = Option.getOrElse(
    limit.pipe(Option.filter((maxStrings) => maxStrings <= defaultControls)),
    () => larger(defaultControls, interaction.minStrings),
  );
  const held = Option.match(limit, {
    onNone: () => BigInt(members),
    onSome: (maxStrings) => smaller(BigInt(members), maxStrings),
  });
  const cap = controlCap.when.limit;
  const most = Option.getOrElse(limit, () => cap);

  return {
    boxes: { most: Number(smaller(most, cap)), shown: Number(smaller(asked, cap)) },
    n: Number(larger(asked, smaller(held, cap))),
    overCap: held > cap,
  };
};

/**
 * Read a `qti-extended-text-interaction`: its binding (`bindText` in
 * `#plate/interactions/text-entry.ts`), its `format`, the fields every text control holds, its
 * counts and its Prompt. A `min-strings` above 100 is still built, and its feature is recorded as
 * a notice that stands in place of the Controls (the vocabulary's `modelled.controlNotices`).
 *
 * The body walk has bound it to a record or to a string, integer or float response of single,
 * multiple or ordered cardinality, and given the notice of a feature of the vocabulary's
 * `modelled.notices` it carries, such as `pattern-mask`. The interaction is the notice
 * `format="…"` for a `format` it does not render.
 *
 * @param source The `qti-extended-text-interaction` element.
 * @param context What the body walk hands a module: the path, the notice, the kit and the
 *   declaration.
 * @param context.bound The declaration it is bound to.
 * @param context.notice Replace the element by its notice.
 * @param context.path The element's path.
 * @param context.read The kit the element is read with.
 * @returns The Extended Text, its notice.
 */
const parse = (
  source: SourceElement,
  { bound, notice, path, read }: ModuleParseContext,
): Parsed<ExtendedTextInteraction> | Unsupported => {
  const { baseType, cardinality } = bindText(binding, bound);
  const writtenFormat = Option.getOrElse(read.valueOf(source, "format"), () => "plain");
  const format = formats.find((value) => value === writtenFormat);
  if (format === undefined) {
    return notice(`format="${writtenFormat}"`);
  }

  read.markElement(source);

  const fields = textFields(read, source, path, baseType);
  const expectedLines = read.countAttribute(source, "expected-lines");
  const maxStrings = read.countAttribute(source, "max-strings");
  const minStrings = read.countAttribute(source, "min-strings");
  read.controlNotices(source);

  const prompt = read.content(source, "qti-prompt");

  return {
    ...fields,
    cardinality,
    expectedLines,
    format,
    kind: "extended-text",
    maxStrings,
    minStrings: Option.getOrElse(minStrings, () => 0n),
    prompt,
  } satisfies Parsed<ExtendedTextInteraction>;
};

/**
 * The Extended Text module (Q-5, the kind `extended-text`).
 */
export const extendedTextModule: InteractionModule<
  "extended-text",
  ExtendedTextByLevel,
  ExtendedTextPayload
> = {
  binding: withRecords(binding),
  element,
  feature,
  /**
   * The Extended Text with its Prompt's content emptied.
   */
  hollow: (interaction) => ({
    ...interaction,
    prompt: interaction.prompt.pipe(Option.map(() => [])),
  }),
  kind: "extended-text",
  parse,
  /**
   * Copy the Extended Text into its payload node: `n` Controls ({@link controlsOf}), each
   * restoring the view's value at its place written in the control's `base`, and the cap's notice
   * when the cap holds back what the item or its value asks for.
   */
  redact: (interaction, kit) => {
    const entries = kit
      .shown(interaction.response)
      .map((single) => writeIn(single, interaction.base));
    const { boxes, n, overCap } = controlsOf(interaction, entries.length);

    return {
      ...textControlPayload(interaction, kit),
      boxes,
      cardinality: interaction.cardinality,
      expectedLines: interaction.expectedLines,
      format: interaction.format,
      n,
      notice: overCap ? Option.some(controlCap.feature) : Option.none(),
      prompt: interaction.prompt,
      restores: Array.from({ length: n }, (_, index) => entries[index] ?? ""),
    };
  },
  /**
   * The regions of the Extended Text's own content: its Prompt.
   */
  regions: promptRegion,
};
