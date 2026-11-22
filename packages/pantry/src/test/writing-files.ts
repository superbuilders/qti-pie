/**
 * Pantry's database test files that write, each by the suffix of the database of its own
 * (`#pantry/test/file-database.ts`): a closed union of at most 18 bytes each, so a database's name,
 * the lane's, `_` and the suffix, stays within PostgreSQL's 63.
 *
 * @module
 */
import { NodeServices } from "@effect/platform-node";
import { Layer } from "effect";
import { fileDatabaseLayer } from "#pantry/test/file-database.ts";

/**
 * The files, by their databases' suffixes.
 */
export type WritingFile =
  | "export"
  | "output"
  | "timeout"
  | "package"
  | "packaging"
  | "oracle"
  | "refusals"
  | "long_values"
  | "corpus";

/**
 * A pantry database test file's own database, for every connection its layer and its effects build
 * (`fileDatabaseLayer`), the migration identity's connection reading its CA through Node's file
 * system.
 *
 * @param file - The file.
 * @returns The layer.
 */
export const fileDatabaseOf = (file: WritingFile) =>
  fileDatabaseLayer(file).pipe(Layer.provide(NodeServices.layer));
