/**
 * `quantity` (composable-operators.md §2.3 P8): AlphaTest's NUMBER_THEN_REST
 * (number-with-unit.util.ts:104), white space allowed between its parts: an optional `$`, an
 * optional sign, an optional `$`, then the numeral, digits with optional comma grouping by threes
 * and an optional decimal fraction, or a decimal fraction alone (`.5`), with an optional exponent,
 * then the rest. `value` is the numeral's binary64 value, commas removed (read-number's reading,
 * which is ECMAScript's over a numeral); `rest` normalize-space of what follows with the white
 * space after a `°` deleted (`° F` is `°F`), none for nothing; `unit` the unit `rest` names, else
 * `usd` where a `$` was written and nothing follows. None where no numeral leads, or where a `$` is
 * written and `rest` is neither absent nor a usd spelling, whatever its unit (`$15 cents`, `$5X`: a
 * `$` before algebra is no quantity). The numeral is the longest at its place.
 *
 * @module
 */
import { regex } from "arkregex";
import { normalizeSpace } from "#processing/alpha/operators/normalize-space.ts";
import { whiteSpace } from "#processing/alpha/text.ts";
import { unitOf } from "#processing/alpha/units.ts";
import type { Unit } from "#processing/alpha/vocabulary/units.ts";
import { alphaDefinitionPrefix, inlineOperator } from "#processing/operator.ts";
import { nullOf, recordOf, single, textValue } from "#processing/value.ts";
import type { Null, RecordValue } from "#processing/value.ts";

/**
 * A quantity: its numeral's value, the unit its rest names, and its rest.
 */
export interface Quantity {
  readonly rest: string | undefined;
  readonly unit: Unit | undefined;
  readonly value: number;
}

/**
 * A leading numeral and the rest: `$`, sign, `$`, numeral, rest.
 */
const numberThenRest = regex(
  `^([$]?)[${whiteSpace}]*([+-]?)[${whiteSpace}]*([$]?)[${whiteSpace}]*((?:(?:[0-9]{1,3}(?:,[0-9]{3})+|[0-9]+)(?:[.][0-9]+)?|[.][0-9]+)(?:[eE][-+]?[0-9]+)?)(.*)$`,
  "su",
);

/**
 * A degree sign and the white space after it.
 */
const spacedDegree = regex(`°[${whiteSpace}]+`, "gu");

/**
 * The unit a quantity with no rest names: the dollar where a `$` was written, ISO 4217's USD.
 *
 * @param dollar - Whether a `$` was written.
 * @returns The unit, or none.
 */
const dollarUnit = (dollar: boolean): Unit | undefined => (dollar ? "usd" : undefined);

/**
 * A text's quantity.
 *
 * @param text - The text.
 * @returns Its quantity, or none.
 */
export const quantity = (text: string): Quantity | undefined => {
  const m = numberThenRest.exec(text);
  if (m === null) {
    return undefined;
  }

  const [, leading = "", sign = "", inner = "", numeral = "", after = ""] = m;
  const dollar = leading === "$" || inner === "$";
  const normalized = normalizeSpace(after.replace(spacedDegree, "°"));
  const rest = normalized === "" ? undefined : normalized;
  const unit = rest === undefined ? dollarUnit(dollar) : unitOf(rest);
  if (dollar && rest !== undefined && unit !== "usd") {
    return undefined;
  }

  return { rest, unit, value: Number(`${sign === "-" ? "-" : ""}${numeral.replaceAll(",", "")}`) };
};

/**
 * A quantity as its record: `value`, and `unit` and `rest` where it has them.
 *
 * @param read - The quantity.
 * @returns Its record.
 */
const quantityRecord = (read: Quantity): Null | RecordValue => {
  const unit =
    read.unit === undefined
      ? nullOf({ base: "identifier", cardinality: "single" })
      : textValue("identifier", read.unit);
  const rest =
    read.rest === undefined
      ? nullOf({ base: "string", cardinality: "single" })
      : textValue("string", read.rest);

  return recordOf([
    { name: "value", value: single("float", read.value) },
    ...(unit.kind === "null" ? [] : [{ name: "unit", value: unit }]),
    ...(rest.kind === "null" ? [] : [{ name: "rest", value: rest }]),
  ]);
};

/**
 * The `quantity` operator's registry entry.
 */
export const quantityOperator = inlineOperator({
  apply: ([text]) => {
    const read = quantity(text.value);

    return read === undefined ? nullOf({ cardinality: "record" }) : quantityRecord(read);
  },
  definition: `${alphaDefinitionPrefix}quantity`,
  operands: [{ form: "expression", name: "text", type: { base: "string", cardinality: "single" } }],
  result: { cardinality: "record" },
});
