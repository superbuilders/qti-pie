/**
 * The law oracle's key texts against the schema (Aiden's question on RV-slices S1: does the
 * oracle's list cover ID attributes, so the oracle and the database agree on a 700-byte id?).
 *
 * - **The list is the schema's.** `#pantry/test/key-copies.ts` reads its copies from the schema's
 *   statements. This file holds them, statement by statement and field by field, to the laws the
 *   law table states (`src/test/law-namer.ts` `statedLaws`), to every `keyText` field of the
 *   document relations, and to the copies whose source is no document row.
 * - **The verdict is the schema's.** Generated packages carry key texts of generated lengths in 1-,
 *   2-, 3- and 4-byte scripts around the bound the schema's type admits. The oracle refuses one
 *   under "Key text bound" exactly where the import's rows hold a text `keyText` does not admit,
 *   every field it names is one of those rows' fields, and every rule the database would refuse it
 *   under is one the oracle names: one cause, one rule, `key-text-bound` at both seats.
 */
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
import { grammar } from "#pantry/grammar/install.ts";
import { readProgram, rowCountsOf } from "#pantry/import/program.ts";
import type { PackageInputs } from "#pantry/import/write.ts";
import { readEntries } from "#pantry/package/read.ts";
import { EntryPath, identityBytes, keyText, keyTextBytes, utf8Length } from "#pantry/qti/limits.ts";
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
 * Whether a relation's field is of type `keyText`.
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
 * bounded at `identityBytes` (`#pantry/qti/limits.ts`), a stated limit named "Key text bound" as a
 * key text's is.
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
 * `keyText` type of its source with a `keyText` field of its target, and each `Monoid.concat`
 * fold over a relation's own rows into a `keyText` accumulator of it, as `law → Relation.field` for
 * the field it holds, with whether its source is a document relation.
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
    // containment pairing a document field of no keyText type with a keyText field, and each concat
    // fold into a keyText accumulator over a document relation's own rows.
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

  it("holds every keyText field of a document relation by a copy, or as a prefix of a held fold's end", () => {
    // Oracle: the schema's field types: every keyText field of Attribute and Node is the field of a
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
      // The one check that equates a document field with a key text on one row: an IDREF's
      // lexical form and its tokens' concatenation (attributes.ts). A member's characters are its
      // string value's step itself (node.ts), held by the fold's keyText accumulators.
      ["Attribute.lexical = Attribute.idrefText"],
    );
  });

  it("leaves out only the copies whose source is no document row, each bounded where it is written", () => {
    // Oracle: the law table's copies into a keyText field from a relation the oracle has no rows
    // of, each bounded by its own type where its row is written. A float map key's typed value is
    // the query `MapKeyFloat` over `MapKeyType`, and a resource's document's path meets a typed
    // href in a rule over the query `TypedHref`, so neither copies a text. Sources that are queries
    // hold a text that is no row's the import writes, each held where grizzle types it: R26's
    // `DescribedLang.value` and `DescribedAssembledLang.value` are `DocumentLang`'s and
    // `AssembledLang`'s generated `value`, which grizzle casts into `keyText` where it computes
    // it (`Compute.cast`, identity.ts); `RequiredSsmlProperty.name` is a constant of its query,
    // one of `ph`, `interpret-as` and `alias`, the values grizzle's heading types it by; and
    // `LeastCountNode.least` and `MostCountNode.most` are a written count's `LeastCount.least`
    // and `MostCount.most`, each a `keyText` the import writes and bounds where it writes its
    // count's row (overlay-queries/interaction.ts); `UnassembledReference.token` and
    // `PlacedReference.token` are a `data-catalog-idref`'s `Idref` piece's token, a `keyText` the
    // import writes and bounds where it writes the piece, which "Catalog reference" holds to a
    // `CatalogId`'s or an `AssembledCatalog`'s `id`, each a `keyText` the import writes and bounds
    // where it writes that row (overlay-queries/catalog.ts). An item ref's item is an `EntryPath`, no
    // `keyText`, so no copy into it is listed, and an item's identifier is its attribute's
    // `value` (`ObjectIdentifier`, queries.ts), no `keyText`, so `BankMember.identifier`'s copy
    // into it is no key text's.
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
        "PlacedReference.token → AssembledCatalog.id",
        "RequiredSsmlProperty.name → DataSsmlProperty.name",
        "UnassembledReference.token → CatalogId.id",
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
 * `keyText`'s pattern, read as grizzle installs it: its one `str.regex` pattern.
 */
const keyTextPattern = new RegExp(keyText.patterns[0].source, keyText.patterns[0].flags);

/**
 * Decide whether the schema's type admits a text as a key text, as grizzle's `str.bytes` domain
 * checks it: at most `keyTextBytes` UTF-8 bytes, then `keyText`'s pattern.
 *
 * @param text - The text.
 * @returns Whether `keyText` admits it.
 */
const admitsKeyText = (text: string): boolean =>
  utf8Length(text) <= keyTextBytes && keyTextPattern.test(text);

/**
 * `EntryPath`'s pattern, read as grizzle installs it: its one `str.regex` pattern.
 */
const entryPathPattern = new RegExp(EntryPath.patterns[0].source, EntryPath.patterns[0].flags);

/**
 * Decide whether the schema's type admits a text as an entry path, as grizzle's `str.bytes` domain
 * checks it: at most `identityBytes` UTF-8 bytes, then `EntryPath`'s pattern.
 *
 * @param text - The text.
 * @returns Whether `EntryPath` admits it.
 */
const admitsEntryPath = (text: string): boolean =>
  utf8Length(text) <= identityBytes && entryPathPattern.test(text);

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
 * The most characters of a script a key text holds, by the schema's type alone, a drawn text's
 * leading letter counted.
 *
 * @param script - The script.
 * @returns The greatest count of a drawn text in it `keyText` admits.
 */
const edgeOf = (script: Script): number => {
  let low = 1;
  let high = 16_384;
  while (low < high) {
    const middle = Math.ceil((low + high) / 2);
    if (admitsKeyText(textOf("a", { count: middle, script }))) {
      low = middle;
    } else {
      high = middle - 1;
    }
  }

  return low;
};

/**
 * Each script's edge, {@link edgeOf}.
 */
const edges: Readonly<Record<Script, number>> = {
  "1-byte": edgeOf("1-byte"),
  "2-byte": edgeOf("2-byte"),
  "3-byte": edgeOf("3-byte"),
  "4-byte": edgeOf("4-byte"),
};

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
 * admit, by `Relation.field`: each `keyText` and `EntryPath` field of each row the import's write
 * stores, each fold's end and each copy at the value the write draws, and each generated one at the
 * value grizzle's evaluator gives it (`#pantry/test/host-judge.ts` `withGenerated`). A row whose
 * written text is past the bound is one the database refuses by that field's domain, so its
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
 * A situation a search must reach: a place drawn past the bound, in a script, a text no key holds
 * drawn past it, another law the package breaks, and the verdict.
 */
type Situation =
  | `${Script} past the bound`
  | `${Site} past the bound`
  | "a free text past the bound"
  | "accepted"
  | "another law broken too"
  | "refused";

/**
 * The relations an import writes fewer rows of for a package than for its twin ({@link twinOf}):
 * each a copy an overlay leaves out because its text is past `keyText`, which the copy's
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
 * `key-text-bound` where a written `keyText` field holds a text past the bound, which the type's
 * own check refuses, and for a copy left out of a relation, the rule of each containment the law
 * table states into that relation, which then finds no row.
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
 * database's refusal of the same texts as the import's rows give it, a `keyText` field written past
 * what the schema's type admits, or a copy left out of a relation its containment reads; and the
 * rule each would refuse it under ({@link databaseRules}) against the rules the oracle names.
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
      if (held !== undefined && held.count > edges[held.script]) {
        note(`${site} past the bound`);
        note(`${held.script} past the bound`);
        if (freeSites.has(site)) {
          note("a free text past the bound");
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
 * The reference cases: each an href within its own bound that resolves to an in-package path one
 * byte past the bound of the `target` the import writes it into, and its control, which resolves
 * to the bound exactly. An include's `ReferencePath.target` is an `EntryPath`, bounded at
 * `identityBytes`; a resource's and a file's `target` is a `keyText`, bounded at `keyTextBytes`.
 */
const referenceCases = [
  { entries: includeOf(identityBytes - 7), literal: "an include past the bound", past: true },
  { entries: includeOf(identityBytes - 8), literal: "an include at the bound", past: false },
  { entries: basedOf(keyTextBytes - 1), literal: "a based resource past the bound", past: true },
  { entries: basedOf(keyTextBytes - 2), literal: "a based resource at the bound", past: false },
] as const;

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
 * over `Attribute` copies (`heldValuesOf` and `placedIdBreaches` of `#pantry/test/oracle.ts`): a
 * `th`'s `id` (`TableHeader.id`), a catalog's `id` (`CatalogId.id`), a share's fragment
 * (`ShareFragment.id`) and an ID of a document in an assembly, here an item that holds an include
 * (`PlacedId.id`); and an element's text typed `xs:ID`, whose `IdValue` casts its collapsed string
 * value into a key text, which its string value already is (`Node.stringValue`, refused there).
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
 * The held value cases: each place at the bound and one byte past it.
 */
const heldCases = heldPlaces.flatMap(({ entriesOf, place }) => [
  { entries: entriesOf(keyTextBytes + 1), literal: `${place} past the bound`, past: true },
  { entries: entriesOf(keyTextBytes), literal: `${place} at the bound`, past: false },
]);

/**
 * A reference's token past the bound and at it: an item whose `data-catalog-idref` holds one token,
 * an NCName of `n` ASCII bytes, beside a catalog of another `id`, so the token names nothing and
 * every row that holds it is the import's own write of it.
 */
const catalogTokenCases = [
  { n: keyTextBytes + 1, past: true },
  { n: keyTextBytes, past: false },
].map(({ n, past }) => ({
  entries: heldItemOf(
    `<p data-catalog-idref="${segmentOf(n)}">Hi</p>`,
    `<qti-catalog-info><qti-catalog id="C"><qti-card support="spoken"><qti-html-content>Hi</qti-html-content></qti-card></qti-catalog></qti-catalog-info>`,
  ),
  literal: `a data-catalog-idref token ${past ? "past" : "at"} the bound`,
  past,
}));

/**
 * The box: the package with every place short; then each place alone, in each script, at the
 * most characters the schema's type admits and one more (a language tag in ASCII alone).
 */
const boxCases: Arr.NonEmptyReadonlyArray<Sketch> = [
  {},
  ...sites.flatMap((site) =>
    (site === "xml:lang" ? (["1-byte"] as const) : scripts).flatMap((script) =>
      [edges[script], edges[script] + 1].map((count): Sketch => ({ [site]: { count, script } })),
    ),
  ),
];

/**
 * Draw a package by its own swarm: the places it lengthens, each in a script the case's swarm
 * weighs, at one of the counts that matter, 1, one short of the edge, the edge, one past it, or
 * twice it.
 */
const swarmedSketch: Gen<{ readonly sketch: Sketch; readonly swarm: Swarm<Script | Site> }> = (
  source,
) => {
  const drawnSwarm = source.draw(swarm<Script | Site>([...sites, ...scripts]));
  const sketch: Partial<Record<Site, Drawn>> = {};
  for (const site of sites) {
    if (source.draw(keep(drawnSwarm, site))) {
      const script = site === "xml:lang" ? "1-byte" : source.draw(swarmChoice(drawnSwarm, scripts));
      const edge = edges[script];
      sketch[site] = {
        count: source.draw(element([1, edge - 1, edge, edge + 1, 2 * edge])),
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
      "refuses each package of the box under Key text bound exactly where its import's rows hold a text keyText does not admit, under the rule the database names",
      (ctx) =>
        // Oracle: a differential, the import's rows (readProgram, every overlay's copy and every
        // concat fold's end) under the schema's own keyText type, against the oracle's breaches.
        // Bound: every place alone at the edge and one past it in each of four scripts, and the
        // package with every place short.
        Effect.gen(function* box() {
          const exhausted = yield* searched(
            ctx,
            exhaust(
              {
                box: "each place alone at the edge and one past it, in 1-, 2-, 3- and 4-byte scripts",
                caseHang: Duration.seconds(120),
                concurrency: 1,
                coverage: requiredInSpace<Situation>([
                  "1-byte past the bound",
                  "2-byte past the bound",
                  "3-byte past the bound",
                  "4-byte past the bound",
                  "a free text past the bound",
                  "accepted",
                  "idref past the bound",
                  "p id past the bound",
                  "refused",
                  "xml:lang past the bound",
                ]),
                generator: element(boxCases),
                literal: Formatter.format,
                oracle: { kind: "second-implementation", name: "the import's rows under keyText" },
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
      "refuses each swarmed package under Key text bound exactly where its import's rows hold a text keyText does not admit, under the rule the database names",
      (ctx) =>
        // Oracle: as the box's. Bound: each case under its own swarm of the 13 places and 4 scripts,
        // each place at 1, one short of the edge, the edge, one past it or twice it; 60 runs.
        searched(
          ctx,
          explore(
            {
              caseHang: Duration.seconds(120),
              concurrency: 1,
              coverage: required<Situation>(["accepted", "refused"], {
                cases: 30,
                sense: notesOnly,
              }),
              draw: drawn(swarmedSketch),
              kept: [],
              literal: ({ sketch }) => Formatter.format(sketch),
              oracle: {
                kind: "second-implementation",
                name: "the import's rows under keyText",
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
      "refuses a reference whose in-package path resolves past the bound under Key text bound, exactly where its import's rows hold the path",
      () =>
        // Oracle: as the box's, the import's rows under the schema's own keyText type. Bound: an
        // include resolved through its document's folder and a resource and file resolved through
        // an xml:base, each one byte past the bound and at it.
        Effect.gen(function* eachReferenceCase() {
          for (const { entries, literal, past } of referenceCases) {
            const { breaches, refused } = yield* judgedEntries(entries, literal, Option.none());
            const bound = breaches.filter(({ law }) => law === "Key text bound");

            assert.strictEqual(refused.size > 0, past, `${literal}: the import's rows`);
            assert.strictEqual(bound.length > 0, past, `${literal}: the oracle's Key text bound`);
          }
        }),
      { timeout: testTimeoutMs },
    );

    test.effect(
      "refuses a th's id, a catalog's id, a share's fragment, an assembled document's ID and an ID text past the bound under Key text bound, exactly where its import's rows hold it",
      () =>
        // Oracle: as the box's, the import's rows under the schema's own keyText type: each value
        // a rule over a query holds (`TableHeader.id`, `CatalogId.id` and `PlacedId.id` to
        // `IdValue`, `ShareFragment.id` to its `src`'s value), which no copy of `Attribute` writes.
        // Bound: each place one byte past the bound and at it.
        Effect.gen(function* eachHeldCase() {
          for (const { entries, literal, past } of heldCases) {
            const { breaches, refused } = yield* judgedEntries(entries, literal, Option.none());
            const bound = breaches.filter(({ law }) => law === "Key text bound");

            assert.strictEqual(refused.size > 0, past, `${literal}: the import's rows`);
            assert.strictEqual(bound.length > 0, past, `${literal}: the oracle's Key text bound`);
          }
        }),
      { timeout: testTimeoutMs },
    );

    test.effect(
      "refuses a data-catalog-idref token past the bound under Key text bound, where the import's write holds its Idref token, its pieces' end and its IDREF target alone",
      () =>
        // Oracle: as the box's, the import's rows under the schema's own keyText type. A reference's
        // token is its `Idref` piece's (`Idref.token`, beside the pieces' running end the write draws,
        // `Idref.piecesAfter`, which leaves the generated piece unread, the pieces' fold end on its
        // attribute, `Attribute.idrefText`, and its document's `IdrefTarget.id`), each a key text the
        // import writes and bounds; "Catalog reference" reads it through rules over a query that copy
        // it into no row (overlay-queries/catalog.ts). Bound: one token one byte past the bound and
        // at it.
        Effect.gen(function* eachReferenceToken() {
          for (const { entries, literal, past } of catalogTokenCases) {
            const { breaches, refused } = yield* judgedEntries(entries, literal, Option.none());
            const bound = breaches.filter(({ law }) => law === "Key text bound");

            assert.deepStrictEqual(
              [...refused].toSorted(),
              past
                ? ["Attribute.idrefText", "Idref.piecesAfter", "Idref.token", "IdrefTarget.id"]
                : [],
              `${literal}: the import's rows`,
            );
            assert.strictEqual(bound.length > 0, past, `${literal}: the oracle's Key text bound`);
          }
        }),
      { timeout: testTimeoutMs },
    );
  },
);

it("draws every edge from the schema's type: the edge admitted and one past it refused", () => {
  // Oracle: the specification as a checker, `keyText`'s pattern itself.
  // Bound: the four scripts.
  for (const script of scripts) {
    assert.isTrue(admitsKeyText(textOf("a", { count: edges[script], script })), script);
    assert.isFalse(admitsKeyText(textOf("a", { count: edges[script] + 1, script })), script);
  }
});
