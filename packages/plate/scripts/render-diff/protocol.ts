/**
 * What the render diff's driver (`scripts/render-diff.ts`) and its workers
 * (`scripts/render-diff/worker.ts`) pass each other: the modes every item is rendered in, one
 * shard's work, and what the shard rendered.
 *
 * @module
 */
import { Schema } from "effect";
import { DocumentSchema } from "#scripts/render-diff/inputs.ts";
import type { Source } from "#scripts/render-diff/inputs.ts";

/**
 * The states every accepted item is rendered in, one output each, in this order:
 *
 * - `answering`: `<Item mode="answering">` inside `<Responses>`, holding the entries a fresh attempt
 *   starts from (each posting's `start`), as qti-app's form holds them;
 * - `review-correct`: the item's own `solution` posted as the responses, scored by `scoreRecord`,
 *   restored by `restore`, and shown in review with the solution to mark against, as the shadow
 *   tests show a review (`show-solution`);
 * - `review-correct-unmarked`: the same attempt shown with no solution, as the pilot shows a review;
 * - `review-empty`: no response posted, scored, restored and shown with the solution, so every
 *   correct answer shows as missed;
 * - `review-partial`: a partly right response (`partialResponses`) scored, restored and shown with
 *   the solution: some answers right and some missed or out of place; no output for an item with no
 *   answer that can be partly right;
 * - `review-wrong`: a wrong response to each response `wrongResponses` can make one for, the others
 *   left out, scored, restored and shown with the solution; no output for an item it makes none
 *   for;
 * - `solution`: `<Item mode="solution">` showing `solution`'s values.
 *
 * An item whose template processing runs is begun first, under the fixed seed and instance, and
 * every mode shows its record.
 */
export const modes = [
  "answering",
  "review-correct",
  "review-correct-unmarked",
  "review-empty",
  "review-partial",
  "review-wrong",
  "solution",
] as const;

/**
 * One of {@link modes}.
 */
export type Mode = (typeof modes)[number];

/**
 * One worker's share of one side of a render diff, as a Schema, which the worker decodes the data
 * it is started with by:
 *
 * - `cacheDir`, the directory Vite keeps its cache in for this worker;
 * - `documents`, the documents to open and render, each in every mode;
 * - `out`, the side's directory, `<run>/before` or `<run>/after`: each output goes under it at
 *   `<source>/<name>.<mode>.html`;
 * - `packages`, the files of each package the documents name, by package key, as `Inputs` holds them;
 * - `tree`, the checkout whose plate renders: the repository's root, or a worktree's.
 */
export const ShardInputSchema = Schema.Struct({
  cacheDir: Schema.String,
  documents: Schema.Array(DocumentSchema),
  out: Schema.String,
  packages: Schema.Record(Schema.String, Schema.Array(Schema.String)),
  tree: Schema.String,
});

/**
 * One worker's share of one side of a render diff ({@link ShardInputSchema}).
 */
export type ShardInput = typeof ShardInputSchema.Type;

/**
 * One output a shard wrote.
 */
export interface Output {
  /**
   * The SHA-256 of the output as rendered, before `lined` broke it into lines, or of the failure
   * that stopped it: two outputs are equal exactly when their digests are.
   */
  readonly digest: string;
  /**
   * The interaction kinds the item's XML names, by their element names less `qti-` and
   * `-interaction` (`choice`, `graphic-gap-match`), sorted; `none` for an item that names none.
   */
  readonly kinds: readonly string[];
  readonly mode: Mode;
  /**
   * The output's path under its side's directory, `<source>/<name>.<mode>.html`.
   */
  readonly path: string;
  readonly source: Source;
}

/**
 * What `openAdmitted` said of one document: its name, its source, and the verdict and root kind, or
 * `defect` when `openAdmitted` let a defect escape.
 */
export interface Opened {
  readonly name: string;
  readonly source: Source;
  readonly verdict: string;
}

/**
 * What one shard rendered: each document's verdict, each output it wrote, and the most heap its
 * isolate held, in bytes, read after each document (`v8.getHeapStatistics().used_heap_size`).
 */
export interface ShardOutput {
  readonly heap: number;
  readonly opened: readonly Opened[];
  readonly outputs: readonly Output[];
}
