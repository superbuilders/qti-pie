/**
 * Test support: a property checked on every member of a finite space, each
 * case printed as its source, through the testing library's exhaustion, so a pass is a proof over
 * the space and a failure is one case.
 *
 * @module
 */
import { exhaust } from "@bjornpagen/testing/explore";
import { noCoverage } from "@bjornpagen/testing/features";
import { element } from "@bjornpagen/testing/gen";
import { searched } from "@bjornpagen/testing/vitest";
import { Duration, Effect } from "effect";
import type { TestContext } from "vitest";

/**
 * What a property is checked against, and the space it covers, in words.
 */
export interface Space<A> {
  readonly box: string;
  readonly members: readonly [A, ...A[]];
  readonly oracle: string;
  readonly suite: string;
}

/**
 * A property checked on every member of a space.
 *
 * @param ctx - The test's context.
 * @param space - The space.
 * @param property - The property, asserting on one member.
 * @returns The search.
 */
export const everyMember = <A>(
  ctx: TestContext,
  space: Space<A>,
  property: (member: A) => void,
): Effect.Effect<void, unknown> =>
  Effect.asVoid(
    searched(
      ctx,
      exhaust(
        {
          box: space.box,
          caseHang: Duration.seconds(30),
          coverage: noCoverage,
          generator: element(space.members),
          literal: (member) => JSON.stringify(member),
          oracle: { kind: "specification", name: space.oracle },
          suite: space.suite,
        },
        (member: A) =>
          Effect.sync(() => {
            property(member);
          }),
      ),
    ),
  );
