/**
 * A formula of a Portable Custom Interaction's markup as plate's server shell writes it (`authored`
 * in `#plate/ui/item/contents/mathml.tsx`, which the walk takes there by `Formulas` of
 * `#plate/ui/item/context.ts`): exactly as its author wrote it, each element by its MathML name
 * with every attribute plate writes on it, at its value and in the author's order, and each text
 * as written, with nothing of plate's around it or on it: no drawing, no element added, no name.
 * Its one addition is an `annotation`'s `aria-hidden`, as plate hides an annotation everywhere. The
 * module's frame shows it with the browser's own MathML, as the module reads it.
 *
 * The property is checked on formulas a seeded generator draws from presentation MathML: tokens,
 * rows, fractions, roots, scripts, under- and overscripts, tables, enclosures, padding, phantoms,
 * spaces, styles and `semantics` beside a TeX annotation, each element with attributes MathML 3
 * gives it, and texts holding the characters a writer escapes. It is held against the formula
 * written apart from plate's writer ({@link written}).
 *
 * Kills, each a writer in place of plate's that the property refuses:
 *
 * - Plate's drawn formula (`content` of the same file), MathJax's drawing beside the formula, the
 *   writing a PCI's markup had before its formulas were written as authored;
 * - A writer that drops the attributes;
 * - A writer that wraps the formula's content in an `mrow`.
 *
 * @module
 */
import { assert, describe, it } from "@effect/vitest";
import { Option } from "effect";
import type { ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { elementAttributes } from "#plate/content/mathml-attributes.ts";
import type { MathAttribute, MathChild, MathElement, MathNode } from "#plate/content/mathml.ts";
import type { RedactedLevel, RedactedNode } from "#plate/model/item.ts";
import { noSlots, noSpoken } from "#plate/ui/item/content.tsx";
import type { ContentWalk } from "#plate/ui/item/content.tsx";
import { authored, content } from "#plate/ui/item/contents/mathml.tsx";

/**
 * A formula of the suite: the `math` element's tree, as the redacted body holds it.
 */
type Formula = MathNode<RedactedLevel>;

/**
 * A child of a formula's tree.
 */
type Child = MathChild<RedactedNode>;

/**
 * An element of a formula's tree.
 */
type Element = MathElement<RedactedNode>;

/**
 * A way to write a formula: plate's, or a kill's.
 */
type Writer = (formula: Formula) => ReactNode;

/**
 * The walk a PCI's markup stands in: its formulas written as authored, its item's instance and
 * location, no slots and nothing read aloud.
 */
const markup: ContentWalk = {
  key: "formula",
  nodes: () => [],
  walk: {
    addressing: {
      assets: new Map(),
      document: "items/markup.xml",
      instance: "markup",
      writing: "original",
    },
    credit: Option.none(),
    formulas: "authored",
    headingOffset: 0,
    locale: "en",
    scope: { kind: "plain" },
    slots: noSlots,
    spoken: noSpoken,
    standing: "flow",
  },
};

/**
 * Plate's writer of a PCI's markup's formula.
 *
 * @param formula The formula.
 * @returns What the server shell writes.
 */
const plates: Writer = (formula) =>
  authored({ element: "math", kind: "content", payload: formula }, markup);

/**
 * Plate's drawn formula, as it writes one outside a PCI's markup: the first kill.
 *
 * @param formula The formula.
 * @returns What the server shell writes for a formula of the body.
 */
const drawn: Writer = (formula) =>
  content({ element: "math", kind: "content", payload: formula }, markup);

/**
 * Drop every attribute of an element and its descendants.
 *
 * @param element The element.
 * @returns It, with its descendants, every attribute dropped.
 */
const bare = (element: Element): Element => ({
  ...element,
  attributes: [],
  children: element.children.map((child) => (child.kind === "element" ? bare(child) : child)),
});

/**
 * A writer that drops the attributes: the second kill.
 *
 * @param formula The formula.
 * @returns Plate's writing of the formula with none of its attributes.
 */
const dropsAttributes: Writer = (formula) =>
  plates({
    ...formula,
    attributes: [],
    children: formula.children.map((child) => (child.kind === "element" ? bare(child) : child)),
  });

/**
 * A writer that wraps the formula's content in an `mrow`: the third kill.
 *
 * @param formula The formula.
 * @returns Plate's writing of the formula with its children in one more row.
 */
const wrapsInRow: Writer = (formula) =>
  plates({
    ...formula,
    children: [{ attributes: [], children: formula.children, kind: "element", local: "mrow" }],
  });

/**
 * Escape a text or an attribute's value as the server's HTML writes it.
 *
 * @param text The text.
 * @returns It, each `&`, `<`, `>` and `"` as its character reference.
 */
const escaped = (text: string): string =>
  text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");

/**
 * Write an element's attributes as its author wrote them.
 *
 * @param attributes The attributes, in the author's order.
 * @returns Each as ` name="value"`.
 */
const writtenAttributes = (attributes: readonly MathAttribute[]): string =>
  attributes.map(({ name, value }) => ` ${name}="${escaped(value)}"`).join("");

/**
 * Write one child of a formula as its author wrote it: an element with its attributes and its
 * children, an `annotation` hidden from assistive technology first, a text as it is. An
 * `annotation-xml`'s content is body content, which the walk writes; the suite's formulas hold
 * none.
 *
 * @param child The child.
 * @returns Its HTML.
 */
const writtenChild = (child: Child): string => {
  switch (child.kind) {
    case "annotation-xml": {
      return `<annotation-xml${writtenAttributes(child.attributes)}></annotation-xml>`;
    }
    case "element": {
      const hidden = child.local === "annotation" ? ' aria-hidden="true"' : "";

      return `<${child.local}${hidden}${writtenAttributes(child.attributes)}>${child.children.map(writtenChild).join("")}</${child.local}>`;
    }
    case "text": {
      return escaped(child.text);
    }
  }
};

/**
 * Write a formula as its author wrote it, apart from plate's writer: the property's oracle.
 *
 * @param formula The formula.
 * @returns Its HTML.
 */
const written = (formula: Formula): string =>
  `<math${writtenAttributes(formula.attributes)}>${formula.children.map(writtenChild).join("")}</math>`;

/**
 * A seeded source of choices (Park and Miller's minimal standard generator), so a failing formula
 * is drawn again from its seed.
 */
interface Chance {
  /**
   * Draw a whole number.
   *
   * @param bound The bound.
   * @returns A number from 0 to `bound - 1`.
   */
  readonly below: (bound: number) => number;
  /**
   * Draw one of some values.
   *
   * @param values The values.
   * @returns One of them.
   */
  readonly pick: <A>(values: readonly [A, ...A[]]) => A;
}

/**
 * The generator's modulus, the Mersenne prime 2^31 - 1.
 */
const modulus = 2_147_483_647;

/**
 * The generator's multiplier.
 */
const multiplier = 48_271;

/**
 * Make a seeded source of choices.
 *
 * @param seed The seed, from 1.
 * @returns The source.
 */
const chanceOf = (seed: number): Chance => {
  let state = seed % modulus;
  const below = (bound: number): number => {
    state = (state * multiplier) % modulus;

    return state % bound;
  };

  return { below, pick: (values) => values[below(values.length)] ?? values[0] };
};

/**
 * The attributes the generator gives each element it draws, each with the values it draws from:
 * MathML 3's own for that element (§3), and `class`, which every element takes.
 */
const drawnAttributes: ReadonlyMap<
  string,
  readonly (readonly [string, readonly [string, ...string[]]])[]
> = new Map([
  [
    "math",
    [
      ["display", ["block", "inline"]],
      ["class", ["formula", "a b"]],
    ],
  ],
  [
    "mi",
    [
      ["mathvariant", ["normal", "bold", "double-struck"]],
      ["mathcolor", ["red", "#c00"]],
    ],
  ],
  [
    "mn",
    [
      ["mathvariant", ["bold", "italic"]],
      ["mathsize", ["big", "1.2em"]],
    ],
  ],
  [
    "mo",
    [
      ["stretchy", ["true", "false"]],
      ["fence", ["true"]],
      ["lspace", ["0", "0.2em"]],
      ["form", ["prefix", "infix", "postfix"]],
    ],
  ],
  [
    "mtext",
    [
      ["mathvariant", ["normal", "italic"]],
      ["class", ["words"]],
    ],
  ],
  [
    "mrow",
    [
      ["class", ["group"]],
      ["dir", ["ltr", "rtl"]],
    ],
  ],
  [
    "mfrac",
    [
      ["linethickness", ["0", "2px", "thick"]],
      ["bevelled", ["true"]],
    ],
  ],
  ["msqrt", [["mathcolor", ["blue"]]]],
  ["mroot", [["mathbackground", ["yellow"]]]],
  ["msup", [["superscriptshift", ["1ex"]]]],
  ["msub", [["subscriptshift", ["0.5ex"]]]],
  [
    "msubsup",
    [
      ["subscriptshift", ["0.5ex"]],
      ["superscriptshift", ["1ex"]],
    ],
  ],
  ["munder", [["accentunder", ["true", "false"]]]],
  ["mover", [["accent", ["true", "false"]]]],
  [
    "munderover",
    [
      ["accent", ["true"]],
      ["accentunder", ["false"]],
    ],
  ],
  [
    "mstyle",
    [
      ["displaystyle", ["true", "false"]],
      ["scriptlevel", ["0", "+1", "-1"]],
    ],
  ],
  ["menclose", [["notation", ["box", "circle", "updiagonalstrike longdiv"]]]],
  [
    "mpadded",
    [
      ["width", ["+1em"]],
      ["lspace", ["0.5em"]],
    ],
  ],
  ["mphantom", [["class", ["hidden"]]]],
  [
    "mspace",
    [
      ["width", ["1em", "0.5em"]],
      ["height", ["1ex"]],
      ["depth", ["0.5ex"]],
    ],
  ],
  [
    "mtable",
    [
      ["columnalign", ["left", "center right"]],
      ["rowspacing", ["0.5ex"]],
    ],
  ],
  ["mtr", [["rowalign", ["top", "baseline"]]]],
  [
    "mtd",
    [
      ["columnspan", ["2"]],
      ["columnalign", ["left"]],
    ],
  ],
  ["semantics", [["class", ["meaning"]]]],
  ["annotation", [["encoding", ["application/x-tex"]]]],
]);

/**
 * The texts a token holds: letters, digits, operators, and the characters a writer escapes.
 */
const texts: readonly [string, ...string[]] = ["x", "y", "12", "+", "−", "=", "<", "&", ">", "a&b"];

/**
 * Draw an element's attributes: each the generator gives it, half the time, at a drawn value.
 *
 * @param chance The source of choices.
 * @param local The element's local name.
 * @returns The attributes, in the generator's order.
 */
const attributesOf = (chance: Chance, local: string): readonly MathAttribute[] =>
  (drawnAttributes.get(local) ?? []).flatMap(([name, values]) =>
    chance.below(2) === 0 ? [] : [{ name, value: chance.pick(values) }],
  );

/**
 * Make an element of a drawn formula.
 *
 * @param chance The source of choices.
 * @param local Its local name.
 * @param children Its children.
 * @returns The element, with drawn attributes.
 */
const elementOf = (chance: Chance, local: string, children: readonly Child[]): Element => ({
  attributes: attributesOf(chance, local),
  children,
  kind: "element",
  local,
});

/**
 * Draw a token: an identifier, a number, an operator or text, holding one drawn text.
 *
 * @param chance The source of choices.
 * @returns The token.
 */
const tokenOf = (chance: Chance): Element =>
  elementOf(chance, chance.pick(["mi", "mn", "mo", "mtext"]), [
    { kind: "text", text: chance.pick(texts) },
  ]);

/**
 * Draw an element of presentation MathML, its depth bounded.
 *
 * @param chance The source of choices.
 * @param depth How many layers it may still hold below it.
 * @returns The element.
 */
const presentationOf = (chance: Chance, depth: number): Element => {
  if (depth === 0 || chance.below(4) === 0) {
    return tokenOf(chance);
  }

  const below = (count: number): readonly Child[] =>
    Array.from({ length: count }, () => presentationOf(chance, depth - 1));
  const local = chance.pick([
    "mrow",
    "mfrac",
    "msqrt",
    "mroot",
    "msup",
    "msub",
    "msubsup",
    "munder",
    "mover",
    "munderover",
    "mstyle",
    "menclose",
    "mpadded",
    "mphantom",
    "mspace",
    "mtable",
    "semantics",
  ]);

  switch (local) {
    case "mfrac":
    case "mroot":
    case "msub":
    case "msup":
    case "munder":
    case "mover": {
      return elementOf(chance, local, below(2));
    }
    case "msubsup":
    case "munderover": {
      return elementOf(chance, local, below(3));
    }
    case "mspace": {
      return elementOf(chance, local, []);
    }
    case "mtable": {
      return elementOf(
        chance,
        local,
        Array.from({ length: 1 + chance.below(2) }, () =>
          elementOf(
            chance,
            "mtr",
            Array.from({ length: 1 + chance.below(2) }, () =>
              elementOf(chance, "mtd", below(1 + chance.below(2))),
            ),
          ),
        ),
      );
    }
    case "semantics": {
      return elementOf(chance, local, [
        presentationOf(chance, depth - 1),
        elementOf(chance, "annotation", [
          { kind: "text", text: chance.pick(["x<1", "\\frac{1}{2}", "a&b"]) },
        ]),
      ]);
    }
    default: {
      return elementOf(chance, local, below(1 + chance.below(3)));
    }
  }
};

/**
 * Draw a formula: a `math` element holding one to three drawn elements, at most four layers deep.
 *
 * @param seed The seed.
 * @returns The formula.
 */
const formulaOf = (seed: number): Formula => {
  const chance = chanceOf(seed);

  return {
    attributes: attributesOf(chance, "math"),
    children: Array.from({ length: 1 + chance.below(3) }, () => presentationOf(chance, 4)),
    kind: "element",
    local: "math",
  };
};

/**
 * How many formulas the property draws.
 */
const formulaCount = 400;

/**
 * The drawn formulas, each by its seed.
 */
const formulas: readonly Formula[] = Array.from({ length: formulaCount }, (_, at) =>
  formulaOf(at + 1),
);

/**
 * Find the first drawn formula a writer writes otherwise than its author wrote it.
 *
 * @param writer The writer, plate's or a kill's.
 * @returns What it wrote, beside what the author wrote, none where it wrote every one as written.
 */
const brokenBy = (writer: Writer): Option.Option<string> =>
  Option.fromUndefinedOr(
    formulas
      .map((formula, at) => ({
        at,
        expected: written(formula),
        got: renderToStaticMarkup(writer(formula)),
      }))
      .find(({ expected, got }) => got !== expected),
  ).pipe(
    Option.map(({ at, expected, got }) => `seed ${String(at + 1)}:\n${got}\nwritten:\n${expected}`),
  );

/**
 * Each element and attribute a child of a formula holds, as `local` and `local@name`, and each
 * character a writer escapes that one of its texts holds.
 *
 * @param child The child, or the formula itself.
 * @returns What it and its descendants hold.
 */
const heldIn = (child: Child): readonly string[] => {
  switch (child.kind) {
    case "annotation-xml": {
      return ["annotation-xml"];
    }
    case "element": {
      return [
        child.local,
        ...child.attributes.map(({ name }) => `${child.local}@${name}`),
        ...child.children.flatMap((inner) => heldIn(inner)),
      ];
    }
    case "text": {
      return ["&", "<", ">"].filter((character) => child.text.includes(character));
    }
  }
};

/**
 * What the generator offers and no drawn formula holds: each element and attribute it gives, and
 * each character a writer escapes, so the property is checked on every one.
 */
const undrawn: readonly string[] = ((): readonly string[] => {
  const held = new Set(formulas.flatMap((formula) => heldIn(formula)));

  return [
    ...[...drawnAttributes].flatMap(([local, attributes]) => [
      local,
      ...attributes.map(([name]) => `${local}@${name}`),
    ]),
    "&",
    "<",
    ">",
  ].filter((offered) => !held.has(offered));
})();

/**
 * Every attribute the generator draws on an element that plate does not write on it: the
 * generator's own check, so a formula the property draws holds only attributes MathML 3 gives its
 * element.
 */
const unwritten: readonly string[] = [...drawnAttributes].flatMap(([local, attributes]) =>
  attributes
    .filter(([name]) => !(elementAttributes.get(local)?.has(name) ?? false))
    .map(([name]) => `${local}@${name}`),
);

describe("a formula of a PCI's markup", () => {
  it("draws only attributes plate writes on their elements", () => {
    assert.deepStrictEqual(unwritten, []);
  });

  it("draws every element and attribute the generator gives, and every character a writer escapes", () => {
    assert.deepStrictEqual(undrawn, []);
  });

  it(`is written exactly as its author wrote it, for ${String(formulaCount)} drawn formulas`, () => {
    const broken = brokenBy(plates);

    assert.isTrue(
      Option.isNone(broken),
      Option.getOrElse(broken, () => ""),
    );
  });

  it("refuses plate's drawn formula in its place", () => {
    assert.isTrue(
      Option.isSome(brokenBy(drawn)),
      "plate's drawn formula wrote every drawn formula as its author wrote it",
    );
  });

  it("refuses a writer that drops the attributes", () => {
    assert.isTrue(
      Option.isSome(brokenBy(dropsAttributes)),
      "a writer that drops the attributes wrote every drawn formula as its author wrote it",
    );
  });

  it("refuses a writer that wraps the formula's content in a row", () => {
    assert.isTrue(
      Option.isSome(brokenBy(wrapsInRow)),
      "a writer that wraps the content in a row wrote every drawn formula as its author wrote it",
    );
  });
});
