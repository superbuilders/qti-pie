/**
 * The attribute readers of `#plate/model/attributes.ts` as a module's `parse` is handed them: each
 * reader that takes the model walk bound to it, the pure ones as they are, in one object the item
 * model builds for each element it hands a module.
 *
 * An interaction module reads its element through this kit, which `#plate/model/item.ts` hands its
 * `parse`, so it never holds the walk itself. The kit's members are typed from the readers
 * themselves, so a reader that changes changes the kit with it.
 *
 * @module
 */
import type { Option, Result } from "effect";
import type { SourceAttribute, SourceElement } from "#plate/document/source.ts";
import {
  attributeOf,
  childrenNamed,
  coordsOf,
  countAttribute,
  doubleAttribute,
  elementsOf,
  enumerated,
  floatAttribute,
  floatOf,
  identifierAttribute,
  identifierOf,
  inadmissible,
  integerOf,
  isQti,
  listed,
  nameOf,
  pathOf,
  requiredAttribute,
  requiredChild,
  requiredValue,
  textOf,
  typed,
  valueOf,
  xsBoolean,
  xsBooleanOf,
  xsInt,
} from "#plate/model/attributes.ts";
import type { ModelWalk } from "#plate/model/attributes.ts";
import type { InvalidValue } from "#plate/model/values.ts";

/**
 * A reader of `#plate/model/attributes.ts` with its model walk bound: the same arguments but the
 * first, the same result.
 *
 * @template F The reader.
 */
export type Bound<F> = F extends (walk: ModelWalk, ...rest: infer R) => infer O
  ? (...rest: R) => O
  : never;

/**
 * The attribute readers a module's `parse` reads its element with, each named and typed as
 * `#plate/model/attributes.ts` names and types it, the ones that take the model walk bound to the
 * build's. The generic readers (`enumerated`, `listed`, `typed`) keep their type parameters, which
 * {@link Bound} cannot carry.
 */
export interface AttributeReaders {
  readonly attributeOf: typeof attributeOf;
  readonly childrenNamed: typeof childrenNamed;
  readonly coordsOf: Bound<typeof coordsOf>;
  readonly countAttribute: Bound<typeof countAttribute>;
  readonly doubleAttribute: typeof doubleAttribute;
  readonly elementsOf: typeof elementsOf;
  /**
   * Read an attribute whose XSD type is a string enumeration, none when the element does not carry
   * it, as `enumerated` reads one.
   *
   * @param element The element.
   * @param name The attribute's name.
   * @param allowed The values the XSD enumerates.
   * @returns The value, none when absent.
   */
  readonly enumerated: <const T extends string>(
    element: SourceElement,
    name: string,
    allowed: readonly T[],
  ) => Option.Option<T>;
  readonly floatAttribute: Bound<typeof floatAttribute>;
  readonly floatOf: typeof floatOf;
  readonly identifierAttribute: Bound<typeof identifierAttribute>;
  readonly identifierOf: typeof identifierOf;
  readonly inadmissible: Bound<typeof inadmissible>;
  readonly integerOf: typeof integerOf;
  readonly isQti: typeof isQti;
  /**
   * Read an attribute the element carries against the values the XSD lists for it, as `listed`
   * reads one.
   *
   * @param element The element.
   * @param name The attribute's name.
   * @param attribute The attribute, as `attributeOf` found it.
   * @param allowed The values the XSD lists.
   * @returns The value.
   */
  readonly listed: <const T extends string>(
    element: SourceElement,
    name: string,
    attribute: SourceAttribute,
    allowed: readonly T[],
  ) => T;
  readonly nameOf: typeof nameOf;
  readonly pathOf: Bound<typeof pathOf>;
  readonly requiredAttribute: Bound<typeof requiredAttribute>;
  readonly requiredChild: Bound<typeof requiredChild>;
  readonly requiredValue: Bound<typeof requiredValue>;
  readonly textOf: typeof textOf;
  /**
   * Read a value parse of the admitted document's text, as `typed` does.
   *
   * @param path The path of the element or attribute that holds the value.
   * @param parsed The parse.
   * @returns The parsed value; a failed parse throws `InadmissibleDocument`.
   */
  readonly typed: <A>(path: string, parsed: Result.Result<A, InvalidValue>) => A;
  readonly valueOf: typeof valueOf;
  readonly xsBoolean: Bound<typeof xsBoolean>;
  readonly xsBooleanOf: typeof xsBooleanOf;
  readonly xsInt: Bound<typeof xsInt>;
}

/**
 * Bind the attribute readers to one model walk.
 *
 * @param walk The walk of the document being read.
 * @returns The readers, each one that takes the walk bound to it.
 */
export const readersOf = (walk: ModelWalk): AttributeReaders => ({
  attributeOf,
  childrenNamed,
  coordsOf: (element) => coordsOf(walk, element),
  countAttribute: (element, name) => countAttribute(walk, element, name),
  doubleAttribute,
  elementsOf,
  enumerated: (element, name, allowed) => enumerated(walk, element, name, allowed),
  floatAttribute: (element, name) => floatAttribute(walk, element, name),
  floatOf,
  identifierAttribute: (element, name) => identifierAttribute(walk, element, name),
  identifierOf,
  inadmissible: (fault, path, detail) => inadmissible(walk, fault, path, detail),
  integerOf,
  isQti,
  listed: (element, name, attribute, allowed) => listed(walk, element, name, attribute, allowed),
  nameOf,
  pathOf: (element) => pathOf(walk, element),
  requiredAttribute: (element, name) => requiredAttribute(walk, element, name),
  requiredChild: (element, local) => requiredChild(walk, element, local),
  requiredValue: (element, name) => requiredValue(walk, element, name),
  textOf,
  typed: (path, parsed) => typed(walk, path, parsed),
  valueOf,
  xsBoolean: (element, name, absent) => xsBoolean(walk, element, name, absent),
  xsBooleanOf,
  xsInt: (element, name) => xsInt(walk, element, name),
});
