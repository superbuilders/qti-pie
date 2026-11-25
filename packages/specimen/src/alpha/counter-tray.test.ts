/**
 * The counter tray's suite, `urn:fdc:alpha.school:2026:count-placements` (Q-16, a Portable Custom
 * Interaction module shipped as content, `countPlacements` of `@qti-pie/plate/alpha/pci-modules`),
 * on three synthetic counter-tray items (the fixtures `fixtures/alpha/counter-tray/`: two open mats
 * and a double ten frame), each opened, resolved and rendered by plate and run in headless Google
 * Chrome through plate's own frame page and boot as a child drives it
 * (`#specimen/alpha/counter-tray.ts`), against the kindergarten forms' product requirements, never
 * plate's code: the score is the number of counters on the mat when the child submits; no count is
 * ever shown; and a double ten frame fills its cells in order. The module the pages load is its
 * file as a package holds it, the text Node's type stripping gives.
 *
 * The rules:
 *
 * - CT1, the count: on each of the three items, by mouse drag, mouse taps, finger drag, finger taps
 *   and the keyboard, counters placed on the mat one at a time up to one past the item's target and
 *   then every one taken back, the value the page holds after each move is the number of counters
 *   on the mat, a single integer in Appendix C's binding (`{ "base": { "integer": n } }`), so the
 *   page posts one under the target, the target and one over it as the child left them; an empty
 *   mat, the tray as it starts, is NULL (`{ "base": null }`), no answer, as an untouched tray is;
 *   the mat shows that many counters and the tray the rest of the supply.
 * - CT2, no count: at every step no text and no accessible name in the frame's body, what the module
 *   shows, holds a numeral or a number word, and the mat's own drawing never changes, so it cannot
 *   change at the target, which the module is never told. (The frame's title is the item's prompt,
 *   the stem that asks for the set, which plate shows and names outside the frame.)
 * - CT3, the ten frame fills in order and never has a gap: on the double ten frame (`ten-frame`) the
 *   counters on the mat stand in the first cells as the drawing shows them, frame one before frame
 *   two, each top row before bottom row, left to right, after every placing and after a counter is
 *   taken back from the middle, by taps or a drag; and a double ten frame takes a supply of twenty,
 *   every counter a cell.
 * - CT4, tap-then-tap and dragging back: a drag let go over its own zone moves nothing, a tap on the
 *   chosen counter's own zone lets it go, a tap on another counter of its zone chooses that one
 *   instead, and a tap on a counter of the other zone takes the chosen counter there.
 * - CT5, resume: a tray bound to the value a child left shows that many counters on the mat, and the
 *   next move counts on from it; a tray bound to an integer it could not have left (0, below it,
 *   past the supply, or no whole number) starts with an empty mat and tells the host so, NULL,
 *   once, so a wrong stored answer never keeps the child from the item.
 * - CT6, a malformed item is refused: a property beyond the two (a target and a colour among them), a
 *   supply that is no whole number from 1 to 20 on either mat, a mat that is neither `open` nor
 *   `double-ten-frame`, `data-ssml` (which QTI's schema does not give the element), or a bound
 *   value of another cardinality or base type than single integer (its declaration is not the
 *   tray's), and the frame says the PCI cannot run, while QTI's own `data-catalog-idref` and
 *   `data-qti-suppress-tts` are passed over; the error the module throws names what is wrong, as
 *   Chrome's devtools read it (the frame's own report carries only "Script error.": the module's
 *   script is another origin's than the frame's opaque one, loaded without CORS, so Chrome mutes
 *   its errors' messages).
 * - CT7, untouched: a tray the child never touched relays nothing, so the page posts no response.
 * - CT8, a drop is read where it lands: a drag let go beside the mat to its right or its left at the
 *   mat's height, between the mat and the tray, or below the tray, puts its counter back, and one
 *   let go on a counter of the other zone moves it there.
 * - CT9, a drifting tap is a tap, by one rule for every button: a press that travels less than half a
 *   counter from where it went down chooses its counter, even when it ends past the counter's edge,
 *   so the next tap on the mat moves it, and one that travels further is a drag; and a press on the
 *   mat's background that travels less than half a counter is a tap of the mat, which takes the
 *   chosen counter, while one that travels further moves nothing and keeps the choice.
 * - CT9 also: a press on a tray counter let go over the mat with no move between is a drag let go
 *   there, and a tap's drift is measured in CSS pixels on the screen, so on a page too narrow for
 *   the board's design size a finger drifting 18 px on the open mat, or 15 px on the ten frame,
 *   still taps.
 * - CT10, completion ends the input: once the host completes the PCI, a drag under way moves nothing
 *   and leaves no counter following the pointer, and neither taps nor the keyboard move a counter
 *   or fire a change.
 * - CT11, a counter is a picture: every counter shows the markup's one `img`, drawn at its size (40,
 *   64 and 32 CSS pixels), and an item whose markup is anything else (none, two, text, a paragraph,
 *   no `alt`, an empty `src`, no or another `data-qti-suppress-tts`, a side not square or outside
 *   32 to 64) is refused, naming what is wrong.
 * - CT12, a resting finger: while one finger rests beside the board, a second finger's taps on a tray
 *   counter and then on the mat move the counter.
 * - CT13, a press that ends unseen: a mouse drag whose capture a right click (a context menu) takes
 *   midway, let go beside the board, or a press whose release is lost before the pointer moves, the
 *   pointer then moving with no button held across the board or straight off it, leaves nothing
 *   following the pointer and no press standing: the keyboard then moves a counter, and a click on
 *   the mat with nothing chosen moves nothing.
 * - CT14, the ring goes with its counter: a chosen counter dragged halfway leaves no ring behind.
 *
 * Every item is opened by plate's admission, its module resolved to its package's file with no
 * notice, and its frame's module registers exactly the identifier the item writes, so plate's
 * type-identifier rule finds it exactly (R7's `exact`): the module is found by QTI's module
 * resolution, the `module` attribute and the `qti-interaction-module`'s path, and the type
 * identifier only names the factory among those the loaded modules register.
 *
 * Its kills, each a slip planted in the module's file as a page loads it, which the rules catch:
 * the count read from the tray, a running count drawn on the board, the mat drawn differently once
 * it holds some counters, one tap moving a counter, a drag let go anywhere moving it, the ten frame
 * filled from its last cell, a drop read from the release point's height alone, a press that is a
 * drag as soon as it moves, a background's tap that tolerates less drift than a counter's (the
 * browser's own click, about 15 px on touch), a tap's drift measured on the board so it shrinks
 * with the board's scale, a release far from its press with no move between read as a tap, a press
 * ignored while another finger rests on the screen, a second finger's tap on a counter dropped, a
 * press left standing when its release is lost before it moves, a press left standing when its
 * pointer loses the board's capture, the chosen ring left behind when its counter is dragged, a
 * completion that leaves the tray listening, and one that leaves the drag under way.
 *
 * @module
 */
import { availableParallelism } from "node:os";
import { assert, layer } from "@effect/vitest";
import { exhaust } from "@bjornpagen/testing/explore";
import { requiredInSpace } from "@bjornpagen/testing/features";
import { element } from "@bjornpagen/testing/gen";
import { searched } from "@bjornpagen/testing/vitest";
import { Context, Duration, Effect, Exit, Layer, Option } from "effect";
import { counterTrays, numberWords } from "#specimen/alpha/counter-tray.ts";
import type {
  Bound,
  Gesture,
  Given,
  Hosted,
  Look,
  Point,
  Running,
  Spot,
  Started,
  TrayItem,
  Trays,
  Way,
  Zone,
} from "#specimen/alpha/counter-tray.ts";

/**
 * How long one rule may run before vitest stops it: a hang guard, never a budget. Each rule drives
 * Chrome for every move it checks, on a machine that runs many suites at once.
 */
const ruleHang = 1_200_000;

/**
 * How many trays a rule drives at once, each in a page of its own: one per core, as plate's math
 * entry suite drives its fields.
 */
const trayCount = availableParallelism();

/**
 * One item as a rule plays it: the item, what plate's island hands its frame, and what the rules
 * read of it: the tray's supply and the mat, from the item's own properties.
 */
interface Played {
  readonly hosted: Hosted;
  readonly item: TrayItem;
  readonly supply: number;
  readonly tenFrame: boolean;
}

/**
 * Play an item with a module file: host it, and read what the rules need of it.
 *
 * @param trays The trays.
 * @param item The item.
 * @param module The module file's text.
 * @returns The item as played.
 */
const playedOf = (trays: Trays, item: TrayItem, module: string): Effect.Effect<Played> =>
  Effect.map(Effect.orDie(trays.host(item, module)), (hosted): Played => ({
    hosted,
    item,
    supply: Number(hosted.properties["supply"]),
    tenFrame: hosted.properties["mat"] === "double-ten-frame",
  }));

/**
 * Every way a child moves a counter.
 */
const ways: readonly Way[] = [
  { by: "mouse", kind: "drag" },
  { by: "mouse", kind: "taps" },
  { by: "touch", kind: "drag" },
  { by: "touch", kind: "taps" },
  { by: "keyboard", kind: "taps" },
];

/**
 * A way, named for a message.
 *
 * @param way The way.
 * @returns Its name.
 */
const nameOf = (way: Way): string => `${way.by} ${way.kind}`;

/**
 * The value Appendix C binds a single integer to, which the page holds and posts.
 *
 * @param count The integer.
 * @returns Its JSON.
 */
const integer = (count: number): Bound => ({ base: { integer: count } });

/**
 * Appendix C's NULL single value: a tray bound to no response, and the response of an empty mat.
 */
const empty: Bound = { base: null };

/**
 * The response the page holds for a count of counters on the mat: the integer, NULL for none.
 *
 * @param count The count.
 * @returns Its JSON.
 */
const responseOf = (count: number): Bound => (count === 0 ? empty : integer(count));

/**
 * The text a numeral or a number word stands in, any of them.
 */
const countWords = new RegExp(`[0-9]|\\b(?:${numberWords.join("|")})\\b`, "iu");

/**
 * A slip planted in the module's file: the text it changes, as a pattern matching exactly once,
 * and what it writes there. The file is Node's type stripping of the module, which blanks each
 * type annotation where it stood, so a pattern spans those blanks with `\s*`.
 */
interface Kill {
  readonly at: RegExp;
  readonly why: string;
  readonly write: string;
}

/**
 * The kills: each a slip a change to the module could make, written into its file's text.
 */
const kills: readonly Kill[] = [
  {
    at: /\{ base: \{ integer: placed \} \}/gu,
    why: "the count read from the tray",
    write: "{ base: { integer: supply - placed } }",
  },
  {
    at: /const draw = \(\)\s*=> \{/gu,
    why: "a running count drawn on the board",
    write:
      'const draw = () => { board.querySelector("text")?.remove(); const shown = svg("text", { x: 8, y: 24 }); shown.textContent = String(placed); board.append(shown);',
  },
  {
    at: /const draw = \(\)\s*=> \{/gu,
    why: "the mat drawn differently once it holds three counters",
    write: 'const draw = () => { matZone.setAttribute("stroke", placed >= 3 ? "#16a34a" : "#333");',
  },
  {
    at: /const tapCounter = \(tapped\s*\)\s*=> \{/gu,
    why: "one tap moving a counter",
    write: "const tapCounter = (tapped) => { move(tapped.zone); return;",
  },
  {
    at: /const over = zoneUnder\(event\);/gu,
    why: "a drag let go anywhere moving its counter",
    write:
      'const over = pressed.kind === "counter" && pressed.place.zone === "mat" ? "tray" : "mat";',
  },
  {
    at: /cells\.slice\(0, count\)/gu,
    why: "the ten frame filled from its last cell",
    write: "cells.slice(tenFrameCells - count)",
  },
  {
    at: /document\.elementFromPoint\(event\.clientX, event\.clientY\)/gu,
    why: "a drop read from the release point's height alone",
    write: "document.elementFromPoint(board.getBoundingClientRect().left + 30, event.clientY)",
  },
  {
    at: /const tapTravel = face\.side \/ 2;/gu,
    why: "a press that is a drag as soon as it moves",
    write: "const tapTravel = 0;",
  },
  {
    at: /Math\.hypot\(event\.clientX - press\.start\.x, event\.clientY - press\.start\.y\) > tapTravel/gu,
    why: "a background's tap that tolerates less drift than a counter's",
    write:
      'Math.hypot(event.clientX - press.start.x, event.clientY - press.start.y) > (press.pressed.kind === "zone" ? 15 : tapTravel)',
  },
  {
    at: /Math\.hypot\(event\.clientX - press\.start\.x, event\.clientY - press\.start\.y\) > tapTravel/gu,
    why: "a tap's drift measured on the board, shrinking with its scale",
    write:
      "Math.hypot(event.clientX - press.start.x, event.clientY - press.start.y) > tapTravel * (board.getBoundingClientRect().width / board.viewBox.baseVal.width)",
  },
  {
    at: /const travelled = press\.travelled \|\| pastTap\(event\);/gu,
    why: "a release far from its press with no move between read as a tap",
    write: "const travelled = press.travelled;",
  },
  {
    at: /pressed === undefined \|\|\s*event\.button !== 0 \|\|/gu,
    why: "a press ignored while another finger rests on the screen",
    write: "pressed === undefined || !event.isPrimary || event.button !== 0 ||",
  },
  {
    at: /event\.buttons !== 0\) \{\s*return false;\s*\}\s*endPress\(\);/gu,
    why: "a press left standing when its release is lost before it moves",
    write: "event.buttons !== 0) { return false; } return false;",
  },
  {
    at: /board\.ownerDocument\.addEventListener\(\s*"pointermove",[\s\S]*?\{ signal \},\s*\);/gu,
    why: "a lost release heard only on the board, not where the pointer first moves",
    write: "",
  },
  {
    at: /board\.addEventListener\("lostpointercapture", endUnseen, \{ signal \}\);[\s\S]*?"contextmenu",[\s\S]*?\{ signal \},\s*\);/gu,
    why: "a press left standing when its pointer loses the board's capture",
    write: "",
  },
  {
    at: /\} else if \(!travelled\) \{\n {10}tapCounter\(pressed\.place\);/gu,
    why: "a second finger's tap on a counter dropped",
    write: "} else if (!travelled) {\n          if (event.isPrimary) tapCounter(pressed.place);",
  },
  {
    at: /isChosen \? "inherit" : "hidden"/gu,
    why: "the chosen ring left behind when its counter is dragged",
    write: 'isChosen ? "visible" : "hidden"',
  },
  {
    at: /listening\.abort\(\);/gu,
    why: "a completion that leaves the tray listening",
    write: "",
  },
  {
    at: /endPress\(\);\s*choice = undefined;\s*draw\(\);\s*\},/gu,
    why: "a completion that leaves the drag under way",
    write: "choice = undefined; draw(); },",
  },
];

/**
 * Plant a kill's slip in the module's file, failing the rule when its pattern does not match
 * exactly once, so no kill is vacuous.
 *
 * @param module The module's file.
 * @param kill The kill.
 * @returns The file's text with the slip.
 */
const planted = (module: string, kill: Kill): string => {
  const matches = [...module.matchAll(kill.at)].length;

  assert.strictEqual(matches, 1, `${kill.why}: its pattern matches the module's file once`);

  return module.replace(kill.at, kill.write);
};

/**
 * The trays the rules drive, Chrome, the page server and the opened items held for the whole
 * file.
 */
class TraysService extends Context.Service<TraysService, Trays>()(
  "specimen/alpha/counter-tray.test/Trays",
) {}

/**
 * Open {@link TraysService}, closed when the file ends.
 */
const TraysLayer = Layer.effect(TraysService, Effect.orDie(counterTrays));

/**
 * Start a tray and give it running, failing the rule when the frame says it cannot run.
 *
 * @param trays The trays.
 * @param played The item as played.
 * @param bound The value it is bound to.
 * @returns The running tray, its page closed with the scope.
 */
const running = (trays: Trays, played: Played, bound: Bound) =>
  Effect.map(Effect.orDie(trays.start(played.hosted, bound)), (started: Started): Running => {
    if (started.kind === "failed") {
      return assert.fail(`${played.item.id} cannot run: ${started.reason}`);
    }

    assert.deepStrictEqual(
      started.registered,
      [played.hosted.typeIdentifier],
      `${played.item.id}: the module registers the identifier the item writes, the one factory`,
    );

    return started.running;
  });

/**
 * Find the item a rule plays by its id, failing the rule when the fixtures hold none.
 *
 * @param trays The trays.
 * @param id The id.
 * @param module The module file's text.
 * @returns The item as played.
 */
const playing = (trays: Trays, id: string, module: string): Effect.Effect<Played> => {
  const item = trays.items.find((each) => each.id === id);

  assert.isDefined(item, `the fixtures hold ${id}`);

  return playedOf(trays, item, module);
};

/**
 * A point's key, to its tenth of a unit, to compare sets of points by.
 *
 * @param point The point.
 * @returns Its key.
 */
const pointKey = (point: Point): string => `${point.x.toFixed(1)} ${point.y.toFixed(1)}`;

/**
 * Hold a ten frame's look to CT3: the counters on the mat stand in exactly its first cells, as the
 * drawing shows the cells in reading order.
 *
 * @param look The look.
 * @param where The item, the way and the step, for the message.
 */
const firstCells = (look: Look, where: string): void => {
  assert.strictEqual(look.cells.length, 20, `${where}: CT3, the drawing shows two frames of ten`);
  assert.deepStrictEqual(
    look.matCentres.map(pointKey).toSorted(),
    look.cells.slice(0, look.mat).map(pointKey).toSorted(),
    `${where}: CT3, the counters stand in the first cells`,
  );
};

/**
 * Hold a look to CT2 against the first one: no count in any text, and the mat drawn as it was.
 *
 * @param look The look.
 * @param first The tray's first look.
 * @param where The item, the way and the step, for the message.
 */
const noCount = (look: Look, first: Look, where: string): void => {
  for (const text of look.texts) {
    assert.notMatch(text, countWords, `${where}: CT2, no count in ${JSON.stringify(text)}`);
  }

  assert.strictEqual(look.matDrawing, first.matDrawing, `${where}: CT2, the mat's drawing`);
};

/**
 * Move one counter and hold the tray to CT1, CT2 and, on the ten frame, CT3: the page holds the
 * count the oracle expects, the screen shows it, no count is shown, and the counters stand in the
 * first cells.
 *
 * @param tray The running tray.
 * @param played The item as played.
 * @param way How the child moves.
 * @param from The zone the counter leaves.
 * @param expected The counters on the mat after the move.
 * @param first The tray's first look.
 * @returns The check.
 */
const movedTo = (
  tray: Running,
  played: Played,
  way: Way,
  from: Zone,
  expected: number,
  first: Look,
) =>
  Effect.gen(function* moved() {
    const where = `${played.item.id} by ${nameOf(way)}, ${from === "tray" ? "placed" : "taken back"} to ${String(expected)}`;

    yield* Effect.orDie(tray.act("move", from, way));

    const posted = yield* Effect.orDie(tray.posted);
    const look = yield* Effect.orDie(tray.look);

    assert.deepStrictEqual(
      posted,
      Option.some(responseOf(expected)),
      `${where}: CT1, the value the page holds`,
    );
    assert.strictEqual(look.mat, expected, `${where}: CT1, the counters the mat shows`);
    assert.strictEqual(
      look.tray,
      played.supply - expected,
      `${where}: CT1, the counters the tray shows`,
    );
    noCount(look, first, where);

    if (played.tenFrame) {
      firstCells(look, where);
    }
  });

/**
 * Hold a tray to a gesture that moves nothing: the counters it was bound to stand on the mat, the
 * module fired no change, and the page holds the bound count, or nothing new.
 *
 * @param tray The running tray.
 * @param left The counters it was bound to.
 * @param where The gesture, for the message.
 * @returns The check.
 */
const stillAt = (tray: Running, left: number, where: string) =>
  Effect.gen(function* still() {
    const look = yield* Effect.orDie(tray.look);
    const posted = yield* Effect.orDie(tray.posted);

    assert.strictEqual(look.mat, left, `${where}: the counters on the mat`);
    assert.strictEqual(look.fired, 0, `${where}: no change fired`);
    assert.deepStrictEqual(
      Option.getOrElse(posted, () => responseOf(left)),
      responseOf(left),
      `${where}: the value the page holds`,
    );
  });

/**
 * Hold a tray to CT10: complete it while a hand carries a tray counter to the mat, by mouse, then
 * tap a tray counter and the mat, and press Enter on them: nothing moves, nothing follows the
 * pointer, and no change is fired.
 *
 * @param tray The running tray, bound to two counters.
 * @param by The hand that carries the counter.
 * @returns The check.
 */
const completedStill = (tray: Running, by: "mouse" | "touch") =>
  Effect.gen(function* completed() {
    yield* Effect.orDie(
      tray.completeMidDrag(
        { at: 0, kind: "counter", zone: "tray" },
        { kind: "zone", zone: "mat" },
        by,
      ),
    );

    const look = yield* Effect.orDie(tray.look);

    assert.strictEqual(look.mat, 2, `completed mid-drag by ${by}: CT10, the counters on the mat`);
    assert.strictEqual(look.fired, 0, `completed mid-drag by ${by}: CT10, no change fired`);
    assert.isFalse(look.carried, `completed mid-drag by ${by}: CT10, nothing follows the pointer`);

    for (const input of ["mouse", "keyboard"] as const) {
      yield* Effect.orDie(tray.tap({ at: 0, kind: "counter", zone: "tray" }, input));
      yield* Effect.orDie(tray.tap({ kind: "zone", zone: "mat" }, input));
      yield* stillAt(tray, 2, `completed, then taps by ${input}: CT10`);
    }
  });

/**
 * Hold CT12: while one finger rests on a spot, a second finger's taps on a tray counter and then on
 * the mat move the counter.
 *
 * @param trays The trays.
 * @param played The item as played.
 * @param rest Where the first finger rests.
 * @returns The check.
 */
const restingFinger = (trays: Trays, played: Played, rest: Spot) =>
  Effect.scoped(
    Effect.gen(function* rested() {
      const tray = yield* running(trays, played, empty);
      const where = `${played.item.id}, a finger resting on ${rest.kind}`;

      yield* Effect.orDie(
        tray.tapsBeside(rest, [
          { at: 0, kind: "counter", zone: "tray" },
          { kind: "zone", zone: "mat" },
        ]),
      );

      const look = yield* Effect.orDie(tray.look);

      assert.strictEqual(look.mat, 1, `${where}: CT12, the other finger's taps move a counter`);
      assert.strictEqual(look.fired, 1, `${where}: CT12, one change fired`);
    }),
  );

/**
 * Hold CT13: a mouse drag whose capture a right click takes midway, let go beside the board, leaves
 * no press standing: nothing follows the pointer, the keyboard moves a counter, and a click on the
 * mat with nothing chosen moves nothing.
 *
 * @param trays The trays.
 * @param played The item as played.
 * @returns The check.
 */
const unseenEnd = (trays: Trays, played: Played) =>
  Effect.scoped(
    Effect.gen(function* unseen() {
      const tray = yield* running(trays, played, integer(2));

      yield* Effect.orDie(
        tray.rightClickMidDrag(
          { at: 0, kind: "counter", zone: "tray" },
          { kind: "beside the mat, right" },
        ),
      );

      const after = yield* Effect.orDie(tray.look);

      assert.isFalse(after.carried, "CT13: nothing follows the pointer once the drag ended unseen");
      assert.strictEqual(after.mat, 2, "CT13: the drag moved nothing");
      yield* Effect.orDie(tray.tap({ at: 0, kind: "counter", zone: "tray" }, "keyboard"));
      yield* Effect.orDie(tray.tap({ kind: "zone", zone: "mat" }, "keyboard"));
      assert.strictEqual(
        (yield* Effect.orDie(tray.look)).mat,
        3,
        "CT13: the keyboard moves a counter",
      );
      yield* Effect.orDie(tray.tap({ kind: "zone", zone: "mat" }, "mouse"));
      assert.strictEqual(
        (yield* Effect.orDie(tray.look)).mat,
        3,
        "CT13: a click on the mat with nothing chosen moves nothing",
      );
    }),
  );

/**
 * Hold CT13's lost release: a mouse press on a tray counter whose release something outside the
 * page takes before the pointer moves, the pointer then moving with no button held, leaves no
 * press standing: nothing follows the pointer, the keyboard moves a counter, and a click on the mat
 * with nothing chosen moves nothing.
 *
 * @param trays The trays.
 * @param played The item as played.
 * @returns The check.
 */
const lostEnd = (trays: Trays, played: Played, moves: number) =>
  Effect.scoped(
    Effect.gen(function* lost() {
      const tray = yield* running(trays, played, integer(2));

      yield* Effect.orDie(
        tray.lostRelease(
          { at: 0, kind: "counter", zone: "tray" },
          { kind: "beside the mat, right" },
          moves,
        ),
      );

      const after = yield* Effect.orDie(tray.look);

      assert.isFalse(after.carried, "CT13: nothing follows the pointer once the release is lost");
      assert.strictEqual(after.mat, 2, "CT13: the lost press moved nothing");
      yield* Effect.orDie(tray.tap({ at: 0, kind: "counter", zone: "tray" }, "keyboard"));
      yield* Effect.orDie(tray.tap({ kind: "zone", zone: "mat" }, "keyboard"));
      assert.strictEqual(
        (yield* Effect.orDie(tray.look)).mat,
        3,
        "CT13: the keyboard moves a counter after a lost release",
      );
      yield* Effect.orDie(tray.tap({ kind: "zone", zone: "mat" }, "mouse"));
      assert.strictEqual(
        (yield* Effect.orDie(tray.look)).mat,
        3,
        "CT13: after a lost release, a click on the mat with nothing chosen moves nothing",
      );
    }),
  );

/**
 * Hold CT9's release rule: a press on a tray counter let go over the mat with no move between is a
 * drag let go there, which moves it.
 *
 * @param trays The trays.
 * @param played The item as played.
 * @returns The check.
 */
const jumped = (trays: Trays, played: Played) =>
  Effect.scoped(
    Effect.gen(function* jump() {
      const tray = yield* running(trays, played, empty);

      yield* Effect.orDie(
        tray.jump({ at: 0, kind: "counter", zone: "tray" }, { kind: "zone", zone: "mat" }),
      );
      assert.strictEqual(
        (yield* Effect.orDie(tray.look)).mat,
        1,
        "CT9: a release over the mat with no move between moves the counter",
      );
    }),
  );

/**
 * Hold CT9's screen rule: on a page `width` CSS pixels wide, where the board is drawn smaller, a
 * finger that drifts `drift` CSS pixels on a tray counter still chooses it.
 *
 * @param trays The trays.
 * @param played The item as played.
 * @param width The page's width.
 * @param drift The finger's drift.
 * @returns The check.
 */
const narrowDrift = (trays: Trays, played: Played, width: number, drift: number) =>
  Effect.scoped(
    Effect.gen(function* narrow() {
      const tray = yield* running(trays, played, empty);

      yield* Effect.orDie(tray.resize(width));
      yield* Effect.orDie(tray.drift({ at: 0, kind: "counter", zone: "tray" }, 0, drift, "touch"));
      yield* Effect.orDie(tray.tap({ kind: "zone", zone: "mat" }, "touch"));
      assert.strictEqual(
        (yield* Effect.orDie(tray.look)).mat,
        1,
        `${played.item.id} ${String(width)} px wide: CT9, a finger drifting ${String(drift)} px taps`,
      );
    }),
  );

/**
 * Hold CT14: the chosen counter's ring goes with it when it is dragged, so midway no ring shows.
 *
 * @param trays The trays.
 * @param played The item as played.
 * @returns The check.
 */
const ringGoes = (trays: Trays, played: Played) =>
  Effect.scoped(
    Effect.gen(function* ring() {
      const tray = yield* running(trays, played, empty);

      yield* Effect.orDie(tray.tap({ at: 0, kind: "counter", zone: "tray" }, "mouse"));
      assert.strictEqual(
        (yield* Effect.orDie(tray.look)).rings,
        1,
        "CT14: the chosen counter's ring",
      );

      const midway = yield* Effect.orDie(
        tray.lookMidDrag(
          { at: 0, kind: "counter", zone: "tray" },
          { kind: "zone", zone: "mat" },
          "mouse",
        ),
      );

      assert.isTrue(midway.carried, "CT14: a counter follows the pointer midway");
      assert.strictEqual(midway.rings, 0, "CT14: no ring stays behind midway");
      assert.strictEqual(
        (yield* Effect.orDie(tray.look)).mat,
        1,
        "CT14: the drag moved the counter",
      );
    }),
  );

/**
 * The rules' checks a kill is held to, on one module file: CT1 and CT2 on `open-mat` by mouse taps
 * to three counters and back to two; CT1 and CT3 on the double ten frame (`ten-frame`) to three and
 * a counter taken back from the middle; CT4's drag let go over its own zone and choice let go,
 * CT8's drop beside the mat, CT9's drifting taps on a counter and on the mat's background, and
 * CT10's completion mid-drag, by mouse, on `open-mat`; and CT12 to CT14 on `open-mat`.
 *
 * @param trays The trays.
 * @param module The module file's text.
 * @returns The checks, dying at the first that fails.
 */
const battery = (trays: Trays, module: string) =>
  Effect.gen(function* checks() {
    const taps: Way = { by: "mouse", kind: "taps" };
    const drag: Way = { by: "mouse", kind: "drag" };
    const openMat = yield* playing(trays, "open-mat", module);
    const tenFrame = yield* playing(trays, "ten-frame", module);

    for (const played of [openMat, tenFrame]) {
      yield* Effect.scoped(
        Effect.gen(function* counted() {
          const tray = yield* running(trays, played, empty);
          const firstLook = yield* Effect.orDie(tray.look);

          for (const placed of [1, 2, 3]) {
            yield* movedTo(tray, played, taps, "tray", placed, firstLook);
          }

          yield* Effect.orDie(
            tray.tap(
              played.tenFrame ? { at: 1, kind: "cell" } : { at: 1, kind: "counter", zone: "mat" },
              "mouse",
            ),
          );
          yield* Effect.orDie(tray.tap({ kind: "zone", zone: "tray" }, "mouse"));

          const look = yield* Effect.orDie(tray.look);

          assert.strictEqual(look.mat, 2, `${played.item.id}: one taken back from the middle`);

          if (played.tenFrame) {
            firstCells(look, `${played.item.id}, one taken back from the middle`);
          }
        }),
      );
    }

    for (const [gesture, way] of [
      ["back", drag],
      ["release", taps],
    ] as const) {
      yield* Effect.scoped(
        Effect.gen(function* still() {
          const tray = yield* running(trays, openMat, integer(2));

          yield* Effect.orDie(tray.act(gesture, "tray", way));
          yield* stillAt(tray, 2, gesture);
        }),
      );
    }

    yield* Effect.scoped(
      Effect.gen(function* beside() {
        const tray = yield* running(trays, openMat, integer(2));

        yield* Effect.orDie(
          tray.drag(
            { at: 0, kind: "counter", zone: "tray" },
            { kind: "beside the mat, right" },
            "mouse",
          ),
        );
        yield* stillAt(tray, 2, "dropped beside the mat");
      }),
    );

    yield* Effect.scoped(
      Effect.gen(function* drifted() {
        const tray = yield* running(trays, openMat, empty);

        yield* Effect.orDie(tray.drift({ at: 0, kind: "counter", zone: "tray" }, 17, 21, "mouse"));
        yield* Effect.orDie(tray.tap({ kind: "zone", zone: "mat" }, "mouse"));
        assert.strictEqual((yield* Effect.orDie(tray.look)).mat, 1, "a drifting tap chooses");
        yield* Effect.orDie(tray.tap({ at: 0, kind: "counter", zone: "tray" }, "mouse"));
        yield* Effect.orDie(tray.drift({ kind: "zone", zone: "mat" }, 0, 18, "mouse"));
        assert.strictEqual(
          (yield* Effect.orDie(tray.look)).mat,
          2,
          "a drifting tap on the mat's background takes the chosen counter",
        );
      }),
    );

    yield* Effect.scoped(
      Effect.gen(function* completed() {
        const tray = yield* running(trays, openMat, integer(2));

        yield* completedStill(tray, "mouse");
      }),
    );

    yield* restingFinger(trays, openMat, { kind: "beside the mat, right" });
    yield* unseenEnd(trays, openMat);
    yield* lostEnd(trays, openMat, 1);
    yield* jumped(trays, openMat);
    yield* narrowDrift(trays, openMat, 200, 18);
    yield* ringGoes(trays, openMat);
  });

layer(TraysLayer, { timeout: Duration.millis(ruleHang) })("the counter tray", (it) => {
  it.effect(
    "CT1, CT2 and CT3: the page holds the counters on the mat after each move, and no count is ever shown",
    (ctx) =>
      Effect.gen(function* countRule() {
        const trays = yield* TraysService;
        const played = yield* Effect.all(
          trays.items.map((item) => playedOf(trays, item, trays.module)),
        );
        const [first, ...rest] = played.flatMap((each) =>
          ways.map((way) => ({ played: each, way })),
        );

        assert.strictEqual(played.length, 3, "the fixtures hold the three counter-tray items");
        assert.isDefined(first, "the three items have ways to move");

        return yield* searched(
          ctx,
          exhaust(
            {
              box: "each of the three items by mouse drag, mouse taps, finger drag, finger taps and the keyboard",
              caseHang: Duration.minutes(5),
              concurrency: trayCount,
              coverage: requiredInSpace<"over" | "emptied">(["over", "emptied"]),
              generator: element([first, ...rest]),
              literal: ({ played: each, way }) => `${each.item.id} by ${nameOf(way)}`,
              oracle: {
                kind: "specification",
                name: "the kindergarten forms' counting item: the response is the number of counters on the mat at submit, as an integer; no running count; the mat does not change at the target",
              },
              suite: "alpha/counter-tray-count",
            },
            ({ played: each, way }, c) =>
              Effect.scoped(
                Effect.gen(function* counted() {
                  const tray = yield* running(trays, each, empty);
                  const firstLook = yield* Effect.orDie(tray.look);

                  assert.strictEqual(firstLook.mat, 0, `${each.item.id}: the mat starts empty`);
                  assert.strictEqual(
                    firstLook.tray,
                    each.supply,
                    `${each.item.id}: the tray starts full`,
                  );
                  noCount(firstLook, firstLook, `${each.item.id} at the start`);

                  for (let placed = 1; placed <= each.item.target + 1; placed += 1) {
                    yield* movedTo(tray, each, way, "tray", placed, firstLook);
                  }

                  c.note("over");

                  for (let left = each.item.target; left >= 0; left -= 1) {
                    yield* movedTo(tray, each, way, "mat", left, firstLook);
                  }

                  c.note("emptied");
                }),
              ),
          ),
        );
      }),
    ruleHang,
  );

  it.effect(
    "CT3: the double ten frame fills its first cells, after a counter is taken back from the middle too, and takes a supply of twenty",
    () =>
      Effect.gen(function* frameOrder() {
        const trays = yield* TraysService;
        const played = yield* playing(trays, "ten-frame", trays.module);
        const twenty: Played = {
          ...played,
          hosted: {
            ...played.hosted,
            properties: { ...played.hosted.properties, supply: "20" },
          },
          supply: 20,
        };

        assert.isTrue(played.tenFrame, "ten-frame draws the double ten frame");

        yield* Effect.forEach(
          [
            { by: "taps", taken: { at: 2, kind: "cell" } },
            { by: "drag", taken: { at: 2, kind: "cell" } },
            { by: "drag", taken: { at: 9, kind: "cell" } },
          ] as const,
          ({ by, taken }) =>
            Effect.scoped(
              Effect.gen(function* takenBack() {
                const where = `${played.item.id}, the counter in cell ${String(taken.at)} taken back by ${by}`;
                const tray = yield* running(trays, played, integer(13));

                firstCells(yield* Effect.orDie(tray.look), `${played.item.id} bound to 13`);

                if (by === "taps") {
                  yield* Effect.orDie(tray.tap(taken, "mouse"));
                  yield* Effect.orDie(tray.tap({ kind: "zone", zone: "tray" }, "mouse"));
                } else {
                  yield* Effect.orDie(tray.drag(taken, { kind: "zone", zone: "tray" }, "mouse"));
                }

                const look = yield* Effect.orDie(tray.look);

                assert.strictEqual(look.mat, 12, `${where}: the counters on the mat`);
                assert.deepStrictEqual(
                  yield* Effect.orDie(tray.posted),
                  Option.some(integer(12)),
                  `${where}: the value the page holds`,
                );
                firstCells(look, where);
              }),
            ),
          { concurrency: trayCount, discard: true },
        );

        yield* Effect.scoped(
          Effect.gen(function* filled() {
            const tray = yield* running(trays, twenty, empty);
            const firstLook = yield* Effect.orDie(tray.look);

            for (let placed = 1; placed <= 20; placed += 1) {
              yield* movedTo(
                tray,
                twenty,
                { by: "mouse", kind: "taps" },
                "tray",
                placed,
                firstLook,
              );
            }
          }),
        );
      }),
    ruleHang,
  );

  it.effect(
    "CT4: dragging back, letting a choice go, choosing again, and tapping onto a counter of the other zone",
    () =>
      Effect.gen(function* tapsRule() {
        const trays = yield* TraysService;
        const played = yield* playing(trays, "open-mat", trays.module);
        const cases: readonly {
          readonly expected: number;
          readonly from: Zone;
          readonly gesture: Gesture;
          readonly way: Way;
        }[] = [
          ...(["mouse", "touch"] as const).flatMap((by) =>
            (["tray", "mat"] as const).map((from) => ({
              expected: 2,
              from,
              gesture: "back" as const,
              way: { by, kind: "drag" } as const,
            })),
          ),
          ...(["mouse", "touch", "keyboard"] as const).flatMap((by) => [
            {
              expected: 2,
              from: "tray" as const,
              gesture: "release" as const,
              way: { by, kind: "taps" } as const,
            },
            {
              expected: 2,
              from: "mat" as const,
              gesture: "release" as const,
              way: { by, kind: "taps" } as const,
            },
            {
              expected: 3,
              from: "tray" as const,
              gesture: "switch" as const,
              way: { by, kind: "taps" } as const,
            },
            {
              expected: 1,
              from: "mat" as const,
              gesture: "switch" as const,
              way: { by, kind: "taps" } as const,
            },
            {
              expected: 3,
              from: "tray" as const,
              gesture: "onto" as const,
              way: { by, kind: "taps" } as const,
            },
            {
              expected: 1,
              from: "mat" as const,
              gesture: "onto" as const,
              way: { by, kind: "taps" } as const,
            },
          ]),
        ];

        yield* Effect.forEach(
          cases,
          ({ expected, from, gesture, way }) =>
            Effect.scoped(
              Effect.gen(function* tapped() {
                const where = `${gesture} from the ${from} by ${nameOf(way)}`;
                const tray = yield* running(trays, played, integer(2));

                yield* Effect.orDie(tray.act(gesture, from, way));

                const posted = yield* Effect.orDie(tray.posted);
                const look = yield* Effect.orDie(tray.look);

                assert.strictEqual(look.mat, expected, `${where}: the counters on the mat`);
                assert.strictEqual(look.tray, played.supply - expected, `${where}: the tray`);

                // Nothing moved leaves the count it was bound to: the frame relays the response after
                // any input event, so the page holds that count again, or nothing new.
                assert.deepStrictEqual(
                  Option.getOrElse(posted, () => integer(2)),
                  integer(expected),
                  `${where}: the value the page holds`,
                );
              }),
            ),
          { concurrency: trayCount, discard: true },
        );
      }),
    ruleHang,
  );

  it.effect(
    "CT5: a tray bound to what the child left shows it, the next move counts on from it, and one bound to what it could not have left starts empty",
    () =>
      Effect.gen(function* resumeRule() {
        const trays = yield* TraysService;
        const played = yield* Effect.all(
          trays.items.map((item) => playedOf(trays, item, trays.module)),
        );

        yield* Effect.forEach(
          played.flatMap((each) =>
            [0, 1, each.item.target - 1, each.item.target].map((left) => ({ each, left })),
          ),
          ({ each, left }) =>
            Effect.scoped(
              Effect.gen(function* resumed() {
                const where = `${each.item.id} bound to ${String(left)}`;
                // The child who left an empty mat left NULL, the only value an empty mat reports.
                const tray = yield* running(trays, each, left === 0 ? empty : integer(left));
                const look = yield* Effect.orDie(tray.look);

                assert.strictEqual(look.mat, left, `${where}: the counters on the mat`);
                assert.strictEqual(look.tray, each.supply - left, `${where}: the tray`);

                yield* Effect.orDie(tray.act("move", "tray", { by: "mouse", kind: "taps" }));
                assert.deepStrictEqual(
                  yield* Effect.orDie(tray.posted),
                  Option.some(integer(left + 1)),
                  where,
                );
              }),
            ),
          { concurrency: trayCount, discard: true },
        );

        const openMat = yield* playing(trays, "open-mat", trays.module);
        const unreadable: readonly Given[] = [
          integer(0),
          integer(-1),
          integer(openMat.supply + 1),
          { base: { integer: "3" } },
          { base: { integer: true } },
          { base: { integer: 3.5 } },
        ];

        yield* Effect.forEach(
          unreadable,
          (bound) =>
            Effect.scoped(
              Effect.gen(function* emptied() {
                const where = `open-mat bound to ${JSON.stringify(bound)}`;
                const started = yield* Effect.orDie(trays.start(openMat.hosted, bound));

                assert.strictEqual(started.kind, "running", `${where}: the tray still starts`);

                if (started.kind !== "running") {
                  return;
                }

                const look = yield* Effect.orDie(started.running.look);

                assert.strictEqual(look.mat, 0, `${where}: with an empty mat`);
                assert.strictEqual(look.tray, openMat.supply, `${where}: and a full tray`);
                assert.deepStrictEqual(
                  yield* Effect.orDie(started.running.posted),
                  Option.some(empty),
                  `${where}: telling the host its empty mat, NULL, once`,
                );
                assert.strictEqual(look.fired, 1, `${where}: one change`);
              }),
            ),
          { concurrency: trayCount, discard: true },
        );
      }),
    ruleHang,
  );

  it.effect(
    "CT6: a malformed item is refused, naming what is wrong",
    () =>
      Effect.gen(function* refusedRule() {
        const trays = yield* TraysService;
        const openMat = yield* playing(trays, "open-mat", trays.module);
        const tenFrame = yield* playing(trays, "ten-frame", trays.module);
        const good = openMat.hosted.properties;
        const withoutKey = (key: string): Readonly<Record<string, string>> =>
          Object.fromEntries(Object.entries(good).filter(([name]) => name !== key));
        const cases: readonly {
          readonly bound: Given;
          readonly names: readonly string[];
          readonly played: Played;
          readonly properties: Readonly<Record<string, string>>;
        }[] = [
          {
            bound: empty,
            names: ["data-target", "data-colour", "data-counter"],
            played: openMat,
            properties: { ...good, colour: "#f6c344", counter: "round", target: "7" },
          },
          ...["0", "07", "ten", "21", "1e1", " 5", "100000000000000000000000"].map((supply) => ({
            bound: empty,
            names: [`data-supply is "${supply}"`],
            played: openMat,
            properties: { ...good, supply },
          })),
          {
            bound: empty,
            names: ['data-supply is ""'],
            played: openMat,
            properties: withoutKey("supply"),
          },
          {
            bound: empty,
            names: ['data-supply is "21"'],
            played: tenFrame,
            properties: { ...tenFrame.hosted.properties, supply: "21" },
          },
          ...(
            [
              [{ base: { float: 4, integer: 3 } }, "no integer"],
              [{ base: { float: 3 } }, "no integer"],
              [{ base: { integer: 3 }, list: { integer: [1] } }, "no single value"],
              [{ list: { integer: [3] } }, "no single value"],
              [{ record: null }, "no single value"],
              [null, "no single value"],
            ] as const
          ).map(([bound, name]) => ({ bound, names: [name], played: openMat, properties: good })),
          {
            bound: empty,
            names: ["data-ssml"],
            played: openMat,
            properties: { ...good, ssml: "<speak>x</speak>" },
          },
          ...["rows", "ten-frame", "double ten frame", "Open"].map((mat) => ({
            bound: empty,
            names: [`data-mat is "${mat}"`],
            played: openMat,
            properties: { ...good, mat },
          })),
          {
            bound: empty,
            names: ['data-mat is ""'],
            played: openMat,
            properties: withoutKey("mat"),
          },
        ];

        yield* Effect.forEach(
          cases,
          ({ bound, names, played, properties }) =>
            Effect.scoped(
              Effect.gen(function* refused() {
                const started = yield* Effect.orDie(
                  trays.start({ ...played.hosted, properties }, bound),
                );

                assert.strictEqual(
                  started.kind,
                  "failed",
                  `${JSON.stringify(properties)} is refused`,
                );
                for (const name of names) {
                  assert.include(
                    started.kind === "failed" ? started.thrown.join(" ") : "",
                    name,
                    `${JSON.stringify(properties)}, bound to ${JSON.stringify(bound)}: the error names ${name}`,
                  );
                }
              }),
            ),
          { concurrency: trayCount, discard: true },
        );

        yield* Effect.scoped(
          Effect.gen(function* qtiOwn() {
            const properties = {
              ...good,
              catalogIdref: "audio-1",
              qtiSuppressTts: "computer-read-aloud",
            };
            const started = yield* Effect.orDie(
              trays.start({ ...openMat.hosted, properties }, empty),
            );

            assert.strictEqual(
              started.kind,
              "running",
              "QTI's own data-catalog-idref and data-qti-suppress-tts are passed over",
            );
          }),
        );
      }),
    ruleHang,
  );

  it.effect(
    "CT7: a tray the child never touched relays nothing",
    () =>
      Effect.gen(function* untouchedRule() {
        const trays = yield* TraysService;
        const played = yield* Effect.all(
          trays.items.map((item) => playedOf(trays, item, trays.module)),
        );

        yield* Effect.forEach(
          played,
          (each) =>
            Effect.scoped(
              Effect.gen(function* untouched() {
                const tray = yield* running(trays, each, empty);
                const look = yield* Effect.orDie(tray.look);

                assert.isTrue(
                  Option.isNone(yield* Effect.orDie(tray.posted)),
                  `${each.item.id}: nothing relayed`,
                );
                assert.strictEqual(look.fired, 0, `${each.item.id}: no change fired`);
                assert.strictEqual(look.mat, 0, `${each.item.id}: the mat is empty`);
                assert.strictEqual(look.tray, each.supply, `${each.item.id}: the tray is full`);
              }),
            ),
          { concurrency: trayCount, discard: true },
        );
      }),
    ruleHang,
  );

  it.effect(
    "CT8: a drag let go outside both zones puts its counter back, and one let go on a counter of the other zone moves it",
    () =>
      Effect.gen(function* dropRule() {
        const trays = yield* TraysService;
        const played = yield* Effect.all(
          ["open-mat", "ten-frame", "open-mat-rows"].map((id) => playing(trays, id, trays.module)),
        );
        const outside: readonly Spot[] = [
          { kind: "beside the mat, left" },
          { kind: "beside the mat, right" },
          { kind: "below the tray" },
          { kind: "between the zones" },
        ];
        const cases: readonly {
          readonly by: "mouse" | "touch";
          readonly each: Played;
          readonly expected: number;
          readonly from: Zone;
          readonly to: Spot;
        }[] = played.flatMap((each) =>
          (["mouse", "touch"] as const).flatMap((by) => [
            ...(["tray", "mat"] as const).flatMap((from) =>
              outside.map((to) => ({ by, each, expected: 2, from, to })),
            ),
            {
              by,
              each,
              expected: 3,
              from: "tray" as const,
              to: { at: 0, kind: "counter" as const, zone: "mat" as const },
            },
            {
              by,
              each,
              expected: 1,
              from: "mat" as const,
              to: { at: 0, kind: "counter" as const, zone: "tray" as const },
            },
          ]),
        );

        yield* Effect.forEach(
          cases,
          ({ by, each, expected, from, to }) =>
            Effect.scoped(
              Effect.gen(function* dropped() {
                const where = `${each.item.id}: a counter of the ${from} dropped on ${JSON.stringify(to)} by ${by}`;
                const tray = yield* running(trays, each, integer(2));

                yield* Effect.orDie(tray.drag({ at: 0, kind: "counter", zone: from }, to, by));

                const look = yield* Effect.orDie(tray.look);

                assert.strictEqual(look.mat, expected, `${where}: the counters on the mat`);
                assert.strictEqual(look.tray, each.supply - expected, `${where}: the tray`);
                assert.strictEqual(
                  look.fired,
                  expected === 2 ? 0 : 1,
                  `${where}: the changes fired`,
                );
                assert.isFalse(look.carried, `${where}: nothing follows the pointer`);
              }),
            ),
          { concurrency: trayCount, discard: true },
        );
      }),
    ruleHang,
  );

  it.effect(
    "CT9: a press on a counter or on the mat's background that travels less than half a counter is a tap, even past the counter's edge, and one that travels further is a drag, or nothing",
    () =>
      Effect.gen(function* driftRule() {
        const trays = yield* TraysService;
        const played = yield* playing(trays, "open-mat", trays.module);
        const cases = (["mouse", "touch"] as const).flatMap((by) =>
          [
            { chooses: true, lift: 21, press: 17 },
            { chooses: true, lift: 18, press: 12 },
            { chooses: true, lift: 19, press: 0 },
            { chooses: false, lift: 25, press: 0 },
          ].map((drift) => ({ ...drift, by })),
        );
        const onMat = (["mouse", "touch"] as const).flatMap((by) =>
          [
            { lift: 18, takes: true },
            { lift: 19, takes: true },
            { lift: 25, takes: false },
          ].map((drift) => ({ ...drift, by })),
        );

        yield* Effect.forEach(
          cases,
          ({ by, chooses, lift, press }) =>
            Effect.scoped(
              Effect.gen(function* drifted() {
                const where = `pressed ${String(press)} px and lifted ${String(lift)} px right of a tray counter's centre by ${by}, then the mat tapped`;
                const tray = yield* running(trays, played, empty);

                yield* Effect.orDie(
                  tray.drift({ at: 0, kind: "counter", zone: "tray" }, press, lift, by),
                );
                yield* Effect.orDie(tray.tap({ kind: "zone", zone: "mat" }, by));

                const look = yield* Effect.orDie(tray.look);

                assert.strictEqual(look.mat, chooses ? 1 : 0, `${where}: the counters on the mat`);
                assert.strictEqual(look.fired, chooses ? 1 : 0, `${where}: the changes fired`);
              }),
            ),
          { concurrency: trayCount, discard: true },
        );

        yield* Effect.forEach(
          onMat,
          ({ by, lift, takes }) =>
            Effect.scoped(
              Effect.gen(function* driftedOnMat() {
                const where = `a tray counter tapped, then the mat's background pressed and lifted ${String(lift)} px right by ${by}`;
                const tray = yield* running(trays, played, empty);

                yield* Effect.orDie(tray.tap({ at: 0, kind: "counter", zone: "tray" }, by));
                yield* Effect.orDie(tray.drift({ kind: "zone", zone: "mat" }, 0, lift, by));

                const look = yield* Effect.orDie(tray.look);

                assert.strictEqual(look.mat, takes ? 1 : 0, `${where}: the counters on the mat`);
                assert.strictEqual(look.fired, takes ? 1 : 0, `${where}: the changes fired`);

                if (!takes) {
                  yield* Effect.orDie(tray.tap({ kind: "zone", zone: "mat" }, by));
                  assert.strictEqual(
                    (yield* Effect.orDie(tray.look)).mat,
                    1,
                    `${where}: the slide kept the choice, so the next tap on the mat takes it`,
                  );
                }
              }),
            ),
          { concurrency: trayCount, discard: true },
        );
      }),
    ruleHang,
  );

  it.effect(
    "CT10: once the host completes the PCI, a drag under way moves nothing, and no input moves a counter",
    () =>
      Effect.gen(function* completionRule() {
        const trays = yield* TraysService;
        const played = yield* playing(trays, "open-mat", trays.module);

        yield* Effect.forEach(
          ["mouse", "touch"] as const,
          (by) =>
            Effect.scoped(
              Effect.gen(function* completed() {
                const tray = yield* running(trays, played, integer(2));

                yield* completedStill(tray, by);
              }),
            ),
          { concurrency: trayCount, discard: true },
        );
      }),
    ruleHang,
  );

  it.effect(
    "CT11: every counter is the markup's one picture, at its size, and any other markup is refused, naming it",
    () =>
      Effect.gen(function* faceRule() {
        const trays = yield* TraysService;
        const openMat = yield* playing(trays, "open-mat", trays.module);
        const face = /<img [^>]*>/u.exec(openMat.hosted.markup)?.[0] ?? "";
        const src = /src="(?<src>[^"]*)"/u.exec(face)?.groups?.["src"] ?? "";
        const sized = (side: string): string =>
          face.replace(/width="\d+" height="\d+"/u, `width="${side}" height="${side}"`);

        assert.isNotEmpty(src, "the fixture's markup is the counter's picture");

        yield* Effect.forEach(
          [
            { markup: openMat.hosted.markup, side: 40 },
            { markup: sized("64"), side: 64 },
            { markup: sized("32"), side: 32 },
          ],
          ({ markup, side }) =>
            Effect.scoped(
              Effect.gen(function* faced() {
                const tray = yield* running(
                  trays,
                  { ...openMat, hosted: { ...openMat.hosted, markup } },
                  integer(2),
                );
                const look = yield* Effect.orDie(tray.look);

                assert.deepStrictEqual(
                  look.faces,
                  [src],
                  `${String(side)}: every counter shows the picture`,
                );
                assert.approximately(
                  look.counterSide,
                  side,
                  0.5,
                  `${String(side)}: a counter is drawn at the picture's size`,
                );
              }),
            ),
          { concurrency: trayCount, discard: true },
        );

        yield* Effect.forEach(
          [
            { markup: "", names: ["not exactly one img"] },
            { markup: `${face}${face}`, names: ["not exactly one img"] },
            { markup: "<p>A counter.</p>", names: ["not exactly one img"] },
            { markup: `${face} A counter.`, names: ["not exactly one img"] },
            { markup: face.replace(/ alt="[^"]*"/u, ""), names: ["no alt"] },
            { markup: face.replace(/ src="[^"]*"/u, ' src=""'), names: ["an empty src"] },
            {
              markup: face.replace(/ data-qti-suppress-tts="[^"]*"/u, ""),
              names: ["no data-qti-suppress-tts"],
            },
            {
              markup: face.replace(
                'data-qti-suppress-tts="computer-read-aloud"',
                'data-qti-suppress-tts="all"',
              ),
              names: ['data-qti-suppress-tts is "all"'],
            },
            {
              markup: face.replace(/width="\d+" height="\d+"/u, 'width="40" height="48"'),
              names: ["40 by 48"],
            },
            { markup: sized("31"), names: ["31 by 31"] },
            { markup: sized("65"), names: ["65 by 65"] },
            { markup: sized("4e1"), names: ["4e1 by 4e1"] },
          ],
          ({ markup, names }) =>
            Effect.scoped(
              Effect.gen(function* refused() {
                const started = yield* Effect.orDie(
                  trays.start({ ...openMat.hosted, markup }, empty),
                );

                assert.strictEqual(
                  started.kind,
                  "failed",
                  `${markup}: the frame says it cannot run`,
                );
                for (const name of names) {
                  assert.include(
                    started.kind === "failed" ? started.thrown.join(" | ") : "",
                    name,
                    `${markup}: the error names ${name}`,
                  );
                }
              }),
            ),
          { concurrency: trayCount, discard: true },
        );
      }),
    ruleHang,
  );

  it.effect(
    "CT12: a finger resting beside the board takes no part, so another finger's taps move counters",
    () =>
      Effect.gen(function* restRule() {
        const trays = yield* TraysService;

        yield* restingFinger(trays, yield* playing(trays, "open-mat", trays.module), {
          kind: "beside the mat, right",
        });
        yield* restingFinger(trays, yield* playing(trays, "ten-frame", trays.module), {
          kind: "below the tray",
        });
      }),
    ruleHang,
  );

  it.effect(
    "CT13: a drag whose capture a context menu takes ends with no gesture and leaves no press standing",
    () =>
      Effect.gen(function* unseenRule() {
        const trays = yield* TraysService;

        yield* unseenEnd(trays, yield* playing(trays, "open-mat", trays.module));
        yield* unseenEnd(trays, yield* playing(trays, "ten-frame", trays.module));
        yield* lostEnd(trays, yield* playing(trays, "open-mat", trays.module), 4);
        yield* lostEnd(trays, yield* playing(trays, "ten-frame", trays.module), 1);
      }),
    ruleHang,
  );

  it.effect(
    "CT9, the release and the screen: a release far from its press with no move between is a drag, and a tap's drift is measured on the screen at any scale",
    () =>
      Effect.gen(function* releaseRule() {
        const trays = yield* TraysService;
        const openMat = yield* playing(trays, "open-mat", trays.module);
        const tenFrame = yield* playing(trays, "ten-frame", trays.module);

        yield* jumped(trays, openMat);
        yield* jumped(trays, tenFrame);
        yield* narrowDrift(trays, openMat, 200, 18);
        yield* narrowDrift(trays, tenFrame, 400, 15);
      }),
    ruleHang,
  );

  it.effect(
    "CT14: the chosen counter's ring goes with it when it is dragged",
    () =>
      Effect.gen(function* ringRule() {
        const trays = yield* TraysService;

        yield* ringGoes(trays, yield* playing(trays, "open-mat", trays.module));
        yield* ringGoes(trays, yield* playing(trays, "ten-frame", trays.module));
      }),
    ruleHang,
  );

  it.effect(
    "its kills: each slip planted in the module's file is caught",
    () =>
      Effect.gen(function* killsRule() {
        const trays = yield* TraysService;

        yield* battery(trays, trays.module);

        const survivors = yield* Effect.forEach(
          kills,
          (kill) =>
            Effect.map(Effect.exit(battery(trays, planted(trays.module, kill))), (exit) =>
              Exit.isFailure(exit) ? [] : [kill.why],
            ),
          { concurrency: trayCount },
        );

        assert.deepStrictEqual(survivors.flat(), [], "every slip is caught");
      }),
    ruleHang,
  );
});
