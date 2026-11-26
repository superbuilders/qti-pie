/**
 * The bridge between the truths' one value form (a recorded value: base type, cardinality and
 * lexical singles) and `@qti-pie/processing`'s value model, both ways. A single that does not read
 * as its base type reads as NULL of its type, and the difference it makes shows where it moves.
 *
 * The page posts no file (no upload path exists), so a recorded file value, which the recording
 * writes by its name alone, reads as NULL: the value the app grades. A record value has no
 * recorded form (no truth records one) and is left out of a written map.
 *
 * @module
 */
import { container, isText, nullOf, single } from "@qti-pie/processing/value.ts";
import type {
  BaseType,
  Container,
  ContainerOf,
  DirectedPair,
  Null,
  Pair,
  Point,
  Scalars,
  Single,
  SingleOf,
  Text,
  Value,
} from "@qti-pie/processing/value.ts";
import { regex } from "arkregex";
import { doubleOf } from "#processing-oracle/lexical.ts";
import type { RecordedValue, RecordedValues } from "#processing-oracle/recording.ts";

/**
 * XML Schema's whitespace, which separates a two-part single's parts.
 */
const whitespace = regex("[ \\t\\n\\r]+", "u");

/**
 * An integer's lexical form.
 */
const integerForm = regex("^[+-]?[0-9]+$", "u");

/**
 * A two-part single's parts, split at whitespace, if it has exactly two non-empty ones.
 *
 * @param text The lexical form.
 * @returns Its two parts.
 */
const twoOf = (text: string): readonly [string, string] | undefined => {
  const parts = text
    .trim()
    .split(whitespace)
    .filter((part) => part.length > 0);
  const [first, second] = parts;

  return parts.length === 2 && first !== undefined && second !== undefined
    ? [first, second]
    : undefined;
};

/**
 * An integer's lexical form read, or undefined.
 *
 * @param text The lexical form.
 * @returns The integer.
 */
const integerOf = (text: string): bigint | undefined => {
  const trimmed = text.trim();

  return integerForm.test(trimmed) ? BigInt(trimmed) : undefined;
};

/**
 * A boolean's lexical form read, or undefined.
 *
 * @param text The lexical form.
 * @returns The boolean.
 */
const booleanOf = (text: string): boolean | undefined => {
  const trimmed = text.trim();
  if (trimmed === "true" || trimmed === "1") {
    return true;
  }

  return trimmed === "false" || trimmed === "0" ? false : undefined;
};

/**
 * A token's text (an identifier's or a URI's: its whitespace trimmed), if it is not empty.
 *
 * @param text The lexical form.
 * @returns The text.
 */
const tokenOf = (text: string): Text | undefined => {
  const trimmed = text.trim();

  return isText(trimmed) ? trimmed : undefined;
};

/**
 * A string's text, kept whole, if it is not empty.
 *
 * @param text The lexical form.
 * @returns The text.
 */
const stringOf = (text: string): Text | undefined => (isText(text) ? text : undefined);

/**
 * A pair's lexical form read, or undefined.
 *
 * @param text The lexical form.
 * @returns The pair.
 */
const pairOf = (text: string): Pair | undefined => {
  const two = twoOf(text);
  const first = two === undefined ? undefined : tokenOf(two[0]);
  const second = two === undefined ? undefined : tokenOf(two[1]);

  return first === undefined || second === undefined ? undefined : { first, second };
};

/**
 * A directed pair's lexical form read, or undefined.
 *
 * @param text The lexical form.
 * @returns The directed pair.
 */
const directedPairOf = (text: string): DirectedPair | undefined => {
  const pair = pairOf(text);

  return pair === undefined ? undefined : { source: pair.first, target: pair.second };
};

/**
 * A point's lexical form read, or undefined.
 *
 * @param text The lexical form.
 * @returns The point.
 */
const pointOf = (text: string): Point | undefined => {
  const two = twoOf(text);
  const x = two === undefined ? undefined : integerOf(two[0]);
  const y = two === undefined ? undefined : integerOf(two[1]);

  return x === undefined || y === undefined ? undefined : { x, y };
};

/**
 * Every single of a recorded value read, or undefined where one reads as none.
 *
 * @param texts The singles' lexical forms.
 * @param read The base type's reader.
 * @returns The scalars.
 */
const allOf = <S>(
  texts: readonly string[],
  read: (text: string) => S | undefined,
): readonly S[] | undefined => {
  const out: S[] = [];
  for (const text of texts) {
    const scalar = read(text);
    if (scalar === undefined) {
      return undefined;
    }

    out.push(scalar);
  }

  return out;
};

/**
 * A recorded value of one base type built in the package's model: a single's first scalar, a
 * container's every scalar; NULL of its type where it holds none or one reads as none.
 *
 * @param recorded The recorded value.
 * @param base The base type, the recorded value's.
 * @param read The base type's reader.
 * @returns The value.
 */
const built = <B extends BaseType>(
  recorded: RecordedValue,
  base: B,
  read: (text: string) => Scalars[B] | undefined,
): ContainerOf<B, "multiple"> | ContainerOf<B, "ordered"> | Null | SingleOf<B> => {
  const scalars = allOf(recorded.values, read);
  const [first] = scalars ?? [];
  if (scalars === undefined || first === undefined) {
    return nullOf({ base, cardinality: recorded.cardinality });
  }

  switch (recorded.cardinality) {
    case "single": {
      return single(base, first);
    }
    case "multiple": {
      return container("multiple", base, scalars);
    }
    case "ordered": {
      return container("ordered", base, scalars);
    }
  }
};

/**
 * A recorded value read into the package's model.
 *
 * @param recorded The recorded value.
 * @returns The value; NULL of its type where it holds no single or any single reads as none.
 */
export const valueOf = (recorded: RecordedValue): Value => {
  switch (recorded.baseType) {
    case "boolean": {
      return built(recorded, "boolean", booleanOf);
    }
    case "directedPair": {
      return built(recorded, "directedPair", directedPairOf);
    }
    case "duration": {
      return built(recorded, "duration", doubleOf);
    }
    case "file": {
      return nullOf({ base: "file", cardinality: recorded.cardinality });
    }
    case "float": {
      return built(recorded, "float", doubleOf);
    }
    case "identifier": {
      return built(recorded, "identifier", tokenOf);
    }
    case "integer": {
      return built(recorded, "integer", integerOf);
    }
    case "pair": {
      return built(recorded, "pair", pairOf);
    }
    case "point": {
      return built(recorded, "point", pointOf);
    }
    case "string": {
      return built(recorded, "string", stringOf);
    }
    case "uri": {
      return built(recorded, "uri", tokenOf);
    }
  }
};

/**
 * Recorded values read into the package's model, by identifier.
 *
 * @param recorded The recorded values.
 * @returns The values.
 */
export const valuesOf = (recorded: RecordedValues): ReadonlyMap<string, Value> =>
  new Map(Object.entries(recorded).map(([name, value]) => [name, valueOf(value)]));

/**
 * A double's lexical form: ECMAScript's shortest round-trip decimal, `-0` kept, QTI's names for
 * the infinities and NaN.
 *
 * @param double The double.
 * @returns Its lexical form.
 */
const doubleText = (double: number): string => {
  if (Number.isNaN(double)) {
    return "NaN";
  }

  if (!Number.isFinite(double)) {
    return double > 0 ? "INF" : "-INF";
  }

  return Object.is(double, -0) ? "-0" : String(double);
};

/**
 * The lexical forms of a single's or container's scalars, by its base type.
 *
 * @param value The single or container.
 * @returns Each scalar's lexical form, in order.
 */
const textsOf = (value: Container | Single): readonly string[] => {
  switch (value.base) {
    case "boolean": {
      return (value.kind === "single" ? [value.value] : value.values).map((b) =>
        b ? "true" : "false",
      );
    }
    case "integer": {
      return (value.kind === "single" ? [value.value] : value.values).map((n) => n.toString());
    }
    case "float":
    case "duration": {
      return (value.kind === "single" ? [value.value] : value.values).map(doubleText);
    }
    case "pair": {
      return (value.kind === "single" ? [value.value] : value.values).map(
        (p) => `${p.first} ${p.second}`,
      );
    }
    case "directedPair": {
      return (value.kind === "single" ? [value.value] : value.values).map(
        (p) => `${p.source} ${p.target}`,
      );
    }
    case "point": {
      return (value.kind === "single" ? [value.value] : value.values).map(
        (p) => `${p.x.toString()} ${p.y.toString()}`,
      );
    }
    case "file": {
      return (value.kind === "single" ? [value.value] : value.values).map((f) => f.name ?? "");
    }
    case "identifier":
    case "string":
    case "uri": {
      return (value.kind === "single" ? [value.value] : value.values).map((t) => t);
    }
  }
};

/**
 * A value of the package's model in its recorded form, or undefined for a record value.
 *
 * @param value The value.
 * @returns The recorded value.
 */
export const recordedOf = (value: Value): RecordedValue | undefined => {
  switch (value.kind) {
    case "null": {
      return value.type.cardinality === "record"
        ? undefined
        : { baseType: value.type.base, cardinality: value.type.cardinality, values: [] };
    }
    case "record": {
      return undefined;
    }
    case "single":
    case "multiple":
    case "ordered": {
      return { baseType: value.base, cardinality: value.kind, values: [...textsOf(value)] };
    }
  }
};

/**
 * Values of the package's model in their recorded form, by identifier, records left out.
 *
 * @param values The values.
 * @returns The recorded values.
 */
export const recordedValuesOf = (values: ReadonlyMap<string, Value>): RecordedValues =>
  Object.fromEntries(
    [...values].flatMap(([name, value]) => {
      const recorded = recordedOf(value);

      return recorded === undefined ? [] : [[name, recorded] as const];
    }),
  );
