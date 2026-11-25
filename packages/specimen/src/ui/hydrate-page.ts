/**
 * The page of plate's hydration harness (`#specimen/ui/hydrated.ts`), as headless Chrome runs it:
 * {@link hydrate} reads the page's data, the tree the server rendered and the responses the attempt
 * starts from, both wired (`#specimen/ui/wire.ts`), takes the islands from the modules the page's
 * document loaded, the very files plate's server shell loads, and hydrates the server's markup with
 * `<Responses>` around the tree, as a host hydrates an item. Every change an island writes is kept,
 * wired, in {@link HydratedPage} on `window`, with every error React reports while hydrating and
 * after, for the harness to read.
 *
 * Test support for plate's UI suite under `src/ui/`; it runs in the browser alone, served by the
 * harness's Vite server, which turns its TypeScript and plate's into the browser's JavaScript.
 *
 * @module
 */
import { Schema } from "effect";
import { createElement, useCallback, useEffect, useState } from "react";
import type { ElementType } from "react";
import { hydrateRoot } from "react-dom/client";
import { heldOf, Responses } from "@qti-pie/plate/ui/client";
import type { Held } from "@qti-pie/plate/ui/client";
import { PostedResponses } from "@qti-pie/plate/codec";
import { WireSchema, treeFromWire } from "#specimen/ui/wire.ts";

/**
 * What the page keeps for the harness, on `window.hydrated`: whether React has hydrated the tree,
 * every change an island wrote, the responses after it, in order, as a host posts them (plate's
 * `PostedResponses`), and every error React reported, as text.
 */
export interface HydratedPage {
  readonly changes: (typeof PostedResponses)["Encoded"][];
  readonly errors: string[];
  hydrated: boolean;
}

declare global {
  interface Window {
    /**
     * What the harness's page keeps, once {@link hydrate} has run.
     */
    hydrated?: HydratedPage;
  }
}

/**
 * The page's data, as the harness writes it into the page's `#hydrated-data` script: the tree,
 * wired by the harness's `toWire`, and the responses the attempt starts from, as a host posts them.
 */
const PageData = Schema.Struct({ responses: PostedResponses, tree: WireSchema });

/**
 * Write a value React reported as text.
 *
 * @param cause The value.
 * @returns Its stack, else its text.
 */
const reported = (cause: unknown): string =>
  cause instanceof Error ? (cause.stack ?? cause.message) : String(cause);

/**
 * Hydrate the page: read its data, name every island the loaded modules export as the wire names
 * it, its module's file and its export, and hydrate the server's markup in `#hydrated-root` with
 * `<Responses>` around the tree, keeping every change and error on `window.hydrated`.
 *
 * @param modules The modules whose islands the tree holds, each by its file under plate's `src/`,
 *   as the page's document loaded them. An island the tree names is an export of one of them that
 *   stood as an element's type in the server's tree, a component; the wire names no other export.
 */
export const hydrate = (
  modules: Readonly<Record<string, Readonly<Record<string, ElementType>>>>,
): void => {
  const page: HydratedPage = { changes: [], errors: [], hydrated: false };

  window.hydrated = page;

  const data = Schema.decodeUnknownSync(PageData)(
    JSON.parse(document.querySelector("#hydrated-data")?.textContent ?? "null"),
  );
  const islands = new Map(
    Object.entries(modules).flatMap(([file, exported]) =>
      Object.entries(exported).map(([name, value]) => [`${file}#${name}`, value] as const),
    ),
  );
  const tree = treeFromWire(data.tree, islands);
  const start = data.responses;

  /**
   * The host: `<Responses>` around the tree, holding the state an island's change writes, each
   * change kept on the page.
   *
   * @returns The tree, its responses held.
   */
  const Host = () => {
    const [held, setHeld] = useState(() => heldOf(start));
    const onChange = useCallback((next: Held) => {
      setHeld(next);
      page.changes.push(Schema.encodeSync(PostedResponses)(next.responses));
    }, []);

    useEffect(() => {
      page.hydrated = true;
    }, []);

    return createElement(Responses, { children: tree, onChange, value: held });
  };

  const root = document.querySelector("#hydrated-root");

  if (root === null) {
    page.errors.push("The page holds no #hydrated-root.");

    return;
  }

  hydrateRoot(root, createElement(Host), {
    onCaughtError: (cause) => {
      page.errors.push(`caught: ${reported(cause)}`);
    },
    onRecoverableError: (cause) => {
      page.errors.push(`recoverable: ${reported(cause)}`);
    },
    onUncaughtError: (cause) => {
      page.errors.push(`uncaught: ${reported(cause)}`);
    },
  });
};
