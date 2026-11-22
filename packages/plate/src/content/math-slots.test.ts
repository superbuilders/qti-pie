/**
 * The slots a run of content plans (`slotPlan` in `#plate/content/math-slots.ts`): what each
 * formula of the run draws in its slots, an empty `mspace` whose `xref` names an interaction's or a
 * gap's `id`, and how large each slot is. Each property is checked on runs a seeded generator
 * draws: Text Entries, most with ids, or an interaction's own gaps, beside formulas whose slots
 * name some of them once, some twice, some never, and ids nothing on the page holds.
 *
 * The properties:
 *
 * - **planned:** in a body, the plan holds exactly the Text Entries with an id that exactly one slot
 *   names; in an interaction's own content, exactly its gaps with an id that one slot names; each
 *   by that id. One no slot names, or two do, stays where it stands, as AlphaTest's player kept its
 *   standalone box for a token written twice;
 * - **sized:** a Text Entry's slot is as wide as its expected length makes it, a gap's five em, and
 *   every slot as tall as plate's control.
 *
 * Kills: a plan that also takes a target two slots name, one that takes a gap in a body, and one
 * that sizes a Text Entry's slot as a gap's are each refused.
 *
 * @module
 */
import { assert, describe, it } from "@effect/vitest";
import { Option } from "effect";
import {
  gapSlot,
  slotNames,
  slotPlan,
  slotTargets,
  textEntrySlot,
} from "#plate/content/math-slots.ts";
import type { SlotScope, SlotTarget } from "#plate/content/math-slots.ts";
import type { MathElement } from "#plate/content/mathml.ts";
import type { BodyElement, RedactedLevel, RedactedNode } from "#plate/model/item.ts";
import { textEntry } from "#plate/test/slotted.ts";

/**
 * A slot's `mspace`, naming an id.
 *
 * @param id The id.
 * @returns The element.
 */
const slot = (id: string): MathElement<unknown> => ({
  attributes: [{ name: "xref", value: id }],
  children: [],
  kind: "element",
  local: "mspace",
});

/**
 * A formula holding slots, each where a seeded choice puts it: alone after an equals sign, or in a
 * fraction's numerator or denominator.
 *
 * @param ids The ids its slots name, in order.
 * @param seed The choice.
 * @returns The formula's `math` element.
 */
const formula = (ids: readonly string[], seed: number): MathElement<unknown> => {
  const three: MathElement<unknown> = {
    attributes: [],
    children: [{ kind: "text", text: "3" }],
    kind: "element",
    local: "mn",
  };

  return {
    attributes: [],
    children: ids.map((id, index): MathElement<unknown> => {
      const local = ["mrow", "mfrac", "mfrac"][(seed + index) % 3] ?? "mrow";

      return {
        attributes: [],
        children: (seed + index) % 3 === 2 ? [slot(id), three] : [three, slot(id)],
        kind: "element",
        local,
      };
    }),
    kind: "element",
    local: "math",
  };
};

/**
 * A `qti-gap` of an interaction's own content.
 *
 * @param id Its `id`.
 * @returns The element.
 */
const gap = (id: string): BodyElement<RedactedLevel> => ({
  attributes: [{ name: "id", value: id }],
  children: [],
  kind: "element",
  path: `gap/${id}`,
  tag: "qti-gap",
});

/**
 * A paragraph holding nodes.
 *
 * @param children Its children.
 * @returns The paragraph.
 */
const paragraph = (children: readonly RedactedNode[]): RedactedNode => ({
  attributes: [],
  children,
  kind: "element",
  path: "p",
  tag: "p",
});

/**
 * A run of content and what its plan should hold.
 */
interface Run {
  readonly formulas: readonly MathElement<unknown>[];
  readonly nodes: readonly RedactedNode[];
  readonly planned: ReadonlyMap<string, SlotTarget["size"]>;
  readonly scope: SlotScope;
}

/**
 * Draw a run: Text Entries, most with ids, in a paragraph, and gaps, beside a formula whose slots
 * name some of each once, some twice, and an id nothing holds; in a body or in an interaction's own
 * content, where only the Text Entries or only the gaps may be drawn in a slot.
 *
 * @param seed The seed.
 * @returns The run.
 */
const runOf = (seed: number): Run => {
  const owned = seed % 4 === 3;
  const names = Array.from(
    { length: 1 + (seed % 4) },
    (_, index) => `t${String(seed)}x${String(index)}`,
  );
  const once = names.filter((_, index) => (seed + index) % 3 !== 2);
  const twice = names.filter((_, index) => (seed + index) % 3 === 2);
  const hasId = (name: string): boolean => names.indexOf(name) % 7 !== 6 - (seed % 2);
  const entries = names.map((name) =>
    textEntry(name, hasId(name) ? Option.some(`entry-${name}`) : Option.none()),
  );
  const named = [
    ...[...once, ...twice, ...twice].flatMap((name) => [`entry-${name}`, `gap-${name}`]),
    "nowhere",
  ];

  return {
    formulas: [formula(named, seed)],
    nodes: [...names.map((name) => gap(`gap-${name}`)), paragraph(entries)],
    planned: new Map(
      once.flatMap((name): readonly (readonly [string, SlotTarget["size"]])[] => {
        if (owned) {
          return [[`gap-${name}`, gapSlot]];
        }

        const entry = entries[names.indexOf(name)];

        return hasId(name) && entry !== undefined
          ? [[`entry-${name}`, textEntrySlot(entry.expectedLength)]]
          : [];
      }),
    ),
    scope: owned ? "owned" : "body",
  };
};

/**
 * The runs the properties are checked on.
 */
const runs: readonly Run[] = Array.from({ length: 200 }, (_, index) => runOf(index + 1));

/**
 * A plan of a run's slots, which a mutant replaces.
 */
type Planner = typeof slotPlan;

/**
 * Check every property on every run through a planner.
 *
 * @param planner The planner.
 * @returns Each broken property's name, with the first run it broke on.
 */
const broken = (planner: Planner): ReadonlyMap<string, string> => {
  const breaks = new Map<string, string>();

  for (const [index, run] of runs.entries()) {
    const plan = planner(run.formulas, run.nodes, run.scope);
    const ids = [...plan.keys()].toSorted().join(" ");
    const expected = [...run.planned.keys()].toSorted().join(" ");

    if (ids !== expected && !breaks.has("planned")) {
      breaks.set("planned", `run ${String(index + 1)} (${run.scope}): ${ids}, not ${expected}`);
    }

    for (const [id, target] of plan) {
      const size = run.planned.get(id);

      if (
        size !== undefined &&
        JSON.stringify(target.size) !== JSON.stringify(size) &&
        !breaks.has("sized")
      ) {
        breaks.set("sized", `run ${String(index + 1)}: ${id} sized ${JSON.stringify(target.size)}`);
      }
    }
  }

  return breaks;
};

describe("the slots a run of content plans", () => {
  it("plans each target exactly one slot names, where it may stand, at its size", () => {
    assert.deepStrictEqual(Object.fromEntries(broken(slotPlan)), {});
  });

  it.each([
    [
      "a target two slots name also planned",
      "planned",
      ((formulas, nodes, scope) => {
        const named = slotNames(formulas);

        return new Map(slotTargets(nodes, scope).filter(([id]) => (named.get(id) ?? 0) >= 1));
      }) satisfies Planner,
    ],
    [
      "a gap planned in a body",
      "planned",
      ((formulas, nodes, scope) =>
        new Map([
          ...slotPlan(formulas, nodes, scope),
          ...slotPlan(formulas, nodes, "owned"),
        ])) satisfies Planner,
    ],
    [
      "a Text Entry's slot sized as a gap's",
      "sized",
      ((formulas, nodes, scope) =>
        new Map(
          [...slotPlan(formulas, nodes, scope)].map(([id, target]) => [
            id,
            { ...target, size: gapSlot },
          ]),
        )) satisfies Planner,
    ],
  ] as const)("refuses a mutant: %s (%s)", (_name, property, planner) => {
    assert.include([...broken(planner).keys()], property);
  });
});
