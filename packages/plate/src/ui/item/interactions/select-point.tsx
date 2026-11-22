/**
 * Select Point (Q-18) in the server shell: what renders a `qti-select-point-interaction`'s payload
 * node, its island in `answering` and its server markup in `review` and `solution`.
 *
 * The island (`#plate/ui/select-point/select-point.tsx`) takes the author's image, its size, the
 * pixel space a point is in, and how many points the child marks, all read here from the payload
 * node, which holds no correct response and no area mapping.
 *
 * The review stands in the stage's frame (`#plate/ui/graphic/frame.tsx`): the image, each point it
 * shows as its marker over it, and the list of the points after it, the candidate's in `review`
 * and the correct response's in `solution`. It draws no area, since QTI forbids a delivery engine
 * to show a Select Point's areas (information model 5.128), and the payload holds none. It marks
 * none of the points right or wrong, plate's ruling R4: an exact `qti-match` on points calls nearly
 * every point a child marks wrong, and an area mapping, which scores a Select Point, is one the
 * page may not show.
 *
 * @module
 */
import type { ReactNode } from "react";
import { message, numeral } from "#plate/messages.ts";
import type { PayloadOf } from "#plate/model/interactions.ts";
import type { Paired } from "#plate/payload.ts";
import { Pin, StageFrame } from "#plate/ui/graphic/frame.tsx";
import { graphicKeys } from "#plate/ui/graphic/labels.ts";
import type { IslandContext, ReviewContext } from "#plate/ui/item/context.ts";
import { contentOf } from "#plate/ui/item/interactions/answering.tsx";
import { groupNameOf, labelsOf, promptAt, rootOf } from "#plate/ui/item/interactions/labels.ts";
import { markingOf, pointMarksOf } from "#plate/ui/item/interactions/marks.ts";
import { markPart, wordsOfMark } from "#plate/ui/item/interactions/words.tsx";
import type { Words } from "#plate/ui/item/interactions/words.tsx";
import { picksOf } from "#plate/ui/picks/picks.ts";
import type { Picks } from "#plate/ui/picks/picks.ts";
import { selectPointKeys } from "#plate/ui/select-point/labels.ts";
import { Marker, selectPointScaleOf } from "#plate/ui/select-point/marker.tsx";
import type { Point } from "#plate/ui/select-point/points.ts";
import { SelectPoint } from "#plate/ui/select-point/select-point.tsx";
import { PromptPart } from "#plate/ui/prompt.tsx";

/**
 * Read how many points a Select Point's child marks: one for a `single` response, or a `multiple`
 * one whose `max-choices` is 1; any other up to `max-choices`, which the XSD gives a default of 0,
 * no limit (5.128.2), where the author wrote none.
 *
 * @param node The Select Point's payload: its binding's cardinality and `max-choices`, 0 when the
 *   author wrote none.
 * @returns The island's `picks`.
 */
const picksOfPoints = (node: PayloadOf<"select-point">): Picks =>
  picksOf({
    cardinality: node.cardinality,
    maxChoices: node.maxChoices,
  });

/**
 * Render a Select Point's island.
 *
 * @param paired The Select Point and its payload node.
 * @param paired.model The redacted model node: its `data-*`.
 * @param paired.payload Its payload node: its image and size, binding, `max-choices`, prompt and
 *   names.
 * @param context What the page may know of the render.
 * @returns The island.
 */
export const island = (
  { model, payload: node }: Paired<"select-point">,
  context: IslandContext,
): ReactNode => {
  const prompt = promptAt(node.prompt, node.response, context);

  return (
    <SelectPoint
      image={contentOf(node.image, "flow", context)}
      labels={labelsOf(selectPointKeys, context.locale, {})}
      name={node.formName}
      naming={groupNameOf(prompt, node, context)}
      picks={picksOfPoints(node)}
      prompt={prompt}
      root={rootOf(model, context)}
      size={{ height: node.height, width: node.width }}
    />
  );
};

/**
 * Read the points a payload shows, each coordinate the decimal digits the core wrote for a point
 * value's (`shownPoints` in `#plate/interactions/select-point.ts`).
 *
 * @param node The Select Point's payload: the points it shows.
 * @returns The points, in order.
 */
const shownOf = (node: PayloadOf<"select-point">): readonly Point[] =>
  node.points.map((shown) => ({ x: Number(shown.x), y: Number(shown.y) }));

/**
 * Render a Select Point's review or solution: the stage's frame, its scale the image's, each point
 * it shows as its marker over the image, and the points listed after it, each "Point n, x across
 * and y down" with "Right answer" in a solution, whose points are the correct ones, and in a
 * review each with the mark the host handed it and its words, "Your answer" where it handed none,
 * then each correct point handed missed, for a screen reader (proposal 2026-11-18-grading-in-sql,
 * Decision 6: a Select Point's review marks each point by area).
 *
 * @param paired The Select Point and its payload node.
 * @param paired.model The redacted model node: its `data-*`.
 * @param paired.payload Its payload node: its image and size and the points it shows.
 * @param context What the shell knows of the item and the render.
 * @returns The markup.
 */
export const review = (
  { model, payload: node }: Paired<"select-point">,
  context: ReviewContext,
): ReactNode => {
  const { locale } = context;
  const prompt = promptAt(node.prompt, node.response, context);
  const names = groupNameOf(prompt, node, context);
  const marking = markingOf(node.response, context);
  const marks = pointMarksOf(node.points, marking);
  const wordsAt = (index: number): Words => {
    if (marking.kind === "solution") {
      return "correct";
    }

    return marking.kind === "marked" ? wordsOfMark(marks.given[index]) : "given";
  };
  const size = { height: node.height, width: node.width };
  const points = shownOf(node);

  return (
    <div {...rootOf(model, context)} {...names} data-slot="plate-select-point" role="group">
      <PromptPart prompt={prompt} />
      <StageFrame
        image={context.content(node.image, { position: "flow" })}
        labels={labelsOf(graphicKeys, context.locale, {})}
        naming={names}
        pins={() =>
          points.map((point, index) => (
            // A point's number is its place among the points: its place is its key.
            <Pin key={index} at={point} size={size}>
              <Marker index={index} state={{ kind: "shown" }} />
            </Pin>
          ))
        }
        stage={{ kind: "sized", scale: selectPointScaleOf(size), size }}
      />
      {points.length === 0 && marks.missed.length === 0 ? null : (
        <ol data-slot="plate-select-point-points" role="list">
          {points.map((point, index) => (
            // A point's number is its place among the points: its place is its key.
            <li key={index} data-mark={marks.given[index]} data-slot="plate-select-point-point">
              {message(locale, "selectPointShown", {
                n: numeral(locale, index + 1),
                x: numeral(locale, point.x),
                y: numeral(locale, point.y),
              })}
              {markPart(wordsAt(index), locale)}
            </li>
          ))}
          {marks.missed.map((point, index) => (
            // A missed point follows the points shown, numbered after them: its place is its key.
            <li
              key={`missed-${String(index)}`}
              data-mark="missed"
              data-slot="plate-select-point-point"
            >
              {message(locale, "selectPointShown", {
                n: numeral(locale, points.length + index + 1),
                x: numeral(locale, Number(point.x)),
                y: numeral(locale, Number(point.y)),
              })}
              {markPart(wordsOfMark("missed"), locale)}
            </li>
          ))}
        </ol>
      )}
    </div>
  );
};
