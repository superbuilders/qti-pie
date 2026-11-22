/**
 * The math entry: a Text Entry whose author marked it with plate's presentation class
 * {@link mathEntryClass} is answered in a MathLive math field, under the virtual keyboard
 * AlphaTest's player gave its math tests, and its response is the field's LaTeX. The interaction
 * stays a standard `qti-text-entry-interaction`, so any other player shows its plain box, and the
 * class changes how plate presents it, never what its response is: a string, read as the box's is.
 *
 * Everything here is AlphaTest's player as it shipped (mastery-track-player at 941a86a, MathLive
 * 0.105.3 by its `package-lock.json`), so the same keystrokes give the same LaTeX:
 *
 * - {@link fieldSettings}, the options its player set on every math field
 *   (`src/components/questions/NumericEntry.tsx` lines 1060–1094 and 1852–1880,
 *   `src/components/questions/CompositeItem.tsx` lines 826–841); every other option is MathLive's
 *   default there and here;
 * - {@link keyboardLayout}, its virtual keyboard, the one layout it gave `mathVirtualKeyboard`
 *   (`NumericEntry.tsx` lines 1111–1172, `CompositeItem.tsx` lines 851–912), character for
 *   character;
 * - {@link setUpField}, which applies both to a connected field, as its player did once the field was
 *   in the page.
 *
 * Two of AlphaTest's settings are kept although they read as slips, since each changes what a key
 * gives or shows: a key's `latex` writes `▢` as the character U+25A2, which MathLive inserts as a
 * symbol, not a placeholder, so the fraction key gives `\frac{▢}{▢}` and the child replaces each
 * square; and the bottom row's `class` `.digit` replaces the classes MathLive's own shortcut keys
 * carry, so those keys show as a digit's do, the stylesheet's `.digit` matching no key.
 *
 * Two of its behaviours are not kept, each a defect of its player, not of the field: it cut a value
 * longer than 100 characters to its first 100, which can split a LaTeX command, and its build
 * served MathLive's fonts and sounds from no address, so its fields drew in fallback fonts and its
 * keys made no sound. plate's fonts come from its base sheet and its sounds from the host
 * (`#plate/ui/text-entry/math-entry.tsx`).
 *
 * The module is data and one self-contained function, imported by the island and by the field's
 * test support (`#specimen/ui/math-entry.ts` in qti-pie's specimen), which runs
 * {@link setUpField}'s own source in the page it drives.
 *
 * @module
 * @see https://mathlive.io/mathfield/guides/virtual-keyboard/
 */
import type { MathfieldElement, VirtualKeyboardInterface, VirtualKeyboardLayout } from "mathlive";

/**
 * The class an author writes on a `qti-text-entry-interaction` for plate to answer it in a math
 * field. It is in plate's own vocabulary, `plate-*`, as every name plate gives its parts is, and
 * not `qti-*`, the prefix of 1EdTech's shared vocabulary, whose classes any player may read.
 */
export const mathEntryClass = "plate-math-entry";

/**
 * The options AlphaTest's player set on each math field, each by the property it assigned, which
 * {@link setUpField} assigns in turn:
 *
 * - `inlineShortcuts` empty (`NumericEntry.tsx` line 1874, `CompositeItem.tsx` line 836): no typed
 *   word becomes a command, so `pi` stays the letters p and i, and `sqrt` five letters;
 * - `menuItems` empty (`NumericEntry.tsx` line 1876, `CompositeItem.tsx` line 838): the field offers
 *   no context menu;
 * - `placeholderSymbol` `▢` (`NumericEntry.tsx` line 1857, `CompositeItem.tsx` line 831), MathLive's
 *   own default as well;
 * - `scriptDepth` 4 (`NumericEntry.tsx` line 1073), on every field of a numeric entry, its standalone
 *   text entry: a superscript or subscript nests at most four deep. The composite item's fields
 *   kept MathLive's unbounded default, which differs only past four;
 * - `smartFence` on (`NumericEntry.tsx` line 1854, `CompositeItem.tsx` line 828): a typed `(` opens a
 *   `\left(` … `\right)` pair, and a typed `|` a `\left|` … `\right|` one;
 * - `smartMode` off (`NumericEntry.tsx` line 1855, `CompositeItem.tsx` line 829): the field never
 *   switches to text by itself;
 * - `smartSuperscript` off (`NumericEntry.tsx` line 1856, `CompositeItem.tsx` line 830): after a
 *   superscript's first digit the caret stays in the superscript, so `x^2+1` typed is `x^{2+1}`.
 */
export const fieldSettings = {
  inlineShortcuts: {},
  menuItems: [],
  placeholderSymbol: "▢",
  scriptDepth: 4,
  smartFence: true,
  smartMode: false,
  smartSuperscript: false,
} satisfies Partial<
  Pick<
    MathfieldElement,
    | "inlineShortcuts"
    | "menuItems"
    | "placeholderSymbol"
    | "scriptDepth"
    | "smartFence"
    | "smartMode"
    | "smartSuperscript"
  >
>;

/**
 * The settings {@link setUpField} applies, as {@link fieldSettings} holds them.
 */
export type FieldSettings = typeof fieldSettings;

/**
 * AlphaTest's virtual keyboard's keys, row by row: six rows of six keys each inserting its
 * `latex`, then the row of MathLive's shortcut keys that hide the keyboard, move the caret left
 * and right, and delete before it (`NumericEntry.tsx` lines 1124–1167).
 */
export const keyboardRows = [
  [{ latex: "1" }, { latex: "2" }, { latex: "3" }, { latex: "+" }, { latex: "<" }, { latex: ">" }],
  [
    { latex: "4" },
    { latex: "5" },
    { latex: "6" },
    { latex: "-" },
    { latex: String.raw`\frac{▢}{▢}` },
    { latex: String.raw`▢\frac{▢}{▢}` },
  ],
  [
    { latex: "7" },
    { latex: "8" },
    { latex: "9" },
    { latex: String.raw`\times` },
    { latex: "(▢)" },
    { latex: "▢^{▢}" },
  ],
  [
    { latex: "0" },
    { latex: "." },
    { latex: "=" },
    { latex: String.raw`\div` },
    { latex: "[▢]" },
    { latex: String.raw`\sqrt{▢}` },
  ],
  [
    { latex: "x" },
    { latex: "y" },
    { latex: String.raw`\mid▢\mid` },
    { latex: String.raw`▢^{\frac{▢}{▢}}` },
    { latex: String.raw`(▢)^{\frac{▢}{▢}}` },
    { latex: String.raw`\leq` },
  ],
  [
    { latex: "," },
    { latex: "/" },
    { latex: String.raw`\pm` },
    { latex: String.raw`\pi` },
    { latex: String.raw`\infty` },
    { latex: String.raw`\geq` },
  ],
  [
    { class: ".digit", label: "[hide-keyboard]", width: 1 },
    { class: ".digit", label: "[left]", width: 2 },
    { class: ".digit", label: "[right]", width: 2 },
    { class: ".digit", label: "[backspace]", width: 1 },
  ],
] as const;

/**
 * AlphaTest's virtual keyboard: one layout, `calculator`, of one layer, {@link keyboardRows}, with
 * the layer's `style` (`NumericEntry.tsx` lines 1111–1172).
 */
export const keyboardLayout: VirtualKeyboardLayout = {
  label: "calculator",
  layers: [
    {
      rows: keyboardRows.map((row) => [...row]),
      style: ".digit { background: var(--keycap-background); color: var(--keycap-text) }",
    },
  ],
  tooltip: "Calculator layout",
};

/**
 * Set a math field up as AlphaTest's player did once the field stood in the page: its options,
 * then the virtual keyboard's one layout, which is the page's, shared by every field in it.
 *
 * The function reads nothing but its arguments, so its own source runs where it is written out:
 * the field's test support evaluates `String(setUpField)` in the page it drives, so the field it
 * types into is set up by this very function.
 *
 * @param field The field, connected to the document.
 * @param keyboard The page's virtual keyboard, MathLive's `window.mathVirtualKeyboard`.
 * @param settings The options to assign, {@link fieldSettings}.
 * @param layout The keyboard's layout, {@link keyboardLayout}.
 */
export const setUpField = (
  field: MathfieldElement,
  keyboard: VirtualKeyboardInterface,
  settings: FieldSettings,
  layout: VirtualKeyboardLayout,
): void => {
  field.smartFence = settings.smartFence;
  field.smartMode = settings.smartMode;
  field.smartSuperscript = settings.smartSuperscript;
  field.placeholderSymbol = settings.placeholderSymbol;
  field.scriptDepth = settings.scriptDepth;
  field.inlineShortcuts = settings.inlineShortcuts;
  field.menuItems = settings.menuItems;
  keyboard.layouts = [layout];
};
