---
name: document-code
description: qti-pie's JSDoc conventions - what gets a doc comment, the tags each unit needs, the custom tags lint admits, and how to write down a constraint learned from a specification, upstream source or an experiment. Use when writing or reviewing TypeScript or TSX in qti-pie, and whenever you learn a non-obvious fact the code must keep.
---

# Documenting code in qti-pie

Models to copy: `packages/crust/src/uri.ts` (a module doc citing its specifications), `packages/crust/src/errors.ts`
(error classes), `packages/pantry/src/db/connection.ts` (services and their failures).

## What gets a doc comment

Every module-scope function, component, class, service, enum, namespace, callback type, `const`, and standalone
domain or service type, and every named file-local helper function. A module whose whole is worth explaining opens
with a doc ending in `@module`. A component's local props type stays bare: the component's comment owns its props.

## Form

- Always multiline, even for one sentence; oxfmt rewrites a one-line `/** … */` (`jsdoc.commentLineStrategy`).
- A function opens with a verb ("Build the migration identity's connection…"). A type opens with what it is
  ("A character no XML 1.0 document may hold…", "The parser refused the text because…").
- Say the caller's contract, not the steps of the implementation, in the domain's and the specification's own words.
  A comment that only expands the name is missing.
- `@param` for every argument, each destructured property too (`props`, `props.placeholder`); `@returns` for the
  meaning of the result, omitted for a `void` whose completion means nothing. Never restate TypeScript types.
- An overload set documents each public overload whose contract differs, never the implementation signature.
- `@see {@link https://… | title}` for the specification section, documentation or pinned source a reader would
  otherwise rediscover, on the smallest unit that owns that behavior; `{@link Symbol}` for a related unit. No
  homepage links. `@throws` only for what intentionally escapes; `@example` only for non-obvious public use.

## Custom tags

`jsdoc/check-tag-names` admits only standard tags plus these: `@formatConstant` (a declaration whose numbers are a
format's own: a code table, a type's range, an exit code), and the limit-evidence tags of the indefensible-numbers
skill (`vendor/toolchain/packages/devtools/skills/indefensible-numbers`): `@limitKind`, `@owner`, `@unit`, `@scope`,
`@constraint`, `@source`, `@quote`, `@verified`, `@evidence`, `@observed`, `@environment`, `@workload`, `@result`,
`@decision`, `@revalidate`, `@derivation`, `@from`, `@guards`, `@measure`, `@origin`, `@recorded`. Any other number
that bounds something needs that evidence.

## A learned constraint

When a specification, upstream source, debugging or an experiment shows a fact that decides which implementation is
correct, and the code doesn't make it plain, write it on the smallest unit that owns it:

1. The unit's contract.
2. The governing fact and why it forces this design, as present facts.
3. A `@see` to the specification section or the pinned source.

Never history: no "previously", "this fixes", "after X failed". Translate the story into the invariant it found. Use
an inline comment only when the fact belongs to one statement or to an ordering. Skip it when the code or a lint rule
already says it.
