/**
 * The spec readings as `docs/spec-readings.md` states them today: each reading by its slug, the
 * permanent name every citation names it by. A reading's list number is only its position, which
 * nothing cites, so a reading added elsewhere at the same time never renumbers one a lane or a host
 * already cites. A test that records a disagreement against a reading holds the record to the
 * reading's own words, so a reading rewritten or withdrawn so that it no longer says what the
 * record cites turns the record stale, where its slug alone would still resolve.
 */
import { regex } from "arkregex";
import path from "node:path";
import { Effect, FileSystem, Option } from "effect";

/**
 * `docs/spec-readings.md`, at the repository's root.
 */
const readingsPath = path.resolve(
  import.meta.dirname,
  "..",
  "..",
  "..",
  "..",
  "docs",
  "spec-readings.md",
);

/**
 * One reading of the register: its slug, its position (the number its list item shows), and its
 * text, every run of whitespace written as one space, so a sentence the document wraps across lines
 * reads as written.
 */
export interface Reading {
  readonly position: number;
  readonly slug: string;
  readonly text: string;
}

/**
 * The register as a test reads it: its readings in document order, and each top-level list item
 * that is no reading head, which pantry's census refuses.
 */
export interface Register {
  readonly malformed: readonly string[];
  readonly readings: readonly Reading[];
}

/**
 * The digits that start a line, as many as there are.
 *
 * @param line - The line.
 * @returns How many characters of digits it starts with.
 */
const digitsAt = (line: string): number => {
  let end = 0;
  while (end < line.length && "0123456789".includes(line.charAt(end))) {
    end += 1;
  }

  return end;
};

/**
 * Whether a character may stand in a slug: a lower-case ASCII letter, a digit or a hyphen.
 *
 * @param character - The character.
 * @returns Whether it may.
 */
const slugCharacter = (character: string): boolean =>
  (character >= "a" && character <= "z") ||
  (character >= "0" && character <= "9") ||
  character === "-";

/**
 * Whether a text is a slug: a lower-case letter first, then letters, digits and single hyphens, no
 * hyphen last.
 *
 * @param text - The text.
 * @returns Whether it is.
 */
const isSlug = (text: string): boolean =>
  text.charAt(0) >= "a" &&
  text.charAt(0) <= "z" &&
  !text.endsWith("-") &&
  !text.includes("--") &&
  text.split("").every(slugCharacter);

/**
 * A top-level list item's head: its position, and its slug where it is a reading's.
 */
interface Head {
  readonly position: number;
  readonly slug: Option.Option<string>;
}

/**
 * Read a top-level list item's head: its position, then `. `, and, for a reading, its slug in
 * brackets, then its bold headline (`N. [`slug`] **…`). A slug is lower-case letters and digits in
 * hyphen-joined runs, a letter first.
 *
 * @param line - The line.
 * @returns None for a line that is no top-level list item; else the item's head.
 */
const headOf = (line: string): Option.Option<Head> => {
  const digits = digitsAt(line);
  if (digits === 0 || !line.startsWith(". ", digits)) {
    return Option.none();
  }

  const position = Number(line.slice(0, digits));
  const open = digits + 2;
  const close = line.indexOf("`] **", open + 2);
  const slug = line.startsWith("[`", open) && close > open + 2 ? line.slice(open + 2, close) : "";

  return Option.some({ position, slug: Option.liftPredicate(slug, isSlug) });
};

/**
 * Split the readings document into its readings, in document order: each list item from its head
 * ({@link headOf}) to the next reading or heading. A top-level list item whose head is no reading's
 * is no reading of this form, which {@link registerOf}'s caller refuses.
 *
 * @param text - The document.
 * @returns Each reading, and each top-level list item that is not a reading head.
 */
export const registerOf = (text: string): Register => {
  const readings: { position: number; slug: string; lines: string[] }[] = [];
  const malformed: string[] = [];
  let current: string[] | undefined;
  for (const line of text.split("\n")) {
    const head = headOf(line);
    const slug = head.pipe(Option.flatMap(({ slug: named }) => named));
    if (Option.isSome(head) && Option.isSome(slug)) {
      current = [line];
      readings.push({ lines: current, position: head.value.position, slug: slug.value });
    } else if (Option.isSome(head)) {
      malformed.push(line);
      current = undefined;
    } else if (line.startsWith("#")) {
      current = undefined;
    } else {
      current?.push(line);
    }
  }

  return {
    malformed,
    readings: readings.map(({ lines, position, slug }) => ({
      position,
      slug,
      text: lines.join(" ").replaceAll(regex("\\s+", "gu"), " "),
    })),
  };
};

/**
 * Each reading's text, by its slug.
 *
 * @param text - The document.
 * @returns The texts.
 */
export const readingsOf = (text: string): ReadonlyMap<string, string> =>
  new Map(registerOf(text).readings.map(({ slug, text: said }) => [slug, said]));

/**
 * Read the register as the document states it now.
 *
 * @returns Its readings and its malformed list items.
 */
export const liveRegister = Effect.fn("test.liveRegister")(function* liveRegister() {
  const fs = yield* FileSystem.FileSystem;

  return registerOf(yield* fs.readFileString(readingsPath));
});

/**
 * Read the readings as the document states them now.
 *
 * @returns Each reading's text, by its slug.
 */
export const liveReadings = Effect.fn("test.liveReadings")(function* liveReadings() {
  const fs = yield* FileSystem.FileSystem;

  return readingsOf(yield* fs.readFileString(readingsPath));
});

/**
 * Whether a reading still says a sentence: the reading exists and its text holds the sentence,
 * whitespace read as {@link registerOf} reads it.
 *
 * @param readings - The readings, from {@link liveReadings}.
 * @param reading - The reading's slug.
 * @param says - The sentence.
 * @returns Whether it does.
 */
export const stillSays = (
  readings: ReadonlyMap<string, string>,
  reading: string,
  says: string,
): boolean => (readings.get(reading) ?? "").includes(says.replaceAll(regex("\\s+", "gu"), " "));
