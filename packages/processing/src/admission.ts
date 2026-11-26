/**
 * Response admission: the checks that refuse an answer before it is graded (QTI 3.0.1 §7.19.7,
 * ItemSessionControl's `validate-responses`: "An invalid response is defined to be a response which
 * does not satisfy the constraints imposed by the interaction with which it is associated ... When
 * validate-responses is turned on (true) then the candidates are not allowed to submit the item
 * until they have provided valid responses for all interactions"), as the SQL grader judged them
 * (`admission_one`, `@qti-pie/ledger`'s `machine/admission.sql`), moved here (D6).
 *
 * Each interaction's limits are of two tiers (reading 195): tier (a), a response no interaction's
 * controls let the candidate give, refused whatever `validate-responses` says; tier (b), what a
 * valid response needs, refused only under it. Admission judges responses, never content. The
 * values in force (the outcomes after the last attempt, the declared ones before the first, and the
 * session's template values) close the feedback and template content they gate, and an interaction
 * inside closed content is hidden: its response, where no shown interaction binds it too, is one
 * the grade ignores, as NULL.
 *
 * The reasons come in plate's order, numbered from 1, by the interaction's place, the check's rank
 * and the place within the check; each with the attributes its words name, by form, as plate's
 * `admission.ts` reads them back.
 *
 * @module
 */
import type {
  Associable,
  Choice,
  Gate,
  Interaction,
  PatternMask,
} from "#processing/compile/body.ts";
import type { CompiledItem } from "#processing/program.ts";
import { singlesOf } from "#processing/value.ts";
import type { Single, Value } from "#processing/value.ts";
import { textOfXhtml } from "#processing/xhtml.ts";

/**
 * The tier (a) codes: refused whatever `validate-responses` says.
 */
export const alwaysCodes = [
  "unknownChoice",
  "atMost",
  "atMostStrings",
  "matchRepeated",
  "matchChoiceAtMost",
  "matchNotInSourceGroup",
  "matchNotInTargetGroup",
  "gapMatchGapFull",
  "gapMatchChoiceAtMost",
  "gapMatchNotInChoiceGroup",
  "gapMatchNotInGapGroup",
  "orderRepeated",
  "orderAtMost",
  "associateUnknown",
  "associateItself",
  "associateRepeated",
  "associateChoiceAtMost",
  "associateOutsideGroup",
  "associateAtMost",
  "graphicAssociateUnknown",
  "graphicAssociateSelf",
  "graphicAssociateTwice",
  "graphicAssociateMatchMax",
  "graphicAssociateOutside",
  "graphicAssociateAtMost",
  "graphicGapMatchAreaAtMost",
  "graphicGapMatchChoiceAtMost",
  "graphicGapMatchNotInChoiceGroup",
  "graphicGapMatchNotInAreaGroup",
  "graphicOrderUnknown",
  "graphicOrderTwice",
  "graphicOrderAtMost",
  "positionObjectAtMost",
  "selectPointBelowZero",
  "selectPointAtMost",
  "sliderBelow",
  "sliderAbove",
  "sliderOffStep",
  "mediaNegative",
  "mediaAtMost",
] as const;

/**
 * The tier (b) codes: refused only under `validate-responses`.
 */
export const validatedCodes = [
  "atLeast",
  "patternMismatch",
  "atLeastStrings",
  "matchChoiceAtLeast",
  "gapMatchChoiceAtLeast",
  "gapMatchGapRequired",
  "orderAll",
  "orderAtLeast",
  "associateAtLeast",
  "associateChoiceAtLeast",
  "graphicAssociateAtLeast",
  "graphicAssociateMatchMin",
  "graphicGapMatchAreaAtLeast",
  "graphicGapMatchChoiceAtLeast",
  "graphicOrderAtLeast",
  "positionObjectOffStage",
  "positionObjectAtLeast",
  "selectPointBeyond",
  "selectPointAtLeast",
  "mediaAtLeast",
] as const;

/**
 * An admission code: the closed roster, tier (a)'s then tier (b)'s.
 */
export type AdmissionCode = (typeof alwaysCodes)[number] | (typeof validatedCodes)[number];

/**
 * A reason an answer breaks, at its place in plate's order (`ord`, from 1): its code, the
 * interaction it concerns (its element's place) and the response.
 */
export interface Reason {
  readonly code: AdmissionCode;
  readonly interaction: number;
  readonly ord: bigint;
  readonly response: string;
}

/**
 * A reason's word: a choice's, a gap's or an area's identifier (`subject`, `other`), a group's
 * members at their places from 1 (`group`), or an axis (`axis`).
 */
export interface ReasonWord {
  readonly name: "axis" | "group" | "other" | "subject";
  readonly ord: bigint;
  readonly place: bigint;
  readonly value: string;
}

/**
 * A reason's count: a limit (`n`), a point's place (`at`) or an image's extent (`extent`).
 */
export interface ReasonCount {
  readonly name: "at" | "extent" | "n";
  readonly ord: bigint;
  readonly value: bigint;
}

/**
 * A reason's number: a stage's size (`width`, `height`) or a slider's bound and step.
 */
export interface ReasonNumber {
  readonly name: "bound" | "height" | "step" | "width";
  readonly ord: bigint;
  readonly value: number;
}

/**
 * An answer's admission: every reason it breaks (none is an admitted answer), their attributes, and
 * the responses the values in force hide.
 */
export interface Admission {
  readonly counts: readonly ReasonCount[];
  readonly hidden: readonly string[];
  readonly numbers: readonly ReasonNumber[];
  readonly reasons: readonly Reason[];
  readonly words: readonly ReasonWord[];
}

/**
 * A reason as a check finds it, before it is numbered.
 */
interface Found {
  readonly code: AdmissionCode;
  readonly counts: readonly { readonly name: ReasonCount["name"]; readonly value: bigint }[];
  readonly numbers: readonly { readonly name: ReasonNumber["name"]; readonly value: number }[];
  readonly place: number;
  readonly rank: number;
  readonly response: string;
  readonly sub: number;
  readonly words: readonly {
    readonly name: ReasonWord["name"];
    readonly place: number;
    readonly value: string;
  }[];
}

/**
 * One posted value, at its place from 1.
 */
interface Posted {
  readonly place: number;
  readonly single: Single;
}

/**
 * A posted value's text: an identifier's or a string's as it is, an integer's digits, a float's
 * ECMAScript Number::toString (the SQL grader's `float_text`), a pair's first member.
 *
 * @param single - The value.
 * @returns Its text.
 */
const textOf = (single: Single): string => {
  switch (single.base) {
    case "identifier":
    case "string":
    case "uri": {
      return single.value;
    }
    case "integer": {
      return single.value.toString(10);
    }
    case "float":
    case "duration": {
      return String(single.value);
    }
    case "pair": {
      return single.value.first;
    }
    case "directedPair": {
      return single.value.source;
    }
    case "boolean": {
      return single.value ? "true" : "false";
    }
    case "point": {
      return `${String(single.value.x)} ${String(single.value.y)}`;
    }
    case "file": {
      return single.value.name ?? "";
    }
  }
};

/**
 * A response's posted values, each at its place from 1: a container's members in order, a single's
 * one, a record's `stringValue` field alone, none for NULL.
 *
 * @param value - The response's value, or `undefined` where none was posted.
 * @returns Its values.
 */
const postedOf = (value: Value | undefined): readonly Posted[] => {
  if (value === undefined) {
    return [];
  }

  switch (value.kind) {
    case "null": {
      return [];
    }
    case "single": {
      return [{ place: 1, single: value }];
    }
    case "multiple":
    case "ordered": {
      return singlesOf(value).map((single, index) => ({ place: index + 1, single }));
    }
    case "record": {
      const field = value.fields.find((each) => each.name === "stringValue");

      return field === undefined ? [] : [{ place: 1, single: field.value }];
    }
  }
};

/**
 * A pair's two identifiers, as posted: a pair's first and second, a directed pair's source and
 * target.
 *
 * @param single - The value.
 * @returns The two, or `undefined` for any other base type.
 */
const pairOf = (single: Single): readonly [string, string] | undefined => {
  if (single.base === "pair") {
    return [single.value.first, single.value.second];
  }

  return single.base === "directedPair" ? [single.value.source, single.value.target] : undefined;
};

/**
 * The posted pairs of a response.
 */
interface PostedPair {
  readonly a: string;
  readonly b: string;
  readonly place: number;
}

/**
 * The posted pairs of a response's values.
 *
 * @param posted - The values.
 * @returns The pairs among them.
 */
const pairsOf = (posted: readonly Posted[]): readonly PostedPair[] =>
  posted.flatMap(({ place, single }) => {
    const pair = pairOf(single);

    return pair === undefined ? [] : [{ a: pair[0], b: pair[1], place }];
  });

/**
 * A reason of a check, its attributes but the `subject` and `n` the common ones take.
 *
 * @param interaction - The interaction.
 * @param rank - The check's rank in plate's order.
 * @param sub - The place within the check.
 * @param code - The code.
 * @param attributes - The reason's words, counts and numbers.
 * @returns The reason.
 */
const found = (
  interaction: Interaction,
  rank: number,
  sub: number,
  code: AdmissionCode,
  attributes: Partial<Pick<Found, "counts" | "numbers" | "words">>,
): Found => ({
  code,
  counts: attributes.counts ?? [],
  numbers: attributes.numbers ?? [],
  place: interaction.place,
  rank,
  response: interaction.response,
  sub,
  words: attributes.words ?? [],
});

/**
 * A limit's count attribute.
 *
 * @param value - The limit.
 * @returns The `n` count.
 */
const limit = (value: bigint): Pick<Found, "counts"> => ({ counts: [{ name: "n", value }] });

/**
 * A subject word.
 *
 * @param value - The identifier.
 * @returns The `subject` word.
 */
const subject = (value: string): Found["words"][number] => ({ name: "subject", place: 1, value });

/**
 * An other word.
 *
 * @param value - The identifier.
 * @returns The `other` word.
 */
const other = (value: string): Found["words"][number] => ({ name: "other", place: 1, value });

/**
 * A group's members as words, at their places from 1.
 *
 * @param group - The members.
 * @returns The `group` words.
 */
const groupWords = (group: readonly string[]): Found["words"] =>
  group.map((value, index) => ({ name: "group", place: index + 1, value }));

/**
 * The checks of one shown interaction, given what the values in force present.
 */
interface Judging {
  readonly posted: readonly Posted[];
  readonly presents: (choice: Choice) => boolean;
}

/**
 * How many times a value occurs.
 *
 * @param values - The values.
 * @param value - The value.
 * @returns Its count.
 */
const count = <A>(values: readonly A[], holds: (value: A) => boolean): number =>
  values.filter(holds).length;

/**
 * A choice interaction's (and Hottext's and Hotspot's) checks: picks from the presented choices
 * (a pick of no presented choice, or one given twice), at most `max-choices` where above 0, at
 * least `min-choices`.
 *
 * @param interaction - The interaction.
 * @param judging - What is posted and presented.
 * @returns Its reasons.
 */
const picksReasons = (
  interaction: Extract<Interaction, { readonly kind: "choice" | "hotspot" | "hottext" }>,
  { posted, presents }: Judging,
): readonly Found[] => {
  const presented = new Set(
    interaction.choices.filter(presents).map((choice) => choice.identifier),
  );
  const texts = posted.map(({ single }) => textOf(single));
  const n = BigInt(texts.length);
  const reasons: Found[] = [];
  if (texts.some((text) => !presented.has(text)) || new Set(texts).size < texts.length) {
    reasons.push(found(interaction, 1, 0, "unknownChoice", {}));
  }

  if (interaction.maxChoices > 0n && n > interaction.maxChoices) {
    reasons.push(found(interaction, 2, 0, "atMost", limit(interaction.maxChoices)));
  }

  if (n < interaction.minChoices) {
    reasons.push(found(interaction, 3, 0, "atLeast", limit(interaction.minChoices)));
  }

  return reasons;
};

/**
 * An Inline Choice's checks: one of its presented choices; at least `min-choices`, or 1 where it is
 * required.
 *
 * @param interaction - The interaction.
 * @param judging - What is posted and presented.
 * @returns Its reasons.
 */
const inlineReasons = (
  interaction: Extract<Interaction, { readonly kind: "inline-choice" }>,
  { posted, presents }: Judging,
): readonly Found[] => {
  const presented = new Set(
    interaction.choices.filter(presents).map((choice) => choice.identifier),
  );
  const least = interaction.required && interaction.minChoices < 1n ? 1n : interaction.minChoices;
  const reasons: Found[] = [];
  if (posted.some(({ single }) => !presented.has(textOf(single)))) {
    reasons.push(found(interaction, 1, 0, "unknownChoice", {}));
  }

  if (BigInt(posted.length) < least) {
    reasons.push(found(interaction, 2, 0, "atLeast", limit(least)));
  }

  return reasons;
};

/**
 * The first place of each distinct key among items, in order of first place.
 *
 * @param items - The items, each with its key and place.
 * @returns Each key repeated, with the place it first came and the count.
 */
const repeated = <A extends { readonly place: number }>(
  items: readonly A[],
  keyOf: (item: A) => string,
): readonly { readonly first: A; readonly times: number }[] => {
  const groups = new Map<string, { first: A; times: number }>();
  for (const item of items) {
    const key = keyOf(item);
    const group = groups.get(key);
    if (group === undefined) {
      groups.set(key, { first: item, times: 1 });
    } else {
      group.times += 1;
    }
  }

  return [...groups.values()];
};

/**
 * Whether a group admits a partner: an empty group admits any.
 *
 * @param group - The group's members.
 * @param partner - The partner.
 * @returns Whether it does not.
 */
const outsideGroup = (group: readonly string[], partner: string): boolean =>
  group.length > 0 && !group.includes(partner);

/**
 * The match group of an identifier among associable elements: every element of that identifier's
 * members (where several write it, the members of each).
 *
 * @param elements - The elements.
 * @param identifier - The identifier.
 * @returns The group's members.
 */
const groupOf = (elements: readonly Associable[], identifier: string): readonly string[] =>
  elements.filter((each) => each.identifier === identifier).flatMap((each) => each.matchGroup);

/**
 * The match group of the last element of an identifier, which stands for it.
 *
 * @param elements - The elements.
 * @param identifier - The identifier.
 * @returns The group's members.
 */
const lastGroupOf = (elements: readonly Associable[], identifier: string): readonly string[] =>
  elements.findLast((each) => each.identifier === identifier)?.matchGroup ?? [];

/**
 * A Match's or a Gap Match's sides as the values in force present them.
 */
interface Sides {
  readonly interaction: Extract<Interaction, { readonly kind: "gap-match" | "match" }>;
  readonly isMatch: boolean;
  /**
   * The choices that carry match limits: a Match's on both sides, a Gap Match's sources alone (its
   * gaps hold one choice each, `gapMatchGapFull`), in document order.
   */
  readonly limited: readonly { readonly choice: Associable; readonly side: "source" | "target" }[];
  readonly pairs: readonly PostedPair[];
  readonly sources: readonly (Associable & Choice)[];
  readonly targets: readonly (Choice & {
    readonly matchGroup: readonly string[];
    readonly place: number;
  })[];
}

/**
 * How many pairs use a choice on its side.
 *
 * @param sides - The sides.
 * @param side - The choice's side.
 * @param identifier - The choice.
 * @returns Its uses.
 */
const usesOf = (sides: Sides, side: "source" | "target", identifier: string): bigint =>
  BigInt(count(sides.pairs, ({ a, b }) => (side === "source" ? a : b) === identifier));

/**
 * A Match's pairs given twice, or a Gap Match's gaps filled twice, in the order each first came.
 *
 * @param sides - The sides.
 * @returns The reasons.
 */
const repeatReasons = ({ interaction, isMatch, pairs }: Sides): readonly Found[] =>
  repeated(pairs, ({ a, b }) => (isMatch ? JSON.stringify([a, b]) : b))
    .filter(({ times }) => times > 1)
    .map(({ first }) =>
      isMatch
        ? found(interaction, 2, first.place, "matchRepeated", {
            words: [subject(first.a), other(first.b)],
          })
        : found(interaction, 2, first.place, "gapMatchGapFull", { words: [subject(first.b)] }),
    );

/**
 * Each limited choice past its `match-max` (rank 3), or short of its `match-min` (rank 8).
 *
 * @param sides - The sides.
 * @param rank - 3 or 8.
 * @returns The reasons.
 */
const choiceLimitReasons = (sides: Sides, rank: 3 | 8): readonly Found[] =>
  sides.limited.flatMap(({ choice, side }) => {
    const uses = usesOf(sides, side, choice.identifier);
    const words = [subject(choice.identifier)];
    if (rank === 3) {
      return choice.matchMax !== undefined && choice.matchMax > 0n && uses > choice.matchMax
        ? [
            found(
              sides.interaction,
              3,
              choice.place,
              sides.isMatch ? "matchChoiceAtMost" : "gapMatchChoiceAtMost",
              {
                counts: [{ name: "n", value: choice.matchMax }],
                words,
              },
            ),
          ]
        : [];
    }

    return uses < choice.matchMin
      ? [
          found(
            sides.interaction,
            8,
            choice.place,
            sides.isMatch ? "matchChoiceAtLeast" : "gapMatchChoiceAtLeast",
            {
              counts: [{ name: "n", value: choice.matchMin }],
              words,
            },
          ),
        ]
      : [];
  });

/**
 * Each pair of a presented source and target outside a group, once, in the order it first came.
 *
 * @param sides - The sides.
 * @returns The reasons.
 */
const groupReasons = (sides: Sides): readonly Found[] => {
  const sourceIds = new Set(sides.sources.map((each) => each.identifier));
  const targetIds = new Set(sides.targets.map((each) => each.identifier));
  const sourceGroup = (identifier: string): readonly string[] => groupOf(sides.sources, identifier);
  const targetGroup = (identifier: string): readonly string[] =>
    sides.targets
      .filter((each) => each.identifier === identifier)
      .flatMap((each) => each.matchGroup);
  const codes = sides.isMatch
    ? (["matchNotInSourceGroup", "matchNotInTargetGroup"] as const)
    : (["gapMatchNotInChoiceGroup", "gapMatchNotInGapGroup"] as const);

  return repeated(sides.pairs, ({ a, b }) => JSON.stringify([a, b])).flatMap(({ first }) => {
    const { a, b, place } = first;
    const bySource = outsideGroup(sourceGroup(a), b);
    if (!sourceIds.has(a) || !targetIds.has(b) || !(bySource || outsideGroup(targetGroup(b), a))) {
      return [];
    }

    return [
      found(sides.interaction, 4, place, bySource ? codes[0] : codes[1], {
        words: [subject(a), other(b), ...groupWords(bySource ? sourceGroup(a) : targetGroup(b))],
      }),
    ];
  });
};

/**
 * A Match's and a Gap Match's checks: a pair naming no presented source or target, a repeat, each
 * limited choice's `match-max`, the groups, `max-associations` (default 1); and under
 * `validate-responses` `min-associations`, each required gap (default not required) and each
 * limited choice's `match-min` (default 0).
 *
 * @param interaction - The interaction.
 * @param judging - What is posted and presented.
 * @returns Its reasons.
 */
const matchReasons = (
  interaction: Extract<Interaction, { readonly kind: "gap-match" | "match" }>,
  { posted, presents }: Judging,
): readonly Found[] => {
  const isMatch = interaction.kind === "match";
  const sources = interaction.sources.filter(presents);
  const targets = (isMatch ? interaction.targets : interaction.gaps).filter(presents);
  const limited = isMatch
    ? [
        ...sources.map((choice) => ({ choice, side: "source" as const })),
        ...interaction.targets
          .filter(presents)
          .map((choice) => ({ choice, side: "target" as const })),
      ].toSorted((left, right) => left.choice.place - right.choice.place)
    : sources.map((choice) => ({ choice, side: "source" as const }));
  const sides: Sides = { interaction, isMatch, limited, pairs: pairsOf(posted), sources, targets };
  const sourceIds = new Set(sources.map((each) => each.identifier));
  const targetIds = new Set(targets.map((each) => each.identifier));
  const given = BigInt(sides.pairs.length);
  const unknown = sides.pairs.some(({ a, b }) => !sourceIds.has(a) || !targetIds.has(b));
  const required = isMatch
    ? []
    : interaction.gaps
        .filter(presents)
        .filter((gap) => gap.required && !sides.pairs.some(({ b }) => b === gap.identifier))
        .map((gap) =>
          found(interaction, 7, gap.place, "gapMatchGapRequired", {
            words: [subject(gap.identifier)],
          }),
        );

  return [
    ...(unknown ? [found(interaction, 1, 0, "unknownChoice", {})] : []),
    ...repeatReasons(sides),
    ...choiceLimitReasons(sides, 3),
    ...groupReasons(sides),
    ...(interaction.maxAssociations > 0n && given > interaction.maxAssociations
      ? [found(interaction, 5, 0, "atMost", limit(interaction.maxAssociations))]
      : []),
    ...(given < interaction.minAssociations
      ? [found(interaction, 6, 0, "atLeast", limit(interaction.minAssociations))]
      : []),
    ...required,
    ...choiceLimitReasons(sides, 8),
  ];
};

/**
 * An order's bounds: the least and the most choices it takes, and whether `min-choices` bounds it.
 */
interface OrderBounds {
  readonly bounded: boolean;
  readonly least: bigint;
  readonly most: bigint;
}

/**
 * An Order's and a Graphic Order's bounds: with `min-choices` written, at least that many (at most
 * all) and at most `max-choices` (default all); without it, all of them.
 *
 * @param minChoices - The interaction's `min-choices`.
 * @param maxChoices - Its `max-choices`.
 * @param total - The choices it presents.
 * @returns The least and the most, and whether `min-choices` bounds it.
 */
const orderBounds = (
  minChoices: bigint | undefined,
  maxChoices: bigint | undefined,
  total: bigint,
): OrderBounds => {
  const bounded = minChoices !== undefined;
  const least = minChoices === undefined || minChoices > total ? total : minChoices;
  const written = maxChoices === undefined || maxChoices > total ? total : maxChoices;
  const upper = bounded ? written : total;

  return { bounded, least, most: upper > least ? upper : least };
};

/**
 * An Order's checks.
 *
 * @param interaction - The interaction.
 * @param judging - What is posted and presented.
 * @returns Its reasons.
 */
const orderReasons = (
  interaction: Extract<Interaction, { readonly kind: "order" }>,
  { posted, presents }: Judging,
): readonly Found[] => {
  const presented = new Set(
    interaction.choices.filter(presents).map((choice) => choice.identifier),
  );
  const values = posted.map(({ place, single }) => ({ place, text: textOf(single) }));
  const { bounded, least, most } = orderBounds(
    interaction.minChoices,
    interaction.maxChoices,
    BigInt(interaction.choices.filter(presents).length),
  );
  const placed = BigInt(
    new Set(values.map(({ text }) => text).filter((text) => presented.has(text))).size,
  );
  const reasons: Found[] = [];
  if (values.some(({ text }) => !presented.has(text))) {
    reasons.push(found(interaction, 1, 0, "unknownChoice", {}));
  }

  for (const { first, times } of repeated(values, ({ text }) => text)) {
    const again = values.find(({ place, text }) => text === first.text && place > first.place);
    if (times > 1 && again !== undefined) {
      reasons.push(
        found(interaction, 2, again.place, "orderRepeated", { words: [subject(first.text)] }),
      );
    }
  }

  if (placed > most) {
    reasons.push(found(interaction, 3, 0, "orderAtMost", limit(most)));
  }

  if (placed < least) {
    reasons.push(found(interaction, 4, 0, bounded ? "orderAtLeast" : "orderAll", limit(least)));
  }

  return reasons;
};

/**
 * An Associate's checks: its choices whatever their template visibility; each pair counted once in
 * either order, at its first place, as given there.
 *
 * @param interaction - The interaction.
 * @param judging - What is posted.
 * @returns Its reasons.
 */
const associateReasons = (
  interaction: Extract<Interaction, { readonly kind: "associate" }>,
  { posted }: Judging,
): readonly Found[] => {
  const known = new Set(interaction.choices.map((choice) => choice.identifier));
  const groups = repeated(pairsOf(posted), ({ a, b }) =>
    JSON.stringify(a < b ? [a, b] : [b, a]),
  ).map(({ first, times }) => ({
    ...first,
    known: known.has(first.a) && known.has(first.b),
    times,
  }));
  const usable = groups.filter((pair) => pair.known && pair.a !== pair.b);
  const groupOfChoice = (identifier: string): readonly string[] =>
    lastGroupOf(interaction.choices, identifier);
  const reasons: Found[] = [];
  if (groups.some((pair) => !pair.known)) {
    reasons.push(found(interaction, 1, 0, "associateUnknown", {}));
  }

  for (const pair of groups) {
    if (pair.a === pair.b) {
      reasons.push(
        found(interaction, 2, pair.place, "associateItself", { words: [subject(pair.a)] }),
      );
    }

    if (pair.times > 1) {
      reasons.push(
        found(interaction, 3, pair.place, "associateRepeated", {
          words: [subject(pair.a), other(pair.b)],
        }),
      );
    }
  }

  const usedBy = (identifier: string): bigint =>
    BigInt(count(usable, ({ a, b }) => a === identifier || b === identifier));
  for (const choice of interaction.choices) {
    if (
      choice.matchMax !== undefined &&
      choice.matchMax > 0n &&
      usedBy(choice.identifier) > choice.matchMax
    ) {
      reasons.push(
        found(interaction, 4, choice.place, "associateChoiceAtMost", {
          counts: [{ name: "n", value: choice.matchMax }],
          words: [subject(choice.identifier)],
        }),
      );
    }
  }

  for (const pair of usable) {
    const byA = outsideGroup(groupOfChoice(pair.a), pair.b);
    if (byA || outsideGroup(groupOfChoice(pair.b), pair.a)) {
      const holder = byA ? pair.a : pair.b;
      reasons.push(
        found(interaction, 5, pair.place, "associateOutsideGroup", {
          words: [
            subject(holder),
            other(byA ? pair.b : pair.a),
            ...groupWords(groupOfChoice(holder)),
          ],
        }),
      );
    }
  }

  const given = BigInt(groups.length);
  if (interaction.maxAssociations > 0n && given > interaction.maxAssociations) {
    reasons.push(found(interaction, 6, 0, "associateAtMost", limit(interaction.maxAssociations)));
  }

  if (given < interaction.minAssociations) {
    reasons.push(found(interaction, 7, 0, "associateAtLeast", limit(interaction.minAssociations)));
  }

  for (const choice of interaction.choices) {
    if (usedBy(choice.identifier) < choice.matchMin) {
      reasons.push(
        found(interaction, 8, choice.place, "associateChoiceAtLeast", {
          counts: [{ name: "n", value: choice.matchMin }],
          words: [subject(choice.identifier)],
        }),
      );
    }
  }

  return reasons;
};

/**
 * A Graphic Associate's checks: every pair given, its areas whatever their visibility, the last of
 * an identifier's areas standing for it.
 *
 * @param interaction - The interaction.
 * @param judging - What is posted.
 * @returns Its reasons.
 */
const graphicAssociateReasons = (
  interaction: Extract<Interaction, { readonly kind: "graphic-associate" }>,
  { posted }: Judging,
): readonly Found[] => {
  const known = new Set(interaction.areas.map((area) => area.identifier));
  const pairs = pairsOf(posted);
  const seen = new Map<string, number>();
  const numbered = pairs.map((pair) => {
    const key = JSON.stringify(pair.a < pair.b ? [pair.a, pair.b] : [pair.b, pair.a]);
    const nth = (seen.get(key) ?? 0) + 1;
    seen.set(key, nth);

    return { ...pair, known: known.has(pair.a) && known.has(pair.b), nth };
  });
  const groupOfArea = (identifier: string): readonly string[] =>
    lastGroupOf(interaction.areas, identifier);
  const reasons: Found[] = [];
  if (numbered.some((pair) => !pair.known)) {
    reasons.push(found(interaction, 1, 0, "graphicAssociateUnknown", {}));
  }

  for (const { first } of repeated(
    numbered.filter(({ a, b }) => a === b),
    ({ a }) => a,
  )) {
    reasons.push(
      found(interaction, 2, first.place, "graphicAssociateSelf", { words: [subject(first.a)] }),
    );
  }

  for (const pair of numbered) {
    if (pair.nth === 2) {
      reasons.push(
        found(interaction, 3, pair.place, "graphicAssociateTwice", {
          words: [subject(pair.a), other(pair.b)],
        }),
      );
    }
  }

  const usedBy = (identifier: string): bigint =>
    BigInt(count(pairs, ({ a }) => a === identifier) + count(pairs, ({ b }) => b === identifier));
  for (const area of interaction.areas) {
    if (
      area.matchMax !== undefined &&
      area.matchMax > 0n &&
      usedBy(area.identifier) > area.matchMax
    ) {
      reasons.push(
        found(interaction, 4, area.place, "graphicAssociateMatchMax", {
          counts: [{ name: "n", value: area.matchMax }],
          words: [subject(area.identifier)],
        }),
      );
    }
  }

  for (const pair of numbered) {
    const byA = outsideGroup(groupOfArea(pair.a), pair.b);
    if (pair.a !== pair.b && (byA || outsideGroup(groupOfArea(pair.b), pair.a))) {
      const holder = byA ? pair.a : pair.b;
      reasons.push(
        found(interaction, 5, pair.place, "graphicAssociateOutside", {
          words: [
            subject(holder),
            other(byA ? pair.b : pair.a),
            ...groupWords(groupOfArea(holder)),
          ],
        }),
      );
    }
  }

  const given = BigInt(pairs.length);
  if (interaction.maxAssociations > 0n && given > interaction.maxAssociations) {
    reasons.push(
      found(interaction, 6, 0, "graphicAssociateAtMost", limit(interaction.maxAssociations)),
    );
  }

  if (given < interaction.minAssociations) {
    reasons.push(
      found(interaction, 7, 0, "graphicAssociateAtLeast", limit(interaction.minAssociations)),
    );
  }

  for (const area of interaction.areas) {
    if (usedBy(area.identifier) < area.matchMin) {
      reasons.push(
        found(interaction, 8, area.place, "graphicAssociateMatchMin", {
          counts: [{ name: "n", value: area.matchMin }],
          words: [subject(area.identifier)],
        }),
      );
    }
  }

  return reasons;
};

/**
 * Each element past its `match-max` where above 0, or short of its `match-min`, by the uses a count
 * gives it.
 *
 * @param interaction - The interaction.
 * @param elements - The elements, in document order.
 * @param usesBy - How many pairs use an element.
 * @param check - The check's rank, code and which limit it holds.
 * @returns The reasons.
 */
const elementLimits = (
  interaction: Interaction,
  elements: readonly Associable[],
  usesBy: (identifier: string) => bigint,
  check: { readonly code: AdmissionCode; readonly limit: "max" | "min"; readonly rank: number },
): readonly Found[] =>
  elements.flatMap((element) => {
    const uses = usesBy(element.identifier);
    const bound = check.limit === "max" ? element.matchMax : element.matchMin;
    const broken =
      check.limit === "max"
        ? bound !== undefined && bound > 0n && uses > bound
        : bound !== undefined && uses < bound;

    return broken && bound !== undefined
      ? [
          found(interaction, check.rank, element.place, check.code, {
            counts: [{ name: "n", value: bound }],
            words: [subject(element.identifier)],
          }),
        ]
      : [];
  });

/**
 * A Graphic Gap Match's checks: every pair given, a choice to an area: an unknown choice or area,
 * each area's then each choice's `match-max`, the groups, `max-associations` (default 1); under
 * `validate-responses` `min-associations` and each area's then each choice's `match-min`.
 *
 * @param interaction - The interaction.
 * @param judging - What is posted.
 * @returns Its reasons.
 */
const graphicGapMatchReasons = (
  interaction: Extract<Interaction, { readonly kind: "graphic-gap-match" }>,
  { posted }: Judging,
): readonly Found[] => {
  const choiceIds = new Set(interaction.choices.map((each) => each.identifier));
  const areaIds = new Set(interaction.areas.map((each) => each.identifier));
  const pairs = pairsOf(posted);
  const toArea = (identifier: string): bigint => BigInt(count(pairs, ({ b }) => b === identifier));
  const ofChoice = (identifier: string): bigint =>
    BigInt(count(pairs, ({ a }) => a === identifier));
  const outside = repeated(pairs, ({ a, b }) => JSON.stringify([a, b])).flatMap(({ first }) => {
    const choiceGroup = lastGroupOf(interaction.choices, first.a);
    const areaGroup = lastGroupOf(interaction.areas, first.b);
    const byChoice = outsideGroup(choiceGroup, first.b);

    return byChoice || outsideGroup(areaGroup, first.a)
      ? [
          found(
            interaction,
            4,
            first.place,
            byChoice ? "graphicGapMatchNotInChoiceGroup" : "graphicGapMatchNotInAreaGroup",
            {
              words: [
                subject(first.a),
                other(first.b),
                ...groupWords(byChoice ? choiceGroup : areaGroup),
              ],
            },
          ),
        ]
      : [];
  });
  const given = BigInt(pairs.length);

  return [
    ...(pairs.some(({ a, b }) => !choiceIds.has(a) || !areaIds.has(b))
      ? [found(interaction, 1, 0, "unknownChoice", {})]
      : []),
    ...elementLimits(interaction, interaction.areas, toArea, {
      code: "graphicGapMatchAreaAtMost",
      limit: "max",
      rank: 2,
    }),
    ...elementLimits(interaction, interaction.choices, ofChoice, {
      code: "graphicGapMatchChoiceAtMost",
      limit: "max",
      rank: 3,
    }),
    ...outside,
    ...(interaction.maxAssociations > 0n && given > interaction.maxAssociations
      ? [found(interaction, 5, 0, "atMost", limit(interaction.maxAssociations))]
      : []),
    ...(given < interaction.minAssociations
      ? [found(interaction, 6, 0, "atLeast", limit(interaction.minAssociations))]
      : []),
    ...elementLimits(interaction, interaction.areas, toArea, {
      code: "graphicGapMatchAreaAtLeast",
      limit: "min",
      rank: 7,
    }),
    ...elementLimits(interaction, interaction.choices, ofChoice, {
      code: "graphicGapMatchChoiceAtLeast",
      limit: "min",
      rank: 8,
    }),
  ];
};

/**
 * A Graphic Order's checks: its areas, and the bounds an Order's are.
 *
 * @param interaction - The interaction.
 * @param judging - What is posted.
 * @returns Its reasons.
 */
const graphicOrderReasons = (
  interaction: Extract<Interaction, { readonly kind: "graphic-order" }>,
  { posted }: Judging,
): readonly Found[] => {
  const known = new Set(interaction.areas);
  const { least, most } = orderBounds(
    interaction.minChoices,
    interaction.maxChoices,
    BigInt(interaction.areas.length),
  );
  const values = posted.map(({ place, single }) => ({ place, text: textOf(single) }));
  const n = BigInt(values.length);
  const reasons: Found[] = [];
  if (values.some(({ text }) => !known.has(text))) {
    reasons.push(found(interaction, 1, 0, "graphicOrderUnknown", {}));
  }

  const seen = new Map<string, number>();
  for (const { place, text } of values) {
    const nth = (seen.get(text) ?? 0) + 1;
    seen.set(text, nth);
    if (nth === 2 && known.has(text)) {
      reasons.push(found(interaction, 2, place, "graphicOrderTwice", { words: [subject(text)] }));
    }
  }

  if (n > most) {
    reasons.push(found(interaction, 3, 0, "graphicOrderAtMost", limit(most)));
  }

  if (n < least) {
    reasons.push(found(interaction, 4, 0, "graphicOrderAtLeast", limit(least)));
  }

  return reasons;
};

/**
 * The points among posted values.
 *
 * @param posted - The values.
 * @returns Each point and its place.
 */
const pointsOf = (
  posted: readonly Posted[],
): readonly { readonly place: number; readonly x: bigint; readonly y: bigint }[] =>
  posted.flatMap(({ place, single }) =>
    single.base === "point" ? [{ place, x: single.value.x, y: single.value.y }] : [],
  );

/**
 * A Position Object's checks: at most `max-choices` where above 0, on its stage, at least
 * `min-choices`.
 *
 * @param interaction - The interaction.
 * @param judging - What is posted.
 * @returns Its reasons.
 */
const positionObjectReasons = (
  interaction: Extract<Interaction, { readonly kind: "position-object" }>,
  { posted }: Judging,
): readonly Found[] => {
  const n = BigInt(posted.length);
  const { height, width } = interaction.stage;
  const reasons: Found[] = [];
  if (interaction.maxChoices > 0n && n > interaction.maxChoices) {
    reasons.push(found(interaction, 1, 0, "positionObjectAtMost", limit(interaction.maxChoices)));
  }

  if (
    pointsOf(posted).some(({ x, y }) => x < 0n || y < 0n || Number(x) > width || Number(y) > height)
  ) {
    reasons.push(
      found(interaction, 2, 0, "positionObjectOffStage", {
        numbers: [
          { name: "width", value: width },
          { name: "height", value: height },
        ],
      }),
    );
  }

  if (n < interaction.minChoices) {
    reasons.push(found(interaction, 3, 0, "positionObjectAtLeast", limit(interaction.minChoices)));
  }

  return reasons;
};

/**
 * A Select Point's checks: each point's x then y below 0, or past the image; at most one for a
 * single response, else `max-choices` where above 0 (QTI's default 0 is no limit); at least
 * `min-choices` where above 0.
 *
 * @param interaction - The interaction.
 * @param judging - What is posted.
 * @returns Its reasons.
 */
const selectPointReasons = (
  interaction: Extract<Interaction, { readonly kind: "select-point" }>,
  { posted }: Judging,
): readonly Found[] => {
  const n = BigInt(posted.length);
  const reasons: Found[] = [];
  for (const { place, x, y } of pointsOf(posted)) {
    for (const [index, axis, coordinate, extent] of [
      [0, "x", x, interaction.image.width],
      [1, "y", y, interaction.image.height],
    ] as const) {
      if (coordinate < 0n || Number(coordinate) > extent) {
        reasons.push(
          found(
            interaction,
            1,
            place * 2 + index,
            coordinate < 0n ? "selectPointBelowZero" : "selectPointBeyond",
            {
              counts: [
                { name: "at", value: BigInt(place) },
                { name: "extent", value: BigInt(extent) },
              ],
              words: [{ name: "axis", place: 1, value: axis }],
            },
          ),
        );
      }
    }
  }

  const most = interaction.single ? 1n : interaction.maxChoices;
  if (most > 0n && n > most) {
    reasons.push(found(interaction, 2, 0, "selectPointAtMost", limit(most)));
  }

  if (interaction.minChoices > 0n && n < interaction.minChoices) {
    reasons.push(found(interaction, 3, 0, "selectPointAtLeast", limit(interaction.minChoices)));
  }

  return reasons;
};

/**
 * A Slider's checks: each value below its range, above it, or off its step from the lower bound.
 *
 * @param interaction - The interaction.
 * @param judging - What is posted.
 * @returns Its reasons.
 */
const sliderReasons = (
  interaction: Extract<Interaction, { readonly kind: "slider" }>,
  { posted }: Judging,
): readonly Found[] => {
  const { lower, step, upper } = interaction;
  const reasons: Found[] = [];
  for (const { place, single } of posted) {
    let value = Number.NaN;
    if (single.base === "integer") {
      value = Number(single.value);
    } else if (single.base === "float") {
      ({ value } = single);
    }

    if (!Number.isNaN(value)) {
      if (value < lower) {
        reasons.push(
          found(interaction, 1, place, "sliderBelow", {
            numbers: [{ name: "bound", value: lower }],
          }),
        );
      } else if (value > upper) {
        reasons.push(
          found(interaction, 1, place, "sliderAbove", {
            numbers: [{ name: "bound", value: upper }],
          }),
        );
      } else if (step !== undefined) {
        const steps = (value - lower) / step;
        if (Math.abs(steps - Math.round(steps)) > 1e-9 * Math.max(1, Math.abs(steps))) {
          reasons.push(
            found(interaction, 1, place, "sliderOffStep", {
              numbers: [
                { name: "step", value: step },
                { name: "bound", value: lower },
              ],
            }),
          );
        }
      }
    }
  }

  return reasons;
};

/**
 * A Media interaction's checks: the plays given (its first value; none given is 0), never negative,
 * at most `max-plays` where above 0, at least `min-plays`.
 *
 * @param interaction - The interaction.
 * @param judging - What is posted.
 * @returns Its reasons.
 */
const mediaReasons = (
  interaction: Extract<Interaction, { readonly kind: "media" }>,
  { posted }: Judging,
): readonly Found[] => {
  const [first] = posted;
  const plays = first?.single.base === "integer" ? first.single.value : 0n;
  if (plays < 0n) {
    return [found(interaction, 1, 0, "mediaNegative", {})];
  }

  const reasons: Found[] = [];
  if (interaction.maxPlays > 0n && plays > interaction.maxPlays) {
    reasons.push(found(interaction, 2, 0, "mediaAtMost", limit(interaction.maxPlays)));
  }

  if (plays < interaction.minPlays) {
    reasons.push(found(interaction, 3, 0, "mediaAtLeast", limit(interaction.minPlays)));
  }

  return reasons;
};

/**
 * Whether every string matches a pattern mask; a mask that is no Appendix F expression gives no
 * verdict.
 *
 * @param mask - The mask.
 * @param texts - The strings.
 * @returns Whether one fails to match.
 */
const mismatches = (mask: PatternMask | undefined, texts: readonly string[]): boolean =>
  mask?.matcher !== undefined && texts.some((text) => mask.matcher?.matches(text) === false);

/**
 * A Text Entry's and an Extended Text's checks: an Extended Text's at most `max-strings` where
 * above 0 and at least `min-strings` ("the minimum number separate (non-empty) strings required
 * from the candidate to form a valid response", §5.48.7); each string matching the `pattern-mask`,
 * an xhtml Extended Text's by its text (reading 244).
 *
 * @param interaction - The interaction.
 * @param judging - What is posted.
 * @returns Its reasons.
 */
const textReasons = (
  interaction: Extract<Interaction, { readonly kind: "extended-text" | "text-entry" }>,
  { posted }: Judging,
): readonly Found[] => {
  const n = BigInt(posted.length);
  const reasons: Found[] = [];
  const xhtml = interaction.kind === "extended-text" && interaction.xhtml;
  if (interaction.kind === "extended-text") {
    if (
      interaction.maxStrings !== undefined &&
      interaction.maxStrings > 0n &&
      n > interaction.maxStrings
    ) {
      reasons.push(found(interaction, 1, 0, "atMostStrings", limit(interaction.maxStrings)));
    }

    if (n < interaction.minStrings) {
      reasons.push(found(interaction, 2, 0, "atLeastStrings", limit(interaction.minStrings)));
    }
  }

  const texts = posted.map(({ single }) => (xhtml ? textOfXhtml(textOf(single)) : textOf(single)));
  if (mismatches(interaction.mask, texts)) {
    reasons.push(found(interaction, 3, 0, "patternMismatch", {}));
  }

  return reasons;
};

/**
 * Whether an interaction is of one of some kinds.
 *
 * @param kinds - The kinds.
 * @param interaction - The interaction.
 * @returns Whether it is.
 */
const isOf = <K extends Interaction["kind"]>(
  kinds: readonly K[],
  interaction: Interaction,
): interaction is Extract<Interaction, { readonly kind: K }> =>
  kinds.some((kind) => kind === interaction.kind);

/**
 * The interactions whose responses pick, place or pair choices.
 */
const choiceKinds = [
  "associate",
  "choice",
  "gap-match",
  "hotspot",
  "hottext",
  "inline-choice",
  "match",
  "order",
] as const;

/**
 * The reasons of an interaction that picks, places or pairs choices.
 *
 * @param interaction - The interaction.
 * @param judging - What is posted and presented.
 * @returns Its reasons.
 */
const choiceReasons = (
  interaction: Extract<Interaction, { readonly kind: (typeof choiceKinds)[number] }>,
  judging: Judging,
): readonly Found[] => {
  switch (interaction.kind) {
    case "choice":
    case "hotspot":
    case "hottext": {
      return picksReasons(interaction, judging);
    }
    case "inline-choice": {
      return inlineReasons(interaction, judging);
    }
    case "match":
    case "gap-match": {
      return matchReasons(interaction, judging);
    }
    case "order": {
      return orderReasons(interaction, judging);
    }
    case "associate": {
      return associateReasons(interaction, judging);
    }
  }
};

/**
 * The reasons of any other interaction: graphic, positional, slider, media, text, end attempt,
 * portable custom.
 *
 * @param interaction - The interaction.
 * @param judging - What is posted.
 * @returns Its reasons.
 */
const otherReasons = (
  interaction: Exclude<Interaction, { readonly kind: (typeof choiceKinds)[number] }>,
  judging: Judging,
): readonly Found[] => {
  switch (interaction.kind) {
    case "graphic-associate": {
      return graphicAssociateReasons(interaction, judging);
    }
    case "graphic-gap-match": {
      return graphicGapMatchReasons(interaction, judging);
    }
    case "graphic-order": {
      return graphicOrderReasons(interaction, judging);
    }
    case "position-object": {
      return positionObjectReasons(interaction, judging);
    }
    case "select-point": {
      return selectPointReasons(interaction, judging);
    }
    case "slider": {
      return sliderReasons(interaction, judging);
    }
    case "media": {
      return mediaReasons(interaction, judging);
    }
    case "text-entry":
    case "extended-text": {
      return textReasons(interaction, judging);
    }
    case "end-attempt":
    case "portable-custom": {
      return [];
    }
  }
};

/**
 * One shown interaction's reasons.
 *
 * @param interaction - The interaction.
 * @param judging - What is posted and presented.
 * @returns Its reasons.
 */
const reasonsOf = (interaction: Interaction, judging: Judging): readonly Found[] =>
  isOf(choiceKinds, interaction)
    ? choiceReasons(interaction, judging)
    : otherReasons(interaction, judging);

/**
 * The identifier values a variable holds in force: its single's, or each member's of a container.
 *
 * @param value - The value.
 * @returns Its identifier values.
 */
const identifiersOf = (value: Value | undefined): ReadonlySet<string> => {
  if (value === undefined || value.kind === "null" || value.kind === "record") {
    return new Set();
  }

  const singles = value.kind === "single" ? [value] : singlesOf(value);

  return new Set(singles.flatMap((single) => (single.base === "identifier" ? [single.value] : [])));
};

/**
 * Whether the values in force close a gate: it hides where its identifier is among its variable's
 * values, else it shows where it is (show-hide's default, show).
 *
 * @param gate - The gate.
 * @param held - The values in force.
 * @returns Whether it is closed.
 */
const closes = (gate: Gate, held: ReadonlyMap<string, Value>): boolean =>
  identifiersOf(held.get(gate.variable)).has(gate.identifier) === gate.hides;

/**
 * Whether a code is tier (a)'s.
 *
 * @param code - The code.
 * @returns Whether it is refused whatever validate-responses says.
 */
const always = (code: AdmissionCode): boolean => alwaysCodes.some((each) => each === code);

/**
 * Admit an answer: every reason its posted responses break, tier (b)'s only under
 * `validate-responses`, in plate's order, and the responses the values in force hide.
 *
 * @param item - The item.
 * @param responses - The posted responses, by identifier; one not posted holds none.
 * @param held - The values in force: the outcomes after the last attempt (the declared ones before
 *   the first) and the session's template values.
 * @param validate - The session's `validate-responses`.
 * @returns The admission.
 */
export const admit = (
  item: CompiledItem,
  responses: ReadonlyMap<string, Value>,
  held: ReadonlyMap<string, Value>,
  validate: boolean,
): Admission => {
  const shown = item.interactions.filter(
    (interaction) => !interaction.gates.some((gate) => closes(gate, held)),
  );
  const presents = (choice: Choice): boolean =>
    choice.gate === undefined || !closes(choice.gate, held);
  const shownResponses = new Set(shown.map((interaction) => interaction.response));
  const hidden = [
    ...new Set(
      item.interactions
        .map((interaction) => interaction.response)
        .filter((response) => !shownResponses.has(response)),
    ),
  ].toSorted();
  const judged = shown
    .flatMap((interaction) =>
      reasonsOf(interaction, { posted: postedOf(responses.get(interaction.response)), presents }),
    )
    .filter((reason) => validate || always(reason.code))
    .toSorted(
      (left, right) => left.place - right.place || left.rank - right.rank || left.sub - right.sub,
    );
  const reasons: Reason[] = [];
  const words: ReasonWord[] = [];
  const counts: ReasonCount[] = [];
  const numbers: ReasonNumber[] = [];
  let previous: Found | undefined;
  let ord = 0n;
  for (const reason of judged) {
    const same =
      previous !== undefined &&
      previous.place === reason.place &&
      previous.rank === reason.rank &&
      previous.sub === reason.sub;
    if (!same) {
      ord += 1n;
      reasons.push({
        code: reason.code,
        interaction: reason.place,
        ord,
        response: reason.response,
      });
    }

    previous = reason;
    for (const word of reason.words) {
      words.push({ ...word, ord, place: BigInt(word.place) });
    }

    for (const each of reason.counts) {
      counts.push({ ...each, ord });
    }

    for (const each of reason.numbers) {
      numbers.push({ ...each, ord });
    }
  }

  return { counts, hidden, numbers, reasons, words };
};
