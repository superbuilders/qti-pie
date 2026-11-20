/**
 * Extended Text (`qti-extended-text-interaction`): one box for a written answer, or a list of
 * them, plain, preformatted or XHTML, as tall as the author asks.
 *
 * @module
 */
import { Array as Arr, Option } from "effect";
import type { Answered } from "#specimen/answer.ts";
import { credited, matchesCorrect } from "#specimen/credit.ts";
import { dimension } from "#specimen/dimension.ts";
import { kind } from "#specimen/kind.ts";
import type { Scoring } from "#specimen/kind.ts";
import { correctResponse, declaration } from "#specimen/response.ts";
import { length, run } from "#specimen/words.ts";
import type { Length } from "#specimen/words.ts";
import { element, text } from "#specimen/xml.ts";

/**
 * The response's identifier.
 */
const response = "RESPONSE";

/**
 * How many boxes the child writes in: one (a `single` string); or a list of three, `min-strings`
 * 1 and `max-strings` 3, its answers a set (`multiple`) or in order (`ordered`).
 */
const boxes = dimension("Boxes", [
  ["one", "One", "one"],
  ["set", "Three, any order", "set"],
  ["ordered", "Three, in order", "ordered"],
]);

/**
 * How tall each box is asked to be: as plate's default leaves it; `expected-lines`; the lines an
 * `expected-length` fills; or the class `qti-height-lines-6`.
 */
const height = dimension("Height", [
  ["unwritten", "Unwritten", "unwritten"],
  ["lines", "expected-lines 4", "lines"],
  ["length", "expected-length 200", "length"],
  ["class", "qti-height-lines-6", "class"],
]);

/**
 * An Extended Text's settings.
 */
interface ExtendedTextSettings {
  readonly boxes: (typeof boxes.values)[number]["value"];
  readonly format: "plain" | "preformatted" | "xhtml";
  readonly height: (typeof height.values)[number]["value"];
  /**
   * How long each right answer is: a word, or a phrase that wraps.
   */
  readonly length: Length;
  /**
   * Whether the box shows a `placeholder-text` until the child writes.
   */
  readonly placeholder: "none" | "written";
  /**
   * Whether the answer is scored against its correct response, or left to a person, with no
   * correct response and no rule.
   */
  readonly scoring: "scored" | "unscored";
}

/**
 * The cardinality each count of boxes binds.
 */
const cardinalities = {
  one: "single",
  ordered: "ordered",
  set: "multiple",
} as const satisfies Record<ExtendedTextSettings["boxes"], "multiple" | "ordered" | "single">;

/**
 * The most boxes a list takes, its `max-strings`.
 */
const listed = 3;

/**
 * The right answers: one, or two of a list's three boxes, each a run of text.
 *
 * @param settings The settings.
 * @returns The answers, in order.
 */
const rightAnswers = (settings: ExtendedTextSettings): readonly string[] =>
  Arr.makeBy(settings.boxes === "one" ? 1 : 2, (at) => run(settings.length, at));

/**
 * The response a set of written answers posts: one entry per box that holds one, as the island
 * posts the boxes that hold an answer, in their order.
 *
 * @param answers The answers.
 * @returns The entries.
 */
const posted = (answers: readonly string[]): Answered["posted"] =>
  answers.map((answer) => [response, answer] as const);

export const extendedText = kind("extended-text", {
  answers: (settings: ExtendedTextSettings) => {
    const rights = rightAnswers(settings);
    const worth = settings.scoring === "scored" ? 1 : 0;
    const partial: readonly Answered[] =
      rights.length < 2
        ? []
        : [{ answer: "partial", posted: posted(rights.slice(0, 1)), score: 0 }];

    return [
      { answer: "right", posted: posted(rights), score: worth },
      ...partial,
      { answer: "wrong", posted: posted([run(settings.length, rights.length)]), score: 0 },
      { answer: "empty", posted: [], score: 0 },
    ];
  },
  dimensions: {
    boxes,
    format: dimension("Format", [
      ["plain", "Plain", "plain"],
      ["preformatted", "Preformatted", "preformatted"],
      ["xhtml", "XHTML", "xhtml"],
    ]),
    height,
    placeholder: dimension("Placeholder", [
      ["none", "None", "none"],
      ["written", "Written", "written"],
    ]),
    scoring: dimension("Scored", [
      ["scored", "Against its correct response", "scored"],
      ["unscored", "By a person", "unscored"],
    ]),
    text: length,
  },
  label: "Extended Text",
  settings:
    (pick) =>
    (source): ExtendedTextSettings => ({
      boxes: source.draw(pick("boxes")),
      format: source.draw(pick("format")),
      height: source.draw(pick("height")),
      length: source.draw(pick("text")),
      placeholder: source.draw(pick("placeholder")),
      scoring: source.draw(pick("scoring")),
    }),
  write: (settings: ExtendedTextSettings, context) => {
    const rights = rightAnswers(settings);
    const scoring: Scoring =
      settings.scoring === "scored"
        ? { kind: "scored", most: 1, rules: [credited(matchesCorrect(response), 1)] }
        : { kind: "unscored" };

    return {
      assets: [],
      body: element(
        "qti-extended-text-interaction",
        {
          class: settings.height === "class" ? Option.some("qti-height-lines-6") : Option.none(),
          "expected-length": settings.height === "length" ? Option.some(200) : Option.none(),
          "expected-lines": settings.height === "lines" ? Option.some(4) : Option.none(),
          format: settings.format,
          "max-strings": settings.boxes === "one" ? Option.none() : Option.some(listed),
          "min-strings": settings.boxes === "one" ? Option.none() : Option.some(1),
          "placeholder-text":
            settings.placeholder === "written" ? Option.some("Write here") : Option.none(),
          "response-identifier": response,
        },
        ...Option.match(context.prompt, {
          onNone: () => [],
          onSome: (prompt) => [element("qti-prompt", {}, prompt)],
        }),
      ),
      declarations: [
        declaration(
          response,
          cardinalities[settings.boxes],
          "string",
          ...(settings.scoring === "scored" ? [correctResponse(rights.map(text))] : []),
        ),
      ],
      host: Option.none(),
      scoring,
    };
  },
});
