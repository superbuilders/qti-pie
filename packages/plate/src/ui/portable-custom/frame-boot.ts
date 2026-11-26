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
 *    location with nothing after it waits for its script's load or error, never for a clock. It
 *    runs the modules and tells the island the type identifiers they registered.
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
 * The frame page's own stylesheet pins the root's geometry, so that box is the extent the document
 * paints, at the frame's width, and a post changes no box it observes. A height media query reaches
 * its fixed point one post on, content that contracts with the viewport (`50vh` over fixed content)
 * reaches its own by a line through two echoes, and content sized from the viewport's own height,
 * which no height fits, stops within two posts and scrolls the rest.
 *
 * Failure travels as a `failed` message while the PCI is not yet running: a route that exhausts
 * its locations, a module that names a dependency no route defines, no factory for the identifier
 * the island chose, or an uncaught error in the frame. Once `getInstance` has given the PCI, an
 * uncaught error is the PCI's own and leaves it running.
 *
 * **Why one function.** The page writes `bootFrame`'s source text, `Function.prototype.toString`'s,
 * as its inline script, so the text is the code whatever compiled this module: Node's type
 * stripping, or the host's bundler. That holds while the function reaches nothing outside itself
 * but the frame's globals, so this module declares no other value and imports none: every helper
 * is inside the function, and every import is a type. A value added beside it would be undefined
 * in the frame.
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
 * A `define` decoded: named by its id, or anonymous, which belongs to the route whose script is
 * loading; its dependencies, none where it lists none; and its factory, as the module gave it.
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
 * The route whose script is loading now: an anonymous `define` is its module, and an uncaught
 * error while it loads is its location's failure.
 */
interface Loading {
  readonly id: string;
  readonly settle: (outcome: Outcome) => void;
}

/**
 * An echo the frame posted for: the viewport's height it was observed at, the height posted
 * before it, and the root's block size it observed there, unrounded.
 */
interface Echoed {
  readonly content: number;
  readonly viewport: number;
}

/**
 * Where the frame stands in fitting a line to its echoes since the last post that was no echo's:
 * it has posted for the first, and samples it; it has posted the fixed point of the line through
 * two, and samples the second; it has posted the fixed point of the line through that and the
 * estimate's own echo, and samples the estimate's; it has followed a change by the slope its
 * content measured, posting the viewport plus a change at a fixed viewport or a dropped echo a
 * signal posted, and samples the change;
 * or it has stopped, at a height that fits or at its content's own (`postHeight`).
 */
type Fit =
  | { readonly sample: Echoed; readonly stage: "estimated" }
  | { readonly sample: Echoed; readonly slope: number; readonly stage: "followed" }
  | { readonly sample: Echoed; readonly stage: "refitted" }
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
 * whether the chain started because a post's echo was off that slope; and whether a signal has
 * posted a dropped echo since the last post that was no echo's.
 */
interface Followed {
  atPosted: boolean;
  block: number | undefined;
  dropped: Echoed | undefined;
  fit: Fit | undefined;
  inline: number | undefined;
  posted: number | undefined;
  rechained: boolean;
  signalled: boolean;
  slope: number | undefined;
  spent: boolean;
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
   * The page's own stylesheet, its pins, the document's first as the boot runs: no PCI has written
   * anything yet. None in a document that holds no stylesheet.
   */
  const pins = document.styleSheets[0]?.ownerNode ?? null;
  const definitions = new Map<string, AmdDefinition>();
  const exported = new Map<string, unknown>();
  const builtins = new Map<string, unknown>();
  const factories: PciFactory[] = [];
  let loading: Loading | undefined;
  let dom: HTMLElement | undefined;
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
          isString(node["title"])
        );
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
   * The AMD `define` of this frame. An anonymous define belongs to the route whose script is
   * loading; one outside any load has no id to be known by and is dropped.
   */
  const define: AmdDefine = Object.assign(
    (...given: DefineArguments): void => {
      const definition = definitionOf(given);
      const id = definition.kind === "named" ? definition.id : loading?.id;

      if (id !== undefined) {
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
   * module (an empty script defines nothing), when an uncaught error is reported while it loads, or
   * when a wait is given and runs out first. Only a primary with a fallback after it is given a
   * wait, since a timeout means nothing but "load the fallback" (R3 of `#plate/pci/resolve.ts`,
   * reading `pci-wait-before-fallback`): any other location waits for its script however long it
   * takes. A wait of 0 is no limit, and so is a wait longer than a timer holds: HTML's `setTimeout`
   * takes its delay as a WebIDL `long`, milliseconds in a 32-bit signed integer, and a longer delay
   * wraps, so it fires early, at once just past the bound, which would cut short a wait a
   * configuration stated as longer than any session (reading `pci-configuration-waits`: a stated
   * wait is never dropped).
   *
   * @param id The route's module id, which an anonymous define takes.
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
    let settled = false;

    /**
     * Settle the load once, and stop being the load an anonymous define belongs to.
     *
     * @param outcome How it came out.
     */
    const settle = (outcome: Outcome): void => {
      if (settled) {
        return;
      }

      settled = true;
      clearTimeout(timer);

      if (loading?.settle === settle) {
        loading = undefined;
      }

      resolve(outcome);
    };

    loading = { id, settle };
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
   * Load routes in order, one at a time, stopping at the first that fails: a module's anonymous
   * define names the route loading when it runs, so two never load at once.
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
      case "load": {
        load(data);
        break;
      }
    }
  };

  builtins.set(bridgeId, bridge);
  builtins.set("require", requireModule);
  Object.assign(window, { define, qtiCustomInteractionContext: bridge });
  window.addEventListener("error", (event: ErrorEvent) => {
    const reason = event.message === "" ? "A script in the frame threw." : event.message;

    if (loading === undefined) {
      fail(reason);
    } else {
      loading.settle({ kind: "failed", reason });
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
  window.addEventListener("message", onMessage);
  window.addEventListener("pagehide", (event: PageTransitionEvent) => {
    if (!event.persisted) {
      complete();
    }
  });

  for (const name of inputEvents) {
    document.addEventListener(name, onInput, { capture: true });
  }

  /**
   * The height the frame last posted, none before its first; whether the viewport stood at that
   * height when the frame last looked, at its last observation or in a timer after its last
   * `resize`; the root's inline size at the last observation; and the echoes since the last post
   * that was no echo's (`Followed`).
   */
  const height: Followed = {
    atPosted: false,
    block: undefined,
    dropped: undefined,
    fit: undefined,
    inline: undefined,
    posted: undefined,
    rechained: false,
    signalled: false,
    slope: undefined,
    spent: false,
  };

  /**
   * Tell whether the frame's viewport is a given height now, by the `height` media feature, the
   * viewport's own, its scroll bar included.
   *
   * @param pixels The height, in CSS pixels.
   * @returns Whether it is.
   * @see https://drafts.csswg.org/mediaqueries-4/#height
   */
  const viewportAt = (pixels: number): boolean =>
    matchMedia(`(height: ${String(pixels)}px)`).matches;

  /**
   * Post a height, and note it as the last posted, with the viewport where it stands now and no
   * signal since.
   *
   * @param pixels The height, in CSS pixels.
   */
  const postPixels = (pixels: number): void => {
    height.posted = pixels;
    height.signalled = false;
    height.atPosted = viewportAt(pixels);
    post({ kind: "height", nonce, pixels });
  };

  /**
   * Take a content signal, a sign that the document's content changed, and note it: where the
   * frame dropped an echo that may hold a change of its own, post that echo's height, once until
   * the next post that is no echo's, its echo checked against the kept slope where one is kept and
   * the chain did not start off it (`postHeight`). A signal decides no echo: a PCI that writes the
   * document every frame would leave none.
   */
  const signal = (): void => {
    height.signalled = true;

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
   * The slope of the line through two echoes: how much the content grows for each pixel of the
   * viewport's height.
   *
   * @param from The earlier echo.
   * @param to The later echo.
   * @returns The slope.
   */
  const slopeOf = (from: Echoed, to: Echoed): number =>
    (to.content - from.content) / (to.viewport - from.viewport);

  /**
   * The fixed point of the line of a slope through an echo, `c / (1 − a)`, where the slope `a`
   * lies between 0 and 1 and the point is above 0; none otherwise.
   *
   * @param slope The line's slope.
   * @param through An echo the line passes through.
   * @returns The fixed point, in CSS pixels, unrounded.
   */
  const fixedPoint = (slope: number, through: Echoed): number | undefined => {
    const fixed = (through.content - slope * through.viewport) / (1 - slope);

    return slope > 0 && slope < 1 && fixed > 0 ? fixed : undefined;
  };

  /**
   * The height to post for an estimate: the estimate, rounded up, but never above the content
   * observed plus the viewport it was observed in.
   *
   * @param fixed The estimate, in CSS pixels, unrounded.
   * @param sample The echo the estimate is posted from.
   * @returns The height, in CSS pixels.
   */
  const bounded = (fixed: number, sample: Echoed): number =>
    Math.min(Math.ceil(fixed), Math.ceil(sample.content) + sample.viewport);

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
    const slope = slopeOf(first, sample);
    const fixed = fixedPoint(slope, sample);

    height.slope = slope;

    if (fixed !== undefined) {
      height.fit = { sample, stage: "estimated" };
      postPixels(bounded(fixed, sample));

      return;
    }

    height.dropped = slope === 1 ? undefined : sample;
    held();
  };

  /**
   * At the echo of an estimate, check it: where the content fits the posted height, stop; where
   * it does not, refit once, through the echo the estimate came from and this one, keeping that
   * slope, and post that fixed point, or the content's own height where the line has none or the
   * refit did not fit either; that post's echo is checked against the kept slope as a followed
   * change's is, so a change that came with this echo is fitted from its own two samples.
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
    if (pixels === sample.viewport) {
      height.fit = { stage: "stopped" };

      return;
    }

    const slope = fit.stage === "estimated" ? slopeOf(fit.sample, sample) : undefined;
    const fixed = slope === undefined ? undefined : fixedPoint(slope, sample);
    const kept = slope ?? height.slope;

    height.slope = kept;

    if (fixed !== undefined) {
      height.fit = { sample, stage: "refitted" };
      postPixels(bounded(fixed, sample));

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
    const expected = fit.sample.content + fit.slope * (sample.viewport - fit.sample.viewport);

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
   * otherwise post the viewport plus the change, which keeps the overflow content sized from the
   * viewport has, `c` of `V + c`, as it was, and which its echo checks against the slope. Where
   * that height is none, the content is no longer that line: forget the slope and start a chain.
   *
   * @param slope The kept slope.
   * @param sample The content now, at the viewport it stands in.
   * @param before The content at the last observation, unrounded.
   * @param pixels The content now, rounded up.
   */
  const changed = (slope: number, sample: Echoed, before: number, pixels: number): void => {
    const fixed = fixedPoint(slope, sample);
    const followed = Math.ceil(sample.viewport + sample.content - before);

    height.dropped = undefined;
    height.rechained = false;
    height.spent = false;

    if (fixed !== undefined) {
      height.fit = { sample, stage: "estimated" };
      postPixels(bounded(fixed, sample));

      return;
    }

    if (followed > 0) {
      height.fit = { sample, slope, stage: "followed" };
      postPixels(followed);

      return;
    }

    height.slope = undefined;
    chained(pixels, false);
  };

  /**
   * Take an echo that checks a post: an estimate's or a refit's (`checked`), or a followed
   * change's (`matched`).
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

    checked(fit, sample, pixels);
  };

  /**
   * Look at the viewport: note whether it stands at the height last posted. Where it has come to
   * stand at a post to check with no observation, the root's box did not change there, so that
   * post's echo is the content last observed, which is checked as an observed echo is.
   */
  const look = (): void => {
    const { atPosted, block, fit, posted } = height;

    height.atPosted = posted !== undefined && viewportAt(posted);

    if (
      atPosted ||
      !height.atPosted ||
      posted === undefined ||
      block === undefined ||
      fit === undefined ||
      fit.stage === "sampled" ||
      fit.stage === "stopped"
    ) {
      return;
    }

    verified(fit, { content: block, viewport: posted }, Math.ceil(block));
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
   *   the frame page's own stylesheet pins the root's geometry and its and the body's writing mode
   *   (`rootPin` in `#plate/ui/portable-custom/frame-page.ts`): the root is horizontal, so its
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
   *   four posts for content that is a line on each side of one step, and at most nine for a
   *   change, the content's own height checked against the kept slope and refitted once from its
   *   own two samples, with one more at a later signal. No post is above the content observed
   *   plus the viewport it was observed in: an estimate beyond that posts that, which its echo
   *   checks (RED i6's uneven staircase, 416 px with 200 more at one height and 198 at another,
   *   reads `a = 0.99` and would post 20,416 for 814).
   * @constraint A dropped echo whose content does not grow as fast as the viewport (`a ≠ 1`,
   *   which `V + c` is not) may hold a change that came with it: a picture whose layout lands in
   *   that very rendering, whose `load` comes after the observation (Chrome 158 delivers the
   *   observation of a picture's new size before its `load`, and of a font face's swap before
   *   `loadingdone`); or a PCI's own drawing, whose mutation signals before the observation, as a
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
   *   the content now is posted, an estimate its echo checks; otherwise the viewport plus the
   *   change, which keeps `c` of `V + c` as it was, the frame moving as the content did; and a
   *   dropped echo a signal posts is followed so too. That post's echo must grow as the slope says,
   *   to within the pixel a post rounds to. Where it does not, the change's sample and the echo,
   *   both past the change, give the content's line, which is fitted as the first two echoes are,
   *   once for each change: RED i6's picture laid out between the two echoes of `50vh` content
   *   read a slope of -0.55, and its `load` posted a height whose echo was dropped, 34 to 50 px
   *   short in 13 trials of 24. Where the post would be none, the slope is forgotten and a chain
   *   starts from the content's own height.
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
   *   - a change that lands while a post is on its way, the viewport not yet at it, starts a
   *     chain, which re-adds the overflow of content sized from the viewport once; and a dropped
   *     echo in a chain refitted off the kept slope is posted at a signal with no check;
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
   *   within 20 px of its first stop (`car-i6/probe/`, in the lane's directory).
   * @see https://drafts.csswg.org/resize-observer/#dom-resizeobserverboxoptions-border-box
   * @see https://drafts.csswg.org/resize-observer/#dom-resizeobserverentry-borderboxsize
   * @see https://html.spec.whatwg.org/multipage/webappapis.html#update-the-rendering
   */
  const postHeight = (entries: readonly ResizeObserverEntry[]): void => {
    const [box] = entries[0]?.borderBoxSize ?? [];

    if (box === undefined || dom === undefined) {
      return;
    }

    const { atPosted, block, posted, slope } = height;
    const now = posted !== undefined && viewportAt(posted);
    const wide = box.inlineSize === height.inline;
    const pixels = Math.ceil(box.blockSize);

    height.atPosted = now;
    height.block = box.blockSize;
    height.inline = box.inlineSize;
    height.slope = wide ? slope : undefined;

    if (posted === undefined || !now || !wide) {
      chained(pixels, false);

      return;
    }

    const sample = { content: box.blockSize, viewport: posted };

    if (atPosted) {
      if (slope === undefined || block === undefined) {
        chained(pixels, false);

        return;
      }

      changed(slope, sample, block, pixels);

      return;
    }

    const { fit } = height;

    if (fit === undefined) {
      height.fit = { sample, stage: "sampled" };
      postPixels(pixels);

      return;
    }

    if (height.spent && fit.stage !== "followed") {
      height.dropped = undefined;

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

    if (pixels !== posted) {
      height.dropped = sample;
      held();
    }
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
    if (pins === null) {
      return false;
    }

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
   * Keep the page's pins first among the document's stylesheets (`pins` in
   * `#plate/ui/portable-custom/frame-page.ts`): where a stylesheet comes before them, a `style` or
   * a stylesheet link a PCI put ahead of them, or where a PCI removed them, put them back before
   * the first, or first in the head where none is left; ahead of each node at most once, and at
   * most once in a task. Cascade layers are ordered by the sheets' own order, so a layer declared
   * first beats every later one among important declarations; with the pins first, none can. The
   * move runs in the mutation's own microtask, before the next rendering lays the document out. The
   * first is found in the document's order, a `style` or a stylesheet link, not among
   * `document.styleSheets`, which holds a link only once its sheet has loaded, after the mutation:
   * the boot would have seen the pins first, and the link's layer, once loaded, would have come
   * before them unseen (`overflow: hidden` from a link put first in the head, in Chrome 158,
   * `car-i5/probe/` in the lane's directory).
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
   *   as the residue in `frame-page.ts` names.
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
    signal();
  }).observe(document, {
    attributes: true,
    characterData: true,
    childList: true,
    subtree: true,
  });

  for (const name of contentEvents) {
    document.addEventListener(name, signal, { capture: true });
  }

  document.fonts.addEventListener("loadingdone", signal);
  window.addEventListener("resize", () => {
    setTimeout(look, 0);
  });
  new ResizeObserver(postHeight).observe(document.documentElement, { box: "border-box" });
  post({ kind: "booted", nonce });
};
