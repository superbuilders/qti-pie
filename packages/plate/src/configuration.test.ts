import { assert, describe, it } from "@effect/vitest";
import { exhaust } from "@bjornpagen/testing/explore";
import { requiredInSpace } from "@bjornpagen/testing/features";
import { array, constant, element, int, map, oneOf } from "@bjornpagen/testing/gen";
import type { Gen } from "@bjornpagen/testing/gen";
import { searched } from "@bjornpagen/testing/vitest";
import { Array as Arr, Duration, Effect, Formatter, Option } from "effect";
import { configure } from "#plate/configuration.ts";
import type { Configuration, ConfigurationInput } from "#plate/configuration.ts";
import { boxHolds } from "#plate/test/box.ts";

/**
 * A case of the field box: one field a host sets beside the seed, the others left to their
 * defaults, so a refusal can name no field but that one.
 */
type FieldCase =
  | { readonly field: "headingLevel"; readonly value: number }
  | { readonly field: "outputBudget"; readonly value: number }
  | {
      readonly entries: readonly (readonly [path: string, address: string | null])[];
      readonly field: "assets";
    };

/**
 * V8's longest string, `String::kMaxLength` on a 64-bit build, `(1 << 29) - 24` characters: the
 * largest output budget a page can spend, since no engine builds a longer string.
 */
const longestString = 2 ** 29 - 24;

/**
 * The segments a path of the path box is written with: a name, and the three segments RFC 3986's
 * path grammar gives a meaning of their own, `.` and `..`, which a reader resolves away (section
 * 5.2.4), and the empty one, which a path from a host's root starts with and a directory ends with
 * (section 3.3).
 */
const PATH_SEGMENTS = ["a", ".", "..", ""] as const;

/**
 * The characters an address of the address box is written with: a letter of a URL, the comma the
 * HTML srcset parser strips from a candidate's ends, and the five ASCII whitespace characters it
 * splits a candidate at (HTML, "parse a srcset attribute").
 */
const ADDRESS_ALPHABET = ["a", ",", " ", "\t", "\n", "\f", "\r"] as const;

/**
 * An address every host may serve a file at.
 */
const servedAddress = "https://cdn.example/a";

/**
 * Draw a heading level from -1 to 8, around the 2 to 6 a page's item headings take.
 */
const headingCase: Gen<FieldCase> = map(int(-1, 8), (value): FieldCase => ({
  field: "headingLevel",
  value,
}));

/**
 * Draw an output budget at each end of 1 to {@link longestString}: two either side of each.
 */
const budgetCase: Gen<FieldCase> = map(
  oneOf([int(-1, 2), int(longestString - 1, longestString + 2)]),
  (value): FieldCase => ({ field: "outputBudget", value }),
);

/**
 * Draw one asset entry whose path is 1 to 3 of {@link PATH_SEGMENTS}, its address served.
 */
const pathCase: Gen<FieldCase> = map(
  array(element(PATH_SEGMENTS), { max: 3, min: 1 }),
  (segments): FieldCase => ({ entries: [[segments.join("/"), servedAddress]], field: "assets" }),
);

/**
 * Draw one asset entry of a file's path whose address is withheld, `null`, or 0 to 3 of
 * {@link ADDRESS_ALPHABET}.
 */
const addressCase: Gen<FieldCase> = map(
  oneOf([
    constant(null),
    map(array(element(ADDRESS_ALPHABET), { max: 3, min: 0 }), (characters) => characters.join("")),
  ]),
  (address): FieldCase => ({ entries: [["items/a.png", address]], field: "assets" }),
);

/**
 * Draw two asset entries, each of path `a` or `b` and of one of two served addresses.
 */
const pairCase: Gen<FieldCase> = (source) => {
  const entry = (): readonly [string, string] => [
    source.draw(element(["a", "b"])),
    source.draw(element([servedAddress, "https://cdn.example/b"])),
  ];

  return { entries: [entry(), entry()], field: "assets" };
};

/**
 * Draw a case of the field box: {@link headingCase}, {@link budgetCase}, {@link pathCase},
 * {@link addressCase} or {@link pairCase}.
 */
const fieldBox: Gen<FieldCase> = oneOf([headingCase, budgetCase, pathCase, addressCase, pairCase]);

/**
 * How many cases {@link fieldBox} draws: 10 heading levels, 8 budgets, 4 + 16 + 64 paths, the
 * withheld address and 1 + 7 + 49 + 343 written ones, and 16 pairs.
 */
const FIELD_CASES = 10 + 8 + (4 + 16 + 64) + (1 + 1 + 7 + 49 + 343) + 16;

/**
 * Whether a path names a file from the package root, as RFC 3986 reads a path's segments: some
 * text, neither from a host's root (a `/` first) nor a directory (a `/` last), and no `.` or `..`
 * segment, which a reader resolves away.
 *
 * @param path The path.
 * @returns Whether it names a file.
 */
const namesAFile = (path: string): boolean =>
  path !== "" &&
  !path.startsWith("/") &&
  !path.endsWith("/") &&
  path.split("/").every((segment) => segment !== "." && segment !== "..");

/**
 * Whether an address is one srcset candidate's URL wherever the shell writes it: some text holding
 * no ASCII whitespace, where the HTML srcset parser splits a candidate, and starting and ending
 * with no comma, which it strips from a URL's ends.
 *
 * @param address The address.
 * @returns Whether it is one URL.
 */
const isOneUrl = (address: string): boolean =>
  address !== "" &&
  !address.startsWith(",") &&
  !address.endsWith(",") &&
  !Arr.fromIterable(address).some((character) => "\t\n\f\r ".includes(character));

/**
 * The field the oracle expects `configure` to refuse a case for: a heading level outside 2 to 6
 * (the host's own heading is `h1`, and HTML's last is `h6`), a budget outside 1 to
 * {@link longestString}, or assets holding a path that names no file, an address that is no one URL,
 * or one path in two entries.
 *
 * @param fieldCase The case.
 * @returns The field it is refused for; `None` when every value is in its field's domain.
 */
const refusedFieldOf = (fieldCase: FieldCase): Option.Option<string> => {
  switch (fieldCase.field) {
    case "headingLevel": {
      return fieldCase.value >= 2 && fieldCase.value <= 6
        ? Option.none()
        : Option.some("headingLevel");
    }
    case "outputBudget": {
      return fieldCase.value >= 1 && fieldCase.value <= longestString
        ? Option.none()
        : Option.some("outputBudget");
    }
    case "assets": {
      const paths = fieldCase.entries.map(([path]) => path);
      const held =
        paths.every(namesAFile) &&
        fieldCase.entries.every(([, address]) => address === null || isOneUrl(address)) &&
        new Set(paths).size === paths.length;

      return held ? Option.none() : Option.some("assets");
    }
  }
};

/**
 * The settings a case writes: its one field beside the seed.
 *
 * @param fieldCase The case.
 * @returns The input `configure` reads.
 */
const inputOf = (fieldCase: FieldCase): ConfigurationInput => {
  switch (fieldCase.field) {
    case "headingLevel": {
      return { headingLevel: fieldCase.value, seed: "" };
    }
    case "outputBudget": {
      return { outputBudget: fieldCase.value, seed: "" };
    }
    case "assets": {
      return { assets: fieldCase.entries, seed: "" };
    }
  }
};

/**
 * The field a case sets as a configuration holds it, and as the oracle expects it decoded: the
 * number given, or each path's file served at its address or withheld for `null`.
 *
 * @param fieldCase The case.
 * @param configuration The configuration `configure` decoded.
 * @returns The decoded field and the oracle's.
 */
const decodedAndExpected = (
  fieldCase: FieldCase,
  configuration: Configuration,
): readonly [decoded: unknown, oracle: unknown] => {
  switch (fieldCase.field) {
    case "headingLevel": {
      return [configuration.headingLevel, fieldCase.value];
    }
    case "outputBudget": {
      return [configuration.outputBudget, fieldCase.value];
    }
    case "assets": {
      return [
        [...configuration.assets],
        fieldCase.entries.map(([path, address]) => [
          path,
          address === null ? { kind: "withheld" } : { address, kind: "served" },
        ]),
      ];
    }
  }
};

/**
 * What a case of the field box reaches: each field decoded and refused.
 */
const fieldSituations = [
  "headingLevel decoded",
  "headingLevel refused",
  "outputBudget decoded",
  "outputBudget refused",
  "assets decoded",
  "assets refused",
] as const;

/**
 * A {@link fieldSituations} member.
 */
type FieldSituation = (typeof fieldSituations)[number];

/**
 * A case of the field box may run this long before it is stopped and reported.
 */
const caseHang = Duration.seconds(30);

describe("configure", () => {
  it.effect(
    `refuses every value outside its field's domain, naming the field, and decodes every other: ${String(FIELD_CASES)} configurations`,
    (ctx) =>
      Effect.andThen(
        boxHolds(fieldBox, FIELD_CASES),
        searched(
          ctx,
          exhaust(
            {
              box: "one field beside the seed: a heading level of -1 to 8; an output budget two either side of 1 and of V8's longest string; one asset entry whose path is 1 to 3 of a name, ., .. and the empty segment, or whose address is null or 0 to 3 of a letter, the comma and the five ASCII whitespace characters; or two entries over two paths and two addresses",
              caseHang,
              coverage: requiredInSpace<FieldSituation>(fieldSituations),
              generator: fieldBox,
              literal: Formatter.format,
              oracle: {
                kind: "specification",
                name: "each field's domain as plate's configuration states it, transcribed here: a heading level of 2 to 6 under the host's h1, a budget of 1 to V8's longest string, and assets of distinct paths that name a file as RFC 3986 reads segments, each served at one srcset URL (HTML's srcset parser) or withheld; a value outside is refused naming its field, every other decoded as given",
              },
              suite: "plate/configuration/fields",
            },
            (drawn, c) =>
              Effect.gen(function* holdsItsDomain() {
                const refusedField = refusedFieldOf(drawn);

                if (Option.isNone(refusedField)) {
                  c.note(`${drawn.field} decoded`);

                  const [decoded, oracle] = decodedAndExpected(
                    drawn,
                    yield* configure(inputOf(drawn)),
                  );

                  assert.deepStrictEqual(decoded, oracle);

                  return;
                }

                c.note(`${drawn.field} refused`);

                const error = yield* Effect.flip(configure(inputOf(drawn)));

                assert.strictEqual(error._tag, "InvalidConfiguration");
                assert.deepStrictEqual(error.field, refusedField);
              }),
          ),
        ),
      ),
  );

  it.effect(
    "refuses a key an object built apart from its call carries past the type, and its message names the fields there are",
    () =>
      Effect.gen(function* unknownKey() {
        const settings = { seed: "", showSolutions: true };
        const error = yield* Effect.flip(configure(settings));

        assert.include(error.message, "has no field showSolutions");
        assert.include(error.message, "outputBudget, seed, textEntryKeypad");
      }),
  );
});
