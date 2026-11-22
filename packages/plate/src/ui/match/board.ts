/**
 * A Match's board, which both of its layouts move chips on: the chip bank, and the table QTI's
 * `qti-match-tabular` asks for, whose cells are the board's pairs, a source's row and a target's
 * column each. The table is a layout of the same board, not a second engine: a press on a cell is
 * the placement machine's pick and place (`#plate/ui/placement/machine.ts`), which holds every
 * limit, refuses before anything changes, and returns the next placements, so both layouts post
 * the same `directedPair` response under the same rules. Safe to import on the server.
 *
 * @module
 */
import { chipRuleOf } from "#plate/ui/placement/associable.ts";
import type { Associable } from "#plate/ui/placement/associable.ts";
import { isOne } from "#plate/ui/limit.ts";
import type { Limit } from "#plate/ui/limit.ts";
import { bank, chipsIn, pick, place } from "#plate/ui/placement/machine.ts";
import type {
  PairsArrangement,
  PairsBoard,
  Place,
  Step,
  Target,
} from "#plate/ui/placement/machine.ts";

/**
 * Build a Match's board: its first set's choices the chips, each placed up to its `match-max`, its
 * second's the targets, each holding up to its own, both sides' `match-group`s read on every pair,
 * and `max-associations` the total. A Match makes each association once, and a full target refuses
 * rather than trading a chip out, since which of its chips would leave is not the child's to guess.
 *
 * @param sources The first set's choices, as presented.
 * @param targets The second set's choices, as presented.
 * @param maxAssociations `max-associations`, as the server wrote it.
 * @returns The board.
 */
export const matchBoardOf = (
  sources: readonly Associable[],
  targets: readonly Associable[],
  maxAssociations: Limit,
): PairsBoard => ({
  chips: sources.map(chipRuleOf),
  kind: "pairs",
  repeats: false,
  swap: false,
  targets: targets.map((target) => ({
    capacity: target.matchMax,
    chips: target.matchGroup,
    id: target.identifier,
  })),
  total: maxAssociations,
});

/**
 * One cell of a Match's table: the source whose row it stands in and the target whose column it
 * stands in, by their identifiers. Ticked, it is the pair `"row column"` of the response.
 */
export interface Cell {
  readonly column: string;
  readonly row: string;
}

/**
 * Give the place a press on an empty cell takes its row's chip from: the column the row is ticked
 * in, where the row's `match-max` is 1 and it is ticked, so the tick moves there, as a chip moved
 * from one group to another in the bank; else the bank, a new association.
 *
 * @param arrangement The board and its placements.
 * @param row The row's source.
 * @returns The row's column, or the bank.
 */
const sourceOf = (arrangement: PairsArrangement, row: string): Place => {
  const uses = arrangement.chips.find((chip) => chip.id === row)?.uses;
  const ticked = arrangement.placements.find((placement) => placement.chip === row);

  return uses !== undefined && isOne(uses) && ticked !== undefined
    ? { id: ticked.target, kind: "target" }
    : bank;
};

/**
 * Press a cell of a Match's table, as a tap, a click or Space on its tick box does.
 *
 * - A ticked cell's tick comes out: the row's chip goes back to the bank.
 * - An empty cell in a row whose `match-max` is 1, ticked elsewhere, takes the row's tick, which
 *   leaves the cell it was in: the row behaves as a row of radios, and a move makes no new
 *   association, so `max-associations` does not refuse it.
 * - Any other empty cell takes a new tick, within the row's `match-max`, the column's `match-max`,
 *   `max-associations` and both sides' `match-group`s.
 *
 * Every limit and refusal is the machine's: a refused press returns only its refusal, so the
 * placements stay as they were.
 *
 * @param arrangement The board and its placements, a bag of pairs.
 * @param cell The cell pressed.
 * @returns The machine's step: the next placements and what moved, or the refusal.
 */
export const press = (arrangement: PairsArrangement, cell: Cell): Step => {
  const column: Target = { id: cell.column, kind: "target" };

  if (chipsIn(arrangement, column).includes(cell.row)) {
    return place(arrangement, { chip: cell.row, from: column }, bank);
  }

  const picking = pick(arrangement, cell.row, sourceOf(arrangement, cell.row));

  return picking.ok ? place(arrangement, picking.picked, column) : picking;
};
