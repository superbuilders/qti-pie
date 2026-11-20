/**
 * Graphic Associate (`qti-graphic-associate-interaction`): 3 to 6 areas drawn on a picture, and a
 * default area for anywhere else, the child joining areas in pairs.
 *
 * @module
 */
import { Option } from "effect";
import type { Answered } from "#specimen/answer.ts";
import { mapped } from "#specimen/credit.ts";
import { counted, dimension } from "#specimen/dimension.ts";
import { kind } from "#specimen/kind.ts";
import { maxAssociations, pairs, reach, rightPairs } from "#specimen/kinds/associations.ts";
import type { Pair, Pairs, Reach } from "#specimen/kinds/associations.ts";
import {
  areasOf,
  pictureOf,
  restAttributes,
  areaAttributes,
  stageDimensions,
  stageOf,
} from "#specimen/kinds/graphic.ts";
import type { Stage } from "#specimen/kinds/graphic.ts";
import { correctResponse, declaration, mapping } from "#specimen/response.ts";
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
 * A Graphic Associate's settings.
 */
export interface GraphicAssociateSettings {
  readonly areas: number;
  readonly pairs: Pairs;
  readonly reach: Reach;
  /**
   * Whether a default area, anywhere else on the picture, stands among the drawn ones: QTI lets a
   * Graphic Associate's stand anywhere, so it stands in the middle.
   */
  readonly rest: "none" | "rest";
  readonly stage: Stage;
}

/**
 * A drawn area's identifier.
 *
 * @param at Its place, from 0.
 * @returns `H1`, `H2`, …
 */
const idOf = (at: number): string => `H${String(at + 1)}`;

/**
 * A pair in its lexical form: its two areas' identifiers.
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

export const graphicAssociate = kind("graphic-associate", {
  answers: (settings: GraphicAssociateSettings) => {
    const rights = rightPairs(settings.areas, settings.pairs, settings.reach);
    const half = Math.floor(rights.length / 2);
    const partial: readonly Answered[] =
      half === 0 ? [] : [{ answer: "partial", posted: posted(rights.slice(0, half)), score: half }];

    return [
      { answer: "right", posted: posted(rights), score: rights.length },
      ...partial,
      // The first area and the last are never a right pair: the pairs run along the picture.
      { answer: "wrong", posted: posted([[0, settings.areas - 1]]), score: 0 },
      { answer: "empty", posted: [], score: 0 },
    ];
  },
  dimensions: {
    ...stageDimensions,
    areas: counted("Areas", 3, 6),
    pairs,
    reach,
    rest: dimension("Default area", [
      ["none", "None", "none"],
      ["rest", "Anywhere else", "rest"],
    ]),
  },
  label: "Graphic Associate",
  settings:
    (pick) =>
    (source): GraphicAssociateSettings => ({
      areas: source.draw(pick("areas")),
      pairs: source.draw(pick("pairs")),
      reach: source.draw(pick("reach")),
      rest: source.draw(pick("rest")),
      stage: source.draw(stageOf(pick)),
    }),
  write: (settings: GraphicAssociateSettings, context) => {
    const { stage } = settings;
    const areas = areasOf(stage, settings.areas);
    const rights = rightPairs(settings.areas, settings.pairs, settings.reach);
    const picture = pictureOf(
      stage,
      `A picture of ${String(settings.areas)} towns`,
      areas.map((area, at) => ({ area, name: word(at) })),
    );
    const drawn = areas.map((area, at) =>
      element("qti-associable-hotspot", {
        ...areaAttributes(stage, area),
        "hotspot-label": word(at),
        identifier: idOf(at),
        "match-max": settings.reach,
      }),
    );
    const middle = Math.ceil(drawn.length / 2);

    return {
      assets: [picture.asset],
      body: element(
        "qti-graphic-associate-interaction",
        {
          "max-associations": maxAssociations(settings.pairs, rights.length),
          "response-identifier": response,
        },
        ...Option.match(context.prompt, {
          onNone: () => [],
          onSome: (prompt) => [element("qti-prompt", {}, prompt)],
        }),
        picture.markup,
        ...drawn.slice(0, middle),
        ...(settings.rest === "rest"
          ? [
              element("qti-associable-hotspot", {
                ...restAttributes(stage),
                "hotspot-label": rest.name,
                identifier: rest.identifier,
                "match-max": 0,
              }),
            ]
          : []),
        ...drawn.slice(middle),
      ),
      declarations: [
        declaration(
          response,
          settings.pairs === "one" ? "single" : "multiple",
          "pair",
          correctResponse(rights.map(pairText)),
          mapping(rights.map(pairText)),
        ),
      ],
      host: Option.none(),
      scoring: { kind: "scored", most: rights.length, rules: [mapped(response)] },
    };
  },
});
