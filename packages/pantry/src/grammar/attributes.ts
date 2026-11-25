/**
 * The attribute grammar (review U1; fin.md §16, §17): `AttributeGrammar`, `ValueDomain`,
 * `ValueIdentity` and `TextDomain`, generated from the declarations the vocabulary leaves derive
 * from the pinned XSDs, and from nothing else but QTI's recorded spec readings.
 *
 * An element's attributes are one relation, `Attribute(node, at, name, lexical)`, and one CHECK
 * holds both admission and lexical validity:
 * `lexical ~ ValueDomain.pattern.at(AttributeGrammar.domain.at(kind, name))`. A name the kind does
 * not admit reads no domain, NULL, and the CHECK refuses it.
 *
 * - `AttributeGrammar` is (kind, name) → (domain, use, position): each attribute an element of a kind
 *   may carry, the value domain it is read under, whether the kind requires it, and its position
 *   among the names the kind admits (D8), the coordinate a node's `attrs` set is over. `Required`
 *   is its side selected by `use = required`.
 * - `ValueDomain` is domain → (primitive, pattern, facets): one compiled lexical definition
 *   (`src/grammar/domains.ts`), the pattern an open-typed text payload. Each handle is one distinct
 *   definition.
 * - `ValueIdentity` is domain → identity, for the domains whose values are XML Schema's `ID`, `IDREF`
 *   or `IDREFS`, which the document's identity laws read. Most domains are none of them, so it is a
 *   relation of its own rather than a field.
 * - `TextDomain` is kind → domain: the domain of a simple-content kind's one text child.
 * - `Governor` is (kind, type) → governor, `GovernedAttribute` is (governor, name) → (domain, use,
 *   position), and `TypeText` is type → domain. An element whose `xsi:type` names a type derived
 *   from its kind's declared one is validated against that type, so its admitted and required
 *   attributes, their domains and its text's domain are the type's (XML Schema 1.0 Part 1, §3.3.4,
 *   clause 5.2.1; spec reading 84), and a foreign element a simple type governs admits the four
 *   `xsi:` names alone and holds text in the type's domain (§3.3.4, Element Locally Valid (Type),
 *   clause 3.1; spec reading 60). The (kind, type) pair is the governor, read in place of the kind
 *   wherever the element's attributes and text are, and the rules QTI's readings state stay its
 *   kind's: a reading applies by the element's name, never by its type ({@link admissionOf},
 *   {@link textDomainOf}).
 *
 * A declaration's domain is the leaf's resolution of its XSD type (`Domain`), with a spec reading
 * applied where QTI reads the attribute otherwise ({@link specReadings}).
 */
import { regex } from "arkregex";
import { Array as Arr, Option, Result, Schema } from "effect";
import {
  closed,
  idField,
  indexed,
  int8Max,
  int8Min,
  numerals,
  OutsideCodeSpace,
  roster,
  tupleKey,
  valueField,
} from "#pantry/grammar/closed.ts";
import type {
  Closed,
  IdField,
  Indexed,
  NonEmptyRoster,
  Roster,
  ValueField,
} from "#pantry/grammar/closed.ts";
import {
  boundFacets,
  domainPrimitives,
  identities,
  openCompiled,
  whiteSpaceClasses,
} from "#pantry/grammar/domains.ts";
import type {
  UnreadDomain,
  CompiledDomain,
  DomainPrimitive,
  DoubleBound,
  Identity,
  Reading,
  ValueNormalization,
  WhiteSpaceClass,
} from "#pantry/grammar/domains.ts";
import { attributeDeclarations, openAttribute } from "#pantry/vocab/inventory/attributes.ts";
import type { Domain, Facet, ValueType } from "#pantry/vocab/inventory/types.ts";
import { valueDomainRoster } from "#pantry/grammar/value-domain-roster.ts";

/**
 * Whether the XSD requires an attribute.
 */
export type Use = "optional" | "required";

/**
 * The `Use` roster: whether an element of a kind must carry an attribute.
 */
export const uses = ["optional", "required"] as const satisfies readonly Use[];

/**
 * One value domain: its handle, the name of the type it was first compiled from, and its compiled
 * definition.
 */
export interface ValueDomain extends CompiledDomain {
  /**
   * The definition, as the attribute grammar read it, that the domain was first compiled from:
   * what the tests read its enumeration by (`enumerationKept`), held, never read, by a load.
   */
  readonly definition: Domain;
  readonly handle: string;
}

/**
 * The domain every open name's lexical form is read under (fin.md, D2): `xs:anySimpleType`, every
 * value, whitespace preserved. No declaration governs an open name, so its value is kept as
 * written and no typed value is derived from it.
 */
export const openDomain: ValueDomain = {
  ...openCompiled,
  definition: openAttribute.domain,
  handle: openAttribute.type.type,
};

/**
 * The `BaseType` roster in code order: the code space of every base-type field, `BindingFit`'s and
 * `MappableBaseType`'s among them. Its members are the XSD's `BaseTypeDType` enumeration
 * (`attributes.test.ts` reads them from the leaf); its order is the roster's own, append-only.
 */
export const baseTypes: Arr.NonEmptyReadonlyArray<string> = [
  "boolean",
  "integer",
  "float",
  "string",
  "identifier",
  "uri",
  "duration",
  "point",
  "pair",
  "directedPair",
  "file",
];

/**
 * The forms a `base-type` is spelled as, each the code it spells: {@link baseTypes}, the XSD's
 * `BaseTypeDType` enumeration. It restricts `xs:string`, whose whitespace is preserved, so a form
 * is compared as written: a padded one spells none, which its value domain refuses. It is the one
 * reading of a base type, the importer's and the law oracle's, so a declaration whose `base-type`
 * is written and spells none has no row and no law reads a type of it (the orchestrator's ruling of
 * 2026-11-06: one cause is refused under one rule; lane NIL's audit, B11).
 */
export const spelledBaseTypes: ReadonlySet<string> = new Set(baseTypes);

/**
 * One attribute a kind declares: the leaf's `AttributeDeclaration`, or one
 * the composition states (the document layer's `xml:` and `xsi:` names and the open classes), each
 * with its XSD type and that type's resolved domain.
 */
export interface Declared {
  readonly domain: Domain;
  readonly kind: string;
  readonly name: string;
  readonly type: ValueType;
  readonly use: Use;
}

/**
 * The text type of one simple-content kind: the leaf's `TextType`.
 */
interface DeclaredText {
  readonly domain: Domain;
  readonly kind: string;
  readonly type: ValueType;
}

/**
 * A governor: a named type an `xsi:type` may give an element of a kind in place of
 * the kind's declared type, which then governs it (XML Schema 1.0 Part 1, §3.3.4, Element Locally
 * Valid (Element), clauses 4.3 and 5.2.1; spec reading 84), or a simple type that governs a foreign
 * element's text (spec reading 60). `governs` is its `TypeName` handle.
 */
export interface Governor {
  readonly governs: string;
  readonly kind: string;
}

/**
 * One attribute an element of a kind carries under a governor: the governing type's own
 * declaration, or one the composition states for it, as {@link Declared} is for the kind.
 */
export interface GovernedDeclared extends Declared {
  readonly governs: string;
}

/**
 * Spell a governor's `Governor` handle: its kind and its governing type's `TypeName` handle, which
 * holds no space.
 *
 * @param governor - The governor's kind and type.
 * @param governor.governs - The governing type's handle.
 * @param governor.kind - The kind.
 * @returns The handle.
 */
export const governorHandle = ({
  governs,
  kind,
}: {
  readonly governs: string;
  readonly kind: string;
}): string => `${kind} ${governs}`;

/**
 * The text type of one named type with simple content: the leaf's `TypeText`, keyed by the type's
 * `TypeName` handle.
 */
interface DeclaredTypeText {
  readonly domain: Domain;
  readonly owner: string;
  readonly type: ValueType;
}

/**
 * Replace a definition's facets of some names with others: a spec reading's narrowing.
 *
 * @param domain - The definition.
 * @param replace - The facets that take the place of every facet of their names.
 * @returns The definition with them.
 */
const withFacets = (domain: Domain, replace: readonly Facet[]): Domain => {
  const names = new Set(replace.map(({ facet }) => facet));

  return {
    ...domain,
    facets: [...domain.facets.filter(({ facet }) => !names.has(facet)), ...replace],
  };
};

/**
 * Add one pattern to an atomic definition beside the patterns it states: a spec reading's
 * narrowing of its lexical space. A value meets one pattern of each set (XML Schema Part 2,
 * §4.3.4), so the value must match this one as well as the type's own, after the type's whitespace
 * normalization.
 *
 * @param domain - The atomic definition.
 * @param pattern - The pattern, in XSD's regular expression language.
 * @returns The definition with it.
 * @see {@link https://www.w3.org/TR/xmlschema-2/#rf-pattern | XML Schema Part 2, 4.3.4 pattern}
 */
const withPattern = (domain: Domain, pattern: string): Domain => ({
  ...domain,
  patterns: [...domain.patterns, [pattern]],
});

/**
 * Narrow an integer definition to the signed 64-bit range, keeping a tighter bound it states, and
 * every integer member of a union likewise.
 *
 * @param domain - The definition.
 * @returns The narrowed definition.
 */
const toInt64 = (domain: Domain): Domain => {
  if (domain._tag === "union") {
    return { ...domain, members: domain.members.map(toInt64) };
  }

  if (domain._tag !== "atomic" || domain.primitive !== "decimal") {
    return domain;
  }

  const bound = (
    name: "maxInclusive" | "minInclusive",
    limit: string,
    tighter: (a: bigint, b: bigint) => boolean,
  ) => {
    const stated = domain.facets.find(({ facet }) => facet === name);

    return stated !== undefined && tighter(BigInt(stated.value), BigInt(limit))
      ? stated.value
      : limit;
  };

  return withFacets(domain, [
    { facet: "maxInclusive", value: bound("maxInclusive", String(int8Max), (a, b) => a < b) },
    { facet: "minInclusive", value: bound("minInclusive", String(int8Min), (a, b) => a > b) },
  ]);
};

/**
 * One QTI spec reading of an attribute's value (`docs/spec-readings.md`): the reading's number, the
 * kinds it reads the attribute on (none for every kind that declares it), the attribute, how its
 * whitespace is read, and the definition it reads the XSD's as. A reading that reads the attribute
 * under another named type in place of its declared one names that type (`readAs`), and its domain
 * is named after it ({@link handleOf}).
 */
interface SpecReading {
  readonly kinds: Option.Option<readonly string[]>;
  readonly name: string;
  readonly reading: number;
  readonly read: (domain: Domain) => Domain;
  readonly readAs: Option.Option<string>;
  readonly whiteSpace: Reading;
}

/**
 * The definition as the XSD declares it: the definition of a reading that reads only the value's
 * whitespace.
 *
 * @param domain - The definition.
 * @returns The definition.
 */
const asDeclared = (domain: Domain): Domain => domain;

/**
 * A reading of the attribute on the listed kinds.
 *
 * @param reading - The reading's number.
 * @param kinds - The kinds.
 * @param name - The attribute.
 * @param whiteSpace - How its whitespace is read.
 * @param read - The definition it reads the XSD's as.
 * @returns The reading.
 */
const on = (
  reading: number,
  kinds: readonly string[],
  name: string,
  whiteSpace: Reading,
  read: (domain: Domain) => Domain,
): SpecReading => ({
  kinds: Option.some(kinds),
  name,
  read,
  readAs: Option.none(),
  reading,
  whiteSpace,
});

/**
 * A reading of the attribute on every kind that declares it, its whitespace read as its type reads
 * it.
 *
 * @param reading - The reading's number.
 * @param name - The attribute.
 * @param read - The definition it reads the XSD's as.
 * @returns The reading.
 */
const everywhere = (
  reading: number,
  name: string,
  read: (domain: Domain) => Domain,
): SpecReading => ({
  kinds: Option.none(),
  name,
  read,
  readAs: Option.none(),
  reading,
  whiteSpace: "xsd",
});

/**
 * `xs:string`'s definition, every value with its whitespace preserved: what spec reading 8 reads a
 * match table entry's `target-value` as before the overlay types it by the outcome's base type.
 */
const stringDomain: Domain = {
  _tag: "atomic",
  builtin: "string",
  facets: [{ facet: "whiteSpace", value: "preserve" }],
  patterns: [],
  primitive: "string",
};

/**
 * SSML 1.1's `speak/@version`, which "must have the value \"1.1\"" (SSML 1.1, §3.1.1): spec
 * reading 39 narrows the XSD's `version.datatype`, an `xs:NMTOKEN`, to that one value. The type's
 * `collapse` whitespace stays the XSD's.
 *
 * @param domain - The XSD's definition.
 * @returns It with the one enumeration value.
 * @see {@link https://www.w3.org/TR/speech-synthesis11/#S3.1.1 | SSML 1.1, 3.1.1 speak Root Element}
 */
const ssmlVersion = (domain: Domain): Domain =>
  withFacets(domain, [{ facet: "enumeration", value: "1.1" }]);

/**
 * An `xi:include`'s `accept` or `accept-language`, which `XInclude.xsd` types `xs:string`: spec
 * reading 118 narrows it to the characters an HTTP header holds, since XInclude says "Values
 * containing characters outside the range #x20 through #x7E must be flagged as fatal errors"
 * (XInclude 1.0 Second Edition, §3.1).
 *
 * @param domain - The XSD's definition.
 * @returns It with the pattern.
 * @see {@link https://www.w3.org/TR/xinclude/#include_element | XInclude 1.0, 3.1 xi:include Element}
 */
const httpHeaderText = (domain: Domain): Domain =>
  withFacets(domain, [{ facet: "pattern", value: "[ -~]*" }]);

/**
 * An Extended Language Range (RFC 4647, §2.2), `(1*8ALPHA / "*") *("-" (1*8alphanum / "*"))`, as
 * an XSD pattern, but for the two values SSML 1.1 §3.2.1 disallows, `und` and `zxx`, compared
 * without regard to ASCII case (RFC 4647, §2: language ranges "are to be treated as
 * case-insensitive"). A range of more than one subtag is never one of the two, whatever its first.
 */
const languageRange = (() => {
  const first = String.raw`[A-Za-z]{1,8}|\*`;
  const subtags = String.raw`(-([A-Za-z0-9]{1,8}|\*))+`;
  const single = [
    String.raw`\*`,
    String.raw`[A-Za-z]{1,2}`,
    String.raw`[A-Za-z]{4,8}`,
    String.raw`[A-TV-Ya-tv-y][A-Za-z]{2}`,
    String.raw`[Uu]([A-MO-Za-mo-z][A-Za-z]|[Nn][A-CE-Za-ce-z])`,
    String.raw`[Zz]([A-WYZa-wyz][A-Za-z]|[Xx][A-WYZa-wyz])`,
  ].join("|");

  return `((${first})${subtags}|${single})`;
})();

/**
 * SSML 1.1's `voice/@languages`, "either the empty string \"\" or a space-separated list of
 * languages", each "of the form \"language\" or \"language:accent\", where both language and
 * accent must be an Extended Language Range ... except that the values \"und\" and \"zxx\" are
 * disallowed" (SSML 1.1, §3.2.1): spec reading 42 gives each token of the XSD's `xs:NMTOKENS`
 * member that form, and keeps its empty-string member.
 *
 * A value is valid only where both the Recommendation and its schema admit it: a conforming SSML
 * document or fragment adheres to the Recommendation "including the constraints expressed in the"
 * Core Schema of Appendix D (§2.2.1 and §2.2.2), and "This appendix is normative". That schema's
 * `languages.datatype` is the same union (`ssml/synthesis-nonamespace.xsd` lines 338 to 340, as
 * in the W3C's own copy), and an NMTOKEN holds no `*`, since `*` is no XML name character. So the
 * `*` subtag an Extended Language Range allows is refused: `*`, `en-*` and `*-US` meet the range
 * pattern and fail the token's `xs:NMTOKEN` pattern, which the union keeps.
 *
 * @param domain - The XSD's `languages.datatype`, a union of `xs:NMTOKENS` and the empty string.
 * @returns The union with each list token narrowed.
 * @see {@link https://www.w3.org/TR/speech-synthesis11/#S3.2.1 | SSML 1.1, 3.2.1 voice Element}
 * @see {@link https://www.w3.org/TR/speech-synthesis11/#S2.2.2 | SSML 1.1, 2.2.2 Conforming Stand-Alone Speech Synthesis Markup Language Documents}
 * @see {@link https://www.w3.org/TR/speech-synthesis11/#AppD | SSML 1.1, Appendix D, Schema for the Speech Synthesis Markup Language}
 * @see {@link https://www.rfc-editor.org/rfc/rfc4647#section-2.2 | RFC 4647, 2.2 Extended Language Range}
 */
const ssmlLanguages = (domain: Domain): Domain =>
  domain._tag === "union"
    ? {
        ...domain,
        members: domain.members.map((member) =>
          member._tag === "list"
            ? {
                ...member,
                item: {
                  ...member.item,
                  patterns: [...member.item.patterns, [`${languageRange}(:${languageRange})?`]],
                },
              }
            : member,
        ),
      }
    : domain;

/**
 * A `qti-index`'s `n`, which the XSD types as a union of `xs:NCName` and `xs:int`: spec reading 120
 * holds its `xs:int` member to 1 and above, since "'n' must be a positive integer" (information
 * model §5.72, Index). An NCName never starts with a digit or a sign, so `0`, `+0` and `-3` meet
 * only that member, and fail it. An NCName names a variable whose value is read at run time ("If
 * 'n' is an identifier, it is the value of 'n' at runtime that is used"), which the attribute
 * cannot judge.
 *
 * @param domain - The XSD's union.
 * @returns The union with its integer member at least 1.
 * @see {@link https://www.imsglobal.org/spec/qti/v3p0/info#Data_Index | QTI 3.0 information model, 5.72 Index}
 */
const positiveIndex = (domain: Domain): Domain =>
  domain._tag === "union"
    ? {
        ...domain,
        members: domain.members.map((member) =>
          member._tag === "atomic" && member.primitive === "decimal"
            ? withFacets(member, [{ facet: "minInclusive", value: "1" }])
            : member,
        ),
      }
    : domain;

/**
 * A `bdo`'s `dir`, which the XSD types as `ltr`, `rtl` or `auto`, with `auto` its default: spec
 * reading 123 takes `auto` away, since "Authors must specify the dir attribute on this tag, with
 * the value ltr to specify a left-to-right override and with the value rtl to specify a
 * right-to-left override. The auto value must not be specified" (information model §5.11, BDO).
 * {@link readingUses} makes it required, so the XSD's default is never read.
 *
 * @param domain - The XSD's enumeration.
 * @returns It without `auto`.
 * @see {@link https://www.imsglobal.org/spec/qti/v3p0/info#Data_BDO | QTI 3.0 information model, 5.11 BDO}
 */
const overrideDirection = (domain: Domain): Domain => ({
  ...domain,
  facets: domain.facets.filter(({ facet, value }) => facet !== "enumeration" || value !== "auto"),
});

/**
 * The roles the Schematron's RULE ARIA ROLE 1b leaves an `h1`: "The 'h1' tag may have an ARIA role
 * value of 'heading' or 'tab' or 'presentation' only" (ASI binding §5.3.1, `RULE_SET_ARIA_ROLES_1`,
 * which the ASI XSD embeds).
 *
 * @see {@link https://www.imsglobal.org/spec/qti/v3p0/bind | QTI 3.0 ASI binding, 5.3.1 RULE_SET_ARIA_ROLES_1}
 */
const headingRoles: ReadonlySet<string> = new Set(["heading", "tab", "presentation"]);

/**
 * An `h1`'s `role`, which the XSD types as an enumeration of 74 ARIA roles, its whitespace
 * preserved: spec reading 9 keeps of them the three {@link headingRoles} names. The binding's
 * section 5 "is NORMATIVE", and its explicit rules are those "used to enforce the features of the
 * Information Model that are otherwise not enforced in the XSD" (§5.3), so where the rule is
 * stricter than the XSD it is the rule. The rule's test compares `@role` with each name as
 * written, as the XSD's `preserve` does, and a role the XSD does not list is refused by both. `h2`
 * to `h6` keep every role the XSD lists.
 *
 * @param domain - The XSD's enumeration.
 * @returns It with the three roles alone.
 * @see {@link https://www.imsglobal.org/spec/qti/v3p0/bind | QTI 3.0 ASI binding, 5.3 The Explicit Rule Definitions}
 */
const headingRole = (domain: Domain): Domain => ({
  ...domain,
  facets: domain.facets.filter(
    ({ facet, value }) => facet !== "enumeration" || headingRoles.has(value),
  ),
});

/**
 * Spell a literal as an XSD pattern that matches it without regard to ASCII case, each letter a
 * class of its two cases.
 *
 * @param literal - Letters, digits and hyphens.
 * @returns The pattern.
 */
const caseless = (literal: string): string =>
  Array.from(literal, (character) =>
    regex("[A-Za-z]", "u").test(character)
      ? `[${character.toUpperCase()}${character.toLowerCase()}]`
      : character,
  ).join("");

/**
 * The 26 grandfathered tags of RFC 5646's `irregular` and `regular` productions (§2.1, Figure 1),
 * "a fixed list that can never change".
 */
const grandfatheredTags = [
  "en-GB-oed",
  "i-ami",
  "i-bnn",
  "i-default",
  "i-enochian",
  "i-hak",
  "i-klingon",
  "i-lux",
  "i-mingo",
  "i-navajo",
  "i-pwn",
  "i-tao",
  "i-tay",
  "i-tsu",
  "sgn-BE-FR",
  "sgn-BE-NL",
  "sgn-CH-DE",
  "art-lojban",
  "cel-gaulish",
  "no-bok",
  "no-nyn",
  "zh-guoyu",
  "zh-hakka",
  "zh-min",
  "zh-min-nan",
  "zh-xiang",
] as const;

/**
 * A well-formed BCP 47 language tag, RFC 5646's `Language-Tag` (§2.1, Figure 1), as an XSD
 * pattern: a `langtag`, a `privateuse` tag or a grandfathered one. Tags "are to be treated as case
 * insensitive" (§2.1.1), as ABNF strings are (RFC 5234, §2.3), so each production is written over
 * the letters of both cases, and its repetitions are unbounded, as the ABNF's `*` is. Whitespace
 * is never part of a tag ("Whitespace is not permitted in a language tag", §2.1).
 *
 * A tag is well-formed when it conforms to the ABNF, and valid when it is also free of duplicate
 * variant and singleton subtags and its subtags are in the IANA Language Subtag Registry (§2.2.9).
 * Only well-formedness is a pattern: the registry is a dated dataset no pinned source holds, and a
 * repeated subtag is a comparison between subtags no pattern without backreferences states, so
 * validity is spec reading 129's stated limit. `lom-title` reads a root's `xml:lang` by it too: a
 * form that is no tag states no language (spec reading 151, `#pantry/qti/metadata.ts`).
 *
 * @see {@link https://www.rfc-editor.org/rfc/rfc5646#section-2.1 | RFC 5646, 2.1 Syntax}
 * @see {@link https://www.rfc-editor.org/rfc/rfc5646#section-2.2.9 | RFC 5646, 2.2.9 Classes of Conformance}
 */
export const languageTag = (() => {
  const language = "[A-Za-z]{2,3}(-[A-Za-z]{3}){0,3}|[A-Za-z]{4}|[A-Za-z]{5,8}";
  const langtag = [
    `(${language})`,
    "(-[A-Za-z]{4})?",
    "(-([A-Za-z]{2}|[0-9]{3}))?",
    "(-([A-Za-z0-9]{5,8}|[0-9][A-Za-z0-9]{3}))*",
    "(-[0-9A-WY-Za-wy-z](-[A-Za-z0-9]{2,8})+)*",
    "(-[Xx](-[A-Za-z0-9]{1,8})+)?",
  ].join("");
  const privateuse = "[Xx](-[A-Za-z0-9]{1,8})+";

  return [langtag, privateuse, ...grandfatheredTags.map(caseless)].join("|");
})();

/**
 * A `lang`, on every kind that declares it, which the XSD types `xs:normalizedString`: spec reading
 * 129 reads it as the information model's `lang` rows state it, "Its value must be a valid [BCP
 * 47] language tag, or the empty string" (§5.15.3 to §5.21.3). The type's `replace` whitespace
 * stays, so a space around the tag is no part of it, and refused.
 *
 * @param domain - The XSD's definition.
 * @returns It with the pattern.
 * @see {@link https://www.imsglobal.org/spec/qti/v3p0/info#DataCharacteristic_BasePromptInteraction.Attr_lang | QTI 3.0 information model, 5.15.3 lang}
 */
const languageOrEmpty = (domain: Domain): Domain => withPattern(domain, `(${languageTag})?`);

/**
 * An `xml:lang`, on every kind: spec reading 129 reads it as XML 1.0 states it, "language
 * identifiers as defined by [IETF BCP 47] ...; in addition, the empty string may be specified"
 * (§2.12). `xml.xsd` types it as a union of `xs:language`, whose pattern is RFC 3066's and admits
 * values RFC 5646 refuses (`a-value` and `x` among them), and the empty string; its `xs:language`
 * member takes {@link languageTag} beside its own pattern, collapsed as the type collapses it. Under
 * a `skip` wildcard no declaration types it, so its value as written is a tag or empty: XML 1.0's
 * sentence is XML's own rule, which holds whatever a schema's processing.
 *
 * @param domain - `xml.xsd`'s union, or the open type under a `skip` wildcard.
 * @returns It with its language read as BCP 47.
 * @see {@link https://www.w3.org/TR/xml/#sec-lang-tag | XML 1.0, 2.12 Language Identification}
 */
const xmlLanguage = (domain: Domain): Domain => {
  if (domain._tag === "union") {
    return {
      ...domain,
      members: domain.members.map((member) =>
        member._tag === "atomic" && member.builtin === "language"
          ? withPattern(member, languageTag)
          : member,
      ),
    };
  }

  return domain._tag === "atomic" ? languageOrEmpty(domain) : domain;
};

/**
 * The item's and the stimulus's `xml:lang`, their default language, "Natural language identifiers
 * as defined by [BCP 47]" (information model §4.1.4 and §4.3.4), which state no empty value where
 * XML 1.0 and the `lang` rows do: spec reading 129 takes `xml.xsd`'s empty-string member away.
 *
 * @param domain - The union as {@link xmlLanguage} reads it.
 * @returns The union of its members but the empty string's.
 * @see {@link https://www.imsglobal.org/spec/qti/v3p0/info#RootCharacteristic_AssessmentItem.Attr_language | QTI 3.0 information model, 4.1.4 language}
 */
const rootLanguage = (domain: Domain): Domain =>
  domain._tag === "union"
    ? {
        ...domain,
        members: domain.members.filter(
          (member) =>
            !member.facets.some(({ facet, value }) => facet === "enumeration" && value === ""),
        ),
      }
    : domain;

/**
 * A `track`'s `srclang`, which the XSD types `xs:normalizedString`: spec reading 129 reads it as
 * "The value must be a valid ]BCP 47] language tag" (information model §5.163.3, Track), which
 * states no empty value.
 *
 * @param domain - The XSD's definition.
 * @returns It with the pattern.
 * @see {@link https://www.imsglobal.org/spec/qti/v3p0/info#DataCharacteristic_Track.Attr_srclang | QTI 3.0 information model, 5.163.3 srclang}
 */
const languageOnly = (domain: Domain): Domain => withPattern(domain, languageTag);

/**
 * A media URL, which the XSD types `URLDType`, an `xs:normalizedString`: the information model says
 * each "must contain a valid non-empty URL potentially surrounded by spaces" (audio and video
 * `src`, §5.9.1 and §5.166.1; video `poster`, §5.166.9; source `src`, §5.135.1; track `src`,
 * §5.163.2), and the HTML Standard that a `srcset` "must consist of one or more image candidate
 * strings", each holding a valid non-empty URL. Spec readings 124 and 125 read the non-empty
 * clause: after `replace` maps every tab and line break to a space, the value holds a character
 * that is not a space. The URL's own syntax is the URL Standard's, which no pinned source holds, so
 * the readings state it as a limit.
 *
 * @param domain - The XSD's definition.
 * @returns It with the pattern.
 * @see {@link https://html.spec.whatwg.org/multipage/images.html#srcset-attributes | HTML Standard, srcset attributes}
 */
const nonEmptyUrl = (domain: Domain): Domain => withPattern(domain, ".*[^ ].*");

/**
 * A `qti-printed-variable`'s `format`, which the XSD types `xs:normalizedString`: spec reading 132
 * reads it as the information model's number format, "based on the format conversion specifiers
 * defined in the C programming language [ISO 9899] for use with printf and related functions. Each
 * conversion specifier starts with a '%' character and is followed by zero or more flag characters
 * (#, 0, -, " " [space] and +), an optional digit string indicating the minimum field width, an
 * optional precision (consisting of a "." followed by zero or more digits) and finally one of the
 * conversion type codes: E, e, f, G, g, r, R, i, o, X, or x" (§2.3.4). Spec reading 171 adds `d`
 * to that list: the sentence stands in a section the information model marks not normative, the
 * implementation guide's own example writes `format="%d"`, and C reads `d` as it reads `i` (C11
 * §7.21.6.1; PR #46, comment 6722164084). So a format is a printf format string over those codes
 * and `d`: characters but `%`, the escape `%%`, and conversion specifiers, any number of them. Spec
 * reading 161 sets aside reading 132's rule of at most one specifier: QTI bans no second
 * conversion, C's undefined behaviour for a missing argument (C11 §7.21.6.1) is no QTI prohibition,
 * and pantry never renders, so `%i of %i` is stored as written and how it prints is the renderer's
 * call. `%%` converts no argument, and a format with no specifier prints its text alone. A `%` that
 * begins no specifier, and a code that is not listed, are refused, wherever they stand.
 *
 * @see {@link https://www.imsglobal.org/spec/qti/v3p0/info#Variable | QTI 3.0 information model, 2.3.4 Variable Content}
 * @see {@link https://www.open-std.org/jtc1/sc22/wg14/www/docs/n1570.pdf | C11 (N1570), 7.21.6.1 The fprintf function}
 * @see {@link https://github.com/aidenzepp/qti-pie/pull/46#issuecomment-6701102861 | The ruling of two or more conversions, PR #46}
 * @see {@link https://github.com/aidenzepp/qti-pie/pull/46#issuecomment-6722164084 | The ruling admitting d, PR #46}
 */
const printfFormat = String.raw`([^%]|%%|%[#0 +\-]*[0-9]*(\.[0-9]*)?[EefGgrRiodXx])*`;

/**
 * A token of RFC 2045's media type, "1*<any (US-ASCII) CHAR except SPACE, CTLs, or tspecials>"
 * (§5.1), as an XSD pattern: the printable US-ASCII characters, `!` to `~`, less the fifteen
 * tspecials `(`, `)`, `<`, `>`, `@`, `,`, `;`, `:`, `\`, `"`, `/`, `[`, `]`, `?` and `=`.
 *
 * @see {@link https://www.rfc-editor.org/rfc/rfc2045#section-5.1 | RFC 2045, 5.1 Syntax of the Content-Type Header Field}
 */
const mediaTypeToken = String.raw`[!-~-[()<>@,;:\\"/\[\]?=]]+`;

/**
 * A MIME type, which the XSD types `MimeTypeDType`, an `xs:normalizedString` whose pattern admits
 * any Basic Latin character but RFC 2045's tspecials on either side of its one slash: spec reading
 * 135 reads it as the information model's data type states it, "The mime type (type and subtype),
 * as defined by [RFC 2045]" (§7.25, MimeType), which §5.1.2 (A) and §5.135.2 (Source) restate, "its
 * value must be a valid MIME type". RFC 2045's type and subtype are each a token
 * ({@link mediaTypeToken}), joined by `/` with nothing between (§5.1). So a space, written or a tab
 * or line break `replace` makes one, and a control character, `U+007F` the one XML admits, are
 * refused where the XSD admits them; a value meets the XSD's pattern too. The value is the type
 * itself, not a header field, so the header's whitespace and comments between tokens have no place
 * in it. A parameter is no part of "type and subtype", and the XSD refuses its `;` and `=`.
 *
 * The upload interaction's `type`, a list of MIME types (§5.165.1, MimeTypeList, which §9.1.3
 * derives from MimeType), reads each item so.
 *
 * Only RFC 2045's tokens are a pattern. Its type is one it lists, an `X-` name, or "An extension
 * token defined by a standards-track RFC and registered with IANA", and its subtype registered or
 * `X-`: IANA's registry is a dated dataset no pinned source holds, so registration is spec reading
 * 135's stated limit.
 *
 * @param domain - The XSD's definition, or the list of it.
 * @returns It with RFC 2045's media type as a second pattern, on each item of a list.
 * @see {@link https://www.imsglobal.org/spec/qti/v3p0/info#Derived_MimeType | QTI 3.0 information model, 7.25 MimeType}
 * @see {@link https://www.imsglobal.org/spec/qti/v3p0/info#DataCharacteristic_A.Attr_type | QTI 3.0 information model, 5.1.2 type}
 * @see {@link https://www.rfc-editor.org/rfc/rfc2045#section-5.1 | RFC 2045, 5.1 Syntax of the Content-Type Header Field}
 */
const mediaType = (domain: Domain): Domain => {
  if (domain._tag === "list") {
    return { ...domain, item: mediaType(domain.item) };
  }

  return domain._tag === "atomic"
    ? withPattern(domain, `${mediaTypeToken}/${mediaTypeToken}`)
    : domain;
};

/**
 * The XSD's names of the information model's MimeType and MimeTypeList: `MimeTypeDType`, and
 * `MimeTypeListDType`, its restriction, the item of the upload interaction's anonymous list.
 */
const mediaTypeNames: ReadonlySet<string> = new Set(["MimeTypeDType", "MimeTypeListDType"]);

/**
 * Spec reading 135's attribute readings: each attribute the leaf types as a MIME type or a list of
 * one ({@link mediaTypeNames}), on every kind that declares it, read by {@link mediaType}.
 */
const mediaTypeReadings: readonly SpecReading[] = [
  ...Map.groupBy(
    attributeDeclarations.filter(
      ({ type }) =>
        mediaTypeNames.has(type.type) ||
        Option.exists(
          type.inline,
          (inline) =>
            inline._tag === "list" &&
            inline.item._tag === "named" &&
            mediaTypeNames.has(inline.item.name),
        ),
    ),
    ({ name }) => name,
  ).entries(),
].map(([name, declarations]) =>
  on(135, [...new Set(declarations.map(({ kind }) => kind))], name, "xsd", mediaType),
);

/**
 * The counts spec reading 46 holds to the signed 64-bit range, on every kind that declares them.
 */
const counts = [
  "max-choices",
  "min-choices",
  "max-associations",
  "min-associations",
  "match-max",
  "match-min",
  "max-plays",
  "min-plays",
] as const;

/**
 * MathML 3's `positive-integer` notation, "a string of decimal-digits, but not consisting solely
 * of "0"s (U+0030), representing a positive integer" (§2.1.5.1), as an XSD pattern over the value
 * after its whitespace is collapsed: {@link mathmlNotations}' `m:positive-integer`, and the
 * notation spec reading 2 reads a content `cn`'s `base` by.
 */
const positiveInteger = "[0-9]*[1-9][0-9]*";

/**
 * MathML 3's notation for the three integer types and `number` (§2.1.5.1, "Syntax notation used in
 * the MathML specification"), as XSD patterns over the value after its whitespace is collapsed:
 *
 * - `unsigned-integer`, "a string of decimal-digits, representing a non-negative integer";
 * - `positive-integer`, "a string of decimal-digits, but not consisting solely of "0"s (U+0030),
 *   representing a positive integer";
 * - `integer`, "an optional "-" (U+002D), followed by a string of decimal digits, and representing an
 *   integer";
 * - `number`, "an optional prefix of "-" (U+002D), followed by an unsigned number", an
 *   `unsigned-number` being "a string of decimal digits with up to one decimal point (U+002E)".
 *
 * Spec reading 2 follows them over the XSD's types, `m:unsigned-integer`, `m:positive-integer`,
 * `m:integer` and `m:number`, which are `xs:unsignedLong`, `xs:positiveInteger`, `xs:integer` and
 * `xs:decimal` (`mathml3-presentation.xsd` lines 93, 133, 96 and 99, as the RelaxNG's
 * `mathml3-presentation.rnc` lines 60, 75, 61 and 62 are) and so admit a leading `+`, which
 * §2.1.5.1 forbids ("An explicit plus sign ('+') is not allowed as part of a numerical value except
 * when it is specifically listed in the syntax"), and `-0` for the first (spec reading 73). A value
 * meets both the notation and its type, so the pattern narrows the type's lexical space and keeps
 * its bounds and its `collapse`: §2.1.5.1 asks only that "leading and trailing whitespace in
 * attribute values should be avoided".
 *
 * @see {@link https://www.w3.org/TR/MathML3/chapter2.html#id.2.1.5.1 | MathML 3, 2.1.5.1 Syntax notation used in the MathML specification}
 */
const mathmlNotations: ReadonlyMap<string, string> = new Map([
  ["m:unsigned-integer", "[0-9]+"],
  ["m:positive-integer", positiveInteger],
  ["m:integer", "-?[0-9]+"],
  ["m:number", String.raw`-?([0-9]+(\.[0-9]*)?|\.[0-9]+)`],
]);

/**
 * The MathML attributes of a notation type whose own row in the Recommendation states another
 * notation, which spec reading 2 leaves to the type: `scriptlevel`, `( "+" | "-" )?
 * unsigned-integer` (MathML 3 §3.3.4.2, `mstyle`'s attributes, which `math` takes too), where a
 * sign increments or decrements the level, the language of `xs:integer` itself.
 *
 * @see {@link https://www.w3.org/TR/MathML3/chapter3.html#presm.mstyle.attrs | MathML 3, 3.3.4.2 Attributes (mstyle)}
 */
const ownNotations: ReadonlySet<string> = new Set(["scriptlevel"]);

/**
 * Spec reading 2's attribute readings: each MathML attribute of a notation type
 * ({@link mathmlNotations}), but {@link ownNotations}, on every kind that declares it, read with
 * the notation's pattern beside its type's.
 */
const mathmlNotationReadings: readonly SpecReading[] = Object.values(
  Arr.groupBy(
    attributeDeclarations.flatMap((declaration) =>
      declaration.kind.startsWith("m:") && !ownNotations.has(declaration.name)
        ? Option.toArray(Option.fromNullishOr(mathmlNotations.get(declaration.type.type))).map(
            (pattern) => ({ declaration, pattern }),
          )
        : [],
    ),
    ({ declaration: { name, type } }) => tupleKey(name, type.type),
  ),
).map(([{ declaration, pattern }, ...rest]) =>
  on(
    2,
    [...new Set([declaration, ...rest.map((held) => held.declaration)].map(({ kind }) => kind))],
    declaration.name,
    "xsd",
    (domain) => withPattern(domain, pattern),
  ),
);

/**
 * `xs:IDREF`'s definition, the one `xs:IDREFS` lists: a name that is a token, whitespace collapsed.
 */
const idrefDomain: Domain = {
  _tag: "atomic",
  builtin: "IDREF",
  facets: [{ facet: "whiteSpace", value: "collapse" }],
  patterns: [["\\i\\c*"], ["[\\i-[:]][\\c-[:]]*"]],
  primitive: "string",
};

/**
 * Spec reading 2's `xref` readings: MathML 3's cross-references "are established by the use of the
 * id and xref attributes" (§5.4.2), so an `xref` names an `id` of its document. Each MathML kind
 * that declares it reads it as an `xs:IDREF`, not the XSD's `xs:anySimpleType`, and the law "Idref
 * target" reads its token.
 *
 * @see {@link https://www.w3.org/TR/MathML3/chapter5.html#mixing.cr | MathML 3, 5.4.2 Parallel Markup via Cross-References}
 */
const mathmlXrefReading: SpecReading = on(
  2,
  [
    ...new Set(
      attributeDeclarations
        .filter(({ kind, name }) => kind.startsWith("m:") && name === "xref")
        .map(({ kind }) => kind),
    ),
  ],
  "xref",
  "xsd",
  () => idrefDomain,
);

/**
 * A content `cn`'s `base`, which the XSD leaves untyped (`mathml3-content.xsd` line 18) and the
 * RelaxNG types `text` (`mathml3-content.rnc` line 34): spec reading 2 reads it as MathML 3 states
 * it, "a base 10 positive integer giving the value of base in which the text content of the cn is
 * to be interpreted" (§4.2.1.3), the `positive-integer` notation over the XSD's
 * `m:positive-integer` ({@link mathmlNotations}), collapsed as that type collapses it, and its
 * domain is named after that type. The definition is the one the leaf resolves for an attribute
 * of that type, so the two share a domain; none where no attribute of the leaf has it.
 *
 * @see {@link https://www.w3.org/TR/MathML3/chapter4.html#contm.cn | MathML 3, 4.2.1 Numbers <cn>}
 */
const cnBaseReadings: readonly SpecReading[] = Option.toArray(
  Arr.findFirst(attributeDeclarations, ({ type }) => type.type === "m:positive-integer"),
).map(({ domain }) => ({
  ...on(2, ["m:cn"], "base", "xsd", () => withPattern(domain, positiveInteger)),
  readAs: Option.some("m:positive-integer"),
}));

/**
 * The attribute readings of `docs/spec-readings.md`, the only places the grammar departs from the
 * XSD's declarations, each stating its reading's number:
 *
 * - 2: a MathML attribute of a notation type takes the notation's pattern (MathML 3 §2.1.5.1):
 *   `length` digits only, `columnspan`, `rowspan` and `selection` digits not all zero, `position`,
 *   `shift` and `index` an optional `-` and digits, `scriptsizemultiplier` a `number` with no `+`
 *   ({@link mathmlNotationReadings}); a content `cn`'s `base` is a positive integer
 *   ({@link cnBaseReadings}); and every MathML kind's `xref` is an `xs:IDREF`, naming an `id` of
 *   its document ({@link mathmlXrefReading}).
 * - 7: a typed QTI value in an attribute the XSD types as a string is read in the string's class,
 *   outer whitespace invalid for a type but `string`: a map entry's `map-key`, an
 *   `xs:normalizedString`, reads its class, each tab, line feed and carriage return a space (XML
 *   Schema 1.0 Part 2, §4.3.6), so its value is the key; a match table's and an interpolation
 *   table's `default-value`, and an interpolation table entry's `target-value`, each an
 *   `xs:string`, read no whitespace class. The typed-value attributes the XSD types `xs:double`
 *   (`mapped-value`, the mappings' bounds and `default-value`, `source-value`, and the usage-data
 *   mapping's four) state nothing here: they read as the XSD reads them, collapsed.
 * - 8: a match table entry's `target-value` is a value of the outcome's base type, not a base-type
 *   name: any text, typed by the overlay.
 * - 9: an `h1`'s `role` is `heading`, `tab` or `presentation`, the Schematron's RULE ARIA ROLE 1b
 *   ({@link headingRole}).
 * - 16: `normal-maximum` is greater than zero.
 * - 17: an item's or a test's rubric block's `view` lists at least one view, the information model's
 *   "A list from an enumerated value set" of a characteristic of multiplicity [1] (§5.120.2 and
 *   §5.160.1), where the XSD's list admits none. An outcome declaration's `view` (§4.5.4, [0..1])
 *   keeps the XSD's list.
 * - 18: an order or graphic-order interaction's `min-choices` is at least 1.
 * - 39: an SSML `speak/@version` is `1.1`.
 * - 42: an SSML `voice/@languages` holds language ranges, `und`, `zxx` and `*` refused.
 * - 46: a count, and `figures`, is a signed 64-bit integer.
 * - 92: a position object interaction's `min-choices` is at least 1.
 * - 118: an `xi:include`'s `accept` and `accept-language` hold characters from #x20 to #x7E alone
 *   ({@link httpHeaderText}).
 * - 120: a `qti-index`'s `n`, where it is a number, is at least 1 ({@link positiveIndex}).
 * - 123: a `bdo`'s `dir` is `ltr` or `rtl`, never `auto` ({@link overrideDirection}).
 * - 124: an `audio`'s, a `video`'s and a `source`'s `src`, a `video`'s `poster` and a `source`'s
 *   `srcset` hold something other than spaces ({@link nonEmptyUrl}).
 * - 125: a `track`'s `src` holds something other than spaces ({@link nonEmptyUrl}).
 * - 129: an `xml:lang` is a BCP 47 language tag or empty, but on an item or a stimulus, where it is a
 *   tag ({@link xmlLanguage}, {@link rootLanguage}); a `lang` is a tag or empty
 *   ({@link languageOrEmpty}); a `track`'s `srclang` is a tag ({@link languageOnly}).
 * - 132, 161 and 171: a `qti-printed-variable`'s `format` is a printf format string over the
 *   information model's conversion codes and `d`, of any number of conversions
 *   ({@link printfFormat}).
 * - 135: a MIME type, and each item of a list of them, is RFC 2045's type and subtype, two tokens
 *   joined by a slash ({@link mediaType}, {@link mediaTypeReadings}).
 * - 232: a position object interaction's `center-point` is two integers, its horizontal and vertical
 *   offsets (information model §5.107.1).
 * - 250: a `col`'s and a `colgroup`'s `span` is at least 1, "a valid non-negative integer greater
 *   than zero" (information model §5.31 and §5.32), where the XSD's `xs:int` admits any.
 *
 * Reading 14, restated, follows the XSD (a text-entry interaction's `response-identifier` and
 * `string-identifier` are `IDREF`s), and so does reading 15 (an outcome declaration's
 * `variable-identifier-ref` is an `IDREF`, the XSD's `UniqueIdentifierRefDType` and the information
 * model's `UniqueIdentifierRef`, §4.5.11), and so does reading 136 (a `default` shape's `coords` is
 * required and a `CoordsDType`, as every shape's is), so they state nothing here. The readings that
 * take an attribute away from a kind or require one are {@link readingRefusals} and
 * {@link readingUses}.
 */
export const specReadings: readonly SpecReading[] = [
  on(7, ["qti-map-entry"], "map-key", "xsd", asDeclared),
  on(7, ["qti-match-table", "qti-interpolation-table"], "default-value", "exact", asDeclared),
  on(7, ["qti-interpolation-table-entry"], "target-value", "exact", asDeclared),
  on(8, ["qti-match-table-entry"], "target-value", "exact", () => stringDomain),
  on(9, ["h1"], "role", "xsd", headingRole),
  on(16, ["qti-outcome-declaration"], "normal-maximum", "xsd", (domain) => ({
    ...domain,
    facets: [
      ...domain.facets.filter(({ facet }) => facet !== "minInclusive"),
      { facet: "minExclusive", value: "0" },
    ],
  })),
  on(17, ["qti-rubric-block", "qti-rubric-block.test"], "view", "xsd", (domain) =>
    withFacets(domain, [{ facet: "minLength", value: "1" }]),
  ),
  on(
    18,
    ["qti-order-interaction", "qti-graphic-order-interaction"],
    "min-choices",
    "xsd",
    (domain) => withFacets(domain, [{ facet: "minInclusive", value: "1" }]),
  ),
  on(92, ["qti-position-object-interaction"], "min-choices", "xsd", (domain) =>
    withFacets(domain, [{ facet: "minInclusive", value: "1" }]),
  ),
  on(232, ["qti-position-object-interaction"], "center-point", "xsd", (domain) =>
    withFacets(domain, [{ facet: "length", value: "2" }]),
  ),
  on(239, ["col", "colgroup"], "span", "xsd", (domain) =>
    withFacets(domain, [{ facet: "minInclusive", value: "1" }]),
  ),
  on(118, ["xi:include"], "accept", "xsd", httpHeaderText),
  on(118, ["xi:include"], "accept-language", "xsd", httpHeaderText),
  on(39, ["ssml:speak"], "version", "xsd", ssmlVersion),
  on(42, ["ssml:voice"], "languages", "xsd", ssmlLanguages),
  ...counts.map((name) => everywhere(46, name, toInt64)),
  on(46, ["qti-round-to", "qti-equal-rounded"], "figures", "xsd", toInt64),
  ...mathmlNotationReadings,
  ...cnBaseReadings,
  mathmlXrefReading,
  on(120, ["qti-index"], "n", "xsd", positiveIndex),
  on(123, ["bdo"], "dir", "xsd", overrideDirection),
  on(124, ["audio", "source", "video"], "src", "xsd", nonEmptyUrl),
  on(124, ["video"], "poster", "xsd", nonEmptyUrl),
  on(124, ["source"], "srcset", "xsd", nonEmptyUrl),
  on(125, ["track"], "src", "xsd", nonEmptyUrl),
  everywhere(129, "xml:lang", xmlLanguage),
  on(129, ["qti-assessment-item", "qti-assessment-stimulus"], "xml:lang", "xsd", rootLanguage),
  everywhere(129, "lang", languageOrEmpty),
  on(129, ["track"], "srclang", "xsd", languageOnly),
  on(132, ["qti-printed-variable"], "format", "xsd", (domain) => withPattern(domain, printfFormat)),
  ...mediaTypeReadings,
];

/**
 * Whether a spec reading reads one kind's attribute: the reading's attribute, on a kind it lists,
 * or on every kind where it lists none.
 *
 * @param reading - The reading.
 * @param kind - The kind.
 * @param name - The attribute.
 * @returns Whether the reading applies.
 */
const appliesTo = (reading: SpecReading, kind: string, name: string): boolean =>
  reading.name === name &&
  Option.match(reading.kinds, { onNone: () => true, onSome: (kinds) => kinds.includes(kind) });

/**
 * The spec readings that apply to one kind's attribute, in the order {@link specReadings} lists
 * them, with the text of their indices there, which tells two such lists apart.
 */
interface Applicable {
  readonly key: string;
  readonly readings: readonly SpecReading[];
}

/**
 * The readings of an attribute no spec reading reads.
 */
const noReadings: Applicable = { key: "", readings: [] };

/**
 * The spec readings by attribute name, then by kind: for each name some reading reads, the readings
 * on every kind that declares it (`anyKind`), and for each kind a reading lists, that kind's own,
 * each list in {@link specReadings} order. Built once from the readings, so a declaration's
 * readings are two map reads, not a scan of every reading.
 */
const readingTable: ReadonlyMap<
  string,
  { readonly anyKind: Applicable; readonly byKind: ReadonlyMap<string, Applicable> }
> = new Map(
  [...Map.groupBy(specReadings.entries(), ([, reading]) => reading.name)].map(([name, named]) => {
    const applicableOf = (applied: typeof named): Applicable => ({
      key: applied.map(([index]) => index).join(" "),
      readings: applied.map(([, reading]) => reading),
    });
    const applicable = (kind: string): Applicable =>
      applicableOf(named.filter(([, reading]) => appliesTo(reading, kind, name)));
    const listed = new Set(named.flatMap(([, { kinds }]) => Option.getOrElse(kinds, () => [])));

    return [
      name,
      {
        anyKind: applicableOf(named.filter(([, { kinds }]) => Option.isNone(kinds))),
        byKind: new Map([...listed].map((kind) => [kind, applicable(kind)])),
      },
    ] as const;
  }),
);

/**
 * The spec readings of one kind's attribute, in the order {@link specReadings} lists them
 * ({@link readingTable}).
 *
 * @param kind - The kind.
 * @param name - The attribute.
 * @returns The readings that apply, and the text that tells their list apart.
 */
const applicableTo = (kind: string, name: string): Applicable => {
  const named = readingTable.get(name);

  return named === undefined ? noReadings : (named.byKind.get(kind) ?? named.anyKind);
};

/**
 * The spec readings of one kind's attribute, in the order {@link specReadings} lists them
 * ({@link applicableTo}).
 *
 * @param kind - The kind.
 * @param name - The attribute.
 * @returns The readings that apply.
 */
export const readingsOf = (kind: string, name: string): readonly SpecReading[] =>
  applicableTo(kind, name).readings;

/**
 * An attribute a spec reading refuses on a kind whose XSD declares it, and the reading.
 */
interface ReadingRefusal {
  readonly kind: string;
  readonly name: string;
  readonly reading: number;
}

/**
 * The declared attributes spec readings refuse:
 *
 * - Reading 9's `role` on `source`, which the ASI XSD declares and the Schematron's RULE ARIA ROLE 1a
 *   forbids ("The 'source' tag must not have an ARIA role attribute", ASI binding §5.3.1, whose
 *   section 5 "is NORMATIVE"). The Schematron's extension rules cover `source`, so spec reading 90
 *   leaves it no open class in no namespace, and a `role` there is refused outright, never read as
 *   an open name.
 *
 * `xi:include`'s `xpointer` and `parse="text"`, which `XInclude.xsd` declares, are admitted: the
 * information model's Include is "the use of the XInclude feature" (§9.4.1), and its §2.12, which
 * would forbid them, is not normative (§2: "This Section is NOT NORMATIVE"). An include that writes
 * either is stored as written and never included (spec reading 85, `ReadInclude` of
 * `#pantry/qti/overlay-queries/tests.ts`).
 *
 * @see {@link https://www.imsglobal.org/spec/qti/v3p0/bind | QTI 3.0 ASI binding, 5.3.1 RULE_SET_ARIA_ROLES_1}
 * @see {@link https://www.imsglobal.org/spec/qti/v3p0/info#Main2p12 | QTI 3.0 information model, 2.12 Items and Test Fragments}
 */
export const readingRefusals: readonly ReadingRefusal[] = [
  { kind: "source", name: "role", reading: 9 },
];

/**
 * An attribute a spec reading requires on a kind whose XSD declares it optional, and the reading.
 */
interface ReadingUse {
  readonly kind: string;
  readonly name: string;
  readonly reading: number;
}

/**
 * The declared attributes spec readings require: reading 123's `dir` on `bdo`, which the XSD
 * declares optional with the default `auto` and the information model requires ("Authors must
 * specify the dir attribute on this tag", §5.11). The reading holds by the element's name, so a
 * `bdo` an `xsi:type` governs requires it too.
 *
 * @see {@link https://www.imsglobal.org/spec/qti/v3p0/info#Data_BDO | QTI 3.0 information model, 5.11 BDO}
 */
export const readingUses: readonly ReadingUse[] = [{ kind: "bdo", name: "dir", reading: 123 }];

/**
 * Apply the spec readings that change which attributes a kind admits, or must carry, to a
 * vocabulary's declarations: drop each one {@link readingRefusals} refuses, and make each one
 * {@link readingUses} requires required, with no default, since a required attribute has none (XML
 * Schema Part 1, §3.2.3, src-attribute.2). Every name a kind admits is one its XSD declares:
 * reading 10 admits `aria-keyshorts` alone where the binding names it, never ARIA's
 * `aria-keyshortcuts` beside it.
 *
 * @param declarations - The declarations, each of a kind of the vocabulary.
 * @returns The declarations the attribute grammar admits, in their order.
 */
export const readDeclarations = <D extends Declared>(declarations: readonly D[]): readonly D[] =>
  declarations
    .values()
    .filter(
      ({ kind, name }) =>
        !readingRefusals.some((refused) => refused.kind === kind && refused.name === name),
    )
    .map((declared) =>
      readingUses.some(
        (required) => required.kind === declared.kind && required.name === declared.name,
      )
        ? { ...declared, default: Option.none(), use: "required" as const }
        : declared,
    )
    .toArray();

/**
 * A declaration whose domain does not compile: the declaring kind, the attribute (none for a
 * kind's text), and why.
 */
export class UncompiledDomain extends Schema.TaggedError<UncompiledDomain>()("UncompiledDomain", {
  detail: Schema.String,
  kind: Schema.String,
  name: Schema.Option(Schema.String),
}) {
  /**
   * The declaration, the reason, and the repair.
   */
  override get message(): string {
    const subject = Option.match(this.name, {
      onNone: () => `the text of ${this.kind}`,
      onSome: (name) => `${this.kind}@${name}`,
    });

    return `The domain of ${subject} does not compile: ${this.detail} Give it a spec reading in the attribute grammar, or extend the domain compiler.`;
  }
}

/**
 * The ways a composition's declarations have no attribute grammar: a domain that does not
 * compile, or an attribute name outside `AttributeName`, which an attribute's position is read
 * from. A kind outside its roster, or a kind that declares a name twice in two domains,
 * is a row grizzle refuses when it declares the relation.
 */
export type AttributeGrammarError = OutsideCodeSpace | UncompiledDomain;

/**
 * The key of `AttributeGrammar`: kind, then attribute name, each over its roster, `K` the
 * `NodeKind` handles and `N` the `AttributeName` handles.
 */
export type AttributeKey<K extends string = string, N extends string = string> = readonly [
  IdField<"kind", K>,
  IdField<"name", N>,
];

/**
 * The key of `GovernedAttribute`: governor, then attribute name, each over its roster. A
 * governor stands for its (kind, governing type) pair ({@link governorHandle}), so the key's code
 * spaces multiply to about as many cells as `AttributeGrammar`'s, where (kind, type) would multiply
 * to more than one PostgreSQL bit string holds. `N` is the `AttributeName` handles.
 */
type GovernedKey<N extends string> = readonly [IdField<"governor", string>, IdField<"name", N>];

/**
 * The payload of `AttributeGrammar`: the attribute's value domain, whether it is required, and its
 * position among the names its kind admits.
 */
type AttributePayload = readonly [
  IdField<"domain", string>,
  IdField<"use", Use, NonEmptyRoster<Use>>,
  IdField<"position", string>,
];

/**
 * The payload of `ValueDomain`: the primitive a typed value is derived in, the pattern its
 * lexical forms match as written, and the whitespace class its value is normalized in, a mixed
 * union's rest's (`LeadingMembers` holds its leading members').
 */
type DomainPayload = readonly [
  IdField<"primitive", DomainPrimitive, NonEmptyRoster<DomainPrimitive>>,
  ValueField<"pattern", string>,
  IdField<"whiteSpace", WhiteSpaceClass, NonEmptyRoster<WhiteSpaceClass>>,
];

/**
 * The payload of `LeadingMembers`: the pattern a mixed union's leading members hold a form by as
 * written, and the class they normalize it in.
 */
type LeadingPayload = readonly [
  ValueField<"pattern", string>,
  IdField<"whiteSpace", WhiteSpaceClass, NonEmptyRoster<WhiteSpaceClass>>,
];

/**
 * The payload of `DoubleBound`: a bounded double's or float's lower bound, its facet and its value
 * (`DoubleBound` of `#pantry/grammar/domains.ts`).
 */
type BoundPayload = readonly [
  IdField<"facet", DoubleBound["facet"], NonEmptyRoster<DoubleBound["facet"]>>,
  ValueField<"value", number>,
];

/**
 * The closed relations of the attribute grammar, `K` the `NodeKind` handles their kinds range over
 * and `N` the `AttributeName` handles their names do.
 */
export interface AttributeGrammar<K extends string = string, N extends string = string> {
  /**
   * `AttributeGrammar`: each attribute an element of a kind may carry, with its value domain, its
   * use and its position.
   */
  readonly admission: Indexed<AttributeKey<K, N>, AttributePayload>;
  /**
   * The `ValueDomain` roster's domains, in code order: the order {@link valueDomainRoster} states,
   * then any domain it does not list, in the order the grammar names it.
   */
  readonly domains: readonly ValueDomain[];
  /**
   * `GovernedAttribute`: each attribute an element may carry under a governor, with
   * its value domain, its use and its position among the names that governor admits there. Under a
   * governor, the XSD-derived admission is the governing type's, and the rules spec readings state
   * follow the element's kind (spec reading 84); an element of no governor reads `admission`.
   */
  readonly governed: Indexed<GovernedKey<N>, AttributePayload>;
  /**
   * `Governor`: the governor of each (kind, type) where the type governs an element of the kind in
   * place of its declared type, or a simple type governs a foreign element's text.
   */
  readonly governor: Indexed<
    readonly [IdField<"kind", K>, IdField<"governs", string>],
    readonly [IdField<"governor", string>]
  >;
  /**
   * `ValueIdentity`: the identity type of each domain that has one.
   */
  readonly identity: Closed<
    readonly [IdField<"domain", string>],
    readonly [IdField<"identity", Identity, NonEmptyRoster<Identity>>]
  >;
  /**
   * The `AttributePosition` roster: a kind's admitted names numbered from 0 in `AttributeName`
   * code order, so an element's `attrs` is a set over positions (D8), as wide as the most names one
   * kind admits.
   */
  readonly positions: Roster<string>;
  /**
   * `TextDomain`: the value domain of a simple-content kind's text, the language its one `Text`
   * child is read in.
   */
  readonly text: Indexed<readonly [IdField<"kind", K>], readonly [IdField<"domain", string>]>;
  /**
   * `TypeText`: the value domain of the text of each named type with simple content, which an
   * element that type governs holds its text in (spec readings 60 and 84).
   */
  readonly typeText: Indexed<
    readonly [IdField<"governs", string>],
    readonly [IdField<"domain", string>]
  >;
  /**
   * `DoubleBound`: the lower bound of each domain whose typed value carries one, a double's or a
   * float's, which no pattern states.
   */
  readonly doubleBound: Closed<readonly [IdField<"domain", string>], BoundPayload>;
  /**
   * `ValueDomain`: each domain's primitive and pattern.
   */
  readonly valueDomain: Closed<readonly [IdField<"domain", string>], DomainPayload>;
  /**
   * `LeadingMembers`: each mixed union's leading members ({@link LeadingMembers}).
   */
  readonly leadingMembers: Closed<readonly [IdField<"domain", string>], LeadingPayload>;
}

/**
 * The rosters the attribute grammar is keyed by, and the declarations it reads.
 */
export interface AttributeGrammarInput {
  /**
   * Every attribute the composition's kinds declare, and those the composition states.
   */
  readonly declarations: readonly Declared[];
  /**
   * Every attribute each governor admits on its kind's elements: the governing type's
   * declarations, read through the kind's spec readings, and those the composition states.
   */
  readonly governed: readonly GovernedDeclared[];
  /**
   * The governors, each (kind, type) once.
   */
  readonly governors: readonly Governor[];
  /**
   * The `NodeKind` roster.
   */
  readonly kinds: Roster<string>;
  /**
   * The `AttributeName` roster, its open-name classes included.
   */
  readonly names: Roster<string>;
  /**
   * The text type of every simple-content kind of the composition.
   */
  readonly texts: readonly DeclaredText[];
  /**
   * The `TypeName` roster (`#pantry/grammar/xsi.ts`).
   */
  readonly typeName: Roster<string>;
  /**
   * The text type of every named type with simple content that may govern an element.
   */
  readonly typeTexts: readonly DeclaredTypeText[];
}

/**
 * Spell a domain's bound for its definition's key.
 *
 * @param domain - The compiled domain.
 * @returns `facet=value`, empty for none.
 */
const boundText = (domain: CompiledDomain): string =>
  Option.match(domain.bound, {
    onNone: () => "",
    onSome: ({ facet, value }) => `${facet}=${String(value)}`,
  });

/**
 * The text of how a domain normalizes a form, its rest's class first: one class, or a mixed
 * union's rest's and its leading members' class and pattern.
 *
 * @param value - The normalization.
 * @returns Its parts.
 */
const normalizationText = (value: ValueNormalization): readonly string[] =>
  value._tag === "uniform"
    ? [value.whiteSpace]
    : [value.rest, value.leading.whiteSpace, value.leading.pattern];

/**
 * Key a compiled domain by its definition: two domains are one when their primitive, pattern,
 * normalization, bound and identity agree. The normalization is the key's because two definitions
 * of one lexical space may normalize a form into different values: `xs:string`,
 * `xs:normalizedString` and `xs:token` all admit every text as written.
 *
 * @param domain - The compiled domain.
 * @returns The key.
 */
const definitionKey = (domain: CompiledDomain): string =>
  tupleKey(
    domain.primitive,
    domain.pattern,
    ...normalizationText(domain.value),
    boundText(domain),
    ...Option.toArray(domain.identity),
  );

/**
 * What a declaration's domain is read from: the declaring kind (a named type's owner, for that
 * type's text), the declared type and that type's resolved definition.
 */
interface DomainSource {
  readonly domain: Domain;
  readonly kind: string;
  readonly type: ValueType;
}

/**
 * One declaration as the attribute grammar reads its domain: an attribute's, which names the
 * attribute its spec readings read by, or a text's, which names none and which no reading reads.
 */
export type DomainDeclaration = DomainSource | (DomainSource & { readonly name: string });

/**
 * The attribute a declaration declares: none for a text's.
 *
 * @param declared - The declaration.
 * @returns Its attribute's name.
 */
const attributeOf = (declared: DomainDeclaration): Option.Option<string> =>
  "name" in declared ? Option.some(declared.name) : Option.none();

/**
 * A definition the attribute grammar compiles: a leaf definition with a declaration's spec readings
 * applied in their order, and how its whitespace is read, exactly where one of them says so.
 */
interface ReadDefinition {
  readonly definition: Domain;
  readonly whiteSpace: Reading;
}

/**
 * A compiled domain with its definition key ({@link definitionKey}), computed once with it, and
 * the read definition it compiled from.
 */
interface KeyedDomain {
  readonly compiled: CompiledDomain;
  readonly definition: Domain;
  readonly key: string;
}

/**
 * One declaration's domain: the spec readings that apply to it, and its read definition compiled,
 * or why that definition does not compile.
 */
interface DeclarationDomain {
  readonly compiled: Result.Result<KeyedDomain, UnreadDomain>;
  readonly readings: readonly SpecReading[];
}

/**
 * Spell a definition as text, each of its fields in one order, so two equal definitions spell one
 * text however each was built.
 *
 * @param domain - The definition.
 * @returns The text.
 */
const domainText = (domain: Domain): string => {
  const facets = JSON.stringify(domain.facets.map(({ facet, value }) => [facet, value]));
  const patterns = JSON.stringify(domain.patterns);
  if (domain._tag === "atomic") {
    return `["atomic",${JSON.stringify(domain.builtin)},${JSON.stringify(domain.primitive)},${facets},${patterns}]`;
  }

  if (domain._tag === "list") {
    return `["list",${facets},${patterns},${domainText(domain.item)}]`;
  }

  return `["union",${facets},${patterns},[${domain.members.map((member) => domainText(member)).join(",")}]]`;
};

/**
 * Spell a read definition as text: its whitespace reading, then its definition
 * ({@link domainText}), as one {@link tupleKey}.
 *
 * @param read - The read definition.
 * @returns The text.
 */
export const definitionText = ({ definition, whiteSpace }: ReadDefinition): string =>
  tupleKey(whiteSpace, domainText(definition));

/**
 * Read a declaration's definition: its leaf definition with each of its spec readings applied, in
 * order.
 *
 * @param declared - The declaration.
 * @param readings - The spec readings that apply to it ({@link readingsOf}).
 * @returns The read definition.
 */
export const readDefinitionOf = (
  declared: DomainDeclaration,
  readings: readonly SpecReading[],
): ReadDefinition => {
  let definition = declared.domain;
  for (const reading of readings) {
    definition = reading.read(definition);
  }

  return {
    definition,
    whiteSpace: readings.some((reading) => reading.whiteSpace === "exact") ? "exact" : "xsd",
  };
};

/**
 * Compile a read definition's value domain: `compile` of `#pantry/grammar/domains.ts`, or a
 * function that gives what it gives, as a test's counting compile does.
 */
export type DomainCompile = (
  definition: Domain,
  whiteSpace: Reading,
) => Result.Result<CompiledDomain, UnreadDomain>;

/**
 * What reads the declarations' domains for the compositions it is handed to ({@link generate}),
 * through one compile, each distinct read definition compiled once for all of them.
 */
export interface DomainCompiler {
  /**
   * Read a declaration's domain: the spec readings that apply to it, and its read definition
   * compiled, each distinct definition compiled once by this compiler.
   *
   * @param declared - The declaration.
   * @returns Its readings and its compiled domain, or why the domain does not compile.
   */
  readonly read: (declared: DomainDeclaration) => DeclarationDomain;
}

/**
 * Make a compiler of the declarations' domains through `compileDomain`. It keeps what it read:
 *
 * - By leaf definition and then by the key of the spec readings that apply ({@link applicableTo}). A
 *   leaf states each distinct definition once and its declarations share it, so the declarations of
 *   one leaf definition under one set of readings share one read. It holds a leaf definition only
 *   while the leaf does.
 * - Each read definition compiled, by its text ({@link definitionText}). A reading builds a new
 *   definition each time it is applied, and two groups may read to one definition, so they are told
 *   apart by their text. Every composition the compiler is handed to reads through it, so a
 *   definition two compositions share, as a test's toy compositions over the document layer do,
 *   compiles once for both. A compile is a function of the definition's text alone, so sharing it
 *   changes no result.
 *
 * @param compileDomain - The compile it reads through.
 * @returns The compiler.
 */
export const domainCompilerOf = (compileDomain: DomainCompile): DomainCompiler => {
  const readsByDefinition = new WeakMap<Domain, Map<string, DeclarationDomain>>();
  const compiledByText = new Map<string, Result.Result<KeyedDomain, UnreadDomain>>();

  return {
    read: (declared) => {
      const { key, readings } = Option.match(attributeOf(declared), {
        onNone: () => noReadings,
        onSome: (name) => applicableTo(declared.kind, name),
      });

      return readsByDefinition
        .getOrInsertComputed(declared.domain, () => new Map())
        .getOrInsertComputed(key, () => {
          const read = readDefinitionOf(declared, readings);

          return {
            compiled: compiledByText.getOrInsertComputed(definitionText(read), () =>
              compileDomain(read.definition, read.whiteSpace).pipe(
                Result.map((domain): KeyedDomain => ({
                  compiled: domain,
                  definition: read.definition,
                  key: definitionKey(domain),
                })),
              ),
            ),
            readings,
          };
        });
    },
  };
};

/**
 * The `ValueDomain` roster as it grows: each definition at its first use, under the first handle no
 * other definition holds.
 */
interface DomainRoster {
  readonly byDefinition: Map<string, ValueDomain>;
  readonly handles: Set<string>;
  readonly ordered: ValueDomain[];
}

/**
 * Take the handle a domain would take, followed by a count where another definition holds it.
 *
 * @param domains - The roster.
 * @param name - The handle it would take.
 * @returns A handle no other definition holds.
 */
const freeHandle = (domains: DomainRoster, name: string): string => {
  let handle = name;
  for (let count = 2; domains.handles.has(handle); count += 1) {
    handle = `${name} (${count})`;
  }

  return handle;
};

/**
 * Add a compiled domain to the roster, or find the domain of its definition.
 *
 * A domain is named after the type it was first compiled from: a named type by its QName, an
 * anonymous one by the declaration it types, and a reading's by its type and the reading. A name
 * another definition holds is followed by a count.
 *
 * @param domains - The roster.
 * @param keyed - The compiled definition and its key.
 * @param keyed.compiled - The compiled definition.
 * @param keyed.key - Its definition key.
 * @param name - The handle it would take.
 * @returns The roster's domain of that definition.
 */
const intern = (
  domains: DomainRoster,
  { compiled, definition, key }: KeyedDomain,
  name: string,
): ValueDomain => {
  const known = domains.byDefinition.get(key);
  if (known !== undefined) {
    return known;
  }

  const handle = freeHandle(domains, name);
  const domain = { ...compiled, definition, handle };
  domains.byDefinition.set(key, domain);
  domains.handles.add(handle);
  domains.ordered.push(domain);

  return domain;
};

/**
 * The handle a declaration's domain would take: its type's QName, or for an anonymous type the
 * declaration itself, or the type the last reading that names one reads it as; with the spec
 * readings that alter it.
 *
 * @param type - The declared type.
 * @param anonymous - The name of the declaration, for an anonymous type.
 * @param readings - The spec readings applied to it.
 * @returns The handle.
 */
const handleOf = (type: ValueType, anonymous: string, readings: readonly SpecReading[]): string => {
  const base = Option.match(Option.firstSomeOf(readings.toReversed().map(({ readAs }) => readAs)), {
    onNone: () => (Option.isNone(type.inline) ? type.type : anonymous),
    onSome: (named) => named,
  });

  return readings.length === 0
    ? base
    : `${base} (reading ${[...new Set(readings.map(({ reading }) => reading))].join(", ")})`;
};

/**
 * Add one declaration's domain to the roster, its spec readings applied
 * ({@link DomainCompiler.read}).
 *
 * @param domains - The roster, which a new domain joins.
 * @param declared - The declaring kind, the attribute's name, and the type with its domain.
 * @param read - The declaration's readings and its compiled domain.
 * @param anonymous - The handle an anonymous type's domain would take.
 * @returns The domain, or the declaration's compile failure.
 */
const domainOf = (
  domains: DomainRoster,
  declared: DomainDeclaration,
  read: DeclarationDomain,
  anonymous: string,
): Result.Result<ValueDomain, UncompiledDomain> => {
  const handle = handleOf(declared.type, anonymous, read.readings);

  return read.compiled.pipe(
    Result.map((keyed) => intern(domains, keyed, handle)),
    Result.mapError(
      (cause) =>
        new UncompiledDomain({
          detail: cause.message,
          kind: declared.kind,
          name: attributeOf(declared),
        }),
    ),
  );
};

/**
 * One attribute an element may carry, with its compiled domain.
 */
interface Admitted {
  readonly domain: ValueDomain;
  readonly kind: string;
  readonly name: string;
  readonly use: Use;
}

/**
 * Number each family's attributes from 0 in `AttributeName` code order, keeping the rows in the
 * order they were read in.
 *
 * @param rows - The rows, in the order they were read in.
 * @param familyOf - A row's family.
 * @param names - The `AttributeName` roster.
 * @param relation - The relation the rows are, as a refusal names it.
 * @returns Each row with its position, or a row whose name the roster does not hold.
 */
const positioned = <R extends Admitted>(
  rows: readonly R[],
  familyOf: (row: R) => string,
  names: Roster<string>,
  relation: string,
): Result.Result<readonly { readonly position: number; readonly row: R }[], OutsideCodeSpace> => {
  const coded: { readonly at: number; readonly code: number; readonly row: R }[] = [];
  for (const [at, row] of rows.entries()) {
    const code = Option.getOrUndefined(names.codeOf(row.name));
    if (code === undefined) {
      return Result.fail(new OutsideCodeSpace({ field: "name", relation, value: row.name }));
    }

    coded.push({ at, code, row });
  }

  return Result.succeed(
    [...Map.groupBy(coded, ({ row }) => familyOf(row)).values()]
      .flatMap((family) =>
        family
          .toSorted((left, right) => left.code - right.code)
          .map(({ at, row }, position) => ({ at, position, row })),
      )
      .toSorted((left, right) => left.at - right.at),
  );
};

/**
 * Order the value domains a composition names by the `ValueDomain` roster ({@link
 * valueDomainRoster}), whose order is the codes an installation holds: each listed domain at its
 * place, and each one the roster does not list after them, in the order the grammar names them, as
 * a new domain appends at the end of the roster.
 *
 * @param named - The domains the composition names, each once, in the order it names them.
 * @returns The same domains, in roster order.
 */
const inRosterOrder = (named: readonly ValueDomain[]): readonly ValueDomain[] => {
  const listed = new Set(valueDomainRoster);

  return [
    ...valueDomainRoster.flatMap((handle) => named.filter((held) => held.handle === handle)),
    ...named.filter(({ handle }) => !listed.has(handle)),
  ];
};

/**
 * Generate the attribute grammar of a composition.
 *
 * Each governor's attributes are numbered as a kind's are, from 0 in `AttributeName` code order,
 * so an element's `attrs` is a set over its governor's positions as it is over its kind's.
 *
 * @param input - The rosters and the declarations.
 * @param compiler - What reads the declarations' domains: the process's one
 *   (`#pantry/grammar/compose.ts`, `processCompiler`) for a composition, or a test's own.
 * @returns `AttributeGrammar`, `ValueDomain`, `ValueIdentity`, `TextDomain`, `Governor`,
 *   `GovernedAttribute` and `TypeText`, with the domain and position rosters; or the first
 *   declaration whose domain does not compile, or the first roster or position that has no code.
 */
export const generate = (
  input: AttributeGrammarInput,
  compiler: DomainCompiler,
): Result.Result<AttributeGrammar, AttributeGrammarError> =>
  Result.gen(function* generateAttributes() {
    const domains: DomainRoster = {
      byDefinition: new Map(),
      handles: new Set(),
      ordered: [],
    };
    /**
     * Every declaration's domain is read before any joins the roster, each distinct definition
     * compiled once; the loops below add them in the roster's order.
     */
    const declarations = input.declarations.map((declared) => ({
      declared,
      read: compiler.read(declared),
    }));
    const textsRead = input.texts.map((text) => ({
      declared: text,
      read: compiler.read(text),
      text,
    }));
    const governedRead = input.governed.map((declared) => ({
      declared,
      read: compiler.read(declared),
    }));
    const typeTextsRead = input.typeTexts.map((typeText) => {
      const declared = { ...typeText, kind: typeText.owner };

      return { declared, read: compiler.read(declared), typeText };
    });
    const admitted: Admitted[] = [];
    for (const { declared, read } of declarations) {
      const domain = domainOf(domains, declared, read, `${declared.kind}@${declared.name}`);
      if (Result.isFailure(domain)) {
        return yield* Result.fail(domain.failure);
      }

      admitted.push({
        domain: domain.success,
        kind: declared.kind,
        name: declared.name,
        use: declared.use,
      });
    }

    const texts: { readonly domain: ValueDomain; readonly kind: string }[] = [];
    for (const { declared, read, text } of textsRead) {
      const domain = domainOf(domains, declared, read, `${text.kind} text`);
      if (Result.isFailure(domain)) {
        return yield* Result.fail(domain.failure);
      }

      texts.push({ domain: domain.success, kind: text.kind });
    }

    /**
     * The governors' domains join the roster after every kind's, so a code the kinds' domains
     * hold keeps its place.
     */
    const governed: (Admitted & { readonly governor: string })[] = [];
    for (const { declared, read } of governedRead) {
      const domain = domainOf(domains, declared, read, `${declared.governs}@${declared.name}`);
      if (Result.isFailure(domain)) {
        return yield* Result.fail(domain.failure);
      }

      governed.push({
        domain: domain.success,
        governor: governorHandle(declared),
        kind: declared.kind,
        name: declared.name,
        use: declared.use,
      });
    }

    const typeTexts: { readonly domain: ValueDomain; readonly governs: string }[] = [];
    for (const { declared, read, typeText } of typeTextsRead) {
      const domain = domainOf(domains, declared, read, `${typeText.owner} text`);
      if (Result.isFailure(domain)) {
        return yield* Result.fail(domain.failure);
      }

      typeTexts.push({ domain: domain.success, governs: typeText.owner });
    }

    const inCodeOrder = inRosterOrder(domains.ordered);
    const domainRoster = roster(
      "ValueDomain",
      inCodeOrder.map(({ handle }) => handle),
    );
    const kind = idField("kind", input.kinds);
    const domain = idField("domain", domainRoster);
    /**
     * Each kind and each governor numbers its attributes from 0 in `AttributeName` code order; the
     * rows keep the order they were read in.
     */
    const kindRows = yield* positioned(
      admitted,
      (row) => row.kind,
      input.names,
      "AttributeGrammar",
    );
    const governorRows = yield* positioned(
      governed,
      (row) => row.governor,
      input.names,
      "GovernedAttribute",
    );
    const positions = numerals(
      "AttributePosition",
      Arr.reduce(
        [...kindRows, ...governorRows].map(({ position: at }) => at + 1),
        0,
        (most, each) => Math.max(most, each),
      ),
    );
    const use = idField("use", roster("Use", uses));
    const position = idField("position", positions);
    const name = idField("name", input.names);
    const governs = idField("governs", input.typeName);
    const governorRoster = roster("Governor", [...new Set(input.governors.map(governorHandle))]);
    const governorField = idField("governor", governorRoster);
    const admission = indexed(
      closed({
        key: [kind, name],
        name: "AttributeGrammar",
        payload: [domain, use, position],
        rows: kindRows.map(({ position: at, row }) => ({
          domain: row.domain.handle,
          kind: row.kind,
          name: row.name,
          position: String(at),
          use: row.use,
        })),
      }),
    );
    const valueDomain = closed({
      key: [domain],
      name: "ValueDomain",
      payload: [
        idField("primitive", roster("DomainPrimitive", domainPrimitives)),
        valueField(
          "pattern",
          domains.ordered.map(({ pattern }) => pattern),
        ),
        idField("whiteSpace", roster("WhiteSpace", whiteSpaceClasses)),
      ],
      rows: domains.ordered.map((held) => ({
        domain: held.handle,
        pattern: held.pattern,
        primitive: held.primitive,
        whiteSpace: held.value._tag === "uniform" ? held.value.whiteSpace : held.value.rest,
      })),
    });
    const mixed = domains.ordered.flatMap((held) =>
      held.value._tag === "mixed" ? [{ domain: held.handle, ...held.value.leading }] : [],
    );
    const leadingMembers = closed({
      key: [domain],
      name: "LeadingMembers",
      payload: [
        valueField(
          "pattern",
          mixed.map(({ pattern }) => pattern),
        ),
        idField("whiteSpace", roster("WhiteSpace", whiteSpaceClasses)),
      ],
      rows: mixed,
    });
    const bounded = domains.ordered.flatMap((held) =>
      Option.toArray(held.bound).map(({ facet, value }) => ({ domain: held.handle, facet, value })),
    );
    const doubleBound = closed({
      key: [domain],
      name: "DoubleBound",
      payload: [
        idField("facet", roster("BoundFacet", boundFacets)),
        valueField(
          "value",
          bounded.map(({ value }) => value),
        ),
      ],
      rows: bounded,
    });
    const identity = closed({
      key: [domain],
      name: "ValueIdentity",
      payload: [idField("identity", roster("Identity", identities))],
      rows: domains.ordered.flatMap((held) =>
        Option.toArray(held.identity).map((value) => ({ domain: held.handle, identity: value })),
      ),
    });
    const text = indexed(
      closed({
        key: [kind],
        name: "TextDomain",
        payload: [domain],
        rows: texts.map((row) => ({ domain: row.domain.handle, kind: row.kind })),
      }),
    );
    const governor = indexed(
      closed({
        key: [kind, governs],
        name: "Governor",
        payload: [governorField],
        rows: input.governors.map((held) => ({
          governor: governorHandle(held),
          governs: held.governs,
          kind: held.kind,
        })),
      }),
    );
    const governedRelation = indexed(
      closed({
        key: [governorField, name],
        name: "GovernedAttribute",
        payload: [domain, use, position],
        rows: governorRows.map(({ position: at, row }) => ({
          domain: row.domain.handle,
          governor: row.governor,
          name: row.name,
          position: String(at),
          use: row.use,
        })),
      }),
    );
    const typeText = indexed(
      closed({
        key: [governs],
        name: "TypeText",
        payload: [domain],
        rows: typeTexts.map((row) => ({ domain: row.domain.handle, governs: row.governs })),
      }),
    );

    return {
      admission,
      domains: inCodeOrder,
      doubleBound,
      governed: governedRelation,
      governor,
      identity,
      leadingMembers,
      positions,
      text,
      typeText,
      valueDomain,
    };
  });

/**
 * An element's governing type and where it stands: the key an element's attributes and text are
 * read under.
 */
interface GoverningKey {
  /**
   * The element's governing type, a `TypeName` handle, where a named type governs it: none for an
   * element of an anonymous declared type, a foreign element its `xsi:type` gives no type, and a
   * node that is no element.
   */
  readonly governs: Option.Option<string>;
  readonly kind: string;
}

/**
 * Find the governor of an element: the (kind, type) pair its governing type makes it, where that
 * type governs it in place of its kind's declared type (spec reading 84), or is a simple type that
 * governs a foreign element's text (spec reading 60).
 *
 * @param grammar - The attribute grammar.
 * @param key - The element's kind and governing type.
 * @returns The `Governor` handle, or none where the element reads its kind's own rows: its
 *   declared type governs it, or no named type, or a complex type a foreign element is not checked
 *   against (spec reading 50).
 */
export const governorOf = (grammar: AttributeGrammar, key: GoverningKey): Option.Option<string> =>
  key.governs.pipe(
    Option.flatMap((governs) =>
      Option.map(grammar.governor.lookup({ governs, kind: key.kind }), ({ governor }) => governor),
    ),
  );

/**
 * Find the row of an attribute name an element admits: its governor's, where one governs it, else
 * its kind's.
 *
 * @param grammar - The attribute grammar.
 * @param key - The element's kind and governing type, and the attribute's name.
 * @returns The admitted name's domain, use and position, or none where the element does not admit
 *   it.
 */
export const admissionOf = (
  grammar: AttributeGrammar,
  key: GoverningKey & { readonly name: string },
): Option.Option<{ readonly domain: string; readonly position: number; readonly use: Use }> => {
  const read = ({
    domain,
    position,
    use,
  }: {
    readonly domain: string;
    readonly position: string;
    readonly use: Use;
  }) => ({ domain, position: Number(position), use });

  return Option.match(governorOf(grammar, key), {
    onNone: () => Option.map(grammar.admission.lookup(key), read),
    onSome: (governor) => Option.map(grammar.governed.lookup({ governor, name: key.name }), read),
  });
};

/**
 * Read the attributes an element admits, by position: each admitted name with its domain and use,
 * positions ascending, under its governor where one governs it ({@link admissionOf}).
 *
 * @param grammar - The attribute grammar.
 * @param names - The `AttributeName` roster.
 * @param kind - The kind.
 * @param governs - The element's governing type, its kind's own rows for none or one that is no
 *   governor.
 * @returns The element's admitted attributes, in position order.
 */
export const admittedOf = (
  grammar: AttributeGrammar,
  names: Roster<string>,
  kind: string,
  governs: Option.Option<string>,
): readonly {
  readonly domain: string;
  readonly name: string;
  readonly position: number;
  readonly use: Use;
}[] =>
  names.handles
    .flatMap((name) =>
      Option.match(admissionOf(grammar, { governs, kind, name }), {
        onNone: () => [],
        onSome: (row) => [{ ...row, name }],
      }),
    )
    .toSorted((left, right) => left.position - right.position);

/**
 * Read `Required`'s row for an element: the positions of the attributes it must carry, the side of
 * its governor's or its kind's admission that `use = required` selects. An element's `attrs` must
 * contain it, `bit_count(required & ~attrs) = 0` (AL3).
 *
 * @param grammar - The attribute grammar.
 * @param names - The `AttributeName` roster.
 * @param kind - The kind.
 * @param governs - The element's governing type, its kind's own rows for none or one that is no
 *   governor.
 * @returns The required positions.
 */
export const requiredOf = (
  grammar: AttributeGrammar,
  names: Roster<string>,
  kind: string,
  governs: Option.Option<string>,
): ReadonlySet<number> =>
  new Set(
    admittedOf(grammar, names, kind, governs)
      .filter(({ use }) => use === "required")
      .map(({ position }) => position),
  );

/**
 * Find the domain an element's text is read in: its governing type's simple content, where a
 * governor governs it, else its kind's `TextDomain`.
 *
 * @param grammar - The attribute grammar.
 * @param key - The element's kind and governing type.
 * @returns The `ValueDomain` handle, or none where the element's text is in no domain: its kind or
 *   its governing type has no simple content.
 */
export const textDomainOf = (grammar: AttributeGrammar, key: GoverningKey): Option.Option<string> =>
  Option.match(governorOf(grammar, key), {
    onNone: () => Option.map(grammar.text.lookup(key), ({ domain }) => domain),
    onSome: () =>
      key.governs.pipe(
        Option.flatMap((governs) =>
          Option.map(grammar.typeText.lookup({ governs }), ({ domain }) => domain),
        ),
      ),
  });

/**
 * A count an element's attributes must meet beside `Required`: how many of a set of names it
 * carries, from `min` to `max`, a spec reading's rule the XSD's `use` cannot state.
 */
export interface AttributeCount {
  readonly kind: string;
  readonly max: number;
  readonly min: number;
  readonly names: readonly string[];
  readonly reading: number;
}

/**
 * The attributes SSML 1.1's fragment removal keeps on an element of the kind: those SSML declares
 * on it, in no namespace, with `xml:lang` and `xml:base`, which it keeps "with the exception of
 * xml:lang and xml:base" while removing "all non-synthesis namespace elements and attributes"
 * (SSML 1.1, §2.2.1). Spec reading 43 counts only these.
 *
 * @param kind - An SSML kind.
 * @returns Its surviving names, declared ones first, in the leaf's order.
 * @see {@link https://www.w3.org/TR/speech-synthesis11/#S2.2.1 | SSML 1.1, 2.2.1 Conforming Speech Synthesis Markup Language Fragments}
 */
const survivingNames = (kind: string): readonly string[] => [
  ...new Set(
    attributeDeclarations
      .filter((row) => row.kind === kind && !row.name.includes(":"))
      .map(({ name }) => name),
  ),
  "xml:lang",
  "xml:base",
];

/**
 * The attribute counts of `docs/spec-readings.md`:
 *
 * - 41: an SSML `meta` has exactly one of `name` and `http-equiv` (SSML 1.1, §3.1.6: "Either a name
 *   or http-equiv attribute is required. It is an error to provide both").
 * - 43: an SSML `voice` or `prosody` has at least one attribute fragment removal keeps (SSML 1.1,
 *   §3.2.1 and §3.2.4: "it is an error if no attributes are specified").
 *
 * A name a kind does not admit is no position of it, so it counts nothing: `xml:base` on `prosody`
 * is admitted only where SSML's attribute wildcard reads the XML namespace.
 */
export const attributeCounts: readonly AttributeCount[] = [
  { kind: "ssml:meta", max: 1, min: 1, names: ["name", "http-equiv"], reading: 41 },
  {
    kind: "ssml:voice",
    max: Number.POSITIVE_INFINITY,
    min: 1,
    names: survivingNames("ssml:voice"),
    reading: 43,
  },
  {
    kind: "ssml:prosody",
    max: Number.POSITIVE_INFINITY,
    min: 1,
    names: survivingNames("ssml:prosody"),
    reading: 43,
  },
];
