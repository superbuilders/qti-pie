/**
 * The compiler of an item's body (`qti-item-body`, §5.66) into the interactions response admission
 * judges (QTI 3.0.1 §7.19.7, reading `response-limits`): each interaction this package models,
 * bound to the response it declares, with its constraint attributes at QTI's defaults, the choices
 * and areas it presents, its image's authored size, and the feedback and template content that may
 * hide it.
 *
 * An interaction is modelled where its element binds a declared response of a cardinality and base
 * type its kind takes (the SQL grader's `module` table, `admission.sql`), and where none of its
 * kind's notices stands: an Extended Text's format outside plain, preformatted and xhtml; a
 * Graphic Gap Match, Select Point or Position Object without an image; a Select Point whose image
 * writes no size; a Slider with an infinite bound or step; a Position Object outside a stage whose
 * first element is an image of both dimensions, or with neither a centre point nor a sized image.
 * Any other element is no interaction admission judges.
 *
 * @module
 */
import { collapsed } from "@bjornpagen/grizzle-text/text";
import { buildNfa } from "@bjornpagen/grizzle-text/regex/nfa";
import { Matcher } from "@bjornpagen/grizzle-text/regex/match";
import { xsdPattern } from "@bjornpagen/grizzle-text/regex/xsd";
import { regex } from "arkregex";
import { readBoolean, readDouble, readInteger } from "#processing/lexical.ts";
import { checked } from "#processing/operators/operator.ts";
import type { Checked, Refusal } from "#processing/operators/operator.ts";
import type { Declaration } from "#processing/program.ts";
import type { BaseType } from "#processing/value.ts";
import { attributeOf } from "#processing/xml.ts";
import type { XmlElement } from "#processing/xml.ts";

/**
 * Content that shows by a variable's identifier values: a feedback block or inline by an outcome's,
 * template content or a choice by a template variable's (§5.54, §5.148). It is closed where its
 * identifier is among the variable's values and it hides, or is not and it shows.
 */
export interface Gate {
  readonly hides: boolean;
  readonly identifier: string;
  readonly variable: string;
}

/**
 * A choice an interaction presents, and the template gate of its own, if any.
 */
export interface Choice {
  readonly gate: Gate | undefined;
  readonly identifier: string;
}

/**
 * A choice or an area with association limits: `match-max` (QTI requires it; 0 is no limit),
 * `match-min` (default 0) and `match-group`'s identifiers.
 */
export interface Associable {
  readonly identifier: string;
  readonly matchGroup: readonly string[];
  readonly matchMax: bigint | undefined;
  readonly matchMin: bigint;
  /**
   * The element's place, which orders a reason about it.
   */
  readonly place: number;
}

/**
 * An image's authored size, in whole pixels above 0.
 */
export interface Size {
  readonly height: number;
  readonly width: number;
}

/**
 * A text interaction's `pattern-mask`, as written, and its matcher: an XML Schema regular
 * expression (§5.48.4, §5.162.4; XML Schema Part 2 Appendix F), anchored at both ends; none where
 * the mask is no Appendix F expression, which QTI gives no meaning.
 */
export interface PatternMask {
  readonly matcher: Matcher | undefined;
  readonly written: string;
}

/**
 * What every interaction carries: its kind, its element's place, the response it binds and the
 * gates of the content that holds it.
 */
interface Common<K extends string> {
  readonly gates: readonly Gate[];
  readonly kind: K;
  readonly place: number;
  readonly response: string;
}

/**
 * An interaction admission judges, by kind.
 */
export type Interaction =
  | (Common<"associate"> & {
      readonly choices: readonly Associable[];
      readonly maxAssociations: bigint;
      readonly minAssociations: bigint;
    })
  | (Common<"choice" | "hotspot" | "hottext"> & {
      readonly choices: readonly Choice[];
      readonly maxChoices: bigint;
      readonly minChoices: bigint;
    })
  | (Common<"end-attempt"> & {
      /**
       * Whether ending the attempt through it counts an attempt (default true, reading
       * `end-attempt-count`).
       */
      readonly countAttempt: boolean;
    })
  | (Common<"extended-text"> & {
      readonly mask: PatternMask | undefined;
      readonly maxStrings: bigint | undefined;
      readonly minStrings: bigint;
      readonly xhtml: boolean;
    })
  | (Common<"gap-match"> & {
      readonly gaps: readonly (Choice & {
        readonly matchGroup: readonly string[];
        readonly place: number;
        readonly required: boolean;
      })[];
      readonly maxAssociations: bigint;
      readonly minAssociations: bigint;
      readonly sources: readonly (Associable & Choice)[];
    })
  | (Common<"graphic-associate"> & {
      readonly areas: readonly Associable[];
      readonly maxAssociations: bigint;
      readonly minAssociations: bigint;
    })
  | (Common<"graphic-gap-match"> & {
      readonly areas: readonly Associable[];
      readonly choices: readonly Associable[];
      readonly maxAssociations: bigint;
      readonly minAssociations: bigint;
    })
  | (Common<"graphic-order"> & {
      readonly areas: readonly string[];
      readonly maxChoices: bigint | undefined;
      readonly minChoices: bigint | undefined;
    })
  | (Common<"inline-choice"> & {
      readonly choices: readonly Choice[];
      readonly minChoices: bigint;
      readonly required: boolean;
    })
  | (Common<"match"> & {
      readonly maxAssociations: bigint;
      readonly minAssociations: bigint;
      readonly sources: readonly (Associable & Choice)[];
      readonly targets: readonly (Associable & Choice)[];
    })
  | (Common<"media"> & { readonly maxPlays: bigint; readonly minPlays: bigint })
  | (Common<"order"> & {
      readonly choices: readonly Choice[];
      readonly maxChoices: bigint | undefined;
      readonly minChoices: bigint | undefined;
    })
  | Common<"portable-custom">
  | (Common<"position-object"> & {
      readonly maxChoices: bigint;
      readonly minChoices: bigint;
      readonly stage: Size;
    })
  | (Common<"select-point"> & {
      readonly image: Size;
      readonly maxChoices: bigint;
      readonly minChoices: bigint;
      readonly single: boolean;
    })
  | (Common<"slider"> & {
      /**
       * The range a value may take: an integer slider's bounds outward to whole numbers.
       */
      readonly lower: number;
      /**
       * The step a value lies on from `lower`: the written one above 0, an integer slider's 1 where
       * it writes none.
       */
      readonly step: number | undefined;
      readonly upper: number;
    })
  | (Common<"text-entry"> & { readonly mask: PatternMask | undefined });

/**
 * The response bindings each interaction element takes: the cardinalities, and but for a record the
 * base types (the SQL grader's `module` table).
 */
const bindings = {
  "qti-associate-interaction": {
    bases: ["pair"],
    cardinalities: ["single", "multiple"],
    section: "5.8",
  },
  "qti-choice-interaction": {
    bases: ["identifier"],
    cardinalities: ["single", "multiple"],
    section: "5.30",
  },
  "qti-end-attempt-interaction": { bases: ["boolean"], cardinalities: ["single"], section: "5.45" },
  "qti-extended-text-interaction": {
    bases: ["string", "integer", "float"],
    cardinalities: ["single", "multiple", "ordered", "record"],
    section: "5.48",
  },
  "qti-gap-match-interaction": {
    bases: ["directedPair"],
    cardinalities: ["single", "multiple"],
    section: "5.57",
  },
  "qti-graphic-associate-interaction": {
    bases: ["pair"],
    cardinalities: ["single", "multiple"],
    section: "5.59",
  },
  "qti-graphic-gap-match-interaction": {
    bases: ["directedPair"],
    cardinalities: ["multiple"],
    section: "5.60",
  },
  "qti-graphic-order-interaction": {
    bases: ["identifier"],
    cardinalities: ["ordered"],
    section: "5.61",
  },
  "qti-hotspot-interaction": {
    bases: ["identifier"],
    cardinalities: ["single", "multiple"],
    section: "5.68",
  },
  "qti-hottext-interaction": {
    bases: ["identifier"],
    cardinalities: ["single", "multiple"],
    section: "5.66",
  },
  "qti-inline-choice-interaction": {
    bases: ["identifier"],
    cardinalities: ["single"],
    section: "5.74",
  },
  "qti-match-interaction": {
    bases: ["directedPair"],
    cardinalities: ["single", "multiple"],
    section: "5.89",
  },
  "qti-media-interaction": { bases: ["integer"], cardinalities: ["single"], section: "5.92" },
  "qti-order-interaction": { bases: ["identifier"], cardinalities: ["ordered"], section: "5.97" },
  "qti-portable-custom-interaction": {
    bases: [
      "identifier",
      "boolean",
      "integer",
      "float",
      "string",
      "point",
      "pair",
      "directedPair",
      "duration",
      "file",
      "uri",
    ],
    cardinalities: ["single", "multiple", "ordered", "record"],
    section: "5.106",
  },
  "qti-position-object-interaction": {
    bases: ["point"],
    cardinalities: ["multiple", "single"],
    section: "5.107",
  },
  "qti-select-point-interaction": {
    bases: ["point"],
    cardinalities: ["multiple", "single"],
    section: "5.128",
  },
  "qti-slider-interaction": {
    bases: ["integer", "float"],
    cardinalities: ["single"],
    section: "5.134",
  },
  "qti-text-entry-interaction": {
    bases: ["string", "integer", "float"],
    cardinalities: ["single", "record"],
    section: "5.162",
  },
} as const satisfies Readonly<
  Record<
    string,
    {
      readonly bases: readonly BaseType[];
      readonly cardinalities: readonly ("multiple" | "ordered" | "record" | "single")[];
      readonly section: string;
    }
  >
>;

/**
 * An interaction element's name.
 */
type InteractionElement = keyof typeof bindings;

/**
 * Whether a name is an interaction element's.
 *
 * @param local - The name.
 * @returns Whether it is.
 */
const isInteraction = (local: string): local is InteractionElement =>
  Object.hasOwn(bindings, local);

/**
 * The elements that gate the content they hold by a variable's values.
 */
const gateElements: ReadonlySet<string> = new Set([
  "qti-feedback-block",
  "qti-feedback-inline",
  "qti-template-block",
  "qti-template-inline",
]);

/**
 * An element's element children, in any namespace, in document order.
 *
 * @param element - The element.
 * @returns Its element children.
 */
const elementChildren = (element: XmlElement): readonly XmlElement[] =>
  element.children.filter((child): child is XmlElement => child.kind === "element");

/**
 * An element's element descendants, in document order.
 *
 * @param element - The element.
 * @returns Its descendants.
 */
const descendants = (element: XmlElement): readonly XmlElement[] =>
  elementChildren(element).flatMap((child) => [child, ...descendants(child)]);

/**
 * A trimmed, collapsed attribute, or `undefined` where unwritten.
 *
 * @param element - The element.
 * @param name - The attribute.
 * @returns Its value.
 */
const written = (element: XmlElement, name: string): string | undefined => {
  const value = attributeOf(element, name);

  return value === undefined ? undefined : collapsed(value);
};

/**
 * An integer attribute, or its default where unwritten or no integer.
 *
 * @param element - The element.
 * @param name - The attribute.
 * @param fallback - Its default.
 * @returns The integer.
 */
const integerOf = (element: XmlElement, name: string, fallback: bigint): bigint => {
  const value = written(element, name);

  return value === undefined ? fallback : (readInteger(value) ?? fallback);
};

/**
 * An integer attribute, or `undefined` where unwritten or no integer.
 *
 * @param element - The element.
 * @param name - The attribute.
 * @returns The integer.
 */
const optionalInteger = (element: XmlElement, name: string): bigint | undefined => {
  const value = written(element, name);

  return value === undefined ? value : readInteger(value);
};

/**
 * A boolean attribute, or its default.
 *
 * @param element - The element.
 * @param name - The attribute.
 * @param fallback - Its default.
 * @returns The boolean.
 */
const booleanOf = (element: XmlElement, name: string, fallback: boolean): boolean => {
  const value = written(element, name);

  return value === undefined ? fallback : (readBoolean(value) ?? fallback);
};

/**
 * A float attribute, or `undefined`.
 *
 * @param element - The element.
 * @param name - The attribute.
 * @returns The double.
 */
const doubleOf = (element: XmlElement, name: string): number | undefined => {
  const value = written(element, name);

  return value === undefined ? undefined : readDouble(value);
};

/**
 * The gate an element is, where it is one: a feedback or template element, or a choice that writes
 * a `template-identifier` (show-hide's default is show).
 *
 * @param element - The element.
 * @returns The gate, or `undefined`.
 */
const gateOf = (element: XmlElement): Gate | undefined => {
  const variable =
    written(element, "outcome-identifier") ?? written(element, "template-identifier");
  const identifier = written(element, "identifier");

  return variable === undefined || identifier === undefined
    ? undefined
    : { hides: written(element, "show-hide") === "hide", identifier, variable };
};

/**
 * JavaScript's white space and line terminators, as `String.prototype.trim` reads them.
 */
const jsSpace = regex(
  "^[\\t\\n\\v\\f\\r \\u00A0\\u1680\\u2000-\\u200A\\u2028\\u2029\\u202F\\u205F\\u3000\\uFEFF]+|[\\t\\n\\v\\f\\r \\u00A0\\u1680\\u2000-\\u200A\\u2028\\u2029\\u202F\\u205F\\u3000\\uFEFF]+$",
  "gu",
);

/**
 * Whole digits.
 */
const digits = regex("^[0-9]+$", "u");

/**
 * An image's authored dimension as plate reads it: whole pixels above 0, JavaScript's white space
 * around them.
 *
 * @param element - The image.
 * @param name - `width` or `height`.
 * @returns The pixels, or `undefined`.
 */
const pixelsOf = (element: XmlElement, name: string): number | undefined => {
  const value = (attributeOf(element, name) ?? "").replaceAll(jsSpace, "");
  if (!digits.test(value)) {
    return undefined;
  }

  const pixels = Number(value);

  return pixels > 0 ? pixels : undefined;
};

/**
 * The image elements.
 */
const imageElements: ReadonlySet<string> = new Set(["img", "object", "picture"]);

/**
 * An element's image: its first child `img`, `picture` or `object`.
 *
 * @param element - The element.
 * @returns The image, or `undefined`.
 */
const imageOf = (element: XmlElement): XmlElement | undefined =>
  elementChildren(element).find((child) => imageElements.has(child.local));

/**
 * An image's authored size where it writes both dimensions: a picture's first `img` carries it.
 *
 * @param image - The image.
 * @returns The size, or `undefined`.
 */
const sizeOf = (image: XmlElement | undefined): Size | undefined => {
  const sized =
    image?.local === "picture"
      ? elementChildren(image).find((child) => child.local === "img")
      : image;
  if (sized === undefined) {
    return undefined;
  }

  const width = pixelsOf(sized, "width");
  const height = pixelsOf(sized, "height");

  return width === undefined || height === undefined ? undefined : { height, width };
};

/**
 * A text interaction's pattern mask, compiled.
 *
 * @param element - The interaction.
 * @returns The mask, or `undefined` where it writes none.
 */
const maskOf = (element: XmlElement): PatternMask | undefined => {
  const mask = attributeOf(element, "pattern-mask");
  if (mask === undefined) {
    return undefined;
  }

  const pattern = xsdPattern(mask);

  return { matcher: pattern.ok ? Matcher.of(buildNfa(pattern.value)) : undefined, written: mask };
};

/**
 * What the body reader reads with.
 */
interface Reading {
  readonly declarations: ReadonlyMap<string, Declaration>;
  readonly placeOf: (element: XmlElement) => number;
}

/**
 * The choices of some kinds an interaction holds, at any depth, each with its own template gate.
 *
 * @param element - The interaction.
 * @param kinds - The choice elements' names.
 * @returns The choices, in document order.
 */
const choicesOf = (element: XmlElement, kinds: readonly string[]): readonly Choice[] =>
  descendants(element)
    .filter((child) => kinds.includes(child.local))
    .map((child) => ({ gate: gateOf(child), identifier: written(child, "identifier") ?? "" }));

/**
 * One associable element.
 *
 * @param child - The element.
 * @param reading - The reader's context.
 * @returns It with its limits.
 */
const associableOf = (child: XmlElement, reading: Reading): Associable => ({
  identifier: written(child, "identifier") ?? "",
  matchGroup: (written(child, "match-group") ?? "").split(" ").filter((token) => token !== ""),
  matchMax: optionalInteger(child, "match-max"),
  matchMin: integerOf(child, "match-min", 0n),
  place: reading.placeOf(child),
});

/**
 * The associable children of some kinds an interaction holds directly.
 *
 * @param element - The interaction or a match set.
 * @param kinds - The children's names.
 * @param reading - The reader's context.
 * @returns Each with its limits, in document order.
 */
const associablesOf = (
  element: XmlElement,
  kinds: readonly string[],
  reading: Reading,
): readonly Associable[] =>
  elementChildren(element)
    .filter((child) => kinds.includes(child.local))
    .map((child) => associableOf(child, reading));

/**
 * The presented associable choices of some kinds an interaction holds at any depth, each with its
 * own template gate.
 *
 * @param element - The interaction.
 * @param kinds - The choice elements' names.
 * @param reading - The reader's context.
 * @returns The choices, in document order.
 */
const gatedAssociables = (
  element: XmlElement,
  kinds: readonly string[],
  reading: Reading,
): readonly (Associable & Choice)[] =>
  descendants(element)
    .filter((child) => kinds.includes(child.local))
    .map((child) => ({ ...associableOf(child, reading), gate: gateOf(child) }));

/**
 * A slider's step: the written one above 0, an integer slider's 1 where it writes none.
 *
 * @param step - The written step.
 * @param integer - Whether the slider is an integer one.
 * @returns The step, or `undefined`.
 */
const stepOf = (step: number | undefined, integer: boolean): number | undefined => {
  if (step !== undefined && step > 0) {
    return step;
  }

  return integer ? 1 : undefined;
};

/**
 * The reader of one interaction element: the interaction it is, or `undefined` where a notice of
 * its kind stands, or the refusal of content QTI 3.0.1 does not admit.
 */
type Reader = (input: ReadInput) => Interaction | Refusal | undefined;

/**
 * What an interaction element's reader reads: the element, what every interaction carries, the base
 * type of the response it binds (none for a record), its parent and the reader's context.
 */
interface ReadInput {
  readonly base: BaseType | undefined;
  readonly common: Omit<Common<string>, "kind">;
  readonly element: XmlElement;
  readonly parent: XmlElement | undefined;
  readonly reading: Reading;
}

/**
 * A reader's refusal of an interaction QTI 3.0.1 does not admit.
 *
 * @param code - Why.
 * @param input - What the reader read.
 * @param detail - What to change, citing the section.
 * @returns The refusal.
 */
const refusal = (code: Refusal["code"], { common }: ReadInput, detail: string): Refusal => ({
  code,
  detail,
  place: common.place,
});

/**
 * The reader of a Choice, a Hottext or a Hotspot interaction: picks of its choices of one element.
 */
const picksReader =
  (kind: "choice" | "hotspot" | "hottext", choice: string): Reader =>
  ({ common, element }) => ({
    ...common,
    choices: choicesOf(element, [choice]),
    kind,
    maxChoices: integerOf(element, "max-choices", 1n),
    minChoices: integerOf(element, "min-choices", 0n),
  });

/**
 * Read `qti-inline-choice-interaction`.
 */
const readInlineChoice: Reader = ({ common, element }) => ({
  ...common,
  choices: choicesOf(element, ["qti-inline-choice"]),
  kind: "inline-choice",
  minChoices: integerOf(element, "min-choices", 0n),
  required: booleanOf(element, "required", false),
});

/**
 * Read `qti-match-interaction`.
 */
const readMatch: Reader = ({ common, element, reading }) => {
  const sets = elementChildren(element).filter((child) => child.local === "qti-simple-match-set");
  const last = sets.at(-1);

  return {
    ...common,
    kind: "match",
    maxAssociations: integerOf(element, "max-associations", 1n),
    minAssociations: integerOf(element, "min-associations", 0n),
    sources: sets
      .filter((set) => set !== last)
      .flatMap((set) => gatedAssociables(set, ["qti-simple-associable-choice"], reading)),
    targets:
      last === undefined ? [] : gatedAssociables(last, ["qti-simple-associable-choice"], reading),
  };
};

/**
 * Read `qti-gap-match-interaction`.
 */
const readGapMatch: Reader = ({ common, element, reading }) => ({
  ...common,
  gaps: descendants(element)
    .filter((child) => child.local === "qti-gap")
    .map((child) => ({
      gate: gateOf(child),
      identifier: written(child, "identifier") ?? "",
      matchGroup: (written(child, "match-group") ?? "").split(" ").filter((token) => token !== ""),
      place: reading.placeOf(child),
      required: booleanOf(child, "required", false),
    })),
  kind: "gap-match",
  maxAssociations: integerOf(element, "max-associations", 1n),
  minAssociations: integerOf(element, "min-associations", 0n),
  sources: gatedAssociables(element, ["qti-gap-text", "qti-gap-img"], reading),
});

/**
 * Read `qti-order-interaction`.
 */
const readOrder: Reader = ({ common, element }) => ({
  ...common,
  choices: choicesOf(element, ["qti-simple-choice"]),
  kind: "order",
  maxChoices: optionalInteger(element, "max-choices"),
  minChoices: optionalInteger(element, "min-choices"),
});

/**
 * Read `qti-associate-interaction`.
 */
const readAssociate: Reader = ({ common, element, reading }) => ({
  ...common,
  choices: associablesOf(element, ["qti-simple-associable-choice"], reading),
  kind: "associate",
  maxAssociations: integerOf(element, "max-associations", 1n),
  minAssociations: integerOf(element, "min-associations", 0n),
});

/**
 * Read `qti-graphic-associate-interaction`.
 */
const readGraphicAssociate: Reader = ({ common, element, reading }) => ({
  ...common,
  areas: associablesOf(element, ["qti-associable-hotspot"], reading),
  kind: "graphic-associate",
  maxAssociations: integerOf(element, "max-associations", 1n),
  minAssociations: integerOf(element, "min-associations", 0n),
});

/**
 * Read `qti-graphic-gap-match-interaction`.
 */
const readGraphicGapMatch: Reader = (input) => {
  const { common, element, reading } = input;

  return imageOf(element) === undefined
    ? refusal(
        "element",
        input,
        "give the graphic gap match interaction its image, an object, img or picture child (QTI 3.0.1 §5.60.7, imageSelection [1]); qti-object is no QTI element",
      )
    : {
        ...common,
        areas: associablesOf(element, ["qti-associable-hotspot"], reading),
        choices: associablesOf(element, ["qti-gap-text", "qti-gap-img"], reading),
        kind: "graphic-gap-match",
        maxAssociations: integerOf(element, "max-associations", 1n),
        minAssociations: integerOf(element, "min-associations", 0n),
      };
};

/**
 * Read `qti-graphic-order-interaction`.
 */
const readGraphicOrder: Reader = ({ common, element }) => ({
  ...common,
  areas: elementChildren(element)
    .filter((child) => child.local === "qti-hotspot-choice")
    .map((child) => written(child, "identifier") ?? ""),
  kind: "graphic-order",
  maxChoices: optionalInteger(element, "max-choices"),
  minChoices: optionalInteger(element, "min-choices"),
});

/**
 * Read `qti-position-object-interaction`.
 */
const readPositionObject: Reader = (input) => {
  const { common, element, parent } = input;
  if (parent?.local !== "qti-position-object-stage") {
    return refusal(
      "element",
      input,
      "place the position object interaction in a qti-position-object-stage, its one parent class (QTI 3.0.1 §5.107)",
    );
  }

  const [stageImage] = elementChildren(parent);
  if (stageImage === undefined || !imageElements.has(stageImage.local)) {
    return refusal(
      "element",
      input,
      "give the qti-position-object-stage its image, an object, img or picture first child (QTI 3.0.1 §5.108.3, imageSelection [1])",
    );
  }

  const image = imageOf(element);
  if (image === undefined) {
    return refusal(
      "element",
      input,
      "give the position object interaction its image, the object it places (QTI 3.0.1 §5.107)",
    );
  }

  const stageSize = sizeOf(stageImage);
  const centred = written(element, "center-point") !== undefined || sizeOf(image) !== undefined;

  return stageSize === undefined || !centred
    ? undefined
    : {
        ...common,
        kind: "position-object",
        maxChoices: integerOf(element, "max-choices", 1n),
        minChoices: integerOf(element, "min-choices", 0n),
        stage: stageSize,
      };
};

/**
 * Read `qti-select-point-interaction`.
 */
const readSelectPoint: Reader = (input) => {
  const { common, element, reading } = input;
  const source = imageOf(element);
  if (source === undefined) {
    return refusal(
      "element",
      input,
      "give the select point interaction its image, an object, img or picture child (QTI 3.0.1 §5.128.3 to §5.128.5)",
    );
  }

  const image = sizeOf(source);

  return image === undefined
    ? undefined
    : {
        ...common,
        image,
        kind: "select-point",
        maxChoices: integerOf(element, "max-choices", 0n),
        minChoices: integerOf(element, "min-choices", 0n),
        single: reading.declarations.get(common.response)?.type.cardinality === "single",
      };
};

/**
 * Read `qti-slider-interaction`.
 */
const readSlider: Reader = (input) => {
  const { base, common, element } = input;
  const lower = doubleOf(element, "lower-bound");
  const upper = doubleOf(element, "upper-bound");
  const step = doubleOf(element, "step");
  if (lower === undefined || upper === undefined) {
    return refusal(
      "attribute",
      input,
      "write the slider interaction's lower-bound and upper-bound, each of multiplicity [1] (QTI 3.0.1 §5.134.1, §5.134.2)",
    );
  }

  if (
    !Number.isFinite(lower) ||
    !Number.isFinite(upper) ||
    (step !== undefined && !Number.isFinite(step))
  ) {
    return;
  }

  const integer = base === "integer";

  return {
    ...common,
    kind: "slider",
    lower: integer ? Math.floor(lower) : lower,
    step: stepOf(step, integer),
    upper: integer ? Math.ceil(upper) : upper,
  };
};

/**
 * Read `qti-media-interaction`.
 */
const readMedia: Reader = ({ common, element }) => ({
  ...common,
  kind: "media",
  maxPlays: integerOf(element, "max-plays", 0n),
  minPlays: integerOf(element, "min-plays", 0n),
});

/**
 * Read `qti-text-entry-interaction`.
 */
const readTextEntry: Reader = ({ common, element }) => ({
  ...common,
  kind: "text-entry",
  mask: maskOf(element),
});

/**
 * Read `qti-extended-text-interaction`.
 */
const readExtendedText: Reader = (input) => {
  const { common, element } = input;
  const format = written(element, "format") ?? "plain";

  return format === "plain" || format === "preformatted" || format === "xhtml"
    ? {
        ...common,
        kind: "extended-text",
        mask: maskOf(element),
        maxStrings: optionalInteger(element, "max-strings"),
        minStrings: integerOf(element, "min-strings", 0n),
        xhtml: format === "xhtml",
      }
    : refusal(
        "attribute",
        input,
        `write the extended text interaction's format as plain, preformatted or xhtml (QTI 3.0.1 §5.48.9); ${format} is none`,
      );
};

/**
 * Read `qti-end-attempt-interaction`.
 */
const readEndAttempt: Reader = ({ common, element }) => ({
  ...common,
  countAttempt: booleanOf(element, "count-attempt", true),
  kind: "end-attempt",
});

/**
 * Read `qti-portable-custom-interaction`.
 */
const readPortableCustom: Reader = ({ common }) => ({ ...common, kind: "portable-custom" });

/**
 * Each interaction element's reader.
 */
const readers: Readonly<Record<InteractionElement, Reader>> = {
  "qti-associate-interaction": readAssociate,
  "qti-choice-interaction": picksReader("choice", "qti-simple-choice"),
  "qti-end-attempt-interaction": readEndAttempt,
  "qti-extended-text-interaction": readExtendedText,
  "qti-gap-match-interaction": readGapMatch,
  "qti-graphic-associate-interaction": readGraphicAssociate,
  "qti-graphic-gap-match-interaction": readGraphicGapMatch,
  "qti-graphic-order-interaction": readGraphicOrder,
  "qti-hotspot-interaction": picksReader("hotspot", "qti-hotspot-choice"),
  "qti-hottext-interaction": picksReader("hottext", "qti-hottext"),
  "qti-inline-choice-interaction": readInlineChoice,
  "qti-match-interaction": readMatch,
  "qti-media-interaction": readMedia,
  "qti-order-interaction": readOrder,
  "qti-portable-custom-interaction": readPortableCustom,
  "qti-position-object-interaction": readPositionObject,
  "qti-select-point-interaction": readSelectPoint,
  "qti-slider-interaction": readSlider,
  "qti-text-entry-interaction": readTextEntry,
};

/**
 * Whether a declaration is a binding an interaction element takes.
 *
 * @param local - The element's name.
 * @param declaration - The declaration its `response-identifier` names.
 * @returns Whether it binds.
 */
const binds = (local: InteractionElement, declaration: Declaration | undefined): boolean => {
  if (declaration?.role !== "response") {
    return false;
  }

  const binding: {
    readonly bases: readonly BaseType[];
    readonly cardinalities: readonly string[];
  } = bindings[local];
  const { type } = declaration;

  return (
    binding.cardinalities.includes(type.cardinality) &&
    (type.cardinality === "record" || binding.bases.includes(type.base))
  );
};

/**
 * An interaction element's own interaction: refused where its response-identifier names no response
 * declaration (QTI 3.0.1 §5.115: "Response variables are declared by response declarations and
 * bound to interactions in the itemBody"; §5.15.7 and its siblings, response-identifier of
 * multiplicity [1]), or binds one of a type its class does not take (its class's binding sentence,
 * reading `binding-cardinality`), the order interaction alone excepted, whose class states no
 * binding (reading `order-binding`); otherwise what its reader reads.
 *
 * @param local - The interaction element's name.
 * @param input - What its reader reads.
 * @param declaration - The declaration its response-identifier names.
 * @returns The interaction, its refusal, or none where the package does not model it.
 */
const ownInteraction = (
  local: InteractionElement,
  input: ReadInput,
  declaration: Declaration | undefined,
): Interaction | Refusal | undefined => {
  const { response } = input.common;
  if (declaration?.role !== "response") {
    return refusal(
      "unknown-identifier",
      input,
      `declare the response ${local} binds: ${response === "" ? "it names none" : `${response} declares no response`} (QTI 3.0.1 §5.115, §5.15.7)`,
    );
  }

  if (binds(local, declaration)) {
    return readers[local](input);
  }

  if (local === "qti-order-interaction") {
    return undefined;
  }

  const binding: { readonly section: string } = bindings[local];
  const { type } = declaration;

  return refusal(
    "response-binding",
    input,
    `bind ${local} to a response of a cardinality and base type its class takes (QTI 3.0.1 §${binding.section}); ${response} is of ${type.cardinality === "record" ? "record" : `${type.cardinality} ${type.base}`}`,
  );
};

/**
 * Every interaction of an element's content, in document order, with the gates that hold it.
 *
 * @param element - The element.
 * @param parent - Its parent.
 * @param gates - The gates of the content that holds it.
 * @param reading - The reader's context.
 * @returns The interactions, or the first refusal.
 */
const walk = (
  element: XmlElement,
  parent: XmlElement | undefined,
  gates: readonly Gate[],
  reading: Reading,
): Checked<readonly Interaction[]> => {
  const gate = gateElements.has(element.local) ? gateOf(element) : undefined;
  const held = gate === undefined ? gates : [...gates, gate];
  const { local } = element;
  const response = written(element, "response-identifier") ?? "";
  const declaration = reading.declarations.get(response);
  const interactions: Interaction[] = [];
  if (isInteraction(local)) {
    const own = ownInteraction(
      local,
      {
        base: declaration?.type.cardinality === "record" ? undefined : declaration?.type.base,
        common: { gates: held, place: reading.placeOf(element), response },
        element,
        parent,
        reading,
      },
      declaration,
    );
    if (own !== undefined && "code" in own) {
      return { ok: false, refusal: own };
    }

    if (own !== undefined) {
      interactions.push(own);
    }
  }

  for (const child of elementChildren(element)) {
    const inner = walk(child, element, held, reading);
    if (!inner.ok) {
      return inner;
    }

    for (const interaction of inner.value) {
      interactions.push(interaction);
    }
  }

  return checked(interactions);
};

/**
 * The elements whose identifier no other element of their class bears in one item (QTI 3.0.1
 * §5.7.1, §5.55.1, §5.56.1, §5.58.1, §5.65.1, §5.67.1, §5.73.1, §5.131.1 and §5.132.1: "This
 * identifier must not be used by any other" element of its class, reading
 * `choice-identifier-scope`).
 */
const choiceClasses: ReadonlySet<string> = new Set([
  "qti-associable-hotspot",
  "qti-gap",
  "qti-gap-img",
  "qti-gap-text",
  "qti-hotspot-choice",
  "qti-hottext",
  "qti-inline-choice",
  "qti-simple-associable-choice",
  "qti-simple-choice",
]);

/**
 * The refusal of a body where two elements of one choice class share an identifier.
 *
 * @param body - The `qti-item-body`.
 * @param placeOf - Where each element stands.
 * @returns The refusal, or `undefined` where every identifier is its class's alone.
 */
const duplicateChoice = (
  body: XmlElement,
  placeOf: (element: XmlElement) => number,
): Refusal | undefined => {
  const seen = new Map<string, Set<string>>();
  const pending: XmlElement[] = [body];
  for (let next = pending.pop(); next !== undefined; next = pending.pop()) {
    if (choiceClasses.has(next.local)) {
      const identifier = written(next, "identifier") ?? "";
      const held = seen.get(next.local) ?? new Set<string>();
      if (held.has(identifier)) {
        return {
          code: "duplicate-identifier",
          detail: `give each ${next.local} an identifier of its own: ${identifier} is borne twice (QTI 3.0.1 §5.7.1 and its siblings, "This identifier must not be used by any other" choice of its class)`,
          place: placeOf(next),
        };
      }

      held.add(identifier);
      seen.set(next.local, held);
    }

    for (const child of elementChildren(next)) {
      pending.push(child);
    }
  }

  return undefined;
};

/**
 * The interactions of an item's body.
 *
 * @param body - The `qti-item-body`, if the item has one.
 * @param declarations - The item's declarations.
 * @param placeOf - Where each element stands.
 * @returns The interactions admission judges, in document order, or the first refusal.
 */
export const interactionsOf = (
  body: XmlElement | undefined,
  declarations: ReadonlyMap<string, Declaration>,
  placeOf: (element: XmlElement) => number,
): Checked<readonly Interaction[]> => {
  if (body === undefined) {
    return checked([]);
  }

  const duplicate = duplicateChoice(body, placeOf);

  return duplicate === undefined
    ? walk(body, undefined, [], { declarations, placeOf })
    : { ok: false, refusal: duplicate };
};
