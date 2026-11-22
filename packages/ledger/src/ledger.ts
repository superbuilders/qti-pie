import {
	alternatives,
	check,
	closed,
	closedId,
	contained,
	derived,
	instant,
	key,
	natural,
	Num,
	on,
	pg,
	place,
	pred,
	query,
	relation,
	type Rule,
	schema,
	select,
	Type,
	v
} from "@bjornpagen/grizzle"
import type { BuiltIn } from "@qti-pie/pantry/grammar/install.ts"
import {
	AttributeName,
	Cardinality,
	DeclarationKind,
	grammar,
	NodeKind
} from "@qti-pie/pantry/grammar/install.ts"
import { publishedTemplates, urisOf } from "@qti-pie/pantry/qti/templates.ts"
import { Option } from "effect"
import { CreditKind } from "#ledger/credit.ts"
import { DeclineReason, EvaluationResult, Feedback, Sha256 } from "#ledger/evaluations.ts"
import {
	AdmissionCode,
	admittedAttributes,
	BodyAttribute,
	BodyNode,
	DeclarationNode,
	declarationParts,
	DocBase,
	DocumentAttribute,
	DocVar,
	gradedAttributes,
	gradingFunctions,
	ProgramNode,
	processingKinds,
	TableBinding,
	TableEntry
} from "#ledger/grading.ts"
import { anyText, LearnerId, ScorerId, someText } from "#ledger/keys.ts"
import type { RegistryLevel } from "#ledger/registry/levels.ts"
import { customOperators } from "#ledger/registry/operators.ts"
import { QtiFloat, QtiInteger } from "#ledger/scalars.ts"
import { SittingStanding, sittingTablesOf } from "#ledger/sittings.ts"

/** QTI's built-in `completionStatus` outcome, which no item declares (QTI 3.0 information model, 4.4.2), by its four
 * values. */
export const CompletionStatus = closed.ordered("CompletionStatus", [
	"completed",
	"incomplete",
	"not_attempted",
	"unknown"
])

/** What a response snapshot is: an attempt, whose response processing ran and ended with the values it holds, or a
 * save, the response values a session holds pending or suspended (QTI's pendingSubmission and suspended states), with
 * no response processing run. */
export const SnapshotKind = closed.ordered("SnapshotKind", ["attempt", "save"])

/** What an item session's template processing set of one variable, each by the rule that sets it
 * (`qti-set-template-value`, `qti-set-correct-response`, `qti-set-default-value`): a template variable's value, a
 * response's correct response, or a response's or an outcome's default. */
export const SessionValueKind = closed.ordered("SessionValueKind", ["template", "correct", "default"])

/**
 * QTI's two kinds of external scoring, `ExternalScoredEnum` (QTI 3.0.1 information model, Table 8.21): `externalMachine`,
 * "an external scoring system will be used to score the Item", and `human`, "a human must score the Item". The tokens of
 * an outcome declaration's `external-scored` (Table 4.5.10, "Enumerated value set of: { externalMachine | human }",
 * multiplicity [0..1]) and the kind of an outcome's assertion alike, so the kind a declaration admits and the kind an
 * assertion is are one roster, and one law holds them equal. The XSD restricts the attribute to these two
 * enumerations of `xs:string`, whose white space is preserved, so a stored value is one of them as written. QTI states
 * no order between them.
 */
export const ExternalScoring = closed.unordered("ExternalScoring", ["externalMachine", "human"])

/**
 * The ledger, `ledger` in PostgreSQL: QTI 3.0.1's session facts, what each learner was served and did, over the QTI
 * content it extends. Every key is the learner (`LearnerId`, an opaque id the application assigns), the sitting the
 * application served them in (`stage`, an opaque key it assigns, a plain bigint here), an `instant` the database
 * stamps, a place, and QTI's own identity: a package by the name it is published under, an item by its document's path,
 * a variable by the identifier its item declares. Nothing is a minted id. Each instant is a clock or a reference
 * (grizzle's README, Instants): a snapshot's, a test session's moment and an assertion's are clocks, stamped by the insert
 * that adds them, greater than every instant of their child, so they are ordered as they were committed whatever the
 * server's clock reads; every other instant is a stored one a containment carries. What assigns a learner a sitting,
 * which policy decided it and with what settings, is an application's level above this one, never QTI's.
 *
 * - **ItemSession**: an item a sitting serves, QTI's item session, by its package and item document and its place `n`
 *   among the learner's sessions of that item, which the database stamps one past the greatest (grizzle's `place`), so
 *   the places run gapless from 0 in the order the sessions were taken; its sitting (`stage`) beside it, at most one per
 *   sitting and item, which orders the sessions a migration numbers.
 * - **ItemSessionValue**: a variable the item session's template processing set at the take, and what it set
 *   (`SessionValueKind`), with its value in the sidecar of its declared base type and cardinality,
 *   **ItemSessionValue**`<Single|Multiple|Ordered><BaseType>`: no value row is the NULL template processing set. A
 *   template variable's value is a session fact, drawn once when the session is taken, never again. Its session is
 *   named by its stage, the session's other key, since the call that takes the session writes its values in the same
 *   insert that stamps the session's place, and a place is stamped only in its own relation, never carried to a row
 *   beside it as a stage's instant is.
 * - **SessionSeed**: the seed an item session's template and response processing draw under, by the session's sitting
 *   (`stage`) and item, which its take computes in the database from the take's seed (the SQL grader's
 *   `processingSeed`); every item session holds one (ItemSession ⊆ SessionSeed).
 * - **ResponseSnapshot**: the response and outcome values an item session held at an instant, the one header of its
 *   values, of a kind (`SnapshotKind`): an **Attempt**, its arm, or a **Save**, the response values pending or
 *   suspended, no response processing run. An attempt whose response processing ran is a **ProcessedAttempt**, with
 *   QTI's built-in completion status after it; its outcomes are the SQL grader's, written beside its responses. An
 *   attempt that submitted every response at its default, posting none (a skip, or a presented member its test's end
 *   submits unsaved), is a **DefaultSubmission**: the grader starts its responses at their defaults and writes them. A
 *   snapshot's instant is its clock, stamped by the insert that adds it, greater than every instant of its session, so
 *   a session's snapshots are ordered as they were committed; its arm and its values hold that instant.
 * - **Snapshot**`<Single|Multiple|Ordered><BaseType>`: the values the snapshot's response and outcome variables held,
 *   by the item's declared identifier, in the sidecar of the variable's declared cardinality and base type, typed:
 *   a single value; a multiple's distinct values, each with how many times it occurs; an ordered's values at their
 *   places from 0, gapless. NULL is no row. A multiple of float or duration keys each distinct value by its identity
 *   image, `bits`, grizzle's `Num.floatBits` of the value (its IEEE 754 bits, every NaN one), which the law
 *   BagImage holds it to, beside the value: a key compares a double as PostgreSQL's equality does, where `-0` is `0`,
 *   while plate's multiple holds the two zeros as two values. A read by the value stays native.
 * - **SnapshotRecord**: a record response's fields in the snapshot, each with its own base type, which no declaration
 *   states, so the field is the header and its value the arm of its base type, **SnapshotRecord**`<BaseType>`. A record
 *   with no field is NULL.
 * - **OperatorEvaluation**: the value a recorded custom operator took in an attempt (the registry's
 *   `RecordedApplication`, `#registry/levels.ts`), a fact the registered evaluator records once per application and
 *   attempt, which the SQL grader reads, so every invocation of response processing reads the same value (QTI 3.0.1
 *   ASI §2.11.3: "Operators never effect the values of itemVariables directly"; ASI §2.5, a delivery engine "must
 *   only report the first set of outcomes produced"): by the attempt's key, the operator's place in the item's
 *   document (`start`) and the instant it was recorded, a clock whose child is the application, so one row per
 *   application and attempt; the operator's class, the grader version that produced it (the registry's `Grader`, of
 *   that class), the SHA-256 of the exact request it sent, and whether the model replied or declined. An application
 *   whose response is NULL has no request and no row, and its value is NULL; an application with a response and no
 *   row is pending (QTI 3.0.1 RR Table 2.7.7, `pendingResponseProcessing`), derived and never stored.
 * - **OperatorReply**, **OperatorFeedback** and **OperatorDecline**: a replied evaluation's record, `rubric-score`'s
 *   fields, its `score` a finite float of zero or more and its `feedback` where the reply's is no empty string, which
 *   is QTI's NULL; a declined one's reason. A declined evaluation's value is NULL.
 * - **HumanOperatorValue** and **HumanOperatorFeedback**: the value a person recorded for a rubric group of an attempt
 *   (the registry's `RubricGrader`, every `rubric-score` application of an item that names one scorer rubric block),
 *   which the grader reads in place of the group's draws where every draw declined: by the attempt's key, the rubric
 *   block's `id` and the instant it was recorded, a clock whose child is the attempt and the group, append-only, the
 *   latest the one in force; the person who scored (`scorer`, a {@link ScorerId}) and the score, a finite float
 *   of zero or more; and the feedback where it is no empty string.
 *
 * A value's base type and cardinality are its declaration's, so no row states them: the relation a value is in names
 * them, and a law holds that relation to the declaration. Each base type's value is typed as PostgreSQL compares it:
 * `identifier`, `string` and `uri` as text; `boolean` as a boolean; `integer` as an exact integral numeric
 * ({@link QtiInteger}); `float` and `duration` (its seconds) as a double ({@link QtiFloat}); `point` as its two
 * integers `x` and `y`; `pair` as its two identifiers in code-point order, `least` and `greatest`, so the two orders of
 * one pair are one row; `directedPair` as its `source` and `target`; and `file` as QTI's file value, "a binary stream
 * of data, with associated MIME type and file name": the SHA-256 of its bytes as its `digest`, its MIME `type`, empty
 * where none was reported, and its `name`. Its size is its bytes', which the digest names, so no row states it, and a
 * file is recorded only with its digest: plate's form posts no file, so the app records none, and a file value at its
 * boundary is a defect, never a name with an invented digest.
 *
 * Numbers of attempts, whether an item session is open, the order items were served in and every timestamp are
 * derived from these facts and the content, never stored.
 */
export const ledgerOf = (qti: RegistryLevel) => {
	const {
		Attribute,
		BaseType,
		BuiltInVariable,
		DeclarationName,
		Document,
		Grader,
		GraderVersion,
		Literal,
		Media,
		NamedDeclaration,
		NormalMaximum,
		ObjectIdentifier,
		OperatorClass,
		Package,
		RecordedApplication,
		RegistryTable,
		RegistryWord,
		RubricGrader,
		TableRole,
		TypedDeclarationName
	} = qti.relations

	/** A file's content as its SHA-256, pantry's digest of a package file's bytes (`Media`), 64 lowercase hex digits. */
	const FileDigest = Media.fields.digest

	/**
	 * QTI's typed item variables (§2.2.2): every variable an item declares with a base type, by its package, the item's
	 * `identifier` and the declared identifier, with its cardinality, its base type and the kind of declaration:
	 * pantry's name views `DeclarationName` and `TypedDeclarationName`, matched as they stand, never their joins
	 * restated (`@qti-pie/pantry`'s level `QtiViews`, the one home of the shared views, its name views the one
	 * definition of what a name names). A query over pantry's own rows, so nothing copies them: an item's identifier is
	 * its root's, and a declared name is one per item (pantry's Item key and Declaration key).
	 */
	const declaredVariables = query(qti).rule((r) => {
		const { package: pkg, path } = v(ObjectIdentifier, "item")
		const { identifier, cardinality, declarationKind } = v(DeclarationName, "declaration")
		const { baseType } = v(TypedDeclarationName, "typed")
		return r
			.match(ObjectIdentifier, { package: pkg, path })
			.match(DeclarationName, { package: pkg, path, identifier, cardinality, declarationKind })
			.match(TypedDeclarationName, { package: pkg, path, identifier, baseType })
			.find({ package: pkg, path, identifier, cardinality, baseType, declarationKind })
	})

	const ItemVariable = derived("ItemVariable", declaredVariables)

	/**
	 * An item's built-in session variable, by its name among QTI's (pantry's `BuiltIn` roster), as a declaration of its
	 * kind stands (spec reading 111, "a processing element's `identifier` names a variable of the kind the element reads
	 * or sets"): its declaration kind and cardinality pantry's installed `BuiltInVariable` gives under the item root,
	 * read where the rule runs, so a name pantry holds no row of there names nothing; and its base type, which pantry
	 * holds on the host alone (`builtInBaseTypes`), never in a relation a query reads, so the rule states it.
	 */
	const builtInVariable =
		(variable: (typeof BuiltIn.handles)[number], baseType: (typeof BaseType.handles)[number]) =>
		(r: Rule<typeof qti>) => {
			const { package: pkg, path } = v(ObjectIdentifier, "item")
			const { cardinality, declaration } = v(BuiltInVariable, "builtIn")
			return r
				.match(ObjectIdentifier, { package: pkg, path })
				.match(Document, { package: pkg, path, rootKind: "qti-assessment-item" })
				.match(BuiltInVariable, { root: "qti-assessment-item", variable, cardinality, declaration })
				.find({
					package: pkg,
					path,
					identifier: Type.literal(Attribute.fields.value.type, variable),
					cardinality,
					baseType: BaseType.handle(baseType),
					declarationKind: declaration
				})
		}

	/**
	 * QTI's item session variables: every typed variable an item declares ({@link ItemVariable}'s rows), and its built-in
	 * session variables ({@link builtInVariable}): `numAttempts` and `duration`, its built-in responses ("There are two
	 * built-in response variables: 'numAttempts' and 'duration'. These are declared implicitly and must not appear in a
	 * 'response declaration'", QTI 3.0.1 information model §2.2.2.2; `duration` "a single float that records the
	 * accumulated time (in seconds)"), and `completionStatus`, its built-in outcome ("There is one built-in outcome
	 * variable, 'completionStatus', that is declared implicitly and must not appear in an outcome declaration",
	 * §2.2.2.3, "a single identifier"); each by the item's package and `identifier`, the variable's name, its
	 * cardinality, its base type and its declaration kind. What template processing may set, of the kind its rule names.
	 * A declared name is never a built-in's: QTI reserves them ("The identifiers of the built-in session variables are
	 * reserved", 3.0.1 tables 4.5.1, 5.115.1 and 5.151.1), which pantry's `Declaration not reserved` holds, so a
	 * variable is one row.
	 */
	const ItemSessionVariable = derived(
		"ItemSessionVariable",
		declaredVariables
			.rule(builtInVariable("numAttempts", "integer"))
			.rule(builtInVariable("duration", "float"))
			.rule(builtInVariable("completionStatus", "identifier"))
	)

	/**
	 * QTI's record variables: every variable an item declares of cardinality `record`, which has no base type
	 * ("Variables with record cardinality have no base-type", QTI 3.0.1 information model, tables 4.5.3, 5.34.3, 5.115.3
	 * and 5.151.3), by its package, the item's `identifier` and the declared identifier, with the kind of declaration:
	 * pantry's `DeclarationName` of cardinality `record`.
	 */
	const ItemRecordVariable = derived(
		"ItemRecordVariable",
		query(qti).rule((r) => {
			const { package: pkg, path } = v(ObjectIdentifier, "item")
			const { identifier, declarationKind } = v(DeclarationName, "declaration")
			return r
				.match(ObjectIdentifier, { package: pkg, path })
				.match(DeclarationName, {
					package: pkg,
					path,
					identifier,
					cardinality: "record",
					declarationKind
				})
				.find({ package: pkg, path, identifier, declarationKind })
		})
	)

	/**
	 * QTI's outcome declarations a candidate sees, by the document's place `(package, path)` and the declaration's
	 * `start`, with its identifier and cardinality: every outcome declaration that writes no `view`, and every one whose
	 * `view` lists `candidate`. "The intended audience for an outcome variable can be set with the view attribute. If no
	 * view is specified the outcome is treated as relevant to all views." (QTI 3.0.1 information model, Table 4.5.4); its
	 * value space is "A list from an enumerated value set of: { author | candidate | proctor | scorer | testConstructor |
	 * tutor }", the XSD's `xs:list` of `ViewEnumDType`, so its tokens are its audiences (`r.tokens`). The two rules are
	 * disjoint by whether the declaration writes a `view`.
	 */
	const candidateOutcomes = query(qti)
		.rule((r) => {
			const {
				package: pkg,
				path,
				start,
				identifier,
				cardinality
			} = v(DeclarationName, "declaration")
			return r
				.match(DeclarationName, {
					package: pkg,
					path,
					start,
					identifier,
					cardinality,
					declarationKind: "qti-outcome-declaration"
				})
				.where(r.not(Attribute, { package: pkg, path, start, name: "view" }))
				.find({ package: pkg, path, start, identifier, cardinality })
		})
		.rule((r) => {
			const {
				package: pkg,
				path,
				start,
				identifier,
				cardinality
			} = v(DeclarationName, "declaration")
			const { value: view } = v(Attribute, "view")
			return r
				.match(DeclarationName, {
					package: pkg,
					path,
					start,
					identifier,
					cardinality,
					declarationKind: "qti-outcome-declaration"
				})
				.match(Attribute, { package: pkg, path, start, name: "view", value: view })
				.match(r.tokens(view), { token: "candidate" })
				.find({ package: pkg, path, start, identifier, cardinality })
		})

	/**
	 * The documents whose score a credit reads, by `(package, path)`, with the place of the score's declaration: SCORE
	 * declared `single` where a candidate sees it ({@link candidateOutcomes}). "Items that declare a numeric outcome
	 * variable representing the candidate's overall performance on the item should use the outcome name 'SCORE' for the
	 * variable." (QTI 3.0.1 information model, §2.2.2.3, NOT NORMATIVE). No normative rule types SCORE: §4.5's "SCORE
	 * needs to be a float" uses no RFC 2119 keyword (§1.3), so pantry admits a SCORE of any base type, and a credit reads
	 * a float SCORE, or an integer one whose double is exact, as its number (`outcomeInForceNumber`). An
	 * `external-scored` SCORE is one of them: its value in force is its latest assertion (Table 4.5.10; owner,
	 * 2026-11-19), the outcome in force's rule, never this one's.
	 */
	const scoreDeclared = query(qti).rule((r) => {
		const { package: pkg, path, start } = v(candidateOutcomes, "score")
		return r
			.match(candidateOutcomes, {
				package: pkg,
				path,
				start,
				identifier: "SCORE",
				cardinality: "single"
			})
			.find({ package: pkg, path, start })
	})

	const ScoreDeclared = derived("ScoreDeclared", scoreDeclared)

	/**
	 * The documents whose credit's maximum is their MAXSCORE, by `(package, path)`: a score a credit reads
	 * ({@link scoreDeclared}) and MAXSCORE declared `single` where a candidate sees it. "Items that declare a maximum
	 * score (in multiple response choice interactions, for example) should do so by declaring the 'MAXSCORE' variable."
	 * (QTI 3.0.1 information model, §2.2.2.3, NOT NORMATIVE; §4.5's "MAXSCORE needs to be a float" uses no RFC 2119
	 * keyword, so pantry admits a MAXSCORE of any base type, read as SCORE is). The owner's rule's first source (proposal
	 * 2026-11-18-grading-in-sql, Decision 3). Disjoint from {@link MaximumNormal}, which a MAXSCORE declaration of any
	 * kind excludes; a MAXSCORE of another cardinality or one hidden from the candidate is the document's statement too,
	 * so such a document has no credit at all, never `normal-maximum`'s.
	 */
	const MaximumOutcome = derived(
		"MaximumOutcome",
		query(qti).rule((r) => {
			const { package: pkg, path, start } = v(scoreDeclared, "score")
			const { start: maximumStart } = v(candidateOutcomes, "maximum")
			return r
				.match(scoreDeclared, { package: pkg, path, start })
				.match(candidateOutcomes, {
					package: pkg,
					path,
					start: maximumStart,
					identifier: "MAXSCORE",
					cardinality: "single"
				})
				.find({ package: pkg, path })
		})
	)

	/**
	 * The documents whose credit's maximum is their SCORE's `normal-maximum`, by `(package, path)`, with that maximum: a
	 * score a credit reads ({@link scoreDeclared}), no MAXSCORE outcome declaration at all, and a `normal-maximum` on
	 * SCORE's declaration, the double pantry's view `NormalMaximum` reads from it (`Text.parseDouble`, XML Schema
	 * 1.1's doubleLexicalMap). "The normalMaximum characteristic optionally defines the maximum magnitude of numeric outcome
	 * variables, it must be a positive value." (QTI 3.0.1 information model, Table 4.5.7), its data type
	 * `NonNegativeDouble`. The owner's rule's second source (proposal 2026-11-18-grading-in-sql, Decision 3). A text that
	 * names no double is one pantry's value domain refuses, so the rule holds no row of it; an infinite maximum is one
	 * the credit reads as none (`credit`).
	 */
	const MaximumNormal = derived(
		"MaximumNormal",
		query(qti).rule((r) => {
			const { package: pkg, path, start } = v(scoreDeclared, "score")
			const { value: maximum } = v(NormalMaximum, "normal")
			return r
				.match(scoreDeclared, { package: pkg, path, start })
				.match(NormalMaximum, { package: pkg, path, start, value: maximum })
				.where(
					r.not(NamedDeclaration, {
						package: pkg,
						path,
						identifier: "MAXSCORE",
						declarationKind: "qti-outcome-declaration"
					})
				)
				.find({ package: pkg, path, maximum })
		})
	)

	/** A package as the ledger names it: the name it is published under, pantry's. */
	const PackageName = Package.fields.name

	/** An item as the ledger names it in its package: its document's path, pantry's `Document` key with its package.
	 * QTI makes an item's `identifier` unique nowhere (information model §4.1.1, info:6346: its type `Identifier`, not
	 * `UniqueIdentifier`), so two items of one package may share one, and the document is what names one item
	 * (SPEC-AUDIT SV-KEY-01). */
	const ItemPath = Document.fields.path

	/** A variable as its item declares it: its declaration's `identifier`, the attribute's collapsed `value`, pantry's. */
	const VariableName = Attribute.fields.value.type

	/**
	 * Each base type's value as its columns: one value, a point's two integers, a pair's two identifiers or a file's
	 * three fields. A text has no byte bound, so a value of any length is stored (SPEC-AUDIT SV-LEDGER-01: QTI sets no
	 * length on a value, and delivery "must be able to collect and store the responses", conformance §2.2). A multiple's
	 * key holds its text values as themselves, as a record's key holds its field: grizzle holds each text of a key whose
	 * entry could outgrow PostgreSQL's B-tree entry by its image, its SHA-256 in a column generated from the row, which a
	 * reference into the key pairs with its own, and a lookup's index by its md5 (grizzle's README, Text in a key).
	 */
	const leaf = {
		identifier: { value: someText },
		boolean: { value: pg.boolean },
		integer: { value: QtiInteger },
		float: { value: QtiFloat },
		string: { value: someText },
		point: { x: QtiInteger, y: QtiInteger },
		pair: { least: anyText, greatest: anyText },
		directedPair: { source: anyText, target: anyText },
		duration: { value: QtiFloat },
		uri: { value: someText },
		file: { digest: FileDigest, name: someText, type: anyText }
	} as const

	/** An item session's key's fields: the child, the item, and its place among the child's sessions of the item. */
	const sessionFields = {
		child: LearnerId,
		package: PackageName,
		path: ItemPath,
		n: natural
	} as const
	const sessionKey = ["child", "package", "path", "n"] as const

	/** A response snapshot's key's fields: its item session's, and the instant it was taken, its clock's. */
	const snapshotFields = { ...sessionFields, at: instant } as const
	const snapshotKey = ["child", "package", "path", "n", "at"] as const

	/** A snapshot's value's key's fields: its snapshot's, and the variable. */
	const snapshotValue = { ...snapshotFields, variable: VariableName } as const
	const snapshotValueKey = [...snapshotKey, "variable"] as const

	/** An item session's value's key's fields: its item session's by its stage, what template processing set and the
	 * variable. */
	const sessionValue = {
		child: LearnerId,
		stage: pg.bigint,
		package: PackageName,
		path: ItemPath,
		kind: closedId(SessionValueKind),
		variable: VariableName
	} as const
	const sessionValueKey = ["child", "stage", "package", "path", "kind", "variable"] as const

	const ItemSession = relation(
		"ItemSession",
		{ ...sessionFields, n: place.by("stage"), stage: pg.bigint },
		sessionKey
	)
	/** The seed an item session's template and response processing draw under, a session fact its take computes in the
	 * database from its decision's seed (the machine's `processing_seed`), by the session's sitting:
	 * every take writes one, held by ItemSession ⊆ SessionSeed. */
	const SessionSeed = relation(
		"SessionSeed",
		{ child: LearnerId, package: PackageName, path: ItemPath, seed: anyText, stage: pg.bigint },
		["child", "stage", "package", "path"]
	)
	const ResponseSnapshot = relation(
		"ResponseSnapshot",
		{ ...snapshotFields, kind: closedId(SnapshotKind) },
		snapshotKey
	)
	const Attempt = relation("Attempt", snapshotFields, snapshotKey)
	/** An attempt whose response processing ran, with QTI's built-in completion status after it (§2.2.2.3): the one home
	 * of `completionStatus`, which no value sidecar holds. An attempt with none is pending response processing (QTI
	 * Results Reporting, Table 2.7.7, `pendingResponseProcessing`): a custom operator awaits its evaluation, or a rubric
	 * group a person's value. */
	const ProcessedAttempt = relation(
		"ProcessedAttempt",
		{ ...snapshotFields, completionStatus: closedId(CompletionStatus) },
		snapshotKey
	)
	/** An attempt that submitted every response at its default in force, posting none (QTI 3.0.1 Table 7.19.6: "all
	 * response variables are submitted with their default value or are NULL"): a skip, or a presented member its
	 * test's end submits unsaved. Its response processing starts each response at its default (the machine's
	 * start_of: its template-set default, else its declared one, once the attempt is the session's first or later,
	 * numAttempts > 0, Table 5.115), and the grader writes the responses it ran with beside its outcomes. An item
	 * never presented has no attempt: "the response variable remains NULL and the default value is never used" (Table
	 * 5.115). */
	const DefaultSubmission = relation("DefaultSubmission", snapshotFields, snapshotKey)
	const Save = relation("Save", snapshotFields, snapshotKey)
	/**
	 * A sitting's response snapshot with `given`, the browser's reading of the database's clock when the candidate gave
	 * it, in microseconds since the Unix epoch, at or before the snapshot's own instant ("Given before"): the reading a
	 * timed sitting's bounded grace accepts a response by (`#sitting-programs.ts`), which the database records beside its
	 * own instant and never orders by. A sensor reading, so a bound, never a clock.
	 */
	const SnapshotGiven = relation(
		"SnapshotGiven",
		{ ...snapshotFields, given: pg.bigint },
		snapshotKey
	)

	const SnapshotSingleIdentifier = relation(
		"SnapshotSingleIdentifier",
		{ ...snapshotValue, ...leaf.identifier },
		snapshotValueKey
	)
	const SnapshotSingleBoolean = relation(
		"SnapshotSingleBoolean",
		{ ...snapshotValue, ...leaf.boolean },
		snapshotValueKey
	)
	const SnapshotSingleInteger = relation(
		"SnapshotSingleInteger",
		{ ...snapshotValue, ...leaf.integer },
		snapshotValueKey
	)
	const SnapshotSingleFloat = relation(
		"SnapshotSingleFloat",
		{ ...snapshotValue, ...leaf.float },
		snapshotValueKey
	)
	const SnapshotSingleString = relation(
		"SnapshotSingleString",
		{ ...snapshotValue, ...leaf.string },
		snapshotValueKey
	)
	const SnapshotSinglePoint = relation(
		"SnapshotSinglePoint",
		{ ...snapshotValue, ...leaf.point },
		snapshotValueKey
	)
	const SnapshotSinglePair = relation(
		"SnapshotSinglePair",
		{ ...snapshotValue, ...leaf.pair },
		snapshotValueKey
	)
	const SnapshotSingleDirectedPair = relation(
		"SnapshotSingleDirectedPair",
		{ ...snapshotValue, ...leaf.directedPair },
		snapshotValueKey
	)
	const SnapshotSingleDuration = relation(
		"SnapshotSingleDuration",
		{ ...snapshotValue, ...leaf.duration },
		snapshotValueKey
	)
	const SnapshotSingleUri = relation(
		"SnapshotSingleUri",
		{ ...snapshotValue, ...leaf.uri },
		snapshotValueKey
	)
	const SnapshotSingleFile = relation(
		"SnapshotSingleFile",
		{ ...snapshotValue, ...leaf.file },
		snapshotValueKey
	)

	const SnapshotMultipleIdentifier = relation(
		"SnapshotMultipleIdentifier",
		{ ...snapshotValue, ...leaf.identifier, count: natural },
		[...snapshotValueKey, "value"]
	)
	const SnapshotMultipleBoolean = relation(
		"SnapshotMultipleBoolean",
		{ ...snapshotValue, ...leaf.boolean, count: natural },
		[...snapshotValueKey, "value"]
	)
	const SnapshotMultipleInteger = relation(
		"SnapshotMultipleInteger",
		{ ...snapshotValue, ...leaf.integer, count: natural },
		[...snapshotValueKey, "value"]
	)
	const SnapshotMultipleFloat = relation(
		"SnapshotMultipleFloat",
		{ ...snapshotValue, bits: pg.bigint, ...leaf.float, count: natural },
		[...snapshotValueKey, "bits"]
	)
	const SnapshotMultipleString = relation(
		"SnapshotMultipleString",
		{ ...snapshotValue, ...leaf.string, count: natural },
		[...snapshotValueKey, "value"]
	)
	const SnapshotMultiplePoint = relation(
		"SnapshotMultiplePoint",
		{ ...snapshotValue, ...leaf.point, count: natural },
		[...snapshotValueKey, "x", "y"]
	)
	const SnapshotMultiplePair = relation(
		"SnapshotMultiplePair",
		{ ...snapshotValue, ...leaf.pair, count: natural },
		[...snapshotValueKey, "least", "greatest"]
	)
	const SnapshotMultipleDirectedPair = relation(
		"SnapshotMultipleDirectedPair",
		{ ...snapshotValue, ...leaf.directedPair, count: natural },
		[...snapshotValueKey, "source", "target"]
	)
	const SnapshotMultipleDuration = relation(
		"SnapshotMultipleDuration",
		{ ...snapshotValue, bits: pg.bigint, ...leaf.duration, count: natural },
		[...snapshotValueKey, "bits"]
	)
	const SnapshotMultipleUri = relation(
		"SnapshotMultipleUri",
		{ ...snapshotValue, ...leaf.uri, count: natural },
		[...snapshotValueKey, "value"]
	)
	const SnapshotMultipleFile = relation(
		"SnapshotMultipleFile",
		{ ...snapshotValue, ...leaf.file, count: natural },
		[...snapshotValueKey, "digest", "name", "type"]
	)

	const SnapshotOrderedIdentifier = relation(
		"SnapshotOrderedIdentifier",
		{ ...snapshotValue, place: natural, ...leaf.identifier },
		[...snapshotValueKey, "place"]
	)
	const SnapshotOrderedBoolean = relation(
		"SnapshotOrderedBoolean",
		{ ...snapshotValue, place: natural, ...leaf.boolean },
		[...snapshotValueKey, "place"]
	)
	const SnapshotOrderedInteger = relation(
		"SnapshotOrderedInteger",
		{ ...snapshotValue, place: natural, ...leaf.integer },
		[...snapshotValueKey, "place"]
	)
	const SnapshotOrderedFloat = relation(
		"SnapshotOrderedFloat",
		{ ...snapshotValue, place: natural, ...leaf.float },
		[...snapshotValueKey, "place"]
	)
	const SnapshotOrderedString = relation(
		"SnapshotOrderedString",
		{ ...snapshotValue, place: natural, ...leaf.string },
		[...snapshotValueKey, "place"]
	)
	const SnapshotOrderedPoint = relation(
		"SnapshotOrderedPoint",
		{ ...snapshotValue, place: natural, ...leaf.point },
		[...snapshotValueKey, "place"]
	)
	const SnapshotOrderedPair = relation(
		"SnapshotOrderedPair",
		{ ...snapshotValue, place: natural, ...leaf.pair },
		[...snapshotValueKey, "place"]
	)
	const SnapshotOrderedDirectedPair = relation(
		"SnapshotOrderedDirectedPair",
		{ ...snapshotValue, place: natural, ...leaf.directedPair },
		[...snapshotValueKey, "place"]
	)
	const SnapshotOrderedDuration = relation(
		"SnapshotOrderedDuration",
		{ ...snapshotValue, place: natural, ...leaf.duration },
		[...snapshotValueKey, "place"]
	)
	const SnapshotOrderedUri = relation(
		"SnapshotOrderedUri",
		{ ...snapshotValue, place: natural, ...leaf.uri },
		[...snapshotValueKey, "place"]
	)
	const SnapshotOrderedFile = relation(
		"SnapshotOrderedFile",
		{ ...snapshotValue, place: natural, ...leaf.file },
		[...snapshotValueKey, "place"]
	)

	/** A record field's key's fields: its snapshot's value's, and the field's name. */
	const fielded = { ...snapshotValue, field: anyText } as const
	const fieldedKey = [...snapshotValueKey, "field"] as const

	/** A record response's field in a snapshot, with its base type, whose arm holds its value, inserted with it. */
	const SnapshotRecord = relation(
		"SnapshotRecord",
		{ ...fielded, baseType: closedId(BaseType) },
		fieldedKey
	)
	const SnapshotRecordIdentifier = relation(
		"SnapshotRecordIdentifier",
		{ ...fielded, ...leaf.identifier },
		fieldedKey
	)
	const SnapshotRecordBoolean = relation(
		"SnapshotRecordBoolean",
		{ ...fielded, ...leaf.boolean },
		fieldedKey
	)
	const SnapshotRecordInteger = relation(
		"SnapshotRecordInteger",
		{ ...fielded, ...leaf.integer },
		fieldedKey
	)
	const SnapshotRecordFloat = relation(
		"SnapshotRecordFloat",
		{ ...fielded, ...leaf.float },
		fieldedKey
	)
	const SnapshotRecordString = relation(
		"SnapshotRecordString",
		{ ...fielded, ...leaf.string },
		fieldedKey
	)
	const SnapshotRecordPoint = relation(
		"SnapshotRecordPoint",
		{ ...fielded, ...leaf.point },
		fieldedKey
	)
	const SnapshotRecordPair = relation(
		"SnapshotRecordPair",
		{ ...fielded, ...leaf.pair },
		fieldedKey
	)
	const SnapshotRecordDirectedPair = relation(
		"SnapshotRecordDirectedPair",
		{ ...fielded, ...leaf.directedPair },
		fieldedKey
	)
	const SnapshotRecordDuration = relation(
		"SnapshotRecordDuration",
		{ ...fielded, ...leaf.duration },
		fieldedKey
	)
	const SnapshotRecordUri = relation("SnapshotRecordUri", { ...fielded, ...leaf.uri }, fieldedKey)
	const SnapshotRecordFile = relation(
		"SnapshotRecordFile",
		{ ...fielded, ...leaf.file },
		fieldedKey
	)


	/**
	 * A test's outcomes after a run of its outcome processing (QTI 3.0.1 information model, Table 5.102,
	 * OutcomeProcessing), stored by the transition whose transaction runs it (Bjorn, 2026-11-20: "grading MUST be done in
	 * the same database transaction"): the end of the test's part (`finishTest`), and any later write that changes an
	 * item outcome it reads, each a new run, never a rewrite, since every run is a function of the item sessions'
	 * outcomes in force when it ran ("The values of the test's outcome variables are always reset to their defaults prior
	 * to carrying out the instructions described by the outcomeRules", info:37242). The run in force is the latest.
	 *
	 * - **TestOutcomeRun**: one run, by its sitting and its instant, a clock whose child is the sitting, stamped by the
	 *   insert that adds it, so a sitting's runs are ordered as they were committed.
	 * - **TestOutcome**`<Single|Multiple|Ordered><BaseType>` and **TestOutcomeRecord**(`<BaseType>`): the values the run
	 *   left the test's outcome variables, by the test's declared identifier, in the sidecar of the variable's declared
	 *   cardinality and base type, each leaf typed as a snapshot's ({@link leaf}). NULL is no row.
	 */
	const runFields = { child: LearnerId, stage: pg.bigint, at: instant } as const
	const runKey = ["child", "stage", "at"] as const
	const runValue = { ...runFields, variable: VariableName } as const
	const runValueKey = [...runKey, "variable"] as const
	const runFielded = { ...runValue, field: anyText } as const
	const runFieldedKey = [...runValueKey, "field"] as const

	const TestOutcomeRun = relation("TestOutcomeRun", runFields, runKey)

	/**
	 * The value the delivery engine bound for one of a sitting's test context declarations (QTI 3.0.1 information model,
	 * Table 5.34, ContextDeclaration: "Context variables are typically used to inject the 'context' under which an item
	 * or test session is operating"), a fact of the sitting, written once by the application that binds it (the value
	 * only it knows: a timed sitting's applied limit, an assignment's grade facts) and read by every run of the
	 * sitting's outcome processing, so each run binds the same values. One sidecar per base type a served form binds, a
	 * single value each; no row is a context the engine does not bind, whose declared default stands.
	 */
	const contextFields = { child: LearnerId, stage: pg.bigint, identifier: VariableName } as const
	const contextKey = ["child", "stage", "identifier"] as const
	const SessionContextFloat = relation("SessionContextFloat", { ...contextFields, ...leaf.float }, contextKey)
	const SessionContextInteger = relation("SessionContextInteger", { ...contextFields, ...leaf.integer }, contextKey)
	const SessionContextBoolean = relation("SessionContextBoolean", { ...contextFields, ...leaf.boolean }, contextKey)
	const TestOutcomeSingleIdentifier = relation(
		"TestOutcomeSingleIdentifier",
		{ ...runValue, ...leaf.identifier },
		runValueKey
	)
	const TestOutcomeSingleBoolean = relation(
		"TestOutcomeSingleBoolean",
		{ ...runValue, ...leaf.boolean },
		runValueKey
	)
	const TestOutcomeSingleInteger = relation(
		"TestOutcomeSingleInteger",
		{ ...runValue, ...leaf.integer },
		runValueKey
	)
	const TestOutcomeSingleFloat = relation(
		"TestOutcomeSingleFloat",
		{ ...runValue, ...leaf.float },
		runValueKey
	)
	const TestOutcomeSingleString = relation(
		"TestOutcomeSingleString",
		{ ...runValue, ...leaf.string },
		runValueKey
	)
	const TestOutcomeSinglePoint = relation(
		"TestOutcomeSinglePoint",
		{ ...runValue, ...leaf.point },
		runValueKey
	)
	const TestOutcomeSinglePair = relation(
		"TestOutcomeSinglePair",
		{ ...runValue, ...leaf.pair },
		runValueKey
	)
	const TestOutcomeSingleDirectedPair = relation(
		"TestOutcomeSingleDirectedPair",
		{ ...runValue, ...leaf.directedPair },
		runValueKey
	)
	const TestOutcomeSingleDuration = relation(
		"TestOutcomeSingleDuration",
		{ ...runValue, ...leaf.duration },
		runValueKey
	)
	const TestOutcomeSingleUri = relation(
		"TestOutcomeSingleUri",
		{ ...runValue, ...leaf.uri },
		runValueKey
	)
	const TestOutcomeSingleFile = relation(
		"TestOutcomeSingleFile",
		{ ...runValue, ...leaf.file },
		runValueKey
	)
	const TestOutcomeMultipleIdentifier = relation(
		"TestOutcomeMultipleIdentifier",
		{ ...runValue, ...leaf.identifier, count: natural },
		[...runValueKey, "value"]
	)
	const TestOutcomeMultipleBoolean = relation(
		"TestOutcomeMultipleBoolean",
		{ ...runValue, ...leaf.boolean, count: natural },
		[...runValueKey, "value"]
	)
	const TestOutcomeMultipleInteger = relation(
		"TestOutcomeMultipleInteger",
		{ ...runValue, ...leaf.integer, count: natural },
		[...runValueKey, "value"]
	)
	const TestOutcomeMultipleFloat = relation(
		"TestOutcomeMultipleFloat",
		{ ...runValue, bits: pg.bigint, ...leaf.float, count: natural },
		[...runValueKey, "bits"]
	)
	const TestOutcomeMultipleString = relation(
		"TestOutcomeMultipleString",
		{ ...runValue, ...leaf.string, count: natural },
		[...runValueKey, "value"]
	)
	const TestOutcomeMultiplePoint = relation(
		"TestOutcomeMultiplePoint",
		{ ...runValue, ...leaf.point, count: natural },
		[...runValueKey, "x", "y"]
	)
	const TestOutcomeMultiplePair = relation(
		"TestOutcomeMultiplePair",
		{ ...runValue, ...leaf.pair, count: natural },
		[...runValueKey, "least", "greatest"]
	)
	const TestOutcomeMultipleDirectedPair = relation(
		"TestOutcomeMultipleDirectedPair",
		{ ...runValue, ...leaf.directedPair, count: natural },
		[...runValueKey, "source", "target"]
	)
	const TestOutcomeMultipleDuration = relation(
		"TestOutcomeMultipleDuration",
		{ ...runValue, bits: pg.bigint, ...leaf.duration, count: natural },
		[...runValueKey, "bits"]
	)
	const TestOutcomeMultipleUri = relation(
		"TestOutcomeMultipleUri",
		{ ...runValue, ...leaf.uri, count: natural },
		[...runValueKey, "value"]
	)
	const TestOutcomeMultipleFile = relation(
		"TestOutcomeMultipleFile",
		{ ...runValue, ...leaf.file, count: natural },
		[...runValueKey, "digest", "name", "type"]
	)
	const TestOutcomeOrderedIdentifier = relation(
		"TestOutcomeOrderedIdentifier",
		{ ...runValue, place: natural, ...leaf.identifier },
		[...runValueKey, "place"]
	)
	const TestOutcomeOrderedBoolean = relation(
		"TestOutcomeOrderedBoolean",
		{ ...runValue, place: natural, ...leaf.boolean },
		[...runValueKey, "place"]
	)
	const TestOutcomeOrderedInteger = relation(
		"TestOutcomeOrderedInteger",
		{ ...runValue, place: natural, ...leaf.integer },
		[...runValueKey, "place"]
	)
	const TestOutcomeOrderedFloat = relation(
		"TestOutcomeOrderedFloat",
		{ ...runValue, place: natural, ...leaf.float },
		[...runValueKey, "place"]
	)
	const TestOutcomeOrderedString = relation(
		"TestOutcomeOrderedString",
		{ ...runValue, place: natural, ...leaf.string },
		[...runValueKey, "place"]
	)
	const TestOutcomeOrderedPoint = relation(
		"TestOutcomeOrderedPoint",
		{ ...runValue, place: natural, ...leaf.point },
		[...runValueKey, "place"]
	)
	const TestOutcomeOrderedPair = relation(
		"TestOutcomeOrderedPair",
		{ ...runValue, place: natural, ...leaf.pair },
		[...runValueKey, "place"]
	)
	const TestOutcomeOrderedDirectedPair = relation(
		"TestOutcomeOrderedDirectedPair",
		{ ...runValue, place: natural, ...leaf.directedPair },
		[...runValueKey, "place"]
	)
	const TestOutcomeOrderedDuration = relation(
		"TestOutcomeOrderedDuration",
		{ ...runValue, place: natural, ...leaf.duration },
		[...runValueKey, "place"]
	)
	const TestOutcomeOrderedUri = relation(
		"TestOutcomeOrderedUri",
		{ ...runValue, place: natural, ...leaf.uri },
		[...runValueKey, "place"]
	)
	const TestOutcomeOrderedFile = relation(
		"TestOutcomeOrderedFile",
		{ ...runValue, place: natural, ...leaf.file },
		[...runValueKey, "place"]
	)
	const TestOutcomeRecord = relation(
		"TestOutcomeRecord",
		{ ...runFielded, baseType: closedId(BaseType) },
		runFieldedKey
	)
	const TestOutcomeRecordIdentifier = relation(
		"TestOutcomeRecordIdentifier",
		{ ...runFielded, ...leaf.identifier },
		runFieldedKey
	)
	const TestOutcomeRecordBoolean = relation(
		"TestOutcomeRecordBoolean",
		{ ...runFielded, ...leaf.boolean },
		runFieldedKey
	)
	const TestOutcomeRecordInteger = relation(
		"TestOutcomeRecordInteger",
		{ ...runFielded, ...leaf.integer },
		runFieldedKey
	)
	const TestOutcomeRecordFloat = relation(
		"TestOutcomeRecordFloat",
		{ ...runFielded, ...leaf.float },
		runFieldedKey
	)
	const TestOutcomeRecordString = relation(
		"TestOutcomeRecordString",
		{ ...runFielded, ...leaf.string },
		runFieldedKey
	)
	const TestOutcomeRecordPoint = relation(
		"TestOutcomeRecordPoint",
		{ ...runFielded, ...leaf.point },
		runFieldedKey
	)
	const TestOutcomeRecordPair = relation(
		"TestOutcomeRecordPair",
		{ ...runFielded, ...leaf.pair },
		runFieldedKey
	)
	const TestOutcomeRecordDirectedPair = relation(
		"TestOutcomeRecordDirectedPair",
		{ ...runFielded, ...leaf.directedPair },
		runFieldedKey
	)
	const TestOutcomeRecordDuration = relation(
		"TestOutcomeRecordDuration",
		{ ...runFielded, ...leaf.duration },
		runFieldedKey
	)
	const TestOutcomeRecordUri = relation(
		"TestOutcomeRecordUri",
		{ ...runFielded, ...leaf.uri },
		runFieldedKey
	)
	const TestOutcomeRecordFile = relation(
		"TestOutcomeRecordFile",
		{ ...runFielded, ...leaf.file },
		runFieldedKey
	)

	/** A variable an item session's template processing set at the take, and what it set, whose value rows its
	 * sidecars hold, inserted with it. */
	const ItemSessionValue = relation("ItemSessionValue", sessionValue, sessionValueKey)

	const ItemSessionValueSingleIdentifier = relation(
		"ItemSessionValueSingleIdentifier",
		{ ...sessionValue, ...leaf.identifier },
		sessionValueKey
	)
	const ItemSessionValueSingleBoolean = relation(
		"ItemSessionValueSingleBoolean",
		{ ...sessionValue, ...leaf.boolean },
		sessionValueKey
	)
	const ItemSessionValueSingleInteger = relation(
		"ItemSessionValueSingleInteger",
		{ ...sessionValue, ...leaf.integer },
		sessionValueKey
	)
	const ItemSessionValueSingleFloat = relation(
		"ItemSessionValueSingleFloat",
		{ ...sessionValue, ...leaf.float },
		sessionValueKey
	)
	const ItemSessionValueSingleString = relation(
		"ItemSessionValueSingleString",
		{ ...sessionValue, ...leaf.string },
		sessionValueKey
	)
	const ItemSessionValueSinglePoint = relation(
		"ItemSessionValueSinglePoint",
		{ ...sessionValue, ...leaf.point },
		sessionValueKey
	)
	const ItemSessionValueSinglePair = relation(
		"ItemSessionValueSinglePair",
		{ ...sessionValue, ...leaf.pair },
		sessionValueKey
	)
	const ItemSessionValueSingleDirectedPair = relation(
		"ItemSessionValueSingleDirectedPair",
		{ ...sessionValue, ...leaf.directedPair },
		sessionValueKey
	)
	const ItemSessionValueSingleDuration = relation(
		"ItemSessionValueSingleDuration",
		{ ...sessionValue, ...leaf.duration },
		sessionValueKey
	)
	const ItemSessionValueSingleUri = relation(
		"ItemSessionValueSingleUri",
		{ ...sessionValue, ...leaf.uri },
		sessionValueKey
	)
	const ItemSessionValueSingleFile = relation(
		"ItemSessionValueSingleFile",
		{ ...sessionValue, ...leaf.file },
		sessionValueKey
	)

	const ItemSessionValueMultipleIdentifier = relation(
		"ItemSessionValueMultipleIdentifier",
		{ ...sessionValue, ...leaf.identifier, count: natural },
		[...sessionValueKey, "value"]
	)
	const ItemSessionValueMultipleBoolean = relation(
		"ItemSessionValueMultipleBoolean",
		{ ...sessionValue, ...leaf.boolean, count: natural },
		[...sessionValueKey, "value"]
	)
	const ItemSessionValueMultipleInteger = relation(
		"ItemSessionValueMultipleInteger",
		{ ...sessionValue, ...leaf.integer, count: natural },
		[...sessionValueKey, "value"]
	)
	const ItemSessionValueMultipleFloat = relation(
		"ItemSessionValueMultipleFloat",
		{ ...sessionValue, bits: pg.bigint, ...leaf.float, count: natural },
		[...sessionValueKey, "bits"]
	)
	const ItemSessionValueMultipleString = relation(
		"ItemSessionValueMultipleString",
		{ ...sessionValue, ...leaf.string, count: natural },
		[...sessionValueKey, "value"]
	)
	const ItemSessionValueMultiplePoint = relation(
		"ItemSessionValueMultiplePoint",
		{ ...sessionValue, ...leaf.point, count: natural },
		[...sessionValueKey, "x", "y"]
	)
	const ItemSessionValueMultiplePair = relation(
		"ItemSessionValueMultiplePair",
		{ ...sessionValue, ...leaf.pair, count: natural },
		[...sessionValueKey, "least", "greatest"]
	)
	const ItemSessionValueMultipleDirectedPair = relation(
		"ItemSessionValueMultipleDirectedPair",
		{ ...sessionValue, ...leaf.directedPair, count: natural },
		[...sessionValueKey, "source", "target"]
	)
	const ItemSessionValueMultipleDuration = relation(
		"ItemSessionValueMultipleDuration",
		{ ...sessionValue, bits: pg.bigint, ...leaf.duration, count: natural },
		[...sessionValueKey, "bits"]
	)
	const ItemSessionValueMultipleUri = relation(
		"ItemSessionValueMultipleUri",
		{ ...sessionValue, ...leaf.uri, count: natural },
		[...sessionValueKey, "value"]
	)
	const ItemSessionValueMultipleFile = relation(
		"ItemSessionValueMultipleFile",
		{ ...sessionValue, ...leaf.file, count: natural },
		[...sessionValueKey, "digest", "name", "type"]
	)

	const ItemSessionValueOrderedIdentifier = relation(
		"ItemSessionValueOrderedIdentifier",
		{ ...sessionValue, place: natural, ...leaf.identifier },
		[...sessionValueKey, "place"]
	)
	const ItemSessionValueOrderedBoolean = relation(
		"ItemSessionValueOrderedBoolean",
		{ ...sessionValue, place: natural, ...leaf.boolean },
		[...sessionValueKey, "place"]
	)
	const ItemSessionValueOrderedInteger = relation(
		"ItemSessionValueOrderedInteger",
		{ ...sessionValue, place: natural, ...leaf.integer },
		[...sessionValueKey, "place"]
	)
	const ItemSessionValueOrderedFloat = relation(
		"ItemSessionValueOrderedFloat",
		{ ...sessionValue, place: natural, ...leaf.float },
		[...sessionValueKey, "place"]
	)
	const ItemSessionValueOrderedString = relation(
		"ItemSessionValueOrderedString",
		{ ...sessionValue, place: natural, ...leaf.string },
		[...sessionValueKey, "place"]
	)
	const ItemSessionValueOrderedPoint = relation(
		"ItemSessionValueOrderedPoint",
		{ ...sessionValue, place: natural, ...leaf.point },
		[...sessionValueKey, "place"]
	)
	const ItemSessionValueOrderedPair = relation(
		"ItemSessionValueOrderedPair",
		{ ...sessionValue, place: natural, ...leaf.pair },
		[...sessionValueKey, "place"]
	)
	const ItemSessionValueOrderedDirectedPair = relation(
		"ItemSessionValueOrderedDirectedPair",
		{ ...sessionValue, place: natural, ...leaf.directedPair },
		[...sessionValueKey, "place"]
	)
	const ItemSessionValueOrderedDuration = relation(
		"ItemSessionValueOrderedDuration",
		{ ...sessionValue, place: natural, ...leaf.duration },
		[...sessionValueKey, "place"]
	)
	const ItemSessionValueOrderedUri = relation(
		"ItemSessionValueOrderedUri",
		{ ...sessionValue, place: natural, ...leaf.uri },
		[...sessionValueKey, "place"]
	)
	const ItemSessionValueOrderedFile = relation(
		"ItemSessionValueOrderedFile",
		{ ...sessionValue, place: natural, ...leaf.file },
		[...sessionValueKey, "place"]
	)

	/** An evaluation's key's fields: its attempt's, the operator's place in the item's document, and its clock. */
	const evaluationKey = [...snapshotKey, "operator", "evaluated"] as const

	const OperatorEvaluation = relation(
		"OperatorEvaluation",
		{
			...snapshotFields,
			operator: natural,
			evaluated: instant,
			class: closedId(OperatorClass),
			grader: closedId(GraderVersion),
			request: Sha256,
			result: closedId(EvaluationResult)
		},
		evaluationKey
	)
	const OperatorReply = relation(
		"OperatorReply",
		{ ...snapshotFields, operator: natural, evaluated: instant, score: pg["double precision"] },
		evaluationKey
	)
	const OperatorFeedback = relation(
		"OperatorFeedback",
		{ ...snapshotFields, operator: natural, evaluated: instant, feedback: Feedback },
		evaluationKey
	)
	const OperatorDecline = relation(
		"OperatorDecline",
		{ ...snapshotFields, operator: natural, evaluated: instant, reason: closedId(DeclineReason) },
		evaluationKey
	)

	/** A rubric group as the ledger names it: the `id` of the scorer rubric block its applications name, as written. */
	const RubricName = Literal.fields.text

	/** A human value's key's fields: its attempt's, the rubric group, and the instant it was recorded. */
	const humanKey = [...snapshotKey, "rubric", "asserted"] as const

	const HumanOperatorValue = relation(
		"HumanOperatorValue",
		{
			...snapshotFields,
			rubric: RubricName,
			asserted: instant,
			scorer: ScorerId,
			score: pg["double precision"]
		},
		humanKey
	)
	const HumanOperatorFeedback = relation(
		"HumanOperatorFeedback",
		{ ...snapshotFields, rubric: RubricName, asserted: instant, feedback: Feedback },
		humanKey
	)

	/** A child's test sessions (`#sittings.ts`): each a stage's, over its item sessions. */
	const sittings = sittingTablesOf(qti)

	/** The variables a snapshot records: its responses and its outcomes. */
	const recorded = ["qti-response-declaration", "qti-outcome-declaration"] as const

	type CardinalityName = "single" | "multiple" | "ordered"
	type BaseTypeName = (typeof BaseType.handles)[number]

	/** The response or outcome variables an item declares of a cardinality and base type, by its package, the item's
	 * `identifier` and the declared identifier: what a snapshot's value of that sidecar names. */
	const recordedOf = (cardinality: CardinalityName, baseType: BaseTypeName) =>
		on(
			select(ItemVariable, (i) =>
				i.and(
					i.eq(i.cardinality, cardinality),
					i.eq(i.baseType, baseType),
					i.in(i.declarationKind, recorded)
				)
			),
			"package",
			"path",
			"identifier"
		)

	/** An item session's variables of a cardinality and base type, by its package, the item's `identifier` and the
	 * variable's: what an item session's value of that sidecar names, of the kind its header's law holds. */
	const declaredOf = (cardinality: CardinalityName, baseType: BaseTypeName) =>
		on(
			select(ItemSessionVariable, (i) =>
				i.and(i.eq(i.cardinality, cardinality), i.eq(i.baseType, baseType))
			),
			"package",
			"path",
			"identifier"
		)

	/**
	 * What template processing sets of a variable names an item session variable of the kind its rule sets, as the
	 * QTI 3.0.1 information model's TemplateRuleGroup names each rule's target: a template value a template variable
	 * (`qti-set-template-value`), a correct response "The response variable to have its correct value set" (table
	 * 6.51.5, `qti-set-correct-response`), declared or built in, and a default "The response variable or outcome
	 * variable to have its default value set" (table 6.51.4, `qti-set-default-value`), declared or built in.
	 */
	const settable = (
		kind: (typeof SessionValueKind.handles)[number],
		declarations: ReadonlyArray<"qti-template-declaration" | (typeof recorded)[number]>
	) =>
		contained(
			on(
				select(ItemSessionValue, (s) => s.eq(s.kind, kind)),
				"package",
				"path",
				"variable"
			),
			on(
				select(ItemSessionVariable, (i) => i.in(i.declarationKind, declarations)),
				"package",
				"path",
				"identifier"
			)
		)

	/**
	 * An outcome's assertion: the value a scorer gave one external-scored outcome of one attempt, after the attempt's
	 * response processing ran, at the instant the database stamped it, of one of QTI's two kinds of scorer
	 * ({@link ExternalScoring}). QTI 3.0.1 information model, Table 4.5.10, `external-scored`: "This identifies whether or
	 * not the value for this outcome is produced by human or by machine scoring"; Results Reporting, Table 2.7.7,
	 * `pendingExternalScoring`: "the response processing rules are processed, but the score is NOT final because the
	 * 'external-scored' property for the outcome variable was set". Its key is the attempt's value's,
	 * `(child, package, item, n, at, variable)`, and `asserted`, a clock whose child is that outcome of that attempt: the
	 * assertions of one outcome of one attempt are ordered as they committed, whatever the server's clock reads, and the
	 * latest is the one in force (the owner's ruling, 2026-11-19: "append-only, at the database's instant, the latest
	 * wins"). No role updates or deletes one: a regrade is a later assertion, and a report's "multiple results for the
	 * same instance of an item ... each item result must have a different datestamp" (Results Reporting, Table 2.4.5)
	 * reads each as one dated fact.
	 *
	 * - **OutcomeAssertion**: the header, with its kind, `by`, the declaration's own token, so a law holds it to the
	 *   declaration's (the Delivery level's `ExternallyScored`, one containment).
	 * - **HumanAssertion**: a `human` assertion's arm, its `scorer`, the person who scored ({@link ScorerId}: "a human
	 *   must score the Item", Table 8.21).
	 * - **MachineAssertion**: an `externalMachine` assertion's arm, its `grader`, a machine grader at a version, a handle
	 *   of the Registry's one roster of machine graders (`GraderVersion`, whose facts its `Grader` holds), the roster an
	 *   operator's evaluation names its grader by too ("an external scoring system will be used to score the Item",
	 *   Table 8.21). A handle is one grader at one version, so a new model, prompt or setting is a new handle, and its
	 *   answers are later assertions.
	 * - **AssertedSingle**`<BaseType>`: the asserted value, in the sidecar of the outcome's base type, typed as an
	 *   attempt's single is ({@link leaf}, one shape for both), named by the attempt's value's law
	 *   ({@link recordedOf}). No value row asserts NULL ("An item variable may have no value at all, in which case it is
	 *   said to have the special value NULL", §2.2.2). An outcome of another cardinality is not asserted here: its item is
	 *   admitted and left unserved for credit (the Delivery level's `ExternallyScored` carries the cardinality), never
	 *   refused (QTI 3.0 Conformance §3, the lead's J1).
	 */
	const assertedFields = { ...snapshotValue, asserted: instant } as const
	/** An assertion's key: its attempt's value's, `(child, package, path, n, at, variable)`, and its own instant. */
	const assertedKey = ["child", "package", "path", "n", "at", "variable", "asserted"] as const

	const OutcomeAssertion = relation(
		"OutcomeAssertion",
		{ ...assertedFields, by: closedId(ExternalScoring) },
		assertedKey
	)
	const HumanAssertion = relation(
		"HumanAssertion",
		{ ...assertedFields, scorer: ScorerId },
		assertedKey
	)
	const MachineAssertion = relation(
		"MachineAssertion",
		{ ...assertedFields, grader: closedId(GraderVersion) },
		assertedKey
	)

	const AssertedSingleIdentifier = relation(
		"AssertedSingleIdentifier",
		{ ...assertedFields, ...leaf.identifier },
		assertedKey
	)
	const AssertedSingleBoolean = relation(
		"AssertedSingleBoolean",
		{ ...assertedFields, ...leaf.boolean },
		assertedKey
	)
	const AssertedSingleInteger = relation(
		"AssertedSingleInteger",
		{ ...assertedFields, ...leaf.integer },
		assertedKey
	)
	const AssertedSingleFloat = relation(
		"AssertedSingleFloat",
		{ ...assertedFields, ...leaf.float },
		assertedKey
	)
	const AssertedSingleString = relation(
		"AssertedSingleString",
		{ ...assertedFields, ...leaf.string },
		assertedKey
	)
	const AssertedSinglePoint = relation(
		"AssertedSinglePoint",
		{ ...assertedFields, ...leaf.point },
		assertedKey
	)
	const AssertedSinglePair = relation(
		"AssertedSinglePair",
		{ ...assertedFields, ...leaf.pair },
		assertedKey
	)
	const AssertedSingleDirectedPair = relation(
		"AssertedSingleDirectedPair",
		{ ...assertedFields, ...leaf.directedPair },
		assertedKey
	)
	const AssertedSingleDuration = relation(
		"AssertedSingleDuration",
		{ ...assertedFields, ...leaf.duration },
		assertedKey
	)
	const AssertedSingleUri = relation(
		"AssertedSingleUri",
		{ ...assertedFields, ...leaf.uri },
		assertedKey
	)
	const AssertedSingleFile = relation(
		"AssertedSingleFile",
		{ ...assertedFields, ...leaf.file },
		assertedKey
	)

	/** The relations of outcomes' assertions, in the order the level lists them. */
	const assertions = [
		ExternalScoring,
		OutcomeAssertion,
		HumanAssertion,
		MachineAssertion,
		AssertedSingleIdentifier,
		AssertedSingleBoolean,
		AssertedSingleInteger,
		AssertedSingleFloat,
		AssertedSingleString,
		AssertedSinglePoint,
		AssertedSinglePair,
		AssertedSingleDirectedPair,
		AssertedSingleDuration,
		AssertedSingleUri,
		AssertedSingleFile
	] as const

	/**
	 * The laws of outcomes' assertions that read the ledger alone; the one that holds an assertion to its item's
	 * declaration reads pantry's views, so the Delivery level states it.
	 *
	 * - An assertion scores a recorded attempt: "the response processing rules are processed" (Results Reporting,
	 *   Table 2.7.7) before an external score is given.
	 * - Each assertion has its kind's arm, and only its kind's: a `human` one its Clerk user (Table 8.21, "a human must
	 *   score the Item"); an `externalMachine` one its grader at a version, the Registry's (`MachineAssertion`).
	 * - Each value belongs to its assertion, and is of its outcome's declared cardinality and base type, the law an
	 *   attempt's single is held to ({@link recordedOf}).
	 * - A pair's two identifiers stand in code-point order (`LeastFirst`), as an attempt's do.
	 */
	const assertionLaws = [
		contained(on(OutcomeAssertion, ...snapshotKey), on(Attempt, ...snapshotKey)),
		alternatives(OutcomeAssertion, "by", ExternalScoring, {
			externalMachine: MachineAssertion,
			human: HumanAssertion
		}),
		contained(on(AssertedSingleIdentifier, ...assertedKey), on(OutcomeAssertion, ...assertedKey)),
		contained(
			on(AssertedSingleIdentifier, "package", "path", "variable"),
			recordedOf("single", "identifier")
		),
		contained(on(AssertedSingleBoolean, ...assertedKey), on(OutcomeAssertion, ...assertedKey)),
		contained(
			on(AssertedSingleBoolean, "package", "path", "variable"),
			recordedOf("single", "boolean")
		),
		contained(on(AssertedSingleInteger, ...assertedKey), on(OutcomeAssertion, ...assertedKey)),
		contained(
			on(AssertedSingleInteger, "package", "path", "variable"),
			recordedOf("single", "integer")
		),
		contained(on(AssertedSingleFloat, ...assertedKey), on(OutcomeAssertion, ...assertedKey)),
		contained(
			on(AssertedSingleFloat, "package", "path", "variable"),
			recordedOf("single", "float")
		),
		contained(on(AssertedSingleString, ...assertedKey), on(OutcomeAssertion, ...assertedKey)),
		contained(
			on(AssertedSingleString, "package", "path", "variable"),
			recordedOf("single", "string")
		),
		contained(on(AssertedSinglePoint, ...assertedKey), on(OutcomeAssertion, ...assertedKey)),
		contained(
			on(AssertedSinglePoint, "package", "path", "variable"),
			recordedOf("single", "point")
		),
		contained(on(AssertedSinglePair, ...assertedKey), on(OutcomeAssertion, ...assertedKey)),
		contained(on(AssertedSinglePair, "package", "path", "variable"), recordedOf("single", "pair")),
		contained(on(AssertedSingleDirectedPair, ...assertedKey), on(OutcomeAssertion, ...assertedKey)),
		contained(
			on(AssertedSingleDirectedPair, "package", "path", "variable"),
			recordedOf("single", "directedPair")
		),
		contained(on(AssertedSingleDuration, ...assertedKey), on(OutcomeAssertion, ...assertedKey)),
		contained(
			on(AssertedSingleDuration, "package", "path", "variable"),
			recordedOf("single", "duration")
		),
		contained(on(AssertedSingleUri, ...assertedKey), on(OutcomeAssertion, ...assertedKey)),
		contained(on(AssertedSingleUri, "package", "path", "variable"), recordedOf("single", "uri")),
		contained(on(AssertedSingleFile, ...assertedKey), on(OutcomeAssertion, ...assertedKey)),
		contained(on(AssertedSingleFile, "package", "path", "variable"), recordedOf("single", "file")),
		check("LeastFirst", AssertedSinglePair, (p) => p.le(p.least, p.greatest))
	] as const

	/**
	 * The machine's tokens for the facts of pantry a statement passes the SQL grader (`#ledger/grading.ts`'s flat entry):
	 * each a closed relation from a roster of pantry's to the token its heading's field holds, its rows the machine's own
	 * lists, so a node, an attribute or a declaration's type crosses as the text the machine reads, and one the machine
	 * reads none of crosses as no row. grizzle has no term for a closed id's name (W1, punted from tonight's pin).
	 */
	const ProgramNodeKind = closed.relation(
		"ProgramNodeKind",
		{ kind: closedId(NodeKind), token: ProgramNode.fields.kind },
		["kind"],
		processingKinds.map((kind) => ({ kind, token: kind }))
	)
	const DeclarationNodeKind = closed.relation(
		"DeclarationNodeKind",
		{ kind: closedId(NodeKind), token: DeclarationNode.fields.kind },
		["kind"],
		declarationParts.map((kind) => ({ kind, token: kind }))
	)
	const GradedAttributeName = closed.relation(
		"GradedAttributeName",
		{ name: closedId(AttributeName), token: DocumentAttribute.fields.name },
		["name"],
		gradedAttributes.map((name) => ({ name, token: name }))
	)
	/** An item body's element nodes as response admission reads them (`admission_of`'s `body`): every element kind, by
	 * its name, the text pantry's roster spells it with; a node that is no element (character data, a comment) crosses
	 * as no row. */
	const BodyNodeKind = closed.relation(
		"BodyNodeKind",
		{ kind: closedId(NodeKind), token: BodyNode.fields.kind },
		["kind"],
		NodeKind.handles
			.filter((kind) => Option.isSome(grammar.kinds.isElement.lookup({ kind })))
			.map((kind) => ({ kind, token: kind }))
	)
	/** The attributes of the body's elements response admission reads (`admission_of`'s `body_attributes`), the
	 * machine's own list. */
	const AdmittedAttributeName = closed.relation(
		"AdmittedAttributeName",
		{ name: closedId(AttributeName), token: BodyAttribute.fields.name },
		["name"],
		admittedAttributes.map((name) => ({ name, token: name }))
	)
	const CardinalityToken = closed.relation(
		"CardinalityToken",
		{ cardinality: closedId(Cardinality), token: DocVar.fields.card },
		["cardinality"],
		Cardinality.handles.map((cardinality) => ({ cardinality, token: cardinality }))
	)
	const BaseTypeToken = closed.relation(
		"BaseTypeToken",
		{ baseType: closedId(BaseType), token: DocBase.fields.base },
		["baseType"],
		BaseType.handles.map((baseType) => ({ baseType, token: baseType }))
	)
	const VariableKindToken = closed.relation(
		"VariableKindToken",
		{ declarationKind: closedId(DeclarationKind), token: DocVar.fields.kind },
		["declarationKind"],
		[
			{ declarationKind: "qti-response-declaration", token: "response" },
			{ declarationKind: "qti-outcome-declaration", token: "outcome" },
			{ declarationKind: "qti-template-declaration", token: "template" },
			{ declarationKind: "qti-context-declaration", token: "context" }
		]
	)
	/** Each registered class the machine implements, by the machine's text of it (`table_binding`'s `class`): the
	 * registry's bindings reach the grading statement through it. */
	const OperatorClassToken = closed.relation(
		"OperatorClassToken",
		{ class: closedId(OperatorClass), token: TableBinding.fields.class },
		["class"],
		customOperators.flatMap((operator) =>
			OperatorClass.handles.includes(operator.class) ? [{ class: operator.class, token: operator.class }] : []
		)
	)
	/** Each role a primitive reads a seed table in, by the machine's text of it (`table_binding`'s `role`). */
	const TableRoleToken = closed.relation(
		"TableRoleToken",
		{ role: closedId(TableRole), token: TableBinding.fields.role },
		["role"],
		TableRole.handles.map((role) => ({ role, token: role }))
	)
	/** Each seed table, by the machine's text of its name (the `identifier` of `table_binding`, `table_entry` and
	 * `table_value`). */
	const RegistryTableName = closed.relation(
		"RegistryTableName",
		{ name: TableBinding.fields.identifier, table: closedId(RegistryTable) },
		["table"],
		RegistryTable.handles.map((table) => ({ name: table, table }))
	)
	/** Each key a seed table holds, by the machine's text of it (the `key` of `table_entry` and `table_value`). */
	const RegistryWordText = closed.relation(
		"RegistryWordText",
		{ key: closedId(RegistryWord), text: TableEntry.fields.key },
		["key"],
		RegistryWord.handles.map((word) => ({ key: word, text: word }))
	)

	/** What an item session's template processing set of a variable, by the machine's token of what the run's value of
	 * it holds: a template variable's value its `value`, a correct response its `correct`, a default its `default`. */
	const SessionValueHolds = closed.relation(
		"SessionValueHolds",
		{ holds: DocVar.fields.holds, kind: closedId(SessionValueKind) },
		["kind"],
		[
			{ holds: "value", kind: "template" },
			{ holds: "correct", kind: "correct" },
			{ holds: "default", kind: "default" }
		]
	)

	/**
	 * The published response processing templates (spec reading 51, pantry's `publishedTemplates`), and each one's
	 * document as the reference package `qti-rptemplates` stores it, `<name>.xml`, whose root is the template's
	 * `qti-response-processing`: what the SQL grader runs where an item's processing names one and holds no rule of its
	 * own (§4.6.1, §4.6.2).
	 */
	const PublishedTemplate = closed.ordered("PublishedTemplate", publishedTemplates)
	const PublishedTemplateDocument = closed.relation(
		"PublishedTemplateDocument",
		{
			package: Package.fields.name,
			path: Document.fields.path,
			template: closedId(PublishedTemplate)
		},
		["template"],
		publishedTemplates.map((template) => ({
			package: "qti-rptemplates",
			path: `${template}.xml`,
			template
		}))
	)
	/**
	 * Each `template` URI that names a published template, by its form: pantry's `urisOf`, each template's four, under
	 * either prefix with or without `.xml`, in the order it gives them.
	 */
	const TemplateUriForm = closed.ordered("TemplateUriForm", [
		"purl",
		"purlXml",
		"imsglobal",
		"imsglobalXml"
	])
	const PublishedTemplateUri = closed.relation(
		"PublishedTemplateUri",
		{
			form: closedId(TemplateUriForm),
			template: closedId(PublishedTemplate),
			uri: Attribute.fields.value.type
		},
		["template", "form"],
		publishedTemplates.flatMap((template) =>
			urisOf([template]).flatMap((uri, at) => {
				const form = TemplateUriForm.handles[at]

				return form === undefined ? [] : [{ form, template, uri }]
			})
		)
	)

	return schema.extend(
		[qti],
		"Ledger",
		[
			CompletionStatus,
			SnapshotKind,
			SessionValueKind,
			CreditKind,
			AdmissionCode,
			ItemSession,
			SessionSeed,
			ProgramNodeKind,
			DeclarationNodeKind,
			GradedAttributeName,
			BodyNodeKind,
			AdmittedAttributeName,
			CardinalityToken,
			BaseTypeToken,
			VariableKindToken,
			OperatorClassToken,
			TableRoleToken,
			RegistryTableName,
			RegistryWordText,
			SessionValueHolds,
			PublishedTemplate,
			PublishedTemplateDocument,
			TemplateUriForm,
			PublishedTemplateUri,
			ItemSessionValue,
			ItemSessionValueSingleIdentifier,
			ItemSessionValueSingleBoolean,
			ItemSessionValueSingleInteger,
			ItemSessionValueSingleFloat,
			ItemSessionValueSingleString,
			ItemSessionValueSinglePoint,
			ItemSessionValueSinglePair,
			ItemSessionValueSingleDirectedPair,
			ItemSessionValueSingleDuration,
			ItemSessionValueSingleUri,
			ItemSessionValueSingleFile,
			ItemSessionValueMultipleIdentifier,
			ItemSessionValueMultipleBoolean,
			ItemSessionValueMultipleInteger,
			ItemSessionValueMultipleFloat,
			ItemSessionValueMultipleString,
			ItemSessionValueMultiplePoint,
			ItemSessionValueMultiplePair,
			ItemSessionValueMultipleDirectedPair,
			ItemSessionValueMultipleDuration,
			ItemSessionValueMultipleUri,
			ItemSessionValueMultipleFile,
			ItemSessionValueOrderedIdentifier,
			ItemSessionValueOrderedBoolean,
			ItemSessionValueOrderedInteger,
			ItemSessionValueOrderedFloat,
			ItemSessionValueOrderedString,
			ItemSessionValueOrderedPoint,
			ItemSessionValueOrderedPair,
			ItemSessionValueOrderedDirectedPair,
			ItemSessionValueOrderedDuration,
			ItemSessionValueOrderedUri,
			ItemSessionValueOrderedFile,
			ResponseSnapshot,
			Attempt,
			ProcessedAttempt,
			DefaultSubmission,
			Save,
			SnapshotGiven,
			SnapshotSingleIdentifier,
			SnapshotSingleBoolean,
			SnapshotSingleInteger,
			SnapshotSingleFloat,
			SnapshotSingleString,
			SnapshotSinglePoint,
			SnapshotSinglePair,
			SnapshotSingleDirectedPair,
			SnapshotSingleDuration,
			SnapshotSingleUri,
			SnapshotSingleFile,
			SnapshotMultipleIdentifier,
			SnapshotMultipleBoolean,
			SnapshotMultipleInteger,
			SnapshotMultipleFloat,
			SnapshotMultipleString,
			SnapshotMultiplePoint,
			SnapshotMultiplePair,
			SnapshotMultipleDirectedPair,
			SnapshotMultipleDuration,
			SnapshotMultipleUri,
			SnapshotMultipleFile,
			SnapshotOrderedIdentifier,
			SnapshotOrderedBoolean,
			SnapshotOrderedInteger,
			SnapshotOrderedFloat,
			SnapshotOrderedString,
			SnapshotOrderedPoint,
			SnapshotOrderedPair,
			SnapshotOrderedDirectedPair,
			SnapshotOrderedDuration,
			SnapshotOrderedUri,
			SnapshotOrderedFile,
			SnapshotRecord,
			SnapshotRecordIdentifier,
			SnapshotRecordBoolean,
			SnapshotRecordInteger,
			SnapshotRecordFloat,
			SnapshotRecordString,
			SnapshotRecordPoint,
			SnapshotRecordPair,
			SnapshotRecordDirectedPair,
			SnapshotRecordDuration,
			SnapshotRecordUri,
			SnapshotRecordFile,
			SessionContextFloat,
			SessionContextInteger,
			SessionContextBoolean,
			TestOutcomeRun,
			TestOutcomeSingleIdentifier,
			TestOutcomeSingleBoolean,
			TestOutcomeSingleInteger,
			TestOutcomeSingleFloat,
			TestOutcomeSingleString,
			TestOutcomeSinglePoint,
			TestOutcomeSinglePair,
			TestOutcomeSingleDirectedPair,
			TestOutcomeSingleDuration,
			TestOutcomeSingleUri,
			TestOutcomeSingleFile,
			TestOutcomeMultipleIdentifier,
			TestOutcomeMultipleBoolean,
			TestOutcomeMultipleInteger,
			TestOutcomeMultipleFloat,
			TestOutcomeMultipleString,
			TestOutcomeMultiplePoint,
			TestOutcomeMultiplePair,
			TestOutcomeMultipleDirectedPair,
			TestOutcomeMultipleDuration,
			TestOutcomeMultipleUri,
			TestOutcomeMultipleFile,
			TestOutcomeOrderedIdentifier,
			TestOutcomeOrderedBoolean,
			TestOutcomeOrderedInteger,
			TestOutcomeOrderedFloat,
			TestOutcomeOrderedString,
			TestOutcomeOrderedPoint,
			TestOutcomeOrderedPair,
			TestOutcomeOrderedDirectedPair,
			TestOutcomeOrderedDuration,
			TestOutcomeOrderedUri,
			TestOutcomeOrderedFile,
			TestOutcomeRecord,
			TestOutcomeRecordIdentifier,
			TestOutcomeRecordBoolean,
			TestOutcomeRecordInteger,
			TestOutcomeRecordFloat,
			TestOutcomeRecordString,
			TestOutcomeRecordPoint,
			TestOutcomeRecordPair,
			TestOutcomeRecordDirectedPair,
			TestOutcomeRecordDuration,
			TestOutcomeRecordUri,
			TestOutcomeRecordFile,
			EvaluationResult,
			DeclineReason,
			OperatorEvaluation,
			OperatorReply,
			OperatorFeedback,
			OperatorDecline,
			HumanOperatorValue,
			HumanOperatorFeedback,
			sittings.tables.TestSession,
			sittings.tables.TestMoment,
			sittings.tables.TestVisit,
			sittings.tables.TestSuspension,
			sittings.tables.TestBudget,
			sittings.tables.TestPresented,
			sittings.tables.SittingFinal,
			sittings.tables.TestEnd,
			SittingStanding,
			ItemVariable,
			ItemSessionVariable,
			ItemRecordVariable,
			ScoreDeclared,
			MaximumOutcome,
			MaximumNormal,
			...assertions,
			...gradingFunctions
		],
		[
			key(on(ItemSession, "child", "stage", "package", "path")),
			contained(
				on(ItemSession, "child", "stage", "package", "path"),
				on(SessionSeed, "child", "stage", "package", "path")
			),
			contained(on(ItemSession, "package", "path"), on(ObjectIdentifier, "package", "path")),
			contained(
				on(ItemSessionValue, "child", "stage", "package", "path"),
				on(ItemSession, "child", "stage", "package", "path")
			),
			settable("template", ["qti-template-declaration"]),
			settable("correct", ["qti-response-declaration"]),
			settable("default", recorded),
			contained(
				on(ItemSessionValueSingleIdentifier, ...sessionValueKey),
				on(ItemSessionValue, ...sessionValueKey)
			),
			contained(
				on(ItemSessionValueSingleIdentifier, "package", "path", "variable"),
				declaredOf("single", "identifier")
			),
			contained(
				on(ItemSessionValueSingleBoolean, ...sessionValueKey),
				on(ItemSessionValue, ...sessionValueKey)
			),
			contained(
				on(ItemSessionValueSingleBoolean, "package", "path", "variable"),
				declaredOf("single", "boolean")
			),
			contained(
				on(ItemSessionValueSingleInteger, ...sessionValueKey),
				on(ItemSessionValue, ...sessionValueKey)
			),
			contained(
				on(ItemSessionValueSingleInteger, "package", "path", "variable"),
				declaredOf("single", "integer")
			),
			contained(
				on(ItemSessionValueSingleFloat, ...sessionValueKey),
				on(ItemSessionValue, ...sessionValueKey)
			),
			contained(
				on(ItemSessionValueSingleFloat, "package", "path", "variable"),
				declaredOf("single", "float")
			),
			contained(
				on(ItemSessionValueSingleString, ...sessionValueKey),
				on(ItemSessionValue, ...sessionValueKey)
			),
			contained(
				on(ItemSessionValueSingleString, "package", "path", "variable"),
				declaredOf("single", "string")
			),
			contained(
				on(ItemSessionValueSinglePoint, ...sessionValueKey),
				on(ItemSessionValue, ...sessionValueKey)
			),
			contained(
				on(ItemSessionValueSinglePoint, "package", "path", "variable"),
				declaredOf("single", "point")
			),
			contained(
				on(ItemSessionValueSinglePair, ...sessionValueKey),
				on(ItemSessionValue, ...sessionValueKey)
			),
			contained(
				on(ItemSessionValueSinglePair, "package", "path", "variable"),
				declaredOf("single", "pair")
			),
			contained(
				on(ItemSessionValueSingleDirectedPair, ...sessionValueKey),
				on(ItemSessionValue, ...sessionValueKey)
			),
			contained(
				on(ItemSessionValueSingleDirectedPair, "package", "path", "variable"),
				declaredOf("single", "directedPair")
			),
			contained(
				on(ItemSessionValueSingleDuration, ...sessionValueKey),
				on(ItemSessionValue, ...sessionValueKey)
			),
			contained(
				on(ItemSessionValueSingleDuration, "package", "path", "variable"),
				declaredOf("single", "duration")
			),
			contained(
				on(ItemSessionValueSingleUri, ...sessionValueKey),
				on(ItemSessionValue, ...sessionValueKey)
			),
			contained(
				on(ItemSessionValueSingleUri, "package", "path", "variable"),
				declaredOf("single", "uri")
			),
			contained(
				on(ItemSessionValueSingleFile, ...sessionValueKey),
				on(ItemSessionValue, ...sessionValueKey)
			),
			contained(
				on(ItemSessionValueSingleFile, "package", "path", "variable"),
				declaredOf("single", "file")
			),
			contained(
				on(ItemSessionValueMultipleIdentifier, ...sessionValueKey),
				on(ItemSessionValue, ...sessionValueKey)
			),
			contained(
				on(ItemSessionValueMultipleIdentifier, "package", "path", "variable"),
				declaredOf("multiple", "identifier")
			),
			contained(
				on(ItemSessionValueMultipleBoolean, ...sessionValueKey),
				on(ItemSessionValue, ...sessionValueKey)
			),
			contained(
				on(ItemSessionValueMultipleBoolean, "package", "path", "variable"),
				declaredOf("multiple", "boolean")
			),
			contained(
				on(ItemSessionValueMultipleInteger, ...sessionValueKey),
				on(ItemSessionValue, ...sessionValueKey)
			),
			contained(
				on(ItemSessionValueMultipleInteger, "package", "path", "variable"),
				declaredOf("multiple", "integer")
			),
			contained(
				on(ItemSessionValueMultipleFloat, ...sessionValueKey),
				on(ItemSessionValue, ...sessionValueKey)
			),
			contained(
				on(ItemSessionValueMultipleFloat, "package", "path", "variable"),
				declaredOf("multiple", "float")
			),
			contained(
				on(ItemSessionValueMultipleString, ...sessionValueKey),
				on(ItemSessionValue, ...sessionValueKey)
			),
			contained(
				on(ItemSessionValueMultipleString, "package", "path", "variable"),
				declaredOf("multiple", "string")
			),
			contained(
				on(ItemSessionValueMultiplePoint, ...sessionValueKey),
				on(ItemSessionValue, ...sessionValueKey)
			),
			contained(
				on(ItemSessionValueMultiplePoint, "package", "path", "variable"),
				declaredOf("multiple", "point")
			),
			contained(
				on(ItemSessionValueMultiplePair, ...sessionValueKey),
				on(ItemSessionValue, ...sessionValueKey)
			),
			contained(
				on(ItemSessionValueMultiplePair, "package", "path", "variable"),
				declaredOf("multiple", "pair")
			),
			contained(
				on(ItemSessionValueMultipleDirectedPair, ...sessionValueKey),
				on(ItemSessionValue, ...sessionValueKey)
			),
			contained(
				on(ItemSessionValueMultipleDirectedPair, "package", "path", "variable"),
				declaredOf("multiple", "directedPair")
			),
			contained(
				on(ItemSessionValueMultipleDuration, ...sessionValueKey),
				on(ItemSessionValue, ...sessionValueKey)
			),
			contained(
				on(ItemSessionValueMultipleDuration, "package", "path", "variable"),
				declaredOf("multiple", "duration")
			),
			contained(
				on(ItemSessionValueMultipleUri, ...sessionValueKey),
				on(ItemSessionValue, ...sessionValueKey)
			),
			contained(
				on(ItemSessionValueMultipleUri, "package", "path", "variable"),
				declaredOf("multiple", "uri")
			),
			contained(
				on(ItemSessionValueMultipleFile, ...sessionValueKey),
				on(ItemSessionValue, ...sessionValueKey)
			),
			contained(
				on(ItemSessionValueMultipleFile, "package", "path", "variable"),
				declaredOf("multiple", "file")
			),
			contained(
				on(ItemSessionValueOrderedIdentifier, ...sessionValueKey),
				on(ItemSessionValue, ...sessionValueKey)
			),
			contained(
				on(ItemSessionValueOrderedIdentifier, "package", "path", "variable"),
				declaredOf("ordered", "identifier")
			),
			contained(
				on(ItemSessionValueOrderedBoolean, ...sessionValueKey),
				on(ItemSessionValue, ...sessionValueKey)
			),
			contained(
				on(ItemSessionValueOrderedBoolean, "package", "path", "variable"),
				declaredOf("ordered", "boolean")
			),
			contained(
				on(ItemSessionValueOrderedInteger, ...sessionValueKey),
				on(ItemSessionValue, ...sessionValueKey)
			),
			contained(
				on(ItemSessionValueOrderedInteger, "package", "path", "variable"),
				declaredOf("ordered", "integer")
			),
			contained(
				on(ItemSessionValueOrderedFloat, ...sessionValueKey),
				on(ItemSessionValue, ...sessionValueKey)
			),
			contained(
				on(ItemSessionValueOrderedFloat, "package", "path", "variable"),
				declaredOf("ordered", "float")
			),
			contained(
				on(ItemSessionValueOrderedString, ...sessionValueKey),
				on(ItemSessionValue, ...sessionValueKey)
			),
			contained(
				on(ItemSessionValueOrderedString, "package", "path", "variable"),
				declaredOf("ordered", "string")
			),
			contained(
				on(ItemSessionValueOrderedPoint, ...sessionValueKey),
				on(ItemSessionValue, ...sessionValueKey)
			),
			contained(
				on(ItemSessionValueOrderedPoint, "package", "path", "variable"),
				declaredOf("ordered", "point")
			),
			contained(
				on(ItemSessionValueOrderedPair, ...sessionValueKey),
				on(ItemSessionValue, ...sessionValueKey)
			),
			contained(
				on(ItemSessionValueOrderedPair, "package", "path", "variable"),
				declaredOf("ordered", "pair")
			),
			contained(
				on(ItemSessionValueOrderedDirectedPair, ...sessionValueKey),
				on(ItemSessionValue, ...sessionValueKey)
			),
			contained(
				on(ItemSessionValueOrderedDirectedPair, "package", "path", "variable"),
				declaredOf("ordered", "directedPair")
			),
			contained(
				on(ItemSessionValueOrderedDuration, ...sessionValueKey),
				on(ItemSessionValue, ...sessionValueKey)
			),
			contained(
				on(ItemSessionValueOrderedDuration, "package", "path", "variable"),
				declaredOf("ordered", "duration")
			),
			contained(
				on(ItemSessionValueOrderedUri, ...sessionValueKey),
				on(ItemSessionValue, ...sessionValueKey)
			),
			contained(
				on(ItemSessionValueOrderedUri, "package", "path", "variable"),
				declaredOf("ordered", "uri")
			),
			contained(
				on(ItemSessionValueOrderedFile, ...sessionValueKey),
				on(ItemSessionValue, ...sessionValueKey)
			),
			contained(
				on(ItemSessionValueOrderedFile, "package", "path", "variable"),
				declaredOf("ordered", "file")
			),
			contained(on(ResponseSnapshot, ...sessionKey), on(ItemSession, ...sessionKey)),
			alternatives(ResponseSnapshot, "kind", SnapshotKind, { attempt: Attempt, save: Save }),
			contained(on(SnapshotGiven, ...snapshotKey), on(ResponseSnapshot, ...snapshotKey)),
			check("Given_before", SnapshotGiven, (g) => g.le(g.given, Type.base(g.at))),
			contained(on(ProcessedAttempt, ...snapshotKey), on(Attempt, ...snapshotKey)),
			contained(on(DefaultSubmission, ...snapshotKey), on(Attempt, ...snapshotKey)),
			contained(on(SnapshotSingleIdentifier, ...snapshotKey), on(ResponseSnapshot, ...snapshotKey)),
			contained(
				on(SnapshotSingleIdentifier, "package", "path", "variable"),
				recordedOf("single", "identifier")
			),
			contained(on(SnapshotSingleBoolean, ...snapshotKey), on(ResponseSnapshot, ...snapshotKey)),
			contained(
				on(SnapshotSingleBoolean, "package", "path", "variable"),
				recordedOf("single", "boolean")
			),
			contained(on(SnapshotSingleInteger, ...snapshotKey), on(ResponseSnapshot, ...snapshotKey)),
			contained(
				on(SnapshotSingleInteger, "package", "path", "variable"),
				recordedOf("single", "integer")
			),
			contained(on(SnapshotSingleFloat, ...snapshotKey), on(ResponseSnapshot, ...snapshotKey)),
			contained(
				on(SnapshotSingleFloat, "package", "path", "variable"),
				recordedOf("single", "float")
			),
			contained(on(SnapshotSingleString, ...snapshotKey), on(ResponseSnapshot, ...snapshotKey)),
			contained(
				on(SnapshotSingleString, "package", "path", "variable"),
				recordedOf("single", "string")
			),
			contained(on(SnapshotSinglePoint, ...snapshotKey), on(ResponseSnapshot, ...snapshotKey)),
			contained(
				on(SnapshotSinglePoint, "package", "path", "variable"),
				recordedOf("single", "point")
			),
			contained(on(SnapshotSinglePair, ...snapshotKey), on(ResponseSnapshot, ...snapshotKey)),
			contained(
				on(SnapshotSinglePair, "package", "path", "variable"),
				recordedOf("single", "pair")
			),
			contained(
				on(SnapshotSingleDirectedPair, ...snapshotKey),
				on(ResponseSnapshot, ...snapshotKey)
			),
			contained(
				on(SnapshotSingleDirectedPair, "package", "path", "variable"),
				recordedOf("single", "directedPair")
			),
			contained(on(SnapshotSingleDuration, ...snapshotKey), on(ResponseSnapshot, ...snapshotKey)),
			contained(
				on(SnapshotSingleDuration, "package", "path", "variable"),
				recordedOf("single", "duration")
			),
			contained(on(SnapshotSingleUri, ...snapshotKey), on(ResponseSnapshot, ...snapshotKey)),
			contained(on(SnapshotSingleUri, "package", "path", "variable"), recordedOf("single", "uri")),
			contained(on(SnapshotSingleFile, ...snapshotKey), on(ResponseSnapshot, ...snapshotKey)),
			contained(
				on(SnapshotSingleFile, "package", "path", "variable"),
				recordedOf("single", "file")
			),
			contained(
				on(SnapshotMultipleIdentifier, ...snapshotKey),
				on(ResponseSnapshot, ...snapshotKey)
			),
			contained(
				on(SnapshotMultipleIdentifier, "package", "path", "variable"),
				recordedOf("multiple", "identifier")
			),
			contained(on(SnapshotMultipleBoolean, ...snapshotKey), on(ResponseSnapshot, ...snapshotKey)),
			contained(
				on(SnapshotMultipleBoolean, "package", "path", "variable"),
				recordedOf("multiple", "boolean")
			),
			contained(on(SnapshotMultipleInteger, ...snapshotKey), on(ResponseSnapshot, ...snapshotKey)),
			contained(
				on(SnapshotMultipleInteger, "package", "path", "variable"),
				recordedOf("multiple", "integer")
			),
			contained(on(SnapshotMultipleFloat, ...snapshotKey), on(ResponseSnapshot, ...snapshotKey)),
			contained(
				on(SnapshotMultipleFloat, "package", "path", "variable"),
				recordedOf("multiple", "float")
			),
			contained(on(SnapshotMultipleString, ...snapshotKey), on(ResponseSnapshot, ...snapshotKey)),
			contained(
				on(SnapshotMultipleString, "package", "path", "variable"),
				recordedOf("multiple", "string")
			),
			contained(on(SnapshotMultiplePoint, ...snapshotKey), on(ResponseSnapshot, ...snapshotKey)),
			contained(
				on(SnapshotMultiplePoint, "package", "path", "variable"),
				recordedOf("multiple", "point")
			),
			contained(on(SnapshotMultiplePair, ...snapshotKey), on(ResponseSnapshot, ...snapshotKey)),
			contained(
				on(SnapshotMultiplePair, "package", "path", "variable"),
				recordedOf("multiple", "pair")
			),
			contained(
				on(SnapshotMultipleDirectedPair, ...snapshotKey),
				on(ResponseSnapshot, ...snapshotKey)
			),
			contained(
				on(SnapshotMultipleDirectedPair, "package", "path", "variable"),
				recordedOf("multiple", "directedPair")
			),
			contained(on(SnapshotMultipleDuration, ...snapshotKey), on(ResponseSnapshot, ...snapshotKey)),
			contained(
				on(SnapshotMultipleDuration, "package", "path", "variable"),
				recordedOf("multiple", "duration")
			),
			contained(on(SnapshotMultipleUri, ...snapshotKey), on(ResponseSnapshot, ...snapshotKey)),
			contained(
				on(SnapshotMultipleUri, "package", "path", "variable"),
				recordedOf("multiple", "uri")
			),
			contained(on(SnapshotMultipleFile, ...snapshotKey), on(ResponseSnapshot, ...snapshotKey)),
			contained(
				on(SnapshotMultipleFile, "package", "path", "variable"),
				recordedOf("multiple", "file")
			),
			contained(
				on(SnapshotOrderedIdentifier, ...snapshotKey),
				on(ResponseSnapshot, ...snapshotKey)
			),
			contained(
				on(SnapshotOrderedIdentifier, "package", "path", "variable"),
				recordedOf("ordered", "identifier")
			),
			contained(on(SnapshotOrderedBoolean, ...snapshotKey), on(ResponseSnapshot, ...snapshotKey)),
			contained(
				on(SnapshotOrderedBoolean, "package", "path", "variable"),
				recordedOf("ordered", "boolean")
			),
			contained(on(SnapshotOrderedInteger, ...snapshotKey), on(ResponseSnapshot, ...snapshotKey)),
			contained(
				on(SnapshotOrderedInteger, "package", "path", "variable"),
				recordedOf("ordered", "integer")
			),
			contained(on(SnapshotOrderedFloat, ...snapshotKey), on(ResponseSnapshot, ...snapshotKey)),
			contained(
				on(SnapshotOrderedFloat, "package", "path", "variable"),
				recordedOf("ordered", "float")
			),
			contained(on(SnapshotOrderedString, ...snapshotKey), on(ResponseSnapshot, ...snapshotKey)),
			contained(
				on(SnapshotOrderedString, "package", "path", "variable"),
				recordedOf("ordered", "string")
			),
			contained(on(SnapshotOrderedPoint, ...snapshotKey), on(ResponseSnapshot, ...snapshotKey)),
			contained(
				on(SnapshotOrderedPoint, "package", "path", "variable"),
				recordedOf("ordered", "point")
			),
			contained(on(SnapshotOrderedPair, ...snapshotKey), on(ResponseSnapshot, ...snapshotKey)),
			contained(
				on(SnapshotOrderedPair, "package", "path", "variable"),
				recordedOf("ordered", "pair")
			),
			contained(
				on(SnapshotOrderedDirectedPair, ...snapshotKey),
				on(ResponseSnapshot, ...snapshotKey)
			),
			contained(
				on(SnapshotOrderedDirectedPair, "package", "path", "variable"),
				recordedOf("ordered", "directedPair")
			),
			contained(on(SnapshotOrderedDuration, ...snapshotKey), on(ResponseSnapshot, ...snapshotKey)),
			contained(
				on(SnapshotOrderedDuration, "package", "path", "variable"),
				recordedOf("ordered", "duration")
			),
			contained(on(SnapshotOrderedUri, ...snapshotKey), on(ResponseSnapshot, ...snapshotKey)),
			contained(
				on(SnapshotOrderedUri, "package", "path", "variable"),
				recordedOf("ordered", "uri")
			),
			contained(on(SnapshotOrderedFile, ...snapshotKey), on(ResponseSnapshot, ...snapshotKey)),
			contained(
				on(SnapshotOrderedFile, "package", "path", "variable"),
				recordedOf("ordered", "file")
			),
			check("SomeOccurrence", SnapshotMultipleIdentifier, (m) => m.ge(m.count, 1n)),
			check("SomeOccurrence", SnapshotMultipleBoolean, (m) => m.ge(m.count, 1n)),
			check("SomeOccurrence", SnapshotMultipleInteger, (m) => m.ge(m.count, 1n)),
			check("SomeOccurrence", SnapshotMultipleFloat, (m) => m.ge(m.count, 1n)),
			check("SomeOccurrence", SnapshotMultipleString, (m) => m.ge(m.count, 1n)),
			check("SomeOccurrence", SnapshotMultiplePoint, (m) => m.ge(m.count, 1n)),
			check("SomeOccurrence", SnapshotMultiplePair, (m) => m.ge(m.count, 1n)),
			check("SomeOccurrence", SnapshotMultipleDirectedPair, (m) => m.ge(m.count, 1n)),
			check("SomeOccurrence", SnapshotMultipleDuration, (m) => m.ge(m.count, 1n)),
			check("SomeOccurrence", SnapshotMultipleUri, (m) => m.ge(m.count, 1n)),
			check("SomeOccurrence", SnapshotMultipleFile, (m) => m.ge(m.count, 1n)),
			check("SomeOccurrence", ItemSessionValueMultipleIdentifier, (m) => m.ge(m.count, 1n)),
			check("SomeOccurrence", ItemSessionValueMultipleBoolean, (m) => m.ge(m.count, 1n)),
			check("SomeOccurrence", ItemSessionValueMultipleInteger, (m) => m.ge(m.count, 1n)),
			check("SomeOccurrence", ItemSessionValueMultipleFloat, (m) => m.ge(m.count, 1n)),
			check("SomeOccurrence", ItemSessionValueMultipleString, (m) => m.ge(m.count, 1n)),
			check("SomeOccurrence", ItemSessionValueMultiplePoint, (m) => m.ge(m.count, 1n)),
			check("SomeOccurrence", ItemSessionValueMultiplePair, (m) => m.ge(m.count, 1n)),
			check("SomeOccurrence", ItemSessionValueMultipleDirectedPair, (m) => m.ge(m.count, 1n)),
			check("SomeOccurrence", ItemSessionValueMultipleDuration, (m) => m.ge(m.count, 1n)),
			check("SomeOccurrence", ItemSessionValueMultipleUri, (m) => m.ge(m.count, 1n)),
			check("SomeOccurrence", ItemSessionValueMultipleFile, (m) => m.ge(m.count, 1n)),
			contained(
				on(SnapshotOrderedIdentifier, ...snapshotKey, "variable", pred("place")),
				on(SnapshotOrderedIdentifier, ...snapshotKey, "variable", "place")
			),
			contained(
				on(SnapshotOrderedBoolean, ...snapshotKey, "variable", pred("place")),
				on(SnapshotOrderedBoolean, ...snapshotKey, "variable", "place")
			),
			contained(
				on(SnapshotOrderedInteger, ...snapshotKey, "variable", pred("place")),
				on(SnapshotOrderedInteger, ...snapshotKey, "variable", "place")
			),
			contained(
				on(SnapshotOrderedFloat, ...snapshotKey, "variable", pred("place")),
				on(SnapshotOrderedFloat, ...snapshotKey, "variable", "place")
			),
			contained(
				on(SnapshotOrderedString, ...snapshotKey, "variable", pred("place")),
				on(SnapshotOrderedString, ...snapshotKey, "variable", "place")
			),
			contained(
				on(SnapshotOrderedPoint, ...snapshotKey, "variable", pred("place")),
				on(SnapshotOrderedPoint, ...snapshotKey, "variable", "place")
			),
			contained(
				on(SnapshotOrderedPair, ...snapshotKey, "variable", pred("place")),
				on(SnapshotOrderedPair, ...snapshotKey, "variable", "place")
			),
			contained(
				on(SnapshotOrderedDirectedPair, ...snapshotKey, "variable", pred("place")),
				on(SnapshotOrderedDirectedPair, ...snapshotKey, "variable", "place")
			),
			contained(
				on(SnapshotOrderedDuration, ...snapshotKey, "variable", pred("place")),
				on(SnapshotOrderedDuration, ...snapshotKey, "variable", "place")
			),
			contained(
				on(SnapshotOrderedUri, ...snapshotKey, "variable", pred("place")),
				on(SnapshotOrderedUri, ...snapshotKey, "variable", "place")
			),
			contained(
				on(SnapshotOrderedFile, ...snapshotKey, "variable", pred("place")),
				on(SnapshotOrderedFile, ...snapshotKey, "variable", "place")
			),
			contained(
				on(ItemSessionValueOrderedIdentifier, ...sessionValueKey, pred("place")),
				on(ItemSessionValueOrderedIdentifier, ...sessionValueKey, "place")
			),
			contained(
				on(ItemSessionValueOrderedBoolean, ...sessionValueKey, pred("place")),
				on(ItemSessionValueOrderedBoolean, ...sessionValueKey, "place")
			),
			contained(
				on(ItemSessionValueOrderedInteger, ...sessionValueKey, pred("place")),
				on(ItemSessionValueOrderedInteger, ...sessionValueKey, "place")
			),
			contained(
				on(ItemSessionValueOrderedFloat, ...sessionValueKey, pred("place")),
				on(ItemSessionValueOrderedFloat, ...sessionValueKey, "place")
			),
			contained(
				on(ItemSessionValueOrderedString, ...sessionValueKey, pred("place")),
				on(ItemSessionValueOrderedString, ...sessionValueKey, "place")
			),
			contained(
				on(ItemSessionValueOrderedPoint, ...sessionValueKey, pred("place")),
				on(ItemSessionValueOrderedPoint, ...sessionValueKey, "place")
			),
			contained(
				on(ItemSessionValueOrderedPair, ...sessionValueKey, pred("place")),
				on(ItemSessionValueOrderedPair, ...sessionValueKey, "place")
			),
			contained(
				on(ItemSessionValueOrderedDirectedPair, ...sessionValueKey, pred("place")),
				on(ItemSessionValueOrderedDirectedPair, ...sessionValueKey, "place")
			),
			contained(
				on(ItemSessionValueOrderedDuration, ...sessionValueKey, pred("place")),
				on(ItemSessionValueOrderedDuration, ...sessionValueKey, "place")
			),
			contained(
				on(ItemSessionValueOrderedUri, ...sessionValueKey, pred("place")),
				on(ItemSessionValueOrderedUri, ...sessionValueKey, "place")
			),
			contained(
				on(ItemSessionValueOrderedFile, ...sessionValueKey, pred("place")),
				on(ItemSessionValueOrderedFile, ...sessionValueKey, "place")
			),
			check("BagImage", SnapshotMultipleFloat, (b) => b.eq(b.bits, Num.floatBits(b.value))),
			check("BagImage", SnapshotMultipleDuration, (b) => b.eq(b.bits, Num.floatBits(b.value))),
			check("BagImage", ItemSessionValueMultipleFloat, (b) => b.eq(b.bits, Num.floatBits(b.value))),
			check("BagImage", ItemSessionValueMultipleDuration, (b) =>
				b.eq(b.bits, Num.floatBits(b.value))
			),
			check("LeastFirst", SnapshotSinglePair, (p) => p.le(p.least, p.greatest)),
			check("LeastFirst", SnapshotMultiplePair, (p) => p.le(p.least, p.greatest)),
			check("LeastFirst", SnapshotOrderedPair, (p) => p.le(p.least, p.greatest)),
			check("LeastFirst", SnapshotRecordPair, (p) => p.le(p.least, p.greatest)),
			check("LeastFirst", ItemSessionValueSinglePair, (p) => p.le(p.least, p.greatest)),
			check("LeastFirst", ItemSessionValueMultiplePair, (p) => p.le(p.least, p.greatest)),
			check("LeastFirst", ItemSessionValueOrderedPair, (p) => p.le(p.least, p.greatest)),
			contained(on(SnapshotRecord, ...snapshotKey), on(ResponseSnapshot, ...snapshotKey)),
			contained(
				on(SnapshotRecord, "package", "path", "variable"),
				on(
					select(ItemRecordVariable, (i) => i.in(i.declarationKind, recorded)),
					"package",
					"path",
					"identifier"
				)
			),
			alternatives(SnapshotRecord, "baseType", BaseType, {
				identifier: SnapshotRecordIdentifier,
				boolean: SnapshotRecordBoolean,
				integer: SnapshotRecordInteger,
				float: SnapshotRecordFloat,
				string: SnapshotRecordString,
				point: SnapshotRecordPoint,
				pair: SnapshotRecordPair,
				directedPair: SnapshotRecordDirectedPair,
				duration: SnapshotRecordDuration,
				uri: SnapshotRecordUri,
				file: SnapshotRecordFile
			}),
			contained(on(OperatorEvaluation, ...snapshotKey), on(Attempt, ...snapshotKey)),
			key(on(OperatorEvaluation, ...snapshotKey, "operator")),
			contained(
				on(OperatorEvaluation, "package", "path", "operator", "class"),
				on(RecordedApplication, "package", "path", "start", "class")
			),
			check("Evaluation_grader", OperatorEvaluation, (e) =>
				e.eq(Grader.at("class", e.grader), e.class)
			),
			alternatives(OperatorEvaluation, "result", EvaluationResult, {
				replied: OperatorReply,
				declined: OperatorDecline
			}),
			check("Reply_score", OperatorReply, (r) =>
				r.and(r.ge(r.score, 0), r.lt(r.score, Number.POSITIVE_INFINITY))
			),
			contained(on(OperatorFeedback, ...evaluationKey), on(OperatorReply, ...evaluationKey)),
			contained(on(HumanOperatorValue, ...snapshotKey), on(Attempt, ...snapshotKey)),
			contained(
				on(HumanOperatorValue, "package", "path", "rubric"),
				on(RubricGrader, "package", "path", "rubric")
			),
			check("Human_score", HumanOperatorValue, (h) =>
				h.and(h.ge(h.score, 0), h.lt(h.score, Number.POSITIVE_INFINITY))
			),
			contained(on(HumanOperatorFeedback, ...humanKey), on(HumanOperatorValue, ...humanKey)),
			contained(
				on(TestOutcomeRun, "child", "stage"),
				on(sittings.tables.TestSession, "child", "stage")
			),
			contained(
				on(SessionContextFloat, "child", "stage"),
				on(sittings.tables.TestSession, "child", "stage")
			),
			contained(
				on(SessionContextInteger, "child", "stage"),
				on(sittings.tables.TestSession, "child", "stage")
			),
			contained(
				on(SessionContextBoolean, "child", "stage"),
				on(sittings.tables.TestSession, "child", "stage")
			),
			contained(on(TestOutcomeSingleIdentifier, ...runKey), on(TestOutcomeRun, ...runKey)),
			contained(on(TestOutcomeSingleBoolean, ...runKey), on(TestOutcomeRun, ...runKey)),
			contained(on(TestOutcomeSingleInteger, ...runKey), on(TestOutcomeRun, ...runKey)),
			contained(on(TestOutcomeSingleFloat, ...runKey), on(TestOutcomeRun, ...runKey)),
			contained(on(TestOutcomeSingleString, ...runKey), on(TestOutcomeRun, ...runKey)),
			contained(on(TestOutcomeSinglePoint, ...runKey), on(TestOutcomeRun, ...runKey)),
			contained(on(TestOutcomeSinglePair, ...runKey), on(TestOutcomeRun, ...runKey)),
			contained(on(TestOutcomeSingleDirectedPair, ...runKey), on(TestOutcomeRun, ...runKey)),
			contained(on(TestOutcomeSingleDuration, ...runKey), on(TestOutcomeRun, ...runKey)),
			contained(on(TestOutcomeSingleUri, ...runKey), on(TestOutcomeRun, ...runKey)),
			contained(on(TestOutcomeSingleFile, ...runKey), on(TestOutcomeRun, ...runKey)),
			contained(on(TestOutcomeMultipleIdentifier, ...runKey), on(TestOutcomeRun, ...runKey)),
			contained(on(TestOutcomeMultipleBoolean, ...runKey), on(TestOutcomeRun, ...runKey)),
			contained(on(TestOutcomeMultipleInteger, ...runKey), on(TestOutcomeRun, ...runKey)),
			contained(on(TestOutcomeMultipleFloat, ...runKey), on(TestOutcomeRun, ...runKey)),
			contained(on(TestOutcomeMultipleString, ...runKey), on(TestOutcomeRun, ...runKey)),
			contained(on(TestOutcomeMultiplePoint, ...runKey), on(TestOutcomeRun, ...runKey)),
			contained(on(TestOutcomeMultiplePair, ...runKey), on(TestOutcomeRun, ...runKey)),
			contained(on(TestOutcomeMultipleDirectedPair, ...runKey), on(TestOutcomeRun, ...runKey)),
			contained(on(TestOutcomeMultipleDuration, ...runKey), on(TestOutcomeRun, ...runKey)),
			contained(on(TestOutcomeMultipleUri, ...runKey), on(TestOutcomeRun, ...runKey)),
			contained(on(TestOutcomeMultipleFile, ...runKey), on(TestOutcomeRun, ...runKey)),
			contained(on(TestOutcomeOrderedIdentifier, ...runKey), on(TestOutcomeRun, ...runKey)),
			contained(on(TestOutcomeOrderedBoolean, ...runKey), on(TestOutcomeRun, ...runKey)),
			contained(on(TestOutcomeOrderedInteger, ...runKey), on(TestOutcomeRun, ...runKey)),
			contained(on(TestOutcomeOrderedFloat, ...runKey), on(TestOutcomeRun, ...runKey)),
			contained(on(TestOutcomeOrderedString, ...runKey), on(TestOutcomeRun, ...runKey)),
			contained(on(TestOutcomeOrderedPoint, ...runKey), on(TestOutcomeRun, ...runKey)),
			contained(on(TestOutcomeOrderedPair, ...runKey), on(TestOutcomeRun, ...runKey)),
			contained(on(TestOutcomeOrderedDirectedPair, ...runKey), on(TestOutcomeRun, ...runKey)),
			contained(on(TestOutcomeOrderedDuration, ...runKey), on(TestOutcomeRun, ...runKey)),
			contained(on(TestOutcomeOrderedUri, ...runKey), on(TestOutcomeRun, ...runKey)),
			contained(on(TestOutcomeOrderedFile, ...runKey), on(TestOutcomeRun, ...runKey)),
			check("SomeOccurrence", TestOutcomeMultipleIdentifier, (m) => m.ge(m.count, 1n)),
			check("SomeOccurrence", TestOutcomeMultipleBoolean, (m) => m.ge(m.count, 1n)),
			check("SomeOccurrence", TestOutcomeMultipleInteger, (m) => m.ge(m.count, 1n)),
			check("SomeOccurrence", TestOutcomeMultipleFloat, (m) => m.ge(m.count, 1n)),
			check("SomeOccurrence", TestOutcomeMultipleString, (m) => m.ge(m.count, 1n)),
			check("SomeOccurrence", TestOutcomeMultiplePoint, (m) => m.ge(m.count, 1n)),
			check("SomeOccurrence", TestOutcomeMultiplePair, (m) => m.ge(m.count, 1n)),
			check("SomeOccurrence", TestOutcomeMultipleDirectedPair, (m) => m.ge(m.count, 1n)),
			check("SomeOccurrence", TestOutcomeMultipleDuration, (m) => m.ge(m.count, 1n)),
			check("SomeOccurrence", TestOutcomeMultipleUri, (m) => m.ge(m.count, 1n)),
			check("SomeOccurrence", TestOutcomeMultipleFile, (m) => m.ge(m.count, 1n)),
			contained(
				on(TestOutcomeOrderedIdentifier, ...runValueKey, pred("place")),
				on(TestOutcomeOrderedIdentifier, ...runValueKey, "place")
			),
			contained(
				on(TestOutcomeOrderedBoolean, ...runValueKey, pred("place")),
				on(TestOutcomeOrderedBoolean, ...runValueKey, "place")
			),
			contained(
				on(TestOutcomeOrderedInteger, ...runValueKey, pred("place")),
				on(TestOutcomeOrderedInteger, ...runValueKey, "place")
			),
			contained(
				on(TestOutcomeOrderedFloat, ...runValueKey, pred("place")),
				on(TestOutcomeOrderedFloat, ...runValueKey, "place")
			),
			contained(
				on(TestOutcomeOrderedString, ...runValueKey, pred("place")),
				on(TestOutcomeOrderedString, ...runValueKey, "place")
			),
			contained(
				on(TestOutcomeOrderedPoint, ...runValueKey, pred("place")),
				on(TestOutcomeOrderedPoint, ...runValueKey, "place")
			),
			contained(
				on(TestOutcomeOrderedPair, ...runValueKey, pred("place")),
				on(TestOutcomeOrderedPair, ...runValueKey, "place")
			),
			contained(
				on(TestOutcomeOrderedDirectedPair, ...runValueKey, pred("place")),
				on(TestOutcomeOrderedDirectedPair, ...runValueKey, "place")
			),
			contained(
				on(TestOutcomeOrderedDuration, ...runValueKey, pred("place")),
				on(TestOutcomeOrderedDuration, ...runValueKey, "place")
			),
			contained(
				on(TestOutcomeOrderedUri, ...runValueKey, pred("place")),
				on(TestOutcomeOrderedUri, ...runValueKey, "place")
			),
			contained(
				on(TestOutcomeOrderedFile, ...runValueKey, pred("place")),
				on(TestOutcomeOrderedFile, ...runValueKey, "place")
			),
			check("BagImage", TestOutcomeMultipleFloat, (b) => b.eq(b.bits, Num.floatBits(b.value))),
			check("BagImage", TestOutcomeMultipleDuration, (b) => b.eq(b.bits, Num.floatBits(b.value))),
			check("LeastFirst", TestOutcomeSinglePair, (p) => p.le(p.least, p.greatest)),
			check("LeastFirst", TestOutcomeMultiplePair, (p) => p.le(p.least, p.greatest)),
			check("LeastFirst", TestOutcomeOrderedPair, (p) => p.le(p.least, p.greatest)),
			check("LeastFirst", TestOutcomeRecordPair, (p) => p.le(p.least, p.greatest)),
			contained(on(TestOutcomeRecord, ...runKey), on(TestOutcomeRun, ...runKey)),
			alternatives(TestOutcomeRecord, "baseType", BaseType, {
				identifier: TestOutcomeRecordIdentifier,
				boolean: TestOutcomeRecordBoolean,
				integer: TestOutcomeRecordInteger,
				float: TestOutcomeRecordFloat,
				string: TestOutcomeRecordString,
				point: TestOutcomeRecordPoint,
				pair: TestOutcomeRecordPair,
				directedPair: TestOutcomeRecordDirectedPair,
				duration: TestOutcomeRecordDuration,
				uri: TestOutcomeRecordUri,
				file: TestOutcomeRecordFile
			}),
			...sittings.laws,
			contained(
				on(sittings.tables.TestPresented, "child", "stage", "package", "path"),
				on(ItemSession, "child", "stage", "package", "path")
			),
			...assertionLaws
		]
	)
}
