/**
 * AlphaTest's shared stimulus shapes, admitted: items that reference passages by
 * `qti-assessment-stimulus-ref`, in the forms the served set writes (the qti-port registry's
 * T-STIM-01 to T-STIM-03), judged by the law oracle and by the schema's laws over the import's
 * rows.
 *
 * QTI 3.0.1 admits each: "the Item uses the 'qti-assessment-stimulus-ref' structure to provide the
 * link between the Item and the Stimulus" (information model §7.6), [0..unbounded] of them per item
 * (§4.1.15), each `href` "The uri used to refer to the stimulus file (e.g. elsewhere in the same
 * content package). There is no requirement that this be unique. Several items may refer to the
 * same stimulus" (§7.6.2), an `xs:anyURI` (XSD, AssessmentStimulusRefDType). The implementation
 * guide packages "an qti-assessment-test together with the qti-assessment-stimulus and
 * qti-assessment-items ... dependencies are also used to represent the relationship between an
 * item and any stimulus it references" (§6.2.7), the stimulus a resource of type
 * `imsqti_stimulus_xmlv3p0`. So each shape breaks no law. "Stimulus ref target" (pantry's
 * `package.ts`) holds a ref's `href` that resolves in the package to a document whose root is a
 * stimulus, and leaves an external one unresolved (reading 35); a ref that names an item breaks it
 * alone, the instrument's control.
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
import { judge, judgedLaws, previewRowsOf } from "#pantry/test/host-judge.ts";
import { lawNamesOf } from "#pantry/test/host-law-names.ts";
import { judge as judgeOracle, lawsOf } from "#pantry/test/oracle.ts";
import { nameOf } from "#pantry/test/package-name.ts";
import { asi, manifestOf } from "#pantry/test/probe.ts";
import { searchTimeout } from "#pantry/test/settings.ts";

/**
 * One item of a case: its path, its identifier and the `href` of each stimulus ref it writes, by
 * the ref's identifier.
 */
interface CaseItem {
  readonly path: string;
  readonly refs: readonly (readonly [identifier: string, href: string])[];
}

/**
 * One stimulus document of a case: its path in the package and its identifier.
 */
interface CaseStimulus {
  readonly identifier: string;
  readonly path: string;
}

/**
 * A package of a case: its items, its stimuli, and the laws it breaks, held to the specification
 * by hand.
 */
interface StimulusCase {
  readonly breaks: readonly string[];
  readonly items: readonly CaseItem[];
  readonly stimuli: readonly CaseStimulus[];
}

/**
 * Every case's name: the registry's six shapes, then the control.
 */
const caseNames = [
  "T-STIM-01 a passage beside its item",
  "T-STIM-01 one passage two items share",
  "T-STIM-02 a package path from items/",
  "T-STIM-02 an absolute API URL",
  "T-STIM-02 stimuli/<id> with no extension",
  "T-STIM-03 an Edulastic tabbed passage",
  "the control, a ref naming an item",
] as const;

/**
 * A case's name.
 */
type CaseName = (typeof caseNames)[number];

/**
 * The served set's shapes, each its registry row, and the control.
 *
 * - T-STIM-01, one passage named by its file name beside the item, `<id>.xml` (16,745 refs), and one
 *   passage two items share (62 items share `reading-g8-5-liang-and-bao`);
 * - T-STIM-02, `stimuli/<id>` with no extension (923 refs), the package path `../stimuli/<id>.xml`
 *   the converter writes from `items/`, and an absolute API URL (22 refs), which no law resolves;
 * - T-STIM-03, an Edulastic tabbed passage, one stimulus per tab, named `_<hex24>_tab_<n>`;
 * - The control, a ref whose `href` names an item.
 */
const cases = {
  "T-STIM-01 a passage beside its item": {
    breaks: [],
    items: [
      {
        path: "_0d6e1e26-fb14-44d8-9575-950852730e6b.xml",
        refs: [["reading-g8-5-liang-and-bao", "reading-g8-5-liang-and-bao.xml"]],
      },
    ],
    stimuli: [{ identifier: "reading-g8-5-liang-and-bao", path: "reading-g8-5-liang-and-bao.xml" }],
  },
  "T-STIM-01 one passage two items share": {
    breaks: [],
    items: [
      {
        path: "_0d6e1e26-fb14-44d8-9575-950852730e6b.xml",
        refs: [["reading-g8-5-liang-and-bao", "reading-g8-5-liang-and-bao.xml"]],
      },
      {
        path: "_0f8bd136-51e0-44ad-817f-3f338eb6fb3b.xml",
        refs: [["reading-g8-5-liang-and-bao", "reading-g8-5-liang-and-bao.xml"]],
      },
    ],
    stimuli: [{ identifier: "reading-g8-5-liang-and-bao", path: "reading-g8-5-liang-and-bao.xml" }],
  },
  "T-STIM-02 a package path from items/": {
    breaks: [],
    items: [
      {
        path: "items/_12f797d1-af2c-454e-9304-441d90ec30a0.xml",
        refs: [["_6884e32bcdf0bad5da96af63", "../stimuli/_6884e32bcdf0bad5da96af63.xml"]],
      },
    ],
    stimuli: [
      { identifier: "_6884e32bcdf0bad5da96af63", path: "stimuli/_6884e32bcdf0bad5da96af63.xml" },
    ],
  },
  "T-STIM-02 an absolute API URL": {
    breaks: [],
    items: [
      {
        path: "_12f797d1-af2c-454e-9304-441d90ec30a0.xml",
        refs: [["stim-4f1c2a90", "https://qti.alpha-1edtech.ai/api/stimuli/stim-4f1c2a90"]],
      },
    ],
    stimuli: [],
  },
  "T-STIM-02 stimuli/<id> with no extension": {
    breaks: [],
    items: [
      {
        path: "_12f797d1-af2c-454e-9304-441d90ec30a0.xml",
        refs: [["stim-4f1c2a90", "stimuli/stim-4f1c2a90"]],
      },
    ],
    stimuli: [{ identifier: "stim-4f1c2a90", path: "stimuli/stim-4f1c2a90" }],
  },
  "T-STIM-03 an Edulastic tabbed passage": {
    breaks: [],
    items: [
      {
        path: "_005a016b-cdac-4e0f-8764-e92520129827.xml",
        refs: [
          ["_648be82d1376850008fb91a2_tab_0", "_648be82d1376850008fb91a2_tab_0.xml"],
          ["_648be82d1376850008fb91a2_tab_1", "_648be82d1376850008fb91a2_tab_1.xml"],
        ],
      },
    ],
    stimuli: [
      {
        identifier: "_648be82d1376850008fb91a2_tab_0",
        path: "_648be82d1376850008fb91a2_tab_0.xml",
      },
      {
        identifier: "_648be82d1376850008fb91a2_tab_1",
        path: "_648be82d1376850008fb91a2_tab_1.xml",
      },
    ],
  },
  "the control, a ref naming an item": {
    breaks: ["Stimulus ref target"],
    items: [
      {
        path: "_0d6e1e26-fb14-44d8-9575-950852730e6b.xml",
        refs: [["passage", "_0f8bd136-51e0-44ad-817f-3f338eb6fb3b.xml"]],
      },
      { path: "_0f8bd136-51e0-44ad-817f-3f338eb6fb3b.xml", refs: [] },
    ],
    stimuli: [],
  },
} satisfies { readonly [N in CaseName]: StimulusCase };

/**
 * Encode a text as UTF-8.
 *
 * @param text The text.
 * @returns Its bytes.
 */
const encode = (text: string): Uint8Array => new TextEncoder().encode(text);

/**
 * Escape a value for an XML attribute written in double quotes.
 *
 * @param value The value.
 * @returns It, `&` and `"` escaped.
 */
const attribute = (value: string): string =>
  value.replaceAll("&", "&amp;").replaceAll('"', "&quot;");

/**
 * Write a case's item: a Choice bound to an identifier response, scored by `match_correct`, its
 * stimulus refs after its declarations, where the XSD's sequence places them.
 *
 * @param item The item.
 * @param index Its place among the case's items, which names it.
 * @returns The item's text.
 */
const itemOf = (item: CaseItem, index: number): string =>
  `<qti-assessment-item xmlns="${asi}" identifier="item${String(index)}" title="Question ${String(index + 1)}" time-dependent="false">
  <qti-response-declaration identifier="RESPONSE" cardinality="single" base-type="identifier">
    <qti-correct-response><qti-value>A</qti-value></qti-correct-response>
  </qti-response-declaration>
  <qti-outcome-declaration identifier="SCORE" cardinality="single" base-type="float"/>
${item.refs.map(([identifier, href]) => `  <qti-assessment-stimulus-ref identifier="${identifier}" href="${attribute(href)}"/>`).join("\n")}
  <qti-item-body>
    <qti-choice-interaction response-identifier="RESPONSE" max-choices="1">
      <qti-prompt>What did Liang notice?</qti-prompt>
      <qti-simple-choice identifier="A">Bao looked embarrassed.</qti-simple-choice>
      <qti-simple-choice identifier="B">Bao was late.</qti-simple-choice>
    </qti-choice-interaction>
  </qti-item-body>
  <qti-response-processing template="https://purl.imsglobal.org/spec/qti/v3p0/rptemplates/match_correct"/>
</qti-assessment-item>`;

/**
 * Write a case's stimulus: a passage of a heading and a paragraph, as AlphaTest's are.
 *
 * @param stimulus The stimulus.
 * @returns The stimulus's text.
 */
const stimulusOf = (stimulus: CaseStimulus): string =>
  `<qti-assessment-stimulus xmlns="${asi}" identifier="${stimulus.identifier}" title="Liang and Bao" xml:lang="en">
  <qti-stimulus-body>
    <h3>Liang and Bao</h3>
    <p>Liang was standing in the hallway when she saw her younger brother, Bao.</p>
  </qti-stimulus-body>
</qti-assessment-stimulus>`;

/**
 * Write a case's package: its items and stimuli, and a manifest listing each as a resource of its
 * type, each item depending on each stimulus resource its refs name in the package (guide §6.2.7).
 *
 * @param name The case.
 * @returns The package's entries.
 */
const packageOf = (name: CaseName): ReadonlyMap<string, Uint8Array> => {
  const { items, stimuli }: StimulusCase = cases[name];
  const stimulusResources = stimuli.map(
    ({ path }, index) =>
      `<resource identifier="S${String(index)}" type="imsqti_stimulus_xmlv3p0" href="${path}"><file href="${path}"/></resource>`,
  );
  const itemResources = items.map(
    ({ path }, index) =>
      `<resource identifier="I${String(index)}" type="imsqti_item_xmlv3p0" href="${path}"><file href="${path}"/>${stimuli.map((_, at) => `<dependency identifierref="S${String(at)}"/>`).join("")}</resource>`,
  );

  return new Map([
    ["imsmanifest.xml", encode(manifestOf([...itemResources, ...stimulusResources].join("")))],
    ...items.map((item, index) => [item.path, encode(itemOf(item, index))] as const),
    ...stimuli.map((stimulus) => [stimulus.path, encode(stimulusOf(stimulus))] as const),
  ]);
};

/**
 * Every law the host judges, read once.
 */
const hostLaws = judgedLaws(Qti);

layer(NodeServices.layer, { excludeTestServices: true })(
  "qti/package.ts, AlphaTest's shared stimulus shapes",
  (test) => {
    test.effect(
      "admits each stimulus ref shape the served set writes, by the law oracle and by the schema's laws over the import's rows, and refuses a ref naming an item on Stimulus ref target alone",
      (ctx) =>
        // Oracle: two implementations side by side, the law oracle and the schema's laws over the
        // import's rows (`#pantry/test/host-judge.ts`), held by hand to the information model
        // §7.6, §7.6.2 and §4.1.15, the guide's §6.2.7 and reading 35 (`breaks`).
        // Bound: the registry's six shapes and the control, 7.
        searched(
          ctx,
          exhaust(
            {
              box: "T-STIM-01 to T-STIM-03 as the served set writes them, and a ref naming an item",
              caseHang: Duration.seconds(120),
              concurrency: 1,
              coverage: requiredInSpace<CaseName>([...caseNames]),
              generator: element(caseNames),
              literal: JSON.stringify,
              oracle: {
                kind: "second-implementation",
                name: "the law oracle and the schema's laws over the import's rows, held to the information model §7.6 by hand",
              },
              suite: "qti/stimulus-shapes",
            },
            (name: CaseName, c) =>
              Effect.scoped(
                Effect.gen(function* stimulusRefCase() {
                  c.note(name);

                  const expected = [...cases[name].breaks];
                  const dir = yield* scopedPackage(packageOf(name));
                  const judgment = yield* judgeOracle(
                    yield* readEntries(dir),
                    grammar,
                    lawsOf(grammar),
                  );
                  assert.strictEqual(judgment._tag, "Judged", name);

                  const oracle = new Set<string>(
                    judgment._tag === "Judged" ? judgment.breaches.map(({ law }) => law) : [],
                  );
                  const host = judge(
                    previewRowsOf((yield* readProgram(dir, nameOf(dir))).inputs),
                    hostLaws,
                  );
                  assert.deepStrictEqual(
                    [...oracle].toSorted(),
                    expected,
                    `${name}: the law oracle breaks ${[...oracle].join(", ") || "no law"}`,
                  );
                  assert.deepStrictEqual(
                    [...lawNamesOf(host.broken)].toSorted(),
                    expected,
                    `${name}: the import's rows break ${[...lawNamesOf(host.broken)].join(", ") || "no law"}`,
                  );
                }),
              ),
          ),
        ),
      searchTimeout,
    );
  },
);
