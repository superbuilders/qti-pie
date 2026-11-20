/* oxlint-disable unicorn/text-encoding-identifier-case -- The generated documents carry the charset label crust's reader reports, `UTF-8`. */
/**
 * The O2 overlay rows against a second reading of the same tree: a direct walk of the XDM
 * document, numbering its nodes in document order, each node's `start`, as the tree's rows are
 * numbered, and collecting each outcome declaration's scale rows from its attributes. The walk
 * shares no code with the builder, which reads the tree's flat rows (`flatten`).
 */
import { NodeChildProcessSpawner, NodeFileSystem, NodePath } from "@effect/platform-node";
import { assert, describe, it, layer } from "@effect/vitest";
import { drawn, exhaust, explore } from "@bjornpagen/testing/explore";
import { required, requiredInSpace } from "@bjornpagen/testing/features";
import { array, element } from "@bjornpagen/testing/gen";
import type { Gen } from "@bjornpagen/testing/gen";
import { notesOnly } from "@bjornpagen/testing/sense";
import { completeShrink } from "@bjornpagen/testing/shrink";
import { searched } from "@bjornpagen/testing/vitest";
import { Duration, Effect, Formatter, Layer, Option } from "effect";
import { readXml } from "@qti-pie/crust/read.ts";
import { grammar } from "#pantry/grammar/install.ts";
import { rowsOf } from "#pantry/import/overlays/declarations.ts";
import { piecesOf } from "#pantry/import/pieces.ts";
import type { DeclarationRows, Place } from "#pantry/import/overlays/declarations.ts";
import { shredGrammarOf } from "#pantry/model/composed.ts";
import type { Composed } from "#pantry/model/composed.ts";
import { shred } from "#pantry/model/shred.ts";
import { closedName, documentFamily } from "#pantry/model/xdm.ts";
import type {
  ClosedName,
  XdmChild,
  XdmClosedElement,
  XdmDocument,
  XdmElement,
} from "#pantry/model/xdm.ts";
import { readEntries } from "#pantry/package/read.ts";
import { declarationKinds } from "#pantry/qti/declarations.ts";
import { materializeCorpus } from "#pantry/test/fixtures.ts";
import { searchWidth, settings } from "#pantry/test/settings.ts";
import { ownViewOf } from "#pantry/import/fold.ts";

/**
 * The file system and processes the fixtures' materializer and `readEntries` need.
 */
const TestLayer = NodeChildProcessSpawner.layer.pipe(
  Layer.provideMerge(Layer.mergeAll(NodeFileSystem.layer, NodePath.layer)),
);

/**
 * One overlay's expected rows: its relation and its rows by their element's `start`, every row of
 * one document.
 */
type Expected = { readonly [Relation in keyof DeclarationRows]: Map<bigint, object> };

/**
 * Where a generated document stands: one item of one package, the place every row holds.
 */
const generatedPlace: Place = { package: "MANIFEST", path: "item.xml" };

/**
 * The overlay relations the builder writes rows of.
 */
const relationNames = [
  "MasteryValue",
  "NormalMaximum",
  "NormalMinimum",
] as const satisfies readonly (keyof DeclarationRows)[];

/**
 * An element as the walk meets it: its place, its kind and its attributes.
 */
interface Met {
  readonly child: XdmElement<Composed>;
  readonly kind: string;
  readonly place: { readonly package: string; readonly path: string; readonly start: bigint };
  readonly valueOf: (name: string) => string | undefined;
}

/**
 * The normal minimum an outcome declaration that writes none has (spec reading 149): QTI 3.0.1's,
 * "Default = "0.0"" (information model §4.5.8).
 */
const minimumByDefault = "0.0";

/**
 * Collect an outcome declaration's expected rows: its row of each scale value it has, a mastery
 * value and a normal maximum where written, and a normal minimum where written or else its default
 * ({@link minimumByDefault}). Any other element has none.
 *
 * @param expected - The rows so far.
 * @param met - The element.
 */
const walkDeclaration = (expected: Expected, { kind, place, valueOf }: Met): void => {
  if (kind !== "qti-outcome-declaration") {
    return;
  }

  const { start } = place;
  const scale = [
    [expected.MasteryValue, valueOf("mastery-value")],
    [expected.NormalMaximum, valueOf("normal-maximum")],
  ] as const;
  for (const [rows, lexical] of scale) {
    if (lexical !== undefined) {
      rows.set(start, { ...place, lexical });
    }
  }

  const writtenMinimum = valueOf("normal-minimum");
  expected.NormalMinimum.set(start, {
    ...place,
    lexical: writtenMinimum ?? minimumByDefault,
    written: writtenMinimum !== undefined,
  });
};

/**
 * Walk a document's tree in document order and collect the overlay rows it implies: each
 * outcome's scale.
 *
 * @param doc - The document's tree.
 * @param where - Where the document stands in its package, the place every row holds.
 * @returns Every overlay's expected rows.
 */
const walk = (doc: XdmDocument<Composed>, where: Place): Expected => {
  const expected: Expected = {
    MasteryValue: new Map(),
    NormalMaximum: new Map(),
    NormalMinimum: new Map(),
  };
  let next = 1;
  const visit = (child: XdmChild<Composed> | XdmDocument<Composed>["root"]): void => {
    const start = BigInt(next);
    next += 1;
    if (child._tag !== "element" && !("attributes" in child)) {
      return;
    }

    walkDeclaration(expected, {
      child,
      kind: child._tag === "element" ? child.kind : child._tag,
      place: { package: where.package, path: where.path, start },
      valueOf: (name) =>
        child.attributes.find(
          (attribute) => attribute.name._tag === "closed" && attribute.name.handle === name,
        )?.lexical,
    });
    for (const grandchild of child.children) {
      visit(grandchild);
    }
  };

  for (const child of documentFamily(doc)) {
    if (child._tag === "element") {
      visit(child);
    } else {
      next += 1;
    }
  }

  return expected;
};

/**
 * List one document's rows of a relation by their element's `start`, so two sets compare as sets.
 *
 * @param map - The rows, by `start`.
 * @returns Its entries, sorted by `start`.
 */
const sortedEntries = (map: ReadonlyMap<bigint, object>): readonly (readonly [bigint, object])[] =>
  [...map].toSorted(([left], [right]) => Number(left - right));

/**
 * Compare the builder's keyed sets with the walk's: every relation's rows alike, read by their
 * fields, each by its `start`. The builder's key texts are its own, so none is compared, but each
 * set holds as many rows as keys.
 *
 * @param rows - The builder's rows.
 * @param expected - The walk's.
 * @param label - The case, for a failure's message.
 */
const assertRows = (rows: DeclarationRows, expected: Expected, label: string): void => {
  for (const relation of relationNames) {
    const held = new Map([...rows[relation].values()].map((row) => [row.start, row] as const));
    assert.strictEqual(held.size, rows[relation].size, `${label} ${relation}: one row per start`);
    assert.deepStrictEqual(
      sortedEntries(held),
      sortedEntries(expected[relation]),
      `${label} ${relation}`,
    );
  }
};

/**
 * An element with closed attributes.
 *
 * @param kind - Its kind.
 * @param attributes - Its attributes' names and lexical forms, in order; an absent one is left out.
 * @param children - Its children.
 * @returns The element.
 */
const elementOf = (
  kind: XdmClosedElement<Composed>["kind"],
  attributes: readonly (readonly [ClosedName<Composed>, string | undefined])[],
  children: readonly XdmChild<Composed>[],
): XdmClosedElement<Composed> => ({
  _tag: "element",
  attributes: attributes.flatMap(([handle, lexical]) =>
    lexical === undefined ? [] : [{ lexical, name: closedName(handle), references: [] }],
  ),
  children,
  governs: Option.none(),
  kind,
  namespaces: [],
  prefix: "",
});

/**
 * The declaration kinds the generator writes, as element kinds: `declarationKinds`, which a test
 * below holds equal to this list.
 */
const generatedKinds = [
  "qti-response-declaration",
  "qti-outcome-declaration",
  "qti-template-declaration",
  "qti-context-declaration",
] as const satisfies readonly XdmClosedElement<Composed>["kind"][];

/**
 * One generated declaration: its kind, and the scale attributes it writes, which only an outcome
 * declaration's rows read.
 */
interface DeclarationCase {
  readonly kind: (typeof generatedKinds)[number];
  readonly mastery: string | undefined;
  readonly maximum: string | undefined;
  readonly minimum: string | undefined;
}

/**
 * The generated documents: an item of up to 3 declarations, each of any declaration kind, and an
 * outcome's scale, each attribute written or not and a pair both written (`mastery-pair`), a
 * minimum unwritten (`default-minimum`), and a declaration of another kind (`no-scale`).
 */
const declarationsGen: Gen<readonly DeclarationCase[]> = array(
  (source) => ({
    kind: source.draw(element(generatedKinds)),
    mastery: source.draw(element(["0.5", " 0.5", undefined] as const)),
    maximum: source.draw(element(["1", undefined] as const)),
    minimum: source.draw(element(["0", undefined] as const)),
  }),
  { max: 3, min: 0 },
);

/**
 * A situation a generated document reaches, each a named variant the builder must hold.
 */
type Situation = "default-minimum" | "mastery-pair" | "no-scale" | "outcome-range";

/**
 * Name the situations one generated document reaches.
 *
 * @param input - The declarations.
 * @returns Its situations.
 */
const situationsOf = (input: readonly DeclarationCase[]): readonly Situation[] => {
  const outcomes = input.filter(({ kind }) => kind === "qti-outcome-declaration");
  const reached: [Situation, boolean][] = [
    [
      "outcome-range",
      outcomes.some(({ mastery, maximum, minimum }) =>
        [mastery, maximum, minimum].some((lexical) => lexical !== undefined),
      ),
    ],
    [
      "mastery-pair",
      outcomes.some(
        ({ mastery, maximum, minimum }) =>
          mastery !== undefined && (maximum !== undefined || minimum !== undefined),
      ),
    ],
    ["default-minimum", outcomes.some(({ minimum }) => minimum === undefined)],
    ["no-scale", input.some(({ kind }) => kind !== "qti-outcome-declaration")],
  ];

  return reached.flatMap(([situation, holds]) => (holds ? [situation] : []));
};

/**
 * Write generated declarations as the tree shred would give: an item holding each declaration,
 * whitespace before each, so character data shares the numbering.
 *
 * @param input - The declarations.
 * @returns The tree.
 */
const treeOf = (input: readonly DeclarationCase[]): XdmDocument<Composed> => {
  const ws: XdmChild<Composed> = { _tag: "ws", value: "\n" };
  const declarations = input.map(({ kind, mastery, maximum, minimum }) =>
    elementOf(
      kind,
      [
        ["identifier", "A"],
        ["cardinality", "single"],
        ["base-type", "float"],
        ["mastery-value", mastery],
        ["normal-minimum", minimum],
        ["normal-maximum", maximum],
      ],
      [],
    ),
  );

  return {
    _tag: "document",
    charset: "UTF-8",
    declaration: Option.none(),
    epilog: [],
    exportCharset: "UTF-8",
    prolog: [{ _tag: "comment", value: " item " }],
    root: elementOf(
      "qti-assessment-item",
      [["identifier", "item"]],
      declarations.flatMap((declaration) => [ws, declaration]),
    ),
  };
};

describe("import/overlays/declarations.ts", () => {
  it("generates every declaration kind and no other", () => {
    // Oracle: install.ts's declaration kinds, the `DeclarationKind` roster as `NodeKind` handles.
    assert.sameMembers([...generatedKinds], [...declarationKinds]);
  });

  it.effect("writes each overlay's rows as the walk of the document's tree names them", (ctx) =>
    // Oracle: a second implementation, a direct walk of the XDM document that numbers its nodes in
    // document order and reads each element's attributes, against the builder's read of the tree's
    // flat rows.
    // Bound: up to 3 declarations of 4 kinds, each writing an outcome's three scale attributes or
    // not, a mastery value of 2 forms, 200 runs.
    searched(
      ctx,
      explore(
        {
          caseHang: Duration.seconds(10),
          concurrency: 1,
          coverage: required<Situation>(
            ["outcome-range", "mastery-pair", "default-minimum", "no-scale"],
            { cases: 100, sense: notesOnly },
          ),
          draw: drawn(declarationsGen),
          kept: [],
          literal: Formatter.format,
          oracle: { kind: "second-implementation", name: "a direct walk of the XDM tree" },
          runs: 200,
          shrink: completeShrink,
          steerEvery: 16,
          suite: "pantry/import/overlays-declarations",
        },
        (input, c) =>
          Effect.sync(() => {
            c.noteAll(situationsOf(input));

            const doc = treeOf(input);
            assertRows(
              rowsOf(ownViewOf(doc), generatedPlace),
              walk(doc, generatedPlace),
              "generated",
            );
          }),
      ),
    ),
  );

  it.effect(
    "splits an identifier into pieces that concatenate to it, the name holding no whitespace",
    (ctx) =>
      // Oracle: a universal one, the round trip: lead ‖ name ‖ trail is the lexical form, and the
      // name is the lexical form collapsed (XML Schema Part 2, §4.3.6).
      // Bound: every lexical form of a lead and a trail of at most 2 of 3 whitespace characters
      // around one of 4 names (one empty, one all whitespace), 13 × 13 × 4 = 676 cases.
      searched(
        ctx,
        exhaust(
          {
            box: "a lead and a trail of at most 2 of space, tab and line feed around 4 names",
            caseHang: Duration.seconds(10),
            concurrency: searchWidth,
            coverage: requiredInSpace<"padded" | "bare" | "empty">(["padded", "bare", "empty"]),
            generator: (source) => ({
              lead: source
                .draw(array(element([" ", "\t", "\n"] as const), { max: 2, min: 0 }))
                .join(""),
              name: source.draw(element(["A", "a.b-c", "", "x"] as const)),
              trail: source
                .draw(array(element([" ", "\t", "\n"] as const), { max: 2, min: 0 }))
                .join(""),
            }),
            literal: Formatter.format,
            oracle: { kind: "universal", name: "the round trip lead ‖ name ‖ trail" },
            suite: "pantry/import/overlays-declarations-pieces",
          },
          ({ lead, name, trail }, c) =>
            Effect.sync(() => {
              const lexical = `${lead}${name}${trail}`;
              const pieces = piecesOf(lexical);
              if (name === "") {
                c.note("empty");
              } else {
                c.note(lead === "" && trail === "" ? "bare" : "padded");
              }

              assert.strictEqual(`${pieces.lead}${pieces.value}${pieces.trail}`, lexical);
              assert.strictEqual(pieces.value, name);
              assert.match(pieces.lead, /^[\t\n\r ]*$/u);
              assert.match(pieces.trail, /^[\t\n\r ]*$/u);
            }),
        ),
      ),
  );
});

/**
 * Read a package's documents and build each one's overlay rows: every XML entry that shreds.
 *
 * @param dir - The package directory or zip.
 * @returns Each shredded document's tree and rows.
 */
const documentsOf = (dir: string) =>
  Effect.gen(function* packageDocuments() {
    const files = yield* readEntries(dir);
    const documents: { readonly path: string; readonly tree: XdmDocument<Composed> }[] = [];
    for (const file of files.filter(({ kind, path }) => kind === "file" && path.endsWith(".xml"))) {
      const xml = yield* Effect.option(readXml(file.bytes));
      const tree = Option.isSome(xml)
        ? yield* Effect.option(shred(xml.value, shredGrammarOf(grammar)))
        : Option.none();
      if (Option.isSome(tree)) {
        documents.push({ path: file.path, tree: tree.value });
      }
    }

    return documents;
  });

/**
 * Check a document's rows against the walk.
 *
 * @param path - The document's path, for a failure's message.
 * @param tree - The document.
 * @returns The number of outcome declarations it holds, each of which has its normal minimum.
 */
const checkDocument = (path: string, tree: XdmDocument<Composed>): number => {
  const place: Place = { package: "MANIFEST", path };
  const rows = rowsOf(ownViewOf(tree), place);
  assertRows(rows, walk(tree, place), path);

  return rows.NormalMinimum.size;
};

layer(TestLayer, { excludeTestServices: true })(
  "import/overlays/declarations.ts, fixtures",
  (suite) => {
    suite.effect.skipIf(!settings.corpusRequested)(
      "writes every outcome's scale the corpus writes as the walk of its tree names it",
      () =>
        // Oracle: the walk, as above, over every document of the 1EdTech corpus.
        // Bound: every corpus zip's XML documents that shred (QTI_PIE_CORPUS=1).
        Effect.gen(function* corpusCodes() {
          let declared = 0;
          for (const { dir, name } of yield* materializeCorpus()) {
            for (const { path, tree } of yield* documentsOf(dir)) {
              declared += checkDocument(`${name}/${path}`, tree);
            }
          }

          assert.isAtLeast(declared, 100);
        }),
    );
  },
);
