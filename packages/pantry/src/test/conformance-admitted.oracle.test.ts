/**
 * Valid QTI 3.0.1 the laws once refused, admitted, beside an invalid control for each, judged by
 * the law oracle and by the schema's laws over the import's rows (lane PANTRY-CONFORM's
 * WP-GRAMMAR, 2026-11-20). Each case is the base item with one edit:
 *
 * - SV-LAW-01: a `qti-value` of a single variable that writes a `base-type` or a `field-identifier`,
 *   each "only used for" a value "that forms part of a record" (information model §7.46.1,
 *   §7.46.2), which names and types nothing there; the control, a record's field that writes no
 *   `base-type`, breaks Value cardinality (§8.16, record: "a set of independent values each
 *   identified by its own identifier and having its own base-type");
 * - SV-LAW-03: `qti-index`'s `n`, an `IntOrIdentifier` (§9.3.2), naming a context variable and the
 *   built-in `numAttempts`, single integers of no template or outcome kind; the control, a float
 *   outcome, breaks Reference type ("'n' must be a positive integer", §5.72);
 * - SV-LAW-05: a `qti-custom-interaction` with an attribute in another namespace, its `extension`
 *   characteristic, a `NamespaceLax` (§5.36.1); the control, an undeclared attribute in no
 *   namespace, the codec refuses (spec reading 90);
 * - SV-READ-03: a `variable-identifier-ref`, an `xs:IDREF` (the XSD's `UniqueIdentifierRefDType`,
 *   §4.5.11), naming the item's `id`; the control, one naming none, breaks Idref target;
 * - SV-READ-04: a boolean value written `1` and `0`, `xs:boolean`'s lexical space (§8.14); the
 *   control, `2`, breaks Typed value.
 */
import { NodeServices } from "@effect/platform-node";
import { assert, layer } from "@effect/vitest";
import { exhaust } from "@bjornpagen/testing/explore";
import { requiredInSpace } from "@bjornpagen/testing/features";
import { element } from "@bjornpagen/testing/gen";
import { searched } from "@bjornpagen/testing/vitest";
import { Duration, Effect } from "effect";
import { grammar } from "#pantry/grammar/install.ts";
import { readProgram } from "#pantry/import/program.ts";
import { readEntries } from "#pantry/package/read.ts";
import { Qti } from "#pantry/qti/schema.ts";
import { scopedPackage } from "#pantry/test/gen/every-relation.ts";
import { declarationQueryLawsOf } from "#pantry/test/declaration-queries.ts";
import { judge, judgedLaws, previewRowsOf } from "#pantry/test/host-judge.ts";
import { lawNamesOf } from "#pantry/test/host-law-names.ts";
import { judge as judgeOracle, lawsOf } from "#pantry/test/oracle.ts";
import { nameOf } from "#pantry/test/package-name.ts";
import { edit, item, itemResource, manifestOf } from "#pantry/test/probe.ts";
import { searchTimeout } from "#pantry/test/settings.ts";

/**
 * What a case's package meets: the laws it breaks, none for an admitted one, and of them the ones
 * the host judges (`unjudged`, those it does not: a rule over a query outside the declaration
 * overlays' restatements, which the host leaves unjudged); or the codec's refusal under a rule,
 * which no row reaches.
 */
type Verdict =
  | {
      readonly kind: "breaks";
      readonly laws: readonly string[];
      readonly unjudged?: readonly string[];
    }
  | { readonly kind: "codec"; readonly rule: string };

/**
 * One case: the edits it makes to the base item, each a passage and its replacement, in order, and
 * its verdict by the specification.
 */
interface Case {
  readonly edits: readonly (readonly [passage: string, replacement: string])[];
  readonly verdict: Verdict;
}

/**
 * The base item's score declaration, where a case adds declarations after it.
 */
const score = `<qti-outcome-declaration identifier="SCORE" cardinality="single" base-type="float"/>`;

/**
 * The base item's response declaration, where a case adds a context declaration before it.
 */
const response = `<qti-response-declaration identifier="RESPONSE" cardinality="single" base-type="identifier">`;

/**
 * The end of the base item's response processing's one condition, where a case adds a rule.
 */
const conditionEnd = "</qti-response-condition>";

/**
 * The base item's choice interaction, whole.
 */
const choice = `<qti-choice-interaction response-identifier="RESPONSE" max-choices="1">
      <qti-simple-choice identifier="A">A</qti-simple-choice>
      <qti-simple-choice identifier="B">B</qti-simple-choice>
    </qti-choice-interaction>`;

/**
 * A rule setting an integer outcome `IDX` to the first value of a container, indexed by `n`.
 *
 * @param n - The index's `n`, as written.
 * @returns The rule, after the condition.
 */
const indexing = (n: string): readonly [string, string] => [
  conditionEnd,
  `${conditionEnd}<qti-set-outcome-value identifier="IDX"><qti-index n="${n}"><qti-ordered><qti-base-value base-type="integer">5</qti-base-value></qti-ordered></qti-index></qti-set-outcome-value>`,
];

/**
 * The integer outcome {@link indexing} sets, and the integer context variable `CTX`.
 */
const indexed: readonly (readonly [string, string])[] = [
  [
    score,
    `${score}<qti-outcome-declaration identifier="IDX" cardinality="single" base-type="integer"/>`,
  ],
  [
    response,
    `<qti-context-declaration identifier="CTX" cardinality="single" base-type="integer"/>${response}`,
  ],
];

/**
 * A boolean outcome whose default value is written as `text`.
 *
 * @param text - The value's text.
 * @returns The edit.
 */
const flagged = (text: string): readonly [string, string] => [
  score,
  `${score}<qti-outcome-declaration identifier="FLAG" cardinality="single" base-type="boolean"><qti-default-value><qti-value>${text}</qti-value></qti-default-value></qti-outcome-declaration>`,
];

/**
 * Every case's name.
 */
const caseNames = [
  "SV-LAW-01 a base-type on a single value",
  "SV-LAW-01 a field-identifier on a single value",
  "SV-LAW-01 control: a record's field with no base-type",
  "SV-LAW-03 an index naming a context variable",
  "SV-LAW-03 an index naming numAttempts",
  "SV-LAW-03 control: an index naming a float outcome",
  "SV-LAW-05 a custom interaction's attribute in another namespace",
  "SV-LAW-05 control: a custom interaction's undeclared attribute in no namespace",
  "SV-READ-03 a variable-identifier-ref naming an id",
  "SV-READ-03 control: a dangling variable-identifier-ref",
  "SV-READ-04 a boolean written 1",
  "SV-READ-04 a boolean written 0, padded",
  "SV-READ-04 control: a boolean written 2",
] as const;

/**
 * A case's name.
 */
type CaseName = (typeof caseNames)[number];

/**
 * The cases, each held to the specification by hand (the module's header).
 */
const cases = {
  "SV-LAW-01 a base-type on a single value": {
    edits: [["<qti-value>A</qti-value>", `<qti-value base-type="identifier">A</qti-value>`]],
    verdict: { kind: "breaks", laws: [] },
  },
  "SV-LAW-01 a field-identifier on a single value": {
    edits: [["<qti-value>A</qti-value>", `<qti-value field-identifier="f">A</qti-value>`]],
    verdict: { kind: "breaks", laws: [] },
  },
  "SV-LAW-01 control: a record's field with no base-type": {
    edits: [
      [
        score,
        `${score}<qti-outcome-declaration identifier="TALLY" cardinality="record"><qti-default-value><qti-value field-identifier="count">1</qti-value></qti-default-value></qti-outcome-declaration>`,
      ],
    ],
    verdict: { kind: "breaks", laws: ["Value cardinality"] },
  },
  "SV-LAW-03 an index naming a context variable": {
    edits: [...indexed, indexing("CTX")],
    verdict: { kind: "breaks", laws: [] },
  },
  "SV-LAW-03 an index naming numAttempts": {
    edits: [...indexed, indexing("numAttempts")],
    verdict: { kind: "breaks", laws: [] },
  },
  "SV-LAW-03 control: an index naming a float outcome": {
    edits: [...indexed, indexing("SCORE")],
    verdict: { kind: "breaks", laws: ["Reference type"], unjudged: ["Reference type"] },
  },
  "SV-LAW-05 a custom interaction's attribute in another namespace": {
    edits: [
      [
        choice,
        `<qti-custom-interaction xmlns:f="urn:x" response-identifier="RESPONSE" f:config="on"/>`,
      ],
    ],
    verdict: { kind: "breaks", laws: [] },
  },
  "SV-LAW-05 control: a custom interaction's undeclared attribute in no namespace": {
    edits: [[choice, `<qti-custom-interaction response-identifier="RESPONSE" config="on"/>`]],
    verdict: { kind: "codec", rule: "attribute-admission" },
  },
  "SV-READ-03 a variable-identifier-ref naming an id": {
    edits: [
      [
        score,
        `<qti-outcome-declaration identifier="SCORE" cardinality="single" base-type="float" variable-identifier-ref="intro"/>`,
      ],
    ],
    verdict: { kind: "breaks", laws: [] },
  },
  "SV-READ-03 control: a dangling variable-identifier-ref": {
    edits: [
      [
        score,
        `<qti-outcome-declaration identifier="SCORE" cardinality="single" base-type="float" variable-identifier-ref="nowhere"/>`,
      ],
    ],
    verdict: { kind: "breaks", laws: ["Idref target"], unjudged: ["Idref target"] },
  },
  "SV-READ-04 a boolean written 0, padded": {
    edits: [flagged(" 0 ")],
    verdict: { kind: "breaks", laws: [] },
  },
  "SV-READ-04 a boolean written 1": {
    edits: [flagged("1")],
    verdict: { kind: "breaks", laws: [] },
  },
  "SV-READ-04 control: a boolean written 2": {
    edits: [flagged("2")],
    verdict: { kind: "breaks", laws: ["Typed value"] },
  },
} satisfies { readonly [N in CaseName]: Case };

/**
 * Write a case's package: the base manifest and the base item with the case's edits.
 *
 * @param name - The case.
 * @returns The package's entries.
 */
const packageOf = (name: CaseName): ReadonlyMap<string, Uint8Array> => {
  const { edits }: Case = cases[name];
  let text = item;
  for (const [passage, replacement] of edits) {
    text = edit(text, passage, replacement);
  }

  const encoder = new TextEncoder();

  return new Map([
    ["imsmanifest.xml", encoder.encode(manifestOf(itemResource))],
    ["item.xml", encoder.encode(text)],
  ]);
};

layer(NodeServices.layer, { excludeTestServices: true })(
  "valid QTI the laws once refused, admitted",
  (test) => {
    test.effect(
      "admits each, by the law oracle and by the schema's laws over the import's rows, and refuses each control under its own law",
      (ctx) =>
        // Oracle: two implementations side by side, the law oracle and the schema's laws over the
        // import's rows (`#pantry/test/host-judge.ts`), each held by hand to the information model's
        // §4.5.11, §5.36.1, §5.72, §7.46, §8.14, §8.16 and §9.3.2 and the XSD (`verdict`).
        // Bound: the 13 named cases, exhausted.
        searched(
          ctx,
          exhaust(
            {
              box: "SV-LAW-01, SV-LAW-03, SV-LAW-05, SV-READ-03 and SV-READ-04, each admitted beside its control",
              caseHang: Duration.seconds(120),
              concurrency: 1,
              coverage: requiredInSpace<CaseName>([...caseNames]),
              generator: element(caseNames),
              literal: JSON.stringify,
              oracle: {
                kind: "second-implementation",
                name: "the law oracle and the schema's laws over the import's rows, held to the information model by hand",
              },
              suite: "test/conformance-admitted",
            },
            (name: CaseName, c) =>
              Effect.scoped(
                Effect.gen(function* admittedCase() {
                  c.note(name);

                  const { verdict }: Case = cases[name];
                  const dir = yield* scopedPackage(packageOf(name));
                  const judgment = yield* judgeOracle(
                    yield* readEntries(dir),
                    grammar,
                    lawsOf(grammar),
                  );
                  if (verdict.kind === "codec") {
                    assert.deepStrictEqual(
                      judgment._tag === "Judged" ? judgment._tag : judgment.rule,
                      verdict.rule,
                      name,
                    );

                    return;
                  }

                  const expected = [...verdict.laws].toSorted();
                  const oracle = new Set<string>(
                    judgment._tag === "Judged" ? judgment.breaches.map(({ law }) => law) : [],
                  );
                  assert.strictEqual(judgment._tag, "Judged", name);
                  assert.deepStrictEqual(
                    [...oracle].toSorted(),
                    expected,
                    `${name}: the law oracle breaks ${[...oracle].join(", ") || "no law"}`,
                  );

                  const rows = previewRowsOf((yield* readProgram(dir, nameOf(dir))).inputs);
                  const host = new Set<string>([
                    ...lawNamesOf(judge(rows, judgedLaws(Qti)).broken),
                    ...declarationQueryLawsOf(rows),
                  ]);
                  const unjudged = new Set(verdict.unjudged);
                  assert.deepStrictEqual(
                    [...host].toSorted(),
                    expected.filter((law) => !unjudged.has(law)),
                    `${name}: the import's rows break ${[...host].join(", ") || "no law"}`,
                  );
                }),
              ),
          ),
        ),
      searchTimeout,
    );
  },
);
