/**
 * The catalog laws of spec reading R9-a: what the information model asks of a catalog's cards and
 * of a card's entries beyond the XSD, which states neither.
 *
 * - **Card support** (rule `card-support`; info §5.26.1: "Use only one card for any particular named
 *   support in a catalog"): no two cards of one catalog carry one `support`. A `support` is
 *   compared by its value, its lexical form normalized in the class of the union member that holds
 *   it (XML Schema 1.0 Part 2 §4.3.6): an `ext:` name, a `SupportExtStringDType` of class `replace`
 *   whose pattern admits no whitespace, or a listed support, an `xs:string` of class `preserve`.
 *   Either way the value is the form as written, so `" spoken "` is no support the list names,
 *   which AL1 refuses alone, and never the support `spoken`. The law is a key over the query
 *   `CatalogSupport` (`#pantry/qti/overlay-queries/catalog.ts`), each card's `support` attribute's
 *   `value` beside its catalog, its node's parent, which only `Node` holds.
 * - **Card default entry** (rule `card-default`; info §5.27.2: "Only one of the CardEntry instances
 *   can have a default designation"): a card holds at most one entry whose `default` designates it.
 *   An entry's `default` is an `xs:boolean`, whose value space is `true`, `false`, `1` and `0`
 *   under whiteSpace `collapse`, so an entry designates where its value is `true` or `1`. The law
 *   is a key over the query `CardDefault`, each designating `default` beside its card, its node's
 *   parent. An entry that writes no `default`, or one whose value is `false` or `0`, has no row;
 *   the XSD's default of `false` designates nothing.
 * - **Catalog reference** (rule `idref-target`; info §5.28.1, §5.15.9; spec reading 117): a
 *   `data-catalog-idref` names a `qti-catalog` of its document, not any ID of it. The attribute is
 *   typed `xs:IDREF`, so "Idref target" (`#pantry/qti/identity.ts`) alone refuses a token that
 *   names no ID, and accepts one that names an HTML `id` or a declaration. A reference is such an
 *   attribute that holds a token, as "Idref target" reads only an attribute the schema checks as
 *   IDREF and only its tokens (an unchecked one, or an empty or blank one, names nothing): the
 *   references `catalogReferences` reads (`#pantry/qti/overlay-queries/catalog.ts`), each such
 *   attribute's `Idref` pieces' tokens, one for a lawful `xs:IDREF`, its value collapsed.
 *   {@link CatalogId} is one row per `qti-catalog`'s `id`, from the attribute as a `TableHeader`
 *   is, its `id` the ID's value as `IdValue` (`#pantry/qti/names.ts`) holds it. A document in no
 *   assembly resolves each token among its own catalogs: the containment of every token's
 *   `(document, token)` in the catalogs' `(document, id)` (`UnassembledReference`). A document in
 *   an assembly resolves it once per instance, as "Idref target" does its IDREFs (`PlacedIdref`,
 *   `#pantry/qti/identity.ts`): a fragment's reference names a catalog of the item it is included
 *   in, and a fragment two items include is judged in each. Each token of an instance's document,
 *   the join of the instance and its document's references that no row stores (`PlacedReference`),
 *   is held by {@link AssembledCatalog}, a catalog's binding in its assembly's ID table, under the
 *   instance's assembly. Neither stores the tokens or counts them: the joins are complete by their
 *   definition.
 *
 * No row here copies a card's `support`, an entry's `default` or a reference's token: each is its
 * attribute's `value` or its `Idref` piece, selected by the queries of
 * `#pantry/qti/overlay-queries/catalog.ts` (C18). Every copied text that takes part in a cross-row
 * equality is of its type's bound in a key (`#pantry/qti/limits.ts`), so a key, a containment's
 * target and a lookup hold it as itself. Every check is named by its oracle law
 * (`#pantry/test/oracle.ts` `LawName`) with spaces written as underscores; the overlays' agreement
 * with what the tree holds is "E1 derived" (rule `derived`).
 *
 * @see {@link https://www.imsglobal.org/spec/qti/v3p0/info#Data_Card | QTI 3.0 information model, §5.26 Card}
 * @see {@link https://www.imsglobal.org/spec/qti/v3p0/info#Data_CardEntry | QTI 3.0 information model, §5.27 CardEntry}
 */
import { check, contained, key, law, on, relation } from "@bjornpagen/grizzle";
import { attributesOf } from "#pantry/qti/attributes.ts";
import { EntryPath, PackageName, XmlId } from "#pantry/qti/limits.ts";
import { declared, entryOf, natural } from "#pantry/qti/law-entries.ts";

/**
 * One `qti-catalog` that carries an ID, keyed by its element: its `id`, the ID's value as `IdValue`
 * (`#pantry/qti/names.ts`) holds it (an `xs:ID` collapsed), with `owner` the element's own start,
 * an attribute ID's binding, so its copy shares the superkey `IdValue` reads.
 */
export const CatalogId = law(
  entryOf("E1 derived"),
  relation(
    "CatalogId",
    {
      id: XmlId,
      owner: natural,
      package: PackageName,
      path: EntryPath,
      start: natural,
    },
    ["package", "path", "start"],
  ),
);

/**
 * One binding of an assembly's ID table whose owner is a `qti-catalog`, keyed by the assembly and
 * the id: the query `AssembledId` of the assembly, its owner, `(path, owner)`, a {@link CatalogId}'s
 * element.
 */
export const AssembledCatalog = law(
  entryOf("E1 derived"),
  relation(
    "AssembledCatalog",
    {
      assembly: EntryPath,
      id: XmlId,
      owner: natural,
      package: PackageName,
      path: EntryPath,
    },
    ["package", "assembly", "id"],
  ),
);

/**
 * Every relation this module declares, in one list, as `base.ts` composes them.
 */
export const catalogRelations = [AssembledCatalog, CatalogId] as const;

/**
 * Every catalog's `id`, one of its document's IDs, the source of {@link CatalogId}: AL1 holds its
 * form to its domain, an `xs:ID`, an NCName once collapsed (spec readings 152 and 156).
 */
const catalogIdAttributes = attributesOf("id", ["qti-catalog"]);

/**
 * Every statement over the catalog overlays, each `check` named by its oracle law. "Card support",
 * "Card default entry" and "Catalog reference" read attributes' `value`s or tokens, the first two
 * a node's parent and the last a document's assembly and instances, so they are rules over a query
 * (`#pantry/qti/overlay-queries/catalog.ts`):
 *
 * - **DocumentId key:** {@link CatalogId}'s `(package, path, id)`, which an ID held twice in a
 *   document already breaks and which the containment of "Catalog reference" needs of its target;
 *   the attribute selection the copy reads is keyed by `Attribute`'s key, its name fixed;
 * - **E1 derived:** a catalog's `id` owned by the catalog itself, its value its ID's, a rule over a
 *   query over `IdValue` (`#pantry/qti/overlay-queries/catalog.ts`); and each
 *   {@link AssembledCatalog} a binding of the query `AssembledId` owned by a catalog.
 */
export const catalogLawsByName = {
  "DocumentId key": declared("DocumentId key", [key(on(CatalogId, "package", "path", "id"))]),
  "E1 derived": declared("E1 derived", [
    contained(
      on(catalogIdAttributes, "package", "path", "start"),
      on(CatalogId, "package", "path", "start"),
    ),
    contained(
      on(CatalogId, "package", "path", "start"),
      on(catalogIdAttributes, "package", "path", "start"),
    ),
    check("E1_derived", CatalogId, (c) => c.eq(c.owner, c.start)),
    contained(
      on(AssembledCatalog, "package", "path", "owner"),
      on(CatalogId, "package", "path", "start"),
    ),
  ]),
} as const;

/**
 * {@link catalogLawsByName}'s statements in one list, the module's laws as the schema composes
 * them.
 */
export const catalogLaws = Object.values(catalogLawsByName).flat();
