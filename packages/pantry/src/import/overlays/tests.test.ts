/**
 * The bank layer's overlay builders' free tests: the rows `rowsOf` and `assembledRowsOf` write
 * restate the documents, as a direct walk of each XDM tree reads them.
 *
 * - **Includes** (readings 114, 115 and 117): each include is a site, external or not, its target and
 *   its placement written exactly where the include names a document it may stand for.
 * - **Pieces**: a lexical form's split restates it, its value collapsed.
 * - **Names** (readings 147 and 152): a bank's root section and item refs, and an item's stimulus
 *   refs, each named exactly where its identifier names something, collapsed.
 * - **Hrefs** (reading 102): an item ref's href is compared by its entry path where it resolves.
 */
import { assert, describe, it } from "@effect/vitest";
import { exhaust } from "@bjornpagen/testing/explore";
import { requiredInSpace } from "@bjornpagen/testing/features";
import { array, element } from "@bjornpagen/testing/gen";
import { searched } from "@bjornpagen/testing/vitest";
import { Array as Arr, Duration, Effect, Formatter, Option } from "effect";
import { contextsOf } from "#pantry/import/context.ts";
import { ownContext, ownViewOf } from "#pantry/import/fold.ts";
import type { DocumentView } from "#pantry/import/fold.ts";
import { piecesOf } from "#pantry/import/pieces.ts";
import { assembledRowsOf, itemRefPathsOf, rowsOf } from "#pantry/import/overlays/tests.ts";
import type { AssemblyInput, TestIds, TestRows } from "#pantry/import/overlays/tests.ts";
import type { Composed } from "#pantry/model/composed.ts";
import { closedName } from "#pantry/model/xdm.ts";
import type {
  ClosedName,
  ElementKind,
  XdmChild,
  XdmClosedElement,
  XdmDocument,
} from "#pantry/model/xdm.ts";
import { comparedPath, oracleValueOf, resolveAttribute } from "#pantry/test/resolution.ts";
import { searchWidth, searchTimeout } from "#pantry/test/settings.ts";

/**
 * An element's attributes, as (name, lexical) pairs in order.
 */
type Attributes = readonly (readonly [ClosedName<Composed>, string])[];

/**
 * An element of a kind, with its attributes as (name, lexical) pairs and its children.
 *
 * @param kind - The kind.
 * @param attributes - The attributes, in order.
 * @param children - The children, in order.
 * @returns The element.
 */
const el = (
  kind: ElementKind<Composed>,
  attributes: Attributes = [],
  children: readonly XdmChild<Composed>[] = [],
): XdmClosedElement<Composed> => ({
  _tag: "element",
  attributes: attributes.map(([handle, lexical]) => ({
    lexical,
    name: closedName(handle),
    references: [],
  })),
  children,
  governs: Option.none(),
  kind,
  namespaces: [],
  prefix: "",
});

/**
 * A document of one root element.
 *
 * @param root - The root.
 * @returns The document.
 */
const documentOf = (root: XdmClosedElement<Composed>): XdmDocument<Composed> => ({
  _tag: "document",
  charset: "utf-8",
  declaration: Option.none(),
  epilog: [],
  exportCharset: "utf-8",
  prolog: [],
  root,
});

/**
 * The manifest identifier of the package every case's documents are written under.
 */
const packageId = "P";

/**
 * View each of a package's documents and place it: in its own context, every
 * site's target found among the documents by path, and each in an assembly as the importer's
 * contexts read it.
 *
 * @param documents - The documents by path, in order.
 * @returns Each document's view and where it stands, in the same order.
 */
const idsOfPackage = (
  documents: readonly (readonly [string, XdmDocument<Composed>])[],
): readonly (readonly [DocumentView, TestIds])[] => {
  const listed = documents.map(([path, tree]) => {
    const view = ownViewOf(tree);

    return { attributes: view.attributes, named: true, path, rows: view.rows, tree, view };
  });
  const roots = new Map(listed.map(({ path, tree }) => [path, tree] as const));
  const rootAt = (at: string) => Option.fromNullishOr(roots.get(at));

  return contextsOf(listed).map(({ assembled, listed: { path, view } }) => [
    view,
    {
      assembled,
      entryAt: (at) => roots.has(at),
      package: packageId,
      path,
      targetAt: (at) =>
        Option.map(rootAt(at), (target) => ({ context: ownContext, rootKind: target.root.kind })),
    },
  ]);
};

/**
 * Read the rows of a package's documents, each viewed and placed by {@link idsOfPackage}.
 *
 * @param documents - The documents by path, in order.
 * @returns Each document's rows, in the same order.
 */
const rowsOfPackage = (
  documents: readonly (readonly [string, XdmDocument<Composed>])[],
): readonly TestRows[] => idsOfPackage(documents).map(([view, ids]) => rowsOf(view, ids));

/**
 * Read the rows of a package's documents as {@link assembledRowsOf} reads them, each beside its
 * root's kind.
 *
 * @param documents - The documents by path, in order.
 * @returns Each document's rows and root kind, in the same order.
 */
const assemblyInputsOf = (
  documents: readonly (readonly [string, XdmDocument<Composed>])[],
): readonly AssemblyInput[] =>
  idsOfPackage(documents).map(([view, ids]) => ({
    rootKind: view.tree.root.kind,
    rows: rowsOf(view, ids),
  }));

/**
 * An item whose body holds one `xi:include` with the attributes given.
 *
 * @param attributes - The include's attributes.
 * @returns The item.
 */
const itemWithInclude = (attributes: Attributes): XdmDocument<Composed> =>
  documentOf(
    el(
      "qti-assessment-item",
      [["identifier", "I"]],
      [el("qti-item-body", [], [el("xi:include", attributes)])],
    ),
  );

/**
 * Read the rows of an item holding one include beside a listed section document, `s.xml`.
 *
 * @param include - The item.
 * @returns The item's rows.
 */
const includeRowsOf = (include: XdmDocument<Composed>): TestRows | undefined =>
  rowsOfPackage([
    ["t.xml", include],
    ["s.xml", documentOf(el("qti-assessment-section", [["identifier", "S"]]))],
  ])[0];

describe("import/overlays/tests.ts, includes", () => {
  it("writes an include whose href resolves outside the package a site marked external, with no target and no Inclusion, so nothing fetches it", () => {
    // Oracle: reading 115 and the href scopes of readings 35 and 102: a scheme, a leading `/` and
    // a path that climbs above the package root are outside the package; such an include is
    // stored as written and never resolved, so it names no document of the package.
    for (const href of ["https://example.org/f.xml", "/s.xml", "../s.xml"]) {
      const rows = includeRowsOf(itemWithInclude([["href", href]]));
      const sites = [...(rows?.Site.values() ?? [])];

      assert.deepStrictEqual(
        sites.map(({ external, kind }) => [kind, external]),
        [["xi:include", true]],
        href,
      );
      assert.strictEqual(rows?.SiteTarget.size, 0, href);
      assert.strictEqual(rows?.Inclusion.size, 0, href);
    }
  });

  it("marks an include whose href stays in the package not external: a listed document is its target, and a missing entry and an absent href leave it none, which Include target refuses", () => {
    // Oracle: reading 115: an in-package include names a document the manifest lists, or the
    // package is refused under "Include target"; an include with no href names none.
    const cases: readonly (readonly [string, Attributes, number])[] = [
      ["listed document", [["href", "s.xml"]], 1],
      ["missing entry", [["href", "gone/s.xml"]], 0],
      ["absent href", [], 0],
    ];

    for (const [label, attributes, targets] of cases) {
      const rows = includeRowsOf(itemWithInclude(attributes));
      const sites = [...(rows?.Site.values() ?? [])];

      assert.deepStrictEqual(
        sites.map(({ external, kind }) => [kind, external]),
        [["xi:include", false]],
        label,
      );
      assert.strictEqual(rows?.SiteTarget.size, targets, label);
      assert.strictEqual(rows?.Inclusion.size, targets, label);
    }
  });

  it("writes no site for an include under a parent whose model gives no Include, as under qti-custom-operator", () => {
    // Oracle: reading 114: only a parent whose content model holds an explicit include particle
    // reads an include as Include; `qti-custom-operator`'s lax content (operator-foreign-content's
    // shape) holds the include as written, so it is no site and needs no target.
    for (const href of ["part.xml", "https://example.org/f.xml"]) {
      const operator = el("qti-custom-operator", [], [el("xi:include", [["href", href]])]);
      const rows = includeRowsOf(
        documentOf(
          el(
            "qti-assessment-item",
            [["identifier", "I"]],
            [
              el(
                "qti-response-processing",
                [],
                [el("qti-response-condition", [], [el("qti-response-if", [], [operator])])],
              ),
            ],
          ),
        ),
      );

      assert.strictEqual(rows?.Site.size, 0, href);
      assert.strictEqual(rows?.SiteTarget.size, 0, href);
      assert.strictEqual(rows?.Inclusion.size, 0, href);
    }
  });

  it("places a child instance for an include only where it may stand for its target's root: one under the item's body, none under a paragraph, which Include root refuses", () => {
    // Oracle: reading 114 and 117: an include places its target only where `IncludeRoot` gives its
    // parent that target's root; under `p` a `div` fragment may not stand, so "Include root" refuses
    // the include, the fragment places nowhere in the item, and is judged as its own document.
    const fragment = documentOf(
      el("div", [], [el("qti-hottext-interaction", [["response-identifier", "RESPONSE"]])]),
    );
    const cases: readonly (readonly [string, XdmClosedElement<Composed>, number])[] = [
      ["include in the body", el("xi:include", [["href", "f.xml"]]), 1],
      ["include in a paragraph", el("p", [], [el("xi:include", [["href", "f.xml"]])]), 0],
    ];

    for (const [label, holder, children] of cases) {
      const item = documentOf(
        el("qti-assessment-item", [["identifier", "I"]], [el("qti-item-body", [], [holder])]),
      );
      const documents = assemblyInputsOf([
        ["i.xml", item],
        ["f.xml", fragment],
      ]);
      const assembled = assembledRowsOf(documents);
      const itemRoot = [...assembled.Instance.values()].find(
        ({ rootKind }) => rootKind === "qti-assessment-item",
      );

      assert.strictEqual(documents[0]?.rows.SiteTarget.size, 1, label);
      assert.strictEqual(itemRoot?.children.length, children, label);
    }
  });
});

/**
 * The characters a lexical form is written over in the pieces box.
 */
const piecesAlphabet = [" ", "\t", "\n", "a", "b"] as const;

/**
 * Every text of at most five characters over {@link piecesAlphabet}.
 */
const piecesTexts = array(element(piecesAlphabet), { max: 5, min: 0 });

describe("import/overlays/tests.ts, pieces", () => {
  it.effect(
    "splits a lexical form into whitespace, its collapsed value and whitespace",
    (ctx) =>
      // Oracle: a universal one, the round trip `lead ‖ value ‖ trail = lexical`, with XML Schema
      // Part 2 §4.3.6's collapse as the specification of the value's ends.
      // Bound: every text of at most 5 characters over space, tab, line feed, a and b, 3,906.
      searched(
        ctx,
        exhaust(
          {
            box: "every text of at most 5 characters over space, tab, line feed, a and b",
            caseHang: Duration.seconds(10),
            concurrency: searchWidth,
            coverage: requiredInSpace<"empty" | "padded" | "bare">(["empty", "padded", "bare"]),
            generator: piecesTexts,
            literal: (characters) => JSON.stringify(characters.join("")),
            oracle: { kind: "universal", name: "the split's round trip, with collapse's ends" },
            suite: "import/overlays-tests-pieces",
          },
          (characters: readonly string[], c) =>
            Effect.sync(() => {
              const lexical = characters.join("");
              const { lead, trail, value } = piecesOf(lexical);
              if (value === "") {
                c.note("empty");
              } else {
                c.note(lexical === value ? "bare" : "padded");
              }

              assert.strictEqual(`${lead}${value}${trail}`, lexical);
              assert.match(lead, /^[\t\n\r ]*$/u);
              assert.match(trail, /^[\t\n\r ]*$/u);
              assert.isTrue(value === "" || /^\S(?:.*\S)?$/su.test(value), JSON.stringify(value));
              assert.strictEqual(value === "", /^[\t\n\r ]*$/u.test(lexical));
            }),
        ),
      ),
    searchTimeout,
  );
});

/**
 * An identifier as the names box writes it: unwritten, bare, padded, or whitespace alone.
 */
const identifierForms: readonly [Option.Option<string>, ...Option.Option<string>[]] = [
  Option.none(),
  Option.some("a"),
  Option.some(" a\t"),
  Option.some("  "),
];

/**
 * A bank and an item whose names and stimulus refs each write one of {@link identifierForms}: a
 * bank's root section holding two item refs, and an item holding two stimulus refs.
 *
 * @param forms - The five elements' identifiers, in document order.
 * @returns The two documents by path.
 */
const namesDocuments = (
  forms: readonly Option.Option<string>[],
): readonly (readonly [string, XdmDocument<Composed>])[] => {
  const written = (at: number): readonly (readonly [ClosedName<Composed>, string])[] =>
    Option.toArray(Option.flatten(Arr.get(forms, at))).map((form) => ["identifier", form] as const);

  return [
    [
      "b.xml",
      documentOf(
        el(
          "qti-assessment-section",
          [...written(0), ["visible", "false"]],
          [
            el("qti-assessment-item-ref", [...written(1), ["href", "i.xml"]]),
            el("qti-assessment-item-ref", [...written(2), ["href", "i.xml"]]),
          ],
        ),
      ),
    ],
    [
      "i.xml",
      documentOf(
        el(
          "qti-assessment-item",
          [["identifier", "I"]],
          [
            el("qti-assessment-stimulus-ref", [...written(3), ["href", "a.xml"]]),
            el("qti-assessment-stimulus-ref", [...written(4), ["href", "b.xml"]]),
          ],
        ),
      ),
    ],
  ];
};

/**
 * The kinds whose identifier a `Named` or a `StimulusRef` row holds.
 */
const identifiedKinds: ReadonlySet<string> = new Set([
  "qti-assessment-item-ref",
  "qti-assessment-section",
  "qti-assessment-stimulus-ref",
]);

/**
 * Read each identified element's collapsed identifier by a direct pre-order walk of the XDM tree,
 * which numbers the document node 0 and each element after its parent, as a tree's `start` does:
 * none for one that writes no identifier, nor for a section or an item ref whose collapsed
 * identifier is empty, which is no NCName and so names nothing (spec reading 152). Empty is the
 * one such form {@link identifierForms} writes; a stimulus ref keeps its row whatever it spells.
 *
 * @param doc - The document.
 * @returns Each identified element's start, with its identifier collapsed, where it has a row.
 */
const identifiersByWalk = (doc: XdmDocument<Composed>): ReadonlyMap<bigint, string> => {
  const found = new Map<bigint, string>();
  let next = 1n;
  const visit = (node: XdmClosedElement<Composed>): void => {
    const start = next;
    next += 1n;
    const form = node.attributes.find(
      (attribute) => attribute.name._tag === "closed" && attribute.name.handle === "identifier",
    );
    const collapsed = form?.lexical.replaceAll(/^[\t\n\r ]+|[\t\n\r ]+$/gu, "");
    if (
      collapsed !== undefined &&
      identifiedKinds.has(node.kind) &&
      (collapsed !== "" || node.kind === "qti-assessment-stimulus-ref")
    ) {
      found.set(start, collapsed);
    }

    for (const child of node.children) {
      if (child._tag === "element") {
        visit(child);
      }
    }
  };
  visit(doc.root);

  return found;
};

/**
 * The identifiers of the `Named` rows of a bank's item refs: one bank holding an item ref of each
 * identifier, in order.
 *
 * @param identifiers - The item refs' identifiers, as written.
 * @returns The bank's item ref rows' identifiers, in one list per document.
 */
const itemRefsOf = (identifiers: readonly string[]): readonly (readonly string[])[] =>
  rowsOfPackage([
    [
      "b.xml",
      documentOf(
        el(
          "qti-assessment-section",
          [
            ["identifier", "B"],
            ["visible", "false"],
          ],
          identifiers.map((identifier) =>
            el("qti-assessment-item-ref", [
              ["identifier", identifier],
              ["href", "i.xml"],
            ]),
          ),
        ),
      ),
    ],
  ]).map((rows) =>
    // The bank's root section is its document's first element in document order, so every Named
    // row after the first by `start` is an item ref's.
    rows.Named.values()
      .toArray()
      .toSorted((a, b) => Number(a.start - b.start))
      .slice(1)
      .map(({ identifier }) => identifier),
  );

describe("import/overlays/tests.ts, names", () => {
  it.effect(
    "writes a Named or StimulusRef row exactly where its element writes an identifier that names something, holding it collapsed",
    (ctx) =>
      // Oracle: a second implementation, a direct pre-order walk of the XDM tree, with XML Schema
      // Part 2 §4.3.6's collapse, reading 147: an element that writes no identifier names nothing,
      // so it has no row, and reading 152: nor does a bank's section or item ref whose identifier
      // is blank.
      // Bound: a bank of a root section and two item refs, and an item of two stimulus refs, each
      // identifier unwritten, bare, padded or whitespace alone, 1,024.
      searched(
        ctx,
        exhaust(
          {
            box: "a bank's three names and an item's two stimulus refs, each identifier unwritten, bare, padded or blank",
            caseHang: Duration.seconds(10),
            concurrency: searchWidth,
            coverage: requiredInSpace<"unwritten" | "written">(["unwritten", "written"]),
            generator: array(element(identifierForms), { max: 5, min: 5 }),
            literal: Formatter.format,
            oracle: {
              kind: "second-implementation",
              name: "a direct pre-order walk of the XDM tree, with collapse",
            },
            suite: "import/overlays-tests-names",
          },
          (forms: readonly Option.Option<string>[], c) =>
            Effect.sync(() => {
              for (const form of forms) {
                c.note(Option.isSome(form) ? "written" : "unwritten");
              }

              const documents = namesDocuments(forms);
              assert.deepStrictEqual(
                rowsOfPackage(documents).map(
                  (rows) =>
                    new Map(
                      [...rows.Named.values(), ...rows.StimulusRef.values()].map(
                        ({ identifier, start }) => [start, identifier] as const,
                      ),
                    ),
                ),
                documents.map(([, doc]) => identifiersByWalk(doc)),
              );
            }),
        ),
      ),
    searchTimeout,
  );

  it.effect(
    "writes no Named row for an item ref whose identifier is no NCName, and one for each that is",
    () =>
      // Oracle: reading 152 and decision 457 (2), each case's rows written out by hand: an item ref
      // whose collapsed identifier is no NCName names nothing, so it has no Named row and its value
      // domain refuses it alone. Bound: a bank of two item refs, each identifier one of 1x (a
      // leading digit), x𝔸 (a character no NCName holds), S1 and a padded S2.
      Effect.sync(() => {
        assert.deepStrictEqual(itemRefsOf(["1x", "1x"]), [[]]);
        assert.deepStrictEqual(itemRefsOf(["x𝔸", "S1"]), [["S1"]]);
        assert.deepStrictEqual(itemRefsOf(["S1", " S2\t"]), [["S1", "S2"]]);
      }),
  );

  it("writes a Named row for each name of a test, which heads an assembly of its own", () => {
    // Oracle: reading 85's assembled documents, written out by hand: a test is assembled whether or
    // not it holds a site (`assembledRoots`), so its part, its section and its item ref each have a
    // Named row (reading 86), and the test its AssembledDocument row. Bound: one test of one part,
    // section and item ref.
    const test = documentOf(
      el(
        "qti-assessment-test",
        [["identifier", "T"]],
        [
          el(
            "qti-test-part",
            [
              ["identifier", "P"],
              ["navigation-mode", "linear"],
              ["submission-mode", "individual"],
            ],
            [
              el(
                "qti-assessment-section",
                [
                  ["identifier", "S"],
                  ["visible", "true"],
                ],
                [
                  el("qti-assessment-item-ref", [
                    ["identifier", "I"],
                    ["href", "i.xml"],
                  ]),
                ],
              ),
            ],
          ),
        ],
      ),
    );

    assert.deepStrictEqual(
      rowsOfPackage([["t.xml", test]]).map((rows) => [
        rows.Named.size,
        rows.AssembledDocument.size,
      ]),
      [[3, 1]],
    );
  });
});

/**
 * The paths a bank of the hrefs box sits at: the package root and two directories below it.
 */
const hrefDocuments = ["b.xml", "d/b.xml", "d/e/b.xml"] as const;

/**
 * The item ref hrefs of the box: relative ones that resolve or climb out of the package, external
 * ones with a scheme, an authority or a leading slash, one with params, one padded, one
 * percent-encoded, and the empty one.
 */
const hrefForms = [
  "i.xml",
  "../i.xml",
  "../../i.xml",
  "./a/../i.xml",
  "http://h/x.xml",
  "//h/x.xml",
  "/abs.xml",
  "mailto:x",
  "i.xml?q=1#f",
  " i.xml ",
  "%69.xml",
  "",
] as const;

describe("import/overlays/tests.ts, hrefs", () => {
  it.effect(
    "compares an item ref's href by its entry path where it resolves, and by its path as written otherwise, at any directory",
    (ctx) =>
      // Oracle: a second implementation, the law oracle's own RFC 3986 resolver and its compared
      // path (`#pantry/test/resolution.ts`), with reading 102: an href that resolves is compared
      // by its entry path, and one that does not by its path as written, its params aside, as a
      // manifest href is.
      // Bound: a bank at the root and two directories below it, its item ref writing each of 12
      // hrefs, 36 cases.
      searched(
        ctx,
        exhaust(
          {
            box: "a bank at b.xml, d/b.xml or d/e/b.xml whose item ref writes each of 12 hrefs",
            caseHang: Duration.seconds(10),
            concurrency: searchWidth,
            coverage: requiredInSpace<"entry" | "as written">(["entry", "as written"]),
            generator: (source) => ({
              document: source.draw(element(hrefDocuments)),
              href: source.draw(element(hrefForms)),
            }),
            literal: Formatter.format,
            oracle: {
              kind: "second-implementation",
              name: "the law oracle's RFC 3986 resolver and its compared path",
            },
            suite: "import/overlays-tests-hrefs",
          },
          ({ document, href }, c) =>
            Effect.sync(() => {
              const resolution = resolveAttribute({
                bases: [],
                document,
                lexical: href,
                whiteSpace: "collapse",
              });
              const resolved = resolution.scope === "entry";
              c.note(resolved ? "entry" : "as written");

              const bank = documentOf(
                el(
                  "qti-assessment-section",
                  [
                    ["identifier", "B"],
                    ["visible", "false"],
                  ],
                  [
                    el("qti-assessment-item-ref", [
                      ["identifier", "I"],
                      ["href", href],
                    ]),
                  ],
                ),
              );
              assert.deepStrictEqual(
                idsOfPackage([[document, bank]]).flatMap(([view, ids]) =>
                  itemRefPathsOf(view, ids).map(({ resolved: entry, target }) => ({
                    entry,
                    target,
                  })),
                ),
                [
                  {
                    entry: resolved,
                    target: comparedPath(resolution, oracleValueOf(href, "collapse")),
                  },
                ],
              );
            }),
        ),
      ),
    searchTimeout,
  );
});
