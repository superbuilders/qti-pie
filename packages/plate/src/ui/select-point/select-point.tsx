"use client";

/**
 * The Select Point interaction's client island (`qti-select-point-interaction`): the child marks
 * one or more points on the author's image, by a tap, a drag or the keyboard, and the points are
 * the response, each two whole numbers in the image's own pixels.
 *
 * It follows the Choice island's pattern (`#plate/ui/choice/choice.tsx`) and stands on the graphic
 * stage (`#plate/ui/graphic/stage.tsx`), with no area drawn: QTI lets a Select Point's response
 * carry an area mapping that scores it, but "the delivery engine must not indicate these areas of
 * the image. Only the actual point(s) selected by the candidate shall be indicated" (QTI 3.0
 * information model 5.128). The stage maps a tap to the image's pixels through its overlay, so a
 * point lands where the child tapped whatever the page scales the image to, and its region is the
 * image's one tab stop, where the keyboard's cross works; the island's primitive
 * (`#plate/ui/select-point/primitive.ts`) takes every tap, drag and key, and its steps
 * (`#plate/ui/select-point/points.ts`) hold each point on the image.
 *
 * Each point is one `point` value of the response, its two coordinates, point by point. An
 * untouched Select Point holds none, the response stays NULL, "the candidate has not offered a
 * response" (5.115), until the child marks a point.
 *
 * @module
 * @see https://www.imsglobal.org/spec/qti/v3p0/info/index.html#Data_SelectPointInteraction
 */
import { createParts, usePart, usePrimitive } from "@ui-sdk/react/primitive";
import type { PartProps } from "@ui-sdk/react/primitive";
import { useId, useMemo } from "react";
import type { ReactNode } from "react";
import type { AuthoredSize, ImageSize } from "#plate/interactions/image-size.ts";
import type { Declared } from "#plate/model/values.ts";
import type { Authored, NameAttributes } from "#plate/ui/attributes.ts";

import { Pin } from "#plate/ui/graphic/frame.tsx";
import { GraphicStage, useGraphicStage } from "#plate/ui/graphic/stage.tsx";
import type { StagePress, StageRole } from "#plate/ui/graphic/stage.tsx";
import { fillLabel } from "#plate/ui/labels.ts";
import { PromptPart } from "#plate/ui/prompt.tsx";
import type { Prompt } from "#plate/ui/prompt.tsx";
import { pointSingles, useResponse } from "#plate/ui/responses.tsx";
import type { SelectPointLabels } from "#plate/ui/select-point/labels.ts";
import { Cross, Marker, selectPointScaleOf } from "#plate/ui/select-point/marker.tsx";
import { pointsOf, valuesOf } from "#plate/ui/select-point/points.ts";
import type { Picks } from "#plate/interactions/picks.ts";
import type { Point } from "#plate/ui/select-point/points.ts";
import { selectPoint } from "#plate/ui/select-point/primitive.ts";
import type { Dragged, SelectPointBoardState } from "#plate/ui/select-point/primitive.ts";

/**
 * What the server gives a Select Point's island, as QTI's `qti-select-point-interaction` and
 * plate's presentation of it say: what the author wrote on it (`Authored`), whose `naming` names
 * the group and the stage's region alike.
 *
 * @see https://www.imsglobal.org/spec/qti/v3p0/info/index.html#Data_SelectPointInteraction
 */
export interface SelectPointProps extends Authored<NameAttributes> {
  /**
   * The author's image, its `img`, `picture` or `object`, as the server rendered it, its URL
   * through the host's `assets`.
   */
  readonly image: ReactNode;
  /**
   * The texts the island writes for the child, the stage's among them, from plate's message
   * catalog (`selectPointLabels` in `#plate/ui/select-point/labels.ts`).
   */
  readonly labels: SelectPointLabels;
  /**
   * The response the points write, as its declaration types it: a `point` response, one value per
   * point.
   */
  readonly response: Declared<"point", "multiple" | "single">;
  /**
   * How many points the child marks ({@link Picks}), which the server reads from the response's
   * cardinality and `max-choices`. `min-choices` is not a prop: it decides whether a submitted
   * response is valid (5.128.1), which the server judges, and a child is never stopped short of
   * it.
   */
  readonly picks: Picks;
  /**
   * The `qti-prompt`, server-rendered; none where the interaction has none.
   */
  readonly prompt: Prompt | undefined;
  /**
   * The image's size, its `width` and `height` as the author wrote them: the pixel space a point's
   * coordinates are in, which the core bounds a point by and which the stage's overlay draws in.
   */
  readonly size: ImageSize;
}

/**
 * The parts UI SDK makes from the primitive, one per tagged slot. The root is the island's own,
 * rendered with `usePart`, so the island holds the instance whose api takes the stage's taps.
 */
const parts = createParts(selectPoint, { board: "div", limit: "p", point: "button" });

/**
 * Pin the island's marks over the image: each point's marker, the one dragged where it is dragged
 * and the one whose button has keyboard focus marked so, then the keyboard's cross at the board's
 * cross, which the stylesheet shows while the stage's region has keyboard focus. Every size is in
 * CSS pixels, the pins' unit.
 *
 * A point's number is its place among the points: its place is its key.
 *
 * @param props.cross Where the cross is.
 * @param props.drag The point dragged, if any.
 * @param props.focused The index of the point whose button has keyboard focus, if any.
 * @param props.points The points.
 * @returns The marks.
 */
const Marks = (props: {
  readonly cross: Point;
  readonly drag: Dragged | null;
  readonly focused: number | null;
  readonly points: readonly Point[];
}) => {
  const { cross, drag, focused, points } = props;
  const { size } = useGraphicStage();

  return (
    <>
      {points.map((point, index) => {
        const dragging = drag?.index === index;

        return (
          <Pin key={index} at={dragging ? drag.at : point} size={size}>
            <Marker
              index={index}
              state={{ dragging, focusVisible: focused === index, kind: "answering" }}
            />
          </Pin>
        );
      })}
      <Pin at={cross} size={size}>
        <Cross />
      </Pin>
    </>
  );
};

/**
 * Render the board: the image on the graphic stage, its region an application, so a screen reader
 * in browse mode hands the arrow keys on to the cross, named as the interaction's group is and
 * described by the keys that work in it, its marks over it.
 *
 * @param props.image The author's image, as the server rendered it.
 * @param props.keysId The id of the part that describes the keys.
 * @param props.labels The island's labels, whose scroll hint the stage takes.
 * @param props.naming What names the stage's region, as the group is named.
 * @param props.onPress Called with each tap on the image off every marker, once released.
 * @param props.points The points.
 * @param props.size The image's size.
 * @returns The board.
 */
const Board = (props: {
  readonly image: ReactNode;
  readonly keysId: string;
  readonly labels: SelectPointLabels;
  readonly naming: NameAttributes;
  readonly onPress: (press: StagePress) => void;
  readonly points: readonly Point[];
  readonly size: ImageSize;
}) => {
  const { image, keysId, labels, naming, onPress, points, size } = props;
  const scale = useMemo(() => selectPointScaleOf(size), [size]);
  const authored = useMemo((): AuthoredSize => ({ kind: "both", size }), [size]);
  const role = useMemo(
    (): StageRole => ({ description: labels.role, keys: keysId, kind: "application" }),
    [keysId, labels.role],
  );

  return (
    <parts.Board>
      {(board: SelectPointBoardState) => (
        <GraphicStage
          labels={labels}
          pins={
            <Marks cross={board.cross} drag={board.drag} focused={board.focused} points={points} />
          }
          naming={naming}
          onPress={onPress}
          role={role}
          size={authored}
          targets={{ kind: "scaled", scale }}
        >
          {image}
        </GraphicStage>
      )}
    </parts.Board>
  );
};

/**
 * Render a Select Point for the child to answer, holding its response in the item's `<Responses>`.
 *
 * The parts:
 *
 * - `plate-select-point`, the root, a group named by `naming`, with the author's `data-*` and
 *   `class`, `data-dragging` while a point is dragged, and `data-full` while the points reach
 *   `max-choices`;
 * - `plate-prompt`, the prompt;
 * - `plate-select-point-board`, around the graphic stage, `plate-graphic` and its parts, whose region
 *   is the image's one tab stop, an application with the `role` label as its role description,
 *   named as the group is and described by the keys, and whose marks draw each point's marker
 *   (`#plate/ui/select-point/marker.tsx`) and the keyboard's cross, `plate-select-point-cross`; the
 *   board takes the keys pressed in the region, and a press on a marker, with `data-dragging`
 *   during a drag;
 * - `plate-select-point-keys`, the keys, which describe the region;
 * - `plate-select-point-points`, the points as a list, an `ol` that says `role="list"` outright,
 *   since the stylesheet may take its markers off, present while there is a point. Each
 *   `plate-select-point-point` is a button named by the `point` label that removes its point, one
 *   roving group;
 * - `plate-select-point-limit`, the `limit` label, shown from a refused mark until the next step that
 *   goes through.
 *
 * The overlay the marks stand in is `aria-hidden`: the list says everything it shows, and the
 * primitive announces each step and refusal with the `labels`.
 *
 * A point's number is its place among the points: its place is its key.
 *
 * @param props The interaction, its response and its labels ({@link SelectPointProps}).
 * @returns The Select Point, its points bound to the response.
 */
export const SelectPoint = (props: SelectPointProps) => {
  const { image, labels, naming, picks, prompt, response, root, size } = props;
  const [values, set] = useResponse(response, pointSingles);
  const points = useMemo(() => pointsOf(values), [values]);
  const keysId = useId();
  const handle = usePrimitive(selectPoint, {
    labels,
    onPointsChange: (next) => {
      set(valuesOf(next));
    },
    picks,
    points,
    size,
  });
  const content = (
    <>
      <PromptPart prompt={prompt} />
      <Board
        image={image}
        keysId={keysId}
        labels={labels}
        naming={naming}
        onPress={(press) => {
          handle.api.pressImage(press.point);
        }}
        points={points}
        size={size}
      />
      <p data-slot="plate-select-point-keys" id={keysId}>
        {labels.keys}
      </p>
      {points.length === 0 ? null : (
        <ol data-slot="plate-select-point-points" role="list">
          {points.map((point, index) => (
            <li key={index}>
              <parts.Point index={index} value={String(index)}>
                {fillLabel(labels.point, { n: index + 1, x: point.x, y: point.y })}
              </parts.Point>
            </li>
          ))}
        </ol>
      )}
      <parts.Limit>{(limit) => limit.text}</parts.Limit>
    </>
  );
  /**
   * A part UI SDK makes types its `className` as never `undefined`, so the author's class is set
   * only where it is written, after the attributes it follows.
   */
  const { className, ...data } = root;
  const part: PartProps<"div"> = { ...data, ...naming, children: content };

  if (className !== undefined) {
    part.className = className;
  }

  return usePart(handle, "root", {}, part, "div");
};
