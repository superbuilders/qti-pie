/**
 * An item session's processing: its take (template processing at the session's start) and each
 * attempt (response processing on the responses submitted), as QTI defines the session's variables
 * around them.
 *
 * - **At the take** (§5.156, IM 2.2.2): template variables start at their defaults (a test's template
 *   default before that, §5.152), template processing sets them and may set correct responses and
 *   defaults, drawing under `served␟template␟<identifier>`.
 * - **At an attempt**: `numAttempts` is one more (§2.2.2.3); responses take the values submitted, a
 *   response submitted without one its default (a default submission); outcomes start at their
 *   defaults, else a single numeric one at 0 (reading `numeric-outcome-default`), or, in an
 *   adaptive item after its first attempt, where its last processed attempt left them (§5.7);
 *   `completionStatus` is `unknown` at the first attempt and where the last attempt left it after;
 *   response processing draws under `served␟response␟<numAttempts>`.
 *
 * @module
 */
import { creditOf, marksOf } from "#processing/credit.ts";
import type { Credit, Mark } from "#processing/credit.ts";
import { runProcessing, runTemplateProcessing } from "#processing/engine.ts";
import type { Variables } from "#processing/engine.ts";
import type { ExpressionKind } from "#processing/ir.ts";
import type { OperatorTable } from "#processing/operators/operator.ts";
import type { Instant } from "#processing/graded.ts";
import type { CompiledItem, Declaration } from "#processing/program.ts";
import type { Demand, ProcessingFailure } from "#processing/run.ts";
import { drawStream, responseLabel, templateLabel } from "#processing/stream.ts";
import type { Seed } from "#processing/stream.ts";
import { nullOf, single, textValue } from "#processing/value.ts";
import type { Value } from "#processing/value.ts";

/**
 * What template processing set at an item session's take: its template values, and the correct
 * responses and defaults it set, by identifier.
 */
export interface Take {
  readonly correct: ReadonlyMap<string, Value>;
  readonly defaults: ReadonlyMap<string, Value>;
  readonly templates: ReadonlyMap<string, Value>;
}

/**
 * A run that failed: a stated limit reached, or a value no variable may hold. Never a grade.
 */
export interface Failed {
  readonly failure: ProcessingFailure;
  readonly kind: "failed";
}

/**
 * The value a declaration of a role starts at, where nothing overrides it.
 *
 * @param declaration - The declaration.
 * @param defaults - The defaults template processing set.
 * @returns Its starting value: its default, else for a single integer or float outcome 0 (reading
 *   `numeric-outcome-default`), else NULL.
 */
export const startOf = (declaration: Declaration, defaults: ReadonlyMap<string, Value>): Value => {
  const declared = defaults.get(declaration.identifier) ?? declaration.default;
  if (declared.kind !== "null" || declaration.role !== "outcome") {
    return declared;
  }

  const { type } = declaration;
  if (type.cardinality === "single" && type.base === "integer") {
    return single("integer", 0n);
  }

  return type.cardinality === "single" && type.base === "float" ? single("float", 0) : declared;
};

/**
 * Run an item's template processing at its take.
 *
 * @param table - The standard operators.
 * @param item - The item.
 * @param seed - The item's processing seed.
 * @param templateDefaults - The test's template defaults for the item, by template identifier.
 * @param context - The context variables' values, by identifier.
 * @returns What it set, or the failure.
 */
export const takeWith = <K extends ExpressionKind>(
  table: OperatorTable<K>,
  item: CompiledItem,
  seed: Seed,
  templateDefaults: ReadonlyMap<string, Value>,
  context: ReadonlyMap<string, Value>,
): Failed | Take => {
  const values = new Map<string, Value>();
  for (const declaration of item.declarations.values()) {
    if (declaration.role === "template") {
      values.set(
        declaration.identifier,
        templateDefaults.get(declaration.identifier) ?? declaration.default,
      );
    } else if (declaration.role === "context") {
      values.set(
        declaration.identifier,
        context.get(declaration.identifier) ?? declaration.default,
      );
    }
  }

  const ran = runTemplateProcessing(table, item.templateProcessing, {
    declarations: item.declarations,
    draw: drawStream(seed, templateLabel(item.identifier)),
    members: [],
    recorded: new Map(),
    variables: { correct: new Map(), defaults: new Map(), values },
  });
  if (ran.kind === "failed") {
    return ran;
  }

  const templates = new Map(
    [...ran.variables.values].filter(
      ([identifier]) => item.declarations.get(identifier)?.role === "template",
    ),
  );

  return { correct: ran.variables.correct, defaults: ran.variables.defaults, templates };
};

/**
 * The processed attempt an attempt follows, or none.
 */
export type Prior =
  | { readonly kind: "none" }
  | {
      readonly at: Instant;
      readonly kind: "processed";
      readonly outcomes: ReadonlyMap<string, Value>;
    };

/**
 * One attempt of an item session.
 */
export interface Attempt {
  readonly context: ReadonlyMap<string, Value>;
  /**
   * The item's duration at the attempt, in seconds (reading `duration-variable-type`).
   */
  readonly duration: number;
  /**
   * The recorded operators' answers in, by place.
   */
  readonly evaluations: ReadonlyMap<number, Value>;
  readonly item: CompiledItem;
  /**
   * The session's attempts before this one.
   */
  readonly numAttempts: bigint;
  readonly prior: Prior;
  /**
   * The responses submitted, by identifier; one not submitted takes its default.
   */
  readonly responses: ReadonlyMap<string, Value>;
  readonly seed: Seed;
  readonly take: Take;
}

/**
 * A processed attempt's result.
 */
export type ItemResult =
  | {
      readonly completionStatus: Value;
      readonly credit: Credit | undefined;
      readonly kind: "done";
      /**
       * Each response's marks, by identifier.
       */
      readonly marks: ReadonlyMap<string, readonly Mark[]>;
      readonly numAttempts: bigint;
      /**
       * Every outcome's value, by identifier.
       */
      readonly outcomes: ReadonlyMap<string, Value>;
    }
  | { readonly demands: readonly Demand[]; readonly kind: "pending"; readonly numAttempts: bigint };

/**
 * The values an attempt's response processing starts from.
 *
 * @param attempt - The attempt.
 * @param numAttempts - The attempt's `numAttempts`.
 * @returns The variables.
 */
const startingVariables = (attempt: Attempt, numAttempts: bigint): Variables => {
  const { item, prior, take } = attempt;
  const values = new Map<string, Value>();
  for (const declaration of item.declarations.values()) {
    const { identifier } = declaration;
    switch (declaration.role) {
      case "response": {
        values.set(
          identifier,
          attempt.responses.get(identifier) ?? take.defaults.get(identifier) ?? declaration.default,
        );
        break;
      }
      case "outcome": {
        const carried =
          item.adaptive && prior.kind === "processed" ? prior.outcomes.get(identifier) : undefined;
        values.set(identifier, carried ?? startOf(declaration, take.defaults));
        break;
      }
      case "template": {
        values.set(identifier, take.templates.get(identifier) ?? declaration.default);
        break;
      }
      case "context": {
        values.set(identifier, attempt.context.get(identifier) ?? declaration.default);
        break;
      }
      case "built-in": {
        break;
      }
    }
  }

  const status =
    prior.kind === "processed" && attempt.numAttempts > 0n
      ? prior.outcomes.get("completionStatus")
      : undefined;
  values.set("numAttempts", single("integer", numAttempts));
  values.set("duration", single("float", attempt.duration));
  values.set("completionStatus", status ?? textValue("identifier", "unknown"));

  return { correct: take.correct, defaults: take.defaults, values };
};

/**
 * The credit of an attempt's outcomes: SCORE against MAXSCORE, else SCORE's `normal-maximum`.
 *
 * @param item - The item.
 * @param outcomes - The outcomes.
 * @returns The credit, or `undefined`.
 */
const creditOfOutcomes = (
  item: CompiledItem,
  outcomes: ReadonlyMap<string, Value>,
): Credit | undefined => {
  const score = outcomes.get("SCORE");
  const maxScore = outcomes.get("MAXSCORE");
  const maximum =
    maxScore?.kind === "single" && maxScore.base === "float"
      ? maxScore.value
      : item.declarations.get("SCORE")?.normalMaximum;

  return score?.kind === "single" && score.base === "float" && maximum !== undefined
    ? creditOf(score.value, maximum)
    : undefined;
};

/**
 * Process one attempt.
 *
 * @param table - The standard operators.
 * @param attempt - The attempt.
 * @returns Its result, or the failure.
 */
export const attemptWith = <K extends ExpressionKind>(
  table: OperatorTable<K>,
  attempt: Attempt,
): Failed | ItemResult => {
  const numAttempts = attempt.numAttempts + 1n;
  const variables = startingVariables(attempt, numAttempts);
  const ran = runProcessing(table, attempt.item.responseProcessing, {
    declarations: attempt.item.declarations,
    draw: drawStream(attempt.seed, responseLabel(numAttempts)),
    members: [],
    recorded: attempt.evaluations,
    variables,
  });
  if (ran.kind === "failed") {
    return ran;
  }

  if (ran.demands.length > 0) {
    return { demands: ran.demands, kind: "pending", numAttempts };
  }

  const outcomes = new Map<string, Value>();
  const marks = new Map<string, readonly Mark[]>();
  for (const declaration of attempt.item.declarations.values()) {
    const value = ran.variables.values.get(declaration.identifier) ?? nullOf(declaration.type);
    if (declaration.role === "outcome") {
      outcomes.set(declaration.identifier, value);
    } else if (declaration.role === "response") {
      marks.set(
        declaration.identifier,
        marksOf(value, attempt.take.correct.get(declaration.identifier) ?? declaration.correct),
      );
    }
  }

  const completionStatus =
    ran.variables.values.get("completionStatus") ?? textValue("identifier", "unknown");
  outcomes.set("completionStatus", completionStatus);

  return {
    completionStatus,
    credit: creditOfOutcomes(attempt.item, outcomes),
    kind: "done",
    marks,
    numAttempts,
    outcomes,
  };
};
