/**
 * The interaction overlays' rows (plan §1.7 O3, §C's `rowsOf`): from a document's view
 * (`DocumentView` of `#pantry/import/fold.ts`), the rows of every overlay
 * `#pantry/qti/interactions.ts` declares, each relation's rows a keyed set.
 *
 * The rows restate what the tree says and nothing else: each overlay names its node by its place
 * alone, never a copy of the node's kind, parent or nearest interaction, which `Node` holds
 * (decision S3); each attribute's lexical form as written and its collapsed value, each count as
 * written or its XSD default, and each name a binding or a reference makes, which resolves to its
 * document's declaration of it through a query, never a copy of the declaration. Every row holds
 * its document's place, `package` and `path`, beside its element's `start`, and every link is a
 * position: an element's in the same document, or an instance's in its assembly's tree. The
 * database proves every one of them (`interactionLaws`), so a row this builder gets wrong is
 * refused, never accepted.
 */
import { regex } from "arkregex";
import type { Addition } from "@bjornpagen/grizzle";
import { Array as Arr, Option } from "effect";
import { booleanOf } from "#pantry/grammar/domains.ts";
import { ChoiceBound, interactionKinds } from "#pantry/grammar/install.ts";
import { attributeOf, foldAt, governorOf } from "#pantry/import/fold.ts";
import type { AttributeIndex, DocumentView, Folds } from "#pantry/import/fold.ts";
import { attributeValueOf, namedBy, valueAt } from "#pantry/import/names.ts";
import { keyTextOf } from "#pantry/import/key-text.ts";
import type { Place } from "#pantry/qti/schema.ts";
import type { InstanceMember, InstanceRoot } from "#pantry/import/overlays/tests.ts";
import type { Composed } from "#pantry/model/composed.ts";
import type { FlatRows, NodeRow } from "#pantry/model/xdm.ts";
import type {
  BindingName,
  BoundVariable,
  Choice,
  ChoiceInteraction,
  ContextRef,
  CountBound,
  FeedbackRef,
  Hottext,
  Interaction,
  InteractionAttribute,
  ItemMode,
  LeastCount,
  MostCount,
  PciModuleForm,
  PlacedBinding,
  PlacedChoice,
  PlacedHottext,
  PrintedVariableRef,
  ReferringDocument,
  FragmentContextName,
  FragmentContextRef,
  FragmentFeedbackName,
  FragmentFeedbackRef,
  FragmentPrintedName,
  FragmentPrintedRef,
  FragmentScope,
  FragmentTemplateName,
  FragmentTemplateRef,
  TemplateRef,
} from "#pantry/qti/interactions.ts";
import {
  adaptiveName,
  ariaNames,
  bindingAttributes,
  choiceKinds,
  countDefault,
  hottextKind,
  modulesKind,
  pciKind,
  readAttributes,
  references,
  referringRoots,
} from "#pantry/vocab/terms/interactions.ts";
import { itemKind } from "#pantry/vocab/terms/tests.ts";

/**
 * The interaction overlays' rows, one keyed set per relation: each map from the text of a row's key
 * to the row as its writer writes it, its key's values in key order as a JSON array (`keyTextOf`
 * of `#pantry/import/key-text.ts`), so the rows of two documents never meet at one key.
 */
export interface InteractionRows {
  readonly BindingName: ReadonlyMap<string, Addition<typeof BindingName>>;
  readonly BoundVariable: ReadonlyMap<string, Addition<typeof BoundVariable>>;
  readonly Choice: ReadonlyMap<string, Addition<typeof Choice>>;
  readonly ChoiceInteraction: ReadonlyMap<string, Addition<typeof ChoiceInteraction>>;
  readonly ContextRef: ReadonlyMap<string, Addition<typeof ContextRef>>;
  readonly CountBound: ReadonlyMap<string, Addition<typeof CountBound>>;
  readonly FeedbackRef: ReadonlyMap<string, Addition<typeof FeedbackRef>>;
  readonly Hottext: ReadonlyMap<string, Addition<typeof Hottext>>;
  readonly Interaction: ReadonlyMap<string, Addition<typeof Interaction>>;
  readonly InteractionAttribute: ReadonlyMap<string, Addition<typeof InteractionAttribute>>;
  readonly ItemMode: ReadonlyMap<string, Addition<typeof ItemMode>>;
  readonly LeastCount: ReadonlyMap<string, Addition<typeof LeastCount>>;
  readonly MostCount: ReadonlyMap<string, Addition<typeof MostCount>>;
  readonly PciModuleForm: ReadonlyMap<string, Addition<typeof PciModuleForm>>;
  readonly PrintedVariableRef: ReadonlyMap<string, Addition<typeof PrintedVariableRef>>;
  readonly ReferringDocument: ReadonlyMap<string, Addition<typeof ReferringDocument>>;
  readonly FragmentContextName: ReadonlyMap<string, Addition<typeof FragmentContextName>>;
  readonly FragmentFeedbackName: ReadonlyMap<string, Addition<typeof FragmentFeedbackName>>;
  readonly FragmentPrintedName: ReadonlyMap<string, Addition<typeof FragmentPrintedName>>;
  readonly FragmentTemplateName: ReadonlyMap<string, Addition<typeof FragmentTemplateName>>;
  readonly TemplateRef: ReadonlyMap<string, Addition<typeof TemplateRef>>;
}

/**
 * A count attribute `ChoiceBound` names.
 */
type CountName = (typeof ChoiceBound.rows)[number]["min"];

/**
 * The interaction kinds, whose children take them as their nearest interaction (N8).
 */
const interactions: ReadonlySet<string> = new Set(interactionKinds);

/**
 * An `xs:integer` form, split into its sign and its digits (XML Schema 1.1 Part 2 §3.3.13).
 */
const integerParts = regex("^(?<sign>[+-]?)(?<digits>[0-9]+)$", "u");

/**
 * The largest count a package holds, the signed 64-bit integer's (spec reading 46).
 */
const countMost = 2n ** 63n - 1n;

/**
 * Read a count's form as its value: the import's own lexical mapping, apart from the law oracle's.
 * An `xs:integer` form is an optional sign and its digits, whose value is the digits' negated after
 * a `-` (XML Schema 1.1 Part 2 §3.3.13), so `0`, `+0`, `-0` and `00` all read 0 (§3.3.20). A count
 * is an `xs:nonNegativeInteger` held to the signed 64-bit range (reading 46), so a form whose value
 * lies outside it, `-1` or past 2^63 − 1, has none, as a form that is no integer's has none: its
 * value domain is its law. The database's own reading of the same forms is `integerReadOf` in
 * `#pantry/qti/interactions.ts`.
 *
 * @param form - The count's collapsed form.
 * @returns Its value, or none.
 */
const countValueOf = (form: string): Option.Option<bigint> => {
  const groups = integerParts.exec(form)?.groups;

  return Option.fromNullishOr(groups?.["digits"]).pipe(
    Option.map((digits) => (groups?.["sign"] === "-" ? -BigInt(digits) : BigInt(digits))),
    Option.filter((value) => value >= 0n && value <= countMost),
  );
};

/**
 * Write the key text of an element's place, `(package, path, start)`, the key every row over one
 * element starts with and the group a family over an interaction's rows names it by.
 *
 * @param row - The row: its document's place and its element's start.
 * @param row.package - The package's name.
 * @param row.path - The document's path.
 * @param row.start - The element's position in the document.
 * @returns The key text.
 */
const placeKeyOf = (row: {
  readonly package: string;
  readonly path: string;
  readonly start: bigint;
}): string => keyTextOf(row.package, row.path, row.start);

/**
 * A node's kind as the tree's rows hold it.
 */
type KindOfNode = NodeRow<Composed>["kind"];

/**
 * Read a map at a key it holds by construction: a document's nodes at a node of the document
 * (every attribute's element and every element's parent is a node `flatten` writes), the package's
 * item modes at an
 * item's assembly, whose head is an item document with its `ItemMode`.
 *
 * @param map - The map.
 * @param key - A key it holds.
 * @param holds - What the map holds, for the defect.
 * @returns The value at the key.
 * @throws {Error} When the map holds no value at the key: a defect of the caller, which read a key
 *   of other rows than the map was built from.
 */
const heldAt = <K extends bigint | string, V>(map: ReadonlyMap<K, V>, key: K, holds: string): V => {
  const value = map.get(key);
  if (value === undefined) {
    throw new Error(
      `${String(key)} is none of ${holds}, which hold every key the builder reads in them. Read each key in the rows the map was built from.`,
    );
  }

  return value;
};

/**
 * One document as the builders read it: its flat rows, its place in its package and its root kind,
 * each node's fold (`#pantry/import/fold.ts`), which holds its nearest interaction (N8), the
 * document that interaction is in, its kind and its element counts, each node by its start, each
 * element's attributes, and, for an item, its mode: whether it is adaptive.
 */
interface Context {
  readonly attributes: AttributeIndex;
  readonly folds: Folds;
  readonly itemMode: Option.Option<boolean>;
  readonly nodes: ReadonlyMap<bigint, NodeRow<Composed>>;
  readonly place: Place;
  readonly rootKind: KindOfNode;
  readonly rows: FlatRows<Composed>;
}

/**
 * Read the name an element's attribute gives, its value ({@link valueAt}) where that names
 * something ({@link namedBy}), the test `namedBinding` of `#pantry/qti/interactions.ts` states: a
 * value that names nothing has no `BindingName` and no `BoundVariable`, so "Binding declared" never
 * judges it beside its value domain (spec reading 152). Whitespace inside a value is kept, one
 * space a run, so a value with some names nothing.
 *
 * @param context - The document.
 * @param element - The element.
 * @param name - The attribute's name.
 * @returns The name, or none where the element does not carry the attribute or it names nothing.
 */
const nameOf = (
  context: Pick<Context, "attributes">,
  element: NodeRow<Composed>,
  name: Composed["name"],
): Option.Option<string> => Option.flatMap(valueAt(context, element, name), namedBy);

/**
 * Read a read attribute's value, as `Attribute.value` holds it: its lexical form under its
 * element's governor ({@link attributeValueOf}).
 *
 * @param context - The document's nodes.
 * @param read - The attribute: its element's start, its name and its lexical form.
 * @returns Its value.
 */
const readValueOf = (
  context: Pick<Context, "nodes">,
  read: { readonly lexical: string; readonly name: string; readonly start: bigint },
): string => {
  const { governs, kind } = heldAt(context.nodes, read.start, "the document's nodes");

  return attributeValueOf(governorOf(kind, governs), read.name, read.lexical);
};

/**
 * Read a node's place, the key of every overlay row of it.
 *
 * @param context - The document.
 * @param node - The node.
 * @returns The place.
 */
const placeOf = (context: Context, node: NodeRow<Composed>) => ({
  package: context.place.package,
  path: context.place.path,
  start: node.start,
});

/**
 * The `adaptive` of an item that writes none: its XSD default (the QTI 3.0.1 ASI schema,
 * `imsqti_asiv3p0p1_v1p0.xsd` line 24716, `qti-assessment-item`: `<xs:attribute name="adaptive"
 * use="optional" default="false" type="xs:boolean" />`).
 */
const adaptiveDefault = false;

/**
 * Read whether an item is adaptive: its `adaptive` where written, true where its value is one of
 * `xs:boolean`'s true forms, as `ItemMode` mirrors them; else its XSD default,
 * {@link adaptiveDefault}. A written form that is no boolean is no true form, and its attribute's
 * value domain refuses it.
 *
 * @param context - The document, its attributes read.
 * @param item - The item's element.
 * @returns Whether the item is adaptive.
 */
const adaptiveOf = (context: Pick<Context, "attributes">, item: NodeRow<Composed>): boolean =>
  Option.match(valueAt(context, item, adaptiveName), {
    onNone: () => adaptiveDefault,
    onSome: (form) => Option.contains(booleanOf(form), true),
  });

/**
 * Read a document for the builders.
 *
 * @param view - The document's view.
 * @param place - Where it stands in its package.
 * @returns The document as the builders read it.
 */
const contextOf = (view: DocumentView, place: Place): Context => {
  const { rows } = view;
  const base = {
    attributes: view.attributes,
    folds: view.folds,
    nodes: new Map(rows.nodes.map((node) => [node.start, node] as const)),
    place,
    rootKind: view.tree.root.kind,
    rows,
  };

  return {
    ...base,
    itemMode: Option.map(
      Option.filter(
        Arr.findFirst(rows.nodes, ({ kind }) => kind === itemKind),
        () => view.tree.root.kind === itemKind,
      ),
      (item) => adaptiveOf(base, item),
    ),
  };
};

/**
 * The attributes O3 reads on each kind ({@link readAttributes}), as `<name> <kind>`.
 */
const readOnKinds: ReadonlySet<string> = new Set(
  [...readAttributes].flatMap(([name, kinds]) => kinds.map((kind) => `${name} ${kind}`)),
);

/**
 * Build the read attributes: each attribute O3 reads, its lexical form and its value collapsed.
 *
 * @param context - The document.
 * @returns The rows, keyed by (package, path, start, name).
 */
const interactionAttributesOf = (context: Context) =>
  new Map(
    context.rows.attributes.flatMap(({ lexical, name, start }) => {
      const { kind } = heldAt(context.nodes, start, "the document's nodes");
      const read = ariaNames.some((aria) => aria === name) || readOnKinds.has(`${name} ${kind}`);

      return read
        ? [
            [
              keyTextOf(context.place.package, context.place.path, start, name),
              {
                kind,
                lexical,
                name,
                package: context.place.package,
                path: context.place.path,
                rootKind: context.rootKind,
                start,
              } satisfies Addition<typeof InteractionAttribute>,
            ] as const,
          ]
        : [];
    }),
  );

/**
 * Build each interaction's row, every interaction element's, whether or not it writes a
 * `response-identifier`: the owner of its choices.
 *
 * @param context - The document.
 * @returns The rows, keyed by place.
 */
const interactionsOf = (context: Context) =>
  new Map(
    context.rows.nodes
      .filter(({ kind }) => interactions.has(kind))
      .map((node) => {
        const row = placeOf(context, node) satisfies Addition<typeof Interaction>;

        return [placeKeyOf(row), row] as const;
      }),
  );

/**
 * Build each portable custom interaction's module forms: an attribute form for its `module`
 * attribute and an element form for its `qti-interaction-modules` child (R10-a).
 *
 * @param context - The document.
 * @returns The rows, keyed by place and form.
 */
const pciModuleFormsOf = (context: Context) => {
  const forms = new Map<string, Addition<typeof PciModuleForm>>();
  const { package: pkg, path } = context.place;
  for (const node of context.rows.nodes) {
    if (node.kind === pciKind && Option.isSome(attributeOf(context, node.start, "module"))) {
      forms.set(keyTextOf(pkg, path, node.start, false), {
        element: false,
        package: pkg,
        path,
        start: node.start,
      });
    }

    if (
      node.kind === modulesKind &&
      heldAt(context.nodes, node.parent, "the document's nodes").kind === pciKind
    ) {
      forms.set(keyTextOf(pkg, path, node.parent, true), {
        element: true,
        package: pkg,
        path,
        start: node.parent,
      });
    }
  }

  return forms;
};

/**
 * Build each choice's row.
 *
 * @param context - The document.
 * @returns The rows, keyed by place.
 */
const choicesOf = (context: Context) =>
  new Map(
    context.rows.nodes
      .filter(({ kind }) => choiceKinds.some((choice) => choice === kind))
      .flatMap((node) =>
        Option.toArray(valueAt(context, node, "identifier")).map((identifier) => {
          const row = {
            ...placeOf(context, node),
            identifier,
            kind: node.kind,
          } satisfies Addition<typeof Choice>;

          return [placeKeyOf(row), row] as const;
        }),
      ),
  );

/**
 * Build each choice's interaction: its nearest, where that is an interaction, in its own document
 * or, where the fold gives a `nearestPath`, the one its fragment is placed in. A choice no
 * interaction encloses has none, and "N8 nearest" refuses it; a gap among those breaks N6 first.
 *
 * @param context - The document.
 * @param choices - Its choices' rows.
 * @returns The rows, keyed by the choice's place.
 */
const choiceInteractionsOf = (
  context: Context,
  choices: ReadonlyMap<string, Addition<typeof Choice>>,
) =>
  new Map(
    [...choices].flatMap(([key, { package: pkg, path, start }]) => {
      const fold = foldAt(context.folds, start);

      return interactions.has(fold.nearestKind)
        ? [
            [
              key,
              {
                interaction: fold.nearest,
                interactionPath: Option.getOrElse(fold.nearestPath, () => path),
                package: pkg,
                path,
                start,
              } satisfies Addition<typeof ChoiceInteraction>,
            ] as const,
          ]
        : [];
    }),
  );

/**
 * Build each hottext's row: its identifier, where it names something.
 *
 * @param context - The document.
 * @returns The rows, keyed by place.
 */
const hottextsOf = (context: Context) =>
  new Map(
    context.rows.nodes
      .filter(({ kind }) => kind === hottextKind)
      .flatMap((node) =>
        Option.toArray(valueAt(context, node, "identifier")).map((identifier) => {
          const row = { ...placeOf(context, node), identifier } satisfies Addition<typeof Hottext>;

          return [placeKeyOf(row), row] as const;
        }),
      ),
  );

/**
 * Read one count of a bound: whether it is written, and its value where it has one. A written count
 * has the value its form names where it has one ({@link countValueOf}); an unwritten one has its
 * XSD default where the XSD gives one. Any other count has none, and no row holds it (lane NIL's
 * audit, B8: a missing value is a row of its own relation, never a sentinel).
 *
 * @param context - The document.
 * @param node - The element.
 * @param name - The count's attribute.
 * @returns Whether it is written, and its value's form and integer, where it has one.
 */
const countOf = (context: Context, node: NodeRow<Composed>, name: CountName) => {
  const written = valueAt(context, node, name);
  const form = Option.orElse(written, () => countDefault(node.kind, name));

  return {
    value: form.pipe(
      Option.flatMap((lexical) =>
        countValueOf(lexical).pipe(Option.map((integer) => ({ form: lexical, integer }))),
      ),
    ),
    written: Option.isSome(written),
  };
};

/**
 * Build each interaction's binding attributes, and in an item, under its mode, each of its bound
 * variables. The response declaration each names is the item's declaration of its name, which the
 * laws read through a query (`#pantry/qti/overlay-queries/reference.ts`), so no row here holds it.
 *
 * @param context - The document.
 * @returns The `BindingName` rows of every document and the `BoundVariable` rows of an item, each
 *   keyed by (package, path, start, attribute).
 */
const bindingsOf = (context: Context) => {
  const names = new Map<string, Addition<typeof BindingName>>();
  const bound = new Map<string, Addition<typeof BoundVariable>>();
  const { package: pkg, path } = context.place;
  for (const node of context.rows.nodes.filter(({ kind }) => interactions.has(kind))) {
    const { start } = node;
    const place = { package: pkg, path, start };
    for (const attribute of bindingAttributes) {
      for (const identifier of Option.toArray(nameOf(context, node, attribute))) {
        names.set(keyTextOf(pkg, path, start, attribute), { ...place, attribute, identifier });
      }
    }

    for (const adaptive of Option.toArray(context.itemMode)) {
      for (const attribute of bindingAttributes) {
        for (const identifier of Option.toArray(nameOf(context, node, attribute))) {
          bound.set(keyTextOf(pkg, path, start, attribute), {
            ...place,
            adaptive,
            attribute,
            identifier,
          });
        }
      }
    }
  }

  return { bound, names };
};

/**
 * Join two row sets on a key: each left row, in its order, with every right row whose key is its
 * own, none where no right row's is; a right row whose key no left row has joins nothing. Both
 * sides are grouped under the one key and each group is read whole, so no lookup by key can miss.
 *
 * @param left - The left rows.
 * @param leftKey - A left row's key.
 * @param right - The right rows.
 * @param rightKey - A right row's key.
 * @returns Each left row with its right rows.
 */
const joinOn = <L, R>(
  left: Iterable<L>,
  leftKey: (row: L) => string,
  right: Iterable<R>,
  rightKey: (row: R) => string,
): readonly (readonly [L, readonly R[]])[] => {
  const sides: readonly (
    | { readonly at: number; readonly row: L; readonly side: "left" }
    | { readonly row: R; readonly side: "right" }
  )[] = [
    ...Array.from(left, (row, at) => ({ at, row, side: "left" as const })),
    ...Array.from(right, (row) => ({ row, side: "right" as const })),
  ];

  return [
    ...Map.groupBy(sides, (side) =>
      side.side === "left" ? leftKey(side.row) : rightKey(side.row),
    ).values(),
  ]
    .flatMap((group) => {
      const rights = group.flatMap((side) => (side.side === "right" ? [side.row] : []));

      return group.flatMap((side) =>
        side.side === "left" ? [{ at: side.at, joined: [side.row, rights] as const }] : [],
      );
    })
    .toSorted((a, b) => a.at - b.at)
    .map(({ joined }) => joined);
};

/**
 * Build each bound's rows: its {@link CountBound}, and each of its counts that has a value
 * ({@link countOf}) its {@link LeastCount} or {@link MostCount}.
 *
 * @param context - The document.
 * @returns The rows, each relation's keyed by place.
 */
const boundsOf = (context: Context) => {
  const { package: pkg, path } = context.place;
  const bounded = context.rows.nodes.flatMap((node) =>
    ChoiceBound.rows
      .filter(({ kind }) => kind === node.kind)
      .map(({ max, min }) => ({
        key: placeKeyOf({ package: pkg, path, start: node.start }),
        max,
        min,
        node,
      })),
  );
  const bounds = new Map<string, Addition<typeof CountBound>>();
  const leasts = new Map<string, Addition<typeof LeastCount>>();
  const mosts = new Map<string, Addition<typeof MostCount>>();
  for (const { key, max, min, node } of bounded) {
    const least = countOf(context, node, min);
    const most = countOf(context, node, max);
    const place = { package: pkg, path, start: node.start };
    bounds.set(key, {
      ...place,
      maxName: max,
      maxWritten: most.written,
      minName: min,
      minWritten: least.written,
    });
    for (const { form, integer } of Option.toArray(least.value)) {
      leasts.set(key, { ...place, least: form, leastValue: integer });
    }

    for (const { form, integer } of Option.toArray(most.value)) {
      mosts.set(key, { ...place, most: form, mostValue: integer });
    }
  }

  return { bounds, leasts, mosts };
};

/**
 * Build one content reference relation's rows: each read attribute of the relation's names and
 * kinds that names a variable ({@link namedBy}), in an item, under its document's root kind, the
 * root of its own assembly. The declaration it names is its document's of its name, which the laws
 * read through a query (`#pantry/qti/overlay-queries/reference.ts`). A value that is no NCName
 * names nothing and has no row, so its value domain refuses it alone (spec reading 152).
 *
 * The NCName test decides which value is a reference, as each relation's source does
 * (`referenceSources` of `#pantry/qti/interactions.ts`), and the schema holds the source forward
 * only, so no law refuses a row beyond it. No law refuses what the test leaves out, either: a
 * printed variable's `base` and `index` hold an `xs:integer` literal or a variable's name, so
 * `base="10"` is lawful and names nothing, and a row for it would break "Printed variable
 * reference" on a package the database must accept. So the test stays here for as long as each
 * relation is written rows, not a query over its source.
 *
 * @param context - The document.
 * @param read - The document's read attributes.
 * @param reference - The relation's attributes and kinds.
 * @returns The rows, each keyed by (package, path, start, attribute).
 */
const referencesOf = (
  context: Context,
  read: ReturnType<typeof interactionAttributesOf>,
  reference: (typeof references)[keyof typeof references],
): ReadonlyMap<string, Addition<typeof FeedbackRef>> =>
  new Map(
    referringRoots.some((root) => root === context.rootKind)
      ? [...read.values()]
          .filter(
            (row) =>
              reference.attributes.some((name) => name === row.name) &&
              reference.kinds.some((kind) => kind === row.kind),
          )
          .flatMap((row) =>
            Option.toArray(namedBy(readValueOf(context, row))).map(
              (identifier) =>
                [
                  keyTextOf(row.package, row.path, row.start, row.name),
                  {
                    assemblyKind: context.rootKind,
                    attribute: row.name,
                    identifier,
                    kind: row.kind,
                    package: row.package,
                    path: row.path,
                    start: row.start,
                  },
                ] as const,
            ),
          )
      : [],
  );

/**
 * Build an included fragment's references of one class: each read attribute of the class's names
 * and kinds that names a variable ({@link namedBy}), unresolved, since a fragment declares nothing;
 * each resolves once per assembly that places the document (spec reading 117). The NCName test
 * stays for the reasons {@link referencesOf} gives, each relation's source being `fragmentSources`
 * of `#pantry/qti/interactions.ts`.
 *
 * @param context - The document.
 * @param read - The document's read attributes.
 * @param classes - The class's attributes and kinds.
 * @returns The rows, keyed by (package, path, start, attribute), none in an item or a test
 *   ({@link referringRoots}), whose references resolve in its own declarations.
 */
const fragmentNamesOf = (
  context: Context,
  read: ReturnType<typeof interactionAttributesOf>,
  classes: readonly (typeof references)[keyof typeof references][],
): ReadonlyMap<string, Addition<typeof FragmentFeedbackName>> =>
  new Map(
    referringRoots.every((root) => root !== context.rootKind)
      ? [...read.values()].flatMap((row) =>
          classes.some(
            (reference) =>
              reference.attributes.some((name) => name === row.name) &&
              reference.kinds.some((kind) => kind === row.kind),
          )
            ? Option.toArray(namedBy(readValueOf(context, row))).map(
                (identifier) =>
                  [
                    keyTextOf(row.package, row.path, row.start, row.name),
                    {
                      attribute: row.name,
                      identifier,
                      kind: row.kind,
                      package: row.package,
                      path: row.path,
                      start: row.start,
                    },
                  ] as const,
              )
            : [],
        )
      : [],
  );

/**
 * A fragment's feedback references: its feedback elements' outcomes.
 */
const fragmentFeedbacks = [references.feedback] as const;

/**
 * A fragment's template variable references: its template elements' and
 * choices' `template-identifier`.
 */
const fragmentTemplates = [references.template] as const;

/**
 * A fragment's context variable references: its
 * `qti-context-variable`s' `identifier`.
 */
const fragmentContexts = [references.context] as const;

/**
 * A fragment's printed variable references: their names, bases and indices.
 */
const fragmentPrints = [references.printed, references.variable] as const;

/**
 * Build the interaction overlays' rows of one document.
 *
 * A required attribute that is absent leaves out the row its copy proves (a choice's `identifier`,
 * a hotspot's `shape`), and AL3 refuses the element. A binding and a reference are written whatever
 * they name: what a name resolves to is its document's declaration of it, which the laws read
 * through a query, so a name no declaration it may name holds is refused by its law, and a name of
 * a declaration with no cardinality is judged by no law over the cardinality, that declaration's
 * own law refusing it alone (spec readings 158 and 159).
 *
 * @param view - The document's view: its rows, and their folds under its context (spec reading
 *   117), whose interaction an included fragment's nodes take as their nearest.
 * @param ids - Where the document stands in its package, whose package and path every row holds.
 * @returns Every overlay's rows.
 */
export const rowsOf = (view: DocumentView, ids: Place): InteractionRows => {
  const place: Place = { package: ids.package, path: ids.path };
  const context = contextOf(view, place);
  const read = interactionAttributesOf(context);
  const choices = choicesOf(context);
  const owned = choiceInteractionsOf(context, choices);
  const interactionRows = interactionsOf(context);
  const { bound, names } = bindingsOf(context);
  const hottexts = hottextsOf(context);
  const counts = boundsOf(context);
  const contexts = referencesOf(context, read, references.context);
  const feedbacks = referencesOf(context, read, references.feedback);
  const prints = [
    referencesOf(context, read, references.printed),
    referencesOf(context, read, references.variable),
  ];
  const templates = referencesOf(context, read, references.template);

  return {
    BindingName: names,
    BoundVariable: bound,
    Choice: choices,
    ChoiceInteraction: owned,
    ContextRef: contexts,
    CountBound: counts.bounds,
    FeedbackRef: feedbacks,
    FragmentContextName: fragmentNamesOf(context, read, fragmentContexts),
    FragmentFeedbackName: fragmentNamesOf(context, read, fragmentFeedbacks),
    FragmentPrintedName: fragmentNamesOf(context, read, fragmentPrints),
    FragmentTemplateName: fragmentNamesOf(context, read, fragmentTemplates),
    Hottext: hottexts,
    Interaction: interactionRows,
    InteractionAttribute: read,
    ItemMode: new Map(
      Option.toArray(context.itemMode).map(
        (adaptive) => [keyTextOf(place.package, place.path), { ...place, adaptive }] as const,
      ),
    ),
    LeastCount: counts.leasts,
    MostCount: counts.mosts,
    PciModuleForm: pciModuleFormsOf(context),
    PrintedVariableRef: new Map(prints.flatMap((held) => [...held])),
    ReferringDocument: new Map(
      referringRoots.every((root) => root !== context.rootKind)
        ? [[keyTextOf(place.package, place.path), place]]
        : [],
    ),
    TemplateRef: templates,
  };
};

/**
 * A package's fragment placements and their resolved references, one keyed set per relation.
 */
export interface FragmentRows {
  readonly FragmentContextRef: ReadonlyMap<string, Addition<typeof FragmentContextRef>>;
  readonly FragmentFeedbackRef: ReadonlyMap<string, Addition<typeof FragmentFeedbackRef>>;
  readonly FragmentPrintedRef: ReadonlyMap<string, Addition<typeof FragmentPrintedRef>>;
  readonly FragmentScope: ReadonlyMap<string, Addition<typeof FragmentScope>>;
  readonly FragmentTemplateRef: ReadonlyMap<string, Addition<typeof FragmentTemplateRef>>;
}

/**
 * One instance of an assembly's tree, with the assembly it is placed in, named by its head
 * document's path, that assembly's root kind, its package, and the instance's position in the
 * tree's pre-order, `start`, which the tree draws the same way (`Instance.start`): the instance's
 * key in its assembly.
 */
interface Placement {
  readonly assembly: string;
  readonly assemblyKind: InstanceRoot["assemblyKind"];
  readonly instance: InstanceMember | InstanceRoot;
  readonly package: string;
  readonly start: bigint;
}

/**
 * Collect every instance of an assembly's tree in pre-order, its root's own first at 0, each
 * numbered as the tree numbers it, with the assembly it is placed in and that assembly's root kind.
 *
 * @param root - The assembly's root instance.
 * @returns Each instance and its assembly, in pre-order.
 */
const instancesOf = (root: InstanceRoot): readonly Placement[] => {
  const found: Placement[] = [];
  const stack: (InstanceMember | InstanceRoot)[] = [root];
  for (let next = stack.pop(); next !== undefined; next = stack.pop()) {
    found.push({
      assembly: root.assembly,
      assemblyKind: root.assemblyKind,
      instance: next,
      package: root.package,
      start: BigInt(found.length),
    });
    for (const each of next.children.toReversed()) {
      stack.push(each);
    }
  }

  return found;
};

/**
 * Place each reference of a fragment under one placement: each has its placed row, under its
 * assembly's root kind. What its name resolves to among its assembly's declarations is the item's
 * declaration of it, which the laws read through a query
 * (`#pantry/qti/overlay-queries/reference.ts`).
 *
 * @param names - The document's references of one class.
 * @param placement - The placement.
 * @returns The placed rows, each keyed by (package, assembly, instance, start, attribute).
 */
const placedOf = (
  names: readonly Addition<typeof FragmentFeedbackName>[],
  placement: Placement,
): readonly (readonly [string, Addition<typeof FragmentFeedbackRef>])[] =>
  names.map(
    (name) =>
      [
        keyTextOf(name.package, placement.assembly, placement.start, name.start, name.attribute),
        {
          ...name,
          assembly: placement.assembly,
          assemblyKind: placement.assemblyKind,
          instance: placement.start,
        },
      ] as const,
  );

/**
 * Write the key text of a document's place, `(package, path)`, which the package's builders join
 * a document's rows on.
 *
 * @param row - The row: its document's place.
 * @param row.package - The package's name.
 * @param row.path - The document's path.
 * @returns The key text.
 */
const documentKeyOf = (row: Place): string => keyTextOf(row.package, row.path);

/**
 * Write the key text of the document an instance places, `(package, document)`.
 *
 * @param placement - The instance's placement.
 * @returns The key text.
 */
const placedDocumentKeyOf = (placement: Placement): string =>
  keyTextOf(placement.package, placement.instance.document);

/**
 * Decide whether an instance is a placement `FragmentScope` holds: an instance of an item's or a
 * test's assembly whose document is neither (`referringRoots`), an included fragment or a section
 * document a test references (spec readings 117 and 145).
 *
 * @param placement - The instance's placement.
 * @returns Whether its references resolve under it.
 */
const resolvesUnder = (placement: Placement): boolean =>
  referringRoots.some((kind) => kind === placement.assemblyKind) &&
  referringRoots.every((kind) => kind !== placement.instance.rootKind);

/**
 * Build a package's placements: one per instance of an included fragment or a referenced section
 * document under an item or a test (`resolvesUnder`), and under
 * it each of the document's references of each class, under the assembly's root kind. What each
 * resolves to among the assembly's declarations, whatever its cardinality spells, is read through a
 * query (spec reading 159, decision 432): a built-in of the assembly's root names none, and its law
 * reads `BuiltInVariable`; a name no allowed declaration holds is refused by its law.
 *
 * @param input - The package's rows the placements read.
 * @param input.contexts - Every fragment's context variable references
 *   ({@link rowsOf}'s `FragmentContextName`).
 * @param input.feedbacks - Every fragment's feedback references
 *   ({@link rowsOf}'s `FragmentFeedbackName`).
 * @param input.instances - Every assembly's root instance, its tree nested (Q5.13's
 *   `assembledRowsOf`).
 * @param input.prints - Every fragment's printed variable references
 *   ({@link rowsOf}'s `FragmentPrintedName`).
 * @param input.templates - Every fragment's template variable references
 *   ({@link rowsOf}'s `FragmentTemplateName`).
 * @returns The rows.
 */
export const fragmentRowsOf = (input: {
  readonly contexts: Iterable<Addition<typeof FragmentContextName>>;
  readonly feedbacks: Iterable<Addition<typeof FragmentFeedbackName>>;
  readonly instances: Iterable<InstanceRoot>;
  readonly prints: Iterable<Addition<typeof FragmentPrintedName>>;
  readonly templates: Iterable<Addition<typeof FragmentTemplateName>>;
}): FragmentRows => {
  const placements = [...input.instances].flatMap((root) =>
    instancesOf(root).filter(resolvesUnder),
  );
  const placedRowsOf = (names: Iterable<Addition<typeof FragmentFeedbackName>>) =>
    new Map(
      joinOn(placements, placedDocumentKeyOf, names, documentKeyOf).flatMap(([placement, named]) =>
        placedOf(named, placement),
      ),
    );

  return {
    FragmentContextRef: placedRowsOf(input.contexts),
    FragmentFeedbackRef: placedRowsOf(input.feedbacks),
    FragmentPrintedRef: placedRowsOf(input.prints),
    FragmentScope: new Map(
      placements.map(
        (placement) =>
          [
            keyTextOf(placement.package, placement.assembly, placement.start),
            {
              assembly: placement.assembly,
              assemblyKind: placement.assemblyKind,
              document: placement.instance.document,
              instance: placement.start,
              package: placement.package,
            },
          ] as const,
      ),
    ),
    FragmentTemplateRef: placedRowsOf(input.templates),
  };
};

/**
 * A package's bindings placed under each instance of an item's assembly, keyed by (package,
 * assembly, instance, start, attribute), and its choices and hottexts under each instance of every
 * assembly, keyed by (package, assembly, instance, start).
 */
export interface PlacedBindingRows {
  readonly PlacedBinding: ReadonlyMap<string, Addition<typeof PlacedBinding>>;
  readonly PlacedChoice: ReadonlyMap<string, Addition<typeof PlacedChoice>>;
  readonly PlacedHottext: ReadonlyMap<string, Addition<typeof PlacedHottext>>;
}

/**
 * Build each instance of an item's assembly's bindings (spec reading 117): under the item's own
 * instance and each fragment it places, every binding attribute of the instance's document,
 * carrying the item's `adaptive`. The response declaration it names is the item's of its name,
 * whatever its cardinality spells, read through a query as a `BoundVariable`'s is (spec reading
 * 159): a name none holds is refused by "Binding declared". Under each
 * instance of every assembly, its document's choices and hottexts, which count among the
 * assembly's: "Choice not variable" holds each identifier they bear to the declarations of the
 * assembly's root document (`UnclaimedName`, `#pantry/qti/queries.ts`).
 *
 * @param input - The package's rows the bindings read.
 * @param input.adaptive - Every item's mode ({@link rowsOf}'s `ItemMode`).
 * @param input.choices - Every document's choices ({@link rowsOf}'s `Choice`).
 * @param input.hottexts - Every document's hottexts ({@link rowsOf}'s `Hottext`).
 * @param input.instances - Every assembly's root instance, its tree nested (Q5.13's
 *   `assembledRowsOf`).
 * @param input.names - Every document's binding attributes ({@link rowsOf}'s `BindingName`).
 * @returns The rows.
 */
export const placedBindingRowsOf = (input: {
  readonly adaptive: Iterable<Addition<typeof ItemMode>>;
  readonly choices: Iterable<Addition<typeof Choice>>;
  readonly hottexts: Iterable<Addition<typeof Hottext>>;
  readonly instances: Iterable<InstanceRoot>;
  readonly names: Iterable<Addition<typeof BindingName>>;
}): PlacedBindingRows => {
  const modes = new Map([...input.adaptive].map((row) => [documentKeyOf(row), row.adaptive]));
  const placements = [...input.instances].flatMap((root) => instancesOf(root));
  const placedOfDocument = <Row extends Place>(rows: Iterable<Row>) =>
    joinOn(placements, placedDocumentKeyOf, rows, documentKeyOf).flatMap(([placement, held]) =>
      held.map((row) => ({ placement, row })),
    );
  const choices = placedOfDocument(input.choices);
  const hottexts = placedOfDocument(input.hottexts);
  const bound = joinOn(
    placements.filter(({ assemblyKind }) => assemblyKind === itemKind),
    placedDocumentKeyOf,
    input.names,
    documentKeyOf,
  ).flatMap(([placement, names]) =>
    names.map((name) => ({
      binding: { ...name, assembly: placement.assembly, instance: placement.start },
      key: keyTextOf(name.package, placement.assembly, placement.start, name.start, name.attribute),
    })),
  );

  return {
    PlacedBinding: new Map(
      bound.map(
        ({ binding, key }) =>
          [
            key,
            {
              ...binding,
              adaptive: heldAt(
                modes,
                keyTextOf(binding.package, binding.assembly),
                "the package's item modes",
              ),
            },
          ] as const,
      ),
    ),
    PlacedChoice: new Map(
      choices.map(
        ({ placement, row: { identifier, kind, package: pkg, path, start } }) =>
          [
            keyTextOf(pkg, placement.assembly, placement.start, start),
            {
              assembly: placement.assembly,
              identifier,
              instance: placement.start,
              kind,
              package: pkg,
              path,
              start,
            },
          ] as const,
      ),
    ),
    PlacedHottext: new Map(
      hottexts.map(
        ({ placement, row: { identifier, package: pkg, path, start } }) =>
          [
            keyTextOf(pkg, placement.assembly, placement.start, start),
            {
              assembly: placement.assembly,
              identifier,
              instance: placement.start,
              package: pkg,
              path,
              start,
            },
          ] as const,
      ),
    ),
  };
};
