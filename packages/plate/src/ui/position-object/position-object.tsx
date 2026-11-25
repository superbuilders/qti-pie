"use client";

/**
 * The Position Object interaction's client island (`qti-position-object-interaction`), one per
 * `qti-position-object-stage`: the child places copies of each of the stage's objects on its image,
 * by a tap on the object and a tap on the image, a drag, or the keyboard, and each copy's place,
 * where the object's centre point lands, is a point of its interaction's response.
 *
 * QTI makes the stage the frame of its interactions: one image shared by every Position Object
 * inside it (QTI 3.0 information model 5.108), each interaction bound to a `point` response that
 * records "the coordinates, with respect to the stage, of the centre point of the image being
 * positioned" (5.107). So the stage is the island, {@link PositionObjectStage}, which holds the
 * stage image on the graphic stage (`#plate/ui/graphic/stage.tsx`), draws every placed copy over
 * it, and keeps every response; and each interaction is a part inside it,
 * {@link PositionObject}, which the server renders through the interaction's own seam: its object,
 * a button the child takes copies from, and its placed copies as a list of controls, the large
 * targets a finger, a keyboard and a screen reader use.
 *
 * QTI says the delivery engine "must not indicate" the areas an area mapping scores and "Only the
 * actual position(s) selected by the candidate shall be indicated" (2.4.3.6), so the stage draws no
 * area, only the copies. An untouched stage holds no point: every response stays NULL until the
 * child places a copy. Its behaviour is the Position Object primitive's
 * (`#plate/ui/position-object/primitive.ts`).
 *
 * @module
 * @see https://www.imsglobal.org/spec/qti/v3p0/info/index.html#Root_PositionObjectInteraction
 */
import { createParts, usePart, usePrimitive } from "@ui-sdk/react/primitive";
import { useMemo } from "react";
import type { ReactNode } from "react";
import type { AuthoredSize, ImageSize } from "#plate/interactions/image-size.ts";
import type { Authored, Labelled, Named } from "#plate/ui/attributes.ts";
import { GraphicStage, useGraphicStage } from "#plate/ui/graphic/stage.tsx";
import type { PositionObjectLabels } from "#plate/ui/position-object/labels.ts";
import { positionObject } from "#plate/ui/position-object/primitive.ts";
import type { CopyKey, HeldCopy, StageObject } from "#plate/ui/position-object/primitive.ts";
import { ObjectCopy, placedAt } from "#plate/ui/position-object/token.tsx";
import type { ObjectDrawing } from "#plate/ui/position-object/token.tsx";
import type { ImagePoint } from "#plate/graphic/geometry.ts";
import type { GraphicLabels } from "#plate/ui/graphic/labels.ts";
import type { StageScale } from "#plate/graphic/scale.ts";
import { pointSingles, useResponsesOf } from "#plate/ui/responses.tsx";
import type { Declared } from "#plate/model/values.ts";
import { pointsOf, valuesOf } from "#plate/ui/position-object/points.ts";
import type { Placements } from "#plate/ui/position-object/points.ts";

/**
 * The parts UI SDK makes from the primitive, one per tagged slot.
 */
const parts = createParts(positionObject, {
  copy: "button",
  group: "div",
  layer: "g",
  message: "p",
  object: "button",
  token: "g",
});

/**
 * One interaction of the stage as the island takes it: its response and limit, and how its object
 * is drawn.
 */
export interface StagedObject extends ObjectDrawing, StageObject {}

/**
 * What the server gives a stage's island, as QTI's `qti-position-object-stage` and plate's
 * presentation of it say.
 *
 * @see https://www.imsglobal.org/spec/qti/v3p0/info/index.html#Data_PositionObjectStage
 */
export interface PositionObjectStageProps {
  /**
   * The stage's interactions, each as the server rendered it through its seam: a
   * {@link PositionObject} per interaction, in document order.
   */
  readonly children: ReactNode;
  /**
   * The stage image, its `img`, `picture` or `object`, as the server rendered it, its URL resolved
   * and its alternative text kept.
   */
  readonly image: ReactNode;
  /**
   * The texts the island writes for the child, from plate's message catalog
   * (`positionObjectLabels` in `#plate/ui/position-object/labels.ts`).
   */
  readonly labels: PositionObjectLabels;
  /**
   * The stage's interactions, in document order, as the primitive and the overlay take them.
   */
  readonly objects: readonly StagedObject[];
  /**
   * The stage's scale, from its smallest copy (`stageScaleOf` in `#plate/graphic/scale.ts`), so
   * every copy the child places is a target of at least 24 CSS px, and 44 where the page has room.
   */
  readonly scale: StageScale;
  /**
   * The stage image's `width` and `height`, the pixel space every point is in, which the database
   * holds the stage to writing.
   */
  readonly size: ImageSize;
  /**
   * What names the stage's region: the stage image's text alternative, else the catalog's word for
   * a picture, since QTI gives a Position Object no prompt.
   */
  readonly stageNaming: Labelled;
  /**
   * The stage's own words, its scroll hint (`graphicLabels` in `#plate/ui/graphic/labels.ts`).
   */
  readonly stageLabels: GraphicLabels;
}

/**
 * Give the place a copy is drawn at: where the held copy waits, else its own.
 *
 * @param held The copy held, if any.
 * @param name The interaction's response's identifier.
 * @param index The copy's place among its object's.
 * @param point The copy's own place.
 * @returns The place.
 */
const drawnAt = (
  held: HeldCopy | null,
  name: string,
  index: number,
  point: ImagePoint,
): ImagePoint =>
  held !== null && held.name === name && held.index === index && held.at !== null ? held.at : point;

/**
 * Tell whether a control with keyboard focus stands for a copy.
 *
 * @param focused The control with keyboard focus, if any.
 * @param name The interaction's response's identifier.
 * @param index The copy's place among its object's, none for its object.
 * @returns Whether it does.
 */
const focuses = (focused: CopyKey | null, name: string, index: number | null): boolean =>
  focused !== null && focused.name === name && focused.index === index;

/**
 * Tell whether a placed copy's mark shows keyboard focus: while its control has it, or while its
 * object's button has it and holds the copy, which it gave (`HeldCopy.given`), so the copy the
 * arrows move shows the focus wherever the child moves it from.
 *
 * @param focused The control with keyboard focus, if any.
 * @param held The copy held, if any.
 * @param name The interaction's response's identifier.
 * @param index The copy's place among its object's.
 * @returns Whether it shows focus.
 */
const showsFocus = (
  focused: CopyKey | null,
  held: HeldCopy | null,
  name: string,
  index: number,
): boolean =>
  focuses(focused, name, index) ||
  (held !== null &&
    held.given &&
    held.name === name &&
    held.index === index &&
    focuses(focused, name, null));

/**
 * Draw every placed copy on the stage, inside its overlay: the primitive's `layer`, holding the
 * stage's pointer geometry, and in it a `token` per placed copy, then the new copy held, where it
 * would land. Each copy's mark shows it placed, held, and focused when its control has keyboard
 * focus, or its object's button has while that button holds it; the new copy held shows focused
 * while its object's button has.
 *
 * @param props.focused The control with keyboard focus, if any.
 * @param props.held The copy held, if any.
 * @param props.objects The stage's interactions.
 * @param props.placed Each interaction's placed copies, by its response's identifier.
 * @returns The layer.
 */
const Copies = (props: {
  readonly focused: CopyKey | null;
  readonly held: HeldCopy | null;
  readonly objects: readonly StagedObject[];
  readonly placed: Readonly<Record<string, readonly ImagePoint[]>>;
}) => {
  const { focused, held, objects, placed } = props;
  const { pointAt } = useGraphicStage();

  return (
    <parts.Layer pointAt={pointAt}>
      {objects.flatMap(({ response: { identifier }, ...object }) =>
        (placed[identifier] ?? []).map((point, index) => (
          <parts.Token
            key={`${identifier}#${String(index)}`}
            index={index}
            name={identifier}
            pointerEvents="all"
            transform={placedAt(drawnAt(held, identifier, index, point))}
          >
            <ObjectCopy
              drawing={object}
              state={{
                focusVisible: showsFocus(focused, held, identifier, index),
                placed: true,
                selected: held !== null && held.name === identifier && held.index === index,
              }}
            />
          </parts.Token>
        )),
      )}
      {objects.flatMap(({ response: { identifier }, ...object }) =>
        held !== null && held.name === identifier && held.index === null && held.at !== null
          ? [
              <g
                key={identifier}
                data-slot="plate-position-object-held"
                pointerEvents="none"
                transform={placedAt(held.at)}
              >
                <ObjectCopy
                  drawing={object}
                  state={{
                    focusVisible: focuses(focused, identifier, null),
                    placed: false,
                    selected: true,
                  }}
                />
              </g>,
            ]
          : [],
      )}
    </parts.Layer>
  );
};

/**
 * Render a Position Object stage for the child to answer, holding every response of its
 * interactions in the item's `<Responses>`, each point one value of its interaction's response, and
 * writing all of them at once.
 *
 * The parts:
 *
 * - `plate-position-object`, the root, with `data-picked` while a copy is held and `data-dragging`
 *   while one is dragged;
 * - The graphic stage's parts, `plate-graphic` and below it, with no area: its region named by
 *   `stageNaming` and sized by `scale`, so the smallest copy is 24 CSS px across at the least and
 *   44 where the page has room;
 * - `plate-position-object-layer`, in the stage's marks, and in it `plate-position-object-token`, a
 *   placed copy drawn at its place, with `data-picked` while it is held and `data-dragging` while
 *   it is dragged, which takes the pointer on what it draws and nowhere else, so a tap beside a
 *   copy is the stage's: its `plate-position-object-image` or `plate-position-object-marker`, and
 *   its two-tone `plate-graphic-mark` (`#plate/ui/position-object/token.tsx`), with `data-placed`,
 *   `data-selected` while it is held and `data-focus-visible` while its control has keyboard
 *   focus;
 * - `plate-position-object-held`, the new copy held, drawn where it would land, which takes no
 *   pointer, its mark `data-selected`, and `data-focus-visible` while its object's button has
 *   keyboard focus;
 * - The interactions, each a {@link PositionObject};
 * - `plate-position-object-message`, the latest refusal, as it was announced.
 *
 * The copy a drag shows is `data-slot="plate-position-object-preview"`, with `data-over` while it
 * is over the stage, where the copy is drawn where it would land instead.
 *
 * @param props The stage, its interactions and its labels ({@link PositionObjectStageProps}).
 * @returns The stage, its placed copies bound to the responses.
 */
export const PositionObjectStage = (props: PositionObjectStageProps) => {
  const { children, image, labels, objects, scale, size, stageLabels, stageNaming } = props;
  const declared = useMemo(() => objects.map((object) => object.response), [objects]);
  const authored = useMemo((): AuthoredSize => ({ kind: "both", size }), [size]);
  const [values, set] = useResponsesOf(declared, pointSingles);
  const placements = useMemo(
    (): Placements =>
      new Map([...values].map(([identifier, points]) => [identifier, pointsOf(points)])),
    [values],
  );
  const handle = usePrimitive(positionObject, {
    labels,
    objects,
    onPlacementsChange: (next) => {
      set(new Map([...next].map(([identifier, points]) => [identifier, valuesOf(points)])));
    },
    placements,
    size,
  });

  return usePart(
    handle,
    "root",
    {},
    {
      children: ({ focused, held, placed }) => (
        <>
          <GraphicStage
            labels={stageLabels}
            naming={stageNaming}
            marks={<Copies focused={focused} held={held} objects={objects} placed={placed} />}
            onPress={({ point }) => {
              handle.api.pressStage(point);
            }}
            size={authored}
            targets={{ kind: "scaled", scale }}
          >
            {image}
          </GraphicStage>
          {children}
          <parts.Message>{(state) => state.text}</parts.Message>
        </>
      ),
    },
    "div",
  );
};

/**
 * What the server gives one Position Object inside its stage's island: what the author wrote on
 * it (`Authored`), its group's name always given, plate's own where the author named it by
 * nothing (Q10).
 */
export interface PositionObjectProps extends Authored<Named> {
  /**
   * The response its copies write, as its declaration types it: a `point` response, one value per
   * copy. Its identifier names the interaction to the stage's parts.
   */
  readonly response: Declared<"point", "multiple" | "single">;
  /**
   * The object image, as the server rendered it, which the child takes copies from.
   */
  readonly object: ReactNode;
  /**
   * The object's name: the text its image shows, else its alternative text, else "Object n of
   * count". Its button carries it as its `aria-label`, since announcements read a part's text and
   * never an image's `alt`, and each placed copy's control says it.
   */
  readonly objectName: string;
}

/**
 * Render one Position Object inside its stage's island: its object, the button a copy is taken
 * from, and its placed copies.
 *
 * The parts:
 *
 * - `plate-position-object-group`, an application, so a screen reader in browse mode hands the arrow
 *   keys on to a held copy, with the `role` label as its role description, named by `naming`, with
 *   the author's `data-*` and `class`, `data-full` while it holds as many copies as it may and
 *   `data-picked` while a copy of its object is held;
 * - `plate-position-object-object`, the object's button, a toggle pressed while it holds the copy it
 *   gave, a new copy or, where the limit is one, the copy placed, with `data-picked`,
 *   `data-dragging` while that copy is dragged from it, and `data-full`. The stylesheet gives it
 *   the K–3 minimum of 64 px and `touch-action: none`;
 * - `plate-position-object-copies`, the list of placed copies, an `ol` that says `role="list"`;
 * - `plate-position-object-copy`, a placed copy's control, a toggle pressed while it is held, with
 *   `data-picked`, numbered in the order the copies were placed and named by the `position` label.
 *
 * A copy is a place in its object's order, not an item: its place is its key.
 *
 * @param props The interaction ({@link PositionObjectProps}).
 * @returns The group.
 */
export const PositionObject = (props: PositionObjectProps) => {
  const { naming, object, objectName, response, root } = props;
  const name = response.identifier;
  /**
   * A part made by UI SDK's `createParts` types its `className` as never `undefined`, so the
   * author's class is spread only where it is written.
   */
  const { className, ...data } = root;

  return (
    <parts.Group
      {...naming}
      {...data}
      {...(className === undefined ? {} : { className })}
      name={name}
    >
      {({ placed }) => (
        <>
          <parts.Object aria-label={objectName} name={name}>
            {object}
          </parts.Object>
          <ol data-slot="plate-position-object-copies" role="list">
            {placed.map((_point, index) => (
              <li key={index}>
                <parts.Copy index={index} name={name} object={objectName}>
                  {index + 1}
                </parts.Copy>
              </li>
            ))}
          </ol>
        </>
      )}
    </parts.Group>
  );
};
