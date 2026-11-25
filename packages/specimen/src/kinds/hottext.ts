/**
 * Hottext (`qti-hottext-interaction`): 2 to 6 runs of text in a passage, the child picking one or
 * several of them.
 *
 * @module
 */
import { Option } from "effect";
import type { Answered } from "#specimen/answer.ts";
import { identifierValue, responding } from "#specimen/posted.ts";
import { mapped } from "#specimen/credit.ts";
import { counted, dimension } from "#specimen/dimension.ts";
import { kind } from "#specimen/kind.ts";
import { cardinalityOf, maxChoices, picks, right, rightCount } from "#specimen/picks.ts";
import type { Picks } from "#specimen/picks.ts";
import { correctResponse, declaration, mapping } from "#specimen/response.ts";
import { length, run } from "#specimen/words.ts";
import type { Length } from "#specimen/words.ts";
import { element, text } from "#specimen/xml.ts";

/**
 * The response's identifier.
 */
const response = "RESPONSE";

/**
 * The author's class: none; `qti-input-control-hidden`, which hides each run's check box or radio
 * button; or `qti-unselected-hidden`, which hides the runs not picked once the picks are full.
 */
const look = dimension("Class", [
  ["plain", "None", "plain"],
  ["input-control-hidden", "qti-input-control-hidden", "input-control-hidden"],
  ["unselected-hidden", "qti-unselected-hidden", "unselected-hidden"],
]);

/**
 * The class each look but the plain one writes.
 */
const classOf = {
  "input-control-hidden": "qti-input-control-hidden",
  "unselected-hidden": "qti-unselected-hidden",
} as const;

/**
 * A Hottext's settings.
 */
export interface HottextSettings {
  readonly hottexts: number;
  /**
   * `min-choices`: unwritten, or 1.
   */
  readonly least: "none" | "one";
  readonly length: Length;
  readonly look: (typeof look.values)[number]["value"];
  /**
   * The limit messages the author writes, `data-min-selections-message` and
   * `data-max-selections-message`: none for a single pick, which has no limit to break.
   */
  readonly messages: "none" | "written";
  /**
   * Whether every other run stands inside an `em`, so the runs sit at two depths.
   */
  readonly nesting: "em" | "flat";
  /**
   * How the passage holds the runs: one sentence, or a paragraph each.
   */
  readonly passage: "paragraphs" | "sentence";
  readonly picks: Picks;
}

/**
 * The places of the right runs: as many as the picks make right, from the second, wrapping.
 *
 * @param settings The settings.
 * @returns The places.
 */
const rightPlaces = (settings: HottextSettings): readonly number[] =>
  Array.from(
    { length: rightCount(settings.picks, settings.hottexts) },
    (_, at) => (at + 1) % settings.hottexts,
  );

/**
 * A run's identifier.
 *
 * @param at Its place, from 0.
 * @returns `T1`, `T2`, …
 */
const idOf = (at: number): string => `T${String(at + 1)}`;

/**
 * The response a set of picks gives: the picked runs' identifiers, in the cardinality the picks
 * bind.
 *
 * @param settings The settings.
 * @param places The picked runs' places.
 * @returns The response, none for no pick.
 */
const posted = (settings: HottextSettings, places: readonly number[]): Answered["posted"] =>
  responding(response, identifierValue(cardinalityOf(settings.picks), places.map(idOf)));

/**
 * A run as the passage holds it: its `qti-hottext`, inside an `em` at every other place when the
 * runs nest.
 *
 * @param settings The settings.
 * @param at The run's place, from 0.
 * @returns Its markup.
 */
const hottextAt = (settings: HottextSettings, at: number): string => {
  const hottext = element("qti-hottext", { identifier: idOf(at) }, [
    text(run(settings.length, at)),
  ]);

  return settings.nesting === "em" && at % 2 === 1 ? element("em", {}, [hottext]) : hottext;
};

/**
 * The passage: the runs in one sentence, each after a comma and the last after "and", or each in
 * a sentence of its own paragraph.
 *
 * @param settings The settings.
 * @returns The passage's paragraphs.
 */
const passageOf = (settings: HottextSettings): readonly string[] => {
  const runs = Array.from({ length: settings.hottexts }, (_, at) => hottextAt(settings, at));

  switch (settings.passage) {
    case "sentence": {
      const listed = runs
        .map((markup, at) =>
          at === 0 ? markup : `${at === runs.length - 1 ? " and " : ", "}${markup}`,
        )
        .join("");

      return [element("p", {}, [`On the walk we saw ${listed}.`])];
    }
    case "paragraphs": {
      return runs.map((markup, at) =>
        element("p", {}, [`${at === 0 ? "First" : "Then"} we saw ${markup}.`]),
      );
    }
  }
};

export const hottext = kind("hottext", {
  answers: (settings: HottextSettings) => {
    const rights = rightPlaces(settings);
    const wrongs = Array.from({ length: settings.hottexts }, (_, at) => at).filter(
      (at) => !rights.includes(at),
    );
    const half = Math.floor(rights.length / 2);
    const partial: readonly Answered[] =
      half === 0
        ? []
        : [{ answer: "partial", posted: posted(settings, rights.slice(0, half)), score: half }];

    return [
      { answer: "right", posted: posted(settings, rights), score: rights.length },
      ...partial,
      { answer: "wrong", posted: posted(settings, wrongs.slice(0, rights.length)), score: 0 },
      { answer: "empty", posted: {}, score: 0 },
    ];
  },
  dimensions: {
    hottexts: counted("Runs to pick", 2, 6),
    least: dimension("min-choices", [
      ["none", "Unwritten", "none"],
      ["one", "1", "one"],
    ]),
    look,
    messages: dimension("Limit messages", [
      ["none", "None", "none"],
      ["written", "Written", "written"],
    ]),
    nesting: dimension("Depth", [
      ["flat", "In the paragraph", "flat"],
      ["em", "Every other one in an em", "em"],
    ]),
    passage: dimension("Passage", [
      ["sentence", "One sentence", "sentence"],
      ["paragraphs", "A paragraph each", "paragraphs"],
    ]),
    picks,
    right,
    text: length,
  },
  label: "Hottext",
  settings:
    (pick) =>
    (source): HottextSettings => {
      const held = source.draw(pick("picks"));

      return {
        hottexts: source.draw(pick("hottexts")),
        least: source.draw(pick("least")),
        length: source.draw(pick("text")),
        look: source.draw(pick("look")),
        messages: held === "one" ? "none" : source.draw(pick("messages")),
        nesting: source.draw(pick("nesting")),
        passage: source.draw(pick("passage")),
        picks: held === "one" ? { kind: "one" } : { kind: held, right: source.draw(pick("right")) },
      };
    },
  write: (settings: HottextSettings, context) => {
    const rights = rightPlaces(settings).map(idOf);
    const most = maxChoices(settings.picks, settings.hottexts);
    const messages = settings.messages === "written";

    return {
      assets: [],
      body: element(
        "qti-hottext-interaction",
        {
          class: settings.look === "plain" ? Option.none() : Option.some(classOf[settings.look]),
          "data-max-selections-message": messages
            ? Option.some(`Pick no more than ${String(most)}.`)
            : Option.none(),
          "data-min-selections-message": messages
            ? Option.some("Pick at least one.")
            : Option.none(),
          "max-choices": most,
          "min-choices": settings.least === "one" ? Option.some(1) : Option.none(),
          "response-identifier": response,
        },
        [
          ...Option.match(context.prompt, {
            onNone: () => [],
            onSome: (prompt) => [element("qti-prompt", {}, [prompt])],
          }),
          ...passageOf(settings),
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
