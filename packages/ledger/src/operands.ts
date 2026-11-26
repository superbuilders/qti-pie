/**
 * What a recorded application's request is made of, per attempt, derived and never stored, at the
 * Delivery level over the ledger: the operands a registered evaluator sends (`rubric-score`'s,
 * `#registry/operators.ts`), and the laws that hold its answer, a machine's reply or a person's
 * value, to the application's maximum.
 *
 * - **ApplicationOperands** `(child, package, path, n, at, operator, identifier) → stage, response,
 *   rubric, grader`: each recorded application whose request is made, the attempt's demand of it
 *   (`ApplicationDemand`, what the grader's run reached with a response), with the response its
 *   essay operand names (`identifier`, `ApplicationResponse`'s) and that response's text, the
 *   rubric group its `rubric` operand names (`RubricApplication`) and the grader version in force
 *   for its class (`InForceGrader`). The response's identifier is a column, never projected away,
 *   so the relation keeps its root key: an application of a class with several essay operands has a
 *   row of each, and two responses of one text are two rows, never one.
 * - The maximum, the value its `maximum` operand, a `qti-default`, takes in the attempt's item
 *   session ("This expression looks up the declaration of an itemVariable and returns the
 *   associated defaultValue or NULL if no default value was declared", ASI Table 5.42), is no
 *   derivation here: the grader evaluates it when its run demands the application, and the grade
 *   stores it (`ApplicationMaximum`, the ledger's), so the default in force has one
 *   implementation.
 * - **ApplicationDraw** `(package, path, operator) → draw`: its `draw` operand, a literal of the
 *   content, its `qti-base-value`'s text as written, which pantry's value domain holds to the
 *   integer lexical space; a `qti-null` draw has no row, NULL.
 *
 * NULL is no row, as everywhere in the ledger (grizzle holds no NULL), so the maximum and the draw
 * stand beside ApplicationOperands rather than in it, and an application with a NULL operand still
 * has its operands' row.
 *
 * Laws: **Reply within maximum** and **Human within maximum**: a machine's reply (`OperatorReply`)
 * never exceeds its application's maximum (`ApplicationMaximum`), and a person's value
 * (`HumanOperatorValue`) never the least maximum of its group's applications the run reached
 * (`HumanDemandMaximum`), where they have one (`rubric-score`'s contract: "`score` is in [0,
 * maximum]. A reply outside that range is a decline, never clamped"), refused at the write. Each
 * reads stored facts of the attempt alone, never the content, so no publish judges them. A Ledger
 * law cannot state them: each reads a join of two of its relations, and a level states a law over
 * a join as a rule over a query of the level above.
 */
import { check, derived, query, v } from "@bjornpagen/grizzle";
import type { LedgerLevel } from "#ledger/delivery.ts";
import { named } from "#ledger/laws.ts";

/**
 * Each recorded application's request operands at an attempt, as a plain query: a relation of this
 * level reads it, never the derived relation beside it.
 *
 * @param ledger - The ledger level.
 * @returns The query.
 */
export const applicationOperandsOf = (ledger: LedgerLevel) => {
  const {
    ApplicationDemand,
    ApplicationResponse,
    InForceGrader,
    ItemSession,
    RecordedApplication,
    RubricApplication,
    SnapshotSingleString,
  } = ledger.relations;

  return query(ledger).rule((r) => {
    const { child, package: pkg, path, n, at, operator } = v(ApplicationDemand, "requested");
    const { stage } = v(ItemSession, "requestedSession");
    const { class: operatorClass } = v(RecordedApplication, "requestedApplication");
    const { identifier } = v(ApplicationResponse, "requestedResponse");
    const { value: response } = v(SnapshotSingleString, "requestedText");
    const { rubric } = v(RubricApplication, "requestedRubric");
    const { version: grader } = v(InForceGrader, "requestedGrader");

    return r
      .match(ApplicationDemand, { at, child, n, operator, package: pkg, path })
      .match(ItemSession, { child, n, package: pkg, path, stage })
      .match(RecordedApplication, { class: operatorClass, package: pkg, path, start: operator })
      .match(ApplicationResponse, { identifier, package: pkg, path, start: operator })
      .match(SnapshotSingleString, {
        at,
        child,
        n,
        package: pkg,
        path,
        value: response,
        variable: identifier,
      })
      .match(RubricApplication, { package: pkg, path, rubric, start: operator })
      .match(InForceGrader, { class: operatorClass, version: grader })
      .find({
        at,
        child,
        grader,
        identifier,
        n,
        operator,
        package: pkg,
        path,
        response,
        rubric,
        stage,
      });
  });
};

/**
 * The Delivery level's relations and laws of a recorded application's operands over the ledger
 * `ledger`.
 *
 * @param ledger - The ledger level.
 * @returns The derived relations and the laws.
 */
export const applicationOperandRelationsOf = (ledger: LedgerLevel) => {
  const {
    ApplicationLiteral,
    ApplicationMaximum,
    HumanDemandMaximum,
    HumanOperatorValue,
    OperatorOperand,
    OperatorReply,
    RecordedApplication,
  } = ledger.relations;

  const ApplicationOperands = derived("ApplicationOperands", applicationOperandsOf(ledger));

  const ApplicationDraw = derived(
    "ApplicationDraw",
    query(ledger).rule((r) => {
      const {
        package: pkg,
        path,
        start: operator,
        class: operatorClass,
      } = v(RecordedApplication, "drawn");
      const { rank } = v(OperatorOperand, "drawSlot");
      const { text } = v(ApplicationLiteral, "drawLiteral");

      return r
        .match(RecordedApplication, { class: operatorClass, package: pkg, path, start: operator })
        .match(OperatorOperand, { class: operatorClass, operand: "draw", rank })
        .match(ApplicationLiteral, { operator, package: pkg, path, rank, text })
        .find({ draw: text, operator, package: pkg, path });
    }),
  );

  /**
   * Each machine's reply beside its application's maximum at the attempt.
   */
  const ReplyBound = derived(
    "ReplyBound",
    query(ledger).rule((r) => {
      const {
        child,
        package: pkg,
        path,
        n,
        at,
        operator,
        evaluated,
        score,
      } = v(OperatorReply, "reply");
      const { maximum } = v(ApplicationMaximum, "replyMaximum");

      return r
        .match(OperatorReply, { at, child, evaluated, n, operator, package: pkg, path, score })
        .match(ApplicationMaximum, { at, child, maximum, n, operator, package: pkg, path })
        .find({ at, child, evaluated, maximum, n, operator, package: pkg, path, score });
    }),
  );

  /**
   * Each person's value beside its group's maximum at the attempt, the least of its reached
   * applications'.
   */
  const HumanValueBound = derived(
    "HumanValueBound",
    query(ledger).rule((r) => {
      const {
        child,
        package: pkg,
        path,
        n,
        at,
        rubric,
        asserted,
        score,
      } = v(HumanOperatorValue, "person");
      const { maximum } = v(HumanDemandMaximum, "personMaximum");

      return r
        .match(HumanOperatorValue, { asserted, at, child, n, package: pkg, path, rubric, score })
        .match(HumanDemandMaximum, { at, child, maximum, n, package: pkg, path, rubric })
        .find({ asserted, at, child, maximum, n, package: pkg, path, rubric, score });
    }),
  );

  return {
    laws: [
      named(
        "Reply within maximum",
        check("Reply_within_maximum", ReplyBound, (b) => b.le(b.score, b.maximum)),
      ),
      named(
        "Human within maximum",
        check("Human_within_maximum", HumanValueBound, (b) => b.le(b.score, b.maximum)),
      ),
    ],
    relations: [ApplicationOperands, ApplicationDraw, ReplyBound, HumanValueBound],
  } as const;
};
