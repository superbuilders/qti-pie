/**
 * The readings of a test's variable references (information model §7.47 and §2.8.5; spec readings
 * 4, 5, 48, 86, 88, 106, 107, 110 and 112): what each name a test's processing makes names, read
 * over the assembled test.
 *
 * A reference written in a document a test places (the test itself, a section document a section
 * ref places, a rule fragment an include splices) resolves once for each test that places it
 * (reading 5). It names, by reading 48, exactly one of:
 *
 * - **unsplit**, a variable of the test: one the test declares, or one of its built-ins (`duration`
 *   and `QTI_CONTEXT`, reading 29);
 * - **split**, `SCOPE.VAR`: an item ref of the test and a variable of its item, one the item
 *   declares, one of an item's built-ins (reading 106) or a name a variable mapping of the item ref
 *   gives one of the item's outcomes (reading 107), any name through an item ref that names no item
 *   document, an LTI link or an href outside the package, read unchecked (reading 110); or a test
 *   part, a section or a section ref and its built-in `duration` (§2.8.5: "The values of these
 *   durations can be refered to during outcome-processing by using the variable name duration
 *   prefixed with the identifier of the part or section followed by the period character");
 * - **numbered**, `SCOPE.N.VAR`: an item ref a selection with replacement can repeat, an instance
 *   number at least 1 and a variable of its item (reading 88), as the importer states it
 *   (`NumberedReading`).
 *
 * Each placement of a name's scope is a reading of its own, so a name a section document placed
 * twice supplies is read twice, and refused as ambiguous (reading 86). A setter's `identifier`
 * names a variable of its own document alone, so its split and numbered readings count for
 * nothing (reading 112). A braced reference that names no variable is a string value (reading
 * R15-k), and needs no reading.
 *
 * The laws: **"Prefixed reference"** (reading 48), at most one reading of each placed reference;
 * **"Variable declared"** (P8) over a test's assembly, at least one; **"Variable kind"** over an
 * item variable a prefixed reading names (reading 166); **"Weighted variable"**, a weight only on
 * a reading through an item ref (§7.47.2: "Weights are defined only in the test context ... and
 * only when the item identifier prefixing technique (see above) is being used to look up the value
 * of an item variable"); and the proofs of every stated numbered and link reading.
 *
 * A placed reference's one reading through a scope types it under the test (spec reading 167): it
 * is `read` (`PlacedVariableRef` of `#pantry/qti/expressions.ts`), typed as the variable its
 * reading names, an item's declaration of it or a variable mapping's source declaration
 * (`readDeclarations`, which `PlacedVariableDeclaration` of
 * `#pantry/qti/overlay-queries/reference.ts` types it by), an item's built-in ({@link ItemRead}) or
 * a scope's `duration` ({@link ScopeDurationRead}), each under each placement of its document, so a
 * document two tests place is typed in each.
 */
import {
  check,
  contained,
  derived,
  key,
  Logic,
  mirrors,
  on,
  query,
  select,
  Text,
  Type,
  v,
} from "@bjornpagen/grizzle";
import { BuiltInVariable } from "#pantry/grammar/install.ts";
import { Attribute } from "#pantry/qti/attributes.ts";
import { ReferenceDeclaration } from "#pantry/qti/expression-types.ts";
import { builtIns, PlacedVariableRef, VariableRef } from "#pantry/qti/expressions.ts";
import { NamedDeclaration, QtiViews } from "#pantry/qti/names.ts";
import { Node } from "#pantry/qti/node.ts";
import { placedDocuments } from "#pantry/qti/overlay-queries/expression.ts";
import {
  assembledReplaceableRows,
  structureNodeRows,
  testInstances,
  variableMappingRows,
} from "#pantry/qti/overlay-queries/tests.ts";
import { ItemRefDocument, LinkReading, NumberedReading } from "#pantry/qti/tests.ts";
import { setterKinds } from "#pantry/vocab/terms/expression-types.ts";
import {
  itemKind,
  itemRefKind,
  partKind,
  sectionKind,
  sectionRefKind,
  testKind,
} from "#pantry/vocab/terms/tests.ts";
import { declared } from "#pantry/qti/law-entries.ts";
import { keyedIdentifier, QtiIdentifier } from "#pantry/qti/limits.ts";

/**
 * The built-in variables of a root's processing, by name (`BuiltInVariable`, reading 29).
 *
 * @param root - The root kind.
 * @returns The names.
 */
const builtInsOf = (root: string): readonly string[] =>
  BuiltInVariable.rows.filter((row) => row.root === root).map(({ variable }) => variable);

/**
 * A test's built-in variables: `duration` and `QTI_CONTEXT`.
 */
const testBuiltIns = builtInsOf(testKind);

/**
 * An item's built-in variables, which a prefixed reading reaches through its item ref (reading
 * 106): `numAttempts`, `duration`, `completionStatus` and `QTI_CONTEXT`.
 */
const itemBuiltIns = builtInsOf(itemKind);

/**
 * The item built-ins {@link TestReading} spells one rule each for, since a query's head names each
 * by a constant: exactly {@link itemBuiltIns}, which loading this module checks, so a built-in the
 * grammar gains or drops fails here, naming the rules to add or drop.
 */
const spelledItemBuiltIns = ["numAttempts", "duration", "completionStatus", "QTI_CONTEXT"] as const;

if (
  spelledItemBuiltIns.length !== itemBuiltIns.length ||
  spelledItemBuiltIns.some((name) => !itemBuiltIns.includes(name))
) {
  throw new Error(
    `TestReading spells a rule for each of the item built-ins ${spelledItemBuiltIns.join(", ")}, and the grammar's BuiltInVariable lists ${itemBuiltIns.join(", ")} under an item. Give TestReading one rule per item built-in.`,
  );
}

/**
 * The scopes whose `duration` a prefixed reading names (§2.8.5): a test part, a section, and a
 * section ref, the facade of its placement (§7.5, reading 86).
 */
const durationScopes = [partKind, sectionKind, sectionRefKind] as const;

/**
 * The table readers whose `identifier` claims a table of the variable it names: a map response its
 * `qti-mapping` and a map response point its `qti-area-mapping` (§7.22, §6.9.46).
 */
const mappedReaders = ["qti-map-response", "qti-map-response-point"] as const;

/**
 * The tables {@link mappedReaders} claim.
 */
const mappedTables = ["qti-mapping", "qti-area-mapping"] as const;

/**
 * Each variable reference written in a document a test places, by the test and the reference, with
 * its name, its element's kind and whether it is braced: what reads each name across the test.
 */
const placedReferences = query(QtiViews).rule((r) => {
  const { assembly, package: pkg, path } = v(testInstances, "instance");
  const { attribute, before, identifier, start } = v(VariableRef, "reference");
  const { kind } = v(Node, "element");

  return r
    .match(testInstances, { assembly, package: pkg, path })
    .match(VariableRef, { attribute, before, identifier, package: pkg, path, start })
    .match(Node, { kind, package: pkg, path, start })
    .find({ assembly, attribute, before, identifier, kind, package: pkg, path, start });
});

/**
 * The placed references that need a reading, by the test and the reference: every one but a braced
 * one, which names no variable where none of its name resolves and is then a string value (reading
 * R15-k).
 */
const PlacedTestReference = derived(
  "PlacedTestReference",
  query(QtiViews).rule((r) => {
    const {
      assembly,
      attribute,
      before,
      package: pkg,
      path,
      start,
    } = v(placedReferences, "reference");

    return r
      .match(placedReferences, { assembly, attribute, before, package: pkg, path, start })
      .where(r.ne(before, "{"))
      .find({ assembly, attribute, package: pkg, path, start });
  }),
);

/**
 * The placed references that read prefixes, every one but a setter's `identifier` (reading 112).
 */
const prefixingReferences = query(QtiViews)
  .rule((r) => {
    const {
      assembly,
      attribute,
      identifier,
      kind,
      package: pkg,
      path,
      start,
    } = v(placedReferences, "reference");

    return r
      .match(placedReferences, { assembly, attribute, identifier, kind, package: pkg, path, start })
      .where(Logic.not(r.in(kind, setterKinds)))
      .find({ assembly, attribute, identifier, kind, package: pkg, path, start });
  })
  .rule((r) => {
    const {
      assembly,
      attribute,
      identifier,
      kind,
      package: pkg,
      path,
      start,
    } = v(placedReferences, "reference");

    return r
      .match(placedReferences, { assembly, attribute, identifier, kind, package: pkg, path, start })
      .where(r.ne(attribute, "identifier"))
      .find({ assembly, attribute, identifier, kind, package: pkg, path, start });
  });

/**
 * Each scope a placed reference may be read through, by the test and the scope's placement: an
 * item ref, a test part, a section or a section ref of a document the test places, with its
 * identifier and kind.
 */
const assembledScopes = query(QtiViews).rule((r) => {
  const { assembly, instance, package: pkg, path } = v(testInstances, "instance");
  const { identifier, kind, start } = v(structureNodeRows, "scope");

  return r
    .match(testInstances, { assembly, instance, package: pkg, path })
    .match(structureNodeRows, { identifier, kind, package: pkg, path, start })
    .find({ assembly, identifier, instance, kind, package: pkg, path, start });
});

/**
 * Each item ref of a test's assembly beside the item document it names, by the test and the item
 * ref's placement.
 */
const assembledItems = query(QtiViews).rule((r) => {
  const { assembly, identifier, instance, package: pkg, path, start } = v(assembledScopes, "ref");
  const { target: item } = v(ItemRefDocument, "item");

  return r
    .match(assembledScopes, {
      assembly,
      identifier,
      instance,
      kind: itemRefKind,
      package: pkg,
      path,
      start,
    })
    .match(ItemRefDocument, { package: pkg, path, start, target: item })
    .find({ assembly, identifier, instance, item, package: pkg, path, start });
});

/**
 * The variables each item ref of a test's assembly names through its item, by the test, the item
 * ref's placement and the variable's name, with the declaration a declared or mapped one reads:
 * each the item declares (§7.47), and each a variable mapping of the item ref gives one of the
 * item's outcomes (§7.48, reading 107).
 */
const itemVariables = query(QtiViews)
  .rule((r) => {
    const {
      assembly,
      identifier: scopeName,
      instance,
      item,
      package: pkg,
      path,
      start,
    } = v(assembledItems, "ref");
    const {
      declarationKind,
      identifier: variable,
      start: declaration,
    } = v(NamedDeclaration, "declaration");

    return r
      .match(assembledItems, {
        assembly,
        identifier: scopeName,
        instance,
        item,
        package: pkg,
        path,
        start,
      })
      .match(NamedDeclaration, {
        declarationKind,
        identifier: variable,
        package: pkg,
        path: item,
        start: declaration,
      })
      .find({
        assembly,
        declaration,
        declarationKind,
        instance,
        item,
        package: pkg,
        path,
        scopeName,
        start,
        variable,
      });
  })
  .rule((r) => {
    const {
      assembly,
      identifier: scopeName,
      instance,
      item,
      package: pkg,
      path,
      start,
    } = v(assembledItems, "ref");
    const { source, target: variable } = v(variableMappingRows, "mapping");
    const { declarationKind, start: declaration } = v(NamedDeclaration, "declaration");

    return r
      .match(assembledItems, {
        assembly,
        identifier: scopeName,
        instance,
        item,
        package: pkg,
        path,
        start,
      })
      .match(variableMappingRows, { package: pkg, path, ref: start, source, target: variable })
      .match(NamedDeclaration, {
        declarationKind,
        identifier: source,
        package: pkg,
        path: item,
        start: declaration,
      })
      .find({
        assembly,
        declaration,
        declarationKind,
        instance,
        item,
        package: pkg,
        path,
        scopeName,
        start,
        variable: keyedIdentifier(variable),
      });
  });

/**
 * The item refs of a test's assembly that name no item document, an LTI link or an href outside
 * the package, by the test and the item ref's placement: a prefixed reading through one names a
 * variable the package declares nowhere, and is read unchecked (spec reading 110).
 */
const linkScopes = query(QtiViews).rule((r) => {
  const { assembly, identifier, instance, package: pkg, path, start } = v(assembledScopes, "ref");

  return r
    .match(assembledScopes, {
      assembly,
      identifier,
      instance,
      kind: itemRefKind,
      package: pkg,
      path,
      start,
    })
    .where(r.not(ItemRefDocument, { package: pkg, path, start }))
    .find({ assembly, identifier, instance, package: pkg, path, start });
});

/**
 * Every reading of every placed reference that resolves, by the test, the reference, and the
 * reading's scope (its placement and element, the test document's node 0 for an unsplit reading)
 * and its variable's name: what "Prefixed reference" keys and "Variable declared" holds every
 * placed reference to (readings 48, 86, 88, 106, 107, 110 and 112).
 */
const testReadingRows = query(QtiViews)
  .rule((r) => {
    /**
     * Unsplit, declared by the test.
     */
    const {
      assembly,
      attribute,
      identifier,
      package: pkg,
      path,
      start,
    } = v(placedReferences, "reference");

    return r
      .match(placedReferences, { assembly, attribute, identifier, package: pkg, path, start })
      .match(NamedDeclaration, { identifier, package: pkg, path: assembly })
      .find({
        assembly,
        attribute,
        package: pkg,
        path,
        scope: 0n,
        scopeInstance: 0n,
        scopePath: assembly,
        start,
        variable: identifier,
      });
  })
  .rule((r) => {
    /**
     * Unsplit, a built-in of the test.
     */
    const {
      assembly,
      attribute,
      identifier,
      package: pkg,
      path,
      start,
    } = v(placedReferences, "reference");

    return r
      .match(placedReferences, { assembly, attribute, identifier, package: pkg, path, start })
      .where(r.in(identifier, testBuiltIns))
      .find({
        assembly,
        attribute,
        package: pkg,
        path,
        scope: 0n,
        scopeInstance: 0n,
        scopePath: assembly,
        start,
        variable: identifier,
      });
  })
  .rule((r) => {
    /**
     * Split, a variable an item ref's item declares or a mapping names.
     */
    const {
      assembly,
      attribute,
      identifier,
      package: pkg,
      path,
      start,
    } = v(prefixingReferences, "reference");
    const {
      instance: scopeInstance,
      path: scopePath,
      scopeName,
      start: scope,
      variable,
    } = v(itemVariables, "variable");

    return r
      .match(prefixingReferences, { assembly, attribute, identifier, package: pkg, path, start })
      .match(itemVariables, {
        assembly,
        instance: scopeInstance,
        package: pkg,
        path: scopePath,
        scopeName,
        start: scope,
        variable,
      })
      .where(r.eq(identifier, Text.concat(Text.concat(scopeName, "."), variable)))
      .find({
        assembly,
        attribute,
        package: pkg,
        path,
        scope,
        scopeInstance,
        scopePath,
        start,
        variable,
      });
  })
  .rule((r) => {
    /**
     * Split, the item built-in numAttempts through its item ref.
     */
    const {
      assembly,
      attribute,
      identifier,
      package: pkg,
      path,
      start,
    } = v(prefixingReferences, "reference");
    const {
      identifier: scopeName,
      instance: scopeInstance,
      path: scopePath,
      start: scope,
    } = v(assembledItems, "ref");

    return r
      .match(prefixingReferences, { assembly, attribute, identifier, package: pkg, path, start })
      .match(assembledItems, {
        assembly,
        identifier: scopeName,
        instance: scopeInstance,
        package: pkg,
        path: scopePath,
        start: scope,
      })
      .where(r.eq(identifier, Text.concat(scopeName, ".numAttempts")))
      .find({
        assembly,
        attribute,
        package: pkg,
        path,
        scope,
        scopeInstance,
        scopePath,
        start,
        variable: Type.literal(QtiIdentifier, "numAttempts"),
      });
  })
  .rule((r) => {
    /**
     * Split, the item built-in duration through its item ref.
     */
    const {
      assembly,
      attribute,
      identifier,
      package: pkg,
      path,
      start,
    } = v(prefixingReferences, "reference");
    const {
      identifier: scopeName,
      instance: scopeInstance,
      path: scopePath,
      start: scope,
    } = v(assembledItems, "ref");

    return r
      .match(prefixingReferences, { assembly, attribute, identifier, package: pkg, path, start })
      .match(assembledItems, {
        assembly,
        identifier: scopeName,
        instance: scopeInstance,
        package: pkg,
        path: scopePath,
        start: scope,
      })
      .where(r.eq(identifier, Text.concat(scopeName, ".duration")))
      .find({
        assembly,
        attribute,
        package: pkg,
        path,
        scope,
        scopeInstance,
        scopePath,
        start,
        variable: Type.literal(QtiIdentifier, "duration"),
      });
  })
  .rule((r) => {
    /**
     * Split, the item built-in completionStatus through its item ref.
     */
    const {
      assembly,
      attribute,
      identifier,
      package: pkg,
      path,
      start,
    } = v(prefixingReferences, "reference");
    const {
      identifier: scopeName,
      instance: scopeInstance,
      path: scopePath,
      start: scope,
    } = v(assembledItems, "ref");

    return r
      .match(prefixingReferences, { assembly, attribute, identifier, package: pkg, path, start })
      .match(assembledItems, {
        assembly,
        identifier: scopeName,
        instance: scopeInstance,
        package: pkg,
        path: scopePath,
        start: scope,
      })
      .where(r.eq(identifier, Text.concat(scopeName, ".completionStatus")))
      .find({
        assembly,
        attribute,
        package: pkg,
        path,
        scope,
        scopeInstance,
        scopePath,
        start,
        variable: Type.literal(QtiIdentifier, "completionStatus"),
      });
  })
  .rule((r) => {
    /**
     * Split, the item built-in QTI_CONTEXT through its item ref.
     */
    const {
      assembly,
      attribute,
      identifier,
      package: pkg,
      path,
      start,
    } = v(prefixingReferences, "reference");
    const {
      identifier: scopeName,
      instance: scopeInstance,
      path: scopePath,
      start: scope,
    } = v(assembledItems, "ref");

    return r
      .match(prefixingReferences, { assembly, attribute, identifier, package: pkg, path, start })
      .match(assembledItems, {
        assembly,
        identifier: scopeName,
        instance: scopeInstance,
        package: pkg,
        path: scopePath,
        start: scope,
      })
      .where(r.eq(identifier, Text.concat(scopeName, ".QTI_CONTEXT")))
      .find({
        assembly,
        attribute,
        package: pkg,
        path,
        scope,
        scopeInstance,
        scopePath,
        start,
        variable: Type.literal(QtiIdentifier, "QTI_CONTEXT"),
      });
  })
  .rule((r) => {
    /**
     * Split, through an item ref that names no item document, as the importer states it.
     */
    const {
      assembly,
      attribute,
      package: pkg,
      path,
      scope,
      scopeInstance,
      scopePath,
      start,
      variable,
    } = v(LinkReading, "link");

    return r
      .match(LinkReading, {
        assembly,
        attribute,
        package: pkg,
        path,
        scope,
        scopeInstance,
        scopePath,
        start,
        variable,
      })
      .find({
        assembly,
        attribute,
        package: pkg,
        path,
        scope,
        scopeInstance,
        scopePath,
        start,
        variable,
      });
  })
  .rule((r) => {
    /**
     * Split, a part's, a section's or a section ref's duration.
     */
    const {
      assembly,
      attribute,
      identifier,
      package: pkg,
      path,
      start,
    } = v(prefixingReferences, "reference");
    const {
      identifier: scopeName,
      instance: scopeInstance,
      kind,
      path: scopePath,
      start: scope,
    } = v(assembledScopes, "scope");

    return r
      .match(prefixingReferences, { assembly, attribute, identifier, package: pkg, path, start })
      .match(assembledScopes, {
        assembly,
        identifier: scopeName,
        instance: scopeInstance,
        kind,
        package: pkg,
        path: scopePath,
        start: scope,
      })
      .where(r.in(kind, durationScopes), r.eq(identifier, Text.concat(scopeName, ".duration")))
      .find({
        assembly,
        attribute,
        package: pkg,
        path,
        scope,
        scopeInstance,
        scopePath,
        start,
        variable: Type.literal(QtiIdentifier, "duration"),
      });
  })
  .rule((r) => {
    /**
     * Numbered, as the importer states it and the laws below prove it.
     */
    const {
      assembly,
      attribute,
      package: pkg,
      path,
      scope,
      scopeInstance,
      scopePath,
      start,
      variable,
    } = v(NumberedReading, "numbered");

    return r
      .match(NumberedReading, {
        assembly,
        attribute,
        package: pkg,
        path,
        scope,
        scopeInstance,
        scopePath,
        start,
        variable,
      })
      .find({
        assembly,
        attribute,
        package: pkg,
        path,
        scope,
        scopeInstance,
        scopePath,
        start,
        variable,
      });
  });

/**
 * {@link testReadingRows} as a relation of `Qti`, which "Prefixed reference" keys and "Variable
 * declared" holds every placed reference to: each reading's scope by its placement and element
 * alone, since its placement, `scopeInstance`, names the document `scopePath` is, and its variable
 * a `QtiIdentifier`, as every variable a reading names is: an item's or a test's declared
 * identifier, a built-in, a variable mapping's target ({@link itemVariables}) or a numbered or
 * linked reading's own, each held within `identifierBytes` where a document writes it ("Key text
 * bound").
 */
const TestReading = derived(
  "TestReading",
  query(QtiViews).rule((r) => {
    const {
      assembly,
      attribute,
      package: pkg,
      path,
      scope,
      scopeInstance,
      start,
      variable,
    } = v(testReadingRows, "reading");

    return r
      .match(testReadingRows, {
        assembly,
        attribute,
        package: pkg,
        path,
        scope,
        scopeInstance,
        start,
        variable,
      })
      .find({
        assembly,
        attribute,
        package: pkg,
        path,
        scope,
        scopeInstance,
        start,
        variable,
      });
  }),
);

/**
 * Each weighted `qti-variable` placed in a test's assembly, by the test and the variable's place:
 * one that writes a `weight-identifier`.
 */
const PlacedWeightedVariable = derived(
  "PlacedWeightedVariable",
  query(QtiViews).rule((r) => {
    const { assembly, package: pkg, path } = v(testInstances, "instance");
    const { start } = v(Attribute, "weight");

    return r
      .match(testInstances, { assembly, package: pkg, path })
      .match(Attribute, {
        kind: "qti-variable",
        name: "weight-identifier",
        package: pkg,
        path,
        start,
      })
      .find({ assembly, package: pkg, path, start });
  }),
);

/**
 * The placed references whose reading resolves through an item ref, by the test and the
 * reference's element: a split or numbered reading whose scope is an item ref.
 */
const ItemScopedReading = derived(
  "ItemScopedReading",
  query(QtiViews).rule((r) => {
    const {
      assembly,
      attribute,
      package: pkg,
      path,
      scope,
      scopePath,
      start,
    } = v(testReadingRows, "reading");

    return r
      .match(testReadingRows, { assembly, attribute, package: pkg, path, scope, scopePath, start })
      .match(Node, { kind: itemRefKind, package: pkg, path: scopePath, start: scope })
      .where(r.eq(attribute, "identifier"))
      .find({ assembly, package: pkg, path, start });
  }),
);

/**
 * Each stated numbered reading beside its reference's name and its scope's, by the reading: what
 * proves its spelling.
 */
const NumberedSpelling = derived(
  "NumberedSpelling",
  query(QtiViews).rule((r) => {
    const {
      assembly,
      attribute,
      number,
      package: pkg,
      path,
      scope,
      scopeInstance,
      scopePath,
      start,
      variable,
    } = v(NumberedReading, "numbered");
    const { identifier } = v(VariableRef, "reference");
    const { identifier: scopeName } = v(structureNodeRows, "scope");

    return r
      .match(NumberedReading, {
        assembly,
        attribute,
        number,
        package: pkg,
        path,
        scope,
        scopeInstance,
        scopePath,
        start,
        variable,
      })
      .match(VariableRef, { attribute, identifier, package: pkg, path, start })
      .match(structureNodeRows, {
        identifier: scopeName,
        package: pkg,
        path: scopePath,
        start: scope,
      })
      .find({
        assembly,
        attribute,
        identifier,
        number,
        package: pkg,
        path,
        scope,
        scopeInstance,
        scopeName,
        scopePath,
        start,
        variable,
      });
  }),
);

/**
 * Each stated link reading beside its reference's name and its scope's, by the reading: what
 * proves its spelling.
 */
const LinkSpelling = derived(
  "LinkSpelling",
  query(QtiViews).rule((r) => {
    const {
      assembly,
      attribute,
      package: pkg,
      path,
      scope,
      scopeInstance,
      scopePath,
      start,
      variable,
    } = v(LinkReading, "link");
    const { identifier } = v(VariableRef, "reference");
    const { identifier: scopeName } = v(structureNodeRows, "scope");

    return r
      .match(LinkReading, {
        assembly,
        attribute,
        package: pkg,
        path,
        scope,
        scopeInstance,
        scopePath,
        start,
        variable,
      })
      .match(VariableRef, { attribute, identifier, package: pkg, path, start })
      .match(structureNodeRows, {
        identifier: scopeName,
        package: pkg,
        path: scopePath,
        start: scope,
      })
      .find({
        assembly,
        attribute,
        identifier,
        package: pkg,
        path,
        scope,
        scopeInstance,
        scopeName,
        scopePath,
        start,
        variable,
      });
  }),
);

/**
 * {@link linkScopes} as a relation of `Qti`, which a link reading's scope is held to.
 */
const LinkScope = derived("LinkScope", linkScopes);

/**
 * The variables a stated numbered reading may name through its item ref: each its item declares
 * or a mapping names ({@link itemVariables}), each of an item's built-ins, and any through an item
 * ref that names no item document (reading 110).
 */
const NumberedTarget = derived(
  "NumberedTarget",
  query(QtiViews)
    .rule((r) => {
      const {
        assembly,
        package: pkg,
        scope,
        scopeInstance,
        scopePath,
        variable,
      } = v(NumberedReading, "numbered");

      return r
        .match(NumberedReading, {
          assembly,
          package: pkg,
          scope,
          scopeInstance,
          scopePath,
          variable,
        })
        .match(itemVariables, {
          assembly,
          instance: scopeInstance,
          package: pkg,
          path: scopePath,
          start: scope,
          variable,
        })
        .find({ assembly, package: pkg, scope, scopeInstance, scopePath, variable });
    })
    .rule((r) => {
      const {
        assembly,
        package: pkg,
        scope,
        scopeInstance,
        scopePath,
        variable,
      } = v(NumberedReading, "numbered");

      return r
        .match(NumberedReading, {
          assembly,
          package: pkg,
          scope,
          scopeInstance,
          scopePath,
          variable,
        })
        .match(assembledItems, {
          assembly,
          instance: scopeInstance,
          package: pkg,
          path: scopePath,
          start: scope,
        })
        .where(r.in(variable, itemBuiltIns))
        .find({ assembly, package: pkg, scope, scopeInstance, scopePath, variable });
    })
    .rule((r) => {
      const {
        assembly,
        package: pkg,
        scope,
        scopeInstance,
        scopePath,
        variable,
      } = v(NumberedReading, "numbered");

      return r
        .match(NumberedReading, {
          assembly,
          package: pkg,
          scope,
          scopeInstance,
          scopePath,
          variable,
        })
        .match(linkScopes, {
          assembly,
          instance: scopeInstance,
          package: pkg,
          path: scopePath,
          start: scope,
        })
        .find({ assembly, package: pkg, scope, scopeInstance, scopePath, variable });
    }),
);

/**
 * The prefixed readings of a reference by `identifier` that name an item variable a declaration
 * declares, by the test and the reference, with the reference's element kind and the
 * declaration's kind: what "Variable kind" holds to the declaration kinds the element may name
 * (reading 166: it "binds a prefixed name as it binds an unprefixed one").
 */
const PrefixedDeclaration = derived(
  "PrefixedDeclaration",
  query(QtiViews).rule((r) => {
    const {
      assembly,
      attribute,
      identifier,
      kind,
      package: pkg,
      path,
      start,
    } = v(prefixingReferences, "reference");
    const {
      declarationKind,
      instance: scopeInstance,
      path: scopePath,
      scopeName,
      start: scope,
      variable,
    } = v(itemVariables, "variable");

    return r
      .match(prefixingReferences, {
        assembly,
        attribute,
        identifier,
        kind,
        package: pkg,
        path,
        start,
      })
      .match(itemVariables, {
        assembly,
        declarationKind,
        instance: scopeInstance,
        package: pkg,
        path: scopePath,
        scopeName,
        start: scope,
        variable,
      })
      .where(
        r.eq(attribute, "identifier"),
        r.eq(identifier, Text.concat(Text.concat(scopeName, "."), variable)),
      )
      .find({ assembly, attribute, declarationKind, kind, package: pkg, path, start });
  }),
);

/**
 * The type a built-in variable of a root stands as ({@link builtIns}).
 *
 * @param root - The root's kind.
 * @param variable - The built-in's name.
 * @returns Its base type and cardinality.
 * @throws {Error} When the root holds no built-in of the name, which the grammar's `BuiltInVariable`
 *   gives every name this module reads: a defect of the module.
 */
const builtInTypeOf = (root: string, variable: string) => {
  const found = builtIns.find((row) => row.root === root && row.variable === variable);
  if (found === undefined) {
    throw new Error(
      `The grammar's BuiltInVariable lists no ${variable} under ${root}, which the readings type. Read a built-in BuiltInVariable lists.`,
    );
  }

  return found;
};

/**
 * Each read placed reference of a test's assembly beside each of its readings (`TestReading`), by
 * the placed reference, with its type and the reading's scope and variable: what its proofs read.
 */
const readRows = query(QtiViews).rule((r) => {
  const {
    assembly,
    attribute,
    baseType,
    cardinality,
    instance,
    package: pkg,
    path,
    start,
  } = v(PlacedVariableRef, "placed");
  const { scope, scopePath, variable } = v(testReadingRows, "reading");

  return r
    .match(PlacedVariableRef, {
      assembly,
      attribute,
      baseType,
      cardinality,
      instance,
      package: pkg,
      path,
      resolution: "read",
      start,
    })
    .match(testReadingRows, {
      assembly,
      attribute,
      package: pkg,
      path,
      scope,
      scopePath,
      start,
      variable,
    })
    .find({
      assembly,
      attribute,
      baseType,
      cardinality,
      instance,
      package: pkg,
      path,
      scope,
      scopePath,
      start,
      variable,
    });
});

/**
 * Each read placed reference beside its readings through an item ref that names an item document
 * whose variable is a declaration of the item: its own of the name, or else the source declaration
 * a variable mapping of the ref gives the name (§7.48), by the item's path `declPath` and the
 * declaration's place `declStart`, with the reference's type. Exported for the typing of a placed
 * reference as its declaration (`PlacedVariableDeclaration`,
 * `#pantry/qti/overlay-queries/reference.ts`).
 */
export const readDeclarations = query(QtiViews)
  .rule((r) => {
    const {
      assembly,
      attribute,
      baseType,
      cardinality,
      instance,
      package: pkg,
      path,
      scope,
      scopePath,
      start,
      variable,
    } = v(readRows, "read");
    const { target: item } = v(ItemRefDocument, "ref");
    const { start: declaration } = v(NamedDeclaration, "declared");

    return r
      .match(readRows, {
        assembly,
        attribute,
        baseType,
        cardinality,
        instance,
        package: pkg,
        path,
        scope,
        scopePath,
        start,
        variable,
      })
      .match(ItemRefDocument, { package: pkg, path: scopePath, start: scope, target: item })
      .match(NamedDeclaration, {
        identifier: variable,
        package: pkg,
        path: item,
        start: declaration,
      })
      .find({
        assembly,
        attribute,
        baseType,
        cardinality,
        declPath: item,
        declStart: declaration,
        instance,
        package: pkg,
        path,
        start,
      });
  })
  .rule((r) => {
    const {
      assembly,
      attribute,
      baseType,
      cardinality,
      instance,
      package: pkg,
      path,
      scope,
      scopePath,
      start,
      variable,
    } = v(readRows, "read");
    const { target: item } = v(ItemRefDocument, "ref");
    const { source } = v(variableMappingRows, "mapping");
    const { start: declaration } = v(NamedDeclaration, "declared");

    return r
      .match(readRows, {
        assembly,
        attribute,
        baseType,
        cardinality,
        instance,
        package: pkg,
        path,
        scope,
        scopePath,
        start,
        variable,
      })
      .match(ItemRefDocument, { package: pkg, path: scopePath, start: scope, target: item })
      .match(variableMappingRows, {
        package: pkg,
        path: scopePath,
        ref: scope,
        source,
        target: variable,
      })
      .match(NamedDeclaration, { identifier: source, package: pkg, path: item, start: declaration })
      .where(r.not(NamedDeclaration, { identifier: variable, package: pkg, path: item }))
      .find({
        assembly,
        attribute,
        baseType,
        cardinality,
        declPath: item,
        declStart: declaration,
        instance,
        package: pkg,
        path,
        start,
      });
  });

/**
 * Each read placed reference beside its readings through an item ref that names an item document
 * of a variable no mapping of the ref names, an item's built-in (reading 106), with the variable's
 * name and the reference's type: "E1 derived" types each as the built-in stands.
 */
const ItemRead = derived(
  "ItemRead",
  query(QtiViews).rule((r) => {
    const {
      assembly,
      attribute,
      baseType,
      cardinality,
      instance,
      package: pkg,
      path,
      scope,
      scopePath,
      start,
      variable,
    } = v(readRows, "read");

    return r
      .match(readRows, {
        assembly,
        attribute,
        baseType,
        cardinality,
        instance,
        package: pkg,
        path,
        scope,
        scopePath,
        start,
        variable,
      })
      .match(ItemRefDocument, { package: pkg, path: scopePath, start: scope })
      .where(
        r.in(variable, itemBuiltIns),
        r.not(variableMappingRows, { package: pkg, path: scopePath, ref: scope, target: variable }),
      )
      .find({
        assembly,
        attribute,
        baseType,
        cardinality,
        instance,
        package: pkg,
        path,
        start,
        variable,
      });
  }),
);

/**
 * Each read placed reference beside its readings as a test part's, a section's or a section ref's
 * `duration` (§2.8.5), with the reference's type: "E1 derived" types each as the test's built-in
 * `duration` stands.
 */
const ScopeDurationRead = derived(
  "ScopeDurationRead",
  query(QtiViews).rule((r) => {
    const {
      assembly,
      attribute,
      baseType,
      cardinality,
      instance,
      package: pkg,
      path,
      scope,
      scopePath,
      start,
    } = v(readRows, "read");
    const { kind } = v(Node, "scope");

    return r
      .match(readRows, {
        assembly,
        attribute,
        baseType,
        cardinality,
        instance,
        package: pkg,
        path,
        scope,
        scopePath,
        start,
      })
      .match(Node, { kind, package: pkg, path: scopePath, start: scope })
      .where(r.in(kind, durationScopes))
      .find({ assembly, attribute, baseType, cardinality, instance, package: pkg, path, start });
  }),
);

/**
 * The readings that type a placed reference, by the test and the reference: each reading
 * (`TestReading`) through an item ref that names an item document, or through a test part, a
 * section or a section ref, whose variable has a type (`readDeclarations`, {@link ItemRead},
 * {@link ScopeDurationRead}).
 */
const typedReadingRows = query(QtiViews)
  .rule((r) => {
    const {
      assembly,
      attribute,
      package: pkg,
      path,
      scope,
      scopePath,
      start,
    } = v(testReadingRows, "reading");

    return r
      .match(testReadingRows, { assembly, attribute, package: pkg, path, scope, scopePath, start })
      .match(ItemRefDocument, { package: pkg, path: scopePath, start: scope })
      .find({ assembly, attribute, package: pkg, path, start });
  })
  .rule((r) => {
    const {
      assembly,
      attribute,
      package: pkg,
      path,
      scope,
      scopePath,
      start,
    } = v(testReadingRows, "reading");
    const { kind } = v(Node, "scope");

    return r
      .match(testReadingRows, { assembly, attribute, package: pkg, path, scope, scopePath, start })
      .match(Node, { kind, package: pkg, path: scopePath, start: scope })
      .where(r.in(kind, durationScopes))
      .find({ assembly, attribute, package: pkg, path, start });
  });

/**
 * The placed references read twice, by the test and the reference: two readings that differ in
 * their scope's placement or element or in their variable's name, which "Prefixed reference"
 * refuses (reading 86).
 */
const rivalReadings = query(QtiViews).rule((r) => {
  const {
    assembly,
    attribute,
    package: pkg,
    path,
    scope,
    scopeInstance,
    scopePath,
    start,
    variable,
  } = v(testReadingRows, "reading");
  const {
    scope: otherScope,
    scopeInstance: otherInstance,
    scopePath: otherPath,
    variable: otherVariable,
  } = v(testReadingRows, "other");

  return r
    .match(testReadingRows, {
      assembly,
      attribute,
      package: pkg,
      path,
      scope,
      scopeInstance,
      scopePath,
      start,
      variable,
    })
    .match(testReadingRows, {
      assembly,
      attribute,
      package: pkg,
      path,
      scope: otherScope,
      scopeInstance: otherInstance,
      scopePath: otherPath,
      start,
      variable: otherVariable,
    })
    .where(
      r.or(
        r.ne(scope, otherScope),
        r.ne(scopeInstance, otherInstance),
        r.ne(scopePath, otherPath),
        r.ne(variable, otherVariable),
      ),
    )
    .find({ assembly, attribute, package: pkg, path, start });
});

/**
 * Each placed reference of a test's placement whose one reading types it, by the placement and the
 * reference (`placedDocuments` of `#pantry/qti/overlay-queries/expression.ts`): exactly the `read`
 * ones, which "E1 derived" holds to it both ways (spec reading 167). A name the test declares, or
 * one of its built-ins, has an unsplit reading of its own, so a reference that resolves before any
 * scope is never one of these; and a reference read twice is none either, so "Prefixed reference"
 * alone refuses it.
 */
const SoleReading = derived(
  "SoleReading",
  query(QtiViews).rule((r) => {
    const { assembly, instance, package: pkg, path } = v(placedDocuments, "placement");
    const { attribute, start } = v(typedReadingRows, "reading");

    return r
      .match(placedDocuments, { assembly, instance, package: pkg, path })
      .match(typedReadingRows, { assembly, attribute, package: pkg, path, start })
      .where(r.not(rivalReadings, { assembly, attribute, package: pkg, path, start }))
      .find({ assembly, attribute, instance, package: pkg, path, start });
  }),
);

/**
 * The tables an item ref's item variables hold, by the item ref's place and the variable's name in
 * the test's view of it: each `qti-mapping` and `qti-area-mapping` a declaration of the ref's item
 * holds (a child of the declaration's node), under the declaration's own identifier, and under the
 * target of each variable mapping of the ref whose source the declaration declares (§7.48:
 * mappings "allow outcome variables declared with the name source-identifier in the corresponding
 * item to be treated as if they were declared with the name target-identifier").
 */
const ItemRefTable = derived(
  "ItemRefTable",
  query(QtiViews)
    .rule((r) => {
      const { package: pkg, path, start, target: item } = v(ItemRefDocument, "ref");
      const { identifier: variable, start: declaration } = v(NamedDeclaration, "declaration");
      const { kind: table } = v(Node, "table");

      return r
        .match(ItemRefDocument, { package: pkg, path, start, target: item })
        .match(NamedDeclaration, {
          identifier: variable,
          package: pkg,
          path: item,
          start: declaration,
        })
        .match(Node, { kind: table, package: pkg, parent: declaration, path: item })
        .where(r.in(table, mappedTables))
        .find({ package: pkg, path, start, table, variable });
    })
    .rule((r) => {
      const { package: pkg, path, start, target: item } = v(ItemRefDocument, "ref");
      const { source, target: variable } = v(variableMappingRows, "mapping");
      const { start: declaration } = v(NamedDeclaration, "declaration");
      const { kind: table } = v(Node, "table");

      return r
        .match(ItemRefDocument, { package: pkg, path, start, target: item })
        .match(variableMappingRows, { package: pkg, path, ref: start, source, target: variable })
        .match(NamedDeclaration, {
          identifier: source,
          package: pkg,
          path: item,
          start: declaration,
        })
        .match(Node, { kind: table, package: pkg, parent: declaration, path: item })
        .where(r.in(table, mappedTables))
        .find({ package: pkg, path, start, table, variable: keyedIdentifier(variable) });
    }),
);

/**
 * The readings of a test's table readers through an item ref that names an item document, by the
 * reader's element kind: each placed `qti-map-response` or `qti-map-response-point` by
 * `identifier` and each of its readings whose scope is an item ref with an item document, split or
 * numbered, by the scope's place and the variable's name. A reading through a link names a
 * variable no document of the package declares, and is read unchecked (reading 110).
 *
 * @param kind - The reader's kind.
 * @returns The query.
 */
const tableReadingsOf = (kind: (typeof mappedReaders)[number]) =>
  query(QtiViews).rule((r) => {
    const {
      assembly,
      attribute,
      package: pkg,
      path,
      scope,
      scopePath,
      start,
      variable,
    } = v(testReadingRows, "reading");

    return r
      .match(testReadingRows, {
        assembly,
        attribute,
        package: pkg,
        path,
        scope,
        scopePath,
        start,
        variable,
      })
      .match(placedReferences, { assembly, attribute, kind, package: pkg, path, start })
      .match(ItemRefDocument, { package: pkg, path: scopePath, start: scope })
      .where(r.eq(attribute, "identifier"))
      .find({ assembly, package: pkg, path, scope, scopePath, start, variable });
  });

/**
 * The item variables a test's readers of a kind read through an item's ref
 * ({@link tableReadingsOf}), by the ref's place and the variable: what "Mapped response" holds to
 * the ref's tables, the readers' own places standing in the query.
 *
 * @param kind - The reader's kind.
 * @returns The view's definition.
 */
const tableReadersOf = (kind: (typeof mappedReaders)[number]) =>
  query(QtiViews).rule((r) => {
    const readings = tableReadingsOf(kind);
    const { package: pkg, scope, scopePath, variable } = v(readings, "reading");

    return r
      .match(readings, { package: pkg, scope, scopePath, variable })
      .find({ package: pkg, scope, scopePath, variable });
  });

/**
 * The item variables the prefixed map responses read through an item's ref
 * ({@link tableReadersOf}), each of which claims the variable's `qti-mapping` (reading 166).
 */
const PrefixedMapResponse = derived("PrefixedMapResponse", tableReadersOf("qti-map-response"));

/**
 * The item variables the prefixed map response points read through an item's ref
 * ({@link tableReadersOf}), each of which claims the variable's `qti-area-mapping` (reading 166).
 */
const PrefixedMapResponsePoint = derived(
  "PrefixedMapResponsePoint",
  tableReadersOf("qti-map-response-point"),
);

/**
 * The patterns of a numbered reading's instance number: all digits, and at least 1 (reading 88:
 * "its number is all digits and at least 1, the first instance being 1").
 */
const instanceNumber = Text.pattern("^0*[1-9][0-9]*$");

/**
 * {@link assembledReplaceableRows} as a relation of `Qti`, which a numbered reading's scope is held
 * to.
 */
const AssembledReplaceable = derived("AssembledReplaceable", assembledReplaceableRows);

/**
 * The readings' laws, each named by its law:
 *
 * - **"Prefixed reference"** (reading 48): no placed reference has two readings that resolve;
 * - **"Variable declared"** (P8, over a test's assembly): every placed reference that is no braced
 *   string has one;
 * - **"Variable kind"** (reading 166): a prefixed reference by `identifier` names a declaration of a
 *   kind its element may name;
 * - **"Mapped response"** (reading 166, §7.22: a map response "transforms it using the associated
 *   mapping, which must have been declared"): a prefixed map response's reading through an item's
 *   ref names a variable whose declaration holds a `qti-mapping`, and a map response point's one
 *   that holds a `qti-area-mapping`, a built-in variable none;
 * - **"E1 derived"**: a placed reference is read exactly where its one reading types it, and is typed
 *   as an item's built-in or a scope's `duration` it reads; and each stated numbered reading is a
 *   placed reference's, spelled `SCOPE.NUMBER.VARIABLE`, its number at least 1, its item ref one a
 *   replacement can repeat in its placement, and its variable one its item names.
 */
export const readingLawsByName = {
  "E1 derived": declared("E1 derived", [
    // A placed reference is read exactly where its one reading types it, and is typed as its
    // variable (spec reading 167): a declaration's type is stated over `readDeclarations`
    // (overlay-queries/reference.ts), an item built-in's and a scope's duration's here.
    mirrors(
      on(
        select(PlacedVariableRef, (ref) => ref.eq(ref.resolution, "read")),
        "package",
        "assembly",
        "instance",
        "path",
        "start",
        "attribute",
      ),
      on(SoleReading, "package", "assembly", "instance", "path", "start", "attribute"),
    ),
    check("E1_derived", ItemRead, (b) =>
      b.or(
        ...builtIns
          .filter(({ root }) => root === itemKind)
          .map(({ baseType, cardinality, variable }) =>
            b.and(
              b.eq(b.variable, variable),
              b.eq(b.baseType, baseType),
              b.eq(b.cardinality, cardinality),
            ),
          ),
      ),
    ),
    check("E1_derived", ScopeDurationRead, (b) => {
      const { baseType, cardinality } = builtInTypeOf(testKind, "duration");

      return b.and(b.eq(b.baseType, baseType), b.eq(b.cardinality, cardinality));
    }),
    contained(
      on(NumberedReading, "package", "assembly", "path", "start", "attribute"),
      on(PlacedTestReference, "package", "assembly", "path", "start", "attribute"),
    ),
    check("E1_derived", NumberedSpelling, (n) =>
      n.and(
        n.eq(
          n.identifier,
          Text.concat(
            Text.concat(Text.concat(Text.concat(n.scopeName, "."), n.number), "."),
            n.variable,
          ),
        ),
        Text.matches(n.number, instanceNumber),
      ),
    ),
    contained(
      on(NumberedReading, "package", "assembly", "scopeInstance", "scopePath", "scope"),
      on(AssembledReplaceable, "package", "assembly", "instance", "path", "start"),
    ),
    contained(
      on(NumberedReading, "package", "assembly", "scope", "scopeInstance", "scopePath", "variable"),
      on(NumberedTarget, "package", "assembly", "scope", "scopeInstance", "scopePath", "variable"),
    ),
    contained(
      on(LinkReading, "package", "assembly", "path", "start", "attribute"),
      on(PlacedTestReference, "package", "assembly", "path", "start", "attribute"),
    ),
    check("E1_derived", LinkSpelling, (l) =>
      l.eq(l.identifier, Text.concat(Text.concat(l.scopeName, "."), l.variable)),
    ),
    contained(
      on(LinkReading, "package", "assembly", "scopeInstance", "scopePath", "scope"),
      on(LinkScope, "package", "assembly", "instance", "path", "start"),
    ),
  ]),
  "Mapped response": declared("Mapped response", [
    contained(
      on(PrefixedMapResponse, "package", "scopePath", "scope", "variable"),
      on(
        select(ItemRefTable, (t) => t.eq(t.table, "qti-mapping")),
        "package",
        "path",
        "start",
        "variable",
      ),
    ),
    contained(
      on(PrefixedMapResponsePoint, "package", "scopePath", "scope", "variable"),
      on(
        select(ItemRefTable, (t) => t.eq(t.table, "qti-area-mapping")),
        "package",
        "path",
        "start",
        "variable",
      ),
    ),
  ]),
  "Prefixed reference": declared("Prefixed reference", [
    key(on(TestReading, "package", "assembly", "path", "start", "attribute")),
  ]),
  "Variable declared": declared("Variable declared", [
    contained(
      on(PlacedTestReference, "package", "assembly", "path", "start", "attribute"),
      on(TestReading, "package", "assembly", "path", "start", "attribute"),
    ),
  ]),
  "Variable kind": declared("Variable kind", [
    contained(
      on(PrefixedDeclaration, "kind", "attribute", "declarationKind"),
      on(ReferenceDeclaration, "kind", "attribute", "declaration"),
    ),
  ]),
  "Weighted variable": declared("Weighted variable", [
    contained(
      on(PlacedWeightedVariable, "package", "assembly", "path", "start"),
      on(ItemScopedReading, "package", "assembly", "path", "start"),
    ),
  ]),
} as const;

/**
 * The queries of this module, each carrying its own name.
 */
export const readingRelations = [
  AssembledReplaceable,
  ItemRead,
  ItemRefTable,
  ItemScopedReading,
  LinkScope,
  LinkSpelling,
  NumberedSpelling,
  NumberedTarget,
  PlacedTestReference,
  PlacedWeightedVariable,
  PrefixedDeclaration,
  PrefixedMapResponse,
  PrefixedMapResponsePoint,
  ScopeDurationRead,
  SoleReading,
  TestReading,
] as const;

/**
 * The rules of this module, {@link readingLawsByName} flattened.
 */
export const readingLaws = Object.values(readingLawsByName).flat();
