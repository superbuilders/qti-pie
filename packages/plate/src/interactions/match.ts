/**
 * Match: its model node, parse and redaction, on the module shape the interaction-module contract
 * states. The QTI database judges its responses when an answer is posted.
 *
 * No reading of `docs/spec-readings.md` binds the Match interaction itself; the module keeps to the
 * QTI 3 information model as the ASI XSD writes it (`MatchInteractionDType`, `SimpleMatchSetDType`,
 * `SimpleAssociableChoiceDType`): a `qti-match-interaction` is a prompt interaction holding exactly
 * two `qti-simple-match-set`s, the first the sources and the second the targets, bound to a
 * `directedPair` response of `single` or `multiple` cardinality, and a pair joins a choice of the
 * first set to one of the second. `max-associations` defaults to 1 and `min-associations` to 0, as
 * the XSD declares them, the most a cap in tier (a) and the least judged only under
 * `validate-responses` (reading 190), and 0 is no limit (reading 53). A `match-max` is required on
 * each choice and 0 is no limit; `match-min` defaults to 0; `match-group` lists the identifiers a
 * choice may pair with, any when absent.
 *
 * {@link matchModule}'s `redact` gives the page each set in its presented order, each choice with
 * its `match-group` and `match-max`, the declaration of the `directedPair` response its island
 * writes, and the pairs to show, each a source and its target; the server shell renders it
 * (`#plate/ui/item/interactions/`).
 *
 * @module
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
  Parsed,
  ReaderKit,
} from "#plate/interactions/contract.ts";
import { listedIn, matchGroupOf } from "#plate/interactions/match-group.ts";
import type { MatchGroup } from "#plate/interactions/match-group.ts";
import { pairsOf } from "#plate/interactions/pair.ts";
import type { Pair } from "#plate/interactions/pair.ts";
import type {
  BodyNode,
  Level,
  ModelLevel,
  Nodes,
  RedactedLevel,
  ReferencingChoice,
} from "#plate/model/item.ts";
import type { Declared } from "#plate/model/values.ts";
import { presentedOrder } from "#plate/shuffle.ts";

/**
 * Match's identifier in the QTI 3.0 conformance list, Appendix A.
 */
const feature = "Q-13";

/**
 * The QTI element Match is read from, which its notice names.
 */
const element = "qti-match-interaction";

/**
 * The binding Match renders with: "The matchInteraction must be bound to a response variable
 * with base-type 'directedPair' and either single or multiple cardinality" (section 5.89).
 */
const binding = { baseTypes: ["directedPair"], cardinalities: ["single", "multiple"] } as const;

/**
 * The QTI element of one set of a Match: the first holds the sources, the second the targets.
 */
const setTag = "qti-simple-match-set";

/**
 * The QTI element of one choice of either set.
 */
const choiceTag = "qti-simple-associable-choice";

/**
 * One `qti-simple-associable-choice` of a Match: a source when it sits in the first set, a target
 * when in the second.
 *
 * @template L The level of its content.
 */
interface MatchChoice<L extends Level = ModelLevel> extends ReferencingChoice {
  /**
   * The choice's content as the body walk read it.
   */
  readonly content: Nodes<L>;
  /**
   * `fixed`: the choice keeps its document position when the Match shuffles its set.
   */
  readonly fixed: boolean;
  /**
   * `match-group`: the choices of the other set this choice may pair with.
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
 * A `qti-match-interaction`: its Prompt, its two sets of choices, and the limits and
 * messages it declares, bound to a `directedPair` response of `single` or `multiple` cardinality:
 * each pair is a source and the target it is matched with.
 *
 * @template L The level of its content.
 */
interface MatchInteraction<L extends Level = ModelLevel> extends ModuleInteraction<"match"> {
  /**
   * The bound response's cardinality: `multiple`, or `single` for an interaction that takes one
   * pair.
   */
  readonly cardinality: "multiple" | "single";
  /**
   * The author's `class`, as written, none when absent.
   */
  readonly class: Option.Option<string>;
  /**
   * `data-first-column-header`: the text of the table's top-left header cell, none when absent.
   */
  readonly firstColumnHeader: Option.Option<string>;
  /**
   * `max-associations`, 1 when absent (the default the ASI XSD gives it, reading 190): the most
   * pairs a response may hold; 0 is no limit.
   */
  readonly maxAssociations: bigint;
  /**
   * The author's replacements for the messages of the two bounds, `data-max-selections-message` and
   * `data-min-selections-message`.
   */
  readonly messages: {
    readonly max: Option.Option<string>;
    readonly min: Option.Option<string>;
  };
  /**
   * `min-associations`, 0 when absent: the fewest pairs a valid response holds.
   */
  readonly minAssociations: bigint;
  readonly prompt: Option.Option<Nodes<L>>;
  /**
   * `shuffle`: each set is presented in an order keyed by the seed, the response and the set.
   */
  readonly shuffle: boolean;
  /**
   * The first set's choices, the sources of every pair, in document order.
   */
  readonly sources: readonly MatchChoice<L>[];
  /**
   * The second set's choices, the targets of every pair, in document order.
   */
  readonly targets: readonly MatchChoice<L>[];
}

/**
 * A Match's model node at each level.
 */
interface MatchByLevel extends ByLevel {
  readonly node: MatchInteraction<this["level"]>;
}

/**
 * One choice as the page may know it: the catalog it references, its content and what the page
 * reads of its limits.
 */
interface MatchPayloadChoice extends ReferencingChoice {
  readonly content: Nodes<RedactedLevel>;
  /**
   * The choices of the other set it may pair with, none listed when it may pair with any.
   */
  readonly matchGroup: readonly string[];
  readonly matchMax: bigint;
}

/**
 * A Match as the page may know it: its Prompt, its sources and targets each in presented order,
 * the declaration of the response its island writes, and the pairs to show. It holds no correct
 * response.
 */
interface MatchPayload {
  readonly ariaLabel: Option.Option<string>;
  readonly ariaLabelledby: Option.Option<string>;
  /**
   * The author's `class`, as written, none when absent.
   */
  readonly class: Option.Option<string>;
  /**
   * The response its island writes, as its declaration types it: a `directedPair` response of the
   * bound cardinality.
   */
  readonly declared: Declared<"directedPair", "multiple" | "single">;
  readonly firstColumnHeader: Option.Option<string>;
  /**
   * `max-associations`, which the page holds the response to; 0 is no limit.
   */
  readonly maxAssociations: bigint;
  readonly prompt: Option.Option<Nodes<RedactedLevel>>;
  /**
   * The identifier of the response it binds.
   */
  readonly response: string;
  /**
   * The pairs to show, each a source as its chip and a target: the view's value.
   */
  readonly pairs: readonly Pair[];
  readonly sources: readonly MatchPayloadChoice[];
  readonly targets: readonly MatchPayloadChoice[];
}

/**
 * Give one set's choices in the order a render presents them: document order, or with `shuffle`
 * {@link presentedOrder}'s under the seed, the response and the set's name, each fixed choice at its
 * document position. The two sets take different names, so they shuffle independently. The same
 * interaction and seed always give the same order.
 *
 * @template C The choice, at the level of the Match's content.
 * @param interaction The Match: its response and its `shuffle`.
 * @param set Which set, and its choices in document order.
 * @param seed The configuration's `seed`.
 * @returns The set's choices, in presented order.
 */
const presented = <C extends { readonly fixed: boolean; readonly identifier: string }>(
  interaction: Pick<MatchInteraction, "response" | "shuffle">,
  set: { readonly choices: readonly C[]; readonly name: "sources" | "targets" },
  seed: string,
): readonly C[] =>
  interaction.shuffle
    ? presentedOrder(seed, [interaction.response, set.name], set.choices, (choice) => choice.fixed)
    : set.choices;

/**
 * Read one `qti-simple-associable-choice` into its choice: its identifier, its limits, the catalog
 * it references (its `data-catalog-idref`, recorded before its content's so the references stay in
 * document order) and its content as the body walk reads it. `match-max` is required
 * (`SimpleAssociableChoiceDType`), and the database refuses a choice without it before any item is
 * built. A `template-identifier` the choice carries is recorded as a mark: plate shows no choice by
 * a template value here.
 *
 * @param read The reader kit.
 * @param choice The choice element.
 * @returns The choice.
 */
const readChoice = (read: ReaderKit, choice: SourceElement): MatchChoice => {
  read.markElement(choice);
  markTemplate(read, choice);

  const matchMax = Option.getOrElse(read.countAttribute(choice, "match-max"), () =>
    read.inadmissible("missing-attribute", read.pathOf(choice), {
      attribute: "match-max",
      element: read.nameOf(choice),
    }),
  );
  const matchMin = read.countAttribute(choice, "match-min");
  const catalog = read.catalog(choice);

  return {
    catalog,
    content: read.nodes(choice),
    fixed: read.xsBoolean(choice, "fixed", false),
    identifier: read.identifierAttribute(choice, "identifier"),
    matchGroup: matchGroupOf(read.valueOf(choice, "match-group")),
    matchMax,
    matchMin: Option.getOrElse(matchMin, () => 0n),
  };
};

/**
 * Read one `qti-simple-match-set` into its choices, in document order.
 *
 * @param read The reader kit.
 * @param set The set element.
 * @returns Its choices.
 */
const readSet = (read: ReaderKit, set: SourceElement): readonly MatchChoice[] => {
  read.markElement(set);

  const choices: MatchChoice[] = [];

  for (const child of read.childrenNamed(set, choiceTag)) {
    choices.push(readChoice(read, child));
  }

  return choices;
};

/**
 * Read a `qti-match-interaction` into {@link matchModule}'s model node, through the kit.
 *
 * The body walk has bound it to a `directedPair` response of cardinality `single` or `multiple`,
 * as the MatchInteraction class
 * says (section 5.89; {@link binding}). The Prompt and each choice's content are
 * read by the body walk. The first `qti-simple-match-set` gives the sources and the second the
 * targets; the database holds the count at two, so a missing set reads as no choices.
 * A `template-identifier` on a choice is recorded as a mark.
 *
 * @param source The interaction's source element.
 * @param context The element's path, the reader kit and the declaration it is bound to.
 * @returns The model node.
 */
const parse = (source: SourceElement, context: ModuleParseContext): Parsed<MatchInteraction> => {
  const { bound, read } = context;
  const response = bound.identifier;
  const { cardinality } = boundIn(binding, bound);

  read.markElement(source);

  const maxAssociations = read.countAttribute(source, "max-associations");
  const minAssociations = read.countAttribute(source, "min-associations");
  const shuffle = read.xsBoolean(source, "shuffle", false);
  const prompt = read.content(source, "qti-prompt");
  const [first, second] = read.childrenNamed(source, setTag);
  const sources = first === undefined ? [] : readSet(read, first);
  const targets = second === undefined ? [] : readSet(read, second);

  return {
    ariaLabel: read.valueOf(source, "aria-label"),
    ariaLabelledby: read.valueOf(source, "aria-labelledby"),
    cardinality,
    class: read.valueOf(source, "class"),
    firstColumnHeader: read.valueOf(source, "data-first-column-header"),
    kind: "match",
    maxAssociations: Option.getOrElse(maxAssociations, () => 1n),
    messages: {
      max: read.valueOf(source, "data-max-selections-message"),
      min: read.valueOf(source, "data-min-selections-message"),
    },
    minAssociations: Option.getOrElse(minAssociations, () => 0n),
    path: context.path,
    prompt,
    response,
    shuffle,
    sources,
    targets,
  };
};

/**
 * Copy one set's choices into the payload, in presented order.
 *
 * @param choices The set's choices, in presented order.
 * @returns The payload choices.
 */
const redactSet = (choices: readonly MatchChoice<RedactedLevel>[]): readonly MatchPayloadChoice[] =>
  choices.map((choice) => ({
    catalog: choice.catalog,
    content: choice.content,
    identifier: choice.identifier,
    matchGroup: listedIn(choice.matchGroup),
    matchMax: choice.matchMax,
  }));

/**
 * Give the regions of one set's choices: each choice's content, with its identifier.
 *
 * @template L The level of the Match's content.
 * @param interaction The Match.
 * @param set Which set.
 * @returns The regions, in document order.
 */
const regionsOf = <L extends Level>(
  interaction: MatchInteraction<L>,
  set: "sources" | "targets",
): readonly OwnRegion<MatchInteraction<L>, BodyNode<L>>[] =>
  choiceRegions<MatchInteraction<L>, BodyNode<L>, MatchChoice<L>>(
    interaction[set],
    (each, step) => ({
      ...each,
      [set]: step(each[set]),
    }),
  );

/**
 * The regions of a Match's own content, in document order: its Prompt, each source's content, then
 * each target's.
 *
 * @template L The level of its content.
 * @param interaction The Match.
 * @returns The regions, without their owner.
 */
const ownRegions = <L extends Level>(
  interaction: MatchInteraction<L>,
): readonly OwnRegion<MatchInteraction<L>, BodyNode<L>>[] => [
  ...promptRegion(interaction),
  ...regionsOf(interaction, "sources"),
  ...regionsOf(interaction, "targets"),
];

/**
 * The type of {@link matchModule}.
 */
type MatchModule = InteractionModule<"match", MatchByLevel, MatchPayload>;

/**
 * The Match module: the interaction module of the kind `match`, which reads and binds
 * `qti-match-interaction`.
 */
export const matchModule: MatchModule = {
  binding,
  element,
  feature,
  /**
   * The Match with its Prompt's and each choice's content emptied.
   */
  hollow: (interaction) => ({
    ...interaction,
    prompt: interaction.prompt.pipe(Option.map(() => [])),
    sources: interaction.sources.map((choice) => ({ ...choice, content: [] })),
    targets: interaction.targets.map((choice) => ({ ...choice, content: [] })),
  }),
  kind: "match",
  parse,
  /**
   * Copy the Match into its payload node: its content through the kit, each set in the order the
   * seed and the instance present it, and the pairs the view shows.
   */
  redact: (interaction, kit) => ({
    ariaLabel: interaction.ariaLabel,
    ariaLabelledby: interaction.ariaLabelledby,
    class: interaction.class,
    declared: {
      baseType: "directedPair",
      cardinality: interaction.cardinality,
      identifier: interaction.response,
    },
    firstColumnHeader: interaction.firstColumnHeader,
    maxAssociations: interaction.maxAssociations,
    pairs: pairsOf(kit.shown(interaction.response)),
    prompt: interaction.prompt,
    response: interaction.response,
    sources: redactSet(
      presented(interaction, { choices: interaction.sources, name: "sources" }, kit.seed),
    ),
    targets: redactSet(
      presented(interaction, { choices: interaction.targets, name: "targets" }, kit.seed),
    ),
  }),
  /**
   * The regions of the node's own content, in document order: its Prompt, each source's content,
   * then each target's.
   */
  referencingChoices: (interaction) => [...interaction.sources, ...interaction.targets],
  regions: ownRegions,
};
