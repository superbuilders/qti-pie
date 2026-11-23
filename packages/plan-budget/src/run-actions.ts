/**
 * The second check over a whole composition: its seed children written through its own programs,
 * its population grown to each scale, and every student action measured at each, on fresh children,
 * its verdict read from the bar and the growth.
 *
 * @module
 */
import { appendFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { Effect, Layer, Schema } from "effect";
import type pg from "pg";
import { measureAction } from "#plan-budget/actions.ts";
import type {
  ActionMeasureFailed,
  ActionRecord,
  ActionsSubject,
  StudentAction,
  StudentCallFailed,
} from "#plan-budget/actions.ts";
import { descentSlope, slopeOf } from "#plan-budget/growth.ts";
import type { Grow, PopulationRefused } from "#plan-budget/population.ts";

/**
 * A student action a composition declares that its programs do not hold yet: it is listed, and
 * fails, until they do.
 */
export interface PendingAction {
  readonly name: string;
  readonly barMs: number;
  readonly reason: string;
}

/**
 * A composition as the second check measures it: where, its unit, its seed, its population at 1x,
 * its actions, and the actions it declares but does not hold yet.
 */
export interface ActionsComposition<R, E> {
  readonly composition: string;
  readonly subject: ActionsSubject<R, E>;
  /**
   * The installation's superuser session, which grows the population.
   */
  readonly admin: pg.Client;
  /**
   * How the population grows (#plan-budget/population.ts): the shared copy of a unit column,
   * `copyUnits("child")`, or the composition's own.
   */
  readonly grow: Grow;
  /**
   * A unit's value from a name of letters and digits the check draws (`pbseed3`, `pbf10x2r0t…`).
   */
  readonly unitOf: (name: string) => string;
  readonly seedUnits: number;
  readonly seed: (unit: string) => Effect.Effect<void, StudentCallFailed, R>;
  readonly unitsAt1x: number;
  readonly scales: readonly number[];
  readonly repeats: number;
  readonly actions: readonly StudentAction<R>[];
  readonly pending: readonly PendingAction[];
  /**
   * Where the population's state is kept between runs: the seed written and the copies made.
   */
  readonly state: string;
}

/**
 * The population's state between runs.
 */
const PopulationStateSchema = Schema.Struct({ copies: Schema.Number, seeded: Schema.Boolean });

/**
 * The population's state between runs.
 */
type PopulationState = typeof PopulationStateSchema.Type;

/**
 * A state file's text, decoded.
 */
const populationStateOf = Schema.decodeUnknownSync(Schema.fromJsonString(PopulationStateSchema));

/**
 * One action's verdict over every scale.
 */
export interface ActionVerdict {
  readonly action: string;
  readonly barMs: number;
  readonly verdict: "fail" | "pass";
  readonly reasons: readonly string[];
  readonly slope: number;
  readonly byScale: readonly {
    readonly scale: number;
    readonly cpuMs: number;
    readonly pages: number;
    readonly wallMs: number;
    readonly waits: Readonly<Record<string, number>>;
  }[];
}

/**
 * The prefix of every copied unit, before its copy's number.
 */
const copyPrefix = "pbc";

/**
 * The population's state as the last run left it.
 *
 * @param file - The state's file.
 * @returns The state; none written is an empty installation's.
 */
const stateOf = (file: string): PopulationState =>
  existsSync(file) ? populationStateOf(readFileSync(file, "utf-8")) : { copies: 0, seeded: false };

/**
 * The copies a scale needs: enough copies of the seed units that the installation holds the scale's
 * units.
 *
 * @param composition - The composition.
 * @param scale - The scale.
 * @returns The last copy's number.
 */
const copiesAt = <R, E>(composition: ActionsComposition<R, E>, scale: number): number =>
  Math.max(0, Math.ceil((scale * composition.unitsAt1x) / composition.seedUnits) - 1);

/**
 * Every action measured at every scale of a composition, its records appended to `out`, and its
 * verdicts.
 *
 * @param composition - The composition.
 * @param out - The records' file.
 * @returns Every action's verdict, the pending ones' among them.
 */
export const measureActions = <R, E>(
  composition: ActionsComposition<R, E>,
  out: string,
): Effect.Effect<
  readonly ActionVerdict[],
  ActionMeasureFailed | E | PopulationRefused | StudentCallFailed
> =>
  Effect.gen(function* measureActionsOf() {
    mkdirSync(path.dirname(composition.state), { recursive: true });

    let state = stateOf(composition.state);

    if (!state.seeded) {
      yield* Effect.logInfo(
        `seeding ${String(composition.seedUnits)} units through the composition's programs`,
      );

      yield* Effect.scoped(
        Effect.flatMap(Layer.build(composition.subject.layer()), (context) =>
          Effect.provide(
            Effect.forEach(
              Array.from({ length: composition.seedUnits }, (_, n) =>
                composition.unitOf(`pbseed${String(n)}`),
              ),
              composition.seed,
              { discard: true },
            ),
            context,
          ),
        ),
      );
      state = { copies: 0, seeded: true };
      writeFileSync(composition.state, JSON.stringify(state));
    }

    const records: (ActionRecord & { readonly size: number })[] = [];

    for (const scale of composition.scales) {
      const last = copiesAt(composition, scale);

      if (last > state.copies) {
        yield* Effect.logInfo(
          `growing to ${String(scale)}x: copies ${String(state.copies + 1)} to ${String(last)}`,
        );

        yield* composition.grow(composition.admin, {
          first: state.copies + 1,
          last,
          prefix: copyPrefix,
        });
        state = { copies: last, seeded: true };
        writeFileSync(composition.state, JSON.stringify(state));
      }

      for (const [at, action] of composition.actions.entries()) {
        for (let repeat = 0; repeat < composition.repeats; repeat += 1) {
          const child = composition.unitOf(
            `pbf${String(scale)}x${String(at)}r${String(repeat)}t${Date.now().toString(36)}`,
          );
          const record = yield* measureAction(
            composition.subject,
            action,
            `${String(scale)}x`,
            child,
          );

          records.push({ ...record, size: scale });
          appendFileSync(
            out,
            `${JSON.stringify({ composition: composition.composition, ...record, size: scale })}\n`,
          );
          yield* Effect.logInfo(
            `${composition.composition} ${action.name} at ${String(scale)}x: CPU ${record.cpuMs.toFixed(1)} ms (bar ${String(action.barMs)}), wall ${record.wallMs.toFixed(1)} ms, ${String(record.pages)} pages, ${String(record.statements)} statements, waits ${JSON.stringify(record.waits)}`,
          );
        }
      }
    }

    const measured = composition.actions.map((action): ActionVerdict => {
      const byScale = composition.scales.map((scale) => {
        const runs = records.filter(
          (record) => record.action === action.name && record.size === scale,
        );

        return {
          cpuMs: Math.min(...runs.map(({ cpuMs }) => cpuMs)),
          pages: Math.min(...runs.map(({ pages }) => pages)),
          scale,
          waits: runs.at(-1)?.waits ?? {},
          wallMs: Math.min(...runs.map(({ wallMs }) => wallMs)),
        };
      });
      const slope =
        byScale.length > 1
          ? slopeOf(byScale.map(({ pages, scale }) => ({ pages, size: scale })))
          : 0;
      const over = byScale.filter(({ cpuMs }) => cpuMs > action.barMs);
      const reasons = [
        ...over.map(
          ({ cpuMs, scale }) =>
            `${cpuMs.toFixed(1)} ms of database time at ${String(scale)}x, over ${String(action.barMs)} ms`,
        ),
        ...(slope > descentSlope
          ? [
              `pages grow with the data: log-log slope ${slope.toFixed(2)} over ${byScale.map(({ pages, scale }) => `${String(pages)} at ${String(scale)}x`).join(", ")}, past the descents' ${descentSlope.toFixed(2)}`,
            ]
          : []),
      ];

      return {
        action: action.name,
        barMs: action.barMs,
        byScale,
        reasons,
        slope,
        verdict: reasons.length === 0 ? "pass" : "fail",
      };
    });
    const pending = composition.pending.map(({ barMs, name, reason }): ActionVerdict => ({
      action: name,
      barMs,
      byScale: [],
      reasons: [`not built: ${reason}`],
      slope: 0,
      verdict: "fail",
    }));

    return [...measured, ...pending];
  });
