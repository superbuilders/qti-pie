import type { Generator } from "#tools/gen/generator.ts";
import { xsdClasses } from "#tools/gen/xsd/classes.ts";
import { xsdSql } from "#tools/gen/xsd/sql.ts";

/**
 * `machine/xsd.sql`, the SQL grader's XML Schema 1.0 regular expressions (QTI 3.0.1 info §5.104.1,
 * §5.162.5 and §5.48.4), from grizzle-text's classes: written as SQL, unformatted. It reads no
 * file of the ledger's: its classes are grizzle-text's.
 */
export const generator: Generator = {
  generate: () => Promise.resolve(xsdSql(xsdClasses())),
  reads: [],
  target: "machine/xsd.sql",
};
