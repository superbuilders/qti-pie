/**
 * The digest of the values a grade read: SHA-256 over one canonical encoding of them, so the proof
 * of a grade names exactly the values it graded and two reads of the same values agree on every
 * host.
 *
 * The encoding: each variable by identifier in code-unit order, its identifier and its value
 * length-prefixed; a value its kind, type and members, a float by its IEEE 754 bits (so −0 and 0
 * differ and NaN is one NaN), an integer in decimal, a text length-prefixed, a file by its octets,
 * type and name.
 *
 * @module
 */
import type { Digest } from "#processing/graded.ts";
import { hexOf, sha256, utf8Bytes } from "#processing/sha256.ts";
import { singlesOf } from "#processing/value.ts";
import type { Single, Value, ValueType } from "#processing/value.ts";

/**
 * Text, length-prefixed by its UTF-16 code units.
 *
 * @param text - The text.
 * @returns Its encoding.
 */
export const framed = (text: string): string => `${String(text.length)}:${text}`;

/**
 * A double's IEEE 754 bits, as hexadecimal.
 *
 * @param float - The double.
 * @returns Its bits.
 */
export const bitsOf = (float: number): string => {
  const view = new DataView(new ArrayBuffer(8));
  view.setFloat64(0, Number.isNaN(float) ? Number.NaN : float);

  return view.getBigUint64(0).toString(16).padStart(16, "0");
};

/**
 * A single's encoding.
 *
 * @param member - The single.
 * @returns Its encoding.
 */
const singleText = (member: Single): string => {
  switch (member.base) {
    case "boolean": {
      return member.value ? "1" : "0";
    }
    case "integer": {
      return member.value.toString(10);
    }
    case "float":
    case "duration": {
      return bitsOf(member.value);
    }
    case "identifier":
    case "string":
    case "uri": {
      return framed(member.value);
    }
    case "pair": {
      const [first, second] = [member.value.first, member.value.second].toSorted();

      return framed(first ?? "") + framed(second ?? "");
    }
    case "directedPair": {
      return framed(member.value.source) + framed(member.value.target);
    }
    case "point": {
      return `${member.value.x.toString(10)},${member.value.y.toString(10)}`;
    }
    case "file": {
      return (
        framed(hexOf(member.value.bytes)) +
        framed(member.value.contentType) +
        framed(member.value.name ?? "")
      );
    }
  }
};

/**
 * A type's encoding.
 *
 * @param type - The type.
 * @returns Its encoding.
 */
const typeText = (type: ValueType): string =>
  type.cardinality === "record" ? "record" : `${type.cardinality}/${type.base}`;

/**
 * A value's encoding.
 *
 * @param value - The value.
 * @returns Its encoding.
 */
export const valueText = (value: Value): string => {
  switch (value.kind) {
    case "null": {
      return `null(${typeText(value.type)})`;
    }
    case "single": {
      return `single/${value.base}(${singleText(value)})`;
    }
    case "multiple":
    case "ordered": {
      return `${value.kind}/${value.base}(${singlesOf(value).map(singleText).map(framed).join("")})`;
    }
    case "record": {
      return `record(${value.fields.map((field) => framed(field.name) + framed(valueText(field.value))).join("")})`;
    }
  }
};

/**
 * Variables' values' encoding: each by identifier in code-unit order.
 *
 * @param values - The values, by identifier.
 * @returns Their encoding.
 */
export const valuesText = (values: ReadonlyMap<string, Value>): string =>
  [...values]
    .toSorted(([left], [right]) => (left < right ? -1 : 1))
    .map(([identifier, value]) => framed(identifier) + framed(valueText(value)))
    .join("");

/**
 * Every field of a record, each already encoded, which a {@link Fields} of its type names in full.
 */
export type Fields<T> = { readonly [K in keyof T]-?: string };

/**
 * A record's encoding from its fields' encodings: each by name in code-unit order.
 *
 * @param fields - The encoded fields.
 * @returns The encoding.
 */
export const fieldsText = (fields: Readonly<Record<string, string>>): string =>
  Object.entries(fields)
    .toSorted(([left], [right]) => (left < right ? -1 : 1))
    .map(([name, text]) => framed(name) + framed(text))
    .join("");

/**
 * The digest of an encoding.
 *
 * @param text - The encoding.
 * @returns Its SHA-256.
 */
export const textDigest = (text: string): Digest => ({ sha256: hexOf(sha256(utf8Bytes(text))) });

/**
 * The digest of variables' values.
 *
 * @param values - The values, by identifier.
 * @returns The SHA-256 of their canonical encoding.
 */
export const valuesDigest = (values: ReadonlyMap<string, Value>): Digest =>
  textDigest(valuesText(values));
