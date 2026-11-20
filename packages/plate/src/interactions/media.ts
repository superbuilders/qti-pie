/**
 * Media (Q-14, the `media` kind): `qti-media-interaction` read into its model node, copied into its
 * payload node, and checked.
 *
 * {@link mediaModule}'s `redact` gives the page the Prompt, the author's own `audio`, `video` or
 * `object` with its `source` and `track` children (captions, descriptions and subtitles stay the
 * author's), `autostart`, `loop`, `min-plays` and `max-plays`, the entry name the count of plays
 * posts under, and the count to restore; the server shell renders it
 * (`#plate/ui/item/interactions/`), and the count it posts is the response.
 *
 * The facts this module keeps to, from the information model and the schema:
 *
 * - The interaction binds a response of base type `integer` and cardinality `single`, the number of
 *   times the media was experienced; any other binding is the notice naming the one it breaks, as
 *   the shipped kinds give one.
 * - `autostart` (required) is the native `autoplay` of the media element, and `loop` the native
 *   `loop`; the interaction's two attributes decide, so a written `autoplay` or `loop` on the
 *   element itself never starts or repeats what the interaction did not ask for.
 * - The XSD spells the element's `controls`, `muted`, `autoplay` and `loop` as `true`, `false` or
 *   their own name, to bridge HTML's boolean attributes into XML, and a browser reads any value of
 *   a boolean attribute as set. So `controls` and `muted` are set only when the author did not
 *   write `false`: a `video` or `audio` written `controls="false"` has no controls, the operator's
 *   settled rule for media. The author's choice stands: when `autostart="true"` and the controls
 *   are gone, nothing pauses the media (WCAG 1.4.2, 2.2.2), which an item's verdict does not mark
 *   and a reviewer should.
 * - `min-plays` and `max-plays` default to 0; `max-plays="0"` is no limit (reading 76), and the
 *   Schematron's least-at-most rule is the database's. "Failure to play the media object the
 *   minimum number of times constitutes an invalid response" (information model 5.92.2), so a count
 *   under `min-plays` is refused in tier (b), under `validateResponses` alone, and NULL, a response
 *   that reports no play, counts as 0 (reading 186). "It must not be possible for the candidate to
 *   play the media object more than max-play times" (5.92.3), so a count over a `max-plays` that is
 *   not 0 is none a candidate can have played, and is refused in tier (a). A negative count is no
 *   number of times, and is refused in tier (a) as malformed, with the message a text that is no
 *   number earns.
 * - A Media never played posts nothing, and its response stays where the attempt started it, at its
 *   default, else NULL, never 0 (reading 203), so the module gives no `absentValue`: only its
 *   validation reads NULL as no play.
 * - `coords`, the deprecated rectangle of an `object`'s place, is read and ignored with a mark, and
 *   so is the deprecated `object` element, written as the author wrote it: a browser cannot report
 *   plays of one, so its count is never posted.
 *
 * The validation messages are English and live here ({@link words}).
 *
 * @module
 * @see https://www.imsglobal.org/spec/qti/v3p0/info#Root_MediaInteraction
 * @see https://www.w3.org/WAI/WCAG22/Understanding/audio-control.html
 */
import { Option } from "effect";
import type { Configuration } from "#plate/configuration.ts";
import type { SourceElement } from "#plate/document/source.ts";
import { Malformed } from "#plate/form/encoding.ts";
import { contentRegion, promptRegion } from "#plate/interactions/contract.ts";
import type {
  ByLevel,
  InteractionModule,
  ModuleInteraction,
  ModuleParseContext,
  OwnRegion,
  Parsed,
  ValidationMessage,
} from "#plate/interactions/contract.ts";
import { malformedMessage } from "#plate/interactions/pattern.ts";
import { counted } from "#plate/messages.ts";
import type { BodyNode, Level, ModelLevel, Nodes, RedactedLevel } from "#plate/model/item.ts";
import { format, trimXmlSpace } from "#plate/model/values.ts";
import type { Value } from "#plate/model/values.ts";

/**
 * Media's identifier in the QTI 3.0 conformance list, Appendix A.
 */
const feature = "Q-14";

/**
 * The QTI element Media is read from, which its notice names.
 */
const element = "qti-media-interaction";

/**
 * The binding Media renders with: the response "must be of base-type integer and single
 * cardinality" (section 5.92).
 */
const binding = { baseTypes: ["integer"], cardinalities: ["single"] } as const;

/**
 * The elements the interaction's one media child may be, which the XSD lists.
 */
const mediaElements: readonly string[] = ["audio", "object", "video"];

/**
 * A `qti-media-interaction` (Q-14, the `media` kind): its Prompt, its one media element, and the
 * plays it asks for, bound to a single `integer` response, the count of plays.
 *
 * @template L The level of its content.
 */
interface MediaInteraction<L extends Level = ModelLevel> extends ModuleInteraction<"media"> {
  /**
   * `autostart`: the media starts as the attempt starts, which the server shell writes as the
   * media element's native `autoplay`.
   */
  readonly autostart: boolean;
  /**
   * The author's `class`, as written, none when absent.
   */
  readonly class: Option.Option<string>;
  /**
   * `loop`, false when absent: the media plays continuously once started, still within
   * `max-plays`.
   */
  readonly loop: boolean;
  /**
   * `max-plays`, 0 when absent: the most plays a response may count; 0 is no limit.
   */
  readonly maxPlays: bigint;
  /**
   * The media element, `audio`, `video` or the deprecated `object`, as the body walk read it, with
   * its `source` and `track` children; none when the interaction held none.
   */
  readonly media: Nodes<L>;
  /**
   * `min-plays`, 0 when absent: the fewest plays a valid response counts.
   */
  readonly minPlays: bigint;
  readonly prompt: Option.Option<Nodes<L>>;
}

/**
 * A Media's model node at each level.
 */
interface MediaByLevel extends ByLevel {
  readonly node: MediaInteraction<this["level"]>;
}

/**
 * A Media (Q-14, the `media` kind) as the page may know it: its Prompt and media element copied
 * through the payload, the limits on its plays, the name its count posts under, and the count to
 * restore. It holds no correct response.
 */
interface MediaPayload {
  readonly ariaLabel: Option.Option<string>;
  readonly ariaLabelledby: Option.Option<string>;
  readonly autostart: boolean;
  /**
   * The author's `class`, as written, none when absent.
   */
  readonly class: Option.Option<string>;
  /**
   * The name its count posts under: the view's name for the response, else
   * `entryName(instance, response)`.
   */
  readonly formName: string;
  readonly loop: boolean;
  /**
   * `max-plays`, written or defaulted (0 is no limit).
   */
  readonly maxPlays: bigint;
  readonly media: Nodes<RedactedLevel>;
  /**
   * `min-plays`, written or defaulted.
   */
  readonly minPlays: bigint;
  readonly prompt: Option.Option<Nodes<RedactedLevel>>;
  /**
   * The identifier of the response it binds.
   */
  readonly response: string;
  /**
   * The count the plays continue from, as decimal digits: the value the view shows; none when that
   * is no count.
   */
  readonly restore: Option.Option<string>;
}

/**
 * Pick the count the plays continue from: the first of the candidates that is a count, as decimal
 * digits, written back without leading zeros.
 *
 * @param candidates The strings the view gives, in order: the values it shows.
 * @returns The count, none when no candidate is one.
 */
const countOf = (candidates: readonly string[]): Option.Option<string> =>
  Option.fromUndefinedOr(
    candidates.map(trimXmlSpace).find((candidate) => /^[0-9]+$/u.test(candidate)),
  ).pipe(Option.map((digits) => String(BigInt(digits))));

/**
 * Read a `qti-media-interaction` into its model node, through the kit.
 *
 * The body walk has bound it to a single `integer` response ({@link binding}). The Prompt and the
 * media element are read by the body walk. The features it reads and does not render are recorded
 * as marks: `coords` on the interaction, and `object` for the deprecated element, whose plays a
 * browser cannot report.
 *
 * @param source The interaction's source element.
 * @param context The element's path, the reader kit and the declaration it is bound to.
 * @returns The model node.
 */
const parse = (source: SourceElement, context: ModuleParseContext): Parsed<MediaInteraction> => {
  const { bound, read } = context;
  const response = bound.identifier;

  read.markElement(source);

  if (Option.isSome(read.valueOf(source, "coords"))) {
    read.mark(source, "coords");
  }

  const autostart = read.xsBoolean(source, "autostart", false);
  const loop = read.xsBoolean(source, "loop", false);
  const maxPlays = read.countAttribute(source, "max-plays");
  const minPlays = read.countAttribute(source, "min-plays");
  const prompt = read.content(source, "qti-prompt");
  const child = read
    .elementsOf(source)
    .find((candidate) => mediaElements.some((tag) => read.isQti(candidate, tag)));

  if (child?.local === "object") {
    read.mark(child, "object");
  }

  return {
    ariaLabel: read.valueOf(source, "aria-label"),
    ariaLabelledby: read.valueOf(source, "aria-labelledby"),
    autostart,
    class: read.valueOf(source, "class"),
    kind: "media",
    loop,
    maxPlays: Option.getOrElse(maxPlays, () => 0n),
    media: child === undefined ? [] : read.nodes(source, { children: [child] }),
    minPlays: Option.getOrElse(minPlays, () => 0n),
    path: context.path,
    prompt,
    response,
  };
};

/**
 * Read the count a decoded value holds, for validation alone: its one integer, NULL as 0 plays,
 * since a response that reports no play reports none (reading 186). The response itself stays NULL
 * (reading 203).
 *
 * @param value The decoded response.
 * @returns The count.
 */
const playsOf = (value: Value): bigint => {
  const [single] = value.values;

  return single?.baseType === "integer" ? single.value : 0n;
};

/**
 * Check a Media's response, which the caller decoded, in two tiers.
 *
 * The caller decodes the posted entry with `decode`, under the entry name its form gave the count
 * and the Media's binding (a single `integer`), and passes the value, or the {@link Malformed}
 * `decode` gave; the entry name stays the caller's, while the messages stay here.
 *
 * - Tier (a), always, malformed by {@link malformedMessage}: a {@link Malformed} input by its reason
 *   (`malformedNumber` for text that is no number, `malformedSingleMany` for a second entry), and a
 *   negative count, which `decode` reads as the integer it is but which is no number of plays; it
 *   earns the `number` message.
 * - Tier (a), always: a count above `max-plays` when that is not 0, since "it must not be possible
 *   for the candidate to play the media object more than max-play times" (5.92.3).
 * - Tier (b), only under `validateResponses`: a count below `min-plays`, NULL counting as 0, since
 *   "failure to play the media object the minimum number of times constitutes an invalid response"
 *   (5.92.2).
 *
 * @param interaction The Media.
 * @param input The decoded value, or why the entry did not decode.
 * @param configuration The configuration, which gives the locale and `validateResponses`.
 * @returns One message per problem, none when the response is accepted.
 */
const validate = (
  interaction: MediaInteraction,
  input: Value | Malformed,
  configuration: Configuration,
): readonly ValidationMessage[] => {
  const { locale, validateResponses } = configuration;
  const problem = (text: string): ValidationMessage => ({ response: interaction.response, text });
  const malformed = (reason: Malformed["reason"]): ValidationMessage =>
    problem(
      malformedMessage({ baseType: "integer", patternMaskMessage: Option.none() }, reason, locale),
    );

  if (input instanceof Malformed) {
    return [malformed(input.reason)];
  }

  const plays = playsOf(input);

  if (plays < 0n) {
    return [malformed("number")];
  }

  return [
    ...(interaction.maxPlays > 0n && plays > interaction.maxPlays
      ? [
          problem(
            counted(locale, interaction.maxPlays, {
              many: "mediaCheckAtMost",
              one: "mediaCheckAtMostOnce",
            }),
          ),
        ]
      : []),
    ...(validateResponses && plays < interaction.minPlays
      ? [
          problem(
            counted(locale, interaction.minPlays, {
              many: "mediaCheckAtLeast",
              one: "mediaCheckAtLeastOnce",
            }),
          ),
        ]
      : []),
  ];
};

/**
 * The regions of a Media's own content, in document order: its Prompt, when it has one, then the
 * media element, with its `source` and `track` children and its fallback content.
 *
 * @template L The level of its content.
 * @param interaction The model node.
 * @returns The regions, without their owner.
 */
const ownRegions = <L extends Level>(
  interaction: MediaInteraction<L>,
): readonly OwnRegion<MediaInteraction<L>, BodyNode<L>>[] => [
  ...promptRegion(interaction),
  contentRegion<MediaInteraction<L>, BodyNode<L>>(interaction.media, (each, media) => ({
    ...each,
    media,
  })),
];

/**
 * The Media module (Q-14, the `media` kind): `qti-media-interaction` parsed, copied into its
 * payload node, and checked; the server shell renders the payload node.
 */
export const mediaModule: InteractionModule<"media", MediaByLevel, MediaPayload> = {
  binding,
  element,
  feature,
  /**
   * The Media with its Prompt's and its media element's content emptied.
   */
  hollow: (interaction) => ({
    ...interaction,
    media: [],
    prompt: interaction.prompt.pipe(Option.map(() => [])),
  }),
  kind: "media",
  parse,
  /**
   * Copy the Media into its payload node: its content through the kit, and the count the view
   * shows.
   */
  redact: (interaction, kit) => ({
    ariaLabel: interaction.ariaLabel,
    ariaLabelledby: interaction.ariaLabelledby,
    autostart: interaction.autostart,
    class: interaction.class,
    formName: kit.formName(interaction.response),
    loop: interaction.loop,
    maxPlays: interaction.maxPlays,
    media: interaction.media,
    minPlays: interaction.minPlays,
    prompt: interaction.prompt,
    response: interaction.response,
    restore: countOf(kit.shown(interaction.response).map(format)),
  }),
  /**
   * The regions of the node's own content, in document order: its Prompt, then the media element.
   */
  regions: ownRegions,
  validate,
};
