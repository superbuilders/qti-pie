/**
 * The frame side of a Portable Custom Interaction's (Q-16) host: the one script the frame page
 * runs (`#plate/ui/portable-custom/frame-page.ts`), as one function, {@link bootFrame}, whose
 * source text the page writes as its inline script.
 *
 * Before any module loads, it provides a small AMD loader (`define` with `define.amd`, anonymous
 * and named defines, dependencies in order, `require`, and `exports` and `module` as the
 * CommonJS-style names) and the `qtiCustomInteractionContext` bridge, both as an AMD module id and
 * as a `window` global, as the PCI contract asks. Then it speaks the protocol of
 * `#plate/ui/portable-custom/protocol.ts` with the island in the page:
 *
 * 1. It reads its nonce from its own URL's fragment and says it has booted.
 * 2. On the island's `load` it builds the element the PCI is handed as its `dom` from the markup, each
 *    `template` written inert at its end, takes the language, direction and title, and loads the
 *    routes: the entry first when the PCI names one, each route's primary location, then its
 *    fallback after the primary's fatal error or once the wait the fallback holds runs out; a
 *    location with nothing after it waits for its script's load or error, never for a clock. An
 *    anonymous `define` is the module of the route whose script is running it, and is taken only
 *    while that location's load is undecided. It runs the modules and tells the island the type
 *    identifiers they registered. With no clock, a lone location whose script never answers,
 *    neither loading nor failing, leaves the frame loading, and nothing in the frame names it: the
 *    island hears neither `registered` nor `failed`, and in the suites the gate's progress watch
 *    judges the hang.
 * 3. On the island's choice it calls `factory.getInstance(dom, configuration, state)` through the
 *    bridge, the configuration the island's with the bridge's own `onready` and `ondone`.
 * 4. It relays `onready`, `ondone`, each `qti-interaction-changed` fired at the `dom`, and, after each
 *    input event the frame sees, the PCI's `getResponse()` whenever it differs from the last one
 *    relayed: a PCI that never fires the event still has its response reach the page, which cannot
 *    ask for it when the child submits.
 * 5. It completes the PCI once, `getResponse()`, then `getState()`, then `oncompleted()` when the PCI
 *    has one, as the PCI contract asks before its markup goes: when the island asks, or when the
 *    frame's document is unloaded (a `pagehide` that does not keep it in the back/forward cache),
 *    as it is when the page navigates away or the island's frame is removed with no time left to
 *    ask. A document the cache keeps may come back, so its PCI stays as it was.
 *
 * Its height follows its content: a `ResizeObserver` on the document's root element posts the whole
 * pixels of its border box's block size, which the island writes as the frame's `height` attribute.
 * The boot's own stylesheet, put first in the head before any PCI code, pins the root's geometry
 * whatever page the boot runs in, so that box is the extent the document
 * paints, at the frame's width, and a post changes no box it observes. A height media query reaches
 * its fixed point one post on, content that contracts with the viewport (`50vh` over fixed content)
 * reaches its own by a line through two echoes, and content sized from the viewport's own height,
 * which no height fits, stops within two posts and scrolls the rest.
 *
 * Failure travels as a `failed` message while the PCI is not yet running: a route that exhausts
 * its locations, a module that names a dependency no route defines, no factory for the identifier
 * the island chose, an anonymous `define` no module script of the frame's runs, or an uncaught
 * error in the frame. An uncaught error a module script throws as it runs is its location's
 * failure, set aside once that location's load is decided; any other is the frame's. Once
 * `getInstance` has given the PCI, an uncaught error is the PCI's own and leaves it running.
 *
 * **Why one function.** The page writes `bootFrame`'s source text, `Function.prototype.toString`'s,
 * as its inline script, so the text is the code whatever compiled this module: Node's type
 * stripping, or the host's bundler. That holds while the function reaches nothing outside itself
 * but the frame's globals, so this module declares no other value and imports none: every helper
 * is inside the function, and every import is a type. A value added beside it would be undefined
 * in the frame.
 *
 * **Why the floor.** The text runs as written, in the learner's browser, with no polyfill and no
 * bundler between: so it uses only what the hosts' browser floor (`#plate/browser-floor.ts`) fully
 * supports, in MDN's browser compatibility data. `#plate/ui/portable-custom/frame-boot.test.ts`
 * runs every block of the boot in a realm without the members the floor lacks, and refuses in its
 * source each global, static member and syntax the floor lacks.
 *
 * @module
 * @see https://github.com/amdjs/amdjs-api/blob/master/AMD.md
 * @see https://www.imsglobal.org/spec/qti/v3p0/impl
 */
import type { FrameToPage, PciFrameRoute } from "#plate/pci/frame-protocol.ts";
import type { BoundConfiguration, PageMessage } from "#plate/ui/portable-custom/protocol.ts";

/**
 * Any function a PCI's code hands the loader or the bridge: an AMD factory, a `require` callback,
 * a PCI object's method.
 */
type Callable = (...parameters: unknown[]) => unknown;

/**
 * A PCI object, as `getInstance` returns it: the two readers the host calls, and the optional
 * `oncompleted` the host calls before the PCI's markup goes.
 */
interface PciInstance {
  readonly getResponse: () => unknown;
  readonly getState: () => unknown;
  readonly oncompleted?: () => void;
}

/**
 * What a PCI hands `ondone`, as the PCI contract lets it: the interaction, its response and its
 * state, and its status where it gives one.
 */
type DoneArguments =
  | readonly [interaction: PciInstance, response: unknown, state: unknown]
  | readonly [interaction: PciInstance, response: unknown, state: unknown, status: string];

/**
 * The configuration the bridge hands `getInstance`: the island's, with the bridge's own `onready`
 * and `ondone`.
 */
interface GivenConfiguration extends BoundConfiguration {
  readonly ondone: (...given: DoneArguments) => void;
  readonly onready: (interaction: PciInstance, state: unknown) => void;
}

/**
 * A factory a PCI module registers with the bridge: its `typeIdentifier` and the `getInstance`
 * that renders one PCI into a `dom`.
 */
interface PciFactory {
  readonly getInstance: (
    dom: HTMLElement,
    configuration: GivenConfiguration,
    state: unknown,
  ) => unknown;
  readonly typeIdentifier: string;
}

/**
 * The `qtiCustomInteractionContext` bridge: `register`, which a PCI module calls once per type in
 * this frame, and `getInstance`, which renders the chosen factory's PCI.
 */
interface Bridge {
  readonly getInstance: (
    typeIdentifier: string,
    dom: HTMLElement,
    configuration: GivenConfiguration,
    state: unknown,
  ) => unknown;
  readonly register: (factory: unknown) => void;
}

/**
 * What a module hands the AMD `define`, as it wrote it: `(factory)`, `(dependencies, factory)`,
 * `(id, factory)` or `(id, dependencies, factory)`, which the loader decodes once into a
 * {@link Definition}.
 */
type DefineArguments =
  | readonly [factory: unknown]
  | readonly [first: unknown, factory: unknown]
  | readonly [id: unknown, dependencies: unknown, factory: unknown];

/**
 * A `define` decoded: named by its id, or anonymous, which belongs to the route of the script
 * running it; its dependencies, none where it lists none; and its factory, as the module gave it.
 */
type Definition = Readonly<
  | { kind: "named"; id: string; dependencies: readonly string[]; factory: unknown }
  | { kind: "anonymous"; dependencies: readonly string[]; factory: unknown }
>;

/**
 * What a module hands the AMD `require`, as it wrote it: `(id)` for one module's value, or
 * `(ids, callback)` to run the callback with theirs.
 */
type RequireArguments = readonly [ids: unknown] | readonly [ids: unknown, onResolved: unknown];

/**
 * The AMD `define`, with `define.amd` present so a module knows an AMD loader is here.
 */
interface AmdDefine {
  (...given: DefineArguments): void;
  readonly amd: Readonly<Record<string, never>>;
}

/**
 * The `module` a factory may ask for, whose `exports` it may fill or replace.
 */
interface ModuleRecord {
  exports: unknown;
}

/**
 * One defined module, not yet run: its dependency ids, and its factory, or the value it defines
 * when the factory is not a function.
 */
interface AmdDefinition {
  readonly dependencies: readonly string[];
  readonly factory: unknown;
}

/**
 * What loading one location, or one route, came to.
 */
type Outcome = { readonly kind: "loaded" } | { readonly kind: "failed"; readonly reason: string };

/**
 * What resolving a module id came to: its exported value, or the first dependency no route
 * defines, with the module that asked for it, none for the module asked for first.
 */
type Resolution =
  | { readonly kind: "missing"; readonly from: string | undefined; readonly id: string }
  | { readonly kind: "resolved"; readonly value: unknown };

/**
 * One location's script, as the loader made it: its route's module id, which an anonymous `define`
 * the script runs takes; how its load settles, an uncaught error the script throws as it runs
 * among the ways; and whether its load is still undecided.
 */
interface ScriptLoad {
  readonly id: string;
  loading: boolean;
  readonly settle: (outcome: Outcome) => void;
}

/**
 * An echo the frame posted for: the viewport's height it was observed at, the height posted
 * before it, and that height as measured there, which a zoom puts within half a host pixel of the
 * post (`measured`); and the root's block size it observed there, unrounded.
 */
interface Echoed {
  readonly at: number;
  readonly content: number;
  readonly viewport: number;
}

/**
 * Where the frame stands in fitting a line to its echoes since the last post that was no echo's: it
 * has posted for the first, and samples it; it has posted the fixed point of the line through two,
 * and samples the second; it has posted the fixed point of the line through that and the estimate's
 * own echo, and samples the estimate's; it has followed a change by the slope its content measured,
 * posting the viewport plus a change at a fixed viewport or a dropped echo a signal posted, and
 * samples the change; it has posted a reach below its stop, to see whether the kept slope still
 * holds after a change at a fixed viewport, and samples the change; it has gone back from that
 * probe to its stop, and samples the stop again; or it has stopped, at a height that fits or at its
 * content's own (`postHeight`).
 */
type Fit =
  | { readonly sample: Echoed; readonly stage: "estimated" }
  | { readonly sample: Echoed; readonly slope: number; readonly stage: "followed" }
  | {
      readonly reach: number;
      readonly sample: Echoed;
      readonly slope: number;
      readonly stage: "probed";
    }
  | { readonly sample: Echoed; readonly stage: "refitted" }
  | { readonly sample: Echoed; readonly slope: number; readonly stage: "returned" }
  | { readonly sample: Echoed; readonly stage: "sampled" }
  | { readonly stage: "stopped" };

/**
 * What the frame keeps of the heights it posts: the last, none before its first; whether the
 * viewport stood at it when the frame last looked; the root's block size, unrounded, and inline
 * size at the last observation; the stage of the line it fits to its echoes since the last post
 * that was no echo's (`Fit`), none before the first; the height of an echo it dropped, for the next
 * content signal to post, none where there is none to post; whether a content signal has come
 * since the last post; the slope of its content in the viewport's height that its last line
 * measured, kept until the frame's width changes or its content is found off it, none before;
 * whether the chain started because a post's echo was off that slope; whether a signal has posted
 * a dropped echo since the last post that was no echo's; the viewport's height, as measured
 * (`measured`), where the frame last judged it; the frame element's height before the last post
 * as the island's acknowledgment gave it, none before it comes, whether the island has said the
 * last post settled (`PageSettled`), and whether the element's height it settled at is another,
 * whether an observation came since the last look after it settled, and the viewport where that
 * look stood,
 * and the island's device pixel ratio, as its last acknowledgment gave it;
 * the frame's resolution and the island's ratio at the last observation, which a line holds for;
 * and whether a change was seen while a post was on its way, and whether one was seen with the
 * viewport still where it stood, since the last post.
 */
interface Followed {
  atPosted: boolean;
  block: number;
  crossed: boolean;
  deferred: Box | undefined;
  dropped: Echoed | undefined;
  early: boolean;
  endured: boolean;
  fit: Fit | undefined;
  from: number | undefined;
  inline: number | undefined;
  lookedAt: number | undefined;
  looking: boolean;
  moved: boolean;
  posted: number | undefined;
  ratio: number;
  rechained: boolean;
  scale: string | undefined;
  settled: boolean;
  signalled: boolean;
  slope: number | undefined;
  spent: boolean;
  stirred: boolean;
  stood: number;
  unseen: boolean;
}

/**
 * A box the root's observation reported: its block size and its inline size, in CSS pixels.
 */
interface Box {
  readonly blockSize: number;
  readonly inlineSize: number;
}

/**
 * An object whose keys are read one by one at this boundary: what a message or a PCI's event
 * detail is before a predicate has read it.
 */
interface Fields {
  readonly [key: string]: unknown;
}

/**
 * Run a Portable Custom Interaction's frame: install the AMD loader and the bridge, then load,
 * instantiate, relay and complete the PCI as the island asks (the module doc). It does nothing in
 * a frame whose URL names no nonce, since no message of its could be trusted.
 *
 * It reaches nothing but the frame's globals, so its source text runs as it stands: see the
 * module doc.
 */
export const bootFrame = (): void => {
  const nonce = decodeURIComponent(location.hash.slice(1));

  if (nonce === "") {
    return;
  }

  /**
   * The island, the parent window the frame booted under, read once, before any script of the
   * PCI's runs: the frame posts to it alone and takes messages from it alone.
   *
   * @constraint `parent` is a replaceable global: a script's `window.parent = …`, or a classic
   *   script's top-level `var parent = …`, puts its own value in place of the parent for every
   *   later read in the frame. Read at each post and each check, a PCI that does so would take
   *   every response the frame relays, and no message of the island's would be heard, with no
   *   error anywhere.
   * @source HTML's `Window` interface: `[Replaceable] readonly attribute WindowProxy? parent`;
   *   Web IDL's `[Replaceable]`, whose setter defines an own property in place of the attribute.
   * @see https://html.spec.whatwg.org/multipage/nav-history-apis.html#dom-parent
   * @see https://webidl.spec.whatwg.org/#Replaceable
   */
  const host = window.parent;

  const bridgeId = "qtiCustomInteractionContext";
  const commonJsNames = ["require", "exports", "module"] as const;
  const inputEvents = ["change", "click", "drop", "input", "keyup", "pointerup"] as const;
  /**
   * The events by which an element's own content changes without a mutation of the document: a
   * picture or a medium that loaded or failed to, a transition or an animation that ended.
   */
  const contentEvents = ["animationend", "error", "load", "transitionend"] as const;
  /**
   * The longest delay a browser's timer holds, in milliseconds: `setTimeout` takes it as a WebIDL
   * `long`, a 32-bit signed integer.
   */
  const longestTimerMs = 2_147_483_647;
  /**
   * Chrome's layout unit, 1/64 CSS px, the finest length its layout and its media queries tell
   * apart (`LayoutUnit` in Blink).
   */
  const layoutUnit = 1 / 64;
  /**
   * Chrome's largest layout length, 33,554,432 px, which a frame that grew without end reached.
   */
  const layoutLimit = 33_554_432;
  /**
   * The properties whose transition moves no box: by their specifications they affect neither
   * layout nor scrollable overflow, so a box observed while only such transitions run is judged at
   * once (`transitions`). Opacity and every colour property paint only; box and text shadows "do
   * not affect layout" and "do not trigger scrolling or increase the size of the scrollable area";
   * an outline takes up no space and is ink overflow, never scrollable overflow. `filter` and
   * `backdrop-filter` are not among them: a value other than `none` makes the element a containing
   * block for its absolutely and fixed positioned descendants, which moves them; nor is
   * `visibility`, whose `collapse` removes table rows and columns and flex items from layout; nor
   * `transform`, `translate`, `rotate` and `scale`, which change scrollable overflow; nor `all`, a
   * custom property, or one unknown.
   *
   * @see https://drafts.csswg.org/css-color-4/#transparency
   * @see https://drafts.csswg.org/css-backgrounds-3/#box-shadow
   * @see https://drafts.csswg.org/css-text-decor-3/#text-shadow-property
   * @see https://drafts.csswg.org/css-ui-4/#outline-props
   * @see https://drafts.csswg.org/css-overflow-3/#ink
   * @see https://drafts.fxtf.org/filter-effects-1/#FilterProperty
   * @see https://drafts.csswg.org/css-display-3/#visibility
   * @see https://drafts.csswg.org/css-overflow-3/#scrollable
   */
  const paintOnly: ReadonlySet<string> = new Set([
    "accent-color",
    "background-color",
    "border-block-end-color",
    "border-block-start-color",
    "border-bottom-color",
    "border-inline-end-color",
    "border-inline-start-color",
    "border-left-color",
    "border-right-color",
    "border-top-color",
    "box-shadow",
    "caret-color",
    "color",
    "column-rule-color",
    "fill",
    "flood-color",
    "lighting-color",
    "opacity",
    "outline-color",
    "outline-offset",
    "outline-style",
    "outline-width",
    "stop-color",
    "stroke",
    "text-decoration-color",
    "text-emphasis-color",
    "text-shadow",
  ]);
  /**
   * The pins: the boot's own stylesheet, which it puts first in the head before any PCI code runs,
   * whatever page the boot runs in, and keeps first (`keepPinsFirst`). It is an inline `style`, so
   * a host's `style-src` must allow `'unsafe-inline'`, with no nonce or hash in `style-src` (which
   * would make it ignored), as PCIs' own inline styles need; a constructed sheet, which no
   * `style-src` governs, is adopted after every document sheet, so its layer comes last and a PCI's
   * layered `!important` beats it (Chrome 158, `car-i8/probe-csp/` in the lane's directory). They
   * pin the root element's geometry, so that the root's border box, which the boot posts as the
   * frame's height, is the extent the document paints and no function of the frame's own height:
   * each property by which a PCI's stylesheet could set that box apart from its content, or tie it
   * to the viewport, at its initial value.
   *
   * - `margin`, which lies outside the box;
   * - `height`, `min-height` and `max-height`, a percentage of which is one of the viewport's: a root
   *   at `height: 50%` halves the frame at each post, and one at `100%` with padding grows it at
   *   each post without end;
   * - `position`, whose insets stretch the root to the viewport;
   * - `contain` and `content-visibility`, whose size containment lays the root out as if it had no
   *   content;
   * - `transform`, `translate`, `rotate`, `scale`, `offset-path` and `zoom`, which move or scale what
   *   the root paints and leave its box as it was;
   * - `writing-mode`, here and on the body: the root's used writing mode is the body's, or its own
   *   where either has containment (CSS Writing Modes 4, §8). In a vertical one the box's block
   *   size is the frame's width, so each post rewraps the text at a new height and the next post
   *   swaps the two (716, 302, 716, … in Chrome 158). So a PCI whose stylesheet makes its body
   *   vertical renders horizontally; one that wants vertical text sets it on its own element, an
   *   orthogonal flow, which cannot oscillate: its height is the viewport's, which the boot stops
   *   within two posts;
   * - `overflow-y: auto`, so the viewport scrolls what overflows the frame: the root's `overflow` is
   *   the viewport's, and while it is `visible` the body's is, so a PCI's `overflow: hidden` on
   *   either would leave unreachable the content the frame cannot fit, which content sized from the
   *   viewport's own height always is (the boot's `postHeight`). The viewport takes `visible` as
   *   `auto` (CSS Overflow 3, §3.3), so this is the value a page that sets neither already has.
   *
   * The pins are the boot's own `style` element, the first stylesheet of the head, each declaration
   * `!important` and in an anonymous cascade layer, `@layer { … }`, the page's first. Among
   * `!important` declarations the first layer wins over every later one and over every unlayered
   * one (CSS Cascade 5, §6.1 and §6.4: layers sort in reverse for important declarations), so a
   * PCI's stylesheet cannot move them, `!important` or layered; and an anonymous layer has no name,
   * so no later stylesheet can add its rules to that layer, nest a sublayer in it, or import a
   * sheet into it, each of which outranked a named layer's own rules: a rule added later to the
   * same layer by its order of appearance, a sublayer by its earlier place among important
   * declarations (CSS Cascade 5, §6.4.2.1: "A layer declared without a <layer-name> does not
   * provide any external hook for re-arranging or adding styles"). An `!important` declaration wins
   * over every normal one, so neither can a PCI's script that writes the root's or the body's
   * `style` as plainly as CSSOM writes it (`style.height = …`, `style.cssText`,
   * `removeAttribute("style")`). The pins stay first: a stylesheet a script puts before them, in
   * the head or in the root ahead of it, whose layer would then come first and outrank them as they
   * outrank every later layer, or a removal of their `style` element, the boot undoes in the
   * mutation's own microtask, before the next rendering, by putting the pins back before the
   * document's first `style` or stylesheet link, loaded or not, or first in the head where none is
   * left (`keepPinsFirst`; RED i5: a prepended layer's `overflow: hidden` had left 557 px no
   * pointer could reach). The pins pass each node once, and move at most once in a task, looking
   * once more when that task ends, so a node that comes back before them keeps its place. What
   * still can: a script that puts a stylesheet back before the pins once they have passed it, or
   * puts a new one before them in answer to that last look, a fight that costs the boot two moves
   * for each change while the page renders on; that puts a sheet first after the last look's move
   * and before the timer that ends it, answering nothing, as a 0 ms timer set after an `await` in
   * the moved task is queued, after that look and before its timer (COLD i5: a sheet, a second
   * after an `await`, a third in such a timer, the pins left second, the root's `overflow-y`
   * hidden; a look that looked again would trade moves with a fight, and no bound on that but a
   * tuned count is known); that edits the pins' own sheet through the CSSOM (`insertRule`, a rule's
   * `style.setProperty`); that writes a pinned property with `setProperty(…, "important")`, whose
   * element-attached `!important` declaration sorts before every layer; or that attaches a shadow
   * root to the body and styles the body from inside it with an `!important` `:host` rule, whose
   * inner context sorts before element-attached styles. That is the PCI's code, not its stylesheet;
   * a height it moves the boot stops at its echo. The root cannot host a shadow root.
   *
   * The values are the properties' initial ones, `overflow-y` the viewport's own, so the page lays
   * out as it would without them unless a PCI would have moved one, and they carry no look: no
   * colour, type or spacing of anything a host's theme styles.
   *
   * The body's geometry is pinned as the root's is: its writing mode, the one the
   * root takes as its used writing mode; and its `height`, `min-height` and `max-height`, so a
   * reset's `body { min-height: 100vh }`, which sizes the body from the viewport, does not; what a
   * descendant sizes from the viewport the boot's echo rule stops. Its `position` is not pinned: an
   * absolutely positioned body only overflows the root, which the viewport scrolls (the pin's
   * `@constraint`).
   *
   * @constraint What the pin leaves: content the root holds that overflows its box (a descendant's
   *   transform, absolute position or negative margin; the body's own `position: absolute`, which
   *   takes it out of the root's flow, and the body's size containment, which lays it out as if it
   *   held nothing), which the viewport scrolls; and content sized from the viewport's height (`vh`
   *   units, an orthogonal flow, whose available inline size is the viewport's height), which has no
   *   height to post; the boot stops it within two posts, and the viewport scrolls the rest.
   * @source CSS Writing Modes 4, §8 (the principal writing mode); CSS Cascade 5, §6.1 (cascade
   *   sorting order) and §6.4 (cascade layers); CSS Containment 2 (size containment); Chrome 158,
   *   probed through this page's markup with each property set by a PCI's stylesheet, layered or not,
   *   and by its script.
   * @see https://drafts.csswg.org/css-writing-modes-4/#principal-flow
   * @see https://drafts.csswg.org/css-cascade-5/#cascade-sort
   * @see https://drafts.csswg.org/css-cascade-5/#layering
   * @see https://drafts.csswg.org/css-cascade-5/#unnamed-layers
   * @see https://drafts.csswg.org/css-contain-2/#containment-size
   * @see https://drafts.csswg.org/css-overflow-3/#overflow-propagation
   */
  const pinSheet = `@layer{html{
    contain:none!important;
    content-visibility:visible!important;
    height:auto!important;
    margin:0!important;
    max-height:none!important;
    min-height:auto!important;
    offset-path:none!important;
    overflow-y:auto!important;
    position:static!important;
    rotate:none!important;
    scale:none!important;
    transform:none!important;
    translate:none!important;
    writing-mode:horizontal-tb!important;
    zoom:1!important;
  }body{
    height:auto!important;
    max-height:none!important;
    min-height:auto!important;
    writing-mode:horizontal-tb!important;
  }}`;
  /**
   * The pins' own `style` element, put first in the head as the boot runs, before any PCI code
   * (`pinSheet`): a host's frame page needs none of its own. A page whose policy refuses an inline
   * style leaves the element with no sheet, and the frame fails by name before it boots: a host's
   * `style-src` must allow `'unsafe-inline'`, with no nonce or hash in `style-src` (which would
   * make it ignored), as PCIs' own inline styles need.
   *
   * @constraint HTML's "update a `style` block" returns before it creates the element's sheet where
   *   the content-security policy blocks the element's inline behaviour, so `sheet` stays `null`.
   * @see https://html.spec.whatwg.org/multipage/semantics.html#update-a-style-block
   */
  const pins = document.createElement("style");

  pins.textContent = pinSheet;
  document.head.prepend(pins);

  const definitions = new Map<string, AmdDefinition>();
  const exported = new Map<string, unknown>();
  const builtins = new Map<string, unknown>();
  const factories: PciFactory[] = [];
  /**
   * Each script the loader made, by its element, with the location it loads (`ScriptLoad`).
   */
  const scriptLoads = new Map<Element, ScriptLoad>();
  let dom: HTMLElement | undefined;
  /**
   * The island's device pixel ratio as its `load` gave it, for the frame's first posts.
   */
  let placed = 1;
  let instance: PciInstance | undefined;
  let responseIdentifier = "";
  let relayed: string | undefined;
  let completed = false;

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
   * Report whether a value is a boolean.
   *
   * @param node The value.
   * @returns Whether it is.
   */
  const isBoolean = (node: unknown): node is boolean => typeof node === "boolean";

  /**
   * Report whether a value is a function.
   *
   * @param node The value.
   * @returns Whether it is.
   */
  const isCallable = (node: unknown): node is Callable => typeof node === "function";

  /**
   * Report whether a value is a list of strings.
   *
   * @param node The value.
   * @returns Whether it is.
   */
  const isStringList = (node: unknown): node is readonly string[] =>
    Array.isArray(node) && node.every((item) => isString(item));

  /**
   * Report whether a value is a message the island sends this frame, by its kind and the fields
   * the frame reads.
   *
   * @param node The value.
   * @returns Whether it is.
   */
  const isPageMessage = (node: unknown): node is PageMessage => {
    if (!isObject(node) || !isString(node["nonce"])) {
      return false;
    }

    switch (node["kind"]) {
      case "complete": {
        return true;
      }
      case "instantiate": {
        return isString(node["typeIdentifier"]) && isObject(node["configuration"]);
      }
      case "load": {
        return (
          isString(node["markup"]) &&
          isStringList(node["templates"]) &&
          Array.isArray(node["routes"]) &&
          isString(node["lang"]) &&
          isString(node["dir"]) &&
          isString(node["title"]) &&
          isNumber(node["ratio"])
        );
      }
      case "landed": {
        return (
          isNumber(node["pixels"]) &&
          isNumber(node["from"]) &&
          isNumber(node["height"]) &&
          isNumber(node["ratio"])
        );
      }
      case "settled": {
        return isNumber(node["pixels"]) && isNumber(node["height"]);
      }
      default: {
        return false;
      }
    }
  };

  /**
   * Report whether a value a module registered is a factory the bridge can serve.
   *
   * @param node The value.
   * @returns Whether it is.
   */
  const isFactory = (node: unknown): node is PciFactory =>
    isObject(node) && isString(node["typeIdentifier"]) && isCallable(node["getInstance"]);

  /**
   * Report whether a value a factory returned is a PCI object the host can complete.
   *
   * @param node The value.
   * @returns Whether it is.
   */
  const isInstance = (node: unknown): node is PciInstance =>
    isObject(node) && isCallable(node["getResponse"]) && isCallable(node["getState"]);

  /**
   * Write a value as JSON text, as `JSON.stringify` does, typed as it behaves: it gives undefined,
   * no text, for undefined, a function or a symbol, which the lib's `string` hides.
   *
   * @param value The value.
   * @returns Its JSON text, or undefined where it has none.
   */
  const jsonOf = (value: unknown): string | undefined => JSON.stringify(value);

  /**
   * Post a message to the island, the parent window the frame booted under (`host`). The target
   * origin is `"*"`: an opaque frame cannot name the page's origin, and the island accepts only by
   * source and nonce.
   *
   * @param message The message, carrying the nonce.
   */
  const post = (message: FrameToPage): void => {
    host.postMessage(message, "*");
  };

  /**
   * Give up on the PCI before it runs: tell the island why, in one sentence for its host's log.
   *
   * @param reason The sentence.
   */
  const fail = (reason: string): void => {
    if (instance === undefined) {
      post({ kind: "failed", nonce, reason });
    }
  };

  /**
   * Give the load of the script that is running now, `document.currentScript`, when the loader
   * made it: the location an anonymous `define` it runs belongs to, and an uncaught error it throws
   * fails. None while no script of the loader's runs: in a timer, an event, an animation frame, a
   * script's `load`, or a script a PCI made itself.
   *
   * @returns The load, none where none is running.
   * @constraint A script is the running script through its whole run: its top level, every
   *   microtask that run queued (a promise's `then`, `queueMicrotask`, an `await` chain fifty deep,
   *   a mutation observer's callback), and the `error` event of a throw there or of its own syntax
   *   error, all before its `load`; and only then. HTML sets `currentScript` while it executes a
   *   script element and runs the microtask checkpoint of that run inside it, before it sets it
   *   back. Measured in Chrome 158 through a sandboxed frame, for scripts of the frame's page's
   *   origin and of another (`car-i8/probe/current-script.mjs` in the lane's directory), where a
   *   timer, an animation frame and the `load` listener saw none. A microtask the run sets off for
   *   another script's code (its observer's callback, or a promise it awaits that this run
   *   settles) runs inside this run too, and is taken as this script's.
   * @see https://html.spec.whatwg.org/multipage/scripting.html#execute-the-script-element
   * @see https://html.spec.whatwg.org/multipage/webappapis.html#clean-up-after-running-script
   */
  const runningLoad = (): ScriptLoad | undefined => {
    const running = document.currentScript;

    return running === null ? undefined : scriptLoads.get(running);
  };

  /**
   * Run a module and every dependency it names, once, and give its exported value.
   * `qtiCustomInteractionContext` and `require` are the loader's own; `exports` and `module` are
   * fresh per module, and a factory that returns nothing exports its `exports`. A dependency cycle
   * resolves to `undefined`, as AMD has it.
   *
   * @param id The module id.
   * @param chain The ids being resolved above this one, outermost first.
   * @returns The module's value, or the first dependency no route defined.
   */
  const resolveModule = (id: string, chain: readonly string[]): Resolution => {
    if (builtins.has(id)) {
      return { kind: "resolved", value: builtins.get(id) };
    }

    if (exported.has(id)) {
      return { kind: "resolved", value: exported.get(id) };
    }

    if (chain.includes(id)) {
      return { kind: "resolved", value: undefined };
    }

    const definition = definitions.get(id);

    if (definition === undefined) {
      return { from: chain.at(-1), id, kind: "missing" };
    }

    const next = [...chain, id];
    const moduleRecord: ModuleRecord = { exports: {} };
    const values: unknown[] = [];

    for (const dependency of definition.dependencies) {
      if (dependency === "exports") {
        values.push(moduleRecord.exports);
      } else if (dependency === "module") {
        values.push(moduleRecord);
      } else {
        const resolved = resolveModule(dependency, next);

        if (resolved.kind === "missing") {
          return resolved;
        }

        values.push(resolved.value);
      }
    }

    const returned = isCallable(definition.factory)
      ? definition.factory(...values)
      : definition.factory;
    const value = returned === undefined ? moduleRecord.exports : returned;

    exported.set(id, value);

    return { kind: "resolved", value };
  };

  /**
   * The loader's `require`: one id gives its module's value at once; a list of ids runs the
   * callback with their values. Every module has loaded by the time a factory runs, so both are
   * synchronous.
   *
   * @param ids One id or a list of ids.
   * @param onResolved The function a list of ids is given to.
   * @returns The one module's value, or `undefined` for a list or a module no route defined.
   */
  const requireModule = (...[ids, onResolved]: RequireArguments): unknown => {
    const valueOf = (id: string): unknown => {
      const resolved = resolveModule(id, []);

      return resolved.kind === "resolved" ? resolved.value : undefined;
    };

    if (isString(ids)) {
      return valueOf(ids);
    }

    if (isStringList(ids) && isCallable(onResolved)) {
      onResolved(...ids.map((id) => valueOf(id)));
    }

    return undefined;
  };

  /**
   * Decode what a module handed `define`, once: an id first names it; a list of strings after the
   * id, or first, lists its dependencies; and the argument after them is its factory. A factory
   * with parameters and no dependency list gets `require`, `exports` and `module`.
   *
   * @param given The arguments, as the module wrote them: the first, the second and the third, each
   *   where it gave one.
   * @returns The definition.
   */
  const definitionOf = ([first, second, third]: DefineArguments): Definition => {
    const named = isString(first);
    const afterId = named ? second : first;
    const last = named ? third : second;
    const listed = isStringList(afterId);
    const factory = listed ? last : afterId;
    const wrapped = isCallable(factory) && factory.length > 0;
    const written = listed ? afterId : [];
    const dependencies = written.length === 0 && wrapped ? commonJsNames : written;

    return named
      ? { dependencies, factory, id: first, kind: "named" }
      : { dependencies, factory, kind: "anonymous" };
  };

  /**
   * The AMD `define` of this frame. A define is taken from the script running it
   * (`runningLoad`): an anonymous one is the module of that script's route, and a named one the
   * module it names. One whose script's load is decided, its wait run out or its own uncaught
   * error reported, is set aside, so a late script changes no module after its route has gone on.
   * An anonymous define that no script of the loader's runs names no module and is refused by name.
   *
   * @constraint An anonymous define's module is the route of the script running it, never the
   *   route loading when it runs: a primary that answers after its wait ran out still runs, while
   *   the next route loads, and its module taken for that route would load it though its own
   *   script defined nothing (RED i4, follow-up 1). RequireJS names an anonymous define by the
   *   script running it where a script's `load` does not follow its run at once, the script in its
   *   `interactive` state, and refuses one it cannot tie to a script it loads, "Mismatched
   *   anonymous define() module".
   * @source RequireJS 2.3.7, `require.js`: `define` (lines 2062–2127) takes the name of an
   *   anonymous define from `getInteractiveScript()` (lines 1994–2005), the script whose
   *   `readyState` is `interactive`, its `data-requiremodule`; `intakeDefines` (lines 1245–1264)
   *   fails an anonymous define met outside a script's `completeLoad` with the `mismatch` error.
   * @see https://github.com/requirejs/requirejs/blob/2.3.7/require.js
   */
  const define: AmdDefine = Object.assign(
    (...given: DefineArguments): void => {
      const definition = definitionOf(given);
      const running = runningLoad();
      const id = definition.kind === "named" ? definition.id : running?.id;

      if (id === undefined) {
        fail(
          "An anonymous define() ran outside every module script this frame loaded, in a later task or in a script the PCI added itself, so it names no module and was refused. Define a module while its own script runs, and list each script that defines one anonymously among the PCI's modules.",
        );
      } else if (running?.loading !== false) {
        definitions.set(id, {
          dependencies: definition.dependencies,
          factory: definition.factory,
        });
      }
    },
    { amd: {} },
  );

  /**
   * The `qtiCustomInteractionContext` bridge of this frame.
   */
  const bridge: Bridge = {
    getInstance: (typeIdentifier, element, configuration, state) =>
      factories
        .find((factory) => factory.typeIdentifier === typeIdentifier)
        ?.getInstance(element, configuration, state),
    register: (factory) => {
      if (isFactory(factory)) {
        factories.push(factory);
      }
    },
  };

  /**
   * Load one script and wait for its `load` or `error`: loaded when the module is defined by the
   * time the script ran; failed when the script does not load, when it loads defining no such
   * module (an empty script defines nothing), when it throws an uncaught error as it runs, or
   * when a wait is given and runs out first. Only a primary with a fallback after it is given a
   * wait, since a timeout means nothing but "load the fallback" (R3 of `#plate/pci/resolve.ts`,
   * reading `pci-wait-before-fallback`): any other location waits for its script however long it
   * takes. A wait of 0 is no limit, and so is a wait longer than a timer holds: HTML's `setTimeout`
   * takes its delay as a WebIDL `long`, milliseconds in a 32-bit signed integer, and a longer delay
   * wraps, so it fires early, at once just past the bound, which would cut short a wait a
   * configuration stated as longer than any session (reading `pci-configuration-waits`: a stated
   * wait is never dropped). That is the cost of no clock: a lone location whose script never
   * answers, neither loading nor failing, leaves the frame loading, named by no failure of the
   * frame's; the island hears neither `registered` nor `failed`, and in the suites the gate's
   * progress watch judges the hang.
   *
   * @param id The route's module id, which an anonymous define its script runs takes.
   * @param url The script's absolute URL.
   * @param waitSeconds How long to wait before the fallback loads instead, 0 for no limit, as for
   *   every location but a primary with a fallback.
   * @returns How the load came out.
   * @constraint A module is defined while its script runs, or not at all: the load is decided at
   *   the script's `load`, so a module whose script defines it only in a later task, a timer's, or a
   *   promise's that settles in a later task (after a fetch, say), is refused by name, "defined no
   *   module", or its fallback loads where it has one. A promise that settles while the script runs
   *   defines it in a microtask, before the `load`, and it loads. No clock waits on a script that
   *   has run (reading `pci-wait-before-fallback`).
   * @source RequireJS 2.3.7, `require.js`: `onScriptLoad` runs `completeLoad` at the script's
   *   `load`, which takes the `define` calls made by then and, under `enforceDefine`, fails a module
   *   that made none, "No define call for" it, or loads its path fallback.
   * @see https://html.spec.whatwg.org/multipage/timers-and-user-prompts.html#timers
   * @see https://github.com/requirejs/requirejs/blob/2.3.7/require.js
   */
  const loadLocation = (id: string, url: string, waitSeconds: number): Promise<Outcome> => {
    const { promise, resolve } = Promise.withResolvers<Outcome>();
    const script = document.createElement("script");
    let timer: ReturnType<typeof setTimeout> | undefined;
    const scriptLoad: ScriptLoad = {
      id,
      loading: true,
      settle: (outcome) => {
        if (!scriptLoad.loading) {
          return;
        }

        scriptLoad.loading = false;
        clearTimeout(timer);
        resolve(outcome);
      },
    };
    const { settle } = scriptLoad;

    scriptLoads.set(script, scriptLoad);
    script.addEventListener("error", () => {
      settle({ kind: "failed", reason: `The module script at ${url} did not load.` });
    });
    script.addEventListener("load", () => {
      settle(
        definitions.has(id)
          ? { kind: "loaded" }
          : { kind: "failed", reason: `The module script at ${url} defined no module "${id}".` },
      );
    });

    if (waitSeconds > 0 && waitSeconds * 1000 <= longestTimerMs) {
      timer = setTimeout(() => {
        settle({
          kind: "failed",
          reason: `The module script at ${url} did not load within ${String(waitSeconds)} seconds.`,
        });
      }, waitSeconds * 1000);
    }

    script.src = url;
    document.head.append(script);

    return promise;
  };

  /**
   * Load one route: its primary location, waited for as long as its fallback says, then its
   * fallback when the primary fails, waited for however long it takes. A route with no location
   * loads nothing and is no failure; a route with no fallback has no second chance, so its
   * primary is waited for however long it takes too. A route whose fallback fails as well fails
   * with both reasons, the primary's first, so an author reads why the primary was left (its wait
   * run out, its script not loaded, or no module defined) beside why the fallback failed.
   *
   * @param route The route.
   * @returns How the route came out.
   */
  const loadRoute = async ({ fallback, id, primary }: PciFrameRoute): Promise<Outcome> => {
    const first =
      primary === undefined
        ? undefined
        : await loadLocation(id, primary, fallback?.primaryWaitSeconds ?? 0);

    if (first?.kind === "loaded" || fallback === undefined) {
      return first ?? { kind: "loaded" };
    }

    const second = await loadLocation(id, fallback.location, 0);

    return first === undefined || second.kind === "loaded"
      ? second
      : { kind: "failed", reason: `${first.reason} ${second.reason}` };
  };

  /**
   * Load routes in order, one at a time, stopping at the first that fails, so no route after a
   * failure loads.
   *
   * @param routes The routes.
   * @returns Loaded, or the first failure.
   */
  const loadRoutes = async (routes: readonly PciFrameRoute[]): Promise<Outcome> => {
    const [first, ...rest] = routes;

    if (first === undefined) {
      return { kind: "loaded" };
    }

    const outcome = await loadRoute(first);

    return outcome.kind === "failed" ? outcome : await loadRoutes(rest);
  };

  /**
   * Relay the PCI's response when it differs from the last one relayed, by its JSON text.
   *
   * @param value The response, in the Appendix C JSON binding, or `undefined` for none.
   * @param valid What the PCI said of its validity, `undefined` when it said nothing.
   * @param identifier The response identifier it names.
   */
  const relay = (value: unknown, valid: boolean | undefined, identifier: string): void => {
    const text = jsonOf(value) ?? "undefined";

    if (text !== relayed) {
      relayed = text;
      post({ kind: "changed", nonce, responseIdentifier: identifier, valid, value });
    }
  };

  /**
   * Relay `qti-interaction-changed`: the event's `detail.value` when it carries one, else the
   * PCI's `getResponse()`; `valid` when the detail carries it.
   *
   * @param event The event, fired at the `dom`.
   */
  const onChanged = (event: Event): void => {
    const detail: unknown = event instanceof CustomEvent ? event.detail : undefined;
    const fields = isObject(detail) ? detail : {};
    const given = fields["interaction"];
    const interaction = isInstance(given) ? given : instance;

    if (interaction === undefined || completed) {
      return;
    }

    const { valid } = fields;
    const named = fields["responseIdentifier"];

    relay(
      "value" in fields ? fields["value"] : interaction.getResponse(),
      isBoolean(valid) ? valid : undefined,
      isString(named) ? named : responseIdentifier,
    );
  };

  /**
   * Read the PCI's response after an input event the frame saw, once the PCI's own handlers have
   * run, and relay it when it changed.
   */
  const onInput = (): void => {
    setTimeout(() => {
      if (instance !== undefined && !completed) {
        relay(instance.getResponse(), undefined, responseIdentifier);
      }
    }, 0);
  };

  /**
   * Complete the PCI, once: `getResponse()`, then `getState()`, then `oncompleted()` when it has
   * one, and tell the island the two values.
   */
  const complete = (): void => {
    if (completed) {
      return;
    }

    completed = true;

    const response = instance?.getResponse();
    const state = instance?.getState();

    instance?.oncompleted?.();
    post({ kind: "completed", nonce, response, state });
  };

  /**
   * Build the element the PCI is handed as its `dom` from the island's content, then load the
   * routes and run the modules, and tell the island what they registered.
   *
   * @param routes The routes, absolute.
   * @param entry The entry module's id, when the PCI names one.
   * @returns Once the island has been told.
   */
  const start = async (
    routes: readonly PciFrameRoute[],
    entry: string | undefined,
  ): Promise<void> => {
    const entryFirst = [
      ...routes.filter((route) => route.id === entry),
      ...routes.filter((route) => route.id !== entry),
    ];
    const outcome = await loadRoutes(entryFirst);

    if (outcome.kind === "failed") {
      fail(outcome.reason);

      return;
    }

    const ids =
      entry === undefined
        ? routes.map((route) => route.id).filter((id) => definitions.has(id))
        : [entry];
    const missing = ids
      .map((id) => resolveModule(id, []))
      .find((resolution) => resolution.kind === "missing");

    if (missing?.kind === "missing") {
      fail(
        missing.from === undefined
          ? `The entry module "${missing.id}" was not defined by any route.`
          : `The module "${missing.from}" depends on "${missing.id}", which no route defines.`,
      );

      return;
    }

    post({
      kind: "registered",
      nonce,
      typeIdentifiers: factories.map((factory) => factory.typeIdentifier),
    });
  };

  /**
   * Take the island's content: the `dom` with the markup and each template at its end, the
   * document's language, direction and title; then start loading.
   *
   * @param message The island's `load`.
   */
  const load = (message: Extract<PageMessage, { readonly kind: "load" }>): void => {
    if (dom !== undefined) {
      return;
    }

    const made = document.createElement("div");

    made.dataset["pciDom"] = "";
    made.innerHTML = message.markup;

    for (const content of message.templates) {
      const template = document.createElement("template");

      template.innerHTML = content;
      made.append(template);
    }

    dom = made;
    placed = message.ratio;
    document.documentElement.lang = message.lang;
    document.documentElement.dir = message.dir;
    document.title = message.title;
    document.body.append(made);
    made.addEventListener("qti-interaction-changed", onChanged);
    void start(message.routes, message.entry);
  };

  /**
   * Render the PCI the island chose: the bridge calls the factory's `getInstance` with the
   * island's configuration, the bridge's `onready` and `ondone`, and the island's state.
   *
   * @param message The island's choice.
   */
  const instantiate = (message: Extract<PageMessage, { readonly kind: "instantiate" }>): void => {
    if (dom === undefined || instance !== undefined) {
      return;
    }

    const configuration: GivenConfiguration = {
      ...message.configuration,
      ondone: (...[, response, state, status]) => {
        post({ kind: "done", nonce, response, state, status });
      },
      onready: (_interaction, state) => {
        post({ kind: "ready", nonce, state });
      },
    };

    ({ responseIdentifier } = message.configuration);

    const made = bridge.getInstance(message.typeIdentifier, dom, configuration, message.state);

    if (isInstance(made)) {
      instance = made;
    } else {
      fail(
        `No registered factory serves the type identifier "${message.typeIdentifier}", or its getInstance returned no interaction.`,
      );
    }
  };

  builtins.set(bridgeId, bridge);
  builtins.set("require", requireModule);
  Object.assign(window, { define, qtiCustomInteractionContext: bridge });
  window.addEventListener("error", (event: ErrorEvent) => {
    const reason = event.message === "" ? "A script in the frame threw." : event.message;
    const running = runningLoad();

    if (running === undefined) {
      fail(reason);
    } else {
      running.settle({ kind: "failed", reason });
    }
  });
  window.addEventListener("unhandledrejection", (event: PromiseRejectionEvent) => {
    const cause: unknown = event.reason;

    fail(
      isObject(cause) && isString(cause["message"])
        ? cause["message"]
        : "A promise in the frame was rejected.",
    );
  });
  window.addEventListener("pagehide", (event: PageTransitionEvent) => {
    if (!event.persisted) {
      complete();
    }
  });

  for (const name of inputEvents) {
    document.addEventListener(name, onInput, { capture: true });
  }

  /**
   * Measure the frame's resolution, its zoom times its device's pixel ratio, by halving the range
   * of `min-resolution` queries it matches, from nothing to 64 dppx, down to 1/64 dppx.
   *
   * @returns The resolution, in dots per CSS pixel, to within 1/64.
   */
  const resolution = (): number => {
    let low = 0;
    let high = 64;

    while (high - low > layoutUnit) {
      const middle = (low + high) / 2;

      if (matchMedia(`(min-resolution: ${String(middle)}dppx)`).matches) {
        low = middle;
      } else {
        high = middle;
      }
    }

    return Math.max(low, layoutUnit);
  };

  /**
   * The scale of the unit a measurement resolves, each box and each viewport to the layout unit of
   * a device pixel: 1 where the resolution, the zoom times the device's pixel ratio, is 1 or more,
   * so that unit is 1/64 of a CSS pixel or less; below 1, `1 / resolution` rounded up, the CSS
   * pixels one device pixel takes.
   *
   * @returns The scale.
   * @see https://drafts.csswg.org/mediaqueries-4/#resolution
   */
  const resolved = (): number =>
    matchMedia("(min-resolution: 1dppx)").matches ? 1 : Math.ceil(1 / resolution());

  /**
   * Measure the viewport's height, by halving the range of `min-height` queries it matches, from
   * nothing to Chrome's layout limit, 33,554,432 px, down to its layout unit, 1/64 px, the finest
   * length a media query tells apart: the greatest height it matches, less that unit, since a range
   * query matches a viewport within 1/64 px on the near side of it.
   *
   * @returns The height, in CSS pixels, to within 1/64 px below it.
   * @source Chrome 158, measured through a frame (`car-i7/probe/mq-epsilon.mjs` in the lane's
   *   directory): a viewport of 300 px matches `(min-height: 300.015625px)` and `(max-height:
   *   299.984375px)`, and `(height: Xpx)` within 1/64 px either side, on device ratios of 1, 1.25
   *   and 2.
   * @see https://drafts.csswg.org/mediaqueries-4/#height
   */
  const measured = (): number => {
    let low = 0;
    let high = layoutLimit;

    while (high - low > layoutUnit) {
      const middle = (low + high) / 2;

      if (matchMedia(`(min-height: ${String(middle)}px)`).matches) {
        low = middle;
      } else {
        high = middle;
      }
    }

    return low - layoutUnit;
  };
  /**
   * The height the frame last posted, none before its first; whether the viewport stood at that
   * height when the frame last looked, at its last observation or in a timer after its last
   * `resize`; the root's inline size at the last observation; and the echoes since the last post
   * that was no echo's (`Followed`).
   */
  const height: Followed = {
    atPosted: false,
    block: 0,
    crossed: false,
    deferred: undefined,
    dropped: undefined,
    early: false,
    endured: false,
    fit: undefined,
    from: undefined,
    inline: undefined,
    lookedAt: undefined,
    looking: false,
    moved: false,
    posted: undefined,
    ratio: 1,
    rechained: false,
    scale: undefined,
    settled: false,
    signalled: false,
    slope: undefined,
    spent: false,
    stirred: false,
    stood: measured(),
    unseen: false,
  };

  /**
   * The least change of a post the island's pixels can show, from the island's device pixel ratio
   * `D′` (the device's ratio times any browser zoom) and the frame's resolution `r`, the zoom of
   * the frame's element times `D′`: the island lays the element out in its own pixels, the zoom `z
   * = r / D′` of them to a frame pixel, so a post that moves the element by `ceil(1 / D′)` host
   * pixels moves it by a device pixel at least; that is `ceil(ceil(1 / D′) / z)` frame pixels. It
   * does not always move the viewport, which Chrome rounds in more than one stage (COLD i7″: 1.5
   * host pixels at 1.25 × 0.75 left it where it stood), so a probe it does not move goes twice as
   * far (`probedAt`), and no echo waits for a move (`settledAt`). The frame cannot see `z` without
   * `D′`: its own `devicePixelRatio` and `resolution` carry only their product, and a step of one
   * pixel left the viewport where it stood at 23, 21, 59 and 29 of 117 stops at zooms 0.8, 0.9, 0.5
   * and 0.75 on ratios 1.25, 1.25, 2 and 1.5, and none with this step, at those and ten more pairs
   * (`car-i7/residue-a/visible.mjs`, Chrome 158 on its own device scale factor).
   *
   * @returns The step, in CSS pixels.
   */
  const step = (): number => {
    const { ratio } = height;

    return Math.ceil((Math.ceil(1 / ratio) * ratio) / resolution() - layoutUnit);
  };

  /**
   * Post a height, and note it as the last posted, its settling to come and no signal or change
   * since: a height less than the step from the last post (`step`) is no post the island's pixels
   * can be sure to show, so a rise is posted as the step, which the content fits, and a fall as
   * the last post again, whose frame the content still fits; and no post is above the content last
   * observed plus the viewport as measured now. Every post of the frame's is made here, so no
   * branch posts above that bound.
   *
   * @param pixels The height, in CSS pixels.
   * @constraint A bound taken only where an estimate was posted let other posts past it: a host
   *   that tweened the frame's height by script saw posts 9015 px above the content plus the
   *   viewport, and one with a CSS transition on it 117 px (RED i7″).
   */
  const postPixels = (pixels: number): void => {
    const { block, posted } = height;
    const least = step();
    const sure =
      posted === undefined || Math.abs(pixels - posted) >= least
        ? pixels
        : posted + (pixels > posted ? least : 0);
    const clamped = Math.min(sure, Math.ceil(block + measured()));

    height.posted = clamped;
    height.signalled = false;
    height.crossed = false;
    height.atPosted = false;
    height.early = false;
    height.endured = false;
    height.from = undefined;
    height.lookedAt = undefined;
    height.moved = false;
    height.settled = false;
    post({ kind: "height", nonce, pixels: clamped });
  };

  /**
   * Note a mutation of the document, a content signal that comes before the observation of the
   * layout it changes, in the microtask after the script that mutated: it posts no dropped echo,
   * since the change it signals is observed itself, after it; it only marks that a signal came
   * since the last post, so a drop that observation makes is posted at once (`held`). A mutation
   * that posted a dropped echo posted a stale one: under a change made every 400 ms beside two
   * full-height panels, each toggle's mutation posted the panels' overflow, the frame doubling at
   * each, to Chrome's 33,554,432 px limit in 9 s (COLD i6).
   */
  const noted = (): void => {
    height.signalled = true;
  };

  /**
   * Take a content event, an element's `load` or `error`, a transition's or an animation's end, or
   * a font face loaded, each of which comes after the observation of the layout it reports, and
   * note it: where the frame dropped an echo that may hold a change of its own, post that echo's
   * height, once until the next post that is no echo's, its echo checked against the kept slope
   * where one is kept and the chain did not start off it (`postHeight`). A signal decides no echo:
   * a PCI that writes the document every frame would leave none.
   */
  const signal = (): void => {
    noted();

    const { dropped, rechained, slope } = height;

    if (dropped === undefined) {
      return;
    }

    height.dropped = undefined;
    height.spent = true;
    height.fit =
      slope === undefined || rechained
        ? { stage: "stopped" }
        : { sample: dropped, slope, stage: "followed" };
    postPixels(Math.ceil(dropped.content));
  };

  /**
   * The document's font faces the frame has taken a signal from, each once.
   */
  const watchedFaces = new WeakSet<FontFace>();

  /**
   * Signal once a font face's load has settled, loaded or failed.
   *
   * @param face The face.
   */
  const loadOf = async (face: FontFace): Promise<void> => {
    await Promise.allSettled([face.loaded]);
    signal();
  };

  /**
   * Take each font face of the document's as a content event at its load, once: its `loaded`
   * promise settling, loaded or failed, signals (`signal`); a face loaded before the frame saw it
   * signals at once, which costs at most the post of a drop the frame holds. Looked for at each
   * observation of the root's box, the first at the boot: a face that joins and loads between two
   * observations joined with a mutation of the document, which marks the next drop held (`held`)
   * unless a post comes between.
   *
   * @constraint A face's swap is a reflow the root's `ResizeObserver` observes, but it can land in
   *   the very rendering the frame takes as a post's echo, which is dropped like a picture's, and
   *   only a content signal posts a dropped echo (`signal`). Safari fires no `FontFaceSet` event,
   *   neither `loading` nor `loadingdone`, before 26.2 (WebKit bug 304091; compat data marks them
   *   partial), so a frame that signalled at `loadingdone` kept a stale height beside a late web font
   *   there. A face's `loaded` settles in both engines of the floor, Chrome 131 and Safari 18.1,
   *   before the swap's observation or after it alike: one before marks the drop that observation
   *   makes as held (`held`), one after posts it.
   * @see https://drafts.csswg.org/css-font-loading/#dom-fontface-loaded
   * @see https://bugs.webkit.org/show_bug.cgi?id=304091
   */
  const watchFaces = (): void => {
    for (const face of document.fonts) {
      if (!watchedFaces.has(face)) {
        watchedFaces.add(face);
        void loadOf(face);
      }
    }
  };

  /**
   * The slope of the line through two echoes: how much the content grows for each pixel of the
   * viewport's height, the viewports as measured; exactly 1 where the content grew as much as the
   * viewport moved to within what the four measurements resolve, each box and each viewport to its
   * unit, the layout unit of a device pixel, 1/64 of a CSS pixel or less where the resolution is 1
   * or more and 1/64 of the quantum or less below it (`quantum`).
   *
   * @param from The earlier echo.
   * @param to The later echo.
   * @returns The slope.
   * @constraint Content that grows as fast as the viewport, `V + c`, has a slope of 1, no fixed
   *   point; one a hair below 1 has a fixed point beyond any height, which the bound posts, content
   *   plus viewport, and each such post's chain posts it again. At a zoom the posts' viewports lie
   *   up to half a host pixel off the posts, and the viewports measured to 1/64 px: a heading over
   *   a 100vh block from a viewport of 120 at a zoom of 1.25 read 0.998 from the posts, and 0.9998
   *   from the viewports measured, and grew to 16,653,994 px in 10 s of a toggle every 400 ms
   *   (`car-i7/probe/` in the lane's directory). A slope is 1 or not to within what it resolves.
   */
  const slopeOf = (from: Echoed, to: Echoed): number => {
    const grown = to.content - from.content;
    const moved = to.at - from.at;

    return Math.abs(grown - moved) <= 4 * layoutUnit * resolved() ? 1 : grown / moved;
  };

  /**
   * The fixed point of the line of a slope through an echo, `c / (1 − a)`, where the slope `a`
   * lies between 0 and 1 and the point is above 0; none otherwise.
   *
   * @param slope The line's slope.
   * @param through An echo the line passes through.
   * @returns The fixed point, in CSS pixels, unrounded.
   */
  const fixedPoint = (slope: number, through: Echoed): number | undefined => {
    const fixed = (through.content - slope * through.at) / (1 - slope);

    return slope > 0 && slope < 1 && fixed > 0 ? fixed : undefined;
  };

  /**
   * Post a dropped echo at once where a content signal has come since the last post: a PCI's own
   * drawing signals before the observation it lands in, and raises none after (`postHeight`).
   */
  const held = (): void => {
    if (height.signalled) {
      signal();
    }
  };

  /**
   * Post a height that starts a chain of echoes: no fit yet, no drop, no signal spent.
   *
   * @param pixels The height, in CSS pixels.
   * @param off Whether the chain starts because a post's echo was off the kept slope; such a
   *   chain's signalled drop is not checked against a slope again, so a content no line describes
   *   starts at most one chain more for each change.
   */
  const chained = (pixels: number, off: boolean): void => {
    height.dropped = undefined;
    height.fit = undefined;
    height.rechained = off;
    height.spent = false;
    postPixels(pixels);
  };

  /**
   * At the echo of the first echo's post, fit the line through the two, and keep its slope: post
   * its fixed point where the content contracts, or drop the echo, kept for a signal unless its
   * content grows as fast as the viewport, `V + c`.
   *
   * @param first The first echo.
   * @param sample This echo.
   */
  const fitted = (first: Echoed, sample: Echoed): void => {
    if (Math.abs(sample.at - first.at) <= 2 * layoutUnit * resolved()) {
      height.fit = { stage: "stopped" };

      return;
    }

    const slope = slopeOf(first, sample);
    const fixed = fixedPoint(slope, sample);

    height.slope = slope;

    if (fixed !== undefined) {
      height.fit = { sample, stage: "estimated" };
      postPixels(Math.ceil(fixed));

      return;
    }

    height.dropped = slope === 1 ? undefined : sample;
    held();
  };

  /**
   * At the echo of an estimate, check it: where the content's own height is the one posted, so no
   * post shows it better, or the viewport did not move from the estimate's sample, a host holding
   * the frame, stop; where not, refit once, through the echo the estimate came from and this one,
   * keeping that slope, and post that fixed point, or the content's own height where the line has
   * none or the refit did not fit either; that post's echo is checked against the kept slope as a
   * followed change's is, so a change that came with this echo is fitted from its own two samples.
   *
   * @param fit The fit, an estimate or a refit posted.
   * @param sample This echo.
   * @param pixels This echo's content, rounded up.
   */
  const checked = (
    fit: { readonly sample: Echoed; readonly stage: "estimated" | "refitted" },
    sample: Echoed,
    pixels: number,
  ): void => {
    if (
      pixels === sample.viewport ||
      Math.abs(sample.at - fit.sample.at) <= 2 * layoutUnit * resolved()
    ) {
      height.fit = { stage: "stopped" };

      return;
    }

    const slope = fit.stage === "estimated" ? slopeOf(fit.sample, sample) : undefined;
    const fixed = slope === undefined ? undefined : fixedPoint(slope, sample);
    const kept = slope ?? height.slope;

    height.slope = kept;

    if (fixed !== undefined) {
      height.fit = { sample, stage: "refitted" };
      postPixels(Math.ceil(fixed));

      return;
    }

    height.fit =
      kept === undefined || height.rechained
        ? { stage: "stopped" }
        : { sample, slope: kept, stage: "followed" };
    postPixels(pixels);
  };

  /**
   * At the echo of a post that followed a change by the kept slope, a change at a fixed viewport
   * or a dropped echo a signal posted, check that the content grew with the viewport as the slope
   * says, to within the pixel a post rounds to: then stop; or, where it did not, its content is no
   * longer that line, and the change's sample and this echo, both past the change, give the line it
   * is: fit it, once for the change, as the first two echoes are fitted (RED i6: a picture laid out
   * between the two echoes of `50vh` content skews the slope, and its `load` posted a height whose
   * echo was dropped, the frame left 34 to 50 px short in 13 trials of 24).
   *
   * @param fit The fit, the change followed.
   * @param sample This echo.
   */
  const matched = (
    fit: { readonly sample: Echoed; readonly slope: number },
    sample: Echoed,
  ): void => {
    const expected = fit.sample.content + fit.slope * (sample.at - fit.sample.at);

    if (Math.abs(sample.content - expected) < 1) {
      height.fit = { stage: "stopped" };

      return;
    }

    height.fit = { stage: "stopped" };
    height.rechained = true;
    height.spent = false;
    fitted(fit.sample, sample);
  };

  /**
   * Follow a change of the content at a fixed viewport, the frame's width as it was, by the slope
   * its last line measured, starting no chain: where the content contracts, post the fixed point
   * of the line of that slope through the content now, which its echo checks as an estimate's;
   * where it grows at least as fast as the viewport and still overflows the frame, post one
   * quantum below the stop, whose echo tells whether that slope still holds (`probed`); where the
   * last post was the content's own height, post that post plus the change, which its echo checks
   * against the slope. Otherwise, where that height is none, the post was not the content's, or
   * content that grew with the viewport now fits within it, the content is no longer that line:
   * forget the slope and start a chain.
   *
   * @param slope The kept slope.
   * @param sample The content now, at the viewport it stands in.
   * @param before The content at the last observation, unrounded.
   * @param pixels The content now, rounded up.
   * @constraint A following step starts only from a post that was the content's own height, since
   *   it adds the change to the post: after the flip the frame stands short, 477 for 877, its kept
   *   slope −1, and a change followed from there landed below content that no longer depends on
   *   the viewport, for good (RED i7: the flip's `.x` removed and its block set to 385 px gave a
   *   1 px frame for 401). The viewport the frame stands in does not tell it: a host's
   *   `min-height: 700px` beside `calc(900px − 50vh)` holds the frame above its post, 533, so a
   *   frame judged to fit by its viewport followed each 20 px from that post, 553 for 586, posting
   *   below its content at every change.
   * @constraint One viewport cannot tell content of slope 1 or more beside a change, which no
   *   height fits, from content whose slope the change itself changed: a full-height splash
   *   replaced by 1500 px of the task stayed at 182 for 1516, for good (COLD i7's SC2). So the
   *   frame takes a second sample one quantum below its stop, the least height whose viewport is
   *   another: a whole pixel, or, where a zoom below 1 lets two posts share a viewport, the pixels
   *   one host pixel takes (`quantum`). Where its echo shows the kept line, the frame goes back to
   *   its stop, two posts and a move of one quantum; where not, a chain starts there, under the
   *   chain's own bound.
   */
  const changed = (slope: number, sample: Echoed, before: number, pixels: number): void => {
    const fixed = fixedPoint(slope, sample);
    const followed = Math.ceil(sample.viewport + sample.content - before);
    const fit = Math.ceil(before) === sample.viewport;

    height.dropped = undefined;
    height.rechained = false;
    height.spent = false;

    if (fixed !== undefined) {
      height.fit = { sample, stage: "estimated" };
      postPixels(Math.ceil(fixed));

      return;
    }

    if (slope >= 1 && sample.content > sample.at + layoutUnit) {
      height.fit = { reach: step(), sample, slope, stage: "probed" };
      postPixels(sample.viewport - step());

      return;
    }

    if (slope < 1 && fit && followed > 0) {
      height.fit = { sample, slope, stage: "followed" };
      postPixels(followed);

      return;
    }

    height.slope = undefined;
    chained(pixels, false);
  };

  /**
   * At the echo of a probe one quantum below the stop, take the line of the content through the
   * stop and the probe, both past the change, the viewports measured: where it still grows at
   * least as fast as the viewport, the kept slope holding or a new one the change set, and the
   * content still overflows the probe, no height fits it, as a chain's own stop rule finds, so go
   * back to the stop, keeping that slope; otherwise the change made content some height fits, so
   * forget the slope and start a chain from the content there, under a chain's own bound. Each is
   * judged to within what the four measurements resolve, each box and each viewport to its unit,
   * the layout unit of a device pixel, which is 1/64 of a CSS pixel or less where the resolution
   * is 1 or more, and 1/64 of `resolved` or less below it. The two samples are no line where a
   * change came between the probe's post and its echo, a mutation or a content event (`signalled`)
   * or an observation that waited for the echo (`crossed`): then the frame goes back to its stop,
   * keeping the slope. Where the viewport did not move, the pipeline from the island's pixels to
   * the frame's swallowed the probe, or a host holds the frame: the frame probes again twice as far
   * below its stop, until the probe would reach the top of the frame, and then goes back.
   *
   * @param fit The probe.
   * @param sample This echo.
   * @param pixels This echo's content, rounded up.
   * @constraint A chain started at every change whose probe found the kept slope gone re-added the
   *   overflow of content whose slope the change itself sets: COLD i6's P6, two panels whose
   *   height is `2V` or `2.5V` in turn, grew from 1248 to 491,536,476 px in ten changes, three posts
   *   a change, and P2 and P11 alike. A line of slope 1 or more through the stop and the probe has
   *   no height that fits, so the frame goes back to its stop, two posts a change.
   * @constraint No move of the frame element is sure to move its viewport: at a device ratio of 1.25
   *   and a zoom of 0.75 a probe moved the element by 1.5 host pixels and the viewport stayed at
   *   184.536, Chrome rounding in more than one stage, and a frame that waited for the move stood
   *   at 184 for 1517 for good (COLD i7″, SC2). The doubling ends: it stops at the frame's top.
   * @constraint A change landing in the probe's own echo made the two samples read a slope below 1,
   *   and the chain started from the overflowing content's own height re-added the overflow at
   *   each: two panels with 20 px toggled every frame reached 172,344 px in 2 s, and a block
   *   growing a pixel a frame beside a heading over `100vh` 7928 for 8136 (COLD i7′, RT3 and RT1).
   */
  const probedAt = (
    fit: { readonly reach: number; readonly sample: Echoed; readonly slope: number },
    sample: Echoed,
    pixels: number,
  ): void => {
    const unit = layoutUnit * resolved();
    const moved = fit.sample.at - sample.at;
    const grown = fit.sample.content - sample.content;
    const clean = !height.crossed && !height.signalled;
    const line = clean && Math.abs(moved) > 2 * unit;
    const deeper = 2 * fit.reach;

    if (clean && !line && deeper < fit.sample.viewport) {
      height.fit = { ...fit, reach: deeper, stage: "probed" };
      postPixels(fit.sample.viewport - deeper);

      return;
    }

    if (
      !line ||
      (grown / moved >= 1 - (4 * unit) / moved && sample.content > sample.at + layoutUnit)
    ) {
      const kept = line ? Math.max(grown / moved, 1) : fit.slope;

      height.slope = kept;
      height.fit = { sample: fit.sample, slope: kept, stage: "returned" };
      postPixels(fit.sample.viewport);

      return;
    }

    height.slope = undefined;
    chained(pixels, false);
  };

  /**
   * At the echo of the stop a probe went back to, check the content against the line kept through
   * the stop: where it lies on it, stop; where it does not, the content changed while the probe was
   * on its way or since, and that change, seen only now, is followed as a change at a fixed
   * viewport is (`changed`).
   *
   * @param fit The stop gone back to, its sample and the kept slope.
   * @param sample This echo.
   * @param pixels This echo's content, rounded up.
   * @constraint A stop gone back to whose echo was spent took no change: `50vh` over 300 px beside
   *   a block growing a pixel every frame for 2 s ended 110 px short once the growth stopped, the
   *   last frames' growth landing in a probe's echo and the stop's after it (COLD i7″, RT5).
   */
  const returnedAt = (
    fit: { readonly sample: Echoed; readonly slope: number },
    sample: Echoed,
    pixels: number,
  ): void => {
    const along = fit.sample.content + fit.slope * (sample.at - fit.sample.at);

    height.fit = { stage: "stopped" };

    if (Math.abs(sample.content - along) >= 1) {
      changed(fit.slope, sample, along, pixels);
    }
  };

  /**
   * Take an echo that checks a post: an estimate's or a refit's (`checked`), a followed change's
   * (`matched`), a probe's (`probedAt`), or the stop's a probe went back to (`returnedAt`).
   *
   * @param fit The fit, a post to check.
   * @param sample This echo.
   * @param pixels This echo's content, rounded up.
   */
  const verified = (
    fit: Exclude<Fit, { readonly stage: "sampled" | "stopped" }>,
    sample: Echoed,
    pixels: number,
  ): void => {
    if (fit.stage === "followed") {
      matched(fit, sample);

      return;
    }

    if (fit.stage === "probed") {
      probedAt(fit, sample, pixels);

      return;
    }

    if (fit.stage === "returned") {
      returnedAt(fit, sample, pixels);

      return;
    }

    checked(fit, sample, pixels);
  };

  /**
   * The CSS transitions running in the document that can move a box, their property not one that
   * only paints (`paintOnly`): their frames change the root's box each frame, and one on a
   * viewport length restarts at each post, since a post moves the viewport. An animation that is
   * no transition is not among them: an infinite one would never end to be judged at.
   *
   * @returns The transitions.
   */
  const transitions = (): readonly Animation[] =>
    document
      .getAnimations()
      .filter(
        (animation) =>
          "transitionProperty" in animation &&
          animation.playState === "running" &&
          !paintOnly.has(String(animation.transitionProperty)),
      );

  /**
   * Tell whether the viewport still stands where the frame last judged it, as measured, past the
   * 1/64 px a range query matches beyond its value (`measured`).
   *
   * @returns Whether it does.
   */
  const stands = (): boolean => {
    const { stood } = height;

    return matchMedia(
      `(min-height: ${String(stood - 2 * layoutUnit)}px) and (max-height: ${String(stood + 2 * layoutUnit)}px)`,
    ).matches;
  };

  /**
   * Note an observation made while a post is on its way, to be judged at that post's echo; and,
   * where the viewport still stands where it stood, that a change came before the post landed,
   * which leaves a probe's two samples no line (`probedAt`). The post's own echo may be observed
   * before its acknowledgment comes, its viewport moved.
   */
  const waited = (): void => {
    height.unseen = true;
    height.stirred = true;
    height.crossed ||= stands();
  };

  /**
   * Take an observation made where the frame's last post had already been echoed: a change of the
   * content at a fixed viewport, followed by the kept slope (`changed`), or, where the viewport
   * moved since, as measured, a change from outside, a host's own resize of the frame, which is no
   * echo: where the content moved along the kept line, nothing is posted, so a host that resizes
   * the frame after each post meets no post in answer; where it did not, beside content that grows
   * at least as fast as the viewport, what the content moved off the line is a change at the
   * viewport the host set, followed as one at a fixed viewport is (`changed`), since no height a
   * chain from that content posts fits it; otherwise, or where no slope is kept, a chain starts
   * from the content there, under a chain's own bound.
   *
   * @param sample The content now, at the viewport it stands in.
   * @param before The content at the last observation, unrounded.
   * @param stood The viewport's height, as measured, where the frame last judged it.
   * @param pixels The content now, rounded up.
   * @constraint A host that set the frame to each post plus 13 px 30 ms after it applied it, as a
   *   host adding a border of its own would, met a post at each resize: a transition of an
   *   `@property` length beside a heading over `100vh` reached 333,033 px in 9 s, and a script's
   *   animation beside it posted 180 times in 9 s at an unchanged height (RED i7′). A chain started
   *   from the content where it left the line re-added the overflow of content sized from the
   *   viewport at each host's resize that a change came with: a host adding a tenth after each post
   *   saw that transition reach 237,512 px in 9 s (`car-i7/probe-i7r3/tc2-repeat.log`).
   */
  const fixedAt = (sample: Echoed, before: number, stood: number, pixels: number): void => {
    const { slope } = height;

    if (slope === undefined) {
      chained(pixels, false);

      return;
    }

    if (Math.abs(sample.at - stood) <= 2 * layoutUnit) {
      changed(slope, sample, before, pixels);

      return;
    }

    const along = before + slope * (sample.at - stood);

    if (Math.abs(sample.content - along) < 1) {
      return;
    }

    if (slope >= 1) {
      changed(slope, sample, along, pixels);

      return;
    }

    height.slope = undefined;
    chained(pixels, false);
  };

  /**
   * Take the observation that is the last post's echo: the first echo of a chain is posted once
   * more; one a signal's post spent is dropped; the second echo fits the chain's line
   * (`fitted`); a post to check is checked (`verified`); and once stopped, a drop is kept for the
   * next signal, or posted at once where one came (`held`).
   *
   * @param sample This echo.
   * @param pixels The content, rounded up.
   */
  const echoOf = (sample: Echoed, pixels: number): void => {
    const { fit } = height;

    if (fit === undefined) {
      height.fit = { sample, stage: "sampled" };
      postPixels(pixels);

      return;
    }

    height.dropped = undefined;

    if (fit.stage === "sampled") {
      fitted(fit.sample, sample);

      return;
    }

    if (fit.stage !== "stopped") {
      verified(fit, sample, pixels);

      return;
    }

    if (!height.spent && pixels !== sample.viewport) {
      height.dropped = sample;
      held();
    }
  };

  /**
   * Take an observation of the root's box (`postHeight`): a change while a post is on its way, its
   * acknowledgment or its viewport still to come, waits for that post's echo (`waited`); a chain
   * starts where no post was made yet, or the width, the frame's resolution or the island's device
   * pixel ratio changed, whose line and step belong to the old ones; an observation once the post
   * was echoed is a change at a fixed viewport or from outside (`fixedAt`); and an echo goes on
   * with its chain (`echoOf`).
   *
   * @param box The root's border box.
   * @constraint A line kept across a change of the zoom on the frame's element took the content at
   *   the new resolution for the old line: `99vh` over 300 px, its element zoomed to 1.25 at 2 s,
   *   climbed to 20,244 px where it stopped at 4300 at one zoom (RED i7″'s zoom shift).
   */
  const observed = (box: Box, echo: boolean): void => {
    const { atPosted, block, posted, slope, stood } = height;
    const now = posted !== undefined && (atPosted || echo);
    const scale = `${String(resolution())} ${String(posted === undefined ? placed : height.ratio)}`;
    const wide = box.inlineSize === height.inline && scale === height.scale;
    const pixels = Math.ceil(box.blockSize);
    const late = atPosted && height.early && !stands();

    height.block = box.blockSize;
    height.inline = box.inlineSize;
    height.scale = scale;
    height.slope = wide ? slope : undefined;

    if (posted !== undefined && !now && wide) {
      waited();

      return;
    }

    const at = measured();

    height.atPosted = now;
    height.early = false;
    height.ratio = posted === undefined ? placed : height.ratio;
    height.stood = at;
    height.unseen = false;

    if (posted === undefined || !wide) {
      chained(pixels, false);

      return;
    }

    const sample = { at, content: box.blockSize, viewport: posted };

    if (atPosted && !late) {
      fixedAt(sample, block, stood, pixels);

      return;
    }

    echoOf(sample, pixels);
  };

  /**
   * Look in a task after the frame's next rendering, unless a look is due already (`look`).
   *
   * @param then The look.
   */
  const soon = (then: () => void): void => {
    if (height.looking) {
      return;
    }

    height.looking = true;
    requestAnimationFrame(() => {
      setTimeout(() => {
        height.looking = false;
        then();
      }, 0);
    });
  };

  /**
   * Look once the transitions running now have ended, each finished or cancelled (`soon`), and
   * judge then whatever runs: a stream of transitions, each begun before the last ends, holds no
   * echo back for good (RED's TS1 and TT2 stood at their first post while they ran).
   *
   * @param running The transitions.
   * @param then The look.
   * @returns Once the look is due.
   */
  const afterAll = async (running: readonly Animation[], then: () => void): Promise<void> => {
    await Promise.allSettled(running.map(({ finished }) => finished));
    height.endured = true;
    soon(then);
  };

  /**
   * Take the last post's echo once the island has said it settled (`settledAt`): in a task after
   * each of the frame's renderings, measure the viewport, and once a look finds it where the look
   * before did with no observation of the root's box between, the frame is at rest too, and the
   * box last observed is the echo, judged at that viewport (`observed`, or, where none came after
   * the post, `verified`). Each observation meanwhile, and each transition that can move a box,
   * holds the echo a rendering more. Where the post moved the element and the viewport still
   * stands where it stood, its move has not reached the frame, or the pipeline swallowed it: the
   * echo is taken, so nothing waits, but judged at the first observation with the viewport moved,
   * and a change before that is one at a fixed viewport; a probe is judged at once, and probes
   * again if its move was swallowed (`probedAt`).
   *
   * @constraint Two looks at rest are the least that tell the frame's own layout at rest from one
   *   still catching up: the island settles once its element is at rest, and the frame's viewport
   *   and layout follow it across processes, so an observation the frame delivered after that word
   *   could still be of a step before; judged at once, a box observed mid-tween against the
   *   viewport the tween ended at read `V + c` as a slope of 0.81 and ran it to 1599 px (RED i7″'s
   *   script-animated host, P1, `car-i7/accept/diag-red.mjs`). An echo judged where the viewport
   *   had not yet moved made each echo of `V + c` a chain at the viewport's later move, 88 px more
   *   each time (`frame-boot.test.ts`, the settled word after the frame looked).
   */
  const look = (): void => {
    const { atPosted, block, fit, inline, posted, settled, unseen } = height;

    if (posted === undefined || atPosted || !settled || inline === undefined) {
      return;
    }

    const running = transitions();

    if (running.length > 0 && !height.endured) {
      void afterAll(running, look);

      return;
    }

    if (height.moved && stands() && fit?.stage !== "probed") {
      height.atPosted = true;
      height.early = true;

      return;
    }

    const at = measured();

    if (height.stirred || height.lookedAt !== at) {
      height.stirred = false;
      height.lookedAt = at;
      soon(look);

      return;
    }

    if (unseen) {
      observed({ blockSize: block, inlineSize: inline }, true);

      return;
    }

    height.atPosted = true;
    height.stood = at;

    if (fit === undefined || fit.stage === "sampled" || fit.stage === "stopped") {
      return;
    }

    verified(fit, { at, content: block, viewport: posted }, Math.ceil(block));
  };

  /**
   * Take the island's acknowledgment of a post (`PageLanded`): keep its device pixel ratio, from
   * which the frame's next posts take their step, and, for the last post, the element's height
   * before it, which tells whether the post moved the element once it settles (`settledAt`).
   *
   * @param message The acknowledgment.
   */
  const landed = (message: Extract<PageMessage, { readonly kind: "landed" }>): void => {
    height.ratio = message.ratio;

    if (message.pixels === height.posted) {
      height.from = message.from;
    }
  };

  /**
   * Take the island's word that the last post has settled (`PageSettled`): its echo has come, to be
   * judged once the frame is at rest too (`look`), whatever the viewport did, so no echo waits on a
   * move. Every
   * move of the viewport before belongs to the post, and every one after is the host's own
   * (`fixedAt`).
   *
   * @param message The island's word.
   * @constraint The island settles a post once its element read the same height in two of its
   *   animation frames, so the frame's viewport, which follows the element's, has had a frame of
   *   the island's to reach the frame; and the frame judges after a rendering of its own. A
   *   viewport that reaches it later still is a move after the echo, the host's own, which costs a
   *   post only where the content left its kept line (`fixedAt`), each held to the content plus the
   *   viewport (`postPixels`). The protocol rests on `postMessage`'s order and delivery between the
   *   two windows: no acknowledgment is dropped or reordered.
   * @see https://html.spec.whatwg.org/multipage/web-messaging.html#posting-messages
   */
  const settledAt = (message: Extract<PageMessage, { readonly kind: "settled" }>): void => {
    if (message.pixels !== height.posted || height.atPosted) {
      return;
    }

    height.moved = height.from !== undefined && Math.abs(message.height - height.from) > layoutUnit;
    height.settled = true;
    height.stirred = false;
    height.lookedAt = undefined;
    soon(look);
  };

  /**
   * Once the transitions that ran when a box was deferred have ended, judge the box last deferred,
   * where no observation since has judged one, whatever transitions run now: a stream of them,
   * each begun before the last ends, holds no box back for good.
   */
  const ended = (): void => {
    const { deferred } = height;

    soon(look);

    if (deferred === undefined) {
      return;
    }

    height.deferred = undefined;
    observed(deferred, false);
  };

  /**
   * Wait for transitions to end, each finished or cancelled, then, in a task after the rendering
   * they end in, whose own observation may judge the box first, judge the box deferred (`ended`).
   *
   * @param running The transitions that ran when the box was deferred.
   */
  const endOf = async (running: readonly Animation[]): Promise<void> => {
    await Promise.allSettled(running.map(({ finished }) => finished));
    setTimeout(ended, 0);
  };

  /**
   * Post the frame's height: its document element's border box's block size, in CSS pixels
   * rounded up, as the `ResizeObserver` observing that very box reports it, once the island's
   * `load` has written the PCI's markup; except that the echo of a post the frame made for an echo
   * posts a contracting content's fixed point, or nothing. Before the markup the document holds
   * nothing, and its height, its body's margins, would shrink the frame for nothing.
   *
   * @param entries The observation's entries: the document element's alone.
   * @constraint The height posted is the box observed, so every change of it has its observation.
   *   A content-box observation reports no change of the root's own padding or border, and a
   *   height read from `getBoundingClientRect()` moves with a transform, which no box observation
   *   reports. Either left the host's frame at a height the document no longer had, its content
   *   clipped, with nothing posted.
   * @constraint The block size is the frame's height, and the extent the document paints, because
   *   the boot's pins pin the root's geometry and its and the body's writing mode
   *   (`pinSheet`): the root is horizontal, so its
   *   block size is its height, and that height is its content's, at the frame's width. So a post
   *   sets the frame's height and changes no box the observation watches, and the frame posts once
   *   for each change of its content.
   * @constraint Content sized from the viewport's own height (`vh` units, an orthogonal flow, whose
   *   available inline size is the viewport's height) may have no height to post: at a viewport of
   *   `V` it is `V + c` (or `2V + c`, two stacked full-height panels), so each post would grow the
   *   frame without end. The viewport's height changes only when the island applies the frame's
   *   own post, so the first observation made once the viewport has come to stand at the height
   *   last posted, the frame's width as it was, is that post's echo, whatever content signals came
   *   between: a PCI whose script writes the document every frame (an animation by script, a
   *   spinner) or at each `resize` (content sized from `innerHeight`, the mobile `--vh` fix) raises
   *   a signal before every observation, and an echo that waited for none would never come (RED
   *   i5: a heading over `100vh` under a script's animation grew to 103,104 px). A height media
   *   query also changes only in an echo, since it reads the viewport, and has a fixed point one
   *   post away: 400 px of content that a `(min-height: 400px)` query grows by 200 is 616 once the
   *   frame is 416. So the first echo after a post that was no echo's is posted, once more: a step
   *   query has reached its height and raises no observation. In Chrome the observation of a
   *   rendering update comes before that update's `resize`, so the viewport is looked at again in a
   *   timer after each `resize`, never in its listener.
   * @constraint At the echo of that post, the two echoes' viewports and the root's unrounded block
   *   sizes there give the content as a line, `a·V + c`, which content sized from the viewport is,
   *   since a viewport length is a fixed fraction of the viewport's height. Where `0 < a < 1` the
   *   content contracts and has a fixed point, `c / (1 − a)`, which is posted: `50vh` over 300 px
   *   of content, with the body's margins, is 632 once the frame is 632, a height no number of
   *   echoes reaches. Where `a ≥ 1`, `V + c` and `2V + c`, there is none, and the echo is dropped:
   *   the frame stops after two posts, its root, which the pin scrolls, scrolling its overflow.
   * @constraint A change between the two echoes, a step query whose threshold lies between them, a
   *   script's write or a picture laid out in that rendering, makes the line no description of the
   *   content, and its error grows as `1 / (1 − a)`: `50vh` over 300 px with 60 px more at
   *   `(min-height: 500px)` reads `a = 0.996`, a fixed point of 29,553 px for content whose own is
   *   752 (COLD i6). So the estimate's own echo checks it: where the content there does not fit the
   *   posted height, the line through the second echo and this one, both past the step, is fitted
   *   once more and its fixed point posted, or, where its slope is not between 0 and 1, the
   *   content's own height; and where that post does not fit either, the content's own height.
   *   Where the root's box does not change at the estimate, no observation comes, so the timer
   *   after its `resize` checks it against the content last observed. The frame ends at a height
   *   that fits, or at its content's own, never at an estimate that does not fit: exact within
   *   four posts for content that is a line on each side of one step, and at most nine a chain:
   *   its first post, its first echo's, an estimate, a refit and the content's own height, then,
   *   for a change those find off the kept slope, an estimate, a refit and the content's own height
   *   once more, and one at a signal (RED i6's `95vh` over 300 px with a late step posts seven and
   *   one at a signal, held by a test). No post is above the content observed
   *   plus the viewport it was observed in: an estimate beyond that posts that, which its echo
   *   checks (RED i6's uneven staircase, 416 px with 200 more at one height and 198 at another,
   *   reads `a = 0.99` and would post 20,416 for 814).
   * @constraint A dropped echo whose content does not grow as fast as the viewport (`a ≠ 1`,
   *   which `V + c` is not) may hold a change that came with it: a picture whose layout lands in
   *   that very rendering, whose `load` comes after the observation (Chrome 158 delivers the
   *   observation of a picture's new size before its `load`, and of a font face's swap before
   *   `loadingdone`, which a face's `loaded` signals in its place, `watchFaces`); or a PCI's own drawing, whose mutation signals before the observation, as a
   *   `MutationObserver`'s callback runs in the microtask after the script that mutated, before the
   *   rendering, and which raises no signal after it. So the echo's height is posted at the next
   *   content signal, or at once where a signal has come since the last post; once until the next
   *   post that is no echo's. `V + c` content posts nothing, and other content sized from the
   *   viewport grows the frame at most once more (specimen's shade-parts suite on a rule that
   *   waited for a later signal: a tap missed `rectangle-vertical-2`'s first part in 2 runs of 4;
   *   `logs22/i6b-alpha/` in the lane's directory).
   * @constraint A change of the content at a fixed viewport, the frame's width as it was, is no
   *   echo, and a new chain for it re-adds the overflow content sized from the viewport has: COLD
   *   i6's T1, a heading over `100vh` beside 20 px shown and hidden every 400 ms, grew 88 px a
   *   toggle, 3286 px in 6 s. So the slope a line measured is kept, a fact of the content, until
   *   the frame's width changes or the content is found off it; and a change at a fixed viewport
   *   starts no chain. Where the slope contracts, the fixed point of the line of that slope through
   *   the content now is posted, an estimate its echo checks. Where the content grew at least as
   *   fast as the viewport and still overflows the frame, no height fits it while it still does,
   *   and a chain for each change ran COLD i6's P2, P5, P6, P11 and P15, a full-height block or two
   *   beside a block shown and hidden or resized every 400 ms, to Chrome's limit of 33,554,432 px
   *   in 9 s; but one viewport cannot tell that content from content the change no longer sizes
   *   from the viewport, a full-height splash replaced by the task, which stayed short for good
   *   (COLD i7's SC2). So the frame probes one quantum below its stop, and that echo and the stop
   *   give the content's line past the change: where it still grows at least as fast and
   *   overflows, the frame goes back to its stop, two posts a change; otherwise a chain starts
   *   there (`probedAt`). Where the frame fit its content before the change, the viewport plus the
   *   change is posted, the frame moving as the content did, and a dropped echo a signal posts is
   *   followed so too. That post's echo must grow as the slope says, to within the pixel a post
   *   rounds to. Where it does not, the change's sample and the echo,
   *   both past the change, give the content's line, which is fitted as the first two echoes are,
   *   once for each change: RED i6's picture laid out between the two echoes of `50vh` content
   *   read a slope of -0.55, and its `load` posted a height whose echo was dropped, 34 to 50 px
   *   short in 13 trials of 24. Where the post would be none, or content that grew with the
   *   viewport now fits within it, the slope is forgotten and a chain starts from the content's
   *   own height.
   * @constraint A change observed while a post is on its way, the viewport not yet at it, is the
   *   content that post's echo will show, so it waits for that echo, or, where the root's box does
   *   not change when the post lands, for the look after the island's settled word; a chain started for it from
   *   nothing added the overflow of content sized from the viewport again. Where only a change
   *   beside a kept slope waited, an echo that never came, at a zoom whose viewport no exact height
   *   matched, kept the frame from ever keeping a slope, so each change started a chain, and `V +
   *   c` grew to 131,562 px in 9 s (COLD i7's r4 at a zoom of 1.25): unbounded posts, not a
   *   freeze, since nothing waited. With every change waiting, an echo that never comes costs no
   *   post beyond the one on its way; and plate's island says when every post has settled, so
   *   every echo comes (`settledAt`), the viewport moved or not.
   * @constraint A mutation of the document signals before the observation of the layout it
   *   changes, so it is that observation's, which posts it: it posts no dropped echo, only marks
   *   that a drop the observation makes is posted at once. A content event (a `load`, an `error`, a
   *   font face loaded, an animation's or a transition's end) comes after the observation of the
   *   layout it reports, and posts a dropped echo that may hold it. Each of COLD i6's toggles had
   *   posted the panels' held drop by its mutation, its own observation then landing in flight.
   * @constraint While a CSS transition runs, its frames change the root's box each frame, and one
   *   on a viewport length restarts at each post, since a post moves the viewport: COLD i6's TR2, a
   *   heading over a full-height block whose height transitions in 300 ms, posted about 5 px a
   *   frame, 500 posts in 9 s, still growing, and two such panels reached Chrome's limit. So an
   *   observation while one runs that can move a box (`transitions`) is deferred, and the box
   *   judged at the first observation after none runs, or, once the transitions that ran at its
   *   observation have all settled, finished or cancelled, in a timer after (`ended`), whatever runs
   *   then: a stream of transitions, each begun before the last ends, holds no box back for good.
   *   The frame's look after a settled word judges nothing while one runs, so that box is the echo it is. Its
   *   `transitionend` comes before that last observation, so a drop that box makes is posted at
   *   once, and checked against the slope: a step that a transition brings in fits (COLD i6's TR3,
   *   1032), and two full-height panels stop after one post more. A transition that only paints
   *   defers nothing: COLD i7's TRX2, 300 px with 200 more beside an opacity transition kept
   *   running, stayed at 316 for 516.
   * @constraint What is left:
   *   - a media query that flips at the posted height, `.x { height: 400px }` under
   *     `@media (min-height: 600px) { .x { height: 0 } }`, whose content shrinks as the frame grows
   *     (`a < 0`, as content that subtracts a viewport length does): the frame stops short with its
   *     content scrolling (477 for 877), or, after a later signal, tall with blank space below the
   *     content (877 for 477);
   *   - a query whose fixed point is more than one post away may stop one post short, scrolling,
   *     where its later steps land in the echoes: their growth, as even as `V + c`'s, gives `a = 1`;
   *     a step that lands after the frame has looked at its viewport is a change of its own, and
   *     posted;
   *   - a change no signal reports (a stylesheet rule changed through the CSSOM, a hover) that lands
   *     in a dropped echo is not posted until the content next changes;
   *   - a dropped echo in a chain refitted off the kept slope is posted at a signal with no check;
   *   - a web font face that joins the document after an observation and loads before the next,
   *     with a post from a timer between its mutation and its swap, signals nothing, so a swap that
   *     lands in a dropped echo then waits for the content's next change (`watchFaces`);
   *   - content that grows with the viewport keeps its frame where it stopped while the content
   *     overflows it, so a block that grows beside it scrolls, and is not followed; each change
   *     there moves the frame one quantum and back, the probe;
   *   - a change beside content of slope 1 or more that leaves content whose slope lies within
   *     what a probe resolves of 1, 1/16 for a probe of a pixel (`97vh` over a block), reads as
   *     still growing as fast as the viewport, and the frame goes back to its stop, scrolling;
   *   - a query whose fixed point is more than one post away, stopped one post short, is reached
   *     only at its next change, whose probe finds it no longer growing there (COLD i6's P10, 616
   *     for 816, then 836 and 816 in one post a toggle);
   *   - no rule of the island's height and `D′` names the frame's viewport exactly, the best of
   *     those tried matching 1396 of 1620 posts across 20 pairs of zoom and ratio, and a move of the
   *     element is not sure to move the viewport, so an echo is the island's settled word, never a
   *     viewport the post should give (`settledAt`), and a probe the pipeline swallowed goes twice
   *     as far (`probedAt`);
   *   - a post the island settles early, a host's tween whose first two frames move the element
   *     by less than 1/64 px, is echoed where the viewport stands then, and the tween's later
   *     steps are the host's own resizes (`landHeight` in `#plate/ui/portable-custom/landing.ts`);
   *   - a viewport that reaches the frame after the island settled its post is the host's own
   *     move (`settledAt`);
   *   - a change of the island's device pixel ratio reaches the frame in the next acknowledgment,
   *     so one post at most takes its step from a stale one;
   *   - a host's own move of the frame while a post is on its way is that post's, its echo where
   *     the viewport stands once the post settled;
   *   - a CSS animation (not a transition) on a viewport length restarts at each post too, and is
   *     not deferred: an infinite one would never end to be judged at;
   *   - a host that moves the frame element every frame for ever settles no post, and the frame
   *     waits, its height the host's (`landHeight`);
   *   - a change while a transition that can move a box runs is posted only once the transitions
   *     running at its observation have ended;
   *   - a second step between an estimate and its check leaves the refit off by that step; the
   *     content's own height posted then is checked against the kept slope and fitted from its own
   *     two samples, so COLD i6's F18, 60 px at `(min-height: 500px)` and 100 px at 900 on `50vh`
   *     over 300 px, ends at 752, fitting, in six posts, where it had stopped at 808 for 780; a
   *     third step there would leave that fit off by it;
   *   - content that shrinks as the viewport grows (`calc(900px − 50vh)`, `a < 0`) has a fixed
   *     point the rule leaves unreached, stopping with blank space or scrolling (COLD i6);
   *   - content that contracts with a slope near 1 (`99vh` over 300 px) has a fixed point far above
   *     its content (31,550 px from a viewport of 777), which the bound holds each post below, so
   *     the frame stops at its content's own height after five posts, 4300, scrolling 273 px.
   * @source Resize Observer: `ResizeObserverOptions.box` and its `border-box`, and
   *   `ResizeObserverEntry.borderBoxSize`; Chrome 158, probed through this frame page
   *   (`car-i2/probe/order-probe.mjs` and `echo-probe.mts` in the lane's directory): the
   *   observation before the `resize`, each case of content sized from the viewport ending within
   *   two posts, the step query reaching 616, the flipping query stopping (`car-i5/probe/`),
   *   `50vh` over 300 px reaching 632, a step between its echoes ending at 752, and T1 staying
   *   within 20 px of its first stop (`car-i6/probe/`), and COLD i6's runaways and transitions
   *   bounded, COLD i7's SC, PIC, TRX and zoom cases and RED i7's SH cases (`car-i7/probe/`, in the
   *   lane's directory).
   * @see https://drafts.csswg.org/resize-observer/#dom-resizeobserverboxoptions-border-box
   * @see https://drafts.csswg.org/resize-observer/#dom-resizeobserverentry-borderboxsize
   * @see https://html.spec.whatwg.org/multipage/webappapis.html#update-the-rendering
   */
  const postHeight = (entries: readonly ResizeObserverEntry[]): void => {
    const [box] = entries[0]?.borderBoxSize ?? [];

    watchFaces();

    if (box === undefined || dom === undefined) {
      return;
    }

    const running = transitions();

    if (running.length > 0) {
      height.deferred = { blockSize: box.blockSize, inlineSize: box.inlineSize };
      void endOf(running);

      return;
    }

    height.deferred = undefined;
    observed(box, false);
  };

  /**
   * The nodes the pins have been put ahead of, each a stylesheet's node or, for a document a PCI
   * left with no stylesheet, its head (`keepPinsFirst`).
   */
  const overtaken = new WeakSet<Node>();

  /**
   * Whether the pins have moved in this task: set at a move, and cleared by a timer of 0 ms, which
   * runs in a later task (`keepPinsFirst`).
   */
  let moved = false;

  /**
   * Put the pins ahead of the document's first stylesheet, a `style` or a stylesheet link found in
   * the document's order, loaded or not, or first in the head where none is left, unless they are
   * first or have passed that node before (`keepPinsFirst`).
   *
   * @returns Whether the pins moved.
   */
  const pinnedFirst = (): boolean => {
    const first = document.querySelector('link[rel~="stylesheet" i], style');
    const ahead = first ?? document.head;

    if (first === pins || overtaken.has(ahead)) {
      return false;
    }

    overtaken.add(ahead);

    if (first === null) {
      document.head.prepend(pins);

      return true;
    }

    first.before(pins);

    return true;
  };

  /**
   * End a task's move: let the pins move again.
   */
  const released = (): void => {
    moved = false;
  };

  /**
   * End the task the pins moved in, and look once more: a sheet a PCI put first later in that
   * task, in a later microtask, after an `await` or in a 0 ms timer of its own, came while the
   * pins could not move. Where the pins move now, this task's bound ends in a timer that looks no
   * more (`keepPinsFirst`).
   */
  const rechecked = (): void => {
    moved = pinnedFirst();

    if (moved) {
      setTimeout(released, 0);
    }
  };

  /**
   * Keep the boot's pins first among the document's stylesheets (`pinSheet`): where a stylesheet
   * comes before them, a `style` or a stylesheet link a PCI put ahead of them, or where a PCI
   * removed them, put them back before the first, or first in the head where none is left; ahead of
   * each node at most once, and at most once in a task. Cascade layers are ordered by the sheets'
   * own order, so a layer declared first beats every later one among important declarations; with
   * the pins first, none can. The move runs in the mutation's own microtask, before the next
   * rendering lays the document out. The first is found in the document's order, a `style` or a
   * stylesheet link, not among `document.styleSheets`, which holds a link only once its sheet has
   * loaded, after the mutation: the boot would have seen the pins first, and the link's layer, once
   * loaded, would have come before them unseen (`overflow: hidden` from a link put first in the
   * head, in Chrome 158, `car-i5/probe/` in the lane's directory).
   *
   * @constraint A PCI whose own `MutationObserver` puts its stylesheet back first answers each move
   *   with another, in the next microtask, and the two would trade places without end, the frame
   *   frozen in its microtask checkpoint (RED i5: 100,000 moves at the cap of RED's probe). So the
   *   pins pass a node once, and move at most once in a task (RED i5's pins-fight-new: 20,000
   *   moves in 45 s with no animation frame, the main thread never yielding). The timer that ends
   *   the task's bound looks once more, so a sheet a PCI puts first later in that task, in a later
   *   microtask, after an `await` or in a 0 ms timer set in that task, is passed too (COLD i5: each
   *   kept the pins second, the root's `overflow-y` hidden, in every trial); a move that look
   *   makes is not looked at again. A fight with new nodes costs two moves for each change the
   *   PCI does not answer, and the page renders on; a node that comes back before the pins, or one
   *   a PCI puts first in answer to that last look, keeps its place, and its layer beats the pins
   *   as the residue `pinSheet` names.
   * @see https://drafts.csswg.org/css-cascade-5/#layer-ordering
   */
  const keepPinsFirst = (): void => {
    if (moved || !pinnedFirst()) {
      return;
    }

    moved = true;
    setTimeout(rechecked, 0);
  };

  new MutationObserver(() => {
    keepPinsFirst();
    noted();
  }).observe(document, {
    attributes: true,
    characterData: true,
    childList: true,
    subtree: true,
  });

  for (const name of contentEvents) {
    document.addEventListener(name, signal, { capture: true });
  }

  new ResizeObserver(postHeight).observe(document.documentElement, { box: "border-box" });

  /**
   * Act on a message from the island: only one from the parent window the frame booted under
   * (`host`), carrying this frame's nonce.
   *
   * @param event The message event.
   */
  const onMessage = (event: MessageEvent): void => {
    const data: unknown = event.data;

    if (event.source !== host || !isPageMessage(data) || data.nonce !== nonce) {
      return;
    }

    switch (data.kind) {
      case "complete": {
        complete();
        break;
      }
      case "instantiate": {
        instantiate(data);
        break;
      }
      case "landed": {
        landed(data);
        break;
      }
      case "load": {
        load(data);
        break;
      }
      case "settled": {
        settledAt(data);
        break;
      }
    }
  };

  if (pins.sheet === null) {
    fail(
      "The frame page's content-security policy refused the boot's own stylesheet, the pins of the root's geometry, so no height the frame posts could be trusted: its style-src must allow 'unsafe-inline', with no nonce or hash in style-src (which would make it ignored), as PCIs' own inline styles need.",
    );

    return;
  }

  window.addEventListener("message", onMessage);
  post({ kind: "booted", nonce });
};
