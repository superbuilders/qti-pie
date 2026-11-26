/**
 * Type numbers into the boxes of a line (`urn:fdc:alpha.school:2026:enter-numbers`): the Portable
 * Custom Interaction of the Grade 4 and 5 mastery gates' entries that a single typed whole number
 * cannot carry, as the assessment lead specifies them (her K–5 TEI list of 2026-11-19, rows 4, 5
 * and 6): a fraction typed as its top and bottom numbers in two stacked boxes, a mixed number
 * with a whole-number box before it, two or more labelled boxes scored as one answer (a quotient
 * and its remainder, a factor pair, an ordered pair), and a decimal typed on a keypad with a point
 * key, written as the AMD module a content package carries and the frame host loads by QTI 3.0.1's
 * own module resolution (`modules/enter-numbers.js`).
 *
 * - **The screen.** The lines the item's markup holds, each a `p` of text and MathML drawn as itself
 *   (its attributes kept, so a line marked silent stays silent to a reader), in large type, with
 *   the entry standing where the markup's `span class="alpha-entry"` stands (the one empty element
 *   the markup marks for it), and the keypad beneath them, as her screens draw it: the keys 1 to 9
 *   in three rows, then 0 between the point key (a decimal entry only, an empty place otherwise)
 *   and backspace, AlphaTest's own child-sized keypad. As `entry` says, the entry is: `whole`, a
 *   box for a whole number at each of the markup's two to four marks; `fraction`, at its one mark,
 *   two boxes stacked, the numerator's above the denominator's and a fraction bar between; `mixed`,
 *   the same with a whole-number box before it; or `decimal`, at its one mark, one box that takes a
 *   point. No box is sized to an answer: each is as wide as `digits` digits.
 * - **The interaction.** One box is the chosen one: at the start, a fraction's or a mixed number's
 *   numerator (the boxes every answer needs come first; a mixed entry's whole-number box, which may
 *   stay empty, is chosen by a tap), any other entry's first box. A key of the keypad types into
 *   it, a tap on a box chooses it. The point pressed in an empty decimal box writes `0.`, the one
 *   zero a box may begin with, so the point a child presses first is kept and the box shows the
 *   number it gives; a digit pressed in a box holding only `0` takes the zero's place. A key the
 *   box's rule refuses (a second point, a digit past `digits`, a zero as a denominator's first
 *   digit) changes nothing, so the box never holds what begins no number it admits. A physical
 *   keyboard types into the focused box too: a digit, `.` for a decimal, Backspace; Tab, the arrows
 *   and `/` (to a fraction's denominator) move between the boxes.
 * - **The response.** An `ordered` list of integers, `{ list: { integer: [...] } }`:
 *
 *   - `whole`: each box's number, in the marks' order (the item's declaration may make the list
 *     `multiple`, so the order means nothing, as for a factor pair);
 *   - `fraction`, `mixed` and `decimal`: the number the entry writes, as its numerator and denominator
 *     in lowest terms, `[n, d]`, `d` at least 1: 6/14 and 3/7 are both `[3, 7]`, 1 1/4 and 5/4 both
 *     `[5, 4]`, 2.50 and 2.5 both `[5, 2]`, 0/4 `[0, 1]`. So `match_correct` scores a fraction, a
 *     mixed number and a decimal on its value, as QTI's integers are scored on their value and never
 *     on how they are spelt, under the one standard template both AlphaTest's marked grader and
 *     qti-pie run. A mixed number's whole-number box alone is that whole number (`3` is `[3, 1]`),
 *     and a decimal's point with no digit after it adds nothing (`3.` is `[3, 1]`, as xs:decimal
 *     reads `3.`). An entry with a box it needs left empty is NULL, `{ list: null }`: every box of a
 *     `whole` entry, the numerator and the denominator of a fraction, and of a mixed number one of
 *     them without the other or both without a whole number. An interaction left untouched sends no
 *     answer (owner's ruling Q6), and an entry no value can be read from is the same screen.
 * - **Coming back.** The stored response decides. Bound to a value, the PCI shows the state it is
 *   handed where that state writes the same value, and otherwise the value in its own spelling: a
 *   `whole` list in its boxes, a fraction as `n` over `d`, a mixed number as its whole part and the
 *   rest over `d` (`2 2/6` and `14/6` both come back `2 1/3`; a whole number, `3 0/1` or `3`, in
 *   its whole-number box alone), a decimal in its shortest digits (`2.50` comes back `2.5`). A host
 *   that keeps only the response (AlphaTest's player hands no state) so shows the number written in
 *   lowest terms, never its spelling, as the other Alpha modules show their counts on the first
 *   parts. Bound to NULL it shows the state's boxes where they write no value, and empty boxes
 *   otherwise; bound to nothing, the state alone decides. Every value the entry writes comes back;
 *   a value it could not have written is refused.
 *
 * **Properties.** Exactly two, each a `data-*` attribute of the `qti-portable-custom-interaction`,
 * read by its dataset name: `data-entry` (`whole`, `fraction`, `mixed` or `decimal`) and
 * `data-digits`, the most digits a box holds (a whole number from 1: up to 9 for `whole` and
 * `decimal`, whose point is no digit, and up to 4 for `fraction` and `mixed`, so the numerator of
 * every mixed number the entry writes is a safe integer). It passes over the two the QTI 3.0.1
 * schema declares on the element (`data-catalog-idref`, `data-qti-suppress-tts`) and refuses any
 * other, and one absent, malformed or out of range, when the PCI is made.
 *
 * **Markup.** One or more `p` elements and nothing else; each holds text, `math` elements (the
 * MathML of a fraction in the line, drawn by the browser) and the entry's marks, each an empty
 * `span` whose only attribute is `class="alpha-entry"`. A `whole` entry has two to four marks, any
 * other kind exactly one. Anything else refuses.
 *
 * **Why a script.** This file is the module file with types (`#plate/alpha/pci-modules.ts` says
 * why): it imports no value and exports nothing, its one statement is the AMD `define` the frame's
 * loader runs, and every helper is inside the factory.
 *
 * @module
 * @see https://www.imsglobal.org/spec/qti/v3p0/impl
 * @see https://github.com/amdjs/amdjs-api/blob/master/AMD.md
 * @see https://www.w3.org/TR/WCAG22/#target-size-enhanced
 */
import type { PciFrameConfiguration } from "#plate/pci/frame-protocol.ts";

/**
 * The configuration the frame's bridge hands a PCI's `getInstance`: the page's, with the response's
 * bound value under its identifier, and the bridge's own `onready`.
 */
interface EnterNumbersConfiguration extends PciFrameConfiguration {
  readonly boundTo: Readonly<Record<string, unknown>>;
  readonly onready: (interaction: EnterNumbersInstance, state: EnterNumbersState) => void;
}

/**
 * The PCI's state: the text of each box, in box order (a mixed number's whole-number box, its
 * numerator, its denominator).
 */
interface EnterNumbersState {
  readonly boxes: readonly string[];
}

/**
 * The Appendix C JSON of the response: an ordered list of integers, NULL for none.
 */
type EnterNumbersResponse =
  | { readonly list: null }
  | { readonly list: { readonly integer: readonly number[] } };

/**
 * The PCI object `getInstance` returns: the two readers the host calls, and `oncompleted`, which
 * the host calls before the PCI's markup goes.
 */
interface EnterNumbersInstance {
  readonly getResponse: () => EnterNumbersResponse;
  readonly getState: () => EnterNumbersState;
  readonly oncompleted: () => void;
}

/**
 * The factory the module registers with the bridge.
 */
interface EnterNumbersFactory {
  readonly getInstance: (
    dom: HTMLElement,
    configuration: EnterNumbersConfiguration,
    state: unknown,
  ) => EnterNumbersInstance;
  readonly typeIdentifier: string;
}

/**
 * The `qtiCustomInteractionContext` bridge, as this module uses it.
 */
interface PciContext {
  readonly register: (factory: EnterNumbersFactory) => void;
}

/**
 * What a box takes: a whole number with no leading zero (`count`: 0 or a number from 1), a number
 * from 1 (`positive`: a denominator, a mixed number's whole part), or a decimal (`decimal`).
 */
type BoxRule = "count" | "decimal" | "positive";

/**
 * One box of the entry: its rule, its accessible name, and where it is drawn.
 */
interface BoxPlan {
  readonly name: string;
  readonly role: "denominator" | "numerator" | "plain" | "whole";
  readonly rule: BoxRule;
}

/**
 * Where the PCI is: answering, with the box the keypad types into chosen, or closed, when the host
 * has completed it and it takes no key, tap or focus.
 */
type Phase = { readonly chosen: number; readonly kind: "answering" } | { readonly kind: "closed" };

/**
 * What the PCI is bound to: no response at all, NULL, or a list of integers.
 */
type Bound =
  | { readonly kind: "list"; readonly value: readonly number[] }
  | { readonly kind: "null" }
  | { readonly kind: "unbound" };

/**
 * AMD's `define` as the frame's loader gives it to a module's script
 * (`#plate/ui/portable-custom/frame-boot.ts`): the module is anonymous, named by the route that
 * loads it, and its one dependency is the bridge.
 *
 * @param dependencies The module's dependencies, by id.
 * @param factory What the loader calls with them.
 */
declare function define(
  dependencies: readonly ["qtiCustomInteractionContext"],
  factory: (qtiCustomInteractionContext: PciContext) => void,
): void;

define(["qtiCustomInteractionContext"], (qtiCustomInteractionContext) => {
  "use strict";

  /**
   * The type identifier the factory serves, the items' `custom-interaction-type-identifier`.
   */
  const typeIdentifier = "urn:fdc:alpha.school:2026:enter-numbers";

  /**
   * The look, AlphaTest's keypad's and its boxes': keys and boxes outlined in `#1f2937` at 2 px
   * with a 10 px radius on white, a mixed number's whole-number box, which may stay empty, dashed
   * in `#6b7280` (4.8:1 on white, past WCAG 2.2's 3:1 for a control's outline), the chosen box
   * ringed in `#1d6fd1` (Alpha's PCIs' mark), the line's type 40 px at weight 600 in `#111827`, and
   * a fraction's bar `#111827` at 3 px.
   *
   * @formatConstant
   */
  const look = {
    bar: 3,
    chosen: "#1d6fd1",
    ink: "#111827",
    line: 40,
    optional: "#6b7280",
    outline: "#1f2937",
    pressed: "#f3f4f6",
    radius: 10,
    stroke: 2,
  };

  /**
   * The keypad's keys and the boxes, in CSS pixels: a key 64 wide and 56 high, 8 apart, its digit
   * 28 px, as AlphaTest's keypad draws them; a box 64 high, each of its digits 26 wide with 14 of
   * padding a side, so every box is at least WCAG 2.2's 44 px target (Target Size, Enhanced) both
   * ways.
   *
   * @formatConstant
   */
  const size = { box: 64, digit: 26, gap: 8, key: { height: 56, text: 28, width: 64 }, pad: 14 };

  /**
   * The most digits a box holds, by entry: a fraction's or a mixed number's boxes hold four, so the
   * numerator of the mixed number they write (`w × d + n`, below 10⁸) is a safe integer; a whole
   * number's or a decimal's nine (a decimal's numerator below 10⁹).
   */
  const mostDigits = { decimal: 9, fraction: 4, mixed: 4, whole: 9 } as const;

  /**
   * The marks a `whole` entry's markup holds: two to four boxes scored as one answer.
   */
  const wholeMarks = { least: 2, most: 4 };

  /**
   * The keypad's rows, AlphaTest's: 1 to 9, then the point (a decimal entry only), 0 and backspace.
   */
  const rows = [
    ["1", "2", "3"],
    ["4", "5", "6"],
    ["7", "8", "9"],
    [".", "0", "backspace"],
  ] as const;

  /**
   * Whether a text is one or more of the digits 0 to 9 and nothing else.
   *
   * @param text The text.
   * @returns Whether it is digits alone.
   */
  const isDigits = (text: string): boolean =>
    text !== "" && text.split("").every((character) => character >= "0" && character <= "9");

  /**
   * Whether a text writes a number from 1 with no leading zero: digits, the first of them no 0.
   *
   * @param text The text.
   * @returns Whether it writes such a number.
   */
  const isCounting = (text: string): boolean => isDigits(text) && !text.startsWith("0");

  /**
   * Whether a text writes a whole number with no leading zero: 0, or a number from 1.
   *
   * @param text The text.
   * @returns Whether it writes such a number.
   */
  const isWhole = (text: string): boolean => text === "0" || isCounting(text);

  /**
   * Whether a text writes a decimal: a whole number, then any point followed by one or more
   * digits.
   *
   * @param text The text.
   * @returns Whether it writes a decimal.
   */
  const isDecimal = (text: string): boolean => {
    const point = text.indexOf(".");

    return point === -1
      ? isWhole(text)
      : isWhole(text.slice(0, point)) && isDigits(text.slice(point + 1));
  };

  /**
   * The class of the empty `span` that marks where the entry stands in a line.
   */
  const markClass = "alpha-entry";

  /**
   * The MathML namespace, a `math` element's in the markup.
   */
  const mathNamespace = "http://www.w3.org/1998/Math/MathML";

  /**
   * The properties QTI 3.0.1's schema declares on the element itself, by dataset name
   * (`data-catalog-idref`, `data-qti-suppress-tts`): passed over, never read.
   */
  const qtiOwn: ReadonlySet<string> = new Set(["catalogIdref", "qtiSuppressTts"]);

  /**
   * The properties the PCI reads, by dataset name.
   */
  const reads: ReadonlySet<string> = new Set(["digits", "entry"]);

  /**
   * The item's configuration of the PCI refused: a property it reads is absent, malformed or out of
   * range, its markup is not lines with the entry's marks, or the state or bound response it is
   * handed is none the entry could write. `getInstance` throwing is the PCI contract's one failure:
   * the frame's boot reports the PCI `failed`, with the message as its reason.
   */
  class EnterNumbersRefusedError extends Error {
    override readonly name = "EnterNumbersRefusedError";
  }

  /**
   * Refuse the configuration: throw {@link EnterNumbersRefusedError}, its message the PCI's name,
   * what breaks the rule, and the repair.
   *
   * @param detail What breaks the rule, and the repair.
   * @returns Never.
   * @throws {EnterNumbersRefusedError} Always.
   */
  const refuse = (detail: string): never => {
    throw new EnterNumbersRefusedError(
      `The enter-numbers PCI (${typeIdentifier}) cannot run: ${detail}`,
    );
  };

  /**
   * Give a property's attribute, as an item writes it: `data-` and its dataset name with each
   * upper-case letter lowered after a `-`.
   *
   * @param name The dataset name.
   * @returns The attribute's name.
   */
  const attributeOf = (name: string): string =>
    `data-${Array.from(name, (character) =>
      character >= "A" && character <= "Z" ? `-${character.toLowerCase()}` : character,
    ).join("")}`;

  /**
   * Read the entry's kind, and refuse a property the PCI does not read.
   *
   * @param properties The PCI's properties.
   * @returns The kind.
   * @throws {EnterNumbersRefusedError} When the kind is unknown or another property is written.
   */
  const entryOf = (properties: Readonly<Record<string, string>>): keyof typeof mostDigits => {
    const other = Object.keys(properties).find((name) => !reads.has(name) && !qtiOwn.has(name));

    if (other !== undefined) {
      return refuse(
        `its property ${attributeOf(other)} is none the PCI reads; remove it, or correct its name.`,
      );
    }

    const { entry } = properties;

    return entry === "whole" || entry === "fraction" || entry === "mixed" || entry === "decimal"
      ? entry
      : refuse(
          `its property data-entry is ${entry === undefined ? "absent" : `"${entry}"`}; write whole, fraction, mixed or decimal.`,
        );
  };

  /**
   * Read the most digits a box holds.
   *
   * @param properties The PCI's properties.
   * @param entry The entry's kind.
   * @returns The digits.
   * @throws {EnterNumbersRefusedError} When the property is absent, no count, or past the kind's
   *   most.
   */
  const digitsOf = (
    properties: Readonly<Record<string, string>>,
    entry: keyof typeof mostDigits,
  ): number => {
    const written = properties["digits"];

    if (written === undefined || !isCounting(written)) {
      return refuse(
        `its property data-digits is ${written === undefined ? "absent" : `"${written}"`}; write it as a whole number from 1 with no leading zero.`,
      );
    }

    return Number(written) <= mostDigits[entry]
      ? Number(written)
      : refuse(
          `its property data-digits is ${written}, more than a ${entry} entry's box holds; write 1 to ${String(mostDigits[entry])}.`,
        );
  };

  /**
   * Read the markup: its lines, each a `p` of text, `math` and marks, and its marks, in document
   * order.
   *
   * @param dom The element holding the markup.
   * @param entry The entry's kind.
   * @returns The lines and the marks.
   * @throws {EnterNumbersRefusedError} When the markup is not such lines, or holds another number
   *   of marks than the kind takes.
   */
  const markupOf = (
    dom: HTMLElement,
    entry: keyof typeof mostDigits,
  ): { readonly lines: readonly Element[]; readonly marks: readonly Element[] } => {
    const loose = [...dom.childNodes].some(
      (node) => node.nodeType === node.TEXT_NODE && (node.textContent ?? "").trim() !== "",
    );
    const lines = [...dom.children];

    if (loose || lines.length === 0 || lines.some((line) => line.localName !== "p")) {
      return refuse(
        "its markup is not lines; it holds one or more p elements, the lines the entry stands in, and nothing else.",
      );
    }

    const inLines = lines.flatMap((line) => [...line.children]);
    const stray = inLines.find(
      (element) =>
        !(element.localName === "math" && element.namespaceURI === mathNamespace) &&
        !(element.localName === "span"),
    );

    if (stray !== undefined) {
      return refuse(
        `a line of its markup holds a ${stray.localName}; a line holds text, math and the entry's marks alone.`,
      );
    }

    const marks = inLines.filter((element) => element.localName === "span");
    const malformed = marks.find(
      (mark) =>
        mark.childNodes.length > 0 ||
        mark.attributes.length !== 1 ||
        mark.getAttribute("class") !== markClass,
    );

    if (malformed !== undefined) {
      return refuse(
        `a span of its markup is not the entry's mark; a mark is an empty span whose only attribute is class="${markClass}".`,
      );
    }

    const fits =
      entry === "whole"
        ? marks.length >= wholeMarks.least && marks.length <= wholeMarks.most
        : marks.length === 1;

    return fits
      ? { lines, marks }
      : refuse(
          `its markup marks ${String(marks.length)} places for the entry; a ${entry} entry stands at ${entry === "whole" ? `${String(wholeMarks.least)} to ${String(wholeMarks.most)}` : "exactly one"}.`,
        );
  };

  /**
   * Give the boxes of an entry, in box order: a `whole` entry's at each of its marks, a fraction's
   * numerator and denominator, a mixed number's whole part before them, a decimal's one.
   *
   * @param entry The entry's kind.
   * @param marks The marks.
   * @returns The boxes.
   */
  const plansOf = (entry: keyof typeof mostDigits, marks: number): readonly BoxPlan[] => {
    const numerator: BoxPlan = { name: "numerator", role: "numerator", rule: "count" };
    const denominator: BoxPlan = { name: "denominator", role: "denominator", rule: "positive" };

    if (entry === "whole") {
      return Array.from({ length: marks }, (_unused, index) => ({
        name: `box ${String(index + 1)} of ${String(marks)}`,
        role: "plain",
        rule: "count",
      }));
    }

    if (entry === "fraction") {
      return [numerator, denominator];
    }

    return entry === "mixed"
      ? [{ name: "whole number", role: "whole", rule: "positive" }, numerator, denominator]
      : [{ name: "number", role: "plain", rule: "decimal" }];
  };

  /**
   * The digits a box's text holds, its point aside.
   *
   * @param text The text.
   * @returns The digits.
   */
  const digitCount = (text: string): number => text.replace(".", "").length;

  /**
   * Whether a box's text is a number its rule admits, complete: a count `0` or `[1-9][0-9]*`, a
   * positive number `[1-9][0-9]*`, a decimal a count with any point followed by a digit; each with
   * at most `digits` digits.
   *
   * @param text The text.
   * @param rule The box's rule.
   * @param digits The most digits.
   * @returns Whether it is admitted.
   */
  const isAdmitted = (text: string, rule: BoxRule, digits: number): boolean => {
    const writes = { count: isWhole, decimal: isDecimal, positive: isCounting }[rule];

    return writes(text) && digitCount(text) <= digits;
  };

  /**
   * Whether a box's text begins a number its rule admits, the empty text included: a key is kept
   * only where it leaves the box so. A decimal's point is kept only with a digit left to follow it.
   *
   * @param text The text.
   * @param rule The box's rule.
   * @param digits The most digits.
   * @returns Whether it begins an admitted number.
   */
  const isBeginning = (text: string, rule: BoxRule, digits: number): boolean =>
    text === "" ||
    isAdmitted(text, rule, digits) ||
    (rule === "decimal" &&
      text.endsWith(".") &&
      isWhole(text.slice(0, -1)) &&
      digitCount(text) < digits);

  /**
   * The text a key leaves in a box: backspace removes its last character; the point pressed in an
   * empty decimal box writes `0.` (a decimal's one leading zero, so a point typed first is kept); a
   * digit pressed in a box holding only `0` takes the zero's place (so the box never begins with a
   * zero before a digit, and the digit is never lost); any other key is appended. Whether the box
   * keeps it is {@link isBeginning}'s.
   *
   * @param before The box's text.
   * @param key The key: a digit, the point or backspace.
   * @param rule The box's rule.
   * @returns The text the key would leave.
   */
  const typedInto = (before: string, key: string, rule: BoxRule): string => {
    if (key === "backspace") {
      return before.slice(0, -1);
    }

    if (key === "." && before === "" && rule === "decimal") {
      return "0.";
    }

    return before === "0" && isDigits(key) ? key : `${before}${key}`;
  };

  /**
   * The greatest common divisor of two whole numbers, Euclid's.
   *
   * @param left One.
   * @param right The other.
   * @returns Their greatest common divisor, the other for a zero.
   */
  const divisor = (left: number, right: number): number => {
    let [a, b] = [left, right];

    while (b !== 0) {
      [a, b] = [b, a % b];
    }

    return a;
  };

  /**
   * A fraction in lowest terms, `[n, d]` with `d` at least 1: zero is `[0, 1]`.
   *
   * @param numerator Its numerator, from 0.
   * @param denominator Its denominator, from 1.
   * @returns The fraction in lowest terms.
   */
  const lowest = (numerator: number, denominator: number): readonly [number, number] => {
    const common = divisor(numerator, denominator);

    return [numerator / common, denominator / common];
  };

  /**
   * The value an entry's boxes write, or none where a box it needs is empty or holds no admitted
   * number. A mixed number's whole-number box alone writes that whole number, and a decimal's point
   * with no digit after it adds nothing.
   *
   * @param entry The entry's kind.
   * @param texts The boxes' texts, in box order.
   * @param plans The boxes.
   * @param digits The most digits.
   * @returns The response's list, or `undefined` for NULL.
   */
  const valueOf = (
    entry: keyof typeof mostDigits,
    texts: readonly string[],
    plans: readonly BoxPlan[],
    digits: number,
  ): readonly number[] | undefined => {
    const admitted = (index: number): boolean =>
      isAdmitted(texts[index] ?? "", plans[index]?.rule ?? "count", digits);

    if (entry === "whole") {
      return texts.every((_text, index) => admitted(index)) ? texts.map(Number) : undefined;
    }

    if (entry === "decimal") {
      const [typed = ""] = texts;
      const text = typed.endsWith(".") ? typed.slice(0, -1) : typed;
      const places = text.includes(".") ? text.length - text.indexOf(".") - 1 : 0;

      return isAdmitted(text, "decimal", digits)
        ? lowest(Number(text.replace(".", "")), 10 ** places)
        : undefined;
    }

    const [whole, numerator, denominator] = entry === "mixed" ? texts : ["", ...texts];
    const fractionAt = entry === "mixed" ? 1 : 0;

    if (entry === "mixed" && admitted(0) && numerator === "" && denominator === "") {
      return lowest(Number(whole), 1);
    }

    const wholeKept = entry !== "mixed" || whole === "" || admitted(0);

    return wholeKept && admitted(fractionAt) && admitted(fractionAt + 1)
      ? lowest(
          Number(whole === "" ? "0" : whole) * Number(denominator) + Number(numerator),
          Number(denominator),
        )
      : undefined;
  };

  /**
   * Write a value in the entry's own spelling: a `whole` list in its boxes, a fraction as `n` over
   * `d`, a mixed number as its whole part (as much of it as the whole-number box's digits hold, the
   * box empty below 1) and the rest over `d` (a whole number that box holds in it alone, the
   * fraction's boxes empty), a decimal in its shortest digits. Every value the
   * entry writes has this spelling within its boxes' digits (a mixed number's whole part past them
   * leaves a rest no greater than the numerator typed), so the boxes can always show again what
   * they gave. None where the entry could not have written the value.
   *
   * @param entry The entry's kind.
   * @param value The value, the response's list.
   * @param plans The boxes.
   * @param digits The most digits.
   * @returns The boxes' texts, or `undefined`.
   */
  const spellingOf = (
    entry: keyof typeof mostDigits,
    value: readonly number[],
    plans: readonly BoxPlan[],
    digits: number,
  ): readonly string[] | undefined => {
    const fits = (texts: readonly string[]): readonly string[] | undefined =>
      texts.length === plans.length &&
      texts.every(
        (text, index) =>
          (entry === "mixed" && index === 0 && text === "") ||
          (entry === "mixed" &&
            index > 0 &&
            texts[0] !== "" &&
            texts[1] === "" &&
            texts[2] === "") ||
          isAdmitted(text, plans[index]?.rule ?? "count", digits),
      )
        ? texts
        : undefined;
    const naturals = value.every((member) => Number.isSafeInteger(member) && member >= 0);

    if (entry === "whole" || !naturals) {
      return naturals ? fits(value.map(String)) : undefined;
    }

    const [numerator = -1, denominator = 0] = value;

    if (value.length !== 2 || denominator < 1 || divisor(numerator, denominator) !== 1) {
      return undefined;
    }

    if (entry === "fraction") {
      return fits([String(numerator), String(denominator)]);
    }

    if (entry === "mixed") {
      const whole = Math.min(Math.floor(numerator / denominator), 10 ** digits - 1);
      const rest = numerator - whole * denominator;

      return whole > 0 && rest === 0
        ? fits([String(whole), "", ""])
        : fits([whole === 0 ? "" : String(whole), String(rest), String(denominator)]);
    }

    let places = 0;

    while (places <= digits && (numerator * 10 ** places) % denominator !== 0) {
      places += 1;
    }

    const scaled = String((numerator * 10 ** places) / denominator).padStart(places + 1, "0");
    const text =
      places === 0 ? scaled : `${scaled.slice(0, -places)}.${scaled.slice(scaled.length - places)}`;

    return fits([text]);
  };

  /**
   * Read the boxes' texts from the state the PCI is handed: `{ boxes }`, or its JSON text.
   *
   * @param state The state, as the host hands it, never `undefined` or `null`.
   * @param plans The boxes.
   * @param digits The most digits.
   * @returns The boxes' texts.
   * @throws {EnterNumbersRefusedError} When the state names no texts the boxes could hold.
   */
  const textsOfState = (
    state: unknown,
    plans: readonly BoxPlan[],
    digits: number,
  ): readonly string[] => {
    const read: unknown = typeof state === "string" ? JSON.parse(state) : state;
    const boxes: unknown =
      typeof read === "object" && read !== null && "boxes" in read ? read.boxes : undefined;

    return Array.isArray(boxes) &&
      boxes.length === plans.length &&
      boxes.every(
        (text: unknown, index) =>
          typeof text === "string" && isBeginning(text, plans[index]?.rule ?? "count", digits),
      )
      ? boxes.map(String)
      : refuse(
          "the state it was handed names no text its boxes could hold; hand it the state its getState gave.",
        );
  };

  /**
   * Read the value the PCI is bound to, an ordered integer response's Appendix C JSON: nothing
   * bound is `unbound`, `{ list: null }` or an empty list NULL (`null`), a list of integers that
   * list.
   *
   * @param bound The bound value.
   * @returns What the PCI is bound to.
   * @throws {EnterNumbersRefusedError} When the JSON is no ordered integer value.
   */
  const valueOfBound = (bound: unknown): Bound => {
    if (bound === undefined) {
      return { kind: "unbound" };
    }

    const list: unknown =
      typeof bound === "object" && bound !== null && "list" in bound ? bound.list : undefined;

    if (list === null) {
      return { kind: "null" };
    }

    const members: unknown =
      typeof list === "object" && "integer" in list ? list.integer : undefined;

    if (Array.isArray(members) && members.every((member) => Number.isSafeInteger(member))) {
      return members.length === 0 ? { kind: "null" } : { kind: "list", value: members.map(Number) };
    }

    return refuse(
      "the response it is bound to is no list of integers; bind it to the ordered integer response it gave.",
    );
  };

  /**
   * Whether two values are one: both NULL, or the same integers in the same order.
   *
   * @param left One, `undefined` for NULL.
   * @param right The other.
   * @returns Whether they are one value.
   */
  const sameValue = (
    left: readonly number[] | undefined,
    right: readonly number[] | undefined,
  ): boolean =>
    left === undefined || right === undefined
      ? left === right
      : left.length === right.length && left.every((member, index) => member === right[index]);

  /**
   * Write the PCI's stylesheet into the frame's document, keyed on its `data-enter` parts: the
   * lines and the keypad beneath them, the lines in large type, each box a tap target that neither
   * drags nor selects, the chosen one ringed, a fraction's boxes stacked over its bar.
   *
   * @param document The frame's document.
   */
  const style = (document: Document): void => {
    const sheet = document.createElement("style");
    const part = (name: string): string => `[data-enter="${name}"]`;
    const keypadWidth = 3 * size.key.width + 2 * size.gap;

    sheet.textContent = [
      `${part("whole")}{display:flex;flex-direction:column;align-items:flex-start;gap:24px;font-family:system-ui,-apple-system,"Segoe UI",Roboto,Arial,sans-serif;color:${look.ink};color-scheme:light;user-select:none;-webkit-user-select:none;-webkit-touch-callout:none}`,
      `${part("lines")}{display:flex;flex-direction:column;gap:16px}`,
      `${part("lines")}>p{margin:0;font-size:${String(look.line)}px;font-weight:600;line-height:1.2;display:flex;flex-wrap:wrap;align-items:center;gap:0 12px}`,
      `${part("lines")}>p math{font-family:inherit;font-size:1em;font-weight:600;math-style:normal}`,
      `${part("lines")}>p mn{font-weight:600}`,
      `${part("box")}{box-sizing:border-box;display:inline-flex;align-items:center;justify-content:center;height:${String(size.box)}px;padding:0 ${String(size.pad)}px;border:${String(look.stroke)}px solid ${look.outline};border-radius:${String(look.radius)}px;background:#fff;font-size:${String(look.line)}px;font-weight:600;line-height:1;cursor:text;touch-action:manipulation;-webkit-tap-highlight-color:transparent;outline:none;font-variant-numeric:tabular-nums}`,
      `${part("box")}[data-box="whole"]{border-style:dashed;border-color:${look.optional}}`,
      `${part("box")}[data-chosen]{border-color:${look.chosen};box-shadow:0 0 0 2px ${look.chosen}}`,
      `${part("box")}[aria-disabled="true"]{cursor:default}`,
      `${part("box")}:focus-visible{outline:3px dashed #555;outline-offset:3px}`,
      `${part("number")}{display:inline-flex;align-items:center;gap:10px}`,
      `${part("fraction")}{display:inline-flex;flex-direction:column;align-items:stretch;gap:6px}`,
      `${part("bar")}{height:${String(look.bar)}px;background:${look.ink};border-radius:1px}`,
      `${part("keypad")}{display:grid;grid-template-columns:repeat(3,${String(size.key.width)}px);gap:${String(size.gap)}px;width:${String(keypadWidth)}px}`,
      `${part("key")}{box-sizing:border-box;height:${String(size.key.height)}px;width:${String(size.key.width)}px;border:${String(look.stroke)}px solid ${look.outline};border-radius:${String(look.radius)}px;background:#fff;color:${look.ink};font:600 ${String(size.key.text)}px/1 system-ui,-apple-system,"Segoe UI",Roboto,Arial,sans-serif;touch-action:manipulation;-webkit-tap-highlight-color:transparent;padding:0;cursor:pointer}`,
      `${part("key")}:active{background:${look.pressed}}`,
      `${part("key")}:disabled{cursor:default}`,
    ].join("\n");
    document.head.append(sheet);
  };

  /**
   * Render the PCI into its `dom`: the markup's lines with the entry's boxes at its marks, the
   * keypad beneath them, the boxes holding what the PCI comes back with, and the host told it is
   * ready.
   *
   * @param dom The element the frame hands it, holding the markup.
   * @param configuration The configuration: the properties, the response identifier, the status,
   *   the bound response and `onready`.
   * @param state The state to restore, `undefined` (or `null`) for none.
   * @returns The PCI object.
   * @throws {EnterNumbersRefusedError} When the configuration does not fit the PCI.
   */
  const getInstance = (
    dom: HTMLElement,
    configuration: EnterNumbersConfiguration,
    state: unknown,
  ): EnterNumbersInstance => {
    const { properties, responseIdentifier } = configuration;
    const entry = entryOf(properties);
    const digits = digitsOf(properties, entry);
    const { lines, marks } = markupOf(dom, entry);
    const plans = plansOf(entry, marks.length);
    const document = dom.ownerDocument;
    const bound = valueOfBound(configuration.boundTo[responseIdentifier]);
    const stateTexts =
      state === undefined || state === null ? undefined : textsOfState(state, plans, digits);
    const empty = plans.map(() => "");
    const boundTexts =
      bound.kind === "list"
        ? (spellingOf(entry, bound.value, plans, digits) ??
          refuse(
            `the response it is bound to, [${bound.value.join(", ")}], is no value a ${entry} entry of ${String(digits)} digits writes; bind it to the response it gave.`,
          ))
        : empty;
    /**
     * The boxes' texts. The stored response decides: a state is kept only where it writes the value
     * the response it is bound to holds (NULL writing none), and decides alone only where no
     * response is bound at all.
     */
    const texts = [
      ...(bound.kind === "unbound" ||
      (stateTexts !== undefined &&
        sameValue(
          valueOf(entry, stateTexts, plans, digits),
          bound.kind === "list" ? bound.value : undefined,
        ))
        ? (stateTexts ?? empty)
        : boundTexts),
    ];
    const whole = document.createElement("div");
    const keypad = document.createElement("div");
    const boxes = plans.map((plan) => {
      const box = document.createElement("span");

      box.dataset["enter"] = "box";
      box.dataset["box"] = plan.role;
      box.setAttribute("role", "textbox");
      box.setAttribute("aria-label", plan.name);
      box.setAttribute("aria-readonly", "true");
      box.style.minWidth = `${String(digits * size.digit + 2 * size.pad)}px`;

      return box;
    });
    const keys = rows.flat().map((key) => {
      const button = document.createElement("button");

      button.type = "button";
      button.dataset["enter"] = "key";
      button.dataset["key"] = key;
      button.setAttribute("aria-label", key === "backspace" ? "Backspace" : key);
      button.textContent = key === "backspace" ? "⌫" : key;

      return button;
    });
    const opening = Math.max(
      0,
      plans.findIndex((plan) => plan.role === "numerator"),
    );
    let phase: Phase =
      configuration.status === "interacting"
        ? { chosen: opening, kind: "answering" }
        : { kind: "closed" };

    /**
     * Give the response: the value the boxes write, NULL for none.
     *
     * @returns The Appendix C JSON.
     */
    const getResponse = (): EnterNumbersResponse => {
      const value = valueOf(entry, texts, plans, digits);

      return value === undefined ? { list: null } : { list: { integer: value } };
    };

    /**
     * Give the state: the text of each box, in box order.
     *
     * @returns The state.
     */
    const getState = (): EnterNumbersState => ({ boxes: [...texts] });

    /**
     * Show every box's text, the chosen one ringed, and whether the boxes and keys take input.
     */
    const show = (): void => {
      const answering = phase.kind === "answering";

      for (const [index, box] of boxes.entries()) {
        box.textContent = texts[index] ?? "";
        box.toggleAttribute("data-chosen", phase.kind === "answering" && index === phase.chosen);
        box.setAttribute("aria-disabled", String(!answering));
        box.setAttribute("tabindex", answering ? "0" : "-1");
      }

      for (const key of keys) {
        key.disabled = !answering || (key.dataset["key"] === "." && entry !== "decimal");
        key.style.visibility =
          key.dataset["key"] === "." && entry !== "decimal" ? "hidden" : "visible";
      }
    };

    const instance: EnterNumbersInstance = {
      getResponse,
      getState,
      oncompleted: () => {
        phase = { kind: "closed" };
        show();
      },
    };

    /**
     * Type a key into the chosen box where its rule keeps it, and tell the host the response
     * changed; nothing once the PCI no longer takes input, or for a key the box refuses.
     *
     * @param key The key: a digit, the point or backspace.
     */
    const type = (key: string): void => {
      if (phase.kind === "closed") {
        return;
      }

      const { chosen } = phase;
      const before = texts[chosen] ?? "";
      const rule = plans[chosen]?.rule ?? "count";
      const after = typedInto(before, key, rule);

      if (after === before || !isBeginning(after, rule, digits)) {
        return;
      }

      texts[chosen] = after;
      show();
      dom.dispatchEvent(
        new CustomEvent("qti-interaction-changed", {
          bubbles: true,
          detail: { interaction: instance, responseIdentifier, value: getResponse() },
        }),
      );
    };

    /**
     * Choose a box, and focus it where `focus` asks (a tap focuses it itself; a key moves the
     * focus).
     *
     * @param index The box's place.
     * @param focus Whether to move the keyboard's focus to it.
     */
    const choose = (index: number, focus: boolean): void => {
      if (phase.kind === "closed" || index < 0 || index >= boxes.length) {
        return;
      }

      phase = { chosen: index, kind: "answering" };
      show();

      if (focus) {
        boxes[index]?.focus();
      }
    };

    /**
     * Act on a key pressed in a box with no chord: a digit or the point types, Backspace deletes,
     * the arrows move to the box before or after, and `/` moves from a numerator to its
     * denominator. Tab moves the focus as the browser moves it.
     *
     * @param event The key event.
     * @param index The box's place.
     */
    const keyIn = (event: KeyboardEvent, index: number): void => {
      if (event.altKey || event.ctrlKey || event.metaKey) {
        return;
      }

      choose(index, false);

      if (
        (event.key.length === 1 && isDigits(event.key)) ||
        event.key === "." ||
        event.key === "Backspace"
      ) {
        event.preventDefault();
        type(event.key === "Backspace" ? "backspace" : event.key);

        return;
      }

      const step = {
        "/": plans[index]?.role === "numerator" ? 1 : 0,
        ArrowDown: 1,
        ArrowLeft: -1,
        ArrowRight: 1,
        ArrowUp: -1,
      }[event.key];

      if (step !== undefined) {
        event.preventDefault();
        choose(index + step, true);
      }
    };

    for (const [index, box] of boxes.entries()) {
      box.addEventListener("pointerdown", () => {
        choose(index, false);
      });
      box.addEventListener("focus", () => {
        choose(index, false);
      });
      box.addEventListener("keydown", (event) => {
        keyIn(event, index);
      });
    }

    for (const key of keys) {
      key.addEventListener("pointerdown", (event) => {
        event.preventDefault();
      });
      key.addEventListener("mousedown", (event) => {
        event.preventDefault();
      });
      key.addEventListener("click", () => {
        type(key.dataset["key"] ?? "");
      });
    }

    /**
     * The entry as it stands at a mark: a box, a fraction's boxes over its bar, or a mixed number's
     * whole-number box before its fraction.
     *
     * @param at The mark's place.
     * @returns The entry's element.
     */
    const entryAt = (at: number): HTMLElement => {
      if (entry === "whole" || entry === "decimal") {
        return boxes[at] ?? document.createElement("span");
      }

      const [first, second, third] = boxes;
      const fraction = document.createElement("span");
      const bar = document.createElement("span");
      const [numerator, denominator] = entry === "mixed" ? [second, third] : [first, second];

      fraction.dataset["enter"] = "fraction";
      bar.dataset["enter"] = "bar";
      bar.setAttribute("aria-hidden", "true");
      fraction.append(numerator ?? "", bar, denominator ?? "");

      if (entry === "fraction") {
        return fraction;
      }

      const number = document.createElement("span");

      number.dataset["enter"] = "number";
      number.append(first ?? "", fraction);

      return number;
    };

    for (const [at, mark] of marks.entries()) {
      mark.replaceWith(entryAt(at));
    }

    const column = document.createElement("div");

    column.dataset["enter"] = "lines";

    for (const line of lines) {
      column.append(line);
    }

    keypad.dataset["enter"] = "keypad";
    keypad.setAttribute("role", "group");
    keypad.setAttribute("aria-label", "Number keypad");

    for (const key of keys) {
      keypad.append(key);
    }

    style(document);
    whole.dataset["enter"] = "whole";
    whole.append(column, keypad);
    dom.replaceChildren(whole);
    show();
    configuration.onready(instance, getState());

    return instance;
  };

  qtiCustomInteractionContext.register({ getInstance, typeIdentifier });
});
