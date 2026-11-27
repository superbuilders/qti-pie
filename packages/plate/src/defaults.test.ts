import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
/**
 * Every response starts at its default (spec reading `response-default`), held over real items
 * against the information model and each item's own declarations, through what a host starts a
 * fresh attempt from, `startingResponses` (`#plate/starting.ts`):
 *
 * - **The start is the default.** Each response starts at its declared `qti-default-value`, "set to
 *   this value at the start of the first attempt" (information model 2.2.2.2). A Choice, which "is
 *   always initialized with no choices selected" (2.4.1.1), and an End Attempt, whose response's
 *   "default value ... is always ignored" (2.4.5), start empty whatever their default: NULL, and
 *   End Attempt's `false`.
 * - **No secret.** Neither the start nor the redacted item holds a correct value or a mapping key the
 *   default does not hold.
 * - **Restored values win.** After an attempt that cleared a defaulted response, the record the
 *   database returns holds NULL for it, which shows nothing, not the default.
 *
 * The items are every fixture and every accepted corpus item whose response declares a default.
 * Among the fixtures, beside each of ten of another kind, is its copy with a default written into a
 * response (`<name>-default.xml`), a value other than the correct one where the item has one, so
 * the sweep meets a default on every kind plate renders, and `defaults/items/` holds two items of
 * its own: an Inline Choice, and a Text Entry in base 16, whose default 255 its box shows as `ff`.
 *
 * @module
 */
import { assert, describe, it } from "@effect/vitest";
import { Effect, Option } from "effect";
import { interactionsIn } from "#plate/model/interactions.ts";
import { recordOf } from "#plate/test/records.ts";
import { format, isNullResponse, nullOf, own } from "#plate/model/values.ts";
import { isRecordValue } from "#plate/model/record-value.ts";
import type { Responses, ResponseValue, Value } from "#plate/model/values.ts";
import { redact } from "#plate/redact.ts";
import type { Redacted } from "#plate/redact/walk.ts";
import { sameResponse } from "#plate/held.ts";
import { restore } from "#plate/restore.ts";
import { startingResponses } from "#plate/starting.ts";
import { jsonField } from "#plate/test/fixtures.ts";
import { feedbackHidden, shownToCandidate } from "#plate/test/page.ts";
import { admitted } from "#plate/test/admitted.ts";
import { acceptedItem } from "#plate/validate/verdict.ts";
import type { Accepted } from "#plate/validate/verdict.ts";

/**
 * The fixtures' root.
 */
const fixtures = path.resolve(import.meta.dirname, "..", "fixtures");

/**
 * How a response starts, by the information model: at its default, or empty whatever its default,
 * holding NULL, or End Attempt's `false`.
 */
type Start = { readonly kind: "default" } | { readonly kind: "empty"; readonly holds: Value };

/**
 * Starting at the default.
 */
const atDefault: Start = { kind: "default" };

/**
 * The value an End Attempt's response starts at whatever its default: `false`, the response's
 * value until the candidate ends the attempt with it (information model 2.4.5).
 */
const endAttemptStart: Value = {
  baseType: "boolean",
  cardinality: "single",
  values: [{ baseType: "boolean", value: false }],
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
 * Open a fixture item by its path under the fixtures.
 *
 * @param location The item's path under the fixtures.
 * @returns The accepted item.
 */
const openFixture = Effect.fnUntraced(function* openFixture(location: string) {
  return yield* openXml(
    location,
    yield* Effect.promise(() => readFile(path.join(fixtures, location), "utf-8")),
  );
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
 * Choice or an End Attempt is the first interaction to bind it, a Choice's holding NULL ("always
 * initialized with no choices selected", 2.4.1.1) and an End Attempt's `false` (its default "is
 * always ignored", 2.4.5), at its default otherwise.
 *
 * @param accepted The item.
 * @param response The response.
 * @param holds The NULL of the response's type, which an empty Choice's start holds.
 * @returns The start.
 */
const declaredStart = (accepted: Accepted, response: string, holds: Value): Start => {
  const first = interactionsIn(accepted.item.body).find((each) => each.response === response);

  if (first?.kind === "end-attempt") {
    return { holds: endAttemptStart, kind: "empty" };
  }

  return first?.kind === "choice" ? { holds, kind: "empty" } : atDefault;
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
 * Give the value a start holds for a response, failing the test where it holds none.
 *
 * @param started The start.
 * @param response The response.
 * @param where The item, for the failure message.
 * @returns The value.
 */
const startedAt = (started: Responses, response: string, where: string): ResponseValue =>
  (Object.hasOwn(started, response) ? started[response] : undefined) ??
  assert.fail(`${where}: the start holds no ${response}`);

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
  const redacted = redact(accepted, shownToCandidate, feedbackHidden);
  const started = startingResponses(accepted, feedbackHidden);

  for (const [response, start] of starts) {
    const declared = Option.getOrElse(
      Option.flatMap(
        Option.fromUndefinedOr(accepted.item.responses.get(response)),
        (declaration) => declaration.defaultValue,
      ),
      () => assert.fail(`${where}: ${response} declares no default`),
    );
    const value = startedAt(started, response, where);
    const expected = start.kind === "default" ? declared : start.holds;

    assert.isFalse(isRecordValue(value), `${where}: ${response} starts as a record`);

    if (!isRecordValue(value)) {
      assert.isTrue(
        sameResponse(value, expected),
        `${where}: ${response} starts at ${JSON.stringify(value.values.map(format))}, not ${JSON.stringify(expected.values.map(format))}`,
      );
    }
  }

  const startedTexts = new Set(
    Object.values(started).flatMap((value) =>
      isRecordValue(value) ? [] : value.values.map(format),
    ),
  );
  const json = jsonOf(redacted);

  assert.deepStrictEqual(
    secretsOf(accepted).filter(
      (secret) => startedTexts.has(secret) || json.includes(JSON.stringify(secret)),
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
  it.effect(
    "is every fixture's response default, each kind's defaulted copy among them, a Choice's and an End Attempt's none, and a Slider's 0.75",
    () =>
      Effect.gen(function* fixtureDefaults() {
        const held: string[] = [];
        const locations = yield* fixtureItems;

        for (const location of locations) {
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

        assert.includeMembers(
          held,
          [
            sliderFloat,
            ...locations.filter(
              (location) =>
                location.endsWith("-default.xml") ||
                location.startsWith(path.join("defaults", "items")),
            ),
          ],
          "each fixture with a default written in declares it",
        );

        const accepted = yield* openFixture(sliderFloat);

        assert.deepStrictEqual(
          startingResponses(accepted, feedbackHidden),
          {
            RESPONSE: {
              baseType: "float",
              cardinality: "single",
              values: [{ baseType: "float", value: 0.75 }],
            },
          },
          "slider-float starts at its default",
        );
      }),
  );

  it.effect("gives way to a restored NULL, which shows nothing", () =>
    Effect.gen(function* restoredWins() {
      const location = path.join("m2", "items", "p1-text-entry-default.xml");
      const accepted = yield* openFixture(location);
      const started = startedAt(startingResponses(accepted, feedbackHidden), "RESPONSE", location);
      const restored = restore(
        accepted,
        recordOf({ attempt: "submitted", responses: { RESPONSE: nullOf("string", "single") } }),
      );
      const shown = Option.getOrElse(own(restored.values, "RESPONSE"), () =>
        assert.fail("the record holds no RESPONSE"),
      );

      assert.deepStrictEqual(started, {
        baseType: "string",
        cardinality: "single",
        values: [{ baseType: "string", value: "six" }],
      });
      assert.isTrue(isNullResponse(shown));
    }),
  );
});
