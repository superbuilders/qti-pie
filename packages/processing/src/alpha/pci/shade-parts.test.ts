/**
 * Alpha's shade-parts PCI (`urn:fdc:alpha.school:2026:shade-parts`, plate's
 * `alpha/pci-modules/shade-parts.ts`) is an interaction, never a grader: its response is the number
 * of parts shaded, a `single integer`, and its item is scored by the published `match_correct`
 * template (QTI 3.0.1 §5.161, the PCI's binding to any response of any type, §5.88). So every item
 * the module admits compiles, its answer is admitted (D6), and it grades by standard response
 * processing, with no custom operator: whatever the whole (`rectangle`, `circle`, `set`) and
 * however many parts it is cut into (2, 3, 4, 6 or 8), and whichever count the key names. The items
 * are synthetic, written from the module's own contract alone.
 */
import { validatingMember } from "#processing/test/members.ts";
import { assert, describe, it } from "@effect/vitest";
import { compileItem, gradeAnswer } from "#processing/entries.ts";
import type { ItemSession } from "#processing/grade.ts";
import { processingSeed } from "#processing/stream.ts";
import { everyMember } from "#processing/test/exhausted.ts";
import { element, text } from "#processing/test/run.ts";
import { single } from "#processing/value.ts";
import type { Value } from "#processing/value.ts";

/**
 * One shade-parts item: its whole, how many parts, and the count its key names.
 */
interface Shaded {
  readonly key: number;
  readonly parts: number;
  readonly whole: "circle" | "rectangle" | "set";
}

/**
 * The module's wholes.
 */
const wholes = ["circle", "rectangle", "set"] as const;

/**
 * The module's part counts.
 */
const partCounts = [2, 3, 4, 6, 8] as const;

/**
 * The attributes each whole writes beside its parts: a rectangle its rows, one row of columns.
 */
const wholeAttributes = {
  circle: {},
  rectangle: { "data-rows": "1" },
  set: {},
} as const satisfies Readonly<Record<Shaded["whole"], Readonly<Record<string, string>>>>;

/**
 * The first item of the space.
 */
const first: Shaded = { key: 1, parts: 2, whole: "circle" };

/**
 * Every whole, every part count, every key from 1 to the parts.
 */
const items: readonly Shaded[] = wholes.flatMap((whole) =>
  partCounts.flatMap((parts) =>
    Array.from({ length: parts }, (_, k) => ({ key: k + 1, parts, whole })),
  ),
);

/**
 * A shade-parts item as content writes one: a `single integer` response keyed to a count, the PCI
 * bound to it, and `match_correct`.
 *
 * @param item - The item's whole, parts and key.
 * @returns Its `qti-assessment-item`.
 */
const itemOf = ({ key, parts, whole }: Shaded) =>
  element("qti-assessment-item", { adaptive: "false", identifier: "shade" }, [
    element(
      "qti-response-declaration",
      { "base-type": "integer", cardinality: "single", identifier: "RESPONSE" },
      [element("qti-correct-response", {}, [element("qti-value", {}, [text(String(key))])])],
    ),
    element(
      "qti-outcome-declaration",
      { "base-type": "float", cardinality: "single", identifier: "SCORE" },
      [],
    ),
    element("qti-item-body", {}, [
      element(
        "qti-portable-custom-interaction",
        {
          "custom-interaction-type-identifier": "urn:fdc:alpha.school:2026:shade-parts",
          "data-parts": String(parts),
          "data-whole": whole,
          module: "shade-parts",
          "response-identifier": "RESPONSE",
          ...wholeAttributes[whole],
        },
        [],
      ),
    ]),
    element(
      "qti-response-processing",
      { template: "https://purl.imsglobal.org/spec/qti/v3p0/rptemplates/match_correct.xml" },
      [],
    ),
  ]);

/**
 * A first attempt with nothing templated.
 */
const session: ItemSession = Object.freeze({
  duration: 3,
  numAttempts: 0n,
  prior: { kind: "none" } as const,
  seed: processingSeed("decision", "package", "shade"),
  take: {
    correct: new Map<string, Value>(),
    defaults: new Map<string, Value>(),
    templates: new Map<string, Value>(),
  },
});

describe("a shade-parts item", () => {
  it.effect(
    "compiles, admits its answer and grades it by match_correct, for every whole and part count",
    (ctx) =>
      everyMember(
        ctx,
        {
          box: "every whole (circle, rectangle, set) × parts (2, 3, 4, 6, 8) × key (1 to parts)",
          members: [first, ...items.slice(1)],
          oracle:
            "QTI 3.0.1 §5.88 (portable custom interaction), the match_correct template; shade-parts.ts's contract",
          suite: "processing/alpha/shade-parts-graded",
        },
        (shaded) => {
          const compiled = compileItem(itemOf(shaded), Object.freeze({ sha256: "5".repeat(64) }));
          const item = compiled.ok ? compiled.value : assert.fail(compiled.refusal.detail);
          const scoreOf = (shadedCount: number): Value | undefined => {
            const graded = gradeAnswer({
              answered: validatingMember(item),
              context: new Map(),
              evaluations: new Map(),
              readAt: { microseconds: 2n },
              responses: {
                at: { microseconds: 1n },
                kind: "save",
                values: new Map([["RESPONSE", single("integer", BigInt(shadedCount))]]),
              },
              session,
            });

            return "result" in graded && graded.result.kind === "done"
              ? graded.result.outcomes.get("SCORE")
              : undefined;
          };
          assert.deepStrictEqual(scoreOf(shaded.key), single("float", 1));
          assert.deepStrictEqual(
            scoreOf(shaded.key === shaded.parts ? 1 : shaded.parts),
            single("float", 0),
          );
        },
      ),
  );
});
