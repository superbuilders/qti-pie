/**
 * The one definition of a word (`#plate/words.ts`), held to itself three ways over every short
 * answer of an alphabet of what a count reads (a letter, a hyphen, a digit, a space, a tab, a line
 * feed, U+00A0, U+3000 and the invisible U+200B and U+FEFF), plain and rich: the word minimum's
 * pattern, matched by plate's XML Schema matcher (`#plate/model/regex.ts`, grizzle's engine) and by
 * JavaScript's under the `v` flag, accepts an answer exactly when `wordsIn` counts at least its
 * least. An empty answer is NULL, which no pattern is matched against. The ledger's SQL matcher is
 * held to the same count by its own suite (`@qti-pie/ledger`'s words.db.test.ts).
 */
import { assert, describe, it } from "@effect/vitest";
import { Option } from "effect";
import { compile, matches } from "#plate/model/regex.ts";
import { wordPatternOf, wordsIn } from "#plate/words.ts";
import type { WordText } from "#plate/words.ts";

/**
 * The characters a count reads, beside a letter, a hyphen and a digit that stand for any word.
 */
const alphabet = ["a", "-", "1", " ", "\t", "\n", " ", "　", "​", "﻿"] as const;

/**
 * Every answer of exactly `length` characters of {@link alphabet}.
 *
 * @param length The length.
 * @returns The answers.
 */
const answersOf = (length: number): readonly string[] =>
  length === 0
    ? [""]
    : answersOf(length - 1).flatMap((prefix) => alphabet.map((character) => prefix + character));

/**
 * Every answer of one to four characters of {@link alphabet}: 11,110 answers.
 */
const answers = [1, 2, 3, 4].flatMap(answersOf);

/**
 * The word minimums held: two, three and four words, read plain and rich.
 */
const minimums = [2, 3, 4].flatMap((least) =>
  (["plain", "rich"] as const satisfies readonly WordText[]).map((text) => ({ least, text })),
);

describe("wordsIn and wordPatternOf", () => {
  it("accept an answer under a word minimum's pattern exactly when wordsIn counts enough words", () => {
    for (const minimum of minimums) {
      const { pattern } = wordPatternOf(minimum);
      const matcher = Option.getOrThrow(compile(pattern));
      const javascript = new RegExp(`^(?:${pattern})$`, "v");
      for (const answer of answers) {
        const want = wordsIn(answer, minimum.text) >= minimum.least;
        const what = `${JSON.stringify(answer)} under ${String(minimum.least)} ${minimum.text}`;
        assert.strictEqual(matches(matcher, answer), want, `${what}: plate's matcher`);
        assert.strictEqual(javascript.test(answer), want, `${what}: JavaScript's`);
      }
    }
  });

  it("count punctuation, hyphens and digits as characters of a word, and a rich answer's zero-width characters as nothing", () => {
    assert.strictEqual(wordsIn("well-known 3.14 U.S. —", "plain"), 4);
    assert.strictEqual(wordsIn("a , b", "plain"), 3);
    assert.strictEqual(wordsIn("end.", "plain"), 1);
    assert.strictEqual(wordsIn("one two　three", "plain"), 3);
    assert.strictEqual(wordsIn("​", "plain"), 1);
    assert.strictEqual(wordsIn("​", "rich"), 0);
    assert.strictEqual(wordsIn("a​b c", "rich"), 2);
    assert.strictEqual(wordsIn("﻿", "plain"), 0);
    assert.strictEqual(wordsIn("", "plain"), 0);
  });
});
