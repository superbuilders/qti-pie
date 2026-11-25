/**
 * Position Object (Q-17, the `position-object` kind): `qti-position-object-interaction` read into
 * its model node, its `qti-position-object-stage` read as the module's container, both copied into
 * their payload nodes, and checked; the server shell renders them
 * (`#plate/ui/item/interactions/position-object.tsx`).
 *
 * A Position Object is an object image the candidate places on a stage image, one or more times;
 * its response is a `point` (`single` or `multiple`), each point the place on the stage the
 * object's centre point lands on. The stage is no interaction of its own: it is the element the
 * module owns as the container of its interactions ({@link ModuleContainer}), and the body walk
 * reads it through the module's container and nothing else. The container node holds the stage
 * image and every interaction inside it, and each interaction's model node carries the stage's
 * size, which its parse reads from the stage it stands in (`parent` in `ModuleParseContext`).
 *
 * Each payload node gives the server shell what the page may know of its interaction: the object
 * and the size written on it,
 * the stage's size, the effective centre point, the effective `max-choices` and `min-choices`, the
 * declaration of the response its points write, and the positions the view shows. Each point is one
 * `point` value of the response, its two coordinates, x then y. The QTI database's admission always
 * caps the count at
 * `max-choices`; it holds a point to the stage's edge, and the count to `min-choices`, only under
 * `validate-responses`, since the area mapping maps a point anywhere.
 *
 * It follows two readings of `docs/spec-readings.md`, each cited by its wording:
 *
 * - "An area mapping maps points." The response is a point and only a point: `openAdmitted` gives the
 *   notice for an interaction whose response is not a `single` or `multiple` `point`.
 * - "An area mapping holds a point on a shape's boundary, maps a point by the first area listed that
 *   holds it, maps each area once, and adds `default-value` once for each distinct point in no
 *   area." The QTI database scores it so (`qti-map-response-point`); the payload holds no area of
 *   the mapping, so the page shows nothing of the correct response.
 *
 * Beyond those readings, the module decides three defaults, each a notice rather than a guess:
 *
 * - A stage whose first element child is no image (`img`, `picture` or `object`), whose image writes
 *   no positive `width` and `height`, or which holds no interaction of this kind gives the notice
 *   `qti-position-object-stage`: without the image's size no point has a bound and no object a
 *   place.
 * - An interaction outside any stage, or in a stage whose first element child is no image that writes
 *   a positive `width` and `height`, gives the notice `qti-position-object-interaction`: it has no
 *   stage to be placed on, or none with a size.
 * - An interaction whose object image writes no `width` and `height` while it writes no
 *   `center-point` gives the same notice: the centre point defaults to the object's centre, which
 *   needs its size.
 *
 * An object image or a stage image with no text alternative is marked on the item's verdict, the
 * object's {@link unnamedObject} and the stage's {@link unnamedStage}, at the image: the child is
 * shown a picture whose meaning a screen reader cannot say, and the name plate gives in its place,
 * "Object n of count" or "Picture", is no text alternative (WCAG 2.2, 1.1.1 Non-text Content), so
 * the content admin who reads the verdict writes one. An image's alternative is its `alt`, a
 * `picture`'s that of the `img` it holds, or an `object`'s text content, the fallback HTML shows in
 * its place, each counting only when it holds more than XML white space.
 *
 * @module
 * @see https://www.imsglobal.org/spec/qti/v3p0/info#Root_PositionObjectInteraction
 */
import { regex } from "arkregex";
import { Array as Arr, Option } from "effect";
import { attributePath } from "#plate/document/source.ts";
import type { SourceElement } from "#plate/document/source.ts";
import { boundIn, contentRegion, noReferencingChoices } from "#plate/interactions/contract.ts";
import type {
  ByLevel,
  InteractionModule,
  ModuleContainer,
  ModuleInteraction,
  OwnRegion,
  ParseContext,
  ReaderKit,
  RedactKit,
} from "#plate/interactions/contract.ts";
import { authoredSizeOf, imageElementOf, imageElements } from "#plate/interactions/image-size.ts";
import type { AuthoredSize, ImageSize } from "#plate/interactions/image-size.ts";
import { collapseXmlSpace } from "#plate/model/attributes.ts";
import type {
  BodyNode,
  ContainerNode,
  Level,
  ModelLevel,
  Nodes,
  RedactedLevel,
} from "#plate/model/item.ts";
import { trimXmlSpace } from "#plate/model/values.ts";
import type { Declared, Single } from "#plate/model/values.ts";

/**
 * Position Object's identifier in the QTI 3.0 conformance list, Appendix A.
 */
const feature = "Q-17";

/**
 * The QTI element Position Object is read from, which its notice names.
 */
const element = "qti-position-object-interaction";

/**
 * The QTI element the module owns as the container of its interactions, which its notice names.
 */
const stageElement = "qti-position-object-stage";

/**
 * The verdict's key for a Position Object's object image with no text alternative, marked at the
 * image.
 */
const unnamedObject = "object-alt:missing";

/**
 * The verdict's key for a stage image with no text alternative, marked at the image.
 */
const unnamedStage = "stage-alt:missing";

/**
 * The binding Position Object renders with: a `point` response of one point, or several, `single`
 * or `multiple`.
 */
const binding = { baseTypes: ["point"], cardinalities: ["multiple", "single"] } as const;

/**
 * The model node of `qti-position-object-interaction` (Q-17, `position-object`).
 *
 * `centerPoint` is the effective centre point: the author's `center-point`, else the centre of the
 * object image's box. `stage` is the size of the stage image, which the parse reads from the stage
 * the interaction stands in.
 *
 * @template L The level of its content.
 */
interface PositionObjectInteraction<
  L extends Level = ModelLevel,
> extends ModuleInteraction<"position-object"> {
  readonly cardinality: (typeof binding.cardinalities)[number];
  readonly centerPoint: readonly [x: number, y: number];
  /**
   * The author's `class`, as written, none when absent.
   */
  readonly class: Option.Option<string>;
  /**
   * `max-choices`, 1 when absent, the XSD's default (5.107.3): the most times the object may be
   * placed; 0 is no bound.
   */
  readonly maxChoices: bigint;
  /**
   * `min-choices`, 0 when absent: the fewest times the object must be placed, none required at 0
   * (5.107.2 holds a written one to 1 or more).
   */
  readonly minChoices: bigint;
  /**
   * The object image, the one image element of the interaction and its subtree.
   */
  readonly object: Nodes<L>;
  /**
   * The size the author wrote on the object image, the size a placed copy of it is drawn at.
   */
  readonly objectSize: AuthoredSize;
  readonly stage: ImageSize;
}

/**
 * A Position Object's model node at each level.
 */
interface PositionObjectByLevel extends ByLevel {
  readonly node: PositionObjectInteraction<this["level"]>;
}

/**
 * One position as the view shows it: the point's two coordinates, in the stage image's pixels.
 */
interface ShownPosition {
  readonly x: number;
  readonly y: number;
}

/**
 * A Position Object as the page may know it (Q-17, `position-object`): what the model node holds
 * of the object, the effective bounds, the stage's size, the declaration of the response its points
 * write, and the positions the view shows. It holds no correct response: `positions` is the stored
 * or solution value the view gave.
 */
interface PositionObjectPayload {
  readonly ariaLabel: Option.Option<string>;
  readonly ariaLabelledby: Option.Option<string>;
  readonly cardinality: (typeof binding.cardinalities)[number];
  readonly centerPoint: readonly [x: number, y: number];
  readonly class: Option.Option<string>;
  /**
   * The response its points write, as its declaration types it: a `point` response of the
   * interaction's cardinality, one value per placed copy.
   */
  readonly declared: Declared<"point", (typeof binding.cardinalities)[number]>;
  readonly maxChoices: bigint;
  readonly minChoices: bigint;
  readonly object: Nodes<RedactedLevel>;
  readonly objectSize: AuthoredSize;
  /**
   * The positions the view shows, in order.
   */
  readonly positions: readonly ShownPosition[];
  /**
   * The identifier of the response it binds.
   */
  readonly response: string;
  readonly stage: ImageSize;
}

/**
 * A whole number as a `center-point` coordinate writes it once its XML whitespace is collapsed: an
 * `xs:int`'s lexical form, an optional sign, `+` or `-`, and digits.
 */
const wholeNumber = regex("^[+-]?[0-9]+$", "u");

/**
 * Read a whole number from text, none when the text is not one.
 *
 * @param value The text.
 * @returns The number.
 */
const wholeOf = (value: string): Option.Option<number> =>
  wholeNumber.test(value) ? Option.some(Number(value)) : Option.none();

/**
 * Give the positions a list of values shows: each point as its two coordinates, a value of any
 * other type as nothing.
 *
 * @param values The values shown.
 * @returns The positions.
 */
const shownOf = (values: readonly Single[]): readonly ShownPosition[] =>
  values.flatMap((single) =>
    single.baseType === "point" ? [{ x: Number(single.value[0]), y: Number(single.value[1]) }] : [],
  );

/**
 * The elements of the object the interaction holds, by the part of the region that holds them.
 *
 * @template L The level of its content.
 * @param interaction The model node.
 * @returns The object's region.
 */
const ownRegions = <L extends Level>(
  interaction: PositionObjectInteraction<L>,
): readonly OwnRegion<PositionObjectInteraction<L>, BodyNode<L>>[] => [
  contentRegion<PositionObjectInteraction<L>, BodyNode<L>>(interaction.object, (each, object) => ({
    ...each,
    object,
  })),
];

/**
 * Copy a Position Object's model node into its payload node: its object through the kit, the
 * effective bounds, the response's declaration, and the positions the view shows.
 *
 * The positions are the values the view shows ({@link RedactKit.shown}) as coordinates
 * ({@link shownOf}).
 *
 * @param interaction The model node.
 * @param kit What the payload hands a module's `redact`.
 * @returns The payload node.
 */
const redactPositionObject = (
  interaction: PositionObjectInteraction<RedactedLevel>,
  kit: RedactKit,
): PositionObjectPayload => ({
  ariaLabel: interaction.ariaLabel,
  ariaLabelledby: interaction.ariaLabelledby,
  cardinality: interaction.cardinality,
  centerPoint: interaction.centerPoint,
  class: interaction.class,
  declared: {
    baseType: "point",
    cardinality: interaction.cardinality,
    identifier: interaction.response,
  },
  maxChoices: interaction.maxChoices,
  minChoices: interaction.minChoices,
  object: interaction.object,
  objectSize: interaction.objectSize,
  positions: shownOf(kit.shown(interaction.response)),
  response: interaction.response,
  stage: interaction.stage,
});

/**
 * Give the text an element holds at any depth, as written: each text, and each entity reference,
 * which stands for text.
 *
 * @param source The element.
 * @returns The text, concatenated.
 */
const textIn = (source: SourceElement): string =>
  source.children
    .map((child) => {
      if (child.kind === "element") {
        return textIn(child);
      }

      return child.kind === "text" ? child.text : `&${child.name};`;
    })
    .join("");

/**
 * Tell whether an image has a text alternative: an `img`'s `alt`, a `picture`'s `img`'s, or an
 * `object`'s text content, each holding more than XML white space.
 *
 * @param read The reader kit.
 * @param image The `img`, `picture` or `object`.
 * @returns Whether it has one.
 */
const namedImage = (read: ReaderKit, image: SourceElement): boolean => {
  if (read.isQti(image, "object")) {
    return trimXmlSpace(textIn(image)) !== "";
  }

  const img = read.isQti(image, "picture")
    ? read.elementsOf(image).find((child) => read.isQti(child, "img"))
    : image;

  return (
    img !== undefined && Option.exists(read.valueOf(img, "alt"), (alt) => trimXmlSpace(alt) !== "")
  );
};

/**
 * Mark an image with no text alternative on the item's verdict, at the image.
 *
 * @param read The reader kit, whose `mark` records the verdict's mark.
 * @param image The `img`, `picture` or `object`.
 * @param key The verdict's key: {@link unnamedObject} or {@link unnamedStage}.
 */
const markUnnamed = (read: ReaderKit, image: SourceElement, key: string): void => {
  if (!namedImage(read, image)) {
    read.mark(image, key);
  }
};

/**
 * Read the author's `center-point`: two whole numbers separated by whitespace, x then y, as the
 * XSD's list of `xs:int` writes them.
 *
 * @param read The reader kit.
 * @param source The interaction element.
 * @param path The element's path.
 * @returns The centre point, none when the attribute is absent.
 */
const centerPointOf = (
  read: ReaderKit,
  source: SourceElement,
  path: string,
): Option.Option<readonly [x: number, y: number]> =>
  Option.match(read.attributeOf(source, "center-point"), {
    onNone: () => Option.none(),
    onSome: (attribute) => {
      const [x, y, ...beyond] = collapseXmlSpace(attribute.value).split(" ");
      const point =
        x !== undefined && y !== undefined && beyond.length === 0
          ? Option.all([wholeOf(x), wholeOf(y)])
          : Option.none();

      return Option.match(point, {
        onNone: () =>
          read.inadmissible("attribute-type", attributePath(path, attribute), {
            attribute: "center-point",
            value: attribute.value,
          }),
        onSome: (pair) => Option.some(pair),
      });
    },
  });

/**
 * Give a stage's image with the size written on it: its first element child, when that is an
 * image (`img`, `picture` or `object`) writing a positive `width` and `height`.
 *
 * @param read The reader kit.
 * @param stage The `qti-position-object-stage`.
 * @returns The image and its size, none when the stage has no such image.
 */
const sizedStageImageOf = (
  read: ReaderKit,
  stage: SourceElement,
): Option.Option<{ readonly image: SourceElement; readonly size: ImageSize }> =>
  Arr.head(read.elementsOf(stage)).pipe(
    Option.filter((image) => imageElements.some((local) => read.isQti(image, local))),
    Option.flatMap((image) => {
      const written = authoredSizeOf(read, image);

      return written.kind === "both" ? Option.some({ image, size: written.size }) : Option.none();
    }),
  );

/**
 * Read `qti-position-object-interaction`, which the body walk has bound to a `single` or `multiple`
 * `point` response ({@link binding}): the notice when it stands outside a stage or in one with no
 * sized image ({@link sizedStageImageOf}), when it holds no
 * object image, or when the object image writes no size while it writes no `center-point`;
 * otherwise its object, its counts with their defaults, and the effective centre point, the object
 * image marked {@link unnamedObject} where it has no text alternative.
 *
 * @param source The element.
 * @param context The element's path, its notice, the kit it is read with and the declaration it
 *   is bound to.
 * @returns The model node, the unsupported node.
 */
const parsePositionObject: InteractionModule<
  "position-object",
  PositionObjectByLevel,
  PositionObjectPayload
>["parse"] = (source, context) => {
  const { read } = context;

  return (() => {
    const { cardinality } = boundIn(binding, context.bound);
    const stage = read.isQti(context.parent, stageElement)
      ? sizedStageImageOf(read, context.parent)
      : Option.none();
    if (Option.isNone(stage)) {
      return context.notice(element);
    }

    const imageElement = imageElementOf(read, source);
    if (Option.isNone(imageElement)) {
      return context.notice(element);
    }

    const written = centerPointOf(read, source, context.path);
    const object = read.nodes(source, { children: [imageElement.value] });
    const objectSize = authoredSizeOf(read, imageElement.value);
    const centre = Option.orElse(written, () =>
      objectSize.kind === "both"
        ? Option.some([objectSize.size.width / 2, objectSize.size.height / 2] as const)
        : Option.none(),
    );
    if (Option.isNone(centre)) {
      return context.notice(element);
    }

    read.markElement(source);

    const minChoices = read.countAttribute(source, "min-choices");
    const maxChoices = read.countAttribute(source, "max-choices");

    markUnnamed(read, imageElement.value, unnamedObject);

    return {
      ariaLabel: read.valueOf(source, "aria-label"),
      ariaLabelledby: read.valueOf(source, "aria-labelledby"),
      cardinality,
      centerPoint: centre.value,
      class: read.valueOf(source, "class"),
      kind: "position-object" as const,
      maxChoices: Option.getOrElse(maxChoices, () => 1n),
      minChoices: Option.getOrElse(minChoices, () => 0n),
      object,
      objectSize,
      path: context.path,
      response: context.bound.identifier,
      stage: stage.value.size,
    };
  })();
};

/**
 * Read `qti-position-object-stage` into the module's container node: the notice
 * `qti-position-object-stage` when its first element child is no image, when that image writes no
 * positive `width` and `height`, or when it holds no interaction of this kind; otherwise its
 * children as the body walk read them, each interaction of this kind holding the stage's size
 * already, and the stage image marked {@link unnamedStage} where it has no text alternative.
 *
 * @param source The stage element.
 * @param children The stage's children as the body walk read them.
 * @param context The element's path, its notice, and the kit it is read with.
 * @returns The container node, the unsupported node.
 */
const parseStage: ModuleContainer<"position-object">["parse"] = (
  source: SourceElement,
  children: readonly BodyNode[],
  context: ParseContext,
) => {
  const first = children.find((child) => child.kind !== "text");
  const stage = sizedStageImageOf(context.read, source).pipe(
    Option.filter(() => first?.kind === "element" && Arr.contains(imageElements, first.tag)),
  );
  const holdsInteraction = children.some((child) => child.kind === "position-object");
  if (Option.isNone(stage) || !holdsInteraction) {
    return context.notice(stageElement);
  }

  context.read.markElement(source);
  markUnnamed(context.read, stage.value.image, unnamedStage);

  const node: ContainerNode<"position-object"> = {
    children,
    kind: "container",
    module: "position-object",
    path: context.path,
  };

  return node;
};

/**
 * The stage the Position Object module owns as the container of its interactions:
 * `qti-position-object-stage`, read by {@link parseStage}.
 */
export const positionObjectContainer: ModuleContainer<"position-object"> = {
  element: stageElement,
  parse: parseStage,
};

/**
 * The Position Object module: reads `qti-position-object-interaction` and its stage, copies and
 * checks them.
 */
export const positionObjectModule: InteractionModule<
  "position-object",
  PositionObjectByLevel,
  PositionObjectPayload
> = {
  binding,
  element,
  feature,
  /**
   * The Position Object with its object's content emptied.
   */
  hollow: (interaction) => ({ ...interaction, object: [] }),
  kind: "position-object",
  /**
   * Read `qti-position-object-interaction`: {@link parsePositionObject}.
   */
  parse: parsePositionObject,
  /**
   * Position Object's payload copy: {@link redactPositionObject}.
   */
  redact: redactPositionObject,
  /**
   * The object's region.
   */
  referencingChoices: noReferencingChoices,
  regions: ownRegions,
};
