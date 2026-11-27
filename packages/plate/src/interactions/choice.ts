/**
 * Choice (Q-2), the `qti-choice-interaction`: its model node, parse and redaction, on the module
 * shape the interaction-module contract states.
 *
 * A Choice binds an identifier response of `single` or `multiple` cardinality; any other binding is
 * the notice naming the one it breaks. The model keeps its choices in document order whatever
 * `shuffle` says; {@link choiceModule}'s `redact` presents a shuffled Choice's choices in the
 * seeded order, each fixed choice at its own place ({@link choiceOrder}), and the server shell
 * renders the payload node (`#plate/ui/item/interactions/`). A choice the template variable it
 * names hides (`template-identifier` and `show-hide`) is decided by the redaction through its
 * region ({@link simpleChoiceRegions}), so a hidden choice is not presented and a response that
 * names it is refused as an unknown choice. Its node is generic in the level of its content, as
 * the interaction-module contract (`#plate/interactions/contract.ts`) explains. Inline Choice reads
 * its choices and presents them through the same functions.
 *
 * @module
 * @see https://www.imsglobal.org/spec/qti/v3p0/info#Root_ChoiceInteraction
 */
import { Option } from "effect";
import type { SourceElement } from "#plate/document/source.ts";
import { boundIn, choiceRegions, promptRegion } from "#plate/interactions/contract.ts";
import type {
  ByLevel,
  InteractionModule,
  ModuleInteraction,
  ModuleParseContext,
  OwnRegion,
  Parsed,
  ReaderKit,
} from "#plate/interactions/contract.ts";
import type {
  BodyNode,
  Level,
  ModelLevel,
  Nodes,
  RedactedLevel,
  ReferencingChoice,
  SimpleChoice,
} from "#plate/model/item.ts";
import { shadeOf } from "#plate/interactions/plot-roles.ts";
import type { ShadeDirection } from "#plate/interactions/plot-roles.ts";
import { format } from "#plate/model/values.ts";
import type { Declared } from "#plate/model/values.ts";
import { presentedOrder } from "#plate/shuffle.ts";

/**
 * Choice's identifier in the QTI 3.0 conformance list, Appendix A.
 */
const feature = "Q-2";

/**
 * The QTI element Choice is read from.
 */
const element = "qti-choice-interaction";

/**
 * The binding Choice renders with: "The ChoiceInteraction must be bound to a response variable
 * with a base-type of identifier and single or multiple cardinality" (section 5.30).
 */
const binding = { baseTypes: ["identifier"], cardinalities: ["single", "multiple"] } as const;

/**
 * A `qti-choice-interaction` (Q-2), bound to an identifier response of single or multiple
 * cardinality. The model keeps its choices in document order whatever `shuffle` says; the payload
 * presents a shuffled Choice's choices in the seeded order, each fixed choice at its own place.
 *
 * @template L The level of its content.
 */
export interface ChoiceInteraction<
  L extends Level = ModelLevel,
> extends ModuleInteraction<"choice"> {
  readonly cardinality: "multiple" | "single";
  readonly choices: readonly SimpleChoice<L>[];
  /**
   * The author's `class`, as written, none when absent.
   */
  readonly class: Option.Option<string>;
  /**
   * `max-choices`, 1 when absent: a count, 0 to 2^63-1, held exactly (reading `count-range`).
   */
  readonly maxChoices: bigint;
  /**
   * The author's replacements for the too-many and too-few messages,
   * `data-max-selections-message` and `data-min-selections-message`.
   */
  readonly messages: { readonly max: Option.Option<string>; readonly min: Option.Option<string> };
  /**
   * `min-choices`, 0 when absent: a count, 0 to 2^63-1, held exactly (reading `count-range`).
   */
  readonly minChoices: bigint;
  /**
   * `orientation`, a rendering hint, `vertical` when absent, the XSD's default
   * (`ChoiceInteractionDType`).
   */
  readonly orientation: "horizontal" | "vertical";
  readonly prompt: Option.Option<Nodes<L>>;
  /**
   * The choices whose class names a way a number line's ray runs, `plate-shade-left` or
   * `plate-shade-right` (`shadeOf` in `#plate/interactions/plot-roles.ts`), in document order:
   * what a Graphic Gap Match drawn as a number line reads of the item's shading interaction (R7).
   * Empty for every other Choice.
   */
  readonly shades: readonly { readonly direction: ShadeDirection; readonly identifier: string }[];
  readonly shuffle: boolean;
}

/**
 * A Choice's model node at each level.
 */
export interface ChoiceByLevel extends ByLevel {
  readonly node: ChoiceInteraction<this["level"]>;
}

/**
 * A Choice as the page may know it: its binding, its constraints, its Prompt, its choices in the
 * order they are presented, and the identifiers to show as checked.
 */
export interface ChoicePayload {
  /**
   * The author's `aria-label`, which names the group when there is no Prompt.
   */
  readonly ariaLabel: Option.Option<string>;
  /**
   * The author's `aria-labelledby`, as written, which names the group when there is no Prompt.
   */
  readonly ariaLabelledby: Option.Option<string>;
  readonly cardinality: "multiple" | "single";
  /**
   * The choices in presented order: for a Choice with `shuffle` true, the order the view's seed,
   * the instance and the response key, each fixed choice at its document position; else document
   * order. Each carries the catalog it references, none where it references none.
   */
  readonly choices: readonly (ReferencingChoice & { readonly content: Nodes<RedactedLevel> })[];
  /**
   * The author's `class`, as written, none when absent.
   */
  readonly class: Option.Option<string>;
  /**
   * The response its island writes, as its declaration types it: an `identifier` response of the
   * Choice's cardinality.
   */
  readonly declared: Declared<"identifier", "multiple" | "single">;
  readonly maxChoices: bigint;
  /**
   * `orientation`, a rendering hint, `vertical` when absent, the XSD's default
   * (`ChoiceInteractionDType`).
   */
  readonly orientation: "horizontal" | "vertical";
  readonly prompt: Option.Option<Nodes<RedactedLevel>>;
  /**
   * The identifier of the response it binds.
   */
  readonly response: string;
  readonly restore: readonly string[];
}

/**
 * The values of a Choice's `orientation`, a string enumeration in the XSD.
 */
const orientations = ["horizontal", "vertical"] as const;

/**
 * Read a choice of a Choice or an Inline Choice, a `qti-simple-choice` or a `qti-inline-choice`,
 * with the marks it carries as a body element: its identifier, its `fixed`, an `xs:boolean` false
 * when absent, the catalog it references (its `data-catalog-idref`, recorded before its content's
 * so the references stay in document order), its content, and its `template-identifier` with its
 * `show-hide`, `show` when absent. A choice with no `template-identifier` has no template
 * visibility, whatever its `show-hide`.
 *
 * @param read The kit the interaction is read with.
 * @param choice The choice.
 * @returns The choice.
 */
export const simpleChoiceOf = (read: ReaderKit, choice: SourceElement): SimpleChoice => {
  read.markElement(choice);

  const identifier = read.identifierAttribute(choice, "identifier");
  const fixed = read.xsBoolean(choice, "fixed", false);
  const templateVisibility = read.templateVisibility(choice);
  const catalog = read.catalog(choice);

  return {
    catalog,
    content: read.nodes(choice),
    fixed,
    identifier,
    templateVisibility,
  };
};

/**
 * Give the region of each choice of a Choice or an Inline Choice, in document order: its content,
 * and, for a choice with a template visibility, how the values decide it, so the redaction shows
 * it, settled, or drops it as it does a template inline's content.
 *
 * @template I The Choice or Inline Choice.
 * @template L The level of its content.
 * @param interaction The interaction.
 * @returns One region per choice.
 */
export const simpleChoiceRegions = <
  I extends { readonly choices: readonly SimpleChoice<L>[] },
  L extends Level,
>(
  interaction: I & { readonly choices: readonly SimpleChoice<L>[] },
): readonly OwnRegion<I, BodyNode<L>>[] =>
  choiceRegions<I, BodyNode<L>, SimpleChoice<L>>(
    interaction.choices,
    (each, step) => ({ ...each, choices: step(each.choices) }),
    Option.some({
      settled: (choice) => ({ ...choice, templateVisibility: Option.none() }),
      visibility: (choice) => choice.templateVisibility,
    }),
  );

/**
 * Give a Choice's or an Inline Choice's choices in the order a render presents them: a shuffled
 * one's under its key, each fixed choice at its document position, and any other's in document
 * order.
 *
 * @template C The choice, at the level of the interaction's content.
 * @param interaction The Choice or Inline Choice: its choices, its response and its `shuffle`.
 * @param seed The configuration's `seed`.
 * @returns The choices, in presented order.
 */
export const presented = <C extends { readonly fixed: boolean; readonly identifier: string }>(
  interaction: {
    readonly choices: readonly C[];
    readonly response: string;
    readonly shuffle: boolean;
  },
  seed: string,
): readonly C[] =>
  interaction.shuffle
    ? presentedOrder(seed, [interaction.response], interaction.choices, (choice) => choice.fixed)
    : interaction.choices;

/**
 * Give the identifiers of a Choice's or an Inline Choice's choices in the order a render presents
 * them: the one function that presents both kinds and reports their order.
 *
 * An interaction with `shuffle` true is presented in `presentedOrder`'s order
 * (`#plate/shuffle.ts`): its choices that are not fixed ranked by a keyed hash of each identifier
 * under the seed and the response, in the positions no fixed choice holds, each fixed choice at its
 * document position. Any other keeps document order. The same interaction and seed always give the
 * same order, the one the page presents. The order is presentation only: scores, records and
 * admission read identifiers, never positions.
 *
 * @param interaction The Choice or Inline Choice: its choices, its response and its `shuffle`.
 * @param seed The configuration's `seed`.
 * @returns The choice identifiers, in presented order.
 */
export const choiceOrder = (
  interaction: Pick<ChoiceInteraction, "choices" | "response" | "shuffle">,
  seed: string,
): readonly string[] => presented(interaction, seed).map((choice) => choice.identifier);

/**
 * Read a `qti-choice-interaction`: its binding, `max-choices`, `min-choices` and `shuffle`, the
 * author's names and messages, its Prompt and its choices ({@link simpleChoiceOf}).
 *
 * The body walk has bound it to an identifier response of single or multiple cardinality
 * ({@link binding}).
 *
 * @param source The `qti-choice-interaction` element.
 * @param context What the body walk hands a module: the path, the kit and the declaration.
 * @param context.bound The declaration it is bound to.
 * @param context.path The element's path.
 * @param context.read The kit the element is read with.
 * @returns The Choice.
 */
const parse = (
  source: SourceElement,
  { bound, path, read }: ModuleParseContext,
): Parsed<ChoiceInteraction> => {
  const { cardinality } = boundIn(binding, bound);
  read.markElement(source);

  const maxChoices = read.countAttribute(source, "max-choices");
  const minChoices = read.countAttribute(source, "min-choices");
  const shuffle = read.xsBoolean(source, "shuffle", false);
  const orientation = read.enumerated(source, "orientation", orientations);
  const prompt = read.content(source, "qti-prompt");
  const choices: SimpleChoice[] = [];
  const shades: { readonly direction: ShadeDirection; readonly identifier: string }[] = [];
  for (const choice of read.childrenNamed(source, "qti-simple-choice")) {
    const simple = simpleChoiceOf(read, choice);

    choices.push(simple);
    for (const direction of Option.toArray(shadeOf(read.valueOf(choice, "class")))) {
      shades.push({ direction, identifier: simple.identifier });
    }
  }

  return {
    ariaLabel: read.valueOf(source, "aria-label"),
    ariaLabelledby: read.valueOf(source, "aria-labelledby"),
    cardinality,
    choices,
    class: read.valueOf(source, "class"),
    kind: "choice",
    maxChoices: Option.getOrElse(maxChoices, () => 1n),
    messages: {
      max: read.valueOf(source, "data-max-selections-message"),
      min: read.valueOf(source, "data-min-selections-message"),
    },
    minChoices: Option.getOrElse(minChoices, () => 0n),
    orientation: Option.getOrElse(orientation, () => "vertical" as const),
    path,
    prompt,
    response: bound.identifier,
    shades,
    shuffle,
  } satisfies Parsed<ChoiceInteraction>;
};

/**
 * The Choice module (Q-2, the kind `choice`).
 */
export const choiceModule: InteractionModule<"choice", ChoiceByLevel, ChoicePayload> = {
  binding,
  element,
  feature,
  /**
   * The Choice with its Prompt's and its choices' content emptied.
   */
  hollow: (interaction) => ({
    ...interaction,
    choices: interaction.choices.map((choice) => ({ ...choice, content: [] })),
    prompt: interaction.prompt.pipe(Option.map(() => [])),
  }),
  kind: "choice",
  parse,
  /**
   * Copy the Choice into its payload node: its choices in presented order ({@link presented}), the
   * declaration of the response its island writes, and the identifiers the view shows as checked.
   */
  redact: (interaction, kit) => ({
    ariaLabel: interaction.ariaLabel,
    ariaLabelledby: interaction.ariaLabelledby,
    cardinality: interaction.cardinality,
    choices: presented(interaction, kit.seed).map((choice) => ({
      catalog: choice.catalog,
      content: choice.content,
      identifier: choice.identifier,
    })),
    class: interaction.class,
    declared: {
      baseType: "identifier",
      cardinality: interaction.cardinality,
      identifier: interaction.response,
    },
    maxChoices: interaction.maxChoices,
    orientation: interaction.orientation,
    prompt: interaction.prompt,
    response: interaction.response,
    restore: kit.shown(interaction.response).map(format),
  }),
  /**
   * The regions of the Choice's own content, in document order: its Prompt, then each choice's.
   */
  referencingChoices: (interaction) => interaction.choices,
  regions: (interaction) => [...promptRegion(interaction), ...simpleChoiceRegions(interaction)],
};
