import { assert, describe, it } from "@effect/vitest";
import {
  container,
  isText,
  nullOf,
  recordOf,
  sameScalar,
  sameValueType,
  valueTypeOf,
  single,
  textValue,
} from "#processing/value.ts";
import type { Text } from "#processing/value.ts";

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
