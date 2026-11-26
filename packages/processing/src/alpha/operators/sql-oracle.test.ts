/**
 * Alpha's operators against the SQL grader they replace, on every content text it graded: the item
 * keys and accepted answers of `@metis/alphatest-operators`' corpus (its items.tsv and
 * box-accepted.tsv), each run through every inline operator that reads a text alone, and the
 * quantity rests of those keys through `unit-near` and `phrase-distance` with each box's own words
 * and phrases. The oracle is a real fixture with a known answer: `sql-oracle.fixtures.tsv` holds
 * what the SQL grader's `ledger.*` functions answered for each, recorded on the 1x copy on
 * 2026-11-26 with this package's vocabulary passed as their tables, before the SQL grader was
 * deleted. The answers students typed were measured the same way and are never recorded here.
 *
 * A row is the operator's class, the text, and three cells, `\N` for none: a text operator's
 * answer; math-canonical's `reduce` and its answer; read-number's double; quantity's value, unit
 * and rest (all `\N` for NULL); unit-near's words (joined by U+001F), distance and unit (`\N`
 * distance for NULL); phrase-distance's phrases and words (joined by U+001F) and distance.
 */
import { readFileSync } from "node:fs";
import { assert, describe, it } from "@effect/vitest";
import { alphaDefinitionPrefix } from "#processing/operator.ts";
import { customOperatorOf } from "#processing/registry.ts";
import { container, isText, nullOf, recordOf, single, textValue } from "#processing/value.ts";
import type { RecordField, SingleOf, Value } from "#processing/value.ts";

/**
 * A recorded cell: its text, or none for `\N`.
 */
type Cell = string | undefined;

/**
 * One recorded answer: the operator's class, the text, its literal operands as the document writes
 * them, and the value the SQL grader answered.
 */
interface Row {
  readonly expected: Value;
  readonly literals: readonly Value[];
  readonly operator: string;
  readonly text: SingleOf<"string">;
}

/**
 * The character an escape writes: `n`, `r` and `t` a line feed, carriage return and tab, any other
 * itself.
 *
 * @param c - The character after the backslash.
 * @returns The character it writes.
 */
const unescapedChar = (c: string): string => {
  switch (c) {
    case "n": {
      return "\n";
    }
    case "r": {
      return "\r";
    }
    case "t": {
      return "\t";
    }
    default: {
      return c;
    }
  }
};

/**
 * A recorded cell's text: `\N` none, else `\t`, `\n`, `\r` and `\\` unescaped.
 *
 * @param field - The cell as written.
 * @returns Its text, or none.
 */
const cellOf = (field: string): Cell => {
  if (field === "\\N") {
    return undefined;
  }

  let out = "";
  for (let i = 0; i < field.length; i += 1) {
    const c = field.charAt(i);
    if (c === "\\") {
      i += 1;
      out += unescapedChar(field.charAt(i));
    } else {
      out += c;
    }
  }

  return out;
};

/**
 * A text answer's value.
 *
 * @param cell - The answer.
 * @returns A string, or NULL.
 */
const stringOf = (cell: Cell): Value =>
  cell === undefined
    ? nullOf({ base: "string", cardinality: "single" })
    : textValue("string", cell);

/**
 * A list cell's strings, as a literal set.
 *
 * @param cell - The list, joined by U+001F.
 * @returns The set, NULL where it is empty.
 */
const setOf = (cell: Cell): Value =>
  container("multiple", "string", (cell ?? "").split("\u001F").filter(isText));

/**
 * A record's value from its fields, each present one kept.
 *
 * @param fields - The fields, each a value or none.
 * @returns The record.
 */
const recordFrom = (fields: readonly (RecordField | undefined)[]): Value =>
  recordOf(fields.filter((field): field is RecordField => field !== undefined));

/**
 * An identifier field, where the cell holds one.
 *
 * @param name - The field's name.
 * @param cell - The cell.
 * @returns The field, or none.
 */
const identifierField = (name: string, cell: Cell): RecordField | undefined => {
  const value = cell === undefined ? undefined : textValue("identifier", cell);

  return value?.kind === "single" ? { name, value } : undefined;
};

/**
 * A recorded row's operands and answer.
 *
 * @param operator - The operator's class.
 * @param text - The text.
 * @param cells - Its three cells.
 * @returns The row.
 */
const rowOf = (
  operator: string,
  text: SingleOf<"string">,
  [a, b, c]: readonly [Cell, Cell, Cell],
): Row => {
  switch (operator) {
    case "math-canonical": {
      return { expected: stringOf(b), literals: [single("boolean", a === "true")], operator, text };
    }
    case "read-number": {
      return {
        expected:
          a === undefined
            ? nullOf({ base: "float", cardinality: "single" })
            : single("float", Number(a)),
        literals: [],
        operator,
        text,
      };
    }
    case "quantity": {
      const rest = b === undefined && c !== undefined ? textValue("string", c) : stringOf(c);

      return {
        expected:
          a === undefined
            ? nullOf({ cardinality: "record" })
            : recordFrom([
                { name: "value", value: single("float", Number(a)) },
                identifierField("unit", b),
                rest.kind === "single" ? { name: "rest", value: rest } : undefined,
              ]),
        literals: [],
        operator,
        text,
      };
    }
    case "unit-near": {
      return {
        expected:
          b === undefined
            ? nullOf({ cardinality: "record" })
            : recordFrom([
                { name: "distance", value: single("integer", BigInt(b)) },
                identifierField("unit", c),
              ]),
        literals: [setOf(a)],
        operator,
        text,
      };
    }
    case "phrase-distance": {
      return {
        expected:
          c === undefined
            ? nullOf({ base: "integer", cardinality: "single" })
            : single("integer", BigInt(c)),
        literals: [setOf(a), setOf(b)],
        operator,
        text,
      };
    }
    default: {
      return { expected: stringOf(a), literals: [], operator, text };
    }
  }
};

/**
 * The recorded answers.
 */
const rows: readonly Row[] = readFileSync(
  new URL("sql-oracle.fixtures.tsv", import.meta.url),
  "utf-8",
)
  .split("\n")
  .slice(1)
  .filter((line) => line !== "")
  .flatMap((line) => {
    const [operator = "", input = "", a = "\\N", b = "\\N", c = "\\N"] = line.split("\t");
    const text = cellOf(input) ?? "";

    return isText(text)
      ? [rowOf(operator, single("string", text), [cellOf(a), cellOf(b), cellOf(c)])]
      : [];
  });

describe("Alpha's operators against the SQL grader's recorded answers", () => {
  it("records answers for every operator that reads a text", () => {
    assert.deepStrictEqual([...new Set(rows.map((row) => row.operator))].toSorted(), [
      "markup-text",
      "math-canonical",
      "normalize-space",
      "numeral-normal",
      "phrase-distance",
      "quantity",
      "read-number",
      "tex-normal",
      "unit-near",
    ]);
  });

  it("answers every recorded text exactly as the SQL grader did", () => {
    for (const row of rows) {
      const entry = customOperatorOf(`${alphaDefinitionPrefix}${row.operator}`);
      const bound = entry?.kind === "inline" ? entry.bind([undefined, ...row.literals]) : undefined;
      assert.deepStrictEqual(
        bound?.evaluate([row.text]),
        row.expected,
        `${row.operator} ${row.text.value}`,
      );
    }
  });
});
