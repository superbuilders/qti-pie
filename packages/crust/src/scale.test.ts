import { assert, describe, it } from "@effect/vitest";
import { Effect, Option, Result } from "effect";
import { canonicalize } from "#crust/canonical.ts";
import { encode } from "#crust/encode.ts";
import { readXml } from "#crust/read.ts";
import { bare } from "#crust/test/trees.ts";
import type { Child, Element } from "#crust/tree.ts";
import { writeXml } from "#crust/write.ts";

/**
 * The depth of the deep trees the writers write and the width of the wide one: 100,000 elements on
 * one path, and 100,000 children under one parent. A recursive walk overflows Node's default stack
 * within a few thousand levels, so these bounds sit two orders of magnitude past it. The reader
 * refuses a document past 256 open elements, so it reads the wide tree, and chains at that bound.
 */
const DEPTH = 100_000;

const WIDTH = 100_000;

/**
 * An element `qname` in no namespace with no attributes, holding `children`.
 *
 * @param qname - The element's name.
 * @param children - Its children.
 * @returns The element.
 */
const element = (qname: string, children: readonly Child[]): Element => ({
  attributes: [],
  children,
  kind: "element",
  local: qname,
  namespace: "",
  prefix: "",
  qname,
});

/**
 * A chain of `depth` elements `a`, each the only child of the one above, with `bottom` as the
 * deepest one's children, built from the bottom up.
 *
 * @param depth - The number of elements.
 * @param bottom - The deepest element's children.
 * @returns The top of the chain.
 */
const chain = (depth: number, bottom: readonly Child[]): Element => {
  let top = element("a", bottom);
  for (let level = 1; level < depth; level += 1) {
    top = element("a", [top]);
  }

  return top;
};

/**
 * The index of the first character at which `left` and `right` differ, or -1 when they are equal,
 * so a mismatch in a megabyte of output reports where it is rather than the whole text.
 *
 * @param left - One text.
 * @param right - The other.
 * @returns The first differing index, or -1.
 */
const firstDifference = (left: string, right: string): number => {
  const shared = Math.min(left.length, right.length);
  for (let index = 0; index < shared; index += 1) {
    if (left[index] !== right[index]) {
      return index;
    }
  }

  return left.length === right.length ? -1 : shared;
};

/**
 * The text of UTF-8 bytes.
 *
 * @param bytes - The bytes.
 * @returns Their text.
 */
const text = (bytes: Uint8Array): string => new TextDecoder("utf-8", { fatal: true }).decode(bytes);

describe(`every walk is iterative: depth ${DEPTH} and width ${WIDTH}`, () => {
  it.effect(
    `encode, writeXml and canonicalize write a chain ${DEPTH} deep in their documented forms`,
    () =>
      Effect.gen(function* deepChain() {
        const doc = bare(chain(DEPTH, []));
        const written = `${"<a>".repeat(DEPTH - 1)}<a/>${"</a>".repeat(DEPTH - 1)}`;
        const bytes = yield* encode(doc, "UTF-8");

        assert.strictEqual(firstDifference(text(bytes), written), -1);
        assert.strictEqual(firstDifference(yield* writeXml(doc, Option.some(0x7f)), written), -1);
        assert.strictEqual(
          firstDifference(
            text(Result.getOrThrow(canonicalize(doc))),
            `${"<a>".repeat(DEPTH)}${"</a>".repeat(DEPTH)}`,
          ),
          -1,
        );
      }),
  );

  it.effect(
    `encode, writeXml and canonicalize write ${WIDTH} children of one parent in their documented forms, and readXml reads them back to the same bytes`,
    () =>
      Effect.gen(function* wideParent() {
        const doc = bare(
          element(
            "r",
            Array.from({ length: WIDTH }, () => element("a", [])),
          ),
        );
        const written = `<r>${"<a/>".repeat(WIDTH)}</r>`;
        const bytes = yield* encode(doc, "UTF-8");

        assert.strictEqual(firstDifference(text(bytes), written), -1);
        assert.strictEqual(firstDifference(yield* writeXml(doc, Option.some(0x7f)), written), -1);
        assert.strictEqual(
          firstDifference(
            text(Result.getOrThrow(canonicalize(doc))),
            `<r>${"<a></a>".repeat(WIDTH)}</r>`,
          ),
          -1,
        );

        const read = yield* readXml(bytes);

        assert.strictEqual(read.root.children.length, WIDTH);
        assert.strictEqual(firstDifference(text(yield* encode(read, "UTF-8")), written), -1);
      }),
  );

  it.effect(
    `encode finds an unwritable construct at the bottom of a chain ${DEPTH} deep and at the end of ${WIDTH} children`,
    () =>
      Effect.gen(function* deepFailure() {
        const unwritable: Child = { kind: "comment", text: "é" };
        const failure = { codePoint: 0xe9, threshold: 0x7f, where: "comment" };
        // Every character of these trees is one XML allows, so the writer's WriteRefusal would be
        // a defect.
        const deep = yield* Effect.flip(
          encode(bare(chain(DEPTH, [unwritable])), "US-ASCII").pipe(
            Effect.catchTag("WriteRefusal", Effect.die),
          ),
        );
        const wide = yield* Effect.flip(
          encode(
            bare(
              element("r", [...Array.from({ length: WIDTH }, () => element("a", [])), unwritable]),
            ),
            "US-ASCII",
          ).pipe(Effect.catchTag("WriteRefusal", Effect.die)),
        );

        assert.deepStrictEqual(
          { codePoint: deep.codePoint, threshold: deep.threshold, where: deep.where },
          failure,
        );
        assert.deepStrictEqual(
          { codePoint: wide.codePoint, threshold: wide.threshold, where: wide.where },
          failure,
        );
      }),
  );
});
