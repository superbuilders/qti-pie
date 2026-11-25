/**
 * The catalogs a redacted item keeps, held to the rule of `#plate/test/catalog-shown.ts`, written
 * apart from the redaction: a catalog reaches the page exactly when a part of the item the page is
 * given names it, under every support whose card the page draws or carries, so a catalog named only
 * by a hidden feedback block or inline, a hidden template block or choice, or another view's rubric
 * block never reaches the page, nor its card text the redacted copy a host sends one.
 *
 * Each kill runs the walk ({@link walkScript}) in a mutant copy of plate with its bug planted, a
 * program of its own (`runKilled` in `#plate/test/kills.ts`): a catalog kept that no part the page
 * is given names, the leak this rule closes, and a choice's reference left uncounted.
 *
 * @module
 */
import { assert, describe, it } from "@effect/vitest";
import { Effect, Option } from "effect";
import { copyItemContent } from "#plate/content/modules.ts";
import { redact } from "#plate/redact.ts";
import { admitted } from "#plate/test/admitted.ts";
import {
  shownCatalogsLocation,
  shownCatalogsXml,
  walkShownCatalogs,
} from "#plate/test/catalog-shown.ts";
import { runKilled } from "#plate/test/kills.ts";
import type { Kill } from "#plate/test/kills.ts";
import { acceptedItem } from "#plate/validate/verdict.ts";

/**
 * The kills: a catalog no part of the redacted body names kept, so a card named only by hidden
 * feedback reaches the page; and a choice's reference left out of the redacted body's, so a
 * catalog a choice the page is given names is dropped.
 */
const kills: readonly Kill[] = [
  {
    file: "src/content/catalog-info.ts",
    original: "if (references === 0) {",
    replacement: "if (references < 0) {",
    why: "a catalog no part the page is given names is kept",
  },
  {
    file: "src/redact/walk.ts",
    original: "...referencingChoicesOf(node).flatMap((choice) => Option.toArray(choice.catalog)),",
    replacement: "",
    why: "a choice the page is given names no catalog",
  },
];

/**
 * The program a kill runs in its mutant copy: it opens the item through the host's entry, walks
 * the copy's redaction and writes what it found as JSON.
 */
const walkScript = [
  'import { Effect, Option } from "effect";',
  'import { copyItemContent } from "#plate/content/modules.ts";',
  'import { redact } from "#plate/redact.ts";',
  'import { shownCatalogsLocation, shownCatalogsXml, walkShownCatalogs } from "#plate/test/catalog-shown.ts";',
  'import { openAdmitted } from "#plate/validate/admitted.ts";',
  'import { acceptedItem } from "#plate/validate/verdict.ts";',
  "const verdict = await Effect.runPromise(openAdmitted(shownCatalogsLocation, new TextEncoder().encode(shownCatalogsXml)));",
  "const accepted = Option.getOrThrow(acceptedItem(verdict));",
  "process.stdout.write(JSON.stringify({ found: Option.getOrNull(walkShownCatalogs({ accepted, copyItemContent, redact })) }));",
].join("\n");

describe("the catalogs a redacted item keeps", () => {
  it.effect(
    "are exactly those a part the page is given names, under each support and all four, with feedback and template content hidden and shown",
    () =>
      Effect.gen(function* shownCatalogs() {
        const verdict = yield* admitted(
          shownCatalogsLocation,
          new TextEncoder().encode(shownCatalogsXml),
        );
        const accepted = Option.getOrElse(acceptedItem(verdict), () =>
          assert.fail(`admitted gave ${verdict.verdict}: ${JSON.stringify(verdict)}`),
        );
        const found = walkShownCatalogs({ accepted, copyItemContent, redact });

        assert.isTrue(
          Option.isNone(found),
          Option.getOrElse(found, () => ""),
        );
      }),
  );

  for (const kill of kills) {
    it(`kills ${kill.why}`, () => {
      const run = runKilled(kill, walkScript);

      assert.strictEqual(run.status, 0, run.stderr);
      assert.notInclude(run.stdout, '"found":null', `the walk passed with ${kill.file} mutated`);
    });
  }
});
