/**
 * Hotspot (Q-10), the `qti-hotspot-interaction`: its model node, parse, redaction and bindings, on
 * the module shape the interaction-module contract states.
 *
 * The readings that bind this module, by their wording:
 *
 * - "A default hotspot is the last hotspot choice of its interaction, and a graphic gap match
 *   interaction has none." The database refuses a default hotspot that is not last, so the payload
 *   lists it after every other hotspot, in document order.
 * - "An area's `coords` that do not fit its shape are read as the HTML Standard's image-map
 *   processing reads an `area`'s." The module keeps each hotspot's coordinates as written, and the
 *   server shell's geometry reads them so (`#plate/ui/graphic/geometry.ts`).
 * - "A `default` shape carries `coords`, as every shape does, and they are a `CoordsDType`." A
 *   `default` hotspot's coordinates are read and kept as written; its area is the whole image,
 *   whatever they say.
 *
 * A coordinate written with `%` is kept as written, a percentage of the image, and the payload
 * carries the size the author wrote on the image (`authoredSizeOf` in
 * `#plate/interactions/image-size.ts`), the pixel space the areas are drawn in.
 *
 * A hotspot's name is its `hotspot-label`, else its `aria-label`, and one with neither is marked on
 * the item's verdict ({@link areaLabel}), since the name plate gives it in place of one, its
 * position among the areas, is no text alternative for the area (WCAG 2.2, 1.1.1 Non-text
 * Content).
 *
 * {@link hotspotModule}'s `redact` gives the page the Prompt, the author's image (its `img`,
 * `picture` or `object`), each hotspot in document order with its identifier, shape, coordinates
 * and name, `max-choices`, and the identifiers to show as chosen; the server shell
 * renders it (`#plate/ui/item/interactions/`).
 *
 * @module
 */
import { Option } from "effect";
import type { SourceElement } from "#plate/document/source.ts";
import { areaLabel, coordinatesOf } from "#plate/interactions/area.ts";
import type { AreaCoordinate } from "#plate/interactions/area.ts";
import { boundIn, contentRegion, promptRegion } from "#plate/interactions/contract.ts";
import type {
  ByLevel,
  InteractionModule,
  ModuleInteraction,
  OwnRegion,
  ReaderKit,
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
  TemplateVisibility,
} from "#plate/model/item.ts";
import { format } from "#plate/model/values.ts";
import { areaGeometries } from "#plate/vocabulary.ts";
import type { AreaGeometry } from "#plate/vocabulary.ts";

/**
 * Hotspot's identifier in the QTI 3.0 conformance list, Appendix A.
 */
const feature = "Q-10";

/**
 * The QTI element Hotspot is read from, which its notice names.
 */
const element = "qti-hotspot-interaction";

/**
 * The binding Hotspot renders with: "The hotspot interaction must be bound to a response variable
 * with a base-type of identifier and single or multiple cardinality" (section 5.68).
 */
const binding = { baseTypes: ["identifier"], cardinalities: ["single", "multiple"] } as const;

/**
 * One `qti-hotspot-choice` of a Hotspot (Q-10): its identifier and the catalog it references, its
 * shape and coordinates as written, its name, and its template visibility, none when it has no
 * `template-identifier`.
 */
interface HotspotChoice extends ReferencingChoice {
  readonly coords: readonly AreaCoordinate[];
  /**
   * The area's geometry, its `shape`.
   */
  readonly geometry: AreaGeometry;
  /**
   * The area's name, its `hotspot-label`, else its `aria-label`; none when the author wrote
   * neither ({@link areaLabel}).
   */
  readonly label: Option.Option<string>;
  readonly templateVisibility: Option.Option<TemplateVisibility>;
}

/**
 * The messages the author wrote in place of plate's own: `data-max-selections-message` and
 * `data-min-selections-message`.
 */
interface AuthorMessages {
  readonly max: Option.Option<string>;
  readonly min: Option.Option<string>;
}

/**
 * The model node of a Hotspot (Q-10), the kind `hotspot`: the fields every module's node shares,
 * its binding's cardinality, its choices in document order, its `class`, its image as body nodes,
 * `max-choices` and `min-choices` (reading 46's counts), the author's messages, its Prompt, and
 * the size the author wrote on the image.
 *
 * @template L The level of its content.
 */
interface HotspotInteraction<L extends Level = ModelLevel> extends ModuleInteraction<"hotspot"> {
  readonly cardinality: "multiple" | "single";
  readonly choices: readonly HotspotChoice[];
  /**
   * The author's `class`, as written, none when absent.
   */
  readonly class: Option.Option<string>;
  /**
   * The image element and its subtree, read as body content, so the payload resolves its URL and
   * keeps its `alt`.
   */
  readonly image: Nodes<L>;
  /**
   * `max-choices`, 1 when absent; 0 is no limit.
   */
  readonly maxChoices: bigint;
  readonly messages: AuthorMessages;
  /**
   * `min-choices`, 0 when absent.
   */
  readonly minChoices: bigint;
  readonly prompt: Option.Option<Nodes<L>>;
  readonly size: AuthoredSize;
}

/**
 * A Hotspot's model node at each level.
 */
interface HotspotByLevel extends ByLevel {
  readonly node: HotspotInteraction<this["level"]>;
}

/**
 * One hotspot as the page may know it: its identifier, the catalog it references, label, shape and
 * coordinates; no template visibility, which `redact` settles.
 */
type HotspotChoicePayload = Omit<HotspotChoice, "templateVisibility">;

/**
 * The payload node of a Hotspot (Q-10), the kind `hotspot`: what the server shell reads of the
 * model node and of the view, through the kit the payload hands `redact`.
 */
interface HotspotPayload {
  readonly ariaLabel: Option.Option<string>;
  /**
   * The author's `aria-labelledby`, as written; the server shell scopes its ids by the instance.
   */
  readonly ariaLabelledby: Option.Option<string>;
  readonly cardinality: "multiple" | "single";
  readonly choices: readonly HotspotChoicePayload[];
  readonly class: Option.Option<string>;
  /**
   * The name its Controls post under: the view's name for the response, else
   * `entryName(instance, response)`.
   */
  readonly formName: string;
  readonly image: Nodes<RedactedLevel>;
  readonly maxChoices: bigint;
  readonly prompt: Option.Option<Nodes<RedactedLevel>>;
  readonly response: string;
  /**
   * The identifiers the Controls show as checked: the view's value.
   */
  readonly restore: readonly string[];
  readonly size: AuthoredSize;
}

/**
 * Read one `qti-hotspot-choice` through the kit.
 *
 * @param read The kit.
 * @param choice The hotspot.
 * @returns The hotspot.
 */
const choiceOf = (read: ReaderKit, choice: SourceElement): HotspotChoice => {
  read.markElement(choice);

  const identifier = read.identifierAttribute(choice, "identifier");
  const geometryAttribute = read.requiredAttribute(choice, "shape");
  const geometry = read.listed(choice, "shape", geometryAttribute, areaGeometries);
  const coords = coordinatesOf(read, choice);
  const label = areaLabel(read, choice);
  const catalog = read.catalog(choice);

  const templateVisibility = read.templateVisibility(choice);

  return {
    catalog,
    coords,
    geometry,
    identifier,
    label,
    templateVisibility,
  };
};

/**
 * The regions of the hotspots' template visibilities: one per hotspot that carries a
 * `template-identifier`, holding no content, so the redaction decides the hotspot by its template
 * values as it decides a template inline, and keeps it, its visibility settled, or drops it.
 *
 * @template L The level of its content.
 * @param interaction The Hotspot.
 * @returns One region per hotspot with a template visibility, in document order.
 */
const visibilityRegions = <L extends Level>(
  interaction: HotspotInteraction<L>,
): readonly OwnRegion<HotspotInteraction<L>, BodyNode<L>>[] =>
  interaction.choices.flatMap((choice) =>
    Option.match(choice.templateVisibility, {
      onNone: () => [],
      onSome: (visibility): readonly OwnRegion<HotspotInteraction<L>, BodyNode<L>>[] => [
        {
          nodes: [],
          put: (each) => each,
          shownBy: Option.some({
            choice: choice.identifier,
            decide: (each, shown) => ({
              ...each,
              choices: each.choices.flatMap((held) => {
                if (held.identifier !== choice.identifier) {
                  return [held];
                }

                return shown ? [{ ...held, templateVisibility: Option.none() }] : [];
              }),
            }),
            visibility,
          }),
        },
      ],
    }),
  );

/**
 * The regions of a Hotspot's own content: its Prompt, its image, then one per hotspot with a
 * template visibility ({@link visibilityRegions}).
 *
 * @template L The level of its content.
 * @param interaction The Hotspot.
 * @returns The regions, in document order.
 */
const ownRegions = <L extends Level>(
  interaction: HotspotInteraction<L>,
): readonly OwnRegion<HotspotInteraction<L>, BodyNode<L>>[] => [
  ...promptRegion(interaction),
  contentRegion<HotspotInteraction<L>, BodyNode<L>>(interaction.image, (each, image) => ({
    ...each,
    image,
  })),
  ...visibilityRegions(interaction),
];

/**
 * The Hotspot module (Q-10), the kind `hotspot`.
 */
export const hotspotModule: InteractionModule<"hotspot", HotspotByLevel, HotspotPayload> = {
  binding,
  element,
  feature,
  /**
   * The Hotspot with its Prompt's and its image's content emptied.
   */
  hollow: (interaction) => ({
    ...interaction,
    image: [],
    prompt: interaction.prompt.pipe(Option.map(() => [])),
  }),
  kind: "hotspot",
  /**
   * Read a `qti-hotspot-interaction` through the kit: its binding, which the body walk has judged
   * ({@link binding}), its Prompt, its image (the notice `qti-hotspot-interaction` when it has
   * none), `max-choices`, `min-choices`, the author's messages, and each `qti-hotspot-choice`.
   */
  parse: (source, context) => {
    const { bound, read } = context;
    const response = bound.identifier;
    const { cardinality } = boundIn(binding, bound);
    const imageElement = imageElementOf(read, source);
    if (Option.isNone(imageElement)) {
      return context.notice(element);
    }

    const image = imageElement.value;

    read.markElement(source);

    const maxChoices = read.countAttribute(source, "max-choices");
    const minChoices = read.countAttribute(source, "min-choices");
    const prompt = read.content(source, "qti-prompt");
    const imageNodes = read.nodes(source, { children: [image] });
    const choices: HotspotChoice[] = [];
    for (const choice of read.childrenNamed(source, "qti-hotspot-choice")) {
      choices.push(choiceOf(read, choice));
    }

    return {
      ariaLabel: read.valueOf(source, "aria-label"),
      ariaLabelledby: read.valueOf(source, "aria-labelledby"),
      cardinality,
      choices,
      class: read.valueOf(source, "class"),
      image: imageNodes,
      kind: "hotspot",
      maxChoices: Option.getOrElse(maxChoices, () => 1n),
      messages: {
        max: read.valueOf(source, "data-max-selections-message"),
        min: read.valueOf(source, "data-min-selections-message"),
      },
      minChoices: Option.getOrElse(minChoices, () => 0n),
      path: context.path,
      prompt,
      response,
      size: authoredSizeOf(read, image),
    };
  },
  /**
   * Copy the model node into its payload node: the Prompt and the image through the kit, each
   * hotspot without its settled visibility, and the view's facts: the entry name and the
   * identifiers to show as checked, the values shown.
   */
  redact: (interaction, kit) => ({
    ariaLabel: interaction.ariaLabel,
    ariaLabelledby: interaction.ariaLabelledby,
    cardinality: interaction.cardinality,
    choices: interaction.choices.map(({ templateVisibility: _settled, ...choice }) => choice),
    class: interaction.class,
    formName: kit.formName(interaction.response),
    image: interaction.image,
    maxChoices: interaction.maxChoices,
    prompt: interaction.prompt,
    response: interaction.response,
    restore: kit.shown(interaction.response).map(format),
    size: interaction.size,
  }),
  /**
   * The regions of the node's own content: its Prompt, its image, then one per hotspot with a
   * template visibility ({@link visibilityRegions}).
   */
  regions: ownRegions,
};
