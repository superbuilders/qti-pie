/**
 * The record of kinds: each kind of interaction a specimen draws, keyed by its name, and the
 * dispatch from a description's interaction to the kind that writes it. A kind is one file beside
 * this one and one entry here; the description's `Interaction` union, the `kind` dimension and the
 * lab's listing all derive from this record.
 *
 * @module
 */
import { Array as Arr, Record } from "effect";
import type { Answers } from "#specimen/answer.ts";
import type { Dimension } from "#specimen/dimension.ts";
import type { Arm, Context, Kind, Written } from "#specimen/kind.ts";
import { associate } from "#specimen/kinds/associate.ts";
import { choice } from "#specimen/kinds/choice.ts";
import { endAttempt } from "#specimen/kinds/end-attempt.ts";
import { extendedText } from "#specimen/kinds/extended-text.ts";
import { gapMatch } from "#specimen/kinds/gap-match.ts";
import { graphicAssociate } from "#specimen/kinds/graphic-associate.ts";
import { graphicGapMatch } from "#specimen/kinds/graphic-gap-match.ts";
import { graphicOrder } from "#specimen/kinds/graphic-order.ts";
import { hotspot } from "#specimen/kinds/hotspot.ts";
import { hottext } from "#specimen/kinds/hottext.ts";
import { inlineChoice } from "#specimen/kinds/inline-choice.ts";
import { match } from "#specimen/kinds/match.ts";
import { media } from "#specimen/kinds/media.ts";
import { order } from "#specimen/kinds/order.ts";
import { portableCustom } from "#specimen/kinds/portable-custom.ts";
import { positionObject } from "#specimen/kinds/position-object.ts";
import { selectPoint } from "#specimen/kinds/select-point.ts";
import { slider } from "#specimen/kinds/slider.ts";
import { textEntry } from "#specimen/kinds/text-entry.ts";

/**
 * Every kind, by its name.
 */
const kinds = {
  associate,
  choice,
  "end-attempt": endAttempt,
  "extended-text": extendedText,
  "gap-match": gapMatch,
  "graphic-associate": graphicAssociate,
  "graphic-gap-match": graphicGapMatch,
  "graphic-order": graphicOrder,
  hotspot,
  hottext,
  "inline-choice": inlineChoice,
  match,
  media,
  order,
  "portable-custom": portableCustom,
  "position-object": positionObject,
  "select-point": selectPoint,
  slider,
  "text-entry": textEntry,
};

/**
 * A kind's name.
 */
export type KindName = keyof typeof kinds;

/**
 * The values of a kind's dimensions, by name, distributed over a union of kinds.
 */
type ValuesOf<K extends KindName> = K extends KindName
  ? (typeof kinds)[K] extends Kind<K, infer M, infer _S>
    ? M
    : never
  : never;

/**
 * A kind's settings, distributed over a union of kinds.
 */
type SettingsOf<K extends KindName> = K extends KindName
  ? (typeof kinds)[K] extends Kind<K, infer _M, infer S>
    ? S
    : never
  : never;

/**
 * The record's type: each entry a kind of the name it is keyed by.
 */
type Roster = { readonly [K in KindName]: Kind<K, ValuesOf<K>, SettingsOf<K>> };

/**
 * The record, each entry typed by its own name, so an entry keyed by another kind's name is a type
 * error, and a dispatch on a name reaches the kind of that name.
 */
export const roster: Roster = kinds;

/**
 * A description's interaction: one kind's name and its own settings.
 */
export type Interaction = { readonly [K in KindName]: Arm<K, SettingsOf<K>> }[KindName];

/**
 * The kind of interaction, as a dimension: Choice first, the simplest, then the others by name.
 */
export const kindDimension: Dimension<KindName> = {
  label: "Interaction",
  values: Arr.map(
    Arr.prepend(
      Arr.filter(Record.values(roster), (held) => held.name !== "choice"),
      roster.choice,
    ),
    (held) => ({ label: held.label, name: held.name, value: held.name }),
  ),
};

/**
 * Write an interaction with the kind its name names.
 *
 * @param interaction The interaction.
 * @param context What the item gives it.
 * @returns What the kind writes.
 */
export const written = <K extends KindName>(
  interaction: Arm<K, SettingsOf<K>>,
  context: Context,
): Written => roster[interaction.kind].write(interaction.settings, context);

/**
 * The responses an interaction's settings admit, from the kind its name names.
 *
 * @param interaction The interaction.
 * @returns Every response it admits.
 */
export const answersOf = <K extends KindName>(interaction: Arm<K, SettingsOf<K>>): Answers =>
  roster[interaction.kind].answers(interaction.settings);
