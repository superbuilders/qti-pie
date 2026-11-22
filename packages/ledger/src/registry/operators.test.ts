import { exhaust } from "@bjornpagen/testing/explore"
import { requiredInSpace } from "@bjornpagen/testing/features"
import { element, type Gen, map } from "@bjornpagen/testing/gen"
import { searched } from "@bjornpagen/testing/vitest"
import { assert, describe, it } from "@effect/vitest"
import { regex } from "arkregex"
import { Array as Arr, Duration, Effect } from "effect"
import type { CustomOperator } from "#ledger/registry/contract.ts"
import { operandBases } from "#ledger/registry/contract.ts"
import { customOperators, operatorTagPrefix } from "#ledger/registry/operators.ts"

/**
 * A QTI identifier as the registry names a class (QTI 3.0.1 ASI §7.16: "Identifiers containing the period character
 * are reserved for use in prefixing … identifiers may not contain the colon … Identifiers should have no more than 32
 * characters"), restricted to ASCII: an XML NCName's first character, then at most 31 more, none a period.
 */
const classPattern = regex("^[A-Za-z_][A-Za-z0-9_\\-]{0,31}$")

/**
 * An RFC 4151 tag URI: `tag:`, a tagging entity (a DNS name, a comma, a date `YYYY[-MM[-DD]]`), a colon, and the
 * specific part's characters (§2.1, `specific = *( pchar / "/" / "?" )`).
 */
const tagPattern = regex(
	"^tag:[a-z0-9.\\-]+,[0-9]{4}(?:-[0-9]{2}(?:-[0-9]{2})?)?:[A-Za-z0-9\\-._~!$&'()*+,;=:@/?]*$"
)

/** Every operator, read as the contract the roster states. */
const operators: ReadonlyArray<CustomOperator> = customOperators

/**
 * Each primitive's signature as the design states it (plan/composable-operators.md §2 and §4): its operands' bases,
 * cardinalities and forms in order, written as `base cardinality form`, and its result, `base cardinality` or a
 * record's `field:base` list. Read apart from the roster.
 */
const signatures: ReadonlyMap<string, Readonly<{ operands: string; result: string }>> = new Map([
	["normalize-space", { operands: "string single any", result: "string single" }],
	["tex-normal", { operands: "string single any", result: "string single" }],
	["numeral-normal", { operands: "string single any", result: "string single" }],
	["read-number", { operands: "string single any", result: "float single" }],
	["tokenize", { operands: "string single any, string single literal", result: "string ordered" }],
	[
		"translate",
		{
			operands: "string single any, string single literal, string single literal",
			result: "string single"
		}
	],
	["math-canonical", { operands: "string single any, boolean single literal", result: "string single" }],
	[
		"quantity",
		{ operands: "string single any", result: "value:float unit:identifier rest:string" }
	],
	[
		"unit-near",
		{
			operands: "string single any, string multiple literal",
			result: "unit:identifier distance:integer"
		}
	],
	[
		"phrase-distance",
		{
			operands: "string single any, string multiple literal, string multiple literal",
			result: "integer single"
		}
	],
	[
		"rubric-score",
		{
			operands:
				"string single essay, identifier single rubric, float single default, integer single literal",
			result: "score:float feedback:string"
		}
	],
	["markup-text", { operands: "string single any", result: "string single" }],
	["when-present", { operands: "any any any, any any any", result: "operand:value" }]
])

/** What a case reaches: each way an operator's value arises, and each kind of result. */
type Situation = "inline" | "recorded" | "record result" | "value result" | "operand result"

/**
 * Write an operator's result as {@link signatures} does: a record's `field:base` list, an operand-typed result's
 * `operand:name`, or a value's `base cardinality`.
 *
 * @param result - The result.
 * @returns It, written.
 */
const resultOf = (result: CustomOperator["result"]): string => {
	switch (result.cardinality) {
		case "record": {
			return result.fields.map(({ field, baseType }) => `${field}:${baseType}`).join(" ")
		}
		case "operand": {
			return `operand:${result.operand}`
		}
		case "single":
		case "multiple":
		case "ordered": {
			return `${result.baseType} ${result.cardinality}`
		}
		default: {
			return result satisfies never
		}
	}
}

/**
 * The kind of result an operator has, as {@link Situation} names it.
 *
 * @param result - The result.
 * @returns Its situation.
 */
const resultSituation = (result: CustomOperator["result"]): Situation => {
	switch (result.cardinality) {
		case "record": {
			return "record result"
		}
		case "operand": {
			return "operand result"
		}
		case "single":
		case "multiple":
		case "ordered": {
			return "value result"
		}
		default: {
			return result satisfies never
		}
	}
}

/**
 * Write an operator's signature as {@link signatures} does.
 *
 * @param operator - The operator.
 * @returns Its operands and its result, written.
 */
const signatureOf = (operator: CustomOperator) => ({
	operands: Arr.join(
		Arr.map(
			operator.operands,
			({ baseType, cardinality, form }) => `${baseType} ${cardinality} ${form}`
		),
		", "
	),
	result: resultOf(operator.result)
})

/**
 * Hold an operator to its identity and contract.
 *
 * @param operator - The operator.
 * @param note - Records the situations the operator reaches.
 */
const holdOperator = (operator: CustomOperator, note: (situation: Situation) => void) => {
	const label = operator.class
	note(operator.source)
	note(resultSituation(operator.result))
	assert.match(operator.class, classPattern, `${label}: a QTI identifier of no period`)
	assert.lengthOf(
		Arr.filter(operators, (other) => other.class === operator.class),
		1,
		`${label}: one class of its name`
	)
	assert.match(operator.definition, tagPattern, `${label}: a tag URI`)
	assert.strictEqual(operator.definition, `${operatorTagPrefix}${operator.class}`, label)
	const names = Arr.map(operator.operands, ({ name }) => name)
	assert.lengthOf(Arr.dedupe(names), names.length, `${label}: operands named once`)
	for (const operand of operator.operands) {
		assert.include(operandBases, operand.baseType, label)
	}
	if (operator.result.cardinality === "operand") {
		assert.include(names, operator.result.operand, `${label}: its result's type is one of its operands'`)
	}
	assert.deepStrictEqual(
		signatureOf(operator),
		signatures.get(operator.class),
		`${label}: the design's signature`
	)
	if (operator.source === "recorded") {
		assert.deepStrictEqual(
			operator.result,
			{
				cardinality: "record",
				fields: [
					{ field: "score", baseType: "float", absent: "never" },
					{ field: "feedback", baseType: "string", absent: "null" }
				]
			},
			`${label}: the record the ledger's reply holds`
		)
	}
}

/** Every registered operator. */
const entries: Gen<CustomOperator> = map(
	element(customOperators),
	(operator): CustomOperator => operator
)

describe("the registry's general-purpose operators", () => {
	it.effect("are named as QTI and RFC 4151 admit, and state the design's signatures", (ctx) =>
		searched(
			ctx,
			exhaust(
				{
					box: "every operator the registry registers",
					caseHang: Duration.minutes(1),
					coverage: requiredInSpace<Situation>([
						"inline",
						"recorded",
						"record result",
						"value result",
						"operand result"
					]),
					generator: entries,
					literal: (operator) => operator.class,
					oracle: {
						kind: "specification",
						name: "ASI §7.16 and §5.37; RFC 4151; plan/composable-operators.md §2 and §4, by hand"
					},
					suite: "registry/operators"
				},
				(operator, c) => Effect.sync(() => holdOperator(operator, (situation) => c.note(situation)))
			)
		)
	)
})
