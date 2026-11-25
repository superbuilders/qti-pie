/**
 * The renderer's own text: the catalog of every message plate writes into an item in a locale, by
 * key, and the functions that write one ({@link message}, {@link messageText}) and the numbers in it
 * ({@link numeral}). The texts live in one area per file under `#plate/messages/`; this module
 * composes them and checks that no two areas share a key.
 *
 * @module
 */
import { regex } from "arkregex";
import { associateMessages } from "#plate/messages/associate.ts";
import { contentMessages } from "#plate/messages/content.ts";
import { coreMessages } from "#plate/messages/core.ts";
import { endAttemptMessages } from "#plate/messages/end-attempt.ts";
import { graphicMessages } from "#plate/messages/graphic.ts";
import { hotspotMessages } from "#plate/messages/hotspot.ts";
import { mediaMessages } from "#plate/messages/media.ts";
import { pairsMessages } from "#plate/messages/pairs.ts";
import { portableCustomMessages } from "#plate/messages/portable-custom.ts";
import { positionObjectMessages } from "#plate/messages/position-object.ts";
import { readAloudMessages } from "#plate/messages/read-aloud.ts";
import { selectPointMessages } from "#plate/messages/select-point.ts";
import { sliderMessages } from "#plate/messages/slider.ts";
import { textEntryMessages } from "#plate/messages/text-entry.ts";

/**
 * The locales the renderer writes its own text in.
 *
 * The configuration's `locale` admits exactly these, so every locale a host can pick has a catalog.
 */
export const locales = ["en"] as const;

/**
 * A locale the renderer writes its own text in.
 */
export type Locale = (typeof locales)[number];

/**
 * The keys of each member of a union of objects, together: a key any one of them has.
 *
 * @template T The union.
 */
type KeysOfEach<T> = T extends unknown ? keyof T : never;

/**
 * The keys two or more of a list of catalog areas share: `never` while every key has one area.
 *
 * @template List The areas.
 */
type SharedKeys<List extends readonly object[]> = List extends readonly [
  infer First,
  ...infer Rest extends readonly object[],
]
  ? (keyof First & KeysOfEach<Rest[number]>) | SharedKeys<Rest>
  : never;

/**
 * The catalog's areas, in the order {@link en} spreads them.
 */
type Areas = [
  typeof coreMessages,
  typeof associateMessages,
  typeof contentMessages,
  typeof endAttemptMessages,
  typeof graphicMessages,
  typeof hotspotMessages,
  typeof mediaMessages,
  typeof pairsMessages,
  typeof portableCustomMessages,
  typeof positionObjectMessages,
  typeof readAloudMessages,
  typeof selectPointMessages,
  typeof sliderMessages,
  typeof textEntryMessages,
];

/**
 * The English catalog: the strings plate writes into an item, keyed by the role each plays,
 * composed of one area per file under `#plate/messages/`: the core area (`core.ts`, which says what
 * each of its keys is for), one per interaction kind with texts beyond the core's, and one each for
 * the content views, the graphic interactions' image stage and the placement primitive's pair
 * boards, so the texts of each kind live in an area of its own.
 *
 * The interactions' islands take the texts they say as labels (`#plate/ui/<kind>/labels.ts`), which
 * the server reads from here with their placeholders unfilled ({@link messageText}), for an island
 * to fill with what only it knows, the visible text of a chip a child just placed.
 *
 * A key two areas share would be one text silently spread over the other, so the catalog is checked
 * against {@link SharedKeys} of its {@link Areas}: a shared key fails to compile here, naming it.
 * This catalog is the source of the keys and of each key's placeholders; any other locale's catalog
 * has the same keys and placeholders.
 */
const en = {
  ...coreMessages,
  ...associateMessages,
  ...contentMessages,
  ...endAttemptMessages,
  ...graphicMessages,
  ...hotspotMessages,
  ...mediaMessages,
  ...pairsMessages,
  ...portableCustomMessages,
  ...positionObjectMessages,
  ...readAloudMessages,
  ...selectPointMessages,
  ...sliderMessages,
  ...textEntryMessages,
} as const satisfies Readonly<Record<SharedKeys<Areas>, never>>;

/**
 * The key of a string the renderer writes.
 */
export type MessageKey = keyof typeof en;

/**
 * The names of the `{name}` placeholders in a catalog text, as a union, or `never` when it has
 * none.
 */
type Placeholders<Text extends string> = Text extends `${string}{${infer Name}}${infer Rest}`
  ? Name | Placeholders<Rest>
  : never;

/**
 * The values {@link message} fills a key's placeholders with, one per placeholder.
 *
 * Each value is text as the candidate reads it: a number arrives already formatted for the locale,
 * `notice`'s `feature` is the feature key in QTI's own spelling (an element name, `pattern-mask`,
 * `cardinality="record"`), and `markMissedAnswer`'s `answer` is the right answer as its control
 * shows one.
 */
type MessageParams<Key extends MessageKey> = Readonly<
  Record<Placeholders<(typeof en)[Key]>, string>
>;

/**
 * The arguments {@link message} takes after the key: the params, required exactly when the key's
 * text has a placeholder, so no `{name}` reaches the page unfilled.
 */
type MessageArguments<Key extends MessageKey> = [Placeholders<(typeof en)[Key]>] extends [never]
  ? [params?: MessageParams<Key>]
  : [params: MessageParams<Key>];

/**
 * The text of every key in each locale.
 */
const catalogs: Readonly<Record<Locale, Readonly<Record<MessageKey, string>>>> = { en };

/**
 * A `{name}` placeholder in a catalog text; its one group is the name.
 */
const placeholder = regex("\\{(?<name>[A-Za-z]+)\\}", "gu");

/**
 * The number format of every locale, built once: a format is a constant of its locale, and
 * building one is far dearer than formatting with it.
 */
const numberFormats: Readonly<Record<Locale, Intl.NumberFormat>> = {
  en: new Intl.NumberFormat("en"),
};

/**
 * Write a count or a position as a locale writes numbers: the form a number takes in
 * {@link MessageParams}, already formatted for the locale.
 *
 * @example
 *   numeral("en", 12_000n); // "12,000"
 *
 * @param locale The locale of the renderer's own text.
 * @param n The number; a `bigint` is written exactly, at any size.
 * @returns The number, formatted for `locale`.
 */
export const numeral = (locale: Locale, n: bigint | number): string =>
  numberFormats[locale].format(n);

/**
 * Give the text of a key in a locale with its placeholders as written: a label an island fills
 * itself, with values only the client knows, such as the visible text of the chip a child just
 * placed (`fillLabel` in `#plate/ui/labels.ts`). Text the server can complete it writes with
 * {@link message}.
 *
 * @example
 *   messageText("en", "placementPlaced"); // "{chip} put in {target}."
 *
 * @param locale The locale to write in.
 * @param key The string to give.
 * @returns The key's text in `locale`, every `{name}` placeholder left in place.
 */
export const messageText = (locale: Locale, key: MessageKey): string => catalogs[locale][key];

/**
 * Fill a catalog text's `{name}` placeholders, a placeholder without a value staying as written:
 * what {@link message} and {@link counted} write a key's text with.
 *
 * @param text The catalog text.
 * @param values The value of each placeholder.
 * @returns The text, filled.
 */
const filled = (text: string, values: Readonly<Record<string, string>>): string =>
  text.replaceAll(placeholder, (whole, name: string) => values[name] ?? whole);

/**
 * Write the renderer's text for a key in a locale.
 *
 * A placeholder without a value, which only a call around the parameter types can leave, stays as
 * written rather than becoming empty.
 *
 * @example
 *   message("en", "answerOf", { count: "2", n: "1" }); // "Answer 1 of 2"
 *
 * @param locale The locale to write in.
 * @param key The string to write.
 * @param params The values of the key's `{name}` placeholders.
 * @returns The key's text in `locale`, with every placeholder filled.
 */
export const message = <Key extends MessageKey>(
  locale: Locale,
  key: Key,
  ...[params]: MessageArguments<Key>
): string => filled(catalogs[locale][key], params ?? {});

/**
 * The keys that may be a singular key's plural: each whose placeholders are the singular's and
 * `{n}`, so a pair whose other placeholders disagree fails to compile.
 *
 * @template One The singular key.
 */
type PluralOf<One extends MessageKey> = {
  readonly [Many in MessageKey]: [Placeholders<(typeof en)[Many]>] extends [
    Placeholders<(typeof en)[One]> | "n",
  ]
    ? [Placeholders<(typeof en)[One]> | "n"] extends [Placeholders<(typeof en)[Many]>]
      ? Many
      : never
    : never;
}[MessageKey];

/**
 * Write the renderer's text for a count: the singular key's at a count of 1, else the plural key's
 * with the count, formatted for the locale, as its `{n}`. The one writer of a count's message, so
 * no check picks between the two keys itself.
 *
 * @example
 *   counted("en", 2n, { many: "orderAtMost", one: "orderAtMostOne" }); // "Put at most 2 choices in order."
 *
 * @param locale The locale to write in.
 * @param count The count.
 * @param keys The singular key and the plural one, whose placeholders are the singular's and `n`.
 * @param params The values of the singular key's placeholders, which the plural shares.
 * @returns The text for the count.
 */
export const counted = <One extends MessageKey>(
  locale: Locale,
  count: bigint,
  keys: { readonly many: PluralOf<One>; readonly one: One },
  ...[params]: MessageArguments<One>
): string =>
  count === 1n
    ? filled(catalogs[locale][keys.one], params ?? {})
    : filled(catalogs[locale][keys.many], { ...params, n: numeral(locale, count) });
