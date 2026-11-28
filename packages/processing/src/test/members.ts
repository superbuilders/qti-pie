/**
 * A test's member for the tests: an item compiled into a test of one individual part whose item
 * session control writes `validate-responses="true"`, so its answers validate (QTI 3.0.1 §7.19.7).
 *
 * @module
 */
import { compileTestWith } from "#processing/compile/document.ts";
import type { Answered } from "#processing/grade.ts";
import { operatorTable } from "#processing/operators/table.ts";
import type { CompiledItem } from "#processing/program.ts";
import { element } from "#processing/test/run.ts";

/**
 * An item as the member of a test whose part submits individually and validates responses.
 *
 * @param item - The item.
 * @returns What its answers answer.
 */
export const validatingMember = (item: CompiledItem): Answered => {
  const compiled = compileTestWith(
    element("qti-assessment-test", { identifier: "validating" }, [
      element(
        "qti-test-part",
        { identifier: "p", "navigation-mode": "linear", "submission-mode": "individual" },
        [
          element("qti-item-session-control", { "validate-responses": "true" }, []),
          element("qti-assessment-item-ref", { href: "q.xml", identifier: "q" }, []),
        ],
      ),
    ]),
    { sha256: "3".repeat(64) },
    new Map([["q", item]]),
    operatorTable,
  );
  if (!compiled.ok) {
    throw new Error(compiled.refusal.detail);
  }

  return { kind: "member", ref: "q", test: compiled.value };
};
