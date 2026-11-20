/**
 * Banks, and the assemblies an item's includes make (plan §1.7 O7, N11 and D13; the W5 amendment's
 * C2, C15, C17, C18 and C21; `representation-gaps.md` RG3; spec readings 1, 5, 85 and 114 to 117).
 *
 * Pantry stores content and banks and nothing that delivers them (the placement mandate, rulings 1
 * and 2, owner 2026-11-17). A **bank** is a standalone section document, a resource of type
 * `imsqti_section_xmlv3p0`: its root `qti-assessment-section`, whose `identifier` is the bank,
 * holds its item refs and nothing else, and no test surrounds it. Two stated limits of spec reading
 * 1 hold a package to that, each a containment of elements or attributes into the documents of a
 * type, read from their `Document` at `(package, path)`, so each refuses a narrowing of QTI's own
 * slots and never invents XML:
 *
 * - **Test structure** (on `Node`): outside a section document there is no test, test part, section,
 *   section ref or item ref, so a test document, and a fragment of one, is refused;
 * - **Bank shape** (on `Node` and `Attribute`): every element of a section document is its root
 *   section or an item ref the root holds, so it has no selection, ordering, adaptive selection,
 *   nested section, section ref, include, rubric block, pre-condition, branch rule, item session
 *   control or time limits, and an item ref has no child element; and a bank's item ref writes no
 *   `required`, `fixed` or `category`, which only a test's delivery reads.
 *
 * A bank's identity is QTI's own: **Bank key** keys its root's identifier across its package (the
 * query `BankSection`, `#pantry/qti/overlay-queries/tests.ts`), as `Item key` keys an item's
 * (`#pantry/qti/metadata.ts`). Its members are
 * the query `BankMember` (`#pantry/qti/queries.ts`), by the bank's identifier and the item ref's,
 * whose **Item ref identifier** is QTI §4.1.1's own MUST, that an item ref's identifier is its
 * item's: a member is the item.
 *
 * **The documents.** Every assembled document has a {@link TestDocument} row, the owner of its
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
 * one a head reaches, and the containment of every `TestDocument` into the documents some instance
 * places (the query `InstanceDocument`, `#pantry/qti/queries.ts`) one no head reaches (reading 85).
 * A bank heads a trivial assembly of its own.
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
  check,
  closedId,
  Compute,
  contained,
  counted,
  drawn,
  fin,
  fold,
  key,
  Monoid,
  natural,
  on,
  pg,
  relation,
  select,
  tree,
} from "@bjornpagen/grizzle";
import type { RowScalars } from "@bjornpagen/grizzle";
import type { Kind } from "#pantry/grammar/compose.ts";
import {
  Flag,
  Governor,
  IncludeMember,
  includeParentKinds,
  IncludeSetOf,
  NodeKind,
  nonElementKinds,
} from "#pantry/grammar/install.ts";
import { Attribute, attributesOf } from "#pantry/qti/attributes.ts";
import { Document } from "#pantry/qti/chardata.ts";
import { EntryPath, keyText, PackageName } from "#pantry/qti/limits.ts";
import { Node, nodeContext } from "#pantry/qti/node.ts";
import { Entry, hrefPaths, Reference } from "#pantry/qti/package.ts";
import {
  assembledRoots,
  bankResourceType,
  bankUnreadAttributes,
  includeKind,
  itemKind,
  itemRefKind,
  sectionKind,
  splicingParents,
  stimulusRefKind,
  testStructureKinds,
} from "#pantry/vocab/terms/tests.ts";

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
export const TestDocument = relation(
  "TestDocument",
  {
    instances: drawn(natural),
    package: PackageName,
    path: EntryPath,
    sites: accumulated(natural, 0n),
    targets: drawn(natural),
  },
  ["package", "path"],
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
export const Named = relation(
  "Named",
  { identifier: keyText, package: PackageName, path: EntryPath, start: natural },
  ["package", "path", "start"],
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
export const Site = relation(
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
export const SitePath = relation(
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
);

/**
 * A site's target, keyed by the site's element: the document its href names, a row only where the
 * href names a document of the package, so a site whose href names none has no row, and "Include
 * target" refuses it (spec readings 114 and 115). It is the member of the family of the sites that
 * name a document ({@link siteTargetFamily}), so every member's owner is a document the package
 * writes, and of its own document's ({@link siteFamily}), so a site that names none places nothing.
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
export const SiteTarget = relation(
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
);

/**
 * An include's site as an include, keyed by its element: its parent's kind, which keys
 * its family's `IncludeSetOf` row, its target's root kind, the kind the include stands for (spec
 * reading 114), and `splices`, whether it splices that document in place: its parent is one of
 * {@link splicingParents} and it may stand for the root (`IncludeRoot`), as the law oracle's
 * `standsFor` judges. An include that may not stand for its target's root, which "Include root"
 * refuses, splices nothing, so its target is judged as no fragment of its document's; and `places`,
 * whether it places that document at all: it may stand for the root, whatever its parent, and one
 * "Include root" refuses places nothing.
 */
export const Inclusion = relation(
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
 *   document's count; and `variables`, Q5.10's `PlacedVariableRef` rows, under an item's assembly
 *   alone.
 */
export const Instance = relation(
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
    variables: drawn(natural),
  },
  ["package", "assembly", "start"],
);

/**
 * An item's stimulus ref that writes an identifier, keyed by its element (information model §7.6):
 * its collapsed `identifier`. One that writes none has no row: AL3 refuses it alone (reading 147).
 */
export const StimulusRef = relation(
  "StimulusRef",
  { identifier: keyText, package: PackageName, path: EntryPath, start: natural },
  ["package", "path", "start"],
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
export const ItemRefHref = relation(
  "ItemRefHref",
  { package: PackageName, path: EntryPath, start: natural, target: EntryPath },
  ["package", "path", "start"],
);

/**
 * The item document an item ref names, keyed by the item ref's element: `target`, the item
 * document's path, a row only where the package holds a document at the path of an item ref's
 * target of the item type (`ItemRefTarget`, `#pantry/qti/queries.ts`), and none for an LTI link's,
 * so an item resource whose file the package lacks has none, which "Item ref target" refuses.
 */
export const ItemRefDocument = relation(
  "ItemRefDocument",
  { package: PackageName, path: EntryPath, start: natural, target: EntryPath },
  ["package", "path", "start"],
);

/**
 * This module's relations, in one list, as `#pantry/qti/schema.ts` composes them.
 */
export const testRelations = [
  Inclusion,
  Instance,
  ItemRefDocument,
  ItemRefHref,
  Named,
  Site,
  SitePath,
  SiteTarget,
  StimulusRef,
  TestDocument,
] as const;

/**
 * Each document's sites that name a document, counted by `TestDocument.targets`. A site that names
 * none places nothing, and "Include target" alone refuses it (reading 115).
 */
const siteFamily = counted(on(SiteTarget, "package", "path"), fin(TestDocument, "targets"));

/**
 * The sites that place their target (`SiteTarget.places`): each include that may stand for its
 * target's root (`IncludeRoot`, reading 114), whatever its parent.
 */
const placingSites = select(SiteTarget, (s) => s.eq(s.places, true));

/**
 * Each document's sites that place their target, counted into `TestDocument.sites`: the children
 * each of its instances holds (reading 85), one per site that places its target. An include that
 * may not stand for its target's root names it (`Document.targetedBy`, reading 117's context) but
 * places nothing, and "Include root" alone refuses it. A family's member is a whole relation, which
 * no selection narrows, so the count is a fold over {@link siteFamily}.
 */
const sitesFold = fold(
  siteFamily,
  Monoid.count,
  on(placingSites, "package", "path"),
  on(TestDocument, "package", "path", "sites"),
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
 * Each assembled document's placements in every assembly, counted by `TestDocument.instances`.
 */
const documentInstanceFamily = counted(
  on(Instance, "package", "document"),
  fin(TestDocument, "instances"),
);

/**
 * The includes the information model reads as Include (spec reading 114): each `xi:include` under
 * a parent whose content model holds an explicit include particle. Each is a site.
 */
const includes = select(Node, (n) =>
  n.and(n.eq(n.kind, includeKind), n.in(n.parentKind, includeParentKinds)),
);

/**
 * The documents in an assembly: each has its `TestDocument` row, and its IDREFs resolve per
 * instance (spec reading 117).
 */
const assembledDocuments = select(Document, (d) => d.eq(d.assembled, true));

/**
 * The instances of an item's assembly, each of which places its document's bindings (Q5.09's
 * `PlacedBinding`, spec reading 117).
 */
export const itemInstances = select(Instance, (i) => i.eq(i.assemblyKind, itemKind));

/**
 * The hrefs of the includes whose path an entry holds, each naming a document of the package (spec
 * reading 115).
 */
const includePaths = select(SitePath, (s) => s.and(s.eq(s.kind, includeKind), s.eq(s.entry, true)));

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
      Compute.subset(
        Compute.singleton(i.root),
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
 * The banks, the documents of the bank's resource type, which `Document`'s key `(package, path)`
 * keys, its type a field beyond the target's terms fixed to a value (grizzle's README, "Fixed
 * fields").
 */
const bankDocuments = select(Document, (d) => d.eq(d.documentType, bankResourceType));

/**
 * The documents that are no bank, which `Document`'s key `(package, path)` keys.
 */
const otherDocuments = select(Document, (d) => d.ne(d.documentType, bankResourceType));

/**
 * The elements of a test's structure ({@link testStructureKinds}), which no document but a bank
 * holds ("Test structure").
 */
const structureNodes = select(Node, (n) => n.in(n.kind, testStructureKinds));

/**
 * The elements a bank does not hold: every element but a section that is its document's root and
 * an item ref a section holds ("Bank shape").
 */
const unbankedNodes = select(Node, (n) =>
  n.not(
    n.or(
      n.in(n.kind, nonElementKinds),
      n.and(n.eq(n.kind, sectionKind), n.eq(n.parentKind, "document")),
      n.and(n.eq(n.kind, itemRefKind), n.eq(n.parentKind, sectionKind)),
    ),
  ),
);

/**
 * The attributes of an item ref that a bank's item ref writes none of ({@link
 * bankUnreadAttributes}, "Bank shape").
 */
const unbankedAttributes = select(Attribute, (a) =>
  a.and(a.eq(a.kind, itemRefKind), a.in(a.name, bankUnreadAttributes)),
);

/**
 * The documents whose root is an item, the documents an item ref's item may be: the documents whose
 * `rootKind`, a field beyond the target's terms, is fixed to an item, so `Document`'s key
 * `(package, path)` holds it (grizzle's fixed target, at `3cc8fbd`) and it needs no key of its own.
 */
const itemDocuments = select(Document, (d) => d.eq(d.rootKind, itemKind));

/**
 * Every statement over banks and assemblies, each `check` named by its law:
 *
 * - **"Test structure"** and **"Bank shape"**, spec reading 1's stated limits (this module's header):
 *   containments of elements and attributes into the documents of a type, by their `(package,
 *   path)`, since a document's type is its `Document`'s alone (spec reading 176, decision S3);
 * - **"Bank key"**: no two banks of one package share an identifier, a key over the query
 *   `BankSection` (`#pantry/qti/overlay-queries/tests.ts`), since a bank's root is a section whose
 *   parent is its document node, which `Node` alone holds;
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
 *   written and never fetched;
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
 *   TestDocument(package, path, sites)`, since no finite tree has one child per site that places
 *   its target under it; and `Instance(package, document, rootKind) → Document(package, path,
 *   rootKind)`, each instance's root kind its document's.
 * - **A chain no head reaches**, such as two fragments each of which includes the other, which no
 *   head places, and any fragment only they place: every `TestDocument` is a document some instance
 *   places, a rule over the query `InstanceDocument` (`#pantry/qti/queries.ts`), since none of them
 *   is placed in any assembly. Its converse, every `Instance` row's document an assembled one's, is
 *   the foreign key above.
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
  "Bank shape": [
    contained(on(unbankedNodes, "package", "path"), on(otherDocuments, "package", "path")),
    contained(on(unbankedAttributes, "package", "path"), on(otherDocuments, "package", "path")),
  ],
  "E1 derived": [
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
      s.and(s.eq(s.kind, includeKind), s.in(s.parentKind, includeParentKinds)),
    ),
    contained(on(TestDocument, "package", "path"), on(assembledDocuments, "package", "path")),
    contained(
      on(Instance, "package", "document", "ids", "idrefTargets", "choices", "hottexts"),
      on(Document, "package", "path", "ids", "idrefTargets", "choices", "hottexts"),
    ),
    contained(
      on(itemInstances, "package", "document", "bindings", "variables"),
      on(Document, "package", "path", "bindings", "variables"),
    ),
    check("E1_derived", Instance, (i) =>
      i.and(
        i.or(i.eq(i.assemblyKind, itemKind), i.and(i.eq(i.bindings, 0n), i.eq(i.variables, 0n))),
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
  ],
  "File exists": [
    check("File_exists", SitePath, (s) => s.eq(s.entry, true)),
    contained(on(entryPaths, "package", "target"), on(Entry, "package", "path")),
  ],
  "Fragment context": [
    check("Fragment_context", SiteTarget, (s) =>
      s.or(
        s.and(s.eq(s.nearestKind, "document"), s.eq(s.targetNearestKind, "document")),
        s.and(
          s.eq(s.path, s.targetNearestPath),
          s.eq(s.nearest, s.targetNearest),
          s.eq(s.nearestKind, s.targetNearestKind),
        ),
      ),
    ),
  ],
  "Include root": [check("Include_root", Inclusion, standsFor)],
  "Include target": [
    contained(
      on(includeSites, "package", "path", "start", "kind"),
      on(SitePath, "package", "path", "start", "kind"),
    ),
    contained(
      on(includePaths, "package", "path", "start"),
      on(SiteTarget, "package", "path", "start"),
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
  ],
  "Inclusion cycle": [
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
      on(TestDocument, "package", "path", "sites"),
    ),
    contained(
      on(Instance, "package", "document", "rootKind"),
      on(Document, "package", "path", "rootKind"),
    ),
    key(on(instanceRoots, "package", "document")),
    documentInstanceFamily,
  ],
  "Item ref target": [
    contained(
      on(ItemRefHref, "package", "path", "start"),
      on(nodesOf(itemRefKind), "package", "path", "start"),
    ),
    contained(
      on(attributesOf("href", [itemRefKind]), "package", "path", "start"),
      on(ItemRefHref, "package", "path", "start"),
    ),
    contained(
      on(ItemRefHref, "package", "path", "start", "target"),
      on(hrefPaths, "package", "path", "start", "target"),
    ),
    contained(on(ItemRefDocument, "package", "target"), on(itemDocuments, "package", "path")),
  ],
  "Stimulus ref key": [key(on(StimulusRef, "package", "path", "identifier"))],
  "Structure identifier": [key(on(Named, "package", "path", "identifier"))],
  "Test overlay": [
    contained(
      on(
        select(Document, (d) => d.in(d.rootKind, assembledRoots)),
        "package",
        "path",
      ),
      on(TestDocument, "package", "path"),
    ),
    siteFamily,
    sitesFold,
    contained(on(Named, "package", "path"), on(TestDocument, "package", "path")),
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
    contained(on(includes, "package", "path", "start"), on(Site, "package", "path", "start")),
    contained(
      on(Inclusion, "package", "path", "start", "parentKind", "places", "root", "splices"),
      on(SiteTarget, "package", "path", "start", "parentKind", "places", "targetRoot", "splices"),
    ),
    contained(
      on(SiteTarget, "package", "path", "start"),
      on(Inclusion, "package", "path", "start"),
    ),
    contained(
      on(StimulusRef, "package", "path", "start"),
      on(nodesOf(stimulusRefKind), "package", "path", "start"),
    ),
    contained(
      on(attributesOf("identifier", [stimulusRefKind]), "package", "path", "start"),
      on(StimulusRef, "package", "path", "start"),
    ),
    contained(on(assembledDocuments, "package", "path"), on(TestDocument, "package", "path")),
  ],
  "Test structure": [
    contained(on(structureNodes, "package", "path"), on(bankDocuments, "package", "path")),
  ],
} as const;

/**
 * {@link testLawsByName}'s statements in one list, the module's laws as the schema composes them.
 */
export const testLaws = Object.values(testLawsByName).flat();
