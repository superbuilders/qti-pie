/**
 * The specimen generator held to plate: every case's item is one plate's `open` accepts with full
 * validation and nothing unsupported. A refusal is a defect of the writer or of plate. Whether the
 * case's response scores as it predicts is the QTI database's to say, which grades it: plate grades
 * nothing (edullm's `packages/data/qti-database/src/specimen-scores.db.test.ts`). Beside
 * it, a case replays from its token and from what it drew, and an enumeration walks every
 * combination of the dimensions a query leaves at any, each once.
 *
 * @module
 */
import { assert, describe, it } from "@effect/vitest";
import { Array as Arr, Effect, Formatter, Option, Result } from "effect";
import { drawn, explore } from "@bjornpagen/testing/explore";
import { required } from "@bjornpagen/testing/features";
import { floorSeed, caseSeed, wordsOf } from "@bjornpagen/testing/random";
import { notesOnly } from "@bjornpagen/testing/sense";
import { completeShrink, shrink } from "@bjornpagen/testing/shrink";
import { generate, randomChooser, recorder } from "@bjornpagen/testing/source";
import { tokenOf } from "@bjornpagen/testing/tape";
import { searched } from "@bjornpagen/testing/vitest";
import type { Answer } from "#specimen/answer.ts";
import type { Content } from "#specimen/description.ts";
import { floorCases, floorCase } from "#specimen/floor.ts";
import { opened } from "#specimen/open.ts";
import { kindDimension } from "#specimen/kinds/index.ts";
import {
  anyQuery,
  casesOfKinds,
  everyCase,
  page,
  pairsOf,
  queryOf,
  replay,
  sample,
} from "#specimen/specimen.ts";
import type { Case, KindName } from "#specimen/specimen.ts";

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
    "opens in plate as content the database admitted: 200 draws among the floor's cases a run beside the witnesses",
    (ctx) =>
      // Oracle: plate's opening of admitted content, which accepts every case's item.
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
            oracle: { kind: "universal", name: "plate's open" },
            runs: 200,
            shrink: completeShrink,
            steerEvery: 16,
            suite: "specimen/opens",
          },
          (held, c) =>
            Effect.gen(function* opens() {
              const { description } = held;

              c.note(description.interaction.kind);
              c.note(description.answer);

              if (description.stimulus.kind === "shown") {
                c.note(description.stimulus.content.kind);
              }

              yield* opened(held.item, Option.none());
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

  it("of given kinds draws only those kinds, each case the one the full space draws under its kind", () => {
    const stream = floorSeed("specimen/cases-of-kinds");
    const others = kindDimension.values
      .map(({ value }) => value)
      .filter((kind) => kind !== "portable-custom");
    const lists: readonly Arr.NonEmptyReadonlyArray<KindName>[] = [
      ["portable-custom"],
      ["slider", "choice"],
      Arr.isReadonlyArrayNonEmpty(others) ? others : assert.fail("the roster holds another kind"),
    ];

    // Oracle: the kinds given, and replay's reading of the tape past its kind's choice (a list of
    // one kind draws none) under the query that fixes that kind.
    for (const [listed, given] of lists.entries()) {
      for (let at = 0; at < 40; at += 1) {
        const generated = generate(
          recorder(),
          casesOfKinds(given),
          randomChooser(wordsOf(caseSeed(stream, listed * 40 + at))),
        );
        const { kind } = generated.value.description.interaction;
        const past = generated.tape.values.subarray(
          given.length > 1 ? 1 : 0,
          generated.tape.length,
        );
        const replayed = Option.getOrThrow(
          replay(Result.getOrThrow(queryOf([["kind", kind]])), tokenOf(past, past.length)),
        );

        assert.include(given, kind);
        assert.deepStrictEqual(replayed.description, generated.value.description);
      }
    }
  });

  it.effect("of given kinds shrinks a failing case as the full space does past its kind", () =>
    // Oracle: the full space's own shrink, under the same property, of a case of the same kind.
    Effect.forEach(
      ["order", "graphic-gap-match", "extended-text", "portable-custom"] as const,
      (kind) =>
        Effect.gen(function* shrinksAlike() {
          const stream = floorSeed(`specimen/cases-of-kinds/${kind}`);
          const fails = (held: Case) => Effect.succeed(held.description.interaction.kind === kind);
          const firstOf = (space: typeof everyCase) =>
            Option.getOrThrow(
              Arr.findFirst(
                Arr.makeBy(2000, (at) =>
                  generate(recorder(), space, randomChooser(wordsOf(caseSeed(stream, at)))),
                ),
                (generated) => generated.value.description.interaction.kind === kind,
              ),
            );
          const fewer = casesOfKinds(["choice", kind]);
          const full = yield* shrink(everyCase, firstOf(everyCase), fails, completeShrink);
          const restricted = yield* shrink(fewer, firstOf(fewer), fails, completeShrink);

          assert.strictEqual(full.ended, "minimal");
          assert.strictEqual(restricted.ended, "minimal");
          assert.deepStrictEqual(
            restricted.best.failure.description,
            full.best.failure.description,
          );
        }),
      { discard: true },
    ),
  );

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
