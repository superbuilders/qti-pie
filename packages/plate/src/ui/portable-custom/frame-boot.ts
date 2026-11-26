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
 *    routes: the entry first when the PCI names one, each route's primary location with its wait,
 *    then its fallback after a timeout or a fatal error. It runs the modules and tells the island
 *    the type identifiers they registered.
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
 * Its height follows its content: a `ResizeObserver` on the document's root element posts the
 * whole pixels of its border box's block size, which the island writes as the frame's `height`
 * attribute. The frame page's markup pins the root's geometry, so that box is the extent the
 * document paints, at the frame's width, and a post changes no box it observes.
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
   * The longest delay a browser's timer holds, in milliseconds: `setTimeout` takes it as a WebIDL
   * `long`, a 32-bit signed integer.
   */
  const longestTimerMs = 2_147_483_647;
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
   * Load one script and wait for it to define its module: loaded when the module is defined by the
   * time the script ran; failed when the script does not load, when an uncaught error is reported
   * while it loads, or when the wait runs out first (an empty script defines nothing, so its wait
   * runs out). A wait of 0 is no limit, and so is a wait longer than a timer holds: HTML's
   * `setTimeout` takes its delay as a WebIDL `long`, milliseconds in a 32-bit signed integer, and a
   * longer delay wraps, so it fires early, at once just past the bound, which would fail the load a
   * configuration stated as longer than any session (reading `pci-configuration-waits`: a stated
   * wait is never dropped).
   *
   * @param id The route's module id, which an anonymous define takes.
   * @param url The script's absolute URL.
   * @param waitSeconds How long to wait, 0 for no limit.
   * @returns How the load came out.
   * @see https://html.spec.whatwg.org/multipage/timers-and-user-prompts.html#timers
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
      if (definitions.has(id)) {
        settle({ kind: "loaded" });
      }
    });

    if (waitSeconds > 0 && waitSeconds * 1000 <= longestTimerMs) {
      timer = setTimeout(() => {
        settle({
          kind: "failed",
          reason: `The module script at ${url} defined no module "${id}" within ${String(waitSeconds)} seconds.`,
        });
      }, waitSeconds * 1000);
    }

    script.src = url;
    document.head.append(script);

    return promise;
  };

  /**
   * Load one route: its primary location, then its fallback when the primary fails. A route with
   * no location loads nothing and is no failure; a route with no fallback has no second chance.
   *
   * @param route The route.
   * @returns How the route came out.
   */
  const loadRoute = async (route: PciFrameRoute): Promise<Outcome> => {
    const primary =
      route.primary === undefined
        ? undefined
        : await loadLocation(route.id, route.primary, route.waitSeconds.primary);

    if (primary?.kind === "loaded" || route.fallback === undefined) {
      return primary ?? { kind: "loaded" };
    }

    return await loadLocation(route.id, route.fallback, route.waitSeconds.fallback);
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

    fail(cause instanceof Error ? cause.message : "A promise in the frame was rejected.");
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
   * Post the frame's height: its document element's border box's block size, in CSS pixels
   * rounded up, as the `ResizeObserver` observing that very box reports it.
   *
   * @param entries The observation's entries: the document element's alone.
   * @constraint The height posted is the box observed, so every change of it has its observation.
   *   A content-box observation reports no change of the root's own padding or border, and a
   *   height read from `getBoundingClientRect()` moves with a transform, which no box observation
   *   reports. Either left the host's frame at a height the document no longer had, its content
   *   clipped, with nothing posted.
   * @constraint The block size is the frame's height, and the extent the document paints, because
   *   the frame page's markup pins the root's geometry and its and the body's writing mode
   *   (`rootPin` in `#plate/ui/portable-custom/frame-page.ts`): the root is horizontal, so its
   *   block size is its height, and that height is its content's, at the frame's width, whatever
   *   the frame's height. So a post sets the frame's height and changes no box the observation
   *   watches, and the frame posts once for each change of its content. Content sized from the
   *   viewport's height is the exception the pin's doc names.
   * @source Resize Observer: `ResizeObserverOptions.box` and its `border-box`, and
   *   `ResizeObserverEntry.borderBoxSize`.
   * @see https://drafts.csswg.org/resize-observer/#dom-resizeobserverboxoptions-border-box
   * @see https://drafts.csswg.org/resize-observer/#dom-resizeobserverentry-borderboxsize
   */
  const postHeight = (entries: readonly ResizeObserverEntry[]): void => {
    const [box] = entries[0]?.borderBoxSize ?? [];

    if (box === undefined) {
      return;
    }

    post({ kind: "height", nonce, pixels: Math.ceil(box.blockSize) });
  };

  new ResizeObserver(postHeight).observe(document.documentElement, { box: "border-box" });
  post({ kind: "booted", nonce });
};
