/**
 * The options a host has eliminated, a test's cross-out (`Eliminated` in
 * `#plate/ui/picks/eliminated.tsx`, read by `PicksGroup` and `PickOption` beside it): over Choices
 * of one to five options, each way a child picks (one, at most two, any), every set of their
 * options the host eliminates, beside options it eliminates of another response, and each option
 * picked or not, the island's server markup holds:
 *
 * - **struck:** each option of this response the host eliminated carries `data-eliminated`, and its
 *   control is disabled, so neither a press nor the arrow keys pick it, and described as crossed
 *   out;
 * - **untouched:** every other option, an option of the same identifier eliminated of another
 *   response among them, carries none of it, and its control is enabled and undescribed.
 *
 * Kills: a writing that keys the eliminated options by identifier alone, one that leaves an
 * eliminated control enabled, and one that does not describe it are each refused.
 *
 * @module
 */
import { assert, describe, it } from "@effect/vitest";
import type { LiteElement, LiteNode } from "mathjax-full/js/adaptors/lite/Element.js";
import { liteAdaptor } from "mathjax-full/js/adaptors/liteAdaptor.js";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { bareRoot } from "#plate/test/roots.ts";
import { Choice } from "#plate/ui/choice/choice.tsx";
import { Eliminated } from "#plate/ui/picks/eliminated.tsx";
import type { EliminatedOption } from "#plate/ui/picks/eliminated.tsx";
import type { Picks } from "#plate/ui/picks/picks.ts";
import { Responses } from "#plate/ui/responses.tsx";

/**
 * The adaptor the suite reads the markup through.
 */
const adaptor = liteAdaptor();

/**
 * The description an eliminated option's control carries in the suite.
 */
const crossedOut = "Crossed out";

/**
 * The entry name the suite's Choice posts under.
 */
const own = "i.R";

/**
 * Another response's entry name, whose options the host eliminates too.
 */
const other = "i.S";

/**
 * One case: how many options, how the child picks, which options of this response the host
 * eliminated (by place), and which option is picked.
 */
interface Case {
  readonly count: number;
  readonly eliminated: ReadonlySet<number>;
  readonly picked: number | undefined;
  readonly picks: Picks;
}

/**
 * Every case: one to five options, each way to pick, every subset eliminated, and nothing or the
 * first option picked.
 */
const cases: readonly Case[] = [1, 2, 3, 4, 5].flatMap((count) =>
  ([{ kind: "one" }, { kind: "at-most", n: 2 }, { kind: "any" }] as const).flatMap((picks) =>
    Array.from({ length: 2 ** count }, (_, mask) => mask).flatMap((mask) =>
      [undefined, 0].map((picked): Case => ({
        count,
        eliminated: new Set(
          Array.from({ length: count }, (__, at) => at).filter(
            (at) => Math.floor(mask / 2 ** at) % 2 === 1,
          ),
        ),
        picked,
        picks,
      })),
    ),
  ),
);

/**
 * The identifier of the option at a place.
 *
 * @param at The place.
 * @returns The identifier.
 */
const identifierAt = (at: number): string => `C${String(at)}`;

/**
 * The eliminated options a host hands for a case: this response's, by its entry name, and every
 * option of the same identifiers eliminated of another response.
 *
 * @param inline The case.
 * @returns The options.
 */
const handed = (inline: Case): readonly EliminatedOption[] => [
  ...[...inline.eliminated].map((at): EliminatedOption => [own, identifierAt(at)]),
  ...Array.from({ length: inline.count }, (_, at): EliminatedOption => [other, identifierAt(at)]),
];

/**
 * A writing: what the host hands, turned into the eliminated options the island is given, and a
 * change a mutant makes to each option the island writes.
 */
interface Writing {
  readonly change?: (option: LiteElement) => void;
  readonly hand: (value: readonly EliminatedOption[]) => readonly EliminatedOption[];
}

/**
 * Render a case's Choice inside the `<Responses>` and the `<Eliminated>` it reads.
 *
 * @param inline The case.
 * @param writing The writing.
 * @returns The island's server markup, read into a tree.
 */
const render = (inline: Case, writing: Writing): LiteElement => {
  const choice = createElement(Choice, {
    choices: Array.from({ length: inline.count }, (_, at) => ({
      content: `Option ${String(at)}`,
      identifier: identifierAt(at),
      label: undefined,
    })),
    instruction: undefined,
    labels: { eliminated: crossedOut, limit: "At most {n}" },
    name: own,
    naming: { "aria-label": "Answer" },
    orientation: "vertical",
    picks: inline.picks,
    prompt: undefined,
    root: bareRoot,
  });
  const markup = renderToStaticMarkup(
    createElement(Responses, {
      children: createElement(Eliminated, {
        children: choice,
        value: writing.hand(handed(inline)),
      }),
      onChange: () => {
        // A server render calls no handler.
      },
      value: inline.picked === undefined ? [] : [[own, identifierAt(inline.picked)]],
    }),
  );

  return adaptor.body(adaptor.parse(`<body>${markup}</body>`, "text/html"));
};

/**
 * Give every element below a node, in document order.
 *
 * @param node The node.
 * @returns The elements.
 */
const below = (node: LiteElement): readonly LiteElement[] =>
  adaptor
    .childNodes(node)
    .filter((child: LiteNode): child is LiteElement => "children" in child)
    .flatMap((child) => [child, ...below(child)]);

/**
 * Check every property over every case through a writing.
 *
 * @param writing The writing.
 * @returns Each broken property's name, with the first case it broke on.
 */
const broken = (writing: Writing): ReadonlyMap<string, string> => {
  const breaks = new Map<string, string>();
  const report = (name: string, inline: Case, what: string): void => {
    if (!breaks.has(name)) {
      breaks.set(
        name,
        `${String(inline.count)} options, ${inline.picks.kind}, eliminated ${[...inline.eliminated].join(" ")}: ${what}`,
      );
    }
  };

  for (const inline of cases) {
    const options = below(render(inline, writing)).filter(
      (element) => adaptor.getAttribute(element, "data-slot") === "plate-choice-option",
    );

    if (options.length !== inline.count) {
      report("untouched", inline, `${String(options.length)} options written`);
    }

    for (const [at, option] of options.entries()) {
      writing.change?.(option);

      const control = below(option).find((element) =>
        ["radio", "checkbox"].includes(String(adaptor.getAttribute(element, "role"))),
      );
      const disabled =
        control !== undefined &&
        (adaptor.hasAttribute(control, "data-disabled") ||
          adaptor.getAttribute(control, "aria-disabled") === "true");
      const description =
        control === undefined || !adaptor.hasAttribute(control, "aria-description")
          ? undefined
          : String(adaptor.getAttribute(control, "aria-description"));
      const marked = adaptor.hasAttribute(option, "data-eliminated");

      if (inline.eliminated.has(at)) {
        if (!marked || !disabled || description !== crossedOut) {
          report(
            "struck",
            inline,
            `option ${String(at)}: marked ${String(marked)}, disabled ${String(disabled)}, described ${String(description)}`,
          );
        }
      } else if (marked || disabled || description !== undefined) {
        report(
          "untouched",
          inline,
          `option ${String(at)}: marked ${String(marked)}, disabled ${String(disabled)}, described ${String(description)}`,
        );
      }
    }
  }

  return breaks;
};

describe("the options a host has eliminated", () => {
  it("disables and describes each option of the response the host eliminated, and no other", () => {
    assert.deepStrictEqual(Object.fromEntries(broken({ hand: (value) => value })), {});
  });

  it.each([
    [
      "keyed by identifier alone",
      "untouched",
      {
        hand: (value: readonly EliminatedOption[]) =>
          value.map(([, identifier]): EliminatedOption => [own, identifier]),
      },
    ],
    [
      "an eliminated control left enabled",
      "struck",
      {
        change: (option: LiteElement) => {
          for (const element of below(option)) {
            adaptor.removeAttribute(element, "data-disabled");
            adaptor.removeAttribute(element, "aria-disabled");
          }
        },
        hand: (value: readonly EliminatedOption[]) => value,
      },
    ],
    [
      "an eliminated control undescribed",
      "struck",
      {
        change: (option: LiteElement) => {
          for (const element of below(option)) {
            adaptor.removeAttribute(element, "aria-description");
          }
        },
        hand: (value: readonly EliminatedOption[]) => value,
      },
    ],
  ] as const satisfies readonly (readonly [string, string, Writing])[])(
    "refuses a mutant: %s (%s)",
    (_name, property, writing) => {
      assert.include([...broken(writing).keys()], property);
    },
  );
});
