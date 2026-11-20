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
 * - `#pantry/test/oracle-laws/tests.ts`: the tests and sections (O7).
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
  documentDocumentBreaches,
  documentLaws,
  documentPackageBreaches,
} from "#pantry/test/oracle-laws/documents.ts";
import {
  expressionDocumentBreaches,
  expressionLaws,
} from "#pantry/test/oracle-laws/expressions.ts";
import { viewOf } from "#pantry/test/oracle-view.ts";
import type { LawBreach, TypedReading } from "#pantry/test/oracle-view.ts";
import {
  testDocumentBreaches,
  testLaws,
  testPackageBreaches,
} from "#pantry/test/oracle-laws/tests.ts";

export { addedLaws, lomNamedTypes, objectRoots } from "#pantry/test/oracle-laws/documents.ts";

/**
 * Every law this module's producers raise.
 */
const producedLaws = [...documentLaws, ...expressionLaws, ...testLaws] as const;

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
 * in manifest order, its entries' paths, and each document's path with the paths of the documents
 * its includes splice in place (spec reading 117).
 */
interface LawPackage {
  readonly documents: readonly LawDocument[];
  readonly entries: readonly string[];
  readonly manifest: { readonly path: string; readonly rows: FoldedRows<Composed> };
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
 * @returns The breaches, module by module.
 */
export const lawDocumentBreaches = (
  path: string,
  rows: FoldedRows<Composed>,
  grammar: ComposedGrammar,
  typed: TypedReading,
): readonly LawBreach<ProducedLaw>[] => {
  const indexed = viewOf(path, rows, typed);

  return [
    ...documentDocumentBreaches(indexed, grammar),
    ...expressionDocumentBreaches(indexed, grammar),
    ...testDocumentBreaches(indexed, grammar),
  ];
};

/**
 * Judge a package by every producer's laws over more than one document.
 *
 * @param input - The package.
 * @param grammar - The composed grammar.
 * @param typed - How an attribute's type reads its value.
 * @returns The breaches, module by module.
 */
export const lawPackageBreaches = (
  input: LawPackage,
  grammar: ComposedGrammar,
  typed: TypedReading,
): readonly LawBreach<ProducedLaw>[] => {
  const rows = {
    documents: input.documents.map(({ path, resourceType, rows: folded }) => ({
      path,
      resourceType,
      rows: viewOf(path, folded, typed),
    })),
    entries: new Set(input.entries),
    manifest: viewOf(input.manifest.path, input.manifest.rows, typed),
    spliced: input.spliced,
  };

  return [...documentPackageBreaches(rows, grammar), ...testPackageBreaches(rows, grammar)];
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
 * The laws an install's policy states, the package-media level's (`#pantry/qti/media.ts`) and the
 * LOM level's (`#pantry/qti/lom.ts`), each with why the oracle declares none: the oracle judges a
 * package as this package's own install does, which states none of them, so a package the oracle
 * accepts may break one. The database of such an install is their judge.
 */
export const policyLaws = {
  "Author credit":
    "the LOM policy asks the manifest's record for an author's credit whose vCard has an EMAIL, which QTI asks of no package",
  "Deletion version":
    "the LOM policy holds a package of no resource to the status unavailable and a withdrawn one to no resource, a shape QTI leaves free",
  "Entry used":
    "the policy refuses a file no document is and no reference resolves to, which this package's own install keeps, as IMS Content Packaging lets a package hold",
  "LOM vCard":
    "the LOM policy holds every contribute's entity to a vCard 3.0 with its N and FN, which this package's own install keeps as text, as 1EdTech's own example writes it without either",
  "LOM vocabulary":
    "the LOM policy holds a status's, a role's, a relation kind's and a purpose's terms to LOMv1.0's tokens, which QTI's loose binding does not enforce (QTI 3.0 Metadata §3.6) and 1EdTech's own examples write otherwise (Creator, Final)",
  "Media data":
    "the policy refuses a data: address, which this package's own install admits as any URI",
  "Media entity":
    "the policy refuses a kept entity reference in what a player fetches, and an external identifier in a document type declaration, which this package's own install keeps",
  "Media foreign":
    "the policy refuses foreign markup and every open attribute class but data-*, which this package's own install keeps",
  "Media path":
    "the policy holds every fetched address to a file of the package, which this package's own install leaves free to name any URL",
  "Media style": "the policy refuses a style that fetches, which this package's own install admits",
  "Media type":
    "the policy holds every fetched entry to an extension it lists, which this package's own install leaves free",
  "One head":
    "the LOM policy holds each lesson to one head of its versions, a chain QTI states nothing of",
  "Package grade":
    "the LOM policy asks the manifest's record for a classification of purpose educational level, which QTI asks of no package",
  "Package identity":
    "the LOM policy asks the manifest's record for one general identifier whose entry is the manifest's identifier, where QTI 3.0 Metadata §2.7.1.1 holds only an identifier a record lists, and this package's own install reads no manifest record (reading 146)",
  "Package relation target":
    "the LOM policy holds a relation in its package scheme to a stored package, a catalog QTI names nothing in",
  "Package subject":
    "the LOM policy asks the manifest's record for a classification of purpose discipline, which QTI asks of no package",
  "Publisher credit":
    "the LOM policy asks the manifest's record for a publisher's credit whose vCard has an ORG, which QTI asks of no package",
  "Source pointer":
    "the LOM policy asks the manifest's record for one isbasedon relation naming a SHA-256, which QTI asks of no package",
  "Version lesson":
    "the LOM policy narrows isversionof to an earlier stored package of the same lesson, which LOM and QTI leave free",
} as const satisfies Readonly<Record<string, string>>;

/**
 * The laws the schema states that no host predicate over a package's rows can judge, each with
 * why. None is a rule of the specification a package can break: each is a law over rows the
 * importer writes beside the tree, copied from it, which the host writes none of. Only an importer
 * that writes rows its tree does not give breaks one, so the database tier is its judge.
 */
export const hostlessLaws = {
  "Declaration overlay":
    "its rows (MasteryValue, NormalMinimum, NormalMaximum) are copies the importer writes of each outcome declaration's scale attributes, a normal minimum it does not write being its XSD default (plan §1.7 O2, C18; reading 149); the host writes no such row, and a package's text can make no copy disagree with what it copies",
  Document:
    "its rows (Document, XmlDecl, EncodingDecl, SdDecl) are the document layer's copies of each document's tree, which the importer writes from it (documentRowsOf, src/import/write.ts): one Document row keyed by the document node's package and path, its rootKind its root element's kind, and the XML declaration's rows under that document alone; the host writes no such row, and a package's text can make no copy disagree with the tree it copies",
  "Entry family":
    "its rows are the package's entries, a set keyed by path, each contained in its package; two entries of one path never reach a row, since the ZIP reader refuses them under zip-format (src/package/zip.ts, 'the archive holds two entries with this name')",
  "Entry kind":
    "its rows are the package's entries, each of the kind the importer reads its file as (src/import/record.ts): a document where it shreds one, which is that Document row's, and media, with the digest of the bytes it read, everywhere else; the host writes no such row, and a package's text can make no entry's kind disagree with the documents the importer reads from it",
  "Manifest overlay":
    "its rows (ResourceHref, File) are each href's resolution, at its element's node, and the manifest's identifier is its attribute's value, the query manifestIdentifiers (plan §1.6, C18); the host writes no such row, and a package's text can make no row disagree with the attributes it stands at",
  "Mapping overlay":
    "its rows (MapKey and LookupValue) are copies the importer writes of each map entry's map-key and each lookup table's typed attribute values (plan §1.7 O5, C18); the host writes no such row, and a package's text can make no copy disagree with what it copies",
  "Package key":
    "its one row per package is keyed by the name its importer's caller gives it, which every row of the package holds; no package's text states it, so no package text can repeat or omit it, and an import of another package under a stored name is refused on the rows the two packages share, whatever their text",
  "Reference overlay":
    "its rows (DocumentDirectory, XmlBase, Reference, ReferencePath) are each document's directory and each reference's split, which the importer writes and resolves from the tree (CP 1.2 (b) and (d), reading 102); the host writes no such row, and the laws a package can break over its references are the oracle's Href form, File exists and Stimulus ref target",
  "Test overlay":
    "its rows (TestDocument, TestFlag, Named, Section, SectionMember, SectionSelection, SectionOrdering, Site, BranchRule) are copies the importer writes of each test element's node and attributes, collapsed (plan §1.7 O7, C15, C18); the host writes no such row, and a package's text can make no copy disagree with what it copies",
} as const satisfies Readonly<Record<string, string>>;
