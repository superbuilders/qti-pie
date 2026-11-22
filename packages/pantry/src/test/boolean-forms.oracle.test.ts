/**
 * An `xs:boolean` attribute written `1` or `0`, judged by the law oracle and by the schema's own
 * laws over the import's rows (`#pantry/test/host-judge.ts`). XML Schema 1.1 Part 2, §3.3.2.2:
 * boolean's lexical space is `true`, `false`, `1` and `0`, so `time-dependent="1"` is the item that
 * `time-dependent="true"` is, and `"0"` the one `"false"` is.
 *
 * Oracle: the specification as a checker, §3.3.2.2's four literals, against both judges: each form
 * of each boolean attribute below must give the verdict its `true`/`false` spelling gives. Bound:
 * an item's `time-dependent` and `adaptive`, and a bank's root's `visible` and `keep-together`,
 * each in four forms; the booleans of a test's selection, ordering and item refs stand in no
 * package pantry admits (spec reading 228).
 */
import { NodeServices } from "@effect/platform-node";
import { assert, layer } from "@effect/vitest";
import { Array as Arr, Effect, Formatter, Option } from "effect";
import { readProgram } from "#pantry/import/program.ts";
import { readEntries } from "#pantry/package/read.ts";
import { Qti } from "#pantry/qti/schema.ts";
import { scopedPackage } from "#pantry/test/gen/every-relation.ts";
import { previewRowsOf, judge, judgedLaws } from "#pantry/test/host-judge.ts";
import { oracleVerdict } from "#pantry/test/oracle-verdict.ts";
import { asi, base, edit, item, itemResource, manifestOf, packageOf } from "#pantry/test/probe.ts";
import { rulesOf } from "#pantry/import/refusal.ts";
import { nameOf } from "#pantry/test/package-name.ts";

const laws = judgedLaws(Qti);

/**
 * The item package with its root's `time-dependent` and `adaptive` written as one form.
 *
 * @param attribute - The attribute.
 * @param form - The form it is written as.
 * @returns The package's files by path.
 */
const itemWith = (attribute: "adaptive" | "time-dependent", form: string) => ({
  ...base,
  "item.xml":
    attribute === "time-dependent"
      ? edit(item, 'time-dependent="false"', `time-dependent="${form}"`)
      : edit(item, 'time-dependent="false"', `adaptive="${form}" time-dependent="false"`),
});

/**
 * A bank of the base item, a standalone section document (spec reading 228): its root section and
 * one item ref under the item's own identifier.
 */
const bank = `<qti-assessment-section xmlns="${asi}" identifier="B" title="Bank" visible="true">
  <qti-assessment-item-ref identifier="item" href="item.xml"/>
</qti-assessment-section>`;

/**
 * The bank package, over the base item, with one passage of the base bank replaced.
 *
 * @param passage - The passage of the base bank.
 * @param replacement - What replaces it.
 * @returns The package's files by path.
 */
const bankWith = (passage: string, replacement: string) => ({
  "bank.xml": edit(bank, passage, replacement),
  "imsmanifest.xml": manifestOf(
    `${itemResource}<resource identifier="B" type="imsqti_section_xmlv3p0" href="bank.xml"><file href="bank.xml"/></resource>`,
  ),
  "item.xml": item,
});

/**
 * The boolean attributes, each with the package that writes it as a form.
 */
const attributes: readonly (readonly [
  string,
  (form: string) => Readonly<Record<string, string>>,
])[] = [
  ["time-dependent", (form) => itemWith("time-dependent", form)],
  ["adaptive", (form) => itemWith("adaptive", form)],
  ["visible", (form) => bankWith('visible="true"', `visible="${form}"`)],
  ["keep-together", (form) => bankWith('visible="true"', `visible="true" keep-together="${form}"`)],
];

/**
 * The four literals of `xs:boolean`, each with its value.
 */
const forms = ["true", "false", "1", "0"] as const;

layer(NodeServices.layer, { excludeTestServices: true })("xs:boolean written 1 or 0", (it) => {
  it.effect("is accepted by both judges wherever true and false are", () =>
    Effect.gen(function* everyCase() {
      for (const [name, packageFor] of attributes) {
        for (const form of forms) {
          const files = packageFor(form);
          const verdict = yield* oracleVerdict(packageOf(files));
          assert.strictEqual(verdict.kind, "accepted", `${name}="${form}": the oracle`);

          const rule = yield* Effect.scoped(
            Effect.gen(function* oneCase() {
              const entries = new Map(
                Object.entries(files).map(
                  ([path, text]) => [path, new TextEncoder().encode(text)] as const,
                ),
              );
              const dir = yield* scopedPackage(entries);
              yield* readEntries(dir);

              const program = yield* readProgram(dir, nameOf(dir));
              const { broken } = judge(previewRowsOf(program.inputs), laws);
              const [first, ...rest] = broken.map(({ law }) => law);

              return first === undefined
                ? "accepted"
                : `${Option.getOrElse(Arr.head(rulesOf([first, ...rest])), () => "unnamed")}: ${Formatter.format(broken.map(({ law }) => law))}`;
            }),
          );
          assert.strictEqual(rule, "accepted", `${name}="${form}": the import's rows`);
        }
      }
    }),
  );
});
