/**
 * Plate's PCI frame page (`@qti-pie/plate/ui/pci-frame`) in headless Google Chrome: its boot reads
 * its window's `parent` exactly once, as `host`, over every way the frame lives, the boot's own
 * read the only one. Every frame of the page has a counting getter put in place of `parent` before
 * any of its scripts run, so a read that reaches the window by any path at all, a value, a `this`,
 * an event's window, counts, which no scan of the boot's source and no model of the page can miss.
 *
 * The page is the island's part of plate's frame protocol: it answers the frame's `booted` with a
 * `load` of a life's routes, posts the life's messages, and writes each posted height as the
 * frame's height. The lives are the boot's `node:vm` run's (`frame-boot.test.ts` in plate): its
 * whole life (named and anonymous modules, `require` each way, a factory chosen that is not
 * registered and then one that is, inputs, the PCI's `qti-interaction-changed`, `ondone`, a
 * resize, an uncaught error and a rejection, `complete`, and its unload), a fallback, a route
 * exhausted, a wait run out, a missing dependency, a missing entry, a module that throws while it
 * loads, a factory that gives no interaction; and a frame with no nonce, which reads nothing.
 *
 * @module
 */
import { assert, describe, it } from "@effect/vitest";
import { Effect } from "effect";
import { Digest } from "effect/crypto";
import type { Page } from "playwright-core";
import { chromeFor } from "#specimen/ui/chrome.ts";
import { framePage } from "@qti-pie/plate/ui/pci-frame";

/**
 * The machine's Google Chrome, through specimen's one launcher, a step's failure a defect.
 */
const chrome = chromeFor((_step, cause) => cause);

/**
 * The origin the test's page and its frame are served at, by the test's own routes.
 */
const origin = "https://frame.test";

/**
 * The frame's nonce.
 */
const nonce = "n1";

/**
 * Put a counting getter in place of the frame's `parent`, before any script of the frame's runs:
 * every read of it, by any path, counts, and the count is the frame's `parentReads`.
 */
const counting = (): void => {
  if (location.pathname !== "/frame.html") {
    return;
  }

  const real = window.parent;
  let reads = 0;

  Object.defineProperty(window, "parent", {
    configurable: true,
    get: () => {
      reads += 1;

      return real;
    },
  });
  Object.defineProperty(window, "parentReads", { get: () => reads });
};

/**
 * The test's page: the island, which answers the frame's `booted` with the life's `load`, records
 * every message the frame posts, writes each height it posts as the frame's height, and posts the
 * frame whatever the test hands `send`.
 */
const host = `<!doctype html><html><body style="margin:0"><script>
window.posts = [];
window.send = (message) => document.querySelector("iframe").contentWindow.postMessage(message, "*");
addEventListener("message", (event) => {
  const frame = document.querySelector("iframe");
  if (frame === null || event.source !== frame.contentWindow) return;
  window.posts.push(event.data);
  if (event.data.kind === "booted") window.send(window.life);
  if (event.data.kind === "height") frame.setAttribute("height", String(event.data.pixels));
});
window.openFrame = (hash) => {
  const frame = document.createElement("iframe");
  frame.setAttribute("style", "border:0;width:600px");
  frame.src = "/frame.html" + hash;
  document.body.append(frame);
};
</script></body></html>`;

/**
 * A module of the whole life: named modules that resolve as AMD has them, and an anonymous entry
 * that asks for them all, calls `require` each way, and registers a non-factory and then its
 * factory, whose instance keeps `ondone` for later (`finish`).
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
  context.register({});
  context.register({
    getInstance: function (dom, configuration) {
      var instance = {
        getResponse: function () { return { base: { integer: dom.querySelectorAll("button[data-pressed]").length } }; },
        getState: function () { return ""; },
        oncompleted: function () {},
      };
      dom.innerHTML = '<button type="button" style="width:200px;height:80px">press</button>';
      dom.querySelector("button").addEventListener("click", function (event) { event.target.setAttribute("data-pressed", ""); });
      globalThis.finish = function () { configuration.ondone(instance, instance.getResponse(), ""); };
      configuration.onready(instance, "");
      return instance;
    },
    typeIdentifier: "urn:qti-pie:test:read",
  });
});
`;

/**
 * A message the island posts the frame: its kind and nonce, and what a `load` or an `instantiate`
 * carries.
 */
interface IslandMessage {
  readonly configuration?: object;
  readonly dir?: string;
  readonly entry?: string;
  readonly kind: string;
  readonly lang?: string;
  readonly markup?: string;
  readonly nonce: string;
  readonly routes?: readonly Route[];
  readonly state?: string;
  readonly templates?: readonly string[];
  readonly title?: string;
  readonly typeIdentifier?: string;
}

/**
 * A route of the island's `load`.
 */
interface Route {
  readonly fallback?: { readonly location: string; readonly primaryWaitSeconds: number };
  readonly id: string;
  readonly primary: string;
}

/**
 * A module the page never answers: its script neither loads nor fails, so only a wait before a
 * fallback ends its load.
 */
const hung: unique symbol = Symbol("hung");

/**
 * One life of the frame: its URL's fragment, the island's `load` for it, the module files the
 * page serves by name (a name it serves nothing for is a script that does not load, and one it
 * holds {@link hung} for a script whose request it never answers), and what the test does once the
 * frame has said how its load came out.
 */
interface Life {
  readonly entry: string | null;
  readonly hash: string;
  readonly live: (page: Page) => Promise<void>;
  readonly modules: Readonly<Record<string, string | typeof hung>>;
  readonly name: string;
  readonly routes: readonly Route[];
}

/**
 * The island's `load` for a life, with one template.
 *
 * @param life The life.
 * @returns The message.
 */
const loadOf = (life: Life): IslandMessage => {
  const load = {
    dir: "ltr",
    kind: "load",
    lang: "en",
    markup: "<p>markup</p>",
    nonce,
    routes: life.routes,
    templates: ["<b>template</b>"],
    title: "PCI",
  };

  return life.entry === null ? load : { ...load, entry: life.entry };
};

/**
 * A route of one primary location and no fallback.
 *
 * @param id The route's id.
 * @returns The route.
 */
const routeOf = (id: string): Route => ({ id, primary: `${origin}/modules/${id}.js` });

/**
 * A route of one primary location and a fallback after it, `modules/fallback.js`, which alone
 * holds a wait for the primary (reading `pci-wait-before-fallback`).
 *
 * @param id The route's id.
 * @param primaryWaitSeconds The primary's wait before the fallback, in seconds, 0 for no limit.
 * @returns The route.
 */
const fallingBackOf = (id: string, primaryWaitSeconds: number): Route => ({
  ...routeOf(id),
  fallback: { location: `${origin}/modules/fallback.js`, primaryWaitSeconds },
});

/**
 * Wait until the frame has posted a message of one of some kinds.
 *
 * @param page The page.
 * @param kinds The kinds.
 * @returns Once it has.
 */
const posted = async (page: Page, kinds: readonly string[]): Promise<void> => {
  await page.waitForFunction(
    (wanted) => window.posts.some((message) => wanted.includes(message.kind)),
    kinds,
    { timeout: 0 },
  );
};

/**
 * The frame of the page, its PCI's.
 *
 * @param page The page.
 * @returns The frame.
 */
const frameOf = (page: Page) => page.frames().find((each) => each.url().includes("frame.html"));

/**
 * Drive the whole life once the PCI has registered: a factory chosen that is not registered and
 * then one that is, a click and a key, the PCI's `qti-interaction-changed`, `ondone`, a resize,
 * an uncaught error and a rejection, `complete`, then the frame removed, which unloads it.
 *
 * @param page The page.
 * @returns Once lived.
 */
const wholeLife = async (page: Page): Promise<void> => {
  const configuration = {
    boundTo: {},
    contextVariables: {},
    properties: {},
    responseIdentifier: "RESPONSE",
    status: "interacting",
    templateVariables: {},
  };

  await posted(page, ["registered"]);
  await page.evaluate(
    (given) => {
      window.send({ ...given, typeIdentifier: "urn:qti-pie:test:unregistered" });
      window.send({ ...given, typeIdentifier: "urn:qti-pie:test:read" });
    },
    { configuration, kind: "instantiate", nonce, state: "" },
  );
  await posted(page, ["ready"]);
  await page.locator("iframe").contentFrame().locator("button").click();
  await page.keyboard.press("Tab");
  await frameOf(page)?.evaluate(() => {
    document
      .querySelector("[data-pci-dom]")
      ?.dispatchEvent(
        new CustomEvent("qti-interaction-changed", { detail: { value: { base: { integer: 7 } } } }),
      );
    window.finish?.();
    queueMicrotask(() => {
      throw new Error("thrown after the PCI runs");
    });
    void Promise.reject(new Error("rejected after the PCI runs"));
  });
  await page.evaluate(() => {
    document.querySelector("iframe")?.setAttribute("height", "400");
  });
  await page.evaluate(
    (message) => {
      window.send(message);
    },
    { kind: "complete", nonce },
  );
  await posted(page, ["completed"]);
};

/**
 * Wait for the frame's load to come out, ready to register or failed.
 *
 * @param page The page.
 * @returns Once it has.
 */
const settled = async (page: Page): Promise<void> => {
  await posted(page, ["registered", "failed"]);
};

/**
 * The lives the test drives, each in a page of its own.
 */
const lives: readonly Life[] = [
  {
    entry: "a",
    hash: `#${nonce}`,
    live: wholeLife,
    modules: { a: wholeModule },
    name: "its whole life",
    routes: [routeOf("a")],
  },
  {
    entry: null,
    hash: `#${nonce}`,
    live: settled,
    modules: { fallback: "define(function () { return 1; });" },
    name: "a fallback",
    routes: [fallingBackOf("a", 0)],
  },
  {
    entry: "a",
    hash: `#${nonce}`,
    live: settled,
    modules: {},
    name: "a route exhausted",
    routes: [routeOf("a"), routeOf("b")],
  },
  {
    entry: "a",
    hash: `#${nonce}`,
    live: settled,
    modules: { a: hung, fallback: "void 0;" },
    name: "a wait run out",
    routes: [fallingBackOf("a", 1)],
  },
  {
    entry: "a",
    hash: `#${nonce}`,
    live: settled,
    modules: { a: 'define(["missing"], function () {});' },
    name: "a missing dependency",
    routes: [routeOf("a")],
  },
  {
    entry: "x",
    hash: `#${nonce}`,
    live: settled,
    modules: { a: "define(function () {});" },
    name: "a missing entry",
    routes: [routeOf("a")],
  },
  {
    entry: "a",
    hash: `#${nonce}`,
    live: settled,
    modules: { a: 'throw new Error("thrown while loading");' },
    name: "a module that throws while it loads",
    routes: [routeOf("a")],
  },
  {
    entry: "a",
    hash: `#${nonce}`,
    live: async (page) => {
      await posted(page, ["registered"]);
      await page.evaluate(
        (message) => {
          window.send(message);
        },
        {
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
          state: "",
          typeIdentifier: "urn:qti-pie:test:none",
        },
      );
      await posted(page, ["failed"]);
    },
    modules: {
      a: 'define(["qtiCustomInteractionContext"], function (context) { context.register({ getInstance: function () { return 1; }, typeIdentifier: "urn:qti-pie:test:none" }); });',
    },
    name: "a factory that gives no interaction",
    routes: [routeOf("a")],
  },
  {
    entry: null,
    hash: "",
    live: async (page) => {
      await page
        .locator("iframe")
        .contentFrame()
        .locator("body")
        .waitFor({ state: "attached", timeout: 0 });
    },
    modules: {},
    name: "no nonce",
    routes: [],
  },
];

declare global {
  interface Window {
    /**
     * The island's `load` for the frame's life.
     */
    life?: IslandMessage;
    /**
     * Open the PCI's frame, its URL's fragment as given.
     */
    openFrame: (hash: string) => void;
    /**
     * How many times the frame's `parent` has been read.
     */
    readonly parentReads?: number;
    /**
     * Every message the frame posted the page, in order.
     */
    posts: { readonly kind: string }[];
    /**
     * Post the frame a message, as the island.
     */
    send: (message: IslandMessage) => void;
    /**
     * The fixture PCI's `ondone`, which its instance keeps.
     */
    readonly finish?: () => void;
  }
}

describe("plate's PCI frame page in Chrome", () => {
  it.live(
    "reads its window's `parent` once over every way the frame lives, and not at all with no nonce",
    () =>
      Effect.scoped(
        Effect.gen(function* counted() {
          const browser = yield* Effect.orDie(chrome.browser);
          const page = yield* Effect.promise(() =>
            Effect.runPromise(framePage.pipe(Effect.provide(Digest.layerWebCrypto))),
          );
          const reads = yield* Effect.forEach(lives, (life) =>
            Effect.scoped(
              Effect.gen(function* lived() {
                const context = yield* Effect.orDie(
                  chrome.context(browser, { viewport: { height: 900, width: 1000 } }),
                );

                yield* Effect.promise(async () => {
                  await context.addInitScript(counting);
                  await context.route(`${origin}/**`, async (route) => {
                    const { pathname } = new URL(route.request().url());
                    const module =
                      pathname.startsWith("/modules/") && pathname.endsWith(".js")
                        ? pathname.slice("/modules/".length, -".js".length)
                        : undefined;

                    const body = module === undefined ? undefined : life.modules[module];

                    if (pathname === "/") {
                      await route.fulfill({ body: host, contentType: "text/html" });
                    } else if (pathname === "/frame.html") {
                      await route.fulfill({ body: page.html, headers: { ...page.headers } });
                    } else if (body === undefined) {
                      await route.fulfill({ body: "", status: 404 });
                    } else if (body !== hung) {
                      await route.fulfill({ body, contentType: "text/javascript" });
                    }
                  });
                });

                const tab = yield* Effect.orDie(chrome.page(context));

                return yield* Effect.promise(async () => {
                  await tab.goto(`${origin}/`);
                  await tab.evaluate(
                    ({ hash, load }) => {
                      window.life = load;
                      window.openFrame(hash);
                    },
                    { hash: life.hash, load: loadOf(life) },
                  );
                  await life.live(tab);

                  const count = await frameOf(tab)?.evaluate(() => window.parentReads ?? -1);

                  return `${life.name}: ${String(count)}`;
                });
              }),
            ),
          );

          assert.deepStrictEqual(
            reads,
            lives.map(({ hash, name }) => `${name}: ${hash === "" ? "0" : "1"}`),
            "the boot reads `parent` once, as `host`, before any PCI's code runs, and no path of the frame's life reads it again",
          );
        }),
      ),
  );
});
