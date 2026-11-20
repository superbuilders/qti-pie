import { exhaust } from "@bjornpagen/testing/explore";
import { requiredInSpace } from "@bjornpagen/testing/features";
import { array, element } from "@bjornpagen/testing/gen";
import type { Gen } from "@bjornpagen/testing/gen";
import { searched } from "@bjornpagen/testing/vitest";
/* oxlint-disable unicorn/text-encoding-identifier-case -- The generated documents carry the charset label crust's reader reports, `UTF-8`. */
/**
 * The mapping overlays' rows against a second reading of the same tree: a direct walk of the XDM
 * document that numbers its nodes in document order, each node's `start`, as the tree's rows are
 * numbered, and collects one map key per `qti-map-entry` from its attributes. The walk shares no
 * code with the builder, which reads the tree's flat rows (`flatten`). A typed key is the
 * database's to judge: `Typed_attribute_value` reads each key beside its mapping's declaration's
 * base type through `Node` (`MapKeyType`, a query of `#pantry/qti/overlay-queries/declaration.ts`).
 */
import { assert, describe, it } from "@effect/vitest";
import { Duration, Effect, Option } from "effect";
import { ownViewOf } from "#pantry/import/fold.ts";
import type { Place } from "#pantry/import/overlays/declarations.ts";
import { rowsOf } from "#pantry/import/overlays/mapping.ts";
import type { Composed } from "#pantry/model/composed.ts";
import { closedName } from "#pantry/model/xdm.ts";
import type { ClosedName, XdmChild, XdmClosedElement, XdmDocument } from "#pantry/model/xdm.ts";
import { searchTimeout } from "#pantry/test/gen/xdm.ts";
import { searchWidth } from "#pantry/test/settings.ts";

/**
 * Where the generated document stands: one item of one package, the place every row holds.
 */
const place: Place = { package: "MANIFEST", path: "item.xml" };

/**
 * The deleted schema's `xs:integer` lexical space (`src/schema/patterns.ts` `xsInteger`): the
 * integer keys that hold a typed value.
 */
const xsInteger = /^[+-]?[0-9]+$/u;

/**
 * The deleted schema's `xs:double` lexical space (`src/schema/patterns.ts` `xsDouble`): the float
 * keys that hold a typed value, every one of them (spec reading 154).
 */
const xsDouble = /^(?:[+-]?(?:[0-9]+(?:\.[0-9]*)?|\.[0-9]+)(?:[eE][+-]?[0-9]+)?|-?INF|NaN)$/u;

/**
 * Read a key as the value its mapping's base type gives it, as the walk compares keys: an integer
 * by `BigInt`, a float by `Number`, and every other key as written.
 *
 * @param baseType - The mapping's base type.
 * @param key - The key.
 * @returns The value's text.
 */
const typedOf = (baseType: string, key: string): string => {
  if (baseType === "integer" && xsInteger.test(key)) {
    return String(BigInt(key));
  }

  return baseType === "float" && xsDouble.test(key) ? String(Number(key)) : key;
};

/**
 * One map entry of a generated mapping: its key and its mapped value, as written.
 */
interface Entry {
  readonly caseSensitive?: string;
  readonly key: string;
  readonly value: string;
}

/**
 * One generated mapping: its declaration's base type and its entries in order.
 */
interface MappingCase {
  readonly baseType: "directedPair" | "float" | "integer" | "pair" | "point" | "string";
  readonly entries: readonly Entry[];
}

/**
 * The entries a mapping draws from: three keys, two of one integer and float spelled apart (`1`,
 * `01`) and one of a float alone (`1.0`), each with one of two mapped values, so a box of four
 * entries holds identical entries, entries with one key and two values, and keys equal as typed
 * values only.
 */
const entryAlphabet = [
  { key: "1", value: "0.5" },
  { key: "1", value: "1" },
  { key: "01", value: "0.5" },
  { key: "01", value: "1" },
  { key: "1.0", value: "0.5" },
  { key: "1.0", value: "1" },
] as const satisfies readonly Entry[];

/**
 * Every mapping of one of three base types holding at most 4 entries over {@link entryAlphabet}.
 */
const mappingCases: Gen<MappingCase> = (source) => ({
  baseType: source.draw(element(["float", "integer", "string"] as const)),
  entries: source.draw(array(element(entryAlphabet), { max: 4, min: 0 })),
});

/**
 * An element's attributes, as (name, lexical) pairs in order.
 */
type Attributes = readonly (readonly [ClosedName<Composed>, string])[];

/**
 * An element with closed attributes.
 *
 * @param kind - Its kind.
 * @param attributes - Its attributes' names and lexical forms, in order.
 * @param children - Its children.
 * @returns The element.
 */
const elementOf = (
  kind: XdmClosedElement<Composed>["kind"],
  attributes: Attributes,
  children: readonly XdmChild<Composed>[],
): XdmClosedElement<Composed> => ({
  _tag: "element",
  attributes: attributes.map(([handle, lexical]) => ({
    lexical,
    name: closedName(handle),
    references: [],
  })),
  children,
  governs: Option.none(),
  kind,
  namespaces: [],
  prefix: "",
});

/**
 * Write a generated mapping as the tree shred would give: an item holding one response declaration
 * `RESPONSE` of the case's base type, its `qti-mapping` holding the entries, whitespace between
 * them so character data shares the numbering.
 *
 * @param input - The mapping.
 * @returns The tree.
 */
const treeOf = (input: MappingCase): XdmDocument<Composed> => {
  const ws: XdmChild<Composed> = { _tag: "ws", value: "\n" };
  const entries = input.entries.flatMap(({ caseSensitive, key, value }) => [
    ws,
    elementOf(
      "qti-map-entry",
      [
        ["map-key", key],
        ["mapped-value", value],
        ...(caseSensitive === undefined
          ? []
          : ([["case-sensitive", caseSensitive]] as const satisfies Attributes)),
      ],
      [],
    ),
  ]);

  return {
    _tag: "document",
    charset: "UTF-8",
    declaration: Option.none(),
    epilog: [],
    exportCharset: "UTF-8",
    prolog: [],
    root: elementOf(
      "qti-assessment-item",
      [["identifier", "item"]],
      [
        elementOf(
          "qti-response-declaration",
          [
            ["identifier", "RESPONSE"],
            ["cardinality", "multiple"],
            ["base-type", input.baseType],
          ],
          [elementOf("qti-mapping", [["default-value", "0"]], entries)],
        ),
      ],
    ),
  };
};

/**
 * The map keys a mapping's tree implies, by a direct walk: the item is at 1, its declaration at 2
 * and its mapping at 3, and each entry follows the whitespace before it, so entry `i` is at
 * `5 + 2i`; one key per entry, its key as written.
 *
 * @param input - The mapping.
 * @returns Each entry's key, by its `start`.
 */
const walkedKeys = (input: MappingCase): ReadonlyMap<bigint, string> =>
  new Map(input.entries.map(({ key }, at) => [BigInt(5 + 2 * at), key]));

/**
 * A situation the box must reach: two identical entries, two entries of one key and two values,
 * two integer keys equal as integers only, and two float keys equal as doubles only.
 */
type KeySituation = "identical entries" | "one key, two values" | "typed repeat" | "distinct";

/**
 * Name the situations one mapping reaches.
 *
 * @param input - The mapping.
 * @returns Its situations.
 */
const situationsOf = (input: MappingCase): readonly KeySituation[] => {
  const texts = input.entries.map(({ key, value }) => `${key} ${value}`);
  const keys = input.entries.map(({ key }) => key);
  const typed = keys.map((key) => typedOf(input.baseType, key));
  const situations: [KeySituation, boolean][] = [
    ["identical entries", new Set(texts).size < texts.length],
    ["one key, two values", new Set(keys).size < new Set(texts).size],
    ["typed repeat", new Set(typed).size < new Set(keys).size],
  ];
  const reached = situations.flatMap(([situation, holds]) => (holds ? [situation] : []));

  return reached.length === 0 ? ["distinct"] : reached;
};

describe("import/overlays/mapping.ts, map keys", { timeout: searchTimeout }, () => {
  it.effect(
    "writes one MapKey row per qti-map-entry, distinct by place, even where two entries are identical or name one value (spec reading 165)",
    (ctx) =>
      // Oracle: a second implementation, a direct walk of the XDM tree that numbers its entries in
      // document order, against the builder's read of the flat rows: a repeated key is a row of
      // its own, since the first entry that matches a value gives it (reading 165).
      // Bound: every mapping of 3 base types with at most 4 entries over 3 keys and 2 values,
      // 4,665.
      searched(
        ctx,
        exhaust(
          {
            box: "every mapping of float, integer or string with at most 4 entries over 3 keys and 2 values",
            caseHang: Duration.seconds(10),
            concurrency: searchWidth,
            coverage: requiredInSpace<KeySituation>([
              "identical entries",
              "one key, two values",
              "typed repeat",
              "distinct",
            ]),
            generator: mappingCases,
            literal: (input) =>
              `${input.baseType}: ${input.entries.map(({ key, value }) => `${key}=${value}`).join(" ")}`,
            oracle: { kind: "second-implementation", name: "a direct walk of the XDM tree" },
            suite: "pantry/import/overlays-mapping-keys",
          },
          (input: MappingCase, c) =>
            Effect.sync(() => {
              c.noteAll(situationsOf(input));

              const rows = rowsOf(ownViewOf(treeOf(input)), place);
              const walked = walkedKeys(input);

              assert.strictEqual(rows.MapKey.size, input.entries.length);
              assert.deepStrictEqual(
                [...rows.MapKey.values()].map((row) => [row.package, row.path, row.start, row.key]),
                [...walked].map(([start, key]) => [place.package, place.path, start, key]),
              );
            }),
        ),
      ),
  );
});

/**
 * One generated lookup table: its kind, its default value or none, and its entries' targets.
 */
interface TableCase {
  readonly defaultValue: string | undefined;
  readonly kind: "qti-interpolation-table" | "qti-match-table";
  readonly targets: readonly string[];
}

/**
 * Every table of either kind, with or without a default, holding at most 2 entries over 2
 * targets.
 */
const tableCases: Gen<TableCase> = (source) => ({
  defaultValue: source.draw(element(["x", undefined] as const)),
  kind: source.draw(element(["qti-match-table", "qti-interpolation-table"] as const)),
  targets: source.draw(array(element(["1", "two"] as const), { max: 2, min: 0 })),
});

/**
 * Write a generated table as the tree shred would give: an item holding one single outcome
 * declaration of base type integer holding the table, whitespace before each entry.
 *
 * @param input - The table.
 * @returns The tree.
 */
const tableTreeOf = (input: TableCase): XdmDocument<Composed> => {
  const ws: XdmChild<Composed> = { _tag: "ws", value: "\n" };
  const entryKind =
    input.kind === "qti-match-table" ? "qti-match-table-entry" : "qti-interpolation-table-entry";
  const entries = input.targets.flatMap((target) => [
    ws,
    elementOf(
      entryKind,
      [
        ["source-value", "1"],
        ["target-value", target],
      ],
      [],
    ),
  ]);

  return {
    ...treeOf({ baseType: "integer", entries: [] }),
    root: elementOf(
      "qti-assessment-item",
      [["identifier", "item"]],
      [
        elementOf(
          "qti-outcome-declaration",
          [
            ["identifier", "GRADE"],
            ["cardinality", "single"],
            ["base-type", "integer"],
          ],
          [
            elementOf(
              input.kind,
              input.defaultValue === undefined ? [] : [["default-value", input.defaultValue]],
              entries,
            ),
          ],
        ),
      ],
    ),
  };
};

describe("import/overlays/mapping.ts, lookup values", { timeout: searchTimeout }, () => {
  it.effect("writes one LookupValue row per table default and entry target, as written", (ctx) =>
    // Oracle: a second implementation, a direct walk placing the declaration at 2, the table at
    // 3 and entry `i` at `5 + 2i`, and reading each attribute as written.
    // Bound: every table of 2 kinds, with or without a default, with at most 2 entries over 2
    // targets, 28.
    searched(
      ctx,
      exhaust(
        {
          box: "every table of 2 kinds, with or without a default, with at most 2 entries over 2 targets",
          caseHang: Duration.seconds(10),
          concurrency: searchWidth,
          coverage: requiredInSpace<"default" | "no default">(["default", "no default"]),
          generator: tableCases,
          literal: (input) => JSON.stringify(input),
          oracle: { kind: "second-implementation", name: "a direct walk of the XDM tree" },
          suite: "pantry/import/overlays-mapping-lookup",
        },
        (input: TableCase, c) =>
          Effect.sync(() => {
            c.note(input.defaultValue === undefined ? "no default" : "default");

            const rows = rowsOf(ownViewOf(tableTreeOf(input)), place);
            const expected: (bigint | string)[][] = [
              ...(input.defaultValue === undefined ? [] : [[3n, input.defaultValue]]),
              ...input.targets.map((target, at) => [BigInt(5 + 2 * at), target]),
            ];

            assert.sameDeepMembers(
              [...rows.LookupValue.values()].map((row) => [row.start, row.value]),
              expected,
            );
          }),
      ),
    ),
  );
});
