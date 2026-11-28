/**
 * Plate's Portable Custom island (`#plate/ui/portable-custom/portable-custom.tsx` and its host,
 * `host.ts`) hydrated in headless Google Chrome, in a page whose realm has no member the hosts'
 * browser floor lacks (`#specimen/ui/hydrated.ts`), its frame plate's own frame page: the island
 * frames the specimen's Portable Custom, a press counter (`#specimen/kinds/portable-custom.ts`),
 * and every press the child makes in the frame reaches the island as the response, the count
 * pressed.
 *
 * The rule is the PCI contract's (QTI 3.0.1, the implementation guide's §3.7.12): the PCI's
 * `qti-interaction-changed` carries its response, which the delivery engine keeps. A press counter
 * from 0 pressed `n` times answers `n`.
 *
 * @module
 * @see https://www.imsglobal.org/spec/qti/v3p0/impl
 */
import { assert, layer } from "@effect/vitest";
import { Array as Arr, Context, Effect, Layer, Option, Predicate } from "effect";
import { laterMembers, reachedMembers } from "@qti-pie/plate/test/browser-floor";
import { floorCases } from "#specimen/floor.ts";
import { opened as openedCase } from "#specimen/open.ts";
import { HydrationFailure, hydratedPages, solved } from "#specimen/ui/hydrated.ts";
import type { Answering } from "#specimen/ui/hydrated.ts";
import type { SourceItem } from "#specimen/ui/rules.ts";
import { itemFactsOf } from "#specimen/ui/source.ts";

/**
 * What the suite's cases share, made once for the file: the pages, and the specimen's counter from
 * 0 to 5, in answering.
 */
interface Shared {
  readonly counter: Answering;
  readonly open: Effect.Success<typeof hydratedPages>;
}

/**
 * The service that holds what the suite's cases share.
 */
class Pages extends Context.Service<Pages, Shared>()("specimen/ui/portable-custom.test/Pages") {}

/**
 * What the suite's cases share, made once for the file.
 */
const shared = Layer.effect(
  Pages,
  Effect.gen(function* sharing() {
    const open = yield* hydratedPages;
    const found = Arr.findFirst(
      floorCases,
      ({ description: { interaction } }) =>
        interaction.kind === "portable-custom" &&
        interaction.settings.range.start === 0 &&
        interaction.settings.face === "own",
    );

    if (Option.isNone(found)) {
      return yield* new HydrationFailure({
        cause: "no counter from 0 with its own face",
        step: "found the Portable Custom on the floor",
      });
    }

    const held = found.value;
    const { accepted, configuration } = yield* openedCase(held.item, Option.none());
    const facts = itemFactsOf(held.item.xml);
    const source: SourceItem = {
      accepted,
      configuration,
      given: Option.none(),
      host: held.item.host,
      kinds: facts.kinds,
      location: held.item.location,
      offered: facts.offered,
      stimuli: [],
      taken: Option.none(),
    };

    return { counter: solved(source), open } satisfies Shared;
  }),
);

/**
 * Run a step of Playwright's on the page as an effect that fails with the step it was.
 *
 * @param name What it does.
 * @param run The step.
 * @returns The effect.
 */
const step = <A>(name: string, run: () => Promise<A>): Effect.Effect<A, HydrationFailure> =>
  Effect.tryPromise({ catch: (cause) => new HydrationFailure({ cause, step: name }), try: run });

layer(shared, { excludeTestServices: true })("the Portable Custom island, floored", (it) => {
  it.effect("relays each press in the frame as the response, the count pressed", () =>
    Effect.scoped(
      Effect.gen(function* pressed() {
        const { counter, open } = yield* Pages;
        const hydrated = yield* open(counter);
        const button = hydrated.page.frameLocator("iframe").locator("button");

        yield* step("press the counter twice, or meet the page's error first", async () => {
          const thrown = hydrated.page.waitForEvent("pageerror").then((error) => {
            throw error;
          });

          await Promise.race([
            (async () => {
              await button.click();
              await button.click();
            })(),
            thrown,
          ]);
        });
        yield* step("wait for the island to keep two changes", () =>
          hydrated.page.waitForFunction(() => (window.hydrated?.changes.length ?? 0) >= 2),
        );
        yield* hydrated.settle;

        const changes = yield* hydrated.changes;
        const reached = yield* step("read the page's later members", () =>
          hydrated.page.evaluate(reachedMembers, laterMembers),
        );

        assert.strictEqual(
          reached,
          "Error.stackTraceLimit",
          "the island's page has no member the floor lacks but the one its own development scripts write, V8's `Error.stackTraceLimit`, which an assignment makes anew in any browser",
        );
        assert.deepStrictEqual(
          changes.map((responses) => {
            const response = responses["RESPONSE"];

            return response === undefined || response.cardinality === "record"
              ? []
              : response.values.map(({ value }) =>
                  Predicate.isBigInt(value) ? value.toString() : "no integer",
                );
          }),
          [["1"], ["2"]],
          "each press reaches the island, in a page with nothing past the floor, as the count pressed",
        );
      }),
    ),
  );
});
