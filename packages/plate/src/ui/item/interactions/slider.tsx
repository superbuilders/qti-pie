/**
 * Slider (Q-19) in the server shell: what renders a `qti-slider-interaction`'s payload node, its
 * island in `answering` (`#plate/ui/slider/slider.tsx`) and its server markup in `review` and
 * `solution`, both from the payload node alone, as the core's `redact` gave it.
 *
 * The scale both show runs from the lower bound to the highest value the steps reach: QTI
 * constrains the response to the steps counted from the lower bound (QTI 3.0 information model
 * 5.134.3), so where they do not land on the upper bound, the last step below it is the scale's
 * end, where a child's thumb stops and the bound's label stands.
 *
 * @module
 */
import { Array as Arr, Option } from "effect";
import type { ReactNode } from "react";
import { message, messageText } from "#plate/messages.ts";
import type { Locale } from "#plate/messages.ts";
import { format } from "#plate/model/values.ts";
import type { PayloadOf } from "#plate/model/interactions.ts";
import type { Paired } from "#plate/payload.ts";
import { flag } from "#plate/ui/attributes.ts";
import type { Named } from "#plate/ui/attributes.ts";
import type { IslandContext, ReviewContext } from "#plate/ui/item/context.ts";
import { controlParts } from "#plate/ui/item/interactions/control-mark.tsx";
import type { ControlMark } from "#plate/ui/item/interactions/control-mark.tsx";
import {
  controlNameOf,
  labelsOf,
  ownName,
  promptAt,
  rootOf,
} from "#plate/ui/item/interactions/labels.ts";
import { markingOf, missedShown } from "#plate/ui/item/interactions/marks.ts";
import type { Marking } from "#plate/ui/item/interactions/marks.ts";
import { markPart } from "#plate/ui/item/interactions/words.tsx";
import { PromptPart } from "#plate/ui/prompt.tsx";
import type { Prompt } from "#plate/ui/prompt.tsx";
import { sliderKeys } from "#plate/ui/slider/labels.ts";
import { Slider } from "#plate/ui/slider/slider.tsx";

/**
 * A Slider's payload node, as its module's `redact` gave it.
 */
type SliderNode = PayloadOf<"slider">;

/**
 * The significant digits a step count and a scale's end are read to: enough for any bound or step
 * an author writes, few enough to drop the error a double's division leaves, as the core lists the
 * steps `step-label` labels.
 */
const significant = 12;

/**
 * Give the scale's upper end: the upper bound when the slider is continuous, else the highest value
 * the steps from the lower bound reach without passing it.
 *
 * @param node The Slider's payload: its bounds, rounded under an `integer` binding, and its step.
 * @returns The end.
 */
const endOf = (node: Pick<SliderNode, "lower" | "step" | "upper">): number =>
  Option.match(node.step, {
    onNone: () => node.upper,
    onSome: (step) => {
      const count = Math.floor(Number(((node.upper - node.lower) / step).toPrecision(significant)));

      return Number((node.lower + count * step).toPrecision(significant));
    },
  });

/**
 * Give the orientation a Slider is drawn in: the author's hint, horizontal where the author wrote
 * none, since the XSD gives `orientation` no default.
 *
 * @param node The Slider's payload.
 * @returns The orientation.
 */
const orientationOf = (node: Pick<SliderNode, "orientation">): "horizontal" | "vertical" =>
  Option.getOrElse(node.orientation, () => "horizontal" as const);

/**
 * Give the scale's `dir`: right to left for a reversed horizontal slider, whose lower bound stands
 * at the right; none otherwise, a vertical one's reverse being drawn by its own scale.
 *
 * @param node The Slider's payload.
 * @returns The `dir` attribute, undefined for none.
 */
const scaleDir = (node: Pick<SliderNode, "orientation" | "reverse">): "rtl" | undefined =>
  node.reverse && orientationOf(node) === "horizontal" ? "rtl" : undefined;

/**
 * Give where a value stands along the scale: its share of the scale from the lower bound, 0 at the
 * lower bound and 1 at the scale's end, a value past either end at that end; none for a scale of no
 * length, whose end is not above its lower bound.
 *
 * @param value The value, as the payload writes it.
 * @param node The Slider's payload: its bounds and its step.
 * @returns The share, or none.
 */
const fractionOf = (
  value: string,
  node: Pick<SliderNode, "lower" | "step" | "upper">,
): Option.Option<number> => {
  const span = endOf(node) - node.lower;

  return span > 0
    ? Option.some(Math.min(1, Math.max(0, (Number(value) - node.lower) / span)))
    : Option.none();
};

/**
 * Mark the value a review shows against the correct one, as `qti-match` compares two numbers: by
 * value, so `6` and `6.0` are one number. The mark is a Control's, its right answer the correct
 * value as the payload writes it: none marked where there is no solution to mark against, or in a
 * solution, whose value is the correct one; `unanswered` for a response left NULL.
 *
 * @param given The value shown, as the payload writes it, none for NULL.
 * @param marking How the review marks the Slider's response.
 * @returns The mark: `unmarked` unless the review marks `against` a correct value.
 */
const valueMarkOf = (given: Option.Option<string>, marking: Marking): ControlMark => {
  if (marking.kind !== "against") {
    return { kind: "unmarked" };
  }

  return Option.match(Option.map(Arr.head(marking.correct.values), format), {
    onNone: (): ControlMark => ({ kind: "unmarked" }),
    onSome: (correct) => {
      const answer = Arr.head(missedShown(marking, [correct]));

      return Option.match(given, {
        onNone: (): ControlMark => ({ answer, kind: "unanswered" }),
        onSome: (value): ControlMark =>
          Number(value) === Number(correct) ? { kind: "right" } : { answer, kind: "wrong" },
      });
    },
  });
};

/**
 * Write the correct value after a value a review marks as not right.
 *
 * @param shown The value's mark.
 * @param locale The locale of plate's own text.
 * @returns The `plate-slider-answer` part, `data-mark="missed"`, or nothing where the value is
 *   right or unmarked.
 */
const answerPart = (shown: ControlMark, locale: Locale): ReactNode => {
  switch (shown.kind) {
    case "unanswered":
    case "wrong": {
      return Option.match(shown.answer, {
        onNone: () => null,
        onSome: (answer) => (
          <span data-mark="missed" data-slot="plate-slider-answer">
            {message(locale, "markMissedAnswer", { answer })}
          </span>
        ),
      });
    }
    case "right":
    case "unmarked": {
      return null;
    }
    default: {
      return shown satisfies never;
    }
  }
};

/**
 * Give what names a Slider's thumb, in its island and its review alike: its prompt, else the
 * author's `aria-labelledby` or `aria-label`, else plate's own name, numbered among the item's
 * unnamed controls.
 *
 * @param paired The Slider and its payload node.
 * @param prompt The Slider's prompt, undefined where it has none.
 * @param context What the shell knows: the redacted body, the instance and the locale.
 * @returns The attribute to spread on the thumb.
 */
const namingOf = (
  { model, payload: node }: Paired<"slider">,
  prompt: Prompt | undefined,
  context: IslandContext,
): Named => controlNameOf(prompt, node, ownName(model, context), context);

/**
 * Render a Slider's island. The value it shows is the one its response posts, which the host's
 * `<Responses>` holds: its default as the attempt starts (`Posting.start`, spec reading 183), else
 * nothing until the child sets it. The payload node's `start` is the value a review shows.
 *
 * @param paired The Slider and its payload node.
 * @param paired.model The redacted model node the payload node was given for.
 * @param paired.payload Its payload node: the range worked out, the steps to label, the hints and
 *   the names.
 * @param context What the page may know of the render.
 * @returns The island.
 */
export const island = (paired: Paired<"slider">, context: IslandContext): ReactNode => {
  const { model, payload: node } = paired;
  const prompt = promptAt(node.prompt, node.response, context);

  return (
    <Slider
      labels={labelsOf(sliderKeys, context.locale, {})}
      lower={node.lower}
      name={node.formName}
      naming={namingOf(paired, prompt, context)}
      orientation={orientationOf(node)}
      prompt={prompt}
      reverse={node.reverse}
      root={rootOf(model, context)}
      step={Option.getOrUndefined(node.step)}
      steps={node.steps}
      upper={endOf(node)}
    />
  );
};

/**
 * Render a Slider's review or solution: the scale's bounds and step labels as the island shows
 * them, and in place of its thumb the value shown, in UI SDK's `slider-value` part, named as the
 * island names its thumb. The value carries `data-fraction`, where it stands along the scale
 * ({@link fractionOf}), so a theme can stand it at its place on the track as the island's thumb
 * stood: the server's markup carries no `style`, which the page's content security policy refuses,
 * and a theme reads the number with a typed `attr()`.
 *
 * In a review against the host's solution ({@link valueMarkOf}), the value carries `data-mark`:
 * `right` where it is the correct value, as `qti-match` compares two numbers, else `wrong`; and
 * where it is not right, the correct value follows in a `plate-slider-answer` part,
 * `data-mark="missed"`, as a Text Entry's does. A response left NULL shows the `empty` label,
 * `data-empty` on the root, no place along the scale and no mark, the correct value after it all
 * the same.
 *
 * @param paired The Slider and its payload node.
 * @param paired.model The redacted model node the payload node was given for.
 * @param paired.payload Its payload node: the value the view shows, the candidate's in `review` and the
 *   correct one in `solution`.
 * @param context What the shell knows of the item and the render.
 * @returns The markup.
 */
export const review = (paired: Paired<"slider">, context: ReviewContext): ReactNode => {
  const { model, payload: node } = paired;
  const { locale } = context;
  const prompt = promptAt(node.prompt, node.response, context);
  const shown = valueMarkOf(node.start, markingOf(node.response, context));
  const parts = controlParts[shown.kind];

  return (
    <>
      <div
        {...rootOf(model, context)}
        data-empty={flag(Option.isNone(node.start))}
        data-orientation={orientationOf(node)}
        data-reverse={flag(node.reverse)}
        data-slot="plate-slider"
      >
        <PromptPart prompt={prompt} />
        <div data-slot="plate-slider-scale" dir={scaleDir(node)}>
          <span data-bound="lower" data-slot="plate-slider-bound">
            {String(node.lower)}
          </span>
          <output
            {...namingOf(paired, prompt, context)}
            data-fraction={node.start.pipe(
              Option.flatMap((value) => fractionOf(value, node)),
              Option.map(String),
              Option.getOrUndefined,
            )}
            data-mark={parts.mark}
            data-slot="slider-value"
          >
            {Option.getOrElse(node.start, () => messageText(locale, sliderKeys.empty))}
            {markPart(parts.words, locale)}
          </output>
          <span data-bound="upper" data-slot="plate-slider-bound">
            {String(endOf(node))}
          </span>
          {node.steps.length > 0 ? (
            <ol aria-hidden="true" data-slot="plate-slider-steps">
              {node.steps.map((value) => (
                <li key={value} data-slot="plate-slider-step">
                  {String(value)}
                </li>
              ))}
            </ol>
          ) : null}
        </div>
      </div>
      {answerPart(shown, locale)}
    </>
  );
};
