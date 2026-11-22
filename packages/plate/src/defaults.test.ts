import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
/**
 * Every response starts at its default (spec reading 183), held over real items against the
 * information model and each item's own declarations, through what a host starts a fresh attempt
 * from, every posting's `start` (`postings` in `#plate/postings.ts`):
 *
 * - **The start is the default.** Each response's `start` decodes, through its posting, to its
 *   declared `qti-default-value`, "set to this value at the start of the first attempt"
 *   (information model 2.2.2.2). A Choice, which "is always initialized with no choices selected"
 *   (2.4.1.1), and an End Attempt, whose response's "default value ... is always ignored" (2.4.5),
 *   start with no entry whatever their default: NULL, and End Attempt's `false`.
 * - **No secret.** Neither the entries nor the redacted item holds a correct value or a mapping key
 *   the default does not hold.
 * - **Restored values win.** After an attempt that cleared a defaulted response, the record the
 *   database returns holds NULL for it, which posts nothing, not the default.
 *
 * The items are every fixture and every accepted corpus item whose response declares a default,
 * and the fixtures of each other kind with a default written into a response here, each a value
 * other than the correct one where the item has one, with two items written here: an Inline
 * Choice, and a Text Entry in base 16, whose default 255 posts as `ff`.
 *
 * @module
 */
import { assert, describe, it } from "@effect/vitest";
import { Effect, Option, Result } from "effect";
import { decode, encode } from "#plate/form/encoding.ts";
import type { Entry } from "#plate/form/encoding.ts";
import { interactionsIn } from "#plate/model/interactions.ts";
import { recordOf } from "#plate/test/records.ts";
import { format, match, nullOf, own } from "#plate/model/values.ts";
import type { ResponseValue, Value } from "#plate/model/values.ts";
import { postings } from "#plate/postings.ts";
import type { Posting } from "#plate/postings.ts";
import { redact } from "#plate/redact.ts";
import type { Redacted } from "#plate/redact/walk.ts";
import { restore } from "#plate/restore.ts";
import { jsonField } from "#plate/test/fixtures.ts";
import { shownToCandidate } from "#plate/test/page.ts";
import { acceptedOf, openCorpus } from "#plate/test/sweep.ts";
import { admitted } from "#plate/test/admitted.ts";
import { acceptedItem } from "#plate/validate/verdict.ts";
import type { Accepted } from "#plate/validate/verdict.ts";

/**
 * The fixtures' root.
 */
const fixtures = path.resolve(import.meta.dirname, "..", "fixtures");

/**
 * The instance every posting here names.
 */
const instance = "defaults";

/**
 * How a response starts, by the information model: at its default, or empty whatever its default,
 * holding the value no entry posts (NULL, or End Attempt's `false`).
 */
type Start = { readonly kind: "default" } | { readonly kind: "empty"; readonly holds: Value };

/**
 * One response given a default here: the values written into its `qti-default-value`, as written,
 * and how the information model starts it.
 */
interface Defaulted {
  readonly response: string;
  readonly start: Start;
  readonly values: readonly string[];
}

/**
 * One item: its location under the fixtures, or its XML where it is written here, and the defaults
 * written into it.
 */
interface Case {
  readonly defaults: readonly Defaulted[];
  readonly location: string;
  readonly xml?: string;
}

/**
 * Starting at the default.
 */
const atDefault: Start = { kind: "default" };

/**
 * Starting empty, as NULL of a type.
 *
 * @param baseType The response's base type.
 * @param cardinality Its cardinality.
 * @returns The start.
 */
const emptyAs = (baseType: Value["baseType"], cardinality: Value["cardinality"]): Start => ({
  holds: nullOf(baseType, cardinality),
  kind: "empty",
});

/**
 * A Text Entry in base 16 bound to an integer: its default, 255, posts as `ff`, and its correct
 * value is 254.
 */
const hexItem = `<?xml version="1.0" encoding="UTF-8"?>
<qti-assessment-item xmlns="http://www.imsglobal.org/xsd/imsqtiasi_v3p0" identifier="hex" title="Hex" adaptive="false" time-dependent="false">
  <qti-response-declaration identifier="RESPONSE" cardinality="single" base-type="integer">
    <qti-correct-response><qti-value>254</qti-value></qti-correct-response>
  </qti-response-declaration>
  <qti-outcome-declaration identifier="SCORE" cardinality="single" base-type="float"/>
  <qti-item-body>
    <p>Write the largest two-digit hexadecimal number: <qti-text-entry-interaction response-identifier="RESPONSE" base="16"/></p>
  </qti-item-body>
  <qti-response-processing template="https://purl.imsglobal.org/spec/qti/v3p0/rptemplates/match_correct.xml"/>
</qti-assessment-item>`;

/**
 * An Inline Choice whose correct choice is `L`.
 */
const inlineItem = `<?xml version="1.0" encoding="UTF-8"?>
<qti-assessment-item xmlns="http://www.imsglobal.org/xsd/imsqtiasi_v3p0" identifier="river" title="River" adaptive="false" time-dependent="false">
  <qti-response-declaration identifier="RESPONSE" cardinality="single" base-type="identifier">
    <qti-correct-response><qti-value>L</qti-value></qti-correct-response>
  </qti-response-declaration>
  <qti-outcome-declaration identifier="SCORE" cardinality="single" base-type="float"/>
  <qti-item-body>
    <p>The longest river in France is the <qti-inline-choice-interaction response-identifier="RESPONSE" shuffle="false"><qti-inline-choice identifier="S">Seine</qti-inline-choice><qti-inline-choice identifier="L">Loire</qti-inline-choice></qti-inline-choice-interaction>.</p>
  </qti-item-body>
  <qti-response-processing template="https://purl.imsglobal.org/spec/qti/v3p0/rptemplates/match_correct.xml"/>
</qti-assessment-item>`;

/**
 * The items given a default here, one per kind plate renders, each default other than the correct
 * value but Match's, whose two correct pairs make its count known.
 */
const cases: readonly Case[] = [
  {
    defaults: [{ response: "RESPONSE", start: emptyAs("identifier", "single"), values: ["C"] }],
    location: "m2/items/p1-single-choice.xml",
  },
  {
    defaults: [
      { response: "RESPONSE", start: emptyAs("identifier", "single"), values: ["tree"] },
      {
        response: "HINT",
        start: {
          holds: {
            baseType: "boolean",
            cardinality: "single",
            values: [{ baseType: "boolean", value: false }],
          },
          kind: "empty",
        },
        values: ["true"],
      },
    ],
    location: "ei/items/end-attempt.xml",
  },
  {
    defaults: [{ response: "RESPONSE", start: atDefault, values: ["six"] }],
    location: "m2/items/p1-text-entry.xml",
  },
  {
    defaults: [{ response: "RESPONSE", start: atDefault, values: ["255"] }],
    location: "hex",
    xml: hexItem,
  },
  {
    defaults: [{ response: "RESPONSE", start: atDefault, values: ["S"] }],
    location: "river",
    xml: inlineItem,
  },
  {
    defaults: [{ response: "RESPONSE", start: atDefault, values: ["Once upon a time"] }],
    location: "m2/items/p2-extended-text.xml",
  },
  {
    defaults: [{ response: "RESPONSE", start: atDefault, values: ["D", "C", "B", "A"] }],
    location: "ei/items/order.xml",
  },
  {
    defaults: [
      { response: "RESPONSE", start: atDefault, values: ["TROWEL GARDENER", "ANVIL SMITH"] },
    ],
    location: "m3d/items/match.xml",
  },
  {
    defaults: [{ response: "RESPONSE", start: atDefault, values: ["C G1"] }],
    location: "m3d/items/gap-match.xml",
  },
  {
    defaults: [{ response: "RESPONSE", start: atDefault, values: ["LOG"] }],
    location: "m3d/items/hottext.xml",
  },
  {
    defaults: [{ response: "RESPONSE", start: atDefault, values: ["A"] }],
    location: "m3d/items/hotspot.xml",
  },
  {
    defaults: [{ response: "RESPONSE", start: atDefault, values: ["4"] }],
    location: "ei/items/slider.xml",
  },
];

/**
 * Write a default into a response's declaration, as its first child, where QTI's content model
 * puts `qti-default-value`.
 *
 * @param xml The item.
 * @param defaulted The response and its default's values, as written.
 * @returns The item with the default.
 */
const withDefault = (xml: string, defaulted: Defaulted): string => {
  const opening = new RegExp(
    `<qti-response-declaration identifier="${defaulted.response}"([^>]*?)(/?)>`,
    "u",
  );
  const found = opening.exec(xml) ?? assert.fail(`no declaration of ${defaulted.response}`);
  const values = defaulted.values.map((value) => `<qti-value>${value}</qti-value>`).join("");
  const written = `<qti-default-value>${values}</qti-default-value>`;
  const replacement =
    found[2] === "/"
      ? `<qti-response-declaration identifier="${defaulted.response}"${found[1] ?? ""}>${written}</qti-response-declaration>`
      : `${found[0]}${written}`;

  return xml.replace(found[0], replacement);
};

/**
 * Open an item, failing the test where `admitted` does not accept it.
 *
 * @param location The item's location.
 * @param xml The item's XML.
 * @returns The accepted item.
 */
const openXml = Effect.fnUntraced(function* openXml(location: string, xml: string) {
  const verdict = yield* admitted(location, new TextEncoder().encode(xml));

  return Option.getOrElse(acceptedItem(verdict), () =>
    assert.fail(`${location} is not accepted: ${verdict.verdict}`),
  );
});

/**
 * Open a case's item with its defaults written in.
 *
 * @param known The case.
 * @returns The accepted item.
 */
const openCase = Effect.fnUntraced(function* openCase(known: Case) {
  let xml =
    known.xml ??
    (yield* Effect.promise(() => readFile(path.join(fixtures, known.location), "utf-8")));
  for (const defaulted of known.defaults) {
    xml = withDefault(xml, defaulted);
  }

  return yield* openXml(known.location, xml);
});

/**
 * Every fixture item: each `.xml` file of a fixture's `items` folder, by its path under the
 * fixtures.
 */
const fixtureItems = Effect.promise(() =>
  readdir(fixtures, { recursive: true, withFileTypes: true }),
).pipe(
  Effect.map((entries) =>
    entries
      .filter((entry) => entry.isFile() && entry.name.endsWith(".xml"))
      .map((entry) => path.relative(fixtures, path.join(entry.parentPath, entry.name)))
      .filter((location) => location.split(path.sep).includes("items"))
      .toSorted(),
  ),
);

/**
 * Tell how the information model starts a response the item declares a default for: empty where a
 * Choice or an End Attempt is the first interaction to bind it, at its default otherwise.
 *
 * @param accepted The item.
 * @param response The response.
 * @param holds The value an empty start holds, for each of the two kinds.
 * @returns The start.
 */
const declaredStart = (accepted: Accepted, response: string, holds: Value): Start => {
  const first = interactionsIn(accepted.item.body).find((each) => each.response === response);

  return first?.kind === "choice" || first?.kind === "end-attempt"
    ? { holds, kind: "empty" }
    : atDefault;
};

/**
 * Give the secrets of an item a page must not hold: each correct value and mapping key of a base
 * type other than identifier and directed pair, in its lexical form, that no default of the item
 * holds. Identifiers alone are no secret, as every choice shows its own.
 *
 * @param accepted The item.
 * @returns The secrets.
 */
const secretsOf = (accepted: Accepted): readonly string[] => {
  const declarations = [...accepted.item.responses.values()];
  const defaults = new Set(
    declarations.flatMap((declaration) =>
      Option.toArray(declaration.defaultValue).flatMap((value) => value.values.map(format)),
    ),
  );

  return declarations
    .flatMap((declaration) => [
      ...Option.toArray(declaration.correct).flatMap((value) => value.values),
      ...Option.match(declaration.mapping, {
        onNone: () => [],
        onSome: (mapping) => mapping.entries.map((entry) => entry.key),
      }),
    ])
    .filter((single) => single.baseType !== "identifier" && single.baseType !== "directedPair")
    .map(format)
    .filter((secret) => !defaults.has(secret));
};

/**
 * Decode one response from what a page posts, through its posting.
 *
 * @param posting The response's posting.
 * @param entries The entries.
 * @returns The value, failing the test where the entries do not decode.
 */
const decodedFrom = (posting: Posting, entries: readonly Entry[]): ResponseValue =>
  Result.getOrElse(decode(entries, posting.binding, posting.options), (malformed) =>
    assert.fail(`${posting.identifier} does not decode: ${malformed.message}`),
  );

/**
 * Write a value as JSON, a bigint as its digits.
 *
 * @param value The value.
 * @returns The JSON text.
 */
const jsonOf = (value: Redacted): string => JSON.stringify(value, jsonField);

/**
 * Hold one item's start to the reading: each response it declares a default for starts at that
 * default, or with no entry where it starts empty; neither the start nor the redacted item holds a
 * secret.
 *
 * @param accepted The item.
 * @param starts How the information model starts each response declaring a default.
 * @param where The item, for the failure messages.
 */
const holdsStart = (
  accepted: Accepted,
  starts: ReadonlyMap<string, Start>,
  where: string,
): void => {
  const redacted = redact(accepted, shownToCandidate);
  const posted = postings(accepted, instance).flatMap((posting) => posting.start);
  const byResponse = new Map(
    postings(accepted, instance).map((posting) => [posting.identifier, posting]),
  );

  for (const [response, start] of starts) {
    const posting = byResponse.get(response) ?? assert.fail(`${where}: no posting of ${response}`);
    const declared = Option.getOrElse(
      Option.flatMap(
        Option.fromUndefinedOr(accepted.item.responses.get(response)),
        (declaration) => declaration.defaultValue,
      ),
      () => assert.fail(`${where}: ${response} declares no default`),
    );
    const value = decodedFrom(posting, posted);
    const expected = start.kind === "default" ? declared : start.holds;

    assert.isFalse("fields" in value, `${where}: ${response} decodes to a record`);

    if (!("fields" in value)) {
      assert.isTrue(
        match(value, expected) || (value.values.length === 0 && expected.values.length === 0),
        `${where}: ${response} starts at ${JSON.stringify(value.values.map(format))}, not ${JSON.stringify(expected.values.map(format))}`,
      );
    }
  }

  const json = jsonOf(redacted);

  assert.deepStrictEqual(
    secretsOf(accepted).filter(
      (secret) =>
        posted.some(([, text]) => text === secret) || json.includes(JSON.stringify(secret)),
    ),
    [],
    `${where}: a secret in the start or the redacted item`,
  );
};

/**
 * How the information model starts every response an item declares a default for
 * ({@link declaredStart}).
 *
 * @param accepted The item.
 * @returns Each defaulted response's start, by identifier.
 */
const declaredStarts = (accepted: Accepted): ReadonlyMap<string, Start> =>
  new Map(
    [...accepted.item.responses.values()].flatMap((declaration) =>
      Option.isSome(declaration.defaultValue)
        ? [
            [
              declaration.identifier,
              declaredStart(
                accepted,
                declaration.identifier,
                nullOf(declaration.baseType, declaration.cardinality),
              ),
            ] as const,
          ]
        : [],
    ),
  );

describe("a fresh attempt's start", () => {
  it.effect("is every fixture's response default, a Slider's 0.75 among them", () =>
    Effect.gen(function* fixtureDefaults() {
      const held: string[] = [];

      for (const location of yield* fixtureItems) {
        const xml = yield* Effect.promise(() => readFile(path.join(fixtures, location), "utf-8"));
        const verdict = yield* admitted(location, new TextEncoder().encode(xml));

        for (const accepted of Option.toArray(acceptedItem(verdict))) {
          const starts = declaredStarts(accepted);

          if (starts.size > 0) {
            held.push(location);
            holdsStart(accepted, starts, location);
          }
        }
      }

      const sliderFloat = path.join("ei", "items", "slider-float.xml");

      assert.includeMembers(held, [sliderFloat]);

      const accepted = yield* openXml(
        sliderFloat,
        yield* Effect.promise(() => readFile(path.join(fixtures, sliderFloat), "utf-8")),
      );

      assert.deepStrictEqual(
        postings(accepted, instance).flatMap((posting) => posting.start.map(([, text]) => text)),
        ["0.75"],
        "slider-float starts at its default",
      );
    }),
  );

  it.effect("is each kind's default, a Choice's and an End Attempt's none", () =>
    Effect.gen(function* kindDefaults() {
      for (const known of cases) {
        holdsStart(
          yield* openCase(known),
          new Map(known.defaults.map((defaulted) => [defaulted.response, defaulted.start])),
          known.location,
        );
      }
    }),
  );

  it.effect("gives way to a restored NULL, which posts nothing", () =>
    Effect.gen(function* restoredWins() {
      const known = cases.find((each) => each.location === "m2/items/p1-text-entry.xml");
      const accepted = yield* openCase(known ?? assert.fail("no text entry case"));
      const posting =
        postings(accepted, instance).find((each) => each.identifier === "RESPONSE") ??
        assert.fail("no posting of RESPONSE");
      const restored = restore(
        accepted,
        recordOf({ attempt: "submitted", responses: { RESPONSE: nullOf("string", "single") } }),
      );
      const shown = Option.getOrElse(own(restored.values, "RESPONSE"), () =>
        assert.fail("the record holds no RESPONSE"),
      );

      assert.deepStrictEqual(posting.start, [[posting.binding.name, "six"]]);
      assert.deepStrictEqual(encode(shown, posting.binding, posting.options), []);
    }),
  );

  it.effect(
    "is the default of every accepted corpus item that declares one",
    () =>
      Effect.gen(function* corpusDefaults() {
        for (const member of yield* openCorpus) {
          for (const accepted of Option.toArray(acceptedOf(member))) {
            const starts = declaredStarts(accepted);

            if (starts.size > 0) {
              holdsStart(accepted, starts, member.location);
            }
          }
        }
      }),
    { tags: ["corpus"], timeout: 600_000 },
  );
});
