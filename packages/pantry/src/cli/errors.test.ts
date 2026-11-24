import { CompileError } from "@bjornpagen/grizzle";
import { OpenError, TokenRefused } from "@bjornpagen/grizzle/runtime";
import type { CallError } from "@bjornpagen/grizzle/runtime";
import { assert, describe, it } from "@effect/vitest";
import { Config, ConfigProvider, Effect, Option, Result } from "effect";
import {
  describeFailure,
  kindExitCode,
  kindHelp,
  namedFailureOf,
  RoundtripDiffers,
} from "#pantry/cli/errors.ts";
import type { ImportDefectTag } from "#pantry/cli/errors.ts";
import { refusalFieldsOf } from "#pantry/cli/refused.ts";
import { ClusterConfigError } from "#pantry/db/connection.ts";
import { ServedLoadError } from "#pantry/db/served.ts";
import { PackageNotFound } from "#pantry/export/package.ts";
import { WitnessKind } from "#pantry/package/refusal-origin.ts";

/**
 * What a failure is, without its help: the kind and the exit code.
 */
const identity = (failure: unknown) => {
  const { exitCode, kind } = describeFailure(failure);

  return { exitCode, kind };
};

const config = { exitCode: 78, kind: "config" };

const database = { exitCode: 1, kind: "database" };

const internal = { exitCode: 70, kind: "internal" };

describe("describeFailure, the local set-up", () => {
  it("a ClusterConfigError exits 78 as config", () => {
    const failure = new ClusterConfigError({ path: "/server/tls/ca.crt" });

    assert.deepStrictEqual(identity(failure), config);
  });

  it("a ServedLoadError exits 78 as config", () => {
    const failure = new ServedLoadError({
      path: "/served/author_app.json",
      reason: "pointer file",
    });

    assert.deepStrictEqual(identity(failure), config);
  });

  it.effect("Effect's ConfigError exits 78 as config", () =>
    Effect.gen(function* configError() {
      const result = yield* Effect.gen(function* readHome() {
        return yield* Config.String("HOME");
      }).pipe(Effect.provide(ConfigProvider.layer(ConfigProvider.fromUnknown({}))), Effect.result);

      assert.isTrue(Result.isFailure(result));

      if (Result.isFailure(result)) {
        assert.deepStrictEqual(identity(result.failure), config);
      }
    }),
  );
});

/**
 * One of grizzle's call errors of every kind but `refused`, each the failure a workload member's
 * call ends with, by the kind a run names it: a connection that was not authenticated `config`, the
 * database's own failures `database`, and a call qti made wrong `internal`. A `refused` one names
 * laws by the ids a compiled schema gives them, and the import names every write's refusal
 * (`ImportRefused`) before it reaches a run.
 */
const callErrors: readonly (readonly [
  CallError,
  typeof config | typeof database | typeof internal,
])[] = [
  [{ kind: "commitUnknown", message: "no answer to COMMIT", retry: "never" }, database],
  [
    {
      kind: "credentialRefused",
      message: "the password could not be read",
      reason: "passwordFailed",
      retry: "never",
    },
    config,
  ],
  [{ kind: "failed", message: "the server refused the statement", retry: "never" }, database],
  [{ kind: "input", message: "a value the codec refuses", retry: "never" }, internal],
  [
    { kind: "outsideWorld", message: "outside the role", relation: "Node", retry: "never" },
    internal,
  ],
  [
    {
      kind: "paramRejected",
      message: "the value of parameter slug is outside its pattern",
      param: { kind: "scalar", name: "slug" },
      retry: "never",
    },
    internal,
  ],
  [{ kind: "route", message: "no such program", retry: "never" }, internal],
  [{ kind: "stale", message: "the database is migrating", retry: "never" }, database],
  [{ kind: "tokenExpired", message: "the token expired", retry: "safe" }, internal],
  [{ kind: "tokenRefused", message: "no token", retry: "never" }, internal],
  [
    {
      kind: "transient",
      message: "could not serialize access",
      reason: "SerializationFailure",
      retry: "safe",
    },
    database,
  ],
  [{ kind: "transport", message: "the connection was lost", retry: "safe" }, database],
  [
    {
      kind: "unavailable",
      message: "no session could be opened",
      reason: { kind: "connectionRefused" },
      retry: "safe",
    },
    database,
  ],
];

describe("describeFailure, a call's failure", () => {
  it("each of grizzle's call errors exits as its kind: an unauthenticated connection as config, the database's as database, a call qti made wrong as internal", () => {
    // Oracle: the specification as a checker, grizzle's classification of a call's failures
    // (each kind's meaning, live/events.ts callErrors), one case of every kind. Bound: every
    // kind but `refused`, exhausted; residual `refused`, held by `callErrorKinds`' type.
    for (const [failure, described] of callErrors) {
      assert.deepStrictEqual(identity(failure), described, failure.kind);
    }
  });
});

describe("describeFailure, what to do next", () => {
  it("every kind has a non-empty help", () => {
    assert.sameMembers(Object.keys(kindHelp), Object.keys(kindExitCode));

    for (const help of Object.values(kindHelp)) {
      assert.isAbove(help.length, 0);
    }
  });

  it("a transient call error says the attempt changed nothing and to run the command again, never to check the server", () => {
    // Oracle: grizzle's meaning of `transient` (adapter/errors/failures.ts TransientReason: a
    // concurrent transaction's work met the attempt, which changed nothing). Bound: the one kind
    // whose help is its own among the database's; every other keeps its kind's.
    const { help } = describeFailure({
      kind: "transient",
      message: "could not serialize access",
      reason: "SerializationFailure",
      retry: "safe",
    });

    assert.include(help, "changed nothing");
    assert.include(help, "Run the command again");
    assert.notInclude(help, "systemctl");
  });

  it("a commitUnknown call error says to read back what was written before running it again, never to run it again alone", () => {
    // Oracle: grizzle's README on `commitUnknown`, "Read back before running it again" (Errors and
    // outcomes): the COMMIT got no answer, so it may have committed. Bound: the one call kind whose
    // remedy is a read first.
    const { help } = describeFailure({
      kind: "commitUnknown",
      message: "no answer to COMMIT",
      retry: "never",
    });

    assert.include(help, "Read back what you wrote before running it again");
    assert.notInclude(help, "Run the command again");
    assert.notInclude(help, "systemctl");
  });

  it("a RoundtripDiffers names the diff to run", () => {
    const failure = new RoundtripDiffers({ differing: 2, exportDir: "work/export/pkg" });

    assert.include(describeFailure(failure).help, "diff -r");
  });
});

describe("describeFailure, a name no package has", () => {
  it("a PackageNotFound exits 1 as not-found, with the help of its kind", () => {
    const failure = new PackageNotFound({ package: "MANIFEST-1" });

    assert.deepStrictEqual(identity(failure), { exitCode: 1, kind: "not-found" });
    assert.strictEqual(describeFailure(failure).help, kindHelp["not-found"]);
  });
});

/**
 * One failure of every tag the import ends with on a defect of qti: the one the importer dies
 * with, keyed by the import's tags, so a tag the import gains or loses fails to compile here until
 * its case is written or deleted. It is matched by
 * its tag alone, which `errors.ts` checks against its class by type, so it is written as its tag
 * here: the module that defines it loads the composed grammar, which this file does not need.
 */
const importDefects = {
  OverlayConflict: { _tag: "OverlayConflict" },
} as const satisfies { readonly [K in ImportDefectTag]: { readonly _tag: K } };

/**
 * Failures that carry no string tag, so nothing names them: nothing at all, a primitive, an object
 * with no tag, and objects whose tag is a number or an object that spells a named tag when
 * coerced, which a lookup by property key would read as that tag.
 */
const untagged: readonly unknown[] = [
  null,
  undefined,
  "OverlayConflict",
  70,
  {},
  { _tag: 70 },
  { _tag: { toString: () => "OverlayConflict" } },
];

describe("describeFailure, the defects qti names", () => {
  it("each of the import's defects exits 70 as internal, named, with a help that says nothing was written", () => {
    for (const failure of Object.values(importDefects)) {
      const { exitCode, help, kind } = describeFailure(failure);

      assert.deepStrictEqual({ exitCode, kind }, { exitCode: 70, kind: "internal" }, failure._tag);
      assert.include(help, "nothing was written", failure._tag);
      assert.notInclude(help, "trace", failure._tag);
      assert.deepStrictEqual(namedFailureOf(failure), Option.some(failure._tag));
    }
  });

  it("a failure with no string tag is named by nothing, and exits 70 as internal with that kind's help", () => {
    for (const failure of untagged) {
      assert.deepStrictEqual(
        describeFailure(failure),
        { exitCode: 70, help: kindHelp.internal, kind: "internal" },
        String(failure),
      );
      assert.isTrue(Option.isNone(namedFailureOf(failure)), String(failure));
    }
  });
});

/**
 * Grizzle's refusal to compile the import's ChangeSet, as `db.apply` reported it on the migrated
 * schema before R87: the write filler's `UnsupportedOperation` for an owner-axis copy of a column
 * the owner fills only after its members.
 */
const uncompiled = CompileError.make({
  _tag: "UnsupportedOperation",
  at: { label: "ChangeSet.insert", path: [], site: undefined },
  capability:
    "BranchResolution.instanceEnd copies Instance's end along the owner axis of Instance.rules, a column its owner fills only after its members",
});

describe("describeFailure, a program grizzle refused to compile", () => {
  it("an OpenError carrying a CompileError exits 70 as internal, with a help that blames qti and keeps the database", () => {
    // Oracle: the failure's carrier and its reason's tag, read from its fields: grizzle refused
    // the program before any SQL, so neither the package nor the cluster is at fault, and the
    // database holds what it held. Bound: both carriers of a CompileError, and each carrier with a
    // reason of another tag, exhausted; residual none.
    for (const failure of [new OpenError({ reason: uncompiled })]) {
      const { exitCode, help, kind } = describeFailure(failure);

      assert.deepStrictEqual({ exitCode, kind }, { exitCode: 70, kind: "internal" }, failure._tag);
      assert.include(help, "a defect in qti, not in the package or the database", failure._tag);
      assert.include(help, "before sending any SQL, so the database is as it was", failure._tag);
      assert.notInclude(help, "cluster", failure._tag);
      assert.isTrue(Option.isNone(namedFailureOf(failure)), failure._tag);
    }

    assert.deepStrictEqual(
      identity(new OpenError({ reason: new TokenRefused({ cause: new Error("refused") }) })),
      database,
    );
  });
});

/**
 * One law a database refusal names, as the refusal carries it: AL1's admission check.
 */
const refusedLaw = {
  name: "AL1 admission",
  rule: "attribute-admission",
  text: "check AL1_admission",
};

describe("describeFailure, a refused import", () => {
  // A refusal is matched by its tag and fields, so it is written as them here: `refusal.ts`, which
  // defines its class, loads the composed grammar.
  it("a refusal the database gave says where to look by the kind of its witness", () => {
    // Oracle: the witness kind the refusal's origin carries, read from its field and never from
    // its detail: a key is named in the message, an unreported witness names none, and an
    // unreproduced one names none and says a concurrent write changed the row. Bound: every kind
    // of `WitnessKind`, exhausted; residual none.
    for (const witness of WitnessKind.literals) {
      const { exitCode, help, kind } = describeFailure({
        _tag: "ImportRefused",
        detail: "x",
        origin: { _tag: "Database", kind: "every", laws: [refusedLaw], sources: ["AL1"], witness },
        rules: ["attribute-admission"],
      });
      const named = witness === "key";

      assert.deepStrictEqual({ exitCode, kind }, { exitCode: 1, kind: "import-refused" });
      assert.notStrictEqual(help, kindHelp["import-refused"]);
      assert.strictEqual(help.includes("at the row the message names"), named, witness);
      assert.strictEqual(help.includes("The database names no row for this law"), !named, witness);
      assert.strictEqual(
        help.includes("another write committed beside this one"),
        witness === "unreproduced",
        witness,
      );
      assert.include(help, "Nothing was written.");
    }
  });

  it("a database origin without all of its decision, laws, sources and witness is no refusal's", () => {
    // Oracle: the origin's shape, one case that carries the four facts together or the reader's
    // that carries none: an origin that lacks any of them, or holds no law, is not a refusal the
    // command line reads, and keeps the help of the import-refused kind; one with no source, where
    // the law table holds none of its laws, is one. Bound: every subset of the four facts,
    // exhausted, and each list empty; residual none.
    const whole = { kind: "some", laws: [refusedLaw], sources: ["AL1"], witness: "key" };
    const facts = ["kind", "laws", "sources", "witness"] as const;
    const subsets: (readonly (typeof facts)[number][])[] = [[]];
    for (const fact of facts) {
      subsets.push(...subsets.map((subset) => [...subset, fact]));
    }

    const partial = subsets.map((subset) =>
      Object.fromEntries(subset.map((fact) => [fact, whole[fact]])),
    );

    assert.strictEqual(partial.length, 2 ** facts.length);
    for (const origin of [...partial, { ...whole, laws: [] }, { ...whole, sources: [] }]) {
      const refused = {
        _tag: "ImportRefused",
        detail: "x",
        origin: { _tag: "Database", ...origin },
        rules: ["attribute-admission"],
      };
      const reads = Option.isSome(refusalFieldsOf(refused));
      const carriesAll =
        facts.every((fact) => fact in origin) && [origin["laws"]].flat().length > 0;

      assert.strictEqual(reads, carriesAll, JSON.stringify(origin));
      assert.strictEqual(
        describeFailure(refused).help === kindHelp["import-refused"],
        !carriesAll,
        JSON.stringify(origin),
      );
    }
  });
});
