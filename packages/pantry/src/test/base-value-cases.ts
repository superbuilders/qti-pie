/**
 * A base value's `base-type` as a small box of 25 forms, each with the verdict the specification
 * gives its package: the eleven bases of the information model's BaseTypeEnum (§8.14), each written
 * exactly, and fourteen forms that spell none. The enumeration is an `xs:string` one whose
 * whiteSpace is preserve (XSD 1.1 Part 2, §4.3.6), so a form outside it, padded included, spells no
 * base, and AL1's value domain refuses its `base-type` alone (`attribute-lexical`); a form that
 * spells a base is accepted. The base value stands under `qti-is-null`, which takes a value of any
 * base and cardinality, with a text in its base's lexical space, so no other law reads it. The
 * schema's laws over the import's rows (`#pantry/import/overlays/expressions.test.ts`) and the law
 * oracle (`base-value.oracle.test.ts`) are each held to the verdicts here.
 */
import type { PackageEntries } from "#pantry/test/gen/every-relation.ts";

/**
 * One form of the box: the `base-type` as written, the base value's text, and the laws the
 * specification has its package break.
 */
export interface BaseValueCase {
  readonly form: string;
  readonly text: string;
  readonly verdict: readonly "value domain"[];
}

/**
 * The bases the enumeration spells, each with a text in its lexical space.
 */
const spelled: readonly (readonly [string, string])[] = [
  ["boolean", "true"],
  ["directedPair", "a b"],
  ["duration", "1"],
  ["file", "a"],
  ["float", "1"],
  ["identifier", "a"],
  ["integer", "1"],
  ["pair", "a b"],
  ["point", "1 1"],
  ["string", "a"],
  ["uri", "a"],
];

/**
 * Forms that spell no base: empty, padded, cased, a number, a near name, and `none`, a record's
 * base type, which no base value writes.
 */
const unspelled: readonly string[] = [
  "",
  " integer",
  "integer ",
  "Integer",
  "INTEGER",
  "0.0",
  "+0",
  "-INF",
  "URI",
  "int",
  "floats",
  "directed-pair",
  "identifier\t",
  "none",
];

/**
 * Every form of the box with its verdict: a spelled base accepted, any other form refused under its
 * value domain alone.
 */
export const baseValueCases: readonly BaseValueCase[] = [
  ...spelled.map(([form, text]): BaseValueCase => ({ form, text, verdict: [] })),
  ...unspelled.map((form): BaseValueCase => ({ form, text: "1", verdict: ["value domain"] })),
];

/**
 * Write a case's package: an item whose response processing tests the case's base value under
 * `qti-is-null`, and the manifest that lists it, each file's text encoded as UTF-8.
 *
 * @param drawn - The case.
 * @returns The package's entries.
 */
export const baseValuePackageOf = ({ form, text }: BaseValueCase): PackageEntries =>
  new Map(
    Object.entries({
      "imsmanifest.xml": `<manifest xmlns="http://www.imsglobal.org/xsd/qti/qtiv3p0/imscp_v1p1" identifier="M"><metadata><schema>QTI Package</schema><schemaversion>3.0.1</schemaversion></metadata><organizations/><resources><resource identifier="I" type="imsqti_item_xmlv3p0" href="item.xml"><file href="item.xml"/></resource></resources></manifest>`,
      "item.xml": `<qti-assessment-item xmlns="http://www.imsglobal.org/xsd/imsqtiasi_v3p0" identifier="I" title="I" adaptive="false" time-dependent="false"><qti-outcome-declaration identifier="SCORE" cardinality="single" base-type="float"/><qti-response-processing><qti-response-condition><qti-response-if><qti-is-null><qti-base-value base-type="${form}">${text}</qti-base-value></qti-is-null><qti-set-outcome-value identifier="SCORE"><qti-base-value base-type="float">1</qti-base-value></qti-set-outcome-value></qti-response-if></qti-response-condition></qti-response-processing></qti-assessment-item>`,
    }).map(([path, content]) => [path, new TextEncoder().encode(content)] as const),
  );
