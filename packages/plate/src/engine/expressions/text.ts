/**
 * The text family of the engine: the evaluators of `qti-string-match`, `qti-substring`,
 * `qti-pattern-match`, `qti-inside` and `qti-custom-operator`.
 *
 * Each gives a single boolean, NULL when an operand is NULL, but `qti-custom-operator`, whose value
 * is NULL: the extension that defines it is not run. A string is compared with case folded
 * as a map entry compares one ({@link foldCase}), a pattern is matched by the linear automaton of
 * `#plate/model/regex.ts`, never a backtracking `RegExp`, and a point is tested against an area
 * by {@link areaHolds}.
 *
 * It reads the evaluator's types from `#plate/engine/evaluate.ts` as types only, so the
 * dispatcher's table may import it without a cycle.
 *
 * @module
 */
import { Option, Result } from "effect";
import type { Evaluate, Evaluator, FamilyTable, Scope } from "#plate/engine/evaluate.ts";
import { areaHolds } from "#plate/engine/expressions/shapes.ts";
import type { EngineFailure } from "#plate/engine/failures.ts";
import { booleanNull, booleanOf, singleOf, toFloat } from "#plate/engine/numbers.ts";
import { referenceValue } from "#plate/engine/refs.ts";
import type { Expression, StringOrRef } from "#plate/model/expression.ts";
import { compile, matches } from "#plate/model/regex.ts";
import type { Matcher } from "#plate/model/regex.ts";
import { isNull, nullOf } from "#plate/model/values.ts";
import type { Value } from "#plate/model/values.ts";

/**
 * Fold a string's case for a case-insensitive comparison: upper case then lower case, by Unicode's
 * default mappings and independent of locale, so `YORK` and `york`, or `SS` and `ß`, compare equal.
 * A case-insensitive map entry folds its key so too (`#plate/engine/expressions/references.ts`).
 *
 * @param text The string.
 * @returns Its folded form.
 */
export const foldCase = (text: string): string => text.toUpperCase().toLowerCase();

/**
 * Give the string a value holds: the string of a single string, none for NULL.
 *
 * Every operand of a string kind is a single string on a checked item: the database refuses any
 * other (`expression-type`, `check: "operand"`). One that is not is counted as NULL.
 *
 * @param value The value.
 * @returns The string, or none when the value is NULL or not a single string.
 */
const stringOf = (value: Value): Option.Option<string> =>
  singleOf(value, "string").pipe(Option.map((single) => single.value));

/**
 * Evaluate two string operands, left then right, and give the boolean a comparison of them gives,
 * or NULL when either is NULL.
 *
 * Both operands are evaluated before either is read, and the first failure is the result.
 *
 * @param operands The two operands.
 * @param scope The item and the variables of the attempt.
 * @param evaluate The evaluator, which gives each operand's value.
 * @param compare The comparison of the first string with the second.
 * @returns The single boolean, or the first operand's failure.
 */
const comparedStrings = (
  [left, right]: readonly [Expression, Expression],
  scope: Scope,
  evaluate: Evaluate,
  compare: (first: string, second: string) => boolean,
): Result.Result<Value, EngineFailure> =>
  Result.map(Result.all([evaluate(left, scope), evaluate(right, scope)]), ([first, second]) =>
    Option.match(Option.all([stringOf(first), stringOf(second)]), {
      onNone: () => booleanNull,
      onSome: ([one, other]) => booleanOf(compare(one, other)),
    }),
  );

/**
 * Give a string as a comparison of `case-sensitive` reads it: as written when case-sensitive, else
 * with its case folded as a case-insensitive map entry folds it, by Unicode's default
 * mappings and independent of locale, so `ß` and `SS` compare equal.
 *
 * @param caseSensitive The expression's `case-sensitive`.
 * @param text The string.
 * @returns The string the comparison reads.
 */
const compared = (caseSensitive: boolean, text: string): string =>
  caseSensitive ? text : foldCase(text);

/**
 * Give the value of a `qti-string-match`: a single boolean, true when its two strings are equal,
 * or, when `substring` is true, when the first contains the second; each compared exactly when
 * `case-sensitive` and with case folded when not. NULL when either operand is NULL.
 *
 * @param expression The `qti-string-match`.
 * @param scope The item and the variables of the attempt.
 * @param evaluate The evaluator, which gives each operand's value.
 * @returns The single boolean, or the first operand's failure.
 * @see https://www.imsglobal.org/spec/qti/v3p0/info#OpStringMatch
 */
const evaluateStringMatch: Evaluator<"string-match"> = (expression, scope, evaluate) =>
  comparedStrings(expression.operands, scope, evaluate, (first, second) => {
    const [one, other] = [
      compared(expression.caseSensitive, first),
      compared(expression.caseSensitive, second),
    ];

    return expression.substring ? one.includes(other) : one === other;
  });

/**
 * Give the value of a `qti-substring`: a single boolean, true when the first string is a substring
 * of the second, compared exactly when `case-sensitive` and with case folded when not. NULL
 * when either operand is NULL.
 *
 * @param expression The `qti-substring`.
 * @param scope The item and the variables of the attempt.
 * @param evaluate The evaluator, which gives each operand's value.
 * @returns The single boolean, or the first operand's failure.
 * @see https://www.imsglobal.org/spec/qti/v3p0/info#OpSubstring
 */
const evaluateSubstring: Evaluator<"substring"> = (expression, scope, evaluate) =>
  comparedStrings(expression.operands, scope, evaluate, (first, second) =>
    compared(expression.caseSensitive, second).includes(compared(expression.caseSensitive, first)),
  );

/**
 * Give the automaton a `pattern` stands for: its literal text compiled, or the value of the
 * variable it names compiled, through {@link referenceValue} with the kind's checked string facet.
 *
 * Each evaluation compiles its pattern again, as a `pattern-mask` check does, so nothing an
 * author's pattern builds outlives the evaluation.
 *
 * @param scope The item and the variables of the attempt.
 * @param pattern The `pattern`.
 * @returns The automaton; none when the named variable holds NULL or a value that is not a single
 *   string, which the database refuses (`expression-type`, `check: "reference"`) on a checked
 *   item, or when the text is no XML Schema regular expression `compile` takes, which the reader
 *   marks for a literal and gives NULL for a variable's value; or an `UnknownIdentifierError` when
 *   it names a variable the variables hold no value of.
 */
const matcherOf = (
  scope: Scope,
  pattern: StringOrRef,
): Result.Result<Option.Option<Matcher>, EngineFailure> =>
  Result.map(
    referenceValue(scope.variables, { baseType: "string", checked: true, reference: pattern }),
    (value) => Option.flatMap(stringOf(value), (text) => Result.getSuccess(compile(text))),
  );

/**
 * Give the value of a `qti-pattern-match`: a single boolean, whether its string matches the whole
 * `pattern`, anchored at both ends as XML Schema reads a regular expression. NULL when the operand
 * is NULL, and when the pattern is not one (a referenced value `compile` refuses, or a variable
 * that holds NULL).
 *
 * The pattern is resolved first, then the operand is evaluated; the first failure is the result.
 * The match runs in time linear in the string's length (`matches` in `#plate/model/regex.ts`), so
 * an author's `(a+)+b` against a long string answers at once, where a backtracking `RegExp` would
 * take time exponential in its length.
 *
 * @param expression The `qti-pattern-match`.
 * @param scope The item and the variables of the attempt.
 * @param evaluate The evaluator, which gives the operand's value.
 * @returns The single boolean, or the failure of the pattern or the operand.
 * @see https://www.imsglobal.org/spec/qti/v3p0/info#OpPatternMatch
 */
const evaluatePatternMatch: Evaluator<"pattern-match"> = (expression, scope, evaluate) =>
  Result.gen(function* matchPattern() {
    const matcher = yield* matcherOf(scope, expression.pattern);
    const [operand] = expression.operands;
    const value = yield* evaluate(operand, scope);

    return Option.match(Option.all([matcher, stringOf(value)]), {
      onNone: () => booleanNull,
      onSome: ([automaton, text]) => booleanOf(matches(automaton, text)),
    });
  });

/**
 * Give the value of a `qti-inside`: a single boolean, true when its point is inside the area its
 * `shape` and `coords` define, or, for a container, when any of its points is. NULL when the
 * operand is NULL.
 *
 * The area holds a point on its boundary (reading 52), and coordinates that do not fit the shape
 * are read as HTML's image maps read them (reading 59), by {@link areaHolds}. A coordinate is
 * compared after the one conversion, {@link toFloat}. A value that holds no point, which the
 * database refuses ("Operand fit") on an admitted item, is counted as
 * holding none.
 *
 * @param expression The `qti-inside`.
 * @param scope The item and the variables of the attempt.
 * @param evaluate The evaluator, which gives the operand's value.
 * @returns The single boolean, or the operand's failure.
 * @see https://www.imsglobal.org/spec/qti/v3p0/info#OpInside
 */
const evaluateInside: Evaluator<"inside"> = (expression, scope, evaluate) => {
  const [operand] = expression.operands;
  const holds = areaHolds[expression.shape];

  return Result.map(evaluate(operand, scope), (value) =>
    isNull(value)
      ? booleanNull
      : booleanOf(
          value.values.some(
            (single) =>
              single.baseType === "point" &&
              holds(expression.coords, toFloat(single.value[0]), toFloat(single.value[1])),
          ),
        ),
  );
};

/**
 * Give the value of a `qti-custom-operator`: NULL, since the extension that defines it is not run
 * ; the item model marks it, and its processing still runs.
 *
 * Its operands are not evaluated, the one exception to every operand evaluated left to right
 * (`operandValues` in `#plate/engine/operands.ts`): its value does not depend on them, and a random
 * kind among them draws nothing, so the values a seed gives stay those of the item without it. Its
 * kind rule types it unknown, so the NULL's base type says nothing; it is a single string's.
 *
 * @returns The NULL.
 * @see https://www.imsglobal.org/spec/qti/v3p0/info#OpCustomOp
 */
const evaluateCustomOperator: Evaluator<"custom-operator"> = () =>
  Result.succeed(nullOf("string", "single"));

/**
 * The text family's evaluators by kind.
 */
export const textEvaluators: FamilyTable<
  "custom-operator" | "inside" | "pattern-match" | "string-match" | "substring"
> = {
  "custom-operator": evaluateCustomOperator,
  inside: evaluateInside,
  "pattern-match": evaluatePatternMatch,
  "string-match": evaluateStringMatch,
  substring: evaluateSubstring,
};
