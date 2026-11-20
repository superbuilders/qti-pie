/**
 * The identity overlays' rules over a query (`#pantry/qti/identity.ts`): an {@link SsmlScope} row's
 * fragment and a {@link CatalogScope} row's scope are each read up the tree, which needs the
 * element's kind and parent, and only `Node` holds them; an {@link IdentityText}'s parse is held to
 * its element's text; and the ID/IDREF tables of a document and of an assembly, the IDs' values
 * ({@link IdValue}) and the values a fragment's SSML attributes hold ({@link SsmlValue}), are
 * projections no table stores, so the laws over them are rules over a query.
 */
import {
  check,
  Compute,
  contained,
  derived,
  key,
  mirrors,
  on,
  query,
  select,
  v,
} from "@bjornpagen/grizzle";
import { referenceIdentities } from "#pantry/grammar/domains.ts";
import { QtiBase } from "#pantry/qti/base.ts";
import {
  CatalogScope,
  IdentityText,
  PlacedId,
  PlacedIdref,
  ShareFragment,
  SsmlScope,
  textIdentityOf,
  unassembledTargets,
} from "#pantry/qti/identity.ts";
import { AssembledCatalog } from "#pantry/qti/catalog.ts";
import { PlacedShareTarget, ShareTarget } from "#pantry/qti/mathml-share.ts";
import { keyText } from "#pantry/qti/limits.ts";
import { attributeValues, IdValue, QtiViews, SsmlValue } from "#pantry/qti/names.ts";
import { documentStart, Node } from "#pantry/qti/node.ts";

/**
 * Each SSML scope beside its element's kind and parent, by the element's place.
 */
const SsmlScopeNode = derived(
  "SsmlScopeNode",
  query(QtiBase).rule((r) => {
    const { fragment, package: pkg, path, start } = v(SsmlScope, "scope");
    const { kind, parent } = v(Node, "node");

    return r
      .match(SsmlScope, { fragment, package: pkg, path, start })
      .match(Node, { kind, package: pkg, parent, path, start })
      .find({ fragment, kind, package: pkg, parent, path, start });
  }),
);

/**
 * Each catalog scope beside its element's kind and parent, by the element's place.
 */
const CatalogScopeNode = derived(
  "CatalogScopeNode",
  query(QtiBase).rule((r) => {
    const { package: pkg, path, scope, start } = v(CatalogScope, "scope");
    const { kind, parent } = v(Node, "node");

    return r
      .match(CatalogScope, { package: pkg, path, scope, start })
      .match(Node, { kind, package: pkg, parent, path, start })
      .find({ kind, package: pkg, parent, path, scope, start });
  }),
);

/**
 * Each identity-typed text's parse beside its element's governing type and string value, by the
 * element's place.
 */
const IdentityTextNode = derived(
  "IdentityTextNode",
  query(QtiBase).rule((r) => {
    const { package: pkg, path, start, tokenText, tokens } = v(IdentityText, "text");
    const { governor, stringValue } = v(Node, "node");

    return r
      .match(IdentityText, { package: pkg, path, start, tokenText, tokens })
      .match(Node, { governor, package: pkg, path, start, stringValue })
      .find({ governor, package: pkg, path, start, stringValue, tokenText, tokens });
  }),
);

/**
 * The ID/IDREF table of each document, a projection of its IDs' values onto (package, path, id,
 * owner) ({@link IdValue}): the bindings of admitted elements' IDs, which "DocumentId key" holds to
 * one element per (document, id) and "Idref target" resolves an IDREF among (R2). An element the
 * grammar does not admit where it stands keeps its `DocumentId` but binds nothing.
 */
const IdBinding = derived(
  "IdBinding",
  query(QtiViews).rule((r) => {
    const { id, owner, package: pkg, path } = v(IdValue, "id");

    return r
      .match(IdValue, { admitted: true, id, owner, package: pkg, path })
      .find({ id, owner, package: pkg, path });
  }),
);

/**
 * The ID/IDREF table of each assembly, a projection of its placed IDs: an id, the element it is
 * bound to (its document's `path` and its `owner` position), and the instance of the document that
 * holds it. Its key on `(package, assembly, id)` is cvc-id clause 2 over the merged document
 * ("DocumentId key"): an included fragment's ID is distinct from its item's, and a fragment placed
 * twice in one item holds its IDs twice, as its merged document does (information model §2.12).
 */
export const AssembledId = derived(
  "AssembledId",
  query(QtiBase).rule((r) => {
    const { assembly, id, instance, owner, package: pkg, path } = v(PlacedId, "placed");

    return r
      .match(PlacedId, { assembly, id, instance, owner, package: pkg, path })
      .find({ assembly, id, instance, owner, package: pkg, path });
  }),
);

/**
 * Every MathML `share`'s `src`, by its element's place, with its value ({@link attributeValues}).
 */
const shareSrcs = attributeValues("src", ["m:share"]);

/**
 * The `src`s of the MathML `share`s whose value is a fragment of its own document, each by its
 * element's place, with its value, its lexical form collapsed (an `xs:anyURI`'s whiteSpace): those
 * that start with `#` and are more than the `#` alone, exactly MathML 3 §4.2.7's same-document
 * reference, `#` and one or more characters, as the oracle reads it (`fragmentOfSrc`,
 * `#pantry/test/oracle.ts`). Its length is stated as `value ≠ "#"`, which beside the `#` it starts
 * with is `charLength(value) > 1`, since grizzle reads a length in no query. A `src` whose value
 * has text before its `#`, or none after it, names a file (spec reading 103), which no law here
 * reads.
 */
const shareSources = query(QtiBase).rule((r) => {
  const { package: pkg, path, start, value } = v(shareSrcs, "src");

  return r
    .match(shareSrcs, { package: pkg, path, start, value })
    .where(r.and(r.eq(Compute.startsWith(value, "#"), true), r.ne(value, "#")))
    .find({ package: pkg, path, start, value });
});

/**
 * {@link shareSources} as a relation of the schema, which "E1 derived" holds both ways to the
 * {@link ShareFragment} rows: each such `src` has its row, and each row is one.
 */
const ShareSource = derived("ShareSource", shareSources);

/**
 * Each {@link ShareFragment} beside its `src`'s value ({@link shareSources}), by the share's place:
 * what "E1 derived" holds its `id` to, the value after its `#`.
 */
const ShareFragmentValue = derived(
  "ShareFragmentValue",
  query(QtiBase).rule((r) => {
    const { id, package: pkg, path, start } = v(ShareFragment, "share");
    const { value } = v(shareSources, "src");

    return r
      .match(ShareFragment, { id, package: pkg, path, start })
      .match(shareSources, { package: pkg, path, start, value })
      .find({ id, package: pkg, path, start, value });
  }),
);

/**
 * The marks a trim names, by the trim's `speak`, its own fragment, and the `mark`: each `mark` of
 * the trim's fragment whose name is the trim's value, the one statement that a trim names a `mark`.
 * "SSML trim mark" holds every trim to one, and keys them by the trim's value, so a name a trim
 * names is defined once; a mark name no trim names may repeat.
 */
const TrimmedMark = derived(
  "TrimmedMark",
  query(QtiViews).rule((r) => {
    const { package: pkg, path, start: fragment, value } = v(SsmlValue, "trim");
    const { start } = v(SsmlValue, "mark");

    return r
      .match(SsmlValue, { kind: "ssml:speak", package: pkg, path, start: fragment, value })
      .match(SsmlValue, { fragment, kind: "ssml:mark", package: pkg, path, start, value })
      .find({ fragment, package: pkg, path, start, value });
  }),
);

/**
 * The names a `lookup` refers to a `lexicon` by, each in its element's fragment.
 */
const lookupRefs = select(SsmlValue, (l) => l.eq(l.kind, "ssml:lookup"));

/**
 * The names each fragment's `lexicon`s define.
 */
const lexiconIds = select(SsmlValue, (d) => d.eq(d.kind, "ssml:lexicon"));

/**
 * A `speak`'s `startmark` and `endmark`, each of which names a `mark` of its own fragment.
 */
const speakTrims = select(SsmlValue, (t) => t.eq(t.kind, "ssml:speak"));

/**
 * The SSML scopes whose fragment is read from the parent: every element but a `speak` and a
 * document's root.
 */
const inheritedScopes = select(SsmlScopeNode, (s) =>
  s.and(s.ne(s.kind, "ssml:speak"), s.ne(s.parent, documentStart)),
);

/**
 * The catalog scopes read from the parent: every element but a `qti-catalog-info` and a document's
 * root.
 */
const inheritedCatalogScopes = select(CatalogScopeNode, (s) =>
  s.and(s.ne(s.kind, "qti-catalog-info"), s.ne(s.parent, documentStart)),
);

/**
 * The identity overlays' rules over a query, each named by its oracle law:
 *
 * - **"DocumentId key":** one admitted element per (document, id), and one binding per (assembly, id)
 *   (cvc-id clause 2);
 * - **"E1 derived":** a placed ID is an ID of its document, its value and owner {@link IdValue}'s;
 *   each `share`'s same-document `src` has its {@link ShareFragment} and each row is one
 *   ({@link ShareSource}), its `id` the `src`'s value after the `#` ({@link ShareFragmentValue}); a
 *   `qti-catalog-info` is its own catalog scope and a `speak` its own fragment, a root that is
 *   neither the document node's, and every other element's its parent's; and an identity-typed
 *   text's IDREF tokens concatenate to its text, an ID's being none;
 * - **"Idref target":** an IDREF of a document in no assembly names an admitted binding of its
 *   document, and a placed one a binding of its assembly;
 * - **"SSML lexicon reference"** (spec reading 3; SSML 1.1 §3.1.5.2 and §3.1.5.1): a `lookup`'s `ref`
 *   names a `lexicon` of its own fragment, the one statement that a lookup names a `lexicon`;
 * - **"SSML trim mark"** (spec reading 3; SSML 1.1 §3.1.1.1: "Only markers defined once in the
 *   document, i.e. that are unique, are permitted as the value of either startmark or endmark"): a
 *   `speak`'s `startmark` and `endmark` each name a `mark` its own fragment defines exactly once, a
 *   `speak` being its own fragment ({@link TrimmedMark}). A mark name may otherwise repeat.
 */
export const identityOverlayLawsByName = {
  "DocumentId key": [
    key(on(IdBinding, "package", "path", "id")),
    key(on(AssembledId, "package", "assembly", "id")),
  ],
  "E1 derived": [
    contained(
      on(PlacedId, "package", "path", "start", "id", "owner"),
      on(IdValue, "package", "path", "start", "id", "owner"),
    ),
    mirrors(
      on(ShareSource, "package", "path", "start"),
      on(ShareFragment, "package", "path", "start"),
    ),
    check("E1_derived", ShareFragmentValue, (f) =>
      f.eq(f.value, Compute.concat(Compute.literal(keyText, "#"), f.id)),
    ),
    contained(
      on(ShareTarget, "package", "path", "id", "targetStart"),
      on(IdBinding, "package", "path", "id", "owner"),
    ),
    contained(
      on(PlacedShareTarget, "package", "assembly", "id", "target", "targetStart", "targetInstance"),
      on(AssembledId, "package", "assembly", "id", "path", "owner", "instance"),
    ),
    contained(
      on(AssembledCatalog, "package", "assembly", "id", "path", "owner"),
      on(AssembledId, "package", "assembly", "id", "path", "owner"),
    ),
    check("E1_derived", IdentityTextNode, (t) => {
      const identity = textIdentityOf(t.governor);

      return t.or(
        t.and(t.eq(identity, "ID"), t.eq(t.tokens, 0n)),
        t.and(t.in(identity, referenceIdentities), t.eq(t.stringValue, t.tokenText)),
      );
    }),
    check("E1_derived", CatalogScopeNode, (s) =>
      s.or(
        s.and(s.eq(s.kind, "qti-catalog-info"), s.eq(s.scope, s.start)),
        s.and(
          s.ne(s.kind, "qti-catalog-info"),
          s.eq(s.parent, documentStart),
          s.eq(s.scope, documentStart),
        ),
        s.and(s.ne(s.kind, "qti-catalog-info"), s.ne(s.parent, documentStart)),
      ),
    ),
    contained(
      on(inheritedCatalogScopes, "package", "path", "parent", "scope"),
      on(CatalogScope, "package", "path", "start", "scope"),
    ),
    check("E1_derived", SsmlScopeNode, (s) =>
      s.or(
        s.and(s.eq(s.kind, "ssml:speak"), s.eq(s.fragment, s.start)),
        s.and(
          s.ne(s.kind, "ssml:speak"),
          s.eq(s.parent, documentStart),
          s.eq(s.fragment, documentStart),
        ),
        s.and(s.ne(s.kind, "ssml:speak"), s.ne(s.parent, documentStart)),
      ),
    ),
    contained(
      on(inheritedScopes, "package", "path", "parent", "fragment"),
      on(SsmlScope, "package", "path", "start", "fragment"),
    ),
  ],
  "Idref target": [
    contained(
      on(unassembledTargets, "package", "path", "id"),
      on(IdBinding, "package", "path", "id"),
    ),
    contained(
      on(PlacedIdref, "package", "assembly", "id"),
      on(AssembledId, "package", "assembly", "id"),
    ),
  ],
  "SSML lexicon reference": [
    contained(
      on(lookupRefs, "package", "path", "fragment", "value"),
      on(lexiconIds, "package", "path", "fragment", "value"),
    ),
  ],
  "SSML trim mark": [
    contained(
      on(speakTrims, "package", "path", "start", "value"),
      on(TrimmedMark, "package", "path", "fragment", "value"),
    ),
    key(on(TrimmedMark, "package", "path", "fragment", "value")),
  ],
} as const;

/**
 * The queries of this module, each carrying its own name.
 */
export const identityOverlayRelations = [
  AssembledId,
  CatalogScopeNode,
  IdBinding,
  IdentityTextNode,
  ShareFragmentValue,
  ShareSource,
  SsmlScopeNode,
  TrimmedMark,
] as const;

/**
 * The rules of this module, {@link identityOverlayLawsByName} flattened.
 */
export const identityOverlayLaws = Object.values(identityOverlayLawsByName).flat();
