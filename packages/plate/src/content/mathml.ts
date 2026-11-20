/**
 * MathML: a `math` element of the item body is read as the tree of MathML elements the author
 * wrote, and the server shell writes it as MathML in the page
 * (`#plate/ui/item/contents/mathml.tsx`), where the engines lay it out natively and a screen
 * reader voices and brailles it (WCAG 1.1.1 and 1.3.1).
 *
 * The walks call the module's steps in this order: the body walk hands each `math` to
 * `normalise`, which rewrites every deprecated `mfenced` into the `mrow` and `mo` elements MathML 3
 * defines it as equivalent to (section 3.3.8), then to `parse`, which reads the tree; `redact`
 * keeps the node whole; and `copy` gives the tree itself, which the server shell writes element for
 * element in the MathML namespace, each `annotation-xml`'s content as it writes the body.
 *
 * What this module does not do, each the ruling of a reading or a stated limit:
 *
 * - It judges no rule of MathML's: the database admitted the `math` (pantry's MathML laws, reading
 *   2), and plate renders what admission accepted.
 * - It keeps attributes in no namespace only, each under the name the HTML parser reads it by:
 *   `xlink:href`, `xml:lang` and any attribute of another namespace are dropped, neither refused
 *   nor rendered (MathML 3 deprecates `xlink:href` for `href`, section 2.1.6).
 * - It adds no `aria-label` from `alttext`, which is kept as written: an ARIA label on MathML
 *   overrides the braille a screen reader generates from the formula.
 * - It neither rewrites nor styles `menclose`: MathML 3 defines no equivalent for it, so MathML Core
 *   renders it as an `mrow`.
 * - It keeps a `cn` of type `hexdouble` as written, its 16 hexadecimal digits in either case (reading
 *   R6-hexdouble in `docs/spec-readings.md`).
 * - It substitutes a `math-variable` template variable into an `mi` or `ci` only, as the information
 *   model's section 2.3.3 asks: each that names one the values hold becomes an `mn` or a `cn`
 *   holding its value (reading 206, {@link substituted}). Every other element is given as the tree
 *   holds it.
 *
 * @module
 */
import { Option } from "effect";
import type { BodyContentModule } from "#plate/content/contract.ts";
import { mathmlNamespace } from "#plate/document/source.ts";
import type { SourceAttribute, SourceChild, SourceElement } from "#plate/document/source.ts";
import type { ByLevel, ParseContext } from "#plate/interactions/contract.ts";
import type { BodyNode, Level, ModelLevel, RedactedLevel } from "#plate/model/item.ts";
import { trimXmlSpace } from "#plate/model/values.ts";

/**
 * The MathML element MathML content is read from.
 */
const element = "math";

/**
 * An attribute of a MathML element: one in no namespace, by its local name as the HTML parser reads
 * it on the rendered element ({@link readName}), so the name the validity rules check is the name
 * the server shell writes. Namespace declarations and attributes of other namespaces are not part
 * of the tree.
 */
export interface MathAttribute {
  readonly name: string;
  readonly value: string;
}

/**
 * A run of character data in a MathML element, as written.
 */
export interface MathText {
  readonly kind: "text";
  readonly text: string;
}

/**
 * A MathML element as written: its local name, its attributes and its children, each text or an
 * element. An element of another namespace below MathML is kept the same way, by its local name,
 * as the HTML parser reads it where it sits.
 *
 * @template C The node an `annotation-xml`'s content is held as, which differs between the model,
 *   the payload and the JSON form.
 */
export interface MathElement<C> {
  readonly attributes: readonly MathAttribute[];
  readonly children: readonly MathChild<C>[];
  readonly kind: "element";
  readonly local: string;
}

/**
 * An `annotation-xml` of a `semantics` element: the one place beneath MathML where QTI elements
 * are admitted (the reading "QTI elements are admitted inside `m:annotation-xml`, and nowhere else
 * beneath MathML"), so its children are read as the body walk reads the item body, a
 * `qti-printed-variable` or an HTML `p` among them as it reads them anywhere, and written the same
 * way.
 *
 * @template C The node the content is held as.
 */
export interface MathAnnotationXml<C> {
  readonly attributes: readonly MathAttribute[];
  readonly content: readonly C[];
  readonly kind: "annotation-xml";
}

/**
 * A child of a MathML element: text, an element, or an `annotation-xml`.
 *
 * @template C The node an `annotation-xml`'s content is held as.
 */
export type MathChild<C> = MathAnnotationXml<C> | MathElement<C> | MathText;

/**
 * The model node of a `math` element in the item body: the `math` element as written, an
 * `annotation-xml`'s content as body nodes.
 *
 * @template L The level of its content.
 */
export interface MathNode<L extends Level = ModelLevel> {
  readonly attributes: readonly MathAttribute[];
  readonly children: readonly MathChild<BodyNode<L>>[];
  readonly kind: "element";
  readonly local: string;
}

/**
 * A `math` element's model node at each level.
 */
interface MathByLevel extends ByLevel {
  readonly node: MathNode<this["level"]>;
}

/**
 * Report whether a source child is an element.
 *
 * @param child The child.
 * @returns Whether it is an element.
 */
const isElement = (child: SourceChild): child is SourceElement => child.kind === "element";

/**
 * Report whether a source element is one MathML element, by local name.
 *
 * @param source The element.
 * @param local The local name.
 * @returns Whether the element is in the MathML namespace with that name.
 */
const isMathml = (source: SourceElement, local: string): boolean =>
  source.namespace === mathmlNamespace && source.local === local;

/**
 * Read the value of an attribute in no namespace, or a default when the element writes none.
 *
 * @param source The element.
 * @param name The attribute's local name.
 * @param fallback The value when the element writes no such attribute.
 * @returns The value as written, or `fallback`.
 */
const attributeOr = (source: SourceElement, name: string, fallback: string): string =>
  source.attributes.find((attribute) => attribute.namespace === "" && attribute.local === name)
    ?.value ?? fallback;

/**
 * The attributes of `mfenced` that its expanded form consumes; every other attribute it carries
 * stays on the outer `mrow`, so an `id`, a `class` or a style attribute the author set keeps its
 * element.
 */
const fencedAttributes: ReadonlySet<string> = new Set(["close", "open", "separators"]);

/**
 * Construct an `mo` of an expanded `mfenced`: a fence or a separator, as MathML 3 section 3.3.8
 * marks them.
 *
 * @param role `fence` for the opening and closing fences, `separator` for a separator.
 * @param value The operator's character.
 * @returns The `mo`, carrying `fence="true"` or `separator="true"`.
 */
const operator = (role: "fence" | "separator", value: string): SourceElement => ({
  attributes: [{ local: role, namespace: "", references: [], value: "true" }],
  children: [{ kind: "text", text: value }],
  kind: "element",
  local: "mo",
  namespace: mathmlNamespace,
});

/**
 * Construct an `mrow` of an expanded `mfenced`: the row that stands for the `mfenced`, or the inner
 * row that groups two or more of its arguments.
 *
 * @param attributes The row's attributes.
 * @param children The row's children.
 * @returns The `mrow`, in the MathML namespace.
 */
const row = (
  attributes: readonly SourceAttribute[],
  children: readonly SourceChild[],
): SourceElement => ({
  attributes,
  children,
  kind: "element",
  local: "mrow",
  namespace: mathmlNamespace,
});

/**
 * Rewrite an `mfenced` into the expanded form MathML 3 section 3.3.8 defines it as equivalent to:
 * an `mrow` holding an `mo` with the `open` value (`(` by default), the arguments, and an `mo`
 * with the `close` value (`)` by default). Two or more arguments are grouped in an inner `mrow`,
 * each but the last followed by an `mo` taken in turn from the characters of `separators` (`,`
 * by default), white space in it ignored, the last one repeated for further arguments, and none
 * when it is empty; one argument stands alone between the fences, and none leaves the two fences.
 *
 * The arguments are the element's element children, each rewritten in turn; the character data
 * between them, which MathML's element content does not hold, is not an argument.
 *
 * @param source The `mfenced` element.
 * @returns Its expanded form.
 * @see https://www.w3.org/TR/MathML3/chapter3.html#presm.mfenced
 */
const expandFenced = (source: SourceElement): SourceElement => {
  const separators = attributeOr(source, "separators", ",").match(/\S/gu) ?? [];
  const kept = source.attributes.filter(
    (attribute) => !(attribute.namespace === "" && fencedAttributes.has(attribute.local)),
  );
  const separated = source.children
    .filter(isElement)
    .map(normaliseElement)
    .flatMap((argument, index) => {
      const separator =
        index === 0 ? undefined : separators.at(Math.min(index, separators.length) - 1);

      return separator === undefined ? [argument] : [operator("separator", separator), argument];
    });
  const fenced = separated.length > 1 ? [row([], separated)] : separated;

  return row(kept, [
    operator("fence", attributeOr(source, "open", "(")),
    ...fenced,
    operator("fence", attributeOr(source, "close", ")")),
  ]);
};

/**
 * Rewrite a MathML element and its descendants into the form `parse` reads: each `mfenced`, at any
 * depth, expanded ({@link expandFenced}); every other element kept, its element children
 * rewritten in turn.
 *
 * @param source The element.
 * @returns The element with no `mfenced` below it.
 */
const normaliseElement = (source: SourceElement): SourceElement => {
  if (isMathml(source, "mfenced")) {
    return expandFenced(source);
  }

  const children = source.children.map((child) =>
    isElement(child) ? normaliseElement(child) : child,
  );

  return children.every((child, index) => child === source.children[index])
    ? source
    : { ...source, children };
};

/**
 * Read an attribute's name as the HTML parser reads it on the rendered element: its ASCII capitals
 * lowercased, and `definitionurl`, the one name MathML 3 writes in camel case, adjusted back to
 * `definitionURL`. XML names are case-sensitive and HTML's are not, so a name the validity rules
 * match against MathML 3's spellings has to be the name the page will read.
 *
 * @param local The attribute's local name as written.
 * @returns The name the tree holds.
 * @see https://html.spec.whatwg.org/multipage/parsing.html#adjust-mathml-attributes
 */
const readName = (local: string): string => {
  const lowered = local.replaceAll(/[A-Z]/gu, (letter) => letter.toLowerCase());

  return lowered === "definitionurl" ? "definitionURL" : lowered;
};

/**
 * Read the attributes of a source element the tree keeps: those in no namespace, each under the
 * name the HTML parser reads ({@link readName}), with its value as written.
 *
 * @param attributes The element's attributes.
 * @returns The attributes kept, in document order.
 */
const attributesOf = (attributes: readonly SourceAttribute[]): readonly MathAttribute[] =>
  attributes.flatMap((attribute) =>
    attribute.namespace === "" ? [{ name: readName(attribute.local), value: attribute.value }] : [],
  );

/**
 * Read the children of a MathML element into the tree: text as itself, an `annotation-xml` with
 * its content read as body nodes through the kit, any other element with its own children read
 * the same way. An entity reference the reader kept unexpanded has no place in the tree and is
 * dropped; the verdict leaves a document holding one unchecked, so no item built from an accepted
 * document holds one.
 *
 * @param source The element whose children are read.
 * @param context The parse context of the `math` element.
 * @returns The children, in document order.
 */
const readChildren = (
  source: SourceElement,
  context: ParseContext,
): readonly MathChild<BodyNode>[] =>
  source.children.flatMap((child): readonly MathChild<BodyNode>[] => {
    if (child.kind === "text") {
      return [{ kind: "text", text: child.text }];
    }

    if (child.kind === "entity") {
      return [];
    }

    if (isMathml(child, "annotation-xml")) {
      return [
        {
          attributes: attributesOf(child.attributes),
          content: context.read.nodes(child),
          kind: "annotation-xml",
        },
      ];
    }

    return [
      {
        attributes: attributesOf(child.attributes),
        children: readChildren(child, context),
        kind: "element",
        local: child.local,
      },
    ];
  });

/**
 * Rewrite the content of every `annotation-xml` in a tree, keeping everything else as it is.
 *
 * @template A The content nodes read.
 * @template B The content nodes written.
 * @param node The element.
 * @param content The rewrite of an `annotation-xml`'s content.
 * @returns The element with each `annotation-xml`'s content rewritten.
 */
const mapContent = <A, B>(
  node: MathElement<A>,
  content: (nodes: readonly A[]) => readonly B[],
): MathElement<B> => ({
  ...node,
  children: node.children.map((child): MathChild<B> => {
    switch (child.kind) {
      case "annotation-xml": {
        return { ...child, content: content(child.content) };
      }
      case "element": {
        return mapContent(child, content);
      }
      case "text": {
        return child;
      }
      default: {
        return child satisfies never;
      }
    }
  }),
});

/**
 * The MathML token elements a `math-variable` template variable replaces, each keyed to the element
 * that takes its place: "all instances of 'mi' and 'ci' that match the name of the template
 * variable must be replaced by 'mn' and 'cn' respectively with the template variable's value as
 * their content" (the information model's section 2.3.3, MathML).
 */
const numberTokens: ReadonlyMap<string, string> = new Map([
  ["ci", "cn"],
  ["mi", "mn"],
]);

/**
 * Give the name a MathML token element holds: its text, when it holds text alone, without the
 * whitespace at its ends, since "All whitespace at the beginning and end of the content is
 * removed" (MathML 3, section 2.1.7).
 *
 * @template C The content nodes.
 * @param token The token element.
 * @returns The name, none when the element holds an element.
 */
const tokenName = <C>(token: MathElement<C>): Option.Option<string> => {
  const texts = token.children.flatMap((child) => (child.kind === "text" ? [child.text] : []));

  return texts.length === token.children.length
    ? Option.some(trimXmlSpace(texts.join("")))
    : Option.none();
};

/**
 * Replace each `mi` and `ci` that names a `math-variable` template variable the values hold with
 * the `mn` or `cn` holding the variable's text, its attributes kept, and nothing in it for NULL
 * (reading 206); every other element is kept, its children walked. An `annotation-xml`'s content is
 * body content, which the walk prints on its own.
 *
 * @template C The content nodes.
 * @param node The element.
 * @param text The text a name writes, none when it names no such variable
 *   (`ContentRedactKit.mathText` in `#plate/content/contract.ts`).
 * @returns The element with each such token replaced.
 */
const substituted = <C>(
  node: MathElement<C>,
  text: (name: string) => Option.Option<string>,
): MathElement<C> => ({
  ...node,
  children: node.children.map((child): MathChild<C> => {
    if (child.kind !== "element") {
      return child;
    }

    const number = numberTokens.get(child.local);
    if (number === undefined) {
      return substituted(child, text);
    }

    return Option.match(Option.flatMap(tokenName(child), text), {
      onNone: () => child,
      onSome: (value): MathChild<C> => ({
        ...child,
        children: value === "" ? [] : [{ kind: "text", text: value }],
        local: number,
      }),
    });
  }),
});

/**
 * The content of every `annotation-xml` in a tree, in document order.
 *
 * @template C The content nodes.
 * @param node The element.
 * @returns The content nodes, flattened.
 */
const contentOf = <C>(node: MathElement<C>): readonly C[] =>
  node.children.flatMap((child) => {
    switch (child.kind) {
      case "annotation-xml": {
        return child.content;
      }
      case "element": {
        return contentOf(child);
      }
      case "text": {
        return [];
      }
      default: {
        return child satisfies never;
      }
    }
  });

/**
 * The MathML module: `math` read as written, `mfenced` expanded, the tree checked against MathML
 * 3's structural rules. It adds no `aria-label` from `alttext`, and neither rewrites nor styles
 * `menclose`.
 */
export const mathmlModule: BodyContentModule<
  typeof element,
  MathByLevel,
  MathNode<RedactedLevel>
> = {
  /**
   * The content of every `annotation-xml`, which the server shell writes as it writes the body, so
   * its asset check and its heading shift read it.
   */
  content: contentOf,
  /**
   * The node itself: the page may know all of a `math` element the redaction kept.
   */
  copy: (node) => node,
  element,
  namespace: mathmlNamespace,
  /**
   * Expand every `mfenced` below the `math` element, at any depth ({@link expandFenced}); a `math`
   * holding none is given back as it is.
   */
  normalise: normaliseElement,
  /**
   * Read the `math` element into its tree, its marks recorded once. The database admitted it
   * (reading 2), so the tree is what plate renders, judged by nothing here.
   */
  parse: (source, context) => {
    context.read.markElement(source);

    const node: MathNode = {
      attributes: attributesOf(source.attributes),
      children: readChildren(source, context),
      kind: "element",
      local: source.local,
    };

    return node;
  },
  placement: "body",
  /**
   * Keep the node, each `annotation-xml`'s content walked through the kit, and each `mi` and `ci`
   * that names a `math-variable` template variable the values hold replaced by its `mn` or `cn`
   * ({@link substituted}); nothing is withheld.
   */
  redact: (node, kit) => Option.some(substituted(mapContent(node, kit.nodes), kit.mathText)),
};
