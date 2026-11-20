import { assert, describe, it } from "@effect/vitest";
import { arithmeticEvaluators } from "#plate/engine/expressions/arithmetic.ts";
import { comparisonEvaluators } from "#plate/engine/expressions/comparison.ts";
import { containersEvaluators } from "#plate/engine/expressions/containers.ts";
import { functionsEvaluators } from "#plate/engine/expressions/functions.ts";
import { integersEvaluators } from "#plate/engine/expressions/integers.ts";
import { logicEvaluators } from "#plate/engine/expressions/logic.ts";
import { referencesEvaluators } from "#plate/engine/expressions/references.ts";
import { roundingEvaluators } from "#plate/engine/expressions/rounding.ts";
import { textEvaluators } from "#plate/engine/expressions/text.ts";
import {
  expressionKinds,
  floatOrRefOf,
  integerOrRefOf,
  stringOrRefOf,
  unknownAttributes,
} from "#plate/model/expression.ts";
import type { DeclarationFacet, ExpressionKind } from "#plate/model/expression.ts";
import { arithmeticReaders, arithmeticRules } from "#plate/model/expressions/arithmetic.ts";
import { comparisonReaders, comparisonRules } from "#plate/model/expressions/comparison.ts";
import { containersReaders, containersRules } from "#plate/model/expressions/containers.ts";
import { functionsReaders, functionsRules } from "#plate/model/expressions/functions.ts";
import { integersReaders, integersRules } from "#plate/model/expressions/integers.ts";
import { logicReaders, logicRules } from "#plate/model/expressions/logic.ts";
import { kindRules } from "#plate/model/expressions/read.ts";
import { referencesReaders, referencesRules } from "#plate/model/expressions/references.ts";
import { roundingReaders, roundingRules } from "#plate/model/expressions/rounding.ts";
import { textReaders, textRules } from "#plate/model/expressions/text.ts";
import { tables } from "#plate/validate/tables.ts";

/**
 * The nine families' kind rules, by family.
 */
const modelFamilies = {
  arithmetic: arithmeticRules,
  comparison: comparisonRules,
  containers: containersRules,
  functions: functionsRules,
  integers: integersRules,
  logic: logicRules,
  references: referencesRules,
  rounding: roundingRules,
  text: textRules,
};

/**
 * The nine families' reader specs, by family.
 */
const readerFamilies = {
  arithmetic: arithmeticReaders,
  comparison: comparisonReaders,
  containers: containersReaders,
  functions: functionsReaders,
  integers: integersReaders,
  logic: logicReaders,
  references: referencesReaders,
  rounding: roundingReaders,
  text: textReaders,
};

/**
 * Give each family's kinds, sorted, by family.
 *
 * @param families Each family's name and table.
 * @returns Each family's kinds.
 */
const kindsByFamily = (
  families: readonly (readonly [string, object])[],
): Readonly<Record<string, readonly string[]>> =>
  Object.fromEntries(families.map(([family, table]) => [family, Object.keys(table).toSorted()]));

/**
 * The nine families' evaluator entries, by family.
 */
const engineFamilies = {
  arithmetic: arithmeticEvaluators,
  comparison: comparisonEvaluators,
  containers: containersEvaluators,
  functions: functionsEvaluators,
  integers: integersEvaluators,
  logic: logicEvaluators,
  references: referencesEvaluators,
  rounding: roundingEvaluators,
  text: textEvaluators,
};

/**
 * Count how many of some tables hold each kind, as a key.
 *
 * Set equality would pass a kind two families hold, so the count is what fails on it.
 *
 * @param families The families' tables.
 * @returns Each key's count, by key.
 */
const kindCounts = (families: readonly object[]): ReadonlyMap<string, number> => {
  const counted = new Map<string, number>();
  for (const table of families) {
    for (const kind of Object.keys(table)) {
      counted.set(kind, (counted.get(kind) ?? 0) + 1);
    }
  }

  return counted;
};

/**
 * Each of the 56 kinds, counted once.
 */
const once = Object.fromEntries(expressionKinds.map((kind) => [kind, 1]));

/**
 * The kind of variable the information model says each expression's `identifier` names, quoted
 * from its §2.11.1 description: `qti-correct` "looks up the declaration of a response variable",
 * `qti-map-response` and `qti-map-response-point` "the value of a response variable", and
 * `qti-variable` and `qti-default` "an item variable", which may be of any kind.
 */
const identifierNames = {
  correct: "response",
  default: "variable",
  "map-response": "response",
  "map-response-point": "response",
  variable: "variable",
} satisfies Partial<Record<ExpressionKind, DeclarationFacet["expected"]>>;

describe("expressionKinds", () => {
  it("holds 56 kinds, none repeated", () => {
    assert.strictEqual(expressionKinds.length, 56);
    assert.strictEqual(new Set(expressionKinds).size, 56);
  });

  it("names, with the qti- prefix, exactly the XSD's children of qti-set-outcome-value but the eight outcome-only expressions, which only a test's outcome processing holds (reading 23)", () => {
    const outcomeOnly = new Set([
      "qti-number-correct",
      "qti-number-incorrect",
      "qti-number-presented",
      "qti-number-responded",
      "qti-number-selected",
      "qti-outcome-maximum",
      "qti-outcome-minimum",
      "qti-test-variables",
    ]);
    const children = tables.elements["qti-set-outcome-value"]?.children ?? {};
    const fromXsd = new Set(Object.keys(children).map((key) => key.slice(key.indexOf("}") + 1)));

    assert.isAbove(fromXsd.size, 0);
    assert.isTrue([...outcomeOnly].every((local) => fromXsd.has(local)));
    assert.deepStrictEqual(
      new Set(expressionKinds.map((kind) => `qti-${kind}`)),
      new Set([...fromXsd].filter((local) => !outcomeOnly.has(local))),
    );
  });
});

describe("integerOrRefOf", () => {
  it("reads an xs:integer with its whitespace collapsed as an exact literal", () => {
    assert.deepStrictEqual(integerOrRefOf(" 42 "), { _tag: "literal", value: 42n });
  });

  it("reads INF, NaN and a name as references, by the union's order", () => {
    assert.deepStrictEqual(integerOrRefOf("INF"), { _tag: "ref", identifier: "INF" });
    assert.deepStrictEqual(integerOrRefOf("NaN"), { _tag: "ref", identifier: "NaN" });
    assert.deepStrictEqual(integerOrRefOf("x"), { _tag: "ref", identifier: "x" });
  });
});

describe("floatOrRefOf", () => {
  it("reads INF, -INF, NaN and a decimal as xs:double literals", () => {
    assert.deepStrictEqual(floatOrRefOf("INF"), {
      _tag: "literal",
      value: Number.POSITIVE_INFINITY,
    });
    assert.deepStrictEqual(floatOrRefOf("-INF"), {
      _tag: "literal",
      value: Number.NEGATIVE_INFINITY,
    });
    assert.deepStrictEqual(floatOrRefOf("NaN"), { _tag: "literal", value: Number.NaN });
    assert.deepStrictEqual(floatOrRefOf("1.5"), { _tag: "literal", value: 1.5 });
  });

  it("reads a name as a reference", () => {
    assert.deepStrictEqual(floatOrRefOf("x"), { _tag: "ref", identifier: "x" });
  });
});

describe("stringOrRefOf", () => {
  it("reads {X} as a reference when X names a declared variable", () => {
    assert.deepStrictEqual(stringOrRefOf("{X}", new Set(["X"])), {
      _tag: "ref",
      identifier: "X",
    });
  });

  it("reads {X} as literal text, braces kept, when X names nothing", () => {
    assert.deepStrictEqual(stringOrRefOf("{X}", new Set(["Y"])), {
      _tag: "literal",
      value: "{X}",
    });
  });

  it("reads other text as the literal as written, untrimmed", () => {
    assert.deepStrictEqual(stringOrRefOf(" [0-9]+ ", new Set(["X"])), {
      _tag: "literal",
      value: " [0-9]+ ",
    });
  });
});

describe("the expression families", () => {
  it("hold each of the 56 kinds in exactly one model family, with one kind rule", () => {
    assert.deepStrictEqual(Object.fromEntries(kindCounts(Object.values(modelFamilies))), once);
  });

  it("hold each of the 56 kinds in exactly one model family, with one reader spec", () => {
    assert.deepStrictEqual(Object.fromEntries(kindCounts(Object.values(readerFamilies))), once);
  });

  it("place each kind's reader spec in the family of its rule", () => {
    assert.deepStrictEqual(
      kindsByFamily(Object.entries(readerFamilies)),
      kindsByFamily(Object.entries(modelFamilies)),
    );
  });

  it("hold each of the 56 kinds in exactly one engine family, with one evaluator entry", () => {
    assert.deepStrictEqual(Object.fromEntries(kindCounts(Object.values(engineFamilies))), once);
  });

  it("place each kind in the same family in the model and the engine", () => {
    assert.deepStrictEqual(
      Object.fromEntries(
        Object.entries(modelFamilies).map(([family, table]) => [
          family,
          Object.keys(table).toSorted(),
        ]),
      ),
      Object.fromEntries(
        Object.entries(engineFamilies).map(([family, table]) => [
          family,
          Object.keys(table).toSorted(),
        ]),
      ),
    );
  });
});

describe("kindRules", () => {
  it("declares the declaration facet of each kind whose XSD element carries an identifier, of the variable the information model says it names", () => {
    const named = expressionKinds.filter((kind) =>
      (tables.elements[`qti-${kind}`]?.attributes ?? []).some(
        (attribute) => attribute.local === "identifier",
      ),
    );

    assert.sameMembers(named, Object.keys(identifierNames));
    assert.deepStrictEqual(
      Object.fromEntries(
        expressionKinds.flatMap((kind) => {
          const facet = kindRules[kind].declaration;

          return facet === undefined ? [] : [[kind, facet]];
        }),
      ),
      Object.fromEntries(
        Object.entries(identifierNames).map(([kind, expected]) => [
          kind,
          { attribute: "identifier", expected },
        ]),
      ),
    );
  });

  it("refuses each qti-equal operand that is not a single integer or float, by its position", () => {
    const mismatches = kindRules.equal.operandsAccept([
      { baseType: "string", cardinality: "single" },
      { baseType: "integer", cardinality: "multiple" },
    ]);

    assert.deepStrictEqual(mismatches, [
      {
        baseTypes: ["integer", "float"],
        cardinalities: ["single"],
        operand: { baseType: "string", cardinality: "single" },
        position: 1,
      },
      {
        baseTypes: ["integer", "float"],
        cardinalities: ["single"],
        operand: { baseType: "integer", cardinality: "multiple" },
        position: 2,
      },
    ]);
  });

  it("accepts a qti-equal operand whose type says nothing yet", () => {
    assert.deepStrictEqual(
      kindRules.equal.operandsAccept([
        { baseType: "unknown", cardinality: "unknown" },
        { baseType: "any", cardinality: "single" },
      ]),
      [],
    );
  });

  it("types base-value, correct, equal, is-null, match, variable and both map responses as the engine gives them", () => {
    const none: readonly [] = [];

    assert.deepStrictEqual(
      {
        baseValue: kindRules["base-value"].resultType(none, {
          ...unknownAttributes,
          baseType: "point",
        }),
        correct: kindRules.correct.resultType(none, {
          ...unknownAttributes,
          baseType: "identifier",
          cardinality: "multiple",
        }),
        equal: kindRules.equal.resultType(none, unknownAttributes),
        isNull: kindRules["is-null"].resultType(none, unknownAttributes),
        mapResponse: kindRules["map-response"].resultType(none, unknownAttributes),
        mapResponsePoint: kindRules["map-response-point"].resultType(none, unknownAttributes),
        match: kindRules.match.resultType(none, unknownAttributes),
        undeclared: kindRules.variable.resultType(none, unknownAttributes),
      },
      {
        baseValue: { baseType: "point", cardinality: "single" },
        correct: { baseType: "identifier", cardinality: "multiple" },
        equal: { baseType: "boolean", cardinality: "single" },
        isNull: { baseType: "boolean", cardinality: "single" },
        mapResponse: { baseType: "float", cardinality: "single" },
        mapResponsePoint: { baseType: "float", cardinality: "single" },
        match: { baseType: "boolean", cardinality: "single" },
        undeclared: { baseType: "unknown", cardinality: "unknown" },
      },
    );
  });
});
