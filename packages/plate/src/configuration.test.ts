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

describe("configure", () => {
  for (const { field, input } of refused) {
    it.effect(`refuses ${JSON.stringify(input)}, naming ${field}`, () =>
      Effect.gen(function* refusal() {
        const error = yield* Effect.flip(configure(input));

        assert.strictEqual(error._tag, "InvalidConfiguration");
        assert.deepStrictEqual(error.field, Option.some(field));
      }),
    );
  }

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
