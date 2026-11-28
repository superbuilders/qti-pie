/**
 * Select Point (`qti-select-point-interaction`): a picture of landmarks, the child placing a point
 * on each one asked for, scored by an area mapping of the landmarks.
 *
 * @module
 */
import { Array as Arr, Option } from "effect";
import type { Answered } from "#specimen/answer.ts";
import { pointValue, responding } from "#specimen/posted.ts";
import { mappedPoints } from "#specimen/credit.ts";
import { counted, dimension } from "#specimen/dimension.ts";
import { kind } from "#specimen/kind.ts";
import {
  areaMapping,
  areasOf,
  pictureOf,
  pointText,
  sizedStageDimensions,
  sizedStageOf,
} from "#specimen/kinds/graphic.ts";
import type { Area, Stage } from "#specimen/kinds/graphic.ts";
import { correctResponse, declaration } from "#specimen/response.ts";
import { word } from "#specimen/words.ts";
import { element } from "#specimen/xml.ts";

/**
 * The response's identifier.
 */
const response = "RESPONSE";

/**
 * How many points the child may place: one (`max-choices="1"`, a single point), one for each
 * landmark asked for, or any number (`max-choices="0"`, which plate offers as one point unless
 * `min-choices` asks for more).
 */
const points = dimension("Points", [
  ["one", "One", "one"],
  ["at-most", "One for each landmark", "at-most"],
  ["any", "Any number", "any"],
]);

/**
 * A Select Point's settings.
 */
export interface SelectPointSettings {
  /**
   * `min-choices`: unwritten, or every landmark asked for; none for a single point.
   */
  readonly least: "all" | "none";
  readonly points: (typeof points.values)[number]["value"];
  readonly stage: Stage;
  /**
   * How many landmarks the child is asked to mark: one for a single point.
   */
  readonly targets: number;
}

/**
 * A Select Point's landmarks: the one no point belongs on, and the ones asked for.
 */
interface Places {
  readonly decoy: Area;
  readonly targets: readonly Area[];
}

/**
 * The stage's areas: a landmark no point belongs on first, then the landmarks asked for.
 *
 * @param settings The settings.
 * @returns The decoy, and the targets in order.
 */
const placesOf = (settings: SelectPointSettings): Places => {
  const areas = areasOf(settings.stage, settings.targets + 1);

  return { decoy: Arr.headNonEmpty(areas), targets: Arr.tailNonEmpty(areas) };
};

/**
 * The response a set of points gives, in the cardinality the points bind: `single` for one point.
 *
 * @param settings The settings.
 * @param placed The areas whose centres the points are at.
 * @returns The response, none for no point.
 */
const posted = (settings: SelectPointSettings, placed: readonly Area[]): Answered["posted"] =>
  responding(
    response,
    pointValue(
      settings.points === "one" ? "single" : "multiple",
      placed.map((area) => area.centre),
    ),
  );

export const selectPoint = kind("select-point", {
  answers: (settings: SelectPointSettings) => {
    const { decoy, targets } = placesOf(settings);
    const half = Math.floor(targets.length / 2);
    const partial: readonly Answered[] =
      half === 0
        ? []
        : [{ answer: "partial", posted: posted(settings, targets.slice(0, half)), score: half }];

    return [
      { answer: "right", posted: posted(settings, targets), score: targets.length },
      ...partial,
      { answer: "wrong", posted: posted(settings, [decoy]), score: 0 },
      { answer: "empty", posted: {}, score: 0 },
    ];
  },
  dimensions: {
    ...sizedStageDimensions,
    least: dimension("min-choices", [
      ["none", "Unwritten", "none"],
      ["all", "Every landmark", "all"],
    ]),
    points,
    targets: counted("Landmarks asked for", 2, 3),
  },
  label: "Select Point",
  settings:
    (pick) =>
    (source): SelectPointSettings => {
      const held = source.draw(pick("points"));

      return {
        least: held === "one" ? "none" : source.draw(pick("least")),
        points: held,
        stage: source.draw(sizedStageOf(pick)),
        targets: held === "one" ? 1 : source.draw(pick("targets")),
      };
    },
  write: (settings: SelectPointSettings, context) => {
    const { decoy, targets } = placesOf(settings);
    const picture = pictureOf(
      settings.stage,
      `A picture of ${String(targets.length + 1)} landmarks`,
      [decoy, ...targets].map((area, at) => ({ area, name: word(at) })),
    );
    const most = { any: 0, "at-most": targets.length, one: 1 }[settings.points];

    return {
      assets: [picture.asset],
      body: element(
        "qti-select-point-interaction",
        {
          "max-choices": most,
          "min-choices": settings.least === "all" ? Option.some(targets.length) : Option.none(),
          "response-identifier": response,
        },
        [
          ...Option.match(context.prompt, {
            onNone: () => [],
            onSome: (prompt) => [element("qti-prompt", {}, [prompt])],
          }),
          picture.markup,
        ],
      ),
      declarations: [
        declaration(response, settings.points === "one" ? "single" : "multiple", "point", [
          correctResponse(targets.map((area) => pointText(area.centre))),
          areaMapping(targets),
        ]),
      ],
      host: Option.none(),
      scoring: { kind: "scored", most: targets.length, rules: [mappedPoints(response)] },
    };
  },
});
