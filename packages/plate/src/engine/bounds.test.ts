import { assert, describe, it } from "@effect/vitest";
import { Effect, Option } from "effect";
import type { SourceDocument, SourceElement } from "#plate/document/source.ts";
import type { ExpressionType } from "#plate/model/expression.ts";
import { nullOf } from "#plate/model/values.ts";
import type { Value } from "#plate/model/values.ts";
import { growthLimit, growthRatio } from "#plate/test/growth.ts";
import {
  assertKindType,
  baseValueElement,
  expressionElement,
  outcomeDeclaration,
  processed,
  processingItem,
  setOutcomeElement,
  variableElement,
} from "#plate/test/processing.ts";
import { attr, el, text } from "#plate/test/source.ts";

/**
 * The type of a single integer.
 */
const singleInteger: ExpressionType = { baseType: "integer", cardinality: "single" };

/**
 * The type of a single identifier.
 */
const singleIdentifier: ExpressionType = { baseType: "identifier", cardinality: "single" };

/**
 * The type of an ordered container of identifiers.
 */
const orderedIdentifiers: ExpressionType = { baseType: "identifier", cardinality: "ordered" };

/**
 * Construct an integer outcome declaration with a default value.
 *
 * @param identifier Its `identifier`.
 * @param written Its default value, as written.
 * @returns The `qti-outcome-declaration`.
 */
const integerOutcome = (identifier: string, written: string): SourceElement =>
  outcomeDeclaration(identifier, "integer", "single", [
    el("qti-default-value", [], [el("qti-value", [], [text(written)])]),
  ]);

/**
 * Construct a `qti-repeat` element.
 *
 * @param numberRepeats Its `number-repeats`, as written.
 * @param operand Its one operand.
 * @returns The element.
 */
const repeatElement = (numberRepeats: string, operand: SourceElement): SourceElement =>
  expressionElement("repeat", [attr("number-repeats", numberRepeats)], [operand]);

/**
 * Construct the `qti-base-value` of the identifier `A`.
 *
 * @returns The element.
 */
const letter = (): SourceElement => baseValueElement("identifier", "A");

/**
 * Run an item's response processing over no response, and give one outcome's value after it.
 *
 * @param document The item document.
 * @param identifier The outcome.
 * @returns The outcome's value.
 */
const runFor = (document: SourceDocument, identifier: string) =>
  Effect.gen(function* runProcessing() {
    const after = yield* processed(document, {});
    assert.isTrue(Option.isSome(after), "the processing ran");

    return Option.getOrThrow(
      Option.flatMapNullishOr(
        after,
        (variables): Value | undefined => variables.outcomes[identifier],
      ),
    );
  });

/**
 * Make one run of an item's response processing a computation to time, its result discarded: each
 * case checks the result apart, with {@link runFor}.
 *
 * @param document The item document.
 * @returns The computation.
 */
const runOf = (document: SourceDocument) => (): void => {
  Effect.runSync(Effect.ignore(processed(document, {})));
};

/**
 * Measure how many times as long a crafted item's processing takes as a baseline item's, on this
 * thread's CPU and in the same run, alternating the two so a busy machine slows both
 * (`growthRatio` in `#plate/test/growth.ts`). A bound that holds keeps the crafted run within
 * {@link growthLimit} of the baseline, 32 times; without it the crafted run takes minutes, or
 * exhausts memory, and the case times out.
 *
 * @param baseline The baseline item, which asks for little.
 * @param crafted The crafted item.
 * @returns How many times as long one crafted run takes.
 */
const costRatio = (baseline: SourceDocument, crafted: SourceDocument) =>
  growthRatio(runOf(baseline), runOf(crafted));

/**
 * Construct an item whose processing sets the ordered identifier outcome `OUT` to one expression,
 * beside an identifier outcome `EMPTY` that holds NULL and an integer outcome `n` of a value.
 *
 * @param expression The expression element.
 * @param n The value of `n`, as written.
 * @returns The item document.
 */
const repeatItem = (expression: SourceElement, n = "1"): SourceDocument =>
  processingItem(
    [
      outcomeDeclaration("OUT", "identifier", "ordered"),
      outcomeDeclaration("EMPTY", "identifier"),
      integerOutcome("n", n),
    ],
    [setOutcomeElement("OUT", expression)],
  );

describe("the evaluator's bounds on a crafted item's processing", () => {
  it.effect(
    'qti-repeat with number-repeats="2147483647", or naming a variable of 10^30, gives the ordered NULL at no more cost than one pass',
    () =>
      Effect.gen(function* repeatsLong() {
        const onePass = repeatItem(repeatElement("1", letter()));
        for (const [numberRepeats, n] of [
          ["2147483647", "1"],
          ["n", "1000000000000000000000000000000"],
        ] as const) {
          const crafted = repeatItem(repeatElement(numberRepeats, letter()), n);
          const repeated = yield* runFor(crafted, "OUT");

          assert.deepStrictEqual(repeated, nullOf("identifier", "ordered"), numberRepeats);
          assertKindType(repeated, "repeat", [singleIdentifier]);
          assert.isBelow(yield* costRatio(onePass, crafted), growthLimit, numberRepeats);
        }
      }),
  );

  it.effect(
    'qti-repeat with number-repeats="1000000" over a product of two literals near 1,300 bits evaluates the product once: it costs no more than repeating a literal and holds 1,000,000 equal values',
    () =>
      Effect.gen(function* repeatsCostly() {
        // Each literal holds at most the 428 bytes a document's text holds (reading 1's key-text
        // bound), so the database admits the item.
        const left = 2n ** 1300n + 1n;
        const right = 2n ** 1300n + 3n;
        const crafted = processingItem(
          [outcomeDeclaration("OUT", "integer", "ordered")],
          [
            setOutcomeElement(
              "OUT",
              repeatElement(
                "1000000",
                expressionElement(
                  "product",
                  [],
                  [
                    baseValueElement("integer", left.toString()),
                    baseValueElement("integer", right.toString()),
                  ],
                ),
              ),
            ),
          ],
        );
        const repeated = yield* runFor(crafted, "OUT");
        const literal = processingItem(
          [outcomeDeclaration("OUT", "integer", "ordered")],
          [setOutcomeElement("OUT", repeatElement("1000000", baseValueElement("integer", "1")))],
        );

        assert.isBelow(yield* costRatio(literal, crafted), growthLimit);
        assertKindType(repeated, "repeat", [singleInteger]);

        const { values } = repeated;
        const [first] = values;
        assert.deepStrictEqual(first, { baseType: "integer", value: left * right });
        assert.strictEqual(values.length, 1_000_000);
        assert.isTrue(
          values.every((single) => single === first),
          "every value is the one value the product gave, so it was evaluated once",
        );
      }),
  );

  it.effect(
    "qti-repeat whose operand gives no value gives the ordered NULL at no more cost than one pass, however many passes it asks for, nested too",
    () =>
      Effect.gen(function* repeatsNothing() {
        const empty = variableElement("EMPTY");
        const onePass = repeatItem(repeatElement("1", empty));

        for (const [expression, operand] of [
          [repeatElement("2147483647", empty), singleIdentifier],
          [repeatElement("1000000", repeatElement("1000000", empty)), orderedIdentifiers],
        ] as const) {
          const repeated = yield* runFor(repeatItem(expression), "OUT");

          assert.deepStrictEqual(repeated, nullOf("identifier", "ordered"));
          assertKindType(repeated, "repeat", [operand]);
          assert.isBelow(yield* costRatio(onePass, repeatItem(expression)), growthLimit);
        }
      }),
  );

  it.effect(
    "a nested qti-repeat keeps exactly 1,000,000 values and gives the ordered NULL past them",
    () =>
      Effect.gen(function* repeatsNested() {
        const kept = yield* runFor(
          repeatItem(repeatElement("1000", repeatElement("1000", letter()))),
          "OUT",
        );
        assert.strictEqual(kept.values.length, 1_000_000);
        assertKindType(kept, "repeat", [orderedIdentifiers]);

        const past = yield* runFor(
          repeatItem(repeatElement("1001", repeatElement("1000", letter()))),
          "OUT",
        );
        assert.strictEqual(past.values.length, 0, "1,001,000 values are past the bound");
        assert.deepStrictEqual(past, nullOf("identifier", "ordered"));
        assertKindType(past, "repeat", [orderedIdentifiers]);
      }),
  );
});
