/**
 * Graphic Associate (Q-7, the `graphic-associate` kind): `qti-graphic-associate-interaction` read
 * into its model node, copied into its payload node, and checked.
 *
 * {@link graphicAssociateModule}'s `redact` gives the page the Prompt, the author's image (`img`,
 * `picture` or `object`), each associable hotspot in document order with its area, coordinates,
 * name, `match-max` and `match-group`, `max-associations`, the entry name the pairs post
 * under, one entry per pair, `"<a> <b>"`, and the pairs the view shows; the server shell renders it
 * (`#plate/ui/item/interactions/`). Nothing but the response is posted, so a post is a `pair`
 * response of the declared cardinality. Without pointer selection the hotspots are offered in
 * document order.
 *
 * It follows three readings of `docs/spec-readings.md`, each cited by its wording:
 *
 * - "A default hotspot is the last hotspot choice of its interaction, and a graphic gap match
 *   interaction has none." The reading binds `qti-hotspot-choice` and says nothing of this
 *   interaction's `qti-associable-hotspot`, so here a `default` hotspot may stand anywhere, and it
 *   is offered in document order like any other.
 * - "An area's `coords` that do not fit its shape are read as the HTML Standard's image-map
 *   processing reads an `area`'s." The module keeps each hotspot's coordinates as written, and the
 *   server shell's geometry reads them so (`#plate/ui/graphic/geometry.ts`).
 * - "A `default` shape carries `coords`, as every shape does, and they are a `CoordsDType`." A
 *   default hotspot's coordinates are read and kept as written; its area is the whole image,
 *   whatever they say.
 *
 * Two defaults of this interaction, in tier (a) of the QTI database's admission: a hotspot never
 * pairs with itself, and one pair given twice, in either order, is refused. An unwritten
 * `max-associations` reads as the XSD's default on this interaction, 1, and 0 is no limit; an
 * unwritten `min-associations` is no minimum; `match-max` is required of each hotspot and 0 is no
 * limit; `match-min` is 0 when absent. A hotspot's `match-group`, when written, names the hotspots
 * it may pair with, and a pair is outside the group when either side names a group the other is
 * not in.
 *
 * A coordinate written with `%` is kept as written, a percentage of the image, whose size is the
 * `width` and `height` the payload's image nodes carry (a circle's radius of the smaller of the
 * two, reading 180). An associable hotspot's name is its
 * `hotspot-label`, else its `aria-label`, and one with neither is marked on the item's verdict
 * ({@link areaLabel}), as Hotspot marks its own (WCAG 2.2, 1.1.1).
 *
 * @module
 * @see https://html.spec.whatwg.org/multipage/image-maps.html#image-map-processing-model
 */
import { Option } from "effect";
import type { SourceElement } from "#plate/document/source.ts";
import { areaLabel, coordinatesOf } from "#plate/interactions/area.ts";
import type { AreaCoordinate } from "#plate/interactions/area.ts";
import {
  boundIn,
  contentRegion,
  markTemplate,
  promptRegion,
} from "#plate/interactions/contract.ts";
import type {
  ByLevel,
  InteractionModule,
  ModuleInteraction,
  OwnRegion,
  ReaderKit,
  RedactKit,
} from "#plate/interactions/contract.ts";
import { listedIn, matchGroupOf } from "#plate/interactions/match-group.ts";
import type { MatchGroup } from "#plate/interactions/match-group.ts";
import { authoredSizeOf, imageElementOf } from "#plate/interactions/image-size.ts";
import { unorderedKey, unorderedPairsOf } from "#plate/interactions/pair.ts";
import type { UnorderedPair } from "#plate/interactions/pair.ts";
import type { AuthoredSize } from "#plate/interactions/image-size.ts";
import type {
  BodyNode,
  Level,
  ModelLevel,
  Nodes,
  RedactedLevel,
  ReferencingChoice,
} from "#plate/model/item.ts";
import { isRecordValue } from "#plate/model/values.ts";
import type { ResponseValue, Single } from "#plate/model/values.ts";
import { areaGeometries } from "#plate/vocabulary.ts";
import type { AreaGeometry } from "#plate/vocabulary.ts";

/**
 * Graphic Associate's identifier in the QTI 3.0 conformance list, Appendix A.
 */
const feature = "Q-7";

/**
 * The QTI element Graphic Associate is read from, which its notice names.
 */
const element = "qti-graphic-associate-interaction";

/**
 * The binding Graphic Associate renders with: "The graphicAssociateInteraction must be bound to a
 * response variable with base-type pair and either single or multiple cardinality" (section 5.59).
 */
const binding = { baseTypes: ["pair"], cardinalities: ["single", "multiple"] } as const;

/**
 * One `qti-associable-hotspot` of a Graphic Associate (Q-7): its identifier and the catalog it
 * references, the geometry of its area and the coordinates that geometry reads, its name ({@link
 * areaLabel}), and the limits on the pairs it may be in.
 */
interface GraphicAssociateHotspot extends ReferencingChoice {
  readonly coords: readonly AreaCoordinate[];
  /**
   * The area's geometry, its `shape`.
   */
  readonly geometry: AreaGeometry;
  readonly label: Option.Option<string>;
  /**
   * `match-group`: the hotspots this one may pair with.
   */
  readonly matchGroup: MatchGroup;
  /**
   * `match-max`: the most pairs this hotspot may be in; 0 is no limit.
   */
  readonly matchMax: bigint;
  /**
   * `match-min`, 0 when absent: the fewest pairs this hotspot must be in for a valid response.
   */
  readonly matchMin: bigint;
}

/**
 * A `qti-graphic-associate-interaction` as the item model holds it (Q-7, `graphic-associate`):
 * its Prompt, its image and the size written on it, its hotspots in document order, and the bounds
 * on its pairs, bound to a `pair` response of `single` or `multiple` cardinality.
 *
 * `image` holds the author's image element (`img`, `picture` or `object`) as body nodes, none when
 * the document has no such element, which the database refuses first.
 *
 * @template L The level of its content.
 */
interface GraphicAssociateInteraction<
  L extends Level = ModelLevel,
> extends ModuleInteraction<"graphic-associate"> {
  /**
   * The bound response's cardinality.
   */
  readonly cardinality: "multiple" | "single";
  /**
   * The author's `class`, as written, none when absent.
   */
  readonly class: Option.Option<string>;
  readonly hotspots: readonly GraphicAssociateHotspot[];
  readonly image: Nodes<L>;
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
   * The size the author wrote on the image, the pixel space the hotspots are drawn in; `neither`
   * where there is no image.
   */
  readonly size: AuthoredSize;
}

/**
 * A Graphic Associate's model node at each level.
 */
interface GraphicAssociateByLevel extends ByLevel {
  readonly node: GraphicAssociateInteraction<this["level"]>;
}

/**
 * One hotspot as the page may know it: what the server shell reads of it, the catalog it
 * references among it.
 */
interface GraphicAssociatePayloadHotspot extends ReferencingChoice {
  readonly coords: readonly AreaCoordinate[];
  /**
   * The area's geometry, its `shape`.
   */
  readonly geometry: AreaGeometry;
  readonly label: Option.Option<string>;
  /**
   * The hotspots this one may pair with, none listed when it may pair with any.
   */
  readonly matchGroup: readonly string[];
  readonly matchMax: bigint;
}

/**
 * A Graphic Associate as the page may know it (Q-7, `graphic-associate`): its hotspots and its
 * image, the most pairs, the name its pairs post under, and the pairs the view shows. It
 * holds no correct response: `pairs` is the stored, posted or solution value the view gave, kept
 * to the hotspots ({@link keptPairs}).
 */
interface GraphicAssociatePayload {
  readonly ariaLabel: Option.Option<string>;
  readonly ariaLabelledby: Option.Option<string>;
  readonly class: Option.Option<string>;
  /**
   * The name its pairs post under: the view's name for the response, else
   * `entryName(instance, response)`.
   */
  readonly formName: string;
  readonly hotspots: readonly GraphicAssociatePayloadHotspot[];
  readonly image: Nodes<RedactedLevel>;
  readonly maxAssociations: bigint;
  /**
   * The pairs to show, each two hotspot identifiers in the order the view gave them, each naming
   * two different hotspots, no pair twice in either order, and at most `maxAssociations` of them
   * when that is above 0.
   */
  readonly pairs: readonly UnorderedPair[];
  readonly prompt: Option.Option<Nodes<RedactedLevel>>;
  /**
   * The identifier of the response it binds.
   */
  readonly response: string;
  readonly size: AuthoredSize;
}

/**
 * Keep the pairs the page can show: each names two different hotspots, each association once at
 * its first place whichever order it came in, and at most as many as the interaction allows when
 * `max-associations` is above 0.
 *
 * @param interaction The hotspots and the most pairs.
 * @param interaction.hotspots The hotspots.
 * @param interaction.maxAssociations The most pairs; 0 is no limit.
 * @param given The pairs, in the order shown.
 * @returns The pairs the page shows, in order.
 */
const keptPairs = (
  interaction: {
    readonly hotspots: readonly { readonly identifier: string }[];
    readonly maxAssociations: bigint;
  },
  given: readonly UnorderedPair[],
): readonly UnorderedPair[] => {
  const known = new Set(interaction.hotspots.map((hotspot) => hotspot.identifier));
  const seen = new Set<string>();
  const kept: UnorderedPair[] = [];

  for (const pair of given) {
    const [a, b] = pair;
    const key = unorderedKey(pair);
    if (a !== b && known.has(a) && known.has(b) && !seen.has(key)) {
      seen.add(key);
      kept.push(pair);
    }
  }

  return interaction.maxAssociations > 0n
    ? kept.slice(0, Number(interaction.maxAssociations))
    : kept;
};

/**
 * Give the value a restored or solved response shows: the stored pairs kept to the hotspots
 * ({@link keptPairs}), the value's type as it was.
 *
 * @param interaction The model node.
 * @param stored The stored or correct response.
 * @returns The value the interaction shows; a record, which a `pair` never is, as it was.
 */
const shownValue = (
  interaction: GraphicAssociateInteraction,
  stored: ResponseValue,
): ResponseValue => {
  if (isRecordValue(stored)) {
    return stored;
  }

  return {
    ...stored,
    values: keptPairs(interaction, unorderedPairsOf(stored.values)).map((pair): Single => ({
      baseType: "pair",
      value: pair,
    })),
  };
};

/**
 * Read one `qti-associable-hotspot`: its identifier, the catalog it references, its geometry and
 * coordinates, its name ({@link areaLabel}) and its limits. A `template-identifier` is a mark,
 * since no template value reaches a module's `parse`.
 *
 * @param read The reader kit.
 * @param choice The `qti-associable-hotspot` element.
 * @returns The hotspot.
 */
const hotspotOf = (read: ReaderKit, choice: SourceElement): GraphicAssociateHotspot => {
  read.markElement(choice);

  const identifier = read.identifierAttribute(choice, "identifier");
  const written = read.requiredAttribute(choice, "shape");
  const geometry = read.listed(choice, "shape", written, areaGeometries);
  const coords = coordinatesOf(read, choice);
  const label = areaLabel(read, choice);
  const catalog = read.catalog(choice);

  const matchMax = read.countAttribute(choice, "match-max");
  const matchMin = read.countAttribute(choice, "match-min");
  markTemplate(read, choice);

  return {
    catalog,
    coords,
    geometry,
    identifier,
    label,
    matchGroup: matchGroupOf(read.valueOf(choice, "match-group")),
    matchMax: Option.getOrElse(matchMax, () => 0n),
    matchMin: Option.getOrElse(matchMin, () => 0n),
  };
};

/**
 * The elements of the image the interaction holds, by the part of the region that holds them.
 *
 * @template L The level of its content.
 * @param interaction The model node.
 * @returns The Prompt's region, when it has a Prompt, then the image's.
 */
const ownRegions = <L extends Level>(
  interaction: GraphicAssociateInteraction<L>,
): readonly OwnRegion<GraphicAssociateInteraction<L>, BodyNode<L>>[] => [
  ...promptRegion(interaction),
  contentRegion<GraphicAssociateInteraction<L>, BodyNode<L>>(interaction.image, (each, image) => ({
    ...each,
    image,
  })),
];

/**
 * Copy a Graphic Associate's model node into its payload node: its content through the kit, the
 * response's entry name, and the pairs the view shows.
 *
 * The pairs are the values the view shows ({@link RedactKit.shown}), each kept to the hotspots
 * ({@link keptPairs}): a pair that names no hotspot or a hotspot with itself is not shown, and an
 * association twice is shown once, at its first place.
 *
 * @param interaction The model node.
 * @param kit What the payload hands a module's `redact`.
 * @returns The payload node.
 */
const redactGraphicAssociate = (
  interaction: GraphicAssociateInteraction<RedactedLevel>,
  kit: RedactKit,
): GraphicAssociatePayload => ({
  ariaLabel: interaction.ariaLabel,
  ariaLabelledby: interaction.ariaLabelledby,
  class: interaction.class,
  formName: kit.formName(interaction.response),
  hotspots: interaction.hotspots.map((hotspot) => ({
    catalog: hotspot.catalog,
    coords: hotspot.coords,
    geometry: hotspot.geometry,
    identifier: hotspot.identifier,
    label: hotspot.label,
    matchGroup: listedIn(hotspot.matchGroup),
    matchMax: hotspot.matchMax,
  })),
  image: interaction.image,
  maxAssociations: interaction.maxAssociations,
  pairs: keptPairs(interaction, unorderedPairsOf(kit.shown(interaction.response))),
  prompt: interaction.prompt,
  response: interaction.response,
  size: interaction.size,
});

/**
 * The Graphic Associate module: reads `qti-graphic-associate-interaction`, copies and checks it;
 * the server shell renders its payload node.
 */
export const graphicAssociateModule: InteractionModule<
  "graphic-associate",
  GraphicAssociateByLevel,
  GraphicAssociatePayload
> = {
  binding,
  element,
  feature,
  /**
   * The Graphic Associate with its Prompt's and its image's content emptied.
   */
  hollow: (interaction) => ({
    ...interaction,
    image: [],
    prompt: interaction.prompt.pipe(Option.map(() => [])),
  }),
  kind: "graphic-associate",
  /**
   * Read `qti-graphic-associate-interaction`, which the body walk has bound to a `pair` response of
   * `single` or `multiple` cardinality ({@link binding}): its Prompt, its image, its
   * `qti-associable-hotspot` children and the bounds it wrote.
   */
  parse: (source, context) => {
    const { read } = context;

    return (() => {
      const { cardinality } = boundIn(binding, context.bound);
      read.markElement(source);

      const maxAssociations = read.countAttribute(source, "max-associations");
      const minAssociations = read.countAttribute(source, "min-associations");
      const prompt = read.content(source, "qti-prompt");
      const imageElement = imageElementOf(read, source);
      const image = Option.match(imageElement, {
        onNone: (): readonly BodyNode[] => [],
        onSome: (child) => read.nodes(source, { children: [child] }),
      });
      const hotspots: GraphicAssociateHotspot[] = [];
      for (const choice of read.childrenNamed(source, "qti-associable-hotspot")) {
        hotspots.push(hotspotOf(read, choice));
      }

      return {
        ariaLabel: read.valueOf(source, "aria-label"),
        ariaLabelledby: read.valueOf(source, "aria-labelledby"),
        cardinality,
        class: read.valueOf(source, "class"),
        hotspots,
        image,
        kind: "graphic-associate" as const,
        maxAssociations: Option.getOrElse(maxAssociations, () => 1n),
        minAssociations: Option.getOrElse(minAssociations, () => 0n),
        path: context.path,
        prompt,
        response: context.bound.identifier,
        size: Option.match(imageElement, {
          onNone: (): AuthoredSize => ({ kind: "neither" }),
          onSome: (child) => authoredSizeOf(read, child),
        }),
      };
    })();
  },
  /**
   * Graphic Associate's payload copy: {@link redactGraphicAssociate}.
   */
  redact: redactGraphicAssociate,
  /**
   * The Prompt's region, when it has a Prompt, then the image's.
   */
  regions: ownRegions,
  /**
   * The value the interaction shows for a stored or correct value ({@link shownValue}).
   */
  shown: shownValue,
};
