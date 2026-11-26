/**
 * The protocol between a Portable Custom Interaction's (Q-16) frame host and its frame (issue
 * pci-04): the boot data the page sends the frame, and the messages the two exchange through
 * `postMessage`. Types only: the page side, the frame host's island, and the frame side, the boot
 * script the frame runs, both read it by `import type`, so a page loads nothing for it.
 *
 * Every message carries the frame's `nonce`, the random string the host drew for that frame and
 * wrote as the fragment of the frame's `src`, which no request carries
 * (`#plate/ui/portable-custom/protocol.ts`). The page accepts a message only from that frame's
 * `contentWindow` and with that nonce; the frame accepts one only from its parent window with that
 * nonce. The frame's origin is opaque (`sandbox="allow-scripts"`, never `allow-same-origin`), so
 * neither side can name the other's origin and both post with the target origin `"*"`: the nonce
 * and the source check are the whole of the trust.
 *
 * What a PCI gives the host is opaque to it by the PCI contract: its `state` is whatever the PCI
 * wants back, and its response and change values are the Appendix C JSON binding, which issue
 * pci-05 reads with `fromPciJson`. Those fields are `unknown` here on purpose, and travel as the
 * structured clone `postMessage` makes of them.
 *
 * @module
 */

/**
 * A JSON value, as the Appendix C binding of a variable's value is one: what the page hands a
 * PCI for its template and context variables.
 */
export type PciJsonValue =
  | boolean
  | number
  | string
  | null
  | readonly PciJsonValue[]
  | PciJsonObject;

/**
 * A JSON object: the values of a PCI's template or context variables, by identifier.
 */
export interface PciJsonObject {
  readonly [key: string]: PciJsonValue;
}

/**
 * The configuration the page computes for a PCI, as the bridge in the frame hands it to
 * `getInstance` with its own `onready` and `ondone` added: the element's `data-*` properties by
 * dataset name, the response identifier, the status (`interacting`, `review` or `solution` as
 * the render mode gives it), and the template and context variables' values by identifier.
 *
 * A stated limit of issue pci-04: the payload node carries the variables' identifiers only, so both
 * variable objects are empty until the issue that reads their values lands. No `boundTo`: issue
 * pci-05 adds the response's value by state.
 */
export interface PciFrameConfiguration {
  readonly contextVariables: PciJsonObject;
  readonly properties: Readonly<Record<string, string>>;
  readonly responseIdentifier: string;
  readonly status: string;
  readonly templateVariables: PciJsonObject;
}

/**
 * A route's fallback as the frame protocol carries it (`ModuleFallback` in
 * `#plate/pci/resolve.ts`): its location as an absolute URL, and the seconds the primary is waited
 * for before the frame loads it instead, 0 for no limit.
 */
export interface PciFrameFallback {
  readonly location: string;
  readonly primaryWaitSeconds: number;
}

/**
 * One module route as the host resolved it (issue pci-01's rules) and the PCI's payload node
 * carries it: the module id, and its primary location and its fallback as absolute URLs, where the
 * host serves each script (a package file's at an address of the host's choosing, which need not
 * end in `.js`), each absent when the module has none. The frame tries `primary` first and the
 * fallback after the primary's fatal error or once the fallback's `primaryWaitSeconds` run out; a
 * location with nothing after it, a `primary` with no fallback or the fallback itself, waits for
 * its script's load or error, never for a clock (R3: a timeout means only "load the fallback").
 */
export interface PciFrameRoute {
  readonly fallback?: PciFrameFallback;
  readonly id: string;
  readonly primary?: string;
}

/**
 * The frame's boot data: its nonce, the routes to load, and the entry module's id when the PCI
 * names one, which loads first. Without an entry every route loads and the one module that
 * registers is the factory. It travels inside the page's `load` message (`PageLoad` in
 * `#plate/ui/portable-custom/protocol.ts`), sent once the frame has booted, since the frame page
 * is one static document for every PCI and holds no item's data.
 */
export interface PciFrameBoot {
  readonly entry?: string;
  readonly nonce: string;
  readonly routes: readonly PciFrameRoute[];
}

/**
 * The frame's first word: the boot ran, read its nonce from its URL's fragment and waits for the
 * page's `load`.
 */
export interface FrameBooted {
  readonly kind: "booted";
  readonly nonce: string;
}

/**
 * Every route loaded and the modules ran: the `typeIdentifier` of every factory they registered
 * with the bridge, in registration order. The page chooses among them (`factoryFor`, issue
 * pci-01) and answers with {@link PageInstantiate}.
 */
export interface FrameRegistered {
  readonly kind: "registered";
  readonly nonce: string;
  readonly typeIdentifiers: readonly string[];
}

/**
 * The PCI called `onready`: it is rendered into its `dom`, with the state it reported.
 */
export interface FrameReady {
  readonly kind: "ready";
  readonly nonce: string;
  readonly state: unknown;
}

/**
 * The PCI fired `qti-interaction-changed` at its `dom`: the value is the event's `detail.value`
 * when it carries one, else the PCI's `getResponse()`; `valid` is the detail's, or `undefined`
 * when it carries none.
 */
export interface FrameChanged {
  readonly kind: "changed";
  readonly nonce: string;
  readonly responseIdentifier: string;
  readonly valid: boolean | undefined;
  readonly value: unknown;
}

/**
 * The PCI called `ondone`, with the response, the state and the status it gave (`undefined` when
 * it gave none).
 */
export interface FrameDone {
  readonly kind: "done";
  readonly nonce: string;
  readonly response: unknown;
  readonly state: unknown;
  readonly status: string | undefined;
}

/**
 * The frame answered {@link PageComplete}: it called `getResponse()`, then `getState()`, then
 * `oncompleted()` when the PCI has one, in that order, and these are the two values. The page
 * removes the frame when this arrives.
 */
export interface FrameCompleted {
  readonly kind: "completed";
  readonly nonce: string;
  readonly response: unknown;
  readonly state: unknown;
}

/**
 * The frame's content changed height: the whole pixels its document's root element now takes,
 * which the page writes as the frame's `height` attribute.
 */
export interface FrameHeight {
  readonly kind: "height";
  readonly nonce: string;
  readonly pixels: number;
}

/**
 * The frame cannot serve the PCI: a route exhausted its locations, a module named a dependency no
 * route defines, no factory served the type identifier the page chose, or a script threw. The
 * reason is one English sentence for the page's host to log; the page says again that the PCI
 * cannot run.
 */
export interface FrameFailed {
  readonly kind: "failed";
  readonly nonce: string;
  readonly reason: string;
}

/**
 * Every message the frame posts to the page.
 */
export type FrameToPage =
  | FrameBooted
  | FrameChanged
  | FrameCompleted
  | FrameDone
  | FrameFailed
  | FrameHeight
  | FrameReady
  | FrameRegistered;

/**
 * The page chose a factory: instantiate the PCI through the bridge with this type identifier,
 * this configuration, and this state, `undefined` (never `null`) when there is none to restore.
 */
export interface PageInstantiate {
  readonly configuration: PciFrameConfiguration;
  readonly kind: "instantiate";
  readonly nonce: string;
  readonly state: unknown;
  readonly typeIdentifier: string;
}

/**
 * The page is about to remove the frame: run the PCI's completion and answer with
 * {@link FrameCompleted}.
 */
export interface PageComplete {
  readonly kind: "complete";
  readonly nonce: string;
}
