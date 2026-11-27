/**
 * End Attempt (Q-4), the `qti-end-attempt-interaction`: its model node, parse, redaction and its
 * rule for counting an attempt, on the module shape the interaction-module contract states.
 *
 * {@link endAttemptModule}'s `redact` gives the page the button's `title`, the declaration of its
 * response, the author's names and `count-attempt`; the server shell renders it, the one submit
 * button among the interactions (`#plate/ui/item/interactions/`). An item's start holds every End
 * Attempt response at `false`, {@link InteractionModule.absentValue}, whatever default value the
 * response declares; the button posts its response's identifier under `endedName(instance)`
 * (`#plate/instance.ts`) only when its press submits the host's form, HTML's submitter, and the
 * host's `answerOf` (`#plate/held.ts`) gives that response `true` in the answer it posts. So the
 * response is `true` when the attempt ended through the button and `false` when it ended any other
 * way, its default value ignored (QTI 3.0.1 information model §5.45).
 *
 * - **Binding.** A response of cardinality `single` and base type `boolean`; the body walk gives any
 *   other binding the notice naming the one it breaks, as for every kind.
 * - **Name.** The button's own text, `title`, names it, so plate gives it no name of its own, and the
 *   author's `aria-label` and `aria-labelledby` name it only when a blank `title` gives it no text:
 *   a name that left the visible text out would break WCAG 2.5.3.
 *
 * **`count-attempt` is a boolean** (reading `count-attempt-boolean` of `docs/spec-readings.md`).
 * The information model's description of the attribute on `qti-end-attempt-interaction` reads as a
 * count of attempts, but its type is boolean in both the XSD and the information model's own
 * attribute table, and the type is followed. As a boolean it means, by reading `end-attempt-count`:
 * `true`, or absent, counts the attempt and ends it, as any submission does; any other value,
 * `false`, leaves `numAttempts` unchanged for the attempt the candidate ended through this button.
 * A submission without the button counts as any submission does, whatever `count-attempt` says. The
 * QTI database counts attempts by it, from the stored document; plate only carries it to the
 * payload.
 *
 * @module
 * @see https://www.imsglobal.org/spec/qti/v3p0/info#Root_EndAttemptInteraction
 */

import type { Option } from "effect";
import { noReferencingChoices } from "#plate/interactions/contract.ts";
import type {
  InteractionModule,
  LevelFree,
  ModuleInteraction,
  Parsed,
} from "#plate/interactions/contract.ts";
import type { Declared, Value } from "#plate/model/values.ts";

/**
 * End Attempt's identifier in the QTI 3.0 conformance list, Appendix A.
 */
const feature = "Q-4";

/**
 * The QTI element End Attempt is read from.
 */
const element = "qti-end-attempt-interaction";

/**
 * The binding End Attempt renders with: "It must be bound to a response variable with base-type
 * boolean and single cardinality" (section 5.45).
 */
const binding = { baseTypes: ["boolean"], cardinalities: ["single"] } as const;

/**
 * An End Attempt as the model holds it: the fields every module's node shares, and its own.
 */
export interface EndAttemptInteraction extends ModuleInteraction<"end-attempt"> {
  /**
   * The author's `class`, as written, none when absent.
   */
  readonly class: Option.Option<string>;
  /**
   * `count-attempt`, true when absent: whether the attempt the candidate ends through the button
   * counts.
   */
  readonly countAttempt: boolean;
  /**
   * `title`, as written: the text the button shows.
   */
  readonly title: string;
}

/**
 * An End Attempt as the page may know it: what the module's `redact` copies of the model node and
 * reads of the view.
 */
interface EndAttemptPayload {
  /**
   * The author's `aria-label`, as written, which names the button only when its `title` gives it
   * no text.
   */
  readonly ariaLabel: Option.Option<string>;
  /**
   * The author's `aria-labelledby`, as written, which names the button only when its `title` gives
   * it no text.
   */
  readonly ariaLabelledby: Option.Option<string>;
  /**
   * The author's `class`, as written, none when absent.
   */
  readonly class: Option.Option<string>;
  /**
   * `count-attempt`, a hint for the host.
   */
  readonly countAttempt: boolean;
  /**
   * The response the button ends the attempt through, as its declaration types it: a single
   * `boolean` response.
   */
  readonly declared: Declared<"boolean", "single">;
  readonly response: string;
  /**
   * The text the button shows.
   */
  readonly title: string;
}

/**
 * The value the response takes when the attempt ends any way but through the button: a single
 * boolean `false`.
 */
const notPressed: Value = {
  baseType: "boolean",
  cardinality: "single",
  values: [{ baseType: "boolean", value: false }],
};

/**
 * The End Attempt module.
 */
export const endAttemptModule: InteractionModule<
  "end-attempt",
  LevelFree<EndAttemptInteraction>,
  EndAttemptPayload
> = {
  /**
   * A single boolean `false`: the value the body an item posts holds for the response unless the
   * button's press submitted it, whatever its default value, since the information model sets an
   * End Attempt's response to false whenever the attempt ends another way and ignores its default
   * value.
   */
  absentValue: () => notPressed,
  binding,
  element,
  feature,
  /**
   * The End Attempt itself, which holds no content.
   */
  hollow: (interaction) => interaction,
  kind: "end-attempt",
  /**
   * Read a `qti-end-attempt-interaction` into its model node, or its notice.
   *
   * The body walk has bound it to a single `boolean` response ({@link binding}). `title` is
   * required, and kept as written. `count-attempt` reads as `xs:boolean` (reading
   * `count-attempt-boolean`) and is true when absent.
   */
  parse: (source, { bound, path, read }) => {
    const title = read.requiredValue(source, "title");

    read.markElement(source);

    const countAttempt = read.xsBoolean(source, "count-attempt", true);
    const interaction: Parsed<EndAttemptInteraction> = {
      ariaLabel: read.valueOf(source, "aria-label"),
      ariaLabelledby: read.valueOf(source, "aria-labelledby"),
      class: read.valueOf(source, "class"),
      countAttempt,
      kind: "end-attempt",
      path,
      response: bound.identifier,
      title,
    };

    return interaction;
  },
  /**
   * Copy the model node into its payload node: the declaration of the response the button ends
   * the attempt through, and the author's names, which name the button only when its `title` gives
   * it no text.
   */
  redact: (interaction) => ({
    ariaLabel: interaction.ariaLabel,
    ariaLabelledby: interaction.ariaLabelledby,
    class: interaction.class,
    countAttempt: interaction.countAttempt,
    declared: { baseType: "boolean", cardinality: "single", identifier: interaction.response },
    response: interaction.response,
    title: interaction.title,
  }),
  /**
   * No region: End Attempt holds no content.
   */
  referencingChoices: noReferencingChoices,
  regions: () => [],
};
