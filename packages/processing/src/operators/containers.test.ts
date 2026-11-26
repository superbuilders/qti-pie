import { drawn, explore } from "@bjornpagen/testing/explore";
import { noCoverage } from "@bjornpagen/testing/features";
import { array, int } from "@bjornpagen/testing/gen";
import { completeShrink } from "@bjornpagen/testing/shrink";
import { searched } from "@bjornpagen/testing/vitest";
import { assert, describe, it } from "@effect/vitest";
import { Duration, Effect, Formatter } from "effect";
import type { Expression, StaticType } from "#processing/ir.ts";
import { containersOperators } from "#processing/operators/containers.ts";
import { singleBoolean } from "#processing/operators/operator.ts";
import { valuesOperators } from "#processing/operators/values.ts";
import { literal, nodeOf, ownVariable, testRun } from "#processing/test/run.ts";
import { container, isText, nullOf, recordOf, single } from "#processing/value.ts";
import type { ContainerCardinality, Null, Text, Value, ValueType } from "#processing/value.ts";

const operators = Object.freeze({ ...containersOperators, ...valuesOperators });

/**
 * The work one case may do.
 */
const caseHang = Duration.seconds(30);

/**
 * How many rotating cases each search compares beside its witnesses.
 */
const CASES = 1000;

/**
 * An identifier the tests know is not empty.
 *
 * @param written - The identifier.
 * @returns It, as a Text.
 */
const text = (written: string): Text => (isText(written) ? written : assert.fail("empty text"));

/**
 * The identifiers the searches draw members from.
 */
const letters: readonly Text[] = [text("A"), text("B"), text("C")];

/**
 * A single identifier's literal.
 *
 * @param letter - The identifier.
 * @returns The `qti-base-value`.
 */
const identifier = (letter: string): Expression => literal(single("identifier", text(letter)));

/**
 * The type of an identifier container.
 *
 * @param kind - Its cardinality.
 * @returns The static type.
 */
const containerType = (kind: ContainerCardinality): StaticType => ({
  kind: "typed",
  type: { base: "identifier", cardinality: kind },
});

/**
 * Stated values the runs read through `qti-variable`.
 */
const stated = Object.freeze({
  abc: { value: container("ordered", "identifier", [text("A"), text("B"), text("C")]) },
  info: { value: recordOf([{ name: "count", value: single("integer", 3n) }]) },
  none: { value: nullOf({ base: "identifier", cardinality: "multiple" }) },
  two: { value: single("integer", 2n) },
} satisfies Readonly<Record<string, { readonly value: Value }>>);

/**
 * A variable's read.
 *
 * @param name - The variable.
 * @param type - Its type.
 * @returns The `qti-variable`.
 */
const read = (name: string, type: ValueType): Expression =>
  nodeOf("variable", [], { variable: ownVariable(name, type) }, { kind: "typed", type });

/**
 * A container of identifiers, read through a variable of its own.
 *
 * @param kind - Its cardinality.
 * @param members - Its members.
 * @returns The run that states it and the expression that reads it.
 */
const containerRead = (kind: ContainerCardinality, members: readonly Text[]): Expression =>
  members.length === 0
    ? literal(nullOf({ base: "identifier", cardinality: "single" }))
    : nodeOf(
        "variable",
        [],
        {
          variable: ownVariable(`${kind} ${members.join(" ")}`, {
            base: "identifier",
            cardinality: kind,
          }),
        },
        containerType(kind),
      );

/**
 * A run in which every container of identifiers the searches draw is a variable of its own name.
 *
 * @param containers - The containers.
 * @returns The run.
 */
const runOver = (
  containers: readonly (readonly [ContainerCardinality, readonly Text[]])[],
): ReturnType<typeof testRun>["run"] =>
  testRun(
    operators,
    {
      ...stated,
      ...Object.fromEntries(
        containers.map(([kind, members]) => [
          `${kind} ${members.join(" ")}`,
          { value: container(kind, "identifier", members) },
        ]),
      ),
    },
    {},
  ).run;

const { recorder, run } = testRun(operators, stated, {});

/**
 * A count of each letter.
 *
 * @param members - The members.
 * @param letter - The letter.
 * @returns How many times it occurs.
 */
const countOf = (members: readonly Text[], letter: Text): number =>
  members.filter((member) => member === letter).length;

/**
 * Whether a sequence holds a run, by the joined texts: the oracle of ordered containment.
 *
 * @param whole - The sequence.
 * @param part - The run.
 * @returns Whether it holds it.
 */
const holdsRun = (whole: readonly Text[], part: readonly Text[]): boolean =>
  ` ${whole.join(" ")} `.includes(` ${part.join(" ")} `);

/**
 * Members drawn from A, B and C.
 */
const members = array((source): Text => letters[int(0, 2)(source)] ?? text("A"), {
  max: 5,
  min: 1,
});

/**
 * A `qti-repeat` of A then B.
 *
 * @param passes - Its number-repeats.
 * @returns Its value.
 */
const repeat = (passes: bigint): Value =>
  run.evaluate(
    nodeOf(
      "repeat",
      [identifier("A"), identifier("B")],
      { numberRepeats: { kind: "literal", value: passes } },
      containerType("ordered"),
    ),
  );

describe("the containers family's laws", () => {
  it.effect(
    "contains is multiset inclusion for multiple and a run for ordered (§2.11.3.17)",
    (ctx) =>
      searched(
        ctx,
        explore(
          {
            caseHang,
            coverage: noCoverage,
            draw: drawn((source): readonly [readonly Text[], readonly Text[]] => [
              members(source),
              members(source),
            ]),
            kept: [],
            literal: (pair) => Formatter.format(pair),
            oracle: {
              kind: "second-implementation",
              name: "letter counts for multiple, joined texts for ordered",
            },
            runs: CASES,
            shrink: completeShrink,
            steerEvery: 16,
            suite: "processing/containers/contains",
          },
          ([whole, part]) =>
            Effect.sync(() => {
              const scoped = runOver([
                ["multiple", whole],
                ["multiple", part],
                ["ordered", whole],
                ["ordered", part],
              ]);
              const contains = (kind: ContainerCardinality): Value =>
                scoped.evaluate(
                  nodeOf(
                    "contains",
                    [containerRead(kind, whole), containerRead(kind, part)],
                    {},
                    singleBoolean,
                  ),
                );
              assert.deepStrictEqual(
                contains("multiple"),
                single(
                  "boolean",
                  letters.every((letter) => countOf(part, letter) <= countOf(whole, letter)),
                ),
              );
              assert.deepStrictEqual(contains("ordered"), single("boolean", holdsRun(whole, part)));
            }),
        ),
      ),
  );
});

describe("the containers family's stated values", () => {
  it("multiple and ordered ignore NULLs, flatten containers, give NULL for none, and NULL where base types differ (§2.11.3.8, §2.11.3.9, reading `container-operands`)", () => {
    const identifierNull: Null = nullOf({ base: "identifier", cardinality: "single" });
    assert.deepStrictEqual(
      run.evaluate(
        nodeOf(
          "ordered",
          [
            identifier("Z"),
            literal(identifierNull),
            read("abc", { base: "identifier", cardinality: "ordered" }),
          ],
          {},
          containerType("ordered"),
        ),
      ),
      container("ordered", "identifier", [text("Z"), text("A"), text("B"), text("C")]),
    );
    assert.deepStrictEqual(
      run.evaluate(nodeOf("multiple", [literal(identifierNull)], {}, containerType("multiple"))),
      nullOf({ base: "identifier", cardinality: "multiple" }),
    );
    assert.deepStrictEqual(
      run.evaluate(
        nodeOf(
          "multiple",
          [
            identifier("A"),
            nodeOf(
              "field-value",
              [read("info", { cardinality: "record" })],
              { field: "count" },
              { kind: "dynamic" },
            ),
          ],
          {},
          containerType("multiple"),
        ),
      ),
      nullOf({ base: "identifier", cardinality: "multiple" }),
    );
  });

  it("container-size gives 0 for NULL, is-null is true for NULL alone, and member, delete and index read as QTI says (§2.11.3.32, §2.11.3.34, §2.11.3.29, §2.11.3.18, §2.11.3.6)", () => {
    const integerType: StaticType = {
      kind: "typed",
      type: { base: "integer", cardinality: "single" },
    };
    const none = read("none", { base: "identifier", cardinality: "multiple" });
    const abc = read("abc", { base: "identifier", cardinality: "ordered" });

    assert.deepStrictEqual(
      run.evaluate(nodeOf("container-size", [none], {}, integerType)),
      single("integer", 0n),
    );
    assert.deepStrictEqual(
      run.evaluate(nodeOf("container-size", [abc], {}, integerType)),
      single("integer", 3n),
    );
    assert.deepStrictEqual(
      run.evaluate(nodeOf("is-null", [none], {}, singleBoolean)),
      single("boolean", true),
    );
    assert.deepStrictEqual(
      run.evaluate(nodeOf("is-null", [abc], {}, singleBoolean)),
      single("boolean", false),
    );
    assert.deepStrictEqual(
      run.evaluate(nodeOf("member", [identifier("B"), abc], {}, singleBoolean)),
      single("boolean", true),
    );
    assert.deepStrictEqual(
      run.evaluate(nodeOf("member", [identifier("B"), none], {}, singleBoolean)),
      nullOf({ base: "boolean", cardinality: "single" }),
    );
    assert.deepStrictEqual(
      run.evaluate(nodeOf("delete", [identifier("B"), abc], {}, containerType("ordered"))),
      container("ordered", "identifier", [text("A"), text("C")]),
    );

    const index = (n: bigint): Value =>
      run.evaluate(
        nodeOf(
          "index",
          [abc],
          { n: { kind: "literal", value: n } },
          { kind: "typed", type: { base: "identifier", cardinality: "single" } },
        ),
      );
    assert.deepStrictEqual(index(1n), single("identifier", text("A")));
    assert.deepStrictEqual(index(4n), nullOf({ base: "identifier", cardinality: "single" }));
    assert.deepStrictEqual(
      run.evaluate(
        nodeOf(
          "index",
          [abc],
          {
            n: {
              kind: "variable",
              variable: ownVariable("two", { base: "integer", cardinality: "single" }),
            },
          },
          { kind: "typed", type: { base: "identifier", cardinality: "single" } },
        ),
      ),
      single("identifier", text("B")),
    );
  });

  it("field-value gives the field's value, NULL for a missing field or a non-record (reading `null-results`, item 10)", () => {
    const info = read("info", { cardinality: "record" });
    const dynamic: StaticType = { kind: "dynamic" };

    assert.deepStrictEqual(
      run.evaluate(nodeOf("field-value", [info], { field: "count" }, dynamic)),
      single("integer", 3n),
    );
    assert.deepStrictEqual(
      run.evaluate(nodeOf("field-value", [info], { field: "missing" }, dynamic)),
      nullOf({ cardinality: "record" }),
    );
  });

  it("repeat fills an ordered container number-repeats times, NULL below 1, and fails the run past the bound (§2.11.3.42, reading `engine-size-limit`)", () => {
    assert.deepStrictEqual(
      repeat(2n),
      container("ordered", "identifier", [text("A"), text("B"), text("A"), text("B")]),
    );
    assert.deepStrictEqual(repeat(0n), nullOf({ base: "identifier", cardinality: "ordered" }));

    const failures = recorder.failures.length;
    assert.deepStrictEqual(
      repeat(2n ** 40n),
      nullOf({ base: "identifier", cardinality: "ordered" }),
    );
    assert.deepStrictEqual(recorder.failures.slice(failures), [
      { bound: "container-members", kind: "computation-bound", place: 0 },
    ]);
  });
});

describe("the containers family's typing", () => {
  it("refuses a container of mixed base types and contains over durations (§2.11.3.8, reading `index-and-delete-operands`)", () => {
    assert.isFalse(
      containersOperators.multiple.typing([identifier("A"), literal(single("integer", 1n))], {}, 0)
        .ok,
    );

    const durations = read("durations", { base: "duration", cardinality: "multiple" });
    assert.isFalse(containersOperators.contains.typing([durations, durations], {}, 0).ok);
    assert.deepStrictEqual(containersOperators.ordered.typing([identifier("A")], {}, 0), {
      ok: true,
      value: containerType("ordered"),
    });
  });
});
