/**
 * The responses an attempt starts from, read from the body {@link redactStructure} gives, so a host
 * learns them without printing the item: {@link shownResponses}, the responses the page's
 * interactions write, and {@link startingResponses}, the state plate's `<Responses>` starts the
 * attempt from (`heldOf` in `#plate/held.ts`), which holds every response the item posts.
 *
 * @module
 */
import { Option } from "effect";
import { absentValueOf, interactionsIn } from "#plate/model/interactions.ts";
import type { Interaction } from "#plate/model/item.ts";
import type { Showing } from "#plate/model/record.ts";
import { nullOf, nullRecord } from "#plate/model/values.ts";
import type { Responses, ResponseValue } from "#plate/model/values.ts";
import { redactStructure } from "#plate/redact/walk.ts";
import type { RedactedFields, ResponseBinding } from "#plate/redact/walk.ts";
import type { Accepted } from "#plate/validate/verdict.ts";

/**
 * Index the interactions of a body by the response each binds, the first in document order, which
 * says how its response starts. It walks the body once, so its time grows with the item, not with
 * its responses times its interactions.
 *
 * @param body The body.
 * @returns The first interaction that binds each response.
 */
const firstBinding = (body: RedactedFields["body"]): ReadonlyMap<string, Interaction> => {
  const first = new Map<string, Interaction>();
  for (const interaction of interactionsIn(body)) {
    if (!first.has(interaction.response)) {
      first.set(interaction.response, interaction);
    }
  }

  return first;
};

/**
 * Give the value a response starts at, as its binding and the first interaction that binds it say:
 * the value the interaction's module gives a response no control wrote (`absentValueOf`), End
 * Attempt's `false`, whatever its default (QTI 3.0.1 information model §5.45: "The default value of
 * the response variable is always ignored"); else the binding's start, its default where the
 * interaction starts at it, a Choice starting empty whatever its default (spec reading
 * `response-default`); else NULL.
 *
 * @param binding The response's binding.
 * @param interaction The first interaction that binds it.
 * @returns The value.
 */
const startOf = (binding: ResponseBinding, interaction: Interaction): ResponseValue =>
  Option.getOrElse(absentValueOf(interaction), (): ResponseValue => {
    if (binding.cardinality === "record") {
      return Option.getOrElse(binding.defaultValue, () => nullRecord);
    }

    return Option.getOrElse(binding.defaultValue, () =>
      nullOf(binding.baseType, binding.cardinality),
    );
  });

/**
 * Give the responses the page an item shows under `showing` writes: each response a shown
 * interaction binds, in the order of the item's `responses`. A declared response that no
 * interaction binds is none: no island writes it, so no post names it, and the database keeps the
 * value it holds in its record, the declared default a session writes when the item is first
 * presented.
 *
 * It reads the body as {@link redactStructure} shows it as `showing` says, the body `redact` gives
 * without its printed text, so the responses it gives are those whose islands the page `redact`
 * gives shows.
 *
 * @param accepted The document `checkAdmitted` accepted.
 * @param showing Whether the page shows feedback, and the record of the attempt it shows, which show
 *   or hide the content an interaction sits in ({@link Showing}).
 * @returns The responses' identifiers; none for an item that asks nothing, as a video and its text.
 */
export const shownResponses = (accepted: Accepted, showing: Showing): readonly string[] => {
  const structure = redactStructure(accepted.item, showing);
  const first = firstBinding(structure.body);

  return structure.responses.flatMap(({ identifier }) =>
    first.has(identifier) ? [identifier] : [],
  );
};

/**
 * Give the responses an attempt starts from, the item shown under `showing`: every response a shown
 * interaction binds ({@link shownResponses}), each at its start ({@link startOf}), so each island
 * shows its response's start and the item posts it until the child changes it; and every End
 * Attempt response of the item, shown or not, at `false`, so a post names each, and the one whose
 * press ended the attempt is `true` (`answerOf` in `#plate/held.ts`). An End Attempt
 * inside hidden feedback or a hidden template block has no island, and its response is false all
 * the same, whatever its default (QTI 3.0.1 information model §5.45: "If response processing is
 * invoked in any other way, either through a different endAttemptInteraction or through the default
 * method for the delivery engine, then the associated response variable is set to 'false'";
 * SPEC-AUDIT SV-RP-01).
 *
 * A host's `<Responses>` starts a fresh attempt from these (`heldOf` in `#plate/held.ts`). A
 * host that holds a save starts from the save's values laid over these, so a default the child
 * cleared stays cleared, and a response the save does not hold starts as here.
 *
 * @param accepted The document `checkAdmitted` accepted.
 * @param showing Whether the page shows feedback, and the record of the attempt it shows.
 * @returns The responses, by identifier.
 */
export const startingResponses = (accepted: Accepted, showing: Showing): Responses => {
  const structure = redactStructure(accepted.item, showing);
  const first = firstBinding(structure.body);
  const shown = structure.responses.flatMap((binding) =>
    Option.match(Option.fromUndefinedOr(first.get(binding.identifier)), {
      onNone: () => [],
      onSome: (interaction) => [[binding.identifier, startOf(binding, interaction)] as const],
    }),
  );
  const ends = interactionsIn(accepted.item.body).flatMap((interaction) =>
    interaction.kind === "end-attempt" && !first.has(interaction.response)
      ? Option.toArray(
          Option.map(absentValueOf(interaction), (value) => [interaction.response, value] as const),
        )
      : [],
  );

  return Object.fromEntries([...ends, ...shown]);
};
