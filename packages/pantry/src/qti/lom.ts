/**
 * The LOM level, `QtiLom`: the laws an install stacks over `QtiMedia` with grizzle's
 * `schema.extend`, so the database refuses a package that does not state, in its manifest's own LOM
 * record, what it is and where it came from (EduLLM's collections decisions 1 to 17 and 26,
 * `out/collections/DECISIONS.md`), and the typed LOM of each package as derived relations over the
 * tree. It stores nothing: every typed LOM fact is a view over `Node` and its folded `stringValue`
 * (`copiedTextKinds` and `copiedLangStringText` of `#pantry/qti/node.ts`), never an overlay that
 * copies it (S5), and the importer writes no row for it.
 *
 * It is an install's policy, never `Qti`'s own, as the package-media level is
 * (`#pantry/qti/media.ts`): QTI 3.0 asks no package to state a LOM record, and 1EdTech's own
 * example manifests write terms under `LOMv1.0` that are no LOMv1.0 value (`Creator`, `Final`,
 * `Discipline`), which `Qti` keeps and this level refuses. Every narrowing here narrows a slot of
 * LOM or of QTI's metadata profile and invents none: QTI 3.0 Metadata §3.6, "a 'loose' binding …
 * does not enforce any of the default enumerated vocabularies", which an install may enforce.
 *
 * **What a package states.** The manifest's record (`lom:lom` of `cp:metadata.manifest`) describes
 * the package, the objectbank (QTI 3.0 ASI binding §8.8.1: "At the manifest level the metadata is
 * for the PACKAGE as a whole"), so every law of a package reads that record alone; a resource's
 * record (a bank's educational description, decision 9) answers to the row checks only.
 *
 * - **Package identity** (decisions 3 and 15, QTI 3.0 Metadata §2.7.1.1, "One of the values given for
 *   the identifier must have an entry that matches the identifier of the associated item, test or
 *   object bank"): the record's general category lists an identifier whose `entry` is the
 *   manifest's `identifier` (`manifestIdentifiers`, collapsed as an `xs:ID` is) exactly, with a
 *   `catalog` ({@link Lesson}), and exactly one: a lesson is that `(catalog, entry)`, one value per
 *   package.
 * - **Package grade** and **Package subject** (decisions 1 and 17): a classification of purpose
 *   `educational level`, and one of `discipline`, each with a taxon path that names its source and
 *   a taxon that states its id (QTI 3.0 Metadata §2.7.9; IMS Meta-data 1.3 Best Practice,
 *   "classification.purpose [Educational Level] may also be used to record level or grade-related
 *   information").
 * - **Author credit** and **Publisher credit** (decisions 7, 12, 14 and 16): a lifeCycle contribute
 *   of role `author` with an entity, and one of role `publisher`; every author's vCard has an
 *   `EMAIL` (the content's point person), and every publisher's an `ORG`.
 * - **Source pointer** (decision 7): exactly one relation of kind `isbasedon`, naming the producer's
 *   source file by its SHA-256 (64 lowercase hex digits, the producer's own catalog).
 * - **Package relation target** (decision 4): every relation resource identifier in the catalog
 *   {@link packageScheme} names a stored package by its name exactly: a plain containment, no
 *   parsing and no promised URL.
 * - **Version lesson** (decision 3): every `isversionof` names, in {@link packageScheme}, a stored
 *   package of the same lesson, "an earlier revision of the same lesson" (LOM 7.1 `isversionof`,
 *   narrowed).
 * - **Deletion version** (decisions 6b and 28): a package's status is `unavailable` exactly where its
 *   manifest lists no resource ({@link PackageRevision}), so a deletion version holds no content
 *   and every package of no content is one.
 * - **One head** (decision 5): each lesson has one head, the package no stored `isversionof` names.
 *   Current, a lesson's history and the item sets are views over these, the ledger's level's
 *   (`@edullm/qti-database`).
 * - **LOM vocabulary** (S5): every `source` of a status, a role, a relation's kind and a
 *   classification's purpose is LOM's own, `LOMv1.0`, written, empty or absent (the binding's
 *   `default="LOMv1.0"`, `imsmd_loose_v1p3p2.xsd` lines 1392, 1468, 1260 and 1513; spec reading
 *   122), and every such `value` is one of its LOMv1.0 vocabulary's tokens exactly: LOM 2.2
 *   ({@link
 *   LifeCycleStatus}), 2.3.1 and 3.2.1 ({@link ContributeRole} and
 *   {@link metaMetadataRoles}), 7.1 and QTI 3.0 Metadata §2.7.7.1's `precludes`
 *   ({@link RelationKind}), and 9.1 ({@link ClassificationPurpose}). So no term a view reads is
 *   another vocabulary's.
 * - **LOM vCard** (LOM 2.3.2 and 3.2.2, "vCard, as defined by IMC vCard 3.0 (RFC 2425, RFC 2426)"):
 *   every contribute's entity is a vCard 3.0, its `BEGIN:VCARD` and `END:VCARD` around a
 *   `VERSION:3.0`, an `N` and an `FN` of some name, the properties RFC 2426 says "MUST be present"
 *   (§3.1.1, §3.1.2, §3.6.9).
 *
 * **Two narrowings name what they narrow.** A `lom:value` row reads its grandparent's kind and no
 * further, and a role of `lifeCycle` (`RoleLifeCycle.Type`) and one of `metaMetadata`
 * (`RoleMetaMetadata.Type`) share the governor `lom:role`, so the row check admits a role of either
 * vocabulary, LOM 2.3.1's and 3.2.1's `creator`; the views and the credit laws read the contributes
 * of `lifeCycle` alone, so a lifeCycle `creator` credits nothing. And QTI's `precludes`, "NOT a
 * part of LOM" (§2.7.7.1), which names no source of its own, is admitted under `LOMv1.0` like every
 * other relation kind, which narrows LOM's guidance that "only the values not included in this
 * Standard should have a source that is not LOMv1.0" (IEEE 1484.12.1 §4.4); no law requires it.
 *
 * **How each law is held.** Every law reads more than one row, and is a rule over a derived
 * relation of this level, which deferred triggers judge at commit (grizzle's README, "Rules over
 * queries"): a containment from `Package`'s name into the facts a package states
 * ({@link PackageFact}), a key over a derived relation, a check over one, or a containment of one
 * into another. LOM vocabulary and LOM vCard judge a node of a record document alone, the view
 * {@link RecordNode} of `QtiViews` (`#pantry/qti/names.ts`), which reads its document's type from
 * its `Document`. A query reads a text by
 * `Compute.matches` only within a byte bound its type states, and every text here is a folded
 * `keyText`. A deletion version (decision 26) states the same grade, subject and credits as the
 * lesson it deletes, so no law holds a special case for it. Every check is named by its law with
 * spaces written as underscores, as every check of the schema is (`checkNameOf` of
 * `#pantry/import/refusal.ts`).
 *
 * @see {@link https://www.imsglobal.org/sites/default/files/spec/qti/v3/md-bind/index.html | QTI 3.0 Metadata, §2.7}
 * @see {@link https://www.rfc-editor.org/rfc/rfc2426 | RFC 2426, vCard MIME Directory Profile}
 */
import {
  check,
  closed,
  closedId,
  Compute,
  contained,
  derived,
  key,
  on,
  query,
  schema,
  select,
  v,
} from "@bjornpagen/grizzle";
import type { NodeKind } from "#pantry/grammar/install.ts";
import { keyText } from "#pantry/qti/limits.ts";
import { QtiMedia } from "#pantry/qti/media.ts";
import { lomVocabularySources } from "#pantry/qti/metadata.ts";
import { RecordNode } from "#pantry/qti/names.ts";
import { Node } from "#pantry/qti/node.ts";
import { manifestIdentifiers, resourceIdentifiers } from "#pantry/qti/overlay-queries/package.ts";
import { Package } from "#pantry/qti/package.ts";
import { manifestPath } from "#pantry/vocab/terms/package.ts";

/**
 * LOM 2.2's status vocabulary: "draft", "final", "revised", "unavailable". A deletion version is
 * `unavailable` (decision 6b: "the learning object itself is not available").
 */
export const LifeCycleStatus = closed.ordered("LifeCycleStatus", [
  "draft",
  "final",
  "revised",
  "unavailable",
]);

/**
 * LOM 2.3.1's role vocabulary, a lifeCycle contribute's: the producer is the `author` and the
 * school the `publisher` (decision 12).
 */
export const ContributeRole = closed.ordered("ContributeRole", [
  "author",
  "publisher",
  "unknown",
  "initiator",
  "terminator",
  "validator",
  "editor",
  "graphical designer",
  "technical implementer",
  "content provider",
  "technical validator",
  "educational validator",
  "script writer",
  "instructional designer",
  "subject matter expert",
]);

/**
 * LOM 3.2.1's role vocabulary, a metaMetadata contribute's: "creator" and "validator". A
 * `lom:value` row cannot tell its role's category, so LOM vocabulary admits these beside
 * {@link ContributeRole}'s.
 */
export const metaMetadataRoles = ["creator", "validator"] as const;

/**
 * LOM 7.1's relation kinds, and QTI 3.0 Metadata §2.7.7.1's `precludes` ("this term can be used to
 * indicate items which must not be incorporated into the same test as each other … Note this term
 * is NOT a part of LOM"). A package names an earlier revision of its lesson by `isversionof`
 * (decision 3) and its source by `isbasedon` (decision 7).
 */
export const RelationKind = closed.ordered("RelationKind", [
  "ispartof",
  "haspart",
  "isversionof",
  "hasversion",
  "isformatof",
  "hasformat",
  "references",
  "isreferencedby",
  "isbasedon",
  "isbasisfor",
  "requires",
  "isrequiredby",
  "precludes",
]);

/**
 * LOM 9.1's classification purposes. A package states its grade as `educational level`, its subject
 * as `discipline` and its topic or family as `idea` (decisions 1, 9 and 17).
 */
export const ClassificationPurpose = closed.ordered("ClassificationPurpose", [
  "discipline",
  "idea",
  "prerequisite",
  "educational objective",
  "accessibility restrictions",
  "educational level",
  "skill level",
  "security level",
  "competency",
]);

/**
 * Each {@link LifeCycleStatus} by its token, the handle's name as LOM writes it: a view types a
 * status by matching its folded text here.
 */
export const LifeCycleStatusText = closed.relation(
  "LifeCycleStatusText",
  { term: closedId(LifeCycleStatus), text: keyText },
  ["term"],
  LifeCycleStatus.handles.map((term) => ({ term, text: term })),
);

/**
 * Each {@link ContributeRole} by its token, as {@link LifeCycleStatusText} is.
 */
export const ContributeRoleText = closed.relation(
  "ContributeRoleText",
  { term: closedId(ContributeRole), text: keyText },
  ["term"],
  ContributeRole.handles.map((term) => ({ term, text: term })),
);

/**
 * Each {@link RelationKind} by its token, as {@link LifeCycleStatusText} is.
 */
export const RelationKindText = closed.relation(
  "RelationKindText",
  { term: closedId(RelationKind), text: keyText },
  ["term"],
  RelationKind.handles.map((term) => ({ term, text: term })),
);

/**
 * Each {@link ClassificationPurpose} by its token, as {@link LifeCycleStatusText} is.
 */
export const ClassificationPurposeText = closed.relation(
  "ClassificationPurposeText",
  { term: closedId(ClassificationPurpose), text: keyText },
  ["term"],
  ClassificationPurpose.handles.map((term) => ({ term, text: term })),
);

/**
 * What a package is (decisions 6b and 28): a revision with content, whose manifest lists a
 * resource, or a deletion version, whose manifest lists none and whose status is `unavailable`. A
 * package is exactly one.
 */
export const RevisionKind = closed.ordered("RevisionKind", ["content", "deletion"]);

/**
 * The facts every package states in its manifest's record (decisions 1, 7, 12 to 17): its identity,
 * its grade, its subject, its author, its publisher and its source.
 */
export const RequiredFact = closed.ordered("RequiredFact", [
  "identity",
  "grade",
  "subject",
  "author",
  "publisher",
  "source",
]);

/**
 * The LOM vocabularies, their tokens and the facts every package states: closed relations the
 * level's views and laws read, in a level of their own below them, since a derived relation reads
 * only the levels below its own (grizzle's README, "Derived tables").
 */
export const QtiLomVocabulary = schema.extend(
  QtiMedia,
  "QtiLomVocabulary",
  [
    LifeCycleStatus,
    ContributeRole,
    RelationKind,
    ClassificationPurpose,
    RequiredFact,
    RevisionKind,
    LifeCycleStatusText,
    ContributeRoleText,
    RelationKindText,
    ClassificationPurposeText,
  ],
  [],
);

/**
 * The catalog under which a relation names a stored package by its name (decision 4): a fixed
 * scheme, read as a name only.
 */
export const packageScheme = "https://qti.edullm.ai/package";

/**
 * The vocabularies LOM vocabulary narrows, each a `lom:source` and `lom:value` parent: a
 * lifeCycle's status, a contribute's role, a relation's kind and a classification's purpose.
 */
const narrowedVocabularies = [
  "lom:status",
  "lom:role",
  "lom:kind",
  "lom:purpose",
] as const satisfies readonly (typeof NodeKind.handles)[number][];

/**
 * A run of characters on one line of a vCard, none a line break.
 */
const lineText = "[^\\r\\n]*";

/**
 * A vCard line break. RFC 2425 §5.8.1 ends each line with a CRLF, which XML 1.0 §2.11 delivers as a
 * line feed; a run reads a blank line as no line.
 */
const lineBreak = "[\\r\\n]+";

/**
 * A value that holds some character other than a space or a tab.
 */
const nonBlank = "[^\\r\\n]*[^ \\t\\r\\n][^\\r\\n]*";

/**
 * What stands before a property's line in a vCard, wherever the line is: any lines, then the
 * property's optional group (RFC 2425 §5.8.2, `[group "."] name`). A line anchored so, an `N` is
 * never a `NOTE`'s or a `NICKNAME`'s first letter.
 */
const linesBefore = `^(?:${lineText}${lineBreak})*(?:[0-9A-Za-z-]+\\.)?`;

/**
 * What stands between a property's name and its value: its parameters, then a colon.
 */
const parameters = "(?:;[^\\r\\n:]*)?:";

/**
 * What stands after a property's line in a vCard: any lines.
 */
const linesAfter = `(?:${lineBreak}${lineText})*$`;

/**
 * A vCard's frame: its first line `BEGIN:VCARD` and its last `END:VCARD` (RFC 2426 §5), a line
 * break after it admitted. Each name is matched without regard to case (RFC 2425 §5.8.2, "Names are
 * case insensitive"), each ASCII letter the class of its two cases, as every pattern here is.
 */
const vcardFrame = Compute.pattern(
  `^[Bb][Ee][Gg][Ii][Nn]:[Vv][Cc][Aa][Rr][Dd]${lineBreak}(?:${lineText}${lineBreak})*[Ee][Nn][Dd]:[Vv][Cc][Aa][Rr][Dd][\\r\\n]*$`,
);

/**
 * A vCard 3.0's version line (RFC 2426 §3.6.9, "The value MUST be "3.0" if the vCard corresponds to
 * this specification").
 */
const versionLine = Compute.pattern(
  `${linesBefore}[Vv][Ee][Rr][Ss][Ii][Oo][Nn]${parameters}3\\.0${linesAfter}`,
);

/**
 * A vCard's structured name, `N` (RFC 2426 §3.1.2), of any value: an organization's is `N:;;;;`.
 */
const nameLine = Compute.pattern(`${linesBefore}[Nn]${parameters}${lineText}${linesAfter}`);

/**
 * A vCard's formatted name, `FN` (RFC 2426 §3.1.1), which names someone.
 */
const formattedNameLine = Compute.pattern(
  `${linesBefore}[Ff][Nn]${parameters}${nonBlank}${linesAfter}`,
);

/**
 * A vCard's email address, `EMAIL` (RFC 2426 §3.3.2), a local part and a domain around one `@`:
 * the producer's point person (decision 14).
 */
const emailLine = Compute.pattern(
  `${linesBefore}[Ee][Mm][Aa][Ii][Ll]${parameters}[^\\r\\n@]+@[^\\r\\n@]+${linesAfter}`,
);

/**
 * A vCard's organization, `ORG` (RFC 2426 §3.5.5), which names it (decision 16).
 */
const organizationLine = Compute.pattern(
  `${linesBefore}[Oo][Rr][Gg]${parameters}${nonBlank}${linesAfter}`,
);

/**
 * A SHA-256 digest as text: 64 lowercase hex digits, the form a source file is named by (decision
 * 7).
 */
const sha256Text = Compute.pattern("^[0-9a-f]{64}$");

/**
 * The identifiers the manifest's record lists in its general category, each its `catalog` and its
 * `entry`: an identifier that writes no catalog or no entry names nothing here.
 */
const generalIdentifiers = query(QtiLomVocabulary).rule((r) => {
  const general = v(Node, "general");
  const identifier = v(Node, "identifier");
  const catalog = v(Node, "catalog");
  const entry = v(Node, "entry");

  return r
    .match(Node, {
      kind: "lom:general",
      package: general.package,
      parentKind: "lom:lom",
      parentParentKind: "cp:metadata.manifest",
      path: manifestPath,
      start: general.start,
    })
    .match(Node, {
      kind: "lom:identifier",
      package: general.package,
      parent: general.start,
      path: manifestPath,
      start: identifier.start,
    })
    .match(Node, {
      kind: "lom:catalog",
      package: general.package,
      parent: identifier.start,
      path: manifestPath,
      stringValue: catalog.stringValue,
    })
    .match(Node, {
      kind: "lom:entry",
      package: general.package,
      parent: identifier.start,
      path: manifestPath,
      stringValue: entry.stringValue,
    })
    .find({ catalog: catalog.stringValue, entry: entry.stringValue, package: general.package });
});

/**
 * Each package's lesson: the general identifier whose entry is its manifest's `identifier`.
 */
const lessons = query(QtiLomVocabulary).rule((r) => {
  const { catalog, entry, package: pkg } = v(generalIdentifiers, "identifier");

  return r
    .match(generalIdentifiers, { catalog, entry, package: pkg })
    .match(manifestIdentifiers, { package: pkg, value: entry })
    .find({ catalog, entry, package: pkg });
});

/**
 * The relations of the manifest's record, each by its node, with its kind's token and its
 * resource's identifier, `catalog` and `entry`. A relation that states no kind, or no identifier of
 * both parts, names nothing here.
 */
const relations = query(QtiLomVocabulary).rule((r) => {
  const relation = v(Node, "relation");
  const kind = v(Node, "kind");
  const value = v(Node, "value");
  const resource = v(Node, "resource");
  const identifier = v(Node, "identifier");
  const catalog = v(Node, "catalog");
  const entry = v(Node, "entry");

  return r
    .match(Node, {
      kind: "lom:relation",
      package: relation.package,
      parentKind: "lom:lom",
      parentParentKind: "cp:metadata.manifest",
      path: manifestPath,
      start: relation.start,
    })
    .match(Node, {
      kind: "lom:kind",
      package: relation.package,
      parent: relation.start,
      path: manifestPath,
      start: kind.start,
    })
    .match(Node, {
      kind: "lom:value",
      package: relation.package,
      parent: kind.start,
      path: manifestPath,
      stringValue: value.stringValue,
    })
    .match(Node, {
      kind: "lom:resource",
      package: relation.package,
      parent: relation.start,
      path: manifestPath,
      start: resource.start,
    })
    .match(Node, {
      kind: "lom:identifier",
      package: relation.package,
      parent: resource.start,
      path: manifestPath,
      start: identifier.start,
    })
    .match(Node, {
      kind: "lom:catalog",
      package: relation.package,
      parent: identifier.start,
      path: manifestPath,
      stringValue: catalog.stringValue,
    })
    .match(Node, {
      kind: "lom:entry",
      package: relation.package,
      parent: identifier.start,
      path: manifestPath,
      stringValue: entry.stringValue,
    })
    .find({
      catalog: catalog.stringValue,
      entry: entry.stringValue,
      kind: value.stringValue,
      package: relation.package,
      relation: relation.start,
    });
});

/**
 * The `isversionof` relations of the manifest's record, each with its target's catalog and entry.
 */
const versionsOf = query(QtiLomVocabulary).rule((r) => {
  const { catalog, entry, package: pkg, relation } = v(relations, "relation");

  return r
    .match(relations, { catalog, entry, kind: "isversionof", package: pkg, relation })
    .find({ catalog, entry, package: pkg, relation });
});

/**
 * Each package with each package it names an earlier revision of its lesson: an `isversionof` in
 * {@link packageScheme}, its entry the earlier package's name.
 */
const supersessions = query(QtiLomVocabulary).rule((r) => {
  const { entry: earlier, package: pkg } = v(versionsOf, "version");

  return r
    .match(versionsOf, { catalog: packageScheme, entry: earlier, package: pkg })
    .find({ earlier, package: pkg });
});

/**
 * The lifeCycle category of the manifest's record, by its node.
 */
const lifeCycles = query(QtiLomVocabulary).rule((r) => {
  const { package: pkg, start: lifeCycle } = v(Node, "lifeCycle");

  return r
    .match(Node, {
      kind: "lom:lifeCycle",
      package: pkg,
      parentKind: "lom:lom",
      parentParentKind: "cp:metadata.manifest",
      path: manifestPath,
      start: lifeCycle,
    })
    .find({ lifeCycle, package: pkg });
});

/**
 * The status the manifest's record states, its token.
 */
const statuses = query(QtiLomVocabulary).rule((r) => {
  const { lifeCycle, package: pkg } = v(lifeCycles, "lifeCycle");
  const status = v(Node, "status");
  const value = v(Node, "value");

  return r
    .match(lifeCycles, { lifeCycle, package: pkg })
    .match(Node, {
      kind: "lom:status",
      package: pkg,
      parent: lifeCycle,
      path: manifestPath,
      start: status.start,
    })
    .match(Node, {
      kind: "lom:value",
      package: pkg,
      parent: status.start,
      path: manifestPath,
      stringValue: value.stringValue,
    })
    .find({ package: pkg, text: value.stringValue });
});

/**
 * Each entity a lifeCycle contribute of the manifest's record credits, with its role's token and
 * its vCard. A contribute that states no role credits nothing here.
 */
const credits = query(QtiLomVocabulary).rule((r) => {
  const { lifeCycle, package: pkg } = v(lifeCycles, "lifeCycle");
  const contribute = v(Node, "contribute");
  const role = v(Node, "role");
  const value = v(Node, "value");
  const entity = v(Node, "entity");

  return r
    .match(lifeCycles, { lifeCycle, package: pkg })
    .match(Node, {
      kind: "lom:contribute",
      package: pkg,
      parent: lifeCycle,
      path: manifestPath,
      start: contribute.start,
    })
    .match(Node, {
      kind: "lom:role",
      package: pkg,
      parent: contribute.start,
      path: manifestPath,
      start: role.start,
    })
    .match(Node, {
      kind: "lom:value",
      package: pkg,
      parent: role.start,
      path: manifestPath,
      stringValue: value.stringValue,
    })
    .match(Node, {
      kind: "lom:entity",
      package: pkg,
      parent: contribute.start,
      path: manifestPath,
      start: entity.start,
      stringValue: entity.stringValue,
    })
    .find({
      entity: entity.start,
      package: pkg,
      role: value.stringValue,
      vcard: entity.stringValue,
    });
});

/**
 * Each taxon of each classification of the manifest's record, with its classification's purpose
 * token, its taxon path's source and its id. A taxon path's source is a LangString, so a source of
 * several strings gives a row for each.
 */
const taxa = query(QtiLomVocabulary).rule((r) => {
  const classification = v(Node, "classification");
  const purpose = v(Node, "purpose");
  const value = v(Node, "value");
  const taxonPath = v(Node, "taxonPath");
  const source = v(Node, "source");
  const sourceString = v(Node, "sourceString");
  const taxon = v(Node, "taxon");
  const id = v(Node, "id");

  return r
    .match(Node, {
      kind: "lom:classification",
      package: classification.package,
      parentKind: "lom:lom",
      parentParentKind: "cp:metadata.manifest",
      path: manifestPath,
      start: classification.start,
    })
    .match(Node, {
      kind: "lom:purpose",
      package: classification.package,
      parent: classification.start,
      path: manifestPath,
      start: purpose.start,
    })
    .match(Node, {
      kind: "lom:value",
      package: classification.package,
      parent: purpose.start,
      path: manifestPath,
      stringValue: value.stringValue,
    })
    .match(Node, {
      kind: "lom:taxonPath",
      package: classification.package,
      parent: classification.start,
      path: manifestPath,
      start: taxonPath.start,
    })
    .match(Node, {
      kind: "lom:source.langString",
      package: classification.package,
      parent: taxonPath.start,
      path: manifestPath,
      start: source.start,
    })
    .match(Node, {
      kind: "lom:string",
      package: classification.package,
      parent: source.start,
      path: manifestPath,
      stringValue: sourceString.stringValue,
    })
    .match(Node, {
      kind: "lom:taxon",
      package: classification.package,
      parent: taxonPath.start,
      path: manifestPath,
      start: taxon.start,
    })
    .match(Node, {
      kind: "lom:id",
      package: classification.package,
      parent: taxon.start,
      path: manifestPath,
      stringValue: id.stringValue,
    })
    .find({
      id: id.stringValue,
      package: classification.package,
      purpose: value.stringValue,
      source: sourceString.stringValue,
      taxon: taxon.start,
    });
});

/**
 * Each identity a package states: its lesson ({@link Lesson}), a lesson per general identifier
 * whose entry is the manifest's identifier, which "Package identity" holds to one.
 */
export const Lesson = derived("Lesson", lessons);

/**
 * Each package with each earlier package of its lesson it names (decision 3), the direct edges of
 * the lesson's history: "Version lesson" holds each to a stored package of the same lesson.
 */
export const Supersedes = derived("Supersedes", supersessions);

/**
 * Each lesson's head: a package of the lesson no stored package names as an earlier revision
 * (decision 2), which "One head" holds to one per lesson. A head whose status is `unavailable` is a
 * deletion version, and the lesson has no current package.
 */
export const Head = derived(
  "Head",
  query(QtiLomVocabulary).rule((r) => {
    const { catalog, entry, package: pkg } = v(lessons, "lesson");

    return r
      .match(lessons, { catalog, entry, package: pkg })
      .where(r.not(supersessions, { earlier: pkg }))
      .find({ catalog, entry, package: pkg });
  }),
);

/**
 * The status each package's record states, of {@link LifeCycleStatus}: at most one, the loose
 * binding's Schematron caps holding a lifeCycle to one status and a status to one value.
 */
export const PackageStatus = derived(
  "PackageStatus",
  query(QtiLomVocabulary).rule((r) => {
    const { package: pkg, text } = v(statuses, "status");
    const { term: status } = v(LifeCycleStatusText, "term");

    return r
      .match(statuses, { package: pkg, text })
      .match(LifeCycleStatusText, { term: status, text })
      .find({ package: pkg, status });
  }),
);

/**
 * Each entity each package's record credits, its role of {@link ContributeRole} and its vCard.
 */
export const PackageCredit = derived(
  "PackageCredit",
  query(QtiLomVocabulary).rule((r) => {
    const { entity, package: pkg, role: text, vcard } = v(credits, "credit");
    const { term: role } = v(ContributeRoleText, "term");

    return r
      .match(credits, { entity, package: pkg, role: text, vcard })
      .match(ContributeRoleText, { term: role, text })
      .find({ entity, package: pkg, role, vcard });
  }),
);

/**
 * Each relation each package's record states, its kind of {@link RelationKind}, and its target's
 * catalog and entry.
 */
export const PackageRelation = derived(
  "PackageRelation",
  query(QtiLomVocabulary).rule((r) => {
    const { catalog, entry, kind: text, package: pkg, relation } = v(relations, "relation");
    const { term: kind } = v(RelationKindText, "term");

    return r
      .match(relations, { catalog, entry, kind: text, package: pkg, relation })
      .match(RelationKindText, { term: kind, text })
      .find({ catalog, entry, kind, package: pkg, relation });
  }),
);

/**
 * Each taxon each package's record classifies it under (decision 1): its classification's purpose
 * of {@link ClassificationPurpose}, its taxon path's source and its id. An item set is a selection
 * over these, never a table.
 */
export const PackageClassification = derived(
  "PackageClassification",
  query(QtiLomVocabulary).rule((r) => {
    const { id, package: pkg, purpose: text, source } = v(taxa, "taxon");
    const { term: purpose } = v(ClassificationPurposeText, "term");

    return r
      .match(taxa, { id, package: pkg, purpose: text, source })
      .match(ClassificationPurposeText, { term: purpose, text })
      .find({ id, package: pkg, purpose, source });
  }),
);

/**
 * Each name each package's record gives a taxon, by the taxon's source and id: its entry's strings,
 * one per language a producer writes.
 */
export const TaxonEntry = derived(
  "TaxonEntry",
  query(QtiLomVocabulary).rule((r) => {
    const { id, package: pkg, source, taxon } = v(taxa, "taxon");
    const name = v(Node, "name");
    const string = v(Node, "string");

    return r
      .match(taxa, { id, package: pkg, source, taxon })
      .match(Node, {
        kind: "lom:entry.langString",
        package: pkg,
        parent: taxon,
        path: manifestPath,
        start: name.start,
      })
      .match(Node, {
        kind: "lom:string",
        package: pkg,
        parent: name.start,
        path: manifestPath,
        stringValue: string.stringValue,
      })
      .find({ entry: string.stringValue, id, package: pkg, source });
  }),
);

/**
 * Each string of each package's record's general title.
 */
export const PackageTitle = derived(
  "PackageTitle",
  query(QtiLomVocabulary).rule((r) => {
    const general = v(Node, "general");
    const title = v(Node, "title");
    const string = v(Node, "string");

    return r
      .match(Node, {
        kind: "lom:general",
        package: general.package,
        parentKind: "lom:lom",
        parentParentKind: "cp:metadata.manifest",
        path: manifestPath,
        start: general.start,
      })
      .match(Node, {
        kind: "lom:title",
        package: general.package,
        parent: general.start,
        path: manifestPath,
        start: title.start,
      })
      .match(Node, {
        kind: "lom:string",
        package: general.package,
        parent: title.start,
        path: manifestPath,
        stringValue: string.stringValue,
      })
      .find({ package: general.package, title: string.stringValue });
  }),
);

/**
 * Each educational description a resource's record states, by the resource's identifier: a bank's
 * statement of its objective (decision 9, QTI 3.0 Metadata §2.7.5.4, "Item, test or pool objectives
 * should be included in this field if required"), free text no law reads. A description is no
 * folded text, since one may pass `keyText`'s bound, so each row is one of its string's text nodes,
 * by the string and the text node's place: a string written as one run of text is one row.
 */
export const ResourceDescription = derived(
  "ResourceDescription",
  query(QtiLomVocabulary).rule((r) => {
    const record = v(Node, "record");
    const metadata = v(Node, "metadata");
    const { value: resource } = v(resourceIdentifiers, "resource");
    const educational = v(Node, "educational");
    const description = v(Node, "description");
    const string = v(Node, "string");
    const text = v(Node, "text");

    return r
      .match(Node, {
        kind: "lom:lom",
        package: record.package,
        parent: metadata.start,
        parentKind: "cp:metadata.resource",
        path: manifestPath,
        start: record.start,
      })
      .match(Node, {
        kind: "cp:metadata.resource",
        package: record.package,
        parent: metadata.parent,
        path: manifestPath,
        start: metadata.start,
      })
      .match(resourceIdentifiers, {
        package: record.package,
        start: metadata.parent,
        value: resource,
      })
      .match(Node, {
        kind: "lom:educational",
        package: record.package,
        parent: record.start,
        path: manifestPath,
        start: educational.start,
      })
      .match(Node, {
        kind: "lom:description",
        package: record.package,
        parent: educational.start,
        path: manifestPath,
        start: description.start,
      })
      .match(Node, {
        kind: "lom:string",
        package: record.package,
        parent: description.start,
        path: manifestPath,
        start: string.start,
      })
      .match(Node, {
        chars: text.chars,
        kind: "text",
        package: record.package,
        parent: string.start,
        path: manifestPath,
        start: text.start,
      })
      .find({
        package: record.package,
        resource,
        start: text.start,
        string: string.start,
        text: text.chars,
      });
  }),
);

/**
 * Each {@link RequiredFact} each package states: its lesson, a taxon of purpose `educational level`
 * and one of `discipline`, an `author` and a `publisher` credit, and an `isbasedon` relation.
 */
export const PackageFact = derived(
  "PackageFact",
  query(QtiLomVocabulary)
    .rule((r) => {
      const { package: pkg } = v(lessons, "lesson");

      return r
        .match(lessons, { package: pkg })
        .find({ fact: RequiredFact.handle("identity"), package: pkg });
    })
    .rule((r) => {
      const { package: pkg } = v(taxa, "taxon");

      return r
        .match(taxa, { package: pkg, purpose: "educational level" })
        .find({ fact: RequiredFact.handle("grade"), package: pkg });
    })
    .rule((r) => {
      const { package: pkg } = v(taxa, "taxon");

      return r
        .match(taxa, { package: pkg, purpose: "discipline" })
        .find({ fact: RequiredFact.handle("subject"), package: pkg });
    })
    .rule((r) => {
      const { package: pkg } = v(credits, "credit");

      return r
        .match(credits, { package: pkg, role: "author" })
        .find({ fact: RequiredFact.handle("author"), package: pkg });
    })
    .rule((r) => {
      const { package: pkg } = v(credits, "credit");

      return r
        .match(credits, { package: pkg, role: "publisher" })
        .find({ fact: RequiredFact.handle("publisher"), package: pkg });
    })
    .rule((r) => {
      const { package: pkg } = v(relations, "relation");

      return r
        .match(relations, { kind: "isbasedon", package: pkg })
        .find({ fact: RequiredFact.handle("source"), package: pkg });
    }),
);

/**
 * Each {@link RevisionKind} each package is: `content` where its manifest lists a resource, and
 * `deletion` where its record's status is `unavailable`. "Deletion version" holds each package to
 * exactly one, so a withdrawn package that still holds content, and a package of no content that is
 * no deletion, are refused: a lesson's head is current exactly where it is no deletion.
 */
export const PackageRevision = derived(
  "PackageRevision",
  query(QtiLomVocabulary)
    .rule((r) => {
      const { package: pkg } = v(Node, "resource");

      return r
        .match(Node, { kind: "cp:resource", package: pkg, path: manifestPath })
        .find({ kind: RevisionKind.handle("content"), package: pkg });
    })
    .rule((r) => {
      const { package: pkg } = v(statuses, "status");

      return r
        .match(statuses, { package: pkg, text: "unavailable" })
        .find({ kind: RevisionKind.handle("deletion"), package: pkg });
    }),
);

/**
 * Each `isbasedon` relation of each package's record: "Source pointer" holds a package to one, its
 * entry a SHA-256.
 */
const SourcePointer = derived(
  "SourcePointer",
  query(QtiLomVocabulary).rule((r) => {
    const { catalog, entry, package: pkg, relation } = v(relations, "relation");

    return r
      .match(relations, { catalog, entry, kind: "isbasedon", package: pkg, relation })
      .find({ catalog, entry, package: pkg, relation });
  }),
);

/**
 * Each stored package's name each package's record names in {@link packageScheme}, by any relation.
 */
const NamedPackage = derived(
  "NamedPackage",
  query(QtiLomVocabulary).rule((r) => {
    const { entry, package: pkg } = v(relations, "relation");

    return r
      .match(relations, { catalog: packageScheme, entry, package: pkg })
      .find({ entry, package: pkg });
  }),
);

/**
 * Each `isversionof` relation of each package's record, its target's catalog among its fields:
 * "Version lesson" holds that catalog to {@link packageScheme}.
 */
const VersionOf = derived("VersionOf", versionsOf);

/**
 * Each earlier package each package names, with the naming package's lesson: "Version lesson" holds
 * it to be a package of that lesson.
 */
const VersionClaim = derived(
  "VersionClaim",
  query(QtiLomVocabulary).rule((r) => {
    const { earlier, package: pkg } = v(supersessions, "supersession");
    const { catalog, entry } = v(lessons, "lesson");

    return r
      .match(supersessions, { earlier, package: pkg })
      .match(lessons, { catalog, entry, package: pkg })
      .find({ catalog, earlier, entry });
  }),
);

/**
 * Select a package's statements of one {@link RequiredFact}.
 *
 * @param fact - The fact.
 * @returns Its statements, by package.
 */
const stated = (fact: (typeof RequiredFact.handles)[number]) =>
  select(PackageFact, (f) => f.eq(f.fact, fact));

/**
 * The level's laws by name, the module's header giving each.
 */
export const lomLawsByName = {
  "Author credit": [
    contained(on(Package, "name"), on(stated("author"), "package")),
    check("Author_credit", PackageCredit, (c) =>
      c.or(c.ne(c.role, "author"), Compute.matches(c.vcard, emailLine)),
    ),
  ],
  "Deletion version": [
    contained(on(Package, "name"), on(PackageRevision, "package")),
    key(on(PackageRevision, "package")),
  ],
  "LOM vCard": [
    check("LOM_vCard", RecordNode, (n) =>
      n.or(
        n.ne(n.kind, "lom:entity"),
        n.and(
          Compute.matches(n.stringValue, vcardFrame),
          Compute.matches(n.stringValue, versionLine),
          Compute.matches(n.stringValue, nameLine),
          Compute.matches(n.stringValue, formattedNameLine),
        ),
      ),
    ),
  ],
  "LOM vocabulary": [
    check("LOM_vocabulary", RecordNode, (n) =>
      n.or(
        n.not(n.in(n.parentKind, narrowedVocabularies)),
        n.not(n.in(n.kind, ["lom:source", "lom:value"])),
        n.and(
          n.eq(n.kind, "lom:source"),
          n.in(Compute.collapse(n.stringValue), lomVocabularySources),
        ),
        n.and(
          n.eq(n.kind, "lom:value"),
          n.or(
            n.and(n.eq(n.parentKind, "lom:status"), n.in(n.stringValue, LifeCycleStatus.handles)),
            n.and(
              n.eq(n.parentKind, "lom:role"),
              n.in(n.stringValue, [...ContributeRole.handles, ...metaMetadataRoles]),
            ),
            n.and(n.eq(n.parentKind, "lom:kind"), n.in(n.stringValue, RelationKind.handles)),
            n.and(
              n.eq(n.parentKind, "lom:purpose"),
              n.in(n.stringValue, ClassificationPurpose.handles),
            ),
          ),
        ),
      ),
    ),
  ],
  "One head": [key(on(Head, "catalog", "entry"))],
  "Package grade": [contained(on(Package, "name"), on(stated("grade"), "package"))],
  "Package identity": [
    contained(on(Package, "name"), on(stated("identity"), "package")),
    key(on(Lesson, "package")),
  ],
  "Package relation target": [contained(on(NamedPackage, "entry"), on(Package, "name"))],
  "Package subject": [contained(on(Package, "name"), on(stated("subject"), "package"))],
  "Publisher credit": [
    contained(on(Package, "name"), on(stated("publisher"), "package")),
    check("Publisher_credit", PackageCredit, (c) =>
      c.or(c.ne(c.role, "publisher"), Compute.matches(c.vcard, organizationLine)),
    ),
  ],
  "Source pointer": [
    contained(on(Package, "name"), on(stated("source"), "package")),
    key(on(SourcePointer, "package")),
    check("Source_pointer", SourcePointer, (s) => Compute.matches(s.entry, sha256Text)),
  ],
  "Version lesson": [
    check("Version_lesson", VersionOf, (w) => w.eq(w.catalog, packageScheme)),
    contained(
      on(VersionClaim, "earlier", "catalog", "entry"),
      on(Lesson, "package", "catalog", "entry"),
    ),
  ],
} as const;

/**
 * The typed LOM views, each derived, none stored.
 */
export const lomRelations = [
  Lesson,
  Supersedes,
  Head,
  PackageStatus,
  PackageCredit,
  PackageRelation,
  PackageClassification,
  TaxonEntry,
  PackageTitle,
  ResourceDescription,
  PackageFact,
  PackageRevision,
  SourcePointer,
  NamedPackage,
  VersionOf,
  VersionClaim,
] as const;

/**
 * The LOM level: `QtiMedia` and the LOM vocabularies, with the typed LOM of each package and the
 * laws over it.
 */
export const QtiLom = schema.extend(
  QtiLomVocabulary,
  "QtiLom",
  lomRelations,
  Object.values(lomLawsByName).flat(),
);
