/**
 * The names the server gives a Choice's options (`optionName` and `choiceLabel` in
 * `#plate/ui/picks/names.ts`), against rules written here apart from the code: AlphaTest's player
 * named an option by its label and then its content's text ("A. 1250 × 2 4 × 60"), and Chrome reads
 * neither the theme's counter nor a formula into a name it computes from the `label` around the
 * control, so the server must write such a name itself.
 *
 * Over every content the generator draws (text, formulas with and without `alttext`, a fraction,
 * an `maction`, a semantics' annotation, a picture with and without `alt`, nested in a paragraph),
 * every place among one to thirty options and every label class an author can write, alone or
 * with others:
 *
 * - **said:** where the option carries a label or its content shows a formula, its name is the label,
 *   then the content's text with each formula as its `alttext`, else its tokens' words one space
 *   apart, an `annotation` unread and an `maction` as its selected child;
 * - **left:** where the option carries no label and its content shows text and no formula, the server
 *   writes no name, and the `label` around the control names it;
 * - **nameless:** where the content says nothing, the name is the label, then "Choice n of count";
 * - **numbered:** the label is the place in the last label class's counter style, as CSS writes it
 *   (decimal; lower and upper alphabetic, Z then AA; CJK ideographic, 十 for ten, 一百零一 for 101,
 *   cjk-decimal from 10,000), then the last suffix class's text, a period by default; none without
 *   a label class or with `qti-labels-none`.
 *
 * Kills: a writing that reads no formula, one that ignores `alttext`, one that leaves the label out
 * of the name, one where the first label class in the theme's order wins, and one that writes 一十
 * for ten are each refused.
 *
 * @module
 */
import { assert, describe, it } from "@effect/vitest";
import { Option } from "effect";
import type { MathChild } from "#plate/content/mathml.ts";
import type { RedactedNode } from "#plate/model/item.ts";
import { choiceLabel, optionName } from "#plate/ui/picks/names.ts";

/**
 * The two functions the rules hold.
 */
interface Writing {
  readonly label: typeof choiceLabel;
  readonly name: typeof optionName;
}

/**
 * A MathML element of a formula.
 *
 * @param local Its local name.
 * @param children Its children.
 * @param attributes Its attributes.
 * @returns The element.
 */
const ml = (
  local: string,
  children: readonly MathChild<RedactedNode>[],
  attributes: readonly { readonly name: string; readonly value: string }[] = [],
): MathChild<RedactedNode> => ({ attributes, children, kind: "element", local });

/**
 * A token of a formula.
 *
 * @param local Its local name: `mn`, `mo`, `mi` or `mtext`.
 * @param text Its text.
 * @returns The token.
 */
const token = (local: string, text: string): MathChild<RedactedNode> =>
  ml(local, [{ kind: "text", text }]);

/**
 * A formula of the content, and the words its tokens say.
 */
interface Formula {
  readonly node: RedactedNode;
  readonly says: string;
}

/**
 * A formula: its children, and its `alttext` where it has one, which it then says.
 *
 * @param children Its children.
 * @param tokens The words its tokens say, in order.
 * @param alttext Its `alttext`, none where it has none.
 * @returns The formula.
 */
const formula = (
  children: readonly MathChild<RedactedNode>[],
  tokens: readonly string[],
  alttext?: string,
): Formula => ({
  node: {
    element: "math",
    kind: "content",
    node: {
      attributes: alttext === undefined ? [] : [{ name: "alttext", value: alttext }],
      children,
      kind: "element",
      local: "math",
    },
    path: "math",
  },
  says: alttext ?? tokens.join(" "),
});

/**
 * The formulas the generator draws from: a fraction of products with TeX's no-break space in its
 * numerator, the corpus's own; a sum; an `maction` whose selection names its second child; a
 * `semantics` with a TeX annotation; and the sum with an `alttext`.
 */
const formulas: readonly Formula[] = [
  formula(
    [
      ml("mfrac", [
        ml("mrow", [token("mn", "1250"), token("mo", "×"), token("mn", "2"), token("mtext", " ")]),
        ml("mrow", [token("mn", "4"), token("mo", "×"), token("mn", "60")]),
      ]),
    ],
    ["1250", "×", "2", "4", "×", "60"],
  ),
  formula([token("mi", "x"), token("mo", "+"), token("mn", "1")], ["x", "+", "1"]),
  formula(
    [ml("maction", [token("mn", "3"), token("mn", "7")], [{ name: "selection", value: "2" }])],
    ["7"],
  ),
  formula(
    [
      ml("semantics", [
        ml("mrow", [token("mn", "2"), token("mo", "÷"), token("mn", "5")]),
        ml(
          "annotation",
          [{ kind: "text", text: "2\\div 5" }],
          [{ name: "encoding", value: "application/x-tex" }],
        ),
      ]),
    ],
    ["2", "÷", "5"],
  ),
  formula([token("mi", "x"), token("mo", "+"), token("mn", "1")], [], "x plus one"),
];

/**
 * A paragraph holding content.
 *
 * @param children Its children.
 * @returns The paragraph.
 */
const paragraph = (children: readonly RedactedNode[]): RedactedNode => ({
  attributes: [],
  children,
  kind: "element",
  path: "p",
  tag: "p",
});

/**
 * A picture, with its `alt` where it has one.
 *
 * @param alt Its `alt`, none where it has none.
 * @returns The picture.
 */
const picture = (alt?: string): RedactedNode => ({
  attributes: [
    { name: "src", value: "p.png" },
    ...(alt === undefined ? [] : [{ name: "alt", value: alt }]),
  ],
  children: [],
  kind: "element",
  path: "img",
  tag: "img",
});

/**
 * One option's content, and what the rules say of it: the text it says, each formula as it says
 * it; whether it shows a formula; and whether a name computed from the `label` around it is whole,
 * which it is where it shows text outside its formulas, or a picture's `alt`.
 */
interface Content {
  readonly computed: boolean;
  readonly nodes: readonly RedactedNode[];
  readonly says: string;
  readonly shows: boolean;
}

/**
 * Every content the properties are checked on: each formula alone, in a paragraph, and between
 * words; words alone; a picture with and without `alt`; and nothing.
 */
const contents: readonly Content[] = [
  ...formulas.flatMap((each): readonly Content[] => [
    { computed: false, nodes: [each.node], says: each.says, shows: true },
    { computed: false, nodes: [paragraph([each.node])], says: each.says, shows: true },
    {
      computed: true,
      nodes: [
        paragraph([{ kind: "text", text: "Is " }, each.node, { kind: "text", text: " right?" }]),
      ],
      says: `Is ${each.says} right?`,
      shows: true,
    },
  ]),
  {
    computed: true,
    nodes: [{ kind: "text", text: " Ant  hill " }],
    says: "Ant hill",
    shows: false,
  },
  { computed: true, nodes: [picture("A bee")], says: "A bee", shows: false },
  { computed: false, nodes: [picture()], says: "", shows: false },
  { computed: false, nodes: [], says: "", shows: false },
];

/**
 * The places, written apart from the code: CSS's decimal, alphabetic and CJK ideographic numerals
 * of the places a label is checked at.
 */
const numerals: readonly (readonly [number, string, string, string])[] = [
  [1, "1", "A", "一"],
  [2, "2", "B", "二"],
  [9, "9", "I", "九"],
  [10, "10", "J", "十"],
  [11, "11", "K", "十一"],
  [19, "19", "S", "十九"],
  [20, "20", "T", "二十"],
  [21, "21", "U", "二十一"],
  [26, "26", "Z", "二十六"],
  [27, "27", "AA", "二十七"],
  [52, "52", "AZ", "五十二"],
  [53, "53", "BA", "五十三"],
  [100, "100", "CV", "一百"],
  [101, "101", "CW", "一百零一"],
  [110, "110", "DF", "一百一十"],
  [702, "702", "ZZ", "七百零二"],
  [703, "703", "AAA", "七百零三"],
  [1001, "1001", "ALM", "一千零一"],
  [1010, "1010", "ALV", "一千零一十"],
  [9999, "9999", "NTO", "九千九百九十九"],
  [10_000, "10000", "NTP", "一〇〇〇〇"],
];

/**
 * The class lists an author writes on a Choice's root, each with the style and suffix the rules
 * give it: the style the last label class names, the suffix the last suffix class names or a
 * period; no label with no label class or with `qti-labels-none`.
 */
const classLists: readonly (readonly [
  string | undefined,
  "alpha" | "cjk" | "decimal" | "lower" | undefined,
  string,
])[] = [
  [undefined, undefined, ""],
  ["qti-orientation-vertical", undefined, ""],
  ["qti-labels-decimal", "decimal", "."],
  ["qti-labels-lower-alpha", "lower", "."],
  ["qti-labels-upper-alpha", "alpha", "."],
  ["qti-labels-cjk-ideographic", "cjk", "."],
  ["qti-labels-upper-alpha qti-labels-suffix-parenthesis", "alpha", ")"],
  ["qti-labels-decimal  qti-labels-suffix-none", "decimal", ""],
  ["qti-labels-suffix-none qti-labels-suffix-period qti-labels-decimal", "decimal", ""],
  ["qti-labels-upper-alpha qti-labels-decimal", "alpha", "."],
  ["qti-labels-cjk-ideographic qti-labels-lower-alpha", "cjk", "."],
  ["qti-labels-upper-alpha qti-labels-none", undefined, ""],
  ["qti-labels-suffix-parenthesis", undefined, ""],
];

/**
 * Check every property through a writing.
 *
 * @param writing The writing.
 * @returns Each broken property's name, with the first case it broke on.
 */
const broken = (writing: Writing): ReadonlyMap<string, string> => {
  const breaks = new Map<string, string>();
  const report = (name: string, what: string): void => {
    if (!breaks.has(name)) {
      breaks.set(name, what);
    }
  };

  for (const [classes, style, suffix] of classLists) {
    for (const [n, decimal, upper, cjk] of numerals) {
      const numeral = { alpha: upper, cjk, decimal, lower: upper.toLowerCase() };
      const expected = style === undefined ? undefined : `${numeral[style]}${suffix}`;
      const label = writing.label(Option.fromUndefinedOr(classes), n);

      if (Option.getOrUndefined(label) !== expected) {
        report(
          "numbered",
          `${String(classes)} at ${String(n)}: ${String(Option.getOrUndefined(label))}, not ${String(expected)}`,
        );
      }
    }
  }

  for (const content of contents) {
    for (const count of [1, 4, 30]) {
      for (const [labelled, label] of [
        [false, undefined],
        [true, "B."],
      ] as const) {
        const n = Math.min(2, count);
        const name = writing.name(content.nodes, { count, n }, Option.fromUndefinedOr(label), "en");
        const prefix = label === undefined ? "" : `${label} `;
        const written = JSON.stringify(name);

        if (content.says === "") {
          if (name !== `${prefix}Choice ${String(n)} of ${String(count)}`) {
            report("nameless", `${written} for content that says nothing`);
          }
        } else if (labelled || content.shows || !content.computed) {
          if (name !== `${prefix}${content.says}`) {
            report("said", `${written}, not ${JSON.stringify(`${prefix}${content.says}`)}`);
          }
        } else if (name !== undefined) {
          report("left", `${written} for ${JSON.stringify(content.says)}`);
        }
      }
    }
  }

  return breaks;
};

/**
 * Remove a formula's `alttext` and every formula of content, for the mutants.
 *
 * @param nodes The content.
 * @param drop Whether to drop each formula whole, else its `alttext` alone.
 * @returns The content changed.
 */
const withoutFormulas = (nodes: readonly RedactedNode[], drop: boolean): readonly RedactedNode[] =>
  nodes.flatMap((node): readonly RedactedNode[] => {
    if (node.kind === "content" && node.element === "math") {
      return drop
        ? []
        : [
            {
              ...node,
              node: {
                ...node.node,
                attributes: node.node.attributes.filter(({ name }) => name !== "alttext"),
              },
            },
          ];
    }

    return node.kind === "element"
      ? [{ ...node, children: withoutFormulas(node.children, drop) }]
      : [node];
  });

/**
 * The label classes that name a counter style, in the order plate's theme declares them.
 */
const styleClasses: readonly string[] = [
  "qti-labels-decimal",
  "qti-labels-lower-alpha",
  "qti-labels-upper-alpha",
  "qti-labels-cjk-ideographic",
];

/**
 * The writing as plate writes it.
 */
const plate: Writing = { label: choiceLabel, name: optionName };

describe("the names the server gives a Choice's options", () => {
  it("names an option by its label and its content's text, each formula as it says it, wherever Chrome would compute a name short of it", () => {
    assert.deepStrictEqual(Object.fromEntries(broken(plate)), {});
  });

  it.each([
    [
      "no formula read",
      "said",
      {
        ...plate,
        name: (content, place, label, locale) =>
          optionName(withoutFormulas(content, true), place, label, locale),
      },
    ],
    [
      "alttext ignored",
      "said",
      {
        ...plate,
        name: (content, place, label, locale) =>
          optionName(withoutFormulas(content, false), place, label, locale),
      },
    ],
    [
      "the label left out of the name",
      "said",
      {
        ...plate,
        name: (content, place, _label, locale) => optionName(content, place, Option.none(), locale),
      },
    ],
    [
      "the first label class wins",
      "numbered",
      {
        ...plate,
        label: (classes, n) =>
          choiceLabel(
            classes.pipe(
              Option.map((written) => {
                const tokens = written.split(" ");
                const first = styleClasses.find((style) => tokens.includes(style));

                return tokens
                  .filter((each) => each === first || !styleClasses.includes(each))
                  .join(" ");
              }),
            ),
            n,
          ),
      },
    ],
    [
      "一十 for ten",
      "numbered",
      {
        ...plate,
        label: (classes, n) =>
          choiceLabel(classes, n).pipe(
            Option.map((written) => (written.startsWith("十") ? `一${written}` : written)),
          ),
      },
    ],
  ] as const satisfies readonly (readonly [string, string, Writing])[])(
    "refuses a mutant: %s (%s)",
    (_name, property, writing) => {
      assert.include([...broken(writing).keys()], property);
    },
  );
});
