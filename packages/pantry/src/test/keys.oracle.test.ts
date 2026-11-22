/**
 * The law oracle's key texts against the schema (Aiden's question on RV-slices S1: does the
 * oracle's list cover ID attributes, so the oracle and the database agree on a 700-byte id?).
 *
 * - **The list is the schema's.** `#pantry/test/key-copies.ts` reads its copies from the schema's
 *   statements. This file holds them, statement by statement and field by field, to the laws the
 *   law table states (`src/test/law-namer.ts` `statedLaws`), to every `matchedText` field of the
 *   document relations, and to the copies whose source is no document row.
 * - **The verdict is the schema's.** Generated packages carry key texts of generated lengths in 1-,
 *   2-, 3- and 4-byte scripts, past the old interim bound and past what one B-tree entry holds of a
 *   text as itself, which a key holds by its image (LIMITS6). The oracle refuses one under "Key
 *   text bound" exactly where the import's rows hold a text `matchedText` does not admit, every field
 *   it names is one of those rows' fields, and every rule the database would refuse it under is one
 *   the oracle names: one cause, one rule, `key-text-bound` at both seats. The one bound a key text
 *   meets, the regex engine's `matchedTextBytes`, is past every text a package here writes, and an
 *   entry path is of any length (no index orders by one), so every package here is admitted.
 */
import { keyTextBytes } from "@bjornpagen/grizzle";
import type { LawSide } from "@bjornpagen/grizzle";
import { NodeServices } from "@effect/platform-node";
import { assert, describe, it, layer } from "@effect/vitest";
import { drawn, exhaust, explore } from "@bjornpagen/testing/explore";
import { required, requiredInSpace } from "@bjornpagen/testing/features";
import { element } from "@bjornpagen/testing/gen";
import type { Gen } from "@bjornpagen/testing/gen";
import { notesOnly } from "@bjornpagen/testing/sense";
import { completeShrink } from "@bjornpagen/testing/shrink";
import { keep, swarm, swarmChoice } from "@bjornpagen/testing/swarm";
import type { Swarm } from "@bjornpagen/testing/swarm";
import { searched } from "@bjornpagen/testing/vitest";
import { Array as Arr, Duration, Effect, Formatter, Option, pipe, Predicate, Schema } from "effect";
import { anyText, grammar } from "#pantry/grammar/install.ts";
import { readProgram, rowCountsOf } from "#pantry/import/program.ts";
import type { PackageInputs } from "#pantry/import/write.ts";
import { readEntries } from "#pantry/package/read.ts";
import { EntryPath, matchedTextBytes, utf8Length } from "#pantry/qti/limits.ts";
import { Qti } from "#pantry/qti/schema.ts";
import { scopedPackage } from "#pantry/test/gen/every-relation.ts";
import { evaluatorFor, previewRowsOf, withGenerated } from "#pantry/test/host-judge.ts";
import type { HeldRow } from "#pantry/test/host-judge.ts";
import { identityOf, keyCopies, keyTextFields } from "#pantry/test/key-copies.ts";
import { judge, ruleOf } from "#pantry/test/oracle.ts";
import { schemaRuleOfLaw, statedLaws } from "#pantry/test/law-namer.ts";
import { laws } from "#pantry/test/installed-laws.ts";
import { nameOf } from "#pantry/test/package-name.ts";

/**
 * The timeout, in milliseconds, that this file's slower tests state, each itself or through its
 * describe: a hang guard.
 */
const testTimeoutMs = 1_800_000;

/**
 * The document relations the oracle has rows for.
 */
const documentRelations: ReadonlySet<string> = new Set(["Attribute", "Node"]);

/**
 * Whether a relation's field is of type `matchedText`.
 *
 * @param relation - The relation's name.
 * @param field - The field's name.
 * @returns Whether it is.
 */
const isKeyText = (relation: string, field: string): boolean =>
  keyTextFields.has(`${relation}.${field}`);

/**
 * A stored relation of the schema as grizzle keeps it, for its fields' names.
 */
const FieldsRead = Schema.Struct({
  fields: Schema.Record(Schema.String, Schema.Unknown),
  kind: Schema.Literal("relation"),
  name: Schema.String,
});

/**
 * Every stored field of the composed schema whose type is `EntryPath`, as `Relation.field`: an
 * entry's path in its package, a document's own `path` and a reference's resolved `target`, each
 * of any length (`#pantry/qti/limits.ts`), held to `EntryPath`'s pattern alone.
 */
const entryPathFields: ReadonlySet<string> = new Set(
  Object.values(Qti.relations).flatMap((member) =>
    Option.match(Schema.decodeUnknownOption(FieldsRead)(member), {
      onNone: () => [],
      onSome: ({ fields, name }) =>
        Object.entries(fields).flatMap(([field, type]) =>
          type === EntryPath ? [`${name}.${field}`] : [],
        ),
    }),
  ),
);

/**
 * The copies the law table states: each containment of `statedLaws` that pairs a field of no
 * `matchedText` type of its source with a `matchedText` field of its target, and each
 * `Monoid.concat` fold over a relation's own rows into a `matchedText` accumulator of it, as `law →
 * Relation.field` for the field it holds, with whether its source is a document relation.
 */
const statedCopies = statedLaws().flatMap(([law]) => {
  if (law.kind === "contained") {
    return law.from.terms.flatMap((term, at) => {
      const held = law.to.terms[at]?.field ?? "";

      return isKeyText(law.to.relation, held) && !isKeyText(law.from.relation, term.field)
        ? [
            {
              copy: `${identityOf(law)} → ${law.to.relation}.${held}`,
              document: documentRelations.has(law.from.relation),
              source: `${law.from.relation}.${term.field}`,
            },
          ]
        : [];
    });
  }

  const held = law.kind === "fold" ? (law.end.terms.at(-1)?.field ?? "") : "";

  return law.kind === "fold" &&
    law.monoid === "concat" &&
    isKeyText(law.end.relation, held) &&
    law.step.relation === law.end.relation
    ? [
        {
          copy: `${identityOf(law)} → ${law.end.relation}.${held}`,
          document: documentRelations.has(law.end.relation),
          source: `${law.step.relation}.${law.step.terms.at(-3)?.field ?? ""}`,
        },
      ]
    : [];
});

/**
 * A side of a containment as grizzle keeps it: the relation it reads, a selection's or its own,
 * and its terms, a `pred` one as an object over its field.
 */
const SideRead = Schema.Struct({
  source: Schema.Union([
    Schema.Struct({ relation: Schema.Struct({ name: Schema.String }) }),
    Schema.Struct({ name: Schema.String }),
  ]),
  terms: Schema.NonEmptyArray(
    Schema.Union([Schema.String, Schema.Struct({ field: Schema.String })]),
  ),
});

/**
 * A containment or a mirrors as grizzle keeps it.
 */
const ContainmentRead = Schema.Struct({
  kind: Schema.Literals(["contained", "mirrors"]),
  left: SideRead,
  right: SideRead,
});

/**
 * Read a containment's side as a law names it.
 *
 * @param side - The side as grizzle keeps it.
 * @returns The side.
 */
const lawSideOf = (side: typeof SideRead.Type): LawSide => ({
  relation: "name" in side.source ? side.source.name : side.source.relation.name,
  selection: { conjuncts: [] },
  terms: pipe(
    side.terms,
    Arr.map((term): LawSide["terms"][number] =>
      Predicate.isString(term)
        ? { field: term, kind: "field" }
        : { field: term.field, kind: "pred" },
    ),
  ),
});

/**
 * The places among the schema's statements of each containment, by its law's identity: a mirrors
 * is both of its containments, and two statements may share one identity.
 */
const placesByIdentity: ReadonlyMap<string, ReadonlySet<number>> = (() => {
  const places = new Map<string, Set<number>>();
  for (const [at, statement] of Qti.statements.entries()) {
    for (const { kind, left, right } of Option.toArray(
      Schema.decodeUnknownOption(ContainmentRead)(statement),
    )) {
      const ways =
        kind === "mirrors"
          ? [[left, right] as const, [right, left] as const]
          : [[left, right] as const];
      for (const [from, to] of ways) {
        const identity = identityOf({
          from: lawSideOf(from),
          kind: "contained",
          to: lawSideOf(to),
        });
        places.set(identity, new Set([...(places.get(identity) ?? []), at]));
      }
    }
  }

  return places;
})();

describe("the oracle's key-text list", () => {
  it("is every containment and fold the law table states of a document's text into a key text", () => {
    // Oracle: the law table (`statedLaws`), read independently of key-copies.ts: each stated
    // containment pairing a document field of no matchedText type with a matchedText field, and each concat
    // fold into a matchedText accumulator over a document relation's own rows.
    // Bound: every law the schema states that is no check.
    const stated = new Set(statedCopies.filter(({ document }) => document).map(({ copy }) => copy));
    const listed = new Set(
      keyCopies.filter(({ by }) => by !== "check").map(({ field, law }) => `${law} → ${field}`),
    );

    assert.deepStrictEqual([...listed].toSorted(), [...stated].toSorted());
  });

  it("holds one copy for each statement and field that writes it, so no copy of several sharing an identity is left out", () => {
    // Oracle: the schema's statements, read independently of key-copies.ts: each containment whose
    // identity is a stated copy's is one place, and the list holds a copy at each such place.
    // Bound: every containment and mirrors of the composed Qti.
    const keyed = new Set(keyCopies.map(({ field, statement }) => `${String(statement)} ${field}`));

    assert.strictEqual(keyed.size, keyCopies.length, "two copies share a statement and a field");
    for (const { copy, document } of statedCopies) {
      const [law = "", field = ""] = copy.split(" → ");
      const listed = new Set(
        keyCopies
          .filter((held) => held.law === law && held.field === field)
          .map(({ statement }) => statement),
      );
      if (document && law.startsWith("contained ")) {
        assert.deepStrictEqual(
          [...listed].toSorted((a, b) => a - b),
          [...(placesByIdentity.get(law) ?? [])].toSorted((a, b) => a - b),
          `${copy}: the list holds it at other statements than the schema states it`,
        );
      }
    }
  });

  it("holds every anyText field of a document relation by a copy, or as a prefix of a held fold's end", () => {
    // Oracle: the schema's field types: every matchedText field of Attribute and Node is the field of a
    // copy, or a running accumulator of a concat fold whose end a copy holds.
    // Bound: the document relations' fields.
    const held = new Set(keyCopies.map(({ field }) => field));
    const prefixes = new Set(
      statedLaws().flatMap(([law]) =>
        law.kind === "fold" && held.has(`${law.end.relation}.${law.end.terms.at(-1)?.field ?? ""}`)
          ? law.step.terms.slice(-2).map(({ field }) => `${law.step.relation}.${field}`)
          : [],
      ),
    );
    const documentFields = [...keyTextFields].filter((field) =>
      documentRelations.has(field.split(".")[0] ?? ""),
    );

    assert.deepStrictEqual(
      documentFields.filter((field) => !held.has(field) && !prefixes.has(field)),
      [],
    );
    assert.deepStrictEqual(
      keyCopies
        .filter(({ by }) => by === "check")
        .map(({ field, reads, source }) => `${source}.${reads} = ${field}`)
        .toSorted(),
      // No check equates a document field with a bounded text on one row: an IDREF's tokens'
      // concatenation, `Attribute.idrefText`, is of any length, a key holding it by its image
      // (attributes.ts). A member's characters are its string value's step itself (node.ts), held
      // by the fold's bounded accumulators.
      [],
    );
  });

  it("leaves out only the copies whose source is no document row, each bounded where it is written", () => {
    // Oracle: the law table's copies into a matchedText field from a relation the oracle has no
    // rows of, each bounded by its own type where its row is written: `LeastCountNode.least` and
    // `MostCountNode.most` are a written count's `LeastCount.least` and `MostCount.most`, which
    // the import writes where it writes its count's row (overlay-queries/interaction.ts); and
    // `UsageValue.text` and `UsageValueBaseType.text` are a usage value's string value, which the
    // import writes from its node and bounds where it writes the node's fold (metadata.ts). A
    // float map key's typed value is the query `MapKeyFloat` over `MapKeyType`, and a resource's
    // document's path meets a typed href in a rule over the query `TypedHref`, so neither copies
    // a text. R26's `DescribedLang.value` and `DescribedAssembledLang.value`, cast into any text
    // (identity.ts), `RequiredSsmlProperty.name`, a catalog's and an assembled catalog's `id`, a
    // reference's token and an SSML property's name are of any length, a key holding each by its
    // image, so no copy into them is listed. An item ref's item is an `EntryPath`, no
    // `matchedText`, so no copy into it is listed, and an item's identifier is its attribute's
    // `value` (`ObjectIdentifier`, queries.ts), no `matchedText`, so `NamedItemRef.identifier`'s
    // copy into it is no key text's.
    // Bound: every law the schema states that is no check.
    assert.deepStrictEqual(
      [
        ...new Set(
          statedCopies
            .filter(({ document }) => !document)
            .map(({ copy, source }) => `${source} → ${copy.split(" → ")[1] ?? ""}`),
        ),
      ].toSorted(),
      [
        "LeastCountNode.least → InteractionAttribute.value",
        "MostCountNode.most → InteractionAttribute.value",
        "UsageValue.text → Node.stringValue",
        "UsageValueBaseType.text → Node.stringValue",
      ],
    );
  });
});

/**
 * The places of a generated package a key text, or a text no key holds, is written at.
 *
 * - `p id`: a paragraph's `id`, an ID, whose value `IdValue` reads where it stands and no key text
 *   holds;
 * - `idref`: a span's `id` and the paragraph's `aria-describedby` that names it, an IDREFS whose
 *   tokens' text is `Attribute.idrefText`;
 * - `item identifier`, `item title`: the item's root's attributes' `value`, `ObjectIdentifier`'s and
 *   `objectTitles`';
 * - `xml:lang`: a paragraph's, whose value `LangValue` reads where it stands and no key text holds;
 * - `response identifier`: the response's declaration and its interaction's `response-identifier`;
 * - `choice identifier`: a choice's and the correct response's value, a copied string value;
 * - `map key`: a map entry's `map-key`, `MapKey.key`;
 * - `string value`: a string outcome's default value, a copied string value;
 * - `resource identifier`, `manifest identifier`: the manifest's `xs:ID`s, whose values
 *   `resourceIdentifiers` and `manifestIdentifiers` read where they stand
 *   (`#pantry/qti/overlay-queries/package.ts`);
 * - `free attribute`, `free text`: a `data-*` attribute and a paragraph's text, which no key holds.
 */
const sites = [
  "p id",
  "idref",
  "item identifier",
  "item title",
  "xml:lang",
  "response identifier",
  "choice identifier",
  "map key",
  "string value",
  "resource identifier",
  "manifest identifier",
  "free attribute",
  "free text",
] as const;

/**
 * A place a generated package writes a text at.
 */
type Site = (typeof sites)[number];

/**
 * The ASCII letter each place's drawn text starts with, distinct, so no two places draw one text
 * and no drawn identifier collides with another or with a short default.
 */
const siteLetters: Readonly<Record<Site, string>> = {
  "choice identifier": "c",
  "free attribute": "f",
  "free text": "t",
  idref: "h",
  "item identifier": "i",
  "item title": "k",
  "manifest identifier": "m",
  "map key": "q",
  "p id": "p",
  "resource identifier": "r",
  "response identifier": "s",
  "string value": "v",
  "xml:lang": "x",
};

/**
 * The places whose text no key holds, which no length refuses.
 */
const freeSites: ReadonlySet<Site> = new Set(["free attribute", "free text"]);

/**
 * The scripts a text is written in, by the UTF-8 bytes of their one character: `a`, `é`, `中` and
 * U+10000. The first three are name characters of XML 1.0 Second Edition, so every place an NCName
 * goes takes them; U+10000 is none (reading 94), so a text in it past its leading letter names
 * nothing at any length, and its import writes no row of the name (reading 152), as its twin's
 * does ({@link twinOf}).
 */
const scripts = ["1-byte", "2-byte", "3-byte", "4-byte"] as const;

/**
 * A script a text is written in.
 */
type Script = (typeof scripts)[number];

/**
 * The one character of each script.
 */
const glyphs: Readonly<Record<Script, string>> = {
  "1-byte": "a",
  "2-byte": "é",
  "3-byte": "中",
  "4-byte": "\u{10000}",
};

/**
 * One generated text: its script and how many of its character it repeats.
 */
interface Drawn {
  readonly count: number;
  readonly script: Script;
}

/**
 * A generated package: the texts drawn at some of its places, each other place keeping its short
 * default.
 */
type Sketch = Readonly<Partial<Record<Site, Drawn>>>;

/**
 * `matchedText`'s pattern, read as grizzle installs it: its one `str.regex` pattern.
 */
const keyTextPattern = new RegExp(anyText.patterns[0].source, anyText.patterns[0].flags);

/**
 * Decide whether the schema's type admits a text as a key text, as grizzle's `str.bytes` domain
 * checks it: at most `matchedTextBytes` UTF-8 bytes, then `matchedText`'s pattern.
 *
 * @param text - The text.
 * @returns Whether `matchedText` admits it.
 */
const admitsKeyText = (text: string): boolean =>
  utf8Length(text) <= matchedTextBytes && keyTextPattern.test(text);

/**
 * `EntryPath`'s pattern, read as grizzle installs it: its one `str.regex` pattern.
 */
const entryPathPattern = new RegExp(EntryPath.patterns[0].source, EntryPath.patterns[0].flags);

/**
 * Decide whether the schema's type admits a text as an entry path, as grizzle's `str.bytes` domain
 * checks it: `EntryPath`'s pattern, of any length.
 *
 * @param text - The text.
 * @returns Whether `EntryPath` admits it.
 */
const admitsEntryPath = (text: string): boolean => entryPathPattern.test(text);

/**
 * Write a drawn text: its place's letter, then its script's character, `count` characters in all.
 *
 * @param letter - The place's letter.
 * @param drawnText - The text drawn: its script and its count, at least 1.
 * @returns The text.
 */
const textOf = (letter: string, { count, script }: Drawn): string =>
  `${letter}${glyphs[script].repeat(Math.max(0, count - 1))}`;

/**
 * The most UTF-8 bytes one B-tree entry holds of a text as itself, beside no other field (grizzle's
 * `keyTextBytes`): a key over a longer text holds it by its image.
 */
const entryBytes = keyTextBytes([]);

/**
 * The UTF-8 bytes the cases write a text at, each past a bound a key once held a text to: 433, the
 * longest single value a production item holds (SV-LIMIT-01), past the 428 bytes LIMITS5 held it
 * to; one past {@link entryBytes}, so a key holds it by its image; and 64 KiB. None is near
 * `matchedTextBytes`, the bound a key text still meets.
 */
const longBytes = [433, entryBytes + 1, 65_536] as const;

/**
 * The fewest characters of a script a drawn text holds to reach a number of UTF-8 bytes, its
 * leading ASCII letter counted.
 *
 * @param script - The script.
 * @param bytes - The bytes, at least 1.
 * @returns The count.
 */
const countOf = (script: Script, bytes: number): number =>
  1 + Math.ceil((bytes - 1) / utf8Length(glyphs[script]));

/**
 * Write a language tag of exactly `count` ASCII characters, `xs:language`'s form: `a`, then `aa`
 * where the count is even, then `-a` subtags.
 *
 * @param count - The tag's length, at least 1.
 * @returns The tag.
 */
const languageOf = (count: number): string =>
  count % 2 === 0 ? `aa${"-a".repeat((count - 2) / 2)}` : `a${"-a".repeat((count - 1) / 2)}`;

/**
 * The text a package writes at a place: its drawn text, else its short default.
 *
 * @param sketch - The package.
 * @param site - The place.
 * @param short - The place's default.
 * @returns The text.
 */
const textAt = (sketch: Sketch, site: Site, short: string): string => {
  const held = sketch[site];
  if (held === undefined) {
    return short;
  }

  return site === "xml:lang" ? languageOf(held.count) : textOf(siteLetters[site], held);
};

/**
 * Write a generated package: one choice item with a mapped identifier response and a string
 * outcome, and its manifest.
 *
 * @param sketch - The package.
 * @returns Its entries, each encoded as UTF-8.
 */
const packageOf = (sketch: Sketch): ReadonlyMap<string, Uint8Array> => {
  const at = (site: Site, short: string): string => textAt(sketch, site, short);
  const item = `<qti-assessment-item xmlns="http://www.imsglobal.org/xsd/imsqtiasi_v3p0" identifier="${at("item identifier", "item")}" title="${at("item title", "Item")}" time-dependent="false">
  <qti-response-declaration identifier="${at("response identifier", "RESPONSE")}" cardinality="single" base-type="identifier">
    <qti-correct-response><qti-value>${at("choice identifier", "A")}</qti-value></qti-correct-response>
    <qti-mapping default-value="0"><qti-map-entry map-key="${at("map key", "A")}" mapped-value="1"/></qti-mapping>
  </qti-response-declaration>
  <qti-outcome-declaration identifier="NOTE" cardinality="single" base-type="string"><qti-default-value><qti-value>${at("string value", "none")}</qti-value></qti-default-value></qti-outcome-declaration>
  <qti-item-body>
    <p id="${at("p id", "intro")}" xml:lang="${at("xml:lang", "en")}" data-note="${at("free attribute", "note")}">${at("free text", "Pick one.")}</p>
    <p aria-describedby="${at("idref", "hint")}"><span id="${at("idref", "hint")}">Hint</span></p>
    <qti-choice-interaction response-identifier="${at("response identifier", "RESPONSE")}" max-choices="1">
      <qti-simple-choice identifier="${at("choice identifier", "A")}">A</qti-simple-choice>
      <qti-simple-choice identifier="B">B</qti-simple-choice>
    </qti-choice-interaction>
  </qti-item-body>
</qti-assessment-item>`;
  const manifest = `<manifest xmlns="http://www.imsglobal.org/xsd/qti/qtiv3p0/imscp_v1p1" identifier="${at("manifest identifier", "M")}">
  <metadata><schema>QTI Package</schema><schemaversion>3.0.1</schemaversion></metadata>
  <organizations/>
  <resources><resource identifier="${at("resource identifier", "R")}" type="imsqti_item_xmlv3p0" href="item.xml"><file href="item.xml"/></resource></resources>
</manifest>`;

  return new Map([
    ["imsmanifest.xml", new TextEncoder().encode(manifest)],
    ["item.xml", new TextEncoder().encode(item)],
  ]);
};

/**
 * The fields of a row that hold a key text or an entry path its type does not admit.
 *
 * @param relation - The row's relation.
 * @param row - The row.
 * @returns The fields, as `Relation.field`.
 */
const pastBound = (relation: string, row: HeldRow): readonly string[] =>
  Object.entries(row).flatMap(([field, value]) =>
    Predicate.isString(value) &&
    ((isKeyText(relation, field) && !admitsKeyText(value)) ||
      (entryPathFields.has(`${relation}.${field}`) && !admitsEntryPath(value)))
      ? [`${relation}.${field}`]
      : [],
  );

/**
 * Collect the key texts and entry paths a package's rows hold that the schema's type does not
 * admit, by `Relation.field`: each `matchedText` and `EntryPath` field of each row the import's
 * write stores, each fold's end and each copy at the value the write draws, and each generated one
 * at the value grizzle's evaluator gives it (`#pantry/test/host-judge.ts` `withGenerated`). A row
 * whose written text is past the bound is one the database refuses by that field's domain, so its
 * generated texts are left unread.
 *
 * @param inputs - The import's rows.
 * @returns The fields that hold a text past the bound.
 */
const refusedFields = (inputs: PackageInputs): ReadonlySet<string> => {
  const refused = new Set<string>();
  const rows = previewRowsOf(inputs);
  for (const relation of Object.values(Qti.relations)) {
    if (relation.kind === "relation") {
      const held: readonly HeldRow[] = rows[relation.name];
      for (const row of held) {
        const written = pastBound(relation.name, row);
        for (const field of written.length > 0
          ? written
          : pastBound(relation.name, withGenerated(evaluatorFor(Qti), relation, row))) {
          refused.add(field);
        }
      }
    }
  }

  return refused;
};

/**
 * A situation a search must reach: a place drawn past what an index entry holds of a text as
 * itself ({@link entryBytes}), in a script, a text no key holds drawn past it, another law the
 * package breaks, and the verdict.
 */
type Situation =
  | `${Script} past an index entry`
  | `${Site} past an index entry`
  | "a free text past an index entry"
  | "accepted"
  | "another law broken too"
  | "refused";

/**
 * The relations an import writes fewer rows of for a package than for its twin ({@link twinOf}):
 * each a copy an overlay leaves out because its text is past `matchedText`, which the copy's
 * containment then refuses for the row it lacks. The twin differs from the package in its texts'
 * lengths alone, so a row an overlay leaves out of both, a name's that names nothing (reading
 * 152), is no copy the bound left out.
 *
 * @param long - The package's rows, counted by relation.
 * @param short - Its twin's.
 * @returns The relations, each as `Relation.*`.
 */
const leftOut = (
  long: ReadonlyMap<string, number>,
  short: ReadonlyMap<string, number>,
): ReadonlySet<string> =>
  new Set(
    [...short].flatMap(([relation, rows]) =>
      (long.get(relation) ?? 0) < rows ? [`${relation}.*`] : [],
    ),
  );

/**
 * The rules the database refuses a package's import under for its key texts, read from its rows:
 * `key-text-bound` where a written `matchedText` field holds a text past the bound, which the
 * type's own check refuses, and for a copy left out of a relation, the rule of each containment the
 * law table states into that relation, which then finds no row.
 *
 * @param refused - The fields the import's rows hold past the bound, and each relation it leaves a
 *   copy out of, as `Relation.*`.
 * @returns The rules.
 */
const databaseRules = (refused: ReadonlySet<string>): ReadonlySet<string> =>
  new Set(
    [...refused].flatMap((held) => {
      const [relation = "", field = ""] = held.split(".");
      if (field !== "*") {
        return ["key-text-bound"];
      }

      return statedLaws().flatMap(([law]) =>
        law.kind === "contained" && law.to.relation === relation
          ? Option.toArray(schemaRuleOfLaw(law))
          : [],
      );
    }),
  );

/**
 * The most characters a twin's text holds: its place's letter and one character of its script, so
 * the twin keeps what each drawn text names, and no twin's text is near the bound.
 */
const twinCount = 2;

/**
 * A package's twin: each drawn text at {@link twinCount} characters of its own script, or as it is
 * where it is shorter. An NCName's production states no length (reading 94), so a text and its
 * twin name the same, and only the bound tells their imports apart.
 *
 * @param sketch - The package.
 * @returns Its twin.
 */
const twinOf = (sketch: Sketch): Sketch => {
  const twin: Partial<Record<Site, Drawn>> = {};
  for (const site of sites) {
    const held = sketch[site];
    if (held !== undefined) {
      twin[site] = { count: Math.min(held.count, twinCount), script: held.script };
    }
  }

  return twin;
};

/**
 * Count the rows the import writes for a package's twin ({@link twinOf}), by relation: the rows
 * the package's own are compared with.
 *
 * @param sketch - The package.
 * @returns Its twin's rows, counted by relation.
 */
const twinRows = (sketch: Sketch) =>
  Effect.gen(function* twinRowsOf() {
    const dir = yield* scopedPackage(packageOf(twinOf(sketch)));

    return rowCountsOf(yield* readProgram(dir, nameOf(dir)));
  }).pipe(Effect.scoped);

/**
 * Judge one package's entries both ways: the oracle's "Key text bound" breaches against the
 * database's refusal of the same texts as the import's rows give it, a `matchedText` field written
 * past what the schema's type admits, or a copy left out of a relation its containment reads; and
 * the rule each would refuse it under ({@link databaseRules}) against the rules the oracle names.
 *
 * @param entries - The package's entries.
 * @param literal - The package as a failure names it.
 * @param twin - The rows the import writes for the package's twin, by relation ({@link twinRows}),
 *   or none for a package with no twin, whose import leaves no copy out by its texts' lengths.
 * @returns The oracle's breaches and the fields the import's rows hold past the bound, each copy
 *   left out as `Relation.*`; fails on a disagreement.
 */
const judgedEntries = (
  entries: ReadonlyMap<string, Uint8Array>,
  literal: string,
  twin: Option.Option<ReadonlyMap<string, number>>,
) =>
  Effect.gen(function* judgedEntriesCase() {
    const dir = yield* scopedPackage(entries);
    const judgment = yield* judge(yield* readEntries(dir), grammar, laws);
    const breaches =
      judgment._tag === "Judged"
        ? judgment.breaches
        : assert.fail(
            `${literal}: the oracle's codec refused it: ${judgment.rule}, ${judgment.detail}`,
          );
    const bound = breaches.filter(({ law }) => law === "Key text bound");
    const named = new Set(bound.map(({ keys }) => keys["field"] ?? ""));
    const program = yield* readProgram(dir, nameOf(dir));
    const refused = new Set([
      ...refusedFields(program.inputs),
      ...Option.match(twin, {
        onNone: () => [],
        onSome: (short) => leftOut(rowCountsOf(program), short),
      }),
    ]);
    assert.strictEqual(
      bound.length > 0,
      refused.size > 0,
      `${literal}: the oracle names ${[...named].join(", ") || "no key text"}, and the import's rows hold ${[...refused].join(", ") || "none"} past the bound`,
    );
    for (const field of named) {
      assert.isTrue(
        refused.has(field) || refused.has(`${field.split(".")[0] ?? ""}.*`),
        `${literal}: the oracle names ${field}, which the import's rows hold within the bound (${[...refused].join(", ")})`,
      );
    }

    const oracleRules = new Set<string>(breaches.map(({ law }) => ruleOf(law)));
    for (const rule of databaseRules(refused)) {
      assert.isTrue(
        oracleRules.has(rule),
        `${literal}: the database refuses it under ${rule}, and the oracle under ${[...oracleRules].join(", ") || "none"}`,
      );
    }

    return { breaches, refused };
  }).pipe(Effect.scoped);

/**
 * Judge one generated package both ways ({@link judgedEntries}), against its twin's rows.
 *
 * @param sketch - The package.
 * @param note - Notes the situations it reaches.
 * @returns Nothing; fails on a disagreement.
 */
const judged = (sketch: Sketch, note: (situation: Situation) => void) =>
  Effect.gen(function* judgedCase() {
    for (const site of sites) {
      const held = sketch[site];
      if (held !== undefined && utf8Length(textAt(sketch, site, "")) > entryBytes) {
        note(`${site} past an index entry`);
        note(`${held.script} past an index entry`);
        if (freeSites.has(site)) {
          note("a free text past an index entry");
        }
      }
    }

    const { breaches, refused } = yield* judgedEntries(
      packageOf(sketch),
      Formatter.format(sketch),
      Option.some(yield* twinRows(sketch)),
    );

    note(refused.size > 0 ? "refused" : "accepted");
    if (breaches.some(({ law }) => law !== "Key text bound")) {
      note("another law broken too");
    }
  });

/**
 * `n` ASCII bytes forming a valid NCName: a path segment of exactly that many bytes.
 *
 * @param n - The bytes.
 * @returns The segment.
 */
const segmentOf = (n: number): string => `K${"x".repeat(n - 1)}`;

/**
 * The XML declaration every reference case's document opens with.
 */
const declared = '<?xml version="1.0" encoding="UTF-8"?>';

/**
 * A manifest's namespace, its identifier, the key its package is stored under, and its metadata, as
 * each reference case writes them.
 */
const manifestOpen = `${declared}<manifest xmlns="http://www.imsglobal.org/xsd/qti/qtiv3p0/imscp_v1p1" identifier="M"><metadata><schemaversion>3.0.1</schemaversion></metadata>`;

/**
 * A package whose item includes a file through an href of `n` bytes, which resolves through the
 * item's folder, `rtest01/`, to `n + 8` bytes (genetic repair round 2, D5).
 *
 * @param n - The href's bytes.
 * @returns Its entries.
 */
const includeOf = (n: number): ReadonlyMap<string, Uint8Array> =>
  new Map([
    [
      "imsmanifest.xml",
      new TextEncoder().encode(
        `${manifestOpen}<resources><resource type="imsqti_item_xmlv3p0" href="rtest01/item.xml"/></resources></manifest>`,
      ),
    ],
    [
      "rtest01/item.xml",
      new TextEncoder().encode(
        `${declared}<qti-assessment-item xmlns="http://www.imsglobal.org/xsd/imsqtiasi_v3p0" xmlns:xi="http://www.w3.org/2001/XInclude"><qti-item-body><xi:include href="${segmentOf(n)}"/></qti-item-body></qti-assessment-item>`,
      ),
    ],
  ]);

/**
 * A package whose manifest's resource and file hrefs of `n` bytes each resolve through the
 * resources' `xml:base`, `d/`, to `n + 2` bytes.
 *
 * @param n - Each href's bytes.
 * @returns Its entries.
 */
const basedOf = (n: number): ReadonlyMap<string, Uint8Array> =>
  new Map([
    [
      "imsmanifest.xml",
      new TextEncoder().encode(
        `${manifestOpen}<resources xml:base="d/"><resource identifier="r1" type="webcontent" href="${segmentOf(n)}"><file href="${segmentOf(n)}"/></resource></resources></manifest>`,
      ),
    ],
  ]);

/**
 * The reference cases: an include whose href resolves through its document's folder to an
 * in-package path of each of {@link longBytes} and 8 bytes more, the `ReferencePath.target` the
 * import writes it into an `EntryPath` of any length; and a resource's and a file's href resolved
 * through an `xml:base` to each length and 2 bytes more, whose `target` is a key text a key holds
 * at any length.
 */
const referenceCases = longBytes.flatMap((n) => [
  { entries: includeOf(n), literal: `an include resolved to ${n + 8} bytes` },
  { entries: basedOf(n), literal: `a based resource of ${n + 2} bytes` },
]);

/**
 * A package whose one item writes `body` in its body and `after` after it, each place a held value
 * case writes at: the item's namespaces, ASI's, MathML's, XInclude's and XML Schema's, its
 * instance's among them.
 *
 * @param body - The item body's content.
 * @param after - What follows the item body, a catalog for one case.
 * @returns Its entries.
 */
const heldItemOf = (body: string, after = ""): ReadonlyMap<string, Uint8Array> =>
  new Map([
    [
      "imsmanifest.xml",
      new TextEncoder().encode(
        `${manifestOpen}<resources><resource identifier="r1" type="imsqti_item_xmlv3p0" href="item.xml"><file href="item.xml"/></resource></resources></manifest>`,
      ),
    ],
    [
      "item.xml",
      new TextEncoder().encode(
        `${declared}<qti-assessment-item xmlns="http://www.imsglobal.org/xsd/imsqtiasi_v3p0" xmlns:m="http://www.w3.org/1998/Math/MathML" xmlns:xi="http://www.w3.org/2001/XInclude" xmlns:xs="http://www.w3.org/2001/XMLSchema" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" identifier="item" title="Item" time-dependent="false"><qti-item-body>${body}</qti-item-body>${after}</qti-assessment-item>`,
      ),
    ],
  ]);

/**
 * The values the import writes into a key text that a rule over a query holds, and no statement
 * over `Attribute` copies: a `th`'s `id` (`TableHeader.id`), a catalog's `id` (`CatalogId.id`), a
 * share's fragment (`ShareFragment.id`) and an ID of a document in an assembly, here an item that
 * holds an include (`PlacedId.id`); and an element's text typed `xs:ID`, whose `IdValue` casts its
 * collapsed string value into a key text, which its string value already is (`Node.stringValue`).
 * Each is an NCName of `n` ASCII bytes.
 */
const heldPlaces = [
  {
    entriesOf: (n: number) =>
      heldItemOf(`<table><tbody><tr><th id="${segmentOf(n)}">H</th></tr></tbody></table>`),
    place: "a th's id",
  },
  {
    entriesOf: (n: number) =>
      heldItemOf(
        "<p>Hi</p>",
        `<qti-catalog-info><qti-catalog id="${segmentOf(n)}"><qti-card support="spoken"><qti-html-content>Hi</qti-html-content></qti-card></qti-catalog></qti-catalog-info>`,
      ),
    place: "a catalog's id",
  },
  {
    entriesOf: (n: number) =>
      heldItemOf(
        `<m:math><m:mi id="${segmentOf(n)}">x</m:mi><m:share src="#${segmentOf(n)}"/></m:math>`,
      ),
    place: "a share's fragment",
  },
  {
    entriesOf: (n: number) =>
      heldItemOf(`<p id="${segmentOf(n)}">Hi</p><xi:include href="fragment.xml"/>`),
    place: "an assembled document's ID",
  },
  {
    entriesOf: (n: number) =>
      heldItemOf(
        `<qti-custom-interaction response-identifier="RESPONSE"><x:e xmlns:x="urn:x" xsi:type="xs:ID">${segmentOf(n)}</x:e></qti-custom-interaction>`,
      ),
    place: "an ID text",
  },
] as const;

/**
 * The held value cases: each place at each of {@link longBytes}.
 */
const heldCases = heldPlaces.flatMap(({ entriesOf, place }) =>
  longBytes.map((n) => ({ entries: entriesOf(n), literal: `${place} of ${n} bytes` })),
);

/**
 * A reference's token at each of {@link longBytes}: an item whose `data-catalog-idref` holds one
 * token, an NCName of `n` ASCII bytes, beside a catalog of another `id`, so the token names nothing
 * and every row that holds it is the import's own write of it.
 */
const catalogTokenCases = longBytes.map((n) => ({
  entries: heldItemOf(
    `<p data-catalog-idref="${segmentOf(n)}">Hi</p>`,
    `<qti-catalog-info><qti-catalog id="C"><qti-card support="spoken"><qti-html-content>Hi</qti-html-content></qti-card></qti-catalog></qti-catalog-info>`,
  ),
  literal: `a data-catalog-idref token of ${n} bytes`,
}));

/**
 * The box: the package with every place short; then each place alone, in each script, at each of
 * {@link longBytes} (a language tag in ASCII alone).
 */
const boxCases: Arr.NonEmptyReadonlyArray<Sketch> = [
  {},
  ...sites.flatMap((site) =>
    (site === "xml:lang" ? (["1-byte"] as const) : scripts).flatMap((script) =>
      longBytes.map((bytes): Sketch => ({ [site]: { count: countOf(script, bytes), script } })),
    ),
  ),
];

/**
 * Draw a package by its own swarm: the places it lengthens, each in a script the case's swarm
 * weighs, at one character or at one of {@link longBytes}.
 */
const swarmedSketch: Gen<{ readonly sketch: Sketch; readonly swarm: Swarm<Script | Site> }> = (
  source,
) => {
  const drawnSwarm = source.draw(swarm<Script | Site>([...sites, ...scripts]));
  const sketch: Partial<Record<Site, Drawn>> = {};
  for (const site of sites) {
    if (source.draw(keep(drawnSwarm, site))) {
      const script = site === "xml:lang" ? "1-byte" : source.draw(swarmChoice(drawnSwarm, scripts));
      sketch[site] = {
        count: source.draw(element([1, ...longBytes.map((bytes) => countOf(script, bytes))])),
        script,
      };
    }
  }

  return { sketch, swarm: drawnSwarm };
};

layer(NodeServices.layer, { excludeTestServices: true })(
  "the oracle's key-text verdict",
  (test) => {
    test.effect(
      "refuses each package of the box under Key text bound exactly where its import's rows hold a text its field's type does not admit, under the rule the database names",
      (ctx) =>
        // Oracle: a differential, the import's rows (readProgram, every overlay's copy and every
        // concat fold's end) under the schema's own matchedText type, against the oracle's breaches.
        // Bound: every place alone at each of the three long lengths in each of four scripts, and
        // the package with every place short.
        Effect.gen(function* box() {
          const exhausted = yield* searched(
            ctx,
            exhaust(
              {
                box: "each place alone at 433 bytes, past an index entry and at 64 KiB, in 1-, 2-, 3- and 4-byte scripts",
                caseHang: Duration.seconds(120),
                concurrency: 1,
                coverage: requiredInSpace<Situation>([
                  "1-byte past an index entry",
                  "2-byte past an index entry",
                  "3-byte past an index entry",
                  "4-byte past an index entry",
                  "a free text past an index entry",
                  "accepted",
                  "idref past an index entry",
                  "map key past an index entry",
                  "p id past an index entry",
                  "response identifier past an index entry",
                  "xml:lang past an index entry",
                ]),
                generator: element(boxCases),
                literal: Formatter.format,
                oracle: {
                  kind: "second-implementation",
                  name: "the import's rows under their fields' types",
                },
                suite: "pantry/test/oracle-keys-box",
              },
              (sketch, c) =>
                judged(sketch, (situation) => {
                  c.note(situation);
                }),
            ),
          );

          assert.strictEqual(exhausted.cases, boxCases.length);
        }),
      { timeout: testTimeoutMs },
    );

    test.effect(
      "refuses each swarmed package under Key text bound exactly where its import's rows hold a text its field's type does not admit, under the rule the database names",
      (ctx) =>
        // Oracle: as the box's. Bound: each case under its own swarm of the 13 places and 4 scripts,
        // each place at one character or at one of the three long lengths; 60 runs.
        searched(
          ctx,
          explore(
            {
              caseHang: Duration.seconds(120),
              concurrency: 1,
              coverage: required<Situation>(["accepted", "another law broken too"], {
                cases: 30,
                sense: notesOnly,
              }),
              draw: drawn(swarmedSketch),
              kept: [],
              literal: ({ sketch }) => Formatter.format(sketch),
              oracle: {
                kind: "second-implementation",
                name: "the import's rows under their fields' types",
              },
              runs: 60,
              shrink: completeShrink,
              steerEvery: 16,
              suite: "pantry/test/oracle-keys-swarm",
            },
            ({ sketch }, c) =>
              judged(sketch, (situation) => {
                c.note(situation);
              }),
          ),
        ),
      { timeout: testTimeoutMs },
    );

    test.effect(
      "admits a reference whose in-package path resolves to any length, an include's entry path and a resource's or a file's target alike",
      () =>
        // Oracle: as the box's, the import's rows under the schema's own types: an include's resolved
        // path is an `EntryPath` and a resource's and a file's target a key text, each of any
        // length, a key holding it by its image and no index ordering by it (LIMITS6). Bound: an
        // include and a based resource and file at each of the three long lengths.
        Effect.gen(function* eachReferenceCase() {
          for (const { entries, literal } of referenceCases) {
            const { breaches, refused } = yield* judgedEntries(entries, literal, Option.none());
            const bound = breaches.filter(({ law }) => law === "Key text bound");

            assert.deepStrictEqual([...refused].toSorted(), [], `${literal}: the import's rows`);
            assert.strictEqual(bound.length, 0, `${literal}: the oracle's Key text bound`);
          }
        }),
      { timeout: testTimeoutMs },
    );

    test.effect(
      "admits a th's id, a catalog's id, a share's fragment, an assembled document's ID and an ID text of any length, each held by its image, on the import's rows and in the oracle",
      () =>
        // Oracle: QTI bounds no ID (`xs:ID`) and no URI's fragment, and the import's rows under
        // the schema's own types, each of these a `matchedText` a key holds by its image (LIMITS6):
        // each value a rule over a query holds (`TableHeader.id`, `CatalogId.id` and `PlacedId.id`
        // to `IdValue`, `ShareFragment.id` to its `src`'s value), and an element's ID text, its
        // `Node.stringValue`. Bound: each place at each of the three long lengths.
        Effect.gen(function* eachHeldCase() {
          for (const { entries, literal } of heldCases) {
            const { breaches, refused } = yield* judgedEntries(entries, literal, Option.none());
            const bound = breaches.filter(({ law }) => law === "Key text bound");

            assert.deepStrictEqual([...refused].toSorted(), [], `${literal}: the import's rows`);
            assert.strictEqual(bound.length, 0, `${literal}: the oracle's Key text bound`);
          }
        }),
      { timeout: testTimeoutMs },
    );

    test.effect(
      "admits a data-catalog-idref token of any length: its Idref token, its pieces' end and its IDREF target are each held by its image",
      () =>
        // Oracle: QTI bounds no IDREF, and the import's rows under the schema's own types: a
        // reference's token is its `Idref` piece's (`Idref.token`, beside the pieces' running end,
        // `Idref.piecesAfter`, the pieces' fold end on its attribute, `Attribute.idrefText`, and its
        // document's `IdrefTarget.id`), each a `matchedText` a key holds by its image (LIMITS6).
        // Bound: one token at each of the three long lengths.
        Effect.gen(function* eachReferenceToken() {
          for (const { entries, literal } of catalogTokenCases) {
            const { breaches, refused } = yield* judgedEntries(entries, literal, Option.none());
            const bound = breaches.filter(({ law }) => law === "Key text bound");

            assert.deepStrictEqual([...refused].toSorted(), [], `${literal}: the import's rows`);
            assert.strictEqual(bound.length, 0, `${literal}: the oracle's Key text bound`);
          }
        }),
      { timeout: testTimeoutMs },
    );
  },
);

it("writes every long text the cases draw within the bound a key text meets, and past the one a B-tree entry holds", () => {
  // Oracle: the schema's own types, `matchedText`'s pattern and bound and grizzle's entry bound.
  // Bound: the four scripts at each of the three long lengths.
  for (const script of scripts) {
    for (const bytes of longBytes) {
      const text = textOf("a", { count: countOf(script, bytes), script });

      assert.isTrue(admitsKeyText(text), `${script} at ${bytes} bytes`);
      assert.isAtLeast(utf8Length(text), bytes, `${script} at ${bytes} bytes`);
    }

    assert.isAbove(
      utf8Length(textOf("a", { count: countOf(script, entryBytes + 1), script })),
      entryBytes,
    );
  }

  assert.isBelow(longBytes.at(-1) ?? 0, matchedTextBytes);
});
