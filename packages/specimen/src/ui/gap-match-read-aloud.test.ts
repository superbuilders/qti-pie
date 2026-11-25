/**
 * Plate's UI suite over read-aloud in a Gap Match's sentence: plate's look-alike of the number line
 * form (`alpha/fixtures/gap-match/number-line.xml`), its stem (a paragraph of the body before the
 * interaction) and its two end labels ("least", "greatest") each naming a catalog of one `spoken`
 * card, its numeral cards silent. Opened as content the database admitted and shown while the
 * child answers, with the spoken support and without it, and in review.
 *
 * Each rule is read from the page against the number line form and the specifications it cites,
 * never against plate's code:
 *
 * - GR1, labels with play controls: the form says each end label's words are followed by a play
 *   control for the catalog it names. So each end label holds its one control, after its words,
 *   playing its own card's file; and the number line's first and last children stay the two labels,
 *   so the line's ends place the labels, not a control.
 * - GR2, one control per reference (information model §5.28): the stem, a paragraph of the body
 *   before the interaction, has its control before it; the labels hold theirs; and nothing else has
 *   one, no numeral card among them (never audio for a numeral); each is a native `button` with an
 *   accessible name no other control on the page shares (WCAG 2.4.6).
 * - GR4, dormant: with no support enabled the labels hold their words alone (§5.29).
 * - GR5, review: a review ships no read-aloud.
 *
 * @module
 */
import { readFile } from "node:fs/promises";
import path from "node:path";
import { assert, describe, it } from "@effect/vitest";
import { Effect, Option } from "effect";
import { parseHTML } from "linkedom";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { acceptedItem, configure, startingResponses } from "@qti-pie/plate";
import type { Accepted, Configuration } from "@qti-pie/plate";
import { admitted } from "@qti-pie/plate/test/admitted";
import { Item, standardRenderers } from "@qti-pie/plate/ui";
import type { ItemProps } from "@qti-pie/plate/ui";
import { heldOf, Responses } from "@qti-pie/plate/ui/client";
import { factsOf } from "#specimen/ui/rendered.ts";

/**
 * The supports a host enables for one candidate, `<Item>`'s `supports`.
 */
type Supports = NonNullable<ItemProps["supports"]>;

/**
 * The item's location in plate's Alpha fixtures, which its recordings' hrefs resolve against.
 */
const location = "gap-match/number-line.xml";

/**
 * The item's file: plate's Alpha fixture.
 */
const file = path.resolve(import.meta.dirname, "../../../plate/src/alpha/fixtures", location);

/**
 * Each recording's package path, resolved from the item's location (RFC 3986 §5.2), by the part
 * it reads.
 */
const recordings = {
  greatest: "gap-match/media/greatest.mp3",
  least: "gap-match/media/least.mp3",
  prompt: "gap-match/media/prompt.mp3",
} as const;

/**
 * The address the configuration's `assets` gives a recording.
 *
 * @param recording The recording's package path.
 * @returns Its address.
 */
const addressOf = (recording: string): string => `https://media.example/${recording}`;

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
 * The item as a host opens it: accepted from the database's admitted set, its recordings'
 * addresses in `assets`, configured once.
 */
const opened: Effect.Effect<{
  readonly accepted: Accepted;
  readonly configuration: Configuration;
}> = Effect.gen(function* openedItem() {
  const bytes = yield* Effect.promise(() => readFile(file));
  const verdict = yield* admitted(location, bytes);
  const accepted = yield* Effect.fromOption(acceptedItem(verdict));
  const configuration = yield* configure({
    assets: Object.values(recordings).map(
      (recording) => [recording, addressOf(recording)] as const,
    ),
    seed: "gap-match-read-aloud",
  });

  return { accepted, configuration };
}).pipe(Effect.orDie);

/**
 * Keep no change: the `onChange` a server render's `<Responses>` is given, which it never calls.
 */
const keepNothing = (): void => {
  // A server render runs no event handler.
};

/**
 * Render the item and parse its page.
 *
 * @param mode The mode.
 * @param supports The supports enabled, none where absent.
 * @returns The page's document and its facts.
 */
const page = (mode: "answering" | "review", supports: Option.Option<Supports>) =>
  Effect.gen(function* rendered() {
    const { accepted, configuration } = yield* opened;
    const props: ItemProps = {
      configuration,
      instance: "suite",
      item: accepted,
      mode,
      showFeedback: false,
      ...Option.match(supports, {
        onNone: () => ({}),
        onSome: (enabled) => ({ supports: enabled }),
      }),
    };
    const item = createElement(Item, { ...props, renderers: standardRenderers });
    const html = renderToStaticMarkup(
      mode === "answering"
        ? createElement(Responses, {
            children: item,
            onChange: keepNothing,
            value: heldOf(startingResponses(accepted, props)),
          })
        : item,
    );
    const { document } = parseHTML(`<!doctype html><html><body>${html}</body></html>`);

    return { document, facts: factsOf(html) };
  });

/**
 * The selector of plate's read-aloud part.
 */
const readAloudPart = '[data-slot="plate-read-aloud"]';

/**
 * The number line: the block of the gapped content that holds the gaps.
 *
 * @param document The page.
 * @returns Its element.
 */
const lineOf = (document: Document): Element =>
  document.querySelector('[data-slot="plate-gap"]')?.parentElement ??
  assert.fail("the page draws no gap");

/**
 * The sources of a control's recording, each as its address and type.
 *
 * @param control The control's part.
 * @returns Its sources, in document order.
 */
const sourcesOf = (control: Element): readonly (readonly [string | null, string | null])[] =>
  [...control.querySelectorAll("audio > source")].map((source) => [
    source.getAttribute("src"),
    source.getAttribute("type"),
  ]);

/**
 * What an end label shows: its words, its white space collapsed, and each of its element children
 * by what it is, a control or another element.
 *
 * @param label The label.
 * @returns Its words, and its children's kinds in order.
 */
const shownBy = (label: Element) => ({
  children: [...label.children].map((child) =>
    child.matches(readAloudPart) ? "control" : child.tagName.toLowerCase(),
  ),
  words: [...label.childNodes]
    .filter((node) => node.nodeType === 3)
    .map((node) => node.textContent ?? "")
    .join("")
    .trim(),
});

describe("read-aloud in a Gap Match's sentence", () => {
  it.effect("GR1-GR2: each end label holds its play icon after its words, and nothing else", () =>
    Effect.gen(function* presented() {
      const { document, facts } = yield* page("answering", Option.some(spoken));
      const line = lineOf(document);
      const first = line.firstElementChild ?? line;
      const last = line.lastElementChild ?? line;

      assert.deepStrictEqual(
        [first, last].map(shownBy),
        [
          { children: ["control"], words: "least" },
          { children: ["control"], words: "greatest" },
        ],
        "the line's first and last children are its labels, each its words, then its control",
      );
      assert.deepStrictEqual(
        [first, last].map((label) => sourcesOf(label.lastElementChild ?? label)),
        [
          [[addressOf(recordings.least), "audio/mpeg"]],
          [[addressOf(recordings.greatest), "audio/mpeg"]],
        ],
      );

      const stem = document.querySelector('[data-catalog-idref="audio-stem"]');

      assert.isTrue(
        stem?.previousElementSibling?.matches(readAloudPart),
        "the stem's control stands before it",
      );
      assert.deepStrictEqual(sourcesOf(stem?.previousElementSibling ?? document.body), [
        [addressOf(recordings.prompt), "audio/mpeg"],
      ]);
      assert.strictEqual(
        document.querySelectorAll(readAloudPart).length,
        3,
        "the stem and the two labels, no card",
      );

      const names = facts.controls
        .filter(
          (control) => control.element.startsWith("button") && control.name.startsWith("Listen"),
        )
        .map((control) => control.name);
      assert.strictEqual(names.length, 3, JSON.stringify(facts.controls));
      assert.strictEqual(new Set(names).size, 3, `names: ${names.join(", ")}`);
    }),
  );

  it.effect("GR4: with no support enabled the labels hold their words alone", () =>
    Effect.gen(function* dormant() {
      const { document } = yield* page("answering", Option.none());
      const line = lineOf(document);

      assert.strictEqual(document.querySelectorAll(readAloudPart).length, 0);
      assert.deepStrictEqual(
        [line.firstElementChild ?? line, line.lastElementChild ?? line].map(shownBy),
        [
          { children: [], words: "least" },
          { children: [], words: "greatest" },
        ],
      );
    }),
  );

  it.effect("GR5: a review holds no control", () =>
    Effect.gen(function* review() {
      const { document } = yield* page("review", Option.some(spoken));

      assert.strictEqual(document.querySelectorAll(readAloudPart).length, 0);
    }),
  );
});
