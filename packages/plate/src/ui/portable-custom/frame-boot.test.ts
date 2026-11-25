/**
 * The frame's wait for a module script (`bootFrame`, `#plate/ui/portable-custom/frame-boot.ts`): a
 * load whose script defines no module fails once its stated wait runs out, and a wait of 0, or one
 * longer than a browser's timer holds, is no limit.
 *
 * The oracle is reading 246 (docs/spec-readings.md) and the implementation guide's `waitSeconds`
 * (§3.7.12.2: "how long the delivery engine should wait for each Javascript file to load before
 * timing out. A setting of 0 indicates that no timeout should be used"), written by hand: a stated
 * wait is never dropped, and HTML's `setTimeout` takes its delay as a WebIDL `long`, milliseconds
 * in a 32-bit signed integer, so a wait past 2,147,483.647 seconds is longer than any session and
 * no timer can hold it. The frame runs against a document of the test's own, its timers vitest's
 * fake ones, and a script that never loads, so only the wait can fail the load.
 *
 * @module
 */
import { Brand } from "effect";
import { afterEach, assert, describe, it, vi } from "vitest";
import type { FrameToPage } from "#plate/pci/frame-protocol.ts";
import { bootFrame } from "#plate/ui/portable-custom/frame-boot.ts";
import type { FrameNonce, PageMessage } from "#plate/ui/portable-custom/protocol.ts";

/**
 * The frame's nonce, its URL's fragment.
 */
const nonce = Brand.nominal<FrameNonce>()("n1");

/**
 * A message the island posts to the frame, as the frame's listener reads it.
 */
interface IslandMessage {
  readonly data: PageMessage;
  readonly source: Island;
}

/**
 * The island, the frame's parent: what the frame posts to it, in order.
 */
interface Island {
  readonly posted: FrameToPage[];
  readonly postMessage: (message: FrameToPage) => void;
}

/**
 * An element of the test's document: every member the frame writes or calls, doing nothing.
 *
 * @returns The element.
 */
const elementOf = () => ({
  addEventListener: () => {},
  append: () => {},
  dataset: {},
  innerHTML: "",
});

/**
 * A `ResizeObserver` the frame constructs, which only notes what it is asked to observe.
 */
class NotedObserver {
  readonly observed: Element[] = [];

  observe(target: Element): void {
    this.observed.push(target);
  }
}

/**
 * Boot a frame in the test's document and hand it the island's `load` with one route, whose primary
 * waits the seconds given.
 *
 * @param waitSeconds The primary location's wait.
 * @returns The island, holding what the frame posted.
 */
const loaded = (waitSeconds: number): Island => {
  const posted: FrameToPage[] = [];
  const island: Island = {
    postMessage: (message) => {
      posted.push(message);
    },
    posted,
  };
  const listeners = new Map<string, (message: IslandMessage) => void>();

  vi.stubGlobal("location", { hash: `#${nonce}` });
  vi.stubGlobal("window", {
    addEventListener: (type: string, listener: (message: IslandMessage) => void) => {
      listeners.set(type, listener);
    },
    parent: island,
  });
  vi.stubGlobal("document", {
    addEventListener: () => {},
    body: elementOf(),
    createElement: elementOf,
    documentElement: { dir: "", getBoundingClientRect: () => ({ height: 0 }), lang: "" },
    head: elementOf(),
    title: "",
  });
  vi.stubGlobal("ResizeObserver", NotedObserver);
  bootFrame();
  listeners.get("message")?.({
    data: {
      dir: "ltr",
      entry: "a",
      kind: "load",
      lang: "en",
      markup: "",
      nonce,
      routes: [
        { id: "a", primary: "modules/a.js", waitSeconds: { fallback: 7, primary: waitSeconds } },
      ],
      templates: [],
      title: "PCI",
    },
    source: island,
  });

  return island;
};

/**
 * Whether the frame has told the island the load failed.
 *
 * @param island The island.
 * @returns Whether a `failed` is among what it was posted.
 */
const failed = (island: Island): boolean => island.posted.some(({ kind }) => kind === "failed");

describe("a PCI frame's wait for a module script", () => {
  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  // Bound: a second, and the longest wait a timer holds, 2,147,483.647 seconds.
  it.each([1, 2_147_483.647])("fails a load once a wait of %d s runs out", async (waitSeconds) => {
    vi.useFakeTimers();

    const island = loaded(waitSeconds);

    await vi.advanceTimersByTimeAsync(waitSeconds * 1000 - 1);
    assert.isFalse(failed(island), "not yet failed");
    await vi.advanceTimersByTimeAsync(1);
    assert.isTrue(failed(island), "failed once it ran out");
  });

  // Bound: 0, the first millisecond past a timer's longest delay, and 1e9 seconds, each waited out
  // ten times over.
  it.each([0, 2_147_483.648, 1e9])("never fails a load for a wait of %d s", async (waitSeconds) => {
    vi.useFakeTimers();

    const island = loaded(waitSeconds);

    await vi.advanceTimersByTimeAsync(Math.max(waitSeconds, 1) * 10_000);
    assert.isFalse(failed(island), "no limit");
  });
});
