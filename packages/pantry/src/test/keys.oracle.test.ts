/**
 * The law oracle's key texts against the schema (Aiden's question on RV-slices S1: does the
 * oracle's list cover ID attributes, so the oracle and the database agree on a 700-byte id?).
 *
 * - **The list is the schema's.** `#pantry/test/key-copies.ts` reads its copies from the schema's
 *   statements. This file holds them, statement by statement and field by field, to the laws the
 *   law table states (`src/test/law-namer.ts` `statedLaws`), to every field of a key text type of
 *   the document relations, and to the copies whose source is no document row.
 * - **The verdict is the schema's.** Generated packages carry texts of generated lengths in 1-, 2-, 3.
 *   and 4-byte scripts. A text a key holds is of a key text type (`#pantry/qti/limits.ts`), each
 *   bounded by what one B-tree entry leaves it in the widest key it stands in, so each place is
 *   written at its narrowest field's bound and one character past it; a text no key holds, or one a
 *   key holds as `matchedText`, is written past the old interim bound, past what one B-tree entry
 *   holds of a text as itself, and at 64 KiB. The oracle refuses a package under "Key text bound"
 *   exactly where the import's rows hold a text its field's type does not admit, every field it
 *   names is one of those rows' fields, and every rule the database would refuse it under is one
 *   the oracle names: one cause, one rule, `key-text-bound` at both seats.
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
import { grammar } from "#pantry/grammar/install.ts";
import { readProgram, rowCountsOf } from "#pantry/import/program.ts";
import type { PackageInputs } from "#pantry/import/write.ts";
import { readEntries } from "#pantry/package/read.ts";
import { declarationKinds } from "#pantry/qti/declarations.ts";
import {
  entryPathBytes,
  identifierBytes,
  matchedTextBytes,
  utf8Length,
} from "#pantry/qti/limits.ts";
import { Qti } from "#pantry/qti/schema.ts";
import { scopedPackage } from "#pantry/test/gen/every-relation.ts";
import { evaluatorFor, previewRowsOf, withGenerated } from "#pantry/test/host-judge.ts";
import type { HeldRow } from "#pantry/test/host-judge.ts";
import {
  identityOf,
  keyCopies,
  keyTextBounds,
  keyTextFieldBounds,
  keyTextFields,
} from "#pantry/test/key-copies.ts";
import { judge, ruleOf } from "#pantry/test/oracle.ts";
import { statedLaws } from "#pantry/test/law-namer.ts";
import { ruleOfLaw } from "#pantry/import/refusal.ts";
import { laws } from "#pantry/test/installed-laws.ts";
import { nameOf } from "#pantry/test/package-name.ts";
import { manifestPath } from "#pantry/vocab/terms/package.ts";
import { searchTimeout } from "#pantry/test/settings.ts";

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
 * The bound of a relation's field: its key text type's, else no bound, `Infinity`.
 *
 * @param relation - The relation's name.
 * @param field - The field's name.
 * @returns Its bound in UTF-8 bytes.
 */
const boundAt = (relation: string, field: string): number =>
  keyTextFieldBounds.get(`${relation}.${field}`) ?? Number.POSITIVE_INFINITY;

/**
 * A stored relation of the schema as grizzle keeps it, for its fields' names.
 */
const FieldsRead = Schema.Struct({
  fields: Schema.Record(Schema.String, Schema.Unknown),
  kind: Schema.Literal("relation"),
  name: Schema.String,
});

/**
 * A pattern as grizzle keeps it on a text type: its source and its flags.
 */
const PatternRead = Schema.Struct({ flags: Schema.String, source: Schema.String });

/**
 * A text type as grizzle keeps it, for its patterns.
 */
const TextTypeRead = Schema.Struct({ patterns: Schema.Array(PatternRead) });

/**
 * Every stored field of the composed schema of a key text type ({@link keyTextBounds}), as
 * `Relation.field`, with the patterns its type holds a text to, each read as grizzle installs it:
 * a written field's own type's, an accumulator's at its `field`, a generated field's at its `type`.
 */
const keyTextPatterns: ReadonlyMap<string, readonly RegExp[]> = new Map(
  Object.values(Qti.relations).flatMap((member) =>
    Option.match(Schema.decodeUnknownOption(FieldsRead)(member), {
      onNone: () => [],
      onSome: ({ fields, name }) =>
        Object.entries(fields).flatMap(([field, type]) =>
          [
            type,
            ...(Predicate.hasProperty(type, "field") ? [type.field] : []),
            ...(Predicate.hasProperty(type, "type") ? [type.type] : []),
          ]
            .filter((held) => keyTextBounds.has(held))
            .slice(0, 1)
            .flatMap((held) =>
              Option.toArray(Schema.decodeUnknownOption(TextTypeRead)(held)).map(
                ({ patterns }) =>
                  [
                    `${name}.${field}`,
                    patterns.map(({ flags, source }) => new RegExp(source, flags)),
                  ] as const,
              ),
            ),
        ),
    }),
  ),
);

/**
 * The copies the law table states: each containment of `statedLaws` that pairs a field of its
 * source with a field of its target of a narrower bound, and each `Monoid.concat` fold over a
 * relation's own rows into an accumulator of a key text type of it, as `law → Relation.field` for
 * the field it holds, with whether its source is a document relation.
 */
const statedCopies = statedLaws().flatMap(([law]) => {
  if (law.kind === "contained") {
    return law.from.terms.flatMap((term, at) => {
      const held = law.to.terms[at]?.field ?? "";

      return boundAt(law.to.relation, held) < boundAt(law.from.relation, term.field)
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
    Number.isFinite(boundAt(law.end.relation, held)) &&
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

  it("holds every key text field of a document relation by a copy, as a prefix of a held fold's end, or where the oracle reads it", () => {
    // Oracle: the schema's field types: every field of a key text type of Attribute and Node is the
    // field of a copy, a running accumulator of a concat fold whose end a copy holds, or a text the
    // host writes that the oracle reads where it stands: a document's path, which every entry's is
    // (`Entry.path`, the package's), its nearest interaction's document's and that one's copy on
    // the owner axis, each an entry's path (`#pantry/test/oracle.ts` `keyTexts`); or a running
    // text or the end of the string value's
    // fold, which its axes carry by their digests (node.ts), so no key holds it.
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
      documentFields.filter((field) => !held.has(field) && !prefixes.has(field)).toSorted(),
      [
        "Attribute.path",
        "Node.charsAfter",
        "Node.charsWas",
        "Node.nearestPath",
        "Node.parentNearestPath",
        "Node.path",
        "Node.stringValue",
      ],
    );
    assert.deepStrictEqual(
      keyCopies
        .filter(({ by }) => by === "check")
        .map(({ field, reads, source }) => `${source}.${reads} = ${field}`)
        .toSorted(),
      // No check equates a document field with a bounded text on one row: an IDREF's tokens'
      // concatenation, `Attribute.idrefText`, is of any length, held in no key of its own
      // (attributes.ts), each token held as `Idref.token`. A member's characters are its string
      // value's step itself (node.ts), held by the fold's accumulators, whose digests its axes
      // carry.
      [],
    );
  });

  it("lists every copy whose source is no document row: each bounded where it is written, or read by the oracle where its text stands", () => {
    // Oracle: the law table's copies into a field of a narrower bound from a relation the oracle
    // has no rows of. Bounded where its row is written: `LeastCountNode.least` and
    // `MostCountNode.most` are a written count's `LeastCount.least` and `MostCount.most`, which
    // the import writes where it writes its count's row (overlay-queries/interaction.ts). An
    // `m:cn`'s `typeLexical` and `baseLexical` are held to its attributes' lexical forms by their
    // SHA-256s (mathml-cn.ts), and a reference's token to its catalog's id by theirs
    // (overlay-queries/catalog.ts), no copy of a text into a narrower field. A derived
    // relation's column is a codec to grizzle, its bound unread, so a copy from one is listed
    // where its column is a stored field of the target's own type read unchanged: a placed
    // reference site's identifier, its `VariableRef.identifier`. A required SSML property's name
    // is held to a written one by their SHA-256s (queries.ts), no copy of a text into a narrower
    // field, and so is a cell's header token to its table's header's `id` ("Table headers"). A
    // copy into an entry path holds an entry's path, which
    // `Entry.path` bounds where the import writes its entry, so none is listed: a file's target in
    // the package is an entry path already (`FilePath.target`), so "File exists" narrows no bound.
    // Read by the oracle where its
    // text stands (`#pantry/test/oracle.ts` `keyTexts`): an interaction's binding, a choice's and a
    // hottext's identifier, each its attribute's collapsed value, which `InteractionAttribute`
    // copies. The rest of `InteractionAttribute.value`'s copies into an identifier, a content
    // reference's and a fragment's names, are the oracle's to read where they stand.
    // Bound: every law the schema states that is no check.
    assert.deepStrictEqual(
      [
        ...new Set(
          statedCopies
            .filter(({ document }) => !document)
            .map(({ copy, source }) => ({ held: copy.split(" → ")[1] ?? "", source }))
            .filter(({ held }) => keyTextFieldBounds.get(held) !== entryPathBytes)
            .map(({ held, source }) => `${source} → ${held}`),
        ),
      ].toSorted(),
      [
        "InteractionAttribute.value → BindingName.identifier",
        "InteractionAttribute.value → BoundVariable.identifier",
        "InteractionAttribute.value → Choice.identifier",
        "InteractionAttribute.value → ContextRef.identifier",
        "InteractionAttribute.value → FeedbackRef.identifier",
        "InteractionAttribute.value → FragmentContextName.identifier",
        "InteractionAttribute.value → FragmentFeedbackName.identifier",
        "InteractionAttribute.value → FragmentPrintedName.identifier",
        "InteractionAttribute.value → FragmentTemplateName.identifier",
        "InteractionAttribute.value → Hottext.identifier",
        "InteractionAttribute.value → PrintedVariableRef.identifier",
        "InteractionAttribute.value → TemplateRef.identifier",
        "LeastCountNode.least → InteractionAttribute.value",
        "MostCountNode.most → InteractionAttribute.value",
        "PlacedReferenceSite.identifier → PlacedVariableRef.identifier",
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
 *   token is `Idref.token`, an `xs:ID` a key holds, and whose tokens' text is
 *   `Attribute.idrefText`;
 * - `item identifier`, `item title`: the item's root's attributes' `value`, `ObjectIdentifier`'s and
 *   `objectTitles`';
 * - `xml:lang`: a paragraph's, whose value `LangValue` reads where it stands and no key text holds;
 * - `response identifier`: the response's declaration and its interaction's `response-identifier`,
 *   each a QTI identifier a key holds (`DeclaredIdentifierText`, `BindingName.identifier`);
 * - `choice identifier`: a choice's, a QTI identifier a key holds (`Choice.identifier`), and the
 *   correct response's value, a copied string value;
 * - `map key`: a map entry's `map-key`, whose value `MapKey` reads where it stands and no key text
 *   holds;
 * - `string value`: a string outcome's default value, a copied string value;
 * - `resource identifier`, `manifest identifier`: the manifest's `xs:ID`s, whose values
 *   `resourceIdentifiers` and `manifestIdentifiers` read as written, of any length;
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
 * Decide whether a field's key text type admits a text, as grizzle's `str.bytes` domain checks it:
 * at most the type's bound in UTF-8 bytes, then each of its patterns.
 *
 * @param field - The field, `Relation.field`, of a key text type.
 * @param text - The text.
 * @returns Whether its type admits it.
 */
const admitsAt = (field: string, text: string): boolean =>
  utf8Length(text) <= (keyTextFieldBounds.get(field) ?? Number.POSITIVE_INFINITY) &&
  (keyTextPatterns.get(field) ?? []).every((pattern) => pattern.test(text));

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
 * `keyTextBytes`): no key can hold a longer text as itself, so a text past it is one no key text
 * type of `#pantry/qti/limits.ts` admits, only `matchedText` and a text no key holds.
 */
const entryBytes = keyTextBytes([]);

/**
 * The UTF-8 bytes the cases write a text a key text type does not bound at, each past a bound a key
 * once held a text to: 433, the longest single value a production item holds (SV-LIMIT-01), past
 * the 428 bytes LIMITS5 held it to; one past {@link entryBytes}, past what any key holds of a text
 * as itself; and 64 KiB. None is near `matchedTextBytes`, the bound a matched text meets.
 */
const longBytes = [433, entryBytes + 1, 65_536] as const;

/**
 * The bound of the narrowest key text each place's text is held to, where one is: a response
 * declaration's and its interaction's binding's identifier
 * (`DeclaredIdentifierText`, `BindingName.identifier`) and a choice's (`Choice.identifier`), each a
 * QTI identifier's. A place with no bound here writes its text into no key, or into `matchedText`
 * alone: an IDREF token and the manifest's and a resource's `identifier`, each an `xs:ID`, which
 * a key holds by its SHA-256.
 */
const siteBounds: Readonly<Partial<Record<Site, number>>> = {
  "choice identifier": identifierBytes,
  "response identifier": identifierBytes,
};

/**
 * The most characters of a script a drawn text holds within a number of UTF-8 bytes, its leading
 * ASCII letter counted.
 *
 * @param script - The script.
 * @param bytes - The bytes, at least 1.
 * @returns The count.
 */
const withinOf = (script: Script, bytes: number): number =>
  1 + Math.floor((bytes - 1) / utf8Length(glyphs[script]));

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
 * The counts of a script a place's text is drawn at: for a place {@link siteBounds} bounds, the most
 * within its bound and one more, past it; for any other, each of {@link longBytes}.
 *
 * @param site - The place.
 * @param script - The script.
 * @returns The counts.
 */
const countsAt = (site: Site, script: Script): readonly number[] =>
  Option.match(Option.fromUndefinedOr(siteBounds[site]), {
    onNone: () => longBytes.map((bytes) => countOf(script, bytes)),
    onSome: (bound) => [withinOf(script, bound), withinOf(script, bound) + 1],
  });

/**
 * The most UTF-8 bytes a place's text is written at before it is past its limit: its bound
 * ({@link siteBounds}), else what one B-tree entry holds of a text as itself.
 *
 * @param site - The place.
 * @returns The bytes.
 */
const limitAt = (site: Site): number => siteBounds[site] ?? entryBytes;

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
 * The fields of a row of a key text type that hold a text their type does not admit.
 *
 * @param relation - The row's relation.
 * @param row - The row.
 * @returns The fields, as `Relation.field`.
 */
const pastBound = (relation: string, row: HeldRow): readonly string[] =>
  Object.entries(row).flatMap(([field, value]) =>
    Predicate.isString(value) &&
    keyTextFields.has(`${relation}.${field}`) &&
    !admitsAt(`${relation}.${field}`, value)
      ? [`${relation}.${field}`]
      : [],
  );

/**
 * The attribute values a check holds within a key text's bound where a view keys them, by the
 * derived relation the check is over: each declaration's `identifier` (`DeclaredIdentifierText`,
 * names.ts) and each test's (`TestIdentifierText`, overlay-queries/tests.ts), each a QTI
 * identifier. Each reads its attribute's `value` as the database generates it.
 */
const checkedValues: readonly {
  readonly bound: number;
  readonly field: string;
  readonly kinds: readonly string[];
  readonly manifest: boolean;
  readonly name: string;
}[] = [
  {
    bound: identifierBytes,
    field: "DeclaredIdentifierText.text",
    kinds: declarationKinds,
    manifest: false,
    name: "identifier",
  },
  {
    bound: identifierBytes,
    field: "TestIdentifierText.text",
    kinds: ["qti-assessment-test"],
    manifest: false,
    name: "identifier",
  },
];

/**
 * The derived relations whose "Key text bound" check an `Attribute` row's value breaks
 * ({@link checkedValues}).
 *
 * @param row - The row, its generated fields filled.
 * @returns Each check's field, as `Relation.text`.
 */
const checkedPastBound = (row: HeldRow): readonly string[] =>
  checkedValues.flatMap(({ bound, field, kinds, manifest, name }) =>
    Predicate.isString(row["value"]) &&
    row["name"] === name &&
    kinds.some((kind) => kind === row["kind"]) &&
    (!manifest || row["path"] === manifestPath) &&
    utf8Length(row["value"]) > bound
      ? [field]
      : [],
  );

/**
 * Collect the key texts a package's rows hold that the schema's type does not admit, by
 * `Relation.field`: each field of a key text type of each row the import's write stores, each
 * fold's end and each copy at the value the write draws, and each generated one at the value
 * grizzle's evaluator gives it (`#pantry/test/host-judge.ts` `withGenerated`). A row
 * whose written text is past the bound is one the database refuses by that field's domain, so its
 * generated texts are left unread, but for an attribute's value, which a "Key text bound" check
 * over a derived relation reads ({@link checkedPastBound}).
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
        const generated = () => withGenerated(evaluatorFor(Qti), relation, row);
        for (const field of written.length > 0 ? written : pastBound(relation.name, generated())) {
          refused.add(field);
        }
        if (relation.name === "Attribute") {
          for (const field of checkedPastBound(generated())) {
            refused.add(field);
          }
        }
      }
    }
  }

  return refused;
};

/**
 * A situation a search must reach: a place drawn past its limit ({@link limitAt}), its key text
 * type's bound or, for a text no key bounds, what an index entry holds of a text as itself, in a
 * script, a text no key holds drawn past what an index entry holds, another law the package
 * breaks, and the verdict.
 */
type Situation =
  | `${Script} past its limit`
  | `${Site} past its limit`
  | "a free text past an index entry"
  | "accepted"
  | "another law broken too"
  | "refused";

/**
 * The relations an import writes fewer rows of for a package than for its twin ({@link twinOf}):
 * each a copy an overlay leaves out because its text is past its field's bound, which the copy's
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
 * `key-text-bound` where a written field of a key text type holds a text past its bound, which the
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
          ? Option.toArray(ruleOfLaw(law))
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
 * database's refusal of the same texts as the import's rows give it, a field of a key text type
 * written past what the schema's type admits, or a copy left out of a relation its containment
 * reads; and the rule each would refuse it under ({@link databaseRules}) against the rules the
 * oracle names.
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
      const bytes = utf8Length(textAt(sketch, site, ""));
      if (held !== undefined && bytes > limitAt(site)) {
        note(`${site} past its limit`);
        note(`${held.script} past its limit`);
      }

      if (held !== undefined && freeSites.has(site) && bytes > entryBytes) {
        note("a free text past an index entry");
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
 * The reference cases, each with whether a key text past its bound refuses it: an include whose
 * href resolves through its document's folder to an in-package path of `entryPathBytes` and of one
 * byte more, the `ReferencePath.target` the import writes it into an `EntryPath`; and a resource's
 * and a file's href resolved through an `xml:base` to each of {@link longBytes} and 2 bytes more,
 * their arms' `target`s (`ResourceHrefPath`, `FilePath`) `EntryPath`s too, refused past
 * `entryPathBytes`.
 */
const referenceCases = [
  ...[entryPathBytes - 8, entryPathBytes - 7].map((n) => ({
    entries: includeOf(n),
    literal: `an include resolved to ${n + 8} bytes`,
    refused: n + 8 > entryPathBytes,
  })),
  ...longBytes.map((n) => ({
    entries: basedOf(n),
    literal: `a based resource of ${n + 2} bytes`,
    refused: n + 2 > entryPathBytes,
  })),
];

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
 * The IDs a key holds by their SHA-256 that no statement over `Attribute` copies: a `th`'s `id` and
 * a catalog's `id`, each its attribute's value as the views `TableHeader` and `CatalogId` read it,
 * a share's fragment (`ShareFragment.id`), an ID of a document in an assembly, here an item that
 * holds an include (`PlacedId.id`), and an element's text typed `xs:ID`, each an `xs:ID` of any
 * length, which a key holds by its SHA-256, as every ID of a document is. Each is an NCName of `n`
 * ASCII bytes, and the oracle reads each where it stands, as an ID of its document.
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
 * The held value cases, each place at a byte past what one B-tree entry holds of a text as itself.
 */
const heldCases = heldPlaces.map(({ entriesOf, place }) => ({
  entries: entriesOf(entryBytes + 1),
  literal: `${place} of ${String(entryBytes + 1)} bytes`,
}));

/**
 * A reference's token a byte past what one B-tree entry holds of a text as itself: an item whose
 * `data-catalog-idref` holds one token, an NCName of that many ASCII bytes, beside a catalog of
 * that `id`, so the token resolves and every row that holds it is the import's own write of it.
 */
const catalogToken = {
  entries: heldItemOf(
    `<p data-catalog-idref="${segmentOf(entryBytes + 1)}">Hi</p>`,
    `<qti-catalog-info><qti-catalog id="${segmentOf(entryBytes + 1)}"><qti-card support="spoken"><qti-html-content>Hi</qti-html-content></qti-card></qti-catalog></qti-catalog-info>`,
  ),
  literal: `a data-catalog-idref token of ${String(entryBytes + 1)} bytes`,
};

/**
 * The box: the package with every place short; then each place alone, in each script, at each of
 * its counts ({@link countsAt}: its bound and one past it, or each of {@link longBytes}; a language
 * tag in ASCII alone).
 */
const boxCases: Arr.NonEmptyReadonlyArray<Sketch> = [
  {},
  ...sites.flatMap((site) =>
    (site === "xml:lang" ? (["1-byte"] as const) : scripts).flatMap((script) =>
      countsAt(site, script).map((count): Sketch => ({ [site]: { count, script } })),
    ),
  ),
];

/**
 * Draw a package by its own swarm: the places it lengthens, each in a script the case's swarm
 * weighs, at one character or at one of its counts ({@link countsAt}).
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
        count: source.draw(element([1, ...countsAt(site, script)])),
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
        // concat fold's end) under the schema's own key text types, against the oracle's breaches.
        // Bound: every place alone, at its bound and one character past it or at each of the three
        // long lengths, in each of four scripts, and the package with every place short.
        Effect.gen(function* box() {
          const exhausted = yield* searched(
            ctx,
            exhaust(
              {
                box: "each place alone at its bound and one character past it, or at 433 bytes, past an index entry and at 64 KiB, in 1-, 2-, 3- and 4-byte scripts",
                caseHang: Duration.seconds(120),
                concurrency: 1,
                coverage: requiredInSpace<Situation>([
                  "1-byte past its limit",
                  "2-byte past its limit",
                  "3-byte past its limit",
                  "4-byte past its limit",
                  "a free text past an index entry",
                  "accepted",
                  "choice identifier past its limit",
                  "idref past its limit",
                  "manifest identifier past its limit",
                  "map key past its limit",
                  "p id past its limit",
                  "refused",
                  "response identifier past its limit",
                  "xml:lang past its limit",
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
      searchTimeout,
    );

    test.effect(
      "refuses each swarmed package under Key text bound exactly where its import's rows hold a text its field's type does not admit, under the rule the database names",
      (ctx) =>
        // Oracle: as the box's. Bound: each case under its own swarm of the 13 places and 4 scripts,
        // each place at one character or at one of its counts; 60 runs.
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
      searchTimeout,
    );

    test.effect(
      "refuses a reference whose in-package path resolves past entryPathBytes, an include's, a resource's or a file's, and admits one at it",
      () =>
        // Oracle: as the box's, the import's rows under the schema's own types: an include's resolved
        // path is an `EntryPath`, held in a key of at most `entryPathBytes`, and so is a resource's
        // and a file's href resolved in the package, its arm's `target` (`ResourceHrefPath`,
        // `FilePath`). Bound: an include resolved to the bound and a byte past it, and a based
        // resource and file at each of the three long lengths, the first within the bound.
        Effect.gen(function* eachReferenceCase() {
          for (const { entries, literal, refused: past } of referenceCases) {
            const { breaches, refused } = yield* judgedEntries(entries, literal, Option.none());
            const bound = breaches.filter(({ law }) => law === "Key text bound");

            assert.strictEqual(refused.size > 0, past, `${literal}: the import's rows`);
            assert.strictEqual(bound.length > 0, past, `${literal}: the oracle's Key text bound`);
          }
        }),
      { timeout: testTimeoutMs },
    );

    test.effect(
      "admits a th's id, a catalog's id, a share's fragment, an assembled document's ID and an ID text past any B-tree entry, on the import's rows and in the oracle",
      () =>
        // Oracle: QTI bounds no ID (`xs:ID`) and no URI's fragment (XML Schema Part 2 §3.3.8), so
        // each value a key holds (`TableHeader`'s and `CatalogId`'s `id`, `ShareFragment.id`,
        // `PlacedId.id`) and every ID of a document is held whole, a key holding it by its
        // SHA-256, and none is refused for its length. Bound: each place a byte past what one
        // B-tree entry holds of a text as itself.
        Effect.gen(function* eachHeldCase() {
          for (const { entries, literal } of heldCases) {
            const { breaches, refused } = yield* judgedEntries(entries, literal, Option.none());
            const bound = breaches.filter(({ law }) => law === "Key text bound");

            assert.deepStrictEqual([...refused], [], `${literal}: the import's rows`);
            assert.deepStrictEqual(bound, [], `${literal}: the oracle's Key text bound`);
          }
        }),
      { timeout: testTimeoutMs },
    );

    test.effect(
      "admits a data-catalog-idref token past any B-tree entry: its Idref token is an xs:ID a key holds by its digest",
      () =>
        // Oracle: QTI bounds no IDREF (XML Schema Part 2 §3.3.9), so a reference's token
        // (`Idref.token`, and its document's `IdrefTarget.id`) is held whole, a key holding it by
        // its SHA-256 (`tokenDigest`, `idDigest`), and the pieces' running end and their fold end
        // are of any length. Bound: one token a byte past what one B-tree entry holds.
        Effect.gen(function* eachReferenceToken() {
          const { entries, literal } = catalogToken;
          const { breaches, refused } = yield* judgedEntries(entries, literal, Option.none());
          const bound = breaches.filter(({ law }) => law === "Key text bound");

          assert.deepStrictEqual([...refused], [], `${literal}: the import's rows`);
          assert.deepStrictEqual(bound, [], `${literal}: the oracle's Key text bound`);
        }),
      { timeout: testTimeoutMs },
    );
  },
);

it("writes every text the cases draw at its place's bound within it and one character past it outside it, and every long text within the bound a matched text meets and past what a B-tree entry holds", () => {
  // Oracle: the declared bounds of `#pantry/qti/limits.ts` and grizzle's entry bound.
  // Bound: the four scripts at each place's counts.
  for (const script of scripts) {
    for (const site of sites) {
      const bound = siteBounds[site];
      if (bound !== undefined) {
        const [within = 1, past = 1] = countsAt(site, script);

        assert.isAtMost(utf8Length(textOf("a", { count: within, script })), bound, site);
        assert.isAbove(utf8Length(textOf("a", { count: past, script })), bound, site);
      }
    }

    for (const bytes of longBytes) {
      const text = textOf("a", { count: countOf(script, bytes), script });

      assert.isAtMost(utf8Length(text), matchedTextBytes, `${script} at ${bytes} bytes`);
      assert.isAtLeast(utf8Length(text), bytes, `${script} at ${bytes} bytes`);
    }

    assert.isAbove(
      utf8Length(textOf("a", { count: countOf(script, entryBytes + 1), script })),
      entryBytes,
    );
  }

  assert.isAbove(entryBytes, entryPathBytes);
});
