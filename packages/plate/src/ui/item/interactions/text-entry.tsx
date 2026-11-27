/**
 * Text Entry (Q-6) in the server shell: plate's renderer of a `qti-text-entry-interaction`'s
 * payload node (`standardRenderers` in `#plate/ui/registry/standard.ts`), its island in `answering`
 * (`#plate/ui/text-entry/text-entry.tsx`) and its server markup in `review` and `solution`. It
 * stands where phrasing content does, inside the author's sentence.
 *
 * The island takes its binding, `base`, `expected-length`, `pattern-mask` with the author's
 * `data-patternmask-message` in place of the catalog's, its placeholder, its names, and whether a
 * keypad types every text it takes ({@link keysOf}); its keypad, where the host shows plate's keys
 * (`textEntryKeypad` `on-screen`), `<Item>` writes after the item's body. The review shows the text
 * in a read-only input, named as the island names its own, and, by the host's solution, its mark;
 * its {@link answer}, the right answer when the answer is not right, the body walk writes after the
 * block that holds the sentence. An extension's renderer of the kind builds on these parts
 * ({@link box}, {@link island}, {@link review}, {@link reviewOf}, {@link answer}, {@link after}).
 *
 * @module
 */
import { Array as Arr, Option } from "effect";
import type { ReactNode } from "react";
import { writeIn } from "#plate/interactions/text-entry.ts";
import { typedEntry } from "#plate/model/typed-text.ts";
import { isNull } from "#plate/model/values.ts";
import { isRecordValue } from "#plate/model/record-value.ts";
import type { ResponseValue } from "#plate/model/values.ts";
import type { Paired } from "#plate/payload.ts";
import type { Named } from "#plate/ui/attributes.ts";
import type { IslandContext, ReviewContext } from "#plate/ui/item/context.ts";
import {
  ControlReview,
  controlAnswer,
  controlMarkOf,
} from "#plate/ui/item/interactions/control-mark.tsx";
import type { ControlMark } from "#plate/ui/item/interactions/control-mark.tsx";
import { hintOf } from "#plate/ui/item/interactions/facts.ts";
import { controlNameOf, labelsOf, ownName, rootOf } from "#plate/ui/item/interactions/labels.ts";
import { markingOf } from "#plate/ui/item/interactions/marks.ts";
import type { Marking } from "#plate/ui/item/interactions/marks.ts";
import { digitsClass } from "#plate/ui/text-entry/digits.ts";
import { keypadOf } from "#plate/ui/text-entry/keypad.ts";
import type { Keypad } from "#plate/ui/text-entry/keypad.ts";
import { TextEntryKeypad } from "#plate/ui/text-entry/keys.tsx";
import { keypadKeys, textEntryKeys } from "#plate/ui/text-entry/labels.ts";
import { TextEntry } from "#plate/ui/text-entry/text-entry.tsx";
import { hasClass } from "#plate/vocabulary.ts";

/**
 * Give the keys plate shows for a Text Entry after the item's body: under the host's
 * `textEntryKeypad` `on-screen`, the keys its response holds, and whether they type every text the
 * box takes, its `pattern-mask` among what decides that (`keypadOf` in
 * `#plate/ui/text-entry/keypad.ts`); none under `none`.
 *
 * @param paired The Text Entry.
 * @param paired.model Its model node: its `pattern-mask`.
 * @param paired.payload Its payload: its binding and `base`.
 * @param context What the page may know of the render: the host's `textEntryKeypad`.
 * @returns The keypad, or none.
 */
const keysOf = (
  { model, payload: node }: Paired<"text-entry">,
  context: Pick<IslandContext, "textEntryKeypad">,
): Option.Option<Keypad> => {
  const reading = { base: node.base, baseType: node.baseType, blankIsEmpty: true };

  return keypadOf(
    context.textEntryKeypad,
    reading,
    typedEntry(reading, Option.getOrUndefined(model.patternMask)),
  );
};

/**
 * Tell whether the author marked a Text Entry a drill's box (`plate-digits`,
 * `#plate/ui/text-entry/digits.ts`), which keeps the digits of what is typed alone.
 *
 * @param context What the page may know of the render: the author's class.
 * @returns Whether the box is a drill's.
 */
const isDrill = (context: Pick<IslandContext, "className">): boolean =>
  hasClass(context.className, digitsClass);

/**
 * Render a Text Entry's box, the island, by whether a keypad other than the device's keyboard types
 * every text it takes, so it asks the device for no keyboard.
 *
 * @param paired The Text Entry.
 * @param paired.model Its model node: the author's `data-*`, `pattern-mask` and
 *   `data-patternmask-message`, and the control plate names when the author named it by nothing.
 * @param paired.payload Its payload: its binding, `base`, `expected-length`, placeholder and names.
 * @param context What the page may know of the render.
 * @param keypadTyped Whether a keypad types every text the box takes: plate's keys after the body,
 *   or a host's own.
 * @returns The island.
 */
export const box = (
  { model, payload: node }: Paired<"text-entry">,
  context: IslandContext,
  keypadTyped: boolean,
): ReactNode => (
  <TextEntry
    base={node.base}
    baseType={node.baseType}
    digits={isDrill(context)}
    expectedLength={hintOf(node.expectedLength)}
    keypadTyped={keypadTyped}
    labels={labelsOf(textEntryKeys, context.locale, { pattern: model.patternMaskMessage })}
    response={node.declared}
    naming={controlNameOf(undefined, node, ownName(model, context), context)}
    patternMask={Option.getOrUndefined(model.patternMask)}
    placeholder={Option.getOrUndefined(node.placeholder)}
    root={rootOf(model, context)}
  />
);

/**
 * Render a Text Entry's island: its {@link box}, which asks the device for no keyboard where plate's
 * keys type every text it takes, a drill's box, which keeps digits alone, under any of plate's
 * keypads.
 *
 * @param paired The Text Entry.
 * @param context What the page may know of the render.
 * @returns The island.
 */
export const island = (paired: Paired<"text-entry">, context: IslandContext): ReactNode =>
  box(
    paired,
    context,
    Option.exists(keysOf(paired, context), (keypad) => keypad.whole || isDrill(context)),
  );

/**
 * Render a Text Entry's on-screen keypad, which `<Item>` writes after the item's body: the keys its
 * response holds where the host's `textEntryKeypad` is `on-screen` ({@link keysOf}), typing into
 * the box of its response; nothing under `none` and for a response no keypad types.
 *
 * @param paired The Text Entry.
 * @param context What the page may know of the render: the host's `textEntryKeypad` and the
 *   locale.
 * @returns The keypad's island, or nothing.
 */
export const after = (paired: Paired<"text-entry">, context: IslandContext): ReactNode =>
  Option.match(keysOf(paired, context), {
    onNone: () => null,
    onSome: (keypad) => (
      <TextEntryKeypad
        keypad={keypad}
        labels={labelsOf(keypadKeys, context.locale, {})}
        response={paired.payload.response}
      />
    ),
  });

/**
 * Mark the value a Text Entry's review shows, by the marks the host handed for its response
 * ({@link controlMarkOf}): the right answer the review writes for a wrong or missing value is the
 * value handed `missed`, an integer written in the Control's `base`, the base its text is read in.
 *
 * @param shown The value the review shows, none for no entry: NULL and a record, whose
 *   `stringValue` the Control shows but no mark judges, hold no answer to mark.
 * @param marking The marks handed for the response.
 * @param base The Text Entry's `base`.
 * @returns The mark.
 */
const markOf = (shown: ResponseValue | undefined, marking: Marking, base: number): ControlMark =>
  controlMarkOf(marking, shown !== undefined && !isRecordValue(shown) && !isNull(shown), (missed) =>
    Option.map(Arr.head(missed), (single) => writeIn(single, base)),
  );

/**
 * Give the mark a Text Entry's review writes, against what the render marks it against.
 *
 * @param paired The Text Entry.
 * @param paired.payload Its payload: its response and its `base`.
 * @param context What the shell knows: the value shown, and what the render marks it against.
 * @returns The mark.
 */
const shownMarkOf = (
  { payload: node }: Paired<"text-entry">,
  context: ReviewContext,
): ControlMark =>
  markOf(context.values.get(node.response), markingOf(node.response, context), node.base);

/**
 * Render a Text Entry's review around what shows its text: the control, named as the island names
 * its own, and its mark.
 *
 * @param paired The Text Entry.
 * @param context What the shell knows: the value shown, and what the render marks it against.
 * @param shown What shows the text the review restores, given its name.
 * @returns The markup.
 */
export const reviewOf = (
  paired: Paired<"text-entry">,
  context: ReviewContext,
  shown: (naming: Named) => ReactNode,
): ReactNode => {
  const { model, payload: node } = paired;

  return (
    <ControlReview
      locale={context.locale}
      mark={shownMarkOf(paired, context)}
      root={rootOf(model, context)}
      slot="plate-text-entry"
    >
      {shown(controlNameOf(undefined, node, ownName(model, context), context))}
    </ControlReview>
  );
};

/**
 * Render a Text Entry's review: its text in a read-only input, named as the island names its own,
 * and its mark.
 *
 * @param paired The Text Entry.
 * @param paired.payload Its payload: the text it shows and its `expected-length`.
 * @param context What the shell knows: the value shown, and what the render marks it against.
 * @returns The markup.
 */
export const review = (paired: Paired<"text-entry">, context: ReviewContext): ReactNode =>
  reviewOf(paired, context, (naming) => (
    <input
      {...naming}
      data-slot="input"
      readOnly
      size={hintOf(paired.payload.expectedLength)}
      type="text"
      value={paired.payload.restore}
    />
  ));

/**
 * Render a Text Entry's right answer, which the body walk writes after the block that holds it.
 *
 * @param paired The Text Entry.
 * @param context What the shell knows: the value shown, and what the render marks it against.
 * @returns The `plate-text-entry-answer` part where the answer shown is not right, else nothing.
 */
export const answer = (paired: Paired<"text-entry">, context: ReviewContext): ReactNode =>
  controlAnswer(shownMarkOf(paired, context), "plate-text-entry", context.locale);
