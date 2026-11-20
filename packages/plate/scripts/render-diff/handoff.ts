/**
 * Where a render diff's worker receives the plate it loads through Vite: `renderDiffProvide`,
 * which the module Vite loads calls, and {@link provided}, which the worker awaits.
 *
 * A checkout's plate crosses from Vite's module graph to the worker through that global's
 * parameter, the one place the harness states that plate's types. The worker imports this module
 * before it loads anything through Vite, which sets the global.
 *
 * @module
 */
import type * as EffectModule from "effect";
import type { createElement, ReactNode } from "react";
import type { renderToString } from "react-dom/server";
import type { begin } from "#plate/begin.ts";
import type { Configuration } from "#plate/configuration.ts";
import type { Entry } from "#plate/form/encoding.ts";
import type * as Core from "#plate/index.ts";
import type { ItemRecord } from "#plate/model/record.ts";
import type { Responses } from "#plate/model/values.ts";
import type { RenderMode } from "#plate/payload.ts";
import type { openAdmitted } from "#plate/validate/admitted.ts";
import type { Accepted } from "#plate/validate/verdict.ts";

/**
 * What `<Item>` is given by the harness: the props it sets. Plate's own props type lives in its
 * UI, which this program does not typecheck, so the harness restates what it passes.
 */
export interface ItemInput {
  readonly configuration: Configuration;
  readonly instance: string;
  readonly item: Accepted;
  readonly mode: RenderMode;
  readonly record?: ItemRecord;
  readonly graded?: {
    readonly marks: { readonly against: Responses; readonly reveals: "own" | "solution" };
  };
  readonly values?: Responses;
}

/**
 * What `<Responses>` is given by the harness: the item, the entries its islands read, and a
 * change no one hears.
 */
interface ResponsesInput {
  readonly children: ReactNode;
  readonly onChange: () => void;
  readonly value: readonly Entry[];
}

/**
 * A checkout's plate, React and Effect, as the module the worker loads through Vite hands them
 * over: each its own checkout's, so a render diff's two sides run their own code.
 */
export interface Api {
  readonly Effect: typeof EffectModule.Effect;
  readonly Exit: typeof EffectModule.Exit;
  readonly Item: (props: ItemInput) => ReactNode;
  readonly Option: typeof EffectModule.Option;
  readonly Responses: (props: ResponsesInput) => ReactNode;
  readonly Result: typeof EffectModule.Result;
  readonly acceptedItem: typeof Core.acceptedItem;
  readonly begin: typeof begin;
  readonly configure: typeof Core.configure;
  readonly createElement: typeof createElement;
  readonly openAdmitted: typeof openAdmitted;
  readonly postings: typeof Core.postings;
  readonly renderToString: typeof renderToString;
  readonly restore: typeof Core.restore;
  readonly scoreRecord: typeof Core.scoreRecord;
  readonly solution: typeof Core.solution;
}

declare global {
  /**
   * The handover the module a render diff's worker loads through Vite calls with its checkout's
   * {@link Api}. Vite runs every file it loads, this one included, as its own instance, so the one
   * thing the worker and that module share is the isolate's global object.
   */
  var renderDiffProvide: ((api: Api) => void) | undefined;
}

/**
 * The handover of one worker's {@link Api}, settled once the module it loads runs.
 */
const handover = Promise.withResolvers<Api>();

globalThis.renderDiffProvide = handover.resolve;

/**
 * The API the loaded module provides, once it has run.
 */
export const provided: Promise<Api> = handover.promise;
