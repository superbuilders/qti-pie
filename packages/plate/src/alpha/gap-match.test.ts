/**
 * Gap Match on synthetic items of the comparison and number line forms (`./fixtures/gap-match/`): a
 * comparison, one gap between two numerals and three symbol cards (`qti-choices-bottom
 * alpha-symbol-compare`, one response pair), and an open number line, three positions and three
 * numeral cards (`qti-choices-top alpha-open-number-line`), its stem and end labels narrated. Each
 * is opened as the database admitted it, redacted for a child, its board built as the island builds
 * it (`gapBoardOf` over the payload's gap texts and gaps), and every script of a child's moves
 * played on that board through the placement machine, as a tap and a tap, a drag or a key plays
 * it.
 *
 * The oracle is what the child sees: the cards in the tray in the order each item authors them,
 * never shuffled; and each script's gaps at the end, which the response must send exactly and each
 * gap must draw. The scripts cover each form's answers: the key; each expected wrong answer (the
 * reversed symbol, the equal sign; the whole order reversed, the three-digit number placed by its
 * first digit); an answer left short; a placed card lifted again and taken back to the tray, after
 * which its gap must send nothing; a card moved between gaps; and a drop on a filled gap, refused,
 * as the owner ruled for every Gap Match (2026-11-25). Scoring is the database's (`match_correct`),
 * never plate's.
 *
 * @module
 */
import { readFile } from "node:fs/promises";
import path from "node:path";
import { assert, describe, it } from "@effect/vitest";
import { Effect, Option } from "effect";
import { configure } from "#plate/configuration.ts";
import { redactedInteractionsIn } from "#plate/model/interactions.ts";
import { interactionPayload } from "#plate/payload.ts";
import { gapBoardOf } from "#plate/placement/gap-board.ts";
import { limitOf } from "#plate/placement/limit.ts";
import { bank, chipsIn, pick, place } from "#plate/placement/machine.ts";
import type { PairsArrangement, Place, RefusalReason } from "#plate/placement/machine.ts";
import { redact } from "#plate/redact.ts";
import { admitted } from "#plate/test/admitted.ts";
import { feedbackHidden, pageOf, shownToCandidate, textOf } from "#plate/test/page.ts";
import { acceptedItem } from "#plate/validate/verdict.ts";

/**
 * Where a move takes a card from or to: the tray, or a gap by its place among the item's gaps in
 * document order, from 0 (on the number line, 0 is the position by "least").
 */
type Where = "tray" | number;

/**
 * One move of a child: the card by its printed text, where it is taken from and where it is put,
 * and the board's refusal where the board refuses it: of the pick, where the card cannot be taken,
 * or of the drop.
 */
interface Move {
  readonly card: string;
  readonly from: Where;
  readonly refused?: RefusalReason;
  readonly to: Where;
}

/**
 * One script: its name, the child's moves in order, and what each gap shows at the end, by its
 * card's printed text or `null` while empty.
 */
interface Script {
  readonly moves: readonly Move[];
  readonly name: string;
  readonly shows: readonly (string | null)[];
}

/**
 * One look-alike: its name, its fixture's path from this folder's fixtures, the cards in the tray
 * in the order it presents them, and its scripts.
 */
interface GapItem {
  readonly name: string;
  readonly path: string;
  readonly scripts: readonly Script[];
  readonly tray: readonly string[];
}

/**
 * The comparison's scripts ("47 [ ] 74", the key `<`): one gap, the three symbol cards.
 */
const comparisonScripts: readonly Script[] = [
  { moves: [{ card: "<", from: "tray", to: 0 }], name: "the key, into the gap", shows: ["<"] },
  {
    moves: [{ card: ">", from: "tray", to: 0 }],
    name: "the reversed symbol, the expected wrong answer",
    shows: [">"],
  },
  { moves: [{ card: "=", from: "tray", to: 0 }], name: "the equal sign", shows: ["="] },
  { moves: [], name: "nothing placed", shows: [null] },
  {
    moves: [
      { card: "<", from: "tray", to: 0 },
      { card: "<", from: 0, to: "tray" },
    ],
    name: "the key placed, then taken back out to the tray: the empty gap sends nothing",
    shows: [null],
  },
  {
    moves: [
      { card: ">", from: "tray", to: 0 },
      { card: ">", from: 0, to: "tray" },
      { card: "<", from: "tray", to: 0 },
    ],
    name: "the reversed symbol placed, lifted back out, then the key placed",
    shows: ["<"],
  },
  {
    moves: [
      { card: "<", from: "tray", to: 0 },
      { card: ">", from: "tray", refused: "totalReached", to: 0 },
    ],
    name: "the key placed, then the reversed symbol refused at the filled gap: the key stays",
    shows: ["<"],
  },
  {
    moves: [
      { card: ">", from: "tray", to: 0 },
      { card: ">", from: 0, to: 0 },
    ],
    name: "the reversed symbol placed, lifted and put back down in its gap",
    shows: [">"],
  },
];

/**
 * The number line's scripts (cards 106, 36 and 63; the key 36, 63, 106 from least to greatest):
 * three positions.
 */
const numberLineScripts: readonly Script[] = [
  {
    moves: [
      { card: "36", from: "tray", to: 0 },
      { card: "63", from: "tray", to: 1 },
      { card: "106", from: "tray", to: 2 },
    ],
    name: "the key, 36, 63, 106 from least to greatest",
    shows: ["36", "63", "106"],
  },
  {
    moves: [
      { card: "106", from: "tray", to: 0 },
      { card: "63", from: "tray", to: 1 },
      { card: "36", from: "tray", to: 2 },
    ],
    name: "the whole order reversed, the expected direction error",
    shows: ["106", "63", "36"],
  },
  {
    moves: [
      { card: "36", from: "tray", to: 0 },
      { card: "106", from: "tray", to: 1 },
      { card: "63", from: "tray", to: 2 },
    ],
    name: "106 placed before 63, by its first digit",
    shows: ["36", "106", "63"],
  },
  {
    moves: [
      { card: "106", from: "tray", to: 0 },
      { card: "36", from: "tray", to: 1 },
      { card: "63", from: "tray", to: 2 },
    ],
    name: "the cards in the tray's order",
    shows: ["106", "36", "63"],
  },
  {
    moves: [
      { card: "36", from: "tray", to: 0 },
      { card: "63", from: "tray", to: 1 },
    ],
    name: "two of the three placed, right so far",
    shows: ["36", "63", null],
  },
  {
    moves: [
      { card: "36", from: "tray", to: 0 },
      { card: "63", from: "tray", to: 1 },
      { card: "106", from: "tray", to: 2 },
      { card: "106", from: 2, to: "tray" },
    ],
    name: "the key placed, then 106 taken back out to the tray: its empty position sends nothing",
    shows: ["36", "63", null],
  },
  {
    moves: [
      { card: "63", from: "tray", to: 0 },
      { card: "63", from: 0, to: 1 },
      { card: "36", from: "tray", to: 0 },
      { card: "106", from: "tray", to: 2 },
    ],
    name: "63 moved from the first position to the second, then the rest placed",
    shows: ["36", "63", "106"],
  },
  {
    moves: [
      { card: "63", from: "tray", to: 0 },
      { card: "36", from: "tray", refused: "targetFull", to: 0 },
      { card: "63", from: 0, to: 1 },
      { card: "36", from: "tray", to: 0 },
      { card: "106", from: "tray", to: 2 },
    ],
    name: "36 refused at the filled first position, 63 lifted on, then 36 and 106 placed",
    shows: ["36", "63", "106"],
  },
  {
    moves: [
      { card: "36", from: "tray", to: 0 },
      { card: "63", from: "tray", to: 1 },
      { card: "106", from: "tray", to: 2 },
      { card: "106", from: 2, refused: "targetFull", to: 0 },
      { card: "36", from: 0, to: "tray" },
      { card: "63", from: 1, to: "tray" },
      { card: "106", from: 2, to: "tray" },
    ],
    name: "all three placed, a swap refused, then every card taken back out",
    shows: [null, null, null],
  },
  { moves: [], name: "nothing placed", shows: [null, null, null] },
];

/**
 * The two look-alikes.
 */
const gapItems: readonly GapItem[] = [
  {
    name: "the comparison",
    path: "gap-match/comparison.xml",
    scripts: comparisonScripts,
    tray: [">", "=", "<"],
  },
  {
    name: "the number line",
    path: "gap-match/number-line.xml",
    scripts: numberLineScripts,
    tray: ["106", "36", "63"],
  },
];

/**
 * The fixtures' root, which each item's path is written from.
 */
const fixtures = path.resolve(import.meta.dirname, "fixtures");

/**
 * One look-alike as a child meets it: the cards in the tray, each printed text in presented order
 * with its gap text's identifier; its gaps' identifiers in document order; and its board with
 * nothing placed.
 */
interface Opened {
  readonly cards: readonly (readonly [text: string, identifier: string])[];
  readonly empty: PairsArrangement;
  readonly gaps: readonly string[];
}

/**
 * Open a look-alike as `<Item>` opens it for a child, and build its board as the island does from
 * the payload.
 *
 * @param item The item.
 * @returns What the child meets.
 */
const opened = Effect.fnUntraced(function* opened(item: GapItem) {
  const bytes = yield* Effect.promise(() => readFile(path.join(fixtures, item.path)));
  const verdict = yield* admitted(item.path, bytes);
  const accepted = Option.getOrElse(acceptedItem(verdict), () =>
    assert.fail(`${item.name} is not accepted: ${verdict.verdict}`),
  );
  const page = pageOf(redact(accepted, shownToCandidate, feedbackHidden), {
    configuration: yield* configure({ seed: "" }),
    instance: "alpha",
  });
  const [paired, ...others] = redactedInteractionsIn(page.redacted.body).flatMap((interaction) => {
    const node = interactionPayload(interaction, page.view);

    return node.kind === "gap-match" ? [node] : [];
  });

  if (paired === undefined || others.length > 0) {
    return assert.fail(`${item.name} holds ${String(others.length + 1)} Gap Matches, not one`);
  }

  const { model, payload } = paired;
  const board = gapBoardOf(
    payload.choices.map((choice) => ({
      identifier: choice.identifier,
      matchGroup: choice.matchGroup,
      matchMax: limitOf(choice.matchMax),
    })),
    payload.gaps.map(({ identifier, matchGroup }) => ({ identifier, matchGroup })),
    limitOf(model.maxAssociations),
  );

  return {
    cards: payload.choices.map((choice) => [textOf(choice.content), choice.identifier] as const),
    empty: { ...board, placements: [] },
    gaps: payload.gaps.map((gap) => gap.identifier),
  } satisfies Opened;
});

/**
 * Give a card's gap text's identifier by its printed text.
 *
 * @param item The item, for a failure's message.
 * @param met What the child meets.
 * @param text The card's printed text.
 * @returns The identifier.
 */
const cardOf = (item: GapItem, met: Opened, text: string): string =>
  met.cards.find(([printed]) => printed === text)?.[1] ??
  assert.fail(`${item.name} has no card printed "${text}"`);

/**
 * Name a place of a move as the machine names it.
 *
 * @param item The item, for a failure's message.
 * @param met What the child meets.
 * @param where The tray, or a gap by its place.
 * @returns The place.
 */
const placeOf = (item: GapItem, met: Opened, where: Where): Place => {
  if (where === "tray") {
    return bank;
  }

  const gap = met.gaps[where];

  return gap === undefined
    ? assert.fail(`${item.name} has no gap ${String(where)}`)
    : { id: gap, kind: "target" };
};

/**
 * Play a script's moves on the item's board, as the placement primitive plays each: a pick where
 * the card stands, then a place where it is put; a refusal, of the pick or the place, must be the
 * one the script names and leaves the board as it was.
 *
 * @param item The item.
 * @param met What the child meets.
 * @param script The script.
 * @returns The board after the last move.
 */
const played = (item: GapItem, met: Opened, script: Script): PairsArrangement => {
  let arrangement = met.empty;

  for (const [at, move] of script.moves.entries()) {
    const chip = cardOf(item, met, move.card);
    const picking = pick(arrangement, chip, placeOf(item, met, move.from));
    const step = picking.ok
      ? place(arrangement, picking.picked, placeOf(item, met, move.to))
      : picking;
    const which = `${item.name}, "${script.name}", move ${String(at + 1)}`;

    if (step.ok) {
      assert.isUndefined(move.refused, `${which} went through`);
      arrangement =
        step.arrangement.kind === "pairs"
          ? step.arrangement
          : assert.fail(`${which} left a board of another kind`);
    } else {
      assert.strictEqual(step.refusal.reason, move.refused, `${which} was refused`);
    }
  }

  return arrangement;
};

describe("Gap Match on synthetic items of the comparison and number line forms", () => {
  for (const item of gapItems) {
    it.effect(`${item.name} presents its cards in the order it authors them, never shuffled`, () =>
      Effect.gen(function* presented() {
        const met = yield* opened(item);

        assert.deepStrictEqual(
          met.cards.map(([text]) => text),
          item.tray,
        );
        assert.strictEqual(met.gaps.length, item.scripts[0]?.shows.length);
      }),
    );

    for (const script of item.scripts) {
      it.effect(`${item.name}: ${script.name}, sends exactly what its gaps show`, () =>
        Effect.gen(function* sends() {
          const met = yield* opened(item);
          const after = played(item, met, script);
          const expected = script.shows.flatMap((text, at) =>
            text === null ? [] : [`${cardOf(item, met, text)} ${met.gaps[at] ?? ""}`],
          );

          assert.deepStrictEqual(
            after.placements.map((pair) => `${pair.chip} ${pair.target}`).toSorted(),
            expected.toSorted(),
            "the response the gaps send",
          );
          assert.deepStrictEqual(
            met.gaps.map((gap) => chipsIn(after, { id: gap, kind: "target" })),
            script.shows.map((text) => (text === null ? [] : [cardOf(item, met, text)])),
            "what each gap draws",
          );
        }),
      );
    }
  }
});
