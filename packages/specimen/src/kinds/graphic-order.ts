/**
 * Graphic Order (`qti-graphic-order-interaction`): 2 to 6 areas drawn on a picture, and a default
 * area for anywhere else, the child putting every area, or only some, in order.
 *
 * @module
 */
import { Array as Arr, Option } from "effect";
import type { Answered } from "#specimen/answer.ts";
import { identifierValue, responding } from "#specimen/posted.ts";
import { credited, matchesCorrect } from "#specimen/credit.ts";
import { counted, dimension } from "#specimen/dimension.ts";
import { kind } from "#specimen/kind.ts";
import {
  areasOf,
  pictureOf,
  restAttributes,
  areaAttributes,
  stageDimensions,
  stageOf,
} from "#specimen/kinds/graphic.ts";
import type { Stage } from "#specimen/kinds/graphic.ts";
import { correctResponse, declaration } from "#specimen/response.ts";
import { word } from "#specimen/words.ts";
import { element } from "#specimen/xml.ts";

/**
 * The response's identifier.
 */
const response = "RESPONSE";

/**
 * The default area's identifier and name.
 */
const rest = { identifier: "ELSEWHERE", name: "Anywhere else" } as const;

/**
 * A Graphic Order's settings.
 */
export interface GraphicOrderSettings {
  readonly areas: number;
  /**
   * How many areas the order holds: every one, with no `min-choices` or `max-choices`; or the
   * first half of them, from `min-choices="1"` to `max-choices` that many.
   */
  readonly counts: "all" | "some";
  /**
   * Whether a default area, anywhere else on the picture, follows the drawn ones.
   */
  readonly rest: "none" | "rest";
  readonly stage: Stage;
}

/**
 * How many areas the right order holds: every drawn one, or half of them, at least one.
 *
 * @param settings The settings.
 * @returns The count.
 */
const orderedCount = (settings: GraphicOrderSettings): number =>
  settings.counts === "all" ? settings.areas : Math.max(1, Math.floor(settings.areas / 2));

/**
 * A drawn area's identifier.
 *
 * @param at Its place, from 0.
 * @returns `H1`, `H2`, …
 */
const idOf = (at: number): string => `H${String(at + 1)}`;

/**
 * The right order: the drawn areas from the last back, so it is never the document's order, as
 * many as it holds.
 *
 * @param settings The settings.
 * @returns The areas' identifiers, first to last.
 */
const rightOrder = (settings: GraphicOrderSettings): readonly string[] =>
  Arr.makeBy(orderedCount(settings), (at) => idOf(settings.areas - 1 - at));

/**
 * The response an order gives: an `ordered` of the areas' identifiers, first to last.
 *
 * @param areas The areas' identifiers, in order.
 * @returns The response, none for no area ordered.
 */
const posted = (areas: readonly string[]): Answered["posted"] =>
  responding(response, identifierValue("ordered", areas));

export const graphicOrder = kind("graphic-order", {
  answers: (settings: GraphicOrderSettings) => {
    const order = rightOrder(settings);
    const several: readonly Answered[] =
      order.length < 2
        ? [
            {
              answer: "wrong",
              posted: posted([settings.rest === "rest" ? rest.identifier : idOf(0)]),
              score: 0,
            },
          ]
        : [
            {
              answer: "partial",
              posted: posted(order.slice(0, Math.floor(order.length / 2))),
              score: 0,
            },
            { answer: "wrong", posted: posted(order.toReversed()), score: 0 },
          ];

    return [
      { answer: "right", posted: posted(order), score: 1 },
      ...several,
      { answer: "empty", posted: {}, score: 0 },
    ];
  },
  dimensions: {
    ...stageDimensions,
    areas: counted("Areas", 2, 6),
    counts: dimension("Order", [
      ["all", "Every area", "all"],
      ["some", "Some areas", "some"],
    ]),
    rest: dimension("Default area", [
      ["none", "None", "none"],
      ["rest", "Anywhere else", "rest"],
    ]),
  },
  label: "Graphic Order",
  settings:
    (pick) =>
    (source): GraphicOrderSettings => ({
      areas: source.draw(pick("areas")),
      counts: source.draw(pick("counts")),
      rest: source.draw(pick("rest")),
      stage: source.draw(stageOf(pick)),
    }),
  write: (settings: GraphicOrderSettings, context) => {
    const { stage } = settings;
    const areas = areasOf(stage, settings.areas);
    const picture = pictureOf(
      stage,
      `A picture of ${String(settings.areas)} stops`,
      areas.map((area, at) => ({ area, name: word(at) })),
    );

    return {
      assets: [picture.asset],
      body: element(
        "qti-graphic-order-interaction",
        {
          "max-choices":
            settings.counts === "some" ? Option.some(orderedCount(settings)) : Option.none(),
          "min-choices": settings.counts === "some" ? Option.some(1) : Option.none(),
          "response-identifier": response,
        },
        [
          ...Option.match(context.prompt, {
            onNone: () => [],
            onSome: (prompt) => [element("qti-prompt", {}, [prompt])],
          }),
          picture.markup,
          ...areas.map((area, at) =>
            element(
              "qti-hotspot-choice",
              {
                ...areaAttributes(stage, area),
                "hotspot-label": word(at),
                identifier: idOf(at),
              },
              [],
            ),
          ),
          ...(settings.rest === "rest"
            ? [
                element(
                  "qti-hotspot-choice",
                  {
                    ...restAttributes(stage),
                    "hotspot-label": rest.name,
                    identifier: rest.identifier,
                  },
                  [],
                ),
              ]
            : []),
        ],
      ),
      declarations: [
        declaration(response, "ordered", "identifier", [correctResponse(rightOrder(settings))]),
      ],
      host: Option.none(),
      scoring: { kind: "scored", most: 1, rules: [credited(matchesCorrect(response), 1)] },
    };
  },
});
