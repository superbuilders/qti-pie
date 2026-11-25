import { assert, describe, it } from "@effect/vitest";
import { drawn, explore } from "@bjornpagen/testing/explore";
import type { Kept, Oracle } from "@bjornpagen/testing/explore";
import { required } from "@bjornpagen/testing/features";
import { notesOnly } from "@bjornpagen/testing/sense";
import { completeShrink } from "@bjornpagen/testing/shrink";
import { searched } from "@bjornpagen/testing/vitest";
import { Effect, Formatter, Option, Result } from "effect";
import { composed } from "#pantry/grammar/compose.ts";
import { foldGrammarOf } from "#pantry/model/composed.ts";
import type { Composed } from "#pantry/model/composed.ts";
import { fold } from "#pantry/model/folds.ts";
import { closedName } from "#pantry/model/xdm.ts";
import type { ClosedName, ElementKind, XdmClosedElement, XdmDocument } from "#pantry/model/xdm.ts";
import { caseHang, familiesOf, featuresOf, xdmDocument } from "#pantry/test/gen/xdm.ts";
import type { GeneratedXdm, Placed, XdmFamily, XdmFeature } from "#pantry/test/gen/xdm.ts";
import { documentBreaches, lawNames, lawsOf } from "#pantry/test/oracle.ts";
import type { LawName } from "#pantry/test/oracle.ts";

/**
 * The composed grammar every property draws its trees over and folds them under.
 */
const grammar = Result.getOrThrow(composed());

/**
 * The relations the folds read, projected from the grammar once.
 */
const foldGrammar = foldGrammarOf(grammar);

/**
 * The host's law model: the oracle's tables over the grammar, derived once.
 */
const laws = lawsOf(grammar);

/**
 * The trees every property is checked over: the one generator's, over the composed grammar.
 */
const documents = xdmDocument(grammar);

/**
 * A law's verdict on a case, `law refuses`: noted for each law a case's rows break, so a search
 * counts the laws it reached as well as the trees it built.
 */
type LawVerdict = `${LawName} refuses`;

/**
 * What a search over generated trees notes: the generator's features, the (parent kind, child
 * kind) pairs a tree holds, and each law its rows break.
 */
type Situation = XdmFeature | XdmFamily | LawVerdict;

/**
 * The features a search over generated trees must reach on its witnesses.
 */
const reached = required<Situation>(
  [
    "element",
    "wildcard",
    "text",
    "ws",
    "comment",
    "pi",
    "entityRef",
    "attribute",
    "openName",
    "repeatedOpenClass",
    "doctype",
  ],
  { cases: 300, sense: notesOnly },
);

/**
 * Fold a document, which is total on the trees the generator builds.
 *
 * @param document - The tree.
 * @returns Its folded rows; a defect when the fold refuses it.
 */
const foldedOf = (document: XdmDocument<Composed>) =>
  Effect.orDie(Effect.fromResult(fold(document, foldGrammar)));

/**
 * An exploration of the generator's trees, with the settings every property here shares.
 *
 * @param suite - The suite's label.
 * @param oracle - What its property is checked against.
 * @returns The exploration's settings.
 */
const over = (suite: string, oracle: Oracle) =>
  ({
    caseHang,
    concurrency: 1,
    coverage: reached,
    draw: drawn(documents),
    kept: [],
    literal: Formatter.format,
    oracle,
    runs: 300,
    shrink: completeShrink,
    steerEvery: 16,
    suite,
  }) as const;

/**
 * The valid trees' oracle: the host's law model.
 */
const lawModelOracle: Oracle = {
  kind: "specification",
  name: "the host's law model (#pantry/test/oracle.ts) over trees built to meet its laws",
};

/**
 * The laws a generated tree is not built to meet, each with its reason: the generator constructs
 * the tree's shape, its order and its names, and leaves to fall where they fall the laws over what
 * it draws without reading (its lexical forms, identifiers and counts), and a package's laws, which
 * a document's breaches never evaluate. Every other law of the oracle holds on every generated
 * tree, a law added to the oracle included.
 */
const unconstructed = {
  "AL3 required": "the required attributes, which the generator draws a subset of",
  "AL5 attribute count": "spec readings 41 and 43's attribute counts",
  "Adaptive feedback":
    "an interaction's place under feedback in an item's mode, drawn without reading",
  "AreaMapping base type": "a declaration's base type, a value drawn without reading",
  Arity: "an operator's arity, a count of children the content automaton relaxes",
  "Binding cardinality": "a response binding, over identifiers drawn without reading",
  "Binding declared": "a response binding, over identifiers drawn without reading",
  BindingFit: "a response binding, over identifiers drawn without reading",
  "Card default entry":
    "a card's support (or a card entry's default), a value drawn without reading",
  "Card support": "a card's support (or a card entry's default), a value drawn without reading",
  "Catalog reference": "an IDREF's target kind, over values drawn without reading",
  "Choice bounds": "an interaction's choice counts, values drawn without reading",
  "Choice identifier key": "a choice's identifier, a value drawn without reading",
  "Choice not variable":
    "a choice's identifier against its document's declarations, values drawn without reading",
  "Condition type": "a condition's type, over expressions drawn without typing",
  "Context variable reference": "a reference, over identifiers drawn without reading",
  "Data SSML":
    "a data-ssml's JSON object (Data-SSML 1.0 §3.4, reading 177), a lexical form drawn without reading",
  "Declaration base type":
    "a declaration's base type against its cardinality, values drawn without reading",
  "Declaration key": "a declaration's identifier, a value drawn without reading",
  "Declaration not reserved": "a declaration's identifier, a value drawn without reading",
  "Document entry": "a package's law",
  "DocumentId key": "an ID's uniqueness, over values drawn without reading",
  "Equal tolerance":
    "a qti-equal's tolerance mode and values (reading 121), over lexical forms drawn without reading",
  "Feedback outcome type": "a reference, over identifiers drawn without reading",
  "Feedback reference": "a reference, over identifiers drawn without reading",
  "File listed": "a package's law",
  "Graphic gap match default hotspot": "the default hotspot's place among its siblings",
  "Href listed": "a package's law",
  "Idref target": "an IDREF's target, over values drawn without reading",
  "Label tools":
    "the item root's tool-name and tool-version, attributes the generator draws a subset of",
  "Literal lexical": "a base value's text against its base type, over text drawn without reading",
  LomObjectIdentifier: "a package's law",
  "Lookup table cardinality": "a declaration's cardinality, a value drawn without reading",
  "Lookup type": "a lookup's expression type and table, drawn without typing",
  MappableBaseType: "a declaration's base type, a value drawn without reading",
  "Mapped response": "a mapped response's declaration and tables, drawn without reading",
  "Mastery range": "a declaration's mastery and normal bounds, values drawn without reading",
  "MathML align first":
    "an alignment group's place in a table cell, which a generated tree draws without reading §3.5.5.2",
  "MathML align placement":
    "an alignment group's place in a table cell, which a generated tree draws without reading §3.5.5.2",
  "MathML arity": "an operator's arity, a count of children the content automaton relaxes",
  "MathML cn form":
    "a cn's type, base and text, values a generated tree draws without reading them",
  "MathML head qualifier":
    "an operator's qualifier children, which a generated tree draws without reading the operator's syntax table",
  "MathML maction selection":
    "an maction's selection and children, values a generated tree draws without reading them",
  "MathML share cycle":
    "a share's fragment and the elements it dominates, which a generated tree draws without reading §4.2.7",
  "Max strings required":
    "an extended text interaction's binding, over identifiers drawn without reading",
  "N6 ancestry":
    "the ancestry bans, which the generator does not read; a search of its own judges N6",
  "N7 Counted": "the counts of 2…n the content automaton relaxes",
  "N7 barred by": "the children an attribute bars",
  "N8 nearest":
    "its choice clause, a choice that writes its identifier in an interaction (reading 38), a place the generator draws without reading, as it draws N6's; fold's copy of the nearest interaction, its other clause, is the naive recomputation's",
  "One base": "an operator's operand types, over expressions drawn without typing",
  "Operand fit": "an operator's operand types, over expressions drawn without typing",
  "Outcome only": "a test operator's processing language, over expressions drawn without reading",
  "PCI module source": "a PCI's module forms, attributes and children drawn without reading",
  "Printed variable reference": "a reference, over identifiers drawn without reading",
  "Record field key": "a record value's field identifiers, values drawn without reading",
  RecordBindingFit: "a response binding, over identifiers drawn without reading",
  "Reference type": "a reference's declared type, over identifiers drawn without reading",
  "Reserved type":
    "a built-in variable's declared type, over identifiers and base types drawn without reading",
  RootOfType: "a package's law",
  "SSML lexicon reference": "a reference, over identifiers drawn without reading",
  "SSML trim mark": "a mark's name, a value drawn without reading",
  "Set type": "a setter's expression type, over expressions drawn without typing",
  "Slider bounds": "a slider's bounds, values drawn without reading",
  "Table headers":
    "a cell's header tokens against its table's th ids (reading 126), over identifiers drawn without reading",
  "Template reads": "what template processing reads, over identifiers drawn without reading",
  "Template reference": "a reference, over identifiers drawn without reading",
  "Template variable type": "a reference's declared type, over identifiers drawn without reading",
  TextDomain: "an element's value domain, over text drawn without reading",
  "Typed value": "a value's text against its base type, over text drawn without reading",
  "Usage typed value":
    "a usage value's text against its base type, over text drawn without reading",
  "Value cardinality":
    "a declaration's count of values against its cardinality, a count the content automaton relaxes",
  "Variable declared": "a reference, over identifiers drawn without reading",
  "Variable kind": "a reference's declaration kind, over identifiers drawn without reading",
  "default hotspot last slot": "the default hotspot's place among its siblings",
  "value domain": "an attribute's value domain, over lexical forms drawn without reading",
} as const satisfies Partial<Readonly<Record<LawName, string>>>;

/**
 * The laws a generated tree is built to meet: every law of the oracle (`lawNames`), its node,
 * attribute, character-data and overlay laws, but those {@link unconstructed} names.
 */
const constructed: ReadonlySet<LawName> = new Set(
  lawNames.filter((law) => !Object.hasOwn(unconstructed, law)),
);

/**
 * The encoding label of a hand-built tree, spelled as crust's reader reports it, so the tree is one
 * a read gives back.
 */
// oxlint-disable-next-line unicorn/text-encoding-identifier-case -- crust's reader reports the label as `UTF-8`.
const builtCharset = "UTF-8";

/**
 * An element of a hand-built tree: its kind, the closed attributes it writes, each with its lexical
 * form, and the elements it holds in order.
 */
interface Built {
  readonly attributes?: readonly (readonly [name: ClosedName<Composed>, lexical: string])[];
  readonly children?: readonly Built[];
  readonly kind: ElementKind<Composed>;
}

/**
 * Build a tree by hand, with the model of its shape the generator would have written for it: node 0
 * is the document, every other node follows in document order under its parent's number and its
 * own slot, and each interval closes with its subtree. The tree's root is `top`, which no generator
 * draw reaches, so a case of it fails only where its elements break a law.
 *
 * @param top - The root element.
 * @returns The tree, its model, the extent it measures as its bounds, and an empty swarm.
 */
const handBuilt = (top: Built): GeneratedXdm => {
  const model: Placed[] = [{ at: 0, end: 1, kind: "document", parent: 0, start: 0 }];
  const extent = { attributes: 0, depth: 0, width: 0 };
  const build = (
    { attributes = [], children = [], kind }: Built,
    place: { readonly at: number; readonly depth: number; readonly parent: number },
  ): XdmClosedElement<Composed> => {
    const start = model.length;
    model.push({ at: place.at, end: start + 1, kind, parent: place.parent, start });
    extent.attributes = Math.max(extent.attributes, attributes.length);
    extent.depth = Math.max(extent.depth, place.depth);
    extent.width = Math.max(extent.width, children.length);
    const held = children.map((child, at) =>
      build(child, { at, depth: place.depth + 1, parent: start }),
    );
    model[start] = { at: place.at, end: model.length, kind, parent: place.parent, start };

    return {
      _tag: "element",
      attributes: attributes.map(([name, lexical]) => ({
        lexical,
        name: closedName(name),
        references: [],
      })),
      children: held,
      governs: grammar.xsi.declaredType(kind),
      kind,
      namespaces: [],
      prefix: "",
    };
  };
  const root = build(top, { at: 0, depth: 1, parent: 0 });
  model[0] = { at: 0, end: model.length, kind: "document", parent: 0, start: 0 };

  return {
    bounds: { ...extent, nodes: model.length - 1 },
    document: {
      _tag: "document",
      charset: builtCharset,
      declaration: Option.none(),
      epilog: [],
      exportCharset: builtCharset,
      prolog: [],
      root,
    },
    model,
    swarm: {},
  };
};

/**
 * A hand-built tree that broke an unconstructed law, kept for the search below: a case which must
 * still meet every constructed law and still break the law it names, so the law stays stated and
 * stays among the {@link unconstructed}.
 *
 * @param note - What the tree holds that breaks the law.
 * @param law - The unconstructed law it breaks.
 * @param root - The tree's root element.
 * @returns The kept case.
 */
const builtCase = (
  note: string,
  law: keyof typeof unconstructed,
  root: Built,
): Kept<GeneratedXdm, Situation> => ({
  draws: "",
  note,
  reaches: [`${law} refuses`],
  sketch: handBuilt(root),
});

/**
 * An item whose item body holds an element, the root of a hand-built tree.
 *
 * @param body - The element the item body holds.
 * @returns The item.
 */
const itemHolding = (body: Built): Built => ({
  children: [{ children: [body], kind: "qti-item-body" }],
  kind: "qti-assessment-item",
});

/**
 * The trees that broke an unconstructed law in a search that named it constructed, each shrunk by
 * its run:
 *
 * - Four write a td whose headers name `v`, which no th of its table has as its id (reading 126). The
 *   first, a td no table holds, so takes part in none, was the free suite's red at 9b3a28a1
 *   (TEST_SEED=2144430066, the rotating stream's case 199), from 4d7eed2f, which stated "Table
 *   headers" without naming it among the unconstructed. The other three are the reds Aiden found at
 *   1ee51d8d (PR #46, comment 6701102861): a table's thead, a td under ssml:audio and a table-less
 *   tfoot. The thead's is kept twice: as a td a table holds, the nearest a search found, since the
 *   generator draws a table's thead (7 of 4,000 trees) but no search of 20,000 cases drew one whose
 *   td names a header; and as a hand-built tree whose thead td names a header no th of its table
 *   has, which pins the thead path of the fold, where a td reads its table through its row and its
 *   thead.
 * - One writes a qti-equal whose tolerance is empty, which holds no value where a tolerance holds one
 *   or two (reading 121): Aiden's red at TEST_SEED=3952699438, with "Equal tolerance" stated over a
 *   lexical form drawn without reading but not named among the unconstructed.
 * - One writes a pre whose data-ssml is empty, no JSON object, so it has no `DataSsml` row (reading
 *   177): the free suite's red at 9b91f27e, replayed here at TEST_SEED=593086602, from c91aec18,
 *   which stated "Data SSML" over a lexical form drawn without reading but did not name it among
 *   the unconstructed.
 * - One is a qti-gap that writes its identifier where no qti-gap-match-interaction encloses it, so
 *   its nearest is no interaction (reading 38): the free suite's red at a1c8e7e2e and at its
 *   parent, TEST_SEED=1134801326 (the rotating stream's case 97), from "N8 nearest"'s choice
 *   clause, a place the generator draws without reading, under a law it named constructed for its
 *   other clause, fold's nearest copy.
 *
 * A tape is the generator's draws, each an index into the candidates it reads from the grammar in
 * that grammar's order, so a tape keeps its tree only while that order holds. So each case is kept
 * as a hand-built tree of its red's shape, its root the red's root and its path the red's path to
 * the element that breaks the law, which no change of the grammar's order redraws. Each note keeps
 * the seed of its red.
 */
const unconstructedCases: readonly Kept<GeneratedXdm, Situation>[] = [
  builtCase(
    "a td no table holds names a header (TEST_SEED=2144430066)",
    "Table headers",
    itemHolding({
      children: [
        {
          children: [{ children: [{ attributes: [["headers", "v"]], kind: "td" }], kind: "tr" }],
          kind: "ssml:emphasis",
        },
      ],
      kind: "p",
    }),
  ),
  builtCase(
    "a td in a table names a header no th of the table has (TEST_SEED=1119914124)",
    "Table headers",
    {
      children: [
        { children: [{ kind: "td" }, { attributes: [["headers", "v"]], kind: "td" }], kind: "tr" },
      ],
      kind: "table",
    },
  ),
  builtCase(
    "a td in a table's thead names a header no th of the table has",
    "Table headers",
    itemHolding({
      children: [
        {
          children: [
            {
              children: [
                { attributes: [["id", "h1"]], kind: "th" },
                { attributes: [["headers", "h2"]], kind: "td" },
              ],
              kind: "tr",
            },
          ],
          kind: "thead",
        },
        { children: [{ children: [{ kind: "td" }], kind: "tr" }], kind: "tbody" },
      ],
      kind: "table",
    }),
  ),
  builtCase(
    "a td under ssml:audio, which no table holds, names a header (TEST_SEED=4046452640)",
    "Table headers",
    { children: [{ attributes: [["headers", "v"]], kind: "td" }], kind: "ssml:audio" },
  ),
  builtCase(
    "a td under a tfoot no table holds names a header (TEST_SEED=1912931461)",
    "Table headers",
    {
      children: [
        {
          children: [
            {
              children: [
                { children: [{ attributes: [["headers", "v"]], kind: "td" }], kind: "tr" },
              ],
              kind: "tfoot",
            },
          ],
          kind: "template",
        },
      ],
      kind: "ssml:break",
    },
  ),
  builtCase("a qti-equal writes an empty tolerance (TEST_SEED=3952699438)", "Equal tolerance", {
    children: [
      {
        attributes: [["identifier", ""]],
        children: [
          {
            children: [
              {
                attributes: [
                  ["tolerance-mode", ""],
                  ["tolerance", ""],
                ],
                children: [{ kind: "qti-base-value" }],
                kind: "qti-equal",
              },
            ],
            kind: "qti-and",
          },
        ],
        kind: "qti-lookup-outcome-value",
      },
    ],
    kind: "qti-outcome-processing-fragment",
  }),
  builtCase("a pre writes an empty data-ssml (TEST_SEED=593086602)", "Data SSML", {
    attributes: [["data-ssml", ""]],
    kind: "pre",
  }),
  builtCase(
    "a qti-gap no gap-match encloses writes its identifier (TEST_SEED=1134801326)",
    "N8 nearest",
    { attributes: [["identifier", ""]], kind: "qti-gap" },
  ),
];

describe("the host's law model over folded rows", () => {
  it.effect("holds every law a generated tree is built to meet", (ctx) =>
    // Oracle: the specification as a checker, the host's law model (`#pantry/test/oracle.ts`),
    // over the rows fold writes for trees built to meet those laws: every law of the oracle but
    // those `unconstructed` names, AL2's distinctness among them over elements that carry two
    // names of one open class.
    // Bound: the generator's drawn bounds.
    searched(
      ctx,
      explore(
        { ...over("model/folds-laws-valid", lawModelOracle), kept: unconstructedCases },
        ({ document, model }, c) =>
          Effect.gen(function* valid() {
            c.noteAll(featuresOf(document));
            c.noteAll(familiesOf(model));

            const rows = yield* foldedOf(document);
            const breaches = documentBreaches("generated.xml", rows, laws);
            c.noteAll(breaches.map(({ law }): LawVerdict => `${law} refuses`));

            assert.deepStrictEqual(
              breaches.filter(({ law }) => constructed.has(law)),
              [],
            );
          }),
      ),
    ),
  );
});
