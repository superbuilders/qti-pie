/**
 * The built-in variables' types, stated from the specification for the tests that judge
 * `BuiltInVariable` and the references to it.
 */
import type { ValueBase, ValueCardinality } from "#pantry/grammar/expression.ts";

/**
 * The built-in variables each root holds, with the type a reference to one has (information model
 * §2.2.2, Item Variables, and §2.2.2.1, Context Variable; spec reading `duration-variable-type`):
 * an item's `numAttempts`, `duration` (a float of seconds), `completionStatus` and `QTI_CONTEXT`; a
 * test's or a section's `duration` (a duration) and `QTI_CONTEXT`. `test` marks the second. It
 * states again what references.ts's `builtIns` state, so a test can hold the installed rows to it.
 */
export const builtInTypes = [
  { baseType: "integer", cardinality: "single", test: false, variable: "numAttempts" },
  { baseType: "float", cardinality: "single", test: false, variable: "duration" },
  { baseType: "identifier", cardinality: "single", test: false, variable: "completionStatus" },
  { baseType: "unknown", cardinality: "record", test: false, variable: "QTI_CONTEXT" },
  { baseType: "duration", cardinality: "single", test: true, variable: "duration" },
  { baseType: "unknown", cardinality: "record", test: true, variable: "QTI_CONTEXT" },
] as const satisfies readonly {
  readonly baseType: ValueBase;
  readonly cardinality: ValueCardinality;
  readonly test: boolean;
  readonly variable: string;
}[];
