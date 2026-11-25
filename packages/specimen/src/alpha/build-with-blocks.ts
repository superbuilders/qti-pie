/**
 * The base-ten blocks' PCI (`buildWithBlocks` of `@qti-pie/plate/alpha/pci-modules`), hosted as a
 * host hosts it and driven as a child drives it.
 *
 * The items ({@link blocksItems}) are synthetic look-alikes of the assessment lead's block builds,
 * written for qti-pie, which is public, so none is one of her items: specimen's fixture folder
 * `fixtures/alpha/build-with-blocks/`, read whole. Each names its module by QTI 3.0.1's own
 * resolution, the PCI's `module` and one `qti-interaction-module` with its `primary-path`, and
 * holds no `qti-interaction-markup`, which a frame would show until the module drew.
 *
 * Hosting ({@link blocksHosted}): each item is opened as content the database admitted, through
 * plate's `admitted` (`@qti-pie/plate/test/admitted`), which fails where the admission run has not
 * admitted it; its PCI's module facts as written (`pciModulesIn`) are resolved by plate's own
 * resolution (`resolvePciModules`) against the package the items stand in ({@link blocksPackage},
 * the module there plate's module file itself), and the routes it gives, each package path mapped
 * to where the page's server serves that file, are the host facts `<Item>` renders the item with in
 * answering. The island the server shell hands the PCI (`PortableCustom`) gives what its frame is
 * told: the frame page's URL, the routes and the entry module, the author's properties, the
 * response identifier and the type identifier, from its props; and the markup, from the server's
 * HTML, where the island reads it.
 *
 * Driving: a page in headless Google Chrome holds one sandboxed frame on plate's own frame page
 * (`@qti-pie/plate/ui/pci-frame`) at the island's frame URL, and speaks plate's frame protocol with
 * it as plate's frame host does: the island's markup, routes (each made absolute against the page)
 * and entry on `booted`, the island's configuration with the response's value as `boundTo` on
 * `registered`, each relayed change kept, and completion on request. The pointer is Chrome's own
 * mouse at a piece's or a mat's place on the screen, so a tap is a press and a release where the
 * child's finger lands, and a drag a press, a move and a release.
 *
 * The page notes what the frame tells it as JSON in its body's `data-*` attributes (`started`,
 * `reason`, `registered`, `relayed`, `last`, `completed`), which the harness reads and decodes. The
 * page, the frame page and the package's files are served from this machine; nothing loads from
 * another host. Test support for specimen's alpha suite under `src/alpha/`.
 *
 * @module
 */
import { readdirSync, readFileSync } from "node:fs";
import { createServer } from "node:http";
import { tmpdir } from "node:os";
import path from "node:path";
import type { IncomingMessage, Server, ServerResponse } from "node:http";
import { inspect } from "node:util";
import { Config, Data, Effect, Option, Schema } from "effect";
import type { Scope } from "effect";
import { Digest } from "effect/crypto";
import { parseHTML } from "linkedom";
import { chromium } from "playwright-core";
import type { Browser, Frame, Page } from "playwright-core";
import { createElement, isValidElement } from "react";
import type { ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import {
  acceptedItem,
  configure,
  pciModulesIn,
  resolvePciModules,
  startingResponses,
} from "@qti-pie/plate";
import type { HostFacts, PciModuleRoute, PciResolution } from "@qti-pie/plate";
import { buildWithBlocks } from "@qti-pie/plate/alpha/pci-modules";
import { admitted } from "@qti-pie/plate/test/admitted";
import { Item } from "@qti-pie/plate/ui";
import type { ItemProps } from "@qti-pie/plate/ui";
import { heldOf, Responses } from "@qti-pie/plate/ui/client";
import { framePage } from "@qti-pie/plate/ui/pci-frame";
import type { FramePage } from "@qti-pie/plate/ui/pci-frame";
import { clientExports } from "#specimen/ui/clients.ts";
import { islandsIn } from "#specimen/ui/rendered.ts";
import type { Island } from "#specimen/ui/rendered.ts";

/**
 * A kind of base-ten piece, as the item's supply names it.
 */
export type Kind = "cubes" | "flats" | "rods";

/**
 * Where a piece lies: in the tray, or on the mat.
 */
export type Place = "mat" | "tray";

/**
 * One item of the blocks' fixture folder.
 */
export interface BlocksItem {
  /**
   * Its bytes, as the admitted set holds it by their digest.
   */
  readonly bytes: Uint8Array;
  /**
   * Its name, the file's without `.xml`: `rods-cubes-38`.
   */
  readonly id: string;
  /**
   * Its path in the package the items stand in, its file's name.
   */
  readonly location: string;
}

/**
 * The fixture folder.
 */
const folder = path.join(import.meta.dirname, "..", "..", "fixtures", "alpha", "build-with-blocks");

/**
 * Every item of the fixture folder, in the order of their names.
 */
export const blocksItems: readonly BlocksItem[] = readdirSync(folder)
  .filter((file) => file.endsWith(".xml"))
  .toSorted()
  .map((location) => ({
    bytes: readFileSync(path.join(folder, location)),
    id: location.replace(/\.xml$/u, ""),
    location,
  }));

/**
 * A response of the blocks in the Appendix C binding of an ordered list of integers: NULL, or the
 * count of each kind the supply offers, in place order.
 */
export const BlocksResponse = Schema.Struct({
  list: Schema.NullOr(Schema.Struct({ integer: Schema.Array(Schema.Number) })),
});

/**
 * A response of the blocks, as {@link BlocksResponse} decodes it.
 */
export type Response = typeof BlocksResponse.Type;

/**
 * A point on the screen, in CSS pixels.
 */
export interface Point {
  readonly x: number;
  readonly y: number;
}

/**
 * A box on the screen, in CSS pixels.
 */
export interface Box {
  readonly height: number;
  readonly width: number;
  readonly x: number;
  readonly y: number;
}

/**
 * A step of the harness that failed: the page, Chrome or the server did not do what it was asked.
 */
export class BlocksFailure extends Data.TaggedError("BlocksFailure")<{
  readonly cause: unknown;
  readonly step: string;
}> {
  /**
   * The step that failed and its cause.
   */
  override get message(): string {
    return `The blocks' page failed while it ${this.step}: ${inspect(this.cause, { depth: 3 })}`;
  }
}

/**
 * How the frame came up: ready, or failed.
 */
export type Started = "failed" | "ready";

/**
 * Run a promise of Chrome's or the server's as an effect that fails with the step it was.
 *
 * @param step What the promise does, for the failure.
 * @param run The promise.
 * @returns The effect.
 */
const attempt = <A>(step: string, run: () => Promise<A>): Effect.Effect<A, BlocksFailure> =>
  Effect.tryPromise({ catch: (cause) => new BlocksFailure({ cause, step }), try: run });

/**
 * The package the items stand in, every file its manifest lists by its path from the package's
 * root: each item at its file's name, and the module plate ships at the path the items'
 * `primary-path` names, with `.js` appended, its bytes plate's module file itself, never a copy.
 */
const blocksPackage: ReadonlyMap<string, Uint8Array> = new Map([
  ...blocksItems.map((item) => [item.location, item.bytes] as const),
  [buildWithBlocks.path, readFileSync(buildWithBlocks.script)],
]);

/**
 * Where the page's server serves plate's frame page: the `loader` of the host facts.
 */
const loader = "/frame.html";

/**
 * Where the page's server serves the package's files, each at its path from the package's root
 * below it, as a host serves the files an item references.
 */
const packageRoot = "/package/";

/**
 * The instance every item renders under.
 */
const instance = "blocks";

/**
 * One module route as the island's frame facts carry it (`PciFrameRoute`): each location the host
 * serves the module at, absent where it has none, and the loader's waits.
 */
const FrameRoute = Schema.Struct({
  fallback: Schema.optionalKey(Schema.String),
  id: Schema.String,
  primary: Schema.optionalKey(Schema.String),
  waitSeconds: Schema.Struct({ fallback: Schema.Number, primary: Schema.Number }),
});

/**
 * What the harness reads of the props the server shell hands the PCI's island
 * (`PortableCustomProps`): where its frame runs, the author's properties, the response identifier
 * and the type identifier.
 */
const IslandProps = Schema.Struct({
  frame: Schema.Struct({
    entry: Schema.optionalKey(Schema.String),
    loader: Schema.String,
    routes: Schema.Array(FrameRoute),
  }),
  properties: Schema.Array(Schema.Struct({ name: Schema.String, value: Schema.String })),
  responseIdentifier: Schema.String,
  typeIdentifier: Schema.String,
});

/**
 * One item as the host hosts it: the verdict `admitted` gave it, its response's correct value,
 * plate's resolution of its PCI's modules against the package, and what the server shell's island
 * tells its frame: the frame facts, the markup's HTML, the properties by name, the response
 * identifier and the type identifier.
 */
export interface BlocksHosted {
  readonly correct: readonly number[];
  readonly frame: typeof IslandProps.Type.frame;
  readonly markup: string;
  readonly properties: Readonly<Record<string, string>>;
  readonly resolution: PciResolution;
  readonly response: string;
  readonly typeIdentifier: string;
  readonly verdict: string;
}

/**
 * Keep no change: the `onChange` a server render's `<Responses>` is given, which it never calls.
 */
const keepNothing = (): void => {
  // A server render runs no event handler.
};

/**
 * The `children` an island is handed, which React ships to the page as server-rendered elements.
 */
const ChildrenProp = Schema.Struct({ children: Schema.Unknown });

/**
 * Find the client components in an element tree and in the children each is handed, which hold the
 * islands nested in it (the item's read-aloud island holds the item, its interactions' islands
 * among it), in tree order.
 *
 * @param node The tree.
 * @param clients Every export of plate's `"use client"` modules, by value, with its name.
 * @returns Each island met, its nested ones after it.
 */
const islandsWithin = (node: ReactNode, clients: ReadonlyMap<unknown, string>): readonly Island[] =>
  islandsIn(node, clients).flatMap((island) => {
    const held = Schema.decodeUnknownOption(ChildrenProp)(island.props);

    return [
      island,
      ...(Option.isSome(held) && isValidElement(held.value.children)
        ? islandsWithin(held.value.children, clients)
        : []),
    ];
  });

/**
 * Give a location plate's resolution routes, a path in the package, where the page's server serves
 * it.
 *
 * @param route The route, its locations paths in the package.
 * @returns The route, its locations the server's.
 */
const servedRoute = (route: PciModuleRoute): PciModuleRoute => ({
  ...route,
  fallback: route.fallback.pipe(Option.map((location) => `${packageRoot}${location}`)),
  primary: route.primary.pipe(Option.map((location) => `${packageRoot}${location}`)),
});

/**
 * Fail a hosting step with what it found.
 *
 * @param step What the step did.
 * @param cause What it found.
 * @returns The failure.
 */
const unhosted = (step: string, cause: unknown) => Effect.fail(new BlocksFailure({ cause, step }));

/**
 * Host an item: open it through `admitted`, resolve its one PCI's modules against the package by
 * plate's resolution, render it in answering with those routes as its host facts, and read what
 * the server shell's island tells the PCI's frame.
 *
 * @param item The item.
 * @returns The item as hosted; a failure where the database has not admitted it (a defect, from
 *   `admitted`), plate accepts no item of it, it holds other than one PCI, or the server shell
 *   renders no PCI island for it.
 */
export const blocksHosted = Effect.fn("specimen.blocks.hosted")(function* blocksHosted(
  item: BlocksItem,
) {
  const verdict = yield* admitted(item.location, item.bytes);
  const accepted = yield* Option.match(acceptedItem(verdict), {
    onNone: () => unhosted(`accepted ${item.location}`, verdict.verdict),
    onSome: (taken) => Effect.succeed(taken),
  });
  const pcis = pciModulesIn(accepted);
  const [pci] = pcis;

  if (pci === undefined || pcis.length !== 1) {
    return yield* unhosted(`found ${item.location}'s one PCI`, pcis);
  }

  const resolution = resolvePciModules(
    pci.modules,
    (file) =>
      Option.map(Option.fromUndefinedOr(blocksPackage.get(file)), (bytes) =>
        new TextDecoder().decode(bytes),
      ),
    (file) => blocksPackage.has(file),
  );
  const host: HostFacts = {
    pci: { loader, modules: new Map([[pci.response, resolution.routes.map(servedRoute)]]) },
  };
  const configuration = yield* Effect.orDie(configure({ assets: [], seed: "" }));
  const props: ItemProps = {
    configuration,
    host,
    instance,
    item: accepted,
    mode: "answering",
    showFeedback: false,
  };
  const shell = createElement(Item, props);
  const islands = islandsWithin(shell, yield* clientExports);
  const island = islands.find(({ name }) => name.endsWith("#PortableCustom"));

  if (island === undefined) {
    return yield* unhosted(`found ${item.location}'s PCI island`, islands);
  }

  const told = yield* Effect.mapError(
    Schema.decodeUnknownEffect(IslandProps)(island.props),
    (cause) => new BlocksFailure({ cause, step: `read ${item.location}'s PCI island` }),
  );
  const html = renderToStaticMarkup(
    createElement(Responses, {
      children: shell,
      onChange: keepNothing,
      value: heldOf(startingResponses(accepted, props)),
    }),
  );
  const markup = parseHTML(
    `<!doctype html><html><body>${html}</body></html>`,
  ).document.querySelector('[data-slot="plate-portable-custom-markup"]');
  const correct = Option.match(
    Option.flatMap(
      Option.fromUndefinedOr(accepted.item.responses.get(pci.response)),
      (declared) => declared.correct,
    ),
    {
      onNone: () => [],
      onSome: ({ values }) =>
        values.flatMap((value) => (value.baseType === "integer" ? [Number(value.value)] : [])),
    },
  );

  if (markup === null || correct.length === 0) {
    return yield* unhosted(`read ${item.location}'s markup and correct response`, {
      correct,
      html,
    });
  }

  return {
    correct,
    frame: told.frame,
    markup: markup.innerHTML,
    properties: Object.fromEntries(told.properties.map(({ name, value }) => [name, value])),
    resolution,
    response: told.responseIdentifier,
    typeIdentifier: told.typeIdentifier,
    verdict: verdict.verdict,
  } satisfies BlocksHosted;
});

/**
 * The page: it reads its setup from its address's `setup` parameter (the island's frame facts,
 * markup, properties, response and type identifier, and the response's value), frames plate's frame
 * page at the frame facts' loader and speaks the frame protocol as plate's frame host does, each
 * route made absolute against the page, and notes what the frame tells it in its body's `data-*`
 * attributes; a `complete` event at its document asks the frame to complete.
 */
const pageHtml = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><title>blocks</title></head><body><script>
const setup = JSON.parse(new URLSearchParams(location.search).get("setup"));
const relayed = [];
const nonce = crypto.randomUUID();
const frame = document.createElement("iframe");
const post = (message) => frame.contentWindow.postMessage({ ...message, nonce }, "*");
const note = (name, value) => { document.body.dataset[name] = JSON.stringify(value); };
frame.setAttribute("sandbox", "allow-scripts");
frame.setAttribute("title", "blocks");
frame.style.width = "960px";
frame.style.border = "0";
window.addEventListener("message", (event) => {
  const message = event.data;
  if (event.source !== frame.contentWindow || message === null || message.nonce !== nonce) return;
  if (message.kind === "booted") {
    const absolute = (url) => url === undefined ? undefined : new URL(url, location.href).href;
    post({ kind: "load", markup: setup.markup, templates: [], entry: setup.frame.entry,
      routes: setup.frame.routes.map((route) => ({ ...route, primary: absolute(route.primary),
        fallback: absolute(route.fallback) })),
      lang: "en-US", dir: "ltr", title: "blocks" });
  } else if (message.kind === "registered") {
    note("registered", message.typeIdentifiers);
    post({ kind: "instantiate", typeIdentifier: setup.typeIdentifier, state: undefined,
      configuration: { properties: setup.properties, responseIdentifier: setup.response,
        status: "interacting", templateVariables: {}, contextVariables: {},
        boundTo: { [setup.response]: setup.bound } } });
  } else if (message.kind === "ready" || message.kind === "failed") {
    note("reason", message.reason ?? "");
    note("started", message.kind);
  } else if (message.kind === "changed") {
    relayed.push(message.value);
    note("relayed", relayed);
    note("last", message.value);
  } else if (message.kind === "completed") {
    note("completed", message.response);
  } else if (message.kind === "height") {
    frame.height = String(message.pixels);
  }
});
document.addEventListener("complete", () => post({ kind: "complete" }));
note("relayed", relayed);
frame.src = setup.frame.loader + "#" + encodeURIComponent(nonce);
document.body.append(frame);
</script></body></html>`;

/**
 * The media type the page's server sends a package's file with, by its extension: a module's
 * script, or an item's XML.
 *
 * @param file The file's path in the package.
 * @returns The media type.
 */
const typeOf = (file: string): string =>
  file.endsWith(".js") ? "text/javascript; charset=utf-8" : "application/xml; charset=utf-8";

/**
 * Serve the page, plate's frame page at the host facts' loader with its headers, and every file of
 * the package below {@link packageRoot}, with `nosniff`, as a host serves an item's files.
 *
 * @param frame Plate's frame page.
 * @returns The server's request handler.
 */
const serveWith =
  (frame: FramePage) =>
  (request: IncomingMessage, response: ServerResponse): void => {
    const { pathname } = new URL(request.url ?? "/", "http://localhost");
    const file = pathname.startsWith(packageRoot)
      ? blocksPackage.get(decodeURIComponent(pathname.slice(packageRoot.length)))
      : undefined;

    if (pathname === "/") {
      response.writeHead(200, { "content-type": "text/html; charset=utf-8" }).end(pageHtml);
    } else if (pathname === loader) {
      response.writeHead(200, frame.headers).end(frame.html);
    } else if (file === undefined) {
      response.writeHead(404).end();
    } else {
      response
        .writeHead(200, { "content-type": typeOf(pathname), "x-content-type-options": "nosniff" })
        .end(file);
    }
  };

/**
 * The address a listening server took, as Node reports it for a TCP server.
 */
const ListeningAddress = Schema.Struct({ port: Schema.Number });

/**
 * The page's server on a port of the loopback the system chose, plate's frame page its policy's
 * hash by Web Crypto, closed with its scope.
 */
const pageServer: Effect.Effect<string, BlocksFailure, Scope.Scope> = Effect.flatMap(
  Effect.acquireRelease(
    Effect.flatMap(Effect.provide(framePage, Digest.layerWebCrypto), (frame) =>
      Effect.callback<Server>((resume) => {
        const server = createServer(serveWith(frame));

        server.listen(0, "127.0.0.1", () => {
          resume(Effect.succeed(server));
        });
      }),
    ),
    (server) =>
      Effect.callback<undefined>((resume) => {
        server.close(() => {
          resume(Effect.undefined);
        });
        server.closeAllConnections();
      }),
  ),
  (server) =>
    Effect.mapError(
      Schema.decodeUnknownEffect(ListeningAddress)(server.address()),
      (cause) => new BlocksFailure({ cause, step: "read the page's server's port" }),
    ).pipe(Effect.map(({ port }) => `http://127.0.0.1:${String(port)}/`)),
);

/**
 * The folder Chrome keeps its process singleton's socket in: the session's runtime folder, whose
 * path is short enough for a socket (`#specimen/ui/math-entry.ts` says why).
 */
const runtimeFolder = Config.String("XDG_RUNTIME_DIR").pipe(Config.withDefault(tmpdir()));

/**
 * The machine's Google Chrome, headless, closed with its scope.
 */
const chrome: Effect.Effect<Browser, BlocksFailure, Scope.Scope> = Effect.acquireRelease(
  Effect.flatMap(Effect.orDie(runtimeFolder), (temporary) =>
    attempt("started Chrome", () =>
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
 * One item's PCI running in its frame, and what the test does to it and reads of it.
 */
export interface BlocksFrame {
  /**
   * Give each piece's body's box on the screen, its ring left out, by kind and place.
   */
  readonly boxes: (kind: Kind, place: Place) => Effect.Effect<readonly Box[], BlocksFailure>;
  /**
   * Count the pieces of a kind in a place that are chosen, ringed.
   */
  readonly chosen: (kind: Kind, place: Place) => Effect.Effect<number, BlocksFailure>;
  /**
   * Ask the frame to complete, and give the response it completed with.
   */
  readonly complete: Effect.Effect<Response, BlocksFailure>;
  /**
   * Count the pieces of a kind in a place, by their names.
   */
  readonly count: (kind: Kind, place: Place) => Effect.Effect<number, BlocksFailure>;
  /**
   * Tap twice where the first piece of a kind in a place lies, at once, as a child's double tap
   * does: the second tap lands where the first did, on whatever lies there after the first.
   */
  readonly doubleTap: (kind: Kind, place: Place) => Effect.Effect<void, BlocksFailure>;
  /**
   * Tap twice at a point of the screen, at once, as a child's double tap does.
   */
  readonly doubleTapAt: (point: Point) => Effect.Effect<void, BlocksFailure>;
  /**
   * Drag the first piece of a kind in a place to the other place.
   */
  readonly drag: (kind: Kind, from: Place) => Effect.Effect<void, BlocksFailure>;
  /**
   * Drag the first piece of a kind in a place out of the frame and let go there, where the frame
   * cannot hear the release, then bring the pointer back over the tray with no button held.
   */
  readonly dragOut: (kind: Kind, from: Place) => Effect.Effect<void, BlocksFailure>;
  /**
   * Drag the mouse from one point of the screen to another and let go there.
   */
  readonly dragBetween: (from: Point, to: Point) => Effect.Effect<void, BlocksFailure>;
  /**
   * Give where a mat is tapped or dropped on: the middle of its top edge, where no piece sits.
   */
  readonly floor: (place: Place) => Effect.Effect<Point, BlocksFailure>;
  /**
   * Give the page's address, which a swipe the drawing let through to the browser would change.
   */
  readonly address: Effect.Effect<string, BlocksFailure>;
  /**
   * Drag the first piece of a kind in a place to the other place with a finger, as a touch screen
   * sends it.
   */
  readonly touchDrag: (kind: Kind, from: Place) => Effect.Effect<void, BlocksFailure>;
  /**
   * Swipe a finger sideways across a mat's floor, from its left end to its right, as a pan.
   */
  readonly touchSwipe: (place: Place) => Effect.Effect<void, BlocksFailure>;
  /**
   * Tap the first piece of a kind in a place with a finger.
   */
  readonly touchTapPiece: (kind: Kind, place: Place) => Effect.Effect<void, BlocksFailure>;
  /**
   * Tap a mat's floor with a finger.
   */
  readonly touchTapMat: (place: Place) => Effect.Effect<void, BlocksFailure>;
  /**
   * Count what a drag leaves drawn: the pieces faded as lifted, the copies following the pointer,
   * and the mats ringed as a drop's destination.
   */
  readonly leftovers: Effect.Effect<
    { readonly copies: number; readonly lifted: number; readonly ready: number },
    BlocksFailure
  >;
  /**
   * Give a mat's box on the screen.
   */
  readonly mat: (place: Place) => Effect.Effect<Box, BlocksFailure>;
  /**
   * Give the type identifiers the module registered.
   */
  readonly registered: Effect.Effect<readonly string[], BlocksFailure>;
  /**
   * Wait until the last response the frame relayed is this one, and fail with what it is when it
   * does not become it.
   */
  readonly relayed: (response: Response) => Effect.Effect<void, BlocksFailure>;
  /**
   * Give every response the frame has relayed, in order.
   */
  readonly relays: Effect.Effect<readonly Response[], BlocksFailure>;
  /**
   * How the frame came up.
   */
  readonly started: Started;
  /**
   * Tap a mat where it holds no piece: the middle of its top edge.
   */
  readonly tapMat: (place: Place) => Effect.Effect<void, BlocksFailure>;
  /**
   * Tap the first piece of a kind in a place.
   */
  readonly tapPiece: (kind: Kind, place: Place) => Effect.Effect<void, BlocksFailure>;
  /**
   * Give the text the PCI's element holds.
   */
  readonly text: Effect.Effect<string, BlocksFailure>;
}

/**
 * The page's notes the harness decodes: how the frame started, what the module registered, every
 * response relayed and the completed response.
 */
const notes = {
  completed: Schema.fromJsonString(BlocksResponse),
  registered: Schema.fromJsonString(Schema.Array(Schema.String)),
  relayed: Schema.fromJsonString(Schema.Array(BlocksResponse)),
  started: Schema.fromJsonString(Schema.Literals(["failed", "ready"])),
} as const;

/**
 * How long, in milliseconds, a response may take to reach the page after the move that made it: a
 * hang guard, never a budget. A move's response reaches the page within a frame or two.
 */
const relayWait = 10_000;

/**
 * The name the module gives a piece of a kind.
 */
const names = { cubes: "cube", flats: "flat", rods: "rod" } as const;

/**
 * The selector of the pieces of a kind in a place.
 *
 * @param kind The kind.
 * @param place The place.
 * @returns The selector.
 */
const piecesOf = (kind: Kind, place: Place): string =>
  `[data-kind="${kind}"][aria-label="${names[kind]} ${place === "tray" ? "in the tray" : "on the mat"}"]`;

/**
 * Give an element's box on the screen.
 *
 * @param frame The frame.
 * @param selector The element's selector; its first match.
 * @returns The box.
 */
const boxOf = (frame: Frame, selector: string): Effect.Effect<Box, BlocksFailure> =>
  Effect.flatMap(
    attempt(`found ${selector}`, () => frame.locator(selector).first().boundingBox()),
    (box) =>
      box === null
        ? Effect.fail(new BlocksFailure({ cause: "it has no box", step: `found ${selector}` }))
        : Effect.succeed(box),
  );

/**
 * Give the centre of a box.
 *
 * @param box The box.
 * @returns Its centre.
 */
export const centreOf = (box: Box): Point => ({
  x: box.x + box.width / 2,
  y: box.y + box.height / 2,
});

/**
 * Give where a mat is tapped or dropped on: the middle of its top edge, inside its margin, where no
 * piece sits.
 *
 * @param box The mat's box.
 * @returns The point.
 */
const matPointOf = (box: Box): Point => ({
  x: box.x + box.width / 2,
  y: box.y + 6,
});

/**
 * Read a note of the page's body, decoded.
 *
 * @param page The page.
 * @param name The note's name.
 * @param schema Its schema.
 * @returns Its value.
 */
const noteOf = <A>(
  page: Page,
  name: string,
  schema: Schema.Codec<A, string>,
): Effect.Effect<A, BlocksFailure> =>
  Effect.flatMap(
    attempt(`read the note ${name}`, () =>
      page.locator("body").evaluate((body, key) => body.dataset[key], name),
    ),
    (text) =>
      Effect.mapError(
        Schema.decodeUnknownEffect(schema)(text),
        (cause) => new BlocksFailure({ cause, step: `decoded the note ${name}` }),
      ),
  );

/**
 * Open an item's PCI in a page of its own, bound to a response.
 *
 * @param browser Chrome.
 * @param base The page server's address.
 * @param hosted The item as hosted.
 * @param bound The response's value, as the host holds it.
 * @returns The running frame, closed with the scope.
 */
const openOn = (
  browser: Browser,
  base: string,
  hosted: BlocksHosted,
  bound: Response,
): Effect.Effect<BlocksFrame, BlocksFailure, Scope.Scope> =>
  Effect.gen(function* openBlocks() {
    const page = yield* Effect.acquireRelease(
      attempt("opened a page", () =>
        browser.newPage({ hasTouch: true, viewport: { height: 900, width: 1280 } }),
      ),
      (opened) => Effect.promise(() => opened.close()),
    );
    const setup = JSON.stringify({
      bound,
      frame: hosted.frame,
      markup: hosted.markup,
      properties: hosted.properties,
      response: hosted.response,
      typeIdentifier: hosted.typeIdentifier,
    });

    yield* attempt("loaded the page", () =>
      page.goto(`${base}?${new URLSearchParams({ setup }).toString()}`),
    );
    yield* attempt("waited for the frame to start", () =>
      page.locator("body[data-started]").waitFor({ state: "attached" }),
    );

    const started = yield* noteOf(page, "started", notes.started);
    const frame = page.frame({ url: ({ pathname }) => pathname === hosted.frame.loader });

    if (frame === null) {
      return yield* Effect.fail(new BlocksFailure({ cause: "no frame", step: "found the frame" }));
    }

    const press = (point: Point) =>
      attempt("pressed", async () => {
        await page.mouse.move(point.x, point.y);
        await page.mouse.down();
      });
    const lift = attempt("released", () => page.mouse.up());
    const touchscreen = yield* attempt("opened a touch screen", async () => {
      const session = await page.context().newCDPSession(page);

      await session.send("Emulation.setTouchEmulationEnabled", {
        enabled: true,
        maxTouchPoints: 5,
      });

      return session;
    });
    const finger = (type: "touchEnd" | "touchMove" | "touchStart", points: readonly Point[]) =>
      attempt(`sent ${type}`, () =>
        touchscreen.send("Input.dispatchTouchEvent", { touchPoints: [...points], type }),
      );
    const fingerAlong = (from: Point, to: Point) =>
      Effect.gen(function* alongTheScreen() {
        yield* finger("touchStart", [from]);

        for (const step of [1, 2, 3, 4, 5, 6]) {
          yield* finger("touchMove", [
            { x: from.x + ((to.x - from.x) * step) / 6, y: from.y + ((to.y - from.y) * step) / 6 },
          ]);
        }

        yield* finger("touchEnd", []);
      });
    const matOf = (place: Place) => boxOf(frame, `[data-place="${place}"]`);

    return {
      address: Effect.sync(() => page.url()),
      boxes: (kind, place) =>
        attempt(`measured the ${kind}`, () =>
          frame.locator(`${piecesOf(kind, place)} > rect:not([data-ring])`).evaluateAll((rects) =>
            rects.map((rect) => {
              const box = rect.getBoundingClientRect();

              return { height: box.height, width: box.width, x: box.x, y: box.y };
            }),
          ),
        ),
      chosen: (kind, place) =>
        attempt(`counted the chosen ${kind}`, () =>
          frame.locator(`${piecesOf(kind, place)}[aria-pressed="true"]`).count(),
        ),
      complete: Effect.gen(function* complete() {
        yield* attempt("asked the frame to complete", () =>
          page.locator("body").dispatchEvent("complete"),
        );
        yield* attempt("waited for the frame to complete", () =>
          page.locator("body[data-completed]").waitFor({ state: "attached" }),
        );

        return yield* noteOf(page, "completed", notes.completed);
      }),
      count: (kind, place) =>
        attempt(`counted the ${kind}`, () => frame.locator(piecesOf(kind, place)).count()),
      doubleTap: (kind, place) =>
        Effect.gen(function* doubleTap() {
          const point = centreOf(yield* boxOf(frame, piecesOf(kind, place)));

          yield* press(point);
          yield* lift;
          yield* press(point);
          yield* lift;
        }),
      doubleTapAt: (point) =>
        Effect.gen(function* doubleTapAt() {
          yield* press(point);
          yield* lift;
          yield* press(point);
          yield* lift;
        }),
      drag: (kind, from) =>
        Effect.gen(function* drag() {
          const start = centreOf(yield* boxOf(frame, piecesOf(kind, from)));
          const end = matPointOf(yield* matOf(from === "tray" ? "mat" : "tray"));

          yield* press(start);
          yield* attempt("moved", () => page.mouse.move(end.x, end.y, { steps: 4 }));
          yield* lift;
        }),
      dragBetween: (from, to) =>
        Effect.gen(function* dragBetween() {
          yield* press(from);
          yield* attempt("moved", () => page.mouse.move(to.x, to.y, { steps: 6 }));
          yield* lift;
        }),
      dragOut: (kind, from) =>
        Effect.gen(function* dragOut() {
          const start = centreOf(yield* boxOf(frame, piecesOf(kind, from)));
          const framed = yield* boxOf(page.mainFrame(), "iframe");
          const outside = { x: start.x, y: framed.y + framed.height + 40 };
          const back = matPointOf(yield* matOf("tray"));

          yield* press(start);
          yield* attempt("moved out of the frame", () =>
            page.mouse.move(outside.x, outside.y, { steps: 6 }),
          );
          yield* lift;
          yield* attempt("moved back over the tray", () =>
            page.mouse.move(back.x, back.y, { steps: 6 }),
          );
        }),
      floor: (place) => Effect.map(matOf(place), matPointOf),
      leftovers: attempt("counted what a drag left", () =>
        frame.locator("svg").evaluate((svg) => ({
          copies: svg.querySelectorAll('[aria-hidden="true"] > g').length,
          lifted: svg.querySelectorAll("[data-lifted]").length,
          ready: svg.querySelectorAll("[data-ready]").length,
        })),
      ),
      mat: matOf,
      registered: noteOf(page, "registered", notes.registered),
      relayed: (response) =>
        Effect.gen(function* relayedResponse() {
          const wanted = JSON.stringify(response);

          yield* Effect.ignore(
            attempt(`waited for the response ${wanted}`, () =>
              page.waitForFunction((text) => document.body.dataset["last"] === text, wanted, {
                timeout: relayWait,
              }),
            ),
          );

          const last = yield* attempt("read the last response relayed", () =>
            page.locator("body").evaluate((body) => body.dataset["last"]),
          );

          if (last !== wanted) {
            yield* Effect.fail(
              new BlocksFailure({
                cause: `the last response relayed is ${last ?? "none"}`,
                step: `waited for the response ${wanted}`,
              }),
            );
          }
        }),
      relays: noteOf(page, "relayed", notes.relayed),
      started,
      tapMat: (place) =>
        Effect.gen(function* tapMat() {
          yield* press(matPointOf(yield* matOf(place)));
          yield* lift;
        }),
      tapPiece: (kind, place) =>
        Effect.gen(function* tapPiece() {
          yield* press(centreOf(yield* boxOf(frame, piecesOf(kind, place))));
          yield* lift;
        }),
      text: attempt("read the PCI's text", () =>
        frame.locator("[data-pci-dom]").evaluate((dom) => dom.textContent),
      ),
      touchDrag: (kind, from) =>
        Effect.gen(function* touchDrag() {
          const start = centreOf(yield* boxOf(frame, piecesOf(kind, from)));
          const end = matPointOf(yield* matOf(from === "tray" ? "mat" : "tray"));

          yield* fingerAlong(start, end);
        }),
      touchSwipe: (place) =>
        Effect.gen(function* touchSwipe() {
          const box = yield* matOf(place);
          const y = box.y + 6;

          yield* fingerAlong({ x: box.x + 8, y }, { x: box.x + box.width - 8, y });
        }),
      touchTapMat: (place) =>
        Effect.gen(function* touchTapMat() {
          const point = matPointOf(yield* matOf(place));

          yield* finger("touchStart", [point]);
          yield* finger("touchEnd", []);
        }),
      touchTapPiece: (kind, place) =>
        Effect.gen(function* touchTapPiece() {
          const point = centreOf(yield* boxOf(frame, piecesOf(kind, place)));

          yield* finger("touchStart", [point]);
          yield* finger("touchEnd", []);
        }),
    } satisfies BlocksFrame;
  });

/**
 * Chrome and the page's server, for the scope: open an item's PCI, bound to a response, in a page
 * of its own.
 */
export const blocksPages: Effect.Effect<
  (hosted: BlocksHosted, bound: Response) => Effect.Effect<BlocksFrame, BlocksFailure, Scope.Scope>,
  BlocksFailure,
  Scope.Scope
> = Effect.gen(function* blocksPages() {
  const base = yield* pageServer;
  const browser = yield* chrome;

  return (hosted, bound) => openOn(browser, base, hosted, bound);
});
