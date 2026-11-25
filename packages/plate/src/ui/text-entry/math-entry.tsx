"use client";

/**
 * The math entry's client island: a Text Entry whose author marked it with plate's presentation
 * class `plate-math-entry` (`mathEntryClass` in `#plate/math-entry/field.ts`), answered in a
 * MathLive math field under AlphaTest's virtual keyboard, the field's LaTeX its response.
 *
 * The field is MathLive's custom element, made once the island mounts, from MathLive's module
 * loaded then as plate loads it, once a page (`#plate/math-entry/mathlive.ts`): a page with no math
 * entry loads none of it, and the server's markup holds the field's place, an empty span. It is set
 * up by `setUpField` with plate's settings and keyboard, the settings and keys the field's suite
 * holds plate to (`#specimen/ui/math-entry.test.ts` in qti-pie's specimen). Nothing loads from
 * another host.
 *
 * @module
 */
import type { MathfieldElement } from "mathlive";
import { useEffect, useEffectEvent, useRef } from "react";
import { fieldSettings, keyboardLayout, setUpField } from "#plate/math-entry/field.ts";
import type { Authored, Named } from "#plate/ui/attributes.ts";
import { asTyped } from "#plate/model/typed-text.ts";
import { useBoxes } from "#plate/ui/typed.ts";
import type { BoxCounts, TypedDeclared, TypedReading } from "#plate/ui/typed.ts";

/**
 * What the server gives a math entry's island: the Text Entry's binding and names. It takes no
 * `pattern-mask`, placeholder or expected length: a LaTeX value is no text an author's regular
 * expression describes, MathLive's own placeholder is LaTeX, not a text, and the field grows with
 * what it holds; AlphaTest's field read none of them either.
 *
 * @see https://www.imsglobal.org/spec/qti/v3p0/info/index.html#Data_TextEntryInteraction
 */
export interface MathEntryProps extends Authored<Named> {
  /**
   * `base`, the number base an `integer` answer is typed in (5.162.2).
   */
  readonly base: number;
  /**
   * The base type of the response the interaction binds. A `record` response is a `string` here.
   */
  readonly baseType: "float" | "integer" | "string";
  /**
   * The response the field writes, as its declaration types it.
   */
  readonly response: TypedDeclared;
}

/**
 * How many boxes a math entry shows: its one field, whatever its response holds.
 */
const oneBox: BoxCounts = { most: 1, shown: 1 };

/**
 * What the island hands the field it makes: what the field opens holding, its names, and where its
 * LaTeX goes.
 */
interface FieldHooks {
  readonly naming: Named;
  readonly opened: string;
  readonly typed: (latex: string) => void;
}

/**
 * Make the field in its place once MathLive's module has loaded, unless the island has gone by
 * then: set it up as plate's field, holding the response's text, named as a Text Entry's input
 * is, and writing its LaTeX on every change. The field goes with the island.
 *
 * @param place The span the field stands in.
 * @param gone Aborted when the island unmounts.
 * @param hooks What the field opens holding, its names, and where its LaTeX goes.
 * @param made Told the field once it stands in the page, so the island keeps it in step.
 */
const makeField = async (
  place: HTMLElement,
  gone: AbortSignal,
  hooks: FieldHooks,
  made: (field: MathfieldElement) => void,
): Promise<void> => {
  const { Field } = await import("#plate/math-entry/mathlive.ts");

  if (!gone.aborted) {
    const field = new Field();

    field.value = hooks.opened;
    field.dataset["slot"] = "plate-math-entry-field";

    const { "aria-label": label, "aria-labelledby": labelledBy } = hooks.naming;

    if (label !== undefined) {
      field.setAttribute("aria-label", label);
    }

    if (labelledBy !== undefined) {
      field.setAttribute("aria-labelledby", labelledBy);
    }

    place.append(field);
    setUpField(field, window.mathVirtualKeyboard, fieldSettings, keyboardLayout);
    field.addEventListener(
      "input",
      () => {
        hooks.typed(field.value);
      },
      { signal: gone },
    );
    gone.addEventListener("abort", () => {
      field.remove();
    });
    made(field);
  }
};

/**
 * Render a math entry for the child to answer, holding its response in the item's `<Responses>`.
 *
 * The parts:
 *
 * - `plate-text-entry`, the root, a `span` with the author's `class` (`plate-math-entry` among it)
 *   and `data-*`, so the Text Entry's look and the shared vocabulary's widths reach it;
 * - `plate-math-entry`, a `span` the field stands in;
 * - `plate-math-entry-field`, MathLive's `math-field`, named as the Text Entry's input is (its
 *   `aria-label` or `aria-labelledby`), keyboard-operable, its speech and live region MathLive's
 *   own, with the toggle that shows its virtual keyboard.
 *
 * Every change writes the field's LaTeX, `field.value`, as typed, and the response read from it: an
 * empty field is no answer. A response that changes from outside the field, such as a host's
 * restore, is written into it.
 *
 * @param props The interaction, its response and its names ({@link MathEntryProps}).
 * @returns The math entry, its field bound to the response.
 */
export const MathEntry = (props: MathEntryProps) => {
  const { base, baseType, naming, response, root } = props;
  const reading: TypedReading = { base, baseType, blankIsEmpty: true };
  const [[box], write] = useBoxes({
    counts: oneBox,
    declared: response,
    patternMask: undefined,
    reading,
    typer: undefined,
    written: asTyped,
  });
  const place = useRef<HTMLSpanElement>(null);
  const field = useRef<MathfieldElement | null>(null);

  /**
   * Write the field's LaTeX to the response, through the boxes as they are when it changes.
   *
   * @param latex The field's value.
   */
  const typed = useEffectEvent((latex: string) => {
    write(0, latex);
  });

  /**
   * What the field it makes is handed: the response's text and the names as they are now, and
   * {@link typed}.
   *
   * @returns The hooks.
   */
  const hooks = useEffectEvent((): FieldHooks => ({
    naming,
    opened: box.text,
    typed: (latex) => {
      typed(latex);
    },
  }));

  // The island makes its field once, and the field goes with it.
  useEffect((): (() => void) | undefined => {
    const at = place.current;

    if (at === null) {
      return undefined;
    }

    const gone = new AbortController();

    void makeField(at, gone.signal, hooks(), (made) => {
      field.current = made;
    });

    return () => {
      gone.abort();
      field.current = null;
    };
  }, []);

  // A response the field did not write, such as a host's restore, is written into the field.
  useEffect(() => {
    const made = field.current;

    if (made !== null && made.value !== box.text) {
      made.value = box.text;
    }
  }, [box.text]);

  return (
    <span {...root} data-slot="plate-text-entry">
      <span data-slot="plate-math-entry" ref={place} />
    </span>
  );
};
