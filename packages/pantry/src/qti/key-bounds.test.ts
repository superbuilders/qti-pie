/**
 * The key-text bounds of `#pantry/qti/limits.ts` against grizzle's
 * own entry accounting: each bound fits the binding key its doc names, the bound beside every other
 * text of that key, by grizzle's `keyTextBytes`, the check its compile makes when it refuses a key
 * whose B-tree entry a text could outgrow (`UnrepresentableKey`). A key the ledger or the QTI
 * database binds a bound by (the identifier's, the base value's) is held where it is declared.
 */
import { keyTextBytes, natural, pg } from "@bjornpagen/grizzle";
import { assert, describe, it } from "@effect/vitest";
import {
  EntryPath,
  entryPathBytes,
  identifierBytes,
  literalTextBytes,
  PackageName,
} from "#pantry/qti/limits.ts";

/**
 * A closed id's column, a code of its roster, as a key holds it.
 */
const code = pg.smallint;

describe("qti/key-bounds", () => {
  it("fits each key text's bound beside the other texts of the key it binds, by grizzle's entry accounting", () => {
    // Oracle: grizzle's `keyTextBytes`, the most bytes a text holds beside a key's other fields,
    // which its compile refuses a key past. Bound: each binding key its doc names.
    // Instance's lookup (package, assemblyKind, assembly, document, parent, siteDocument, site):
    // three paths.
    assert.isAtMost(
      entryPathBytes,
      keyTextBytes([PackageName, code, EntryPath, natural, EntryPath, natural]),
    );
    // NumberedReading's key (package, assembly, path, start, attribute, scopeInstance, scope,
    // number), its number a stretch of its reference's identifier.
    assert.isAtMost(
      identifierBytes,
      keyTextBytes([PackageName, EntryPath, EntryPath, natural, code, natural, natural]),
    );
    // Literal's reference target (package, path, start, text, baseType).
    assert.isAtMost(literalTextBytes, keyTextBytes([PackageName, EntryPath, natural, code]));
  });
});
