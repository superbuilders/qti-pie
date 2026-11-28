import { assert, describe, it } from "@effect/vitest";
import * as operators from "#processing/alpha/operators-entry.ts";
import { markupText } from "#processing/alpha/operators/markup-text.ts";
import { normalizeSpace } from "#processing/alpha/operators/normalize-space.ts";
import { whenPresent } from "#processing/alpha/operators/when-present.ts";
import * as vocabulary from "#processing/alpha/vocabulary-entry.ts";
import * as units from "#processing/alpha/vocabulary/units.ts";
import * as words from "#processing/alpha/vocabulary/words.ts";
import { nullOf, textValue } from "#processing/value.ts";

describe("the Alpha entries", () => {
  it("export the very functions the registry entries call and the very lists the operators read, never a copy", () => {
    assert.strictEqual(operators.markupText, markupText);
    assert.strictEqual(operators.normalizeSpace, normalizeSpace);
    assert.strictEqual(operators.whenPresent, whenPresent);
    assert.deepStrictEqual(Object.keys(vocabulary).toSorted(), [
      "glueWords",
      "ieNouns",
      "irregularPlurals",
      "letterUnits",
      "measureWords",
      "neverPluralWords",
      "numberReviewSpellings",
      "operationWords",
      "placeValueWords",
      "stopWords",
      "unitSpellings",
      "unitTable",
      "unitTypoTargets",
      "unitWords",
      "verbs",
    ]);
    assert.strictEqual(vocabulary.unitSpellings, units.unitSpellings);
    assert.strictEqual(vocabulary.unitTable, units.unitTable);
    assert.strictEqual(vocabulary.numberReviewSpellings, units.numberReviewSpellings);
    assert.deepStrictEqual(units.unitSpellings, [
      ...units.unitTable,
      ...units.numberReviewSpellings,
    ]);
    assert.strictEqual(vocabulary.stopWords, words.stopWords);
  });

  it("gives when-present's value where its probe is present, and the value's NULL where it is NULL", () => {
    const essay = textValue("string", "An essay.");
    assert.deepStrictEqual(whenPresent(textValue("string", "x"), essay), essay);
    assert.deepStrictEqual(
      whenPresent(nullOf({ base: "string", cardinality: "single" }), essay),
      nullOf({ base: "string", cardinality: "single" }),
    );
  });
});
