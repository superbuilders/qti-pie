/**
 * The identity overlays' rows (plan §1.7 O1, §C's `rowsOf`): from one document's view
 * (`DocumentView` of `#pantry/import/fold.ts`), the rows of every relation
 * `#pantry/qti/identity.ts` declares, each relation's rows a keyed set; and, from every document's
 * rows, those placed under each assembly ({@link placedIdRowsOf}).
 *
 * The rows restate what the tree says and nothing else: each element that carries an ID, with the
 * element its binding names; each element's text of an identity type and
 * its IDREF tokens; each `label`'s element, each `xml:lang`'s element's catalog scope and each
 * element on the way up to it (reading R9-c), each element on the way up from an SSML
 * attribute reading 3 reads to its fragment, and the projections those rows carry,
 * each value once (sets ruling 2). A LOM record is no row's: the database reads its languages from
 * the tree (R26's rule over a query, `#pantry/qti/queries.ts`). The database proves every one of
 * them (`identityLaws`), so a row this builder gets wrong is refused, never accepted. An ID's value
 * is no row's either: the host reads it as the database's `IdValue` does ({@link idValuesOf}),
 * where the placements copy it.
 */
import type { Addition } from "@bjornpagen/grizzle";
import { Option } from "effect";
import { collapse, referenceIdentities } from "#pantry/grammar/domains.ts";
import {
  attributeRows,
  grammar,
  TextDomain,
  toolLabelKinds,
  ValueIdentity,
} from "#pantry/grammar/install.ts";
import { keyTextOf } from "#pantry/import/key-text.ts";
import { attributeValueOf } from "#pantry/import/names.ts";
import { stringValuesOf } from "#pantry/import/overlays/metadata.ts";
import { tokensOf } from "#pantry/import/pieces.ts";
import { governorOf, lexicalOf } from "#pantry/import/fold.ts";
import type { AttributeIndex, DocumentView } from "#pantry/import/fold.ts";
import type { DocumentPlace, Place } from "#pantry/import/write.ts";
import type { Composed } from "#pantry/model/composed.ts";
import type { AttributeRow, FlatRows, NodeRow } from "#pantry/model/xdm.ts";
import type {
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
} from "#pantry/qti/identity.ts";
import { idSpaceAttributes, ssmlReads } from "#pantry/vocab/terms/identity.ts";
import type { InstanceMember, InstanceRoot } from "#pantry/import/overlays/tests.ts";

/**
 * Where a document stands in its package, as this builder reads it: the part of the importer's
 * `DocumentPlace` it needs beside the document's view. `assembled` says whether its IDREFs resolve
 * per instance (spec reading 117); `package` and `path`, its {@link Place}, are every row's.
 */
export type IdentityIds = Pick<DocumentPlace, "assembled" | "package" | "path">;

/**
 * One IDREF token of an element's text as its element's family nests it: without the element's
 * `package`, `path` and `start` the nesting supplies, nor the `at` the family draws.
 */
export type TextIdrefInsert = Omit<Addition<typeof TextIdref>, "package" | "path" | "start">;

/**
 * An element whose text is of an identity type, with its IDREF tokens nested at its count field.
 */
type IdentityTextRow = Addition<typeof IdentityText> & {
  readonly tokens: readonly TextIdrefInsert[];
};

/**
 * A document's identity rows, one keyed set per relation: each map from the text of a row's key to
 * the row as its writer writes it, the key's values in key order as a JSON array, the document's
 * `package` and `path` first.
 */
export interface IdentityRows {
  readonly CatalogScope: ReadonlyMap<string, Addition<typeof CatalogScope>>;
  readonly DocumentId: ReadonlyMap<string, Addition<typeof DocumentId>>;
  readonly IdentityText: ReadonlyMap<string, IdentityTextRow>;
  readonly IdrefTarget: ReadonlyMap<string, Addition<typeof IdrefTarget>>;
  readonly LabelUse: ReadonlyMap<string, Addition<typeof LabelUse>>;
  readonly ShareFragment: ReadonlyMap<string, Addition<typeof ShareFragment>>;
  readonly SsmlScope: ReadonlyMap<string, Addition<typeof SsmlScope>>;
}

/**
 * A package's IDs and IDREF targets placed under each instance of each assembly (spec reading
 * 117), one keyed set per relation.
 */
export interface PlacedIdRows {
  readonly PlacedId: ReadonlyMap<string, Addition<typeof PlacedId>>;
  readonly PlacedIdref: ReadonlyMap<string, Addition<typeof PlacedIdref>>;
}

/**
 * The document node's position in its document: the scope of an element no scope element holds,
 * and the parent a document's root element names.
 */
const documentNode = 0n;

/**
 * The installed `ValueIdentity`, keyed by domain: the identity type of each value domain that has
 * one. A domain of no identity has no row.
 */
const identityAt: ReadonlyMap<string, string> = new Map(
  ValueIdentity.rows.map(({ domain, identity }) => [domain, identity]),
);

/**
 * The identity type of each attribute's value domain under the attribute grammar
 * `AttributeGrammar` installs, keyed `governor name`, for each attribute whose domain has one.
 */
const attributeIdentityAt: ReadonlyMap<string, string> = new Map(
  attributeRows.flatMap(({ domain, governor, name }) =>
    Option.toArray(Option.fromUndefinedOr(identityAt.get(domain))).map(
      (identity) => [`${governor} ${name}`, identity] as const,
    ),
  ),
);

/**
 * The identity type of the domain each governor reads its text in, under the installed
 * `TextDomain`, keyed by governor, for each governor whose text domain has one.
 */
const textIdentityAt: ReadonlyMap<string, string> = new Map(
  TextDomain.rows.flatMap(({ domain, governor }) =>
    Option.toArray(Option.fromUndefinedOr(identityAt.get(domain))).map(
      (identity) => [governor, identity] as const,
    ),
  ),
);

/**
 * The kinds whose `label` is a `LabelUse`, as `#pantry/qti/identity.ts` selects them: those whose
 * label characteristic asks for its tool (spec reading 128).
 */
const toolLabelled: ReadonlySet<string> = new Set(toolLabelKinds);

/**
 * The kind of a MathML `share`, whose `src` of the form `#id` is a {@link ShareFragment}.
 */
const shareKind = "m:share";

/**
 * Read an element's governor, `Node.governor` (`#pantry/import/fold.ts` `governorOf`).
 *
 * @param element - The element's node row.
 * @returns The governor.
 */
const governorOfElement = (element: NodeRow<Composed>): string =>
  governorOf(element.kind, element.governs);

/**
 * Read the identity type of an attribute's value domain under its element's governor.
 *
 * @param attribute - The attribute row.
 * @param element - Its element's node row.
 * @returns `ID`, `IDREF` or `IDREFS`; none where the governor reads the attribute under no domain,
 *   or its domain has no identity.
 */
const attributeIdentityOf = (
  attribute: AttributeRow<Composed>,
  element: NodeRow<Composed>,
): Option.Option<string> =>
  Option.fromUndefinedOr(
    attributeIdentityAt.get(`${governorOfElement(element)} ${attribute.name}`),
  );

/**
 * Decide whether an attribute's value is one of its document's IDs, as `identity.ts`'s
 * `idAttributes` selects it: its domain's identity under its element's governor is `xs:ID`, or it
 * is one of {@link idSpaceAttributes}, a context declaration's `identifier` (spec reading 74).
 *
 * @param attribute - The attribute row.
 * @param element - Its element's node row.
 * @returns Whether it is ID-typed.
 */
const holdsId = (attribute: AttributeRow<Composed>, element: NodeRow<Composed>): boolean =>
  Option.exists(attributeIdentityOf(attribute, element), (identity) => identity === "ID") ||
  idSpaceAttributes.some(
    ([name, kinds]: readonly [string, readonly string[]]) =>
      name === attribute.name && kinds.includes(element.kind),
  );

/**
 * Decide whether an attribute's value is IDREF tokens, as `write.ts` splits an attribute's
 * `Idref` pieces: its domain's identity under its element's governor is `xs:IDREF` or
 * `xs:IDREFS`.
 *
 * @param attribute - The attribute row.
 * @param element - Its element's node row.
 * @returns Whether it is.
 */
const holdsIdref = (attribute: AttributeRow<Composed>, element: NodeRow<Composed>): boolean =>
  Option.exists(attributeIdentityOf(attribute, element), (identity) =>
    referenceIdentities.some((reference) => reference === identity),
  );

/**
 * Read the identity type of an element's text, as `identity.ts`'s `textIdentityOf` reads it: its
 * governor's text domain's.
 *
 * @param element - The element's node row.
 * @returns `ID`, `IDREF` or `IDREFS`; none where its text is of no identity type, or its governor
 *   reads its text in no domain.
 */
const textIdentityOf = (element: NodeRow<Composed>): Option.Option<string> =>
  Option.fromUndefinedOr(textIdentityAt.get(governorOfElement(element)));

/**
 * A document's tree as the builders below read it: its place in its package, its flat rows and root
 * kind, each node by its position, each node's string value, and each element's attributes by
 * name.
 */
interface Tree {
  readonly attributes: AttributeIndex;
  /**
   * Read the node at a position of the document, an element a row names or its parent, which
   * `flatten` writes before every row that names it.
   */
  readonly nodeAt: (start: bigint) => NodeRow<Composed>;
  readonly place: Place;
  readonly rootKind: Addition<typeof LabelUse>["rootKind"];
  readonly rows: FlatRows<Composed>;
  readonly stringValueOf: (start: bigint) => string;
}

/**
 * Decide whether the grammar admits an element where it stands, as `identity.ts`'s
 * `admittedNodes` selects it: its parent's admission map holds its kind (`AdmissionIn`). Only
 * such an element's ID binds (R2); "N5 admitted" alone refuses any other.
 *
 * @param tree - The document's tree.
 * @param element - The element's node row.
 * @returns Whether it is admitted.
 */
const admitted = (tree: Tree, element: NodeRow<Composed>): boolean =>
  Option.isSome(
    grammar.admission.lookup({
      child: element.kind,
      parent: tree.nodeAt(element.parent).kind,
    }),
  );

/**
 * Write an ID's `DocumentId` row, bound to an owner, and whether its element is {@link admitted}.
 * Every ID-typed attribute and every ID text has its row, whatever its form: its value domain or
 * TextDomain refuses a form that is no NCName once collapsed where it is written (spec readings
 * 152 and 156), and the row holds no copy of the value, which `IdValue` reads where it stands
 * ({@link idValuesOf}).
 *
 * @param tree - The document's tree.
 * @param element - The element that carries the ID.
 * @param owner - The position of the element its binding names: the attribute's element, or the
 *   text's parent.
 * @returns The row.
 */
const documentIdOf = (
  tree: Tree,
  element: NodeRow<Composed>,
  owner: bigint,
): Addition<typeof DocumentId> => ({
  ...tree.place,
  admitted: admitted(tree, element),
  owner,
  start: element.start,
});

/**
 * Build the rows a document's attributes give: each attribute ID's `DocumentId`, and the `LabelUse`
 * of each `label` that asks for its tool.
 *
 * @param tree - The document's tree.
 * @returns The rows, each by its key text.
 */
const attributeRowsOf = (tree: Tree): Pick<IdentityRows, "DocumentId" | "LabelUse"> => {
  const { place, rootKind } = tree;
  const documentIds = new Map<string, Addition<typeof DocumentId>>();
  const labels = new Map<string, Addition<typeof LabelUse>>();

  for (const attribute of tree.rows.attributes) {
    const element = tree.nodeAt(attribute.start);
    const { name, start } = attribute;
    const at = keyTextOf(place.package, place.path, start);
    // An element's ID-typed attributes give it one row; XML Schema gives it no second, which
    // "DocumentId key"'s key over the ID-typed attributes' element refuses.
    if (holdsId(attribute, element)) {
      documentIds.set(at, documentIdOf(tree, element, start));
    }

    if (name === "label" && toolLabelled.has(element.kind)) {
      labels.set(at, { ...place, rootKind, start });
    }
  }

  return { DocumentId: documentIds, LabelUse: labels };
};

/**
 * Build the {@link ShareFragment} of each `m:share` whose `src`'s value is `#` and one or more
 * characters (MathML 3 §4.2.7), as `ShareSource` (`#pantry/qti/overlay-queries/identity.ts`)
 * selects them: its value, the lexical form normalized in its domain's class
 * ({@link attributeValueOf}), an `xs:anyURI`'s `collapse`; `id`, the text after the `#`; and
 * whether its document is in an assembly. Its `placements` are drawn.
 *
 * @param tree - The document's tree.
 * @param assembled - Whether the document is in an assembly, as {@link IdrefTarget}'s is.
 * @returns The rows, each by its key text.
 */
const shareFragmentsOf = (
  tree: Tree,
  assembled: boolean,
): Map<string, Addition<typeof ShareFragment>> => {
  const { place } = tree;
  const fragments = new Map<string, Addition<typeof ShareFragment>>();

  for (const { lexical, name, start } of tree.rows.attributes.filter((row) => row.name === "src")) {
    const element = tree.nodeAt(start);
    if (element.kind !== shareKind) {
      continue;
    }

    const value = attributeValueOf(governorOfElement(element), name, lexical);
    if (value.startsWith("#") && value !== "#") {
      fragments.set(keyTextOf(place.package, place.path, start), {
        ...place,
        assembled,
        id: value.slice(1),
        start,
      });
    }
  }

  return fragments;
};

/**
 * Build the rows a document's identity-typed texts give (C50): each one's `IdentityText`, with its
 * IDREF tokens nested, and each ID text's `DocumentId`, bound to the element's parent.
 *
 * @param tree - The document's tree.
 * @returns The rows, each by its key text.
 */
const textRowsOf = (tree: Tree): Pick<IdentityRows, "DocumentId" | "IdentityText"> => {
  const { place } = tree;
  const documentIds = new Map<string, Addition<typeof DocumentId>>();
  const identityTexts = new Map<string, IdentityTextRow>();

  for (const node of tree.rows.nodes) {
    const found = textIdentityOf(node);
    if (Option.isNone(found)) {
      continue;
    }

    const at = keyTextOf(place.package, place.path, node.start);
    const identity = found.value;
    identityTexts.set(at, {
      ...place,
      start: node.start,
      tokens: identity === "ID" ? [] : tokensOf(tree.stringValueOf(node.start)),
    });

    if (identity === "ID") {
      documentIds.set(at, documentIdOf(tree, node, node.parent));
    }
  }

  return { DocumentId: documentIds, IdentityText: identityTexts };
};

/**
 * The walk from an element up to its scope root, the element first, and the position of the scope
 * it ends at: the scope root's, or the document node's where none holds the element.
 */
interface ScopeWalk {
  readonly scope: bigint;
  readonly walk: readonly NodeRow<Composed>[];
}

/**
 * Walk from an element up to its scope: the element, then each parent, ending at the first element
 * of the scope's kind or at the document's root. A fragment is an SSML `speak`'s (spec reading 3),
 * a catalog a `qti-catalog-info`'s (reading R9-c).
 *
 * @param tree - The document's tree.
 * @param element - The element.
 * @param scopeKind - The kind of element that is its own scope.
 * @returns The walk, the element first, and its scope: the position of the element of that kind it
 *   ends at, or of the document node where none holds the element.
 */
const scopeWalkOf = (tree: Tree, element: NodeRow<Composed>, scopeKind: string): ScopeWalk => {
  const walk: NodeRow<Composed>[] = [];
  for (let at = element; ; at = tree.nodeAt(at.parent)) {
    walk.push(at);
    if (at.kind === scopeKind) {
      return { scope: at.start, walk };
    }

    if (at.parent === documentNode) {
      return { scope: documentNode, walk };
    }
  }
};

/**
 * Whether an element writes an SSML attribute reading 3's laws read ({@link ssmlReads}).
 *
 * @param tree - The document's tree.
 * @param element - The element.
 * @returns Whether it writes one.
 */
const writesSsmlRead = (tree: Tree, element: NodeRow<Composed>): boolean =>
  ssmlReads.some(
    ([name, kinds]: readonly [Composed["name"], readonly string[]]) =>
      kinds.includes(element.kind) && Option.isSome(lexicalOf(tree, element.start, name)),
  );

/**
 * Build the rows a document's SSML attributes give (spec reading 3): the `SsmlScope` of each
 * element on the walk up from an element that writes an attribute reading 3 reads to its fragment.
 * The database reads the attributes where they stand, in the fragment their element's scope names.
 *
 * @param tree - The document's tree.
 * @returns The rows, each by its key text.
 */
const ssmlRowsOf = (tree: Tree): Pick<IdentityRows, "SsmlScope"> => {
  const { place } = tree;
  const scopes = new Map<string, Addition<typeof SsmlScope>>();

  for (const element of tree.rows.nodes.filter((node) => writesSsmlRead(tree, node))) {
    const { scope: fragment, walk } = scopeWalkOf(tree, element, "ssml:speak");
    for (const node of walk) {
      scopes.set(keyTextOf(place.package, place.path, node.start), {
        ...place,
        fragment,
        start: node.start,
      });
    }
  }

  return { SsmlScope: scopes };
};

/**
 * Build the rows a document's `xml:lang`s give: each element on the walk up from an `xml:lang`'s
 * element to its scope, the position of its nearest `qti-catalog-info` or of the document node
 * (reading R9-c), its `CatalogScope`, the element's own among them. R26 reads the forms whose
 * element's scope is the document node.
 *
 * @param tree - The document's tree.
 * @returns The rows, each by its key text.
 */
const langRowsOf = (tree: Tree): Pick<IdentityRows, "CatalogScope"> => {
  const { place } = tree;
  const scopes = new Map<string, Addition<typeof CatalogScope>>();

  for (const { name, start } of tree.rows.attributes) {
    if (name !== "xml:lang") {
      continue;
    }

    const { scope, walk } = scopeWalkOf(tree, tree.nodeAt(start), "qti-catalog-info");

    for (const node of walk) {
      scopes.set(keyTextOf(place.package, place.path, node.start), {
        ...place,
        scope,
        start: node.start,
      });
    }
  }

  return { CatalogScope: scopes };
};

/**
 * Read a document's nodes by position, each an element a row names or its parent, which `flatten`
 * writes before every row that names it.
 *
 * @param rows - The document's rows.
 * @param path - The document's path, which a defect names.
 * @returns The node at a position; it throws, a defect of the caller, never of the document, where
 *   the document holds no node there.
 */
const nodesOf = (
  rows: FlatRows<Composed>,
  path: string,
): ((start: bigint) => NodeRow<Composed>) => {
  const byStart = new Map(rows.nodes.map((node) => [node.start, node] as const));

  return (start) => {
    const node = byStart.get(start);
    if (node === undefined) {
      throw new Error(
        `A row of ${path} names the node at ${String(start)}, which the document holds no row of, but flatten writes every node before a row that names it. Read the rows flatten writes as it writes them.`,
      );
    }

    return node;
  };
};

/**
 * Build a document's identity rows.
 *
 * Each overlay holds one row per element it describes, keyed by the element, `(package, path,
 * start)`, and each projection one row per value, so a value an element repeats is one row. A
 * copied text is of any length, a key holding it by its image (`#pantry/qti/limits.ts`).
 *
 * @param view - The document's view, whose tree and rows it reads.
 * @param ids - Where it stands in its package.
 * @returns Every identity relation's rows.
 * @throws {Error} When a row of the document names a position its document holds no node at, which
 *   `flatten` rules out: a defect of the caller, never of the document.
 */
export const rowsOf = (view: DocumentView, ids: IdentityIds): IdentityRows => {
  const { rows } = view;
  const place: Place = { package: ids.package, path: ids.path };
  const tree: Tree = {
    attributes: view.attributes,
    nodeAt: nodesOf(rows, ids.path),
    place,
    rootKind: view.tree.root.kind,
    rows,
    stringValueOf: stringValuesOf(rows),
  };
  const attributed = attributeRowsOf(tree);
  const texts = textRowsOf(tree);
  const documentIds = new Map([...texts.DocumentId, ...attributed.DocumentId]);
  const shares = shareFragmentsOf(tree, ids.assembled);
  const targets = [
    ...rows.attributes.flatMap((attribute) =>
      holdsIdref(attribute, tree.nodeAt(attribute.start))
        ? tokensOf(attribute.lexical).map(({ token }) => token)
        : [],
    ),
    ...[...texts.IdentityText.values()].flatMap(({ tokens }) => tokens.map(({ token }) => token)),
    ...[...shares.values()].map(({ id }) => id),
  ];

  return {
    ...attributed,
    ...langRowsOf(tree),
    ...ssmlRowsOf(tree),
    DocumentId: documentIds,
    IdentityText: texts.IdentityText,
    IdrefTarget: new Map(
      targets.map((id) => [
        keyTextOf(place.package, place.path, id),
        { ...place, assembled: ids.assembled, id },
      ]),
    ),
    ShareFragment: shares,
  };
};

/**
 * One ID of a document beside its value, as the database's `IdValue` holds it
 * (`#pantry/qti/names.ts`): its {@link DocumentId} row, and `id`, the ID's value.
 */
export type IdValueRow = Addition<typeof DocumentId> & { readonly id: string };

/**
 * Read a document's text IDs with their values, `IdValue`'s rule for a text: each beside its
 * element's string value collapsed (`Text.collapse`, an `xs:ID`'s whiteSpace).
 *
 * @param rows - The document's rows.
 * @param texts - Its `DocumentId` rows bound to another element than their own, its texts' IDs.
 * @returns Each beside its value; none, reading no text, for a document with no text ID.
 */
const textIdValuesOf = (
  rows: FlatRows<Composed>,
  texts: readonly Addition<typeof DocumentId>[],
): readonly IdValueRow[] => {
  if (texts.length === 0) {
    return [];
  }

  const stringValueOf = stringValuesOf(rows);

  return texts.map((row) => ({ ...row, id: collapse(stringValueOf(row.start)) }));
};

/**
 * Read a document's IDs with their values, the host's twin of the database's `IdValue`
 * (`#pantry/qti/names.ts`), over the rows it reads, its two rules each restated:
 *
 * - **an attribute's:** each ID-typed attribute ({@link holdsId}) of an element whose
 *   {@link DocumentId}'s `owner` is its `start`, beside its value, the lexical form normalized in
 *   its domain's class under its element's governor ({@link attributeValueOf}), `Attribute`'s
 *   `value`;
 * - **a text's:** each other `DocumentId`, beside its element's string value collapsed.
 *
 * @param view - The document's view, whose rows the IDs are of.
 * @param ids - The document's `DocumentId` rows ({@link rowsOf}'s).
 * @returns Each ID beside its value.
 * @throws {Error} When an attribute of the document names a position its document holds no node at,
 *   which `flatten` rules out: a defect of the caller, never of the document.
 */
export const idValuesOf = (
  view: DocumentView,
  ids: Iterable<Addition<typeof DocumentId>>,
): readonly IdValueRow[] => {
  const held = [...ids];
  const [first] = held;
  if (first === undefined) {
    return [];
  }

  const { rows } = view;
  const nodeAt = nodesOf(rows, first.path);
  const owners = new Map(
    held.flatMap((row) => (row.owner === row.start ? [[row.start, row] as const] : [])),
  );

  return [
    ...rows.attributes.flatMap((attribute) =>
      Option.toArray(Option.fromUndefinedOr(owners.get(attribute.start))).flatMap((row) => {
        const element = nodeAt(attribute.start);

        return holdsId(attribute, element)
          ? [
              {
                ...row,
                id: attributeValueOf(governorOfElement(element), attribute.name, attribute.lexical),
              },
            ]
          : [];
      }),
    ),
    ...textIdValuesOf(
      rows,
      held.filter(({ owner, start }) => owner !== start),
    ),
  ];
};

/**
 * Pair each row of one set with each row of another that shares its key, as an inner join does:
 * the left rows in their order, each with its partners in theirs. A left row no right row shares a
 * key with pairs with none, and a right row no left row shares one with is in no pair.
 *
 * @param left - The left rows.
 * @param right - The right rows.
 * @param leftKey - A left row's key.
 * @param rightKey - A right row's key.
 * @returns The pairs.
 */
const joined = <Left, Right, Key>(
  left: Iterable<Left>,
  right: Iterable<Right>,
  leftKey: (row: Left) => Key,
  rightKey: (row: Right) => Key,
): readonly (readonly [Left, Right])[] => {
  const partners = Map.groupBy(right, rightKey);

  return [...left].flatMap((row) =>
    Option.match(Option.fromUndefinedOr(partners.get(leftKey(row))), {
      onNone: () => [],
      onSome: (group) => group.map((partner) => [row, partner] as const),
    }),
  );
};

/**
 * One instance of an assembly as the placements read it: its assembly, `(package, assembly)` and
 * its kind, its own position `instance` in the assembly's instance tree, and the path of the
 * document it places.
 */
interface Placement {
  readonly assembly: InstanceRoot["assembly"];
  readonly assemblyKind: InstanceRoot["assemblyKind"];
  readonly document: InstanceRoot["document"];
  readonly instance: bigint;
  readonly package: InstanceRoot["package"];
}

/**
 * Number every instance of an assembly's tree by its pre-order position, `Instance.start`, as the
 * instance tree draws it: the root 0, then each child's subtree in slot order.
 *
 * @param root - The assembly's root instance.
 * @returns Each instance's placement, in pre-order.
 */
const placementsOf = (root: InstanceRoot): readonly Placement[] => {
  const found: Placement[] = [];
  const pending: (InstanceMember | InstanceRoot)[] = [root];
  for (let next = pending.pop(); next !== undefined; next = pending.pop()) {
    found.push({
      assembly: root.assembly,
      assemblyKind: root.assemblyKind,
      document: next.document,
      instance: BigInt(found.length),
      package: root.package,
    });
    pending.push(...next.children.toReversed());
  }

  return found;
};

/**
 * The key a placement and a document's row meet at: the document, `(package, path)`.
 *
 * @param document - The document's identity.
 * @param document.package - Its package.
 * @param document.path - Its path.
 * @returns The key text.
 */
const documentKey = (document: { readonly package: string; readonly path: string }): string =>
  keyTextOf(document.package, document.path);

/**
 * The key a placement meets its document's rows at ({@link documentKey}): its package and the path
 * of the document it places.
 *
 * @param placement - The placement.
 * @returns The key text.
 */
const placementKey = (placement: Placement): string =>
  documentKey({ package: placement.package, path: placement.document });

/**
 * Build a package's placed IDs and IDREF targets (spec reading 117): under each instance of each
 * assembly, every ID and every `IdrefTarget` of the instance's document, a placed ID's `id` its
 * document ID's value, as `IdValue` holds it.
 *
 * @param input - The package's rows the placements read.
 * @param input.ids - Every document's IDs beside their values ({@link idValuesOf}).
 * @param input.instances - Every assembly's root instance, its tree nested (Q5.13's
 *   `assembledRowsOf`).
 * @param input.targets - Every document's IDREF targets ({@link rowsOf}'s `IdrefTarget`).
 * @returns The rows.
 */
export const placedIdRowsOf = (input: {
  readonly ids: Iterable<IdValueRow>;
  readonly instances: Iterable<InstanceRoot>;
  readonly targets: Iterable<Addition<typeof IdrefTarget>>;
}): PlacedIdRows => {
  const placements = [...input.instances].flatMap(placementsOf);
  const placed = new Map<string, Addition<typeof PlacedId>>();
  const placedTargets = new Map<string, Addition<typeof PlacedIdref>>();
  for (const [placement, { id, owner, path, start }] of joined(
    placements,
    input.ids,
    placementKey,
    documentKey,
  )) {
    const { assembly, assemblyKind, instance } = placement;
    placed.set(keyTextOf(placement.package, assembly, instance, start), {
      assembly,
      assemblyKind,
      id,
      instance,
      owner,
      package: placement.package,
      path,
      start,
    });
  }

  for (const [placement, { id, path }] of joined(
    placements,
    input.targets,
    placementKey,
    documentKey,
  )) {
    const { assembly, instance } = placement;
    placedTargets.set(keyTextOf(placement.package, assembly, instance, id), {
      assembly,
      id,
      instance,
      package: placement.package,
      path,
    });
  }

  return { PlacedId: placed, PlacedIdref: placedTargets };
};
