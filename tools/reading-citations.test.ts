/**
 * The spec readings are cited by slug alone. Each reading of `docs/spec-readings.md` bears a
 * permanent slug, and its list number is only its position: two lanes that add a reading at once
 * once took the same number, and a ruling a lane or a host had cited by number was renumbered under
 * them. So no file git tracks cites a reading by a number, and every slug a citation's own form
 * names is one the register holds.
 *
 * A citation is the word, singular or plural and in either case, then what it names, past spaces,
 * tabs, and a line break with the next line's comment leader. A digit there is a citation by
 * number, refused wherever it stands. A slug in backticks (escaped inside a template literal) after
 * `spec reading`, `(reading` or the plural, and each slug the plural's list joins by commas, `and`
 * or `or`, is one the register holds; the word alone before one slug is also the verb ("a relation
 * reading `value`"), held only to cite no number. pantry's census holds the register's own shape
 * (`packages/pantry/src/test/alignment.test.ts`): each reading named once, by a slug no other
 * bears.
 *
 * @module
 */
import { execFileSync } from "node:child_process";
import { readFileSync, statSync } from "node:fs";
import path from "node:path";
import { assert, describe, it } from "@effect/vitest";

/**
 * The repository's root, from which git lists the files it tracks.
 */
const root = path.resolve(import.meta.dirname, "..");

/**
 * Whether a character is a word's: an ASCII letter, a digit or an underscore.
 *
 * @param character - The character, empty past either end.
 * @returns Whether it is.
 */
const wordCharacter = (character: string): boolean =>
  (character >= "a" && character <= "z") ||
  (character >= "A" && character <= "Z") ||
  (character >= "0" && character <= "9") ||
  character === "_";

/**
 * Whether a character is a digit.
 *
 * @param character - The character, empty past either end.
 * @returns Whether it is.
 */
const digit = (character: string): boolean => character >= "0" && character <= "9";

/**
 * The length of a comment's leader at a place: `//`, `--`, `#`, or a star that ends no comment; 0
 * where none stands.
 *
 * @param text - The text.
 * @param at - The place.
 * @returns The leader's length.
 */
const leaderAt = (text: string, at: number): number =>
  ["//", "--", "#", "*"].find(
    (written) => text.startsWith(written, at) && !text.startsWith("*/", at),
  )?.length ?? 0;

/**
 * Skip what may stand between a citation's word and what it names, or between two of its slugs:
 * spaces and tabs, and a line break with the next line's comment leader (a star that ends no
 * comment, `//`, `--` or `#`).
 *
 * @param text - The text.
 * @param from - Where the gap may start.
 * @returns Where it ends, `from` itself where there is none.
 */
const pastGap = (text: string, from: number): number => {
  let at = from;
  for (;;) {
    const blank = text.charAt(at);
    if (blank === " " || blank === "\t") {
      at += 1;
    } else if (blank === "\n") {
      at += 1;
      while (text.charAt(at) === " " || text.charAt(at) === "\t") {
        at += 1;
      }

      at += leaderAt(text, at);
    } else {
      return at;
    }
  }
};

/**
 * A slug read in backticks, and where its closing backtick ends.
 */
interface Ticked {
  readonly end: number;
  readonly slug: string;
}

/**
 * Read a slug in backticks, each backtick escaped or not, at a place in a text.
 *
 * @param text - The text.
 * @param from - Where the slug's opening backtick, or its escape, stands.
 * @returns The slug and where its closing backtick ends, or none.
 */
const tickedAt = (text: string, from: number): Ticked | undefined => {
  const open = text.startsWith("\\`", from) ? from + 2 : from + 1;
  if (text.charAt(open - 1) !== "`") {
    return undefined;
  }

  let at = open;
  while (wordCharacter(text.charAt(at)) || text.charAt(at) === "-") {
    at += 1;
  }

  const close = text.startsWith("\\`", at) ? at + 2 : at + 1;

  return at > open && text.charAt(close - 1) === "`"
    ? { end: close, slug: text.slice(open, at) }
    : undefined;
};

/**
 * One citation: where its word stands, whether the word is plural, whether its form is a citation's
 * alone, whether a digit follows it, and the slugs it names in order.
 */
interface Citation {
  readonly at: number;
  readonly byNumber: boolean;
  readonly formal: boolean;
  readonly slugs: readonly string[];
}

/**
 * Read the slugs a plural citation's list names after its first: each joined by a comma, `and` or
 * `or`.
 *
 * @param text - The text.
 * @param from - Where the first slug ends.
 * @returns The slugs that follow, in order.
 */
const listedAfter = (text: string, from: number): readonly string[] => {
  const comma = text.charAt(from) === ",";
  const afterComma = pastGap(text, comma ? from + 1 : from);
  const conjunction = ["and", "or"].find(
    (word) =>
      text.startsWith(word, afterComma) && !wordCharacter(text.charAt(afterComma + word.length)),
  );
  if (!comma && (conjunction === undefined || afterComma === from)) {
    return [];
  }

  const next =
    conjunction === undefined ? afterComma : pastGap(text, afterComma + conjunction.length);
  const named = tickedAt(text, next);

  return named === undefined ? [] : [named.slug, ...listedAfter(text, named.end)];
};

/**
 * Where the spaces before a place start: the place itself where none stands before it.
 *
 * @param text - The text.
 * @param before - The place.
 * @returns Where the spaces start.
 */
const pastGapBackwards = (text: string, before: number): number => {
  let at = before;
  while (text.charAt(at - 1) === " " || text.charAt(at - 1) === "\t") {
    at -= 1;
  }

  return at;
};

/**
 * Read the citation whose word's tail, `eading`, stands at a place, none where no word of a
 * citation stands there.
 *
 * @param text - The text.
 * @param at - Where `eading` stands.
 * @returns The citation, or none.
 */
const citationAt = (text: string, at: number): Citation | undefined => {
  const word = at - 1;
  const plural = text.charAt(at + 6) === "s";
  const end = at + (plural ? 7 : 6);
  if (
    !"Rr".includes(text.charAt(word)) ||
    wordCharacter(text.charAt(word - 1)) ||
    wordCharacter(text.charAt(end))
  ) {
    return undefined;
  }

  const next = pastGap(text, end);
  const named = next > end ? tickedAt(text, next) : undefined;
  const before = pastGapBackwards(text, word);

  return {
    at: word,
    byNumber: next > end && digit(text.charAt(next)),
    formal:
      plural ||
      text.charAt(word - 1) === "(" ||
      (before >= 4 && text.slice(before - 4, before).toLowerCase() === "spec"),
    slugs: named === undefined ? [] : [named.slug, ...(plural ? listedAfter(text, named.end) : [])],
  };
};

/**
 * Every citation of a text, in order.
 *
 * @param text - The text.
 * @returns The citations.
 */
const citationsIn = (text: string): readonly Citation[] => {
  const found: Citation[] = [];
  for (let at = text.indexOf("eading", 1); at >= 1; at = text.indexOf("eading", at + 1)) {
    const cited = citationAt(text, at);
    if (cited !== undefined) {
      found.push(cited);
    }
  }

  return found;
};

/**
 * The slugs the register's readings bear: each line `N. [`slug`] **`.
 *
 * @param register - The register's text.
 * @returns The slugs.
 */
const slugsOf = (register: string): ReadonlySet<string> =>
  new Set(
    register.split("\n").flatMap((line): readonly string[] => {
      let digits = 0;
      while (digit(line.charAt(digits))) {
        digits += 1;
      }

      const named =
        digits > 0 && line.startsWith(". [", digits) ? tickedAt(line, digits + 3) : undefined;

      return named !== undefined && line.startsWith("] **", named.end) ? [named.slug] : [];
    }),
  );

/**
 * Every text file git tracks, by its path from the root, with its text: a file whose bytes hold a
 * NUL, or that is not UTF-8, is no text and cites nothing.
 *
 * @returns The files.
 */
const trackedTexts = (): readonly (readonly [string, string])[] =>
  execFileSync("git", ["ls-files", "-z"], { cwd: root, encoding: "utf-8" })
    .split("\0")
    .filter(
      (file) =>
        file !== "" &&
        statSync(path.join(root, file), { throwIfNoEntry: false })?.isFile() === true,
    )
    .flatMap((file): readonly (readonly [string, string])[] => {
      const bytes = readFileSync(path.join(root, file));
      if (bytes.includes(0)) {
        return [];
      }

      const text = new TextDecoder("utf-8", { fatal: false }).decode(bytes);

      return text.includes("�") ? [] : [[file, text]];
    });

/**
 * The line of a file a position stands on, from 1.
 *
 * @param text - The file's text.
 * @param at - The position.
 * @returns The line.
 */
const lineOf = (text: string, at: number): number => text.slice(0, at).split("\n").length;

describe("reading citations", () => {
  it("cite each reading by a slug the register holds, and none by a number", () => {
    const files = trackedTexts();
    const slugs = slugsOf(files.find(([file]) => file === "docs/spec-readings.md")?.[1] ?? "");
    assert.isAbove(slugs.size, 0, "docs/spec-readings.md names its readings by slug");

    const cited = files.flatMap(([file, text]) =>
      citationsIn(text).map((citation) => ({
        citation,
        where: `${file}:${String(lineOf(text, citation.at))}`,
      })),
    );
    const numbered = cited.filter(({ citation }) => citation.byNumber).map(({ where }) => where);
    const dangling = cited.flatMap(({ citation, where }) =>
      citation.formal
        ? citation.slugs.filter((slug) => !slugs.has(slug)).map((slug) => `${where} ${slug}`)
        : [],
    );

    assert.deepStrictEqual(numbered, [], "a reading is cited by its slug, never by a number");
    assert.deepStrictEqual(
      dangling,
      [],
      "every slug a citation's own form names is one docs/spec-readings.md holds",
    );
  });
});
