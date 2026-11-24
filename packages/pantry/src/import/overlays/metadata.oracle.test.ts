/**
 * The metadata builder's free tests, and the law oracle's reading 62 over generated packages: over
 * generated packages and the `metaData` fixture, the law oracle (`#pantry/test/oracle.ts`) refuses
 * exactly the records reading 62 refuses, `lom-identifier` and `lom-title`, which the database
 * holds by rules over queries over `Node` (`#pantry/qti/queries.ts`), since a LOM record has no
 * overlay; the builder writes no row of a resource; and a usage value has its typed row exactly
 * where it writes a `baseType` and a `fieldIdentifier`, a record's value (reading 105).
 */
import { NodeServices } from "@effect/platform-node";
import { assert, describe, it } from "@effect/vitest";
import { drawn, exhaust, explore } from "@bjornpagen/testing/explore";
import { required, requiredInSpace } from "@bjornpagen/testing/features";
import { array, boolean, element } from "@bjornpagen/testing/gen";
import type { Gen } from "@bjornpagen/testing/gen";
import { notesOnly } from "@bjornpagen/testing/sense";
import { completeShrink } from "@bjornpagen/testing/shrink";
import { searched } from "@bjornpagen/testing/vitest";
import { Duration, Effect, Formatter, Option } from "effect";
import { inject } from "vitest";
import { readXml } from "@qti-pie/crust/read.ts";
import { grammar } from "#pantry/grammar/install.ts";
import { rowsOf } from "#pantry/import/overlays/metadata.ts";
import type { MetadataRows } from "#pantry/import/overlays/metadata.ts";
import type { Place } from "#pantry/qti/schema.ts";
import { resourcePathsOf } from "#pantry/import/overlays/package.ts";
import { shredGrammarOf } from "#pantry/model/composed.ts";
import { shred } from "#pantry/model/shred.ts";
import { readEntries } from "#pantry/package/read.ts";
import type { PackageFile } from "#pantry/package/read.ts";
import { judge, lawsOf } from "#pantry/test/oracle.ts";
import { caseHang } from "#pantry/test/gen/xdm.ts";
import { manifestPath } from "#pantry/vocab/terms/package.ts";
import { flatDocumentOf, ownViewOf } from "#pantry/import/fold.ts";
import { searchTimeout } from "#pantry/test/settings.ts";

/**
 * The fixtures the global setup materializes: `metaData` among them.
 */
const fixtures = inject("fixtures");

/**
 * The grammar shred reads every document through.
 */
const shredGrammar = shredGrammarOf(grammar);

/**
 * The law oracle's tables, derived once.
 */
const laws = lawsOf(grammar);

/**
 * The namespaces the generated packages write.
 */
const namespaces = {
  asi: "http://www.imsglobal.org/xsd/imsqtiasi_v3p0",
  cp: "http://www.imsglobal.org/xsd/qti/qtiv3p0/imscp_v1p1",
  lom: "http://ltsc.ieee.org/xsd/LOM",
} as const;

/**
 * The manifest identifier every generated package is read under.
 */
const packageIdentifier = "MANIFEST-metadata";

/**
 * Place one document of a package: its path there, the key its rows hold beside each node's
 * `start`.
 *
 * @param path - The document's path in its package.
 * @returns Its place.
 */
const idsFor = (path: string): Place => ({ package: packageIdentifier, path });

/**
 * Collapse a text as XML Schema's `collapse` whitespace class does.
 *
 * @param text - The text.
 * @returns Its collapsed value.
 * @see {@link https://www.w3.org/TR/xmlschema-2/#rf-whiteSpace | XML Schema Part 2, whiteSpace}
 */
const collapse = (text: string): string =>
  text
    .replaceAll(/[\t\n\r]/gu, " ")
    .replaceAll(/ +/gu, " ")
    .replace(/^ /u, "")
    .replace(/ $/u, "");

/**
 * Normalize a text as XML Schema's `replace` whitespace class does, `xs:normalizedString`'s.
 *
 * @param text - The text.
 * @returns Its value: each tab, line feed and carriage return a space.
 */
const normalize = (text: string): string => text.replaceAll(/[\t\n\r]/gu, " ");

/**
 * Read a language tag without regard to case (RFC 5646 §2.1.1): its ASCII capitals as small
 * letters, a tag's subtags being ASCII (§2.1).
 *
 * @param tag - The tag.
 * @returns The folded tag.
 */
const asciiFolded = (tag: string): string => tag.replaceAll(/[A-Z]/gu, (c) => c.toLowerCase());

/**
 * Count the breaches of one of reading 62's laws the law oracle finds in a package.
 *
 * @param files - The package's entries.
 * @param law - The law: `LomObjectIdentifier` or `LomObjectTitle`.
 * @returns The count; fails the test when the codec refuses the package.
 */
const oracleBreaches = Effect.fn("test.metadata.oracleBreaches")(function* oracleBreaches(
  files: readonly PackageFile[],
  law: "LomObjectIdentifier" | "LomObjectTitle",
) {
  const judgment = yield* judge(files, grammar, laws);

  return judgment._tag === "Judged"
    ? judgment.breaches.filter((breach) => breach.law === law).length
    : assert.fail(`the codec refused the package: ${judgment.rule}, ${judgment.detail}`);
});

/**
 * One LOM entry of a sketch: its value and the whitespace around it.
 */
interface EntrySketch {
  readonly lead: string;
  readonly trail: string;
  readonly value: string;
}

/**
 * One string of a sketch's title: its text, and its `language`, none when it writes none.
 */
interface StringSketch {
  readonly language: Option.Option<string>;
  readonly text: string;
}

/**
 * One LOM record of a sketch: its general category's identifiers' entries and titles' strings, and
 * its meta-metadata identifiers' entries, each identifier a list of entries and each title a list
 * of strings.
 */
interface RecordSketch {
  readonly general: readonly (readonly EntrySketch[])[];
  readonly meta: readonly (readonly EntrySketch[])[];
  readonly titles: readonly (readonly StringSketch[])[];
}

/**
 * One resource of a sketch: its kind, whether it writes an `href`, and its records.
 */
interface ResourceSketch {
  readonly href: boolean;
  readonly kind: "item" | "webcontent";
  readonly records: readonly RecordSketch[];
}

/**
 * A package as the generator sketches it: its objects' identifier padding and an item's
 * `xml:lang`, its manifest's own records, and its resources.
 */
interface PackageSketch {
  readonly lang: Option.Option<string>;
  readonly lead: string;
  readonly manifestRecords: readonly RecordSketch[];
  readonly resources: readonly ResourceSketch[];
  readonly trail: string;
}

/**
 * The title every sketched object carries.
 */
const objectTitle = "T x";

/**
 * The whitespace a sketch writes around a value.
 */
const pads = element(["", " ", "\n\t "]);

/**
 * The values a sketch's entries hold: the objects' identifier, another, one whose collapse holds a
 * space, and none.
 */
const values = element(["choice", "other", "ch oice", ""]);

/**
 * The texts a sketch's title strings hold: the objects' title, the title with a line feed where it
 * has a space and with two spaces, another, and none.
 */
const titleTexts = element([objectTitle, "T\nx", "T  x", "U", ""]);

/**
 * The `language` a sketch's title string writes: none, another than the item's, the item's, the
 * item's in capitals, and the empty text.
 */
const languages = element([
  Option.none<string>(),
  Option.some("fr"),
  Option.some("en"),
  Option.some("EN"),
  Option.some(""),
]);

/**
 * The `xml:lang` a sketched item writes: `en`, ` EN` (`en` padded and in capitals), none, and the
 * empty text.
 */
const itemLangs = element([
  Option.some("en"),
  Option.some(" EN"),
  Option.none<string>(),
  Option.some(""),
]);

/**
 * One entry of a sketch.
 *
 * @param source - The choice source.
 * @returns The entry.
 */
const entries: Gen<EntrySketch> = (source) => ({
  lead: pads(source),
  trail: pads(source),
  value: values(source),
});

/**
 * One title string of a sketch.
 *
 * @param source - The choice source.
 * @returns The string.
 */
const strings: Gen<StringSketch> = (source) => ({
  language: languages(source),
  text: titleTexts(source),
});

/**
 * One identifier's entries.
 */
const identifiers = array(entries, { max: 2, min: 0 });

/**
 * One title's strings.
 */
const titleStrings = array(strings, { max: 2, min: 0 });

/**
 * One record of a sketch.
 *
 * @param source - The choice source.
 * @returns The record.
 */
const records: Gen<RecordSketch> = (source) => ({
  general: array(identifiers, { max: 2, min: 0 })(source),
  meta: array(identifiers, { max: 1, min: 0 })(source),
  titles: array(titleStrings, { max: 1, min: 0 })(source),
});

/**
 * One resource of a sketch.
 *
 * @param source - The choice source.
 * @returns The resource.
 */
const resources: Gen<ResourceSketch> = (source) => ({
  href: boolean(source),
  kind: element(["item", "webcontent"] as const)(source),
  records: array(records, { max: 2, min: 0 })(source),
});

/**
 * A package of a sketch: up to two resources, each with up to two records, and up to one record
 * of the manifest's own.
 *
 * @param source - The choice source.
 * @returns The package.
 */
const sketches: Gen<PackageSketch> = (source) => ({
  lang: itemLangs(source),
  lead: pads(source),
  manifestRecords: array(records, { max: 1, min: 0 })(source),
  resources: array(resources, { max: 2, min: 1 })(source),
  trail: pads(source),
});

/**
 * The resource type each sketched kind is written as.
 */
const resourceTypes = {
  item: "imsqti_item_xmlv3p0",
  webcontent: "webcontent",
} as const;

/**
 * Write a sketched identifier as a `lom:identifier` with a catalog and its entries.
 *
 * @param list - The identifier's entries.
 * @returns Its XML.
 */
const identifierXml = (list: readonly EntrySketch[]): string =>
  `<imsmd:identifier><imsmd:catalog>c</imsmd:catalog>${list
    .map(({ lead, trail, value }) => `<imsmd:entry>${lead}${value}${trail}</imsmd:entry>`)
    .join("")}</imsmd:identifier>`;

/**
 * Write a sketched title as a `lom:title` with its strings.
 *
 * @param list - The title's strings.
 * @returns Its XML.
 */
const titleXml = (list: readonly StringSketch[]): string =>
  `<imsmd:title>${list
    .map(({ language, text }) => {
      const attribute = Option.match(language, {
        onNone: () => "",
        onSome: (value) => ` language="${value}"`,
      });

      return `<imsmd:string${attribute}>${text}</imsmd:string>`;
    })
    .join("")}</imsmd:title>`;

/**
 * Write a sketched record as a `lom:lom`.
 *
 * @param record - The record.
 * @returns Its XML.
 */
const recordXml = (record: RecordSketch): string => {
  const meta =
    record.meta.length === 0
      ? ""
      : `<imsmd:metaMetadata>${record.meta.map(identifierXml).join("")}</imsmd:metaMetadata>`;

  return `<imsmd:lom><imsmd:general>${record.general.map(identifierXml).join("")}${record.titles.map(titleXml).join("")}</imsmd:general>${meta}</imsmd:lom>`;
};

/**
 * The path a sketched resource's document is written at.
 *
 * @param resource - The resource.
 * @param at - Its place among the package's resources.
 * @returns The path.
 */
const pathOf = (resource: ResourceSketch, at: number): string =>
  resource.kind === "webcontent" ? `r${String(at)}.html` : `r${String(at)}.xml`;

/**
 * Write a sketched package's files: its manifest, and each resource's document, an item root
 * whose identifier is `choice` between the sketch's padding, whose title is {@link objectTitle} and
 * whose `xml:lang` is the sketch's, or a web page. A record names an item alone, since pantry
 * stores no test (spec reading 228).
 *
 * A resource with no `href` lists no file, so no reading takes one of its files for its document.
 *
 * @param sketch - The package.
 * @returns Its entries, sorted by path.
 */
const filesOf = (sketch: PackageSketch): readonly PackageFile[] => {
  const identifier = `${sketch.lead}choice${sketch.trail}`;
  const lang = Option.match(sketch.lang, {
    onNone: () => "",
    onSome: (value) => ` xml:lang="${value}"`,
  });
  const roots = {
    item: `<qti-assessment-item xmlns="${namespaces.asi}" identifier="${identifier}" title="${objectTitle}" time-dependent="false"${lang}/>`,
    webcontent: "<html/>",
  } as const;
  const resourcesXml = sketch.resources
    .map((resource, at) => {
      const path = pathOf(resource, at);
      const metadata =
        resource.records.length === 0
          ? ""
          : `<metadata>${resource.records.map(recordXml).join("")}</metadata>`;
      const href = resource.href ? ` href="${path}"` : "";
      const file = resource.href ? `<file href="${path}"/>` : "";

      return `<resource identifier="R${String(at)}" type="${resourceTypes[resource.kind]}"${href}>${metadata}${file}</resource>`;
    })
    .join("");
  const manifest = `<manifest xmlns="${namespaces.cp}" xmlns:imsmd="${namespaces.lom}" identifier="M"><metadata><schema>QTI Package</schema><schemaversion>3.0.1</schemaversion>${sketch.manifestRecords.map(recordXml).join("")}</metadata><organizations/><resources>${resourcesXml}</resources></manifest>`;
  const encoder = new TextEncoder();

  return [
    { bytes: encoder.encode(manifest), kind: "manifest" as const, path: "imsmanifest.xml" },
    ...sketch.resources.flatMap((resource, at) =>
      resource.href
        ? [
            {
              bytes: encoder.encode(roots[resource.kind]),
              kind: "file" as const,
              path: pathOf(resource, at),
            },
          ]
        : [],
    ),
  ].toSorted((left, right) => (left.path < right.path ? -1 : 1));
};

/**
 * The records of a sketch that name a document: those of an item resource with an `href`.
 *
 * @param sketch - The package.
 * @returns The records, each with the record it is.
 */
const namingOf = (sketch: PackageSketch): readonly { readonly record: RecordSketch }[] =>
  sketch.resources.flatMap(({ href, kind, records: listed }) =>
    href && kind === "item" ? listed.map((record) => ({ record })) : [],
  );

/**
 * Count the records reading 62's identifier half refuses in a sketch: each naming record that lists
 * a general entry, none of whose entries collapses to `choice`.
 *
 * @param sketch - The package.
 * @returns The count.
 */
const sketchIdentifierBreaches = (sketch: PackageSketch): number =>
  namingOf(sketch).filter(({ record }) => {
    const texts = record.general.flat().map(({ lead, trail, value }) => `${lead}${value}${trail}`);

    return texts.length > 0 && !texts.some((text) => collapse(text) === "choice");
  }).length;

/**
 * Count the records reading 62's title half refuses in a sketch: each naming record with a general
 * title none of whose strings in the object's language holds the object's title, under the
 * binding's comparisons (`strict`: `xs:normalizedString`'s value space, the `xml:lang` collapsed,
 * and tags without regard to case) or exact ones, which the situations compare it with.
 *
 * @param sketch - The package.
 * @param strict - Whether to compare as the binding does.
 * @returns The count.
 */
const sketchTitleBreaches = (sketch: PackageSketch, strict: boolean): number => {
  const fold = (text: string) => (strict ? asciiFolded(text) : text);
  const value = (text: string) => (strict ? normalize(text) : text);

  return namingOf(sketch).filter(({ record }) => {
    const written = Option.getOrElse(sketch.lang, () => "");
    const lang = strict ? collapse(written) : written;
    const named = record.titles.flat().some(({ language, text }) => {
      const tag = Option.getOrElse(language, () => "");

      return (
        value(text) === value(objectTitle) &&
        (lang === "" || tag === "" || fold(tag) === fold(lang))
      );
    });

    return record.titles.length > 0 && !named;
  }).length;
};

/**
 * A situation the generated packages must reach.
 */
type SketchSituation =
  | "identifier refused"
  | "identifier named"
  | "padded entry names"
  | "no href"
  | "webcontent"
  | "meta-metadata entry"
  | "manifest record"
  | "entry with inner space"
  | "title refused"
  | "title named"
  | "title in another language"
  | "empty title"
  | "named only in the value space";

/**
 * Decide whether a sketched entry names the objects' identifier: its text collapses to `choice`.
 *
 * @param entry - The entry.
 * @returns Whether it names the objects.
 */
const names = ({ lead, trail, value }: EntrySketch): boolean =>
  collapse(`${lead}${value}${trail}`) === "choice";

/**
 * Name the situations a sketch reaches.
 *
 * @param sketch - The package.
 * @returns Its situations.
 */
const situationsOf = (sketch: PackageSketch): readonly SketchSituation[] => {
  const naming = namingOf(sketch);
  const generalEntries = naming.flatMap(({ record }) => record.general.flat());
  const found: readonly (readonly [boolean, SketchSituation])[] = [
    [sketchIdentifierBreaches(sketch) > 0, "identifier refused"],
    [generalEntries.some(names), "identifier named"],
    [
      generalEntries.some((entry) => names(entry) && `${entry.lead}${entry.trail}` !== ""),
      "padded entry names",
    ],
    [sketch.resources.some(({ href, records: listed }) => !href && listed.length > 0), "no href"],
    [
      sketch.resources.some(
        ({ kind, records: listed }) => kind === "webcontent" && listed.length > 0,
      ),
      "webcontent",
    ],
    [
      sketch.resources.some(({ records: listed }) =>
        listed.some(({ meta }) => meta.flat().length > 0),
      ),
      "meta-metadata entry",
    ],
    [sketch.manifestRecords.length > 0, "manifest record"],
    [generalEntries.some(({ value }) => value === "ch oice"), "entry with inner space"],
    [sketchTitleBreaches(sketch, true) > 0, "title refused"],
    [
      naming.some(({ record }) => record.titles.length > 0) &&
        sketchTitleBreaches(sketch, true) <
          naming.filter(({ record }) => record.titles.length > 0).length,
      "title named",
    ],
    [
      naming.some(({ record }) =>
        record.titles
          .flat()
          .some(({ language }) =>
            Option.exists(
              language,
              (tag) =>
                tag !== "" &&
                asciiFolded(tag) !== asciiFolded(collapse(Option.getOrElse(sketch.lang, () => ""))),
            ),
          ),
      ) && Option.exists(sketch.lang, (lang) => collapse(lang) !== ""),
      "title in another language",
    ],
    [naming.some(({ record }) => record.titles.some((title) => title.length === 0)), "empty title"],
    [
      sketchTitleBreaches(sketch, false) > sketchTitleBreaches(sketch, true),
      "named only in the value space",
    ],
  ];

  return found.flatMap(([holds, situation]) => (holds ? [situation] : []));
};

/**
 * What the generated packages must reach, steered over 200 cases.
 */
const reached = required<SketchSituation>(
  [
    "identifier refused",
    "identifier named",
    "padded entry names",
    "no href",
    "webcontent",
    "meta-metadata entry",
    "manifest record",
    "entry with inner space",
    "title refused",
    "title named",
    "title in another language",
    "empty title",
    "named only in the value space",
  ],
  { cases: 200, sense: notesOnly },
);

describe("the law oracle's reading 62, generated packages", { timeout: searchTimeout }, () => {
  it.effect(
    "refuses exactly the records reading 62 refuses: the identifier compared collapsed, the title in its value space with tags compared without regard to case",
    (ctx) =>
      // Oracle: the specification as a checker, reading 62 over the package's sketch: a naming
      // record that lists general entries names its document's collapsed identifier
      // (QTI 3.0 Metadata §2.7.1.1), and one with a general title names its document's title, as
      // xs:normalizedString values, in its language, the root's xml:lang collapsed and tags
      // compared without regard to case (§2.7.1.2, RFC 5646 §2.1.1); against the law oracle's
      // `LomObjectIdentifier` and `LomObjectTitle` (`#pantry/test/oracle.ts`, over the shredded and
      // folded package). The database holds both laws by rules over queries over `Node`
      // (`#pantry/qti/queries.ts`), which only a database judges.
      // Bound: up to 2 resources of 3 kinds, each with up to 2 records of up to 2 general and 1
      // meta-metadata identifiers of up to 2 entries over 4 values and 3 paddings, and up to 1
      // title of up to 2 strings over 5 texts and 5 languages; 300 cases.
      searched(
        ctx,
        explore(
          {
            caseHang,
            concurrency: 1,
            coverage: reached,
            draw: drawn(sketches),
            kept: [],
            literal: Formatter.format,
            oracle: { kind: "specification", name: "reading 62 over the package's sketch" },
            runs: 300,
            shrink: completeShrink,
            steerEvery: 16,
            suite: "import/overlays/metadata-reading-62",
          },
          (sketch, c) =>
            Effect.gen(function* reading62() {
              c.noteAll(situationsOf(sketch));

              const files = filesOf(sketch);

              assert.strictEqual(
                yield* oracleBreaches(files, "LomObjectIdentifier"),
                sketchIdentifierBreaches(sketch),
                "identifier",
              );
              assert.strictEqual(
                yield* oracleBreaches(files, "LomObjectTitle"),
                sketchTitleBreaches(sketch, true),
                "title",
              );
            }),
        ),
      ),
  );
});

/**
 * Count a document's metadata rows by relation, the relations it writes no row of left out.
 *
 * @param rows - The document's rows.
 * @returns Each written relation's row count.
 */
const countsOf = (rows: MetadataRows): Readonly<Record<string, number>> =>
  Object.fromEntries(
    Object.entries(rows).flatMap(([relation, { size }]: [string, ReadonlyMap<string, unknown>]) =>
      size === 0 ? [] : [[relation, size] as const],
    ),
  );

/**
 * Shred one document from its text, as the importer reads it.
 *
 * @param xml - The document's text.
 * @returns Its tree; dies when it does not shred, which no case builds.
 */
const shreddedText = Effect.fn("test.metadata.shreddedText")(function* shreddedDocument(
  xml: string,
) {
  const read = yield* Effect.orDie(readXml(new TextEncoder().encode(xml)));

  return yield* Effect.orDie(shred(read, shredGrammar));
});

describe("import/overlays/metadata.ts, the manifest's resources", () => {
  it.effect(
    "writes no row of a cp:resource, the manifest's or a record file's whose root is a cp:manifest, whose records the manifest's resource hrefs name",
    () =>
      // Oracle: the specification as a checker, IMS Content Packaging 1.2: a package's resources are
      // its one manifest's, so a `cp:resource` of any other document, a record file's included,
      // names no resource of the package. Sterling's 05cdedfa case, restated: our model holds no
      // `LomResource` (660a9d64). A record names the document it describes through `namingRecords`
      // (`#pantry/qti/queries.ts`), over the `ResourceHrefPath` rows that the package overlay writes
      // from the manifest alone (`#pantry/import/overlays/index.ts`), so the metadata overlay writes
      // no row of a resource in either document.
      // Bound: R-O3s, its manifest listing two resources and its record file a `cp:manifest` root
      // holding one `cp:resource`.
      Effect.gen(function* manifestResources() {
        const manifest = yield* shreddedText(
          [
            `<manifest xmlns="${namespaces.cp}" identifier="M300"><resources>`,
            '<resource identifier="R1" type="imsqti_outcomes_xmlv3p0" href="test.xml"/>',
            '<resource identifier="R2" type="resourcemetadata/xml" href="test.xml"/>',
            "</resources></manifest>",
          ].join(""),
        );
        const recordFile = yield* shreddedText(
          `<manifest xmlns="${namespaces.cp}"><resources><resource/></resources></manifest>`,
        );
        assert.deepStrictEqual(countsOf(rowsOf(ownViewOf(manifest), idsFor(manifestPath))), {});
        assert.deepStrictEqual(countsOf(rowsOf(ownViewOf(recordFile), idsFor("metadata.xml"))), {});
        assert.deepStrictEqual(
          [...resourcePathsOf(flatDocumentOf(manifest)).values()],
          ["test.xml", "test.xml"],
          "the manifest's two resources, by the paths their hrefs name",
        );
      }),
  );
});

/**
 * The `metaData` package's one entry, which names no document: its item is `choice`.
 */
const metaDataEntry = "<imsmd:entry>qti_v2_item_01</imsmd:entry>";

/**
 * Replace a text of the `metaData` manifest, failing when the manifest does not hold it.
 *
 * @param files - The package's entries.
 * @param search - The text.
 * @param replacement - Its replacement.
 * @returns The package with its manifest edited.
 */
const withManifestText = (
  files: readonly PackageFile[],
  search: string,
  replacement: string,
): readonly PackageFile[] =>
  files.map((file) => {
    if (file.kind !== "manifest") {
      return file;
    }

    const text = new TextDecoder().decode(file.bytes);
    assert.include(text, search, "the manifest holds the text");

    return { ...file, bytes: new TextEncoder().encode(text.replace(search, replacement)) };
  });

/**
 * Replace the `metaData` manifest's entry.
 *
 * @param files - The package's entries.
 * @param entry - The entry's new text.
 * @returns The package with its manifest edited.
 */
const withEntry = (files: readonly PackageFile[], entry: string): readonly PackageFile[] =>
  withManifestText(files, metaDataEntry, `<imsmd:entry>${entry}</imsmd:entry>`);

describe("import/overlays/metadata.ts, the metaData fixture", () => {
  it.effect(
    "refuses metaData's record, whose entry names another item, and accepts it naming choice, padded or not",
    () =>
      // Oracle: a second implementation, the law oracle's `LomObjectIdentifier` over each package.
      // Bound: the fixture as published, and its entry edited to `choice` and to `choice` padded.
      Effect.gen(function* metaData() {
        const files = yield* readEntries(fixtures.metaData);

        for (const [label, edited, expected] of [
          ["metaData", files, 1],
          ["choice", withEntry(files, "choice"), 0],
          ["padded choice", withEntry(files, "\n    choice\t"), 0],
        ] as const) {
          assert.strictEqual(
            yield* oracleBreaches(edited, "LomObjectIdentifier"),
            expected,
            `${label}, by the oracle`,
          );
          assert.strictEqual(
            yield* oracleBreaches(edited, "LomObjectTitle"),
            1,
            `${label}: titled otherwise`,
          );
        }
      }).pipe(Effect.provide(NodeServices.layer)),
  );
});

/**
 * One usage value of the usage-value box: its `baseType` as written, none where it writes none, its
 * `fieldIdentifier` as written, none where it writes none (a value that writes one forms part of a
 * record, spec reading 105), and its content, as XML text and as the string value XML 1.0 reads
 * from it.
 */
interface UsageCase {
  readonly baseType: string | undefined;
  readonly fieldIdentifier: string | undefined;
  readonly content: { readonly value: string; readonly xml: string };
}

/**
 * The usage-value box: a `ud:value` that writes no `baseType`, one of three spelled base types, a
 * misspelled one and a padded one, with and without a `fieldIdentifier`, over four contents: none,
 * a number, a padded number, and a text that escapes its ampersand, which the reader expands (XML
 * 1.0 §4.6, the predefined entities).
 */
const usageCases: Gen<UsageCase> = (source) => ({
  baseType: source.draw(element([undefined, "float", "integer", "identifier", "Float", " float"])),
  content: source.draw(
    element([
      { value: "", xml: "" },
      { value: "0.87", xml: "0.87" },
      // A `ud:value`'s text is of a `whiteSpace="replace"` type, so its value holds each line feed
      // as a space (XML Schema 1.0 Part 2 §4.3.6; SV-VALUE-01), no space trimmed.
      { value: " 0.87 ", xml: " 0.87\n" },
      { value: "a&b", xml: "a&amp;b" },
    ]),
  ),
  fieldIdentifier: source.draw(element([undefined, "SCORE"])),
});

/**
 * A situation the usage-value box must reach.
 */
type UsageSituation =
  | "escaped"
  | "misspelled"
  | "outside a record"
  | "padded"
  | "spelled"
  | "unwritten";

/**
 * The base types the usage-value box spells as `BaseType` handles.
 */
const spelledUsageTypes: ReadonlySet<string> = new Set(["float", "integer", "identifier"]);

/**
 * Name a usage value's `baseType` situation, for the box's coverage.
 *
 * @param baseType - The `baseType` as written, none where it writes none.
 * @returns Its situation.
 */
const usageSituationOf = (baseType: string | undefined): UsageSituation => {
  if (baseType === undefined) {
    return "unwritten";
  }

  if (spelledUsageTypes.has(baseType)) {
    return "spelled";
  }

  return baseType.trim() === baseType ? "misspelled" : "padded";
};

describe("import/overlays/metadata.ts, usage values", () => {
  it.effect(
    "writes a UsageValue row exactly for a ud:value that writes baseType and fieldIdentifier, its text its string value, and its UsageValueBaseType row where the baseType spells a handle",
    (ctx) =>
      // Oracle: the specification as a checker, reading 105 and C17: a row where `baseType` and
      // `fieldIdentifier` are both written, the value forming part of a record, and none elsewhere
      // (a `baseType` outside a record is no base type, so its value is untyped text), its text
      // the string value of its content, and its `UsageValueBaseType` row only where its
      // lexical form spells a `BaseType` handle as written (decision 427: a misspelling has none,
      // and its value domain refuses it). A `baseType` itself has no row: the database selects its
      // attribute's `value` (`UsageBaseType` of `#pantry/qti/queries.ts`).
      // Bound: 6 baseType spellings, none among them, by 2 field identifiers, none among them, by
      // 4 contents, 48 cases.
      searched(
        ctx,
        exhaust(
          {
            box: "a ud:value with no, a spelled, a misspelled or a padded baseType, with and without a fieldIdentifier, by four contents",
            caseHang: Duration.seconds(10),
            concurrency: 1,
            coverage: requiredInSpace<UsageSituation>([
              "escaped",
              "misspelled",
              "outside a record",
              "padded",
              "spelled",
              "unwritten",
            ]),
            generator: usageCases,
            literal: Formatter.format,
            oracle: { kind: "specification", name: "reading 105 and C17's spelled codes" },
            suite: "pantry/import/overlays-metadata-usage-values",
          },
          (input: UsageCase, c) =>
            Effect.gen(function* usageValue() {
              c.note(usageSituationOf(input.baseType));
              if (input.baseType !== undefined && input.fieldIdentifier === undefined) {
                c.note("outside a record");
              }

              if (input.content.xml !== input.content.value) {
                c.note("escaped");
              }

              const attribute = [
                input.baseType === undefined ? "" : ` baseType="${input.baseType}"`,
                input.fieldIdentifier === undefined
                  ? ""
                  : ` fieldIdentifier="${input.fieldIdentifier}"`,
              ].join("");
              const xml = [
                '<usageData xmlns="http://www.imsglobal.org/xsd/imsqti_usagedata_v3p0">',
                '<ordinaryStatistic name="AIS" context="http://example.org/c">',
                '<targetObject identifier="item"/>',
                `<value${attribute}>${input.content.xml}</value>`,
                "</ordinaryStatistic></usageData>",
              ].join("");
              const read = yield* Effect.orDie(readXml(new TextEncoder().encode(xml)));
              const tree = yield* Effect.orDie(shred(read, shredGrammar));
              const built = rowsOf(ownViewOf(tree), idsFor("usage.xml"));
              const rows = [...built.UsageValue.values()];
              const typed = [...built.UsageValueBaseType.values()];
              const inRecord = input.baseType !== undefined && input.fieldIdentifier !== undefined;

              assert.deepStrictEqual(
                rows.map(({ baseTypeLexical, text }) => ({ baseTypeLexical, text })),
                inRecord ? [{ baseTypeLexical: input.baseType, text: input.content.value }] : [],
              );
              assert.deepStrictEqual(
                typed.map(({ baseType, baseTypeLexical, text }) => ({
                  baseType,
                  baseTypeLexical,
                  text,
                })),
                inRecord && spelledUsageTypes.has(input.baseType ?? "")
                  ? [
                      {
                        baseType: input.baseType,
                        baseTypeLexical: input.baseType,
                        text: input.content.value,
                      },
                    ]
                  : [],
              );
            }),
        ),
      ),
    searchTimeout,
  );
});
