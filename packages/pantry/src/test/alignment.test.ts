/**
 * The spec-alignment census as a test (slice A12): every XSD rule and spec reading, by family and
 * status, against the composed grammar.
 *
 * Oracle: the specification turned into a checker. The XSD rules are the content-model and
 * attribute IR the deriver writes from the 23 pinned XSDs (its own tests check a re-run
 * reproduces it byte for byte from the cache), and the readings are `docs/spec-readings.md`'s;
 * `census` (`#pantry/test/alignment.ts`) joins each to the relation that owns it.
 *
 * The contract, Bjorn's completion criterion for exact alignment:
 *
 * - No rule is contradicted (`X`): a rule the grammar breaks is either aligned or recorded as a spec
 *   reading (`reading`) or a ruled gap (`R`: reading `mathml-validity`'s recorded MathML limits and
 *   reading `unchecked-xsi-type`), never left;
 * - The census holds every spec reading the readings file states, by its slug, and no other; the file
 *   names each reading once, by a slug no other reading bears, numbers its readings by position
 *   alone, from 1 in order, and holds no list item that is not a reading's;
 * - The unowned count (`U`, XSD-invalid content accepted with no owner) is a ratchet: the goal is
 *   zero, and the number recorded here only goes down, recorded anew each time it moves.
 *
 * It reads no cache: the IR is committed, and its fidelity to the pinned XSDs is the deriver's
 * cache-gated tests'. It writes `work/alignment/rules.tsv`, every rule with its status and owner.
 */
import { regex } from "arkregex";
import path from "node:path";
import * as NodeServices from "@effect/platform-node/NodeServices";
import { codePointOrder } from "@qti-pie/crust/charset.ts";
import { assert, describe, layer } from "@effect/vitest";
import { Console, Effect, FileSystem } from "effect";
import { census, countsOf, readings, statuses } from "#pantry/test/alignment.ts";
import type { Rule } from "#pantry/test/alignment.ts";
import { grammar } from "#pantry/grammar/install.ts";
import { liveRegister } from "#pantry/test/live-readings.ts";

/**
 * The folder this test writes to, `packages/pantry/work/alignment`.
 */
const outputRoot = path.resolve(import.meta.dirname, "..", "..", "work", "alignment");

/**
 * The unowned count of the census, a ratchet: the goal is zero. A change that lowers it records the
 * new count here; a change that raises it names an owner for each new rule instead.
 *
 * Taken on 2026-11-05 on the shared tree, after the attribute grammar's cutover and the unowned
 * readings' laws (`mathml-validity`, `ssml-document-is-fragment`, `schematron-intent`,
 * `ssml-speak-version`, `ssml-meta-name`, `ssml-voice-languages`, `ssml-voice-prosody-attributes`
 * and `xsi-attributes`): every XSD rule and every spec reading is owned.
 */
const unownedCeiling = 0;

/**
 * Write a rule as one line.
 *
 * @param rule - The rule.
 * @returns Its family, parent, subject and what the grammar states.
 */
const ruleLine = (rule: Rule): string =>
  `${rule.family} ${rule.parent} ${rule.subject}: ${rule.detail}`;

describe("alignment.test.ts, the census", () => {
  layer(NodeServices.layer, { excludeTestServices: true })("every XSD rule and reading", (it) => {
    it.effect("no rule is contradicted, every reading is held, and the unowned count holds", () =>
      Effect.gen(function* takeCensus() {
        const fs = yield* FileSystem.FileSystem;
        const rules = census(grammar);
        const counts = countsOf(rules);
        const register = yield* liveRegister();
        const slugs = register.readings.map(({ slug }) => slug);

        yield* fs.makeDirectory(outputRoot, { recursive: true });
        yield* fs.writeFileString(
          `${outputRoot}/rules.tsv`,
          [
            "family\tparent\tsubject\tstatus\towner\tdetail",
            ...rules.map((rule) =>
              [rule.family, rule.parent, rule.subject, rule.status, rule.owner, rule.detail]
                .map((field) => field.replaceAll(regex("[\t\r\n]+", "gu"), " "))
                .join("\t"),
            ),
          ]
            .map((line) => `${line}\n`)
            .join(""),
        );
        yield* Console.log(
          [
            `alignment: ${String(counts.total)} rules; unowned ${String(counts.unowned)} (ceiling ${String(unownedCeiling)})`,
            ...Object.entries(counts.byFamily).map(
              ([family, held]) =>
                `  ${family}: ${statuses
                  .flatMap((status) =>
                    held[status] === undefined ? [] : [`${status} ${String(held[status])}`],
                  )
                  .join(", ")}`,
            ),
          ].join("\n"),
        );

        assert.deepStrictEqual(
          rules.filter(({ status }) => status === "X").map(ruleLine),
          [],
          "no rule is contradicted without a recorded reading or a ruled gap",
        );
        assert.deepStrictEqual(
          register.malformed,
          [],
          "every list item of docs/spec-readings.md is a reading: its position, its slug in brackets, its headline",
        );
        assert.deepStrictEqual(
          slugs.filter((slug, at) => slugs.indexOf(slug) !== at),
          [],
          "no two readings of docs/spec-readings.md share a slug",
        );
        assert.deepStrictEqual(
          register.readings.map(({ position }) => position),
          slugs.map((_, at) => at + 1),
          "docs/spec-readings.md numbers its readings by position alone, from 1 in order",
        );
        assert.deepStrictEqual(
          [...readings.keys()].toSorted(codePointOrder),
          slugs.toSorted(codePointOrder),
          "the census holds exactly the readings docs/spec-readings.md states, by slug",
        );
        assert.isAtMost(counts.unowned, unownedCeiling, "the unowned count only goes down");
        assert.strictEqual(
          counts.unowned,
          unownedCeiling,
          "the unowned count moved down: record the new count as the ceiling",
        );
      }),
    );
  });
});
