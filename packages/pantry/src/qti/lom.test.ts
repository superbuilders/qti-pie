/**
 * The LOM level's checks (`#pantry/qti/lom.ts`), each judged by grizzle's evaluator of the level
 * over a whole row (`rowEvaluator`), a row breaking a check where its predicate is false or NULL:
 * the vocabulary over a term of LOM's own vocabulary (`LomTerm`) and the vCard form over a record
 * document's node (`RecordNode`): a check over a derived relation holds over each row its query
 * delivers, so the evaluator judges it over a row of that query's heading. The typed views of what
 * a package may state hold no check of their own, and the level asks a package for nothing: it
 * states no containment and no key. The importer's rows of a manifest written as the producers
 * write theirs show the string value's fold reaching every LOM leaf a view reads, and no check
 * refusing it. Which documents a record is read from, and which terms name another vocabulary, are
 * queries only the database evaluates, so the database is their judge, as it is the media level's
 * (`policyLaws` of `#pantry/test/oracle-laws.ts`).
 */
import type { CheckVerdict, EvaluatedRow, Unevaluated } from "@bjornpagen/grizzle";
import { exhaust } from "@bjornpagen/testing/explore";
import { requiredInSpace } from "@bjornpagen/testing/features";
import { element } from "@bjornpagen/testing/gen";
import type { Gen } from "@bjornpagen/testing/gen";
import { searched } from "@bjornpagen/testing/vitest";
import { NodeServices } from "@effect/platform-node";
import { assert, describe, it, layer } from "@effect/vitest";
import { Duration, Effect, FileSystem, Option, Record as Rec, Result } from "effect";
import { lawOfCheck } from "#pantry/import/refusal.ts";
import { readProgram } from "#pantry/import/program.ts";
import {
  ClassificationPurpose,
  ContributeRole,
  LomTerm,
  lomLawsByName,
  PackageClassification,
  PackageCredit,
  PackageRelation,
  packageScheme,
  QtiLom,
  QtiLomVocabulary,
  RelationKind,
  TaxonEntry,
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
 * Whether a row of `RecordNode` holds LOM vCard, as the check's rule over the query holds it.
 *
 * @param row - The row.
 * @returns Whether it holds the check.
 */
const vcardHolds = (row: RecordRow): boolean =>
  heldBy(
    insideDomains(
      Result.map(evaluate.admit(RecordNode, row), (admitted) => evaluate(RecordNode, admitted)),
      "LOM_vCard",
    ).checks.LOM_vCard,
    "LOM_vCard",
  );

/**
 * A row of `LomTerm`, a value of a term of LOM's own vocabulary, as LOM vocabulary reads one.
 */
type TermRow = EvaluatedRow<typeof LomTerm>;

/**
 * Whether a value of a term of LOM's own vocabulary holds LOM vocabulary, as the check's rule over
 * the query holds it.
 *
 * @param parentKind - Its term's element.
 * @param stringValue - Its folded text.
 * @returns Whether it holds the check.
 */
const termHolds = (parentKind: TermRow["parentKind"], stringValue: string): boolean => {
  const row: TermRow = {
    package: "p",
    parentKind,
    path: "imsmanifest.xml",
    start: 8n,
    stringValue,
  };

  return heldBy(
    insideDomains(
      Result.map(evaluate.admit(LomTerm, row), (admitted) => evaluate(LomTerm, admitted)),
      "LOM_vocabulary",
    ).checks.LOM_vocabulary,
    "LOM_vocabulary",
  );
};

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
 * Whether a node's parent is a term of a vocabulary LOM vocabulary reads.
 *
 * @param kind - The parent's kind.
 * @returns Whether it is a status, a role, a kind or a purpose.
 */
const isVocabularyKind = (kind: string): kind is keyof typeof vocabularies =>
  Object.hasOwn(vocabularies, kind);

describe("LOM vocabulary", () => {
  it("holds a status, a role, a kind and a purpose of LOM's own vocabulary to exactly LOM's terms", () => {
    // Oracle: IEEE 1484.12.1-2002 §4.4 ("If the source is "LOMv1.0", then the value space is
    // described by this edition of this Standard") over the vocabularies of 2.2, 2.3.1, 3.2.1, 7.1
    // and 9.1, and QTI 3.0 Metadata §2.7.7.1's precludes. A term of another source is no row of
    // `LomTerm`, the loose binding enforcing no default vocabulary (§3.6), so no source is judged
    // here: which terms name another vocabulary is `LomTerm`'s query, the database's to evaluate.
    // Bound: each of the four elements × every written value, exhausted.
    for (const parent of Rec.keys(vocabularies)) {
      const terms: readonly string[] = vocabularies[parent];
      for (const value of writtenValues) {
        assert.strictEqual(
          termHolds(parent, value),
          terms.includes(value),
          `${JSON.stringify(value)} in ${parent}`,
        );
      }
    }
  });
});

/**
 * RFC 2426's properties a vCard 3.0 "MUST" hold (§3.1.1 FN, §3.1.2 N, §3.6.9 VERSION), read the way
 * RFC 2425 §5.8.2 reads a content line, the oracle the patterns are held to: the lines between the
 * first, `BEGIN:VCARD`, and the last, `END:VCARD`, each a name, optionally after a group and a dot
 * and followed by parameters, before its first colon, compared without regard to case.
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
] as const;

describe("LOM vCard", () => {
  it("holds every contribute's entity to a vCard 3.0 with its N, its FN and its frame, each of any value", () => {
    // Oracle: RFC 2426 §3.1.1, §3.1.2 and §3.6.9 ("MUST be present") and §5's BEGIN and END, read
    // by `readVcard`, RFC 2425 §5.8.2's content line; an FN's and an N's value is a text-value,
    // `*(SAFE-CHAR / ":" / DQUOTE / ESCAPED-CHAR)` (§4), the blank one among them. Bound: the
    // box's fourteen entities.
    for (const text of vcards) {
      const vcard = readVcard(text);
      assert.strictEqual(
        vcardHolds({
          ...recordNode,
          kind: "lom:entity",
          parentKind: "lom:contribute",
          stringValue: text,
        }),
        vcard.framed &&
          has(vcard, "VERSION", (value) => value === "3.0") &&
          has(vcard, "N", () => true) &&
          has(vcard, "FN", () => true),
        JSON.stringify(text),
      );
    }
  });
});

/**
 * The typed views of what a package may state: its classifications (its grades and subjects among
 * them) with their taxa's names, its credits and its relations (its sources among them).
 */
const statedViews = new Set<unknown>([
  PackageClassification,
  TaxonEntry,
  PackageCredit,
  PackageRelation,
]);

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

  it("asks a package for nothing, and judges only a record's terms and vCards", () => {
    // Oracle: IEEE 1484.12.1-2002 §4.2 ("All data elements are optional"), QTI 3.0 Metadata
    // §2.7.2.3, §2.7.7.2 and §2.7.9 ("Usage as defined by [LOM, 02]"; "There may be multiple
    // instances of the classification category"), and QTI 3.0 Conformance §3 ("the applications
    // must be able to ignore or remove the unsupported data"): no identity, grade, subject, credit,
    // source or version is required, counted or held to a chain, so the level states no
    // containment and no key, and its checks read a term of LOM's own vocabulary or a record's node
    // alone, never a view of what a package may state. Bound: every statement of the level.
    for (const statement of Object.values(lomLawsByName).flat()) {
      assert.strictEqual(statement.kind, "check");
      assert.include([LomTerm, RecordNode] as readonly unknown[], statement.relation);
      assert.isFalse(statedViews.has(statement.relation), statement.name);
    }
  });
});

/**
 * One row of a view of what a package may state, as the view delivers it: a credit, of a role
 * and a vCard; a classification, of a purpose and a taxon; or a relation, of a kind and an entry.
 */
type StatedRow =
  | {
      readonly role: (typeof ContributeRole.handles)[number];
      readonly vcard: (typeof vcards)[number];
      readonly view: "credit";
    }
  | {
      readonly id: string;
      readonly purpose: (typeof ClassificationPurpose.handles)[number];
      readonly view: "classification";
    }
  | {
      readonly entry: string;
      readonly kind: (typeof RelationKind.handles)[number];
      readonly view: "relation";
    };

/**
 * A SHA-256 as the producers name a source file by one: 64 lowercase hex digits.
 */
const digest = "0123456789abcdef".repeat(4);

/**
 * Every row of the box: each role of LOM 2.3.1 with each vCard of {@link vcards}, each purpose of
 * LOM 9.1 with a taxon id of the shared grade scheme, of Ram's topics and of none of ours, and
 * each relation kind of LOM 7.1 with QTI's `precludes`, its entry a SHA-256, one a case away, a
 * URL and a name.
 */
const statedRows: Gen<StatedRow> = (source) => {
  const view = source.draw(element(["credit", "classification", "relation"] as const));
  switch (view) {
    case "credit": {
      return {
        role: source.draw(element(ContributeRole.handles)),
        vcard: source.draw(element(vcards)),
        view,
      };
    }

    case "classification": {
      return {
        id: source.draw(element(["03", "t01", "Grade 3"] as const)),
        purpose: source.draw(element(ClassificationPurpose.handles)),
        view,
      };
    }

    case "relation": {
      return {
        entry: source.draw(
          element([digest, digest.toUpperCase(), "https://example.org/source.json", "e"] as const),
        ),
        kind: source.draw(element(RelationKind.handles)),
        view,
      };
    }

    default: {
      return view satisfies never;
    }
  }
};

/**
 * A situation the box must reach: a credit, a grade, a subject or a source that a law of the level
 * once refused or required, each now a row no check reads.
 */
type StatedSituation =
  | "an author whose vCard writes no EMAIL"
  | "a publisher whose vCard writes no ORG"
  | "a grade"
  | "a subject"
  | "a source named by no SHA-256";

/**
 * The situations a row reaches.
 *
 * @param row - The row.
 * @returns Each situation of {@link StatedSituation} it is.
 */
const situationsOf = (row: StatedRow): readonly StatedSituation[] => {
  const reached: readonly (readonly [StatedSituation, boolean])[] = [
    [
      "an author whose vCard writes no EMAIL",
      row.view === "credit" &&
        row.role === "author" &&
        !readVcard(row.vcard).properties.has("EMAIL"),
    ],
    [
      "a publisher whose vCard writes no ORG",
      row.view === "credit" &&
        row.role === "publisher" &&
        !readVcard(row.vcard).properties.has("ORG"),
    ],
    ["a grade", row.view === "classification" && row.purpose === "educational level"],
    ["a subject", row.view === "classification" && row.purpose === "discipline"],
    [
      "a source named by no SHA-256",
      row.view === "relation" && row.kind === "isbasedon" && row.entry !== digest,
    ],
  ];

  return reached.flatMap(([situation, holds]) => (holds ? [situation] : []));
};

/**
 * The names of the checks the level judges a stated view's row by.
 *
 * @param row - The row.
 * @returns Each check's name.
 */
const checksOver = (row: StatedRow): readonly string[] => {
  const what = JSON.stringify(row);
  switch (row.view) {
    case "credit": {
      return Object.keys(
        insideDomains(
          Result.map(
            evaluate.admit(PackageCredit, {
              entity: 1n,
              package: "p",
              role: row.role,
              vcard: row.vcard,
            }),
            (admitted) => evaluate(PackageCredit, admitted),
          ),
          what,
        ).checks,
      );
    }

    case "classification": {
      return Object.keys(
        insideDomains(
          Result.map(
            evaluate.admit(PackageClassification, {
              id: row.id,
              package: "p",
              purpose: row.purpose,
              source: "https://qti.edullm.ai/grade",
            }),
            (admitted) => evaluate(PackageClassification, admitted),
          ),
          what,
        ).checks,
      );
    }

    case "relation": {
      return Object.keys(
        insideDomains(
          Result.map(
            evaluate.admit(PackageRelation, {
              catalog: "c",
              entry: row.entry,
              kind: row.kind,
              package: "p",
              relation: 1n,
            }),
            (admitted) => evaluate(PackageRelation, admitted),
          ),
          what,
        ).checks,
      );
    }

    default: {
      return row satisfies never;
    }
  }
};

describe("what a package may state", () => {
  it.effect(
    "holds no credit, classification or relation to a check of its own, whatever its role, purpose, kind, vCard or entry",
    (ctx) =>
      // Oracle: IEEE 1484.12.1-2002 §4.2 ("All data elements are optional"), 2.3.2 (an entity's
      // value space is a vCard 3.0, which LOM vCard judges at its node; RFC 2426 asks it for no
      // EMAIL, §3.3.2, and no ORG, §3.5.5), 7.2.1.2 (an entry is any CharacterString) and 9, with
      // QTI 3.0 Metadata §2.7.2.3, §2.7.7.2 and §2.7.9 ("Usage as defined by [LOM, 02]"). Bound:
      // 15 roles × 14 vCards, 9 purposes × 3 ids and 13 kinds × 4 entries, 289 rows, exhausted.
      searched(
        ctx,
        exhaust(
          {
            box: "every role with every vCard, every purpose with 3 ids, every relation kind with 4 entries",
            caseHang: Duration.seconds(10),
            concurrency: 1,
            coverage: requiredInSpace<StatedSituation>([
              "an author whose vCard writes no EMAIL",
              "a publisher whose vCard writes no ORG",
              "a grade",
              "a subject",
              "a source named by no SHA-256",
            ]),
            generator: statedRows,
            literal: (row) => JSON.stringify(row),
            oracle: {
              kind: "specification",
              name: "IEEE 1484.12.1-2002 §4.2, 2.3.2, 7.2.1.2 and 9, QTI 3.0 Metadata §2.7.2.3, §2.7.7.2 and §2.7.9",
            },
            suite: "pantry/qti/lom-stated-views",
          },
          (row: StatedRow, c) =>
            Effect.sync(() => {
              for (const situation of situationsOf(row)) {
                c.note(situation);
              }

              assert.deepStrictEqual(checksOver(row), [], JSON.stringify(row));
            }),
        ),
      ),
  );
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
          <imsmd:entity>${vcards[0]}</imsmd:entity>
        </imsmd:contribute>
        <imsmd:contribute>
          <imsmd:role><imsmd:source>LOMv1.0</imsmd:source><imsmd:value>publisher</imsmd:value></imsmd:role>
          <imsmd:entity>${vcards[1]}</imsmd:entity>
        </imsmd:contribute>
      </imsmd:lifeCycle>
      <imsmd:metaMetadata>
        <imsmd:contribute>
          <imsmd:role><imsmd:source>LOMv1.0</imsmd:source><imsmd:value>creator</imsmd:value></imsmd:role>
          <imsmd:entity>${vcards[1]}</imsmd:entity>
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
  ["lom:entity", "lom:contribute", vcards[0]],
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
          assert.isTrue(vcardHolds(row), `LOM vCard at ${String(start)}`);
          if (kind === "lom:value" && isVocabularyKind(parentKind)) {
            assert.isTrue(termHolds(parentKind, stringValue), `LOM vocabulary at ${String(start)}`);
          }
        }
      }).pipe(Effect.scoped),
  );
});
