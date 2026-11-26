/**
 * The frame's wait for a module script (`bootFrame`, `#plate/ui/portable-custom/frame-boot.ts`): a
 * load whose script defines no module fails once its stated wait runs out, and a wait of 0, or one
 * longer than a browser's timer holds, is no limit.
 *
 * The oracle is reading `pci-configuration-waits` (docs/spec-readings.md) and the implementation
 * guide's `waitSeconds` (§3.7.12.2: "how long the delivery engine should wait for each Javascript
 * file to load before timing out. A setting of 0 indicates that no timeout should be used"),
 * written by hand: a stated wait is never dropped, and HTML's `setTimeout` takes its delay as a
 * WebIDL `long`, milliseconds in a 32-bit signed integer, so a wait past 2,147,483.647 seconds is
 * longer than any session and no timer can hold it. The frame runs against a document of the test's
 * own, its timers vitest's fake ones, and a script that never loads, so only the wait can fail the
 * load.
 *
 * @module
 */
import { Brand } from "effect";
import { parseSync, Visitor } from "oxc-parser/src-js";
import type {
  ArrowFunctionExpression,
  BindingPattern,
  BindingRestElement,
  Function as ParsedFunction,
  Node,
  ParamPattern,
} from "oxc-parser/src-js";
import { afterEach, assert, describe, it, vi } from "vitest";
import type { FrameToPage } from "#plate/pci/frame-protocol.ts";
import { bootFrame } from "#plate/ui/portable-custom/frame-boot.ts";
import type { FrameNonce, PageMessage } from "#plate/ui/portable-custom/protocol.ts";

/**
 * The frame's nonce, its URL's fragment.
 */
const nonce = Brand.nominal<FrameNonce>()("n1");

/**
 * A message posted to the frame, as the frame's listener reads it: the island's, or one another
 * window posts as the island would.
 */
interface IslandMessage {
  readonly data: PageMessage;
  readonly source: Elsewhere | Island;
}

/**
 * The island, the frame's parent: what the frame posts to it, in order.
 */
interface Island {
  readonly posted: FrameToPage[];
  readonly postMessage: (message: FrameToPage) => void;
}

/**
 * An element of the test's document: every member the frame writes or calls, doing nothing.
 *
 * @returns The element.
 */
const elementOf = () => ({
  addEventListener: () => {},
  append: () => {},
  dataset: {},
  innerHTML: "",
});

/**
 * A `ResizeObserver` the frame constructs, which only notes what it is asked to observe.
 */
class NotedObserver {
  readonly observed: Element[] = [];

  observe(target: Element): void {
    this.observed.push(target);
  }
}

/**
 * Boot a frame in the test's document and hand it the island's `load` with one route, whose primary
 * waits the seconds given.
 *
 * @param waitSeconds The primary location's wait.
 * @returns The island, holding what the frame posted.
 */
const loaded = (waitSeconds: number): Island => {
  const posted: FrameToPage[] = [];
  const island: Island = {
    postMessage: (message) => {
      posted.push(message);
    },
    posted,
  };
  const listeners = new Map<string, (message: IslandMessage) => void>();

  vi.stubGlobal("location", { hash: `#${nonce}` });
  vi.stubGlobal("window", {
    addEventListener: (type: string, listener: (message: IslandMessage) => void) => {
      listeners.set(type, listener);
    },
    parent: island,
  });
  vi.stubGlobal("document", {
    addEventListener: () => {},
    body: elementOf(),
    createElement: elementOf,
    documentElement: { dir: "", getBoundingClientRect: () => ({ height: 0 }), lang: "" },
    head: elementOf(),
    title: "",
  });
  vi.stubGlobal("ResizeObserver", NotedObserver);
  bootFrame();
  listeners.get("message")?.({
    data: {
      dir: "ltr",
      entry: "a",
      kind: "load",
      lang: "en",
      markup: "",
      nonce,
      routes: [
        { id: "a", primary: "modules/a.js", waitSeconds: { fallback: 7, primary: waitSeconds } },
      ],
      templates: [],
      title: "PCI",
    },
    source: island,
  });

  return island;
};

/**
 * Whether the frame has told the island the load failed.
 *
 * @param island The island.
 * @returns Whether a `failed` is among what it was posted.
 */
const failed = (island: Island): boolean => island.posted.some(({ kind }) => kind === "failed");

describe("a PCI frame's wait for a module script", () => {
  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  // Bound: a second, and the longest wait a timer holds, 2,147,483.647 seconds.
  it.each([1, 2_147_483.647])("fails a load once a wait of %d s runs out", async (waitSeconds) => {
    vi.useFakeTimers();

    const island = loaded(waitSeconds);

    await vi.advanceTimersByTimeAsync(waitSeconds * 1000 - 1);
    assert.isFalse(failed(island), "not yet failed");
    await vi.advanceTimersByTimeAsync(1);
    assert.isTrue(failed(island), "failed once it ran out");
  });

  // Bound: 0, the first millisecond past a timer's longest delay, and 1e9 seconds, each waited out
  // ten times over.
  it.each([0, 2_147_483.648, 1e9])("never fails a load for a wait of %d s", async (waitSeconds) => {
    vi.useFakeTimers();

    const island = loaded(waitSeconds);

    await vi.advanceTimersByTimeAsync(Math.max(waitSeconds, 1) * 10_000);
    assert.isFalse(failed(island), "no limit");
  });
});

/**
 * A window other than the island: what is posted to it, in order.
 */
interface Elsewhere {
  readonly posted: FrameToPage[];
  readonly postMessage: (message: FrameToPage) => void;
}

/**
 * The response the fixture PCI gives, in the Appendix C JSON binding.
 */
interface FixtureResponse {
  readonly base: { readonly integer: number };
}

/**
 * The fixture PCI's object: the two readers the frame calls.
 */
interface FixtureInstance {
  readonly getResponse: () => FixtureResponse;
  readonly getState: () => string;
}

/**
 * What of the configuration the frame hands it the fixture PCI reads: the bridge's `onready`.
 */
interface FixtureConfiguration {
  readonly onready: (instance: FixtureInstance, state: string) => void;
}

/**
 * The fixture PCI's factory, as it registers it with the bridge.
 */
interface FixtureFactory {
  readonly getInstance: (dom: HTMLElement, configuration: FixtureConfiguration) => FixtureInstance;
  readonly typeIdentifier: string;
}

/**
 * The bridge, as the fixture PCI's module reads it: `register`.
 */
interface FixtureContext {
  readonly register: (factory: FixtureFactory) => void;
}

/**
 * The frame's AMD `define`, as the fixture PCI's module calls it: its dependencies, and a factory
 * that takes the bridge.
 */
type FixtureDefine = (
  dependencies: readonly string[],
  factory: (context: FixtureContext) => void,
) => void;

/**
 * The frame's window in the test's document: the listeners the frame adds, `define` once the frame
 * installs it, and `parent`, which a PCI can put its own window in place of.
 */
interface FrameWindow {
  readonly addEventListener: (type: string, listener: (message: IslandMessage) => void) => void;
  define?: FixtureDefine;
  parent: Elsewhere | Island;
}

/**
 * An element the frame makes, with the listeners it adds to it by event type.
 */
interface Made {
  readonly listeners: Map<string, (event: Event) => void>;
}

/**
 * A frame booted in the test's document under an island: the island and what it was posted, a wait
 * that ends once the frame has posted `registered`, the frame's window, the elements the frame made
 * in order, and a way to post the frame a message from a window, the island or another, through
 * the frame's own `message` listener.
 */
interface Booted {
  readonly island: Island;
  readonly made: readonly Made[];
  readonly receive: (message: PageMessage, source: Elsewhere | Island) => void;
  readonly registered: Promise<null>;
  readonly window: FrameWindow;
}

/**
 * Make an element of the test's document that keeps the listeners the frame adds to it.
 *
 * @param made The elements made so far, which it joins.
 * @returns The element.
 */
const keptElement = (made: Made[]) => {
  const listeners = new Map<string, (event: Event) => void>();

  made.push({ listeners });

  return {
    addEventListener: (type: string, listener: (event: Event) => void) => {
      listeners.set(type, listener);
    },
    append: () => {},
    dataset: {},
    innerHTML: "",
  };
};

/**
 * Boot a frame in the test's document under an island.
 *
 * @returns The frame, booted.
 */
const booted = (): Booted => {
  const posted: FrameToPage[] = [];
  const registered = Promise.withResolvers<null>();
  const island: Island = {
    postMessage: (message) => {
      posted.push(message);

      if (message.kind === "registered") {
        registered.resolve(null);
      }
    },
    posted,
  };
  const made: Made[] = [];
  const listeners = new Map<string, (message: IslandMessage) => void>();
  const frameWindow: FrameWindow = {
    addEventListener: (type, listener) => {
      listeners.set(type, listener);
    },
    parent: island,
  };

  vi.stubGlobal("location", { hash: `#${nonce}` });
  vi.stubGlobal("window", frameWindow);
  vi.stubGlobal("document", {
    addEventListener: () => {},
    body: elementOf(),
    createElement: () => keptElement(made),
    documentElement: { dir: "", getBoundingClientRect: () => ({ height: 0 }), lang: "" },
    head: elementOf(),
    title: "",
  });
  vi.stubGlobal("ResizeObserver", NotedObserver);
  bootFrame();

  return {
    island,
    made,
    receive: (message, source) => {
      listeners.get("message")?.({ data: message, source });
    },
    registered: registered.promise,
    window: frameWindow,
  };
};

/**
 * The fixture PCI's module, as its script runs it: a PCI whose `getInstance` puts a window of its
 * own in place of `parent`, as a classic script's top-level `var parent = …` would, then tells the
 * bridge it is ready.
 *
 * @param fixture The PCI's frame, the window it puts in place of `parent`, its response and its
 *   type identifier.
 * @param fixture.elsewhere The window it puts in place of `parent`.
 * @param fixture.frame The frame it runs in.
 * @param fixture.response Its response.
 * @param fixture.typeIdentifier Its type identifier.
 * @returns The module's factory, which registers the PCI with the bridge.
 */
const parentTaking =
  (fixture: {
    readonly elsewhere: Elsewhere;
    readonly frame: Booted;
    readonly response: FixtureResponse;
    readonly typeIdentifier: string;
  }) =>
  (context: FixtureContext): void => {
    context.register({
      getInstance: (_dom, configuration) => {
        fixture.frame.window.parent = fixture.elsewhere;

        const instance: FixtureInstance = {
          getResponse: () => fixture.response,
          getState: () => "",
        };

        configuration.onready(instance, "");

        return instance;
      },
      typeIdentifier: fixture.typeIdentifier,
    });
  };

describe("a PCI that puts its own window in place of the frame's `parent`", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("still has every response relayed to the island, and the island's messages taken", async () => {
    const frame = booted();
    const elsewherePosted: FrameToPage[] = [];
    const elsewhere: Elsewhere = {
      postMessage: (message) => {
        elsewherePosted.push(message);
      },
      posted: elsewherePosted,
    };
    const response: FixtureResponse = { base: { integer: 1 } };
    const typeIdentifier = "urn:qti-pie:test:parent";

    frame.receive(
      {
        dir: "ltr",
        entry: "a",
        kind: "load",
        lang: "en",
        markup: "",
        nonce,
        routes: [{ id: "a", primary: "modules/a.js", waitSeconds: { fallback: 0, primary: 0 } }],
        templates: [],
        title: "PCI",
      },
      frame.island,
    );
    frame.window.define?.(
      ["qtiCustomInteractionContext"],
      parentTaking({ elsewhere, frame, response, typeIdentifier }),
    );
    frame.made[1]?.listeners.get("load")?.(new Event("load"));
    await frame.registered;
    frame.receive(
      {
        configuration: {
          boundTo: {},
          contextVariables: {},
          properties: {},
          responseIdentifier: "RESPONSE",
          status: "interacting",
          templateVariables: {},
        },
        kind: "instantiate",
        nonce,
        state: undefined,
        typeIdentifier,
      },
      frame.island,
    );
    frame.made[0]?.listeners.get("qti-interaction-changed")?.(
      new CustomEvent("qti-interaction-changed", { detail: { value: response } }),
    );
    frame.receive({ kind: "complete", nonce }, elsewhere);
    assert.deepStrictEqual(
      frame.island.posted.map(({ kind }) => kind),
      ["booted", "registered", "ready", "changed"],
      "a `complete` from the PCI's own window, the frame's `parent` now, is not the island's, and the frame does nothing for it",
    );
    frame.receive({ kind: "complete", nonce }, frame.island);

    assert.deepStrictEqual(
      frame.island.posted.map(({ kind }) => kind),
      ["booted", "registered", "ready", "changed", "completed"],
      "the island hears the PCI ready, its response, and its completion, which it asked for after the PCI took `parent`",
    );
    assert.deepStrictEqual(
      elsewhere.posted,
      [],
      "the PCI's own window hears nothing of the frame's",
    );
  });
});

/**
 * The attributes of the frame's window a script of the frame can put its own value in place of, so
 * that a read after the PCI's scripts have run gives the PCI's value, or that name another window:
 * HTML's `[Replaceable]` `self`, `frames`, `length`, `parent`, `event` and `origin`, its settable
 * `name`, `status` and `opener`, its `top`, and CSSOM View's `[Replaceable]` sizes and places.
 *
 * @source HTML's `Window` interface and `WindowOrWorkerGlobalScope` mixin; CSSOM View's `partial
 *   interface Window`.
 * @see https://html.spec.whatwg.org/multipage/nav-history-apis.html#the-window-object
 * @see https://drafts.csswg.org/cssom-view/#extensions-to-the-window-interface
 */
const replaceable: ReadonlySet<string> = new Set([
  "devicePixelRatio",
  "event",
  "frames",
  "innerHeight",
  "innerWidth",
  "length",
  "name",
  "opener",
  "origin",
  "outerHeight",
  "outerWidth",
  "pageXOffset",
  "pageYOffset",
  "parent",
  "screen",
  "screenLeft",
  "screenTop",
  "screenX",
  "screenY",
  "scrollX",
  "scrollY",
  "self",
  "status",
  "top",
  "visualViewport",
]);

/**
 * The names a script reaches its own window by.
 */
const windowNames: ReadonlySet<string> = new Set(["globalThis", "window"]);

/**
 * A scope of a parsed script: the names declared in it, the scope it stands in, and whether it is
 * a function's, which `var` declares into.
 */
interface Scope {
  readonly function: boolean;
  readonly names: Set<string>;
  readonly outer: Scope | null;
}

/**
 * A read the scan found, judged once every scope holds all its declarations: a bare name, or an
 * attribute of the window by one of its names, and whether it is `host`'s own declaration.
 */
interface Read {
  readonly attribute: string;
  readonly host: boolean;
  readonly object: string | null;
  readonly scope: Scope;
}

/**
 * Tell whether a name is declared in a scope or one it stands in.
 *
 * @param scope The scope.
 * @param name The name.
 * @returns Whether it is.
 */
const declaredIn = (scope: Scope | null, name: string): boolean =>
  scope !== null && (scope.names.has(name) || declaredIn(scope.outer, name));

/**
 * Give the scope a `var` declares into: the nearest function's.
 *
 * @param scope The scope it is written in.
 * @returns The function's scope.
 */
const functionOf = (scope: Scope): Scope =>
  scope.function || scope.outer === null ? scope : functionOf(scope.outer);

/**
 * Declare the names a binding pattern binds in a scope, and mark its own names, the bindings and
 * an object pattern's keys, as reading nothing.
 *
 * @param pattern The pattern: a name, an object or array pattern, a rest or a default.
 * @param scope The scope.
 * @param unread The names that read nothing, which it adds to.
 */
const declare = (
  pattern: BindingPattern | BindingRestElement | ParamPattern | null,
  scope: Scope,
  unread: WeakSet<Node>,
): void => {
  if (pattern === null) {
    return;
  }

  if (pattern.type === "Identifier") {
    scope.names.add(pattern.name);
    unread.add(pattern);

    return;
  }

  if (pattern.type === "AssignmentPattern") {
    declare(pattern.left, scope, unread);

    return;
  }

  if (pattern.type === "RestElement") {
    declare(pattern.argument, scope, unread);

    return;
  }

  if (pattern.type === "TSParameterProperty") {
    declare(pattern.parameter, scope, unread);

    return;
  }

  if (pattern.type === "ArrayPattern") {
    for (const element of pattern.elements) {
      declare(element, scope, unread);
    }

    return;
  }

  for (const property of pattern.properties) {
    if (property.type === "RestElement") {
      declare(property.argument, scope, unread);
    } else {
      unread.add(property.key);
      declare(property.value, scope, unread);
    }
  }
};

/**
 * Find, in a script's source, every read of a replaceable attribute of its window but `parent`,
 * once, as `const host = window.parent`: a bare name no scope of the script declares, or an
 * attribute of `window` or `globalThis` where neither is declared either.
 *
 * @param source The script's source: a function's, as `String(bootFrame)` gives it.
 * @returns Each read found, as the script writes it; and, where `host`'s declaration is not there
 *   exactly once, a note of how many there are.
 * @constraint The parser and its `Visitor` come from `oxc-parser/src-js`, the package's entry for
 *   Node, where the suite runs. Its bare `oxc-parser` resolves, under the `browser` condition
 *   plate's `src/` is typed by, to its WebAssembly entry, which exports `Visitor` as a type alone.
 * @source `oxc-parser` 0.159.0: `package.json`'s `exports` (`"./src-js"`, and `"."`'s `browser`),
 *   `src-js/index.d.ts` and `src-js/wasm.d.ts`.
 */
const replaceableReads = (source: string): readonly string[] => {
  const { errors, program } = parseSync("boot.js", `(${source});`, { lang: "js" });
  const unread = new WeakSet<Node>();
  const hostInits = new WeakSet<Node>();
  const kinds: string[] = [];
  const reads: Read[] = [];
  let scope: Scope = { function: true, names: new Set(), outer: null };
  const enter = (isFunction: boolean): void => {
    scope = { function: isFunction, names: new Set(), outer: scope };
  };
  const leave = (): void => {
    scope = scope.outer ?? scope;
  };
  const block = (): void => {
    enter(false);
  };
  const started = (node: ArrowFunctionExpression | ParsedFunction): void => {
    if (node.type === "FunctionDeclaration") {
      declare(node.id, scope, unread);
    }

    enter(true);

    if (node.type === "FunctionExpression") {
      declare(node.id, scope, unread);
    }

    for (const param of node.params) {
      declare(param, scope, unread);
    }
  };
  const keyOnly = (node: { readonly computed: boolean; readonly key: Node }): void => {
    if (!node.computed) {
      unread.add(node.key);
    }
  };

  new Visitor({
    ArrowFunctionExpression: started,
    "ArrowFunctionExpression:exit": leave,
    BlockStatement: block,
    "BlockStatement:exit": leave,
    BreakStatement: (node) => {
      if (node.label !== null) {
        unread.add(node.label);
      }
    },
    CatchClause: (node) => {
      enter(false);
      declare(node.param, scope, unread);
    },
    "CatchClause:exit": leave,
    ContinueStatement: (node) => {
      if (node.label !== null) {
        unread.add(node.label);
      }
    },
    ForInStatement: block,
    "ForInStatement:exit": leave,
    ForOfStatement: block,
    "ForOfStatement:exit": leave,
    ForStatement: block,
    "ForStatement:exit": leave,
    FunctionDeclaration: started,
    "FunctionDeclaration:exit": leave,
    FunctionExpression: started,
    "FunctionExpression:exit": leave,
    Identifier: (node) => {
      if (!unread.has(node) && replaceable.has(node.name)) {
        reads.push({ attribute: node.name, host: false, object: null, scope });
      }
    },
    LabeledStatement: (node) => {
      unread.add(node.label);
    },
    MemberExpression: (node) => {
      const named = node.computed ? null : node.property.name;

      if (!node.computed) {
        unread.add(node.property);
      }

      if (
        node.object.type === "Identifier" &&
        windowNames.has(node.object.name) &&
        named !== null &&
        replaceable.has(named)
      ) {
        reads.push({
          attribute: named,
          host: hostInits.has(node),
          object: node.object.name,
          scope,
        });
      }
    },
    MethodDefinition: keyOnly,
    Property: keyOnly,
    PropertyDefinition: keyOnly,
    VariableDeclaration: (node) => {
      kinds.push(node.kind);
    },
    "VariableDeclaration:exit": () => {
      kinds.pop();
    },
    VariableDeclarator: (node) => {
      declare(node.id, kinds.at(-1) === "var" ? functionOf(scope) : scope, unread);

      if (node.id.type === "Identifier" && node.id.name === "host" && node.init !== null) {
        hostInits.add(node.init);
      }
    },
  }).visit(program);

  const global = reads.filter((read) => !declaredIn(read.scope, read.object ?? read.attribute));
  const hosts = global.filter((read) => read.host && read.object === "window");
  const found = global
    .filter((read) => !(read.host && read.object === "window"))
    .map((read) => (read.object === null ? read.attribute : `${read.object}.${read.attribute}`));

  return [
    ...errors.map((error) => `a parse error: ${error.message}`),
    ...found,
    ...(hosts.length === 1 ? [] : [`${String(hosts.length)} declarations of host`]),
  ];
};

describe("the frame's boot", () => {
  it("reads no attribute of its window a script can replace, but `parent`, once, as `host`", () => {
    assert.deepStrictEqual(
      replaceableReads(
        "function () { const host = window.parent; const name = 1; for (const event of []) { use(event); } return [name, self, window.top, globalThis.origin, length, event]; }",
      ),
      ["self", "window.top", "globalThis.origin", "length", "event"],
      "the scan finds a planted read of each kind, and none of a name the script declares",
    );
    assert.deepStrictEqual(
      replaceableReads(String(bootFrame)),
      [],
      "the boot reads its parent once, as `host`, and no other attribute a PCI's script could put its own value in place of",
    );
  });
});
