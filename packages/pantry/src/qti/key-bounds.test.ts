/**
 * The key-text bounds of `#pantry/qti/limits.ts` against grizzle's
 * own entry accounting: each bound fits the binding key its doc names, the bound beside every other
 * text of that key, by grizzle's `keyTextBytes`, the check its compile makes when it refuses a key
 * whose B-tree entry a text could outgrow (`UnrepresentableKey`). A key the ledger or the QTI
 * database binds a bound by (the identifier's, the base value's) is held where it is declared.
 */
import { keyFits, keyTextBytes, natural, pg, str } from "@bjornpagen/grizzle";
import { Chars } from "#pantry/grammar/install.ts";
import { assert, describe, it } from "@effect/vitest";
import {
  EntryPath,
  entryPathBytes,
  identifierBytes,
  langTextBytes,
  literalTextBytes,
  LomText,
  lomTextBytes,
  PackageName,
  patternTextBytes,
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
    // TaxonEntry's whole heading (package, source, id, entry): three LOM texts at once, each at the
    // bound, which `keyFits` judges as the compile does a stored view's key, and no byte more.
    assert.isTrue(keyFits([PackageName, LomText, LomText, LomText]));
    assert.isFalse(
      keyFits([
        PackageName,
        ...Array.from({ length: 3 }, () => str.bytes(lomTextBytes + 1, Chars)),
      ]),
    );
    // DescribedLang's and ListedLang's whole headings (general, package, path, value).
    assert.isAtMost(langTextBytes, keyTextBytes([natural, PackageName, EntryPath]));
    // PatternText's whole heading (package, path, pattern, start).
    assert.isAtMost(patternTextBytes, keyTextBytes([PackageName, EntryPath, natural]));
  });
});
