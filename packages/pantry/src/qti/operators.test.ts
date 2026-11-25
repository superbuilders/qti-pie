/**
 * The operators' free tests: the database's `integerForm` reads every collapsed `figures` as
 * reading 119 does, and the checks over the operators' views, `RoundingModeFigures` and
 * `ToleranceToken` (`#pantry/qti/overlay-queries/expression.ts`), evaluated by grizzle's row
 * evaluator over the rows the views hold of each drawn operator, refuse exactly where readings 119
 * and 121 do.
 *
 * The views' rows are written from the specification, `#pantry/test/operator-spec.ts`: a
 * `figures` collapsed beside its mode in force, and a `tolerance` split as XML Schema splits a
 * list, so no expectation is computed by the schema's own code;
 * `#pantry/qti/attribute-views.db.test.ts` reads the views back from the database.
 */
import { assert, describe, it } from "@effect/vitest";
import { drawn, exhaust, explore } from "@bjornpagen/testing/explore";
import { required, requiredInSpace } from "@bjornpagen/testing/features";
import { element, int, string } from "@bjornpagen/testing/gen";
import type { Gen } from "@bjornpagen/testing/gen";
import { notesOnly } from "@bjornpagen/testing/sense";
import { completeShrink } from "@bjornpagen/testing/shrink";
import { swarm, swarmChoice } from "@bjornpagen/testing/swarm";
import { searched } from "@bjornpagen/testing/vitest";
import { Duration, Effect, Option } from "effect";
import { integerForm } from "#pantry/qti/limits.ts";
import { doublePattern, positivePattern } from "#pantry/qti/operators.ts";
import { RoundingModeFigures, ToleranceToken } from "#pantry/qti/overlay-queries/expression.ts";
import { Qti } from "#pantry/qti/schema.ts";
import {
  collapsedText,
  figuresIntegerOf,
  roundingRefused,
  toleranceRefused,
  toleranceValuesOf,
} from "#pantry/test/operator-spec.ts";
import type { RoundingKind } from "#pantry/test/operator-spec.ts";
import { brokenIn, evaluatorOf } from "#pantry/test/row-evaluation.ts";
import { equalRoundedMode } from "#pantry/vocab/terms/operators.ts";
import { searchWidth } from "#pantry/test/settings.ts";

/**
 * Where every drawn operator stands: one element of one item of one package.
 */
const place = { package: "MANIFEST", path: "item.xml", start: 1n } as const;

/**
 * The patterns the database's checks read, as PostgreSQL's `~` reads them: each anchored, of
 * classes, groups and alternation alone, which ECMAScript's `u` mode reads the same.
 */
const database = {
  integer: new RegExp(integerForm.source, "u"),
  numeric: new RegExp(doublePattern.source, "u"),
  positive: new RegExp(positivePattern.source, "u"),
};

/**
 * The first 18 digits of both ends of the signed 64-bit range, `9223372036854775807` and
 * `-9223372036854775808`: a piece of the figures box, so that a stem followed by 7, 8 or 9 writes
 * the greatest integer, one past it, and with a sign the least and one past it.
 */
const int64Stem = "922337203685477580";

/**
 * A situation the figures box must reach: an integer, a form that is none, and each end of the
 * range, which the box reaches with the forms one past it beside.
 */
type FiguresSituation = "integer" | "no integer" | "the greatest integer" | "the least integer";

/**
 * The ends of the signed 64-bit range.
 */
const int64Range = { max: 2n ** 63n - 1n, min: -(2n ** 63n) } as const;

describe("qti/operators.ts, integerForm over a collapsed figures", () => {
  it.effect(
    "reads every figures of at most 4 pieces over the box as reading 119 does, collapsed: an integer exactly where the specification reads one, at its value",
    (ctx) =>
      // Oracle: the specification as a checker, the union's xs:integer member read collapsed
      // within reading 46's signed 64-bit range, `#pantry/test/operator-spec.ts` figuresIntegerOf.
      // Bound: every figures of at most 4 pieces over 0, 1, 7, 8, 9, +, -, space, tab, F and
      // {@link int64Stem}, 16,105, which reach both ends of the range and one past each.
      searched(
        ctx,
        exhaust(
          {
            box: "every figures of at most 4 pieces over 0 1 7 8 9 + - space tab F and the 64-bit bounds' first 18 digits",
            caseHang: Duration.seconds(10),
            concurrency: searchWidth,
            coverage: requiredInSpace<FiguresSituation>([
              "integer",
              "no integer",
              "the greatest integer",
              "the least integer",
            ]),
            generator: string(
              element(["0", "1", "7", "8", "9", "+", "-", " ", "\t", "F", int64Stem] as const),
              { max: 4, min: 0 },
            ),
            literal: (value) => JSON.stringify(value),
            oracle: {
              kind: "specification",
              name: "xs:integer's lexical space, collapsed, within the signed 64-bit range",
            },
            suite: "qti/operators-figures",
          },
          (lexical: string, c) =>
            Effect.sync(() => {
              const spec = figuresIntegerOf(lexical);
              c.note(spec === undefined ? "no integer" : "integer");
              if (spec === int64Range.max) {
                c.note("the greatest integer");
              }

              if (spec === int64Range.min) {
                c.note("the least integer");
              }

              const figures = collapsedText(lexical);
              assert.deepStrictEqual(
                database.integer.test(figures) ? BigInt(figures) : undefined,
                spec,
                JSON.stringify(lexical),
              );
            }),
        ),
      ),
  );
});

/**
 * The named forms an operator a swarm draws takes: the floor `figures` first.
 */
const OPERATOR_FORMS = [
  "figures",
  "figures-padded",
  "mode",
  "tolerance",
  "tolerance-spacing",
] as const;

/**
 * An operator's named form.
 */
type OperatorForm = (typeof OPERATOR_FORMS)[number];

/**
 * One drawn operator: its kind and its attributes as written, each none where it writes none.
 */
interface DrawnOperator {
  readonly figures: string | undefined;
  readonly kind: RoundingKind | "qti-equal";
  readonly mode: string | undefined;
  readonly form: OperatorForm;
  readonly tolerance: string | undefined;
}

/**
 * A tolerance value, from each corner of `xs:double`'s lexical space and past it.
 */
const toleranceValue: Gen<string> = element([
  "1",
  "0.5",
  ".5",
  "5.",
  "1e3",
  "1E-2",
  "+2",
  "0",
  "-0",
  "0.0",
  "0e5",
  "-1",
  "-0.5",
  "-0.12345678901234567",
  "NaN",
  "INF",
  "-INF",
  "+INF",
  "1e-400",
  "T",
  "1.2.3",
] as const);

/**
 * Whitespace runs a tolerance's values are separated and padded by.
 */
const spacing: Gen<string> = string(element([" ", "\t", "\n", "\r"] as const), { max: 2, min: 1 });

/**
 * The rounding operators and their modes, each mode none, a value or a near miss.
 */
const rounder: Gen<Pick<DrawnOperator, "kind" | "mode">> = (source) => ({
  kind: source.draw(element(["qti-equal-rounded", "qti-round-to"] as const)),
  mode: source.draw(element([undefined, "decimalPlaces", "significantFigures"] as const)),
});

/**
 * Each named form's generator.
 */
const FORM_GENERATORS: Readonly<Record<OperatorForm, Gen<DrawnOperator>>> = {
  figures: (source) => ({
    ...source.draw(rounder),
    figures: source.draw(element([undefined, "-1", "0", "1", "2", "F", "1.5"] as const)),
    form: "figures",
    tolerance: undefined,
  }),
  "figures-padded": (source) => ({
    ...source.draw(rounder),
    figures: `${source.draw(spacing)}${String(source.draw(int(-1, 1)))}${source.draw(spacing)}`,
    form: "figures-padded",
    tolerance: undefined,
  }),
  mode: (source) => ({
    figures: String(source.draw(int(-1, 1))),
    form: "mode",
    kind: source.draw(element(["qti-equal-rounded", "qti-round-to"] as const)),
    mode: source.draw(element(["", " decimalPlaces", "DecimalPlaces"] as const)),
    tolerance: undefined,
  }),
  tolerance: (source) => ({
    figures: undefined,
    form: "tolerance",
    kind: "qti-equal",
    mode: source.draw(element([undefined, "exact", "absolute", "relative", "Absolute"] as const)),
    tolerance: source.draw(
      element([
        undefined,
        "",
        ...(["1", "1 2", "1 2 3"] as const),
        `${source.draw(toleranceValue)} ${source.draw(toleranceValue)}`,
      ]),
    ),
  }),
  "tolerance-spacing": (source) => {
    const values = Array.from({ length: source.draw(int(0, 3)) }, () =>
      source.draw(toleranceValue),
    );

    return {
      figures: undefined,
      form: "tolerance-spacing",
      kind: "qti-equal",
      mode: source.draw(element([undefined, "absolute", "relative"] as const)),
      tolerance: `${source.draw(spacing)}${values.map((value) => `${value}${source.draw(spacing)}`).join("")}`,
    };
  },
};

/**
 * One operator, its form drawn by a swarm over the named forms.
 */
const drawnOperator: Gen<DrawnOperator> = (source) =>
  source.draw(
    FORM_GENERATORS[source.draw(swarmChoice(source.draw(swarm(OPERATOR_FORMS)), OPERATOR_FORMS))],
  );

/**
 * The schema's row evaluator, which judges each check over a view's row as PostgreSQL does.
 */
const evaluate = evaluatorOf(Qti);

/**
 * Decide whether a check over a view's row breaks, as grizzle's evaluator judges it.
 *
 * @param broken - The evaluator's verdict, none where the row is outside its domains.
 * @returns Whether it breaks; a row outside its domains is a defect of the case.
 */
const breaks = (broken: Option.Option<boolean>): boolean =>
  Option.getOrElse(broken, () => assert.fail("the view's row is outside its domains"));

/**
 * Decide whether a drawn rounding operator breaks "Rounding figures" over its view's row: its
 * `figures` collapsed beside its mode in force, the written `rounding-mode` or a
 * `qti-equal-rounded`'s default, where it has both, and no row otherwise.
 *
 * @param kind - The operator's kind.
 * @param drawnCase - The operator.
 * @returns Whether the check breaks.
 */
const roundingBroken = (kind: RoundingKind, drawnCase: DrawnOperator): boolean => {
  const mode = drawnCase.mode ?? (kind === "qti-equal-rounded" ? equalRoundedMode : undefined);
  if (drawnCase.figures === undefined || mode === undefined) {
    return false;
  }

  return breaks(
    brokenIn(
      evaluate.admit(RoundingModeFigures, {
        ...place,
        figures: collapsedText(drawnCase.figures),
        mode,
      }),
      (admitted) => evaluate(RoundingModeFigures, admitted).checks.Rounding_figures,
      "Rounding_figures over a RoundingModeFigures row",
    ),
  );
};

/**
 * Decide whether a drawn `qti-equal` breaks reading 121: under an `absolute` or `relative` mode it
 * writes no `tolerance`; or it writes one with no first value; or a value of its view's rows breaks
 * "Equal tolerance", each value split as XML Schema splits a list.
 *
 * @param drawnCase - The operator.
 * @returns Whether a law breaks.
 */
const toleranceBroken = (drawnCase: DrawnOperator): boolean => {
  if (drawnCase.tolerance === undefined) {
    return drawnCase.mode === "absolute" || drawnCase.mode === "relative";
  }

  const values = toleranceValuesOf(drawnCase.tolerance);

  return (
    values.length === 0 ||
    values.some((token, at) =>
      breaks(
        brokenIn(
          evaluate.admit(ToleranceToken, { ...place, at: BigInt(at), token }),
          (admitted) => evaluate(ToleranceToken, admitted).checks.Equal_tolerance,
          "Equal_tolerance over a ToleranceToken row",
        ),
      ),
    )
  );
};

describe("qti/overlay-queries/expression.ts, the operators' checks over their views", () => {
  it.effect(
    "refuse each operator a swarm draws exactly where readings 119 and 121 refuse it",
    (ctx) =>
      // Oracle: the specification as a checker, readings 119 and 121,
      // `#pantry/test/operator-spec.ts`, against the checks over the views, evaluated by
      // grizzle's row evaluator over the rows the specification gives each view.
      searched(
        ctx,
        explore(
          {
            caseHang: Duration.seconds(30),
            concurrency: 1,
            coverage: required<OperatorForm>(OPERATOR_FORMS, { cases: 200, sense: notesOnly }),
            draw: drawn(drawnOperator),
            kept: [],
            literal: (drawnCase) => JSON.stringify(drawnCase),
            oracle: {
              kind: "specification",
              name: "the information model's EqualRounded, RoundTo and Equal, readings 119 and 121",
            },
            runs: 200,
            shrink: completeShrink,
            steerEvery: 16,
            suite: "qti/operators-checks",
          },
          (drawnCase, c) =>
            Effect.sync(() => {
              c.note(drawnCase.form);

              assert.strictEqual(
                drawnCase.kind === "qti-equal"
                  ? toleranceBroken(drawnCase)
                  : roundingBroken(drawnCase.kind, drawnCase),
                drawnCase.kind === "qti-equal"
                  ? toleranceRefused(drawnCase.mode, drawnCase.tolerance)
                  : roundingRefused(drawnCase.kind, drawnCase.mode, drawnCase.figures),
                JSON.stringify(drawnCase),
              );
            }),
        ),
      ),
  );
});
