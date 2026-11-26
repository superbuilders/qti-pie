/**
 * The page of plate's hydration harness (`#specimen/ui/hydrated.ts`), as headless Chrome runs it:
 * {@link hydrate} reads the page's data, the trees the server rendered, each an item's, and the
 * responses each attempt starts from, all wired (`#specimen/ui/wire.ts`), takes the islands from
 * the modules the page's document loaded, the very files plate's server shell loads, and hydrates
 * the server's markup as a host hydrates its items: each item shown in a `section` of its own,
 * under an `<Activity>` the host may hide, with `<Responses>` around it, under `<StrictMode>` where
 * the harness asks. The host then moves between items as the suite asks
 * ({@link HydratedPage.scene}), rendering each item's tree, wired from the start, in place of
 * another's, or in a frame of the page the host renders it into, another page this page's copy of
 * plate serves. Every change an island writes is kept, wired, in {@link HydratedPage} on `window`,
 * with every error React reports while hydrating and after, for the harness to read.
 *
 * Test support for plate's UI suite under `src/ui/`; it runs in the browser alone, served by the
 * harness's Vite server, which turns its TypeScript and plate's into the browser's JavaScript.
 *
 * @module
 */
import { Schema } from "effect";
import { Activity, Fragment, StrictMode, createElement, useEffect, useState } from "react";
import type { ElementType, ReactNode } from "react";
import { createPortal } from "react-dom";
import { hydrateRoot } from "react-dom/client";
import { heldOf, Responses } from "@qti-pie/plate/ui/client";
import type { Held } from "@qti-pie/plate/ui/client";
import { PostedResponses } from "@qti-pie/plate/codec";
import { WireSchema, treeFromWire } from "#specimen/ui/wire.ts";

/**
 * One item as the host shows it in a scene: the item, by its key in the page's data; the host's
 * own key for the place it stands in, which a host that keeps one place across items gives two
 * items alike, so React keeps that place's state; whether the host hides it; and whether it stands
 * in a frame the host renders it into, a page of its own that this page's copy of plate serves. No
 * item of the first scene stands in a frame, which the server's markup cannot hold.
 */
export const SceneEntry = Schema.Struct({
  frame: Schema.Boolean,
  hidden: Schema.Boolean,
  key: Schema.String,
  slot: Schema.String,
});

/**
 * A scene: the items the host shows, in order.
 */
export const SceneSchema = Schema.Array(SceneEntry);

/**
 * A scene, as the page reads it.
 */
export type Scene = typeof SceneSchema.Type;

/**
 * What the page keeps for the harness, on `window.hydrated`: whether React has hydrated the page;
 * every change the islands of its first item wrote, the responses after it, in order, as a host
 * posts them (plate's `PostedResponses`); each item's responses as they stand, by its key; every
 * error React reported, as text; and the host's move to another scene, once it has hydrated.
 */
export interface HydratedPage {
  readonly changes: (typeof PostedResponses)["Encoded"][];
  readonly errors: string[];
  hydrated: boolean;
  readonly posted: Record<string, (typeof PostedResponses)["Encoded"]>;
  scene: ((next: Scene) => void) | undefined;
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
 * The page's data, as the harness writes it into the page's `#hydrated-data` script: each item's
 * tree, wired by the harness's `toWire`, and the responses its attempt starts from, as a host posts
 * them, by its key; the first scene; and whether React renders under `<StrictMode>`.
 */
const PageData = Schema.Struct({
  scene: SceneSchema,
  shows: Schema.Record(
    Schema.String,
    Schema.Struct({ responses: PostedResponses, tree: WireSchema }),
  ),
  strict: Schema.Boolean,
});

/**
 * Write a value React reported as text.
 *
 * @param cause The value.
 * @returns Its stack, else its text.
 */
const reported = (cause: unknown): string =>
  Error.isError(cause) ? (cause.stack ?? cause.message) : String(cause);

/**
 * A frame of the page an item stands in: an `iframe` of an empty document of its own, the item's
 * `section` rendered into its body once it has loaded, the account following its media first.
 *
 * @param props The item's key and its section's content.
 * @param props.children The section's content.
 * @param props.show The item's key.
 * @returns The frame, and the item in it.
 */
const Frame = ({ children, show }: { readonly children: ReactNode; readonly show: string }) => {
  const [body, setBody] = useState<HTMLElement | null>(null);

  return createElement(
    Fragment,
    null,
    createElement("iframe", {
      "data-frame": show,
      onLoad: (event: { readonly currentTarget: HTMLIFrameElement }) => {
        const { contentDocument } = event.currentTarget;

        if (contentDocument !== null) {
          window.account?.adopt(contentDocument);
          setBody(contentDocument.body);
        }
      },
      srcDoc:
        '<!doctype html><html lang="en"><head><meta charset="utf-8"></head><body></body></html>',
      title: show,
    }),
    body === null
      ? null
      : createPortal(createElement("section", { "data-show": show }, children), body),
  );
};

/**
 * Hydrate the page: read its data, name every island the loaded modules export as the wire names
 * it, its module's file and its export, and hydrate the server's markup in `#hydrated-root` as the
 * host renders its first scene, keeping every change and error on `window.hydrated`.
 *
 * @param modules The modules whose islands the trees hold, each by its file under plate's `src/`,
 *   as the page's document loaded them. An island a tree names is an export of one of them that
 *   stood as an element's type in the server's tree, a component; the wire names no other export.
 */
export const hydrate = (
  modules: Readonly<Record<string, Readonly<Record<string, ElementType>>>>,
): void => {
  const page: HydratedPage = {
    changes: [],
    errors: [],
    hydrated: false,
    posted: {},
    scene: undefined,
  };

  window.hydrated = page;

  const data = Schema.decodeUnknownSync(PageData)(
    JSON.parse(document.querySelector("#hydrated-data")?.textContent ?? "null"),
  );
  const islands = new Map(
    Object.entries(modules).flatMap(([file, exported]) =>
      Object.entries(exported).map(([name, value]) => [`${file}#${name}`, value] as const),
    ),
  );
  const trees = new Map(
    Object.entries(data.shows).map(([key, show]) => [key, treeFromWire(show.tree, islands)]),
  );
  const [first] = data.scene;

  /**
   * Keep an item's responses after a change one of its islands wrote.
   *
   * @param key The item's key.
   * @param next Its responses.
   */
  const keep = (key: string, next: Held): void => {
    const posted = Schema.encodeSync(PostedResponses)(next.responses);

    page.posted[key] = posted;

    if (key === first?.key) {
      page.changes.push(posted);
    }
  };

  /**
   * The host: each item of the scene in a `section` of its own, or a frame's, under an
   * `<Activity>` it may hide, with `<Responses>` around it, holding the state an island's change
   * writes.
   *
   * @returns The scene.
   */
  const Host = () => {
    const [scene, setScene] = useState(data.scene);
    const [held, setHeld] = useState<ReadonlyMap<string, Held>>(
      () => new Map(Object.entries(data.shows).map(([key, show]) => [key, heldOf(show.responses)])),
    );

    useEffect(() => {
      page.scene = setScene;
      page.hydrated = true;
    }, []);

    return createElement(
      "main",
      null,
      scene.map(({ frame, hidden, key, slot }): ReactNode => {
        const shown = createElement(Activity, {
          children: createElement(Responses, {
            children: trees.get(key),
            onChange: (next: Held) => {
              keep(key, next);
              setHeld((before) => new Map([...before, [key, next]]));
            },
            value: held.get(key) ?? heldOf(data.shows[key]?.responses ?? {}),
          }),
          mode: hidden ? "hidden" : "visible",
        });

        return frame
          ? createElement(Frame, { children: shown, key: slot, show: key })
          : createElement("section", { "data-show": key, key: slot }, shown);
      }),
    );
  };

  const root = document.querySelector("#hydrated-root");

  if (root === null) {
    page.errors.push("The page holds no #hydrated-root.");

    return;
  }

  for (const [key, show] of Object.entries(data.shows)) {
    page.posted[key] = Schema.encodeSync(PostedResponses)(show.responses);
  }

  const host = createElement(Host);

  hydrateRoot(root, data.strict ? createElement(StrictMode, null, host) : host, {
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
