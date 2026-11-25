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
 * @module
 * @see https://www.imsglobal.org/spec/qti/v3p0/impl
 * @see https://html.spec.whatwg.org/multipage/dom.html#dom-dataset
 */
import { readFile } from "node:fs/promises";
import { createServer } from "node:http";
import { tmpdir } from "node:os";
import path from "node:path";
import type { IncomingMessage, Server, ServerResponse } from "node:http";
import { Config, Data, Effect, Option, Schema, pipe } from "effect";
import type { Scope } from "effect";
import { Digest } from "effect/crypto";
import { parseHTML } from "linkedom";
import { chromium } from "playwright-core";
import type { Browser, Frame, Page, Route } from "playwright-core";
import { resolvePciModules } from "@qti-pie/plate";
import type { PciModules } from "@qti-pie/plate";
import { shadeParts } from "@qti-pie/plate/alpha/pci-modules";
import { framePage } from "@qti-pie/plate/ui/pci-frame";

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
    prompt: pci.querySelector("qti-prompt")?.textContent.trim() ?? "",
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
 * The folder Chrome keeps its process singleton's socket in: the session's runtime folder, whose
 * path is short enough for a socket, else the system's temporary folder.
 */
const runtimeFolder = Config.String("XDG_RUNTIME_DIR").pipe(Config.withDefault(tmpdir()));

/**
 * The machine's Google Chrome, headless, closed with its scope.
 */
const chrome: Effect.Effect<Browser, ShadePartsFailure, Scope.Scope> = Effect.acquireRelease(
  Effect.flatMap(Effect.orDie(runtimeFolder), (temporary) =>
    attempt("start Chrome", () =>
      chromium.launch({
        channel: "chrome",
        env: { ...process.env, TMPDIR: temporary },
        headless: true,
      }),
    ),
  ),
  (browser) => Effect.promise(() => browser.close()),
);

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
 * where a tap lands on it, and its area by its fill.
 */
export interface DrawnPart {
  readonly area: number;
  readonly centre: Point;
  readonly disabled: string | null;
  readonly fill: string;
  readonly label: string | null;
  readonly pressed: string | null;
  readonly radius: number;
  readonly stroke: string;
  readonly strokeWidth: string;
  readonly tabIndex: string | null;
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
 * parts where a tap lands on the shown model; and the text of the PCI's `dom`.
 */
export interface Drawn {
  readonly model: DrawnModel | undefined;
  readonly parts: readonly DrawnPart[];
  /**
   * The pictures the model draws, a set's object on each disc.
   */
  readonly pictures: readonly DrawnPicture[];
  readonly shown: DrawnModel | undefined;
  readonly shownCentres: readonly Point[];
  readonly shownFills: readonly string[];
  readonly shownTappable: number;
  readonly text: string;
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
   * Read what the frame shows.
   */
  readonly drawn: Effect.Effect<Drawn, ShadePartsFailure>;
  /**
   * Press keys in the frame, in order, each as Playwright names it (`Tab`, `Space`, `Enter`).
   */
  readonly press: (keys: readonly string[]) => Effect.Effect<void, ShadePartsFailure>;
  /**
   * Every message the frame posted, in order.
   */
  readonly messages: Effect.Effect<readonly FrameMessage[], ShadePartsFailure>;
  /**
   * Make a fresh frame for the item and settle on its `ready` or `failed`.
   */
  readonly start: (item: ShadeItem, start: Start) => Effect.Effect<FrameMessage, ShadePartsFailure>;
  /**
   * Tap parts in order, each by its place, with the pointer at the centre of the largest disc it
   * holds.
   */
  readonly tap: (places: readonly number[]) => Effect.Effect<void, ShadePartsFailure>;
  /**
   * Tap points of the frame's document in order, with the pointer.
   */
  readonly tapAt: (points: readonly Point[]) => Effect.Effect<void, ShadePartsFailure>;
}

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
    waitSeconds: route.waitSeconds,
    ...Option.match(route.primary, {
      onNone: () => ({}),
      onSome: (file) => ({ primary: `${origin}/${file}` }),
    }),
    ...Option.match(route.fallback, {
      onNone: () => ({}),
      onSome: (file) => ({ fallback: `${origin}/${file}` }),
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

      return {
        area: disc.area,
        centre: disc.centre,
        disabled: part.getAttribute("aria-disabled"),
        fill: style.fill,
        label: part.getAttribute("aria-label"),
        pressed: part.getAttribute("aria-pressed"),
        radius: hit === part ? disc.radius : 0,
        stroke: style.stroke,
        strokeWidth: style.strokeWidth,
        tabIndex: part.getAttribute("tabindex"),
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
    shownCentres: [...(shown?.children ?? [])].flatMap((part) => {
      const geometry = geometryOf(part);
      const centre = geometry === undefined ? undefined : measure(geometry).centre;
      const hit = centre === undefined ? null : document.elementFromPoint(centre.x, centre.y);

      return centre !== undefined && hit !== null && shown?.contains(hit) === true ? [centre] : [];
    }),
    shownFills: [...(shown?.children ?? [])].map((part) => getComputedStyle(part).fill),
    shownTappable: shown?.querySelectorAll('[role="button"], [tabindex]').length ?? 0,
    text: dom?.textContent ?? "",
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
 * Open a page of the harness in Chrome, on its server.
 *
 * @returns The page, closed with its scope.
 */
export const shadePage: Effect.Effect<ShadePage, ShadePartsFailure, Scope.Scope> = Effect.gen(
  function* shadePage() {
    const origin = yield* harnessServer;
    const browser = yield* chrome;
    const page: Page = yield* attempt("open a page", () =>
      browser.newPage({ viewport: { height: pageHeight, width: 1280 } }),
    );

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
     * Where the frame's document starts in the page.
     *
     * @returns Its offset.
     */
    const offset = attempt("find the frame's place", async () => {
      const box = await page.locator("iframe").boundingBox();

      return box ?? { x: 0, y: 0 };
    });

    /**
     * Tap points of the frame's document, in order.
     *
     * @param points The points.
     * @returns Nothing.
     */
    const tapAt = (points: readonly Point[]) =>
      offset.pipe(
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
      );

    return {
      beforeModule: (item) =>
        attempt("start the PCI with its module held back", () => startHeld(page, origin, item)),
      complete: attempt("complete the PCI", () =>
        page.evaluate<FrameMessage>("window.completePci()"),
      ),
      drawn: inner.pipe(
        Effect.flatMap((frame) => attempt("read the frame", () => frame.evaluate(readDrawn))),
      ),
      messages: attempt("read the frame's messages", () =>
        page.evaluate<readonly FrameMessage[]>("window.frameMessages"),
      ),
      press: (keys) =>
        pipe(
          keys,
          Effect.forEach((key) => attempt(`press ${key}`, () => keyed(page, key))),
          Effect.asVoid,
        ),
      start: (item, start) =>
        attempt("start the PCI", () =>
          page.evaluate<FrameMessage>(startScript(origin, item, start)),
        ),
      tap: (places) =>
        inner.pipe(
          Effect.flatMap((frame) => attempt("read the parts", () => frame.evaluate(readDrawn))),
          Effect.flatMap((drawn) =>
            tapAt(
              places.map((place) => drawn.parts[place]?.centre ?? { x: Number.NaN, y: Number.NaN }),
            ),
          ),
        ),
      tapAt,
    } satisfies ShadePage;
  },
);
