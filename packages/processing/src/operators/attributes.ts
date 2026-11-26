/**
 * The readers of an operator's attributes that every family shares: a boolean with its default, an
 * enumeration with its default, a required name, and the attributes that may name a variable.
 *
 * Every document was admitted by pantry, so an attribute the XSD requires is written and its value
 * is in its lexical space; a reader refuses (`attribute`) only where that does not hold.
 *
 * @module
 */
import type { LiteralOr } from "#processing/ir.ts";
import { readBoolean, readDouble, readInteger } from "#processing/lexical.ts";
import { checked, refused } from "#processing/operators/operator.ts";
import type { Checked, CompileContext } from "#processing/operators/operator.ts";
import { attributeOf, collapseXmlSpace } from "#processing/xml.ts";
import type { XmlElement } from "#processing/xml.ts";

/**
 * A boolean attribute (reading 34: `true`, `false`, `1`, `0`), or its default where unwritten.
 *
 * @param element - The element.
 * @param name - The attribute.
 * @param fallback - Its default, QTI's.
 * @param place - The element's place.
 * @returns The boolean.
 */
export const booleanAttribute = (
  element: XmlElement,
  name: string,
  fallback: boolean | undefined,
  place: number,
): Checked<boolean> => {
  const written = attributeOf(element, name);
  if (written === undefined) {
    return fallback === undefined
      ? refused("attribute", place, `write the required boolean attribute ${name}`)
      : checked(fallback);
  }

  const value = readBoolean(collapseXmlSpace(written));

  return value === undefined
    ? refused("attribute", place, `write ${name} as true or false`)
    : checked(value);
};

/**
 * An enumerated attribute, or its default where unwritten.
 *
 * @param element - The element.
 * @param name - The attribute.
 * @param values - Its values.
 * @param fallback - Its default, or `undefined` where the XSD requires it.
 * @param place - The element's place.
 * @returns The value.
 */
export const enumAttribute = <const V extends string>(
  element: XmlElement,
  name: string,
  values: readonly V[],
  fallback: V | undefined,
  place: number,
): Checked<V> => {
  const written = attributeOf(element, name);
  if (written === undefined) {
    return fallback === undefined
      ? refused("attribute", place, `write the required attribute ${name}`)
      : checked(fallback);
  }

  const value = values.find((each) => each === collapseXmlSpace(written));

  return value === undefined
    ? refused("attribute", place, `write ${name} as one of ${values.join(", ")}`)
    : checked(value);
};

/**
 * A required name attribute (an identifier), collapsed.
 *
 * @param element - The element.
 * @param name - The attribute.
 * @param place - The element's place.
 * @returns The name.
 */
export const nameAttribute = (
  element: XmlElement,
  name: string,
  place: number,
): Checked<string> => {
  const written = attributeOf(element, name);
  const value = written === undefined ? "" : collapseXmlSpace(written);

  return value === ""
    ? refused("attribute", place, `write the required attribute ${name}`)
    : checked(value);
};

/**
 * An optional name attribute, collapsed.
 *
 * @param element - The element.
 * @param name - The attribute.
 * @returns The name, or `undefined` where unwritten or empty.
 */
export const optionalName = (element: XmlElement, name: string): string | undefined => {
  const written = attributeOf(element, name);
  const value = written === undefined ? "" : collapseXmlSpace(written);

  return value === "" ? undefined : value;
};

/**
 * A space-separated list attribute, collapsed into its tokens.
 *
 * @param element - The element.
 * @param name - The attribute.
 * @returns Its tokens, none where unwritten.
 */
export const listAttribute = (element: XmlElement, name: string): readonly string[] => {
  const written = attributeOf(element, name);

  return written === undefined
    ? []
    : collapseXmlSpace(written)
        .split(" ")
        .filter((token) => token !== "");
};

/**
 * The variable a reference attribute names, refused where it names none.
 *
 * @param context - The document's declarations.
 * @param identifier - The name.
 * @param place - The element's place.
 * @returns The literal that stands for the variable.
 */
const variableNamed = <A>(
  context: CompileContext,
  identifier: string,
  place: number,
): Checked<LiteralOr<A>> => {
  const variable = context.variable(identifier);

  return variable === undefined
    ? refused("unknown-identifier", place, `declare the variable ${identifier} the attribute names`)
    : checked({ kind: "variable", variable });
};

/**
 * An attribute that is an integer or names a variable (`integerOrVariableRef`): by the XSD union's
 * order an integer first, so any other value names a variable. Where unwritten, its default.
 *
 * @param element - The element.
 * @param name - The attribute.
 * @param fallback - Its default, or `undefined` where the XSD requires it.
 * @param context - The document's declarations.
 * @param place - The element's place.
 * @returns The attribute.
 */
export const integerOrVariable = (
  element: XmlElement,
  name: string,
  fallback: bigint | undefined,
  context: CompileContext,
  place: number,
): Checked<LiteralOr<bigint>> => {
  const written = attributeOf(element, name);
  if (written === undefined) {
    return fallback === undefined
      ? refused("attribute", place, `write the required attribute ${name}`)
      : checked({ kind: "literal", value: fallback });
  }

  const lexical = collapseXmlSpace(written);
  const value = readInteger(lexical);

  return value === undefined
    ? variableNamed(context, lexical, place)
    : checked({ kind: "literal", value });
};

/**
 * An attribute that is a float or names a variable (`floatOrVariableRef`): an `xs:double` first, so
 * `INF` and `NaN` are literals, and any other value names a variable.
 *
 * @param written - The attribute's value, or one token of a list.
 * @param context - The document's declarations.
 * @param place - The element's place.
 * @returns The attribute.
 */
export const floatOrVariable = (
  written: string,
  context: CompileContext,
  place: number,
): Checked<LiteralOr<number>> => {
  const lexical = collapseXmlSpace(written);
  const value = readDouble(lexical);

  return value === undefined
    ? variableNamed(context, lexical, place)
    : checked({ kind: "literal", value });
};

/**
 * An attribute that is a string or names a variable (`stringOrVariableRef`): a value that is
 * exactly `{name}`, where `name` names a declared variable, is a reference; any other value is
 * literal text as written, braces kept (§2.7.2, reading 58).
 *
 * @param written - The attribute's value.
 * @param context - The document's declarations.
 * @returns The attribute.
 */
export const stringOrVariable = (written: string, context: CompileContext): LiteralOr<string> => {
  const braced = written.startsWith("{") && written.endsWith("}");
  const variable = braced ? context.variable(written.slice(1, -1)) : undefined;

  return variable === undefined
    ? { kind: "literal", value: written }
    : { kind: "variable", variable };
};
