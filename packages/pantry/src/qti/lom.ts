/**
 * The LOM level, `QtiLom`: the typed LOM of each package as derived relations over the tree, and
 * the two laws LOM itself states of a record's leaves, so the database refuses a record whose
 * vocabulary term claims LOM's own vocabulary and is none of its tokens, or whose contribute's
 * entity is no vCard 3.0. It stores nothing: every typed LOM fact is a view over `Node` and its
 * folded `stringValue` (`copiedTextKinds` and `copiedLangStringText` of `#pantry/qti/node.ts`),
 * never an overlay that copies it (S5), and the importer writes no row for it.
 *
 * **Nothing valid is refused.** QTI asks no package to state a LOM record, and every element of one
 * is optional: "All data elements are optional" (IEEE 1484.12.1-2002 §4.2). A QTI database is an
 * importer, which "must be able to differentiate between valid and invalid instances of QTI
 * content" (QTI 3.0 Conformance §2.2) and, of what it does not support, may "ignore or remove the
 * unsupported data" (§3), never refuse it. So no law here asks a package for an identity, a grade,
 * a subject, a credit, a source or a version, or holds its versions to a chain: each is a view,
 * zero or more per package, and what a consumer reads of it handles its absence as a case of its
 * own. The two laws below hold only what LOM's data model, which QTI 3.0 Metadata §2.7 adopts
 * ("Usage as defined by [LOM, 02]", normative by its §1.2), makes of a value written. A catalog,
 * entry, earlier package's name, taxon source or taxon id a view carries is carried as itself, of
 * any length, since LOM bounds none, beside its SHA-256 (`catalogDigest`, `entryDigest`,
 * `earlierDigest`, `sourceDigest`, `idDigest`, and a taxon's entry string's `entryDigest`), the
 * explicit digest a consumer orders and matches by where a key or an ordered read holds it: 32
 * bytes, which any key holds, so no text is ever refused or left out for its length.
 *
 * - **LOM vocabulary**: a status's, a contribute role's, a relation kind's and a classification
 *   purpose's `value` whose vocabulary is LOM's own is one of that vocabulary's tokens exactly. Its
 *   vocabulary is LOM's when its `source` is `LOMv1.0`, empty or not written, which the loose
 *   binding defaults to `LOMv1.0` (`imsmd_loose_v1p3p2.xsd` lines 1260, 1392, 1468 and 1513; spec
 *   reading 122); a term of any other source is that vocabulary's, which the binding "does not
 *   enforce" (QTI 3.0 Metadata §3.6), and no law reads it ({@link otherVocabularies}). The tokens
 *   are LOM 2.2's ({@link LifeCycleStatus}), 2.3.1's and 3.2.1's ({@link ContributeRole},
 *   {@link metaMetadataRoles}), 7.1's with QTI 3.0 Metadata §2.7.7.1's `precludes`
 *   ({@link RelationKind}), and 9.1's ({@link ClassificationPurpose}).
 * - **LOM vCard** (LOM 2.3.2 and 3.2.2, "vCard, as defined by IMC vCard 3.0 (RFC 2425, RFC 2426)"):
 *   every contribute's entity is a vCard 3.0, its `BEGIN:VCARD` and `END:VCARD` around a
 *   `VERSION:3.0`, an `N` and an `FN`, the properties RFC 2426 says "MUST be present" (§3.1.1,
 *   §3.1.2, §3.6.9), each of any value its `text-value` admits (RFC 2426 §4, `*(SAFE-CHAR /
 *   ...)`).
 *
 * **What a package states.** The manifest's record (`lom:lom` of `cp:metadata.manifest`) describes
 * the package (QTI 3.0 ASI binding §8.8.1: "At the manifest level the metadata is for the PACKAGE
 * as a whole"), so every view of a package reads that record alone; a resource's record (a bank's
 * educational description, decision 9) answers to the laws only. Each view types a term of LOM's
 * own vocabulary alone, so a term another vocabulary spells as LOM does (`unavailable` under a
 * source of its own) types nothing.
 *
 * - A lesson is a general identifier whose `entry` is the manifest's `identifier` ({@link Lesson}):
 *   none, one or several per package.
 * - A package names an earlier revision by an `isversionof` in {@link packageScheme}
 *   ({@link Supersedes}), and a lesson's heads are its packages no package of the lesson names so
 *   ({@link Head}): none where every one is named, several where its chain forks.
 * - A grade is a {@link PackageClassification} of purpose `educational level`, and a subject one of
 *   `discipline` (QTI 3.0 Metadata §2.7.9; LOM 9, "there may be multiple instances of this
 *   category").
 * - A credit is a {@link PackageCredit}: LOM 2.3.1's "Minimally, the Author(s) of the learning object
 *   should be described" is a note's advice, and RFC 2426 asks a vCard for no `EMAIL` (§3.3.2) and
 *   no `ORG` (§3.5.5).
 * - A source is a {@link PackageRelation} of kind `isbasedon`, as many as a record states (LOM 7),
 *   its entry any CharacterString (LOM 7.2.1.2).
 *
 * **Two readings name what they read.** A `lom:value` row reads its grandparent's kind and no
 * further, and a role of `lifeCycle` (`RoleLifeCycle.Type`) and one of `metaMetadata`
 * (`RoleMetaMetadata.Type`) share the governor `lom:role`, so LOM vocabulary admits a role of
 * either vocabulary, LOM 2.3.1's and 3.2.1's `creator`; the views read the contributes of
 * `lifeCycle` alone, so a lifeCycle `creator` credits nothing. And QTI's `precludes`, "NOT a part
 * of LOM" (§2.7.7.1), which QTI lists among the relation kinds' terms and gives no source of its
 * own, is a term under `LOMv1.0` as every other kind is, and under any other source unread.
 *
 * **How each law is held.** Each is a check over a derived relation of this level, which deferred
 * triggers judge at commit (grizzle's README, "Rules over queries"): LOM vocabulary over
 * {@link LomTerm}, the terms of LOM's own vocabulary in a record document, and LOM vCard over
 * {@link RecordNode} of `QtiViews` (`#pantry/qti/names.ts`), which reads its document's type from
 * its `Document`. A query reads a text by `Text.matches` only within a byte bound its type
 * states, and every text here is a folded `matchedText`. Every check is named by its law with
 * spaces written as underscores, as every check of the schema is, and declares its law's entry, by
 * which a refusal names it (`lawNameOf` of `#pantry/import/refusal.ts`).
 *
 * @see {@link https://www.imsglobal.org/sites/default/files/spec/qti/v3/md-bind/index.html | QTI 3.0 Metadata, §2.7}
 * @see {@link https://www.imsglobal.org/spec/qti/v3p0/conf | QTI 3.0 Conformance and Certification, §2.2 and §3}
 * @see {@link https://www.rfc-editor.org/rfc/rfc2426 | RFC 2426, vCard MIME Directory Profile}
 */
import {
  check,
  closed,
  closedId,
  Crypto,
  derived,
  query,
  schema,
  Text,
  v,
} from "@bjornpagen/grizzle";
import type { NodeKind } from "#pantry/grammar/install.ts";
import { QtiMedia } from "#pantry/qti/media.ts";
import { lomVocabularySources } from "#pantry/qti/metadata.ts";
import { RecordNode } from "#pantry/qti/names.ts";
import { Node } from "#pantry/qti/node.ts";
import { manifestIdentifiers, resourceIdentifiers } from "#pantry/qti/overlay-queries/package.ts";
import { manifestPath } from "#pantry/vocab/terms/package.ts";
import { matchedText } from "#pantry/qti/limits.ts";
import { declared } from "#pantry/qti/law-entries.ts";

/**
 * LOM 2.2's status vocabulary: "draft", "final", "revised", "unavailable".
 */
export const LifeCycleStatus = closed.ordered("LifeCycleStatus", [
  "draft",
  "final",
  "revised",
  "unavailable",
]);

/**
 * LOM 2.3.1's role vocabulary, a lifeCycle contribute's: a producer may credit itself as the
 * `author` and the school as the `publisher` (decision 12).
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
 * (decision 3), and may name its sources by `isbasedon` (decision 7).
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
 * LOM 9.1's classification purposes. A package may state grades as `educational level`, subjects as
 * `discipline` and topics or families as `idea` (decisions 1, 9 and 17), zero or more of each.
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
  { term: closedId(LifeCycleStatus), text: matchedText },
  ["term"],
  LifeCycleStatus.handles.map((term) => ({ term, text: term })),
);

/**
 * Each {@link ContributeRole} by its token, as {@link LifeCycleStatusText} is.
 */
export const ContributeRoleText = closed.relation(
  "ContributeRoleText",
  { term: closedId(ContributeRole), text: matchedText },
  ["term"],
  ContributeRole.handles.map((term) => ({ term, text: term })),
);

/**
 * Each {@link RelationKind} by its token, as {@link LifeCycleStatusText} is.
 */
export const RelationKindText = closed.relation(
  "RelationKindText",
  { term: closedId(RelationKind), text: matchedText },
  ["term"],
  RelationKind.handles.map((term) => ({ term, text: term })),
);

/**
 * Each {@link ClassificationPurpose} by its token, as {@link LifeCycleStatusText} is.
 */
export const ClassificationPurposeText = closed.relation(
  "ClassificationPurposeText",
  { term: closedId(ClassificationPurpose), text: matchedText },
  ["term"],
  ClassificationPurpose.handles.map((term) => ({ term, text: term })),
);

/**
 * The LOM vocabularies and their tokens: closed relations the level's views and laws read, in a
 * level of their own below them, since a derived relation reads only the levels below its own
 * (grizzle's README, "Derived tables").
 */
export const QtiLomVocabulary = schema.extend(
  [QtiMedia],
  "QtiLomVocabulary",
  [
    LifeCycleStatus,
    ContributeRole,
    RelationKind,
    ClassificationPurpose,
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
 * The vocabularies LOM vocabulary reads, each a `lom:source` and `lom:value` parent: a lifeCycle's
 * status, a contribute's role, a relation's kind and a classification's purpose.
 */
const lomVocabularies = [
  "lom:status",
  "lom:role",
  "lom:kind",
  "lom:purpose",
] as const satisfies readonly (typeof NodeKind.handles)[number][];

/**
 * The vocabulary terms of a record document whose source names another vocabulary than LOM's, each
 * by its parent, the term's node: a `lom:source` that collapses to neither `LOMv1.0` nor the empty
 * source the binding's default fills ({@link lomVocabularySources}), the loose binding "does not
 * enforce any of the default enumerated vocabularies" (QTI 3.0 Metadata §3.6), so neither LOM
 * vocabulary nor a view reads the term's value. A term that writes no source is LOM's.
 */
const otherVocabularies = query(QtiLomVocabulary).rule((r) => {
  const { package: pkg, parent, path, stringValue } = v(RecordNode, "source");

  return r
    .match(RecordNode, { kind: "lom:source", package: pkg, parent, path, stringValue })
    .where(r.and(...lomVocabularySources.map((source) => r.ne(Text.collapse(stringValue), source))))
    .find({ package: pkg, parent, path });
});

/**
 * Each value of a term of LOM's own vocabulary in a record document, by its node, with its term's
 * kind and its folded text: a `lom:value` of a status, a role, a kind or a purpose whose term names
 * no other vocabulary ({@link otherVocabularies}). "LOM vocabulary" holds each to its vocabulary's
 * tokens.
 */
export const LomTerm = derived(
  "LomTerm",
  query(QtiLomVocabulary).rule((r) => {
    const { package: pkg, parent, parentKind, path, start, stringValue } = v(RecordNode, "value");

    return r
      .match(RecordNode, {
        kind: "lom:value",
        package: pkg,
        parent,
        parentKind,
        path,
        start,
        stringValue,
      })
      .where(r.in(parentKind, lomVocabularies))
      .where(r.not(otherVocabularies, { package: pkg, parent, path }))
      .find({ package: pkg, parentKind, path, start, stringValue });
  }),
);

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
const vcardFrame = Text.pattern(
  `^[Bb][Ee][Gg][Ii][Nn]:[Vv][Cc][Aa][Rr][Dd]${lineBreak}(?:${lineText}${lineBreak})*[Ee][Nn][Dd]:[Vv][Cc][Aa][Rr][Dd][\\r\\n]*$`,
);

/**
 * A vCard 3.0's version line (RFC 2426 §3.6.9, "The value MUST be "3.0" if the vCard corresponds to
 * this specification").
 */
const versionLine = Text.pattern(
  `${linesBefore}[Vv][Ee][Rr][Ss][Ii][Oo][Nn]${parameters}3\\.0${linesAfter}`,
);

/**
 * A vCard's structured name, `N` (RFC 2426 §3.1.2), of any value: an organization's is `N:;;;;`.
 */
const nameLine = Text.pattern(`${linesBefore}[Nn]${parameters}${lineText}${linesAfter}`);

/**
 * A vCard's formatted name, `FN` (RFC 2426 §3.1.1, "The type MUST be present in the vCard
 * object"), of any value: its `fn-value` is a `text-value`, `*(SAFE-CHAR / ":" / DQUOTE /
 * ESCAPED-CHAR)` (§4), which the empty text is.
 */
const formattedNameLine = Text.pattern(
  `${linesBefore}[Ff][Nn]${parameters}${lineText}${linesAfter}`,
);

/**
 * The identifiers the manifest's record lists in its general category, each its `catalog` and its
 * `entry`, with their nodes: an identifier that writes no catalog or no entry names nothing here.
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
      start: catalog.start,
      stringValue: catalog.stringValue,
    })
    .match(Node, {
      kind: "lom:entry",
      package: general.package,
      parent: identifier.start,
      path: manifestPath,
      start: entry.start,
      stringValue: entry.stringValue,
    })
    .find({
      catalog: catalog.stringValue,
      catalogNode: catalog.start,
      entry: entry.stringValue,
      entryNode: entry.start,
      package: general.package,
    });
});

/**
 * Each package's lesson: the general identifier whose entry is its manifest's `identifier`, its
 * catalog and entry as written, each beside its SHA-256.
 */
const lessons = query(QtiLomVocabulary).rule((r) => {
  const { catalog, entry, package: pkg } = v(generalIdentifiers, "identifier");

  return r
    .match(generalIdentifiers, { catalog, entry, package: pkg })
    .match(manifestIdentifiers, { package: pkg, value: entry })
    .find({
      catalog,
      catalogDigest: Crypto.sha256(catalog),
      entry,
      entryDigest: Crypto.sha256(entry),
      package: pkg,
    });
});

/**
 * The relations of the manifest's record, each by its node, with its kind's token and its
 * resource's identifier, `catalog` and `entry`. A relation that states no kind, or no identifier of
 * both parts, or whose kind is another vocabulary's ({@link otherVocabularies}), names nothing
 * here.
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
    .where(
      r.not(otherVocabularies, {
        package: relation.package,
        parent: kind.start,
        path: manifestPath,
      }),
    )
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
      start: catalog.start,
      stringValue: catalog.stringValue,
    })
    .match(Node, {
      kind: "lom:entry",
      package: relation.package,
      parent: identifier.start,
      path: manifestPath,
      start: entry.start,
      stringValue: entry.stringValue,
    })
    .find({
      catalog: catalog.stringValue,
      catalogNode: catalog.start,
      entry: entry.stringValue,
      entryNode: entry.start,
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
    .find({ earlier, earlierDigest: Crypto.sha256(earlier), package: pkg });
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
 * The status the manifest's record states, its token, where its vocabulary is LOM's
 * ({@link otherVocabularies}).
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
    .where(r.not(otherVocabularies, { package: pkg, parent: status.start, path: manifestPath }))
    .find({ package: pkg, text: value.stringValue });
});

/**
 * Each entity a lifeCycle contribute of the manifest's record credits, with its role's token and
 * its vCard. A contribute that states no role, or a role of another vocabulary
 * ({@link otherVocabularies}), credits nothing here.
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
    .where(r.not(otherVocabularies, { package: pkg, parent: role.start, path: manifestPath }))
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
 * several strings gives a row for each. A classification whose purpose is another vocabulary's
 * ({@link otherVocabularies}) gives none.
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
    .where(
      r.not(otherVocabularies, {
        package: classification.package,
        parent: purpose.start,
        path: manifestPath,
      }),
    )
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
      start: sourceString.start,
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
      start: id.start,
      stringValue: id.stringValue,
    })
    .find({
      id: id.stringValue,
      idNode: id.start,
      package: classification.package,
      purpose: value.stringValue,
      source: sourceString.stringValue,
      sourceNode: sourceString.start,
      taxon: taxon.start,
    });
});

/**
 * Each identity a package states: a lesson per general identifier whose entry is the manifest's
 * identifier (decisions 3 and 15), none, one or several per package, since a record lists
 * identifiers "[0..*]" and QTI 3.0 Metadata §2.7.1.1 asks only that "One of the values given"
 * name the associated object, of a record that gives one.
 */
export const Lesson = derived("Lesson", lessons);

/**
 * Each package with each package it names as an earlier revision (decision 3), an `isversionof` in
 * {@link packageScheme}, whatever that package's lesson, and whether or not it is stored: the
 * direct edges of a history.
 */
export const Supersedes = derived("Supersedes", supersessions);

/**
 * Each earlier package a package of a lesson names, by that lesson: who claims it within the
 * lesson.
 */
const lessonClaims = query(QtiLomVocabulary).rule((r) => {
  const { earlier, package: pkg } = v(supersessions, "supersession");
  const { catalog, entry } = v(lessons, "lesson");

  return r
    .match(supersessions, { earlier, package: pkg })
    .match(lessons, { catalog, entry, package: pkg })
    .find({ catalog, earlier, entry });
});

/**
 * Each lesson's heads: each package of the lesson no package of the same lesson names as an
 * earlier revision (decision 2). A lesson whose versions fork has several, and one whose every
 * version a version names has none.
 */
export const Head = derived(
  "Head",
  query(QtiLomVocabulary).rule((r) => {
    const { catalog, catalogDigest, entry, entryDigest, package: pkg } = v(lessons, "lesson");

    return r
      .match(lessons, { catalog, catalogDigest, entry, entryDigest, package: pkg })
      .where(r.not(lessonClaims, { catalog, earlier: pkg, entry }))
      .find({ catalog, catalogDigest, entry, entryDigest, package: pkg });
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
 * Each entity each package's record credits, zero or more, its role of {@link ContributeRole} and
 * its vCard.
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
      .find({
        catalog,
        catalogDigest: Crypto.sha256(catalog),
        entry,
        entryDigest: Crypto.sha256(entry),
        kind,
        package: pkg,
        relation,
      });
  }),
);

/**
 * Each taxon each package's record classifies it under (decision 1), zero or more: its
 * classification's purpose of {@link ClassificationPurpose}, its taxon path's source and its id. An
 * item set is a selection over these, never a table.
 */
export const PackageClassification = derived(
  "PackageClassification",
  query(QtiLomVocabulary).rule((r) => {
    const { id, package: pkg, purpose: text, source } = v(taxa, "taxon");
    const { term: purpose } = v(ClassificationPurposeText, "term");

    return r
      .match(taxa, { id, package: pkg, purpose: text, source })
      .match(ClassificationPurposeText, { term: purpose, text })
      .find({
        id,
        idDigest: Crypto.sha256(id),
        package: pkg,
        purpose,
        source,
        sourceDigest: Crypto.sha256(source),
      });
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
      .find({
        entry: string.stringValue,
        entryDigest: Crypto.sha256(string.stringValue),
        id,
        idDigest: Crypto.sha256(id),
        package: pkg,
        source,
        sourceDigest: Crypto.sha256(source),
      });
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
 * folded text, since one may pass `matchedText`'s bound, so each row is one of its string's text
 * nodes, by the string and the text node's place: a string written as one run of text is one row.
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
 * The level's laws by name, the module's header giving each.
 */
export const lomLawsByName = {
  "LOM vCard": declared("LOM vCard", [
    check("LOM_vCard", RecordNode, (n) =>
      n.or(
        n.ne(n.kind, "lom:entity"),
        n.and(
          Text.matches(n.stringValue, vcardFrame),
          Text.matches(n.stringValue, versionLine),
          Text.matches(n.stringValue, nameLine),
          Text.matches(n.stringValue, formattedNameLine),
        ),
      ),
    ),
  ]),
  "LOM vocabulary": declared("LOM vocabulary", [
    check("LOM_vocabulary", LomTerm, (t) =>
      t.or(
        t.and(t.eq(t.parentKind, "lom:status"), t.in(t.stringValue, LifeCycleStatus.handles)),
        t.and(
          t.eq(t.parentKind, "lom:role"),
          t.in(t.stringValue, [...ContributeRole.handles, ...metaMetadataRoles]),
        ),
        t.and(t.eq(t.parentKind, "lom:kind"), t.in(t.stringValue, RelationKind.handles)),
        t.and(
          t.eq(t.parentKind, "lom:purpose"),
          t.in(t.stringValue, ClassificationPurpose.handles),
        ),
      ),
    ),
  ]),
} as const;

/**
 * The typed LOM views and the terms LOM vocabulary reads, each derived, none stored.
 */
export const lomRelations = [
  LomTerm,
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
] as const;

/**
 * The LOM level: `QtiMedia` and the LOM vocabularies, with the typed LOM of each package and the
 * laws over it.
 */
export const QtiLom = schema.extend(
  [QtiLomVocabulary],
  "QtiLom",
  lomRelations,
  Object.values(lomLawsByName).flat(),
);
