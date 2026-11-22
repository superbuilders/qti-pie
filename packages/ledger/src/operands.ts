/**
 * What a recorded application's request is made of, per attempt, derived and never stored, at the Delivery level over
 * the ledger: the operands a registered evaluator sends (`rubric-score`'s, `#registry/operators.ts`), and the laws that
 * hold its answer, a machine's reply or a person's value, to the application's maximum.
 *
 * - **ApplicationOperands** `(child, package, path, n, at, operator) → stage, response, rubric, grader`: each recorded
 *   application whose request is made (its essay's response non-NULL), with the response's text, the rubric group its
 *   `rubric` operand names (`RubricApplication`) and the grader version in force for its class (`InForceGrader`).
 * - **ApplicationMaximum** `(child, package, path, n, at, operator) → maximum`: the value its `maximum` operand, a
 *   `qti-default`, takes in the attempt's item session: "This expression looks up the declaration of an itemVariable
 *   and returns the associated defaultValue or NULL if no default value was declared" (ASI Table 5.42), the default in
 *   force being what the session's template processing set (`qti-set-default-value`, Table 6.51.4) where it set one, else
 *   the declared one. No row is NULL.
 * - **ApplicationDraw** `(package, path, operator) → draw`: its `draw` operand, a literal of the content, its
 *   `qti-base-value`'s text as written, which pantry's value domain holds to the integer lexical space; a `qti-null`
 *   draw has no row, NULL.
 *
 * NULL is no row, as everywhere in the ledger (grizzle holds no NULL), so the maximum and the draw stand beside
 * ApplicationOperands rather than in it, and an application with a NULL operand still has its operands' row.
 *
 * Laws: **Reply within maximum** and **Human within maximum**: a machine's reply (`OperatorReply`) and a person's value
 * (`HumanOperatorValue`, for every application of its rubric group) never exceed the application's maximum, where it
 * has one (`rubric-score`'s contract: "`score` is in [0, maximum]. A reply outside that range is a decline, never
 * clamped"), refused at the write. A Ledger law cannot state them: each reads a join of the content, the session's
 * values and the answer, and a level states a law over a join as a rule over a query of the level above.
 */
import { check, derived, doubleText, Logic, query, Text, v } from "@bjornpagen/grizzle"
import type { LedgerLevel } from "#ledger/delivery.ts"

/**
 * Each recorded application's request operands at an attempt, as a plain query: a relation of this level reads it,
 * never the derived relation beside it.
 *
 * @param ledger - The ledger level.
 * @returns The query.
 */
export const applicationOperandsOf = (ledger: LedgerLevel) => {
	const {
		ApplicationResponse,
		Attempt,
		InForceGrader,
		ItemSession,
		RecordedApplication,
		RubricApplication,
		SnapshotSingleString
	} = ledger.relations
	return query(ledger).rule((r) => {
		const { child, package: pkg, path, n, at } = v(Attempt, "requested")
		const { stage } = v(ItemSession, "requestedSession")
		const { start: operator, class: operatorClass } = v(RecordedApplication, "requestedApplication")
		const { identifier } = v(ApplicationResponse, "requestedResponse")
		const { value: response } = v(SnapshotSingleString, "requestedText")
		const { rubric } = v(RubricApplication, "requestedRubric")
		const { version: grader } = v(InForceGrader, "requestedGrader")
		return r
			.match(Attempt, { child, package: pkg, path, n, at })
			.match(ItemSession, { child, package: pkg, path, n, stage })
			.match(RecordedApplication, { package: pkg, path, start: operator, class: operatorClass })
			.match(ApplicationResponse, { package: pkg, path, start: operator, identifier })
			.match(SnapshotSingleString, {
				child,
				package: pkg,
				path,
				n,
				at,
				variable: identifier,
				value: response
			})
			.match(RubricApplication, { package: pkg, path, start: operator, rubric })
			.match(InForceGrader, { class: operatorClass, version: grader })
			.find({ child, package: pkg, path, n, at, operator, stage, response, rubric, grader })
	})
}

/**
 * Each recorded application's `maximum` operand at an attempt's item session, as a plain query: the default in force of
 * the outcome its `qti-default` names (`ApplicationDefault`, at the rank `OperatorOperand` gives the class's `maximum`).
 *
 * @param ledger - The ledger level.
 * @returns The query.
 */
export const applicationMaximaOf = (ledger: LedgerLevel) => {
	const {
		ApplicationDefault,
		Attempt,
		DeclarationName,
		ItemSession,
		ItemSessionValueSingleFloat,
		Node,
		OperatorOperand,
		RecordedApplication
	} = ledger.relations

	/** Each attempt's recorded application with the outcome its `maximum` operand reads, and its item session's stage. */
	const maximumOperands = query(ledger).rule((r) => {
		const { child, package: pkg, path, n, at } = v(Attempt, "maximumAttempt")
		const { stage } = v(ItemSession, "maximumSession")
		const { start: operator, class: operatorClass } = v(RecordedApplication, "maximumApplication")
		const { rank } = v(OperatorOperand, "maximumSlot")
		const { identifier } = v(ApplicationDefault, "maximumDefault")
		return r
			.match(Attempt, { child, package: pkg, path, n, at })
			.match(ItemSession, { child, package: pkg, path, n, stage })
			.match(RecordedApplication, { package: pkg, path, start: operator, class: operatorClass })
			.match(OperatorOperand, { class: operatorClass, operand: "maximum", rank })
			.match(ApplicationDefault, { package: pkg, path, operator, rank, identifier })
			.find({ child, package: pkg, path, n, at, operator, stage, identifier })
	})

	return query(ledger)
		.rule((r) => {
			const {
				child,
				package: pkg,
				path,
				n,
				at,
				operator,
				stage,
				identifier
			} = v(maximumOperands, "set")
			const { value: maximum } = v(ItemSessionValueSingleFloat, "setDefault")
			return r
				.match(maximumOperands, { child, package: pkg, path, n, at, operator, stage, identifier })
				.match(ItemSessionValueSingleFloat, {
					child,
					stage,
					package: pkg,
					path,
					kind: "default",
					variable: identifier,
					value: maximum
				})
				.find({ child, package: pkg, path, n, at, operator, maximum })
		})
		.rule((r) => {
			const {
				child,
				package: pkg,
				path,
				n,
				at,
				operator,
				stage,
				identifier
			} = v(maximumOperands, "declared")
			const { start: declaration } = v(DeclarationName, "declaration")
			const { start: set } = v(Node, "defaultSet")
			const { stringValue: lexical } = v(Node, "defaultValue")
			return r
				.match(maximumOperands, { child, package: pkg, path, n, at, operator, stage, identifier })
				.match(DeclarationName, {
					package: pkg,
					path,
					start: declaration,
					identifier,
					declarationKind: "qti-outcome-declaration"
				})
				.match(Node, {
					package: pkg,
					path,
					kind: "qti-default-value",
					parent: declaration,
					start: set
				})
				.match(Node, { package: pkg, path, kind: "qti-value", parent: set, stringValue: lexical })
				.where(
					r.not(ItemSessionValueSingleFloat, {
						child,
						stage,
						package: pkg,
						path,
						kind: "default",
						variable: identifier
					}),
					Text.matches(Text.collapse(lexical), doubleText)
				)
				.find({
					child,
					package: pkg,
					path,
					n,
					at,
					operator,
					maximum: Logic.when(
						Text.matches(Text.collapse(lexical), doubleText),
						(form) => Text.parseDouble(form),
						Number.NaN
					)
				})
		})
}

/**
 * The Delivery level's relations and laws of a recorded application's operands over the ledger `ledger`.
 *
 * @param ledger - The ledger level.
 * @returns The derived relations and the laws.
 */
export const applicationOperandRelationsOf = (ledger: LedgerLevel) => {
	const {
		ApplicationLiteral,
		HumanOperatorValue,
		OperatorOperand,
		OperatorReply,
		RecordedApplication,
		RubricApplication
	} = ledger.relations
	const maxima = applicationMaximaOf(ledger)

	const ApplicationOperands = derived("ApplicationOperands", applicationOperandsOf(ledger))

	const ApplicationMaximum = derived("ApplicationMaximum", maxima)

	const ApplicationDraw = derived(
		"ApplicationDraw",
		query(ledger).rule((r) => {
			const {
				package: pkg,
				path,
				start: operator,
				class: operatorClass
			} = v(RecordedApplication, "drawn")
			const { rank } = v(OperatorOperand, "drawSlot")
			const { text } = v(ApplicationLiteral, "drawLiteral")
			return r
				.match(RecordedApplication, { package: pkg, path, start: operator, class: operatorClass })
				.match(OperatorOperand, { class: operatorClass, operand: "draw", rank })
				.match(ApplicationLiteral, { package: pkg, path, operator, rank, text })
				.find({ package: pkg, path, operator, draw: text })
		})
	)

	/** Each machine's reply beside its application's maximum at the attempt. */
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
				score
			} = v(OperatorReply, "reply")
			const { maximum } = v(maxima, "replyMaximum")
			return r
				.match(OperatorReply, { child, package: pkg, path, n, at, operator, evaluated, score })
				.match(maxima, { child, package: pkg, path, n, at, operator, maximum })
				.find({ child, package: pkg, path, n, at, operator, evaluated, score, maximum })
		})
	)

	/** Each person's value beside the maximum of each application of its rubric group at the attempt. */
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
				score
			} = v(HumanOperatorValue, "person")
			const { start: operator } = v(RubricApplication, "personApplication")
			const { maximum } = v(maxima, "personMaximum")
			return r
				.match(HumanOperatorValue, { child, package: pkg, path, n, at, rubric, asserted, score })
				.match(RubricApplication, { package: pkg, path, start: operator, rubric })
				.match(maxima, { child, package: pkg, path, n, at, operator, maximum })
				.find({ child, package: pkg, path, n, at, rubric, asserted, operator, score, maximum })
		})
	)

	return {
		relations: [
			ApplicationOperands,
			ApplicationMaximum,
			ApplicationDraw,
			ReplyBound,
			HumanValueBound
		],
		laws: [
			check("Reply_within_maximum", ReplyBound, (b) => b.le(b.score, b.maximum)),
			check("Human_within_maximum", HumanValueBound, (b) => b.le(b.score, b.maximum))
		]
	} as const
}
