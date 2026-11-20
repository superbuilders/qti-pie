/**
 * `openAdmitted`, the host's one entry from the bytes of a document the database admitted to its
 * verdict: parse, then judge with `checkAdmitted`.
 *
 * The database is the only judge of a document's validity (pantry's laws), so a host opens only
 * what admission accepted, and plate runs no rule of QTI's. It reads the bytes with the shared
 * reader's adapter and judges the source with `checkAdmitted`, whose securing and URL checks secure
 * an item by the XSD tables before it is built. Its verdict is the one way a host reaches an
 * `Accepted`. It stays server-side: the reader is crust's.
 *
 * @module
 */
import { Effect } from "effect";
import { readSource } from "#plate/document/read.ts";
import { tables } from "#plate/validate/tables.ts";
import { checkAdmitted } from "#plate/validate/verdict.ts";
import type { Verdict } from "#plate/validate/verdict.ts";

/**
 * Open a document the database admitted: read its bytes into the source view, then judge it with
 * `checkAdmitted` under the `plate.check` span, which carries the document's location, and the
 * verdict's kind and verdict once the judgement returns (never anything the document holds).
 *
 * Its verdict accepts the document or leaves it `unchecked`. Bytes the reader cannot build a tree
 * from, or a document outside admission's contract, the database refused, so meeting either is a
 * defect: the effect dies with it.
 *
 * @param location The document's location as the host named it, which the verdict carries as
 *   `document`.
 * @param bytes The document as read from the database.
 * @returns The verdict on the document.
 */
export const openAdmitted = Effect.fn("plate.openAdmitted")(function* openAdmitted(
  location: string,
  bytes: Uint8Array,
): Effect.fn.Return<Verdict> {
  yield* Effect.annotateCurrentSpan("document.location", location);

  const source = yield* Effect.orDie(readSource(location, bytes));
  const verdict = yield* Effect.sync(() => checkAdmitted(source, tables)).pipe(
    Effect.tap((judged) =>
      Effect.annotateCurrentSpan({
        "document.kind": judged.kind,
        "document.verdict": judged.verdict,
      }),
    ),
    Effect.withSpan("plate.check", { attributes: { "document.location": location } }),
  );

  yield* Effect.annotateCurrentSpan("document.verdict", verdict.verdict);
  yield* Effect.annotateCurrentSpan("document.kind", verdict.kind);

  return verdict;
});
