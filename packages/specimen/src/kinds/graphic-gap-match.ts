/**
 * Graphic Gap Match (`qti-graphic-gap-match-interaction`): 2 to 5 areas drawn on a picture and a
 * bank of chips, words or small pictures, the child putting each chip on the area it names.
 *
 * @module
 */
import { Option } from "effect";
import type { Answered } from "#specimen/answer.ts";
import { directedPairValue, responding } from "#specimen/posted.ts";
import { mapped } from "#specimen/credit.ts";
import { counted, dimension } from "#specimen/dimension.ts";
import { kind } from "#specimen/kind.ts";
import {
  areasOf,
  pictureOf,
  areaAttributes,
  stageDimensions,
  stageOf,
} from "#specimen/kinds/graphic.ts";
import type { Stage } from "#specimen/kinds/graphic.ts";
import { image } from "#specimen/picture.ts";
import { correctResponse, declaration, mapping } from "#specimen/response.ts";
import { length, run, word } from "#specimen/words.ts";
import type { Length } from "#specimen/words.ts";
import { element, text } from "#specimen/xml.ts";

/**
 * The response's identifier.
 */
const response = "RESPONSE";

/**
 * How many pairs the child may make: one (`max-associations="1"`), as many as there are areas, or
 * any number (`max-associations="0"`).
 */
const pairs = dimension("Pairs", [
  ["one", "One", "one"],
  ["at-most", "One for each area", "at-most"],
  ["any", "Any number", "any"],
]);

/**
 * A Graphic Gap Match's settings.
 */
export interface GraphicGapMatchSettings {
  readonly areas: number;
  /**
   * What the chips show: words (`qti-gap-text`) of a length, or small pictures (`qti-gap-img`).
   */
  readonly chips: { readonly kind: "picture" } | { readonly kind: "text"; readonly length: Length };
  /**
   * Whether one chip more than the areas waits in the bank, a chip no area takes.
   */
  readonly extra: "extra" | "none";
  readonly pairs: (typeof pairs.values)[number]["value"];
  readonly stage: Stage;
}

/**
 * A chip's identifier.
 *
 * @param at Its place, from 0.
 * @returns `G1`, `G2`, …
 */
const chipOf = (at: number): string => `G${String(at + 1)}`;

/**
 * An area's identifier.
 *
 * @param at Its place, from 0.
 * @returns `A1`, `A2`, …
 */
const areaOf = (at: number): string => `A${String(at + 1)}`;

/**
 * The right pairs, each a chip and the area of the same place: one where the child makes one
 * pair, else one for every area.
 *
 * @param settings The settings.
 * @returns Each pair's identifiers, the chip first.
 */
const rightPairs = (settings: GraphicGapMatchSettings): readonly (readonly [string, string])[] =>
  Array.from({ length: settings.pairs === "one" ? 1 : settings.areas }, (_, at) => [
    chipOf(at),
    areaOf(at),
  ]);

/**
 * The response a set of pairs gives: a `multiple` of directed pairs.
 *
 * @param made The pairs, each its identifiers, the chip first.
 * @returns The response, none for no pair.
 */
const posted = (made: readonly (readonly [string, string])[]): Answered["posted"] =>
  responding(response, directedPairValue("multiple", made));

export const graphicGapMatch = kind("graphic-gap-match", {
  answers: (settings: GraphicGapMatchSettings) => {
    const rights = rightPairs(settings);
    const half = Math.floor(rights.length / 2);
    const partial: readonly Answered[] =
      half === 0 ? [] : [{ answer: "partial", posted: posted(rights.slice(0, half)), score: half }];

    return [
      { answer: "right", posted: posted(rights), score: rights.length },
      ...partial,
      { answer: "wrong", posted: posted([[chipOf(0), areaOf(1)]]), score: 0 },
      { answer: "empty", posted: {}, score: 0 },
    ];
  },
  dimensions: {
    ...stageDimensions,
    areas: counted("Areas", 2, 5),
    chips: dimension("Chips show", [
      ["text", "Words", "text"],
      ["picture", "Pictures", "picture"],
    ]),
    extra: dimension("A chip no area takes", [
      ["none", "None", "none"],
      ["extra", "One", "extra"],
    ]),
    pairs,
    text: length,
  },
  label: "Graphic Gap Match",
  settings:
    (pick) =>
    (source): GraphicGapMatchSettings => ({
      areas: source.draw(pick("areas")),
      chips:
        source.draw(pick("chips")) === "text"
          ? { kind: "text", length: source.draw(pick("text")) }
          : { kind: "picture" },
      extra: source.draw(pick("extra")),
      pairs: source.draw(pick("pairs")),
      stage: source.draw(stageOf(pick)),
    }),
  write: (settings: GraphicGapMatchSettings, context) => {
    const { stage } = settings;
    const areas = areasOf(stage, settings.areas);
    const rights = rightPairs(settings).map((pair) => pair.join(" "));
    const picture = pictureOf(
      stage,
      `A picture of ${String(settings.areas)} spots`,
      areas.map((area, at) => ({ area, name: word(at) })),
    );
    const chipAt = (at: number) => {
      switch (settings.chips.kind) {
        case "text": {
          return {
            files: [],
            markup: element("qti-gap-text", { identifier: chipOf(at), "match-max": 1 }, [
              text(run(settings.chips.length, at)),
            ]),
          };
        }
        case "picture": {
          const shown = image({ aspect: "wide", scale: "tiny" }, `Chip ${word(at)}`);

          return {
            files: [shown.file.asset],
            markup: element("qti-gap-img", { identifier: chipOf(at), "match-max": 1 }, [
              shown.markup,
            ]),
          };
        }
      }
    };
    const chips = Array.from(
      { length: settings.areas + (settings.extra === "extra" ? 1 : 0) },
      (_, at) => chipAt(at),
    );
    const most = { any: 0, "at-most": settings.areas, one: 1 }[settings.pairs];

    return {
      assets: [picture.asset, ...chips.flatMap((chip) => chip.files)],
      body: element(
        "qti-graphic-gap-match-interaction",
        { "max-associations": most, "response-identifier": response },
        [
          ...Option.match(context.prompt, {
            onNone: () => [],
            onSome: (prompt) => [element("qti-prompt", {}, [prompt])],
          }),
          picture.markup,
          ...chips.map((chip) => chip.markup),
          ...areas.map((area, at) =>
            element(
              "qti-associable-hotspot",
              {
                ...areaAttributes(stage, area),
                "hotspot-label": word(at),
                identifier: areaOf(at),
                "match-max": 1,
              },
              [],
            ),
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
