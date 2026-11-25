/**
 * Write specimen's floor (`floorCases`, the cases the admission run admits) as one QTI content
 * package, for the operator to publish to the QTI database as the package the QTI app's lab plays
 * and grades through the database (grading proposal, Decision 7: one path, no dry review):
 *
 * ```sh
 * node packages/qti-pie/tools/specimen-floor.ts <folder>
 * pnpm db qti publish <folder> specimen-floor
 * ```
 *
 * Each case's item sits at `floorPathOf`'s path, `items/` and the SHA-256 of its XML, and every
 * file the items name is a placeholder of its kind, as an admission package's are
 * (`writePackageOf`). Two cases of one XML are one item. The package is the floor as the generator
 * draws it now, so a change to the generator is published again under the same name.
 *
 * @module
 */
import * as NodeServices from "@effect/platform-node/NodeServices";
import { writePackageOf } from "@qti-pie/pantry/test/admission.ts";
import type { AdmissionDocument } from "@qti-pie/pantry/test/admission.ts";
import { floorItems } from "@qti-pie/specimen/floor";
import { Array as Arr, Effect, Option, pipe } from "effect";

/**
 * The folder the package is written to, the command's one argument.
 */
const out = Option.getOrThrowWith(
  Arr.get(process.argv, 2),
  () => new TypeError("usage: specimen-floor.ts <folder>"),
);

const documents = pipe(
  floorItems,
  Arr.map(({ path, xml }): AdmissionDocument => ({
    at: path,
    bytes: new TextEncoder().encode(xml),
    folder: Option.none(),
  })),
);

await Effect.runPromise(
  writePackageOf(out, documents).pipe(
    Effect.andThen(Effect.log(`specimen's floor: ${String(documents.length)} items in ${out}`)),
    Effect.provide(NodeServices.layer),
  ),
);
