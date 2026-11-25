/**
 * The producers of the laws the law oracle (`#pantry/test/oracle.ts`) declared and never raised
 * (lane OL, R87's finding): the oracle named each law in its tables, and no judgment of it could
 * break one, so every test that said "the law oracle predicts it" was vacuous for that law.
 *
 * Each producer states its law on the host from its source in the oracle's `lawSources` and the
 * schema's statement of it (`src/qti/**`), so the oracle judges what the database judges:
 *
 * - `#pantry/test/oracle-laws/documents.ts`: the declarations (O2), the LOM title (O6), and the laws
 *   the schema states that the oracle had not declared, which it declares here (`addedLaws`);
 * - `#pantry/test/oracle-laws/expressions.ts`: the expressions (O4);
 * - `#pantry/test/oracle-laws/tests.ts`: the tests and sections (O7);
 * - `#pantry/test/oracle-laws/readings.ts`: the readings of a test's variable references;
 * - `#pantry/test/oracle-laws/content.ts`: the content references, each in its scope's declarations.
 *
 * The oracle reads them through {@link lawDocumentBreaches}, over each document it judges, after
 * its own laws, and {@link lawPackageBreaches}, over the package, after its own. A law the schema
 * states that no package can break, and so no host predicate can judge, is a row of
 * {@link hostlessLaws} with the reason, never a silent gap: `src/test/complete.oracle.test.ts`
 * holds that every law the schema states is the oracle's or hostless, and that every law the oracle
 * declares is raised by a package drawn to break it.
 */
import type { ComposedGrammar } from "#pantry/grammar/compose.ts";
import type { Composed } from "#pantry/model/composed.ts";
import type { FoldedRows } from "#pantry/model/folds.ts";
import {
  contentDocumentBreaches,
  contentLaws,
  contentPackageBreaches,
} from "#pantry/test/oracle-laws/content.ts";
import {
  documentDocumentBreaches,
  documentLaws,
  documentPackageBreaches,
} from "#pantry/test/oracle-laws/documents.ts";
import {
  expressionDocumentBreaches,
  expressionLaws,
  expressionPackageBreaches,
} from "#pantry/test/oracle-laws/expressions.ts";
import type { PlacementScope } from "#pantry/test/oracle-laws/expressions.ts";
import { Option } from "effect";
import { viewOf } from "#pantry/test/oracle-view.ts";
import type { LawBreach, PackageRows, TypedReading } from "#pantry/test/oracle-view.ts";
import {
  readingLaws,
  readingPackageBreaches,
  scopedReadsOf,
} from "#pantry/test/oracle-laws/readings.ts";
import {
  testDocumentBreaches,
  testLaws,
  testPackageBreaches,
} from "#pantry/test/oracle-laws/tests.ts";

export { addedLaws, lomNamedTypes, objectRoots } from "#pantry/test/oracle-laws/documents.ts";

/**
 * Every law this module's producers raise.
 */
const producedLaws = [
  ...documentLaws,
  ...expressionLaws,
  ...testLaws,
  ...readingLaws,
  ...contentLaws,
] as const;

/**
 * A law of {@link producedLaws}.
 */
type ProducedLaw = (typeof producedLaws)[number];

/**
 * One document the package's manifest lists, as the oracle hands it over: its path, the `type`
 * of the resource that lists it, and its own folded rows.
 */
interface LawDocument {
  readonly path: string;
  readonly resourceType: string;
  readonly rows: FoldedRows<Composed>;
}

/**
 * A package as the oracle hands it over: its manifest's rows, the documents it lists that folded,
 * in manifest order, which of them are assembled, its entries' paths, the sites that place their
 * targets, and each document's path with the paths of the documents its includes splice in place
 * (spec reading 117).
 */
export interface LawPackage {
  readonly assembled: PackageRows["assembled"];
  readonly documents: readonly LawDocument[];
  readonly entries: readonly string[];
  readonly manifest: { readonly path: string; readonly rows: FoldedRows<Composed> };
  readonly placements: PackageRows["placements"];
  readonly spliced: ReadonlyMap<string, readonly string[]>;
}

/**
 * Judge one folded document by every producer's laws over a document alone. The oracle calls it
 * on the rows it judges its own document laws over, an including document's merged with what it
 * includes.
 *
 * @param path - The document's path in its package.
 * @param rows - Its folded rows.
 * @param grammar - The composed grammar.
 * @param typed - How an attribute's type reads its value.
 * @param read - Where the document heads a test, its readings of a reference through a scope (spec
 *   reading 167), none for any other.
 * @returns The breaches, module by module.
 */
export const lawDocumentBreaches = (
  path: string,
  rows: FoldedRows<Composed>,
  grammar: ComposedGrammar,
  typed: TypedReading,
  read: PlacementScope["read"] = () => Option.none(),
): readonly LawBreach<ProducedLaw>[] => {
  const indexed = viewOf(path, rows, typed);

  return [
    ...documentDocumentBreaches(indexed, grammar),
    ...expressionDocumentBreaches(indexed, grammar, read),
    ...testDocumentBreaches(indexed, grammar),
    ...contentDocumentBreaches(indexed, grammar),
  ];
};

/**
 * Read a package as the package-level producers read it: each document's rows indexed by their
 * types.
 *
 * @param input - The package as the oracle hands it over.
 * @param typed - How an attribute's type reads its value.
 * @returns Its rows.
 */
const packageRowsOf = (input: LawPackage, typed: TypedReading): PackageRows => ({
  assembled: input.assembled,
  documents: input.documents.map(({ path, resourceType, rows: folded }) => ({
    path,
    resourceType,
    rows: viewOf(path, folded, typed),
  })),
  entries: new Set(input.entries),
  manifest: viewOf(input.manifest.path, input.manifest.rows, typed),
  placements: input.placements,
  spliced: input.spliced,
});

/**
 * Each test's readings of a reference through a scope (spec reading 167), by the test's path, none
 * under any other document: what {@link lawDocumentBreaches} reads a test's references by, and
 * {@link lawPackageBreaches} those of each document a test places.
 *
 * @param input - The package.
 * @param grammar - The composed grammar.
 * @param typed - How an attribute's type reads its value.
 * @returns Each test's readings.
 */
export const lawReadsOf = (
  input: LawPackage,
  grammar: ComposedGrammar,
  typed: TypedReading,
): ((path: string) => PlacementScope["read"]) =>
  scopedReadsOf(packageRowsOf(input, typed), grammar);

/**
 * Judge a package by every producer's laws over more than one document.
 *
 * @param input - The package.
 * @param grammar - The composed grammar.
 * @param typed - How an attribute's type reads its value.
 * @param readsOf - Each test's readings through a scope ({@link lawReadsOf}).
 * @returns The breaches, module by module.
 */
export const lawPackageBreaches = (
  input: LawPackage,
  grammar: ComposedGrammar,
  typed: TypedReading,
  readsOf: (path: string) => PlacementScope["read"],
): readonly LawBreach<ProducedLaw>[] => {
  const rows = packageRowsOf(input, typed);

  return [
    ...documentPackageBreaches(rows, grammar),
    ...expressionPackageBreaches(rows, grammar, readsOf),
    ...testPackageBreaches(rows, grammar),
    ...readingPackageBreaches(rows, grammar),
    ...contentPackageBreaches(rows, grammar),
  ];
};

/**
 * The laws of the catalog (`#pantry/vocab/laws.ts` `lawTable`) that the oracle states as
 * several laws of its own, each part a law of the oracle with the stated law's rule.
 *
 * - `N2 tree`: grizzle's tree statement over `Node` (`tree(on(Node, "parent", "at"), fin(Node,
 *   "children"), { root: "document" })`, its key `(parent, at)`, `UNIQUE (document, start)` and its
 *   interval checks, trees.md §2 to §4), which the oracle states as its key, its slot key and each
 *   interval law T1 to T6.
 */
export const statedInParts = {
  "N2 tree": [
    "Node key",
    "N2 key",
    "T1 document order",
    "T2 root",
    "T3 first child",
    "T4 next sibling",
    "T5 last child",
    "T6 nonempty and leaf",
  ],
} as const satisfies Readonly<Record<string, readonly string[]>>;

/**
 * The laws a level above `Qti` states, the LOM level's (`#pantry/qti/lom.ts`), each with why the
 * oracle declares none: the oracle judges a package as this package's own install does, which
 * states none of them, so a package the oracle accepts may break one. The database of an install
 * that stacks them is their judge. The package-media level (`#pantry/qti/media.ts`) states no law:
 * it refuses no package `Qti` admits.
 */
export const policyLaws = {
  "LOM vCard":
    "the LOM level holds every contribute's entity to a vCard 3.0 with its frame, its VERSION, its N and its FN, LOM 2.3.2's value space, which this package's own install keeps as text, as 1EdTech's own example, no normative text, writes it without N and VERSION",
  "LOM vocabulary":
    "the LOM level holds a status's, a role's, a relation kind's and a purpose's value of LOM's own vocabulary, its source LOMv1.0, empty or not written, to LOMv1.0's tokens (IEEE 1484.12.1-2002 §4.4), a term of any other source unread, which this package's own install does not hold, as 1EdTech's own examples write otherwise (Creator, Final)",
} as const satisfies Readonly<Record<string, string>>;

/**
 * The laws the schema states that no host predicate over a package's rows can judge, each with
 * why. None is a rule of the specification a package can break: each is a law over rows the
 * importer writes beside the tree, copied from it, which the host writes none of. Only an importer
 * that writes rows its tree does not give breaks one, so the database tier is its judge.
 */
export const hostlessLaws = {
  Document:
    "its rows (Document, XmlDecl, EncodingDecl, SdDecl) are the document layer's copies of each document's tree, which the importer writes from it (documentRowsOf, src/import/write.ts): one Document row keyed by the document node's package and path, its rootKind its root element's kind, and the XML declaration's rows under that document alone; the host writes no such row, and a package's text can make no copy disagree with the tree it copies",
  "Entry family":
    "its rows are the package's entries, a set keyed by path, each contained in its package; two entries of one path never reach a row, since the ZIP reader refuses them under zip-format (src/package/zip.ts, 'the archive holds two entries with this name')",
  "Entry kind":
    "its rows are the package's entries, each of the kind the importer reads its file as (src/import/record.ts): a document where it shreds one, which is that Document row's, and media, with the digest of the bytes it read, everywhere else; the host writes no such row, and a package's text can make no entry's kind disagree with the documents the importer reads from it",
  "Manifest overlay":
    "its rows (ResourceHref, File, each beside the arm its scope names: ResourceHrefPath and FilePath in the package, ResourceHrefOutside and FileOutside outside it) are each href's resolution, at its element's node, and the manifest's identifier is its attribute's value, the query manifestIdentifiers (plan §1.6, C18); the host writes no such row, and a package's text can make no row disagree with the attributes it stands at",
  "Package key":
    "its one row per package is keyed by the name its importer's caller gives it, which every row of the package holds; no package's text states it, so no package text can repeat or omit it, and an import of another package under a stored name is refused on the rows the two packages share, whatever their text",
  "Package sealed":
    "it holds of the transactions that write a package's rows, never of the rows: the one import that founds a package writes all of them in its one ChangeSet, so no package's text can break it, and only a second write of a founded package's rows, which no import makes, is refused",
  "Reference overlay":
    "its rows (DocumentDirectory, XmlBase, Reference, ReferencePath) are each document's directory and each reference's split, which the importer writes and resolves from the tree (CP 1.2 (b) and (d), reading 102); the host writes no such row, and the laws a package can break over its references are the oracle's Href form, File exists and Stimulus ref target",
  "Test overlay":
    "its rows (AssembledDocument, TestFlag, Named, Section, SectionMember, SectionSelection, SectionOrdering, Site, BranchRule) are copies the importer writes of each test element's node and attributes, collapsed (plan §1.7 O7, C15, C18); the host writes no such row, and a package's text can make no copy disagree with what it copies",
} as const satisfies Readonly<Record<string, string>>;
