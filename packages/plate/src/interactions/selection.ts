/**
 * What an interaction that selects among presented choices says of a response: Choice, Hotspot and
 * Hot Text check their picks with {@link validatePicks}, and Match and Gap Match, which pair
 * choices, say their counts and their malformed posts through {@link selectionWords}.
 *
 * @module
 */
import { Option } from "effect";
import type { Configuration } from "#plate/configuration.ts";
import { Malformed } from "#plate/form/encoding.ts";
import type { ValidationMessage } from "#plate/interactions/contract.ts";
import { message, numeral } from "#plate/messages.ts";
import type { Locale } from "#plate/messages.ts";
import { format } from "#plate/model/values.ts";
import type { Value } from "#plate/model/values.ts";

/**
 * An interaction that selects: the response it binds, and the author's replacements for the
 * too-many and too-few messages, `data-max-selections-message` and `data-min-selections-message`.
 */
interface Selecting {
  readonly messages: { readonly max: Option.Option<string>; readonly min: Option.Option<string> };
  readonly response: string;
}

/**
 * The messages a selecting interaction gives, each about its response.
 */
interface SelectionWords {
  /**
   * The message for entries that did not decode: `atMost` 1 when a single response was posted
   * more than once, else `unknownChoice`.
   */
  readonly malformed: (input: Malformed) => ValidationMessage;
  readonly say: (words: string) => ValidationMessage;
  /**
   * `atLeast` `n`, or the author's `data-min-selections-message`.
   */
  readonly tooFew: (n: bigint) => ValidationMessage;
  /**
   * `atMost` `n`, or the author's `data-max-selections-message`.
   */
  readonly tooMany: (n: bigint) => ValidationMessage;
  /**
   * `unknownChoice`: an identifier the interaction does not present, or one given twice.
   */
  readonly unknown: ValidationMessage;
}

/**
 * Give the messages a selecting interaction says about its response, in a locale: the author's
 * texts in place of plate's for too many and too few.
 *
 * @param interaction The interaction.
 * @param locale The locale of plate's own text.
 * @returns The messages.
 */
export const selectionWords = (interaction: Selecting, locale: Locale): SelectionWords => {
  const say = (words: string): ValidationMessage => ({
    response: interaction.response,
    text: words,
  });
  const tooMany = (n: bigint): ValidationMessage =>
    say(
      Option.getOrElse(interaction.messages.max, () =>
        message(locale, "atMost", { n: numeral(locale, n) }),
      ),
    );
  const unknown = say(message(locale, "unknownChoice"));

  return {
    malformed: (input) => (input.reason === "single-many" ? tooMany(1n) : unknown),
    say,
    tooFew: (n) =>
      say(
        Option.getOrElse(interaction.messages.min, () =>
          message(locale, "atLeast", { n: numeral(locale, n) }),
        ),
      ),
    tooMany,
    unknown,
  };
};

/**
 * Check the identifiers a Choice, a Hotspot or a Hot Text response picks, in two tiers.
 *
 * - A {@link Malformed} input: `atMost` 1 when a single response was posted more than once, else
 *   `unknownChoice`.
 * - Tier (a), always: every identifier names a presented choice and none repeats (`unknownChoice`),
 *   and `max-choices` above 0 caps the count whatever `validateResponses` says (`atMost`).
 * - Tier (b), only under `validateResponses`: `min-choices` (`atLeast`).
 *
 * @param interaction The interaction: its response, `max-choices`, `min-choices` and the author's
 *   messages.
 * @param presented The identifiers it presents.
 * @param input The decoded value, or why the entries did not decode.
 * @param configuration The configuration, which gives the locale and `validateResponses`.
 * @returns One message per problem, none when the response is accepted.
 */
export const validatePicks = (
  interaction: Selecting & { readonly maxChoices: bigint; readonly minChoices: bigint },
  presented: ReadonlySet<string>,
  input: Value | Malformed,
  configuration: Pick<Configuration, "locale" | "validateResponses">,
): readonly ValidationMessage[] => {
  const words = selectionWords(interaction, configuration.locale);

  if (input instanceof Malformed) {
    return [words.malformed(input)];
  }

  const chosen = input.values.map(format);
  const stray = chosen.some((identifier) => !presented.has(identifier));
  const repeated = new Set(chosen).size < chosen.length;

  return [
    ...(stray || repeated ? [words.unknown] : []),
    ...(interaction.maxChoices > 0n && BigInt(chosen.length) > interaction.maxChoices
      ? [words.tooMany(interaction.maxChoices)]
      : []),
    ...(configuration.validateResponses && BigInt(chosen.length) < interaction.minChoices
      ? [words.tooFew(interaction.minChoices)]
      : []),
  ];
};
