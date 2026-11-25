/**
 * Choice (`qti-choice-interaction`): 2 to 8 options of text or pictures, one pick or several, in
 * a column or a row, with QTI's stacking and label classes.
 *
 * @module
 */
import { Array as Arr, Option } from "effect";
import type { Answered } from "#specimen/answer.ts";
import { identifierValue, responding } from "#specimen/posted.ts";
import { mapped } from "#specimen/credit.ts";
import { counted, dimension } from "#specimen/dimension.ts";
import { kind } from "#specimen/kind.ts";
import { cardinalityOf, maxChoices, picks, right, rightCount } from "#specimen/picks.ts";
import type { Picks } from "#specimen/picks.ts";
import { aspect, image, scale } from "#specimen/picture.ts";
import type { Picture } from "#specimen/picture.ts";
import { correctResponse, declaration, mapping } from "#specimen/response.ts";
import { length, run } from "#specimen/words.ts";
import type { Length } from "#specimen/words.ts";
import { element, text } from "#specimen/xml.ts";

/**
 * The response's identifier.
 */
const response = "RESPONSE";

/**
 * QTI's `qti-choices-stacking-N` classes, which lay the options out in N columns, or none.
 */
const stacking = dimension("Stacking class", [
  ["none", "None", "none"],
  ["1", "qti-choices-stacking-1", 1],
  ["2", "qti-choices-stacking-2", 2],
  ["3", "qti-choices-stacking-3", 3],
  ["4", "qti-choices-stacking-4", 4],
  ["5", "qti-choices-stacking-5", 5],
]);

/**
 * A Choice's settings.
 */
interface ChoiceSettings {
  readonly content:
    | { readonly kind: "picture"; readonly picture: Picture }
    | { readonly kind: "text"; readonly length: Length };
  readonly labels: "default" | "none";
  readonly options: number;
  readonly orientation: "horizontal" | "vertical";
  readonly picks: Picks;
  readonly stacking: (typeof stacking.values)[number]["value"];
}

/**
 * The places of the right options: `count` of them from the second, wrapping, so the right one is
 * never always the first.
 *
 * @param settings The settings.
 * @returns The places, ascending from the second.
 */
const rightPlaces = (settings: ChoiceSettings): readonly number[] =>
  Arr.makeBy(rightCount(settings.picks, settings.options), (at) => (at + 1) % settings.options);

/**
 * An option's identifier.
 *
 * @param at Its place, from 0.
 * @returns `C1`, `C2`, …
 */
const idOf = (at: number): string => `C${String(at + 1)}`;

/**
 * The response a set of picks gives: the picked options' identifiers, in the cardinality the picks
 * bind.
 *
 * @param settings The settings.
 * @param places The picked options' places.
 * @returns The response, none for no pick.
 */
const posted = (settings: ChoiceSettings, places: readonly number[]): Answered["posted"] =>
  responding(response, identifierValue(cardinalityOf(settings.picks), places.map(idOf)));

/**
 * Choice, as the record of kinds holds it.
 */
export const choice = kind("choice", {
  answers: (settings: ChoiceSettings) => {
    const rights = rightPlaces(settings);
    const wrongs = Arr.makeBy(settings.options, (at) => at).filter((at) => !rights.includes(at));
    const half = Math.floor(rights.length / 2);
    const partial: readonly Answered[] =
      half === 0
        ? []
        : [{ answer: "partial", posted: posted(settings, rights.slice(0, half)), score: half }];

    return [
      { answer: "right", posted: posted(settings, rights), score: rights.length },
      ...partial,
      {
        answer: "wrong",
        posted: posted(settings, wrongs.slice(0, Math.min(rights.length, wrongs.length))),
        score: 0,
      },
      { answer: "empty", posted: {}, score: 0 },
    ];
  },
  dimensions: {
    content: dimension("Options show", [
      ["text", "Text", "text"],
      ["picture", "Pictures", "picture"],
    ]),
    labels: dimension("Label class", [
      ["default", "None written", "default"],
      ["none", "qti-labels-none", "none"],
    ]),
    options: counted("Options", 2, 8),
    orientation: dimension("Orientation", [
      ["vertical", "Vertical", "vertical"],
      ["horizontal", "Horizontal", "horizontal"],
    ]),
    picks,
    "picture-aspect": aspect,
    "picture-scale": scale,
    right,
    stacking,
    text: length,
  },
  label: "Choice",
  settings:
    (pick) =>
    (source): ChoiceSettings => {
      const held = source.draw(pick("picks"));

      return {
        content:
          source.draw(pick("content")) === "text"
            ? { kind: "text", length: source.draw(pick("text")) }
            : {
                kind: "picture",
                picture: {
                  aspect: source.draw(pick("picture-aspect")),
                  scale: source.draw(pick("picture-scale")),
                },
              },
        labels: source.draw(pick("labels")),
        options: source.draw(pick("options")),
        orientation: source.draw(pick("orientation")),
        picks: held === "one" ? { kind: "one" } : { kind: held, right: source.draw(pick("right")) },
        stacking: source.draw(pick("stacking")),
      };
    },
  write: (settings: ChoiceSettings, context) => {
    const rights = rightPlaces(settings).map(idOf);
    const options = Arr.makeBy(settings.options, (at) => {
      switch (settings.content.kind) {
        case "text": {
          return { files: [], markup: text(run(settings.content.length, at)) };
        }
        case "picture": {
          const shown = image(settings.content.picture, `Option ${String(at + 1)}`);

          return { files: [shown.file.asset], markup: shown.markup };
        }
      }
    });
    const classes = [
      ...(settings.stacking === "none"
        ? []
        : [`qti-choices-stacking-${String(settings.stacking)}`]),
      ...(settings.labels === "none" ? ["qti-labels-none"] : []),
    ];

    return {
      assets: options.flatMap((option) => option.files),
      body: element(
        "qti-choice-interaction",
        {
          class: classes.length === 0 ? Option.none() : Option.some(classes.join(" ")),
          "max-choices": maxChoices(settings.picks, settings.options),
          orientation: settings.orientation,
          "response-identifier": response,
        },
        [
          ...Option.match(context.prompt, {
            onNone: () => [],
            onSome: (prompt) => [element("qti-prompt", {}, [prompt])],
          }),
          ...options.map((option, at) =>
            element("qti-simple-choice", { identifier: idOf(at) }, [option.markup]),
          ),
        ],
      ),
      declarations: [
        declaration(response, cardinalityOf(settings.picks), "identifier", [
          correctResponse(rights),
          mapping(rights),
        ]),
      ],
      host: Option.none(),
      scoring: { kind: "scored", most: rights.length, rules: [mapped(response)] },
    };
  },
});
