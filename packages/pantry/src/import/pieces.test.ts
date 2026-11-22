/**
 * An identifier's pieces (`#pantry/import/pieces.ts`): the whitespace before it, the name and the
 * whitespace after it, which concatenate to its lexical form.
 */
import { assert, describe, it } from "@effect/vitest";
import { exhaust } from "@bjornpagen/testing/explore";
import { requiredInSpace } from "@bjornpagen/testing/features";
import { array, element } from "@bjornpagen/testing/gen";
import { searched } from "@bjornpagen/testing/vitest";
import { Duration, Effect, Formatter } from "effect";
import { piecesOf } from "#pantry/import/pieces.ts";
import { searchWidth, searchTimeout } from "#pantry/test/settings.ts";

describe("import/pieces.ts", () => {
  it.effect(
    "splits an identifier into pieces that concatenate to it, the name holding no whitespace",
    (ctx) =>
      // Oracle: a universal one, the round trip: lead ‖ name ‖ trail is the lexical form, and the
      // name is the lexical form collapsed (XML Schema Part 2, §4.3.6).
      // Bound: every lexical form of a lead and a trail of at most 2 of 3 whitespace characters
      // around one of 4 names (one empty, one all whitespace), 13 × 13 × 4 = 676 cases.
      searched(
        ctx,
        exhaust(
          {
            box: "a lead and a trail of at most 2 of space, tab and line feed around 4 names",
            caseHang: Duration.seconds(10),
            concurrency: searchWidth,
            coverage: requiredInSpace<"padded" | "bare" | "empty">(["padded", "bare", "empty"]),
            generator: (source) => ({
              lead: source
                .draw(array(element([" ", "\t", "\n"] as const), { max: 2, min: 0 }))
                .join(""),
              name: source.draw(element(["A", "a.b-c", "", "x"] as const)),
              trail: source
                .draw(array(element([" ", "\t", "\n"] as const), { max: 2, min: 0 }))
                .join(""),
            }),
            literal: Formatter.format,
            oracle: { kind: "universal", name: "the round trip lead ‖ name ‖ trail" },
            suite: "pantry/import/overlays-declarations-pieces",
          },
          ({ lead, name, trail }, c) =>
            Effect.sync(() => {
              const lexical = `${lead}${name}${trail}`;
              const pieces = piecesOf(lexical);
              if (name === "") {
                c.note("empty");
              } else {
                c.note(lead === "" && trail === "" ? "bare" : "padded");
              }

              assert.strictEqual(`${pieces.lead}${pieces.value}${pieces.trail}`, lexical);
              assert.strictEqual(pieces.value, name);
              assert.match(pieces.lead, /^[\t\n\r ]*$/u);
              assert.match(pieces.trail, /^[\t\n\r ]*$/u);
            }),
        ),
      ),
    searchTimeout,
  );
});
