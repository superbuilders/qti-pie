/**
 * Test support for a Gap Match's board: the rules a child's move keeps, written apart from plate's
 * code, the box of boards and arrangements the property walks, and the walk itself, which finds
 * the first case where the board and the machine under it disagree with the rules. The board's
 * property (`#plate/placement/gap-board.test.ts`) walks plate's code, and each of its kills walks a
 * mutant copy of plate in a program of its own.
 *
 * The rules hold the child's view as the truth: each gap is empty or holds one gap text, as the
 * child sees it, and the response is exactly the pairs of the gaps that hold one. So a walk that
 * agrees with them shows that what each gap shows is what the response sends, after every move. The
 * rules, from the QTI 3.0 information model (5.55 to 5.58) and plate's ruling for a filled gap:
 *
 * - "Each gap can have at most one choice associated with it" (5.57).
 * - A gap text picked up from the bank is refused when it fills as many gaps as its `match-max`
 *   allows (`chipUsedUp`), and else when the gaps hold `max-associations` pairs (`totalReached`),
 *   before any gap is chosen. One picked up from a gap is the gap's own.
 * - Put back where it came from, nothing changes. Put in the bank, a gap text from a gap leaves the
 *   gap empty, and one from the bank goes back untouched.
 * - Put in a gap, it is refused for the first of these, in order: either side's `match-group` keeps
 *   the two apart (`notInGroup`); the gap holds that gap text already (`pairMade`); the gap holds
 *   another (`targetFull`), since a drop on a filled gap is refused, the owner's ruling of
 *   2026-11-25 for every Gap Match, as AlphaTest's player refused one. Else the gap holds it, and a
 *   gap it came from is empty.
 * - A `match-max` or `max-associations` of 0 is no limit (5.58.5, 5.57.3).
 *
 * @module
 */
import type { Limit } from "#plate/placement/limit.ts";
import type {
  Arrangement,
  Pairs,
  PairsArrangement,
  PairsBoard,
  Picked,
  Picking,
  Place,
  Spot,
  Step,
} from "#plate/placement/machine.ts";

/**
 * One gap text as QTI writes it: its identifier, `match-max` as written, 0 for no limit, and
 * `match-group`, empty for any.
 */
interface WrittenText {
  readonly identifier: string;
  readonly matchGroup: readonly string[];
  readonly matchMax: bigint;
}

/**
 * One gap as QTI writes it: its identifier and `match-group`, empty for any.
 */
interface WrittenGap {
  readonly identifier: string;
  readonly matchGroup: readonly string[];
}

/**
 * A board as QTI writes it: the gap texts, the gaps, and `max-associations` as written, 0 for no
 * limit.
 */
interface Board {
  readonly gaps: readonly WrittenGap[];
  readonly maxAssociations: bigint;
  readonly texts: readonly WrittenText[];
}

/**
 * What the child sees: each gap, in order, holding a gap text or `null` while empty.
 */
type Slots = readonly (string | null)[];

/**
 * Where a move takes a gap text from or to: the bank, or a gap by its place among the gaps.
 */
type At = "bank" | number;

/**
 * One case of the box: a board, what its gaps hold, and the move: a gap text picked up where it
 * stands and put down somewhere.
 */
interface Case {
  readonly board: Board;
  readonly from: At;
  readonly slots: Slots;
  readonly text: string;
  readonly to: At;
}

/**
 * What the rules say a move does: the gaps as it leaves them, or why it is refused, by the
 * machine's reason.
 */
type Expected =
  | { readonly ok: true; readonly slots: Slots }
  | { readonly ok: false; readonly reason: string };

/**
 * A gap text or a gap as a board takes it, its `match-max` read as a {@link Limit}.
 */
interface RuledText {
  readonly identifier: string;
  readonly matchGroup: readonly string[];
  readonly matchMax: Limit;
}

/**
 * What the walk checks, from one program, plate's or a mutant copy's: the server's reading of
 * QTI's counts (`limitOf` in `#plate/placement/limit.ts`), the board a Gap Match's gap texts and
 * gaps make (`gapBoardOf` in `#plate/placement/gap-board.ts`), the machine's pick and place
 * (`#plate/placement/machine.ts`), and what a gap holds as its part draws it (`chipsIn` there).
 */
export interface Subject {
  readonly chipsIn: (arrangement: PairsArrangement, spot: Spot) => readonly string[];
  readonly gapBoardOf: (
    gapTexts: readonly RuledText[],
    gaps: readonly WrittenGap[],
    maxAssociations: Limit,
  ) => PairsBoard;
  readonly limitOf: (count: bigint) => Limit;
  readonly pick: (arrangement: PairsArrangement, chip: string, from: Place) => Picking;
  readonly place: (arrangement: PairsArrangement, picked: Picked | null, to: Place) => Step;
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
 * Count the gaps that hold a gap text, or that hold one gap text.
 *
 * @param slots What the gaps hold.
 * @param text The gap text, or undefined for any.
 * @returns How many gaps hold it.
 */
const filled = (slots: Slots, text?: string): number =>
  slots.filter((held) => held !== null && (text === undefined || held === text)).length;

/**
 * What the rules say a move does ({@link Expected}), read from the board as QTI writes it, apart
 * from plate's code.
 *
 * @param held The case.
 * @returns What the move does.
 */
const expectedOf = ({ board, from, slots, text, to }: Case): Expected => {
  const written = board.texts.find((each) => each.identifier === text);

  if (written === undefined) {
    return { ok: false, reason: "no such gap text" };
  }

  if (from === "bank") {
    if (!room(written.matchMax, filled(slots, text))) {
      return { ok: false, reason: "chipUsedUp" };
    }

    if (!room(board.maxAssociations, filled(slots))) {
      return { ok: false, reason: "totalReached" };
    }
  }

  const left = from === "bank" ? slots : slots.with(from, null);

  if (to === from) {
    return { ok: true, slots };
  }

  if (to === "bank") {
    return { ok: true, slots: left };
  }

  const gap = board.gaps[to];

  if (gap === undefined) {
    return { ok: false, reason: "no such gap" };
  }

  if (
    !(written.matchGroup.length === 0 || written.matchGroup.includes(gap.identifier)) ||
    !(gap.matchGroup.length === 0 || gap.matchGroup.includes(text))
  ) {
    return { ok: false, reason: "notInGroup" };
  }

  if (slots[to] === text) {
    return { ok: false, reason: "pairMade" };
  }

  return slots[to] === null
    ? { ok: true, slots: left.with(to, text) }
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
 * Report whether what the gaps hold is a board a child can reach: no gap text past its
 * `match-max`, the gaps not past `max-associations`, and no gap holding a gap text either side's
 * `match-group` keeps out.
 *
 * @param board The board.
 * @param slots What the gaps hold.
 * @returns Whether they keep every rule.
 */
const reachable = (board: Board, slots: Slots): boolean =>
  (board.maxAssociations === 0n || BigInt(filled(slots)) <= board.maxAssociations) &&
  board.texts.every(
    (text) => text.matchMax === 0n || BigInt(filled(slots, text.identifier)) <= text.matchMax,
  ) &&
  slots.every((held, at) => {
    const text = board.texts.find((each) => each.identifier === held);
    const gap = board.gaps[at];

    return (
      held === null ||
      (text !== undefined &&
        gap !== undefined &&
        (text.matchGroup.length === 0 || text.matchGroup.includes(gap.identifier)) &&
        (gap.matchGroup.length === 0 || gap.matchGroup.includes(held)))
    );
  });

/**
 * Every case of a board: each reachable filling of its gaps, and each move on it: every gap text
 * picked up from the bank, and every one a gap holds from that gap, each put down in the bank or
 * in any gap.
 *
 * @param board The board.
 * @returns Its cases.
 */
const casesOf = (board: Board): readonly Case[] => {
  const ids = board.texts.map((text) => text.identifier);
  const places: readonly At[] = ["bank", ...board.gaps.map((_, at) => at)];

  return lists([null, ...ids], board.gaps.length).flatMap((slots) => {
    if (!reachable(board, slots)) {
      return [];
    }

    const picks: readonly { readonly from: At; readonly text: string }[] = [
      ...ids.map((text) => ({ from: "bank" as const, text })),
      ...slots.flatMap((held, at) => (held === null ? [] : [{ from: at, text: held }])),
    ];

    return picks.flatMap(({ from, text }) =>
      places.map((to) => ({ board, from, slots, text, to })),
    );
  });
};

/**
 * Name gap texts or gaps, each with its limits.
 *
 * @template T What each holds besides its identifier.
 * @param prefix The identifiers' prefix: `T` for the gap texts, `G` for the gaps.
 * @param each Each one's limits, in order.
 * @returns Them, named.
 */
const named = <T extends object>(
  prefix: string,
  each: readonly T[],
): readonly (T & { readonly identifier: string })[] =>
  each.map((limits, at) => ({ ...limits, identifier: `${prefix}${String(at)}` }));

/**
 * The box of boards without `match-group`s: every shape of one to three gap texts and one to three
 * gaps, each gap text's `match-max` 0, 1 or 2, and `max-associations` 0 to 3.
 */
const ungrouped: readonly Board[] = (
  [
    [1, 1],
    [1, 2],
    [2, 1],
    [2, 2],
    [2, 3],
    [3, 2],
    [3, 3],
  ] as const
).flatMap(([texts, gaps]) =>
  lists([0n, 1n, 2n], texts).flatMap((maxes) =>
    [0n, 1n, 2n, 3n].map((maxAssociations): Board => ({
      gaps: named(
        "G",
        Array.from({ length: gaps }, () => ({ matchGroup: [] })),
      ),
      maxAssociations,
      texts: named(
        "T",
        maxes.map((matchMax) => ({ matchGroup: [], matchMax })),
      ),
    })),
  ),
);

/**
 * The box of boards with `match-group`s: two gap texts and two gaps, each gap text's `match-max` 0
 * or 1 and its `match-group` naming nothing or one gap, each gap's naming nothing or one gap text,
 * and `max-associations` 0 or 2.
 */
const grouped2x2: readonly Board[] = lists(
  [0n, 1n].flatMap((matchMax) =>
    [[], ["G0"], ["G1"]].map((matchGroup) => ({ matchGroup, matchMax })),
  ),
  2,
).flatMap((texts) =>
  lists([[], ["T0"], ["T1"]], 2).flatMap((gapGroups) =>
    [0n, 2n].map((maxAssociations): Board => ({
      gaps: named(
        "G",
        gapGroups.map((matchGroup) => ({ matchGroup })),
      ),
      maxAssociations,
      texts: named("T", texts),
    })),
  ),
);

/**
 * Name a place of a move as the machine names it.
 *
 * @param board The board.
 * @param at The bank, or a gap by its place.
 * @returns The place.
 */
const placeOf = (board: Board, at: At): Place =>
  at === "bank" ? { kind: "bank" } : { id: board.gaps[at]?.identifier ?? "", kind: "target" };

/**
 * Give the pairs of what the gaps hold, as a response's text, sorted.
 *
 * @param board The board.
 * @param slots What the gaps hold.
 * @returns Each `"text gap"`, sorted.
 */
const pairsOfSlots = (board: Board, slots: Slots): readonly string[] =>
  slots
    .flatMap((held, at) => (held === null ? [] : [`${held} ${board.gaps[at]?.identifier ?? ""}`]))
    .toSorted();

/**
 * Give a response's pairs as text, sorted.
 *
 * @param placements The placements.
 * @returns Each `"chip target"`, sorted.
 */
const pairsOfPlacements = (placements: Pairs): readonly string[] =>
  placements.map((pair) => `${pair.chip} ${pair.target}`).toSorted();

/**
 * What the code did on a case where it disagrees with the rules: the reason it refused the move,
 * the placements it went through with where the rules refuse, or, where both go through, what the
 * response sends and what each gap shows.
 */
type Code =
  | string
  | Arrangement["placements"]
  | { readonly sent: readonly string[]; readonly shown: readonly (readonly string[])[] };

/**
 * Describe a case and how the code and the rules disagree on it.
 *
 * @param held The case.
 * @param expected What the rules say.
 * @param code What the code did ({@link Code}).
 * @returns The description.
 */
const disagreement = (held: Case, expected: Expected, code: Code): string =>
  JSON.stringify({
    board: {
      gaps: held.board.gaps.map((gap) => [gap.identifier, gap.matchGroup]),
      maxAssociations: String(held.board.maxAssociations),
      texts: held.board.texts.map((t) => [t.identifier, String(t.matchMax), t.matchGroup]),
    },
    code,
    move: { from: held.from, text: held.text, to: held.to },
    rules: expected.ok ? pairsOfSlots(held.board, expected.slots) : expected.reason,
    slots: held.slots,
  });

/**
 * Check one case: the code's pick and place against the rules', the refusal's reason, or what the
 * response sends and what each gap shows, both of which must be what the rules leave in the gaps.
 *
 * @param subject The code.
 * @param held The case.
 * @returns How they disagree, or undefined where they agree.
 */
const checkCase = (subject: Subject, held: Case): string | undefined => {
  const { board, from, slots, text, to } = held;
  const arrangement: PairsArrangement = {
    ...subject.gapBoardOf(
      board.texts.map((written) => ({ ...written, matchMax: subject.limitOf(written.matchMax) })),
      board.gaps,
      subject.limitOf(board.maxAssociations),
    ),
    placements: slots.flatMap((chip, at) =>
      chip === null ? [] : [{ chip, target: board.gaps[at]?.identifier ?? "" }],
    ),
  };
  const expected = expectedOf(held);
  const picking = subject.pick(arrangement, text, placeOf(board, from));
  const step = picking.ok
    ? subject.place(arrangement, picking.picked, placeOf(board, to))
    : picking;

  if (!step.ok || !expected.ok) {
    return !step.ok && !expected.ok && step.refusal.reason === expected.reason
      ? undefined
      : disagreement(held, expected, step.ok ? step.arrangement.placements : step.refusal.reason);
  }

  const next = step.arrangement;
  const sent = next.kind === "pairs" ? pairsOfPlacements(next.placements) : [];
  const shown =
    next.kind === "pairs"
      ? board.gaps.map((gap) => subject.chipsIn(next, { id: gap.identifier, kind: "target" }))
      : [];
  const sentRight = sent.join("\n") === pairsOfSlots(board, expected.slots).join("\n");
  const shownRight = expected.slots.every((slot, at) =>
    slot === null ? shown[at]?.length === 0 : shown[at]?.length === 1 && shown[at]?.[0] === slot,
  );

  return sentRight && shownRight ? undefined : disagreement(held, expected, { sent, shown });
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
 * Walk the box, its boards without `match-group`s and with them, and find the first case on which
 * the code and the rules disagree.
 *
 * @param subject The code.
 * @returns What the walk found.
 */
export const walkGaps = (subject: Subject): Walked => {
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
