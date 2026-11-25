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
 * A page may show several items, as a host does, each in a `section` of its own under an
 * `<Activity>`, and move between them as a host moves from item to item ({@link scenePages}). The
 * pages' server also serves synthetic recordings, a sine tone of a stated length, which it answers
 * at once, holds back until the suite releases it, or refuses, as a slow or broken network would,
 * and reports when it was asked for one and when it delivered it, so a suite waits on what comes,
 * never on a delay. Every page keeps an account of its media (`#specimen/ui/hydrate-account.ts`).
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
import type { Browser, BrowserContext, ConsoleMessage, Page } from "playwright-core";
import { Activity, createElement } from "react";
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
import type { Scene } from "#specimen/ui/hydrate-page.ts";
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
 * modules whose islands its trees hold, each by its file under plate's `src/`, as the islands'
 * names start, and the address the Vite server serves it at.
 */
interface Written {
  readonly data: string;
  readonly html: string;
  readonly modules: readonly { readonly file: string; readonly url: string }[];
}

/**
 * A page as a suite asks for it: the items it may show, each in answering, by its key; the first
 * scene, every item of it shown, none hidden, as a host's first page shows its items; and whether
 * React renders it under `<StrictMode>`.
 */
export interface PageSpec {
  readonly scene: Scene;
  readonly shows: ReadonlyMap<string, Answering>;
  readonly strict: boolean;
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
 * The page's account of its media.
 */
const accountModule = fileURLToPath(new URL("hydrate-account.ts", import.meta.url));

/**
 * Write a page of items in answering as a host serves it, `<Item>` drawing each interaction with
 * plate's standard renderers, as specimen's other pages draw it (`render` in
 * `#specimen/ui/rendered.ts`): each item's tree, every server component expanded, wired; the
 * server's markup of the first scene as the page's host renders it
 * (`#specimen/ui/hydrate-page.ts`), each item in a `section` under an `<Activity>`, with
 * `<Responses>` around its tree as the page reads it back, so the markup is the tree the page
 * hydrates; and the modules whose islands the trees hold.
 *
 * @param spec The page.
 * @param clients Every export of plate's `"use client"` modules, by value, with its name.
 * @returns The page's markup and data.
 */
const written = (spec: PageSpec, clients: ReadonlyMap<unknown, string>): Written => {
  const byName = new Map(Array.from(clients, ([value, name]) => [name, value] as const));
  const shows = Array.from(spec.shows, ([key, answering]) => ({
    answering,
    key,
    tree: toWire(
      createElement(Item, { ...answering.props, renderers: standardRenderers }),
      clients,
    ),
  }));
  const html = renderToString(
    createElement(
      "main",
      null,
      spec.scene.map(({ hidden, key, slot }) => {
        const show = shows.find((each) => each.key === key);

        return createElement(
          "section",
          { "data-show": key, key: slot },
          createElement(Activity, {
            children:
              show === undefined
                ? null
                : createElement(Responses, {
                    children: treeFromWire(show.tree, byName),
                    onChange: keepNothing,
                    value: heldOf(show.answering.responses),
                  }),
            mode: hidden ? "hidden" : "visible",
          }),
        );
      }),
    ),
  );
  const modules = Array.from(
    new Set(
      shows.flatMap(({ tree }) =>
        islandNames(tree).map((name) => name.slice(0, name.lastIndexOf("#"))),
      ),
    ),
    (file) => ({ file, url: servedAt(path.join(plateSource, file)) }),
  );
  const data = {
    scene: spec.scene,
    shows: Object.fromEntries(
      shows.map(({ answering, key, tree }) => [
        key,
        { responses: Schema.encodeSync(PostedResponses)(answering.responses), tree },
      ]),
    ),
    strict: spec.strict,
  };

  return { data: JSON.stringify(data), html, modules };
};

/**
 * A page's document, with an empty icon of its own, so the browser asks the server for none: the
 * server's markup in `#hydrated-root`, the data in `#hydrated-data`, its
 * `</` escaped so no string in it ends the script, and a module script that installs the page's
 * account of its media (`#specimen/ui/hydrate-account.ts`), then loads the modules whose islands
 * the trees hold and hands them to the harness's page (`hydrate`). The script imports each module
 * by its address, statically, so the browser loads every one before it runs, and Vite, which never
 * sees the document, adds nothing of its own to it.
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
<html lang="en"><head><meta charset="utf-8"><title>hydrated</title><link rel="icon" href="data:,"></head>
<body><div id="hydrated-root">${page.html}</div>
<script id="hydrated-data" type="application/json">${page.data.replaceAll("</", "<\\/")}</script>
<script type="module">
import { installAccount } from ${JSON.stringify(servedAt(accountModule))};
import { hydrate } from ${JSON.stringify(servedAt(pageModule))};
${imports.join("\n")}
installAccount();
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
      // A deny list replaces Vite's own, so this is Vite 8.3's (`_serverConfigDefaults.fs.deny`)
      // with jj's store beside git's, which a page never reads.
      server: {
        fs: {
          deny: [
            ".env",
            ".env.*",
            "*.{crt,pem,key,p12,pfx,cer,der}",
            ".npmrc",
            ".yarnrc.yml",
            "**/.git/**",
            "**/.jj/**",
          ],
        },
        hmr: false,
        middlewareMode: true,
        ws: false,
      },
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
 * The sample rate of a synthetic recording, in samples a second: telephone speech's (G.711's),
 * enough for a tone and small to serve; the suite's own choice of input.
 */
const sampleRate = 8000;

/**
 * Write a synthetic recording: a WAV file of 16-bit mono PCM holding a 440 Hz sine tone of the
 * length given, at a third of full scale.
 *
 * @param milliseconds Its length.
 * @returns The file's bytes.
 * @see {@link http://soundfile.sapp.org/doc/WaveFormat/ | The canonical WAVE file format}
 */
const toneOf = (milliseconds: number): Buffer => {
  const samples = Math.round((sampleRate * milliseconds) / 1000);
  const file = Buffer.alloc(44 + samples * 2);

  file.write("RIFF", 0, "ascii");
  file.writeUInt32LE(36 + samples * 2, 4);
  file.write("WAVEfmt ", 8, "ascii");
  file.writeUInt32LE(16, 16);
  file.writeUInt16LE(1, 20);
  file.writeUInt16LE(1, 22);
  file.writeUInt32LE(sampleRate, 24);
  file.writeUInt32LE(sampleRate * 2, 28);
  file.writeUInt16LE(2, 32);
  file.writeUInt16LE(16, 34);
  file.write("data", 36, "ascii");
  file.writeUInt32LE(samples * 2, 40);

  for (let at = 0; at < samples; at += 1) {
    file.writeInt16LE(
      Math.round(10_000 * Math.sin((2 * Math.PI * 440 * at) / sampleRate)),
      44 + at * 2,
    );
  }

  return file;
};

/**
 * Tell whether a text is a run of decimal digits, empty included.
 *
 * @param text The text.
 * @returns Whether every character of it is a digit.
 */
const digitsOnly = (text: string): boolean => {
  for (const character of text) {
    if (character < "0" || character > "9") {
      return false;
    }
  }

  return true;
};

/**
 * Read a request's `Range` header of one byte range, `bytes=<from>-<to>`, either end empty.
 *
 * @param header The header, absent where the request asks for the whole file.
 * @returns The range's two ends as written, none where the header asks for no such range.
 */
const rangeOf = (
  header: string | undefined,
): Option.Option<readonly [from: string, to: string]> => {
  const prefix = "bytes=";

  if (header === undefined || !header.startsWith(prefix)) {
    return Option.none();
  }

  const ends = header.slice(prefix.length).split("-");
  const [from, to] = ends;

  return ends.length === 2 &&
    from !== undefined &&
    to !== undefined &&
    digitsOnly(from) &&
    digitsOnly(to)
    ? Option.some([from, to] as const)
    : Option.none();
};

/**
 * Answer a recording's request, a byte range of it where Chrome asks for one, as a media element
 * reads a file it may seek in. A range may name an end past the file's, which is its last byte
 * (RFC 9110 §14.1.2).
 *
 * @param request The request.
 * @param response Its response.
 * @param bytes The recording.
 */
const answerRange = (request: IncomingMessage, response: ServerResponse, bytes: Buffer): void => {
  const range = Option.getOrUndefined(rangeOf(request.headers.range));
  const last = bytes.length - 1;
  const from = range === undefined || range[0] === "" ? 0 : Number(range[0]);
  const to = range === undefined || range[1] === "" ? last : Math.min(Number(range[1]), last);

  if (range === undefined) {
    response
      .writeHead(200, {
        "accept-ranges": "bytes",
        "content-length": String(bytes.length),
        "content-type": "audio/wav",
      })
      .end(bytes);
  } else if (from > to) {
    response.writeHead(416, { "content-range": `bytes */${String(bytes.length)}` }).end();
  } else {
    response
      .writeHead(206, {
        "accept-ranges": "bytes",
        "content-length": String(to - from + 1),
        "content-range": `bytes ${String(from)}-${String(to)}/${String(bytes.length)}`,
        "content-type": "audio/wav",
      })
      .end(bytes.subarray(from, to + 1));
  }
};

/**
 * A recording the server holds back, as the server knows it: whether it was asked for, the
 * suite's release of it, and whether an answer was delivered.
 */
interface Held {
  readonly delivered: PromiseWithResolvers<boolean>;
  readonly release: PromiseWithResolvers<void>;
  readonly requested: PromiseWithResolvers<void>;
}

/**
 * The recordings the server holds back, by their path's page and name, each made at its first
 * mention, the suite's or a request's.
 */
type HeldRecordings = Map<string, Held>;

/**
 * Give a held-back recording, making it where it is not known yet.
 *
 * @param held The recordings the server holds back.
 * @param key Its page and name.
 * @returns It.
 */
const heldAt = (held: HeldRecordings, key: string): Held => {
  const known = held.get(key);

  if (known !== undefined) {
    return known;
  }

  const made: Held = {
    delivered: Promise.withResolvers(),
    release: Promise.withResolvers(),
    requested: Promise.withResolvers(),
  };

  held.set(key, made);

  return made;
};

/**
 * How the server answers a synthetic recording: `tone` at once, `held` once the suite releases
 * it, and `held-refused` with a 404 once released.
 */
type Answered = "held" | "held-refused" | "tone";

/**
 * A synthetic recording's path as the server reads it: how it is answered, the page it belongs
 * to, its length in milliseconds, and its name.
 */
interface RecordingPath {
  readonly kind: Answered;
  readonly length: number;
  readonly name: string;
  readonly page: string;
}

/**
 * The ways the server answers a recording, each by its path's segment.
 */
const answeredKinds: ReadonlyMap<string, Answered> = new Map([
  ["held", "held"],
  ["held-refused", "held-refused"],
  ["tone", "tone"],
]);

/**
 * The extension of every synthetic recording's file.
 */
const wav = ".wav";

/**
 * Read a request's path as a synthetic recording's: `/recording/<kind>/<page>/<length>/<name>.wav`.
 *
 * @param url The request's path.
 * @returns The recording's path, none where it names no synthetic recording.
 */
const recordingPath = (url: string): Option.Option<RecordingPath> => {
  const segments = url.split("/");
  const [root, area, kindName, page, length, file] = segments;
  const kind = answeredKinds.get(kindName ?? "");

  return segments.length === 6 &&
    root === "" &&
    area === "recording" &&
    kind !== undefined &&
    page !== undefined &&
    page !== "" &&
    length !== undefined &&
    length !== "" &&
    digitsOnly(length) &&
    file !== undefined &&
    file.endsWith(wav) &&
    file.length > wav.length
    ? Option.some({ kind, length: Number(length), name: file.slice(0, -wav.length), page })
    : Option.none();
};

/**
 * Answer a request for a synthetic recording, as its path says: a held-back one once the suite
 * releases it, its delivery reported as written whole or as the page letting the request go
 * first, whichever of the two comes first.
 *
 * @param asked The recording's path.
 * @param request The request.
 * @param response Its response.
 * @param held The recordings the server holds back.
 */
const answerRecording = (
  asked: RecordingPath,
  request: IncomingMessage,
  response: ServerResponse,
  held: HeldRecordings,
): void => {
  const answer = (): void => {
    if (asked.kind === "held-refused") {
      response.writeHead(404).end();
    } else {
      answerRange(request, response, toneOf(asked.length));
    }
  };

  if (asked.kind === "tone") {
    answer();

    return;
  }

  const recording = heldAt(held, `${asked.page}/${asked.name}`);

  recording.requested.resolve();

  const released = async (): Promise<void> => {
    await recording.release.promise;
    response.once("finish", () => {
      recording.delivered.resolve(true);
    });
    response.once("close", () => {
      recording.delivered.resolve(false);
    });
    answer();
  };

  void released();
};

/**
 * The pages' server on a port of the loopback the system chose, closed with its scope: each page
 * at `/page/<n>`, each synthetic recording at `/recording/…` ({@link recordingPath}), and every
 * other address Vite's.
 *
 * @param server Vite.
 * @param pages The pages, by address.
 * @param held The recordings the server holds back.
 * @returns The server's address.
 */
const pageServer = (
  server: ViteServer,
  pages: ReadonlyMap<string, Written>,
  held: HeldRecordings,
): Effect.Effect<string, HydrationFailure, Scope.Scope> => {
  const serve = (request: IncomingMessage, response: ServerResponse) => {
    const page = pages.get(request.url ?? "");
    const asked = Option.getOrUndefined(recordingPath(request.url ?? ""));

    if (asked !== undefined) {
      answerRecording(asked, request, response, held);

      return;
    }

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
    attempt("opened a browser context", async () => {
      const context = await browser.newContext({ viewport: { height: 900, width: 1200 } });

      // Playwright waits on a page, its loads, its keys and its taps, with no timeout of its own:
      // the case's hang guard is the one.
      context.setDefaultTimeout(0);

      return context;
    }),
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
   * Wait in the page until it has painted twice since now, run what those frames scheduled and gone
   * idle, so what an input changed has been rendered and every effect, task and microtask it
   * started has run, every boundary hydrated; and fail where React has reported an error since the
   * page opened, the page has thrown one, or its console has logged one.
   */
  readonly settle: Effect.Effect<void, HydrationFailure>;
}

/**
 * A picture's address: a file whose extension names an image format.
 */
const pictureAddress = /\.(?:avif|gif|jpe?g|png|svg|webp)(?:[?#]|$)/iu;

/**
 * Tell whether a console message reports an error of the page's. React's development build reports
 * what it does not throw, a hydration mismatch among it, as an error; UI SDK's warns of what it
 * judges a misuse, two parts that share one key among it, as a warning that names it. A picture
 * the item names, which the harness does not serve, is no error of the page's, nor a recording the
 * harness refuses, which a suite asks for to see the page meet a failure: the browser reports
 * either's failed load as an error at its address, which is excepted, and no other.
 *
 * @param message The message.
 * @returns Whether it reports an error.
 */
const reportsAnError = (message: ConsoleMessage): boolean => {
  if (message.type() === "warning") {
    return message.text().startsWith("[ui-sdk]");
  }

  return (
    message.type() === "error" &&
    !(
      message.text().startsWith("Failed to load resource") &&
      (pictureAddress.test(message.location().url) ||
        message.location().url.includes("/recording/held-refused/"))
    )
  );
};

/**
 * Wait in the page for two frames, the task after them, and the page's next idle period, which
 * comes only once the page has no task to run: so React has hydrated every Suspense boundary it
 * still had to, an island's among them, and run their effects, which it schedules as tasks of its
 * own, whatever the machine's load. A boundary hydrates after the page's root, so two frames alone
 * left a press on a control whose effect had yet to run.
 *
 * @returns The wait, in the page.
 */
const framesAndIdle = async (): Promise<void> => {
  const first = Promise.withResolvers<number>();

  requestAnimationFrame(first.resolve);
  await first.promise;
  const second = Promise.withResolvers<number>();

  requestAnimationFrame(second.resolve);
  await second.promise;
  const task = Promise.withResolvers<undefined>();

  setTimeout(task.resolve, 0);
  await task.promise;
  const idle = Promise.withResolvers<IdleDeadline>();

  requestIdleCallback(idle.resolve);
  await idle.promise;
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
    page.on("console", (message) => {
      if (reportsAnError(message)) {
        thrown.push(`console: ${message.text()} (${message.location().url})`);
      }
    });
    yield* attempt("loaded the page", () => page.goto(address));

    // The page hydrates, or something it reported ends the wait at once: a module that failed to
    // load never hydrates it, and an error React reports to the page's own handlers stops it. The
    // page's errors read as none while it is still loading, where nothing can be read of it yet.
    const errorsNow = attempt("read the page's errors", () =>
      page.evaluate(() => window.hydrated?.errors ?? []),
    ).pipe(
      Effect.orElseSucceed((): readonly string[] => []),
      Effect.map((reported) => [...thrown, ...reported]),
    );

    yield* Effect.raceFirst(
      attempt("waited for the page to hydrate", () =>
        page.waitForFunction(() => window.hydrated?.hydrated === true),
      ),
      Effect.gen(function* reporting() {
        let errors = yield* errorsNow;

        while (errors.length === 0) {
          yield* Effect.sleep("100 millis");
          errors = yield* errorsNow;
        }

        return yield* new HydrationFailure({ cause: errors, step: "loaded the page" });
      }),
    );

    const kept = Effect.flatMap(
      attempt("read what the page kept", () => page.evaluate(() => window.hydrated ?? null)),
      (read) =>
        Effect.mapError(
          Schema.decodeUnknownEffect(KeptSchema)(read),
          (cause) => new HydrationFailure({ cause, step: "read what the page kept" }),
        ),
    );
    const settle = attempt("waited for the page to settle", () =>
      page.evaluate(framesAndIdle),
    ).pipe(
      Effect.andThen(kept),
      Effect.flatMap((reported) => {
        const errors = [...thrown, ...reported.errors];

        return errors.length > 0
          ? Effect.fail(new HydrationFailure({ cause: errors, step: "ran the page" }))
          : Effect.void;
      }),
    );

    yield* settle;

    return {
      changes: kept.pipe(Effect.map(({ changes }) => changes)),
      page,
      settle,
    } satisfies Hydrated;
  });

/**
 * The addresses of a page's synthetic recordings on the pages' server, each by its name, and what
 * the server reports of those it holds back. A name is the page's own: another page's recording of
 * the same name is another recording.
 */
export interface Recordings {
  /**
   * Give a recording's address: a tone of the length given, answered at once.
   *
   * @param name Its name.
   * @param milliseconds Its length.
   * @returns Its address.
   */
  readonly tone: (name: string, milliseconds: number) => string;
  /**
   * Give a recording's address: a tone the server holds back until the suite releases it.
   *
   * @param name Its name.
   * @param milliseconds Its length.
   * @returns Its address.
   */
  readonly held: (name: string, milliseconds: number) => string;
  /**
   * Give a recording's address: one the server refuses, with a 404, once the suite releases it.
   *
   * @param name Its name.
   * @returns Its address.
   */
  readonly refused: (name: string) => string;
  /**
   * Wait until the server has been asked for a held-back recording.
   *
   * @param name Its name.
   * @returns The wait.
   */
  readonly requested: (name: string) => Effect.Effect<void>;
  /**
   * Let a held-back recording go: the server answers every request for it, now and from now on.
   *
   * @param name Its name.
   * @returns The release.
   */
  readonly release: (name: string) => Effect.Effect<void>;
  /**
   * Wait until the server has delivered an answer to a request for a held-back recording, all of
   * it written, or the page let the request go before it was.
   *
   * @param name Its name.
   * @returns Whether the answer reached the page whole.
   */
  readonly delivered: (name: string) => Effect.Effect<boolean>;
}

/**
 * A page of items hydrated in Chrome, with its recordings.
 */
export interface HydratedScene extends Hydrated {
  readonly recordings: Recordings;
}

/**
 * Give a page's recordings: their addresses under its own segment of the server's, and what the
 * server reports of those it holds back.
 *
 * @param base The pages' server's address.
 * @param page The page's segment.
 * @param held The recordings the server holds back.
 * @returns The recordings.
 */
const recordingsOf = (base: string, page: string, held: HeldRecordings): Recordings => {
  const at = (kind: string, name: string, milliseconds: number): string =>
    `${base}/recording/${kind}/${page}/${String(milliseconds)}/${name}.wav`;
  const heldNamed = (name: string): Held => heldAt(held, `${page}/${name}`);

  return {
    delivered: (name) => Effect.promise(() => heldNamed(name).delivered.promise),
    held: (name, milliseconds) => at("held", name, milliseconds),
    refused: (name) => at("held-refused", name, 0),
    release: (name) =>
      Effect.sync(() => {
        heldNamed(name).release.resolve();
      }),
    requested: (name) => Effect.promise(() => heldNamed(name).requested.promise),
    tone: (name, milliseconds) => at("tone", name, milliseconds),
  };
};

/**
 * Vite, the pages' server and Chrome, for the scope, and how a page opens on them: each page at an
 * address of its own, hydrated, its recordings under a segment of their own.
 */
const harness = Effect.gen(function* harness() {
  const clients = yield* clientExports;
  const server = yield* vite;
  const pages = new Map<string, Written>();
  const held: HeldRecordings = new Map();
  const base = yield* pageServer(server, pages, held);
  const context = yield* contextIn(yield* chrome);

  return <E>(
    build: (recordings: Recordings) => Effect.Effect<PageSpec, E>,
  ): Effect.Effect<HydratedScene, E | HydrationFailure, Scope.Scope> =>
    Effect.suspend(() => {
      const page = `p${String(pages.size)}`;
      const recordings = recordingsOf(base, page, held);

      return Effect.gen(function* opened() {
        const spec = yield* build(recordings);
        const address = `/page/${page}`;

        pages.set(address, written(spec, clients));

        const hydrated = yield* openedAt(context, `${base}${address}`);

        return { ...hydrated, recordings };
      });
    });
});

/**
 * Vite, the pages' server and Chrome, for the scope: open an item in answering, hydrated, in a page
 * of its own.
 */
export const hydratedPages: Effect.Effect<
  (answering: Answering) => Effect.Effect<Hydrated, HydrationFailure, Scope.Scope>,
  HydrationFailure,
  Scope.Scope
> = harness.pipe(
  Effect.map(
    (open) => (answering: Answering) =>
      open(() =>
        Effect.succeed({
          scene: [{ frame: false, hidden: false, key: "item", slot: "item" }],
          shows: new Map([["item", answering]]),
          strict: false,
        }),
      ),
  ),
);

/**
 * Vite, the pages' server and Chrome, for the scope: open a page of items in answering, hydrated,
 * as a host shows them, its first scene and its items built from the page's own recordings.
 */
export const scenePages: Effect.Effect<
  <E>(
    build: (recordings: Recordings) => Effect.Effect<PageSpec, E>,
  ) => Effect.Effect<HydratedScene, E | HydrationFailure, Scope.Scope>,
  HydrationFailure,
  Scope.Scope
> = harness;
