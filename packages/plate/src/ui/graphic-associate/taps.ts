/**
 * A tap on a Graphic Associate's image, as a step of its board of boxes: what the island does when
 * the child taps an area of the picture. Pure, and safe to import on the server and the client.
 *
 * The image's areas are the board's chips, the same ones its list shows, and a tap writes nothing
 * of its own: it goes through the placement machine (`#plate/placement/machine.ts`), so the
 * image and the list share one state and one set of rules. A tap puts the area in the open half,
 * the empty half of the first box that holds one chip, else the first half of the empty box a new
 * pair begins in. So a first tap starts a box, a second tap on another area completes the pair, and
 * a tap on the area waiting alone in the open box takes it back. The box waiting for a partner is
 * the held token whichever input started it, the list or the image, and one rule decides a tap on
 * it: the child takes it back, and a pair of an area with itself never forms (#453). A tap the
 * machine would refuse changes nothing, and gives the machine's refusal.
 *
 * @module
 */
import { bank, pick, place, shownBoxes } from "#plate/placement/machine.ts";
import type { BoxesArrangement, Half, Step } from "#plate/placement/machine.ts";

/**
 * The half a tap on the image puts an area in, and the chip waiting in the other half of its box,
 * none where that half is empty too.
 */
export interface OpenHalf {
  readonly half: Half;
  readonly waiting: string | null;
}

/**
 * Find the half a tap on the image puts an area in: the empty half of the first box the page shows
 * that has one. A box short of a pair has one empty half, and the empty box after the boxes, which
 * the page offers once every box holds a pair, has two, so its first is taken. Full boxes come
 * before neither, and none has room at the total once every box holds a pair.
 *
 * @param arrangement The board of boxes and its placements.
 * @returns The half and the chip beside it, or none when every box the page shows is full.
 */
export const openHalf = (arrangement: BoxesArrangement): OpenHalf | undefined => {
  const boxes = shownBoxes(arrangement);
  const index = boxes.findIndex(([first, second]) => first === null || second === null);
  const box = boxes[index];
  if (box === undefined) {
    return undefined;
  }

  const side = box[0] === null ? 0 : 1;

  return { half: { box: index, kind: "half", side }, waiting: box[side === 0 ? 1 : 0] };
};

/**
 * Give the half beside a half, in the same box.
 *
 * @param half A half.
 * @returns The box's other half.
 */
const besideOf = (half: Half): Half => ({ ...half, side: half.side === 0 ? 1 : 0 });

/**
 * Take a tap on an area of the image as a step of the board: the area, a chip, goes from the bank
 * into the {@link openHalf}, or, when it waits alone in the open box, back to the bank.
 *
 * The step is the machine's, so it is refused as the machine refuses a pick from the bank and a
 * place into the half: `chipUsedUp` for an area in as many pairs as its `match-max` allows,
 * `pairMade` for a pair another box already makes, `notInGroup` for a pair a `match-group` keeps
 * apart. With no open half, at `max-associations` with every box a pair, it is refused as
 * `totalReached`, since a tap on the image names no half to trade with.
 *
 * @param arrangement The board of boxes and its placements.
 * @param chip The tapped area's identifier.
 * @returns The next arrangement and what happened, a `placed` or a `returned` move, or the refusal.
 */
export const tapStep = (arrangement: BoxesArrangement, chip: string): Step => {
  const open = openHalf(arrangement);

  if (open !== undefined && open.waiting === chip) {
    const lifted = pick(arrangement, chip, besideOf(open.half));

    return lifted.ok ? place(arrangement, lifted.picked, bank) : lifted;
  }

  const lifted = pick(arrangement, chip, bank);

  if (!lifted.ok) {
    return lifted;
  }

  return open === undefined
    ? { ok: false, refusal: { chip, partner: null, reason: "totalReached", target: null } }
    : place(arrangement, lifted.picked, open.half);
};
