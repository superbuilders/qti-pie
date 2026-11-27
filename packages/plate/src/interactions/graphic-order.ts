/**
 * Graphic Order (Q-9, the `graphic-order` kind): `qti-graphic-order-interaction` read into its
 * model node, copied into its payload node, and checked.
 *
 * {@link graphicOrderModule}'s `redact` gives the page the Prompt, the author's image (`img`,
 * `picture` or `object`), each hotspot in document order with its area, coordinates and
 * name, the effective bounds, the declaration of the response its island writes, one value per
 * ordered hotspot in order, and the order the view shows; the server shell renders it
 * (`#plate/ui/item/interactions/`). Nothing but the response is posted, so a post is an `ordered`
 * `identifier` response.
 *
 * It follows four readings of `docs/spec-readings.md`, each cited by its wording:
 *
 * - "An order or graphic-order interaction's `min-choices`, where written, is from 1 to its number of
 *   choices, and a `max-choices` written beside it is from `min-choices` to its number of choices."
 *   the database refuses the bounds that break it. With no `min-choices` every hotspot must be
 *   ordered and `max-choices` is ignored, so the effective bounds are the number of hotspots twice
 *   ({@link boundsOf}), which the payload carries.
 * - "A default hotspot is the last hotspot choice of its interaction, and a graphic gap match
 *   interaction has none." the database refuses one that is not last; a default hotspot is ordered
 *   like any other.
 * - "An area's `coords` that do not fit its shape are read as the HTML Standard's image-map
 *   processing reads an `area`'s." The module keeps each hotspot's coordinates as written, and the
 *   server shell's geometry reads them so (`#plate/graphic/geometry.ts`).
 * - "A `default` shape carries `coords`, as every shape does, and they are a `CoordsDType`." A
 *   default hotspot's coordinates are read and kept as written; its area is the whole image,
 *   whatever they say.
 *
 * A coordinate written with `%` is kept as written, a percentage of the image, whose size is the
 * `width` and `height` the payload's image nodes carry (a circle's radius of the smaller of the
 * two, reading `circle-percentage-radius`). A hotspot's name is its `hotspot-label`, else its
 * `aria-label`, and one with neither is marked on the item's verdict ({@link areaLabel}), as
 * Hotspot marks its own (WCAG 2.2, 1.1.1).
 *
 * @module
 * @see https://html.spec.whatwg.org/multipage/image-maps.html#image-map-processing-model
 */
import { Array as Arr, Option } from "effect";
import type { SourceElement } from "#plate/document/source.ts";
import { areaLabel, coordinatesOf } from "#plate/interactions/area.ts";
import type { AreaCoordinate } from "#plate/interactions/area.ts";
import { contentRegion, markTemplate, promptRegion } from "#plate/interactions/contract.ts";
import type {
  ByLevel,
  InteractionModule,
  ModuleInteraction,
  OwnRegion,
  ReaderKit,
  RedactKit,
} from "#plate/interactions/contract.ts";
import { authoredSizeOf, imageElementOf } from "#plate/interactions/image-size.ts";
import type { AuthoredSize } from "#plate/interactions/image-size.ts";
import type {
  BodyNode,
  Level,
  ModelLevel,
  Nodes,
  RedactedLevel,
  ReferencingChoice,
} from "#plate/model/item.ts";
import { format } from "#plate/model/values.ts";
import { isRecordValue } from "#plate/model/record-value.ts";
import type { Declared, ResponseValue } from "#plate/model/values.ts";
import { areaGeometries } from "#plate/vocabulary.ts";
import type { AreaGeometry } from "#plate/vocabulary.ts";

/**
 * Graphic Order's identifier in the QTI 3.0 conformance list, Appendix A.
 */
const feature = "Q-9";

/**
 * The QTI element Graphic Order is read from, which its notice names.
 */
const element = "qti-graphic-order-interaction";

/**
 * The binding Graphic Order renders with: "The order hotspot interaction must be bound to a
 * response variable with a base-type of identifier and ordered cardinality" (section 5.61).
 */
const binding = { baseTypes: ["identifier"], cardinalities: ["ordered"] } as const;

/**
 * One `qti-hotspot-choice` of a Graphic Order (Q-9): its identifier and the catalog it references,
 * the geometry of its area and the coordinates that area's geometry reads, and its name: its
 * `hotspot-label`, else its `aria-label`, none when the author wrote neither ({@link areaLabel}).
 */
interface GraphicOrderHotspot extends ReferencingChoice {
  readonly coords: readonly AreaCoordinate[];
  /**
   * The area's geometry, its `shape`.
   */
  readonly geometry: AreaGeometry;
  readonly label: Option.Option<string>;
}

/**
 * A `qti-graphic-order-interaction` as the item model holds it (Q-9, `graphic-order`): its Prompt,
 * its image and the size written on it, its hotspots in document order, and the bounds it wrote.
 *
 * `minChoices` and `maxChoices` are the counts as written, none when absent; the bounds the
 * interaction enforces are {@link boundsOf}'s, never these alone. `image` holds the author's image
 * element (`img`, `picture` or `object`) as body nodes, none when the document has no such element,
 * which the database refuses first.
 *
 * @template L The level of its content.
 */
interface GraphicOrderInteraction<
  L extends Level = ModelLevel,
> extends ModuleInteraction<"graphic-order"> {
  /**
   * The author's `class`, as written, none when absent.
   */
  readonly class: Option.Option<string>;
  readonly hotspots: readonly GraphicOrderHotspot[];
  readonly image: Nodes<L>;
  readonly maxChoices: Option.Option<bigint>;
  readonly minChoices: Option.Option<bigint>;
  readonly prompt: Option.Option<Nodes<L>>;
  /**
   * The size the author wrote on the image, the pixel space the hotspots are drawn in; `neither`
   * where there is no image.
   */
  readonly size: AuthoredSize;
}

/**
 * A Graphic Order's model node at each level.
 */
interface GraphicOrderByLevel extends ByLevel {
  readonly node: GraphicOrderInteraction<this["level"]>;
}

/**
 * A Graphic Order as the page may know it (Q-9, `graphic-order`): what the model node holds of the
 * hotspots and the image, the effective bounds, the declaration of the response its island writes,
 * and the order the view shows. It holds no correct response: `ordered` is the stored, posted or
 * solution value the view gave, kept to the hotspots it names.
 */
interface GraphicOrderPayload {
  readonly ariaLabel: Option.Option<string>;
  readonly ariaLabelledby: Option.Option<string>;
  readonly class: Option.Option<string>;
  /**
   * The response its island writes, as its declaration types it: an `ordered` `identifier`
   * response.
   */
  readonly declared: Declared<"identifier", "ordered">;
  readonly hotspots: readonly GraphicOrderHotspot[];
  readonly image: Nodes<RedactedLevel>;
  /**
   * The effective `max-choices` ({@link boundsOf}): the most hotspots the order holds.
   */
  readonly maxChoices: bigint;
  /**
   * The effective `min-choices` ({@link boundsOf}).
   */
  readonly minChoices: bigint;
  /**
   * The identifiers of the ordered hotspots, in order, each naming a hotspot once and at most
   * `maxChoices` of them ({@link keptOf}).
   */
  readonly ordered: readonly string[];
  readonly prompt: Option.Option<Nodes<RedactedLevel>>;
  /**
   * The identifier of the response it binds.
   */
  readonly response: string;
  readonly size: AuthoredSize;
}

/**
 * The least and the most hotspots an interaction orders.
 */
interface Bounds {
  readonly max: bigint;
  readonly min: bigint;
}

/**
 * Give the bounds an interaction enforces: with no `min-choices` every hotspot must be ordered and
 * `max-choices` is ignored, so both are the number of hotspots; with `min-choices` written, it is
 * the least, and `max-choices` the most, the number of hotspots when absent. Each is held to the
 * number of hotspots, and the most to the least, which the database already requires.
 *
 * @param interaction What the interaction wrote and how many hotspots it holds.
 * @param interaction.hotspots The hotspots.
 * @param interaction.maxChoices The `max-choices` as written, none when absent.
 * @param interaction.minChoices The `min-choices` as written, none when absent.
 * @returns The least and the most hotspots to order.
 */
const boundsOf = (interaction: {
  readonly hotspots: readonly unknown[];
  readonly maxChoices: Option.Option<bigint>;
  readonly minChoices: Option.Option<bigint>;
}): Bounds => {
  const count = BigInt(interaction.hotspots.length);
  const atMostCount = (written: bigint): bigint => (written < count ? written : count);
  const min = Option.match(interaction.minChoices, {
    onNone: () => count,
    onSome: atMostCount,
  });
  const max = Option.isNone(interaction.minChoices)
    ? count
    : atMostCount(Option.getOrElse(interaction.maxChoices, () => count));

  return { max: max < min ? min : max, min };
};

/**
 * Keep the identifiers that name a hotspot, each once at its first place, and at most as many as
 * the interaction can order.
 *
 * @param interaction The hotspots and the effective most.
 * @param interaction.hotspots The hotspots.
 * @param interaction.max The most hotspots to order, from {@link boundsOf}.
 * @param identifiers The identifiers, in the order shown.
 * @returns The identifiers the page can show as ordered, in order.
 */
const keptOf = (
  interaction: { readonly hotspots: readonly GraphicOrderHotspot[]; readonly max: bigint },
  identifiers: readonly string[],
): readonly string[] => {
  const known = new Set(interaction.hotspots.map((hotspot) => hotspot.identifier));

  return [...new Set(identifiers)]
    .filter((identifier) => known.has(identifier))
    .slice(0, Number(interaction.max));
};

/**
 * Give the value a restored or solved response shows: the stored identifiers kept to the hotspots
 * ({@link keptOf}), the value's type as it was.
 *
 * @param interaction The model node.
 * @param stored The stored or correct response.
 * @returns The value the interaction shows; a record, which an `ordered` identifier never is, as it
 *   was.
 */
const shownValue = (interaction: GraphicOrderInteraction, stored: ResponseValue): ResponseValue => {
  if (isRecordValue(stored)) {
    return stored;
  }

  const kept = keptOf(
    { hotspots: interaction.hotspots, max: boundsOf(interaction).max },
    stored.values.map(format),
  );

  return {
    ...stored,
    values: kept.flatMap((identifier) =>
      Option.toArray(Arr.findFirst(stored.values, (single) => format(single) === identifier)),
    ),
  };
};

/**
 * Read one `qti-hotspot-choice`: its identifier, the catalog it references, its geometry and
 * coordinates, and its name ({@link areaLabel}). A `template-identifier` is a mark, since no
 * template value reaches a module's `parse`.
 *
 * @param read The reader kit.
 * @param choice The `qti-hotspot-choice` element.
 * @returns The hotspot.
 */
const hotspotOf = (read: ReaderKit, choice: SourceElement): GraphicOrderHotspot => {
  read.markElement(choice);

  const identifier = read.identifierAttribute(choice, "identifier");
  const written = read.requiredAttribute(choice, "shape");
  const geometry = read.listed(choice, "shape", written, areaGeometries);
  const coords = coordinatesOf(read, choice);
  const label = areaLabel(read, choice);
  const catalog = read.catalog(choice);

  markTemplate(read, choice);

  return {
    catalog,
    coords,
    geometry,
    identifier,
    label,
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
  interaction: GraphicOrderInteraction<L>,
): readonly OwnRegion<GraphicOrderInteraction<L>, BodyNode<L>>[] => [
  ...promptRegion(interaction),
  contentRegion<GraphicOrderInteraction<L>, BodyNode<L>>(interaction.image, (each, image) => ({
    ...each,
    image,
  })),
];

/**
 * Copy a Graphic Order's model node into its payload node: its content through the kit, the
 * effective bounds, the declaration of the response its island writes, and the order the view
 * shows.
 *
 * The order is the values the view shows ({@link RedactKit.shown}), each kept to the hotspots
 * ({@link keptOf}): what names no hotspot is not shown, and a hotspot twice is shown once, at its
 * first place.
 *
 * @param interaction The model node.
 * @param kit What the payload hands a module's `redact`.
 * @returns The payload node.
 */
const redactGraphicOrder = (
  interaction: GraphicOrderInteraction<RedactedLevel>,
  kit: RedactKit,
): GraphicOrderPayload => {
  const { max, min } = boundsOf(interaction);

  return {
    ariaLabel: interaction.ariaLabel,
    ariaLabelledby: interaction.ariaLabelledby,
    class: interaction.class,
    declared: { baseType: "identifier", cardinality: "ordered", identifier: interaction.response },
    hotspots: interaction.hotspots,
    image: interaction.image,
    maxChoices: max,
    minChoices: min,
    ordered: keptOf(
      { hotspots: interaction.hotspots, max },
      kit.shown(interaction.response).map(format),
    ),
    prompt: interaction.prompt,
    response: interaction.response,
    size: interaction.size,
  };
};

/**
 * The Graphic Order module: reads `qti-graphic-order-interaction`, copies and checks it; the server
 * shell renders its payload node.
 */
export const graphicOrderModule: InteractionModule<
  "graphic-order",
  GraphicOrderByLevel,
  GraphicOrderPayload
> = {
  binding,
  element,
  feature,
  /**
   * The Graphic Order with its Prompt's and its image's content emptied.
   */
  hollow: (interaction) => ({
    ...interaction,
    image: [],
    prompt: interaction.prompt.pipe(Option.map(() => [])),
  }),
  kind: "graphic-order",
  /**
   * Read `qti-graphic-order-interaction`, which the body walk has bound to an `ordered`
   * `identifier` response ({@link binding}): its Prompt, its image, its `qti-hotspot-choice`
   * children and the counts it wrote.
   */
  parse: (source, context) => {
    const { read } = context;

    return (() => {
      read.markElement(source);

      const minChoices = read.countAttribute(source, "min-choices");
      const maxChoices = read.countAttribute(source, "max-choices");
      const prompt = read.content(source, "qti-prompt");
      const imageElement = imageElementOf(read, source);
      const image = Option.match(imageElement, {
        onNone: (): readonly BodyNode[] => [],
        onSome: (child) => read.nodes(source, { children: [child] }),
      });
      const hotspots: GraphicOrderHotspot[] = [];
      for (const choice of read.childrenNamed(source, "qti-hotspot-choice")) {
        hotspots.push(hotspotOf(read, choice));
      }

      return {
        ariaLabel: read.valueOf(source, "aria-label"),
        ariaLabelledby: read.valueOf(source, "aria-labelledby"),
        class: read.valueOf(source, "class"),
        hotspots,
        image,
        kind: "graphic-order" as const,
        maxChoices,
        minChoices,
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
   * Graphic Order's payload copy: {@link redactGraphicOrder}.
   */
  redact: redactGraphicOrder,
  /**
   * The Prompt's region, when it has a Prompt, then the image's.
   */
  referencingChoices: (interaction) => interaction.hotspots,
  regions: ownRegions,
  /**
   * The value the interaction shows for a stored or correct value ({@link shownValue}).
   */
  shown: shownValue,
};
