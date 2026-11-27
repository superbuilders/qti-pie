/**
 * The mark-objects PCI (`urn:fdc:alpha.school:2026:mark-objects`, its module file `markObjects` of
 * `@qti-pie/plate/alpha/pci-modules`) driven as a child drives it: one of the synthetic mark items
 * of the package's fixture `fixtures/alpha/mark-objects/`, run in plate's own PCI frame page
 * (`@qti-pie/plate/ui/pci-frame`), its boot and its AMD loader, in headless Google Chrome, the
 * objects tapped with the pointer at their centres, and what the frame relays and the PCI draws
 * read back.
 *
 * A page of this harness stands in for plate's island, the host side of the frame protocol
 * (`#plate/ui/portable-custom/protocol.ts` in plate): it makes the sandboxed frame with its nonce,
 * sends the frame the item's markup, its templates and the module routes plate's resolution gives
 * from the item's own module facts (`resolvePciModules`), instantiates the factory the frame
 * registered with the item's properties and the bound response, and records every message the frame
 * posts. The item is read from its XML here, as the specification names its parts, never through
 * plate's reader: its `data-*` named as HTML's `dataset` names them (the PCI's `properties`), its
 * markup's content but for each `template`, each `template`'s content, and each picture the markup
 * shows as a `data:` URL of the package's file, as a host serves a package file at an address of
 * its own.
 *
 * The page, the frame page and the module are served from this machine, so nothing loads from
 * another host. Chrome is the machine's, through Playwright's `chrome` channel, headless.
 *
 * Test support for the Alpha suites under `src/alpha/`; it reads plate through its public entries
 * alone.
 *
 * @module
 * @see https://www.imsglobal.org/spec/qti/v3p0/impl
 * @see https://html.spec.whatwg.org/multipage/dom.html#dom-dataset
 */
import { createServer } from "node:http";
import type { IncomingMessage, Server, ServerResponse } from "node:http";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { Data, Effect, Option, Schema } from "effect";
import type { Scope } from "effect";
import { Digest } from "effect/crypto";
import { parseHTML } from "linkedom";
import type { Frame, Page, Route } from "playwright-core";
import { chromeFor, unboundedPrimaryWait } from "#specimen/ui/chrome.ts";
import { resolvePciModules } from "@qti-pie/plate";
import type { PciModules } from "@qti-pie/plate";
import { framePage, landHeight } from "@qti-pie/plate/ui/pci-frame";
import {
  centred,
  focusOn,
  framesIn,
  keyInto,
  listening,
  meantFor,
  nameOf,
  pressInto,
  settledFor,
} from "#specimen/alpha/delivered.ts";
import type { KeyNotDelivered, TapNotDelivered, Target } from "#specimen/alpha/delivered.ts";
import { markObjects } from "@qti-pie/plate/alpha/pci-modules";

/**
 * A step of the harness failed: Chrome, the server, a file of the package, or a page's script.
 */
export class MarkObjectsFailure extends Data.TaggedError("MarkObjectsFailure")<{
  readonly cause: unknown;
  readonly step: string;
}> {
  /**
   * The step that failed and its cause.
   */
  override get message(): string {
    return `The mark-objects harness could not ${this.step}: ${String(this.cause)}`;
  }
}

/**
 * Run a promise as one step of the harness.
 *
 * @param step What the step does, as a verb phrase.
 * @param run The promise.
 * @returns Its value, or the failure naming the step.
 */
const attempt = <A>(step: string, run: () => Promise<A>): Effect.Effect<A, MarkObjectsFailure> =>
  Effect.tryPromise({ catch: (cause) => new MarkObjectsFailure({ cause, step }), try: run });

/**
 * The fixture the mark items are read from, `fixtures/alpha/mark-objects/` of the package, laid out
 * as a content package lays them out: each item at `qti/<id>.xml`, in the form's QTI (the module,
 * its module resolution, its typed properties, and a markup holding only its object's picture) but
 * made up, its id, objects, count, stem and key, and that picture at `media/<sha256>.svg`, named by
 * the SHA-256 of its bytes. The package's module file is not among them: it is plate's,
 * {@link markObjects}.
 */
const fixtureDirectory = path.resolve(
  import.meta.dirname,
  "..",
  "..",
  "fixtures",
  "alpha",
  "mark-objects",
);

/**
 * Where the items name their module file, from the package's root.
 */
const modulePath = markObjects.path;

/**
 * One mark item as the frame host is handed it: the PCI's type identifier, response identifier and
 * properties, its module facts as written, its markup's HTML but for each `template`, each
 * `template`'s HTML, and the prompt's text, the frame's title.
 */
export interface MarkItem {
  readonly markup: string;
  readonly modules: PciModules;
  readonly prompt: string;
  readonly properties: Readonly<Record<string, string>>;
  readonly responseIdentifier: string;
  readonly templates: readonly string[];
  readonly typeIdentifier: string;
}

/**
 * Name a `data-*` attribute as HTML's `dataset` names it: the prefix removed, and each `-` followed
 * by an ASCII lowercase letter removed with that letter upper-cased.
 *
 * @param name The attribute's name, starting with `data-`.
 * @returns The dataset name.
 */
const datasetName = (name: string): string =>
  name
    .slice("data-".length)
    .replaceAll(/-(?<letter>[a-z])/gu, (_match, letter: string) => letter.toUpperCase());

/**
 * The DOM's `DOMParser`, as linkedom's window gives it, typed as the DOM's own.
 */
const { DOMParser: XmlParser } = parseHTML("<!doctype html><html></html>");

/**
 * The media type of each kind of picture a mark item's markup shows.
 */
const pictureTypes: ReadonlyMap<string, string> = new Map([
  [".png", "image/png"],
  [".svg", "image/svg+xml"],
]);

/**
 * Read one mark item from the fixture: the item's XML, each picture its markup shows as a `data:`
 * URL of the fixture's file.
 *
 * @param id The item's id, `alpha-mark-objects-rows`.
 * @returns The item as the frame host is handed it.
 */
export const markItem = Effect.fn("markItem")(function* markItem(id: string) {
  const itemPath = path.join("qti", `${id}.xml`);
  const xml = yield* attempt(`read ${itemPath}`, () =>
    readFile(path.join(fixtureDirectory, itemPath), "utf-8"),
  );
  const document = new XmlParser().parseFromString(xml, "text/xml");
  const pci = document.querySelector("qti-portable-custom-interaction");
  const markup = pci?.querySelector("qti-interaction-markup");
  const modules = pci?.querySelector("qti-interaction-modules");

  if (pci === null || pci === undefined || markup === null || markup === undefined) {
    return yield* new MarkObjectsFailure({
      cause: "no qti-portable-custom-interaction with a qti-interaction-markup",
      step: `read ${itemPath}`,
    });
  }

  const pictures = new Map<string, string>();

  for (const source of [...xml.matchAll(/\bsrc="(?<source>[^"]+)"/gu)].map(
    (found) => found.groups?.["source"] ?? "",
  )) {
    const file = path.join(path.dirname(itemPath), source);
    const type = pictureTypes.get(path.extname(file)) ?? "application/octet-stream";
    const bytes = yield* attempt(`read ${file}`, () => readFile(path.join(fixtureDirectory, file)));

    pictures.set(source, `data:${type};base64,${bytes.toString("base64")}`);
  }

  /**
   * Write a part of the markup as the HTML a host serves: each picture's `src` the `data:` URL of
   * its file, read as HTML so a `template`'s content is reached as any other element's.
   *
   * @param html The part's HTML, as the XML writes it.
   * @returns The HTML served.
   */
  const served = (html: string): string => {
    const { document: page } = parseHTML(`<!doctype html><html><body>${html}</body></html>`);

    for (const picture of page.querySelectorAll("img")) {
      picture.setAttribute("src", pictures.get(picture.getAttribute("src") ?? "") ?? "");
    }

    return page.body.innerHTML;
  };

  const children = [...markup.children];
  const attribute = (name: string): Option.Option<string> =>
    Option.fromNullishOr(pci.getAttribute(name));

  return {
    markup: children
      .filter((child) => child.localName !== "template")
      .map((child) => served(child.outerHTML))
      .join(""),
    modules: {
      module: attribute("module"),
      modules: [...pci.querySelectorAll("qti-interaction-module")].map((module) => ({
        fallbackPath: Option.fromNullishOr(module.getAttribute("fallback-path")),
        id: module.getAttribute("id") ?? "",
        primaryPath: Option.fromNullishOr(module.getAttribute("primary-path")),
      })),
      primaryConfiguration:
        modules?.getAttribute("primary-configuration") ?? "modules/module_resolution.js",
      secondaryConfiguration:
        modules?.getAttribute("secondary-configuration") ?? "modules/fallback_module_resolution.js",
    },
    prompt: pci.querySelector("qti-prompt")?.textContent.trim() ?? "",
    properties: Object.fromEntries(
      [...pci.attributes]
        .filter((each) => each.name.startsWith("data-"))
        .map((each) => [datasetName(each.name), each.value] as const),
    ),
    responseIdentifier: attribute("response-identifier").pipe(Option.getOrElse(() => "")),
    templates: children
      .filter((child) => child.localName === "template")
      .map((child) => served(child.innerHTML)),
    typeIdentifier: attribute("custom-interaction-type-identifier").pipe(
      Option.getOrElse(() => ""),
    ),
  } satisfies MarkItem;
});

/**
 * The host page: plate's island's side of the frame protocol, as a script. `startPci` makes the
 * frame, answers its `booted` with the item's content and routes and its `registered` with the
 * factory and configuration it is given, and settles on `ready` or `failed`; `completePci` asks
 * the frame to complete and settles on `completed`. Every message the frame posts is kept in
 * `frameMessages`, in order.
 */
const hostHtml = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><title>mark objects</title></head><body>
<script>
window.frameMessages = [];
let frame;
let nonce;
const post = (message) => frame.contentWindow.postMessage({ ...message, nonce }, "*");
const landHeight = ${String(landHeight)};
window.startPci = (start) => new Promise((settle) => {
  frame?.remove();
  window.frameMessages = [];
  nonce = crypto.randomUUID();
  frame = document.createElement("iframe");
  frame.setAttribute("sandbox", "allow-scripts");
  frame.setAttribute("title", start.title);
  frame.setAttribute("width", "1000");
  frame.style.border = "0";
  frame.src = "/frame.html#" + encodeURIComponent(nonce);
  const ours = frame;
  window.onmessage = (event) => {
    const message = event.data;
    if (event.source !== ours.contentWindow || message === null || typeof message !== "object" || message.nonce !== nonce) return;
    window.frameMessages.push(message);
    if (message.kind === "booted") post({ kind: "load", markup: start.markup, templates: start.templates, routes: start.routes, entry: start.entry, lang: "en-US", dir: "ltr", title: start.title, ratio: devicePixelRatio });
    if (message.kind === "registered") post({ kind: "instantiate", typeIdentifier: start.typeIdentifier, configuration: start.configuration, state: start.state });
    if (message.kind === "height") landHeight(ours, message.pixels, message.pixels, post);
    if (message.kind === "ready" || message.kind === "failed") settle(message);
    if (message.kind === "completed") window.completed?.(message);
  };
  document.body.append(frame);
});
window.completePci = () => new Promise((settle) => { window.completed = settle; post({ kind: "complete" }); });
</script></body></html>`;

/**
 * The address a listening server took, as Node reports it for a TCP server.
 */
const ListeningAddress = Schema.Struct({ port: Schema.Number });

/**
 * Serve the host page at `/`, plate's frame page at `/frame.html` with the headers plate gives it,
 * and the mark-objects module file at the path the items name; nothing else.
 *
 * @param frame The frame page.
 * @param frame.headers Its response headers, its content-security policy among them.
 * @param frame.html Its HTML.
 * @param module The module file's bytes, as plate carries it.
 * @returns The request handler.
 */
const serveWith =
  (
    frame: { readonly headers: Readonly<Record<string, string>>; readonly html: string },
    module: Uint8Array,
  ) =>
  (request: IncomingMessage, response: ServerResponse): void => {
    const { pathname } = new URL(request.url ?? "/", "http://localhost");

    if (pathname === "/") {
      response.writeHead(200, { "content-type": "text/html; charset=utf-8" }).end(hostHtml);
    } else if (pathname === "/frame.html") {
      response.writeHead(200, frame.headers).end(frame.html);
    } else if (pathname === `/${modulePath}`) {
      response.writeHead(200, { "content-type": "text/javascript; charset=utf-8" }).end(module);
    } else {
      response.writeHead(404).end();
    }
  };

/**
 * The harness's server on a port of the loopback the system chose, closed with its scope: its
 * origin.
 */
const harnessServer: Effect.Effect<string, MarkObjectsFailure, Scope.Scope> = Effect.gen(
  function* harnessServer() {
    const frame = yield* framePage.pipe(Effect.provide(Digest.layerWebCrypto));
    const module = yield* attempt("read plate's mark-objects module file", () =>
      readFile(markObjects.script),
    );
    const server = yield* Effect.acquireRelease(
      Effect.callback<Server>((resume) => {
        const made = createServer(serveWith(frame, module));

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
      (cause) => new MarkObjectsFailure({ cause, step: "read the server's port" }),
    );

    return `http://127.0.0.1:${String(port)}`;
  },
);

/**
 * Chrome, through the suites' one launcher (`#specimen/ui/chrome.ts`), its failures this harness's.
 */
const launched = chromeFor((step, cause) => new MarkObjectsFailure({ cause, step }));

/**
 * The machine's Google Chrome, headless, closed with its scope.
 */
const chrome = launched.browser;

/**
 * A message the frame posted, as the page kept it: its kind and the fields the rules read.
 */
export interface FrameMessage {
  readonly kind: string;
  readonly reason?: string;
  readonly response?: unknown;
  readonly state?: unknown;
  readonly typeIdentifiers?: readonly string[];
  readonly value?: unknown;
}

/**
 * A ring as the PCI draws it over an object: the elements it is made of, and the fill and stroke of
 * its circle as the browser renders them (computed, so a stylesheet's rule counts as the markup's
 * attribute does).
 */
export interface DrawnRing {
  readonly elements: readonly string[];
  readonly fill: string;
  /**
   * The circle as it renders, in CSS pixels: its centre, its radius (its geometry, the stroke
   * aside) and its stroke's width.
   */
  readonly geometry: {
    readonly radius: number;
    readonly strokeWidth: number;
    readonly x: number;
    readonly y: number;
  };
  /**
   * How much of the ring shows: the product of the circle's, the ring's and the object's opacity,
   * the circle's stroke opacity, and its visibility.
   */
  readonly shown: {
    readonly opacity: number;
    readonly strokeOpacity: number;
    readonly visibility: string;
  };
  readonly stroke: string;
}

/**
 * One element an object holds as its own child: its name, and the names of every element under it.
 */
export interface DrawnChild {
  readonly descendants: readonly string[];
  readonly name: string;
}

/**
 * A box in the frame, in CSS pixels.
 */
export interface DrawnBox {
  readonly height: number;
  readonly width: number;
  readonly x: number;
  readonly y: number;
}

/**
 * One object as the PCI draws it in the frame: its box, every element it holds, whether it is
 * disabled, what a stylesheet draws on it, whether it is pressed, the pictures it holds by their
 * `alt`, and each ring drawn over it.
 */
export interface DrawnObject {
  readonly box: DrawnBox;
  readonly children: readonly DrawnChild[];
  readonly disabled: boolean;
  /**
   * What a stylesheet draws on the object beyond its elements, as the browser computes it: the
   * content of its `::before` and `::after`, its background image, and its overflow (which clips
   * a ring standing outside its box unless visible).
   */
  readonly look: {
    readonly after: string;
    readonly background: string;
    readonly before: string;
    readonly overflow: string;
  };
  readonly pictures: readonly {
    readonly alt: string;
    readonly attributes: readonly string[];
    readonly height: number;
    readonly loaded: boolean;
    readonly width: number;
  }[];
  readonly pressed: string | null;
  readonly rings: readonly DrawnRing[];
  /**
   * The browser's own gestures a touch that starts on the object may make, as it computes them:
   * `none` where the PCI takes every touch, so a swipe neither pans nor navigates.
   */
  readonly touchAction: string;
}

/**
 * What the frame shows: each object by its place, its index in the order the PCI makes the objects
 * (reading order in a row or in rows, the order its generator draws their cells in a scatter), the
 * box a scattered set's objects stand in (`null` for a row or rows), and the text the frame's
 * document holds.
 */
export interface Drawn {
  readonly objects: readonly DrawnObject[];
  readonly scatter: DrawnBox | null;
  /**
   * The set's own computed `touch-action`: the gestures the browser may make for a touch that
   * starts on the set between its objects.
   */
  readonly setTouchAction: string;
  readonly text: string;
}

/**
 * Where the host page stands: its address and how long its history is, each as the page reads it.
 */
export interface Whereabouts {
  readonly history: number;
  readonly href: string;
}

/**
 * How a frame is started: the response it is bound to and the state it restores, each absent for
 * none and either written as a host might write it, well formed or not, and the PCI's status,
 * `interacting` when absent.
 */
export interface Start {
  readonly boundTo?: unknown;
  readonly state?: unknown;
  readonly status?: string;
}

/**
 * What a frame shows before its module has run: the elements of the PCI's `dom` but its
 * `template`s, by name, the pictures of its document, and its text.
 */
export interface ShownBeforeModule {
  readonly elements: readonly string[];
  readonly pictures: number;
  readonly text: string;
}

/**
 * A page of the harness, holding one mark item's frame at a time.
 */
export interface RingPage {
  /**
   * Ask the frame to complete, and give the response and state it gave.
   */
  readonly complete: Effect.Effect<FrameMessage, MarkObjectsFailure>;
  /**
   * Read what the frame shows.
   */
  readonly drawn: Effect.Effect<Drawn, MarkObjectsFailure>;
  /**
   * Every message the frame posted, in order.
   */
  readonly messages: Effect.Effect<readonly FrameMessage[], MarkObjectsFailure>;
  /**
   * Make a fresh frame for the item with its module file held back, read what the frame shows once
   * it asks for the module, by when its markup is in place, then let the module load and settle on
   * the frame's `ready` or `failed`.
   */
  readonly beforeModule: (
    item: MarkItem,
  ) => Effect.Effect<
    { readonly settled: FrameMessage; readonly shown: ShownBeforeModule },
    MarkObjectsFailure
  >;
  /**
   * Make a fresh frame for the item and settle on its `ready` or `failed`.
   */
  readonly start: (item: MarkItem, start: Start) => Effect.Effect<FrameMessage, MarkObjectsFailure>;
  /**
   * Put a finger down at an object's centre, by its place, delivered to the frame's document there
   * (`#specimen/alpha/delivered.ts`), and swipe it sideways by a distance in CSS pixels, then lift
   * it, as a child's swipe does on a touch screen: a devtools session of its own with touch on for
   * the swipe alone. Give where the host page stood before and after (after a navigation that took
   * its document, the address "navigated away"), and how many of the frame's pointers the browser
   * cancelled, taking the gesture for its own.
   */
  readonly swipe: (
    place: number,
    by: number,
  ) => Effect.Effect<
    {
      readonly after: Whereabouts;
      readonly before: Whereabouts;
      readonly cancelled: number;
    },
    MarkObjectsFailure | TapNotDelivered
  >;
  /**
   * Give the frame a width, in CSS pixels, as a host's layout would: the harness's frame is 1000
   * wide until this changes it.
   */
  readonly frameWidth: (width: number) => Effect.Effect<void, MarkObjectsFailure>;
  /**
   * Focus an object by its place, then press keys in order on the keyboard, each named as
   * Playwright names it (`" "`, `"Enter"`, `"Tab"`): the focus taken once the frame's document
   * holds it on the object, and each key delivered to it (`#specimen/alpha/delivered.ts`), or
   * failing as `key not delivered`.
   */
  readonly press: (
    place: number,
    keys: readonly string[],
  ) => Effect.Effect<void, MarkObjectsFailure | KeyNotDelivered>;
  /**
   * Tap objects in order, each by its place, with the pointer at its centre in the frame's
   * document, as a child's finger does, whether or not the PCI has disabled it, each delivered to
   * the document there (`#specimen/alpha/delivered.ts`).
   */
  readonly tap: (
    places: readonly number[],
  ) => Effect.Effect<void, MarkObjectsFailure | TapNotDelivered>;
  /**
   * Every uncaught error the page and its frame threw since the last frame was started, its name
   * and message as Chrome reports them: a refusal's own message, which the frame's `failed`
   * withholds as "Script error.". It is read once the frame has answered one plain evaluation,
   * which Chrome answers on the frame's own session only after every error that frame reported
   * before it, and once two of the page's own frames have come, after the page's: so the count is
   * ordered after every throw, never timed. Nothing waits for a frame of the frame's, which a
   * failed frame left hidden would never let end.
   */
  readonly thrown: Effect.Effect<readonly string[], MarkObjectsFailure>;
}

/**
 * Give the routes the frame loads for an item: plate's resolution of its module facts, each
 * location at the harness's server, which serves the module at the path the item names.
 *
 * @param origin The server's origin.
 * @param item The item.
 * @returns The routes as the frame protocol carries them.
 */
const routesOf = (origin: string, item: MarkItem) =>
  resolvePciModules(
    item.modules,
    () => Option.none(),
    (file) => file === modulePath,
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

/**
 * Say why the frame's pictures could not be read: the harness's listeners are not in the frame's
 * document, a picture's request had not ended, or a picture did not decode.
 *
 * @param read What the read found.
 * @param read.undecoded The pictures that did not decode, none where the listeners are missing.
 * @param read.unloaded The pictures whose request had not ended.
 * @returns The cause.
 */
const unreadOf = (read: {
  readonly undecoded: readonly string[] | null;
  readonly unloaded: readonly string[];
}): string => {
  if (read.undecoded === null) {
    return "the frame has none of the harness's listeners";
  }

  return read.unloaded.length > 0
    ? `pictures that did not load: ${read.unloaded.join(", ")}`
    : `pictures that did not decode: ${read.undecoded.join(", ")}`;
};

/**
 * Read what the frame shows, in the frame's document, once each object's picture has decoded, on
 * the clock the document kept before its own scripts ran (`listening`): each picture's kept
 * `decode()`, which settles once the picture is decoded or cannot be, waited for only where the
 * picture's request has ended or must end; any other picture is named as one that did not load.
 *
 * @returns Each object by its place, and the document's text; or the pictures that did not load or
 *   did not decode, by their addresses, and none where the harness's listeners are not in the
 *   document.
 */
const readDrawn = async (): Promise<
  | Drawn
  | {
      readonly undecoded: readonly string[] | null;
      readonly unloaded: readonly string[];
    }
> => {
  const marker = "data-part";
  const part = (name: string): string => `[${marker}="${name}"]`;
  const objects = [...document.querySelectorAll<HTMLElement>(part("object"))];
  const kept = window.harnessKept;

  if (kept === undefined) {
    return { undecoded: null, unloaded: [] };
  }

  const pictured = await kept.decoded(
    objects.flatMap((object) => [...object.querySelectorAll("img")]),
  );

  if (pictured.unloaded.length > 0 || pictured.undecoded.length > 0) {
    return pictured;
  }

  const scatter = document.querySelector(part("scatter"))?.getBoundingClientRect();

  /**
   * Read each ring drawn over an object, as its own children, as it renders: its elements, its
   * circle's computed fill and stroke, how much of it shows, and its geometry in CSS pixels.
   *
   * @param object The object.
   * @param objectOpacity The object's opacity.
   * @returns Its rings.
   */
  const ringsOf = (object: Element, objectOpacity: number): readonly DrawnRing[] =>
    [...object.querySelectorAll(`:scope > ${part("ring")}`)].map((ring): DrawnRing => {
      const circle = ring.querySelector("circle");

      if (circle === null) {
        return {
          elements: [...ring.querySelectorAll("*")].map((each) => each.localName),
          fill: "",
          geometry: { radius: 0, strokeWidth: 0, x: 0, y: 0 },
          shown: { opacity: 0, strokeOpacity: 0, visibility: "" },
          stroke: "",
        };
      }

      const circleBox = circle.getBoundingClientRect();
      const drawn = ring.getBoundingClientRect();
      const units = ring instanceof SVGSVGElement ? ring.viewBox.baseVal.width : 0;
      const painted = getComputedStyle(circle);
      const width = Number(painted.strokeWidth.replace(/px$/u, ""));

      return {
        elements: [...ring.querySelectorAll("*")].map((each) => each.localName),
        fill: painted.fill,
        geometry: {
          radius: circleBox.width / 2,
          strokeWidth: units > 0 ? (width * drawn.width) / units : 0,
          x: circleBox.x + circleBox.width / 2,
          y: circleBox.y + circleBox.height / 2,
        },
        shown: {
          opacity: Number(painted.opacity) * Number(getComputedStyle(ring).opacity) * objectOpacity,
          strokeOpacity: Number(painted.strokeOpacity),
          visibility: painted.visibility,
        },
        stroke: painted.stroke,
      };
    });

  return {
    objects: objects.map((object) => {
      const box = object.getBoundingClientRect();
      const look = getComputedStyle(object);

      return {
        box: { height: box.height, width: box.width, x: box.x, y: box.y },
        children: [...object.children].map((child) => ({
          descendants: [...child.querySelectorAll("*")].map((each) => each.localName),
          name: child.localName,
        })),
        disabled: object instanceof HTMLButtonElement && object.disabled,
        look: {
          after: getComputedStyle(object, "::after").content,
          background: look.backgroundImage,
          before: getComputedStyle(object, "::before").content,
          overflow: look.overflow,
        },
        pictures: [...object.querySelectorAll("img")].map((picture) => ({
          alt: picture.alt,
          attributes: picture.getAttributeNames().toSorted(),
          height: picture.getBoundingClientRect().height,
          loaded: kept.loaded(picture),
          width: picture.getBoundingClientRect().width,
        })),
        pressed: object.getAttribute("aria-pressed"),
        rings: ringsOf(object, Number(look.opacity)),
        touchAction: look.touchAction,
      };
    }),
    scatter:
      scatter === undefined
        ? null
        : { height: scatter.height, width: scatter.width, x: scatter.x, y: scatter.y },
    setTouchAction: Array.from(
      document.querySelectorAll(part("set")),
      (set) => getComputedStyle(set).touchAction,
    ).join(" "),
    text: document.querySelector("[data-pci-dom]")?.textContent ?? "",
  };
};

/**
 * Read what the frame shows before its module has run, in the frame's document: a `template`'s
 * content is no part of the document, so a picture inside one is not among its pictures.
 *
 * @returns The elements of the PCI's `dom` but its templates, the document's pictures, and the
 *   text of the PCI's `dom`.
 */
const readShownBeforeModule = (): ShownBeforeModule => {
  const dom = document.querySelector("[data-pci-dom]");

  return {
    elements: [...(dom?.children ?? [])]
      .map((element) => element.localName)
      .filter((name) => name !== "template"),
    pictures: document.images.length,
    text: dom?.textContent ?? "",
  };
};

/**
 * Give the script that starts a fresh frame for an item: `startPci` with the item's content, its
 * routes at the server, the PCI's configuration and the state, settling on `ready` or `failed`.
 *
 * @param origin The server's origin.
 * @param item The item.
 * @param start The response it is bound to and the state it restores, each absent for none.
 * @returns The script.
 */
const startScript = (origin: string, item: MarkItem, start: Start): string =>
  `window.startPci(${JSON.stringify({
    configuration: {
      boundTo: Object.fromEntries(
        Object.entries({ [item.responseIdentifier]: start.boundTo }).filter(
          ([, value]) => value !== undefined,
        ),
      ),
      contextVariables: {},
      properties: item.properties,
      responseIdentifier: item.responseIdentifier,
      status: start.status ?? "interacting",
      templateVariables: {},
    },
    entry: Option.getOrUndefined(item.modules.module),
    markup: item.markup,
    routes: routesOf(origin, item),
    state: start.state,
    templates: item.templates,
    title: item.prompt,
    typeIdentifier: item.typeIdentifier,
  })})`;

/**
 * Start a fresh frame with its module file held back: route the module's request to a hold, start
 * the frame, read what the frame that asked for the module shows, then let the request through and
 * wait for the frame to settle. The route is gone once the frame has settled.
 *
 * @param page The page.
 * @param origin The server's origin.
 * @param item The item.
 * @returns What the frame showed, and its `ready` or `failed`.
 */
const startHeld = async (
  page: Page,
  origin: string,
  item: MarkItem,
): Promise<{ readonly settled: FrameMessage; readonly shown: ShownBeforeModule }> => {
  const url = `${origin}/${modulePath}`;
  const asked = Promise.withResolvers<Route>();

  await page.route(url, (route) => {
    asked.resolve(route);
  });

  const settling = page.evaluate<FrameMessage>(startScript(origin, item, {}));
  const route = await asked.promise;
  const frame: Frame = route.request().frame();
  const shown = await frame.evaluate(readShownBeforeModule);

  await route.continue();

  const settled = await settling;

  await page.unroute(url);

  return { settled, shown };
};

/**
 * How many moves a swipe makes on its way, each an equal part of its distance.
 */
const swipeSteps = 10;

/**
 * Read where the host page stands.
 *
 * @param page The page.
 * @returns Its address and its history's length.
 */
const whereabouts = (page: Page): Effect.Effect<Whereabouts, MarkObjectsFailure> =>
  attempt("read where the page stands", () =>
    page.evaluate((): Whereabouts => ({ history: history.length, href: location.href })),
  );

/**
 * Start counting, in the frame's document, the pointers the browser cancels: it cancels a touch's
 * pointer once it takes the gesture for its own (a pan, or the swipe back), and never while the PCI
 * takes every touch. The count lives on the document's element; its listener is added once.
 */
const watchCancels = (): void => {
  const root = document.documentElement;

  if (root.dataset["cancelsWatched"] === undefined) {
    root.dataset["cancelsWatched"] = "";
    document.addEventListener(
      "pointercancel",
      () => {
        root.dataset["cancels"] = String(Number(root.dataset["cancels"] ?? "0") + 1);
      },
      { capture: true },
    );
  }

  root.dataset["cancels"] = "0";
};

/**
 * Read how many pointers the browser cancelled in the frame's document since {@link watchCancels}.
 *
 * @returns The count.
 */
const cancelsSeen = (): number => Number(document.documentElement.dataset["cancels"] ?? "0");

/**
 * Swipe one finger sideways from what it is meant to start on, on a devtools session of its own
 * that turns touch on for the swipe alone and is detached with it: down, delivered to the frame's
 * document there (`#specimen/alpha/delivered.ts`) or failing as `tap not delivered`, then
 * `swipeSteps` equal moves from where it went down, up, then two of the page's animation frames.
 * The frame's cancelled pointers are counted meanwhile: none where the PCI kept the whole swipe,
 * and -1 where the frame went with its page.
 *
 * @param page The page.
 * @param frame The PCI's frame.
 * @param from What the finger goes down on, and where inside its box.
 * @param by How far it moves sideways, in CSS pixels, to the right where positive.
 * @returns The pointers the browser cancelled.
 */
const swiped = (
  page: Page,
  frame: Frame,
  from: Target,
  by: number,
): Effect.Effect<number, MarkObjectsFailure | TapNotDelivered> =>
  Effect.scoped(
    Effect.gen(function* swiping() {
      yield* attempt("count the frame's cancelled pointers", () => frame.evaluate(watchCancels));

      const session = yield* Effect.acquireRelease(
        attempt("open a touch session", () => page.context().newCDPSession(page)),
        (opened) => Effect.promise(() => opened.detach()),
      );

      yield* attempt("turn touch on", () =>
        session.send("Emulation.setTouchEmulationEnabled", { enabled: true, maxTouchPoints: 1 }),
      );

      const { aim } = yield* pressInto(
        frame,
        attempt,
        `put a finger down on ${nameOf(from.meant)}`,
        from,
        (point) =>
          attempt("put a finger down", () =>
            session.send("Input.dispatchTouchEvent", { touchPoints: [point], type: "touchStart" }),
          ).pipe(Effect.asVoid),
      );

      yield* Effect.forEach(
        Array.from({ length: swipeSteps }, (_unused, step) => step + 1),
        (step) =>
          attempt("move the finger", () =>
            session.send("Input.dispatchTouchEvent", {
              touchPoints: [{ x: aim.x + (by * step) / swipeSteps, y: aim.y }],
              type: "touchMove",
            }),
          ),
        { discard: true },
      );
      yield* attempt("lift the finger", () =>
        session.send("Input.dispatchTouchEvent", { touchPoints: [], type: "touchEnd" }),
      );
      yield* attempt("turn touch off", () =>
        session.send("Emulation.setTouchEmulationEnabled", { enabled: false }),
      );
      yield* Effect.ignore(attempt("let the page settle", () => page.evaluate(framesIn)));

      return yield* attempt("read the frame's cancelled pointers", () =>
        frame.evaluate(cancelsSeen),
      ).pipe(Effect.orElseSucceed(() => -1));
    }),
  );

/**
 * Open a page of the harness in Chrome, on its server.
 *
 * @returns The page, closed with its scope.
 */
export const ringPage: Effect.Effect<RingPage, MarkObjectsFailure, Scope.Scope> = Effect.gen(
  function* ringPage() {
    const origin = yield* harnessServer;
    const browser = yield* chrome;
    const page: Page = yield* launched.pageOf(browser, {});

    yield* attempt("listen in every document of the page", () => page.addInitScript(listening));

    const thrown: string[] = [];

    page.on("pageerror", (error) => {
      thrown.push(`${error.name}: ${error.message}`);
    });

    yield* attempt("load the host page", () => page.goto(`${origin}/`));

    const frame = page.frameLocator("iframe");
    /**
     * The frame's document, the one frame of the page but its own.
     */
    const framed = Effect.flatMap(
      Effect.sync(() => page.frames().find((each) => each !== page.mainFrame())),
      (found) =>
        found === undefined
          ? Effect.fail(new MarkObjectsFailure({ cause: "no frame", step: "find the frame" }))
          : Effect.succeed(found),
    );

    return {
      beforeModule: (item) =>
        Effect.gen(function* heldBack() {
          const held = yield* attempt("start the PCI with its module held back", () =>
            startHeld(page, origin, item),
          );

          if (held.settled.kind === "ready") {
            yield* settledFor(
              yield* framed,
              attempt,
              "start the PCI with its module held back",
              (why) => new MarkObjectsFailure({ cause: why, step: "settle the PCI's frame" }),
            );
          }

          return held;
        }),
      complete: attempt("complete the PCI", () =>
        page.evaluate<FrameMessage>("window.completePci()"),
      ),
      drawn: Effect.flatMap(
        Effect.flatMap(
          Effect.sync(() => page.frames().find((each) => each !== page.mainFrame())),
          (inner) =>
            inner === undefined
              ? Effect.fail(new MarkObjectsFailure({ cause: "no frame", step: "read the frame" }))
              : attempt("read the frame", () => inner.evaluate(readDrawn)),
        ),
        (read) =>
          "undecoded" in read
            ? Effect.fail(
                new MarkObjectsFailure({
                  cause: unreadOf(read),
                  step: "read the frame",
                }),
              )
            : Effect.succeed(read),
      ),
      frameWidth: (width) =>
        attempt(`give the frame ${String(width)} pixels`, () =>
          page.evaluate((pixels) => {
            document.querySelector("iframe")?.setAttribute("width", String(pixels));
          }, width),
        ),
      messages: attempt("read the frame's messages", () =>
        page.evaluate<readonly FrameMessage[]>("window.frameMessages"),
      ),
      press: (place, keys) =>
        Effect.gen(function* pressed() {
          const document = yield* framed;

          yield* focusOn(
            document,
            attempt,
            { nth: place, selector: '[data-part="object"]' },
            attempt(`focus object ${String(place)}`, () =>
              frame.locator('[data-part="object"]').nth(place).focus(),
            ),
          );

          for (const key of keys) {
            yield* keyInto(
              document,
              attempt,
              key,
              attempt(`press ${key}`, () => page.keyboard.press(key)),
            );
          }
        }),
      start: (item, start) =>
        Effect.gen(function* started() {
          const message = yield* attempt("start the PCI", () => {
            thrown.length = 0;

            return page.evaluate<FrameMessage>(startScript(origin, item, start));
          });

          if (message.kind === "ready") {
            yield* settledFor(
              yield* framed,
              attempt,
              "start the PCI",
              (why) => new MarkObjectsFailure({ cause: why, step: "settle the PCI's frame" }),
            );
          }

          return message;
        }),
      swipe: (place, by) =>
        Effect.gen(function* swipe() {
          const document = yield* framed;
          const before = yield* whereabouts(page);
          const cancelled = yield* swiped(
            page,
            document,
            {
              anchor: centred,
              meant: meantFor(`[data-part="object"][data-place="${String(place)}"]`, 0),
            },
            by,
          );
          const after = yield* whereabouts(page).pipe(
            Effect.orElseSucceed((): Whereabouts => ({ history: -1, href: "navigated away" })),
          );

          return { after, before, cancelled };
        }),
      tap: (places) =>
        Effect.gen(function* tapped() {
          const document = yield* framed;

          for (const place of places) {
            const step = `tap object ${String(place)}`;

            yield* pressInto(
              document,
              attempt,
              step,
              {
                anchor: centred,
                meant: meantFor(`[data-part="object"][data-place="${String(place)}"]`, 0),
              },
              (aim) => attempt(step, () => page.mouse.click(aim.x, aim.y)),
            );
          }
        }),
      thrown: framed.pipe(
        Effect.flatMap((document) =>
          attempt("read what the page threw", async () => {
            await document.evaluate(() => null);
            await page.evaluate(framesIn);

            return [...thrown];
          }),
        ),
      ),
    } satisfies RingPage;
  },
);
