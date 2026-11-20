/**
 * The tour every walk of crust's trees reads, held to a recursive one.
 *
 * The oracle (`stepsOf`) is the tour's definition written as recursion: an element opens, its
 * children's tours follow in order, and it closes; a leaf is one step. It is exhausted over every
 * labelled plane tree of 1 to 7 nodes. The walks that read the tour at depths and widths recursion
 * cannot reach are `scale.test.ts`'s.
 */
import { assert, describe, it } from "@effect/vitest";
import { exhaust } from "@bjornpagen/testing/explore";
import { noCoverage } from "@bjornpagen/testing/features";
import { searched } from "@bjornpagen/testing/vitest";
import { Effect, Formatter } from "effect";
import { boxHolds } from "#crust/test/box.ts";
import {
  caseHang,
  labelled,
  PLANE_TREES_TO_7,
  planeTreeUpTo,
  searchWidth,
} from "#crust/test/trees.ts";
import { preorder, tour } from "#crust/tour.ts";
import type { Step } from "#crust/tour.ts";
import type { Child } from "#crust/tree.ts";

/**
 * The oracle: a node's tour, by recursion.
 *
 * @param node - The node.
 * @returns Its steps, in document order.
 */
const stepsOf = (node: Child): readonly Step[] =>
  node.kind === "element"
    ? [
        { element: node, kind: "open" },
        ...node.children.flatMap(stepsOf),
        { element: node, kind: "close" },
      ]
    : [{ kind: "leaf", node }];

/**
 * The node a step visits: an element at its open, a leaf at its own step, none at a close.
 *
 * @param step - The step.
 * @returns The visited node, if any.
 */
const visitedAt = (step: Step): readonly Child[] => {
  if (step.kind === "open") {
    return [step.element];
  }

  return step.kind === "leaf" ? [step.node] : [];
};

/**
 * The box's generator: every plane tree of 1 to 7 nodes.
 */
const planeTrees = planeTreeUpTo(7);

describe("the tour", () => {
  it.effect(
    "is the recursive tour on every plane tree of 1 to 7 nodes, and its preorder the open and leaf steps",
    (ctx) =>
      // Oracle: the tour by recursion (`stepsOf`). Bound: every labelled plane tree of 1 to 7
      // nodes; residual: larger trees, whose walks the crust suites' differentials hold.
      Effect.andThen(
        boxHolds(planeTrees, PLANE_TREES_TO_7),
        searched(
          ctx,
          exhaust(
            {
              box: "every plane tree of 1 to 7 nodes, labelled: 197 trees",
              caseHang,
              concurrency: searchWidth,
              coverage: noCoverage,
              generator: planeTrees,
              literal: Formatter.format,
              oracle: { kind: "second-implementation", name: "the tour by recursion" },
              suite: "crust/tour/plane-trees",
            },
            ({ nodes, tree }) =>
              Effect.sync(() => {
                const root = labelled(tree);
                const steps = stepsOf(root);

                assert.deepStrictEqual([...tour(root)], steps, `a plane tree of ${nodes} nodes`);
                assert.deepStrictEqual(
                  [...preorder(root)],
                  steps.flatMap(visitedAt),
                  `a plane tree of ${nodes} nodes`,
                );
              }),
          ),
        ),
      ),
  );
});
