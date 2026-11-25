/**
 * The items a downstream user reported on 2026-11-12 (upstream #464), a Match, a Gap Match and an
 * Order, each in a text form, in `fixtures/regress/reported-2026-11-12/`: a text item opens
 * accepted. Its scores are the QTI database's.
 *
 * @module
 */
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { assert, describe, it } from "@effect/vitest";
import { Effect } from "effect";
import { fixturesDirectory } from "#plate/test/scratch.ts";
import { admitted } from "#plate/test/admitted.ts";

/**
 * The reported items' folder.
 */
const reported = path.join(fixturesDirectory, "regress", "reported-2026-11-12");

/**
 * Read one reported item and open it, under the location its images' relative `src` resolves
 * against.
 *
 * @param name The item's file name without `.xml`.
 * @returns The verdict.
 */
const opened = Effect.fnUntraced(function* opened(name: string) {
  const bytes = yield* Effect.promise(() => readFile(path.join(reported, "items", `${name}.xml`)));

  return yield* admitted(`items/${name}.xml`, bytes);
});

/**
 * The report's items, by their file names without `.xml`, as the folder lists them: the folder
 * holds the report, each item in its text form, and nothing else.
 */
const reportedItems = Effect.map(
  Effect.promise(() => readdir(path.join(reported, "items"))),
  (files) => files.filter((file) => file.endsWith(".xml")).map((file) => file.slice(0, -4)),
);

describe("the items reported on 2026-11-12", () => {
  it.effect("each text item, of the three the report holds, opens accepted", () =>
    Effect.gen(function* textItemsOpen() {
      const names = yield* reportedItems;

      assert.strictEqual(names.length, 3, "the report's Match, Gap Match and Order");
      for (const name of names) {
        const verdict = yield* opened(name);

        assert.strictEqual(verdict.verdict, "accepted", name);
      }
    }),
  );
});
