/**
 * How long a command may run: the `--timeout` setting, the errors a run that outlasts it fails
 * with, the bound each handler runs under, and how a command that writes settles a stop
 * that comes once its write has begun.
 *
 * A stop interrupts the handler where it is. Before a command's write begins nothing is written,
 * and the stop is a plain {@link CommandTimedOut}. Once it has begun, a stop never reports a plain
 * timeout: grizzle's README says of an interrupted write "Treat an interrupted write like
 * `commitUnknown`: if its statements had all finished, it may have committed" ("No server-side
 * timeouts"), and of a call error of kind `commitUnknown` "Read back before running it again"
 * ("Errors and outcomes"). So a command
 * records, as its write begins, the {@link Settlement} a stop from then on ends the run with
 * ({@link onStop}): a database write's reads the package back by its name
 * (`#pantry/cli/settle.ts`), and once a target has taken its new content, or the outcome has been
 * printed, it is that outcome ({@link commitPoint}).
 *
 * @see https://github.com/bjornpagen/grizzle/blob/71d2d91b41111cb719715d195d25b5a196040b6f/README.md#L3952-L3953
 * @see https://github.com/bjornpagen/grizzle/blob/71d2d91b41111cb719715d195d25b5a196040b6f/README.md#L3765-L3766
 */
import { Config, Context, Duration, Effect, Exit, Option, Ref, Schema } from "effect";
import type { PlatformError } from "effect";
import { Flag, GlobalFlag } from "effect/cli";
import type { RoundtripDiffers } from "#pantry/cli/errors.ts";

/**
 * The `--timeout` setting: how long a command may run, as a duration such as `30 seconds` or
 * `10 minutes`, or no limit where neither `--timeout` nor `QTI_TIMEOUT` names one. The limit is
 * the operator's choice: a command run by hand stops when its operator stops it, so the command
 * line chooses no limit on its behalf.
 */
const timeoutSetting = GlobalFlag.Setting("timeout")({
  flag: Flag.String("timeout").pipe(
    Flag.withSchema(Schema.DurationFromString),
    Flag.filterMap(
      (given) => (Duration.isPositive(given) ? Option.some(given) : Option.none()),
      (given) => `${Duration.format(given)} is not a positive duration`,
    ),
    Flag.withFallbackConfig(Config.schema(Schema.DurationFromString, "QTI_TIMEOUT")),
    Flag.optional,
    Flag.withMetavar("duration"),
    Flag.withDescription(
      "Stop the command after this long, e.g. '30 seconds' or '10 minutes' [env: QTI_TIMEOUT] [default: no limit]",
    ),
  ),
});

/**
 * The timeout setting, for the root command's `Command.withGlobalFlags`.
 */
export const timeoutGlobalFlags = [timeoutSetting] as const;

/**
 * A command that did not finish inside its `--timeout` and was stopped before its write began, so
 * it wrote nothing: the database and every target are as they were. A stop once a command's write
 * has begun ends the run with the command's {@link Settlement} instead, never with this.
 */
export class CommandTimedOut extends Schema.TaggedError<CommandTimedOut>()("CommandTimedOut", {
  after: Schema.String,
}) {
  /**
   * How long the command had, and that it wrote nothing.
   */
  override get message(): string {
    return `The command did not finish within ${this.after} and was stopped before its write began, so nothing was written.`;
  }
}

/**
 * The commands whose database write a stop can catch begun: each writes a package under its name.
 */
const writeCommands = ["import", "roundtrip"] as const;

/**
 * A command whose database write a stop can catch begun ({@link writeCommands}).
 */
export type WriteCommand = (typeof writeCommands)[number];

/**
 * How a stop's message names each command's run, and how its help says to run it again.
 */
export const writeWords = {
  import: { again: "import the package again", run: "The import" },
  roundtrip: { again: "run the round trip again", run: "The round trip" },
} as const satisfies Readonly<
  Record<WriteCommand, { readonly again: string; readonly run: string }>
>;

/**
 * What reading a package back by its name found after a stop: no package under the name
 * (`absent`), the package stored under it before the write, as it was (`other`), or the package
 * the write wrote (`this`).
 */
const held = ["absent", "other", "this"] as const;

/**
 * A command stopped by its `--timeout` once its database write had begun, whose read-back settled
 * the write: `held` is what reading the package back by its name found. A write whose package is
 * not held did not commit, and nothing was written. An import whose package is held is no failure
 * (it ends as an import that stored it, `#pantry/cli/settle.ts`), so an import's is `absent` or
 * `other`; a round trip's `this` is an import that committed and an export that did not finish.
 */
export class WriteStopped extends Schema.TaggedError<WriteStopped>()("WriteStopped", {
  after: Schema.String,
  command: Schema.Literals(writeCommands),
  held: Schema.Literals(held),
  package: Schema.String,
}) {
  /**
   * What was stopped, when, and what reading the package back found.
   */
  override get message(): string {
    const stopped = `${writeWords[this.command].run} of ${this.package} was stopped after ${this.after}, once its write to the database had begun`;

    if (this.held === "this") {
      return `${stopped}. Reading the database back finds this package stored under ${this.package}, so the write committed${this.command === "roundtrip" ? ", but the export did not finish, and nothing was exported" : ""}.`;
    }

    return `${stopped}. Reading the database back finds ${this.held === "absent" ? `no package stored under ${this.package}` : `the package stored under ${this.package} before it, as it was`}, so the write did not commit.`;
  }
}

/**
 * A command stopped by its `--timeout` once its database write had begun, whose read-back did not
 * settle the write: reading the package back by its name failed, or did not finish within the
 * limit, so the database may hold the package or not. `reason` is why, the read-back's failure as
 * its message says it.
 */
export class WriteUnsettled extends Schema.TaggedError<WriteUnsettled>()("WriteUnsettled", {
  after: Schema.String,
  command: Schema.Literals(writeCommands),
  package: Schema.String,
  reason: Schema.String,
}) {
  /**
   * What was stopped, that its commit is unknown, and why the read-back did not settle it.
   */
  override get message(): string {
    return `${writeWords[this.command].run} of ${this.package} was stopped after ${this.after}, once its write to the database had begun, so the package may or may not be stored: reading it back by its name to see which failed (${this.reason}).`;
  }
}

/**
 * Every failure a {@link Settlement} ends a run with: a write a stop caught begun, settled or not,
 * and the failure of a command's last step, which a stop after that step ends the run with again
 * ({@link commitPoint}): a round trip whose export differs, and a target that could not take its
 * new content.
 */
export type StopError =
  | WriteStopped
  | WriteUnsettled
  | RoundtripDiffers
  | PlatformError.PlatformError;

/**
 * What ends a run that a stop by `--timeout` catches once its write has begun, in place of a plain
 * {@link CommandTimedOut}: it reports the command's outcome and succeeds, or fails with what the
 * write left.
 *
 * @param limit - The run's limit, which bounds any read the settlement makes, so a cluster that
 *   stopped answering cannot hold the run past twice its limit.
 * @returns The run's end.
 */
export type Settlement = (limit: Duration.Duration) => Effect.Effect<void, StopError>;

/**
 * Where a run's handler records the {@link Settlement} a stop from then on ends the run with.
 * {@link withTimeout} gives each run a record of its own; a handler run without it has no bound,
 * so nothing stops it, and what it records goes nowhere.
 */
const StopSettlement = Context.Reference<(settlement: Settlement) => Effect.Effect<void>>(
  "pantry/cli/timeout/StopSettlement",
  { defaultValue: () => () => Effect.void },
);

/**
 * Make a stop by `--timeout` from now on end the run with `settlement`, in place of a plain
 * {@link CommandTimedOut}, until the next record replaces it. A command records one as its write
 * begins, and at each commit point after.
 *
 * A settlement runs once the handler has ended, inside the handler's own {@link withTimeout} and
 * so under all the root gives the handler, its minimum log level among it, which `--quiet` and
 * `--verbose` choose (`#pantry/cli/verbosity.ts`): its log lines are the run's.
 *
 * @param settlement - What a stop from now on ends the run with.
 * @returns Completes once it is recorded.
 */
export const onStop = Effect.fnUntraced(function* onStop(settlement: Settlement) {
  const record = yield* StopSettlement;

  yield* record(settlement);
});

/**
 * Run `step` to its end whatever a stop by `--timeout` does, and make a stop after it end the run
 * as the step ended: with `then` of its value where it succeeded, and with its failure where it
 * failed. A command's commit points are such steps: a target taking its new content, which a stop
 * must not cut in two, and the report of its outcome, which a stop must neither cut short nor run
 * twice ({@link finish}).
 *
 * The step runs uninterruptibly, so it must be short and wait on no network: a stop that comes
 * meanwhile takes effect once it ends, since `Effect.timeoutOrElse` runs its fallback only once the
 * interrupted handler has ended (Effect 4.1.4 `raceAllFirst`, `effect/src/internal/effect.ts:1743`,
 * interrupts and awaits the loser before the race resumes).
 *
 * @param step - The step.
 * @param then - What a stop after the step, where it succeeded, ends the run with.
 * @returns What the step returns, or fails with.
 */
export const commitPoint = <A, E extends StopError, R>(
  step: Effect.Effect<A, E, R>,
  then: (value: A) => Effect.Effect<void, StopError>,
): Effect.Effect<A, E, R> =>
  Effect.uninterruptible(
    Effect.gen(function* commitsStep() {
      const exit = yield* Effect.exit(step);

      yield* onStop(() => (Exit.isSuccess(exit) ? then(exit.value) : Exit.asVoid(exit)));

      return yield* exit;
    }),
  );

/**
 * Report a command's outcome as its last step ({@link commitPoint}), so a stop by `--timeout`
 * neither cuts the report short nor prints it twice: a stop after it ends the run as the report
 * ended.
 *
 * @param report - Prints the outcome, and fails where the outcome is a failure.
 * @returns What the report returns, or fails with.
 */
export const finish = <A, E extends StopError, R>(
  report: Effect.Effect<A, E, R>,
): Effect.Effect<A, E, R> => commitPoint(report, () => Effect.void);

/**
 * Bound a command's handler by the `--timeout` setting: give it to `Effect.fn` after the handler's
 * body, so it bounds every run of the handler.
 *
 * It runs the handler unchanged where the setting names no limit, and otherwise inside
 * `Effect.timeoutOrElse`, with a {@link Settlement} record of the run's own. When the limit passes
 * first the handler is interrupted, and once it has ended the run ends with the settlement the
 * handler last recorded ({@link onStop}), given the limit, or, where it recorded none because its
 * write had not begun, fails with {@link CommandTimedOut}.
 *
 * @param handler - One run of the handler.
 * @returns The run, bounded.
 */
export const withTimeout = <A, E, R>(handler: Effect.Effect<A, E, R>) =>
  Effect.gen(function* bounded() {
    const limit = yield* timeoutSetting;

    if (Option.isNone(limit)) {
      return yield* handler;
    }

    const recorded = yield* Ref.make(Option.none<Settlement>());

    return yield* handler.pipe(
      Effect.provideService(StopSettlement, (settlement) =>
        Ref.set(recorded, Option.some(settlement)),
      ),
      Effect.timeoutOrElse({
        duration: limit.value,
        orElse: () =>
          Effect.gen(function* stopped() {
            const settlement = yield* Ref.get(recorded);

            if (Option.isNone(settlement)) {
              return yield* new CommandTimedOut({ after: Duration.format(limit.value) });
            }

            return yield* settlement.value(limit.value);
          }),
      }),
    );
  }).pipe(Effect.withSpan("cli.withTimeout"));
