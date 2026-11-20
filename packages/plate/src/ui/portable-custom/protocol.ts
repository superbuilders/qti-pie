/**
 * The messages between a Portable Custom Interaction's (Q-16) island and the frame page it runs
 * in, as this host speaks them: the frame protocol of `#plate/pci/frame-protocol.ts`, delivered to
 * a frame page the host serves at its own URL rather than written into a `srcdoc`, and typed so
 * that the two rules the trust rests on are the compiler's to hold.
 *
 * - **The nonce.** Every message carries the {@link FrameNonce} the island drew for that one frame.
 *   The frame learns it from its own URL's fragment, which the island writes into the frame's `src`
 *   and no request carries to a server, so the page can stay one static document for every PCI. A
 *   `FrameNonce` is made by `drawNonce` in `#plate/ui/portable-custom/host.ts` alone, and every
 *   message the island posts ({@link PageMessage}) types its nonce as one, so no message leaves the
 *   page with a nonce of another frame's or none.
 * - **The check.** The island acts on a frame's message only once it has passed the check, that
 *   `event.source` is that frame's `contentWindow` and its nonce is that frame's: a {@link Checked}
 *   message, which only the check in `#plate/ui/portable-custom/host.ts` makes, so no handler can
 *   be handed a message that skipped it.
 *
 * The frame's origin is opaque (`sandbox="allow-scripts"`, never `allow-same-origin`), so neither
 * side can name the other's origin, both post with the target origin `"*"`, and the nonce and the
 * source check are the whole of the trust.
 *
 * What travels beyond `#plate/pci/frame-protocol.ts`: the frame's content and routes in one
 * {@link PageLoad}, since a page at its own URL holds no item's data; and the response's value as
 * the configuration's `boundTo` ({@link BoundConfiguration}), so a PCI the child comes back to
 * shows the answer the response holds. Types only: the island and the frame boot both read this
 * module by `import type`, so it loads nothing.
 *
 * @module
 */
import type { Brand } from "effect";
import type {
  FrameToPage,
  PageComplete,
  PageInstantiate,
  PciFrameBoot,
  PciFrameConfiguration,
} from "#plate/pci/frame-protocol.ts";
import type { PciJson } from "#plate/pci/json.ts";

/**
 * The random string the island draws for one frame, `crypto.randomUUID()`'s text, which every
 * message between the two carries. The brand is in the type alone: `drawNonce`
 * (`#plate/ui/portable-custom/host.ts`) is the one maker, so a nonce cannot be written by hand.
 */
export type FrameNonce = Brand.Branded<string, "FrameNonce">;

/**
 * A message from the frame that passed the island's check: it came from the frame's own
 * `contentWindow` and carries the frame's nonce. The brand is in the type alone, and the check in
 * `#plate/ui/portable-custom/host.ts` is its one maker.
 *
 * @template M The message.
 */
export type Checked<M extends FrameToPage> = Brand.Branded<M, "FrameChecked">;

/**
 * The frame's content, routes and language, which the island sends once the frame has booted: the
 * entry module's id when the PCI names one and the routes, absolute, as `PciFrameBoot` has them;
 * the PCI's markup as the HTML the server rendered, which becomes the children of the element the
 * PCI is handed as its `dom`; each HTML `template` of the markup as the HTML of its content, which
 * the frame writes as a `template` at the end of that element, inert until the PCI clones it; the
 * language and direction the interaction stands in, each empty when nothing names one; and the
 * frame document's title, the frame's name.
 */
export interface PageLoad extends Omit<PciFrameBoot, "nonce"> {
  readonly dir: string;
  readonly kind: "load";
  readonly lang: string;
  readonly markup: string;
  readonly nonce: FrameNonce;
  readonly templates: readonly string[];
  readonly title: string;
}

/**
 * The configuration the island hands a PCI: `PciFrameConfiguration`, and `boundTo`, the value of
 * the response the PCI is bound to under its identifier, in the Appendix C JSON binding
 * (`toPciJson` in `#plate/pci/json.ts`), read from the texts the host's `<Responses>` holds when
 * the frame is instantiated. The template and context variables stay empty objects: the payload
 * node carries their identifiers alone.
 */
export interface BoundConfiguration extends PciFrameConfiguration {
  readonly boundTo: Readonly<Record<string, PciJson>>;
}

/**
 * The island's choice of factory, as `PageInstantiate`, with the response's value bound and the
 * frame's nonce.
 */
export interface PageBind extends Omit<PageInstantiate, "configuration" | "nonce"> {
  readonly configuration: BoundConfiguration;
  readonly nonce: FrameNonce;
}

/**
 * The island's request that the PCI complete, as `PageComplete`, with the frame's nonce.
 */
export interface PageClose extends Omit<PageComplete, "nonce"> {
  readonly nonce: FrameNonce;
}

/**
 * Every message the island posts to its frame, in the order the island sends them: the frame's
 * content and routes, the factory chosen, and the request to complete before the frame goes.
 */
export type PageMessage = PageBind | PageClose | PageLoad;
