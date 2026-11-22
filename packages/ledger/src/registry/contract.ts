/**
 * The registry's contract: the shapes a deployment's roster states its extensions in, beyond the QTI 3.0.1
 * specification itself and through its own extension points, which `registryOf` (`#registry/levels.ts`) installs as
 * the `RegistryRoster` level's constants. It loads no schema. A deployment composes its roster from the generic
 * operators (`#registry/operators.ts`) and its own graders, rubric uses, seed tables and bindings.
 *
 * - **Custom operators** (`qti-custom-operator`, QTI 3.0.1 ASI §5.37: "The custom operator provides an extension
 *   mechanism for defining operations not currently supported by this specification"). An operator is bound by its
 *   `definition`, "A URI that identifies the definition of the custom operator in the global namespace" (Table
 *   5.37.2), and its `class`, which "allows simple sub-classes to be named. The definition of a sub-class is tool
 *   specific" (Table 5.37.1), must agree with it.
 * - **Portable custom interactions** (`qti-portable-custom-interaction`, ASI §5.106) are registered by none: every
 *   one is outside the profile (`unregisteredPci`), since each of AlphaTest's widget families is a standard
 *   interaction graded by standard operators (qti-port spec/idiomatic-widgets.md).
 * - **Machine graders**: who produced a recorded operator's value, at a version.
 *
 * A roster is a profile of QTI 3.0.1 (ASI §10.2: "a profile must only increase the constraints"): content outside it
 * stays valid QTI, stored as written, and is never served for credit (`OutsideProfile`).
 *
 * @module
 */
import type { Array as Arr, Option } from "effect"

/**
 * The base types and cardinalities a contract names, as QTI 3.0.1 spells them (ASI §4.5.3, BaseType; §4.5.2,
 * Cardinality), each a handle of pantry's `BaseType` and `Cardinality` rosters, which every closed relation of the
 * registry types it by, so a name no roster holds is refused when the schema is built.
 */
export const baseTypes = [
	"boolean",
	"directedPair",
	"duration",
	"file",
	"float",
	"identifier",
	"integer",
	"pair",
	"point",
	"string",
	"uri"
] as const
export type BaseTypeName = (typeof baseTypes)[number]
export const cardinalities = ["single", "multiple", "ordered", "record"] as const
export type CardinalityName = (typeof cardinalities)[number]

/**
 * The base types an operand slot admits: one base type, or `any`, every base type (`when-present`'s probe and value,
 * plan/composable-operators.md P13: "`probe` may have any base type and cardinality").
 */
export const operandBases = [...baseTypes, "any"] as const

export type OperandBase = (typeof operandBases)[number]

/** The cardinalities an operand slot admits: one container's or a single's, or `any`, every cardinality, records too. */
export const operandCardinalities = ["single", "multiple", "ordered", "any"] as const

export type OperandCardinality = (typeof operandCardinalities)[number]

/**
 * How an operand of a registered operator must be written, beyond its type:
 *
 * - `any`: any QTI expression of the operand's type;
 * - `literal`: a `qti-base-value`, a `qti-multiple` or `qti-ordered` of base values, or a `qti-null` where the item
 *   states none, so the operand is a fact of the content;
 * - `default`: a `qti-default` naming an outcome declaration of the item;
 * - `essay`: a `qti-variable` naming the response variable an extended-text interaction of the item binds;
 * - `rubric`: a `qti-base-value` naming, by its `id`, a `qti-rubric-block` of the same document whose `view` is
 *   `scorer` ({@link rubricView}) and whose `use` is one of the roster's rubric uses.
 */
export const operandForms = ["any", "literal", "default", "essay", "rubric"] as const
export type OperandForm = (typeof operandForms)[number]

/**
 * One operand of a registered operator's contract: its name, the type its slot admits (a base type or `any`, a
 * cardinality or `any`) and its form, in the order it is written.
 */
export interface Operand {
	readonly name: string
	readonly baseType: OperandBase
	readonly cardinality: OperandCardinality
	readonly form: OperandForm
}

/**
 * A field of a record result: its name, its base type, and whether a value of the record may hold none for it (an
 * empty string is QTI's NULL, ASI §2.11: "empty containers and empty strings are both treated as NULL").
 */
export interface ResultField {
	readonly field: string
	readonly baseType: BaseTypeName
	readonly absent: "never" | "null"
}

/**
 * What an operator's value is: a container or single value of a base type, a record of fields, or a value of the type
 * one of its operands has (`operand`, the operand's name: `when-present`'s result is its `value` operand's, P13: "The
 * result's base type and cardinality are `value`'s").
 */
export type Result =
	| { readonly cardinality: "single" | "multiple" | "ordered"; readonly baseType: BaseTypeName }
	| { readonly cardinality: "record"; readonly fields: Arr.NonEmptyReadonlyArray<ResultField> }
	| { readonly cardinality: "operand"; readonly operand: string }

/**
 * A registered custom operator: its class, an NCName of at most 32 characters with no period (ASI §7.16: "Identifiers
 * containing the period character are reserved … Identifiers should have no more than 32 characters"); its definition
 * URI; how its value arises, `inline` (an immutable SQL function the grader evaluates where the operator stands) or
 * `recorded` (a ledger fact the registered evaluator records once per application and attempt); its operands; and its
 * result.
 */
export interface CustomOperator {
	readonly class: string
	readonly definition: string
	readonly source: "inline" | "recorded"
	readonly operands: Arr.NonEmptyReadonlyArray<Operand>
	readonly result: Result
}

/**
 * A machine grader at a version, the one roster of who a machine score's machine is: the recorded class it implements,
 * the vendor's endpoint, model and parameters, and the text of the prompt it sends, beside the SHA-256 of that text,
 * which a test holds to the text, so a prompt changed in place fails the suite: a changed prompt is a new version,
 * appended. Every ledger fact names the grader version that produced it, and a class's last grader version is the one
 * in force.
 */
export interface GraderVersion {
	readonly version: string
	readonly class: string
	readonly vendor: string
	readonly endpoint: string
	readonly model: string
	readonly effort: string
	readonly maxOutputTokens: number
	readonly instructions: string
	readonly criteria: string
	readonly prompt: string
}

/**
 * The roles a primitive reads a seed table in, its own parameters (IMPL-OPS-PRIM), in roster order (a later role
 * appends, since codes are history): the spellings of units, the units a single letter names, the spellings a mistyped
 * unit is measured against, the words it competes with, the words that glue a unit to another, English plurals, the
 * `-ie` plurals, the words that are never plural; and `phrase-distance`'s noun-typo relations (P10): the unit words,
 * the place-value and fraction words, the operation words, the stop words and the verbs.
 */
export const tableRoles = [
	"unit-spellings",
	"letter-units",
	"typo-targets",
	"competitors",
	"glue-words",
	"plurals",
	"ie-plurals",
	"never-plural",
	"unit-words",
	"contrast-words",
	"operation-words",
	"stop-words",
	"verbs"
] as const
export type TableRole = (typeof tableRoles)[number]

/**
 * One entry of a seed table the primitives read: its table, its key, its value where the table maps keys to values (a
 * unit's spelling to its identifier, a plural to its singular; a list's entries have none), and its place in the table
 * from 1, its order, which a primitive breaks a tie by.
 */
export interface SeedEntry {
	readonly table: string
	readonly key: string
	readonly value: Option.Option<string>
	readonly place: number
}

/** One table a class reads in a role, at its place among the role's tables, which are read as their union in order. */
export interface TableBinding {
	readonly class: string
	readonly role: TableRole
	readonly place: number
	readonly table: string
}

/**
 * A deployment's roster, each list in roster order (a later entry appends, since codes are history): its operators;
 * its grader versions and the `use`s a rubric operand's block may have, each of QTI's extension vocabulary (XSD
 * `UseExtensionStringDType`, ASI §10.1.6); and the seed tables its primitives read, entry by entry, with which table
 * each reads in each role. Each may be empty: an empty roster is an empty domain, which no reference meets and no read
 * returns (grizzle REDFIX). The registry carries its own generic seed (`#ledger/registry/seed.ts`), which every
 * installation has (the lead's ruling of 2026-11-21, a hard cutover); a deployment's tables and bindings append to it.
 */
export interface Roster {
	readonly operators: ReadonlyArray<CustomOperator>
	readonly graders: ReadonlyArray<GraderVersion>
	readonly rubricUses: ReadonlyArray<string>
	readonly tables: ReadonlyArray<SeedEntry>
	readonly bindings: ReadonlyArray<TableBinding>
}

/**
 * The `view` of a rubric block a `rubric` operand names: QTI's scorer (ASI §4.7, View), the one view whose blocks the
 * candidate's page never holds.
 */
export const rubricView = "scorer"

/**
 * Why an element puts its document outside the deployment's profile (`OutsideProfile` of `#registry/levels.ts`, which
 * states each), in roster order: a later reason appends, since codes are history.
 */
export const profileReasons = [
	"unregisteredOperator",
	"operatorClass",
	"operatorArity",
	"operatorAttribute",
	"operandType",
	"essayOperand",
	"defaultOperand",
	"rubricOperand",
	"literalOperand",
	"recordedPlacement",
	"unregisteredPci"
] as const
