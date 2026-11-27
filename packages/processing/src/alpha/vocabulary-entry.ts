/**
 * `@qti-pie/processing/alpha/vocabulary.ts`: Alpha's vocabulary, the lists its operators read, as
 * they stand in the package (`#processing/alpha/vocabulary/`), never a second copy.
 *
 * @module
 */
export {
  letterUnits,
  unitSpellings,
  unitTypoTargets,
  unitWords,
} from "#processing/alpha/vocabulary/units.ts";

export type { Unit } from "#processing/alpha/vocabulary/units.ts";

export {
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
