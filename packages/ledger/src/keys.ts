/**
 * The ledger's texts its writers brand their values with, which load no schema: a learner's id, a scorer's id and any
 * text.
 */
import { str } from "@bjornpagen/grizzle"

/**
 * The most UTF-8 bytes of a learner's id: the widest id an installation keys a learner by. edullm's are Clerk user ids,
 * `user_` and at most 64 ASCII letters or digits, 69 bytes.
 *
 * @limitKind derived
 * @owner the QTI ledger
 * @unit UTF-8 bytes
 * @scope every learner id a ledger key holds
 * @derivation `user_` (5 bytes) and Clerk's at most 64 ASCII letters or digits, the bound edullm's Clerk user id states
 */
const learnerIdBytes = 69

/** A text of one character or more: a text single's value (`identifier`, `string`, `uri`), since QTI reads the empty
 * string as NULL (information model, isNull), a file's name, since an empty name names no file (plate's
 * `parseLexical`), a learner's id and a scorer's id. */
export const someText = str.regex("^.+$", "su")

/**
 * A learner's id: an opaque text of one byte or more the application assigns, which QTI names nowhere (a candidate is
 * the delivery system's own), of at most {@link learnerIdBytes} UTF-8 bytes. An application's own level states what it
 * is (edullm's Identity level: a Clerk user).
 */
export const LearnerId = str.bytes(learnerIdBytes, someText)

/**
 * The most UTF-8 bytes of a scorer's id: the widest id an installation names a person who scores by. edullm's are Clerk
 * user ids, `user_` and at most 64 ASCII letters or digits, 69 bytes.
 *
 * @limitKind derived
 * @owner the QTI ledger
 * @unit UTF-8 bytes
 * @scope every scorer id an assertion or a person's value holds
 * @derivation `user_` (5 bytes) and Clerk's at most 64 ASCII letters or digits, the bound edullm's Clerk user id states
 */
const scorerIdBytes = 69

/**
 * A scorer's id: the person who scores an external-scored outcome or a rubric group by hand, an opaque text of one byte
 * or more the application assigns, of at most {@link scorerIdBytes} UTF-8 bytes. QTI names the human scorer ("a human
 * must score the Item", information model Table 8.21) and no form of their identity; an application's own level states
 * who may score (edullm's admin rule over its Clerk users). A scorer is no learner: {@link LearnerId} is another fact,
 * whatever text the two admit.
 */
export const ScorerId = str.bytes(scorerIdBytes, someText)

/** Any text: a value of a text base type (`identifier`, `uri`, a pair's sides, a file's type), or an email, which no
 * law reads. Its pattern admits everything, so grizzle installs it as plain text. */
export const anyText = str.regex("^.*$", "su")
