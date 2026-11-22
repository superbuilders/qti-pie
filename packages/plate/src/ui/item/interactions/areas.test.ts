/**
 * The graphic areas' names as the shell gives them (`namedAreasOf` in
 * `#plate/ui/item/interactions/areas.ts`), and the rows a Graphic Gap Match shows them in: an area
 * the author named nothing takes plate's "Area n of count" and is `unnamed`, and its row carries
 * `data-unnamed`, so a theme can hide such rows from the eye; an area the author named carries
 * neither.
 *
 * The property walks every pattern of named and unnamed areas, up to six, against the rule written
 * here: the oracle for the fallback is the catalog's English, "Area n of count", read off the page
 * plate writes. The rows are read from the item the verdict's test opens
 * (`#plate/test/area-items.ts`), whose six hotspots the core names "The field", nothing, nothing,
 * "The pond", "The barn" and nothing, rendered by `<Item>` as a host renders it, in answering and
 * in review.
 *
 * @module
 */
import { assert, describe, it } from "@effect/vitest";
import { Effect, Option } from "effect";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { configure } from "#plate/configuration.ts";
import { areaItemOf, graphicGapMatchKind } from "#plate/test/area-items.ts";
import { admitted } from "#plate/test/admitted.ts";
import { namedAreasOf } from "#plate/ui/item/interactions/areas.ts";
import { Item } from "#plate/ui/item/item.tsx";
import type { ItemProps } from "#plate/ui/item/item.tsx";
import { Responses } from "#plate/ui/responses.tsx";
import { acceptedItem } from "#plate/validate/verdict.ts";

/**
 * Every list of `n` places, each named by the author or not.
 *
 * @param n How many places.
 * @returns Every list, each place `true` where the author named it.
 */
const patterns = (n: number): readonly (readonly boolean[])[] =>
  n === 0
    ? [[]]
    : patterns(n - 1).flatMap((rest) => [
        [false, ...rest],
        [true, ...rest],
      ]);

/**
 * One row of a Graphic Gap Match's list of hotspots, as its markup shows it: the name it shows or
 * gives its group, and whether it carries `data-unnamed`.
 */
interface Row {
  readonly name: string;
  readonly unnamed: boolean;
}

/**
 * Read the rows of a Graphic Gap Match's list of hotspots from a page's markup: each
 * `plate-placement-target` group in `plate-graphic-gap-match-targets`, in order, named by its
 * `aria-label`, else by the text of its `plate-placement-target-label`.
 *
 * @param html The page's markup.
 * @returns The rows.
 */
const rowsIn = (html: string): readonly Row[] => {
  const list = html.split('data-slot="plate-graphic-gap-match-targets"')[1] ?? "";

  return [...list.matchAll(/<div(?<tag>[^>]*data-slot="plate-placement-target"[^>]*)>/gu)].map(
    (row) => {
      const tag = row.groups?.["tag"] ?? "";
      const after = list.slice((row.index ?? 0) + row[0].length);
      const named = /aria-label="(?<name>[^"]*)"/u.exec(tag)?.groups?.["name"];
      const shown = /data-slot="plate-placement-target-label"[^>]*>(?<name>[^<]*)</u.exec(after)
        ?.groups?.["name"];

      return { name: named ?? shown ?? "", unnamed: tag.includes('data-unnamed=""') };
    },
  );
};

/**
 * The rows the six hotspots of the Graphic Gap Match item show, by the rule: the author's name and
 * no `data-unnamed` where the core read one, "Area n of 6" and `data-unnamed` where it read none.
 */
const sixRows: readonly Row[] = [
  { name: "The field", unnamed: false },
  { name: "Area 2 of 6", unnamed: true },
  { name: "Area 3 of 6", unnamed: true },
  { name: "The pond", unnamed: false },
  { name: "The barn", unnamed: false },
  { name: "Area 6 of 6", unnamed: true },
];

/**
 * Open the six-hotspot Graphic Gap Match as a host does, and give what `<Item>` takes to render it.
 *
 * @returns The item's props but its mode.
 */
const sixHotspots = Effect.gen(function* sixHotspots() {
  const location = `${graphicGapMatchKind.element}.xml`;
  const verdict = yield* admitted(
    location,
    new TextEncoder().encode(areaItemOf(graphicGapMatchKind)),
  );
  const item = Option.getOrElse(acceptedItem(verdict), () =>
    assert.fail(`${location} is not accepted: ${verdict.verdict}`),
  );
  const configuration = yield* configure({ assets: [["map.svg", "/map.svg"]], seed: "areas" });

  return { configuration, instance: "areas", item } satisfies Omit<ItemProps, "mode">;
});

describe("a graphic area's name", () => {
  it("is the author's, not unnamed, where the core read one, else Area n of count, unnamed, for every pattern up to six areas", () => {
    for (const count of [1, 2, 3, 4, 5, 6]) {
      for (const named of patterns(count)) {
        const areas = named.map((authored, at) => ({
          catalog: Option.none(),
          identifier: `H${String(at + 1)}`,
          label: authored ? Option.some(`Named ${String(at + 1)}`) : Option.none(),
        }));
        const shown = namedAreasOf(areas, "en").map(({ label, unnamed }) => ({
          name: label,
          unnamed,
        }));

        assert.deepStrictEqual(
          shown,
          named.map((authored, at) =>
            authored
              ? { name: `Named ${String(at + 1)}`, unnamed: false }
              : { name: `Area ${String(at + 1)} of ${String(count)}`, unnamed: true },
          ),
        );
      }
    }
  });

  it.effect(
    "marks a Graphic Gap Match's row data-unnamed exactly where plate named its hotspot, in answering",
    () =>
      Effect.gen(function* answeringRows() {
        const props = yield* sixHotspots;
        const html = renderToStaticMarkup(
          createElement(Responses, {
            children: createElement(Item, { ...props, mode: "answering" }),
            onChange: () => {
              // A server render calls no handler.
            },
            value: [],
          }),
        );

        assert.deepStrictEqual(rowsIn(html), sixRows);
      }),
  );

  it.effect(
    "marks a Graphic Gap Match's row data-unnamed exactly where plate named its hotspot, in review",
    () =>
      Effect.gen(function* reviewRows() {
        const props = yield* sixHotspots;
        const html = renderToStaticMarkup(createElement(Item, { ...props, mode: "review" }));

        assert.deepStrictEqual(rowsIn(html), sixRows);
      }),
  );
});
