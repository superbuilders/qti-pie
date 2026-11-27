/**
 * The frame's wait for a module script (`bootFrame`, `#plate/ui/portable-custom/frame-boot.ts`): a
 * timeout means only "load the fallback", so a primary with a fallback after it is waited for as
 * long as its fallback says and then the fallback loads, while a location with nothing after it, a
 * primary with no fallback or the fallback itself, waits for its script's load or error however
 * long it takes; a wait of 0, or one longer than a browser's timer holds, is no limit.
 *
 * The oracle is reading `pci-wait-before-fallback` (docs/spec-readings.md), the information model's
 * `fallback-path` ("the location from which to load the Javascript module if the module can't be
 * loaded from the primary location", section 7.17.3) and the implementation guide's `waitSeconds`
 * (§3.7.12.2: "how long the delivery engine should wait for each Javascript file to load before
 * timing out. A setting of 0 indicates that no timeout should be used (however this may prevent a
 * fallback configuration from being used)"), with reading `pci-configuration-waits`'s bound,
 * written by hand: HTML's `setTimeout` takes its delay as a WebIDL `long`, milliseconds in a 32-bit
 * signed integer, so a wait past 2,147,483.647 seconds is longer than any session and no timer can
 * hold it. The frame runs against a document of the test's own, its timers vitest's fake ones, and
 * scripts that load, fail or run only when a case says so.
 *
 * @module
 */
import type { Profiler } from "node:inspector";
import { Session } from "node:inspector/promises";
import { setImmediate } from "node:timers/promises";
import { createContext, runInContext } from "node:vm";
import { regex } from "arkregex";
import { Brand, Effect, Predicate } from "effect";
import { Digest } from "effect/crypto";
import { parseSync, Visitor } from "oxc-parser/src-js";
import type {
  ArrowFunctionExpression,
  BindingPattern,
  BindingRestElement,
  Function as ParsedFunction,
  MemberExpression,
  Node,
  ParamPattern,
} from "oxc-parser/src-js";
import { afterEach, assert, beforeEach, describe, it, vi } from "vitest";
import type { FrameToPage, PciFrameRoute } from "#plate/pci/frame-protocol.ts";
import { bootFrame } from "#plate/ui/portable-custom/frame-boot.ts";
import { framePage } from "#plate/ui/portable-custom/frame-page.ts";
import type { FrameNonce, PageMessage } from "#plate/ui/portable-custom/protocol.ts";

/**
 * The frame's nonce, its URL's fragment.
 */
const nonce = Brand.nominal<FrameNonce>()("n1");

/**
 * The longest delay a browser's timer holds, in milliseconds.
 */
const longestTimerMs = 2_147_483_647;

/**
 * A message posted to the frame, as the frame's listener reads it: the island's, or one another
 * window posts as the island would.
 */
interface IslandMessage {
  readonly data: PageMessage;
  readonly source: Elsewhere | Island;
}

/**
 * The island, the frame's parent: what the frame posts to it, in order.
 */
interface Island {
  readonly posted: FrameToPage[];
  readonly postMessage: (message: FrameToPage) => void;
}

/**
 * An element of the test's document: the listeners the frame adds to it, by type, and the
 * elements appended to it; every other member the frame writes or calls does nothing.
 */
interface LoaderElement {
  readonly addEventListener: (type: string, listener: () => void) => void;
  readonly append: (child: LoaderElement) => void;
  readonly appended: LoaderElement[];
  readonly dataset: Record<string, string>;
  readonly innerHTML: string;
  readonly listeners: Map<string, () => void>;
  readonly src: string;
}

/**
 * The frame's window as the test holds it: where the frame writes its loader's `define`.
 */
interface LoaderWindow {
  readonly define?: (factory: () => object) => void;
}

/**
 * A booted frame: the island it posts to, its document's head, whose children are the scripts it
 * appends in order, and its window.
 */
interface LoaderFrame {
  readonly head: LoaderElement;
  readonly island: Island;
  readonly window: LoaderWindow;
}

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
 * An element of the test's document.
 *
 * @returns The element.
 */
const elementOf = (): LoaderElement => {
  const listeners = new Map<string, () => void>();
  const appended: LoaderElement[] = [];

  return {
    addEventListener: (type, listener) => {
      listeners.set(type, listener);
    },
    append: (child) => {
      appended.push(child);
    },
    appended,
    dataset: {},
    innerHTML: "",
    listeners,
    src: "",
  };
};

/**
 * Boot a frame in the test's document and hand it the island's `load` with one route, module
 * `a`, its entry.
 *
 * @param route The route, its locations and its fallback's wait.
 * @returns The frame.
 */
const loadingFrame = (route: Omit<PciFrameRoute, "id">): LoaderFrame => {
  const posted: FrameToPage[] = [];
  const island: Island = {
    postMessage: (message) => {
      posted.push(message);
    },
    posted,
  };
  const listeners = new Map<string, (message: IslandMessage) => void>();
  const head = elementOf();
  const frameWindow: LoaderWindow = {};

  vi.stubGlobal("location", { hash: `#${nonce}` });
  vi.stubGlobal(
    "window",
    Object.assign(frameWindow, {
      addEventListener: (type: string, listener: (message: IslandMessage) => void) => {
        listeners.set(type, listener);
      },
      parent: island,
    }),
  );
  vi.stubGlobal("document", {
    addEventListener: () => {},
    body: elementOf(),
    createElement: elementOf,
    documentElement: { dir: "", getBoundingClientRect: () => ({ height: 0 }), lang: "" },
    fonts: { addEventListener: () => {} },
    head,
    styleSheets: [],
    title: "",
  });
  vi.stubGlobal("ResizeObserver", NotedObserver);
  vi.stubGlobal("MutationObserver", NotedObserver);
  bootFrame();
  listeners.get("message")?.({
    data: {
      dir: "ltr",
      entry: "a",
      kind: "load",
      lang: "en",
      markup: "",
      nonce,
      routes: [{ id: "a", ...route }],
      templates: [],
      title: "PCI",
    },
    source: island,
  });

  return { head, island, window: frameWindow };
};

/**
 * The scripts a frame has appended, by their URLs, in order.
 *
 * @param frame The frame.
 * @returns Their URLs.
 */
const scriptsOf = (frame: LoaderFrame): readonly string[] =>
  frame.head.appended.map(({ src }) => src);

/**
 * Fire an event the frame listens for on the script it appended at a place.
 *
 * @param frame The frame.
 * @param at The script's place among those appended.
 * @param type `load` or `error`.
 */
const fire = (frame: LoaderFrame, at: number, type: "error" | "load"): void => {
  frame.head.appended[at]?.listeners.get(type)?.();
};

/**
 * Let the script at a place arrive: it runs, defining its module anonymously, then loads.
 *
 * @param frame The frame.
 * @param at The script's place among those appended.
 */
const arrive = (frame: LoaderFrame, at: number): void => {
  frame.window.define?.(() => ({}));
  fire(frame, at, "load");
};

/**
 * Whether the frame has told the island the load failed.
 *
 * @param frame The frame.
 * @returns Whether a `failed` is among what it posted.
 */
const failedIn = (frame: LoaderFrame): boolean =>
  frame.island.posted.some(({ kind }) => kind === "failed");

/**
 * The reason of each failure the frame has told the island, in order.
 *
 * @param frame The frame.
 * @returns The reasons.
 */
const failuresIn = (frame: LoaderFrame): readonly string[] =>
  frame.island.posted.flatMap((message) => (message.kind === "failed" ? [message.reason] : []));

/**
 * Whether the frame has told the island its modules registered, so the route loaded.
 *
 * @param frame The frame.
 * @returns Whether a `registered` is among what it posted.
 */
const registeredIn = (frame: LoaderFrame): boolean =>
  frame.island.posted.some(({ kind }) => kind === "registered");

/**
 * The primary location every case's route has.
 */
const primary = "https://frame.example/modules/a.js";

/**
 * The fallback location of every case's route that has one.
 */
const fallbackAt = "https://frame.example/modules/fallback/a.js";

describe("a PCI frame's wait for a module script", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it("loads a primary with no fallback whose script arrives after the longest wait a timer holds", async () => {
    const frame = loadingFrame({ primary });

    await vi.advanceTimersByTimeAsync(longestTimerMs + 1);
    assert.isFalse(failedIn(frame), "no clock failed it");
    assert.deepStrictEqual(scriptsOf(frame), [primary], "nothing else was tried");
    arrive(frame, 0);
    await vi.advanceTimersByTimeAsync(0);
    assert.isTrue(registeredIn(frame), "it loaded when its script arrived");
    assert.isFalse(failedIn(frame), "and never failed");
  });

  // Bound: a second, and the longest wait a timer holds, 2,147,483.647 seconds.
  it.each([1, longestTimerMs / 1000])(
    "falls back once a primary's wait of %d s runs out, and waits for the fallback however long it takes",
    async (waitSeconds) => {
      const frame = loadingFrame({
        fallback: { location: fallbackAt, primaryWaitSeconds: waitSeconds },
        primary,
      });

      await vi.advanceTimersByTimeAsync(waitSeconds * 1000 - 1);
      assert.deepStrictEqual(
        scriptsOf(frame),
        [primary],
        "the primary alone, until its wait ran out",
      );
      await vi.advanceTimersByTimeAsync(1);
      assert.deepStrictEqual(scriptsOf(frame), [primary, fallbackAt], "then the fallback");
      await vi.advanceTimersByTimeAsync(longestTimerMs + 1);
      assert.isFalse(failedIn(frame), "no clock failed the fallback");
      arrive(frame, 1);
      await vi.advanceTimersByTimeAsync(0);
      assert.isTrue(registeredIn(frame), "it loaded when the fallback's script arrived");
      assert.isFalse(failedIn(frame), "and never failed");
    },
  );

  // Bound: 0, the first millisecond past a timer's longest delay, and 1e9 seconds, each waited out
  // ten times over.
  it.each([0, 2_147_483.648, 1e9])(
    "never times out a primary whose wait of %d s is no limit",
    async (waitSeconds) => {
      const frame = loadingFrame({
        fallback: { location: fallbackAt, primaryWaitSeconds: waitSeconds },
        primary,
      });

      await vi.advanceTimersByTimeAsync(Math.max(waitSeconds, 1) * 10_000);
      assert.deepStrictEqual(scriptsOf(frame), [primary], "no fallback was tried");
      assert.isFalse(failedIn(frame), "no limit");
      arrive(frame, 0);
      await vi.advanceTimersByTimeAsync(0);
      assert.isTrue(registeredIn(frame), "it loaded when its script arrived");
    },
  );

  it("fails a primary with no fallback as soon as its script loads defining no module", async () => {
    const frame = loadingFrame({ primary });

    fire(frame, 0, "load");
    await vi.advanceTimersByTimeAsync(0);
    assert.isTrue(failedIn(frame), "failed once its script had run");
  });

  it("refuses a module its script defines only in a task after its load", async () => {
    const frame = loadingFrame({ primary });

    fire(frame, 0, "load");
    await vi.advanceTimersByTimeAsync(0);
    frame.window.define?.(() => ({}));
    await vi.advanceTimersByTimeAsync(longestTimerMs + 1);
    assert.isTrue(failedIn(frame), "refused at its script's load");
    assert.isFalse(registeredIn(frame), "the define that came after registers nothing");
  });

  it("falls back as soon as a primary's script loads defining no module, and fails when the fallback's does too", async () => {
    const frame = loadingFrame({
      fallback: { location: fallbackAt, primaryWaitSeconds: 30 },
      primary,
    });

    fire(frame, 0, "load");
    await vi.advanceTimersByTimeAsync(0);
    assert.deepStrictEqual(
      scriptsOf(frame),
      [primary, fallbackAt],
      "the fallback, before the wait ran out",
    );
    assert.isFalse(failedIn(frame), "not yet failed");
    fire(frame, 1, "load");
    await vi.advanceTimersByTimeAsync(0);
    assert.isTrue(failedIn(frame), "failed once the fallback's script had run");
  });

  it("falls back at once when a primary's script does not load, and fails when the fallback's does not", async () => {
    const frame = loadingFrame({
      fallback: { location: fallbackAt, primaryWaitSeconds: 30 },
      primary,
    });

    fire(frame, 0, "error");
    await vi.advanceTimersByTimeAsync(0);
    assert.deepStrictEqual(
      scriptsOf(frame),
      [primary, fallbackAt],
      "the fallback, before the wait ran out",
    );
    assert.isFalse(failedIn(frame), "not yet failed");
    fire(frame, 1, "error");
    await vi.advanceTimersByTimeAsync(0);
    assert.isTrue(failedIn(frame), "failed once the fallback did not load");
  });

  it("names the primary's run-out wait beside the fallback's failure when both fail", async () => {
    const frame = loadingFrame({
      fallback: { location: fallbackAt, primaryWaitSeconds: 1 },
      primary,
    });

    await vi.advanceTimersByTimeAsync(1000);
    assert.deepStrictEqual(
      scriptsOf(frame),
      [primary, fallbackAt],
      "the fallback, once the wait ran out",
    );
    fire(frame, 1, "error");
    await vi.advanceTimersByTimeAsync(0);
    assert.deepStrictEqual(
      failuresIn(frame),
      [
        `The module script at ${primary} did not load within 1 seconds. The module script at ${fallbackAt} did not load.`,
      ],
      "one failure, the primary's reason first",
    );
  });

  it("loads a fallback alone at once, with no clock", async () => {
    const frame = loadingFrame({ fallback: { location: fallbackAt, primaryWaitSeconds: 1 } });

    assert.deepStrictEqual(scriptsOf(frame), [fallbackAt], "the fallback at once");
    await vi.advanceTimersByTimeAsync(longestTimerMs + 1);
    assert.isFalse(failedIn(frame), "no clock failed it");
    arrive(frame, 0);
    await vi.advanceTimersByTimeAsync(0);
    assert.isTrue(registeredIn(frame), "it loaded when its script arrived");
  });
});

/**
 * A window other than the island: what is posted to it, in order.
 */
interface Elsewhere {
  readonly posted: FrameToPage[];
  readonly postMessage: (message: FrameToPage) => void;
}

/**
 * The response the fixture PCI gives, in the Appendix C JSON binding.
 */
interface FixtureResponse {
  readonly base: { readonly integer: number };
}

/**
 * The fixture PCI's object: the two readers the frame calls.
 */
interface FixtureInstance {
  readonly getResponse: () => FixtureResponse;
  readonly getState: () => string;
}

/**
 * What of the configuration the frame hands it the fixture PCI reads: the bridge's `onready`.
 */
interface FixtureConfiguration {
  readonly onready: (instance: FixtureInstance, state: string) => void;
}

/**
 * The fixture PCI's factory, as it registers it with the bridge.
 */
interface FixtureFactory {
  readonly getInstance: (dom: HTMLElement, configuration: FixtureConfiguration) => FixtureInstance;
  readonly typeIdentifier: string;
}

/**
 * The bridge, as the fixture PCI's module reads it: `register`.
 */
interface FixtureContext {
  readonly register: (factory: FixtureFactory) => void;
}

/**
 * The frame's AMD `define`, as the fixture PCI's module calls it: its dependencies, and a factory
 * that takes the bridge.
 */
type FixtureDefine = (
  dependencies: readonly string[],
  factory: (context: FixtureContext) => void,
) => void;

/**
 * The frame's window in the test's document: the listeners the frame adds, `define` once the frame
 * installs it, and `parent`, which a PCI can put its own window in place of.
 */
interface FrameWindow {
  readonly addEventListener: (
    type: string,
    listener: (message: Partial<IslandMessage>) => void,
  ) => void;
  define?: FixtureDefine;
  parent: Elsewhere | Island;
}

/**
 * An element the frame makes, with the listeners it adds to it by event type.
 */
interface Made {
  readonly listeners: Map<string, (event: Event) => void>;
}

/**
 * A frame booted in the test's document under an island: the island and what it was posted, a wait
 * that ends once the frame has posted `registered`, the frame's window, the elements the frame made
 * in order, and a way to post the frame a message from a window, the island or another, through
 * the frame's own `message` listener; and the frame's other inputs: its `resize`, its timers run, a
 * mutation of its document, and a content event at its document.
 */
interface Booted {
  readonly island: Island;
  readonly later: () => void;
  readonly made: readonly Made[];
  readonly mutated: () => void;
  readonly receive: (message: PageMessage, source: Elsewhere | Island) => void;
  readonly registered: Promise<null>;
  readonly resized: () => void;
  readonly signalled: (type: string) => void;
  readonly window: FrameWindow;
}

/**
 * Make an element of the test's document that keeps the listeners the frame adds to it.
 *
 * @param made The elements made so far, which it joins.
 * @returns The element.
 */
const keptElement = (made: Made[]) => {
  const listeners = new Map<string, (event: Event) => void>();

  made.push({ listeners });

  return {
    addEventListener: (type: string, listener: (event: Event) => void) => {
      listeners.set(type, listener);
    },
    append: () => {},
    dataset: {},
    innerHTML: "",
  };
};

/**
 * The test document's element, as the frame reads and sets it: its direction and language, its
 * data states, and its box's height.
 */
interface Root {
  readonly dataset: { padded?: string };
  dir: string;
  readonly getBoundingClientRect: () => { readonly height: number };
  lang: string;
}

/**
 * A `ResizeObserver` the frame constructs, given the frame's callback.
 */
type ObserverClass = new (callback: (entries: readonly ResizeObserverEntry[]) => void) => {
  readonly observe: (target: Element, ...options: readonly ResizeObserverOptions[]) => void;
};

/**
 * Give the test document's element when no layout matters: no padding, and a box of no height.
 *
 * @returns The element.
 */
const plainRoot = (): Root => ({
  dataset: {},
  dir: "",
  getBoundingClientRect: () => ({ height: 0 }),
  lang: "",
});

/**
 * What `getComputedStyle` answers for an element of the test's document: its writing mode.
 */
type ComputedOf = (element: Root) => { readonly writingMode: string };

/**
 * What `getComputedStyle` answers where no case sets a writing mode: `horizontal-tb`, for every
 * element.
 *
 * @returns The answer.
 */
const horizontalOnly: ComputedOf = () => ({ writingMode: "horizontal-tb" });

/**
 * Boot a frame in the test's document under an island.
 *
 * @param root The document's element.
 * @param observer The `ResizeObserver` the frame constructs.
 * @param computedOf What `getComputedStyle` answers, element by element.
 * @param viewportHeight The frame's viewport's height now, which `matchMedia` answers by.
 * @returns The frame, booted.
 */
const booted = (
  root: Root,
  observer: ObserverClass,
  computedOf: ComputedOf,
  viewportHeight: () => number,
): Booted => {
  const posted: FrameToPage[] = [];
  const registered = Promise.withResolvers<null>();
  const island: Island = {
    postMessage: (message) => {
      posted.push(message);

      if (message.kind === "registered") {
        registered.resolve(null);
      }
    },
    posted,
  };
  const made: Made[] = [];
  const listeners = new Map<string, (message: Partial<IslandMessage>) => void>();
  const onDocument = new Map<string, () => void>();
  const mutations: (() => void)[] = [];
  const timers: (() => void)[] = [];
  const frameWindow: FrameWindow = {
    addEventListener: (type, listener) => {
      listeners.set(type, listener);
    },
    parent: island,
  };

  vi.stubGlobal("location", { hash: `#${nonce}` });
  vi.stubGlobal("window", frameWindow);
  vi.stubGlobal("document", {
    addEventListener: (type: string, listener: () => void) => {
      onDocument.set(type, listener);
    },
    body: elementOf(),
    createElement: () => keptElement(made),
    documentElement: root,
    fonts: { addEventListener: () => {} },
    head: elementOf(),
    styleSheets: [],
    title: "",
  });
  vi.stubGlobal("ResizeObserver", observer);
  vi.stubGlobal("getComputedStyle", computedOf);
  vi.stubGlobal(
    "MutationObserver",
    class {
      readonly observed: Document[] = [];

      constructor(report: () => void) {
        mutations.push(report);
      }

      observe(target: Document): void {
        this.observed.push(target);
      }
    },
  );
  vi.stubGlobal("matchMedia", (query: string) => ({
    matches: query === `(height: ${String(viewportHeight())}px)`,
  }));
  vi.stubGlobal("setTimeout", (later: () => void) => timers.push(later));
  bootFrame();

  return {
    island,
    later: () => {
      for (const timer of timers.splice(0)) {
        timer();
      }
    },
    made,
    mutated: () => {
      for (const report of mutations) {
        report();
      }
    },
    receive: (message, source) => {
      listeners.get("message")?.({ data: message, source });
    },
    registered: registered.promise,
    resized: () => {
      listeners.get("resize")?.({});
    },
    signalled: (type) => {
      onDocument.get(type)?.();
    },
    window: frameWindow,
  };
};

/**
 * The fixture PCI's module, as its script runs it: a PCI whose `getInstance` puts a window of its
 * own in place of `parent`, as a classic script's top-level `var parent = …` would, then tells the
 * bridge it is ready.
 *
 * @param fixture The PCI's frame, the window it puts in place of `parent`, its response and its
 *   type identifier.
 * @param fixture.elsewhere The window it puts in place of `parent`.
 * @param fixture.frame The frame it runs in.
 * @param fixture.response Its response.
 * @param fixture.typeIdentifier Its type identifier.
 * @returns The module's factory, which registers the PCI with the bridge.
 */
const parentTaking =
  (fixture: {
    readonly elsewhere: Elsewhere;
    readonly frame: Booted;
    readonly response: FixtureResponse;
    readonly typeIdentifier: string;
  }) =>
  (context: FixtureContext): void => {
    context.register({
      getInstance: (_dom, configuration) => {
        fixture.frame.window.parent = fixture.elsewhere;

        const instance: FixtureInstance = {
          getResponse: () => fixture.response,
          getState: () => "",
        };

        configuration.onready(instance, "");

        return instance;
      },
      typeIdentifier: fixture.typeIdentifier,
    });
  };

/**
 * The island's `load` for one route, `a`, a primary with no fallback, so waited for with no clock,
 * and no markup.
 */
const loadOfA: PageMessage = {
  dir: "ltr",
  entry: "a",
  kind: "load",
  lang: "en",
  markup: "",
  nonce,
  routes: [{ id: "a", primary: "modules/a.js" }],
  templates: [],
  title: "PCI",
};

/**
 * Give the island's choice of a factory, its configuration the plainest one.
 *
 * @param typeIdentifier The factory's type identifier.
 * @returns The island's `instantiate`.
 */
const instantiateOf = (typeIdentifier: string): PageMessage => ({
  configuration: {
    boundTo: {},
    contextVariables: {},
    properties: {},
    responseIdentifier: "RESPONSE",
    status: "interacting",
    templateVariables: {},
  },
  kind: "instantiate",
  nonce,
  state: undefined,
  typeIdentifier,
});

describe("a PCI that puts its own window in place of the frame's `parent`", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("still has every response relayed to the island, and the island's messages taken", async () => {
    const frame = booted(plainRoot(), NotedObserver, horizontalOnly, () => 0);
    const elsewherePosted: FrameToPage[] = [];
    const elsewhere: Elsewhere = {
      postMessage: (message) => {
        elsewherePosted.push(message);
      },
      posted: elsewherePosted,
    };
    const response: FixtureResponse = { base: { integer: 1 } };
    const typeIdentifier = "urn:qti-pie:test:parent";

    frame.receive(loadOfA, frame.island);
    frame.window.define?.(
      ["qtiCustomInteractionContext"],
      parentTaking({ elsewhere, frame, response, typeIdentifier }),
    );
    frame.made[1]?.listeners.get("load")?.(new Event("load"));
    await frame.registered;
    frame.receive(instantiateOf(typeIdentifier), frame.island);
    frame.made[0]?.listeners.get("qti-interaction-changed")?.(
      new CustomEvent("qti-interaction-changed", { detail: { value: response } }),
    );
    frame.receive({ kind: "complete", nonce }, elsewhere);
    assert.deepStrictEqual(
      frame.island.posted.map(({ kind }) => kind),
      ["booted", "registered", "ready", "changed"],
      "a `complete` from the PCI's own window, the frame's `parent` now, is not the island's, and the frame does nothing for it",
    );
    frame.receive({ kind: "complete", nonce }, frame.island);

    assert.deepStrictEqual(
      frame.island.posted.map(({ kind }) => kind),
      ["booted", "registered", "ready", "changed", "completed"],
      "the island hears the PCI ready, its response, and its completion, which it asked for after the PCI took `parent`",
    );
    assert.deepStrictEqual(
      elsewhere.posted,
      [],
      "the PCI's own window hears nothing of the frame's",
    );
  });
});

/**
 * The attributes of the frame's window a script of the frame can put its own value in place of, so
 * that a read after the PCI's scripts have run gives the PCI's value, or that name another window:
 *
 * - HTML's `[Replaceable]` ones: `self`, `navigation`, the six bars (`locationbar`, `menubar`,
 *   `personalbar`, `scrollbars`, `statusbar`, `toolbar`), `frames`, `length`, `parent`,
 *   `clientInformation`, the obsolete `external`, and `WindowOrWorkerGlobalScope`'s `origin`;
 * - HTML's settable `name`, `status` and `opener`, and its unforgeable `top`, another window;
 * - The DOM Standard's `[Replaceable]` `event`;
 * - CSSOM View's fifteen `[Replaceable]` sizes and places.
 *
 * @source HTML's `Window` interface, its obsolete features' `partial interface Window` and the
 *   `WindowOrWorkerGlobalScope` mixin; the DOM Standard's `partial interface Window`; CSSOM View's
 *   `partial interface Window`.
 * @see https://html.spec.whatwg.org/multipage/nav-history-apis.html#the-window-object
 * @see https://html.spec.whatwg.org/multipage/obsolete.html#Window-partial
 * @see https://dom.spec.whatwg.org/#interface-window-extensions
 * @see https://drafts.csswg.org/cssom-view/#extensions-to-the-window-interface
 */
const replaceable: ReadonlySet<string> = new Set([
  "clientInformation",
  "devicePixelRatio",
  "event",
  "external",
  "frames",
  "innerHeight",
  "innerWidth",
  "length",
  "locationbar",
  "menubar",
  "name",
  "navigation",
  "opener",
  "origin",
  "outerHeight",
  "outerWidth",
  "pageXOffset",
  "pageYOffset",
  "parent",
  "personalbar",
  "screen",
  "screenLeft",
  "screenTop",
  "screenX",
  "screenY",
  "scrollbars",
  "scrollX",
  "scrollY",
  "self",
  "status",
  "statusbar",
  "toolbar",
  "top",
  "visualViewport",
]);

/**
 * The members that reach a window from something else: a window's own `window` and `globalThis`,
 * and a document's `defaultView`.
 */
const windowMembers: ReadonlySet<string> = new Set(["defaultView", "globalThis", "window"]);

/**
 * The names a script reaches its own window by.
 */
const windowNames: ReadonlySet<string> = new Set(["globalThis", "window"]);

/**
 * A scope of a parsed script: the names declared in it, the scope it stands in, and whether it is
 * a function's, which `var` declares into.
 */
interface Scope {
  readonly function: boolean;
  readonly names: Set<string>;
  readonly outer: Scope | null;
}

/**
 * A read the scan found, judged once every scope holds all its declarations: a bare name, or an
 * attribute of the window by one of its names, and whether it is `host`'s own declaration.
 */
interface Read {
  readonly attribute: string;
  readonly host: boolean;
  readonly object: string | null;
  readonly scope: Scope;
}

/**
 * Tell whether a name is declared in a scope or one it stands in.
 *
 * @param scope The scope.
 * @param name The name.
 * @returns Whether it is.
 */
const declaredIn = (scope: Scope | null, name: string): boolean =>
  scope !== null && (scope.names.has(name) || declaredIn(scope.outer, name));

/**
 * Give the scope a `var` declares into: the nearest function's.
 *
 * @param scope The scope it is written in.
 * @returns The function's scope.
 */
const functionOf = (scope: Scope): Scope =>
  scope.function || scope.outer === null ? scope : functionOf(scope.outer);

/**
 * Declare the names a binding pattern binds in a scope, and mark its own names, the bindings and
 * an object pattern's keys, as reading nothing.
 *
 * @param pattern The pattern: a name, an object or array pattern, a rest or a default.
 * @param scope The scope.
 * @param unread The names that read nothing, which it adds to.
 */
const declare = (
  pattern: BindingPattern | BindingRestElement | ParamPattern | null,
  scope: Scope,
  unread: WeakSet<Node>,
): void => {
  if (pattern === null) {
    return;
  }

  if (pattern.type === "Identifier") {
    scope.names.add(pattern.name);
    unread.add(pattern);

    return;
  }

  if (pattern.type === "AssignmentPattern") {
    declare(pattern.left, scope, unread);

    return;
  }

  if (pattern.type === "RestElement") {
    declare(pattern.argument, scope, unread);

    return;
  }

  if (pattern.type === "TSParameterProperty") {
    declare(pattern.parameter, scope, unread);

    return;
  }

  if (pattern.type === "ArrayPattern") {
    for (const element of pattern.elements) {
      declare(element, scope, unread);
    }

    return;
  }

  for (const property of pattern.properties) {
    if (property.type === "RestElement") {
      declare(property.argument, scope, unread);
    } else {
      unread.add(property.key);
      declare(property.value, scope, unread);
    }
  }
};

/**
 * Give the name a member's key writes: an identifier's, a string's, or a template's with no
 * substitution; `null` for any other computed key.
 *
 * @param member The member expression.
 * @returns The name.
 */
const memberNameOf = (member: MemberExpression): string | null => {
  const key = member.property;

  if (!member.computed) {
    return key.type === "Identifier" ? key.name : null;
  }

  if (key.type === "Literal") {
    return Predicate.isString(key.value) ? key.value : null;
  }

  return key.type === "TemplateLiteral" && key.expressions.length === 0
    ? (key.quasis[0]?.value.cooked ?? null)
    : null;
};

/**
 * Give the names an assignment's target assigns: a name, or each name of an array or object
 * pattern, with its defaults and rests.
 *
 * @param target The target.
 * @returns The names.
 */
const assignedNames = (target: Node | null): readonly string[] => {
  if (target?.type === "Identifier") {
    return [target.name];
  }

  if (target?.type === "ArrayPattern") {
    return target.elements.flatMap((element) => assignedNames(element));
  }

  if (target?.type === "ObjectPattern") {
    return target.properties.flatMap((property) =>
      assignedNames(property.type === "RestElement" ? property.argument : property.value),
    );
  }

  if (target?.type === "AssignmentPattern") {
    return assignedNames(target.left);
  }

  return target?.type === "RestElement" ? assignedNames(target.argument) : [];
};

/**
 * Find, in a script's source, every way it could read a replaceable attribute of its window but
 * `parent`, once, as `const host = window.parent` in the script's own top-level body:
 *
 * - A bare name no scope of the script declares, scopes resolved as JavaScript's: a block's, a
 *   `switch`'s, a `for` head's, a `catch`'s, a function's parameters', and its body's own `var`s
 *   apart from them;
 * - An attribute of `window` or `globalThis`, where neither is declared either;
 * - Any other use of `window` or `globalThis` than a member access by a name or a string, which could
 *   reach any attribute: an index, a destructuring, an alias, a sequence. `Object.assign(window,
 *   …)` alone is allowed, as a statement, the boot's way to install its `define`, so that the
 *   window it gives is never used;
 * - Any `.window`, `.globalThis` or `.defaultView` member, another way to the window, written as a
 *   name or as a string;
 * - Any `this` that no function, class field or static block of the script's own binds: the boot's
 *   arrows take theirs from the script's top, the window;
 * - Any assignment to `host`, and a `host` declared other than as a `const`.
 *
 * A computed member whose key is a string, or a template with no substitution, is read as the
 * member it names. A class's static block is a function's scope, as its `var`s are its own.
 *
 * @param source The script's source: a function's, as `String(bootFrame)` gives it.
 * @returns Each read found, as the script writes it, a window member as its member's name, a
 *   `this` as `this`, an assignment to `host` as `host =`; and, where `host`'s `const` is not
 *   there exactly once, a note of how many there are.
 * @constraint A syntactic scan cannot follow a value: an event's `view`, `source`,
 *   `currentTarget` or `target` is the window too, as is anything a function returns. The run in
 *   a `node:vm` context (`ran`) records those, on every way it enters the boot; the scan holds
 *   every path by name, the paths the run does not take among them.
 * @constraint The parser and its `Visitor` come from `oxc-parser/src-js`, the package's entry for
 *   Node, where the suite runs. Its bare `oxc-parser` resolves, under the `browser` condition
 *   plate's `src/` is typed by, to its WebAssembly entry, which exports `Visitor` as a type alone.
 * @source `oxc-parser` 0.159.0: `package.json`'s `exports` (`"./src-js"`, and `"."`'s `browser`),
 *   `src-js/index.d.ts` and `src-js/wasm.d.ts`.
 */
const replaceableReads = (source: string): readonly string[] => {
  const { errors, program } = parseSync("boot.js", `(${source});`, { lang: "js" });
  const unread = new WeakSet<Node>();
  const allowed = new WeakSet<Node>();
  const bodies = new WeakSet<Node>();
  const hostInits = new WeakSet<Node>();
  const kinds: string[] = [];
  const reads: Read[] = [];
  let scope: Scope = { function: true, names: new Set(), outer: null };
  let bootBody: Scope | null = null;
  let binders = 0;
  const enter = (isFunction: boolean): void => {
    scope = { function: isFunction, names: new Set(), outer: scope };
  };
  const leave = (): void => {
    scope = scope.outer ?? scope;
  };
  const block = (): void => {
    enter(false);
  };
  const blockOrBody = (node: Node): void => {
    enter(bodies.has(node));

    if (bodies.has(node) && bootBody === null) {
      bootBody = scope;
    }
  };
  const started = (node: ArrowFunctionExpression | ParsedFunction): void => {
    if (node.type === "FunctionDeclaration") {
      declare(node.id, scope, unread);
    }

    enter(false);

    if (node.type === "FunctionExpression") {
      declare(node.id, scope, unread);
    }

    for (const param of node.params) {
      declare(param, scope, unread);
    }

    if (node.body?.type === "BlockStatement") {
      bodies.add(node.body);
    }
  };
  const keyOnly = (node: { readonly computed: boolean; readonly key: Node }): void => {
    if (!node.computed) {
      unread.add(node.key);
    }
  };
  const binding = (): void => {
    binders += 1;
  };
  const unbinding = (): void => {
    binders -= 1;
  };
  const fault = (attribute: string): void => {
    reads.push({ attribute, host: false, object: null, scope });
  };

  new Visitor({
    ArrowFunctionExpression: started,
    "ArrowFunctionExpression:exit": leave,
    AssignmentExpression: (node) => {
      if (assignedNames(node.left).includes("host")) {
        fault("host =");
      }
    },
    BlockStatement: blockOrBody,
    "BlockStatement:exit": leave,
    BreakStatement: (node) => {
      if (node.label !== null) {
        unread.add(node.label);
      }
    },
    CatchClause: (node) => {
      enter(false);
      declare(node.param, scope, unread);
    },
    "CatchClause:exit": leave,
    ContinueStatement: (node) => {
      if (node.label !== null) {
        unread.add(node.label);
      }
    },
    ExpressionStatement: (node) => {
      const call = node.expression;

      if (call.type !== "CallExpression" || call.callee.type !== "MemberExpression") {
        return;
      }

      const [first] = call.arguments;

      if (
        call.callee.object.type === "Identifier" &&
        call.callee.object.name === "Object" &&
        memberNameOf(call.callee) === "assign" &&
        first?.type === "Identifier" &&
        first.name === "window"
      ) {
        allowed.add(first);
      }
    },
    ForInStatement: block,
    "ForInStatement:exit": leave,
    ForOfStatement: block,
    "ForOfStatement:exit": leave,
    ForStatement: block,
    "ForStatement:exit": leave,
    FunctionDeclaration: (node) => {
      started(node);
      binding();
    },
    "FunctionDeclaration:exit": () => {
      leave();
      unbinding();
    },
    FunctionExpression: (node) => {
      started(node);
      binding();
    },
    "FunctionExpression:exit": () => {
      leave();
      unbinding();
    },
    Identifier: (node) => {
      const read =
        !unread.has(node) &&
        (replaceable.has(node.name) || (windowNames.has(node.name) && !allowed.has(node)));

      if (read) {
        reads.push({ attribute: node.name, host: false, object: null, scope });
      }
    },
    LabeledStatement: (node) => {
      unread.add(node.label);
    },
    MemberExpression: (node) => {
      const named = memberNameOf(node);

      if (!node.computed) {
        unread.add(node.property);
      }

      if (
        named !== null &&
        node.object.type === "Identifier" &&
        windowNames.has(node.object.name)
      ) {
        allowed.add(node.object);
      }

      if (named !== null && windowMembers.has(named)) {
        reads.push({ attribute: `.${named}`, host: false, object: null, scope });
      }

      if (
        node.object.type === "Identifier" &&
        windowNames.has(node.object.name) &&
        named !== null &&
        replaceable.has(named)
      ) {
        reads.push({
          attribute: named,
          host: hostInits.has(node),
          object: node.object.name,
          scope,
        });
      }
    },
    MethodDefinition: keyOnly,
    Property: keyOnly,
    PropertyDefinition: (node) => {
      keyOnly(node);
      binding();
    },
    "PropertyDefinition:exit": unbinding,
    StaticBlock: () => {
      enter(true);
      binding();
    },
    "StaticBlock:exit": () => {
      leave();
      unbinding();
    },
    SwitchStatement: block,
    "SwitchStatement:exit": leave,
    ThisExpression: () => {
      if (binders === 0) {
        fault("this");
      }
    },
    UpdateExpression: (node) => {
      if (assignedNames(node.argument).includes("host")) {
        fault("host =");
      }
    },
    VariableDeclaration: (node) => {
      kinds.push(node.kind);
    },
    "VariableDeclaration:exit": () => {
      kinds.pop();
    },
    VariableDeclarator: (node) => {
      declare(node.id, kinds.at(-1) === "var" ? functionOf(scope) : scope, unread);

      if (
        node.id.type === "Identifier" &&
        node.id.name === "host" &&
        node.init !== null &&
        kinds.at(-1) === "const" &&
        scope === bootBody
      ) {
        hostInits.add(node.init);
      }
    },
  }).visit(program);

  const global = reads.filter(
    (read) =>
      read.attribute === "this" ||
      read.attribute === "host =" ||
      !declaredIn(read.scope, read.object ?? read.attribute),
  );
  const hosts = global.filter((read) => read.host && read.object === "window");
  const found = global
    .filter((read) => !(read.host && read.object === "window"))
    .map((read) => (read.object === null ? read.attribute : `${read.object}.${read.attribute}`));

  return [
    ...errors.map((error) => `a parse error: ${error.message}`),
    ...found,
    ...(hosts.length === 1 ? [] : [`${String(hosts.length)} declarations of host`]),
  ];
};

describe("the frame's boot", () => {
  it("reads no attribute of its window a script can replace, but `parent`, once, as `host`", () => {
    assert.deepStrictEqual(
      replaceableReads(
        "function () { const host = window.parent; const name = 1; for (const event of []) { use(event); } return [name, self, window.top, globalThis.origin, length, event]; }",
      ),
      ["self", "window.top", "globalThis.origin", "length", "event"],
      "the scan finds a planted read of each kind, and none of a name the script declares",
    );
    assert.deepStrictEqual(
      replaceableReads(
        "function () { const host = window.parent; return [toolbar, clientInformation, navigation]; }",
      ),
      ["toolbar", "clientInformation", "navigation"],
      "the scan knows HTML's bars, `clientInformation` and `navigation`",
    );
    assert.deepStrictEqual(
      replaceableReads(
        "function () { const host = window.parent; switch (1) { case 1: const length = 2; } return length; }",
      ),
      ["length"],
      "a `const` of a `switch` case is the switch's, not the read's after it (COLD's P6)",
    );
    assert.deepStrictEqual(
      replaceableReads(
        "function () { const host = window.parent; function f(x = self) { var self; return x; } return f; }",
      ),
      ["self"],
      "a parameter's default reads past the body's own `var` of the same name (COLD's P7)",
    );
    assert.deepStrictEqual(
      replaceableReads(
        'function () { const host = window.parent; const key = "parent"; return window[key]; }',
      ),
      ["window"],
      "an index of the window is a fault",
    );
    assert.deepStrictEqual(
      replaceableReads(
        'function () { const host = window.parent; return [window["parent"], window[`top`]]; }',
      ),
      ["window.parent", "window.top"],
      "a member by a string or a plain template is the member it names",
    );
    assert.deepStrictEqual(
      replaceableReads(
        'function () { const host = window.parent; return [document["defaultView"].parent, document.body.ownerDocument[`defaultView`]]; }',
      ),
      [".defaultView", ".defaultView"],
      "a document's `defaultView` by a string is a fault (COLD's Q3 and Q11)",
    );
    assert.deepStrictEqual(
      replaceableReads(
        "() => { const host = window.parent; const f = function () { return this; }; class C { x = this; static { this.y = 1; } } return [() => this.parent, f, C]; }",
      ),
      ["this"],
      "a `this` the script's top gives, the window, is a fault, and one a function, a field or a static block binds is not (COLD's Q1)",
    );
    assert.deepStrictEqual(
      replaceableReads(
        "function () { const host = window.parent; Object.assign(window, {}); return Object.assign(window, {}).parent; }",
      ),
      ["window"],
      "`Object.assign(window, …)` is allowed only as a statement, whose window goes unused (COLD's Q2)",
    );
    assert.deepStrictEqual(
      replaceableReads(
        "function () { const host = window.parent; class C { static { const name = 1; } } return [C, name]; }",
      ),
      ["name"],
      "a static block's declarations are its own, not the read's after it (COLD's Q6)",
    );
    assert.deepStrictEqual(
      replaceableReads(
        "function () { let host = window.parent; const later = () => { host = window.parent; }; return later; }",
      ),
      ["window.parent", "host =", "window.parent", "0 declarations of host"],
      "`host` counts only as a `const`, and an assignment to it is a fault (COLD's Q8)",
    );
    assert.deepStrictEqual(
      replaceableReads(
        "function () { const host = window.parent; const { parent: p } = window; return p; }",
      ),
      ["window"],
      "a destructuring of the window is a fault",
    );
    assert.deepStrictEqual(
      replaceableReads(
        "function () { const host = window.parent; const w = window; return w.parent; }",
      ),
      ["window"],
      "an alias of the window is a fault",
    );
    assert.deepStrictEqual(
      replaceableReads(
        "function () { const host = window.parent; return document.defaultView.parent; }",
      ),
      [".defaultView"],
      "a document's `defaultView` is a fault",
    );
    assert.deepStrictEqual(
      replaceableReads("function () { const host = window.parent; return window.window.parent; }"),
      [".window"],
      "a window's own `window` is a fault",
    );
    assert.deepStrictEqual(
      replaceableReads("function () { const host = window.parent; return (0, window).parent; }"),
      ["window"],
      "the window in a sequence is a fault",
    );
    assert.deepStrictEqual(
      replaceableReads(
        "function () { const post = () => { const host = window.parent; return host; }; return post; }",
      ),
      ["window.parent", "0 declarations of host"],
      "`host` counts only in the script's own top-level body, not in a function it runs later (COLD's P8)",
    );
    assert.deepStrictEqual(
      replaceableReads(String(bootFrame)),
      [],
      "the boot reads its parent once, as `host`, and no other attribute a PCI's script could put its own value in place of",
    );
  });
});

/**
 * The frame's document laid out at one height of the frame: the root's border box in its used
 * writing mode, its inline and block sizes, and its content box's block size, each in the root's
 * own pixels, as a `ResizeObserver` reports them; its bounding rectangle's height, transforms and
 * zoom applied; and the height the document takes in the frame, what it paints and the margins
 * around it, in the frame's pixels.
 */
interface Laid {
  readonly block: number;
  readonly content: number;
  readonly inline: number;
  readonly rect: number;
  readonly taken: number;
}

/**
 * A box a `ResizeObserver` of the test's layout watches: the box it was asked for, the frame's
 * callback, that box's sizes when it last reported them, and the element.
 */
interface Watched {
  readonly box: ResizeObserverBoxOptions;
  last: string;
  readonly report: (entries: readonly ResizeObserverEntry[]) => void;
  readonly target: Element;
}

/**
 * A layout for the test's document: its element; a `ResizeObserver` that, as a browser's, reports
 * a change of the box it was asked to observe and of no other; the layout's step, which lays the
 * document out at the frame's height and delivers each observation due; and the viewport's height
 * it was last laid out at.
 */
interface Layout {
  readonly layOut: (height: number) => Laid;
  readonly observer: ObserverClass;
  readonly root: Root;
  readonly viewport: () => number;
}

/**
 * Give the observation of a document element laid out as given.
 *
 * @param target The element.
 * @param laid Its layout.
 * @returns The observation's entry.
 */
const entryOf = (target: Element, laid: Laid): ResizeObserverEntry => ({
  borderBoxSize: [{ blockSize: laid.block, inlineSize: laid.inline }],
  contentBoxSize: [{ blockSize: laid.content, inlineSize: laid.inline }],
  contentRect: {
    bottom: laid.content,
    height: laid.content,
    left: 0,
    right: laid.inline,
    toJSON: () => ({ height: laid.content, width: laid.inline }),
    top: 0,
    width: laid.inline,
    x: 0,
    y: 0,
  },
  devicePixelContentBoxSize: [{ blockSize: laid.content, inlineSize: laid.inline }],
  target,
});

/**
 * The frame's width, and its height before it has posted one, in CSS pixels: an iframe 600 px
 * wide and 300 px tall, as COLD's probe had it.
 */
const iframe = { firstHeight: 300, width: 600 } as const;

/**
 * Lay the test's document out as a browser would, observed by the frame's `ResizeObserver`.
 *
 * @param laidAt The document's layout at a height of the frame.
 * @param dataset The document element's data states, which the layout may read.
 * @returns The layout.
 */
const observedLayout = (laidAt: (height: number) => Laid, dataset: Root["dataset"]): Layout => {
  const watched: Watched[] = [];
  let laid = laidAt(iframe.firstHeight);
  let viewport: number = iframe.firstHeight;

  return {
    layOut: (height) => {
      viewport = height;
      laid = laidAt(height);

      for (const each of watched) {
        const block = each.box === "border-box" ? laid.block : laid.content;
        const size = `${String(laid.inline)} ${String(block)}`;

        if (size !== each.last) {
          each.last = size;
          each.report([entryOf(each.target, laid)]);
        }
      }

      return laid;
    },
    observer: class {
      readonly #report: (entries: readonly ResizeObserverEntry[]) => void;

      constructor(report: (entries: readonly ResizeObserverEntry[]) => void) {
        this.#report = report;
      }

      observe(target: Element, ...options: readonly ResizeObserverOptions[]): void {
        watched.push({
          box: options[0]?.box ?? "content-box",
          last: "",
          report: this.#report,
          target,
        });
      }
    },
    root: {
      dataset,
      dir: "",
      getBoundingClientRect: () => ({ height: laid.rect }),
      lang: "",
    },
    viewport: () => viewport,
  };
};

/**
 * Lay the test's document out: its element 410 px of content, its bottom padding 40 px where its
 * `data-padded` state is on, as a stylesheet rule keyed on that state would lay it out.
 *
 * @returns The layout.
 */
const paddedLayout = (): Layout => {
  const content = 410;
  const dataset: Root["dataset"] = {};

  return observedLayout(() => {
    const border = content + (dataset.padded === undefined ? 0 : 40);

    return { block: border, content, inline: 1000, rect: border, taken: border };
  }, dataset);
};

/**
 * The fixture PCI's module, as its script runs it: a PCI whose `getInstance` turns on its
 * document's element's `data-padded` state, which grows that element's own bottom padding by 40 px,
 * a change of its border box and not of its content box, then tells the bridge it is ready.
 *
 * @param typeIdentifier Its type identifier.
 * @returns The module's factory, which registers the PCI with the bridge.
 */
const paddingGrowing =
  (typeIdentifier: string) =>
  (context: FixtureContext): void => {
    context.register({
      getInstance: (_dom, configuration) => {
        document.documentElement.dataset["padded"] = "";

        const instance: FixtureInstance = {
          getResponse: () => ({ base: { integer: 0 } }),
          getState: () => "",
        };

        configuration.onready(instance, "");

        return instance;
      },
      typeIdentifier,
    });
  };

/**
 * The heights a frame posted the island, in order.
 *
 * @param island The island.
 * @returns The heights, in pixels.
 */
const heightsOf = (island: Island): readonly number[] =>
  island.posted.flatMap((message) => (message.kind === "height" ? [message.pixels] : []));

describe("a PCI that grows its frame's root element's own padding", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("has the frame post the root's new height, its border box's", async () => {
    const layout = paddedLayout();
    const booting = booted(layout.root, layout.observer, horizontalOnly, layout.viewport);
    const typeIdentifier = "urn:qti-pie:test:padding";

    booting.receive(loadOfA, booting.island);
    layout.layOut(iframe.firstHeight);
    booting.window.define?.(["qtiCustomInteractionContext"], paddingGrowing(typeIdentifier));
    booting.made[1]?.listeners.get("load")?.(new Event("load"));
    await booting.registered;
    booting.receive(instantiateOf(typeIdentifier), booting.island);
    layout.layOut(iframe.firstHeight);

    assert.deepStrictEqual(
      heightsOf(booting.island),
      [410, 450],
      "the frame posts its height once laid out with its markup, and again once the PCI's padding grows it by 40 px",
    );
  });
});

/**
 * A declaration a stylesheet or a `style` attribute makes on an element: its value, and whether it
 * is `!important`.
 */
interface Declared {
  readonly important: boolean;
  readonly value: string;
}

/**
 * The declarations a stylesheet or a `style` attribute makes on one element, by property.
 */
type Declarations = ReadonlyMap<string, Declared>;

/**
 * The longhands a one-value `margin` sets, the ones the test's layout reads.
 */
const marginSides = ["margin-bottom", "margin-left", "margin-right", "margin-top"] as const;

/**
 * Read declarations as a `style` attribute or a rule's block writes them: `property: value`, each
 * ended by `;`, and `!important` where it is. A `margin` of one value sets each of its sides.
 *
 * @param text The declarations' text.
 * @returns The declarations.
 */
const declarationsOf = (text: string): Declarations =>
  new Map(
    text.split(";").flatMap((written): (readonly [string, Declared])[] => {
      const [named = "", ...rest] = written.split(":");
      const property = named.trim();
      const stated = rest.join(":").trim();
      const important = stated.endsWith("!important");
      const declared = {
        important,
        value: important ? stated.slice(0, -"!important".length).trim() : stated,
      };

      if (property === "") {
        return [];
      }

      return property === "margin"
        ? marginSides.map((side) => [side, declared] as const)
        : [[property, declared] as const];
    }),
  );

/**
 * The initial value of each property the test's layout reads, where neither the frame page nor a
 * PCI's stylesheet sets it.
 */
const initialValues: ReadonlyMap<string, string> = new Map([
  ["contain", "none"],
  ["content-visibility", "visible"],
  ["height", "auto"],
  ["margin-bottom", "0"],
  ["margin-left", "0"],
  ["margin-right", "0"],
  ["margin-top", "0"],
  ["max-height", "none"],
  ["min-height", "auto"],
  ["offset-path", "none"],
  ["overflow-y", "visible"],
  ["padding-bottom", "0"],
  ["position", "static"],
  ["rotate", "none"],
  ["scale", "none"],
  ["transform", "none"],
  ["translate", "none"],
  ["writing-mode", "horizontal-tb"],
  ["zoom", "1"],
]);

/**
 * The declarations the frame's root and body carry from one source: the frame page's pins, a
 * PCI's stylesheet, or its script's writes to their `style`.
 */
interface Sourced {
  readonly body: Declarations;
  readonly root: Declarations;
}

/**
 * The frame page's own stylesheet, in its HTML.
 */
const pageStyle = regex("<(?:style)>(?<sheet>[^<]*)</style>", "u");

/**
 * A rule of the frame page's own stylesheet for its `html` or its `body` element, by the element.
 */
const pinnedRule = regex("(?<element>html|body)\\{(?<declared>[^}]*)\\}", "gu");

/**
 * No declarations on either element.
 */
const declaredNone: Sourced = { body: new Map(), root: new Map() };

/**
 * Read the frame page's own stylesheet's rules for its `html` and `body` elements from its HTML,
 * none where it writes none. Each of them is `!important` in the stylesheet's first layer, so,
 * among a PCI's declarations, only an element-attached `!important` one sorts before them.
 *
 * @param html The page's HTML.
 * @returns Their declarations.
 */
const pinnedOf = (html: string): Sourced => {
  const sheet = pageStyle.exec(html)?.groups.sheet ?? "";
  const declared = new Map(
    [...sheet.matchAll(pinnedRule)].map((match) => [
      match.groups?.["element"] ?? "",
      match.groups?.["declared"] ?? "",
    ]),
  );

  return {
    body: declarationsOf(declared.get("body") ?? ""),
    root: declarationsOf(declared.get("html") ?? ""),
  };
};

/**
 * An element of the frame's document whose properties the test's layout reads.
 */
type Styled = keyof Sourced;

/**
 * The value an element's property takes.
 */
type Style = (element: Styled, property: string) => string;

/**
 * Give the value each property of the root and the body takes, as CSS Cascade 5 sorts its
 * declarations: importance first; among `!important` ones, an element-attached one, which a PCI's
 * script writes with `setProperty(…, "important")`, then the frame page's pins, in the page's first
 * layer, then a PCI's stylesheet's; among the rest, an element-attached one, which a PCI's script
 * writes as CSSOM writes it plainly, then a PCI's stylesheet's. Else, for the body's writing mode,
 * the root's, which it inherits; else the property's initial value.
 *
 * @param pinned The frame page's pins.
 * @param sheet A PCI's stylesheet's declarations on the root and the body.
 * @param script What a PCI's script writes in the root's and the body's `style`.
 * @returns The value of a property of either element.
 */
const styleOf =
  (pinned: Sourced, sheet: Sourced, script: Sourced): Style =>
  (element, property) => {
    const sources = [script, pinned, sheet].map((each) => each[element].get(property));
    const declared =
      sources.find((each) => each?.important === true) ??
      sources.find((each) => each !== undefined);

    if (declared !== undefined) {
      return declared.value;
    }

    return element === "body" && property === "writing-mode"
      ? styleOf(pinned, sheet, script)("root", property)
      : (initialValues.get(property) ?? "");
  };

/**
 * A height media query of a case's content: the height its block takes once the viewport is at
 * least as tall as the query's `min-height`.
 */
interface HeightQuery {
  readonly height: number;
  readonly minHeight: number;
}

/**
 * What the frame's document holds: a block of a given height; a run of text of a given advance,
 * which breaks into lines 20 px apart; a block of a given height above blocks each a given part of
 * the viewport's height, as `vh` sizes them (`100vh` one, `50vh` a half); a block of a given
 * height that height media queries lay out at another, the last query that matches the viewport's;
 * or such a block above blocks a given part of the viewport's height.
 */
type Content =
  | { readonly block: number }
  | { readonly block: number; readonly queries: readonly HeightQuery[] }
  | { readonly block: number; readonly queries: readonly HeightQuery[]; readonly screens: number }
  | { readonly block: number; readonly screens: number }
  | { readonly text: number };

/**
 * The body's margin, on each side, as a browser's own stylesheet gives it.
 */
const bodyMargin = 8;

/**
 * The unit of a length in pixels.
 */
const pixelUnit = regex("px$", "u");

/**
 * The two transforms the cases write: a scale, and a translation down.
 */
const transforms = {
  down: regex("^translateY\\((?<down>[\\d.]+)px\\)$", "u"),
  scale: regex("^scale\\((?<factor>[\\d.]+)\\)$", "u"),
} as const;

/**
 * Read a length in pixels, or a number, as written: `10px`, `0`, `2`.
 *
 * @param value The value.
 * @returns The number.
 */
const pixelsIn = (value: string): number => Number(value.replace(pixelUnit, ""));

/**
 * Read a length: pixels, or a percentage of the size given; `undefined` for `auto` or `none`.
 *
 * @param value The value, as written.
 * @param of The size a percentage is of.
 * @returns The length.
 */
const lengthOf = (value: string, of: number): number | undefined => {
  if (value.endsWith("%")) {
    return (Number(value.slice(0, -1)) / 100) * of;
  }

  return value === "auto" || value === "none" ? undefined : pixelsIn(value);
};

/**
 * The body's extent in the root, and how far its content reaches, each with the body's margins.
 */
interface Flow {
  readonly box: number;
  readonly reach: number;
}

/**
 * Give the height the content takes: a block's own, or the height its last matching query gives
 * it, with each screen the viewport's height; or the text's lines at the body's inline size.
 *
 * @param content The content.
 * @param inline The root's inline size.
 * @param viewport The viewport's height.
 * @returns The height.
 */
const contentHeightOf = (content: Content, inline: number, viewport: number): number => {
  if ("queries" in content) {
    const block =
      content.queries.findLast(({ minHeight }) => viewport >= minHeight)?.height ?? content.block;

    return "screens" in content ? block + content.screens * viewport : block;
  }

  if ("screens" in content) {
    return content.block + content.screens * viewport;
  }

  return "block" in content
    ? content.block
    : Math.ceil(content.text / (inline - 2 * bodyMargin)) * 20;
};

/**
 * Read one of the body's lengths: pixels, or the viewport's height in `vh`; `undefined` for
 * `auto` or `none`.
 *
 * @param value The value, as written.
 * @param viewport The viewport's height.
 * @returns The length.
 */
const bodyLengthOf = (value: string, viewport: number): number | undefined => {
  if (value.endsWith("vh")) {
    return (Number(value.slice(0, -"vh".length)) / 100) * viewport;
  }

  return value === "auto" || value === "none" ? undefined : pixelsIn(value);
};

/**
 * Give the extent the body takes in the root, margins included: its content's, a block's own
 * height, with each screen the viewport's height, or the text's lines at the body's inline size,
 * in the block direction of the root's writing mode; held to the body's own `height`,
 * `min-height` and `max-height`; and how far its content reaches, which may overflow it.
 *
 * @param style The root's and the body's styles.
 * @param content The content.
 * @param inline The root's inline size.
 * @param viewport The viewport's height.
 * @returns The body's extent, and its content's reach, each with the body's margins.
 */
const flowOf = (style: Style, content: Content, inline: number, viewport: number): Flow => {
  const own = contentHeightOf(content, inline, viewport);
  const stated = bodyLengthOf(style("body", "height"), viewport) ?? own;
  const held = Math.min(
    Math.max(stated, bodyLengthOf(style("body", "min-height"), viewport) ?? 0),
    bodyLengthOf(style("body", "max-height"), viewport) ?? Number.POSITIVE_INFINITY,
  );

  return { box: held + 2 * bodyMargin, reach: Math.max(held, own) + 2 * bodyMargin };
};

/**
 * The root's box before its transforms, in its own pixels: its border box's inline and block
 * sizes and its content box's block size, in its used writing mode; its physical width and height;
 * and the physical height its content reaches, which may overflow the box.
 */
interface Box {
  readonly block: number;
  readonly content: number;
  readonly height: number;
  readonly inline: number;
  readonly reach: number;
  readonly width: number;
}

/**
 * The viewport the root is laid out in, in its own pixels: the frame's, divided by its zoom.
 */
interface Viewport {
  readonly height: number;
  readonly width: number;
}

/**
 * Give one of the root's lengths, by property, in pixels: 0 where it sets none.
 *
 * @param style The root's and the body's styles.
 * @param property The property.
 * @param of The size a percentage is of.
 * @returns The length.
 */
const pixelsOf = (style: Style, property: string, of: number): number =>
  lengthOf(style("root", property), of) ?? 0;

/**
 * Tell whether the root is laid out as if it held nothing: size containment, by `contain` or by
 * `content-visibility: hidden`.
 *
 * @param style The root's and the body's styles.
 * @returns Whether it is.
 */
const sizeContained = (style: Style): boolean =>
  ["size", "strict"].includes(style("root", "contain")) ||
  style("root", "content-visibility") === "hidden";

/**
 * Lay the root out in a horizontal writing mode: its width the viewport's less its margins, its
 * height its content's, or the viewport's where it is positioned with insets 0, or its own
 * `height`, held to its `min-height` and `max-height`, then its bottom padding.
 *
 * @param style The root's and the body's styles.
 * @param content What the document holds.
 * @param viewport The viewport.
 * @returns The box.
 */
const horizontalBox = (style: Style, content: Content, viewport: Viewport): Box => {
  const inline =
    viewport.width - pixelsOf(style, "margin-left", 0) - pixelsOf(style, "margin-right", 0);
  const flow = flowOf(style, content, inline, viewport.height);
  const margins = pixelsOf(style, "margin-top", 0) + pixelsOf(style, "margin-bottom", 0);
  const auto = sizeContained(style) ? 0 : flow.box;
  const stated =
    style("root", "position") === "static"
      ? (lengthOf(style("root", "height"), viewport.height) ?? auto)
      : viewport.height - margins;
  const held = Math.min(
    Math.max(stated, pixelsOf(style, "min-height", viewport.height)),
    lengthOf(style("root", "max-height"), viewport.height) ?? Number.POSITIVE_INFINITY,
  );
  const block = held + pixelsOf(style, "padding-bottom", 0);

  return {
    block,
    content: held,
    height: block,
    inline,
    reach: Math.max(block, flow.reach),
    width: inline,
  };
};

/**
 * Lay the root out in a vertical writing mode: its inline size, its physical height, the
 * viewport's height less its margins, or its own `height`; its block size, its physical width, the
 * text's columns at that height.
 *
 * @param style The root's and the body's styles.
 * @param content What the document holds.
 * @param viewport The viewport.
 * @returns The box.
 */
const verticalBox = (style: Style, content: Content, viewport: Viewport): Box => {
  const margins = pixelsOf(style, "margin-top", 0) + pixelsOf(style, "margin-bottom", 0);
  const inline = lengthOf(style("root", "height"), viewport.height) ?? viewport.height - margins;
  const block = sizeContained(style) ? 0 : flowOf(style, content, inline, viewport.height).box;

  return { block, content: block, height: inline, inline, reach: inline, width: block };
};

/**
 * Give how far below the root's box its painting reaches under a `transform` of `scale(…)` or
 * `translateY(…)`, the two the cases write.
 *
 * @param value The transform.
 * @param box The box.
 * @returns The depth.
 */
const transformOf = (value: string, box: Box): number => {
  const scale = transforms.scale.exec(value)?.groups.factor;

  return scale === undefined
    ? box.reach + Number(transforms.down.exec(value)?.groups.down ?? "0")
    : (box.reach * (1 + Number(scale))) / 2;
};

/**
 * Give how far below the root's box its painting reaches under one of its transforms, from the
 * top of its border box, in its own pixels, as each transform moves the box: a scale about its
 * centre, a translation down, a quarter turn about its centre, or a motion path from the origin
 * downwards, which centres the box on the path's start and turns it along the path.
 */
const transformed: readonly (readonly [string, (value: string, box: Box) => number])[] = [
  ["transform", (value, box) => transformOf(value, box)],
  ["scale", (value, box) => (box.reach * (1 + Number(value))) / 2],
  ["translate", (value, box) => box.reach + pixelsIn(value.split(" ").at(-1) ?? "0")],
  ["rotate", (_value, box) => (box.reach + box.width) / 2],
  ["offset-path", (_value, box) => box.width / 2],
];

/**
 * Lay the frame's document out at a height of the frame: the root in its used writing mode, the
 * body's, or its own where either has containment (CSS Writing Modes 4, §8); at its zoom; its
 * painting moved by its transforms.
 *
 * @param style The root's and the body's styles.
 * @param content What the document holds.
 * @param height The frame's height.
 * @returns The layout.
 */
const laidOut = (style: Style, content: Content, height: number): Laid => {
  const zoom = Number(style("root", "zoom"));
  const contained = style("root", "contain") !== "none" || style("body", "contain") !== "none";
  const mode = style(contained ? "root" : "body", "writing-mode");
  const viewport = { height: height / zoom, width: iframe.width / zoom };
  const box =
    mode === "horizontal-tb"
      ? horizontalBox(style, content, viewport)
      : verticalBox(style, content, viewport);
  let { reach } = box;

  for (const [property, depth] of transformed) {
    const value = style("root", property);

    if (value !== "none") {
      reach = Math.max(reach, depth(value, box));
    }
  }

  const scale = transforms.scale.exec(style("root", "transform"))?.groups.factor;
  const margins = pixelsOf(style, "margin-top", 0) + pixelsOf(style, "margin-bottom", 0);

  return {
    block: box.block,
    content: box.content,
    inline: box.inline,
    rect: zoom * box.height * Number(scale ?? "1"),
    taken: zoom * (margins + reach),
  };
};

/**
 * Follow the frame's posts as the island does, each written as the frame's height: the document
 * laid out again at it and its observations delivered, then, where the height changed, the frame's
 * `resize`, which in Chrome comes after the observations of the same rendering, then its timers;
 * until a post leaves the frame's height as it was, or the frame has posted twenty.
 *
 * @param booting The frame.
 * @param layout The document's layout.
 * @param height The frame's height now.
 * @param before The frame's height before.
 * @returns The layout at the frame's last height.
 */
const followed = (booting: Booted, layout: Layout, height: number, before: number): Laid => {
  const laid = layout.layOut(height);

  if (height !== before) {
    booting.resized();
  }

  booting.later();

  const heights = heightsOf(booting.island);
  const last = heights.at(-1);

  return last === undefined || last === height || heights.length >= 20
    ? laid
    : followed(booting, layout, last, height);
};

/**
 * A case of the frame's layout: what a PCI's stylesheet declares on the root and the body, what
 * its script writes in the root's `style`, none where it writes nothing, and what the document
 * holds.
 */
interface HeightCase {
  readonly body: string;
  readonly content: Content;
  readonly name: string;
  readonly root: string;
  readonly script?: string;
}

/**
 * The text of COLD's vertical cases: 600 glyphs 16 px wide.
 */
const glyphs: Content = { text: 9600 };

/**
 * COLD i2's cases (C2–C15), RED i2's (its root at `height: 100%` with padding, and its margins),
 * and one more for each property the frame page pins that they leave out. Each, without its pin,
 * posts a height the document does not take, or posts without end; C14 and the padding are right
 * either way.
 */
const heightCases: readonly HeightCase[] = [
  {
    body: "",
    content: { block: 200 },
    name: "C2, the root's bottom padding",
    root: "padding-bottom: 40px",
  },
  { body: "", content: { block: 200 }, name: "C3, the root's margins", root: "margin: 10px" },
  {
    body: "",
    content: { block: 1000 },
    name: "C4, the root at the viewport's height",
    root: "height: 100%",
  },
  {
    body: "",
    content: { block: 20 },
    name: "C5, the root at half the viewport's height",
    root: "height: 50%",
  },
  { body: "", content: glyphs, name: "C6, the root vertical", root: "writing-mode: vertical-rl" },
  {
    body: "",
    content: glyphs,
    name: "C7, the root vertical, with margins",
    root: "writing-mode: vertical-rl; margin: 10px",
  },
  {
    body: "writing-mode: vertical-rl",
    content: glyphs,
    name: "C8, the body vertical and the root not",
    root: "",
  },
  { body: "", content: { block: 200 }, name: "C9, the root scaled", root: "transform: scale(2)" },
  { body: "", content: glyphs, name: "C10, the root sideways", root: "writing-mode: sideways-rl" },
  {
    body: "",
    content: glyphs,
    name: "C11, the root in the legacy tb-rl",
    root: "writing-mode: tb-rl",
  },
  { body: "", content: { block: 200 }, name: "C12, the root zoomed", root: "zoom: 2" },
  {
    body: "",
    content: { block: 200 },
    name: "C13, the root translated",
    root: "transform: translateY(100px)",
  },
  {
    body: "writing-mode: horizontal-tb",
    content: glyphs,
    name: "C14, the root vertical and the body not",
    root: "writing-mode: vertical-rl",
  },
  {
    body: "",
    content: { block: 200 },
    name: "C15, a scale, a zoom, margins and half the viewport's height, each !important",
    root: "transform: scale(2) !important; zoom: 2 !important; margin: 10px !important; height: 50% !important",
  },
  {
    body: "",
    content: { block: 200 },
    name: "RED's root at the viewport's height with bottom padding",
    root: "height: 100%; padding-bottom: 10px",
  },
  {
    body: "",
    content: { block: 200 },
    name: "RED's root bottom margin",
    root: "margin-bottom: 30px",
  },
  {
    body: "min-height: 100vh",
    content: { block: 20 },
    name: "RED's body at least the viewport's height, with the root's bottom padding",
    root: "padding-bottom: 10px",
  },
  {
    body: "height: 100vh",
    content: { block: 20 },
    name: "the body at the viewport's height, with the root's bottom padding",
    root: "padding-bottom: 10px",
  },
  {
    body: "max-height: 50vh",
    content: { block: 400 },
    name: "the body at most half the viewport's height",
    root: "",
  },
  {
    body: "",
    content: { block: 200 },
    name: "RED's R1 by script, the root's `style.height` 100% and its bottom padding",
    root: "",
    script: "height: 100%; padding-bottom: 10px",
  },
  {
    body: "",
    content: { block: 200 },
    name: "the root's margin, transform and zoom by script",
    root: "",
    script: "margin-bottom: 30px; transform: scale(2); zoom: 2",
  },
  {
    body: "",
    content: { block: 200 },
    name: "the root at least the viewport's height, with bottom padding",
    root: "min-height: 100%; padding-bottom: 10px",
  },
  {
    body: "",
    content: { block: 200 },
    name: "the root at most half the viewport's height",
    root: "max-height: 50%",
  },
  {
    body: "",
    content: { block: 1000 },
    name: "the root positioned with insets 0",
    root: "position: absolute",
  },
  { body: "", content: { block: 200 }, name: "the root's size contained", root: "contain: size" },
  {
    body: "",
    content: { block: 200 },
    name: "the root's content hidden",
    root: "content-visibility: hidden",
  },
  { body: "", content: { block: 200 }, name: "the root scaled by `scale`", root: "scale: 2" },
  {
    body: "",
    content: { block: 200 },
    name: "the root translated by `translate`",
    root: "translate: 0 100px",
  },
  { body: "", content: { block: 200 }, name: "the root turned a quarter", root: "rotate: 90deg" },
  {
    body: "",
    content: { block: 200 },
    name: "the root on a motion path",
    root: "offset-path: path('M0,0 L0,100')",
  },
  {
    body: "contain: layout",
    content: glyphs,
    name: "the root vertical, and the body contained",
    root: "writing-mode: vertical-rl",
  },
];

/**
 * A frame booted on the test's layout of a case: the frame, the layout, and the case's style.
 */
interface BootedOn {
  readonly booting: Booted;
  readonly layout: Layout;
  readonly styled: Style;
}

/**
 * Tell whether the frame's viewport scrolls what overflows it: by the root's `overflow-y`, or,
 * where the root's is `visible`, the body's, which propagates to the viewport in its place (CSS
 * Overflow 3); `hidden` or `clip` there leaves what overflows unreachable.
 *
 * @param style The root's and the body's styles.
 * @returns Whether it scrolls.
 */
const scrollsOf = (style: Style): boolean => {
  const root = style("root", "overflow-y");
  const viewport = root === "visible" ? style("body", "overflow-y") : root;

  return viewport !== "hidden" && viewport !== "clip";
};

/**
 * A frame booted on the test's layout of a case, the island's `load` given it: the case's
 * stylesheet over the served page's `style` attributes, its writing modes answered element by
 * element.
 *
 * @param html The served page's HTML.
 * @param sheet The case's stylesheet, on the root and the body.
 * @param sheet.body On the body.
 * @param sheet.root On the root.
 * @param sheet.script What the PCI's script writes in the root's `style`.
 * @param content What the document holds, by the frame's height.
 * @returns The frame, its layout and its style.
 */
const bootedOn = (
  html: string,
  sheet: { readonly body: string; readonly root: string; readonly script?: string | undefined },
  content: () => Content,
): BootedOn => {
  const style = styleOf(
    pinnedOf(html),
    { body: declarationsOf(sheet.body), root: declarationsOf(sheet.root) },
    { body: declarationsOf(""), root: declarationsOf(sheet.script ?? "") },
  );
  const layout = observedLayout((height) => laidOut(style, content(), height), {});
  const booting = booted(
    layout.root,
    layout.observer,
    (element) => ({
      writingMode: style(element === layout.root ? "root" : "body", "writing-mode"),
    }),
    layout.viewport,
  );

  booting.receive(loadOfA, booting.island);

  return { booting, layout, styled: style };
};

describe("the frame's height, followed post by post as the island writes it", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("posts once for each of COLD's and RED's cases and each pin's, the height the document takes", async () => {
    const page = await Effect.runPromise(framePage.pipe(Effect.provide(Digest.layerWebCrypto)));
    const posted = heightCases.map(({ body, content, name, root, script }) => {
      const { booting, layout } = bootedOn(page.html, { body, root, script }, () => content);
      const laid = followed(booting, layout, iframe.firstHeight, iframe.firstHeight);

      return { expected: [Math.ceil(laid.taken)], heights: heightsOf(booting.island), name };
    });

    assert.deepStrictEqual(
      posted.map(({ heights, name }) => `${name}: ${heights.join(", ")}`),
      posted.map(({ expected, name }) => `${name}: ${expected.join(", ")}`),
      "each case posts once, the height the document takes in the frame: that post changes no box the frame observes, so nothing is clipped and no post follows",
    );
  });
});

/**
 * The cases with no height to post: content sized from the viewport's own height, `V + c` at a
 * viewport of `V`, with `c` above zero. RED i2's two loops, RED's two stacked panels, a heading
 * over a full-height block, and COLD i2's C17, an orthogonal flow, whose available inline size is
 * the viewport's height, laid out as tall as the viewport plus the body's margins.
 */
const unfittedCases: readonly HeightCase[] = [
  {
    body: "",
    content: { block: 0, screens: 1 },
    name: "a block as tall as the viewport, with the root's bottom padding",
    root: "padding-bottom: 10px",
  },
  {
    body: "",
    content: { block: 0, screens: 1 },
    name: "the same, the root's overflow hidden",
    root: "padding-bottom: 10px; overflow-y: hidden",
  },
  {
    body: "overflow-y: hidden",
    content: { block: 0, screens: 1 },
    name: "the same, the body's overflow hidden",
    root: "padding-bottom: 10px",
  },
  {
    body: "",
    content: { block: 72, screens: 1 },
    name: "a heading over a block as tall as the viewport",
    root: "",
  },
  {
    body: "",
    content: { block: 0, screens: 2 },
    name: "RED's two stacked full-height panels",
    root: "",
  },
  {
    body: "",
    content: { block: 0, screens: 1 },
    name: "C17, an orthogonal flow as tall as the viewport",
    root: "",
  },
  {
    body: "",
    content: { block: 200 },
    name: 'R1 by a script\'s `setProperty(…, "important")`, which sorts before the pins',
    root: "",
    script: "height: 100% !important; padding-bottom: 10px",
  },
];

/**
 * COLD i5's two-step query: 600 px once the viewport is 400 tall, 800 once it is 600, over 400.
 */
const twoSteps: readonly HeightQuery[] = [
  { height: 600, minHeight: 400 },
  { height: 800, minHeight: 600 },
];

/**
 * The cases whose height a height media query, or the viewport's own height, sets, each with what
 * the frame posts once it stops, then after each of three content signals that change nothing:
 * COLD i3's 400 px that `@media (min-height: 400px)` grows by 200, whose fixed point is one post
 * away; COLD i5's two steps, 600 at a `min-height` of 400 and 800 at 600, each landing in an echo,
 * which stop one post short, the two echoes' growth as even as `V + c`'s; RED i3's
 * `.x { height: 400px }` that `@media (min-height: 600px)` hides, which flips at each post; COLD
 * i5's contraction, `50vh` over 300 px, whose fixed point, 632, the line through two echoes gives;
 * a heading over a full-height block, `V + c`; and RED's two stacked full-height panels, `2V + c`,
 * neither of which has a fixed point.
 */
const queryCases: readonly {
  readonly content: Content;
  readonly name: string;
  readonly posts: readonly string[];
}[] = [
  {
    content: { block: 400, queries: [{ height: 600, minHeight: 400 }] },
    name: "COLD's 400 px grown by 200 at a min-height of 400",
    posts: ["416, 616", "416, 616", "416, 616", "416, 616"],
  },
  {
    content: { block: 400, queries: twoSteps },
    name: "COLD's two steps, each landing in an echo",
    posts: ["416, 616", "416, 616", "416, 616", "416, 616"],
  },
  {
    content: { block: 861, queries: [{ height: 461, minHeight: 600 }] },
    name: "RED's 400 px hidden at a min-height of 600",
    posts: ["877, 477", "877, 477, 877", "877, 477, 877", "877, 477, 877"],
  },
  {
    content: { block: 300, screens: 0.5 },
    name: "COLD's contraction, 50vh over 300 px",
    posts: ["466, 549, 632", "466, 549, 632", "466, 549, 632", "466, 549, 632"],
  },
  {
    content: { block: 72, screens: 1 },
    name: "a heading over a block as tall as the viewport",
    posts: ["388, 476", "388, 476", "388, 476", "388, 476"],
  },
  {
    content: { block: 0, screens: 2 },
    name: "RED's two stacked full-height panels",
    posts: ["616, 1248", "616, 1248, 2512", "616, 1248, 2512", "616, 1248, 2512"],
  },
];

/**
 * Toggle a frame's content a number of times, each at the frame's fixed viewport: the toggle, its
 * mutation, the document laid out again at the frame's height and its observations delivered,
 * then the frame's posts followed as the island follows them.
 *
 * @param booting The frame.
 * @param layout The document's layout.
 * @param toggle The toggle of the content.
 * @param toggles How many times to toggle it.
 */
const toggled = (booting: Booted, layout: Layout, toggle: () => void, toggles: number): void => {
  if (toggles === 0) {
    return;
  }

  const shown = heightsOf(booting.island).at(-1) ?? iframe.firstHeight;

  toggle();
  booting.mutated();
  followed(booting, layout, shown, shown);
  toggled(booting, layout, toggle, toggles - 1);
};

/**
 * The height Chrome gives an iframe that sets none, 150 px, at which COLD i6's probe frame starts:
 * from there `50vh` over 300 px samples its echoes at 391 and 512, and a step at a `min-height` of
 * 500 lands between them.
 */
const unsizedFrameHeight = 150;

/**
 * The cases whose two echoes a step lies between, so the line through them is no description of
 * the content, each with what the frame posts: COLD i6's `50vh` over 300 px with 60 px more at a
 * `min-height` of 500, and with 30 px more; COLD's F18, 60 px at 500 and 100 px more at 900, a
 * step in each pair of samples; and RED i6's uneven staircase, 400 px grown to 600 at a
 * `min-height` of 400 and to 798 at 600, which reads a slope of 0.99.
 */
const misfitCases: readonly {
  readonly content: Content;
  readonly name: string;
  readonly posts: readonly number[];
}[] = [
  {
    content: { block: 300, queries: [{ height: 360, minHeight: 500 }], screens: 0.5 },
    name: "COLD's 60 px step at a min-height of 500 on 50vh over 300 px",
    posts: [391, 512, 1144, 752],
  },
  {
    content: { block: 300, queries: [{ height: 330, minHeight: 500 }], screens: 0.5 },
    name: "COLD's 30 px step",
    posts: [391, 512, 870, 692],
  },
  {
    content: {
      block: 300,
      queries: [
        { height: 360, minHeight: 500 },
        { height: 460, minHeight: 900 },
      ],
      screens: 0.5,
    },
    name: "COLD's F18: 60 px at a min-height of 500 and 100 px more at 900",
    posts: [391, 512, 1144, 864, 808, 752],
  },
  {
    content: {
      block: 400,
      queries: [
        { height: 600, minHeight: 400 },
        { height: 798, minHeight: 600 },
      ],
    },
    name: "RED's uneven staircase",
    posts: [416, 616, 1430, 814],
  },
];

/**
 * When a case's script writes the document: before each frame's layout, as an animation by script
 * does (`requestAnimationFrame` writing a style, a spinner); after the frame's `resize`, in its
 * listener, as a script sizing content from `innerHeight` does; or at the `resize` that comes in
 * the very rendering it lays out, as the mobile `--vh` fix's custom property is set.
 */
type Writes = "each frame" | "after each resize" | "with each resize";

/**
 * Follow a frame frame by frame, as Chrome renders it: each frame the island has written the last
 * height posted as the frame's, the case's script writes where its {@link Writes} say, the
 * document is laid out at that height and its observations delivered, the frame's `resize` fires
 * where its height changed, and its timers run.
 *
 * @param booting The frame.
 * @param layout The document's layout.
 * @param writes When the case's script writes the document.
 * @param frames How many frames to follow.
 * @param shown The frame's height before this frame.
 */
const framed = (
  booting: Booted,
  layout: Layout,
  writes: Writes,
  frames: number,
  shown: number,
): void => {
  if (frames === 0) {
    return;
  }

  const next = heightsOf(booting.island).at(-1) ?? shown;
  const resized = next !== shown;

  if (writes === "each frame" || (writes === "with each resize" && resized)) {
    booting.mutated();
  }

  if (resized && writes === "with each resize") {
    booting.resized();
  }

  layout.layOut(next);

  if (resized && writes !== "with each resize") {
    booting.resized();
  }

  if (resized && writes === "after each resize") {
    booting.mutated();
  }

  booting.later();
  framed(booting, layout, writes, frames - 1, next);
};

/**
 * RED i5's four loops, each a script that writes the document beside content the echo rule stops:
 * a heading over a full-height block under an animation by script; the flip, `.x` 400 px hidden at
 * a `min-height` of 600, under the same animation; a block a resize listener sizes to the
 * viewport, `innerHeight`, under a heading; and the same by the `--vh` fix, its property set as
 * the frame's resize comes. Each with what the frame posts through forty frames.
 */
const scriptedCases: readonly {
  readonly content: Content;
  readonly name: string;
  readonly posts: readonly number[];
  readonly writes: Writes;
}[] = [
  {
    content: { block: 72, screens: 1 },
    name: "a heading over a full-height block, animated by script",
    posts: [388, 476],
    writes: "each frame",
  },
  {
    content: { block: 861, queries: [{ height: 461, minHeight: 600 }] },
    name: "RED's flip, animated by script",
    posts: [877, 477, 877],
    writes: "each frame",
  },
  {
    content: { block: 72, screens: 1 },
    name: "a heading over a block a resize listener sizes to innerHeight",
    posts: [388, 476],
    writes: "after each resize",
  },
  {
    content: { block: 72, screens: 1 },
    name: "a heading over a block sized by the --vh fix",
    posts: [388, 476],
    writes: "with each resize",
  },
];

describe("content sized from its own viewport, which no height fits", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("stops at the second post, its first echo's, and scrolls the rest", async () => {
    const page = await Effect.runPromise(framePage.pipe(Effect.provide(Digest.layerWebCrypto)));
    const posted = unfittedCases.map(({ body, content, name, root, script }) => {
      const {
        booting,
        layout,
        styled: style,
      } = bootedOn(page.html, { body, root, script }, () => content);
      const laid = followed(booting, layout, iframe.firstHeight, iframe.firstHeight);
      const heights = heightsOf(booting.island);
      const shown = heights.at(-1) ?? iframe.firstHeight;
      const first = Math.ceil(laidOut(style, content, iframe.firstHeight).block);
      const second = Math.ceil(laidOut(style, content, first).block);
      const over = Math.ceil(laidOut(style, content, second).taken) - second;

      return {
        actual: `${name}: posts ${heights.join(", ")}; then ${scrollsOf(style) ? `scrolls ${String(Math.ceil(laid.taken) - shown)} px` : "cannot scroll"}`,
        expected: `${name}: posts ${String(first)}, ${String(second)}; then scrolls ${String(over)} px`,
      };
    });

    assert.deepStrictEqual(
      posted.map(({ actual }) => actual),
      posted.map(({ expected }) => expected),
      "each posts the height its content takes at the frame's first height, then, for the first echo of the frame's own resize, once more; the echo of that post is dropped; and the root, which the page pins to scroll, scrolls the overflow, so nothing is lost",
    );
  });

  it("posts no height before the island's load has written the PCI's markup", async () => {
    const page = await Effect.runPromise(framePage.pipe(Effect.provide(Digest.layerWebCrypto)));
    let written = 0;
    const style = styleOf(pinnedOf(page.html), declaredNone, declaredNone);
    const layout = observedLayout((height) => laidOut(style, { block: written }, height), {});
    const booting = booted(layout.root, layout.observer, horizontalOnly, layout.viewport);

    layout.layOut(iframe.firstHeight);

    const before = heightsOf(booting.island);

    booting.receive(loadOfA, booting.island);
    written = 200;
    layout.layOut(iframe.firstHeight);

    assert.deepStrictEqual(
      { after: heightsOf(booting.island), before },
      { after: [216], before: [] },
      "the empty document's height, its body's margins, is never posted: it would shrink the frame for nothing, and a frame sized from its viewport would then stop far below its default height",
    );
  });

  it("posts a change of the frame's width that comes with its own resize, which is no echo", () => {
    const reports: ((entries: readonly ResizeObserverEntry[]) => void)[] = [];
    let viewport: number = iframe.firstHeight;
    const booting = booted(
      plainRoot(),
      class {
        readonly observed: Element[] = [];

        constructor(report: (entries: readonly ResizeObserverEntry[]) => void) {
          reports.push(report);
        }

        observe(target: Element): void {
          this.observed.push(target);
        }
      },
      horizontalOnly,
      () => viewport,
    );
    const observed = (inline: number, block: number): void => {
      for (const report of reports) {
        report([
          entryOf(document.documentElement, {
            block,
            content: block,
            inline,
            rect: block,
            taken: block,
          }),
        ]);
      }
    };

    booting.receive(loadOfA, booting.island);
    observed(600, 216);
    viewport = 216;
    observed(500, 248);
    viewport = 248;
    observed(500, 264);
    viewport = 264;
    observed(500, 280);

    assert.deepStrictEqual(
      heightsOf(booting.island),
      [216, 248, 264],
      "the observation that follows the frame's own resize, its width changed too, is the content reflowing, and is posted; the next, its width as it was, is a first echo, posted once more; and the echo of that post is dropped",
    );
  });

  it("posts a picture that loads after the echo, and one that loads in the very rendering the echo comes in", async () => {
    const page = await Effect.runPromise(framePage.pipe(Effect.provide(Digest.layerWebCrypto)));
    const sheet = { body: "", root: "padding-bottom: 10px" };
    let after = 0;
    let within = 0;
    const later = bootedOn(page.html, sheet, () => ({ block: after, screens: 1 }));
    const stopped = followed(later.booting, later.layout, iframe.firstHeight, iframe.firstHeight);
    const shown = heightsOf(later.booting.island).at(-1) ?? iframe.firstHeight;

    after = 100;
    later.booting.signalled("load");
    followed(later.booting, later.layout, shown, shown);

    const same = bootedOn(page.html, sheet, () => ({ block: within, screens: 1 }));

    same.layout.layOut(iframe.firstHeight);
    same.booting.later();

    const first = heightsOf(same.booting.island).at(-1) ?? iframe.firstHeight;

    within = 100;
    same.booting.signalled("load");
    followed(same.booting, same.layout, first, iframe.firstHeight);

    assert.deepStrictEqual(
      {
        after: heightsOf(later.booting.island),
        stopped: Math.ceil(stopped.block),
        within: heightsOf(same.booting.island),
      },
      { after: [326, 352, 452], stopped: 378, within: [326, 452] },
      "the frame stops at 352 with 378 to show; a picture 100 px tall that loads once it has stopped is a change at a fixed viewport, which the slope the frame measured, 1, follows: 452, the viewport plus the change, whose echo grows as that slope says; one whose load, a content signal, lands just before the observation that echoes the frame's resize to 326 is posted as that echo, 452, and the echo of that post is dropped",
    );
  });

  it("stops RED's loops, a script that writes the document every frame or at each resize beside content sized from the viewport or a flipping query, as it stops the same content alone", async () => {
    const page = await Effect.runPromise(framePage.pipe(Effect.provide(Digest.layerWebCrypto)));
    const runs = scriptedCases.map(({ content, name, posts, writes }) => {
      const { booting, layout } = bootedOn(page.html, { body: "", root: "" }, () => content);

      framed(booting, layout, writes, 40, iframe.firstHeight);

      return {
        actual: `${name}: ${heightsOf(booting.island).join(", ")}`,
        expected: `${name}: ${posts.join(", ")}`,
      };
    });

    assert.deepStrictEqual(
      runs.map(({ actual }) => actual),
      runs.map(({ expected }) => expected),
      "a signal before every observation leaves each echo an echo, so each case posts what it posts with no script, and nothing more through forty frames: a heading over a full-height block 388 and 476, the flip 877, 477 and then, at the signal after its dropped echo, 877",
    );
  });

  it("reaches a two-step query's fixed point where each step lands after the frame has looked at its viewport", async () => {
    const page = await Effect.runPromise(framePage.pipe(Effect.provide(Digest.layerWebCrypto)));
    const queried: Content = { block: 400, queries: twoSteps };
    let seen: number = iframe.firstHeight;
    const { booting, layout } = bootedOn(page.html, { body: "", root: "" }, () => ({
      block: contentHeightOf(queried, iframe.width, seen),
    }));
    const lookedAt = (frameHeight: number): void => {
      layout.layOut(frameHeight);
      booting.resized();
      booting.later();
      seen = frameHeight;
      layout.layOut(frameHeight);
      booting.later();
    };

    layout.layOut(iframe.firstHeight);
    booting.later();
    lookedAt(416);
    lookedAt(616);
    lookedAt(816);

    assert.deepStrictEqual(
      heightsOf(booting.island),
      [416, 616, 816],
      "each step of the query lands in a rendering after the one the frame's resize brought, once the frame has looked at its viewport, so it is no echo, and is posted; at 816 the query matches as it did, and nothing more is posted",
    );
  });

  it("posts a picture whose layout lands in the echo it drops once the picture's load comes after it", async () => {
    const page = await Effect.runPromise(framePage.pipe(Effect.provide(Digest.layerWebCrypto)));
    let picture = 0;
    const late = bootedOn(page.html, { body: "", root: "padding-bottom: 10px" }, () => ({
      block: picture,
      screens: 1,
    }));

    late.layout.layOut(iframe.firstHeight);
    late.booting.later();
    late.layout.layOut(326);
    late.booting.resized();
    late.booting.later();
    picture = 100;
    late.layout.layOut(352);
    late.booting.resized();
    late.booting.later();

    const dropped = heightsOf(late.booting.island);

    late.booting.signalled("load");
    followed(late.booting, late.layout, 478, 352);

    assert.deepStrictEqual(
      { dropped, posted: heightsOf(late.booting.island) },
      { dropped: [326, 352], posted: [326, 352, 478] },
      "the picture's 100 px land in the echo of the frame's second post, which grows as no `V + c` echo does, so its `load`, which Chrome fires after that observation, posts the height the echo held, 478; the echo of that post is dropped",
    );
  });

  it("posts what a mutation draws in the echo it drops, whose signal comes before that observation and no later one", async () => {
    const page = await Effect.runPromise(framePage.pipe(Effect.provide(Digest.layerWebCrypto)));
    let drawn = 0;
    const late = bootedOn(page.html, { body: "", root: "padding-bottom: 10px" }, () => ({
      block: drawn,
      screens: 1,
    }));

    late.layout.layOut(iframe.firstHeight);
    late.booting.later();
    late.layout.layOut(326);
    late.booting.resized();
    late.booting.later();
    drawn = 100;
    late.booting.mutated();
    followed(late.booting, late.layout, 352, 326);

    assert.deepStrictEqual(
      heightsOf(late.booting.island),
      [326, 352, 478],
      "a PCI that draws its figure in the echo of the frame's second post signals by its mutation before that observation, as a MutationObserver's callback runs before the rendering, and raises none after; the echo, which grows as no `V + c` echo does, is posted at once, 478, and the echo of that post is dropped",
    );
  });

  it("checks an estimate at its own echo and refits once, so a step between the two echoes ends where the content fits, never at the estimate, and no post is above the content plus its viewport", async () => {
    const page = await Effect.runPromise(framePage.pipe(Effect.provide(Digest.layerWebCrypto)));
    const runs = misfitCases.map(({ content, name, posts }) => {
      const { booting, layout } = bootedOn(page.html, { body: "", root: "" }, () => content);

      followed(booting, layout, unsizedFrameHeight, unsizedFrameHeight);

      const heights = heightsOf(booting.island);
      const above = heights.filter((height, at) => {
        const viewport = heights[at - 1] ?? unsizedFrameHeight;
        const observed = contentHeightOf(content, iframe.width, viewport) + 2 * bodyMargin;

        return height > Math.ceil(observed) + viewport;
      });

      return {
        actual: `${name}: ${heights.join(", ")}; above the content plus its viewport: ${above.join(", ")}`,
        expected: `${name}: ${posts.join(", ")}; above the content plus its viewport: `,
      };
    });

    assert.deepStrictEqual(
      runs.map(({ actual }) => actual),
      runs.map(({ expected }) => expected),
      "COLD i6's 60 px step skews the line through the two echoes to a slope of 0.996, whose estimate, 29,553 px, the bound holds at 1144, the content plus its viewport; its echo does not fit, and the line through the second echo and that one, both past the step, gives 752, which fits, the fourth post; the 30 px step's estimate, 870, is within the bound, and its refit gives 692. F18's second step, between the estimate and its check, leaves the refit, 864, off by that step; its own height, 808, is checked against the kept slope and fitted from its own two samples, 752, which fits. RED's uneven staircase reads a slope of 0.99, an estimate of 20,416, held at 1430; the refit is flat, so the content's own height, 814, is posted, and fits",
    );
  });

  it("posts a picture laid out between the two echoes of content that contracts, its load a signal, at the fixed point its drop and that post's echo give", async () => {
    const page = await Effect.runPromise(framePage.pipe(Effect.provide(Digest.layerWebCrypto)));
    let picture = 0;
    const { booting, layout } = bootedOn(page.html, { body: "", root: "" }, () => ({
      block: 20 + picture,
      screens: 0.5,
    }));

    layout.layOut(iframe.firstHeight);
    booting.later();
    layout.layOut(186);
    booting.resized();
    booting.later();
    picture = 60;
    layout.layOut(129);
    booting.resized();
    booting.later();

    const dropped = heightsOf(booting.island);

    booting.signalled("load");
    followed(booting, layout, heightsOf(booting.island).at(-1) ?? iframe.firstHeight, 129);

    assert.deepStrictEqual(
      { dropped, posted: heightsOf(booting.island) },
      { dropped: [186, 129], posted: [186, 129, 161, 192] },
      "RED i6's picture between the echoes: 50vh over 20 px posts 186 and 129; a 60 px picture laid out in the echo of 129 reads a slope of -0.55, so that echo is dropped and kept; the picture's load posts it, 161, whose echo, 176.5, is off that slope, and the line through the drop and that echo, both past the picture, gives the fixed point, 192, which fits. Before, that echo was dropped as spent, the frame left at 161 for 176.5",
    );
  });

  it("follows a change at a fixed viewport by the slope its content measured: COLD's T1 toggle beside V + c stays within 20 px of its first stop, and a contraction's toggle moves to its new fixed point", async () => {
    const page = await Effect.runPromise(framePage.pipe(Effect.provide(Digest.layerWebCrypto)));
    const toggling = (content: (shown: number) => Content) => {
      let shown = 0;
      const { booting, layout } = bootedOn(page.html, { body: "", root: "" }, () => content(shown));

      followed(booting, layout, iframe.firstHeight, iframe.firstHeight);

      const stops = heightsOf(booting.island).length;

      toggled(
        booting,
        layout,
        () => {
          shown = 20 - shown;
        },
        10,
      );

      return {
        stop: heightsOf(booting.island).at(stops - 1),
        toggled: heightsOf(booting.island).slice(stops),
      };
    };
    const t1 = toggling((shown) => ({ block: 72 + shown, screens: 1 }));
    const half = toggling((shown) => ({ block: 300 + shown, screens: 0.5 }));

    assert.deepStrictEqual(
      {
        half,
        strayed: t1.toggled.filter((posted) => Math.abs(posted - (t1.stop ?? 0)) > 20),
        t1,
      },
      {
        half: { stop: 632, toggled: [672, 632, 672, 632, 672, 632, 672, 632, 672, 632] },
        strayed: [],
        t1: { stop: 476, toggled: [496, 476, 496, 476, 496, 476, 496, 476, 496, 476] },
      },
      "COLD's T1: a heading over a 100vh block, beside 20 px shown and hidden ten times, each a change at the frame's fixed viewport; the slope its chain measured, 1, is kept, so each is followed by the viewport plus the change, 496 and 476, the 88 px of overflow scrolling as before, where each had started a chain that added the overflow again, 88 px a toggle. 50vh over 300 px, its slope 0.5 kept, moves between its two fixed points, 632 and 672, one post each",
    );
  });

  it("reaches a height media query's fixed point, stops one that flips at the posted height, and stays stopped through later signals", async () => {
    const page = await Effect.runPromise(framePage.pipe(Effect.provide(Digest.layerWebCrypto)));
    const runs = queryCases.map(({ content, name }) => {
      const { booting, layout } = bootedOn(page.html, { body: "", root: "" }, () => content);
      const shown = (): number => heightsOf(booting.island).at(-1) ?? iframe.firstHeight;
      const postsAfter = (type: string): string => {
        const before = shown();

        booting.signalled(type);
        followed(booting, layout, shown(), before);

        return heightsOf(booting.island).join(", ");
      };

      followed(booting, layout, iframe.firstHeight, iframe.firstHeight);

      const posts = [
        heightsOf(booting.island).join(", "),
        postsAfter("transitionend"),
        postsAfter("animationend"),
        postsAfter("load"),
      ];

      return `${name}: ${posts.join(" | ")}`;
    });

    assert.deepStrictEqual(
      runs,
      queryCases.map(({ name, posts }) => `${name}: ${posts.join(" | ")}`),
      "COLD's query reaches 616 and raises nothing more; RED's flip stops at 477, scrolling, and after one signal at 877, blank below; `V + c` posts nothing more for any signal; `2V + c` once more, at the first",
    );
  });
});

/**
 * An event the run dispatches, with the members the frame or a planted read takes: a window
 * listener's `currentTarget`, `target`, `srcElement` and `composedPath()`, a message's `data` and
 * `source`, an input event's `view`, an error's `message`, a rejection's `reason`, a `pagehide`'s
 * `persisted`.
 */
interface RunEvent {
  readonly composedPath?: () => readonly object[];
  readonly currentTarget?: object;
  readonly data?: IslandData;
  readonly message?: string;
  readonly persisted?: boolean;
  readonly reason?: Error | string;
  readonly source?: object;
  readonly srcElement?: object;
  readonly target?: object;
  readonly view?: object;
}

/**
 * An element of the run's document: its tag, the listeners the frame adds to it by type, the
 * members it writes, its document, and a way for the run's own scripts to fire it an event.
 */
interface RunElement {
  readonly addEventListener: (type: string, listener: (event: RunEvent) => void) => void;
  readonly append: (...children: readonly unknown[]) => void;
  readonly dataset: { pciDom?: string };
  readonly fire: (type: string, event: RunEvent) => void;
  innerHTML: string;
  readonly listeners: Map<string, (event: RunEvent) => void>;
  readonly ownerDocument: object;
  src: string;
  readonly tag: string;
}

/**
 * Listeners by event type, each type's in the order they were added, and the object they were
 * added to.
 */
interface Listeners extends Map<string, ((event: RunEvent) => void)[]> {
  owner: object;
}

/**
 * Give an object's empty listeners.
 *
 * @returns The listeners, their owner to be set once the object is made.
 */
const listenersOf = (): Listeners => Object.assign(new Map(), { owner: {} });

/**
 * A run of the frame page's script in a `node:vm` context of its own: the names read and the moment
 * `define` was installed, in order; the context's window; the island; the listeners added to the
 * window and to the document; the elements the frame made, in order; the island's posts; the timers
 * the frame set, by their ids; its `ResizeObserver` and `MutationObserver` callbacks; the
 * viewport's height, which `matchMedia` answers by; the document's style sheets, in order, the
 * page's pins among them where the run has them, the pins' node and a way to make another, as a
 * PCI's `style` is, and the nodes whose sheet has not loaded, a link's, which the document's order
 * holds and `styleSheets` does not; and a way to run a script of the PCI's in the same context, as
 * a module file the frame loaded runs.
 */
interface Run {
  readonly elements: RunElement[];
  readonly evaluate: (source: string) => void;
  readonly global: object;
  readonly island: object;
  readonly log: string[];
  readonly mutations: (() => void)[];
  readonly observers: ((entries: readonly object[]) => void)[];
  readonly on: Listeners;
  readonly onDocument: Listeners;
  readonly owner: () => SheetOwner;
  readonly pending: Set<SheetOwner>;
  readonly pins: SheetOwner;
  readonly posted: FrameToPage[];
  readonly sheets: RunSheet[];
  readonly timers: Map<number, () => void>;
  readonly viewport: { height: number };
}

/**
 * A node that owns a style sheet in a run, a `style` element, which another can be put before, as
 * the DOM's `before` puts it.
 */
interface SheetOwner {
  readonly before: (moved: SheetOwner) => void;
}

/**
 * A style sheet of a run's document, by its node and where the node stands: in the head, or in
 * the root before the head, where a PCI can put a `style` with `documentElement.prepend`, ahead of
 * everything the head holds.
 */
interface RunSheet {
  readonly ownerNode: SheetOwner;
  place: "before the head" | "in the head";
}

/**
 * The name the boot's script runs under in a run, by which its coverage is found.
 */
const bootFile = "frame-boot.js";

/**
 * Add a listener to a list of listeners by type.
 *
 * @param listeners The listeners, by type.
 * @param type The type.
 * @param listener The listener.
 */
const listen = (listeners: Listeners, type: string, listener: (event: RunEvent) => void): void => {
  listeners.set(type, [...(listeners.get(type) ?? []), listener]);
};

/**
 * Dispatch an event to the listeners of a type, each called as a browser calls it, with its
 * `this` the listeners' owner, the object they were added to.
 *
 * @param listeners The listeners, by type, and their owner.
 * @param type The type.
 * @param event The event.
 */
const dispatch = (listeners: Listeners, type: string, event: RunEvent): void => {
  for (const listener of listeners.get(type) ?? []) {
    listener.call(listeners.owner, event);
  }
};

/**
 * Run a script in a `node:vm` context whose global records each read of every name in
 * {@link replaceable}, as the name, and the installing of `define`, as `"define"`. `parent` gives
 * the island, and every other name undefined. `window` is that global, and so are `this` at the
 * script's top, the document's `defaultView` and an element's `ownerDocument.defaultView`, so a
 * read through any of them reaches the same recording global.
 *
 * @param script The script's text.
 * @param hash The frame's URL's fragment, its nonce after the `#`.
 * @param pinned Whether the document holds the page's pins, its one style sheet, as the frame page
 *   does, when the script runs.
 * @returns The run, its script evaluated.
 */
const ran = (script: string, hash: string, pinned: boolean): Run => {
  const log: string[] = [];
  const posted: FrameToPage[] = [];
  const on = listenersOf();
  const onDocument = listenersOf();
  const elements: RunElement[] = [];
  const timers = new Map<number, () => void>();
  const observers: ((entries: readonly object[]) => void)[] = [];
  const mutations: (() => void)[] = [];
  const viewport = { height: 0 };
  const sheets: RunSheet[] = [];
  const taken = (moved: SheetOwner, place: RunSheet["place"]): RunSheet => {
    const at = sheets.findIndex(({ ownerNode }) => ownerNode === moved);
    const sheet = (at === -1 ? undefined : sheets.splice(at, 1)[0]) ?? { ownerNode: moved, place };

    sheet.place = place;

    return sheet;
  };
  const owner = (): SheetOwner => {
    const node: SheetOwner = {
      before: (moved) => {
        const at = sheets.findIndex(({ ownerNode }) => ownerNode === node);

        sheets.splice(at, 0, taken(moved, sheets[at]?.place ?? "in the head"));
      },
    };

    return node;
  };
  const pins = owner();
  const pending = new Set<SheetOwner>();

  if (pinned) {
    sheets.push({ ownerNode: pins, place: "in the head" });
  }

  const installed = new Map<string, FixtureContext | FixtureDefine>();
  let timed = 0;
  const island = {
    postMessage: (message: FrameToPage) => {
      posted.push(message);
    },
  };
  const sandbox = {
    CustomEvent: class {
      detail: unknown = undefined;
    },
    MutationObserver: class {
      readonly observed: Document[] = [];

      constructor(report: () => void) {
        mutations.push(report);
      }

      observe(target: Document): void {
        this.observed.push(target);
      }
    },
    ResizeObserver: class {
      readonly observed: Element[] = [];

      constructor(report: (entries: readonly object[]) => void) {
        observers.push(report);
      }

      observe(target: Element): void {
        this.observed.push(target);
      }
    },
    addEventListener: (type: string, listener: (event: RunEvent) => void) => {
      listen(on, type, listener);
    },
    clearTimeout: (id: number) => {
      timers.delete(id);
    },
    fire: (type: string, event: RunEvent) => {
      dispatch(on, type, event);
    },
    location: { hash },
    matchMedia: (query: string) => ({
      matches: query === `(height: ${String(viewport.height)}px)`,
    }),
    setTimeout: (later: () => void) => {
      timed += 1;
      timers.set(timed, later);

      return timed;
    },
  };
  const documentOf = {
    addEventListener: (type: string, listener: (event: RunEvent) => void) => {
      listen(onDocument, type, listener);
    },
    body: { append: () => {}, ownerDocument: {} },
    createElement: (tag: string): RunElement => {
      const listeners = new Map<string, (event: RunEvent) => void>();
      const element: RunElement = {
        addEventListener: (type, listener) => {
          listeners.set(type, listener);
        },
        append: () => {},
        dataset: {},
        fire: (type, event) => {
          const listener = listeners.get(type);

          listener?.call(element, event);
        },
        innerHTML: "",
        listeners,
        ownerDocument: documentOf,
        src: "",
        tag,
      };

      elements.push(element);

      return element;
    },
    defaultView: sandbox,
    documentElement: {
      dataset: {},
      dir: "",
      lang: "",
    },
    fonts: { addEventListener: () => {} },
    head: {
      append: () => {},
      prepend: (moved: SheetOwner) => {
        const sheet = taken(moved, "in the head");

        sheets.splice(sheets.filter(({ place }) => place === "before the head").length, 0, sheet);
      },
    },
    made: elements,
    querySelector: () => sheets[0]?.ownerNode ?? null,
    get styleSheets() {
      return sheets.filter(({ ownerNode }) => !pending.has(ownerNode));
    },
    title: "",
  };

  documentOf.body.ownerDocument = documentOf;
  on.owner = sandbox;
  onDocument.owner = documentOf;

  for (const name of replaceable) {
    Object.defineProperty(sandbox, name, {
      configurable: true,
      get: () => {
        log.push(name);

        return name === "parent" ? island : undefined;
      },
    });
  }

  Object.defineProperty(sandbox, "define", {
    configurable: true,
    get: () => installed.get("define"),
    set: (value: FixtureDefine) => {
      log.push("define");
      installed.set("define", value);
    },
  });
  Object.defineProperty(sandbox, "qtiCustomInteractionContext", {
    configurable: true,
    get: () => installed.get("qtiCustomInteractionContext"),
    set: (value: FixtureContext) => {
      installed.set("qtiCustomInteractionContext", value);
    },
  });

  Object.defineProperty(sandbox, "document", { value: documentOf });
  Object.defineProperty(sandbox, "window", { value: sandbox });

  const context = createContext(sandbox);

  runInContext(script, context, { filename: bootFile });

  return {
    elements,
    evaluate: (source) => {
      runInContext(source, context, { filename: "module.js" });
    },
    global: sandbox,
    island,
    log,
    mutations,
    observers,
    on,
    onDocument,
    owner,
    pending,
    pins,
    posted,
    sheets,
    timers,
    viewport,
  };
};

/**
 * Run every timer the frame has set, in order, and those they set, which a `Map`'s iteration
 * reaches as they are added, each as HTML calls it, with its `this` the window.
 *
 * @param run The run.
 */
const ranOut = (run: Run): void => {
  for (const [id, timer] of run.timers) {
    run.timers.delete(id);
    timer.call(run.global);
  }
};

/**
 * What a message to the frame carries: the island's message, or what another window, or no
 * window's protocol, sends: an object with or without a kind and a nonce, or no object at all.
 */
type IslandData = PageMessage | { readonly kind?: string; readonly nonce?: string } | number;

/**
 * A message from the island, as the frame's window listener hears it.
 *
 * @param run The run.
 * @param data The message.
 * @returns The event.
 */
const fromIsland = (run: Run, data: IslandData): RunEvent => ({
  composedPath: () => [run.global],
  currentTarget: run.global,
  data,
  source: run.island,
  srcElement: run.global,
  target: run.global,
});

/**
 * An event at the frame's window, its `currentTarget` and `target` the window.
 *
 * @param run The run.
 * @param event The event's own members.
 * @returns The event.
 */
const atWindow = (run: Run, event: RunEvent): RunEvent => ({
  ...event,
  composedPath: () => [run.global],
  currentTarget: run.global,
  srcElement: run.global,
  target: run.global,
});

/**
 * The island's `load`, for routes and an entry, with one template.
 *
 * @param routes The routes.
 * @param entry The entry module's id, none where the PCI names none.
 * @returns The message.
 */
const loadOf = (routes: readonly PciFrameRoute[], entry: string | null): PageMessage => {
  const load: PageMessage = {
    dir: "ltr",
    kind: "load",
    lang: "en",
    markup: "<p>markup</p>",
    nonce,
    routes,
    templates: ["<b>template</b>"],
    title: "PCI",
  };

  return entry === null ? load : { ...load, entry };
};

/**
 * A route of one primary location and no fallback.
 *
 * @param id The route's id.
 * @returns The route.
 */
const routeOf = (id: string): PciFrameRoute => ({ id, primary: `modules/${id}.js` });

/**
 * A route of one primary location and a fallback after it, `modules/fallback.js`, which alone
 * holds a wait for the primary (reading `pci-wait-before-fallback`).
 *
 * @param id The route's id.
 * @param primaryWaitSeconds The primary's wait before the fallback, in seconds, 0 for no limit.
 * @returns The route.
 */
const fallingBackOf = (id: string, primaryWaitSeconds: number): PciFrameRoute => ({
  ...routeOf(id),
  fallback: { location: "modules/fallback.js", primaryWaitSeconds },
});

/**
 * The script element the frame made last.
 *
 * @param run The run.
 * @returns The element, none where it made none.
 */
const lastScript = (run: Run): RunElement | undefined =>
  run.elements.findLast((element) => element.tag === "script");

/**
 * A PCI module, as its file's script runs it in the frame: named modules that resolve as AMD has
 * them (one that fills `exports`, one whose factory is a value, one wrapped as CommonJS that
 * `require`s another, two that depend on each other), and an anonymous one, the entry, that asks
 * for them all with the bridge, `require`, `exports` and `module`, calls `require` each way, and
 * registers a non-factory and then its factory, whose instance keeps `ondone` for later.
 */
const wholeModule = `
define("b", ["exports"], function (exports) { exports.value = 1; });
define("c", { constant: true });
define("d", function (require, exports, module) { module.exports = require("c"); });
define("e", ["e2"], function (x) { return x; });
define("e2", ["e"], function (x) { return x; });
define(["qtiCustomInteractionContext", "b", "d", "e", "require", "exports", "module"], function (context, b, d, e, req) {
  req(["c"], function () {});
  req("nothing");
  req(5);
  context.register({});
  context.register({
    getInstance: function (dom, configuration) {
      var instance = {
        getResponse: function () { return { base: { integer: 1 } }; },
        getState: function () { return ""; },
        oncompleted: function () {},
      };
      globalThis.finish = function () { configuration.ondone(instance, { base: { integer: 1 } }, ""); };
      configuration.onready(instance, "");
      return instance;
    },
    typeIdentifier: "urn:qti-pie:test:read",
  });
});
`;

/**
 * Fire the PCI's `qti-interaction-changed` at the frame's `dom`, from a script of the PCI's, with a
 * detail.
 *
 * @param detail The detail's source text.
 * @returns The script.
 */
const changedWith = (detail: string): string =>
  `var changed = new CustomEvent("qti-interaction-changed"); changed.detail = ${detail}; document.made[0].fire("qti-interaction-changed", changed);`;

/**
 * Play RED i5's `pins-fight` in a run: the boot's observer takes the document's mutations, and a
 * PCI whose own observer answers each move of the pins ahead of its sheet by putting the sheet
 * back first, or, where it makes them anew, a new sheet, for at most a number of rounds, all in
 * one task.
 *
 * @param run The run, its script evaluated.
 * @param sheet The PCI's sheet, first in the document.
 * @param rounds The most rounds to play.
 * @param anew Whether the PCI puts a new sheet first each time, rather than its own back.
 * @returns How many times the boot moved the pins ahead of the PCI's sheet.
 */
const fought = (run: Run, sheet: RunSheet, rounds: number, anew: boolean): number => {
  for (const mutated of run.mutations) {
    mutated();
  }

  if (rounds === 0 || run.sheets[0] === sheet) {
    return 0;
  }

  const next: RunSheet = anew ? { ownerNode: run.owner(), place: "in the head" } : sheet;

  run.sheets.splice(run.sheets.indexOf(next), anew ? 0 : 1);
  run.sheets.unshift(next);

  return 1 + fought(run, next, rounds - 1, anew);
};

/**
 * Play RED i5's `pins-fight-new` in a run, for a number of tasks: in each, the boot's observer
 * takes the document's mutations, and a PCI whose own observer answers each move of the pins by
 * putting a new sheet first, for at most a number of rounds; then the task's timers run.
 *
 * @param run The run, its script evaluated.
 * @param tasks How many tasks to play.
 * @returns How many times the boot moved the pins in each task.
 */
const foughtAnew = (run: Run, tasks: number): readonly number[] => {
  if (tasks === 0) {
    return [];
  }

  run.sheets.unshift({ ownerNode: run.owner(), place: "in the head" });

  const moves = fought(
    run,
    run.sheets[0] ?? { ownerNode: run.owner(), place: "in the head" },
    100,
    true,
  );

  ranOut(run);

  return [moves, ...foughtAnew(run, tasks - 1)];
};

/**
 * Play RED i5's `pins-fight` in a run across a number of tasks: in each, the document changes, the
 * boot's observer takes the mutation, and the PCI's observer puts its own sheet back first each
 * time the boot moves the pins ahead of it; then the task's timers run.
 *
 * @param run The run, its script evaluated.
 * @param sheet The PCI's sheet, first in the document.
 * @param tasks How many tasks to play.
 * @returns How many times the boot moved the pins in each task.
 */
const foughtAcross = (run: Run, sheet: RunSheet, tasks: number): readonly number[] => {
  if (tasks === 0) {
    return [];
  }

  const moves = fought(run, sheet, 100, false);

  ranOut(run);

  return [moves, ...foughtAcross(run, sheet, tasks - 1)];
};

/**
 * Put a PCI's sheet first in a run's document, a mutation the boot's observer takes.
 *
 * @param run The run, its script evaluated.
 */
const prepended = (run: Run): void => {
  run.sheets.unshift({ ownerNode: run.owner(), place: "in the head" });

  for (const mutated of run.mutations) {
    mutated();
  }
};

/**
 * Play RED i5's `pins-fight-new` in a run through its timers: the frame's timers run one by one,
 * and wherever one leaves the pins first, the PCI's observer answers with a new sheet put first,
 * a mutation the boot's observer takes, for at most a number of timers.
 *
 * @param run The run, its script evaluated.
 * @param rounds The most timers to run.
 * @returns How many times a timer left the pins first.
 */
const answered = (run: Run, rounds: number): number => {
  const [next] = [...run.timers];

  if (next === undefined || rounds === 0) {
    return 0;
  }

  run.timers.delete(next[0]);
  next[1].call(run.global);

  const first = run.sheets[0]?.ownerNode === run.pins;

  if (first) {
    prepended(run);
  }

  return (first ? 1 : 0) + answered(run, rounds - 1);
};

/**
 * Play COLD i5's case in a run: a PCI puts a sheet first, the pins move ahead of it, and the PCI
 * puts a second sheet first later in that task, in a later microtask or after an `await`, or in a
 * 0 ms timer of its own set before the boot's; then the task's timers run.
 *
 * @param run The run, its script evaluated.
 * @param own Whether the second sheet comes in a timer of the PCI's own.
 * @returns Whether the pins end first.
 */
const secondLater = (run: Run, own: boolean): boolean => {
  if (own) {
    run.timers.set(0, () => {
      prepended(run);
    });
  }

  prepended(run);

  if (!own) {
    prepended(run);
  }

  ranOut(run);

  return run.sheets[0]?.ownerNode === run.pins;
};

/**
 * Run the timer a run's frame set last, and only that one.
 *
 * @param run The run.
 */
const ranLast = (run: Run): void => {
  const [last] = [...run.timers].slice(-1);

  if (last !== undefined) {
    run.timers.delete(last[0]);
    last[1].call(run.global);
  }
};

/**
 * Drive a run of the frame through its whole life, and every way it is entered on the way:
 * messages that are no island's (no object, no nonce, an unknown kind, another nonce, another
 * window), an `instantiate` before the `load`, the `load` and a second one, the PCI's module file
 * (`wholeModule`), a factory chosen that is not registered and then one that is, a second
 * `instantiate`, an input before and after, each way the PCI fires `qti-interaction-changed`,
 * `ondone`, observations of the root (an entry with no box, an echo of the frame's own resize,
 * posted once more, and the echo of that post, dropped, as `V + c` grows and as other content does,
 * a change a mutation signals, a signal that posts a dropped echo, a signal's post whose echo is
 * dropped, a signal with nothing to post, content that contracts, `V / 2 + 750`, whose fixed point,
 * 1500, is posted and fits, a mutation before an echo the frame drops, which posts it at once, an
 * estimate a step skews, refitted to a point that fits, an estimate whose refit has no fixed point,
 * which posts the content's own height, whose echo does not fit and is kept for a signal, a refit
 * that does not fit either, which posts the content's own height, an estimate the bound holds at
 * the content plus its viewport, whose echo no observation brings, as the root's box does not
 * change, so the timer after the `resize` checks it, and changes at a fixed viewport: followed by
 * the kept slope beside `V + c`, its echo as the slope says and off it; with no slope kept; a
 * contraction's, posted at the kept slope's fixed point; one the slope cannot follow; a followed
 * change the timer checks; and one after the frame's width changed, which forgets the slope; and
 * dropped echoes a signal posts, whose echoes are off the kept slope, refitted through the drop
 * and the echo, and, where that refit is the change's second, dropped; and a followed change off
 * the slope refitted to an estimate whose own height, posted with no slope to check, does not fit
 * and is kept), a style sheet put before
 * the pins and the pins removed, each with the mutation that puts them back first, a `resize`, an
 * uncaught error, unhandled rejections, a message the frame posts itself, a `pagehide` the
 * back/forward cache keeps, `complete` twice, and the `pagehide` that unloads it. Each event names
 * the frame's window where a browser's would.
 *
 * @param run The run, its script evaluated.
 * @returns Once the run has been driven.
 */
const wholeLife = async (run: Run): Promise<void> => {
  const typeIdentifier = "urn:qti-pie:test:read";

  for (const data of [5, {}, { kind: "unknown", nonce }, { kind: "complete", nonce: "other" }]) {
    dispatch(run.on, "message", fromIsland(run, data));
  }

  dispatch(run.on, "message", { ...fromIsland(run, { kind: "complete", nonce }), source: {} });
  dispatch(run.on, "message", fromIsland(run, instantiateOf(typeIdentifier)));
  dispatch(run.on, "message", fromIsland(run, loadOf([routeOf("a")], "a")));
  dispatch(run.on, "message", fromIsland(run, loadOf([routeOf("a")], "a")));
  run.evaluate(changedWith("{}"));
  dispatch(run.onDocument, "pointerup", { view: run.global });
  ranOut(run);
  run.evaluate(wholeModule);
  lastScript(run)?.fire("load", {});
  run.evaluate("define(function () {});");
  await setImmediate();
  dispatch(run.on, "message", fromIsland(run, instantiateOf("urn:qti-pie:test:unregistered")));
  dispatch(run.on, "message", fromIsland(run, instantiateOf(typeIdentifier)));
  dispatch(run.on, "message", fromIsland(run, instantiateOf(typeIdentifier)));
  dispatch(run.onDocument, "pointerup", { view: run.global });
  ranOut(run);
  dispatch(run.onDocument, "pointerup", { view: run.global });
  ranOut(run);
  run.evaluate(
    changedWith(
      `{ interaction: { getResponse: function () { return 2; }, getState: function () { return ""; } }, responseIdentifier: "R2", valid: true, value: { base: { integer: 3 } } }`,
    ),
  );
  run.evaluate(changedWith("{}"));
  run.evaluate(changedWith("{ value: undefined }"));
  run.evaluate(changedWith("5"));
  run.evaluate(`document.made[0].fire("qti-interaction-changed", {});`);
  run.evaluate("finish();");

  for (const observer of run.observers) {
    observer([]);
    observer([{ borderBoxSize: [] }]);
    observer([{ borderBoxSize: [{ blockSize: 216, inlineSize: 600 }] }]);
    run.viewport.height = 216;
    observer([{ borderBoxSize: [{ blockSize: 240, inlineSize: 600 }] }]);
    dispatch(run.on, "resize", {});
    ranOut(run);

    for (const mutated of run.mutations) {
      mutated();
    }

    observer([{ borderBoxSize: [{ blockSize: 300, inlineSize: 600 }] }]);
    run.viewport.height = 300;
    observer([{ borderBoxSize: [{ blockSize: 324, inlineSize: 600 }] }]);
    run.viewport.height = 324;
    observer([{ borderBoxSize: [{ blockSize: 348, inlineSize: 600 }] }]);

    for (const mutated of run.mutations) {
      mutated();
    }

    run.sheets.unshift({ ownerNode: run.owner(), place: "in the head" });

    for (const mutated of run.mutations) {
      mutated();
    }

    run.sheets.splice(0);

    for (const mutated of run.mutations) {
      mutated();
    }

    ranLast(run);

    for (const mutated of run.mutations) {
      mutated();
    }

    run.viewport.height = 0;
    observer([{ borderBoxSize: [{ blockSize: 400, inlineSize: 600 }] }]);
    run.viewport.height = 400;
    observer([{ borderBoxSize: [{ blockSize: 500, inlineSize: 600 }] }]);
    run.viewport.height = 500;
    observer([{ borderBoxSize: [{ blockSize: 700, inlineSize: 600 }] }]);

    for (const mutated of run.mutations) {
      mutated();
    }

    run.viewport.height = 700;
    observer([{ borderBoxSize: [{ blockSize: 1000, inlineSize: 600 }] }]);

    for (const mutated of run.mutations) {
      mutated();
    }

    run.viewport.height = 1000;
    observer([{ borderBoxSize: [{ blockSize: 1050, inlineSize: 600 }] }]);
    run.viewport.height = 0;
    observer([{ borderBoxSize: [{ blockSize: 1100, inlineSize: 600 }] }]);
    run.viewport.height = 1100;
    observer([{ borderBoxSize: [{ blockSize: 1300, inlineSize: 600 }] }]);
    run.viewport.height = 1300;
    observer([{ borderBoxSize: [{ blockSize: 1400, inlineSize: 600 }] }]);
    run.viewport.height = 1500;
    observer([{ borderBoxSize: [{ blockSize: 1500, inlineSize: 600 }] }]);
    run.viewport.height = 0;
    observer([{ borderBoxSize: [{ blockSize: 1600, inlineSize: 600 }] }]);
    run.viewport.height = 1600;
    observer([{ borderBoxSize: [{ blockSize: 1700, inlineSize: 600 }] }]);

    for (const mutated of run.mutations) {
      mutated();
    }

    run.viewport.height = 1700;
    observer([{ borderBoxSize: [{ blockSize: 1900, inlineSize: 600 }] }]);
    run.viewport.height = 1900;
    observer([{ borderBoxSize: [{ blockSize: 2000, inlineSize: 600 }] }]);
    run.viewport.height = 0;
    observer([{ borderBoxSize: [{ blockSize: 2050, inlineSize: 600 }] }]);
    run.viewport.height = 2050;
    observer([{ borderBoxSize: [{ blockSize: 2125, inlineSize: 600 }] }]);
    run.viewport.height = 2125;
    observer([{ borderBoxSize: [{ blockSize: 2181.25, inlineSize: 600 }] }]);
    run.viewport.height = 2350;
    observer([{ borderBoxSize: [{ blockSize: 2293.75, inlineSize: 600 }] }]);
    run.viewport.height = 2238;
    observer([{ borderBoxSize: [{ blockSize: 2237.75, inlineSize: 600 }] }]);
    run.viewport.height = 0;
    observer([{ borderBoxSize: [{ blockSize: 3000, inlineSize: 600 }] }]);
    run.viewport.height = 3000;
    observer([{ borderBoxSize: [{ blockSize: 3100, inlineSize: 600 }] }]);
    run.viewport.height = 3100;
    observer([{ borderBoxSize: [{ blockSize: 3150, inlineSize: 600 }] }]);
    run.viewport.height = 3200;
    observer([{ borderBoxSize: [{ blockSize: 3700, inlineSize: 600 }] }]);
    run.viewport.height = 3700;
    observer([{ borderBoxSize: [{ blockSize: 3950, inlineSize: 600 }] }]);

    for (const mutated of run.mutations) {
      mutated();
    }

    run.viewport.height = 3950;
    observer([{ borderBoxSize: [{ blockSize: 3975, inlineSize: 600 }] }]);
    run.viewport.height = 0;
    observer([{ borderBoxSize: [{ blockSize: 4500, inlineSize: 600 }] }]);
    run.viewport.height = 4500;
    observer([{ borderBoxSize: [{ blockSize: 4650, inlineSize: 600 }] }]);
    run.viewport.height = 4650;
    observer([{ borderBoxSize: [{ blockSize: 4755, inlineSize: 600 }] }]);
    run.viewport.height = 5000;
    observer([{ borderBoxSize: [{ blockSize: 4930, inlineSize: 600 }] }]);
    run.viewport.height = 4860;
    observer([{ borderBoxSize: [{ blockSize: 4960, inlineSize: 600 }] }]);
    run.viewport.height = 4960;
    observer([{ borderBoxSize: [{ blockSize: 4960, inlineSize: 600 }] }]);
    run.viewport.height = 0;
    observer([{ borderBoxSize: [{ blockSize: 5000, inlineSize: 600 }] }]);
    run.viewport.height = 5000;
    observer([{ borderBoxSize: [{ blockSize: 5200, inlineSize: 600 }] }]);
    run.viewport.height = 5200;
    observer([{ borderBoxSize: [{ blockSize: 5398, inlineSize: 600 }] }]);
    run.viewport.height = 10_598;
    dispatch(run.on, "resize", {});
    ranOut(run);
    run.viewport.height = 0;
    observer([{ borderBoxSize: [{ blockSize: 6000, inlineSize: 600 }] }]);
    run.viewport.height = 6000;
    observer([{ borderBoxSize: [{ blockSize: 6100, inlineSize: 600 }] }]);
    run.viewport.height = 6100;
    observer([{ borderBoxSize: [{ blockSize: 6200, inlineSize: 600 }] }]);
    observer([{ borderBoxSize: [{ blockSize: 6220, inlineSize: 600 }] }]);
    run.viewport.height = 6120;
    observer([{ borderBoxSize: [{ blockSize: 6240, inlineSize: 600 }] }]);
    observer([{ borderBoxSize: [{ blockSize: 6200, inlineSize: 600 }] }]);
    run.viewport.height = 6080;
    observer([{ borderBoxSize: [{ blockSize: 6300, inlineSize: 600 }] }]);
    run.viewport.height = 6300;
    dispatch(run.on, "resize", {});
    ranOut(run);
    observer([{ borderBoxSize: [{ blockSize: 6350, inlineSize: 600 }] }]);
    run.viewport.height = 0;
    observer([{ borderBoxSize: [{ blockSize: 7000, inlineSize: 600 }] }]);
    run.viewport.height = 7000;
    observer([{ borderBoxSize: [{ blockSize: 7500, inlineSize: 600 }] }]);
    run.viewport.height = 7500;
    observer([{ borderBoxSize: [{ blockSize: 7750, inlineSize: 600 }] }]);
    run.viewport.height = 8000;
    observer([{ borderBoxSize: [{ blockSize: 8000, inlineSize: 600 }] }]);
    observer([{ borderBoxSize: [{ blockSize: 8020, inlineSize: 600 }] }]);
    run.viewport.height = 8040;
    observer([{ borderBoxSize: [{ blockSize: 8040, inlineSize: 600 }] }]);
    run.viewport.height = 0;
    observer([{ borderBoxSize: [{ blockSize: 9000, inlineSize: 600 }] }]);
    run.viewport.height = 9000;
    observer([{ borderBoxSize: [{ blockSize: 9100, inlineSize: 600 }] }]);
    run.viewport.height = 9100;
    observer([{ borderBoxSize: [{ blockSize: 9200, inlineSize: 600 }] }]);
    observer([{ borderBoxSize: [{ blockSize: 50, inlineSize: 600 }] }]);
    run.viewport.height = 0;
    observer([{ borderBoxSize: [{ blockSize: 9500, inlineSize: 600 }] }]);
    run.viewport.height = 9500;
    observer([{ borderBoxSize: [{ blockSize: 9600, inlineSize: 600 }] }]);
    run.viewport.height = 9600;
    observer([{ borderBoxSize: [{ blockSize: 9700, inlineSize: 600 }] }]);
    observer([{ borderBoxSize: [{ blockSize: 9720, inlineSize: 600 }] }]);
    run.viewport.height = 9620;
    dispatch(run.on, "resize", {});
    ranOut(run);
    run.viewport.height = 0;
    observer([{ borderBoxSize: [{ blockSize: 10_000, inlineSize: 600 }] }]);
    run.viewport.height = 10_000;
    observer([{ borderBoxSize: [{ blockSize: 10_100, inlineSize: 600 }] }]);
    run.viewport.height = 10_100;
    observer([{ borderBoxSize: [{ blockSize: 10_200, inlineSize: 600 }] }]);
    observer([{ borderBoxSize: [{ blockSize: 10_300.5, inlineSize: 601 }] }]);
    run.viewport.height = 10_301;
    dispatch(run.on, "resize", {});
    ranOut(run);
    observer([{ borderBoxSize: [{ blockSize: 10_420, inlineSize: 601 }] }]);
    run.viewport.height = 0;
    observer([{ borderBoxSize: [{ blockSize: 20_000, inlineSize: 601 }] }]);
    run.viewport.height = 20_000;
    observer([{ borderBoxSize: [{ blockSize: 20_100, inlineSize: 601 }] }]);
    run.viewport.height = 20_100;
    observer([{ borderBoxSize: [{ blockSize: 20_200, inlineSize: 601 }] }]);
    observer([{ borderBoxSize: [{ blockSize: 20_220, inlineSize: 601 }] }]);
    run.viewport.height = 20_120;
    observer([{ borderBoxSize: [{ blockSize: 20_230, inlineSize: 601 }] }]);
    run.viewport.height = 20_340;
    observer([{ borderBoxSize: [{ blockSize: 20_500, inlineSize: 601 }] }]);
    run.viewport.height = 20_500;
    observer([{ borderBoxSize: [{ blockSize: 20_600, inlineSize: 601 }] }]);
  }

  dispatch(run.on, "error", atWindow(run, { message: "thrown" }));
  dispatch(run.on, "unhandledrejection", atWindow(run, { reason: new Error("rejected") }));
  run.evaluate(
    'fire("unhandledrejection", { currentTarget: window, reason: new Error("rejected"), target: window });',
  );
  dispatch(run.on, "message", {
    ...fromIsland(run, { kind: "complete", nonce }),
    source: run.global,
  });
  dispatch(run.on, "pagehide", atWindow(run, { persisted: true }));
  dispatch(run.on, "message", fromIsland(run, { kind: "complete", nonce }));
  dispatch(run.on, "message", fromIsland(run, { kind: "complete", nonce }));
  dispatch(run.onDocument, "pointerup", { view: run.global });
  ranOut(run);
  run.evaluate(changedWith("{}"));
  dispatch(run.on, "pagehide", atWindow(run, { persisted: false }));
  await setImmediate();
};

/**
 * Drive a run whose one route's primary does not load, but its fallback does, beside a route with
 * no location, the PCI naming no entry module, then complete it before any factory is chosen.
 *
 * @param run The run.
 * @returns Once driven.
 */
const fallenBack = async (run: Run): Promise<void> => {
  dispatch(run.on, "message", fromIsland(run, loadOf([fallingBackOf("a", 0), { id: "z" }], null)));
  lastScript(run)?.fire("error", {});
  await setImmediate();
  run.evaluate("define(function () { return 1; });");
  lastScript(run)?.fire("load", {});
  await setImmediate();
  dispatch(run.on, "message", fromIsland(run, { kind: "complete", nonce }));
};

/**
 * Drive a run whose first route's only location does not load, and whose script then reports
 * loading after all, which the settled load ignores; then a mutation of its document, which holds
 * no pins to keep first.
 *
 * @param run The run.
 * @returns Once driven.
 */
const exhausted = async (run: Run): Promise<void> => {
  dispatch(run.on, "message", fromIsland(run, loadOf([routeOf("a"), routeOf("b")], "a")));
  lastScript(run)?.fire("error", {});
  lastScript(run)?.fire("load", {});

  for (const mutated of run.mutations) {
    mutated();
  }

  await setImmediate();
};

/**
 * Drive a run whose primary, a fallback after it, does not load within the fallback's stated
 * wait, so the fallback loads instead and its script defines nothing; the primary's module
 * defined late, and its script's `load` late, change nothing of the settled load.
 *
 * @param run The run.
 * @returns Once driven.
 */
const timedOut = async (run: Run): Promise<void> => {
  dispatch(run.on, "message", fromIsland(run, loadOf([fallingBackOf("a", 5)], "a")));

  const primaryScript = lastScript(run);

  ranOut(run);
  await setImmediate();
  lastScript(run)?.fire("load", {});
  primaryScript?.fire("load", {});
  run.evaluate('define("a", function () {});');
  lastScript(run)?.fire("load", {});
  await setImmediate();
};

/**
 * Drive a run whose entry module depends on a module no route defines, its primary's wait before
 * its fallback longer than any timer holds.
 *
 * @param run The run.
 * @returns Once driven.
 */
const missingDependency = async (run: Run): Promise<void> => {
  dispatch(run.on, "message", fromIsland(run, loadOf([fallingBackOf("a", 1e9)], "a")));
  run.evaluate('define(["missing"], function () {});');
  lastScript(run)?.fire("load", {});
  await setImmediate();
};

/**
 * Drive a run whose entry module no route defines.
 *
 * @param run The run.
 * @returns Once driven.
 */
const missingEntry = async (run: Run): Promise<void> => {
  dispatch(run.on, "message", fromIsland(run, loadOf([routeOf("a")], "x")));
  run.evaluate("define(function () {});");
  lastScript(run)?.fire("load", {});
  await setImmediate();
};

/**
 * Drive a run in which a script throws while its route loads, then one throws, with no message,
 * and a promise is rejected, with no error, before the PCI runs.
 *
 * @param run The run.
 * @returns Once driven.
 */
const thrownEarly = async (run: Run): Promise<void> => {
  dispatch(run.on, "message", fromIsland(run, loadOf([routeOf("a")], "a")));
  dispatch(run.on, "error", atWindow(run, { message: "thrown while loading" }));
  await setImmediate();
  dispatch(run.on, "error", atWindow(run, { message: "" }));
  dispatch(run.on, "unhandledrejection", atWindow(run, { reason: "no error" }));
};

/**
 * Drive a run whose factory's `getInstance` gives no interaction.
 *
 * @param run The run.
 * @returns Once driven.
 */
const noInteraction = async (run: Run): Promise<void> => {
  dispatch(run.on, "message", fromIsland(run, loadOf([routeOf("a")], "a")));
  run.evaluate(
    'define(["qtiCustomInteractionContext"], function (context) { context.register({ getInstance: function () { return 1; }, typeIdentifier: "urn:qti-pie:test:none" }); });',
  );
  lastScript(run)?.fire("load", {});
  await setImmediate();
  dispatch(run.on, "message", fromIsland(run, instantiateOf("urn:qti-pie:test:none")));
};

/**
 * Every run the coverage test drives: a frame with no nonce, which does nothing, and each life
 * above, each in a context of its own.
 */
const lives: readonly {
  readonly drive: (run: Run) => Promise<void>;
  readonly hash: string;
  readonly name: string;
  readonly pinned: boolean;
}[] = [
  { drive: async () => {}, hash: "", name: "no nonce", pinned: true },
  { drive: wholeLife, hash: `#${nonce}`, name: "its whole life", pinned: true },
  { drive: fallenBack, hash: `#${nonce}`, name: "a fallback", pinned: true },
  { drive: exhausted, hash: `#${nonce}`, name: "a route exhausted", pinned: false },
  { drive: timedOut, hash: `#${nonce}`, name: "a wait run out", pinned: true },
  { drive: missingDependency, hash: `#${nonce}`, name: "a missing dependency", pinned: true },
  { drive: missingEntry, hash: `#${nonce}`, name: "a missing entry", pinned: true },
  { drive: thrownEarly, hash: `#${nonce}`, name: "errors before the PCI runs", pinned: true },
  { drive: noInteraction, hash: `#${nonce}`, name: "no interaction", pinned: true },
];

/**
 * Give the source of each block of a script that no run of it ran, by V8's block coverage of every
 * instance of the script: a block is unrun where every instance's count for it is 0.
 *
 * @param source The script's source.
 * @param scripts The coverage of each instance of it.
 * @returns Each unrun block's source, trimmed, after the source just before it; whitespace alone
 *   dropped.
 */
const unrunBlocks = (
  source: string,
  scripts: readonly Profiler.ScriptCoverage[],
): readonly string[] => {
  const counts = Array.from({ length: source.length }, () => 0);

  for (const script of scripts) {
    const mine = Array.from({ length: source.length }, () => 0);
    const ranges = script.functions
      .flatMap((each) => each.ranges)
      .toSorted(
        (one, other) => one.startOffset - other.startOffset || other.endOffset - one.endOffset,
      );

    for (const range of ranges) {
      mine.fill(range.count, range.startOffset, range.endOffset);
    }

    for (const [at, count] of mine.entries()) {
      counts[at] = Math.max(counts[at] ?? 0, count);
    }
  }

  const blocks: string[] = [];
  let start = -1;

  for (const [at, count] of [...counts, 1].entries()) {
    if (count === 0 && start < 0) {
      start = at;
    } else if (count !== 0 && start >= 0) {
      const block = source.slice(start, at).trim();

      blocks.push(
        block === ""
          ? ""
          : `${source.slice(Math.max(0, start - 60), start).trimStart()} ⟨${block}⟩`,
      );
      start = -1;
    }
  }

  return blocks.filter((block) => block !== "");
};

/**
 * The frame page's one script, inline.
 */
const inlineScript = regex("<script>(?<text>[\\s\\S]*)</script>", "u");

/**
 * The frame page's script, as its HTML carries it.
 *
 * @param html The page's HTML.
 * @returns The script's text.
 */
const scriptOf = (html: string): string => inlineScript.exec(html)?.groups.text ?? "";

/**
 * Write what a run posted, as the posts test lists it: a failure with its reason, a height with
 * its pixels, any other message by its kind.
 *
 * @param message The message.
 * @returns Its text.
 */
const postedAs = (message: FrameToPage): string => {
  if (message.kind === "failed") {
    return `failed (${message.reason})`;
  }

  return message.kind === "height" ? `height ${String(message.pixels)}` : message.kind;
};

describe("the frame's boot, run", () => {
  it("runs every block of the boot, and in every run reads `parent` once, before it installs `define`, and no other replaceable attribute of its window", async () => {
    const page = await Effect.runPromise(framePage.pipe(Effect.provide(Digest.layerWebCrypto)));
    const script = scriptOf(page.html);
    const session = new Session();

    session.connect();
    await session.post("Profiler.enable");
    await session.post("Profiler.startPreciseCoverage", { callCount: true, detailed: true });

    const reads = await Effect.runPromise(
      Effect.forEach(lives, (life) =>
        Effect.promise(async () => {
          const run = ran(script, life.hash, life.pinned);

          await life.drive(run);

          return `${life.name}: ${run.log.join(", ")}`;
        }),
      ),
    );

    const { result } = await session.post("Profiler.takePreciseCoverage");

    await session.post("Profiler.stopPreciseCoverage");
    session.disconnect();

    assert.deepStrictEqual(
      unrunBlocks(
        script,
        result.filter((each) => each.url === bootFile),
      ),
      [],
      "every block of the boot runs in one run or another, so no path of it escapes the read record",
    );
    assert.deepStrictEqual(
      reads,
      lives.map(({ name }) => `${name}: ${name === "no nonce" ? "" : "parent, define"}`),
      "the boot reads `parent` once, before any PCI's code can run, and reads no other attribute a PCI's script could put its own value in place of; with no nonce, it reads nothing",
    );
  });

  it("posts what its whole life posts, each failure by name", async () => {
    const page = await Effect.runPromise(framePage.pipe(Effect.provide(Digest.layerWebCrypto)));
    const script = scriptOf(page.html);
    const posts = await Effect.runPromise(
      Effect.forEach(lives, (life) =>
        Effect.promise(async () => {
          const run = ran(script, life.hash, life.pinned);

          await life.drive(run);

          return `${life.name}: ${run.posted.map(postedAs).join(", ")}`;
        }),
      ),
    );

    assert.deepStrictEqual(posts, [
      "no nonce: ",
      'its whole life: booted, registered, failed (No registered factory serves the type identifier "urn:qti-pie:test:unregistered", or its getInstance returned no interaction.), ready, changed, changed, changed, changed, changed, done, height 216, height 240, height 300, height 324, height 400, height 500, height 700, height 1000, height 1100, height 1300, height 1500, height 1600, height 1700, height 1900, height 2100, height 2050, height 2125, height 2350, height 2238, height 3000, height 3100, height 3200, height 3700, height 4200, height 3975, height 4500, height 4650, height 5000, height 4860, height 4960, height 5000, height 5200, height 10598, height 5398, height 6000, height 6100, height 6120, height 6080, height 6350, height 7000, height 7500, height 8000, height 8040, height 9000, height 9100, height 50, height 9500, height 9600, height 9620, height 10000, height 10100, height 10301, height 10420, height 20000, height 20100, height 20120, height 20340, height 20500, completed',
      "a fallback: booted, registered, completed",
      "a route exhausted: booted, failed (The module script at modules/a.js did not load.)",
      'a wait run out: booted, failed (The module script at modules/a.js did not load within 5 seconds. The module script at modules/fallback.js defined no module "a".)',
      'a missing dependency: booted, failed (The module "a" depends on "missing", which no route defines.)',
      'a missing entry: booted, failed (The entry module "x" was not defined by any route.)',
      "errors before the PCI runs: booted, failed (thrown while loading), failed (A script in the frame threw.), failed (A promise in the frame was rejected.)",
      'no interaction: booted, registered, failed (No registered factory serves the type identifier "urn:qti-pie:test:none", or its getInstance returned no interaction.)',
    ]);
  });

  it("keeps the page's pins first among the document's style sheets, before one a PCI puts ahead of them and back in where a PCI removed them", async () => {
    const page = await Effect.runPromise(framePage.pipe(Effect.provide(Digest.layerWebCrypto)));
    const settled = (change: (run: Run) => void) => {
      const run = ran(scriptOf(page.html), `#${nonce}`, true);

      change(run);

      for (const mutated of run.mutations) {
        mutated();
      }

      return { first: run.sheets[0]?.ownerNode === run.pins, sheets: run.sheets.length };
    };

    assert.deepStrictEqual(
      {
        emptied: settled((run) => {
          run.sheets.splice(0);
        }),
        linked: settled((run) => {
          const link = run.owner();

          run.sheets.unshift({ ownerNode: link, place: "in the head" });
          run.pending.add(link);
        }),
        prepended: settled((run) => {
          run.sheets.unshift({ ownerNode: run.owner(), place: "in the head" });
        }),
        removed: settled((run) => {
          run.sheets.push({ ownerNode: run.owner(), place: "in the head" });
          run.sheets.shift();
        }),
        rooted: settled((run) => {
          run.sheets.unshift({ ownerNode: run.owner(), place: "before the head" });
        }),
      },
      {
        emptied: { first: true, sheets: 1 },
        linked: { first: true, sheets: 2 },
        prepended: { first: true, sheets: 2 },
        removed: { first: true, sheets: 2 },
        rooted: { first: true, sheets: 2 },
      },
      "a style sheet put before the pins, first in the head or in the root ahead of the head, or a stylesheet link whose sheet has not loaded, and so is not yet among the document's sheets, whose layer would come first, and a removal of the pins, with another sheet left and with none, are each undone at the mutation: the pins are put back before the document's first style or link, wherever it stands, or first in the head",
    );
  });

  it("lets a PCI whose own observer keeps its sheet first win after one move, and one that puts a new sheet first at each move win after one move a task, so the frame stays live", async () => {
    const page = await Effect.runPromise(framePage.pipe(Effect.provide(Digest.layerWebCrypto)));
    const run = ran(scriptOf(page.html), `#${nonce}`, true);
    const sheet: RunSheet = { ownerNode: run.owner(), place: "in the head" };

    run.sheets.unshift(sheet);

    const moves = fought(run, sheet, 100, false);
    const anew = ran(scriptOf(page.html), `#${nonce}`, true);
    const across = ran(scriptOf(page.html), `#${nonce}`, true);
    const kept: RunSheet = { ownerNode: across.owner(), place: "in the head" };
    const timed = ran(scriptOf(page.html), `#${nonce}`, true);

    across.sheets.unshift(kept);
    prepended(timed);
    prepended(timed);

    assert.deepStrictEqual(
      {
        across: foughtAcross(across, kept, 3),
        anew: foughtAnew(anew, 3),
        answered: answered(timed, 100),
        first: run.sheets[0] === sheet,
        moves,
      },
      { across: [1, 0, 0], anew: [1, 1, 1], answered: 1, first: true, moves: 1 },
      "RED i5's pins-fight: the boot puts the pins ahead of the PCI's sheet once, the PCI's observer puts its sheet back first, and the boot leaves it there; without the once, the two trade places at every mutation, a microtask loop that freezes the frame. The same fight across three tasks, the document changed in each, moves the pins once in all: the sheet has been passed, so the task's bound alone, which would move them once every task, forever, is not what holds it. RED's pins-fight-new, a new sheet put first at each move, costs the boot one move a task, three tasks three moves, and the page renders between; without the task's bound, a hundred moves in one task at the test's cap. Answered in its timers too, the fight costs one move more, the look that ends the task, which is not looked at again; a look that looked again would trade moves with the PCI timer after timer, a hundred at the test's cap",
    );
  });

  it("puts the pins back first where a PCI puts a second sheet first later in the task they moved in, in a later microtask, after an await or in a 0 ms timer of its own", async () => {
    const page = await Effect.runPromise(framePage.pipe(Effect.provide(Digest.layerWebCrypto)));

    assert.deepStrictEqual(
      {
        microtask: secondLater(ran(scriptOf(page.html), `#${nonce}`, true), false),
        timer: secondLater(ran(scriptOf(page.html), `#${nonce}`, true), true),
      },
      { microtask: true, timer: true },
      "COLD i5: a CSS-in-JS PCI writes a sheet first, the pins move ahead of it, and it writes a second first in the same task, in a later microtask or after an await, or in a 0 ms timer set in that task, which runs before the boot's; the pins cannot move again in that task, and the timer that ends its bound looks once more, so the pins end first in each. Without that look, they stayed second, the root's overflow hidden",
    );
  });

  it("leaves first, as frame-page.ts names, a sheet a PCI puts first after the last look's move and before the timer that ends it", async () => {
    const page = await Effect.runPromise(framePage.pipe(Effect.provide(Digest.layerWebCrypto)));
    const run = ran(scriptOf(page.html), `#${nonce}`, true);

    prepended(run);
    prepended(run);
    run.timers.set(Number.MAX_SAFE_INTEGER, () => {
      prepended(run);
    });
    ranOut(run);

    assert.isFalse(
      run.sheets[0]?.ownerNode === run.pins,
      "COLD i5's residue: a sheet, the pins moved ahead of it; a second after an await, in the same task, which the timer ending the task's bound looks at and moves the pins ahead of; and a third in a 0 ms timer the PCI set after another await, queued after that look and before the timer that ends the look's own bound, which looks no more: the third keeps its place, the pins second. A look that looked again would trade moves with a fight timer after timer, and no bound on it but a tuned count is known",
    );
  });

  it("records a read the syntax scan cannot see: through `this`, a value, an event's window, a computed member", async () => {
    const page = await Effect.runPromise(framePage.pipe(Effect.provide(Digest.layerWebCrypto)));
    const planted = [
      "(() => {",
      "  const own = this; void own.frames;",
      "  void Object.assign(window, {}).opener;",
      '  void document["defaultView"].length;',
      '  void document["default" + "View"].origin;',
      '  void document.body.ownerDocument["defaultView"].status;',
      "  class Late { static { void name; } } void Late;",
      '  addEventListener("message", (event) => { void [event.currentTarget.toolbar, event.target.menubar, event.source.personalbar]; });',
      '  document.addEventListener("pointerup", (event) => { void event.view.scrollbars; }, true);',
      "  setTimeout(function () { void this.locationbar; }, 0);",
      '  addEventListener("resize", function () { void this.statusbar; });',
      '  addEventListener("message", (event) => { void [event.srcElement.screenLeft, event.composedPath()[0].screenTop]; });',
      "})();",
    ].join("\n");
    const run = ran(`${scriptOf(page.html)}\n${planted}`, `#${nonce}`, true);

    await wholeLife(run);

    assert.deepStrictEqual(
      [...new Set(run.log)].toSorted(),
      [
        "define",
        "frames",
        "length",
        "locationbar",
        "menubar",
        "name",
        "opener",
        "origin",
        "parent",
        "personalbar",
        "screenLeft",
        "screenTop",
        "scrollbars",
        "status",
        "statusbar",
        "toolbar",
      ],
      "each planted read is recorded, however it reached the window: COLD's Q1–Q8, RED's six, and RED's four more, a timer's and a listener's `this`, an event's `srcElement` and its `composedPath()`",
    );
  });
});
