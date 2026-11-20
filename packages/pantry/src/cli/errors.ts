/**
 * How the program's failures are told apart: the closed roster of kinds a failure may have, the
 * exit code each kind ends the process with, and {@link describeFailure}, which names the kind of
 * any failure a run ends with.
 */
import type { CallError, CallErrorKind } from "@bjornpagen/grizzle";
import { Match, Option, Predicate, Schema } from "effect";
import type { Effect } from "effect";
import { CliError } from "effect/cli";
import { BadName, NotADirectory, TargetNotEmpty, TargetProtected } from "#pantry/cli/args.ts";
import { databaseRefusalOf, refusalFieldsOf } from "#pantry/cli/refused.ts";
import { CommandTimedOut, WriteStopped, WriteUnsettled, writeWords } from "#pantry/cli/timeout.ts";
import type { DatabaseRefusal } from "#pantry/cli/refused.ts";
import type { exportPackage } from "#pantry/export/package.ts";
import type { OverlayConflict } from "#pantry/import/overlays/index.ts";
import type { importPackage } from "#pantry/import/package.ts";

/**
 * Every kind a failure of this program has.
 *
 * - Exit 1, refused or the work failed: `import-refused`, `roundtrip-differs`, `target-not-empty`,
 *   `timeout`, `database`, `not-found`.
 * - Exit 2, the command line is wrong: `cli-usage`, `cli-path-missing`, `cli-bad-argument`.
 * - Exit 70, a defect in qti: `internal`.
 * - Exit 74, reading the package or writing the output failed: `io`.
 * - Exit 78, the local set-up is missing or unreadable: `config`.
 */
export type Kind =
  | "cli-bad-argument"
  | "cli-path-missing"
  | "cli-usage"
  | "config"
  | "database"
  | "import-refused"
  | "internal"
  | "io"
  | "not-found"
  | "roundtrip-differs"
  | "target-not-empty"
  | "timeout";

/**
 * The exit code each kind ends the process with. Interrupts exit 130 and success 0; neither has a
 * kind.
 *
 * @formatConstant The exit statuses of BSD's `sysexits.h` (70 `EX_SOFTWARE`, 74 `EX_IOERR`, 78
 *   `EX_CONFIG`), 2 for a command line its parser refuses, and 1 for any other failure: a code
 *   each kind names, no bound.
 */
export const kindExitCode: Readonly<Record<Kind, number>> = {
  "cli-bad-argument": 2,
  "cli-path-missing": 2,
  "cli-usage": 2,
  config: 78,
  database: 1,
  "import-refused": 1,
  internal: 70,
  io: 74,
  "not-found": 1,
  "roundtrip-differs": 1,
  "target-not-empty": 1,
  timeout: 1,
};

/**
 * What to do next after a failure of each kind, when the failure has no remedy of its own. Every
 * kind has one, so a failure always ends on a next step.
 */
export const kindHelp: Readonly<Record<Kind, string>> = {
  "cli-bad-argument":
    "Check the value against the command's usage: run `qti <command> --help` to see what it accepts.",
  "cli-path-missing":
    "Name the directory of an unzipped QTI package, or its .zip file, that exists.",
  "cli-usage": "Run `qti --help`, or `qti <command> --help`, to see valid usage.",
  config:
    "Start the local database cluster and migrate it, as the project's AGENTS.md describes, then run the command again.",
  database:
    "Check that the local database cluster is running (`pnpm exec toolchain-pg status` in packages/qti-pie/packages/pantry, and `start` there to start it), then run the command again.",
  "import-refused":
    "Fix the package as the message says, then import it again. Nothing was written.",
  internal:
    "This is a defect in qti. Report it with the command you ran and everything it printed.",
  io: "Check that the path exists, is readable or writable, and that the disk has room, then run the command again.",
  "not-found":
    "Use the name the package was imported under (`qti import <dir> <name>`), in the same database, or import the package first.",
  "roundtrip-differs": "Compare the package with its export by hand to see which entries differ.",
  "target-not-empty": "Choose an empty or new target, or pass --yes to replace what is there.",
  timeout: "Run the command again with a larger --timeout.",
};

/**
 * The next step after a stop by `--timeout`, for every stop that leaves nothing written: a longer
 * limit, or a cluster that answers.
 */
const longerLimit =
  "Give --timeout, or QTI_TIMEOUT, a longer limit, or check that the database cluster answers with `pnpm exec toolchain-pg doctor` in packages/qti-pie/packages/pantry";

/**
 * The tags of grizzle's public errors (`adapter/public/errors.ts`), each of kind `database`,
 * written out so the program starts without loading grizzle. `run.test.ts` holds them to grizzle's
 * classes.
 */
const grizzleKinds = {
  CredentialError: "database",
  OpenError: "database",
  TokenError: "database",
} as const satisfies Readonly<Record<string, Kind>>;

/**
 * The tags of grizzle's public errors, {@link grizzleKinds}'s keys.
 */
export const grizzleErrorTags: ReadonlySet<string> = new Set(Object.keys(grizzleKinds));

/**
 * The kind of each of grizzle's call errors, the one failure a workload member's call ends with, a
 * record of a closed `kind` with its `retry` and `message`, by that `kind`: a connection that was
 * not authenticated, a password that could not be read or that the server refused among its
 * reasons, is `config`, the local set-up missing or unreadable; the database's own failures are
 * `database`; and a call qti made wrong, an input the codec refuses, a write outside the role's
 * world, a refusal of a read's parameter, a route or a token no qti program has, is `internal`. A
 * write the schema's laws refuse never reaches the command line as a call error: the import names
 * it (`ImportRefused`). The table is held total over grizzle's `CallErrorKind`, so a kind grizzle
 * adds fails to compile here until it has a kind of this program.
 */
const callErrorKinds = {
  commitUnknown: "database",
  credentialRefused: "config",
  failed: "database",
  input: "internal",
  outsideWorld: "internal",
  paramRejected: "internal",
  refused: "internal",
  route: "internal",
  stale: "database",
  tokenExpired: "internal",
  tokenRefused: "internal",
  transient: "database",
  transport: "database",
  unavailable: "database",
} as const satisfies Readonly<Record<CallErrorKind, Kind>>;

/**
 * The kind of each failure {@link describeFailure} names by its tag alone, without importing the
 * module that defines it, so the program starts without loading grizzle, the layer or the engine:
 * grizzle's public errors are `database` ({@link grizzleKinds}); the layer's three
 * (`db/connection.ts`'s two and `db/served.ts`'s) and Effect's `ConfigError`, which a missing or
 * malformed setting raises, are `config`, the local set-up missing or unreadable; a refused import,
 * an absent package, a media file the media store does not hold, one it could not take, and the
 * file system's failure have a kind each. One of grizzle's errors is another kind by what it
 * carries: a program grizzle refused to compile ({@link isUncompiled}).
 */
const kindByTag = {
  ...grizzleKinds,
  ClusterConfigError: "config",
  ConfigError: "config",
  ImportRefused: "import-refused",
  LocalMemberUnavailable: "config",
  MediaMissing: "not-found",
  MediaUnstored: "io",
  PackageNotFound: "not-found",
  PlatformError: "io",
  ServedLoadError: "config",
} as const satisfies Readonly<Record<string, Kind>>;

/**
 * The tags of the failures {@link kindByTag} gives a kind of their own.
 */
type KindedTag = keyof typeof kindByTag;

/**
 * Test whether a tag is one {@link kindByTag} gives a kind.
 *
 * @param tag - A failure's tag.
 * @returns Whether {@link kindByTag} names it.
 */
const isKindedTag = (tag: string): tag is KindedTag => Object.hasOwn(kindByTag, tag);

/**
 * Whether a failure is one of grizzle's call errors: a record whose `kind` is one of
 * {@link callErrorKinds}, with a `retry` and a `message`, read by its members, so this module
 * loads no grizzle.
 *
 * @param failure - What a run failed with.
 * @returns Whether it is a call error.
 */
const isCallError = (failure: unknown): failure is CallError =>
  Predicate.hasProperty(failure, "kind") &&
  Predicate.isString(failure.kind) &&
  Object.hasOwn(callErrorKinds, failure.kind) &&
  Predicate.hasProperty(failure, "retry") &&
  Predicate.hasProperty(failure, "message") &&
  Predicate.isString(failure.message);

/**
 * The tags of the tagged failures among `E`: every failure but grizzle's call errors, which a run
 * names by their `kind` ({@link callErrorKinds}).
 */
type TagOf<E> = Extract<E, { readonly _tag: string }>["_tag"];

/**
 * Every other failure the export ends with (`#pantry/export/package.ts`): the database holds the
 * package, but the export cannot rebuild a document of it from its rows (`assemble`'s refusals,
 * `DocumentRowCount`) or write it in its charset (crust's `EncodeError`). Each is a defect of qti,
 * never of the package.
 */
export type ExportDefectTag = Exclude<
  TagOf<Effect.Error<ReturnType<typeof exportPackage>>>,
  KindedTag
>;

/**
 * Every other way the import ends (`#pantry/import/package.ts`): the defect it dies with, two
 * builders that disagree on a row. It is a defect of qti, never of the package; the codec refusing
 * a value the builders wrote is grizzle's `input` call error, `internal` by its kind.
 */
export type ImportDefectTag = Exclude<
  TagOf<Effect.Error<ReturnType<typeof importPackage>> | OverlayConflict>,
  KindedTag
>;

/**
 * What to do next after an export that cannot rebuild a package the database holds.
 */
const exportDefectHelp =
  "This is a defect in qti, not in the package: the database holds the package, but the export cannot rebuild it. Nothing was exported, and the target is as it was. Report it with the command you ran and everything it printed.";

/**
 * What to do next after an import that ended on a defect of qti.
 */
const importDefectHelp =
  "This is a defect in qti, not in the package, and nothing was written. Report it with the command you ran and everything it printed.";

/**
 * What to do next after a refusal the database gave, by the kind of its witness: it names the law
 * and where the law is stated, and names the failing row only when its witness holds one, the key
 * grizzle reported.
 */
const databaseRefusalHelp = {
  key: "Find what the law describes in the package, at the row the message names, fix it, then import the package again. Nothing was written.",
  unreported:
    "The database names no row for this law, so find what the law describes in the package by the law's source, fix it, then import the package again. Nothing was written.",
} as const satisfies Readonly<Record<DatabaseRefusal["witness"], string>>;

/**
 * A tag {@link namedFailureOf} names: one of the export's defects or the import's.
 */
type NamedTag = ExportDefectTag | ImportDefectTag;

/**
 * The help of each named failure, by its tag: every export defect's is {@link exportDefectHelp}
 * and every import defect's {@link importDefectHelp}. It is checked against both error unions both
 * ways, so a failure either gains fails to compile here until it is named, and one it loses until
 * its row goes. Each such failure's kind is `internal`, which {@link kindOf} gives any failure no
 * other kind claims, so its exit code is that kind's.
 */
const namedHelp = {
  DocumentRowCount: exportDefectHelp,
  EncodeError: exportDefectHelp,
  OverlayConflict: importDefectHelp,
  RootMissing: exportDefectHelp,
  RowMissing: exportDefectHelp,
  RowsOutsideImage: exportDefectHelp,
} as const satisfies Readonly<Record<NamedTag, string>>;

/**
 * Test whether a tag is one {@link namedHelp} names.
 *
 * @param tag - A failure's tag.
 * @returns Whether it is a named failure's.
 */
const isNamedTag = (tag: string): tag is NamedTag => Object.hasOwn(namedHelp, tag);

/**
 * A round trip whose export differs from its source in at least one entry.
 */
export class RoundtripDiffers extends Schema.TaggedError<RoundtripDiffers>()("RoundtripDiffers", {
  differing: Schema.Number,
  exportDir: Schema.String,
}) {
  /**
   * How many entries differ and where the export is, for comparing by hand.
   */
  override get message(): string {
    return `${this.differing} entries differ between the package and its export in ${this.exportDir}.`;
  }
}

/**
 * Every error this program defines: the command line's (`#pantry/cli/args.ts`), a round trip's
 * that differs, and a stop by `--timeout`'s (`#pantry/cli/timeout.ts`). {@link describeFailure}
 * decodes a failure as one of them first.
 */
const OwnErrors = Schema.Union([
  BadName,
  CommandTimedOut,
  NotADirectory,
  RoundtripDiffers,
  TargetNotEmpty,
  TargetProtected,
  WriteStopped,
  WriteUnsettled,
]);

/**
 * An error this program defines ({@link OwnErrors}).
 */
type OwnError = typeof OwnErrors.Type;

/**
 * Test whether a failure is an error this program defines, an instance of one of its classes.
 */
const isOwnError = Schema.is(OwnErrors);

/**
 * The kind of each error this program defines, by its tag: a name the person gave that is no
 * package's (`BadName`) or a target no command replaces (`TargetProtected`) is
 * `cli-bad-argument`; a path that is neither a directory nor a `.zip` file is `cli-path-missing`; a
 * target with something in it is `target-not-empty`; a round trip whose export differs is
 * `roundtrip-differs`; and a stop by `--timeout`, before a write began or once it had, settled or
 * not, is `timeout`. It is held total over {@link OwnError}'s tags, so an error the program gains
 * fails to compile here until it has a kind.
 */
const ownKinds = {
  BadName: "cli-bad-argument",
  CommandTimedOut: "timeout",
  NotADirectory: "cli-path-missing",
  RoundtripDiffers: "roundtrip-differs",
  TargetNotEmpty: "target-not-empty",
  TargetProtected: "cli-bad-argument",
  WriteStopped: "timeout",
  WriteUnsettled: "timeout",
} as const satisfies Readonly<Record<OwnError["_tag"], Kind>>;

/**
 * What to do next after an error this program defines, from its tag and its fields: one handler
 * per tag of {@link OwnError}, so an error the program gains fails to compile here until it has its
 * next step.
 *
 * @param error - The error.
 * @returns What to do next.
 */
const ownHelpOf = (error: OwnError): string =>
  Match.valueTags(error, {
    BadName: () =>
      "Name the package with letters, digits, '-', '_' and '.', starting with a letter or '_'; to export, use the name it was imported under.",
    CommandTimedOut: () => `${longerLimit}.`,
    NotADirectory: () => "Name the directory of an unzipped QTI package, or its .zip file.",
    RoundtripDiffers: ({ exportDir }) =>
      `Run \`diff -r <dir> ${exportDir}\`, with the package you named for <dir>, to see which entries differ.`,
    TargetNotEmpty: () => "Pass --yes to replace it, or name a new or empty directory.",
    TargetProtected: () => "Name a new or empty directory instead, even with --yes.",
    WriteStopped: ({ command, held }) =>
      held === "this"
        ? `The package is stored. Give --timeout, or QTI_TIMEOUT, a longer limit, then ${writeWords[command].again}: the same package imported again under its name is unchanged.`
        : `Nothing was written. ${longerLimit}, then ${writeWords[command].again}.`,
    WriteUnsettled: ({ command, package: name }) =>
      `Check that the database cluster answers (\`pnpm exec toolchain-pg doctor\` in packages/qti-pie/packages/pantry), then look for the package by its name (\`qti export --dry-run <dir> ${name}\`) before you ${writeWords[command].again}: the same package imported again under its name is unchanged, never a second copy.`,
  });

/**
 * What kind a failure is, the exit code that kind ends the process with, and what to do next.
 */
export interface FailureDescription {
  readonly exitCode: number;
  readonly help: string;
  readonly kind: Kind;
}

/**
 * The `_tag` of a failure, none when it carries no string one.
 */
const tagOf = (failure: unknown): Option.Option<string> =>
  Predicate.hasProperty(failure, "_tag") && Predicate.isString(failure._tag)
    ? Option.some(failure._tag)
    : Option.none();

/**
 * The tag of a failure qti can name though its kind is `internal`: one of the export's defects or
 * the import's, which a run prints by that tag and with the help of its own.
 *
 * @param failure - What a run failed or died with.
 * @returns The failure's tag, or none for any other failure.
 */
export const namedFailureOf = (failure: unknown): Option.Option<NamedTag> =>
  Option.filter(tagOf(failure), isNamedTag);

/**
 * Whether `failure` is grizzle refusing one of qti's programs as uncompiled, before any SQL is
 * sent: an `OpenError` (the served file `DbLayer.make` loads and the role `Db.open` opens) whose
 * `reason` is a `CompileError`, such as a program outside the
 * login's served workload, which a served `Db` refuses. The cause is qti's schema or program, the
 * same for every package, so retrying or checking the cluster cannot help.
 * It is matched by tag, so this module imports neither grizzle nor its engine.
 */
const isUncompiled = (failure: unknown): boolean =>
  Option.exists(tagOf(failure), (tag) => tag === "OpenError") &&
  Predicate.hasProperty(failure, "reason") &&
  Option.contains(tagOf(failure.reason), "CompileError");

/**
 * What to do next after grizzle refused to compile one of qti's programs ({@link isUncompiled}).
 */
const uncompiledHelp =
  "This is a defect in qti, not in the package or the database: grizzle refused to compile qti's program before sending any SQL, so the database is as it was. Report it with the command you ran and everything it printed.";

/**
 * What to do next after the media store failed a package's media (`#pantry/package/media.ts`): an
 * export that met a digest the store does not hold, and an import whose media bytes the store
 * could not take, by the failure's tag. Their kinds, `not-found` and `io`, are {@link kindByTag}'s,
 * whose help speaks of packages and paths.
 */
const mediaHelp = {
  MediaMissing:
    "The database names a media file the local media store does not hold, so the export cannot write it, and nothing was exported. Set QTI_PIE_MEDIA to the store the package was imported into, or import the package again from its source into this store, then export it again.",
  MediaUnstored:
    "Check that the local media store's folder (QTI_PIE_MEDIA, else ~/.local/var/qti-pie/media-store) is writable and the disk has room, then import the package again. Nothing was written to the database.",
} as const satisfies Readonly<Partial<Record<KindedTag, string>>>;

/**
 * Test whether a tag is one {@link mediaHelp} names.
 *
 * @param tag - A failure's tag.
 * @returns Whether it is a media failure's.
 */
const isMediaTag = (tag: string): tag is keyof typeof mediaHelp => Object.hasOwn(mediaHelp, tag);

/**
 * What {@link describeFailure} reads, once, of a failure that is none of this program's own
 * errors: its tag; whether it is one of Effect's CLI usage errors; a call error's kind; whether it
 * is grizzle refusing to compile one of qti's programs ({@link isUncompiled}); and the witness of a
 * refusal the database gave. Each is read by its own predicate or decoder, and a run can fail with
 * any value, so any of them may hold together.
 */
interface ReadFailure {
  readonly call: Option.Option<CallErrorKind>;
  readonly refusal: Option.Option<DatabaseRefusal["witness"]>;
  readonly tag: Option.Option<string>;
  readonly uncompiled: boolean;
  readonly usage: boolean;
}

/**
 * Read a failure that is none of this program's own errors, once ({@link ReadFailure}).
 *
 * @param failure - What a run failed with.
 * @returns What {@link kindOf} and {@link helpOf} read of it.
 */
const readOf = (failure: unknown): ReadFailure => ({
  call: isCallError(failure) ? Option.some(failure.kind) : Option.none(),
  refusal: Option.map(
    Option.flatMap(refusalFieldsOf(failure), databaseRefusalOf),
    ({ witness }) => witness,
  ),
  tag: tagOf(failure),
  uncompiled: isUncompiled(failure),
  usage: CliError.isCliError(failure),
});

/**
 * Name the kind of a failure by what it is: a CLI usage error, one of grizzle's call errors by its
 * `kind`, one of grizzle's errors that is another kind by what it carries, else the kind its tag
 * has in {@link kindByTag}, else `internal`.
 *
 * @param read - What the failure is.
 * @returns Its kind.
 */
const kindOf = (read: ReadFailure): Kind => {
  if (read.usage) {
    return "cli-usage";
  }

  if (Option.isSome(read.call)) {
    return callErrorKinds[read.call.value];
  }

  if (read.uncompiled) {
    return "internal";
  }

  return Option.match(read.tag.pipe(Option.filter(isKindedTag)), {
    onNone: (): Kind => "internal",
    onSome: (tag) => kindByTag[tag],
  });
};

/**
 * What to do next: for a named failure (`namedFailureOf`) the help of its own; for a program
 * grizzle refused to compile (`isUncompiled`), that a defect of qti left the database as it was;
 * for a media failure, the store's ({@link mediaHelp}); for a refusal the database gave, the help
 * of a law's refusal by the kind of its witness; else the help of its kind.
 *
 * @param read - What the failure is.
 * @param kind - Its kind.
 * @returns What to do next.
 */
const helpOf = (read: ReadFailure, kind: Kind): string => {
  const named = read.tag.pipe(
    Option.filter(isNamedTag),
    Option.map((tag) => namedHelp[tag]),
  );
  if (Option.isSome(named)) {
    return named.value;
  }

  if (read.uncompiled) {
    return uncompiledHelp;
  }

  const media = read.tag.pipe(
    Option.filter(isMediaTag),
    Option.map((tag) => mediaHelp[tag]),
  );
  if (Option.isSome(media)) {
    return media.value;
  }

  return Option.match(read.refusal, {
    onNone: () => kindHelp[kind],
    onSome: (witness) => databaseRefusalHelp[witness],
  });
};

/**
 * The kind of a failure, the exit code of that kind, and what to do next.
 *
 * The failure is decoded once. An error this program defines ({@link OwnError}) has its tag's kind
 * ({@link ownKinds}) and its next step from its tag and fields ({@link ownHelpOf}). Every other
 * failure is read once ({@link readOf}) and mapped by what it is, without importing the module that
 * defines it, so the program starts without loading the engine: Effect's CLI errors are
 * `cli-usage`, an `ImportRefused` is `import-refused`, a `PackageNotFound` and a `MediaMissing` are
 * `not-found`, a `MediaUnstored` and a `PlatformError` are `io`, a missing or unreadable local
 * set-up is `config`, a program grizzle refused to compile before sending any SQL is `internal`, a
 * call error is its kind's ({@link callErrorKinds}), and grizzle's other errors are `database`.
 * Anything else, a defect included, is `internal`; the export's and the import's defects that
 * {@link namedFailureOf} names keep that kind, with a help of their own.
 *
 * @param failure - What a run failed with: the squashed cause of its exit.
 * @returns The kind, the exit code of that kind, and what to do next.
 */
export const describeFailure = (failure: unknown): FailureDescription => {
  if (isOwnError(failure)) {
    const kind = ownKinds[failure._tag];

    return { exitCode: kindExitCode[kind], help: ownHelpOf(failure), kind };
  }

  const read = readOf(failure);
  const kind = kindOf(read);

  return { exitCode: kindExitCode[kind], help: helpOf(read, kind), kind };
};
