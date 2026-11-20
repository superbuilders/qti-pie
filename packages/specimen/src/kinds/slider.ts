/**
 * Slider (`qti-slider-interaction`): a number between two bounds, on steps or a continuous scale,
 * across or upright, either way round.
 *
 * @module
 */
import { Option } from "effect";
import type { Answered } from "#specimen/answer.ts";
import { credited, matchesCorrect } from "#specimen/credit.ts";
import { dimension } from "#specimen/dimension.ts";
import { kind } from "#specimen/kind.ts";
import { correctResponse, declaration } from "#specimen/response.ts";
import { element } from "#specimen/xml.ts";

/**
 * The response's identifier.
 */
const response = "RESPONSE";

/**
 * One scale a slider ranges over: its base type and bounds, its `step` where it writes one, and
 * the numbers a case uses, each on the scale's steps: the right one, a wrong one, and the one the
 * declaration's default value starts it at.
 */
interface Scale {
  readonly baseType: "float" | "integer";
  readonly lower: number;
  readonly right: number;
  readonly start: number;
  readonly step: Option.Option<number>;
  readonly upper: number;
  readonly wrong: number;
}

/**
 * The scales: whole numbers by twos, whole numbers by ones (an integer slider's step when it writes
 * none), quarters, and a continuous float scale, which has no step to label.
 */
const scales = {
  continuous: {
    baseType: "float",
    lower: 0,
    right: 0.5,
    start: 0.25,
    step: Option.none(),
    upper: 1.5,
    wrong: 1,
  },
  ones: {
    baseType: "integer",
    lower: 0,
    right: 6,
    start: 2,
    step: Option.none(),
    upper: 10,
    wrong: 4,
  },
  quarters: {
    baseType: "float",
    lower: 0,
    right: 0.75,
    start: 0.25,
    step: Option.some(0.25),
    upper: 1.5,
    wrong: 1.25,
  },
  twos: {
    baseType: "integer",
    lower: 0,
    right: 6,
    start: 2,
    step: Option.some(2),
    upper: 10,
    wrong: 4,
  },
} as const satisfies Record<string, Scale>;

/**
 * A Slider's settings.
 */
interface SliderSettings {
  /**
   * Whether each step is labelled, `step-label`: never on the continuous scale, which has no step,
   * and which plate marks.
   */
  readonly labels: "labelled" | "none";
  readonly orientation: "horizontal" | "unwritten" | "vertical";
  readonly reverse: boolean;
  readonly scale: keyof typeof scales;
  /**
   * Whether the declaration's default value starts the slider, so the untouched slider posts it.
   */
  readonly start: "default" | "none";
}

/**
 * The response a number posts.
 *
 * @param value The number.
 * @returns Its one entry.
 */
const posted = (value: number): Answered["posted"] => [[response, String(value)]];

export const slider = kind("slider", {
  answers: (settings: SliderSettings) => {
    const scale: Scale = scales[settings.scale];

    return [
      { answer: "right", posted: posted(scale.right), score: 1 },
      { answer: "wrong", posted: posted(scale.wrong), score: 0 },
      {
        answer: "empty",
        posted: settings.start === "default" ? posted(scale.start) : [],
        score: 0,
      },
    ];
  },
  dimensions: {
    labels: dimension("Step labels", [
      ["none", "None", "none"],
      ["labelled", "step-label", "labelled"],
    ]),
    orientation: dimension("Orientation", [
      ["unwritten", "Unwritten", "unwritten"],
      ["horizontal", "Horizontal", "horizontal"],
      ["vertical", "Vertical", "vertical"],
    ]),
    reverse: dimension("Reverse", [
      ["no", "No", false],
      ["yes", "Yes", true],
    ]),
    scale: dimension("Scale", [
      ["twos", "0 to 10 by 2", "twos"],
      ["ones", "0 to 10, no step written", "ones"],
      ["quarters", "0 to 1.5 by 0.25", "quarters"],
      ["continuous", "0 to 1.5, continuous", "continuous"],
    ]),
    start: dimension("Starts at", [
      ["none", "No number", "none"],
      ["default", "Its default value", "default"],
    ]),
  },
  label: "Slider",
  settings:
    (pick) =>
    (source): SliderSettings => {
      const scale = source.draw(pick("scale"));

      return {
        labels: scale === "continuous" ? "none" : source.draw(pick("labels")),
        orientation: source.draw(pick("orientation")),
        reverse: source.draw(pick("reverse")),
        scale,
        start: source.draw(pick("start")),
      };
    },
  write: (settings: SliderSettings, context) => {
    const scale: Scale = scales[settings.scale];

    return {
      assets: [],
      body: element(
        "qti-slider-interaction",
        {
          "lower-bound": scale.lower,
          orientation:
            settings.orientation === "unwritten"
              ? Option.none()
              : Option.some(settings.orientation),
          "response-identifier": response,
          reverse: settings.reverse ? Option.some("true") : Option.none(),
          step: scale.step,
          "step-label": settings.labels === "labelled" ? Option.some("true") : Option.none(),
          "upper-bound": scale.upper,
        },
        ...Option.match(context.prompt, {
          onNone: () => [],
          onSome: (prompt) => [element("qti-prompt", {}, prompt)],
        }),
      ),
      declarations: [
        declaration(
          response,
          "single",
          scale.baseType,
          ...(settings.start === "default"
            ? [element("qti-default-value", {}, element("qti-value", {}, String(scale.start)))]
            : []),
          correctResponse([String(scale.right)]),
        ),
      ],
      host: Option.none(),
      scoring: { kind: "scored", most: 1, rules: [credited(matchesCorrect(response), 1)] },
    };
  },
});
