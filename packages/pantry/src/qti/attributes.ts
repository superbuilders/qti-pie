/**
 * Uniform attributes: every attribute of every element as one row, a closed name's an `Attribute`
 * keyed by its element and its name, an open class's an `OpenAttribute` keyed by its element and
 * its written expanded name, each a counted family under its element, since an element's attributes
 * are a set (Infoset [attributes]); a closed attribute's IDREF tokens as an ordered family under
 * it, each attribute's unexpanded entity references as rows of their own at it, keyed by their
 * offset, and the laws over them (plan §1.5; fin.md §16; the W5 amendment's C1, C3, C6, C7, C9,
 * C14, C18 and C21).
 *
 * An attribute is read under its element's governor, `Node.governor`: the kind itself where its
 * declared type governs it or no named type does, or the (kind, type) pair where an `xsi:type`
 * names a type derived from the declared one, or a simple type governs a foreign element (spec
 * readings 60, 83 and 84; `GoverningOf` of the element's type, `typeGovernorOf` of
 * `#pantry/qti/node.ts`). The governor's attribute model, `AttributeModelOf(governor)`, then gives
 * the name's slot, value domain and use, `AttributeGrammar(model, name)`. `Attribute` and
 * `OpenAttribute` copy `kind` and `governor` from their element along their family's
 * owner axis, so every law below reads its governor inline.
 *
 * - **AL1, admission** (`AL1_admission`, rule `attribute-admission`): the name is one its element's
 *   governor admits, `{name} ⊆ AttributeGrammar.row(model)`, with `{name}` the name's
 *   `Compute.singleton`. It is a named check, not a generated column's NOT NULL: the governor it
 *   reads is `governor`, an accumulated copy, and a generated field's term reads only the fields
 *   its caller writes (grizzle's README, "How a field is written"). An unadmitted name is refused
 *   `invariant-rejected` on the check's own law.
 * - **AL1, the lexical half** (`value_domain`, rule `attribute-lexical`): the lexical form as written
 *   matches its domain's compiled pattern, `ValueDomainOf.at("pattern", domain)`, through grizzle's
 *   `Compute.matches`. A universal domain, whose pattern admits every value (`universalDomains` of
 *   `#pantry/grammar/install.ts`: `xs:anySimpleType`, and `xs:string`, `xs:normalizedString` and
 *   `xs:token` as written), states nothing and is not matched, so the backend's 32-entry regex
 *   cache holds only the patterns that judge something. An empty domain (today `xs:NOTATION`'s,
 *   whose value space is the notations a schema declares, and no pinned XSD declares one, XML
 *   Schema 1.0 Part 2 §3.2.19) holds no value: its pattern is the empty language's, which no text
 *   matches, so a value in one is refused by the match (C47).
 * - **AL2** (C9): `slot` is the singleton of the name's slot, `Compute.singleton(slot)`. It is
 *   written by the host and proved by `E1_derived`, because a generated field reads the caller's
 *   fields alone and `governor` is a copy. The `or` fold over the closed attributes' counted family
 *   ends in `Node.attrs`, which AL3 reads. Distinctness is `Attribute`'s key over `(package, path,
 *   start, name)`: `AttributeGrammar` is keyed `(model, name)` and its slot is injective within a
 *   model (no two names of one model share a slot, over all of its 6,167 rows), and a node has one
 *   governor, so no repeated slot among a node's closed attributes is no repeated name among them.
 *   The injectivity is the grammar's, cited here, not stated as a law: grizzle judges a closed
 *   relation by its one declared key. An open class is one slot for many names, so its attributes
 *   are `OpenAttribute`'s, out of the fold, and two attributes of one class are no repeat (fin.md
 *   §16's `~open`). grizzle emits the empty family's end.
 * - **AL3** (`AL3_required`, a check on `Node`): every slot the element's governor requires is in its
 *   `attrs`.
 * - **AL5** (`AL5_attribute_count`, a check on `Node`, rule `attribute-count`): an element whose
 *   governor's model has an `AttributeCountOf` row carries from `min` to `max` of its `CountedSlot`
 *   attributes, `|attrs ∩ CountedSlot.row(model)|` (spec readings 41 and 43); a model of no count
 *   states nothing. `attrs` holds only the attributes written, so a defaulted one counts nothing.
 * - **AL4** (C14): an `Attribute`'s name is no open class and an `OpenAttribute`'s class is one
 *   (`AL4_open_names`); open names are distinct by expanded name on an element, `OpenAttribute`'s
 *   key `(package, path, start, uri, local)`; and `Foreign_attribute_class` holds each open name's
 *   stored namespace to its class against its element's namespace (XML Schema 1.0 Part 1 §3.10.4);
 *   and `AL4_data_name` holds a `data-*` name to reading 13's language (`dataName` of
 *   `#pantry/vocab/open.ts`, matched by its source) and a no-namespace name of an element that is
 *   not foreign to not begin `data-`; and `AL4_declared_data_name` keeps a `data-*` name from being
 *   a custom one where the element's governor admits it as a declared attribute (goal part E): a
 *   declared name is its closed attribute, never an open name beside or instead of it. An element
 *   an `xsi:type` governs is judged by its governor, the element's `governor`, which its kind and
 *   its named type give.
 * - **The prefix** (`Attribute_prefix`, C54): every attribute keeps the prefix its name is written
 *   with, so the export writes it back byte for byte (spec reading 47), and the prefix agrees with
 *   the namespace its name is in: none for a name in no namespace, `xml` for the XML namespace's,
 *   and a declared one, never `xml` or `xmlns`, for XML Schema's instance names, XLink's and the
 *   namespaced open classes (Namespaces in XML 1.0, §3 and §6.2). Whether the prefix is bound to
 *   that namespace in scope is not stated: no relation holds the bindings in scope at an element.
 * - **IDREF tokens** (C3, with grizzle's `Monoid.concat`): an IDREF or IDREFS attribute's `Idref`
 *   pieces, each a token with the whitespace written around it, concatenate to its lexical form,
 *   and each token after the first follows whitespace, so the tokens are exactly the lexical form's
 *   whitespace-separated tokens; every other attribute has none (`E1_derived`). `Idref target`
 *   (Q5.07) reads the tokens.
 * - **TextDomain** (a check on `Node`, rule `text-copy`): the string value of an element whose
 *   governor reads its text in a domain that is not universal, `Node.stringValue` (Q5.03's
 *   concatenation of its character data), matches that domain's pattern: a foreign element whose
 *   `xsi:type` names `xs:NOTATION`, whose domain's pattern is the empty language's, is refused
 *   whatever its text (spec reading 60). It is stated under Q5.03's own predicate,
 *   `holdsCheckedText`, the one its fold steps under, so the two cannot drift: a universal domain
 *   states nothing, and a checked value past `keyText`'s byte bound is refused by the fold's own
 *   accumulator type.
 *
 * Every check is named by its oracle law (`#pantry/test/oracle.ts` `LawName`) with spaces written
 * as underscores, since a check's name is an identifier; no law name holds an underscore.
 *
 * Coords by shape states nothing here beyond AL1's lexical half over `CoordsDType`: spec reading 59
 * reads coordinates that do not fit their shape by the HTML Standard's image-map processing model,
 * so they are valid.
 */
import {
  accumulated,
  Bits,
  bits,
  check,
  closedId,
  Compute,
  contained,
  counted,
  doubleText,
  drawn,
  fin,
  fold,
  generated,
  Monoid,
  natural,
  on,
  ordered,
  relation,
  select,
  str,
} from "@bjornpagen/grizzle";
import type { RowScalars } from "@bjornpagen/grizzle";
import type { Identity } from "#pantry/grammar/install.ts";
import {
  AttributeCountOf,
  AttributeGrammar,
  AttributeModelOf,
  AttributeName,
  AttributeSlot,
  CountedSlot,
  DoubleBound,
  Governor,
  KindNamespace,
  LeadingMembers,
  NodeKind,
  openElementClasses,
  Required,
  TextDomain,
  ValueDomainOf,
  universalDomains,
  ValueIdentity,
} from "#pantry/grammar/install.ts";
import { namingText, referenceIdentities } from "#pantry/grammar/domains.ts";
import { openClasses } from "#pantry/grammar/kinds.ts";
import { handlePrefixes } from "#pantry/model/xdm.ts";
import { NamespacePrefix, OpenElementName } from "#pantry/qti/chardata.ts";
import {
  EntryPath,
  keyText,
  localNameBytes,
  PackageName,
  namespaceText,
} from "#pantry/qti/limits.ts";
import { Chars, holdsCheckedText, Node } from "#pantry/qti/node.ts";
import { tokenFields, tokenPiece, whitespaceTokens } from "#pantry/qti/token-list.ts";
import { dataName } from "#pantry/vocab/open.ts";

/**
 * A lexical form that names something once collapsed, an NCName with XML whitespace around it
 * (`namingText` of `#pantry/grammar/domains.ts`): a declaration's, a record field's or a test
 * structure's identifier and a dependency's `identifierref` (spec reading 152), and an ID-typed
 * attribute's or text's ID value, `xs:ID` being a restriction of `xs:NCName` (spec reading 156).
 * Any other form names nothing, and its value domain refuses it alone. Every module of the schema
 * reads it here, one pattern.
 */
export const namingPattern = Compute.pattern<string>(namingText);

/**
 * Reading 13's `data-*` names (`dataName` of `#pantry/vocab/open.ts`), as the pattern
 * `Compute.matches` reads, made once from the host's expression's source.
 */
const dataNamePattern = Compute.pattern(dataName.source);

/**
 * An NCName's first character: XML 1.0's `NameStartChar` without the colon.
 *
 * @see {@link https://www.w3.org/TR/xml-names/#NT-NCName | Namespaces in XML 1.0, NCName}
 */
const ncStart =
  "A-Z_a-z\\u{C0}-\\u{D6}\\u{D8}-\\u{F6}\\u{F8}-\\u{2FF}\\u{370}-\\u{37D}\\u{37F}-\\u{1FFF}\\u{200C}-\\u{200D}\\u{2070}-\\u{218F}\\u{2C00}-\\u{2FEF}\\u{3001}-\\u{D7FF}\\u{F900}-\\u{FDCF}\\u{FDF0}-\\u{FFFD}\\u{10000}-\\u{EFFFF}";

/**
 * An NCName's later characters: XML 1.0's `NameChar` without the colon.
 *
 * @see {@link https://www.w3.org/TR/xml/#NT-NameChar | XML 1.0, NameChar}
 */
const ncChar = `\\-.0-9\\u{B7}\\u{300}-\\u{36F}\\u{203F}-\\u{2040}${ncStart}`;

/**
 * An open attribute's local name: an NCName of at most `localNameBytes` UTF-8 bytes
 * (`#pantry/qti/limits.ts`), the bound `(package, path, start, uri, local)` reads it at. Its
 * pattern is read under `su`, which reads an NCName exactly as `u` does (it holds no `.`), so its
 * law, the byte bound's, is no other type's: {@link EntityName} writes the same NCName under `u`,
 * and a refusal names each by its pattern. Exported for `src/import/refusal.ts`, which names its
 * pattern law.
 */
export const OpenLocal = str.bytes(localNameBytes, str.regex(`^[${ncStart}][${ncChar}]*$`, "su"));

/**
 * An entity's name inside an attribute's lexical form: an NCName, since no entity name holds a
 * colon (Namespaces in XML 1.0, §7).
 * Exported for `src/import/refusal.ts`, which names its pattern law.
 */
export const EntityName = str.regex(`^[${ncStart}][${ncChar}]*$`);

/**
 * One attribute of a closed name on an element, keyed by its element and its name: its expanded
 * name is its `AttributeName` handle, so `(package, path, start, name)` is its identity (Namespaces
 * in XML 1.0, §6.3; Infoset [namespace name] and [local name]).
 *
 * Its fields by how each is written:
 *
 * - **the host's:** `package`, `path` and `start`, its element's key, which names its owner in the
 *   counted family; `name` (a closed `AttributeName` handle), `prefix` (the prefix its name is
 *   written with, empty for none, of a declaration's type, since every prefix but `xml` is one a
 *   declaration in scope binds), `lexical` (the record) and `slot` (`{position}` of its name under
 *   its element's governor);
 * - **drawn:** `idrefs`, the count of its `Idref` family;
 * - **accumulated** by grizzle: `kind` and `governor`, its element's, along the owner axis; and
 *   `idrefText`, the end of its `Idref` pieces' concatenation;
 * - **generated** by PostgreSQL: `value`, the lexical form normalized into its value (XML Schema Part
 *   2 §4.3.6), the domain read from its element's `governor` and its name as AL1 reads it, in the
 *   class of the member that holds the form: a union whose members change class (`LeadingMembers`)
 *   normalizes a form its leading members' pattern matches as written in their class, and any other
 *   form in its rest's; every other domain in its one class (`ValueDomainOf`'s `whiteSpace`).
 *   `collapse` strips the whitespace and folds each run to one space, `replace` turns each tab,
 *   line feed and carriage return into a space, and `preserve` keeps it as written. A name its
 *   governor does not admit normalizes nothing, and AL1 refuses it. An assessment object's
 *   `identifier` and `title` are selections of this relation reading `value` (`ObjectIdentifier`
 *   and `objectTitles` of `#pantry/qti/queries.ts`), and so are the manifest's and each resource's
 *   `identifier` and a resource's type code (`manifestIdentifiers` and `resourceIdentifiers` of
 *   `#pantry/qti/overlay-queries/package.ts`, `resourceTypes` of `#pantry/qti/queries.ts`) and a
 *   declaration's name, cardinality and base type and a value's field and base type
 *   (`#pantry/qti/names.ts`, `#pantry/qti/overlay-queries/declaration.ts`). The rows that still
 *   copy an attribute's lexical form (C18) are of five kinds, each for its reason: a row that reads
 *   its value by a pattern, which a query matches over `value` only under grizzle's byte guard, so
 *   it waits for the guard (`InteractionAttribute`, `RoundingFigures`, `CnAttribute`, `MathAction`,
 *   `MasteryValue`, `NormalMinimum` and `NormalMaximum`, each held to its attribute by a statement
 *   `keyCopies` reads off the schema, `#pantry/test/key-copies.ts`); a typed value that a rule over
 *   a query matches, within the bytes a match reads (the rows of type `attributeValueText`,
 *   `#pantry/qti/mapping.ts`); a name, in a relation whose rows `namedBy` decides
 *   (`#pantry/import/names.ts`, whose doc lists them); a collapsed name or ID a key holds, since a
 *   query collapses no unbounded text (Q19): `Choice`'s, `Hottext`'s and `StimulusRef`'s
 *   `identifier` and `TableHeader`'s and `CatalogId`'s `id`, each held to its attribute's value
 *   through `InteractionAttribute`'s copy or by a rule over a query, past the first hop `keyCopies`
 *   reads; and a copy of another row's copy, which the cut-over records for later. No law of `Qti`
 *   reads whether its lexical form is an address. The package-media level states those laws as row
 *   checks over this relation (`#pantry/qti/media.ts`), installed on its table only where the level
 *   is.
 */
export const Attribute = relation.generated(
  "Attribute",
  {
    governor: accumulated(closedId(Governor), "document"),
    idrefText: accumulated(keyText, ""),
    idrefs: drawn(natural),
    kind: accumulated(closedId(NodeKind), "document"),
    lexical: Chars,
    name: closedId(AttributeName),
    package: PackageName,
    path: EntryPath,
    prefix: NamespacePrefix,
    slot: bits(AttributeSlot),
    start: natural,
  },
  ["package", "path", "start", "name"],
  (a) => {
    const domain = AttributeGrammar.at("domain", AttributeModelOf.at("model", a.governor), a.name);
    const leading = Compute.and(
      LeadingMembers.has(domain),
      Compute.matches(a.lexical, LeadingMembers.at("pattern", domain)),
    );
    const leadingClass = LeadingMembers.at("whiteSpace", domain);
    const normalized = (whiteSpace: typeof leadingClass) =>
      Compute.cond(
        Compute.eq(whiteSpace, "collapse"),
        Compute.collapse(a.lexical),
        Compute.cond(
          Compute.eq(whiteSpace, "replace"),
          Compute.replaceWhitespace(a.lexical),
          a.lexical,
        ),
      );

    return {
      value: generated(
        Chars,
        Compute.cond(
          leading,
          normalized(leadingClass),
          Compute.cond(
            ValueDomainOf.has(domain),
            normalized(ValueDomainOf.at("whiteSpace", domain)),
            a.lexical,
          ),
        ),
      ),
    };
  },
);

/**
 * One attribute of an open class on an element (fin.md D2, C14), keyed by its element and its
 * expanded name as written, `(uri, local)`: an open class's handle names many attributes (`data-a`
 * and `data-b` share `data-*`), so the written name is its identity.
 *
 * - **the host's:** `package`, `path` and `start`, its element's key; `class`, the open class its
 *   name falls in; `local` and `uri`, its local name and namespace name as written (an empty
 *   namespace for `data-*` and `no-namespace`); `prefix`, `lexical` and `slot`, as a closed
 *   attribute's; and `elementNamespace`, its element's namespace name, which the class is read
 *   against;
 * - **accumulated** along the owner axis: its element's `kind` and `governor`, by which
 *   `AL4_declared_data_name` reads its attribute model.
 */
export const OpenAttribute = relation(
  "OpenAttribute",
  {
    class: closedId(AttributeName),
    elementNamespace: namespaceText,
    governor: accumulated(closedId(Governor), "document"),
    kind: accumulated(closedId(NodeKind), "document"),
    lexical: Chars,
    local: OpenLocal,
    package: PackageName,
    path: EntryPath,
    prefix: NamespacePrefix,
    slot: bits(AttributeSlot),
    start: natural,
    uri: namespaceText,
  },
  ["package", "path", "start", "uri", "local"],
);

/**
 * One IDREF token of an attribute whose domain is an `xs:IDREF` or `xs:IDREFS` (C3), in order, with
 * the whitespace written before and after it, so its `piece` is a stretch of the lexical form and
 * the pieces concatenate to it: a whitespace list's token (`#pantry/qti/token-list.ts`). An IDREFS
 * value is an `xs:list`, an ordered sequence of tokens, so its order is kept. Only a closed
 * attribute's domain is an IDREF's. `Idref target` (Q5.07) compares the token with a document's ids
 * across rows.
 *
 * Its family's group is `package`, `path`, `start` and `name`, its attribute's key, which the
 * nesting supplies: an element carries several IDREF attributes. So it is stated here, over the
 * token list's fields, piece and check, and not through `tokenList`, whose owner is keyed by its
 * element alone.
 */
export const Idref = relation.generated(
  "Idref",
  {
    after: tokenFields.after,
    at: tokenFields.at,
    before: tokenFields.before,
    name: closedId(AttributeName),
    package: PackageName,
    path: EntryPath,
    piecesAfter: tokenFields.piecesAfter,
    piecesWas: tokenFields.piecesWas,
    start: natural,
    token: tokenFields.token,
  },
  ["package", "path", "start", "name", "at"],
  (i) => tokenPiece(i),
);

/**
 * One unexpanded entity reference inside a closed attribute's lexical form (plan §1.4), keyed by
 * its attribute and its offset: the entity's name, `entity`, and the offset of its `&` in the
 * lexical form, which keeps it as `&entity;`. The offset is the reference's place in the value, so
 * no other order is stored.
 */
export const AttributeEntity = relation(
  "AttributeEntity",
  {
    entity: EntityName,
    name: closedId(AttributeName),
    offset: natural,
    package: PackageName,
    path: EntryPath,
    start: natural,
  },
  ["package", "path", "start", "name", "offset"],
);

/**
 * One unexpanded entity reference inside an open attribute's lexical form, keyed by its attribute
 * and its offset, as {@link AttributeEntity} is a closed attribute's.
 */
export const OpenAttributeEntity = relation(
  "OpenAttributeEntity",
  {
    entity: EntityName,
    local: OpenLocal,
    offset: natural,
    package: PackageName,
    path: EntryPath,
    start: natural,
    uri: namespaceText,
  },
  ["package", "path", "start", "uri", "local", "offset"],
);

/**
 * Each element's closed attributes, a set counted by `Node.attributes`.
 */
export const attributeFamily = counted(
  on(Attribute, "package", "path", "start"),
  fin(Node, "attributes"),
);

/**
 * Each element's open-class attributes, a set counted by `Node.openAttributes`.
 */
const openAttributeFamily = counted(
  on(OpenAttribute, "package", "path", "start"),
  fin(Node, "openAttributes"),
);

/**
 * Each IDREF or IDREFS attribute's tokens in order, counted by `Attribute.idrefs`.
 */
const idrefFamily = ordered(
  on(Idref, "package", "path", "start", "name", "at"),
  fin(Attribute, "idrefs"),
);

/**
 * The data- names the schemas declare as closed attributes: every `AttributeName` handle that
 * begins `data-`, but the open class `data-*`.
 */
const declaredDataNames = AttributeName.handles.filter(
  (name) => name.startsWith("data-") && name !== "data-*",
);

/**
 * An `Attribute` row as a row check or a selection reads it.
 */
type AttributeRow = RowScalars<typeof Attribute>;

/**
 * State that an element carries a closed attribute: the name's slot under its governor is in its
 * `attrs`, the fold of its attributes' slots (AL2), as AL3 reads a required one.
 *
 * A caller asks it of kinds that declare the name under their one governor, so
 * the read is total where its check asks it; elsewhere the check's kind disjunct holds first.
 *
 * @param n - The row.
 * @param name - The attribute's name.
 * @returns The predicate.
 */
export const carries = (n: RowScalars<typeof Node>, name: (typeof AttributeName.handles)[number]) =>
  n.eq(
    Compute.subset(
      Compute.singleton(
        AttributeGrammar.at("slot", AttributeModelOf.at("model", n.governor), name),
      ),
      n.attrs,
    ),
    true,
  );

/**
 * The kinds of the elements an attribute selection reads.
 */
export type SelectedKinds = readonly (typeof NodeKind.handles)[number][];

/**
 * State that an attribute is of one name on an element of one of some kinds: the one statement of
 * an attribute selection in a law of the stored level, {@link attributesOf}'s, and the statement
 * each selection that narrows it further (by its lexical form, or its element's document) builds
 * on. The kind is a membership, `in`, even of one kind. grizzle names a law, and the columns and
 * indexes it adds, by its selection's canonical conjuncts (its engine's `schema/own.ts`), where a
 * membership of one value is no equality, so a selection of one kind written `a.eq(a.kind, kind)`
 * keeps its own statement until grizzle reads the two alike: moved here, its keys and foreign keys
 * would be rebuilt under new names for no change of meaning.
 *
 * @param a - The row.
 * @param name - The attribute's name.
 * @param kinds - The elements' kinds.
 * @returns The predicate.
 */
export const namedOn = (
  a: AttributeRow,
  name: (typeof AttributeName.handles)[number],
  kinds: SelectedKinds,
) => a.and(a.eq(a.name, name), a.in(a.kind, kinds));

/**
 * Select the attributes of one name on the elements of some kinds ({@link namedOn}), as a law of
 * the stored level reads them, any text among them as written (a check may match it by any
 * pattern). The selection fixes the name, so `Attribute`'s key, `(package, path, start, name)`,
 * keys it at its element's place, and an index over that place serves a containment's probe into
 * or out of it with no index holding `lexical`. A rule over a query reads the same attributes'
 * `value` through `attributeValues` (`#pantry/qti/names.ts`).
 *
 * @param name - The attribute's name.
 * @param kinds - The elements' kinds.
 * @returns The selection.
 */
export const attributesOf = (name: (typeof AttributeName.handles)[number], kinds: SelectedKinds) =>
  select(Attribute, (a) => namedOn(a, name, kinds));

/**
 * An `OpenAttribute` row as a row check or a selection reads it.
 */
type OpenAttributeRow = RowScalars<typeof OpenAttribute>;

/**
 * What an attribute's domain is read by: its name, and its element's governor, which an
 * `Attribute` row holds.
 */
type NamedRow = Pick<AttributeRow, "governor" | "name">;

/**
 * Read the attribute model of an element's governor (`AttributeModelOf`, total): the model its
 * attributes, closed and open, are read under.
 *
 * @param governor - The element's governor.
 * @returns The closed read.
 */
const modelOf = (governor: Parameters<typeof AttributeModelOf.at>[1]) =>
  AttributeModelOf.at("model", governor);

/**
 * Read an attribute's attribute model: its element's governor's.
 *
 * @param a - The row.
 * @returns The closed read.
 */
const attributeModelOf = (a: NamedRow) => modelOf(a.governor);

/**
 * Read an open attribute's attribute model: its element's governor's.
 *
 * @param o - The row.
 * @returns The closed read.
 */
const openModelOf = (o: OpenAttributeRow) => modelOf(o.governor);

/**
 * Read an admitted attribute's slot under its element's governor (`AttributeGrammar`).
 *
 * @param a - The row.
 * @returns The closed read, absent for an unadmitted name.
 */
const slotOf = (a: NamedRow) => AttributeGrammar.at("slot", attributeModelOf(a), a.name);

/**
 * State that an attribute's name is one its element's governor admits: the singleton of the name
 * inside `AttributeGrammar`'s row of names for the governor's model. It reads no NULL where the
 * name is unadmitted, so it is the admission law itself, not a closed read's absence. Exported for
 * `#pantry/qti/media.ts`, whose laws read an admitted attribute's domain.
 *
 * @param a - The row.
 * @returns The predicate.
 */
export const admitted = (a: AttributeRow) =>
  a.eq(Compute.subset(Compute.singleton(a.name), AttributeGrammar.row(attributeModelOf(a))), true);

/**
 * State that an open attribute's class is one its element's governor admits, as {@link admitted}
 * states it of a closed name.
 *
 * @param o - The row.
 * @returns The predicate.
 */
const openAdmitted = (o: OpenAttributeRow) =>
  o.eq(Compute.subset(Compute.singleton(o.class), AttributeGrammar.row(openModelOf(o))), true);

/**
 * Read an admitted attribute's value domain under its element's governor. Exported for
 * `#pantry/qti/media.ts`, whose laws read it.
 *
 * @param a - The row.
 * @returns The closed read, absent for an unadmitted name.
 */
export const domainOf = (a: NamedRow) => AttributeGrammar.at("domain", attributeModelOf(a), a.name);

/**
 * Read an admitted open attribute's value domain: its class's under its element's governor.
 *
 * @param o - The row.
 * @returns The closed read, absent for an unadmitted class.
 */
const openDomainOf = (o: OpenAttributeRow) =>
  AttributeGrammar.at("domain", openModelOf(o), o.class);

/**
 * State that an attribute's domain is of one of `identities` (`ID`, `IDREF`, `IDREFS`): its domain
 * has a `ValueIdentity` row naming one of them. A name its element's governor does not admit has no
 * domain and a domain of no identity no `ValueIdentity` row, so the statement is false of either.
 *
 * @param a - The row.
 * @param identities - The identity types.
 * @returns The predicate.
 */
export const identityIn = (
  a: AttributeRow,
  identities: readonly (typeof Identity.handles)[number][],
) =>
  a.and(
    ValueIdentity.has(domainOf(a)),
    a.in(ValueIdentity.at("identity", domainOf(a)), identities),
  );

/**
 * State that an attribute's domain is an `xs:IDREF` or `xs:IDREFS` one, whose tokens are `Idref`
 * rows.
 *
 * @param a - The row.
 * @returns The predicate.
 */
const carriesIdrefs = (a: AttributeRow) => identityIn(a, referenceIdentities);

/**
 * The closed `AttributeName` handles whose names are in a namespace with a handle prefix
 * (`handlePrefixes` of `#pantry/model/xdm.ts`), by that prefix: a handle spells its namespace by
 * it.
 *
 * @param prefix - The handle prefix.
 * @returns The handles that begin with it and its colon.
 */
const handlesUnder = (prefix: (typeof handlePrefixes)[number]["prefix"]) =>
  AttributeName.handles.filter((handle) => handle.startsWith(`${prefix}:`));

/**
 * The names in the XML namespace, which is bound to `xml` and to no other prefix (Namespaces in XML
 * 1.0, §3): `xml.xsd`'s four.
 */
const xmlNames = handlesUnder("xml");

/**
 * The closed names in a namespace a document binds a prefix of its own choosing to: XML Schema's
 * instance names and XLink's.
 */
const boundNames = handlePrefixes.flatMap(({ prefix }) =>
  prefix === "xml" ? [] : handlesUnder(prefix),
);

/**
 * The open classes of a name in a namespace, its element's or another, each written with a prefix
 * a document binds.
 */
const boundClasses = ["own-namespace", "foreign"] as const;

/**
 * The prefixes no attribute in a namespace other than the XML namespace is written with: none,
 * which leaves a name in no namespace (§6.2); `xml`, bound to the XML namespace alone; and `xmlns`,
 * which only declares a binding (Namespaces in XML 1.0, §3).
 */
const unboundPrefixes = ["", "xml", "xmlns"];

/**
 * A `Node` row as a row check reads it.
 */
type NodeRow = RowScalars<typeof Node>;

/**
 * Read the domain an element's governor reads its text in (`TextDomain`), absent for a governor
 * with no simple content, whose text no law reads in a domain ({@link holdsCheckedText} is false of
 * it).
 *
 * @param n - The row.
 * @returns The closed read.
 */
const textDomainOf = (n: NodeRow) => TextDomain.at("domain", n.governor);

/**
 * Every statement over the attribute layer, each `check` named by its oracle law:
 *
 * - The five families;
 * - **AL1 owner:** a closed or an open attribute's copy of its element's kind and governing type,
 *   each riding its counted family's owner axis;
 * - **AL1** admission and its lexical half, **E1** the written slot and the IDREF tokens' agreement,
 *   **AL2** the fold, **AL3** required, **AL4** open names and the foreign attribute class, **AL5**
 *   the attribute count, the prefix, and **TextDomain**, as the module's header states them. AL2's
 *   distinctness and AL4's open name key are `Attribute`'s and `OpenAttribute`'s primary keys;
 * - **Double bound** (reading 144): an admitted attribute's, or a checked element text's, value in a
 *   bounded domain's lexical space is judged by the domain's `DoubleBound` on the double PostgreSQL
 *   reads from its collapsed form by grizzle's `Compute.parseDouble`, XML Schema 1.1's
 *   doubleLexicalMap (Part 2 §3.3.5.2): the decimal rounded once to the nearest double, ties to
 *   even, an overflow an infinity of its sign and an underflow a zero of its sign, `-0` equal to 0.
 *   The domain's lexical space lies inside grizzle's `doubleText`, so the match the parse's guard
 *   restates holds of every value the check judges, and no row holds the guard's third argument. No
 *   row holds the value: the check reads it from the lexical form it judges.
 */
export const attributeLawsByName = {
  "AL1 admission": [
    check("AL1_admission", Attribute, admitted),
    check("AL1_admission", OpenAttribute, openAdmitted),
  ],
  "AL1 owner": [
    contained(
      on(Attribute, "package", "path", "start", "kind", "governor"),
      on(Node, "package", "path", "start", "kind", "governor"),
    ),
    contained(
      on(OpenAttribute, "package", "path", "start", "kind", "governor"),
      on(Node, "package", "path", "start", "kind", "governor"),
    ),
  ],
  "AL2 count": [attributeFamily, openAttributeFamily],
  "AL2 fold": [
    fold(
      attributeFamily,
      Monoid.or,
      on(Attribute, "package", "path", "start", "slot"),
      on(Node, "package", "path", "start", "attrs"),
    ),
  ],
  "AL3 required": [
    check("AL3_required", Node, (n) =>
      n.eq(Compute.subset(Required.row(AttributeModelOf.at("model", n.governor)), n.attrs), true),
    ),
  ],
  "AL4 data name": [
    check("AL4_data_name", OpenAttribute, (o) =>
      o.and(
        o.or(o.ne(o.class, "data-*"), Compute.matches(o.local, dataNamePattern)),
        o.or(
          o.ne(o.class, "no-namespace"),
          o.in(o.kind, openElementClasses),
          o.eq(Compute.startsWith(o.local, "data-"), false),
        ),
      ),
    ),
  ],
  "AL4 declared data name": [
    check("AL4_declared_data_name", OpenAttribute, (o) =>
      o.or(
        o.ne(o.class, "data-*"),
        o.and(
          ...declaredDataNames.map((name) =>
            o.or(
              o.ne(o.local, name),
              o.eq(
                Compute.disjoint(
                  AttributeGrammar.row(openModelOf(o)),
                  Bits.of(AttributeName, [name]),
                ),
                true,
              ),
            ),
          ),
        ),
      ),
    ),
  ],
  "AL4 open names": [
    check("AL4_open_names", Attribute, (a) => a.not(a.in(a.name, openClasses))),
    check("AL4_open_names", OpenAttribute, (o) => o.in(o.class, openClasses)),
  ],
  "AL5 attribute count": [
    check("AL5_attribute_count", Node, (n) => {
      const model = AttributeModelOf.at("model", n.governor);
      // attrs ∩ counted, written attrs ∖ (attrs ∖ counted): the same set, in the algebra the host
      // judge reads (`#pantry/test/key-copies.ts` `computers`), which holds no intersection.
      const held = Compute.cardinality(
        Compute.difference(n.attrs, Compute.difference(n.attrs, CountedSlot.row(model))),
      );

      return n.or(
        n.not(AttributeCountOf.has(model)),
        n.and(
          n.ge(held, AttributeCountOf.at("min", model)),
          n.le(held, AttributeCountOf.at("max", model)),
        ),
      );
    }),
  ],
  "Attribute prefix": [
    check("Attribute_prefix", Attribute, (a) =>
      a.or(
        a.and(a.in(a.name, xmlNames), a.eq(a.prefix, "xml")),
        a.and(a.in(a.name, boundNames), a.not(a.in(a.prefix, unboundPrefixes))),
        a.and(a.not(a.in(a.name, [...xmlNames, ...boundNames])), a.eq(a.prefix, "")),
      ),
    ),
    check("Attribute_prefix", OpenAttribute, (o) =>
      o.or(
        o.and(o.in(o.class, boundClasses), o.not(o.in(o.prefix, unboundPrefixes))),
        o.and(o.not(o.in(o.class, boundClasses)), o.eq(o.prefix, "")),
      ),
    ),
  ],
  "AttributeEntity owner": [
    contained(
      on(AttributeEntity, "package", "path", "start", "name"),
      on(Attribute, "package", "path", "start", "name"),
    ),
    contained(
      on(OpenAttributeEntity, "package", "path", "start", "uri", "local"),
      on(OpenAttribute, "package", "path", "start", "uri", "local"),
    ),
  ],
  "Double bound": [
    check("Double_bound", Attribute, (a) => {
      const domain = domainOf(a);
      const form = Compute.collapse(a.lexical);
      const value = Compute.when(
        Compute.matches(form, doubleText),
        (double) => Compute.parseDouble(double),
        0,
      );

      return a.or(
        a.not(
          a.and(
            admitted(a),
            DoubleBound.has(domain),
            Compute.matches(a.lexical, ValueDomainOf.at("pattern", domain)),
          ),
        ),
        a.and(
          Compute.matches(form, doubleText),
          a.or(
            a.and(
              a.eq(DoubleBound.at("facet", domain), "minInclusive"),
              a.ge(value, DoubleBound.at("value", domain)),
            ),
            a.and(
              a.eq(DoubleBound.at("facet", domain), "minExclusive"),
              a.gt(value, DoubleBound.at("value", domain)),
            ),
          ),
        ),
      );
    }),
    check("Double_bound", OpenAttribute, (o) => {
      const domain = openDomainOf(o);
      const form = Compute.collapse(o.lexical);
      const value = Compute.when(
        Compute.matches(form, doubleText),
        (double) => Compute.parseDouble(double),
        0,
      );

      return o.or(
        o.not(
          o.and(
            openAdmitted(o),
            DoubleBound.has(domain),
            Compute.matches(o.lexical, ValueDomainOf.at("pattern", domain)),
          ),
        ),
        o.and(
          Compute.matches(form, doubleText),
          o.or(
            o.and(
              o.eq(DoubleBound.at("facet", domain), "minInclusive"),
              o.ge(value, DoubleBound.at("value", domain)),
            ),
            o.and(
              o.eq(DoubleBound.at("facet", domain), "minExclusive"),
              o.gt(value, DoubleBound.at("value", domain)),
            ),
          ),
        ),
      );
    }),
    check("Double_bound", Node, (n) => {
      const domain = textDomainOf(n);
      const form = Compute.collapse(n.stringValue);
      const value = Compute.when(
        Compute.matches(form, doubleText),
        (double) => Compute.parseDouble(double),
        0,
      );

      return n.or(
        n.not(
          n.and(
            holdsCheckedText(n),
            DoubleBound.has(domain),
            Compute.matches(n.stringValue, ValueDomainOf.at("pattern", domain)),
          ),
        ),
        n.and(
          Compute.matches(form, doubleText),
          n.or(
            n.and(
              n.eq(DoubleBound.at("facet", domain), "minInclusive"),
              n.ge(value, DoubleBound.at("value", domain)),
            ),
            n.and(
              n.eq(DoubleBound.at("facet", domain), "minExclusive"),
              n.gt(value, DoubleBound.at("value", domain)),
            ),
          ),
        ),
      );
    }),
  ],
  "E1 derived": [
    idrefFamily,
    check("E1_derived", Attribute, (a) =>
      a.or(
        a.not(admitted(a)),
        a.and(
          a.eq(a.slot, Compute.singleton(slotOf(a))),
          a.or(
            a.and(carriesIdrefs(a), a.eq(a.lexical, a.idrefText)),
            a.and(a.not(carriesIdrefs(a)), a.eq(a.idrefs, 0n)),
          ),
        ),
      ),
    ),
    check("E1_derived", OpenAttribute, (o) =>
      o.or(
        o.not(openAdmitted(o)),
        o.eq(o.slot, Compute.singleton(AttributeGrammar.at("slot", openModelOf(o), o.class))),
      ),
    ),
    fold(
      idrefFamily,
      Monoid.concat,
      on(Idref, "package", "path", "start", "name", "piece", "piecesWas", "piecesAfter"),
      on(Attribute, "package", "path", "start", "name", "idrefText"),
    ),
    whitespaceTokens(Idref),
  ],
  "Foreign attribute class": [
    check("Foreign_attribute_class", OpenAttribute, (o) =>
      o.and(
        o.or(
          o.and(o.in(o.class, ["data-*", "no-namespace"]), o.eq(o.uri, "")),
          o.and(o.eq(o.class, "own-namespace"), o.ne(o.uri, ""), o.eq(o.uri, o.elementNamespace)),
          o.and(o.eq(o.class, "foreign"), o.ne(o.uri, ""), o.ne(o.uri, o.elementNamespace)),
        ),
        o.or(
          o.in(o.kind, openElementClasses),
          o.eq(o.elementNamespace, KindNamespace.at("namespace", o.kind)),
        ),
      ),
    ),
    contained(
      on(
        select(OpenAttribute, (o) => o.in(o.kind, openElementClasses)),
        "package",
        "path",
        "start",
        "elementNamespace",
      ),
      on(OpenElementName, "package", "path", "start", "namespace"),
    ),
  ],
  TextDomain: [
    check("TextDomain", Node, (n) =>
      n.or(
        n.not(holdsCheckedText(n)),
        Compute.matches(n.stringValue, ValueDomainOf.at("pattern", textDomainOf(n))),
      ),
    ),
  ],
  "value domain": [
    check("value_domain", Attribute, (a) =>
      a.or(
        a.not(admitted(a)),
        a.in(domainOf(a), universalDomains),
        Compute.matches(a.lexical, ValueDomainOf.at("pattern", domainOf(a))),
      ),
    ),
    check("value_domain", OpenAttribute, (o) =>
      o.or(
        o.not(openAdmitted(o)),
        o.in(openDomainOf(o), universalDomains),
        Compute.matches(o.lexical, ValueDomainOf.at("pattern", openDomainOf(o))),
      ),
    ),
  ],
} as const;

/**
 * {@link attributeLawsByName}'s statements in one list, the module's laws as the schema composes
 * them.
 */
export const attributeLaws = Object.values(attributeLawsByName).flat();

/**
 * `attributes.ts`'s relations: every attribute, its IDREF tokens, its entity references and its
 * open name.
 */
export const attributeRelations = [
  Attribute,
  AttributeEntity,
  Idref,
  OpenAttribute,
  OpenAttributeEntity,
] as const;
