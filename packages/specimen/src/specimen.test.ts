/**
 * The specimen generator held to plate: every case's item is one plate's `open` accepts with full
 * validation and nothing unsupported, and the response the case draws, posted as a form posts it,
 * decodes and scores as the case predicts. A refusal is a defect of the writer or of plate. Beside
 * it, a case replays from its token and from what it drew, and an enumeration walks every
 * combination of the dimensions a query leaves at any, each once.
 *
 * @module
 */
import { assert, describe, it } from "@effect/vitest";
import { Effect, Formatter, Option, Result } from "effect";
import { drawn, explore } from "@bjornpagen/testing/explore";
import { required } from "@bjornpagen/testing/features";
import { floorSeed, caseSeed, wordsOf } from "@bjornpagen/testing/random";
import { notesOnly } from "@bjornpagen/testing/sense";
import { completeShrink } from "@bjornpagen/testing/shrink";
import { generate, randomChooser, recorder } from "@bjornpagen/testing/source";
import { tokenOf } from "@bjornpagen/testing/tape";
import { searched } from "@bjornpagen/testing/vitest";
import type { Answer } from "#specimen/answer.ts";
import type { Content } from "#specimen/description.ts";
import { floorCases, floorCase } from "#specimen/floor.ts";
import { opened } from "#specimen/open.ts";
import { scoredAs } from "#specimen/scored.ts";
import { anyQuery, everyCase, page, pairsOf, queryOf, replay, sample } from "#specimen/specimen.ts";
import type { KindName } from "#specimen/specimen.ts";

/**
 * What a case notes: its kind, its response, and what its stimulus shows.
 */
type Feature = Answer | Content["kind"] | KindName;

describe("a specimen", () => {
  it.effect("of the floor opens, every one, as an item the database admitted", () =>
    // Oracle: the admitted set; under QTI_PIE_ADMIT_COLLECT this is what collects the floor.
    Effect.forEach(floorCases, (held) => opened(held.item, Option.none()), { discard: true }),
  );

  it.effect(
    "opens in plate as content the database admitted, and its response scores as it predicts: 200 draws among the floor's cases a run beside the witnesses",
    (ctx) =>
      // Oracle: plate's own validator and engine, against each kind's stated score.
      searched(
        ctx,
        explore(
          {
            caseHang: "30 seconds",
            coverage: required<Feature>(
              [
                "choice",
                "inline-choice",
                "text-entry",
                "match",
                "gap-match",
                "order",
                "hotspot",
                "graphic-order",
                "graphic-associate",
                "graphic-gap-match",
                "select-point",
                "position-object",
                "hottext",
                "associate",
                "extended-text",
                "slider",
                "media",
                "end-attempt",
                "portable-custom",
                "right",
                "partial",
                "wrong",
                "empty",
                "text",
                "picture",
                "table",
                "figure",
                "video",
              ],
              { cases: 200, sense: notesOnly },
            ),
            draw: drawn(floorCase),
            kept: [],
            literal: Formatter.format,
            oracle: { kind: "universal", name: "plate's open and score" },
            runs: 200,
            shrink: completeShrink,
            steerEvery: 16,
            suite: "specimen/opens",
          },
          (held, c) =>
            Effect.gen(function* opensAndScores() {
              const { description } = held;

              c.note(description.interaction.kind);
              c.note(description.answer);

              if (description.stimulus.kind === "shown") {
                c.note(description.stimulus.content.kind);
              }

              const { accepted } = yield* opened(held.item, Option.none());

              assert.strictEqual(scoredAs(accepted, held), held.response.score);
            }),
        ),
      ),
  );

  it("replays under the query that fixes nothing from a tape of every case's space", () => {
    const stream = floorSeed("specimen/every-case");

    for (let at = 0; at < 50; at += 1) {
      const generated = generate(
        recorder(),
        everyCase,
        randomChooser(wordsOf(caseSeed(stream, at))),
      );
      const replayed = Option.getOrThrow(
        replay(anyQuery, tokenOf(generated.tape.values, generated.tape.length)),
      );

      assert.deepStrictEqual(replayed.description, generated.value.description);
    }
  });

  it("replays from its token, and from what it drew with no decision left", () => {
    for (const specimen of sample(anyQuery, 1, 50)) {
      const replayed = Option.getOrThrow(replay(anyQuery, specimen.token));
      const fixed = Option.getOrThrow(replay(specimen.drawn, ""));

      assert.deepStrictEqual(replayed.description, specimen.description);
      assert.deepStrictEqual(fixed.description, specimen.description);
      assert.deepStrictEqual(Result.getOrThrow(queryOf(pairsOf(specimen.drawn))), specimen.drawn);
    }
  });

  it("enumerates every combination a query leaves at any, each once", () => {
    const fixedOrder = Result.getOrThrow(
      queryOf([
        ["kind", "order"],
        ["stimulus", "none"],
        ["prompt", "none"],
        ["feedback", "none"],
        ["validate-responses", "no"],
      ]),
    );
    const walked = page(fixedOrder, Option.none(), 1000);
    const seen = new Set(walked.specimens.map((specimen) => JSON.stringify(specimen.description)));

    // Order's 6 counts, 2 orders, 2 orientations and 2 lengths, by its 4 responses.
    assert.strictEqual(walked.specimens.length, 6 * 2 * 2 * 2 * 4);
    assert.strictEqual(seen.size, walked.specimens.length);
    assert.isTrue(Option.isNone(walked.next));

    const halves = page(fixedOrder, Option.none(), 100);
    const rest = page(fixedOrder, halves.next, 1000);

    assert.deepStrictEqual(
      [...halves.specimens, ...rest.specimens].map((specimen) => specimen.token),
      walked.specimens.map((specimen) => specimen.token),
    );
  });

  it("draws nothing for a response its interaction does not admit", () => {
    const singlePartial = Result.getOrThrow(
      queryOf([
        ["kind", "choice"],
        ["choice.picks", "one"],
        ["answer", "partial"],
      ]),
    );

    assert.deepStrictEqual(sample(singlePartial, 1, 20), []);
  });
});
