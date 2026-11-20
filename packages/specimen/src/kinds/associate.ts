/**
 * Associate (`qti-associate-interaction`): 3 to 6 chips of text, the child pairing them.
 *
 * @module
 */
import { Array as Arr, Option } from "effect";
import type { Answered } from "#specimen/answer.ts";
import { mapped } from "#specimen/credit.ts";
import { counted, dimension } from "#specimen/dimension.ts";
import { kind } from "#specimen/kind.ts";
import { maxAssociations, pairs, reach, rightPairs } from "#specimen/kinds/associations.ts";
import type { Pair, Pairs, Reach } from "#specimen/kinds/associations.ts";
import { correctResponse, declaration, mapping } from "#specimen/response.ts";
import { length, run } from "#specimen/words.ts";
import type { Length } from "#specimen/words.ts";
import { element, text } from "#specimen/xml.ts";

/**
 * The response's identifier.
 */
const response = "RESPONSE";

/**
 * An Associate's settings.
 */
export interface AssociateSettings {
  readonly choices: number;
  /**
   * `min-associations`: unwritten, or 1.
   */
  readonly least: "none" | "one";
  readonly length: Length;
  readonly pairs: Pairs;
  readonly reach: Reach;
  /**
   * The order the chips are shown in: as written; shuffled (`shuffle="true"`); or shuffled with
   * the first chip `fixed` in its place.
   */
  readonly shuffle: "fixed" | "none" | "shuffled";
}

/**
 * A chip's identifier.
 *
 * @param at Its place, from 0.
 * @returns `A1`, `A2`, …
 */
const idOf = (at: number): string => `A${String(at + 1)}`;

/**
 * A pair in its lexical form: its two chips' identifiers.
 *
 * @param pair The two places.
 * @returns The pair's text.
 */
const pairText = (pair: Pair): string => `${idOf(pair[0])} ${idOf(pair[1])}`;

/**
 * The response a set of pairs posts.
 *
 * @param made The pairs.
 * @returns One entry per pair.
 */
const posted = (made: readonly Pair[]): Answered["posted"] =>
  made.map((pair) => [response, pairText(pair)] as const);

export const associate = kind("associate", {
  answers: (settings: AssociateSettings) => {
    const rights = rightPairs(settings.choices, settings.pairs, settings.reach);
    const half = Math.floor(rights.length / 2);
    const partial: readonly Answered[] =
      half === 0 ? [] : [{ answer: "partial", posted: posted(rights.slice(0, half)), score: half }];

    return [
      { answer: "right", posted: posted(rights), score: rights.length },
      ...partial,
      { answer: "wrong", posted: posted([[0, settings.choices - 1]]), score: 0 },
      { answer: "empty", posted: [], score: 0 },
    ];
  },
  dimensions: {
    choices: counted("Chips", 3, 6),
    least: dimension("min-associations", [
      ["none", "Unwritten", "none"],
      ["one", "1", "one"],
    ]),
    pairs,
    reach,
    shuffle: dimension("Order", [
      ["none", "As written", "none"],
      ["shuffled", "Shuffled", "shuffled"],
      ["fixed", "Shuffled, the first fixed", "fixed"],
    ]),
    text: length,
  },
  label: "Associate",
  settings:
    (pick) =>
    (source): AssociateSettings => ({
      choices: source.draw(pick("choices")),
      least: source.draw(pick("least")),
      length: source.draw(pick("text")),
      pairs: source.draw(pick("pairs")),
      reach: source.draw(pick("reach")),
      shuffle: source.draw(pick("shuffle")),
    }),
  write: (settings: AssociateSettings, context) => {
    const rights = rightPairs(settings.choices, settings.pairs, settings.reach).map(pairText);

    return {
      assets: [],
      body: element(
        "qti-associate-interaction",
        {
          "max-associations": maxAssociations(settings.pairs, rights.length),
          "min-associations": settings.least === "one" ? Option.some(1) : Option.none(),
          "response-identifier": response,
          shuffle: settings.shuffle === "none" ? Option.none() : Option.some("true"),
        },
        ...Option.match(context.prompt, {
          onNone: () => [],
          onSome: (prompt) => [element("qti-prompt", {}, prompt)],
        }),
        ...Arr.makeBy(settings.choices, (at) =>
          element(
            "qti-simple-associable-choice",
            {
              fixed: settings.shuffle === "fixed" && at === 0 ? Option.some("true") : Option.none(),
              identifier: idOf(at),
              "match-max": settings.reach,
            },
            text(run(settings.length, at)),
          ),
        ),
      ),
      declarations: [
        declaration(
          response,
          settings.pairs === "one" ? "single" : "multiple",
          "pair",
          correctResponse(rights),
          mapping(rights),
        ),
      ],
      host: Option.none(),
      scoring: { kind: "scored", most: rights.length, rules: [mapped(response)] },
    };
  },
});
