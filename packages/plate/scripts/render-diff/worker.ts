/**
 * One shard of one side of a render diff, run in a child process by `scripts/render-diff.ts`: it
 * loads the plate of one checkout through Vite, as Next's server loads it, opens each document it
 * is given, renders each accepted item in every mode of `modes`, writes each output under the
 * side's directory, and sends back each document's verdict and each output's digest.
 *
 * Every plate function it calls, and React and Effect with them, is the checkout's own, loaded from
 * its tree through {@link apiSource} and handed over by `render-diff/handoff.ts`: nothing of the
 * tree that runs this file renders, so a diff of two checkouts compares their plates alone, under
 * one harness.
 *
 * @module
 */
import { createHash } from "node:crypto";
import { once } from "node:events";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { getHeapStatistics } from "node:v8";
import { Effect, Schema } from "effect";
import type { Exit } from "effect";
import { createViteServer } from "vitest/node";
import type { Configuration } from "#plate/configuration.ts";
import type { ItemRecord } from "#plate/model/record.ts";
import type { Responses } from "#plate/model/values.ts";
import type { Accepted } from "#plate/validate/verdict.ts";
import { provided } from "#scripts/render-diff/handoff.ts";
import type { Api, ItemInput } from "#scripts/render-diff/handoff.ts";
import type { Document } from "#scripts/render-diff/inputs.ts";
import { lined } from "#scripts/render-diff/lined.ts";
import { modes, ShardInputSchema } from "#scripts/render-diff/protocol.ts";
import type {
  Mode,
  Opened,
  Output,
  ShardInput,
  ShardOutput,
} from "#scripts/render-diff/protocol.ts";
import { partialResponses, wrongResponses } from "#scripts/render-diff/responses.ts";

/**
 * The module the worker loads through Vite, served as a file of the checkout's plate,
 * `scripts/render-diff/api.ts`, so its `#plate/*` imports resolve through that plate's
 * `package.json` and its bare imports through that checkout's `node_modules`. It hands every name
 * {@link Api} holds to `renderDiffProvide` (`render-diff/handoff.ts`).
 */
const apiSource = [
  'import { Effect, Exit, Option, Result } from "effect";',
  'import { createElement } from "react";',
  'import { renderToString } from "react-dom/server";',
  'import { begin } from "#plate/begin.ts";',
  'import { acceptedItem, configure, postings, restore, scoreRecord, solution } from "#plate/index.ts";',
  'import { Item } from "#plate/ui/index.ts";',
  'import { Responses } from "#plate/ui/client.ts";',
  'import { openAdmitted } from "#plate/validate/admitted.ts";',
  "globalThis.renderDiffProvide({ Effect, Exit, Item, Option, Responses, Result, acceptedItem, begin, configure, createElement, openAdmitted, postings, renderToString, restore, scoreRecord, solution });",
].join("\n");

/**
 * The instance every item is rendered under, and the seed its configuration and its begun record
 * take, so every output is a function of its item and the plate that renders it.
 */
const fixed = "render-diff";

/**
 * One output's content: the render, or the step that failed and why.
 */
type Outcome =
  | { readonly html: string; readonly kind: "rendered" }
  | { readonly detail: string; readonly kind: "failed"; readonly stage: string };

/**
 * The record an item's attempt starts from: none for an item whose template processing does not
 * run, and the record `begin` started under {@link fixed} for one whose does.
 */
type Start = { readonly kind: "fresh" } | { readonly kind: "begun"; readonly record: ItemRecord };

/**
 * A failure plate returns or throws: a tagged error, or an error.
 */
type Failure = { readonly _tag: string; readonly message: string } | Error;

/**
 * The change handler `<Responses>` is given. A server render runs no event handler, so a call
 * means the harness is not rendering as a server does.
 *
 * @returns Never; it throws.
 * @throws {Error} Always.
 */
const noChange = (): never => {
  throw new Error("render-diff: a response changed during a server render");
};

/**
 * Load a checkout's plate through Vite in SSR, as Next's server loads it: TSX transformed under
 * the checkout's own TypeScript settings, `node_modules` imported natively.
 *
 * Dependency discovery is off: the browser's dependency optimizer would scan every HTML file under
 * the plate (its `work/` scratch among them) and re-run whenever the shared tree's lockfile
 * changes, work a server render never uses, racing the render it runs beside.
 *
 * @param input The shard: its tree and Vite cache.
 * @returns The plate's API, and the server to close once the shard is done.
 */
const load = async (input: ShardInput) => {
  const plate = path.join(input.tree, "packages/qti-pie/packages/plate");
  const api = path.join(plate, "scripts/render-diff/api.ts");
  const server = await createViteServer({
    appType: "custom",
    cacheDir: input.cacheDir,
    configFile: false,
    envFile: false,
    logLevel: "error",
    optimizeDeps: { include: [], noDiscovery: true },
    plugins: [
      {
        load: (id) => (id === api ? apiSource : undefined),
        name: "render-diff-api",
        resolveId: (id) => (id === api ? api : undefined),
      },
    ],
    root: plate,
    server: { hmr: false, middlewareMode: true, watch: null, ws: false },
  });

  await server.ssrLoadModule(api);

  return { api: await provided, server };
};

/**
 * Give a failure's text, its tag or name and its message, with the checkout's path replaced by
 * `<tree>`, so the two sides of a diff write one failure alike.
 *
 * @param failure What plate returned or threw.
 * @param tree The checkout's root.
 * @returns The text.
 */
const textOf = (failure: Failure, tree: string): string =>
  `${"_tag" in failure ? failure._tag : failure.name}: ${failure.message}`.replaceAll(
    tree,
    "<tree>",
  );

/**
 * Render one element to HTML, keeping what rendering throws as the outcome.
 *
 * @param api The checkout's plate.
 * @param render The render.
 * @param tree The checkout's root, which a failure's text leaves out.
 * @returns The render, or the failure at stage `render`.
 */
const rendered = (api: Api, render: () => string, tree: string): Outcome => {
  const result = api.Result.try({
    catch: (error): Outcome => ({
      detail: error instanceof Error ? textOf(error, tree) : String(error),
      kind: "failed",
      stage: "render",
    }),
    try: (): Outcome => ({ html: render(), kind: "rendered" }),
  });

  return api.Result.isSuccess(result) ? result.success : result.failure;
};

/**
 * Begin an item's record when its template processing runs, under {@link fixed}, the record
 * as `begin` gives it.
 *
 * @param api The checkout's plate.
 * @param accepted The item.
 * @returns The start, or the failure of `begin`.
 */
const startOf = (api: Api, accepted: Accepted) =>
  accepted.item.templateProcessing.kind === "runs"
    ? api.Result.map(api.begin(accepted, { instance: fixed, seed: fixed }), (record): Start => ({
        kind: "begun",
        record,
      }))
    : api.Result.succeed<Start>({ kind: "fresh" });

/**
 * Render one accepted item in every mode.
 *
 * @param api The checkout's plate.
 * @param tree The checkout's root.
 * @param configuration The item's package's configuration.
 * @param accepted The item.
 * @param xml The item's XML, which the wrong responses draw identifiers from.
 * @returns Each mode's outcome; `review-partial` and `review-wrong` left out when no such response
 *   is made.
 */
const outcomesOf = (
  api: Api,
  tree: string,
  configuration: Configuration,
  accepted: Accepted,
  xml: string,
): ReadonlyMap<Mode, Outcome> => {
  const { Result, createElement: element, renderToString: render } = api;
  const failed = (stage: string, failure: Failure): Outcome => ({
    detail: textOf(failure, tree),
    kind: "failed",
    stage,
  });
  const item = (props: Omit<ItemInput, "configuration" | "instance" | "item">) =>
    element(api.Item, { ...props, configuration, instance: fixed, item: accepted });
  const begun = startOf(api, accepted);

  if (Result.isFailure(begun)) {
    const outcome = failed("begin", begun.failure);

    return new Map(modes.map((mode) => [mode, outcome]));
  }

  const start = begun.success;
  const record = start.kind === "begun" ? start.record : undefined;
  const correct = api.solution(accepted, record);
  const reviewed = (responses: Responses, marked: boolean): Outcome => {
    const stored = (
      start.kind === "begun"
        ? Result.succeed(start.record)
        : api.begin(accepted, { instance: fixed, seed: fixed })
    ).pipe(Result.flatMap((before) => api.scoreRecord(accepted, responses, before)));
    if (Result.isFailure(stored)) {
      return failed("score", stored.failure);
    }

    const restored = api.restore(accepted, stored.success);
    if (Result.isFailure(restored)) {
      return failed("restore", restored.failure);
    }

    const shown = {
      mode: "review",
      record: restored.success.record,
      values: restored.success.values,
    } as const;

    return rendered(
      api,
      () =>
        render(
          marked
            ? item({
                ...shown,
                graded: {
                  marks: { against: api.solution(accepted, shown.record), reveals: "solution" },
                },
              })
            : item(shown),
        ),
      tree,
    );
  };
  const withRecord = (props: Omit<ItemInput, "configuration" | "instance" | "item" | "record">) =>
    record === undefined ? item(props) : item({ ...props, record });
  const partial = partialResponses(correct);
  const wrong = wrongResponses(xml, correct);
  const outcomes: readonly (readonly [Mode, () => Outcome])[] = [
    [
      "answering",
      () =>
        rendered(
          api,
          () =>
            render(
              element(api.Responses, {
                children: withRecord({ mode: "answering" }),
                onChange: noChange,
                value: api.postings(accepted, fixed, record).flatMap((posting) => posting.start),
              }),
            ),
          tree,
        ),
    ],
    ["review-correct", () => reviewed(correct, true)],
    ["review-correct-unmarked", () => reviewed(correct, false)],
    ["review-empty", () => reviewed({}, true)],
    ...(Object.keys(partial).length === 0
      ? []
      : [["review-partial", () => reviewed(partial, true)] as const]),
    ...(Object.keys(wrong).length === 0
      ? []
      : [["review-wrong", () => reviewed(wrong, true)] as const]),
    [
      "solution",
      () => rendered(api, () => render(withRecord({ mode: "solution", values: correct })), tree),
    ],
  ];

  return new Map(outcomes.map(([mode, outcome]) => [mode, outcome()]));
};

/**
 * The element names of interactions in an item's XML, as {@link Output}'s `kinds` gives them.
 */
const interactionElement = /<qti-(?<kind>[a-z-]+?)-interaction[\s/>]/gu;

/**
 * Give the interaction kinds an item's XML names.
 *
 * @param xml The item's XML.
 * @returns The kinds, sorted, or `none`.
 */
const kindsOf = (xml: string): readonly string[] => {
  const kinds = new Set(
    [...xml.matchAll(interactionElement)].flatMap((match) => {
      const kind = match.groups?.["kind"];

      return kind === undefined ? [] : [kind];
    }),
  );

  return kinds.size === 0 ? ["none"] : [...kinds].toSorted();
};

/**
 * Give an output's file content and digest: a render broken into lines (`lined`), its digest
 * taken of the render as rendered; a failure as one line naming its stage.
 *
 * @param outcome The output.
 * @returns The file's text and the digest.
 */
const written = (outcome: Outcome) => {
  const text =
    outcome.kind === "rendered"
      ? outcome.html
      : `render-diff: ${outcome.stage} failed: ${outcome.detail}\n`;

  return {
    digest: createHash("sha256").update(`${outcome.kind}\n${text}`).digest("hex"),
    text: outcome.kind === "rendered" ? lined(text) : text,
  };
};

/**
 * Write one document's outputs under the side's directory.
 *
 * @param input The shard, whose `out` is the side's directory.
 * @param document The document.
 * @param kinds The interaction kinds its XML names.
 * @param outcomes Each mode's outcome.
 * @returns The outputs written, in {@link modes}' order.
 */
const writeOutputs = async (
  input: ShardInput,
  document: Document,
  kinds: readonly string[],
  outcomes: ReadonlyMap<Mode, Outcome>,
): Promise<readonly Output[]> => {
  await mkdir(path.join(input.out, document.source, path.dirname(document.name)), {
    recursive: true,
  });

  return await Promise.all(
    modes.flatMap((mode) => {
      const outcome = outcomes.get(mode);
      if (outcome === undefined) {
        return [];
      }

      const { digest, text } = written(outcome);
      const file = `${document.source}/${document.name}.${mode}.html`;
      const output: Output = { digest, kinds, mode, path: file, source: document.source };

      return [writeFile(path.join(input.out, file), text).then(() => output)];
    }),
  );
};

/**
 * Give the configuration of one package: every file of it addressed at `/assets/<path>`, each
 * segment percent-encoded, as plate's sweeps address a package's files, and the fixed seed.
 *
 * @param api The checkout's plate.
 * @param files The package's files, by path from its root.
 * @returns The configuration, or the failure `configure` gave.
 */
const configurationOf = (
  api: Api,
  files: readonly string[],
): Promise<Exit.Exit<Configuration, Error>> =>
  api.Effect.runPromiseExit(
    api.configure({
      assets: files.map((file) => [
        file,
        `/assets/${file.split("/").map(encodeURIComponent).join("/")}`,
      ]),
      seed: fixed,
      validateResponses: false,
    }),
  );

/**
 * Open one document and, when `openAdmitted` accepts it as an item, render it in every mode and
 * write its outputs.
 *
 * @param input The shard.
 * @param api The checkout's plate.
 * @param configurations Each package's configuration, by package key.
 * @param document The document.
 * @returns Its verdict, and the outputs written for it.
 */
const renderDocument = async (
  input: ShardInput,
  api: Api,
  configurations: ReadonlyMap<string, Exit.Exit<Configuration, Error>>,
  document: Document,
) => {
  const { Exit, Option } = api;
  const bytes = await readFile(document.path);
  const verdict = await api.Effect.runPromiseExit(api.openAdmitted(document.location, bytes));
  const opened: Opened = {
    name: document.name,
    source: document.source,
    verdict: Exit.isSuccess(verdict) ? `${verdict.value.verdict} ${verdict.value.kind}` : "defect",
  };
  const accepted = Exit.isSuccess(verdict) ? api.acceptedItem(verdict.value) : Option.none();
  const configuration = configurations.get(document.package);

  if (Option.isNone(accepted) || configuration === undefined) {
    return { opened, outputs: [] };
  }

  const xml = new TextDecoder().decode(bytes);
  const outcomes = Exit.isSuccess(configuration)
    ? outcomesOf(api, input.tree, configuration.value, accepted.value, xml)
    : new Map(
        modes.map((mode): readonly [Mode, Outcome] => [
          mode,
          { detail: String(configuration.cause), kind: "failed", stage: "configure" },
        ]),
      );

  return { opened, outputs: await writeOutputs(input, document, kindsOf(xml), outcomes) };
};

/**
 * Run one shard: load the checkout's plate, configure each package once, then open and render each
 * document in turn, one at a time, since rendering is synchronous work on this one thread.
 *
 * @param input The shard.
 * @returns Each document's verdict and each output written.
 */
const run = (input: ShardInput) =>
  Effect.gen(function* runShard() {
    const { api, server } = yield* Effect.promise(() => load(input));
    const keys = [...new Set(input.documents.map((document) => document.package))];
    const configurations = new Map(
      yield* Effect.all(
        keys.map((key) =>
          Effect.promise(
            async () => [key, await configurationOf(api, input.packages[key] ?? [])] as const,
          ),
        ),
      ),
    );
    let heap = getHeapStatistics().used_heap_size;
    const documents = yield* Effect.all(
      input.documents.map((document) =>
        Effect.promise(async () => {
          const done = await renderDocument(input, api, configurations, document);
          heap = Math.max(heap, getHeapStatistics().used_heap_size);

          return done;
        }),
      ),
    );

    yield* Effect.promise(() => server.close());

    return {
      heap,
      opened: documents.map((each) => each.opened),
      outputs: documents.flatMap((each) => each.outputs),
    } satisfies ShardOutput;
  });

const received: readonly unknown[] = await once(process, "message");

const output = await Effect.runPromise(
  run(Schema.decodeUnknownSync(ShardInputSchema)(received[0])),
);

process.send?.(output, () => {
  process.disconnect?.();
});
