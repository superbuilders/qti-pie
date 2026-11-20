import { assert, describe, it } from "@effect/vitest";
import { Effect, Option } from "effect";
import { configure } from "#plate/configuration.ts";
import { malformedMessage, patternMessage } from "#plate/interactions/pattern.ts";
import type { TextEntryInteraction } from "#plate/interactions/text-entry.ts";
import { message } from "#plate/messages.ts";
import { maximumStates } from "#plate/model/regex.ts";
import type { Single, Value } from "#plate/model/values.ts";

/**
 * The fields of a text interaction the check reads.
 */
type Masked = Pick<TextEntryInteraction, "patternMask" | "patternMaskMessage">;

/**
 * Construct the fields the check reads.
 *
 * @param pattern The `pattern-mask`, as written.
 * @param authored The author's `data-patternmask-message`, none by default.
 * @returns The fields.
 */
const masked = (pattern: string, authored: Option.Option<string> = Option.none()): Masked => ({
  patternMask: Option.some(pattern),
  patternMaskMessage: authored,
});

/**
 * Construct a single value.
 *
 * @param single The one value it holds.
 * @returns The value of `single`'s base type, of cardinality `single`.
 */
const one = (single: Single & { readonly baseType: "float" | "integer" | "string" }): Value => ({
  baseType: single.baseType,
  cardinality: "single",
  values: [single],
});

/**
 * Construct an ordered string value.
 *
 * @param members Its strings, in order.
 * @returns The value of cardinality `ordered`.
 */
const ordered = (...members: readonly string[]): Value => ({
  baseType: "string",
  cardinality: "ordered",
  values: members.map((value) => ({ baseType: "string", value })),
});

/**
 * The author's message on the interactions below that carry one.
 */
const authored = "Enter up to six digits and points.";

/**
 * A mask of up to six digits and points, with the author's message.
 */
const sixDigits = masked("([0-9.]{0,6})", Option.some(authored));

/**
 * A mask that takes a digit, a point and one digit: `1.5`, never `1.50`.
 */
const oneDecimal = masked(String.raw`[0-9]\.[0-9]`);

describe("patternMessage", () => {
  it.effect("gives the author's message for 12a against ([0-9.]{0,6}) and none for 12.5", () =>
    Effect.gen(function* authorsMessage() {
      const configuration = yield* configure({ seed: "", validateResponses: true });

      assert.deepStrictEqual(
        patternMessage(sixDigits, one({ baseType: "string", value: "12a" }), configuration),
        Option.some(authored),
      );
      assert.deepStrictEqual(
        patternMessage(sixDigits, one({ baseType: "string", value: "12.5" }), configuration),
        Option.none(),
      );
    }),
  );

  it.effect("matches a float in its canonical form, so a posted 1.50 is matched as 1.5", () =>
    Effect.gen(function* canonicalFloat() {
      const configuration = yield* configure({ seed: "", validateResponses: true });

      // The control: the mask refuses the text 1.50 itself.
      assert.isTrue(
        Option.isSome(
          patternMessage(oneDecimal, one({ baseType: "string", value: "1.50" }), configuration),
        ),
      );
      assert.deepStrictEqual(
        patternMessage(oneDecimal, one({ baseType: "float", value: 1.5 }), configuration),
        Option.none(),
      );
    }),
  );

  it.effect("matches an integer in its canonical form, so a posted 007 is matched as 7", () =>
    Effect.gen(function* canonicalInteger() {
      const configuration = yield* configure({ seed: "", validateResponses: true });
      const noLeadingZero = masked("[1-9][0-9]*");

      assert.isTrue(
        Option.isSome(
          patternMessage(noLeadingZero, one({ baseType: "string", value: "007" }), configuration),
        ),
      );
      assert.deepStrictEqual(
        patternMessage(noLeadingZero, one({ baseType: "integer", value: 7n }), configuration),
        Option.none(),
      );
    }),
  );

  it.effect(
    "gives the message for an ordered value with one mismatching member, and none when every member matches",
    () =>
      Effect.gen(function* containerMembers() {
        const configuration = yield* configure({ seed: "", validateResponses: true });

        assert.deepStrictEqual(
          patternMessage(sixDigits, ordered("12.5", "12a", "3"), configuration),
          Option.some(authored),
        );
        assert.deepStrictEqual(
          patternMessage(sixDigits, ordered("12.5", "3"), configuration),
          Option.none(),
        );
      }),
  );

  it.effect("checks no NULL value", () =>
    Effect.gen(function* nullValue() {
      const configuration = yield* configure({ seed: "", validateResponses: true });

      assert.deepStrictEqual(
        patternMessage(
          sixDigits,
          { baseType: "string", cardinality: "single", values: [] },
          configuration,
        ),
        Option.none(),
      );
    }),
  );

  it.effect("gives patternMismatch's text when the author wrote no message", () =>
    Effect.gen(function* localeMessage() {
      const configuration = yield* configure({ seed: "", validateResponses: true });

      assert.deepStrictEqual(
        patternMessage(
          masked("([0-9.]{0,6})"),
          one({ baseType: "string", value: "12a" }),
          configuration,
        ),
        Option.some(message("en", "patternMismatch")),
      );
    }),
  );

  it.effect("checks nothing without validateResponses, or without a pattern-mask", () =>
    Effect.gen(function* untiered() {
      const lenient = yield* configure({ seed: "", validateResponses: false });
      const strict = yield* configure({ seed: "", validateResponses: true });
      const mismatch = one({ baseType: "string", value: "12a" });

      assert.deepStrictEqual(patternMessage(sixDigits, mismatch, lenient), Option.none());
      assert.deepStrictEqual(
        patternMessage(
          { patternMask: Option.none(), patternMaskMessage: Option.some(authored) },
          mismatch,
          strict,
        ),
        Option.none(),
      );
    }),
  );

  it.effect(
    "answers a hostile pattern-mask against 100,000 characters in time linear in the value",
    () =>
      Effect.gen(function* hostile() {
        const configuration = yield* configure({ seed: "", validateResponses: true });
        const mismatch = Option.some(message("en", "patternMismatch"));
        const as = "a".repeat(100_000);

        // Each pattern needs a last character the run of a's lacks, so a backtracking engine tries
        // every way of splitting the run before it gives up.
        for (const pattern of ["(a+)+b", "(a|a)*b", "(a|ab)*c"]) {
          assert.deepStrictEqual(
            patternMessage(masked(pattern), one({ baseType: "string", value: as }), configuration),
            mismatch,
            pattern,
          );
        }

        assert.deepStrictEqual(
          patternMessage(
            masked("(a+)+b"),
            one({ baseType: "string", value: `${as}b` }),
            configuration,
          ),
          Option.none(),
        );
        assert.deepStrictEqual(
          patternMessage(
            masked("(a|ab)*c"),
            one({ baseType: "string", value: `${"ab".repeat(50_000)}c` }),
            configuration,
          ),
          Option.none(),
        );
      }),
  );

  it.effect("checks nothing against a pattern-mask whose automaton passes the state limit", () =>
    Effect.gen(function* overLimit() {
      const configuration = yield* configure({ seed: "", validateResponses: true });
      const mismatch = one({ baseType: "string", value: "12a" });

      // Each optional copy of a class takes two states, so half the limit's copies pass it.
      const copies = maximumStates / 2;

      assert.deepStrictEqual(
        patternMessage(masked(`[0-9]{0,${copies - 1}}`), mismatch, configuration),
        Option.some(message("en", "patternMismatch")),
      );
      assert.deepStrictEqual(
        patternMessage(masked(`[0-9]{0,${copies}}`), mismatch, configuration),
        Option.none(),
      );
    }),
  );
});

describe("malformedMessage", () => {
  it("gives a numeric binding's second entry malformedSingleMany and its number malformedNumber or the author's message", () => {
    for (const baseType of ["integer", "float"] as const) {
      const plain = { baseType, patternMaskMessage: Option.none() };
      const withMessage = { baseType, patternMaskMessage: Option.some(authored) };

      for (const binding of [plain, withMessage]) {
        assert.strictEqual(
          malformedMessage(binding, "single-many", "en"),
          message("en", "malformedSingleMany"),
          baseType,
        );
        assert.strictEqual(
          malformedMessage(binding, "identifier", "en"),
          message("en", "notAccepted"),
          baseType,
        );
      }
      assert.strictEqual(
        malformedMessage(plain, "number", "en"),
        message("en", "malformedNumber"),
        baseType,
      );
      assert.strictEqual(malformedMessage(withMessage, "number", "en"), authored, baseType);
    }
  });

  it("gives a string binding's second entry malformedSingleMany and any other reason notAccepted", () => {
    const string = { baseType: "string", patternMaskMessage: Option.some(authored) } as const;

    assert.strictEqual(
      malformedMessage(string, "single-many", "en"),
      message("en", "malformedSingleMany"),
    );
    assert.strictEqual(malformedMessage(string, "number", "en"), message("en", "notAccepted"));
    assert.strictEqual(malformedMessage(string, "identifier", "en"), message("en", "notAccepted"));
  });
});
