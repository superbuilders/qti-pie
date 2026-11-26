/**
 * The one way the alpha suites press into a Portable Custom Interaction's document, let a drag go
 * there, and send it keys: a press is aimed at a point of the document's own and meant for an
 * element of it, and succeeds only once the document reports exactly one trusted `pointerdown`
 * more, heard at that point on that element; a drag's release ({@link releaseInto}) only once the
 * document Chrome gives it to reports exactly one trusted `pointerup` more, at the point meant and
 * over what the drop was meant for; a key only once it reports the trusted `keydown`s, or the
 * `keyup`, the key makes; and a Tab only once it reports exactly one trusted `focusin` more.
 * Otherwise the press fails as `tap not delivered`, the release as `drop not delivered`, the key as
 * `key not delivered`, never as the rule's own failure.
 *
 * A PCI's frame is a sandboxed document of an opaque origin, which Chrome renders in a process of
 * its own. Its frame posts `ready` from its script, which says nothing of the browser: until the
 * browser can hit-test the new frame, a press at its place lands on the host page and is lost,
 * and a rule that then reads the PCI reads a part never pressed. The frame learns its size, and
 * the browser learns where the page draws it, after the page lays it out: a frame its host has just
 * grown to the height it posted can still have its old viewport, or be routed input by its old
 * place, so a press there is lost on a page that is right.
 *
 * - **Listening first.** Every harness installs {@link listening} in each document of its page before
 *   any of that document's own scripts run (`page.addInitScript`), so the harness's listeners are
 *   the first of every event's, ahead of the PCI's and its frame page's; and every wait the harness
 *   runs in a document runs on the clock that document had then, which no script of the PCI's can
 *   replace.
 * - **Aimed from the meant element's own box, read with the hit test.** A harness names what the
 *   press is meant for, the very element by a selector and its place ({@link meantFor}), never the
 *   whole PCI, and where inside that element's box it lands ({@link Anchor}); or, where a rule
 *   rests a finger beside the PCI's parts, the page beside them at a point ({@link besideParts}).
 *   The press reads the element's box itself, in the same step as the document's own hit test
 *   there, keeps that very element, and aims at the frame's content corner, past its border and its
 *   padding, plus the point in the box. A harness never aims from a box it read before, nor from
 *   the frame's outer box, so an element the PCI removed or moved since the harness last looked
 *   cannot lend its place to another.
 * - **A child of the page, drawn at its own size.** The aim holds only for a frame whose parent is
 *   the page and whose content is drawn at its document's own size. A frame inside another frame
 *   fails at once, as not delivered. A frame scaled by a transform or by zoom shows as a press
 *   heard elsewhere than meant, which is a press not delivered, named as scaled where the two sizes
 *   differ.
 * - **Settled to what the frame asked for, before any read, press or release.** A harness's start,
 *   once the frame is ready, and every press and release wait ({@link settledFor}) for what the
 *   frame's layout says is still to come, and no more: the harness's own mark from that frame,
 *   taken on every settle, which follows every height it posted; then, where the frame's own
 *   viewport is not the content box the page lays its element out at, the frame's next `resize`;
 *   then two of the frame's own frames and two of the page's, so the page has drawn the frame where
 *   it lays it out. The harness holds no copy of how plate's frame page measures its height. Each
 *   wait ends on an event, and nothing waits for a layout that stays the same: a frame whose
 *   content keeps changing its height is pressed all the same, and the check after the press says
 *   whether it was delivered. A point outside the content the frame draws fails at once by name.
 *   The page's own hit test first finds the frame drawn at the middle of what of it the page's
 *   viewport shows ({@link shownFor}), so a hidden or clipped frame, whose frames would not come,
 *   fails at once instead.
 * - **Two hit tests, before any wait.** The document's own `elementFromPoint` at the point, in the
 *   step that reads the box, must find the element the press is meant for or one inside it; then
 *   the page's own, at the aim, inside the page's viewport, must find the frame's element. An
 *   element gone, a point where the meant element is not, a frame hidden, clipped by an ancestor,
 *   covered, or out of view there, and an aim outside the viewport fail at once, as not delivered.
 *   Both tests are synchronous and always answer. A key is held to the page's test at the frame's
 *   centre, and to no size.
 * - **Painted, then sent.** Each input waits for two of the document's own frames, which come only
 *   once it paints, is sent, waits for two more, which come after every input event sent before
 *   them, and reads the counts again.
 * - **Exactly as many, the browser's, where and on what it was meant.** Only a trusted event counts,
 *   one the browser made from input, never one a script dispatched; one press is one `pointerdown`,
 *   so a press heard twice fails too; and the document must have heard it within a pixel of the
 *   point meant, on the very element it was meant for, still in the document, so a press whose
 *   element moved away or was removed before it came fails as well. Whether it landed on that
 *   element is decided by the press's composed path, which is fixed when its dispatch begins, in
 *   the harness's listener, the first of the press's listeners, so a PCI that replaces or moves the
 *   pressed node in its own handler cannot fail a press it was given.
 *
 * Every wait ends on a hit test or an event of the page's or the frame's own: a frame, a `resize`,
 * a `message`, a change of an element's size; none on a delay.
 *
 * Test support for the alpha suites under `src/alpha/`.
 *
 * @module
 * @see https://html.spec.whatwg.org/multipage/imagebitmap-and-animations.html#animation-frames
 * @see https://drafts.csswg.org/cssom-view/#dom-document-elementfrompoint
 * @see https://w3c.github.io/pointerevents/#the-pointerdown-event
 * @see https://dom.spec.whatwg.org/#dom-event-istrusted
 * @see https://dom.spec.whatwg.org/#dom-event-composedpath
 */
import { randomUUID } from "node:crypto";
import { Data, Effect } from "effect";
import type { Frame } from "playwright-core";

/**
 * A press the harness sent into a PCI's document that the document did not hear exactly once, at
 * the point meant, on the element meant: the browser gave it to the host page or to nothing, a hit
 * test found something else there, the frame is nested or scaled, it was heard twice, or it was
 * heard somewhere else or on something else.
 */
export class TapNotDelivered extends Data.TaggedError("TapNotDelivered")<{
  readonly step: string;
  readonly why: string;
}> {
  /**
   * The press, and how it was lost.
   */
  override get message(): string {
    return `tap not delivered: ${this.step}: ${this.why}, so the rule's reading after it would be of a press never made`;
  }
}

/**
 * A drag's release the harness sent that was not heard where it was meant: not exactly one trusted
 * `pointerup` more in the document Chrome gives it to, at the point meant, over the element meant,
 * or, for a release meant outside the PCI's frame, heard inside it.
 */
export class DropNotDelivered extends Data.TaggedError("DropNotDelivered")<{
  readonly step: string;
  readonly why: string;
}> {
  /**
   * The release, and how it was lost.
   */
  override get message(): string {
    return `drop not delivered: ${this.step}: ${this.why}, so the rule's reading after it would be of a drop never made`;
  }
}

/**
 * A key the harness sent into a PCI's document that the document did not hear as the key makes
 * it, or a focus it did not take.
 */
export class KeyNotDelivered extends Data.TaggedError("KeyNotDelivered")<{
  readonly step: string;
  readonly why: string;
}> {
  /**
   * The key, and how it was lost.
   */
  override get message(): string {
    return `key not delivered: ${this.step}: ${this.why}, so the rule's reading after it would be of a key never pressed`;
  }
}

/**
 * A point, in a viewport's pixels: the page's, or a PCI document's own.
 */
export interface Point {
  readonly x: number;
  readonly y: number;
}

/**
 * The element a press is meant for: the one a selector finds at a place, from 0, the press landing
 * on it or on one inside it.
 */
export interface ElementMeant {
  readonly kind: "element";
  readonly nth: number;
  readonly selector: string;
}

/**
 * The page beside the PCI's parts, as what a press is meant for: the page's own root or body or the
 * PCI's own background, never one of the parts a selector names, nor an element laid over the PCI.
 */
export interface BesideMeant {
  readonly kind: "beside";
  readonly parts: string;
}

/**
 * What a press is meant for.
 */
export type Meant = BesideMeant | ElementMeant;

/**
 * Where inside its element's box a press lands: a fraction of the box's width and height from its
 * corner, then a number of pixels on.
 */
export interface Anchor {
  readonly fraction: Point;
  readonly pixels: Point;
}

/**
 * A press's target: an element and where inside its box, or the page beside the PCI's parts at a
 * point of the document's own.
 */
export type Target =
  | { readonly anchor: Anchor; readonly meant: ElementMeant }
  | { readonly at: Point; readonly meant: BesideMeant };

/**
 * Outside the PCI's frame, as what a drag's release is meant for: a point of the page below what
 * the frame draws, which no part of the frame covers.
 */
export interface OutsideMeant {
  readonly kind: "outside";
}

/**
 * Outside the PCI's frame, as what a drag's release is meant for.
 */
export const outsideFrame: OutsideMeant = { kind: "outside" };

/**
 * Where a drag's release is meant to land: on an element, at a point inside its box, or beside the
 * PCI's parts at a point of the document's own, as a press is aimed ({@link Target}); or outside
 * the PCI's frame, a number of pixels below what it draws, at a point across of the document's own.
 */
export type Drop =
  | { readonly across: number; readonly below: number; readonly meant: OutsideMeant }
  | Target;

/**
 * The pointer a drag's release lifts: a mouse, whose release Chrome gives the document under it,
 * or a finger, whose release Chrome gives the document it went down in, wherever it lifts.
 */
export type Lifted = "mouse" | "touch";

/**
 * Name the element a press is meant for: the one a selector finds at a place, from 0.
 *
 * @param selector The selector.
 * @param nth The place.
 * @returns What the press is meant for.
 */
export const meantFor = (selector: string, nth: number): ElementMeant => ({
  kind: "element",
  nth,
  selector,
});

/**
 * Name the page beside a PCI's parts as what a press is meant for, as a finger a child rests there
 * lands: on the page's own root or body, or on the PCI's own background, never on a part.
 *
 * @param parts The selector of the parts it must miss.
 * @returns What the press is meant for.
 */
export const besideParts = (parts: string): BesideMeant => ({ kind: "beside", parts });

/**
 * Name a point inside an element's box: a fraction of its width and height from its corner, then
 * pixels on.
 *
 * @param fractionX The fraction of the width.
 * @param fractionY The fraction of the height.
 * @param pixelsX The pixels on, across.
 * @param pixelsY The pixels on, down.
 * @returns The point inside the box.
 */
export const anchoredAt = (
  fractionX: number,
  fractionY: number,
  pixelsX: number,
  pixelsY: number,
): Anchor => ({ fraction: { x: fractionX, y: fractionY }, pixels: { x: pixelsX, y: pixelsY } });

/**
 * The centre of an element's box.
 */
export const centred: Anchor = anchoredAt(0.5, 0.5, 0, 0);

/**
 * Name what a press or a drop is meant for, for a step or a failure.
 *
 * @param meant What the press or the drop is meant for.
 * @returns Its name.
 */
export const nameOf = (meant: Meant | OutsideMeant): string => {
  if (meant.kind === "outside") {
    return "the page outside the PCI's frame";
  }

  return meant.kind === "element"
    ? `${meant.selector} #${String(meant.nth)}`
    : `the page beside the PCI's parts (${meant.parts})`;
};

/**
 * Where a press landed: the point of the page it was aimed at, and the point of the PCI's document
 * that is, for the moves of a drag after it or a press after it at the same point.
 */
export interface Pressed {
  readonly aim: Point;
  readonly at: Point;
}

/**
 * A size, in pixels.
 */
interface Size {
  readonly height: number;
  readonly width: number;
}

/**
 * Where a PCI's document stands in the page, by the page's own layout: the page point its own
 * coordinates start at, the corner of its frame's content, and the size that content is drawn at.
 */
interface Placed {
  readonly corner: Point;
  readonly drawn: Size;
}

/**
 * The trusted events the harness counts in a PCI's document.
 */
type Counted = "focusin" | "keydown" | "keyup" | "pointerdown" | "pointerup";

/**
 * Where, in a document's own coordinates, it heard a pointer event, and whether over what the
 * input was meant for.
 */
interface HeardAt {
  readonly onMeant: boolean;
  readonly x: number;
  readonly y: number;
}

/**
 * What a PCI's document has heard since the harness first asked: how many of each trusted event;
 * where it heard the last press, and whether on the element a press was meant for; where it heard
 * the last release, and whether over the element a drop was meant for; and its own viewport's
 * size.
 */
interface Heard {
  readonly counts: Readonly<Record<Counted, number>>;
  readonly onMeant: boolean;
  readonly release: HeardAt;
  readonly size: Size;
  readonly x: number;
  readonly y: number;
}

/**
 * The pictures of a read that are not drawn, each by its address: those whose request had not
 * ended, and of the rest, those that did not decode.
 */
interface Pictured {
  readonly undecoded: readonly string[];
  readonly unloaded: readonly string[];
}

/**
 * The document's own clock and viewport, as its window had them before any of its own scripts ran
 * (`listening`): its animation frames, a 0 ms timer, its next `resize`, each picture's decode, and
 * its viewport's size.
 */
interface Kept {
  readonly decoded: (pictures: readonly HTMLImageElement[]) => Promise<Pictured>;
  readonly frames: () => Promise<void>;
  readonly later: () => Promise<void>;
  /**
   * Whether a picture has loaded: its request ended with an image of some width, read by the
   * getters of `complete` and `naturalWidth` the document had before any of its own scripts ran.
   */
  readonly loaded: (picture: HTMLImageElement) => boolean;
  readonly resized: (given: Size) => Promise<void>;
  readonly viewport: () => Size;
}

declare global {
  interface Window {
    /**
     * What the document has heard since it was created, and whether its last press landed on what
     * that press was meant for, as the press's dispatch began.
     */
    harnessHeard?: {
      counts: Record<Counted, number>;
      onMeant: boolean;
      release: { onMeant: boolean; x: number; y: number };
      x: number;
      y: number;
    };
    /**
     * The document's own clock and viewport, kept before any of its own scripts ran, a property no
     * script can write or redefine, its members frozen.
     */
    readonly harnessKept?: Kept;
    /**
     * Post the harness's mark, carrying a nonce, to the document's parent, the one it had before
     * any of its own scripts ran, after two of its frames and a 0 ms timer of its kept clock.
     */
    readonly harnessMark?: (nonce: string) => Promise<void>;
    /**
     * The nonces of the harness's marks each of the document's child frames posted that its window
     * has heard, keyed by the frame's window.
     */
    harnessMarks?: Map<MessageEventSource, Set<string>>;
    /**
     * What the press or the release under way is meant for: the very element the document's hit
     * test found before it, or the parts a press beside them must miss.
     */
    harnessMeant?: { readonly beside: string | null; readonly element: Element | null };
  }
}

/**
 * The harness's listeners, which every alpha harness installs in each document of its page before
 * any script of that document's own runs (`page.addInitScript(listening)`), so they are the first
 * of every event's listeners, ahead of the PCI's and of its frame page's.
 *
 * - At the window, in capture: every trusted `pointerdown`, `pointerup`, `focusin`, `keydown` and
 *   `keyup` counted, where the last press and the last release landed, and whether each was on what
 *   it was meant for. A press is judged by its composed path, which is fixed when its dispatch
 *   begins, so nothing a listener does to the node after can change it. A release is judged by the
 *   document's own hit test at its point as its dispatch begins, never by its target: a pointer the
 *   PCI captured, or a touch, which Chrome captures to the element it began on, is released on that
 *   element wherever it lands.
 * - At the window, in capture: the nonce of every harness's mark a child frame posts, by that frame.
 * - The document's parent, kept before any script of the document's own can replace `parent`, a
 *   replaceable global; and the document's own clock and viewport (`harnessKept`): its
 *   `requestAnimationFrame`, `setTimeout`, `Promise.withResolvers`, `Promise.allSettled`,
 *   `addEventListener` and `removeEventListener`, the getters of `innerWidth` and `innerHeight`,
 *   and a picture's `decode` and the getters of its `complete`, `currentSrc`, `src`, `loading` and
 *   `naturalWidth`, each kept as it was before any script ran. Every wait the harness runs in a
 *   document, and every read of whether a picture loaded, runs on those alone, so a PCI that
 *   replaces one cannot move, stop or end a wait, or change a reading.
 * - A picture's decode is waited for only where its `load` or `error` must come: a picture whose
 *   request has ended (`complete`), or an eager one whose address is a `data:` or `blob:` URL,
 *   which the document reads itself. Any other picture is named as one that did not load, before
 *   any wait, so a picture served by an address that never answers fails by name and never hangs.
 * - The harness's mark (`harnessMark`): two of the kept frames, a kept 0 ms timer, then the mark
 *   posted through the kept parent. It and `harnessKept` are properties no script can write or
 *   redefine, and `harnessKept`'s members are frozen.
 *
 * @see https://html.spec.whatwg.org/multipage/nav-history-apis.html#dom-parent
 * @see https://webidl.spec.whatwg.org/#Replaceable
 * @see https://w3c.github.io/pointerevents/#implicit-pointer-capture
 */
export const listening = (): void => {
  if (window.harnessHeard !== undefined) {
    return;
  }

  const host = window.parent;
  const frame = window.requestAnimationFrame.bind(window);
  const timer = window.setTimeout.bind(window);
  const resolvers = Promise.withResolvers.bind(Promise);
  const settled = Promise.allSettled.bind(Promise);
  const listen = window.addEventListener.bind(window);
  const unlisten = window.removeEventListener.bind(window);
  const picture = HTMLImageElement.prototype;
  const held: Pick<HTMLImageElement, "decode"> = Object.defineProperties(
    { decode: () => Promise.reject(new Error("the document had no picture decode to keep")) },
    { decode: Object.getOwnPropertyDescriptor(picture, "decode") ?? {} },
  );
  const complete = Object.getOwnPropertyDescriptor(picture, "complete");
  const currentSource = Object.getOwnPropertyDescriptor(picture, "currentSrc");
  const source = Object.getOwnPropertyDescriptor(picture, "src");
  const loading = Object.getOwnPropertyDescriptor(picture, "loading");
  const naturalWidth = Object.getOwnPropertyDescriptor(picture, "naturalWidth");
  const nameOfPicture = (image: HTMLImageElement): string =>
    String(currentSource?.get?.call(image) ?? "") || String(source?.get?.call(image) ?? "");
  const ends = (image: HTMLImageElement): boolean =>
    Boolean(complete?.get?.call(image)) ||
    (String(loading?.get?.call(image) ?? "") !== "lazy" &&
      ["data:", "blob:"].some((scheme) => nameOfPicture(image).startsWith(scheme)));
  const decoding = (image: HTMLImageElement): Promise<void> => held.decode.call(image);
  const widthOf =
    Object.getOwnPropertyDescriptor(window, "innerWidth")?.get?.bind(window) ?? (() => innerWidth);
  const heightOf =
    Object.getOwnPropertyDescriptor(window, "innerHeight")?.get?.bind(window) ??
    (() => innerHeight);
  const nextFrame = async (): Promise<void> => {
    const { promise, resolve } = resolvers<number>();

    frame(resolve);
    await promise;
  };
  const viewport = (): Size => ({ height: Number(heightOf()), width: Number(widthOf()) });
  const kept: Kept = Object.freeze({
    decoded: async (pictures: readonly HTMLImageElement[]) => {
      const unloaded = pictures.filter((image) => !ends(image)).map(nameOfPicture);

      if (unloaded.length > 0) {
        return { undecoded: [], unloaded };
      }

      const decodes = await settled(pictures.map(decoding));

      return {
        undecoded: pictures.flatMap((image, at) =>
          decodes[at]?.status === "rejected" ? [nameOfPicture(image)] : [],
        ),
        unloaded: [],
      };
    },
    frames: async () => {
      await nextFrame();
      await nextFrame();
    },
    later: async () => {
      const { promise, resolve } = resolvers<null>();

      timer(() => {
        resolve(null);
      }, 0);
      await promise;
    },
    loaded: (image: HTMLImageElement) =>
      Boolean(complete?.get?.call(image)) && Number(naturalWidth?.get?.call(image) ?? 0) > 0,
    resized: async (given: Size) => {
      const now = viewport();

      if (now.width !== given.width || now.height !== given.height) {
        return;
      }

      const { promise, resolve } = resolvers<null>();
      const ended = (): void => {
        resolve(null);
      };

      listen("resize", ended);
      await promise;
      unlisten("resize", ended);
    },
    viewport,
  });
  const heard: NonNullable<Window["harnessHeard"]> = {
    counts: { focusin: 0, keydown: 0, keyup: 0, pointerdown: 0, pointerup: 0 },
    onMeant: false,
    release: { onMeant: false, x: Number.NaN, y: Number.NaN },
    x: Number.NaN,
    y: Number.NaN,
  };
  const marks: NonNullable<Window["harnessMarks"]> = new Map();

  window.harnessHeard = heard;
  window.harnessMarks = marks;
  Object.defineProperty(window, "harnessKept", {
    configurable: false,
    enumerable: false,
    value: kept,
    writable: false,
  });
  Object.defineProperty(window, "harnessMark", {
    configurable: false,
    enumerable: false,
    value: async (nonce: string): Promise<void> => {
      await kept.frames();
      await kept.later();
      host.postMessage({ kind: "harness-mark", nonce }, "*");
    },
    writable: false,
  });

  for (const kind of ["focusin", "keydown", "keyup"] as const) {
    window.addEventListener(
      kind,
      (event) => {
        heard.counts[kind] += event.isTrusted ? 1 : 0;
      },
      { capture: true },
    );
  }

  window.addEventListener(
    "pointerdown",
    (event) => {
      if (!event.isTrusted) {
        return;
      }

      const path = event.composedPath();
      const element = window.harnessMeant?.element ?? null;
      const parts = window.harnessMeant?.beside ?? null;
      const dom = document.querySelector("[data-pci-dom]");
      const beside =
        parts !== null &&
        (event.target === document.documentElement ||
          event.target === document.body ||
          (dom !== null && path.includes(dom))) &&
        !path.some((node) => node instanceof Element && node.matches(parts));

      heard.counts.pointerdown += 1;
      heard.onMeant = element === null ? beside : path.includes(element);
      heard.x = event.clientX;
      heard.y = event.clientY;
    },
    { capture: true },
  );
  window.addEventListener(
    "pointerup",
    (event) => {
      if (!event.isTrusted) {
        return;
      }

      const element = window.harnessMeant?.element ?? null;
      const parts = window.harnessMeant?.beside ?? null;
      const under = document.elementsFromPoint(event.clientX, event.clientY);

      heard.counts.pointerup += 1;
      heard.release = {
        onMeant:
          element === null
            ? parts !== null && !under.some((node) => node.matches(parts))
            : under.some((node) => element.contains(node)),
        x: event.clientX,
        y: event.clientY,
      };
    },
    { capture: true },
  );
  window.addEventListener(
    "message",
    (event) => {
      const data: unknown = event.data;

      if (
        event.source === null ||
        !(data instanceof Object) ||
        !("kind" in data) ||
        data.kind !== "harness-mark" ||
        !("nonce" in data)
      ) {
        return;
      }

      const nonces = marks.get(event.source) ?? new Set<string>();

      nonces.add(String(data.nonce));
      marks.set(event.source, nonces);
    },
    { capture: true },
  );
};

/**
 * Wait, in a document, for two of its frames on the clock it kept before its own scripts ran,
 * then give what it has heard since it was created: none where the harness's listeners were never
 * installed in it.
 *
 * @returns What the document has heard.
 */
const heardSoFar = async (): Promise<Heard | null> => {
  const kept = window.harnessKept;

  if (kept === undefined || window.harnessHeard === undefined) {
    return null;
  }

  await kept.frames();

  const { counts, onMeant, release, x, y } = window.harnessHeard;

  return { counts: { ...counts }, onMeant, release: { ...release }, size: kept.viewport(), x, y };
};

/**
 * Wait, in a document, for two of its frames, on the clock it kept before its own scripts ran.
 *
 * @returns Once both have come; false, waiting for nothing, where the harness's listeners are not
 *   in the document.
 */
export const framesIn = async (): Promise<boolean> => {
  const kept = window.harnessKept;

  if (kept === undefined) {
    return false;
  }

  await kept.frames();

  return true;
};

/**
 * What a PCI document's own hit test found where a press is meant to land: the point, in the
 * document, and what was found there instead of what the press is meant for, empty where it found
 * that; `absent` where the document holds no such element, and `boxless` where it draws no box.
 */
interface Found {
  readonly at: Point;
  readonly found: string;
}

/**
 * Find, in a PCI's document, where a press is meant to land, and what its own `elementFromPoint`
 * finds there instead of what the press is meant for: the meant element's own box, read now, and
 * the point inside it, kept with that very element for the press that follows; or, beside the
 * PCI's parts, the point given, where the page's root or body or the PCI's own background must be,
 * never a part.
 *
 * @param target What the press is meant for, and where.
 * @returns The point, and what was found there.
 */
const meantAt = (target: Target): Found => {
  if ("at" in target) {
    const { at } = target;
    const hit = document.elementFromPoint(at.x, at.y);

    window.harnessMeant = { beside: target.meant.parts, element: null };

    if (hit === null) {
      return { at, found: "nothing" };
    }

    return {
      at,
      found:
        hit === document.documentElement ||
        hit === document.body ||
        (document.querySelector("[data-pci-dom]")?.contains(hit) === true &&
          hit.closest(target.meant.parts) === null)
          ? ""
          : `its ${hit.localName}`,
    };
  }

  const element = document.querySelectorAll(target.meant.selector)[target.meant.nth];

  window.harnessMeant = { beside: null, element: element ?? null };

  if (element === undefined) {
    return { at: { x: Number.NaN, y: Number.NaN }, found: "absent" };
  }

  const box = element.getBoundingClientRect();
  const at = {
    x: box.left + target.anchor.fraction.x * box.width + target.anchor.pixels.x,
    y: box.top + target.anchor.fraction.y * box.height + target.anchor.pixels.y,
  };
  const hit = document.elementFromPoint(at.x, at.y);

  if (box.width === 0 || box.height === 0) {
    return { at, found: "boxless" };
  }

  if (hit === null) {
    return { at, found: "nothing" };
  }

  return { at, found: element.contains(hit) ? "" : `its ${hit.localName}` };
};

/**
 * Say how a press missed what it is meant for before it was sent, by what the PCI document's own
 * hit test found.
 *
 * @param found What the hit test found.
 * @param meant What the press is meant for.
 * @returns How it missed, empty where it found what was meant.
 */
const missedAt = (found: Found, meant: Meant): string => {
  if (found.found === "") {
    return "";
  }

  if (found.found === "absent") {
    return `the PCI's document holds no ${nameOf(meant)}, which the press is meant for`;
  }

  if (found.found === "boxless") {
    return `${nameOf(meant)}, which the press is meant for, draws no box in the PCI's document`;
  }

  return `the PCI document's own hit test at ${String(found.at.x)},${String(found.at.y)} finds ${found.found}, not ${nameOf(meant)}, which the press is meant for`;
};

/**
 * Give, in the page, where a frame's element draws its content: the corner past its border and its
 * padding, which a computed style gives in pixels, and the size its content box is drawn at.
 *
 * @param element The frame's element.
 * @returns Where it draws its content.
 */
const contentOf = (element: Element): Placed => {
  const rect = element.getBoundingClientRect();
  const style = getComputedStyle(element);
  const [
    borderLeft = 0,
    borderTop = 0,
    borderRight = 0,
    borderBottom = 0,
    paddingLeft = 0,
    paddingTop = 0,
    paddingRight = 0,
    paddingBottom = 0,
  ] = [
    style.borderLeftWidth,
    style.borderTopWidth,
    style.borderRightWidth,
    style.borderBottomWidth,
    style.paddingLeft,
    style.paddingTop,
    style.paddingRight,
    style.paddingBottom,
  ].map((value) => Number(value.slice(0, -"px".length)));

  return {
    corner: { x: rect.left + borderLeft + paddingLeft, y: rect.top + borderTop + paddingTop },
    drawn: {
      height: rect.height - borderTop - paddingTop - paddingBottom - borderBottom,
      width: rect.width - borderLeft - paddingLeft - paddingRight - borderRight,
    },
  };
};

/**
 * Give where a PCI's document stands in the page, by the page's own layout: its frame's content
 * corner and drawn size, or the page's own viewport where it is the page.
 *
 * @param frame The document's frame.
 * @returns Where it stands.
 */
const placedIn = async (frame: Frame): Promise<Placed> => {
  if (frame.parentFrame() === null) {
    return await frame.evaluate(() => ({
      corner: { x: 0, y: 0 },
      drawn: window.harnessKept?.viewport() ?? { height: 0, width: 0 },
    }));
  }

  const element = await frame.frameElement();
  const placed = await element.evaluate(contentOf);

  await element.dispose();

  return placed;
};

/**
 * Hit-test the page at a point, by its own `elementFromPoint`, the point inside the page's
 * viewport, which the test itself would round onto its edge: where the PCI stands in a frame, the
 * frame's element must be what it finds. Where the PCI is the page, the document's own test says
 * the rest.
 *
 * @param frame The PCI's document's frame.
 * @param aim The point, in the page.
 * @returns What the test found instead, empty where it found the frame or the PCI is the page.
 */
const pageHitAt = async (frame: Frame, aim: Point): Promise<string> => {
  if (frame.parentFrame() === null) {
    return (await frame.evaluate((point) => {
      const size = window.harnessKept?.viewport() ?? { height: 0, width: 0 };

      return point.x < 0 || point.y < 0 || point.x >= size.width || point.y >= size.height;
    }, aim))
      ? "nothing, the point lying outside the page's viewport"
      : "";
  }

  const element = await frame.frameElement();
  const found = await element.evaluate((owner, point) => {
    if (point.x < 0 || point.y < 0 || point.x >= innerWidth || point.y >= innerHeight) {
      return "nothing, the point lying outside the page's viewport";
    }

    const hit = document.elementFromPoint(point.x, point.y);

    if (hit === owner) {
      return "";
    }

    return hit === null ? "nothing" : `the page's ${hit.localName}`;
  }, aim);

  await element.dispose();

  return found;
};

/**
 * The harness's own run of a promise of Chrome's, which fails as the harness does.
 */
type Attempt<F> = <A>(step: string, run: () => Promise<A>) => Effect.Effect<A, F>;

/**
 * Find where a PCI's document stands in the page, once its frame is a child of the page that draws
 * content, or fail as the input it was found for was lost.
 *
 * @param frame The document's frame.
 * @param attempt The harness's run of a promise.
 * @param step The input, for a failure.
 * @param lost The failure where the document cannot take the input.
 * @returns Where it stands.
 */
const standing = <F, L>(
  frame: Frame,
  attempt: Attempt<F>,
  step: string,
  lost: (why: string) => L,
): Effect.Effect<Placed, F | L> =>
  Effect.gen(function* stood() {
    const parent = frame.parentFrame();

    if (parent !== null && parent.parentFrame() !== null) {
      return yield* Effect.fail(lost("the PCI's frame stands inside another frame, not the page"));
    }

    const placed = yield* attempt(`find where the PCI stands for ${step}`, () => placedIn(frame));

    if (placed.drawn.width <= 0 || placed.drawn.height <= 0) {
      return yield* Effect.fail(lost("the PCI's frame draws no content: it is not displayed"));
    }

    return placed;
  });

/**
 * Hit-test the page where the PCI's document is aimed at, and fail at once where the page's own
 * test finds something else there.
 *
 * @param frame The document's frame.
 * @param attempt The harness's run of a promise.
 * @param step The input, for a failure.
 * @param aim The point, in the page.
 * @param lost The failure where the test finds something else.
 * @returns Nothing, where it finds the frame.
 */
const pageHitTested = <F, L>(
  frame: Frame,
  attempt: Attempt<F>,
  step: string,
  aim: Point,
  lost: (why: string) => L,
): Effect.Effect<void, F | L> =>
  Effect.flatMap(
    attempt(`hit-test the page for ${step}`, () => pageHitAt(frame, aim)),
    (found) =>
      found === ""
        ? Effect.void
        : Effect.fail(
            lost(
              `the page's own hit test at ${String(aim.x)},${String(aim.y)} finds ${found}, not the PCI`,
            ),
          ),
  );

/**
 * Read what a PCI's document has heard, after two of its frames, or fail as the input it was read
 * for was lost where the harness's listeners were never installed in it.
 *
 * @param frame The document's frame.
 * @param attempt The harness's run of a promise.
 * @param step The input and the reading, for a failure.
 * @param lost The failure.
 * @returns What it has heard.
 */
const heardIn = <F, L>(
  frame: Frame,
  attempt: Attempt<F>,
  step: string,
  lost: (why: string) => L,
): Effect.Effect<Heard, F | L> =>
  Effect.flatMap(
    attempt(`read what the PCI heard ${step}`, () => frame.evaluate(heardSoFar)),
    (heard) =>
      heard === null
        ? Effect.fail(
            lost(
              "the PCI's document has none of the harness's listeners: its page did not install `listening` before the document's own scripts",
            ),
          )
        : Effect.succeed(heard),
  );

/**
 * A frame's layout as both of its documents give it: the size the page lays its element's content
 * box out at, in CSS pixels, untransformed and unrounded; whether the page has the harness's
 * listeners; and the frame document's own viewport, none where the frame has not.
 */
interface Layout {
  readonly box: Size;
  readonly listened: boolean;
  readonly viewport: Size | null;
}

/**
 * A frame's element as the page lays it out: its content box, untransformed and unrounded, and
 * whether the page has the harness's listeners.
 */
interface LaidOut {
  readonly box: Size;
  readonly listened: boolean;
}

/**
 * Give, in the page, the size it lays a frame's element's content box out at, by its computed
 * `width` and `height`, which are untransformed and unrounded, less its borders and padding where
 * its box sizing counts them in; and whether the page has the harness's listeners.
 *
 * @param element The frame's element.
 * @returns Its content box, and whether the page listens.
 */
const laidOut = (element: Element): LaidOut => {
  const style = getComputedStyle(element);
  const counted = style.boxSizing === "border-box";
  const across = [
    style.borderLeftWidth,
    style.paddingLeft,
    style.paddingRight,
    style.borderRightWidth,
  ].reduce((total, value) => total + Number(value.slice(0, -"px".length)), 0);
  const down = [
    style.borderTopWidth,
    style.paddingTop,
    style.paddingBottom,
    style.borderBottomWidth,
  ].reduce((total, value) => total + Number(value.slice(0, -"px".length)), 0);

  return {
    box: {
      height: Number(style.height.slice(0, -"px".length)) - (counted ? down : 0),
      width: Number(style.width.slice(0, -"px".length)) - (counted ? across : 0),
    },
    listened: window.harnessMarks !== undefined,
  };
};

/**
 * Give, in a frame's document, its own viewport, by the getters it kept before its own scripts
 * ran: none where the harness's listeners are not in it.
 *
 * @returns The viewport.
 */
const viewportOf = (): Size | null => window.harnessKept?.viewport() ?? null;

/**
 * Wait, in the page, until its window has heard the harness's mark carrying a nonce from a frame:
 * at once where it already has, else on its next `message` from that frame. Where the element
 * holds no frame, nothing is waited for.
 *
 * @param element The frame's element.
 * @param nonce The mark's nonce.
 * @returns Once the mark has been heard.
 */
const markHeard = async (element: Element, nonce: string): Promise<void> => {
  const source = element instanceof HTMLIFrameElement ? element.contentWindow : null;
  const heard = (): boolean =>
    source !== null && window.harnessMarks?.get(source)?.has(nonce) === true;

  if (source === null || heard()) {
    return;
  }

  const ended = Promise.withResolvers<null>();
  const listener = (event: MessageEvent): void => {
    if (event.source === source && heard()) {
      ended.resolve(null);
    }
  };

  window.addEventListener("message", listener);
  await ended.promise;
  window.removeEventListener("message", listener);
};

/**
 * Have a frame's document post the harness's mark, carrying a nonce, to its page: `harnessMark`,
 * which waits two of the document's frames and then a 0 ms timer, on the clock it kept before its
 * own scripts ran, and posts through the parent it had then, so no script of the PCI's can take
 * the mark, move it or stop it.
 *
 * @param nonce The mark's nonce.
 * @returns Once the mark is posted; false, posting nothing, where the harness's listeners are not
 *   in the document.
 * @constraint The mark follows every message the frame posted before it: a window's messages to
 *   another arrive in the order it posted them. Plate's frame page posts a height in its
 *   `ResizeObserver`'s callback, which runs in a frame's rendering, so two of the frame's frames
 *   come after every height it posts for a change already made; and it relays a change either at
 *   once, in the PCI's `qti-interaction-changed` handler, or in a 0 ms timer it sets in its
 *   capturing listener for an input event, which a 0 ms timer set later runs after. The timer
 *   orders the mark; it bounds nothing.
 * @source `packages/plate/src/ui/portable-custom/frame-boot.ts`: `onInput`, whose `setTimeout(…, 0)`
 *   calls `relay`; `relay`, which posts `kind: "changed"`; and the `ResizeObserver` posting
 *   `kind: "height"`.
 * @see https://html.spec.whatwg.org/multipage/web-messaging.html#posting-messages
 * @see https://html.spec.whatwg.org/multipage/timers-and-user-prompts.html#timers
 */
const postMark = async (nonce: string): Promise<boolean> => {
  const mark = window.harnessMark;

  if (mark === undefined) {
    return false;
  }

  await mark(nonce);

  return true;
};

/**
 * Wait, in a frame's document, for its next `resize`, by the listener and the viewport it kept
 * before its own scripts ran: at once where its viewport is no longer as given.
 *
 * @param given The viewport, as last read.
 * @returns Once it has resized; false, waiting for nothing, where the harness's listeners are not
 *   in the document.
 */
const resized = async (given: Size): Promise<boolean> => {
  const kept = window.harnessKept;

  if (kept === undefined) {
    return false;
  }

  await kept.resized(given);

  return true;
};

/**
 * Read a frame's layout, from the page and from the frame's document.
 *
 * @param frame The frame, a child of the page.
 * @param attempt The harness's run of a promise.
 * @param step The step it is read for.
 * @returns The layout.
 */
const layoutOf = <F>(frame: Frame, attempt: Attempt<F>, step: string): Effect.Effect<Layout, F> =>
  Effect.gen(function* read() {
    const page = yield* attempt(
      `read the PCI's frame as the page lays it out for ${step}`,
      async () => {
        const element = await frame.frameElement();
        const laid = await element.evaluate(laidOut);

        await element.dispose();

        return laid;
      },
    );
    const viewport = yield* attempt(`read the PCI's own viewport for ${step}`, () =>
      frame.evaluate(viewportOf),
    );

    return { box: page.box, listened: page.listened, viewport };
  });

/**
 * Tell whether a frame's viewport is the content box the page lays its element out at: the same
 * CSS pixels, untransformed, the viewport whole pixels and the box as laid out, so less than a
 * pixel apart.
 *
 * @param layout The layout.
 * @param viewport The frame's own viewport.
 * @returns Whether it is.
 */
const sizedAsLaid = (layout: Layout, viewport: Size): boolean =>
  Math.abs(layout.box.width - viewport.width) < 1 &&
  Math.abs(layout.box.height - viewport.height) < 1;

/**
 * Hit-test, in the page, the middle of what of a frame's content its viewport shows, by its own
 * `elementFromPoint`, in the same step that reads where the frame's content box lies, so a frame
 * its host resizes between two reads cannot fail it.
 *
 * @param owner The frame's element.
 * @returns What the test found instead of the frame's element, empty where it found it.
 */
const shownAtMiddle = (owner: Element): string => {
  const rect = owner.getBoundingClientRect();
  const style = getComputedStyle(owner);
  const [
    borderLeft = 0,
    borderTop = 0,
    borderRight = 0,
    borderBottom = 0,
    paddingLeft = 0,
    paddingTop = 0,
    paddingRight = 0,
    paddingBottom = 0,
  ] = [
    style.borderLeftWidth,
    style.borderTopWidth,
    style.borderRightWidth,
    style.borderBottomWidth,
    style.paddingLeft,
    style.paddingTop,
    style.paddingRight,
    style.paddingBottom,
  ].map((value) => Number(value.slice(0, -"px".length)));
  const left = Math.max(rect.left + borderLeft + paddingLeft, 0);
  const top = Math.max(rect.top + borderTop + paddingTop, 0);
  const right = Math.min(rect.right - borderRight - paddingRight, innerWidth);
  const bottom = Math.min(rect.bottom - borderBottom - paddingBottom, innerHeight);

  if (right <= left || bottom <= top) {
    return "nothing of it, the frame lying outside the page's viewport";
  }

  const hit = document.elementFromPoint((left + right) / 2, (top + bottom) / 2);

  if (hit === owner) {
    return "";
  }

  return hit === null ? "nothing" : `the page's ${hit.localName}`;
};

/**
 * Hit-test the page at a PCI's frame before anything waits for the frame's own frames: its own
 * `elementFromPoint`, at the middle of what of the frame's content its viewport shows, read in the
 * same step, must find the frame's element. A frame hidden, clipped, covered or out of view, whose
 * frames would not come, fails at once. Where the PCI is the page, there is nothing to find.
 *
 * @param frame The PCI's document's frame.
 * @param attempt The harness's run of a promise.
 * @param step The step, for a failure.
 * @param lost The failure where the page does not show the frame.
 * @returns Nothing, where the page shows it.
 */
export const shownFor = <F, L>(
  frame: Frame,
  attempt: Attempt<F>,
  step: string,
  lost: (why: string) => L,
): Effect.Effect<void, F | L> =>
  frame.parentFrame() === null
    ? Effect.void
    : Effect.flatMap(
        attempt(`hit-test the page at the PCI's frame for ${step}`, async () => {
          const element = await frame.frameElement();
          const found = await element.evaluate(shownAtMiddle);

          await element.dispose();

          return found;
        }),
        (shown) =>
          shown === ""
            ? Effect.void
            : Effect.fail(
                lost(
                  `the page's own hit test at the middle of what of the PCI's frame its viewport shows finds ${shown}, not the PCI`,
                ),
              ),
      );

/**
 * Have a PCI's frame post the harness's mark, carrying a fresh nonce, to its page ({@link
 * postMark}), the page's hit test having found the frame drawn first ({@link shownFor}), since the
 * mark waits for the frame's own frames; and give the nonce, which only that mark carries, so no
 * script of the frame's can post it before and end a wait for it early.
 *
 * @param frame The PCI's frame, a child of the page.
 * @param attempt The harness's run of a promise.
 * @param step The step, for a failure.
 * @param lost The failure where the page does not show the frame, or the frame has none of the
 *   harness's listeners.
 * @returns The mark's nonce.
 */
export const markOf = <F, L>(
  frame: Frame,
  attempt: Attempt<F>,
  step: string,
  lost: (why: string) => L,
): Effect.Effect<string, F | L> =>
  Effect.gen(function* marked() {
    yield* shownFor(frame, attempt, step, lost);

    const nonce = randomUUID();
    const posted = yield* attempt(`have the PCI's frame post the harness's mark for ${step}`, () =>
      frame.evaluate(postMark, nonce),
    );

    if (!posted) {
      return yield* Effect.fail(
        lost(
          "the PCI's frame has none of the harness's listeners: its page did not install `listening` before the frame's own scripts",
        ),
      );
    }

    return nonce;
  });

/**
 * Wait for what a frame's layout says is still to come, and no more: the harness's own mark from
 * that frame ({@link markOf}), which follows every height the frame posted, each of which the
 * page's frame host applies as it hears it; then, where the frame's viewport is not the content box
 * the page lays its element out at, the frame's next `resize`; then two of the frame's own frames
 * and two of the page's, once, so the page has drawn the frame where it lays it out.
 *
 * The mark is taken on every settle, so the harness holds no copy of how plate's frame page
 * measures the height it posts: whatever the frame posted before the mark has been heard and
 * applied once the mark has. Nothing waits for a layout that stays the same: a frame whose content
 * changes its height every frame is pressed all the same, and the check after the press says
 * whether the press was delivered. Every wait ends on an event: the harness's mark at the page's
 * window, which the harness itself has the frame post on the frame's kept clock, a `resize` of the
 * frame's, or a frame of either document's kept clock.
 *
 * @param frame The frame, a child of the page, which the page's hit test has found drawn.
 * @param attempt The harness's run of a promise.
 * @param step The step it is waited for.
 * @param lost The failure where the page or the frame has none of the harness's listeners.
 * @returns Once what was to come has come.
 */
const layoutSettled = <F, L>(
  frame: Frame,
  attempt: Attempt<F>,
  step: string,
  lost: (why: string) => L,
): Effect.Effect<void, F | L> =>
  Effect.gen(function* settling() {
    const page = frame.parentFrame() ?? frame;
    const entry = yield* layoutOf(frame, attempt, step);

    if (!entry.listened) {
      return yield* Effect.fail(
        lost(
          "the page has none of the harness's listeners: it did not install `listening` before its own scripts",
        ),
      );
    }

    const nonce = yield* markOf(frame, attempt, step, lost);

    yield* attempt(`wait for the page to hear the PCI frame's mark for ${step}`, async () => {
      const element = await frame.frameElement();

      await element.evaluate(markHeard, nonce);
      await element.dispose();
    });

    const applied = yield* layoutOf(frame, attempt, step);
    const { viewport } = applied;

    if (viewport !== null && !sizedAsLaid(applied, viewport)) {
      yield* attempt(`wait for the PCI's frame to take its size for ${step}`, () =>
        frame.evaluate(resized, viewport),
      );
    }

    const framed = yield* attempt(`wait for two of the PCI's frames for ${step}`, () =>
      frame.evaluate(framesIn),
    );
    const paged = yield* attempt(`wait for two of the page's frames for ${step}`, () =>
      page.evaluate(framesIn),
    );

    if (!framed || !paged || viewport === null) {
      return yield* Effect.fail(
        lost(
          "the PCI's frame or its page has none of the harness's listeners: its page did not install `listening` before their own scripts",
        ),
      );
    }
  });

/**
 * Find where a PCI's document stands in the page once what its frame's layout says is still to
 * come has come (see `layoutSettled`), its frame a child of the page that draws content and that
 * the page's own hit test finds at the middle of what of it lies in the page's viewport; or fail
 * at once as the step it was found for was lost. Where the PCI is the page, its viewport is its
 * own.
 *
 * @param frame The document's frame.
 * @param attempt The harness's run of a promise.
 * @param step The step, for a failure.
 * @param lost The failure where the document cannot take the step.
 * @returns Where it stands, read once its layout has settled.
 */
export const settledFor = <F, L>(
  frame: Frame,
  attempt: Attempt<F>,
  step: string,
  lost: (why: string) => L,
): Effect.Effect<Placed, F | L> =>
  Effect.gen(function* settled() {
    const placed = yield* standing(frame, attempt, step, lost);

    if (frame.parentFrame() === null) {
      return placed;
    }

    yield* shownFor(frame, attempt, step, lost);
    yield* layoutSettled(frame, attempt, step, lost);

    return yield* standing(frame, attempt, step, lost);
  });

/**
 * Give where a point of a PCI's document is in the page, for a move of a gesture already pressed:
 * its frame's content corner plus the point, the frame a child of the page.
 *
 * @param frame The PCI's document's frame.
 * @param attempt The harness's own run of a promise of Chrome's, which fails as the harness does.
 * @param point The point, in the document.
 * @returns The point, in the page.
 */
export const screenOf = <F>(
  frame: Frame,
  attempt: Attempt<F>,
  point: Point,
): Effect.Effect<Point, F | TapNotDelivered> =>
  Effect.map(
    standing(frame, attempt, "a move", (why) => new TapNotDelivered({ step: "a move", why })),
    (placed) => ({ x: placed.corner.x + point.x, y: placed.corner.y + point.y }),
  );

/**
 * Tell how a heard press missed the point meant: a frame drawn at another size than its document's,
 * both settled once the press has been heard, is scaled; else the press landed elsewhere.
 *
 * @param after What the document has heard since the press.
 * @param target The point meant, in the document's coordinates.
 * @param drawn The size the frame draws its content at.
 * @returns Why the press was not delivered.
 */
const missedBy = (after: Heard, target: Point, drawn: Size): string => {
  const heardAt = `the PCI's document heard it at ${String(after.x)},${String(after.y)}, not at ${String(target.x)},${String(target.y)}, the point meant`;

  return Math.abs(drawn.width - after.size.width) >= 1 ||
    Math.abs(drawn.height - after.size.height) >= 1
    ? `the PCI's frame is scaled: its content is drawn ${String(drawn.width)} by ${String(drawn.height)} pixels for its document's ${String(after.size.width)} by ${String(after.size.height)}, and ${heardAt}`
    : heardAt;
};

/**
 * Tell why a press was not delivered: the document heard not exactly one more trusted press, heard
 * it a pixel or more away from the point meant, or on something else than it was meant for.
 *
 * @param before What the document had heard before.
 * @param after What it has heard since.
 * @param target The point meant, in the document's coordinates.
 * @param drawn The size the frame draws its content at.
 * @returns Why, empty where the press was delivered.
 */
const pressMissed = (before: Heard, after: Heard, target: Point, drawn: Size): string => {
  const presses = after.counts.pointerdown - before.counts.pointerdown;

  if (presses !== 1) {
    return `the PCI's document heard ${String(presses)} trusted pointerdown events, not one`;
  }

  if (Math.abs(after.x - target.x) >= 1 || Math.abs(after.y - target.y) >= 1) {
    return missedBy(after, target, drawn);
  }

  return after.onMeant ? "" : "the PCI's document heard it on something else than it was meant for";
};

/**
 * Press into a PCI's document on what the press is meant for, and succeed only once the document
 * reports the press: the frame a child of the page, drawn where the page's hit test finds it, its
 * layout settled to what it asked for ({@link settledFor}); the meant element's box read with the
 * document's own hit test there, which must find that element, and the point inside the content
 * the frame draws; the page's own hit test at the aim finding the frame; then after two of its
 * frames, the press, and two more, it has heard exactly one trusted `pointerdown` more than before,
 * at that point, on that very element, as the press's dispatch began.
 *
 * @param frame The PCI's document's frame: the frame it stands in, a child of the page, or the page
 *   where it stands at the top of its tab.
 * @param attempt The harness's own run of a promise of Chrome's, which fails as the harness does.
 * @param step The press, for a failure.
 * @param target What the press is meant for, and where: an element ({@link meantFor}) and a point
 *   inside its box ({@link Anchor}), or the page beside the PCI's parts ({@link besideParts}) at a
 *   point of the document's own.
 * @param press The press at a point of the page: a click, a tap, or the press that starts a drag,
 *   which makes one new pointer.
 * @returns Where the press landed, on the page and in the PCI's document.
 */
export const pressInto = <F>(
  frame: Frame,
  attempt: Attempt<F>,
  step: string,
  target: Target,
  press: (aim: Point) => Effect.Effect<void, F>,
): Effect.Effect<Pressed, F | TapNotDelivered> =>
  Effect.gen(function* delivered() {
    const lost = (why: string) => new TapNotDelivered({ step, why });
    const placed = yield* settledFor(frame, attempt, step, lost);
    const { meant } = target;
    const found = yield* attempt(`hit-test the PCI's document for ${step}`, () =>
      frame.evaluate(meantAt, target),
    );
    const { at } = found;
    const missed = missedAt(found, meant);

    yield* found.found !== "absent" &&
    (at.x < 0 || at.y < 0 || at.x >= placed.drawn.width || at.y >= placed.drawn.height)
      ? Effect.fail(
          lost(
            `it is meant for ${String(at.x)},${String(at.y)}, outside the content the PCI's frame draws, ${String(placed.drawn.width)} by ${String(placed.drawn.height)}`,
          ),
        )
      : Effect.void;
    yield* missed === "" ? Effect.void : Effect.fail(lost(missed));

    const aim = { x: placed.corner.x + at.x, y: placed.corner.y + at.y };

    yield* pageHitTested(frame, attempt, step, aim, lost);

    const before = yield* heardIn(frame, attempt, `before ${step}`, lost);

    yield* press(aim);

    const after = yield* heardIn(frame, attempt, `after ${step}`, lost);
    const why = pressMissed(before, after, at, placed.drawn);

    yield* why === "" ? Effect.void : Effect.fail(lost(why));

    return { aim, at };
  });

/**
 * Tell why a release meant at a point of a PCI's document was not delivered there: the document
 * heard not exactly one more trusted release, or heard it a pixel or more away from the point.
 *
 * @param before What the document had heard before.
 * @param after What it has heard since.
 * @param target The point meant, in the document's coordinates.
 * @returns Why, empty where the release was heard at the point.
 */
const releaseOffPoint = (before: Heard, after: Heard, target: Point): string => {
  const releases = after.counts.pointerup - before.counts.pointerup;

  if (releases !== 1) {
    return `the PCI's document heard ${String(releases)} trusted pointerup events, not one`;
  }

  return Math.abs(after.release.x - target.x) >= 1 || Math.abs(after.release.y - target.y) >= 1
    ? `the PCI's document heard it at ${String(after.release.x)},${String(after.release.y)}, not at ${String(target.x)},${String(target.y)}, the point meant`
    : "";
};

/**
 * Tell why a release meant for an element of a PCI's document was not delivered: it was not heard
 * at the point meant ({@link releaseOffPoint}), or the document's own hit test at the release's
 * point, as the release's dispatch began, found nothing of what the drop was meant for.
 *
 * @param before What the document had heard before.
 * @param after What it has heard since.
 * @param target The point meant, in the document's coordinates.
 * @returns Why, empty where the release was delivered.
 */
const releaseMissed = (before: Heard, after: Heard, target: Point): string => {
  const off = releaseOffPoint(before, after, target);

  if (off !== "") {
    return off;
  }

  return after.release.onMeant
    ? ""
    : "the PCI document's own hit test at the release's point, as its dispatch began, finds nothing of what the drop was meant for";
};

/**
 * Tell why a release meant outside a PCI's frame was not delivered there: by a mouse, the page must
 * hear exactly one trusted release more, at the aim, and the frame's document none; by a finger,
 * which Chrome keeps for the document it went down in, the frame's document must hear exactly one,
 * at the aim in its own coordinates, outside its viewport, and the page none.
 *
 * @param lifted The pointer.
 * @param frame What the frame's document heard before and since.
 * @param frame.after Since.
 * @param frame.before Before.
 * @param page What the page heard before and since.
 * @param page.after Since.
 * @param page.before Before.
 * @param aim The aim, in the page's and in the frame's coordinates.
 * @param aim.at In the frame's.
 * @param aim.page In the page's.
 * @returns Why, empty where the release was delivered outside.
 */
const outsideMissed = (
  lifted: Lifted,
  frame: { readonly after: Heard; readonly before: Heard },
  page: { readonly after: Heard; readonly before: Heard },
  aim: { readonly at: Point; readonly page: Point },
): string => {
  const inFrame = frame.after.counts.pointerup - frame.before.counts.pointerup;
  const inPage = page.after.counts.pointerup - page.before.counts.pointerup;
  const [hearer, silent, heard, point] =
    lifted === "mouse"
      ? (["page", "PCI's document", page.after.release, aim.page] as const)
      : (["PCI's document", "page", frame.after.release, aim.at] as const);
  const [count, silentCount] = lifted === "mouse" ? [inPage, inFrame] : [inFrame, inPage];

  if (silentCount !== 0) {
    return `the ${silent} heard ${String(silentCount)} trusted pointerup events, where a ${lifted}'s release outside the PCI's frame is the ${hearer}'s alone`;
  }

  if (count !== 1) {
    return `the ${hearer} heard ${String(count)} trusted pointerup events, not one`;
  }

  return Math.abs(heard.x - point.x) >= 1 || Math.abs(heard.y - point.y) >= 1
    ? `the ${hearer} heard it at ${String(heard.x)},${String(heard.y)}, not at ${String(point.x)},${String(point.y)}, the point meant`
    : "";
};

/**
 * Let a drag go, and succeed only once the release is heard where it was meant, as a press is:
 * the frame settled to what it asked for ({@link settledFor}), the release aimed from what that
 * layout shows, never from a point converted before the moves that led there, and sent.
 *
 * - **Meant for an element** of the PCI's document, or beside its parts: the element's box read with
 *   the document's own hit test there, which must find it (beside the parts, no part), the point
 *   inside what the frame draws and the page's own hit test at the aim finding the frame; then the
 *   document must hear exactly one trusted `pointerup` more, at that point, over that element, or
 *   over no part, by its own hit test as the release's dispatch began. Its target is never read: a
 *   pointer the PCI captured, or a finger, is released on the element that holds it.
 * - **Meant outside the frame:** the aim, below what the frame draws, inside the page's viewport,
 *   where the page's own hit test finds no part of the frame; then the release must be heard where
 *   Chrome gives it: a mouse's by the page alone, at the aim; a finger's by the frame's document
 *   alone, at the aim in its own coordinates, outside its viewport. A frame that grew over the aim
 *   hears a mouse there, and the release fails.
 *
 * @param frame The PCI's document's frame: a child of the page, or the page.
 * @param attempt The harness's own run of a promise of Chrome's, which fails as the harness does.
 * @param step The release, for a failure.
 * @param drop What the release is meant for, and where.
 * @param lifted The pointer it lifts.
 * @param release The release at a point of the page: the pointer brought to it, then lifted.
 * @returns Where the release landed, on the page and in the PCI's document.
 * @see https://w3c.github.io/pointerevents/#implicit-pointer-capture
 */
export const releaseInto = <F>(
  frame: Frame,
  attempt: Attempt<F>,
  step: string,
  drop: Drop,
  lifted: Lifted,
  release: (aim: Point) => Effect.Effect<void, F>,
): Effect.Effect<Pressed, F | DropNotDelivered> =>
  Effect.gen(function* delivered() {
    const lost = (why: string) => new DropNotDelivered({ step, why });
    const placed = yield* settledFor(frame, attempt, step, lost);
    const page = frame.parentFrame();

    if ("below" in drop) {
      if (page === null) {
        return yield* Effect.fail(lost("the PCI is the page: nothing of the page lies outside it"));
      }

      const at = { x: drop.across, y: placed.drawn.height + drop.below };
      const aim = { x: placed.corner.x + at.x, y: placed.corner.y + at.y };
      const found = yield* attempt(`hit-test the page for ${step}`, () => pageHitAt(frame, aim));

      if (found === "" || found.startsWith("nothing, the point")) {
        return yield* Effect.fail(
          lost(
            `the page's own hit test at ${String(aim.x)},${String(aim.y)} finds ${found === "" ? "the PCI's frame" : found}, where the drop is meant outside the frame`,
          ),
        );
      }

      const frameBefore = yield* heardIn(frame, attempt, `before ${step}`, lost);
      const pageBefore = yield* heardIn(page, attempt, `in the page before ${step}`, lost);

      yield* release(aim);

      const frameAfter = yield* heardIn(frame, attempt, `after ${step}`, lost);
      const pageAfter = yield* heardIn(page, attempt, `in the page after ${step}`, lost);
      const why = outsideMissed(
        lifted,
        { after: frameAfter, before: frameBefore },
        { after: pageAfter, before: pageBefore },
        { at, page: aim },
      );

      yield* why === "" ? Effect.void : Effect.fail(lost(why));

      return { aim, at };
    }

    const found = yield* attempt(`hit-test the PCI's document for ${step}`, () =>
      frame.evaluate(meantAt, drop),
    );
    const { at } = found;
    const missed = missedAt(found, drop.meant);

    yield* found.found !== "absent" &&
    (at.x < 0 || at.y < 0 || at.x >= placed.drawn.width || at.y >= placed.drawn.height)
      ? Effect.fail(
          lost(
            `it is meant for ${String(at.x)},${String(at.y)}, outside the content the PCI's frame draws, ${String(placed.drawn.width)} by ${String(placed.drawn.height)}`,
          ),
        )
      : Effect.void;
    yield* missed === "" ? Effect.void : Effect.fail(lost(missed));

    const aim = { x: placed.corner.x + at.x, y: placed.corner.y + at.y };

    yield* pageHitTested(frame, attempt, step, aim, lost);

    const before = yield* heardIn(frame, attempt, `before ${step}`, lost);

    yield* release(aim);

    const after = yield* heardIn(frame, attempt, `after ${step}`, lost);
    const why = releaseMissed(before, after, at);

    yield* why === "" ? Effect.void : Effect.fail(lost(why));

    return { aim, at };
  });

/**
 * Lift a pointer where it pressed, as a tap does, and succeed only once the release is heard there:
 * the document that heard the press must hear exactly one trusted `pointerup` more, at the point
 * of its own the press was heard at, over what the press was meant for by its own hit test as the
 * release's dispatch began. A frame that moved between the press and the release hears it
 * elsewhere, and the release fails as not delivered, not as the rule's own failure.
 *
 * @param frame The PCI's document's frame.
 * @param attempt The harness's own run of a promise of Chrome's, which fails as the harness does.
 * @param step The release, for a failure.
 * @param pressed Where the press landed.
 * @param release The release, the pointer not moved.
 * @returns The release, delivered.
 */
export const liftInto = <F>(
  frame: Frame,
  attempt: Attempt<F>,
  step: string,
  pressed: Pressed,
  release: Effect.Effect<void, F>,
): Effect.Effect<void, F | DropNotDelivered> =>
  Effect.gen(function* lifted() {
    const lost = (why: string) => new DropNotDelivered({ step, why });
    const before = yield* heardIn(frame, attempt, `before ${step}`, lost);

    yield* release;

    const after = yield* heardIn(frame, attempt, `after ${step}`, lost);
    const why = releaseMissed(before, after, pressed.at);

    yield* why === "" ? Effect.void : Effect.fail(lost(why));
  });

/**
 * Let a pointer go at the point it has moved to, as a press that drifts does, and succeed only once
 * the release is heard there: the document that heard the press must hear exactly one trusted
 * `pointerup` more, at that point of its own ({@link releaseOffPoint}). Nothing is meant there, so
 * no element is read.
 *
 * @param frame The PCI's document's frame.
 * @param attempt The harness's own run of a promise of Chrome's, which fails as the harness does.
 * @param step The release, for a failure.
 * @param at The point the pointer has moved to, in the document's coordinates.
 * @param release The release, the pointer not moved from that point.
 * @returns The release, heard at the point.
 */
export const releasedAt = <F>(
  frame: Frame,
  attempt: Attempt<F>,
  step: string,
  at: Point,
  release: Effect.Effect<void, F>,
): Effect.Effect<void, F | DropNotDelivered> =>
  Effect.gen(function* released() {
    const lost = (why: string) => new DropNotDelivered({ step, why });
    const before = yield* heardIn(frame, attempt, `before ${step}`, lost);

    yield* release;

    const after = yield* heardIn(frame, attempt, `after ${step}`, lost);
    const why = releaseOffPoint(before, after, at);

    yield* why === "" ? Effect.void : Effect.fail(lost(why));
  });

/**
 * Make sure a PCI's document can take a key: its frame a child of the page that draws content, the
 * page's own hit test at the centre of that content finding it, which a PCI that is the page needs
 * not. No size of the document's is read.
 *
 * @param frame The document's frame.
 * @param attempt The harness's run of a promise.
 * @param step The key, for a failure.
 * @returns Nothing, where the document can take it.
 */
const keyable = <F>(
  frame: Frame,
  attempt: Attempt<F>,
  step: string,
): Effect.Effect<void, F | KeyNotDelivered> =>
  Effect.gen(function* takes() {
    const lost = (why: string) => new KeyNotDelivered({ step, why });
    const placed = yield* standing(frame, attempt, step, lost);

    if (frame.parentFrame() !== null) {
      yield* pageHitTested(
        frame,
        attempt,
        step,
        {
          x: placed.corner.x + placed.drawn.width / 2,
          y: placed.corner.y + placed.drawn.height / 2,
        },
        lost,
      );
    }
  });

/**
 * Send a PCI's document an input it must hear as a number of one trusted event, and succeed only
 * once it has: the document able to take it, after two of its frames, the input, then two more, it
 * has heard exactly that many more than before.
 *
 * @param frame The PCI's document's frame.
 * @param attempt The harness's own run of a promise of Chrome's, which fails as the harness does.
 * @param step The input, for a failure.
 * @param expected The event the document must hear, and how many of it.
 * @param expected.kind The event.
 * @param expected.count How many of it.
 * @param input The input.
 * @returns The input, delivered.
 */
const heardAs = <F>(
  frame: Frame,
  attempt: Attempt<F>,
  step: string,
  expected: { readonly count: number; readonly kind: Exclude<Counted, "pointerdown"> },
  input: Effect.Effect<void, F>,
): Effect.Effect<void, F | KeyNotDelivered> =>
  Effect.gen(function* heardThat() {
    const lost = (why: string) => new KeyNotDelivered({ step, why });

    yield* keyable(frame, attempt, step);

    const before = yield* heardIn(frame, attempt, `before ${step}`, lost);

    yield* input;

    const after = yield* heardIn(frame, attempt, `after ${step}`, lost);
    const more = after.counts[expected.kind] - before.counts[expected.kind];

    yield* more === expected.count
      ? Effect.void
      : Effect.fail(
          new KeyNotDelivered({
            step,
            why: `the PCI's document heard ${String(more)} trusted ${expected.kind} events, not ${String(expected.count)}`,
          }),
        );
  });

/**
 * Press a key that moves focus into or within a PCI's document, Tab or Shift+Tab, and succeed only
 * once the document reports the move: exactly one trusted `focusin` more. A Tab from the host page
 * is heard there, not in the document, so its `focusin` is what says it arrived.
 *
 * @param frame The PCI's document's frame.
 * @param attempt The harness's own run of a promise of Chrome's, which fails as the harness does.
 * @param step The key, for a failure.
 * @param key The key's press.
 * @returns The key, delivered.
 */
export const focusInto = <F>(
  frame: Frame,
  attempt: Attempt<F>,
  step: string,
  key: Effect.Effect<void, F>,
): Effect.Effect<void, F | KeyNotDelivered> =>
  heardAs(frame, attempt, step, { count: 1, kind: "focusin" }, key);

/**
 * Send a key to a PCI's document that holds focus, as Playwright names it, and succeed only once
 * the document reports it: a press or a hold (`down:<key>`, a repeat where it is held already) as
 * one trusted `keydown` for each key of its chord (`Control+Enter` is two), a release (`up:<key>`)
 * as one trusted `keyup`.
 *
 * @param frame The PCI's document's frame.
 * @param attempt The harness's own run of a promise of Chrome's, which fails as the harness does.
 * @param key The key, as the harness names it.
 * @param sent The key's sending.
 * @returns The key, delivered.
 */
export const keyInto = <F>(
  frame: Frame,
  attempt: Attempt<F>,
  key: string,
  sent: Effect.Effect<void, F>,
): Effect.Effect<void, F | KeyNotDelivered> =>
  heardAs(
    frame,
    attempt,
    `press ${key}`,
    key.startsWith("up:")
      ? { count: 1, kind: "keyup" }
      : {
          count: (key.startsWith("down:") ? key.slice("down:".length) : key).split("+").length,
          kind: "keydown",
        },
    sent,
  );

/**
 * Tell, in a PCI's document, whether it holds the page's focus on an element a selector finds, at
 * its place among those it finds, once two of its frames have come on the clock it kept before its
 * own scripts ran; false where the harness's listeners are not in it.
 *
 * @param target The selector, and the place.
 * @param target.nth The place, from 0.
 * @param target.selector The selector.
 * @returns Whether the document has focus and that element is its active element.
 */
const focusedOn = async (target: { readonly nth: number; readonly selector: string }) => {
  if (window.harnessKept === undefined) {
    return false;
  }

  await window.harnessKept.frames();

  const element = [...document.querySelectorAll(target.selector)][target.nth];

  return document.hasFocus() && element !== undefined && document.activeElement === element;
};

/**
 * Focus an element of a PCI's document, and succeed only once the document holds the page's focus
 * on it: focusing an element that holds it already makes no `focusin`, so the document's own
 * answer is what says the focus is there.
 *
 * @param frame The PCI's document's frame.
 * @param attempt The harness's own run of a promise of Chrome's, which fails as the harness does.
 * @param target The element, by its selector and its place among those it finds.
 * @param target.nth The place, from 0.
 * @param target.selector The selector.
 * @param focus The focusing.
 * @returns The focus, taken.
 */
export const focusOn = <F>(
  frame: Frame,
  attempt: Attempt<F>,
  target: { readonly nth: number; readonly selector: string },
  focus: Effect.Effect<void, F>,
): Effect.Effect<void, F | KeyNotDelivered> =>
  Effect.gen(function* focused() {
    const step = `focus ${target.selector} #${String(target.nth)}`;

    yield* keyable(frame, attempt, step);
    yield* focus;

    const there = yield* attempt(`read where the PCI's focus is after ${step}`, () =>
      frame.evaluate(focusedOn, target),
    );

    yield* there
      ? Effect.void
      : Effect.fail(
          new KeyNotDelivered({ step, why: "the PCI's document does not hold the focus there" }),
        );
  });
