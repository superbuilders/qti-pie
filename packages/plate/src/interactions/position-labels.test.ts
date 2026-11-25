/**
 * An Order's positions (`positionsOf` in `#plate/interactions/position-labels.ts`), against QTI
 * 3.0's shared vocabulary, Order Target Labels (1.2.9.1) and Order Target Label Suffixes (1.2.9.2),
 * as a table written here apart from the code:
 *
 * - `qti-labels-none`: "No labels displayed", whatever else the root carries;
 * - `qti-labels-decimal`: "Display numeric characters 1, 2, 3, …";
 * - `qti-labels-lower-alpha`: "Display lowercase characters a, b, c, …", z then aa, as CSS's
 *   alphabetic system counts (CSS Counter Styles 3, §3.1.4);
 * - `qti-labels-upper-alpha`: "Display uppercase characters A, B, C, …";
 * - `qti-labels-cjk-ideographic`, the Choice's fourth labeling class ("use the same classes as for
 *   choice interaction"): CSS's `cjk-ideographic` counter, 一, 二, 三;
 * - `qti-labels-suffix-period`, `-parenthesis` and `-none`: ".", ")" or nothing after the label, a
 *   period where a labeling class stands alone, as a Choice's labels take;
 * - No labeling class: "In the absence of order target labeling, delivery systems should render
 *   platform defaults", plate's the position's number; a suffix class there still puts its text
 *   after it ("A right parenthesis ")" character is displayed after the order target label"), and
 *   with no suffix class the number stands alone ("In the absence of order target suffix labeling,
 *   delivery systems should render platform defaults").
 *
 * Every position is named by its number, labelled or not: by its label part only where its label
 * shows exactly its number, else by an `aria-label` of its number.
 *
 * @module
 */
import { assert, describe, it } from "@effect/vitest";
import { Option } from "effect";
import { positionsOf } from "#plate/interactions/position-labels.ts";

/**
 * One row of the table: the root's class, none where it has none, and the label each of the first
 * three positions shows, undefined for none.
 */
interface Row {
  readonly classes: Option.Option<string>;
  readonly labels: readonly (string | undefined)[];
}

/**
 * The table, row by row.
 */
const table: readonly Row[] = [
  { classes: Option.none(), labels: ["1", "2", "3"] },
  { classes: Option.some("qti-orientation-horizontal"), labels: ["1", "2", "3"] },
  { classes: Option.some("qti-labels-suffix-parenthesis"), labels: ["1)", "2)", "3)"] },
  { classes: Option.some("qti-labels-suffix-period"), labels: ["1.", "2.", "3."] },
  { classes: Option.some("qti-labels-suffix-none qti-choices-top"), labels: ["1", "2", "3"] },
  { classes: Option.some("qti-labels-cjk-ideographic"), labels: ["一.", "二.", "三."] },
  {
    classes: Option.some("qti-labels-decimal qti-labels-cjk-ideographic"),
    labels: ["一.", "二.", "三."],
  },
  { classes: Option.some("qti-labels-none"), labels: [undefined, undefined, undefined] },
  {
    classes: Option.some("qti-labels-decimal qti-labels-none"),
    labels: [undefined, undefined, undefined],
  },
  { classes: Option.some("qti-labels-decimal"), labels: ["1.", "2.", "3."] },
  {
    classes: Option.some("qti-labels-lower-alpha qti-labels-suffix-parenthesis"),
    labels: ["a)", "b)", "c)"],
  },
  {
    classes: Option.some("qti-labels-upper-alpha  qti-labels-suffix-none"),
    labels: ["A", "B", "C"],
  },
  {
    classes: Option.some("qti-labels-decimal qti-labels-suffix-period"),
    labels: ["1.", "2.", "3."],
  },
];

describe("an Order's positions under QTI's order target label classes", () => {
  it("label each position as the table says, and name every one by its number", () => {
    for (const row of table) {
      const positions = positionsOf(row.classes, 3, "en");

      assert.deepStrictEqual(
        positions.map((position) => position.label),
        [...row.labels],
        Option.getOrElse(row.classes, () => "no class"),
      );
      assert.deepStrictEqual(
        positions.map((position) => position.name),
        ["1", "2", "3"],
      );
      assert.deepStrictEqual(
        positions.map((position) => position.by),
        row.labels.map((label, index) => (label === `${index + 1}` ? "label-part" : "aria-label")),
        Option.getOrElse(row.classes, () => "no class"),
      );
    }
  });

  it("count past z as CSS's alphabetic system does", () => {
    const positions = positionsOf(Option.some("qti-labels-lower-alpha"), 28, "en");

    assert.deepStrictEqual(
      [25, 26, 27].map((index) => positions[index]?.label),
      ["z.", "aa.", "ab."],
    );
  });

  it("give as many positions as asked, none for none", () => {
    assert.strictEqual(positionsOf(Option.none(), 5, "en").length, 5);
    assert.deepStrictEqual(positionsOf(Option.none(), 0, "en"), []);
  });
});
