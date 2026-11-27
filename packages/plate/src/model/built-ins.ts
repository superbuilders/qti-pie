/**
 * The built-in variables: the variables QTI declares implicitly in an item, each with its kind and
 * its type, which every module that resolves, types or reserves a built-in reads.
 *
 * @module
 */
import { Option } from "effect";
import type { BaseType, Cardinality } from "#plate/vocabulary.ts";

/**
 * The kind of variable a built-in stands as: "There are two built-in response variables:
 * 'numAttempts' and 'duration'", "There is one built-in outcome variable, 'completionStatus'", and
 * "There is one built-in context variable: 'QTI_CONTEXT'" (section 2.2.2).
 */
export type BuiltInKind = "context" | "outcome" | "response";

/**
 * A built-in's type: its cardinality, and its base type, none for a record, which has no base type
 * of its own.
 */
export interface BuiltInType {
  readonly baseType: Option.Option<BaseType>;
  readonly cardinality: Cardinality;
}

/**
 * One built-in variable.
 */
export interface BuiltIn {
  /**
   * Its identifier, spelled exactly (reading `completion-status-name`).
   */
  readonly identifier: string;
  /**
   * The kind of variable it stands as.
   */
  readonly kind: BuiltInKind;
  /**
   * Its type.
   */
  readonly type: BuiltInType;
}

/**
 * The type of a built-in whose value is single: its base type, with the single cardinality.
 */
export interface SingleBuiltInType {
  readonly baseType: BaseType;
  readonly cardinality: "single";
}

/**
 * The built-ins an item builds in whose value is single, each with its type there:
 * `completionStatus` a single identifier, `duration` a single float and `numAttempts` a single
 * integer. The item model reads an item built-in's type here, by name.
 */
export const itemBuiltInTypes = {
  completionStatus: { baseType: "identifier", cardinality: "single" },
  duration: { baseType: "float", cardinality: "single" },
  numAttempts: { baseType: "integer", cardinality: "single" },
} as const satisfies Readonly<Record<string, SingleBuiltInType>>;

/**
 * A built-in an item builds in whose value is single: a key of {@link itemBuiltInTypes}.
 */
export type ItemBuiltIn = keyof typeof itemBuiltInTypes;

/**
 * The four values the built-in `completionStatus` may hold: "There are four permitted values"
 * (section 2.2.2.3), `completed`, `incomplete`, `not_attempted` and `unknown`. A rule that sets it
 * to any other fails its run, and the database refuses a literal outside them (reading
 * `completion-status-values`).
 */
export const completionStatusValues: ReadonlySet<string> = new Set<CompletionStatus>([
  "completed",
  "incomplete",
  "not_attempted",
  "unknown",
]);

/**
 * A value of the built-in `completionStatus`: one of its four ({@link completionStatusValues}).
 */
export type CompletionStatus = "completed" | "incomplete" | "not_attempted" | "unknown";

/**
 * Give a single built-in's type as the table's {@link BuiltInType}.
 *
 * @param type The single type.
 * @returns The table's type, its base type held.
 */
const single = (type: SingleBuiltInType): BuiltInType => ({
  baseType: Option.some(type.baseType),
  cardinality: type.cardinality,
});

/**
 * The record type of `QTI_CONTEXT`.
 */
const record: BuiltInType = { baseType: Option.none(), cardinality: "record" };

/**
 * The built-in variables, the one roster their names come from ({@link BuiltInName}).
 *
 * - `completionStatus`: "Delivery Engines must maintain the value of the built-in outcome variable
 *   completionStatus, a single identifier" (section 2.2.2.3), an item session's.
 * - `duration`: "a single float that records the accumulated time (in seconds) of all Candidate
 *   Sessions for all Attempts" in an item (section 2.2.2.2, reading `duration-variable-type`).
 * - `numAttempts`: "a single integer that records the number of attempts at each item the candidate
 *   has taken" (section 2.2.2.2), an item session's.
 * - `QTI_CONTEXT`: "There is one built-in context variable: 'QTI_CONTEXT', which has record
 *   cardinality", and "any references within an item or an assessment to the QTI_CONTEXT variable
 *   [...] must succeed" (section 2.2.2.1).
 */
const roster = [
  {
    identifier: "completionStatus",
    kind: "outcome",
    type: single(itemBuiltInTypes.completionStatus),
  },
  {
    identifier: "duration",
    kind: "response",
    type: single(itemBuiltInTypes.duration),
  },
  {
    identifier: "numAttempts",
    kind: "response",
    type: single(itemBuiltInTypes.numAttempts),
  },
  {
    identifier: "QTI_CONTEXT",
    kind: "context",
    type: record,
  },
] as const satisfies readonly BuiltIn[];

/**
 * The identifier of a built-in variable, one of {@link roster}'s.
 */
export type BuiltInName = (typeof roster)[number]["identifier"];

/**
 * The built-in variables, by identifier.
 */
export const builtIns: ReadonlyMap<string, BuiltIn> = new Map(
  roster.map((builtIn): readonly [string, BuiltIn] => [builtIn.identifier, builtIn]),
);
