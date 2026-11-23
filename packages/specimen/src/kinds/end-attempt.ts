/**
 * End Attempt (`qti-end-attempt-interaction`): a button in a sentence, which ends the attempt and
 * sets its response true.
 *
 * @module
 */
import { Option } from "effect";
import { credited, matchesCorrect } from "#specimen/credit.ts";
import { dimension } from "#specimen/dimension.ts";
import { kind } from "#specimen/kind.ts";
import { booleanValue, responding } from "#specimen/posted.ts";
import { correctResponse, declaration } from "#specimen/response.ts";
import { length } from "#specimen/words.ts";
import type { Length } from "#specimen/words.ts";
import { element } from "#specimen/xml.ts";

/**
 * The response's identifier.
 */
const response = "RESPONSE";

/**
 * The button's text, its `title`, by its length: a word, or a phrase that wraps.
 */
const titles = {
  long: "I have finished looking at every part of the picture",
  short: "Done",
} as const satisfies Record<Length, string>;

/**
 * An End Attempt's settings.
 */
interface EndAttemptSettings {
  /**
   * Whether ending the attempt with the button counts it, as QTI's default does, or leaves the
   * count of attempts as it was (`count-attempt="false"`).
   */
  readonly counts: boolean;
  readonly title: Length;
}

export const endAttempt = kind("end-attempt", {
  // The button's press ends the attempt with its response `true`; an attempt ended another way
  // holds it at its start, `false`. No press gives `false`, so there is no wrong response to give.
  answers: () => [
    { answer: "right", posted: responding(response, booleanValue(true)), score: 1 },
    { answer: "empty", posted: {}, score: 0 },
  ],
  dimensions: {
    counts: dimension("Counts the attempt", [
      ["yes", "Yes", true],
      ["no", 'count-attempt="false"', false],
    ]),
    title: length,
  },
  label: "End Attempt",
  settings:
    (pick) =>
    (source): EndAttemptSettings => ({
      counts: source.draw(pick("counts")),
      title: source.draw(pick("title")),
    }),
  write: (settings: EndAttemptSettings, context) => ({
    assets: [],
    body: [
      ...Option.toArray(context.prompt),
      element(
        "p",
        {},
        "When you are ready, press ",
        element("qti-end-attempt-interaction", {
          "count-attempt": settings.counts ? Option.none() : Option.some("false"),
          "response-identifier": response,
          title: titles[settings.title],
        }),
        ".",
      ),
    ].join(""),
    declarations: [declaration(response, "single", "boolean", correctResponse(["true"]))],
    host: Option.none(),
    scoring: { kind: "scored", most: 1, rules: [credited(matchesCorrect(response), 1)] },
  }),
});
