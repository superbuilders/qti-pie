/**
 * `unit-near(text, words)` (composable-operators.md §2.3 P9): the unit a mistyped unit phrase most
 * nearly spells. The text, folded, is one or two words of three or more letters, a final `.`
 * ignored; none otherwise, or where it is a unit glued to another unit or to a glue word, or where
 * no typo target of its word count is near it word by word (each word 0 if equal, 1 if equal less a
 * final `es`/`s` of the typed word and a final `s` of the target's, else `typo(w, t)`; the greatest
 * of them). `distance` is the least such, `unit` its first candidate's in the targets' order;
 * `unit` is absent where a competitor of another unit (the unit words, the place-value and fraction
 * words, squared and cubed, and the item's `words`) equals the text or shares its first letter at
 * OSA distance at most `distance`.
 *
 * @module
 */
import { regex } from "arkregex";
import { byFirstCharacter, folded, head } from "#processing/alpha/text.ts";
import { editDistance, typoDistance } from "#processing/alpha/typo.ts";
import { unitOfSpelling } from "#processing/alpha/units.ts";
import { unitSpellings, unitTypoTargets, unitWords } from "#processing/alpha/vocabulary/units.ts";
import type { Unit } from "#processing/alpha/vocabulary/units.ts";
import { glueWords, operationWords, placeValueWords } from "#processing/alpha/vocabulary/words.ts";
import { wordsLiteral } from "#processing/alpha/literals.ts";
import { alphaDefinitionPrefix, inlineOperator } from "#processing/operator.ts";
import type { Value, Null, RecordValue } from "#processing/value.ts";
import { nullOf, recordOf, single, textValue } from "#processing/value.ts";

/**
 * The unit a mistyped phrase most nearly spells, absent where a competitor vetoes it, and how near.
 */
export interface UnitNear {
  readonly distance: number;
  readonly unit: Unit | undefined;
}

/**
 * A final `.`.
 */
const finalPoint = regex("[.]$", "u");

/**
 * One or two words of three letters or more.
 */
const phrase = regex("^[a-z]{3,}(?: [a-z]{3,})?$", "u");

/**
 * A typed word's final `es` or `s`.
 */
const typedPlural = regex("e?s$", "u");

/**
 * A target's final `s`.
 */
const targetPlural = regex("s$", "u");

/**
 * The glue words.
 */
const glue: ReadonlySet<string> = new Set(glueWords);

/**
 * Every spelling of a unit, and the glue words: what a glued run of letters is made of.
 */
const pieces: readonly (readonly [word: string, named: boolean])[] = [
  ...unitSpellings.map(([spelling]) => [spelling, true] as const),
  ...glueWords.map((word) => [word, false] as const),
];

/**
 * Whether a run of letters is a unit glued to another unit or to a glue word: a unit spelling or
 * glue word, then another, at least one of the two a unit.
 *
 * @param joined - The run.
 * @returns Whether it is glued.
 */
const isGlued = (joined: string): boolean =>
  pieces.some(
    ([word, named]) =>
      joined.length > word.length &&
      joined.startsWith(word) &&
      (unitOfSpelling.has(joined.slice(word.length)) ||
        (named && glue.has(joined.slice(word.length)))),
  );

/**
 * The competitors every text meets: the unit words, the place-value and fraction words, and the
 * operation words.
 */
const competitors = byFirstCharacter([...unitWords, ...placeValueWords, ...operationWords]);

/**
 * The typo targets by their first character, each in the targets' order.
 */
const targets = byFirstCharacter(unitTypoTargets);

/**
 * How near a typed word is a target's: 0 if equal, 1 if equal less a final `es`/`s` of the typed
 * word and a final `s` of the target's, else `typo(w, t)`.
 *
 * @param word - The typed word.
 * @param aim - The target's word.
 * @returns The distance, or none.
 */
const wordNearness = (word: string, aim: string): number | undefined => {
  if (word === aim) {
    return 0;
  }

  return word.replace(typedPlural, "") === aim.replace(targetPlural, "")
    ? 1
    : typoDistance(word, aim);
};

/**
 * How near a typed phrase is a target of as many words, word by word, or none where a word is near
 * by none.
 *
 * @param typed - The typed words.
 * @param target - The target's words.
 * @returns The greatest word's distance, or none.
 */
const nearness = (typed: readonly string[], target: readonly string[]): number | undefined => {
  let greatest = 0;
  for (const [o, word] of typed.entries()) {
    const aim = target[o] ?? "";
    const d = wordNearness(word, aim);
    if (d === undefined) {
      return undefined;
    }

    greatest = Math.max(greatest, d);
  }

  return greatest;
};

/**
 * The unit a typed phrase most nearly spells.
 *
 * @param text - The typed phrase.
 * @param words - The item's own competitors.
 * @returns The unit and its distance, or none.
 */
export const unitNear = (text: string, words: readonly string[]): UnitNear | undefined => {
  const typed = folded(text).replace(finalPoint, "");
  if (!phrase.test(typed) || isGlued(typed.replaceAll(" ", ""))) {
    return undefined;
  }

  const typedWords = typed.split(" ");
  let best: { readonly distance: number; readonly target: string } | undefined;
  const first = head(typed, 1);
  for (const target of targets.get(first) ?? []) {
    const targetWords = target.split(" ");
    if (targetWords.length !== typedWords.length) {
      continue;
    }

    const distance = nearness(typedWords, targetWords);
    if (distance !== undefined && (best === undefined || distance < best.distance)) {
      best = { distance, target };
    }
  }
  if (best === undefined) {
    return undefined;
  }

  const { distance, target } = best;
  const unit = unitOfSpelling.get(target);
  const vetoed = [...(competitors.get(first) ?? []), ...words.map(folded)].some(
    (c) =>
      (c === typed || (head(c, 1) === first && editDistance(typed, c, distance) <= distance)) &&
      unitOfSpelling.get(c) !== unit,
  );

  return { distance, unit: vetoed ? undefined : unit };
};

/**
 * A nearness as its record: `distance`, and `unit` where no competitor vetoes it.
 *
 * @param near - The nearness.
 * @returns Its record.
 */
const nearRecord = (near: UnitNear): Null | RecordValue => {
  const unit =
    near.unit === undefined
      ? nullOf({ base: "identifier", cardinality: "single" })
      : textValue("identifier", near.unit);

  return recordOf([
    { name: "distance", value: single("integer", BigInt(near.distance)) },
    ...(unit.kind === "null" ? [] : [{ name: "unit", value: unit }]),
  ]);
};

/**
 * The `unit-near` operator's registry entry.
 */
export const unitNearOperator = inlineOperator({
  apply: ([text, words]) => {
    const near = unitNear(text.value, words);

    return near === undefined ? nullOf({ cardinality: "record" }) : nearRecord(near);
  },
  definition: `${alphaDefinitionPrefix}unit-near`,
  operands: [
    { form: "expression", name: "text", type: { base: "string", cardinality: "single" } },
    {
      form: "literal",
      name: "words",
      parse: (value: Value) => wordsLiteral(value),
      type: { base: "string", cardinality: "multiple" },
    },
  ],
  result: { cardinality: "record" },
});
