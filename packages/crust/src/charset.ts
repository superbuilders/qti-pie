import { compareCodePoints } from "@bjornpagen/grizzle-text/text";
import { Array as Arr, Option, Order, Result } from "effect";
import { EncodeError, WriteRefusal } from "#crust/errors.ts";
import type { CharRule, MiscHolder } from "#crust/errors.ts";
import { preorder } from "#crust/tour.ts";
import { isReservedTarget, nameViolation } from "#crust/names.ts";
import type { Child, Element, Misc, PrologNode, XmlDocument } from "#crust/tree.ts";

/**
 * How a label's characters become bytes: `decode-only` marks a label the reader can decode but the
 * writer cannot encode.
 *
 * Each of UTF-16's three Unicode encoding schemes is its own class, because each begins its bytes
 * differently (Unicode 16.0 section 3.10, D96 to D98): `utf16` is the UTF-16 scheme, which an XML
 * document begins with a byte order mark (XML 1.0 section 4.3.3), and `utf16be` and `utf16le` are
 * UTF-16BE and UTF-16LE, which never begin with one, an initial `FE FF` or `FF FE` being the
 * character U+FEFF (RFC 2781 sections 3.3, 4.1 and 4.2).
 */
export type EncoderClass =
  | "utf8"
  | "utf16"
  | "utf16be"
  | "utf16le"
  | "latin1"
  | "ascii"
  | "decode-only";

/**
 * The labels XML 1.0 section 4.3.3 lets a document declare that this package can both decode and
 * encode, grouped by the IANA name they share.
 *
 * Every other label is `decode-only`: the reader admits it when a `TextDecoder` knows it, and the
 * writer never encodes it.
 */
const groups: readonly {
  readonly aliases: readonly string[];
  readonly canonical: string;
  readonly class: EncoderClass;
}[] = [
  { aliases: [], canonical: "UTF-8", class: "utf8" },
  { aliases: [], canonical: "UTF-16", class: "utf16" },
  { aliases: [], canonical: "UTF-16LE", class: "utf16le" },
  { aliases: [], canonical: "UTF-16BE", class: "utf16be" },
  {
    aliases: [
      "ISO8859-1",
      "ISO_8859-1",
      "latin1",
      "l1",
      "IBM819",
      "CP819",
      "csISOLatin1",
      "iso-ir-100",
    ],
    canonical: "ISO-8859-1",
    class: "latin1",
  },
  {
    aliases: [
      "ASCII",
      "ANSI_X3.4-1968",
      "ANSI_X3.4-1986",
      "ISO646-US",
      "us",
      "IBM367",
      "cp367",
      "csASCII",
    ],
    canonical: "US-ASCII",
    class: "ascii",
  },
];

/**
 * The label table keyed by lower-cased label, because XML 1.0 section 4.3.3 compares encoding names
 * case-insensitively.
 */
const table: ReadonlyMap<string, EncoderClass> = new Map(
  groups.flatMap(({ aliases, canonical, class: encoderClass }) =>
    [canonical, ...aliases].map((label) => [label.toLowerCase(), encoderClass]),
  ),
);

/**
 * Classify an XML encoding label by the encoder that can write it.
 *
 * @param label - The label as read from the document, in any letter case.
 * @returns The label's encoder class; `decode-only` for a label outside the table, which
 *   `decode.ts` admits only when a `TextDecoder` knows it under that exact name.
 */
export const classify = (label: string): EncoderClass =>
  table.get(label.toLowerCase()) ?? "decode-only";

/**
 * The highest code point each encoder class writes as a single byte, absent for a class with no
 * such limit.
 */
const thresholds: Readonly<Record<EncoderClass, Option.Option<number>>> = {
  ascii: Option.some(0x7f),
  "decode-only": Option.none(),
  latin1: Option.some(0xff),
  utf16: Option.none(),
  utf16be: Option.none(),
  utf16le: Option.none(),
  utf8: Option.none(),
};

/**
 * Give the highest code point an encoder class writes as a single byte.
 *
 * @param cls - The encoder class.
 * @returns U+00FF for `latin1` and U+007F for `ascii`; `None` for a class with no such limit.
 */
export const threshold = (cls: EncoderClass): Option.Option<number> => thresholds[cls];

/**
 * Read the code point of one character of a string's iteration, a lone surrogate counting as one.
 *
 * A string's iterator never yields the empty string, the one input `codePointAt(0)` gives no number
 * for, so an empty `character` is its caller's defect and is thrown as one.
 *
 * @param character - One character, as a string's iterator or a one-character match yields it.
 * @returns Its code point.
 */
export const codePointOf = (character: string): number => {
  const point = character.codePointAt(0);
  if (point === undefined) {
    throw new RangeError("codePointOf reads one character, and was given the empty string.");
  }

  return point;
};

/**
 * Find the first code point of `value` above `limit`, as the failure of the construct `where`
 * that holds it.
 *
 * @param value - The construct's text, a lone surrogate counting as one code point.
 * @param where - The construct, for the failure.
 * @param limit - The highest code point the encoder carries as itself.
 * @returns The failure; `None` when no code point of `value` exceeds `limit`.
 */
const unwritableText = (
  value: string,
  where: EncodeError["where"],
  limit: number,
): Option.Option<EncodeError> =>
  Arr.findFirst(value, (character) => {
    const codePoint = codePointOf(character);

    return codePoint > limit
      ? Option.some(new EncodeError({ codePoint, threshold: limit, where }))
      : Option.none();
  });

/**
 * Find the first construct of `node` itself, its children aside, that holds a code point above
 * `limit` where no character reference can write one: a comment's text, a processing
 * instruction's target then data, an entity reference's name, or an element's name, then each
 * attribute's name and the names of its recorded references, in stored order. A text run and the
 * text of an attribute value carry any code point as a reference, so neither is read.
 *
 * @param node - The node to search.
 * @param limit - The highest code point the encoder carries as itself.
 * @returns The failure for the first such construct; `None` when there is none.
 */
const unwritableOwn = (node: Child, limit: number): Option.Option<EncodeError> => {
  if (node.kind === "text") {
    return Option.none();
  }

  if (node.kind === "comment") {
    return unwritableText(node.text, "comment", limit);
  }

  if (node.kind === "pi") {
    return Option.orElse(unwritableText(node.target, "pi", limit), () =>
      unwritableText(node.data, "pi", limit),
    );
  }

  if (node.kind === "entityRef") {
    return unwritableText(node.name, "name", limit);
  }

  return Option.orElse(unwritableText(node.qname, "name", limit), () =>
    Arr.findFirst(node.attributes, (attribute) =>
      Option.orElse(unwritableText(attribute.qname, "name", limit), () =>
        Arr.findFirst(attribute.references, (reference) =>
          unwritableText(reference.name, "name", limit),
        ),
      ),
    ),
  );
};

/**
 * Find the first construct of a top-level node that holds a code point above `limit` where no
 * character reference can write one: the doctype's text, which is source text kept verbatim, or
 * else the first of the node and everything below it, by its {@link preorder}, so a tree of any
 * depth is searched without recursion.
 *
 * @param node - A node of the prolog, the root or a node of the epilog.
 * @param limit - The highest code point the encoder carries as itself.
 * @returns The failure for the first such construct; `None` when there is none.
 */
const unwritableUnder = (node: PrologNode | Child, limit: number): Option.Option<EncodeError> =>
  node.kind === "doctype"
    ? unwritableText(node.text, "doctype", limit)
    : Arr.findFirst(preorder(node), (visited) => unwritableOwn(visited, limit));

/**
 * Find the first construct of a document, in writing order, that holds a code point above
 * `limit` where no character reference can write one: each node of the prolog, the doctype
 * among them, then the root and the epilog ({@link unwritableUnder}), and the search stops at the
 * first failure.
 *
 * This is the one rule of what an encoder's label cannot carry: the writer refuses a document by
 * it, and {@link exportCharset} picks a label it finds nothing for.
 *
 * @param doc - The document to search.
 * @param limit - The highest code point the encoder carries as itself.
 * @returns The `EncodeError` naming the first such construct; `None` when the document is writable.
 */
export const unwritableIn = (doc: XmlDocument, limit: number): Option.Option<EncodeError> =>
  Arr.findFirst([...doc.prolog, doc.root, ...doc.epilog], (node) => unwritableUnder(node, limit));

/**
 * Tell whether a code point may appear in an XML document (`Char`, XML 1.0 section 2.2).
 *
 * @param code - A code point, or a lone surrogate's code unit.
 * @returns True for tab, line feed, carriage return and the allowed ranges.
 */
export const isXmlCharacter = (code: number): boolean =>
  code === 0x9 ||
  code === 0xa ||
  code === 0xd ||
  (code >= 0x20 && code <= 0xd7_ff) ||
  (code >= 0xe0_00 && code <= 0xff_fd) ||
  (code >= 0x1_00_00 && code <= 0x10_ff_ff);

/**
 * The first character of a value that is not one XML allows ({@link isXmlCharacter}).
 *
 * @param value - The value.
 * @returns Its code point, a lone surrogate's code unit; `None` when every character is allowed.
 */
const nonCharacterOf = (value: string): Option.Option<number> =>
  Arr.findFirst(value, (character) => {
    const codePoint = codePointOf(character);

    return isXmlCharacter(codePoint) ? Option.none() : Option.some(codePoint);
  });

/**
 * The `Char` rule a value breaks at its first character XML allows in no document.
 *
 * @param value - The value.
 * @returns The rule; `None` when every character is allowed.
 */
const charRuleOf = (value: string): Option.Option<CharRule> =>
  Option.map(nonCharacterOf(value), (codePoint) => ({ _tag: "Char", codePoint }) as const);

/**
 * Find the first rule a comment or a processing instruction breaks: a character outside `Char`,
 * then a comment holding `--` or ending in `-` (Comment, [15]), or an instruction whose target is
 * no NCName or is `xml` in any case (PITarget, [17], and Namespaces in XML section 7, as the reader
 * holds it: {@link nameViolation}) or whose data holds `?>` (PI, [16]).
 *
 * @param misc - The comment or instruction.
 * @param holder - Where it stands.
 * @returns The refusal; `None` when it breaks none.
 */
const miscRefusal = (misc: Misc, holder: MiscHolder): Option.Option<WriteRefusal> => {
  if (misc.kind === "comment") {
    return Option.map(
      Option.orElse(charRuleOf(misc.text), () =>
        misc.text.includes("--") || misc.text.endsWith("-")
          ? Option.some({ _tag: "Comment" } as const)
          : Option.none(),
      ),
      (rule) => new WriteRefusal({ at: { _tag: "comment", holder, rule } }),
    );
  }

  const ruleOf = (): Option.Option<{ readonly _tag: "PI" | "PITarget" }> => {
    if (Option.isSome(nameViolation(misc.target, "NCName")) || isReservedTarget(misc.target)) {
      return Option.some({ _tag: "PITarget" });
    }

    return misc.data.includes("?>") ? Option.some({ _tag: "PI" }) : Option.none();
  };

  return Option.map(
    Option.orElse(charRuleOf(`${misc.target}${misc.data}`), ruleOf),
    (rule) => new WriteRefusal({ at: { _tag: "pi", holder, rule, target: misc.target } }),
  );
};

/**
 * Find the first rule a child of the element `element` breaks itself, its own children aside: a
 * text run's character outside `Char`, or a comment's or an instruction's rule
 * ({@link miscRefusal}).
 *
 * @param child - The child.
 * @param element - The qualified name of the element whose content holds it.
 * @returns The refusal; `None` when it breaks none.
 */
const childRefusal = (child: Child, element: string): Option.Option<WriteRefusal> => {
  switch (child.kind) {
    case "text": {
      return Option.map(
        charRuleOf(child.value),
        (rule) => new WriteRefusal({ at: { _tag: "text", element, rule } }),
      );
    }
    case "comment":
    case "pi": {
      return miscRefusal(child, { _tag: "element", qname: element });
    }
    case "element":
    case "entityRef": {
      return Option.none();
    }
  }
};

/**
 * Find the first rule an element breaks itself: an attribute value's character outside `Char`, in
 * stored order, then a child's ({@link childRefusal}).
 *
 * @param element - The element.
 * @returns The refusal; `None` when it breaks none.
 */
const elementRefusal = (element: Element): Option.Option<WriteRefusal> =>
  Option.orElse(
    Arr.findFirst(element.attributes, (attribute) =>
      Option.map(
        charRuleOf(attribute.value),
        (rule) =>
          new WriteRefusal({
            at: { _tag: "attribute", element: element.qname, name: attribute.qname, rule },
          }),
      ),
    ),
    () => Arr.findFirst(element.children, (child) => childRefusal(child, element.qname)),
  );

/**
 * Find the first rule of XML 1.0 a document breaks that no text can write ({@link WriteRefusal}):
 * the prolog's comments and instructions, then each element by the root's {@link preorder}, its own
 * attributes then its own children, then the epilog's. No reference can write a character outside
 * `Char`, and no escape exists inside a comment or an instruction, so the writer refuses the
 * document by it.
 *
 * @param doc - The document to search.
 * @returns The `WriteRefusal` for the first such rule; `None` when there is none.
 */
export const refusalIn = (doc: XmlDocument): Option.Option<WriteRefusal> =>
  Option.orElse(
    Arr.findFirst(doc.prolog, (node) =>
      node.kind === "doctype" ? Option.none() : miscRefusal(node, { _tag: "prolog" }),
    ),
    () =>
      Option.orElse(
        Arr.findFirst(preorder(doc.root), (node) =>
          node.kind === "element" ? elementRefusal(node) : Option.none(),
        ),
        () => Arr.findFirst(doc.epilog, (misc) => miscRefusal(misc, { _tag: "epilog" })),
      ),
  );

/**
 * Render a document once it breaks no rule {@link refusalIn} finds.
 *
 * @param doc - The document.
 * @param render - Its renderer.
 * @returns The text, or the first such rule's `WriteRefusal`.
 */
export const checkedText = (
  doc: XmlDocument,
  render: (checked: XmlDocument) => string,
): Result.Result<string, WriteRefusal> =>
  Option.match(refusalIn(doc), {
    onNone: () => Result.succeed(render(doc)),
    onSome: Result.fail,
  });

/**
 * Decide the label an exported document is encoded in, from the label it was read under.
 *
 * The decision is made once, at import, so the encoder never falls back silently: the label is kept
 * only when its encoder writes the whole document, which {@link unwritableIn} decides for a
 * single-byte label, so `encode` under the label this returns never fails.
 *
 * @param label - The label the document was read under, as read.
 * @param doc - The document.
 * @returns `label` when its class is `utf8` or one of UTF-16's, or is `latin1` or `ascii` and
 *   {@link unwritableIn} finds nothing; `"UTF-8"` for a `decode-only` label and for a `latin1` or
 *   `ascii` document it finds a construct in.
 */
export const exportCharset = (label: string, doc: XmlDocument): string => {
  const encoderClass = classify(label);
  if (encoderClass === "decode-only") {
    return "UTF-8";
  }

  return Option.match(threshold(encoderClass), {
    onNone: () => label,
    onSome: (limit) => (Option.isSome(unwritableIn(doc, limit)) ? "UTF-8" : label),
  });
};

/**
 * Strings in code point order, which is the byte order of their UTF-8 form: Canonical XML 1.0's
 * lexicographic order (§2.2, "based on the UCS codepoint values"), and qti-pie's one code point
 * order, grizzle's own (`compareCodePoints` of `@bjornpagen/grizzle-text`), as an Effect order.
 * `Order.String` reads UTF-16 code units, which put a code point above U+FFFF before one from
 * U+E000 to U+FFFF.
 */
export const codePointOrder: Order.Order<string> = Order.make(compareCodePoints);
