/**
 * The terms of the identity overlays that the schema (`#pantry/qti/identity.ts` and its views in
 * `#pantry/qti/names.ts`) and the importer (`#pantry/import/overlays/identity.ts`) both read.
 * Loading this module builds no relation of the schema.
 */
import type { Kind, Name } from "#pantry/grammar/compose.ts";

/**
 * The SSML attributes reading 3's laws read, each by its name and the kind of element that carries
 * it: a `lexicon`'s `xml:id` and a `mark`'s `name`, the names a fragment defines, and a `lookup`'s
 * `ref` and a `speak`'s `startmark` and `endmark`, the names that name them. Each kind carries one
 * part in the laws, so a law reads each by its element's kind alone. A law of the stored level
 * selects them from `Attribute`, the host walks up from their elements, and a rule over a query
 * reads their values (`SsmlValue` of `#pantry/qti/names.ts`).
 */
export const ssmlReads = [
  ["xml:id", ["ssml:lexicon"]],
  ["name", ["ssml:mark"]],
  ["ref", ["ssml:lookup"]],
  ["startmark", ["ssml:speak"]],
  ["endmark", ["ssml:speak"]],
] as const satisfies readonly (readonly [Name, readonly Kind[]])[];

/**
 * The attributes counted among their document's IDs though their value domain is no `xs:ID`, each
 * by its name and the kind of element that carries it: a context declaration's `identifier`, which
 * spec reading 74 counts among its document's IDs, since the information model makes it a
 * UniqueIdentifier (§5.34.1), "unique within the scope of the instance" (§7.43), while 3.0.1's XSD
 * types it an `IdentifierDType`. A law of the stored level selects them beside the `xs:ID`-typed
 * attributes (`idTyped` of `#pantry/qti/identity.ts`), a rule over a query matches them
 * (`idTypedIn` of `#pantry/qti/names.ts`), and the host reads them
 * (`#pantry/import/overlays/identity.ts`).
 */
export const idSpaceAttributes = [
  ["identifier", ["qti-context-declaration"]],
] as const satisfies readonly (readonly [Name, readonly Kind[]])[];
