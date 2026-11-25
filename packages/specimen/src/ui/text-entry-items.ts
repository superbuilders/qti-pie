/**
 * The Text Entry items plate's and Alpha's renderer suites render (`text-entry.test.ts` here and in
 * `#specimen/alpha/`), each a document the database admitted, and the page a host renders of one:
 * through the renderers it composed, under its `textEntryKeypad`, in a mode.
 *
 * Every item is written here, a typed answer in a sentence and a line after it, as a kindergarten
 * to grade 2 form writes one: a whole-number box whose `pattern-mask` admits 0 to 20, the K–2
 * forms' kindergarten entry; one with no mask, which takes a negative integer; a decimal box;
 * a word box; and a box its author marked `alpha-math-entry`, Alpha's math entry.
 *
 * @module
 */
import { Effect } from "effect";
import { parseHTML } from "linkedom";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { acceptedItem, configure, solution, startingResponses } from "@qti-pie/plate";
import type { Accepted } from "@qti-pie/plate";
import { admitted } from "@qti-pie/plate/test/admitted";
import { Item } from "@qti-pie/plate/ui";
import type { Renderers } from "@qti-pie/plate/ui";
import { heldOf, Responses } from "@qti-pie/plate/ui/client";

/**
 * Write a Text Entry item: a response of a base type with its correct value, the box in a sentence
 * between two numbers, and a line after the sentence.
 *
 * @param identifier The item's identifier.
 * @param baseType The response's base type.
 * @param correct The correct value, as its base type writes it.
 * @param box The `qti-text-entry-interaction`'s attributes after its response identifier.
 * @returns The document.
 */
const itemXml = (
  identifier: string,
  baseType: "float" | "integer" | "string",
  correct: string,
  box: string,
): string => `<qti-assessment-item xmlns="http://www.imsglobal.org/xsd/imsqtiasi_v3p0" identifier="${identifier}" title="${identifier}" adaptive="false" time-dependent="false" xml:lang="en-US">
  <qti-response-declaration identifier="RESPONSE" cardinality="single" base-type="${baseType}">
    <qti-correct-response><qti-value>${correct}</qti-value></qti-correct-response>
  </qti-response-declaration>
  <qti-outcome-declaration identifier="SCORE" cardinality="single" base-type="float"/>
  <qti-item-body>
    <p>4 + <qti-text-entry-interaction response-identifier="RESPONSE"${box}/> = 11</p>
    <p>Type the number that makes the sentence true.</p>
  </qti-item-body>
  <qti-response-processing template="https://purl.imsglobal.org/spec/qti/v3p0/rptemplates/match_correct"/>
</qti-assessment-item>
`;

/**
 * The items, each by the box it shows.
 */
export const textEntryItems = {
  decimal: itemXml("text-entry-decimal", "float", "7.0", ""),
  math: itemXml("text-entry-math", "string", "7", ' class="alpha-math-entry"'),
  signed: itemXml("text-entry-signed", "integer", "7", ""),
  whole: itemXml(
    "text-entry-whole",
    "integer",
    "7",
    ' pattern-mask="0|[1-9]|1[0-9]|20" data-patternmask-message="Type a number from 0 to 20."',
  ),
  word: itemXml("text-entry-word", "string", "seven", ""),
} as const;

/**
 * An item of {@link textEntryItems}, by the box it shows.
 */
export type TextEntryItem = keyof typeof textEntryItems;

/**
 * Open an item as a host does: as content the database admitted.
 *
 * @param name The item.
 * @returns The accepted item.
 */
const openedItem = (name: TextEntryItem): Accepted =>
  Effect.runSync(
    Effect.gen(function* opened() {
      const verdict = yield* admitted(
        `${name}.xml`,
        new TextEncoder().encode(textEntryItems[name]),
      );

      return yield* Effect.fromOption(acceptedItem(verdict));
    }).pipe(Effect.orDie),
  );

/**
 * Keep no change: the `onChange` a server render's `<Responses>` is given, which it never calls.
 */
const keepNothing = (): void => {
  // A server render calls no handler.
};

/**
 * How a page shows an item: the renderers the host composed, its `textEntryKeypad`, and the mode,
 * `solution` showing the correct response.
 */
export interface Showing {
  readonly keypad: "none" | "on-screen";
  readonly mode: "answering" | "solution";
  readonly renderers: Renderers;
}

/**
 * Render an item as a host does and parse its page.
 *
 * @param name The item.
 * @param showing How the page shows it.
 * @returns The page's document.
 */
export const pageOf = (name: TextEntryItem, showing: Showing): Document => {
  const accepted = openedItem(name);
  const configuration = Effect.runSync(
    configure({ seed: "text-entry", textEntryKeypad: showing.keypad }),
  );
  const shown = {
    configuration,
    instance: "suite",
    item: accepted,
    renderers: showing.renderers,
    showFeedback: false,
  } as const;
  const html =
    showing.mode === "answering"
      ? renderToStaticMarkup(
          createElement(Responses, {
            children: createElement(Item, { ...shown, mode: "answering" }),
            onChange: keepNothing,
            value: heldOf(startingResponses(accepted, shown)),
          }),
        )
      : renderToStaticMarkup(
          createElement(Item, {
            ...shown,
            mode: "solution",
            values: solution(accepted, { correct: {} }),
          }),
        );

  return parseHTML(`<!doctype html><html><body>${html}</body></html>`).document;
};

/**
 * The facts of a page a Text Entry's renderer decides: the box's `inputmode`, none for no box or no
 * attribute; each keypad's keys, in order; whether a keypad stands inside a paragraph; the text of
 * the element each keypad follows; and whether the page holds a math entry or its answer.
 */
export interface TextEntryFacts {
  readonly inputMode: string | null;
  readonly keypadInParagraph: boolean;
  readonly keypads: readonly (readonly string[])[];
  readonly keypadFollows: readonly string[];
  readonly mathAnswer: boolean;
  readonly mathEntry: boolean;
}

/**
 * Read a page's {@link TextEntryFacts}.
 *
 * @param document The page.
 * @returns Its facts.
 */
export const factsOf = (document: Document): TextEntryFacts => {
  const keypads = [...document.querySelectorAll('[data-slot="plate-text-entry-keypad"]')];
  // HTML's attribute names are ASCII case-insensitive, and React writes this one `inputMode`.
  const input = document.querySelector('[data-slot="plate-text-entry"] input');

  return {
    inputMode:
      [...(input?.attributes ?? [])].find(({ name }) => name.toLowerCase() === "inputmode")
        ?.value ?? null,
    keypadFollows: keypads.map(
      (keypad) => keypad.previousElementSibling?.textContent?.replaceAll(/\s+/gu, " ").trim() ?? "",
    ),
    keypadInParagraph: keypads.some((keypad) => keypad.closest("p") !== null),
    keypads: keypads.map((keypad) =>
      [...keypad.querySelectorAll<HTMLElement>("[data-keypad-key]")].map(
        (key) => key.dataset["keypadKey"] ?? "",
      ),
    ),
    mathAnswer: document.querySelector('[data-slot="alpha-math-entry-answer"]') !== null,
    mathEntry: document.querySelector('[data-slot="alpha-math-entry"]') !== null,
  };
};
