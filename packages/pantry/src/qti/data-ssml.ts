/**
 * The `data-ssml` law (spec reading 177, over R7-a): a closed `data-ssml`, on an element whose kind
 * declares it, holds one JSON object that Data-SSML 1.0's JSON Schema admits, and the database
 * judges it, over the rows the importer reads the value into (`#pantry/vocab/data-ssml.ts`).
 *
 * - **The rows:** {@link DataSsml}, one per element whose `data-ssml` is one JSON object of objects
 *   of strings; {@link DataSsmlMember}, each member of the object as written, by its place; and
 *   {@link DataSsmlProperty}, each property of a member as written, by its member's place and its
 *   own. A name written twice is two rows (RFC 8259 §4: names "SHOULD be unique"), each judged.
 * - **"Data SSML"** (rule `attribute-lexical`, Data-SSML 1.0 §3.4, "NORMATIVE"): every closed
 *   `data-ssml` has its {@link DataSsml} row, so a value that is no JSON object of objects of
 *   strings has none and is refused; every member is one the schema lists (`break`, `phoneme`,
 *   `prosody`, `say-as`, `sub`); every property is one its member lists; an enumerated property's
 *   value is one of the schema's (`strength`, `alphabet`, `type`, `interpret-as`); a normalized
 *   one's (`time`, `rate`) holds no tab, line feed or carriage return, each a check over the
 *   schema's table (`dataSsmlMembers` of `#pantry/vocab/data-ssml.ts`); and a member holds each
 *   property the schema requires of it (`ph`, `interpret-as`, `alias`), a rule over a query
 *   (`RequiredSsmlProperty`, `#pantry/qti/queries.ts`).
 * - **"E1 derived":** each {@link DataSsml} row is a closed `data-ssml`'s, each member's element has
 *   its row, and each property's member is one of its element's.
 *
 * The importer writes every member and property it reads, and the database judges them. Which rows
 * a value has is the JSON's grammar, and no grizzle term derives rows from a text (no JSON type, no
 * scalar term that splits a text), so the importer reads it once, before the database, as it reads
 * a document's XML. Every text a law compares is of its type's bound in a key
 * (`#pantry/qti/limits.ts`), so a key, a containment's target and a lookup hold it as itself.
 *
 * @see {@link https://www.imsglobal.org/sites/default/files/spec/qti/v3/data-ssml_infobind/imsqtiv3p0_datassml_v1p0_InfoBind.html#JSOND | IMS Data-SSML 1.0, 3.4 Description of the JSON Schema}
 */
import {
  check,
  contained,
  Crypto,
  generated,
  law,
  on,
  relation,
  select,
  sha256,
  Text,
} from "@bjornpagen/grizzle";
import { Attribute } from "#pantry/qti/attributes.ts";
import { EntryPath, PackageName } from "#pantry/qti/limits.ts";
import { dataSsmlMembers } from "#pantry/vocab/data-ssml.ts";
import { anyText, Chars, natural } from "#pantry/grammar/install.ts";
import { declared } from "#pantry/qti/law-entries.ts";
import { entryOf } from "#pantry/vocab/laws.ts";

/**
 * A text with no tab, line feed or carriage return: an `xs:normalizedString`'s value.
 */
const normalizedValue = Text.pattern("^[^\\t\\n\\r]*$");

/**
 * An element whose closed `data-ssml` is one JSON object of objects of strings, keyed by the
 * element, `(package, path, start)`.
 */
export const DataSsml = law(
  entryOf("E1 derived"),
  relation("DataSsml", { package: PackageName, path: EntryPath, start: natural }, [
    "package",
    "path",
    "start",
  ]),
);

/**
 * One member of a `data-ssml` object as written, keyed by its element and its place in the object,
 * from 0: its decoded name, of any length (Data-SSML and RFC 8259 bound none), and `memberDigest`,
 * its SHA-256, which a property's reference to its member compares, so no key holds the name.
 */
export const DataSsmlMember = law(
  entryOf("E1 derived"),
  relation.generated(
    "DataSsmlMember",
    { at: natural, member: Chars, package: PackageName, path: EntryPath, start: natural },
    ["package", "path", "start", "at"],
    (m) => ({
      memberDigest: law(entryOf("E1 derived"), generated(sha256, Crypto.sha256(m.member))),
    }),
  ),
);

/**
 * One property of a member as written, keyed by its element, its member's place and its own place
 * in the member, from 0: its member's name (`memberName`, its {@link DataSsmlMember}'s, compared
 * there by `memberNameDigest`, its SHA-256), its decoded name (`nameDigest` its SHA-256, by which a
 * required property is held to it) and its decoded value, each name of any length.
 */
export const DataSsmlProperty = law(
  entryOf("E1 derived"),
  relation.generated(
    "DataSsmlProperty",
    {
      at: natural,
      member: natural,
      memberName: Chars,
      name: Chars,
      package: PackageName,
      path: EntryPath,
      start: natural,
      value: anyText,
    },
    ["package", "path", "start", "member", "at"],
    (p) => ({
      memberNameDigest: law(entryOf("E1 derived"), generated(sha256, Crypto.sha256(p.memberName))),
      nameDigest: law(entryOf("E1 derived"), generated(sha256, Crypto.sha256(p.name))),
    }),
  ),
);

/**
 * The relations of `data-ssml.ts`, in one list, as `#pantry/qti/base.ts` composes them.
 */
export const dataSsmlRelations = [DataSsml, DataSsmlMember, DataSsmlProperty] as const;

/**
 * Every closed `data-ssml` attribute, by its element: an element holds one.
 */
const dataSsmlAttributes = select(Attribute, (a) => a.eq(a.name, "data-ssml"));

/**
 * Every member Data-SSML 1.0 lists.
 */
const memberNames = [...dataSsmlMembers.keys()];

/**
 * Every (member, property) pair the schema lists.
 */
const listedProperties = [...dataSsmlMembers].flatMap(([member, properties]) =>
  properties.map(({ name }) => ({ member, name })),
);

/**
 * Every enumerated property, with the values the schema admits for it, and every normalized one,
 * from one walk of the schema's table.
 */
const { enumeratedProperties, normalizedProperties } = (() => {
  const properties = [...dataSsmlMembers].flatMap(([member, held]) =>
    held.map(({ domain, name }) => ({ domain, member, name })),
  );

  return {
    enumeratedProperties: properties.flatMap(({ domain, member, name }) =>
      domain.kind === "enumeration" ? [{ member, name, values: domain.values }] : [],
    ),
    normalizedProperties: properties.flatMap(({ domain, member, name }) =>
      domain.kind === "normalized" ? [{ member, name }] : [],
    ),
  };
})();

/**
 * The `data-ssml` module's statements, grouped by the law each states, each check named by its law
 * with spaces written as underscores.
 */
export const dataSsmlLawsByName = {
  "Data SSML": declared("Data SSML", [
    contained(
      on(dataSsmlAttributes, "package", "path", "start"),
      on(DataSsml, "package", "path", "start"),
    ),
    check("Data_SSML", DataSsmlMember, (m) => m.in(m.member, memberNames)),
    check("Data_SSML", DataSsmlProperty, (p) =>
      p.and(
        p.or(
          ...listedProperties.map(({ member, name }) =>
            p.and(p.eq(p.memberName, member), p.eq(p.name, name)),
          ),
        ),
        ...enumeratedProperties.map(({ member, name, values }) =>
          p.or(p.ne(p.memberName, member), p.ne(p.name, name), p.in(p.value, values)),
        ),
        ...normalizedProperties.map(({ member, name }) =>
          p.or(
            p.ne(p.memberName, member),
            p.ne(p.name, name),
            Text.matches(p.value, normalizedValue),
          ),
        ),
      ),
    ),
  ]),
  "E1 derived": declared("E1 derived", [
    contained(
      on(DataSsml, "package", "path", "start"),
      on(dataSsmlAttributes, "package", "path", "start"),
    ),
    contained(
      on(DataSsmlMember, "package", "path", "start"),
      on(DataSsml, "package", "path", "start"),
    ),
    contained(
      on(DataSsmlProperty, "package", "path", "start", "member", "memberNameDigest"),
      on(DataSsmlMember, "package", "path", "start", "at", "memberDigest"),
    ),
  ]),
} as const;

/**
 * {@link dataSsmlLawsByName}'s statements in one list.
 */
export const dataSsmlLaws = Object.values(dataSsmlLawsByName).flat();
