/**
 * Test support for a Match laid out as a table: the rules a press on a cell keeps, written apart
 * from plate's code, the box of boards and placements the property walks, and the walk itself,
 * which finds the first case where a cell logic and the rules disagree. The table's property
 * (`#plate/ui/match/board.test.ts`) walks plate's cell logic, and each of its kills walks a mutant
 * copy of plate in a program of its own.
 *
 * The rules, from the QTI 3.0 information model and plate's ruling for a row of radios:
 *
 * - A ticked cell's tick comes out.
 * - A row whose `match-max` is 1, ticked elsewhere, moves its tick to the cell pressed, unless either
 *   side's `match-group` keeps the two apart or the cell's column is at its `match-max`; a move
 *   makes no new association, so `max-associations` never refuses it.
 * - Any other empty cell takes a tick, unless its row is at its `match-max`, the table at
 *   `max-associations`, either side's `match-group` keeps the two apart, or its column is at its
 *   `match-max`, refused for the first of those in that order.
 * - A `match-max` or `max-associations` of 0 is no limit (5.131.6, 5.89.2).
 *
 * @module
 */
import type { Limit } from "#plate/ui/limit.ts";
import type { PairsArrangement, PairsBoard, Step } from "#plate/ui/placement/machine.ts";

/**
 * One choice of a board as QTI writes it: its identifier, `match-max` as written, 0 for no limit,
 * and `match-group`, empty for any.
 */
interface Written {
  readonly identifier: string;
  readonly matchGroup: readonly string[];
  readonly matchMax: bigint;
}

/**
 * A board as QTI writes it: the first set's choices, the rows; the second's, the columns; and
 * `max-associations` as written, 0 for no limit.
 */
interface Board {
  readonly columns: readonly Written[];
  readonly maxAssociations: bigint;
  readonly rows: readonly Written[];
}

/**
 * A ticked cell, as the response's `"row column"` text.
 */
type Tick = string;

/**
 * How a press changed the ticks: a tick taken out, a new tick, or a row of radios' tick moved.
 */
type Change = "move" | "tick" | "untick";

/**
 * What the rules say a press does: the ticks it leaves and how it changed them, or why it is
 * refused, by the machine's reason.
 */
type Expected =
  | { readonly change: Change; readonly ok: true; readonly ticks: ReadonlySet<Tick> }
  | { readonly ok: false; readonly reason: string };

/**
 * One case of the box: a board, the cells ticked, and the cell pressed.
 */
interface Case {
  readonly board: Board;
  readonly cell: { readonly column: string; readonly row: string };
  readonly ticks: ReadonlySet<Tick>;
}

/**
 * A choice as a board takes it, its `match-max` read as a {@link Limit}.
 */
interface Ruled {
  readonly identifier: string;
  readonly matchGroup: readonly string[];
  readonly matchMax: Limit;
}

/**
 * What the walk checks, from one program, plate's or a mutant copy's: the server's reading of
 * QTI's counts (`limitOf` in `#plate/ui/item/interactions/facts.ts`), the board a Match's choices
 * make, and the cell logic (`matchBoardOf` and `press` in `#plate/ui/match/board.ts`).
 */
export interface Subject {
  readonly limitOf: (count: bigint) => Limit;
  readonly matchBoardOf: (
    sources: readonly Ruled[],
    targets: readonly Ruled[],
    maxAssociations: Limit,
  ) => PairsBoard;
  readonly press: (
    arrangement: PairsArrangement,
    cell: { readonly column: string; readonly row: string },
  ) => Step;
}

/**
 * Report whether a count has room for one more under a limit as QTI writes it, 0 being none.
 *
 * @param max The limit as written.
 * @param count The count.
 * @returns Whether one more stays within it.
 */
const room = (max: bigint, count: number): boolean => max === 0n || BigInt(count) < max;

/**
 * Report whether a count is within a limit as QTI writes it, 0 being none.
 *
 * @param max The limit as written.
 * @param count The count.
 * @returns Whether the count does not pass it.
 */
const within = (max: bigint, count: number): boolean => max === 0n || BigInt(count) <= max;

/**
 * Report whether both sides' `match-group`s let a row and a column pair.
 *
 * @param row The row.
 * @param column The column.
 * @returns Whether each side's group is empty or names the other.
 */
const grouped = (row: Written, column: Written): boolean =>
  (row.matchGroup.length === 0 || row.matchGroup.includes(column.identifier)) &&
  (column.matchGroup.length === 0 || column.matchGroup.includes(row.identifier));

/**
 * Give the ticks of a row or a column.
 *
 * @param ticks The ticks.
 * @param side Which side of a pair to read: 0 the row, 1 the column.
 * @param identifier The row's or column's identifier.
 * @returns Its ticks.
 */
const ticksOf = (ticks: ReadonlySet<Tick>, side: 0 | 1, identifier: string): readonly Tick[] =>
  [...ticks].filter((tick) => tick.split(" ")[side] === identifier);

/**
 * What the rules say a press on a cell does ({@link Expected}), read from the board as QTI writes
 * it, apart from plate's code.
 *
 * @param held The case.
 * @returns What the press does.
 */
const expectedOf = ({ board, cell, ticks }: Case): Expected => {
  const row = board.rows.find((each) => each.identifier === cell.row);
  const column = board.columns.find((each) => each.identifier === cell.column);
  const tick = `${cell.row} ${cell.column}`;

  if (row === undefined || column === undefined) {
    return { ok: false, reason: "no such cell" };
  }

  if (ticks.has(tick)) {
    return {
      change: "untick",
      ok: true,
      ticks: new Set([...ticks].filter((each) => each !== tick)),
    };
  }

  const inRow = ticksOf(ticks, 0, row.identifier);
  const inColumn = ticksOf(ticks, 1, column.identifier);
  const [moving] = inRow;

  if (row.matchMax === 1n && moving !== undefined) {
    if (!grouped(row, column)) {
      return { ok: false, reason: "notInGroup" };
    }

    return room(column.matchMax, inColumn.length)
      ? {
          change: "move",
          ok: true,
          ticks: new Set([...[...ticks].filter((each) => each !== moving), tick]),
        }
      : { ok: false, reason: "targetFull" };
  }

  if (!room(row.matchMax, inRow.length)) {
    return { ok: false, reason: "chipUsedUp" };
  }

  if (!room(board.maxAssociations, ticks.size)) {
    return { ok: false, reason: "totalReached" };
  }

  if (!grouped(row, column)) {
    return { ok: false, reason: "notInGroup" };
  }

  return room(column.matchMax, inColumn.length)
    ? { change: "tick", ok: true, ticks: new Set([...ticks, tick]) }
    : { ok: false, reason: "targetFull" };
};

/**
 * Every list of `n` values drawn from `values`, each place independently.
 *
 * @template T A value.
 * @param values The values a place takes.
 * @param n How many places.
 * @returns Every list, in order.
 */
const lists = <T>(values: readonly T[], n: number): readonly (readonly T[])[] =>
  n === 0 ? [[]] : values.flatMap((value) => lists(values, n - 1).map((rest) => [value, ...rest]));

/**
 * Report whether ticks are a table a child can reach: no row, column or the table past its limit,
 * and no tick a `match-group` forbids.
 *
 * @param board The board.
 * @param ticks The ticks.
 * @returns Whether they keep every rule.
 */
const reachable = (board: Board, ticks: ReadonlySet<Tick>): boolean =>
  within(board.maxAssociations, ticks.size) &&
  board.rows.every((row) => within(row.matchMax, ticksOf(ticks, 0, row.identifier).length)) &&
  board.columns.every((column) =>
    within(column.matchMax, ticksOf(ticks, 1, column.identifier).length),
  ) &&
  board.rows.every((row) =>
    board.columns.every(
      (column) => grouped(row, column) || !ticks.has(`${row.identifier} ${column.identifier}`),
    ),
  );

/**
 * Every case of a board: each reachable set of ticks, and each cell pressed on it.
 *
 * @param board The board.
 * @returns Its cases.
 */
const casesOf = (board: Board): readonly Case[] => {
  const cells = board.rows.flatMap((row) =>
    board.columns.map((column) => ({ column: column.identifier, row: row.identifier })),
  );

  return lists([false, true], cells.length).flatMap((picked) => {
    const ticks = new Set(
      cells.filter((_, at) => picked[at] === true).map((cell) => `${cell.row} ${cell.column}`),
    );

    return reachable(board, ticks) ? cells.map((cell) => ({ board, cell, ticks })) : [];
  });
};

/**
 * Name a board's choices on one side, each with its `match-max` and `match-group`.
 *
 * @param prefix The side's identifiers' prefix: `R` for the rows, `C` for the columns.
 * @param sides Each choice's `match-max` and `match-group`, in order.
 * @returns The choices.
 */
const named = (prefix: string, sides: readonly Omit<Written, "identifier">[]): readonly Written[] =>
  sides.map((side, at) => ({ ...side, identifier: `${prefix}${String(at)}` }));

/**
 * The box of boards without `match-group`s: every shape of one to three rows and one to three
 * columns of at most six cells, each row's and column's `match-max` 0, 1 or 2, and
 * `max-associations` 0 to 3.
 */
const ungrouped: readonly Board[] = (
  [
    [1, 1],
    [1, 2],
    [2, 1],
    [1, 3],
    [3, 1],
    [2, 2],
    [2, 3],
    [3, 2],
  ] as const
).flatMap(([rows, columns]) =>
  lists([0n, 1n, 2n], rows).flatMap((rowMaxes) =>
    lists([0n, 1n, 2n], columns).flatMap((columnMaxes) =>
      [0n, 1n, 2n, 3n].map((maxAssociations): Board => ({
        columns: named(
          "C",
          columnMaxes.map((matchMax) => ({ matchGroup: [], matchMax })),
        ),
        maxAssociations,
        rows: named(
          "R",
          rowMaxes.map((matchMax) => ({ matchGroup: [], matchMax })),
        ),
      })),
    ),
  ),
);

/**
 * Every pair of choices on one side of a two-by-two board with `match-group`s: each choice's
 * `match-max` 0 or 1, and its `match-group` naming nothing or one choice of the other side.
 *
 * @param prefix The side's identifiers' prefix.
 * @param other The other side's prefix, which a `match-group` names.
 * @returns Every side.
 */
const groupedSides = (prefix: string, other: string): readonly (readonly Written[])[] =>
  lists(
    [0n, 1n].flatMap((matchMax) =>
      [[], [`${other}0`], [`${other}1`]].map((matchGroup) => ({ matchGroup, matchMax })),
    ),
    2,
  ).map((sides) => named(prefix, sides));

/**
 * The box of boards with `match-group`s: two rows and two columns ({@link groupedSides}), and
 * `max-associations` 0 or 2.
 */
const grouped2x2: readonly Board[] = groupedSides("R", "C").flatMap((rows) =>
  groupedSides("C", "R").flatMap((columns) =>
    [0n, 2n].map((maxAssociations): Board => ({ columns, maxAssociations, rows })),
  ),
);

/**
 * Name how a step changed the ticks, as the rules name it.
 *
 * @param move What the step did.
 * @returns The change, or the step's own kind where it is none of the three.
 */
const changeOf = (move: Extract<Step, { ok: true }>["move"]): string => {
  if (move.kind === "returned") {
    return "untick";
  }

  if (move.kind !== "placed") {
    return move.kind;
  }

  return move.from.kind === "target" ? "move" : "tick";
};

/**
 * Describe a case and how the code and the rules disagree on it.
 *
 * @param held The case.
 * @param expected What the rules say.
 * @param step What the code did.
 * @returns The description.
 */
const disagreement = (held: Case, expected: Expected, step: Step): string =>
  JSON.stringify({
    board: {
      columns: held.board.columns.map((c) => [c.identifier, String(c.matchMax), c.matchGroup]),
      maxAssociations: String(held.board.maxAssociations),
      rows: held.board.rows.map((r) => [r.identifier, String(r.matchMax), r.matchGroup]),
    },
    cell: held.cell,
    code: step.ok
      ? { change: changeOf(step.move), ticks: step.arrangement.placements }
      : step.refusal.reason,
    rules: expected.ok ? { change: expected.change, ticks: [...expected.ticks] } : expected.reason,
    ticks: [...held.ticks],
  });

/**
 * Check one case: the code's step against the rules', the ticks it leaves as a set and how it
 * changed them, or the refusal's reason.
 *
 * @param subject The cell logic.
 * @param held The case.
 * @returns How they disagree, or undefined where they agree.
 */
const checkCase = (subject: Subject, held: Case): string | undefined => {
  const { board, cell, ticks } = held;
  const rule = (written: Written) => ({ ...written, matchMax: subject.limitOf(written.matchMax) });
  const placements = [...ticks].map((tick) => {
    const [chip = "", target = ""] = tick.split(" ");

    return { chip, target };
  });
  const step = subject.press(
    {
      ...subject.matchBoardOf(
        board.rows.map(rule),
        board.columns.map(rule),
        subject.limitOf(board.maxAssociations),
      ),
      placements,
    },
    cell,
  );
  const expected = expectedOf(held);

  if (!expected.ok || !step.ok) {
    return !expected.ok && !step.ok && expected.reason === step.refusal.reason
      ? undefined
      : disagreement(held, expected, step);
  }

  const left =
    step.arrangement.kind === "pairs"
      ? step.arrangement.placements.map((pair) => `${pair.chip} ${pair.target}`)
      : [];
  const same =
    left.length === expected.ticks.size &&
    left.every((tick) => expected.ticks.has(tick)) &&
    changeOf(step.move) === expected.change;

  return same ? undefined : disagreement(held, expected, step);
};

/**
 * What a walk of the box found: how many cases it checked, and the first disagreement, none where
 * every case agrees.
 */
export interface Walked {
  readonly cases: number;
  readonly found: string | undefined;
}

/**
 * Walk the box, both its boards without `match-group`s and with them, and find the first case on
 * which a cell logic and the rules disagree.
 *
 * @param subject The cell logic.
 * @returns What the walk found.
 */
export const walkTable = (subject: Subject): Walked => {
  let cases = 0;

  for (const board of [...ungrouped, ...grouped2x2]) {
    for (const held of casesOf(board)) {
      cases += 1;

      const found = checkCase(subject, held);

      if (found !== undefined) {
        return { cases, found };
      }
    }
  }

  return { cases, found: undefined };
};
