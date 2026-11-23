---
name: conventional-commits
description: How qti-pie's commits are cut and worded - one story per commit, a conventional type with the package as scope, and a subject that states what is now true. Use when committing in qti-pie or splitting work into commits.
---

# Commits in qti-pie

Commits are made with jj (the jj-lanes skill). Read `jj log` for the house style; recent subjects are the examples.

## The message

`<type>(<scope>): <what is now true>`

- Scope is the package or area: `plate`, `pantry`, `crust`, `ledger`, `specimen`, `tools`, `lint`.
- The subject states the behavior the commit makes true, as a fact, in the domain's words:
  `feat(plate): a Text Entry marked plate-digits takes digits alone and asks for the number keyboard`,
  `fix(pantry): scripts/db.sh runs grizzle's own bin, so a migration starts no pnpm`. Never `update`, `cleanup` or
  `misc`.
- The type is the most specific true one: `feat` new behavior or API, `fix` a wrong behavior, `refactor` the same
  behavior in a new shape, `perf` measured speed, `test` tests or test support alone, `docs`, `build`, `ci`,
  `chore` tooling, config, dependencies or generated metadata, `revert`.
- A body only for what the diff can't say: why this boundary, what was left out, which trade-off, what proved it.
  Report a check as passed only when it ran and passed.

## One story per commit

- Each commit is one complete change that leaves the repository working, however many files it touches. Keep a fix
  with the test that proves it.
- Split unrelated concerns, tooling or config from behavior, and an API from its first use when each stands alone.
- Leave out scratch, demos and generated churn unless asked to keep them.

```bash
jj diff --stat                              # the whole change first
jj split -m "<message>" <paths>             # the listed paths become the first commit, the rest stays in @
jj describe -m "<message>" && jj new        # or: name what is left and start the next change
```

`jj split` without paths opens an editor, which doesn't work here. To split hunks inside one file, make and commit one
story's edit before starting the next.

Push only when asked, and to the remote the task names.
