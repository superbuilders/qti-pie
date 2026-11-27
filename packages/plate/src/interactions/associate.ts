/**
 * Associate (Q-1, the `associate` kind): `qti-associate-interaction` read into its model node,
 * copied into its payload node, and checked.
 *
 * {@link associateModule}'s `redact` gives the page the Prompt, its choices (a
 * `qti-simple-associable-choice` each, in the order the seed and the instance present them when
 * `shuffle` is true, a `fixed` choice keeping its place) with each one's `match-group` and
 * `match-max`, `max-associations`, the declaration of the `pair` response its island writes, and
 * the pairs the view shows; the server shell renders it
 * (`#plate/ui/item/interactions/`), so that no association needs a drag (WCAG 2.5.7) and every one
 * is made from the keyboard (2.1.1).
 *
 * The facts this module keeps to, from the information model and the schema:
 *
 * - The interaction binds a `pair` response of `single` or `multiple` cardinality; any other binding
 *   is the notice, as the shipped kinds give one. A `pair` is unordered, so `A B` and `B A` are one
 *   pair, which the value model's equality already holds.
 * - `max-associations` defaults to 1 and `min-associations` to 0 (`imsqti_asiv3p0p1_v1p0.xsd:24927`,
 *   `:24928`). Reading `max-strings-zero` gives `max-associations="0"` and `match-max="0"` the
 *   meaning of no restriction, and reading `least-at-most-most` holds a least count at most its
 *   most unless the most is 0. Reading `binding-and-count-sentences` binds a count above 1, or 0,
 *   to a `multiple` response, which the database enforces before this module reads the element.
 * - A choice's `match-max` is the most pairs it may be in, and its `match-min` the fewest (default
 *   0); its `match-group` lists the choices it may pair with, and an absent one means any.
 *
 * Where the facts are silent this module takes the planner's defaults for issue ei-04: a choice
 * never pairs with itself, and one pair given twice (in either order) is refused, both in tier (a).
 * A pair is outside a `match-group` when either choice of it names a group that omits the other,
 * since a group says which choices its owner may pair with whichever side it stands on. The
 * information model gives no rule for the author's `data-max-selections-message` and
 * `data-min-selections-message` here, so they are not read: the limits' messages are this module's.
 *
 * @module
 * @see https://www.w3.org/WAI/WCAG22/Understanding/dragging-movements.html
 */
import { Option } from "effect";
import type { SourceElement } from "#plate/document/source.ts";
import {
  boundIn,
  choiceRegions,
  markTemplate,
  promptRegion,
} from "#plate/interactions/contract.ts";
import type {
  ByLevel,
  InteractionModule,
  ModuleInteraction,
  ModuleParseContext,
  OwnRegion,
  ParseContext,
  Parsed,
} from "#plate/interactions/contract.ts";
import { presented } from "#plate/interactions/choice.ts";
import { listedIn, matchGroupOf } from "#plate/interactions/match-group.ts";
import type { MatchGroup } from "#plate/interactions/match-group.ts";
import { unorderedPairsOf } from "#plate/interactions/pair.ts";
import type { UnorderedPair } from "#plate/interactions/pair.ts";
import type {
  BodyNode,
  Level,
  ModelLevel,
  Nodes,
  RedactedLevel,
  ReferencingChoice,
} from "#plate/model/item.ts";
import type { Declared, Single } from "#plate/model/values.ts";

/**
 * Associate's identifier in the QTI 3.0 conformance list, Appendix A.
 */
const feature = "Q-1";

/**
 * The QTI element Associate is read from, which its notice names.
 */
const element = "qti-associate-interaction";

/**
 * The binding Associate renders with: "The associateInteraction must be bound to a response
 * variable with base-type pair and either single or multiple cardinality" (section 5.8).
 */
const binding = { baseTypes: ["pair"], cardinalities: ["single", "multiple"] } as const;

/**
 * One `qti-simple-associable-choice` of an Associate: a choice either side of a pair, with the
 * catalog it references.
 *
 * @template L The level of its content.
 */
interface AssociateChoice<L extends Level = ModelLevel> extends ReferencingChoice {
  /**
   * The choice's content as the body walk read it.
   */
  readonly content: Nodes<L>;
  /**
   * `fixed`: the choice keeps its document position when the Associate shuffles.
   */
  readonly fixed: boolean;
  /**
   * `match-group`: the choices this one may pair with.
   */
  readonly matchGroup: MatchGroup;
  /**
   * `match-max`: the most pairs this choice may be in; 0 is no limit.
   */
  readonly matchMax: bigint;
  /**
   * `match-min`, 0 when absent: the fewest pairs this choice must be in for a valid response.
   */
  readonly matchMin: bigint;
}

/**
 * A `qti-associate-interaction` (Q-1): its Prompt, its choices, and the limits it declares, bound
 * to a `pair` response of `single` or `multiple` cardinality: each value is two choices.
 *
 * @template L The level of its content.
 */
interface AssociateInteraction<
  L extends Level = ModelLevel,
> extends ModuleInteraction<"associate"> {
  /**
   * The bound response's cardinality: `multiple`, or `single` for an interaction of one pair.
   */
  readonly cardinality: "multiple" | "single";
  readonly choices: readonly AssociateChoice<L>[];
  /**
   * The author's `class`, as written, none when absent.
   */
  readonly class: Option.Option<string>;
  /**
   * `max-associations`, 1 when absent (the default the ASI XSD gives it on this interaction): the
   * most pairs a response may hold; 0 is no limit.
   */
  readonly maxAssociations: bigint;
  /**
   * `min-associations`, 0 when absent: the fewest pairs a valid response holds.
   */
  readonly minAssociations: bigint;
  readonly prompt: Option.Option<Nodes<L>>;
  /**
   * `shuffle`: the choices are presented in an order keyed by the seed and the response, each
   * `fixed` choice at its document position.
   */
  readonly shuffle: boolean;
}

/**
 * An Associate's model node at each level.
 */
interface AssociateByLevel extends ByLevel {
  readonly node: AssociateInteraction<this["level"]>;
}

/**
 * One choice as the page may know it: the catalog it references, its content, and what the server
 * shell reads of its limits.
 */
interface AssociatePayloadChoice extends ReferencingChoice {
  readonly content: Nodes<RedactedLevel>;
  /**
   * The choices this one may pair with, none listed when it may pair with any.
   */
  readonly matchGroup: readonly string[];
  readonly matchMax: bigint;
}

/**
 * An Associate as the page may know it: its Prompt, its choices in presented order, the declaration
 * of the response its pairs are written to, and the pairs to show. It holds no correct response.
 */
interface AssociatePayload {
  readonly ariaLabel: Option.Option<string>;
  readonly ariaLabelledby: Option.Option<string>;
  readonly choices: readonly AssociatePayloadChoice[];
  /**
   * The author's `class`, as written, none when absent.
   */
  readonly class: Option.Option<string>;
  /**
   * The response its island writes, as its declaration types it: a `pair` response of the bound
   * cardinality.
   */
  readonly declared: Declared<"pair", "multiple" | "single">;
  /**
   * `max-associations`, written or defaulted (0 is no limit).
   */
  readonly maxAssociations: bigint;
  readonly prompt: Option.Option<Nodes<RedactedLevel>>;
  /**
   * The identifier of the response it binds.
   */
  readonly response: string;
  /**
   * The pairs to show, each two of its choices as the view wrote them: the view's value, but a
   * stored pair that names a choice the item no longer holds.
   */
  readonly pairs: readonly UnorderedPair[];
}

/**
 * Read one `qti-simple-associable-choice` into its choice: its identifier, its limits, the catalog
 * it references (its `data-catalog-idref`, recorded before its content's so the references stay in
 * document order) and its content as the body walk reads it. A `template-identifier` the choice
 * carries is recorded as a mark: plate shows no choice by a template value here.
 *
 * @param context The element's path, its notice and the reader kit.
 * @param choice The `qti-simple-associable-choice`.
 * @returns The choice.
 */
const readChoice = (context: ParseContext, choice: SourceElement): AssociateChoice => {
  const { read } = context;

  read.markElement(choice);
  markTemplate(read, choice);

  const matchMax = read.countAttribute(choice, "match-max");
  const matchMin = read.countAttribute(choice, "match-min");
  const catalog = read.catalog(choice);

  return {
    catalog,
    content: read.nodes(choice),
    fixed: read.xsBoolean(choice, "fixed", false),
    identifier: read.identifierAttribute(choice, "identifier"),
    matchGroup: matchGroupOf(read.valueOf(choice, "match-group")),
    matchMax: Option.getOrElse(matchMax, () => 0n),
    matchMin: Option.getOrElse(matchMin, () => 0n),
  };
};

/**
 * Read a `qti-associate-interaction` into its model node, through the kit.
 *
 * The body walk has bound it to a `pair` response of cardinality `single` or `multiple` ({@link
 * binding}). The Prompt and each choice's content are read by the body walk. The features it reads
 * and does not render are recorded as marks: `template-identifier` on a choice.
 *
 * @param source The interaction's source element.
 * @param context The element's path, the reader kit and the declaration it is bound to.
 * @returns The model node.
 */
const parse = (
  source: SourceElement,
  context: ModuleParseContext,
): Parsed<AssociateInteraction> => {
  const { bound, read } = context;
  const response = bound.identifier;
  const { cardinality } = boundIn(binding, bound);

  read.markElement(source);

  const maxAssociations = read.countAttribute(source, "max-associations");
  const minAssociations = read.countAttribute(source, "min-associations");
  const shuffle = read.xsBoolean(source, "shuffle", false);
  const prompt = read.content(source, "qti-prompt");
  const choices: AssociateChoice[] = [];

  for (const child of read.elementsOf(source)) {
    if (read.isQti(child, "qti-simple-associable-choice")) {
      choices.push(readChoice(context, child));
    }
  }

  return {
    ariaLabel: read.valueOf(source, "aria-label"),
    ariaLabelledby: read.valueOf(source, "aria-labelledby"),
    cardinality,
    choices,
    class: read.valueOf(source, "class"),
    kind: "associate",
    maxAssociations: Option.getOrElse(maxAssociations, () => 1n),
    minAssociations: Option.getOrElse(minAssociations, () => 0n),
    path: context.path,
    prompt,
    response,
    shuffle,
  };
};

/**
 * Give the pairs a page shows of a response's values: each `pair` of two of the Associate's
 * choices, in order and as written, so a stored pair that names a choice the item no longer holds
 * is not shown.
 *
 * @param choices The Associate's choices.
 * @param singles The values the view shows.
 * @returns The pairs.
 */
const shownPairs = (
  choices: readonly { readonly identifier: string }[],
  singles: readonly Single[],
): readonly UnorderedPair[] => {
  const known = new Set(choices.map((choice) => choice.identifier));

  return unorderedPairsOf(singles).filter((pair) => pair.every((choice) => known.has(choice)));
};

/**
 * The regions of an Associate's own content, in document order: its Prompt, when it has one, then
 * each choice's content.
 *
 * @template L The level of its content.
 * @param interaction The model node.
 * @returns The regions, without their owner.
 */
const ownRegions = <L extends Level>(
  interaction: AssociateInteraction<L>,
): readonly OwnRegion<AssociateInteraction<L>, BodyNode<L>>[] => [
  ...promptRegion(interaction),
  ...choiceRegions<AssociateInteraction<L>, BodyNode<L>, AssociateChoice<L>>(
    interaction.choices,
    (each, step) => ({ ...each, choices: step(each.choices) }),
  ),
];

/**
 * The Associate module.
 */
export const associateModule: InteractionModule<"associate", AssociateByLevel, AssociatePayload> = {
  binding,
  element,
  feature,
  /**
   * The Associate with its Prompt's and its choices' content emptied.
   */
  hollow: (interaction) => ({
    ...interaction,
    choices: interaction.choices.map((choice) => ({ ...choice, content: [] })),
    prompt: interaction.prompt.pipe(Option.map(() => [])),
  }),
  kind: "associate",
  parse,
  /**
   * Copy the Associate into its payload node: its content through the kit, its choices in the order
   * the seed and the instance present them, and the pairs the view shows.
   */
  redact: (interaction, kit) => ({
    ariaLabel: interaction.ariaLabel,
    ariaLabelledby: interaction.ariaLabelledby,
    choices: presented(interaction, kit.seed).map((choice) => ({
      catalog: choice.catalog,
      content: choice.content,
      identifier: choice.identifier,
      matchGroup: listedIn(choice.matchGroup),
      matchMax: choice.matchMax,
    })),
    class: interaction.class,
    declared: {
      baseType: "pair",
      cardinality: interaction.cardinality,
      identifier: interaction.response,
    },
    maxAssociations: interaction.maxAssociations,
    pairs: shownPairs(interaction.choices, kit.shown(interaction.response)),
    prompt: interaction.prompt,
    response: interaction.response,
  }),
  /**
   * The regions of the node's own content, in document order: its Prompt, then each choice's
   * content.
   */
  referencingChoices: (interaction) => interaction.choices,
  regions: ownRegions,
};
