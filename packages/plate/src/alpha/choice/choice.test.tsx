/**
 * Alpha's Choice renderer against plate's standard one, over two fixture Choices, one pick
 * (`m2/items/p1-single-choice.xml`) and at most two (`m2/items/p1-multiple-choice.xml`), each in
 * `answering`, `review` and `solution`:
 *
 * - **the line:** composed over the standard renderers (`renderersOf(standardRenderers,
 *   alphaRenderers)`), a Choice writes one `alpha-choice-instruction` line, inside its root, after
 *   its prompt and before its group: "Select your answer:" where the child picks one, "Select all
 *   that apply:" where more, "Your Answer:" in a review or a solution;
 * - **nothing else:** the page with that one line taken out is the standard renderers' page, byte for
 *   byte, so the extension changes no response, part or name;
 * - **standard:** the standard renderers write no line;
 * - **the words:** over every binding a Choice holds (a `single` response, or a `multiple` one of
 *   `max-choices` 0 to 8), the island's line says "Select your answer:" exactly where the child
 *   picks one; a line that says it for every group, and one that counts a limit of two or more as
 *   one, are each refused.
 *
 * @module
 */
import { readFile } from "node:fs/promises";
import path from "node:path";
import { assert, describe, it } from "@effect/vitest";
import { Effect } from "effect";
import { renderToStaticMarkup } from "react-dom/server";
import { alphaRenderers } from "#plate/alpha/renderers.ts";
import { lineOf, lineWords } from "#plate/alpha/choice/choice.tsx";
import { configure } from "#plate/configuration.ts";
import { heldOf } from "#plate/held.ts";
import type { Picks } from "#plate/interactions/picks.ts";
import { picksOf } from "#plate/interactions/picks.ts";
import type { RenderMode } from "#plate/payload.ts";
import { startingResponses } from "#plate/starting.ts";
import { admitted } from "#plate/test/admitted.ts";
import { Item } from "#plate/ui/item/item.tsx";
import { renderersOf } from "#plate/ui/registry/compose.ts";
import type { Renderers } from "#plate/ui/registry/contract.ts";
import { standardRenderers } from "#plate/ui/registry/standard.ts";
import { Responses } from "#plate/ui/responses.tsx";
import { acceptedItem } from "#plate/validate/verdict.ts";

/**
 * Plate's fixtures, the folder the two Choices stand in.
 */
const fixtures = path.join(import.meta.dirname, "..", "..", "..", "fixtures");

/**
 * The two fixture Choices, each with the line its island writes.
 */
const choices = [
  { line: "Select your answer:", location: "m2/items/p1-single-choice.xml" },
  { line: "Select all that apply:", location: "m2/items/p1-multiple-choice.xml" },
] as const;

/**
 * The three modes a page shows an item in.
 */
const modes: readonly RenderMode[] = ["answering", "review", "solution"];

/**
 * Keep no change: the `onChange` a server render's `<Responses>` is given, which it never calls.
 */
const keepNothing = (): void => {
  // A server render runs no event handler.
};

/**
 * Render a fixture item's page as a host does, under some renderers: inside the `<Responses>` that
 * holds its starting responses in `answering`, alone in `review` and `solution`.
 *
 * @param location The item's path under the fixtures.
 * @param mode The mode.
 * @param renderers The renderers.
 * @returns The page's markup.
 */
const pageOf = Effect.fnUntraced(function* pageOf(
  location: string,
  mode: RenderMode,
  renderers: Renderers,
) {
  const bytes = yield* Effect.promise(() => readFile(path.join(fixtures, location)));
  const accepted = yield* Effect.fromOption(acceptedItem(yield* admitted(location, bytes)));
  const configuration = yield* configure({ seed: "alpha-choice" });
  const props = {
    configuration,
    instance: "alpha-choice",
    item: accepted,
    mode,
    showFeedback: false,
  } as const;
  const item = <Item {...props} renderers={renderers} />;

  return renderToStaticMarkup(
    mode === "answering" ? (
      <Responses onChange={keepNothing} value={heldOf(startingResponses(accepted, props))}>
        {item}
      </Responses>
    ) : (
      item
    ),
  );
}, Effect.orDie);

/**
 * Every `alpha-choice-instruction` line a page writes, as written.
 *
 * @param html The page.
 * @returns Each line's markup.
 */
const linesIn = (html: string): readonly string[] =>
  html.match(/<p data-slot="alpha-choice-instruction">[^<]*<\/p>/gu) ?? [];

describe("Alpha's Choice renderer", () => {
  for (const { line, location } of choices) {
    for (const mode of modes) {
      const words = mode === "answering" ? line : lineWords.en.review;

      it.effect(
        `writes "${words}" after the prompt of ${location} in ${mode}, and nothing else`,
        () =>
          Effect.gen(function* lineAndNothingElse() {
            const alpha = yield* pageOf(
              location,
              mode,
              renderersOf(standardRenderers, alphaRenderers),
            );
            const standard = yield* pageOf(location, mode, standardRenderers);
            const written = `<p data-slot="alpha-choice-instruction">${words}</p>`;

            assert.deepStrictEqual(linesIn(alpha), [written]);
            assert.match(
              alpha,
              new RegExp(
                `data-slot="plate-choice"[^>]*>(?:(?!</div>).)*?data-slot="plate-prompt"[^>]*>[^<]*</div>${written}<div[^>]*role="(?:radio|checkbox)?group"`,
                "su",
              ),
            );
            assert.deepStrictEqual(linesIn(standard), []);
            assert.strictEqual(alpha.replace(written, ""), standard);
          }),
      );
    }
  }
});

/**
 * Every binding a Choice holds, with whether its child picks exactly one.
 */
const bindings = [
  { binding: { cardinality: "single", maxChoices: 1n }, one: true },
  ...Array.from({ length: 9 }, (_, n) => ({
    binding: { cardinality: "multiple" as const, maxChoices: BigInt(n) },
    one: n === 1,
  })),
] as const;

/**
 * List the bindings a line rule words wrong.
 *
 * @param rule The rule.
 * @returns Each binding's cardinality and `max-choices`, as written, that it words wrong.
 */
const misworded = (rule: (picks: Picks) => "many" | "one"): readonly string[] =>
  bindings.flatMap(({ binding, one }) => {
    const said = lineWords.en[rule(picksOf(binding))];
    const right = one ? "Select your answer:" : "Select all that apply:";

    return said === right ? [] : [`${binding.cardinality} ${String(binding.maxChoices)}: ${said}`];
  });

describe("the line's words", () => {
  it("say Select your answer: where the child picks one, Select all that apply: where more", () => {
    assert.deepStrictEqual(misworded(lineOf), []);
  });

  it.each([
    ["one line for every group", () => "one" as const],
    [
      "a limit of some counted as one",
      (picks: Picks) => (picks.kind === "any" ? ("many" as const) : ("one" as const)),
    ],
  ] as const)("refuses a mutant: %s", (_name, rule) => {
    assert.isNotEmpty(misworded(rule));
  });
});
