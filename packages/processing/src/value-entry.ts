/**
 * `@qti-pie/processing/value.ts`: QTI's values alone, the entry a page loads. The value model, its
 * constructors and comparisons, and the lexical reader and writer of every base type; nothing of
 * the compiler, the evaluator or the grade, so processing's whole index never reaches a page.
 *
 * @module
 */
export type {
  BaseType,
  Container,
  ContainerCardinality,
  ContainerOf,
  DirectedPair,
  NonEmpty,
  Null,
  Pair,
  Point,
  Present,
  QtiFile,
  RecordField,
  RecordValue,
  Scalars,
  ValueType,
  Single,
  SingleOf,
  Text,
  Value,
} from "#processing/value.ts";

export {
  baseTypes,
  container,
  isText,
  nullOf,
  recordOf,
  sameScalar,
  sameSingle,
  sameValueType,
  valueTypeOf,
  single,
  singlesOf,
  textValue,
} from "#processing/value.ts";

export type { LexicalRead, Writable } from "#processing/lexical.ts";

export { readValue, writeValue } from "#processing/lexical.ts";
