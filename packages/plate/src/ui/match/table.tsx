"use client";

/**
 * The Match interaction's table (`qti-match-interaction` with QTI's `qti-match-tabular` class): the
 * first match set's choices head the rows, the second's head the columns, and each cell is a tick
 * box for the pair of its row and its column, "a visual table with the choices of the first Simple
 * Match Set as the table row headers, and the choices of the second Simple Match Set as the table
 * column headers" (QTI 3.0 shared vocabulary, 1.2.8.2).
 *
 * It is a layout of the Match's board (`matchBoardOf` in `#plate/placement/match-board.ts`), the
 * bank's own, and a press on a cell is the placement machine's step (`press` there), so the table
 * keeps every limit the bank keeps and writes the same `directedPair` response, one pair of its row
 * and its column per ticked cell. A row whose `match-max` is 1 is a row of radios: a tick in
 * another cell moves its tick there.
 *
 * @module
 */
import { announce, prepareAnnouncements } from "@ui-sdk/core";
import { Checkbox, CheckboxIndicator } from "@ui-sdk/react/checkbox";
import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import type { Declared } from "#plate/model/values.ts";
import { flag } from "#plate/ui/attributes.ts";
import type { Authored, NameAttributes } from "#plate/ui/attributes.ts";
import { fillLabel } from "#plate/ui/labels.ts";
import type { Limit } from "#plate/placement/limit.ts";
import { matchBoardOf, press } from "#plate/placement/match-board.ts";
import type { Cell } from "#plate/placement/match-board.ts";
import type { MatchTableLabels } from "#plate/ui/match/labels.ts";
import type { MatchHeader } from "#plate/ui/match/match.tsx";
import { directedPairsOf, placementsOf } from "#plate/ui/placement/associable.ts";
import type { AssociableChoice } from "#plate/ui/placement/associable.ts";
import type { PairsArrangement, Refusal } from "#plate/placement/machine.ts";
import { PromptPart } from "#plate/ui/prompt.tsx";
import type { Prompt } from "#plate/ui/prompt.tsx";
import { directedPairSingles, useResponse } from "#plate/ui/responses.tsx";

/**
 * One header of a Match's table, a row's or a column's: its choice; the id the server scopes for
 * the part that holds its content, which names every tick box of its row or column; and its name,
 * the text its content shows, else its `label`, which announcements say.
 */
export type TableHeader = AssociableChoice & { readonly id: string; readonly name: string };

/**
 * What the server gives a Match's table, as QTI's `qti-match-interaction` and its shared
 * vocabulary's `qti-match-tabular` say.
 */
export interface MatchTableProps extends Authored<NameAttributes> {
  /**
   * The author's `data-first-column-header` (5.89.6), "the custom text to be rendered in the
   * top-left header cell of the table", as written and not blank, under the id the server scopes
   * for it; undefined when the author wrote none, which leaves the top-left cell empty.
   */
  readonly header: MatchHeader | undefined;
  /**
   * The words the table writes ({@link MatchTableLabels}), the author's
   * `data-max-selections-message` as `totalReached` where the interaction has one (5.89.5).
   */
  readonly labels: MatchTableLabels;
  /**
   * `max-associations` (5.89.2): how many cells may be ticked in all, as the server wrote it (see
   * {@link Limit}).
   */
  readonly maxAssociations: Limit;
  /**
   * The response, as its declaration types it: a `directedPair` response of `single` or
   * `multiple` cardinality.
   */
  readonly response: Declared<"directedPair", "multiple" | "single">;
  /**
   * The `qti-prompt`, server-rendered; undefined when the interaction has none.
   */
  readonly prompt: Prompt | undefined;
  /**
   * The rows: the first match set's choices in display order, shuffled already where the
   * interaction shuffles (5.89.1). Each one's `matchMax` is how many of its row's cells may be
   * ticked, and its `matchGroup` the columns it may be ticked in.
   */
  readonly sources: readonly TableHeader[];
  /**
   * The columns: the second match set's choices in display order. Each one's `matchMax` is how
   * many of its column's cells may be ticked, and its `matchGroup` the rows it may be ticked in.
   */
  readonly targets: readonly TableHeader[];
}

/**
 * Write a header's content in the part its id names, with its name where its content shows no
 * text, then read-aloud's control beside the part, never in it, so the name a tick box takes from
 * the part holds the choice's words alone.
 *
 * @param header The header.
 * @returns The header cell's content.
 */
const headerContent = (header: TableHeader): ReactNode => (
  <>
    <div aria-label={header.label} data-slot="plate-match-table-label" id={header.id}>
      {header.content}
    </div>
    {header.readAloud}
  </>
);

/**
 * Give a header's name, for an announcement.
 *
 * @param id The header's identifier among the rows or the columns, if any.
 * @param headers The rows or the columns.
 * @returns Its name, empty for none.
 */
const nameOf = (id: string | null, headers: readonly TableHeader[]): string =>
  headers.find((each) => each.identifier === id)?.name ?? "";

/**
 * Render a Match as a table for the child to answer, holding its response in the item's
 * `<Responses>`.
 *
 * The parts, as a screen reader meets them:
 *
 * - `plate-match`, the root, a group named as `naming` says, with the author's `data-*` and `class`,
 *   whose `qti-header-hidden` the stylesheet reads;
 * - `plate-prompt`, the prompt;
 * - `plate-table`, the box every table of the item stands in, which scrolls a table wider than the
 *   item sideways, around `plate-match-table`, a `table`. Its head, `plate-match-table-head`, is
 *   one row: the author's `data-first-column-header` in its first cell, a column header, or an
 *   empty cell where there is none, then one column header per column. Each row of its body begins
 *   with its row header. Each header holds its text in a `plate-match-table-label`: a row's or a
 *   column's its choice's content, under the id that names every tick box of its row or column, and
 *   after it read-aloud's control where the candidate hears the choice;
 * - `plate-match-cell`, each body cell, `data-selected` while ticked and `data-refuses` while a press
 *   would be refused, holding a `label` around UI SDK's `checkbox`, so the whole cell presses its
 *   tick box, which its row header and its column header name, in that order;
 * - `plate-match-message`, the latest refusal, from a refused press until the next accepted one.
 *
 * Every tick box stays enabled and in the tab order, so a child can always take a tick out, and a
 * refused press changes nothing: it is announced and shown. A tick that moves along a row of radios
 * is announced; a tick put in or taken out is its tick box's own state, which a screen reader says.
 *
 * @param props The interaction, its response and its labels ({@link MatchTableProps}).
 * @returns The table, its ticks bound to the response.
 */
export const MatchTable = (props: MatchTableProps) => {
  const { header, labels, maxAssociations, naming, prompt, response, root, sources, targets } =
    props;
  const [pairs, set] = useResponse(response, directedPairSingles);
  const [message, setMessage] = useState<string>();
  const board = useMemo(
    () => matchBoardOf(sources, targets, maxAssociations),
    [maxAssociations, sources, targets],
  );
  const arrangement: PairsArrangement = { ...board, placements: placementsOf(pairs) };

  useEffect(() => {
    prepareAnnouncements(document);
  }, []);

  /**
   * Say why a press was refused, in the labels' words, and show it.
   *
   * @param refusal The machine's refusal.
   */
  const refuse = (refusal: Refusal) => {
    if (refusal.reason === "unknown") {
      return;
    }

    const text = fillLabel(labels[refusal.reason], {
      chip: nameOf(refusal.chip, sources),
      target: nameOf(refusal.target?.kind === "target" ? refusal.target.id : null, targets),
    });

    setMessage(text);
    announce(text, { priority: "assertive" });
  };

  /**
   * Press a cell: write the placements the machine's step leaves, saying a tick that moved, or say
   * why not.
   *
   * @param cell The cell.
   * @returns Whether the press went through.
   */
  const pressed = (cell: Cell): boolean => {
    const step = press(arrangement, cell);

    if (!step.ok) {
      refuse(step.refusal);

      return false;
    }

    if (step.arrangement.kind !== "pairs") {
      return false;
    }

    const { move } = step;

    setMessage(undefined);
    set(directedPairsOf(step.arrangement.placements));

    if (move.kind === "placed" && move.from.kind === "target") {
      announce(
        fillLabel(labels.moved, {
          chip: nameOf(move.chip, sources),
          target: nameOf(cell.column, targets),
        }),
        { priority: "assertive" },
      );
    }

    return true;
  };

  return (
    <div {...naming} {...root} data-slot="plate-match" role="group">
      <PromptPart prompt={prompt} />
      <div data-slot="plate-table">
        <table data-slot="plate-match-table">
          <thead data-slot="plate-match-table-head">
            <tr>
              {header === undefined ? (
                <td />
              ) : (
                <th id={header.id} scope="col">
                  <div data-slot="plate-match-table-label">{header.text}</div>
                </th>
              )}
              {targets.map((target) => (
                <th key={target.identifier} scope="col">
                  {headerContent(target)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sources.map((source) => (
              <tr key={source.identifier}>
                <th scope="row">{headerContent(source)}</th>
                {targets.map((target) => {
                  const cell = { column: target.identifier, row: source.identifier };
                  const checked = pairs.some(
                    ([chip, column]) => chip === source.identifier && column === target.identifier,
                  );

                  return (
                    <td
                      key={target.identifier}
                      data-refuses={flag(!press(arrangement, cell).ok)}
                      data-selected={flag(checked)}
                      data-slot="plate-match-cell"
                    >
                      <label data-slot="plate-match-toggle">
                        <Checkbox
                          aria-labelledby={`${source.id} ${target.id}`}
                          checked={checked}
                          onCheckedChange={(_next, details) => {
                            if (!pressed(cell)) {
                              details.cancel();
                            }
                          }}
                        >
                          <CheckboxIndicator />
                        </Checkbox>
                      </label>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {message === undefined ? null : <p data-slot="plate-match-message">{message}</p>}
    </div>
  );
};
