import { assert, describe, it } from "@effect/vitest";
import { entries } from "#plate/alpha/modules.js";
import {
  isAlphaTarget,
  published,
  publishedAmong,
  scriptEntries,
  seams,
} from "#plate/test/boundary.ts";

describe("Alpha's published entries, every script entry of the exports map inside alpha/", () => {
  it("are each in Alpha's table of plate's modules, in the map's order", () => {
    assert.deepStrictEqual(
      entries.map(([subpath]) => subpath),
      scriptEntries()
        .filter(([, target]) => isAlphaTarget(target))
        .map(([subpath]) => subpath),
      "Alpha's table of plate's modules is not the exports map's: run `pnpm run generate` in packages/plate",
    );
  });

  it("export no test seam, brand constructor, mark predicate or defect, under any name", () => {
    const exported = published(entries);

    assert.includeMembers([...exported.keys()], ["./alpha"]);
    assert.includeMembers([...(exported.get("./alpha")?.keys() ?? [])], ["alphaRenderers"]);
    assert.deepStrictEqual(publishedAmong(exported, seams), []);
  });
});
