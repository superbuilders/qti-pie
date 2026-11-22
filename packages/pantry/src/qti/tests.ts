/**
 * Tests, sections, and the assemblies their section refs and includes make (plan §1.7 O7, N11 and
 * D13; the W5 amendment's C2, C15, C17, C18 and C21; `representation-gaps.md` RG3; spec readings
 * 5, 85 to 88 and 114 to 117).
 *
 * Pantry stores every valid QTI 3.0.1 document (owner, 2026-11-20: "we follow the spec"; the
 * database never refuses valid QTI, conformance §3 and §4.4). A **test** is a test document, whose
 * root is a `qti-assessment-test` (information model §4.4), the head of its own assembly. A
 * **section document** is a document whose root is a `qti-assessment-section`, which a test's
 * section refs may place (§7.5: "The only documents that can be refered to by
 * qti-assessment-section-ref are XML documents that contain a single qti-assessment-section as a
 * single root. There are no other restrictions on the referenced qti-assessment-section document");
 * a **bank** is such a document, read by its path and the item refs it holds. A test's section refs
 * and the includes its sections hold are sites that place their target in the test's assembly
 * (reading 85), so the test a law reads is the assembled test (reading 5): its documents' names,
 * branch rules and references are judged across every placement
 * (`#pantry/qti/overlay-queries/tests.ts`).
 *
 * A bank is `(package, path)`, its section document, as an item is (SV-KEY-01): QTI makes a
 * section's identifier unique only within its test (§4.2.1), so two banks of one package may share
 * one. Its members are the query `BankMember` (`#pantry/qti/queries.ts`), by the bank's path and
 * the item ref's identifier, whose **Item ref identifier** is QTI §4.1.1's own MUST, that an item
 * ref's identifier is its item's: a member is the item.
 *
 * **The documents.** Every assembled document has a {@link AssembledDocument} row, the owner of its
 * sites' targets, a counted family ({@link SiteTarget}, each `xi:include` that names a document),
 * and of its names ({@link Named}, a bank's root section and each item ref), each a row at it. Each
 * href of an item ref or a site resolves, against its document's path or the `xml:base` in scope,
 * to an entry of the package through its `ReferencePath` (`#pantry/qti/package.ts` `hrefPaths`,
 * spec readings 102 and 103).
 *
 * **The assembly** (RG3, reading 117). {@link Instance} is a tree: its root is a document that
 * heads an assembly, every assembled document no include splices in place
 * ({@link splicingParents}), and each instance has exactly one child per site of its document that
 * places its target, the instance of the document that include names, whatever its parent
 * ({@link sitesFold}). A chain of includes that returns to a document already on it would need
 * infinitely many instances, so no finite tree holds it: the count law `children = sites` refuses
 * one a head reaches, and the containment of every `AssembledDocument` into the documents some
 * instance places (the query `InstanceDocument`, `#pantry/qti/queries.ts`) one no head reaches
 * (reading 85). A bank heads a trivial assembly of its own.
 *
 * Beside them: an item's stimulus refs ({@link StimulusRef}), keyed by its element with its law a
 * key, and the item each item ref names ({@link ItemRefHref} and {@link ItemRefDocument}, with the
 * query `ItemRefTarget` of `#pantry/qti/queries.ts`, B2 and B3).
 *
 * Every identifier a law compares is its attribute's `value`, read where it stands and copied by no
 * row (C18), its lexical form collapsed, as every QTI identifier type collapses whitespace: a rule
 * over a query reads it (`TestIdentifier`, `#pantry/qti/overlay-queries/tests.ts`), and no index
 * holds it (the addendum's "Text in keys").
 *
 * Every check is named by the oracle law it states, its spaces written as underscores. The hrefs
 * this module reads resolve under `#pantry/qti/package.ts`'s stated limit `Href form`, never a law
 * of QTI.
 */
import {
  accumulated,
  bits,
  Bits,
  check,
  closed,
  closedId,
  contained,
  counted,
  drawn,
  fin,
  fold,
  key,
  law,
  Monoid,
  on,
  pg,
  relation,
  select,
  Text,
  tree,
} from "@bjornpagen/grizzle";
import type { RowScalars } from "@bjornpagen/grizzle";
import type { Kind } from "#pantry/grammar/compose.ts";
import {
  AttributeName,
  Flag,
  Governor,
  IncludeMember,
  includeParentKinds,
  IncludeSetOf,
  SplitRoot,
  NodeKind,
} from "#pantry/grammar/install.ts";
import { attributesOf } from "#pantry/qti/attributes.ts";
import { Document } from "#pantry/qti/chardata.ts";
import { namePattern } from "#pantry/qti/declarations.ts";
import { EntryPath, KeyMatchedText, PackageName, QtiIdentifier } from "#pantry/qti/limits.ts";
import { Node, nodeContext } from "#pantry/qti/node.ts";
import { Entry, hrefPaths, Reference } from "#pantry/qti/package.ts";
import {
  assembledRoots,
  includeKind,
  itemKind,
  itemRefKind,
  sectionKind,
  sectionRefKind,
  splicingParents,
  stimulusRefKind,
} from "#pantry/vocab/terms/tests.ts";
import { declared, entryOf, natural } from "#pantry/qti/law-entries.ts";

/**
 * An assembled document, keyed by its `(package, path)`, its `Document`'s key: the counts of its
 * families. Its root kind is its `Document`'s alone (decision S3), which every law that reads it
 * matches at `(package, path)`. Its hrefs resolve against its path or the `xml:base` in scope
 * (`#pantry/qti/package.ts` `ReferencePath`).
 *
 * - **the host's:** `package` and `path`, its `Document`'s key;
 * - **drawn:** `targets`, the count of {@link siteFamily}, which {@link sitesFold} folds over; and
 *   `instances`, its placements in every assembly, the count of {@link documentInstanceFamily},
 *   which a placed share's and a placed catalog's `placements` copy (`#pantry/qti/mathml-share.ts`,
 *   `#pantry/qti/catalog.ts`);
 * - **accumulated:** `sites`, the count of its sites that place their target ({@link sitesFold}), the
 *   children each of its instances holds.
 */
export const AssembledDocument = law(
  entryOf("Test overlay"),
  relation(
    "AssembledDocument",
    {
      instances: drawn(natural),
      package: PackageName,
      path: EntryPath,
      sites: accumulated(natural, 0n),
      targets: drawn(natural),
    },
    ["package", "path"],
  ),
);

/**
 * A bank's root section or one of its item refs that writes an identifier, keyed by its element:
 * the elements whose identifiers are a bank's identity and its members'. One that writes none names
 * nothing and has no row: AL3 refuses it alone (reading 147). AL1 holds a written identifier to its
 * domain, `IdentifierDType`, an NCName once collapsed, so every one names something (spec reading
 * 152, decision 457 (2)).
 *
 * - **the host's:** `identifier`, its collapsed identifier, its attribute's `value`
 *   (`TestIdentifier`, `#pantry/qti/overlay-queries/tests.ts`). Its kind, parent and parent's kind
 *   are its node's, which its laws and the bank reads match in `Node`.
 *
 * The import writes its rows where its form names something (`namedBy` of
 * `#pantry/import/names.ts`, which lists every such relation), a gate no form AL1 admits closes.
 */
export const Named = law(
  entryOf("Test overlay"),
  relation(
    "Named",
    { identifier: QtiIdentifier, package: PackageName, path: EntryPath, start: natural },
    ["package", "path", "start"],
  ),
);

/**
 * An include under a parent the information model gives an Include (spec reading 114), keyed by
 * its element: the place where the document it names is merged into its own (information model
 * §2.12).
 *
 * - **the host's:** its node's context, the {@link nodeContext} tuple (`package`, `path`, `start`,
 *   `children`, `ancestry`, `governor`, `kind`, `nearest`, `nearestKind`, `nearestPath`,
 *   `parentKind`); `parent`; and `external`, whether its href resolves outside the package, which
 *   its href's `Reference` row proves (an external include is stored as written and never
 *   fetched).
 *
 * Its href's path is its {@link SitePath}, a row of its own, since an include may write no href;
 * and the document that path names is its {@link SiteTarget}, a row of its own, since a path may
 * name none (spec reading 115).
 */
export const Site = law(
  entryOf("Test overlay"),
  relation(
    "Site",
    {
      ancestry: bits(Flag),
      children: natural,
      external: pg.boolean,
      governor: closedId(Governor),
      kind: closedId(NodeKind),
      nearest: natural,
      nearestKind: closedId(NodeKind),
      nearestPath: EntryPath,
      package: PackageName,
      parent: natural,
      parentKind: closedId(NodeKind),
      path: EntryPath,
      start: natural,
    },
    ["package", "path", "start"],
  ),
);

/**
 * A site's href, keyed by the site's element: its `target`, the entry path its `ReferencePath`
 * resolves it to (`#pantry/qti/package.ts` `hrefPaths`), in the site's own package, the site's
 * `kind`, and `entry`, whether the package holds an entry at that path. A row only where the site
 * writes an href that resolves to a path of the package.
 *
 * - An include may write none (XInclude 1.0 §3.1, the href "absent when parse="xml""), or one that
 *   names its own document, and names no document of the package then, so it has no row and
 *   "Include target" refuses it alone (spec reading 115); one whose href resolves outside the
 *   package has no row either, and its site is marked `external`, stored as written and never
 *   fetched.
 * - A path no entry holds is `entry` false, which `File_exists` refuses as the row is inserted,
 *   before any deferred key: an href naming an absent file is refused under "File exists" alone,
 *   whatever its site is, and the site's document laws read only paths an entry holds.
 */
export const SitePath = law(
  entryOf("Test overlay"),
  relation(
    "SitePath",
    {
      entry: pg.boolean,
      kind: closedId(NodeKind),
      package: PackageName,
      path: EntryPath,
      start: natural,
      target: EntryPath,
    },
    ["package", "path", "start"],
  ),
);

/**
 * A site's target, keyed by the site's element: the document its href names, a row only where the
 * href names a document of the package, so a site whose href names none has no row, and "Include
 * target" refuses it (spec readings 114 and 115), unless it is an include that holds an
 * `xi:fallback`, which XInclude puts in its place, admitted and unplaced (`UnplacedInclude`). It is
 * the member of the family of the sites that name a document ({@link siteTargetFamily}), so every
 * member's owner is a document the package writes, and of its own document's ({@link siteFamily}),
 * so a site that names none places nothing.
 *
 * - **the host's:** `target`, the document's path, with its root kind (`targetRoot`) and its
 *   context's nearest interaction, the document and position that hold it and its kind
 *   (`targetNearestPath`, `targetNearest`, `targetNearestKind`);
 * - **the site's copies:** its {@link SitePath}'s `target`; its `kind` and `parentKind`; its own
 *   context's nearest interaction (`nearest`, `nearestKind`), in its own document; and its
 *   `ancestry`, its part of the target's context (`Document.context`, the union over the sites that
 *   name a document, spec reading 117);
 * - **its include's:** `splices`, whether it splices its target in place, and `places`, whether it
 *   places its target at all, its {@link Inclusion}'s.
 */
export const SiteTarget = law(
  entryOf("Test overlay"),
  relation(
    "SiteTarget",
    {
      ancestry: bits(Flag),
      kind: closedId(NodeKind),
      nearest: natural,
      nearestKind: closedId(NodeKind),
      package: PackageName,
      parentKind: closedId(NodeKind),
      path: EntryPath,
      places: pg.boolean,
      splices: pg.boolean,
      start: natural,
      target: EntryPath,
      targetNearest: natural,
      targetNearestKind: closedId(NodeKind),
      targetNearestPath: EntryPath,
      targetRoot: closedId(NodeKind),
    },
    ["package", "path", "start"],
  ),
);

/**
 * An include's site as an include, keyed by its element: its parent's kind, which keys
 * its family's `IncludeSetOf` row, its target's root kind, the kind the include stands for (spec
 * reading 114), and `splices`, whether it splices that document in place: its parent is one of
 * {@link splicingParents} and it may stand for the root (`IncludeRoot`), as the law oracle's
 * `standsFor` judges. An include that may not stand for its target's root splices nothing, so its
 * target is judged as no fragment of its document's; and `places`, whether it places that document
 * at all: it may stand for the root, whatever its parent. One that may not places nothing: "Include
 * root" refuses it, unless its root is the name of a kind the composition splits by context whose
 * split kind it may stand for (spec reading 116), admitted and `UnplacedInclude`'s `root`.
 */
export const Inclusion = law(
  entryOf("Test overlay"),
  relation(
    "Inclusion",
    {
      package: PackageName,
      parentKind: closedId(NodeKind),
      path: EntryPath,
      places: pg.boolean,
      root: closedId(NodeKind),
      splices: pg.boolean,
      start: natural,
    },
    ["package", "path", "start"],
  ),
);

/**
 * One placement of a document in an assembly, the tree of RG3 (`representation-gaps.md` §3.3): its
 * root an assembly's own document, and each other row the document one include of its parent's
 * document names. An assembly is named by its head document's path, so each `(package, assembly)`
 * is one tree, and an instance by its pre-order position in it.
 *
 * - **the host's:** `package` and `assembly`, the root fields, on the root alone; `document`, the
 *   path of the document it places, and `rootKind`, that document's root kind; `assemblyKind`, its
 *   root's; and its site, `(siteDocument, site)`, the document of its parent and the start of the
 *   include there it is placed at (the root's own document and 0, its document node);
 * - **drawn:** the tree's `parent`, `at`, `children`, `start` and `end`; and the counts of its
 *   document's rows it places (spec reading 117): `bindings`, Q5.09's `PlacedBinding` rows, under
 *   an item's assembly alone; `choices` and `hottexts`, Q5.09's `PlacedChoice` and `PlacedHottext`
 *   rows; and `ids` and `idrefTargets`, Q5.07's `PlacedId` and `PlacedIdref` rows, each its
 *   document's count. What a placement types, its expressions and references, is a rule over a
 *   query (`PlacedExpressionSite` and `PlacedReferenceSite`,
 *   `#pantry/qti/overlay-queries/expression.ts` and `reference.ts`), since an item's own placement
 *   types the template it locates beside its own document.
 */
export const Instance = law(
  entryOf("Inclusion cycle"),
  relation(
    "Instance",
    {
      assembly: EntryPath,
      assemblyKind: closedId(NodeKind),
      at: drawn(natural),
      bindings: drawn(natural),
      children: drawn(natural),
      choices: drawn(natural),
      document: EntryPath,
      end: drawn(natural),
      hottexts: drawn(natural),
      idrefTargets: drawn(natural),
      ids: drawn(natural),
      package: PackageName,
      parent: drawn(natural),
      rootKind: closedId(NodeKind),
      site: natural,
      siteDocument: EntryPath,
      start: drawn(natural),
    },
    ["package", "assembly", "start"],
  ),
);

/**
 * An item's stimulus ref that writes an identifier, keyed by its element (information model §7.6):
 * its collapsed `identifier`. One that writes none has no row: AL3 refuses it alone (reading 147).
 */
export const StimulusRef = law(
  entryOf("Test overlay"),
  relation(
    "StimulusRef",
    { identifier: QtiIdentifier, package: PackageName, path: EntryPath, start: natural },
    ["package", "path", "start"],
  ),
);

/**
 * The href of an item ref that writes one, keyed by the item ref's element: `target`, the entry
 * path its href resolves to in the ref's own package (its `ReferencePath`, `#pantry/qti/package.ts`
 * `hrefPaths`). What it names is the query `ItemRefTarget` (`#pantry/qti/queries.ts`): the type of
 * a resource of the package whose href's path that is, of the item type or else an LTI type, which
 * "Item ref target" judges. An item ref with no target (`UntargetedItemRef` there) must name a path
 * a resource of an unread type names (`UnreadTypeHref`, spec reading 67): the type of what it names
 * is unread, so the law oracle names it no target to judge (its `itemRefTargetOf`). An unread type
 * is itself a refusal, AL1's value domain, so this narrows the law set, never a verdict. An item
 * ref that writes no href has none, which AL3 alone refuses (spec reading 155), and so has one
 * whose href resolves to no entry, an empty one, which names its own document (reading 102), an
 * external one or one the importer cannot resolve: "Item ref target" refuses it through its href's
 * containment here.
 */
export const ItemRefHref = law(
  entryOf("Item ref target"),
  relation(
    "ItemRefHref",
    { package: PackageName, path: EntryPath, start: natural, target: EntryPath },
    ["package", "path", "start"],
  ),
);

/**
 * The item document an item ref names, keyed by the item ref's element: `target`, the item
 * document's path, a row only where the package holds a document at the path of an item ref's
 * target of the item type (`ItemRefTarget`, `#pantry/qti/queries.ts`), and none for an LTI link's,
 * so an item resource whose file the package lacks has none, which "Item ref target" refuses.
 */
export const ItemRefDocument = law(
  entryOf("Test overlay"),
  relation(
    "ItemRefDocument",
    { package: PackageName, path: EntryPath, start: natural, target: EntryPath },
    ["package", "path", "start"],
  ),
);

/**
 * A numbered reading of a variable reference placed in a test's assembly, as the importer finds it,
 * keyed by the test, the reference (its element's place and attribute) and the reading's scope and
 * number (information model §7.47: "In adaptive tests that contain items that are allowed to be
 * replaced ... a number that denotes the instance's place in the sequence of the item's
 * instantiation is inserted between the item variable identifier and the item variable, separated
 * by a period character"; spec reading 88): `scopeInstance`, `scopePath` and `scope`, the placement
 * and the element of the item ref the reading names, `number`, the instance number as written, and
 * `variable`, the item variable it names. The importer states one row for each numbered reading
 * that resolves, and the database proves each one: its spelling, its item ref a selection with
 * replacement can repeat, its number at least 1, and its variable one the item names
 * (`#pantry/qti/overlay-queries/readings.ts`). The database enumerates every other reading itself;
 * a numbered one it cannot, since no text operation it has splits a name at a period (a grizzle ask
 * of 2026-11-20), so a name whose only readings are two numbered ones is the importer's to tell
 * apart, a recorded under-refusal (spec reading 88).
 */
export const NumberedReading = law(
  entryOf("E1 derived"),
  relation(
    "NumberedReading",
    {
      assembly: EntryPath,
      attribute: closedId(AttributeName),
      number: KeyMatchedText,
      package: PackageName,
      path: EntryPath,
      scope: natural,
      scopeInstance: natural,
      scopePath: EntryPath,
      start: natural,
      variable: QtiIdentifier,
    },
    ["package", "assembly", "path", "start", "attribute", "scopeInstance", "scope", "number"],
  ),
);

/**
 * A split reading of a variable reference placed in a test's assembly through an item ref that
 * names no item document, an LTI link or an href outside the package, as the importer finds it,
 * keyed by the test, the reference and the scope's placement: `variable`, the name after the
 * scope's identifier and its period, which no declaration of the package can check (spec reading
 * 110), but which is an NCName, as every variable's identifier is ("E1 derived", `namePattern`), so
 * a numbered name through a repeated link is no link reading. The database proves its spelling and
 * its scope (`#pantry/qti/overlay-queries/readings.ts`);
 * it cannot find one itself, since no text operation it has takes what follows a name's prefix in
 * a query (the grizzle ask of 2026-11-20).
 */
export const LinkReading = law(
  entryOf("E1 derived"),
  relation(
    "LinkReading",
    {
      assembly: EntryPath,
      attribute: closedId(AttributeName),
      package: PackageName,
      path: EntryPath,
      scope: natural,
      scopeInstance: natural,
      scopePath: EntryPath,
      start: natural,
      variable: QtiIdentifier,
    },
    ["package", "assembly", "path", "start", "attribute", "scopeInstance", "scope"],
  ),
);

/**
 * Why an include of a valid package is admitted but places its target nowhere the database judged,
 * so a player cannot deliver the item that holds it (QTI 3.0 Conformance §3: an application "must
 * be able to ignore or remove the unsupported data"): `external`, an href outside the package,
 * whose resource pantry never fetches (reading 115); `fallback`, an href naming an entry that is no
 * document, which XInclude replaces by its `xi:fallback`'s content on that resource error (XInclude
 * 1.0 §3.2), which no site places; `root`, a fragment rooted at a kind the composition splits by
 * context, under a parent that admits only the split kind (reading 116); and `context`, a placement
 * under another nearest interaction than the one the fragment's rows were judged under (reading
 * 117). `UnplacedInclude` (`#pantry/qti/overlay-queries/tests.ts`) names each such include.
 */
export const UnplacedCause = closed.ordered("UnplacedCause", [
  "external",
  "fallback",
  "root",
  "context",
]);

/**
 * This module's relations, in one list, as `#pantry/qti/schema.ts` composes them.
 */
export const testRelations = [
  UnplacedCause,
  Inclusion,
  Instance,
  ItemRefDocument,
  ItemRefHref,
  LinkReading,
  Named,
  NumberedReading,
  Site,
  SitePath,
  SiteTarget,
  StimulusRef,
  AssembledDocument,
] as const;

/**
 * Each document's sites that name a document, counted by `AssembledDocument.targets`. A site that
 * names none places nothing, and "Include target" alone refuses it (reading 115), unless it is an
 * include that holds an `xi:fallback`.
 */
const siteFamily = counted(on(SiteTarget, "package", "path"), fin(AssembledDocument, "targets"));

/**
 * The sites that place their target (`SiteTarget.places`): each include that may stand for its
 * target's root (`IncludeRoot`, reading 114), whatever its parent.
 */
const placingSites = select(SiteTarget, (s) => s.eq(s.places, true));

/**
 * Each document's sites that place their target, counted into `AssembledDocument.sites`: the
 * children each of its instances holds (reading 85), one per site that places its target. An
 * include that may not stand for its target's root names it (`Document.targetedBy`, reading 117's
 * context) but places nothing, and "Include root" alone refuses it, unless its root names a kind
 * split by context (reading 116), admitted and `UnplacedInclude`'s `root`. A family's member is a
 * whole relation, which no selection narrows, so the count is a fold over {@link siteFamily}.
 */
const sitesFold = fold(
  siteFamily,
  Monoid.count,
  on(placingSites, "package", "path"),
  on(AssembledDocument, "package", "path", "sites"),
);

/**
 * The sites that name each document, counted by `Document.targetedBy` (spec reading 117).
 */
const siteTargetFamily = counted(on(SiteTarget, "package", "target"), fin(Document, "targetedBy"));

/**
 * A document's context: the union of the ancestries of the sites that name it, `Document.context`,
 * empty where none does. Every node below the document node inherits it, so the existing N6 judges
 * an included fragment's content under every placement at once: a ban is a disjointness, and a
 * flag no placement holds is banned under none (spec reading 117).
 */
const contextFold = fold(
  siteTargetFamily,
  Monoid.or,
  on(SiteTarget, "package", "target", "ancestry"),
  on(Document, "package", "path", "context"),
);

/**
 * The placements of every assembly, each `(package, assembly)` one tree, its root its own
 * document's instance, each row keyed by its pre-order `start` and its `parent` its parent's.
 */
const instanceTree = tree(on(Instance, "parent", "at"), fin(Instance, "children"), {
  root: ["package", "assembly"],
});

/**
 * Each assembled document's placements in every assembly, counted by `AssembledDocument.instances`.
 */
const documentInstanceFamily = counted(
  on(Instance, "package", "document"),
  fin(AssembledDocument, "instances"),
);

/**
 * The documents in an assembly: each has its `AssembledDocument` row, and its IDREFs resolve per
 * instance (spec reading 117).
 */
const assembledDocuments = select(Document, (d) => d.eq(d.assembled, true));

/**
 * The instances of an item's assembly, each of which places its document's bindings (Q5.09's
 * `PlacedBinding`, spec reading 117).
 */
export const itemInstances = select(Instance, (i) => i.eq(i.assemblyKind, itemKind));

/**
 * The hrefs whose path an entry holds.
 */
const entryPaths = select(SitePath, (s) => s.eq(s.entry, true));

/**
 * The includes whose href stays in the package, each with an href that names a path of the package
 * (spec reading 115). An include whose href resolves outside it is stored as written and never
 * fetched, so it names none.
 */
const includeSites = select(Site, (s) => s.and(s.eq(s.kind, includeKind), s.eq(s.external, false)));

/**
 * The section refs whose href stays in the package, each with an href that names a path of the
 * package: a section ref whose href resolves outside it is stored as written and never fetched
 * (spec reading 115), and no section of the package stands for it.
 */
const sectionRefSites = select(Site, (s) =>
  s.and(s.eq(s.kind, sectionRefKind), s.eq(s.external, false)),
);

/**
 * The section refs' hrefs whose path an entry holds, each naming a document of the package.
 */
const sectionRefPaths = select(SitePath, (s) =>
  s.and(s.eq(s.kind, sectionRefKind), s.eq(s.entry, true)),
);

/**
 * The item refs' `href` references that resolve inside the package, or that the importer resolves
 * nowhere, one per element: each names an entry path its {@link ItemRefHref} holds, or is refused
 * for want of one. An item ref whose href resolves outside the package (a scheme, a leading `/`, a
 * climb above the root, reading 102) names an item no package entry holds: "The URI used to refer
 * to the item's file (e.g., elsewhere in the same content package)" (§5.6.5) gives the package as
 * an example only, so it is stored as written and never fetched, as a stimulus ref's external href
 * is (reading 35), and no law reads its item (SV-LAW-02).
 */
const internalItemRefHrefs = select(Reference, (r) =>
  r.and(r.eq(r.name, "href"), r.eq(r.kind, itemRefKind), r.ne(r.scope, "external")),
);

/**
 * The includes' targets, each its include's {@link Inclusion}.
 */
const includeTargets = select(SiteTarget, (s) => s.eq(s.kind, includeKind));

/**
 * The sites marked external, each proven by its href's {@link externalHrefs} row.
 */
const externalSites = select(Site, (s) => s.eq(s.external, true));

/**
 * The `href` references that resolve outside the package, one per element, a constant selection
 * keyed by its element: the side a site's external mark is proven by (readings 35 and 102).
 */
const externalHrefs = select(Reference, (r) =>
  r.and(r.eq(r.name, "href"), r.eq(r.scope, "external")),
);

/**
 * An `Inclusion` row as a row check reads it.
 */
type InclusionRow = RowScalars<typeof Inclusion>;

/**
 * State that an include may stand for its target's root (spec reading 114): the root is among the
 * kinds its parent's family's include set holds, `{root} ⊆ IncludeMember.row(IncludeSetOf.at("set",
 * parent))`, and a family of no set holds none.
 *
 * @param i - The include's row.
 * @returns The predicate.
 */
const standsFor = (i: InclusionRow) =>
  i.and(
    IncludeSetOf.has(i.parentKind),
    i.eq(
      Bits.subset(Bits.singleton(i.root), IncludeMember.row(IncludeSetOf.at("set", i.parentKind))),
      true,
    ),
  );

/**
 * State that an include's target root is a kind the composition splits by context whose split kind
 * its parent's include set holds (spec reading 116, {@link SplitRoot}): the fragment, read by its
 * name at its document's root, is the kind of that name, which the parent does not admit, though a
 * valid package may write it, since XInclude merges the fragment's infoset in the include's place
 * (XInclude 1.0 §4) and the merged element is then of the split kind. Such an include places
 * nothing and is admitted, unplaced (QTI 3.0 Conformance §3: an application "must be able to
 * ignore or remove the unsupported data"), as `UnplacedInclude` reads it
 * (`#pantry/qti/overlay-queries/tests.ts`).
 *
 * @param i - The include's row.
 * @returns The predicate.
 */
const standsSplit = (i: InclusionRow) =>
  i.and(
    SplitRoot.has(i.root),
    IncludeSetOf.has(i.parentKind),
    i.eq(
      Bits.subset(
        Bits.singleton(SplitRoot.at("split", i.root)),
        IncludeMember.row(IncludeSetOf.at("set", i.parentKind)),
      ),
      true,
    ),
  );

/**
 * Select the nodes of one kind, a constant selection, whose containments share `Node`'s one
 * `UNIQUE (package, path, start, kind)`.
 *
 * @param kind - The kind.
 * @returns The selection.
 */
const nodesOf = (kind: Kind) => select(Node, (n) => n.eq(n.kind, kind));

/**
 * The tree's members, every instance but each assembly's root.
 */
const instanceMembers = select(Instance, (i) => i.gt(i.start, 0n));

/**
 * The roots of the assemblies, one per document that heads one (the query `HeadDocument`,
 * `#pantry/qti/queries.ts`, whose rules hold the two to each other).
 */
export const instanceRoots = select(Instance, (i) => i.eq(i.start, 0n));

/**
 * The documents whose root is an item, the documents an item ref's item may be: the documents whose
 * `rootKind`, a field beyond the target's terms, is fixed to an item, so `Document`'s key
 * `(package, path)` holds it (grizzle's fixed target, at `3cc8fbd`) and it needs no key of its own.
 */
const itemDocuments = select(Document, (d) => d.eq(d.rootKind, itemKind));

/**
 * Every statement over banks and assemblies, each `check` named by its law:
 *
 * - (the stated limits on a test's structure are gone: every valid structure is stored, and its laws
 *   read the assembled test): containments of elements and attributes into the documents of a type,
 *   by their `(package, path)`, since a document's type is its `Document`'s alone (spec reading
 *   176, decision S3);
 * - **"Item ref identifier"** (QTI §4.1.1): a bank member's identifier is its item's, a rule over the
 *   query `BankMember`, stated under the same name in `#pantry/qti/queries.ts`;
 * - **"Structure identifier"** (A4): no two names of one document share an identifier, so no two
 *   members of one bank do;
 * - **"Test overlay"**: each overlay its element's row, each there exactly where its element is; a
 *   name's and a stimulus ref's identifier its attribute's value, and a name's element a bank's
 *   root section or an item ref, which read the attribute and the node, rules over a query
 *   (`#pantry/qti/overlay-queries/tests.ts`);
 * - **the hrefs:** each include that writes one ({@link SitePath}) has its href's `ReferencePath`
 *   (`#pantry/qti/package.ts` `hrefPaths`), an entry of the package ("File exists"), under the
 *   stated limit `Href_form`, but an include whose href resolves outside the package, marked
 *   `external` as its href's `Reference` proves; an item ref's is its target's (below);
 * - **the sites** ({@link Site}, {@link SiteTarget}): each names a document of the package, its
 *   target, a row of its own ("Include target", reading 115), but an external include, stored as
 *   written and never fetched, and an include holding an `xi:fallback` whose href names an entry
 *   that is no document, admitted unplaced (`UnplacedInclude`);
 * - **the stimulus refs** ({@link StimulusRef}): one per stimulus ref that writes an identifier
 *   (reading 147), no two of one item sharing an identifier (B16);
 * - **the assembly** ({@link Instance}): one tree per assembled document that heads one, one child
 *   per site that places its target, so an inclusion cycle has no finite tree (reading 85);
 * - **the items** ({@link ItemRefHref}, {@link ItemRefDocument}): each item ref's href resolved, and
 *   the item document it names (B2, B3, "Item ref target"); what it names, an item document of the
 *   package or an LTI link unless only a resource of an unread type names it, is a rule over the
 *   query `ItemRefTarget`, stated under the same name in `#pantry/qti/queries.ts`.
 *
 * The statements of reading 85's law, "Inclusion cycle": the instance tree, each instance's copy of
 * its site, one child per site that places its target ({@link sitesFold}), one root per head and
 * none for any other document, and two counts that make a chain returning to a document on it
 * unrepresentable.
 *
 * - **A chain a head reaches:** the deferred foreign key `Instance(package, document, children) →
 *   AssembledDocument(package, path, sites)`, since no finite tree has one child per site that
 *   places its target under it; and `Instance(package, document, rootKind) → Document(package,
 *   path, rootKind)`, each instance's root kind its document's.
 * - **A chain no head reaches**, such as two fragments each of which includes the other, which no
 *   head places, and any fragment only they place: every `AssembledDocument` is a document some
 *   instance places, a rule over the query `InstanceDocument` (`#pantry/qti/queries.ts`), since
 *   none of them is placed in any assembly. Its converse, every `Instance` row's document an
 *   assembled one's, is the foreign key above.
 *
 * The heads are {@link splicingParents}'s, through `Inclusion.splices`: the query `HeadDocument`
 * (`#pantry/qti/queries.ts`), each assembled document no include splices in place, mirrored with
 * the roots both ways by its rules there. Its `E1_derived` pins the root's fields.
 *
 * The statements of B2's and B3's law, "Item ref target": each item ref that writes an href has
 * one {@link ItemRefHref}, its href's path, and no other element has one; and each
 * {@link ItemRefDocument} is the document at its path, whose root is an item. Its target, named by
 * a resource of the package of the item type or an LTI type, is the query `ItemRefTarget`, whose
 * rules (`#pantry/qti/queries.ts`) hold an item ref with none to a path a resource of an unread
 * type names, and an item ref names an item exactly where it has its {@link ItemRefDocument}. An
 * item ref that writes no href names nothing, and AL3 alone refuses it (spec reading 155), named
 * or not (reading 147).
 */
export const testLawsByName = {
  "E1 derived": declared("E1 derived", [
    siteTargetFamily,
    contextFold,
    check("E1_derived", Inclusion, (i) =>
      i.and(
        i.or(
          i.and(i.eq(i.splices, true), i.in(i.parentKind, splicingParents), standsFor(i)),
          i.and(
            i.eq(i.splices, false),
            i.or(i.not(i.in(i.parentKind, splicingParents)), i.not(standsFor(i))),
          ),
        ),
        i.or(
          i.and(i.eq(i.places, true), standsFor(i)),
          i.and(i.eq(i.places, false), i.not(standsFor(i))),
        ),
      ),
    ),
    check("E1_derived", Site, (s) =>
      s.or(
        s.and(s.eq(s.kind, includeKind), s.in(s.parentKind, includeParentKinds)),
        s.eq(s.kind, sectionRefKind),
      ),
    ),
    check("E1_derived", SiteTarget, (s) =>
      s.or(
        s.ne(s.kind, sectionRefKind),
        s.and(
          s.eq(s.splices, false),
          s.or(
            s.and(s.eq(s.places, true), s.eq(s.targetRoot, sectionKind)),
            s.and(s.eq(s.places, false), s.ne(s.targetRoot, sectionKind)),
          ),
        ),
      ),
    ),
    contained(on(AssembledDocument, "package", "path"), on(assembledDocuments, "package", "path")),
    contained(
      on(Instance, "package", "document", "ids", "idrefTargets", "choices", "hottexts"),
      on(Document, "package", "path", "ids", "idrefTargets", "choices", "hottexts"),
    ),
    contained(
      on(itemInstances, "package", "document", "bindings"),
      on(Document, "package", "path", "bindings"),
    ),
    check("E1_derived", LinkReading, (l) => Text.matches(l.variable, namePattern)),
    check("E1_derived", Instance, (i) =>
      i.and(
        i.or(i.eq(i.assemblyKind, itemKind), i.eq(i.bindings, 0n)),
        i.or(
          i.and(
            i.eq(i.start, 0n),
            i.eq(i.document, i.assembly),
            i.eq(i.assemblyKind, i.rootKind),
            i.eq(i.siteDocument, i.document),
            i.eq(i.site, 0n),
          ),
          i.gt(i.start, 0n),
        ),
      ),
    ),
  ]),
  "File exists": declared("File exists", [
    check("File_exists", SitePath, (s) => s.eq(s.entry, true)),
    contained(on(entryPaths, "package", "target"), on(Entry, "package", "path")),
  ]),
  "Include root": declared("Include root", [
    check("Include_root", Inclusion, (i) => i.or(standsFor(i), standsSplit(i))),
  ]),
  "Include target": declared("Include target", [
    contained(
      on(includeSites, "package", "path", "start", "kind"),
      on(SitePath, "package", "path", "start", "kind"),
    ),
    contained(
      on(
        SiteTarget,
        "package",
        "target",
        "targetRoot",
        "targetNearestPath",
        "targetNearest",
        "targetNearestKind",
      ),
      on(
        Document,
        "package",
        "path",
        "rootKind",
        "contextPath",
        "contextNearest",
        "contextNearestKind",
      ),
    ),
  ]),
  "Inclusion cycle": declared("Inclusion cycle", [
    instanceTree,
    contained(
      on(instanceMembers, "package", "assembly", "parent", "assemblyKind", "siteDocument"),
      on(Instance, "package", "assembly", "start", "assemblyKind", "document"),
    ),
    contained(
      on(instanceMembers, "package", "siteDocument", "site", "document"),
      on(placingSites, "package", "path", "start", "target"),
    ),
    key(on(instanceMembers, "package", "assembly", "parent", "site")),
    contained(
      on(Instance, "package", "document", "children"),
      on(AssembledDocument, "package", "path", "sites"),
    ),
    contained(
      on(Instance, "package", "document", "rootKind"),
      on(Document, "package", "path", "rootKind"),
    ),
    key(on(instanceRoots, "package", "document")),
    documentInstanceFamily,
  ]),
  "Item ref target": declared("Item ref target", [
    contained(
      on(ItemRefHref, "package", "path", "start"),
      on(nodesOf(itemRefKind), "package", "path", "start"),
    ),
    contained(
      on(internalItemRefHrefs, "package", "path", "start"),
      on(ItemRefHref, "package", "path", "start"),
    ),
    contained(
      on(ItemRefHref, "package", "path", "start", "target"),
      on(hrefPaths, "package", "path", "start", "target"),
    ),
    contained(on(ItemRefDocument, "package", "target"), on(itemDocuments, "package", "path")),
  ]),
  "Section ref target": declared("Section ref target", [
    contained(
      on(sectionRefSites, "package", "path", "start", "kind"),
      on(SitePath, "package", "path", "start", "kind"),
    ),
    contained(
      on(sectionRefPaths, "package", "path", "start"),
      on(SiteTarget, "package", "path", "start"),
    ),
    check("Section_ref_target", SiteTarget, (s) =>
      s.or(s.ne(s.kind, sectionRefKind), s.eq(s.targetRoot, sectionKind)),
    ),
  ]),
  "Stimulus ref key": declared("Stimulus ref key", [
    key(on(StimulusRef, "package", "path", "identifier")),
  ]),
  "Structure identifier": declared("Structure identifier", [
    key(on(Named, "package", "path", "identifier")),
  ]),
  "Test overlay": declared("Test overlay", [
    contained(
      on(
        select(Document, (d) => d.in(d.rootKind, assembledRoots)),
        "package",
        "path",
      ),
      on(AssembledDocument, "package", "path"),
    ),
    siteFamily,
    sitesFold,
    contained(on(Named, "package", "path"), on(AssembledDocument, "package", "path")),
    contained(
      on(
        Site,
        "package",
        "path",
        "start",
        "children",
        "ancestry",
        "governor",
        "kind",
        "nearest",
        "nearestKind",
        "nearestPath",
        "parentKind",
      ),
      nodeContext,
    ),
    contained(
      on(Site, "package", "path", "start", "parent"),
      on(Node, "package", "path", "start", "parent"),
    ),
    contained(
      on(SitePath, "package", "path", "start", "kind"),
      on(Site, "package", "path", "start", "kind"),
    ),
    contained(
      on(SitePath, "package", "path", "start", "target"),
      on(hrefPaths, "package", "path", "start", "target"),
    ),
    contained(
      on(externalSites, "package", "path", "start"),
      on(externalHrefs, "package", "path", "start"),
    ),
    contained(
      on(
        SiteTarget,
        "package",
        "path",
        "start",
        "ancestry",
        "kind",
        "nearest",
        "nearestKind",
        "parentKind",
      ),
      on(
        Site,
        "package",
        "path",
        "start",
        "ancestry",
        "kind",
        "nearest",
        "nearestKind",
        "parentKind",
      ),
    ),
    contained(
      on(SiteTarget, "package", "path", "start", "target"),
      on(SitePath, "package", "path", "start", "target"),
    ),
    contained(
      on(Inclusion, "package", "path", "start", "parentKind", "places", "root", "splices"),
      on(SiteTarget, "package", "path", "start", "parentKind", "places", "targetRoot", "splices"),
    ),
    contained(
      on(includeTargets, "package", "path", "start"),
      on(Inclusion, "package", "path", "start"),
    ),
    contained(
      on(nodesOf(sectionRefKind), "package", "path", "start"),
      on(Site, "package", "path", "start"),
    ),
    contained(
      on(StimulusRef, "package", "path", "start"),
      on(nodesOf(stimulusRefKind), "package", "path", "start"),
    ),
    contained(
      on(attributesOf("identifier", [stimulusRefKind]), "package", "path", "start"),
      on(StimulusRef, "package", "path", "start"),
    ),
    contained(on(assembledDocuments, "package", "path"), on(AssembledDocument, "package", "path")),
  ]),
} as const;

/**
 * {@link testLawsByName}'s statements in one list, the module's laws as the schema composes them.
 */
export const testLaws = Object.values(testLawsByName).flat();
