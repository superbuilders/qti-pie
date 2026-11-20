/**
 * The one mapping between QTI values and form entries: the name each response posts under, the
 * entries a value encodes to, the value posted entries decode to, and which posted entries belong
 * to this item instance.
 *
 * Entries carry QTI's lexical forms, so a value's form is {@link format}'s and its reading is
 * {@link parseLexical}'s, with the allowances a posted form needs: a number is trimmed, and a
 * string's line breaks are a textarea's. A record posts the text it was typed as, and its other
 * fields are read from that text. Every value of a base type posts as one entry under its
 * response's entry name, a point and a pair as their two parts separated by a space, so two
 * responses of one instance never post under one name. Every entry is text: plate's form posts no
 * file, so a file binding reads NULL from no entry and refuses text, and a file encodes to no
 * entry.
 *
 * @module
 */
import { Array, Data, Option, Result } from "effect";
import {
  format,
  isRecordValue,
  isXmlText,
  parseLexical,
  trimXmlSpace,
} from "#plate/model/values.ts";
import type {
  RecordField,
  RecordValue,
  ResponseValue,
  Single,
  Value,
} from "#plate/model/values.ts";

/**
 * One form entry: a name and its text. {@link encode} writes these, a host's `<Responses>` holds
 * and posts them (`PostedEntry`, `@qti-pie/plate/ui/client`), and {@link decode} reads them.
 * Plate's form posts no file, whose bytes plate never holds, so a host reading `FormData` passes
 * its text entries alone.
 */
export type Entry = readonly [name: string, value: string];

/**
 * The base types whose value is a pair of identifiers, posted as the two identifiers separated by a
 * space, the source first: `directedPair` (Gap Match, Match, Graphic Gap Match) and `pair`
 * (Associate, Graphic Associate). Each value of a `multiple` or `ordered` response is one entry, as
 * any other base type's is.
 */
const pairBaseTypes = ["directedPair", "pair"] as const;

/**
 * A base type whose value is a pair of identifiers.
 */
type PairBaseType = (typeof pairBaseTypes)[number];

/**
 * The base type whose value is a point, two whole numbers x then y, which an interaction that
 * places a point on an image (Select Point, Position Object) posts as one entry per value under
 * the binding's name, its lexical form: the two coordinates separated by a space, such as
 * `102 113`. A point posts as a pair does, so its entry name is its response's alone: a point
 * response `R` and a response `R.x`, both identifiers QTI admits, post under two names.
 */
const pointBaseType = "point";

/**
 * The base type whose value is `true` or `false`, which End Attempt posts as one entry holding
 * that lexical form, `true` from a submit button named by its response; an absent entry is no
 * response.
 */
const booleanBaseType = "boolean";

/**
 * The base type whose value is a file, which no form plate renders posts: plate renders no Upload
 * or Drawing, and a Portable Custom Interaction bound to a file is its notice. So a file binding
 * reads NULL, and refuses any text posted under its name (`file-text`). A file cannot be posted
 * from text, so {@link encode} gives a file value no entry; a module shows a restored file by its
 * name.
 */
const fileBaseType = "file";

/**
 * The base types an interaction posts: Choice's `identifier`, Text Entry's and Extended Text's
 * `string`, `integer` and `float`, the {@link PairBaseType}s of the interactions that put
 * identifiers into targets, the `point` of the interactions that place a point on an image, End
 * Attempt's `boolean`, and `file`, which a declaration binds though no form posts it
 * ({@link fileBaseType}).
 */
const postedBaseTypes = [
  "identifier",
  "string",
  "integer",
  "float",
  ...pairBaseTypes,
  pointBaseType,
  booleanBaseType,
  fileBaseType,
] as const;

/**
 * A base type an interaction posts.
 */
export type PostedBaseType = (typeof postedBaseTypes)[number];

/**
 * Report whether an interaction can post values of a base type.
 *
 * @param baseType A declaration's base type.
 * @returns Whether `baseType` is a {@link PostedBaseType}.
 */
export const isPosted = (baseType: string): baseType is PostedBaseType =>
  postedBaseTypes.some((name) => name === baseType);

/**
 * Report whether a posted base type is a pair of identifiers.
 *
 * @param baseType A posted base type.
 * @returns Whether `baseType` is a {@link PairBaseType}.
 */
const isPair = (baseType: PostedBaseType): baseType is PairBaseType =>
  pairBaseTypes.some((name) => name === baseType);

/**
 * Report whether a posted base type is a file, whose value no entry carries.
 *
 * @param baseType A posted base type.
 * @returns Whether `baseType` is `file`.
 */
const isFile = (baseType: PostedBaseType): baseType is typeof fileBaseType =>
  baseType === fileBaseType;

/**
 * How a response of a base type travels through the form: the entry name it posts under, from
 * {@link entryName}, and the base type and cardinality of its declaration.
 */
export interface ValueBinding {
  readonly baseType: PostedBaseType;
  readonly cardinality: Value["cardinality"];
  readonly name: string;
}

/**
 * How a record response travels through the form: the entry name it posts under, from
 * {@link entryName}. A record has no base type of its own, and its one posted entry is its text.
 */
export interface RecordBinding {
  readonly cardinality: "record";
  readonly name: string;
}

/**
 * How one response travels through the form: a {@link ValueBinding} for a response of a base type,
 * or a {@link RecordBinding} for a record response.
 */
export type Binding = ValueBinding | RecordBinding;

/**
 * Settings for {@link decode}.
 */
export interface DecodeOptions {
  /**
   * The value no entry decodes to in place of NULL, for a value binding: the `absentValue` of the
   * interaction module that binds the response (`InteractionModule` in
   * `#plate/interactions/contract.ts`), which `postings` in `#plate/postings.ts` puts in the
   * response's posting. Absent means NULL. It applies only when the form posted no entry named for
   * the binding: one empty entry is a response the form did post, and stays NULL. A record binding
   * ignores it, as it ignores `base`.
   */
  readonly absent?: Value;
  /**
   * The number base an integer is written in, Text Entry's `base`, an integer from 2 to 36; 10
   * when absent. In any other base no text is an integer.
   */
  readonly base?: number;
  /**
   * Whether a string text of XML white space alone is NULL, as QTI's `TextFormatEnum` asks of
   * `plain` and `preformatted` text: "where a response consists only of white-space characters …
   * it should be treated as an empty string (NULL)". `postings` in `#plate/postings.ts` sets it for
   * a response whose first interaction is an Extended Text of either format, as that Extended
   * Text's island posts nothing for such text. It applies to a `string` value binding's texts and
   * to a record binding's; absent is false, so only empty text is NULL.
   */
  readonly blankIsEmpty?: boolean;
}

/**
 * Why posted entries do not decode to a value of their binding.
 */
type MalformedReason =
  | "boolean"
  | "character"
  | "file-text"
  | "identifier"
  | "number"
  | "point"
  | "single-many";

/**
 * What each {@link MalformedReason} asks the poster to change.
 */
const remedies = {
  boolean: "is not a boolean; post true or false, as the form gives it",
  character:
    "holds a character XML cannot carry: a control character other than tab, line feed and carriage return, U+FFFE, U+FFFF or a lone surrogate; post the text without it",
  "file-text":
    "is text, but this response takes a file, which no form plate renders posts; post nothing under its name",
  identifier:
    "is not an identifier, or for a pair response not two identifiers separated by a space; post an NCName such as choiceA, or a pair such as choiceA gapB, as the form gives it",
  number:
    "is not a number; post digits in the interaction's base with an optional sign, or a finite decimal such as 2.5 or 1E3",
  point: "is not a point; post two whole numbers separated by a space, x then y, such as 102 113",
  "single-many": "was posted more than once, but its response takes one value; post it once",
} satisfies Record<MalformedReason, string>;

/**
 * The failure of decoding posted entries: they are not a value of their binding, for the reason
 * given.
 *
 * `entry` is the binding's entry name, and `reason` is the first of {@link decode}'s refusals the
 * entries meet.
 */
export class Malformed extends Data.TaggedError("Malformed")<{
  readonly entry: string;
  readonly reason: MalformedReason;
}> {
  /**
   * The entry name and what to post instead, in one line.
   */
  override get message(): string {
    return `The form entry ${JSON.stringify(this.entry)} ${remedies[this.reason]}.`;
  }
}

/**
 * The requirements an instance token meets, in the order {@link checkInstance} checks them.
 *
 * - `non-empty`: it holds at least one character.
 * - `characters`: every character is an ASCII letter, a digit, `_`, `.`, `:` or `-`, which an `id`,
 *   an IDREFS list and a form entry name all take, and none of which is whitespace.
 * - `id-boundary`: it does not end in `-` and holds no `--`. The renderer's ids are
 *   `<instance>-<segment>-…` (`scopedId`) and an authored id is `<instance>--<id>` (`authoredId`),
 *   so a token that broke this would let one instance's part id equal another's authored id: `ab-`
 *   with `status` and `ab` with an authored `status` both give `ab--status`.
 */
const instanceRequirements = ["non-empty", "characters", "id-boundary"] as const;

/**
 * A requirement an instance token meets: one of {@link instanceRequirements}.
 */
export type InstanceRequirement = (typeof instanceRequirements)[number];

/**
 * How a token breaks the first requirement it breaks, with what breaks it: `characters` the first
 * character outside the set, `id-boundary` where the token meets an id's boundary, `end` where it
 * ends in `-` and `double` where it holds `--`.
 */
export type InstanceBreach =
  | { readonly requirement: "non-empty" }
  | { readonly character: string; readonly requirement: "characters" }
  | { readonly at: "double" | "end"; readonly requirement: "id-boundary" };

/**
 * A character an instance token is not made of: anything but an ASCII letter, a digit, `_`, `.`,
 * `:` and `-`.
 */
const outsideCharacter = /[^\w.:-]/u;

/**
 * How a token breaks each requirement, one check per requirement, none where it meets it.
 */
const breachesOf = {
  characters: (token: string) =>
    Option.map(Option.fromUndefinedOr(outsideCharacter.exec(token)?.[0]), (character) => ({
      character,
      requirement: "characters",
    })),
  "id-boundary": (token: string) => {
    if (token.endsWith("-")) {
      return Option.some({ at: "end", requirement: "id-boundary" });
    }

    return token.includes("--")
      ? Option.some({ at: "double", requirement: "id-boundary" })
      : Option.none();
  },
  "non-empty": (token: string) =>
    token === "" ? Option.some({ requirement: "non-empty" }) : Option.none(),
} satisfies {
  readonly [R in InstanceRequirement]: (
    token: string,
  ) => Option.Option<Extract<InstanceBreach, { readonly requirement: R }>>;
};

/**
 * Check an instance token: an opaque token, unique per page, that scopes an item instance's ids
 * and entry names.
 *
 * A host's own key for the item's use passes, such as `sitting-42.1`, as do React's `useId()`
 * forms `_r_1_` (React 19.2 and later) and `:r1:` (React 18 and 19.0); React 19.1's `«r1»` does
 * not, so its caller passes a token of their own.
 *
 * Two tokens that each pass can still collide when one extends the other after a `.` or `-`, such
 * as `a` and `a.b`: an id joins the token to a response identifier with `-`, an entry name joins
 * them with `.`, and an identifier may itself hold both, so instance `a` with response `b.X` posts
 * under the same name as instance `a.b` with response `X`. Unique tokens of one length never do.
 *
 * @example
 *   checkInstance("_r_1_"); // Option.none()
 *   checkInstance("ab-"); // Option.some({ at: "end", requirement: "id-boundary" })
 *
 * @param token The token an author passes as the instance.
 * @returns How it breaks the first of {@link instanceRequirements} it breaks, or none when it meets
 *   them all.
 */
export const checkInstance = (token: string): Option.Option<InstanceBreach> =>
  Array.findFirst(instanceRequirements, (requirement): Option.Option<InstanceBreach> =>
    breachesOf[requirement](token),
  );

/**
 * Name the form entry a response posts under in one item instance.
 *
 * @param instance The item instance token, one {@link checkInstance} passes, such as
 *   `sitting-42.1`.
 * @param response The response declaration's identifier.
 * @returns `<instance>.<response>`.
 */
export const entryName = (instance: string, response: string): string => `${instance}.${response}`;

/**
 * Give the response a form entry posts for in one item instance, the inverse of
 * {@link entryName}: what follows `<instance>.` in its name. A name of another instance, or none,
 * posts for no response of this one. Two tokens of which one extends the other after a `.` share
 * names, as {@link checkInstance} says, so instance `a` reads `a.b.X` as its response `b.X`.
 *
 * @example
 *   responseOf("sitting-42.1", "sitting-42.1.RESPONSE"); // Option.some("RESPONSE")
 *   responseOf("sitting-42.1", "csrf-token"); // Option.none()
 *
 * @param instance The item instance token, one {@link checkInstance} passes.
 * @param name The entry's name.
 * @returns The response's identifier, none when the name is not this instance's.
 */
export const responseOf = (instance: string, name: string): Option.Option<string> => {
  const prefix = `${instance}.`;

  return name.startsWith(prefix) ? Option.some(name.slice(prefix.length)) : Option.none();
};

/**
 * Construct one of plate's own ids, scoped by the item's instance, so two instances on one page
 * never share an id: an id joins the instance to its segments with `-`, as an entry name joins it
 * to a response with `.` ({@link entryName}).
 *
 * @example
 *   scopedId("sitting-42.1", "item"); // "sitting-42.1-item"
 *
 * @param instance The item instance token, one {@link checkInstance} passes.
 * @param segments The id's further parts, such as a response identifier and a part's name.
 * @returns The instance and the segments joined by `-`.
 */
export const scopedId = (instance: string, ...segments: readonly (number | string)[]): string =>
  [instance, ...segments].join("-");

/**
 * Give the text a record was typed as: its `stringValue` field, which {@link encode} posts for the
 * record and the text control bound to it shows and checks.
 *
 * @param record The record.
 * @returns Its `stringValue`, or none when it has no such field, as the NULL record has none.
 */
export const recordText = (record: RecordValue): readonly Single[] =>
  record.fields.flatMap(({ identifier, value }) => (identifier === "stringValue" ? [value] : []));

/**
 * Encode one value as the entries a form posts for it.
 *
 * @param single The value.
 * @param binding The response's binding, which names the entries.
 * @param base The number base an integer is written in, from 2 to 36.
 * @returns For a file, no entry, since a form posts a file as its bytes and plate holds none; for
 *   an integer, one entry under the binding's name, its digits in `base`; for any other single,
 *   one entry under the binding's name in {@link format}'s lexical form.
 */
const entriesOf = (single: Single, binding: Binding, base: number): readonly Entry[] => {
  if (single.baseType === "file") {
    return [];
  }

  return [
    [binding.name, single.baseType === "integer" ? single.value.toString(base) : format(single)],
  ];
};

/**
 * Tell whether a number is a base an integer can be posted in: a whole number from 2 to 36, the
 * bases {@link decode} reads.
 *
 * @param base The number.
 * @returns Whether it is one.
 */
const isPostedBase = (base: number): boolean => Number.isInteger(base) && base >= 2 && base <= 36;

/**
 * Encode a value as the entries a form posts for it.
 *
 * A record posts its `stringValue` field ({@link recordText}), the text {@link decode} reads every
 * other field from, so a record decoded from a post encodes back to that post. A point posts one
 * entry per value, its two coordinates separated by a space, as a pair posts its two identifiers.
 * An integer is written in `options.base`, the base {@link decode} reads it in, so
 * `decode(encode(value, binding, options), binding, options)` gives the value back: pass the
 * response's posting's options, which name a Text Entry's `base`. A file value encodes to no
 * entry: a form posts a file as its bytes, which plate never holds, so a file cannot be re-posted
 * from its name, size and type; a module that restores one shows its name instead.
 *
 * @param value The response's value.
 * @param binding The response's binding, which names the entries.
 * @param options The number base an integer is written in, `options.base`, as {@link decode}
 *   takes it; base 10 when absent, or when it is no whole number from 2 to 36, a base no posted
 *   integer is read in.
 * @returns No entries for NULL or for a file value, one for a `single`, one for each value of a
 *   `multiple` or `ordered`, in order, and for a record one for its `stringValue` field, none when
 *   it has none, all under the binding's name and in {@link format}'s lexical form, an integer's
 *   digits in the base.
 */
export const encode = (
  value: ResponseValue,
  binding: Binding,
  options: Pick<DecodeOptions, "base"> = {},
): readonly Entry[] => {
  const base = options.base !== undefined && isPostedBase(options.base) ? options.base : 10;
  const singles = isRecordValue(value) ? recordText(value) : value.values;

  return singles.flatMap((single) => entriesOf(single, binding, base));
};

/**
 * The prefix `BigInt` takes to read a magnitude in each base it reads.
 */
const bigIntPrefixes: ReadonlyMap<number, string> = new Map([
  [2, "0b"],
  [8, "0o"],
  [10, ""],
  [16, "0x"],
]);

/**
 * The most digits {@link readByHalves} folds as a float: 36^10 − 1 is below 2^53, so the fold is
 * exact in every base up to 36.
 */
const leafLength = 10;

/**
 * Read the magnitude of digits in a base `BigInt` does not read, by halves: the high half times
 * the base to the length of the low half, plus the low half.
 *
 * The time is subquadratic in the number of digits, because each level of halving does a few
 * multiplications of its own size, and the powers of the base it needs are computed once. A
 * per-digit `total * base + digit` loop over bigints is quadratic: it took 433 ms on 100,000 base-7
 * digits.
 *
 * @param digits The value of each digit, most significant first, each below `base`.
 * @param base The number base, from 2 to 36.
 * @returns The magnitude the digits name.
 */
const readByHalves = (digits: readonly number[], base: number): bigint => {
  const radix = BigInt(base);
  const powers = new Map<number, bigint>();
  const power = (exponent: number): bigint => {
    const known = powers.get(exponent) ?? radix ** BigInt(exponent);
    powers.set(exponent, known);

    return known;
  };

  const read = (start: number, end: number): bigint => {
    if (end - start <= leafLength) {
      let total = 0;
      for (const digit of digits.slice(start, end)) {
        total = total * base + digit;
      }

      return BigInt(total);
    }

    const middle = start + Math.ceil((end - start) / 2);

    return read(start, middle) * power(end - middle) + read(middle, end);
  };

  return read(0, digits.length);
};

/**
 * Read a posted integer in a base, exactly and at any size: an optional sign, then one or more
 * ASCII digits below the base, where `a` to `z` in either case are the digits from 10.
 *
 * Bases 2, 8, 10 and 16 are read by `BigInt`, and every other base by {@link readByHalves}.
 * `BigInt` reads only digits this check has admitted, so it never throws.
 *
 * @param text The trimmed text.
 * @param base The number base.
 * @returns The integer, or none when the base is not an integer from 2 to 36, there are no digits,
 *   or a digit is outside the base.
 */
const readInteger = (text: string, base: number): Option.Option<bigint> => {
  const sign = text.startsWith("-") || text.startsWith("+") ? text.slice(0, 1) : "";
  const digits = text.slice(sign.length);
  const values = Array.fromIterable(digits).map((digit) => Number.parseInt(digit, 36));
  const inBase = values.every((value) => value < base);
  if (!Number.isInteger(base) || base < 2 || base > 36 || digits === "" || !inBase) {
    return Option.none();
  }

  const prefix = bigIntPrefixes.get(base);
  const magnitude = prefix === undefined ? readByHalves(values, base) : BigInt(prefix + digits);

  return Option.some(sign === "-" ? -magnitude : magnitude);
};

/**
 * Give the reason a posted number is refused, whichever step refuses it.
 *
 * @returns `number`.
 */
const notANumber = (): MalformedReason => "number";

/**
 * Read the text a posted number holds: the posted text with its outer XML white space shed, as
 * XSD's collapse facet reads a number (spec reading 7), none where nothing is left, which posts
 * NULL. The one reading of a posted number: {@link postedLexical} gives it for an `integer` and a
 * `float`, and a Slider's island reads its response's text by it.
 *
 * @param text The posted text.
 * @returns The number's lexical form, none for blank text.
 */
export const postedNumber = (text: string): Option.Option<string> =>
  Option.liftPredicate(trimXmlSpace(text), (lexical) => lexical !== "");

/**
 * Read the lexical form a posted text of a base type holds, none where it posts NULL: plate's one
 * reading of posted text, which {@link decode} reads each value from and a typed box's island
 * decides by whether its text posts. A number's is its {@link postedNumber}; any other base type's
 * is its text as posted, none when that is empty, and for a `string` under `blankIsEmpty` none
 * when it holds XML white space alone (QTI's `TextFormatEnum`: such a response "should be treated
 * as an empty string (NULL)").
 *
 * @param baseType The binding's base type.
 * @param text The posted text.
 * @param blankIsEmpty Whether a string of XML white space alone is NULL.
 * @returns The lexical form, none for NULL.
 */
export const postedLexical = (
  baseType: PostedBaseType,
  text: string,
  blankIsEmpty: boolean,
): Option.Option<string> => {
  if (baseType === "integer" || baseType === "float") {
    return postedNumber(text);
  }

  return text === "" || (baseType === "string" && blankIsEmpty && trimXmlSpace(text) === "")
    ? Option.none()
    : Option.some(text);
};

/**
 * Read one posted string as a value of a base type.
 *
 * Text holding a character XML cannot carry is refused first, whatever the base type, since the
 * value would end in a result no XML reader reads. Then the text is read as {@link postedLexical}
 * reads it: empty text is no value, a number sheds its outer XML white space first, so blank text
 * is no value too, and so is a string of XML white space alone under `blankIsEmpty`
 * (`DecodeOptions.blankIsEmpty`). An integer is read exactly in `base`, then its
 * decimal digits take the value model's one path, so a posted integer is the value the same digits
 * are in content. A float is the value model's reading of the text; it is non-finite only for
 * `INF`, `-INF` and `NaN`, which a posted form refuses. A pair is the value model's reading of the
 * text as written, two identifiers separated by white space, with no outer white space. A boolean
 * is `true` or `false` as written, nothing else. A point is the value model's reading of the text
 * as written, two whole numbers separated by white space, with no outer white space, as a pair is.
 *
 * @param baseType The binding's base type.
 * @param text The posted string.
 * @param base The number base of an integer, from 2 to 36.
 * @param blankIsEmpty Whether a string of XML white space alone is no value.
 * @returns The value, none for empty text, or the reason the text is not a value: `character`,
 *   `identifier` for an identifier or a pair, `boolean`, `point`, and `number` for an integer or a
 *   float.
 */
const readPosted = (
  baseType: PostedBaseType,
  text: string,
  base: number,
  blankIsEmpty: boolean,
): Result.Result<Option.Option<Single>, MalformedReason> => {
  if (!isXmlText(text)) {
    return Result.fail("character");
  }

  const posted = postedLexical(baseType, text, blankIsEmpty);
  if (Option.isNone(posted)) {
    return Result.succeedNone;
  }

  const lexical = posted.value;
  if (baseType === "string") {
    return Result.succeedSome({ baseType, value: lexical.replaceAll(/\r\n?/gu, "\n") });
  }

  if (baseType === "identifier" || isPair(baseType)) {
    return parseLexical(baseType, lexical).pipe(
      Result.mapError((): MalformedReason => "identifier"),
      Result.map(Option.some),
    );
  }

  if (baseType === pointBaseType || baseType === booleanBaseType) {
    return parseLexical(baseType, lexical).pipe(
      Result.mapError((): MalformedReason => baseType),
      Result.map(Option.some),
    );
  }

  const decimal =
    baseType === "integer" ? Option.map(readInteger(lexical, base), String) : Option.some(lexical);

  return Result.fromOption(decimal, notANumber).pipe(
    Result.flatMap((number) => Result.mapError(parseLexical(baseType, number), notANumber)),
    Result.filterOrFail(
      (single) => single.baseType !== "float" || Number.isFinite(single.value),
      notANumber,
    ),
    Result.map(Option.some),
  );
};

/**
 * A number in a record's text: xs:double's lexical form, as {@link parseLexical} reads a float,
 * without `INF`, `-INF` and `NaN`. An optional sign, the digits before the point, the point and the
 * digits after it when written, and `e` or `E` with the exponent when written; {@link numberFields}
 * also asks for at least one digit before or after the point. Each run of digits ends at a
 * character the next part starts with, so a failed match backtracks in time linear in the text.
 */
const recordNumber =
  /^(?<sign>[+-]?)(?<whole>[0-9]*)(?:\.(?<fraction>[0-9]*))?(?:[Ee](?<exponent>[+-]?[0-9]+))?$/u;

/**
 * A digit other than zero: where a number's significant figures start.
 */
const nonZeroDigit = /[1-9]/u;

/**
 * Construct an integer field of a record.
 *
 * @param identifier The field's identifier.
 * @param value The field's value.
 * @returns The field.
 */
const integerField = (identifier: string, value: bigint): RecordField => ({
  identifier,
  value: { baseType: "integer", value },
});

/**
 * Give the fields a record's text gives when it is a number: `floatValue`, `integerValue`,
 * `leftDigits`, `rightDigits`, `ndp`, `nsf` and `exponent`, in that order.
 *
 * The text is trimmed of XML whitespace only, so a no-break space keeps it from being a number.
 * `floatValue` is the value model's reading of a float, so past the largest double it is an
 * infinity of its sign (reading 144). `integerValue` is the exact integer, present only when no
 * fractional digit and no exponent is written (`5.` gives 5). `leftDigits` and `rightDigits` count
 * the digits written before and after the point, leading and trailing zeros included, the sign
 * not. `ndp` is `rightDigits` minus the exponent, and may be negative. `nsf` counts from the first
 * non-zero digit to the last digit written; a zero value has the digits after the point, at least
 * one. `exponent` is present only when written. Every integer is exact at any size, and each count
 * is one scan of the text.
 *
 * @param text The posted text, as posted.
 * @returns The fields, or none when the trimmed text is not a number.
 */
const numberFields = (text: string): readonly RecordField[] => {
  const trimmed = trimXmlSpace(text);
  const parts = recordNumber.exec(trimmed)?.groups;
  const sign = parts?.["sign"] ?? "";
  const whole = parts?.["whole"] ?? "";
  const fraction = parts?.["fraction"] ?? "";
  const written = Option.fromUndefinedOr(parts?.["exponent"]);
  if (whole === "" && fraction === "") {
    return [];
  }

  const exponent = written.pipe(Option.map(BigInt));
  const digits = whole + fraction;
  const first = digits.search(nonZeroDigit);
  const significant = first === -1 ? Math.max(fraction.length, 1) : digits.length - first;
  const isInteger = Option.isNone(written) && fraction === "" && whole !== "";
  const integer = isInteger
    ? Result.getSuccess(parseLexical("integer", sign + whole))
    : Option.none<Single>();
  const float = Result.getSuccess(parseLexical("float", trimmed));

  return [
    ...Option.toArray(float.pipe(Option.map((value) => ({ identifier: "floatValue", value })))),
    ...Option.toArray(integer.pipe(Option.map((value) => ({ identifier: "integerValue", value })))),
    integerField("leftDigits", BigInt(whole.length)),
    integerField("rightDigits", BigInt(fraction.length)),
    integerField("ndp", BigInt(fraction.length) - Option.getOrElse(exponent, () => 0n)),
    integerField("nsf", BigInt(significant)),
    ...Option.toArray(exponent.pipe(Option.map((value) => integerField("exponent", value)))),
  ];
};

/**
 * Read a record from the texts posted for it, at most one.
 *
 * Its text is read as a string binding reads one: refused when it holds a character XML cannot
 * carry, NULL when empty, and with CRLF and a lone CR turned into LF. That text is the record's
 * `stringValue`, and {@link numberFields} gives the rest. Text Entry's `base` is never applied.
 *
 * @param texts The posted texts, none or one.
 * @param blankIsEmpty Whether text of XML white space alone is NULL too.
 * @returns The record, NULL (no field) when nothing or empty text was posted, or the reason the
 *   text is refused.
 */
const readRecord = (
  texts: readonly string[],
  blankIsEmpty: boolean,
): Result.Result<RecordValue, MalformedReason> => {
  const [text = ""] = texts;

  return readPosted("string", text, 10, blankIsEmpty).pipe(
    Result.map((stringValue): RecordValue => ({
      cardinality: "record",
      fields: Option.match(stringValue, {
        onNone: () => [],
        onSome: (value) => [{ identifier: "stringValue", value }, ...numberFields(text)],
      }),
    })),
  );
};

/**
 * Read a value of a base type from the texts posted for it.
 *
 * @param texts The posted texts.
 * @param binding The response's binding.
 * @param base The number base of an integer.
 * @param blankIsEmpty Whether a string of XML white space alone is no value.
 * @returns The value, holding each text that is not empty, in order, or the first reason a text is
 *   refused.
 */
const readValue = (
  texts: readonly string[],
  binding: ValueBinding,
  base: number,
  blankIsEmpty: boolean,
): Result.Result<Value, MalformedReason> =>
  Result.all(texts.map((text) => readPosted(binding.baseType, text, base, blankIsEmpty))).pipe(
    Result.map((values) => ({
      baseType: binding.baseType,
      cardinality: binding.cardinality,
      values: Array.getSomes(values),
    })),
  );

/**
 * Give the texts posted under one entry name, in order.
 *
 * @param entries The posted entries.
 * @param name The entry name.
 * @param cardinality The binding's cardinality.
 * @returns The texts, or `single-many` when a `single` or a record has more than one.
 */
const postedTexts = (
  entries: readonly Entry[],
  name: string,
  cardinality: Binding["cardinality"],
): Result.Result<readonly string[], MalformedReason> => {
  const texts = entries.filter(([entry]) => entry === name).map(([, value]) => value);
  const takesOne = cardinality === "single" || cardinality === "record";

  return takesOne && texts.length > 1 ? Result.fail("single-many") : Result.succeed(texts);
};

/**
 * Read a file binding's entries: none, since no form plate renders posts a file, is NULL, and any
 * entry under its name is text, which no file reads from, so `file-text`.
 *
 * @param entries The posted entries.
 * @param binding The file response's binding.
 * @returns NULL, or `file-text` when an entry is named for the binding.
 */
const readFile = (
  entries: readonly Entry[],
  binding: ValueBinding,
): Result.Result<Value, MalformedReason> =>
  entries.some(([name]) => name === binding.name)
    ? Result.fail("file-text")
    : Result.succeed({ baseType: binding.baseType, cardinality: binding.cardinality, values: [] });

/**
 * Tell whether a form posted any entry for a value binding, one under the binding's name. An
 * empty entry counts: the form posted for the response.
 *
 * @param entries The posted entries.
 * @param binding The response's binding.
 * @returns Whether an entry is named for the binding.
 */
const postedFor = (entries: readonly Entry[], binding: ValueBinding): boolean =>
  entries.some(([name]) => name === binding.name);

/**
 * Decode the entries a form posted under a value binding, as {@link decode} reads them.
 *
 * @param entries The posted entries.
 * @param binding The response's value binding.
 * @param options The number base of an integer, the value no entry takes, and whether a string of
 *   white space alone is NULL ({@link DecodeOptions}).
 * @returns A value of the binding's base type and cardinality, NULL for a file binding, or
 *   {@link Malformed}.
 */
export const decodeValue = (
  entries: readonly Entry[],
  binding: ValueBinding,
  options: DecodeOptions = {},
): Result.Result<Value, Malformed> => {
  if (options.absent !== undefined && !postedFor(entries, binding)) {
    return Result.succeed(options.absent);
  }

  const read = isFile(binding.baseType)
    ? readFile(entries, binding)
    : Result.flatMap(postedTexts(entries, binding.name, binding.cardinality), (texts) =>
        readValue(texts, binding, options.base ?? 10, options.blankIsEmpty ?? false),
      );

  return Result.mapError(read, (reason) => new Malformed({ entry: binding.name, reason }));
};

/**
 * Decode the entries a form posted under a record binding, as {@link decode} reads them.
 *
 * @param entries The posted entries.
 * @param binding The response's record binding.
 * @param options Whether a string of white space alone is NULL ({@link DecodeOptions}); a record
 *   takes no base and no absent value.
 * @returns The record, or {@link Malformed}.
 */
export const decodeRecord = (
  entries: readonly Entry[],
  binding: RecordBinding,
  options: DecodeOptions = {},
): Result.Result<RecordValue, Malformed> =>
  Result.mapError(
    Result.flatMap(postedTexts(entries, binding.name, binding.cardinality), (texts) =>
      readRecord(texts, options.blankIsEmpty ?? false),
    ),
    (reason) => new Malformed({ entry: binding.name, reason }),
  );

/**
 * Decode the entries a form posted as a value of one binding.
 *
 * Only the entries named for the binding are read. Text holding a character outside XML 1.0's
 * `Char` production is refused, so a decoded value is one a result can hold. No entry, or one empty
 * entry, is NULL, except that no entry at all under a value binding is the `absent` option's value
 * when the caller gives one ({@link DecodeOptions}): the value the interaction's module says its
 * response takes when the form posted nothing for it, End Attempt's `false` among them. A number
 * is trimmed, then read as an integer in `base` or as a decimal with an
 * optional exponent. A posted integer is exact at any size, in every base from 2 to 36, and in a
 * base other than 2, 8, 10 or 16 it is read in time subquadratic in its digits. A posted float
 * follows the value model's lexical rules, as content does, and is refused when it is not finite:
 * `INF`, `-INF`, `NaN`, and a decimal beyond the largest double, which reads as an infinity of its
 * sign (reading 144). An identifier must be an NCName. A string has CRLF and a
 * lone CR turned into LF, as a textarea's value has, so a value holds LF line breaks only; under
 * the `blankIsEmpty` option a string of XML white space alone is no value, as QTI reads a `plain`
 * or `preformatted` text. A boolean is `true` or `false`, as written. A point is two whole numbers
 * separated by white space, x then y, as written and in base 10 whatever `base` says: one entry
 * per value under the binding's name, as for a pair, so a point response `R` and a response `R.x`
 * never read each other's entries.
 *
 * A file binding reads NULL: no form plate renders posts a file, so an entry under its name is
 * text, refused as `file-text`.
 *
 * A record binding reads one text, kept as the record's `stringValue` field with its line breaks
 * made LF, and, when the text trimmed of XML whitespace is a decimal number with an optional
 * exponent, the fields `floatValue`, `integerValue` (only for a whole number with no exponent),
 * `leftDigits`, `rightDigits`, `ndp`, `nsf` and `exponent` (only when written), every integer
 * exact. Text that is not such a number, `INF`, `-INF` and `NaN` among it, gives `stringValue`
 * alone; empty text, and under `blankIsEmpty` text of XML white space alone, gives a NULL record,
 * with no field. `base` is not applied.
 *
 * @example
 *   decode([["i.R", "1.5e3"]], { cardinality: "record", name: "i.R" });
 *   // A record: stringValue "1.5e3", floatValue 1500, leftDigits 1, rightDigits 1, ndp -2,
 *   // nsf 2, exponent 3.
 *
 * @param entries The posted entries.
 * @param binding The response's binding.
 * @param options The number base of an integer, and the value no entry takes, which a record
 *   binding ignores, and whether a string of white space alone is NULL.
 * @returns A value of the binding's base type for a {@link ValueBinding}, a record for a
 *   {@link RecordBinding}, or {@link Malformed}: `file-text` for text under a file binding,
 *   `single-many` for two entries of a `single` or a record, `character` for text holding a
 *   character XML cannot carry, and `number`, `identifier`, `boolean` or `point` for text outside
 *   the base type's lexical space.
 */
export const decode = (
  entries: readonly Entry[],
  binding: Binding,
  options: DecodeOptions = {},
): Result.Result<ResponseValue, Malformed> =>
  binding.cardinality === "record"
    ? decodeRecord(entries, binding, options)
    : decodeValue(entries, binding, options);

/**
 * Posted entries split by owner.
 */
export interface Partition {
  /**
   * Entries named for this item instance.
   */
  readonly own: readonly Entry[];
  /**
   * Every other entry, the host's: its own fields and any other instance's, which the core ignores.
   */
  readonly host: readonly Entry[];
}

/**
 * Split posted entries into this instance's and the rest, which are the host's.
 *
 * The host names every instance, so only it knows which of the rest another item instance on its
 * page posted: an entry named for one reads as a host field here, and the host reads it with that
 * instance's own `partition`.
 *
 * @param entries The posted entries, in order.
 * @param instance This item instance's token, any that {@link checkInstance} passes.
 * @returns The entries in posted order, by owner: a name beginning `<instance>.`, one
 *   {@link responseOf} reads a response from, is this instance's; every other name is the host's.
 */
export const partition = (entries: readonly Entry[], instance: string): Partition => {
  const owns = ([name]: Entry): boolean => Option.isSome(responseOf(instance, name));

  return {
    host: entries.filter((entry) => !owns(entry)),
    own: entries.filter(owns),
  };
};
