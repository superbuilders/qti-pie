/**
 * The languages R26 (`document-lang`, QTI 3.0 Metadata §2.7.1.3) asks an item's records to list,
 * as the import's rows hold them beside the law oracle: only those its `xml:lang` forms state, a
 * form stating a language only where its value, collapsed, is a language tag (spec reading 174).
 *
 * §2.7.1.3 asks "one value for each of the languages referred to by the language attributes on the
 * associated assessmentItem ... and its 'bodyElements'". An `xml:lang` refers to a language by a
 * BCP 47 tag (XML 1.0 §2.12), read by its value, its form collapsed (an `xs:language`, spec reading
 * 134); an empty value states none ("just as if xml:lang had not been specified", §2.12), and a
 * form RFC 5646's ABNF does not produce is no tag, so it identifies no language (§2.1 and §2.2.9),
 * as reading 151 reads it for `lom-title`. Such a form refers to no language a record could list,
 * and its value domain refuses it alone (spec reading 129), as a name that names nothing is
 * (reading 152). The import, the schema and the law oracle listed every form but an empty one or
 * one of whitespace alone, so `xml:lang="en_GB"` asked each record for `en_gb`, a value no tag has,
 * and was refused under "Document lang" beside its value domain unless the record wrote that
 * value.
 *
 * The genetic judge (`judgeOne`) cannot hold this: R26 is a rule over a query, which its host
 * leaves to the database. So the import's rows are judged here by the database's statement of R26
 * restated on the host: each form that states a language, its value not empty (`LangValue`), by its
 * compared value, under each category of a record that names its document, is one of the
 * category's languages. A form outside its domain never reaches R26 there: AL1's immediate CHECK
 * refuses its write first. Every form AL1 admits has a tag or the empty text for its value, so the
 * schema's test, a value not empty, asks exactly the forms that are tags.
 *
 * Oracle: a second implementation, the law oracle (`#pantry/test/oracle.ts` `judge`), against the
 * database's R26 over the import's rows and the tree (`DescribedLang` and `DescribedAssembledLang`
 * contained in `ListedLang`, `#pantry/qti/queries.ts`), and both against §2.7.1.3 under readings
 * 134 and 164 as stated above, each
 * form's tagness read off RFC 5646 by hand: the three refuse one set of forms under "Document
 * lang", and the oracle refuses a form under its value domain exactly where it lies outside it.
 *
 * Bound: an item whose root, or a body element, writes each of nine `xml:lang` forms (unwritten,
 * three tags, the empty one, one of whitespace alone and three that are no tag), its record's one
 * general category listing nothing, `en`, `en-gb` or `en_gb`: 72 packages, exhausted.
 */
import type { PreviewRows } from "@bjornpagen/grizzle";
import { NodeServices } from "@effect/platform-node";
import { assert, layer } from "@effect/vitest";
import { exhaust } from "@bjornpagen/testing/explore";
import { requiredInSpace } from "@bjornpagen/testing/features";
import { int } from "@bjornpagen/testing/gen";
import { searched } from "@bjornpagen/testing/vitest";
import { Array as Arr, Duration, Effect, FileSystem, Option, Predicate } from "effect";
import { grammar } from "#pantry/grammar/install.ts";
import { keyTextOf } from "#pantry/import/key-text.ts";
import { readProgram } from "#pantry/import/program.ts";
import { objectTypes, resourceMetadata } from "#pantry/qti/metadata.ts";
import { writePackage } from "#pantry/test/gen/every-relation.ts";
import type { PackageEntries } from "#pantry/test/gen/every-relation.ts";
import { Qti } from "#pantry/qti/schema.ts";
import { evaluatorFor, previewRowsOf, withGenerated } from "#pantry/test/host-judge.ts";
import type { HeldRow } from "#pantry/test/host-judge.ts";
import { filesOf } from "#pantry/test/oracle-complete/mutation.ts";
import { judge, lawsOf } from "#pantry/test/oracle.ts";
import { scratchDirectory } from "#pantry/test/scratch.ts";
import { nameOf as packageNameOf } from "#pantry/test/package-name.ts";
import { recordDocumentTypes } from "#pantry/vocab/terms/metadata.ts";
import { itemKind } from "#pantry/vocab/terms/tests.ts";
import { searchTimeout } from "#pantry/test/settings.ts";

/**
 * The oracle's law tables over the installed grammar.
 */
const laws = lawsOf(grammar);

/**
 * The schema's row evaluator, compiled once.
 */
const evaluator = evaluatorFor(Qti);

/**
 * One `xml:lang` form the box writes, and what RFC 5646 makes of its value, collapsed: the tag it
 * is, folded to small letters, or none for a form that is no tag.
 */
interface Form {
  readonly tag: Option.Option<string>;
  readonly written: Option.Option<string>;
}

/**
 * The forms: none written; `en`, `EN-gb` and ` en `, whose collapsed values are tags; the empty one
 * and one of whitespace alone, which state no language (XML 1.0 §2.12); and `en_GB` (`_` is no
 * subtag separator, RFC 5646 §2.1), `a-value` (a lone `a` is no language subtag, §2.1, reading 129)
 * and `english language` (whitespace is no part of a tag, §2.1), which are no tag.
 */
const forms: readonly Form[] = [
  { tag: Option.none(), written: Option.none() },
  { tag: Option.some("en"), written: Option.some("en") },
  { tag: Option.some("en-gb"), written: Option.some("EN-gb") },
  { tag: Option.some("en"), written: Option.some(" en ") },
  { tag: Option.none(), written: Option.some("") },
  { tag: Option.none(), written: Option.some(" ") },
  { tag: Option.none(), written: Option.some("en_GB") },
  { tag: Option.none(), written: Option.some("a-value") },
  { tag: Option.none(), written: Option.some("english language") },
];

/**
 * Where the form is written: on the item's root, whose `xml:lang` is never empty (information model
 * §4.1.4, reading 129), or on a `p` of its body, whose may be.
 */
type Place = "body" | "root";

/**
 * The languages the record's one general category lists: none, two tags, and `en_gb`, the value
 * the old reading asked of `en_GB`.
 */
const listings: readonly (readonly string[])[] = [[], ["en"], ["en-gb"], ["en_gb"]];

/**
 * One case of the box.
 */
interface LangCase {
  readonly form: Form;
  readonly listing: readonly string[];
  readonly place: Place;
}

/**
 * Every case of the box.
 */
const cases: readonly LangCase[] = (["root", "body"] as const).flatMap((place) =>
  forms.flatMap((form) => listings.map((listing): LangCase => ({ form, listing, place }))),
);

/**
 * A situation the box must reach.
 */
type Situation = "a tag listed" | "a tag unlisted" | "no language" | "no tag";

/**
 * Name a case.
 *
 * @param of - The case.
 * @returns Its name.
 */
const nameOf = (of: LangCase): string =>
  `${Option.match(of.form.written, {
    onNone: () => "no xml:lang",
    onSome: (written) => `xml:lang=${JSON.stringify(written)} on the ${of.place}`,
  })}, its record listing ${JSON.stringify(of.listing)}`;

/**
 * The attribute a case writes, empty where it writes none.
 *
 * @param of - The case.
 * @returns The attribute's text in a start tag.
 */
const langAttribute = (of: LangCase): string =>
  Option.match(of.form.written, {
    onNone: () => "",
    onSome: (written) => ` xml:lang="${written}"`,
  });

/**
 * Build a case's package: an item whose root or body `p` writes the case's `xml:lang`, and a
 * manifest whose resource names it by `href` (spec reading 93), its record's general category
 * listing the case's languages.
 *
 * @param of - The case.
 * @returns The package's entries.
 */
const packageOf = (of: LangCase): PackageEntries => {
  const languages = of.listing.map((language) => `<imsmd:language>${language}</imsmd:language>`);
  const root = of.place === "root" ? langAttribute(of) : "";
  const body = of.place === "body" ? langAttribute(of) : "";
  const text = new TextEncoder();

  return new Map([
    [
      "imsmanifest.xml",
      text.encode(
        `<?xml version="1.0" encoding="UTF-8"?>\n<manifest xmlns="http://www.imsglobal.org/xsd/qti/qtiv3p0/imscp_v1p1" xmlns:imsmd="http://ltsc.ieee.org/xsd/LOM" identifier="M"><metadata><schema>QTI Package</schema><schemaversion>3.0.1</schemaversion></metadata><organizations/><resources><resource identifier="R" type="imsqti_item_xmlv3p0" href="item.xml"><metadata><imsmd:lom><imsmd:general>${languages.join("")}</imsmd:general></imsmd:lom></metadata><file href="item.xml"/></resource></resources></manifest>\n`,
      ),
    ],
    [
      "item.xml",
      text.encode(
        `<?xml version="1.0" encoding="UTF-8"?>\n<qti-assessment-item xmlns="http://www.imsglobal.org/xsd/imsqtiasi_v3p0" identifier="item" title="Item" time-dependent="false"${root}><qti-item-body><p${body}>Hi</p></qti-item-body></qti-assessment-item>\n`,
      ),
    ],
  ]);
};

/**
 * Decide, from §2.7.1.3 under readings 134 and 174, the forms "Document lang" refuses in a case:
 * its form, where it states a tag the record's category does not list, without regard to case.
 *
 * @param of - The case.
 * @returns The refused forms, as written.
 */
const refusedForms = (of: LangCase): readonly string[] =>
  Option.match(Option.all({ tag: of.form.tag, written: of.form.written }), {
    onNone: () => [],
    onSome: ({ tag, written }) => (of.listing.includes(tag) ? [] : [written]),
  });

/**
 * Decide whether a case's form lies outside its value domain (spec reading 129): one that is no
 * tag, but the empty one on a body element, whose `xml:lang` may be empty (XML 1.0 §2.12).
 *
 * @param of - The case.
 * @returns Whether the value domain refuses it.
 */
const outsideDomain = (of: LangCase): boolean =>
  Option.isSome(of.form.written) &&
  Option.isNone(of.form.tag) &&
  !(of.place === "body" && Option.contains(of.form.written, ""));

/**
 * Read a row's text field.
 *
 * @param row - The row.
 * @param field - The field.
 * @returns Its text.
 */
const textOf = (row: HeldRow, field: string): string => {
  const value = row[field];

  return Predicate.isString(value) ? value : assert.fail(`the row holds no text in ${field}`);
};

/**
 * Read the key text of a row's fields, each a text or a position, in order (`keyTextOf`): an
 * element's `(package, path, start)`, a document's `(package, path)`.
 *
 * @param row - The row.
 * @param fields - The fields, in order.
 * @returns Their key text.
 */
const keyAt = (row: HeldRow, ...fields: readonly string[]): string =>
  keyTextOf(
    ...fields.map((field) => {
      const value = row[field];

      return Predicate.isString(value) || Predicate.isBigInt(value)
        ? value
        : assert.fail(`the row holds no text or position in ${field}`);
    }),
  );

/**
 * The resource types whose records name their document, as a set.
 */
const namingTypes: ReadonlySet<string> = new Set(objectTypes);

/**
 * The types of the documents a package's records are read from, as a set.
 */
const recordTypes: ReadonlySet<string> = new Set(recordDocumentTypes);

/**
 * Read the documents a package's records are read from, as the database reads them: each
 * `Document` of a type of {@link recordTypes}, a document's type being its `Document`'s alone.
 *
 * @param rowsOf - The rows of a relation.
 * @returns Each such document's `(package, path)`, as key texts.
 */
const recordDocumentsOf = (rowsOf: (relation: string) => readonly HeldRow[]): ReadonlySet<string> =>
  new Set(
    rowsOf("Document").flatMap((row) =>
      recordTypes.has(textOf(row, "documentType")) ? [keyAt(row, "package", "path")] : [],
    ),
  );

/**
 * Fold a text's ASCII capitals to small letters, as `Text.lowerAscii` does (RFC 5646 §2.1.1).
 *
 * @param text - The text.
 * @returns The folded text.
 */
const lowerAscii = (text: string): string =>
  text.replaceAll(/[A-Z]/gu, (capital) => capital.toLowerCase());

/**
 * Read the general categories of the records that name a document, as the database reads them
 * (`namingGenerals`, `#pantry/qti/queries.ts`): a category of a `lom:lom` of a resource's
 * `cp:metadata`, its resource of an item's or a test's type, its `type` attribute as written (an
 * `xs:string` enumeration, each handle spelled as its lexical form), and the document a resource
 * lists at the entry path its href names (its `ResourceHrefPath`).
 *
 * @param rowsOf - The rows of a relation.
 * @returns Each category's document, `(package, path)`, by the category's element, as key texts.
 */
const describingOf = (
  rowsOf: (relation: string) => readonly HeldRow[],
): ReadonlyMap<string, string> => {
  const resources = new Set(
    rowsOf("Node").flatMap((row) =>
      textOf(row, "kind") === "cp:resource" ? [keyAt(row, "package", "path", "start")] : [],
    ),
  );
  const typed = new Set(
    rowsOf("Attribute").flatMap((row) =>
      textOf(row, "name") === "type" &&
      resources.has(keyAt(row, "package", "path", "start")) &&
      namingTypes.has(textOf(row, "lexical"))
        ? [keyAt(row, "package", "path", "start")]
        : [],
    ),
  );
  const listed = new Set(rowsOf("ResourceDocument").map((row) => keyAt(row, "package", "path")));
  const documents = new Map(
    rowsOf("ResourceHrefPath").flatMap((row) => {
      const document = keyAt(row, "package", "target");

      return typed.has(keyAt(row, "package", "path", "start")) && listed.has(document)
        ? [[keyAt(row, "package", "path", "start"), document] as const]
        : [];
    }),
  );
  const nodes = rowsOf("Node");
  const records = recordDocumentsOf(rowsOf);
  const byPlace = new Map(
    nodes.map((row) => [keyAt(row, "package", "path", "start"), row] as const),
  );
  const parentOf = (row: HeldRow): HeldRow | undefined =>
    byPlace.get(keyAt(row, "package", "path", "parent"));
  const named = new Map(
    nodes.flatMap((row) => {
      const metadata = textOf(row, "kind") === "lom:lom" ? parentOf(row) : undefined;

      return metadata !== undefined &&
        textOf(metadata, "kind") === resourceMetadata &&
        records.has(keyAt(row, "package", "path"))
        ? Option.toArray(
            Option.fromUndefinedOr(documents.get(keyAt(metadata, "package", "path", "parent"))),
          ).map((document) => [keyAt(row, "package", "path", "start"), document] as const)
        : [];
    }),
  );

  return new Map(
    nodes.flatMap((row) =>
      textOf(row, "kind") === "lom:general"
        ? Option.toArray(
            Option.fromUndefinedOr(named.get(keyAt(row, "package", "path", "parent"))),
          ).map((document) => [keyAt(row, "package", "path", "start"), document] as const)
        : [],
    ),
  );
};

/**
 * Read the languages each general category of a record's document lists, as the database reads
 * them (`ListedLang`, `#pantry/qti/queries.ts`): each `lom:language` whose parent is a
 * `lom:general`, its string value, its children's characters in order, case-folded.
 *
 * @param rowsOf - The rows of a relation.
 * @returns Each listing as the key text of its category's element and its language.
 */
const listedOf = (rowsOf: (relation: string) => readonly HeldRow[]): ReadonlySet<string> => {
  const nodes = rowsOf("Node");
  const records = recordDocumentsOf(rowsOf);
  const byPlace = new Map(
    nodes.map((row) => [keyAt(row, "package", "path", "start"), row] as const),
  );
  const charsOf = new Map<string, string>();
  const placed = nodes.flatMap((row) => {
    const { start } = row;

    return Predicate.isBigInt(start) ? [{ row, start }] : [];
  });
  for (const { row } of placed.toSorted((left, right) => Number(left.start - right.start))) {
    const { chars } = row;
    if (Predicate.isString(chars) && chars !== "") {
      const parent = keyAt(row, "package", "path", "parent");
      charsOf.set(parent, `${charsOf.get(parent) ?? ""}${chars}`);
    }
  }

  return new Set(
    nodes.flatMap((row) => {
      const general = byPlace.get(keyAt(row, "package", "path", "parent"));

      return textOf(row, "kind") === "lom:language" &&
        general !== undefined &&
        textOf(general, "kind") === "lom:general" &&
        records.has(keyAt(row, "package", "path"))
        ? [
            JSON.stringify([
              keyAt(row, "package", "path", "parent"),
              lowerAscii(charsOf.get(keyAt(row, "package", "path", "start")) ?? ""),
            ]),
          ]
        : [];
    }),
  );
};

/**
 * Judge the database's R26 on the host over a package's rows: each `xml:lang` that states a
 * language (`LangValue`, `#pantry/qti/names.ts`: its attribute's `value` not empty) outside every
 * catalog, its element's `CatalogScope` its document node, a document's, or an item's assembly's
 * through each `Instance` of the item's assembly that places its document
 * (`DescribedAssembledLang`, `#pantry/qti/queries.ts`), by its compared value, that `value`
 * case-folded, under each category describing its document ({@link describingOf}), is a language
 * that category lists ({@link listedOf}). The attribute's `value` is the one grizzle's evaluator
 * gives it (`#pantry/test/host-judge.ts` `withGenerated`), so the host judges R26 by the database's
 * own derivation.
 *
 * @param rows - The rows the import's write stores.
 * @returns The forms the law refuses, as written.
 */
const documentLangOf = (rows: PreviewRows<typeof Qti>): readonly string[] => {
  const view: ReadonlyMap<string, readonly HeldRow[]> = new Map(Object.entries(rows));
  const rowsOf = (relation: string): readonly HeldRow[] => view.get(relation) ?? [];
  const describing = [...describingOf(rowsOf)];
  const listed = listedOf(rowsOf);
  const scopeAt = new Map(
    rowsOf("CatalogScope").map(
      (row) => [keyAt(row, "package", "path", "start"), row["scope"]] as const,
    ),
  );
  const documentForms = rowsOf("Attribute").filter(
    (row) =>
      row["name"] === "xml:lang" && scopeAt.get(keyAt(row, "package", "path", "start")) === 0n,
  );
  const itemInstances = rowsOf("Instance").filter((row) => row["assemblyKind"] === itemKind);
  const refusedOf = (ownersOf: (attribute: HeldRow) => readonly string[]): readonly string[] =>
    documentForms.flatMap((attribute) => {
      const value = lowerAscii(
        textOf(withGenerated(evaluator, Qti.relations.Attribute, attribute), "value"),
      );

      return value !== "" &&
        ownersOf(attribute).some((owner) =>
          describing.some(
            ([general, document]) =>
              document === owner && !listed.has(JSON.stringify([general, value])),
          ),
        )
        ? [textOf(attribute, "lexical")]
        : [];
    });

  return [
    ...new Set([
      ...refusedOf((attribute) => [keyAt(attribute, "package", "path")]),
      ...refusedOf((attribute) =>
        itemInstances.flatMap((instance) =>
          keyAt(instance, "package", "document") === keyAt(attribute, "package", "path")
            ? [keyAt(instance, "package", "assembly")]
            : [],
        ),
      ),
    ]),
  ];
};

layer(NodeServices.layer, { excludeTestServices: true })(
  "the languages an item's records list, as the import's rows hold them",
  (it) => {
    it.effect(
      "asks the records to list only the forms that are language tags once collapsed, on the import's rows, in the schema and in the law oracle",
      (ctx) =>
        searched(
          ctx,
          Effect.gen(function* documentLangRuns() {
            const fs = yield* FileSystem.FileSystem;
            const directory = yield* scratchDirectory("document-lang-");

            assert.strictEqual(cases.length, 72);

            return yield* exhaust(
              {
                box: "an item whose root or body p writes one of nine xml:lang forms, its record's general category listing nothing, en, en-gb or en_gb",
                caseHang: Duration.minutes(2),
                concurrency: 1,
                coverage: requiredInSpace<Situation>([
                  "a tag listed",
                  "a tag unlisted",
                  "no language",
                  "no tag",
                ]),
                generator: int(0, cases.length - 1),
                literal: (at) => nameOf(Arr.getUnsafe(cases, at)),
                oracle: {
                  kind: "second-implementation",
                  name: "the law oracle and the schema's R26 over the import's rows, against QTI 3.0 Metadata §2.7.1.3 under readings 134 and 174",
                },
                suite: "import/overlays/document-lang",
              },
              (at, c) =>
                Effect.gen(function* documentLangCase() {
                  const of = Arr.getUnsafe(cases, at);
                  const said = nameOf(of);
                  const expected = refusedForms(of);
                  c.note(
                    Option.match(of.form.tag, {
                      onNone: () => (outsideDomain(of) ? "no tag" : "no language"),
                      onSome: () => (expected.length > 0 ? "a tag unlisted" : "a tag listed"),
                    }),
                  );

                  const entries = packageOf(of);
                  const judgment = yield* judge(filesOf(entries), grammar, laws);
                  assert.strictEqual(judgment._tag, "Judged", said);

                  const breaches = judgment._tag === "Judged" ? judgment.breaches : [];

                  const dir = `${directory}/c${String(at)}`;
                  yield* writePackage(entries, dir);

                  const { inputs } = yield* Effect.orDie(readProgram(dir, packageNameOf(dir)));
                  yield* fs.remove(dir, { recursive: true });

                  // AL1's CHECK is immediate: it refuses a form outside its domain at its Attribute
                  // row's INSERT, so that write never reaches R26, a rule over a query, which its
                  // deferred triggers judge at COMMIT. The database's verdict there is AL1's.
                  const refused = outsideDomain(of) ? [] : documentLangOf(previewRowsOf(inputs));

                  assert.deepStrictEqual(
                    breaches
                      .filter(({ law }) => law === "Document lang")
                      .flatMap(({ keys }) => Option.toArray(Option.fromNullishOr(keys["lang"]))),
                    expected,
                    `${said}: the law oracle`,
                  );
                  assert.deepStrictEqual(refused, expected, `${said}: the import's rows`);
                  assert.strictEqual(
                    breaches.some(({ law }) => law === "value domain"),
                    outsideDomain(of),
                    `${said}: the value domain`,
                  );
                }),
            );
          }).pipe(Effect.scoped),
        ),
      searchTimeout,
    );
  },
);
