import { assert, describe, it } from "@effect/vitest";
import { Effect, Option } from "effect";
import { configure } from "#plate/configuration.ts";

/**
 * The inputs `configure` refuses, each with the key its refusal names: a value outside its field's
 * range, a value of another type (the text of a number or a boolean among them), and a key that
 * names no field, an item session control setting other than validate-responses among them.
 */
const refused = [
  { field: "headingLevel", input: { headingLevel: 1, seed: "", validateResponses: false } },
  { field: "headingLevel", input: { headingLevel: "3", seed: "", validateResponses: false } },
  { field: "headingLevel", input: { headingLevel: "", seed: "", validateResponses: false } },
  { field: "outputBudget", input: { outputBudget: "1e3", seed: "", validateResponses: false } },
  { field: "validateResponses", input: { seed: "", validateResponses: "true" } },
  { field: "seed", input: { seed: 7, validateResponses: false } },
  { field: "showSolutions", input: { seed: "", showSolutions: true, validateResponses: false } },
  { field: "trust", input: { seed: "", trust: "full", validateResponses: false } },
  { field: "locale", input: { locale: "fr", seed: "", validateResponses: false } },
  { field: "hotspotPicks", input: { hotspotPicks: "shade", seed: "", validateResponses: false } },
  { field: "hotspotPicks", input: { hotspotPicks: true, seed: "", validateResponses: false } },
  { field: "hotspotList", input: { hotspotList: "hidden", seed: "", validateResponses: false } },
  { field: "hotspotList", input: { hotspotList: false, seed: "", validateResponses: false } },
  { field: "maxAttempts", input: { maxAttempts: 1, seed: "", validateResponses: false } },
  { field: "showFeedback", input: { seed: "", showFeedback: true, validateResponses: false } },
  { field: "outputBudget", input: { outputBudget: 0, seed: "", validateResponses: false } },
  {
    field: "outputBudget",
    input: { outputBudget: 536_870_889, seed: "", validateResponses: false },
  },
  {
    field: "assets",
    input: {
      assets: [["/items/a.png", "https://cdn.example/a"]],
      seed: "",
      validateResponses: false,
    },
  },
  {
    field: "assets",
    input: { assets: [["", "https://cdn.example/a"]], seed: "", validateResponses: false },
  },
  {
    field: "assets",
    input: {
      assets: [["items/../a.png", "https://cdn.example/a"]],
      seed: "",
      validateResponses: false,
    },
  },
  {
    field: "assets",
    input: {
      assets: [["./items/a.png", "https://cdn.example/a"]],
      seed: "",
      validateResponses: false,
    },
  },
  {
    field: "assets",
    input: {
      assets: [["items/a.png", "https://cdn.example/a b"]],
      seed: "",
      validateResponses: false,
    },
  },
  {
    field: "assets",
    input: {
      assets: [["items/a.png", ",https://cdn.example/a"]],
      seed: "",
      validateResponses: false,
    },
  },
  {
    field: "assets",
    input: {
      assets: [["items/a.png", "https://cdn.example/a,"]],
      seed: "",
      validateResponses: false,
    },
  },
  {
    field: "assets",
    input: {
      assets: [["items/a.png", "https://cdn.example/a\n"]],
      seed: "",
      validateResponses: false,
    },
  },
  {
    field: "assets",
    input: {
      assets: [
        ["items/a.png", "https://cdn.example/a"],
        ["items/a.png", "https://cdn.example/b"],
      ],
      seed: "",
      validateResponses: false,
    },
  },
  {
    field: "assets",
    input: {
      assets: [
        ["items/a.png", "https://cdn.example/a"],
        ["items/a.png", "https://cdn.example/a"],
      ],
      seed: "",
      validateResponses: false,
    },
  },
  { field: "assets", input: { assets: [["items/a.png"]], seed: "", validateResponses: false } },
  {
    field: "assets",
    input: {
      assets: new Map([["items/a.png", "https://cdn.example/a"]]),
      seed: "",
      validateResponses: false,
    },
  },
] as const;

describe("configure", () => {
  it.effect("gives every default for a configuration of its two required fields alone", () =>
    Effect.gen(function* everyDefault() {
      assert.deepStrictEqual(yield* configure({ seed: "7", validateResponses: false }), {
        assets: new Map(),
        headingLevel: 2,
        hotspotList: "shown",
        hotspotPicks: "ring",
        locale: "en",
        outputBudget: 16_777_216,
        seed: "7",
        validateResponses: false,
      });
    }),
  );

  it.effect("requires validateResponses, which has no default: a stage states it", () =>
    Effect.gen(function* statedValidation() {
      const error = yield* Effect.flip(configure({ seed: "7" }));

      assert.deepStrictEqual(error.field, Option.some("validateResponses"));
      assert.isTrue((yield* configure({ seed: "7", validateResponses: true })).validateResponses);
    }),
  );

  it.effect('requires a seed, and decodes seed "7" as "7"', () =>
    Effect.gen(function* seedKey() {
      const error = yield* Effect.flip(configure({ validateResponses: false }));

      assert.deepStrictEqual(error.field, Option.some("seed"));
      assert.strictEqual((yield* configure({ seed: "7", validateResponses: false })).seed, "7");
    }),
  );

  for (const { field, input } of refused) {
    it.effect(`refuses ${JSON.stringify(input)}, naming ${field}`, () =>
      Effect.gen(function* refusal() {
        const error = yield* Effect.flip(configure(input));

        assert.strictEqual(error._tag, "InvalidConfiguration");
        assert.deepStrictEqual(error.field, Option.some(field));
      }),
    );
  }

  it.effect("decodes headingLevel 6", () =>
    Effect.gen(function* deepestHeading() {
      assert.strictEqual(
        (yield* configure({ headingLevel: 6, seed: "", validateResponses: false })).headingLevel,
        6,
      );
    }),
  );

  it.effect('decodes hotspotPicks "fill" and hotspotList "visually-hidden"', () =>
    Effect.gen(function* quietHotspots() {
      const { hotspotList, hotspotPicks } = yield* configure({
        hotspotList: "visually-hidden",
        hotspotPicks: "fill",
        seed: "",
        validateResponses: false,
      });

      assert.deepStrictEqual([hotspotList, hotspotPicks], ["visually-hidden", "fill"]);
    }),
  );

  it.effect("decodes outputBudget 536,870,888, the longest string V8 builds", () =>
    Effect.gen(function* longestBudget() {
      assert.strictEqual(
        (yield* configure({ outputBudget: 536_870_888, seed: "", validateResponses: false }))
          .outputBudget,
        536_870_888,
      );
    }),
  );

  it.effect("refuses a key that names no field, and its message names the fields there are", () =>
    Effect.gen(function* unknownKey() {
      const error = yield* Effect.flip(
        configure({ seed: "", showSolutions: true, validateResponses: false }),
      );

      assert.include(error.message, "has no field showSolutions");
      assert.include(error.message, "seed, validateResponses");
    }),
  );

  it.effect(
    "decodes assets written as [path, address] entries into the map from each path to its address, keeping a space in a name and an address's query and fragment",
    () =>
      Effect.gen(function* assetEntries() {
        const { assets } = yield* configure({
          assets: [
            ["items/media/a b.png", "https://cdn.example/sha256/9f86"],
            ["items/q1.xml", "/packages/p/files/items/q1.xml?x=1#y"],
          ],
          seed: "",
          validateResponses: false,
        });

        assert.deepStrictEqual(
          [...assets],
          [
            ["items/media/a b.png", "https://cdn.example/sha256/9f86"],
            ["items/q1.xml", "/packages/p/files/items/q1.xml?x=1#y"],
          ],
        );
      }),
  );
});
