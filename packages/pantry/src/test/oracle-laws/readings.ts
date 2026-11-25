/**
 * The producers of the law oracle's laws over the readings of a test's variable references (lane
 * OL): each stated on the host from the schema's statement of it in
 * `src/qti/overlay-queries/readings.ts`, over the assemblies `#pantry/test/oracle-laws/assembly.ts`
 * reads and the references `#pantry/test/oracle-laws/expressions.ts` types.
 *
 * A reference written in a document a test places resolves once for each test that places it
 * (reading 5), and names, by reading 48, exactly one of:
 *
 * - **unsplit**, a variable of the test: one the test declares, or one of its built-ins (reading 29);
 * - **split**, `SCOPE.VAR`: an item ref of the test and a variable of its item, one the item
 *   declares, one of an item's built-ins (reading 106) or a name a variable mapping of the item ref
 *   gives one of the item's outcomes (reading 107), and any identifier through an item ref that
 *   names no item document (reading 110); or a test part, a section or a section ref and its
 *   built-in `duration` (§2.8.5);
 * - **numbered**, `SCOPE.N.VAR`: an item ref a selection with replacement can repeat in its
 *   placement, an instance number at least 1 and a variable of its item (reading 88).
 *
 * Each placement of a scope is a reading of its own, so a name a section document placed twice
 * supplies is read twice (reading 86). A setter's `identifier` names a variable of its own document
 * alone, so its split and numbered readings count for nothing (reading 112).
 *
 * - `Prefixed reference` (reading 48): no placed reference has two readings;
 * - `Variable declared` (P8, over a test's assembly): every placed reference that is not braced, a
 *   string value where it names nothing (reading R15-k), has one;
 * - `Variable kind` (reading 166): a prefixed reading by `identifier` names an item declaration of a
 *   kind its element may name;
 * - `Weighted variable` (§7.47.2: "Weights are defined only in the test context ... and only when the
 *   item identifier prefixing technique (see above) is being used to look up the value of an item
 *   variable"): a weighted variable has a reading through an item ref;
 * - `Mapped response` (reading 166; §7.22: a map response "transforms it using the associated
 *   mapping, which must have been declared"; §6.9.46, a map response point's area mapping): a
 *   prefixed map response's reading through an item ref that names an item document names a
 *   variable whose declaration holds a `qti-mapping`, under its own name or a mapping of the ref's,
 *   and a map response point's one that holds a `qti-area-mapping`; an item built-in holds none.
 */
import { regex } from "arkregex";
import { Option } from "effect";
import type { ComposedGrammar } from "#pantry/grammar/compose.ts";
import {
  assembledDocumentsOf,
  itemRefDocument,
  replaceableIn,
  testKinds,
  testsOf,
} from "#pantry/test/oracle-laws/assembly.ts";
import type { AssembledDocument, Instance, Name } from "#pantry/test/oracle-laws/assembly.ts";
import { declarationKindsOf, typedOf } from "#pantry/test/oracle-laws/expressions.ts";
import type {
  PlacementScope,
  ScopedReference,
  Type,
  Typed,
} from "#pantry/test/oracle-laws/expressions.ts";
import { declaredNamesOf } from "#pantry/test/oracle-laws/tests.ts";
import { ncNameForm as ncName } from "#pantry/test/oracle-laws/typed.ts";
import { breachAt, elementsOf, typedValueOf, valueOf } from "#pantry/test/oracle-view.ts";
import type { LawBreach, ListedRows, PackageRows, View } from "#pantry/test/oracle-view.ts";

/**
 * The laws this module produces.
 */
export const readingLaws = [
  "Prefixed reference",
  "Variable declared",
  "Variable kind",
  "Weighted variable",
  "Mapped response",
] as const;

/**
 * A law of {@link readingLaws}.
 */
type ReadingLaw = (typeof readingLaws)[number];

/**
 * A breach of one of this module's laws at a node.
 */
type Breach = LawBreach<ReadingLaw>;

/**
 * One reference a processing element makes, as `typedOf` resolves it in its own document.
 */
type Reference = Typed["references"][number];

/**
 * The processing kinds whose `identifier` names the variable they set (information model §5.87.1,
 * §6.32.3, §6.50.1, §6.50.4, §6.50.5), which only an unsplit reading resolves (reading 112).
 */
const setterKinds: ReadonlySet<string> = new Set([
  "qti-lookup-outcome-value",
  "qti-set-correct-response",
  "qti-set-default-value",
  "qti-set-outcome-value",
  "qti-set-template-value",
]);

/**
 * The scopes whose `duration` a prefixed reading names (§2.8.5): a test part, a section, and a
 * section ref, the facade of its placement (§7.5, reading 86).
 */
const durationScopes: ReadonlySet<string> = new Set([
  testKinds.part,
  testKinds.section,
  testKinds.sectionRef,
]);

/**
 * An instance number: all digits, and at least 1 (reading 88: "its number is all digits and at
 * least 1, the first instance being 1").
 */
const instanceNumber = regex("^0*[1-9][0-9]*$", "u");

/**
 * One scope a placed reference may be read through: a name of a document an instance of the test
 * places, with the item document it names where it is an item ref that names one.
 */
interface Scope {
  readonly instance: Instance;
  readonly item: Option.Option<ListedRows>;
  readonly name: Name;
}

/**
 * One reading of a placed reference: its scope's placement and element (the test's own node 0 for
 * an unsplit reading), its variable's name, and the declaration kinds an item reading names.
 */
interface Reading {
  readonly declarations: readonly string[];
  /**
   * Whether its scope is an item ref (`ItemScopedReading`).
   */
  readonly item: boolean;
  readonly key: string;
  /**
   * Its scope and its variable's name, where its scope is an item ref that names an item document,
   * split or numbered: the item variable a table reader claims a table of.
   */
  readonly through: Option.Option<{ readonly scope: Scope; readonly variable: string }>;
}

/**
 * The table each table reader claims of the variable it names: a map response's `qti-mapping` and
 * a map response point's `qti-area-mapping` (§7.22, §6.9.46).
 */
const claimedTables: ReadonlyMap<string, string> = new Map([
  ["qti-map-response", "qti-mapping"],
  ["qti-map-response-point", "qti-area-mapping"],
]);

/**
 * The tables an item variable holds through an item ref (`ItemRefTable`): each child of a
 * declaration of the ref's item that bears the variable's name, and of one whose name a variable
 * mapping of the ref gives the variable (§7.48).
 *
 * @param scope - The item ref, with the item document it names.
 * @param item - The item document.
 * @param variable - The variable's name through the ref.
 * @param grammar - The composed grammar, whose declaration kinds it reads.
 * @returns The tables' kinds.
 */
const tablesThrough = (
  scope: Scope,
  item: ListedRows,
  variable: string,
  grammar: ComposedGrammar,
): ReadonlySet<string> => {
  const { rows } = scope.instance.document.listed;
  const sources = rows.members.flatMap((node) =>
    node.kind === "qti-variable-mapping" && node.parent === scope.name.node.start
      ? Option.toArray(
          Option.all({
            source: typedValueOf(rows, node.start, "source-identifier"),
            target: typedValueOf(rows, node.start, "target-identifier"),
          }),
        ).flatMap(({ source, target }) => (target === variable ? [source] : []))
      : [],
  );
  const names = new Set([variable, ...sources]);

  return new Set(
    item.rows.members
      .filter(
        (node) =>
          grammar.references.declarationKind.has(node.kind) &&
          Option.exists(typedValueOf(item.rows, node.start, "identifier"), (identifier) =>
            names.has(identifier),
          ),
      )
      .flatMap((declaration) => elementsOf(item.rows, declaration.start).map(({ kind }) => kind)),
  );
};

/**
 * The tables one test's readings read: its scopes, the names each item ref's item gives through
 * it, and the test's own names.
 */
interface Readings {
  readonly builtIns: { readonly item: ReadonlySet<string>; readonly test: ReadonlySet<string> };
  readonly scopes: readonly Scope[];
  readonly testDeclared: ReadonlyMap<string, readonly string[]>;
  readonly variablesOf: (scope: Scope) => ReadonlyMap<string, readonly string[]>;
}

/**
 * Read one test's tables.
 *
 * @param input - The package.
 * @param test - The test document.
 * @param instances - Its assembly.
 * @param grammar - The composed grammar.
 * @returns The tables.
 */
const readingsOf = (
  input: PackageRows,
  test: AssembledDocument,
  instances: readonly Instance[],
  grammar: ComposedGrammar,
): Readings => {
  const builtInsOf = (root: string): ReadonlySet<string> =>
    new Set(
      grammar.references.builtIn.rows
        .filter((row) => row.root === root)
        .map(({ variable }) => variable),
    );
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
  const items = new Map<string, Option.Option<ListedRows>>();
  const scopes = instances.flatMap((instance) =>
    instance.document.names.map((name): Scope => {
      const { listed } = instance.document;
      const key = `${listed.path} ${String(name.node.start)}`;
      const item =
        items.get(key) ??
        (name.node.kind === testKinds.itemRef
          ? itemRefDocument(input, listed, name.node)
          : Option.none());
      items.set(key, item);

      return { instance, item, name };
    }),
  );

  return {
    builtIns: { item: builtInsOf(testKinds.item), test: builtInsOf(testKinds.test) },
    scopes,
    testDeclared: declaredNamesOf(test.listed.rows, grammar),
    // The variables an item ref names through its item (§7.47, §7.48, reading 107): each the item
    // declares, and each a mapping of the item ref gives one of the item's declarations.
    variablesOf: ({ instance, item, name }) =>
      Option.match(item, {
        onNone: () => new Map(),
        onSome: (held) => {
          const declared = declaredIn(held);
          const { rows } = instance.document.listed;
          const mapped = rows.members.flatMap((node) =>
            node.kind === "qti-variable-mapping" && node.parent === name.node.start
              ? Option.toArray(
                  Option.all({
                    source: typedValueOf(rows, node.start, "source-identifier"),
                    target: typedValueOf(rows, node.start, "target-identifier"),
                  }),
                ).flatMap(({ source, target }) =>
                  (declared.get(source) ?? []).map((kind) => [target, kind] as const),
                )
              : [],
          );
          const variables = new Map<string, readonly string[]>(declared);
          for (const [target, kind] of mapped) {
            variables.set(target, [...(variables.get(target) ?? []), kind]);
          }

          return variables;
        },
      }),
  };
};

/**
 * Read one placed reference every way it resolves across its test.
 *
 * @param tables - The test's tables.
 * @param testPath - The test document's path.
 * @param reference - The reference.
 * @returns Its readings, each once.
 */
const readingsOfReference = (
  tables: Readings,
  testPath: string,
  reference: Reference,
): readonly Reading[] => {
  const { identifier } = reference;
  const unsplit: readonly Reading[] =
    tables.testDeclared.has(identifier) || tables.builtIns.test.has(identifier)
      ? [
          {
            declarations: [],
            item: false,
            key: `0 ${testPath} 0 ${identifier}`,
            through: Option.none(),
          },
        ]
      : [];
  const prefixing = !(reference.attribute === "identifier" && setterKinds.has(reference.node.kind));
  const split = prefixing
    ? tables.scopes.flatMap(({ instance, item, name }): readonly Reading[] => {
        const prefix = `${name.identifier}.`;
        if (!identifier.startsWith(prefix)) {
          return [];
        }

        const rest = identifier.slice(prefix.length);
        const keyOf = (variable: string): string =>
          `${String(instance.start)} ${instance.document.listed.path} ${String(name.node.start)} ${variable}`;
        if (name.node.kind !== testKinds.itemRef) {
          return durationScopes.has(name.node.kind) && rest === "duration"
            ? [{ declarations: [], item: false, key: keyOf(rest), through: Option.none() }]
            : [];
        }

        const variables = tables.variablesOf({ instance, item, name });
        const names = (variable: string): boolean =>
          Option.isNone(item) || variables.has(variable) || tables.builtIns.item.has(variable);
        const dot = rest.indexOf(".");
        const number = rest.slice(0, dot);
        const numbered = rest.slice(dot + 1);

        return [
          // Through an item ref that names no item document any variable is read, but a variable's
          // name is an identifier (`IdentifierDType`, §4.5.1), so `SCOPE.1.VAR` reads no
          // variable `1.VAR` there, only its numbered reading where a replacement repeats SCOPE.
          ...(Option.isNone(item) && ncName.test(rest)
            ? [{ declarations: [], item: true, key: keyOf(rest), through: Option.none() }]
            : []),
          ...(Option.isSome(item) && (variables.has(rest) || tables.builtIns.item.has(rest))
            ? [
                {
                  declarations: variables.get(rest) ?? [],
                  item: true,
                  key: keyOf(rest),
                  through: Option.some({ scope: { instance, item, name }, variable: rest }),
                },
              ]
            : []),
          ...(replaceableIn(instance, name.node) &&
          dot > 0 &&
          instanceNumber.test(number) &&
          numbered.length > 0 &&
          names(numbered)
            ? [
                {
                  declarations: [],
                  item: true,
                  key: keyOf(numbered),
                  through: Option.isSome(item)
                    ? Option.some({ scope: { instance, item, name }, variable: numbered })
                    : Option.none(),
                },
              ]
            : []),
        ];
      })
    : [];

  return [...new Map([...unsplit, ...split].map((reading) => [reading.key, reading])).values()];
};

/**
 * Judge one test's placed references and weighted variables.
 *
 * @param input - The package.
 * @param test - The test document.
 * @param instances - Its assembly.
 * @param grammar - The composed grammar.
 * @returns The breaches.
 */
const testReadingsOf = (
  input: PackageRows,
  test: AssembledDocument,
  instances: readonly Instance[],
  grammar: ComposedGrammar,
): readonly Breach[] => {
  const tables = readingsOf(input, test, instances, grammar);
  const testPath = test.listed.path;
  const spellings = new Map(
    grammar.references.variableReference.rows.map(
      ({ attribute, kind, spelling }): readonly [string, string] => [
        [kind, attribute].join(" "),
        spelling,
      ],
    ),
  );
  const documents = [
    ...new Map(instances.map(({ document }) => [document.listed.path, document] as const)).values(),
  ];

  return documents.flatMap(({ listed: { rows } }): readonly Breach[] => {
    const itemScoped = new Set<bigint>();
    const breaches = typedOf(rows, grammar).references.flatMap((reference): readonly Breach[] => {
      const { attribute, identifier, node } = reference;
      const readings = readingsOfReference(tables, testPath, reference);
      if (attribute === "identifier" && readings.some(({ item }) => item)) {
        itemScoped.add(node.start);
      }

      const allowed = declarationKindsOf(node.kind);
      const kinds =
        attribute === "identifier"
          ? [...new Set(readings.flatMap(({ declarations }) => declarations))]
          : [];
      const table = Option.fromNullishOr(claimedTables.get(node.kind)).pipe(
        Option.filter(() => attribute === "identifier"),
      );
      // Reading 166: each reading through an item's ref claims the item variable's table, which a
      // built-in variable never holds.
      const unmapped = Option.toArray(table).flatMap((claimed) =>
        readings
          .flatMap(({ through }) =>
            Option.toArray(through).filter(
              ({ scope, variable }) =>
                !Option.exists(scope.item, (item) =>
                  tablesThrough(scope, item, variable, grammar).has(claimed),
                ),
            ),
          )
          .map(({ scope, variable }) => ({
            claimed,
            declarations: tables.variablesOf(scope).get(variable) ?? [],
            variable,
          })),
      );

      return [
        ...(readings.length > 1
          ? [
              breachAt(rows, node, "Prefixed reference", {
                identifier,
                readings: String(readings.length),
                test: testPath,
              }),
            ]
          : []),
        ...(readings.length === 0 && spellings.get(`${node.kind} ${attribute}`) !== "braced"
          ? [breachAt(rows, node, "Variable declared", { identifier, kind: node.kind })]
          : []),
        ...kinds
          .filter((declarationKind) => !allowed.includes(declarationKind))
          .map((declarationKind) =>
            breachAt(rows, node, "Variable kind", {
              allowed: allowed.join(" "),
              declarationKind,
              identifier,
              kind: node.kind,
            }),
          ),
        ...unmapped.slice(0, 1).map(({ claimed, declarations }) =>
          breachAt(rows, node, "Mapped response", {
            declarationKind: declarations.join(" ") || "built-in variable",
            identifier,
            kind: node.kind,
            table: claimed,
          }),
        ),
      ];
    });
    const weighted = rows.members.filter(
      (node) =>
        node.kind === "qti-variable" &&
        Option.isSome(valueOf(rows, node.start, "weight-identifier")) &&
        !itemScoped.has(node.start),
    );

    return [
      ...breaches,
      ...weighted.map((node) =>
        breachAt(rows, node, "Weighted variable", {
          identifier: Option.getOrElse(typedValueOf(rows, node.start, "identifier"), () => ""),
        }),
      ),
    ];
  });
};

/**
 * Judge a package by the readings of its tests' references, test by test.
 *
 * @param input - The package.
 * @param grammar - The composed grammar.
 * @returns The breaches.
 */
export const readingPackageBreaches = (
  input: PackageRows,
  grammar: ComposedGrammar,
): readonly Breach[] =>
  testsOf(input, assembledDocumentsOf(input, grammar)).flatMap(({ instances, test }) =>
    testReadingsOf(input, test, instances, grammar),
  );

/**
 * The types each declaration of a document gives the references that name it, by name: its base
 * type and its cardinality as their types read them, `unknown` where it writes none or one outside
 * its domain, the first declaration of a name the one that types it, as `typedOf` reads it.
 *
 * @param rows - The document.
 * @param grammar - The composed grammar, whose declaration kinds it reads.
 * @returns The types, by name.
 */
const declaredTypesOf = (rows: View, grammar: ComposedGrammar): ReadonlyMap<string, Type> => {
  const types = new Map<string, Type>();
  for (const node of rows.members) {
    if (grammar.references.declarationKind.has(node.kind)) {
      for (const identifier of Option.toArray(typedValueOf(rows, node.start, "identifier"))) {
        if (!types.has(identifier)) {
          types.set(identifier, {
            base: Option.getOrElse(typedValueOf(rows, node.start, "base-type"), () => "unknown"),
            cardinality: Option.getOrElse(
              typedValueOf(rows, node.start, "cardinality"),
              () => "unknown",
            ),
          });
        }
      }
    }
  }

  return types;
};

/**
 * What one reading of a reference through a scope gives its type: a type, or `untyped` for one
 * through an item ref that names no item document (reading 110).
 */
type ReadingTypeOf = Type | "untyped";

/**
 * Read each test's references through its scopes, as the importer reads them (`scopedReadingsOf`,
 * `#pantry/import/overlays/readings.ts`) and the database's `TestReading` holds them: through an
 * item ref that names an item document, the item's declaration of the rest, a variable mapping's
 * source declaration for its target, or an item built-in; through one that names none, an untyped
 * reading where the rest is a name; a part's, a section's or a section ref's `duration`, the
 * test's built-in; and each numbered reading, its item's variable the same way, untyped through a
 * link. Each placement of a scope is a reading of its own. A test's own declaration or built-in of
 * the whole name is no reading here: its placements resolve those first (spec reading 117). A
 * reference is read as its one reading's variable where it has exactly one, typed (spec reading
 * 167): none, two, or an untyped one leave it unresolved.
 *
 * @param input - The package.
 * @param grammar - The composed grammar.
 * @returns Each test's reading of a reference, by the test's path; none under any other root.
 */
export const scopedReadsOf = (
  input: PackageRows,
  grammar: ComposedGrammar,
): ((path: string) => PlacementScope["read"]) => {
  const tests = new Map(
    testsOf(input, assembledDocumentsOf(input, grammar)).map(
      ({ instances, test }) =>
        [test.listed.path, readingsOf(input, test, instances, grammar)] as const,
    ),
  );
  const declared = new Map<string, ReadonlyMap<string, Type>>();
  const declaredIn = (listed: ListedRows): ReadonlyMap<string, Type> => {
    const known = declared.get(listed.path);
    if (known !== undefined) {
      return known;
    }

    const types = declaredTypesOf(listed.rows, grammar);
    declared.set(listed.path, types);

    return types;
  };
  const builtInOf = (root: string, variable: string): Type | undefined => {
    const builtIn = grammar.references.builtIn.rows.find(
      (row) => row.root === root && row.variable === variable,
    );

    return builtIn === undefined
      ? undefined
      : {
          base:
            grammar.references.builtInBaseType.rows.find(
              (row) => row.root === root && row.variable === variable,
            )?.baseType ?? "unknown",
          cardinality: builtIn.cardinality,
        };
  };
  // An item variable's type through an item ref: the item's declaration of it, else the source
  // declaration of the ref's first variable mapping that targets it, else an item built-in.
  const itemTypeOf = (scope: Scope, item: ListedRows, variable: string): Type | undefined => {
    const { rows } = scope.instance.document.listed;
    const source = rows.members
      .filter(
        (node) => node.kind === "qti-variable-mapping" && node.parent === scope.name.node.start,
      )
      .flatMap((node) =>
        Option.toArray(
          Option.all({
            source: typedValueOf(rows, node.start, "source-identifier"),
            target: typedValueOf(rows, node.start, "target-identifier"),
          }),
        ),
      )
      .find(({ target }) => target === variable)?.source;

    return (
      declaredIn(item).get(variable) ??
      (source === undefined ? undefined : declaredIn(item).get(source)) ??
      builtInOf(testKinds.item, variable)
    );
  };
  const readingTypesOf = (
    tables: Readings,
    reference: ScopedReference,
  ): readonly ReadingTypeOf[] => {
    const { identifier } = reference;
    if (reference.attribute === "identifier" && setterKinds.has(reference.kind)) {
      return [];
    }

    const duration = builtInOf(testKinds.test, "duration");

    return tables.scopes.flatMap((scope): readonly ReadingTypeOf[] => {
      const prefix = `${scope.name.identifier}.`;
      if (!identifier.startsWith(prefix)) {
        return [];
      }

      const rest = identifier.slice(prefix.length);
      if (scope.name.node.kind !== testKinds.itemRef) {
        return durationScopes.has(scope.name.node.kind) &&
          rest === "duration" &&
          duration !== undefined
          ? [duration]
          : [];
      }

      const variables = tables.variablesOf(scope);
      const dot = rest.indexOf(".");
      const number = rest.slice(0, dot);
      const numbered = rest.slice(dot + 1);
      const numberedRead =
        replaceableIn(scope.instance, scope.name.node) &&
        dot > 0 &&
        instanceNumber.test(number) &&
        numbered.length > 0 &&
        (Option.isNone(scope.item) ||
          variables.has(numbered) ||
          tables.builtIns.item.has(numbered));

      return Option.match(scope.item, {
        onNone: (): readonly ReadingTypeOf[] => [
          ...(ncName.test(rest) ? ["untyped" as const] : []),
          ...(numberedRead ? ["untyped" as const] : []),
        ],
        onSome: (item): readonly ReadingTypeOf[] => [
          ...Option.toArray(Option.fromUndefinedOr(itemTypeOf(scope, item, rest))),
          ...(numberedRead
            ? Option.toArray(Option.fromUndefinedOr(itemTypeOf(scope, item, numbered)))
            : []),
        ],
      });
    });
  };

  return (path) =>
    Option.match(Option.fromUndefinedOr(tests.get(path)), {
      onNone: (): PlacementScope["read"] => () => Option.none(),
      onSome:
        (tables): PlacementScope["read"] =>
        (reference) => {
          const [only, ...others] = readingTypesOf(tables, reference);

          return only === undefined || only === "untyped" || others.length > 0
            ? Option.none()
            : Option.some(only);
        },
    });
};
