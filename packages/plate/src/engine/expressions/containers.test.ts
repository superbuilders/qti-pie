import { assert, describe, it } from "@effect/vitest";
import { Effect, Option, Result } from "effect";
import type { SourceElement } from "#plate/document/source.ts";
import { runRules } from "#plate/engine/evaluate.ts";
import type { Evaluate, Variables } from "#plate/engine/evaluate.ts";
import { containersEvaluators } from "#plate/engine/expressions/containers.ts";
import { drawBelow, drawFloat, drawStream } from "#plate/engine/random.ts";
import type { Draw } from "#plate/engine/random.ts";
import { ComputationBoundDefect } from "#plate/engine/numbers.ts";
import type { Expression, ExpressionType, IntegerOrRef } from "#plate/model/expression.ts";
import { admittedItem } from "#plate/test/admitted.ts";
import { outcomeDefaults } from "#plate/model/record.ts";
import { format, isNull, nullOf } from "#plate/model/values.ts";
import type { RecordValue, Single, Value } from "#plate/model/values.ts";
import { bg007Item, float, integer } from "#plate/test/fixtures.ts";
import {
  assertKindType,
  baseValueElement,
  evaluateIn,
  expressionElement,
  literal,
  noVariables,
  operandOf,
  outcomeDeclaration,
  processingItem,
  ref,
  scopeOf,
  setOutcomeElement,
  truth,
  variableElement,
} from "#plate/test/processing.ts";
import { attr, el, text } from "#plate/test/source.ts";

/**
 * Construct a value of base type identifier.
 *
 * @param cardinality Its cardinality.
 * @param names Its identifiers, in order; none for NULL.
 * @returns The value.
 */
const identifiers = (cardinality: Value["cardinality"], ...names: readonly string[]): Value => ({
  baseType: "identifier",
  cardinality,
  values: names.map((value) => ({ baseType: "identifier", value })),
});

/**
 * Construct a single identifier value.
 *
 * @param name The identifier.
 * @returns The value.
 */
const one = (name: string): Value => identifiers("single", name);

/**
 * Construct a multiple container of identifiers.
 *
 * @param names Its identifiers; none for NULL.
 * @returns The value.
 */
const bag = (...names: readonly string[]): Value => identifiers("multiple", ...names);

/**
 * Construct an ordered container of identifiers.
 *
 * @param names Its identifiers, in order; none for NULL.
 * @returns The value.
 */
const list = (...names: readonly string[]): Value => identifiers("ordered", ...names);

/**
 * The single boolean NULL.
 */
const unknown: Value = nullOf("boolean", "single");

/**
 * Give the type an operand of a value has, as the validator would type it.
 *
 * @param value The value.
 * @returns Its base type and cardinality.
 */
const typeOf = (value: Value): ExpressionType => ({
  baseType: value.baseType,
  cardinality: value.cardinality,
});

/**
 * The variables of an attempt whose outcomes hold the given values.
 *
 * @param outcomes The outcomes, by identifier.
 * @returns The variables.
 */
const holding = (outcomes: Variables["outcomes"]): Variables => ({ outcomes, responses: {} });

/**
 * Give the value of a containers expression of `qti-base-value` operands through the engine's
 * dispatcher, after checking that it succeeded and holds the type its kind's rule gives over its
 * operands' types (the family's type invariant).
 *
 * @param expression The expression, each operand a `qti-base-value`.
 * @param variables The variables of the attempt.
 * @param draw The stream its random kinds draw from; `scopeOf`'s when none is given.
 * @returns Its value.
 */
const evaluated = (
  expression: Expression,
  variables: Variables = noVariables,
  draw?: Draw,
): Value => {
  const result = evaluateIn(expression, scopeOf(bg007Item, variables, draw));
  assert.isTrue(Result.isSuccess(result), `qti-${expression.kind} failed`);

  const value = Result.getOrThrow(result);
  const operands: readonly Expression[] = expression.operands;
  assertKindType(
    value,
    expression.kind,
    operands.map((operand) =>
      operand.kind === "base-value"
        ? typeOf(operand.value)
        : { baseType: "unknown", cardinality: "unknown" },
    ),
  );

  return value;
};

/**
 * Construct a `qti-multiple` of values.
 *
 * @param values Its operands' values.
 * @returns The expression.
 */
const multipleOf = (...values: readonly Value[]): Expression => ({
  kind: "multiple",
  operands: values.map(operandOf),
});

/**
 * Construct a `qti-ordered` of values.
 *
 * @param values Its operands' values.
 * @returns The expression.
 */
const orderedOf = (...values: readonly Value[]): Expression => ({
  kind: "ordered",
  operands: values.map(operandOf),
});

/**
 * Construct a `qti-repeat` of values.
 *
 * @param numberRepeats Its `number-repeats`.
 * @param first Its first operand's value.
 * @param rest Its other operands' values.
 * @returns The expression.
 */
const repeatOf = (
  numberRepeats: IntegerOrRef,
  first: Value,
  ...rest: readonly Value[]
): Expression => ({
  kind: "repeat",
  numberRepeats,
  operands: [operandOf(first), ...rest.map(operandOf)],
});

/**
 * Construct a `qti-container-size` of a value.
 *
 * @param value Its operand's value.
 * @returns The expression.
 */
const sizeOf = (value: Value): Expression => ({
  kind: "container-size",
  operands: [operandOf(value)],
});

/**
 * Construct a `qti-index` of a value.
 *
 * @param n Its `n`.
 * @param value Its operand's value.
 * @returns The expression.
 */
const indexOf = (n: IntegerOrRef, value: Value): Expression => ({
  kind: "index",
  n,
  operands: [operandOf(value)],
});

/**
 * Construct a `qti-random` of a value.
 *
 * @param value Its operand's value.
 * @returns The expression.
 */
const randomOf = (value: Value): Expression => ({
  kind: "random",
  operands: [operandOf(value)],
});

/**
 * A stream that counts its draws: the stream of a key, and how many draws have been taken from it.
 */
interface Counted {
  readonly count: () => number;
  readonly draw: Draw;
}

/**
 * Wrap the stream of a key so its draws are counted.
 *
 * @param key The stream's key.
 * @returns The counted stream.
 */
const counted = (key: string): Counted => {
  const stream = drawStream("", key);
  let taken = 0;

  return {
    count: () => taken,
    draw: () => {
      taken += 1;

      return stream();
    },
  };
};

/**
 * The number of keys each draw test draws under.
 */
const keys = 1000;

/**
 * The timeout of this file's CPU-bound cases: the draw under each of {@link keys} keys, and the
 * cases at the bound on a computed container, which build containers of up to 1,000,001 values.
 * Each takes up to about a second alone, which a loaded machine stretches past vitest's default of
 * 5 s. Vitest fails a test that ends after its timeout even when it passes.
 */
const cpuTimeoutMs = 60_000;

/**
 * Construct an expression of a kind that takes two operands.
 *
 * @param kind The kind.
 * @param left Its first operand's value.
 * @param right Its second operand's value.
 * @returns The expression.
 */
const pairOf = (kind: "contains" | "delete" | "member", left: Value, right: Value): Expression => ({
  kind,
  operands: [operandOf(left), operandOf(right)],
});

describe("the containers family's evaluators", () => {
  it("give qti-multiple's container, flattening a multiple operand and skipping NULL ones, and NULL when it holds nothing", () => {
    assert.deepStrictEqual(
      evaluated(multipleOf(one("A"), one("B"), bag("C", "D"))),
      bag("A", "B", "C", "D"),
    );
    assert.deepStrictEqual(
      evaluated(multipleOf(bag(), one("A"), identifiers("single"), one("A"))),
      bag("A", "A"),
      "a NULL operand is ignored and a repeat is kept",
    );
    assert.deepStrictEqual(evaluated(multipleOf(bag(), identifiers("single"))), bag());
    assert.deepStrictEqual(evaluated(multipleOf()), nullOf("string", "multiple"));
  });

  it("give qti-ordered's container in order, flattening an ordered operand and skipping NULL ones, and NULL when it holds nothing", () => {
    assert.deepStrictEqual(
      evaluated(orderedOf(one("B"), list("C", "A"), identifiers("single"), one("B"))),
      list("B", "C", "A", "B"),
    );
    assert.deepStrictEqual(evaluated(orderedOf(list(), identifiers("single"))), list());
    assert.deepStrictEqual(evaluated(orderedOf()), nullOf("string", "ordered"));
  });

  it("give qti-repeat's operands number-repeats times, by literal and by a variable, and NULL below 1 (reading 21)", () => {
    assert.deepStrictEqual(
      evaluated(repeatOf(literal(2n), one("A"), list("B", "C"), list())),
      list("A", "B", "C", "A", "B", "C"),
    );
    assert.deepStrictEqual(
      evaluated(repeatOf(ref("n"), one("A")), holding({ n: integer(3n) })),
      list("A", "A", "A"),
      "the corpus's number-repeats names the variable n",
    );
    assert.deepStrictEqual(evaluated(repeatOf(literal(1n), one("A"))), list("A"));
    assert.deepStrictEqual(evaluated(repeatOf(literal(0n), one("A"))), list());
    assert.deepStrictEqual(evaluated(repeatOf(literal(-2n), one("A"))), list());
    assert.deepStrictEqual(
      evaluated(repeatOf(ref("n"), one("A")), holding({ n: integer(0n) })),
      list(),
      "a variable below 1 gives NULL",
    );
    assert.deepStrictEqual(
      evaluated(repeatOf(ref("n"), one("A")), holding({ n: nullOf("integer", "single") })),
      list(),
      "a variable that holds NULL gives NULL",
    );
    assert.deepStrictEqual(evaluated(repeatOf(literal(3n), list(), identifiers("single"))), list());
  });

  it("fail qti-repeat and qti-index whose reference names a variable the attempt holds no value of", () => {
    const repeated = evaluateIn(repeatOf(ref("n"), one("A")), scopeOf(bg007Item, noVariables));
    const indexed = evaluateIn(indexOf(ref("i"), list("A")), scopeOf(bg007Item, noVariables));

    assert.deepStrictEqual(
      Result.isFailure(repeated) ? repeated.failure._tag : "succeeded",
      "UnknownIdentifierError",
    );
    assert.deepStrictEqual(
      Result.isFailure(indexed) ? indexed.failure._tag : "succeeded",
      "UnknownIdentifierError",
    );
  });

  it("give qti-container-size's count, repeats counted, and 0 for NULL", () => {
    assert.deepStrictEqual(evaluated(sizeOf(bag("A", "B", "B"))), integer(3n));
    assert.deepStrictEqual(evaluated(sizeOf(list("A"))), integer(1n));
    assert.deepStrictEqual(evaluated(sizeOf(bag())), integer(0n));
    assert.deepStrictEqual(evaluated(sizeOf(list())), integer(0n));
  });

  it("give qti-index's nth value from 1, by literal and by a variable, and NULL for n beyond the size, n of 0 or below, and a NULL operand", () => {
    const letters = list("A", "B", "C");

    assert.deepStrictEqual(evaluated(indexOf(literal(1n), letters)), one("A"));
    assert.deepStrictEqual(evaluated(indexOf(literal(3n), letters)), one("C"));
    assert.deepStrictEqual(
      evaluated(indexOf(ref("i"), letters), holding({ i: integer(2n) })),
      one("B"),
      "the corpus's n names the variable i",
    );
    assert.deepStrictEqual(evaluated(indexOf(literal(2n), bag("A", "B"))), one("B"));
    assert.deepStrictEqual(evaluated(indexOf(literal(4n), letters)), identifiers("single"));
    assert.deepStrictEqual(evaluated(indexOf(literal(0n), letters)), identifiers("single"));
    assert.deepStrictEqual(evaluated(indexOf(literal(-1n), letters)), identifiers("single"));
    assert.deepStrictEqual(
      evaluated(indexOf(literal(2_147_483_647n), letters)),
      identifiers("single"),
      "xs:int's greatest n",
    );
    assert.deepStrictEqual(
      evaluated(indexOf(ref("i"), letters), holding({ i: integer(-3n) })),
      identifiers("single"),
    );
    assert.deepStrictEqual(
      evaluated(indexOf(ref("i"), letters), holding({ i: nullOf("integer", "single") })),
      identifiers("single"),
    );
    assert.deepStrictEqual(evaluated(indexOf(literal(1n), list())), identifiers("single"));
  });

  it("give qti-member's truth, a pair matching in either order, and NULL when either operand is NULL", () => {
    assert.deepStrictEqual(evaluated(pairOf("member", one("B"), bag("A", "B"))), truth(true));
    assert.deepStrictEqual(evaluated(pairOf("member", one("C"), list("A", "B"))), truth(false));
    assert.deepStrictEqual(
      evaluated(
        pairOf(
          "member",
          {
            baseType: "pair",
            cardinality: "single",
            values: [{ baseType: "pair", value: ["B", "A"] }],
          },
          {
            baseType: "pair",
            cardinality: "multiple",
            values: [{ baseType: "pair", value: ["A", "B"] }],
          },
        ),
      ),
      truth(true),
    );
    assert.deepStrictEqual(evaluated(pairOf("member", identifiers("single"), bag("A"))), unknown);
    assert.deepStrictEqual(evaluated(pairOf("member", one("A"), bag())), unknown);
  });

  it("give qti-delete's container without every instance of its first operand, NULL when emptied or either operand is NULL", () => {
    assert.deepStrictEqual(
      evaluated(pairOf("delete", one("A"), list("B", "A", "C", "A"))),
      list("B", "C"),
    );
    assert.deepStrictEqual(evaluated(pairOf("delete", one("D"), bag("B", "C"))), bag("B", "C"));
    assert.deepStrictEqual(evaluated(pairOf("delete", one("A"), bag("A", "A"))), bag());
    assert.deepStrictEqual(evaluated(pairOf("delete", identifiers("single"), bag("A"))), bag());
    assert.deepStrictEqual(evaluated(pairOf("delete", one("A"), list())), list());
  });

  it("give qti-contains on multiple containers counting repeats, and on ordered ones as a contiguous run", () => {
    const cases: readonly (readonly [Value, Value, boolean])[] = [
      [bag("A", "B", "C"), bag("C", "A"), true],
      [bag("A", "B", "C"), bag("B", "B"), false],
      [bag("A", "B", "B", "C"), bag("B", "B"), true],
      [bag("A", "B"), bag("A", "B", "C"), false],
      [list("A", "B", "C"), list("B", "C"), true],
      [list("A", "B", "C"), list("C", "A"), false],
      [list("A", "B", "C"), list("A", "C"), false],
      [list("A", "B", "C"), list("A", "B", "C"), true],
      [list("A", "B", "A", "B", "C"), list("A", "B", "C"), true],
      [list("A", "B"), list("B", "C"), false],
    ];

    for (const [container, part, expected] of cases) {
      assert.deepStrictEqual(
        evaluated(pairOf("contains", container, part)),
        truth(expected),
        `${container.cardinality} ${container.values.map((single) => format(single)).join(",")} and ${part.values.map((single) => format(single)).join(",")}`,
      );
    }

    assert.deepStrictEqual(evaluated(pairOf("contains", bag(), bag("A"))), unknown);
    assert.deepStrictEqual(evaluated(pairOf("contains", list("A"), list())), unknown);
  });

  it(
    "give qti-random's member at drawBelow of the container's size, each member over 1,000 keys, of a multiple and an ordered container",
    () => {
      for (const container of [bag("A", "B", "C"), list("C", "A", "B", "A")]) {
        const seen = new Set<string>();
        for (let index = 0; index < keys; index += 1) {
          const key = `k${String(index)}`;
          const at = Number(drawBelow(drawStream("", key), BigInt(container.values.length)));
          const member = container.values[at];
          assert.isDefined(member, `${key} drew past the container`);

          const picked = evaluated(randomOf(container), noVariables, drawStream("", key));
          assert.deepStrictEqual(
            picked,
            {
              baseType: "identifier",
              cardinality: "single",
              values: member === undefined ? [] : [member],
            },
            `${container.cardinality} under ${key}`,
          );
          seen.add(member === undefined ? "" : format(member));
        }

        assert.deepStrictEqual(
          [...seen].toSorted(),
          ["A", "B", "C"],
          `every member of the ${container.cardinality} container occurs`,
        );
      }
    },
    cpuTimeoutMs,
  );

  it("give qti-random's NULL for a NULL operand and draw nothing, and a container's one member with no draw", () => {
    for (const unset of [bag(), list()]) {
      const stream = counted("null");

      assert.deepStrictEqual(
        evaluated(randomOf(unset), noVariables, stream.draw),
        identifiers("single"),
        unset.cardinality,
      );
      assert.strictEqual(stream.count(), 0, `a NULL ${unset.cardinality} operand draws nothing`);
    }

    const stream = counted("one");
    assert.deepStrictEqual(evaluated(randomOf(list("B")), noVariables, stream.draw), one("B"));
    assert.strictEqual(stream.count(), 0, "a container of one member draws nothing");
  });
});

/**
 * The `qti-custom-operator` the item model reads from `<qti-custom-operator class="x"/>`, whose
 * value plate never knows (9.21): the model types it unknown, and it gives NULL.
 */
const custom: Expression = {
  class: Option.some("x"),
  definition: Option.none(),
  kind: "custom-operator",
  operands: [],
};

/**
 * Construct a `qti-multiple` of an expression and a value, so a test puts any operand, untyped or
 * not, beside a typed one.
 *
 * @param operand Its first operand.
 * @param value Its second operand's value.
 * @returns The expression.
 */
const besideOf = (operand: Expression, value: Value): Expression => ({
  kind: "multiple",
  operands: [operand, operandOf(value)],
});

describe("the containers family's evaluators over an operand typed at run time (reading 212)", () => {
  it("ignore a qti-custom-operator's NULL beside a typed operand, in qti-multiple, qti-ordered and qti-repeat", () => {
    assert.deepStrictEqual(evaluated(besideOf(custom, one("A"))), bag("A"));
    assert.deepStrictEqual(
      evaluated({ kind: "ordered", operands: [operandOf(one("A")), custom] }),
      list("A"),
    );
    assert.deepStrictEqual(
      evaluated({
        kind: "repeat",
        numberRepeats: literal(2n),
        operands: [custom, operandOf(one("A"))],
      }),
      list("A", "A"),
    );
  });

  it("give NULL for a container of a qti-custom-operator alone, and qti-index and qti-delete over it NULL in turn", () => {
    const untypedList: Expression = { kind: "ordered", operands: [custom] };
    const results = [
      evaluated(untypedList),
      evaluated({ kind: "index", n: literal(1n), operands: [untypedList] }),
      evaluated({ kind: "delete", operands: [operandOf(one("B")), untypedList] }),
    ];

    assert.deepStrictEqual(
      results.map((value) => [isNull(value), value.cardinality]),
      [
        [true, "ordered"],
        [true, "single"],
        [true, "ordered"],
      ],
    );
  });
});

/**
 * Construct a container of one identifier, `A`, held a number of times, built without spreading
 * its values, as a container of a million values must be.
 *
 * @param cardinality Its cardinality.
 * @param size How many values it holds.
 * @returns The value.
 */
const sized = (cardinality: "multiple" | "ordered", size: number): Value => ({
  baseType: "identifier",
  cardinality,
  values: Array.from({ length: size }, (): Single => ({ baseType: "identifier", value: "A" })),
});

/**
 * Assert that a value is a NULL of a cardinality, checking that it holds no value first, so a
 * container of a million values fails with its size, not a diff of its values. Its base type is
 * not compared: no run reads a NULL's base type, since a set stores its target's own NULL.
 *
 * @param value The value.
 * @param expected A NULL of the cardinality it must have.
 */
const assertUnset = (value: Value, expected: Value): void => {
  assert.strictEqual(value.values.length, 0, "the value holds values");
  assert.strictEqual(value.cardinality, expected.cardinality);
};

describe("the containers family's bound on a computed container", () => {
  it(
    "qti-multiple and qti-ordered keep a container of exactly 1,000,000 values and abort the run, never NULL, for one of 1,000,001",
    () => {
      const bagged = evaluated(multipleOf(sized("multiple", 999_999), one("B")));
      const listed = evaluated(orderedOf(one("B"), sized("ordered", 999_999)));

      assert.strictEqual(bagged.values.length, 1_000_000);
      assert.deepStrictEqual(bagged.values.at(-1), { baseType: "identifier", value: "B" });
      assert.strictEqual(listed.values.length, 1_000_000);
      assert.deepStrictEqual(listed.values[0], { baseType: "identifier", value: "B" });
      assert.throws(() => {
        evaluated(multipleOf(sized("multiple", 1_000_000), one("B")));
      }, ComputationBoundDefect);
      assert.throws(() => {
        evaluated(orderedOf(one("B"), sized("ordered", 1_000_000)));
      }, ComputationBoundDefect);
      assert.throws(() => {
        evaluated(multipleOf(sized("multiple", 600_000), sized("multiple", 400_001)));
      }, ComputationBoundDefect);
    },
    cpuTimeoutMs,
  );

  it(
    "qti-repeat keeps exactly 1,000,000 values and aborts the run, never NULL, past them",
    () => {
      const kept = evaluated(repeatOf(literal(1_000_000n), one("A")));

      assert.strictEqual(kept.values.length, 1_000_000);
      assert.isTrue(
        kept.values.every((single) => single.baseType === "identifier" && single.value === "A"),
        "every value is A",
      );
      assert.throws(() => {
        evaluated(repeatOf(literal(1_000_001n), one("A")));
      }, ComputationBoundDefect);
      assert.throws(() => {
        evaluated(repeatOf(literal(500_001n), one("A"), list("B")));
      }, ComputationBoundDefect);
    },
    cpuTimeoutMs,
  );

  it("qti-repeat evaluates its operands once and repeats that pass's values, so an operand whose later values would grow past 1,000,000 is never evaluated again", () => {
    const { repeat } = containersEvaluators;

    let evaluations = 0;
    const growing: Evaluate = () => {
      evaluations += 1;

      return Result.succeed(evaluations === 1 ? one("A") : sized("ordered", 600_000));
    };
    const repeated = repeat(
      { kind: "repeat", numberRepeats: literal(3n), operands: [operandOf(one("A"))] },
      scopeOf(bg007Item, noVariables),
      growing,
    );
    assert.isTrue(Result.isSuccess(repeated), "qti-repeat failed");

    const value = Result.getOrThrow(repeated);
    assert.deepStrictEqual(value, list("A", "A", "A"));
    assertKindType(value, "repeat", [typeOf(one("A"))]);
    assert.strictEqual(evaluations, 1, "the operand was evaluated once, not once per pass");
  });
});

/**
 * Construct a `qti-random-integer` of literal bounds, its step 1.
 *
 * @param min Its `min`.
 * @param max Its `max`.
 * @returns The expression.
 */
const randomIntegerOf = (min: bigint, max: bigint): Expression => ({
  kind: "random-integer",
  max: literal(max),
  min: literal(min),
  operands: [],
  step: literal(1n),
});

/**
 * A `qti-random-integer` from 1 to 1,000,000, whose draws repeat a value rarely.
 */
const wide = randomIntegerOf(1n, 1_000_000n);

/**
 * Construct a `qti-repeat` of expressions.
 *
 * @param numberRepeats Its `number-repeats`.
 * @param first Its first operand.
 * @param rest Its other operands.
 * @returns The expression.
 */
const repeating = (
  numberRepeats: IntegerOrRef,
  first: Expression,
  ...rest: readonly Expression[]
): Expression => ({ kind: "repeat", numberRepeats, operands: [first, ...rest] });

/**
 * Construct an ordered container of integers.
 *
 * @param values Its integers, in order.
 * @returns The value.
 */
const integers = (values: readonly bigint[]): Value => ({
  baseType: "integer",
  cardinality: "ordered",
  values: values.map((value) => ({ baseType: "integer", value })),
});

/**
 * Give the draws a stream of a key takes after skipping some of its first draws.
 *
 * @param key The stream's key.
 * @param skipped How many of its first draws to skip.
 * @returns The stream, its next draw the key's draw after those skipped.
 */
const after = (key: string, skipped: number): Draw => {
  const stream = drawStream("", key);
  for (let taken = 0; taken < skipped; taken += 1) {
    stream();
  }

  return stream;
};

/**
 * The label under which, with the seed `""`, the first draw of a `qti-random-integer` from 0 to 1
 * gives 0, which the setup of rule (a)'s case found among `repeat 0`, `repeat 1`, …: a draw from 0
 * to 1 takes one draw, masked to its low bit.
 */
const zeroFirst = "repeat 3";

describe("the containers family's drawing qti-repeat (an operand holds a random kind)", () => {
  it("evaluates its operands once per pass, left to right, so each pass draws anew", () => {
    const key = "repeat per pass";
    const expected = after(key, 0);
    const draws = Array.from({ length: 5 }, () => drawBelow(expected, 1_000_000n) + 1n);
    const repeated = evaluated(repeating(literal(5n), wide), noVariables, drawStream("", key));

    assert.deepStrictEqual(repeated, integers(draws));
    assert.isAbove(new Set(draws).size, 1, "the five passes' values are not all equal");

    const pairs = after(key, 0);
    const interleaved = Array.from({ length: 2 }, () => [
      drawBelow(pairs, 1_000_000n) + 1n,
      drawBelow(pairs, 10n) + 1n,
    ]).flat();
    assert.deepStrictEqual(
      evaluated(
        repeating(literal(2n), wide, randomIntegerOf(1n, 10n)),
        noVariables,
        drawStream("", key),
      ),
      integers(interleaved),
      "each pass evaluates the first operand, then the second",
    );
  });

  it("draws per pass for a random kind at any depth: qti-random-float, qti-random, and a qti-random-integer inside a qti-sum", () => {
    const key = "repeat at depth";
    const floats = after(key, 0);
    const expected: Value = {
      baseType: "float",
      cardinality: "ordered",
      values: Array.from({ length: 3 }, () => ({ baseType: "float", value: drawFloat(floats) })),
    };
    const unit: Expression = {
      kind: "random-float",
      max: { _tag: "literal", value: 1 },
      min: { _tag: "literal", value: 0 },
      operands: [],
    };
    assert.deepStrictEqual(
      evaluated(repeating(literal(3n), unit), noVariables, drawStream("", key)),
      expected,
    );

    const letters = bag("A", "B", "C", "D", "E", "F", "G", "H");
    const picks = after(key, 0);
    const picked = Array.from({ length: 4 }, () =>
      Number(drawBelow(picks, BigInt(letters.values.length))),
    ).flatMap((at) => letters.values.slice(at, at + 1));
    assert.deepStrictEqual(
      evaluated(repeating(literal(4n), randomOf(letters)), noVariables, drawStream("", key)),
      { baseType: "identifier", cardinality: "ordered", values: picked },
    );

    const sums = after(key, 0);
    const summed = Array.from({ length: 3 }, () => drawBelow(sums, 1_000_000n) + 1n + 10n);
    assert.deepStrictEqual(
      evaluated(
        repeating(literal(3n), { kind: "sum", operands: [wide, operandOf(integer(10n))] }),
        noVariables,
        drawStream("", key),
      ),
      integers(summed),
    );
  });

  it("aborts the run before any pass for number-repeats above 1,000,000, the pass budget, never NULL, and draws nothing", () => {
    const stream = counted("repeat budget");

    assert.throws(() => {
      evaluated(repeating(literal(1_000_001n), wide), noVariables, stream.draw);
    }, ComputationBoundDefect);
    assert.strictEqual(stream.count(), 0, "no pass ran, so nothing was drawn");
  });

  it(
    "checks the running size before each pass's values are added, so a pass that would grow the container past 1,000,000 values aborts the run, never NULL",
    () => {
      const { repeat } = containersEvaluators;

      let passes = 0;
      const growing: Evaluate = () => {
        passes += 1;

        return Result.succeed(sized("ordered", 600_000));
      };
      assert.throws(() => {
        repeat(
          { kind: "repeat", numberRepeats: literal(3n), operands: [wide] },
          scopeOf(bg007Item, noVariables),
          growing,
        );
      }, ComputationBoundDefect);
      assert.strictEqual(passes, 2, "the second pass ran and its values were not added");
    },
    cpuTimeoutMs,
  );

  it("rule (a): a pass that gives no value gives NULL at once and runs no later pass, so it draws nothing more", () => {
    assert.strictEqual(
      drawBelow(drawStream("", zeroFirst), 2n),
      0n,
      `the first draw under ${zeroFirst} from 0 to 1 is 0`,
    );

    const draw = drawStream("", zeroFirst);
    const quotient: Expression = {
      kind: "divide",
      operands: [operandOf(float(1)), randomIntegerOf(0n, 1n)],
    };
    assertUnset(
      evaluated(repeating(literal(5n), quotient), noVariables, draw),
      nullOf("float", "ordered"),
    );
    assert.strictEqual(draw(), after(zeroFirst, 1)(), "the next draw is the key's second");
  });

  it("rule (b): number-repeats below 1, or naming a variable that holds NULL, gives NULL with no pass, so it draws nothing", () => {
    const key = "repeat with no pass";
    const cases: readonly (readonly [string, Expression, Variables, Value])[] = [
      ["number-repeats 0", repeating(literal(0n), wide), noVariables, nullOf("integer", "ordered")],
      [
        "number-repeats -2",
        repeating(literal(-2n), wide),
        noVariables,
        nullOf("integer", "ordered"),
      ],
      [
        "number-repeats naming a variable that holds NULL",
        repeating(ref("n"), wide),
        holding({ n: nullOf("integer", "single") }),
        nullOf("integer", "ordered"),
      ],
      [
        "number-repeats 0 over a qti-random of identifiers",
        repeating(literal(0n), randomOf(bag("A", "B"))),
        noVariables,
        nullOf("identifier", "ordered"),
      ],
    ];

    for (const [title, expression, variables, expected] of cases) {
      const draw = drawStream("", key);

      assertUnset(evaluated(expression, variables, draw), expected);
      assert.strictEqual(draw(), after(key, 0)(), `${title}: the next draw is the key's first`);
    }
  });
});

/**
 * Construct a `qti-value` that writes one field of a record response's declared value.
 *
 * @param identifier The `field-identifier`.
 * @param baseType The field's `base-type`.
 * @param written The value's text.
 * @returns The value element.
 */
const fieldElement = (identifier: string, baseType: string, written: string): SourceElement =>
  el(
    "qti-value",
    [attr("base-type", baseType), attr("field-identifier", identifier)],
    [text(written)],
  );

/**
 * The record response `R`, as a Text Entry bound to a record would post it: its correct response
 * the text `12.5` read into its `stringValue` and `floatValue`, and its default the text `abc`
 * read into its `stringValue` alone.
 */
const recordResponse: SourceElement = el(
  "qti-response-declaration",
  [attr("cardinality", "record"), attr("identifier", "R")],
  [
    el("qti-default-value", [], [fieldElement("stringValue", "string", "abc")]),
    el(
      "qti-correct-response",
      [],
      [fieldElement("stringValue", "string", "12.5"), fieldElement("floatValue", "float", "12.5")],
    ),
  ],
);

/**
 * Construct a `qti-field-value` of one field of an operand.
 *
 * @param identifier The `field-identifier`.
 * @param operand The record it reads.
 * @returns The expression element.
 */
const fieldValueOf = (identifier: string, operand: SourceElement): SourceElement =>
  expressionElement("field-value", [attr("field-identifier", identifier)], [operand]);

/**
 * Construct a `qti-is-null` of an operand.
 *
 * @param operand The operand.
 * @returns The expression element.
 */
const isNullOf = (operand: SourceElement): SourceElement =>
  expressionElement("is-null", [], [operand]);

/**
 * Construct a record of fields, each a single.
 *
 * @param fields The fields, by identifier, in order.
 * @returns The record.
 */
const recordOf = (fields: Readonly<Record<string, Single>>): RecordValue => ({
  cardinality: "record",
  fields: Object.entries(fields).map(([identifier, value]) => ({ identifier, value })),
});

/**
 * The record a post of `12.5` gives (R-c): its text, and the float it reads as.
 */
const twelveAndAHalf: RecordValue = recordOf({
  floatValue: { baseType: "float", value: 12.5 },
  stringValue: { baseType: "string", value: "12.5" },
});

/**
 * Build an item that declares {@link recordResponse} and the outcomes given, whose response
 * processing sets each outcome to its expression, and run that processing over a record of `R`,
 * after checking that the item model holds `R` as a record, marks nothing, and keeps the
 * processing, so it runs where the base marked it.
 *
 * @param outcomes Each outcome's identifier, base type, the expression it is set to and its
 *   cardinality, `single` unless given, in order.
 * @param record The value of `R` the attempt holds.
 * @returns The outcomes after the run.
 */
const recordRun = (
  outcomes: readonly (readonly [string, string, SourceElement, string?])[],
  record: RecordValue,
) =>
  Effect.gen(function* runOverRecord() {
    const item = admittedItem(
      processingItem(
        [
          recordResponse,
          ...outcomes.map(([identifier, baseType, , cardinality]) =>
            outcomeDeclaration(identifier, baseType, cardinality),
          ),
        ],
        outcomes.map(([identifier, , expression]) => setOutcomeElement(identifier, expression)),
      ),
    );
    assert.deepStrictEqual([...item.records.keys()], ["R"]);
    assert.deepStrictEqual(item.unsupported, []);
    assert.isTrue(Option.isSome(item.processing), "the processing runs");
    if (Option.isNone(item.processing)) {
      return {};
    }

    const run = yield* Effect.fromResult(
      runRules(
        item.processing.value,
        item,
        {
          numAttempts: 1n,
          outcomes: outcomeDefaults(item),
          records: { R: record },
          responses: {},
        },
        drawStream("", ""),
      ),
    );

    return run.outcomes;
  });

/**
 * The single boolean value of a truth.
 *
 * @param held The truth.
 * @returns The value.
 */
const booleanValue = (held: boolean): Value => ({
  baseType: "boolean",
  cardinality: "single",
  values: [{ baseType: "boolean", value: held }],
});

/**
 * The single string value of a text.
 *
 * @param written The text.
 * @returns The value.
 */
const stringValue = (written: string): Value => ({
  baseType: "string",
  cardinality: "single",
  values: [{ baseType: "string", value: written }],
});

describe("qti-field-value, qti-is-null and qti-match over a record response", () => {
  it.effect(
    "reads a record field: SCORE set to the floatValue of the record response scores the record's float",
    () =>
      Effect.gen(function* scoresFloatField() {
        const outcomes = yield* recordRun(
          [["SCORE", "float", fieldValueOf("floatValue", variableElement("R"))]],
          twelveAndAHalf,
        );

        assert.deepStrictEqual(outcomes["SCORE"], float(12.5));
      }),
  );

  it.effect(
    "reads a record field: a field the record lacks, and every field of a NULL record, is NULL",
    () =>
      Effect.gen(function* lacksField() {
        const lacking = [
          "LACKS",
          "boolean",
          isNullOf(fieldValueOf("exponent", variableElement("R"))),
        ] as const;
        const textField = [
          "TEXT",
          "string",
          fieldValueOf("stringValue", variableElement("R")),
        ] as const;

        const held = yield* recordRun([lacking, textField], twelveAndAHalf);
        const empty = yield* recordRun([lacking, textField], recordOf({}));

        assert.deepStrictEqual(
          [held["LACKS"], held["TEXT"]],
          [booleanValue(true), stringValue("12.5")],
        );
        assert.deepStrictEqual(
          [empty["LACKS"], empty["TEXT"]],
          [booleanValue(true), nullOf("string", "single")],
        );
      }),
  );

  it.effect(
    "reads a record field: qti-is-null of a NULL record is true, and of a record with a field false",
    () =>
      Effect.gen(function* isNullRecord() {
        const emptiness = [["EMPTY", "boolean", isNullOf(variableElement("R"))]] as const;

        const empty = yield* recordRun(emptiness, recordOf({}));
        const held = yield* recordRun(emptiness, twelveAndAHalf);

        assert.deepStrictEqual(
          [empty["EMPTY"], held["EMPTY"]],
          [booleanValue(true), booleanValue(false)],
        );
      }),
  );

  it.effect(
    "reads a record field of qti-default and of qti-correct: the declared default and correct response",
    () =>
      Effect.gen(function* readsDeclared() {
        const outcomes = yield* recordRun(
          [
            [
              "DEFAULT",
              "string",
              fieldValueOf("stringValue", el("qti-default", [attr("identifier", "R")])),
            ],
            [
              "CORRECT",
              "float",
              fieldValueOf("floatValue", el("qti-correct", [attr("identifier", "R")])),
            ],
          ],
          recordOf({}),
        );

        assert.deepStrictEqual(
          [outcomes["DEFAULT"], outcomes["CORRECT"]],
          [stringValue("abc"), float(12.5)],
        );
      }),
  );

  it.effect(
    "reads a record field through qti-match: the response matches its correct response when the records are equal, not when it holds a field more, and is NULL when it is NULL",
    () =>
      Effect.gen(function* matchesRecords() {
        const matching = [
          [
            "MATCHED",
            "boolean",
            expressionElement(
              "match",
              [],
              [variableElement("R"), el("qti-correct", [attr("identifier", "R")])],
            ),
          ],
        ] as const;
        const reordered = recordOf({
          floatValue: { baseType: "float", value: 12.5 },
          stringValue: { baseType: "string", value: "12.5" },
        });
        const more = recordOf({
          exponent: { baseType: "integer", value: 3n },
          floatValue: { baseType: "float", value: 12.5 },
          stringValue: { baseType: "string", value: "12.5" },
        });

        const equal = yield* recordRun(matching, reordered);
        const longer = yield* recordRun(matching, more);
        const empty = yield* recordRun(matching, recordOf({}));

        assert.deepStrictEqual(
          [equal["MATCHED"], longer["MATCHED"], empty["MATCHED"]],
          [booleanValue(true), booleanValue(false), nullOf("boolean", "single")],
        );
      }),
  );

  it.effect("reads a record field of qti-null as NULL", () =>
    Effect.gen(function* fieldOfNull() {
      const outcomes = yield* recordRun(
        [["NONE", "boolean", isNullOf(fieldValueOf("stringValue", el("qti-null")))]],
        twelveAndAHalf,
      );

      assert.deepStrictEqual(outcomes["NONE"], booleanValue(true));
    }),
  );

  it.effect(
    "holds a qti-field-value's value in qti-multiple and qti-ordered, and gives NULL beside a value of another base type (reading 212)",
    () =>
      Effect.gen(function* containersOfFields() {
        const field = fieldValueOf("stringValue", variableElement("R"));
        const outcomes = yield* recordRun(
          [
            ["BAG", "string", expressionElement("multiple", [], [field]), "multiple"],
            [
              "LIST",
              "string",
              expressionElement("ordered", [], [field, baseValueElement("string", "x")]),
              "ordered",
            ],
            [
              "MIXED",
              "string",
              expressionElement("multiple", [], [field, baseValueElement("identifier", "A")]),
              "multiple",
            ],
          ],
          twelveAndAHalf,
        );

        assert.deepStrictEqual(outcomes["BAG"], {
          baseType: "string",
          cardinality: "multiple",
          values: [{ baseType: "string", value: "12.5" }],
        });
        assert.deepStrictEqual(outcomes["LIST"], {
          baseType: "string",
          cardinality: "ordered",
          values: [
            { baseType: "string", value: "12.5" },
            { baseType: "string", value: "x" },
          ],
        });
        assert.deepStrictEqual(outcomes["MIXED"], nullOf("string", "multiple"));
      }),
  );
});
