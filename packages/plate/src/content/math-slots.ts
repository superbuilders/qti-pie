/**
 * The slots a formula holds for the interactions it draws inside itself: an empty `mspace` whose
 * `xref` names a Text Entry's, an Inline Choice's or a gap's `id` (MathML 3 §5.4.2's
 * cross-reference) is that interaction's place in the formula, as AlphaTest's player placed an
 * answer box inside a formula (mastery-track-player 941a86a, `embedded-math-entries.ts` and
 * `math-gap-slots.ts`). The server shell sizes the slot here, MathJax lays the formula out around
 * it, and the interaction is drawn over the slot (`#plate/ui/item/contents/mathml.tsx`), not at its
 * place in the body.
 *
 * A slot's size is in MathJax's em, the formula's own, so the formula reflows around it as it
 * reflows around a glyph. Every slot is as tall as plate's control inside a sentence: 48 px
 * (`--plate-control-size`) at the 20 px text (`--plate-text-size`) is 2.4 text em, which at the
 * x-height MathJax matches (0.442 of its em against about half an em of the page's sans-serif)
 * is about 2.2 of MathJax's em, centred on the math axis (0.25 em above the baseline). A Text Entry
 * is as wide as AlphaTest made it: 150 px for an expected length of four characters or fewer, about
 * 7 em at the 18 px text it drew at, and otherwise a zero's width (0.5 em) for each character it
 * expects, with the input's padding beside them (1.5 em); none stated is AlphaTest's floor of 8.
 * An Inline Choice is as wide as its longest choice's text at about half an em a character, with
 * its trigger's padding and chevron (2.5 em), and at least as wide as a Text Entry's input
 * (`min-inline-size: 6rem` in the base sheet, about 4.5 em). A gap is as wide as five em, room for
 * a short gap text's chip.
 *
 * @module
 */
import { Option } from "effect";
import type { MathElement } from "#plate/content/mathml.ts";
import type { BodyElement, Interaction, RedactedLevel, RedactedNode } from "#plate/model/item.ts";
import { isInteraction } from "#plate/model/interactions.ts";

/**
 * A slot's size in MathJax's em: its width, and how far it reaches above and below the baseline.
 */
export interface SlotSize {
  readonly depth: number;
  readonly height: number;
  readonly width: number;
}

/**
 * How far every slot reaches above the baseline: half of its 2.2 em, above the axis at 0.25 em.
 */
const slotHeight = 1.35;

/**
 * How far every slot reaches below the baseline: half of its 2.2 em, less the axis's 0.25 em.
 */
const slotDepth = 0.85;

/**
 * A slot of a width, as tall as every slot.
 *
 * @param width Its width, in MathJax's em.
 * @returns The slot's size.
 */
const slotOf = (width: number): SlotSize => ({ depth: slotDepth, height: slotHeight, width });

/**
 * The expected length AlphaTest's player took for a Text Entry that states none
 * (`DEFAULT_TEXT_ENTRY_EXPECTED_LENGTH`).
 */
const unstatedLength = 8n;

/**
 * The longest expected length AlphaTest's player drew at its fixed short width
 * (`SHORT_EMBEDDED_MATH_ENTRY_MAX_LENGTH`).
 */
const shortLength = 4n;

/**
 * Size a Text Entry's slot from its expected length.
 *
 * @param expectedLength The author's `expected-length`, none where it states none.
 * @returns The slot's size.
 */
export const textEntrySlot = (expectedLength: Option.Option<bigint>): SlotSize => {
  const length = Option.getOrElse(expectedLength, () => unstatedLength);

  return slotOf(length <= shortLength ? 7 : Number(length) * 0.5 + 1.5);
};

/**
 * Size an Inline Choice's slot from its longest choice.
 *
 * @param longest The number of characters of its longest choice's text.
 * @returns The slot's size.
 */
export const inlineChoiceSlot = (longest: number): SlotSize =>
  slotOf(Math.max(4.5, longest * 0.55 + 2.5));

/**
 * A gap's slot.
 */
export const gapSlot: SlotSize = slotOf(5);

/**
 * What a formula can draw in its slot, with the slot's size: in a body, a Text Entry or an Inline
 * Choice; in an interaction's own content, a `qti-gap`.
 */
export type SlotTarget =
  | {
      readonly kind: "gap";
      readonly node: BodyElement<RedactedLevel>;
      readonly size: SlotSize;
    }
  | {
      readonly kind: "interaction";
      readonly node: Interaction<RedactedLevel>;
      readonly size: SlotSize;
    };

/**
 * Where a run of content stands: in an item's or a stimulus's body, whose interactions a formula
 * can draw; or in an interaction's own content, whose gaps it can.
 */
export type SlotScope = "body" | "owned";

/**
 * Count the slots formulas hold, by the `id` each names: every `mspace` whose `xref` names an id,
 * at any depth.
 *
 * @param formulas The formulas, each its `math` element.
 * @returns How many slots name each id.
 */
export const slotNames = (
  formulas: readonly MathElement<unknown>[],
): ReadonlyMap<string, number> => {
  const named = new Map<string, number>();
  const visit = (element: MathElement<unknown>): void => {
    for (const child of element.children) {
      if (child.kind === "element") {
        const xref = child.attributes.find(({ name }) => name === "xref")?.value;

        if (child.local === "mspace" && xref !== undefined) {
          named.set(xref, (named.get(xref) ?? 0) + 1);
        }

        visit(child);
      }
    }
  };

  for (const formula of formulas) {
    visit(formula);
  }

  return named;
};

/**
 * Count the characters of body nodes' text, at any depth below elements, its ends trimmed.
 *
 * @param nodes The nodes.
 * @returns How many characters their text holds.
 */
const textLengthOf = (nodes: readonly RedactedNode[]): number => {
  let length = 0;

  for (const node of nodes) {
    if (node.kind === "text") {
      length += node.text.trim().length;
    } else if (node.kind === "element") {
      length += textLengthOf(node.children);
    }
  }

  return length;
};

/**
 * Find what among body nodes a formula can draw in its slot, where they stand: in a body, each Text
 * Entry and Inline Choice with an `id`; in an interaction's own content, each `qti-gap` with an
 * `id`; each with its slot's size. Below elements and containers, never in an interaction's own
 * content, whose own walk finds its own.
 *
 * @param nodes The body nodes.
 * @param scope Where they stand.
 * @returns Each target's id and the target.
 */
export const slotTargets = (
  nodes: readonly RedactedNode[],
  scope: SlotScope,
): readonly (readonly [string, SlotTarget])[] =>
  nodes.flatMap((node): readonly (readonly [string, SlotTarget])[] => {
    if (isInteraction(node)) {
      if (scope !== "body" || Option.isNone(node.id)) {
        return [];
      }

      if (node.kind === "inline-choice") {
        const longest = Math.max(0, ...node.choices.map(({ content }) => textLengthOf(content)));

        return [[node.id.value, { kind: "interaction", node, size: inlineChoiceSlot(longest) }]];
      }

      return node.kind === "text-entry"
        ? [[node.id.value, { kind: "interaction", node, size: textEntrySlot(node.expectedLength) }]]
        : [];
    }

    if (node.kind === "container") {
      return slotTargets(node.children, scope);
    }

    if (node.kind !== "element") {
      return [];
    }

    const id = node.attributes.find(({ name }) => name === "id")?.value;
    const own: readonly (readonly [string, SlotTarget])[] =
      scope === "owned" && node.tag === "qti-gap" && id !== undefined
        ? [[id, { kind: "gap", node, size: gapSlot }]]
        : [];

    return [...own, ...slotTargets(node.children, scope)];
  });

/**
 * Plan the slots of a run of content: each target of the run ({@link slotTargets}) that exactly one
 * slot of the run's formulas names ({@link slotNames}). One named by no slot stays where it stands;
 * one named by two or more stays there too, as AlphaTest's player kept its standalone box for a
 * token written twice, and its slots stay empty.
 *
 * @param formulas The run's formulas, at any depth.
 * @param nodes The run's body nodes.
 * @param scope Where they stand.
 * @returns Each target a formula draws, by the id its slot names.
 */
export const slotPlan = (
  formulas: readonly MathElement<unknown>[],
  nodes: readonly RedactedNode[],
  scope: SlotScope,
): ReadonlyMap<string, SlotTarget> => {
  const named = slotNames(formulas);

  return new Map(slotTargets(nodes, scope).filter(([id]) => named.get(id) === 1));
};
