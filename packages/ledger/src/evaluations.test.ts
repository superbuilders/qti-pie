import type { CheckVerdict, Unevaluated } from "@bjornpagen/grizzle"
import { rowEvaluator } from "@bjornpagen/grizzle"
import { exhaust } from "@bjornpagen/testing/explore"
import { requiredInSpace } from "@bjornpagen/testing/features"
import { element, type Gen, int, map, oneOf } from "@bjornpagen/testing/gen"
import { searched } from "@bjornpagen/testing/vitest"
import { assert, describe, it } from "@effect/vitest"
import { QtiLom } from "@qti-pie/pantry/qti/lom.ts"
import { Duration, Effect, Formatter, Option, Result } from "effect"
import { ledgerOf } from "#ledger/ledger.ts"
import type { GraderVersion } from "#ledger/registry/contract.ts"
import { registryOf } from "#ledger/registry/levels.ts"
import { customOperators } from "#ledger/registry/operators.ts"

/**
 * A grader version of `rubric-score`, which the composition below registers: the installation's own registers none, and
 * a fact names one.
 */
const grader: GraderVersion = {
	class: "rubric-score",
	criteria: "{{rubric}} {{response}}",
	effort: "high",
	endpoint: "https://grader.invalid/v1",
	instructions: "Score from 0 to {{maximum}}.",
	maxOutputTokens: 1,
	model: "grader",
	prompt: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
	vendor: "grader",
	version: "rubric-score-1"
}

/** The ledger over a registry of the general-purpose operators, that one grader version and a one-entry seed. */
const Ledger = ledgerOf(
	registryOf(QtiLom, {
		operators: customOperators,
		graders: [grader],
		rubricUses: ["ext:criteria"],
		tables: [{ table: "unit-table", key: "mm", value: Option.some("mm"), place: 1 }],
		bindings: [{ class: "quantity", role: "unit-spellings", place: 1, table: "unit-table" }]
	}).Registry
)

/** Grizzle's evaluator of the ledger's rows, the one evaluator it judges a refused write's rows by. */
const evaluator = Result.getOrThrow(rowEvaluator(Ledger))

const { HumanOperatorValue, OperatorEvaluation, OperatorReply } = Ledger.relations

/** A request's SHA-256: the empty body's, a digest of the form the ledger stores. */
const emptyDigest = "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"

/** The attempt and application every row below names: a child's attempt of an item, and its operator's place. */
const application = {
	at: 1_763_600_000_000_000n,
	child: "user_registry",
	evaluated: 1_763_600_000_000_001n,
	path: "items/essay.xml",
	n: 0n,
	operator: 7n,
	package: "registry"
} as const

/**
 * Read a check's verdict as the database gives it.
 *
 * @param verdict - The check's verdict, as grizzle's evaluator gives it.
 * @param what - The check and the row, for a failure's words.
 * @returns Whether the row holds the check; the case fails where the host does not evaluate it.
 */
const holds = (verdict: Result.Result<CheckVerdict, Unevaluated>, what: string): boolean =>
	Result.isSuccess(verdict)
		? verdict.success === "holds"
		: assert.fail(`${what}: the host evaluates it`)

/** A case: an evaluation of a class by the grader version, or a reply of a score. */
type Row =
	| Readonly<{ kind: "evaluation"; class: (typeof customOperators)[number]["class"] }>
	| Readonly<{ kind: "reply"; score: number }>

/**
 * A double by its top thirteen bits, its sign, its exponent and its mantissa's first bit, the rest zero: so every
 * exponent of both signs, among them the zeros and subnormals (exponent 0) and the infinities and a NaN (exponent
 * 2047), each with and without its mantissa's first bit.
 *
 * @param top - The thirteen bits, from 0 to 8191.
 * @returns The double.
 */
const doubleOf = (top: number): number => {
	const view = new DataView(new ArrayBuffer(8))
	view.setUint16(0, top * 8)
	return view.getFloat64(0)
}

/** Every case: each class beside the grader version, and each double by its top thirteen bits. */
const rows: Gen<Row> = oneOf([
	map(element(customOperators), (operator): Row => ({ kind: "evaluation", class: operator.class })),
	map(int(0, 8191), (top): Row => ({ kind: "reply", score: doubleOf(top) }))
])

/** What a case reaches: a check held, and one broken. */
type Situation = "grader agrees" | "grader disagrees" | "score held" | "score refused"

/**
 * Hold a case's row to its check.
 *
 * @param row - The case.
 * @param note - Records the situation the case reaches.
 */
const holdRow = (row: Row, note: (situation: Situation) => void) => {
	if (row.kind === "evaluation") {
		const expected = grader.class === row.class
		note(expected ? "grader agrees" : "grader disagrees")
		const admitted = Result.getOrThrow(
			evaluator.admit(OperatorEvaluation, {
				...application,
				class: row.class,
				grader: grader.version,
				request: emptyDigest,
				result: "replied"
			})
		)
		assert.strictEqual(
			holds(evaluator(OperatorEvaluation, admitted).checks.Evaluation_grader, row.class),
			expected,
			`${row.class} by ${grader.version}`
		)
		return
	}
	const expected = Number.isFinite(row.score) && row.score >= 0
	note(expected ? "score held" : "score refused")
	const reply = Result.getOrThrow(
		evaluator.admit(OperatorReply, { ...application, score: row.score })
	)
	assert.strictEqual(
		holds(evaluator(OperatorReply, reply).checks.Reply_score, String(row.score)),
		expected,
		`a reply's score ${String(row.score)}`
	)
	const human = Result.getOrThrow(
		evaluator.admit(HumanOperatorValue, {
			...application,
			asserted: application.evaluated,
			rubric: "AI_RUBRIC",
			scorer: "user_teacher",
			score: row.score
		})
	)
	assert.strictEqual(
		holds(evaluator(HumanOperatorValue, human).checks.Human_score, String(row.score)),
		expected,
		`a person's score ${String(row.score)}`
	)
}

describe("an operator's ledger fact", () => {
	it.effect(
		"names a grader version of its own class, and a reply's and a person's score of zero or more that is finite",
		(ctx) =>
			searched(
				ctx,
				exhaust(
					{
						box: "every registered class beside a grader version of rubric-score; every double by its sign, exponent and first mantissa bit",
						caseHang: Duration.minutes(1),
						coverage: requiredInSpace<Situation>([
							"grader agrees",
							"grader disagrees",
							"score held",
							"score refused"
						]),
						generator: rows,
						literal: (row) => Formatter.format(row),
						oracle: {
							kind: "specification",
							name: "the grader version's class and IEEE 754, by hand"
						},
						suite: "ledger/operator-facts"
					},
					(row, c) => Effect.sync(() => holdRow(row, (situation) => c.note(situation)))
				)
			)
	)
})
