/**
 * The name of each stimulus's tab where an item's stimulus pane holds two or more
 * (`PassageTabs` in `#plate/ui/passages/passage-tabs.tsx`). Pure.
 *
 * @module
 */
import { Option } from "effect";
import { message, numeral } from "#plate/messages.ts";
import type { Locale } from "#plate/messages.ts";
import { collapsedText } from "#plate/model/whitespace.ts";

/**
 * Name a stimulus's tab in the pane: its `title`, its whitespace collapsed, an attribute every
 * `qti-assessment-stimulus` carries; "Passage n" by its place where the title is blank, so no tab
 * is nameless.
 *
 * @param title The stimulus's `title`, as written.
 * @param n Its place among the pane's stimuli, from 1.
 * @param locale The locale of plate's own text.
 * @returns The tab's name.
 */
export const passageName = (title: string, n: number, locale: Locale): string =>
  Option.getOrElse(
    Option.liftPredicate(collapsedText(title), (written) => written !== ""),
    () => message(locale, "stimuliTab", { n: numeral(locale, n) }),
  );
