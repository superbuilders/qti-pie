/**
 * Position Object (Q-17) in the server shell: what renders a `qti-position-object-stage`, the one
 * container a module declares, and each `qti-position-object-interaction` inside it.
 *
 * A stage is one image shared by every Position Object inside it (QTI 3.0 information model 5.108),
 * so the stage, not the interaction, is the island: in `answering` {@link container} gives one
 * client island per stage (`PositionObjectStage` in
 * `#plate/ui/position-object/position-object.tsx`) that holds the stage image, draws every copy
 * placed on it and keeps every response, and {@link island} gives each interaction's part inside it,
 * its object and its placed copies, built from its payload node alone. In `review` and `solution`
 * both are plain server markup with the island's `data-slot` names: the stage image with each shown
 * position drawn over it, and each interaction's object with its positions listed. Neither marks a
 * position: an exact match on points is no measure of a placement, and the QTI database scores one
 * by the areas of its area mapping, which the page never shows (plate's ruling R4; 2.4.3.6).
 *
 * Every prop is read from the payload, which holds no correct response and no area of the mapping:
 * the stage's size, each interaction's entry name, its effective `max-choices`, its object, its
 * effective centre point, and, in review and solution, the positions the view shows.
 *
 * The walk reaches {@link container} through the item (`Walk.container` in
 * `#plate/ui/item/content.tsx`), never through an import, so this file imports the walk freely.
 *
 * @module
 * @see https://www.imsglobal.org/spec/qti/v3p0/info#Root_PositionObjectInteraction
 */
import { Option, Result } from "effect";
import type { ReactNode } from "react";
import { qtiNamespace } from "#plate/document/source.ts";
import { message, messageText, numeral } from "#plate/messages.ts";
import type { Locale } from "#plate/messages.ts";
import type { ModelOf, PayloadOf } from "#plate/model/interactions.ts";
import { addressUrl, classifyUrl, urlContextOf } from "#plate/model/url.ts";
import { trimXmlSpace } from "#plate/model/values.ts";
import { pairedAt } from "#plate/payload.ts";
import type { Paired, RenderMode, View } from "#plate/payload.ts";
import type { Labelled } from "#plate/ui/attributes.ts";
import { StageFrame } from "#plate/ui/graphic/frame.tsx";
import { graphicKeys } from "#plate/ui/graphic/labels.ts";
import { stageScaleOf } from "#plate/ui/graphic/scale.ts";
import type { StageScale } from "#plate/ui/graphic/scale.ts";
import { sizeOf } from "#plate/ui/graphic/size.ts";
import type { ContainerWalk } from "#plate/ui/item/content.tsx";
import type { IslandContext, ReviewContext } from "#plate/ui/item/context.ts";
import { UnrenderedNode } from "#plate/ui/item/errors.ts";
import type { Addressing } from "#plate/ui/item/html.ts";
import { limitOf } from "#plate/ui/item/interactions/facts.ts";
import { controlNameOf, labelsOf, ownName, rootOf } from "#plate/ui/item/interactions/labels.ts";
import { imageText, shownText } from "#plate/content/text.ts";
import { markingOf, pointMarksOf } from "#plate/ui/item/interactions/marks.ts";
import { markPart, wordsOfMark } from "#plate/ui/item/interactions/words.tsx";
import { fillLabel } from "#plate/ui/labels.ts";
import type { Limit } from "#plate/ui/limit.ts";
import { positionObjectKeys } from "#plate/ui/position-object/labels.ts";
import { PositionObject, PositionObjectStage } from "#plate/ui/position-object/position-object.tsx";
import type { StagedObject } from "#plate/ui/position-object/position-object.tsx";
import { ObjectCopy, placedAt, smallestCopyOf } from "#plate/ui/position-object/token.tsx";
import type { DrawnImage, ObjectDrawing } from "#plate/ui/position-object/token.tsx";
import { bodyAttributeOf } from "#plate/model/attributes.ts";
import type { BodyElement, ContainerNode, RedactedLevel, RedactedNode } from "#plate/model/item.ts";

/**
 * Tell whether a body node is a Position Object.
 *
 * @param node The body node.
 * @returns Whether its kind is `position-object`.
 */
const isPositionObject = (node: RedactedNode): node is ModelOf<"position-object", RedactedLevel> =>
  node.kind === "position-object";

/**
 * Collect every Position Object among body nodes, in document order: below each element and in
 * each stage, the only places one stands.
 *
 * @param nodes The body nodes, as the redacted body holds them.
 * @returns The Position Objects.
 */
const positionObjectsIn = (
  nodes: readonly RedactedNode[],
): readonly ModelOf<"position-object", RedactedLevel>[] =>
  nodes.flatMap((node): readonly ModelOf<"position-object", RedactedLevel>[] => {
    if (isPositionObject(node)) {
      return [node];
    }

    return node.kind === "element" || node.kind === "container"
      ? positionObjectsIn(node.children)
      : [];
  });

/**
 * Name an object: the text its image shows; else its image's alternative text; else "Object n of
 * count", its place among the item's Position Objects in document order, so a nameless image is
 * still named (WCAG 1.1.1).
 *
 * @param model The Position Object, as the redacted body holds it.
 * @param context What the shell knows: the redacted body and the locale.
 * @returns The name, never empty.
 */
const objectNameOf = (
  model: ModelOf<"position-object", RedactedLevel>,
  context: Pick<IslandContext, "body" | "locale">,
): string => {
  const { locale } = context;
  const text = shownText(model.object, locale);

  if (text !== "") {
    return text;
  }

  const all = positionObjectsIn(context.body);

  return (
    imageText(model.object) ??
    message(locale, "positionObjectObjectOf", {
      count: numeral(locale, all.length),
      n: numeral(locale, all.indexOf(model) + 1),
    })
  );
};

/**
 * Read how many copies of a Position Object's object the child may place: one for a `single`
 * response, which holds one point; for a `multiple` one, the effective `max-choices`, its XSD
 * default of 1 where the author wrote none, and 0 no limit (5.107.3).
 *
 * @param node The Position Object's payload.
 * @returns The limit.
 */
const limitOfObject = (node: PayloadOf<"position-object">): Limit =>
  node.cardinality === "single" ? { kind: "at-most", n: 1 } : limitOf(node.maxChoices);

/**
 * Find the element an image's address is written on: the first `img` at any depth, a `picture`'s
 * among them, else the first `object`.
 *
 * @param nodes The image's body nodes.
 * @returns The element, none where the nodes hold no image.
 */
const imageElementOf = (nodes: readonly RedactedNode[]): BodyElement<RedactedLevel> | undefined => {
  const found = (
    tag: string,
    within: readonly RedactedNode[],
  ): BodyElement<RedactedLevel> | undefined => {
    for (const node of within) {
      if (node.kind === "element") {
        const inner = node.tag === tag ? node : found(tag, node.children);

        if (inner !== undefined) {
          return inner;
        }
      }
    }

    return undefined;
  };

  return found("img", nodes) ?? found("object", nodes);
};

/**
 * Give the address the overlay draws an object from: its image's `src`, or its `object`'s `data`,
 * written as the page writes that element's own (`propsOf` in `#plate/ui/item/html.ts`): a URL
 * `classifyUrl` keeps, at its address in the configuration's assets.
 *
 * @param object The object's body nodes.
 * @param addressing The item's location and the assets.
 * @returns The address, none where the image has none the page writes.
 */
const hrefOf = (object: readonly RedactedNode[], addressing: Addressing): Option.Option<string> => {
  const image = imageElementOf(object);
  if (image === undefined) {
    return Option.none();
  }

  const name = image.tag === "object" ? "data" : "src";

  return Option.flatMap(bodyAttributeOf(image.attributes, name), (written) =>
    Option.flatMap(
      urlContextOf({ local: image.tag, namespace: qtiNamespace }, { local: name, namespace: "" }),
      (context) => {
        const url = classifyUrl(context, written);

        return url.kind === "dropped"
          ? Option.none()
          : Result.getSuccess(addressUrl(url, addressing.document, addressing.assets));
      },
    ),
  );
};

/**
 * Give how a copy of a Position Object's object is drawn on the stage.
 *
 * @param node The Position Object's payload.
 * @param addressing The item's location and the assets.
 * @returns The drawing: its centre point, and its image where the image has an address and the
 *   author wrote both of its dimensions.
 */
const drawingOf = (node: PayloadOf<"position-object">, addressing: Addressing): ObjectDrawing => {
  const image: Option.Option<DrawnImage> = Option.all({
    href: hrefOf(node.object, addressing),
    size: Option.fromUndefinedOr(sizeOf(node.objectSize)),
  });

  return Option.match(image, {
    onNone: () => ({ centerPoint: node.centerPoint }),
    onSome: (drawn) => ({ centerPoint: node.centerPoint, image: drawn }),
  });
};

/**
 * Render a Position Object's part of its stage's island: its object, the button the child takes
 * copies from, and its placed copies, named as the author names it, else as plate names an unnamed
 * Control, its root carrying the author's `data-*` and `class`.
 *
 * @param paired The Position Object and its payload node.
 * @param paired.model The redacted model node the payload node was given for.
 * @param paired.payload Its payload node, as its module's `redact` gave it.
 * @param context What the page may know of the render.
 * @returns The `PositionObject` part, which stands inside its stage's island.
 */
export const island = (
  { model, payload: node }: Paired<"position-object">,
  context: IslandContext,
): ReactNode => (
  <PositionObject
    name={node.formName}
    naming={controlNameOf(undefined, node, ownName(model, context), context)}
    object={context.content(node.object, { position: "phrasing" })}
    objectName={objectNameOf(model, context)}
    root={rootOf(model, context)}
  />
);

/**
 * Render a Position Object's review or solution: its object, and the positions the view shows,
 * each a line naming its place, the candidate's in `review` and the correct ones in `solution`;
 * in a review each with the mark the host handed it and its words, then each correct position
 * handed missed (proposal 2026-11-18-grading-in-sql, Decision 6: a Position Object's review marks
 * each point by area).
 *
 * @param paired The Position Object and its payload node.
 * @param paired.model The redacted model node the payload node was given for.
 * @param paired.payload Its payload node, as its module's `redact` gave it.
 * @param context What the shell knows of the item and the render.
 * @returns The markup.
 */
export const review = (
  { model, payload: node }: Paired<"position-object">,
  context: ReviewContext,
): ReactNode => {
  const { locale } = context;
  const { position } = labelsOf(positionObjectKeys, locale, {});
  const object = objectNameOf(model, context);
  const marks = pointMarksOf(
    node.positions.map((point) => ({ x: String(point.x), y: String(point.y) })),
    markingOf(node.response, context),
  );

  return (
    <div
      {...rootOf(model, context)}
      {...controlNameOf(undefined, node, ownName(model, context), context)}
      data-slot="plate-position-object-group"
      role="group"
    >
      <div data-slot="plate-position-object-object">
        {context.content(node.object, { position: "flow" })}
      </div>
      <ol data-slot="plate-position-object-copies" role="list">
        {node.positions.map((point, index) => (
          // A copy is a place in its object's order, not an item: its place is its key.
          <li key={index} data-mark={marks.given[index]} data-slot="plate-position-object-copy">
            {fillLabel(position, {
              n: numeral(locale, index + 1),
              object,
              x: numeral(locale, point.x),
              y: numeral(locale, point.y),
            })}
            {markPart(wordsOfMark(marks.given[index]), locale)}
          </li>
        ))}
        {marks.missed.map((point, index) => (
          // A missed position follows the copies shown, numbered after them: its place is its key.
          <li
            key={`missed-${String(index)}`}
            data-mark="missed"
            data-slot="plate-position-object-copy"
          >
            {fillLabel(position, {
              n: numeral(locale, node.positions.length + index + 1),
              object,
              x: numeral(locale, Number(point.x)),
              y: numeral(locale, Number(point.y)),
            })}
            {markPart(wordsOfMark("missed"), locale)}
          </li>
        ))}
      </ol>
    </div>
  );
};

/**
 * Give a stage's island the interaction it is told of: its response's entry name and limit, and how
 * its object is drawn.
 *
 * @param node The Position Object's payload.
 * @param addressing The instance, the item's location and the assets.
 * @returns The interaction, as the island takes it.
 */
const stagedOf = (node: PayloadOf<"position-object">, addressing: Addressing): StagedObject => ({
  ...drawingOf(node, addressing),
  limit: limitOfObject(node),
  name: node.formName,
});

/**
 * Draw the positions a review or a solution shows over the stage image, as the island draws placed
 * copies: the marks the stage's frame holds in its overlay.
 *
 * @param objects The stage's Position Objects.
 * @param addressing The instance, the item's location and the assets.
 * @returns The copies, in the stage image's pixels.
 */
const shownCopies = (
  objects: readonly PayloadOf<"position-object">[],
  addressing: Addressing,
): ReactNode =>
  objects.flatMap((object, which) => {
    const drawing = drawingOf(object, addressing);

    return object.positions.map((point, index) => (
      <g
        key={`${String(which)}#${String(index)}`}
        data-slot="plate-position-object-token"
        transform={placedAt(point)}
      >
        <ObjectCopy
          drawing={drawing}
          state={{ focusVisible: false, placed: true, selected: false }}
        />
      </g>
    ));
  });

/**
 * What a stage's frame is sized and named by.
 */
interface Framing {
  readonly naming: Labelled;
  readonly scale: StageScale;
}

/**
 * Give what the stage's frame is sized and named by: its scale, from its smallest copy, so every
 * copy the child places is a target of at least 24 CSS px, and 44 where the page has room (WCAG
 * 2.5.8, 2.5.5); and its region's name, the stage image's text alternative, its `alt` or an
 * `object`'s text content. QTI gives a Position Object no prompt, so where the image has no
 * alternative the region is named by plate's `positionObjectStage`, "Picture", and the core marks
 * the stage image on the verdict (`unnamedStage` in `#plate/interactions/position-object.ts`).
 *
 * @param image The stage image's body nodes.
 * @param staged The stage's interactions, as its island takes them.
 * @param locale The locale of plate's own text.
 * @returns The scale and the name.
 */
const framingOf = (
  image: readonly RedactedNode[],
  staged: readonly StagedObject[],
  locale: Locale,
): Framing => {
  const text = shownText(image, locale);

  return {
    naming: {
      "aria-label":
        imageText(image) ?? (text === "" ? messageText(locale, "positionObjectStage") : text),
    },
    scale: stageScaleOf(smallestCopyOf(staged)),
  };
};

/**
 * Render a `qti-position-object-stage`, the container of its Position Objects: in `answering` its
 * island, which holds the stage image and, inside it, each interaction's part as the seam renders
 * it; in `review` and `solution` the same parts as server markup, the positions shown drawn over
 * the image.
 *
 * The stage image is the container's first element child, which the core holds the stage to
 * (`parseStage` in `#plate/interactions/position-object.ts`), and the Position Objects follow it,
 * as QTI's schema orders them; any other child the walk renders stands with the image.
 *
 * - `plate-position-object`, the root, a `div` keyed by the container's key, holding the stage's
 *   frame (`StageFrame` in `#plate/ui/graphic/frame.tsx`), its region named by the stage image's
 *   text alternative, else "Picture", and sized so every copy is a target of at least 24 CSS px, a
 *   `plate-position-object-token` over the image per position shown, then each interaction.
 *
 * @param node The container's node.
 * @param walk Its children to render, its key and the walk where it stands.
 * @param mode The render's mode.
 * @param view The view each Position Object's payload node is given by.
 * @returns The stage.
 * @throws {UnrenderedNode} For a stage holding no Position Object, which the core never reads one
 *   as, so the stage has no size.
 */
export const container = (
  node: ContainerNode<"position-object", RedactedLevel>,
  walk: ContainerWalk,
  mode: RenderMode,
  view: View,
): ReactNode => {
  const rendered = walk.children();
  const { addressing, locale } = walk.walk;
  const shown = (child: RedactedNode): boolean =>
    !isPositionObject(child) && !(child.kind === "text" && trimXmlSpace(child.text) === "");
  const image = node.children.flatMap((child, index) => (shown(child) ? [rendered[index]] : []));
  const interactions = node.children.flatMap((child, index) =>
    isPositionObject(child) ? [rendered[index]] : [],
  );
  const objects = node.children
    .filter(isPositionObject)
    .map((child) => pairedAt("position-object", child, view).payload);
  const [first] = objects;

  if (first === undefined) {
    throw new UnrenderedNode({ detail: "a container of position-object that holds none" });
  }

  const staged = objects.map((object) => stagedOf(object, addressing));
  const { naming, scale } = framingOf(node.children.filter(shown), staged, locale);

  return mode === "answering" ? (
    <PositionObjectStage
      key={walk.key}
      image={image}
      labels={labelsOf(positionObjectKeys, locale, {})}
      objects={staged}
      scale={scale}
      size={first.stage}
      stageNaming={naming}
      stageLabels={labelsOf(graphicKeys, locale, {})}
    >
      {interactions}
    </PositionObjectStage>
  ) : (
    <div key={walk.key} data-slot="plate-position-object">
      <StageFrame
        image={image}
        naming={naming}
        labels={labelsOf(graphicKeys, locale, {})}
        marks={() => shownCopies(objects, addressing)}
        stage={{ kind: "sized", scale, size: first.stage }}
      />
      {interactions}
    </div>
  );
};
