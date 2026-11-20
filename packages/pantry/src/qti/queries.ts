/**
 * The queries `Qti` names over its stored level (`#pantry/qti/base.ts` `QtiBase`), and every rule
 * that reads one: grizzle's rules over queries (README, "Rules over queries"). Each query is a live
 * derived relation, `derived(name, query(QtiBase)…)`, or `query(QtiViews)` where it matches a
 * shared view, which stores nothing: a rule over it reads its definition as the tables stand at
 * COMMIT, through a deferred constraint trigger on each table the definition reads. A relation the
 * database derives from what the import writes is a query here, never a stored copy the import
 * keeps in step.
 *
 * A query is over the stored level or its views, and no law of either reads one, so the queries and
 * their rules live here, in a module `base.ts` never imports, and `Qti` (`#pantry/qti/schema.ts`)
 * is the level that holds them. Each domain's rules are grouped by the law each states, as every
 * module's are, in {@link queryLawsByName} beside the rules, so the schema's own naming of its laws
 * reads them (`#pantry/test/law-namer.ts` `namedLaws`).
 *
 * A derived relation's definition reads only the levels below its own, never another derived
 * relation of this level (grizzle's `admitExtend`), so a definition several queries share is a
 * query of its own, such as `namingRecords`, which each of them matches, and a join that rules of
 * several modules or levels read is a shared view of `QtiViews` (`#pantry/qti/names.ts`), such as
 * the resolution of a declared name or a node of a record document, which a query over that level
 * matches.
 */
import { check, Compute, contained, derived, key, on, query, select, v } from "@bjornpagen/grizzle";
import { integerMathOperators } from "#pantry/grammar/expression.ts";
import type { DeclarationKind } from "#pantry/grammar/install.ts";
import { documentTypes, nonElementKinds, ResourceTypeLexical } from "#pantry/grammar/install.ts";
import { QtiBase } from "#pantry/qti/base.ts";
import { Attribute } from "#pantry/qti/attributes.ts";
import { DataSsmlMember, DataSsmlProperty } from "#pantry/qti/data-ssml.ts";
import { LookupValue, MapKey } from "#pantry/qti/mapping.ts";
import {
  attributeCodes,
  attributeValues,
  DeclarationName,
  LangValue,
  NamedDeclaration,
  QtiViews,
  RecordNode,
  TypedDeclarationName,
  valueBasesOf,
  VariableRefNode,
} from "#pantry/qti/names.ts";
import {
  BoundVariable,
  Choice,
  FragmentPrintedRef,
  Hottext,
  itemBuiltInNames,
  LeastCount,
  PlacedBinding,
  PlacedChoice,
  PlacedHottext,
  PrintedVariableRef,
} from "#pantry/qti/interactions.ts";
import {
  conditionKindHandles,
  declaredKinds,
  heldKinds,
  lookupKindHandle,
  setKindHandles,
  ValueBase,
} from "#pantry/qti/expression-types.ts";
import {
  Expression,
  PlacedVariableRef,
  silentBases,
  VariableRef,
  VariableRefTable,
} from "#pantry/qti/expressions.ts";
import { keyText } from "#pantry/qti/limits.ts";
import {
  forbiddenResourceTypes,
  lomVocabularySources,
  objectTypes,
  resourceMetadata,
  UsageValue,
} from "#pantry/qti/metadata.ts";
import { Reference, ResourceDocument, ResourceHref, TextReference } from "#pantry/qti/package.ts";
import { Document } from "#pantry/qti/chardata.ts";
import { documentStart, Node } from "#pantry/qti/node.ts";
import {
  overlayQueryLaws,
  overlayQueryLawsByName,
  overlayQueryRelations,
} from "#pantry/qti/overlay-queries.ts";
import {
  referenceBaseTypeOf,
  referenceCardinalityOf,
} from "#pantry/qti/overlay-queries/reference.ts";
import { AlignDirectionLexical, MathAlignScope } from "#pantry/qti/mathml-align.ts";
import {
  Instance,
  instanceRoots,
  ItemRefDocument,
  ItemRefHref,
  Named,
  SiteTarget,
  TestDocument,
} from "#pantry/qti/tests.ts";
import {
  itemKind,
  itemRefKind,
  itemResourceType,
  linkResourceTypes,
  sectionKind,
} from "#pantry/vocab/terms/tests.ts";
import { noLanguage, objectKinds, usageValueKind } from "#pantry/vocab/terms/metadata.ts";

/**
 * A resource's type, by the resource's place, where its `type` spells a `ResourceType` handle
 * (C17): its attribute's `value`, the form as written (the attribute's type is an `xs:string`
 * enumeration, whose whitespace is preserved, XSD 1.1 Part 2, §4.3.6), joined to
 * `ResourceTypeLexical` for its `code` ({@link attributeCodes}). No row copies it (C18). A
 * resource whose `type` spells none, or that writes none, has no row and names no type anywhere,
 * so AL1's value domain, or AL3, refuses its `type` alone (spec reading 67), and no law reads a
 * type it does not have. Every rule that reads it meets it at a {@link ResourceHref}, a resource
 * of the package's manifest.
 */
const resourceTypes = attributeCodes("type", ["cp:resource"], ResourceTypeLexical);

/**
 * The href of a resource that has a type, by the resource's place, `(package, path, start)`: its
 * {@link ResourceHref}'s scope and `target`, the path it is compared by, beside its type's code
 * ({@link resourceTypes}), so a document-typed resource's href is judged as the document it names.
 * A resource with an href and no type, or a type and no href, has no typed href, so no rule over
 * one asks anything of it.
 *
 * Its rows are a join no table stores and no write keeps, which the importer reads on the host
 * before it writes a row, to name the documents it reads (`#pantry/import/overlays/package.ts`
 * `typedHrefsOf`). It is a query of its own, which {@link TypedHref} names, so the queries over an
 * item ref's target ({@link itemRefTargets}, {@link targetHrefs}) match and negate it.
 */
const typedHrefs = query(QtiBase).rule((r) => {
  const { package: pkg, path, scope, start, target } = v(ResourceHref, "href");
  const { code: type } = v(resourceTypes, "typed");

  return r
    .match(ResourceHref, { package: pkg, path, scope, start, target })
    .match(resourceTypes, { code: type, package: pkg, path, start })
    .find({ package: pkg, path, scope, start, target, type });
});

/**
 * {@link typedHrefs} as a relation of the schema, which the rules of "Document entry",
 * "RootOfType" and the importer read.
 */
const TypedHref = derived("TypedHref", typedHrefs);

/**
 * The href of a resource whose `type` is written and spells no `ResourceType` handle, by the
 * resource's place: its {@link ResourceHref}'s `target`, where the resource's manifest `type` is
 * nonempty and the resource has no type code ({@link resourceTypes}), whose rows are exactly the
 * resources whose `type` spells a handle (spec reading 67: AL1's value domain refuses the `type`
 * alone). The two conditions are two filters, the `type` nonempty and no code for the resource,
 * so the query reads no pattern over the attribute's unbounded lexical form. A resource
 * that writes no `type` has none (AL3 refuses it alone), and neither has one that writes no
 * `href`, which names no path. Its rows are a join no table stores, which "Item ref target" reads:
 * an item ref with no target ({@link UntargetedItemRef}) names a path one of these names, or is
 * refused (the oracle's `itemRefTargetOf` names no target there).
 */
const UnreadTypeHref = derived(
  "UnreadTypeHref",
  query(QtiBase).rule((r) => {
    const { package: pkg, path, start, target } = v(ResourceHref, "href");
    const { lexical } = v(Attribute, "type");

    return r
      .match(ResourceHref, { package: pkg, path, start, target })
      .match(Attribute, {
        kind: "cp:resource",
        lexical,
        name: "type",
        package: pkg,
        path,
        start,
      })
      .where(r.ne(lexical, ""))
      .where(r.not(resourceTypes, { package: pkg, path, start }))
      .find({ package: pkg, path, start, target });
  }),
);

/**
 * The paths a resource of the item type or an LTI type names, by package: the paths an item ref's
 * target is named at (R36). An item ref whose target none of them names
 * has no target ({@link UntargetedItemRef}).
 */
const targetHrefs = query(QtiBase).rule((r) => {
  const { package: pkg, target, type } = v(typedHrefs, "typed");

  return r
    .match(typedHrefs, { package: pkg, target, type })
    .where(r.in(type, [itemResourceType, ...linkResourceTypes]))
    .find({ package: pkg, target });
});

/**
 * What an item ref names, by the item ref's place: its
 * {@link ItemRefHref}'s `target`, and `type`, the type of a resource of the package whose href's
 * target that is, of the item type where one is, and else of an LTI type: the URI an
 * item ref holds is "the URI used to refer to the item's file (e.g., elsewhere in the same
 * content package)" (information model §5.6.5, `href`), so it names an item of the package, or an
 * LTI link (R36). Two rules state it, one per kind of target, and the link's negates the item's,
 * so an href that a resource of each type names is an item's alone. A path that several LTI types
 * name is a row per type, each a link.
 *
 * An item ref whose target no resource of either kind names has no target, and "Item ref target"
 * holds it to one a resource of an unread type names ({@link UntargetedItemRef}): a path
 * only a resource of another type the importer reads names, a test's or a stimulus's, is refused
 * there. One that writes no href has no {@link ItemRefHref} and names nothing, which AL3 alone
 * refuses (spec reading 155).
 *
 * In the corpus, feedbackTest's item ref `Example03-feedbackBlock-solution/...` names no file of
 * its package, which "Item ref target" refuses (`item-ref-target`, the verdict file's rule for
 * it), and testWithLti's two item refs name LTI links, a package refused under another rule.
 */
const itemRefTargets = query(QtiBase)
  .rule((r) => {
    const { package: pkg, path, start, target } = v(ItemRefHref, "href");
    const { type } = v(typedHrefs, "item");

    return r
      .match(ItemRefHref, { package: pkg, path, start, target })
      .match(typedHrefs, { package: pkg, target, type })
      .where(r.eq(type, itemResourceType))
      .find({ package: pkg, path, start, target, type });
  })
  .rule((r) => {
    const { package: pkg, path, start, target } = v(ItemRefHref, "href");
    const { type } = v(typedHrefs, "link");

    return r
      .match(ItemRefHref, { package: pkg, path, start, target })
      .match(typedHrefs, { package: pkg, target, type })
      .where(r.in(type, linkResourceTypes))
      .where(r.not(typedHrefs, { package: pkg, target, type: itemResourceType }))
      .find({ package: pkg, path, start, target, type });
  });

/**
 * {@link itemRefTargets} as a relation of the schema, which "Item ref target" reads: the item an
 * item ref names has its `ItemRefDocument`.
 */
const ItemRefTarget = derived("ItemRefTarget", itemRefTargets);

/**
 * The item refs that have no target, by the item ref's place: each {@link ItemRefHref} whose
 * target no resource of the item type or an LTI type names ({@link targetHrefs}). Its negation
 * reads those hrefs alone, never {@link itemRefTargets}, whose link rule negates in turn.
 */
const UntargetedItemRef = derived(
  "UntargetedItemRef",
  query(QtiBase).rule((r) => {
    const { package: pkg, path, start, target } = v(ItemRefHref, "href");

    return r
      .match(ItemRefHref, { package: pkg, path, start, target })
      .where(r.not(targetHrefs, { package: pkg, target }))
      .find({ package: pkg, path, start, target });
  }),
);

/**
 * The item refs that name an item.
 */
const itemTargets = select(ItemRefTarget, (t) => t.eq(t.type, itemResourceType));

/**
 * The typed hrefs whose type `RootOfType` maps: each names a document of that type.
 */
const documentHrefs = select(TypedHref, (h) => h.in(h.type, documentTypes));

/**
 * Each {@link Reference} beside its attribute's form as written, matched at `Attribute`'s key, its
 * element's place and the attribute's name: what "E1 derived" holds the reference's split to, its
 * `lead ‖ target ‖ params ‖ trail` the attribute's `lexical`. No row copies the form (C18). QTI
 * bounds no URL, so the form has no byte bound and no key or index may hold it
 * (`#pantry/qti/limits.ts`); the rule decides the equation by lengths and substrings, building no
 * text, and a deferred trigger judges it, its probe reading `Attribute` by its key.
 */
const ReferenceLexical = derived(
  "ReferenceLexical",
  query(QtiBase).rule((r) => {
    const {
      lead,
      name,
      package: pkg,
      params,
      path,
      start,
      target,
      trail,
    } = v(Reference, "reference");
    const { lexical } = v(Attribute, "attribute");

    return r
      .match(Reference, { lead, name, package: pkg, params, path, start, target, trail })
      .match(Attribute, { lexical, name, package: pkg, path, start })
      .find({ lead, lexical, name, package: pkg, params, path, start, target, trail });
  }),
);

/**
 * Each {@link TextReference} beside its element's string value, matched at `Node`'s key, the
 * element's place: what "E1 derived" holds the text reference's split to, its
 * `lead ‖ target ‖ params ‖ trail` the node's `stringValue`, as {@link ReferenceLexical} holds a
 * reference's. No row copies the string value (C18).
 */
const TextReferenceStringValue = derived(
  "TextReferenceStringValue",
  query(QtiBase).rule((r) => {
    const {
      lead,
      package: pkg,
      params,
      path,
      start,
      target,
      trail,
    } = v(TextReference, "reference");
    const { stringValue } = v(Node, "node");

    return r
      .match(TextReference, { lead, package: pkg, params, path, start, target, trail })
      .match(Node, { package: pkg, path, start, stringValue })
      .find({ lead, package: pkg, params, path, start, stringValue, target, trail });
  }),
);

/**
 * Every `map-key` of a `qti-map-entry` as written, by its element's place: what a {@link MapKey}
 * copies, compared as text. QTI bounds no map key, and a string mapping's key is an expected answer
 * of any length.
 */
const MapKeyAttributeText = derived(
  "MapKeyAttributeText",
  query(QtiBase).rule((r) => {
    const { kind, lexical, name, package: pkg, path, start } = v(Attribute, "attribute");

    return r
      .match(Attribute, { kind, lexical, name, package: pkg, path, start })
      .where(r.eq(name, "map-key"))
      .where(r.eq(kind, "qti-map-entry"))
      .find({ lexical, package: pkg, path, start });
  }),
);

/**
 * Every lookup table's typed attribute value as written, by its element's place: a table entry's
 * `target-value` and a table's `default-value`, what a {@link LookupValue} copies, compared as text.
 * An element of a lookup table writes at most one of the two, its kind's, so one row names each
 * place (AL1 refuses the other).
 */
const LookupAttributeText = derived(
  "LookupAttributeText",
  query(QtiBase).rule((r) => {
    const { lexical, name, package: pkg, path, start } = v(Attribute, "attribute");

    return r
      .match(Attribute, { lexical, name, package: pkg, path, start })
      .where(r.or(r.eq(name, "target-value"), r.eq(name, "default-value")))
      .find({ lexical, package: pkg, path, start });
  }),
);

/**
 * The mapping overlays' copies of free text, each held to its source by a rule over a query, which
 * compares the two texts and no index holds ("Mapping overlay"): a map key's and a lookup value's
 * copy of its attribute.
 */
const mappingQueryLawsByName = {
  "Mapping overlay": [
    contained(
      on(MapKey, "package", "path", "start", "key"),
      on(MapKeyAttributeText, "package", "path", "start", "lexical"),
    ),
    contained(
      on(LookupValue, "package", "path", "start", "value"),
      on(LookupAttributeText, "package", "path", "start", "lexical"),
    ),
  ],
} as const;

/**
 * Every rule over a typed href, each `check` named by its oracle law with spaces written as
 * underscores, the halves of P2 and P3 that `#pantry/qti/package.ts` states over the tables:
 *
 * - **P3 `entry-kind` ("Document entry"):** every document-typed href resolves in the package and
 *   names the one document at its target, of the href's type (reading 93). That document is an
 *   entry by `ResourceDocument`'s copy of its `Document` and the `Document`'s containment into
 *   `Entry`, so no rule here restates it.
 * - **P2 `root-type-reverse` ("RootOfType"):** every document a resource lists is at the target of a
 *   typed href of its type (spec reading 176).
 * - **"E1 derived":** a reference's split, in order, is its attribute's form as written
 *   ({@link ReferenceLexical}), and a text reference's its element's string value
 *   ({@link TextReferenceStringValue}; reading 102).
 * - **B2 and B3 ("Item ref target"):** an item ref with no target names a path an unread-type
 *   resource names ({@link UntargetedItemRef}, {@link UnreadTypeHref}); an item ref names an item
 *   exactly where it has its `ItemRefDocument`, the document at its target.
 */
const packageQueryLawsByName = {
  "Document entry": [
    check("Document_entry", TypedHref, (h) =>
      h.or(h.not(h.in(h.type, documentTypes)), h.eq(h.scope, "entry")),
    ),
    contained(
      on(documentHrefs, "package", "target", "type"),
      on(ResourceDocument, "package", "path", "type"),
    ),
  ],
  "E1 derived": [
    check("E1_derived", ReferenceLexical, (s) =>
      s.eq(
        s.lexical,
        Compute.concat(
          Compute.concat(
            Compute.concat(Compute.base(s.lead), Compute.base(s.target)),
            Compute.base(s.params),
          ),
          Compute.base(s.trail),
        ),
      ),
    ),
    check("E1_derived", TextReferenceStringValue, (s) =>
      s.eq(
        s.stringValue,
        Compute.concat(
          Compute.concat(
            Compute.concat(Compute.base(s.lead), Compute.base(s.target)),
            Compute.base(s.params),
          ),
          Compute.base(s.trail),
        ),
      ),
    ),
  ],
  "Item ref target": [
    // An item ref whose href names no resource of the item type or an LTI type names a path a
    // resource of an unread type names, so the type of what it names is unread, and nothing
    // judges it (spec reading 67).
    contained(on(UntargetedItemRef, "package", "target"), on(UnreadTypeHref, "package", "target")),
    contained(
      on(itemTargets, "package", "path", "start", "target"),
      on(ItemRefDocument, "package", "path", "start", "target"),
    ),
    contained(
      on(ItemRefDocument, "package", "path", "start", "target"),
      on(itemTargets, "package", "path", "start", "target"),
    ),
  ],
  RootOfType: [
    contained(
      on(ResourceDocument, "package", "path", "type"),
      on(TypedHref, "package", "target", "type"),
    ),
  ],
} as const;

/**
 * The records that name a document, each with that document (spec reading 62): a `lom:lom` of a
 * resource's `cp:metadata`, a node of a record document ({@link RecordNode}), its resource of an
 * item's or a test's type, and the document a resource
 * lists at the target the resource's `href` names ({@link ResourceDocument}), whatever type it is
 * read as (reading 162). A record whose resource has no `href`, no such type, or an `href` that
 * names no listed document names none, and no law reads it: "Document entry" refuses that `href`
 * (reading 93). The manifest is no resource's document (reading 146), so an `href` that names it
 * names none (NS6).
 *
 * A row is the record's place, `(package, path, record)`, its `record` its `start` in the
 * manifest, and `document`, the path of the document it names: the record's parent is its
 * `cp:metadata`, and that node's parent its resource. The record keys a row, since a record's
 * resource has one `href` and one type, and the package lists one document at a path
 * (`ResourceDocument`'s key over `package` and `path`).
 */
const namingRecords = query(QtiViews).rule((r) => {
  const { package: pkg, path, parent: metadata, start: record } = v(RecordNode, "record");
  const { parent: resource } = v(Node, "metadata");
  const { target: document } = v(ResourceHref, "href");
  const { code: type } = v(resourceTypes, "typed");

  return r
    .match(RecordNode, {
      kind: "lom:lom",
      package: pkg,
      parent: metadata,
      parentKind: resourceMetadata,
      path,
      start: record,
    })
    .match(Node, { package: pkg, parent: resource, path, start: metadata })
    .match(ResourceHref, { package: pkg, path, start: resource, target: document })
    .match(resourceTypes, { code: type, package: pkg, path, start: resource })
    .match(ResourceDocument, { package: pkg, path: document })
    .where(r.in(type, objectTypes))
    .find({ document, package: pkg, path, record });
});

/**
 * The general categories of the records that name a document, each with its record and that
 * document: a `lom:general` whose parent is its record, both in the record's document. Every
 * `lom-identifier` and `lom-title` query reaches its record through one, from an identifier's or a
 * title's parent, so a meta-metadata's or a relation's identifier, whose parent is no general
 * category, is read by none; and R26 reads a document's languages against each category that
 * describes it (`DescribedLang`).
 *
 * The category keys a row, its place `(package, path, general)`, since a node has one parent, and
 * a category describes one document, the one its record names.
 */
const namingGenerals = query(QtiViews).rule((r) => {
  const { package: pkg, parent: record, path, start: general } = v(Node, "general");
  const { document } = v(namingRecords, "named");

  return r
    .match(Node, { kind: "lom:general", package: pkg, parent: record, path, start: general })
    .match(namingRecords, { document, package: pkg, path, record })
    .find({ document, general, package: pkg, path, record });
});

/**
 * The entries of the general identifiers of the records that name a document, each with its
 * record, that document and its folded string value (`copiedTextKinds` of `#pantry/qti/node.ts`):
 * a `lom:entry` whose parent is a `lom:identifier` whose parent is the record's general category.
 */
const generalEntries = query(QtiViews).rule((r) => {
  const { package: pkg, path, start: identifier } = v(Node, "identifier");
  const { stringValue: text } = v(Node, "entry");
  const { document, general, record } = v(namingGenerals, "general");

  return r
    .match(Node, { kind: "lom:identifier", package: pkg, parent: general, path, start: identifier })
    .match(Node, { kind: "lom:entry", package: pkg, parent: identifier, path, stringValue: text })
    .match(namingGenerals, { document, general, package: pkg, path, record })
    .find({ document, package: pkg, path, record, text });
});

/**
 * An assessment object's `identifier`, by its root's place: the attribute's `value`, its lexical
 * form collapsed (`IdentifierDType`'s class, C18), on an item's root ({@link attributeValues}). No
 * row copies it. A root that writes no `identifier` has none, and AL3 refuses it; the grammar
 * admits an item only as its document's root, so a document has at most one.
 */
const objectIdentifiers = attributeValues("identifier", objectKinds);

/**
 * {@link objectIdentifiers} as a relation of `Qti`, which "Item key" keys, a rule reads and the
 * ledger's item sessions are contained in.
 */
export const ObjectIdentifier = derived("ObjectIdentifier", objectIdentifiers);

/**
 * A usage statistic's value's `baseType`, by its `ud:value` node, whether or not the value forms
 * part of a record ({@link attributeValues}): its `value`, the form as written, an `xs:string`
 * enumeration's class being `preserve`. No row copies it; a record value's `UsageValue`
 * (`#pantry/qti/metadata.ts`) holds its own `baseTypeLexical` to it.
 */
const UsageBaseType = derived("UsageBaseType", attributeValues("baseType", [usageValueKind]));

/**
 * An assessment object's `title`, by its root's place: the attribute's `value`, the title as
 * written with each tab, line feed and carriage return replaced (`xs:normalizedString`'s class,
 * C18), on an item's root ({@link attributeValues}), which `lom-title` compares. No row copies it.
 * A root that writes no `title` has none, and AL3 refuses it; a document has at most one, as it has
 * at most one {@link objectIdentifiers}.
 */
const objectTitles = attributeValues("title", objectKinds);

/**
 * The records that name a document and whose general category lists an `identifier` with an
 * entry, each by its record's place: `lom-identifier` reads each (§2.7.1.1). A meta-metadata's or a
 * relation's identifier is no general one.
 */
const ListedIdentifier = derived(
  "ListedIdentifier",
  query(QtiViews).rule((r) => {
    const { package: pkg, path, record } = v(generalEntries, "entry");

    return r
      .match(generalEntries, { package: pkg, path, record })
      .find({ package: pkg, path, record });
  }),
);

/**
 * The records that name a document one of whose general `identifier` entries is that document's
 * identifier, each by its record's place (§2.7.1.1: "One of the values given for the identifier
 * must have an entry that matches the identifier of the associated item, test or object bank"):
 * the entry's text collapsed is the root's collapsed `identifier` ({@link ObjectIdentifier}, in the
 * named document), so a document that writes none is named by no entry.
 */
const MatchedIdentifier = derived(
  "MatchedIdentifier",
  query(QtiViews).rule((r) => {
    const { document, package: pkg, path, record, text } = v(generalEntries, "entry");
    const { value: identifier } = v(objectIdentifiers, "object");

    return r
      .match(generalEntries, { document, package: pkg, path, record, text })
      .match(objectIdentifiers, { package: pkg, path: document, value: identifier })
      .where(r.eq(Compute.collapse(text), identifier))
      .find({ package: pkg, path, record });
  }),
);

/**
 * The records that name a document and whose general category has a `title`, each by its record's
 * place: `lom-title` reads each (§2.7.1.2).
 */
const ListedTitle = derived(
  "ListedTitle",
  query(QtiViews).rule((r) => {
    const { package: pkg, parent: general, path } = v(Node, "title");
    const { record } = v(namingGenerals, "general");

    return r
      .match(Node, { kind: "lom:title", package: pkg, parent: general, path })
      .match(namingGenerals, { general, package: pkg, path, record })
      .find({ package: pkg, path, record });
  }),
);

/**
 * The strings of a general title of the records that name a document whose value is that
 * document's title, each with its record, the string, and the document's path and root: the
 * string's folded text (`copiedLangStringText` of `#pantry/qti/node.ts`) with its whitespace
 * replaced is the root's `title` ({@link objectTitles}), both in `xs:normalizedString`'s value
 * space. A string reaches its record through its `lom:title`, whose parent is a general category,
 * all three in the record's document.
 */
const titledStrings = query(QtiViews).rule((r) => {
  const { package: pkg, parent: title, path, start: string, stringValue: text } = v(Node, "string");
  const { parent: general } = v(Node, "title");
  const { document, record } = v(namingGenerals, "general");
  const { start: root, value: titleValue } = v(objectTitles, "objectTitle");

  return r
    .match(Node, {
      kind: "lom:string",
      package: pkg,
      parent: title,
      path,
      start: string,
      stringValue: text,
    })
    .match(Node, { kind: "lom:title", package: pkg, parent: general, path, start: title })
    .match(namingGenerals, { document, general, package: pkg, path, record })
    .match(objectTitles, { package: pkg, path: document, start: root, value: titleValue })
    .where(r.eq(Compute.replaceWhitespace(text), titleValue))
    .find({ document, package: pkg, path, record, root, string });
});

/**
 * The records that name a document one of whose title strings is that document's title in its
 * language, each by its record's place (§2.7.1.2: "The title must have a value that matches the
 * value of the title attribute of the associated item, test or object bank. The language used to
 * interpret the title is taken from the language attribute"): a {@link titledStrings} row whose root
 * states no language or whose string is in the root's. Four rules state it, one for each state of
 * the root's optional `xml:lang` (its `Attribute` at the root, and the language it states, its
 * {@link LangValue}) and the string's optional `language` attribute: where the root writes one, it
 * states no language, its value empty (spec reading 151), or the string writes no `language`, or
 * one that is empty, or the two are one tag without regard to case (RFC 5646 §2.1.1); and where it
 * writes none, any string is in its language.
 */
const MatchedTitle = derived(
  "MatchedTitle",
  query(QtiViews)
    .rule((r) => {
      const { document, package: pkg, path, record, root } = v(titledStrings, "titled");

      return r
        .match(titledStrings, { document, package: pkg, path, record, root })
        .match(Attribute, { name: "xml:lang", package: pkg, path: document, start: root })
        .where(r.not(LangValue, { package: pkg, path: document, start: root }))
        .find({ package: pkg, path, record });
    })
    .rule((r) => {
      const { document, package: pkg, path, record, root, string } = v(titledStrings, "titled");

      return r
        .match(titledStrings, { document, package: pkg, path, record, root, string })
        .match(Attribute, { name: "xml:lang", package: pkg, path: document, start: root })
        .where(r.not(Attribute, { name: "language", package: pkg, path, start: string }))
        .find({ package: pkg, path, record });
    })
    .rule((r) => {
      const { document, package: pkg, path, record, root, string } = v(titledStrings, "titled");
      const { value } = v(LangValue, "lang");
      const { lexical } = v(Attribute, "language");

      return r
        .match(titledStrings, { document, package: pkg, path, record, root, string })
        .match(LangValue, { package: pkg, path: document, start: root, value })
        .match(Attribute, { lexical, name: "language", package: pkg, path, start: string })
        .where(r.or(r.eq(lexical, noLanguage), r.eq(Compute.lowerAscii(lexical), value)))
        .find({ package: pkg, path, record });
    })
    .rule((r) => {
      const { document, package: pkg, path, record, root } = v(titledStrings, "titled");

      return r
        .match(titledStrings, { document, package: pkg, path, record, root })
        .where(r.not(Attribute, { name: "xml:lang", package: pkg, path: document, start: root }))
        .find({ package: pkg, path, record });
    }),
);

/**
 * Each language a document's `xml:lang` states, under each general category that describes the
 * document (`namingGenerals`), by the category's place: the compared value of each form the
 * document carries outside every catalog that states a language, a {@link LangValue} whose scope
 * is the document node, which R26 asks the category to list. A form that states no language, the
 * empty one, asks nothing, so it is lawful beside an empty `lom:language`, and one outside its
 * domain AL1 refuses where it is written (spec reading 174).
 */
const DescribedLang = derived(
  "DescribedLang",
  query(QtiViews).rule((r) => {
    const { value } = v(LangValue, "form");
    const { document, general, package: pkg, path } = v(namingGenerals, "described");

    return r
      .match(LangValue, { package: pkg, path: document, scope: documentStart, value })
      .match(namingGenerals, { document, general, package: pkg, path })
      .find({ general, package: pkg, path, value });
  }),
);

/**
 * Each language an item's assembly states in place (spec reading 117), under each general
 * category that describes the item, as `DescribedLang` is a document's: the compared value of each
 * form outside every catalog that states a language, a {@link LangValue} whose scope is its
 * document node, of the document of each instance of the item's assembly, the instance and the form
 * joined by the instance's document, which no row stores.
 */
const DescribedAssembledLang = derived(
  "DescribedAssembledLang",
  query(QtiViews).rule((r) => {
    const { assembly, document } = v(Instance, "instance");
    const { value } = v(LangValue, "form");
    const { general, package: pkg, path } = v(namingGenerals, "described");

    return r
      .match(Instance, { assembly, assemblyKind: itemKind, document, package: pkg })
      .match(LangValue, { package: pkg, path: document, scope: documentStart, value })
      .match(namingGenerals, { document: assembly, general, package: pkg, path })
      .find({ general, package: pkg, path, value });
  }),
);

/**
 * The languages each LOM `general` category of a record document ({@link RecordNode}) lists, one
 * row per (category, language), by the category's place: each
 * `lom:language` child's folded string value (`copiedTextKinds` of `#pantry/qti/node.ts`)
 * case-folded (`Compute.lowerAscii`, RFC 5646 §2.1.1), so two listings that differ only in case
 * are one language. It is keyed by the category's element, not by a resource: one hop from a
 * `lom:language` cannot tell a resource's record from the manifest's, a file's or an external one,
 * and R26 reads the categories of the records that name a document (`namingGenerals`).
 */
const ListedLang = derived(
  "ListedLang",
  query(QtiViews).rule((r) => {
    const { package: pkg, parent: general, path, stringValue } = v(RecordNode, "language");

    return r
      .match(RecordNode, {
        kind: "lom:language",
        package: pkg,
        parent: general,
        parentKind: "lom:general",
        path,
        stringValue,
      })
      .find({
        general,
        lang: Compute.cast(Compute.lowerAscii(stringValue), keyText),
        package: pkg,
        path,
      });
  }),
);

/**
 * The identity overlays' rules over a query, each named by its oracle law: R26 (law "Document
 * lang", QTI 3.0 Metadata §2.7.1.3), each language a document or an item's assembly states is one
 * every general category describing it lists ({@link ListedLang}).
 */
const identityQueryLawsByName = {
  "Document lang": [
    contained(
      on(DescribedLang, "package", "path", "general", "value"),
      on(ListedLang, "package", "path", "general", "lang"),
    ),
    contained(
      on(DescribedAssembledLang, "package", "path", "general", "value"),
      on(ListedLang, "package", "path", "general", "lang"),
    ),
  ],
} as const;

/**
 * A learning resource type's term of one kind in a record document ({@link RecordNode}), with its
 * learning resource type's node and the term's folded string value
 * (`copiedTextKinds` of `#pantry/qti/node.ts`), compared collapsed. The binding's Schematron caps
 * each term at one per type (N7, spec reading 130).
 *
 * @param kind - The term: its vocabulary's `lom:source` or its `lom:value`.
 * @returns The terms, each by its type's place.
 */
const resourceTypeTerms = (kind: "lom:source" | "lom:value") =>
  query(QtiViews).rule((r) => {
    const { package: pkg, parent: type, path, stringValue: text } = v(RecordNode, "term");

    return r
      .match(RecordNode, {
        kind,
        package: pkg,
        parent: type,
        parentKind: "lom:learningResourceType",
        path,
        stringValue: text,
      })
      .find({ package: pkg, path, text, type });
  });

/**
 * The learning resource types whose value, collapsed, QTI 3.0 Metadata §2.7.5.1 forbids of the LOM
 * vocabulary, `exam` and `self assessment` ({@link forbiddenResourceTypes}), each by its node: each
 * needs a source of another vocabulary.
 */
const ForbiddenResourceType = derived(
  "ForbiddenResourceType",
  query(QtiViews).rule((r) => {
    const { package: pkg, path, text, type } = v(resourceTypeTerms("lom:value"), "value");

    return r
      .match(resourceTypeTerms("lom:value"), { package: pkg, path, text, type })
      .where(
        r.or(...forbiddenResourceTypes.map((forbidden) => r.eq(Compute.collapse(text), forbidden))),
      )
      .find({ package: pkg, path, type });
  }),
);

/**
 * The learning resource types whose source names another vocabulary than the LOM's, each by its
 * node: a source that collapses to neither `LOMv1.0` nor the empty source the binding's default
 * fills ({@link lomVocabularySources}). A type that writes no source has no row.
 */
const OtherVocabularyType = derived(
  "OtherVocabularyType",
  query(QtiViews).rule((r) => {
    const { package: pkg, path, text, type } = v(resourceTypeTerms("lom:source"), "source");

    return r
      .match(resourceTypeTerms("lom:source"), { package: pkg, path, text, type })
      .where(r.and(...lomVocabularySources.map((source) => r.ne(Compute.collapse(text), source))))
      .find({ package: pkg, path, type });
  }),
);

/**
 * The metadata overlays' rules over a query, each named by its oracle law (spec readings 62 and
 * 122):
 *
 * - **`E1 derived`:** a record usage value's `baseTypeLexical` is its `baseType`'s value
 *   ({@link UsageBaseType});
 * - **`Item key`:** no two items of one package share an identifier, collapsed
 *   ({@link ObjectIdentifier}): an item is `(package, identifier)`, QTI's own identity and never
 *   its path, which a ledger's item sessions are held to. QTI makes the identifier unique nowhere
 *   (`IdentifierDType`), so this narrows its slot. A key over a query, judged once per written
 *   package;
 * - **`lom-identifier`:** a record that names a document and lists a general identifier names that
 *   document's identifier ("LomObjectIdentifier");
 * - **`lom-title`:** a record that names a document and has a general title names that document's
 *   title in its language ("LomObjectTitle");
 * - **`lom-learning-resource-type`:** a learning resource type whose value collapses to `exam` or
 *   `self assessment` has a source that names another vocabulary ("LOM learning resource type").
 */
const metadataQueryLawsByName = {
  "E1 derived": [
    contained(
      on(UsageValue, "package", "path", "start", "baseTypeLexical"),
      on(UsageBaseType, "package", "path", "start", "value"),
    ),
  ],
  "Item key": [key(on(ObjectIdentifier, "package", "value"))],
  "LOM learning resource type": [
    contained(
      on(ForbiddenResourceType, "package", "path", "type"),
      on(OtherVocabularyType, "package", "path", "type"),
    ),
  ],
  LomObjectIdentifier: [
    contained(
      on(ListedIdentifier, "package", "path", "record"),
      on(MatchedIdentifier, "package", "path", "record"),
    ),
  ],
  LomObjectTitle: [
    contained(
      on(ListedTitle, "package", "path", "record"),
      on(MatchedTitle, "package", "path", "record"),
    ),
  ],
} as const;

/**
 * The type a setter or a lookup sets its variable to, one row per expression it holds, by the
 * setter's place: its reference by `identifier` (`kind`, `baseType`, `cardinality` and
 * `resolution`, its `VariableRefNode`'s) joined with each `Expression` whose node's parent it is,
 * in its own document (`heldBase` and `heldCardinality`, that expression's type). Its content
 * model allows one expression, and a second breaks N5's `Follow`, so a lawful setter or lookup has
 * one row. `Set_type` (P20) and `Lookup_type` (P22) read it.
 *
 * A setter whose `identifier` names no variable, unwritten or no NCName (spec reading 152), has
 * no reference, and one that holds no expression holds no type, so neither has a row, and AL3,
 * its value domain or its content model refuses it alone.
 */
const HeldType = derived(
  "HeldType",
  query(QtiViews).rule((r) => {
    const {
      baseType,
      cardinality,
      kind,
      package: pkg,
      path,
      resolution,
      start,
    } = v(VariableRefNode, "reference");
    const { baseType: heldBase, cardinality: heldCardinality, start: held } = v(Expression, "held");

    return r
      .match(VariableRefNode, {
        attribute: "identifier",
        baseType,
        cardinality,
        kind,
        package: pkg,
        path,
        resolution,
        start,
      })
      .match(Node, { package: pkg, parent: start, path, start: held })
      .match(Expression, {
        baseType: heldBase,
        cardinality: heldCardinality,
        package: pkg,
        path,
        start: held,
      })
      .where(r.in(kind, heldKinds))
      .find({
        baseType,
        cardinality,
        heldBase,
        heldCardinality,
        kind,
        package: pkg,
        path,
        resolution,
        start,
      });
  }),
);

/**
 * A reference to a name its document declares: each `VariableRef` joined with its document's
 * `NamedDeclaration` of the name it spells (`#pantry/qti/names.ts`), whatever the declaration's
 * cardinality spells (spec reading 159). A reference resolves to a declaration exactly where its
 * document declares its name (M2), so `E1_derived` holds every row's `resolution` to `declared`,
 * and a reference that resolves to a built-in or to nothing is none of them.
 */
const DeclaredReference = derived(
  "DeclaredReference",
  query(QtiViews).rule((r) => {
    const {
      attribute,
      identifier,
      package: pkg,
      path,
      resolution,
      start,
    } = v(VariableRef, "reference");

    return r
      .match(VariableRef, { attribute, identifier, package: pkg, path, resolution, start })
      .match(NamedDeclaration, { identifier, package: pkg, path })
      .find({ attribute, package: pkg, path, resolution, start });
  }),
);

/**
 * A placed reference to a name its assembly's item declares (spec reading 117), as
 * {@link DeclaredReference} is a document's own: each `PlacedVariableRef` joined with the item's
 * `NamedDeclaration` of the name it spells, the item the document at the assembly's path,
 * every row `declared`. A row is the placed reference: its element's place, its instance in its
 * assembly, and its attribute.
 */
const DeclaredPlacement = derived(
  "DeclaredPlacement",
  query(QtiViews).rule((r) => {
    const {
      assembly,
      attribute,
      identifier,
      instance,
      package: pkg,
      path,
      resolution,
      start,
    } = v(PlacedVariableRef, "placed");

    return r
      .match(PlacedVariableRef, {
        assembly,
        attribute,
        identifier,
        instance,
        package: pkg,
        path,
        resolution,
        start,
      })
      .match(NamedDeclaration, { identifier, package: pkg, path: assembly })
      .find({ assembly, attribute, instance, package: pkg, path, resolution, start });
  }),
);

/**
 * A declared placed reference's type in its item (spec reading 117), keyed as the placed
 * reference: each declared `PlacedVariableRef`, and `declaration`, its name's place in the item,
 * the document at the assembly's path, joined with its element's `Node`, for `kind`, its element's
 * kind, and `parentKind`, its parent's, and with the name views `DeclarationName` and
 * `TypedDeclarationName` (`#pantry/qti/names.ts`), for `cardinality` and `baseType`, as a placed
 * binding's are read (`#pantry/qti/overlay-queries/interaction.ts`). A reference
 * in an included rules fragment is typed in the fragment's own document, where its name is
 * undeclared, so its `VariableRef`'s type is `unknown`; a row here types it in the item, and
 * "Condition type" reads it. The item's own document is an instance too, so an inline reference
 * has a row as well, and an inline condition is held twice, here and over its `Expression`, under
 * the one law.
 *
 * A declaration's type is never silent: a declaration whose cardinality spells nothing, or a
 * record, which writes no base type, has no row of either relation (spec readings 158 and 159),
 * so its references have none here, and no rule reads a type the declaration does not have.
 */
const PlacedReferenceType = derived(
  "PlacedReferenceType",
  query(QtiViews).rule((r) => {
    const {
      assembly,
      attribute,
      identifier,
      instance,
      package: pkg,
      path,
      start,
    } = v(PlacedVariableRef, "placed");
    const { cardinality, start: declaration } = v(DeclarationName, "name");
    const { kind, parentKind } = v(Node, "element");
    const { baseType } = v(TypedDeclarationName, "typed");

    return r
      .match(PlacedVariableRef, {
        assembly,
        attribute,
        identifier,
        instance,
        package: pkg,
        path,
        resolution: "declared",
        start,
      })
      .match(DeclarationName, {
        cardinality,
        identifier,
        package: pkg,
        path: assembly,
        start: declaration,
      })
      .match(TypedDeclarationName, { baseType, identifier, package: pkg, path: assembly })
      .match(Node, { kind, package: pkg, parentKind, path, start })
      .find({
        assembly,
        attribute,
        baseType,
        cardinality,
        declaration,
        instance,
        kind,
        package: pkg,
        parentKind,
        path,
        start,
      });
  }),
);

/**
 * Each `qti-variable` that writes a `weight-identifier`, by the variable's place: a weighted
 * variable, which stands only in a test's outcome processing ("Weights are defined only in the test
 * context (and hence only in outcomes processing)", information model §7.47.2; spec reading 199).
 * "Outcome only" holds each to an expression of the outcome language.
 */
const WeightedVariable = derived(
  "WeightedVariable",
  query(QtiBase).rule((r) => {
    const { package: pkg, path, start } = v(Attribute, "weight");

    return r
      .match(Attribute, {
        kind: "qti-variable",
        name: "weight-identifier",
        package: pkg,
        path,
        start,
      })
      .find({ package: pkg, path, start });
  }),
);

/**
 * The kinds a `base-type` of their own types: a base value, whose `base-type` is required, and a
 * test variables, which may omit it ({@link UntypedUnweighted}, {@link UntypedWeighted}).
 */
const baseTypedKinds = ["qti-base-value", "qti-test-variables"] as const;

/**
 * Each `base-type` of a base value or a test variables that spells a base, by its element's place,
 * with the base type the database derives from it: the code its value spells
 * (`BaseTypeLexical`, C17) as an expression's base type, its `ValueBaseOf` image, the one join of
 * the two (`valueBasesOf` of `#pantry/qti/names.ts`).
 */
const spelledBaseTypes = valueBasesOf("base-type", baseTypedKinds);

/**
 * Each math operator's `name`, by its element's place, with its value.
 */
const mathOperatorNames = attributeValues("name", ["qti-math-operator"]);

/**
 * The base type an attribute-typed expression's typing attribute gives it, by its element's place,
 * where its element writes one: a base value's and a test variables' `base-type`, the base its
 * value spells ({@link spelledBaseTypes}); and a math operator's `name`, `integer` for one of
 * `integerMathOperators` (`#pantry/grammar/expression.ts`) and `float` for any other (information
 * model §2.11.3.32). Each attribute is an `xs:string` enumeration, `whiteSpace` preserve, so its
 * value is its lexical form, compared by its exact spellings. A `base-type` is an enumeration of
 * exactly the bases `BaseTypeLexical` spells, so one that spells none is AL1's alone, and types
 * nothing here. No row copies an attribute (C18): "E1 derived" holds each such expression's base
 * type to its row. An element holds at most one typing attribute, a base value and a test
 * variables a `base-type` and a math operator a `name`, so the query has at most one row per
 * element.
 */
const ExpressionAttribute = derived(
  "ExpressionAttribute",
  query(QtiBase)
    .rule((r) => {
      const { package: pkg, path, start, valueBase: baseType } = v(spelledBaseTypes, "spelled");

      return r
        .match(spelledBaseTypes, { package: pkg, path, start, valueBase: baseType })
        .find({ baseType, package: pkg, path, start });
    })
    .rule((r) => {
      const { package: pkg, path, start, value } = v(mathOperatorNames, "integer");

      return r
        .match(mathOperatorNames, { package: pkg, path, start, value })
        .where(r.in(value, integerMathOperators))
        .find({ baseType: ValueBase.handle("integer"), package: pkg, path, start });
    })
    .rule((r) => {
      const { package: pkg, path, start, value } = v(mathOperatorNames, "float");

      return r
        .match(mathOperatorNames, { package: pkg, path, start, value })
        .where(Compute.not(r.in(value, integerMathOperators)))
        .find({ baseType: ValueBase.handle("float"), package: pkg, path, start });
    }),
);

/**
 * The test variables that write neither a `base-type` nor a `weight-identifier`, each with its
 * expression's base type, by its place: no attribute types it, so its type is `unknown`, which
 * matches every integer and float variable (information model §7.39.6; spec reading 167).
 */
const UntypedUnweighted = derived(
  "UntypedUnweighted",
  query(QtiBase).rule((r) => {
    const { baseType, package: pkg, path, start } = v(Expression, "variables");

    return r
      .match(Expression, { baseType, package: pkg, path, start })
      .match(Node, { kind: "qti-test-variables", package: pkg, path, start })
      .where(r.not(Attribute, { name: "base-type", package: pkg, path, start }))
      .where(r.not(Attribute, { name: "weight-identifier", package: pkg, path, start }))
      .find({ baseType, package: pkg, path, start });
  }),
);

/**
 * The test variables that write a `weight-identifier` and no `base-type`, each with its
 * expression's base type, by its place: "When a weighting is specified the result of the
 * expression always has base-type float" (information model §7.39.5; decision 434).
 */
const UntypedWeighted = derived(
  "UntypedWeighted",
  query(QtiBase).rule((r) => {
    const { baseType, package: pkg, path, start } = v(Expression, "variables");

    return r
      .match(Expression, { baseType, package: pkg, path, start })
      .match(Node, { kind: "qti-test-variables", package: pkg, path, start })
      .match(Attribute, { name: "weight-identifier", package: pkg, path, start })
      .where(r.not(Attribute, { name: "base-type", package: pkg, path, start }))
      .find({ baseType, package: pkg, path, start });
  }),
);

/**
 * The response processing templates the information model publishes, by name (spec reading 51,
 * from section 2.5.1's list): `match_correct`, `map_response` and `map_response_point`, and the
 * Common Cartridge templates `CC2_match`, `CC2_match_basic` and `CC2_map_response`. A `template`
 * URI names one by {@link urisOf}.
 */
const publishedTemplates = [
  "match_correct",
  "map_response",
  "map_response_point",
  "CC2_match",
  "CC2_match_basic",
  "CC2_map_response",
] as const;

/**
 * A published template's name.
 */
type PublishedTemplate = (typeof publishedTemplates)[number];

/**
 * The URI prefixes a published template is named under (spec reading 51): the information model's
 * and the implementation guide's examples'.
 */
const templatePrefixes = [
  "https://purl.imsglobal.org/spec/qti/v3p0/rptemplates/",
  "https://www.imsglobal.org/question/qti_v3p0/rptemplates/",
] as const;

/**
 * The `template` URIs that name some published templates (spec reading 51): each template's four,
 * either of {@link templatePrefixes} followed by its name, with or without `.xml`. A `template`'s
 * `value` is its lexical form collapsed, as `xs:anyURI`'s whitespace facet collapses it, so it
 * names a template exactly where it is one of these.
 *
 * @param templates - The templates.
 * @returns Their URIs.
 */
const urisOf = (templates: readonly PublishedTemplate[]) =>
  templates.flatMap((template) =>
    templatePrefixes.flatMap((prefix) => [`${prefix}${template}`, `${prefix}${template}.xml`]),
  );

/**
 * Each `qti-response-processing`'s `template`, by its element's place, with its `value`
 * (`attributeValues` of `#pantry/qti/names.ts`, which no row copies).
 */
const processingTemplates = attributeValues("template", ["qti-response-processing"]);

/**
 * Each item's response processing that names a template and holds no rule of its own, by its
 * document (`package`, `path`), with the template's URI, `value`: its `template`
 * ({@link processingTemplates}), where its node is a `qti-response-processing` whose parent is the
 * item and which has no element child. "If a template identifier is given it may be used to locate
 * an externally defined responseProcessing template. The rules obtained from the external template
 * may be used instead of the rules defined within the item itself, though if both are given the
 * internal rules are still preferred" (information model §4.6.1), so a processing that holds a rule
 * runs its own rules, and the template's are judged nowhere. "Template needs" selects the
 * processings whose URI names a published template ({@link urisOf}).
 */
const TemplateProcessing = derived(
  "TemplateProcessing",
  query(QtiBase).rule((r) => {
    const { package: pkg, path, start, value } = v(processingTemplates, "template");
    const { elementChildren } = v(Node, "node");

    return r
      .match(processingTemplates, { package: pkg, path, start, value })
      .match(Node, {
        elementChildren,
        kind: "qti-response-processing",
        package: pkg,
        parentKind: itemKind,
        path,
        start,
      })
      .where(r.eq(elementChildren, 0n))
      .find({ package: pkg, path, value });
  }),
);

/**
 * The documents whose response declaration `RESPONSE` holds a `qti-mapping`, by the document
 * (`package`, `path`): its `NamedDeclaration` of that name and kind (`#pantry/qti/names.ts`), and
 * a `qti-mapping` node among its children.
 */
const MappedResponseDeclaration = derived(
  "MappedResponseDeclaration",
  query(QtiViews).rule((r) => {
    const { package: pkg, path, start: declaration } = v(NamedDeclaration, "response");

    return r
      .match(NamedDeclaration, {
        declarationKind: "qti-response-declaration",
        identifier: "RESPONSE",
        package: pkg,
        path,
        start: declaration,
      })
      .match(Node, { kind: "qti-mapping", package: pkg, parent: declaration, path })
      .find({ package: pkg, path });
  }),
);

/**
 * The published templates whose rules apply `qti-map-response` to `RESPONSE`: `map_response` and
 * `CC2_map_response`. The expression "looks up the value of a response variable and then
 * transforms it using the associated mapping, which must have been declared" (information model
 * §6.9.47, and §7.22, MapResponse), so such an item's `RESPONSE` holds a `qti-mapping`.
 * `map_response_point`'s `qti-map-response-point` "transforms it using the associated
 * areaMapping" (§6.9.46) and states no such requirement, so it is held to none here, and no
 * template is held to a correct response: `qti-correct` is NULL "if no correct value was declared"
 * (§6.9.27).
 */
const mappingTemplates: readonly PublishedTemplate[] = ["map_response", "CC2_map_response"];

/**
 * The declarations each published template's rules read or set, as its published file writes them
 * (the `rptemplates/` documents; spec readings 51 and 198), each with the declaration kinds that
 * may hold it: every template reads `RESPONSE` as a response variable (`qti-variable`,
 * `qti-correct`, `qti-map-response` or `qti-map-response-point`, information model §6.9.40,
 * §6.9.27, §6.9.47, §6.9.46) and sets `SCORE` as an outcome (`qti-set-outcome-value`, §6.39.4: it
 * "sets the value of an outcome variable"); `CC2_map_response` sets `FEEDBACK` and
 * `CC2_match_basic` `FEEDBACKBASIC`, and both read `MAXSCORE` through a `qti-variable`, which names
 * "an itemVariable that has been declared in a corresponding variableDeclaration or is one of the
 * built-in variables" (§6.9.40), of which `MAXSCORE` is none.
 */
const templateNeeds: readonly {
  readonly identifier: string;
  readonly kinds: readonly (typeof DeclarationKind.handles)[number][];
  readonly templates: readonly PublishedTemplate[];
}[] = [
  { identifier: "RESPONSE", kinds: ["qti-response-declaration"], templates: publishedTemplates },
  { identifier: "SCORE", kinds: ["qti-outcome-declaration"], templates: publishedTemplates },
  {
    identifier: "MAXSCORE",
    kinds: ["qti-outcome-declaration", "qti-response-declaration", "qti-template-declaration"],
    templates: ["CC2_match_basic", "CC2_map_response"],
  },
  { identifier: "FEEDBACK", kinds: ["qti-outcome-declaration"], templates: ["CC2_map_response"] },
  {
    identifier: "FEEDBACKBASIC",
    kinds: ["qti-outcome-declaration"],
    templates: ["CC2_match_basic"],
  },
];

/**
 * The rules over the expression overlays' queries, grouped by the law each states, each `check`
 * named by its oracle law: `Condition_type` (P21) over {@link PlacedReferenceType}; `E1_derived`,
 * each reference's resolution and each test variables' unwritten base type proved from what they
 * are derived from; and `Lookup_type` (P22) and `Set_type` (P20) over {@link HeldType}.
 */
const expressionQueryLawsByName = {
  "Condition type": [
    // The placed twin, per placement (spec reading 117): a variable, correct or default reference
    // that is a whole condition is typed as its item's declaration, never silent, since the row
    // exists only where the declaration has a base type and a cardinality. A composite condition
    // over a fragment's references stays reading 117's stated limit.
    check("Condition_type", PlacedReferenceType, (r) =>
      r.or(
        r.not(r.in(r.kind, declaredKinds)),
        r.not(r.in(r.parentKind, conditionKindHandles)),
        r.and(r.eq(r.baseType, "boolean"), r.eq(r.cardinality, "single")),
      ),
    ),
  ],
  "E1 derived": [
    // A reference, or a placed one, to a name its document or its assembly's item declares
    // resolves to that declaration.
    check("E1_derived", DeclaredReference, (d) => d.eq(d.resolution, "declared")),
    check("E1_derived", DeclaredPlacement, (d) => d.eq(d.resolution, "declared")),
    // An attribute-typed expression is of the base type its typing attribute gives it; a test
    // variables that writes no `base-type` is `unknown`, or float where it is weighted.
    contained(
      on(ExpressionAttribute, "package", "path", "start", "baseType"),
      on(Expression, "package", "path", "start", "baseType"),
    ),
    check("E1_derived", UntypedUnweighted, (u) => u.eq(u.baseType, "unknown")),
    check("E1_derived", UntypedWeighted, (u) => u.eq(u.baseType, "float")),
  ],
  "Lookup type": [
    check("Lookup_type", HeldType, (h) =>
      h.or(
        h.ne(h.kind, lookupKindHandle),
        h.and(
          h.in(h.heldCardinality, ["single", "unknown"]),
          h.in(h.heldBase, ["duration", "float", "integer", ...silentBases]),
        ),
      ),
    ),
    // A match table maps an integer: a declared lookup of a value of another base claims an
    // interpolation table, its declaration's one lookup table where it claims one.
    contained(
      on(
        select(HeldType, (h) =>
          h.and(
            h.eq(h.kind, lookupKindHandle),
            h.eq(h.resolution, "declared"),
            h.not(h.in(h.heldBase, ["integer", ...silentBases])),
          ),
        ),
        "package",
        "path",
        "start",
      ),
      on(
        select(VariableRefTable, (t) =>
          t.and(t.eq(t.table, "qti-interpolation-table"), t.eq(t.attribute, "identifier")),
        ),
        "package",
        "path",
        "start",
      ),
    ),
  ],
  "Outcome only": [
    contained(
      on(WeightedVariable, "package", "path", "start"),
      on(
        select(Expression, (e) => e.eq(e.language, "outcome")),
        "package",
        "path",
        "start",
      ),
    ),
  ],
  "Set type": [
    check("Set_type", HeldType, (h) =>
      h.or(
        h.not(h.in(h.kind, setKindHandles)),
        h.and(
          h.or(
            h.eq(h.heldBase, h.baseType),
            h.in(h.heldBase, silentBases),
            h.in(h.baseType, silentBases),
          ),
          h.or(
            h.eq(h.heldCardinality, h.cardinality),
            h.eq(h.heldCardinality, "unknown"),
            h.eq(h.cardinality, "unknown"),
          ),
        ),
      ),
    ),
  ],
  "Template needs": [
    ...templateNeeds.map(({ identifier, kinds, templates }) =>
      contained(
        on(
          select(TemplateProcessing, (t) => t.in(t.value, urisOf(templates))),
          "package",
          "path",
        ),
        on(
          select(NamedDeclaration, (d) =>
            d.and(d.eq(d.identifier, identifier), d.in(d.declarationKind, kinds)),
          ),
          "package",
          "path",
        ),
      ),
    ),
    contained(
      on(
        select(TemplateProcessing, (t) => t.in(t.value, urisOf(mappingTemplates))),
        "package",
        "path",
      ),
      on(MappedResponseDeclaration, "package", "path"),
    ),
  ],
} as const;

/**
 * The documents that head an assembly, by the document's package and path (spec reading 117): each
 * assembled document (`Document.assembled`, it has its `TestDocument`) that no include splices in
 * place, no `SiteTarget` that splices naming it as its `target` (`Inclusion.splices`: an include
 * under one of `splicingParents` that may stand for its target's root). An included fragment is
 * judged where it is included and not alone, and every other assembled document, a test, a section,
 * an item, a stimulus, a response processing template or a fragment no include splices, is judged
 * as its own merged document.
 */
const HeadDocument = derived(
  "HeadDocument",
  query(QtiBase).rule((r) => {
    const { package: pkg, path } = v(Document, "document");

    return r
      .match(Document, { assembled: true, package: pkg, path })
      .where(r.not(SiteTarget, { package: pkg, splices: true, target: path }))
      .find({ package: pkg, path });
  }),
);

/**
 * The documents some instance of an assembly places, by the document's package and path: the
 * projection of `Instance` on its `package` and `document`. A chain of includes that returns to a
 * document already on it, and that no head reaches, places none of its documents in any assembly,
 * so its documents are none of these (reading 85).
 */
const InstanceDocument = derived(
  "InstanceDocument",
  query(QtiBase).rule((r) => {
    const { document, package: pkg } = v(Instance, "instance");

    return r.match(Instance, { document, package: pkg }).find({ document, package: pkg });
  }),
);

/**
 * The members of the banks (the placement mandate, rulings 2 and 7; spec reading 228), by QTI's own
 * identity: each item ref a bank's root section holds that names something, by its package, the
 * bank's identifier (`bank`, its root's) and its own (`identifier`), with the path of the item
 * document it names (`item`, its `ItemRefDocument`'s target). "Bank shape" makes every item ref of
 * a bank one its root holds, and "Item ref identifier" holds its identifier to its item's, so a
 * member is `(package, bank, item identifier)`; "Bank key" and "Structure identifier" make that
 * identity a key. Every column is its rows' own, never a copy: a bank's members are read here,
 * from the names, their nodes' kind and place in the tree, and the items the import already
 * writes.
 */
export const BankMember = derived(
  "BankMember",
  query(QtiBase).rule((r) => {
    const { identifier: bank, package: pkg, path, start: root } = v(Named, "bank");
    const { identifier, start } = v(Named, "member");
    const { target: item } = v(ItemRefDocument, "item");

    return r
      .match(Named, { identifier: bank, package: pkg, path, start: root })
      .match(Node, { kind: sectionKind, package: pkg, parentKind: "document", path, start: root })
      .match(Named, { identifier, package: pkg, path, start })
      .match(Node, { kind: itemRefKind, package: pkg, parent: root, path, start })
      .match(ItemRefDocument, { package: pkg, path, start, target: item })
      .find({ bank, identifier, item, package: pkg });
  }),
);

/**
 * The tests overlays' rules over a query, each named by its oracle law:
 *
 * - **"E1 derived":** each assembly's root is a document that heads one ({@link HeadDocument});
 * - **"Inclusion cycle"** (reading 85): each document that heads an assembly is the root of one, and
 *   every assembled document is one some instance places ({@link InstanceDocument}), so a chain no
 *   head reaches is refused;
 * - **"Item ref identifier"** (QTI §4.1.1): each bank member's identifier is its item's
 *   ({@link BankMember} into `ObjectIdentifier`).
 */
const testQueryLawsByName = {
  "E1 derived": [
    contained(on(instanceRoots, "package", "document"), on(HeadDocument, "package", "path")),
  ],
  "Inclusion cycle": [
    contained(on(HeadDocument, "package", "path"), on(instanceRoots, "package", "document")),
    contained(on(TestDocument, "package", "path"), on(InstanceDocument, "package", "document")),
  ],
  "Item ref identifier": [
    contained(
      on(BankMember, "package", "item", "identifier"),
      on(ObjectIdentifier, "package", "path", "value"),
    ),
  ],
} as const;

/**
 * Each choice and each hottext of a document, by its place, `(package, path, start)`, with the
 * identifier it bears: the nine choice classes' `Choice` rows and `Hottext`'s. Every choice class
 * says of its identifier "This identifier must not be used by any other choice or item variable"
 * (§5.132.1; §5.7.1, §5.55.1, §5.56.1, §5.58.1, §5.65.1, §5.67.1, §5.73.1 and §5.131.1 alike), and
 * the nine share one space of identifiers (spec reading 104 as amended, the stricter normative
 * reading), so "Choice identifier key" keys these rows by (package, path, identifier): at most one
 * choice or hottext of a document bears a name, of whichever class.
 */
const choicesAndHottexts = query(QtiBase)
  .rule((r) => {
    const { identifier, package: pkg, path, start } = v(Choice, "choice");

    return r
      .match(Choice, { identifier, package: pkg, path, start })
      .find({ identifier, package: pkg, path, start });
  })
  .rule((r) => {
    const { identifier, package: pkg, path, start } = v(Hottext, "hottext");

    return r
      .match(Hottext, { identifier, package: pkg, path, start })
      .find({ identifier, package: pkg, path, start });
  });

/**
 * {@link choicesAndHottexts} as a relation of the schema, which "Choice identifier key" keys.
 */
const ChoiceOrHottext = derived("ChoiceOrHottext", choicesAndHottexts);

/**
 * Each choice and each hottext an assembly places, by its assembly, its instance there and its
 * element's place, with the identifier it bears (spec reading 117): an included fragment's choices
 * are its item's, so "Choice identifier key" keys these rows by (package, assembly, identifier),
 * and a fragment placed twice in one item names each of its choices twice.
 */
const placedChoicesAndHottexts = query(QtiBase)
  .rule((r) => {
    const { assembly, identifier, instance, package: pkg, path, start } = v(PlacedChoice, "choice");

    return r
      .match(PlacedChoice, { assembly, identifier, instance, package: pkg, path, start })
      .find({ assembly, identifier, instance, package: pkg, path, start });
  })
  .rule((r) => {
    const {
      assembly,
      identifier,
      instance,
      package: pkg,
      path,
      start,
    } = v(PlacedHottext, "hottext");

    return r
      .match(PlacedHottext, { assembly, identifier, instance, package: pkg, path, start })
      .find({ assembly, identifier, instance, package: pkg, path, start });
  });

/**
 * {@link placedChoicesAndHottexts} as a relation of the schema, which "Choice identifier key"
 * keys.
 */
const PlacedChoiceOrHottext = derived("PlacedChoiceOrHottext", placedChoicesAndHottexts);

/**
 * The names a document's choices and hottexts bear, and those its assembly places, that no item
 * variable of the document bears, by (package, path, identifier), an assembly's under its head
 * document's path: no `NamedDeclaration` of the document (`#pantry/qti/names.ts`) names it,
 * whatever the declaration's cardinality spells (spec reading 159), and in an item no built-in
 * variable does ({@link itemBuiltInNames}), since the built-ins "are declared
 * implicitly" (§2.2.2). An assembly's placed names are its root document's, whose own
 * declarations they are held to (spec reading 117): a fragment declares nothing. "Choice not
 * variable" holds every choice's and hottext's name to one of these.
 */
const UnclaimedName = derived(
  "UnclaimedName",
  query(QtiViews)
    .rule((r) => {
      const { identifier, package: pkg, path } = v(choicesAndHottexts, "chosen");
      const { rootKind } = v(Document, "root");

      return r
        .match(choicesAndHottexts, { identifier, package: pkg, path })
        .match(Document, { package: pkg, path, rootKind })
        .where(r.not(NamedDeclaration, { identifier, package: pkg, path }))
        .where(r.or(r.ne(rootKind, itemKind), Compute.not(r.in(identifier, itemBuiltInNames))))
        .find({ identifier, package: pkg, path });
    })
    .rule((r) => {
      const { assembly, identifier, package: pkg } = v(placedChoicesAndHottexts, "placed");
      const { rootKind } = v(Document, "root");

      return r
        .match(placedChoicesAndHottexts, { assembly, identifier, package: pkg })
        .match(Document, { package: pkg, path: assembly, rootKind })
        .where(r.not(NamedDeclaration, { identifier, package: pkg, path: assembly }))
        .where(r.or(r.ne(rootKind, itemKind), Compute.not(r.in(identifier, itemBuiltInNames))))
        .find({ identifier, package: pkg, path: assembly });
    }),
);

/**
 * The least count of each extended-text interaction bound to a response that is no container, by
 * the interaction's place: its `min-strings` value ({@link LeastCount}) beside the cardinality of
 * the response its `response-identifier` binds, `single` or `record`, in the item's own document
 * or, under a placement, in its assembly's item, the response declaration of its name. Spec
 * reading 193 holds it to 0 or 1: such a response holds one string, and the information model
 * names 1 as the one value above 0 its `min-strings` may take (§5.48.7, §5.48.6). A `min-strings`
 * that is no integer has no least count, so its value domain refuses it alone.
 */
const NonContainerStrings = derived(
  "NonContainerStrings",
  query(QtiViews)
    .rule((r) => {
      const { identifier, package: pkg, path, start } = v(BoundVariable, "binding");
      const { cardinality } = v(DeclarationName, "name");
      const { leastValue } = v(LeastCount, "least");

      return r
        .match(BoundVariable, {
          attribute: "response-identifier",
          identifier,
          package: pkg,
          path,
          start,
        })
        .match(DeclarationName, {
          cardinality,
          declarationKind: "qti-response-declaration",
          identifier,
          package: pkg,
          path,
        })
        .match(Node, { kind: "qti-extended-text-interaction", package: pkg, path, start })
        .match(LeastCount, { leastValue, package: pkg, path, start })
        .where(r.in(cardinality, ["single", "record"]))
        .find({ leastValue, package: pkg, path, start });
    })
    .rule((r) => {
      const { assembly, identifier, package: pkg, path, start } = v(PlacedBinding, "binding");
      const { cardinality } = v(DeclarationName, "name");
      const { leastValue } = v(LeastCount, "least");

      return r
        .match(PlacedBinding, {
          assembly,
          attribute: "response-identifier",
          identifier,
          package: pkg,
          path,
          start,
        })
        .match(DeclarationName, {
          cardinality,
          declarationKind: "qti-response-declaration",
          identifier,
          package: pkg,
          path: assembly,
        })
        .match(Node, { kind: "qti-extended-text-interaction", package: pkg, path, start })
        .match(LeastCount, { leastValue, package: pkg, path, start })
        .where(r.in(cardinality, ["single", "record"]))
        .find({ leastValue, package: pkg, path, start });
    }),
);

/**
 * The attributes of a printed variable whose variable reference names an integer: its `base` and
 * its `index`, each an `IntegerOrVariableRef` (information model §7.30.8, §7.30.9).
 */
const printedIntegers = ["base", "index"] as const;

/**
 * Each printed variable's reference that names an outcome or a template declaration, beside that
 * declaration's cardinality, where it has one (spec reading 159), by the reference's place and
 * attribute (`referenceCardinalityOf` of `#pantry/qti/overlay-queries/reference.ts`): an item's own
 * reference against its own declarations, and a fragment's under each placement against its
 * assembly's (spec reading 117). "Printed variable type" holds a `base`'s or an `index`'s
 * ({@link printedIntegers}) to single.
 */
const PrintedIntegerCardinality = referenceCardinalityOf(
  "PrintedIntegerCardinality",
  PrintedVariableRef,
  FragmentPrintedRef,
);

/**
 * Each printed variable's reference that names an outcome or a template declaration, beside that
 * declaration's base type, where it has one (spec reading 158), keyed as
 * {@link PrintedIntegerCardinality} is (`referenceBaseTypeOf` of
 * `#pantry/qti/overlay-queries/reference.ts`). "Printed variable type" holds a `base`'s or an
 * `index`'s to integer.
 */
const PrintedIntegerBaseType = referenceBaseTypeOf(
  "PrintedIntegerBaseType",
  PrintedVariableRef,
  FragmentPrintedRef,
);

/**
 * The interaction overlays' rules over a query, each named by its oracle law (spec reading 104):
 *
 * - **"Choice bounds"** (spec reading 193): an extended-text interaction bound to a response that is
 *   no container has a `min-strings` of at most 1 ({@link NonContainerStrings});
 * - **"Printed variable type"** (information model §9.3.3): a printed variable's `base` or `index`
 *   that names a variable names a single integer one ({@link PrintedIntegerCardinality},
 *   {@link PrintedIntegerBaseType});
 * - **"Choice identifier key"** (reading 104 as amended): across the nine choice classes, at most one
 *   choice or hottext of a document bears a name, and at most one its assembly places; the
 *   per-class keys are `#pantry/qti/interactions.ts`'s;
 * - **"Choice not variable"**: every name a choice or a hottext bears, its document's own or one its
 *   assembly places, is one no item variable of the document bears ({@link UnclaimedName}).
 */
const interactionQueryLawsByName = {
  "Choice bounds": [check("Choice_bounds", NonContainerStrings, (s) => s.le(s.leastValue, 1n))],
  "Choice identifier key": [
    key(on(ChoiceOrHottext, "package", "path", "identifier")),
    key(on(PlacedChoiceOrHottext, "package", "assembly", "identifier")),
  ],
  "Choice not variable": [
    contained(
      on(ChoiceOrHottext, "package", "path", "identifier"),
      on(UnclaimedName, "package", "path", "identifier"),
    ),
    contained(
      on(PlacedChoiceOrHottext, "package", "assembly", "identifier"),
      on(UnclaimedName, "package", "path", "identifier"),
    ),
  ],
  "Printed variable type": [
    check("Printed_variable_type", PrintedIntegerCardinality, (p) =>
      p.or(p.not(p.in(p.attribute, printedIntegers)), p.eq(p.cardinality, "single")),
    ),
    check("Printed_variable_type", PrintedIntegerBaseType, (p) =>
      p.or(p.not(p.in(p.attribute, printedIntegers)), p.eq(p.baseType, "integer")),
    ),
  ],
} as const;

/**
 * Each property a `data-ssml` member requires, by the member's element's place, the member's place
 * in the value and the property's name (Data-SSML 1.0 §3.4: `phoneme`'s `ph`, `say-as`'s
 * `interpret-as`, `sub`'s `alias`): one rule per required property, each a member of that name,
 * beside the property's name. "Data SSML" holds each to a property its member writes.
 */
const RequiredSsmlProperty = derived(
  "RequiredSsmlProperty",
  query(QtiBase)
    .rule((r) => {
      const { at, package: pkg, path, start } = v(DataSsmlMember, "member");

      return r
        .match(DataSsmlMember, { at, member: "phoneme", package: pkg, path, start })
        .find({ member: at, name: "ph", package: pkg, path, start });
    })
    .rule((r) => {
      const { at, package: pkg, path, start } = v(DataSsmlMember, "member");

      return r
        .match(DataSsmlMember, { at, member: "say-as", package: pkg, path, start })
        .find({ member: at, name: "interpret-as", package: pkg, path, start });
    })
    .rule((r) => {
      const { at, package: pkg, path, start } = v(DataSsmlMember, "member");

      return r
        .match(DataSsmlMember, { at, member: "sub", package: pkg, path, start })
        .find({ member: at, name: "alias", package: pkg, path, start });
    }),
);

/**
 * The `data-ssml` rule over a query: every required property is written (Data-SSML 1.0 §3.4).
 */
const dataSsmlQueryLawsByName = {
  "Data SSML": [
    contained(
      on(RequiredSsmlProperty, "package", "path", "start", "member", "name"),
      on(DataSsmlProperty, "package", "path", "start", "member", "name"),
    ),
  ],
} as const;

/**
 * Each child of an element that stands in a MathML table cell, by the child's place: a node whose
 * parent has a `MathAlignScope` row, with its kind. Its elements are the elements of a cell below
 * one that has a row, each of which has a row of its own, so with the cell roots' rows every
 * element inside a cell has one (MathML 3 §3.5.5.2: the alignment law reads every element between a
 * group and its cell).
 */
const CellChild = derived(
  "CellChild",
  query(QtiBase).rule((r) => {
    const { kind, package: pkg, parent, path, start } = v(Node, "child");

    return r
      .match(Node, { kind, package: pkg, parent, path, start })
      .match(MathAlignScope, { package: pkg, path, start: parent })
      .find({ kind, package: pkg, path, start });
  }),
);

/**
 * The direction each element with a `MathAlignScope` row writes, by the element's place, beside the
 * scope row's `own`: its `dir`'s `value` is the direction's lexical form (`AlignDirectionLexical`,
 * C17), read from the attribute where it stands, which no overlay copies (C18). Each `dir` domain's
 * valid forms are exactly a direction's lexical form or HTML's `auto` once normalized in its class:
 * the HTML `dir`s of the 3.0.1 ASI and `bdo`'s (reading 123) are `xs:string` enumerations, whose
 * forms AL1 holds as written, and MathML 3's are `xs:token` (mathml3-presentation.xsd), so `value`
 * is collapsed. An element that writes no `dir`, or one that spells no direction (`auto`), has no
 * row. The scope row fixes the element, so the attribute is read at its key whatever the element's
 * kind: every element of a cell has a scope row, and every kind that admits a `dir` may stand in a
 * cell.
 */
const ScopedDir = derived(
  "ScopedDir",
  query(QtiBase).rule((r) => {
    const { package: pkg, path, start, value } = v(Attribute, "dir");
    const { own } = v(MathAlignScope, "scope");
    const { code: direction } = v(AlignDirectionLexical, "direction");

    return r
      .match(Attribute, { name: "dir", package: pkg, path, start, value })
      .match(MathAlignScope, { own, package: pkg, path, start })
      .match(AlignDirectionLexical, { code: direction, lexical: value })
      .find({ direction, own, package: pkg, path, start });
  }),
);

/**
 * The scope rows whose direction is not the one they inherited, each of which writes a `dir` that
 * spells it.
 */
const turnedScopes = select(MathAlignScope, (s) => s.ne(s.own, s.inherited));

/**
 * The MathML overlays' rules over queries, each a restatement of the tree, "E1 derived": every
 * element inside a table cell has its scope row ({@link CellChild}); and a scoped element's `own`
 * is the direction its `dir` spells ({@link ScopedDir}), and else the one it inherited: a row whose
 * `own` is not its `inherited` writes a `dir` that spells its `own` ({@link turnedScopes}).
 */
const mathmlQueryLawsByName = {
  "E1 derived": [
    contained(
      on(
        select(CellChild, (c) => c.not(c.in(c.kind, nonElementKinds))),
        "package",
        "path",
        "start",
      ),
      on(MathAlignScope, "package", "path", "start"),
    ),
    check("E1_derived", ScopedDir, (d) => d.eq(d.own, d.direction)),
    contained(
      on(turnedScopes, "package", "path", "start", "own"),
      on(ScopedDir, "package", "path", "start", "direction"),
    ),
  ],
} as const;

/**
 * Every query `Qti` names over its stored level, each carrying its own name.
 */
export const queryRelations = [
  BankMember,
  CellChild,
  ChoiceOrHottext,
  DeclaredPlacement,
  DeclaredReference,
  DescribedAssembledLang,
  DescribedLang,
  ExpressionAttribute,
  ForbiddenResourceType,
  HeadDocument,
  HeldType,
  InstanceDocument,
  ItemRefTarget,
  ListedIdentifier,
  ListedLang,
  ListedTitle,
  LookupAttributeText,
  MapKeyAttributeText,
  MappedResponseDeclaration,
  MatchedIdentifier,
  MatchedTitle,
  NonContainerStrings,
  ObjectIdentifier,
  OtherVocabularyType,
  PlacedChoiceOrHottext,
  PlacedReferenceType,
  PrintedIntegerBaseType,
  PrintedIntegerCardinality,
  ReferenceLexical,
  RequiredSsmlProperty,
  ScopedDir,
  TemplateProcessing,
  TextReferenceStringValue,
  TypedHref,
  UnclaimedName,
  UnreadTypeHref,
  UntargetedItemRef,
  UntypedUnweighted,
  UntypedWeighted,
  UsageBaseType,
  WeightedVariable,
  ...overlayQueryRelations,
] as const;

/**
 * Each domain's rules over the queries, grouped by the law each states, one record per domain.
 */
export const queryLawsByName = [
  packageQueryLawsByName,
  identityQueryLawsByName,
  metadataQueryLawsByName,
  expressionQueryLawsByName,
  mappingQueryLawsByName,
  dataSsmlQueryLawsByName,
  testQueryLawsByName,
  interactionQueryLawsByName,
  mathmlQueryLawsByName,
  ...overlayQueryLawsByName,
] as const;

/**
 * A statement of one domain's record of rules over a query, by law name.
 */
type StatementOf<Laws extends Readonly<Record<string, readonly unknown[]>>> =
  Laws[keyof Laws][number];

/**
 * One rule over a query, as its domain states it: the union of each domain's statement types,
 * each read from that domain's one record ({@link StatementOf}), never from the list of records.
 * `Object.values` over a union of records falls back to lib's `values(o: {}): any[]`, and a
 * statement typed `any` types every statement of `Qti` `any` with it, so that grizzle can tell no
 * nested member's count apart; grizzle's `schema.extend` refuses such a list (`1387c79d`).
 */
type QueryStatement =
  | StatementOf<typeof packageQueryLawsByName>
  | StatementOf<typeof identityQueryLawsByName>
  | StatementOf<typeof metadataQueryLawsByName>
  | StatementOf<typeof expressionQueryLawsByName>
  | StatementOf<typeof mappingQueryLawsByName>
  | StatementOf<typeof dataSsmlQueryLawsByName>
  | StatementOf<typeof testQueryLawsByName>
  | StatementOf<typeof interactionQueryLawsByName>
  | StatementOf<typeof mathmlQueryLawsByName>
  | (typeof overlayQueryLaws)[number];

/**
 * Every rule over a query: each domain's record flattened on its own, as {@link QueryStatement}
 * reads it, in {@link queryLawsByName}'s order.
 */
export const queryLaws: readonly QueryStatement[] = [
  ...Object.values(packageQueryLawsByName).flat(),
  ...Object.values(identityQueryLawsByName).flat(),
  ...Object.values(metadataQueryLawsByName).flat(),
  ...Object.values(expressionQueryLawsByName).flat(),
  ...Object.values(mappingQueryLawsByName).flat(),
  ...Object.values(dataSsmlQueryLawsByName).flat(),
  ...Object.values(testQueryLawsByName).flat(),
  ...Object.values(interactionQueryLawsByName).flat(),
  ...Object.values(mathmlQueryLawsByName).flat(),
  ...overlayQueryLaws,
];
