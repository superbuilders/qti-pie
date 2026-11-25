/**
 * Plate's item pages hydrated as a child meets them: an item rendered by `<Item>` in answering, as
 * a host renders it, its tree shipped to headless Google Chrome on the suite's stand-in for React
 * Server Components' wire (`#specimen/ui/wire.ts`) with the server's markup, and hydrated there by
 * the harness's page (`#specimen/ui/hydrate-page.ts`) with `<Responses>` around it, so a suite
 * presses keys and taps on plate's islands as a child does and reads every change they write. Every
 * other suite of plate's UI reads the server's markup alone; what an island does once it runs, its
 * focus, its keys and its pointer, only a browser shows.
 *
 * The page's modules are served by a Vite server in this process, which turns the page's
 * TypeScript and plate's islands, the very files the server shell loads, into the browser's
 * JavaScript, and bundles React, the one dependency written as CommonJS, before the first page
 * loads; so nothing loads from another host, and no page waits on a bundle Vite discovers late.
 * Chrome is the machine's, through Playwright's `chrome` channel, headless.
 *
 * Test support for plate's UI suite under `src/ui/`.
 *
 * @module
 */
import { realpathSync } from "node:fs";
import { createServer } from "node:http";
import type { IncomingMessage, Server, ServerResponse } from "node:http";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { inspect } from "node:util";
import { Config, Data, Effect, Option, Predicate, Schema } from "effect";
import type { Scope } from "effect";
import { chromium } from "playwright-core";
import type { Browser, BrowserContext, Page } from "playwright-core";
import { createElement } from "react";
import { renderToString } from "react-dom/server";
import type { Responses as ResponseValues } from "@qti-pie/plate";
import { solution, startingResponses } from "@qti-pie/plate";
import { PostedResponses } from "@qti-pie/plate/codec";
import { recordOf } from "@qti-pie/plate/test/records";
import { Item, standardRenderers } from "@qti-pie/plate/ui";
import type { ItemProps } from "@qti-pie/plate/ui";
import { heldOf, Responses } from "@qti-pie/plate/ui/client";
import { createViteServer } from "vitest/node";
import { clientExports, plateSource } from "#specimen/ui/clients.ts";
import { instance } from "#specimen/ui/rules.ts";
import type { SourceItem } from "#specimen/ui/rules.ts";
import { isWireArray, toWire, treeFromWire } from "#specimen/ui/wire.ts";
import type { Wire } from "#specimen/ui/wire.ts";

/**
 * A step of hosting a hydrated page failed: the Vite server, the page's server or Chrome would not
 * start, a page would not load or hydrate, or the page reported an error while hydrating.
 */
export class HydrationFailure extends Data.TaggedError("HydrationFailure")<{
  readonly cause: unknown;
  readonly step: string;
}> {
  /**
   * The step that failed and its cause.
   */
  override get message(): string {
    return `A hydrated page failed while it ${this.step}: ${inspect(this.cause, { depth: 4 })}`;
  }
}

/**
 * Run a promise of Chrome's, Vite's or the server's as an effect that fails with the step it was.
 *
 * @param step What the promise does, for the failure.
 * @param run The promise.
 * @returns The effect.
 */
const attempt = <A>(step: string, run: () => Promise<A>): Effect.Effect<A, HydrationFailure> =>
  Effect.tryPromise({ catch: (cause) => new HydrationFailure({ cause, step }), try: run });

/**
 * An item as a host shows it in answering: `<Item>`'s props and the responses its `<Responses>`
 * starts from.
 */
export interface Answering {
  readonly props: ItemProps;
  readonly responses: ResponseValues;
}

/**
 * Give an item as a host shows it in answering, the child's responses its correct ones: the
 * attempt's start, with the solution laid over it as a save is laid over a start, and the record a
 * page shows with no database, each outcome the item declares at NULL, as the suite's own pages
 * show it (`see` in `#specimen/ui/rules.ts`).
 *
 * @param item The item, as the suite reads it.
 * @returns The item in answering, solved.
 */
export const solved = (item: SourceItem): Answering => {
  const { accepted, configuration, stimuli } = item;
  const record = Option.getOrElse(item.taken, () =>
    recordOf({
      outcomes: Object.fromEntries(
        Array.from(accepted.item.outcomes, ([identifier, declared]) => [
          identifier,
          { baseType: declared.baseType, cardinality: declared.cardinality, values: [] },
        ]),
      ),
    }),
  );
  const shownBy = { record, showFeedback: true } as const;

  return {
    props: { ...shownBy, configuration, instance, item: accepted, mode: "answering", stimuli },
    responses: { ...startingResponses(accepted, shownBy), ...solution(accepted, record) },
  };
};

/**
 * A page as its server writes it: the server's markup, the data the harness's page reads, and the
 * modules whose islands the tree holds, each by its file under plate's `src/`, as the islands'
 * names start, and the address the Vite server serves it at.
 */
interface Written {
  readonly data: string;
  readonly html: string;
  readonly modules: readonly { readonly file: string; readonly url: string }[];
}

/**
 * Keep no change: the `onChange` a server render's `<Responses>` is given, which it never calls.
 */
const keepNothing = (): void => {
  // A server render runs no event handler.
};

/**
 * Name every island a wired tree holds, in tree order, an island named as often as it stands.
 *
 * @param wire The wired tree.
 * @returns Each island's name.
 */
const islandNames = (wire: Wire): readonly string[] => {
  if (
    wire === null ||
    Predicate.isString(wire) ||
    Predicate.isNumber(wire) ||
    Predicate.isBoolean(wire)
  ) {
    return [];
  }

  if (isWireArray(wire)) {
    return wire.flatMap((each) => islandNames(each));
  }

  switch (wire.kind) {
    case "client": {
      return [wire.name, ...islandNames(wire.props)];
    }
    case "fragment":
    case "host":
    case "suspense": {
      return islandNames(wire.props);
    }
    case "map": {
      return wire.entries.flatMap(([key, value]) => [...islandNames(key), ...islandNames(value)]);
    }
    case "object": {
      return Object.values(wire.fields).flatMap((each) => islandNames(each));
    }
    case "set": {
      return wire.values.flatMap((each) => islandNames(each));
    }
    case "bigint":
    case "undefined": {
      return [];
    }
    default: {
      return wire satisfies never;
    }
  }
};

/**
 * The address the Vite server serves a file of this machine at.
 *
 * @param file The file's path.
 * @returns Its address, by its real path, as Vite names a module it resolves, so the page's
 *   modules and those plate's own imports reach are one module each.
 */
const servedAt = (file: string): string => `/@fs${realpathSync(file)}`;

/**
 * The harness's page module.
 */
const pageModule = fileURLToPath(new URL("hydrate-page.ts", import.meta.url));

/**
 * Write an item's answering page as a host serves it, `<Item>` drawing each interaction with
 * plate's standard renderers, as specimen's other pages draw it (`render` in
 * `#specimen/ui/rendered.ts`): its tree, every server component expanded, wired; the server's
 * markup of `<Responses>` around that tree as the page reads it back, so the markup is the tree the
 * page hydrates; and the modules whose islands the tree holds.
 *
 * @param answering The item in answering.
 * @param clients Every export of plate's `"use client"` modules, by value, with its name.
 * @returns The page's markup and data.
 */
const written = (answering: Answering, clients: ReadonlyMap<unknown, string>): Written => {
  const byName = new Map(Array.from(clients, ([value, name]) => [name, value] as const));
  const tree = toWire(
    createElement(Item, { ...answering.props, renderers: standardRenderers }),
    clients,
  );
  const responses = Schema.encodeSync(PostedResponses)(answering.responses);
  const html = renderToString(
    createElement(Responses, {
      children: treeFromWire(tree, byName),
      onChange: keepNothing,
      value: heldOf(answering.responses),
    }),
  );
  const modules = Array.from(
    new Set(islandNames(tree).map((name) => name.slice(0, name.lastIndexOf("#")))),
    (file) => ({ file, url: servedAt(path.join(plateSource, file)) }),
  );

  return { data: JSON.stringify({ responses, tree }), html, modules };
};

/**
 * A page's document: the server's markup in `#hydrated-root`, the data in `#hydrated-data`, its
 * `</` escaped so no string in it ends the script, and a module script that loads the modules whose
 * islands the tree holds and hands them to the harness's page (`hydrate`). The script imports each
 * module by its address, statically, so the browser loads every one before it runs, and Vite, which
 * never sees the document, adds nothing of its own to it.
 *
 * @param page The page.
 * @returns The document.
 */
const documentOf = (page: Written): string => {
  const imports = page.modules.map(
    ({ url }, index) => `import * as module${String(index)} from ${JSON.stringify(url)};`,
  );
  const modules = page.modules.map(
    ({ file }, index) => `${JSON.stringify(file)}: module${String(index)}`,
  );

  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><title>hydrated</title></head>
<body><div id="hydrated-root">${page.html}</div>
<script id="hydrated-data" type="application/json">${page.data.replaceAll("</", "<\\/")}</script>
<script type="module">
import { hydrate } from ${JSON.stringify(servedAt(pageModule))};
${imports.join("\n")}
hydrate({ ${modules.join(", ")} });
</script>
</body></html>`;
};

/**
 * Vite's development server, as `createViteServer` starts it.
 */
type ViteServer = Effect.Success<ReturnType<typeof viteServer>>;

/**
 * Start Vite, serving the page's modules from this package, React bundled for the browser before
 * the first page. It serves modules alone: no HTML of its own, no hot reload, and no discovery of
 * dependencies while pages load.
 *
 * @returns Vite, started.
 */
const viteServer = () =>
  attempt("started Vite", async () => {
    const server = await createViteServer({
      appType: "custom",
      configFile: false,
      logLevel: "error",
      optimizeDeps: {
        include: [
          "react",
          "react/jsx-dev-runtime",
          "react/jsx-runtime",
          "react-dom",
          "react-dom/client",
        ],
        noDiscovery: true,
      },
      root: path.dirname(path.dirname(path.dirname(pageModule))),
      server: { hmr: false, middlewareMode: true, ws: false },
    });

    await server.environments.client.depsOptimizer?.init();

    return server;
  });

/**
 * Vite, for the scope, closed with it.
 */
const vite: Effect.Effect<ViteServer, HydrationFailure, Scope.Scope> = Effect.acquireRelease(
  viteServer(),
  (server) => Effect.promise(() => server.close()),
);

/**
 * The address a listening server took, as Node reports it for a TCP server.
 */
const ListeningAddress = Schema.Struct({ port: Schema.Number });

/**
 * The pages' server on a port of the loopback the system chose, closed with its scope: each page
 * at `/page/<n>`, and every other address Vite's.
 *
 * @param server Vite.
 * @param pages The pages, by address.
 * @returns The server's address.
 */
const pageServer = (
  server: ViteServer,
  pages: ReadonlyMap<string, Written>,
): Effect.Effect<string, HydrationFailure, Scope.Scope> => {
  const serve = (request: IncomingMessage, response: ServerResponse) => {
    const page = pages.get(request.url ?? "");

    if (page === undefined) {
      server.middlewares(request, response);

      return;
    }

    response.writeHead(200, { "content-type": "text/html; charset=utf-8" });
    response.end(documentOf(page));
  };

  return Effect.flatMap(
    Effect.acquireRelease(
      Effect.callback<Server>((resume) => {
        const listening = createServer(serve);

        listening.listen(0, "127.0.0.1", () => {
          resume(Effect.succeed(listening));
        });
      }),
      (listening) =>
        Effect.callback<undefined>((resume) => {
          listening.close(() => {
            resume(Effect.undefined);
          });
          listening.closeAllConnections();
        }),
    ),
    (listening) =>
      Effect.mapError(
        Schema.decodeUnknownEffect(ListeningAddress)(listening.address()),
        (cause) => new HydrationFailure({ cause, step: "read the pages' server's port" }),
      ).pipe(Effect.map(({ port }) => `http://127.0.0.1:${String(port)}`)),
  );
};

/**
 * The folder Chrome keeps its process singleton's socket in: the session's runtime folder, whose
 * path is short, as the math entry's pages take it (`#specimen/ui/math-entry.ts`); the system's
 * temporary folder where the session has none.
 */
const runtimeFolder = Config.String("XDG_RUNTIME_DIR").pipe(Config.withDefault(tmpdir()));

/**
 * The machine's Google Chrome, headless, closed with its scope.
 */
const chrome: Effect.Effect<Browser, HydrationFailure, Scope.Scope> = Effect.acquireRelease(
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
 * The browser context every page opens in, closed with its scope: one for the harness, so a page
 * loads the modules an earlier page loaded from the browser's cache, as Vite's answers allow, and
 * no page holds state of another's, since no island keeps any in the browser's storage.
 *
 * @param browser Chrome.
 * @returns The context.
 */
const contextIn = (
  browser: Browser,
): Effect.Effect<BrowserContext, HydrationFailure, Scope.Scope> =>
  Effect.acquireRelease(
    attempt("opened a browser context", () =>
      browser.newContext({ viewport: { height: 900, width: 1200 } }),
    ),
    (opened) => Effect.promise(() => opened.close()),
  );

/**
 * What the harness's page keeps, as the harness reads it from the page.
 */
const KeptSchema = Schema.Struct({
  changes: Schema.Array(PostedResponses),
  errors: Schema.Array(Schema.String),
  hydrated: Schema.Boolean,
});

/**
 * An item's page, hydrated in Chrome: the page, to press and tap on, and what its islands wrote.
 */
export interface Hydrated {
  readonly page: Page;
  /**
   * The responses after each change an island wrote, in order, every response of the item in each.
   */
  readonly changes: Effect.Effect<readonly ResponseValues[], HydrationFailure>;
  /**
   * Wait in the page until it has painted twice since now and run what those frames scheduled, so
   * what an input changed has been rendered and every effect and microtask it started has run.
   */
  readonly settle: Effect.Effect<void, HydrationFailure>;
}

/**
 * Wait in the page for two frames and the task after them.
 *
 * @returns The wait, in the page.
 */
const twoFramesAndATask = async (): Promise<void> => {
  const first = Promise.withResolvers<number>();

  requestAnimationFrame(first.resolve);
  await first.promise;
  const second = Promise.withResolvers<number>();

  requestAnimationFrame(second.resolve);
  await second.promise;
  const task = Promise.withResolvers<undefined>();

  setTimeout(task.resolve, 0);
  await task.promise;
};

/**
 * Open a page, closed with the scope, and wait until React has hydrated it, failing where React
 * reported an error or the page threw.
 *
 * @param context The browser context.
 * @param address The page's address.
 * @returns The page, hydrated.
 */
const openedAt = (
  context: BrowserContext,
  address: string,
): Effect.Effect<Hydrated, HydrationFailure, Scope.Scope> =>
  Effect.gen(function* opening() {
    const page = yield* Effect.acquireRelease(
      attempt("opened a page", () => context.newPage()),
      (opened) => Effect.promise(() => opened.close()),
    );
    const thrown: string[] = [];

    page.on("pageerror", (cause) => {
      thrown.push(cause.stack ?? cause.message);
    });
    yield* attempt("loaded the page", () => page.goto(address));
    yield* attempt("waited for the page to hydrate", () =>
      page.waitForFunction(() => window.hydrated?.hydrated === true),
    );

    const kept = Effect.flatMap(
      attempt("read what the page kept", () => page.evaluate(() => window.hydrated ?? null)),
      (read) =>
        Effect.mapError(
          Schema.decodeUnknownEffect(KeptSchema)(read),
          (cause) => new HydrationFailure({ cause, step: "read what the page kept" }),
        ),
    );
    const settle = attempt("waited for the page to settle", () => page.evaluate(twoFramesAndATask));

    yield* settle;

    const reported = yield* kept;
    const errors = [...thrown, ...reported.errors];

    if (errors.length > 0) {
      return yield* new HydrationFailure({ cause: errors, step: "hydrated the page" });
    }

    return {
      changes: kept.pipe(Effect.map(({ changes }) => changes)),
      page,
      settle,
    } satisfies Hydrated;
  });

/**
 * Vite, the pages' server and Chrome, for the scope: open an item in answering, hydrated, in a page
 * of its own.
 */
export const hydratedPages: Effect.Effect<
  (answering: Answering) => Effect.Effect<Hydrated, HydrationFailure, Scope.Scope>,
  HydrationFailure,
  Scope.Scope
> = Effect.gen(function* hydratedPages() {
  const clients = yield* clientExports;
  const server = yield* vite;
  const pages = new Map<string, Written>();
  const base = yield* pageServer(server, pages);
  const context = yield* contextIn(yield* chrome);

  return (answering) =>
    Effect.suspend(() => {
      const address = `/page/${String(pages.size)}`;

      pages.set(address, written(answering, clients));

      return openedAt(context, `${base}${address}`);
    });
});
