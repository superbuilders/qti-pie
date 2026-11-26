import * as NodeServices from "@effect/platform-node/NodeServices";
import { assert, describe, it } from "@effect/vitest";
import { Effect } from "effect";
import { publishedTemplates } from "#processing/templates.generated.ts";
import { readTemplates } from "#processing/test/templates.ts";

describe("the published response-processing templates", () => {
  it.effect("are compiled in as their published files read (reading 51)", () =>
    Effect.gen(function* templatesHeld() {
      const trees = yield* readTemplates();
      assert.deepStrictEqual(publishedTemplates, trees, "run pnpm generate:templates");
    }).pipe(Effect.provide(NodeServices.layer)),
  );
});
