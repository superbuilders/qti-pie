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
import { noCoverage, requiredInSpace } from "@bjornpagen/testing/features";
import { array, boolean, element } from "@bjornpagen/testing/gen";
import type { Gen } from "@bjornpagen/testing/gen";
import { searched } from "@bjornpagen/testing/vitest";
import { Duration, Effect, Formatter, Option } from "effect";
import { readXml } from "@qti-pie/crust/read.ts";
import { grammar } from "#pantry/grammar/install.ts";
import { foldGrammarOf, shredGrammarOf } from "#pantry/model/composed.ts";
import { fold } from "#pantry/model/folds.ts";
import { shred } from "#pantry/model/shred.ts";
import { boxHolds } from "#pantry/test/box.ts";
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
 *   some; an entry past the list writes none.
 * @returns The item's text.
 */
const mappedItem = (
  baseType: string,
  keys: readonly string[],
  target: string,
  caseSensitive: readonly Option.Option<string>[],
): string =>
  [
    '<qti-assessment-item xmlns="http://www.imsglobal.org/xsd/imsqtiasi_v3p0" identifier="item" title="Item" time-dependent="false">',
    `<qti-response-declaration identifier="RESPONSE" cardinality="multiple" base-type="${baseType}">`,
    '<qti-mapping default-value="0">',
    ...keys.map(
      (key, at) =>
        `<qti-map-entry map-key="${key}"${Option.match(Option.flatten(Option.fromUndefinedOr(caseSensitive[at])), { onNone: () => "", onSome: (value) => ` case-sensitive="${value}"` })} mapped-value="1"/>`,
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

/**
 * The base types a mapping of the key box maps: every one a map key is written in.
 */
const MAPPED_BASE_TYPES = [
  "integer",
  "float",
  "boolean",
  "identifier",
  "string",
  "pair",
  "directedPair",
  "point",
] as const;

/**
 * A base type of {@link MAPPED_BASE_TYPES}.
 */
type MappedBaseType = (typeof MAPPED_BASE_TYPES)[number];

/**
 * The pieces a key of the key box is written with: a digit, both signs, the decimal point, a
 * letter, `INF`, `true`, and the space, whose runs and ends XML Schema's collapse reads away.
 */
const KEY_PIECES = ["1", "+", "-", ".", "A", "INF", "true", " "] as const;

/**
 * A case of the key box: a base type, a key, and whether the mapping writes it once or twice.
 */
interface KeyCase {
  readonly baseType: MappedBaseType;
  readonly key: string;
  readonly twice: boolean;
}

/**
 * Draw a case of the key box: every base type, every key of one to three pieces, once or twice.
 */
const keyCase: Gen<KeyCase> = (source) => ({
  baseType: source.draw(element(MAPPED_BASE_TYPES)),
  key: source.draw(array(element(KEY_PIECES), { max: 3, min: 1 })).join(""),
  twice: source.draw(boolean),
});

/**
 * How many cases {@link keyCase} draws: 8 base types, by 8 + 8² + 8³ keys, by once or twice.
 */
const KEY_CASES = 8 * (8 + 8 ** 2 + 8 ** 3) * 2;

/**
 * XML Schema 1.0 Part 2 §4.3.6's collapse: each run of whitespace one space, none at either end.
 *
 * @param text - The text.
 * @returns Its collapsed value.
 */
const collapsed = (text: string): string =>
  text
    .replaceAll(regex("[ \\t\\n\\r]+", "gu"), " ")
    .replace(regex("^ ", "u"), "")
    .replace(regex(" $", "u"), "");

/**
 * An NCName over US-ASCII, the only letters the box writes (Namespaces in XML 1.0 [4]).
 */
const ncName = "[A-Za-z_][A-Za-z0-9._-]*";

/**
 * An integer's lexical form, xs:integer's (XML Schema 1.0 Part 2 §3.3.13), unbounded (reading
 * `integer-unbounded`).
 */
const integerForm = "[+-]?[0-9]+";

/**
 * Each base type's lexical forms, as the specification writes them, over a collapsed key:
 * xs:integer's for an integer; xs:double's 1.0 lexical space for a float, which writes no `+INF`
 * (§3.2.5.1); xs:boolean's four literals (reading `boolean-lexical`); an NCName for an identifier
 * (`IdentifierDType`); any text for a string; two identifiers for a pair and a directed pair, and
 * two integers for a point (§8.13), each separated by a space.
 */
const lexicalForms: Readonly<Record<MappedBaseType, RegExp>> = {
  boolean: regex("^(?:true|false|1|0)$", "u"),
  directedPair: regex.as(`^${ncName} ${ncName}$`, "u"),
  float: regex("^(?:[+-]?(?:[0-9]+(?:\\.[0-9]*)?|\\.[0-9]+)(?:[Ee][+-]?[0-9]+)?|-?INF|NaN)$", "u"),
  identifier: regex.as(`^${ncName}$`, "u"),
  integer: regex.as(`^${integerForm}$`, "u"),
  pair: regex.as(`^${ncName} ${ncName}$`, "u"),
  point: regex.as(`^${integerForm} ${integerForm}$`, "u"),
  string: regex("^[\\s\\S]*$", "u"),
};

/**
 * The keys a case-sensitivity case of the string box writes: `York` and `york`, one key in two
 * cases.
 */
const CASED_KEYS = ["York", "york"] as const;

/**
 * The `case-sensitive` a map entry of the string box writes: none, the default's, or either value.
 */
const CASE_SENSITIVITIES = [Option.none(), Option.some("true"), Option.some("false")] as const;

/**
 * A case of the string box: two keys and each entry's `case-sensitive`.
 */
interface CasedCase {
  readonly keys: readonly [string, string];
  readonly sensitivity: readonly [Option.Option<string>, Option.Option<string>];
}

/**
 * Draw a case of the string box: each of two entries keyed `York` or `york`, each writing
 * `case-sensitive` as none, `true` or `false`.
 */
const casedCase: Gen<CasedCase> = (source) => ({
  keys: [source.draw(element(CASED_KEYS)), source.draw(element(CASED_KEYS))],
  sensitivity: [source.draw(element(CASE_SENSITIVITIES)), source.draw(element(CASE_SENSITIVITIES))],
});

/**
 * How many cases {@link casedCase} draws: 2 keys by 3 sensitivities, for each of two entries.
 */
const CASED_CASES = (2 * 3) ** 2;

describe("qti/mapping.ts, the oracle's mapping laws", () => {
  it.effect(
    `admits a key exactly where its collapsed text is a lexical form of its base type, written once or repeated: ${String(KEY_CASES)} mappings`,
    (ctx) =>
      Effect.andThen(
        boxHolds(keyCase, KEY_CASES),
        searched(
          ctx,
          exhaust(
            {
              box: "every base type a map key is written in, by every key of one to three of 1 + - . A INF true and the space, written once or twice",
              caseHang: Duration.seconds(10),
              concurrency: searchWidth,
              coverage: requiredInSpace<"admitted" | "refused" | "padded">([
                "admitted",
                "refused",
                "padded",
              ]),
              generator: keyCase,
              literal: Formatter.format,
              oracle: {
                kind: "specification",
                name: "each base type's lexical forms as the specification writes them (lexicalForms: readings `typed-value-whitespace`, `boolean-lexical` and `integer-unbounded`, xs:double's 1.0 lexical space, §8.13's pairs and points) over the key collapsed (reading `typed-value-whitespace`), and reading `string-map-key-case`: QTI's XSD holds no xs:unique or xs:key over a mapping's entries and the first entry that matches gives the value, so a repeat is lawful whatever its base type",
              },
              suite: "qti/mapping-keys",
            },
            ({ baseType, key, twice }, c) =>
              Effect.gen(function* mappedKey() {
                const admitted = lexicalForms[baseType].test(collapsed(key));
                c.note(admitted ? "admitted" : "refused");
                if (admitted && collapsed(key) !== key) {
                  c.note("padded");
                }

                const found = yield* mappingBreachesOf(
                  mappedItem(baseType, twice ? [key, key] : [key], "7", []),
                );

                const shown = `${baseType} ${JSON.stringify(key)}${twice ? " twice" : ""}: ${found.join("; ")}`;

                assert.strictEqual(found.length === 0, admitted, shown);
                assert.deepStrictEqual(
                  found.filter((breach) => !breach.startsWith("Typed attribute value ")),
                  [],
                  shown,
                );
              }),
          ),
        ),
      ),
  );

  it.effect(
    `admits a string key repeated in either case, whatever each entry's case-sensitive: ${String(CASED_CASES)} mappings`,
    (ctx) =>
      Effect.andThen(
        boxHolds(casedCase, CASED_CASES),
        searched(
          ctx,
          exhaust(
            {
              box: "a string mapping of two entries, each keyed York or york and writing case-sensitive as none, true or false",
              caseHang: Duration.seconds(10),
              concurrency: searchWidth,
              coverage: noCoverage,
              generator: casedCase,
              literal: Formatter.format,
              oracle: {
                kind: "specification",
                name: "reading `string-map-key-case`: a repeat is lawful whatever its case or its case-sensitive, since the first entry that matches gives the value",
              },
              suite: "qti/mapping-cased-keys",
            },
            ({ keys, sensitivity }) =>
              Effect.gen(function* casedKeys() {
                assert.deepStrictEqual(
                  yield* mappingBreachesOf(mappedItem("string", keys, "7", sensitivity)),
                  [],
                  `${Formatter.format(keys)} under ${Formatter.format(sensitivity)}`,
                );
              }),
          ),
        ),
      ),
  );

  it.effect(
    "refuses a match table's target no lexical form of its outcome's base type spells",
    () =>
      Effect.gen(function* matchTarget() {
        const target = yield* mappingBreachesOf(mappedItem("string", ["a"], "x", []));

        assert.deepStrictEqual(
          target.map((breach) => breach.split(" {")[0]),
          ["Typed attribute value"],
          `an integer outcome's target x (reading \`match-table-target-value\`): ${target.join("; ")}`,
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
