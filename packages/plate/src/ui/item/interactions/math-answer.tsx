/**
 * A math entry's answer in a review, drawn as math: the LaTeX the field posted, as MathLive reads
 * it into MathML (`convertLatexToMathMl` of `mathlive/ssr`, the field's own reader, so the review
 * shows what the field showed), written element for element in the MathML namespace, which the
 * engines lay out natively and a screen reader voices.
 *
 * The answer is the candidate's, and MathLive writes a `\text`'s characters into its MathML as they
 * are, `<` and all (0.105.3), so the MathML is never markup the page takes as written: it is read
 * as XML (`readXml` of crust), and only MathML 3's elements are written, each with only its own
 * attributes of MathML 3's (`elementAttributes` of `#plate/content/mathml-attributes.ts`), none of
 * those every element shares (`class`, `href`, `id`, `xref`, `other`, `cdbase`) and none that names
 * a URL, every text as React writes text. An element of any other name is dropped with all it
 * holds, so no HTML element stands inside the `math`, where the HTML parser would take one out of
 * MathML. An answer whose MathML is no XML, or that MathLive cannot read, is shown as the text it
 * is.
 *
 * Server-only: the server shell's Text Entry review imports it, and no island does.
 *
 * @module
 */
import { readXml } from "@qti-pie/crust/read.ts";
import type { Child, Element } from "@qti-pie/crust/tree.ts";
import { Effect, Option } from "effect";
import { convertLatexToMathMl } from "mathlive/ssr";
import { createElement } from "react";
import type { ReactNode } from "react";
import { elementAttributes } from "#plate/content/mathml-attributes.ts";
import { mathmlNamespace } from "#plate/document/source.ts";

/**
 * The attributes no answer's element is written with: those every MathML element shares, which
 * name, link or class it, and those that name a URL a browser would fetch.
 */
const withheld: ReadonlySet<string> = new Set([
  "altimg",
  "cdbase",
  "class",
  "definitionURL",
  "href",
  "id",
  "other",
  "src",
  "xref",
]);

/**
 * Give the attributes an answer's element is written with: each MathML 3 admits on it but the
 * {@link withheld}, in document order.
 *
 * @param element The element.
 * @returns The props.
 */
const propsOf = (element: Element): Readonly<Record<string, string>> =>
  Object.fromEntries(
    element.attributes
      .filter(
        ({ local, namespace }) =>
          namespace === "" &&
          !withheld.has(local) &&
          (elementAttributes.get(element.local)?.has(local) ?? false),
      )
      .map(({ local, value }) => [local, value]),
  );

/**
 * Write the children of an answer's element: each text as text, each MathML 3 element of the
 * MathML namespace as an element, and nothing else.
 *
 * @param children The children.
 * @returns The nodes.
 */
const nodesOf = (children: readonly Child[]): readonly ReactNode[] =>
  children.flatMap((child, index): readonly ReactNode[] => {
    if (child.kind === "text") {
      return [child.value];
    }

    return child.kind === "element" &&
      child.namespace === mathmlNamespace &&
      elementAttributes.has(child.local)
      ? [
          createElement(
            child.local,
            // The children are the MathML's own, in document order, and never reorder.
            { ...propsOf(child), key: index },
            ...nodesOf(child.children),
          ),
        ]
      : [];
  });

/**
 * Read an answer's LaTeX into the `math` element a review writes, as MathLive reads it.
 *
 * @param latex The answer.
 * @returns The `math` element, none when MathLive cannot read the answer or its MathML is no XML.
 */
const formulaOf = (latex: string): Option.Option<Element> =>
  Effect.runSync(
    Effect.try(() => convertLatexToMathMl(latex)).pipe(
      Effect.flatMap((mathml) =>
        readXml(
          new TextEncoder().encode(
            `<math xmlns="${mathmlNamespace}" display="inline">${mathml}</math>`,
          ),
        ),
      ),
      Effect.map((document) => document.root),
      Effect.option,
    ),
  );

/**
 * Draw a math entry's answer: the `plate-math-entry-answer` part, a `span` holding the answer's
 * `math`, inline in the sentence but in display style, so a fraction stands as tall as the field
 * drew it, or its text where MathLive cannot draw it (the module's rules).
 *
 * @param latex The answer, as the field posted it.
 * @returns The part.
 */
export const MathAnswer = ({ latex }: { readonly latex: string }): ReactNode => (
  <span data-slot="plate-math-entry-answer">
    {Option.match(formulaOf(latex), {
      onNone: () => latex,
      onSome: (formula) =>
        createElement(
          "math",
          { display: "inline", displaystyle: "true" },
          ...nodesOf(formula.children),
        ),
    })}
  </span>
);
