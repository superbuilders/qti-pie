/**
 * One of Alpha's PCI modules (`@qti-pie/plate/alpha/pci-modules`) hosted as a host hosts it and
 * driven as a child drives it, for the suites of `enter-numbers` and `tap-point`: one of a suite's
 * synthetic items (`fixtures/alpha/<module>/<name>.xml`, made-up items with the module attribute
 * and `qti-interaction-modules` QTI's module resolution needs), run in plate's own PCI frame page
 * (`@qti-pie/plate/ui/pci-frame`), its boot and its AMD loader, in headless Google Chrome.
 *
 * A page of this harness stands in for plate's island, the host side of the frame protocol: it
 * makes the sandboxed frame with its nonce, sends the frame the item's markup and the module routes
 * plate's resolution gives from the item's own module facts (`resolvePciModules`), instantiates the
 * factory with the item's properties, the status and the bound response, and records every message
 * the frame posts. The item is read from its XML as the specification names its parts, never
 * through plate's reader: its `data-*` named as HTML's `dataset` names them.
 *
 * What the frame shows is read by the suite's own functions in the frame's document
 * ({@link HostedPage.read}), so each suite states its rules in its own specification's terms. The
 * pointer is Chrome's mouse and the keyboard Chrome's, at points of the frame's document.
 *
 * The page, the frame page and the module are served from this machine, so nothing loads from
 * another host. Chrome is the machine's, through Playwright's `chrome` channel, headless.
 *
 * Test support for `#specimen/alpha/enter-numbers.test.ts` and `#specimen/alpha/tap-point.test.ts`.
 *
 * @module
 * @see https://www.imsglobal.org/spec/qti/v3p0/impl
 */
import { readFile } from "node:fs/promises";
import { createServer } from "node:http";
import path from "node:path";
import type { IncomingMessage, Server, ServerResponse } from "node:http";
import { Data, Effect, Option, Schema, pipe } from "effect";
import type { Scope } from "effect";
import { Digest } from "effect/crypto";
import { parseHTML } from "linkedom";
import type { Frame, Page } from "playwright-core";
import { chromeFor, unboundedModuleWait } from "#specimen/ui/chrome.ts";
import { resolvePciModules } from "@qti-pie/plate";
import type { PciModules } from "@qti-pie/plate";
import type { AlphaPciModule } from "@qti-pie/plate/alpha/pci-modules";
import { framePage } from "@qti-pie/plate/ui/pci-frame";

/**
 * A step of the harness failed: Chrome, the server, a file of the fixture, or a page's script.
 */
export class HostedPciFailure extends Data.TaggedError("HostedPciFailure")<{
  readonly cause: unknown;
  readonly step: string;
}> {
  /**
   * The step that failed and its cause.
   */
  override get message(): string {
    return `The hosted PCI harness could not ${this.step}: ${String(this.cause)}`;
  }
}

/**
 * Run a promise as one step of the harness.
 *
 * @param step What the step does, as a verb phrase.
 * @param run The promise.
 * @returns Its value, or the failure naming the step.
 */
const attempt = <A>(step: string, run: () => Promise<A>): Effect.Effect<A, HostedPciFailure> =>
  Effect.tryPromise({ catch: (cause) => new HostedPciFailure({ cause, step }), try: run });

/**
 * One item as the frame host is handed it, and its key as its declaration writes it.
 */
export interface HostedItem {
  /**
   * Its response declaration's cardinality.
   */
  readonly cardinality: string;
  /**
   * Its `qti-correct-response` values, in order, as integers.
   */
  readonly correct: readonly number[];
  readonly markup: string;
  readonly modules: PciModules;
  readonly prompt: string;
  readonly properties: Readonly<Record<string, string>>;
  readonly responseIdentifier: string;
  readonly typeIdentifier: string;
}

/**
 * Name a `data-*` attribute as HTML's `dataset` names it.
 *
 * @param name The attribute's name, starting with `data-`.
 * @returns The dataset name.
 */
const datasetName = (name: string): string =>
  name
    .slice("data-".length)
    .replaceAll(/-(?<letter>[a-z])/gu, (_match, letter: string) => letter.toUpperCase());

/**
 * The DOM's `DOMParser`, as linkedom's window gives it.
 */
const { DOMParser: XmlParser } = parseHTML("<!doctype html><html></html>");

/**
 * HTML's void elements, the only ones an element written `<name/>` in XML may be written as in
 * HTML.
 */
const voids: ReadonlySet<string> = new Set(["br", "hr", "img", "wbr"]);

/**
 * Give markup an XML serializer wrote as HTML, as a delivery system rebuilds it: each empty element
 * that is no void element written with its end tag, since HTML reads `<span/>` as an open span.
 *
 * @param xml The markup as XML.
 * @returns The markup as HTML.
 */
const htmlOf = (xml: string): string =>
  xml.replaceAll(
    /<(?<name>[a-z][a-z0-9-]*)(?<rest>[^<>]*?)\s*\/>/gu,
    (whole, name: string, rest: string) => (voids.has(name) ? whole : `<${name}${rest}></${name}>`),
  );

/**
 * Read one item of a module's fixture, `fixtures/alpha/<module>/<name>.xml` of the package.
 *
 * @param module The module.
 * @param name The item's name.
 * @returns The item as the frame host is handed it.
 */
export const hostedItem = Effect.fn("hostedItem")(function* hostedItem(
  module: AlphaPciModule<string>,
  name: string,
) {
  const file = path.resolve(
    import.meta.dirname,
    "..",
    "..",
    "fixtures",
    "alpha",
    module.id,
    `${name}.xml`,
  );
  const xml = yield* attempt(`read ${file}`, () => readFile(file, "utf-8"));
  const document = new XmlParser().parseFromString(xml, "text/xml");
  const pci = document.querySelector("qti-portable-custom-interaction");
  const markup = pci?.querySelector("qti-interaction-markup");
  const modules = pci?.querySelector("qti-interaction-modules");
  const declaration = document.querySelector("qti-response-declaration");

  if (pci === null || pci === undefined || markup === null || markup === undefined) {
    return yield* new HostedPciFailure({
      cause: "no qti-portable-custom-interaction with a qti-interaction-markup",
      step: `read ${file}`,
    });
  }

  const attribute = (attributeName: string): Option.Option<string> =>
    Option.fromNullishOr(pci.getAttribute(attributeName));

  return {
    cardinality: declaration?.getAttribute("cardinality") ?? "",
    correct: [...document.querySelectorAll("qti-correct-response qti-value")].map((value) =>
      Number(value.textContent),
    ),
    markup: htmlOf(markup.innerHTML),
    modules: {
      module: attribute("module"),
      modules: [...pci.querySelectorAll("qti-interaction-module")].map((each) => ({
        fallbackPath: Option.fromNullishOr(each.getAttribute("fallback-path")),
        id: each.getAttribute("id") ?? "",
        primaryPath: Option.fromNullishOr(each.getAttribute("primary-path")),
      })),
      primaryConfiguration:
        modules?.getAttribute("primary-configuration") ?? "modules/module_resolution.js",
      secondaryConfiguration:
        modules?.getAttribute("secondary-configuration") ?? "modules/fallback_module_resolution.js",
    },
    prompt: pci.previousElementSibling?.textContent.trim() ?? "",
    properties: Object.fromEntries(
      [...pci.attributes]
        .filter((each) => each.name.startsWith("data-"))
        .map((each) => [datasetName(each.name), each.value] as const),
    ),
    responseIdentifier: attribute("response-identifier").pipe(Option.getOrElse(() => "")),
    typeIdentifier: attribute("custom-interaction-type-identifier").pipe(
      Option.getOrElse(() => ""),
    ),
  } satisfies HostedItem;
});

/**
 * The host page: plate's island's side of the frame protocol, as a script, as the shade-parts
 * harness writes it (`#specimen/alpha/shade-parts.ts`). The frame is 791 px wide, the width
 * AlphaTest's player gives a PCI's frame in its question column at 1366 by 768 (measured on player
 * main), so a figure wider than a child's screen gives it fails here.
 */
const hostHtml = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><title>hosted pci</title></head><body style="margin:0">
<script>
window.frameMessages = [];
let frame;
let nonce;
const post = (message) => frame.contentWindow.postMessage({ ...message, nonce }, "*");
window.startPci = (start) => new Promise((settle) => {
  frame?.remove();
  window.frameMessages = [];
  nonce = crypto.randomUUID();
  frame = document.createElement("iframe");
  frame.setAttribute("sandbox", "allow-scripts");
  frame.setAttribute("title", start.title);
  frame.setAttribute("width", "791");
  frame.setAttribute("height", "1200");
  frame.style.border = "0";
  frame.style.display = "block";
  frame.src = "/frame.html#" + encodeURIComponent(nonce);
  const ours = frame;
  window.onmessage = (event) => {
    const message = event.data;
    if (event.source !== ours.contentWindow || message === null || typeof message !== "object" || message.nonce !== nonce) return;
    window.frameMessages.push(message);
    if (message.kind === "booted") post({ kind: "load", markup: start.markup, templates: [], routes: start.routes, entry: start.entry, lang: "en-US", dir: "ltr", title: start.title });
    if (message.kind === "registered") post({ kind: "instantiate", typeIdentifier: start.typeIdentifier, configuration: start.configuration, state: start.state });
    if (message.kind === "height") ours.setAttribute("height", String(Math.max(1200, message.pixels)));
    if (message.kind === "ready" || message.kind === "failed") settle(message);
    if (message.kind === "completed") window.completed?.(message);
  };
  document.body.append(frame);
});
window.completePci = () => new Promise((settle) => { window.completed = settle; post({ kind: "complete" }); });
</script></body></html>`;

/**
 * The address a listening server took.
 */
const ListeningAddress = Schema.Struct({ port: Schema.Number });

/**
 * The harness's server on a loopback port the system chose, closed with its scope: the host page at
 * `/`, plate's frame page at `/frame.html` with plate's headers, and the module file at the path
 * the items name.
 *
 * @param module The module.
 * @returns The server's origin.
 */
const harnessServer = (
  module: AlphaPciModule<string>,
): Effect.Effect<string, HostedPciFailure, Scope.Scope> =>
  Effect.gen(function* serveModule() {
    const frame = yield* framePage.pipe(Effect.provide(Digest.layerWebCrypto));
    const script = yield* attempt(`read plate's ${module.id} module file`, () =>
      readFile(module.script),
    );
    const serve = (request: IncomingMessage, response: ServerResponse): void => {
      const { pathname } = new URL(request.url ?? "/", "http://localhost");

      if (pathname === "/") {
        response.writeHead(200, { "content-type": "text/html; charset=utf-8" }).end(hostHtml);
      } else if (pathname === "/frame.html") {
        response.writeHead(200, frame.headers).end(frame.html);
      } else if (pathname === `/${module.path}`) {
        response.writeHead(200, { "content-type": "text/javascript; charset=utf-8" }).end(script);
      } else {
        response.writeHead(404).end();
      }
    };
    const server = yield* Effect.acquireRelease(
      Effect.callback<Server>((resume) => {
        const made = createServer(serve);

        made.listen(0, "127.0.0.1", () => {
          resume(Effect.succeed(made));
        });
      }),
      (made) =>
        Effect.callback<undefined>((resume) => {
          made.close(() => {
            resume(Effect.undefined);
          });
          made.closeAllConnections();
        }),
    );
    const { port } = yield* Effect.mapError(
      Schema.decodeUnknownEffect(ListeningAddress)(server.address()),
      (cause) => new HostedPciFailure({ cause, step: "read the server's port" }),
    );

    return `http://127.0.0.1:${String(port)}`;
  });

/**
 * Chrome for the harness, through specimen's one launcher, its failures the harness's own.
 */
const chrome = chromeFor((step, cause) => new HostedPciFailure({ cause, step }));

/**
 * A message the frame posted, as the page kept it.
 */
export interface FrameMessage {
  readonly kind: string;
  readonly reason?: string;
  readonly response?: unknown;
  readonly state?: unknown;
  readonly value?: unknown;
}

/**
 * A point in the frame's document, in CSS pixels.
 */
export interface Point {
  readonly x: number;
  readonly y: number;
}

/**
 * How a frame is started: the response it is bound to and the state it restores, each absent for
 * none, and the status, `interacting` unless named.
 */
export interface Start {
  readonly boundTo?: unknown;
  readonly state?: unknown;
  readonly status?: string;
}

/**
 * A page of the harness, holding one item's frame at a time.
 */
export interface HostedPage {
  /**
   * Ask the frame to complete, and give the response and state it gave.
   */
  readonly complete: Effect.Effect<FrameMessage, HostedPciFailure>;
  /**
   * Every message the frame posted, in order.
   */
  readonly messages: Effect.Effect<readonly FrameMessage[], HostedPciFailure>;
  /**
   * Press keys in order, each as Playwright names it, wherever the focus is.
   */
  readonly press: (keys: readonly string[]) => Effect.Effect<void, HostedPciFailure>;
  /**
   * Run a reader in the frame's document and give what it returns. A reader is a function of no
   * arguments that Playwright serializes, so it reaches nothing of the suite's scope.
   */
  readonly read: <A>(reader: () => A) => Effect.Effect<A, HostedPciFailure>;
  /**
   * Make a fresh frame for the item and settle on its `ready` or `failed`.
   */
  readonly start: (item: HostedItem, start: Start) => Effect.Effect<FrameMessage, HostedPciFailure>;
  /**
   * Tap points of the frame's document in order, with the pointer.
   */
  readonly tapAt: (points: readonly Point[]) => Effect.Effect<void, HostedPciFailure>;
}

/**
 * The page's viewport height, in CSS pixels: past the frame's 1200 px.
 */
const pageHeight = 1300;

/**
 * Open a page of the harness in Chrome, serving one module.
 *
 * @param module The module.
 * @returns The page, closed with its scope.
 */
export const hostedPage = (
  module: AlphaPciModule<string>,
): Effect.Effect<HostedPage, HostedPciFailure, Scope.Scope> =>
  Effect.gen(function* openHostedPage() {
    const origin = yield* harnessServer(module);
    const browser = yield* chrome.browser;
    const page: Page = yield* chrome.pageOf(browser, {
      viewport: { height: pageHeight, width: 1300 },
    });

    yield* attempt("load the host page", () => page.goto(`${origin}/`));

    const inner = Effect.sync(() => page.frames().find((each) => each !== page.mainFrame())).pipe(
      Effect.flatMap((found: Frame | undefined) =>
        found === undefined
          ? Effect.fail(new HostedPciFailure({ cause: "no frame", step: "find the frame" }))
          : Effect.succeed(found),
      ),
    );
    const routesOf = (item: HostedItem) =>
      resolvePciModules(
        item.modules,
        () => Option.none(),
        (file) => file === module.path,
      ).routes.map((route) => ({
        id: route.id,
        waitSeconds: unboundedModuleWait,
        ...Option.match(route.primary, {
          onNone: () => ({}),
          onSome: (file) => ({ primary: `${origin}/${file}` }),
        }),
        ...Option.match(route.fallback, {
          onNone: () => ({}),
          onSome: (file) => ({ fallback: `${origin}/${file}` }),
        }),
      }));
    const startScript = (item: HostedItem, start: Start): string =>
      `window.startPci(${JSON.stringify({
        configuration: {
          boundTo: start.boundTo === undefined ? {} : { [item.responseIdentifier]: start.boundTo },
          contextVariables: {},
          properties: item.properties,
          responseIdentifier: item.responseIdentifier,
          status: start.status ?? "interacting",
          templateVariables: {},
        },
        entry: Option.getOrUndefined(item.modules.module),
        markup: item.markup,
        routes: routesOf(item),
        state: start.state,
        title: item.prompt,
        typeIdentifier: item.typeIdentifier,
      })})`;

    return {
      complete: attempt("complete the PCI", () =>
        page.evaluate<FrameMessage>("window.completePci()"),
      ),
      messages: attempt("read the frame's messages", () =>
        page.evaluate<readonly FrameMessage[]>("window.frameMessages"),
      ),
      press: (keys) =>
        pipe(
          keys,
          Effect.forEach((key) => attempt(`press ${key}`, () => page.keyboard.press(key))),
          Effect.asVoid,
        ),
      read: (reader) =>
        inner.pipe(
          Effect.flatMap((frame) => attempt("read the frame", () => frame.evaluate(reader))),
        ),
      start: (item, start) =>
        attempt("start the PCI", async () => {
          const settled = await page.evaluate<FrameMessage>(startScript(item, start));

          // The frame lays the PCI out after `ready`, and Chrome hit-tests a new frame only once it
          // has painted: a tap before then is dropped, as no child's finger can be that quick.
          if (settled.kind === "ready") {
            await page.waitForFunction(
              "window.frameMessages.some((message) => message.kind === 'height')",
              undefined,
              { polling: 10 },
            );

            await page
              .frames()
              .find((each) => each !== page.mainFrame())
              ?.evaluate(
                "new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)))",
              );
          }

          return settled;
        }),
      tapAt: (points) =>
        attempt("find the frame's place", async () => {
          const box = await page.locator("iframe").boundingBox();

          return box ?? { x: 0, y: 0 };
        }).pipe(
          Effect.flatMap((at) =>
            pipe(
              points,
              Effect.forEach((point) =>
                attempt(`tap ${String(point.x)},${String(point.y)}`, () =>
                  page.mouse.click(at.x + point.x, at.y + point.y),
                ),
              ),
            ),
          ),
          Effect.asVoid,
        ),
    } satisfies HostedPage;
  });
