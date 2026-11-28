import { assert, describe, it } from "@effect/vitest";
import {
  container,
  isText,
  nullOf,
  recordOf,
  sameScalar,
  sameSingle,
  sameValueType,
  valueTypeOf,
  single,
  singleKey,
  textValue,
} from "#processing/value.ts";
import type { Single, Text } from "#processing/value.ts";
import { everyMember } from "#processing/test/exhausted.ts";

/**
 * A text the tests know is not empty.
 *
 * @param written - The text.
 * @returns It, as a Text.
 */
const text = (written: string): Text => {
  assert.isTrue(isText(written));

  return isText(written) ? written : assert.fail("empty text");
};

describe("values", () => {
  it("an empty string, identifier or URI is NULL of its single type (§2.2.2)", () => {
    assert.deepStrictEqual(
      textValue("string", ""),
      nullOf({ base: "string", cardinality: "single" }),
    );
    assert.deepStrictEqual(
      textValue("identifier", ""),
      nullOf({ base: "identifier", cardinality: "single" }),
    );
    assert.deepStrictEqual(textValue("uri", ""), nullOf({ base: "uri", cardinality: "single" }));
    assert.deepStrictEqual(textValue("string", " "), single("string", text(" ")));
  });

  it("an empty container is NULL of its type, and a non-empty one keeps its order", () => {
    assert.deepStrictEqual(
      container("multiple", "integer", []),
      nullOf({ base: "integer", cardinality: "multiple" }),
    );
    assert.deepStrictEqual(container("ordered", "integer", [2n, 1n, 2n]), {
      base: "integer",
      kind: "ordered",
      values: [2n, 1n, 2n],
    });
  });

  it("a record with no field is the NULL record, and a later field of a name replaces one (reading `record-without-base-type`)", () => {
    assert.deepStrictEqual(recordOf([]), nullOf({ cardinality: "record" }));

    const record = recordOf([
      { name: "b", value: single("integer", 1n) },
      { name: "a", value: single("boolean", true) },
      { name: "b", value: single("integer", 2n) },
    ]);
    assert.deepStrictEqual(record, {
      fields: [
        { name: "a", value: single("boolean", true) },
        { name: "b", value: single("integer", 2n) },
      ],
      kind: "record",
    });
    assert.deepStrictEqual(valueTypeOf(record), { cardinality: "record" });
  });

  it("a NULL keeps the type it was made with", () => {
    const declared = { base: "float", cardinality: "ordered" } as const;
    assert.isTrue(sameValueType(valueTypeOf(nullOf(declared)), declared));
    assert.isFalse(sameValueType(declared, { base: "float", cardinality: "multiple" }));
    assert.isFalse(sameValueType(declared, { cardinality: "record" }));
  });

  it("compares scalars as qti-match compares members: a pair unordered, NaN unmatched, −0 as 0 (§8.14)", () => {
    const [a, b] = [text("A"), text("B")];
    assert.isTrue(sameScalar("pair", { first: a, second: b }, { first: b, second: a }));
    assert.isFalse(sameScalar("directedPair", { source: a, target: b }, { source: b, target: a }));
    assert.isTrue(sameScalar("directedPair", { source: a, target: b }, { source: a, target: b }));
    assert.isFalse(sameScalar("float", Number.NaN, Number.NaN));
    assert.isTrue(sameScalar("float", -0, 0));
    assert.isTrue(sameScalar("integer", 2n ** 80n, 2n ** 80n));
    assert.isTrue(sameScalar("point", { x: 1n, y: 2n }, { x: 1n, y: 2n }));
    assert.isFalse(sameScalar("point", { x: 1n, y: 2n }, { x: 2n, y: 1n }));

    const file = { bytes: new Uint8Array([1, 2]), contentType: text("text/plain"), name: a };
    assert.isTrue(sameScalar("file", file, { ...file, bytes: new Uint8Array([1, 2]) }));
    assert.isFalse(sameScalar("file", file, { ...file, name: undefined }));
    assert.isFalse(sameScalar("file", file, { ...file, bytes: new Uint8Array([1, 3]) }));
  });
});

/**
 * Text, which must not be empty.
 *
 * @param written - The text.
 * @returns It, as a Text.
 */
const keyText = (written: string): Text => (isText(written) ? written : assert.fail("empty text"));

/**
 * Singles of every base type at sameness's edges: −0 beside 0, NaN, a pair either way round, a
 * directed pair reversed, one text under three base types, a file with no name beside one named.
 */
const keyed: readonly [Single, ...Single[]] = [
  single("float", 0),
  single("float", -0),
  single("float", Number.NaN),
  single("float", 1.5),
  single("duration", 0),
  single("duration", Number.NaN),
  single("integer", 0n),
  single("integer", 1n),
  single("boolean", true),
  single("boolean", false),
  single("identifier", keyText("a")),
  single("string", keyText("a")),
  single("uri", keyText("a")),
  single("identifier", keyText("b")),
  single("pair", { first: keyText("a"), second: keyText("b") }),
  single("pair", { first: keyText("b"), second: keyText("a") }),
  single("pair", { first: keyText("a"), second: keyText("c") }),
  single("directedPair", { source: keyText("a"), target: keyText("b") }),
  single("directedPair", { source: keyText("b"), target: keyText("a") }),
  single("point", { x: 1n, y: 2n }),
  single("point", { x: 2n, y: 1n }),
  single("file", {
    bytes: new Uint8Array([1]),
    contentType: keyText("text/plain"),
    name: undefined,
  }),
];

/**
 * Every ordered pair of a list's members, itself with itself too.
 *
 * @param members - The members.
 * @returns The pairs.
 */
const pairsOf = <A>(members: readonly [A, ...A[]]): readonly [[A, A], ...[A, A][]] => {
  const [first] = members;
  const pairs: [[A, A], ...[A, A][]] = [[first, first]];
  for (const left of members) {
    for (const right of members) {
      if (left !== first || right !== first) {
        pairs.push([left, right]);
      }
    }
  }

  return pairs;
};

describe("a single's key", () => {
  it.effect(
    "is another single's exactly where qti-match holds them the same, and none for a single that matches nothing",
    (ctx) =>
      everyMember(
        ctx,
        {
          box: "singles of every base type at sameness's edges",
          members: pairsOf(keyed),
          oracle: "sameSingle, qti-match's sameness (§5.84; reading `match-multiset`)",
          suite: "processing/value/single-key",
        },
        ([member, other]) => {
          const key = singleKey(member);
          assert.strictEqual(key === undefined, !sameSingle(member, member));
          assert.strictEqual(
            key !== undefined && key === singleKey(other),
            sameSingle(member, other),
          );
        },
      ),
  );
});
