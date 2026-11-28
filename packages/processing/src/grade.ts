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
import {
  bitsOf,
  fieldsText,
  framed,
  textDigest,
  valuesDigest,
  valuesText,
} from "#processing/digest.ts";
import type { Fields } from "#processing/digest.ts";
import { evaluateExpression, runProcessing } from "#processing/engine.ts";
import type { Digest, GradeProof, Instant, ResponsesRead } from "#processing/graded.ts";
import type { ExpressionKind } from "#processing/ir.ts";
import type { OperatorTable } from "#processing/operators/operator.ts";
import type { CompiledItem, CompiledTest } from "#processing/program.ts";
import type {
  Demand,
  Evaluation,
  MemberOutcome,
  MemberResponse,
  MemberState,
} from "#processing/run.ts";
import { contract } from "#processing/invariant.ts";
import { attemptWith, countsAttempt, startOf } from "#processing/session.ts";
import type { Attempt, Failed, ItemResult, Prior, Take } from "#processing/session.ts";
import { drawStream, responseLabel, templateLabel } from "#processing/stream.ts";
import type { Seed } from "#processing/stream.ts";
import { nullOf, single, textValue } from "#processing/value.ts";
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
 * Which responses an attempt grades, by where they came from: a stored save's values, at its
 * instant; values posted with the answer, which no save stores and no instant dates; or the
 * default submission where the candidate gave nothing.
 */
export type Submitted =
  | { readonly at: Instant; readonly kind: "save"; readonly values: ReadonlyMap<string, Value> }
  | { readonly kind: "default" }
  | { readonly kind: "posted"; readonly values: ReadonlyMap<string, Value> };

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
 * What an answer answers: a test's member, whose item and effective `validate-responses` (QTI 3.0.1
 * §7.19.7) its test's item ref holds, read from the document, never a caller's flag; or an item
 * delivered alone, in no test part, where validate-responses is not applicable, so nothing is
 * validated.
 */
export type Answered =
  | { readonly item: CompiledItem; readonly kind: "item" }
  | { readonly kind: "member"; readonly ref: string; readonly test: CompiledTest };

/**
 * One answer to grade.
 */
export interface AnswerInput {
  readonly answered: Answered;
  readonly context: ReadonlyMap<string, Value>;
  /**
   * What is in for its recorded operators, by place: each answer, or the decline of a place whose
   * every draw declined. Never in the input digest, which a completion brings them in after.
   */
  readonly evaluations: ReadonlyMap<number, Evaluation>;
  readonly readAt: Instant;
  readonly responses: Submitted;
  readonly session: ItemSession;
}

/**
 * The item an answer answers, and whether its session validates.
 */
interface AnsweredItem {
  readonly item: CompiledItem;
  readonly validate: boolean;
}

/**
 * The item an answer answers and whether its session validates: a member's, as its test's item ref
 * states them; an item delivered alone validates nothing. A member a test does not hold is a broken
 * contract.
 *
 * @param answered - What the answer answers.
 * @returns The item and whether validate-responses applies.
 */
const answeredItem = (answered: Answered): AnsweredItem => {
  if (answered.kind === "item") {
    return { item: answered.item, validate: false };
  }

  const ref = answered.test.itemRefs.find((each) => each.identifier === answered.ref);
  contract(
    ref !== undefined,
    `an answer answers an item ref its test holds; it holds no ${answered.ref}`,
  );

  return { item: ref.item, validate: ref.validate };
};

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
  /**
   * The responses the answer was graded on, by identifier: the posted values, every response
   * admission hides (§5.148) set to NULL, so the answer's write stores exactly what was graded.
   */
  readonly responses: ReadonlyMap<string, Value>;
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
  /**
   * What is in for its recorded operators, by place: each answer, or the decline of a place whose
   * every draw declined. Never in the input digest, which a completion brings them in after.
   */
  readonly evaluations: ReadonlyMap<number, Evaluation>;
  readonly item: CompiledItem;
  readonly ref: MemberRef;
  readonly responses: Submitted;
  readonly session: ItemSession;
}

/**
 * A member processed before, whose outcomes the test's outcome processing reads as they are.
 */
export interface CarriedMember {
  /**
   * Its built-in `duration`, in seconds.
   */
  readonly duration: number;
  readonly item: CompiledItem;
  readonly numAttempts: bigint;
  readonly outcomes: ReadonlyMap<string, Value>;
  readonly ref: MemberRef;
  readonly responses: ReadonlyMap<string, Value>;
  readonly take: Take;
}

/**
 * A member selected for the sitting and never presented: no take, no attempt, every variable at its
 * declared start (§2.11.2.5).
 */
export interface UnpresentedMember {
  readonly item: CompiledItem;
  readonly ref: MemberRef;
}

/**
 * A sitting to grade. Its members are every member selected for it, each once: the closing, the
 * pending, the carried and the unpresented.
 */
export interface SittingInput {
  readonly carried: readonly CarriedMember[];
  readonly closing: readonly ClosingMember[];
  readonly context: ReadonlyMap<string, Value>;
  /**
   * Who ended the sitting: the candidate, by a submission `validate-responses` gates (§7.19.7), or
   * the system (a time limit, a staff or system close), which no validation gates.
   */
  readonly endedBy: "candidate" | "system";
  /**
   * The members whose answer is still Pending when the sitting ends (an essay in an individual part
   * awaiting its evaluation), each its attempt as its answer graded it: the same item, responses
   * and session, and the recorded answers in so far. The sitting grades each attempt again, so its
   * demands are derived where processing derives every demand (the Demand gradeAnswer's Pending
   * carries); while any is not in, the sitting's grade is Pending and its outcomes not final, and
   * completePending, given the answers, completes it as the answer graded with them would be.
   */
  readonly pending: readonly ClosingMember[];
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
  readonly unpresented: readonly UnpresentedMember[];
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
      /**
       * The members whose attempt is unscored (every recorded place it reached declined): final,
       * their outcomes NULL, and the test's outcomes whatever its outcome processing computes over
       * them, as QTI reads a NULL.
       */
      readonly unscored: readonly MemberRef[];
    }
  | {
      readonly demands: readonly (Demand & { readonly ref: MemberRef })[];
      readonly kind: "pending";
      readonly members: readonly MemberGrade[];
    }
  | {
      readonly kind: "refused";
      /**
       * Every closing member whose responses its admission refused, with the reasons, so the
       * candidate is shown each item to complete. A refused submission writes nothing.
       */
      readonly refusals: readonly { readonly admission: Admission; readonly ref: MemberRef }[];
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
  submitted.kind === "default" ? new Map() : submitted.values;

/**
 * What a grade read of a member's responses.
 *
 * @param submitted - Which responses.
 * @returns The read, with the values' digest.
 */
const readOf = (submitted: Submitted): ResponsesRead => ({
  digest: valuesDigest(valuesOf(submitted)),
  saved: submitted.kind === "save" ? { at: submitted.at, kind: "save" } : { kind: submitted.kind },
});

/**
 * The attempt a member's grade processes.
 *
 * @param member - The member.
 * @param context - The context values.
 * @returns The attempt.
 */
const attemptOf = (
  member: Pick<ClosingMember, "evaluations" | "item" | "session">,
  context: ReadonlyMap<string, Value>,
  responses: ReadonlyMap<string, Value>,
): Attempt => ({
  context,
  duration: member.session.duration,
  evaluations: member.evaluations,
  item: member.item,
  numAttempts: member.session.numAttempts,
  prior: member.session.prior,
  responses,
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
 * An instant's encoding.
 *
 * @param instant - The instant.
 * @returns Its microseconds, in decimal.
 */
const instantText = (instant: Instant): string => instant.microseconds.toString(10);

/**
 * A take's encoding.
 *
 * @param take - The take.
 * @returns Its encoding.
 */
const takeText = (take: Take): string =>
  fieldsText({
    correct: valuesText(take.correct),
    defaults: valuesText(take.defaults),
    templates: valuesText(take.templates),
  } satisfies Fields<Take>);

/**
 * A prior's encoding.
 *
 * @param prior - The processed attempt a session follows, or none.
 * @returns Its encoding.
 */
const priorText = (prior: Prior): string =>
  prior.kind === "processed"
    ? fieldsText({
        at: instantText(prior.at),
        kind: prior.kind,
        outcomes: valuesText(prior.outcomes),
      } satisfies Fields<typeof prior>)
    : fieldsText({ kind: prior.kind } satisfies Fields<typeof prior>);

/**
 * A session's encoding.
 *
 * @param session - The session.
 * @returns Its encoding.
 */
const sessionText = (session: ItemSession): string =>
  fieldsText({
    duration: bitsOf(session.duration),
    numAttempts: session.numAttempts.toString(10),
    prior: priorText(session.prior),
    seed: session.seed.key,
    take: takeText(session.take),
  } satisfies Fields<ItemSession>);

/**
 * Submitted responses' encoding.
 *
 * @param submitted - Which responses.
 * @returns Their encoding.
 */
const submittedText = (submitted: Submitted): string => {
  switch (submitted.kind) {
    case "default": {
      return fieldsText({ kind: submitted.kind } satisfies Fields<typeof submitted>);
    }
    case "posted": {
      return fieldsText({
        kind: submitted.kind,
        values: valuesText(submitted.values),
      } satisfies Fields<typeof submitted>);
    }
    case "save": {
      return fieldsText({
        at: instantText(submitted.at),
        kind: submitted.kind,
        values: valuesText(submitted.values),
      } satisfies Fields<typeof submitted>);
    }
  }
};

/**
 * A member ref's encoding.
 *
 * @param ref - The ref.
 * @returns Its encoding.
 */
const refText = (ref: MemberRef): string =>
  fieldsText({
    identifier: ref.identifier,
    occurrence: ref.occurrence.toString(10),
  } satisfies Fields<MemberRef>);

/**
 * Members' encoding, ordered by ref, so the order a caller lists them in moves no digest (a
 * sitting processes its members in the test's order whatever it is given).
 *
 * @param members - The members.
 * @param text - One member's encoding.
 * @returns Their encoding.
 */
const membersText = <M extends { readonly ref: MemberRef }>(
  members: readonly M[],
  text: (member: M) => string,
): string =>
  members
    .map((member) => ({ key: refText(member.ref), text: text(member) }))
    .toSorted((left, right) => (left.key < right.key ? -1 : 1))
    .map((each) => framed(each.text))
    .join("");

/**
 * A closing or pending member's encoding: its attempt but the recorded answers in.
 *
 * @param member - The member.
 * @returns Its encoding.
 */
const attemptText = (member: ClosingMember): string =>
  fieldsText({
    evaluations: "",
    item: member.item.digest.sha256,
    ref: refText(member.ref),
    responses: submittedText(member.responses),
    session: sessionText(member.session),
  } satisfies Fields<ClosingMember>);

/**
 * The digest of a sitting's input but its recorded answers: every field of the sitting and of its
 * members, the closing members' `evaluations` alone left out, which a completion brings in.
 *
 * @param input - The sitting.
 * @returns The digest.
 */
const sittingDigest = (input: SittingInput): Digest =>
  textDigest(
    fieldsText({
      carried: membersText(input.carried, (member) =>
        fieldsText({
          duration: bitsOf(member.duration),
          item: member.item.digest.sha256,
          numAttempts: member.numAttempts.toString(10),
          outcomes: valuesText(member.outcomes),
          ref: refText(member.ref),
          responses: valuesText(member.responses),
          take: takeText(member.take),
        } satisfies Fields<CarriedMember>),
      ),
      closing: membersText(input.closing, attemptText),
      context: valuesText(input.context),
      endedBy: input.endedBy,
      pending: membersText(input.pending, attemptText),
      readAt: instantText(input.readAt),
      startedAt: instantText(input.startedAt),
      test: input.test.digest.sha256,
      testSeed: input.testSeed.key,
      unpresented: membersText(input.unpresented, (member) =>
        fieldsText({
          item: member.item.digest.sha256,
          ref: refText(member.ref),
        } satisfies Fields<UnpresentedMember>),
      ),
    } satisfies Fields<SittingInput>),
  );

/**
 * The digest of an answer's input but its recorded answers.
 *
 * @param input - The answer.
 * @returns The digest.
 */
const answerDigest = (input: AnswerInput): Digest =>
  textDigest(
    fieldsText({
      answered:
        input.answered.kind === "item"
          ? fieldsText({
              item: input.answered.item.digest.sha256,
              kind: input.answered.kind,
            } satisfies Fields<typeof input.answered>)
          : fieldsText({
              kind: input.answered.kind,
              ref: input.answered.ref,
              test: input.answered.test.digest.sha256,
            } satisfies Fields<typeof input.answered>),
      context: valuesText(input.context),
      evaluations: "",
      readAt: instantText(input.readAt),
      responses: submittedText(input.responses),
      session: sessionText(input.session),
    } satisfies Fields<AnswerInput>),
  );

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
 * The responses an answer is graded on, from where they came: a save's or a post's values with
 * every response admission hides set to NULL, so its proof digests exactly the map the answer
 * write stores, and an answer rebuilt from that map digests alike (admission hides the same
 * responses again); a default submission as it is, its graded map following from the item.
 *
 * @param submitted - The responses as submitted.
 * @param shown - The values graded.
 * @returns The responses as graded.
 */
const gradedOf = (submitted: Submitted, shown: ReadonlyMap<string, Value>): Submitted =>
  submitted.kind === "default" ? submitted : { ...submitted, values: shown };

/**
 * An attempt's responses, one value for every response its item declares: a default
 * submission's the begun record (each response at its default, §2.2.2.1), where alone QTI puts a
 * response's default; a save's or a post's its values, which must name every declared response,
 * an unanswered one NULL. A missing response is a broken contract, never a default, so an absent
 * response and a NULL one are never two meanings.
 *
 * @param item - The item.
 * @param take - The take whose defaults the begun record holds.
 * @param submitted - The responses as submitted.
 * @returns The values, by identifier.
 */
const responsesOf = (
  item: CompiledItem,
  take: Take,
  submitted: Submitted,
): ReadonlyMap<string, Value> => {
  const declared = [...item.declarations.values()].filter(
    (declaration) => declaration.role === "response",
  );
  if (submitted.kind === "default") {
    return new Map(
      declared.map((declaration) => [
        declaration.identifier,
        take.defaults.get(declaration.identifier) ?? declaration.default,
      ]),
    );
  }

  for (const declaration of declared) {
    contract(
      submitted.values.has(declaration.identifier),
      `a ${submitted.kind}'s values name every response the item declares, an unanswered one NULL; they name no ${declaration.identifier}`,
    );
  }

  return submitted.values;
};

/**
 * An attempt's responses through admission: its reasons, the values it is graded on (every
 * response admission hides NULL, §5.148) and the responses as graded.
 */
interface Admitted {
  readonly admission: Admission;
  readonly graded: Submitted;
  readonly shown: ReadonlyMap<string, Value>;
}

/**
 * Admit an attempt's responses: hide what the values in force close, and judge them against the
 * interactions' limits, tier (b)'s too where `validate` holds and the attempt counts (reading
 * `end-attempt-validation`).
 *
 * @param item - The attempt's item.
 * @param session - Its session.
 * @param submitted - Its responses as submitted.
 * @param validate - Whether validate-responses applies.
 * @returns The admission and the responses as graded.
 */
const admitted = (
  item: CompiledItem,
  session: ItemSession,
  submitted: Submitted,
  validate: boolean,
): Admitted => {
  const posted = responsesOf(item, session.take, submitted);
  const admission = admit(
    item,
    posted,
    heldOf(item, session),
    validate && countsAttempt(item, posted),
  );
  const shown = new Map(posted);
  for (const response of admission.hidden) {
    const declaration = item.declarations.get(response);
    if (declaration !== undefined) {
      shown.set(response, nullOf(declaration.type));
    }
  }

  return { admission, graded: gradedOf(submitted, shown), shown };
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
  const { item, validate } = answeredItem(input.answered);
  const {
    admission,
    graded: asGraded,
    shown,
  } = admitted(item, input.session, input.responses, validate);
  const proof: GradeProof = {
    inputDigest: answerDigest({ ...input, responses: asGraded }),
    prior: priorOf(input.session.prior),
    program: item.digest,
    readAt: input.readAt,
    responses: [readOf(asGraded)],
  };
  if (admission.reasons.length > 0) {
    return mint({ responses: shown, result: { admission, kind: "refused" } }, proof);
  }

  const result = attemptWith(table, attemptOf({ ...input, item }, input.context, shown));

  return result.kind === "failed" ? result : mint({ responses: shown, result }, proof);
};

/**
 * What a member's state is read from.
 */
interface MemberSource {
  readonly completionStatus: Value;
  readonly duration: number;
  readonly item: CompiledItem;
  readonly numAttempts: bigint;
  readonly outcomes: ReadonlyMap<string, Value>;
  readonly ref: MemberRef;
  readonly responses: ReadonlyMap<string, Value>;
  readonly take: Take;
}

/**
 * A member's response, which its map names, as every map of a member's responses names each
 * declared response.
 *
 * @param responses - The member's responses.
 * @param identifier - The response.
 * @returns Its value.
 */
const heldResponse = (responses: ReadonlyMap<string, Value>, identifier: string): Value => {
  const value = responses.get(identifier);
  contract(
    value !== undefined,
    `a member's responses name every response its item declares; they name no ${identifier}`,
  );

  return value;
};

/**
 * A member's state as outcome processing reads it.
 *
 * @param source - The member.
 * @param test - The test.
 * @returns The state.
 */
const memberStateOf = (source: MemberSource, test: CompiledTest): MemberState => {
  const { item, numAttempts, outcomes, ref, responses, take } = source;
  const itemRef = test.itemRefs.find((each) => each.identifier === ref.identifier);
  const declarations = [...item.declarations.values()];
  const memberResponses: MemberResponse[] = declarations
    .filter((declaration) => declaration.role === "response")
    .map((declaration) => ({
      correct: take.correct.get(declaration.identifier) ?? declaration.correct,
      default: take.defaults.get(declaration.identifier) ?? declaration.default,
      identifier: declaration.identifier,
      value: heldResponse(responses, declaration.identifier),
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
    completionStatus: source.completionStatus,
    duration: source.duration,
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
 * A take with nothing set: an unpresented member's, whose template processing never ran.
 */
const noTake: Take = { correct: noDefaults, defaults: noDefaults, templates: noDefaults };

/**
 * `completionStatus` before any attempt (§2.2.2.4).
 */
const notAttempted = textValue("identifier", "not_attempted");

/**
 * An unpresented member's source: every outcome at its declared start, no attempt, no time.
 *
 * @param member - The member.
 * @returns Its source.
 */
const unpresentedSource = (member: UnpresentedMember): MemberSource => ({
  completionStatus: notAttempted,
  duration: 0,
  item: member.item,
  numAttempts: 0n,
  outcomes: new Map(
    [...member.item.declarations.values()]
      .filter((declaration) => declaration.role === "outcome")
      .map((declaration) => [declaration.identifier, startOf(declaration, noDefaults)]),
  ),
  ref: member.ref,
  responses: responsesOf(member.item, noTake, { kind: "default" }),
  take: noTake,
});

/**
 * Members in the test's order: by their item ref's place in it, then by occurrence (§2.11.2's
 * `qti-test-variables` gathers values in that order).
 *
 * @param states - The members.
 * @param test - The test.
 * @returns Them, ordered.
 */
const inTestOrder = (states: readonly MemberState[], test: CompiledTest): MemberState[] => {
  const placeOf = new Map(test.itemRefs.map((each, index) => [each.identifier, index]));

  return states.toSorted((left, right) => {
    const byRef =
      (placeOf.get(left.identifier) ?? placeOf.size) -
      (placeOf.get(right.identifier) ?? placeOf.size);
    if (byRef !== 0) {
      return byRef;
    }

    return left.occurrence < right.occurrence ? -1 : Number(left.occurrence > right.occurrence);
  });
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
 * A sitting through admission: each attempt with its admission, the sitting with its responses as
 * graded, and the refusals that refuse the candidate's submission.
 */
interface AdmittedSitting {
  readonly attempts: readonly { readonly admission: Admitted; readonly member: ClosingMember }[];
  readonly graded: SittingInput;
  readonly refusals: readonly { readonly admission: Admission; readonly ref: MemberRef }[];
}

/**
 * A sitting's closing and pending members through admission (one admission, one meaning, as an
 * answer's): every hidden response NULL; validation where the candidate ended the sitting, by a
 * closing member's validate-responses (a pending member's answer was admitted when it was given),
 * and none where the system closed it, every member then graded as it stands.
 *
 * @param input - The sitting.
 * @returns The sitting through admission.
 */
const admittedSitting = (input: SittingInput): AdmittedSitting => {
  const byCandidate = input.endedBy === "candidate";
  const closing = input.closing.map((member) => ({
    admission: admitted(
      member.item,
      member.session,
      member.responses,
      byCandidate &&
        input.test.itemRefs.some((ref) => ref.identifier === member.ref.identifier && ref.validate),
    ),
    member,
  }));
  const pending = input.pending.map((member) => ({
    admission: admitted(member.item, member.session, member.responses, false),
    member,
  }));
  const asGraded = (each: (typeof closing)[number]): ClosingMember => ({
    ...each.member,
    responses: each.admission.graded,
  });

  return {
    attempts: [...closing, ...pending],
    graded: { ...input, closing: closing.map(asGraded), pending: pending.map(asGraded) },
    refusals: byCandidate
      ? closing
          .filter(({ admission }) => admission.admission.reasons.length > 0)
          .map(({ admission, member }) => ({ admission: admission.admission, ref: member.ref }))
      : [],
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
  const { attempts, graded: sittingGraded, refusals } = admittedSitting(input);
  const proof: GradeProof = {
    inputDigest: sittingDigest(sittingGraded),
    prior: { kind: "none" },
    program: input.test.digest,
    readAt: input.readAt,
    responses: attempts.map(({ admission }) => readOf(admission.graded)),
  };
  if (refusals.length > 0) {
    return mint({ kind: "refused", refusals }, proof);
  }

  const members: MemberGrade[] = [];
  const states: MemberState[] = [];
  const demands: (Demand & { readonly ref: MemberRef })[] = [];
  const unscored: MemberRef[] = [];
  for (const { admission, member } of attempts) {
    const result = attemptWith(table, attemptOf(member, input.context, admission.shown));
    if (result.kind === "failed") {
      return result;
    }

    members.push({
      prior: priorOf(member.session.prior),
      program: member.item.digest,
      read: readOf(admission.graded),
      ref: member.ref,
      result,
    });
    if (result.kind === "pending") {
      for (const demand of result.demands) {
        demands.push({ ...demand, ref: member.ref });
      }
    } else {
      if (result.kind === "unscored") {
        unscored.push(member.ref);
      }

      states.push(
        memberStateOf(
          {
            completionStatus: result.completionStatus,
            duration: member.session.duration,
            item: member.item,
            numAttempts: result.numAttempts,
            outcomes: result.outcomes,
            ref: member.ref,
            responses: admission.shown,
            take: member.session.take,
          },
          input.test,
        ),
      );
    }
  }

  for (const member of input.carried) {
    states.push(
      memberStateOf(
        {
          ...member,
          completionStatus: member.outcomes.get("completionStatus") ?? notAttempted,
        },
        input.test,
      ),
    );
  }

  for (const member of input.unpresented) {
    states.push(memberStateOf(unpresentedSource(member), input.test));
  }

  if (demands.length > 0) {
    return mint({ demands, kind: "pending", members }, proof);
  }

  const test = testOutcomes(table, input, inTestOrder(states, input.test));

  return test.kind === "failed"
    ? test
    : mint({ kind: "done", members, test: test.values, unscored }, proof);
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
  readonly pendingGrade: Graded<PendingGrade>;
}

/**
 * Complete a pending grade (D7, D8): the same attempts graded again with the recorded answers now
 * in. The completion's whole input but its recorded answers must be the one the pending grade
 * read, by its proof's input digest, so a drifted completion is refused and never minted.
 *
 * @param table - The standard operators.
 * @param input - The sitting and the pending grade.
 * @returns The grade, Done or still Pending, or the failure.
 */
export const completePendingWith = <K extends ExpressionKind>(
  table: OperatorTable<K>,
  input: CompletionInput,
): Failed | Graded<SittingGrade> => {
  const pending = proofOf(input.pendingGrade).inputDigest;
  const given = sittingDigest(admittedSitting(input).graded);
  if (given.sha256 !== pending.sha256) {
    return { failure: { given, kind: "completion-mismatch", pending }, kind: "failed" };
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
