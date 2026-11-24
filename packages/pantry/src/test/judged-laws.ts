/**
 * What a test reads of the laws the tests' host judge judges (`#pantry/test/host-judge.ts`)
 * beyond the judge itself: each containment a relation is the source of, named as grizzle's
 * `lawsOf` names its statement's law ({@link containmentsOf}).
 *
 * It reads grizzle's values, so the law oracle reaches it from none of its modules: the oracle is a
 * second implementation, and reads no value of grizzle's (`src/grammar/purity.test.ts`).
 */
import { containmentsIn } from "#pantry/test/host-judge.ts";
import type { Containment } from "#pantry/test/host-judge.ts";
import type { Qti } from "#pantry/qti/schema.ts";
import { statementLawsOf } from "#pantry/test/law-namer.ts";

/**
 * Read every containment the schema states from one relation (`containmentsIn` of
 * `#pantry/test/host-judge.ts`), so a test can judge rows by the schema's own statements, their
 * selections included. Each law is its statement's own, named as the host judge's `judgedLaws`
 * names it, so `src/import/refusal.ts`'s `lawNameOf` names it.
 *
 * @param schema - The schema, `Qti`.
 * @param from - The source relation.
 * @returns The containments, in statement order.
 */
export const containmentsOf = (schema: typeof Qti, from: string): readonly Containment[] =>
  statementLawsOf(schema).flatMap(({ laws, statement }) => containmentsIn(statement, from, laws));
