---
name: error-messages
description: How qti-pie writes failures - tagged error classes whose message names what failed and the repair, the CLI's kinds and exit codes, render-time defects, and the learner-facing text in plate's message catalog. Use when adding or reviewing an error class, a refusal, a CLI failure, or text that tells a child or an author something went wrong.
---

# Error messages in qti-pie

## Error classes

- Every failure is a tagged class, constructed with `new`: `Schema.TaggedError` in pantry, ledger and plate's server
  modules, `Data.TaggedError` in crust, specimen and every module a page loads. No bare `Error` in plate
  (`workspace/no-bare-error`).
- The class carries the facts as fields; its `override get message()` builds the text from them. Callers branch on
  `_tag` and the fields, never on the text.
- The message says what failed, naming the thing (the file, the setting, the role, the command, the element and the
  rule it breaks), then the repair a reader can do now. The model is `packages/pantry/src/db/connection.ts`:

  ```ts
  override get message(): string {
    return `Cannot read the database's CA certificate at ${this.path}, the file QTI_PIE_PG_CA names. Set QTI_PIE_PG_CA to a readable PEM file: the shared server's CA, or the certificate bundle of the server's RDS region.`;
  }
  ```

- A refusal of input by a specification names its rule as a closed union field (`rule: "decode" | "nul" | …`), a
  `detail` of what in the input broke it, and its position where it has one (`ReaderRefusal` in
  `packages/crust/src/errors.ts`). The class's doc quotes the specification's words for each rule.
- Offer "run it again" only where running again can succeed. Say what was kept or written when the reader would
  otherwise wonder ("Nothing was written.").

## Defects

A defect is a bug in the caller's composition, never in the input. plate's (`packages/plate/src/ui/defects.ts`) are
thrown while rendering, so React's nearest error boundary shows them to the developer, each a fixed message of what
was called outside what and what to wrap it in: `"useResponse needs an enclosing <Responses>; render the item inside
one."`.

## The command line

pantry's CLI (`packages/pantry/src/cli/errors.ts`) gives every failure a `Kind` from a closed roster, an exit code by
kind (1 refused or failed, 2 the command line is wrong, 70 a defect in qti, 74 I/O, 78 the local set-up) and a next
step from `kindHelp` when the failure has no remedy of its own, so every failure ends on one. A new failure gets a
kind there. Under `--json` it prints one error object (`kind`, `exit_code`, `message`, `help`, and the failure's
facts).

## Text a child reads

plate writes no learner text inline. Each message is a key in its area's file under `packages/plate/src/messages/`
(`mediaNoPlaysLeft: "No plays left."`), with `{n}` for numbers; `#plate/messages.ts` composes the catalog by locale.
The reader is a child: short words and a next step they can take ("This picture didn't load. Tell your teacher.").
