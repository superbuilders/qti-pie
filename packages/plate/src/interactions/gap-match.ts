/**
 * Gap Match: its model node, parse and redaction, on the module shape the interaction-module
 * contract states. The QTI database judges its responses when an answer is posted.
 *
 * Three readings of `docs/spec-readings.md` bind it. Reading `gap-and-hottext-placement`, "A
 * `qti-gap` appears only within a gap-match interaction, and a `qti-hottext` may appear in any flow
 * or inline …": the database refuses a gap outside this interaction, so {@link gapMatchModule}'s
 * `parse` reads `qti-gap` only inside its own element, as an element of the gapped content the
 * kit's body walk lets through. Reading `gap-match-cardinality`, "A gap match interaction with two
 * or more gaps binds a response of multiple cardinality.": the database enforces it, so `parse`
 * reads the declared cardinality, `single` or `multiple`; any other, like any base type but
 * `directedPair`, the database refuses as "BindingFit" before an item is built, and the body walk
 * gives its notice in place of the interaction.
 *
 * Reading `max-associations`, "An unwritten `max-associations` is 1, and a response holding more
 * associations than its `max-associations` is refused whatever `validate-responses` says": the
 * XSD's default 1 caps the pairs in tier (a), and `min-associations`, which
 * `GapMatchInteractionDType` gives no default, is a least only under `validate-responses`; reading
 * `max-strings-zero` keeps `0` as no limit. So the correct response of an item that writes several
 * pairs and no `max-associations`, such as the 1EdTech examples `jumble-gapMatch.xml` and
 * `multi-input.xml`, is refused as any response over the cap is.
 *
 * {@link gapMatchModule}'s `redact` gives the page the choices in presented order, the author's
 * gapped content with each `qti-gap` kept as an element, the gaps in document order, the
 * declaration of the `directedPair` response its island writes, and the pairs to show, each a
 * choice and the gap it fills; the server shell renders it, each gap a client `Gap`
 * (`#plate/ui/item/interactions/`).
 *
 * @module
 */
import { Option } from "effect";
import type { SourceChild, SourceElement } from "#plate/document/source.ts";
import {
  boundIn,
  choiceRegions,
  contentRegion,
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
import { bodyAttributeOf, xsBooleanOf } from "#plate/model/attributes.ts";
import type {
  BodyNode,
  Level,
  ModelLevel,
  Nodes,
  RedactedLevel,
  ReferencingChoice,
} from "#plate/model/item.ts";
import { trimXmlSpace } from "#plate/model/values.ts";
import type { Declared } from "#plate/model/values.ts";
import { presentedOrder } from "#plate/shuffle.ts";

/**
 * Gap Match's identifier in the QTI 3.0 conformance list, Appendix A.
 */
const feature = "Q-6";

/**
 * The QTI element Gap Match is read from, which its notice names.
 */
const element = "qti-gap-match-interaction";

/**
 * The binding Gap Match renders with: "The GapMatchInteraction must be bound to a response
 * variable with base-type directedPair and either single or multiple cardinality, depending on the
 * number of gaps" (section 5.57).
 */
const binding = { baseTypes: ["directedPair"], cardinalities: ["single", "multiple"] } as const;

/**
 * One `qti-gap-text` or `qti-gap-img` of a Gap Match: a choice of the pair's source side, with the
 * catalog it references.
 *
 * @template L The level of its content.
 */
interface GapMatchChoice<L extends Level = ModelLevel> extends ReferencingChoice {
  /**
   * The choice's content as the body walk read it: the gap text's text and markup, or the gap
   * image's `object`.
   */
  readonly content: Nodes<L>;
  /**
   * `object-label` of a `qti-gap-img`: the text that names the image, none for a gap text.
   */
  readonly label: Option.Option<string>;
  /**
   * `match-group`: the gaps this choice may fill.
   */
  readonly matchGroup: MatchGroup;
  /**
   * `match-max`: the most gaps this choice may fill; 0 is no limit.
   */
  readonly matchMax: bigint;
  /**
   * `match-min`, 0 when absent: the fewest gaps this choice must fill for a valid response.
   */
  readonly matchMin: bigint;
}

/**
 * A `qti-gap-match-interaction`: its Prompt, its choices, its gapped content, and the limits
 * and messages it declares, bound to a `directedPair` response of `single` or `multiple`
 * cardinality: each pair is a choice and the gap it fills.
 *
 * @template L The level of its content.
 */
interface GapMatchInteraction<L extends Level = ModelLevel> extends ModuleInteraction<"gap-match"> {
  /**
   * The bound response's cardinality: `multiple`, or `single` for an interaction with one gap.
   */
  readonly cardinality: "multiple" | "single";
  readonly choices: readonly GapMatchChoice<L>[];
  /**
   * The author's `class`, as written, none when absent.
   */
  readonly class: Option.Option<string>;
  /**
   * The block content around the gaps, as the body walk read it, with each `qti-gap` an element
   * the module owns.
   */
  readonly gapped: Nodes<L>;
  /**
   * `max-associations`, 1 when absent (the default the ASI XSD gives it, reading
   * `max-associations`): the most pairs a response may hold; 0 is no limit.
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
   * `shuffle`: the choices, never the gaps, are presented in an order keyed by the seed and the
   * response.
   */
  readonly shuffle: boolean;
}

/**
 * A Gap Match's model node at each level.
 */
interface GapMatchByLevel extends ByLevel {
  readonly node: GapMatchInteraction<this["level"]>;
}

/**
 * One `qti-gap` of the gapped content, read once from the element the body walk kept there: its
 * identifier, the choices it may hold, whether a valid response fills it, and the element's path.
 */
interface Gap {
  readonly identifier: string;
  /**
   * `match-group`: the choices this gap may hold.
   */
  readonly matchGroup: MatchGroup;
  readonly path: string;
  /**
   * `required`, false when absent, as the XSD defaults it.
   */
  readonly required: boolean;
}

/**
 * A {@link Gap} as the server shell reads it, by whose path it knows the gap where its walk of the
 * gapped content meets the element: its `match-group` as the choices it lists, none listed when it
 * takes any choice.
 */
export interface GapElement {
  readonly identifier: string;
  readonly matchGroup: readonly string[];
  readonly path: string;
  readonly required: boolean;
}

/**
 * One choice as the page may know it: the catalog it references, its content, and what the page
 * reads of its limits.
 */
interface GapMatchPayloadChoice extends ReferencingChoice {
  readonly content: Nodes<RedactedLevel>;
  readonly label: Option.Option<string>;
  /**
   * The gaps the choice may fill, none listed when it may fill any.
   */
  readonly matchGroup: readonly string[];
  readonly matchMax: bigint;
}

/**
 * A Gap Match as the page may know it: its Prompt, its choices in presented order, its gapped
 * content, its gaps, the declaration of the response its island writes, and the pairs to show. It
 * holds no correct response.
 */
interface GapMatchPayload {
  readonly ariaLabel: Option.Option<string>;
  readonly ariaLabelledby: Option.Option<string>;
  readonly choices: readonly GapMatchPayloadChoice[];
  /**
   * The author's `class`, as written, none when absent.
   */
  readonly class: Option.Option<string>;
  readonly content: Nodes<RedactedLevel>;
  /**
   * The response its island writes, as its declaration types it: a `directedPair` response of the
   * bound cardinality.
   */
  readonly declared: Declared<"directedPair", "multiple" | "single">;
  /**
   * The gaps the gapped content shows, in document order.
   */
  readonly gaps: readonly GapElement[];
  readonly prompt: Option.Option<Nodes<RedactedLevel>>;
  /**
   * The identifier of the response it binds.
   */
  readonly response: string;
  /**
   * The pairs to show, each a gap text or gap image as its chip and a gap as its target: the
   * view's value.
   */
  readonly pairs: readonly Pair[];
}

/**
 * Read the gaps of the gapped content, in document order, below elements: each `qti-gap` the module
 * owns, as a {@link Gap}. They are read from the content at its own level, so the model knows the
 * gaps it holds and the payload the gaps the redaction left shown. The structure
 * check holds a gap's `identifier` required, so a gap reads as one whenever the content holds it.
 *
 * @param nodes The gapped content, at either level.
 * @returns The gaps.
 */
const gapsIn = (nodes: readonly BodyNode[]): readonly Gap[] =>
  nodes.flatMap((node): readonly Gap[] => {
    if (node.kind !== "element") {
      return [];
    }

    if (node.tag !== "qti-gap") {
      return gapsIn(node.children);
    }

    return Option.toArray(
      Option.map(bodyAttributeOf(node.attributes, "identifier"), (identifier) => ({
        identifier,
        matchGroup: matchGroupOf(bodyAttributeOf(node.attributes, "match-group")),
        path: node.path,
        required: Option.contains(
          Option.flatMap(bodyAttributeOf(node.attributes, "required"), xsBooleanOf),
          true,
        ),
      })),
    );
  });

/**
 * Give the choices in the order a page presents them: document order, or with `shuffle`
 * {@link presentedOrder}'s under the seed and the response, every position free: the XSD declares no
 * `fixed` on `qti-gap-text` or `qti-gap-img`, and the database refuses one written. The gaps never
 * move. The same interaction and seed always give the same order.
 *
 * @template L The level of its content.
 * @param interaction The Gap Match: its choices, its response and its `shuffle`.
 * @param seed The configuration's `seed`.
 * @returns The choices, in presented order.
 */
const presented = <L extends Level>(
  interaction: Pick<GapMatchInteraction<L>, "choices" | "response" | "shuffle">,
  seed: string,
): readonly GapMatchChoice<L>[] =>
  interaction.shuffle
    ? presentedOrder(seed, [interaction.response], interaction.choices, () => false)
    : interaction.choices;

/**
 * Collect the `qti-gap` elements of an interaction's source, at any depth.
 *
 * @param read The reader kit.
 * @param parent The element to search below.
 * @returns Each `qti-gap`, in document order.
 */
const gapElementsIn = (read: ReaderKit, parent: SourceElement): readonly SourceElement[] =>
  read
    .elementsOf(parent)
    .flatMap((child) => (read.isQti(child, "qti-gap") ? [child] : gapElementsIn(read, child)));

/**
 * Tell whether a child of the interaction is one the Gap Match reads on its own and not as gapped
 * content: its Prompt, a gap text or a gap image.
 *
 * @param read The reader kit.
 * @param child The child.
 * @returns Whether the child is read by name.
 */
const isReadByName = (read: ReaderKit, child: SourceChild): boolean =>
  child.kind === "element" &&
  (read.isQti(child, "qti-prompt") ||
    read.isQti(child, "qti-gap-text") ||
    read.isQti(child, "qti-gap-img"));

/**
 * Read one `qti-gap-text` or `qti-gap-img` into its choice: its identifier, its limits, the catalog
 * it references (its `data-catalog-idref`, recorded before its content's so the references stay in
 * document order) and its content as the body walk reads it. `match-max` is required
 * (`GapTextDType`, `GapImgDType`), and the database refuses a choice without it before any item is
 * built. A `template-identifier` the choice carries is recorded as a mark: plate shows no choice by
 * a template value here.
 *
 * @param read The reader kit.
 * @param choice The gap text or gap image.
 * @returns The choice.
 */
const readChoice = (read: ReaderKit, choice: SourceElement): GapMatchChoice => {
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
    content: read.nodes(choice, {}),
    identifier: read.identifierAttribute(choice, "identifier"),
    label: read.valueOf(choice, "object-label"),
    matchGroup: matchGroupOf(read.valueOf(choice, "match-group")),
    matchMax,
    matchMin: Option.getOrElse(matchMin, () => 0n),
  };
};

/**
 * Tell whether a child of the interaction is XML white space between its elements, which is no
 * gapped content.
 *
 * @param child The child.
 * @returns Whether it is a text of white space only.
 */
const isBlank = (child: SourceChild): boolean =>
  child.kind === "text" && trimXmlSpace(child.text) === "";

/**
 * Read a `qti-gap-match-interaction` into {@link gapMatchModule}'s model node, through the kit.
 *
 * The body walk has bound it to a `directedPair` response of cardinality `single` or `multiple`,
 * as the GapMatchInteraction
 * class says (section 5.57; {@link binding}). The Prompt, each choice's content and the
 * gapped content are read by the body walk, the gapped content with `qti-gap` let through as the
 * module's own element. The features it reads and does not render are recorded as marks:
 * `data-choices-container-width`, and `template-identifier` on a gap and on a choice. A gap's
 * `match-group` is read, as a choice's is, and the payload carries both.
 *
 * @param source The interaction's source element.
 * @param context The element's path, the reader kit and the declaration it is bound to.
 * @returns The model node.
 */
const parse = (source: SourceElement, context: ModuleParseContext): Parsed<GapMatchInteraction> => {
  const { bound, read } = context;
  const response = bound.identifier;
  const { cardinality } = boundIn(binding, bound);

  read.markElement(source);
  if (Option.isSome(read.valueOf(source, "data-choices-container-width"))) {
    read.mark(source, "data-choices-container-width");
  }

  for (const gap of gapElementsIn(read, source)) {
    markTemplate(read, gap);
  }

  const maxAssociations = read.countAttribute(source, "max-associations");
  const minAssociations = read.countAttribute(source, "min-associations");
  const shuffle = read.xsBoolean(source, "shuffle", false);
  const prompt = read.content(source, "qti-prompt");
  const choices: GapMatchChoice[] = [];

  for (const child of read.elementsOf(source)) {
    if (read.isQti(child, "qti-gap-text") || read.isQti(child, "qti-gap-img")) {
      choices.push(readChoice(read, child));
    }
  }

  const gapped = read.nodes(source, {
    children: source.children.filter((child) => !isReadByName(read, child) && !isBlank(child)),
    own: ["qti-gap"],
  });

  return {
    ariaLabel: read.valueOf(source, "aria-label"),
    ariaLabelledby: read.valueOf(source, "aria-labelledby"),
    cardinality,
    choices,
    class: read.valueOf(source, "class"),
    gapped,
    kind: "gap-match",
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
  };
};

/**
 * The regions of a Gap Match's own content, in document order: its Prompt, each choice's content,
 * and the gapped content.
 *
 * @template L The level of its content.
 * @param interaction The model node.
 * @returns The regions, without their owner.
 */
const ownRegions = <L extends Level>(
  interaction: GapMatchInteraction<L>,
): readonly OwnRegion<GapMatchInteraction<L>, BodyNode<L>>[] => [
  ...promptRegion(interaction),
  ...choiceRegions<GapMatchInteraction<L>, BodyNode<L>, GapMatchChoice<L>>(
    interaction.choices,
    (each, step) => ({ ...each, choices: step(each.choices) }),
    Option.none(),
  ),
  contentRegion<GapMatchInteraction<L>, BodyNode<L>>(interaction.gapped, (each, gapped) => ({
    ...each,
    gapped,
  })),
];

/**
 * The Gap Match module.
 */
export const gapMatchModule: InteractionModule<"gap-match", GapMatchByLevel, GapMatchPayload> = {
  binding,
  element,
  feature,
  /**
   * The Gap Match with its Prompt's, its choices' and its gapped content emptied.
   */
  hollow: (interaction) => ({
    ...interaction,
    choices: interaction.choices.map((choice) => ({ ...choice, content: [] })),
    gapped: [],
    prompt: interaction.prompt.pipe(Option.map(() => [])),
  }),
  kind: "gap-match",
  parse,
  /**
   * Copy the Gap Match into its payload node: its content through the kit, its choices in the
   * order the seed and the instance present them, and the pairs the view shows.
   */
  redact: (interaction, kit) => ({
    ariaLabel: interaction.ariaLabel,
    ariaLabelledby: interaction.ariaLabelledby,
    choices: presented(interaction, kit.seed).map((choice) => ({
      catalog: choice.catalog,
      content: choice.content,
      identifier: choice.identifier,
      label: choice.label,
      matchGroup: listedIn(choice.matchGroup),
      matchMax: choice.matchMax,
    })),
    class: interaction.class,
    content: interaction.gapped,
    declared: {
      baseType: "directedPair",
      cardinality: interaction.cardinality,
      identifier: interaction.response,
    },
    gaps: gapsIn(interaction.gapped).map((gap) => ({
      ...gap,
      matchGroup: listedIn(gap.matchGroup),
    })),
    pairs: pairsOf(kit.shown(interaction.response)),
    prompt: interaction.prompt,
    response: interaction.response,
  }),
  /**
   * The regions of the node's own content, in document order: its Prompt, each choice's content,
   * and the gapped content.
   */
  referencingChoices: (interaction) => interaction.choices,
  regions: ownRegions,
};
