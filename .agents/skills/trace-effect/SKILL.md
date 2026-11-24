---
name: trace-effect
description: How qti-pie names spans, annotates them, logs, and keeps failure causes in Effect code, and where tracing stops (qti-pie installs no tracer). Use when adding or changing an effectful operation in crust, plate, pantry, ledger or specimen, or when reviewing one's observability.
---

# Tracing Effect in qti-pie

qti-pie installs no tracer or exporter. Its spans and logs reach a backend only through the host application's
runtime (edullm, metis), so checking export is the host's job; here, check that the span exists and nests.

## Spans

- A reusable operation worth timing is `Effect.fn("<area>.<operation>")`: `xml.read`, `vocab.loadSchema`,
  `cli.replaceWith`. Wrap an existing effect with `Effect.withSpan("<area>.<operation>")`.
- Library internals, small helpers and hot paths are `Effect.fnUntraced`. Unnamed `Effect.fn(function* …)` makes no
  span: a span needs the name string.
- Pass combinators to `Effect.fn` as extra arguments, never `.pipe` on its result.
- Span the owning operation (a database call, a file or network read, a package import, a costly derivation) so every
  caller inherits it. Don't split code to manufacture spans, and don't span glue or plain transformations.
- Wrap the work itself, through to its completion. For a stream, decide whether the span covers acquisition,
  consumption or both.
- No ids, paths or other dynamic values in a span's name. Put safe scalars on the span:
  `yield* Effect.annotateCurrentSpan({ files: input.paths.length, schema: input.schema })`.
- Never record a password, token or package content. Database passwords are `Redacted`; keep them so.
- A parent's duration includes its children, and concurrent children overlap.

## Logs and failures

- `Effect.logDebug` for routine detail, `Effect.log`/`logInfo` for an event that matters, `logWarning` for a recovered
  problem, `logError` for an unexpected failure. Annotate with `Effect.annotateLogs`.
- Log a decision a span can't show: a fallback taken, work skipped, a partial result.
- Log a failure once, at the boundary that turns it into a caller-facing error. Log the error object
  (`Effect.logError(cause)`), never `cause.message`, which drops its tag and fields. A failed span needs no extra log.

## Tests

Add none per span or log line. A test of telemetry is right only for a guarantee: a cause kept at an error boundary,
a secret kept out, context carried across a custom runtime bridge.
