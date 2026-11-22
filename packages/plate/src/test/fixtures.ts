/**
 * Fixtures the tests share: single and multiple values built by hand, a hand-built item, and a
 * configuration's `assets` built by hand. It imports no Node module: the determinism fixture loads
 * it as a page would, held to the browser modules' allowlist.
 *
 * Test support only: nothing under `src/` outside `src/test/` and test files imports it.
 *
 * @module
 */
import { Option, Predicate } from "effect";
import type { Item } from "#plate/model/item.ts";
import { isPackagePath } from "#plate/model/url.ts";
import type { Asset, PackagePath } from "#plate/model/url.ts";
import type { Value } from "#plate/model/values.ts";

/**
 * The `JSON.stringify` replacer the tests write a model value's JSON text with: a bigint, such as
 * an integer value or a count, as its decimal digits, and a `Map` or a `Set` as the array of its
 * entries, which plain JSON writes as `{}`; every other field as it is. It is generic in the field,
 * since `JSON.stringify` hands it every field of the value, of every type.
 *
 * @param _key The field's key, unread.
 * @param field The field.
 * @returns The field, or its JSON form.
 */
export const jsonField = <A>(_key: string, field: A): A | string | readonly unknown[] => {
  if (Predicate.isBigInt(field)) {
    return String(field);
  }

  return field instanceof Map || field instanceof Set ? [...field] : field;
};

/**
 * Build what a configuration's `assets` holds, as `configure` would decode it from the same
 * entries, for a test that builds a configuration by hand.
 *
 * @param entries Each file's path from the package root and its address, `null` for a file the
 *   host withholds.
 * @returns The map from each path to what the host gives it, leaving out an entry whose path is no
 *   `PackagePath`, which `configure` refuses.
 */
export const assetsOf = (
  entries: readonly (readonly [string, string | null])[],
): ReadonlyMap<PackagePath, Asset> =>
  new Map(
    entries.flatMap(([file, address]) =>
      isPackagePath(file)
        ? [
            [
              file,
              address === null
                ? ({ kind: "withheld" } as const)
                : ({ address, kind: "served" } as const),
            ] as const,
          ]
        : [],
    ),
  );

/**
 * Construct a single integer value.
 *
 * @param value The integer.
 * @returns The value holding it.
 */
export const integer = (value: bigint): Value => ({
  baseType: "integer",
  cardinality: "single",
  values: [{ baseType: "integer", value }],
});

/**
 * Construct a single float value.
 *
 * @param value The number.
 * @returns The value holding it.
 */
export const float = (value: number): Value => ({
  baseType: "float",
  cardinality: "single",
  values: [{ baseType: "float", value }],
});

/**
 * Construct a single identifier value.
 *
 * @param name The identifier.
 * @returns The value.
 */
export const identifier = (name: string): Value => ({
  baseType: "identifier",
  cardinality: "single",
  values: [{ baseType: "identifier", value: name }],
});

/**
 * Construct a multiple identifier value, NULL when it holds none.
 *
 * @param members Its members.
 * @returns The value.
 */
export const identifiers = (...members: readonly string[]): Value => ({
  baseType: "identifier",
  cardinality: "multiple",
  values: members.map((value) => ({ baseType: "identifier", value })),
});

/**
 * A BG007-shaped item, built by hand: an identifier `RESPONSE`, a float `SCORE` with default 1,
 * outcomes with no default of each kind, and one notice, an Upload's.
 */
export const bg007Item: Item = {
  adaptive: false,
  body: [],
  content: {
    "qti-assessment-stimulus-ref": [],
    "qti-catalog-info": [],
    "qti-companion-materials-info": [],
  },
  contexts: new Map(),
  document: "items/BG007.xml",
  identifier: "beginnersguide007",
  lang: Option.none(),
  modalFeedback: [],
  outcomes: new Map([
    [
      "SCORE",
      {
        baseType: "float",
        cardinality: "single",
        defaultValue: Option.some(float(1)),
        identifier: "SCORE",
        interpretation: Option.none(),
        longInterpretation: Option.none(),
        lookupTable: Option.none(),
        masteryValue: Option.none(),
        normalMaximum: Option.none(),
        normalMinimum: Option.none(),
        view: Option.none(),
      },
    ],
    [
      "MAXSCORE",
      {
        baseType: "float",
        cardinality: "single",
        defaultValue: Option.none(),
        identifier: "MAXSCORE",
        interpretation: Option.none(),
        longInterpretation: Option.none(),
        lookupTable: Option.none(),
        masteryValue: Option.none(),
        normalMaximum: Option.none(),
        normalMinimum: Option.none(),
        view: Option.none(),
      },
    ],
    [
      "COUNT",
      {
        baseType: "integer",
        cardinality: "single",
        defaultValue: Option.none(),
        identifier: "COUNT",
        interpretation: Option.none(),
        longInterpretation: Option.none(),
        lookupTable: Option.none(),
        masteryValue: Option.none(),
        normalMaximum: Option.none(),
        normalMinimum: Option.none(),
        view: Option.none(),
      },
    ],
    [
      "FEEDBACK",
      {
        baseType: "identifier",
        cardinality: "multiple",
        defaultValue: Option.none(),
        identifier: "FEEDBACK",
        interpretation: Option.none(),
        longInterpretation: Option.none(),
        lookupTable: Option.none(),
        masteryValue: Option.none(),
        normalMaximum: Option.none(),
        normalMinimum: Option.none(),
        view: Option.none(),
      },
    ],
  ]),
  records: new Map(),
  responses: new Map([
    [
      "RESPONSE",
      {
        areaMapping: Option.none(),
        baseType: "identifier",
        cardinality: "single",
        correct: Option.some<Value>({
          baseType: "identifier",
          cardinality: "single",
          values: [{ baseType: "identifier", value: "true" }],
        }),
        defaultValue: Option.none(),
        identifier: "RESPONSE",
        mapping: Option.none(),
      },
    ],
  ]),
  templated: false,
  templates: new Map(),
  title: "BG true false example ",
  unheld: new Map(),
  unsupported: [
    {
      feature: "qti-upload-interaction",
      path: "qti-assessment-item/qti-item-body/qti-upload-interaction",
      shown: "notice",
    },
  ],
};
