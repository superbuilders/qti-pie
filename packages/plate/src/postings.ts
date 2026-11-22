/**
 * How each response of an item travels through a host's form: {@link postings} gives each one an
 * interaction on the page binds its binding, the options `decode` reads its entries with and the
 * entries it starts at, read from the body {@link redactStructure} gives, so a host learns them
 * without printing the item.
 *
 * @module
 */
import { Array as Arr, Option } from "effect";
import { encode, entryName, isPosted } from "#plate/form/encoding.ts";
import type { Binding, DecodeOptions, Entry } from "#plate/form/encoding.ts";
import { absentValueOf, interactionsIn } from "#plate/model/interactions.ts";
import type { Interaction } from "#plate/model/item.ts";
import type { RedactRecord } from "#plate/model/record.ts";
import type { ResponseValue, Value } from "#plate/model/values.ts";
import { redactStructure } from "#plate/redact/walk.ts";
import type { RedactedFields, ResponseBinding } from "#plate/redact/walk.ts";
import type { Accepted } from "#plate/validate/verdict.ts";

/**
 * How one response travels through a host's form: its identifier, its binding, and the options
 * `decode` reads its entries with.
 *
 * The binding's `name` is the entry name the page gives the response's Controls,
 * `entryName(instance, identifier)`.
 *
 * A response of any posted base type posts one entry per value under that name: a `point` its two
 * coordinates separated by a space, x then y, as a pair posts its two identifiers. A `boolean`
 * response posts one entry whose value is `true` or `false`; an absent entry is no
 * response, NULL, unless the module of an interaction that binds the response says otherwise
 * through its `absentValue` (`InteractionModule` in `#plate/interactions/contract.ts`), which the
 * posting carries as `options.absent` and `decode` gives for no entry: End Attempt's `false`.
 */
export interface Posting {
  readonly binding: Binding;
  readonly identifier: string;
  /**
   * The number base its integer is written in, `base`: the `base` of the first Text Entry or
   * Extended Text, in document order, that binds a response of a base type; no `base` when none
   * binds it, or the response is a record, which `decode` reads without one, so an integer reads
   * in base 10. And the value no entry decodes to, `absent`, when the first interaction in
   * document order that binds the response and whose module gives one (`absentValueOf` in
   * `#plate/model/interactions.ts`) says so; no `absent` when none does, so no entry is NULL.
   */
  readonly options: DecodeOptions;
  /**
   * The entries the response posts as its attempt starts: the value it starts at, the binding's
   * `defaultValue` (`bindingsShown` in `#plate/redact/walk.ts`), as `encode` posts it under the
   * binding with `options`, an integer in a Text Entry's `base`, so `decode` reads it back; none
   * where it starts at NULL, or where the interaction that binds it starts empty (a Choice, an End
   * Attempt), whatever its default (spec reading 183).
   *
   * A host's `<Responses>` (`@qti-pie/plate/ui/client`) starts a fresh attempt from every
   * posting's `start`, so each island shows its response's default and the form posts it until the
   * candidate changes it. Restored entries win: a host that holds a saved selection, or a record's
   * values, starts from those alone, whole, and reads no `start`, so a default the candidate
   * cleared stays cleared.
   */
  readonly start: readonly Entry[];
}

/**
 * Give the binding a response travels through the form under: a `RecordBinding` for a record
 * response, a `ValueBinding` for a response of a base type an interaction posts (`isPosted`: the
 * identifier, string, integer and float of Choice, Inline Choice and the text controls, the `pair`
 * and `directedPair` of the
 * interactions that put identifiers into targets, the `point` of those that place a point on an
 * image, and End Attempt's `boolean`), and none for a response of any other base type, which no
 * Control posts.
 *
 * @param response The response's binding as the page knows it.
 * @param name The entry name its Controls post under.
 * @returns Its form binding, or none.
 */
const formBinding = (response: ResponseBinding, name: string): Option.Option<Binding> => {
  if (response.cardinality === "record") {
    return Option.some({ cardinality: "record", name });
  }

  const { baseType, cardinality } = response;

  return isPosted(baseType) ? Option.some({ baseType, cardinality, name }) : Option.none();
};

/**
 * Give the number base an interaction's posted text is read in: a Text Entry's or an Extended
 * Text's `base`, and none for any other kind, whose integers, if it posts any, are written in base
 * 10.
 *
 * @param interaction The interaction.
 * @returns Its base, or none.
 */
const baseOf = (interaction: Interaction): Option.Option<number> =>
  interaction.kind === "extended-text" || interaction.kind === "text-entry"
    ? Option.some(interaction.base)
    : Option.none();

/**
 * Tell whether an interaction reads its response's text of XML white space alone as NULL, as
 * QTI's `TextFormatEnum` reads `plain` and `preformatted` text (QTI 3.0.1 information model,
 * info:85968, `plain`: "Delivery engines should preserve white-space characters in candidate input
 * except where a response consists only of white-space characters, in which case it should be
 * treated as an empty string (NULL)"): a Text Entry, whose text is plain, and an Extended Text of
 * either format (SPEC-AUDIT SV-DESIGN-05). An Extended Text's island posts nothing for such text,
 * so `decode` reads a direct post of it the same way.
 *
 * @param interaction The first interaction that binds the response.
 * @returns Whether the response's blank text is NULL.
 */
const blankIsEmptyOf = (interaction: Interaction): boolean =>
  interaction.kind === "text-entry" ||
  (interaction.kind === "extended-text" && interaction.format !== "xhtml");

/**
 * Give the postings of a body and its response bindings in one instance, as {@link postings} gives
 * an accepted item's: plate's own, so a caller that holds a `RedactedStructure` or a bare
 * item learns which responses a page posts without printing the item. `src/index.ts` does not
 * export it.
 *
 * @param redaction The body and the response bindings, of a `Redacted` or a `RedactedStructure`.
 * @param instance The instance token the render used.
 * @returns The postings, as `postings` gives them.
 */
export const postingsIn = (
  redaction: Pick<RedactedFields, "body" | "responses">,
  instance: string,
): readonly Posting[] => {
  const byResponse = new Map<string, Interaction[]>();
  for (const interaction of interactionsIn(redaction.body)) {
    const others = byResponse.get(interaction.response);
    if (others === undefined) {
      byResponse.set(interaction.response, [interaction]);
    } else {
      others.push(interaction);
    }
  }

  return redaction.responses.flatMap((response): readonly Posting[] => {
    const { identifier } = response;
    const bound = byResponse.get(identifier) ?? [];
    const name = entryName(instance, identifier);
    const binding = formBinding(response, name);
    if (Option.isNone(binding) || bound.length === 0) {
      return [];
    }

    const base: Option.Option<number> =
      binding.value.cardinality === "record" ? Option.none() : Arr.findFirst(bound, baseOf);
    const reading: DecodeOptions = {
      ...Option.match(Arr.findFirst(bound, absentValueOf), {
        onNone: () => ({}),
        onSome: (absent) => ({ absent }),
      }),
      ...Option.match(base, { onNone: () => ({}), onSome: (written) => ({ base: written }) }),
    };
    const options: DecodeOptions = Option.exists(Arr.head(bound), blankIsEmptyOf)
      ? { ...reading, blankIsEmpty: true }
      : reading;
    const starting: Option.Option<ResponseValue> = response.defaultValue;
    const start = Option.match(starting, {
      onNone: () => [],
      onSome: (value) => encode(value, binding.value, options),
    });

    return [{ binding: binding.value, identifier, options, start }];
  });
};

/**
 * Give the postings of an accepted item in one instance: one for each record response, and each
 * response of a posted base type, that an interaction of the body the page is shown binds, in the
 * order of the item's `responses`, so a host decodes each from its form with the base its
 * interaction declares instead of assuming base 10. A record response's binding is a
 * `RecordBinding`, which `decode` reads as a record.
 *
 * A declared response that no interaction binds has no posting. The form has no Control for it,
 * so a post never carries it, and decoding it would give NULL. A host that saved that NULL would
 * replace the value the response holds in its record, the declared default a test session writes
 * when the item is first presented, and processing would read NULL instead.
 *
 * It reads the body as {@link redactStructure} shows it under the record, the body `redact` gives
 * without its printed text, so the responses it gives are those the page `redact` gives posts, and
 * it formats no printed variable or parameter to learn them. It walks that body once and indexes
 * its interactions by the response each binds, keeping document order, so its time grows with the
 * item, not with its responses times its interactions.
 *
 * @example
 *   const values = postings(accepted, instance).map(({ binding, options }) =>
 *     decode(entries, binding, options),
 *   );
 *
 * @param accepted The document `checkAdmitted` accepted.
 * @param instance The instance token the render used, one `checkInstance` passes.
 * @param record The record of the attempt the page shows, as `redact` takes it, whose template
 *   values and outcome values show or hide the content an interaction sits in; none to read the
 *   item as it reads with no record.
 * @returns The postings: a response no interaction binds, or of a base type no interaction posts
 *   (`isPosted`), has none. A pair response's values decode one per posted entry, as the pair's
 *   two identifiers separated by a space, and so do a point response's, as its two coordinates,
 *   and a boolean response's from the one entry holding `true` or `false` ({@link Posting}).
 */
export const postings = (
  accepted: Accepted,
  instance: string,
  record?: RedactRecord,
): readonly Posting[] => postingsIn(redactStructure(accepted.item, record), instance);

/**
 * The responses an item's End Attempt interactions bind that no posting carries, each with the
 * value its module gives a submission without its entry, `false`: an End Attempt the page does not
 * show, inside hidden feedback or a hidden template block, posts no entry, and its response is
 * false all the same, whatever its default (QTI 3.0.1 information model §5.45, info:23377: "If
 * response processing is invoked in any other way, either through a different endAttemptInteraction
 * or through the default method for the delivery engine, then the associated response variable is
 * set to 'false'. The default value of the response variable is always ignored."; SPEC-AUDIT
 * SV-RP-01). A host adds them to what `decode` reads from the posted entries; an End Attempt the
 * page shows has its posting, whose `absent` gives the same false.
 *
 * @param accepted The accepted item.
 * @param instance The instance token the render used.
 * @param record The record of the attempt the page shows, as {@link postings} takes it, whose
 *   values show or hide the content an End Attempt sits in; none to read the item as it reads with
 *   no record.
 * @returns Each unposted End Attempt's response and its value, in document order, each once.
 */
export const unpostedEndAttempts = (
  accepted: Accepted,
  instance: string,
  record?: RedactRecord,
): readonly (readonly [string, Value])[] => {
  const posted = new Set(postings(accepted, instance, record).map(({ identifier }) => identifier));
  const unposted = new Map<string, Value>();
  for (const interaction of interactionsIn(accepted.item.body)) {
    if (
      interaction.kind === "end-attempt" &&
      !posted.has(interaction.response) &&
      !unposted.has(interaction.response)
    ) {
      Option.map(absentValueOf(interaction), (value) => unposted.set(interaction.response, value));
    }
  }

  return [...unposted];
};
