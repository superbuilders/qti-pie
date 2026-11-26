import { assert, describe, it } from "@effect/vitest";
import {
  isAlphaTarget,
  published,
  publishedAmong,
  scriptEntries,
  seams,
} from "#plate/test/boundary.ts";
import { entries } from "#plate/test/modules.js";

/**
 * The entry of core's table of plate's modules, which the table leaves out: it exports the table
 * alone, and would import itself.
 */
const tableEntry = "./test/modules";

describe("the published entries outside alpha/, every script entry of the exports map core holds", () => {
  it("are each in core's table of plate's modules, but the table's own, in the map's order", () => {
    assert.deepStrictEqual(
      entries.map(([subpath]) => subpath),
      scriptEntries()
        .filter(([subpath, target]) => subpath !== tableEntry && !isAlphaTarget(target))
        .map(([subpath]) => subpath),
      "core's table of plate's modules is not the exports map's: run `pnpm run generate` in packages/plate",
    );
  });

  it("export no test seam, brand constructor, mark predicate or defect, under any name, the UI's server and client entries included", () => {
    const exported = published(entries);

    assert.includeMembers([...exported.keys()], [".", "./ui", "./ui/client"]);
    assert.includeMembers([...(exported.get(".")?.keys() ?? [])], ["openAdmitted", "redact"]);
    assert.includeMembers([...(exported.get("./ui")?.keys() ?? [])], ["Item"]);
    assert.includeMembers([...(exported.get("./ui/client")?.keys() ?? [])], ["Responses"]);
    assert.deepStrictEqual(publishedAmong(exported, seams), []);
  });
});
