/**
 * Position Object (`qti-position-object-stage`): a picture of landmarks and 1 to 3 objects, each
 * its own interaction and response, the child placing each object on the landmarks it belongs on,
 * scored by each response's area mapping.
 *
 * @module
 */
import { Array as Arr, Option } from "effect";
import type { Answered } from "#specimen/answer.ts";
import { pointValue } from "#specimen/posted.ts";
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
import { image, sizeOf } from "#specimen/picture.ts";
import type { Picture } from "#specimen/picture.ts";
import { correctResponse, declaration } from "#specimen/response.ts";
import { word } from "#specimen/words.ts";
import { element } from "#specimen/xml.ts";

/**
 * How many times the child places each object: once (`max-choices="1"`, a single point), once on
 * each of its two landmarks, or any number of times (`max-choices="0"`).
 */
const placings = dimension("Placings of each object", [
  ["one", "Once", "one"],
  ["at-most", "Once on each of its landmarks", "at-most"],
  ["any", "Any number", "any"],
]);

/**
 * The picture every object shows: a small square token.
 */
const token: Picture = { aspect: "square", scale: "tiny" };

/**
 * A Position Object's settings.
 */
export interface PositionObjectSettings {
  /**
   * The object's point that lands where it is placed: its centre, which plate derives from the
   * object's size; or its bottom centre, as a pin's tip, written as `center-point`.
   */
  readonly centre: "derived" | "written";
  /**
   * `min-choices`: unwritten, or 1, the least QTI admits there.
   */
  readonly least: "none" | "one";
  readonly objects: number;
  readonly placings: (typeof placings.values)[number]["value"];
  readonly stage: Stage;
}

/**
 * How many landmarks each object belongs on: one for a single placing, else two.
 *
 * @param settings The settings.
 * @returns The count.
 */
const homesOf = (settings: PositionObjectSettings): number => (settings.placings === "one" ? 1 : 2);

/**
 * An object's response identifier.
 *
 * @param at Its place, from 0.
 * @returns `OBJECT_1`, `OBJECT_2`, …
 */
const responseOf = (at: number): string => `OBJECT_${String(at + 1)}`;

/**
 * A Position Object's landmarks: the one no object belongs on, and each object's own.
 */
interface Places {
  readonly decoy: Area;
  readonly homes: Arr.NonEmptyReadonlyArray<readonly Area[]>;
}

/**
 * The stage's areas: a landmark no object belongs on first, then each object's landmarks in turn.
 *
 * @param settings The settings.
 * @returns The decoy, and each object's landmarks.
 */
const placesOf = (settings: PositionObjectSettings): Places => {
  const areas = areasOf(settings.stage, settings.objects * homesOf(settings) + 1);
  const targets = Arr.tailNonEmpty(areas);

  return {
    decoy: Arr.headNonEmpty(areas),
    homes: Arr.makeBy(settings.objects, (at) =>
      targets.slice(at * homesOf(settings), (at + 1) * homesOf(settings)),
    ),
  };
};

/**
 * The responses the objects' placings give: each object placed at least once, its response its
 * points in the cardinality the placings bind, `single` for one placing.
 *
 * @param settings The settings.
 * @param placed The landmarks each object is placed at the centre of, by the object's place.
 * @returns The responses, none for an object left unplaced.
 */
const posted = (
  settings: PositionObjectSettings,
  placed: readonly (readonly Area[])[],
): Answered["posted"] =>
  Object.fromEntries(
    placed.flatMap((areas, at) =>
      areas.length === 0
        ? []
        : [
            [
              responseOf(at),
              pointValue(
                settings.placings === "one" ? "single" : "multiple",
                areas.map((area) => area.centre),
              ),
            ] as const,
          ],
    ),
  );

export const positionObject = kind("position-object", {
  answers: (settings: PositionObjectSettings) => {
    const { decoy, homes } = placesOf(settings);
    const total = settings.objects * homesOf(settings);
    const partial: readonly Answered[] =
      total < 2
        ? []
        : [
            {
              answer: "partial",
              posted: posted(settings, [Arr.headNonEmpty(homes).slice(0, 1)]),
              score: 1,
            },
          ];

    return [
      { answer: "right", posted: posted(settings, homes), score: total },
      ...partial,
      {
        answer: "wrong",
        posted: posted(
          settings,
          homes.map(() => [decoy]),
        ),
        score: 0,
      },
      { answer: "empty", posted: {}, score: 0 },
    ];
  },
  dimensions: {
    ...sizedStageDimensions,
    centre: dimension("The point that lands", [
      ["derived", "The object's centre", "derived"],
      ["written", "A pin's tip (center-point)", "written"],
    ]),
    least: dimension("min-choices", [
      ["none", "Unwritten", "none"],
      ["one", "1", "one"],
    ]),
    objects: counted("Objects", 1, 3),
    placings,
  },
  label: "Position Object",
  settings:
    (pick) =>
    (source): PositionObjectSettings => ({
      centre: source.draw(pick("centre")),
      least: source.draw(pick("least")),
      objects: source.draw(pick("objects")),
      placings: source.draw(pick("placings")),
      stage: source.draw(sizedStageOf(pick)),
    }),
  write: (settings: PositionObjectSettings, context) => {
    const { decoy, homes } = placesOf(settings);
    const picture = pictureOf(
      settings.stage,
      `A picture of ${String(settings.objects * homesOf(settings) + 1)} landmarks`,
      [decoy, ...homes.flat()].map((area, at) => ({ area, name: word(at) })),
    );
    const tokens = homes.map((_, at) => image(token, `Object ${word(at)}`));
    const size = sizeOf(token);
    const most = { any: 0, "at-most": homesOf(settings), one: 1 }[settings.placings];

    return {
      assets: [picture.asset, ...tokens.map((shown) => shown.file.asset)],
      body: [
        ...Option.toArray(context.prompt),
        element("qti-position-object-stage", {}, [
          picture.markup,
          ...tokens.map((shown, at) =>
            element(
              "qti-position-object-interaction",
              {
                "center-point":
                  settings.centre === "written"
                    ? Option.some(`${String(size.width / 2)} ${String(size.height)}`)
                    : Option.none(),
                "max-choices": most,
                "min-choices": settings.least === "one" ? Option.some(1) : Option.none(),
                "response-identifier": responseOf(at),
              },
              [shown.markup],
            ),
          ),
        ]),
      ].join(""),
      declarations: homes.map((areas, at) =>
        declaration(responseOf(at), settings.placings === "one" ? "single" : "multiple", "point", [
          correctResponse(areas.map((area) => pointText(area.centre))),
          areaMapping(areas, 0),
        ]),
      ),
      host: Option.none(),
      scoring: {
        kind: "scored",
        most: settings.objects * homesOf(settings),
        rules: homes.map((_, at) => mappedPoints(responseOf(at))),
      },
    };
  },
});
