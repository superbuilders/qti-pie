/**
 * Plate's UI suite over a drill's box and the host's keypad: a Text Entry its author marked
 * `plate-digits` takes digits alone and asks for the device's number keyboard, and under a host's
 * own keypad every box asks for no keyboard, each read from what the island renders, against rules
 * written here from AlphaTest's player (mastery-track-player 941a86a) and metis's no-regression
 * plan (`~/.cache/metis/NO-REGRESSION/PLAN.md`, R3, H3 and M36), never from plate's code.
 *
 * - DG1, digits alone: the text a drill's box keeps of any typed text is that text's ASCII digits, 0
 *   to 9, in order, as AlphaTest's `nextValue.replace(/[^0-9]/g, "")` kept them
 *   (`FluencyInteraction.tsx` lines 1326–1327). The oracle walks the text a code unit at a time.
 * - DG2, the keyboard asked for: a drill's box renders `inputmode="numeric"` under every base type;
 *   under the host's own keypad (`textEntryKeypad` `host`) every box renders `inputmode="none"`, a
 *   drill's box included, since the keys the host shows are the ones the child types with (the
 *   plan's G27: "a shown host keypad wins"); and a box neither marked nor under a host's keypad
 *   asks for what its base type asks, as before.
 *
 * Its kills, each a filter a slip would write in `digitsOf`'s place: one that keeps the decimal
 * point, one that keeps every Unicode digit, and one that keeps everything.
 *
 * @module
 */
import { assert, describe, it } from "@effect/vitest";
import { exhaust } from "@bjornpagen/testing/explore";
import { requiredInSpace } from "@bjornpagen/testing/features";
import { element } from "@bjornpagen/testing/gen";
import { searched } from "@bjornpagen/testing/vitest";
import { Duration, Effect } from "effect";
import { parseHTML } from "linkedom";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { Responses, TextEntry, digitsOf, heldOf } from "@qti-pie/plate/ui/client";
import type { TextEntryProps } from "@qti-pie/plate/ui/client";

/**
 * Keep a text's ASCII digits, the oracle of DG1: each code unit from `0` to `9`, in order.
 *
 * @param text The text.
 * @returns Its digits.
 */
const asciiDigits = (text: string): string => {
  let kept = "";

  for (let at = 0; at < text.length; at += 1) {
    const unit = text.codePointAt(at) ?? 0;

    if (unit >= 0x30 && unit <= 0x39) {
      kept += text.charAt(at);
    }
  }

  return kept;
};

/**
 * The characters a drawn text is made of: digits, the characters a child types beside them on a
 * drill (the decimal point, a minus, a space, letters), digits of other scripts, and an emoji's
 * surrogate pair.
 */
const characters = [
  "0",
  "1",
  "5",
  "9",
  ".",
  ",",
  "-",
  "+",
  " ",
  "e",
  "E",
  "w",
  "٣",
  "५",
  "１",
  "😀",
] as const;

/**
 * Every text of up to three of {@link characters}, the space DG1 is exhausted over and the kills are
 * held to.
 */
const shortTexts: readonly string[] = [
  "",
  ...characters,
  ...characters.flatMap((first) => characters.map((second) => `${first}${second}`)),
  ...characters.flatMap((first) =>
    characters.flatMap((second) => characters.map((third) => `${first}${second}${third}`)),
  ),
];

/**
 * Hold a filter to DG1 over every short text: the texts it keeps other than their ASCII digits.
 *
 * @param filter The filter.
 * @returns Each text it keeps wrongly, with what it kept.
 */
const wronglyKept = (filter: (text: string) => string): readonly string[] =>
  shortTexts.flatMap((text) => {
    const kept = filter(text);

    return kept === asciiDigits(text)
      ? []
      : [`${JSON.stringify(text)} kept ${JSON.stringify(kept)}`];
  });

/**
 * The kills: a filter a slip would write in `digitsOf`'s place.
 */
const kills: readonly (readonly [why: string, filter: (text: string) => string])[] = [
  ["keeps the decimal point", (text) => text.replaceAll(/[^0-9.]/gu, "")],
  ["keeps every Unicode digit", (text) => text.replaceAll(/\P{Nd}/gu, "")],
  ["keeps everything", (text) => text],
];

/**
 * The props a Text Entry's island takes, as the server shell gives them, but those a rule varies
 * and its response, which follows the base type.
 */
const boxProps: Omit<TextEntryProps, "baseType" | "digits" | "keypad" | "response"> = {
  base: 10,
  expectedLength: undefined,
  labels: { delete: "Delete", keypad: "Keypad", pattern: "Not a valid answer" },
  naming: { "aria-label": "Answer" },
  patternMask: undefined,
  placeholder: undefined,
  root: { className: undefined },
};

/**
 * Render a Text Entry's island in a `<Responses>` and give its input's `inputmode`.
 *
 * @param props What the rule varies: the base type, whether the box is a drill's, and the keypad.
 * @returns The input's `inputmode`, none for no attribute.
 */
const inputModeOf = (
  props: Pick<TextEntryProps, "baseType" | "digits" | "keypad">,
): string | null => {
  const html = renderToStaticMarkup(
    createElement(Responses, {
      children: createElement(TextEntry, {
        ...boxProps,
        ...props,
        response: { baseType: props.baseType, cardinality: "single", identifier: "RESPONSE" },
      }),
      onChange: () => {},
      value: heldOf({ RESPONSE: { baseType: props.baseType, cardinality: "single", values: [] } }),
    }),
  );

  const input = parseHTML(
    `<!doctype html><html><body>${html}</body></html>`,
  ).document.querySelector("input");

  // HTML's attribute names are ASCII case-insensitive, and React writes this one `inputMode`.
  return (
    [...(input?.attributes ?? [])].find(({ name }) => name.toLowerCase() === "inputmode")?.value ??
    null
  );
};

/**
 * The keyboard a box neither marked nor under a host's keypad asks for, by its base type: the
 * number keyboard for an integer in base 10, the decimal one for a float, and the device's own for
 * a text, as plate asked before.
 */
const typedModes = { float: "decimal", integer: "numeric", string: null } as const;

/**
 * Each case of DG2: a base type, whether the box is a drill's, the keypad, and the `inputmode` the
 * rule asks for.
 */
const keyboardCases = (["integer", "float", "string"] as const).flatMap((baseType) =>
  [false, true].flatMap((digits) =>
    (["none", "on-screen", "host"] as const).map((keypad) => {
      if (keypad === "host") {
        return { baseType, digits, expected: "none", keypad };
      }

      if (digits) {
        return { baseType, digits, expected: "numeric", keypad };
      }

      return { baseType, digits, expected: typedModes[baseType], keypad };
    }),
  ),
);

describe("a drill's box and the host's keypad", () => {
  it.effect("DG1: a drill's box keeps the ASCII digits of whatever is typed, in order", (ctx) =>
    Effect.gen(function* digitsRule() {
      const [first, ...rest] = [...shortTexts, "1w", "12.5", "-3", "٣4", "12😀34"];

      assert.isDefined(first, "the space holds texts");

      return yield* searched(
        ctx,
        exhaust(
          {
            box: "every text of up to three of sixteen characters, and five longer ones",
            caseHang: Duration.seconds(30),
            coverage: requiredInSpace<"typed">(["typed"]),
            generator: element([first, ...rest]),
            literal: (text) => JSON.stringify(text),
            oracle: {
              kind: "specification",
              name: 'AlphaTest\'s nextValue.replace(/[^0-9]/g, "") (FluencyInteraction.tsx lines 1326–1327), walked a code unit at a time',
            },
            suite: "plate-ui/digits",
          },
          (text, c) =>
            Effect.sync(() => {
              c.note("typed");
              assert.strictEqual(digitsOf(text), asciiDigits(text), JSON.stringify(text));
            }),
        ),
      );
    }),
  );

  it("DG2: a drill's box asks for the number keyboard, and the host's own keypad for none", () => {
    for (const { baseType, digits, expected, keypad } of keyboardCases) {
      assert.strictEqual(
        inputModeOf({ baseType, digits, keypad }),
        expected,
        `${baseType}, digits ${String(digits)}, keypad ${keypad}`,
      );
    }
  });

  it("its kills: each filter a slip would write keeps a text wrongly", () => {
    for (const [why, filter] of kills) {
      assert.isNotEmpty(wronglyKept(filter), `${why}: caught`);
    }
  });
});
