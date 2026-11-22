/**
 * The catalog laws over attributes' values, tokens and IDs (`#pantry/qti/catalog.ts`): a card's
 * `support` and an entry's `default` are each its attribute's `value`, a `data-catalog-idref`'s
 * tokens its `Idref` pieces (C18), and a catalog's `id` its ID's value, which `IdValue` reads where
 * it stands; a card's catalog and an entry's card are each its node's parent, which only `Node`
 * holds; and a reference resolves in its document, or under each instance of it in its assembly,
 * which only `Document` and `Instance` hold.
 */
import { contained, derived, key, on, query, v } from "@bjornpagen/grizzle";
import { booleanTrue } from "#pantry/grammar/domains.ts";
import { Idref } from "#pantry/qti/attributes.ts";
import { QtiBase } from "#pantry/qti/base.ts";
import { AssembledCatalog, CatalogId } from "#pantry/qti/catalog.ts";
import { Document } from "#pantry/qti/chardata.ts";
import { attributeValues, IdValue } from "#pantry/qti/names.ts";
import { Node } from "#pantry/qti/node.ts";
import { Instance } from "#pantry/qti/tests.ts";

/**
 * Every card's `support`, by the card's place, its `value` the form as written: no form either
 * member of the support's union holds has whitespace for its class to change.
 */
const supports = attributeValues("support", ["qti-card"]);

/**
 * Every entry's `default`, by the entry's place, its `value` the form collapsed (`xs:boolean`).
 */
const defaults = attributeValues("default", ["qti-card-entry"]);

/**
 * Each card's support beside its catalog, by the card's place: its `support`'s value and its node's
 * parent.
 */
const CatalogSupport = derived(
  "CatalogSupport",
  query(QtiBase).rule((r) => {
    const { kind, package: pkg, path, start, value: support } = v(supports, "support");
    const { parent: catalog } = v(Node, "node");

    return r
      .match(supports, { kind, package: pkg, path, start, value: support })
      .match(Node, { package: pkg, parent: catalog, path, start })
      .find({ catalog, package: pkg, path, start, support });
  }),
);

/**
 * Each card entry that designates itself its card's default beside its card, by the entry's place:
 * an entry whose `default`'s value is `true` or `1` ({@link booleanTrue}), and its node's parent.
 */
const CardDefault = derived(
  "CardDefault",
  query(QtiBase).rule((r) => {
    const { kind, package: pkg, path, start, value } = v(defaults, "default");
    const { parent: card } = v(Node, "node");

    return r
      .match(defaults, { kind, package: pkg, path, start, value })
      .match(Node, { package: pkg, parent: card, path, start })
      .where(r.in(value, booleanTrue))
      .find({ card, package: pkg, path, start });
  }),
);

/**
 * Every token of a `data-catalog-idref`, by its element's place: its `Idref` piece's `token`, the
 * tokens "Idref target" reads. Every typed `data-catalog-idref` is an `xs:IDREF`, so a lawful one
 * holds one token, its value collapsed. One the schema does not check as an IDREF (an open one a
 * wildcard admits) has no piece, and neither has an empty or blank one, which names nothing.
 */
const catalogReferences = query(QtiBase).rule((r) => {
  const { package: pkg, path, start, token } = v(Idref, "reference");

  return r
    .match(Idref, { name: "data-catalog-idref", package: pkg, path, start, token })
    .find({ package: pkg, path, start, token });
});

/**
 * Each token of a document in no assembly, by its document: a {@link catalogReferences} token of a
 * document whose `assembled` is false, which resolves among the document's own catalogs. A document
 * is assembled exactly where an `Instance` places it, both ways stated laws
 * (`#pantry/qti/tests.ts`, `#pantry/qti/queries.ts`): every instance's document has its
 * `AssembledDocument` (the family counted by `AssembledDocument.instances`, "Inclusion cycle") and
 * every `AssembledDocument`'s document is assembled ("E1 derived"); every assembled document has
 * its `AssembledDocument` ("Test overlay") and every `AssembledDocument` is a document some
 * instance places (`InstanceDocument`, "Inclusion cycle"). So these tokens and
 * {@link PlacedReference}'s are of disjoint documents, and every token of every document is in one
 * of the two.
 */
const UnassembledReference = derived(
  "UnassembledReference",
  query(QtiBase).rule((r) => {
    const { package: pkg, path, token } = v(catalogReferences, "reference");

    return r
      .match(catalogReferences, { package: pkg, path, token })
      .match(Document, { assembled: false, package: pkg, path })
      .find({ package: pkg, path, token });
  }),
);

/**
 * Each token of an instance's document under the instance's assembly (spec reading 117): every
 * {@link catalogReferences} token of the document each `Instance` places, which resolves among its
 * assembly's catalogs. A document is assembled exactly where an instance places it (the laws
 * {@link UnassembledReference} cites), so every token of an assembled document is here once for each
 * assembly that places it, and the join is complete by its definition, with no row stored or
 * counted.
 */
const PlacedReference = derived(
  "PlacedReference",
  query(QtiBase).rule((r) => {
    const { assembly, document, package: pkg } = v(Instance, "instance");
    const { token } = v(catalogReferences, "reference");

    return r
      .match(Instance, { assembly, document, package: pkg })
      .match(catalogReferences, { package: pkg, path: document, token })
      .find({ assembly, package: pkg, token });
  }),
);

/**
 * The catalog laws over attributes' values (`#pantry/qti/catalog.ts`): a catalog holds one card for
 * each support, and a card at most one designated entry; each reference's token is a catalog's `id`
 * of its document where the document is in no assembly ({@link UnassembledReference}), and a
 * catalog's binding in each assembly that places the document otherwise ({@link PlacedReference},
 * `AssembledCatalog`), as "Idref target" resolves an IDREF; and a catalog's `id` and `owner` are
 * its ID's ({@link IdValue}).
 */
export const catalogOverlayLawsByName = {
  "Card default entry": [key(on(CardDefault, "package", "path", "card"))],
  "Card support": [key(on(CatalogSupport, "package", "path", "catalog", "support"))],
  "Catalog reference": [
    contained(
      on(UnassembledReference, "package", "path", "token"),
      on(CatalogId, "package", "path", "id"),
    ),
    contained(
      on(PlacedReference, "package", "assembly", "token"),
      on(AssembledCatalog, "package", "assembly", "id"),
    ),
  ],
  "E1 derived": [
    contained(
      on(CatalogId, "package", "path", "start", "id", "owner"),
      on(IdValue, "package", "path", "start", "id", "owner"),
    ),
  ],
} as const;

/**
 * The queries of this module, each carrying its own name.
 */
export const catalogOverlayRelations = [
  CardDefault,
  CatalogSupport,
  PlacedReference,
  UnassembledReference,
] as const;

/**
 * The rules of this module, {@link catalogOverlayLawsByName} flattened.
 */
export const catalogOverlayLaws = Object.values(catalogOverlayLawsByName).flat();
