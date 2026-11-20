/**
 * Select Point (Q-18, the `select-point` kind): `qti-select-point-interaction` read into its model
 * node, copied into its payload node, and checked.
 *
 * {@link selectPointModule}'s `redact` gives the page the Prompt, the author's image (`img`,
 * `picture` or `object`) and the size that bounds its points, the response's cardinality and the
 * counts, the entry name its points post under (one entry per point, its two coordinates
 * separated by a space, which `decode` reads as a point), how many points the page offers a place
 * for, and the points the view shows; the server shell renders it
 * (`#plate/ui/item/interactions/`). The response's area mapping is never copied into the payload:
 * the page holds the correct points only in solution mode, as values.
 *
 * It follows three readings of `docs/spec-readings.md`, each cited by its wording, all enforced by
 * the engine's `areaHolds` when the response processing maps the points:
 *
 * - "A point on an area's boundary is inside it." A point on the circle's edge takes its mapped
 *   value.
 * - "A point inside several areas of an area mapping takes the mapped value of the first area that
 *   holds it, in document order, and each area adds its mapped value at most once." Two points in
 *   one area add its value once.
 * - "A point inside no area adds the mapping's `default-value` once per distinct point." Two distinct
 *   points in no area add the default twice, the same point twice adds it once.
 *
 * Beyond those readings, the defaults are issue ei-14's: the page offers `max-choices` points when
 * it is above 0, else `min-choices`, and at least one; a `single` binding offers one whatever the
 * counts say; a shown response with more points than that is offered one per point, so a restored
 * response is never cut. An interaction whose image (`img`, the `img` of a `picture`, or `object`)
 * carries no positive integer `width` and `height` gives its own notice naming the two attributes,
 * since its points have no bounds. `min-choices` and `max-choices` are validated as written,
 * `max-choices` of 0 being no limit. A negative coordinate is refused always; one above the image's
 * width or height only under `validateResponses`, since `score` runs the always-on tier and the
 * corpus scores such a point at the mapping's `default-value` ({@link validateSelectPoint}).
 *
 * The validation messages are English and live here ({@link words}; D7).
 *
 * @module
 * @see https://html.spec.whatwg.org/multipage/image-maps.html#image-map-processing-model
 */
import { Option } from "effect";
import type { Configuration } from "#plate/configuration.ts";
import { Malformed } from "#plate/form/encoding.ts";
import { boundIn, contentRegion, promptRegion } from "#plate/interactions/contract.ts";
import type {
  ByLevel,
  InteractionModule,
  ModuleInteraction,
  OwnRegion,
  RedactKit,
  ValidationMessage,
} from "#plate/interactions/contract.ts";
import { authoredSizeOf, imageElementOf, sizeCarrierOf } from "#plate/interactions/image-size.ts";
import { counted, message, numeral } from "#plate/messages.ts";
import type { BodyNode, Level, ModelLevel, Nodes, RedactedLevel } from "#plate/model/item.ts";
import type { Single, Value } from "#plate/model/values.ts";

/**
 * Select Point's identifier in the QTI 3.0 conformance list, Appendix A.
 */
const feature = "Q-18";

/**
 * The QTI element Select Point is read from, which its notice names.
 */
const element = "qti-select-point-interaction";

/**
 * The binding Select Point renders with: a `point` response of one point, or several, `single` or
 * `multiple`.
 */
const binding = { baseTypes: ["point"], cardinalities: ["multiple", "single"] } as const;

/**
 * The cardinality of a Select Point's response.
 */
type SelectPointCardinality = (typeof binding.cardinalities)[number];

/**
 * A `qti-select-point-interaction` as the item model holds it (Q-18, `select-point`): its Prompt,
 * its image with the size that bounds its points, its response's cardinality, and the counts it
 * wrote.
 *
 * `minChoices` and `maxChoices` are the counts as written, each 0 when absent, the default the XSD
 * gives both (5.128.1, 5.128.2), and 0 constrains nothing; the points the page offers are
 * {@link groupsOf}'s. `image` holds the author's image element (`img`,
 * `picture` or `object`) as body nodes, and `width` and `height` the positive integers its `width`
 * and `height` attributes gave, without which `openAdmitted` gives the notice.
 *
 * @template L The level of its content.
 */
interface SelectPointInteraction<
  L extends Level = ModelLevel,
> extends ModuleInteraction<"select-point"> {
  readonly cardinality: SelectPointCardinality;
  /**
   * The author's `class`, as written, none when absent.
   */
  readonly class: Option.Option<string>;
  readonly height: number;
  readonly image: Nodes<L>;
  readonly maxChoices: bigint;
  readonly minChoices: bigint;
  readonly prompt: Option.Option<Nodes<L>>;
  readonly width: number;
}

/**
 * A Select Point's model node at each level.
 */
interface SelectPointByLevel extends ByLevel {
  readonly node: SelectPointInteraction<this["level"]>;
}

/**
 * One point as the page shows it: the text of its x and of its y coordinate, each empty when the
 * point gives none.
 */
interface PointText {
  readonly x: string;
  readonly y: string;
}

/**
 * A Select Point as the page may know it (Q-18, `select-point`): what the model node holds of the
 * image and the counts, the name its points post under, how many points the page offers a place
 * for, and the points the view shows. It holds no correct response and no area: `points` is the
 * stored, posted or solution value the view gave, as the texts of its coordinates.
 */
interface SelectPointPayload {
  readonly ariaLabel: Option.Option<string>;
  readonly ariaLabelledby: Option.Option<string>;
  readonly cardinality: SelectPointCardinality;
  readonly class: Option.Option<string>;
  /**
   * The name its points post under, one entry per point holding its two coordinates separated by
   * a space, x then y: the view's name for the response, else `entryName(instance, response)`.
   */
  readonly formName: string;
  /**
   * How many points the page offers a place for ({@link groupsOf}, and one per shown point beyond
   * that).
   */
  readonly groups: number;
  readonly height: number;
  readonly image: Nodes<RedactedLevel>;
  readonly maxChoices: bigint;
  /**
   * The points the view shows, in order, at most `groups` of them.
   */
  readonly points: readonly PointText[];
  readonly prompt: Option.Option<Nodes<RedactedLevel>>;
  /**
   * The identifier of the response it binds.
   */
  readonly response: string;
  readonly width: number;
}

/**
 * An axis a coordinate is measured along, which a message names and which picks the bound.
 */
type Axis = "x" | "y";

/**
 * The two axes, in the order a point writes them.
 */
const axes: readonly Axis[] = ["x", "y"];

/**
 * Give the bound of an axis: the image's width for x, its height for y.
 *
 * @param size The image's size.
 * @param size.height The image's height.
 * @param size.width The image's width.
 * @param axis The axis.
 * @returns The greatest coordinate inside the image along it.
 */
const boundOf = (size: { readonly height: number; readonly width: number }, axis: Axis): number =>
  axis === "x" ? size.width : size.height;

/**
 * Keep a count that constrains something: one above zero.
 *
 * @param count The count, 0 when the author wrote none.
 * @returns The count when it is above 0, else none.
 */
const aboveZero = (count: bigint): Option.Option<bigint> =>
  count > 0n ? Option.some(count) : Option.none();

/**
 * Count the points the page offers a place for: one for a `single` binding; else `max-choices`
 * when above 0, else `min-choices` when above 0, else one (issue ei-14's defaults).
 *
 * @param interaction The binding's cardinality and the counts as written.
 * @param interaction.cardinality The response's cardinality.
 * @param interaction.maxChoices The `max-choices`, 0 when absent.
 * @param interaction.minChoices The `min-choices`, 0 when absent.
 * @returns How many points to offer.
 */
const groupsOf = (
  interaction: Pick<SelectPointInteraction, "cardinality" | "maxChoices" | "minChoices">,
): number => {
  if (interaction.cardinality === "single") {
    return 1;
  }

  return Number(
    Option.getOrElse(
      Option.orElse(aboveZero(interaction.maxChoices), () => aboveZero(interaction.minChoices)),
      () => 1n,
    ),
  );
};

/**
 * Give the most points a response may hold: one under a `single` binding, else `max-choices` when
 * above 0, else no limit.
 *
 * @param interaction The binding's cardinality and the `max-choices`, 0 when absent.
 * @returns The most, none for no limit.
 */
const mostOf = (
  interaction: Pick<SelectPointInteraction, "cardinality" | "maxChoices">,
): Option.Option<bigint> =>
  interaction.cardinality === "single" ? Option.some(1n) : aboveZero(interaction.maxChoices);

/**
 * Give the texts of a shown point value's coordinates.
 *
 * @param singles The values the view shows.
 * @returns One per point among them, its coordinates as decimal digits.
 */
const shownPoints = (singles: readonly Single[]): readonly PointText[] =>
  singles.flatMap((single) =>
    single.baseType === "point" ? [{ x: String(single.value[0]), y: String(single.value[1]) }] : [],
  );

/**
 * Check a Select Point's response, which the caller decoded, in two tiers.
 *
 * - A {@link Malformed} input: text that is not two whole numbers separated by white space gives one
 *   message naming both bounds.
 * - Tier (a), always: no coordinate is negative, which no image has a pixel for (the message names
 *   the point, the axis and the bound), and the most points ({@link mostOf}) caps the count.
 * - Tier (b), only under `validateResponses`: no coordinate is above the image's width or height (the
 *   same message), and `min-choices`, when written above 0.
 *
 * The upper bound is tier (b), not (a), because `score` runs tier (a) on every response it maps,
 * and the 1EdTech corpus items score a point beyond the image's `width` and `height` at the
 * mapping's `default-value` (`src/engine/templates.test.ts`): those attributes are the image's
 * display size, and a point past them is still a point of the image's plane, which the area
 * mapping reads. A host that wants such a point refused sets `validateResponses`.
 *
 * @param interaction The Select Point.
 * @param input The decoded value, or why the entries did not decode.
 * @param configuration The configuration, which gives the locale and `validateResponses`.
 * @returns One message per problem, none when the response is accepted.
 */
const validateSelectPoint = (
  interaction: SelectPointInteraction,
  input: Value | Malformed,
  configuration: Pick<Configuration, "locale" | "validateResponses">,
): readonly ValidationMessage[] => {
  const { locale } = configuration;
  const problem = (written: string): ValidationMessage => ({
    response: interaction.response,
    text: written,
  });

  if (input instanceof Malformed) {
    return [
      problem(
        message(locale, "selectPointMalformed", {
          height: numeral(locale, interaction.height),
          width: numeral(locale, interaction.width),
        }),
      ),
    ];
  }

  const points = shownPoints(input.values);
  const outside = points.flatMap((point, index) =>
    axes.flatMap((axis) => {
      const coordinate = BigInt(point[axis]);
      const bound = boundOf(interaction, axis);
      const beyond = configuration.validateResponses && coordinate > BigInt(bound);

      return coordinate < 0n || beyond
        ? [
            problem(
              message(locale, "selectPointOutside", {
                axis,
                bound: numeral(locale, bound),
                n: numeral(locale, index + 1),
              }),
            ),
          ]
        : [];
    }),
  );
  const count = BigInt(points.length);
  const most = mostOf(interaction);
  const least = aboveZero(interaction.minChoices);

  return [
    ...outside,
    ...most.pipe(
      Option.filter((max) => count > max),
      Option.map((max) =>
        problem(counted(locale, max, { many: "selectPointAtMost", one: "selectPointAtMostOne" })),
      ),
      Option.toArray,
    ),
    ...(configuration.validateResponses
      ? least.pipe(
          Option.filter((min) => count < min),
          Option.map((min) =>
            problem(
              counted(locale, min, { many: "selectPointAtLeast", one: "selectPointAtLeastOne" }),
            ),
          ),
          Option.toArray,
        )
      : []),
  ];
};

/**
 * The elements of the content the interaction holds, by the part of the region that holds them.
 *
 * @template L The level of its content.
 * @param interaction The model node.
 * @returns The Prompt's region, when it has a Prompt, then the image's.
 */
const ownRegions = <L extends Level>(
  interaction: SelectPointInteraction<L>,
): readonly OwnRegion<SelectPointInteraction<L>, BodyNode<L>>[] => [
  ...promptRegion(interaction),
  contentRegion<SelectPointInteraction<L>, BodyNode<L>>(interaction.image, (each, image) => ({
    ...each,
    image,
  })),
];

/**
 * Copy a Select Point's model node into its payload node: its content through the kit, the
 * response's entry name, how many points the page offers, and the points the view shows.
 *
 * The points are the point values the view shows ({@link shownPoints}). The points offered are
 * {@link groupsOf}'s, and one per shown point beyond them.
 *
 * @param interaction The model node.
 * @param kit What the payload hands a module's `redact`.
 * @returns The payload node.
 */
const redactSelectPoint = (
  interaction: SelectPointInteraction<RedactedLevel>,
  kit: RedactKit,
): SelectPointPayload => {
  const points = shownPoints(kit.shown(interaction.response));

  return {
    ariaLabel: interaction.ariaLabel,
    ariaLabelledby: interaction.ariaLabelledby,
    cardinality: interaction.cardinality,
    class: interaction.class,
    formName: kit.formName(interaction.response),
    groups: Math.max(groupsOf(interaction), points.length),
    height: interaction.height,
    image: interaction.image,
    maxChoices: interaction.maxChoices,
    points,
    prompt: interaction.prompt,
    response: interaction.response,
    width: interaction.width,
  };
};

/**
 * The Select Point module: reads `qti-select-point-interaction`, copies and checks it; the server
 * shell renders its payload node.
 */
export const selectPointModule: InteractionModule<
  "select-point",
  SelectPointByLevel,
  SelectPointPayload
> = {
  binding,
  element,
  feature,
  /**
   * The Select Point with its Prompt's and its image's content emptied.
   */
  hollow: (interaction) => ({
    ...interaction,
    image: [],
    prompt: interaction.prompt.pipe(Option.map(() => [])),
  }),
  kind: "select-point",
  /**
   * Read `qti-select-point-interaction`: its binding, which the body walk has judged
   * ({@link binding}); the notice `element` when
   * it holds no image; the notice `<tag>[width][height]` when its image carries no positive
   * integer `width` and `height`; otherwise its Prompt, its image with its size, and the counts it
   * wrote.
   */
  parse: (source, context) => {
    const { read } = context;

    return (() => {
      const { cardinality } = boundIn(binding, context.bound);

      const imageElement = imageElementOf(read, source);
      if (Option.isNone(imageElement)) {
        return context.notice(element);
      }

      const size = authoredSizeOf(read, imageElement.value);
      if (size.kind !== "both") {
        const tag = Option.match(sizeCarrierOf(read, imageElement.value), {
          onNone: () => read.nameOf(imageElement.value),
          onSome: read.nameOf,
        });

        return context.notice(`${tag}[width][height]`);
      }

      read.markElement(source);

      const minChoices = read.countAttribute(source, "min-choices");
      const maxChoices = read.countAttribute(source, "max-choices");
      const prompt = read.content(source, "qti-prompt");
      const image = read.nodes(source, { children: [imageElement.value] });

      return {
        ariaLabel: read.valueOf(source, "aria-label"),
        ariaLabelledby: read.valueOf(source, "aria-labelledby"),
        cardinality,
        class: read.valueOf(source, "class"),
        height: size.size.height,
        image,
        kind: "select-point" as const,
        maxChoices: Option.getOrElse(maxChoices, () => 0n),
        minChoices: Option.getOrElse(minChoices, () => 0n),
        path: context.path,
        prompt,
        response: context.bound.identifier,
        width: size.size.width,
      };
    })();
  },
  /**
   * Select Point's payload copy: {@link redactSelectPoint}.
   */
  redact: redactSelectPoint,
  /**
   * The Prompt's region, when it has a Prompt, then the image's.
   */
  regions: ownRegions,
  /**
   * Check a Select Point's response: {@link validateSelectPoint}.
   */
  validate: validateSelectPoint,
};
