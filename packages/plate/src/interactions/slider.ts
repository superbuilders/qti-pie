/**
 * Slider (Q-19), the `qti-slider-interaction`: its model node, parse and redaction, on the module
 * shape the interaction-module contract states. The QTI database refuses a value off its range or
 * its steps when an answer is posted.
 *
 * - **Binding.** A response of cardinality `single` and base type `integer` or `float`; any other
 *   binding is the notice naming the one it breaks, as for the four shipped kinds. Under an
 *   `integer` binding the lower bound rounds down and the upper bound up to integers, and with no
 *   `step` the step is 1; under a `float` binding the bounds are as written and with no `step` the
 *   slider moves continuously. A `step` of 0 constrains nothing, so it reads as none.
 * - **Starting position.** "A slider interaction does not have a default or initial position except
 *   where specified by a default value for the associated response variable" (QTI 3.0 information
 *   model, 5.134). So the slider starts at its response's default, the value the host's
 *   `<Responses>` starts the attempt from (the server's start, spec reading `response-default`),
 *   and with none it shows no value and its response stays NULL until the candidate sets it. A
 *   review shows the value the view gives, its payload node's `start`.
 * - **Step labels.** `step-label="true"` lists each step when there are at most 21. Past that, or
 *   with no step to list, the request is one the page cannot honour and the item's verdict marks it
 *   (`step-label`).
 * - **Orientation and reverse.** Both are hints. A vertical slider has its low bound at the bottom
 *   unless `reverse` is true, a horizontal one at the left unless it is.
 * - **Name.** The Prompt names the slider; with none, the author's `aria-labelledby`, then their
 *   `aria-label`, else plate's own name. The shell weighs them
 *   (`#plate/ui/item/interactions/labels.ts`).
 *
 * {@link sliderModule}'s `redact` gives the page the Prompt, the range worked out, the steps to
 * label, the hints, the author's names as written and the value to start at; the server shell
 * renders it (`#plate/ui/item/interactions/`).
 *
 * @module
 * @see https://www.imsglobal.org/spec/qti/v3p0/info#Root_SliderInteraction
 */
import { regex } from "arkregex";
import { Option } from "effect";
import { attributePath } from "#plate/document/source.ts";
import { boundIn, noReferencingChoices, promptRegion } from "#plate/interactions/contract.ts";
import type {
  ByLevel,
  InteractionModule,
  ModuleInteraction,
  Parsed,
  ReaderKit,
} from "#plate/interactions/contract.ts";
import type { Level, ModelLevel, Nodes, RedactedLevel } from "#plate/model/item.ts";
import { format, trimXmlSpace } from "#plate/model/values.ts";
import type { Declared } from "#plate/model/values.ts";

/**
 * Slider's identifier in the QTI 3.0 conformance list, Appendix A.
 */
const feature = "Q-19";

/**
 * The QTI element Slider is read from.
 */
const element = "qti-slider-interaction";

/**
 * The binding Slider renders with: a single `integer` or `float` response, the base type deciding
 * how its bounds and its step read.
 */
const binding = { baseTypes: ["integer", "float"], cardinalities: ["single"] } as const;

/**
 * The base types a slider's response may have: the two numeric ones.
 */
type SliderBaseType = "float" | "integer";

/**
 * The orientations `orientation` names.
 */
type Orientation = "horizontal" | "vertical";

/**
 * The most steps `step-label` lists. Past it the ticks would crowd the slider, so the request is
 * left undrawn and marked.
 */
const mostLabelledSteps = 21;

/**
 * How far a step count may fall short of a whole number, as a fraction of a step, before it is
 * counted as short: the error a double's own rounding leaves in `(upper - lower) / step`.
 */
const stepTolerance = 1e-9;

/**
 * A decimal number as a range's `value` may hold it: the digits of an `xs:double` without `INF`
 * and `NaN`, which a range's value would read as no number at all.
 */
const decimalNumber = regex("^[+-]?(?:\\d+\\.?\\d*|\\.\\d+)(?:[Ee][+-]?\\d+)?$", "u");

/**
 * A Slider as the model holds it: the fields every module's node shares, and the slider's own.
 *
 * @template L The level of its content.
 */
interface SliderInteraction<L extends Level = ModelLevel> extends ModuleInteraction<"slider"> {
  /**
   * The base type of the response it binds, which decides how its bounds and step read.
   */
  readonly baseType: SliderBaseType;
  /**
   * The author's `class`, as written, none when absent.
   */
  readonly class: Option.Option<string>;
  /**
   * `lower-bound`, as written.
   */
  readonly lowerBound: number;
  /**
   * `orientation`, a hint, none when the author wrote none.
   */
  readonly orientation: Option.Option<Orientation>;
  readonly prompt: Option.Option<Nodes<L>>;
  /**
   * `reverse`, a hint, false when absent.
   */
  readonly reverse: boolean;
  /**
   * `step`, as written, none when absent.
   */
  readonly step: Option.Option<number>;
  /**
   * `step-label`, false when absent.
   */
  readonly stepLabel: boolean;
  /**
   * `upper-bound`, as written.
   */
  readonly upperBound: number;
}

/**
 * A Slider's model node at each level.
 */
interface SliderByLevel extends ByLevel {
  readonly node: SliderInteraction<this["level"]>;
}

/**
 * A Slider as the page may know it: what the module's `redact` copies of the model node and reads
 * of the view, with the range already worked out, so the server shell needs no more.
 */
interface SliderPayload {
  /**
   * The author's `aria-label`, as written, none when absent: the shell names the thumb by it, where
   * it is not blank and neither the Prompt nor the author's `aria-labelledby` names it.
   */
  readonly ariaLabel: Option.Option<string>;
  /**
   * The author's `aria-labelledby`, as written, none when absent.
   */
  readonly ariaLabelledby: Option.Option<string>;
  /**
   * The author's `class`, as written, none when absent.
   */
  readonly class: Option.Option<string>;
  /**
   * The response the slider writes, as its declaration types it: a single `integer` or `float`.
   */
  readonly declared: Declared<SliderBaseType, "single">;
  /**
   * The lowest value: the lower bound, rounded down under an `integer` binding.
   */
  readonly lower: number;
  readonly orientation: Option.Option<Orientation>;
  readonly prompt: Option.Option<Nodes<RedactedLevel>>;
  readonly response: string;
  readonly reverse: boolean;
  /**
   * The value a review or a solution shows: the number the view shows, none when it shows none,
   * since a slider has no initial position of its own. An answering slider shows what its response
   * holds instead.
   */
  readonly start: Option.Option<string>;
  /**
   * The step, none when the slider moves continuously.
   */
  readonly step: Option.Option<number>;
  /**
   * The steps `step-label` labels, none when it asks for none or they cannot be listed.
   */
  readonly steps: readonly number[];
  /**
   * The highest value: the upper bound, rounded up under an `integer` binding.
   */
  readonly upper: number;
}

/**
 * What the slider ranges over: its bounds and its step, none when it moves continuously.
 */
interface Range {
  readonly lower: number;
  readonly step: Option.Option<number>;
  readonly upper: number;
}

/**
 * Work out the range of a Slider from its bounds and step as written.
 *
 * An `integer` binding rounds the lower bound down and the upper bound up, and steps by 1 when it
 * has no step; a `float` binding keeps the bounds, and has no step to count by when it has none. A
 * step that is not above 0 constrains nothing, so it counts as none.
 *
 * @param interaction The Slider's binding, bounds and step.
 * @returns The range the slider moves in.
 */
const rangeOf = (
  interaction: Pick<SliderInteraction, "baseType" | "lowerBound" | "step" | "upperBound">,
): Range => {
  const written = interaction.step.pipe(Option.filter((step) => step > 0));

  return interaction.baseType === "integer"
    ? {
        lower: Math.floor(interaction.lowerBound),
        step: Option.orElse(written, () => Option.some(1)),
        upper: Math.ceil(interaction.upperBound),
      }
    : { lower: interaction.lowerBound, step: written, upper: interaction.upperBound };
};

/**
 * List the steps of a range that `step-label` can label: each stop from the lower bound by the
 * step, when there is a step and there are at most {@link mostLabelledSteps} of them.
 *
 * @param range The range.
 * @returns The stops, none when they cannot be listed.
 */
const stepsOf = (range: Range): readonly number[] =>
  Option.match(range.step, {
    onNone: () => [],
    onSome: (step) => {
      const count = Math.floor((range.upper - range.lower) / step + stepTolerance) + 1;

      return count >= 1 && count <= mostLabelledSteps
        ? Array.from({ length: count }, (_, index) =>
            Number((range.lower + index * step).toPrecision(12)),
          )
        : [];
    },
  });

/**
 * Pick the text the slider starts at: the first of the candidates that is a decimal number, as a
 * range's `value` reads it, none when no candidate is.
 *
 * @param candidates The numbers the view gives, in order: the values it shows.
 * @returns The value to start at, or none.
 */
const startOf = (candidates: readonly string[]): Option.Option<string> =>
  Option.fromUndefinedOr(
    candidates.map(trimXmlSpace).find((candidate) => decimalNumber.test(candidate)),
  ).pipe(Option.map((found) => String(Number(found))));

/**
 * Throw an attribute's defect at its path in the document, for the readers that take one.
 */
type Refuse = Parameters<ReaderKit["doubleAttribute"]>[2];

/**
 * The Slider module.
 */
export const sliderModule: InteractionModule<"slider", SliderByLevel, SliderPayload> = {
  binding,
  element,
  feature,
  /**
   * The Slider with its Prompt's content emptied.
   */
  hollow: (interaction) => ({
    ...interaction,
    prompt: interaction.prompt.pipe(Option.map(() => [])),
  }),
  kind: "slider",
  /**
   * Read a `qti-slider-interaction` into its model node, or its notice.
   *
   * The body walk has bound it to a single `integer` or `float` response ({@link binding}). Its
   * bounds and step must be finite numbers, else the notice names the one that is not.
   * `lower-bound` and `upper-bound` are required, `step` is optional, `step-label` and `reverse`
   * read as `xs:boolean` and default to false. A `step-label` that {@link stepsOf} cannot list is
   * marked on the verdict.
   */
  parse: (source, { bound: declaration, notice, path, read }) => {
    const { baseType } = boundIn(binding, declaration);
    const refuse: Refuse = (attribute, rule, detail) =>
      read.inadmissible(rule, attributePath(path, attribute), detail);
    const bound = (name: "lower-bound" | "upper-bound") =>
      Option.getOrElse(read.doubleAttribute(source, name, refuse), () =>
        read.inadmissible("missing-attribute", path, {
          attribute: name,
          element: read.nameOf(source),
        }),
      );
    const lowerBound = bound("lower-bound");
    const upperBound = bound("upper-bound");
    const step = read.doubleAttribute(source, "step", refuse);
    const unbounded = (
      [
        ["lower-bound", Option.some(lowerBound)],
        ["upper-bound", Option.some(upperBound)],
        ["step", step],
      ] as const
    ).find(([, candidate]) => Option.exists(candidate, (value) => !Number.isFinite(value)));
    if (unbounded !== undefined) {
      return notice(
        `${unbounded[0]}="${Option.getOrElse(read.valueOf(source, unbounded[0]), () => "")}"`,
      );
    }

    read.markElement(source);

    const stepLabel = read.xsBoolean(source, "step-label", false);
    const reverse = read.xsBoolean(source, "reverse", false);
    const orientation = read.enumerated(source, "orientation", ["horizontal", "vertical"]);
    const interaction: Parsed<SliderInteraction> = {
      ariaLabel: read.valueOf(source, "aria-label"),
      ariaLabelledby: read.valueOf(source, "aria-labelledby"),
      baseType,
      class: read.valueOf(source, "class"),
      kind: "slider",
      lowerBound,
      orientation,
      path,
      prompt: read.content(source, "qti-prompt"),
      response: declaration.identifier,
      reverse,
      step,
      stepLabel,
      upperBound,
    };
    if (stepLabel && stepsOf(rangeOf(interaction)).length === 0) {
      read.mark(source, "step-label");
    }

    return interaction;
  },
  /**
   * Copy the model node into its payload node: the Prompt through the kit, the range worked out,
   * the response's declaration, and the number it starts at, the value it shows, else none.
   */
  redact: (interaction, kit) => {
    const range = rangeOf(interaction);

    return {
      ariaLabel: interaction.ariaLabel,
      ariaLabelledby: interaction.ariaLabelledby,
      class: interaction.class,
      declared: {
        baseType: interaction.baseType,
        cardinality: "single",
        identifier: interaction.response,
      },
      lower: range.lower,
      orientation: interaction.orientation,
      prompt: interaction.prompt,
      response: interaction.response,
      reverse: interaction.reverse,
      start: startOf(kit.shown(interaction.response).map(format)),
      step: range.step,
      steps: interaction.stepLabel ? stepsOf(range) : [],
      upper: range.upper,
    };
  },
  /**
   * The Prompt, the one content a Slider holds.
   */
  referencingChoices: noReferencingChoices,
  regions: promptRegion,
};
