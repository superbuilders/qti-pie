"use client";

/**
 * The stimulus pane's tabs: where an item shows two or more stimuli in its pane, one tab per
 * stimulus, named by the stimulus's `title`, and one panel per tab holding the stimulus's article,
 * under a line telling the child to read them all, as AlphaTest's player laid out two or more
 * passages ("Read all passages below and use the tabs to alternate between them", one tab per
 * passage named by its title). The first tab is picked when the item opens, as AlphaTest's player
 * picked it on every question it showed. A panel not picked stays in the page, hidden until the
 * browser's Find finds a word in it, which picks its tab.
 *
 * @module
 */
import { Tabs, TabsList, TabsPanel, TabsTab } from "@ui-sdk/react/tabs";
import type { ReactNode } from "react";

/**
 * One stimulus the tabs hold: the name of its tab, and its article, server-rendered.
 */
export interface Passage {
  readonly article: ReactNode;
  readonly name: string;
}

/**
 * Render the pane's tabs.
 *
 * The parts:
 *
 * - `plate-stimuli-instruction`, the line that tells the child to read every passage;
 * - UI SDK's `tabs`, holding its `tabs-list`, named by `label`, with one `tabs-tab` per passage, and
 *   one `tabs-panel` per passage, holding its article.
 *
 * @param props The tabs.
 * @param props.instruction The line that tells the child to read every passage.
 * @param props.label What names the list of tabs.
 * @param props.passages The passages, in the item's refs' order.
 * @returns The tabs.
 * @see https://ui-sdk.dev/docs/react/components/tabs
 */
export const PassageTabs = ({
  instruction,
  label,
  passages,
}: Readonly<{ instruction: string; label: string; passages: readonly Passage[] }>) => (
  <>
    <p data-slot="plate-stimuli-instruction">{instruction}</p>
    <Tabs defaultValue="0" hiddenUntilFound>
      <TabsList aria-label={label}>
        {passages.map(({ name }, index) => (
          <TabsTab key={String(index)} value={String(index)}>
            {name}
          </TabsTab>
        ))}
      </TabsList>
      {passages.map(({ article }, index) => (
        <TabsPanel key={String(index)} value={String(index)}>
          {article}
        </TabsPanel>
      ))}
    </Tabs>
  </>
);
