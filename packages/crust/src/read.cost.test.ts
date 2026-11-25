/**
 * The reader's cost is linear in the document: reading chains at the reader's depth bound, each
 * element in a namespace, with an attribute that holds an undeclared reference and an ATTLIST
 * default to apply, takes about {@link growthFactor} times the thread CPU on 8 times the elements.
 *
 * The gate compares the thread CPU time of two reads (`growthRatio`, `#crust/test/growth.ts`),
 * which counts the time this thread ran, every step of the regex engine and of the decoder's
 * builtins among it, and not the time other processes held the CPU, so a busy machine does not
 * move it the way it moves wall-clock time. A cost per element that grows with the document, such
 * as a line and column found from the text's start at each tag, grows the time about 64 times on 8
 * times the elements.
 */
import { assert, describe, it } from "@effect/vitest";
import { Effect } from "effect";
import { readXml } from "#crust/read.ts";
import { growthFactor, growthLimit, growthRatio } from "#crust/test/growth.ts";

/**
 * The levels of each chain below the root: with the root, the 256 open elements the reader reads.
 */
const CHAIN = 255;

/**
 * The chains under the root of the smaller document the gate reads, about 10,000 elements; the
 * larger holds {@link growthFactor} times as many, about 80,000.
 */
const FEWER_CHAINS = 40;

/**
 * Write a document of `chains` chains of {@link CHAIN} elements under one root: the root declares a
 * default namespace and a prefix, and every element below it is in the prefix's namespace with an
 * `xml:lang` and an attribute holding an undeclared reference, under a DOCTYPE whose external
 * subset lets the reference stand and whose ATTLIST gives each one a default; the deepest of each
 * chain holds the reference as content.
 *
 * @param chains - The chains under the root.
 * @returns The document's bytes.
 */
const documentOf = (chains: number): Uint8Array =>
  new TextEncoder().encode(
    `<!DOCTYPE a SYSTEM "a.dtd" [<!ATTLIST p:a d CDATA "v">]><a xmlns="urn:x" xmlns:p="urn:p">${`${'<p:a xml:lang="en" r="&u;">'.repeat(CHAIN)}&u;${"</p:a>".repeat(CHAIN)}`.repeat(chains)}</a>`,
  );

/**
 * Give one read of a document, run each time it is called.
 *
 * @param bytes - The document.
 * @returns The read.
 */
const reading = (bytes: Uint8Array) => () => {
  Effect.runSync(Effect.orDie(readXml(bytes)));
};

describe("the reader's cost", () => {
  it.effect(
    "grows linearly from 10,000 to 80,000 namespaced elements, in chains at the depth bound, with references and an ATTLIST default",
    () =>
      Effect.gen(function* linearCost() {
        const fewer = documentOf(FEWER_CHAINS);
        const more = documentOf(FEWER_CHAINS * growthFactor);
        const read = yield* readXml(more);

        assert.strictEqual(read.root.children.length, FEWER_CHAINS * growthFactor);

        const growth = yield* growthRatio(reading(fewer), reading(more));

        assert.isBelow(
          growth,
          growthLimit,
          `8 times the elements took ${growth.toFixed(1)} times the thread CPU`,
        );
      }),
  );
});
