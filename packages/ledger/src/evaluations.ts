import { closed, str } from "@bjornpagen/grizzle"

/**
 * What a registered evaluator's call to its vendor came to, a fact once the vendor completed a reply (QTI 3.0.1 RR
 * Table 2.7.7: an item whose operator's value is missing is `pendingResponseProcessing`): the model replied with a
 * value its class's contract admits, or it declined. A transient failure (a timeout, a 5xx, a 429, a function killed
 * at its maximum duration) is no fact: the evaluator retries it until it completes (spec/custom-operators.md §5.5).
 */
export const EvaluationResult = closed.ordered("EvaluationResult", ["replied", "declined"])

/**
 * Why a completed reply holds no value: the model refused, its reply failed the class's contract (not JSON, a field
 * missing, a score outside [0, maximum]), which is never clamped or repaired, or the essay was unanswered: whitespace
 * or markup alone, which the item's own empty-essay rule makes NULL
 * (`when-present(normalize-space(markup-text(RESPONSE)), RESPONSE)`). The operator's value is then NULL, as an empty
 * response's is (ASI §2.11, NULL in, NULL out), and the item's own processing decides what NULL scores. A `refused` or
 * `unreadable` group is a person's to score (`#ledger/assertion-views.ts` awaitingHumanEvaluationsOf); an `unanswered`
 * one is no one's, as a NULL response's. Appended, since codes are history.
 */
export const DeclineReason = closed.ordered("DeclineReason", ["refused", "unreadable", "unanswered"])

/**
 * A SHA-256 digest as text, 64 lowercase hexadecimal digits: the digest of the exact request body an evaluator sent,
 * which pins the model, its parameters, the prompt with its rubric, passage and question, the response and the
 * maximum.
 */
export const Sha256 = str.regex("^[0-9a-f]{64}$")

/** A reply's feedback: some text, since an empty string is QTI's NULL (ASI §2.11) and is no row. */
export const Feedback = str.regex("^.+$", "su")
