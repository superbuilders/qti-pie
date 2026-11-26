/**
 * The entries, and the grade they mint: `Graded`, whose key this module alone holds. Each takes
 * everything it reads as an argument (programs, values, seeds, the read's instant) and gives a
 * {@link Graded} result whose proof names what it read, or a failure, which is never a grade.
 *
 * - {@link gradeAnswerWith}: one attempt of an item in an individual part (D14): the answer graded
 *   when it is given, on the session's last processed attempt.
 * - {@link gradeSittingWith}: a sitting's submit (G5 §3): each closing member's attempt on its saved
 *   or default responses, then the test's outcome processing over every member, from its defaults
 *   (§5.102), in one result: Done, or Pending where a recorded operator's answer is not in (D7).
 * - {@link completePendingWith}: a Pending grade completed once the recorded answers it demanded are
 *   in (D8), over the same attempts; a settled grade has no path back in, since history is never
 *   regraded (Bjorn, 2026-11-20).
 *
 * @module
 */
import { admit } from "#processing/admission.ts";
import type { Admission } from "#processing/admission.ts";
import { valuesDigest } from "#processing/digest.ts";
import { evaluateExpression, runProcessing } from "#processing/engine.ts";
import type { Digest, GradeProof, Instant, ResponsesRead } from "#processing/graded.ts";
import type { ExpressionKind } from "#processing/ir.ts";
import type { OperatorTable } from "#processing/operators/operator.ts";
import type { CompiledItem, CompiledTest } from "#processing/program.ts";
import type { Demand, MemberOutcome, MemberResponse, MemberState } from "#processing/run.ts";
import { attemptWith, startOf } from "#processing/session.ts";
import type { Attempt, Failed, ItemResult, Prior, Take } from "#processing/session.ts";
import { drawStream, responseLabel, templateLabel } from "#processing/stream.ts";
import type { Seed } from "#processing/stream.ts";
import { nullOf, single } from "#processing/value.ts";
import type { Value } from "#processing/value.ts";

/**
 * The grade's key: a symbol this module holds and never exports. The package's `exports` map lists
 * only its index, which exports the type and {@link proofOf} alone, so no code outside this module
 * can make a `Graded` value: not by a literal (the key cannot be named), not by a cast (casts are
 * banned) and not through `any` (banned too). The ledger's write of a grade takes a `Graded` value,
 * so nothing but an entry's result can be written as one.
 */
const graded: unique symbol = Symbol("graded");

/**
 * A result an entry computed, carrying the proof of what it was computed from.
 */
export type Graded<T extends object> = T & { readonly [graded]: GradeProof };

/**
 * Mint a grade. Only this module's entries call it.
 *
 * @param result - The result.
 * @param proof - What it was computed from.
 * @returns The grade.
 */
const mint = <T extends object>(result: T, proof: GradeProof): Graded<T> => ({
  ...result,
  [graded]: proof,
});

/**
 * Read a grade's proof.
 *
 * @param grade - The grade.
 * @returns What it was computed from.
 */
export const proofOf = (grade: Graded<object>): GradeProof => grade[graded];

/**
 * Which responses an attempt grades: a save's values, or the default submission where the
 * candidate saved nothing.
 */
export type Submitted =
  | { readonly at: Instant; readonly kind: "save"; readonly values: ReadonlyMap<string, Value> }
  | { readonly kind: "default" };

/**
 * An item session as a grade reads it: its take, its attempts before, the processed attempt it
 * follows, its duration and its seed.
 */
export interface ItemSession {
  readonly duration: number;
  readonly numAttempts: bigint;
  readonly prior: Prior;
  readonly seed: Seed;
  readonly take: Take;
}

/**
 * One answer to grade.
 */
export interface AnswerInput {
  readonly context: ReadonlyMap<string, Value>;
  readonly evaluations: ReadonlyMap<number, Value>;
  readonly item: CompiledItem;
  readonly readAt: Instant;
  readonly responses: Submitted;
  readonly session: ItemSession;
  /**
   * The session's `validate-responses` (§7.19.7): whether tier (b)'s limits refuse the answer too.
   */
  readonly validate: boolean;
}

/**
 * An answer admission refused (§7.19.7, reading `response-limits`): its reasons. It writes nothing.
 */
export interface Refused {
  readonly admission: Admission;
  readonly kind: "refused";
}

/**
 * A graded answer: its item's result, or its refusal.
 */
export interface AnswerGrade {
  readonly result: ItemResult | Refused;
}

/**
 * A test's member: its item ref and occurrence.
 */
export interface MemberRef {
  readonly identifier: string;
  readonly occurrence: bigint;
}

/**
 * A member a sitting's grade processes now.
 */
export interface ClosingMember {
  readonly evaluations: ReadonlyMap<number, Value>;
  readonly item: CompiledItem;
  readonly ref: MemberRef;
  readonly responses: Submitted;
  readonly session: ItemSession;
}

/**
 * A member processed before, whose outcomes the test's outcome processing reads as they are.
 */
export interface CarriedMember {
  readonly item: CompiledItem;
  readonly numAttempts: bigint;
  readonly outcomes: ReadonlyMap<string, Value>;
  readonly ref: MemberRef;
  readonly responses: ReadonlyMap<string, Value>;
  readonly take: Take;
}

/**
 * A sitting to grade.
 */
export interface SittingInput {
  readonly carried: readonly CarriedMember[];
  readonly closing: readonly ClosingMember[];
  readonly context: ReadonlyMap<string, Value>;
  readonly readAt: Instant;
  /**
   * When the test started, so its `duration` is `readAt` less it (D4).
   */
  readonly startedAt: Instant;
  readonly test: CompiledTest;
  /**
   * The seed the test's outcome processing draws under.
   */
  readonly testSeed: Seed;
}

/**
 * One member's grade: its item's program, the responses it read and its result.
 */
export interface MemberGrade {
  /**
   * The processed attempt the member's grade follows (L4), or none.
   */
  readonly prior: GradeProof["prior"];
  readonly program: Digest;
  readonly read: ResponsesRead;
  readonly ref: MemberRef;
  readonly result: ItemResult;
}

/**
 * A sitting's grade: every closing member's result, and, where none is pending, the test's
 * outcomes.
 */
export type SittingGrade =
  | {
      readonly kind: "done";
      readonly members: readonly MemberGrade[];
      readonly test: ReadonlyMap<string, Value>;
    }
  | {
      readonly demands: readonly (Demand & { readonly ref: MemberRef })[];
      readonly kind: "pending";
      readonly members: readonly MemberGrade[];
    };

/**
 * The defaults a test's outcomes start from: their declarations' alone, since a test has no
 * template processing.
 */
const noDefaults: ReadonlyMap<string, Value> = new Map();

/**
 * The responses an attempt grades, by identifier: a save's values, or none for a default
 * submission, whose responses take their defaults.
 *
 * @param submitted - Which responses.
 * @returns The values.
 */
const valuesOf = (submitted: Submitted): ReadonlyMap<string, Value> =>
  submitted.kind === "save" ? submitted.values : new Map();

/**
 * What a grade read of a member's responses.
 *
 * @param submitted - Which responses.
 * @returns The read, with the values' digest.
 */
const readOf = (submitted: Submitted): ResponsesRead => ({
  digest: valuesDigest(valuesOf(submitted)),
  saved: submitted.kind === "save" ? { at: submitted.at, kind: "save" } : { kind: "default" },
});

/**
 * The attempt a member's grade processes.
 *
 * @param member - The member.
 * @param context - The context values.
 * @returns The attempt.
 */
const attemptOf = (
  member: Pick<ClosingMember, "evaluations" | "item" | "responses" | "session">,
  context: ReadonlyMap<string, Value>,
): Attempt => ({
  context,
  duration: member.session.duration,
  evaluations: member.evaluations,
  item: member.item,
  numAttempts: member.session.numAttempts,
  prior: member.session.prior,
  responses: valuesOf(member.responses),
  seed: member.session.seed,
  take: member.session.take,
});

/**
 * The proof's prior of a session.
 *
 * @param prior - The processed attempt it follows.
 * @returns The proof's prior.
 */
const priorOf = (prior: Prior): GradeProof["prior"] =>
  prior.kind === "processed" ? { at: prior.at, kind: "processed" } : { kind: "none" };

/**
 * The values in force an answer's admission reads (the SQL grader's `start_of`): each outcome where
 * the session's last processed attempt left it, its starting value before the first, and the
 * session's template values.
 *
 * @param item - The item.
 * @param session - The session.
 * @returns The values, by identifier.
 */
const heldOf = (item: CompiledItem, session: ItemSession): ReadonlyMap<string, Value> => {
  const held = new Map<string, Value>(session.take.templates);
  for (const declaration of item.declarations.values()) {
    if (declaration.role === "outcome") {
      const carried =
        session.prior.kind === "processed"
          ? session.prior.outcomes.get(declaration.identifier)
          : undefined;
      held.set(declaration.identifier, carried ?? startOf(declaration, session.take.defaults));
    }
  }

  return held;
};

/**
 * Grade one answer (D14).
 *
 * @param table - The standard operators.
 * @param input - The answer.
 * @returns The grade, or the failure.
 */
export const gradeAnswerWith = <K extends ExpressionKind>(
  table: OperatorTable<K>,
  input: AnswerInput,
): Failed | Graded<AnswerGrade> => {
  const proof: GradeProof = {
    prior: priorOf(input.session.prior),
    program: input.item.digest,
    readAt: input.readAt,
    responses: [readOf(input.responses)],
  };
  const posted = valuesOf(input.responses);
  const admission = admit(input.item, posted, heldOf(input.item, input.session), input.validate);
  if (admission.reasons.length > 0) {
    return mint({ result: { admission, kind: "refused" } }, proof);
  }

  const shown = new Map(posted);
  for (const response of admission.hidden) {
    const declaration = input.item.declarations.get(response);
    if (declaration !== undefined) {
      shown.set(response, nullOf(declaration.type));
    }
  }

  const result = attemptWith(table, {
    ...attemptOf(input, input.context),
    responses: shown,
  });

  return result.kind === "failed" ? result : mint({ result }, proof);
};

/**
 * A member's state as outcome processing reads it.
 *
 * @param item - The member's item.
 * @param ref - Its ref.
 * @param numAttempts - Its attempts.
 * @param responses - Its responses' values.
 * @param outcomes - Its outcomes' values.
 * @param take - Its take.
 * @param test - The test.
 * @returns The state.
 */
const memberStateOf = (
  item: CompiledItem,
  ref: MemberRef,
  numAttempts: bigint,
  responses: ReadonlyMap<string, Value>,
  outcomes: ReadonlyMap<string, Value>,
  take: Take,
  test: CompiledTest,
): MemberState => {
  const itemRef = test.itemRefs.find((each) => each.identifier === ref.identifier);
  const declarations = [...item.declarations.values()];
  const memberResponses: MemberResponse[] = declarations
    .filter((declaration) => declaration.role === "response")
    .map((declaration) => ({
      correct: take.correct.get(declaration.identifier) ?? declaration.correct,
      default: take.defaults.get(declaration.identifier) ?? declaration.default,
      identifier: declaration.identifier,
      value:
        responses.get(declaration.identifier) ??
        take.defaults.get(declaration.identifier) ??
        declaration.default,
    }));
  const memberOutcomes: MemberOutcome[] = declarations
    .filter((declaration) => declaration.role === "outcome")
    .map((declaration) => ({
      identifier: declaration.identifier,
      normalMaximum: declaration.normalMaximum,
      normalMinimum: declaration.normalMinimum,
      value: outcomes.get(declaration.identifier) ?? nullOf(declaration.type),
    }));

  return {
    categories: itemRef?.categories ?? [],
    identifier: ref.identifier,
    numAttempts,
    occurrence: ref.occurrence,
    outcomes: memberOutcomes,
    presented: numAttempts > 0n,
    responses: memberResponses,
    sections: itemRef?.sections ?? [],
    selected: true,
    weights: itemRef?.weights ?? new Map(),
  };
};

/**
 * The test's outcomes from its defaults, by outcome processing over its members (§5.102).
 *
 * @param table - The standard operators.
 * @param input - The sitting.
 * @param members - Every member's state.
 * @returns The test's outcomes, or the failure.
 */
const testOutcomes = <K extends ExpressionKind>(
  table: OperatorTable<K>,
  input: SittingInput,
  members: readonly MemberState[],
): Failed | { readonly kind: "outcomes"; readonly values: ReadonlyMap<string, Value> } => {
  const values = new Map<string, Value>();
  for (const declaration of input.test.declarations.values()) {
    if (declaration.role === "outcome") {
      values.set(declaration.identifier, startOf(declaration, noDefaults));
    } else if (declaration.role === "context") {
      values.set(
        declaration.identifier,
        input.context.get(declaration.identifier) ?? declaration.default,
      );
    }
  }

  values.set(
    "duration",
    single(
      "duration",
      Number(input.readAt.microseconds - input.startedAt.microseconds) / 1_000_000,
    ),
  );

  const ran = runProcessing(table, input.test.outcomeProcessing, {
    declarations: input.test.declarations,
    draw: drawStream(input.testSeed, responseLabel(0n)),
    members,
    recorded: new Map(),
    variables: { correct: new Map(), defaults: new Map(), values },
  });
  if (ran.kind === "failed") {
    return ran;
  }

  return {
    kind: "outcomes",
    values: new Map(
      [...ran.variables.values].filter(
        ([identifier]) => input.test.declarations.get(identifier)?.role === "outcome",
      ),
    ),
  };
};

/**
 * Grade a sitting, or complete its pending grade: every closing member, then the test.
 *
 * @param table - The standard operators.
 * @param input - The sitting.
 * @returns The grade, or the first failure.
 */
const sittingWith = <K extends ExpressionKind>(
  table: OperatorTable<K>,
  input: SittingInput,
): Failed | Graded<SittingGrade> => {
  const members: MemberGrade[] = [];
  const states: MemberState[] = [];
  const demands: (Demand & { readonly ref: MemberRef })[] = [];
  for (const member of input.closing) {
    const result = attemptWith(table, attemptOf(member, input.context));
    if (result.kind === "failed") {
      return result;
    }

    members.push({
      prior: priorOf(member.session.prior),
      program: member.item.digest,
      read: readOf(member.responses),
      ref: member.ref,
      result,
    });
    if (result.kind === "pending") {
      for (const demand of result.demands) {
        demands.push({ ...demand, ref: member.ref });
      }
    } else {
      states.push(
        memberStateOf(
          member.item,
          member.ref,
          result.numAttempts,
          valuesOf(member.responses),
          result.outcomes,
          member.session.take,
          input.test,
        ),
      );
    }
  }

  for (const member of input.carried) {
    states.push(
      memberStateOf(
        member.item,
        member.ref,
        member.numAttempts,
        member.responses,
        member.outcomes,
        member.take,
        input.test,
      ),
    );
  }

  const proof: GradeProof = {
    prior: { kind: "none" },
    program: input.test.digest,
    readAt: input.readAt,
    responses: members.map((member) => member.read),
  };
  if (demands.length > 0) {
    return mint({ demands, kind: "pending", members }, proof);
  }

  const test = testOutcomes(table, input, states);

  return test.kind === "failed" ? test : mint({ kind: "done", members, test: test.values }, proof);
};

/**
 * Grade a sitting's submit.
 *
 * @param table - The standard operators.
 * @param input - The sitting.
 * @returns The grade, or the failure.
 */
export const gradeSittingWith = <K extends ExpressionKind>(
  table: OperatorTable<K>,
  input: SittingInput,
): Failed | Graded<SittingGrade> => sittingWith(table, input);

/**
 * A sitting's grade that is Pending: a recorded operator's answer was not in.
 */
export type PendingGrade = Extract<SittingGrade, { readonly kind: "pending" }>;

/**
 * A pending grade to complete: the sitting as it was graded, now with the recorded answers in, and
 * the pending grade itself, which only an entry could mint, so nothing but a pending grade has a
 * path back in, and a settled one none (history is never regraded).
 */
export interface CompletionInput extends SittingInput {
  readonly pending: Graded<PendingGrade>;
}

/**
 * Complete a pending grade (D7, D8): the same attempts graded again with the recorded answers now
 * in, every closing member one the pending grade graded, on the same responses.
 *
 * @param table - The standard operators.
 * @param input - The sitting and the pending grade.
 * @returns The grade, Done or still Pending, or the failure.
 */
export const completePendingWith = <K extends ExpressionKind>(
  table: OperatorTable<K>,
  input: CompletionInput,
): Failed | Graded<SittingGrade> => {
  for (const member of input.closing) {
    const pendingMember = input.pending.members.find(
      (each) =>
        each.ref.identifier === member.ref.identifier &&
        each.ref.occurrence === member.ref.occurrence,
    );
    if (pendingMember?.read.digest.sha256 !== readOf(member.responses).digest.sha256) {
      return {
        failure: {
          identifier: member.ref.identifier,
          kind: "completion-mismatch",
          occurrence: member.ref.occurrence,
        },
        kind: "failed",
      };
    }
  }

  return sittingWith(table, input);
};

/**
 * The template defaults a test's item ref gives its item's take (§5.152): each
 * `qti-template-default`'s expression evaluated in the test's scope, before the item's first
 * attempt, the test's `duration` NULL (reading `null-results`, its item 3) and its outcomes at
 * their defaults.
 *
 * @param table - The standard operators.
 * @param test - The test.
 * @param identifier - The item ref's identifier.
 * @param context - The context values.
 * @param seed - The seed its expressions draw under.
 * @returns Each template variable's default, by identifier, or the failure.
 */
export const templateDefaultsWith = <K extends ExpressionKind>(
  table: OperatorTable<K>,
  test: CompiledTest,
  identifier: string,
  context: ReadonlyMap<string, Value>,
  seed: Seed,
): Failed | ReadonlyMap<string, Value> => {
  const values = new Map<string, Value>();
  for (const declaration of test.declarations.values()) {
    if (declaration.role === "outcome") {
      values.set(declaration.identifier, startOf(declaration, noDefaults));
    } else if (declaration.role === "context") {
      values.set(
        declaration.identifier,
        context.get(declaration.identifier) ?? declaration.default,
      );
    }
  }

  const defaults = new Map<string, Value>();
  const ref = test.itemRefs.find((each) => each.identifier === identifier);
  const draw = drawStream(seed, templateLabel(identifier));
  for (const { expression, template } of ref?.templateDefaults ?? []) {
    const evaluated = evaluateExpression(table, expression, {
      declarations: test.declarations,
      draw,
      members: [],
      recorded: new Map(),
      variables: { correct: new Map(), defaults: new Map(), values },
    });
    if (evaluated.kind === "failed") {
      return evaluated;
    }

    defaults.set(template, evaluated.value);
  }

  return defaults;
};
