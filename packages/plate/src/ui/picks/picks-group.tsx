"use client";

/**
 * A picks group's client island parts: the UI SDK radio group or checkbox group in which a child
 * picks a Choice's choices, a Hot Text's hottexts or a Hotspot's areas, the response it writes, and
 * the refusal of a pick past `max-choices`, written once for the three kinds.
 *
 * A kind's island renders its root's attributes, what stands before the group (its prompt; a
 * Hotspot's stage) and its options, each a {@link PickOption}, through one {@link PicksGroup}. An
 * option stands anywhere inside the group, as a Hot Text's hottexts stand deep in the author's
 * passage, and reads the group through its context; so does any other part that picks, such as a
 * Hotspot's stage, through {@link usePicks}.
 *
 * @module
 */
import { announce, prepareAnnouncements } from "@ui-sdk/core";
import { Checkbox, CheckboxGroup, CheckboxIndicator } from "@ui-sdk/react/checkbox";
import { Radio, RadioGroup, RadioIndicator } from "@ui-sdk/react/radio";
import { createContext, use, useEffect, useState } from "react";
import type { FocusEventHandler, ReactNode } from "react";
import { flag } from "#plate/ui/attributes.ts";
import type { DataRoot, Named } from "#plate/ui/attributes.ts";
import { PickOutsidePicksGroup } from "#plate/ui/defects.ts";
import { fillLabel } from "#plate/ui/labels.ts";
import type { Picks } from "#plate/ui/picks/picks.ts";
import { useResponse } from "#plate/ui/responses.tsx";

/**
 * The root slot of each kind that picks through a {@link PicksGroup}; its refusal's part is the
 * slot followed by `-limit`.
 */
type PicksSlot = "plate-choice" | "plate-hotspot" | "plate-hottext";

/**
 * A picks group's root attributes, in the order the root writes them: the author's `data-*` and
 * `class`, then the kind's own, its slot and any state attribute of its own, such as a Choice's
 * `data-orientation`, in key order. The group adds `data-full` last.
 */
export type PicksRoot = DataRoot & { readonly "data-slot": PicksSlot };

/**
 * What a {@link PicksGroup} gives the parts inside it.
 */
interface PicksValue {
  readonly picked: ReadonlySet<string>;
  readonly picks: Picks;
  /**
   * Pick an option, or take a picked one back where the child picks several, as a press on the
   * option's own control does, through the same refusal.
   *
   * @param identifier The option's identifier.
   */
  readonly press: (identifier: string) => void;
}

/**
 * The context a {@link PicksGroup} gives its parts; undefined outside one.
 */
const PicksContext = createContext<PicksValue | undefined>(undefined);

/**
 * Read the picks group a part stands in: how the child picks, what is picked, and a press that
 * picks.
 *
 * @returns The group's picks, picked identifiers and press.
 * @throws {PickOutsidePicksGroup} When it is called outside a {@link PicksGroup}.
 */
export const usePicks = (): PicksValue => {
  const value = use(PicksContext);

  if (value === undefined) {
    throw new PickOutsidePicksGroup();
  }

  return value;
};

/**
 * Render a picks group for the child to answer, holding its response in the item's `<Responses>`.
 *
 * The parts:
 *
 * - The root, a `div` with `root`'s attributes and `data-full` while checkboxes limited to `n` hold
 *   `n` identifiers;
 * - `before`, as given;
 * - UI SDK's `radio-group` for one pick or `checkbox-group` for several, named by `naming`, holding
 *   the options;
 * - `<slot>-limit`, the limit's text, shown from a refused pick until the next accepted one.
 *
 * A pick past the limit is cancelled through UI SDK's change details, before the group or the
 * response changes, then announced assertively and shown; every option stays enabled, so the child
 * can always take one back. The live regions are prepared on mount when the group has a limit,
 * since some screen readers read only a region that was there before its text changed. A response
 * of several posts each picked identifier once, in the order the group gives them, which a bag
 * does not read.
 *
 * @param props The group.
 * @param props.before What stands in the root before the group: the prompt, and a Hotspot's stage.
 * @param props.children The options, each a {@link PickOption}, wherever they stand inside.
 * @param props.limit The text shown and said when a pick past the limit is refused, `{n}` the
 *   limit: plate's catalog's, or the author's `data-max-selections-message`.
 * @param props.naming The attributes that name the group.
 * @param props.picks How many options the child picks.
 * @param props.response The entry name the response posts under.
 * @param props.root The root's attributes ({@link PicksRoot}).
 * @returns The group, bound to the response.
 * @see https://ui-sdk.dev/docs/react/components/radio
 * @see https://ui-sdk.dev/docs/react/components/checkbox
 */
export const PicksGroup = ({
  before,
  children,
  limit,
  naming,
  picks,
  response,
  root,
}: Readonly<{
  before: ReactNode;
  children: ReactNode;
  limit: string;
  naming: Named;
  picks: Picks;
  response: string;
  root: PicksRoot;
}>) => {
  const [texts, set] = useResponse(response);
  const [refusal, setRefusal] = useState<string>();
  const limited = picks.kind === "at-most";

  useEffect(() => {
    if (limited) {
      prepareAnnouncements(document);
    }
  }, [limited]);

  /**
   * Take the picks a change of the checkboxes would leave, or refuse them past the limit.
   *
   * @param next The identifiers the change leaves picked.
   * @returns Whether the change is taken.
   */
  const choose = (next: readonly string[]): boolean => {
    if (picks.kind === "at-most" && next.length > picks.n && next.length > texts.length) {
      const text = fillLabel(limit, { n: picks.n });

      setRefusal(text);
      announce(text, { priority: "assertive" });

      return false;
    }

    setRefusal(undefined);
    set(next);

    return true;
  };

  const value: PicksValue = {
    picked: new Set(texts),
    picks,
    press: (identifier) => {
      if (picks.kind === "one") {
        set([identifier]);

        return;
      }

      choose(
        texts.includes(identifier)
          ? texts.filter((text) => text !== identifier)
          : [...texts, identifier],
      );
    },
  };

  return (
    <div {...root} data-full={flag(picks.kind === "at-most" && texts.length >= picks.n)}>
      <PicksContext value={value}>
        {before}
        {picks.kind === "one" ? (
          <RadioGroup
            {...naming}
            value={texts[0] ?? null}
            onValueChange={(next) => {
              set(next === null ? [] : [next]);
            }}
          >
            {children}
          </RadioGroup>
        ) : (
          <CheckboxGroup
            {...naming}
            value={[...texts]}
            onValueChange={(next, details) => {
              if (!choose(next)) {
                details.cancel();
              }
            }}
          >
            {children}
          </CheckboxGroup>
        )}
      </PicksContext>
      {refusal === undefined ? null : <p data-slot={`${root["data-slot"]}-limit`}>{refusal}</p>}
    </div>
  );
};

/**
 * Render one option of a picks group, where it stands inside the group: a `label`, with its
 * `slot` and `data-selected` while it is picked, around UI SDK's `radio` or `checkbox` with its
 * indicator and the option's content, so a press anywhere on it presses the control and the
 * content names it. The whole option is the hit target.
 *
 * @param props The option.
 * @param props.children The option's content, inside the `label`, so it holds no `label` of its
 *   own and no interactive element.
 * @param props.identifier The value its pick posts.
 * @param props.label The control's name where its content names nothing, an image with no
 *   alternative text alone; none where the content names it.
 * @param props.onBlur Called when the option's control loses focus.
 * @param props.onFocus Called when the option's control takes focus.
 * @param props.slot The option's `data-slot`.
 * @returns The option, picked or not.
 * @throws {PickOutsidePicksGroup} When it is rendered outside a {@link PicksGroup}.
 */
export const PickOption = ({
  children,
  identifier,
  label,
  onBlur,
  onFocus,
  slot,
}: Readonly<{
  children: ReactNode;
  identifier: string;
  label: string | undefined;
  onBlur?: FocusEventHandler<HTMLLabelElement>;
  onFocus?: FocusEventHandler<HTMLLabelElement>;
  slot: "plate-choice-option" | "plate-hotspot-option" | "plate-hottext-choice";
}>) => {
  const { picked, picks } = usePicks();

  return (
    <label
      data-slot={slot}
      data-selected={flag(picked.has(identifier))}
      onBlur={onBlur}
      onFocus={onFocus}
    >
      {picks.kind === "one" ? (
        <Radio aria-label={label} value={identifier}>
          <RadioIndicator />
        </Radio>
      ) : (
        <Checkbox aria-label={label} value={identifier}>
          <CheckboxIndicator />
        </Checkbox>
      )}
      {children}
    </label>
  );
};
