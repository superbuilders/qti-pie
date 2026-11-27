/**
 * A printed variable's integer attribute that may name a variable, `base` and `index` of
 * `qti-printed-variable` (the information model's `integerOrVariableRef`): {@link IntegerOrRef},
 * with its one classifier, {@link integerOrRefOf}.
 *
 * @module
 */
import { parseLexical, trimXmlSpace } from "#plate/model/values.ts";

/**
 * An integer attribute that may name a variable: a `literal`, an exact integer at any size (reading
 * `integer-unbounded`), or a `ref`, the identifier of the single integer outcome or template
 * variable whose value stands in for it where the page prints it.
 *
 * @see https://www.imsglobal.org/spec/qti/v3p0/info#IT_Use
 */
export type IntegerOrRef =
  | { readonly _tag: "literal"; readonly value: bigint }
  | { readonly _tag: "ref"; readonly identifier: string };

/**
 * Classify an integer attribute's value as the XSD's union of an integer type and a variable's name
 * reads it, by the union's order: the integer first, so an integer is a literal, exact at any size,
 * and anything else is a reference. So `INF` and `NaN`, which are no integer, name variables.
 *
 * The integer member collapses whitespace and an integer holds no inner whitespace, so its outer
 * XML whitespace goes before it is read. A name holds no whitespace, so the same trim leaves a
 * valid name as written. A value outside both members never reaches a classifier on a checked
 * item; it is a reference to the trimmed text. The attribute's range is the database's, not this
 * function's.
 *
 * @param written The attribute's value as written.
 * @returns The literal or the reference it holds.
 */
export const integerOrRefOf = (written: string): IntegerOrRef => {
  const lexical = trimXmlSpace(written);
  const parsed = parseLexical("integer", lexical);

  return parsed._tag === "Success" && parsed.success.baseType === "integer"
    ? { _tag: "literal", value: parsed.success.value }
    : { _tag: "ref", identifier: lexical };
};
