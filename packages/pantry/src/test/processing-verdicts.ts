/**
 * The verdict the import gives each processing package of one hand-written document (Q5.10):
 * `import/program.oracle.db.test.ts` holds PostgreSQL to it.
 *
 * A package takes its document's frozen verdict (`fixtures/processing/verdicts.tsv`, the old
 * processing checker run once over every document and frozen): a checker's rule or `accepted`, or a
 * guard's, which the guard's law gives today. A package with no frozen row (`processing-item`,
 * `rptemplates`, `template-item` and the two padded ones) has no stated verdict: the lookup answers
 * `None` for it, and `import/program.oracle.db.test.ts` holds PostgreSQL to the law oracle's
 * verdict on it instead.
 */
import { regex } from "arkregex";
import path from "node:path";
import { Effect, FileSystem, Option, Schema } from "effect";

/**
 * One package's verdict: the rule it is refused under, or `accepted`, and what gives it.
 */
interface ProcessingVerdict {
  /**
   * The rule the package is refused under, or `accepted`.
   */
  readonly rule: string;
  /**
   * What gives the verdict: the old checker's frozen rule, or a guard's law.
   */
  readonly source: "checker" | "guard";
}

/**
 * The frozen verdicts' file.
 */
const verdictsFile = path.resolve(import.meta.dirname, "fixtures", "processing", "verdicts.tsv");

/**
 * Who gave a frozen verdict, its `source` column.
 */
const FrozenSource = Schema.Literals(["checker", "guard"]);

/**
 * Read the stated verdicts, as a lookup by the package's name: the stem of its document's file
 * under `broken/` or `guards/`. It answers `None` for a package with no frozen row, which has no
 * stated verdict.
 */
export const processingVerdicts = Effect.gen(function* processingVerdicts() {
  const fs = yield* FileSystem.FileSystem;
  const text = yield* fs.readFileString(verdictsFile);
  const stated = yield* Effect.forEach(
    text.split("\n").slice(1),
    Effect.fnUntraced(function* verdictOfLine(line) {
      const fields = line.split("\t");
      const name = regex("^(?:broken|guards)/(?<name>[^/]+)\\.xml$", "u").exec(fields[0] ?? "")
        ?.groups?.["name"];
      if (name === undefined) {
        return [];
      }

      const verdict: ProcessingVerdict = {
        rule: fields[2] ?? "",
        source: yield* Schema.decodeUnknownEffect(FrozenSource)(fields[5]),
      };

      return [[name, verdict] as const];
    }),
  );

  const byName: ReadonlyMap<string, ProcessingVerdict> = new Map(stated.flat());

  return (name: string): Option.Option<ProcessingVerdict> =>
    Option.fromUndefinedOr(byName.get(name));
});
