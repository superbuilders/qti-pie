/**
 * The counter tray (`urn:fdc:alpha.school:2026:count-placements`, `countPlacements` of
 * `@qti-pie/plate/alpha/pci-modules`) driven as a child drives it, on synthetic counter items: each
 * item of the suite's fixtures (`fixtures/alpha/counter-tray/`, made-up items with the module
 * attribute and `qti-interaction-modules` QTI's module resolution needs: open mats and a double ten
 * frame) opened by plate's admission, its module
 * resolved against its package by plate's resolution, the package holding the module's file as a
 * package is made with it, and rendered by plate's `<Item>` with the host's facts; the Portable
 * Custom Interaction's island found in the element tree, and what it sends its frame read from its
 * props and its server-rendered source as the island reads them; then plate's own frame page and
 * frame boot in headless Google Chrome load the module and instantiate it, and the child moves
 * counters with a mouse, a finger or the keyboard. What it gives back is what plate's island would
 * hold and post, the last value the frame relayed (`changed`), and what the screen shows.
 *
 * The page is plate's frame page (`@qti-pie/plate/ui/pci-frame`), served with its own headers, its
 * content-security policy among them, at the top of its tab rather than in a frame: the boot talks
 * to `window.parent`, which is the window itself there, so the harness speaks the island's side of
 * the protocol (`load`, `instantiate`, `complete`) by posting to the window, the messages plate's
 * frame host builds from the same facts, and reads the frame's side from the same window. The
 * module's file and every package file are served from this machine, the module's at a URL of its
 * own and any picture as a `data:` URL, which the frame's policy admits, so nothing loads from
 * another host; Chrome is the machine's, through Playwright's `chrome` channel, headless, with
 * touch.
 *
 * Test support for the counter tray's suite, `#specimen/alpha/counter-tray.test.ts`.
 *
 * @module
 */
import { createHash } from "node:crypto";
import { readdir, readFile } from "node:fs/promises";
import { createServer } from "node:http";
import path from "node:path";
import type { IncomingMessage, Server, ServerResponse } from "node:http";
import { inspect } from "node:util";
import { Data, Effect, Option, Schema } from "effect";
import type { Scope } from "effect";
import { Digest } from "effect/crypto";
import { parseHTML } from "linkedom";
import type { Browser, Page } from "playwright-core";
import { chromeFor, unboundedModuleWait } from "#specimen/ui/chrome.ts";
import { createElement, isValidElement } from "react";
import type { ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import {
  acceptedItem,
  configure,
  openAdmitted,
  pciModulesIn,
  resolvePciModules,
  solution,
  startingResponses,
} from "@qti-pie/plate";
import type { Accepted, Configuration, PciHostFacts, PciInteractionModules } from "@qti-pie/plate";
import { countPlacements } from "@qti-pie/plate/alpha/pci-modules";
import { recordOf } from "@qti-pie/plate/test/records";
import { Item, standardRenderers } from "@qti-pie/plate/ui";
import type { ItemProps } from "@qti-pie/plate/ui";
import { heldOf, Responses } from "@qti-pie/plate/ui/client";
import { framePage } from "@qti-pie/plate/ui/pci-frame";
import { pressInto } from "#specimen/alpha/delivered.ts";
import type { TapNotDelivered } from "#specimen/alpha/delivered.ts";
import { clientExports } from "#specimen/ui/clients.ts";
import { islandsIn } from "#specimen/ui/rendered.ts";
import type { Island } from "#specimen/ui/rendered.ts";

/**
 * A step of the harness failed: Chrome, the page's server, the page, or plate on the way there.
 */
export class CounterTrayFailure extends Data.TaggedError("CounterTrayFailure")<{
  readonly cause: unknown;
  readonly step: string;
}> {
  /**
   * The step that failed and its cause.
   */
  override get message(): string {
    return `The counter tray failed while it ${this.step}: ${inspect(this.cause, { depth: 3 })}`;
  }
}

/**
 * Run a promise of Chrome's, the server's or the file system's as an effect that fails with the
 * step it was.
 *
 * @param step What the promise does, for the failure.
 * @param run The promise.
 * @returns The effect.
 */
const attempt = <A>(step: string, run: () => Promise<A>): Effect.Effect<A, CounterTrayFailure> =>
  Effect.tryPromise({ catch: (cause) => new CounterTrayFailure({ cause, step }), try: run });

/**
 * What a gesture can fail by: the harness, or a press the PCI's document never received
 * (`#specimen/alpha/delivered.ts`).
 */
type GestureFailure = CounterTrayFailure | TapNotDelivered;

/**
 * Fail a step the harness checks in Node: plate refused or gave less than the item needs.
 *
 * @param step What it was doing.
 * @param cause What it found.
 * @returns The failure.
 */
const failed = (step: string, cause: unknown): Effect.Effect<never, CounterTrayFailure> =>
  Effect.fail(new CounterTrayFailure({ cause, step }));

/**
 * Where an item's package holds the module's file: the `primary-path` the items write,
 * `modules/count-placements`, with the `.js` QTI's module resolution appends.
 */
const modulePath = countPlacements.path;

/**
 * The suite's fixtures: synthetic counter-tray items, each at `qti/<id>.xml`.
 */
const fixtures = path.resolve(import.meta.dirname, "..", "..", "fixtures", "alpha", "counter-tray");

/**
 * A zone of the counter tray: the mat, or the tray.
 */
export type Zone = "mat" | "tray";

/**
 * One of the fixtures' counter-tray items as plate opened it: its id, its file's name
 * (`open-mat`), its path in the package, the accepted item, the target its correct response states,
 * which the module is never told and the rules use only to know how far to place, and its
 * package's files by path.
 */
export interface TrayItem {
  readonly accepted: Accepted;
  readonly files: ReadonlyMap<string, Uint8Array>;
  readonly id: string;
  readonly location: string;
  readonly pci: PciInteractionModules;
  readonly target: number;
}

/**
 * A module route as plate's frame host sends it to the frame: the module's id, its locations as
 * absolute URLs, and the loader's waits.
 */
const FrameRoute = Schema.Struct({
  fallback: Schema.optional(Schema.String),
  id: Schema.String,
  primary: Schema.optional(Schema.String),
  waitSeconds: Schema.Struct({ fallback: Schema.Number, primary: Schema.Number }),
});

/**
 * The Portable Custom Interaction island's props the frame host reads (`PortableCustomProps` in
 * plate's `portable-custom.tsx`), as React hands them to the island: where the PCI runs, its
 * labels' `frame`, its properties, its response identifier and its type identifier.
 */
const IslandProps = Schema.Struct({
  frame: Schema.Struct({
    entry: Schema.optional(Schema.String),
    loader: Schema.String,
    routes: Schema.Array(FrameRoute),
  }),
  labels: Schema.Struct({ frame: Schema.String }),
  properties: Schema.Array(Schema.Struct({ name: Schema.String, value: Schema.String })),
  responseIdentifier: Schema.String,
  typeIdentifier: Schema.String,
});

/**
 * What plate's island hands its frame for one item, as its frame host builds the messages: the
 * `load` content (direction, entry, language, markup, routes, templates, title), the PCI's
 * properties by dataset name, its response identifier, the status it shows the PCI in
 * (`interacting` as hosted; a rule that holds a submitted test's review gives `review`) and its
 * type identifier.
 */
export interface Hosted {
  readonly dir: string;
  readonly entry: Option.Option<string>;
  readonly lang: string;
  readonly markup: string;
  readonly properties: Readonly<Record<string, string>>;
  readonly responseIdentifier: string;
  readonly routes: readonly (typeof FrameRoute.Type)[];
  readonly status: string;
  readonly templates: readonly string[];
  readonly title: string;
  readonly typeIdentifier: string;
}

/**
 * Appendix C's binding of a single integer, the value a counter tray is bound to and relays: NULL,
 * or the integer.
 */
const BoundJson = Schema.Struct({
  base: Schema.NullOr(Schema.Struct({ integer: Schema.Int })),
});

/**
 * Appendix C's binding of a single integer ({@link BoundJson}).
 */
export type Bound = typeof BoundJson.Type;

/**
 * A value a tray may be handed as its bound response: a single integer's ({@link Bound}), or one of
 * another cardinality, which no counter tray holds, for the rule that it is refused.
 */
export type Given =
  | Bound
  | { readonly base: { readonly float: number; readonly integer?: number } }
  | {
      readonly base: { readonly integer: number };
      readonly list: { readonly integer: readonly number[] };
    }
  | { readonly base: { readonly integer: unknown } }
  | { readonly list: { readonly integer: readonly number[] } }
  | { readonly record: null }
  | null;

/**
 * The frame's messages the harness reads, by kind: the factories registered, the PCI ready, the
 * frame's failure, each change it relays, and its completion; any other message is passed over.
 */
const FrameMessageJson = Schema.Union([
  Schema.Struct({
    kind: Schema.Literal("registered"),
    typeIdentifiers: Schema.Array(Schema.String),
  }),
  Schema.Struct({ kind: Schema.Literal("ready") }),
  Schema.Struct({ kind: Schema.Literal("failed"), reason: Schema.String }),
  Schema.Struct({ kind: Schema.Literal("changed"), value: BoundJson }),
  Schema.Struct({ kind: Schema.Literal("completed"), response: BoundJson }),
]);

/**
 * One of the frame's messages the harness reads ({@link FrameMessageJson}).
 */
type FrameMessage = typeof FrameMessageJson.Type;

/**
 * Read the frame's messages the page heard, in order, each one the harness reads.
 *
 * @param heard What the page heard, as it holds it.
 * @returns The messages the harness reads.
 */
const messagesOf = (heard: readonly unknown[]): readonly FrameMessage[] =>
  heard.flatMap((each) => Option.toArray(Schema.decodeUnknownOption(FrameMessageJson)(each)));

/**
 * The nonce the harness's frame page reads from its URL's fragment.
 */
const nonce = "counter-tray";

/**
 * The module files the page server serves, each at `/modules/<its SHA-256 in hexadecimal>.js`: the
 * module's own, and any slip a rule plants in it.
 */
type ModuleFiles = Map<string, string>;

/**
 * Write a text's SHA-256 in hexadecimal, the key a module file is served by.
 *
 * @param text The text.
 * @returns Its digest.
 */
const keyOf = (text: string): string => createHash("sha256").update(text).digest("hex");

/**
 * Answer one request: plate's frame page with its own headers, a module file the harness holds as
 * JavaScript, and nothing else.
 *
 * @param page The frame page.
 * @param modules The module files, by the hexadecimal SHA-256 of their text.
 * @returns The request handler.
 */
const serveWith =
  (
    page: { readonly headers: Readonly<Record<string, string>>; readonly html: string },
    modules: ModuleFiles,
  ) =>
  (request: IncomingMessage, response: ServerResponse): void => {
    const url = new URL(request.url ?? "/", "http://localhost");
    const module = modules.get(
      url.pathname.replace(/^\/modules\/(?<key>[0-9a-f]+)\.js$/u, "$<key>"),
    );

    if (url.pathname === "/frame") {
      response.writeHead(200, page.headers).end(page.html);
    } else if (module === undefined) {
      response.writeHead(404).end();
    } else {
      response
        .writeHead(200, {
          "content-type": "text/javascript; charset=utf-8",
          "x-content-type-options": "nosniff",
        })
        .end(module);
    }
  };

/**
 * The address a listening server took, as Node reports it for a TCP server.
 */
const ListeningAddress = Schema.Struct({ port: Schema.Number });

/**
 * The page's server on a port of the loopback the system chose, closed with its scope.
 *
 * @param modules The module files it serves.
 * @returns Its address.
 */
const pageServer = (modules: ModuleFiles): Effect.Effect<string, CounterTrayFailure, Scope.Scope> =>
  Effect.gen(function* servePages() {
    const page = yield* framePage.pipe(Effect.provide(Digest.layerWebCrypto));
    const server = yield* Effect.acquireRelease(
      Effect.callback<Server>((resume) => {
        const made = createServer(serveWith(page, modules));

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
      (cause) => new CounterTrayFailure({ cause, step: "read the page's server's port" }),
    );

    return `http://127.0.0.1:${String(port)}`;
  });

/**
 * Chrome, through the suites' one launcher (`#specimen/ui/chrome.ts`), its failures this harness's.
 */
const launched = chromeFor((step, cause) => new CounterTrayFailure({ cause, step }));

/**
 * The machine's Google Chrome, headless, closed with its scope.
 */
const chrome = launched.browser;

/**
 * The counter tray's module file as an item's package holds it: plate's emitted file,
 * `countPlacements.script`, its typed source with the types stripped, which
 * `#plate/alpha/pci-modules.test.ts` holds to its source and its pin. The file a child's frame
 * loads is this one.
 */
export const shippedModule: Effect.Effect<string, CounterTrayFailure> = attempt(
  "read the module's file",
  () => readFile(countPlacements.script, "utf-8"),
);

/**
 * Read every file of the fixtures, by its path from their root.
 *
 * @returns The files.
 */
const fixtureFiles: Effect.Effect<ReadonlyMap<string, Uint8Array>, CounterTrayFailure> = Effect.gen(
  function* readFixtures() {
    const entries = yield* attempt("listed the fixtures", () =>
      readdir(fixtures, { recursive: true, withFileTypes: true }),
    );
    const paths = entries
      .filter((entry) => entry.isFile())
      .map((entry) =>
        path.relative(fixtures, path.join(entry.parentPath, entry.name)).split(path.sep).join("/"),
      )
      .toSorted();
    const files = yield* Effect.all(
      paths.map((file) =>
        attempt(`read the fixture ${file}`, () => readFile(path.join(fixtures, file))).pipe(
          Effect.map((bytes) => [file, new Uint8Array(bytes)] as const),
        ),
      ),
    );

    return new Map(files);
  },
);

/**
 * Read the target an item's correct response states: its single integer.
 *
 * @param accepted The item.
 * @param response The response identifier.
 * @returns The target, none where the correct response is no single integer.
 */
const targetOf = (accepted: Accepted, response: string): Option.Option<number> => {
  const correct = solution(accepted, recordOf({}))[response];
  const [single] = correct !== undefined && "values" in correct ? correct.values : [];

  return single?.baseType === "integer" ? Option.some(Number(single.value)) : Option.none();
};

/**
 * Open one fixture as plate opens it: admitted, accepted, its one PCI's module facts, and its
 * target.
 *
 * @param location Its path in the package.
 * @param files Every file of the package, by path.
 * @returns The item.
 */
const openItem = (
  location: string,
  files: ReadonlyMap<string, Uint8Array>,
): Effect.Effect<TrayItem, CounterTrayFailure> =>
  Effect.gen(function* opened() {
    const bytes = files.get(location) ?? new Uint8Array();
    const verdict = yield* openAdmitted(location, bytes);
    const accepted = yield* Option.match(acceptedItem(verdict), {
      onNone: () => failed(`opened ${location}`, verdict),
      onSome: Effect.succeed,
    });
    const [pci, ...more] = pciModulesIn(accepted);

    if (pci === undefined || more.length > 0) {
      return yield* failed(`found ${location}'s one PCI`, pciModulesIn(accepted));
    }

    const target = yield* Option.match(targetOf(accepted, pci.response), {
      onNone: () => failed(`read ${location}'s target`, pci.response),
      onSome: Effect.succeed,
    });
    const id = path.basename(location, ".xml");

    return { accepted, files, id, location, pci, target };
  });

/**
 * Write a picture of the package as a `data:` URL, the address the configuration gives it, which
 * the frame page's policy admits for images.
 *
 * @param bytes The picture, an SVG document.
 * @returns The URL.
 */
const svgAddress = (bytes: Uint8Array): string =>
  `data:image/svg+xml;base64,${Buffer.from(bytes).toString("base64")}`;

/**
 * Keep no change: the `onChange` a server render's `<Responses>` is given, which it never calls.
 */
const keepNothing = (): void => {
  // A server render runs no event handler.
};

/**
 * Give the value of an attribute on the nearest element that writes it, as the island reads its
 * language and direction.
 *
 * @param element The element.
 * @param name The attribute.
 * @returns Its value, empty when no element above writes it.
 */
const inherited = (element: Element, name: "dir" | "lang"): string =>
  element.closest(`[${name}]`)?.getAttribute(name) ?? "";

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
 * Host one item as plate's island would for its frame, the package holding a module file's text:
 * resolve the PCI's modules against the package, serve the module file the route names, render
 * `<Item>` with the host's facts, find the PCI's island, and read what it sends its frame from its
 * props and from the source the server rendered for it.
 *
 * @param item The item.
 * @param module The module file's text: the module's own, or a slip planted in it.
 * @param base The page server's address.
 * @param modules The module files the page server serves.
 * @param clients Every export of plate's `"use client"` modules, by value, with its name.
 * @returns What the island hands its frame.
 */
const hostIn = (
  item: TrayItem,
  module: string,
  base: string,
  modules: ModuleFiles,
  clients: ReadonlyMap<unknown, string>,
): Effect.Effect<Hosted, CounterTrayFailure> =>
  Effect.gen(function* hosted() {
    const decoder = new TextDecoder();
    const files = new Map([
      ...[...item.files].map(([file, bytes]) => [file, decoder.decode(bytes)] as const),
      [modulePath, module] as const,
    ]);
    const resolution = resolvePciModules(
      item.pci.modules,
      (file) => Option.fromUndefinedOr(files.get(file)),
      (file) => files.has(file),
    );

    if (resolution.notices.length > 0 || resolution.routes.length === 0) {
      return yield* failed(`resolved ${item.id}'s modules`, resolution);
    }

    const urlOf = (file: string): string => {
      const text = files.get(file) ?? "";
      const key = keyOf(text);

      modules.set(key, text);

      return `${base}/modules/${key}.js`;
    };
    const host: PciHostFacts = {
      loader: `${base}/frame`,
      modules: new Map([
        [
          item.pci.response,
          resolution.routes.map((route) => ({
            fallback: route.fallback.pipe(Option.map(urlOf)),
            id: route.id,
            primary: route.primary.pipe(Option.map(urlOf)),
            waitSeconds: unboundedModuleWait,
          })),
        ],
      ]),
    };
    const configuration: Configuration = yield* Effect.mapError(
      configure({
        assets: [...item.files]
          .filter(([file]) => file.endsWith(".svg"))
          .map(([file, bytes]) => [file, svgAddress(bytes)] as const),
        seed: "",
      }),
      (cause) => new CounterTrayFailure({ cause, step: "configured the page" }),
    );
    const props: ItemProps = {
      configuration,
      host: { pci: host },
      instance: "tray",
      item: item.accepted,
      mode: "answering",
      showFeedback: false,
    };
    const element = createElement(Item, { ...props, renderers: standardRenderers });
    const islands = portableIn(element, clients);
    const [island, ...others] = islands;

    if (island === undefined || others.length > 0) {
      return yield* failed(`found ${item.id}'s one PCI island`, islands);
    }

    const given = yield* Effect.mapError(
      Schema.decodeUnknownEffect(IslandProps)(island.props),
      (cause) => new CounterTrayFailure({ cause, step: `read ${item.id}'s island's props` }),
    );
    const { document } = parseHTML(
      `<!doctype html><html><body>${renderToStaticMarkup(
        createElement(Responses, {
          children: element,
          onChange: keepNothing,
          value: heldOf(startingResponses(item.accepted, props)),
        }),
      )}</body></html>`,
    );
    const root = document.querySelector('[data-slot="plate-portable-custom"]');
    const stage = root?.querySelector('[data-slot="plate-portable-custom-stage"]');
    const markup = root?.querySelector('[data-slot="plate-portable-custom-markup"]');

    if (root === null || root === undefined || stage === null || stage === undefined) {
      return yield* failed(`found ${item.id}'s PCI on its page`, document.body.innerHTML);
    }

    const labelledby = root.getAttribute("aria-labelledby") ?? "";
    const named = labelledby
      .split(/\s+/u)
      .filter((id) => id !== "")
      .map((id) => document.querySelector(`[id="${id}"]`)?.textContent ?? "")
      .join(" ")
      .replaceAll(/\s+/gu, " ")
      .trim();

    return {
      dir: inherited(stage, "dir"),
      entry: Option.fromUndefinedOr(given.frame.entry),
      lang: inherited(stage, "lang"),
      markup: markup?.innerHTML ?? "",
      properties: Object.fromEntries(given.properties.map(({ name, value }) => [name, value])),
      responseIdentifier: given.responseIdentifier,
      routes: given.frame.routes,
      status: "interacting",
      templates: [...root.querySelectorAll('[data-slot="plate-portable-custom-template"]')].map(
        (each) => each.innerHTML,
      ),
      title: named === "" ? (root.getAttribute("aria-label") ?? given.labels.frame) : named,
      typeIdentifier: given.typeIdentifier,
    };
  });

/**
 * Wait in the page until it has painted twice and a timer set after both has fired, so what a
 * gesture changed is laid out and the frame boot's relay, which reads the response in a timer
 * after each input event, has posted.
 *
 * @returns The wait, in the page.
 */
const settled = async (): Promise<void> => {
  const first = Promise.withResolvers<number>();

  requestAnimationFrame(first.resolve);
  await first.promise;

  const second = Promise.withResolvers<number>();

  requestAnimationFrame(second.resolve);
  await second.promise;

  const fired = Promise.withResolvers<number>();

  setTimeout(() => {
    fired.resolve(performance.now());
  }, 0);
  await fired.promise;
};

/**
 * A point on the page, in CSS pixels from its top left.
 */
export interface Point {
  readonly x: number;
  readonly y: number;
}

/**
 * A place on the screen a gesture starts or ends at: the `at`th counter standing in a zone, in the
 * order the page holds them; the `at`th cell of the double ten frame in reading order, as its
 * drawing shows the cells; a point of a zone that no counter covers, just inside its bottom edge;
 * a point beside the mat to its right or its left, outside the board, at the mat's height; a point
 * between the mat and the tray beside the arrow; or a point below the tray.
 */
export type Spot =
  | { readonly at: number; readonly kind: "counter"; readonly zone: Zone }
  | { readonly at: number; readonly kind: "cell" }
  | { readonly kind: "zone"; readonly zone: Zone }
  | {
      readonly kind:
        | "beside the mat, left"
        | "beside the mat, right"
        | "below the tray"
        | "between the zones";
    };

/**
 * A box on the page, in CSS pixels from its top left.
 */
interface Box {
  readonly height: number;
  readonly width: number;
  readonly x: number;
  readonly y: number;
}

/**
 * Find the boxes of every element a selector matches, in the page, in document order.
 *
 * @param selector The selector.
 * @returns Their boxes.
 */
const boxesIn = (selector: string): readonly Box[] =>
  [...document.querySelectorAll(selector)].map((element) => {
    const box = element.getBoundingClientRect();

    return { height: box.height, width: box.width, x: box.x, y: box.y };
  });

/**
 * Find the boxes of every element a selector matches.
 *
 * @param page The page.
 * @param selector The selector.
 * @returns Their boxes, in document order.
 */
const boxesOf = (page: Page, selector: string): Effect.Effect<readonly Box[], CounterTrayFailure> =>
  attempt(`found ${selector}`, () => page.evaluate(boxesIn, selector));

/**
 * Find the box of the `at`th element a selector matches.
 *
 * @param page The page.
 * @param selector The selector.
 * @param at Which match, from 0.
 * @returns Its box.
 */
const boxOf = (page: Page, selector: string, at: number): Effect.Effect<Box, CounterTrayFailure> =>
  Effect.flatMap(boxesOf(page, selector), (boxes) =>
    Option.match(Option.fromUndefinedOr(boxes[at]), {
      onNone: () => failed(`found ${selector} #${String(at)}`, "no such element on the screen"),
      onSome: Effect.succeed,
    }),
  );

/**
 * The centre of a box.
 *
 * @param box The box.
 * @returns Its centre.
 */
const centreOf = (box: Box): Point => ({ x: box.x + box.width / 2, y: box.y + box.height / 2 });

/**
 * The centre of the `at`th cell of the double ten frame in reading order, as its drawing shows
 * the cells: its two frames' rectangles, left to right, each two rows of five.
 *
 * @param frames The frames' boxes, in document order.
 * @param at The cell.
 * @returns Its centre, none past the twentieth.
 */
const cellIn = (frames: readonly Box[], at: number): Option.Option<Point> =>
  Option.map(
    Option.fromUndefinedOr(frames.toSorted((a, b) => a.x - b.x)[Math.floor(at / 10)]),
    (frame) => ({
      x: frame.x + (((at % 10) % 5) + 0.5) * (frame.width / 5),
      y: frame.y + (Math.floor((at % 10) / 5) + 0.5) * (frame.height / 2),
    }),
  );

/**
 * Find a spot's point on the page.
 *
 * @param page The page.
 * @param spot The spot.
 * @returns Its point.
 */
const pointOf = (page: Page, spot: Spot): Effect.Effect<Point, CounterTrayFailure> =>
  Effect.gen(function* found() {
    const board = yield* boxOf(page, "svg[data-board]", 0);
    const mat = yield* boxOf(page, '[data-zone="mat"]', 0);
    const tray = yield* boxOf(page, '[data-zone="tray"]', 0);

    switch (spot.kind) {
      case "counter": {
        return centreOf(
          yield* boxOf(page, `[data-zone-of="${spot.zone}"][display="inline"]`, spot.at),
        );
      }
      case "cell": {
        const frames = yield* boxesOf(page, 'svg[data-board] g[aria-hidden="true"] > rect');

        return yield* Option.match(cellIn(frames, spot.at), {
          onNone: () => failed(`found cell ${String(spot.at)}`, frames),
          onSome: Effect.succeed,
        });
      }
      case "zone": {
        const box = spot.zone === "mat" ? mat : tray;

        return { x: box.x + box.width / 2, y: box.y + box.height - 8 };
      }
      case "beside the mat, left": {
        return { x: board.x - 4, y: mat.y + mat.height / 2 };
      }
      case "beside the mat, right": {
        return { x: board.x + board.width + 40, y: mat.y + mat.height / 2 };
      }
      case "below the tray": {
        return { x: tray.x + tray.width / 2, y: tray.y + tray.height + 20 };
      }
      case "between the zones": {
        return { x: mat.x + 30, y: (mat.y + mat.height + tray.y) / 2 };
      }
      default: {
        return spot satisfies never;
      }
    }
  });

/**
 * The moves a drag is carried in, from the press to the release: enough that the pointer is seen
 * travelling across the board before it lands, as a hand's is.
 */
const dragSteps = 12;

/**
 * The points a pointer passes through after a point, toward another, its last point last.
 *
 * @param from Where it starts.
 * @param to Where it ends.
 * @param steps How many moves it takes.
 * @returns The points.
 */
const pathOf = (from: Point, to: Point, steps: number): readonly Point[] =>
  Array.from({ length: steps }, (_, at) => ({
    x: from.x + ((to.x - from.x) * (at + 1)) / steps,
    y: from.y + ((to.y - from.y) * (at + 1)) / steps,
  }));

/**
 * A pointer the harness moves as a child's hand: a mouse with its left button, or one finger on a
 * touch screen, sent as Chrome's touch events, which Chrome turns into pointer events of type
 * `touch`.
 */
interface Hand {
  readonly down: (at: Point) => Effect.Effect<void, GestureFailure>;
  readonly move: (to: Point) => Effect.Effect<void, CounterTrayFailure>;
  readonly up: (at: Point) => Effect.Effect<void, CounterTrayFailure>;
}

/**
 * The mouse as a hand.
 *
 * @param page The page.
 * @returns The hand.
 */
const mouseHand = (page: Page): Hand => ({
  down: (at) =>
    pressInto(
      page.mainFrame(),
      attempt,
      `pressed the mouse at ${String(at.x)},${String(at.y)}`,
      attempt("pressed the mouse", async () => {
        await page.mouse.move(at.x, at.y);
        await page.mouse.down();
      }),
    ),
  move: (to) => attempt("moved the mouse", () => page.mouse.move(to.x, to.y)),
  up: (at) =>
    attempt("let the mouse go", async () => {
      await page.mouse.move(at.x, at.y);
      await page.mouse.up();
    }),
});

/**
 * A finger as a hand, on a devtools session of its own, detached with its scope.
 *
 * @param page The page.
 * @returns The hand.
 */
const fingerHand = (page: Page): Effect.Effect<Hand, CounterTrayFailure, Scope.Scope> =>
  Effect.map(
    Effect.acquireRelease(
      attempt("opened a touch session", () => page.context().newCDPSession(page)),
      (session) => Effect.promise(() => session.detach()),
    ),
    (session): Hand => ({
      down: (at) =>
        pressInto(
          page.mainFrame(),
          attempt,
          `put a finger down at ${String(at.x)},${String(at.y)}`,
          attempt("put a finger down", () =>
            session.send("Input.dispatchTouchEvent", { touchPoints: [at], type: "touchStart" }),
          ).pipe(Effect.asVoid),
        ),
      move: (to) =>
        attempt("moved the finger", () =>
          session.send("Input.dispatchTouchEvent", { touchPoints: [to], type: "touchMove" }),
        ).pipe(Effect.asVoid),
      up: () =>
        attempt("lifted the finger", () =>
          session.send("Input.dispatchTouchEvent", { touchPoints: [], type: "touchEnd" }),
        ).pipe(Effect.asVoid),
    }),
  );

/**
 * A hand of a kind, for the length of its scope.
 *
 * @param page The page.
 * @param by The mouse or a finger.
 * @returns The hand.
 */
const handOf = (
  page: Page,
  by: "mouse" | "touch",
): Effect.Effect<Hand, CounterTrayFailure, Scope.Scope> =>
  by === "mouse" ? Effect.succeed(mouseHand(page)) : fingerHand(page);

/**
 * Carry a hand from one point to another, pressed all the way, and let it go there, running
 * `midway` once the hand is halfway.
 *
 * @param hand The hand.
 * @param from Where it presses.
 * @param to Where it lets go.
 * @param midway What happens halfway.
 * @returns The drag.
 */
const carry = (
  hand: Hand,
  from: Point,
  to: Point,
  midway: Effect.Effect<void, GestureFailure>,
): Effect.Effect<void, GestureFailure> =>
  Effect.gen(function* carried() {
    const points = pathOf(from, to, dragSteps);
    const half = Math.floor(points.length / 2);

    yield* hand.down(from);
    yield* Effect.forEach(points.slice(0, half), hand.move, { discard: true });
    yield* midway;
    yield* Effect.forEach(points.slice(half), hand.move, { discard: true });
    yield* hand.up(to);
  });

/**
 * Tap a point with a hand: pressed and let go where it went down.
 *
 * @param hand The hand.
 * @param at The point.
 * @returns The tap.
 */
const tapWith = (hand: Hand, at: Point): Effect.Effect<void, GestureFailure> =>
  Effect.andThen(hand.down(at), hand.up(at));

/**
 * How a child moves one counter: `drag`, pressing a counter, carrying it and letting it go over
 * the other zone; or `taps`, tapping a counter and then the other zone; each with a mouse, a
 * finger, or (taps alone) the keyboard, Enter on the focused counter and then on the zone.
 */
export type Way =
  | { readonly by: "keyboard"; readonly kind: "taps" }
  | { readonly by: "mouse" | "touch"; readonly kind: "drag" | "taps" };

/**
 * What a gesture does, beyond a move to the other zone: `move`, a counter of `from` to the other
 * zone; `back`, a drag from `from` let go over `from` itself, which moves nothing; `switch`, a tap
 * on one counter of `from` and then on another of the same zone, then on the other zone, which
 * moves one; `release`, a tap on a counter of `from` and then on `from`'s own zone, which moves
 * nothing; and `onto`, a tap on a counter of `from` and then on a counter of the other zone, which
 * moves the first.
 */
export type Gesture = "back" | "move" | "onto" | "release" | "switch";

/**
 * What the screen shows: the counters standing on the mat and in the tray; the centres of those on
 * the mat and of the double ten frame's cells as its drawing shows them, in reading order (frame
 * one before frame two, each top row first, left to right; none on an open mat), and of those in
 * the tray, each in the board's coordinates; every text and accessible name in the frame's body,
 * what the module shows (the document's title is the item's prompt, which plate names the frame by
 * and shows outside it); the CSS width of a counter as the screen draws it, and the pictures the
 * counters show (each `href` once); the drawing of the mat's background and frames, as markup; how
 * many times the module fired `qti-interaction-changed`; and whether a counter is shown following
 * the pointer.
 */
export interface Look {
  /**
   * The board's height as the screen draws it, in CSS pixels.
   */
  readonly boardHeight: number;
  /**
   * The board's computed `touch-action`: the browser's own gestures a touch that starts on it may
   * make, `none` where the PCI takes every touch as the child's.
   */
  readonly boardTouchAction: string;
  readonly carried: boolean;
  readonly cells: readonly Point[];
  readonly counterSide: number;
  /**
   * The computed cursors of the zones' backgrounds and the shown counters, each once, sorted: what
   * the pointer offers over the parts a child could press.
   */
  readonly cursors: readonly string[];
  /**
   * Whether the board says it is disabled (`aria-disabled="true"`).
   */
  readonly disabled: boolean;
  readonly faces: readonly string[];
  readonly fired: number;
  readonly mat: number;
  readonly matCentres: readonly Point[];
  readonly matDrawing: string;
  readonly rings: number;
  /**
   * How many HTML, SVG and MathML elements of the frame's document tree the screen draws with a
   * `tabIndex` of 0 or more that are none of the parts a child could press: a stop on the board
   * itself, a ten frame's cell or anything else in the frame. No shadow root is walked; the frame
   * has none.
   */
  readonly strayTabStops: number;
  /**
   * How many of the parts a child could press, the zones' backgrounds and the shown counters, are
   * tab stops (a `tabindex` of 0 or more).
   */
  readonly tabStops: number;
  readonly texts: readonly string[];
  readonly tray: number;
  readonly trayCentres: readonly Point[];
}

/**
 * Read what the screen shows, in the page ({@link Look}). The text is every text node's but the
 * frame's own `style` element's and the boot's `script`'s, which the child never sees.
 *
 * @returns The look.
 */
const lookIn = (): Look => {
  const board = document.querySelector("svg[data-board]");
  const named = [...document.querySelectorAll("[aria-label], [title], [alt]")].flatMap(
    (element) => [
      element.getAttribute("aria-label") ?? "",
      element.getAttribute("title") ?? "",
      element.getAttribute("alt") ?? "",
    ],
  );
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  const texts: string[] = [];

  for (let node = walker.nextNode(); node !== null; node = walker.nextNode()) {
    if (node.parentElement?.closest("style, script") === null) {
      texts.push(node.textContent ?? "");
    }
  }

  const cells = [...(board?.querySelectorAll('g[aria-hidden="true"] > rect') ?? [])]
    .map((rect) => ({
      height: Number(rect.getAttribute("height")),
      width: Number(rect.getAttribute("width")),
      x: Number(rect.getAttribute("x")),
      y: Number(rect.getAttribute("y")),
    }))
    .toSorted((a, b) => a.x - b.x)
    .flatMap((frame) =>
      Array.from({ length: 10 }, (_, at) => ({
        x: frame.x + ((at % 5) + 0.5) * (frame.width / 5),
        y: frame.y + (Math.floor(at / 5) + 0.5) * (frame.height / 2),
      })),
    );
  const [matCentres = [], trayCentres = []] = (["mat", "tray"] as const).map((zone) =>
    [...document.querySelectorAll(`[data-zone-of="${zone}"][display="inline"]`)].map((counter) => {
      const moved = /translate\((?<x>[-\d.]+) (?<y>[-\d.]+)\)/u.exec(
        counter.getAttribute("transform") ?? "",
      );

      return { x: Number(moved?.groups?.["x"]), y: Number(moved?.groups?.["y"]) };
    }),
  );

  const shown = [...document.querySelectorAll('[data-zone-of][display="inline"] image')];

  return {
    boardHeight: board === null ? 0 : board.getBoundingClientRect().height,
    boardTouchAction: board === null ? "" : getComputedStyle(board).touchAction,
    carried: board?.querySelector('g[aria-hidden="true"][visibility="visible"]') !== null,
    cells,
    counterSide: shown[0]?.getBoundingClientRect().width ?? 0,
    cursors: [
      ...new Set(
        [...document.querySelectorAll('[data-zone], [data-zone-of][display="inline"]')].map(
          (part) => getComputedStyle(part).cursor,
        ),
      ),
    ].toSorted(),
    disabled: document.querySelector('svg[data-board][aria-disabled="true"]') !== null,
    faces: [...new Set(shown.map((image) => image.getAttribute("href") ?? ""))],
    fired: window.trayFired,
    mat: matCentres.length,
    matCentres,
    matDrawing: [
      document.querySelector('[data-zone="mat"]')?.outerHTML ?? "",
      board?.querySelector('g[aria-hidden="true"]')?.outerHTML ?? "",
    ].join(""),
    rings: [...document.querySelectorAll("[data-ring]")].filter(
      (ring) => getComputedStyle(ring).visibility === "visible",
    ).length,
    strayTabStops: [...document.querySelectorAll("*")].filter(
      (element) =>
        (element instanceof HTMLElement ||
          element instanceof SVGElement ||
          element instanceof MathMLElement) &&
        element.tabIndex >= 0 &&
        element.getClientRects().length > 0 &&
        !element.matches('[data-zone], [data-zone-of][display="inline"]'),
    ).length,
    tabStops: [
      ...document.querySelectorAll('[data-zone], [data-zone-of][display="inline"]'),
    ].filter((part) => Number(part.getAttribute("tabindex")) >= 0).length,
    texts: [texts.join(""), ...named],
    tray: document.querySelectorAll('[data-zone-of="tray"][display="inline"]').length,
    trayCentres,
  };
};

/**
 * The words a count could be said in, one to twenty, which no text on the board may hold.
 */
export const numberWords = [
  "one",
  "two",
  "three",
  "four",
  "five",
  "six",
  "seven",
  "eight",
  "nine",
  "ten",
  "eleven",
  "twelve",
  "thirteen",
  "fourteen",
  "fifteen",
  "sixteen",
  "seventeen",
  "eighteen",
  "nineteen",
  "twenty",
] as const;

/**
 * Start listening in the page: every message the window hears, in order, as the frame posts it,
 * and every `qti-interaction-changed` the module fires.
 */
const listen = (): void => {
  window.trayMessages = [];
  window.trayFired = 0;
  window.addEventListener("message", (event: MessageEvent) => {
    const data: unknown = event.data;

    window.trayMessages.push(data);
  });
  document.addEventListener(
    "qti-interaction-changed",
    () => {
      window.trayFired += 1;
    },
    { capture: true },
  );
};

/**
 * The messages the harness posts as plate's frame host does (`PageLoad`, `PageBind` and
 * `PageClose` of plate's `#plate/ui/portable-custom/protocol.ts`): the content and the modules'
 * routes, then the factory chosen with the configuration, and the completion.
 */
type PageMessage =
  | {
      readonly dir: string;
      readonly entry?: string;
      readonly kind: "load";
      readonly lang: string;
      readonly markup: string;
      readonly nonce: string;
      readonly routes: Hosted["routes"];
      readonly templates: readonly string[];
      readonly title: string;
    }
  | {
      readonly configuration: {
        readonly boundTo: Readonly<Record<string, Given>>;
        readonly contextVariables: Readonly<Record<string, never>>;
        readonly properties: Readonly<Record<string, string>>;
        readonly responseIdentifier: string;
        readonly status: string;
        readonly templateVariables: Readonly<Record<string, never>>;
      };
      readonly kind: "instantiate";
      readonly nonce: string;
      readonly typeIdentifier: string;
    }
  | { readonly kind: "complete"; readonly nonce: string };

/**
 * Post a message to the window, as plate's frame host posts to its frame.
 *
 * @param message The message.
 */
const post = (message: PageMessage): void => {
  window.postMessage(message, "*");
};

/**
 * Read the messages the page has heard ({@link messagesOf}).
 *
 * @param page The page.
 * @returns The messages the harness reads.
 */
const heardIn = (page: Page): Effect.Effect<readonly FrameMessage[], CounterTrayFailure> =>
  Effect.map(
    attempt("read the frame's messages", () =>
      page.evaluate((): readonly unknown[] => window.trayMessages),
    ),
    messagesOf,
  );

/**
 * Wait until the page has heard a message of one of some kinds, and give the first. The wait is a
 * promise in the page that each message the window hears checks, after {@link listen}'s listener,
 * registered first, has kept it: never a clock and never a poll, so a busy machine only lengthens
 * it. A frame that never answers is stopped by the rule's hang guard alone.
 *
 * @param page The page.
 * @param kinds The kinds.
 * @returns The first message of one of them.
 */
const awaited = <K extends FrameMessage["kind"]>(
  page: Page,
  kinds: readonly K[],
): Effect.Effect<Extract<FrameMessage, { readonly kind: K }>, CounterTrayFailure> =>
  Effect.gen(function* waited() {
    yield* attempt(`heard ${kinds.join(" or ")}`, () =>
      page.evaluate((wanted: readonly string[]) => {
        const { promise, resolve } = Promise.withResolvers<true>();
        const heard = (): boolean =>
          window.trayMessages.some(
            (message) =>
              message instanceof Object &&
              "kind" in message &&
              wanted.includes(String(message.kind)),
          );
        const check = (): void => {
          if (heard()) {
            window.removeEventListener("message", check);
            resolve(true);
          }
        };

        window.addEventListener("message", check);
        check();

        return promise;
      }, kinds),
    );

    const heard = yield* heardIn(page);
    const found = heard.find((message): message is Extract<FrameMessage, { readonly kind: K }> =>
      kinds.some((kind) => kind === message.kind),
    );

    return found ?? (yield* failed(`read ${kinds.join(" or ")}`, heard));
  });

/**
 * One counter tray running in its page.
 */
export interface Running {
  /**
   * Do a gesture and wait until the page has painted and the frame has relayed what it changed.
   */
  readonly act: (gesture: Gesture, from: Zone, way: Way) => Effect.Effect<void, GestureFailure>;
  /**
   * Ask the PCI to complete, as plate's frame host does before it removes the frame, and wait for
   * the frame's answer.
   */
  readonly complete: Effect.Effect<void, CounterTrayFailure>;
  /**
   * Ask the PCI to complete while a hand carries something from one spot to another, once the
   * hand is halfway, then let it go and wait until the page has settled.
   */
  readonly completeMidDrag: (
    from: Spot,
    to: Spot,
    by: "mouse" | "touch",
  ) => Effect.Effect<void, GestureFailure>;
  /**
   * Carry a hand from one spot to another and let it go there, then wait until the page has
   * settled.
   */
  readonly drag: (
    from: Spot,
    to: Spot,
    by: "mouse" | "touch",
  ) => Effect.Effect<void, GestureFailure>;
  /**
   * Press a hand `press` CSS pixels right of a spot's point and let it go `lift` pixels right of
   * it, the hand drifting between, then wait until the page has settled.
   */
  readonly drift: (
    spot: Spot,
    press: number,
    lift: number,
    by: "mouse" | "touch",
  ) => Effect.Effect<void, GestureFailure>;
  /**
   * Press the mouse on one spot and let it go on another with no move between, as a pointer that
   * jumps does, then wait until the page has settled.
   */
  readonly jump: (from: Spot, to: Spot) => Effect.Effect<void, GestureFailure>;
  /**
   * Press the mouse on one spot, then move it toward another in `moves` steps with no button held,
   * as when something outside the page takes the release before the pointer first moves (one step:
   * straight to the other spot), then wait until the page has settled.
   */
  readonly lostRelease: (
    from: Spot,
    to: Spot,
    moves: number,
  ) => Effect.Effect<void, GestureFailure>;
  /**
   * Read what the screen shows ({@link Look}).
   */
  readonly look: Effect.Effect<Look, CounterTrayFailure>;
  /**
   * Carry a hand from one spot toward another and read what the screen shows halfway, then let it
   * go and wait until the page has settled.
   */
  readonly lookMidDrag: (
    from: Spot,
    to: Spot,
    by: "mouse" | "touch",
  ) => Effect.Effect<Look, GestureFailure>;
  /**
   * The value the page would post: the last one the frame relayed, read as Appendix C's binding of
   * a single integer, none when it relayed none.
   */
  readonly posted: Effect.Effect<Option.Option<Bound>, CounterTrayFailure>;
  /**
   * Press the mouse on one spot and carry it halfway toward another, click the right button there
   * (Chrome's context menu, which takes the board's capture), then carry it on to the other spot
   * and let the left button go, then wait until the page has settled.
   */
  readonly rightClickMidDrag: (from: Spot, to: Spot) => Effect.Effect<void, GestureFailure>;
  /**
   * Draw the page `width` CSS pixels wide, so the board is drawn at its scale there.
   */
  readonly resize: (width: number) => Effect.Effect<void, CounterTrayFailure>;
  /**
   * Rest one finger on a spot and, while it rests, tap each of the other spots in turn with a
   * second finger, then lift the first and wait until the page has settled.
   */
  readonly tapsBeside: (rest: Spot, taps: readonly Spot[]) => Effect.Effect<void, GestureFailure>;
  /**
   * Tap a spot with the mouse, a finger, or Enter once the keyboard's focus is on it (a counter or
   * a zone), then wait until the page has settled.
   */
  readonly tap: (
    spot: Spot,
    by: "keyboard" | "mouse" | "touch",
  ) => Effect.Effect<void, GestureFailure>;
}

/**
 * Wait until a page has settled ({@link settled}).
 *
 * @param page The page.
 * @returns The wait.
 */
const settle = (page: Page): Effect.Effect<void, CounterTrayFailure> =>
  attempt("waited for the page to settle", () => page.evaluate(settled));

/**
 * Drive the mouse by Chrome's own input events (CDP `Input.dispatchMouseEvent`), which can send
 * what Playwright's mouse cannot: a release with no move before it, or a move with no button held
 * after a press. The steps get a sender, and the two spots' points; the page has settled after
 * them.
 *
 * @param page The page.
 * @param from Where the steps start.
 * @param to Where they head.
 * @param steps The steps, given the sender and the two points.
 * @returns The run.
 */
const cdpMouse = (
  page: Page,
  from: Spot,
  to: Spot,
  steps: (
    mouse: (
      type: "mouseMoved" | "mousePressed" | "mouseReleased",
      at: Point,
      buttons: number,
    ) => Effect.Effect<unknown, GestureFailure>,
    start: Point,
    end: Point,
  ) => Effect.Effect<void, GestureFailure>,
): Effect.Effect<void, GestureFailure> =>
  Effect.scoped(
    Effect.gen(function* driven() {
      const session = yield* Effect.acquireRelease(
        attempt("opened a mouse session", () => page.context().newCDPSession(page)),
        (opened) => Effect.promise(() => opened.detach()),
      );
      const start = yield* pointOf(page, from);
      const end = yield* pointOf(page, to);

      const sent = (
        type: "mouseMoved" | "mousePressed" | "mouseReleased",
        at: Point,
        buttons: number,
      ) =>
        attempt(`sent ${type}`, () =>
          session.send("Input.dispatchMouseEvent", {
            button: type === "mouseMoved" ? "none" : "left",
            buttons,
            clickCount: type === "mouseMoved" ? 0 : 1,
            type,
            x: at.x,
            y: at.y,
          }),
        ).pipe(Effect.asVoid);

      yield* steps(
        (type, at, buttons) =>
          type === "mousePressed"
            ? pressInto(
                page.mainFrame(),
                attempt,
                `pressed the mouse at ${String(at.x)},${String(at.y)}`,
                sent(type, at, buttons),
              )
            : sent(type, at, buttons),
        start,
        end,
      );
      yield* settle(page);
    }),
  );

/**
 * The selector of a spot the keyboard can focus, a counter or a zone, and which match it is.
 *
 * @param spot The spot.
 * @returns The selector and the match, none for a spot that is no button.
 */
const focusable = (
  spot: Spot,
): Option.Option<{ readonly at: number; readonly selector: string }> => {
  switch (spot.kind) {
    case "counter": {
      return Option.some({
        at: spot.at,
        selector: `[data-zone-of="${spot.zone}"][display="inline"]`,
      });
    }
    case "zone": {
      return Option.some({ at: 0, selector: `[data-zone="${spot.zone}"]` });
    }
    case "below the tray":
    case "beside the mat, left":
    case "beside the mat, right":
    case "between the zones":
    case "cell": {
      return Option.none();
    }
    default: {
      return spot satisfies never;
    }
  }
};

/**
 * Tap a spot without settling: with the mouse or a finger at its point, or with Enter once the
 * keyboard's focus is on it.
 *
 * @param page The page.
 * @param spot The spot.
 * @param by The input.
 * @returns The tap.
 */
const tapOn = (
  page: Page,
  spot: Spot,
  by: "keyboard" | "mouse" | "touch",
): Effect.Effect<void, GestureFailure> =>
  by === "keyboard"
    ? Option.match(focusable(spot), {
        onNone: () => failed("pressed Enter", `${JSON.stringify(spot)} takes no focus`),
        onSome: ({ at, selector }) =>
          attempt(`pressed Enter on ${selector} #${String(at)}`, async () => {
            await page.locator(selector).nth(at).focus();
            await page.keyboard.press("Enter");
          }),
      })
    : Effect.scoped(
        Effect.gen(function* tapped() {
          const hand = yield* handOf(page, by);

          yield* tapWith(hand, yield* pointOf(page, spot));
        }),
      );

/**
 * Do one gesture on the page, then wait until it has settled.
 *
 * @param page The page.
 * @param gesture The gesture.
 * @param from The zone its counter stands in.
 * @param way How the child does it.
 * @returns The gesture.
 */
const act = (
  page: Page,
  gesture: Gesture,
  from: Zone,
  way: Way,
): Effect.Effect<void, GestureFailure> =>
  Effect.gen(function* acted() {
    const other: Zone = from === "mat" ? "tray" : "mat";
    const first: Spot = { at: 0, kind: "counter", zone: from };

    if (way.kind === "drag") {
      const { by } = way;

      yield* Effect.scoped(
        Effect.gen(function* dragged() {
          const hand = yield* handOf(page, by);
          const start = yield* pointOf(page, first);
          const end = yield* pointOf(page, {
            kind: "zone",
            zone: gesture === "back" ? from : other,
          });

          yield* carry(hand, start, end, Effect.void);
        }),
      );
    } else {
      yield* tapOn(page, first, way.by);

      switch (gesture) {
        case "back":
        case "move": {
          yield* tapOn(page, { kind: "zone", zone: other }, way.by);
          break;
        }
        case "onto": {
          yield* tapOn(page, { at: 0, kind: "counter", zone: other }, way.by);
          break;
        }
        case "release": {
          yield* tapOn(page, { kind: "zone", zone: from }, way.by);
          break;
        }
        case "switch": {
          yield* tapOn(page, { at: 1, kind: "counter", zone: from }, way.by);
          yield* tapOn(page, { kind: "zone", zone: other }, way.by);
          break;
        }
        default: {
          gesture satisfies never;
        }
      }
    }

    yield* settle(page);
  });

/**
 * What the frame said when the harness started a counter tray: it runs, with the factories its
 * module registered; or it cannot, with the frame's reason and the messages of every error the
 * page threw, as Chrome's devtools read them.
 */
export type Started =
  | { readonly kind: "failed"; readonly reason: string; readonly thrown: readonly string[] }
  | { readonly kind: "running"; readonly registered: readonly string[]; readonly running: Running };

/**
 * Start one counter tray in a fresh page: load the module through plate's frame boot with what the
 * island hands it, instantiate it with the value it is bound to, and wait until the PCI is ready or
 * the frame says it cannot run.
 *
 * @param browser The Chrome it opens in.
 * @param base The page server's address.
 * @param hosted What the island hands the frame.
 * @param bound The response's value it is bound to.
 * @returns What the frame said, the page closed with the scope.
 */
const startIn = (
  browser: Browser,
  base: string,
  hosted: Hosted,
  bound: Given,
): Effect.Effect<Started, CounterTrayFailure, Scope.Scope> =>
  Effect.gen(function* started() {
    const context = yield* launched.context(browser, { hasTouch: true, reducedMotion: "reduce" });
    const thrown: string[] = [];
    const made = yield* launched.page(context);
    const page = yield* attempt("loaded the frame page", async () => {
      made.on("pageerror", (error) => {
        thrown.push(error.message);
      });
      await made.goto(`${base}/frame#${nonce}`);
      await made.evaluate(listen);

      return made;
    });
    const load: PageMessage = {
      dir: hosted.dir,
      kind: "load",
      lang: hosted.lang,
      markup: hosted.markup,
      nonce,
      routes: hosted.routes,
      templates: hosted.templates,
      title: hosted.title,
      ...Option.match(hosted.entry, { onNone: () => ({}), onSome: (entry) => ({ entry }) }),
    };

    yield* attempt("posted the module's routes", () => page.evaluate(post, load));

    const registered = yield* awaited(page, ["registered", "failed"]);

    if (registered.kind === "failed") {
      return { kind: "failed", reason: registered.reason, thrown } satisfies Started;
    }

    const instantiate: PageMessage = {
      configuration: {
        boundTo: { [hosted.responseIdentifier]: bound },
        contextVariables: {},
        properties: hosted.properties,
        responseIdentifier: hosted.responseIdentifier,
        status: hosted.status,
        templateVariables: {},
      },
      kind: "instantiate",
      nonce,
      typeIdentifier: hosted.typeIdentifier,
    };

    yield* attempt("posted the configuration", () => page.evaluate(post, instantiate));

    const ready = yield* awaited(page, ["ready", "failed"]);

    if (ready.kind === "failed") {
      return { kind: "failed", reason: ready.reason, thrown } satisfies Started;
    }

    const complete: PageMessage = { kind: "complete", nonce };
    const completion = Effect.asVoid(
      Effect.andThen(
        attempt("posted the completion", () => page.evaluate(post, complete)),
        awaited(page, ["completed"]),
      ),
    );
    const dragWith =
      (midway: Effect.Effect<void, CounterTrayFailure>) =>
      (from: Spot, to: Spot, by: "mouse" | "touch") =>
        Effect.scoped(
          Effect.gen(function* dragged() {
            const hand = yield* handOf(page, by);

            yield* carry(hand, yield* pointOf(page, from), yield* pointOf(page, to), midway);
            yield* settle(page);
          }),
        );
    const lookNow = attempt("read the screen", () => page.evaluate(lookIn));
    const running: Running = {
      act: (gesture, from, way) => act(page, gesture, from, way),
      complete: completion,
      completeMidDrag: dragWith(completion),
      drag: dragWith(Effect.void),
      drift: (spot, press, lift, by) =>
        Effect.scoped(
          Effect.gen(function* drifted() {
            const hand = yield* handOf(page, by);
            const at = yield* pointOf(page, spot);
            const from = { x: at.x + press, y: at.y };
            const to = { x: at.x + lift, y: at.y };

            yield* hand.down(from);
            yield* Effect.forEach(pathOf(from, to, dragSteps), hand.move, { discard: true });
            yield* hand.up(to);
            yield* settle(page);
          }),
        ),
      jump: (from, to) =>
        cdpMouse(page, from, to, (mouse, start, end) =>
          Effect.gen(function* jumped() {
            yield* mouse("mouseMoved", start, 0);
            yield* mouse("mousePressed", start, 1);
            yield* mouse("mouseReleased", end, 0);
          }),
        ),
      look: lookNow,
      lookMidDrag: (from, to, by) =>
        Effect.scoped(
          Effect.gen(function* lookedMidway() {
            const hand = yield* handOf(page, by);
            const seen: Look[] = [];

            yield* carry(
              hand,
              yield* pointOf(page, from),
              yield* pointOf(page, to),
              Effect.andThen(lookNow, (look) =>
                Effect.sync(() => {
                  seen.push(look);
                }),
              ),
            );
            yield* settle(page);

            const [midway] = seen;

            return midway ?? (yield* failed("read the screen midway", seen));
          }),
        ),
      lostRelease: (from, to, moves) =>
        cdpMouse(page, from, to, (mouse, start, end) =>
          Effect.gen(function* lost() {
            yield* mouse("mouseMoved", start, 0);
            yield* mouse("mousePressed", start, 1);
            yield* Effect.forEach(pathOf(start, end, moves), (at) => mouse("mouseMoved", at, 0), {
              discard: true,
            });
          }),
        ),
      posted: Effect.map(heardIn(page), (heard) =>
        Option.map(
          Option.fromUndefinedOr(heard.findLast((message) => message.kind === "changed")),
          (changed) => changed.value,
        ),
      ),
      resize: (width) =>
        attempt("resized the page", () => page.setViewportSize({ height: 900, width })),
      rightClickMidDrag: (from, to) =>
        Effect.gen(function* rightClicked() {
          const start = yield* pointOf(page, from);
          const end = yield* pointOf(page, to);
          const half = { x: (start.x + end.x) / 2, y: (start.y + end.y) / 2 };

          yield* pressInto(
            page.mainFrame(),
            attempt,
            `pressed the mouse at ${String(start.x)},${String(start.y)}`,
            attempt("pressed the mouse", async () => {
              await page.mouse.move(start.x, start.y);
              await page.mouse.down();
            }),
          );
          yield* attempt("dragged and right-clicked midway", async () => {
            await page.mouse.move(half.x, half.y, { steps: dragSteps / 2 });
            await page.mouse.down({ button: "right" });
            await page.mouse.up({ button: "right" });
            await page.mouse.move(end.x, end.y, { steps: dragSteps / 2 });
            await page.mouse.up();
          });
          yield* settle(page);
        }),
      tap: (spot, by) => Effect.andThen(tapOn(page, spot, by), settle(page)),
      tapsBeside: (rest, taps) =>
        Effect.scoped(
          Effect.gen(function* tappedBeside() {
            const session = yield* Effect.acquireRelease(
              attempt("opened a touch session", () => page.context().newCDPSession(page)),
              (opened) => Effect.promise(() => opened.detach()),
            );
            const resting = { ...(yield* pointOf(page, rest)), id: 0 };
            const touch = (
              type: "touchEnd" | "touchStart",
              touchPoints: readonly {
                readonly id: number;
                readonly x: number;
                readonly y: number;
              }[],
            ) => {
              const sent = attempt(`sent ${type}`, () =>
                session.send("Input.dispatchTouchEvent", { touchPoints: [...touchPoints], type }),
              ).pipe(Effect.asVoid);

              return type === "touchStart"
                ? pressInto(
                    page.mainFrame(),
                    attempt,
                    `put finger ${String(touchPoints.length)} down`,
                    sent,
                  )
                : sent;
            };

            // Chrome's touchEnd releases the points it lists: each tap lifts the tapping finger
            // alone, and the resting finger is lifted last.
            yield* touch("touchStart", [resting]);

            for (const spot of taps) {
              const tapping = { ...(yield* pointOf(page, spot)), id: 1 };

              yield* touch("touchStart", [resting, tapping]);
              yield* touch("touchEnd", [tapping]);
              yield* settle(page);
            }

            yield* touch("touchEnd", [resting]);
            yield* settle(page);
          }),
        ),
    };

    return {
      kind: "running",
      registered: registered.typeIdentifiers,
      running,
    } satisfies Started;
  });

/**
 * Chrome, the page server and the opened items, from which counter trays are started.
 */
export interface Trays {
  /**
   * Host an item as plate's island would for its frame, its package holding a module file's text
   * ({@link Hosted}).
   */
  readonly host: (item: TrayItem, module: string) => Effect.Effect<Hosted, CounterTrayFailure>;
  /**
   * The fixtures' counter-tray items, each opened by plate, in path order.
   */
  readonly items: readonly TrayItem[];
  /**
   * The module's file as a package holds it ({@link shippedModule}).
   */
  readonly module: string;
  /**
   * Start a counter tray in a fresh page from what the island hands its frame and the value it is
   * bound to, its page closed with the scope ({@link Started}).
   */
  readonly start: (
    hosted: Hosted,
    bound: Given,
  ) => Effect.Effect<Started, CounterTrayFailure, Scope.Scope>;
}

/**
 * Open Chrome and the page server, both closed with the scope, print the module's file, and open
 * every fixture item.
 *
 * @returns What starts a counter tray.
 */
export const counterTrays: Effect.Effect<Trays, CounterTrayFailure, Scope.Scope> = Effect.gen(
  function* trays() {
    const modules: ModuleFiles = new Map();
    const base = yield* pageServer(modules);
    const browser = yield* chrome;
    const clients = yield* clientExports;
    const module = yield* shippedModule;
    const files = yield* fixtureFiles;
    const items = yield* Effect.all(
      [...files.keys()]
        .filter((file) => file.endsWith(".xml"))
        .map((location) => openItem(location, files)),
    );

    return {
      host: (item, text) => hostIn(item, text, base, modules, clients),
      items,
      module,
      start: (hosted, bound) => startIn(browser, base, hosted, bound),
    };
  },
);

declare global {
  interface Window {
    /**
     * How many times the module fired `qti-interaction-changed` in the harness's page
     * ({@link listen}).
     */
    trayFired: number;
    /**
     * Every message the harness's page has heard, in order ({@link listen}).
     */
    trayMessages: unknown[];
  }
}
