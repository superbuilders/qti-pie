"use client";

/**
 * The Portable Custom Interaction's client island (`qti-portable-custom-interaction`, Q-16): the
 * author's PCI, run in a sandboxed frame of its own (`#plate/ui/portable-custom/host.ts`) on the
 * host's frame page, its response bound to the host's `<Responses>`.
 *
 * - **What the PCI is given.** Its `dom` holds the markup the server rendered, each `template` at its
 *   end, inert. Its configuration holds the author's `data-*` properties by dataset name, the
 *   response identifier, the status `interacting`, and `boundTo`, the response's value as the host
 *   holds it when the frame is instantiated, written by the JSON binding
 *   (`#plate/ui/portable-custom/response.ts`), so a PCI the child comes back to can show the
 *   answer. Its template and context variables are empty objects: the payload node carries their
 *   identifiers alone. It is handed no state: a stored state is the server's to restore.
 * - **What it posts.** Each change the frame relays, the PCI's `qti-interaction-changed` or its
 *   `getResponse()` after each input event the frame sees, is read by the JSON binding against the
 *   response's declaration and posted as plate's lexical texts through `useResponse`. JSON that
 *   does not fit the declaration is no valid response, as the PCI contract has `getResponse()` give
 *   none for one, so the response is NULL. A value the host sets from outside, such as a refused
 *   save set back, is not sent to a running PCI: it reaches the PCI when its frame is next made.
 * - **Lazy.** The frame is made only once the island has hydrated, as no message could be trusted
 *   before, and loads lazily, when the child nears it; until the PCI is ready the island says it is
 *   loading. The shell renders the island inside a Suspense boundary of its own.
 * - **Teardown.** When the island's effect is cleaned up, the PCI is asked to complete, its
 *   `oncompleted()` among it, before its frame goes.
 * - **Access.** The island's root is the group `naming` names, which the server resolved: by the
 *   prompt, else by the author's `aria-labelledby` or `aria-label`, and no group when nothing names
 *   it. The frame's `title` is that name's text, else the `frame` label (WCAG 4.1.2). Mounting
 *   moves no focus; Tab moves into the frame and out of it as the browser moves it. The status is a
 *   polite live region (WCAG 4.1.3). When the frame fails while it holds the focus, the status
 *   takes the focus, so the child is not dropped onto the page (WCAG 2.4.3). What the PCI draws
 *   inside its frame is its own: plate's K–3 rules, its target sizes among them, cannot reach it.
 * - **Failure.** A frame that cannot run the PCI, or a frame page's URL that is no URL, shows the
 *   `failed` label, and the island tells the host's `<PciFailures>` the response, the type
 *   identifier and the reason (`#plate/ui/portable-custom/failures.tsx`), which only the host can
 *   log.
 *
 * The parts:
 *
 * - `plate-portable-custom`, the root, with the author's `class` (`root`; its `data-*` are the PCI's
 *   properties, never the root's, decision D24), `data-loading` until the PCI is ready and
 *   `data-failed` once its frame cannot run it;
 * - `plate-prompt`, the prompt;
 * - `plate-portable-custom-stage`, which holds the frame, `plate-portable-custom-frame`, an `iframe`
 *   whose height is its `height` attribute;
 * - `plate-portable-custom-status`, the `loading` or `failed` label, empty once the PCI is ready;
 * - `plate-portable-custom-source`, `hidden`: the markup as `plate-portable-custom-markup` and each
 *   template's content as `plate-portable-custom-template`, which the island sends the frame.
 *
 * A review or a solution renders on the server with no frame
 * (`#plate/ui/item/interactions/portable-custom.tsx`).
 *
 * @module
 * @see https://www.imsglobal.org/spec/qti/v3p0/info#Data_PortableCustomInteraction
 * @see https://www.imsglobal.org/spec/qti/v3p0/impl
 */
import { Result } from "effect";
import { useEffect, useEffectEvent, useRef, useState } from "react";
import type { ReactNode } from "react";
import type { PciJsonRefused } from "#plate/pci/json.ts";
import { flag } from "#plate/ui/attributes.ts";
import type { Authored, ClassRoot } from "#plate/ui/attributes.ts";
import type { Group } from "#plate/ui/item/interactions/group.ts";
import { usePciFailed } from "#plate/ui/portable-custom/failures.tsx";
import { hostFrame } from "#plate/ui/portable-custom/host.ts";
import type { FrameFacts } from "#plate/ui/portable-custom/host.ts";
import type { Labels } from "#plate/ui/item/interactions/labels.ts";
import type { portableCustomKeys } from "#plate/ui/portable-custom/labels.ts";
import { boundOf } from "#plate/ui/portable-custom/response.ts";
import type { PostedAs } from "#plate/ui/portable-custom/response.ts";
import { PromptPart } from "#plate/ui/prompt.tsx";
import type { Prompt } from "#plate/ui/prompt.tsx";
import { useResponse } from "#plate/ui/responses.tsx";
import { asciiTokens, collapsedText } from "#plate/ui/whitespace.ts";

/**
 * What the server gives a Portable Custom Interaction's island, as QTI's
 * `qti-portable-custom-interaction` and the host's `pci` facts say.
 *
 * @see https://www.imsglobal.org/spec/qti/v3p0/info#Data_PortableCustomInteraction
 */
export interface PortableCustomProps extends Authored<Group, ClassRoot> {
  /**
   * Where the PCI runs: the host's frame page, the routes of its modules, and its entry module.
   */
  readonly frame: FrameFacts;
  readonly labels: Labels<typeof portableCustomKeys>;
  /**
   * The content of the `qti-interaction-markup`, server-rendered, but for its `template`s: the
   * children of the PCI's `dom`.
   */
  readonly markup: ReactNode;
  /**
   * The entry name the response posts under, plate's `entryName` for the item's instance.
   */
  readonly name: string;
  /**
   * How the response posts, from its declaration.
   */
  readonly posted: PostedAs;
  /**
   * The `qti-prompt`, server-rendered under its scoped id, which `naming` then names the group by;
   * undefined when the interaction has none.
   */
  readonly prompt: Prompt | undefined;
  /**
   * The author's `data-*` attributes, each named as HTML's `dataset` names it, in document order:
   * the PCI's `properties`.
   */
  readonly properties: readonly { readonly name: string; readonly value: string }[];
  /**
   * The `response-identifier`, which the configuration names.
   */
  readonly responseIdentifier: string;
  /**
   * The content of each HTML `template` of the markup, server-rendered, in document order.
   */
  readonly templates: readonly ReactNode[];
  /**
   * `custom-interaction-type-identifier`, as written.
   */
  readonly typeIdentifier: string;
}

/**
 * Where the PCI stands: loading until it says it is ready, ready, or failed once its frame cannot
 * run it.
 */
type Phase = "failed" | "loading" | "ready";

/**
 * The markup's part inside the source.
 */
const markupSelector = ':scope > [data-slot="plate-portable-custom-markup"]';

/**
 * A template's part inside the source.
 */
const templateSelector = ':scope > [data-slot="plate-portable-custom-template"]';

/**
 * Tell whether two lists of texts are the same, text for text in order.
 *
 * @param left One list.
 * @param right The other.
 * @returns Whether they hold the same texts in the same order.
 */
const sameTexts = (left: readonly string[], right: readonly string[]): boolean =>
  left.length === right.length && left.every((text, index) => text === right[index]);

/**
 * Give the text of the elements an `aria-labelledby` names, in order, as one line.
 *
 * @param document The document they stand in.
 * @param ids The ids, separated by white space.
 * @returns Their text, its white space collapsed; empty when they hold none.
 */
const textOfIds = (document: Document, ids: string): string =>
  collapsedText(
    asciiTokens(ids)
      .map((id) => document.querySelector(`#${CSS.escape(id)}`)?.textContent ?? "")
      .join(" "),
  );

/**
 * Give the value of an attribute on the nearest element that writes it, the element itself
 * included.
 *
 * @param element The element.
 * @param name The attribute.
 * @returns Its value, empty when no element above writes it.
 */
const inherited = (element: Element, name: "dir" | "lang"): string =>
  element.closest(`[${name}]`)?.getAttribute(name) ?? "";

/**
 * Render a Portable Custom Interaction for the child to answer in its frame, its response bound
 * to the item's `<Responses>`.
 *
 * @param props The interaction, where it runs, its response's entry name and its labels
 *   ({@link PortableCustomProps}).
 * @returns The island: the prompt, the frame's stage, its status and the hidden source.
 */
export const PortableCustom = (props: PortableCustomProps) => {
  const {
    frame,
    labels,
    markup,
    name,
    naming,
    posted,
    prompt,
    properties,
    responseIdentifier,
    root,
    templates,
    typeIdentifier,
  } = props;
  const [texts, set] = useResponse(name);
  const failed = usePciFailed();
  const [phase, setPhase] = useState<Phase>("loading");
  const stage = useRef<HTMLDivElement>(null);
  const source = useRef<HTMLDivElement>(null);
  const status = useRef<HTMLParagraphElement>(null);
  const said = { failed: labels.failed, loading: labels.loading, ready: "" } satisfies Record<
    Phase,
    string
  >;

  /**
   * Give the response's value as the PCI is bound to it, from the texts the response holds now.
   *
   * @returns The value's JSON.
   */
  const bound = useEffectEvent(() => boundOf(texts, posted));

  /**
   * Post the texts the frame's change reads as, NULL for JSON that does not fit, unless they are
   * the texts the response holds.
   *
   * @param read The texts, or why the JSON does not fit.
   */
  const respond = useEffectEvent((read: Result.Result<readonly string[], PciJsonRefused>) => {
    const next = Result.getOrElse(read, () => []);

    if (!sameTexts(next, texts)) {
      set(next);
    }
  });

  /**
   * Show that the frame cannot run the PCI, take the focus where the frame held it, and tell the
   * host why ({@link usePciFailed}).
   *
   * @param reason One English sentence for the host's log, never shown to the child.
   * @param focused Whether the frame held the focus when it went.
   */
  const fail = useEffectEvent((reason: string, focused: boolean) => {
    setPhase("failed");

    if (focused) {
      status.current?.focus();
    }

    failed({ reason, response: responseIdentifier, typeIdentifier });
  });

  /**
   * Make the frame in the stage, from the source the server rendered and the names around it.
   *
   * @param at The stage.
   * @param held The source.
   * @returns The frame's teardown; none where the frame page's URL is no URL, and the island
   *   shows it failed.
   */
  const host = useEffectEvent((at: HTMLElement, held: HTMLElement): (() => void) | undefined => {
    const page = URL.parse(frame.loader, at.ownerDocument.baseURI);
    const labelledby = naming["aria-labelledby"];
    const text = labelledby === undefined ? "" : textOfIds(at.ownerDocument, labelledby);

    setPhase("loading");

    if (page === null) {
      fail(`The frame page's URL "${frame.loader}" is no URL.`, false);

      return undefined;
    }

    return hostFrame(
      at,
      page,
      {
        configuration: {
          contextVariables: {},
          properties: Object.fromEntries(properties.map((each) => [each.name, each.value])),
          responseIdentifier,
          status: "interacting",
          templateVariables: {},
        },
        facts: frame,
        placed: { dir: inherited(at, "dir"), lang: inherited(at, "lang") },
        posted,
        source: {
          markup: held.querySelector(markupSelector)?.innerHTML ?? "",
          templates: [...held.querySelectorAll(templateSelector)].map((each) => each.innerHTML),
        },
        title: text === "" ? (naming["aria-label"] ?? labels.frame) : text,
        typeIdentifier,
      },
      {
        bound: () => bound(),
        failed: (reason, focused) => {
          fail(reason, focused);
        },
        ready: () => {
          setPhase("ready");
        },
        response: (read) => {
          respond(read);
        },
      },
    );
  });

  // The island makes its frame once: the server shell keys it by what the frame runs, so a change of
  // that mounts a new island and frame, and a render that changes nothing of it, the response's
  // texts among them, keeps the running PCI.
  useEffect((): (() => void) | undefined => {
    const at = stage.current;
    const held = source.current;

    return at === null || held === null ? undefined : host(at, held);
  }, []);

  return (
    <div
      {...root}
      {...naming}
      data-failed={flag(phase === "failed")}
      data-loading={flag(phase === "loading")}
      data-slot="plate-portable-custom"
    >
      <PromptPart prompt={prompt} />
      <div data-slot="plate-portable-custom-stage" ref={stage} />
      <p data-slot="plate-portable-custom-status" ref={status} role="status" tabIndex={-1}>
        {said[phase]}
      </p>
      <div data-slot="plate-portable-custom-source" hidden ref={source}>
        <div data-slot="plate-portable-custom-markup">{markup}</div>
        {templates.map((content, index) => (
          // The templates are the author's, in document order, and never reorder.
          <div data-slot="plate-portable-custom-template" key={index}>
            {content}
          </div>
        ))}
      </div>
    </div>
  );
};
