/**
 * Gap Match (`qti-gap-match-interaction`): 2 to 5 texts or pictures to drag into fewer, as many or
 * more gaps in a passage, each used once or any number of times.
 *
 * @module
 */
import { Array as Arr, Option } from "effect";
import type { Answered } from "#specimen/answer.ts";
import { directedPairValue, responding } from "#specimen/posted.ts";
import { mapped } from "#specimen/credit.ts";
import { counted, dimension } from "#specimen/dimension.ts";
import { kind } from "#specimen/kind.ts";
import { aspect, image, scale } from "#specimen/picture.ts";
import type { Picture } from "#specimen/picture.ts";
import { correctResponse, declaration, mapping } from "#specimen/response.ts";
import { length, run, word } from "#specimen/words.ts";
import type { Length } from "#specimen/words.ts";
import { element, text } from "#specimen/xml.ts";

/**
 * The response's identifier.
 */
const response = "RESPONSE";

/**
 * How many gaps there are beside the choices: one fewer, as many, or one more.
 */
const gaps = dimension("Gaps", [
  ["equal", "As many as choices", "equal"],
  ["fewer", "One fewer than choices", "fewer"],
  ["more", "One more than choices", "more"],
]);

/**
 * How often a choice may be used: once (`match-max="1"`), or any number of times (`0`).
 */
const reuse = dimension("Each choice fills", [
  ["once", "One gap", "once"],
  ["any", "Any number of gaps", "any"],
]);

/**
 * A Gap Match's settings.
 */
interface GapMatchSettings {
  readonly choices: number;
  readonly content:
    | { readonly kind: "picture"; readonly picture: Picture }
    | { readonly kind: "text"; readonly length: Length };
  readonly gaps: (typeof gaps.values)[number]["value"];
  readonly reuse: (typeof reuse.values)[number]["value"];
}

/**
 * How many gaps the passage holds.
 *
 * @param settings The settings.
 * @returns The count, at least 1.
 */
const gapCount = (settings: GapMatchSettings): number => {
  switch (settings.gaps) {
    case "equal": {
      return settings.choices;
    }
    case "fewer": {
      return settings.choices - 1;
    }
    case "more": {
      return settings.choices + 1;
    }
  }
};

/**
 * A choice's identifier.
 *
 * @param at Its place, from 0.
 * @returns `W1`, `W2`, …
 */
const choiceOf = (at: number): string => `W${String(at + 1)}`;

/**
 * A gap's identifier.
 *
 * @param at Its place, from 0.
 * @returns `G1`, `G2`, …
 */
const gapOf = (at: number): string => `G${String(at + 1)}`;

/**
 * The right pairs, as choice and gap places: every gap filled by the choice at its place, wrapping,
 * when a choice fills any number; else each choice fills the gap at its place, and a gap past the
 * last choice stays empty.
 *
 * @param settings The settings.
 * @returns The pairs, by gap.
 */
const rightPairs = (settings: GapMatchSettings): readonly (readonly [number, number])[] => {
  const holes = gapCount(settings);

  return Arr.makeBy(
    settings.reuse === "any" ? holes : Math.min(holes, settings.choices),
    (gap) => [gap % settings.choices, gap] as const,
  );
};

/**
 * A pair's identifiers, the choice first.
 *
 * @param pair The choice's and the gap's places.
 * @returns `W<n>` and `G<m>`.
 */
const identifiersOf = ([choice, gap]: readonly [number, number]): readonly [string, string] => [
  choiceOf(choice),
  gapOf(gap),
];

/**
 * A pair in its lexical form, the choice first.
 *
 * @param pair The choice's and the gap's places.
 * @returns `W<n> G<m>`.
 */
const lexical = (pair: readonly [number, number]): string => identifiersOf(pair).join(" ");

/**
 * The response a set of pairs gives: a `multiple` of directed pairs.
 *
 * @param made The pairs.
 * @returns The response, none for no pair.
 */
const posted = (made: readonly (readonly [number, number])[]): Answered["posted"] =>
  responding(response, directedPairValue("multiple", made.map(identifiersOf)));

/**
 * Gap Match, as the record of kinds holds it.
 */
export const gapMatch = kind("gap-match", {
  answers: (settings: GapMatchSettings) => {
    const rights = rightPairs(settings);
    const half = Math.floor(rights.length / 2);
    const partial: readonly Answered[] =
      half === 0 ? [] : [{ answer: "partial", posted: posted(rights.slice(0, half)), score: half }];

    return [
      { answer: "right", posted: posted(rights), score: rights.length },
      ...partial,
      {
        answer: "wrong",
        posted: posted(
          rights.map(([choice, gap]) => [(choice + 1) % settings.choices, gap] as const),
        ),
        score: 0,
      },
      { answer: "empty", posted: {}, score: 0 },
    ];
  },
  dimensions: {
    choices: counted("Choices", 2, 5),
    content: dimension("Choices show", [
      ["text", "Text", "text"],
      ["picture", "Pictures", "picture"],
    ]),
    gaps,
    "picture-aspect": aspect,
    "picture-scale": scale,
    reuse,
    text: length,
  },
  label: "Gap Match",
  settings:
    (pick) =>
    (source): GapMatchSettings => ({
      choices: source.draw(pick("choices")),
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
      gaps: source.draw(pick("gaps")),
      reuse: source.draw(pick("reuse")),
    }),
  write: (settings: GapMatchSettings, context) => {
    const rights = rightPairs(settings).map(lexical);
    const matchMax = settings.reuse === "once" ? 1 : 0;
    const choices = Arr.makeBy(settings.choices, (at) => {
      switch (settings.content.kind) {
        case "text": {
          return {
            files: [],
            markup: element("qti-gap-text", { identifier: choiceOf(at), "match-max": matchMax }, [
              text(run(settings.content.length, at)),
            ]),
          };
        }
        case "picture": {
          const shown = image(settings.content.picture, `Choice ${String(at + 1)}`);

          return {
            files: [shown.file.asset],
            markup: element("qti-gap-img", { identifier: choiceOf(at), "match-max": matchMax }, [
              shown.markup,
            ]),
          };
        }
      }
    });

    return {
      assets: choices.flatMap((choice) => choice.files),
      body: element(
        "qti-gap-match-interaction",
        { "max-associations": 0, "response-identifier": response },
        [
          ...Option.match(context.prompt, {
            onNone: () => [],
            onSome: (prompt) => [element("qti-prompt", {}, [prompt])],
          }),
          ...choices.map((choice) => choice.markup),
          ...Arr.makeBy(gapCount(settings), (gap) =>
            element("p", {}, [
              text(`The ${word(gap)} went to `),
              element("qti-gap", { identifier: gapOf(gap) }, []),
              text(" in the morning."),
            ]),
          ),
        ],
      ),
      declarations: [
        declaration(response, "multiple", "directedPair", [
          correctResponse(rights),
          mapping(rights),
        ]),
      ],
      host: Option.none(),
      scoring: { kind: "scored", most: rights.length, rules: [mapped(response)] },
    };
  },
});
