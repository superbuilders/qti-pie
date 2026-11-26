/**
 * The vocabulary's own laws, over every one of its keys and units: every key is folded as a typed
 * text is before it is looked up (QTI's case fold, the one `case-sensitive="false"` applies), so no
 * row is unreachable; a key's first row decides, so none repeats within its list; every unit is a
 * QTI identifier (an NCName of at most 32 characters, no period, ASI §7.16 and Table 7.16), so a
 * unit holds no `:`.
 */
import { regex } from "arkregex";
import { assert, describe, it } from "@effect/vitest";
import { everyMember } from "#processing/test/exhausted.ts";
import { folded } from "#processing/alpha/text.ts";
import {
  letterUnits,
  unitSpellings,
  unitTypoTargets,
  unitWords,
} from "#processing/alpha/vocabulary/units.ts";
import {
  glueWords,
  ieNouns,
  irregularPlurals,
  measureWords,
  neverPluralWords,
  operationWords,
  placeValueWords,
  stopWords,
  verbs,
} from "#processing/alpha/vocabulary/words.ts";

/**
 * Every list of the vocabulary's keys, by name.
 */
const keyLists: readonly [
  readonly [string, readonly string[]],
  ...(readonly [string, readonly string[]])[],
] = [
  ["unitSpellings", unitSpellings.map(([spelling]) => spelling)],
  ["letterUnits", letterUnits.map(([letter]) => letter)],
  ["unitTypoTargets", unitTypoTargets],
  ["unitWords", unitWords],
  ["glueWords", glueWords],
  ["placeValueWords", placeValueWords],
  ["operationWords", operationWords],
  ["irregularPlurals", irregularPlurals.map(([plural]) => plural)],
  ["ieNouns", ieNouns],
  ["neverPluralWords", neverPluralWords],
  ["stopWords", stopWords],
  ["verbs", verbs],
  ["measureWords", measureWords],
];

/**
 * Every key of the vocabulary, with its list's name.
 */
const keys = keyLists.flatMap(([list, entries]) => entries.map((key) => ({ key, list })));

/**
 * Every unit the vocabulary names.
 */
const units: readonly string[] = [
  ...new Set([...unitSpellings, ...letterUnits].map(([, unit]) => unit)),
];

/**
 * A QTI identifier with no period: an NCName of at most 32 characters.
 */
const identifier = regex("^[\\p{L}_][\\p{L}\\p{N}_-]{0,31}$", "u");

/**
 * What the laws are checked against.
 */
const oracle = "QTI 3.0.1 ASI §7.16 and Table 7.16 (identifiers), qti-string-match's case fold";

describe("the vocabulary", () => {
  it.effect("keys every row by a folded text", (ctx) =>
    everyMember(
      ctx,
      {
        box: "every key of every list",
        members: [{ key: unitSpellings[0][0], list: "unitSpellings" }, ...keys.slice(1)],
        oracle,
        suite: "processing/alpha/vocabulary-folded",
      },
      ({ key, list }) => {
        assert.strictEqual(folded(key), key, list);
      },
    ),
  );

  it.effect("repeats no key within a list", (ctx) =>
    everyMember(
      ctx,
      { box: "every list", members: keyLists, oracle, suite: "processing/alpha/vocabulary-unique" },
      ([list, entries]) => {
        assert.strictEqual(new Set(entries).size, entries.length, list);
      },
    ),
  );

  it.effect("names every unit by a QTI identifier", (ctx) =>
    everyMember(
      ctx,
      {
        box: "every unit a spelling or a letter names",
        members: [unitSpellings[0][1], ...units.slice(1)],
        oracle,
        suite: "processing/alpha/vocabulary-units",
      },
      (unit) => {
        assert.isTrue(identifier.test(unit), unit);
      },
    ),
  );
});
