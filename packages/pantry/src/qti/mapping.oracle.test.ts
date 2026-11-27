/**
 * The mapping overlays' free tests: the law oracle's mapping laws, which admit a repeated key (spec
 * reading `string-map-key-case`) and a typed value written with whitespace its simple type
 * collapses (reading `typed-value-whitespace`), and refuse a typed value no lexical form of its
 * base type spells.
 *
 * The views the laws read are `#pantry/qti/attribute-views.db.test.ts`'s.
 */
import { regex } from "arkregex";
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
import { documentBreaches, judgedAlone, lawsOf } from "#pantry/test/oracle.ts";
import { searchWidth } from "#pantry/test/settings.ts";

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
  caseSensitive: readonly string[],
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

    return documentBreaches("item.xml", rows, oracleLaws, judgedAlone)
      .filter(({ law }) => law === "Typed attribute value")
      .map(({ keys, law }) => `${law} ${JSON.stringify(keys)}`);
  });

describe("qti/mapping.ts, the oracle's mapping laws", () => {
  it.effect(
    "admits a repeated key, as written, in another case or as another spelling of one value, and refuses a typed value no lexical form of its base type spells",
    () =>
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
          { breaks: [], keys: ["A  B"], name: "two spaces, collapsed", type: "directedPair" },
          { breaks: [], keys: ["1 2", "01 +2"], name: "point", type: "point" },
          { breaks: ["Typed attribute value"], keys: ["abc"], name: "no integer", type: "integer" },
          { breaks: [], keys: [" 1"], name: "padded", type: "integer" },
          {
            breaks: [],
            keys: ["\t1 \n"],
            name: "padded by a tab and a line feed",
            type: "integer",
          },
          { breaks: [], keys: [" 1.5 "], name: "padded float", type: "float" },
          { breaks: [], keys: [" A "], name: "padded identifier", type: "identifier" },
          { breaks: [], keys: [" true "], name: "padded boolean", type: "boolean" },
          {
            breaks: ["Typed attribute value"],
            keys: [" 1 2"],
            name: "two integers, padded",
            type: "integer",
          },
          { breaks: [], keys: ["1", "true"], name: "boolean 1 beside true", type: "boolean" },
          { breaks: [], keys: ["0"], name: "boolean 0", type: "boolean" },
          { breaks: ["Typed attribute value"], keys: ["2"], name: "boolean 2", type: "boolean" },
          { breaks: [], keys: [" x "], name: "padded string", type: "string" },
        ] as const;

        for (const { breaks, keys, name, type } of cases) {
          const found = yield* mappingBreachesOf(mappedItem(type, keys, "7", []));

          assert.deepStrictEqual(
            found.map((breach) => breach.split(" {")[0]),
            [...breaks],
            `${name}: ${found.join("; ")}: QTI's XSD holds no xs:unique or xs:key over a mapping's entries, and the first entry that matches a value gives it (reading \`string-map-key-case\`), so a repeat is lawful whatever its base type; readings \`typed-value-whitespace\`, \`match-table-target-value\`, \`boolean-lexical\` and \`integer-unbounded\` spell each base type's lexical form`,
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
            `${label}: a repeat is lawful whatever its case or its case-sensitive (reading \`string-map-key-case\`)`,
          );
        }

        const target = yield* mappingBreachesOf(mappedItem("string", ["a"], "x", []));
        assert.deepStrictEqual(
          target.map((breach) => breach.split(" {")[0]),
          ["Typed attribute value"],
          `an integer outcome's target x: ${target.join("; ")}`,
        );
      }),
  );
});

/**
 * The characters the collapse box draws a map key from: a digit, a sign, a letter, and the space
 * XML attribute-value normalization leaves of every whitespace character an attribute writes.
 */
const keyAlphabet = ["1", "-", "A", " "] as const;

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

describe("qti/mapping.ts, a typed map key read collapsed", () => {
  it.effect("admits an integer key exactly where its collapsed text is an integer", (ctx) =>
    searched(
      ctx,
      exhaust(
        {
          box: "every map key of at most 4 characters over 1 - A and space, in an integer mapping, 341",
          caseHang: Duration.seconds(10),
          concurrency: searchWidth,
          coverage: requiredInSpace<"padded integer" | "bare integer" | "no integer">([
            "padded integer",
            "bare integer",
            "no integer",
          ]),
          generator: textsOver(keyAlphabet),
          literal: (text) => JSON.stringify(text),
          oracle: {
            kind: "specification",
            name: "XML Schema 1.0 Part 2 §4.3.6, xs:integer's whiteSpace collapse, and §3.3.13's lexical space, an optional sign and digits: a key is an integer exactly where its text, its XML whitespace at either end removed and each inner run one space, is that (reading `typed-value-whitespace`)",
          },
          suite: "qti/mapping-collapsed-key",
        },
        (text: string, c) =>
          Effect.gen(function* collapsedKey() {
            const read = text
              .replaceAll(regex(" +", "gu"), " ")
              .replace(regex("^ ", "u"), "")
              .replace(regex(" $", "u"), "");
            const integer = regex("^[+-]?[0-9]+$", "u").test(read);
            const integerNote = read === text ? "bare integer" : "padded integer";
            c.note(integer ? integerNote : "no integer");

            const found = yield* mappingBreachesOf(mappedItem("integer", [text], "7", []));

            assert.strictEqual(
              found.length === 0,
              integer,
              `${JSON.stringify(text)}: ${found.join("; ")}`,
            );
          }),
      ),
    ),
  );
});
