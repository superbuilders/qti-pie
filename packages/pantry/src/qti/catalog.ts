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
 *   which AL1 refuses alone, and never the support `spoken`. The law is a key over the cards'
 *   `support` attributes, each one's `value` beside its catalog, its node's parent, which the
 *   attribute holds (`Attribute.parent`).
 * - **Card default entry** (rule `card-default`; info §5.27.2: "Only one of the CardEntry instances
 *   can have a default designation"): a card holds at most one entry whose `default` designates it.
 *   An entry's `default` is an `xs:boolean`, whose value space is `true`, `false`, `1` and `0`
 *   under whiteSpace `collapse`, so an entry designates where its value is `true` or `1`. The law
 *   is a key over the designating `default` attributes, each beside its card, its node's parent,
 *   which the attribute holds. An entry that writes no `default`, or one whose value is `false` or
 *   `0`, is none of them; the XSD's default of `false` designates nothing.
 * - **Catalog reference** (rule `idref-target`; info §5.28.1, §5.15.9; spec reading
 *   `fragment-placement`): a `data-catalog-idref` names a `qti-catalog` of its document, not any ID
 *   of it. The attribute is typed `xs:IDREF`, so "Idref target" (`#pantry/qti/identity.ts`) alone
 *   refuses a token that names no ID, and accepts one that names an HTML `id` or a declaration. A
 *   reference is such an attribute that holds a token, as "Idref target" reads only an attribute
 *   the schema checks as IDREF and only its tokens (an unchecked one, or an empty or blank one,
 *   names nothing): the references `catalogReferences` reads
 *   (`#pantry/qti/overlay-queries/catalog.ts`), each such attribute's `Idref` pieces' tokens, one
 *   for a lawful `xs:IDREF`, its value collapsed. A document in no assembly resolves each token
 *   among its own catalogs' `id`s (`CatalogId`, a view of `Attribute`, `#pantry/qti/names.ts`); a
 *   document in an assembly resolves it once per instance, as "Idref target" does its IDREFs
 *   (`PlacedIdref`, `#pantry/qti/identity.ts`), among its assembly's catalogs' bindings
 *   (`AssembledCatalog`, `#pantry/qti/overlay-queries/catalog.ts`): a fragment's reference names a
 *   catalog of the item it is included in, and a fragment two items include is judged in each. No
 *   row stores the tokens or counts them: the joins are complete by their definition.
 *
 * No row copies a card's `support`, an entry's `default`, a catalog's `id` or a reference's token:
 * each is its attribute's `value` or its `Idref` piece (C18), read where it stands.
 *
 * @see {@link https://www.imsglobal.org/spec/qti/v3p0/info#Data_Card | QTI 3.0 information model, §5.26 Card}
 * @see {@link https://www.imsglobal.org/spec/qti/v3p0/info#Data_CardEntry | QTI 3.0 information model, §5.27 CardEntry}
 */
import { key, on, select } from "@bjornpagen/grizzle";
import { booleanTrue } from "#pantry/grammar/domains.ts";
import { Attribute, namedOn } from "#pantry/qti/attributes.ts";
import { declared } from "#pantry/qti/law-entries.ts";

/**
 * Every statement over the catalogs' attributes, each named by its oracle law: "Card support" and
 * "Card default entry", each a key over an attribute selection beside its element's parent, which
 * the attribute holds (`Attribute.parent`). "Catalog reference" and the key over a document's
 * catalog `id`s read views, so they are rules over a query
 * (`#pantry/qti/overlay-queries/catalog.ts`).
 */
export const catalogLawsByName = {
  "Card default entry": declared("Card default entry", [
    key(
      on(
        select(Attribute, (a) =>
          a.and(namedOn(a, "default", ["qti-card-entry"]), a.in(a.value, booleanTrue)),
        ),
        "package",
        "path",
        "parent",
      ),
    ),
  ]),
  "Card support": declared("Card support", [
    key(
      on(
        select(Attribute, (a) => namedOn(a, "support", ["qti-card"])),
        "package",
        "path",
        "parent",
        "valueDigest",
      ),
    ),
  ]),
} as const;

/**
 * {@link catalogLawsByName}'s statements in one list, the module's laws as the schema composes
 * them.
 */
export const catalogLaws = Object.values(catalogLawsByName).flat();
