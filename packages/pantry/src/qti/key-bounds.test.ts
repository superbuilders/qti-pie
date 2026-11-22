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
  keyMatchedTextBytes,
  literalTextBytes,
  PackageName,
  ssmlMemberBytes,
  UriText,
  uriBytes,
  xmlNameBytes,
} from "#pantry/qti/limits.ts";
import { OpenLocal } from "#pantry/qti/attributes.ts";

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
    // number).
    assert.isAtMost(
      keyMatchedTextBytes,
      keyTextBytes([PackageName, EntryPath, EntryPath, natural, code, natural, natural]),
    );
    // OpenAttributeEntity's key (package, path, start, uri, local, offset), its uri and local name
    // each beside the other.
    assert.isAtMost(uriBytes, keyTextBytes([PackageName, EntryPath, natural, OpenLocal, natural]));
    assert.isAtMost(
      xmlNameBytes,
      keyTextBytes([PackageName, EntryPath, natural, UriText, natural]),
    );
    // Namespace's key (package, path, start, prefix).
    assert.isAtMost(xmlNameBytes, keyTextBytes([PackageName, EntryPath, natural]));
    // Literal's reference target (package, path, start, text, baseType).
    assert.isAtMost(literalTextBytes, keyTextBytes([PackageName, EntryPath, natural, code]));
    // DataSsmlProperty's lookup (package, path, start, member, name) and DataSsmlMember's target
    // (package, path, start, at, member).
    assert.isAtMost(ssmlMemberBytes, keyTextBytes([PackageName, EntryPath, natural, natural]));
  });
});
