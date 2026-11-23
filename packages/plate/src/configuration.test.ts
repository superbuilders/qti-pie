import { assert, describe, it } from "@effect/vitest";
import { Effect, Option } from "effect";
import { configure } from "#plate/configuration.ts";

/**
 * The inputs `configure` refuses, each with the key its refusal names: a value outside its field's
 * range, a value of another type (the text of a number among them), and a key that names no field,
 * every item session control setting among them, validate-responses (the QTI database's) included.
 */
const refused = [
  { field: "headingLevel", input: { headingLevel: 1, seed: "" } },
  { field: "headingLevel", input: { headingLevel: "3", seed: "" } },
  { field: "headingLevel", input: { headingLevel: "", seed: "" } },
  { field: "outputBudget", input: { outputBudget: "1e3", seed: "" } },
  { field: "validateResponses", input: { seed: "", validateResponses: false } },
  { field: "seed", input: { seed: 7 } },
  { field: "showSolutions", input: { seed: "", showSolutions: true } },
  { field: "trust", input: { seed: "", trust: "full" } },
  { field: "locale", input: { locale: "fr", seed: "" } },
  { field: "hotspotPicks", input: { hotspotPicks: "shade", seed: "" } },
  { field: "hotspotPicks", input: { hotspotPicks: true, seed: "" } },
  { field: "hotspotList", input: { hotspotList: "hidden", seed: "" } },
  { field: "hotspotList", input: { hotspotList: false, seed: "" } },
  { field: "picksInstruction", input: { picksInstruction: "true", seed: "" } },
  { field: "bankCaption", input: { bankCaption: "true", seed: "" } },
  { field: "textEntryKeypad", input: { seed: "", textEntryKeypad: "onscreen" } },
  { field: "textEntryKeypad", input: { seed: "", textEntryKeypad: true } },
  { field: "maxAttempts", input: { maxAttempts: 1, seed: "" } },
  { field: "showFeedback", input: { seed: "", showFeedback: true } },
  { field: "outputBudget", input: { outputBudget: 0, seed: "" } },
  {
    field: "outputBudget",
    input: { outputBudget: 536_870_889, seed: "" },
  },
  {
    field: "assets",
    input: {
      assets: [["/items/a.png", "https://cdn.example/a"]],
      seed: "",
    },
  },
  {
    field: "assets",
    input: { assets: [["", "https://cdn.example/a"]], seed: "" },
  },
  {
    field: "assets",
    input: {
      assets: [["items/../a.png", "https://cdn.example/a"]],
      seed: "",
    },
  },
  {
    field: "assets",
    input: {
      assets: [["./items/a.png", "https://cdn.example/a"]],
      seed: "",
    },
  },
  {
    field: "assets",
    input: {
      assets: [["items/a.png", "https://cdn.example/a b"]],
      seed: "",
    },
  },
  {
    field: "assets",
    input: {
      assets: [["items/a.png", ",https://cdn.example/a"]],
      seed: "",
    },
  },
  {
    field: "assets",
    input: {
      assets: [["items/a.png", "https://cdn.example/a,"]],
      seed: "",
    },
  },
  {
    field: "assets",
    input: {
      assets: [["items/a.png", "https://cdn.example/a\n"]],
      seed: "",
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
    },
  },
  { field: "assets", input: { assets: [["items/a.png"]], seed: "" } },
  {
    field: "assets",
    input: {
      assets: new Map([["items/a.png", "https://cdn.example/a"]]),
      seed: "",
    },
  },
] as const;

describe("configure", () => {
  it.effect("gives every default for a configuration of its two required fields alone", () =>
    Effect.gen(function* everyDefault() {
      assert.deepStrictEqual(yield* configure({ seed: "7" }), {
        assets: new Map(),
        bankCaption: false,
        headingLevel: 2,
        hotspotList: "shown",
        hotspotPicks: "ring",
        locale: "en",
        outputBudget: 16_777_216,
        picksInstruction: false,
        seed: "7",
        textEntryKeypad: "none",
      });
    }),
  );

  it.effect('requires a seed, and decodes seed "7" as "7"', () =>
    Effect.gen(function* seedKey() {
      const error = yield* Effect.flip(configure({}));

      assert.deepStrictEqual(error.field, Option.some("seed"));
      assert.strictEqual((yield* configure({ seed: "7" })).seed, "7");
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
      assert.strictEqual((yield* configure({ headingLevel: 6, seed: "" })).headingLevel, 6);
    }),
  );

  it.effect('decodes hotspotPicks "fill" and hotspotList "visually-hidden"', () =>
    Effect.gen(function* quietHotspots() {
      const { hotspotList, hotspotPicks } = yield* configure({
        hotspotList: "visually-hidden",
        hotspotPicks: "fill",
        seed: "",
      });

      assert.deepStrictEqual([hotspotList, hotspotPicks], ["visually-hidden", "fill"]);
    }),
  );

  it.effect('decodes textEntryKeypad "on-screen"', () =>
    Effect.gen(function* onScreenKeypad() {
      const { textEntryKeypad } = yield* configure({
        seed: "",
        textEntryKeypad: "on-screen",
      });

      assert.strictEqual(textEntryKeypad, "on-screen");
    }),
  );

  it.effect('decodes textEntryKeypad "host"', () =>
    Effect.gen(function* hostKeypad() {
      const { textEntryKeypad } = yield* configure({
        seed: "",
        textEntryKeypad: "host",
      });

      assert.strictEqual(textEntryKeypad, "host");
    }),
  );

  it.effect("decodes outputBudget 536,870,888, the longest string V8 builds", () =>
    Effect.gen(function* longestBudget() {
      assert.strictEqual(
        (yield* configure({ outputBudget: 536_870_888, seed: "" })).outputBudget,
        536_870_888,
      );
    }),
  );

  it.effect("refuses a key that names no field, and its message names the fields there are", () =>
    Effect.gen(function* unknownKey() {
      const error = yield* Effect.flip(configure({ seed: "", showSolutions: true }));

      assert.include(error.message, "has no field showSolutions");
      assert.include(error.message, "outputBudget, picksInstruction, seed, textEntryKeypad");
    }),
  );

  it.effect(
    "decodes assets written as [path, address] entries into the map from each path to its address, keeping a space in a name and an address's query and fragment, and a null address as a file the host withholds",
    () =>
      Effect.gen(function* assetEntries() {
        const { assets } = yield* configure({
          assets: [
            ["items/media/a b.png", "https://cdn.example/sha256/9f86"],
            ["items/q1.xml", "/packages/p/files/items/q1.xml?x=1#y"],
            ["items/media/narration.wav", null],
          ],
          seed: "",
        });

        assert.deepStrictEqual(
          [...assets],
          [
            ["items/media/a b.png", { address: "https://cdn.example/sha256/9f86", kind: "served" }],
            ["items/q1.xml", { address: "/packages/p/files/items/q1.xml?x=1#y", kind: "served" }],
            ["items/media/narration.wav", { kind: "withheld" }],
          ],
        );
      }),
  );
});
