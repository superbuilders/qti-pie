/**
 * `phrase-distance(text, phrases, words)` (composable-operators.md §2.3 P10): how far a typed
 * phrase is from the nearest accepted phrase, by AlphaTest's noun rule. Per phrase of as many words
 * as the text: each typed word equal to the phrase's, both singularised (a measure is folded only),
 * or, where the phrase's word is its head or one plain word of the question's (`words`), a noun
 * typo of it; the value is the greatest typo distance used, 0 for none, and no value where a word
 * is neither. Else 0 where the text is one word that is the phrase's words run together
 * (`peachtrees`). The least value over the phrases, none for none; none where the text holds a
 * character outside its words.
 *
 * A noun typo of an accepted word (AlphaTest's isTypoOf and headVariant's glue test) is
 * `typo(typed, target)`, unless
 *
 * - Typed exactly: the typed word is a unit spelling, a place-value or fraction word or an operation
 *   word, and none of the target's own spellings ("3 tenths" for tents, "6 squared" for squares);
 * - A competitor, other than the target's own spellings, equals the typed word or shares its first
 *   letter at OSA distance at most the typo's: the question's words and the operation words, and
 *   the place-value and fraction words and the unit words each when one of their list is the
 *   target's own or one of the question's words;
 * - Glued: the typed word splits into two non-empty parts, one the target's own spelling and the
 *   other an extra word (a stop word, a verb, a unit spelling, or one of the question's words of
 *   three or more letters), in either order (`caterpillarsto`, `kgkilograms`).
 *
 * @module
 */
import { regex } from "arkregex";
import { byFirstCharacter, charsOf, folded, head, whiteSpace } from "#processing/alpha/text.ts";
import { editDistance, typoDistance } from "#processing/alpha/typo.ts";
import { firstRows, unitOfSpelling } from "#processing/alpha/units.ts";
import { unitWords } from "#processing/alpha/vocabulary/units.ts";
import {
  ieNouns,
  irregularPlurals,
  neverPluralWords,
  operationWords,
  placeValueWords,
  stopWords,
  verbs,
} from "#processing/alpha/vocabulary/words.ts";
import { wordsLiteral } from "#processing/alpha/literals.ts";
import { alphaDefinitionPrefix, inlineOperator } from "#processing/operator.ts";
import type { Value } from "#processing/value.ts";
import { nullOf, single } from "#processing/value.ts";

/**
 * Each irregular plural's singular.
 */
const singularOf: ReadonlyMap<string, string> = firstRows(irregularPlurals);

/**
 * The `-ie` nouns.
 */
const ie: ReadonlySet<string> = new Set(ieNouns);

/**
 * The words in `s` that are no plural.
 */
const neverPlural: ReadonlySet<string> = new Set(neverPluralWords);

/**
 * The operation words.
 */
const operation: ReadonlySet<string> = new Set(operationWords);

/**
 * The place-value and fraction words.
 */
const contrast: ReadonlySet<string> = new Set(placeValueWords);

/**
 * The stop words and the verbs: what a noun glued to one is no typo of.
 */
const extra: ReadonlySet<string> = new Set([...stopWords, ...verbs]);

/**
 * A final `ies`.
 */
const iesEnd = regex("ies$", "u");

/**
 * A final sibilant plural.
 */
const sibilantEnd = regex("(ch|sh|x|ss)es$", "u");

/**
 * A final `s`.
 */
const sEnd = regex("s$", "u");

/**
 * A final `ss`.
 */
const ssEnd = regex("ss$", "u");

/**
 * The English singular of a folded word: its irregular singular, then `ies` to `y` unless it is an
 * `-ie` noun, then `(ch|sh|x|ss)es` to the stem, then a final `s` dropped unless it is no plural or
 * ends in `ss`.
 *
 * @param word - The word.
 * @returns Its singular.
 */
const singular = (word: string): string => {
  const irregular = singularOf.get(word);
  if (irregular !== undefined) {
    return irregular;
  }

  if (iesEnd.test(word) && !ie.has(word)) {
    return word.replace(iesEnd, "y");
  }

  if (sibilantEnd.test(word)) {
    return word.replace(sibilantEnd, "$1");
  }

  return sEnd.test(word) && !ssEnd.test(word) && !neverPlural.has(word) ? head(word, -1) : word;
};

/**
 * A phrase's lexemes: a measure, a run of ASCII letters, a run of separators, or any other one
 * character.
 */
const lexemes = regex(`[0-9]+(?:[.][0-9]+)?-[A-Za-z]+|[A-Za-z]+|[${whiteSpace}-]+|.`, "gsu");

/**
 * A lexeme that is a measure, a word or a separator.
 */
const wordOrSeparator = regex(
  `^(?:[0-9]+(?:[.][0-9]+)?-[A-Za-z]+|[A-Za-z]+|[${whiteSpace}-]+)$`,
  "u",
);

/**
 * A measure or word first.
 */
const wordFirst = regex("^[0-9A-Za-z]", "u");

/**
 * A digit first.
 */
const digitFirst = regex("^[0-9]", "u");

/**
 * A phrase's words, each folded, in order: a measure (digits with an optional fraction, one hyphen,
 * letters: 5-pound) is one word, every other word a maximal run of ASCII letters, white space and
 * hyphens separating them; none where the phrase holds anything else, a digit outside a measure
 * among it.
 *
 * @param text - The phrase.
 * @returns Its words.
 */
const wordsOf = (text: string): readonly string[] => {
  const all = Array.from(text.matchAll(lexemes), (m) => m[0]);

  return all.every((lx) => wordOrSeparator.test(lx))
    ? all.filter((lx) => wordFirst.test(lx)).map(folded)
    : [];
};

/**
 * A word's comparison form: a measure as it is, any other word its singular.
 *
 * @param word - The word.
 * @returns Its form.
 */
const formOf = (word: string): string => (digitFirst.test(word) ? word : singular(word));

/**
 * A list of competitor words as a noun typo reads it, its facts stored once: the words, their
 * singulars, the units they spell, and the words by their first character. A list competes with a
 * target when one of its words is the target's own (its singular is the target's, or it spells the
 * target's unit) or one of the question's words, and then only its words of the typed word's first
 * character can veto, since a veto keeps the first letter.
 */
interface RivalList {
  readonly byFirst: ReadonlyMap<string, readonly string[]>;
  readonly singulars: ReadonlySet<string>;
  readonly units: ReadonlySet<string>;
  readonly words: ReadonlySet<string>;
}

/**
 * A competitor list's stored facts.
 *
 * @param words - The list's words.
 * @returns Its facts.
 */
const rivalList = (words: readonly string[]): RivalList => ({
  byFirst: byFirstCharacter(words),
  singulars: new Set(words.map(singular)),
  units: new Set(
    words.flatMap((word) => {
      const unit = unitOfSpelling.get(word);

      return unit === undefined ? [] : [unit];
    }),
  ),
  words: new Set(words),
});

/**
 * The place-value and fraction words, as a competitor list.
 */
const placeValueRivals = rivalList(placeValueWords);

/**
 * The unit words, as a competitor list.
 */
const unitWordRivals = rivalList(unitWords);

/**
 * A noun typo of an accepted word, or none.
 *
 * @param typed - The typed word.
 * @param target - The accepted word.
 * @param asked - The question's words, folded.
 * @returns The typo's distance, or none.
 */
const nounTypo = (
  typed: string,
  target: string,
  asked: ReadonlySet<string>,
): number | undefined => {
  const d = typoDistance(typed, target);
  if (d === undefined) {
    return undefined;
  }

  const one = singular(target);
  const unit = unitOfSpelling.get(target);
  const own = (word: string): boolean =>
    singular(word) === one || (unit !== undefined && unitOfSpelling.get(word) === unit);
  if ((unitOfSpelling.has(typed) || contrast.has(typed) || operation.has(typed)) && !own(typed)) {
    return undefined;
  }

  const first = head(typed, 1);
  const meets = (list: RivalList): boolean =>
    list.singulars.has(one) ||
    (unit !== undefined && list.units.has(unit)) ||
    [...asked].some((y) => list.words.has(y));
  const rivals = [
    ...asked,
    ...operationWords,
    ...(meets(placeValueRivals) ? (placeValueRivals.byFirst.get(first) ?? []) : []),
    ...(meets(unitWordRivals) ? (unitWordRivals.byFirst.get(first) ?? []) : []),
  ];
  if (
    rivals.some(
      (c) => (c === typed || (head(c, 1) === first && editDistance(typed, c, d) <= d)) && !own(c),
    )
  ) {
    return undefined;
  }

  const chars = charsOf(typed);
  const isExtra = (word: string): boolean =>
    extra.has(word) || unitOfSpelling.has(word) || (charsOf(word).length >= 3 && asked.has(word));
  for (let n = 1; n < chars.length; n += 1) {
    const a = chars.slice(0, n).join("");
    const b = chars.slice(n).join("");
    if ((own(a) && isExtra(b)) || (own(b) && isExtra(a))) {
      return undefined;
    }
  }

  return d;
};

/**
 * How far a typed phrase is from the nearest accepted phrase.
 *
 * @param text - The typed phrase.
 * @param phrases - The accepted phrases.
 * @param words - The question's plain words.
 * @returns The least distance, or none.
 */
export const phraseDistance = (
  text: string,
  phrases: readonly string[],
  words: readonly string[],
): number | undefined => {
  const typed = wordsOf(text);
  if (typed.length === 0) {
    return undefined;
  }

  const typedForms = typed.map(formOf);
  const asked: ReadonlySet<string> = new Set(words.map(folded));
  let best: number | undefined;
  for (const accepted of phrases) {
    const target = wordsOf(accepted);
    if (target.length === 0) {
      continue;
    }

    const targetForms = target.map(formOf);
    let v: number | undefined;
    if (typed.length === target.length) {
      v = 0;
      for (const [i, word] of typed.entries()) {
        const aim = target[i] ?? "";
        if (typedForms[i] === targetForms[i]) {
          continue;
        }

        const d =
          !digitFirst.test(aim) && (i === target.length - 1 || asked.has(aim))
            ? nounTypo(word, aim, asked)
            : undefined;
        if (d === undefined) {
          v = undefined;
          break;
        }

        v = Math.max(v, d);
      }
    }

    if (v === undefined && typed.length === 1 && typedForms[0] === targetForms.join("")) {
      v = 0;
    }

    if (v !== undefined && (best === undefined || v < best)) {
      best = v;
    }
  }

  return best;
};

/**
 * The `phrase-distance` operator's registry entry.
 */
export const phraseDistanceOperator = inlineOperator({
  apply: ([text, phrases, words]) => {
    const distance = phraseDistance(text.value, phrases, words);

    return distance === undefined
      ? nullOf({ base: "integer", cardinality: "single" })
      : single("integer", BigInt(distance));
  },
  definition: `${alphaDefinitionPrefix}phrase-distance`,
  operands: [
    { form: "expression", name: "text", type: { base: "string", cardinality: "single" } },
    {
      form: "literal",
      name: "phrases",
      parse: (value: Value) => wordsLiteral(value),
      type: { base: "string", cardinality: "multiple" },
    },
    {
      form: "literal",
      name: "words",
      parse: (value: Value) => wordsLiteral(value),
      type: { base: "string", cardinality: "multiple" },
    },
  ],
  result: { base: "integer", cardinality: "single" },
});
