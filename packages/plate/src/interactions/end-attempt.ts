/**
 * End Attempt (Q-4), the `qti-end-attempt-interaction`: its model node, parse, redaction, its rule
 * for counting an attempt and its response validation, on the module shape the interaction-module
 * contract states.
 *
 * {@link endAttemptModule}'s `redact` gives the page the button's `title`, the entry name it posts
 * `true` under, the author's names and `count-attempt`; the server shell renders it, the one submit
 * button among the interactions (`#plate/ui/item/interactions/`). A submission by any other means
 * posts no entry for the response, which decodes to `false` through
 * {@link InteractionModule.absentValue}, whatever default value the response declares: the
 * information model sets the response to `false` whenever the attempt ends another way, and
 * ignores its default value.
 *
 * - **Binding.** A response of cardinality `single` and base type `boolean`; the body walk gives any
 *   other binding the notice naming the one it breaks, as for every kind.
 * - **Name.** The button's own text, `title`, names it, so plate gives it no name of its own, and the
 *   author's `aria-label` and `aria-labelledby` name it only when a blank `title` gives it no text:
 *   a name that left the visible text out would break WCAG 2.5.3.
 *
 * **`count-attempt` is a boolean** (reading 27 of `docs/spec-readings.md`). The information model's
 * description of the attribute on `qti-end-attempt-interaction` reads as a count of attempts, but
 * its type is boolean in both the XSD and the information model's own attribute table, and the type
 * is followed. As a boolean it means, by reading 204: `true`, or absent, counts the attempt and
 * ends it, as any submission does; any other value, `false`, leaves `numAttempts` unchanged for the
 * attempt the candidate ended through this button. A submission without the button counts as any
 * submission does, whatever `count-attempt` says. {@link InteractionModule.countsAttempt} carries
 * the rule to the engine through the hubs, so `runAttempt` names no kind.
 *
 * {@link validateEndAttempt} checks a value the caller decoded, in tier (a) only: an entry the
 * button cannot have posted. The messages are English and live in this module.
 *
 * @module
 * @see https://www.imsglobal.org/spec/qti/v3p0/info#Root_EndAttemptInteraction
 */

import type { Option } from "effect";
import type { Configuration } from "#plate/configuration.ts";
import { Malformed } from "#plate/form/encoding.ts";
import type {
  InteractionModule,
  LevelFree,
  ModuleInteraction,
  Parsed,
  ValidationMessage,
} from "#plate/interactions/contract.ts";
import { message } from "#plate/messages.ts";
import { trimXmlSpace } from "#plate/model/values.ts";
import type { Value } from "#plate/model/values.ts";

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
   * The name the button posts `true` under.
   */
  readonly formName: string;
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
 * Tell whether a submission's value of the response is the button's `true`.
 *
 * @param posted The submission's responses, by identifier.
 * @param response The identifier of the End Attempt's response.
 * @returns Whether the response holds a boolean `true`; false for `false`, NULL and a response the
 *   submission did not set.
 */
const endedThroughButton = (posted: Readonly<Record<string, Value>>, response: string): boolean =>
  posted[response]?.values.some((single) => single.baseType === "boolean" && single.value) ?? false;

/**
 * Check an End Attempt's response, which the caller decoded, in tier (a) alone.
 *
 * The caller decodes the posted entry with `decode`, under the entry name its form gave the
 * Control, the End Attempt's binding (a single `boolean`) and the posting's options, and passes
 * the value, or the {@link Malformed} `decode` gave. The button posts `true` alone, so an entry
 * `decode` refused, whatever its reason (`boolean`, `single-many`, `file`, `character`), did not
 * come from the button; the message names it and asks the candidate to press it again. A decoded
 * value, `true` or `false`, and NULL, which a host that decodes without the posting's options gets
 * for no entry, are every one the page can have posted, so they give none.
 *
 * @param interaction The End Attempt.
 * @param input The decoded value, or why the entry did not decode.
 * @param configuration The configuration, which gives the locale.
 * @returns One message when the entry did not decode, none otherwise.
 */
const validateEndAttempt = (
  interaction: EndAttemptInteraction,
  input: Value | Malformed,
  configuration: Configuration,
): readonly ValidationMessage[] => {
  if (!(input instanceof Malformed)) {
    return [];
  }

  const { locale } = configuration;
  const title = trimXmlSpace(interaction.title);

  return [
    {
      response: interaction.response,
      text: message(locale, "endAttemptNotRecognised", {
        label: title === "" ? message(locale, "endAttempt") : title,
      }),
    },
  ];
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
   * A single boolean `false`: a submission without the button's entry sets the response to
   * `false`, whatever its default value, since the information model sets an End Attempt's
   * response to false whenever the attempt ends another way and ignores its default value.
   */
  absentValue: () => notPressed,
  binding,
  /**
   * Whether the submission counts an attempt, by `count-attempt` (reading 204): false only when
   * `count-attempt` is false and the submission set the response to the button's `true`, so the
   * attempt the candidate ended through this button is not counted; true otherwise, for a
   * submission without the button and for `count-attempt` true or absent.
   */
  countsAttempt: (interaction, posted) =>
    interaction.countAttempt || !endedThroughButton(posted, interaction.response),
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
   * required, and kept as written. `count-attempt` reads as `xs:boolean` (reading 27) and is true
   * when absent.
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
   * Copy the model node into its payload node: the entry name the button posts under, and
   * the author's names, which name the button only when its `title` gives it no text.
   */
  redact: (interaction, kit) => ({
    ariaLabel: interaction.ariaLabel,
    ariaLabelledby: interaction.ariaLabelledby,
    class: interaction.class,
    countAttempt: interaction.countAttempt,
    formName: kit.formName(interaction.response),
    response: interaction.response,
    title: interaction.title,
  }),
  /**
   * No region: End Attempt holds no content.
   */
  regions: () => [],
  validate: validateEndAttempt,
};
