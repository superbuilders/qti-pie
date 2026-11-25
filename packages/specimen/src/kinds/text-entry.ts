/**
 * Text Entry (`qti-text-entry-interaction`): 1 to 4 blanks, one in each sentence of a short
 * passage, each with the expected length its author wrote.
 *
 * @module
 */
import { Option } from "effect";
import type { Answered } from "#specimen/answer.ts";
import { stringValue } from "#specimen/posted.ts";
import { mapped } from "#specimen/credit.ts";
import { counted, dimension } from "#specimen/dimension.ts";
import { kind } from "#specimen/kind.ts";
import { correctResponse, declaration } from "#specimen/response.ts";
import { word } from "#specimen/words.ts";
import { element, text } from "#specimen/xml.ts";

/**
 * The `expected-length` an author writes: a word, a phrase, or a sentence.
 */
const expected = dimension("Expected length", [
  ["4", "4 characters", 4],
  ["12", "12 characters", 12],
  ["40", "40 characters", 40],
]);

/**
 * A Text Entry's settings: how many blanks, and the length each expects.
 */
interface TextEntrySettings {
  readonly blanks: number;
  readonly expected: (typeof expected.values)[number]["value"];
}

/**
 * A blank's response identifier.
 *
 * @param at Its place, from 0.
 * @returns `RESPONSE_1`, `RESPONSE_2`, …
 */
const responseOf = (at: number): string => `RESPONSE_${String(at + 1)}`;

/**
 * What a blank's right text is: a word, one for each blank.
 *
 * @param blank The blank's place.
 * @returns The word.
 */
const rightOf = (blank: number): string => word(blank);

/**
 * What the blanks give when the first `rightBlanks` hold their word and the rest a wrong word or
 * nothing: each blank that holds one, its response a `single` string.
 *
 * @param blanks How many blanks there are.
 * @param rightBlanks How many, from the first, hold their word.
 * @param rest What the others hold.
 * @returns The responses, none for a blank left empty.
 */
const posted = (blanks: number, rightBlanks: number, rest: "none" | "wrong"): Answered["posted"] =>
  Object.fromEntries(
    Array.from({ length: blanks }, (_, blank) => blank).flatMap((blank) => {
      if (blank < rightBlanks) {
        return [[responseOf(blank), stringValue("single", [rightOf(blank)])] as const];
      }

      return rest === "wrong"
        ? [[responseOf(blank), stringValue("single", [word(blank + blanks)])] as const]
        : [];
    }),
  );

/**
 * Text Entry, as the record of kinds holds it.
 */
export const textEntry = kind("text-entry", {
  answers: (settings: TextEntrySettings) => {
    const half = Math.floor(settings.blanks / 2);
    const partial: readonly Answered[] =
      half === 0
        ? []
        : [{ answer: "partial", posted: posted(settings.blanks, half, "none"), score: half }];

    return [
      {
        answer: "right",
        posted: posted(settings.blanks, settings.blanks, "none"),
        score: settings.blanks,
      },
      ...partial,
      { answer: "wrong", posted: posted(settings.blanks, 0, "wrong"), score: 0 },
      { answer: "empty", posted: {}, score: 0 },
    ];
  },
  dimensions: { blanks: counted("Blanks", 1, 4), expected },
  label: "Text Entry",
  settings:
    (pick) =>
    (source): TextEntrySettings => ({
      blanks: source.draw(pick("blanks")),
      expected: source.draw(pick("expected")),
    }),
  write: (settings: TextEntrySettings, context) => {
    const blanks = Array.from({ length: settings.blanks }, (_, blank) => blank);

    return {
      assets: [],
      body: [
        ...Option.toArray(context.prompt),
        ...blanks.map((blank) =>
          element("p", {}, [
            text(`Write the word ${rightOf(blank)} here: `),
            element(
              "qti-text-entry-interaction",
              {
                "expected-length": settings.expected,
                "response-identifier": responseOf(blank),
              },
              [],
            ),
            text("."),
          ]),
        ),
      ].join(""),
      declarations: blanks.map((blank) =>
        declaration(responseOf(blank), "single", "string", [
          correctResponse([rightOf(blank)]),
          element("qti-mapping", { "default-value": 0, "lower-bound": 0 }, [
            element(
              "qti-map-entry",
              {
                "case-sensitive": "false",
                "map-key": rightOf(blank),
                "mapped-value": 1,
              },
              [],
            ),
          ]),
        ]),
      ),
      host: Option.none(),
      scoring: {
        kind: "scored",
        most: settings.blanks,
        rules: blanks.map((blank) => mapped(responseOf(blank))),
      },
    };
  },
});
