/**
 * An outcome declaration's normal minimum where it writes none (spec reading 149): QTI 3.0.1's
 * information model gives `normal-minimum` "Default = "0.0"" (§4.5.8) and its ASI XSD
 * `default="0.0"`. So a declaration that writes a `mastery-value` and no `normal-minimum` has its
 * mastery value judged against 0.0 by `Mastery range`.
 *
 * Before, the import and the law oracle read an unwritten minimum as none, as reading 9's "each
 * pair judged where both are written" had it, so a `mastery-value="-1"` with no `normal-minimum`
 * was admitted below its normal range (FIX-UNWRITTEN's open question, 34c8c4b9).
 *
 * Each package is held three ways: by the specification by hand ({@link expectedOf}), by the law
 * oracle's laws, and by the import's rows: the laws they break on the host
 * (`#pantry/test/host-judge.ts`), `Mastery_range` among them as its check orders each pair of the
 * doubles the scale views read from the declaration's attributes, the minimum the default where it
 * writes none (`NormalMinimum`, `MasteryValue` and `NormalMaximum` of `#pantry/qti/names.ts`, and
 * their joins `MasteryFloor` and `MasteryCeiling`), restated over the host's rows
 * (`#pantry/test/declaration-queries.ts`), under the refusal's rule. The database judges the check
 * itself.
 */
import { NodeServices } from "@effect/platform-node";
import { assert, layer } from "@effect/vitest";
import { exhaust } from "@bjornpagen/testing/explore";
import { requiredInSpace } from "@bjornpagen/testing/features";
import { int } from "@bjornpagen/testing/gen";
import { searched } from "@bjornpagen/testing/vitest";
import { Array as Arr, Duration, Effect, Formatter, Option } from "effect";
import { grammar } from "#pantry/grammar/install.ts";
import { readProgram } from "#pantry/import/program.ts";
import { Qti } from "#pantry/qti/schema.ts";
import { scopedPackage } from "#pantry/test/gen/every-relation.ts";
import type { PackageEntries } from "#pantry/test/gen/every-relation.ts";
import { declarationQueryLawsOf } from "#pantry/test/declaration-queries.ts";
import { previewRowsOf, judge as judgeHost, judgedLaws } from "#pantry/test/host-judge.ts";
import { filesOf } from "#pantry/test/oracle-complete/mutation.ts";
import { judge, ruleOf, shownBreach } from "#pantry/test/oracle.ts";
import type { LawName } from "#pantry/test/oracle.ts";
import { lawNameOf, rulesOf } from "#pantry/import/refusal.ts";
import { laws } from "#pantry/test/installed-laws.ts";
import { lawTable } from "#pantry/vocab/laws.ts";
import { searchTimeout } from "#pantry/test/settings.ts";

/**
 * Every law the host judges, read once.
 */
const hostLaws = judgedLaws(Qti);

/**
 * The QTI 3 ASI namespace, of every item element.
 */
const asi = "http://www.imsglobal.org/xsd/imsqtiasi_v3p0";

/**
 * One case: an outcome declaration's `normal-minimum`, `normal-maximum` and `mastery-value`, each
 * unwritten or written with a text of the box.
 */
interface Case {
  readonly mastery: "-1" | undefined;
  readonly maximum: "-2" | "0" | "3" | undefined;
  readonly minimum: "-2" | undefined;
}

/**
 * The texts of the box: a minimum of -2, below the mastery value; a maximum of -2, below 0 and the
 * mastery value, of 0, and of 3, above both; and a mastery value of -1, below the default minimum
 * 0. Each is unwritten too.
 */
const texts = {
  mastery: ["-1", undefined],
  maximum: ["-2", "0", "3", undefined],
  minimum: ["-2", undefined],
} as const;

/**
 * Every case: 2 minimums × 4 maximums × 2 mastery values, 16 in all.
 */
const cases: readonly Case[] = texts.minimum.flatMap((minimum) =>
  texts.maximum.flatMap((maximum) =>
    texts.mastery.map((mastery): Case => ({ mastery, maximum, minimum })),
  ),
);

/**
 * The normal minimum a declaration that writes none has, as the specification states it: QTI
 * 3.0.1's information model, "Default = "0.0"" and "It is set to 0 by default" (§4.5.8), with its
 * ASI XSD's `<xs:attribute name="normal-minimum" use="optional" default="0.0" type="xs:double" />`.
 */
const defaultMinimum = "0.0";

/**
 * A case's normal minimum: the one it writes, or else the default.
 *
 * @param drawn - The case.
 * @returns The minimum's lexical form.
 */
const minimumOf = (drawn: Case): Option.Option<string> =>
  Option.some(drawn.minimum ?? defaultMinimum);

/**
 * An optional attribute's text.
 *
 * @param name - Its name.
 * @param value - Its value, none where unwritten.
 * @returns Its text, with its leading space, or nothing.
 */
const optional = (name: string, value: string | undefined): string =>
  value === undefined ? "" : ` ${name}="${value}"`;

/**
 * Write a case's package: an item holding its outcome declaration, and the manifest that lists it,
 * each file's text encoded as UTF-8.
 *
 * @param drawn - The case.
 * @returns The package's entries.
 */
const packageOf = (drawn: Case): PackageEntries =>
  new Map(
    Object.entries({
      "imsmanifest.xml": `<manifest xmlns="http://www.imsglobal.org/xsd/qti/qtiv3p0/imscp_v1p1" identifier="M"><metadata><schema>QTI Package</schema><schemaversion>3.0.1</schemaversion></metadata><organizations/><resources><resource identifier="I" type="imsqti_item_xmlv3p0" href="item.xml"><file href="item.xml"/></resource></resources></manifest>`,
      "item.xml": `<qti-assessment-item xmlns="${asi}" identifier="item" title="Item" time-dependent="false"><qti-outcome-declaration identifier="O" cardinality="single" base-type="float"${optional("mastery-value", drawn.mastery)}${optional("normal-minimum", drawn.minimum)}${optional("normal-maximum", drawn.maximum)}/><qti-item-body><p>Hi</p></qti-item-body></qti-assessment-item>`,
    }).map(([path, text]) => [path, new TextEncoder().encode(text)] as const),
  );

/**
 * Whether two scale values are both present and out of order. Every text of the box is a plain
 * decimal, so its `xs:double` is its number.
 *
 * @param low - The one that must not be above.
 * @param high - The one that must not be below.
 * @returns Whether both are present and the first is above the second.
 */
const disordered = (low: Option.Option<string>, high: Option.Option<string>): boolean =>
  Option.match(Option.all([low, high]), {
    onNone: () => false,
    onSome: ([l, h]) => Number(l) > Number(h),
  });

/**
 * The laws a case breaks, by the specification:
 *
 * - **`Double bound`**: `normal-maximum` "must be a positive value" (information model §4.5.7, spec
 *   readings 16 and 144), so a written maximum of -2 or 0 breaks it;
 * - **`Mastery range`**: the Schematron's RULE SPECIFIC CLASS OUTCOMEDEC 1, "The mastery-value
 *   attribute value must not be less than the normal-minimum value" and "must not be greater than
 *   the normal-maximum value" (reading 9), each pair judged where both have a value: a written
 *   mastery value below the minimum, written or the default, or above a written maximum.
 *
 * @param drawn - The case.
 * @returns The laws, empty where the case is lawful.
 */
const expectedOf = (drawn: Case): ReadonlySet<LawName> => {
  const mastery = Option.fromUndefinedOr(drawn.mastery);

  return new Set<LawName>([
    ...(drawn.maximum === "-2" || drawn.maximum === "0" ? ["Double bound" as const] : []),
    ...(disordered(minimumOf(drawn), mastery) ||
    disordered(mastery, Option.fromUndefinedOr(drawn.maximum))
      ? ["Mastery range" as const]
      : []),
  ]);
};

/**
 * A situation the box must reach: a case whose mastery value is judged against the default floor,
 * one whose ceiling is out of order, one whose maximum breaks its bound, and one that is lawful.
 */
type Situation = "accepted" | "bound" | "ceiling" | "default floor";

/**
 * Name the situations a case reaches.
 *
 * @param drawn - The case.
 * @returns Its situations.
 */
const situationsOf = (drawn: Case): readonly Situation[] => {
  const expected = expectedOf(drawn);
  const judged = drawn.mastery !== undefined && drawn.minimum === undefined;

  return [
    ...(expected.size === 0 ? ["accepted" as const] : []),
    ...(expected.has("Double bound") ? ["bound" as const] : []),
    ...(drawn.mastery !== undefined && drawn.maximum === "-2" ? ["ceiling" as const] : []),
    ...(judged ? ["default floor" as const] : []),
  ];
};

layer(NodeServices.layer, { excludeTestServices: true })(
  "an outcome declaration's unwritten normal-minimum",
  (it) => {
    it.effect(
      "is 3.0.1's default 0.0, and the law oracle, the import's rows and the specification give one verdict",
      (ctx) =>
        // Oracle: the specification as a checker by hand (`expectedOf`): the QTI 3.0.1 information
        // model's §4.5.7 and §4.5.8, the ASI XSD's declarations of the three attributes, and
        // readings 9, 16 and 144. Bound: an outcome declaration's minimum written below the
        // mastery value or not, its maximum written below, at or above 0 or not, and its mastery
        // value written below 0 or not: 16 packages, exhausted.
        searched(
          ctx,
          exhaust(
            {
              box: "an outcome declaration's normal-minimum, normal-maximum and mastery-value, each written or not",
              caseHang: Duration.minutes(2),
              concurrency: 1,
              coverage: requiredInSpace<Situation>([
                "accepted",
                "bound",
                "ceiling",
                "default floor",
              ]),
              generator: int(0, cases.length - 1),
              literal: (at) => Formatter.format(cases[at]),
              oracle: {
                kind: "specification",
                name: "the normal-minimum default and OUTCOMEDEC 1, by hand",
              },
              suite: "test/normal-minimum-default",
            },
            (at, c) =>
              Effect.scoped(
                Effect.gen(function* oneCase() {
                  const drawn = cases[at];
                  assert.isDefined(drawn, `no case ${String(at)}`);
                  if (drawn === undefined) {
                    return;
                  }

                  const label = Formatter.format(drawn);
                  const expected = expectedOf(drawn);
                  for (const situation of situationsOf(drawn)) {
                    c.note(situation);
                  }

                  const entries = packageOf(drawn);
                  const judgment = yield* judge(filesOf(entries), grammar, laws);
                  assert.strictEqual(judgment._tag, "Judged", `${label}: the codec refuses it`);

                  const breaches = judgment._tag === "Judged" ? judgment.breaches : [];
                  assert.deepStrictEqual(
                    [...new Set(breaches.map(({ law }) => law))].toSorted(),
                    [...expected].toSorted(),
                    `${label}: the law oracle:\n${breaches.map((breach) => `  ${shownBreach(breach, grammar)}`).join("\n")}`,
                  );

                  const { inputs } = yield* readProgram(yield* scopedPackage(entries), "scoped");

                  // The host judges every stored law, and its refusal is named by the rule the
                  // catalog's precedence puts first, as the database's is. Mastery range, a rule
                  // over each pair's join, is the database's alone, restated here.
                  const rows = previewRowsOf(inputs);
                  const { broken } = judgeHost(rows, hostLaws);
                  const queried = declarationQueryLawsOf(rows);
                  const brokenNames = [
                    ...broken.map(({ law }) =>
                      Option.getOrElse(lawNameOf(law), () => Formatter.format(law)),
                    ),
                    ...queried,
                  ];
                  const shown =
                    broken.map(({ law }) => Formatter.format(law)).join("; ") || "no law";
                  assert.sameMembers(
                    [...new Set(brokenNames)],
                    [...expected],
                    `${label}: the import's rows break ${shown}`,
                  );

                  const brokenLaws = broken.map(({ law }) => law);
                  const rule = Arr.isReadonlyArrayNonEmpty(brokenLaws)
                    ? Arr.head(rulesOf(brokenLaws))
                    : Option.map(Arr.head(queried), (name) => lawTable[name].rule);
                  const rules = [...expected].map((law) => ruleOf(law));
                  assert.isTrue(
                    Option.match(rule, {
                      onNone: () => !expected.has("Double bound"),
                      onSome: (named) => rules.includes(named),
                    }),
                    `${label}: the import's refusal names ${Option.getOrElse(rule, () => "none")}, the specification ${rules.join(", ") || "none"}`,
                  );
                }),
              ),
          ),
        ),
      searchTimeout,
    );
  },
);
