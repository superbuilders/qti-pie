/**
 * A base value's `base-type` under the law oracle: each of the 25 forms of
 * `#pantry/test/base-value-cases.ts`, its package judged by the oracle, breaks exactly the laws the
 * specification's verdict there names: a spelled base none, any other form its value domain alone.
 * The schema's laws over the import's rows are held to the same verdicts by
 * `#pantry/import/overlays/expressions.test.ts`.
 */
import * as NodeServices from "@effect/platform-node/NodeServices";
import { assert, layer } from "@effect/vitest";
import { Effect } from "effect";
import { grammar } from "#pantry/grammar/install.ts";
import { baseValueCases, baseValuePackageOf } from "#pantry/test/base-value-cases.ts";
import { laws } from "#pantry/test/installed-laws.ts";
import { filesOf } from "#pantry/test/oracle-complete/mutation.ts";
import { judge } from "#pantry/test/oracle.ts";

layer(NodeServices.layer, { excludeTestServices: true })(
  "a base value's base-type, by the law oracle",
  (it) => {
    it.effect(
      "accepts a base value of a spelled base and refuses one that spells none under its value domain alone",
      () =>
        // Oracle: the specification's verdict of each case (`base-value-cases.ts`), the information
        // model's BaseTypeEnum (§8.14), a preserve `xs:string` enumeration. Bound: the eleven bases
        // written exactly and fourteen forms that spell none.
        Effect.gen(function* baseValueVerdicts() {
          for (const drawn of baseValueCases) {
            const where = JSON.stringify(drawn.form);
            const judgment = yield* judge(filesOf(baseValuePackageOf(drawn)), grammar, laws);
            assert.strictEqual(judgment._tag, "Judged", where);
            assert.deepStrictEqual(
              judgment._tag === "Judged"
                ? [...new Set(judgment.breaches.map(({ law }) => law))].toSorted()
                : [],
              [...drawn.verdict],
              where,
            );
          }
        }),
    );
  },
);
