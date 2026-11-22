/**
 * The lexical differential's harness: what `lexical.oracle.test.ts`'s box and
 * `genetic-lexical.oracle.test.ts`'s search share, so both judge a value one way.
 *
 * A probe is one value of one (kind, attribute) or simple-content kind's text, written on one line
 * as the element the pinned XSDs judge it on (`probeLine`), with tab, line feed and carriage
 * return as character references so the validator sees the raw form. Probes go to `xmllint` in
 * one batch document, one probe per line, each probe of an `xs:ID` domain in a
 * document of its own ({@link judgeProbes}). The grammar's verdict is its domain's pattern, then
 * its residual facets ({@link accepts}), on the stored form, with no whitespace step before it.
 *
 * Every disagreement is either a {@link recorded} one, keyed to a live spec reading (a sentence
 * `docs/spec-readings.md` still holds, so a reading rewritten or withdrawn turns its record stale)
 * or to a libxml2 departure from XML Schema that a {@link proofs} case shows, or it is a defect of
 * one of the two sides.
 */
import { isNcName } from "@bjornpagen/grizzle-text/regex/xml";
import { matching } from "@bjornpagen/testing/pattern";
import { floorSeed } from "@bjornpagen/testing/random";
import { sample } from "@bjornpagen/testing/source";
import { Effect, FileSystem, Option, Result } from "effect";
import type { ValueDomain } from "#pantry/grammar/attributes.ts";
import type { ComposedGrammar } from "#pantry/grammar/compose.ts";
import { patternFlags, unboundPrefixesOf } from "#pantry/grammar/domains.ts";
import type { DoubleBound } from "#pantry/grammar/domains.ts";
import { openClasses } from "#pantry/grammar/kinds.ts";
import { loadXsd, nameKey, xsdContents } from "#pantry/test/gen/grammar.ts";
import type { XsdName } from "#pantry/test/gen/grammar.ts";
import { driverImports, driverNamespace, isXmlIdCheck } from "#pantry/test/xsd-catalog.ts";
import type { ProbeDeclaration, XsdOracle } from "#pantry/test/xsd-catalog.ts";
import type { SourcePath } from "#pantry/vocab/derive/sources.ts";
import { attributeDeclarations, textTypes } from "#pantry/vocab/inventory/attributes.ts";
import { globalKinds } from "#pantry/vocab/inventory/vocabularies.ts";
import type { Domain, ValueType } from "#pantry/vocab/inventory/types.ts";
import { xmllintValidate } from "#pantry/xml/oracle.ts";
import type { XsdMessage } from "#pantry/xml/oracle.ts";
import { admittedOf } from "#pantry/test/indexes.ts";

/**
 * The namespace an attribute handle's prefix stands for, for the handles a probe writes with a
 * prefix.
 */
const attributePrefixes: ReadonlyMap<string, string> = new Map([
  ["xml", "http://www.w3.org/XML/1998/namespace"],
  ["xsi", "http://www.w3.org/2001/XMLSchema-instance"],
  ["xlink", "http://www.w3.org/1999/xlink"],
]);

/**
 * How a probe element is written so its value is judged against a kind's declaration:
 *
 * - `global`: the kind's own element, which a schema declares globally;
 * - `typed`: a driver's probe element of the kind's named type;
 * - `framed`: the kind's element, declared locally with an anonymous type, inside an element of a
 *   parent kind it may stand under, written as a `global` or `typed` target.
 */
export type Target =
  | { readonly _tag: "global"; readonly name: XsdName }
  | { readonly _tag: "typed"; readonly probe: string; readonly type: XsdName }
  | {
      readonly _tag: "framed";
      readonly child: XsdName;
      readonly parent: Exclude<Target, { readonly _tag: "framed" }>;
    };

/**
 * What a probe judges: a kind's attribute, by its handle, or the text of a simple-content kind.
 */
export type Subject =
  | { readonly _tag: "attribute"; readonly name: string }
  | { readonly _tag: "text" };

/**
 * One probe: the group it stands for, the value and the variant that drew it.
 */
export interface Probe {
  readonly domain: ValueDomain;
  readonly group: string;
  readonly kind: string;
  readonly subject: Subject;
  readonly target: Target;
  readonly value: string;
  readonly variant: string;
  /**
   * The XSD type's whitespace class, which the `folded` diagnostic applies.
   */
  readonly whiteSpace: string;
  /**
   * The XSD type's resolved domain, when the inventory holds it, whose built-ins a libxml2 record
   * is scoped by.
   */
  readonly xsd: Option.Option<Domain>;
}

/**
 * What `xmllint` said of a probe's value: valid, invalid, `undeclared` when the probed type
 * declares no attribute of that name, or `unjudged` when a framed element was not expected where
 * its frame put it, so no declaration judged its value.
 */
type XsdOutcome = "invalid" | "undeclared" | "unjudged" | "valid";

/**
 * One disagreement: the probe, both verdicts, and whether the grammar accepts the value once its
 * whitespace class is applied (so the pattern does not fold the class in, spec-alignment §9.6).
 */
export interface Disagreement {
  readonly folded: boolean;
  readonly grammar: boolean;
  readonly messages: string;
  readonly probe: Probe;
  readonly xsd: XsdOutcome;
}

/**
 * The libxml2 departures the records name, each a case of {@link proofs}.
 */
type ProofName = keyof typeof proofs;

/**
 * Why a disagreement is no defect of either side:
 *
 * - `reading`: a spec reading departs from the XSD on purpose. `says` is a sentence of the reading as
 *   `docs/spec-readings.md` writes it, which must still be there: a reading rewritten or withdrawn
 *   so that it no longer says it turns the record stale, as reading 26's reversal should have
 *   turned its exemption;
 * - `libxml2`: libxml2 departs from XML Schema, shown by the {@link proofs} case `proof` names, which
 *   `lexical.oracle.test.ts`'s proof test runs on the libxml2 at hand, so a libxml2 that stops
 *   departing fails it.
 *
 * Nothing else: a disagreement no reading and no libxml2 departure accounts for is a defect, and
 * stays unrecorded, so its test fails until the owner's fix lands.
 */
export type Reason =
  | {
      readonly _tag: "reading";
      readonly reading: number;
      readonly says: string;
      readonly why: string;
    }
  | { readonly _tag: "libxml2"; readonly proof: ProofName; readonly why: string };

/**
 * One recorded disagreement: what it matches, each field a pattern over the disagreement's own,
 * and why. A record matches by the value, never by how a test drew it, so the box and the search
 * read one list.
 */
export interface Recorded {
  /**
   * The built-ins the XSD type reads (`builtinsOf`), one of which the pattern must match: what a
   * libxml2 departure holds of, so a record never classifies a disagreement on a type libxml2
   * judges rightly.
   */
  readonly builtin?: RegExp;
  readonly domain?: RegExp;
  readonly folded?: boolean;
  /**
   * A property of the value no pattern over its spelling states, as a double's value of zero.
   */
  readonly holds?: (value: string) => boolean;
  readonly kind?: RegExp;
  /**
   * The domain's primitive, for a reading that holds of every type derived from one.
   */
  readonly primitive?: string;
  readonly reason: Reason;
  readonly subject?: RegExp;
  readonly value?: RegExp;
  readonly xsd: XsdOutcome;
}

/**
 * XML 1.0's `NameStartChar` without the colon (Fifth Edition, §2.3), as a class's body.
 */
const nameStartChars =
  "A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD\\u{10000}-\\u{EFFFF}";

/**
 * XML 1.0's `NameChar` without the colon (Fifth Edition, §2.3), as a class's body.
 */
const nameChars = `${nameStartChars}\\-.0-9\\u00B7\\u0300-\\u036F\\u203F\\u2040`;

/**
 * An NCName (Namespaces in XML 1.0, §3): a `NameStartChar` and then `NameChar`s, the colon
 * excepted, so a name of any script, combining marks and extenders among its characters, is one.
 */
const ncNameSource = `[${nameStartChars}][${nameChars}]*`;

/**
 * One character of XML 1.0 Fifth Edition's `NameStartChar`, the colon excepted.
 */
const fifthNameStart = new RegExp(`^[${nameStartChars}]$`, "u");

/**
 * A run of XML 1.0 Fifth Edition's `NameChar`s, the colon excepted.
 */
const fifthNameChars = new RegExp(`^[${nameChars}]+$`, "u");

/**
 * Whether a value is names that XML 1.0 Fifth Edition admits and its Second Edition refuses: split
 * at XML whitespace and colons, every part a run of Fifth Edition `NameChar`s, and some part
 * holding a character no Second Edition `NameChar` is, or beginning with a Fifth Edition
 * `NameStartChar` that is no Second Edition start of a name. The Second Edition's verdict is
 * grizzle-text's `isNcName`, over the Second Edition's Appendix B, the tables the grammar's NCName
 * is built from (`#pantry/grammar/domains.test.ts` holds the grammar's to it).
 *
 * @param value - The value.
 * @returns Whether it is.
 */
const fifthEditionOnly = (value: string): boolean => {
  const parts = value.split(/[\t\n\r :]+/u).filter((part) => part !== "");

  return (
    parts.length > 0 &&
    parts.every((part) => fifthNameChars.test(part)) &&
    parts.some((part) => {
      // oxlint-disable-next-line typescript/no-misused-spread -- XML 1.0's name productions read a name character by character, each a code point, which spreading the string yields.
      const characters = [...part];
      const [first = ""] = characters;

      return (
        characters.some((character) => !isNcName(`a${character}`)) ||
        (fifthNameStart.test(first) && !isNcName(first))
      );
    })
  );
};

/**
 * A QName written with its whitespace, `prefix:local` or `local`, each part an NCName.
 */
const paddedQName = new RegExp(
  `^[\\t\\n\\r ]*(?:${ncNameSource}:)?${ncNameSource}[\\t\\n\\r ]*$`,
  "u",
);

/**
 * Whether a value is a decimal numeral, with an optional exponent, between optional XML
 * whitespace: the forms whose double value a record may read.
 *
 * @param value - The value.
 * @returns Whether it is.
 */
const isNumeral = (value: string): boolean =>
  /^[\t\n\r ]*[+-]?(?:[0-9]+\.?[0-9]*|\.[0-9]+)(?:[eE][+-]?[0-9]+)?[\t\n\r ]*$/u.test(value);

/**
 * Whether a value is an integer numeral, collapsed as `xs:integer` collapses it, outside the
 * signed 64-bit range.
 *
 * @param value - The value.
 * @returns Whether it is.
 */
const beyondInt64 = (value: string): boolean => {
  const digits = /^[\t\n\r ]*(?<sign>[+-]?)(?<digits>[0-9]+)[\t\n\r ]*$/u.exec(value)?.groups;
  if (digits === undefined) {
    return false;
  }

  const integer = BigInt(`${digits["sign"] === "-" ? "-" : ""}${digits["digits"] ?? "0"}`);

  return integer < -9_223_372_036_854_775_808n || integer > 9_223_372_036_854_775_807n;
};

/**
 * Every disagreement between the domains and the XSD's validator that is no defect, classified.
 */
export const recorded: readonly Recorded[] = [
  {
    kind: /^qti-match-table-entry$/u,
    reason: {
      _tag: "reading",
      reading: 8,
      says: "A match table entry's `target-value` is a value of the outcome's base type.",
      why: "the XSD types target-value as the base-type names; the reading makes it a value of the outcome's base type, so the domain admits any normalized string here",
    },
    subject: /^target-value$/u,
    xsd: "invalid",
  },
  {
    domain: /\(reading [^)]*\b16\b/u,
    holds: (value) => isNumeral(value) && Number(value) === 0,
    reason: {
      _tag: "reading",
      reading: 16,
      says: "`normal-maximum` is greater than zero.",
      why: "normal-maximum is greater than zero, and a value is zero as its xs:double is: every spelling of zero, and a literal below half the least subnormal, which rounds to zero (Part 2, 3.2.5)",
    },
    xsd: "valid",
  },
  {
    domain: /\(reading [^)]*\b18\b/u,
    reason: {
      _tag: "reading",
      reading: 18,
      says: "If specified, min-choices must be 1 or greater",
      why: "an order interaction's min-choices is at least 1, so zero is refused however its collapsed form is padded",
    },
    value: /^[\t\n\r ]*[+-]?0+[\t\n\r ]*$/u,
    xsd: "valid",
  },
  {
    domain: /\(reading [^)]*\b39\b/u,
    reason: {
      _tag: "reading",
      reading: 39,
      says: "An SSML `speak/@version` is `1.1`.",
      why: 'SSML 1.1 says speak\'s version "must have the value "1.1"", where the XSD types it xs:NMTOKEN, so every other NMTOKEN is refused',
    },
    value: /^(?![\t\n\r ]*1\.1[\t\n\r ]*$)/u,
    xsd: "valid",
  },
  {
    domain: /\(reading [^)]*\b42\b/u,
    reason: {
      _tag: "reading",
      reading: 42,
      says: "An SSML `voice/@languages` holds language ranges, and `und` and `zxx` are refused.",
      why: "SSML 1.1 makes each of voice's languages an Extended Language Range (RFC 4647, 2.2), where the XSD types the list xs:NMTOKENS, so an NMTOKEN that is no such range is refused",
    },
    xsd: "valid",
  },
  {
    domain: /\(reading [^)]*\b46\b/u,
    holds: (value) => beyondInt64(value),
    reason: {
      _tag: "reading",
      reading: 46,
      says: "A count attribute holds a signed 64-bit integer.",
      why: "a count is a signed 64-bit integer, so an integer beyond -9223372036854775808 to 9223372036854775807 is refused where xs:nonNegativeInteger bounds nothing",
    },
    xsd: "valid",
  },
  {
    domain: /\(reading [^)]*\b120\b/u,
    reason: {
      _tag: "reading",
      reading: 120,
      says: "A `qti-index`'s `n` is at least 1 where it is a number.",
      why: "the information model says \"'n' must be a positive integer\" (§5.72, Index), where the XSD's xs:int member admits 0 and negatives",
    },
    value: /^[\t\n\r ]*(?:[+-]?0+|-[0-9]+)[\t\n\r ]*$/u,
    xsd: "valid",
  },
  {
    domain: /\(reading [^)]*\b123\b/u,
    reason: {
      _tag: "reading",
      reading: 123,
      says: "The auto value must not be specified",
      why: 'the information model says of bdo "The auto value must not be specified" (§5.11), which the XSD lists and defaults to',
    },
    value: /^auto$/u,
    xsd: "valid",
  },
  {
    domain: /\(reading [^)]*\b12[45]\b/u,
    reason: {
      _tag: "reading",
      reading: 124,
      says: "The value must be a valid non-empty URL potentially surrounded by spaces",
      why: 'a media URL "must contain a valid non-empty URL potentially surrounded by spaces" (information model §5.9.1, §5.135.1, §5.163.2, §5.166.1, §5.166.9; reading 125 for track), where the XSD\'s URLDType is any xs:normalizedString',
    },
    value: /^[\t\n\r ]*$/u,
    xsd: "valid",
  },
  {
    domain: /\(reading [^)]*\b129\b/u,
    reason: {
      _tag: "reading",
      reading: 129,
      says: "hold BCP 47 language tags, well-formed as RFC 5646 defines them.",
      why: "xml:lang, lang and srclang are BCP 47 language tags (XML 1.0 §2.12; information model §4.1.4, §5.15.3, §5.163.3), where the XSD types lang and srclang xs:normalizedString and xml:lang RFC 3066's xs:language or empty; the values set aside are those RFC 5646's ABNF refuses, which attributes.test.ts checks against its own recogniser",
    },
    xsd: "valid",
  },
  {
    domain: /\(reading [^)]*\b9\b/u,
    kind: /^h1$/u,
    reason: {
      _tag: "reading",
      reading: 9,
      says: "The 'h1' tag may have an ARIA role value of 'heading' or 'tab' or 'presentation' only",
      why: "the Schematron's RULE ARIA ROLE 1b says \"The 'h1' tag may have an ARIA role value of 'heading' or 'tab' or 'presentation' only\" (ASI binding §5.3.1, whose section 5 is normative), where the XSD lists 74 ARIA roles for h1's role",
    },
    subject: /^role$/u,
    value: /^(?!(?:heading|tab|presentation)$)/u,
    xsd: "valid",
  },
  {
    kind: /^m:cn$/u,
    reason: {
      _tag: "reading",
      reading: 2,
      says: "is a base 10 positive integer giving the value of base in which the text content of the cn is to be interpreted",
      why: 'MathML 3 says a cn\'s base "is a base 10 positive integer" (§4.2.1.3), the positive-integer notation of §2.1.5.1, where the XSD leaves the attribute untyped',
    },
    subject: /^base$/u,
    xsd: "valid",
  },
  {
    kind: /^m:/u,
    reason: {
      _tag: "reading",
      reading: 2,
      says: "`xref` names an `id` of its document, an `xs:IDREF`",
      why: "MathML 3's xref names an id of its document (an xs:IDREF, §5.4.2), where QTI's bundled MathML XSD types it xs:anySimpleType, so text that is no IDREF is refused",
    },
    subject: /^xref$/u,
    xsd: "valid",
  },
  {
    reason: {
      _tag: "reading",
      reading: 47,
      says: "`xsi:type` is valid only when it names the declared type or a type derived from it.",
      why: "an xsi:type's QName is valid only when it names a type, which the codec decides (shred's type-unknown) and no pattern over the value states; its prefix's binding the harness judges as the codec does, with the probe's bindings in scope (resolves)",
    },
    subject: /^xsi:type$/u,
    value: paddedQName,
    xsd: "invalid",
  },
  {
    builtin: /^(?:double|float)$/u,
    reason: {
      _tag: "libxml2",
      proof: "exponent",
      why: "libxml2 accepts a mantissa and an exponent mark with no digits after it (1e, 0E, 1.5e+, and padded, once collapsed) as xs:double, whose lexical space needs digits after the exponent mark (Part 2, 3.2.5.1)",
    },
    value: /^[\t\n\r ]*[+-]?(?:[0-9]+\.?[0-9]*|\.[0-9]+)[eE][+-]?[\t\n\r ]*$/u,
    xsd: "valid",
  },
  {
    builtin: /^(?:double|float)$/u,
    reason: {
      _tag: "libxml2",
      proof: "nan",
      why: "libxml2 accepts NaN, and NaN after whitespace (not before it), under minInclusive 0; NaN is incomparable, so no bound holds of it (Part 2, 3.2.5)",
    },
    value: /^[\t\n\r ]*NaN$/u,
    xsd: "valid",
  },
  {
    builtin: /^(?:double|float)$/u,
    reason: {
      _tag: "libxml2",
      proof: "specialTrailing",
      why: "libxml2 refuses INF, -INF and NaN followed by whitespace (it skips whitespace before them, and after a numeral), though whiteSpace is collapse, fixed, for xs:double and xs:float (Part 2, 4.3.6), so the value collapses to a literal of 3.2.5.1",
    },
    value: /^[\t\n\r ]*-?(?:INF|NaN)[\t\n\r ]+$/u,
    xsd: "invalid",
  },
  {
    domain: /\(reading [^)]*\b17\b/u,
    reason: {
      _tag: "reading",
      reading: 17,
      says: "A rubric block's `view` list has at least one view; an outcome declaration's may have none.",
      why: "the information model gives a rubric block's view the multiplicity [1] (§5.120.2, §5.160.1), where the XSD admits an empty list",
    },
    value: /^[\t\n\r ]*$/u,
    xsd: "valid",
  },
  {
    domain: /\(reading [^)]*\b232\b/u,
    reason: {
      _tag: "reading",
      reading: 232,
      says: "A position object interaction's `center-point` is two integers, its horizontal offset then its vertical.",
      why: "the information model's center-point is an offset 'in horizontal, vertical order' (§5.107.1), two Int values, where the XSD's list of xs:int admits any length",
    },
    value: /^[\t\n\r ]*(?:[^\t\n\r ]+(?:[\t\n\r ]+[^\t\n\r ]+){2,}|[^\t\n\r ]+)?[\t\n\r ]*$/u,
    xsd: "valid",
  },
  {
    domain: /\(reading [^)]*\b239\b/u,
    reason: {
      _tag: "reading",
      reading: 239,
      says: "A `col`'s and a `colgroup`'s `span` is at least 1.",
      why: "the information model's Col and ColGroup say a span's 'value must be a valid non-negative integer greater than zero' (§5.31, §5.32), where the XSD's xs:int admits 0 and every negative",
    },
    value: /^[\t\n\r ]*(?:-[0-9]+|\+?0+)[\t\n\r ]*$/u,
    xsd: "valid",
  },
  {
    builtin: /^(?:IDREFS|NMTOKENS|ENTITIES|IDREF|NMTOKEN|ENTITY)$/u,
    reason: {
      _tag: "libxml2",
      proof: "emptyLists",
      why: "libxml2 accepts an empty or blank xs:IDREFS and xs:NMTOKENS, a list of no item once collapsed, whose minLength is 1 (Part 2, 3.3.10 and 3.3.5)",
    },
    value: /^[\t\n\r ]*$/u,
    xsd: "valid",
  },
  {
    builtin: /^base64Binary$/u,
    reason: {
      _tag: "libxml2",
      proof: "base64",
      why: 'libxml2 accepts xs:base64Binary text that holds characters outside the base64 alphabet (", &, <, é), which Part 2, 3.2.16 refuses',
    },
    xsd: "valid",
  },
  {
    reason: {
      _tag: "libxml2",
      proof: "schemaLocation",
      why: "libxml2 never assesses the value of xsi:schemaLocation, a list of xs:anyURI (Part 1, 3.2.7), and accepts a value that is no list of URI references, as xsd.corpus.test.ts's location record says",
    },
    subject: /^xsi:schemaLocation$/u,
    xsd: "valid",
  },
  {
    domain: /\(reading [^)]*\b132\b/u,
    reason: {
      _tag: "reading",
      reading: 132,
      says: "The rest of this reading stands: each specifier ends in one of the listed codes, and `%q`, `2f%` and `%` are still refused under `attribute-lexical`; reading 171 adds `d` to the listed codes.",
      why: "the information model's printf grammar (§2.3.4) refuses a `%` that begins neither the escape `%%` nor a conversion specifier over its listed codes, `d` a listed code by reading 171, where the XSD types format xs:normalizedString; a format of any number of well-formed specifiers is admitted (reading 161), so its refusal stays unrecorded",
    },
    // The value read from the left as C reads a format: text, `%%` and well-formed specifiers, then a
    // `%` that begins neither, each XML space a flag as normalizedString's replace makes it a space.
    value:
      /^(?:[^%]|%%|%[\t\n\r #+\-0]*[0-9]*(?:\.[0-9]*)?[EefGgrRiodXx])*%(?!%|[\t\n\r #+\-0]*[0-9]*(?:\.[0-9]*)?[EefGgrRiodXx])/u,
    xsd: "valid",
  },
  {
    domain: /\(reading [^)]*\b135\b/u,
    reason: {
      _tag: "reading",
      reading: 135,
      says: "A MIME type is RFC 2045's type and subtype: two tokens joined by a slash.",
      why: "RFC 2045's two tokens and a slash, with no whitespace or control character, where the XSD's MimeTypeDType pattern admits a space, U+007F and, under replace, a tab or a line break",
    },
    xsd: "valid",
  },
  {
    primitive: "anyURI",
    reason: {
      _tag: "reading",
      reading: 71,
      says: "`xs:anyURI` is XML Schema 1.0's: a value is valid when XLink's escaping makes it an RFC 2396 URI reference as RFC 2732 amends it, and libxml2's verdict, which follows RFC 3986, is set aside where the two differ.",
      why: "xs:anyURI is XML Schema 1.0's, RFC 2396 as RFC 2732 amends it after XLink's escaping; libxml2 judges by RFC 3986 with departures of its own and accepts %zz, a second #, and, once escaped, a space or tab before a second #, which RFC 2396's URI-reference refuses",
    },
    xsd: "valid",
  },
  {
    primitive: "anyURI",
    reason: {
      _tag: "reading",
      reading: 71,
      says: "An authority that is a registry name holding a `:` or `@` beyond a host and a port (`http://h:abc/`, `http://a@b@c/`), and an empty port (`http://h:/`): RFC 2396 admits them, and libxml2 refuses them.",
      why: "xs:anyURI is XML Schema 1.0's, RFC 2396 as RFC 2732 amends it; libxml2 judges by RFC 3986 and refuses what RFC 2396 admits: a registry-name authority with : or @ beyond a host and a port, an empty port, a port above 2147483647, and [ or ] in a query or after an opaque part's first character",
    },
    xsd: "invalid",
  },
  {
    domain: /\(reading [^)]*\b2\b/u,
    reason: {
      _tag: "reading",
      reading: 2,
      says: "An explicit plus sign ('+') is not allowed as part of a numerical value except when it is specifically listed in the syntax",
      why: 'MathML 3 §2.1.5.1 writes unsigned-integer as "a string of decimal-digits", positive-integer as one "not consisting solely of "0"s", integer as "an optional "-" ... followed by a string of decimal digits" and number as "an optional prefix of "-" ... followed by an unsigned number", with no +, which xs:unsignedLong (by reading 73), xs:positiveInteger, xs:integer and xs:decimal admit',
    },
    value: /^[\t\n\r ]*\+/u,
    xsd: "valid",
  },
  {
    builtin: /^unsignedLong$/u,
    domain: /\(reading [^)]*\b2\b/u,
    reason: {
      _tag: "reading",
      reading: 2,
      says: "which admit a `+`, and `-0` for the first (reading 73)",
      why: 'MathML 3 §2.1.5.1 writes unsigned-integer as "a string of decimal-digits", with no sign, where the XSD types it xs:unsignedLong, which admits -0 by reading 73',
    },
    value: /^[\t\n\r ]*-0+[\t\n\r ]*$/u,
    xsd: "valid",
  },
  {
    builtin: /^(?:NCName|ID|IDREF|IDREFS|ENTITY|ENTITIES|NMTOKEN|NMTOKENS|Name|QName)$/u,
    holds: fifthEditionOnly,
    reason: {
      _tag: "libxml2",
      proof: "fifthEditionNames",
      why: "libxml2 reads the name types, xs:NCName and the types derived from it, xs:Name, xs:QName and xs:NMTOKEN with their lists, by XML 1.0 Fifth Edition's NameStartChar and NameChar, so it accepts a name that holds a character no XML 1.0 Second Edition table holds (U+20AC, U+3400, U+10000, U+0132) or that begins with one the Second Edition admits only after the first (U+02D0); XML Schema 1.0 takes the name characters from the Second Edition (Part 2, 3.3.7 and Appendix F.1.1), as reading 94 reads it",
    },
    xsd: "valid",
  },
  {
    holds: fifthEditionOnly,
    reason: {
      _tag: "libxml2",
      proof: "fifthEditionNames",
      why: "the global attributes the inventory holds no type for are name types too, xml:id an xs:ID (xml.xsd) and xlink:label, xlink:from and xlink:to restrictions of xs:NCName (xlink.xsd), which libxml2 reads by XML 1.0 Fifth Edition's names, as the record above says",
    },
    subject: /^(?:xml:id|xlink:(?:from|label|to))$/u,
    xsd: "valid",
  },
];

/**
 * The roots the XSD set is read from with the shared reader: the driver's ASI, content-packaging
 * and usage data imports, which reach every pinned vocabulary.
 */
export const roots: readonly SourcePath[] = [
  driverImports[0][1],
  driverImports[1][1],
  "usagedata/imsqti_usagedatav3p0_v1p0.xsd",
];

/**
 * Apply a whitespace class, as XML Schema's `whiteSpace` facet does (Part 2, 4.3.6).
 *
 * @param lexical - The raw form.
 * @param whiteSpace - The class.
 * @returns The normalized form.
 */
export const normalized = (lexical: string, whiteSpace: string): string => {
  if (whiteSpace === "preserve") {
    return lexical;
  }

  const replaced = lexical.replaceAll(/[\t\n\r]/gu, " ");

  return whiteSpace === "replace" ? replaced : replaced.trim().replaceAll(/ +/gu, " ");
};

/**
 * Escape a value for an attribute between double quotes, or for element text, so the validator
 * reads it raw: markup characters as entity references, and tab, line feed and carriage return as
 * character references, which the parser's normalizations leave alone.
 *
 * @param value - The value.
 * @returns The escaped text.
 */
export const escaped = (value: string): string =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("\t", "&#9;")
    .replaceAll("\n", "&#10;")
    .replaceAll("\r", "&#13;");

/**
 * The enumeration values a resolved XSD domain lists, through its list items and union members.
 *
 * @param domain - The domain.
 * @returns The values, each once.
 */
export const enumerationsOf = (domain: Domain): readonly string[] => {
  const own = domain.facets
    .filter(({ facet }) => facet === "enumeration")
    .map(({ value }) => value);

  switch (domain._tag) {
    case "atomic": {
      return own;
    }
    case "list": {
      return [...own, ...enumerationsOf(domain.item)];
    }
    case "union": {
      return [...own, ...domain.members.flatMap(enumerationsOf)];
    }
    default: {
      return domain satisfies never;
    }
  }
};

/**
 * Boundary forms of each datatype family, keyed by the family's primitive or built-in local name:
 * the forms where lexical spaces differ in practice (signs, leading zeros, exponents, the special
 * doubles, case, separators, escapes: a lone `%` is no URI and no printf format).
 */
export const families = {
  anyURI: [
    "http://example.com/a?b#c",
    "a/b.xml",
    "#f",
    "a b",
    "%zz",
    "%20",
    "é.xml",
    "http://[::1]/",
    "a#b#c",
    ":",
    "http://h:abc/",
  ],
  boolean: ["true", "false", "1", "0", "TRUE", "yes"],
  date: [
    "2024-01-01",
    "2024-13-01",
    "2024-02-30",
    "-0001-01-01",
    "2024-01-01Z",
    "2024-01-01+14:00",
    "24-01-01",
  ],
  dateTime: [
    "2024-01-01T00:00:00",
    "2024-01-01T24:00:00",
    "2024-01-01T00:00:00Z",
    "2024-01-01 00:00:00",
  ],
  decimal: [
    "0",
    "-0",
    "+0",
    "1",
    "-1",
    "+1",
    "007",
    "1.5",
    ".5",
    "5.",
    "1.0",
    "1e2",
    "0x1",
    "1,5",
    "2147483648",
    "-",
    "- ",
  ],
  double: [
    "0",
    "0.0",
    "-0.0",
    ".5",
    "5.",
    "1.5",
    "+1.5",
    "1e3",
    "1E-3",
    "1e",
    "INF",
    "INF ",
    "-INF",
    "+INF",
    "NaN",
    "nan",
    "1,5",
  ],
  duration: ["P1D", "PT1H", "P1Y2M3DT4H5M6.7S", "-P1D", "P", "PT", "1D"],
  float: ["0", "1.5", "INF", "-INF", "NaN", "1e39"],
  integer: [
    "0",
    "-0",
    "+0",
    "1",
    "-1",
    "+1",
    "007",
    "2147483647",
    "2147483648",
    "-2147483649",
    "99999999999999999999",
    "1.0",
    "1e2",
    "1 2",
  ],
  language: ["en", "en-US", "x-klingon", "i-default", "en_US", "123", "abcdefghi", "a-b-c-d-e-f-g"],
  name: ["a", "a.b", "_a", "a-b", "a1", "1a", "-a", ".a", "a:b", "a b", "é"],
  string: ["a", "a b", "a  b", "é", "ä€𝄞", "a\tb", "a\nb", "<", '"', "&", ":", "%"],
} satisfies Readonly<Record<string, readonly string[]>>;

/**
 * {@link families}, looked up by a family name read off a domain.
 */
export const familyTable: ReadonlyMap<string, readonly string[]> = new Map(
  Object.entries(families),
);

/**
 * The built-ins and primitives a resolved XSD domain reads, through its list items and union
 * members: an atomic domain's first built-in and its primitive.
 *
 * @param domain - The domain.
 * @returns The names.
 */
const builtinsOf = (domain: Domain): readonly string[] => {
  switch (domain._tag) {
    case "atomic": {
      return [domain.builtin, domain.primitive];
    }
    case "list": {
      return builtinsOf(domain.item);
    }
    case "union": {
      return domain.members.flatMap(builtinsOf);
    }
    default: {
      return domain satisfies never;
    }
  }
};

/**
 * The family a built-in or primitive's boundary forms are drawn from.
 *
 * @param local - The built-in's or primitive's local name.
 * @returns The family's key in {@link families}.
 */
export const familyOf = (local: string): string => {
  if (/integer|Integer|^int$|long|short|byte/u.test(local)) {
    return "integer";
  }

  if (/^(?:NCName|ID|IDREF|IDREFS|NMTOKEN|NMTOKENS|Name|QName|ENTITY)$/u.test(local)) {
    return "name";
  }

  return familyTable.has(local) ? local : "string";
};

/**
 * The families a domain's samples are drawn from: its primitive's, and the XSD type's built-ins'
 * and primitives'.
 *
 * @param domain - The grammar's domain.
 * @param xsd - The XSD type's resolved domain, when the inventory holds it.
 * @returns The family names.
 */
export const familiesOf = (domain: ValueDomain, xsd: Option.Option<Domain>): readonly string[] => [
  ...new Set(
    [domain.primitive, ...Option.match(xsd, { onNone: () => [], onSome: builtinsOf })].map(
      familyOf,
    ),
  ),
];

/**
 * Bound a pattern's unbounded repetitions outside its classes and escapes, which the pattern
 * generator refuses (every repetition it draws states its bound: `matching`,
 * `@bjornpagen/testing/pattern`): `*` as `{0,3}`, `+` as `{1,3}` and `{n,}` as `{n,n+3}`. Every
 * string the bounded pattern matches the pattern matches, so a domain whose language repeats
 * without a bound, as a collapsed type's padding or MathML's colour does, is drawn from its own
 * grammar rather than probed by its families alone.
 *
 * @param pattern - A domain's compiled pattern.
 * @returns The bounded pattern; the pattern itself where it repeats nothing without a bound.
 */
const boundedPattern = (pattern: string): string => {
  let bounded = "";
  let inClass = false;
  for (let at = 0; at < pattern.length; at += 1) {
    const point = pattern[at] ?? "";
    if (point === "\\") {
      bounded += pattern.slice(at, at + 2);
      at += 1;
    } else if (inClass) {
      inClass = point !== "]";
      bounded += point;
    } else if (point === "[") {
      inClass = true;
      bounded += point;
    } else if (point === "*") {
      bounded += "{0,3}";
    } else if (point === "+") {
      bounded += "{1,3}";
    } else {
      const open = /^\{(?<least>\d+),\}/u.exec(pattern.slice(at))?.groups?.["least"];
      if (point === "{" && open !== undefined) {
        bounded += `{${open},${String(Number(open) + 3)}}`;
        at += open.length + 2;
      } else {
        bounded += point;
      }
    }
  }

  return bounded;
};

/**
 * How many samples are drawn from each domain's pattern, and how many of different forms
 * ({@link formOf}) are kept: enough draws that a pattern of a score of alternatives, as MathML's
 * colour is (a hex form beside sixteen names), meets nearly every arm (16/17 to the 64th is 2%),
 * and few enough kept that the box stays one batch.
 */
const samplesDrawn = { drawn: 64, kept: 12 } as const;

/**
 * A value's form, coarsely: each run of digits as `0`, of lower-case letters as `a`, of upper-case
 * ones as `A` and of XML spaces as `_`, every other character as itself, so `#3fA` and `#a1F`
 * share a form and `#3fA` and `green` do not.
 *
 * @param value - The value.
 * @returns Its form.
 */
export const formOf = (value: string): string =>
  value
    .replaceAll(/\d+/gu, "0")
    .replaceAll(/\p{Ll}+/gu, "a")
    .replaceAll(/\p{Lu}+/gu, "A")
    .replaceAll(/[\t\n\r ]+/gu, "_");

/**
 * A string of XML characters only: what a probe can carry, since a batch holding any other is no
 * XML document.
 */
const xmlCharacters = /^[\t\n\r\u0020-\uD7FF\uE000-\uFFFD\u{10000}-\u{10FFFF}]*$/u;

/**
 * Read a numeric literal as a number: `INF`, `+INF` and `-INF` as the infinities, anything else as
 * JavaScript's `Number` reads it after trimming, so `NaN` and every non-number read `NaN`.
 *
 * @param text - The literal.
 * @returns The number.
 */
export const numberOf = (text: string): number => {
  const trimmed = text.trim();
  if (trimmed === "INF" || trimmed === "+INF") {
    return Number.POSITIVE_INFINITY;
  }

  return trimmed === "-INF" ? Number.NEGATIVE_INFINITY : Number(trimmed);
};

/**
 * Whether a value holds a domain's bound, a double's or a float's lower bound the pattern does not
 * state: compared as numbers, `INF`, `-INF` and `NaN` as JavaScript reads them, so `NaN` holds no
 * bound.
 *
 * @param bound - The domain's bound, none for an unbounded domain.
 * @param raw - The value as written.
 * @returns Whether the bound holds.
 */
const boundHolds = (bound: Option.Option<DoubleBound>, raw: string): boolean =>
  !Option.exists(bound, ({ facet, value: limit }) => {
    const value = numberOf(raw);
    switch (facet) {
      case "minExclusive": {
        return !(value > limit);
      }
      case "minInclusive": {
        return !(value >= limit);
      }
      default: {
        return facet satisfies never;
      }
    }
  });

/**
 * The compiled regex of each domain's pattern, by handle: a pattern that spells the XML name
 * classes runs to thousands of characters, so each is compiled once.
 */
const compiled = new Map<string, RegExp>();

/**
 * Compile a domain's pattern once.
 *
 * @param domain - The domain.
 * @returns Its regex, with the flags a JavaScript host reads it with.
 */
export const regexOf = (domain: ValueDomain): RegExp => {
  const held = compiled.get(domain.handle);
  if (held !== undefined) {
    return held;
  }

  const regex = new RegExp(domain.pattern, patternFlags);
  compiled.set(domain.handle, regex);

  return regex;
};

/**
 * Whether the grammar accepts a raw value under a domain: its pattern, then its bound.
 *
 * @param domain - The domain.
 * @param raw - The value as written.
 * @returns Whether it is accepted.
 */
export const accepts = (domain: ValueDomain, raw: string): boolean =>
  regexOf(domain).test(raw) && boundHolds(domain.bound, raw);

/**
 * The whitespace class a resolved XSD domain states, `preserve` for a union, which states none.
 *
 * @param xsd - The domain, when the inventory holds it.
 * @returns The class.
 */
export const whiteSpaceOf = (xsd: Option.Option<Domain>): string =>
  Option.match(xsd, {
    onNone: () => "preserve",
    onSome: (domain) =>
      domain.facets.find(({ facet }) => facet === "whiteSpace")?.value ?? "preserve",
  });

/**
 * Flip a value's case: lower-case when it has no lower-case letter, upper-case otherwise.
 *
 * @param value - The value.
 * @returns The flipped value.
 */
export const flipped = (value: string): string =>
  value === value.toUpperCase() ? value.toLowerCase() : value.toUpperCase();

/**
 * The samples drawn from each domain's pattern, by handle: many groups share one domain, which is
 * drawn from once.
 */
const drawnSamples = new Map<string, readonly string[]>();

/**
 * Draw samples of a domain's pattern from a stream seeded by its handle, once per domain, the first
 * of each form ({@link samplesDrawn}), with its unbounded repetitions bounded
 * ({@link boundedPattern}); none for a pattern the generator refuses, and no sample that holds a
 * character XML does not admit.
 *
 * Every pattern is drawn from, however long: the generator keeps a class as its runs of code points
 * and refuses a pattern while it parses it (`@bjornpagen/testing/pattern`, since grizzle
 * `4b155e8a`), so a pattern spelling the XML name classes, thousands of characters long, costs its
 * parse and its draws, never every code point its classes name.
 *
 * @param domain - The domain.
 * @returns The samples.
 */
export const drawnOf = (domain: ValueDomain): readonly string[] => {
  const held = drawnSamples.get(domain.handle);
  if (held !== undefined) {
    return held;
  }

  const drawn = Result.getOrElse(
    Result.try(() =>
      [
        ...new Map(
          sample(
            matching(new RegExp(boundedPattern(domain.pattern), patternFlags)),
            floorSeed(`lexical ${domain.handle}`),
            samplesDrawn.drawn,
          )
            .filter((value) => xmlCharacters.test(value))
            .toReversed()
            .map((value) => [formOf(value), value] as const),
        ).values(),
      ]
        .toReversed()
        .slice(0, samplesDrawn.kept),
    ),
    () => [],
  );
  drawnSamples.set(domain.handle, drawn);

  return drawn;
};

/**
 * Write an attribute of a probe: its name, with the namespace declaration a prefixed name needs
 * (`xml:` needs none), and its escaped value.
 *
 * @param name - The attribute's handle.
 * @param value - Its escaped value.
 * @returns The text, with its leading space.
 */
export const attributeText = (name: string, value: string): string => {
  const colon = name.indexOf(":");
  if (colon === -1) {
    return ` ${name}="${value}"`;
  }

  const prefix = name.slice(0, colon);
  const declared =
    prefix === "xml" ? "" : ` xmlns:${prefix}="${attributePrefixes.get(prefix) ?? ""}"`;

  return `${declared} ${name}="${value}"`;
};

/**
 * Write an element with its namespace bound on itself.
 *
 * @param name - Its name.
 * @param rest - Its attributes' text.
 * @param body - Its content.
 * @returns The element.
 */
export const elementText = (name: XsdName, rest: string, body: string): string =>
  name.namespace === ""
    ? `<${name.local}${rest}>${body}</${name.local}>`
    : `<e:${name.local} xmlns:e="${name.namespace}"${rest}>${body}</e:${name.local}>`;

/**
 * Write a target that needs no frame: the kind's global element, or the driver's probe element.
 *
 * @param target - The target.
 * @param rest - Its attributes' text.
 * @param body - Its content.
 * @returns The element.
 */
const plainElement = (
  target: Exclude<Target, { readonly _tag: "framed" }>,
  rest: string,
  body: string,
): string =>
  target._tag === "global"
    ? elementText(target.name, rest, body)
    : elementText({ local: target.probe, namespace: driverNamespace }, rest, body);

/**
 * The XML of one probe on one line: the target element carrying the value, framed when it must
 * be, every namespace declared on the element that uses it.
 *
 * @param probe - The probe.
 * @returns The line.
 */
const probeLine = (probe: Probe): string => {
  const value = escaped(probe.value);
  const attribute = probe.subject._tag === "text" ? "" : attributeText(probe.subject.name, value);
  const content = probe.subject._tag === "text" ? value : "";

  switch (probe.target._tag) {
    case "framed": {
      return plainElement(
        probe.target.parent,
        "",
        elementText(probe.target.child, attribute, content),
      );
    }
    case "global":
    case "typed": {
      return plainElement(probe.target, attribute, content);
    }
    default: {
      return probe.target satisfies never;
    }
  }
};

/**
 * The element a probe's verdict is read on, as `xmllint` names it, `{namespace}local`.
 *
 * @param target - The probe's target.
 * @returns The name.
 */
const judgedElement = (target: Target): string => {
  switch (target._tag) {
    case "framed": {
      return nameKey(target.child);
    }
    case "global": {
      return target.name.namespace === "" ? target.name.local : nameKey(target.name);
    }
    case "typed": {
      return nameKey({ local: target.probe, namespace: driverNamespace });
    }
    default: {
      return target satisfies never;
    }
  }
};

/**
 * `xmllint`'s outcome for one probe, and the messages that decided it.
 */
export interface Outcome {
  readonly outcome: XsdOutcome;
  readonly said: string;
}

/**
 * Read `xmllint`'s outcome for one probe from the messages on its line.
 *
 * @param probe - The probe.
 * @param messages - The messages on its line.
 * @returns Its outcome, and the messages that decided it.
 */
export const outcomeOf = (probe: Probe, messages: readonly XsdMessage[]): Outcome => {
  const element = judgedElement(probe.target);
  const attribute =
    probe.subject._tag === "attribute"
      ? Option.some(
          ((name: string) => {
            const colon = name.indexOf(":");

            return colon === -1
              ? name
              : `{${attributePrefixes.get(name.slice(0, colon)) ?? ""}}${name.slice(colon + 1)}`;
          })(probe.subject.name),
        )
      : Option.none<string>();
  const own = messages.filter(
    (message) =>
      Option.contains(message.element, element) &&
      (Option.isNone(attribute)
        ? Option.isNone(message.attribute) && /is not a valid value|^\[facet '/u.test(message.text)
        : Option.isSome(message.attribute) && Option.contains(attribute, message.attribute.value)),
  );
  const said = own.map(({ text }) => text).join(" | ");

  if (
    messages.some(
      (message) =>
        Option.contains(message.element, element) &&
        message.text.startsWith("This element is not expected."),
    )
  ) {
    return { outcome: "unjudged", said: "not expected in its frame" };
  }

  if (own.some(({ text }) => /^The attribute '[^']+' is not allowed\./u.test(text))) {
    return { outcome: "undeclared", said };
  }

  return { outcome: own.length === 0 ? "valid" : "invalid", said };
};

/**
 * Find the record a disagreement matches.
 *
 * @param disagreement - The disagreement.
 * @returns The first record that matches it, or `undefined`.
 */
export const recordOf = (disagreement: Disagreement): Recorded | undefined => {
  const { folded, probe, xsd } = disagreement;
  const subject = probe.subject._tag === "text" ? "#text" : probe.subject.name;

  return recorded.find(
    (record) =>
      record.xsd === xsd &&
      (record.folded === undefined || record.folded === folded) &&
      (record.domain === undefined || record.domain.test(probe.domain.handle)) &&
      (record.kind === undefined || record.kind.test(probe.kind)) &&
      (record.builtin === undefined ||
        Option.exists(probe.xsd, (type) =>
          builtinsOf(type).some((name) => record.builtin?.test(name) === true),
        )) &&
      (record.primitive === undefined || record.primitive === probe.domain.primitive) &&
      (record.subject === undefined || record.subject.test(subject)) &&
      (record.value === undefined || record.value.test(probe.value)) &&
      (record.holds === undefined || record.holds(probe.value)),
  );
};

/**
 * Write a reason as one line.
 *
 * @param reason - The reason.
 * @returns Its tag, its reading or proof, and why.
 */
export const reasonText = (reason: Reason): string => {
  switch (reason._tag) {
    case "libxml2": {
      return `libxml2 (${reason.proof}): ${reason.why}`;
    }
    case "reading": {
      return `reading ${String(reason.reading)}: ${reason.why}`;
    }
    default: {
      return reason satisfies never;
    }
  }
};

/**
 * Write rows as TSV, each field's tabs and line breaks written as `\t`, `\n` and `\r`.
 *
 * @param header - The column names.
 * @param rows - The rows.
 * @returns The text.
 */
export const tsv = (header: readonly string[], rows: readonly (readonly string[])[]): string =>
  [header, ...rows]
    .map(
      (row) =>
        `${row
          .map((field) =>
            field
              .replaceAll("\t", String.raw`\t`)
              .replaceAll("\n", String.raw`\n`)
              .replaceAll("\r", String.raw`\r`),
          )
          .join("\t")}\n`,
    )
    .join("");

/**
 * Find how each kind is written as a probe element.
 *
 * @param grammar - The composed grammar.
 * @returns Each kind's targets, and the probe elements the driver must declare.
 */
export const targetsOf = Effect.fn("lexical.targetsOf")(function* targetsOf(
  grammar: ComposedGrammar,
) {
  const resolve = (namespace: string, local: string, parent: string): Option.Option<string> =>
    grammar.kinds.nodeKind.has(parent)
      ? grammar.kinds.resolve(namespace, local, parent)
      : Option.none();
  const names = new Map<string, XsdName>(
    grammar.kinds.elementName.rows.map((row) => [
      row.kind,
      { local: row.local, namespace: row.namespace },
    ]),
  );
  const globals = new Map<string, XsdName>();
  const contents = new Map<string, { readonly type: string; readonly name: XsdName }[]>();
  // A global declaration's kind is the one `globalKinds` lists under its name, not one read off
  // where a wildcard admits it: spec reading 2 lets a wildcard admit MathML's root alone, and
  // every MathML global still declares its kind's attributes and text.
  const globalKindOf = new Map<string, string>(
    globalKinds.flatMap(({ kind }) =>
      Option.toArray(grammar.kinds.elementName.lookup({ kind })).map(
        ({ local, namespace }) => [`{${namespace}}${local}`, kind] as const,
      ),
    ),
  );

  for (const root of roots) {
    const { set } = yield* loadXsd(root);
    for (const key of set.elements.keys()) {
      const name = {
        local: key.slice(key.indexOf("}") + 1),
        namespace: key.slice(1, key.indexOf("}")),
      };
      for (const kind of Option.toArray(Option.fromNullishOr(globalKindOf.get(key)))) {
        globals.set(kind, name);
      }
    }

    for (const [kind, held] of xsdContents(set, resolve).contents) {
      for (const found of Option.toArray(Option.fromNullishOr(names.get(kind)))) {
        contents.set(kind, [
          ...(contents.get(kind) ?? []),
          ...held.map(({ type }) => ({
            name: { local: found.local, namespace: found.namespace },
            type,
          })),
        ]);
      }
    }
  }

  const probes = new Map<string, ProbeDeclaration>();
  const plain = new Map<string, Exclude<Target, { readonly _tag: "framed" }>[]>();
  for (const [kind, held] of contents) {
    const global = globals.get(kind);
    const named = [...new Set(held.map(({ type }) => type).filter((type) => type !== "anonymous"))];
    const typed = (global === undefined || named.length > 1 ? named : []).map((type) => {
      const local = type.slice(type.indexOf("}") + 1);
      const namespace = type.slice(1, type.indexOf("}"));
      const probe = `probe-${String(probes.size)}-${local.replaceAll(/[^\w.-]/gu, "_")}`;
      const existing = [...probes.values()].find(
        (declared) => declared.type === local && declared.namespace === namespace,
      );
      if (existing === undefined) {
        probes.set(probe, { local: probe, namespace, type: local });
      }

      return {
        _tag: "typed" as const,
        probe: existing?.local ?? probe,
        type: { local, namespace },
      };
    });
    plain.set(kind, [
      ...(global === undefined ? [] : [{ _tag: "global" as const, name: global }]),
      ...typed,
    ]);
  }

  const targets = new Map<string, readonly Target[]>(plain);
  for (const [kind, held] of contents) {
    if ((plain.get(kind) ?? []).length === 0 && held.some(({ type }) => type === "anonymous")) {
      const parent = admittedOf(grammar.content.contentModelOf, grammar.content.admissionIn).find(
        (row) => row.child === kind && (plain.get(row.parent) ?? []).length > 0,
      );
      const frame = parent === undefined ? undefined : plain.get(parent.parent)?.[0];
      const child = held[0]?.name;
      if (frame !== undefined && child !== undefined) {
        targets.set(kind, [{ _tag: "framed", child, parent: frame }]);
      }
    }
  }

  return { probes: [...probes.values()], targets };
});

/**
 * One attribute or text row of the grammar, with the XSD type the inventory gives it.
 */
interface ProbedRow {
  readonly domain: string;
  readonly kind: string;
  readonly subject: Subject;
  readonly xsd: Option.Option<Domain>;
  readonly xsdType: Option.Option<ValueType>;
}

/**
 * The representative of one (domain, XSD type) group.
 */
export interface Group {
  readonly domain: ValueDomain;
  readonly kind: string;
  readonly subject: Subject;
  readonly xsd: Option.Option<Domain>;
}

/**
 * Write a subject as the reports name it.
 *
 * @param subject - The subject.
 * @returns The attribute's handle, or `#text`.
 */
export const subjectName = (subject: Subject): string =>
  subject._tag === "text" ? "#text" : subject.name;

/**
 * The inventory's attribute declarations, by `kind name`.
 */
const declaredAttributes = new Map(
  attributeDeclarations.map((row) => [`${row.kind} ${row.name}`, row] as const),
);

/**
 * The inventory's text types, by kind.
 */
const declaredTexts = new Map(textTypes.map((row) => [row.kind, row] as const));

/**
 * Find the inventory's declaration of an attribute of a kind.
 *
 * @param kind - The kind.
 * @param name - The attribute's name.
 * @returns The declaration, none where the inventory declares none.
 */
const declaredAttributeOf = (kind: string, name: string) =>
  Option.fromNullishOr(declaredAttributes.get(`${kind} ${name}`));

/**
 * Find the inventory's text type of a kind.
 *
 * @param kind - The kind.
 * @returns The text type, none where the inventory gives none.
 */
const declaredTextOf = (kind: string) => Option.fromNullishOr(declaredTexts.get(kind));

/**
 * List the grammar's attribute and text rows, each with the XSD type the inventory gives it.
 *
 * @param grammar - The composed grammar.
 * @returns The rows.
 */
export const rowsOf = (grammar: ComposedGrammar): readonly ProbedRow[] => [
  ...grammar.attributes.admission.rows.map((row): ProbedRow => {
    const declared = declaredAttributeOf(row.kind, row.name);

    return {
      domain: row.domain,
      kind: row.kind,
      subject: { _tag: "attribute", name: row.name },
      xsd: declared.pipe(Option.map(({ domain }) => domain)),
      xsdType: declared.pipe(Option.map(({ type }) => type)),
    };
  }),
  ...grammar.attributes.text.rows.map((row): ProbedRow => {
    const declared = declaredTextOf(row.kind);

    return {
      domain: row.domain,
      kind: row.kind,
      subject: { _tag: "text" },
      xsd: declared.pipe(Option.map(({ domain }) => domain)),
      xsdType: declared.pipe(Option.map(({ type }) => type)),
    };
  }),
];

/**
 * Every (domain, XSD type) group's representative row, and the probe elements the driver declares:
 * what the box probes each group on, and what the search's sites stand on.
 */
export interface Sites {
  readonly declarations: readonly ProbeDeclaration[];
  /**
   * The groups, by `domain identity`, in row order.
   */
  readonly groups: ReadonlyMap<string, Group>;
  /**
   * The rows that a probe can stand for, by `kind subject`, with their targets.
   */
  readonly rows: ReadonlyMap<string, ProbedSite>;
  /**
   * The rows no probe can stand for, and why.
   */
  readonly unprobed: readonly string[];
}

/**
 * One row a probe can stand for: its domain and XSD type, and how its kind is written as a probe
 * element.
 */
export interface ProbedSite extends Group {
  readonly targets: readonly Target[];
}

/**
 * Read the groups and probe-able rows.
 *
 * @param grammar - The composed grammar.
 * @returns The sites.
 */
export const sitesOf = Effect.fn("lexical.sitesOf")(function* sitesOf(grammar: ComposedGrammar) {
  const domains = new Map(grammar.attributes.domains.map((domain) => [domain.handle, domain]));
  const unprobed: string[] = [];
  const { probes: declarations, targets } = yield* targetsOf(grammar);
  const groups = new Map<string, Group>();
  const rows = new Map<string, ProbedSite>();

  for (const row of rowsOf(grammar)) {
    const domain = domains.get(row.domain);
    const where = `${row.kind} ${subjectName(row.subject)}`;
    const identity = Option.match(row.xsdType, {
      onNone: () => `layer ${subjectName(row.subject)}`,
      onSome: (type) => JSON.stringify(type),
    });
    const group = `${row.domain} ${identity}`;
    const held = targets.get(row.kind) ?? [];
    if (
      row.subject._tag === "attribute" &&
      openClasses.some((open) => open === subjectName(row.subject))
    ) {
      unprobed.push(`${where}: an open class, not a name`);
    } else if (domain === undefined) {
      unprobed.push(`${where}: domain ${row.domain} not in the roster`);
    } else if (held.length === 0) {
      unprobed.push(`${where}: no probe element for the kind`);
    } else {
      const site = { domain, kind: row.kind, subject: row.subject, xsd: row.xsd };
      rows.set(`${row.kind} ${subjectName(row.subject)}`, { ...site, targets: held });
      if (!groups.has(group)) {
        groups.set(group, site);
      }
    }
  }

  return { declarations, groups, rows, unprobed } satisfies Sites;
});

/**
 * One probe as both sides judged it: `xmllint`'s outcome and the messages that decided it, the
 * grammar's verdict, and whether the grammar accepts the value once its XSD type's whitespace
 * class is applied.
 */
export interface Judged {
  readonly folded: boolean;
  readonly grammar: boolean;
  readonly outcome: XsdOutcome;
  readonly probe: Probe;
  readonly said: string;
}

/**
 * The prefixes bound where a probe's value stands, as {@link probeLine} and its batch write them:
 * `xml`, by definition; `d`, which the batch's root binds; `e`, where the probe element or its
 * frame is in a namespace; and the attribute's own prefix, which its element declares.
 *
 * @param probe - The probe.
 * @returns The bound prefixes.
 */
const probeScopeOf = (probe: Probe): ReadonlySet<string> => {
  const namespaces = ((): readonly string[] => {
    switch (probe.target._tag) {
      case "framed": {
        return [
          probe.target.child.namespace,
          probe.target.parent._tag === "global"
            ? probe.target.parent.name.namespace
            : driverNamespace,
        ];
      }
      case "global": {
        return [probe.target.name.namespace];
      }
      case "typed": {
        return [driverNamespace];
      }
      default: {
        return probe.target satisfies never;
      }
    }
  })();
  const subject = probe.subject._tag === "attribute" ? probe.subject.name : "";

  return new Set([
    "xml",
    "d",
    ...(namespaces.some((namespace) => namespace !== "") ? ["e"] : []),
    ...(subject.includes(":") ? [subject.slice(0, subject.indexOf(":"))] : []),
  ]);
};

/**
 * Whether a probe's value resolves as the codec reads it: an attribute of a QName domain has every
 * prefix its QNames name bound in the probe's scope (shred's `prefix-unbound` and, for `xsi:type`,
 * `type-unresolved`); any other value, and a simple-content kind's text, which the codec reads no
 * bindings for, always does.
 *
 * @param probe - The probe.
 * @returns Whether it resolves.
 */
export const resolves = (probe: Probe): boolean =>
  probe.subject._tag === "text" ||
  Option.match(probe.domain.qualified, {
    onNone: () => true,
    onSome: (qualified) => {
      const scope = probeScopeOf(probe);

      return unboundPrefixesOf(qualified, probe.value, (prefix) => scope.has(prefix)).length === 0;
    },
  });

/**
 * Judge probes: write them as one batch, every probe of an `xs:ID` domain in a document of its
 * own, validate them in one `xmllint` process, and read each probe's outcome beside the grammar's
 * verdict.
 *
 * @param input - What to judge.
 * @param input.directory - The folder the batches are written to, under the package's `work/`.
 * @param input.name - A name for this call's batches, unique in the folder.
 * @param input.oracle - The oracle's inputs, whose driver declares the probe elements.
 * @param input.probes - The probes.
 * @returns Each probe's judgment, in probe order.
 */
export const judgeProbes = Effect.fn("lexical.judgeProbes")(function* judgeProbes(input: {
  readonly directory: string;
  readonly name: string;
  readonly oracle: XsdOracle;
  readonly probes: readonly Probe[];
}) {
  const { directory, name, oracle, probes } = input;
  const fs = yield* FileSystem.FileSystem;
  const batchOf = (file: string, held: readonly Probe[]) =>
    Effect.as(
      fs.writeFileString(
        `${directory}/${file}`,
        [`<d:batch xmlns:d="${driverNamespace}">`, ...held.map(probeLine), "</d:batch>", ""].join(
          "\n",
        ),
      ),
      `${directory}/${file}`,
    );
  // An `xs:ID` value is unique in its document, so a probe of an ID domain stands alone in a
  // document of its own: in a shared batch a repeated value would be refused as a duplicate.
  const isId = (probe: Probe): boolean => Option.contains(probe.domain.identity, "ID");
  const shared = probes.filter((probe) => !isId(probe));
  const alone = probes.filter(isId);
  const files = [
    yield* batchOf(`${name}.xml`, shared),
    ...(yield* Effect.all(
      alone.map((probe, at) => batchOf(`${name}-id-${String(at)}.xml`, [probe])),
    )),
  ];
  const placed = new Map<Probe, readonly [file: number, line: number]>([
    ...shared.map((probe, at) => [probe, [0, at + 2]] as const),
    ...alone.map((probe, at) => [probe, [at + 1, 2]] as const),
  ]);
  const verdicts = yield* xmllintValidate({
    catalog: oracle.catalog,
    paths: files,
    schema: oracle.driver,
  });
  const byFile = verdicts.map((verdict) =>
    Map.groupBy(verdict._tag === "Valid" ? [] : verdict.messages, ({ line }) => line),
  );
  // Any parser error but libxml2's own xml:id check of a value (`isXmlIdCheck`), which judges a
  // probe's value and not the batch's form, means the batch is not the one written.
  const broken = verdicts
    .flatMap((verdict) => (verdict._tag === "Valid" ? [] : verdict.messages))
    .filter(
      ({ line, source, text }) =>
        line === 1 || (source === "parser" && /^\S+ error :/u.test(text) && !isXmlIdCheck(text)),
    );
  if (broken.length > 0) {
    yield* Effect.die(
      new Error(`a batch is not a batch of probes: ${JSON.stringify(broken.slice(0, 3))}`),
    );
  }

  return probes.map((probe): Judged => {
    const [file, line] = placed.get(probe) ?? [0, 0];
    const { outcome, said } = outcomeOf(probe, byFile[file]?.get(line) ?? []);

    return {
      folded: accepts(probe.domain, normalized(probe.value, probe.whiteSpace)) && resolves(probe),
      grammar: accepts(probe.domain, probe.value) && resolves(probe),
      outcome,
      probe,
      said,
    };
  });
});

/**
 * Read a judged probe as a disagreement: `xmllint` found no declaration of the attribute, or it
 * judged the value and its verdict differs from the grammar's.
 *
 * @param judged - The judged probe.
 * @returns The disagreement, none where the two agree or `xmllint` did not judge the value.
 */
export const disagreementOf = (judged: Judged): Option.Option<Disagreement> =>
  judged.outcome === "undeclared" ||
  (judged.outcome !== "unjudged" && (judged.outcome === "valid") !== judged.grammar)
    ? Option.some({
        folded: judged.folded,
        grammar: judged.grammar,
        messages: judged.said,
        probe: judged.probe,
        xsd: judged.outcome,
      })
    : Option.none();

/**
 * Write a disagreement as a line of `differences.tsv`.
 *
 * @param disagreement - The disagreement.
 * @param match - The record it matched, if any.
 * @returns The fields.
 */
export const differenceLine = (
  disagreement: Disagreement,
  match: Recorded | undefined,
): readonly string[] => {
  const { folded, grammar: grammarAccepts, messages, probe, xsd } = disagreement;

  return [
    probe.kind,
    subjectName(probe.subject),
    probe.domain.handle,
    probe.domain.primitive,
    probe.whiteSpace,
    probe.variant,
    probe.value.length > 80
      ? `${probe.value.slice(0, 20)}…(${String(probe.value.length)})`
      : probe.value,
    xsd,
    grammarAccepts ? "accepts" : "refuses",
    folded ? "accepts after its class" : "",
    match === undefined ? "UNRECORDED" : reasonText(match.reason),
    messages.slice(0, 300),
  ];
};

/**
 * The minimal schemas and instances that show each libxml2 departure a record names: every element
 * `e` of the instance is one probe, and `refused` lists the probes libxml2 refuses, each a value
 * XML Schema 1.0 Part 2 admits, or `accepted` the ones it accepts that Part 2 refuses.
 */
export const proofs = {
  base64: {
    accepted: ['"', "&amp;", "é"],
    type: "xs:base64Binary",
  },
  emptyLists: {
    accepted: ["", " ", "&#10; "],
    type: "xs:NMTOKENS",
  },
  exponent: {
    accepted: ["1e", "1E", "0e", "1.5E", "-2e+", ".5e-", "&#9;1e", "1e "],
    type: "xs:double",
  },
  fifthEditionNames: {
    accepted: ["ä€𝄞", "㐀", "𐀀", "Ĳ", "ːa"],
    type: "xs:NCName",
  },
  nan: {
    accepted: ["NaN", "&#9;NaN", " NaN"],
    type: "nonNegativeDouble",
  },
  schemaLocation: {
    accepted: [":", "a :", "D264&#13;:"],
    attribute: "xsi:schemaLocation",
    type: "xs:string",
  },
  specialTrailing: {
    refused: ["INF ", "-INF&#10;", "NaN&#9;"],
    type: "xs:double",
  },
} as const;

/**
 * Write a proof's instance: a root `r` of one `e` element per value, each value the element's text,
 * or the value of the attribute the proof names.
 *
 * @param proof - The proof.
 * @returns The instance's text, value `i` on line `i + 2`.
 */
export const proofInstance = (proof: (typeof proofs)[ProofName]): string => {
  const values: readonly string[] = "refused" in proof ? proof.refused : proof.accepted;
  const element = (value: string): string =>
    "attribute" in proof
      ? `<e xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" ${proof.attribute}="${value}"/>`
      : `<e>${value}</e>`;

  return ["<r>", ...values.map(element), "</r>", ""].join("\n");
};

/**
 * Write a proof's schema: a root `r` of `e` elements whose text is of the proof's type.
 *
 * @param type - The type, a built-in or `nonNegativeDouble` (xs:double, minInclusive 0).
 * @returns The schema's text.
 */
export const proofSchema = (type: string): string =>
  [
    '<xs:schema xmlns:xs="http://www.w3.org/2001/XMLSchema">',
    '  <xs:simpleType name="nonNegativeDouble"><xs:restriction base="xs:double"><xs:minInclusive value="0"/></xs:restriction></xs:simpleType>',
    `  <xs:element name="r"><xs:complexType><xs:sequence><xs:element name="e" type="${type}" maxOccurs="unbounded"/></xs:sequence></xs:complexType></xs:element>`,
    "</xs:schema>",
    "",
  ].join("\n");
