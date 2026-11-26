/**
 * The unit vocabulary as the quantity operators look it up: a spelling's unit, the first row of its
 * key deciding, and the unit a written unit names.
 *
 * @module
 */
import { regex } from "arkregex";
import { folded, lengthOf, whiteSpace } from "#processing/alpha/text.ts";
import { letterUnits, unitSpellings } from "#processing/alpha/vocabulary/units.ts";
import type { Unit } from "#processing/alpha/vocabulary/units.ts";

/**
 * A table's map from key to value, the first row of each key deciding.
 *
 * @param rows - The table's rows, in order.
 * @returns The map.
 */
export const firstRows = <V>(rows: readonly (readonly [string, V])[]): ReadonlyMap<string, V> => {
  const map = new Map<string, V>();
  for (const [key, value] of rows) {
    if (!map.has(key)) {
      map.set(key, value);
    }
  }

  return map;
};

/**
 * Each spelling's unit.
 */
export const unitOfSpelling: ReadonlyMap<string, Unit> = firstRows(unitSpellings);

/**
 * Each letter's unit.
 */
const unitOfLetter: ReadonlyMap<string, Unit> = firstRows(letterUnits);

/**
 * White space around a `^`.
 */
const spacedCaret = regex(`[${whiteSpace}]*\\^[${whiteSpace}]*`, "gu");

/**
 * A final `.`.
 */
const finalPoint = regex("[.]$", "u");

/**
 * The unit a written unit names: the unit table's for the text folded, white space around `^`
 * removed and a final `.` ignored; else the letter units' for a one-letter text; none for none.
 *
 * @param written - The written unit.
 * @returns Its unit, or none.
 */
export const unitOf = (written: string): Unit | undefined => {
  const key = folded(written).replace(spacedCaret, "^");

  return (
    unitOfSpelling.get(key) ??
    unitOfSpelling.get(key.replace(finalPoint, "")) ??
    (lengthOf(written) === 1 ? unitOfLetter.get(key) : undefined)
  );
};
