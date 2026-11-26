/**
 * `@qti-pie/processing`: QTI 3.0.1 processing as a pure function. It reads no clock, draws no
 * ambient randomness and performs no I/O: seeds and instants are arguments, and its one grade is a
 * {@link Graded} result the evaluator mints.
 *
 * @module
 */
export type { Digest, GradeProof, Instant, ResponsesRead } from "#processing/graded.ts";

export { proofOf } from "#processing/grade.ts";

export {
  compileItem,
  compileTest,
  gradeAnswer,
  gradeSitting,
  regrade,
  takeItem,
  templateDefaults,
} from "#processing/entries.ts";

export type {
  ArgumentsOf,
  CustomOperator,
  InlineOperator,
  OperandSpec,
  PresentOf,
  RecordedOperator,
  ResultOf,
  ResultSpec,
  TypeSpec,
} from "#processing/operator.ts";

export { alphaDefinitionPrefix, inlineOperator, recordedOperator } from "#processing/operator.ts";

export type { Definition } from "#processing/registry.ts";

export { customOperatorOf, customOperators, registered } from "#processing/registry.ts";

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
  sameValueType,
  valueTypeOf,
  single,
  textValue,
} from "#processing/value.ts";

export type { Credit, Mark } from "#processing/credit.ts";

export type {
  AnswerGrade,
  Graded,
  AnswerInput,
  CarriedMember,
  ClosingMember,
  ItemSession,
  MemberGrade,
  MemberRef,
  SittingGrade,
  SittingInput,
  Submitted,
} from "#processing/grade.ts";

export type {
  CompiledItem,
  CompiledItemRef,
  CompiledTest,
  Declaration,
  LookupTable,
} from "#processing/program.ts";

export type { Demand, ProcessingFailure } from "#processing/run.ts";

export type { Failed, ItemResult, Prior, Take } from "#processing/session.ts";

export type { Seed } from "#processing/stream.ts";

export { processingSeed, responseLabel, templateLabel } from "#processing/stream.ts";

export type { XmlAttribute, XmlElement, XmlNode } from "#processing/xml.ts";

export type { Admission } from "#processing/admission.ts";

export type { Checked, Refusal, RefusalCode } from "#processing/operators/operator.ts";
