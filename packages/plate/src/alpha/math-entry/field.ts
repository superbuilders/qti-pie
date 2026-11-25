/**
 * The math entry, Alpha's extension of plate's Text Entry: a Text Entry whose author marked it with
 * Alpha's presentation class {@link mathEntryClass} is answered in a MathLive math field, under the
 * virtual keyboard
 * AlphaTest's player gave its math tests, and its response is the field's LaTeX. The interaction
 * stays a standard `qti-text-entry-interaction`, so any other player shows its plain box, and the
 * class changes how plate presents it, never what its response is: a string, read as the box's is.
 *
 * The field is AlphaTest's player's as it shipped (mastery-track-player at 941a86a, MathLive
 * 0.105.3 by its `package-lock.json`), so the same keystrokes give the same LaTeX:
 *
 * - {@link fieldSettings}, the options its player set on every math field
 *   (`src/components/questions/NumericEntry.tsx` lines 1060–1094 and 1852–1880,
 *   `src/components/questions/CompositeItem.tsx` lines 826–841); every other option is MathLive's
 *   default there and here;
 * - {@link alphaTestRows}, its virtual keyboard's keys as its one layout wrote them
 *   (`NumericEntry.tsx` lines 1111–1176, `CompositeItem.tsx` lines 851–916), character for
 *   character, and {@link keyboardLayout}, plate's layout of them, every key as AlphaTest wrote it
 *   but the {@link keyFates};
 * - {@link setUpField}, which applies both to a connected field, as its player did once the field was
 *   in the page.
 *
 * What plate does not keep, each a defect of AlphaTest's player and not of the field (edullm-bd's
 * rulings, 2026-11-22):
 *
 * - Its template keys' squares: each wrote `▢` as the character U+25A2, which MathLive inserts as a
 *   symbol and not a box to fill, so a child who filled a fraction without deleting both squares
 *   posted `\frac{▢3}{▢4}`, which grades wrong. plate's keys hold MathLive's boxes instead
 *   ({@link keyFates});
 * - Its cut of a value longer than 100 characters to its first 100, which can split a LaTeX command;
 * - Its fonts and sounds, which its build served from no address, so its fields drew in fallback
 *   fonts and its keys made no sound. Alpha's base sheet (`@qti-pie/plate/alpha/styles/base.css`)
 *   serves MathLive's fonts, and the field plays no sound, as AlphaTest's never did, so no click
 *   competes with read-aloud;
 * - Its keys' ids, which MathLive drew at random each time it built the keyboard, so that about one
 *   keyboard in 300 gave two keys one id, and a press on the earlier ran the later's command, such
 *   as a `\geq` that moved the caret left. plate's page counts its keys' ids
 *   ({@link countKeycaps}).
 *
 * The bottom row's `class` `.digit` is kept although it reads as a slip, since it changes what the
 * keys show: it replaces the classes MathLive's own shortcut keys carry, so those keys show as a
 * digit's do, the layer's `.digit` rule matching no key.
 *
 * The module is data and two self-contained functions, imported by the island and by the field's
 * test support (`#specimen/alpha/math-entry.ts` in qti-pie's specimen), which runs
 * {@link setUpField}'s and {@link countKeycaps}'s own source in the page it drives.
 *
 * @module
 * @see https://mathlive.io/mathfield/guides/virtual-keyboard/
 */
import type {
  MathfieldElement,
  VirtualKeyboardInterface,
  VirtualKeyboardKeycap,
  VirtualKeyboardLayout,
} from "mathlive";

/**
 * The class an author writes on a `qti-text-entry-interaction` for Alpha's renderer to answer it in
 * a math field. It is in Alpha's vocabulary, `alpha-*`, the item vendor's code a vendor class
 * carries (BPIG §3.6.1), and not `qti-*`, the prefix of 1EdTech's shared vocabulary, whose classes
 * any player may read, nor `plate-*`, plate's own: a renderer that knows no Alpha extension shows
 * the box a plain Text Entry.
 */
export const mathEntryClass = "alpha-math-entry";

/**
 * The options AlphaTest's player set on each math field, each by the property it assigned, which
 * {@link setUpField} assigns in turn, with MathLive's default for the one it left alone that plate
 * changes:
 *
 * - `inlineShortcuts` empty (`NumericEntry.tsx` lines 1096 and 1875, `CompositeItem.tsx` line 837):
 *   no typed word becomes a command, so `pi` stays the letters p and i, and `sqrt` five letters;
 * - `mathModeSpace` empty, MathLive's default, which AlphaTest left: a typed space is nothing;
 * - `menuItems` empty (`NumericEntry.tsx` lines 1098 and 1877, `CompositeItem.tsx` line 839): the
 *   field offers no context menu;
 * - `placeholderSymbol` `▢` (`NumericEntry.tsx` lines 1071 and 1857, `CompositeItem.tsx` line 831),
 *   MathLive's own default as well;
 * - `scriptDepth` 4 (`NumericEntry.tsx` line 1073), on every field of a numeric entry, its standalone
 *   text entry: a superscript or subscript nests at most four deep. The composite item's fields
 *   kept MathLive's unbounded default, which differs only past four;
 * - `smartFence` on (`NumericEntry.tsx` lines 1067 and 1854, `CompositeItem.tsx` line 828): a typed
 *   `(` opens a `\left(` … `\right)` pair, and a typed `|` a `\left|` … `\right|` one;
 * - `smartMode` off (`NumericEntry.tsx` lines 1093 and 1855, `CompositeItem.tsx` line 829; line 1068
 *   turned it on a moment before line 1093 turned it off): the field never switches to text by
 *   itself;
 * - `smartSuperscript` off (`NumericEntry.tsx` lines 1094 and 1856, `CompositeItem.tsx` line 830):
 *   after a superscript's first digit the caret stays in the superscript, so `x^2+1` typed is
 *   `x^{2+1}`.
 */
export const alphaTestSettings: FieldSettings = {
  inlineShortcuts: {},
  mathModeSpace: "",
  menuItems: [],
  placeholderSymbol: "▢",
  scriptDepth: 4,
  smartFence: true,
  smartMode: false,
  smartSuperscript: false,
};

/**
 * Plate's options: {@link alphaTestSettings} with `mathModeSpace` `\,`, so a typed space is a thin
 * space and a mixed number typed `2 1/2` is `2\,\frac12`, two and a half, where AlphaTest's field
 * dropped the space and the fraction typed after it took both digits, `\frac{21}{2}` (edullm-bd's
 * ruling, 2026-11-22; GRADING-SQL reads `\,` as a mixed number's join and as nothing elsewhere).
 * A fate of its own beside the {@link keyFates}.
 */
export const fieldSettings: FieldSettings = { ...alphaTestSettings, mathModeSpace: String.raw`\,` };

/**
 * The settings {@link setUpField} applies: the options AlphaTest's player set, each as its
 * `MathfieldElement` property types it.
 */
export type FieldSettings = Readonly<
  Pick<
    MathfieldElement,
    | "inlineShortcuts"
    | "mathModeSpace"
    | "menuItems"
    | "placeholderSymbol"
    | "scriptDepth"
    | "smartFence"
    | "smartMode"
    | "smartSuperscript"
  >
>;

/**
 * AlphaTest's virtual keyboard's keys, row by row, as its player wrote them: six rows of six keys
 * each inserting its `latex`, then the row of MathLive's shortcut keys that hide the keyboard, move
 * the caret left and right, and delete before it (`NumericEntry.tsx` lines 1119–1174). A key is
 * named by this `latex`, or its shortcut's `label`, wherever plate names one, so a key sequence
 * means the same keys on AlphaTest's keyboard and plate's.
 */
export const alphaTestRows = [
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
 * The keys plate's keyboard changes from AlphaTest's, each by the `latex` AlphaTest wrote, the line
 * of `NumericEntry.tsx` that wrote it, and the `latex` plate writes: every key whose template held
 * squares, each square now one of MathLive's boxes. The first box takes what the child selected
 * before pressing the key, `#0`, which is a box when nothing is selected; every other box is empty,
 * `#?`. A box is never `#@`, which takes the number before the caret when nothing is selected, so
 * the fraction key after a 3 would make 3 its numerator where AlphaTest's gave a mixed number, 3
 * and an empty fraction. After the key the caret stands in its first box, and the arrow keys and
 * the keyboard's own move from box to box.
 *
 * The mom test, for each: filling the boxes of a key gives the expression the key shows with what
 * the child filled in, the LaTeX AlphaTest's field posted when the child deleted every square and
 * typed into its place (`#specimen/alpha/math-entry.test.ts` holds plate to it). Nine fates, each
 * counted once.
 */
export const keyFates = [
  { alphaTest: String.raw`\frac{▢}{▢}`, line: 1133, plate: String.raw`\frac{#0}{#?}` },
  { alphaTest: String.raw`▢\frac{▢}{▢}`, line: 1134, plate: String.raw`#0\frac{#?}{#?}` },
  { alphaTest: "(▢)", line: 1141, plate: "(#0)" },
  { alphaTest: "▢^{▢}", line: 1142, plate: "#0^{#?}" },
  { alphaTest: "[▢]", line: 1149, plate: "[#0]" },
  { alphaTest: String.raw`\sqrt{▢}`, line: 1150, plate: String.raw`\sqrt{#0}` },
  { alphaTest: String.raw`\mid▢\mid`, line: 1155, plate: String.raw`\mid#0\mid` },
  {
    alphaTest: String.raw`▢^{\frac{▢}{▢}}`,
    line: 1156,
    plate: String.raw`#0^{\frac{#?}{#?}}`,
  },
  {
    alphaTest: String.raw`(▢)^{\frac{▢}{▢}}`,
    line: 1157,
    plate: String.raw`(#0)^{\frac{#?}{#?}}`,
  },
] as const;

/**
 * The keys plate's keyboard adds to AlphaTest's, in a row of their own above the bottom row: the
 * degree sign and theta, which answers in AlphaTest's items hold and its keyboard had no key for
 * (edullm-bd's ruling, 2026-11-22). AlphaTest's field reached them only through MathLive's LaTeX
 * mode, `\degree` or `\theta` typed after a backslash, and plate's still does. The row's rest is
 * a gap, so every key AlphaTest had keeps its place and its size.
 */
export const addedRow = [
  { latex: String.raw`\degree` },
  { latex: String.raw`\theta` },
  { label: "[separator]", width: 2 },
  { label: "[separator]", width: 2 },
] as const;

/**
 * Plate's virtual keyboard's keys, row by row, each by its name: {@link alphaTestRows} with
 * {@link addedRow} above the bottom row. A key AlphaTest had keeps AlphaTest's `latex` as its name,
 * whatever plate's key inserts ({@link keyboardRows}).
 */
export const keyboardKeys = [
  ...alphaTestRows.slice(0, -1),
  addedRow,
  ...alphaTestRows.slice(-1),
] as const;

/**
 * Plate's virtual keyboard's keys, row by row, as its layout writes them: {@link keyboardKeys}, each
 * key whose template held squares writing plate's template in their place ({@link keyFates}).
 */
export const keyboardRows: readonly (readonly Partial<VirtualKeyboardKeycap>[])[] =
  keyboardKeys.map((row) =>
    row.map((key): Partial<VirtualKeyboardKeycap> =>
      "latex" in key
        ? { latex: keyFates.find((fate) => fate.alphaTest === key.latex)?.plate ?? key.latex }
        : { ...key },
    ),
  );

/**
 * A layout of AlphaTest's: its one layout, `calculator`, of one layer, with the layer's `style`
 * (`NumericEntry.tsx` lines 1111–1176), over the keys given, copied into the mutable rows
 * MathLive's `VirtualKeyboardLayer` types.
 *
 * @param rows The keys, row by row.
 * @returns The layout.
 */
const calculatorOf = (
  rows: readonly (readonly Partial<VirtualKeyboardKeycap>[])[],
): VirtualKeyboardLayout => ({
  label: "calculator",
  layers: [
    {
      rows: rows.map((row) => [...row]),
      style: ".digit { background: var(--keycap-background); color: var(--keycap-text) }",
    },
  ],
  tooltip: "Calculator layout",
});

/**
 * Plate's virtual keyboard: AlphaTest's layout over {@link keyboardRows}.
 */
export const keyboardLayout: VirtualKeyboardLayout = calculatorOf(keyboardRows);

/**
 * AlphaTest's virtual keyboard as its player gave it, over {@link alphaTestRows}: what the field's
 * suite holds plate's keys against, and what a grader types AlphaTest's answers on.
 */
export const alphaTestLayout: VirtualKeyboardLayout = calculatorOf(alphaTestRows);

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
  field.mathModeSpace = settings.mathModeSpace;
  field.menuItems = settings.menuItems;
  keyboard.layouts = [layout];
};

/**
 * Give the page's virtual keyboard's keys ids it counts, in place of the ids MathLive draws.
 * MathLive 0.105.3 names each key of a keyboard it builds `ML__k`, the last two base-36 digits of
 * the millisecond and a random whole number below 100,000 (`registerKeycap`), keeps one key per
 * name, and on a press runs the key its element's name holds: of two keys a build named alike, the
 * earlier runs the later's command. Of 6,000 builds of AlphaTest's 40 keys in Chrome, 19 named two
 * keys alike (PANTRY-CULL, 2026-11-24). Counted from 1 over the page's life, no two keys are named
 * alike; the shortcut keys MathLive names itself, such as `[left]`, are read as MathLive reads
 * them.
 *
 * The keyboard is the page's, shared by every field in it, so the page counts its keys once, as it
 * loads MathLive (`#plate/alpha/math-entry/mathlive.ts`), before the keyboard is first built. The
 * function reads nothing but its argument, so its own source runs where it is written out, as
 * {@link setUpField}'s does.
 *
 * @param keyboard The page's virtual keyboard, MathLive's `window.mathVirtualKeyboard`.
 */
export const countKeycaps = (keyboard: VirtualKeyboardInterface): void => {
  const keycaps = new Map<string, Partial<VirtualKeyboardKeycap>>();
  const shortcutOf = keyboard.getKeycap.bind(keyboard);
  let counted = 0;

  Object.assign(keyboard, {
    getKeycap: (id: string): Partial<VirtualKeyboardKeycap> | undefined =>
      shortcutOf(id) ?? keycaps.get(id),
    registerKeycap: (keycap: Partial<VirtualKeyboardKeycap>): string => {
      counted += 1;
      const id = `ML__k${counted.toString(36)}`;

      keycaps.set(id, keycap);

      return id;
    },
    resetKeycapRegistry: (): void => {
      keycaps.clear();
    },
  });
};
