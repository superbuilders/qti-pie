/**
 * Hotspot (`qti-hotspot-interaction`): 2 to 6 areas drawn on a picture, and a default area for
 * anywhere else, the child picking one area or several.
 *
 * @module
 */
import { Array as Arr, Option } from "effect";
import type { Answered } from "#specimen/answer.ts";
import { mapped } from "#specimen/credit.ts";
import { counted, dimension } from "#specimen/dimension.ts";
import { kind } from "#specimen/kind.ts";
import {
  areasOf,
  pictureOf,
  restAttributes,
  areaAttributes,
  stageDimensions,
  stageOf,
} from "#specimen/kinds/graphic.ts";
import type { Stage } from "#specimen/kinds/graphic.ts";
import { cardinalityOf, maxChoices, picks, right, rightCount } from "#specimen/picks.ts";
import type { Picks } from "#specimen/picks.ts";
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
 * A Hotspot's settings.
 */
export interface HotspotSettings {
  readonly areas: number;
  /**
   * `min-choices`: unwritten, or 1.
   */
  readonly least: "none" | "one";
  /**
   * The author's class: none, or `qti-unselected-hidden`, which hides the areas not picked.
   */
  readonly look: "plain" | "unselected-hidden";
  /**
   * The limit messages the author writes, `data-min-selections-message` and
   * `data-max-selections-message`: none for a single pick, which has no limit to break.
   */
  readonly messages: "none" | "written";
  readonly picks: Picks;
  /**
   * Whether a default area, anywhere else on the picture, follows the drawn ones.
   */
  readonly rest: "none" | "rest";
  readonly stage: Stage;
}

/**
 * The places of the right areas: as many as the picks make right, from the second, wrapping, so
 * the right one is never always the first.
 *
 * @param settings The settings.
 * @returns The places.
 */
const rightPlaces = (settings: HotspotSettings): readonly number[] =>
  Arr.makeBy(rightCount(settings.picks, settings.areas), (at) => (at + 1) % settings.areas);

/**
 * A drawn area's identifier.
 *
 * @param at Its place, from 0.
 * @returns `H1`, `H2`, …
 */
const idOf = (at: number): string => `H${String(at + 1)}`;

/**
 * The response a set of picks posts.
 *
 * @param identifiers The picked areas' identifiers.
 * @returns One entry per pick.
 */
const posted = (identifiers: readonly string[]): Answered["posted"] =>
  identifiers.map((identifier) => [response, identifier] as const);

export const hotspot = kind("hotspot", {
  answers: (settings: HotspotSettings) => {
    const rights = rightPlaces(settings).map(idOf);
    const wrongs = [
      ...Arr.makeBy(settings.areas, idOf).filter((identifier) => !rights.includes(identifier)),
      ...(settings.rest === "rest" ? [rest.identifier] : []),
    ];
    const half = Math.floor(rights.length / 2);
    const partial: readonly Answered[] =
      half === 0 ? [] : [{ answer: "partial", posted: posted(rights.slice(0, half)), score: half }];

    return [
      { answer: "right", posted: posted(rights), score: rights.length },
      ...partial,
      { answer: "wrong", posted: posted(wrongs.slice(0, rights.length)), score: 0 },
      { answer: "empty", posted: [], score: 0 },
    ];
  },
  dimensions: {
    ...stageDimensions,
    areas: counted("Areas", 2, 6),
    least: dimension("min-choices", [
      ["none", "Unwritten", "none"],
      ["one", "1", "one"],
    ]),
    look: dimension("Class", [
      ["plain", "None", "plain"],
      ["unselected-hidden", "qti-unselected-hidden", "unselected-hidden"],
    ]),
    messages: dimension("Limit messages", [
      ["none", "None", "none"],
      ["written", "Written", "written"],
    ]),
    picks,
    rest: dimension("Default area", [
      ["none", "None", "none"],
      ["rest", "Anywhere else", "rest"],
    ]),
    right,
  },
  label: "Hotspot",
  settings:
    (pick) =>
    (source): HotspotSettings => {
      const held = source.draw(pick("picks"));

      return {
        areas: source.draw(pick("areas")),
        least: source.draw(pick("least")),
        look: source.draw(pick("look")),
        messages: held === "one" ? "none" : source.draw(pick("messages")),
        picks: held === "one" ? { kind: "one" } : { kind: held, right: source.draw(pick("right")) },
        rest: source.draw(pick("rest")),
        stage: source.draw(stageOf(pick)),
      };
    },
  write: (settings: HotspotSettings, context) => {
    const { stage } = settings;
    const areas = areasOf(stage, settings.areas);
    const rights = rightPlaces(settings).map(idOf);
    const most = maxChoices(settings.picks, settings.areas);
    const messages = settings.messages === "written";
    const picture = pictureOf(
      stage,
      `A picture of ${String(settings.areas)} places`,
      areas.map((area, at) => ({ area, name: word(at) })),
    );

    return {
      assets: [picture.asset],
      body: element(
        "qti-hotspot-interaction",
        {
          class:
            settings.look === "unselected-hidden"
              ? Option.some("qti-unselected-hidden")
              : Option.none(),
          "data-max-selections-message": messages
            ? Option.some(`Pick no more than ${String(most)}.`)
            : Option.none(),
          "data-min-selections-message": messages
            ? Option.some("Pick at least one place.")
            : Option.none(),
          "max-choices": most,
          "min-choices": settings.least === "one" ? Option.some(1) : Option.none(),
          "response-identifier": response,
        },
        ...Option.match(context.prompt, {
          onNone: () => [],
          onSome: (prompt) => [element("qti-prompt", {}, prompt)],
        }),
        picture.markup,
        ...areas.map((area, at) =>
          element("qti-hotspot-choice", {
            ...areaAttributes(stage, area),
            "hotspot-label": word(at),
            identifier: idOf(at),
          }),
        ),
        ...(settings.rest === "rest"
          ? [
              element("qti-hotspot-choice", {
                ...restAttributes(stage),
                "hotspot-label": rest.name,
                identifier: rest.identifier,
              }),
            ]
          : []),
      ),
      declarations: [
        declaration(
          response,
          cardinalityOf(settings.picks),
          "identifier",
          correctResponse(rights),
          mapping(rights),
        ),
      ],
      host: Option.none(),
      scoring: { kind: "scored", most: rights.length, rules: [mapped(response)] },
    };
  },
});
