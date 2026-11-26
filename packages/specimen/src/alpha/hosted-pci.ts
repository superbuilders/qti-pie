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
 * the frame posts.
 *
 * The item is opened as plate's own suites open one, as content the database admitted, through
 * plate's `admitted` (`@qti-pie/plate/test/admitted`), which fails where the admission run has not
 * admitted it, and rendered by plate's `<Item>` in answering, with the routes plate's resolution
 * gives as its host facts. So the markup the frame is sent is what plate's island renders on the
 * server, each formula as the island writes it, read from the server's HTML where the island reads
 * it; the properties, the response identifier, the type identifier and the frame's name are what
 * the island is handed; and the key and the module facts are the accepted item's.
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
import { regex } from "arkregex";
import { Data, Effect, Function, Option, Schema } from "effect";
import type { Scope } from "effect";
import { Digest } from "effect/crypto";
import { parseHTML } from "linkedom";
import type { Frame, Page } from "playwright-core";
import { createElement, isValidElement } from "react";
import type { ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { chromeFor, unboundedPrimaryWait } from "#specimen/ui/chrome.ts";
import { clientExports } from "#specimen/ui/clients.ts";
import { islandsIn } from "#specimen/ui/rendered.ts";
import type { Island } from "#specimen/ui/rendered.ts";
import {
  acceptedItem,
  configure,
  pciModulesIn,
  resolvePciModules,
  startingResponses,
} from "@qti-pie/plate";
import type { PciModules } from "@qti-pie/plate";
import type { AlphaPciModule } from "@qti-pie/plate/alpha/pci-modules";
import { admitted } from "@qti-pie/plate/test/admitted";
import { Item, standardRenderers } from "@qti-pie/plate/ui";
import type { ItemProps } from "@qti-pie/plate/ui";
import { heldOf, Responses } from "@qti-pie/plate/ui/client";
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
 * One item as plate's island hands it its frame, and its key as the accepted item declares it.
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
  /**
   * The markup the island sends the frame: the HTML plate's server shell renders for the PCI's
   * `qti-interaction-markup`, as the island reads it.
   */
  readonly markup: string;
  /**
   * The PCI's module facts, as plate's accepted item holds them (`pciModulesIn`).
   */
  readonly modules: PciModules;
  /**
   * The properties the island hands the PCI, each `data-*` by its `dataset` name.
   */
  readonly properties: Readonly<Record<string, string>>;
  readonly responseIdentifier: string;
  /**
   * The frame's name, as the island gives it: the text of what names the PCI's group, else its
   * label, else the island's `frame` label.
   */
  readonly title: string;
  readonly typeIdentifier: string;
}

/**
 * Fail a step of hosting an item with what it found.
 *
 * @param step What the step does, as a verb phrase.
 * @param cause What it found.
 * @returns The failure.
 */
const unhosted = (step: string, cause: unknown) =>
  Effect.fail(new HostedPciFailure({ cause, step }));

/**
 * Where the harness's server serves plate's frame page, the `loader` of the host facts an item is
 * rendered with.
 */
const loader = "/frame.html";

/**
 * What the harness reads of the props the server shell hands the PCI's island
 * (`PortableCustomProps`): its labels' `frame`, its properties, its response identifier and its
 * type identifier.
 */
const IslandProps = Schema.Struct({
  labels: Schema.Struct({ frame: Schema.String }),
  properties: Schema.Array(Schema.Struct({ name: Schema.String, value: Schema.String })),
  responseIdentifier: Schema.String,
  typeIdentifier: Schema.String,
});

/**
 * Keep no change: the `onChange` a server render's `<Responses>` is given, which it never calls.
 */
const keepNothing: () => void = Function.constVoid;

/**
 * Tell whether a value is a React node, as a client component's `children` prop holds the server
 * elements it renders.
 *
 * @param value The value.
 * @returns Whether it is a node.
 */
const isNode = (value: unknown): value is ReactNode =>
  value === null ||
  value === undefined ||
  typeof value === "string" ||
  typeof value === "number" ||
  typeof value === "boolean" ||
  isValidElement(value) ||
  (Array.isArray(value) && value.every(isNode));

/**
 * An island's props that hand it server elements to render, its `children`.
 */
const WithChildren = Schema.Struct({ children: Schema.declare(isNode) });

/**
 * Find the Portable Custom Interaction islands in an element tree: the islands the walk stops at,
 * and within any other island, such as the read-aloud session `<Item>` wraps its body in, the
 * islands among the server elements it is handed as its `children`.
 *
 * @param node The tree.
 * @param clients Every export of plate's `"use client"` modules, by value, with its name.
 * @returns Each Portable Custom Interaction island, in tree order.
 */
const portableIn = (node: ReactNode, clients: ReadonlyMap<unknown, string>): readonly Island[] =>
  islandsIn(node, clients).flatMap((island) => {
    if (island.name.endsWith("#PortableCustom")) {
      return [island];
    }

    return Option.match(Schema.decodeUnknownOption(WithChildren)(island.props), {
      onNone: () => [],
      onSome: ({ children }) => portableIn(children, clients),
    });
  });

/**
 * A run of HTML's ASCII whitespace, which parts the ids of an IDREF list and which a name's text
 * collapses.
 */
const asciiSpace = regex("[\\t\\n\\f\\r ]+", "gu");

/**
 * Open one item of a module's fixture, `fixtures/alpha/<module>/<name>.xml` of the package, as
 * plate's island hands it its frame: open it through `admitted`, resolve its one PCI's modules by
 * plate's resolution against a package holding the module's file, render it in answering with
 * those routes as its host facts, find the PCI's island, and read what the island tells its frame
 * from its props and from the HTML the server rendered for it.
 *
 * @param module The module.
 * @param name The item's name.
 * @returns The item as the frame host is handed it; a failure where plate accepts no item of it, it
 *   holds other than one PCI, or the server shell renders no PCI island or markup for it; a defect
 *   where the database has not admitted it (from `admitted`).
 */
export const hostedItem = Effect.fn("hostedItem")(function* hostedItem(
  module: AlphaPciModule<string>,
  name: string,
) {
  const location = `${name}.xml`;
  const file = path.resolve(
    import.meta.dirname,
    "..",
    "..",
    "fixtures",
    "alpha",
    module.id,
    location,
  );
  const bytes = yield* attempt(`read ${file}`, () => readFile(file));
  const verdict = yield* admitted(location, bytes);
  const accepted = yield* Option.match(acceptedItem(verdict), {
    onNone: () => unhosted(`accept ${location}`, verdict.verdict),
    onSome: (taken) => Effect.succeed(taken),
  });
  const pcis = pciModulesIn(accepted);
  const [pci] = pcis;
  const declared = Option.fromUndefinedOr(
    pci === undefined ? undefined : accepted.item.responses.get(pci.response),
  );

  if (pci === undefined || pcis.length !== 1 || Option.isNone(declared)) {
    return yield* unhosted(`find ${location}'s one PCI and its declaration`, pcis);
  }

  const { routes } = resolvePciModules(
    pci.modules,
    () => Option.none(),
    (each) => each === module.path,
  );
  const configuration = yield* Effect.orDie(configure({ assets: [], seed: "" }));
  const props: ItemProps = {
    configuration,
    host: { pci: { loader, modules: new Map([[pci.response, routes]]) } },
    instance: "hosted",
    item: accepted,
    mode: "answering",
    showFeedback: false,
  };
  const shell = createElement(Item, { ...props, renderers: standardRenderers });
  const islands = portableIn(shell, yield* clientExports);
  const [island, ...others] = islands;

  if (island === undefined || others.length > 0) {
    return yield* unhosted(`find ${location}'s one PCI island`, islands);
  }

  const told = yield* Effect.mapError(
    Schema.decodeUnknownEffect(IslandProps)(island.props),
    (cause) => new HostedPciFailure({ cause, step: `read ${location}'s PCI island` }),
  );
  const html = renderToStaticMarkup(
    createElement(Responses, {
      children: shell,
      onChange: keepNothing,
      value: heldOf(startingResponses(accepted, props)),
    }),
  );
  const { document } = parseHTML(`<!doctype html><html><body>${html}</body></html>`);
  const root = document.querySelector('[data-slot="plate-portable-custom"]');
  const markup = root?.querySelector('[data-slot="plate-portable-custom-markup"]') ?? null;

  if (root === null || markup === null) {
    return yield* unhosted(`find ${location}'s PCI markup on its page`, html);
  }

  const named = (root.getAttribute("aria-labelledby") ?? "")
    .split(asciiSpace)
    .filter((id) => id !== "")
    .map((id) => document.querySelector(`[id="${id}"]`)?.textContent ?? "")
    .join(" ")
    .replaceAll(asciiSpace, " ")
    .trim();

  return {
    cardinality: declared.value.cardinality,
    correct: Option.match(declared.value.correct, {
      onNone: () => [],
      onSome: ({ values }) =>
        values.flatMap((value) => (value.baseType === "integer" ? [Number(value.value)] : [])),
    }),
    markup: markup.innerHTML,
    modules: pci.modules,
    properties: Object.fromEntries(told.properties.map((each) => [each.name, each.value])),
    responseIdentifier: told.responseIdentifier,
    title: named === "" ? (root.getAttribute("aria-label") ?? told.labels.frame) : named,
    typeIdentifier: told.typeIdentifier,
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
   * Make a fresh frame for the item and settle on its `ready` or `failed`. A ready frame is settled
   * only once it has posted its height and painted twice: the frame lays the PCI out after
   * `ready`, and Chrome hit-tests a new frame only once it has painted, so a tap before then is
   * dropped, as no child's finger can be that quick.
   */
  readonly start: (item: HostedItem, start: Start) => Effect.Effect<FrameMessage, HostedPciFailure>;
  /**
   * Press Tab, and settle once the frame's document holds the focus: a key pressed before the
   * browser has moved the keyboard's focus from the page into the frame goes to the page.
   */
  readonly tabIn: Effect.Effect<void, HostedPciFailure>;
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
        ...Option.match(route.primary, {
          onNone: () => ({}),
          onSome: (file) => ({ primary: `${origin}/${file}` }),
        }),
        ...Option.match(route.fallback, {
          onNone: () => ({}),
          onSome: (fallback) => ({
            fallback: {
              location: `${origin}/${fallback.location}`,
              primaryWaitSeconds: unboundedPrimaryWait,
            },
          }),
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
        title: item.title,
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
        Effect.forEach(keys, (key) => attempt(`press ${key}`, () => page.keyboard.press(key)), {
          discard: true,
        }),
      read: (reader) =>
        inner.pipe(
          Effect.flatMap((frame) => attempt("read the frame", () => frame.evaluate(reader))),
        ),
      start: (item, start) =>
        attempt("start the PCI", async () => {
          const settled = await page.evaluate<FrameMessage>(startScript(item, start));

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
      tabIn: attempt("press Tab", () => page.keyboard.press("Tab")).pipe(
        Effect.andThen(inner),
        Effect.flatMap((frame) =>
          attempt("wait for the frame to hold the focus", async () => {
            await frame.waitForFunction(() => document.activeElement !== document.body);
          }),
        ),
      ),
      tapAt: (points) =>
        attempt("find the frame's place", async () => {
          const box = await page.locator("iframe").boundingBox();

          return box ?? { x: 0, y: 0 };
        }).pipe(
          Effect.flatMap((at) =>
            Effect.forEach(
              points,
              (point) =>
                attempt(`tap ${String(point.x)},${String(point.y)}`, () =>
                  page.mouse.click(at.x + point.x, at.y + point.y),
                ),
              { discard: true },
            ),
          ),
        ),
    } satisfies HostedPage;
  });
