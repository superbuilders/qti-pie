"use client";

/**
 * The Slider interaction's client island (`qti-slider-interaction`): the child sets a number
 * between two bounds by dragging UI SDK's slider thumb, pressing its track, or with the keys, and
 * the number is the response.
 *
 * It follows the Choice island's pattern (`#plate/ui/choice/choice.tsx`), with these of its own:
 *
 * - **No value until set.** A slider "does not have a default or initial position except where
 *   specified by a default value for the associated response variable" (QTI 3.0 information model
 *   5.134). It shows the number its response posts, which is its default as the attempt starts
 *   where the response declares one: the host's `<Responses>` starts from the default's entry
 *   (`Posting.start`, spec reading 183), so what the slider shows is always what the form posts.
 *   With no number posted, its root is `data-empty`, the thumb says the `empty` label in place of a
 *   number, and nothing posts: the response stays NULL. The first press or key that sets it
 *   answers, the press or key that leaves the thumb at the lower bound included, so the child can
 *   choose the lower bound as any other value.
 * - **No inline style in server markup.** UI SDK places the thumb and the fill with inline styles.
 *   The page's markup carries none, so the island renders UI SDK's slider only once hydrated, where
 *   React writes those styles through the CSSOM, which a content security policy allows. The server
 *   and the hydrating render hold a box with UI SDK's `slider` slot in its place, which the
 *   stylesheet sizes as it sizes the slider, so nothing moves when it mounts.
 * - **A continuous scale.** A `float` slider with no `step` operates "on an approximately continuous
 *   scale" (5.134.3). UI SDK always steps, so it steps by the largest power of ten that still gives
 *   every CSS pixel of the screen's longer side a value of its own: a pointer sets any value it can
 *   point at, written in no more digits than that needs. Its arrow keys move a hundredth of the
 *   scale and its large steps a tenth, as a browser's own range does when its `step` is `any`.
 * - **Reverse.** A reversed horizontal slider runs right to left, by `dir="rtl"` on its scale, which
 *   UI SDK honours. A reversed vertical one has its lower bound at the top, which UI SDK has no
 *   option for, so its slider runs over the scale turned end for end, each value `v` held as `lower +
 *   upper - v`, and Home and End still go to the lower and upper bounds.
 *
 * @module
 */
import {
  Slider as SliderRoot,
  SliderControl,
  SliderIndicator,
  SliderThumb,
  SliderTrack,
  SliderValue,
} from "@ui-sdk/react/slider";
import { Option } from "effect";
import { useId, useSyncExternalStore } from "react";
import type { KeyboardEvent, PointerEvent } from "react";
import { postedNumber } from "#plate/form/encoding.ts";
import { flag } from "#plate/ui/attributes.ts";
import type { Authored, Named } from "#plate/ui/attributes.ts";
import { PromptPart } from "#plate/ui/prompt.tsx";
import type { Prompt } from "#plate/ui/prompt.tsx";
import { useResponse } from "#plate/ui/responses.tsx";
import type { Labels } from "#plate/ui/item/interactions/labels.ts";
import type { sliderKeys } from "#plate/ui/slider/labels.ts";

/**
 * What the server gives a Slider's island, as QTI's `qti-slider-interaction` and plate's
 * presentation of it say.
 *
 * @see https://www.imsglobal.org/spec/qti/v3p0/info/index.html#Root_SliderInteraction
 */
export interface SliderProps extends Authored<Named> {
  readonly labels: Labels<typeof sliderKeys>;
  /**
   * The scale's lower end: `lower-bound`, rounded down to an integer under an `integer` binding
   * (5.134.1).
   */
  readonly lower: number;
  /**
   * The entry name the response posts under, plate's `entryName` for the item's instance.
   */
  readonly name: string;
  /**
   * `orientation`, a hint (5.134.5): `horizontal` when the author wrote none. The root and every UI
   * SDK part carry it as `data-orientation`.
   */
  readonly orientation: "horizontal" | "vertical";
  /**
   * The `qti-prompt`, server-rendered under its scoped id, which `naming` then names the thumb by;
   * undefined when the interaction has none.
   */
  readonly prompt: Prompt | undefined;
  /**
   * `reverse`, a hint (5.134.6): the lower bound stands at the right of a horizontal slider and at
   * the top of a vertical one. The root carries it as `data-reverse`.
   */
  readonly reverse: boolean;
  /**
   * How far the value moves at a step, counted from `lower`: `step`, or 1 under an `integer`
   * binding that writes none (5.134.3). Undefined for a `float` binding that writes none, whose
   * scale is continuous.
   */
  readonly step: number | undefined;
  /**
   * The values `step-label` labels along the scale (5.134.4), from `lower` by `step`: empty when
   * the author asked for none or they cannot be listed.
   */
  readonly steps: readonly number[];
  /**
   * The scale's upper end: the highest value the steps from `lower` reach without passing
   * `upper-bound`, itself rounded up to an integer under an `integer` binding (5.134.2), so the
   * thumb's travel ends where its values do.
   */
  readonly upper: number;
}

/**
 * The keys UI SDK's slider thumb moves by, which set a slider that holds no value.
 *
 * @see https://www.w3.org/WAI/ARIA/apg/patterns/slider/#keyboardinteraction
 */
const movingKeys: ReadonlySet<string> = new Set([
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "ArrowUp",
  "End",
  "Home",
  "PageDown",
  "PageUp",
]);

/**
 * How many of a continuous scale's arrow-key steps cross it, as a browser's own range moves when
 * its `step` is `any`.
 *
 * @see https://source.chromium.org/chromium/chromium/src/+/main:third_party/blink/renderer/core/html/forms/range_input_type.cc
 */
const keyStepsAcross = 100;

/**
 * How many of a continuous scale's large steps (Page Up, Page Down, Shift with an arrow) cross it.
 */
const largeStepsAcross = 10;

/**
 * Subscribe to nothing: the hydration flag never changes once read.
 *
 * @returns The unsubscriber, which has nothing to undo.
 */
const subscribeNever = (): (() => void) => () => {
  // Nothing was subscribed, so there is nothing to undo.
};

/**
 * Tell whether the island renders in a hydrated page: false on the server and in the render that
 * hydrates its markup, true in every render after, so what renders only when hydrated is created
 * by React on the client, never written into the server's markup.
 *
 * @returns Whether the page is hydrated.
 * @see https://react.dev/reference/react/useSyncExternalStore#adding-support-for-server-rendering
 */
const useHydrated = (): boolean =>
  useSyncExternalStore(
    subscribeNever,
    () => true,
    () => false,
  );

/**
 * Count the decimal places a number is written with, an exponent included.
 *
 * @param value A finite number.
 * @returns Its places after the decimal point: 0 for an integer, 3 for `0.125`, 7 for `1e-7`.
 */
const decimalsOf = (value: number): number => {
  const [mantissa = "", exponent = "0"] = String(value).toLowerCase().split("e");

  return Math.max(0, (mantissa.split(".")[1] ?? "").length - Number(exponent));
};

/**
 * Read the number a response's text holds, as the form encoding reads a posted number
 * ({@link postedNumber}).
 *
 * @param text The response's text, as posted, absent when it posts none.
 * @returns The number, undefined when the text is absent, blank or no finite number.
 */
const numberOf = (text: string | undefined): number | undefined =>
  Option.fromUndefinedOr(text).pipe(
    Option.flatMap(postedNumber),
    Option.map(Number),
    Option.filter(Number.isFinite),
    Option.getOrUndefined,
  );

/**
 * Give the step a continuous scale moves by under a pointer: the largest power of ten no more than
 * the scale's span over the screen's longer side in CSS pixels, so no two pixels a track can span
 * share a value. It reads the screen, so it runs only in a hydrated page.
 *
 * @param span The scale's span, `upper - lower`.
 * @returns The step.
 */
const resolutionOf = (span: number): number =>
  10 ** Math.floor(Math.log10(span / Math.max(window.screen.width, window.screen.height)));

/**
 * Render a Slider for the child to answer, holding its response in the item's `<Responses>`.
 *
 * The parts:
 *
 * - `plate-slider`, the root, with what the author wrote on it (`root`: the `class` and the
 *   `data-*`), `data-orientation`, `data-reverse` while reversed, and `data-empty` while the slider
 *   holds no value;
 * - `plate-prompt`, the prompt;
 * - `plate-slider-scale`, the bounds, the slider and the step labels, `dir="rtl"` when a horizontal
 *   slider is reversed;
 * - `plate-slider-bound`, each end's number, `data-bound="lower"` or `"upper"`, which the thumb's
 *   `aria-describedby` names;
 * - UI SDK's `slider`, `slider-value` (the readout, the `empty` label while there is no value),
 *   `slider-control` (where presses land), `slider-track`, `slider-indicator` and `slider-thumb`,
 *   whose native range input takes focus, named by `naming`, which the server resolved: the prompt,
 *   the author's `aria-labelledby` or `aria-label`, or plate's own name. The stylesheet gives the
 *   control and the thumb the K–3 hit area of 64 px. Before hydration a bare `slider` box stands in
 *   their place;
 * - `plate-slider-steps`, the step labels' list, hidden from screen readers, which hear the value,
 *   holding a `plate-slider-step` per value.
 *
 * Every change writes the response, and the host paces its saves.
 *
 * @param props The interaction, its response's entry name and its labels ({@link SliderProps}).
 * @returns The Slider, its thumb bound to the response.
 * @see https://ui-sdk.dev/docs/react/components/slider
 */
export const Slider = (props: SliderProps) => {
  const { labels, lower, name, naming, orientation, prompt, reverse, root, step, steps, upper } =
    props;
  const [texts, set] = useResponse(name);
  const hydrated = useHydrated();
  const id = useId();
  const shown = numberOf(texts[0]);
  const empty = shown === undefined;
  const flipped = orientation === "vertical" && reverse;
  const span = upper - lower;
  const current = shown ?? lower;
  const write = (value: number) => {
    set([String(value)]);
  };
  const lowerId = `${id}-lower`;
  const upperId = `${id}-upper`;

  /**
   * Answer for a key on a slider that holds no value, before UI SDK moves it: the lower bound,
   * which the move then replaces. On a reversed vertical slider, take Home and End from UI SDK,
   * whose minimum and maximum there are the upper and lower bounds, and go to the lower and upper
   * bound.
   */
  const onThumbKey = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!movingKeys.has(event.key)) {
      return;
    }

    if (flipped && (event.key === "Home" || event.key === "End")) {
      event.preventDefault();
      event.stopPropagation();
      write(event.key === "Home" ? lower : upper);

      return;
    }

    if (empty) {
      write(lower);
    }
  };

  /**
   * Answer for a press on a slider that holds no value, before UI SDK moves it: the lower bound,
   * which the press then replaces unless it lands there.
   */
  const onPress = (event: PointerEvent<HTMLDivElement>) => {
    if (empty && event.button === 0) {
      write(lower);
    }
  };

  /**
   * Render UI SDK's slider over the scale, which runs only in a hydrated page: its step is the
   * interaction's, or a continuous scale's pointer resolution, read from the screen.
   */
  const scale = () => {
    const scaleStep = step ?? resolutionOf(span);
    const places = Math.max(decimalsOf(lower), decimalsOf(upper), decimalsOf(scaleStep));
    const tidy = (value: number) => Number(value.toFixed(places));
    const turned = (value: number) => (flipped ? tidy(lower + upper - value) : value);

    return (
      <SliderRoot
        format={(value) => (empty ? labels.empty : String(turned(value)))}
        {...(step === undefined ? { largeStep: tidy(span / largeStepsAcross) } : {})}
        max={upper}
        min={lower}
        orientation={orientation}
        step={scaleStep}
        value={turned(current)}
        onValueChange={(next, details) => {
          const key = details.reason === "step-key" ? details.event : undefined;

          if (step === undefined && key?.key.startsWith("Arrow") === true && !key.shiftKey) {
            details.cancel();
            write(
              Math.min(
                upper,
                Math.max(
                  lower,
                  tidy(current + Math.sign(turned(next) - current) * (span / keyStepsAcross)),
                ),
              ),
            );

            return;
          }

          write(turned(next));
        }}
      >
        <SliderValue />
        <SliderControl onPointerDown={onPress}>
          <SliderTrack>
            <SliderIndicator />
            <SliderThumb
              aria-describedby={`${lowerId} ${upperId}`}
              {...naming}
              onKeyDownCapture={onThumbKey}
            />
          </SliderTrack>
        </SliderControl>
      </SliderRoot>
    );
  };

  return (
    <div
      {...root}
      data-empty={flag(empty)}
      data-orientation={orientation}
      data-reverse={flag(reverse)}
      data-slot="plate-slider"
    >
      <PromptPart prompt={prompt} />
      <div data-slot="plate-slider-scale" dir={reverse && !flipped ? "rtl" : undefined}>
        <span data-bound="lower" data-slot="plate-slider-bound" id={lowerId}>
          {String(lower)}
        </span>
        {hydrated ? scale() : <div data-orientation={orientation} data-slot="slider" />}
        <span data-bound="upper" data-slot="plate-slider-bound" id={upperId}>
          {String(upper)}
        </span>
        {steps.length > 0 ? (
          <ol aria-hidden="true" data-slot="plate-slider-steps">
            {steps.map((value) => (
              <li key={value} data-slot="plate-slider-step">
                {String(value)}
              </li>
            ))}
          </ol>
        ) : null}
      </div>
    </div>
  );
};
