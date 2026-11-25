/**
 * The label an Order's position shows, as QTI's shared vocabulary asks for one on the Order's root.
 * Safe to import on the server.
 *
 * Order Target Labels (1.2.9.1) and Order Target Label Suffixes (1.2.9.2): "For explicit labeling
 * of order target elements, use the same classes as for choice interaction". So a position takes
 * the label a Choice's choice at the same place takes (`choiceLabel`, one reading of those classes
 * for both): under a labeling class (`qti-labels-decimal`, `qti-labels-lower-alpha`,
 * `qti-labels-upper-alpha`, and the Choice's `qti-labels-cjk-ideographic`), the place in the last
 * one's counter style, then the last suffix class's text (`qti-labels-suffix-none`, `-period`,
 * `-parenthesis`), a period by default; under `qti-labels-none`, no label.
 *
 * The vocabulary's table marks `qti-labels-none` "(default)", and its text leaves the default to
 * the platform: "In the absence of order target labeling, delivery systems should render platform
 * defaults", and "In the absence of order target suffix labeling, delivery systems should render
 * platform defaults". plate's default is the position's number, as it numbered every position
 * before it read these classes, so an Order whose author named no label keeps the numbers its
 * children and its screens have shown, and an author who wants none writes `qti-labels-none`. A
 * suffix class without a labeling class suffixes that default ("A right parenthesis ")" character
 * is displayed after the order target label"); with neither, the number stands alone.
 *
 * The label is what the eye reads. A position's name, which names it to a screen reader and in
 * every announcement, is its number whatever its label, since a position is a place in an order and
 * stays one where it shows no label or another label.
 *
 * @module
 */
import { Option } from "effect";
import { choiceLabel, labelSuffix } from "#plate/interactions/option-names.ts";
import { numeral } from "#plate/messages.ts";
import type { Locale } from "#plate/messages.ts";
import { classTokensOf } from "#plate/vocabulary.ts";

/**
 * The labeling classes a Choice reads (1.2.1.1), which Order Target Labels reuses (1.2.9.1): a root
 * that carries one of them asks for its positions' labels, and one that carries none is given
 * plate's default.
 */
const labelingClasses = [
  "qti-labels-none",
  "qti-labels-decimal",
  "qti-labels-lower-alpha",
  "qti-labels-upper-alpha",
  "qti-labels-cjk-ideographic",
] as const;

/**
 * One position of an Order as the island shows it: its name, its number as plate's catalog writes
 * numbers; the label it shows, undefined where the root asks for none; and how the page names it,
 * by its label part only where the label shows its name (the primitive's `label-part` names a
 * target by its label's text), else by an `aria-label` of its name, so a position labelled "a." or
 * "1)" is still named "1".
 */
export interface Position {
  readonly by: "aria-label" | "label-part";
  readonly label: string | undefined;
  readonly name: string;
}

/**
 * Give an Order's positions, each its name and the label its root's classes ask for.
 *
 * @param classes The `class` on the Order's root, as the page writes it, none where it has none.
 * @param count How many positions the Order shows.
 * @param locale The locale of plate's own text.
 * @returns The positions, the first position's first.
 */
export const positionsOf = (
  classes: Option.Option<string>,
  count: number,
  locale: Locale,
): readonly Position[] => {
  const asked = Option.exists(classes, (written) =>
    classTokensOf(written).some((token) => labelingClasses.some((name) => name === token)),
  );
  const suffix = Option.getOrElse(labelSuffix(classes), () => "");

  return Array.from({ length: count }, (_, index): Position => {
    const name = numeral(locale, index + 1);

    const label = asked
      ? Option.getOrUndefined(choiceLabel(classes, index + 1))
      : `${name}${suffix}`;

    return { by: label === name ? "label-part" : "aria-label", label, name };
  });
};
