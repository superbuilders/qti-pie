import { assert, describe, it } from "@effect/vitest";
import { Effect, Option } from "effect";
import { configure } from "#plate/configuration.ts";

/**
 * The settings `configure` refuses when it runs, each well typed, with the key its refusal names:
 * a value outside its field's range, an asset path or address of the wrong form, and one path in
 * two entries, which no type states.
 */
const refused = [
  { field: "headingLevel", input: { headingLevel: 1, seed: "" } },
  { field: "headingLevel", input: { headingLevel: 7, seed: "" } },
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
] as const;

/**
 * The settings no call of `configure` compiles with, its input typed by the schema's encoded side
 * (`ConfigurationInput`): the type test is each `@ts-expect-error` below, which `tsc` fails on if
 * its call ever type-checks. A key the schema does not name, a misspelt one or one it has dropped
 * (validate-responses, the QTI database's, and every other item session control setting), a value
 * of another type (the text of a number among them), an asset entry of another shape, and a
 * missing seed. No test calls it.
 *
 * @returns The calls, never run.
 */
const neverCompiles = () => [
  // @ts-expect-error -- validateResponses is a key the schema dropped: the QTI database judges it.
  configure({ seed: "", validateResponses: false }),
  // @ts-expect-error -- showSolutions is no field of the configuration.
  configure({ seed: "", showSolutions: true }),
  // @ts-expect-error -- headingLvl misspells headingLevel.
  configure({ headingLvl: 3, seed: "" }),
  // @ts-expect-error -- trust is no field of the configuration.
  configure({ seed: "", trust: "full" }),
  // @ts-expect-error -- maxAttempts is an item session control setting, no field of plate's.
  configure({ maxAttempts: 1, seed: "" }),
  // @ts-expect-error -- showFeedback is an item session control setting, no field of plate's.
  configure({ seed: "", showFeedback: true }),
  // @ts-expect-error -- the text of a number is no heading level.
  configure({ headingLevel: "3", seed: "" }),
  // @ts-expect-error -- the text of a number is no output budget.
  configure({ outputBudget: "1e3", seed: "" }),
  // @ts-expect-error -- a seed is a string.
  configure({ seed: 7 }),
  // @ts-expect-error -- a seed is required.
  configure({}),
  // @ts-expect-error -- fr is no supported locale.
  configure({ locale: "fr", seed: "" }),
  // @ts-expect-error -- shade is no way a Hotspot shows a pick.
  configure({ hotspotPicks: "shade", seed: "" }),
  // @ts-expect-error -- hidden is no way a Hotspot shows its list.
  configure({ hotspotList: "hidden", seed: "" }),
  // @ts-expect-error -- the text of a boolean is no boolean.
  configure({ picksInstruction: "true", seed: "" }),
  // @ts-expect-error -- the text of a boolean is no boolean.
  configure({ bankCaption: "true", seed: "" }),
  // @ts-expect-error -- onscreen misspells on-screen.
  configure({ seed: "", textEntryKeypad: "onscreen" }),
  // @ts-expect-error -- an entry is a path and an address.
  configure({ assets: [["items/a.png"]], seed: "" }),
  // @ts-expect-error -- assets are written as entries, never as a map.
  configure({ assets: new Map([["items/a.png", "https://cdn.example/a"]]), seed: "" }),
];

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

  it("refuses in its type every key the schema does not name, every value of another type and a missing seed", () => {
    assert.isFunction(neverCompiles);
  });

  it.effect('decodes seed "7" as "7"', () =>
    Effect.gen(function* seedKey() {
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

  it.effect(
    "refuses a key an object built apart from its call carries past the type, and its message names the fields there are",
    () =>
      Effect.gen(function* unknownKey() {
        const settings = { seed: "", showSolutions: true };
        const error = yield* Effect.flip(configure(settings));

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
