/**
 * An Inline Choice's trigger is as wide as its widest choice (`plate-inline-choice-face` in
 * `#plate/ui/inline-choice/inline-choice.tsx`), as AlphaTest's native select was, so a pick never
 * changes its width or moves the sentence around it. Over Inline Choices of one to four choices of
 * every length, each prompt, and every state the trigger can show (nothing picked, each choice
 * picked), the island's server markup holds:
 *
 * - **one face:** the trigger holds exactly one face, holding what it shows and its sizers alone;
 * - **sized:** the face holds, after what it shows, one sizer for the prompt and one per choice in
 *   display order, each the choice's content, whatever is picked;
 * - **unheard:** every sizer is hidden from assistive technology, and what the face shows is not;
 * - **shown:** what the face shows is the picked choice's content, or the prompt while none is.
 *
 * The browser's half, that a face so built takes its widest child's width, is the stylesheet's
 * grid (`base.css`), measured on the page in headless Chrome.
 *
 * Kills: a writing that sizes the trigger by the pick alone, one whose sizers a screen reader
 * reads, and one that leaves the prompt out are each refused.
 *
 * @module
 */
import { assert, describe, it } from "@effect/vitest";
import type { LiteElement, LiteNode } from "mathjax-full/js/adaptors/lite/Element.js";
import { liteAdaptor } from "mathjax-full/js/adaptors/liteAdaptor.js";
import { renderToStaticMarkup } from "react-dom/server";
import { bareRoot } from "#plate/test/roots.ts";
import { InlineChoice } from "#plate/ui/inline-choice/inline-choice.tsx";
import { Responses } from "#plate/ui/responses.tsx";

/**
 * The adaptor the suite reads the markup through.
 */
const adaptor = liteAdaptor();

/**
 * Choice texts of lengths far apart, a word to a long clause.
 */
const pool = [
  "is lost",
  "does not want to leave the warm house on a cold winter morning",
  "is eager",
  "feels proud of the work she has finished",
  "runs",
] as const;

/**
 * The prompts a trigger shows while nothing is picked: the catalog's, and one longer than any
 * choice.
 */
const prompts = [
  "Choose",
  "Choose the phrase that best completes the sentence about the character",
];

/**
 * One case: the choices' texts in display order, the prompt, and the pick, none for nothing
 * picked.
 */
interface Case {
  readonly pick: string | undefined;
  readonly prompt: string;
  readonly texts: readonly string[];
}

/**
 * Every case: one to four choices, each rotation of the pool, each prompt, and each state.
 */
const cases: readonly Case[] = [1, 2, 3, 4].flatMap((count) =>
  pool.flatMap((_, start) => {
    const texts = Array.from(
      { length: count },
      (__, index) => pool[(start + index) % pool.length] ?? "",
    );

    return prompts.flatMap((prompt) =>
      [undefined, ...texts].map((pick) => ({ pick, prompt, texts })),
    );
  }),
);

/**
 * The identifier of a choice at a place.
 *
 * @param index Its place.
 * @returns Its identifier.
 */
const identifierAt = (index: number): string => `C${String(index)}`;

/**
 * Render a case's island, inside the `<Responses>` it reads its response from, named by
 * `aria-label` and posting as `i.R`, each choice's text its own label.
 *
 * @param inline The case.
 * @returns The island's server markup, read into a tree.
 */
const render = (inline: Case): LiteElement => {
  const picked = inline.pick === undefined ? -1 : inline.texts.indexOf(inline.pick);
  const markup = renderToStaticMarkup(
    <Responses
      value={picked === -1 ? [] : [["i.R", identifierAt(picked)]]}
      onChange={() => {
        // A server render calls no handler.
      }}
    >
      <InlineChoice
        choices={inline.texts.map((text, index) => ({
          content: text,
          identifier: identifierAt(index),
          label: text,
        }))}
        labels={{ prompt: inline.prompt }}
        name="i.R"
        required={false}
        root={bareRoot}
        trigger={{ kind: "named", naming: { "aria-label": "Answer" } }}
      />
    </Responses>,
  );

  return adaptor.body(adaptor.parse(`<body>${markup}</body>`, "text/html"));
};

/**
 * Give the elements under a node whose `data-slot` is a name.
 *
 * @param node The node.
 * @param slot The name.
 * @returns The elements, in document order.
 */
const slotted = (node: LiteElement, slot: string): readonly LiteElement[] =>
  [...adaptor.tags(node, "span"), ...adaptor.tags(node, "button")].filter(
    (element) => adaptor.getAttribute(element, "data-slot") === slot,
  );

/**
 * A writing's markup, after a change a mutant makes to its face.
 */
type Mutation = (face: LiteElement, inline: Case) => void;

/**
 * Check every property over every case, the face changed by a mutation.
 *
 * @param mutation The change, none for plate's writing.
 * @returns Each broken property's name, with the first case it broke on.
 */
const broken = (mutation?: Mutation): ReadonlyMap<string, string> => {
  const breaks = new Map<string, string>();
  const report = (name: string, inline: Case, what: string): void => {
    if (!breaks.has(name)) {
      breaks.set(name, `${inline.texts.join(" | ")}, ${String(inline.pick)}: ${what}`);
    }
  };

  for (const inline of cases) {
    const page = render(inline);
    const triggers = slotted(page, "select-trigger");
    const faces = triggers.flatMap((trigger) => slotted(trigger, "plate-inline-choice-face"));
    const [face] = faces;

    if (triggers.length !== 1 || faces.length !== 1 || face === undefined) {
      report(
        "one face",
        inline,
        `${String(triggers.length)} triggers, ${String(faces.length)} faces`,
      );
      continue;
    }

    mutation?.(face, inline);

    const children = adaptor
      .childNodes(face)
      .filter((node: LiteNode): node is LiteElement => "children" in node);
    const [value, ...sizers] = children;
    const sizerTexts = sizers.map((sizer) => adaptor.textContent(sizer));

    if (
      value === undefined ||
      adaptor.getAttribute(value, "data-slot") !== "select-value" ||
      sizers.some(
        (sizer) => adaptor.getAttribute(sizer, "data-slot") !== "plate-inline-choice-sizer",
      )
    ) {
      report("one face", inline, "the face holds more than its value and its sizers");
      continue;
    }

    if (sizerTexts.join("\n") !== [inline.prompt, ...inline.texts].join("\n")) {
      report("sized", inline, `sized by ${sizerTexts.join(" | ")}`);
    }

    if (
      sizers.some((sizer) => adaptor.getAttribute(sizer, "aria-hidden") !== "true") ||
      adaptor.hasAttribute(value, "aria-hidden")
    ) {
      report("unheard", inline, "a sizer is heard, or the value is not");
    }

    if (adaptor.textContent(value) !== (inline.pick ?? inline.prompt)) {
      report("shown", inline, `shows ${adaptor.textContent(value)}`);
    }
  }

  return breaks;
};

describe("an Inline Choice's trigger as wide as its widest choice", () => {
  it("holds one face that shows the pick or the prompt, beside the prompt and every choice hidden from the eye and the ear", () => {
    assert.deepStrictEqual(Object.fromEntries(broken()), {});
  });

  it.each([
    [
      "the trigger sized by the pick alone",
      "sized",
      (face: LiteElement, inline: Case) => {
        for (const sizer of slotted(face, "plate-inline-choice-sizer")) {
          if (adaptor.textContent(sizer) !== (inline.pick ?? inline.prompt)) {
            adaptor.remove(sizer);
          }
        }
      },
    ],
    [
      "the sizers read by a screen reader",
      "unheard",
      (face: LiteElement) => {
        for (const sizer of slotted(face, "plate-inline-choice-sizer")) {
          adaptor.removeAttribute(sizer, "aria-hidden");
        }
      },
    ],
    [
      "the prompt left out",
      "sized",
      (face: LiteElement) => {
        const [prompt] = slotted(face, "plate-inline-choice-sizer");

        if (prompt !== undefined) {
          adaptor.remove(prompt);
        }
      },
    ],
  ] as const)("refuses a mutant: %s (%s)", (_name, property, mutation) => {
    assert.include([...broken(mutation).keys()], property);
  });
});
