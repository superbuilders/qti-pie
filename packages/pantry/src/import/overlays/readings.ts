/**
 * The numbered readings of a test's variable references (information model §7.47; spec reading 88),
 * and its split readings through an item ref that names no item document (reading 110), which the
 * database cannot enumerate itself and proves once stated
 * (`#pantry/qti/overlay-queries/readings.ts`): a package-level pass over every test's assembly. And
 * each reference's readings through a scope, with the type each gives, which the per-placement
 * typing reads under each test ({@link scopedReadingsOf}, spec reading 167).
 *
 * A reference `SCOPE.N.VAR` written in a document a test places reads, through each placement of
 * an item ref `SCOPE` a selection with replacement can repeat, instance `N` (all digits, at least
 *
 * 1. Of its item and that item's variable `VAR`: one the item declares, one of an item's built-ins, a
 *    name one of the item ref's variable mappings gives one of the item's outcomes, or any name
 *    through an item ref that names no item document (spec reading 110). A setter's `identifier`
 *    names its own document's variable alone (reading 112), so it has no numbered reading. Each one
 *    that resolves is a row, keyed by its test, its reference, and its scope's placement and
 *    number.
 */
import { Option } from "effect";
import type { Addition } from "@bjornpagen/grizzle";
import { isNcName } from "@bjornpagen/grizzle-text/regex/xml";
import { BuiltInVariable } from "#pantry/grammar/install.ts";
import { valueAt } from "#pantry/import/names.ts";
import type { DocumentView } from "#pantry/import/fold.ts";
import type { InstanceMember, InstanceRoot } from "#pantry/import/overlays/tests.ts";
import { keyTextOf } from "#pantry/import/key-text.ts";
import type { Composed } from "#pantry/model/composed.ts";
import type { NodeRow } from "#pantry/model/xdm.ts";
import type { VariableRef } from "#pantry/qti/expressions.ts";
import type { ItemRefDocument, LinkReading, Named, NumberedReading } from "#pantry/qti/tests.ts";
import { setterKinds } from "#pantry/vocab/terms/expression-types.ts";
import {
  itemKind,
  itemRefKind,
  mappingKind,
  partKind,
  sectionKind,
  sectionRefKind,
  selectionKind,
  testKind,
} from "#pantry/vocab/terms/tests.ts";
import { booleanTrue } from "#pantry/grammar/domains.ts";

/**
 * The numbered readings of a package's tests, one keyed set.
 */
export interface NumberedReadingRows {
  readonly LinkReading: ReadonlyMap<string, Addition<typeof LinkReading>>;
  readonly NumberedReading: ReadonlyMap<string, Addition<typeof NumberedReading>>;
}

/**
 * One document of the package as the pass reads it: its view, the names it declares, its named
 * elements and the item document each of its item refs names.
 */
export interface ReadingDocument {
  readonly declared: ReadonlySet<string>;
  readonly itemRefs: ReadonlyMap<bigint, string>;
  readonly names: readonly Addition<typeof Named>[];
  readonly path: string;
  readonly references: readonly Addition<typeof VariableRef>[];
  readonly view: DocumentView;
}

/**
 * An item's built-in variables, which a prefixed reading reaches through its item ref (spec reading
 * 106).
 */
const itemBuiltIns: ReadonlySet<string> = new Set(
  BuiltInVariable.rows.filter((row) => row.root === itemKind).map(({ variable }) => variable),
);

/**
 * The setter kinds, whose `identifier` names its own document's variable alone (reading 112).
 */
const setters: ReadonlySet<string> = new Set(setterKinds);

/**
 * An instance number: all digits, and at least 1 (reading 88).
 */
const instanceNumber = /^0*[1-9][0-9]*$/u;

/**
 * One placement of a document in a test's assembly: its pre-order place in the instance tree, the
 * document it places, and whether a selection with replacement can repeat it (its site under a
 * replacing section, or its parent so repeated).
 */
interface Placement {
  readonly document: string;
  readonly instance: bigint;
  readonly replaced: boolean;
}

/**
 * Whether an element of a document lies under a section whose selection draws with replacement,
 * reading the element's ancestors in its document (§5.129.2).
 *
 * @param view - The document.
 * @param start - The element's place.
 * @returns Whether it does.
 */
const underReplacement = (view: DocumentView, start: bigint): boolean => {
  const byStart = new Map(view.rows.nodes.map((node) => [node.start, node] as const));
  const replacing = (section: NodeRow<Composed>): boolean =>
    view.rows.nodes.some(
      (child) =>
        child.parent === section.start &&
        child.kind === selectionKind &&
        Option.exists(valueAt(view, child, "with-replacement"), (value) =>
          booleanTrue.some((form) => form === value),
        ),
    );
  let at = byStart.get(start);
  while (at !== undefined && at.parent !== at.start) {
    const parent = byStart.get(at.parent);
    if (parent !== undefined && parent.kind === sectionKind && replacing(parent)) {
      return true;
    }

    at = parent;
  }

  return false;
};

/**
 * Number an assembly's instances in pre-order, each with whether a replacement can repeat it.
 *
 * @param root - The assembly's root instance.
 * @param documents - The package's documents by path.
 * @returns The placements.
 */
const placementsOf = (
  root: InstanceRoot,
  documents: ReadonlyMap<string, ReadingDocument>,
): readonly Placement[] => {
  const placed: Placement[] = [];
  const walk = (instance: InstanceMember | InstanceRoot, replaced: boolean): void => {
    placed.push({ document: instance.document, instance: BigInt(placed.length), replaced });

    const holder = documents.get(instance.document);
    for (const child of instance.children) {
      const repeats =
        replaced || (holder !== undefined && underReplacement(holder.view, child.site));
      walk(child, repeats);
    }
  };
  walk(root, false);

  return placed;
};

/**
 * The names an item ref's item gives its variables through the ref: each the item declares, each of
 * an item's built-ins, and each a mapping of the ref gives one of the item's outcomes, none where
 * the ref names no item document, whose names are any (reading 110).
 *
 * @param holder - The item ref's document.
 * @param ref - The item ref's place.
 * @param documents - The package's documents by path.
 * @returns The names, or none for a ref read unchecked.
 */
const namesThrough = (
  holder: ReadingDocument,
  ref: bigint,
  documents: ReadonlyMap<string, ReadingDocument>,
): Option.Option<ReadonlySet<string>> =>
  Option.map(Option.fromNullishOr(holder.itemRefs.get(ref)), (path) => {
    const item = documents.get(path);
    const declared = item?.declared ?? new Set<string>();
    const mapped = holder.view.rows.nodes.flatMap((node) =>
      node.kind === mappingKind && node.parent === ref
        ? Option.toArray(
            Option.filter(
              Option.all({
                source: valueAt(holder.view, node, "source-identifier"),
                target: valueAt(holder.view, node, "target-identifier"),
              }),
              ({ source }) => declared.has(source),
            ),
          ).map(({ target }) => target)
        : [],
    );

    return new Set([...declared, ...itemBuiltIns, ...mapped]);
  });

/**
 * An item ref of a test's assembly a reading may be read through: the document that holds it, its
 * name, and its placement.
 */
interface Scope {
  readonly holder: ReadingDocument;
  readonly name: Addition<typeof Named>;
  readonly placement: Placement;
}

/**
 * The item refs of an assembly's placements that a test of the package names, kept by a test of
 * each item ref and its placement.
 *
 * @param placements - The assembly's placements.
 * @param documents - The package's documents by path.
 * @param kept - Whether an item ref of a placement is kept.
 * @returns The scopes.
 */
const scopesOf = (
  placements: readonly Placement[],
  documents: ReadonlyMap<string, ReadingDocument>,
  kept: (holder: ReadingDocument, name: Addition<typeof Named>, placement: Placement) => boolean,
): readonly Scope[] =>
  placements.flatMap((placement) => {
    const holder = documents.get(placement.document);

    return holder === undefined
      ? []
      : holder.names
          .filter(
            (name) =>
              holder.view.rows.nodes.some(
                (node) => node.start === name.start && node.kind === itemRefKind,
              ) && kept(holder, name, placement),
          )
          .map((name) => ({ holder, name, placement }));
  });

/**
 * The link reading of one reference through one item ref that names no item document, where its
 * name is the item ref's identifier, a period and a name the linked item may declare (spec reading
 * 110): an NCName, since every variable's identifier is one (`IdentifierDType`, §4.5.1), so
 * `X.1.SCORE` through a repeated item ref is its numbered reading alone (reading 88).
 *
 * @param root - The test's assembly.
 * @param reference - The reference.
 * @param scope - The item ref.
 * @returns The row, or none.
 */
const linkReadingOf = (
  root: InstanceRoot,
  reference: Addition<typeof VariableRef>,
  scope: Scope,
): Option.Option<Addition<typeof LinkReading>> => {
  const prefix = `${scope.name.identifier}.`;
  const variable = reference.identifier.slice(prefix.length);

  return reference.identifier.startsWith(prefix) && isNcName(variable)
    ? Option.some({
        assembly: root.assembly,
        attribute: reference.attribute,
        package: root.package,
        path: reference.path,
        scope: scope.name.start,
        scopeInstance: scope.placement.instance,
        scopePath: scope.holder.path,
        start: reference.start,
        variable,
      })
    : Option.none();
};

/**
 * The numbered reading of one reference through one repeatable item ref, where its name is the item
 * ref's identifier, a period, an instance number at least 1, a period and a variable the item names
 * (reading 88).
 *
 * @param root - The test's assembly.
 * @param reference - The reference.
 * @param scope - The item ref.
 * @param documents - The package's documents by path.
 * @returns The row, or none.
 */
const numberedReadingOf = (
  root: InstanceRoot,
  reference: Addition<typeof VariableRef>,
  scope: Scope,
  documents: ReadonlyMap<string, ReadingDocument>,
): Option.Option<Addition<typeof NumberedReading>> => {
  const prefix = `${scope.name.identifier}.`;
  const rest = reference.identifier.slice(prefix.length);
  const dot = rest.indexOf(".");
  const number = rest.slice(0, Math.max(dot, 0));
  const variable = rest.slice(dot + 1);
  const named = namesThrough(scope.holder, scope.name.start, documents);
  const reads =
    reference.identifier.startsWith(prefix) &&
    dot > 0 &&
    instanceNumber.test(number) &&
    variable.length > 0 &&
    Option.match(named, { onNone: () => true, onSome: (names) => names.has(variable) });

  return reads
    ? Option.some({
        assembly: root.assembly,
        attribute: reference.attribute,
        number,
        package: root.package,
        path: reference.path,
        scope: scope.name.start,
        scopeInstance: scope.placement.instance,
        scopePath: scope.holder.path,
        start: reference.start,
        variable,
      })
    : Option.none();
};

/**
 * The references of a placement that read prefixes: every one but a setter's `identifier` (reading
 * 112).
 *
 * @param holder - The placement's document.
 * @returns The references.
 */
const prefixingOf = (holder: ReadingDocument): readonly Addition<typeof VariableRef>[] =>
  holder.references.filter((reference) => {
    const kind = holder.view.rows.nodes.find((node) => node.start === reference.start)?.kind;

    return !(reference.attribute === "identifier" && kind !== undefined && setters.has(kind));
  });

/**
 * Build the numbered readings, and the readings through an item ref that names no item document,
 * of every reference a test of the package places.
 *
 * @param input - The package's rows the pass reads.
 * @param input.documents - Every document of the package, as the pass reads it.
 * @param input.instances - Every assembly's root instance, its tree nested.
 * @returns The rows.
 */
export const numberedReadingRowsOf = (input: {
  readonly documents: readonly ReadingDocument[];
  readonly instances: Iterable<InstanceRoot>;
}): NumberedReadingRows => {
  const documents = new Map(input.documents.map((document) => [document.path, document] as const));
  const numbered = new Map<string, Addition<typeof NumberedReading>>();
  const links = new Map<string, Addition<typeof LinkReading>>();
  for (const root of [...input.instances].filter(({ assemblyKind }) => assemblyKind === testKind)) {
    const placements = placementsOf(root, documents);
    const linkScopes = scopesOf(
      placements,
      documents,
      (holder, name) => !holder.itemRefs.has(name.start),
    );
    const repeatable = scopesOf(
      placements,
      documents,
      (holder, name, placement) => placement.replaced || underReplacement(holder.view, name.start),
    );
    for (const placement of placements) {
      const holder = documents.get(placement.document);
      for (const reference of holder === undefined ? [] : prefixingOf(holder)) {
        for (const row of linkScopes.flatMap((scope) =>
          Option.toArray(linkReadingOf(root, reference, scope)),
        )) {
          links.set(
            keyTextOf(
              row.assembly,
              row.path,
              row.start,
              row.attribute,
              row.scopeInstance,
              row.scope,
            ),
            row,
          );
        }

        for (const row of repeatable.flatMap((scope) =>
          Option.toArray(numberedReadingOf(root, reference, scope, documents)),
        )) {
          numbered.set(
            keyTextOf(
              row.assembly,
              row.path,
              row.start,
              row.attribute,
              row.scopeInstance,
              row.scope,
              row.number,
            ),
            row,
          );
        }
      }
    }
  }

  return { LinkReading: links, NumberedReading: numbered };
};

/**
 * A reading's type, the expression type its variable stands as.
 */
interface ReadingType {
  readonly baseType: string;
  readonly cardinality: string;
}

/**
 * The scopes whose `duration` a test's reading names through its name and a period (§2.8.5): a test
 * part, a section, and a section ref, the facade of its placement (§7.5, reading 86).
 */
const durationKinds: ReadonlySet<string> = new Set([partKind, sectionKind, sectionRefKind]);

/**
 * The type one reading of an item's variable through an item ref gives, by the variable's name in
 * the test's view: its declaration's, a variable mapping's source declaration's for the mapping's
 * target, or a built-in's; none for a name the item gives no variable.
 *
 * @param holder - The item ref's document.
 * @param ref - The item ref's place.
 * @param variable - The variable's name.
 * @param typesOf - The package's declared types.
 * @returns The type, or none.
 */
const itemReadingTypeOf = <Type extends ReadingType>(
  holder: ReadingDocument,
  ref: bigint,
  variable: string,
  typesOf: AssembledTypeInput<Type>,
): Type | undefined => {
  const item = holder.itemRefs.get(ref);
  if (item === undefined) {
    return undefined;
  }

  const [source] = holder.view.rows.nodes.flatMap((node) =>
    node.kind === mappingKind && node.parent === ref
      ? Option.toArray(
          Option.filter(
            Option.all({
              source: valueAt(holder.view, node, "source-identifier"),
              target: valueAt(holder.view, node, "target-identifier"),
            }),
            ({ target }) => target === variable,
          ),
        ).map(({ source: named }) => named)
      : [],
  );

  return (
    typesOf.declared(item, variable) ??
    (source === undefined ? undefined : typesOf.declared(item, source)) ??
    typesOf.builtIn(itemKind, variable)
  );
};

/**
 * What the scoped readings' types read beyond the documents: each document's declared types, and
 * each root's built-ins' types.
 */
export interface AssembledTypeInput<Type extends ReadingType> {
  readonly builtIn: (root: string, name: string) => Type | undefined;
  readonly declared: (path: string, name: string) => Type | undefined;
}

/**
 * One test's assembly as its scoped readings read it: the package's documents, the assembly's root,
 * placements and scopes, its stated numbered readings by reference, and the declared and built-in
 * types.
 */
interface TypedAssembly<Type extends ReadingType> {
  readonly documents: ReadonlyMap<string, ReadingDocument>;
  readonly numberedAt: ReadonlyMap<string, readonly Addition<typeof NumberedReading>[]>;
  readonly placements: readonly Placement[];
  readonly root: InstanceRoot;
  readonly scopes: readonly Scope[];
  readonly types: AssembledTypeInput<Type>;
}

/**
 * A reading's type, `undefined` for a reading that gives none: through an item ref that names no
 * item document (reading 110), or a stated numbered reading of one.
 */
type Reading<Type> = Type | undefined;

/**
 * The readings of a name through the item refs of an assembly: for each scope it prefixes, the
 * type the rest names through the scope's item ref, and an untyped reading for an item ref that
 * names no item document where the rest is a name.
 *
 * @param assembly - The assembly.
 * @param name - The reference's name.
 * @returns Its readings.
 */
const splitReadingsOf = <Type extends ReadingType>(
  assembly: TypedAssembly<Type>,
  name: string,
): readonly Reading<Type>[] =>
  assembly.scopes.flatMap((scope) => {
    const prefix = `${scope.name.identifier}.`;
    if (!name.startsWith(prefix)) {
      return [];
    }

    const variable = name.slice(prefix.length);
    if (!scope.holder.itemRefs.has(scope.name.start)) {
      return isNcName(variable) ? [undefined] : [];
    }

    return Option.toArray(
      Option.fromNullishOr(
        itemReadingTypeOf(scope.holder, scope.name.start, variable, assembly.types),
      ),
    );
  });

/**
 * The readings of a name as a scope's `duration`: the test's built-in `duration` for each test
 * part, section or section ref of the assembly whose name it prefixes with a period.
 *
 * @param assembly - The assembly.
 * @param name - The reference's name.
 * @returns Its readings.
 */
const durationReadingsOf = <Type extends ReadingType>(
  assembly: TypedAssembly<Type>,
  name: string,
): readonly Reading<Type>[] =>
  assembly.placements.flatMap((placed) => {
    const scopeHolder = assembly.documents.get(placed.document);

    return (scopeHolder?.names ?? []).flatMap((named) => {
      const kind = scopeHolder?.view.rows.nodes.find((node) => node.start === named.start)?.kind;

      return kind !== undefined &&
        durationKinds.has(kind) &&
        name === `${named.identifier}.duration`
        ? [assembly.types.builtIn(testKind, "duration")]
        : [];
    });
  });

/**
 * The stated numbered readings of a reference in an assembly: each the type its variable names
 * through its scope's item ref.
 *
 * @param assembly - The assembly.
 * @param reference - The reference.
 * @returns Its readings.
 */
const numberedReadingsOf = <Type extends ReadingType>(
  assembly: TypedAssembly<Type>,
  reference: Addition<typeof VariableRef>,
): readonly Reading<Type>[] =>
  (
    assembly.numberedAt.get(
      keyTextOf(assembly.root.assembly, reference.path, reference.start, reference.attribute),
    ) ?? []
  ).map((numbered) => {
    const scopeHolder = assembly.documents.get(numbered.scopePath);

    return scopeHolder === undefined
      ? undefined
      : itemReadingTypeOf(scopeHolder, numbered.scope, numbered.variable, assembly.types);
  });

/**
 * Every reading of a reference of a document a test places through a scope: for a reference whose
 * name may be prefixed, its readings through item refs, as a scope's `duration` and as stated
 * numbered readings. The test's own declaration or built-in of the whole name is a declaration's
 * or a built-in's to resolve first, never a reading here.
 *
 * @param assembly - The assembly.
 * @param prefixing - Whether the reference's name may be prefixed (reading 112).
 * @param reference - The reference.
 * @returns Its readings.
 */
const referenceReadingsOf = <Type extends ReadingType>(
  assembly: TypedAssembly<Type>,
  prefixing: boolean,
  reference: Addition<typeof VariableRef>,
): readonly Reading<Type>[] =>
  prefixing
    ? [
        ...splitReadingsOf(assembly, reference.identifier),
        ...durationReadingsOf(assembly, reference.identifier),
        ...numberedReadingsOf(assembly, reference),
      ]
    : [];

/**
 * Read each test's readings of the references its documents make through a scope, as the database
 * reads them (`TestReading`, `#pantry/qti/overlay-queries/readings.ts`): through an item ref, the
 * item's declaration, mapped source or built-in of the rest; a scope's `duration`; and each stated
 * numbered reading; each with the type it gives, none for one through an item ref that names no
 * item document (reading 110). The per-placement typing reads a reference as its one reading's
 * variable (spec reading 167).
 *
 * @param input - The package's rows the pass reads.
 * @param input.documents - Every document of the package, as the pass reads it.
 * @param input.instances - Every assembly's root instance, its tree nested.
 * @param input.readings - The stated numbered and link readings.
 * @param input.types - The declared and built-in types.
 * @returns The readings of a reference under a test, by the test's path; none under any other
 *   assembly.
 */
export const scopedReadingsOf = <Type extends ReadingType>(input: {
  readonly documents: readonly ReadingDocument[];
  readonly instances: Iterable<InstanceRoot>;
  readonly readings: NumberedReadingRows;
  readonly types: AssembledTypeInput<Type>;
}): ((assembly: string, reference: Addition<typeof VariableRef>) => readonly Reading<Type>[]) => {
  const documents = new Map(input.documents.map((document) => [document.path, document] as const));
  const numberedAt = Map.groupBy(input.readings.NumberedReading.values(), (row) =>
    keyTextOf(row.assembly, row.path, row.start, row.attribute),
  );
  const assemblies = new Map(
    [...input.instances]
      .filter(({ assemblyKind }) => assemblyKind === testKind)
      .map((root) => {
        const placements = placementsOf(root, documents);
        const assembly: TypedAssembly<Type> = {
          documents,
          numberedAt,
          placements,
          root,
          scopes: scopesOf(placements, documents, () => true),
          types: input.types,
        };

        return [root.assembly, assembly] as const;
      }),
  );
  const prefixing = new Set(
    input.documents.flatMap((holder) =>
      prefixingOf(holder).map(({ attribute, path, start }) => keyTextOf(path, start, attribute)),
    ),
  );

  return (assembly, reference) =>
    Option.match(Option.fromNullishOr(assemblies.get(assembly)), {
      onNone: () => [],
      onSome: (typed) =>
        referenceReadingsOf(
          typed,
          prefixing.has(keyTextOf(reference.path, reference.start, reference.attribute)),
          reference,
        ),
    });
};

/**
 * Read one document for the pass: its declared names, its named elements, the item document each
 * of its item refs names and its variable references.
 *
 * @param input - The document's rows.
 * @param input.declared - The names it declares (`documentNamesOf`).
 * @param input.itemRefDocuments - Every item ref's item document of the package.
 * @param input.names - Its named elements (`Named`).
 * @param input.path - Its path.
 * @param input.references - Its variable references (`VariableRef`).
 * @param input.view - Its view.
 * @returns The document as the pass reads it.
 */
export const readingDocumentOf = (input: {
  readonly declared: Iterable<string>;
  readonly itemRefDocuments: Iterable<Addition<typeof ItemRefDocument>>;
  readonly names: Iterable<Addition<typeof Named>>;
  readonly path: string;
  readonly references: Iterable<Addition<typeof VariableRef>>;
  readonly view: DocumentView;
}): ReadingDocument => ({
  declared: new Set(input.declared),
  itemRefs: new Map(
    [...input.itemRefDocuments]
      .filter(({ path }) => path === input.path)
      .map(({ start, target }) => [start, target] as const),
  ),
  names: [...input.names].filter(({ path }) => path === input.path),
  path: input.path,
  references: [...input.references].filter(({ path }) => path === input.path),
  view: input.view,
});
