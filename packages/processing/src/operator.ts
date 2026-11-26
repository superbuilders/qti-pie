/**
 * The interface every custom operator implements, and the registry entry it becomes.
 *
 * QTI 3.0.1 gives `qti-custom-operator` no semantics of its own: its `definition` URI names the
 * operator, and "an engine that does not know it gives NULL" (§5.37, reading 212). This package
 * knows exactly the operators `#processing/registry.ts` lists, each keyed by its `definition` URI
 * and never by redefining a QTI element; publication refuses any other (D10).
 *
 * Two kinds:
 *
 * - **inline**: a pure, total, synchronous function of its operands.
 * - **recorded**: an answer computed outside the evaluator (an AI rubric verdict) and handed in as
 *   input, read by the operator's place in the document. Where none is recorded the run records a
 *   demand and its result is Pending (D7, D8).
 *
 * An operand has one of two forms:
 *
 * - **expression**: computed at run time, of a declared type. QTI's NULL law covers it: a NULL
 *   expression operand gives NULL of the declared result type, and the function never sees one.
 * - **literal**: written as a `qti-base-value` or a `qti-null` and parsed when the document is
 *   compiled, by the module's own `parse`, which reads NULL as the module defines it (a NULL
 *   literal may mean the empty string or the empty set). A literal its `parse` refuses refuses the
 *   document at publication. The compiled program holds the parsed value, and the function is
 *   handed it.
 *
 * A module is written against its typed operands ({@link InlineOperator}); {@link inlineOperator}
 * turns it into the uniform {@link CustomOperator} entry the registry lists, which the compiler
 * binds to an element's literals ({@link InlineEntry.bind}) and the evaluator calls.
 *
 * @module
 */
import { invariant } from "#processing/invariant.ts";
import { nullOf, sameValueType, valueTypeOf } from "#processing/value.ts";
import type {
  BaseType,
  ContainerCardinality,
  ContainerOf,
  Null,
  Present,
  RecordValue,
  SingleOf,
  Value,
  ValueType,
} from "#processing/value.ts";

/**
 * The type an expression operand or a result is declared with: a cardinality and base type, a
 * record, or any present value.
 */
export type TypeSpec = ValueType | { readonly cardinality: "any" };

/**
 * An operand computed at run time, of a declared type.
 */
export interface ExpressionOperand<T extends TypeSpec = TypeSpec> {
  readonly form: "expression";
  readonly name: string;
  readonly type: T;
}

/**
 * An operand the document writes as a literal, parsed when the document is compiled.
 */
export interface LiteralOperand<P = unknown> {
  readonly form: "literal";
  readonly name: string;
  /**
   * The literal's meaning: from the value written (NULL for a `qti-null`, or a value of `type`),
   * the parsed value the function is handed, or `undefined` where the document is to be refused.
   */
  readonly parse: (value: Value) => P | undefined;
  /**
   * The type the literal is written in.
   */
  readonly type: ValueType;
}

/**
 * One operand of a custom operator.
 */
export type OperandSpec = ExpressionOperand | LiteralOperand;

/**
 * The single of each base type of a union of them.
 */
type SingleFor<B> = B extends BaseType ? SingleOf<B> : never;

/**
 * The container of each base type and cardinality of unions of them.
 */
type ContainerFor<B, C> = B extends BaseType
  ? C extends ContainerCardinality
    ? ContainerOf<B, C>
    : never
  : never;

/**
 * The present value of a declared type.
 */
export type PresentOf<S extends TypeSpec> = S extends {
  readonly base: infer B;
  readonly cardinality: "single";
}
  ? SingleFor<B>
  : S extends { readonly base: infer B; readonly cardinality: infer C }
    ? ContainerFor<B, C>
    : S extends { readonly cardinality: "record" }
      ? RecordValue
      : Present;

/**
 * What the function is handed for an operand: a literal's parsed value, or an expression operand's
 * present value.
 */
export type ArgumentOf<O extends OperandSpec> =
  O extends LiteralOperand<infer P>
    ? P
    : O extends ExpressionOperand<infer T>
      ? PresentOf<T>
      : never;

/**
 * The operands an inline operator's function is handed, in declared order.
 */
export type ArgumentsOf<Operands extends readonly OperandSpec[]> = {
  readonly [I in keyof Operands]: ArgumentOf<Operands[I]>;
};

/**
 * A result's declared type: a fixed type, or the type of one of its expression operands, by
 * position (a literal operand's parsed value is no value a result can follow).
 */
export type ResultSpec = ValueType | { readonly operand: number };

/**
 * The value an inline operator gives: present of its result's type, or NULL.
 */
export type ResultOf<R extends ResultSpec, Operands extends readonly OperandSpec[]> =
  | Null
  | (R extends { readonly operand: infer I extends number }
      ? Operands[I] extends ExpressionOperand<infer T>
        ? PresentOf<T>
        : never
      : R extends ValueType
        ? PresentOf<R>
        : never);

/**
 * The `definition` URI prefix of Alpha's operators (`tag:` URIs, RFC 4151).
 */
export const alphaDefinitionPrefix = "tag:superbuilders.school,2026:qti/custom-operator/";

/**
 * An inline operator as its module writes it: a pure, total function of its operands.
 */
export interface InlineOperator<
  Definition extends string,
  Operands extends readonly OperandSpec[],
  R extends ResultSpec,
> {
  /**
   * The function: synchronous, total, reading nothing but its operands and the module's own
   * constants.
   */
  readonly apply: (operands: ArgumentsOf<Operands>) => ResultOf<R, Operands>;
  readonly definition: Definition;
  readonly operands: Operands;
  readonly result: R;
}

/**
 * A recorded operator as its module writes it: its operands and result type, and which operand is
 * the most its answer may score. A literal operand is checked by its `parse` at publication, as an
 * inline operator's is, and its value as written is carried into the demand.
 */
export interface RecordedOperator<
  Definition extends string,
  Operands extends readonly OperandSpec[],
  R extends ValueType,
> {
  readonly definition: Definition;
  /**
   * The position of the operand whose value is the most the answer may score, which a demand
   * carries.
   */
  readonly maximum: number;
  readonly operands: Operands;
  readonly result: R;
}

/**
 * An inline operator bound to one element's literals: what the compiled program holds.
 */
export interface BoundOperator {
  /**
   * The operator applied to its expression operands' values, in order: NULL of the declared result
   * type where one is NULL, or is not of its declared type (a value only a dynamic expression,
   * `qti-null` or a record field, can give), else the function's result, a NULL result of the
   * declared type.
   */
  readonly evaluate: (operands: readonly Value[]) => Value;
}

/**
 * An inline operator's registry entry.
 */
export interface InlineEntry<Definition extends string = string> {
  /**
   * Bind the operator to an element's operands as written: at each literal position the value
   * written there, at each expression position `undefined`. It gives `undefined` where a literal's
   * `parse` refuses its value, or where an operand stands in the wrong form, and publication then
   * refuses the document.
   */
  readonly bind: (written: readonly (Value | undefined)[]) => BoundOperator | undefined;
  readonly definition: Definition;
  readonly kind: "inline";
  readonly operands: readonly OperandSpec[];
  readonly result: ResultSpec;
}

/**
 * A recorded operator's registry entry: its declaration, since its answer is an input.
 */
export interface RecordedEntry<Definition extends string = string> {
  /**
   * Whether an element's operands as written suit the operator: at each literal position a value
   * its `parse` takes, at each expression position `undefined`. Publication refuses a document
   * where they do not.
   */
  readonly admits: (written: readonly (Value | undefined)[]) => boolean;
  readonly definition: Definition;
  readonly kind: "recorded";
  readonly maximum: number;
  readonly operands: readonly OperandSpec[];
  readonly result: ValueType;
}

/**
 * A registry entry: a custom operator of either kind.
 */
export type CustomOperator<Definition extends string = string> =
  | InlineEntry<Definition>
  | RecordedEntry<Definition>;

/**
 * Whether a value is present and of a declared type.
 *
 * @param value - The value.
 * @param type - The declared type.
 * @returns Whether it is.
 */
export const conforms = (value: Value, type: TypeSpec): value is Present =>
  value.kind !== "null" && (type.cardinality === "any" || sameValueType(valueTypeOf(value), type));

/**
 * Whether arguments are the tuple an operator's function takes: one a position, and at each
 * expression position the present value that conformed there, in order; each literal position holds
 * the value its `parse` gave, which {@link inlineOperator}'s binding put there and nothing else can.
 *
 * @param operands - The declared operands.
 * @param handed - The arguments.
 * @param presents - The expression operands' present values, in order.
 * @returns Whether they are.
 */
const areArguments = <Operands extends readonly OperandSpec[]>(
  operands: Operands,
  handed: readonly unknown[],
  presents: readonly Present[],
): handed is ArgumentsOf<Operands> => {
  let next = 0;

  return (
    handed.length === operands.length &&
    operands.every((operand, index) => {
      if (operand.form === "literal") {
        return true;
      }

      const present = presents[next];
      next += 1;

      return present !== undefined && handed[index] === present;
    })
  );
};

/**
 * The NULL an operator gives: of its declared result type, or of the type of the expression operand
 * its result follows, as that operand's value has it.
 *
 * @param result - The declared result.
 * @param operands - The declared operands.
 * @param values - The expression operands' values, in order.
 * @returns The NULL.
 */
const nullResult = (
  result: ResultSpec,
  operands: readonly OperandSpec[],
  values: readonly Value[],
): Null => {
  if (!("operand" in result)) {
    return nullOf(result);
  }

  const position = operands
    .slice(0, result.operand)
    .filter((operand) => operand.form === "expression").length;
  const followed = values[position];
  invariant(followed !== undefined, "a result follows an expression operand the operator declares");

  return nullOf(valueTypeOf(followed));
};

/**
 * A literal position's parse, or an expression position's mark, as {@link InlineEntry.bind} reads
 * an element's operands.
 */
type Parsed =
  | { readonly kind: "expression" }
  | { readonly kind: "literal"; readonly meaning: unknown }
  | { readonly kind: "refused" };

/**
 * Make an inline operator's registry entry, checking its function against its declared operands
 * and result.
 *
 * @param operator - The operator, as its module writes it.
 * @returns Its entry.
 */
export const inlineOperator = <
  const Definition extends string,
  const Operands extends readonly OperandSpec[],
  const R extends ResultSpec,
>(
  operator: InlineOperator<Definition, Operands, R>,
): InlineEntry<Definition> => ({
  bind: (written) => {
    if (written.length !== operator.operands.length) {
      return;
    }

    const parsed = operator.operands.map((operand, index): Parsed => {
      const value = written[index];
      if (operand.form === "expression") {
        return value === undefined ? { kind: "expression" } : { kind: "refused" };
      }

      const meaning = value === undefined ? undefined : operand.parse(value);

      return meaning === undefined ? { kind: "refused" } : { kind: "literal", meaning };
    });
    if (parsed.some((each) => each.kind === "refused")) {
      return;
    }

    return {
      evaluate: (values) => {
        const handed: unknown[] = [];
        const presents: Present[] = [];
        for (const [index, slot] of parsed.entries()) {
          if (slot.kind === "literal") {
            handed.push(slot.meaning);
          } else {
            const value = values[presents.length];
            const operand = operator.operands[index];
            invariant(
              value !== undefined && operand !== undefined,
              "an expression operand has its value",
            );
            if (!conforms(value, operand.type)) {
              return nullResult(operator.result, operator.operands, values);
            }

            handed.push(value);
            presents.push(value);
          }
        }

        invariant(
          areArguments(operator.operands, handed, presents),
          "the arguments are the declared tuple",
        );

        const value = operator.apply(handed);

        return value.kind === "null"
          ? nullResult(operator.result, operator.operands, values)
          : value;
      },
    };
  },
  definition: operator.definition,
  kind: "inline",
  operands: operator.operands,
  result: operator.result,
});

/**
 * Make a recorded operator's registry entry.
 *
 * @param operator - The operator, as its module writes it.
 * @returns Its entry.
 */
export const recordedOperator = <
  const Definition extends string,
  const Operands extends readonly OperandSpec[],
  const R extends ValueType,
>(
  operator: RecordedOperator<Definition, Operands, R>,
): RecordedEntry<Definition> => ({
  admits: (written) =>
    written.length === operator.operands.length &&
    operator.operands.every((operand, index) => {
      const value = written[index];
      if (operand.form === "expression") {
        return value === undefined;
      }

      return value !== undefined && operand.parse(value) !== undefined;
    }),
  definition: operator.definition,
  kind: "recorded",
  maximum: operator.maximum,
  operands: operator.operands,
  result: operator.result,
});
