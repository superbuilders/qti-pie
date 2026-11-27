/**
 * Order, the `qti-order-interaction`: its model node, parse and redaction, on the module shape the
 * interaction-module contract states.
 *
 * Two readings of `docs/spec-readings.md` bind this module.
 *
 * - Reading `order-min-choices`, "An order or graphic-order interaction's `min-choices`, where
 *   written, is from 1 to its number of choices, and a `max-choices` written beside it is from
 *   `min-choices` to its number of choices." the database refuses a bound that breaks it. With no
 *   `min-choices` every choice must be ordered and `max-choices` is ignored, so the effective
 *   bounds are the number of choices; with one, the bounds are `min-choices` and `max-choices`,
 *   which is the number of choices when it is not written.
 * - Reading `order-binding`, "An order interaction may be bound to a response variable of any base
 *   type and cardinality: its class description states no binding." the database admits any
 *   binding. This module renders the one whose meaning the information model describes, an
 *   `identifier` response of `ordered` cardinality ({@link binding}), and the body walk gives the
 *   notice for any other, naming the binding, as for every kind.
 *
 * {@link orderModule}'s `redact` gives the page the choices in presented order, the bounds the
 * response is held to, the identifiers the response places, in order, and the width of its choices'
 * container; the server shell renders it (`#plate/ui/item/interactions/`).
 *
 * @module
 */
import { Option } from "effect";
import type { SourceElement } from "#plate/document/source.ts";
import { choiceRegions, markTemplate, promptRegion } from "#plate/interactions/contract.ts";
import type {
  ByLevel,
  InteractionModule,
  ModuleInteraction,
  ModuleParseContext,
  OwnRegion,
  Parsed,
  RedactKit,
} from "#plate/interactions/contract.ts";
import { presented } from "#plate/interactions/choice.ts";
import type {
  BodyNode,
  Level,
  ModelLevel,
  Nodes,
  RedactedLevel,
  ReferencingChoice,
  SimpleChoice,
} from "#plate/model/item.ts";
import { format } from "#plate/model/values.ts";
import type { Declared } from "#plate/model/values.ts";

/**
 * Order's identifier in the QTI 3.0 conformance list, Appendix A.
 */
const feature = "Q-15";

/**
 * The QTI element Order is read from.
 */
const element = "qti-order-interaction";

/**
 * The binding Order renders with: an `identifier` response of `ordered` cardinality, the one whose
 * meaning the information model describes (reading `order-binding`).
 */
const binding = { baseTypes: ["identifier"], cardinalities: ["ordered"] } as const;

/**
 * The model node of an Order: the fields every module's node shares, its Prompt, its choices in
 * document order whatever `shuffle` says, `min-choices` and `max-choices` as written, and the
 * authored hints a render reads. Each choice's template visibility is none, since the redacted
 * codec holds none (`read.mark` records one the choice carried as not rendered).
 *
 * @template L The level of its content.
 */
interface OrderInteraction<L extends Level = ModelLevel> extends ModuleInteraction<"order"> {
  readonly choices: readonly SimpleChoice<L>[];
  /**
   * `data-choices-container-width`, "The ordering choices container width in pixels" (QTI 3.0
   * shared vocabulary, 1.2.9.4), an `xs:nonNegativeInteger` the XSD declares on the interaction;
   * none when absent.
   */
  readonly choicesContainerWidth: Option.Option<bigint>;
  readonly class: Option.Option<string>;
  /**
   * `max-choices`, none when it is not written; ignored when `min-choices` is not written.
   */
  readonly maxChoices: Option.Option<bigint>;
  /**
   * The author's replacements for the too-many and too-few messages,
   * `data-max-selections-message` and `data-min-selections-message`.
   */
  readonly messages: { readonly max: Option.Option<string>; readonly min: Option.Option<string> };
  /**
   * `min-choices`, none when it is not written, which asks for every choice to be ordered.
   */
  readonly minChoices: Option.Option<bigint>;
  /**
   * `orientation`, a rendering hint, none when absent, which the XSD gives no default
   * (`OrderInteractionDType`).
   */
  readonly orientation: Option.Option<"horizontal" | "vertical">;
  readonly prompt: Option.Option<Nodes<L>>;
  readonly shuffle: boolean;
}

/**
 * An Order's model node at each level.
 */
interface OrderByLevel extends ByLevel {
  readonly node: OrderInteraction<this["level"]>;
}

/**
 * One choice of an Order as the page may know it: its identifier and the catalog it references,
 * and its content.
 */
interface OrderChoicePayload extends ReferencingChoice {
  readonly content: Nodes<RedactedLevel>;
}

/**
 * The payload node of an Order, what its `redact` copies of the model node and reads of the view:
 * every choice in presented order, the identifiers the response places, in order, and the
 * effective bounds. It holds no correct response.
 */
interface OrderPayload {
  readonly ariaLabel: Option.Option<string>;
  readonly ariaLabelledby: Option.Option<string>;
  /**
   * Every choice in presented order: the model's order, or, for a shuffled Order, the order the
   * seed, the instance and the response key give, each fixed choice at its own place.
   */
  readonly choices: readonly OrderChoicePayload[];
  /**
   * `data-choices-container-width`, the width in pixels its choices' container is drawn at, none
   * when absent (1.2.9.4).
   */
  readonly choicesContainerWidth: Option.Option<bigint>;
  readonly class: Option.Option<string>;
  /**
   * The response its island writes, as its declaration types it: an `ordered` `identifier`
   * response.
   */
  readonly declared: Declared<"identifier", "ordered">;
  /**
   * The most choices the response may place, from the least to the number of choices.
   */
  readonly maxChoices: number;
  /**
   * The fewest choices the response may place, from 0 to the number of choices.
   */
  readonly minChoices: number;
  /**
   * `orientation`, a rendering hint, none when absent, which the XSD gives no default
   * (`OrderInteractionDType`).
   */
  readonly orientation: Option.Option<"horizontal" | "vertical">;
  /**
   * The identifiers the response places, in order, each naming a choice and each once: the view's
   * values, with what names no choice, and a repeat, left out.
   */
  readonly placed: readonly string[];
  readonly prompt: Option.Option<Nodes<RedactedLevel>>;
  readonly response: string;
}

/**
 * Give the smaller of two counts.
 *
 * @param left One count.
 * @param right The other.
 * @returns The smaller.
 */
const smaller = (left: bigint, right: bigint): bigint => (left < right ? left : right);

/**
 * Give the larger of two counts.
 *
 * @param left One count.
 * @param right The other.
 * @returns The larger.
 */
const larger = (left: bigint, right: bigint): bigint => (left > right ? left : right);

/**
 * The fewest and the most choices a response to an Order places (reading `order-min-choices`).
 */
interface Bounds {
  readonly least: bigint;
  readonly most: bigint;
}

/**
 * Give the bounds on the choices an Order's response places: without `min-choices` every choice
 * must be ordered and `max-choices` is ignored, so both are the number of choices; with it, the
 * least is `min-choices` and the most `max-choices`, the number of choices when it is not written,
 * neither above the number of choices nor the most below the least.
 *
 * @param interaction The Order.
 * @returns The bounds.
 */
const boundsOf = (interaction: OrderInteraction): Bounds => {
  const total = BigInt(interaction.choices.length);

  if (Option.isNone(interaction.minChoices)) {
    return { least: total, most: total };
  }

  const least = smaller(interaction.minChoices.value, total);

  return {
    least,
    most: larger(
      least,
      Option.match(interaction.maxChoices, {
        onNone: () => total,
        onSome: (written) => smaller(written, total),
      }),
    ),
  };
};

/**
 * Read an Order from its element, which the body walk has bound to an ordered identifier response
 * (reading `order-binding`, {@link binding}): `shuffle`, `min-choices` and `max-choices`, its
 * Prompt, its choices and its authored hints, `data-choices-container-width` among them.
 *
 * A `template-identifier` on a choice is recorded as not rendered: the redacted copy holds no
 * template value to decide it by, so the choice is always shown.
 *
 * @param source The `qti-order-interaction` element.
 * @param context What the body walk hands a module: the path, the kit and the declaration.
 * @param context.bound The declaration it is bound to.
 * @param context.path The element's path.
 * @param context.read The kit the element is read with.
 * @returns The Order.
 */
const parseOrder = (
  source: SourceElement,
  { bound, path, read }: ModuleParseContext,
): Parsed<OrderInteraction> => {
  const response = bound.identifier;

  read.markElement(source);

  const shuffle = read.xsBoolean(source, "shuffle", false);
  const minChoices = read.countAttribute(source, "min-choices");
  const maxChoices = read.countAttribute(source, "max-choices");
  const prompt = read.content(source, "qti-prompt");
  const choices: SimpleChoice[] = [];

  for (const choice of read.childrenNamed(source, "qti-simple-choice")) {
    read.markElement(choice);

    markTemplate(read, choice);

    const identifier = read.identifierAttribute(choice, "identifier");
    const fixed = read.xsBoolean(choice, "fixed", false);
    const catalog = read.catalog(choice);

    choices.push({
      catalog,
      content: read.nodes(choice),
      fixed,
      identifier,
      templateVisibility: Option.none(),
    });
  }

  return {
    ariaLabel: read.valueOf(source, "aria-label"),
    ariaLabelledby: read.valueOf(source, "aria-labelledby"),
    choices,
    choicesContainerWidth: read.countAttribute(source, "data-choices-container-width"),
    class: read.valueOf(source, "class"),
    kind: "order",
    maxChoices,
    messages: {
      max: read.valueOf(source, "data-max-selections-message"),
      min: read.valueOf(source, "data-min-selections-message"),
    },
    minChoices,
    orientation: read.enumerated(source, "orientation", ["horizontal", "vertical"]),
    path,
    prompt,
    response,
    shuffle,
  };
};

/**
 * Give the regions of an Order's own content, in document order: its Prompt, then each choice's
 * content, written as nodes.
 *
 * @template L The level of its content.
 * @param interaction The Order.
 * @returns Its regions, without the owner.
 */
const regionsOfOrder = <L extends Level>(
  interaction: OrderInteraction<L>,
): readonly OwnRegion<OrderInteraction<L>, BodyNode<L>>[] => [
  ...promptRegion(interaction),
  ...choiceRegions<OrderInteraction<L>, BodyNode<L>, SimpleChoice<L>>(
    interaction.choices,
    (each, step) => ({
      ...each,
      choices: step(each.choices),
    }),
  ),
];

/**
 * Copy an Order into its payload node: its content through the kit, its choices in presented
 * order, the declaration of the response its island writes, the identifiers the response places,
 * the effective bounds and its choices' container width.
 *
 * The identifiers placed are the values the view shows. An identifier that names no choice, and a
 * repeat of one, is left out, so a choice shows once, in one position, and the response holds what
 * the positions show.
 *
 * @param interaction The Order.
 * @param kit What the payload hands a module's `redact`.
 * @returns The payload node.
 */
const redactOrder = (
  interaction: OrderInteraction<RedactedLevel>,
  kit: RedactKit,
): OrderPayload => {
  const known = new Set(interaction.choices.map((choice) => choice.identifier));
  const wanted = kit.shown(interaction.response).map(format);
  const { least, most } = boundsOf(interaction);

  return {
    ariaLabel: interaction.ariaLabel,
    ariaLabelledby: interaction.ariaLabelledby,
    choices: presented(interaction, kit.seed).map((choice) => ({
      catalog: choice.catalog,
      content: choice.content,
      identifier: choice.identifier,
    })),
    choicesContainerWidth: interaction.choicesContainerWidth,
    class: interaction.class,
    declared: { baseType: "identifier", cardinality: "ordered", identifier: interaction.response },
    maxChoices: Number(most),
    minChoices: Number(least),
    orientation: interaction.orientation,
    placed: [...new Set(wanted)].filter((identifier) => known.has(identifier)),
    prompt: interaction.prompt,
    response: interaction.response,
  };
};

/**
 * The Order module (kind `order`): it reads a `qti-order-interaction` bound to an `identifier`
 * response of `ordered` cardinality, renders it, restores and solves it, binds its response, and
 * gives the notice for any other binding (reading `order-binding`).
 */
export const orderModule: InteractionModule<"order", OrderByLevel, OrderPayload> = {
  binding,
  element,
  feature,
  /**
   * The Order with its Prompt's and its choices' content emptied.
   */
  hollow: (interaction) => ({
    ...interaction,
    choices: interaction.choices.map((choice) => ({ ...choice, content: [] })),
    prompt: interaction.prompt.pipe(Option.map(() => [])),
  }),
  kind: "order",
  /**
   * Read the `qti-order-interaction` element into its model node, or its notice for a binding
   * other than an ordered identifier ({@link parseOrder}).
   */
  parse: (source, context) => parseOrder(source, context),
  /**
   * Order's payload copy ({@link redactOrder}).
   */
  redact: (interaction, kit) => redactOrder(interaction, kit),
  /**
   * The regions of Order's own content: its Prompt and each choice's content.
   */
  referencingChoices: (interaction) => interaction.choices,
  regions: regionsOfOrder,
};
