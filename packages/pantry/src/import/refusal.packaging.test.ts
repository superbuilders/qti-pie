import { NodeServices } from "@effect/platform-node";
import { assert, layer } from "@effect/vitest";
import { Effect, Layer } from "effect";
import { describe } from "vitest";
import { AuthorAppLayer } from "#pantry/db/layer.ts";
import { memoryMediaStore } from "#pantry/package/media.ts";
import { importDir } from "#pantry/test/import-dir.ts";
import { materialize } from "#pantry/test/fixtures.ts";
import type { FixtureName } from "#pantry/test/fixtures.ts";
import { hasLease } from "#pantry/test/settings.ts";
import type { Rule } from "#pantry/import/rules.ts";
import { ImportRefused } from "#pantry/import/rules.ts";
import { fileDatabaseOf } from "#pantry/test/writing-files.ts";

/**
 * The packaging fixtures of the retired guards, each with the rules its refusal may name: the
 * rules of every law the law oracle (`src/test/oracle.ts` `judge`) finds broken in it, judged on
 * 2026-11-06 over the composed grammar, so a refusal's rules meet the rules the oracle predicts.
 *
 * A fixture that breaks several laws lists each one's rule, since PostgreSQL reports whichever
 * constraint it checks first: `extmeta-item-href` breaks `Href listed`, `LomObjectIdentifier`,
 * `LomObjectTitle`, `Document lang` and, since its item and its record name one file under two
 * types, `Document entry`; the file's `lom:lom` root is a record's, so the file is read as the
 * record's document and `RootOfType` holds (spec reading 162; judged again on 2026-11-07). A second
 * `GUID` (`csm-two-guids`) or a second set (`csm-two-sets`) breaks its particle's at-most-once,
 * which the content automaton holds (`N5 Follow`), so its rule is `ordering`.
 *
 * One fixture per rule stays, 7 of the 26: the other 15 named a rule one of these already names,
 * the four of a `cpx:variant` hold an element QTI 3.0.1's content packaging forbids
 * (`imsqtiv3p0p1_imscpv1p2_v1p0.xsd` line 344, `maxOccurs="0"`), so the content model refuses
 * each under `admission` before its own law reads it, and `package.packaging.test.ts` draws every
 * packaging fixture against the law oracle.
 *
 * The guards' other fixtures break no law the cutover states: the LOM and CSM capacities, which
 * the deleted unsourced caps held, and the guards' departures from the XSD (plan §2.2). The
 * importer accepts them, and Q5.15's packaging test holds that.
 */
const refused = [
  ["csm-no-guid", ["child-set"]],
  ["csm-two-guids", ["ordering"]],
  [
    "extmeta-item-href",
    ["href-listed", "lom-identifier", "lom-title", "document-lang", "entry-kind"],
  ],
  ["extmeta-item-root", ["root-type-reverse"]],
  ["lti-basic", ["attribute-lexical"]],
  ["outcome-title", ["attribute-admission"]],
  ["usage3-ordinary-mapping", ["unmodeled-vocabulary"]],
] as const satisfies readonly (readonly [FixtureName, readonly Rule[]])[];

describe.skipIf(!hasLease)("import/refusal.packaging.test.ts, on the lease", () => {
  layer(
    Layer.mergeAll(AuthorAppLayer, NodeServices.layer, memoryMediaStore).pipe(
      Layer.provideMerge(fileDatabaseOf("refusals")),
    ),
    {
      excludeTestServices: true,
      timeout: "120 seconds",
    },
  )("the retired guards' packaging fixtures, refused under the rules their laws keep", (it) => {
    for (const [name, rules] of refused) {
      it.effect(`refuses ${name} under rules that meet ${rules.join(", ")}`, () =>
        Effect.gen(function* refusesFixture() {
          const failure = yield* Effect.flip(importDir(yield* materialize(name)));

          assert.instanceOf(failure, ImportRefused, `${name}: refused by another error`);

          if (failure instanceof ImportRefused) {
            yield* Effect.log(`${name} refused under ${failure.rules.join(", ")}`, failure.detail);

            const expected: readonly string[] = rules;

            assert.isTrue(
              failure.rules.some((rule) => expected.includes(rule)),
              `${name}: the refusal names ${failure.rules.join(", ")}, none of ${rules.join(", ")}`,
            );
          }
        }),
      );
    }
  });
});
