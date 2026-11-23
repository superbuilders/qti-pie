---
name: effect-design
description: qti-pie's own rules for Effect code - the check for an existing Effect, grizzle or platform API before writing glue, what a module a page loads may import from effect, and the house rulings Effect's guide doesn't make. Use when writing or reviewing Effect code in crust, plate, pantry, ledger or specimen; Effect's installed guide owns structure and style.
---

# Effect in qti-pie

Effect is 4.1.4, one copy in the workspace. Its guide is `node_modules/effect/AGENTS.md` in the package you change,
with the `ai-docs` examples it links (follow a `fixtures` directory there for directory roles and code shape). For an
API the guide doesn't cover, read `node_modules/effect/src` at that version. Where this file and the guide disagree on
Effect style, the guide wins.

## Before writing glue

An `Effect.sync`, `Effect.try`, `Effect.promise` or `Effect.tryPromise` integrates an API; it doesn't show the
operation is missing. Before writing one:

1. State the contract: input, output, failures, limits, lifecycle.
2. Look for it in the installed Effect module and its neighbors, `@effect/platform-node`, grizzle (its skill,
   `.agents/skills/grizzle/SKILL.md`, and its README), and the Node or browser API.
3. Use the API that meets the contract, keeping streaming limits, cancellation, the error channel and resource
   lifetime.
4. If glue remains, name the API you checked and the requirement it misses, in the code's doc and in your report.

A pull stream: consume each element's nested content before advancing. Collecting handles to read later drops it.

## Rulings

- Files and directories are kebab-case (`api.ts`, `users.ts`), where Effect's fixtures use PascalCase.
- Generator functions passed to `Effect.gen` are named. No try/catch (`workspace/no-built-in-try-catch`); errors go in
  the error channel.
- `Effect.fn("name")` for an operation worth a span, `Effect.fnUntraced` for library internals and hot paths
  (trace-effect).
- Inside a generator, a plain `if`, `??` or ternary is right for a value check when a combinator would add no typed
  failure, resource, span or dependency.
- Settings come from Effect `Config`; tests supply them with `ConfigProvider.fromUnknown`.
- Every module a page loads (any `"use client"` module of plate, and everything it imports at run time) takes only
  `Array`, `Data`, `Option`, `Result` and `pipe` from `effect`: no `Schema`, no runtime, no `Brand`. Type imports are
  free. Lint holds it over the closure that `tools/module-graph.ts` derives, so a module joins the list by being
  imported. Its errors are `Data.TaggedError`.
- Functions an author calls stay callable from plain, non-Effect code.
- Caller-facing errors follow the error-messages skill.
