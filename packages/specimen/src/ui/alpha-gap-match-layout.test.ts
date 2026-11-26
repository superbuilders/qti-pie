/**
 * Plate's UI suite over Alpha's two Gap Match layouts, measured in headless Google Chrome: plate's
 * look-alikes of the number line form (`alpha-open-number-line`) and the comparison form
 * (`qti-choices-bottom alpha-symbol-compare`), server-rendered while the child answers, with cards
 * placed, and in review, laid out under plate's base sheet, Alpha's base sheet
 * (`@qti-pie/plate/alpha/styles/base.css`), then a theme, as metis imports them: Alpha's sheet
 * comes before the theme in the page, so only its layer, never the order of the sheets, can make it
 * win. Two themes: plate's own, as a host that keeps plate's look imports it, and a theme that
 * fights each layout as a host's theme may (metis's puts every Gap Match's bank under its sentence
 * and draws a slot 160 px wide), its selectors heavier than any of Alpha's sheet. Three widths of
 * the item: 1000 px, 384 px (a 768 px tablet at 200% zoom) and 320 px (a phone).
 *
 * Each rule is read from the two forms, never from plate's code:
 *
 * - NL1, the cards above the line: the bank's bottom is above the line's top.
 * - NL2, one row of marked positions: every gap stands on one baseline over the line, the line drawn
 *   across it (an arrow, `::before`) and a tick under each gap (`::after`).
 * - NL3, the labels at the ends: the first label's left edge is the line's left, the last label's
 *   right edge its right, both under the gaps, apart; while the spoken support is on, each label's
 *   last child is its play control.
 * - NL4, the positions evenly spaced and inside the line, at every width: the gaps' centres equally
 *   far apart, each gap between the arrowheads, each at least a target wide, and the page no wider
 *   than the item.
 * - NL5, the line in forced colours: the arrow keeps a colour of its own.
 * - NL6, a placed card shown once: its place in the bank an empty frame, its numeral unpainted.
 * - SC1, the numerals large: at 1000 px the comparison's sentence at 72 px, bold; its gap at least 96
 *   px square; a placed symbol at 72 px.
 * - SC2, the cards below: the bank's top is under the sentence's bottom, each symbol card it shows at
 *   least 120 px wide, its symbol at 56 px.
 * - SC3, one line at every width: with four digits either side, the numerals and the gap on one line,
 *   the gap at least as tall as a numeral, the page no wider than the item.
 *
 * And the kills: under the fighting theme without Alpha's sheet, and with Alpha's rules moved into
 * plate's layer before the theme, NL2 and SC1 each break, so the layouts are Alpha's sheet's, held
 * by its layer, and no theme's (where the bank stands, NL1 and SC2, is the author's
 * `qti-choices-*`, which plate's base sheet holds); and where an item of either class leaves its
 * form's closed structure (a label that is no element, a second paragraph, a fourth gap, a gap
 * inside a strong), it draws as a plain Gap Match, with no line and no large numerals.
 *
 * @module
 */
import { readFile } from "node:fs/promises";
import path from "node:path";
import { word } from "@bjornpagen/testing/dictionary";
import { drawn, explore } from "@bjornpagen/testing/explore";
import { required } from "@bjornpagen/testing/features";
import { element, int, option } from "@bjornpagen/testing/gen";
import type { Gen } from "@bjornpagen/testing/gen";
import { notesOnly } from "@bjornpagen/testing/sense";
import { completeShrink } from "@bjornpagen/testing/shrink";
import { searched } from "@bjornpagen/testing/vitest";
import { assert, describe, it } from "@effect/vitest";
import { Array as Arr, Effect, Formatter, Option } from "effect";
import type { Browser } from "playwright-core";
import { chromeFor } from "#specimen/ui/chrome.ts";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { acceptedItem, configure, startingResponses } from "@qti-pie/plate";
import { admitted } from "@qti-pie/plate/test/admitted";
import { Item, standardRenderers } from "@qti-pie/plate/ui";
import type { ItemProps } from "@qti-pie/plate/ui";
import { heldOf, Responses } from "@qti-pie/plate/ui/client";
import {
  comparisonCards,
  itemWidths,
  numberLineCards,
  numberLineGaps,
} from "#specimen/ui/alpha-gap-match-layout.dictionary.ts";
import type { ItemWidth } from "#specimen/ui/alpha-gap-match-layout.dictionary.ts";

/**
 * The supports a host enables for one candidate, `<Item>`'s `supports`.
 */
type Supports = NonNullable<ItemProps["supports"]>;

/**
 * Plate's source folder, whose sheets and Alpha fixtures the suite reads.
 */
const plateSource = path.resolve(import.meta.dirname, "../../../plate/src");

/**
 * The supports of a child who hears content read aloud: the `spoken` catalog support enabled at
 * `computer-read-aloud`, every other support off.
 */
const spoken: Supports = {
  braille: Option.none(),
  catalog: new Set(["spoken"]),
  display: { invertDisplayPolarity: false, keywordEmphasis: false, magnification: Option.none() },
  keywordTranslationLanguage: Option.none(),
  readAloud: Option.some("computer-read-aloud"),
  signLanguage: Option.none(),
};

/**
 * A theme that fights both layouts, in plate's layer after the base sheet, each selector heavier
 * than any of Alpha's sheet (an id's weight, `:not(#fight)`): the line's block a block, every gap
 * and every slot 160 px wide with room round it, the sentence at the text's size and weight, and
 * every chip at the text's size; and, at a theme's ordinary weight, every bank under its sentence,
 * which plate's base sheet keeps to the author's `qti-choices-*`.
 */
const fightingTheme = `@layer plate {
  html body:not(#fight) [data-slot="plate-item"] [data-slot="plate-placement"] { display: flex; flex-direction: column; }
  html body [data-slot="plate-item"] [data-slot="plate-placement"] > [data-slot="plate-placement-dock"] { order: 1; margin: 2rem 0 0; }
  html body:not(#fight) [data-slot="plate-item"] [data-slot="plate-placement"] p { display: block; font-size: 1.25rem; font-weight: 400; }
  html body:not(#fight) [data-slot="plate-item"] [data-slot="plate-gap"] { min-inline-size: 10rem; margin: 0.25rem; }
  html body:not(#fight) [data-slot="plate-item"] [data-slot="plate-placement-slot"] { min-inline-size: 10rem; }
  html body:not(#fight) [data-slot="plate-item"] [data-slot="plate-placement-chip"] { font-size: 1.25rem; font-weight: 600; min-inline-size: 4rem; }
}`;

/**
 * Alpha's base sheet as a page holds it: `layered`, as qti-pie ships it, its rules in
 * `plate-alpha`; `plate`, its rules moved into plate's layer, a kill; or `none`, absent, a kill.
 */
type Sheet = "layered" | "none" | "plate";

/**
 * An edit the page makes to the rendered item before it is measured, to lay out content outside the
 * form's closed structure, or the comparison's widest numerals: `none`; `four-digits`, each numeral
 * of the comparison 9999; `text-label`, the number line's right label a bare word; `two-p`, a
 * second paragraph after the gapped one; `five-children`, a copy of a gap after the last;
 * `strong-gap`, the comparison's gap inside a `strong`; `refusal`, plate's latest refusal shown
 * under the gapped content as plate shows it (a `p` of its own, `plate-placement-message`), which
 * must leave either form's layout as it is.
 */
type Edit =
  | "five-children"
  | "four-digits"
  | "none"
  | "refusal"
  | "strong-gap"
  | "text-label"
  | "two-p";

/**
 * One page the suite lays out: an item's fixture, its mode, the pairs placed (by gap text and gap),
 * the theme, Alpha's sheet as the page holds it, the item's width, the edit the page makes, and
 * whether the page shows forced colours.
 */
interface Laid {
  readonly alpha: Sheet;
  readonly fixture: "comparison" | "number-line";
  readonly forced?: boolean;
  readonly mode: "answering" | "review";
  readonly pairs: readonly (readonly [string, string])[];
  readonly edit?: Edit;
  readonly theme: "fighting" | "plate";
  readonly width: number;
}

/**
 * What the suite measures of a laid-out page, each box its rounded viewport rectangle.
 */
interface Measured {
  readonly arrow: string;
  readonly arrowColour: string;
  readonly bank: readonly { readonly font: string; readonly width: number }[];
  readonly block: Box;
  readonly blockColour: string;
  readonly blockDisplay: string;
  readonly blockFont: string;
  readonly blockWeight: number;
  readonly dock: Box;
  readonly gapChips: readonly string[];
  readonly gaps: readonly Box[];
  readonly labels: readonly (Box & { readonly lastIsControl: boolean })[];
  readonly numerals: readonly Box[];
  readonly overflow: number;
  readonly ticks: readonly string[];
  readonly usedColours: readonly string[];
}

/**
 * A box: its edges, in viewport pixels.
 */
interface Box {
  readonly bottom: number;
  readonly height: number;
  readonly left: number;
  readonly right: number;
  readonly top: number;
  readonly width: number;
}

/**
 * Chrome, through the suites' one launcher (`#specimen/ui/chrome.ts`): a failure of its is a defect
 * of the test.
 */
const launched = chromeFor((_step, cause) => cause);

/**
 * The machine's Google Chrome, headless, closed with its scope.
 */
const chrome = Effect.orDie(launched.browser);

/**
 * Read one of plate's files as text.
 *
 * @param file Its path under plate's source folder.
 * @returns Its text.
 */
const plateText = (file: string): Effect.Effect<string> =>
  Effect.promise(() => readFile(path.join(plateSource, file), "utf-8"));

/**
 * Render a page's item as the server does and wrap it in a page of the sheets it names.
 *
 * @param laid The page.
 * @returns Its HTML.
 */
const pageOf = (laid: Laid) =>
  Effect.gen(function* page() {
    const location = `gap-match/${laid.fixture}.xml`;
    const bytes = yield* Effect.promise(() =>
      readFile(path.join(plateSource, "alpha/fixtures", location)),
    );
    const accepted = yield* Effect.orDie(
      Effect.fromOption(acceptedItem(yield* admitted(location, bytes))),
    );
    const configuration = yield* configure({
      assets: ["prompt", "least", "greatest"].map(
        (part) => [`gap-match/media/${part}.mp3`, `https://media.example/${part}.mp3`] as const,
      ),
      seed: "alpha-layout",
    });
    const values = {
      RESPONSE: {
        baseType: "directedPair" as const,
        cardinality: laid.fixture === "comparison" ? ("single" as const) : ("multiple" as const),
        values: laid.pairs.map((value) => ({ baseType: "directedPair" as const, value })),
      },
    };
    const shown: ItemProps = {
      configuration,
      instance: "layout",
      item: accepted,
      mode: laid.mode,
      showFeedback: false,
      supports: spoken,
    };
    const props: ItemProps = laid.mode === "review" ? { ...shown, values } : shown;
    const item = createElement(Item, { ...props, renderers: standardRenderers });
    const html = renderToStaticMarkup(
      laid.mode === "answering"
        ? createElement(Responses, {
            children: item,
            onChange: () => {},
            value: heldOf({ ...startingResponses(accepted, props), ...values }),
          })
        : item,
    );
    const base = yield* plateText("styles/base.css");
    const theme = laid.theme === "plate" ? yield* plateText("styles/theme.css") : fightingTheme;
    const sheet = yield* plateText("alpha/styles/base.css");
    const alpha = {
      layered: sheet,
      none: "",
      plate: sheet.replace("@layer plate-alpha {", "@layer plate {"),
    }[laid.alpha];

    return `<!doctype html><html lang="en"><head><meta charset="utf-8"><style>${base}</style><style>${alpha}</style><style>${theme}</style></head><body style="margin:0"><main style="box-sizing:border-box;inline-size:${String(laid.width)}px">${html}</main></body></html>`;
  });

/**
 * A box's edges as the page reads them: left, top, right and bottom, in viewport pixels.
 */
type Edges = readonly [left: number, top: number, right: number, bottom: number];

/**
 * What the page reads of itself, each box by its edges: what {@link Measured} holds, before the
 * suite rounds each box.
 */
interface Read extends Omit<Measured, "block" | "dock" | "gaps" | "labels" | "numerals"> {
  readonly block: Edges;
  readonly dock: Edges;
  readonly gaps: readonly Edges[];
  readonly labels: readonly (readonly [edges: Edges, lastIsControl: boolean])[];
  readonly numerals: readonly Edges[];
}

/**
 * Each edit but `none`, made to the rendered item in the page: each run by Chrome, so it holds no
 * reference outside itself.
 */
const edits: Readonly<Record<Exclude<Edit, "none">, () => void>> = {
  "five-children": () => {
    const gaps = [...document.querySelectorAll('[data-slot="plate-gap"]')];

    gaps[0]?.closest("p")?.lastElementChild?.before(gaps.at(-1)?.cloneNode(true) ?? "");
  },
  "four-digits": () => {
    const sentence = document.querySelector('[data-slot="plate-gap"]')?.closest("p");

    for (const node of sentence?.childNodes ?? []) {
      if (node.nodeType === Node.TEXT_NODE && /\d/u.test(node.textContent ?? "")) {
        node.textContent = (node.textContent ?? "").replace(/\d+/u, "9999");
      }
    }
  },
  refusal: () => {
    const message = document.createElement("p");

    message.dataset["slot"] = "plate-placement-message";
    message.textContent = "Blank 1 is full. Take one out first.";
    document.querySelector('[data-slot="plate-gap"]')?.closest("p")?.after(message);
  },
  "strong-gap": () => {
    const gap = document.querySelector('[data-slot="plate-gap"]');
    const strong = document.createElement("strong");

    gap?.replaceWith(strong);
    strong.append(gap ?? "");
  },
  "text-label": () => {
    document
      .querySelector('[data-slot="plate-gap"]')
      ?.closest("p")
      ?.lastElementChild?.replaceWith(document.createTextNode("greatest"));
  },
  "two-p": () => {
    const other = document.createElement("p");

    other.textContent = "Look at both numbers.";
    document.querySelector('[data-slot="plate-gap"]')?.closest("p")?.after(other);
  },
};

/**
 * Read the laid-out page, in the page: run by Chrome, so it holds no reference outside itself.
 *
 * @returns What the page shows, each box by its edges.
 */
const readPage = (): Read => {
  const gaps = [...document.querySelectorAll('[data-slot="plate-gap"]')];
  const block = gaps[0]?.closest("p") ?? document.body;
  const labels = [...block.children].filter((child) => !child.matches('[data-slot="plate-gap"]'));
  const [blockEdges, dockEdges, ...rest] = [
    block,
    document.querySelector('[data-slot="plate-placement-dock"]'),
    ...gaps,
    ...labels,
  ].map((each): Edges => {
    const box = each?.getBoundingClientRect() ?? new DOMRect();

    return [box.left, box.top, box.right, box.bottom];
  });
  const style = getComputedStyle(block);
  const line = getComputedStyle(block, "::before");

  return {
    arrow: line.content,
    arrowColour: line.backgroundColor,
    bank: [
      ...document.querySelectorAll(
        '[data-slot="plate-placement-bank"] > [data-slot="plate-placement-chip"]',
      ),
    ].map((chip) => ({
      font: getComputedStyle(chip).fontSize,
      width: Math.round(chip.getBoundingClientRect().width),
    })),
    block: blockEdges ?? [0, 0, 0, 0],
    blockColour: style.color,
    blockDisplay: style.display,
    blockFont: style.fontSize,
    blockWeight: Number(style.fontWeight),
    dock: dockEdges ?? [0, 0, 0, 0],
    gapChips: gaps.flatMap((gap) =>
      [...gap.querySelectorAll('[data-slot="plate-placement-chip"]')].map(
        (chip) => getComputedStyle(chip).fontSize,
      ),
    ),
    gaps: rest.slice(0, gaps.length),
    labels: labels.map((label, at) => [
      rest[gaps.length + at] ?? [0, 0, 0, 0],
      label.lastElementChild?.matches('[data-slot="plate-read-aloud"]') ?? false,
    ]),
    numerals: [...block.childNodes]
      .filter((node) => node.nodeType === Node.TEXT_NODE && /\d/u.test(node.textContent ?? ""))
      .map((node): Edges => {
        const range = document.createRange();

        range.selectNodeContents(node);

        const box = range.getBoundingClientRect();

        return [box.left, box.top, box.right, box.bottom];
      }),
    overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    ticks: gaps.map((gap) => getComputedStyle(gap, "::after").content),
    usedColours: [
      ...document.querySelectorAll(
        '[data-slot="plate-placement-bank"] > [data-slot="plate-placement-chip"][data-used]',
      ),
    ].map((chip) => getComputedStyle(chip).color),
  };
};

/**
 * A box from its edges, each rounded to the pixel.
 *
 * @param edges The edges.
 * @returns The box.
 */
const boxOf = ([left, top, right, bottom]: Edges): Box => ({
  bottom: Math.round(bottom),
  height: Math.round(bottom - top),
  left: Math.round(left),
  right: Math.round(right),
  top: Math.round(top),
  width: Math.round(right - left),
});

/**
 * Lay a page out in Chrome, make its edit and measure it.
 *
 * @param browser The browser.
 * @param laid The page.
 * @returns What the page shows.
 */
const measured = (browser: Browser, laid: Laid) =>
  Effect.gen(function* measure() {
    const html = yield* pageOf(laid);
    const page = yield* Effect.orDie(
      launched.pageOf(browser, { viewport: { height: 900, width: laid.width } }),
    );

    yield* Effect.promise(() =>
      page.emulateMedia({ forcedColors: laid.forced === true ? "active" : "none" }),
    );
    yield* Effect.promise(() => page.setContent(html));

    const edit = laid.edit ?? "none";

    if (edit !== "none") {
      const made = edits[edit];

      yield* Effect.promise(() => page.evaluate(made));
    }

    const read = yield* Effect.promise(() => page.evaluate(readPage));

    yield* Effect.promise(() => page.close());

    return {
      ...read,
      block: boxOf(read.block),
      dock: boxOf(read.dock),
      gaps: read.gaps.map(boxOf),
      labels: read.labels.map(([edges, lastIsControl]) => ({ ...boxOf(edges), lastIsControl })),
      numerals: read.numerals.map(boxOf),
    } satisfies Measured;
  });

/**
 * Name the rules a page breaks, of rules each given as its name and whether the page holds it.
 *
 * @param rules The rules.
 * @returns Each broken rule's name.
 */
const brokenOf = (rules: readonly (readonly [name: string, holds: boolean])[]): readonly string[] =>
  rules.filter(([, holds]) => !holds).map(([name]) => name);

/**
 * NL3: the labels at the line's two ends, under its gaps and apart, each holding its control last
 * where it should.
 *
 * @param seen What the page shows.
 * @param answering Whether each label holds its control.
 * @returns Whether the page holds it.
 */
const labelsAtEnds = (seen: Measured, answering: boolean): boolean => {
  const [first, ...rest] = seen.labels;
  const last = rest.at(-1);
  const gapsBottom = Math.max(...seen.gaps.map((gap) => gap.bottom));

  return (
    first !== undefined &&
    last !== undefined &&
    Math.abs(first.left - seen.block.left) <= 1 &&
    Math.abs(last.right - seen.block.right) <= 1 &&
    Math.min(first.top, last.top) >= gapsBottom &&
    first.right <= last.left &&
    (!answering || (first.lastIsControl && last.lastIsControl))
  );
};

/**
 * NL4: the gaps evenly spaced, each a target wide between the arrowheads, and the page no wider
 * than the item.
 *
 * @param seen What the page shows.
 * @returns Whether the page holds it.
 */
const evenlyInside = (seen: Measured): boolean => {
  const centres = seen.gaps.map((gap) => (gap.left + gap.right) / 2);
  const steps = centres.slice(1).map((centre, at) => centre - (centres[at] ?? 0));

  return (
    steps.length === 2 &&
    Math.abs((steps[0] ?? 0) - (steps[1] ?? 0)) <= 2 &&
    seen.gaps.every(
      (gap) =>
        gap.left >= seen.block.left + 16 && gap.right <= seen.block.right - 16 && gap.width >= 64,
    ) &&
    seen.overflow <= 0
  );
};

/**
 * The rules of the number line a page breaks, each by its name (NL1 to NL4 and NL6 in the header).
 *
 * @param seen What the page shows.
 * @param answering Whether the child answers with the spoken support on, so each label holds its
 *   control.
 * @returns Each broken rule's name.
 */
const numberLineBroken = (seen: Measured, answering: boolean): readonly string[] =>
  brokenOf([
    ["NL1", seen.dock.bottom <= seen.block.top],
    [
      "NL2",
      seen.gaps.length === 3 &&
        seen.gaps.every((gap) => gap.bottom === seen.gaps[0]?.bottom) &&
        seen.arrow !== "none" &&
        seen.ticks.every((tick) => tick !== "none"),
    ],
    ["NL3", labelsAtEnds(seen, answering)],
    ["NL4", evenlyInside(seen)],
    ["NL6", seen.usedColours.every((colour) => colour === "rgba(0, 0, 0, 0)")],
  ]);

/**
 * SC1: the numerals at 72 px, bold, the gap at least 96 px square, a placed symbol at 72 px.
 *
 * @param seen What the page shows.
 * @returns Whether the page holds it.
 */
const numeralsLarge = (seen: Measured): boolean => {
  const [gap] = seen.gaps;

  return (
    seen.blockFont === "72px" &&
    seen.blockWeight >= 700 &&
    gap !== undefined &&
    gap.width >= 96 &&
    gap.height >= 96 &&
    seen.gapChips.every((font) => font === "72px")
  );
};

/**
 * SC3: the numerals and the gap on one line, the gap as tall as a numeral and a target both ways,
 * the page no wider than the item.
 *
 * @param seen What the page shows.
 * @returns Whether the page holds it.
 */
const oneLine = (seen: Measured): boolean => {
  const [gap] = seen.gaps;
  const middles = [...seen.numerals, ...(gap === undefined ? [] : [gap])].map(
    (box) => (box.top + box.bottom) / 2,
  );

  return (
    seen.numerals.length === 2 &&
    gap !== undefined &&
    Math.max(...middles) - Math.min(...middles) <= 4 &&
    seen.numerals.every((numeral) => gap.height >= numeral.height) &&
    gap.width >= 64 &&
    gap.height >= 64 &&
    seen.overflow <= 0
  );
};

/**
 * The rules of the comparison a page breaks, each by its name (SC1 to SC3 in the header).
 *
 * @param seen What the page shows.
 * @param wide Whether the item is 1000 px wide, where the numerals stand at their largest.
 * @returns Each broken rule's name.
 */
const comparisonBroken = (seen: Measured, wide: boolean): readonly string[] =>
  brokenOf([
    ["SC1", !wide || numeralsLarge(seen)],
    [
      "SC2",
      seen.dock.top >= seen.block.bottom &&
        seen.bank.some((chip) => chip.width > 0) &&
        seen.bank.every((chip) => chip.width === 0 || (chip.width >= 120 && chip.font === "56px")),
    ],
    ["SC3", oneLine(seen)],
  ]);

/**
 * The two themes the layouts must hold under.
 */
const themes = ["plate", "fighting"] as const;

/**
 * A theme the layouts must hold under.
 */
type Theme = (typeof themes)[number];

/**
 * A screen an item's width stands for, one of {@link itemWidths}.
 */
type Screen = ItemWidth["screen"];

/**
 * The comparison's one gap, as its fixture writes it.
 */
const comparisonGap = "relation";

/**
 * The comparison's key, as its fixture's correct response writes it: the symbol card less, placed
 * in its gap.
 */
const comparisonKey = "lt";

/**
 * A page either form's search lays out and measures: the theme, the item's width and the screen
 * it stands for, the mode, the cards placed, each by card and gap, and the edit the page makes.
 */
interface Page<E extends Edit> {
  readonly edit: E;
  readonly mode: "answering" | "review";
  readonly pairs: readonly (readonly [string, string])[];
  readonly screen: Screen;
  readonly theme: Theme;
  readonly width: number;
}

/**
 * Draw the number line's cards as a child may place them: each card in turn on a gap no card holds
 * yet, or on none, so each card at most once and each gap holding one, a card drawn on none left
 * in the bank.
 */
const numberLinePairs: Gen<readonly (readonly [string, string])[]> = (source) => {
  const free: string[] = [...numberLineGaps];
  const pairs: (readonly [string, string])[] = [];

  for (const card of numberLineCards) {
    const at = source.draw(int(0, free.length));
    const gap = free[at - 1];

    if (gap !== undefined) {
      free.splice(at - 1, 1);
      pairs.push([card, gap]);
    }
  }

  return pairs;
};

/**
 * Draw a page of the number line: under either theme, at one of {@link itemWidths}, while the
 * child answers or in review, its cards placed in any way {@link numberLinePairs} draws, with
 * plate's latest refusal shown or not.
 */
const numberLinePages: Gen<Page<"none" | "refusal">> = (source) => ({
  ...source.draw(word(itemWidths)),
  edit: source.draw(element(["none", "refusal"])),
  mode: source.draw(element(["answering", "review"])),
  pairs: source.draw(numberLinePairs),
  theme: source.draw(element(themes)),
});

/**
 * Draw a page of the comparison: under either theme, at one of {@link itemWidths}, while the child
 * answers or in review, its gap empty or holding one of {@link comparisonCards}, with its numerals
 * as written or four digits each, or plate's latest refusal shown.
 */
const comparisonPages: Gen<Page<"four-digits" | "none" | "refusal">> = (source) => ({
  ...source.draw(word(itemWidths)),
  edit: source.draw(element(["four-digits", "none", "refusal"])),
  mode: source.draw(element(["answering", "review"])),
  pairs: Option.match(source.draw(option(word(comparisonCards))), {
    onNone: () => [],
    onSome: (card) => [[card, comparisonGap] as const],
  }),
  theme: source.draw(element(themes)),
});

/**
 * What a page of the number line places: nothing, some of its cards, or every one.
 */
type NumberLinePlaced = "every card placed" | "nothing placed" | "some cards placed";

/**
 * What a page of the comparison places: nothing, the key, or another symbol.
 */
type ComparisonPlaced = "another symbol placed" | "nothing placed" | "the key placed";

/**
 * A situation of a page the searches note: its theme, its screen, its mode, its edit and what it
 * places.
 */
type Situation<E extends Edit, P extends string> = "answering" | "review" | E | P | Screen | Theme;

/**
 * Give the situations a page of the number line is: its theme, its screen, its mode, its edit, and
 * whether it places nothing, some of its cards or every one.
 *
 * @param page The page.
 * @returns Its situations.
 */
const numberLineSituations = (
  page: Page<"none" | "refusal">,
): readonly Situation<"none" | "refusal", NumberLinePlaced>[] => [
  page.theme,
  page.screen,
  page.mode,
  page.edit,
  page.pairs.length === 0
    ? "nothing placed"
    : page.pairs.length === numberLineCards.length
      ? "every card placed"
      : "some cards placed",
];

/**
 * Give the situations a page of the comparison is: its theme, its screen, its mode, its edit, and
 * whether its gap holds nothing, the key or another symbol.
 *
 * @param page The page.
 * @returns Its situations.
 */
const comparisonSituations = (
  page: Page<"four-digits" | "none" | "refusal">,
): readonly Situation<"four-digits" | "none" | "refusal", ComparisonPlaced>[] => [
  page.theme,
  page.screen,
  page.mode,
  page.edit,
  page.pairs.length === 0
    ? "nothing placed"
    : page.pairs.some(([card]) => card === comparisonKey)
      ? "the key placed"
      : "another symbol placed",
];

describe("Alpha's Gap Match layouts, measured in Chrome", () => {
  it.live(
    "NL1-NL4: the number line draws its cards above one row of evenly spaced positions, labelled at its ends, on every page it shows: under either theme, at every width, in either mode, its cards placed in any way, a refusal shown or not",
    (ctx) =>
      Effect.gen(function* numberLine() {
        const browser = yield* chrome;

        return yield* searched(
          ctx,
          explore(
            {
              caseHang: "5 minutes",
              coverage: required<Situation<"none" | "refusal", NumberLinePlaced>>(
                [
                  ...themes,
                  ...Arr.map(itemWidths, ({ screen }) => screen),
                  "answering",
                  "review",
                  "none",
                  "refusal",
                  "nothing placed",
                  "some cards placed",
                  "every card placed",
                ],
                { cases: 32, sense: notesOnly },
              ),
              draw: drawn(numberLinePages),
              kept: [],
              literal: Formatter.format,
              oracle: {
                kind: "specification",
                name: "NL1 to NL4 as the suite reads them from Alpha's number line form, never from plate's code",
              },
              runs: 32,
              shrink: completeShrink,
              steerEvery: 16,
              suite: "plate-ui/alpha-number-line",
            },
            (page, c) =>
              Effect.gen(function* laidOut() {
                for (const situation of numberLineSituations(page)) {
                  c.note(situation);
                }

                const seen = yield* measured(browser, {
                  alpha: "layered",
                  edit: page.edit,
                  fixture: "number-line",
                  mode: page.mode,
                  pairs: page.pairs,
                  theme: page.theme,
                  width: page.width,
                });

                assert.deepStrictEqual(
                  numberLineBroken(seen, page.mode === "answering"),
                  [],
                  `${Formatter.format(page)}: ${JSON.stringify(seen)}`,
                );
              }),
          ),
        );
      }),
  );

  it.live(
    "SC1-SC3: the comparison draws its numerals large on one line and its symbol cards below, on every page it shows: under either theme, at every width, in either mode, its gap empty or holding any symbol, its numerals as written or four digits each, or a refusal shown",
    (ctx) =>
      Effect.gen(function* comparison() {
        const browser = yield* chrome;

        return yield* searched(
          ctx,
          explore(
            {
              caseHang: "5 minutes",
              coverage: required<Situation<"four-digits" | "none" | "refusal", ComparisonPlaced>>(
                [
                  ...themes,
                  ...Arr.map(itemWidths, ({ screen }) => screen),
                  "answering",
                  "review",
                  "four-digits",
                  "none",
                  "refusal",
                  "nothing placed",
                  "the key placed",
                  "another symbol placed",
                ],
                { cases: 48, sense: notesOnly },
              ),
              draw: drawn(comparisonPages),
              kept: [],
              literal: Formatter.format,
              oracle: {
                kind: "specification",
                name: "SC1 to SC3 as the suite reads them from Alpha's comparison form, never from plate's code: the numerals at their largest on a laptop's column with the numerals as written",
              },
              runs: 64,
              shrink: completeShrink,
              steerEvery: 16,
              suite: "plate-ui/alpha-comparison",
            },
            (page, c) =>
              Effect.gen(function* laidOut() {
                for (const situation of comparisonSituations(page)) {
                  c.note(situation);
                }

                const seen = yield* measured(browser, {
                  alpha: "layered",
                  edit: page.edit,
                  fixture: "comparison",
                  mode: page.mode,
                  pairs: page.pairs,
                  theme: page.theme,
                  width: page.width,
                });

                assert.deepStrictEqual(
                  comparisonBroken(seen, page.screen === "laptop" && page.edit === "none"),
                  [],
                  `${Formatter.format(page)}: ${JSON.stringify(seen)}`,
                );
              }),
          ),
        );
      }),
  );
});
