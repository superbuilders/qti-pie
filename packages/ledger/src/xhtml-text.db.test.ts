/**
 * The text of an `xhtml` Extended Text's value, which the QTI database's admission matches a
 * `pattern-mask` against (reading 244), stated once in the ledger's machine as `p3.xhtml_text`
 * (`machine/admission.sql`), held to plate's `textOfXhtml`, the text the item's box shows and its
 * hint judges, over drawn values: paragraphs and line breaks as plate writes them and as other
 * editors do (`<br>`, `<BR />`, `</p >` and white space between paragraphs, a tag's white space any
 * of JavaScript's `\s`), inline tags, every reference plate resolves or leaves as written, and text
 * of every space a word count reads. A numeric reference to U+0000 or a surrogate is never drawn:
 * neither an XML value nor PostgreSQL's text holds what plate makes of it, so the database's text
 * keeps it as written (reading 244).
 *
 * The oracle is a second implementation, plate's, run in JavaScript; the database's text is
 * PostgreSQL's evaluation of the machine's own SQL, read from `machine/admission.sql` (the source
 * `src/grading.ts` is generated from, which `generate:check` holds to it) and created in a schema
 * of this run's own on the lane's database, in a transaction that rolls back.
 *
 * Four plants restate readings the text must not take, each created beside it, and the search must
 * catch each: a `br` read as nothing (`one<br/>two` would be one word), a paragraph boundary read
 * as one line feed, a named reference read whatever its case (`&AMP;` as `&`), and a tag's white
 * space read as XML's four (a `br` written with a no-break space, kept where it reads a line feed).
 *
 * It runs only where a database is handed to it, as pantry's database suites do
 * (`QTI_PIE_PG_DATABASE` and pantry's `QTI_PIE_PG_*`), and is skipped elsewhere.
 */
import { readFileSync } from "node:fs";
import * as NodeServices from "@effect/platform-node/NodeServices";
import { assert, describe, it } from "@effect/vitest";
import { drawn, explore } from "@bjornpagen/testing/explore";
import { required } from "@bjornpagen/testing/features";
import { array, element, map } from "@bjornpagen/testing/gen";
import type { Gen } from "@bjornpagen/testing/gen";
import { notesOnly } from "@bjornpagen/testing/sense";
import { completeShrink } from "@bjornpagen/testing/shrink";
import { searched } from "@bjornpagen/testing/vitest";
import { migrationClientOf } from "@qti-pie/pantry/test/file-database.ts";
import { textOfXhtml } from "@qti-pie/plate";
import { Config, Duration, Effect, Option } from "effect";
import type { Client } from "pg";

/**
 * The lane's database, where one is handed to the run.
 */
const lease = Effect.runSync(Config.option(Config.String("QTI_PIE_PG_DATABASE")));

/**
 * The machine's SQL of the two functions that state the text, as `machine/admission.sql` holds it:
 * from `p3.xhtml_reference`'s declaration to the end of `p3.xhtml_text`'s.
 */
const machineText = ((): string => {
  const sql = readFileSync(new URL("../machine/admission.sql", import.meta.url), "utf-8");
  const start = sql.indexOf("create function p3.xhtml_reference");
  const textStart = sql.indexOf("create function p3.xhtml_text", start);
  const end = sql.indexOf("$$;", textStart) + "$$;".length;
  assert.isTrue(start !== -1 && textStart > start, "machine/admission.sql declares the text");

  return sql.slice(start, end);
})();

/**
 * The plants: each a reading the text must not take, as a change to the machine's SQL, under the
 * situation a case that catches it notes.
 */
const PLANTS = [
  {
    name: "caught: a br read as nothing",
    original: String.raw`E'\n', 'gi'`,
    replacement: "'', 'gi'",
  },
  {
    name: "caught: a named reference read whatever its case",
    original: "case r when '&amp;'",
    replacement: "case lower(r) when '&amp;'",
  },
  {
    name: "caught: a paragraph boundary read as one line feed",
    original: String.raw`E'\n\n', 'gi'`,
    replacement: String.raw`E'\n', 'gi'`,
  },
  {
    name: "caught: a tag's white space read as XML's four",
    original: String.raw`'<br[\t\n\v\f\r \u00A0\u1680\u2000-\u200A\u2028\u2029\u202F\u205F\u3000\uFEFF]*/?>'`,
    replacement: String.raw`'<br[ \t\n\r]*/?>'`,
  },
] as const;

/**
 * The situation of a plant caught.
 */
type Caught = (typeof PLANTS)[number]["name"];

/**
 * What a drawn value holds that the text reads apart.
 */
type Feature =
  | "a br"
  | "a paragraph boundary"
  | "an inline tag"
  | "a named reference"
  | "a numeric reference"
  | "a reference written escaped"
  | "white space in a tag beyond XML's four"
  | "white space beyond XML's four";

/**
 * One piece of a drawn value, and the feature it brings.
 */
interface Piece {
  readonly feature: Option.Option<Feature>;
  readonly text: string;
}

/**
 * Construct a piece.
 *
 * @param text Its text.
 * @param feature The feature it brings, none for plain text.
 * @returns The piece.
 */
const piece = (text: string, feature?: Feature): Piece => ({
  feature: Option.fromUndefinedOr(feature),
  text,
});

/**
 * The pieces a value is drawn from: words and every space a word count reads, and the markup and
 * references plate's reading takes apart, as plate writes them and as other editors do.
 */
const PIECES = [
  piece("one"),
  piece("Two"),
  piece(" "),
  piece("\t"),
  piece("é"),
  piece("😀"),
  piece(">"),
  piece("\u00A0", "white space beyond XML's four"),
  piece("\u3000", "white space beyond XML's four"),
  piece("\uFEFF", "white space beyond XML's four"),
  piece("\u200B"),
  piece("<br/>", "a br"),
  piece("<br>", "a br"),
  piece("<BR />", "a br"),
  piece("<br\u00A0/>", "white space in a tag beyond XML's four"),
  piece("<p>"),
  piece("</p>"),
  piece("</p><p>", "a paragraph boundary"),
  piece("</p>\n<p>", "a paragraph boundary"),
  piece('</P >\u3000<p class="x">', "a paragraph boundary"),
  piece("<b>", "an inline tag"),
  piece("</b>", "an inline tag"),
  piece("<pre>", "an inline tag"),
  piece('<span title="a">', "an inline tag"),
  piece("&amp;", "a named reference"),
  piece("&lt;", "a named reference"),
  piece("&gt;", "a named reference"),
  piece("&quot;", "a named reference"),
  piece("&apos;", "a named reference"),
  piece("&nbsp;", "a named reference"),
  piece("&AMP;", "a named reference"),
  piece("&bogus;", "a named reference"),
  piece("&"),
  piece("&#13;", "a numeric reference"),
  piece("&#65;", "a numeric reference"),
  piece("&#x1F600;", "a numeric reference"),
  piece("&#X41;", "a numeric reference"),
  piece("&#x110000;", "a numeric reference"),
  piece("&#99999999;", "a numeric reference"),
  piece("&#x;"),
  piece("&amp;lt;b&amp;gt;", "a reference written escaped"),
] as const;

/**
 * A drawn value: its pieces, joined.
 */
interface Drawn {
  readonly features: readonly Feature[];
  readonly value: string;
}

/**
 * Values of up to sixteen pieces.
 */
const values: Gen<Drawn> = map(array(element(PIECES), { max: 16, min: 0 }), (pieces) => ({
  features: pieces.flatMap((each) => Option.toArray(each.feature)),
  value: pieces.map((each) => each.text).join(""),
}));

/**
 * Every situation the search must reach: each feature drawn, and each plant caught.
 */
const situations = [
  "a br",
  "a paragraph boundary",
  "an inline tag",
  "a named reference",
  "a numeric reference",
  "a reference written escaped",
  "white space in a tag beyond XML's four",
  "white space beyond XML's four",
  ...PLANTS.map((plant) => plant.name),
] as const satisfies readonly (Feature | Caught)[];

/**
 * Run a statement on the run's session.
 *
 * @param client The session.
 * @param statement The statement.
 * @param parameters Its parameters.
 * @returns Its rows.
 */
const query = (client: Client, statement: string, parameters: readonly string[] = []) =>
  Effect.promise(() => client.query<{ readonly text: string }>(statement, [...parameters]));

/**
 * The text a schema's `xhtml_text` reads of a value.
 *
 * @param client The session.
 * @param schemaName The schema the function is created in.
 * @param value The value.
 * @returns The text.
 */
const textIn = (client: Client, schemaName: string, value: string) =>
  Effect.map(
    query(client, `select ${schemaName}.xhtml_text(x => $1) as text`, [value]),
    (result) => result.rows[0]?.text ?? assert.fail("xhtml_text returned no row"),
  );

/**
 * The run's session: a client of the lane's database in a transaction, the machine's text created
 * in schema `wordcap_text` and each plant's in a schema of its own, every call naming its schema;
 * rolled back and closed when the scope ends.
 *
 * @param database The lane's database.
 * @returns The session, and each plant's schema by its situation.
 */
const sessionOf = (database: string) =>
  Effect.acquireRelease(
    Effect.gen(function* openSession() {
      const client = yield* migrationClientOf(database).pipe(Effect.orDie);
      yield* Effect.promise(() => client.connect());
      yield* query(client, "begin");

      const create = (schemaName: string, source: string) =>
        Effect.andThen(query(client, `create schema ${schemaName}`), () =>
          query(
            client,
            source
              .replaceAll("p3.", `${schemaName}.`)
              .replaceAll("xhtml_reference(r =>", `${schemaName}.xhtml_reference(r =>`),
          ),
        );

      yield* create("wordcap_text", machineText);

      const planted = PLANTS.map((plant, index) => [plant, `wordcap_plant_${index}`] as const);
      for (const [plant, schemaName] of planted) {
        assert.isTrue(machineText.includes(plant.original), `the plant ${plant.name} applies`);
        yield* create(schemaName, machineText.replace(plant.original, plant.replacement));
      }

      return { client, planted };
    }),
    ({ client }) =>
      Effect.promise(async () => {
        await client.query("rollback");
        await client.end();
      }),
  );

describe.skipIf(Option.isNone(lease))(
  "an xhtml Extended Text's text, as the database reads it",
  () => {
    it.effect(
      "reads every drawn value as plate's textOfXhtml reads it, and catches each plant",
      (ctx) =>
        Effect.scoped(
          Effect.gen(function* holdsTheText() {
            const database = Option.getOrElse(lease, () => assert.fail("no database is handed"));
            const { client, planted } = yield* sessionOf(database);

            yield* searched(
              ctx,
              explore(
                {
                  caseHang: Duration.seconds(30),
                  concurrency: 1,
                  coverage: required<Feature | Caught>(situations, {
                    cases: 400,
                    sense: notesOnly,
                  }),
                  draw: drawn(values),
                  kept: [],
                  literal: (drawnValue) => JSON.stringify(drawnValue.value),
                  oracle: {
                    kind: "second-implementation",
                    name: "plate's textOfXhtml (src/interactions/xhtml-text.ts), the text the item's box shows",
                  },
                  runs: 400,
                  shrink: completeShrink,
                  steerEvery: 16,
                  suite: "ledger/xhtml-text",
                },
                (drawnValue, c) =>
                  Effect.gen(function* readsAsPlate() {
                    c.noteAll(drawnValue.features);

                    const expected = textOfXhtml(drawnValue.value);
                    assert.strictEqual(
                      yield* textIn(client, "wordcap_text", drawnValue.value),
                      expected,
                      JSON.stringify(drawnValue.value),
                    );

                    for (const [plant, schemaName] of planted) {
                      if ((yield* textIn(client, schemaName, drawnValue.value)) !== expected) {
                        c.note(plant.name);
                      }
                    }
                  }),
              ),
            );
          }),
        ).pipe(Effect.provide(NodeServices.layer)),
    );
  },
);
