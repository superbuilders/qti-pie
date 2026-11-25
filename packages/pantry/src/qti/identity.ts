/**
 * The identity overlays (plan §1.7 O1; the W5 amendment's C3, C18 and C25; the tier-1 addendum's
 * "Text in keys"): each document's IDs, the ID/IDREF
 * table's bindings and the IDREF tokens that name them, the `xml:lang` forms a document carries and
 * the languages each LOM general category lists, each as a set, with R26 between the two; SSML's
 * marks and lexicons named within their fragment (spec reading 3); and an item's tool
 * identification where its body uses labels.
 *
 * - **{@link DocumentId}** holds one row per element that carries an ID: an attribute whose value
 *   domain's identity is `xs:ID`, a context declaration's `identifier`, which spec reading 74
 *   counts among its document's IDs though 3.0.1's XSD types it an `IdentifierDType`, or the
 *   element's own text, where its governing type's text domain is an `xs:ID` (C50, an
 *   {@link IdentityText}). Its `owner` is the element the ID/IDREF table binds the ID to: the
 *   element that carries the attribute, or the parent of the element whose text it is (XML Schema
 *   1.0 Part 1 §3.15.5, `[binding]`: "an attribute information item in its [attributes] or an
 *   element information item in its [children]"). The ID's value is no row's: `IdValue`
 *   (`#pantry/qti/names.ts`) reads it where it stands, an attribute's `value` or a text's string
 *   value collapsed (an `xs:ID` is an `xs:NCName`, whose whiteSpace is `collapse`). Every ID-typed
 *   attribute and every ID text has its row, whatever its form: its value domain (AL1) or
 *   TextDomain holds the form to an NCName once collapsed where it is written (spec readings 152
 *   and 156), so a form that names nothing, empty, whitespace alone or holding whitespace inside,
 *   is refused there, and no law here restates that domain.
 * - **The ID/IDREF table** is the projection of the IDs onto (package, path, id, owner), a query
 *   (`IdBinding`, `#pantry/qti/overlay-queries/identity.ts`) no table stores, and its key on
 *   (package, path, id) over the bindings of admitted elements is cvc-id clause 2, "no ID/IDREF
 *   binding … whose [binding] has more than one member" (law "DocumentId key", rule
 *   `document-key`). An element the grammar does not admit where it stands keeps its
 *   {@link DocumentId} but binds nothing, so "N5 admitted" alone refuses it, as the law oracle
 *   judges it (R2). An element whose two children are one ID's, or whose attribute and child are,
 *   is one binding, as the table's letter has it; the key over the ID-typed attributes' element,
 *   `(package, path, start)`, is XML Schema's one ID attribute per element.
 * - **Idref target** (rule `idref-target`): every `Idref` token, Q5.05's split of an IDREF or IDREFS
 *   attribute value, and every {@link TextIdref} token, this module's split of an IDREF or IDREFS
 *   element's text (C50), is an id of its document. Spec reading 14 follows the XSD, so a
 *   text-entry interaction's `response-identifier` and `string-identifier` are IDREFs, and a
 *   response declaration's `identifier`, an `xs:ID`, is what they name; the grammar's value domains
 *   carry it, and nothing here names a kind. A MathML `share`'s `src` of the form `#id` is no token
 *   but names an element of its document all the same (MathML 3 §4.2.7), so each such `src` is a
 *   {@link ShareFragment}, and its id is an id of its document under this rule.
 * - **A document's `xml:lang` forms** are its `xml:lang` attributes whose element's
 *   {@link CatalogScope} is its document node, read where they stand (`LangValue`,
 *   `#pantry/qti/names.ts`), so the set is no stored projection and no overlay row copies or counts
 *   them. The languages each LOM `general` category lists are no row of any overlay either:
 *   `ListedLang` of `#pantry/qti/queries.ts` reads each `lom:language`'s folded string value from
 *   `Node`.
 * - **R26 `document-lang`** (law "Document lang"): the QTI 3.0 metadata binding's LOM profile,
 *   §2.7.1.3, "There must be one value for each of the languages referred to by the language
 *   attributes on the associated assessmentItem, test or object bank and its 'bodyElements'",
 *   normative by its §1.2. Each language an item's or a test's `xml:lang` states is listed by every
 *   general category of each record that names the document (a `lom:lom` of the `cp:metadata` of a
 *   resource of an item or a test type whose `href` names it). A document no such category
 *   describes states nothing, so a resource whose record has no general category is not judged. It
 *   is a universal over pairs, which the database states as a rule over a query (`DescribedLang`,
 *   `#pantry/qti/queries.ts`): each form that states a language, under each category describing its
 *   document, has its compared value (`LangValue`'s `value`, `#pantry/qti/names.ts`) among the
 *   languages the category lists (`ListedLang`). In place (spec reading 117), an included
 *   fragment's elements are its item's body elements: each form of the document of each instance of
 *   an item's assembly is a form the assembly states, a join of the instance and the form that no
 *   row stores, and every category that describes the item lists it (`DescribedAssembledLang`). The
 *   binding counts "the associated assessmentItem ... and its 'bodyElements'", and a catalog is
 *   "outside the content body node" (information model §5.28), so R26 counts no `xml:lang` under a
 *   `qti-catalog-info` (reading R9-c): each `xml:lang`'s element has its {@link CatalogScope}, read
 *   up the tree as {@link SsmlScope} reads a fragment, and R26 reads only the forms whose scope is
 *   their document.
 * - **Reading 3** (rule `ssml-fragment`): SSML's "document" is each `speak` fragment. A `speak`'s
 *   `startmark` and `endmark` name a `mark` its fragment defines exactly once (law "SSML trim
 *   mark", SSML 1.1 §3.1.1.1), and a `lookup`'s `ref` a `lexicon` of its fragment (law "SSML
 *   lexicon reference", §3.1.5.1); a mark name may otherwise repeat, and fragments see none of each
 *   other's names. `ssmlReads` (`#pantry/vocab/terms/identity.ts`) names the attributes the two
 *   laws read, which they read where they stand, by their `value`, the lexical form collapsed (each
 *   an `xs:token`, an `xs:ID` or an `xs:IDREF`, of whiteSpace `collapse`, SSML 1.1 §3.3.2), so no
 *   overlay copies them (C18), each in its element's fragment (`SsmlValue` of
 *   `#pantry/qti/names.ts`). {@link SsmlScope} holds each element's fragment, read up the tree from
 *   the elements those attributes stand on, so `Node` carries no copy of it.
 * - **Label tools** (rule `label-tool`): an item that labels an element of its content names the tool
 *   that labelled it, by both `tool-name` and `tool-version` on its root ({@link LabelUse}), where
 *   the element's `label` characteristic says so, as BasePromptInteraction's, the BaseSequence
 *   family's, ItemBody's and the item root's own do ({@link toolLabelKinds}; QTI 3.0.1's §4.1.3,
 *   spec reading 128), and an `ItemFileInfo`'s or a printed variable's does not.
 *
 * **Language equality.** A language is the one a tag names: `xml:lang` is compared by its value,
 * `Attribute`'s `value`, its lexical form normalized in its domain's class (`LangValue` of
 * `#pantry/qti/names.ts`), and a LOM `language` a `CharacterString`, an `xs:string` read as
 * written; BCP 47 compares tags without regard to case ("At all times, language tags and their
 * subtags … are to be treated as case insensitive", RFC 5646 §2.1.1, which XML 1.0 §2.12 names for
 * `xml:lang`). A tag's subtags are ASCII letters, digits and hyphens (RFC 5646 §2.1), so its case
 * is ASCII's, and both sides compare by `Text.lowerAscii`: `ListedLang`'s `lang` and
 * `LangValue`'s `value`. A form states a language exactly where its value is not empty. An empty
 * `xml:lang` states none ("there is no language information available", XML 1.0 §2.12), and every
 * form AL1 admits has a tag or the empty text for its value, since each of the three `xml:lang`
 * domains the grammar installs (spec reading 129) lies inside a tag with XML whitespace around it,
 * or the empty form: an item's and a stimulus's root's, an `xs:language` (whiteSpace `collapse`),
 * a tag with whitespace around it; a body element's, a union (whiteSpace `preserve`) of that
 * (`collapse`) and the empty form; and an `xs:anySimpleType` one's, a tag or the empty form as
 * written. So a form of whitespace alone, or one that is no tag once collapsed, which identifies no
 * language (RFC 5646 §2.1), is outside its domain, which AL1 refuses where it is written (spec
 * reading 174), before any rule over a query is judged.
 *
 * Every copy of an attribute into an overlay follows C18 the other way round, from
 * `select(Attribute, φ)` into the overlay, keyed by `Attribute`'s own key, `(package, path, start,
 * name)` (`#pantry/qti/attributes.ts`), whose index over the selection's element serves the copy's
 * reverse probe, so no index holds `Attribute.lexical`. Every overlay is keyed by its element,
 * `(package, path, start)`, and names another element of its document by its position alone. Every
 * copied text that takes part in a cross-row equality is of its type's bound in a key
 * (`#pantry/qti/limits.ts`), so a key, a containment's target and a lookup hold it as itself.
 *
 * Every check is named by its oracle law (`#pantry/test/oracle.ts` `LawName`) with spaces written
 * as underscores. The overlays' agreement with what the tree holds is "E1 derived" (rule
 * `derived`): a field or a row the database derives that the host built otherwise.
 *
 * @see {@link https://www.w3.org/TR/xmlschema-1/#cvc-id | XML Schema 1.0 Part 1, Validation Root (the ID/IDREF table)}
 * @see {@link https://www.w3.org/TR/xmlschema-1/#cvc-complex-type | XML Schema 1.0 Part 1, Element Locally Valid (Complex Type), clause 5}
 * @see {@link https://www.imsglobal.org/sites/default/files/spec/qti/v3/md-bind/index.html | QTI 3.0 Metadata, §2.7.1.3 Language}
 * @see {@link https://www.rfc-editor.org/rfc/rfc5646#section-2.1.1 | RFC 5646, §2.1.1 Formatting of Language Tags}
 */
import {
  check,
  closedId,
  contained,
  counted,
  Crypto,
  drawn,
  fin,
  generated,
  key,
  law,
  on,
  pg,
  relation,
  select,
  sha256,
} from "@bjornpagen/grizzle";
import type { RowScalars } from "@bjornpagen/grizzle";
import {
  Identity,
  NodeKind,
  TextDomain,
  ValueIdentity,
  natural,
  toolLabelKinds,
} from "#pantry/grammar/install.ts";
import { Attribute, attributesOf, identityIn, Idref, namedOn } from "#pantry/qti/attributes.ts";
import { Document } from "#pantry/qti/chardata.ts";
import { EntryPath, matchedText, PackageName } from "#pantry/qti/limits.ts";
import { admitsHere, Node } from "#pantry/qti/node.ts";
import { Instance } from "#pantry/qti/tests.ts";
import {
  listTokens,
  tokenFields,
  tokenList,
  tokenTextDigest,
  whitespaceTokens,
} from "#pantry/qti/token-list.ts";
import { idSpaceAttributes, ssmlReads } from "#pantry/vocab/terms/identity.ts";
import { itemKind } from "#pantry/vocab/terms/tests.ts";
import { declared } from "#pantry/qti/law-entries.ts";
import { entryOf } from "#pantry/vocab/laws.ts";

/**
 * One ID of a document, keyed by the element that carries it, `(package, path, start)`: XML Schema
 * gives a valid element at most one attribute of an ID type, an attribute use's or a wildcard's
 * (cvc-complex-type clause 5, ct-props-correct clause 5), and a governor whose text is an ID's
 * admits the four `xsi:` attributes alone, so no element carries both.
 *
 * - **the attribute's or the text's element:** `package`, `path` and `start`, and for a text,
 *   `owner`, the element's parent's position;
 * - **the host's:** for an attribute, `owner`, the element's own position: a row whose `owner` is its
 *   `start` is an attribute's, every other a text's; and `admitted`, whether the grammar admits the
 *   element that carries it where it stands (its parent's admission map, {@link admittedNodes}),
 *   which `E1_derived` proves both ways.
 *
 * It holds no copy of the ID's value (C18): `IdValue` (`#pantry/qti/names.ts`) reads it where it
 * stands. Every ID has its row, an unadmitted element's too, so the existence from the attribute or
 * the text stays complete, and each document's IDs are counted by `Document.ids`; only an admitted
 * element's ID is bound (its `admitted`).
 */
export const DocumentId = law(
  entryOf("DocumentId key"),
  relation(
    "DocumentId",
    {
      admitted: pg.boolean,
      owner: natural,
      package: PackageName,
      path: EntryPath,
      start: natural,
    },
    ["package", "path", "start"],
  ),
);

/**
 * One element whose text is of an identity type (C50), keyed by the element: its governing type's
 * text domain is an `xs:ID`, an `xs:IDREF` or an `xs:IDREFS` one (`ValueIdentity`), which only an
 * `xsi:type` gives an element in the pinned grammar.
 *
 * It is the owner of its text's parse: its IDREF tokens' ordered family ({@link TextIdref}) and
 * their concatenation, which "E1 derived" holds to the element's string value, `Node.stringValue`
 * (the fold steps it because TextDomain checks the text, `#pantry/qti/node.ts` `inCheckedText`),
 * read through `Node` with the element's governing type
 * (`#pantry/qti/overlay-queries/identity.ts`).
 *
 * - **drawn:** `tokens`, its {@link TextIdref} count;
 * - **accumulated:** `tokenText`, the end of its tokens' concatenation;
 * - **generated:** `tokenTextDigest`, its digest, the fold's end on the family's last axis.
 */
export const IdentityText = law(
  entryOf("E1 derived"),
  relation.generated(
    "IdentityText",
    {
      package: PackageName,
      path: EntryPath,
      start: natural,
      tokenText: tokenFields.piecesWas,
      tokens: tokenFields.at,
    },
    ["package", "path", "start"],
    (t) => tokenTextDigest(t),
  ),
);

/**
 * One IDREF token of an element whose text is an `xs:IDREF` or `xs:IDREFS` (C50), in order, with
 * the whitespace written before and after it, so its `piece` is a stretch of the text and the
 * pieces concatenate to it, as `Idref` splits an attribute's: a whitespace list's token
 * (`#pantry/qti/token-list.ts`), its family's group its element's, which `Idref target` reads. The
 * order is the text's: an `xs:IDREFS` value is an `xs:list`, an ordered sequence of tokens.
 */
export const TextIdref = law(entryOf("E1 derived"), listTokens("TextIdref"));

/**
 * One `label` on an element of a document that asks for its tool, keyed by the element
 * ({@link labelAttributes}, spec reading 128), with its document's root kind, which says whether
 * Label tools binds it.
 */
export const LabelUse = law(
  entryOf("Label tools"),
  relation(
    "LabelUse",
    {
      package: PackageName,
      path: EntryPath,
      rootKind: closedId(NodeKind),
      start: natural,
    },
    ["package", "path", "start"],
  ),
);

/**
 * One element on the way from an element an SSML law reads up to its SSML fragment, keyed by the
 * element (spec reading 3: "the document" is each `speak` fragment): `fragment`, the position of
 * its nearest `ssml:speak`, itself included, or of the document node for an element no `speak`
 * holds. A `speak` is its own fragment, a document's root the document's where it is no `speak`,
 * and every other element its parent's, so a fragment is read up the tree with no copy on `Node`.
 * The element's kind and parent are its node's, which the scope's laws read through `Node`
 * (`#pantry/qti/overlay-queries/identity.ts`).
 */
export const SsmlScope = law(
  entryOf("E1 derived"),
  relation(
    "SsmlScope",
    { fragment: natural, package: PackageName, path: EntryPath, start: natural },
    ["package", "path", "start"],
  ),
);

/**
 * One element on the way from an element that carries an `xml:lang` up to its catalog scope, keyed
 * by the element (spec reading R9-c: a catalog is outside the content body, so the language of its
 * cards, entries and HTML content is not the item's): `scope`, the position of its nearest
 * `qti-catalog-info`, itself included, or of the document node for an element no catalog holds. A
 * `qti-catalog-info` is its own scope, a document's root the document's where it is no catalog
 * info, and every other element its parent's, so a scope is read up the tree with no copy on
 * `Node`, as {@link SsmlScope} reads a fragment, through its node's kind and parent.
 */
export const CatalogScope = law(
  entryOf("E1 derived"),
  relation(
    "CatalogScope",
    { package: PackageName, path: EntryPath, scope: natural, start: natural },
    ["package", "path", "start"],
  ),
);

/**
 * An id a document's IDREF tokens name, a projection keyed by its heading (spec reading 117): every
 * `Idref` and `TextIdref` token's value, of any length, keyed by its SHA-256, `idDigest`, which the
 * import writes and "E1 derived" holds to the value, with its document's `assembled`. A document in
 * no assembly resolves each in its own IDs; one in an assembly, in its assembly's, once per
 * instance ({@link PlacedIdref}). Its rows count as `Document.idrefTargets`.
 */
export const IdrefTarget = law(
  entryOf("E1 derived"),
  relation(
    "IdrefTarget",
    {
      assembled: pg.boolean,
      id: matchedText,
      idDigest: sha256,
      package: PackageName,
      path: EntryPath,
    },
    ["package", "path", "idDigest"],
  ),
);

/**
 * One `m:share` whose `src` is a fragment of its own document, keyed by the element (MathML 3
 * §4.2.7; a `src` that is `#` and a name stands in the same document): `id`, the text after the `#`
 * of the `src`'s value, its lexical form collapsed (an `xs:anyURI`'s whiteSpace), which an
 * {@link IdrefTarget} of the document names under "Idref target". A `src` whose value has any text
 * before its `#`, or no text after it, is no same-document fragment and has no row. It holds no
 * copy of the `src` (C18): that each such `src` has its row, each row is one, and `id` is its value
 * after the `#` are rules over a query that reads the attribute's `value` where it stands
 * (`ShareSource`, `#pantry/qti/overlay-queries/identity.ts`).
 *
 * `idDigest`, the id's SHA-256, which the import writes and "E1 derived" holds to it, is what its
 * placements' family and "Idref target" carry, since the id has no bound and PostgreSQL may not
 * cascade a generated column into a family's axis.
 *
 * Two fields are not the share's own: `assembled`, its document's `assembled` (as
 * {@link IdrefTarget}'s is), which tells a document in no assembly, whose share resolves in its own
 * IDs, from one in an assembly, whose share resolves once per instance; and `placements`, the count
 * of its `PlacedShareTarget` rows (`#pantry/qti/mathml-share.ts`).
 */
export const ShareFragment = law(
  entryOf("E1 derived"),
  relation(
    "ShareFragment",
    {
      assembled: pg.boolean,
      id: matchedText,
      idDigest: sha256,
      package: PackageName,
      path: EntryPath,
      placements: drawn(natural),
      start: natural,
    },
    ["package", "path", "start"],
  ),
);

/**
 * One ID of an instance of an assembly (Q5.13's `Instance`, spec reading 117), keyed by the
 * instance, `(package, assembly, instance)`, and the position `start` of the element that carries
 * it in the instance's document, `path`: an ID of that document, its {@link DocumentId}'s value
 * and owner as `IdValue` (`#pantry/qti/names.ts`) holds them, with the instance's assembly kind.
 * The instance is the copy of the document's elements the assembly's merged document holds it in,
 * so a fragment placed twice holds its IDs twice. `idDigest`, the id's SHA-256, is what a law that
 * finds a placed ID by its value reads, since the id has no bound.
 */
export const PlacedId = law(
  entryOf("E1 derived"),
  relation.generated(
    "PlacedId",
    {
      assembly: EntryPath,
      assemblyKind: closedId(NodeKind),
      id: matchedText,
      instance: natural,
      owner: natural,
      package: PackageName,
      path: EntryPath,
      start: natural,
    },
    ["package", "assembly", "instance", "start"],
    (p) => ({ idDigest: law(entryOf("E1 derived"), generated(sha256, Crypto.sha256(p.id))) }),
  ),
);

/**
 * One id an instance's document's IDREFs name (spec reading 117), keyed by the instance and the
 * id's SHA-256, `idDigest`, which the import writes and "E1 derived" holds to the id: an
 * {@link IdrefTarget} of the instance's document, `path`, which resolves among its assembly's IDs
 * ("Idref target").
 */
export const PlacedIdref = law(
  entryOf("E1 derived"),
  relation(
    "PlacedIdref",
    {
      assembly: EntryPath,
      id: matchedText,
      idDigest: sha256,
      instance: natural,
      package: PackageName,
      path: EntryPath,
    },
    ["package", "assembly", "instance", "idDigest"],
  ),
);

/**
 * Each document's IDs, counted by `Document.ids`.
 */
const documentIdFamily = counted(on(DocumentId, "package", "path"), fin(Document, "ids"));

/**
 * Each document's IDREF targets, counted by `Document.idrefTargets`.
 */
const idrefTargetFamily = counted(
  on(IdrefTarget, "package", "path"),
  fin(Document, "idrefTargets"),
);

/**
 * Each instance's IDs, counted by `Instance.ids`, its document's count.
 */
const placedIdFamily = counted(
  on(PlacedId, "package", "assembly", "instance"),
  fin(Instance, "ids"),
);

/**
 * Each instance's IDREF targets, counted by `Instance.idrefTargets`, its document's count.
 */
const placedIdrefFamily = counted(
  on(PlacedIdref, "package", "assembly", "instance"),
  fin(Instance, "idrefTargets"),
);

/**
 * Every relation this module declares, in one list, as `schema.ts` composes them.
 */
export const identityRelations = [
  CatalogScope,
  DocumentId,
  IdentityText,
  IdrefTarget,
  LabelUse,
  PlacedId,
  PlacedIdref,
  ShareFragment,
  SsmlScope,
  TextIdref,
] as const;

/**
 * An `Attribute` row as a selection reads it.
 */
type AttributeRow = RowScalars<typeof Attribute>;

/**
 * Read the identity type of an element's text: its governor's `TextDomain`'s `ValueIdentity`. It
 * is absent where the governor has no simple content or its domain no
 * identity: a selection leaves such an element out, and a check refuses it. Exported for the rule
 * over a query that holds an {@link IdentityText}'s parse to its text
 * (`#pantry/qti/overlay-queries/identity.ts`).
 *
 * @param governor - The element's governor.
 * @returns The closed read.
 */
export const textIdentityOf = (governor: Parameters<typeof TextDomain.at>[1]) =>
  ValueIdentity.at("identity", TextDomain.at("domain", governor));

/**
 * State that an attribute is ID-typed: its domain is an `xs:ID` one, or it is one of
 * {@link idSpaceAttributes}, a context declaration's `identifier` (spec reading 74). A rule over a
 * query states it through its twin, `idTypedIn` (`#pantry/qti/names.ts`).
 *
 * Each kind of {@link idSpaceAttributes} is an equality, not `namedOn`'s membership: the key over
 * {@link idAttributes} and its columns were shipped under this selection's equalities, and grizzle
 * names them by its canonical conjuncts, so a membership would rebuild them under new names for no
 * change of meaning (`namedOn` of `#pantry/qti/attributes.ts`).
 *
 * @param a - The attribute row.
 * @returns The statement.
 */
/**
 * GRIZZLE-PENDING: CLOSEDID2 (follow-up 6): one `eq` per roster kind, not namedOn, until grizzle
 * canonicalizes a one-member `in [v]` as `eq v`, as layer 0's 18 single-kind selections wait; then
 * idTyped reads namedOn.
 */
const idTyped = (a: AttributeRow) =>
  a.or(
    identityIn(a, ["ID"]),
    ...idSpaceAttributes.flatMap(([name, kinds]) =>
      kinds.map((kind) => a.and(a.eq(a.kind, kind), a.eq(a.name, name))),
    ),
  );

/**
 * The ID-typed attributes, each the source of a {@link DocumentId}, which the key over their
 * element holds to one per element: XML Schema gives a valid element at most one attribute of an ID
 * type (cvc-complex-type clause 5), a statement of types, not of values. Each one's value is one of
 * its document's IDs, since AL1 holds its form to its domain, an NCName once collapsed: the
 * `IdentifierDType` and `UniqueIdentifierDType` patterns of every ID-typed attribute the grammar
 * installs are `xs:NCName`'s with XML whitespace around it (spec readings 152 and 156).
 */
export const idAttributes = select(Attribute, idTyped);

/**
 * The elements whose text is of an identity type, the source of {@link IdentityText}.
 */
const identityNodes = select(Node, (n) => n.in(textIdentityOf(n.governor), Identity.handles));

/**
 * The elements whose text is an ID, each the source of a {@link DocumentId}: those whose text is
 * of an `xs:ID` domain, bound to their parent. TextDomain holds the text to an NCName once
 * collapsed (spec readings 152 and 156), as AL1 holds an attribute's form.
 */
const idTextNodes = select(Node, (n) => n.in(textIdentityOf(n.governor), ["ID"]));

/**
 * The IDs an attribute carries: those whose owner is their own element.
 */
const attributeIds = select(DocumentId, (d) => d.eq(d.owner, d.start));

/**
 * The IDs an element's text carries: those bound to another element, its parent.
 */
const textIds = select(DocumentId, (d) => d.ne(d.owner, d.start));

/**
 * The nodes the grammar admits where they stand, whose IDs bind: their parent's family's admission
 * map holds their kind (`#pantry/qti/node.ts` `admitsHere`, the guard decision 440 put in
 * `positioned`). "N5 admitted" refuses every member it is false of.
 */
const admittedNodes = select(Node, admitsHere);

/**
 * The nodes the grammar does not admit where they stand, whose IDs bind nothing.
 */
const unadmittedNodes = select(Node, (n) => n.not(admitsHere(n)));

/**
 * The IDs of admitted elements.
 */
const admittedIds = select(DocumentId, (d) => d.eq(d.admitted, true));

/**
 * The IDs of elements the grammar does not admit where they stand.
 */
const unadmittedIds = select(DocumentId, (d) => d.eq(d.admitted, false));

/**
 * Every element's `xml:lang`, each of whose elements has its {@link CatalogScope}.
 */
const langAttributes = select(Attribute, (a) => a.eq(a.name, "xml:lang"));

/**
 * The IDREF targets of documents in no assembly, each an id of its own document; an assembled
 * document's resolve per instance ({@link PlacedIdref}).
 */
export const unassembledTargets = select(IdrefTarget, (t) => t.eq(t.assembled, false));

/**
 * Every `label` that asks for its tool, the source of {@link LabelUse} (spec reading 128): one of
 * the kinds whose declared type takes its `label` from a characteristic that states the sentence
 * ({@link toolLabelKinds}), the item root's own among them: QTI 3.0.1's §4.1.3 says of the item's
 * `label` "If an item uses labels then values for the associated toolName and toolVersion
 * attributes must also be provided". An `ItemFileInfo`'s label (`qti-digital-material`,
 * `qti-calculator-info`, §5.80.2) and a printed variable's (§7.30.4) are text for a reader, and ask
 * for no tool.
 */
const labelAttributes = attributesOf("label", toolLabelKinds);

/**
 * An item root's `tool-name`, one per item document.
 */
const toolNames = select(Attribute, (a) =>
  a.and(a.eq(a.name, "tool-name"), a.eq(a.kind, itemKind)),
);

/**
 * An item root's `tool-version`, one per item document.
 */
const toolVersions = select(Attribute, (a) =>
  a.and(a.eq(a.name, "tool-version"), a.eq(a.kind, itemKind)),
);

/**
 * The SSML attributes reading 3's laws read (`ssmlReads`), each of whose elements has its
 * {@link SsmlScope}.
 */
const ssmlAttributes = select(Attribute, (a) =>
  a.or(...ssmlReads.map(([name, kinds]) => namedOn(a, name, kinds))),
);

/**
 * The labels Label tools binds: those in a document whose root is an item's.
 */
const itemLabels = select(LabelUse, (l) => l.eq(l.rootKind, itemKind));

/**
 * Every statement over the identity overlays, each `check` named by its oracle law:
 *
 * - **DocumentId:** at most one ID-typed attribute per element (the key over its selection), each
 *   with its row and each attribute row such an attribute's, the way back keyed by that key; each
 *   ID-typed text with its row, bound to the element's parent, and each text row such a text's, the
 *   way back keyed by the element's own key; each ID admitted exactly where its element is
 *   (`E1_derived`). The value of each, the attribute's `value` or the text collapsed, is the query
 *   `IdValue`'s (`#pantry/qti/names.ts`), which no row copies;
 * - **IdentityText:** each element whose text is of an identity type has its row, at its node; its
 *   IDREF tokens concatenating to its text and an ID's none is a rule over a query
 *   (`#pantry/qti/overlay-queries/identity.ts`), as "DocumentId key" over the admitted bindings
 *   is;
 * - **Idref target:** each IDREF token, an attribute's or a text's, names one of its document's
 *   {@link IdrefTarget} rows, each an id an admitted element of its document binds where the
 *   document is in no assembly;
 * - **in place** (spec reading 117): under each instance of each assembly, as many {@link PlacedId}
 *   and {@link PlacedIdref} rows as its document has IDs and IDREF targets, each
 *   {@link PlacedIdref} its document's; each {@link PlacedId} an ID of its document (its value and
 *   owner `IdValue`'s), "DocumentId key" over the assembly's bindings (a fragment's ID distinct
 *   from its item's, and a fragment placed twice in one item holding its IDs twice) and "Idref
 *   target" over them, so an item's IDREF may name its fragment's ID and a fragment's its item's,
 *   are rules over a query;
 * - **CatalogScope:** each `xml:lang`'s element on its scope's row, each scope at a node; a
 *   `qti-catalog-info` its own scope, a root that is none the document node's and every other
 *   element its parent's (`E1_derived`), which read the node's kind and parent, rules over a query
 *   (`#pantry/qti/overlay-queries/identity.ts`);
 * - **R26:** it reads the documents the records name and, in place, the instances of each item's
 *   assembly, so it is a rule over a query (`identityQueryLawsByName`, `#pantry/qti/queries.ts`);
 * - **Reading 3:** each read SSML attribute's element has its {@link SsmlScope}, which places the
 *   attribute in its fragment; each scope at a node; a `speak` its own fragment, a root that is no
 *   `speak` the document node's and every other element its parent's, rules over a query over its
 *   node's kind and parent; and "SSML trim mark" and "SSML lexicon reference", rules over the
 *   fragments' values (`#pantry/qti/overlay-queries/identity.ts`);
 * - **Label tools:** each `label` that asks for its tool copied into its `LabelUse` row and each row
 *   a label's, its root kind its document's, and in an item each label's document one whose root
 *   carries `tool-name` and `tool-version`.
 */
export const identityLawsByName = {
  "DocumentId key": declared("DocumentId key", [
    key(on(idAttributes, "package", "path", "start")),
    contained(
      on(idAttributes, "package", "path", "start"),
      on(DocumentId, "package", "path", "start"),
    ),
    contained(
      on(attributeIds, "package", "path", "start"),
      on(idAttributes, "package", "path", "start"),
    ),
    contained(
      on(idTextNodes, "package", "path", "start", "parent"),
      on(DocumentId, "package", "path", "start", "owner"),
    ),
    contained(on(textIds, "package", "path", "start"), on(idTextNodes, "package", "path", "start")),
  ]),
  "E1 derived": declared("E1 derived", [
    contained(
      on(admittedIds, "package", "path", "start"),
      on(admittedNodes, "package", "path", "start"),
    ),
    contained(
      on(unadmittedIds, "package", "path", "start"),
      on(unadmittedNodes, "package", "path", "start"),
    ),
    contained(
      on(identityNodes, "package", "path", "start"),
      on(IdentityText, "package", "path", "start"),
    ),
    contained(on(IdentityText, "package", "path", "start"), on(Node, "package", "path", "start")),
    ...tokenList(TextIdref, IdentityText, whitespaceTokens(TextIdref)),
    contained(
      on(IdrefTarget, "package", "path", "assembled"),
      on(Document, "package", "path", "assembled"),
    ),
    contained(
      on(ShareFragment, "package", "path", "assembled"),
      on(Document, "package", "path", "assembled"),
    ),
    idrefTargetFamily,
    documentIdFamily,
    placedIdFamily,
    placedIdrefFamily,
    contained(
      on(PlacedId, "package", "assembly", "instance", "path", "assemblyKind"),
      on(Instance, "package", "assembly", "start", "document", "assemblyKind"),
    ),
    contained(
      on(PlacedIdref, "package", "assembly", "instance", "path"),
      on(Instance, "package", "assembly", "start", "document"),
    ),
    contained(
      on(PlacedIdref, "package", "path", "idDigest"),
      on(IdrefTarget, "package", "path", "idDigest"),
    ),
    check("E1_derived", IdrefTarget, (t) => t.eq(t.idDigest, Crypto.sha256(t.id))),
    check("E1_derived", PlacedIdref, (t) => t.eq(t.idDigest, Crypto.sha256(t.id))),
    check("E1_derived", ShareFragment, (t) => t.eq(t.idDigest, Crypto.sha256(t.id))),
    contained(
      on(langAttributes, "package", "path", "start"),
      on(CatalogScope, "package", "path", "start"),
    ),
    contained(on(CatalogScope, "package", "path", "start"), on(Node, "package", "path", "start")),
    contained(
      on(ssmlAttributes, "package", "path", "start"),
      on(SsmlScope, "package", "path", "start"),
    ),
    contained(on(SsmlScope, "package", "path", "start"), on(Node, "package", "path", "start")),
  ]),
  "Idref target": declared("Idref target", [
    contained(
      on(Idref, "package", "path", "tokenDigest"),
      on(IdrefTarget, "package", "path", "idDigest"),
    ),
    contained(
      on(TextIdref, "package", "path", "tokenDigest"),
      on(IdrefTarget, "package", "path", "idDigest"),
    ),
    contained(
      on(ShareFragment, "package", "path", "idDigest"),
      on(IdrefTarget, "package", "path", "idDigest"),
    ),
  ]),
  "Label tools": declared("Label tools", [
    contained(
      on(labelAttributes, "package", "path", "start"),
      on(LabelUse, "package", "path", "start"),
    ),
    contained(
      on(LabelUse, "package", "path", "start"),
      on(labelAttributes, "package", "path", "start"),
    ),
    contained(
      on(LabelUse, "package", "path", "rootKind"),
      on(Document, "package", "path", "rootKind"),
    ),
    key(on(toolNames, "package", "path")),
    key(on(toolVersions, "package", "path")),
    contained(on(itemLabels, "package", "path"), on(toolNames, "package", "path")),
    contained(on(itemLabels, "package", "path"), on(toolVersions, "package", "path")),
  ]),
} as const;

/**
 * {@link identityLawsByName}'s statements in one list, the module's laws as the schema composes
 * them.
 */
export const identityLaws = Object.values(identityLawsByName).flat();
