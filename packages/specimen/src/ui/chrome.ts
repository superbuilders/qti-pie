/**
 * Chrome for the suites, the one module that reaches it: the machine's Google Chrome, through
 * Playwright's `chrome` channel, headless, and every context and page opened in it with
 * Playwright's timeouts at 0, so no verdict rests on how long a load, a navigation or a wait took
 * under the machine's load. A page that never loads is a hang, which the case's work guard and the
 * gate's progress watch judge (2026-11-26: eight harnesses each launched Chrome, five kept
 * Playwright's 30 s default, and `page.goto` timed out at load 300). Every portable custom
 * interaction a harness hosts loads its modules with no wait either ({@link unboundedModuleWait}).
 * The lint holds every other module to this one (oxlint.config.ts, `no-restricted-properties` on
 * `chromium.launch`, `newContext` and `newPage`).
 */
import { tmpdir } from "node:os";
import { Config, Effect } from "effect";
import type { Scope } from "effect";
import { chromium } from "playwright-core";
import type { Browser, BrowserContext, BrowserContextOptions, Page } from "playwright-core";

/**
 * The folder Chrome keeps its process singleton's socket in: the session's runtime folder, whose
 * path is short enough for a socket; the system's temporary folder where the session has none.
 */
const runtimeFolder = Config.String("XDG_RUNTIME_DIR").pipe(Config.withDefault(tmpdir()));

/**
 * The module wait every hosted portable custom interaction is given, for its primary and its
 * fallback modules: none, QTI's 0. A module that never defines itself is a hang the case's guards
 * judge, never a verdict at 7 seconds.
 */
export const unboundedModuleWait = { fallback: 0, primary: 0 } as const;

/**
 * What a harness reaches Chrome through, its own failure for each step that fails.
 */
export interface Chrome<E> {
  /**
   * Chrome, closed with its scope.
   */
  readonly browser: Effect.Effect<Browser, E, Scope.Scope>;
  /**
   * A browser context in `browser` with `options`, its timeouts at 0, closed with its scope.
   */
  readonly context: (
    browser: Browser,
    options: BrowserContextOptions,
  ) => Effect.Effect<BrowserContext, E, Scope.Scope>;
  /**
   * A page in `context`, its timeouts the context's.
   */
  readonly page: (context: BrowserContext) => Effect.Effect<Page, E>;
  /**
   * A page in a context of its own in `browser` with `options`, closed with its scope.
   */
  readonly pageOf: (
    browser: Browser,
    options: BrowserContextOptions,
  ) => Effect.Effect<Page, E, Scope.Scope>;
}

/**
 * Chrome for a harness whose failures `fail` makes, from the step that failed and its cause.
 *
 * @param fail The harness's failure for a step of Chrome's.
 * @returns How the harness reaches Chrome.
 */
export const chromeFor = <E>(fail: (step: string, cause: unknown) => E): Chrome<E> => {
  const attempt = <A>(step: string, run: () => Promise<A>): Effect.Effect<A, E> =>
    Effect.tryPromise({ catch: (cause) => fail(step, cause), try: run });
  const context = (
    browser: Browser,
    options: BrowserContextOptions,
  ): Effect.Effect<BrowserContext, E, Scope.Scope> =>
    Effect.acquireRelease(
      attempt("opened a browser context", async () => {
        const opened = await browser.newContext(options);

        opened.setDefaultTimeout(0);
        opened.setDefaultNavigationTimeout(0);

        return opened;
      }),
      (opened) => Effect.promise(() => opened.close()),
    );
  const page = (within: BrowserContext): Effect.Effect<Page, E> =>
    attempt("opened a page", () => within.newPage());

  return {
    browser: Effect.acquireRelease(
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
    ),
    context,
    page,
    pageOf: (browser, options) => Effect.flatMap(context(browser, options), page),
  };
};
