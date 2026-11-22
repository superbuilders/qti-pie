/**
 * Text Entry (Q-20), the `qti-text-entry-interaction`: its model node, parse and redaction, on the
 * module shape the interaction-module contract states, and the facts of a text control it shares
 * with Extended Text (`#plate/interactions/extended-text.ts`). The QTI database judges its
 * responses (its `pattern-mask` among them) when an answer is posted.
 *
 * A Text Entry binds a single `string`, `integer` or `float` response, or a record response, which
 * makes it a string control: the text typed gives the record's fields. Any other binding is the
 * notice naming the one it breaks, and a `pattern-mask` the translator refuses is the notice
 * `pattern-mask` (the vocabulary's `modelled.notices`).
 *
 * @module
 * @see https://www.imsglobal.org/spec/qti/v3p0/info#Root_TextEntryInteraction
 */
import { Option } from "effect";
import type { SourceElement } from "#plate/document/source.ts";
import { boundIn } from "#plate/interactions/contract.ts";
import type {
  BoundDeclaration,
  InteractionModule,
  LevelFree,
  ModuleBinding,
  ModuleInteraction,
  ModuleParseContext,
  Parsed,
  ReaderKit,
  RedactKit,
} from "#plate/interactions/contract.ts";
import { format } from "#plate/model/values.ts";
import type { Single } from "#plate/model/values.ts";
import type { BaseType, Cardinality } from "#plate/vocabulary.ts";

/**
 * Text Entry's identifier in the QTI 3.0 conformance list, Appendix A.
 */
const feature = "Q-20";

/**
 * The QTI element Text Entry is read from.
 */
const element = "qti-text-entry-interaction";

/**
 * The base types a text control binds besides a record: "If the response variable has single
 * cardinality the base-type must be one of string, integer or float" (section 5.162).
 */
export const textBaseTypes = ["string", "integer", "float"] as const;

/**
 * The binding Text Entry renders with besides a record: a single string, integer or float. "The
 * textEntryInteraction must be bound to a response variable with single or record cardinality
 * only" (section 5.162).
 */
const binding = { baseTypes: textBaseTypes, cardinalities: ["single"] } as const;

/**
 * Give the binding a text interaction renders with: its own, and any record response, whose
 * fields the text typed gives ({@link bindText}).
 *
 * @param textBinding The base types and cardinalities it renders with besides a record.
 * @returns The binding the body walk judges its declaration by.
 */
export const withRecords = (textBinding: {
  readonly baseTypes: readonly BaseType[];
  readonly cardinalities: readonly Cardinality[];
}): ModuleBinding => ({
  baseTypes: textBinding.baseTypes,
  cardinalities: [...textBinding.cardinalities, "record"],
});

/**
 * A `qti-text-entry-interaction` (Q-20), bound to a single `string`, `integer` or `float` response,
 * or to a record response.
 */
export interface TextEntryInteraction extends ModuleInteraction<"text-entry"> {
  /**
   * The number base of an integer response, `base`, an `xs:int`, 10 when absent.
   */
  readonly base: number;
  /**
   * The bound response's base type; `string` for a record response, which has none of its own.
   */
  readonly baseType: "float" | "integer" | "string";
  /**
   * The bound response's cardinality: `single`, or `record` for a record response, whose fields
   * the typed text gives.
   */
  readonly cardinality: "record" | "single";
  /**
   * The author's `class`, as written, none when absent.
   */
  readonly class: Option.Option<string>;
  /**
   * `expected-length`: a count, held exactly, with no upper bound.
   */
  readonly expectedLength: Option.Option<bigint>;
  /**
   * `pattern-mask`, as written: an XML Schema regular expression the response must match, which
   * the translator takes. An interaction whose pattern the translator refuses is not built; it is
   * the notice `pattern-mask`.
   */
  readonly patternMask: Option.Option<string>;
  /**
   * The author's replacement for the pattern-mask message, `data-patternmask-message`.
   */
  readonly patternMaskMessage: Option.Option<string>;
  /**
   * `placeholder-text`.
   */
  readonly placeholder: Option.Option<string>;
}

/**
 * The fields of a text control's model node that Text Entry and Extended Text share: all of a Text
 * Entry's but its kind, its cardinality, and the fields the body walk sets.
 */
export type TextFields = Omit<
  TextEntryInteraction,
  "cardinality" | "catalog" | "data" | "id" | "kind" | "promptCatalog"
>;

/**
 * What a Text Entry and an Extended Text share as the page may know them: the author's names, the
 * binding, the integer `base`, the placeholder and the entry name.
 */
export interface TextControlPayload {
  /**
   * The author's `aria-label`, as written, which names the Control when nothing before it does.
   * The server shell decides which name a page writes, and which control plate names.
   */
  readonly ariaLabel: Option.Option<string>;
  /**
   * The author's `aria-labelledby`, as written, which names the Control when nothing before it
   * does.
   */
  readonly ariaLabelledby: Option.Option<string>;
  readonly base: number;
  readonly baseType: "float" | "integer" | "string";
  /**
   * The author's `class`, as written, none when absent.
   */
  readonly class: Option.Option<string>;
  /**
   * The name its Control posts under, `entryName(instance, response)`.
   */
  readonly formName: string;
  /**
   * `placeholder-text`.
   */
  readonly placeholder: Option.Option<string>;
  /**
   * The identifier of the response it binds.
   */
  readonly response: string;
}

/**
 * A Text Entry as the page may know it.
 */
export interface TextEntryPayload extends TextControlPayload {
  readonly expectedLength: Option.Option<bigint>;
  /**
   * The text the Control shows: the view's value written in its lexical form, an integer in
   * `base`; empty for NULL.
   */
  readonly restore: string;
}

/**
 * Write a value as the text a text control shows, and a review writes as a text control's right
 * answer.
 *
 * An integer is written in the control's `base`, the base its posted text is read in, so a
 * restored value posts back unchanged. A base outside 2 to 36, which no posted text can be read in,
 * writes base 10.
 *
 * @param single The value.
 * @param base The control's number base.
 * @returns The value's text.
 */
export const writeIn = (single: Single, base: number): string =>
  single.baseType === "integer" && Number.isInteger(base) && base >= 2 && base <= 36
    ? single.value.toString(base)
    : format(single);

/**
 * Give the base type and cardinality a Text Entry or an Extended Text is bound to: a record
 * response as the string control of cardinality `record`, since a record has no base type of its
 * own and the text typed gives its fields; any other response as its binding narrows it
 * (`boundIn` in `#plate/interactions/contract.ts`). The body walk has judged the declaration by
 * the interaction's binding with records ({@link withRecords}).
 *
 * @template C The cardinalities the interaction renders with besides `record`.
 * @param textBinding The base types and cardinalities the interaction renders with otherwise.
 * @param declaration The declaration it is bound to.
 * @returns The bound base type and cardinality.
 */
export const bindText = <const C extends "multiple" | "ordered" | "single">(
  textBinding: {
    readonly baseTypes: readonly TextEntryInteraction["baseType"][];
    readonly cardinalities: readonly C[];
  },
  declaration: BoundDeclaration,
): { readonly baseType: TextEntryInteraction["baseType"]; readonly cardinality: C | "record" } =>
  declaration.cardinality === "record"
    ? { baseType: "string", cardinality: "record" }
    : boundIn(textBinding, declaration);

/**
 * Read the fields Text Entry and Extended Text share.
 *
 * @param read The kit the interaction is read with.
 * @param source The interaction.
 * @param path The interaction's path.
 * @param baseType The bound base type.
 * @returns The fields.
 */
export const textFields = (
  read: ReaderKit,
  source: SourceElement,
  path: string,
  baseType: TextEntryInteraction["baseType"],
): TextFields => {
  const base = read.xsInt(source, "base");

  return {
    ariaLabel: read.valueOf(source, "aria-label"),
    ariaLabelledby: read.valueOf(source, "aria-labelledby"),
    base: Option.getOrElse(base, () => 10),
    baseType,
    class: read.valueOf(source, "class"),
    expectedLength: read.countAttribute(source, "expected-length"),
    path,
    patternMask: read.valueOf(source, "pattern-mask"),
    patternMaskMessage: read.valueOf(source, "data-patternmask-message"),
    placeholder: read.valueOf(source, "placeholder-text"),
    response: read.identifierAttribute(source, "response-identifier"),
  };
};

/**
 * Copy the fields a Text Entry and an Extended Text share into their payload node.
 *
 * @param interaction The text control.
 * @param kit The view's facts the payload hands a module.
 * @returns The shared fields.
 */
export const textControlPayload = (
  interaction: TextFields,
  kit: RedactKit,
): TextControlPayload => ({
  ariaLabel: interaction.ariaLabel,
  ariaLabelledby: interaction.ariaLabelledby,
  base: interaction.base,
  baseType: interaction.baseType,
  class: interaction.class,
  formName: kit.formName(interaction.response),
  placeholder: interaction.placeholder,
  response: interaction.response,
});

/**
 * Read a `qti-text-entry-interaction`: its binding ({@link bindText}), then the fields every text
 * control holds ({@link textFields}).
 *
 * The body walk has bound it to a record or to a single string, integer or float response, and
 * given the notice of a feature of the vocabulary's `modelled.notices` it carries, such as
 * `pattern-mask` for a pattern the translator refuses.
 *
 * @param source The `qti-text-entry-interaction` element.
 * @param context What the body walk hands a module: the path, the kit and the declaration.
 * @param context.bound The declaration it is bound to.
 * @param context.path The element's path.
 * @param context.read The kit the element is read with.
 * @returns The Text Entry.
 */
const parse = (
  source: SourceElement,
  { bound, path, read }: ModuleParseContext,
): Parsed<TextEntryInteraction> => {
  const { baseType, cardinality } = bindText(binding, bound);
  read.markElement(source);

  const fields = textFields(read, source, path, baseType);

  return {
    ...fields,
    cardinality,
    kind: "text-entry",
  } satisfies Parsed<TextEntryInteraction>;
};

/**
 * The Text Entry module (Q-20, the kind `text-entry`).
 */
export const textEntryModule: InteractionModule<
  "text-entry",
  LevelFree<TextEntryInteraction>,
  TextEntryPayload
> = {
  binding: withRecords(binding),
  element,
  feature,
  /**
   * The Text Entry itself, which holds no content.
   */
  hollow: (interaction) => interaction,
  kind: "text-entry",
  parse,
  /**
   * Copy the Text Entry into its payload node: the fields every text control shares, its
   * `expected-length`, and the view's value written in its lexical form, an integer in `base`.
   */
  redact: (interaction, kit) => ({
    ...textControlPayload(interaction, kit),
    expectedLength: interaction.expectedLength,
    restore: Option.match(Option.fromUndefinedOr(kit.shown(interaction.response)[0]), {
      onNone: () => "",
      onSome: (single) => writeIn(single, interaction.base),
    }),
  }),
  /**
   * No region: a Text Entry holds no content of its own.
   */
  regions: () => [],
};
