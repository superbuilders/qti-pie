import { assert, describe, it } from "@effect/vitest";
import { growthFactor } from "@qti-pie/crust/test/growth.ts";
import { Effect } from "effect";
import { readPnp } from "#plate/pnp/read.ts";
import type { PnpSelector } from "#plate/pnp/read.ts";
import type { PnpSupports } from "#plate/supports.ts";
import { repeatedProfile } from "#plate/test/counted.ts";
import { blockGrowth, blockGrowthLimit } from "#plate/test/growth.ts";

/**
 * The `hazard-avoidance` children the repeated profile's growth check reads first, before it reads
 * {@link growthFactor} times as many: 10,000.
 */
const fewerRepeats = 1250;

/**
 * Read a document, failing the test when the reader refuses it.
 *
 * @param document The document's bytes.
 * @param selector The record to read: `{}`, neither id, for a file of one record.
 * @returns The supports read.
 */
const read = (document: Uint8Array, selector: PnpSelector): Effect.Effect<PnpSupports> =>
  readPnp(document, selector).pipe(Effect.orDie);

describe("readPnp", () => {
  it.effect(
    "a profile that repeats one feature 10,000 times reads its four hazards, its blocks growing linearly with the children",
    () =>
      // Oracle: the work, counted: the blocks of JavaScript one read runs (`blockGrowth`, V8's
      // block coverage, the same on every run and under any load) on 1,250 children and on 8 times
      // as many, where a reader that compared each child with those before it would run about 64
      // times the blocks. Bound: one profile of each size.
      Effect.gen(function* repeated() {
        const pnp = yield* read(repeatedProfile(fewerRepeats * growthFactor), {});

        assert.deepStrictEqual(
          pnp.hazards,
          new Set(["flashing", "sound", "ext:iowa-reading", "olfactory-hazard"]),
        );
        assert.deepStrictEqual(pnp.features, new Set(["hazard-avoidance"]));
        assert.deepStrictEqual(pnp.ignored, []);

        const growth = yield* blockGrowth("pnpRepeats", fewerRepeats);

        assert.isBelow(
          growth,
          blockGrowthLimit,
          `8 times the children ran ${growth.toFixed(1)} times the blocks`,
        );
      }),
  );
});
