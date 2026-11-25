/**
 * The catalogs a redacted item keeps, held to the rule of `#plate/test/catalog-shown.ts`, written
 * apart from the redaction: a catalog reaches the page exactly when a part of the item the page is
 * given names it, under every support whose card the page draws or carries, so a catalog named only
 * by a hidden feedback block or inline, a hidden template block or choice, or another view's rubric
 * block never reaches the page, nor its card text the redacted copy a host sends one.
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
import { acceptedItem } from "#plate/validate/verdict.ts";

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
});
