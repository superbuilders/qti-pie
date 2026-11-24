/**
 * The catalog laws over attributes' tokens and IDs (`#pantry/qti/catalog.ts`): a
 * `data-catalog-idref`'s tokens are its `Idref` pieces (C18), and a catalog's `id` its attribute's
 * `value` ({@link CatalogId}, a view of `#pantry/qti/names.ts`); a reference resolves in its
 * document, or under each instance of it in its assembly, which only `Document` and `Instance`
 * hold. A card's catalog and an entry's card are each its node's parent, which its attribute holds
 * (`Attribute.parent`), so those keys are the stored level's (`#pantry/qti/catalog.ts`).
 */
import { contained, Crypto, derived, key, on, query, v } from "@bjornpagen/grizzle";
import { Idref } from "#pantry/qti/attributes.ts";
import { QtiBase } from "#pantry/qti/base.ts";
import { Document } from "#pantry/qti/chardata.ts";
import { PlacedId } from "#pantry/qti/identity.ts";
import { CatalogId, QtiViews } from "#pantry/qti/names.ts";
import { Instance } from "#pantry/qti/tests.ts";
import { declared } from "#pantry/qti/law-entries.ts";

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
 * Each token of a document in no assembly, by its document and the token's SHA-256, since an
 * `xs:IDREF` has no bound: a {@link catalogReferences} token of a document whose `assembled` is
 * false, which resolves among the document's own catalogs by its digest. A document is assembled
 * exactly where an `Instance` places it, both ways stated laws (`#pantry/qti/tests.ts`,
 * `#pantry/qti/queries.ts`): every instance's document has its
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
      .find({ package: pkg, path, tokenDigest: Crypto.sha256(token) });
  }),
);

/**
 * Each token of an instance's document under the instance's assembly (spec reading 117), by its
 * SHA-256: every {@link catalogReferences} token of the document each `Instance` places, which
 * resolves among its assembly's catalogs. A document is assembled exactly where an instance places
 * it (the laws {@link UnassembledReference} cites), so every token of an assembled document is here
 * once for each assembly that places it, and the join is complete by its definition, with no row
 * stored or counted. It resolves among {@link AssembledCatalog}.
 */
const PlacedReference = derived(
  "PlacedReference",
  query(QtiBase).rule((r) => {
    const { assembly, document, package: pkg } = v(Instance, "instance");
    const { token } = v(catalogReferences, "reference");

    return r
      .match(Instance, { assembly, document, package: pkg })
      .match(catalogReferences, { package: pkg, path: document, token })
      .find({ assembly, package: pkg, tokenDigest: Crypto.sha256(token) });
  }),
);

/**
 * Each catalog's binding in its assembly's ID table (spec reading 117), by the assembly and the
 * id's SHA-256: every `PlacedId` of the assembly whose owner is a {@link CatalogId}'s element, so a
 * catalog of a fragment two items include is bound in each item's assembly, and a catalog placed
 * twice in one assembly is one binding. Its `idDigest` is the catalog's.
 */
export const AssembledCatalog = derived.stored(
  "AssembledCatalog",
  query(QtiViews).rule((r) => {
    const { assembly, owner, package: pkg, path } = v(PlacedId, "placed");
    const { idDigest } = v(CatalogId, "catalog");

    return r
      .match(PlacedId, { assembly, owner, package: pkg, path })
      .match(CatalogId, { idDigest, package: pkg, path, start: owner })
      .find({ assembly, idDigest, package: pkg });
  }),
);

/**
 * The catalog laws over the views (`#pantry/qti/catalog.ts`): a document's catalogs carry distinct
 * IDs, its `id`s by their SHA-256 ("DocumentId key", which an ID held twice in a document already
 * breaks); and each reference's token is a catalog's `id` of its document where the document is in
 * no assembly ({@link UnassembledReference}), and a catalog's binding in each assembly that places
 * the document otherwise ({@link PlacedReference}, {@link AssembledCatalog}), as "Idref target"
 * resolves an IDREF.
 */
export const catalogOverlayLawsByName = {
  "Catalog reference": declared("Catalog reference", [
    contained(
      on(UnassembledReference, "package", "path", "tokenDigest"),
      on(CatalogId, "package", "path", "idDigest"),
    ),
    contained(
      on(PlacedReference, "package", "assembly", "tokenDigest"),
      on(AssembledCatalog, "package", "assembly", "idDigest"),
    ),
  ]),
  "DocumentId key": declared("DocumentId key", [key(on(CatalogId, "package", "path", "idDigest"))]),
} as const;

/**
 * The queries of this module, each carrying its own name.
 */
export const catalogOverlayRelations = [
  AssembledCatalog,
  PlacedReference,
  UnassembledReference,
] as const;

/**
 * The rules of this module, {@link catalogOverlayLawsByName} flattened.
 */
export const catalogOverlayLaws = Object.values(catalogOverlayLawsByName).flat();
