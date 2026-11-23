/**
 * Inline Choice (`qti-inline-choice-interaction`): 1 to 4 menus, one in each sentence of a short
 * passage, each of three values, short or long.
 *
 * @module
 */
import { Array as Arr, Option } from "effect";
import type { Answered } from "#specimen/answer.ts";
import { identifierValue } from "#specimen/posted.ts";
import { mapped } from "#specimen/credit.ts";
import { counted } from "#specimen/dimension.ts";
import { kind } from "#specimen/kind.ts";
import { correctResponse, declaration, mapping } from "#specimen/response.ts";
import { length, run, word } from "#specimen/words.ts";
import type { Length } from "#specimen/words.ts";
import { element, text } from "#specimen/xml.ts";

/**
 * How many values each menu offers.
 */
const offered = 3;

/**
 * An Inline Choice's settings: how many menus, and how long their values are.
 */
interface InlineChoiceSettings {
  readonly menus: number;
  readonly values: Length;
}

/**
 * A menu's response identifier.
 *
 * @param at Its place, from 0.
 * @returns `RESPONSE_1`, `RESPONSE_2`, …
 */
const responseOf = (at: number): string => `RESPONSE_${String(at + 1)}`;

/**
 * A menu's value's identifier, unique in the item, as every choice's is (reading 104).
 *
 * @param menu The menu's place, from 0.
 * @param at The value's place in it, from 0.
 * @returns `M1V1`, `M1V2`, … `M2V1`, …
 */
const idOf = (menu: number, at: number): string => `M${String(menu + 1)}V${String(at + 1)}`;

/**
 * The place of a menu's right value, which moves from menu to menu.
 *
 * @param menu The menu's place.
 * @returns The value's place.
 */
const rightOf = (menu: number): number => (menu + 1) % offered;

/**
 * What the menus give when the first `rightMenus` take their right value and the rest take a wrong
 * one or none: each menu that takes one, its response a `single` identifier.
 *
 * @param menus How many menus there are.
 * @param rightMenus How many, from the first, take their right value.
 * @param rest What the others take.
 * @returns The responses, none for a menu that takes nothing.
 */
const posted = (menus: number, rightMenus: number, rest: "none" | "wrong"): Answered["posted"] =>
  Object.fromEntries(
    Arr.makeBy(menus, (menu) => menu).flatMap((menu) => {
      if (menu < rightMenus) {
        return [
          [responseOf(menu), identifierValue("single", [idOf(menu, rightOf(menu))])] as const,
        ];
      }

      return rest === "wrong"
        ? [
            [
              responseOf(menu),
              identifierValue("single", [idOf(menu, (rightOf(menu) + 1) % offered)]),
            ] as const,
          ]
        : [];
    }),
  );

/**
 * Inline Choice, as the record of kinds holds it.
 */
export const inlineChoice = kind("inline-choice", {
  answers: (settings: InlineChoiceSettings) => {
    const half = Math.floor(settings.menus / 2);
    const partial: readonly Answered[] =
      half === 0
        ? []
        : [{ answer: "partial", posted: posted(settings.menus, half, "none"), score: half }];

    return [
      {
        answer: "right",
        posted: posted(settings.menus, settings.menus, "none"),
        score: settings.menus,
      },
      ...partial,
      { answer: "wrong", posted: posted(settings.menus, 0, "wrong"), score: 0 },
      { answer: "empty", posted: {}, score: 0 },
    ];
  },
  dimensions: { menus: counted("Menus", 1, 4), values: length },
  label: "Inline Choice",
  settings:
    (pick) =>
    (source): InlineChoiceSettings => ({
      menus: source.draw(pick("menus")),
      values: source.draw(pick("values")),
    }),
  write: (settings: InlineChoiceSettings, context) => {
    const menus = Arr.makeBy(settings.menus, (menu) => menu);

    return {
      assets: [],
      body: [
        ...Option.toArray(context.prompt),
        ...menus.map((menu) =>
          element(
            "p",
            {},
            text(`The ${word(menu)} picked `),
            element(
              "qti-inline-choice-interaction",
              { "response-identifier": responseOf(menu) },
              ...Arr.makeBy(offered, (at) =>
                element(
                  "qti-inline-choice",
                  { identifier: idOf(menu, at) },
                  text(run(settings.values, menu * offered + at)),
                ),
              ),
            ),
            text(" before lunch."),
          ),
        ),
      ].join(""),
      declarations: menus.map((menu) =>
        declaration(
          responseOf(menu),
          "single",
          "identifier",
          correctResponse([idOf(menu, rightOf(menu))]),
          mapping([idOf(menu, rightOf(menu))]),
        ),
      ),
      host: Option.none(),
      scoring: {
        kind: "scored",
        most: settings.menus,
        rules: menus.map((menu) => mapped(responseOf(menu))),
      },
    };
  },
});
