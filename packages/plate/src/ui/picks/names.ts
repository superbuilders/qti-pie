/**
 * The names the server gives a picks group's options: a Choice's choice or a Hot Text's hottext
 * whose content a name computed from it would leave short, and the label a Choice's label class
 * numbers each choice with. Safe to import on the server.
 *
 * @module
 */
import { Option } from "effect";
import type { Locale } from "#plate/messages.ts";
import type { RedactedNode } from "#plate/model/item.ts";
import { choiceText, holdsFormula, namesSomething } from "#plate/ui/item/interactions/text.ts";
import type { Place } from "#plate/ui/item/interactions/text.ts";
import { classTokensOf } from "#plate/vocabulary.ts";

/**
 * The CJK digits, zero to nine, of CSS's `cjk-ideographic`.
 */
const cjkDigits = "零一二三四五六七八九";

/**
 * The CJK markers of the thousands, hundreds and tens, in that order.
 */
const cjkMarkers = ["千", "百", "十", ""] as const;

/**
 * Write a number as CSS's `cjk-ideographic` does, `trad-chinese-informal` (CSS Counter Styles 3
 * §7.1.3): each digit with its marker, a run of zeros inside as one 零, zeros at the end dropped,
 * and 一十 written 十 from 10 to 19; from 10,000 on, as `cjk-decimal`, the style's fallback, one
 * digit each, 〇 for zero.
 *
 * @param n The number, from 1.
 * @returns The numeral.
 * @see https://www.w3.org/TR/css-counter-styles-3/#limited-chinese
 */
const cjkIdeographic = (n: number): string => {
  const digits = Array.from(String(n), Number);

  if (n >= 10_000) {
    return digits.map((digit) => (digit === 0 ? "〇" : (cjkDigits[digit] ?? ""))).join("");
  }

  const places = digits.map((digit, index) => {
    const marker = cjkMarkers[cjkMarkers.length - digits.length + index] ?? "";

    return digit === 0 ? "零" : `${cjkDigits[digit] ?? ""}${marker}`;
  });
  const written = places.join("").replace(/零+$/u, "").replaceAll(/零+/gu, "零");

  return n >= 10 && n <= 19 ? written.replace(/^一/u, "") : written;
};

/**
 * Write a number in CSS's alphabetic system over the 26 letters: 1 is A, 26 is Z, 27 is AA.
 *
 * @param n The number, from 1.
 * @returns The letters, upper case.
 * @see https://www.w3.org/TR/css-counter-styles-3/#alphabetic-system
 */
const alphabetic = (n: number): string => {
  let rest = n;
  let written = "";

  while (rest > 0) {
    rest -= 1;
    written = `${String.fromCodePoint(65 + (rest % 26))}${written}`;
    rest = Math.floor(rest / 26);
  }

  return written;
};

/**
 * The label classes of QTI's shared vocabulary (1.2.1.1), each with the counter style it numbers
 * a choice in, in the order plate's theme declares them, so where an author wrote more than one,
 * the last here wins, as it does in the theme.
 */
const labelStyles = [
  ["qti-labels-decimal", String],
  ["qti-labels-lower-alpha", (n: number) => alphabetic(n).toLowerCase()],
  ["qti-labels-upper-alpha", alphabetic],
  ["qti-labels-cjk-ideographic", cjkIdeographic],
] as const;

/**
 * The label suffix classes (1.2.1.2), each with the text it writes after a label, in the theme's
 * order; with none, a period.
 */
const labelSuffixes = [
  ["qti-labels-suffix-period", "."],
  ["qti-labels-suffix-parenthesis", ")"],
  ["qti-labels-suffix-none", ""],
] as const;

/**
 * Give the label a Choice's label class numbers a choice with, as plate's theme draws it before the
 * choice's content (`theme.css`'s choice labels): its place in the class's counter style, then its
 * suffix; none where the root carries no label class, or `qti-labels-none`.
 *
 * @param classes The `class` on the Choice's root, as the page writes it, none where it has none.
 * @param n The choice's place among its choices as presented, from 1.
 * @returns The label.
 */
export const choiceLabel = (classes: Option.Option<string>, n: number): Option.Option<string> => {
  const tokens: readonly string[] = Option.match(classes, {
    onNone: () => [],
    onSome: classTokensOf,
  });
  const style = labelStyles.findLast(([name]) => tokens.includes(name));
  const suffix = labelSuffixes.findLast(([name]) => tokens.includes(name))?.[1] ?? ".";

  return style === undefined || tokens.includes("qti-labels-none")
    ? Option.none()
    : Option.some(`${style[1](n)}${suffix}`);
};

/**
 * Name an option's control where a name computed from the `label` around it would be short of what
 * it shows: where the option carries a label (`choiceLabel`), which the theme draws with no
 * alternative text, since Chrome reads no counter into a name; where its content shows a formula,
 * which Chrome reads into no name either; and where its content names nothing, an image with no
 * alternative text alone. The name is the label, then the content's text with each formula as it
 * says it (`choiceText`), as AlphaTest's player named its options ("A. 1250 × 2 4 × 60"), and
 * "Choice n of count" where the content says nothing, so a screen reader tells every option apart
 * (WCAG 1.1.1, 4.1.2), as an Inline Choice's choice and a chip are named.
 *
 * @param content The option's content, as the `label` around its control holds it.
 * @param place Its place among the options as presented.
 * @param label The label it carries, none where it carries none.
 * @param locale The locale of plate's own text.
 * @returns The name, undefined where the `label` around the control names it whole.
 */
export const optionName = (
  content: readonly RedactedNode[],
  place: Place,
  label: Option.Option<string>,
  locale: Locale,
): string | undefined => {
  if (Option.isNone(label) && namesSomething(content, locale) && !holdsFormula(content)) {
    return undefined;
  }

  const text = choiceText(content, Option.none(), place, locale);

  return Option.match(label, { onNone: () => text, onSome: (written) => `${written} ${text}` });
};
