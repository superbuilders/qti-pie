/**
 * The export's last step, with no database: one document's XML written from the rows its scan
 * delivered (`#pantry/export/scan.ts` `documentScan`), assembled with one stack and written by
 * `unshred` in its export charset. The export runs it for each document of a package
 * (`#pantry/export/package.ts`), and an app outside this package runs it over the rows its own
 * workload's scan read, paged by `scannedRows` of `#pantry/export/pages.ts` as the export pages it.
 */
import { Array as Arr, Effect } from "effect";
import { addRow, assembleScan, emptyScan } from "#pantry/export/pages.ts";
import type { Scan, ScanRow } from "#pantry/export/pages.ts";
import type { Place } from "#pantry/qti/schema.ts";
import type { Composed } from "#pantry/model/composed.ts";
import { names } from "#pantry/model/names.ts";
import { unshred } from "#pantry/model/unshred.ts";

/**
 * Write a document from the rows its whole scan folded.
 *
 * The rows are a database's, every law held of them, so a scan the read cannot assemble is a
 * defect (`assembleScan`); and so is a document its export charset cannot write, since the import
 * chose that charset as one that writes the document, UTF-8 where its own cannot (crust's
 * `exportCharset`), so crust's `EncodeError` dies here.
 *
 * @param document - The document's key, its package's name and its path, which its
 *   scan was filtered by.
 * @param scan - The rows the whole scan folded (`#pantry/export/pages.ts` `addRow`).
 * @returns The document's bytes in its export charset.
 */
export const scanXml = Effect.fn("export.scanXml")(function* scanXml(
  document: Place,
  scan: Scan<Composed>,
) {
  return yield* Effect.orDie(unshred(assembleScan(document, scan), names));
});

/**
 * Write a document from every row of its scan, in any order and cut into any pages, since each row
 * is folded by its own key (`#pantry/export/pages.ts`).
 *
 * @param document - The document's key, which its scan was filtered by.
 * @param rows - Every row the scan delivered.
 * @returns The document's bytes in its export charset, dying as {@link scanXml} does.
 */
export const documentXml = (document: Place, rows: Iterable<ScanRow<Composed>>) =>
  scanXml(document, Arr.reduce(rows, emptyScan<Composed>(), addRow));
