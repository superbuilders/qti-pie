/**
 * Graphic Gap Match (Q-8), the `qti-graphic-gap-match-interaction`: its model node, payload node,
 * parse, redaction and bindings, on the module shape of Gap Match
 * (`#plate/interactions/gap-match.ts`) with the image and the areas of Hotspot
 * (`#plate/interactions/hotspot.ts`).
 *
 * The readings of `docs/spec-readings.md` that bind this module, by their wording:
 *
 * - "A default hotspot is the last hotspot choice of its interaction, and a graphic gap match
 *   interaction has none." the database refuses a `default` associable hotspot here before the
 *   model is built, so {@link graphicGapMatchModule}'s `parse` never sees one and reads the four
 *   shapes that draw an area ({@link geometries}).
 * - "An area's `coords` that do not fit its shape are read as the HTML Standard's image-map
 *   processing reads an `area`'s." The module keeps each hotspot's coordinates as written, and the
 *   server shell's geometry reads them so (`#plate/graphic/geometry.ts`).
 * - "A `qti-gap` appears only within a gap-match interaction, and a `qti-hottext` may appear in any
 *   flow or inline content." the database refuses a `qti-gap` inside a gap text of this
 *   interaction, so a choice's content never holds one.
 *
 * The interaction binds a response of base type `directedPair` and cardinality `multiple`: each
 * pair is a gap choice, the source, and the associable hotspot it went to, the target. Unlike Gap
 * Match, a hotspot may hold several choices, up to its `match-max`, and one choice may go to one
 * hotspot several times, the pair then repeating in the value and counting each time against the
 * choice's `match-max`. A declaration of any other base type or cardinality is the notice
 * `base-type="…"` or `cardinality="…"`, as a binding no shipped kind renders is.
 *
 * {@link graphicGapMatchModule}'s `redact` gives the page the Prompt, the author's image (its
 * `img`, `picture` or `object`) and the size written on it, the gap choices in document order,
 * each gap image with the size written on it too, and the hotspots
 * in document order, each with its `match-group` and `match-max`, `max-associations`, the entry
 * name the pairs post under, one entry per pair, `"<choice> <hotspot>"` (decision D2), and the
 * pairs the view shows; the server shell renders it (`#plate/ui/item/interactions/`).
 *
 * The information model gives this interaction no `shuffle` (5.60) and a gap choice no `fixed`
 * (5.56, 5.58), and the database refuses either written (`unknown-attribute`), so the choices are
 * always presented in document order and the model holds neither.
 *
 * A coordinate written with `%` is kept as written, a percentage of the image, and the payload
 * carries the image's `width` and `height` when the author wrote both. An associable hotspot's
 * name is its `hotspot-label`, else its `aria-label`, and one with neither is marked on the item's
 * verdict ({@link areaLabel}), as Hotspot marks its own (WCAG 2.2, 1.1.1). The
 * strings this module adds, the messages of the limits plate's own messages do not cover, are
 * English and live here (D7).
 *
 * @module
 */
import { Option } from "effect";
import type { SourceElement } from "#plate/document/source.ts";
import { areaLabel, arrowOf, coordinatesOf } from "#plate/interactions/area.ts";
import type { AreaCoordinate, ArrowDirection } from "#plate/interactions/area.ts";
import { pointStyleOf, statisticOf } from "#plate/interactions/plot-roles.ts";
import type { PointStyle, Statistic } from "#plate/interactions/plot-roles.ts";
import {
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
import { authoredSizeOf, imageElementOf } from "#plate/interactions/image-size.ts";
import type { AuthoredSize } from "#plate/interactions/image-size.ts";
import { pairsOf } from "#plate/interactions/pair.ts";
import type { Pair } from "#plate/interactions/pair.ts";
import type {
  BodyNode,
  Level,
  ModelLevel,
  Nodes,
  RedactedLevel,
  ReferencingChoice,
  Unsupported,
} from "#plate/model/item.ts";
import type { AreaGeometry } from "#plate/vocabulary.ts";

/**
 * Graphic Gap Match's identifier in the QTI 3.0 conformance list, Appendix A.
 */
const feature = "Q-8";

/**
 * The QTI element Graphic Gap Match is read from, which its notice names.
 */
const element = "qti-graphic-gap-match-interaction";

/**
 * The binding Graphic Gap Match renders with: "The graphicGapMatchInteraction must be bound to a
 * response variable with base-type directedPair and multiple cardinality" (section 5.60).
 */
const binding = { baseTypes: ["directedPair"], cardinalities: ["multiple"] } as const;

/**
 * The shape of an associable hotspot that draws an area: every value of `shape` but `default`,
 * which the database refuses on this interaction (reading 80).
 */
type HotspotGeometry = Exclude<AreaGeometry, "default">;

/**
 * The values of an associable hotspot's `shape` attribute this module reads: the XSD enumerates
 * `default` too, which never reaches the model here.
 */
const geometries = [
  "circle",
  "ellipse",
  "poly",
  "rect",
] as const satisfies readonly HotspotGeometry[];

/**
 * One `qti-gap-text` or `qti-gap-img` of a Graphic Gap Match (Q-8): a choice of the pair's source
 * side.
 *
 * @template L The level of its content.
 */
interface GraphicGapMatchChoice<L extends Level = ModelLevel> extends ReferencingChoice {
  /**
   * The choice's content as the body walk read it: the gap text's text and markup, or the gap
   * image's `img`, `picture` or `object`.
   */
  readonly content: Nodes<L>;
  /**
   * `object-label` of a `qti-gap-img`: the text that names the image, none for a gap text.
   */
  readonly label: Option.Option<string>;
  /**
   * `match-group`: the hotspots this choice may go to.
   */
  readonly matchGroup: MatchGroup;
  /**
   * `match-max`: the most hotspots this choice may fill, a repeat on one hotspot counting each
   * time; 0 is no limit.
   */
  readonly matchMax: bigint;
  /**
   * `match-min`, 0 when absent: the fewest hotspots this choice must fill for a valid response.
   */
  readonly matchMin: bigint;
  /**
   * The number line's dot its class asks for where it is placed, none for none
   * ({@link pointStyleOf}).
   */
  readonly point: Option.Option<PointStyle>;
  /**
   * The size written on the choice's image, the first `img`, `picture` or `object` it holds, which
   * the page fits the choice on the image by; `neither` for a choice that holds no image, a gap
   * text.
   */
  readonly size: AuthoredSize;
  /**
   * The box plot's statistic its class says it places, none for none ({@link statisticOf}).
   */
  readonly statistic: Option.Option<Statistic>;
}

/**
 * One `qti-associable-hotspot` of a Graphic Gap Match (Q-8): a gap of the pair's target side, an
 * area of the image, with the catalog it references.
 */
interface AssociableHotspot extends ReferencingChoice {
  /**
   * The arrow its author's class `plate-arrow-up` or `plate-arrow-down` asks the page to draw
   * beside it, none for none ({@link arrowOf}).
   */
  readonly arrow: Option.Option<ArrowDirection>;
  readonly coords: readonly AreaCoordinate[];
  /**
   * The area's geometry, its `shape`.
   */
  readonly geometry: HotspotGeometry;
  /**
   * The area's name, which names the gap: its `hotspot-label`, else its `aria-label`; none when the
   * author wrote neither ({@link areaLabel}).
   */
  readonly label: Option.Option<string>;
  /**
   * `match-group`: the choices this hotspot accepts.
   */
  readonly matchGroup: MatchGroup;
  /**
   * `match-max`: the most choices this hotspot holds; 0 is no limit.
   */
  readonly matchMax: bigint;
  /**
   * `match-min`, 0 when absent: the fewest choices this hotspot must hold for a valid response.
   */
  readonly matchMin: bigint;
  /**
   * The box plot's statistic its class says is given here, drawn into the picture rather than
   * placed, none for none ({@link statisticOf}).
   */
  readonly statistic: Option.Option<Statistic>;
}

/**
 * The model node of a Graphic Gap Match (Q-8), the kind `graphic-gap-match`: its Prompt, its
 * image, its choices and its hotspots in document order, and the limits and messages it declares,
 * bound to a `directedPair` response of `multiple` cardinality.
 *
 * @template L The level of its content.
 */
interface GraphicGapMatchInteraction<
  L extends Level = ModelLevel,
> extends ModuleInteraction<"graphic-gap-match"> {
  readonly choices: readonly GraphicGapMatchChoice<L>[];
  /**
   * The author's `class`, as written, none when absent.
   */
  readonly class: Option.Option<string>;
  readonly hotspots: readonly AssociableHotspot[];
  /**
   * The image element and its subtree, read as body content, so the payload resolves its URL and
   * keeps its `alt`.
   */
  readonly image: Nodes<L>;
  /**
   * `max-associations`, 1 when absent (the default the ASI XSD gives it, reading 190): the
   * most pairs a response may hold; 0 is no limit.
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
   * The size the author wrote on the image, the pixel space the hotspots are drawn in.
   */
  readonly size: AuthoredSize;
}

/**
 * A Graphic Gap Match's model node at each level.
 */
interface GraphicGapMatchByLevel extends ByLevel {
  readonly node: GraphicGapMatchInteraction<this["level"]>;
}

/**
 * One choice as the page may know it: the catalog it references, its content, and what the server
 * shell reads of its limits.
 */
interface GraphicGapMatchPayloadChoice extends ReferencingChoice {
  readonly content: Nodes<RedactedLevel>;
  readonly label: Option.Option<string>;
  /**
   * The hotspots the choice may go to, none listed when it may go to any.
   */
  readonly matchGroup: readonly string[];
  readonly matchMax: bigint;
  readonly point: Option.Option<PointStyle>;
  readonly size: AuthoredSize;
  readonly statistic: Option.Option<Statistic>;
}

/**
 * One hotspot as the page may know it: its identifier and the catalog it references, label,
 * geometry and coordinates, and what the server shell reads of its limits.
 */
interface GraphicGapMatchPayloadHotspot extends ReferencingChoice {
  readonly arrow: Option.Option<ArrowDirection>;
  readonly statistic: Option.Option<Statistic>;
  readonly coords: readonly AreaCoordinate[];
  readonly geometry: HotspotGeometry;
  readonly label: Option.Option<string>;
  /**
   * The choices the hotspot accepts, none listed when it accepts any.
   */
  readonly matchGroup: readonly string[];
  readonly matchMax: bigint;
}

/**
 * The payload node of a Graphic Gap Match (Q-8), the kind `graphic-gap-match`: its Prompt, its
 * image, its choices in document order, its hotspots, the name its pairs post under, and the pairs
 * to show. It holds no correct response.
 */
interface GraphicGapMatchPayload {
  readonly ariaLabel: Option.Option<string>;
  readonly ariaLabelledby: Option.Option<string>;
  readonly choices: readonly GraphicGapMatchPayloadChoice[];
  /**
   * The author's `class`, as written, none when absent.
   */
  readonly class: Option.Option<string>;
  /**
   * The name its pairs post under: the view's name for the response, else
   * `entryName(instance, response)`.
   */
  readonly formName: string;
  readonly hotspots: readonly GraphicGapMatchPayloadHotspot[];
  readonly image: Nodes<RedactedLevel>;
  /**
   * `max-associations` as the item reads it: 0 is no limit.
   */
  readonly maxAssociations: bigint;
  readonly prompt: Option.Option<Nodes<RedactedLevel>>;
  /**
   * The identifier of the response it binds.
   */
  readonly response: string;
  /**
   * The pairs to show, each a gap image as its chip and a hotspot as its target: the view's value.
   */
  readonly pairs: readonly Pair[];
  readonly size: AuthoredSize;
}

/**
 * Read one `qti-gap-text` or `qti-gap-img` into its choice: its identifier, its limits, the catalog
 * it references (its `data-catalog-idref`, recorded before its content's so the references stay in
 * document order) and its content as the body walk reads it.
 *
 * @param read The reader kit.
 * @param choice The gap text or gap image.
 * @returns The choice.
 */
const readChoice = (read: ReaderKit, choice: SourceElement): GraphicGapMatchChoice => {
  read.markElement(choice);
  markTemplate(read, choice);

  const matchMax = read.countAttribute(choice, "match-max");
  const matchMin = read.countAttribute(choice, "match-min");
  const catalog = read.catalog(choice);
  const classes = read.valueOf(choice, "class");

  return {
    catalog,
    content: read.nodes(choice),
    identifier: read.identifierAttribute(choice, "identifier"),
    label: read.valueOf(choice, "object-label"),
    matchGroup: matchGroupOf(read.valueOf(choice, "match-group")),
    matchMax: Option.getOrElse(matchMax, () => 0n),
    matchMin: Option.getOrElse(matchMin, () => 0n),
    point: pointStyleOf(classes),
    size: Option.match(imageElementOf(read, choice), {
      onNone: (): AuthoredSize => ({ kind: "neither" }),
      onSome: (image) => authoredSizeOf(read, image),
    }),
    statistic: statisticOf(classes),
  };
};

/**
 * Read one `qti-associable-hotspot` into its hotspot: its identifier, the catalog it references,
 * its geometry and coordinates as written, its name, its limits, and the arrow its author's class
 * asks for.
 *
 * @param read The reader kit.
 * @param hotspot The associable hotspot.
 * @returns The hotspot.
 */
const readHotspot = (read: ReaderKit, hotspot: SourceElement): AssociableHotspot => {
  read.markElement(hotspot);
  markTemplate(read, hotspot);

  const identifier = read.identifierAttribute(hotspot, "identifier");
  const geometryAttribute = read.requiredAttribute(hotspot, "shape");
  const geometry = read.listed(hotspot, "shape", geometryAttribute, geometries);
  const coords = coordinatesOf(read, hotspot);
  const label = areaLabel(read, hotspot);
  const catalog = read.catalog(hotspot);

  const matchMax = read.countAttribute(hotspot, "match-max");
  const matchMin = read.countAttribute(hotspot, "match-min");

  const classes = read.valueOf(hotspot, "class");

  return {
    arrow: arrowOf(classes),
    catalog,
    coords,
    geometry,
    identifier,
    label,
    matchGroup: matchGroupOf(read.valueOf(hotspot, "match-group")),
    matchMax: Option.getOrElse(matchMax, () => 0n),
    matchMin: Option.getOrElse(matchMin, () => 0n),
    statistic: statisticOf(classes),
  };
};

/**
 * Read a `qti-graphic-gap-match-interaction` into its model node, through the kit.
 *
 * The body walk has bound it to a `directedPair` response of cardinality `multiple`
 * ({@link binding}). The interaction must hold an image (the notice
 * `qti-graphic-gap-match-interaction` when it has none). The Prompt, each choice's content and the
 * image are read by the body walk. The features it reads and does not render are recorded as
 * marks: `data-choices-container-width`, and `template-identifier` on a choice or a hotspot.
 *
 * @param source The interaction's source element.
 * @param context The element's path, its notice, the reader kit and the declaration it is bound
 *   to.
 * @returns The model node, its notice.
 */
const parse = (
  source: SourceElement,
  context: ModuleParseContext,
): Parsed<GraphicGapMatchInteraction> | Unsupported => {
  const { bound, read } = context;
  const response = bound.identifier;
  const imageElement = imageElementOf(read, source);
  if (Option.isNone(imageElement)) {
    return context.notice(element);
  }

  const image = imageElement.value;

  read.markElement(source);
  if (Option.isSome(read.valueOf(source, "data-choices-container-width"))) {
    read.mark(source, "data-choices-container-width");
  }

  const maxAssociations = read.countAttribute(source, "max-associations");
  const minAssociations = read.countAttribute(source, "min-associations");
  const prompt = read.content(source, "qti-prompt");
  const imageNodes = read.nodes(source, { children: [image] });
  const choices: GraphicGapMatchChoice[] = [];
  const hotspots: AssociableHotspot[] = [];

  for (const child of read.elementsOf(source)) {
    if (read.isQti(child, "qti-gap-text") || read.isQti(child, "qti-gap-img")) {
      choices.push(readChoice(read, child));
    } else if (read.isQti(child, "qti-associable-hotspot")) {
      hotspots.push(readHotspot(read, child));
    }
  }

  return {
    ariaLabel: read.valueOf(source, "aria-label"),
    ariaLabelledby: read.valueOf(source, "aria-labelledby"),
    choices,
    class: read.valueOf(source, "class"),
    hotspots,
    image: imageNodes,
    kind: "graphic-gap-match",
    maxAssociations: Option.getOrElse(maxAssociations, () => 1n),
    messages: {
      max: read.valueOf(source, "data-max-selections-message"),
      min: read.valueOf(source, "data-min-selections-message"),
    },
    minAssociations: Option.getOrElse(minAssociations, () => 0n),
    path: context.path,
    prompt,
    response,
    size: authoredSizeOf(read, image),
  };
};

/**
 * The regions of a Graphic Gap Match's own content, in document order: its Prompt, its image, then
 * each choice's content.
 *
 * @template L The level of its content.
 * @param interaction The model node.
 * @returns The regions, without their owner.
 */
const ownRegions = <L extends Level>(
  interaction: GraphicGapMatchInteraction<L>,
): readonly OwnRegion<GraphicGapMatchInteraction<L>, BodyNode<L>>[] => [
  ...promptRegion(interaction),
  contentRegion<GraphicGapMatchInteraction<L>, BodyNode<L>>(interaction.image, (each, image) => ({
    ...each,
    image,
  })),
  ...choiceRegions<GraphicGapMatchInteraction<L>, BodyNode<L>, GraphicGapMatchChoice<L>>(
    interaction.choices,
    (each, step) => ({ ...each, choices: step(each.choices) }),
  ),
];

/**
 * The Graphic Gap Match module (Q-8), the kind `graphic-gap-match`.
 */
export const graphicGapMatchModule: InteractionModule<
  "graphic-gap-match",
  GraphicGapMatchByLevel,
  GraphicGapMatchPayload
> = {
  binding,
  element,
  feature,
  /**
   * The Graphic Gap Match with its Prompt's, its image's and its choices' content emptied.
   */
  hollow: (interaction) => ({
    ...interaction,
    choices: interaction.choices.map((choice) => ({ ...choice, content: [] })),
    image: [],
    prompt: interaction.prompt.pipe(Option.map(() => [])),
  }),
  kind: "graphic-gap-match",
  parse,
  /**
   * Copy the Graphic Gap Match into its payload node: its content through the kit, its choices and
   * its hotspots in document order, and the pairs the view shows.
   */
  redact: (interaction, kit) => ({
    ariaLabel: interaction.ariaLabel,
    ariaLabelledby: interaction.ariaLabelledby,
    choices: interaction.choices.map((choice) => ({
      catalog: choice.catalog,
      content: choice.content,
      identifier: choice.identifier,
      label: choice.label,
      matchGroup: listedIn(choice.matchGroup),
      matchMax: choice.matchMax,
      point: choice.point,
      size: choice.size,
      statistic: choice.statistic,
    })),
    class: interaction.class,
    formName: kit.formName(interaction.response),
    hotspots: interaction.hotspots.map((hotspot) => ({
      arrow: hotspot.arrow,
      catalog: hotspot.catalog,
      coords: hotspot.coords,
      geometry: hotspot.geometry,
      identifier: hotspot.identifier,
      label: hotspot.label,
      matchGroup: listedIn(hotspot.matchGroup),
      matchMax: hotspot.matchMax,
      statistic: hotspot.statistic,
    })),
    image: interaction.image,
    maxAssociations: interaction.maxAssociations,
    pairs: pairsOf(kit.shown(interaction.response)),
    prompt: interaction.prompt,
    response: interaction.response,
    size: interaction.size,
  }),
  /**
   * The regions of the node's own content, in document order: its Prompt, its image, then each
   * choice's content.
   */
  regions: ownRegions,
};
