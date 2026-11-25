/**
 * A word minimum as the QTI database judges it, held to plate's count of words
 * (`@qti-pie/plate/words`, the one definition a page shows beside an essay): under
 * validate-responses an Extended Text's answer is refused unless its `pattern-mask` matches it
 * (admission.sql's patternMismatch), an `xhtml` one matched against its text (`p3.xhtml_text`,
 * reading 244) and a plain one as posted; so for every answer and every word minimum, the machine's
 * own XML Schema matcher (`p3.xsd_compile`, `p3.xsd_run`, machine/xsd.sql) must accept the
 * minimum's pattern (`wordPatternOf`) exactly when `wordsIn` counts at least its least, or a child
 * who sees enough words is refused, or one who sees too few is not. This suite holds the
 * database's.
 *
 * The answers are drawn from words (letters, digits, hyphens, punctuation), every space a count
 * reads (XML's four, U+00A0, U+3000, U+FEFF) and the zero-width U+200B, and, for a rich answer,
 * the markup and references plate's reading takes apart (`br`s, paragraph boundaries, inline tags,
 * `&nbsp;`). The machine's SQL is created in a schema of this run's own on the lane's database, in
 * a transaction that rolls back, from `machine/xsd.sql` and `machine/admission.sql`, the sources
 * `src/grading.ts` is generated from.
 *
 * Four plants restate readings the count must not take, and the search must catch each: XML
 * Schema's own `\s`, four characters, as the white space of a pattern; a rich answer's zero-width
 * space counted as a word; a `br` read as nothing; and U+00A0 read as no space.
 *
 * It runs only where a database is handed to it, as pantry's database suites do
 * (`QTI_PIE_PG_DATABASE` and pantry's `QTI_PIE_PG_*`), and is skipped elsewhere.
 */
import { readFileSync } from "node:fs";
import * as NodeServices from "@effect/platform-node/NodeServices";
import { assert, describe, it } from "@effect/vitest";
import { drawn, explore } from "@bjornpagen/testing/explore";
import { required } from "@bjornpagen/testing/features";
import { array, boolean, element } from "@bjornpagen/testing/gen";
import type { Gen } from "@bjornpagen/testing/gen";
import { notesOnly } from "@bjornpagen/testing/sense";
import { completeShrink } from "@bjornpagen/testing/shrink";
import { searched } from "@bjornpagen/testing/vitest";
import { migrationClientOf } from "@qti-pie/pantry/test/file-database.ts";
import { textOfXhtml } from "@qti-pie/plate";
import { SPACE, wordPatternOf, wordsIn } from "@qti-pie/plate/words";
import type { WordMinimum, WordText } from "@qti-pie/plate/words";
import { Config, Duration, Effect, Option } from "effect";
import type { Client } from "pg";

/**
 * The lane's database, where one is handed to the run.
 */
const lease = Effect.runSync(Config.option(Config.String("QTI_PIE_PG_DATABASE")));

/**
 * A function's SQL in a machine file, from its declaration to the end of its body.
 *
 * @param sql The file's text.
 * @param name The function's qualified name.
 * @param end The text its body ends with.
 * @returns Its SQL.
 */
const functionOf = (sql: string, name: string, end: string): string => {
  const start = sql.indexOf(`create function ${name}(`);
  assert.isTrue(start !== -1, `the machine declares ${name}`);

  return sql.slice(start, sql.indexOf(end, start) + end.length);
};

/**
 * The machine's XML Schema matcher, every function of `machine/xsd.sql`.
 */
const xsdText = readFileSync(new URL("../machine/xsd.sql", import.meta.url), "utf-8");

/**
 * The machine's text of an xhtml value, `p3.xhtml_reference`, `p3.xhtml_run`, `p3.xhtml_blocks`
 * and `p3.xhtml_text` of `machine/admission.sql`.
 */
const textText = ((): string => {
  const sql = readFileSync(new URL("../machine/admission.sql", import.meta.url), "utf-8");

  return [
    functionOf(sql, "p3.xhtml_reference", "$$;"),
    functionOf(sql, "p3.xhtml_run", "$$;"),
    functionOf(sql, "p3.xhtml_blocks", "$$;"),
    functionOf(sql, "p3.xhtml_text", "$$;"),
  ].join("\n\n");
})();

/**
 * How a variant of the judgement reads an answer: the patterns it matches, by the minimum, and the
 * machine's text it matches a rich answer's against.
 */
interface Reading {
  readonly patternOf: (minimum: WordMinimum) => string;
  readonly text: string;
}

/**
 * The judgement as it stands: plate's patterns over the machine's text.
 */
const standing: Reading = {
  patternOf: (minimum) => wordPatternOf(minimum).pattern,
  text: textText,
};

/**
 * A pattern with its spelled-out white space replaced.
 *
 * @param space The class body standing for white space.
 * @returns The minimum's pattern under it.
 */
const spacedBy =
  (space: string) =>
  (minimum: WordMinimum): string =>
    wordPatternOf(minimum).pattern.replaceAll(SPACE, space);

/**
 * The plants: each a reading the count must not take, under the situation a case that catches it
 * notes.
 */
const PLANTS = [
  {
    name: "caught: XML Schema's four-character \\s as a pattern's white space",
    reading: { patternOf: spacedBy(String.raw`\s`), text: textText },
  },
  {
    name: "caught: a rich answer's zero-width space counted as a word",
    reading: {
      patternOf: (minimum: WordMinimum) => wordPatternOf({ ...minimum, text: "plain" }).pattern,
      text: textText,
    },
  },
  {
    name: "caught: a br read as nothing",
    reading: {
      patternOf: standing.patternOf,
      text: textText.replace(String.raw`E'\n', 'gi'`, "'', 'gi'"),
    },
  },
  {
    name: "caught: U+00A0 read as no space",
    reading: { patternOf: spacedBy(String.raw`\t-\r `), text: textText },
  },
] as const satisfies readonly Readonly<{ name: string; reading: Reading }>[];

/**
 * The situation of a plant caught.
 */
type Caught = (typeof PLANTS)[number]["name"];

/**
 * What a drawn answer holds that the count reads apart.
 */
type Feature =
  | "a rich answer"
  | "a plain answer"
  | "a br"
  | "a paragraph boundary"
  | "a block boundary"
  | "an inline tag"
  | "a no-break space reference"
  | "white space beyond XML's four"
  | "a zero-width space"
  | "punctuation, a hyphen or a digit in a word"
  | "accepted"
  | "refused";

/**
 * One piece of a drawn answer, the feature it brings, and whether a plain answer may hold it.
 */
interface Piece {
  readonly feature: Option.Option<Feature>;
  readonly plain: boolean;
  readonly text: string;
}

/**
 * Construct a piece.
 *
 * @param text Its text.
 * @param plain Whether a plain answer may hold it: markup and references are a rich answer's.
 * @param feature The feature it brings, none for a plain word or space.
 * @returns The piece.
 */
const piece = (text: string, plain: boolean, feature?: Feature): Piece => ({
  feature: Option.fromUndefinedOr(feature),
  plain,
  text,
});

/**
 * The pieces an answer is drawn from.
 */
const PIECES = [
  piece("one", true),
  piece("Two", true),
  piece("é", true),
  piece("well-known", true, "punctuation, a hyphen or a digit in a word"),
  piece("3.14", true, "punctuation, a hyphen or a digit in a word"),
  piece("?!", true, "punctuation, a hyphen or a digit in a word"),
  piece(" ", true),
  piece("  ", true),
  piece("\t", true),
  piece("\n", true),
  piece(" ", true, "white space beyond XML's four"),
  piece("　", true, "white space beyond XML's four"),
  piece("﻿", true, "white space beyond XML's four"),
  piece("​", true, "a zero-width space"),
  piece("<br/>", false, "a br"),
  piece("<br>", false, "a br"),
  piece("<p>", false),
  piece("</p>", false),
  piece("</p><p>", false, "a paragraph boundary"),
  piece("</p>\n<p>", false, "a paragraph boundary"),
  piece("<h1>", false, "a block boundary"),
  piece("</h1><p>", false, "a block boundary"),
  piece("</li><li>", false, "a block boundary"),
  piece("<ul><li>", false, "a block boundary"),
  piece("<b>", false, "an inline tag"),
  piece("</b>", false, "an inline tag"),
  piece("&nbsp;", false, "a no-break space reference"),
  piece("&amp;", false),
] as const;

/**
 * A drawn answer: how it is read, its value, and the features it holds.
 */
interface Drawn {
  readonly features: readonly Feature[];
  readonly read: WordText;
  readonly value: string;
}

/**
 * Answers of one to twelve pieces, rich or plain; a plain answer's markup pieces left out. An
 * answer left empty is NULL, which no pattern is matched against, so none is drawn.
 */
const answers: Gen<Drawn> = (source) => {
  const pieces = source.draw(array(element(PIECES), { max: 12, min: 1 }));
  const rich = source.draw(boolean);
  const held = rich ? pieces : pieces.filter((each) => each.plain);
  const kept = held.length === 0 ? [PIECES[0]] : held;

  return {
    features: [
      rich ? "a rich answer" : "a plain answer",
      ...kept.flatMap((each) => Option.toArray(each.feature)),
    ],
    read: rich ? "rich" : "plain",
    value: kept.map((each) => each.text).join(""),
  };
};

/**
 * The word minimums judged: two to six words.
 */
const leasts = [2, 3, 4, 5, 6] as const;

/**
 * Every situation the search must reach: each feature drawn, both verdicts, and each plant caught.
 */
const situations = [
  "a rich answer",
  "a plain answer",
  "a br",
  "a paragraph boundary",
  "a block boundary",
  "an inline tag",
  "a no-break space reference",
  "white space beyond XML's four",
  "a zero-width space",
  "punctuation, a hyphen or a digit in a word",
  "accepted",
  "refused",
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
  Effect.promise(() => client.query<{ readonly ok: boolean | null }>(statement, [...parameters]));

/**
 * Whether a schema's machine accepts an answer under a pattern: the pattern compiled and run over
 * the answer, a rich one's text read by the schema's `xhtml_text`, each function's own calls
 * resolved in the schema (its search path).
 *
 * @param client The session.
 * @param schemaName The schema the machine is created in.
 * @param pattern The pattern.
 * @param drawnAnswer The answer.
 * @returns Whether it matches.
 */
const acceptedIn = (client: Client, schemaName: string, pattern: string, drawnAnswer: Drawn) =>
  Effect.map(
    Effect.andThen(query(client, `set local search_path = ${schemaName}`), () =>
      query(
        client,
        `select ${schemaName}.xsd_run(program => ${schemaName}.xsd_compile(p => $1), v => ${
          drawnAnswer.read === "rich" ? `${schemaName}.xhtml_text(x => $2)` : "$2"
        }) as ok`,
        [pattern, drawnAnswer.value],
      ),
    ),
    (result) => result.rows[0]?.ok === true,
  );

/**
 * The run's session: a client of the lane's database in a transaction, the machine's matcher and
 * text created in schema `words_machine` and each plant's text in a schema of its own; rolled back
 * and closed when the scope ends.
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

      const create = (schemaName: string, text: string) =>
        Effect.gen(function* createIn() {
          yield* query(client, `create schema ${schemaName}`);
          yield* query(client, `set local search_path = ${schemaName}`);
          yield* query(client, xsdText.replaceAll("p3.", `${schemaName}.`));
          yield* query(client, text.replaceAll("p3.", `${schemaName}.`));
        });

      yield* create("words_machine", standing.text);

      const planted = PLANTS.map((plant, index) => [plant, `words_plant_${index}`] as const);
      for (const [plant, schemaName] of planted) {
        yield* create(schemaName, plant.reading.text);
      }

      return { client, planted };
    }),
    ({ client }) =>
      Effect.promise(async () => {
        await client.query("rollback");
        await client.end();
      }),
  );

/**
 * The search's work: its drawn answers, each one call of the machine's matcher.
 */
const runs = 400;

/**
 * How long one case may run before it is stopped and reported, the search's one guard on time: a
 * matcher call that runs past it is hung, whatever the machine's load.
 */
const caseHang = Duration.seconds(30);

/**
 * The test's own timeout, which no run of its work can reach: every case and the session's setup at
 * their guard, so a loaded machine finishes the search, and only a hung case stops it.
 */
const searchTimeout = Duration.toMillis(Duration.times(caseHang, runs + 1));

describe.skipIf(Option.isNone(lease))("a word minimum, as the database judges it", () => {
  it.effect(
    "accepts every drawn answer under each word minimum exactly when plate counts enough words, and catches each plant",
    (ctx) =>
      Effect.scoped(
        Effect.gen(function* holdsTheCount() {
          const database = Option.getOrElse(lease, () => assert.fail("no database is handed"));
          const { client, planted } = yield* sessionOf(database);

          yield* searched(
            ctx,
            explore(
              {
                caseHang,
                concurrency: 1,
                coverage: required<Feature | Caught>(situations, {
                  cases: runs,
                  sense: notesOnly,
                }),
                draw: drawn(answers),
                kept: [],
                literal: (drawnAnswer) => JSON.stringify(drawnAnswer),
                oracle: {
                  kind: "second-implementation",
                  name: "plate's wordsIn over textOfXhtml (src/words.ts), the count a page shows beside an essay",
                },
                runs,
                shrink: completeShrink,
                steerEvery: 16,
                suite: "ledger/words",
              },
              (drawnAnswer, c) =>
                Effect.gen(function* judgesAsPlate() {
                  c.noteAll(drawnAnswer.features);

                  const words = wordsIn(
                    drawnAnswer.read === "rich"
                      ? textOfXhtml(drawnAnswer.value)
                      : drawnAnswer.value,
                    drawnAnswer.read,
                  );
                  for (const least of leasts) {
                    const minimum: WordMinimum = { least, text: drawnAnswer.read };
                    const expected = words >= least;
                    c.note(expected ? "accepted" : "refused");
                    assert.strictEqual(
                      yield* acceptedIn(
                        client,
                        "words_machine",
                        standing.patternOf(minimum),
                        drawnAnswer,
                      ),
                      expected,
                      `${JSON.stringify(drawnAnswer.value)} (${drawnAnswer.read}), at least ${String(least)} words`,
                    );

                    for (const [plant, schemaName] of planted) {
                      if (
                        (yield* acceptedIn(
                          client,
                          schemaName,
                          plant.reading.patternOf(minimum),
                          drawnAnswer,
                        )) !== expected
                      ) {
                        c.note(plant.name);
                      }
                    }
                  }
                }),
            ),
          );
        }),
      ).pipe(Effect.provide(NodeServices.layer)),
    searchTimeout,
  );
});
