/**
 * The LOM level's checks (`#pantry/qti/lom.ts`), each judged by grizzle's evaluator of the level
 * over a whole row (`rowEvaluator`), a row breaking a check where its predicate is false or NULL:
 * the vocabulary narrowing and the vCard form over a record document's node (`RecordNode`), and the
 * credit, source and version checks over their derived relations' rows: a check over a derived
 * relation holds over each row its query delivers, so the evaluator judges it over a row of that
 * query's heading. The importer's rows of a manifest written as the producers write theirs show
 * the string value's fold reaching every LOM leaf a view reads, and no check refusing it. Which
 * documents a record is read from, and the containments and keys over derived relations, are
 * queries only the database evaluates, so the database is their judge, as it is the media level's
 * (`policyLaws` of `#pantry/test/oracle-laws.ts`).
 */
import type { CheckVerdict, EvaluatedRow, Unevaluated } from "@bjornpagen/grizzle";
import { NodeServices } from "@effect/platform-node";
import { assert, describe, it, layer } from "@effect/vitest";
import { Effect, FileSystem, Option, Record as Rec, Result } from "effect";
import { lawOfCheck } from "#pantry/import/refusal.ts";
import { readProgram } from "#pantry/import/program.ts";
import {
  lomLawsByName,
  PackageCredit,
  packageScheme,
  QtiLom,
  QtiLomVocabulary,
} from "#pantry/qti/lom.ts";
import { RecordNode } from "#pantry/qti/names.ts";
import { previewRowsOf } from "#pantry/test/host-judge.ts";
import { evaluatorOf, insideDomains } from "#pantry/test/row-evaluation.ts";
import { scratchDirectory } from "#pantry/test/scratch.ts";

/**
 * Grizzle's evaluator of the LOM level's rows.
 */
const evaluate = evaluatorOf(QtiLom);

/**
 * A row of `RecordNode`, a node of a document records are read from, as the level's checks over it
 * read one.
 */
type RecordRow = EvaluatedRow<typeof RecordNode>;

/**
 * A node of a manifest's record as `RecordNode` delivers it: a `lom:value` of a `lom:status`, its
 * text empty. A test that holds a row of `RecordNode` to a check builds it from this one, with the
 * fields it varies in place, so grizzle's evaluator reads a whole row inside its domains.
 */
const recordNode: RecordRow = {
  kind: "lom:value",
  package: "p",
  parent: 7n,
  parentKind: "lom:status",
  path: "imsmanifest.xml",
  start: 8n,
  stringValue: "",
};

/**
 * Read a check's verdict over a row as a test reads it.
 *
 * @param verdict - The verdict, as grizzle's evaluator gives it.
 * @param what - The check and the row, for a failure's words.
 * @returns Whether the row holds the check; the case fails where the host does not evaluate it.
 */
const heldBy = (verdict: Result.Result<CheckVerdict, Unevaluated>, what: string): boolean =>
  Result.isSuccess(verdict)
    ? verdict.success === "holds"
    : assert.fail(`${what}: ${verdict.failure.why}`);

/**
 * Whether a row of `RecordNode` holds one of the level's checks over it, as the check's rule over
 * the query holds it.
 *
 * @param name - The check.
 * @param row - The row.
 * @returns Whether it holds the check.
 */
const recordHolds = (name: "LOM_vCard" | "LOM_vocabulary", row: RecordRow): boolean =>
  heldBy(
    insideDomains(
      Result.map(evaluate.admit(RecordNode, row), (admitted) => evaluate(RecordNode, admitted)),
      name,
      // oxlint-disable-next-line typescript/no-unsafe-enum-assignment -- The check's declared name keys its verdict.
    ).checks[name],
    name,
  );

/**
 * Whether a package's credit holds the level's check of it.
 *
 * @param name - The check.
 * @param row - The credit's row, of `PackageCredit`'s heading.
 * @returns Whether it holds the check.
 */
const creditHolds = (
  name: "Author_credit" | "Publisher_credit",
  row: EvaluatedRow<typeof PackageCredit>,
): boolean =>
  heldBy(
    insideDomains(
      Result.map(evaluate.admit(PackageCredit, row), (admitted) =>
        evaluate(PackageCredit, admitted),
      ),
      name,
      // oxlint-disable-next-line typescript/no-unsafe-enum-assignment -- The check's declared name keys its verdict.
    ).checks[name],
    name,
  );

/**
 * LOM's vocabularies as the standard lists them, the oracle the narrowing is held to: IEEE
 * 1484.12.1-2002 2.2 (status), 2.3.1 (a lifeCycle contribute's role), 3.2.1 (a metaMetadata
 * contribute's role), 7.1 with QTI 3.0 Metadata §2.7.7.1's `precludes` (a relation's kind) and 9.1
 * (a classification's purpose), each by the element that holds its terms.
 */
const vocabularies = {
  "lom:kind": [
    "ispartof",
    "haspart",
    "isversionof",
    "hasversion",
    "isformatof",
    "hasformat",
    "references",
    "isreferencedby",
    "isbasedon",
    "isbasisfor",
    "requires",
    "isrequiredby",
    "precludes",
  ],
  "lom:purpose": [
    "discipline",
    "idea",
    "prerequisite",
    "educational objective",
    "accessibility restrictions",
    "educational level",
    "skill level",
    "security level",
    "competency",
  ],
  "lom:role": [
    "author",
    "publisher",
    "unknown",
    "initiator",
    "terminator",
    "validator",
    "editor",
    "graphical designer",
    "technical implementer",
    "content provider",
    "technical validator",
    "educational validator",
    "script writer",
    "instructional designer",
    "subject matter expert",
    "creator",
  ],
  "lom:status": ["draft", "final", "revised", "unavailable"],
} as const;

/**
 * Every value the vocabulary box writes in each element: each term of every vocabulary, so a term
 * of one is written in the others, and 1EdTech's own spellings under `LOMv1.0` (`Creator`, `Final`,
 * `Discipline`, `Educational Level`), and a term of no vocabulary.
 */
const writtenValues = [
  ...new Set([
    ...Object.values(vocabularies).flat(),
    "Creator",
    "Final",
    "Discipline",
    "Educational Level",
    " author",
    "replaces",
  ]),
];

/**
 * Every source the vocabulary box writes: LOM's own, written, padded or empty (the binding's
 * `default="LOMv1.0"`), and two other vocabularies'.
 */
const writtenSources = ["LOMv1.0", " LOMv1.0\n", "", "LOMv2.0", "http://purl.org/dc/terms/"];

/**
 * A `lom:value` or `lom:source` node of a manifest's record, as the check reads it.
 *
 * @param kind - The node's kind.
 * @param parentKind - Its vocabulary element.
 * @param stringValue - Its folded text.
 * @returns The row.
 */
const termRow = (
  kind: "lom:source" | "lom:value",
  parentKind: RecordRow["parentKind"],
  stringValue: string,
): RecordRow => ({ ...recordNode, kind, parentKind, stringValue });

describe("LOM vocabulary", () => {
  it("admits in a status, a role, a kind and a purpose exactly LOM's terms and LOM's own source", () => {
    // Oracle: IEEE 1484.12.1-2002 §4.4 ("If the source is "LOMv1.0", then the value space is
    // described by this edition of this Standard") over the vocabularies of 2.2, 2.3.1, 3.2.1, 7.1
    // and 9.1, and QTI 3.0 Metadata §2.7.7.1's precludes; the binding's default source, LOMv1.0
    // (imsmd_loose_v1p3p2.xsd line 1392). Bound: each of the four elements × every written value
    // and every written source, exhausted; a learning resource type's terms, which the level does
    // not narrow, alike.
    for (const parent of Rec.keys(vocabularies)) {
      const terms: readonly string[] = vocabularies[parent];
      for (const value of writtenValues) {
        assert.strictEqual(
          recordHolds("LOM_vocabulary", termRow("lom:value", parent, value)),
          terms.includes(value),
          `${JSON.stringify(value)} in ${parent}`,
        );
      }

      for (const source of writtenSources) {
        assert.strictEqual(
          recordHolds("LOM_vocabulary", termRow("lom:source", parent, source)),
          source.trim() === "" || source.trim() === "LOMv1.0",
          `source ${JSON.stringify(source)} in ${parent}`,
        );
      }
    }

    for (const value of writtenValues) {
      assert.isTrue(
        recordHolds("LOM_vocabulary", termRow("lom:value", "lom:learningResourceType", value)),
        `${JSON.stringify(value)} in a learning resource type`,
      );
    }
  });
});

/**
 * RFC 2426's properties a vCard 3.0 "MUST" hold (§3.1.1 FN, §3.1.2 N, §3.6.9 VERSION) and the ones
 * a credit needs (decisions 14 and 16: EMAIL, ORG), read the way RFC 2425 §5.8.2 reads a content
 * line, the oracle the patterns are held to: the lines between the first, `BEGIN:VCARD`, and the
 * last, `END:VCARD`, each a name, optionally after a group and a dot and followed by parameters,
 * before its first colon, compared without regard to case.
 */
interface ReadVcard {
  readonly framed: boolean;
  readonly properties: ReadonlyMap<string, readonly string[]>;
}

/**
 * Read a vCard's lines as {@link ReadVcard} says.
 *
 * @param text - The entity's text.
 * @returns What it holds.
 */
const readVcard = (text: string): ReadVcard => {
  const lines = text.split(/[\r\n]+/u);
  const properties = new Map<string, string[]>();
  for (const line of lines) {
    const colon = line.indexOf(":");
    if (colon > 0) {
      const head = line.slice(0, colon);
      const name = (head.split(";")[0] ?? "").replace(/^[0-9A-Za-z-]+\./u, "").toUpperCase();
      properties.set(name, [...(properties.get(name) ?? []), line.slice(colon + 1)]);
    }
  }

  return {
    framed: /^BEGIN:VCARD[\r\n]/iu.test(text) && /[\r\n]END:VCARD[\r\n]*$/iu.test(text),
    properties,
  };
};

/**
 * Whether a vCard holds a property with a value of some test.
 *
 * @param vcard - The read vCard.
 * @param name - The property's name.
 * @param value - The value's test.
 * @returns Whether one holds.
 */
const has = (vcard: ReadVcard, name: string, value: (text: string) => boolean): boolean =>
  (vcard.properties.get(name) ?? []).some(value);

/**
 * Whether a value names something: some character other than a space or a tab.
 *
 * @param text - The value.
 * @returns Whether it does.
 */
const named = (text: string): boolean => /[^ \t]/u.test(text);

/**
 * Whether a value is an address: a local part and a domain around one `@` (RFC 5322 §3.4.1).
 *
 * @param text - The value.
 * @returns Whether it is.
 */
const address = (text: string): boolean => /^[^@]+@[^@]+$/u.test(text);

/**
 * The vCards of the box: the producers' own (RAM's author and publisher, decision 12), LOM's own
 * example (IEEE 1484.12.1 2.3.2, which writes no N and no VERSION), and each one property away from
 * them, in case, group, line ending and frame.
 */
const vcards = [
  "BEGIN:VCARD\nVERSION:3.0\nN:Family;Given;;;\nFN:Given Family\nEMAIL;TYPE=INTERNET:given@example.org\nORG:Alpha School\nEND:VCARD",
  "BEGIN:VCARD\nVERSION:3.0\nN:;;;;\nFN:Alpha School\nORG:Alpha School\nEND:VCARD",
  "BEGIN:VCARD\nFN:Joe Friday\nTEL:+1-919-555-7878\nTITLE:Area Administrator, Assistant\nEMAIL;TYPE=INTERNET:jfriday@host.com\nEND:VCARD\n",
  "begin:vcard\r\nversion:3.0\r\nn:Family;Given\r\nfn:Given Family\r\nemail:given@example.org\r\nend:vcard\r\n",
  "BEGIN:VCARD\nVERSION:3.0\nitem1.N:Family;Given\nitem1.FN:Given Family\nitem2.EMAIL;TYPE=INTERNET,PREF:given@example.org\nEND:VCARD",
  "BEGIN:VCARD\nVERSION:3.0\nNOTE:no name\nNICKNAME:nobody\nFN:Given Family\nEMAIL:given@example.org\nEND:VCARD",
  "BEGIN:VCARD\nVERSION:3.0\nN:Family;Given\nFN: \nEMAIL:given@example.org\nEND:VCARD",
  "BEGIN:VCARD\nVERSION:2.1\nN:Family;Given\nFN:Given Family\nEMAIL:given@example.org\nEND:VCARD",
  "BEGIN:VCARD\nVERSION:3.0\nN:Family;Given\nFN:Given Family\nEMAIL:given.example.org\nORG: \nEND:VCARD",
  "BEGIN:VCARD\nVERSION:3.0\nN:Family;Given\nFN:Given Family\nEMAIL;TYPE=INTERNET:\nEND:VCARD",
  "  BEGIN:VCARD\nVERSION:3.0\nN:Family;Given\nFN:Given Family\nEND:VCARD",
  "BEGIN:VCARD\nVERSION:3.0\nN:Family;Given\nFN:Given Family\nEMAIL:given@example.org",
  "BEGIN:VCARD\nVERSION:3.0\nN:Family;Given\nFN:Given Family\nEND:VCARD\nNOTE:after the end",
  "Given Family <given@example.org>",
];

describe("LOM vCard", () => {
  it("holds every contribute's entity to a vCard 3.0 with its N, its FN and its frame", () => {
    // Oracle: RFC 2426 §3.1.1, §3.1.2 and §3.6.9 ("MUST be present") and §5's BEGIN and END, read
    // by `readVcard`, RFC 2425 §5.8.2's content line. Bound: the box's fourteen entities.
    for (const text of vcards) {
      const vcard = readVcard(text);
      assert.strictEqual(
        recordHolds("LOM_vCard", {
          ...recordNode,
          kind: "lom:entity",
          parentKind: "lom:contribute",
          stringValue: text,
        }),
        vcard.framed &&
          has(vcard, "VERSION", (value) => value === "3.0") &&
          has(vcard, "N", () => true) &&
          has(vcard, "FN", named),
        JSON.stringify(text),
      );
    }
  });

  it("holds an author's vCard to an EMAIL and a publisher's to an ORG", () => {
    // Oracle: decisions 14 ("The database refuses a package whose author contribute vCard lacks an
    // EMAIL") and 16 ("a publisher contribute whose vCard has an ORG"), an address read as RFC 5322's
    // local part and domain around one @. Bound: the box's entities × the two credited roles and
    // one role neither law reads.
    for (const text of vcards) {
      const vcard = readVcard(text);
      for (const role of ["author", "publisher", "editor"] as const) {
        const row = { entity: 1n, package: "p", role, vcard: text };
        assert.strictEqual(
          creditHolds("Author_credit", row),
          role !== "author" || has(vcard, "EMAIL", address),
          `${role} ${JSON.stringify(text)}`,
        );
        assert.strictEqual(
          creditHolds("Publisher_credit", row),
          role !== "publisher" || has(vcard, "ORG", named),
          `${role} ${JSON.stringify(text)}`,
        );
      }
    }
  });
});

describe("Source pointer and Version lesson", () => {
  it("names a source by a SHA-256 and an earlier revision in the package scheme", () => {
    // Oracle: decision 7 ("naming its source file by digest", a SHA-256's 64 lowercase hex digits)
    // and decision 4 (one fixed scheme for our packages). Bound: a digest, and four texts a digit,
    // a case or a length away from one; the scheme and three other catalogs.
    const digest = "0123456789abcdef".repeat(4);
    const entries: readonly (readonly [string, boolean])[] = [
      [digest, true],
      [digest.toUpperCase(), false],
      [digest.slice(1), false],
      [`${digest}0`, false],
      [`sha256:${digest}`, false],
    ];
    for (const [entry, expected] of entries) {
      const row = { catalog: "c", entry, package: "p", relation: 1n };
      assert.strictEqual(
        heldBy(
          insideDomains(
            Result.map(evaluate.admit(QtiLom.relations.SourcePointer, row), (admitted) =>
              evaluate(QtiLom.relations.SourcePointer, admitted),
            ),
            entry,
          ).checks.Source_pointer,
          entry,
        ),
        expected,
        entry,
      );
    }

    const catalogs: readonly (readonly [string, boolean])[] = [
      [packageScheme, true],
      [`${packageScheme}/`, false],
      ["https://alphascience-grade-3.alpha-beta.app", false],
      ["URI", false],
    ];
    for (const [catalog, expected] of catalogs) {
      const row = { catalog, entry: "e", package: "p", relation: 1n };
      assert.strictEqual(
        heldBy(
          insideDomains(
            Result.map(evaluate.admit(QtiLom.relations.VersionOf, row), (admitted) =>
              evaluate(QtiLom.relations.VersionOf, admitted),
            ),
            catalog,
          ).checks.Version_lesson,
          catalog,
        ),
        expected,
        catalog,
      );
    }
  });
});

describe("the LOM level", () => {
  it("states each law of lomLawsByName and no other, each check named by its law", () => {
    // Oracle: the level's own grouping, and `checkNameOf`, the naming every check of the schema
    // follows. Bound: every statement of the level.
    const own = QtiLom.statements.slice(QtiLomVocabulary.statements.length);
    assert.deepStrictEqual(own, Object.values(lomLawsByName).flat());
    for (const [law, statements] of Object.entries(lomLawsByName)) {
      for (const statement of statements) {
        if (statement.kind === "check") {
          assert.deepStrictEqual(lawOfCheck(statement.name), Option.some(law), statement.name);
        }
      }
    }
  });
});

/**
 * A package's manifest written as the producers write theirs (decisions 12 to 17 and 26,
 * `out/collections/xml-examples/ram-after.xml`), with a resource whose record states a bank's
 * statement (decision 9) and a metaMetadata contribute of LOM 3.2.1's `creator`.
 */
const manifest = `<?xml version="1.0" encoding="UTF-8"?>
<manifest xmlns="http://www.imsglobal.org/xsd/qti/qtiv3p0/imscp_v1p1" xmlns:imsmd="http://ltsc.ieee.org/xsd/LOM" identifier="as-g3-t01-l01-say-where-it-is">
  <metadata>
    <schema>QTI Package</schema>
    <schemaversion>3.0.1</schemaversion>
    <imsmd:lom>
      <imsmd:general>
        <imsmd:identifier><imsmd:catalog>https://alphascience-grade-3.alpha-beta.app</imsmd:catalog><imsmd:entry>as-g3-t01-l01-say-where-it-is</imsmd:entry></imsmd:identifier>
        <imsmd:title><imsmd:string language="en">Say Where It Is</imsmd:string></imsmd:title>
        <imsmd:language>en</imsmd:language>
      </imsmd:general>
      <imsmd:lifeCycle>
        <imsmd:contribute>
          <imsmd:role><imsmd:source>LOMv1.0</imsmd:source><imsmd:value>author</imsmd:value></imsmd:role>
          <imsmd:entity>${vcards[0] ?? ""}</imsmd:entity>
        </imsmd:contribute>
        <imsmd:contribute>
          <imsmd:role><imsmd:source>LOMv1.0</imsmd:source><imsmd:value>publisher</imsmd:value></imsmd:role>
          <imsmd:entity>${vcards[1] ?? ""}</imsmd:entity>
        </imsmd:contribute>
      </imsmd:lifeCycle>
      <imsmd:metaMetadata>
        <imsmd:contribute>
          <imsmd:role><imsmd:source>LOMv1.0</imsmd:source><imsmd:value>creator</imsmd:value></imsmd:role>
          <imsmd:entity>${vcards[1] ?? ""}</imsmd:entity>
        </imsmd:contribute>
      </imsmd:metaMetadata>
      <imsmd:relation>
        <imsmd:kind><imsmd:source>LOMv1.0</imsmd:source><imsmd:value>isbasedon</imsmd:value></imsmd:kind>
        <imsmd:resource><imsmd:identifier><imsmd:catalog>https://alphascience-grade-3.alpha-beta.app/sha256</imsmd:catalog><imsmd:entry>${"0123456789abcdef".repeat(4)}</imsmd:entry></imsmd:identifier></imsmd:resource>
      </imsmd:relation>
      <imsmd:relation>
        <imsmd:kind><imsmd:source>LOMv1.0</imsmd:source><imsmd:value>isversionof</imsmd:value></imsmd:kind>
        <imsmd:resource><imsmd:identifier><imsmd:catalog>${packageScheme}</imsmd:catalog><imsmd:entry>as-g3-t01-l01-say-where-it-is-aa0d3ff1d085</imsmd:entry></imsmd:identifier></imsmd:resource>
      </imsmd:relation>
      <imsmd:classification>
        <imsmd:purpose><imsmd:source>LOMv1.0</imsmd:source><imsmd:value>educational level</imsmd:value></imsmd:purpose>
        <imsmd:taxonPath>
          <imsmd:source><imsmd:string language="en">https://qti.edullm.ai/grade</imsmd:string></imsmd:source>
          <imsmd:taxon><imsmd:id>03</imsmd:id><imsmd:entry><imsmd:string language="en">Grade 3</imsmd:string></imsmd:entry></imsmd:taxon>
        </imsmd:taxonPath>
      </imsmd:classification>
    </imsmd:lom>
  </metadata>
  <organizations/>
  <resources>
    <resource identifier="pool" type="imsqti_section_xmlv3p0" href="pool.xml">
      <metadata><imsmd:lom><imsmd:educational><imsmd:description><imsmd:string language="en">A statement of what the pool asks.</imsmd:string></imsmd:description></imsmd:educational></imsmd:lom></metadata>
      <file href="pool.xml"/>
    </resource>
  </resources>
</manifest>`;

/**
 * A bank of no item, the resource the manifest lists.
 */
const pool = `<?xml version="1.0" encoding="UTF-8"?>
<qti-assessment-section xmlns="http://www.imsglobal.org/xsd/imsqtiasi_v3p0" identifier="pool" title="Pool" visible="false"/>`;

/**
 * The text each folded LOM leaf of {@link manifest} holds, by its kind, its parent's kind where it
 * is a string: what the views read.
 */
const folded: readonly (readonly [string, string, string])[] = [
  ["lom:catalog", "lom:identifier", "https://alphascience-grade-3.alpha-beta.app"],
  ["lom:entry", "lom:identifier", "as-g3-t01-l01-say-where-it-is"],
  ["lom:string", "lom:title", "Say Where It Is"],
  ["lom:value", "lom:role", "author"],
  ["lom:source", "lom:role", "LOMv1.0"],
  ["lom:entity", "lom:contribute", vcards[0] ?? ""],
  ["lom:value", "lom:kind", "isversionof"],
  ["lom:entry", "lom:identifier", "as-g3-t01-l01-say-where-it-is-aa0d3ff1d085"],
  ["lom:value", "lom:purpose", "educational level"],
  ["lom:string", "lom:source.langString", "https://qti.edullm.ai/grade"],
  ["lom:id", "lom:taxon", "03"],
  ["lom:string", "lom:entry.langString", "Grade 3"],
];

layer(NodeServices.layer, { excludeTestServices: true })("the producers' manifest", (scoped) => {
  scoped.effect(
    "folds every LOM leaf a view reads, leaves a description unfolded, and breaks no check",
    () =>
      Effect.gen(function* foldedManifest() {
        // Oracle: the manifest's own text, each leaf's characters as written, and the producers'
        // shapes the decisions approve. Bound: one package, every Node row of its manifest.
        const fs = yield* FileSystem.FileSystem;
        const dir = yield* scratchDirectory("lom-");
        yield* fs.writeFileString(`${dir}/imsmanifest.xml`, manifest);
        yield* fs.writeFileString(`${dir}/pool.xml`, pool);

        const program = yield* readProgram(dir, "lom-probe");
        const nodes = previewRowsOf(program.inputs).Node.filter(
          (row) => row.path === "imsmanifest.xml",
        );
        const values = nodes.map((row) => [row.kind, row.parentKind, row.stringValue] as const);

        for (const [kind, parentKind, text] of folded) {
          assert.isTrue(
            values.some(
              (value) => value[0] === kind && value[1] === parentKind && value[2] === text,
            ),
            `${kind} under ${parentKind} folds ${JSON.stringify(text)}`,
          );
        }

        assert.isTrue(
          nodes.some(
            (row) =>
              row.kind === "lom:string" &&
              row.parentKind === "lom:description" &&
              row.stringValue === "",
          ),
          "a description's string is not folded",
        );
        // Each is a node of the manifest, a document records are read from, so `RecordNode`
        // delivers it.
        for (const { kind, package: pkg, parent, parentKind, path, start, stringValue } of nodes) {
          const row = { kind, package: pkg, parent, parentKind, path, start, stringValue };
          assert.isTrue(recordHolds("LOM_vocabulary", row), `LOM vocabulary at ${String(start)}`);
          assert.isTrue(recordHolds("LOM_vCard", row), `LOM vCard at ${String(start)}`);
        }
      }).pipe(Effect.scoped),
  );
});
