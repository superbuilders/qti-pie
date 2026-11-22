/**
 * The words of a refused answer: the reasons the QTI database's admission gives (`admission_of` in
 * `@qti-pie/ledger`'s machine), each worded in the item's own terms, so the page says why its
 * answer was not taken. The database judges every limit; plate only writes the words: each reason's
 * code picks its catalog text, the singular where its count is 1, filled from the reason's
 * attributes, with the author's `data-max-selections-message`, `data-min-selections-message` or
 * `data-patternmask-message` in its place where the interaction writes one, and an area named as
 * the page names it (its label, else its place, "Area 2 of 4").
 *
 * @module
 */
import { Array as Arr, Data, Option, Order } from "effect";
import type { admissionCodes } from "#plate/admission-codes.ts";
import { areaNames } from "#plate/interactions/area.ts";
import { counted, message, numeral } from "#plate/messages.ts";
import type { Locale } from "#plate/messages.ts";
import { interactionsIn } from "#plate/model/interactions.ts";
import type { Interaction, Item } from "#plate/model/item.ts";

/**
 * A reason a refused answer breaks, at its place in the order the page states them (`ord`, from
 * 1), with its code and the response it concerns.
 */
export interface RefusalReason {
  readonly code: AdmissionCode;
  readonly ord: bigint;
  readonly response: string;
}

/**
 * A reason's word: a choice's, a gap's or an area's identifier (`subject`, `other`), a group's
 * members at their places (`group`), or an axis (`axis`).
 */
export interface RefusalWord {
  readonly name: "axis" | "group" | "other" | "subject";
  readonly ord: bigint;
  readonly place: bigint;
  readonly value: string;
}

/**
 * A reason's count: a limit (`n`), a point's place (`at`) or an image's extent (`extent`).
 */
export interface RefusalCount {
  readonly name: "at" | "extent" | "n";
  readonly ord: bigint;
  readonly value: bigint;
}

/**
 * A reason's number: a stage's size (`width`, `height`) or a slider's bound and step.
 */
export interface RefusalNumber {
  readonly name: "bound" | "height" | "step" | "width";
  readonly ord: bigint;
  readonly value: number;
}

/**
 * A refused answer as the database reads it back: its reasons, at least one, and each one's
 * attributes by form.
 */
export interface Refusal {
  readonly counts: readonly RefusalCount[];
  readonly numbers: readonly RefusalNumber[];
  readonly reasons: Arr.NonEmptyReadonlyArray<RefusalReason>;
  readonly words: readonly RefusalWord[];
}

/**
 * One worded reason: the response it concerns and what the page says.
 */
export interface RefusalMessage {
  readonly response: string;
  readonly text: string;
}

/**
 * What a reason's words read: its attributes, the interaction its response is bound to, and the
 * locale.
 */
interface Said {
  /**
   * A count by name.
   */
  readonly count: (name: RefusalCount["name"]) => bigint;
  /**
   * The members of the reason's group, in place order.
   */
  readonly group: () => readonly string[];
  /**
   * The interaction the reason's response is bound to, none where the item binds it to none.
   */
  readonly interaction: Option.Option<Interaction>;
  readonly locale: Locale;
  /**
   * A number by name.
   */
  readonly number: (name: RefusalNumber["name"]) => number;
  /**
   * A one-place word by name.
   */
  readonly word: (name: "axis" | "other" | "subject") => string;
}

/**
 * The author's own words for a bound or a mask, where the interaction writes them.
 *
 * @param said The reason's attributes and interaction.
 * @param which The bound (`max`, `min`) or the pattern mask (`pattern`).
 * @returns The author's words, or none.
 */
const authored = (said: Said, which: "max" | "min" | "pattern"): Option.Option<string> =>
  said.interaction.pipe(
    Option.flatMap((interaction) => {
      if (which === "pattern") {
        return "patternMaskMessage" in interaction ? interaction.patternMaskMessage : Option.none();
      }

      if (!("messages" in interaction)) {
        return Option.none();
      }

      const { messages } = interaction;

      if (which === "min") {
        return messages.min;
      }

      return "max" in messages ? messages.max : Option.none();
    }),
  );

/**
 * An area's name as the page gives it: its graphic interaction's label or place, else its
 * identifier.
 *
 * @param said The reason's attributes and interaction.
 * @param identifier The area's identifier.
 * @returns The area's name.
 */
const areaName = (said: Said, identifier: string): string =>
  Option.match(said.interaction, {
    onNone: () => identifier,
    onSome: (interaction) =>
      interaction.kind === "graphic-associate" || interaction.kind === "graphic-order"
        ? (areaNames(interaction.hotspots, said.locale).get(identifier) ?? identifier)
        : identifier,
  });

/**
 * A reason code of the database's admission: a handle of its closed roster `AdmissionCode`, whose
 * one list {@link admissionCodes} is generated from the machine's SQL.
 */
export type AdmissionCode = (typeof admissionCodes)[number];

/**
 * Each reason code's words, by the code: every code of {@link admissionCodes} and no other.
 */
const wordings = {
  associateAtLeast: (said: Said) =>
    counted(said.locale, said.count("n"), { many: "pairsAtLeast", one: "pairsAtLeastOne" }),
  associateAtMost: (said: Said) =>
    counted(said.locale, said.count("n"), { many: "pairsAtMost", one: "pairsAtMostOne" }),
  associateChoiceAtLeast: (said: Said) =>
    counted(
      said.locale,
      said.count("n"),
      { many: "associateChoiceAtLeast", one: "associateChoiceAtLeastOne" },
      { choice: said.word("subject") },
    ),
  associateChoiceAtMost: (said: Said) =>
    counted(
      said.locale,
      said.count("n"),
      { many: "associateChoiceAtMost", one: "associateChoiceAtMostOne" },
      { choice: said.word("subject") },
    ),
  associateItself: (said: Said) =>
    message(said.locale, "associateItself", { choice: said.word("subject") }),
  associateOutsideGroup: (said: Said) =>
    message(said.locale, "associateOutsideGroup", {
      choice: said.word("subject"),
      group: said.group().join(", "),
      other: said.word("other"),
    }),
  associateRepeated: (said: Said) =>
    message(said.locale, "associateRepeated", {
      first: said.word("subject"),
      second: said.word("other"),
    }),
  associateUnknown: (said: Said) => message(said.locale, "associateUnknown"),
  atLeast: (said: Said) =>
    Option.getOrElse(authored(said, "min"), () =>
      message(said.locale, "atLeast", { n: numeral(said.locale, said.count("n")) }),
    ),
  atLeastStrings: (said: Said) =>
    counted(said.locale, said.count("n"), { many: "atLeastStrings", one: "atLeastOneString" }),
  atMost: (said: Said) =>
    Option.getOrElse(authored(said, "max"), () =>
      message(said.locale, "atMost", { n: numeral(said.locale, said.count("n")) }),
    ),
  atMostStrings: (said: Said) =>
    counted(said.locale, said.count("n"), { many: "atMostStrings", one: "atMostOneString" }),
  gapMatchChoiceAtLeast: (said: Said) =>
    counted(
      said.locale,
      said.count("n"),
      { many: "gapMatchChoiceAtLeast", one: "gapMatchChoiceAtLeastOne" },
      { choice: said.word("subject") },
    ),
  gapMatchChoiceAtMost: (said: Said) =>
    counted(
      said.locale,
      said.count("n"),
      { many: "gapMatchChoiceAtMost", one: "gapMatchChoiceAtMostOne" },
      { choice: said.word("subject") },
    ),
  gapMatchGapFull: (said: Said) =>
    message(said.locale, "gapMatchGapFull", { gap: said.word("subject") }),
  gapMatchGapRequired: (said: Said) =>
    message(said.locale, "gapMatchGapRequired", { gap: said.word("subject") }),
  gapMatchNotInChoiceGroup: (said: Said) =>
    message(said.locale, "gapMatchNotInChoiceGroup", {
      choice: said.word("subject"),
      gap: said.word("other"),
      group: said.group().join(", "),
    }),
  gapMatchNotInGapGroup: (said: Said) =>
    message(said.locale, "gapMatchNotInGapGroup", {
      choice: said.word("subject"),
      gap: said.word("other"),
      group: said.group().join(", "),
    }),
  graphicAssociateAtLeast: (said: Said) =>
    counted(said.locale, said.count("n"), { many: "pairsAtLeast", one: "pairsAtLeastOne" }),
  graphicAssociateAtMost: (said: Said) =>
    counted(said.locale, said.count("n"), { many: "pairsAtMost", one: "pairsAtMostOne" }),
  graphicAssociateMatchMax: (said: Said) =>
    counted(
      said.locale,
      said.count("n"),
      { many: "graphicAssociateMatchMax", one: "graphicAssociateMatchMaxOne" },
      { name: areaName(said, said.word("subject")) },
    ),
  graphicAssociateMatchMin: (said: Said) =>
    counted(
      said.locale,
      said.count("n"),
      { many: "graphicAssociateMatchMin", one: "graphicAssociateMatchMinOne" },
      { name: areaName(said, said.word("subject")) },
    ),
  graphicAssociateOutside: (said: Said) =>
    message(said.locale, "graphicAssociateOutside", {
      allowed: said
        .group()
        .map((member) => areaName(said, member))
        .join(", "),
      name: areaName(said, said.word("subject")),
      other: areaName(said, said.word("other")),
    }),
  graphicAssociateSelf: (said: Said) =>
    message(said.locale, "graphicAssociateSelf", { name: areaName(said, said.word("subject")) }),
  graphicAssociateTwice: (said: Said) =>
    message(said.locale, "graphicAssociateTwice", {
      a: areaName(said, said.word("subject")),
      b: areaName(said, said.word("other")),
    }),
  graphicAssociateUnknown: (said: Said) => message(said.locale, "graphicAssociateUnknown"),
  graphicGapMatchAreaAtLeast: (said: Said) =>
    counted(
      said.locale,
      said.count("n"),
      { many: "graphicGapMatchHotspotAtLeast", one: "graphicGapMatchHotspotAtLeastOne" },
      { area: said.word("subject") },
    ),
  graphicGapMatchAreaAtMost: (said: Said) =>
    counted(
      said.locale,
      said.count("n"),
      { many: "graphicGapMatchHotspotAtMost", one: "graphicGapMatchHotspotAtMostOne" },
      { area: said.word("subject") },
    ),
  graphicGapMatchChoiceAtLeast: (said: Said) =>
    counted(
      said.locale,
      said.count("n"),
      { many: "graphicGapMatchChoiceAtLeast", one: "graphicGapMatchChoiceAtLeastOne" },
      { choice: said.word("subject") },
    ),
  graphicGapMatchChoiceAtMost: (said: Said) =>
    counted(
      said.locale,
      said.count("n"),
      { many: "graphicGapMatchChoiceAtMost", one: "graphicGapMatchChoiceAtMostOne" },
      { choice: said.word("subject") },
    ),
  graphicGapMatchNotInAreaGroup: (said: Said) =>
    message(said.locale, "graphicGapMatchNotInHotspotGroup", {
      area: said.word("other"),
      choice: said.word("subject"),
      group: said.group().join(", "),
    }),
  graphicGapMatchNotInChoiceGroup: (said: Said) =>
    message(said.locale, "graphicGapMatchNotInChoiceGroup", {
      area: said.word("other"),
      choice: said.word("subject"),
      group: said.group().join(", "),
    }),
  graphicOrderAtLeast: (said: Said) =>
    counted(said.locale, said.count("n"), {
      many: "graphicOrderAtLeast",
      one: "graphicOrderAtLeastOne",
    }),
  graphicOrderAtMost: (said: Said) =>
    counted(said.locale, said.count("n"), {
      many: "graphicOrderAtMost",
      one: "graphicOrderAtMostOne",
    }),
  graphicOrderTwice: (said: Said) =>
    message(said.locale, "graphicOrderTwice", { name: areaName(said, said.word("subject")) }),
  graphicOrderUnknown: (said: Said) => message(said.locale, "graphicOrderUnknown"),
  matchChoiceAtLeast: (said: Said) =>
    counted(
      said.locale,
      said.count("n"),
      { many: "matchChoiceAtLeast", one: "matchChoiceAtLeastOne" },
      { choice: said.word("subject") },
    ),
  matchChoiceAtMost: (said: Said) =>
    counted(
      said.locale,
      said.count("n"),
      { many: "matchChoiceAtMost", one: "matchChoiceAtMostOne" },
      { choice: said.word("subject") },
    ),
  matchNotInSourceGroup: (said: Said) =>
    message(said.locale, "matchNotInSourceGroup", {
      group: said.group().join(", "),
      source: said.word("subject"),
      target: said.word("other"),
    }),
  matchNotInTargetGroup: (said: Said) =>
    message(said.locale, "matchNotInTargetGroup", {
      group: said.group().join(", "),
      source: said.word("subject"),
      target: said.word("other"),
    }),
  matchRepeated: (said: Said) =>
    message(said.locale, "matchRepeated", {
      pair: `${said.word("subject")} ${said.word("other")}`,
    }),
  mediaAtLeast: (said: Said) =>
    counted(said.locale, said.count("n"), {
      many: "mediaCheckAtLeast",
      one: "mediaCheckAtLeastOnce",
    }),
  mediaAtMost: (said: Said) =>
    counted(said.locale, said.count("n"), {
      many: "mediaCheckAtMost",
      one: "mediaCheckAtMostOnce",
    }),
  mediaNegative: (said: Said) => message(said.locale, "malformedNumber"),
  orderAll: (said: Said) =>
    Option.getOrElse(authored(said, "min"), () =>
      counted(said.locale, said.count("n"), { many: "orderAll", one: "orderAllOne" }),
    ),
  orderAtLeast: (said: Said) =>
    Option.getOrElse(authored(said, "min"), () =>
      counted(said.locale, said.count("n"), { many: "orderAtLeast", one: "orderAtLeastOne" }),
    ),
  orderAtMost: (said: Said) =>
    Option.getOrElse(authored(said, "max"), () =>
      counted(said.locale, said.count("n"), { many: "orderAtMost", one: "orderAtMostOne" }),
    ),
  orderRepeated: (said: Said) =>
    message(said.locale, "orderRepeated", { choice: said.word("subject") }),
  patternMismatch: (said: Said) =>
    Option.getOrElse(authored(said, "pattern"), () => message(said.locale, "patternMismatch")),
  positionObjectAtLeast: (said: Said) =>
    counted(said.locale, said.count("n"), {
      many: "positionObjectAtLeast",
      one: "positionObjectAtLeastOne",
    }),
  positionObjectAtMost: (said: Said) =>
    counted(said.locale, said.count("n"), {
      many: "positionObjectAtMost",
      one: "positionObjectAtMostOne",
    }),
  positionObjectOffStage: (said: Said) =>
    message(said.locale, "positionObjectOffStage", {
      height: String(said.number("height")),
      width: String(said.number("width")),
    }),
  selectPointAtLeast: (said: Said) =>
    counted(said.locale, said.count("n"), {
      many: "selectPointAtLeast",
      one: "selectPointAtLeastOne",
    }),
  selectPointAtMost: (said: Said) =>
    counted(said.locale, said.count("n"), {
      many: "selectPointAtMost",
      one: "selectPointAtMostOne",
    }),
  selectPointBelowZero: (said: Said) =>
    message(said.locale, "selectPointOutside", {
      axis: said.word("axis"),
      bound: numeral(said.locale, said.count("extent")),
      n: numeral(said.locale, said.count("at")),
    }),
  selectPointBeyond: (said: Said) =>
    message(said.locale, "selectPointOutside", {
      axis: said.word("axis"),
      bound: numeral(said.locale, said.count("extent")),
      n: numeral(said.locale, said.count("at")),
    }),
  sliderAbove: (said: Said) =>
    message(said.locale, "sliderAbove", { bound: String(said.number("bound")) }),
  sliderBelow: (said: Said) =>
    message(said.locale, "sliderBelow", { bound: String(said.number("bound")) }),
  sliderOffStep: (said: Said) =>
    message(said.locale, "sliderOffStep", {
      from: String(said.number("bound")),
      step: String(said.number("step")),
    }),
  unknownChoice: (said: Said) => message(said.locale, "unknownChoice"),
} as const satisfies Readonly<Record<AdmissionCode, (said: Said) => string>>;

/**
 * A reason without an attribute its words name: the database gives every code the attributes its
 * words read (`admission_of`), so this is a defect of that contract, thrown, never returned.
 */
class RefusalAttributeDefect extends Data.TaggedError("RefusalAttributeDefect")<{
  readonly code: AdmissionCode;
  readonly name: string;
}> {
  /**
   * The broken contract, and what to do with it.
   */
  override get message(): string {
    return `The database's ${this.code} reason holds no ${this.name}, which its words name. This is a defect in admission_of or in the read that carries its rows; report it with the answer that caused it.`;
  }
}

/**
 * A reason's attribute of a form, by name: {@link RefusalAttributeDefect} where the reason lacks it.
 *
 * @param rows The reason's attributes of that form.
 * @param name The attribute's name.
 * @param code The reason's code, for the defect's words.
 * @returns The attribute's value.
 */
const one = <Row extends { readonly name: string }>(
  rows: readonly Row[],
  name: Row["name"],
  code: AdmissionCode,
): Row => {
  const found = rows.find((row) => row.name === name);
  if (found === undefined) {
    throw new RefusalAttributeDefect({ code, name });
  }

  return found;
};

/**
 * Word a refused answer's reasons for its page.
 *
 * @example
 *   refusalMessages(item, refusal, "en");
 *   // [{ response: "RESPONSE", text: "Select at most 2." }]
 *
 * @param item The item the answer was for, whose interactions give the author's own words and the
 *   areas' names.
 * @param refusal The reasons and their attributes, as the database read them back.
 * @param locale The locale to write in.
 * @returns Each reason's response and words, one per reason, in the order the database gave them.
 */
export const refusalMessages = (
  item: Item,
  refusal: Refusal,
  locale: Locale,
): Arr.NonEmptyReadonlyArray<RefusalMessage> => {
  const interactions = interactionsIn(item.body);

  return Arr.map(
    Arr.sort(
      refusal.reasons,
      Order.mapInput(Order.BigInt, (reason: RefusalReason) => reason.ord),
    ),
    (reason) => {
      const words = refusal.words.filter((row) => row.ord === reason.ord);
      const said: Said = {
        count: (name) =>
          one(
            refusal.counts.filter((row) => row.ord === reason.ord),
            name,
            reason.code,
          ).value,
        group: () =>
          words
            .filter((row) => row.name === "group")
            .toSorted(Order.mapInput(Order.BigInt, (row: RefusalWord) => row.place))
            .map((row) => row.value),
        interaction: Option.fromUndefinedOr(
          interactions.find((interaction) => interaction.response === reason.response),
        ),
        locale,
        number: (name) =>
          one(
            refusal.numbers.filter((row) => row.ord === reason.ord),
            name,
            reason.code,
          ).value,
        word: (name) => one(words, name, reason.code).value,
      };

      return { response: reason.response, text: wordings[reason.code](said) };
    },
  );
};
