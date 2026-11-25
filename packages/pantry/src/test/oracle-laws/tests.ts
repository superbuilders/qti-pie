/**
 * The producers of the law oracle's laws over tests, sections, banks and what they hold (O7, lane
 * OL): each stated on the host from its source in the law catalog and the schema's statement of it
 * in `src/qti/tests.ts` and `src/qti/overlay-queries/tests.ts`, over the documents and assemblies
 * `#pantry/test/oracle-laws/assembly.ts` reads.
 *
 * - **One document** ({@link documentLawsOf}, {@link stimulusRefKeyOf}): `Structure identifier`, the
 *   key `(document, identifier)` over its names (A4); `Selection bound` and `Selection required`, a
 *   section selects at most its parts without replacement (§5.129.1, reading 79) and at least its
 *   required parts (§4.2.2); `Weight key`, no two weights of one item ref share an identifier
 *   (§7.50.1); `Weighted base`, a weighted test variables writes no `base-type` but float (§7.39.5,
 *   reading 167); `Stimulus ref key`, no two stimulus refs of one item share an identifier
 *   (§7.6.2).
 * - **The items an item ref names** ({@link itemRefTargetsOf}, {@link itemRefLawsOf}): `Item ref
 *   target`, its href names an item or an LTI link of the package (B2, B3); `Item ref identifier`,
 *   a named item ref's identifier is its item's (QTI §4.1.1); `Variable mapping source` and
 *   `Variable mapping target`, a mapping maps an outcome its item declares onto a name no other
 *   variable of the item holds, no session variable and no other mapping's target (§7.48, readings
 *   97 and 110); `Template default target`, a template default's item ref, where its href names a
 *   path of the package, names an item that declares its template (§5.152.1, readings 108 and 110;
 *   SV-LAW-02).
 * - **Each test's assembly** ({@link assemblyLawsOf}): `Test name key`, no two elements of one copy
 *   share an identifier, a fragment included twice there among them, and no two distinct elements
 *   of the test do, a section document a test references twice counting once (§4.2.1, §7.5.3,
 *   reading 86); `Branch target` and `Branch forward`, each branch rule that names no exit names,
 *   in each placement of its document, an element it may jump to after it, or the root of a
 *   fragment an include places (§2.12, §5.23, §5.98, §7.5, reading 87); `Section identifier
 *   target`, a `section-identifier` names exactly one section or section ref placement of the test
 *   (§7.27.1, §7.28.1, §7.39.1).
 */
import { Option } from "effect";
import type { ComposedGrammar } from "#pantry/grammar/compose.ts";
import {
  anchorsOf,
  assembledDocumentsOf,
  isLinkType,
  itemRefDocument,
  itemRefTargetOf,
  placedPartOf,
  replaceableIn,
  shownName,
  testKinds,
  testsOf,
  writtenFlagOf,
} from "#pantry/test/oracle-laws/assembly.ts";
import type {
  AssembledDocument,
  Instance,
  Rule,
  Section,
} from "#pantry/test/oracle-laws/assembly.ts";
import {
  breachAt,
  elementsOf,
  resolvedAt,
  typedValueOf,
  valueOf,
} from "#pantry/test/oracle-view.ts";
import type { LawBreach, ListedRows, PackageRows, Row, View } from "#pantry/test/oracle-view.ts";

/**
 * The laws this module produces.
 */
export const testLaws = [
  "Structure identifier",
  "Stimulus ref key",
  "Item ref target",
  "Item ref identifier",
  "Test name key",
  "Selection bound",
  "Selection required",
  "Branch target",
  "Branch forward",
  "Section identifier target",
  "Weighted base",
  "Weight key",
  "Variable mapping source",
  "Variable mapping target",
  "Template default target",
] as const;

/**
 * A law of {@link testLaws}.
 */
type TestLaw = (typeof testLaws)[number];

/**
 * A breach of one of this module's laws at a node.
 */
type Breach = LawBreach<TestLaw>;

/**
 * The structure kinds a branch rule of an item ref, a section or a section ref may name (§5.23:
 * "In the case of an item or section, the target must refer to an item or section"; a section ref
 * is the facade of its section, §7.5).
 */
const branchingKinds: ReadonlySet<string> = new Set([
  testKinds.itemRef,
  testKinds.section,
  testKinds.sectionRef,
]);

/**
 * The expressions that filter the items they read by a section (§7.27.1, §7.28.1, §7.39.1: "If
 * specified, only variables from items in the qti-assessment-section with matching identifier are
 * matched").
 */
const sectionFilterKinds: ReadonlySet<string> = new Set([
  "qti-number-correct",
  "qti-number-incorrect",
  "qti-number-presented",
  "qti-number-responded",
  "qti-number-selected",
  "qti-outcome-maximum",
  "qti-outcome-minimum",
  "qti-test-variables",
]);

/**
 * The kinds a section filter names: a section, and a section ref, the facade of its placement
 * (§7.5).
 */
const filteredKinds: ReadonlySet<string> = new Set([testKinds.section, testKinds.sectionRef]);

/**
 * The sites whose target a shuffle above them mixes in where its root is loose: a section ref and
 * an include (§7.5, reading 87).
 */
const mixingSites: ReadonlySet<string> = new Set([testKinds.sectionRef, testKinds.include]);

/**
 * Group the members of a list by a key, each group in list order, and break a key at every member
 * after a group's first.
 *
 * @param held - The members.
 * @param keyOf - Each member's key.
 * @param breach - The breach at a repeated member, given the group's first.
 * @returns The breaches.
 */
const repeatsOf = <A>(
  held: readonly A[],
  keyOf: (member: A) => string,
  breach: (member: A, first: A) => Breach,
): readonly Breach[] =>
  [...Map.groupBy(held, keyOf).values()].flatMap(([first, ...rest]) =>
    first === undefined ? [] : rest.map((member) => breach(member, first)),
  );

/**
 * Judge one document's names: no two share an identifier (A4).
 *
 * @param document - The document.
 * @returns The breaches.
 */
const documentLawsOf = (document: AssembledDocument): readonly Breach[] =>
  repeatsOf(
    document.names,
    ({ identifier }) => identifier,
    (name, first) =>
      breachAt(document.listed.rows, name.node, "Structure identifier", {
        identifier: name.identifier,
        kind: name.node.kind,
        other: first.node.kind,
      }),
  );

/**
 * Judge each section of a document that selects: without replacement it selects at most its parts
 * (§5.129.1: "The number of children to select may exceed the number of child elements defined
 * only if with-replacement is true"), each part counted once (reading 79), and it selects at least
 * its parts that write `required` true (§4.2.2: "It is an error if a section contains a selection
 * rule that selects fewer child elements than the number of required elements it contains").
 *
 * @param document - The document.
 * @returns The breaches.
 */
const selectionLawsOf = (document: AssembledDocument): readonly Breach[] => {
  const { rows } = document.listed;

  return [...document.sections.values()].flatMap((section): readonly Breach[] =>
    Option.toArray(section.select).flatMap((select) => {
      const parts = BigInt(section.parts.length);
      const required = BigInt(
        section.parts.filter(({ start }) =>
          Option.contains(writtenFlagOf(rows, start, "required"), true),
        ).length,
      );

      return [
        ...(!section.replacing && select > parts
          ? [
              breachAt(rows, section.node, "Selection bound", {
                parts: String(parts),
                select: String(select),
              }),
            ]
          : []),
        ...(required > 0n && select < required
          ? [
              breachAt(rows, section.node, "Selection required", {
                required: String(required),
                select: String(select),
              }),
            ]
          : []),
      ];
    }),
  );
};

/**
 * Judge each weighted test variables of a document: it writes no `base-type` but float (§7.39.5:
 * "When a weighting is specified the result of the expression always has base-type float").
 *
 * @param rows - The document.
 * @returns The breaches.
 */
const weightedBaseOf = (rows: View): readonly Breach[] =>
  rows.members.flatMap((node): readonly Breach[] =>
    node.kind === "qti-test-variables" &&
    Option.isSome(valueOf(rows, node.start, "weight-identifier"))
      ? Option.toArray(valueOf(rows, node.start, "base-type")).flatMap((baseType) =>
          Option.contains(typedValueOf(rows, node.start, "base-type"), "float")
            ? []
            : [breachAt(rows, node, "Weighted base", { baseType })],
        )
      : [],
  );

/**
 * Judge each stimulus ref key of one listed document: no two of its stimulus refs share an
 * identifier, compared collapsed (§7.6.2: "each reference must have a unique identifier").
 *
 * @param listed - The document.
 * @returns The breaches.
 */
const stimulusRefKeyOf = (listed: ListedRows): readonly Breach[] => {
  const { rows } = listed;

  return repeatsOf(
    rows.members.flatMap((node) =>
      node.kind === "qti-assessment-stimulus-ref"
        ? Option.toArray(typedValueOf(rows, node.start, "identifier")).map((identifier) => ({
            identifier,
            node,
          }))
        : [],
    ),
    ({ identifier }) => identifier,
    ({ identifier, node }) => breachAt(rows, node, "Stimulus ref key", { identifier }),
  );
};

/**
 * Judge what each item ref of a listed document names, whether or not it writes an identifier: its
 * href, where it writes one inside the package, names an item or an LTI link of the package (B2,
 * B3), and one that writes none names nothing, which AL3 alone refuses (spec reading 155).
 *
 * @param input - The package.
 * @param listed - The document.
 * @returns The breaches.
 */
const itemRefTargetsOf = (input: PackageRows, listed: ListedRows): readonly Breach[] =>
  listed.rows.members
    .filter(({ kind }) => kind === testKinds.itemRef)
    .flatMap((node): readonly Breach[] =>
      Option.match(itemRefTargetOf(input, listed, node), {
        onNone: () => [],
        /**
         * The href names an LTI link, or an item document the package holds: an item resource's
         * href whose file is missing, or whose root is no item, names no item (§5.6.5).
         */
        onSome: ({ path, type }) =>
          Option.exists(type, isLinkType) || Option.isSome(itemRefDocument(input, listed, node))
            ? []
            : [breachAt(listed.rows, node, "Item ref target", { path })],
      }),
    );

/**
 * The names an item document declares, each with the kinds of the declarations that declare it
 * (`NamedDeclaration`).
 *
 * @param rows - The item document.
 * @param grammar - The composed grammar, whose declaration kinds it reads.
 * @returns Each declared name's declaration kinds.
 */
export const declaredNamesOf = (
  rows: View,
  grammar: ComposedGrammar,
): ReadonlyMap<string, readonly string[]> => {
  const declared = new Map<string, string[]>();
  for (const node of rows.members) {
    if (grammar.references.declarationKind.has(node.kind)) {
      for (const identifier of Option.toArray(typedValueOf(rows, node.start, "identifier"))) {
        declared.set(identifier, [...(declared.get(identifier) ?? []), node.kind]);
      }
    }
  }

  return declared;
};

/**
 * Whether an item ref's href names a path of the package (`ItemRefHref`): it writes one, and it
 * does not resolve outside the package.
 *
 * @param rows - The document.
 * @param ref - The item ref.
 * @returns Whether it does.
 */
const packaged = (rows: View, ref: Row): boolean =>
  ref.kind === testKinds.itemRef &&
  Option.exists(
    valueOf(rows, ref.start, "href"),
    (lexical) => resolvedAt(rows, ref.start, lexical).resolution.scope !== "external",
  );

/**
 * One child of an item ref that names a variable of its item: its node, its item ref and the
 * names it writes.
 */
interface Held<Names> {
  readonly names: Names;
  readonly node: Row;
  readonly ref: Row;
}

/**
 * The children of a kind of the item refs of a document, each with the names it writes, where it
 * writes every one as its type reads it.
 *
 * @param rows - The document.
 * @param kind - The children's kind.
 * @param read - Each child's names, none where it writes one outside its value domain or none.
 * @returns The children, in document order.
 */
const heldOf = <Names>(
  rows: View,
  kind: string,
  read: (node: Row) => Option.Option<Names>,
): readonly Held<Names>[] =>
  rows.members.flatMap((node): readonly Held<Names>[] => {
    const ref = rows.byStart.get(node.parent);

    return node.kind === kind && ref !== undefined
      ? Option.toArray(read(node)).map((names) => ({ names, node, ref }))
      : [];
  });

/**
 * Judge each item ref of a document by what it names in its item:
 *
 * - `Item ref identifier` (QTI §4.1.1: "When an Item is referenced using a 'qti-assesasment-item-ref'
 *   the values of the two 'identifier' characteristics MUST be the same"): a named item ref that
 *   names an item writes the item's identifier;
 * - `Weight key` (§7.50.1): no two weights of one item ref share an identifier;
 * - `Variable mapping source` and `Variable mapping target` (§7.48): a mapping of an item ref that
 *   names an item maps an outcome the item declares (A34), onto a name no other variable of the
 *   item holds (reading 97); no two mappings of one item ref share a target, and none targets an
 *   item session variable, whatever the ref names (reading 110);
 * - `Template default target` (§5.152.1): a template default's item ref names an item (reading 108:
 *   an LTI link has no template variable to default), which declares its template.
 *
 * @param input - The package.
 * @param document - The document.
 * @param grammar - The composed grammar.
 * @returns The breaches.
 */
const itemRefLawsOf = (
  input: PackageRows,
  document: AssembledDocument,
  grammar: ComposedGrammar,
): readonly Breach[] => {
  const { listed } = document;
  const { rows } = listed;
  const items = new Map<bigint, Option.Option<ListedRows>>();
  const itemOf = (ref: Row): Option.Option<ListedRows> => {
    const known = items.get(ref.start);
    if (known !== undefined) {
      return known;
    }

    const item =
      ref.kind === testKinds.itemRef ? itemRefDocument(input, listed, ref) : Option.none();
    items.set(ref.start, item);

    return item;
  };
  const declarations = new Map<string, ReadonlyMap<string, readonly string[]>>();
  const declaredIn = (item: ListedRows): ReadonlyMap<string, readonly string[]> => {
    const known = declarations.get(item.path);
    if (known !== undefined) {
      return known;
    }

    const declared = declaredNamesOf(item.rows, grammar);
    declarations.set(item.path, declared);

    return declared;
  };
  const sessionVariables = new Set(
    grammar.references.builtIn.rows
      .filter(
        ({ declaration, root }) =>
          root === testKinds.item && declaration !== "qti-context-declaration",
      )
      .map(({ variable }) => variable),
  );
  const itemRef = (ref: Row): string => shownName(rows, ref);
  const weights = heldOf(rows, "qti-weight", (node) =>
    typedValueOf(rows, node.start, "identifier"),
  );
  const mappings = heldOf(rows, "qti-variable-mapping", (node) =>
    Option.all({
      source: typedValueOf(rows, node.start, "source-identifier"),
      target: typedValueOf(rows, node.start, "target-identifier"),
    }),
  );
  const defaults = heldOf(rows, "qti-template-default", (node) =>
    typedValueOf(rows, node.start, "template-identifier"),
  );

  return [
    ...document.names
      .filter(({ node }) => node.kind === testKinds.itemRef)
      .flatMap(({ identifier, node }): readonly Breach[] =>
        Option.toArray(itemOf(node)).flatMap((item) => {
          const held = item.rows.root.pipe(
            Option.flatMap(({ start }) => typedValueOf(item.rows, start, "identifier")),
          );

          return Option.contains(held, identifier)
            ? []
            : [
                breachAt(rows, node, "Item ref identifier", {
                  identifier,
                  item: Option.getOrElse(held, () => item.path),
                }),
              ];
        }),
      ),
    ...repeatsOf(
      weights,
      ({ names, ref }) => `${String(ref.start)} ${names}`,
      ({ names, node, ref }) =>
        breachAt(rows, node, "Weight key", { identifier: names, itemRef: itemRef(ref) }),
    ),
    ...repeatsOf(
      mappings,
      ({ names, ref }) => `${String(ref.start)} ${names.target}`,
      ({ names, node, ref }) =>
        breachAt(rows, node, "Variable mapping target", {
          itemRef: itemRef(ref),
          target: names.target,
        }),
    ),
    ...mappings.flatMap(({ names: { source, target }, node, ref }): readonly Breach[] => {
      const keys = { itemRef: itemRef(ref), source, target };
      const declared = Option.map(itemOf(ref), declaredIn);

      return [
        ...(sessionVariables.has(target)
          ? [breachAt(rows, node, "Variable mapping target", keys)]
          : []),
        ...Option.toArray(declared).flatMap((names): readonly Breach[] => [
          ...((names.get(source) ?? []).includes("qti-outcome-declaration")
            ? []
            : [breachAt(rows, node, "Variable mapping source", keys)]),
          ...(target !== source && names.has(target)
            ? [breachAt(rows, node, "Variable mapping target", keys)]
            : []),
        ]),
      ];
    }),
    ...defaults.flatMap(({ names: template, node, ref }): readonly Breach[] => {
      const keys = { itemRef: itemRef(ref), template };

      return Option.match(itemOf(ref), {
        /**
         * An item ref whose href lies outside the package, or that writes none, names nothing a
         * law reads (SV-LAW-02): its template default is stored unchecked.
         */
        onNone: () =>
          packaged(rows, ref) ? [breachAt(rows, node, "Template default target", keys)] : [],
        onSome: (item) =>
          (declaredIn(item).get(template) ?? []).includes("qti-template-declaration")
            ? []
            : [breachAt(rows, node, "Template default target", keys)],
      });
    }),
  ];
};

/**
 * One element a placed branch rule's target names in an instance that holds the rule's (spec
 * reading 87): where it stands, `named`, in the target's instance and document, with its kind; the
 * source's point in that document, the rule's owner where the two are one instance and else the
 * site there that places the source's chain; and the element whose test part and repetition are
 * the target's, `part`. From outside a section document a ref places, no target lies inside it
 * (§7.5: "branching rules should treat referred sections as leaf nodes"). An included fragment's
 * root stands at its include, an include being "treated as if it was actually an instance of the
 * root element of the fragment referred to" (§2.12), so its order is the include's place in the
 * holder's document, and its part and its repetition are its placed root's.
 */
interface Candidate {
  readonly kind: string;
  readonly named: Row;
  readonly part: { readonly instance: Instance; readonly node: Row };
  readonly point: Row;
  readonly target: Instance;
}

/**
 * Find every element a branch rule placed in an instance names: in its own instance, and in each
 * of its ancestors, and the root of each fragment an include of one of those instances' documents
 * places ("Adaptive test branch rules can only refer to included or directly referenced sections",
 * §7.5).
 *
 * @param instances - The assembly.
 * @param instance - The rule's instance.
 * @param rule - The rule.
 * @returns The candidates.
 */
const candidatesOf = (
  instances: readonly Instance[],
  instance: Instance,
  rule: Rule,
): readonly Candidate[] => {
  const named = (target: Instance, point: Row): readonly Candidate[] => [
    ...target.document.names
      .filter(({ identifier }) => identifier === rule.target)
      .map(({ node }) => ({
        kind: node.kind,
        named: node,
        part: { instance: target, node },
        point,
        target,
      })),
    ...instances.flatMap((included): readonly Candidate[] =>
      Option.match(included.from, {
        onNone: () => [],
        onSome: ({ parent, site }) =>
          parent === target.start && site.kind === testKinds.include
            ? Option.toArray(
                included.document.listed.rows.root.pipe(
                  Option.flatMap(({ start }) =>
                    Option.fromUndefinedOr(included.document.namesByNode.get(start)),
                  ),
                ),
              )
                .filter(({ identifier }) => identifier === rule.target)
                .map((root) => ({
                  kind: root.node.kind,
                  named: site,
                  part: { instance: included, node: root.node },
                  point,
                  target,
                }))
            : [],
      }),
    ),
  ];
  const found = [...named(instance, rule.owner)];
  let via = instance;
  while (Option.isSome(via.from)) {
    const { parent, site } = via.from.value;
    const ancestor = instances[parent];
    if (ancestor === undefined) {
      break;
    }

    for (const each of named(ancestor, site)) {
      found.push(each);
    }
    via = ancestor;
  }

  return found;
};

/**
 * Whether a candidate is an element its rule may jump to (§5.23: "In the case of an item or
 * section, the target must refer to an item or section in the same test-part ... For test-parts,
 * the target must refer to another test-part"; §5.98: "It is therefore an error to make such an
 * item the target of a branch-rule", of an item ref a selection with replacement can repeat): a
 * test part's rule names another test part, and an item ref's, a section's or a section ref's rule
 * names one of those kinds in its own test part, never an item ref a replacement can repeat in its
 * placement. A source with no name has no test part to share, so it may jump nowhere.
 *
 * @param instance - The rule's instance.
 * @param rule - The rule.
 * @param candidate - The candidate.
 * @returns Whether it may.
 */
const targets = (instance: Instance, rule: Rule, candidate: Candidate): boolean => {
  const { kind, named, part, point } = candidate;
  if (rule.owner.kind === testKinds.part) {
    return kind === testKinds.part && named.start !== point.start;
  }

  return (
    branchingKinds.has(rule.owner.kind) &&
    branchingKinds.has(kind) &&
    instance.document.namesByNode.has(rule.owner.start) &&
    Option.exists(placedPartOf(instance, rule.owner), (held) =>
      Option.contains(placedPartOf(part.instance, part.node), held),
    ) &&
    !replaceableIn(part.instance, part.node)
  );
};

/**
 * The pools of one document's shuffles (§5.98): each section that shuffles and that no pool mixes
 * in owns one, which holds it and every invisible section not kept together that a section of the
 * pool holds, at any depth; its blocks are the children of its sections of a section part's kind
 * that are no mixed section, each moved whole, a site (a section ref or an include) among them; and
 * whether a section of it selects with replacement.
 */
interface Pool {
  readonly blocks: readonly Row[];
  readonly replacing: boolean;
}

/**
 * Read a document's pools, by the start of each section of each, a section in at most one pool
 * whose owner no pool mixes in.
 *
 * @param document - The document.
 * @param grammar - The composed grammar, whose section parts it reads.
 * @returns Each pool section's pool.
 */
const poolsOf = (
  document: AssembledDocument,
  grammar: ComposedGrammar,
): ReadonlyMap<bigint, Pool> => {
  const partKinds = new Set(grammar.references.sectionPart.rows.map(({ kind }) => kind));
  const sections = [...document.sections.values()].toSorted((left, right) =>
    Number(left.node.start - right.node.start),
  );
  /**
   * Each section's owners: itself where it shuffles, and its parent section's where it mixes in.
   */
  const owners = new Map<bigint, readonly bigint[]>();
  for (const section of sections) {
    owners.set(section.node.start, [
      ...(section.shuffles ? [section.node.start] : []),
      ...(section.loose ? (owners.get(section.node.parent) ?? []) : []),
    ]);
  }

  const mixedIn = (section: Section): boolean =>
    section.loose && (owners.get(section.node.parent) ?? []).length > 0;
  const pools = new Map<bigint, { blocks: Row[]; replacing: boolean; sections: bigint[] }>();
  for (const section of sections) {
    for (const owner of owners.get(section.node.start) ?? []) {
      const ownerSection = document.sections.get(owner);
      if (!(ownerSection !== undefined && !mixedIn(ownerSection))) {
        continue;
      }

      const pool = pools.get(owner) ?? { blocks: [], replacing: false, sections: [] };
      pool.sections.push(section.node.start);
      pool.replacing ||= section.replacing;
      for (const each of elementsOf(document.listed.rows, section.node.start).filter(
        (child) =>
          partKinds.has(child.kind) &&
          !Option.exists(Option.fromUndefinedOr(document.sections.get(child.start)), mixedIn),
      )) {
        pool.blocks.push(each);
      }
      pools.set(owner, pool);
    }
  }

  return new Map(
    [...pools.values()].flatMap((pool) =>
      pool.sections.map(
        (section) => [section, { blocks: pool.blocks, replacing: pool.replacing }] as const,
      ),
    ),
  );
};

/**
 * Whether a block holds a node: its interval holds the node's.
 *
 * @param node - The node.
 * @returns The test over a block.
 */
const holding =
  (node: Row) =>
  (block: Row): boolean =>
    block.start <= node.start && node.end <= block.end;

/**
 * Whether a branch rule's target precedes its source in every sequence its pool's shuffle can
 * draw (§4.2.3, §5.6.3: "If a child element is fixed it must never be shuffled ... If the section
 * is subject to shuffling but B is fixed then permutations such as {A,C,B} are not allowed whereas
 * permutations like {C,B,A} are permitted"): a fixed block keeps its place among the selected
 * blocks and the unfixed blocks take the rest, so for a candidate whose source and target lie in
 * two blocks of the pool that draws the nearest section above both, with no replacement, the
 * target comes first always where both blocks are fixed, where the target's is fixed and every
 * unfixed block comes after it, or where the source's is fixed and every unfixed block comes
 * before it. A pool mixed in from another document is not read: its order stays drawn.
 *
 * @param candidates - The rule's targeted candidates.
 * @param nearest - The nearest section above a candidate and its point.
 * @param pools - Each document's pools, by path.
 * @returns Whether a candidate is so held backward.
 */
const fixedBackward = (
  candidates: readonly Candidate[],
  nearest: Option.Option<bigint>,
  pools: (document: AssembledDocument) => ReadonlyMap<bigint, Pool>,
): boolean =>
  candidates.some(({ named, point, target }) =>
    Option.exists(
      nearest.pipe(
        Option.flatMap((section) => Option.fromUndefinedOr(pools(target.document).get(section))),
      ),
      (pool) => {
        const { rows } = target.document.listed;
        const fixed = (block: Row): boolean =>
          Option.contains(writtenFlagOf(rows, block.start, "fixed"), true);
        const source = pool.blocks.find(holding(point));
        const held = pool.blocks.find(holding(named));
        const unfixed = pool.blocks.filter((block) => !fixed(block)).map(({ start }) => start);
        if (pool.replacing || source === undefined || held === undefined) {
          return false;
        }

        return (
          (fixed(source) && fixed(held)) ||
          (fixed(held) && unfixed.length > 0 && unfixed.every((block) => block > held.start)) ||
          (fixed(source) && unfixed.length > 0 && unfixed.every((block) => block < source.start))
        );
      },
    ),
  );

/**
 * The sections of each instance whose children a shuffle can reorder in that placement (§5.98,
 * spec readings 87 and 173): a section that shuffles; a loose section under one, its children
 * "mixed into the parent's selection prior to shuffling"; and the loose root section of a document
 * a section ref or an include places directly under one, since a section ref is the facade of its
 * section (§7.5).
 *
 * @param instances - The assembly, in pre-order.
 * @returns Each instance's shuffled sections' starts, by the instance's place.
 */
const shuffledSectionsOf = (instances: readonly Instance[]): readonly ReadonlySet<bigint>[] => {
  const shuffled: ReadonlySet<bigint>[] = [];
  for (const instance of instances) {
    const { document } = instance;
    const entered = Option.exists(
      instance.from,
      ({ parent, site }) =>
        mixingSites.has(site.kind) && (shuffled[parent]?.has(site.parent) ?? false),
    );
    const held = new Set<bigint>();
    for (const section of [...document.sections.values()].toSorted((left, right) =>
      Number(left.node.start - right.node.start),
    )) {
      const root = section.node.parentKind === "document";
      if (section.shuffles || (section.loose && (root ? entered : held.has(section.node.parent)))) {
        held.add(section.node.start);
      }
    }

    shuffled.push(held);
  }

  return shuffled;
};

/**
 * Judge one placement of a branch rule: its target names an element it may jump to
 * (`Branch target`), and one that comes after its source in every sequence a delivery can draw
 * (`Branch forward`; §5.23: the target "has not yet been presented"; §2.8.3.2: "cycles are not
 * allowed"): a target that starts at or after its source's point ends, or one wholly before it
 * whose order the nearest section above both draws, a shuffle in that placement, where no `fixed`
 * holds it before the source in every draw ({@link fixedBackward}).
 *
 * @param instances - The assembly.
 * @param shuffled - Each instance's shuffled sections.
 * @param pools - Each document's pools.
 * @param instance - The rule's instance.
 * @param rule - The rule.
 * @returns The breaches, at most one.
 */
const branchLawsOf = (
  instances: readonly Instance[],
  shuffled: readonly ReadonlySet<bigint>[],
  pools: (document: AssembledDocument) => ReadonlyMap<bigint, Pool>,
  instance: Instance,
  rule: Rule,
): readonly Breach[] => {
  const { rows } = instance.document.listed;
  const keys = { owner: shownName(rows, rule.owner), target: rule.target };
  const targeted = candidatesOf(instances, instance, rule).filter((candidate) =>
    targets(instance, rule, candidate),
  );
  if (targeted.length === 0) {
    return [breachAt(rows, rule.node, "Branch target", keys)];
  }

  /**
   * The section nearest above a candidate and its source's point, the one with the greatest start,
   * whose ordering orders the two (§5.98).
   */
  const commons = targeted.flatMap(({ named, point, target }) =>
    [...target.document.sections.values()]
      .filter(
        ({ node }) =>
          node.start < point.start &&
          point.end <= node.end &&
          node.start < named.start &&
          named.end <= node.end,
      )
      .map(({ node }) => node.start),
  );
  const nearest = Option.fromUndefinedOr(
    commons.toSorted((left, right) => (left < right ? 1 : -1)).at(0),
  );
  const forward =
    targeted.some(({ named, point }) => named.start >= point.end) ||
    (targeted.some(
      ({ named, point, target }) =>
        named.end <= point.start &&
        Option.exists(nearest, (section) => shuffled[target.start]?.has(section) ?? false),
    ) &&
      !fixedBackward(targeted, nearest, pools));

  return forward ? [] : [breachAt(rows, rule.node, "Branch forward", keys)];
};

/**
 * Judge one test's assembly: its names' key across every document it places, each placement of
 * each branch rule, and each section filter it places.
 *
 * @param test - The test document.
 * @param instances - Its assembly.
 * @param grammar - The composed grammar, whose section parts a pool's blocks are.
 * @returns The breaches, each at most once per element.
 */
const assemblyLawsOf = (
  test: AssembledDocument,
  instances: readonly Instance[],
  grammar: ComposedGrammar,
): readonly Breach[] => {
  const documents = [
    ...new Map(instances.map(({ document }) => [document.listed.path, document] as const)).values(),
  ];
  const shuffled = shuffledSectionsOf(instances);
  const pools = new Map<string, ReadonlyMap<bigint, Pool>>();
  const poolsIn = (document: AssembledDocument): ReadonlyMap<bigint, Pool> => {
    const known = pools.get(document.listed.path);
    if (known !== undefined) {
      return known;
    }

    const read = poolsOf(document, grammar);
    pools.set(document.listed.path, read);

    return read;
  };
  const testPath = test.listed.path;
  const anchors = anchorsOf(instances);
  /**
   * Each name of each instance, with its copy: the anchor that holds it (`instanceAnchors`).
   */
  const placed = instances.flatMap(({ document, start }) =>
    document.names.map((name) => ({
      anchor: anchors[start] ?? 0,
      anchorDocument: instances[anchors[start] ?? 0]?.document.listed.path ?? "",
      document,
      instance: start,
      name,
    })),
  );
  const named = (
    held: readonly (typeof placed)[number][],
    keyOf: (row: (typeof placed)[number]) => string,
  ): readonly Breach[] =>
    repeatsOf(held, keyOf, ({ document, name }, first) =>
      breachAt(document.listed.rows, name.node, "Test name key", {
        identifier: name.identifier,
        kind: name.node.kind,
        other: first.name.node.kind,
        test: testPath,
      }),
    );
  const nameBreaches = [
    // Within a copy (`AnchoredName`): no two elements of one copy share an identifier, an included
    // fragment placed twice there among them, as XInclude's merged document holds it twice.
    ...named(
      [
        ...new Map(
          placed.map((row) => [
            `${String(row.anchor)} ${String(row.instance)} ${row.document.listed.path} ${String(row.name.node.start)}`,
            row,
          ]),
        ).values(),
      ],
      ({ anchor, name }) => `${String(anchor)} ${name.identifier}`,
    ),
    // Across the test (`AssembledName`): two copies of one section document hold its elements once
    // (§7.5.3: "A test may refer to the same section multiple times within a test"), and every
    // other element is its own (§4.2.1: "The identifier of the section or item reference must be
    // unique within the test").
    ...named(
      [
        ...new Map(
          placed.map((row) => [
            `${row.anchorDocument} ${row.document.listed.path} ${String(row.name.node.start)}`,
            row,
          ]),
        ).values(),
      ],
      ({ name }) => name.identifier,
    ),
  ];
  const branches = new Map<string, Breach>();
  for (const instance of instances) {
    for (const rule of instance.document.rules) {
      for (const breach of branchLawsOf(instances, shuffled, poolsIn, instance, rule)) {
        branches.set(
          `${breach.law} ${instance.document.listed.path} ${String(rule.node.start)}`,
          breach,
        );
      }
    }
  }

  return [
    ...new Map(
      nameBreaches.map((breach) => [`${breach.document} ${breach.keys["node"] ?? ""}`, breach]),
    ).values(),
    ...branches.values(),
    ...documents.flatMap(({ listed: { rows } }) =>
      rows.members.flatMap((node): readonly Breach[] =>
        sectionFilterKinds.has(node.kind)
          ? Option.toArray(typedValueOf(rows, node.start, "section-identifier")).flatMap(
              (identifier) => {
                const count = instances.flatMap(({ document }) =>
                  document.names.filter(
                    (name) => name.identifier === identifier && filteredKinds.has(name.node.kind),
                  ),
                ).length;

                return count === 1
                  ? []
                  : [
                      breachAt(rows, node, "Section identifier target", {
                        count: String(count),
                        identifier,
                        test: testPath,
                      }),
                    ];
              },
            )
          : [],
      ),
    ),
  ];
};

/**
 * Judge one folded document by this module's laws over a document alone: none, since every one
 * reads the package's resources or its assemblies.
 *
 * @param _rows - The document.
 * @param _grammar - The composed grammar.
 * @returns No breach.
 */
export const testDocumentBreaches = (
  _rows: View,
  _grammar: ComposedGrammar,
): readonly Breach[] => [];

/**
 * Judge a package by the laws of its tests, sections and banks: each listed document's own laws,
 * stimulus refs and item refs, and each test's assembly.
 *
 * @param input - The package.
 * @param grammar - The composed grammar.
 * @returns The breaches.
 */
export const testPackageBreaches = (
  input: PackageRows,
  grammar: ComposedGrammar,
): readonly Breach[] => {
  const byPath = assembledDocumentsOf(input, grammar);
  const documents = [...byPath.values()];

  return [
    ...input.documents.flatMap((listed) => [
      ...stimulusRefKeyOf(listed),
      ...itemRefTargetsOf(input, listed),
    ]),
    ...documents.flatMap((document) => [
      ...documentLawsOf(document),
      ...selectionLawsOf(document),
      ...weightedBaseOf(document.listed.rows),
      ...itemRefLawsOf(input, document, grammar),
    ]),
    ...testsOf(input, byPath).flatMap(({ instances, test }) =>
      assemblyLawsOf(test, instances, grammar),
    ),
  ];
};
