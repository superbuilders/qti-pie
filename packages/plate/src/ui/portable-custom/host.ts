/**
 * The page side of a Portable Custom Interaction's (Q-16) host: {@link hostFrame} runs one PCI in
 * its own sandboxed frame inside the island's stage, speaks the protocol of
 * `#plate/ui/portable-custom/protocol.ts` with the frame boot
 * (`#plate/ui/portable-custom/frame-boot.ts`), and tells the island what the PCI did. It holds no
 * React: the island (`#plate/ui/portable-custom/portable-custom.tsx`) calls it from an effect and
 * runs its teardown as the effect's cleanup.
 *
 * - **The frame.** One `iframe` per PCI, `sandbox="allow-scripts"` and never `allow-same-origin`, so
 *   its document's origin is opaque and the PCI's code reaches neither the page nor the host's
 *   origin, and one loading context per PCI holds its own AMD modules. Its `src` is the host's
 *   frame page with the frame's nonce as the fragment. It is `loading="lazy"`, so a frame far below
 *   the fold loads when the child nears it, and `referrerpolicy="no-referrer"`, so the PCI cannot
 *   read the page's address. Its `title` names it (WCAG 4.1.2), and its height is its `height`
 *   attribute, from the frame's own `ResizeObserver`, never an inline style.
 * - **Trust.** A message is acted on only when its `event.source` is this frame's `contentWindow` and
 *   it carries this frame's nonce ({@link checkedOf}); every message posted carries the nonce.
 * - **The type identifier.** The registered factory is chosen on the page by `factoryFor`
 *   (`#plate/pci/type-identifier.ts`), the rule's one source.
 * - **The response.** Each change the frame relays is read by the JSON binding against the response's
 *   declaration (`fromPciJson` in `#plate/pci/json.ts`) and handed to the island to hold as the
 *   response's value; the PCI is bound to the value the response holds when it is instantiated.
 * - **Teardown.** The island asks the PCI to complete, `oncompleted()` among it, and the frame is
 *   removed once the frame says it has, or after {@link completionGraceMs}. When React removes the
 *   island's markup with the frame inside, the frame boot completes the PCI on its own `pagehide`.
 * - **Focus.** Mounting moves no focus. A frame that fails is removed, and when it held the focus the
 *   island is told, so it can take the focus rather than leave it on the page's body (WCAG 2.4.3).
 *   Tab moves into a running frame and out of it as the browser moves it; a PCI that keeps the
 *   focus inside its own frame is beyond the host's reach.
 *
 * @module
 * @see https://html.spec.whatwg.org/multipage/iframe-embed-object.html#the-iframe-element
 */
import { Brand } from "effect";
import type { Result } from "effect";
import type { FrameToPage, PciFrameFallback, PciFrameRoute } from "#plate/pci/frame-protocol.ts";
import { fromPciJson } from "#plate/pci/json.ts";
import type { ResponseValue } from "#plate/model/values.ts";
import type { PciJson, PciJsonRefused } from "#plate/pci/json.ts";
import { factoryFor } from "#plate/pci/type-identifier.ts";
import type { FactoryChoice } from "#plate/pci/type-identifier.ts";
import type {
  BoundConfiguration,
  Checked,
  FrameNonce,
  PageLoad,
  PageMessage,
} from "#plate/ui/portable-custom/protocol.ts";
import type { PciDeclared } from "#plate/ui/portable-custom/response.ts";

/**
 * Where the PCI runs, as the host told the server: the URL of its frame page, the routes of the
 * modules the frame loads, in order, and the entry module's id when the PCI names one. Each URL
 * is absolute or relative to the page's base URL; {@link hostFrame} is handed the frame page's
 * URL parsed.
 */
export interface FrameFacts {
  readonly entry?: string;
  readonly loader: string;
  readonly routes: readonly PciFrameRoute[];
}

/**
 * One PCI to host: where it runs, what it is, what its frame shows, and how its response is typed.
 */
export interface HostedPci {
  /**
   * The configuration it is handed, less `boundTo`, which {@link FrameEvents.bound} gives when
   * the frame is instantiated.
   */
  readonly configuration: Omit<BoundConfiguration, "boundTo">;
  readonly facts: FrameFacts;
  /**
   * The language and direction it stands in, each empty when nothing names one.
   */
  readonly placed: { readonly dir: string; readonly lang: string };
  readonly posted: PciDeclared;
  /**
   * The HTML of the markup, and of each `template`'s content, as the page rendered them.
   */
  readonly source: { readonly markup: string; readonly templates: readonly string[] };
  /**
   * The frame's name, its `title`.
   */
  readonly title: string;
  /**
   * The element's `custom-interaction-type-identifier`, as written.
   */
  readonly typeIdentifier: string;
}

/**
 * What {@link hostFrame} tells the island, each when it happens.
 */
export interface FrameEvents {
  /**
   * Give the value the PCI is bound to, as the response holds it now: read when the frame is
   * instantiated.
   *
   * @returns The response's value in the Appendix C JSON binding.
   */
  readonly bound: () => PciJson;
  /**
   * Hear that the frame cannot serve the PCI, and that it is gone.
   *
   * @param reason One English sentence for the host's log, never shown to the child.
   * @param focused Whether the frame held the focus when it went.
   */
  readonly failed: (reason: string, focused: boolean) => void;
  /**
   * Hear that the PCI is rendered in its frame, and how its factory was chosen.
   *
   * @param choice `exact` or `only`, by `factoryFor`.
   */
  readonly ready: (choice: Exclude<FactoryChoice, { readonly kind: "none" }>) => void;
  /**
   * Hear the PCI's response as the value its declaration types, each time the frame relays a
   * change, or why its JSON does not fit the declaration.
   *
   * @param value The value, or the refusal.
   */
  readonly response: (value: Result.Result<ResponseValue, PciJsonRefused>) => void;
}

/**
 * How long the teardown waits for the frame's `completed` reply before it removes the frame
 * anyway, in milliseconds: long enough for a PCI's `oncompleted` to run, short enough that a frame
 * whose script hangs does not stay.
 */
const completionGraceMs = 3000;

/**
 * A type with every property writable: an object built one optional key at a time, which then
 * stands as the read-only type.
 *
 * @template T The type.
 */
type Building<T> = { -readonly [K in keyof T]: T[K] };

/**
 * The part marker the frame carries.
 */
const framePart = "plate-portable-custom-frame";

/**
 * Brand a fresh UUID as a frame's nonce: Effect's unchecked constructor, used by
 * {@link drawNonce} alone.
 */
const nonceOf = Brand.nominal<FrameNonce>();

/**
 * Draw a frame's nonce: `crypto.randomUUID()`'s text, a fresh random string for each frame.
 *
 * @returns The nonce.
 */
const drawNonce = (): FrameNonce => nonceOf(crypto.randomUUID());

/**
 * An object whose keys are read one by one at this boundary: a frame's message before a predicate
 * has read it.
 */
interface Fields {
  readonly [key: string]: unknown;
}

/**
 * Report whether a value is an object, so its keys can be read.
 *
 * @param node The value.
 * @returns Whether it is.
 */
const isObject = (node: unknown): node is Fields => typeof node === "object" && node !== null;

/**
 * Report whether a value is a string.
 *
 * @param node The value.
 * @returns Whether it is.
 */
const isString = (node: unknown): node is string => typeof node === "string";

/**
 * Report whether a value is a finite number.
 *
 * @param node The value.
 * @returns Whether it is.
 */
const isNumber = (node: unknown): node is number =>
  typeof node === "number" && Number.isFinite(node);

/**
 * Report whether a value is a message the frame sends, by its kind and the fields the island
 * reads of it.
 *
 * @param node The value.
 * @returns Whether it is a {@link FrameToPage}.
 */
const isFrameMessage = (node: unknown): node is FrameToPage => {
  if (!isObject(node) || !isString(node["nonce"])) {
    return false;
  }

  switch (node["kind"]) {
    case "booted":
    case "completed":
    case "done":
    case "ready": {
      return true;
    }
    case "changed": {
      return isString(node["responseIdentifier"]);
    }
    case "failed": {
      return isString(node["reason"]);
    }
    case "height": {
      return isNumber(node["pixels"]);
    }
    case "registered": {
      const listed = node["typeIdentifiers"];

      return Array.isArray(listed) && listed.every((each) => isString(each));
    }
    default: {
      return false;
    }
  }
};

/**
 * Report whether a message event is one this frame sent: from its own `contentWindow`, a message
 * of the protocol, carrying its nonce. The one maker of a {@link Checked} message.
 *
 * @param event The message event.
 * @param frame The frame.
 * @param nonce The frame's nonce.
 * @param data The event's data.
 * @returns Whether the island may act on it.
 */
const checkedOf = (
  event: MessageEvent,
  frame: HTMLIFrameElement,
  nonce: FrameNonce,
  data: unknown,
): data is Checked<FrameToPage> =>
  event.source !== null &&
  event.source === frame.contentWindow &&
  isFrameMessage(data) &&
  data.nonce === nonce;

/**
 * Make a URL absolute against the page's base URL.
 *
 * @param url The URL as the host wrote it.
 * @returns The absolute URL, or `undefined` when the text is no URL.
 */
const absolute = (url: string): string | undefined => URL.parse(url, document.baseURI)?.href;

/**
 * Make a fallback's location absolute, keeping the primary's wait before it.
 *
 * @param fallback The fallback as the host wrote it.
 * @returns The fallback, or `undefined` when its location is no URL.
 */
const absoluteFallback = (fallback: PciFrameFallback): PciFrameFallback | undefined => {
  const location = absolute(fallback.location);

  return location === undefined ? undefined : { ...fallback, location };
};

/**
 * Make a route's locations absolute, so the frame, whose base is its own page, loads what the
 * host meant. A location that is no URL is dropped, as if the module had none there: a fallback
 * dropped takes the primary's wait with it, so the primary then waits for its own script (R3 of
 * `#plate/pci/resolve.ts`).
 *
 * @param route The route as the host wrote it.
 * @returns The route with absolute locations.
 */
const absoluteRoute = (route: PciFrameRoute): PciFrameRoute => {
  const primary = route.primary === undefined ? undefined : absolute(route.primary);
  const fallback = route.fallback === undefined ? undefined : absoluteFallback(route.fallback);
  const made: Building<PciFrameRoute> = { id: route.id };

  if (primary !== undefined) {
    made.primary = primary;
  }

  if (fallback !== undefined) {
    made.fallback = fallback;
  }

  return made;
};

/**
 * Host one PCI in its own sandboxed frame, appended to `stage`: build the frame, accept its
 * messages by source and nonce, send it the PCI's content and routes once it has booted, choose
 * the factory once its modules registered, bind the response, follow its height and tell the
 * island what the PCI does; and give the teardown, which asks the PCI to complete and removes the
 * frame once it has, or after {@link completionGraceMs}.
 *
 * @param stage The element the frame stands in, which holds nothing else.
 * @param page The frame page's URL, absolute: the `loader` of the PCI's facts.
 * @param pci What the PCI is and where it runs.
 * @param events What the island hears.
 * @returns The teardown.
 */
export const hostFrame = (
  stage: HTMLElement,
  page: URL,
  pci: HostedPci,
  events: FrameEvents,
): (() => void) => {
  const nonce = drawNonce();
  const frame = stage.ownerDocument.createElement("iframe");
  const listening = new AbortController();
  const source = new URL(page);
  let chosen: Exclude<FactoryChoice, { readonly kind: "none" }> | undefined;
  let closing = false;
  let removed = false;
  let grace: ReturnType<typeof setTimeout> | undefined;

  /**
   * Post a message to the frame. The target origin is `"*"`: the frame's origin is opaque, so
   * nothing else matches.
   *
   * @param message The message, carrying the nonce.
   */
  const tell = (message: PageMessage): void => {
    frame.contentWindow?.postMessage(message, "*");
  };

  /**
   * Remove the frame and stop listening, once.
   */
  const remove = (): void => {
    if (removed) {
      return;
    }

    removed = true;
    clearTimeout(grace);
    listening.abort();
    frame.remove();
  };

  /**
   * Give up on the PCI: remove its frame, and tell the island, with whether the frame held the
   * focus.
   *
   * @param reason One English sentence for the host's log.
   */
  const fail = (reason: string): void => {
    const focused = frame.ownerDocument.activeElement === frame;

    remove();
    events.failed(reason, focused);
  };

  /**
   * Choose the factory once the modules registered, and tell the frame to instantiate it with the
   * configuration and the response bound; or give up when none serves.
   *
   * @param typeIdentifiers What the modules registered, in order.
   */
  const choose = (typeIdentifiers: readonly string[]): void => {
    const choice = factoryFor(pci.typeIdentifier, typeIdentifiers);

    if (choice.kind === "none") {
      fail(
        typeIdentifiers.length === 0
          ? "The interaction's modules registered no factory."
          : `No registered factory serves the type identifier "${pci.typeIdentifier}", and ${String(typeIdentifiers.length)} registered, so none is the only one.`,
      );

      return;
    }

    chosen = choice;
    tell({
      configuration: {
        ...pci.configuration,
        boundTo: { [pci.configuration.responseIdentifier]: events.bound() },
      },
      kind: "instantiate",
      nonce,
      state: undefined,
      typeIdentifier: choice.typeIdentifier,
    });
  };

  /**
   * Act on a message that passed the check.
   *
   * @param message The message.
   */
  const accept = (message: Checked<FrameToPage>): void => {
    switch (message.kind) {
      case "booted": {
        const load: Building<PageLoad> = {
          dir: pci.placed.dir,
          kind: "load",
          lang: pci.placed.lang,
          markup: pci.source.markup,
          nonce,
          routes: pci.facts.routes.map(absoluteRoute),
          templates: pci.source.templates,
          title: pci.title,
        };

        if (pci.facts.entry !== undefined) {
          load.entry = pci.facts.entry;
        }

        tell(load);
        break;
      }
      case "registered": {
        choose(message.typeIdentifiers);
        break;
      }
      case "ready": {
        if (chosen !== undefined) {
          events.ready(chosen);
        }

        break;
      }
      case "changed": {
        if (!closing) {
          events.response(fromPciJson(message.value, pci.posted));
        }

        break;
      }
      case "completed": {
        if (closing) {
          remove();
        }

        break;
      }
      case "height": {
        frame.height = String(Math.max(0, Math.ceil(message.pixels)));
        break;
      }
      case "failed": {
        fail(message.reason);
        break;
      }
      case "done": {
        break;
      }
    }
  };

  source.hash = nonce;
  frame.dataset["slot"] = framePart;
  frame.loading = "lazy";
  frame.referrerPolicy = "no-referrer";
  frame.title = pci.title;
  frame.setAttribute("sandbox", "allow-scripts");
  frame.ownerDocument.defaultView?.addEventListener(
    "message",
    (event: MessageEvent) => {
      const data: unknown = event.data;

      if (checkedOf(event, frame, nonce, data)) {
        accept(data);
      }
    },
    { signal: listening.signal },
  );
  frame.src = source.href;
  stage.append(frame);

  return () => {
    if (closing || removed) {
      return;
    }

    closing = true;

    if (chosen === undefined || frame.contentWindow === null) {
      remove();

      return;
    }

    grace = setTimeout(remove, completionGraceMs);
    tell({ kind: "complete", nonce });
  };
};
