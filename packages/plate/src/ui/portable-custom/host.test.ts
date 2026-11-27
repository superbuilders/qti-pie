/**
 * Plate's island, `hostFrame` (`#plate/ui/portable-custom/host.ts`), as it answers its frame,
 * against a frame end and a page of the test's own: the `load` it sends once the frame has booted,
 * and its two acknowledgments of each height the frame posts (`landHeight` in
 * `#plate/ui/portable-custom/landing.ts`, every island's one): `landed` as it applies it, and
 * `settled` once the element's height has come to rest.
 *
 * The oracle is the frame protocol as `#plate/ui/portable-custom/protocol.ts` states it, written by
 * hand: a `load` carries the page's device pixel ratio; a `PageLanded` the height the frame posted,
 * the frame element's height just before the island applied it and just after, and the page's
 * ratio; and a `PageSettled` the height the element read the same in two consecutive animation
 * frames. The page's animation frames and the frame element's laid-out height are the test's: the
 * element takes a written height at once, or as a host's script tweens it frame by frame.
 *
 * @module
 * @see https://html.spec.whatwg.org/multipage/imagebitmap-and-animations.html#animation-frames
 */
import { afterEach, assert, beforeEach, describe, it, vi } from "vitest";
import type { FrameToPage } from "#plate/pci/frame-protocol.ts";
import { hostFrame } from "#plate/ui/portable-custom/host.ts";
import type { HostedPci } from "#plate/ui/portable-custom/host.ts";
import type { PageMessage } from "#plate/ui/portable-custom/protocol.ts";

/**
 * A message event the page's `message` listener is handed: the frame's message and the window it
 * came from.
 */
interface FrameEvent {
  readonly data: FrameToPage;
  readonly source: object;
}

/**
 * A host's own script that moves the frame element's laid-out height in the page's animation
 * frames, as a tween does: given the height the island wrote and the element's height now, the
 * height it sets in the next frame, none where it leaves the element to take the written height
 * at once.
 */
type Tween = (written: number, now: number) => number | undefined;

/**
 * The page and the frame end as the test holds them: the frame element's `height` attribute as the
 * island wrote it; a way to post the island a message from the frame; the frame's nonce; what the
 * island told the frame, in order; and a way to run the page's next animation frame, the host's
 * tween first and then the callbacks queued for it.
 */
interface Hosted {
  readonly attribute: () => string;
  readonly frame: () => void;
  readonly from: (message: FrameToPage) => void;
  readonly nonce: string;
  readonly told: PageMessage[];
}

/**
 * The PCI the island hosts: one route, plain configuration, an integer response.
 */
const pci: HostedPci = {
  configuration: {
    contextVariables: {},
    properties: {},
    responseIdentifier: "RESPONSE",
    status: "interacting",
    templateVariables: {},
  },
  facts: { loader: "https://host.test/frame", routes: [{ id: "a", primary: "modules/a.js" }] },
  placed: { dir: "ltr", lang: "en" },
  posted: { baseType: "integer", cardinality: "single", identifier: "RESPONSE" },
  source: { markup: "", templates: [] },
  title: "PCI",
  typeIdentifier: "urn:qti-pie:test:host",
};

/**
 * The page's device pixel ratio in every case.
 */
const pageRatio = 1.25;

/**
 * The frame element's height before the island writes one, an `iframe`'s default.
 */
const defaultHeight = 150;

/**
 * Host the PCI with `hostFrame` on a page and a frame end of the test's own, and let the frame
 * boot.
 *
 * @param tween The host's own script's tween of the element's height, `null` for no tween.
 * @returns The page and the frame end.
 */
const hosted = (tween: Tween | null): Hosted => {
  const told: PageMessage[] = [];
  const listeners = new Map<string, (event: FrameEvent) => void>();
  const queued: (() => void)[] = [];
  const contentWindow = {
    postMessage: (message: PageMessage) => {
      told.push(message);
    },
  };
  let attribute = "";
  let laid = defaultHeight;
  const frame = {
    contentWindow,
    dataset: {},
    getBoundingClientRect: () => ({ height: laid }),
    get height() {
      return attribute;
    },
    set height(written: string) {
      attribute = written;

      if (tween === null) {
        laid = Number(written);
      }
    },
    loading: "",
    referrerPolicy: "",
    remove: () => {},
    setAttribute: () => {},
    src: "",
    title: "",
  };
  const ownerDocument = {
    activeElement: null,
    createElement: () => Object.assign(frame, { ownerDocument }),
    defaultView: {
      addEventListener: (type: string, listener: (event: FrameEvent) => void) => {
        listeners.set(type, listener);
      },
    },
  };

  vi.stubGlobal("requestAnimationFrame", (rendered: () => void) => queued.push(rendered));
  vi.stubGlobal("document", {
    baseURI: "https://host.test/item",
    body: { append: () => {}, ownerDocument },
  });
  hostFrame(document.body, new URL(pci.facts.loader), pci, {
    bound: () => ({ base: null }),
    failed: () => {},
    ready: () => {},
    response: () => {},
  });

  const nonce = decodeURIComponent(new URL(frame.src).hash.slice(1));
  const from = (message: FrameToPage): void => {
    listeners.get("message")?.({ data: message, source: contentWindow });
  };

  from({ kind: "booted", nonce });

  return {
    attribute: () => attribute,
    frame: () => {
      laid = tween?.(Number(attribute), laid) ?? laid;

      for (const rendered of queued.splice(0)) {
        rendered();
      }
    },
    from,
    nonce,
    told,
  };
};

/**
 * What the island told the frame of its heights, each acknowledgment by its kind and height, in
 * order.
 *
 * @param page The page.
 * @returns The acknowledgments.
 */
const landingsIn = (page: Hosted): readonly string[] =>
  page.told.flatMap((message) =>
    message.kind === "landed" || message.kind === "settled"
      ? [`${message.kind} ${String(message.height)}`]
      : [],
  );

describe("plate's island, as it answers its frame", () => {
  beforeEach(() => {
    vi.stubGlobal("devicePixelRatio", pageRatio);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("sends the frame its load with the page's device pixel ratio", () => {
    const page = hosted(null);

    assert.deepStrictEqual(
      page.told.map((message) => (message.kind === "load" ? message.ratio : message.kind)),
      [pageRatio],
      "the frame's first posts take their step from the page's ratio",
    );
  });

  it("writes each height the frame posts whole, acknowledges it as it applies it, and says it settled once two animation frames read the element's height the same", () => {
    const page = hosted(null);

    page.from({ kind: "height", nonce: page.nonce, pixels: 400.4 });

    const applied = [...page.told];

    page.frame();

    const first = landingsIn(page);

    page.frame();

    assert.deepStrictEqual(
      {
        applied: applied.filter(({ kind }) => kind === "landed"),
        attribute: page.attribute(),
        first,
        settled: page.told.filter(({ kind }) => kind === "settled"),
      },
      {
        applied: [
          {
            from: defaultHeight,
            height: 401,
            kind: "landed",
            nonce: page.nonce,
            pixels: 400.4,
            ratio: pageRatio,
          },
        ],
        attribute: "401",
        first: ["landed 401"],
        settled: [{ height: 401, kind: "settled", nonce: page.nonce, pixels: 400.4 }],
      },
      "`landed` at the apply, the element's height before and after; `settled` at the second frame that read it",
    );
  });

  it("settles a height a host's script tweens frame by frame only once the tween has stopped: RED i7″'s script-animated host", () => {
    const page = hosted((written, now) => Math.min(written, now + 50));

    page.from({ kind: "height", nonce: page.nonce, pixels: 400 });

    for (const _ of Array.from({ length: 8 })) {
      page.frame();
    }

    assert.deepStrictEqual(
      landingsIn(page),
      ["landed 150", "settled 400"],
      "the element moves 50 px a frame from 150 to 400, and settles at the frame after the one it arrived in; acknowledged at the apply alone, each step read as the host's own resize ran the frame to 6,592,961 px in 9 s",
    );
  });

  it("settles beside an animation that never ends and moves no box, since only the height is read: CLEAN i7″'s and RED i7″'s infinite outline-colour pulse", () => {
    const page = hosted(null);

    page.from({ kind: "height", nonce: page.nonce, pixels: 400 });
    page.frame();
    page.frame();

    assert.deepStrictEqual(
      landingsIn(page),
      ["landed 400", "settled 400"],
      "an acknowledgment that waited for every animation's end never came beside one that runs for ever, and the frame stood at its first post for good",
    );
  });
});
