import { drawn, explore } from "@bjornpagen/testing/explore";
import { noCoverage } from "@bjornpagen/testing/features";
import { array, int } from "@bjornpagen/testing/gen";
import { completeShrink } from "@bjornpagen/testing/shrink";
import { searched } from "@bjornpagen/testing/vitest";
import { assert, describe, it } from "@effect/vitest";
import { Duration, Effect, Formatter } from "effect";
import type { Expression, LiteralOr, StaticType } from "#processing/ir.ts";
import { containersOperators } from "#processing/operators/containers.ts";
import { randomOperators } from "#processing/operators/random.ts";
import { valuesOperators } from "#processing/operators/values.ts";
import { nodeOf, ownVariable, testRun } from "#processing/test/run.ts";
import { container, isText, nullOf, single } from "#processing/value.ts";
import type { Text, Value } from "#processing/value.ts";

const operators = Object.freeze({ ...containersOperators, ...randomOperators, ...valuesOperators });

/**
 * The work one case may do.
 */
const caseHang = Duration.seconds(30);

/**
 * How many rotating cases each search compares beside its witnesses.
 */
const CASES = 1000;

const integerType: StaticType = { kind: "typed", type: { base: "integer", cardinality: "single" } };

const floatType: StaticType = { kind: "typed", type: { base: "float", cardinality: "single" } };

/**
 * A text the tests know is not empty.
 *
 * @param written - The text.
 * @returns It, as a Text.
 */
const text = (written: string): Text => (isText(written) ? written : assert.fail("empty text"));

/**
 * Values the runs read through `qti-variable`.
 */
const stated = Object.freeze({
  abc: { value: container("ordered", "identifier", [text("A"), text("B"), text("C")]) },
  missing: { value: nullOf({ base: "integer", cardinality: "single" }) },
  none: { value: nullOf({ base: "identifier", cardinality: "multiple" }) },
});

/**
 * An integer literal attribute.
 *
 * @param value - The integer.
 * @returns The attribute.
 */
const integerLiteral = (value: bigint): LiteralOr<bigint> => ({ kind: "literal", value });

/**
 * A float literal attribute.
 *
 * @param value - The float.
 * @returns The attribute.
 */
const floatLiteral = (value: number): LiteralOr<number> => ({ kind: "literal", value });

/**
 * A `qti-random-integer`.
 *
 * @param min - Its min.
 * @param max - Its max.
 * @param step - Its step.
 * @returns The node.
 */
const randomInteger = (
  min: LiteralOr<bigint>,
  max: LiteralOr<bigint>,
  step: LiteralOr<bigint>,
): Expression => nodeOf("random-integer", [], { max, min, step }, integerType);

/**
 * An expression's value over a stream, and how many words it took.
 */
interface DrawnValue {
  readonly taken: number;
  readonly value: Value;
}

/**
 * Evaluate an expression over a stream of stated words.
 *
 * @param expression - The expression.
 * @param draws - The stream's words.
 * @returns Its value and how many words it took.
 */
const drawnValue = (expression: Expression, draws: readonly number[]): DrawnValue => {
  const { recorder, run } = testRun(operators, stated, { draws });
  const value = run.evaluate(expression);

  return { taken: recorder.draws.taken, value };
};

/**
 * A variable's read.
 *
 * @param name - The variable.
 * @returns The `qti-variable`.
 */
const read = (name: "abc" | "none"): Expression => {
  const type =
    name === "abc"
      ? ({ base: "identifier", cardinality: "ordered" } as const)
      : ({ base: "identifier", cardinality: "multiple" } as const);

  return nodeOf("variable", [], { variable: ownVariable(name, type) }, { kind: "typed", type });
};

/**
 * A `qti-random-float` of literal bounds.
 *
 * @param min - Its min.
 * @param max - Its max.
 * @returns The node.
 */
const randomFloat = (min: number, max: number): Expression =>
  nodeOf("random-float", [], { max: floatLiteral(max), min: floatLiteral(min) }, floatType);

describe("the random family's laws", () => {
  it.effect(
    "random-integer draws a value of its grid min + step·j within [min, max], and draws nothing where the range holds none (§6.9.38, reading `null-results`)",
    (ctx) =>
      searched(
        ctx,
        explore(
          {
            caseHang,
            coverage: noCoverage,
            draw: drawn((source): readonly [number, number, number, readonly number[]] => [
              int(-50, 50)(source),
              int(-50, 50)(source),
              int(-2, 9)(source),
              array(int(0, 4_294_967_295), { max: 8, min: 8 })(source),
            ]),
            kept: [],
            literal: (row) => Formatter.format(row),
            oracle: { kind: "specification", name: "the range's grid and the stream's contract" },
            runs: CASES,
            shrink: completeShrink,
            steerEvery: 16,
            suite: "processing/random/random-integer",
          },
          ([min, max, step, words]) =>
            Effect.sync(() => {
              const { taken, value } = drawnValue(
                randomInteger(
                  integerLiteral(BigInt(min)),
                  integerLiteral(BigInt(max)),
                  integerLiteral(BigInt(step)),
                ),
                words,
              );
              if (max < min || step <= 0) {
                assert.deepStrictEqual(value, nullOf({ base: "integer", cardinality: "single" }));
                assert.strictEqual(taken, 0);

                return;
              }

              assert.isTrue(value.kind === "single" && value.base === "integer");

              const drawnInteger =
                value.kind === "single" && value.base === "integer"
                  ? Number(value.value)
                  : Number.NaN;
              assert.isTrue(min <= drawnInteger && drawnInteger <= max, "within [min, max]");
              assert.strictEqual((drawnInteger - min) % step, 0, "on the grid");
            }),
        ),
      ),
  );
});

describe("the random family's stated values", () => {
  it("random chooses the member the stream's word below the size names, redrawing a word past it (§2.11.3.36)", () => {
    const random = nodeOf(
      "random",
      [read("abc")],
      {},
      { kind: "typed", type: { base: "identifier", cardinality: "single" } },
    );

    assert.deepStrictEqual(drawnValue(random, [1]), {
      taken: 1,
      value: single("identifier", text("B")),
    });
    assert.deepStrictEqual(drawnValue(random, [3, 2]), {
      taken: 2,
      value: single("identifier", text("C")),
    });
    assert.deepStrictEqual(
      drawnValue(
        nodeOf(
          "random",
          [read("none")],
          {},
          { kind: "typed", type: { base: "identifier", cardinality: "single" } },
        ),
        [1],
      ),
      { taken: 0, value: nullOf({ base: "identifier", cardinality: "single" }) },
    );
  });

  it("random-integer draws its index among the grid's values, and a NULL attribute draws nothing (reading `null-results`, item 8)", () => {
    assert.deepStrictEqual(
      drawnValue(randomInteger(integerLiteral(1n), integerLiteral(10n), integerLiteral(3n)), [2]),
      { taken: 1, value: single("integer", 7n) },
    );
    assert.deepStrictEqual(
      drawnValue(
        randomInteger(
          {
            kind: "variable",
            variable: ownVariable("missing", { base: "integer", cardinality: "single" }),
          },
          integerLiteral(10n),
          integerLiteral(1n),
        ),
        [2],
      ),
      { taken: 0, value: nullOf({ base: "integer", cardinality: "single" }) },
    );
  });

  it("random-float takes 27 then 26 bits over 2^53, held inside [min, max], and draws nothing for an inverted or infinite range (§6.9.37)", () => {
    assert.deepStrictEqual(drawnValue(randomFloat(1, 3), [0, 0]), {
      taken: 2,
      value: single("float", 1),
    });
    assert.deepStrictEqual(drawnValue(randomFloat(1, 3), [2 ** 31, 0]), {
      taken: 2,
      value: single("float", 2),
    });
    assert.deepStrictEqual(drawnValue(randomFloat(1, 3), [4_294_967_295, 4_294_967_295]), {
      taken: 2,
      value: single("float", 3),
    });
    assert.deepStrictEqual(drawnValue(randomFloat(3, 1), [0, 0]), {
      taken: 0,
      value: nullOf({ base: "float", cardinality: "single" }),
    });
    assert.deepStrictEqual(drawnValue(randomFloat(0, Number.POSITIVE_INFINITY), [0, 0]), {
      taken: 0,
      value: nullOf({ base: "float", cardinality: "single" }),
    });
    assert.deepStrictEqual(
      drawnValue(randomFloat(-Number.MAX_VALUE, Number.MAX_VALUE), [2 ** 31, 0]),
      { taken: 2, value: single("float", 0) },
    );
  });

  it("repeat evaluates a drawing operand once a pass, each pass drawing anew (§2.11.3.42)", () => {
    const repeat = nodeOf(
      "repeat",
      [randomInteger(integerLiteral(0n), integerLiteral(3n), integerLiteral(1n))],
      { numberRepeats: integerLiteral(3n) },
      { kind: "typed", type: { base: "integer", cardinality: "ordered" } },
    );

    assert.deepStrictEqual(drawnValue(repeat, [2, 0, 3]), {
      taken: 3,
      value: container("ordered", "integer", [2n, 0n, 3n]),
    });
  });
});
