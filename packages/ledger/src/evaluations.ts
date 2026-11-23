import { closed, str } from "@bjornpagen/grizzle";
import { named } from "#ledger/laws.ts";

/**
 * What a registered evaluator's call to its vendor came to, a fact once the vendor completed a
 * reply (QTI 3.0.1 RR Table 2.7.7: an item whose operator's value is missing is
 * `pendingResponseProcessing`): the model replied with a value its class's contract admits, or it
 * declined. A transient failure (a timeout, a 5xx, a 429, a function killed at its maximum
 * duration) is no fact: the evaluator retries it until it completes (spec/custom-operators.md
 * §5.5).
 */
export const EvaluationResult = closed.ordered("EvaluationResult", ["replied", "declined"]);

/**
 * Why a completed reply holds no value: the model refused, or its reply failed the class's contract
 * (not JSON, a field missing, a score outside [0, maximum]), which is never clamped or repaired.
 * The operator's value is then NULL (ASI §2.11, NULL in, NULL out), and a group whose every draw
 * declined is a person's to score (`#ledger/assertion-views.ts` awaitingHumanEvaluationsOf). An
 * essay its item's own rule finds empty is no reason: the processing never reaches its draws, so it
 * is never requested (`ApplicationDemand`). Appended, since codes are history.
 */
export const DeclineReason = closed.ordered("DeclineReason", ["refused", "unreadable"]);

/**
 * A reply's feedback: some text, since an empty string is QTI's NULL (ASI §2.11) and is no row.
 */
export const Feedback = named("Nonempty text", str.regex("^.+$", "su"));
