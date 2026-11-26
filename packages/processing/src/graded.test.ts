import { assert, describe, it } from "@effect/vitest";
import { mint, proofOf } from "#processing/graded.ts";
import type { GradeProof } from "#processing/graded.ts";

const proof: GradeProof = {
  prior: { kind: "none" },
  program: { sha256: "0".repeat(64) },
  readAt: { microseconds: 1n },
  responses: [{ digest: { sha256: "1".repeat(64) }, saved: { kind: "default" } }],
};

describe("Graded", () => {
  it("carries the proof it was minted with, beside its payload", () => {
    const grade = mint({ kind: "done" as const }, proof);
    assert.strictEqual(grade.kind, "done");
    assert.strictEqual(proofOf(grade), proof);
  });
});
