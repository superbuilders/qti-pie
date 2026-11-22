/**
 * The element and attribute readers every model build shares: finding an element's attributes,
 * children and text, and reading an attribute exactly as its XSD type reads it. A build reads only
 * a document the database admitted, so a value outside its type, an absent required attribute or
 * child, is a broken contract: {@link inadmissible} throws it as a defect, located in the document
 * being read, and no reader returns it.
 *
 * It is a leaf of the model. Its imports are only `#plate/document/source.ts`,
 * `#plate/model/values.ts` and `effect`, and it imports nothing from `item.ts`, so the item model
 * and each expression family's reader value-import it without a cycle.
 *
 * @module
 */
import { collapsed } from "@qti-pie/crust/text.ts";
import { Array as Arr, Data, Option, Result } from "effect";
import { attributePath, qtiNamespace, xmlNamespace } from "#plate/document/source.ts";
import type { SourceAttribute, SourceDocument, SourceElement } from "#plate/document/source.ts";
import type { BodyAttribute } from "#plate/model/item.ts";
import { parseLexical, trimXmlSpace } from "#plate/model/values.ts";
import type { InvalidValue, Single } from "#plate/model/values.ts";

/**
 * Throw the defect of an attribute of the document being read outside admission's contract, at
 * that attribute's path ({@link inadmissible}).
 *
 * @param attribute The attribute at fault.
 * @param fault What is wrong with it.
 * @param detail The facts the defect's message names.
 * @returns Never: it throws.
 */
export type AttributeFault = (
  attribute: SourceAttribute,
  fault: string,
  detail: Readonly<Record<string, string>>,
) => never;

/**
 * What the item model's build reads a document through: the document, and every element's path, so
 * a defect names the document and path it was found in.
 */
export interface ModelWalk {
  readonly document: SourceDocument;
  /**
   * Each element's path, keyed by the element itself. A reader builds a fresh object per element,
   * so no element sits at two places in one document.
   */
  readonly paths: ReadonlyMap<SourceElement, string>;
}

/**
 * Name an element as a feature or a path step does: its local name in the QTI namespace,
 * `{<namespace>}<local>` in any other.
 *
 * @param element The element to name.
 * @returns The element's name.
 */
export const nameOf = (element: SourceElement): string =>
  element.namespace === qtiNamespace ? element.local : `{${element.namespace}}${element.local}`;

/**
 * Name an attribute as `renders` conditions and body elements spell it.
 *
 * @param attribute The attribute to name.
 * @returns Its local name in no namespace, `xml:<local>` in the XML namespace, and none for a
 *   namespace declaration or an attribute of any other namespace.
 */
export const attributeName = (attribute: SourceAttribute): Option.Option<string> => {
  if (attribute.namespace === "") {
    return Option.some(attribute.local);
  }

  return attribute.namespace === xmlNamespace
    ? Option.some(`xml:${attribute.local}`)
    : Option.none();
};

/**
 * Find an attribute of an element by name.
 *
 * @param element The element.
 * @param name The attribute's name, `xml:` prefixed in the XML namespace.
 * @returns The attribute, or none when the element does not carry it.
 */
export const attributeOf = (element: SourceElement, name: string): Option.Option<SourceAttribute> =>
  Arr.findFirst(element.attributes, (attribute) =>
    Option.exists(attributeName(attribute), (candidate) => candidate === name),
  );

/**
 * Read an attribute's value as written.
 *
 * @param element The element.
 * @param name The attribute's name.
 * @returns The value, or none when the element does not carry the attribute.
 */
export const valueOf = (element: SourceElement, name: string): Option.Option<string> =>
  Option.map(attributeOf(element, name), (attribute) => attribute.value);

/**
 * Report whether an element is in the QTI namespace, optionally with one local name.
 *
 * @param element The element.
 * @param local The local name it must have, any when absent.
 * @returns Whether `element` is that element.
 */
export const isQti = (element: SourceElement, local?: string): boolean =>
  element.namespace === qtiNamespace && (local === undefined || element.local === local);

/**
 * Keep an element's element children.
 *
 * @param element The element.
 * @returns Its element children, in document order.
 */
export const elementsOf = (element: SourceElement): readonly SourceElement[] =>
  element.children.filter((child): child is SourceElement => child.kind === "element");

/**
 * Keep an element's QTI children of one name.
 *
 * @param element The element.
 * @param local The children's local name.
 * @returns Those children, in document order.
 */
export const childrenNamed = (element: SourceElement, local: string): readonly SourceElement[] =>
  elementsOf(element).filter((child) => isQti(child, local));

/**
 * Join an element's text children, the content of a `qti-value` or a `qti-base-value`.
 *
 * @param element The element.
 * @returns Its text, as written.
 */
export const textOf = (element: SourceElement): string =>
  element.children.flatMap((child) => (child.kind === "text" ? [child.text] : [])).join("");

/**
 * A broken invariant of a model build's own walk or parse, a defect of this module that no input
 * can cause.
 *
 * It cannot occur: every element a build reads is in its walk, and a value {@link parseLexical}
 * gave for `float` or `integer` holds that base type. It is thrown, never returned.
 */
class BuildDefect extends Data.TaggedError("BuildDefect")<{
  readonly detail: string;
}> {
  /**
   * The broken invariant, and what to do with it.
   */
  override get message(): string {
    return `${this.detail} This is a defect in buildItem; report it with the item that caused it.`;
  }
}

/**
 * Give an element's path from the build's walk.
 *
 * @param build The build.
 * @param element An element of the build's document.
 * @returns The element's path.
 */
export const pathOf = (build: ModelWalk, element: SourceElement): string => {
  const path = build.paths.get(element);
  if (path === undefined) {
    throw new BuildDefect({
      detail: `The element ${nameOf(element)} is not part of the document being built.`,
    });
  }

  return path;
};

/**
 * A document outside admission's contract: a state the database refuses (pantry's laws), such as a
 * value outside its XSD type or a required attribute or child absent. A document plate opens was
 * admitted, so this never occurs: it is thrown, never returned, a broken contract that dies loudly.
 */
export class InadmissibleDocument extends Data.TaggedError("InadmissibleDocument")<{
  readonly detail: Readonly<Record<string, string>>;
  readonly document: string;
  readonly fault: string;
  readonly path: string;
}> {
  /**
   * What the document holds that admission refuses, and where.
   */
  override get message(): string {
    const facts = Object.entries(this.detail)
      .map(([name, value]) => `${name}=${value}`)
      .join(" ");

    return `${this.document} holds ${this.fault} at ${this.path} (${facts}), which the database refuses before any host opens it. plate reads only admitted documents: report it with the document.`;
  }
}

/**
 * Throw the defect of a document outside admission's contract, at an element or attribute path.
 *
 * @param build The build, or any reader of the document, that met it.
 * @param build.document The document.
 * @param fault What is wrong, such as `missing-attribute` or `value-type`.
 * @param path Where.
 * @param detail The facts the defect's message names.
 * @returns Never: it throws {@link InadmissibleDocument}.
 */
export const inadmissible = (
  { document }: { readonly document: SourceDocument },
  fault: string,
  path: string,
  detail: Readonly<Record<string, string>>,
): never => {
  throw new InadmissibleDocument({ detail, document: document.location, fault, path });
};

/**
 * Read a value parse of an admitted document's text, which holds its type.
 *
 * @param build The build.
 * @param path The path of the element or attribute that holds the value.
 * @param parsed The parse.
 * @returns The parsed value.
 * @throws {InadmissibleDocument} When the parse failed, a value outside its type.
 */
export const typed = <A>(
  build: ModelWalk,
  path: string,
  parsed: Result.Result<A, InvalidValue>,
): A =>
  Result.getOrElse(parsed, (invalid) =>
    inadmissible(build, "value-type", path, {
      baseType: invalid.baseType,
      lexical: invalid.lexical,
    }),
  );

/**
 * Read the number a float value holds.
 *
 * @param single A value that {@link parseLexical} gave for `float`.
 * @returns Its number.
 * @throws {BuildDefect} When the value is not a float, which {@link parseLexical} never gives.
 */
export const floatOf = (single: Single): number => {
  if (single.baseType === "float") {
    return single.value;
  }

  throw new BuildDefect({ detail: `A ${single.baseType} value holds no float.` });
};

/**
 * Read the exact integer an integer value holds.
 *
 * @param single A value that {@link parseLexical} gave for `integer`.
 * @returns Its integer.
 * @throws {BuildDefect} When the value is not an integer, which {@link parseLexical} never gives.
 */
export const integerOf = (single: Single): bigint => {
  if (single.baseType === "integer") {
    return single.value;
  }

  throw new BuildDefect({ detail: `A ${single.baseType} value holds no integer.` });
};

/**
 * Read the QTI child of a name an element must hold exactly once, as the XSD requires it: the
 * child-side twin of {@link requiredAttribute}. A document the database admitted holds it, so its
 * absence is a broken contract, thrown, never a case a reader handles.
 *
 * @param build The build.
 * @param element The element.
 * @param local The child's local name.
 * @returns The child.
 */
export const requiredChild = (
  build: ModelWalk,
  element: SourceElement,
  local: string,
): SourceElement =>
  Option.match(Arr.head(childrenNamed(element, local)), {
    onNone: () =>
      inadmissible(build, "child-count", pathOf(build, element), {
        child: local,
        element: nameOf(element),
        required: "exactly one",
      }),
    onSome: (child) => child,
  });

/**
 * Read an attribute the element must carry.
 *
 * @param build The build.
 * @param element The element.
 * @param name The attribute's name.
 * @returns The attribute.
 */
export const requiredAttribute = (
  build: ModelWalk,
  element: SourceElement,
  name: string,
): SourceAttribute =>
  Option.match(attributeOf(element, name), {
    onNone: () =>
      inadmissible(build, "missing-attribute", pathOf(build, element), {
        attribute: name,
        element: nameOf(element),
      }),
    onSome: (attribute) => attribute,
  });

/**
 * Read the value of an attribute the element must carry.
 *
 * @param build The build.
 * @param element The element.
 * @param name The attribute's name.
 * @returns The value as written.
 */
export const requiredValue = (build: ModelWalk, element: SourceElement, name: string): string =>
  requiredAttribute(build, element, name).value;

/**
 * Read an identifier as its XSD type reads it.
 *
 * Every identifier the item reads is an `xs:NCName`, or an `xs:ID` or `xs:IDREF` derived from it:
 * the root's, a declaration's and a choice's `identifier`, an interaction's `response-identifier`,
 * and the `identifier` an expression or a response rule names. Their whitespace facet is
 * `collapse`, and an NCName holds no inner whitespace, so collapsing is removing the outer XML
 * whitespace. Reading 7 keeps an attribute's outer whitespace only for the base-typed attributes
 * the XSD types as strings, which no identifier is, so `" RESPONSE "` names `RESPONSE`, and
 * refusing it would refuse valid content (reading 1). The database reads these attributes the same
 * way.
 *
 * @param written The attribute's value as written.
 * @returns The identifier it names.
 */
export const identifierOf = (written: string): string => trimXmlSpace(written);

/**
 * A run of XML whitespace, which separates the tokens of an XSD list and which a collapsed value
 * reads as one space. It is global, as `replaceAll` requires; `split` ignores the flag.
 */
export const xmlWhitespaceRun = /[\t\n\r ]+/gu;

/**
 * Collapse a value's XML whitespace, as XSD's `whiteSpace="collapse"` facet reads it: the XML
 * whitespace at either end removed and each inner run of it one space. An `xs:anyURI`, an `xs:ID`,
 * an `xs:IDREF` and an `xs:token` are read this way. It is grizzle-text's `collapsed`, the one
 * implementation crust re-exports.
 */
export const collapseXmlSpace = collapsed;

/**
 * Replace a value's XML whitespace, as XSD's `whiteSpace="replace"` facet reads it: each tab, line
 * feed and carriage return becomes a space, and nothing is trimmed. An `xs:normalizedString` is
 * read this way ({@link replaceXmlSpace} of `#plate/model/values.ts`, the same function).
 */
export { replaceXmlSpace } from "#plate/model/values.ts";

/**
 * Read an identifier attribute the element must carry, as `identifierOf` reads it.
 *
 * @param build The build.
 * @param element The element.
 * @param name The attribute's name.
 * @returns The identifier.
 */
export const identifierAttribute = (
  build: ModelWalk,
  element: SourceElement,
  name: string,
): string => identifierOf(requiredAttribute(build, element, name).value);

/**
 * Read an attribute the element carries whose value is one of a closed list.
 *
 * @param build The build.
 * @param element The element.
 * @param name The attribute's name.
 * @param attribute The attribute.
 * @param allowed The values it may take.
 * @returns The value.
 */
export const listed = <const T extends string>(
  build: ModelWalk,
  element: SourceElement,
  name: string,
  attribute: SourceAttribute,
  allowed: readonly T[],
): T =>
  Option.match(
    Arr.findFirst(allowed, (value) => value === attribute.value),
    {
      onNone: () =>
        inadmissible(build, "attribute-type", attributePath(pathOf(build, element), attribute), {
          attribute: name,
          value: attribute.value,
        }),
      onSome: (value) => value,
    },
  );

/**
 * Read an attribute whose value is one of a closed list, such as `cardinality`.
 *
 * @param build The build.
 * @param element The element.
 * @param name The attribute's name.
 * @param allowed The values it may take.
 * @returns The value, none when absent.
 */
export const enumerated = <const T extends string>(
  build: ModelWalk,
  element: SourceElement,
  name: string,
  allowed: readonly T[],
): Option.Option<T> =>
  Option.map(attributeOf(element, name), (attribute) =>
    listed(build, element, name, attribute, allowed),
  );

/**
 * Read an attribute of an XSD integer type exactly: its outer whitespace goes, then it reads as a
 * QTI integer. The database holds its value to the type's range, so none is judged here.
 *
 * @param build The build.
 * @param element The element.
 * @param name The attribute's name.
 * @returns The integer, none when absent.
 * @throws {InadmissibleDocument} When the value is no integer.
 */
const xsIntegerOf = (
  build: ModelWalk,
  element: SourceElement,
  name: string,
): Option.Option<bigint> =>
  Option.map(attributeOf(element, name), (attribute) =>
    integerOf(
      typed(
        build,
        attributePath(pathOf(build, element), attribute),
        parseLexical("integer", trimXmlSpace(attribute.value)),
      ),
    ),
  );

/**
 * Read an `xs:int` attribute, such as `base`, through {@link xsIntegerOf}.
 *
 * @param build The build.
 * @param element The element.
 * @param name The attribute's name.
 * @returns The number, none when absent.
 */
export const xsInt = (
  build: ModelWalk,
  element: SourceElement,
  name: string,
): Option.Option<number> => Option.map(xsIntegerOf(build, element, name), Number);

/**
 * Read a count attribute, an `xs:nonNegativeInteger` such as `max-choices`, exactly through
 * {@link xsIntegerOf}, at any size. Reading 46 holds eight of the counts to the signed 64-bit
 * range, which the database judges for all eight, so the model holds what it reads.
 *
 * @param build The build.
 * @param element The element.
 * @param name The attribute's name.
 * @returns The count, none when absent.
 */
export const countAttribute = (
  build: ModelWalk,
  element: SourceElement,
  name: string,
): Option.Option<bigint> => xsIntegerOf(build, element, name);

/**
 * Read an `xs:boolean` attribute value as XSD does (XML Schema Part 2 §3.2.2.1): its outer
 * whitespace goes, then `true` or `1` is true and `false` or `0` is false.
 *
 * @param written The value as written.
 * @returns The boolean, or none when the value is outside `xs:boolean`'s lexical space.
 */
export const xsBooleanOf = (written: string): Option.Option<boolean> => {
  const lexical = trimXmlSpace(written);
  if (lexical === "true" || lexical === "1") {
    return Option.some(true);
  }

  return lexical === "false" || lexical === "0" ? Option.some(false) : Option.none();
};

/**
 * Read an attribute an element carries as an `xs:boolean`, through {@link xsBooleanOf}.
 *
 * @param build The build.
 * @param element The element.
 * @param attribute The attribute.
 * @returns The boolean.
 */
const booleanValue = (
  build: ModelWalk,
  element: SourceElement,
  attribute: SourceAttribute,
): boolean =>
  Option.match(xsBooleanOf(attribute.value), {
    onNone: () =>
      inadmissible(build, "value-type", attributePath(pathOf(build, element), attribute), {
        baseType: "boolean",
        lexical: attribute.value,
      }),
    onSome: (value) => value,
  });

/**
 * Read an `xs:boolean` attribute, such as `shuffle`, through {@link xsBooleanOf}.
 *
 * @param build The build.
 * @param element The element.
 * @param name The attribute's name.
 * @param absent The value when the element does not carry it, the XSD's default.
 * @returns The boolean.
 */
export const xsBoolean = (
  build: ModelWalk,
  element: SourceElement,
  name: string,
  absent: boolean,
): boolean =>
  Option.match(attributeOf(element, name), {
    onNone: () => absent,
    onSome: (attribute) => booleanValue(build, element, attribute),
  });

/**
 * Read an `xs:double` typed-value attribute, a mapping's or an area mapping's `default-value`,
 * `lower-bound` or `upper-bound`, as the XSD reads it: its outer whitespace goes, since
 * `xs:double`'s whitespace facet is `collapse` and a double holds no inner whitespace (XML Schema
 * Part 2 §4.3.6), then it reads as a QTI float.
 *
 * @param build The build.
 * @param element The element.
 * @param name The attribute's name.
 * @returns The number, none when absent.
 */
export const floatAttribute = (
  build: ModelWalk,
  element: SourceElement,
  name: string,
): Option.Option<number> =>
  Option.map(attributeOf(element, name), (attribute) =>
    floatOf(
      typed(
        build,
        attributePath(pathOf(build, element), attribute),
        parseLexical("float", trimXmlSpace(attribute.value)),
      ),
    ),
  );

/**
 * One coordinate as `CoordsDType` writes it: decimal digits, then `%` or nothing.
 */
const coordinate = /^(?<digits>[0-9]+)%?$/u;

/**
 * Read the required `coords` of a `qti-area-map-entry` or a `qti-inside`, each coordinate's digits
 * as `xs:double` reads them. How many coordinates a value holds is the database's, which
 * admits only `CoordsDType`.
 *
 * @param build The build.
 * @param element The element that carries the `coords`.
 * @returns Each coordinate's number and whether it is written with `%`, in written order.
 */
export const coordsOf = (
  build: ModelWalk,
  element: SourceElement,
): readonly (readonly [number, boolean])[] => {
  const attribute = requiredAttribute(build, element, "coords");
  const path = attributePath(pathOf(build, element), attribute);
  const coords: (readonly [number, boolean])[] = [];

  for (const written of attribute.value.split(",")) {
    const digits = coordinate.exec(written)?.groups?.["digits"];
    if (digits === undefined) {
      return inadmissible(build, "attribute-type", path, {
        attribute: "coords",
        value: attribute.value,
      });
    }

    const single = typed(build, path, parseLexical("float", digits));
    coords.push([floatOf(single), written.endsWith("%")]);
  }

  return coords;
};

/**
 * Read an `xs:double` attribute as the XSD reads it, by reading 7 and reading 144: outer whitespace
 * goes, then the literal reads as its IEEE double, rounded to nearest by XML Schema 1.1's
 * doubleLexicalMap (Part 2 §3.3.5.2), so one beyond the largest finite double is an infinity of its
 * sign.
 *
 * @param element The element.
 * @param name The attribute's name.
 * @param refuse The reader's defect of an attribute.
 * @returns The number, none when absent.
 */
export const doubleAttribute = (
  element: SourceElement,
  name: string,
  refuse: AttributeFault,
): Option.Option<number> =>
  Option.map(attributeOf(element, name), (attribute) => {
    const lexical = trimXmlSpace(attribute.value);

    return floatOf(
      Result.getOrElse(parseLexical("float", lexical), () =>
        refuse(attribute, "value-type", { baseType: "xs:double", lexical }),
      ),
    );
  });

/**
 * Read one attribute of a body element, as the model or the redacted body holds its attributes
 * (`BodyAttribute` in `#plate/model/item.ts`): the one reader of such a list, so no module,
 * content walk or island searches one.
 *
 * @param attributes The element's attributes.
 * @param name The attribute's name.
 * @returns Its value as written, none when the element does not carry it.
 */
export const bodyAttributeOf = (
  attributes: readonly BodyAttribute[],
  name: string,
): Option.Option<string> =>
  Option.fromUndefinedOr(attributes.find((attribute) => attribute.name === name)?.value);
