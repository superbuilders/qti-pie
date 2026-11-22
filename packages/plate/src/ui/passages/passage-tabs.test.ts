/**
 * The stimulus pane's tabs (`PassageTabs` beside this file, and `passageName` in
 * `#plate/ui/item/stimuli.tsx`, which names each tab): over panes of two to five passages, the
 * island's server markup holds:
 *
 * - **instructed:** the line telling the child to read every passage stands once, before the tabs;
 * - **named:** one list of tabs, named by its label, holds one tab per passage in order, each named
 *   by its passage's title, its whitespace collapsed, or "Passage n" where the title is blank;
 * - **shown:** the first tab is picked when the item opens and no other; one panel per passage, in
 *   order, holds its article and is named by its tab, the first shown and every other hidden.
 *
 * Kills: a writing that names each tab by its place, one that shows every panel, one that leaves
 * the instruction out, and one that names a blank title's tab by nothing are each refused.
 *
 * @module
 */
import { assert, describe, it } from "@effect/vitest";
import type { LiteElement, LiteNode } from "mathjax-full/js/adaptors/lite/Element.js";
import { liteAdaptor } from "mathjax-full/js/adaptors/liteAdaptor.js";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { collapsedText } from "#plate/ui/whitespace.ts";
import { passageName } from "#plate/ui/item/stimuli.tsx";
import { PassageTabs } from "#plate/ui/passages/passage-tabs.tsx";

/**
 * The adaptor the suite reads the markup through.
 */
const adaptor = liteAdaptor();

/**
 * The titles the passages are drawn from: plain, with whitespace to collapse, and blank.
 */
const titles = ["The Storm", "  After\n the   Rain ", "", "Poem: Fog", " "];

/**
 * The instruction line the suite renders with.
 */
const instruction = "Read all passages below and use the tabs to alternate between them";

/**
 * The list's label the suite renders with.
 */
const label = "Passage";

/**
 * A writing of the pane's tabs: how it names a tab, and a change a mutant makes to the markup.
 */
interface Writing {
  readonly change?: (page: LiteElement) => void;
  readonly name: typeof passageName;
}

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
 * Give the elements below a node of a `data-slot`.
 *
 * @param node The node.
 * @param slot The slot.
 * @returns The elements.
 */
const slotted = (node: LiteElement, slot: string): readonly LiteElement[] =>
  below(node).filter((element) => adaptor.getAttribute(element, "data-slot") === slot);

/**
 * Check every property over panes of two to five passages through a writing.
 *
 * @param writing The writing.
 * @returns Each broken property's name, with the first case it broke on.
 */
const broken = (writing: Writing): ReadonlyMap<string, string> => {
  const breaks = new Map<string, string>();
  const report = (name: string, count: number, what: string): void => {
    if (!breaks.has(name)) {
      breaks.set(name, `${String(count)} passages: ${what}`);
    }
  };

  for (let count = 2; count <= 5; count += 1) {
    for (let start = 0; start < titles.length; start += 1) {
      const written = Array.from(
        { length: count },
        (_, at) => titles[(start + at) % titles.length] ?? "",
      );
      const passages = written.map((title, at) => ({
        article: createElement(
          "article",
          { "data-slot": "plate-stimulus" },
          `Article ${String(at)}`,
        ),
        name: writing.name(title, at + 1, "en"),
      }));
      const page = adaptor.body(
        adaptor.parse(
          `<body>${renderToStaticMarkup(createElement(PassageTabs, { instruction, label, passages }))}</body>`,
          "text/html",
        ),
      );

      writing.change?.(page);

      const lines = slotted(page, "plate-stimuli-instruction");
      const [list] = slotted(page, "tabs-list");
      const tabs = slotted(page, "tabs-tab");
      const panels = slotted(page, "tabs-panel");
      const elements = below(page);

      if (
        lines.length !== 1 ||
        adaptor.textContent(lines[0] ?? page) !== instruction ||
        list === undefined ||
        elements.indexOf(lines[0] ?? page) > elements.indexOf(list)
      ) {
        report("instructed", count, `${String(lines.length)} instruction lines`);
      }

      const expected = written.map((title, at) => {
        const collapsed = collapsedText(title);

        return collapsed === "" ? `Passage ${String(at + 1)}` : collapsed;
      });

      if (
        slotted(page, "tabs-list").length !== 1 ||
        list === undefined ||
        adaptor.getAttribute(list, "aria-label") !== label ||
        tabs.map((tab) => adaptor.textContent(tab)).join("|") !== expected.join("|")
      ) {
        report(
          "named",
          count,
          `tabs ${tabs.map((tab) => adaptor.textContent(tab)).join("|")}, not ${expected.join("|")}`,
        );
      }

      const picked = tabs.map((tab) => adaptor.getAttribute(tab, "aria-selected") === "true");
      const shown = panels.map((panel) => !adaptor.hasAttribute(panel, "hidden"));
      const holds = panels.map((panel) => adaptor.textContent(panel));
      const namedBy = panels.map((panel, at) => {
        const tab = tabs[at];

        return (
          tab !== undefined &&
          adaptor.getAttribute(panel, "aria-labelledby") === adaptor.getAttribute(tab, "id")
        );
      });

      if (
        picked.join(" ") !== written.map((_, at) => at === 0).join(" ") ||
        shown.join(" ") !== written.map((_, at) => at === 0).join(" ") ||
        holds.join("|") !== written.map((_, at) => `Article ${String(at)}`).join("|") ||
        !namedBy.every(Boolean)
      ) {
        report(
          "shown",
          count,
          `picked ${picked.join(" ")}, shown ${shown.join(" ")}, holding ${holds.join("|")}`,
        );
      }
    }
  }

  return breaks;
};

describe("the stimulus pane's tabs", () => {
  it("tells the child to read every passage, names a tab by each title, and shows the first", () => {
    assert.deepStrictEqual(Object.fromEntries(broken({ name: passageName })), {});
  });

  it.each([
    [
      "each tab named by its place",
      "named",
      { name: (_title: string, n: number) => `Tab ${String(n)}` },
    ],
    [
      "a blank title's tab named by nothing",
      "named",
      { name: (title: string) => collapsedText(title) },
    ],
    [
      "every panel shown",
      "shown",
      {
        change: (page: LiteElement) => {
          for (const panel of slotted(page, "tabs-panel")) {
            adaptor.removeAttribute(panel, "hidden");
          }
        },
        name: passageName,
      },
    ],
    [
      "the instruction left out",
      "instructed",
      {
        change: (page: LiteElement) => {
          for (const line of slotted(page, "plate-stimuli-instruction")) {
            adaptor.remove(line);
          }
        },
        name: passageName,
      },
    ],
  ] as const satisfies readonly (readonly [string, string, Writing])[])(
    "refuses a mutant: %s (%s)",
    (_name, property, writing) => {
      assert.include([...broken(writing).keys()], property);
    },
  );
});
