/**
 * The expression overlays' free tests: the typing table covers exactly `OperatorArity`'s kinds,
 * every `BaseTypePattern` row speaks its XSD type's installed language, and `OperatorArity` agrees
 * with each expression kind's content automaton at its bounds.
 *
 * The fixtures' verdicts are `#pantry/import/overlays/expressions.test.ts`'s.
 */
import { regex } from "arkregex";
import { assert, describe, it } from "@effect/vitest";
import { Option } from "effect";
import { stepOf } from "#pantry/grammar/content.ts";
import { expressionTypings } from "#pantry/grammar/expression.ts";
import { openDomain } from "#pantry/grammar/attributes.ts";
import {
  BaseType,
  builtInBaseTypes,
  BuiltInVariable,
  grammar,
  OperatorArity,
  OperatorMax,
  ValueDomainOf,
} from "#pantry/grammar/install.ts";
import {
  BaseTypePattern,
  booleanValuePattern,
  domainValues,
  OperandBase,
  pairValuePattern,
  pointValuePattern,
  ReferenceDeclaration,
  setKindHandles,
  lookupKindHandle,
  unjudgedBaseTypes,
  ValueBaseOf,
  ValueCardinalityOf,
} from "#pantry/qti/expression-types.ts";
import { builtInTypes } from "#pantry/test/built-in-types.ts";
import { contentEnds } from "#pantry/test/indexes.ts";
import {
  expressionKinds,
  processingReferences,
  referenceDeclarations,
  setterKinds,
  ruleKindHandles,
} from "#pantry/vocab/terms/expression-types.ts";

/**
 * Compile a base type's installed pattern as a match reads it.
 *
 * @param baseType - The base type.
 * @returns Its pattern, under the `u` flag.
 */
const patternOf = (baseType: string): RegExp =>
  regex.as(
    BaseTypePattern.rows.find((row) => row.baseType === baseType)?.pattern ??
      assert.fail(`BaseTypePattern holds no row for ${baseType}`),
    "u",
  );

describe("qti/expressions.ts, its typing tables", () => {
  it("types exactly OperatorArity's expression kinds, each once", () => {
    /**
     * Oracle: `OperatorArity`, read from the ASI XSD's expression group (`facets.ts`).
     */
    const kinds = expressionTypings.map(({ kind }) => kind);

    assert.strictEqual(new Set(kinds).size, kinds.length);
    assert.deepStrictEqual(kinds.toSorted(), OperatorArity.rows.map(({ kind }) => kind).toSorted());
    assert.deepStrictEqual([...expressionKinds].toSorted(), kinds.toSorted());
  });

  it("gives every kind that takes operands the unknown base type, and no operand the any base type", () => {
    // Oracle: the information model's typing, under which a type no declaration says passes every
    // rule, and its Null, which no operand bit holds.
    for (const typing of expressionTypings.filter(({ lead }) => lead.length > 0)) {
      const bases = new Set(
        OperandBase.rows.filter(({ kind }) => kind === typing.kind).map(({ base }) => base),
      );

      assert.isTrue(bases.has("unknown"), typing.kind);
      assert.isFalse(bases.has("any"), typing.kind);
    }
  });

  it("reads each root's built-in variables from the installed BuiltInVariable, as reading 29 types them", () => {
    /**
     * Oracle: a second statement of the same facts, `builtInTypes` (spec reading 29: an item's
     * and a response processing template's `duration` a float, a test's and a section's a
     * `duration`; the UP audit's A63), against the installed relation's rows, each declaration
     * code read through `ValueBaseOf` and `ValueCardinalityOf`. Bound: every row of both.
     */
    const itemRoots = new Set(["qti-assessment-item", "qti-response-processing"]);
    const testRoots = new Set(["qti-assessment-test", "qti-assessment-section"]);
    const valueOf = new Map(ValueBaseOf.rows.map(({ baseType, value }) => [baseType, value]));
    const cardinalityOf = new Map(
      ValueCardinalityOf.rows.map(({ cardinality, value }) => [cardinality, value]),
    );
    /**
     * A built-in with no base type, the record QTI_CONTEXT, reads `unknown` (`builtInBaseTypes`
     * holds no row for it).
     */
    const installed = BuiltInVariable.rows.map(({ cardinality, root, variable }) => {
      const typed = builtInBaseTypes.find((row) => row.root === root && row.variable === variable);
      const base =
        typed === undefined
          ? "unknown"
          : (valueOf.get(typed.baseType) ?? assert.fail(`${typed.baseType} has no value base`));
      const typedCardinality =
        cardinalityOf.get(cardinality) ?? assert.fail(`${cardinality} has no value cardinality`);

      return `${root} ${variable} ${base} ${typedCardinality}`;
    });
    const stated = builtInTypes.flatMap(({ baseType, cardinality, test, variable }) =>
      [...(test ? testRoots : itemRoots)].map(
        (root) => `${root} ${variable} ${baseType} ${cardinality}`,
      ),
    );

    assert.strictEqual(new Set(installed).size, installed.length);
    assert.deepStrictEqual(installed.toSorted(), stated.toSorted());
  });

  it("states the declaration kinds of every reference by identifier processing makes, each row cited", () => {
    /**
     * Oracle: the information model's definitions of each processing element's `identifier`
     * (`referenceDeclarations`, each with its section and words), against `VariableReference`'s
     * rows over the processing kinds: every such reference has a row, and the installed
     * `ReferenceDeclaration` holds exactly the stated pairs. Bound: every processing reference by
     * `identifier`, 10 kinds.
     */
    const stated = new Set(
      referenceDeclarations.flatMap(({ declarations, kind }) =>
        declarations.map((declaration) => `${kind} identifier ${declaration}`),
      ),
    );
    const referring = processingReferences
      .filter(({ attribute }) => attribute === "identifier")
      .map(({ kind }) => kind);

    assert.deepStrictEqual(
      referenceDeclarations.map(({ kind }) => kind).toSorted(),
      [...new Set(referring)].toSorted(),
    );
    assert.isTrue(referenceDeclarations.every(({ source }) => regex("^§\\d", "u").test(source)));
    assert.deepStrictEqual(
      [...setterKinds].toSorted(),
      [...setKindHandles, lookupKindHandle].toSorted(),
      "the setters are the rules that set their variable",
    );
    assert.deepStrictEqual(
      ReferenceDeclaration.rows
        .map(({ attribute, declaration, kind }) => `${kind} ${attribute} ${declaration}`)
        .toSorted(),
      [...stated].toSorted(),
    );
  });

  it("holds no rule kind among the expression kinds", () => {
    const rules = new Set<string>(ruleKindHandles);

    assert.deepStrictEqual(
      expressionKinds.filter((kind) => rules.has(kind)),
      [],
    );
  });

  it("gives every base type the pattern Typed value reads it by, one language per base type", () => {
    /**
     * Oracle: a second reading of the same rule, Q5.08's `Typed_value` sources: the installed
     * `ValueDomainOf` pattern of each domain `domainValues` names, its own boolean, point and pair
     * patterns, and every text for the unjudged base types. Bound: every `BaseType` handle.
     */
    const installed = new Map(ValueDomainOf.rows.map(({ domain, pattern }) => [domain, pattern]));
    const own = new Map<string, string>([
      ["boolean", booleanValuePattern],
      ["directedPair", pairValuePattern],
      ["pair", pairValuePattern],
      ["point", pointValuePattern],
    ]);
    for (const baseType of BaseType.handles) {
      const domain = domainValues.find(({ baseTypes }) =>
        baseTypes.some((judged) => judged === baseType),
      )?.domain;
      const expected =
        domain === undefined
          ? (own.get(baseType) ?? installed.get(openDomain.handle))
          : installed.get(domain);

      assert.isDefined(expected, baseType);
      assert.strictEqual(
        BaseTypePattern.rows.find((row) => row.baseType === baseType)?.pattern,
        expected,
        baseType,
      );
    }

    assert.deepStrictEqual(
      BaseTypePattern.rows.map(({ baseType }) => baseType).toSorted(),
      [...BaseType.handles].toSorted(),
    );
    assert.deepStrictEqual([...unjudgedBaseTypes].toSorted(), ["file", "string"]);
  });

  it("reads reading 34's boolean and reading 45's integer", () => {
    // Oracle: spec readings 34 (xs:boolean's true, false, 1 and 0, XML Schema Part 2 §3.2.2.1)
    // and 45 (no bound on an integer).
    assert.deepStrictEqual(
      ["true", "false", " true ", "1", "0", " 0 ", "TRUE", "2", "yes"].map((form) =>
        patternOf("boolean").test(form),
      ),
      [true, true, true, true, true, true, false, false, false],
    );
    assert.isTrue(patternOf("integer").test("1000000000000000000000000000001"));
    assert.deepStrictEqual(
      ["3 4", " 3 4 ", "3", "3 4 5", "a b"].map((form) => patternOf("point").test(form)),
      [true, true, false, false, false],
    );
  });
});

/**
 * The arity of every expression kind as the deleted seed held it
 * (`src/schema/seed/operator-arity.ts` at its deletion, the old deriver's `arity` output over the
 * ASI 3.0 XSD): the least and the most child expressions, `*` for no most.
 */
const seededArity = `
qti-base-value 0 0|qti-variable 0 0|qti-default 0 0|qti-correct 0 0|qti-map-response 0 0
qti-map-response-point 0 0|qti-math-constant 0 0|qti-null 0 0|qti-random-integer 0 0
qti-random-float 0 0|qti-number-correct 0 0|qti-number-incorrect 0 0|qti-number-presented 0 0
qti-number-responded 0 0|qti-number-selected 0 0|qti-outcome-minimum 0 0|qti-outcome-maximum 0 0
qti-test-variables 0 0|qti-and 1 *|qti-or 1 *|qti-not 1 1|qti-any-n 1 *|qti-match 2 2|qti-equal 2 2
qti-equal-rounded 2 2|qti-gt 2 2|qti-gte 2 2|qti-lt 2 2|qti-lte 2 2|qti-duration-lt 2 2
qti-duration-gte 2 2|qti-member 2 2|qti-contains 2 2|qti-delete 2 2|qti-substring 2 2
qti-string-match 2 2|qti-pattern-match 1 1|qti-inside 1 1|qti-multiple 0 *|qti-ordered 0 *
qti-repeat 1 *|qti-container-size 1 1|qti-is-null 1 1|qti-random 1 1|qti-index 1 1
qti-field-value 1 1|qti-sum 1 *|qti-product 1 *|qti-subtract 2 2|qti-divide 2 2|qti-power 2 2
qti-integer-divide 2 2|qti-integer-modulus 2 2|qti-integer-to-float 1 1|qti-round 1 1
qti-truncate 1 1|qti-round-to 1 1|qti-min 1 *|qti-max 1 *|qti-gcd 1 *|qti-lcm 1 *
qti-math-operator 1 *|qti-stats-operator 1 1|qti-custom-operator 0 *`
  .trim()
  .split(regex("[|\n]", "u"))
  .map((row) => row.split(" "))
  .map(([kind = "", min = "0", max = "*"]) => ({
    kind,
    max: max === "*" ? Option.none() : Option.some(BigInt(max)),
    min: BigInt(min),
  }));

/**
 * The arity law as `Arity` states it, at least the kind's `OperatorArity` min and at most its
 * `OperatorMax` max where it has one, over the kind's installed rows.
 *
 * @param kind - The expression's kind.
 * @param operands - Its operand count.
 * @returns Whether the law holds.
 */
const arityHolds = (kind: string, operands: bigint): boolean => {
  const row = OperatorArity.rows.find((held) => held.kind === kind);
  const most = OperatorMax.rows.find((held) => held.kind === kind);

  return row !== undefined && operands >= row.min && (most === undefined || operands <= most.max);
};

/**
 * Run a kind's content automaton over `count` `qti-null` children.
 *
 * @param kind - The parent kind.
 * @param count - The number of children.
 * @returns Whether the automaton admits the sequence.
 */
const admits = (kind: string, count: number) => {
  let state: Option.Option<number> = Option.some(0);
  for (let at = 0; at < count; at += 1) {
    state = state.pipe(
      Option.flatMap((was) => stepOf(grammar, { child: "qti-null", parent: kind }, was)),
    );
  }

  return Option.exists(state, (end) => contentEnds(grammar.content, kind, end));
};

describe("qti/expressions.ts, arity", () => {
  it("holds exactly at the seeded bounds, at min − 1, min, max and max + 1, for every kind", () => {
    // Oracle: a second implementation, the deleted seed's arity table, the old deriver's output
    // over the ASI 3.0 XSD, against `Arity` over the installed `OperatorArity`. Bound: all 64 kinds,
    // at min − 1 (where min > 0), min, max and max + 1 for a bounded kind, and min + 3 for an
    // unbounded one.
    assert.strictEqual(seededArity.length, 64);
    let judged = 0;
    for (const { kind, max, min } of seededArity) {
      const counts = [
        ...(min > 0n ? [min - 1n] : []),
        min,
        ...Option.match(max, { onNone: () => [min + 3n], onSome: (most) => [most, most + 1n] }),
      ];
      for (const count of counts) {
        assert.strictEqual(
          arityHolds(kind, count),
          count >= min &&
            Option.match(max, { onNone: () => true, onSome: (most) => count <= most }),
          `${kind} ${count}`,
        );
        judged += 1;
      }
    }

    assert.isAtLeast(judged, 64 * 3);
  });

  it("never refuses a count each kind's content automaton admits within its bounds", () => {
    // Oracle: each kind's Glushkov automaton (`content.ts`), which admits every operand count in
    // [min, max]; it admits counts past them too, since a repeated group's bounds are no
    // automaton's, so `Arity` is the one law over them. Bound: every kind, every count from min to
    // max or min + 3.
    for (const { kind, min } of OperatorArity.rows) {
      const top = OperatorMax.rows.find((held) => held.kind === kind)?.max ?? min + 3n;
      for (let count = min; count <= top; count += 1n) {
        assert.isTrue(admits(kind, Number(count)), `${kind} ${count}`);
      }
    }
  });
});
