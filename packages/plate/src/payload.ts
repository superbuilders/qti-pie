/**
 * The payload: the facts of one render the server shell renders each interaction with, which the
 * redacted model node does not hold.
 *
 * {@link interactionPayload} pairs an interaction of a redacted body (`#plate/redact/walk.ts`)
 * with its payload node ({@link Paired}), its facts from the author's {@link View}: its presented
 * order, the declaration of the response it writes and the values it shows, and what its module
 * bakes in of the host's facts.
 * The payload node names every field it keeps and never
 * spreads a model object, so a field the model gains reaches the page only when this file names
 * it. It holds no correct response, mapping, default, processing rule, seed or template value: the
 * view's seed only orders a shuffled Choice's or Inline Choice's choices, and a value it shows is
 * one the view gave. A `solution` render shows correct responses only when the author passes them
 * as the view's values; nothing here reads them from the item, and the server shell marks a
 * `review`'s answers against the solution the author passes it.
 *
 * @module
 */
import type { ModuleKind, RedactKit } from "#plate/interactions/contract.ts";
import { modulePayload, payloadAt } from "#plate/model/interactions.ts";
import type { ModelOf, PayloadOf } from "#plate/model/interactions.ts";
import type { Interaction, RedactedLevel } from "#plate/model/item.ts";
import { recordText } from "#plate/model/values.ts";
import { isRecordValue } from "#plate/model/record-value.ts";
import type { ResponseValue, Single } from "#plate/model/values.ts";
import type { HostFacts } from "#plate/pci/host.ts";

/**
 * The state a render shows an item in, which `<Item>`'s root names in `data-mode`.
 *
 * `answering` lets the candidate change each response. `review` and `solution` show the values the
 * author passes and let the candidate change none: `review` shows a recorded attempt, and
 * `solution` the correct responses, which reach the page only as the author's values.
 */
export type RenderMode = "answering" | "review" | "solution";

/**
 * The author's inputs to one render: the instance, the seed, the values to show and the host's
 * facts.
 *
 * The library decides no flow, so every field is the author's: each map is keyed by response
 * identifier, and a response it omits takes the default the field names.
 */
export interface View {
  /**
   * The host's facts, which reach each interaction module's `redact` through its kit
   * (`RedactKit.host`) and nothing else: the empty record for a host that names none. A render
   * input, never item data: the payload holds no field of it.
   */
  readonly host: HostFacts;
  /**
   * The item instance key, which scopes every id and names the entry its End Attempts post in.
   */
  readonly instance: string;
  /**
   * The configuration's `seed`, a string written as given, which keys a shuffled interaction's
   * order with the response.
   */
  readonly seed: string;
  /**
   * The value each response's controls show, such as its `defaultValue` or a value the author's
   * flow recorded; NULL when absent. A record shows its `stringValue`, the text it was typed as,
   * and a record without one shows an empty control.
   */
  readonly values: ReadonlyMap<string, ResponseValue>;
}

/**
 * One interaction of a redacted body paired with its payload node, both of one kind: the redacted
 * model node the shell's walk met, and the node its module's `redact` gave for it. The pair is
 * minted in one place (`payloadAt` in `#plate/model/interactions.ts`), which holds both at the
 * kind, so the server shell hands each kind's seam its own model and payload with no check that
 * they agree. The model node carries the author's `data-*` on the interaction's root
 * (`ModuleInteraction.data` in `#plate/interactions/contract.ts`), which no module's `redact`
 * sees.
 *
 * @template K The kind.
 */
export interface Paired<K extends ModuleKind> {
  readonly kind: K;
  readonly model: ModelOf<K, RedactedLevel>;
  readonly payload: PayloadOf<K>;
}

/**
 * Any interaction of a redacted body paired with its payload node ({@link Paired}), one member per
 * kind a module parses: a module that lands types its own through its `redact`, so this union
 * needs no line for it. The server shell renders it (`#plate/ui/item/interactions/index.tsx`).
 */
export type PairedInteraction = { readonly [K in ModuleKind]: Paired<K> }[ModuleKind];

/**
 * Give the values the view shows for a response.
 *
 * A record shows its `stringValue` field ({@link recordText}), the text it was typed as, in the
 * string control a text interaction binds to it, so the text the candidate typed comes back as
 * typed. A record without that field, such as the NULL record or a correct response that declares
 * none, leaves the control empty. Restored text counts toward the output budget as any other.
 *
 * @param view The view.
 * @param response The response identifier.
 * @returns Its values, a record's `stringValue` alone; none when it is NULL, a record without a
 *   `stringValue`, or the view gives none.
 */
const shown = (view: View, response: string): readonly Single[] => {
  const value = view.values.get(response);
  if (value === undefined) {
    return [];
  }

  return isRecordValue(value) ? recordText(value) : value.values;
};

/**
 * Give the kit a module's `redact` reads one render's view through: the view's facts about the
 * interaction ({@link shown}, the name its controls post under, the seed and the instance), and the
 * host's facts whole, so a module bakes into its payload node what it shows and what only its host
 * knows, and no hub names its kind.
 *
 * @param view The author's inputs: the instance, the seed, the values and the host's facts.
 * @returns The kit.
 */
const kitOf = (view: View): RedactKit => ({
  host: view.host,
  instance: view.instance,
  seed: view.seed,
  shown: (response) => shown(view, response),
});

/**
 * Pair one interaction of a redacted body with its payload node: the facts of one render the
 * server shell renders the interaction with, which the redacted model node does not hold, as its
 * module's `redact` reads them of the view and the host's facts through its kit: a Choice's and an
 * Inline Choice's choices in presented order (`choiceOrder` in `#plate/interactions/choice.ts`),
 * and the values the view shows.
 *
 * @param interaction The interaction, as the redacted body holds it.
 * @param view The author's inputs: the instance, the seed, the values and the host's facts.
 * @returns The interaction and its payload node. The payload node holds no correct response,
 *   mapping, default, processing rule, seed or template value; the seed only orders a shuffled
 *   interaction's choices, and a value it shows is one the view gave. It holds of the host's facts
 *   only what the module bakes in.
 */
export const interactionPayload = (
  interaction: Interaction<RedactedLevel>,
  view: View,
): PairedInteraction => modulePayload(interaction, kitOf(view));

/**
 * Pair one interaction of a kind the caller holds with its payload node, as
 * {@link interactionPayload} does, at the kind: what a module's container reads of the
 * interactions it holds, which it found by their kind.
 *
 * @template K The kind.
 * @param kind The kind.
 * @param interaction The interaction, as the redacted body holds it.
 * @param view The author's inputs.
 * @returns The interaction and its payload node, at its kind.
 */
export const pairedAt = <K extends ModuleKind>(
  kind: K,
  interaction: ModelOf<K, RedactedLevel>,
  view: View,
): Paired<K> => payloadAt(kind, interaction, kitOf(view));
