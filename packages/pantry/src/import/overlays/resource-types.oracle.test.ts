/**
 * A resource's type as an optional part (the boundary class, option B): the host reads a type code
 * exactly where the type spells a handle (`resourceTypesOf`, the query `resourceTypes`' reading,
 * which no row stores), so the typed paths (`typedPathsOf`, the query `TypedPath`'s rows) are its
 * href's, every case's href naming an entry, and their (target, type) pairs are the case's; the law
 * oracle's verdict and the laws it finds broken over each case of reading 93's box are the stated
 * ones, the import's rows, judged on the host, are refused under the same rule, or by nothing
 * where the case breaks a rule over the query, which the host leaves to the database, and a type
 * that spells nothing breaks AL1 alone; and a path two types name is the document its root bears
 * out, in either order (reading 162).
 *
 * Oracle: the specification as a checker, spec readings 67 (a resource's `type` is its version's
 * enumeration, an `xs:string` restriction whose whitespace is preserved, XSD 1.1 Part 2 §4.3.6), 93
 * (a document has one type, so one path under two document types is refused) and 162 (that type is
 * the one its root bears out), and the law oracle's verdict on each case.
 */
import { regex } from "arkregex";
import * as NodeServices from "@effect/platform-node/NodeServices";
import { assert, layer } from "@effect/vitest";
import { Array as Arr, Effect, Formatter, Option, Result } from "effect";
import { composed } from "#pantry/grammar/compose.ts";
import { resourceTypesOf, typedPathsOf } from "#pantry/import/overlays/package.ts";
import { readProgram } from "#pantry/import/program.ts";
import { readEntries } from "#pantry/package/read.ts";
import { materializeSpec, specOf } from "#pantry/test/fixtures.ts";
import { hostVerdictOf } from "#pantry/test/gen/genetic/host-laws.ts";
import { judge, lawsOf, verdictOf } from "#pantry/test/oracle.ts";
import { resourceTypeCases } from "#pantry/test/resource-type-cases.ts";
import { rulesOf } from "#pantry/import/refusal.ts";
import { nameOf } from "#pantry/test/package-name.ts";
import { manifestPath } from "#pantry/vocab/terms/package.ts";

/**
 * The composed grammar every case is judged by.
 */
const grammar = Result.getOrThrow(composed());

/**
 * The tables the laws read, derived from {@link grammar} once.
 */
const laws = lawsOf(grammar);

layer(NodeServices.layer, { excludeTestServices: true })(
  "import/overlays/package.ts, a resource's type",
  (it) => {
    for (const { broken, byQuery, edits, label, named, typed, verdict } of resourceTypeCases) {
      it.effect(
        `writes a type only where it spells a handle, and judges ${label} by reading 93`,
        () =>
          Effect.gen(function* resourceTypeCase() {
            const simple = specOf("simple");
            const dir = yield* materializeSpec({
              ...simple,
              edits: [...simple.edits, ...edits],
              name: `resource-types-${label.replaceAll(regex("[^\\da-z]+", "giu"), "-")}`,
            });
            const judgment = yield* judge(yield* readEntries(dir), grammar, laws);
            const { documents, inputs } = yield* readProgram(dir, nameOf(dir));
            const host = hostVerdictOf(inputs);

            assert.deepStrictEqual(verdictOf(judgment), verdict, Formatter.format(judgment));
            assert.sameMembers(
              judgment._tag === "Judged" ? judgment.breaches.map(({ law }) => law) : [],
              [...broken],
              "the laws broken",
            );
            assert.strictEqual(
              Arr.isReadonlyArrayNonEmpty(host.brokenLaws)
                ? Option.getOrUndefined(Arr.head(rulesOf(host.brokenLaws)))
                : undefined,
              verdict.verdict === "accepted" || byQuery ? undefined : verdict.rule,
              "the import's rows, judged on the host, refused under the same rule, or by nothing where the law they break is a rule over a query, the database's alone",
            );

            const manifest = Option.getOrThrowWith(
              Arr.findFirst(documents, ({ listed }) => listed.path === manifestPath),
              () => new Error("The import read no manifest. readProgram reads every package's."),
            );
            const types = resourceTypesOf(manifest.view);
            assert.strictEqual(types.size, typed, "a type code a typed one");

            const typedPaths = typedPathsOf(inputs, types);
            assert.strictEqual(typedPaths.length, typed, "a typed path a typed resource's href");
            assert.sameMembers(
              [...new Set(typedPaths.map(({ target, type }) => JSON.stringify([target, type])))],
              named.map((pair) => JSON.stringify(pair)),
              "the typed paths' (target, type) pairs",
            );
          }),
      );
    }
  },
);
