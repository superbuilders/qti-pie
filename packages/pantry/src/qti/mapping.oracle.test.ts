/**
 * The mapping overlays' free tests: a value written exactly, as `exactValuePattern` reads it, and
 * the law oracle's mapping laws, which admit a repeated key (spec reading 165) and refuse a typed
 * value no lexical form of its base type spells.
 *
 * The builder's rows are `#pantry/import/overlays/mapping.test.ts`'s.
 */
import { assert, describe, it } from "@effect/vitest";
import { exhaust } from "@bjornpagen/testing/explore";
import { requiredInSpace } from "@bjornpagen/testing/features";
import { array, element } from "@bjornpagen/testing/gen";
import type { Gen } from "@bjornpagen/testing/gen";
import { searched } from "@bjornpagen/testing/vitest";
import { Duration, Effect } from "effect";
import { readXml } from "@qti-pie/crust/read.ts";
import { grammar } from "#pantry/grammar/install.ts";
import { foldGrammarOf, shredGrammarOf } from "#pantry/model/composed.ts";
import { fold } from "#pantry/model/folds.ts";
import { shred } from "#pantry/model/shred.ts";
import { exactValuePattern } from "#pantry/qti/mapping.ts";
import { searchTimeout } from "#pantry/test/gen/xdm.ts";
import { documentBreaches, lawsOf } from "#pantry/test/oracle.ts";
import { searchWidth } from "#pantry/test/settings.ts";

/**
 * `exactValuePattern` as JavaScript's engine reads it.
 */
const exactValue = new RegExp(exactValuePattern.source, "u");

/**
 * The characters the exactness box draws texts from: digits and signs, letters, one outside ASCII,
 * a character no identifier holds, and both whitespace a value may carry.
 */
const valueAlphabet = ["0", "1", "-", "A", "é", "!", " ", "\t"] as const;

/**
 * Every text of at most 4 characters over an alphabet.
 *
 * @param alphabet - The characters.
 * @returns The generator.
 */
const textsOver = (alphabet: readonly [string, ...string[]]): Gen<string> => {
  const letters = array(element(alphabet), { max: 4, min: 0 });

  return (source) => source.draw(letters).join("");
};

describe("qti/mapping.ts, exact values", { timeout: searchTimeout }, () => {
  it.effect("judges exactness as XML whitespace at neither end", (ctx) =>
    // Oracle: the specification as a checker, reading 7's exactness, here a JavaScript trim of XML
    // whitespace, against `exactValuePattern`.
    // Bound: every text of at most 4 characters over 8 characters, 4,681.
    searched(
      ctx,
      exhaust(
        {
          box: "every text of at most 4 characters over 0 1 - A é ! space and tab",
          caseHang: Duration.seconds(10),
          concurrency: searchWidth,
          coverage: requiredInSpace<"exact" | "padded">(["exact", "padded"]),
          generator: textsOver(valueAlphabet),
          literal: (text) => JSON.stringify(text),
          oracle: {
            kind: "specification",
            name: "reading 7's exactness, a trim of XML whitespace",
          },
          suite: "qti/mapping-exact-value",
        },
        (text: string, c) =>
          Effect.sync(() => {
            const exact = text.replaceAll(/^[\t\n\r ]+|[\t\n\r ]+$/gu, "") === text;
            c.note(exact ? "exact" : "padded");

            assert.strictEqual(exactValue.test(text), exact, JSON.stringify(text));
          }),
      ),
    ),
  );
});

/**
 * The oracle's tables, read from the composed grammar once.
 */
const oracleLaws = lawsOf(grammar);

/**
 * Write an item whose one response declaration of a base type maps the given keys, and whose one
 * single integer outcome looks up the given target.
 *
 * @param baseType - The response's base type.
 * @param keys - The map keys, in order, each written as an attribute's value.
 * @param target - The match table entry's target value.
 * @param caseSensitive - Each map entry's `case-sensitive`, by the key's place, written where
 *   given; an entry past the list writes none.
 * @returns The item's text.
 */
const mappedItem = (
  baseType: string,
  keys: readonly string[],
  target: string,
  caseSensitive: readonly string[] = [],
): string =>
  [
    '<qti-assessment-item xmlns="http://www.imsglobal.org/xsd/imsqtiasi_v3p0" identifier="item" title="Item" time-dependent="false">',
    `<qti-response-declaration identifier="RESPONSE" cardinality="multiple" base-type="${baseType}">`,
    '<qti-mapping default-value="0">',
    ...keys.map(
      (key, at) =>
        `<qti-map-entry map-key="${key}"${caseSensitive[at] === undefined ? "" : ` case-sensitive="${caseSensitive[at]}"`} mapped-value="1"/>`,
    ),
    "</qti-mapping>",
    "</qti-response-declaration>",
    '<qti-outcome-declaration identifier="GRADE" cardinality="single" base-type="integer">',
    `<qti-match-table><qti-match-table-entry source-value="1" target-value="${target}"/></qti-match-table>`,
    "</qti-outcome-declaration>",
    "</qti-assessment-item>",
  ].join("");

/**
 * Judge an item by the oracle and name the mapping laws it breaks.
 *
 * @param text - The item.
 * @returns The breaches of Typed attribute value, each with its keys.
 */
const mappingBreachesOf = (text: string) =>
  Effect.gen(function* judgedMappings() {
    const xml = yield* Effect.orDie(readXml(new TextEncoder().encode(text)));
    const tree = yield* Effect.orDie(shred(xml, shredGrammarOf(grammar)));
    const rows = yield* Effect.orDie(Effect.fromResult(fold(tree, foldGrammarOf(grammar))));

    return documentBreaches("item.xml", rows, oracleLaws)
      .filter(({ law }) => law === "Typed attribute value")
      .map(({ keys, law }) => `${law} ${JSON.stringify(keys)}`);
  });

describe("qti/mapping.ts, the oracle's mapping laws", { timeout: searchTimeout }, () => {
  it.effect(
    "admits a repeated key, as written, in another case or as another spelling of one value, and refuses a typed value no lexical form of its base type spells",
    () =>
      // Oracle: the specification as a checker: QTI's XSD holds no `xs:unique` or `xs:key` over a
      // mapping's entries, and the first entry that matches a value gives it (reading 165), so a
      // repeat is lawful whatever its base type, its case or its `case-sensitive`; readings 7, 8,
      // 34 and 45 spell each base type's lexical form.
      // Bound: each named variant, once.
      Effect.gen(function* oracleVariants() {
        const cases = [
          { breaks: [], keys: ["1", "01"], name: "integer repeat", type: "integer" },
          { breaks: [], keys: ["1", "1.0"], name: "float repeat", type: "float" },
          { breaks: [], keys: ["NaN", "NaN"], name: "NaN written twice", type: "float" },
          {
            breaks: ["Typed attribute value"],
            keys: ["+INF"],
            name: "XML Schema 1.1's +INF",
            type: "float",
          },
          {
            breaks: [],
            keys: ["York", "york"],
            name: "string keys differing by case",
            type: "string",
          },
          {
            breaks: [],
            keys: ["york", "york"],
            name: "one string key written twice",
            type: "string",
          },
          { breaks: [], keys: ["A B", "B A"], name: "pair undirected", type: "pair" },
          { breaks: [], keys: ["A B", "A\tB"], name: "tab", type: "directedPair" },
          {
            breaks: ["Typed attribute value"],
            keys: ["A  B"],
            name: "two spaces",
            type: "directedPair",
          },
          { breaks: [], keys: ["1 2", "01 +2"], name: "point", type: "point" },
          { breaks: ["Typed attribute value"], keys: ["abc"], name: "no integer", type: "integer" },
          { breaks: ["Typed attribute value"], keys: [" 1"], name: "padded", type: "integer" },
          { breaks: ["Typed attribute value"], keys: ["1"], name: "boolean 1", type: "boolean" },
          { breaks: [], keys: [" x "], name: "padded string", type: "string" },
        ] as const;

        for (const { breaks, keys, name, type } of cases) {
          const found = yield* mappingBreachesOf(mappedItem(type, keys, "7"));

          assert.deepStrictEqual(
            found.map((breach) => breach.split(" {")[0]),
            [...breaks],
            `${name}: ${found.join("; ")}`,
          );
        }

        for (const [caseSensitive, label] of [
          [["true"], "a case-sensitive York beside a default york"],
          [["true", "true"], "one case-sensitive key written twice"],
          [["true"], "one key written twice, once case-sensitive and once by the default"],
        ] as const) {
          const keys = label.startsWith("a case") ? ["York", "york"] : ["york", "york"];

          assert.deepStrictEqual(
            yield* mappingBreachesOf(mappedItem("string", keys, "7", caseSensitive)),
            [],
            label,
          );
        }

        const target = yield* mappingBreachesOf(mappedItem("string", ["a"], "x"));
        assert.deepStrictEqual(
          target.map((breach) => breach.split(" {")[0]),
          ["Typed attribute value"],
          `an integer outcome's target x: ${target.join("; ")}`,
        );
      }),
  );
});
