/**
 * The relational XDM: every node of every document as one `Node` row, the document node its tree's
 * root, and the laws that make each document's rows one tree in document order whose content is its
 * vocabularies' (plan §1.3, N1 to N12; `docs/rfc/trees.md`; the W5 amendment's C5, C8, C10 to C13,
 * C15, C21, C22 and C25).
 *
 * `Node` is `tree(on(Node, "parent", "at"), fin(Node, "children"), { root: ["package", "path"] })`,
 * keyed by its document and its place there, `(package, path, start)`: grizzle draws each row's
 * slot, count, pre-order interval `[start, end)` and `parent`, its parent's `start`, from the
 * nesting its writer sends, and its natives (T0 to T6, the root pin) make each document's rows one
 * tree. A node's identity is QTI's own: its document's package and path, and its position in
 * document order, which no import mints. Every other law here rides one of the tree's three
 * foreign keys or is a row CHECK:
 *
 * - The owner axis carries the parent copies (N3): `kind`, `governor`, `ancestry`, `nearest`,
 *   `nearestKind` and `parentKind` into `parentKind`, `parentGovernor`, `parentAncestry`,
 *   `parentNearest`, `parentNearestKind` and `parentParentKind`;
 * - The predecessor axis carries the content automaton's state into `was` (N5), and each fold's
 *   running value;
 * - The last axis carries the last child's state into `lastState` (N7), and each fold's end.
 *
 * Three facts of grizzle at the pinned commit shape the statements (each is in the slice report):
 *
 * - A containment rides a tree axis only when its member side selects the tree's members,
 *   `select(Node, start > 0)`, and its owner side, on the last axis, selects nothing
 *   (`analysis/theory/families.ts` `axisShapes`, `selectsMembers`). The owner axis's foreign key
 *   leaves the root out, whose copies hold their starts.
 * - A generated field may read an accumulated one, which PostgreSQL computes after grizzle fills it:
 *   the string value fold's running texts' digests are generated from the texts. `ancestry`, which
 *   reads `parentAncestry`, is written by the host and proved by a row check, as `state` is (C5):
 *   the document node's is its Document's context, from outside its tree (spec reading
 *   `fragment-placement`), and grizzle pins a root's copies at their start, so no generation over
 *   the row gives it.
 * - A check is named by an identifier, so each is named by its oracle law with spaces written as
 *   underscores (`N1_sentinel` for "N1 sentinel"); no law name holds an underscore.
 */
import {
  accumulated,
  bits,
  Bits,
  check,
  closedId,
  contained,
  Crypto,
  drawn,
  fin,
  fold,
  generated,
  key,
  law,
  Logic,
  Monoid,
  on,
  pred,
  relation,
  select,
  sha256,
  str,
  Text,
  tree,
} from "@bjornpagen/grizzle";
import type { RowScalars } from "@bjornpagen/grizzle";
import {
  AdmissionIn,
  AnonymousType,
  AttributeSlot,
  Banned,
  BarredOf,
  Capped,
  Chars,
  CheckedText,
  ContentModelOf,
  CountedMax,
  CountedOf,
  Enters,
  Flag,
  FollowMember,
  FollowSetOf,
  GoverningOf,
  Governor,
  KindGovernor,
  Needs,
  NodeKind,
  Position,
  SharedModelOf,
  SymbolMember,
  SymbolSetOf,
  TypeName,
  XsiType,
  interactionKinds,
  natural,
  nonElementKinds,
  openElementClasses,
} from "#pantry/grammar/install.ts";
import { manifestPath } from "#pantry/vocab/terms/package.ts";
import { EntryPath, matchedText, PackageName } from "#pantry/qti/limits.ts";
import { declared } from "#pantry/qti/law-entries.ts";
import { entryOf } from "#pantry/vocab/laws.ts";

/**
 * The first characters of an XML Namespaces NCName: XML 1.0's NameStartChar without the colon,
 * the ranges XML 1.0 lists.
 *
 * @see {@link https://www.w3.org/TR/xml-names/#NT-NCName | Namespaces in XML 1.0, NCName}
 */
const ncNameStart = "A-Z_a-zÀ-ÖØ-öø-˿Ͱ-ͽͿ-῿‌-‍⁰-↏Ⰰ-⿯、-퟿豈-﷏ﷰ-�\\u{10000}-\\u{EFFFF}";

/**
 * The later characters of an NCName: its start characters and XML 1.0's NameChar additions.
 */
const ncNameContinuation = `${ncNameStart}\\-.0-9·̀-ͯ‿-⁀`;

/**
 * An element's prefix as written: an NCName, or the empty string for an unprefixed name, of any
 * length, as a namespace declaration's prefix is (`NamespacePrefix`, `#pantry/qti/chardata.ts`),
 * so one language holds both: Namespaces in XML 1.0 puts no bound on a prefix (§4), and no index
 * orders by one.
 */
const prefixPattern = `^(?:[${ncNameStart}][${ncNameContinuation}]*)?$`;

/**
 * The text type of an element's prefix: {@link prefixPattern}, of any length. Exported for
 * `src/import/refusal.ts`, which names its pattern law.
 */
export const Prefix = law(entryOf("XML production"), str.regex(prefixPattern));

/**
 * The type of a node's first or last character: one code point, or the empty string where the node
 * holds no characters. A law can read a text's end only on the text's own row, since `chars` is
 * unbounded and fits no key; one code point fits every key, so the ends are what a law over a
 * node's neighbours compares (`#pantry/qti/overlay-queries/quotation.ts`, spec reading
 * `quotation-around-q`). Exported for `src/import/refusal.ts`, which names its pattern law.
 */
export const EndCharacter = law(entryOf("E1 derived"), str.regex("^.?$", "su"));

/**
 * One node of a document: an element, a run of character data, a comment, an instruction, an entity
 * reference, the doctype or the document node itself.
 *
 * Its fields by how each is written (§C):
 *
 * - **the tree's root fields:** `package` and `path`, its document's, which only the root states and
 *   grizzle fills on every member;
 * - **the host's:** `kind`, `governor` (what its attributes and text are read under: its kind's own
 *   `Governor` handle where no named type governs it, else `GoverningOf`'s of its
 *   {@link ElementType} or `OpenElementType`), `prefix`, `nearest` and `nearestPath` (its nearest
 *   interaction, or its document node where none is above it: the element's position and the path
 *   of the document it is in, its own, or, where the chain reaches its document node, its
 *   document's context's, `Document.contextPath`, an element of another file named as rule 3 names
 *   one), `nearestKind`, `state` (its content-automaton state, from `placedStep`), `ancestry`
 *   (`parentAncestry ∪ Enters(kind)`), `chars` (a text or whitespace node's characters, an entity
 *   reference's `&name;`, empty elsewhere: the string value fold's step), and `first` and `last`
 *   (the first and last code points of its `chars`, empty where `chars` is);
 * - **drawn:** `at`, `children`, `start` (its position in document order, the document node's 0),
 *   `end`, `parent` (its parent's `start`, the root's its own, 0), and the counts of its closed and
 *   open attributes, whose families carry the copies and the `attrs` fold their laws read;
 * - **accumulated** by grizzle along the tree's axes: the parent copies (`parentParentKind` the
 *   parent's own `parentKind`, so a member's string value can be selected by its grandparent, as
 *   {@link copiedLangStringText} is), `was` and `lastState`, and each fold's values: `elementsWas`,
 *   `elements` and `elementChildren`; `countedChildren` and `barredChildren`; `charsWas`,
 *   `charsAfter` and `stringValue`; and `attrs`, the end of the attribute family's fold (AL2);
 * - **generated** by PostgreSQL: `charsWasDigest`, `charsAfterDigest` and `stringValueDigest`, the
 *   SHA-256 digests of the string value fold's running texts and end, which its axes carry in their
 *   places ({@link stringValueFold}).
 *
 * Its document's type is no field of it: it is its `Document`'s alone (`#pantry/qti/chardata.ts`),
 * which a law reads by matching `Document` at the node's `(package, path)` (decision S3).
 *
 * Its fields are declared in key order, which the lint's `sort-keys` holds and which is column
 * order, the generated ones after the rest.
 */
export const Node = law(
  entryOf("Node key"),
  relation.generated(
    "Node",
    {
      ancestry: bits(Flag),
      at: drawn(natural),
      attributes: drawn(natural),
      attrs: accumulated(bits(AttributeSlot), Bits.of(AttributeSlot, [])),
      barredChildren: accumulated(natural, 0n),
      chars: Chars,
      charsAfter: accumulated(matchedText, ""),
      charsWas: accumulated(matchedText, ""),
      children: drawn(natural),
      countedChildren: accumulated(natural, 0n),
      elementChildren: accumulated(natural, 0n),
      elements: accumulated(natural, 0n),
      elementsWas: accumulated(natural, 0n),
      end: drawn(natural),
      first: EndCharacter,
      governor: closedId(Governor),
      kind: closedId(NodeKind),
      last: EndCharacter,
      lastState: accumulated(closedId(Position), "0"),
      nearest: natural,
      nearestKind: closedId(NodeKind),
      nearestPath: EntryPath,
      openAttributes: drawn(natural),
      package: PackageName,
      parent: drawn(natural),
      parentAncestry: accumulated(bits(Flag), Bits.of(Flag, [])),
      parentGovernor: accumulated(closedId(Governor), "document"),
      parentKind: accumulated(closedId(NodeKind), "document"),
      parentNearest: accumulated(natural, 0n),
      parentNearestKind: accumulated(closedId(NodeKind), "document"),
      parentNearestPath: accumulated(EntryPath, manifestPath),
      parentParentKind: accumulated(closedId(NodeKind), "document"),
      path: EntryPath,
      prefix: Prefix,
      start: drawn(natural),
      state: closedId(Position),
      stringValue: accumulated(matchedText, ""),
      was: accumulated(closedId(Position), "0"),
    },
    ["package", "path", "start"],
    (n) => ({
      charsAfterDigest: law(entryOf("E1 derived"), generated(sha256, Crypto.sha256(n.charsAfter))),
      charsWasDigest: law(entryOf("E1 derived"), generated(sha256, Crypto.sha256(n.charsWas))),
      stringValueDigest: law(
        entryOf("E1 derived"),
        generated(sha256, Crypto.sha256(n.stringValue)),
      ),
    }),
  ),
);

/**
 * A `Node` row as a row check or a selection reads it.
 */
type NodeRow = RowScalars<typeof Node>;

/**
 * A vocabulary element's governing type, keyed by its element, where a named type governs it (XML
 * Schema 1.0 Part 1, §3.3.4, Element Locally Valid (Element), clause 4; spec reading
 * `xsi-attributes`): the type its `xsi:type` names, else its declared type. An element of an
 * anonymous declared type has none, and so has a node that is no element; a foreign element's type
 * is its `OpenElementType` (`#pantry/qti/chardata.ts`).
 *
 * - **the host's:** `type`, the shred's reading of the element's `xsi:type` or its kind's declared
 *   type; and its element's `governor` and `kind`, copied through the `(package, path, start, kind,
 *   governor)` tuple the attribute and identity overlays copy too.
 */
export const ElementType = law(
  entryOf("E1 derived"),
  relation(
    "ElementType",
    {
      governor: closedId(Governor),
      kind: closedId(NodeKind),
      package: PackageName,
      path: EntryPath,
      start: natural,
      type: closedId(TypeName),
    },
    ["package", "path", "start"],
  ),
);

/**
 * Read the governor a named type gives an element: `GoverningOf`'s of its (kind, type), and its
 * kind's own where `GoverningOf` holds no such pair, an `xsi:type` naming a type its
 * kind's declared type does not derive, which `XsiType derived` refuses. So it is the governor the
 * attribute grammar reads the element's attributes under (`#pantry/grammar/attributes.ts`
 * `governorOf`, its kind's own rows where it gives none). The row of the element's type, an
 * {@link ElementType} or a foreign element's `OpenElementType`, holds its governor to it.
 *
 * @param kind - The element's kind.
 * @param type - Its governing type.
 * @returns The governor's term.
 */
export const typeGovernorOf = (
  kind: Parameters<typeof GoverningOf.has>[0],
  type: Parameters<typeof GoverningOf.has>[1],
) =>
  Logic.cond(
    GoverningOf.has(kind, type),
    GoverningOf.at("governor", kind, type),
    KindGovernor.at("governor", kind),
  );

/**
 * State φ₀, a member of its parent's family: every row but the root, whose start is 0 (T2).
 *
 * The spelling is the tree's own member selection, `start > 0`, which a containment's member side
 * must state exactly to ride one of the tree's axes.
 *
 * @param n - The row.
 * @returns The predicate.
 */
const member = (n: NodeRow) => n.gt(n.start, 0n);

/**
 * State that a row is an element: its kind is none of the seven kinds that are no element (C8).
 *
 * @param n - The row.
 * @returns The predicate.
 */
const element = (n: NodeRow) => n.not(n.in(n.kind, nonElementKinds));

/**
 * State that a row's kind has a content model: an element, or the document node. Every such kind
 * has a `ContentModelOf` model that ends at some state (`FollowSetOf`'s `ends`),
 * and every other kind holds no child.
 *
 * @param n - The row.
 * @returns The predicate.
 */
const modeled = (n: NodeRow) => n.or(element(n), n.eq(n.kind, "document"));

/**
 * State that a row is a vocabulary element: an element of no foreign kind, which a declaration
 * assesses strictly.
 *
 * @param n - The row.
 * @returns The predicate.
 */
const vocabularyElement = (n: NodeRow) =>
  n.and(element(n), n.not(n.in(n.kind, openElementClasses)));

/**
 * State that a vocabulary element has a named governing type, its {@link ElementType}: its kind's
 * model declares a named type, so the element is governed by it or by one its `xsi:type` names. A
 * kind whose declared type is anonymous (`AnonymousType`) admits no named type, since none derives
 * from an anonymous one (spec reading `xsi-attributes`).
 *
 * @param n - The row.
 * @returns The predicate.
 */
const namedlyTyped = (n: NodeRow) => n.and(vocabularyElement(n), n.not(AnonymousType.has(n.kind)));

/**
 * Read the admission map of a member's parent's family (`ContentModelOf`'s `admission`).
 *
 * @param n - The row.
 * @returns The closed read.
 */
const admissionOf = (n: NodeRow) => ContentModelOf.at("admission", n.parentKind);

/**
 * State that the grammar admits a member where it stands: its parent's family's admission map holds
 * its kind (`AdmissionIn`). "N5 admitted" refuses every member it is false of, and an ID of one it
 * is false of binds nothing (`#pantry/qti/identity.ts`, R2).
 *
 * @param n - The row.
 * @returns The predicate.
 */
export const admitsHere = (n: NodeRow) => AdmissionIn.has(admissionOf(n), n.kind);

/**
 * Read a member's position in its parent's content model, its family's admission map's cell
 * (`AdmissionIn`): a position above 0 where one particle names its kind, 0 for character data and
 * for a kind several particles name, and nothing where the parent does not admit the kind.
 *
 * @param n - The row.
 * @returns The closed read.
 */
const positionOf = (n: NodeRow) => AdmissionIn.at("position", admissionOf(n), n.kind);

/**
 * State that a member steps its parent's automaton: a kind its parent admits, and an element, or
 * character data a particle names, as the document's doctype (position 1) and SSML's text in
 * `ssml:speak` (spec reading `ssml-head-order`) are. Every other admitted member is character data
 * that carries its predecessor's state.
 *
 * The split is by position, not by kind, because `placedStep` steps every child whose position is
 * not 0, character data included. A kind its parent does not admit steps nothing (`stepOf` is
 * none), and {@link positionOf} reads nothing there, so the `AdmissionIn.has` guard states that
 * false outright rather than leaving it unknown, which a check refuses (decision 440):
 * `N5_admitted` alone refuses such a member, as the oracle judges it.
 *
 * @param n - The row.
 * @returns The predicate.
 */
const positioned = (n: NodeRow) => n.and(admitsHere(n), n.or(element(n), n.ne(positionOf(n), "0")));

/**
 * State that a row is an element whose text TextDomain checks: its governor is one of
 * `CheckedText`'s (`#pantry/grammar/install.ts`), the one definition of checked text. Q5.05's
 * TextDomain check reads it over an element's own governor, and the string value's fold over a
 * member's parent's ({@link inCheckedText}), so the two select one set of elements.
 *
 * @param n - The row.
 * @returns The predicate.
 */
export const holdsCheckedText = (n: NodeRow) => CheckedText.has(n.governor);

/**
 * State that a member is a child of an element whose text TextDomain checks: its parent's copied
 * governor, the field the member carries, is one of `CheckedText`'s.
 *
 * @param n - The row.
 * @returns The predicate.
 */
const inCheckedText = (n: NodeRow) => CheckedText.has(n.parentGovernor);

/**
 * The simple-content kinds whose text an overlay copies though no TextDomain check reads it (their
 * domain is universal), so their string value is folded beside the checked kinds'. A copied kind
 * gets no TextDomain law from this list. Other slices add a kind through the orchestrator.
 *
 * - The LOM leaves the typed LOM views read (`#pantry/qti/queries.ts`, `#pantry/qti/lom.ts`), each a
 *   `CharacterString` of the loose binding, whose `xs:string` no TextDomain check reads: an
 *   identifier's `lom:catalog` and `lom:entry` (`lom-identifier` compares an item's LOM general
 *   identifier's entry with its identifier, reading `identity-from-lom`), a taxon's `lom:id`, a
 *   contribute's `lom:entity` (a vCard), a general category's `lom:language` (R26), and every
 *   vocabulary's `lom:source` and `lom:value` (`lom-learning-resource-type`, and the LOM
 *   vocabularies an install narrows). The typed LOM is a view over these folded values, never an
 *   overlay that copies them (S5).
 * - `qti-value`: Q5.08's declaration overlay checks its lexical form against its declaration's base
 *   type (C1, O2), not against its governing type.
 * - `qti-resource-icon`: the text census's `TextReference` reads an icon's string value as a file
 *   reference (spec reading R9-b); its type, `URLDType`, is an `xs:normalizedString`, so no
 *   TextDomain check reads it. A card's file is an `xs:anyURI`, which TextDomain checks, so it is
 *   folded already.
 * - `qti-base-value`: Q5.10's expression overlay checks a literal's lexical form against its own base
 *   type (O4).
 * - `ud:value`: Q5.12's metadata overlay checks a usage statistic's value against the base type its
 *   `baseType` names (O6, spec reading `usage-statistic-value`), not against its governing type's
 *   `xs:normalizedString`.
 */
export const copiedTextKinds = [
  "lom:catalog",
  "lom:entity",
  "lom:entry",
  "lom:id",
  "lom:language",
  "lom:source",
  "lom:value",
  "qti-value",
  "qti-base-value",
  "qti-resource-icon",
  "ud:value",
] as const satisfies readonly (typeof NodeKind.handles)[number][];

/**
 * The LangStrings whose strings the typed LOM reads, each a `lom:string`'s parent: a general
 * category's `lom:title` (Q5.12's `lom-title`, spec reading `identity-from-lom`, QTI 3.0 Metadata
 * §2.7.1.2), a taxon path's `lom:source.langString` and a taxon's `lom:entry.langString` (the
 * classification's scheme and its term's name, QTI 3.0 Metadata §2.7.9). A `lom:string` under a
 * description, a keyword or any other LangString is not folded, since no key reads its text.
 */
const foldedLangStrings = [
  "lom:title",
  "lom:source.langString",
  "lom:entry.langString",
] as const satisfies readonly (typeof NodeKind.handles)[number][];

/**
 * State that a member is a child of a string of one of {@link foldedLangStrings}: its parent is a
 * `lom:string` and its grandparent one of those LangStrings.
 *
 * @param n - The row.
 * @returns The predicate.
 */
export const copiedLangStringText = (n: NodeRow) =>
  n.and(n.eq(n.parentKind, "lom:string"), n.in(n.parentParentKind, foldedLangStrings));

/**
 * State that a member's characters make its parent's string value: it is a member, and its parent's
 * text is checked ({@link inCheckedText}) or copied ({@link copiedTextKinds},
 * {@link copiedLangStringText}). The string value's fold steps these rows' `chars`.
 *
 * @param n - The row.
 * @returns The predicate.
 */
const inStringValue = (n: NodeRow) =>
  n.and(
    member(n),
    n.or(inCheckedText(n), n.in(n.parentKind, copiedTextKinds), copiedLangStringText(n)),
  );

/**
 * State that a foreign element is governed by a simple type: its governor is the (kind, type) pair,
 * not its kind. `GoverningOf` gives a foreign kind under a type its pair exactly where the
 * grammar's `Governor` holds one, every named simple type of the leaf and no complex one
 * (`compose.ts`, `governedOf`), and the kind itself under every other type, and an element no type
 * governs is governed by its kind ({@link KindGovernor}), so a foreign kind's own handle as its
 * governor is the type's absence or its complex content (spec readings `unchecked-xsi-type` and
 * `wildcard-xsi-type`).
 *
 * @param n - The row, of a foreign kind.
 * @returns The predicate.
 */
const simplyGoverned = (n: NodeRow) => n.not(n.in(n.governor, openElementClasses));

/**
 * The tree of every document's nodes, its root the document node (N2, N9 to N11; trees.md §5).
 *
 * Grizzle states its family over the members (φ₀), its intervals, T0 to T6 and the root pin.
 */
export const nodeTree = tree(on(Node, "parent", "at"), fin(Node, "children"), {
  root: ["package", "path"],
});

/**
 * The tree's members, every row but each document's root: the member side of every containment
 * that rides one of the tree's axes. `(package, path, parent, at)` names one member alone: the root
 * is its own parent at slot 0, as its first child is.
 */
export const members = select(Node, member);

/**
 * The document node's position in its document, `Node.start` of the root, 0: the parent a
 * document's root element names, and so the scope, table or chain top of an element no element of
 * that kind holds.
 */
export const documentStart = 0n;

/**
 * A node's context (spec readings `inclusion-cycles` and `fragment-placement`): the fields the
 * tree's owner axis copies to its children, with its key `(package, path, start)` and children. It
 * is exactly the column set the owner axis's foreign key targets: its key, its count and the
 * copies. grizzle references a UNIQUE that holds a reference's column set in whatever order it
 * lists the columns (README, "Fixed fields"), so a containment into it shares that UNIQUE on `Node`
 * and adds no index: an include's site copies the include's ancestry and nearest interaction
 * through it, and `Document` its document node's context.
 */
export const nodeContext = on(
  Node,
  "package",
  "path",
  "start",
  "children",
  "ancestry",
  "governor",
  "kind",
  "nearest",
  "nearestKind",
  "nearestPath",
  "parentKind",
);

/**
 * The elements fold (Q4.01's hand-off): each member element counts once, so `elements` is its
 * element rank among its siblings, 1-based, and its parent's `elementChildren` its element count.
 */
const elementsFold = fold(
  nodeTree,
  Monoid.count,
  on(
    select(Node, (n) => n.and(member(n), element(n))),
    "package",
    "path",
    "parent",
    "elementsWas",
    "elements",
  ),
  on(Node, "package", "path", "start", "elementChildren"),
);

/**
 * The counted position's fold (N7, C15): the element children at the one position of their parent's
 * model whose count `CountedOf` bounds beside the automaton, none in a family `CountedOf` has no
 * row of.
 */
const countedFold = fold(
  nodeTree,
  Monoid.count,
  on(
    select(Node, (n) =>
      n.and(
        member(n),
        element(n),
        CountedOf.has(n.parentKind),
        n.eq(n.state, CountedOf.at("position", n.parentKind)),
      ),
    ),
    "package",
    "path",
    "parent",
  ),
  on(Node, "package", "path", "start", "countedChildren"),
);

/**
 * The element children at the positions `Capped` holds (N7, spec reading `lom-repetition`): a
 * family's children at a position its parent's model caps at one, which the key over `(package,
 * path, parent, state)` holds to one child each. A position names one kind alone where a reading
 * caps it (`content.ts`, `cappedBy`), so the key holds the kind to one child of the family.
 */
const cappedChildren = select(Node, (n) =>
  n.and(
    member(n),
    element(n),
    n.eq(Bits.subset(Bits.singleton(n.state), Capped.row(n.parentKind)), true),
  ),
);

/**
 * The barred position's fold (N7, C15): the element children at the position `BarredOf` bars when
 * its parent carries the barring attribute, none in a family `BarredOf` has no row of.
 */
const barredFold = fold(
  nodeTree,
  Monoid.count,
  on(
    select(Node, (n) =>
      n.and(
        member(n),
        element(n),
        BarredOf.has(n.parentKind),
        n.eq(n.state, BarredOf.at("position", n.parentKind)),
      ),
    ),
    "package",
    "path",
    "parent",
  ),
  on(Node, "package", "path", "start", "barredChildren"),
);

/**
 * The string value's fold: the characters of an element's children, in order, where TextDomain
 * checks that element's text or an overlay copies it ({@link inStringValue}), its `stringValue`
 * (XDM's string value of an element of simple content), which TextDomain judges (Q5.05) and the
 * overlays of {@link copiedTextKinds} copy. Comments and instructions add their empty `chars`. No
 * other element's children are stepped, so mixed content and text nothing reads store no running
 * prefixes.
 *
 * The running texts and the end may outgrow PostgreSQL's B-tree entry (`BTMaxItemSize`), so each
 * rides the tree's axes by its SHA-256 digest, a generated field PostgreSQL stores beside it, which
 * the fold names in its place: the predecessor axis pairs each member's `charsWasDigest` with its
 * predecessor's `charsAfterDigest`, and the last axis the element's `stringValueDigest` with its
 * last member's `charsAfterDigest` (grizzle's README, "Families": a running text of any length
 * rides the axes by its digest). The texts stay the fold's values, which grizzle fills and the
 * fold's CHECK and pins prove. `charsWas`, `charsAfter` and `stringValue` are `matchedText`
 * (`#pantry/qti/limits.ts`), the bound of a text a query reads by a pattern, and a folded string
 * value past its bound is refused by that type's pattern, by name: a stated limit of the
 * representation (spec reading `wildcard-xsi-type`). The step is the member's own `chars`,
 * unbounded text: a fold's accumulators are of its step's type but for their own pattern and byte
 * bound, and each one's domain refuses a running value outside its own (grizzle's README,
 * "Families", `fold`), so a member whose characters alone pass the bound is refused by
 * `charsAfter`'s.
 */
const stringValueFold = fold(
  nodeTree,
  Monoid.concat,
  on(
    select(Node, inStringValue),
    "package",
    "path",
    "parent",
    "chars",
    "charsWasDigest",
    "charsAfterDigest",
  ),
  on(Node, "package", "path", "start", "stringValueDigest"),
);

/**
 * Every statement over `Node` that Q5.03 owns, by the law each states, its name the law table's
 * (`#pantry/import/refusal.ts`), and each `check` named by its oracle law: the tree, the
 * root's sentinel, the three axis copies, content order and its end, the counts beside the
 * automaton, ancestry, the nearest interaction and the governing type.
 *
 * - **N1:** the document node is the one row at start 0, its own parent, at the automaton's start
 *   state and governed by its own kind. Its parent copies are grizzle's: the owner axis's foreign
 *   key leaves the root out, and grizzle pins each copy of a root at its start, the base its
 *   `accumulated` states (`laws/model/plan.ts` `#pin`, `start > 0 OR f = s`); its `state` is pinned
 *   here. Its ancestry and nearest interaction are its document's context (spec reading
 *   `fragment-placement`), which its `Document` row states (`#pantry/qti/chardata.ts`): none and
 *   itself for every document but an included fragment, whose content is judged in the context its
 *   includes stand in.
 * - **N3:** the parent copies, riding the owner axis.
 * - **N5:** the predecessor copy, riding the predecessor axis; `N5_Follow`, one bit of its
 *   predecessor's follow set in its parent's model (`FollowMember` of `FollowSetOf`, under
 *   `ContentModelOf`) for every member that steps its parent's automaton, a row check, since a side
 *   names fields and the set is a closed read; and `N5_admitted`, which holds each member's state
 *   to its position: the one its kind's particle names, its predecessor's for character data no
 *   particle names, or one of `Symbol`'s for a kind several particles name. An unadmitted kind
 *   reads no position and is refused.
 * - **E1:** a member's `ancestry` is `parentAncestry ∪ Enters(kind)`, the document node's its
 *   document's context (N1), which its root copy, held at the accumulated start, cannot carry: a
 *   fragment included under a flag, such as a paragraph in a rubric block, holds that flag at its
 *   document node (spec reading `fragment-placement`). Only character data has characters, `first`
 *   and `last` are the first and last code points of `chars` (each one code point by its type, so
 *   `startsWith` and `endsWith` pin it), and both empty exactly where `chars` is; the string
 *   value's fold over the `chars` of the members whose parent's text is checked or copied; and
 *   `governor`: its kind's own (`KindGovernor`) on a node no named type governs, a node that is no
 *   element or a vocabulary element of an anonymous declared type, and on an {@link ElementType}
 *   the governor its type gives ({@link typeGovernorOf}), the row's copy of its node's. A foreign
 *   element's governor is `chardata.ts`'s, over its `OpenElementType`.
 * - **N6:** no banned flag above a node, and every flag it needs.
 * - **N7:** the last-slot copy, riding the last axis; `N7_Last`, its own model's `FollowSetOf` ends
 *   at every modeled node's last state (the content grammar's `Last`); and the counted and barred
 *   positions' bounds, each on the owner, each vacuous where its position is 0.
 * - **N8:** a member's nearest interaction is its parent, in its own document, where the parent is
 *   one, else its parent's, wherever that is.
 * - **N12:** each vocabulary element whose kind declares a named type has an {@link ElementType}, and
 *   each type is one its kind may name in `xsi:type`; an element of an anonymous declared type has
 *   none, since its kind has no `XsiType` row; a foreign element is assessed laxly and is selected
 *   out.
 * - **Foreign simple content** (C41, spec reading `wildcard-xsi-type`): a foreign element a simple
 *   type governs holds no element child (XML Schema 1.0 Part 1, §3.3.4, Element Locally Valid
 *   (Type), clause 3.1.2), its `elementChildren` the elements fold's end. Its attributes are AL1's
 *   under the governor and its text TextDomain's (Q5.05).
 *
 * "Strictly held" (C44, C13) reads the foreign element's expanded name, so it is `chardata.ts`'s,
 * over `OpenElementName`.
 */
export const nodeLawsByName = {
  "E1 derived": declared("E1 derived", [
    check("E1_derived", Node, (n) =>
      n.and(
        n.or(n.eq(n.start, 0n), n.eq(n.ancestry, Bits.union(n.parentAncestry, Enters.row(n.kind)))),
        n.or(
          n.eq(n.governor, KindGovernor.at("governor", n.kind)),
          n.in(n.kind, openElementClasses),
          namedlyTyped(n),
        ),
        n.or(n.in(n.kind, ["text", "ws", "entityRef"]), n.eq(n.chars, "")),
        n.or(
          n.and(n.eq(n.chars, ""), n.eq(n.first, ""), n.eq(n.last, "")),
          n.and(
            n.ne(n.first, ""),
            n.ne(n.last, ""),
            n.eq(Text.startsWith(n.chars, n.first), true),
            n.eq(Text.endsWith(n.chars, n.last), true),
          ),
        ),
      ),
    ),
    stringValueFold,
    contained(
      on(ElementType, "package", "path", "start", "kind", "governor"),
      on(Node, "package", "path", "start", "kind", "governor"),
    ),
    check("E1_derived", ElementType, (t) => t.eq(t.governor, typeGovernorOf(t.kind, t.type))),
  ]),
  "Foreign simple content": declared("Foreign simple content", [
    check("Foreign_simple_content", Node, (n) =>
      n.or(
        n.not(n.in(n.kind, openElementClasses)),
        n.not(simplyGoverned(n)),
        n.eq(n.elementChildren, 0n),
      ),
    ),
  ]),
  "N1 sentinel": declared("N1 sentinel", [
    check("N1_sentinel", Node, (n) =>
      n.or(
        n.and(member(n), n.ne(n.kind, "document")),
        n.and(
          n.eq(n.start, 0n),
          n.eq(n.kind, "document"),
          n.eq(n.parent, n.start),
          n.eq(n.state, "0"),
          n.eq(n.governor, "document"),
        ),
      ),
    ),
  ]),
  "N2 tree": declared("N2 tree", [nodeTree]),
  "N5 Follow": declared("N5 Follow", [
    check("N5_Follow", Node, (n) =>
      n.or(
        n.not(member(n)),
        n.not(positioned(n)),
        n.eq(
          Bits.subset(
            Bits.singleton(n.state),
            FollowMember.row(
              FollowSetOf.at("set", ContentModelOf.at("model", n.parentKind), n.was),
            ),
          ),
          true,
        ),
      ),
    ),
  ]),
  "N5 admitted": declared("N5 admitted", [
    check("N5_admitted", Node, (n) =>
      n.or(
        n.eq(n.start, 0n),
        n.and(n.ne(positionOf(n), "0"), n.eq(n.state, positionOf(n))),
        n.and(n.eq(positionOf(n), "0"), n.not(element(n)), n.eq(n.state, n.was)),
        n.and(
          n.eq(positionOf(n), "0"),
          element(n),
          SharedModelOf.has(n.parentKind),
          SymbolSetOf.has(SharedModelOf.at("model", n.parentKind), n.kind),
          n.eq(
            Bits.subset(
              Bits.singleton(n.state),
              SymbolMember.row(
                SymbolSetOf.at("set", SharedModelOf.at("model", n.parentKind), n.kind),
              ),
            ),
            true,
          ),
        ),
      ),
    ),
  ]),
  "N5 fold": declared("N5 fold", [
    contained(
      on(members, "package", "path", "parent", pred("at"), "was"),
      on(members, "package", "path", "parent", "at", "state"),
    ),
    elementsFold,
  ]),
  "N6 ancestry": declared("N6 ancestry", [
    check("N6_ancestry", Node, (n) =>
      n.and(
        n.eq(Bits.disjoint(n.parentAncestry, Banned.row(n.kind)), true),
        n.eq(Bits.subset(Needs.row(n.kind), n.parentAncestry), true),
      ),
    ),
  ]),
  "N7 Counted": declared("N7 Counted", [
    countedFold,
    check("N7_Counted", Node, (n) =>
      n.or(
        n.not(modeled(n)),
        n.not(CountedOf.has(n.kind)),
        n.and(
          n.ge(n.countedChildren, CountedOf.at("min", n.kind)),
          n.or(
            n.not(CountedMax.has(n.kind)),
            n.le(n.countedChildren, CountedMax.at("max", n.kind)),
          ),
        ),
      ),
    ),
    key(on(cappedChildren, "package", "path", "parent", "state")),
  ]),
  "N7 Last": declared("N7 Last", [
    check("N7_Last", Node, (n) =>
      n.or(
        n.not(modeled(n)),
        n.eq(FollowSetOf.at("ends", ContentModelOf.at("model", n.kind), n.lastState), true),
      ),
    ),
  ]),
  "N7 barred by": declared("N7 barred by", [
    barredFold,
    check("N7_barred_by", Node, (n) =>
      n.or(
        n.not(modeled(n)),
        n.not(BarredOf.has(n.kind)),
        n.eq(Bits.disjoint(Bits.singleton(BarredOf.at("slot", n.kind)), n.attrs), true),
        n.eq(n.barredChildren, 0n),
      ),
    ),
  ]),
  "N7 last slot": declared("N7 last slot", [
    contained(
      on(Node, "package", "path", "start", pred("children"), "lastState"),
      on(members, "package", "path", "parent", "at", "state"),
    ),
  ]),
  "N8 nearest": declared("N8 nearest", [
    check("N8_nearest", Node, (n) =>
      n.or(
        n.eq(n.start, 0n),
        n.and(
          n.in(n.parentKind, interactionKinds),
          n.eq(n.nearest, n.parent),
          n.eq(n.nearestKind, n.parentKind),
          n.eq(n.nearestPath, n.path),
        ),
        n.and(
          n.not(n.in(n.parentKind, interactionKinds)),
          n.eq(n.nearest, n.parentNearest),
          n.eq(n.nearestKind, n.parentNearestKind),
          n.eq(n.nearestPath, n.parentNearestPath),
        ),
      ),
    ),
  ]),
  "T3 first child": declared("T3 first child", [
    contained(
      on(
        members,
        "package",
        "path",
        "parent",
        "parentKind",
        "parentGovernor",
        "parentAncestry",
        "parentNearest",
        "parentNearestKind",
        "parentNearestPath",
        "parentParentKind",
      ),
      on(
        Node,
        "package",
        "path",
        "start",
        "kind",
        "governor",
        "ancestry",
        "nearest",
        "nearestKind",
        "nearestPath",
        "parentKind",
      ),
    ),
  ]),
  "XsiType derived": declared("XsiType derived", [
    contained(
      on(select(Node, namedlyTyped), "package", "path", "start"),
      on(ElementType, "package", "path", "start"),
    ),
    contained(on(ElementType, "kind", "type"), on(XsiType, "kind", "type")),
  ]),
} as const;

/**
 * Every statement over `Node` that Q5.03 owns, {@link nodeLawsByName}'s statements in one list.
 */
export const nodeLaws = Object.values(nodeLawsByName).flat();

/**
 * `node.ts`'s relations: every node of every document, and each vocabulary element's named
 * governing type.
 */
export const nodeRelations = [ElementType, Node] as const;
