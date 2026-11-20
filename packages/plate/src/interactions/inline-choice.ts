/**
 * Inline Choice (Q-12), the `qti-inline-choice-interaction`: its model node, parse, redaction and
 * response validation, on the module shape the interaction-module contract states.
 *
 * An Inline Choice stands inside the author's sentence and binds an identifier response of single
 * cardinality; any other binding is the notice naming the one it breaks. Its choices are read and
 * presented as a Choice's are (`simpleChoiceOf` and `presented` in
 * `#plate/interactions/choice.ts`): in document order in the model, in the seeded order on a
 * shuffled page, each fixed choice at its own place, and a choice its template variable hides is
 * decided by the redaction through its region. Each choice holds the content `InlineChoiceDType`
 * admits, which the island shows as the server rendered it.
 *
 * {@link validateInlineChoice} checks a value the caller decoded, in two tiers: tier (a) always,
 * tier (b) only under `validateResponses`.
 *
 * @module
 * @see https://www.imsglobal.org/spec/qti/v3p0/info#Root_InlineChoiceInteraction
 */
import { Option } from "effect";
import type { Configuration } from "#plate/configuration.ts";
import type { SourceElement } from "#plate/document/source.ts";
import { Malformed } from "#plate/form/encoding.ts";
import { presented, simpleChoiceOf, simpleChoiceRegions } from "#plate/interactions/choice.ts";
import type {
  ByLevel,
  InteractionModule,
  ModuleInteraction,
  ModuleParseContext,
  OwnRegion,
  Parsed,
  ValidationMessage,
} from "#plate/interactions/contract.ts";
import { message, numeral } from "#plate/messages.ts";
import type {
  BodyNode,
  Level,
  ModelLevel,
  Nodes,
  RedactedLevel,
  SimpleChoice,
} from "#plate/model/item.ts";
import { format } from "#plate/model/values.ts";
import type { Value } from "#plate/model/values.ts";

/**
 * Inline Choice's identifier in the QTI 3.0 conformance list, Appendix A.
 */
const feature = "Q-12";

/**
 * The QTI element Inline Choice is read from.
 */
const element = "qti-inline-choice-interaction";

/**
 * The binding Inline Choice renders with: "The inlineChoiceInteraction must be bound to a response
 * variable with a base-type of identifier and single cardinality only" (section 5.74).
 */
const binding = { baseTypes: ["identifier"], cardinalities: ["single"] } as const;

/**
 * A `qti-inline-choice-interaction` (Q-12), bound to an identifier response of single
 * cardinality, which stands inside the author's sentence. The model keeps its choices in document
 * order whatever `shuffle` says; the payload presents a shuffled Inline Choice's choices in the
 * seeded order, each fixed choice at its own place, as a Choice's.
 *
 * @template L The level of its content.
 */
export interface InlineChoiceInteraction<
  L extends Level = ModelLevel,
> extends ModuleInteraction<"inline-choice"> {
  /**
   * Each `qti-inline-choice` in document order, which has a `qti-simple-choice`'s identifier,
   * content and `fixed`; the identifiers are unique within the interaction (info model 5.73.1).
   */
  readonly choices: readonly SimpleChoice<L>[];
  /**
   * The author's `class`, as written, none when absent.
   */
  readonly class: Option.Option<string>;
  /**
   * The content of the interaction's first `qti-label`, none when it has none.
   */
  readonly label: Option.Option<Nodes<L>>;
  /**
   * The author's replacement for the too-few message, `data-min-selections-message`.
   */
  readonly messages: { readonly min: Option.Option<string> };
  /**
   * `min-choices`, 0 when absent: a count, 0 to 2^63-1, held exactly (reading 46). One above 1 is
   * kept as written, so under `validateResponses` no response of a single binding meets it.
   */
  readonly minChoices: bigint;
  /**
   * The author's `data-prompt`, the text of the option that stands for no answer.
   */
  readonly placeholder: Option.Option<string>;
  /**
   * `required`, an `xs:boolean`, false when absent: under `validateResponses`, a NULL response is
   * refused even when `min-choices` is 0.
   */
  readonly required: boolean;
  /**
   * `shuffle`, an `xs:boolean`, false when absent.
   */
  readonly shuffle: boolean;
}

/**
 * An Inline Choice's model node at each level.
 */
interface InlineChoiceByLevel extends ByLevel {
  readonly node: InlineChoiceInteraction<this["level"]>;
}

/**
 * An Inline Choice as the page may know it: its Label, its placeholder, its choices in the order
 * they are presented, how its Control is named and the identifier it restores.
 */
export interface InlineChoicePayload {
  /**
   * The author's `aria-label`, as written, which names the Control when no Label does.
   */
  readonly ariaLabel: Option.Option<string>;
  /**
   * The author's `aria-labelledby`, as written, which names the Control when no Label does.
   */
  readonly ariaLabelledby: Option.Option<string>;
  /**
   * The choices in presented order, as a Choice's are ordered (`presented` in
   * `#plate/interactions/choice.ts`).
   */
  readonly choices: readonly {
    readonly content: Nodes<RedactedLevel>;
    readonly identifier: string;
  }[];
  /**
   * The author's `class`, as written, none when absent.
   */
  readonly class: Option.Option<string>;
  /**
   * The name its Control posts under, `entryName(instance, response)`.
   */
  readonly formName: string;
  /**
   * The content of the first `qti-label`, none when the interaction has none.
   */
  readonly label: Option.Option<Nodes<RedactedLevel>>;
  /**
   * The author's `data-prompt`, the text of the option that stands for no answer.
   */
  readonly placeholder: Option.Option<string>;
  /**
   * The identifier of the response it binds.
   */
  readonly response: string;
  /**
   * The identifier the Control shows as chosen, the view's value; none for NULL.
   */
  readonly restore: Option.Option<string>;
}

/**
 * Give the region of an Inline Choice's Label, none when it has no `qti-label`.
 *
 * @template L The level of its content.
 * @param interaction The Inline Choice.
 * @returns The Label's region, its content put back as the node's `label`.
 */
const labelRegion = <L extends Level>(
  interaction: InlineChoiceInteraction<L>,
): readonly OwnRegion<InlineChoiceInteraction<L>, BodyNode<L>>[] =>
  Option.match(interaction.label, {
    onNone: () => [],
    onSome: (nodes) => [
      {
        nodes,
        put: (each, content) => ({ ...each, label: Option.some(content) }),
        shownBy: Option.none(),
      },
    ],
  });

/**
 * Check an Inline Choice's response, which the caller decoded, in two tiers.
 *
 * The caller decodes the posted entry with `decode`, under the entry name its form gave the
 * Control and the Inline Choice's binding (one identifier), and passes the value, or the
 * {@link Malformed} `decode` gave. The Placeholder posts `""`, which decodes to NULL. So the entry
 * name stays the caller's, while the messages and the author's override stay here.
 *
 * - A {@link Malformed} input: `atMost` 1 when the response was posted more than once, else
 *   `unknownChoice`.
 * - Tier (a), always: an identifier that names no choice gives `unknownChoice`. Identifiers compare
 *   exactly, so `a` does not name a choice `A`.
 * - Tier (b), only under `validateResponses`: fewer identifiers than needed gives `atLeast` with the
 *   count needed. That count is `min-choices`, raised to 1 when `required` is true; NULL is
 *   accepted when it is 0. A `min-choices` above 1 is validated as written, so then every response
 *   is refused (section 5.74.3).
 *
 * The author's `data-min-selections-message` replaces the renderer's text for `atLeast`.
 *
 * @param interaction The Inline Choice.
 * @param input The decoded value, or why the entries did not decode.
 * @param configuration The configuration, which gives the locale and `validateResponses`.
 * @returns One message per problem, none when the response is accepted.
 */
export const validateInlineChoice = (
  interaction: InlineChoiceInteraction,
  input: Value | Malformed,
  configuration: Configuration,
): readonly ValidationMessage[] => {
  const { locale } = configuration;
  const say = (words: string): ValidationMessage => ({
    response: interaction.response,
    text: words,
  });

  if (input instanceof Malformed) {
    return [
      say(
        input.reason === "single-many"
          ? message(locale, "atMost", { n: numeral(locale, 1n) })
          : message(locale, "unknownChoice"),
      ),
    ];
  }

  const presentedIds = new Set(interaction.choices.map((choice) => choice.identifier));
  const chosen = input.values.map(format);
  const needed = interaction.required && interaction.minChoices < 1n ? 1n : interaction.minChoices;

  return [
    ...(chosen.some((identifier) => !presentedIds.has(identifier))
      ? [say(message(locale, "unknownChoice"))]
      : []),
    ...(configuration.validateResponses && BigInt(chosen.length) < needed
      ? [
          say(
            Option.getOrElse(interaction.messages.min, () =>
              message(locale, "atLeast", { n: numeral(locale, needed) }),
            ),
          ),
        ]
      : []),
  ];
};

/**
 * Read a `qti-inline-choice-interaction`: its binding, its Label, the author's names, messages and
 * `data-prompt`, and its choices, each read as a Choice's is.
 *
 * `min-choices`, `required`, `shuffle` and each choice's `fixed` are read as their XSD types read
 * them, their outer whitespace gone (reading 7): `required=" true "` is true. The body walk has
 * bound it to a single identifier response ({@link binding}).
 *
 * @param source The `qti-inline-choice-interaction` element.
 * @param context What the body walk hands a module: the path, the kit and the declaration.
 * @param context.bound The declaration it is bound to.
 * @param context.path The element's path.
 * @param context.read The kit the element is read with.
 * @returns The Inline Choice.
 */
const parse = (
  source: SourceElement,
  { bound, path, read }: ModuleParseContext,
): Parsed<InlineChoiceInteraction> => {
  read.markElement(source);

  const minChoices = read.countAttribute(source, "min-choices");
  const required = read.xsBoolean(source, "required", false);
  const shuffle = read.xsBoolean(source, "shuffle", false);
  const label = read.content(source, "qti-label");
  const choices: SimpleChoice[] = [];
  for (const choice of read.childrenNamed(source, "qti-inline-choice")) {
    choices.push(simpleChoiceOf(read, choice));
  }

  return {
    ariaLabel: read.valueOf(source, "aria-label"),
    ariaLabelledby: read.valueOf(source, "aria-labelledby"),
    choices,
    class: read.valueOf(source, "class"),
    kind: "inline-choice",
    label,
    messages: { min: read.valueOf(source, "data-min-selections-message") },
    minChoices: Option.getOrElse(minChoices, () => 0n),
    path,
    placeholder: read.valueOf(source, "data-prompt"),
    required,
    response: bound.identifier,
    shuffle,
  } satisfies Parsed<InlineChoiceInteraction>;
};

/**
 * The Inline Choice module (Q-12, the kind `inline-choice`).
 */
export const inlineChoiceModule: InteractionModule<
  "inline-choice",
  InlineChoiceByLevel,
  InlineChoicePayload
> = {
  binding,
  element,
  feature,
  /**
   * The Inline Choice with its Label's and its choices' content emptied.
   */
  hollow: (interaction) => ({
    ...interaction,
    choices: interaction.choices.map((choice) => ({ ...choice, content: [] })),
    label: interaction.label.pipe(Option.map(() => [])),
  }),
  kind: "inline-choice",
  parse,
  /**
   * Copy the Inline Choice into its payload node: its choices in presented order, its Label, the
   * entry name its Control posts under, and the identifier the view shows as chosen, none for NULL.
   */
  redact: (interaction, kit) => ({
    ariaLabel: interaction.ariaLabel,
    ariaLabelledby: interaction.ariaLabelledby,
    choices: presented(interaction, kit.seed).map((choice) => ({
      content: choice.content,
      identifier: choice.identifier,
    })),
    class: interaction.class,
    formName: kit.formName(interaction.response),
    label: interaction.label,
    placeholder: interaction.placeholder,
    response: interaction.response,
    restore: Option.map(Option.fromUndefinedOr(kit.shown(interaction.response)[0]), format),
  }),
  /**
   * The regions of the Inline Choice's own content, in document order: its Label, then each
   * choice's.
   */
  regions: (interaction) => [...labelRegion(interaction), ...simpleChoiceRegions(interaction)],
  validate: validateInlineChoice,
};
