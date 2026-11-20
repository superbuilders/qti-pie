/**
 * Every value a golden case holds, in one form that both graders can be compared in: a value's base
 * type, cardinality and singles, each single in its base type's lexical form as plate's `format`
 * writes it, and a record's fields.
 *
 * A golden value is representation-neutral on purpose: the database grader stores typed sidecars,
 * and the comparison reads both sides into this form, so it pins values, never a storage layout.
 *
 * @module
 */
import { format, isRecordValue } from "#plate/model/values.ts";
import type { RecordValue, ResponseValue, Value } from "#plate/model/values.ts";
import { fileFactsOf } from "#scripts/golden/files.ts";
import type { GoldenFileFacts } from "#scripts/golden/files.ts";

/**
 * A value as the golden data holds it: a non-record value's base type, cardinality and singles in
 * their lexical forms, in the order plate holds them, none for NULL; or a record's fields, each
 * with its own base type. A file value that holds files also holds each one's facts (`files`, from
 * `golden/files.ts`), in the same order as its singles; a NULL file value holds no facts and writes
 * no `files`, as the golden wrote it before files were posted.
 */
export type GoldenValue =
  | {
      readonly baseType: Value["baseType"];
      readonly cardinality: Value["cardinality"];
      readonly values: readonly string[];
    }
  | {
      readonly baseType: "file";
      readonly cardinality: Value["cardinality"];
      readonly files: readonly GoldenFileFacts[];
      readonly values: readonly string[];
    }
  | {
      readonly cardinality: "record";
      readonly fields: readonly (readonly [
        field: string,
        baseType: Value["baseType"],
        value: string,
      ])[];
    };

/**
 * Convert a record to its golden form, its fields in code-point order of their identifiers, since
 * a record's field order means nothing.
 *
 * @param record The record.
 * @returns Its golden form.
 */
const goldenRecord = (record: RecordValue): GoldenValue => ({
  cardinality: "record",
  fields: record.fields
    .map((field) => [field.identifier, field.value.baseType, format(field.value)] as const)
    .toSorted(([left], [right]) => Number(left > right) - Number(left < right)),
});

/**
 * Convert a value plate holds to its golden form.
 *
 * @param value The value, a record's among them.
 * @returns Its golden form.
 */
export const goldenOf = (value: ResponseValue): GoldenValue => {
  if (isRecordValue(value)) {
    return goldenRecord(value);
  }

  const plain = {
    baseType: value.baseType,
    cardinality: value.cardinality,
    values: value.values.map(format),
  };
  const files = value.values.flatMap((single) =>
    single.baseType === "file" ? [fileFactsOf(single.value)] : [],
  );

  return files.length === 0 ? plain : { ...plain, baseType: "file", files };
};

/**
 * Convert every value of a map of variables to its golden form, the variables in code-point order.
 *
 * @param values The values, by identifier.
 * @returns The golden values, by identifier, in code-point order.
 */
export const goldenMap = (
  values: Readonly<Record<string, ResponseValue>>,
): Readonly<Record<string, GoldenValue>> =>
  Object.fromEntries(
    Object.keys(values)
      .toSorted()
      .flatMap((identifier) => {
        const value = values[identifier];

        return value === undefined ? [] : [[identifier, goldenOf(value)] as const];
      }),
  );
