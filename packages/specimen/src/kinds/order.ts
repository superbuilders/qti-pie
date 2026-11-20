/**
 * Order (`qti-order-interaction`): 3 to 8 choices put in order, in a column or a row, every one of
 * them or, where the author allows, only some.
 *
 * @module
 */
import { Array as Arr, Option } from "effect";
import type { Answered } from "#specimen/answer.ts";
import { credited } from "#specimen/credit.ts";
import { counted, dimension } from "#specimen/dimension.ts";
import { kind } from "#specimen/kind.ts";
import { correctResponse, declaration } from "#specimen/response.ts";
import { length, run } from "#specimen/words.ts";
import type { Length } from "#specimen/words.ts";
import { element, text } from "#specimen/xml.ts";

/**
 * The response's identifier.
 */
const response = "RESPONSE";

/**
 * How many choices the child must order: all of them, the author writing no counts, or at least
 * two (`min-choices="2"`, `max-choices` the count).
 */
const ordered = dimension("Ordered", [
  ["all", "Every choice", "all"],
  ["some", "At least two", "some"],
]);

/**
 * An Order's settings.
 */
interface OrderSettings {
  readonly choices: number;
  readonly ordered: (typeof ordered.values)[number]["value"];
  readonly orientation: "horizontal" | "vertical";
  readonly text: Length;
}

/**
 * A choice's identifier, numbered by its place in the right order.
 *
 * @param at Its place, from 0.
 * @returns `O1`, `O2`, …
 */
const idOf = (at: number): string => `O${String(at + 1)}`;

/**
 * The response an order posts.
 *
 * @param places The choices' places in the right order, in the order posted.
 * @returns One entry per choice.
 */
const posted = (places: readonly number[]): Answered["posted"] =>
  places.map((at) => [response, idOf(at)] as const);

/**
 * Order, as the record of kinds holds it.
 */
export const order = kind("order", {
  answers: (settings: OrderSettings) => {
    const right = Arr.makeBy(settings.choices, (at) => at);

    return [
      { answer: "right", posted: posted(right), score: settings.choices },
      {
        answer: "partial",
        posted: posted([...right.slice(0, -2), ...right.slice(-2).toReversed()]),
        score: settings.choices - 2,
      },
      { answer: "wrong", posted: posted([...right.slice(1), 0]), score: 0 },
      { answer: "empty", posted: [], score: 0 },
    ];
  },
  dimensions: {
    choices: counted("Choices", 3, 8),
    ordered,
    orientation: dimension("Orientation", [
      ["vertical", "Vertical", "vertical"],
      ["horizontal", "Horizontal", "horizontal"],
    ]),
    text: length,
  },
  label: "Order",
  settings:
    (pick) =>
    (source): OrderSettings => ({
      choices: source.draw(pick("choices")),
      ordered: source.draw(pick("ordered")),
      orientation: source.draw(pick("orientation")),
      text: source.draw(pick("text")),
    }),
  write: (settings: OrderSettings, context) => {
    const right = Arr.makeBy(settings.choices, (at) => at);

    return {
      assets: [],
      body: element(
        "qti-order-interaction",
        {
          "max-choices":
            settings.ordered === "some" ? Option.some(settings.choices) : Option.none(),
          "min-choices": settings.ordered === "some" ? Option.some(2) : Option.none(),
          orientation: settings.orientation,
          "response-identifier": response,
        },
        ...Option.match(context.prompt, {
          onNone: () => [],
          onSome: (prompt) => [element("qti-prompt", {}, prompt)],
        }),
        ...right
          .toReversed()
          .map((at) =>
            element("qti-simple-choice", { identifier: idOf(at) }, text(run(settings.text, at))),
          ),
      ),
      declarations: [
        declaration(response, "ordered", "identifier", correctResponse(right.map(idOf))),
      ],
      host: Option.none(),
      scoring: {
        kind: "scored",
        most: settings.choices,
        rules: right.map((at) =>
          credited(
            element(
              "qti-match",
              {},
              element(
                "qti-index",
                { n: at + 1 },
                element("qti-variable", { identifier: response }),
              ),
              element("qti-base-value", { "base-type": "identifier" }, idOf(at)),
            ),
            1,
          ),
        ),
      },
    };
  },
});
