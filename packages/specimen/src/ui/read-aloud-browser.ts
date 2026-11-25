/**
 * Plate's read-aloud in headless Google Chrome, as a child and a host drive it: the page of
 * `#specimen/ui/read-aloud-page.ts`, bundled with plate's own islands (read-aloud's, the Gap
 * Match's and the Media's replay), served from this machine
 * with synthetic recordings, a sine tone of a stated length, which the server may hold back for a
 * while or refuse, as a slow or broken network would. Plate's UI suite reads it
 * (`#specimen/ui/read-aloud-browser.test.ts`).
 *
 * The bundle is built by the Vite vitest itself runs on (vitest's own dependency, the module
 * `vitest/node` types as `Vite`), from plate's island modules as its `./ui` entry places them, the
 * modules the server shell renders (as `#specimen/ui/clients.ts` reaches them), so the suite adds
 * no dependency a consumer's catalog would have to hold. Chrome is the machine's, through
 * Playwright's `chrome` channel, headless.
 *
 * @module
 */
import { createServer } from "node:http";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { inspect } from "node:util";
import type { IncomingMessage, Server, ServerResponse } from "node:http";
import { Config, Data, Duration, Effect, Schema } from "effect";
import type { Scope } from "effect";
import { chromium } from "playwright-core";
import type { Browser, Page } from "playwright-core";
import type { Vite } from "vitest/node";
import { plateSource } from "#specimen/ui/clients.ts";
import type { Recording, Scene, Seen } from "#specimen/ui/read-aloud-page.ts";

/**
 * The page could not be built or served, Chrome could not start or be driven, or the page did not
 * come to a state a rule waited for.
 */
export class ReadAloudBrowserFailure extends Data.TaggedError("ReadAloudBrowserFailure")<{
  readonly cause: unknown;
  readonly step: string;
}> {
  /**
   * The step that failed and its cause.
   */
  override get message(): string {
    return `Plate's read-aloud in Chrome failed while it ${this.step}: ${inspect(this.cause, { depth: 3 })}`;
  }
}

/**
 * Run a promise of Chrome's, the server's or the bundler's as an effect that fails with the step
 * it was.
 *
 * @param step What the promise does, for the failure.
 * @param run The promise.
 * @returns The effect.
 */
const attempt = <A>(
  step: string,
  run: () => Promise<A>,
): Effect.Effect<A, ReadAloudBrowserFailure> =>
  Effect.tryPromise({ catch: (cause) => new ReadAloudBrowserFailure({ cause, step }), try: run });

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
 * The address of a synthetic recording, by name, so two recordings of one length are two files.
 *
 * @param name Its name.
 * @param milliseconds Its length.
 * @param options How the server answers it: after `delay` milliseconds, and refused with a 404
 *   where it is `missing`.
 * @param options.delay How long the server holds the answer back.
 * @param options.missing Whether the server refuses it.
 * @returns Its path on the page's server.
 */
export const recording = (
  name: string,
  milliseconds: number,
  options: { readonly delay?: number; readonly missing?: boolean } = {},
): string =>
  `/${options.missing === true ? "missing" : "tone"}/${String(options.delay ?? 0)}/${String(milliseconds)}/${name}.wav`;

/**
 * A recording's path as the server reads it: whether it is refused, how long its answer is held
 * back, and its length.
 */
const recordingPath = /^\/(?<kind>tone|missing)\/(?<delay>\d+)\/(?<length>\d+)\/[\w-]+\.wav$/u;

/**
 * The page's HTML: the bundle, as a module.
 */
const pageHtml = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><title>read-aloud</title></head>
<body><script type="module" src="/page.js"></script></body></html>`;

/**
 * Answer a recording's request, a byte range of it where Chrome asks for one, as a media element
 * reads a file it may seek in.
 *
 * @param request The request.
 * @param response Its response.
 * @param bytes The recording.
 */
const answerRange = (request: IncomingMessage, response: ServerResponse, bytes: Buffer): void => {
  const range = /^bytes=(?<from>\d*)-(?<to>\d*)$/u.exec(request.headers.range ?? "")?.groups;
  const last = bytes.length - 1;
  const from = range === undefined || range["from"] === "" ? 0 : Number(range["from"]);
  // A range may name an end past the file's, which is its last byte (RFC 9110 §14.1.2).
  const to = range === undefined || range["to"] === "" ? last : Math.min(Number(range["to"]), last);

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
 * Answer one request of the page: the page, its bundle, or a recording, held back or refused as
 * its path says.
 *
 * @param bundle The bundle's text.
 * @returns The server's handler.
 */
const serveWith = (
  bundle: string,
): ((request: IncomingMessage, response: ServerResponse) => void) => {
  const tones = new Map<number, Buffer>();

  /**
   * Give the tone of a length, written once and served from then on.
   *
   * @param milliseconds Its length.
   * @returns Its bytes.
   */
  const toneFor = (milliseconds: number): Buffer => {
    const known = tones.get(milliseconds);
    if (known !== undefined) {
      return known;
    }

    const made = toneOf(milliseconds);

    tones.set(milliseconds, made);

    return made;
  };

  return (request: IncomingMessage, response: ServerResponse): void => {
    const url = new URL(request.url ?? "/", "http://localhost");
    const asked = recordingPath.exec(url.pathname)?.groups;

    if (url.pathname === "/") {
      response.writeHead(200, { "content-type": "text/html; charset=utf-8" }).end(pageHtml);
    } else if (url.pathname === "/page.js") {
      response.writeHead(200, { "content-type": "text/javascript; charset=utf-8" }).end(bundle);
    } else if (asked === undefined) {
      response.writeHead(404).end();
    } else {
      setTimeout(() => {
        if (asked["kind"] === "missing") {
          response.writeHead(404).end();
        } else {
          answerRange(request, response, toneFor(Number(asked["length"])));
        }
      }, Number(asked["delay"]));
    }
  };
};

/**
 * The bundle's entry: the page module, handed plate's own islands from their modules.
 */
const entrySource = [
  `import { install } from ${JSON.stringify(fileURLToPath(new URL("read-aloud-page.ts", import.meta.url)))};`,
  `import { Gap, GapMatch } from ${JSON.stringify(path.join(plateSource, "ui/gap-match/gap-match.tsx"))};`,
  `import { Media, MediaReplay } from ${JSON.stringify(path.join(plateSource, "ui/media/media.tsx"))};`,
  `import { ReadAloud } from ${JSON.stringify(path.join(plateSource, "ui/read-aloud/read-aloud.tsx"))};`,
  `import { ReadAloudItem } from ${JSON.stringify(path.join(plateSource, "ui/read-aloud/session.tsx"))};`,
  `import { Responses } from ${JSON.stringify(path.join(plateSource, "ui/responses.tsx"))};`,
  "install({ Gap, GapMatch, Media, MediaReplay, ReadAloud, ReadAloudItem, Responses });",
].join("\n");

/**
 * The bundle entry's id.
 */
const entryId = "\0read-aloud-page";

/**
 * What a bundle's build gives, as far as the page reads it: its chunks' code.
 */
const BuildOutput = Schema.Array(
  Schema.Struct({
    output: Schema.Array(
      Schema.Union([
        Schema.Struct({ code: Schema.String, type: Schema.Literal("chunk") }),
        Schema.Struct({ type: Schema.Literal("asset") }),
      ]),
    ),
  }),
);

/**
 * Build the page's bundle: one module, React's development build, so `<StrictMode>` runs every
 * effect twice as it does in development.
 */
const pageBundle: Effect.Effect<string, ReadAloudBrowserFailure> = Effect.gen(function* bundled() {
  const vite = yield* attempt(
    "loaded the Vite vitest runs on",
    (): Promise<typeof Vite> =>
      import(
        pathToFileURL(
          createRequire(createRequire(import.meta.url).resolve("vitest")).resolve("vite"),
        ).href
      ),
  );
  const built = yield* attempt("bundled the page", () =>
    vite.build({
      build: {
        minify: false,
        modulePreload: false,
        rolldownOptions: { input: entryId },
        write: false,
      },
      configFile: false,
      define: { "process.env.NODE_ENV": JSON.stringify("development") },
      logLevel: "silent",
      mode: "development",
      plugins: [
        {
          load: (id) => (id === entryId ? entrySource : undefined),
          name: "read-aloud-page",
          resolveId: (id) => (id === entryId ? entryId : undefined),
        },
      ],
      root: plateSource,
    }),
  );
  const outputs = yield* Effect.mapError(
    Schema.decodeUnknownEffect(BuildOutput)([built].flat()),
    (cause) => new ReadAloudBrowserFailure({ cause, step: "read the bundle" }),
  );

  return outputs
    .flatMap(({ output }) => output)
    .flatMap((chunk) => (chunk.type === "chunk" ? [chunk.code] : []))
    .join("\n");
});

/**
 * The address a listening server took, as Node reports it for a TCP server.
 */
const ListeningAddress = Schema.Struct({ port: Schema.Number });

/**
 * The page's server on a port of the loopback the system chose, closed with its scope.
 *
 * @param bundle The page's bundle.
 * @returns The page's address.
 */
const pageServer = (bundle: string): Effect.Effect<string, ReadAloudBrowserFailure, Scope.Scope> =>
  Effect.flatMap(
    Effect.acquireRelease(
      Effect.callback<Server>((resume) => {
        const server = createServer(serveWith(bundle));

        server.listen(0, "127.0.0.1", () => {
          resume(Effect.succeed(server));
        });
      }),
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
        (cause) => new ReadAloudBrowserFailure({ cause, step: "read the page's server's port" }),
      ).pipe(Effect.map(({ port }) => `http://127.0.0.1:${String(port)}/`)),
  );

/**
 * The folder Chrome keeps its process singleton's socket in: the session's runtime folder, whose
 * path is short enough for a socket's (`#specimen/ui/math-entry.ts` says why); the system's
 * temporary folder where the session has none.
 */
const runtimeFolder = Config.String("XDG_RUNTIME_DIR").pipe(Config.withDefault(tmpdir()));

/**
 * The machine's Google Chrome, headless, closed with its scope. A page may play a recording a
 * script starts, as a child's press may, so a rule can press two controls in one task.
 */
const chrome: Effect.Effect<Browser, ReadAloudBrowserFailure, Scope.Scope> = Effect.acquireRelease(
  Effect.flatMap(Effect.orDie(runtimeFolder), (temporary) =>
    attempt("started Chrome", () =>
      chromium.launch({
        args: ["--autoplay-policy=no-user-gesture-required"],
        channel: "chrome",
        env: { ...process.env, TMPDIR: temporary },
        headless: true,
      }),
    ),
  ),
  (browser) => Effect.promise(() => browser.close()),
);

/**
 * What a rule reads of a page: what it saw, every moment two recordings sounded at once, every
 * recording as it is now, and the page's errors.
 */
export interface Account {
  readonly errors: readonly string[];
  readonly overlaps: readonly string[];
  readonly recordings: readonly Recording[];
  readonly seen: readonly Seen[];
}

/**
 * One page as a rule drives it.
 */
export interface Driven {
  /**
   * Read the page's account now.
   */
  readonly account: Effect.Effect<Account, ReadAloudBrowserFailure>;
  /**
   * Read the counts the scene's counted Media interactions post now, by response.
   */
  readonly posted: Effect.Effect<Readonly<Record<string, string>>, ReadAloudBrowserFailure>;
  /**
   * Play a media element of the host's own, heard, or muted and looping.
   *
   * @param src Its file.
   * @param muted Whether it is muted, as a decorative video is.
   * @returns The play.
   */
  readonly foreign: (src: string, muted?: boolean) => Effect.Effect<void, ReadAloudBrowserFailure>;
  /**
   * Run a script in the page.
   *
   * @param script The script.
   * @returns Its run.
   */
  readonly inPage: (script: string) => Effect.Effect<void, ReadAloudBrowserFailure>;
  /**
   * Press a button by its name, as a child does, with the pointer.
   *
   * @param name The button's accessible name.
   * @returns The press.
   */
  readonly press: (name: string) => Effect.Effect<void, ReadAloudBrowserFailure>;
  /**
   * Press several controls in one task, by their names.
   *
   * @param names The names.
   * @returns The presses.
   */
  readonly pressTogether: (
    names: readonly string[],
  ) => Effect.Effect<void, ReadAloudBrowserFailure>;
  /**
   * Wait until the page has seen a recording's media event.
   *
   * @param label The recording's name.
   * @param event The event, such as `ended`.
   * @returns The wait, which fails where the page does not come to it.
   */
  readonly saw: (label: string, event: string) => Effect.Effect<void, ReadAloudBrowserFailure>;
  /**
   * Render a new scene in place of the last.
   *
   * @param scene The scene.
   * @returns The render.
   */
  readonly scene: (scene: Scene) => Effect.Effect<void, ReadAloudBrowserFailure>;
  /**
   * Give the text of the first element a selector finds, empty where it finds none.
   *
   * @param selector The selector.
   * @returns Its text.
   */
  readonly textOf: (selector: string) => Effect.Effect<string, ReadAloudBrowserFailure>;
  /**
   * Wait until exactly the recordings named sound, none for silence.
   *
   * @param names The recordings' names.
   * @returns The wait, which fails where the page does not come to it.
   */
  readonly sounding: (...names: readonly string[]) => Effect.Effect<void, ReadAloudBrowserFailure>;
}

/**
 * The wait Playwright gives a page to come to a state a rule drives it to: none, `0`, Playwright's
 * own spelling of no bound, so a page that never comes to it is the gate's to see hung, never a
 * verdict on how long a loaded machine took.
 */
const unbounded = 0;

/**
 * Wait in the page until exactly the recordings named sound.
 *
 * @param names The names, sorted.
 * @returns Whether they do.
 */
const soundsExactly = (names: readonly string[]): boolean =>
  JSON.stringify(
    window.readAloudPage
      .recordings()
      .filter((each) => each.sounding)
      .map((each) => each.label)
      .toSorted(),
  ) === JSON.stringify(names);

/**
 * Open a page on a scene, under `<StrictMode>` or not, in a browser context of its own, closed with
 * the scope.
 *
 * @param browser Chrome.
 * @param address The page's address.
 * @param scene The first scene.
 * @param strict Whether React renders it in strict mode.
 * @returns The page.
 */
const pageOn = (
  browser: Browser,
  address: string,
  scene: Scene,
  strict: boolean,
): Effect.Effect<Driven, ReadAloudBrowserFailure, Scope.Scope> =>
  Effect.gen(function* opened() {
    const context = yield* Effect.acquireRelease(
      attempt("opened a browser context", () => browser.newContext()),
      (each) => Effect.promise(() => each.close()),
    );
    const page: Page = yield* attempt("opened a page", () => context.newPage());
    const errors: string[] = [];

    page.on("pageerror", (error) => {
      errors.push(String(error));
    });
    page.on("console", (message) => {
      if (message.type() === "error" && !message.text().startsWith("Failed to load resource")) {
        errors.push(message.text());
      }
    });
    yield* attempt("loaded the page", () => page.goto(address));
    yield* attempt("waited for the page's script", () =>
      page.waitForFunction(() => "readAloudPage" in window, undefined, {
        polling: 50,
        timeout: unbounded,
      }),
    );
    yield* attempt("mounted the scene", () =>
      page.evaluate(
        ([first, inStrict]) => {
          window.readAloudPage.mount(first, inStrict);
        },
        [scene, strict] as const,
      ),
    );
    // The page renders its scene into a `main`, an empty scene's too.
    yield* attempt("waited for the scene", () =>
      page.waitForSelector("main", { state: "attached", timeout: unbounded }),
    );

    return {
      account: attempt("read the page's account", async () => ({
        errors: [...errors],
        ...(await page.evaluate(() => ({
          overlaps: window.readAloudPage.overlaps(),
          recordings: window.readAloudPage.recordings(),
          seen: window.readAloudPage.seen(),
        }))),
      })),
      foreign: (src, muted = false) =>
        attempt(`played the host's own ${src}`, () =>
          page.evaluate(([file, quiet]) => window.readAloudPage.foreign(file, quiet), [
            src,
            muted,
          ] as const),
        ),
      inPage: (script) => attempt(`ran ${script} in the page`, () => page.evaluate(script)),
      posted: attempt("read the posted counts", () =>
        page.evaluate(() => window.readAloudPage.posted()),
      ),
      press: (name) =>
        attempt(`pressed ${name}`, () =>
          page.getByRole("button", { exact: true, name }).click({ timeout: unbounded }),
        ),
      pressTogether: (names) =>
        attempt(`pressed ${names.join(" and ")} in one task`, () =>
          page.evaluate((all) => {
            window.readAloudPage.pressTogether(all);
          }, names),
        ),
      saw: (label, event) =>
        attempt(`waited for ${label}'s ${event}`, () =>
          page.waitForFunction(
            ([name, kind]) =>
              window.readAloudPage
                .seen()
                .some((each) => each.label === name && each.event === kind),
            [label, event] as const,
            { polling: 50, timeout: unbounded },
          ),
        ).pipe(Effect.asVoid),
      scene: (next) =>
        attempt("rendered the next scene", () =>
          page.evaluate((each) => {
            window.readAloudPage.scene(each);
          }, next),
        ),
      sounding: (...names) =>
        attempt(
          names.length === 0 ? "waited for silence" : `waited for ${names.join(" and ")} to sound`,
          () =>
            page.waitForFunction(soundsExactly, names.toSorted(), {
              polling: 50,
              timeout: unbounded,
            }),
        ).pipe(Effect.asVoid),
      textOf: (selector) =>
        attempt(`read the text of ${selector}`, () =>
          page.evaluate((query) => document.querySelector(query)?.textContent ?? "", selector),
        ),
    };
  });

/**
 * Chrome and the page's server, held for a suite: each page opens on them.
 */
export interface ReadAloudBrowser {
  /**
   * Open a page on a scene, closed with the scope.
   *
   * @param scene The first scene.
   * @param strict Whether React renders it in strict mode.
   * @returns The page.
   */
  readonly open: (
    scene: Scene,
    strict: boolean,
  ) => Effect.Effect<Driven, ReadAloudBrowserFailure, Scope.Scope>;
}

/**
 * Build the page, serve it and start Chrome, all closed with the scope.
 */
export const readAloudBrowser: Effect.Effect<
  ReadAloudBrowser,
  ReadAloudBrowserFailure,
  Scope.Scope
> = Effect.gen(function* started() {
  const bundle = yield* pageBundle;
  const address = yield* pageServer(bundle);
  const browser = yield* chrome;

  return { open: (scene, strict) => pageOn(browser, address, scene, strict) };
});

/**
 * Wait in the suite for a while, as a child leaves a page alone: the time a held-back recording
 * needs to arrive, so a rule can see that it never sounds.
 *
 * @param milliseconds How long.
 * @returns The wait.
 */
export const settle = (milliseconds: number): Effect.Effect<void> =>
  Effect.sleep(Duration.millis(milliseconds));
