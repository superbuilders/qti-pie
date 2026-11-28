/**
 * The shade-parts PCI (`urn:fdc:alpha.school:2026:shade-parts`, `shadeParts` of
 * `@qti-pie/plate/alpha/pci-modules`) driven as a child drives it: one of the suite's synthetic
 * items (`fixtures/alpha/shade-parts/`, made-up items of the figures the Grade 3 fraction items
 * use, with the module attribute and `qti-interaction-modules` QTI's module resolution needs), run
 * in plate's own PCI frame page (`@qti-pie/plate/ui/pci-frame`), its boot and its AMD loader, in
 * headless Google Chrome, its parts tapped with the pointer or toggled from the keyboard, and what
 * the frame relays and the PCI draws read back.
 *
 * A page of this harness stands in for plate's island, the host side of the frame protocol
 * (`#plate/ui/portable-custom/protocol.ts` in plate): it makes the sandboxed frame with its nonce,
 * sends the frame the item's markup and the module routes plate's resolution gives from the item's
 * own module facts (`resolvePciModules`), instantiates the factory the frame registered with the
 * item's properties, the status and the bound response, and records every message the frame posts.
 * The item is read from its XML here, as the specification names its parts, never through plate's
 * reader: its `data-*` named as HTML's `dataset` names them (the PCI's `properties`).
 *
 * What the frame shows is read in the frame's document from the specification's terms, never from
 * the PCI's code: each tappable part, the element a `role="button"` names, its pressed state, its
 * painted fill and outline, and the largest disc it holds, found by testing points against the
 * part's own fill (`isPointInFill`) and the page's hit test (`elementFromPoint`), the disc's centre
 * the point a tap is made at; each part of a shown model, a picture; and the text of the frame.
 *
 * The page, the frame page and the module are served from this machine, so nothing loads from
 * another host. Chrome is the machine's, through Playwright's `chrome` channel, headless.
 *
 * Test support for `#specimen/alpha/shade-parts.test.ts`.
 *
 * Every route it gives the frame waits for its module's script with no clock, as
 * {@link unboundedPrimaryWait} says: a module server that never answers is a hang that no rule
 * of the suite names, and the gate's progress watch judges it, never a failure here.
 *
 * @module
 * @see https://www.imsglobal.org/spec/qti/v3p0/impl
 * @see https://html.spec.whatwg.org/multipage/dom.html#dom-dataset
 */
import { readFile } from "node:fs/promises";
import { createServer } from "node:http";
import path from "node:path";
import type { IncomingMessage, Server, ServerResponse } from "node:http";
import { Data, Effect, Option, Schema } from "effect";
import type { Scope } from "effect";
import { Digest } from "effect/crypto";
import { parseHTML } from "linkedom";
import type { Frame, Page, Route } from "playwright-core";
import { chromeFor, unboundedPrimaryWait } from "#specimen/ui/chrome.ts";
import { resolvePciModules } from "@qti-pie/plate";
import type { PciModules } from "@qti-pie/plate";
import { shadeParts } from "@qti-pie/plate/alpha/pci-modules";
import { framePage, landHeight } from "@qti-pie/plate/ui/pci-frame";
import {
  anchoredAt,
  focusInto,
  framesIn,
  keyInto,
  listening,
  meantFor,
  nameOf,
  pressInto,
  settledFor,
} from "#specimen/alpha/delivered.ts";
import type { KeyNotDelivered, TapNotDelivered, Target } from "#specimen/alpha/delivered.ts";

/**
 * A step of the harness failed: Chrome, the server, a file of the fixture, or a page's script.
 */
export class ShadePartsFailure extends Data.TaggedError("ShadePartsFailure")<{
  readonly cause: unknown;
  readonly step: string;
}> {
  /**
   * The step that failed and its cause.
   */
  override get message(): string {
    return `The shade-parts harness could not ${this.step}: ${String(this.cause)}`;
  }
}

/**
 * Run a promise as one step of the harness.
 *
 * @param step What the step does, as a verb phrase.
 * @param run The promise.
 * @returns Its value, or the failure naming the step.
 */
const attempt = <A>(step: string, run: () => Promise<A>): Effect.Effect<A, ShadePartsFailure> =>
  Effect.tryPromise({ catch: (cause) => new ShadePartsFailure({ cause, step }), try: run });

/**
 * The fixture the items are read from, `fixtures/alpha/shade-parts/` of the package: each item at
 * `qti/<name>.xml`. The package's module file is not among them: it is plate's, {@link shadeParts}.
 */
const fixtureDirectory = path.resolve(
  import.meta.dirname,
  "..",
  "..",
  "fixtures",
  "alpha",
  "shade-parts",
);

/**
 * One item as the frame host is handed it: the PCI's type identifier, response identifier and
 * properties, its module facts as written, its markup's HTML, and the prompt's text, the frame's
 * title.
 */
export interface ShadeItem {
  /**
   * The item's key: its `qti-correct-response` value, NaN when it writes none.
   */
  readonly correct: number;
  readonly markup: string;
  readonly modules: PciModules;
  readonly prompt: string;
  readonly properties: Readonly<Record<string, string>>;
  readonly responseIdentifier: string;
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
 * Read one item from the fixture.
 *
 * @param name The item's name, its file `qti/<name>.xml`.
 * @returns The item as the frame host is handed it.
 */
/**
 * Give an item's markup as a delivery system hands it to the frame: each picture the package holds
 * (`src="../media/<file>"`, relative to the item) at a URL the frame loads, here the file's bytes
 * as a `data:` URL, since the frame's policy loads pictures over https, `data:` and `blob:` only.
 *
 * @param markup The markup as the item writes it.
 * @returns The markup with each package picture's `src` a `data:` URL.
 */
const deliveredMarkup = Effect.fn("deliveredMarkup")(function* deliveredMarkup(markup: string) {
  const sources = [
    ...new Set(
      [...markup.matchAll(/src="(?<source>\.\.\/media\/[0-9a-f]{64}\.svg)"/gu)].map(
        (each) => each.groups?.["source"] ?? "",
      ),
    ),
  ];
  let delivered = markup;

  for (const source of sources) {
    const bytes = yield* attempt(`read ${source}`, () =>
      readFile(path.join(fixtureDirectory, "qti", source)),
    );

    delivered = delivered.replaceAll(
      `src="${source}"`,
      `src="data:image/svg+xml;base64,${bytes.toString("base64")}"`,
    );
  }

  return delivered;
});

export const shadeItem = Effect.fn("shadeItem")(function* shadeItem(name: string) {
  const itemPath = path.join("qti", `${name}.xml`);
  const xml = yield* attempt(`read ${itemPath}`, () =>
    readFile(path.join(fixtureDirectory, itemPath), "utf-8"),
  );
  const document = new XmlParser().parseFromString(xml, "text/xml");
  const pci = document.querySelector("qti-portable-custom-interaction");
  const markup = pci?.querySelector("qti-interaction-markup");
  const modules = pci?.querySelector("qti-interaction-modules");

  if (pci === null || pci === undefined || markup === null || markup === undefined) {
    return yield* new ShadePartsFailure({
      cause: "no qti-portable-custom-interaction with a qti-interaction-markup",
      step: `read ${itemPath}`,
    });
  }

  const attribute = (attributeName: string): Option.Option<string> =>
    Option.fromNullishOr(pci.getAttribute(attributeName));

  return {
    correct: Number(
      document.querySelector("qti-response-declaration qti-correct-response qti-value")
        ?.textContent ?? Number.NaN,
    ),
    markup: yield* deliveredMarkup(markup.innerHTML),
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
    // The stem: the paragraph of the body before the interaction (the shade form writes no
    // qti-prompt).
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
  } satisfies ShadeItem;
});

/**
 * Press a key as the page's keyboard does, or hold it down (`down:<key>`, each further one a
 * repeat) or let it go (`up:<key>`).
 *
 * @param page The page.
 * @param key The key, or `down:` or `up:` and the key.
 * @returns Once the key is pressed, held or let go.
 */
const keyed = (page: Page, key: string): Promise<void> => {
  if (key.startsWith("down:")) {
    return page.keyboard.down(key.slice("down:".length));
  }

  if (key.startsWith("up:")) {
    return page.keyboard.up(key.slice("up:".length));
  }

  return page.keyboard.press(key);
};

/**
 * The host page: plate's island's side of the frame protocol, as a script. `startPci` makes the
 * frame, answers its `booted` with the item's content and routes and its `registered` with the
 * factory and configuration it is given, and settles on `ready` or `failed`; `completePci` asks
 * the frame to complete and settles on `completed`. Every message the frame posts is kept in
 * `frameMessages`, in order. The frame stands at least 1200 px tall, so its viewport holds the
 * whole drawing from the start, before its first height message, and a point of a part below its
 * first 150 px is hit and tapped like any other.
 */
const hostHtml = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><title>shade parts</title></head><body style="margin:0">
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
  frame.setAttribute("height", "1200");
  frame.style.border = "0";
  frame.style.display = "block";
  frame.src = "/frame.html#" + encodeURIComponent(nonce);
  const ours = frame;
  window.onmessage = (event) => {
    const message = event.data;
    if (event.source !== ours.contentWindow || message === null || typeof message !== "object" || message.nonce !== nonce) return;
    window.frameMessages.push(message);
    if (message.kind === "booted") post({ kind: "load", markup: start.markup, templates: [], routes: start.routes, entry: start.entry, lang: "en-US", dir: "ltr", title: start.title, ratio: devicePixelRatio });
    if (message.kind === "registered") post({ kind: "instantiate", typeIdentifier: start.typeIdentifier, configuration: start.configuration, state: start.state });
    if (message.kind === "height") landHeight(ours, message.pixels, Math.max(1200, message.pixels), post);
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
 * and the module file at the path the items name; nothing else.
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
    } else if (pathname === `/${shadeParts.path}`) {
      response.writeHead(200, { "content-type": "text/javascript; charset=utf-8" }).end(module);
    } else {
      response.writeHead(404).end();
    }
  };

/**
 * The harness's server on a port of the loopback the system chose, closed with its scope: its
 * origin.
 */
const harnessServer: Effect.Effect<string, ShadePartsFailure, Scope.Scope> = Effect.gen(
  function* harnessServer() {
    const frame = yield* framePage.pipe(Effect.provide(Digest.layerWebCrypto));
    const module = yield* attempt("read plate's shade-parts module file", () =>
      readFile(shadeParts.script),
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
      (cause) => new ShadePartsFailure({ cause, step: "read the server's port" }),
    );

    return `http://127.0.0.1:${String(port)}`;
  },
);

/**
 * Chrome, through the suites' one launcher (`#specimen/ui/chrome.ts`), its failures this harness's.
 */
const launched = chromeFor((step, cause) => new ShadePartsFailure({ cause, step }));

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
 * One tappable part as the frame shows it: its pressed and disabled states, its tab stop, its
 * accessible name, its painted fill and outline, the centre and radius of the largest disc it holds
 * where a tap lands on it, that centre as a point inside its own box, and its area by its fill.
 */
export interface DrawnPart {
  readonly area: number;
  readonly centre: Point;
  readonly disabled: string | null;
  readonly fill: string;
  /**
   * The centre of the largest disc the part holds, from its box's corner: where a tap on it aims,
   * inside the box the press reads as it aims.
   */
  readonly inBox: Point;
  readonly label: string | null;
  readonly pressed: string | null;
  readonly radius: number;
  readonly stroke: string;
  readonly strokeWidth: string;
  readonly tabIndex: string | null;
  /**
   * The part's own computed `touch-action`. Chromium reads no SVG child's own value: what decides
   * for a touch on a part is its model's `svg` and the whole, read on {@link DrawnModel} and
   * {@link Drawn}.
   */
  readonly touchAction: string;
}

/**
 * A part as its fill measures it: its area in pixels, and the centre and radius of the largest disc
 * it holds.
 */
export interface Measured {
  readonly area: number;
  readonly centre: Point;
  readonly radius: number;
}

/**
 * A model as the frame shows it: its box in the frame's document, its accessible role and name, and
 * its parts by place.
 */
export interface DrawnModel {
  readonly box: {
    readonly height: number;
    readonly width: number;
    readonly x: number;
    readonly y: number;
  };
  readonly label: string | null;
  readonly role: string | null;
  /**
   * The model's computed `touch-action`, the `svg`'s, which the browser reads for a touch that
   * starts anywhere on it.
   */
  readonly touchAction: string;
}

/**
 * Where the host page stands: its address and how long its history is, each as the page reads it.
 */
export interface Whereabouts {
  readonly history: number;
  readonly href: string;
}

/**
 * A picture the model draws, a set's object on a disc: its box's centre and size in the frame's
 * viewport, whether it is hidden from a screen reader, its address, and whether it takes a tap.
 */
export interface DrawnPicture {
  readonly centre: Point;
  readonly height: number;
  readonly hidden: string | null;
  readonly href: string;
  readonly pointerEvents: string;
  readonly width: number;
}

/**
 * What the frame shows: the model the child shades and its tappable parts by place; the shown
 * model, when there is one, the fill of each of its parts by place, and the centre of each of its
 * parts where a tap lands on the shown model, from the shown model's own box's corner; and the text
 * of the PCI's `dom`.
 */
export interface Drawn {
  readonly model: DrawnModel | undefined;
  readonly parts: readonly DrawnPart[];
  /**
   * The pictures the model draws, a set's object on each disc.
   */
  readonly pictures: readonly DrawnPicture[];
  readonly shown: DrawnModel | undefined;
  readonly shownFills: readonly string[];
  readonly shownSpots: readonly Point[];
  readonly shownTappable: number;
  readonly text: string;
  /**
   * The whole's computed `touch-action`: the element holding both models and the gap between
   * them, `none` where the PCI takes every touch that starts anywhere on it.
   */
  readonly wholeTouchAction: string;
}

/**
 * The response a frame is bound to, as the island writes it in the Appendix C JSON binding: a
 * count, or NULL.
 */
export type BoundCount = { readonly base: null } | { readonly base: { readonly integer: number } };

/**
 * How a frame is started: the response it is bound to, the state it restores, each absent for
 * none, and the status, `interacting` unless named.
 */
export interface Start {
  readonly boundTo?: BoundCount;
  readonly state?: unknown;
  readonly status?: string;
}

/**
 * What a frame shows before its module has run: the elements of the PCI's `dom`, by name, and its
 * text.
 */
export interface ShownBeforeModule {
  readonly elements: readonly string[];
  readonly text: string;
}

/**
 * A page of the harness, holding one item's frame at a time.
 */
export interface ShadePage {
  /**
   * Make a fresh frame for the item with its module file held back, read what the frame shows once
   * it asks for the module, then let the module load and settle on the frame's `ready` or `failed`.
   */
  readonly beforeModule: (
    item: ShadeItem,
  ) => Effect.Effect<
    { readonly settled: FrameMessage; readonly shown: ShownBeforeModule },
    ShadePartsFailure
  >;
  /**
   * Ask the frame to complete, and give the response and state it gave.
   */
  readonly complete: Effect.Effect<FrameMessage, ShadePartsFailure>;
  /**
   * Read what the frame shows, once its layout has settled.
   */
  readonly drawn: Effect.Effect<Drawn, ShadePartsFailure>;
  /**
   * Press keys in the frame, in order, each as Playwright names it (`Tab`, `Space`, `Enter`), each
   * delivered to the frame's document or failing as `key not delivered`
   * (`#specimen/alpha/delivered.ts`): a `Tab` or `Shift+Tab` once the document has heard exactly
   * one `focusin`, since focus crosses into it after the key, so a key pressed at once could reach
   * the page; any other key once it has heard the key's `keydown`s, or its `keyup`.
   */
  readonly press: (
    keys: readonly string[],
  ) => Effect.Effect<void, ShadePartsFailure | KeyNotDelivered>;
  /**
   * Every message the frame posted, in order.
   */
  readonly messages: Effect.Effect<readonly FrameMessage[], ShadePartsFailure>;
  /**
   * Make a fresh frame for the item and settle on its `ready` or `failed`.
   */
  readonly start: (item: ShadeItem, start: Start) => Effect.Effect<FrameMessage, ShadePartsFailure>;
  /**
   * Put a finger down at a part, by its place, at the centre of the largest disc it holds,
   * delivered to the frame's document there (`#specimen/alpha/delivered.ts`), and swipe it sideways
   * by a distance in CSS pixels, then lift it, as a child's swipe does on a touch screen: a
   * devtools session of its own with touch on for the swipe alone. Give where the host page stood
   * before and after (after a navigation that took its document, the address "navigated away"),
   * and how many of the frame's pointers the browser cancelled, taking the gesture for its own.
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
    ShadePartsFailure | TapNotDelivered
  >;
  /**
   * Tap parts in order, each by its place, with the pointer at the centre of the largest disc it
   * holds, each delivered to the frame's document (`#specimen/alpha/delivered.ts`).
   */
  readonly tap: (
    places: readonly number[],
  ) => Effect.Effect<void, ShadePartsFailure | TapNotDelivered>;
  /**
   * Tap points of the shown model in order, each a point inside its box from its corner, with the
   * pointer, each meant for the shown model and delivered to it (`#specimen/alpha/delivered.ts`).
   */
  readonly tapShown: (
    spots: readonly Point[],
  ) => Effect.Effect<void, ShadePartsFailure | TapNotDelivered>;
}

/**
 * The selector of the model's part at a place, from 0, by the accessible name the PCI gives each
 * part once, when it draws it ("part 1 of 4"), which no other part takes when one goes: each tap is
 * meant for its own part.
 *
 * @param place The part's place, as {@link Drawn} gives the parts.
 * @returns The selector.
 */
const partAt = (place: number): string =>
  `svg[role="group"] [role="button"][aria-label^="part ${String(place + 1)} of "]`;

/**
 * The selector of the shown model, which every tap on it is meant for.
 */
const shownSelector = 'svg[role="img"]';

/**
 * Give the routes the frame loads for an item: plate's resolution of its module facts, each
 * location at the harness's server, which serves the module at the path the item names.
 *
 * @param origin The server's origin.
 * @param item The item.
 * @returns The routes as the frame protocol carries them.
 */
const routesOf = (origin: string, item: ShadeItem) =>
  resolvePciModules(
    item.modules,
    () => Option.none(),
    (file) => file === shadeParts.path,
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
 * Read what the frame shows, in the frame's document. A part's disc is measured, never read from
 * the PCI: its fill is sampled at the centre of every pixel of its box and a pixel beyond
 * (`isPointInFill`), the exact Euclidean distance from each pixel inside to the nearest outside
 * taken (Felzenszwalb and Huttenlocher's two passes), and the farthest inside pixel is the disc's
 * centre, its radius that distance less half a pixel; the centre is a point a tap lands on the part
 * (`elementFromPoint`), else the radius counts as 0. Its area is the count of pixels inside.
 *
 * @returns The models, their parts, and the text.
 * @see https://doi.org/10.4086/toc.2012.v008a019
 */
const readDrawn = (): Drawn => {
  const geometryOf = (element: Element): SVGGeometryElement | undefined =>
    element instanceof SVGGeometryElement ? element : undefined;
  const transform1d = (cells: Float64Array): Float64Array => {
    const count = cells.length;
    const out = new Float64Array(count);
    const sites = new Int32Array(count);
    const bounds = new Float64Array(count + 1);
    let k = 0;

    bounds[0] = -Infinity;
    bounds[1] = Infinity;

    for (let q = 1; q < count; q += 1) {
      const at = (cells[q] ?? 0) + q * q;
      let crossing = 0;

      for (;;) {
        const site = sites[k] ?? 0;

        crossing = (at - ((cells[site] ?? 0) + site * site)) / (2 * q - 2 * site);

        if (crossing > (bounds[k] ?? 0) || k === 0) {
          break;
        }

        k -= 1;
      }

      if (crossing <= (bounds[k] ?? 0)) {
        sites[k] = q;
      } else {
        k += 1;
        sites[k] = q;
        bounds[k] = crossing;
      }

      bounds[k + 1] = Infinity;
    }

    k = 0;

    for (let q = 0; q < count; q += 1) {
      while ((bounds[k + 1] ?? Infinity) < q) {
        k += 1;
      }

      const site = sites[k] ?? 0;

      out[q] = (q - site) * (q - site) + (cells[site] ?? 0);
    }

    return out;
  };
  const measure = (geometry: SVGGeometryElement): Measured => {
    const box = geometry.getBBox();
    const left = Math.floor(box.x) - 1;
    const top = Math.floor(box.y) - 1;
    const width = Math.ceil(box.x + box.width) + 2 - left;
    const height = Math.ceil(box.y + box.height) + 2 - top;
    const far = (width + height) ** 2;
    const grid = new Float64Array(width * height);
    let area = 0;

    for (let y = 0; y < height; y += 1) {
      for (let x = 0; x < width; x += 1) {
        const inside = geometry.isPointInFill(new DOMPoint(left + x + 0.5, top + y + 0.5));

        grid[y * width + x] = inside ? far : 0;
        area += inside ? 1 : 0;
      }
    }

    for (let x = 0; x < width; x += 1) {
      const column = transform1d(
        Float64Array.from({ length: height }, (_unused, y) => grid[y * width + x] ?? 0),
      );

      for (let y = 0; y < height; y += 1) {
        grid[y * width + x] = column[y] ?? 0;
      }
    }

    let best = { distance: 0, x: 0, y: 0 };

    for (let y = 0; y < height; y += 1) {
      const row = transform1d(grid.slice(y * width, (y + 1) * width));

      for (let x = 0; x < width; x += 1) {
        const distance = Math.sqrt(row[x] ?? 0);

        if (distance > best.distance) {
          best = { distance, x, y };
        }
      }
    }

    const point = new DOMPoint(left + best.x + 0.5, top + best.y + 0.5).matrixTransform(
      geometry.ownerSVGElement?.getScreenCTM() ?? new DOMMatrix(),
    );

    return { area, centre: { x: point.x, y: point.y }, radius: Math.max(0, best.distance - 0.5) };
  };
  const modelOf = (element: Element | null | undefined): DrawnModel | undefined => {
    if (element === null || element === undefined) {
      return undefined;
    }

    const box = element.getBoundingClientRect();

    return {
      box: { height: box.height, width: box.width, x: box.x, y: box.y },
      label: element.getAttribute("aria-label"),
      role: element.getAttribute("role"),
      touchAction: getComputedStyle(element).touchAction,
    };
  };
  const dom = document.querySelector("[data-pci-dom]");
  const svgs = [...(dom?.querySelectorAll("svg") ?? [])];
  const model = svgs.find((svg) => svg.getAttribute("role") === "group");
  const shown = svgs.find((svg) => svg.getAttribute("role") === "img");
  const parts = [...(model?.querySelectorAll('[role="button"]') ?? [])];

  return {
    model: modelOf(model),
    parts: parts.map((part) => {
      const geometry = geometryOf(part);
      const style = getComputedStyle(part);
      const disc =
        geometry === undefined ? { area: 0, centre: { x: 0, y: 0 }, radius: 0 } : measure(geometry);
      const hit = document.elementFromPoint(disc.centre.x, disc.centre.y);
      const box = part.getBoundingClientRect();

      return {
        area: disc.area,
        centre: disc.centre,
        disabled: part.getAttribute("aria-disabled"),
        fill: style.fill,
        inBox: { x: disc.centre.x - box.x, y: disc.centre.y - box.y },
        label: part.getAttribute("aria-label"),
        pressed: part.getAttribute("aria-pressed"),
        radius: hit === part ? disc.radius : 0,
        stroke: style.stroke,
        strokeWidth: style.strokeWidth,
        tabIndex: part.getAttribute("tabindex"),
        touchAction: style.touchAction,
      };
    }),
    pictures: [...(model?.querySelectorAll('[data-shade="picture"]') ?? [])].map((picture) => {
      const box = picture.getBoundingClientRect();

      return {
        centre: { x: box.x + box.width / 2, y: box.y + box.height / 2 },
        height: box.height,
        hidden: picture.getAttribute("aria-hidden"),
        href: picture.getAttribute("href") ?? "",
        pointerEvents: getComputedStyle(picture).pointerEvents,
        width: box.width,
      };
    }),
    shown: modelOf(shown),
    shownFills: [...(shown?.children ?? [])].map((part) => getComputedStyle(part).fill),
    shownSpots: [...(shown?.children ?? [])].flatMap((part) => {
      const geometry = geometryOf(part);
      const centre = geometry === undefined ? undefined : measure(geometry).centre;
      const hit = centre === undefined ? null : document.elementFromPoint(centre.x, centre.y);
      const box = shown?.getBoundingClientRect();

      return centre !== undefined &&
        box !== undefined &&
        hit !== null &&
        shown?.contains(hit) === true
        ? [{ x: centre.x - box.x, y: centre.y - box.y }]
        : [];
    }),
    shownTappable: shown?.querySelectorAll('[role="button"], [tabindex]').length ?? 0,
    text: dom?.textContent ?? "",
    wholeTouchAction: Array.from(
      document.querySelectorAll('[data-shade="whole"]'),
      (whole) => getComputedStyle(whole).touchAction,
    ).join(" "),
  };
};

/**
 * Read what the frame shows before its module has run, in the frame's document.
 *
 * @returns The elements of the PCI's `dom`, and its text.
 */
const readShownBeforeModule = (): ShownBeforeModule => {
  const dom = document.querySelector("[data-pci-dom]");

  return {
    elements: [...(dom?.children ?? [])].map((element) => element.localName),
    text: dom?.textContent ?? "",
  };
};

/**
 * Give the script that starts a fresh frame for an item: `startPci` with the item's content, its
 * routes at the server, the PCI's configuration and the state, settling on `ready` or `failed`.
 *
 * @param origin The server's origin.
 * @param item The item.
 * @param start The response it is bound to, the state it restores and the status.
 * @returns The script.
 */
const startScript = (origin: string, item: ShadeItem, start: Start): string =>
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
  item: ShadeItem,
): Promise<{ readonly settled: FrameMessage; readonly shown: ShownBeforeModule }> => {
  const url = `${origin}/${shadeParts.path}`;
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
 * The page's viewport height, in CSS pixels: past the frame's 1200 px, so every point of the
 * frame is on screen, where a pointer can tap it.
 */
const pageHeight = 1300;

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
const whereabouts = (page: Page): Effect.Effect<Whereabouts, ShadePartsFailure> =>
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
): Effect.Effect<number, ShadePartsFailure | TapNotDelivered> =>
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
export const shadePage: Effect.Effect<ShadePage, ShadePartsFailure, Scope.Scope> = Effect.gen(
  function* shadePage() {
    const origin = yield* harnessServer;
    const browser = yield* chrome;
    const page: Page = yield* launched.pageOf(browser, {
      viewport: { height: pageHeight, width: 1280 },
    });

    page.setDefaultTimeout(0);
    page.setDefaultNavigationTimeout(0);
    yield* attempt("listen in every document of the page", () => page.addInitScript(listening));
    yield* attempt("load the host page", () => page.goto(`${origin}/`));

    /**
     * The frame, the one frame of the page but its own.
     *
     * @returns The frame.
     */
    const inner = Effect.sync(() => page.frames().find((each) => each !== page.mainFrame())).pipe(
      Effect.flatMap((found) =>
        found === undefined
          ? Effect.fail(new ShadePartsFailure({ cause: "no frame", step: "find the frame" }))
          : Effect.succeed(found),
      ),
    );

    /**
     * Read what the frame shows, once what its layout says is still to come has come
     * ({@link settledFor}), so every read of a part measures it where the page has laid it out.
     * The frame is sandboxed, of an opaque origin, so Chrome runs it in a process of its own, and
     * under load its module runs and it posts `ready` before the browser has handed it its
     * viewport: until then its viewport is 0 by 0, `elementFromPoint` finds nothing at a part's
     * centre, and the part would measure as no disc at all. The settle waits for the frame's own
     * `resize` to that viewport, never for a time.
     *
     * Observed 2026-11-28: the frame's size waits on the page's lifecycle, which waits on Chrome's
     * compositor (its `gpu-process`), and the frame's messages do not. With the compositor stopped
     * 1 s in every 1.05 s, 69 of 115 SP0 reads in five runs, read on `ready` alone, found the
     * viewport 0 by 0 and each failed as `part 0 holds a 44 px disc`; read once settled, 115 of 115
     * found it 1000 by 1200 and passed.
     *
     * @param step The step, for a failure.
     * @returns What the frame shows.
     */
    const read = (step: string) =>
      Effect.gen(function* settledRead() {
        const frame = yield* inner;

        yield* settledFor(
          frame,
          attempt,
          step,
          (why) => new ShadePartsFailure({ cause: why, step: "settle the PCI's frame" }),
        );

        return yield* attempt(step, () => frame.evaluate(readDrawn));
      });

    /**
     * Tap elements of the frame's document, in order, each named with where inside its own box the
     * tap lands, and delivered to it there.
     *
     * @param targets The elements, each with a point inside its box.
     * @returns Nothing.
     */
    const tapped = (targets: readonly Target[]) =>
      Effect.gen(function* tapping() {
        const frame = yield* inner;

        for (const target of targets) {
          const step = `tap ${nameOf(target.meant)}`;

          yield* pressInto(frame, attempt, step, target, (aim) =>
            attempt(step, () => page.mouse.click(aim.x, aim.y)),
          );
        }
      });

    return {
      beforeModule: (item) =>
        attempt("start the PCI with its module held back", () => startHeld(page, origin, item)),
      complete: attempt("complete the PCI", () =>
        page.evaluate<FrameMessage>("window.completePci()"),
      ),
      drawn: read("read the frame"),
      messages: attempt("read the frame's messages", () =>
        page.evaluate<readonly FrameMessage[]>("window.frameMessages"),
      ),
      press: (keys) =>
        Effect.gen(function* pressed() {
          const frame = yield* inner;

          for (const key of keys) {
            const keyedHere = attempt(`press ${key}`, () => keyed(page, key));

            yield* key === "Tab" || key === "Shift+Tab"
              ? focusInto(frame, attempt, `press ${key}`, keyedHere)
              : keyInto(frame, attempt, key, keyedHere);
          }
        }),
      start: (item, start) =>
        Effect.gen(function* started() {
          const message = yield* attempt("start the PCI", () =>
            page.evaluate<FrameMessage>(startScript(origin, item, start)),
          );

          if (message.kind === "ready") {
            yield* settledFor(
              yield* inner,
              attempt,
              "start the PCI",
              (why) => new ShadePartsFailure({ cause: why, step: "settle the PCI's frame" }),
            );
          }

          return message;
        }),
      swipe: (place, by) =>
        Effect.gen(function* swipe() {
          const frame = yield* inner;
          const drawn = yield* read("read the parts");
          const inBox = drawn.parts[place]?.inBox;

          if (inBox === undefined) {
            return yield* Effect.fail(
              new ShadePartsFailure({ cause: "no part", step: `find part ${String(place)}` }),
            );
          }

          const before = yield* whereabouts(page);
          const cancelled = yield* swiped(
            page,
            frame,
            { anchor: anchoredAt(0, 0, inBox.x, inBox.y), meant: meantFor(partAt(place), 0) },
            by,
          );
          const after = yield* whereabouts(page).pipe(
            Effect.orElseSucceed((): Whereabouts => ({ history: -1, href: "navigated away" })),
          );

          return { after, before, cancelled };
        }),
      tap: (places) =>
        read("read the parts").pipe(
          Effect.flatMap((drawn) =>
            tapped(
              places.map((place) => {
                const inBox = drawn.parts[place]?.inBox ?? { x: Number.NaN, y: Number.NaN };

                return {
                  anchor: anchoredAt(0, 0, inBox.x, inBox.y),
                  meant: meantFor(partAt(place), 0),
                };
              }),
            ),
          ),
        ),
      tapShown: (spots) =>
        tapped(
          spots.map((spot) => ({
            anchor: anchoredAt(0, 0, spot.x, spot.y),
            meant: meantFor(shownSelector, 0),
          })),
        ),
    } satisfies ShadePage;
  },
);
