/**
 * A MathML formula's direction starts at its `m:math` (spec reading 164): `ltr` unless the `math`
 * element writes `rtl`, whatever an HTML ancestor's `dir` says. The law oracle
 * (`#pantry/test/oracle.ts` `inheritedDirectionOf`) gives the alignment cases below their verdicts.
 * "MathML align placement" reads a scope row's node's kind, so it is a rule over a query
 * (`#pantry/qti/overlay-queries/expression.ts`), which the host leaves to the database: the
 * schema's own laws over the import's rows (the builder's `reading.owns`,
 * `#pantry/import/overlays/mathml-align.ts`) accept every case, and break no other law.
 */
import { NodeServices } from "@effect/platform-node";
import { assert, layer } from "@effect/vitest";
import { Array as Arr, Effect, Option } from "effect";
import { readProgram } from "#pantry/import/program.ts";
import { readEntries } from "#pantry/package/read.ts";
import { Qti } from "#pantry/qti/schema.ts";
import { scopedPackage } from "#pantry/test/gen/every-relation.ts";
import { previewRowsOf, judge, judgedLaws } from "#pantry/test/host-judge.ts";
import { oracleVerdict } from "#pantry/test/oracle-verdict.ts";
import { base, edit, item } from "#pantry/test/probe.ts";
import { rulesOf } from "#pantry/import/refusal.ts";
import { nameOf } from "#pantry/test/package-name.ts";

const laws = judgedLaws(Qti);

/**
 * The base item with a formula in its body: an HTML wrapper writing `wrapper` (none for no
 * wrapper), then an `m:math` writing `math`, and one cell holding an `mrow` that writes `row`
 * around an `maligngroup`.
 */
const packageOf = (wrapper: string, math: string, row: string) => {
  const formula = `<m:math${math}><m:mtable><m:mtr><m:mtd><m:mrow${row}><m:maligngroup/><m:mi>a</m:mi></m:mrow></m:mtd></m:mtr></m:mtable></m:math>`;
  const body = wrapper === "" ? formula : `<div${wrapper}>${formula}</div>`;
  const namespaced = edit(
    item,
    "<qti-assessment-item ",
    `<qti-assessment-item xmlns:m="http://www.w3.org/1998/Math/MathML" `,
  );

  return {
    ...base,
    "item.xml": edit(
      namespaced,
      `<p id="intro">Pick one.</p>`,
      `<p id="intro">Pick one.</p>${body}`,
    ),
  };
};

/**
 * The audit's cases: each with the verdict the oracle and the database give it, and the rule the
 * import's rows break on the host, `accepted` for every case but one whose `dir` another law the
 * host judges refuses.
 */
const cases: readonly {
  readonly name: string;
  readonly files: ReturnType<typeof packageOf>;
  readonly accepted: boolean;
  readonly host: "accepted" | "attribute-lexical";
}[] = [
  {
    accepted: true,
    files: packageOf(' dir="rtl"', "", ' dir="ltr"'),
    host: "accepted",
    name: "alignDirRtlHtml",
  },
  {
    accepted: true,
    files: packageOf(' dir="auto"', "", ' dir="ltr"'),
    host: "accepted",
    name: "alignDirAutoHtml",
  },
  {
    accepted: false,
    files: packageOf("", ' dir="rtl"', ' dir="ltr"'),
    host: "accepted",
    name: "alignMathDirRtl",
  },
  {
    // The HTML `rtl` is not read, so the `mrow` changes the formula's `ltr` to `rtl` and its group
    // leaves its cell: refused by the oracle and the database. The audit's case was accepted only because the
    // HTML `rtl` passed through.
    accepted: false,
    files: packageOf(' dir="rtl"', "", ' dir="rtl"'),
    host: "accepted",
    name: "alignDirRtlHtmlRtl",
  },
  {
    accepted: true,
    files: packageOf("", ' dir="rtl"', ' dir="rtl"'),
    host: "accepted",
    name: "alignMathDirRtlRowRtl",
  },
  {
    accepted: false,
    files: packageOf(' dir="rtl"', ' dir="auto"', ' dir="ltr"'),
    host: "attribute-lexical",
    name: "alignDirAutoInsideRtlMath",
  },
];

layer(NodeServices.layer, { excludeTestServices: true })("a formula's direction", (it) => {
  it.effect("starts at its m:math, in the law oracle and the import's rows alike", () =>
    Effect.gen(function* run() {
      for (const { accepted, files, host, name } of cases) {
        const verdict = yield* Effect.scoped(
          Effect.gen(function* oneCase() {
            const dir = yield* scopedPackage(
              new Map(
                Object.entries(files).map(([path, text]) => [path, new TextEncoder().encode(text)]),
              ),
            );
            const oracle = yield* oracleVerdict(yield* readEntries(dir));
            const program = yield* readProgram(dir, nameOf(dir));
            const { broken } = judge(previewRowsOf(program.inputs), laws);
            const [first, ...rest] = broken.map(({ law }) => law);

            return {
              host:
                first === undefined
                  ? "accepted"
                  : Option.getOrElse(Arr.head(rulesOf([first, ...rest])), () => "unnamed"),
              oracle: oracle.kind === "accepted" ? new Set(["accepted"]) : oracle.rules,
            };
          }),
        );
        assert.strictEqual(verdict.host, host, `${name}: the import's rows`);
        assert.strictEqual(verdict.oracle.has("accepted"), accepted, `${name}: the law oracle`);
      }
    }),
  );
});
