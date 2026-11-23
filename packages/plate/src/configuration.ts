/**
 * The renderer's configuration: the settings a host chooses and the addresses of the files its
 * items name, decoded and defaulted by one Schema, and {@link configure}, which reads them.
 *
 * @module
 */
import type { SchemaIssue } from "effect";
import { Effect, Option, Predicate, Schema, SchemaTransformation } from "effect";
import { locales } from "#plate/messages.ts";
import { isPackagePath } from "#plate/model/url.ts";
import type { Asset } from "#plate/model/url.ts";

/**
 * The output budget a configuration holds when the host sets none, and the one a redaction runs
 * under when its caller passes none: 16,777,216 characters (16 MiB of ASCII), counted as a
 * string's `length` counts them (UTF-16 code units).
 */
export const defaultOutputBudget = 16_777_216;

/**
 * The largest output budget a configuration admits: 536,870,888 characters, V8's longest string,
 * the smallest of the engines' limits, so no budget asks an engine for a string it cannot build.
 */
const maximumOutputBudget = 536_870_888;

/**
 * A key of the configuration's `assets` as a Schema: a file's path from the package root, a
 * `PackagePath` (`#plate/model/url.ts`), branded through {@link isPackagePath}.
 */
const PackagePathSchema = Schema.String.check(
  Schema.makeFilter((text: string) =>
    isPackagePath(text)
      ? undefined
      : 'a path from the package root must name a file: not empty, with no "/" at either end and no "." or ".." segment',
  ),
).pipe(Schema.brand("PackagePath"));

/**
 * An address of the configuration's `assets`: a URL with no ASCII whitespace that neither starts
 * nor ends with a comma, so it is one URL wherever the server shell writes it, a `srcset` candidate
 * included, which the HTML `srcset` parser splits at whitespace and strips of edge commas.
 *
 * @see https://html.spec.whatwg.org/multipage/images.html#parse-a-srcset-attribute
 */
const Address = Schema.String.check(
  Schema.isPattern(/^[^\t\n\f\r ,](?:[^\t\n\f\r ]*[^\t\n\f\r ,])?$/u),
);

/**
 * One file's entry in the configuration's `assets` as a host writes it: its path from the package
 * root, then its address, or `null` for a file the host holds and withholds from every player.
 */
const AssetEntry = Schema.Tuple([PackagePathSchema, Schema.NullOr(Address)]);

/**
 * What the host gives one file, decoded from its entry's address ({@link Asset}).
 *
 * @param address The entry's address, `null` for a withheld file.
 * @returns The file served at the address, or withheld.
 */
const assetOf = (address: string | null): Asset =>
  address === null ? { kind: "withheld" } : { address, kind: "served" };

/**
 * The configuration's `assets` as a Schema: written as an array of entries, each a file's path and
 * its address or `null`, and decoded to the map from each path to what the host gives it
 * ({@link Asset}). Two entries of one path are refused, so the map holds each file once and never
 * by whichever entry came last.
 */
const Assets = Schema.Array(AssetEntry)
  .check(
    Schema.makeFilter((entries: readonly (typeof AssetEntry.Type)[]) =>
      new Set(entries.map(([path]) => path)).size === entries.length
        ? undefined
        : "each file's path may appear in one entry only",
    ),
  )
  .pipe(
    Schema.decodeTo(
      Schema.toType(
        Schema.ReadonlyMap(
          PackagePathSchema,
          Schema.Union([
            Schema.Struct({ address: Address, kind: Schema.Literal("served") }),
            Schema.Struct({ kind: Schema.Literal("withheld") }),
          ]),
        ),
      ),
      SchemaTransformation.transform({
        decode: (entries): ReadonlyMap<typeof PackagePathSchema.Type, Asset> =>
          new Map(entries.map(([path, address]) => [path, assetOf(address)])),
        encode: (assets) =>
          [...assets].map(
            ([path, asset]) => [path, asset.kind === "served" ? asset.address : null] as const,
          ),
      }),
    ),
  );

/**
 * How a Hotspot shows the list of its areas under its image, plate's own path to them for a
 * keyboard, a screen reader and a large target, which QTI's vocabulary says nothing of: `shown`;
 * or `visually-hidden`, out of sight but in the accessibility tree and the tab order, each row's
 * keyboard focus still drawn on its area, and shown again wherever the stage draws no areas, an
 * image whose size is unknown, where the list is the only way to answer.
 */
const hotspotLists = ["shown", "visually-hidden"] as const;

/**
 * How a Hotspot shows a picked area, which QTI's vocabulary leaves to the platform ("colors and
 * opacities of the platform's choosing", shared vocabulary 1.2.5.1): `ring`, its ring widened and
 * a check badge in its corner; or `fill`, the area's own shape filled, as a shaded part of a
 * partitioned figure is, and no badge.
 */
const hotspotPicks = ["ring", "fill"] as const;

/**
 * How a child types into a Text Entry beside the device's own keyboard: `none`, with that keyboard
 * alone; `on-screen`, with child-sized keys under each box, the keys the box's response can hold
 * (`keypadOf` in `#plate/ui/text-entry/keypad.ts`), which type into the box as its keyboard does;
 * or `host`, with a keypad the host shows of its own: plate shows no keys, and each box asks the
 * device for no keyboard (`inputmode="none"`), so the host's keys are the only ones on the screen,
 * as AlphaTest's player asked for none under its own drill keypad (mastery-track-player 941a86a,
 * `FluencyInteraction.tsx` lines 1276–1290).
 */
const textEntryKeypads = ["none", "on-screen", "host"] as const;

/**
 * How a child types into a Text Entry, as {@link textEntryKeypads} says.
 */
export type TextEntryKeypad = (typeof textEntryKeypads)[number];

/**
 * The Schema of the renderer's configuration, which owns every field's constraint and default, and
 * which field has none.
 *
 * Every key but `seed` is optional in the input and takes its default when left out, so `{ seed }`
 * decodes to the whole default configuration. A key it does not name is refused, and so is a value
 * of another type: `"3"` is not a heading level. No item session control setting is plate's: the
 * stage's validate-responses is the QTI database's, whose admission judges an answer by it in the
 * statement that would record it. `headingLevel` is the level the item's shallowest heading
 * takes, every other heading keeping its distance from it, capped at `h6`; it starts at 2 because
 * the host owns `h1`. `hotspotList` and `hotspotPicks` are how every Hotspot of the item shows its
 * list of areas and a picked area, `shown` and `ring` by default; `<Item>` writes them on its root,
 * where the stylesheet reads them, and nothing else reads them, so neither changes the markup, the
 * response or its scoring. Whether an area shows a ring before it is picked is the item's own word,
 * QTI's `qti-unselected-hidden` class, never the host's. `textEntryKeypad` is whether every Text
 * Entry of the item shows an on-screen keypad under its box, `none` by default; the islands read
 * it, and its keys type through the box's own input, so it changes no response or its scoring.
 * `picksInstruction` is whether every Choice of the item writes the line AlphaTest's player wrote
 * under its prompt, "Select your answer:" for one pick, "Select all that apply:" for more, and
 * "Your Answer:" in a review, `false` by default; it is words alone, changing no response.
 * `bankCaption` is whether every Gap Match's and Graphic Gap Match's bank writes the caption
 * AlphaTest's player wrote over it, "DRAG & DROP THE ANSWER", `false` by default; words alone too.
 * `assets` maps each file an item's package URLs may name, by its path from the package root, to
 * its address, the URL `<Item>` writes in its place, or to `null` for a file the host withholds,
 * which `<Item>` writes no URL for and renders the item without: `<Item>` resolves each package URL
 * against the item's location, the path from the package root the host opened it by, so
 * `media/a.png` in `items/q1.xml` names `items/media/a.png`, and it throws `AssetMissing` for a
 * file `assets` holds no entry for, never writing a path relative to the page. It is empty by
 * default, and `configure` reads it as an array of `[path, address]` entries, each path once.
 * `outputBudget` bounds the characters an item's printed variables print, counted as a string's
 * `length` counts them (UTF-16 code units), and is 16,777,216 (16 MiB of ASCII) by default:
 * `redact` stops printing once their text passes it, and `<Item>` then refuses the item with
 * `OutputTooLarge`. Its maximum, 536,870,888, is V8's longest string, the smallest of the engines'
 * limits, so no budget asks an engine for a string it cannot build. `seed` is a string, used as
 * given and required, since every order a page shows is keyed by it: the served item's shuffle seed
 * (`shuffleSeed`), or the key a host's preview states for itself, which keys a shuffled
 * interaction's order with the response, and nothing else. Processing never reads it: the QTI
 * database runs processing under a seed of its own.
 */
export const ConfigurationSchema = Schema.Struct({
  assets: Assets.pipe(Schema.withDecodingDefaultKey(Effect.succeed([]))),
  bankCaption: Schema.Boolean.pipe(Schema.withDecodingDefaultKey(Effect.succeed(false))),
  headingLevel: Schema.Int.check(Schema.isBetween({ maximum: 6, minimum: 2 })).pipe(
    Schema.withDecodingDefaultKey(Effect.succeed(2)),
  ),
  hotspotList: Schema.Literals(hotspotLists).pipe(
    Schema.withDecodingDefaultKey(Effect.succeed("shown")),
  ),
  hotspotPicks: Schema.Literals(hotspotPicks).pipe(
    Schema.withDecodingDefaultKey(Effect.succeed("ring")),
  ),
  locale: Schema.Literals(locales).pipe(Schema.withDecodingDefaultKey(Effect.succeed("en"))),
  outputBudget: Schema.Int.check(
    Schema.isBetween({ maximum: maximumOutputBudget, minimum: 1 }),
  ).pipe(Schema.withDecodingDefaultKey(Effect.succeed(defaultOutputBudget))),
  picksInstruction: Schema.Boolean.pipe(Schema.withDecodingDefaultKey(Effect.succeed(false))),
  seed: Schema.String,
  textEntryKeypad: Schema.Literals(textEntryKeypads).pipe(
    Schema.withDecodingDefaultKey(Effect.succeed("none")),
  ),
});

/**
 * The renderer's configuration, every field present.
 */
export type Configuration = typeof ConfigurationSchema.Type;

/**
 * A field of the configuration.
 */
type Field = keyof Configuration;

/**
 * What each field admits, as {@link InvalidConfiguration}'s message writes it.
 */
const allowedValues: Readonly<Record<Field, string>> = {
  assets:
    'an array of [path, address] entries: each path a file\'s path from the package root, such as "items/media/a.png", in one entry only, and each address a URL with no whitespace that neither starts nor ends with a comma, such as "https://cdn.example/sha256/9f86…", or null for a file the host withholds',
  bankCaption:
    "true or false, whether every Gap Match's and Graphic Gap Match's bank writes the caption that tells a child to drag",
  headingLevel: "an integer from 2 to 6",
  hotspotList: `how a Hotspot shows its list of areas: ${hotspotLists.map((value) => `"${value}"`).join(" or ")}`,
  hotspotPicks: `how a Hotspot shows a picked area: ${hotspotPicks.map((value) => `"${value}"`).join(" or ")}`,
  locale: `a supported locale: ${locales.map((locale) => `"${locale}"`).join(", ")}`,
  outputBudget:
    "an integer from 1 to 536,870,888, the most characters an item's printed variables may print",
  picksInstruction:
    "true or false, whether every Choice writes the line that tells a child how many to pick",
  seed: 'a string, the served item\'s shuffle seed, such as "7"',
  textEntryKeypad: `how a child types into a Text Entry: ${textEntryKeypads.map((value) => `"${value}"`).join(" or ")}`,
};

/**
 * What the whole input admits when it is not an object of fields at all.
 */
const allowedInput = "an object of configuration fields, such as {} for every default";

/**
 * The fields a configuration may hold, as {@link InvalidConfiguration}'s message lists them for a
 * key that is none of them.
 */
const allowedFields = Object.keys(allowedValues).join(", ");

/**
 * Decide whether a property key names a configuration field.
 *
 * @param key The first segment of a failing path.
 * @returns Whether `key` is one of the configuration's fields.
 */
const isField = (key: PropertyKey): key is Field => Object.hasOwn(allowedValues, key);

/**
 * A configuration the renderer cannot run with: a field outside its allowed values, a key that
 * names no field, or an input that is not an object of fields.
 *
 * `field` names the first key that fails, or is none when the input itself is not an object.
 * `allowed` says what that field admits, the fields there are when the key names none, or what
 * the input admits.
 */
export class InvalidConfiguration extends Schema.TaggedError<InvalidConfiguration>()(
  "InvalidConfiguration",
  {
    allowed: Schema.String,
    field: Schema.Option(Schema.String),
  },
) {
  /**
   * The field, what it admits, and what to change.
   */
  override get message(): string {
    return Option.match(this.field, {
      onNone: () => `The configuration is not an object. Pass ${this.allowed}.`,
      onSome: (field) =>
        isField(field)
          ? `The configuration's ${field} is not allowed. Set it to ${this.allowed}, or leave it out.`
          : `The configuration has no field ${field}. Remove it, or use one of ${this.allowed}.`,
    });
  }
}

/**
 * Find the key a decoding issue points at: the first segment of its first pointer.
 *
 * A struct reports a failing field, and a key it does not declare, as a `Composite` holding a
 * `Pointer` whose path starts with the key; the decode stops at the first failing key, so the first
 * pointer names it.
 *
 * @param issue The issue the decode reported.
 * @returns The key of the first failing property, or none when the issue points at no property.
 */
const failingKey = (issue: SchemaIssue.Issue): Option.Option<PropertyKey> => {
  switch (issue._tag) {
    case "AnyOf":
    case "Composite": {
      return Option.firstSomeOf(issue.issues.map(failingKey));
    }
    case "Encoding":
    case "Filter": {
      return failingKey(issue.issue);
    }
    case "Pointer": {
      return Option.fromNullishOr(issue.path[0]);
    }
    case "Forbidden":
    case "InvalidType":
    case "InvalidValue":
    case "MissingKey":
    case "OneOf":
    case "UnexpectedKey": {
      return Option.none();
    }
    default: {
      return issue satisfies never;
    }
  }
};

/**
 * Turn a configuration that does not decode into {@link InvalidConfiguration}.
 *
 * An issue that points at no key is a refusal of the input as a whole.
 *
 * @param error The failure the decode raised.
 * @returns The refusal naming the failing key and what it admits.
 */
const invalidConfiguration = (error: Schema.SchemaError): InvalidConfiguration =>
  Option.match(failingKey(error.issue).pipe(Option.filter(Predicate.isString)), {
    onNone: () => new InvalidConfiguration({ allowed: allowedInput, field: Option.none() }),
    onSome: (key) =>
      new InvalidConfiguration({
        allowed: isField(key) ? allowedValues[key] : allowedFields,
        field: Option.some(key),
      }),
  });

/**
 * Decode a host's settings through {@link ConfigurationSchema}, refusing a key it does not name.
 */
const decodeConfiguration = Schema.decodeUnknownEffect(ConfigurationSchema, {
  onExcessProperty: "error",
});

/**
 * Read a configuration, filling every field the input leaves out with its default.
 *
 * Each field is read as the type it holds, so `"3"` is no heading level and `7` no seed, and a key
 * that names no field is refused, so a misspelt setting never runs as its default.
 *
 * @example
 *   configure({ headingLevel: 3, seed: "7" }); // succeeds with headingLevel 3 and every other default
 *
 * @param input The host's settings, an object keyed by field name.
 * @returns The decoded configuration, or {@link InvalidConfiguration} naming the first key outside
 *   its allowed values or outside the fields.
 */
export const configure = (input: unknown): Effect.Effect<Configuration, InvalidConfiguration> =>
  decodeConfiguration(input).pipe(
    Effect.mapError(invalidConfiguration),
    Effect.withSpan("plate.configure"),
  );
