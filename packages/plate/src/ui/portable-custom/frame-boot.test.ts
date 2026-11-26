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
import { setImmediate } from "node:timers/promises";
import { createContext, runInContext } from "node:vm";
import { regex } from "arkregex";
import { Brand, Effect, Predicate } from "effect";
import { Digest } from "effect/crypto";
import { parseSync, Visitor } from "oxc-parser/src-js";
import type {
  ArrowFunctionExpression,
  BindingPattern,
  BindingRestElement,
  Function as ParsedFunction,
  MemberExpression,
  Node,
  ParamPattern,
} from "oxc-parser/src-js";
import { afterEach, assert, describe, it, vi } from "vitest";
import type { FrameToPage } from "#plate/pci/frame-protocol.ts";
import { bootFrame } from "#plate/ui/portable-custom/frame-boot.ts";
import { framePage } from "#plate/ui/portable-custom/frame-page.ts";
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

  observe(target: Element, ..._options: readonly ResizeObserverOptions[]): void {
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
 * The test document's element, as the frame reads and sets it: its direction and language, its
 * data states, and its box's height.
 */
interface Root {
  readonly dataset: { padded?: string };
  dir: string;
  readonly getBoundingClientRect: () => { readonly height: number };
  lang: string;
}

/**
 * A `ResizeObserver` the frame constructs, given the frame's callback.
 */
type ObserverClass = new (callback: (entries: readonly ResizeObserverEntry[]) => void) => {
  readonly observe: (target: Element, ...options: readonly ResizeObserverOptions[]) => void;
};

/**
 * Give the test document's element when no layout matters: no padding, and a box of no height.
 *
 * @returns The element.
 */
const plainRoot = (): Root => ({
  dataset: {},
  dir: "",
  getBoundingClientRect: () => ({ height: 0 }),
  lang: "",
});

/**
 * What `getComputedStyle` answers for an element of the test's document: its writing mode.
 */
type ComputedOf = (element: Root) => { readonly writingMode: string };

/**
 * What `getComputedStyle` answers where no case sets a writing mode: `horizontal-tb`, for every
 * element.
 *
 * @returns The answer.
 */
const horizontalOnly: ComputedOf = () => ({ writingMode: "horizontal-tb" });

/**
 * Boot a frame in the test's document under an island.
 *
 * @param root The document's element.
 * @param observer The `ResizeObserver` the frame constructs.
 * @param computedOf What `getComputedStyle` answers, element by element.
 * @returns The frame, booted.
 */
const booted = (root: Root, observer: ObserverClass, computedOf: ComputedOf): Booted => {
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
    documentElement: root,
    head: elementOf(),
    title: "",
  });
  vi.stubGlobal("ResizeObserver", observer);
  vi.stubGlobal("getComputedStyle", computedOf);
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

/**
 * The island's `load` for one route, `a`, with no wait and no markup.
 */
const loadOfA: PageMessage = {
  dir: "ltr",
  entry: "a",
  kind: "load",
  lang: "en",
  markup: "",
  nonce,
  routes: [{ id: "a", primary: "modules/a.js", waitSeconds: { fallback: 0, primary: 0 } }],
  templates: [],
  title: "PCI",
};

/**
 * Give the island's choice of a factory, its configuration the plainest one.
 *
 * @param typeIdentifier The factory's type identifier.
 * @returns The island's `instantiate`.
 */
const instantiateOf = (typeIdentifier: string): PageMessage => ({
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
});

describe("a PCI that puts its own window in place of the frame's `parent`", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("still has every response relayed to the island, and the island's messages taken", async () => {
    const frame = booted(plainRoot(), NotedObserver, horizontalOnly);
    const elsewherePosted: FrameToPage[] = [];
    const elsewhere: Elsewhere = {
      postMessage: (message) => {
        elsewherePosted.push(message);
      },
      posted: elsewherePosted,
    };
    const response: FixtureResponse = { base: { integer: 1 } };
    const typeIdentifier = "urn:qti-pie:test:parent";

    frame.receive(loadOfA, frame.island);
    frame.window.define?.(
      ["qtiCustomInteractionContext"],
      parentTaking({ elsewhere, frame, response, typeIdentifier }),
    );
    frame.made[1]?.listeners.get("load")?.(new Event("load"));
    await frame.registered;
    frame.receive(instantiateOf(typeIdentifier), frame.island);
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
 *
 * - HTML's `[Replaceable]` ones: `self`, `navigation`, the six bars (`locationbar`, `menubar`,
 *   `personalbar`, `scrollbars`, `statusbar`, `toolbar`), `frames`, `length`, `parent`,
 *   `clientInformation`, the obsolete `external`, and `WindowOrWorkerGlobalScope`'s `origin`;
 * - HTML's settable `name`, `status` and `opener`, and its unforgeable `top`, another window;
 * - The DOM Standard's `[Replaceable]` `event`;
 * - CSSOM View's fifteen `[Replaceable]` sizes and places.
 *
 * @source HTML's `Window` interface, its obsolete features' `partial interface Window` and the
 *   `WindowOrWorkerGlobalScope` mixin; the DOM Standard's `partial interface Window`; CSSOM View's
 *   `partial interface Window`.
 * @see https://html.spec.whatwg.org/multipage/nav-history-apis.html#the-window-object
 * @see https://html.spec.whatwg.org/multipage/obsolete.html#Window-partial
 * @see https://dom.spec.whatwg.org/#interface-window-extensions
 * @see https://drafts.csswg.org/cssom-view/#extensions-to-the-window-interface
 */
const replaceable: ReadonlySet<string> = new Set([
  "clientInformation",
  "devicePixelRatio",
  "event",
  "external",
  "frames",
  "innerHeight",
  "innerWidth",
  "length",
  "locationbar",
  "menubar",
  "name",
  "navigation",
  "opener",
  "origin",
  "outerHeight",
  "outerWidth",
  "pageXOffset",
  "pageYOffset",
  "parent",
  "personalbar",
  "screen",
  "screenLeft",
  "screenTop",
  "screenX",
  "screenY",
  "scrollbars",
  "scrollX",
  "scrollY",
  "self",
  "status",
  "statusbar",
  "toolbar",
  "top",
  "visualViewport",
]);

/**
 * The members that reach a window from something else: a window's own `window` and `globalThis`,
 * and a document's `defaultView`.
 */
const windowMembers: ReadonlySet<string> = new Set(["defaultView", "globalThis", "window"]);

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
 * Give the name a member's key writes: an identifier's, a string's, or a template's with no
 * substitution; `null` for any other computed key.
 *
 * @param member The member expression.
 * @returns The name.
 */
const memberNameOf = (member: MemberExpression): string | null => {
  const key = member.property;

  if (!member.computed) {
    return key.type === "Identifier" ? key.name : null;
  }

  if (key.type === "Literal") {
    return Predicate.isString(key.value) ? key.value : null;
  }

  return key.type === "TemplateLiteral" && key.expressions.length === 0
    ? (key.quasis[0]?.value.cooked ?? null)
    : null;
};

/**
 * Give the names an assignment's target assigns: a name, or each name of an array or object
 * pattern, with its defaults and rests.
 *
 * @param target The target.
 * @returns The names.
 */
const assignedNames = (target: Node | null): readonly string[] => {
  if (target?.type === "Identifier") {
    return [target.name];
  }

  if (target?.type === "ArrayPattern") {
    return target.elements.flatMap((element) => assignedNames(element));
  }

  if (target?.type === "ObjectPattern") {
    return target.properties.flatMap((property) =>
      assignedNames(property.type === "RestElement" ? property.argument : property.value),
    );
  }

  if (target?.type === "AssignmentPattern") {
    return assignedNames(target.left);
  }

  return target?.type === "RestElement" ? assignedNames(target.argument) : [];
};

/**
 * Find, in a script's source, every way it could read a replaceable attribute of its window but
 * `parent`, once, as `const host = window.parent` in the script's own top-level body:
 *
 * - A bare name no scope of the script declares, scopes resolved as JavaScript's: a block's, a
 *   `switch`'s, a `for` head's, a `catch`'s, a function's parameters', and its body's own `var`s
 *   apart from them;
 * - An attribute of `window` or `globalThis`, where neither is declared either;
 * - Any other use of `window` or `globalThis` than a member access by a name or a string, which could
 *   reach any attribute: an index, a destructuring, an alias, a sequence. `Object.assign(window,
 *   …)` alone is allowed, as a statement, the boot's way to install its `define`, so that the
 *   window it gives is never used;
 * - Any `.window`, `.globalThis` or `.defaultView` member, another way to the window, written as a
 *   name or as a string;
 * - Any `this` that no function, class field or static block of the script's own binds: the boot's
 *   arrows take theirs from the script's top, the window;
 * - Any assignment to `host`, and a `host` declared other than as a `const`.
 *
 * A computed member whose key is a string, or a template with no substitution, is read as the
 * member it names. A class's static block is a function's scope, as its `var`s are its own.
 *
 * @param source The script's source: a function's, as `String(bootFrame)` gives it.
 * @returns Each read found, as the script writes it, a window member as its member's name, a
 *   `this` as `this`, an assignment to `host` as `host =`; and, where `host`'s `const` is not
 *   there exactly once, a note of how many there are.
 * @constraint A syntactic scan cannot follow a value: an event's `view`, `source`,
 *   `currentTarget` or `target` is the window too, as is anything a function returns. The run in
 *   a `node:vm` context (`ran`) records those, on every way it enters the boot; the scan holds
 *   every path by name, the paths the run does not take among them.
 * @constraint The parser and its `Visitor` come from `oxc-parser/src-js`, the package's entry for
 *   Node, where the suite runs. Its bare `oxc-parser` resolves, under the `browser` condition
 *   plate's `src/` is typed by, to its WebAssembly entry, which exports `Visitor` as a type alone.
 * @source `oxc-parser` 0.159.0: `package.json`'s `exports` (`"./src-js"`, and `"."`'s `browser`),
 *   `src-js/index.d.ts` and `src-js/wasm.d.ts`.
 */
const replaceableReads = (source: string): readonly string[] => {
  const { errors, program } = parseSync("boot.js", `(${source});`, { lang: "js" });
  const unread = new WeakSet<Node>();
  const allowed = new WeakSet<Node>();
  const bodies = new WeakSet<Node>();
  const hostInits = new WeakSet<Node>();
  const kinds: string[] = [];
  const reads: Read[] = [];
  let scope: Scope = { function: true, names: new Set(), outer: null };
  let bootBody: Scope | null = null;
  let binders = 0;
  const enter = (isFunction: boolean): void => {
    scope = { function: isFunction, names: new Set(), outer: scope };
  };
  const leave = (): void => {
    scope = scope.outer ?? scope;
  };
  const block = (): void => {
    enter(false);
  };
  const blockOrBody = (node: Node): void => {
    enter(bodies.has(node));

    if (bodies.has(node) && bootBody === null) {
      bootBody = scope;
    }
  };
  const started = (node: ArrowFunctionExpression | ParsedFunction): void => {
    if (node.type === "FunctionDeclaration") {
      declare(node.id, scope, unread);
    }

    enter(false);

    if (node.type === "FunctionExpression") {
      declare(node.id, scope, unread);
    }

    for (const param of node.params) {
      declare(param, scope, unread);
    }

    if (node.body?.type === "BlockStatement") {
      bodies.add(node.body);
    }
  };
  const keyOnly = (node: { readonly computed: boolean; readonly key: Node }): void => {
    if (!node.computed) {
      unread.add(node.key);
    }
  };
  const binding = (): void => {
    binders += 1;
  };
  const unbinding = (): void => {
    binders -= 1;
  };
  const fault = (attribute: string): void => {
    reads.push({ attribute, host: false, object: null, scope });
  };

  new Visitor({
    ArrowFunctionExpression: started,
    "ArrowFunctionExpression:exit": leave,
    AssignmentExpression: (node) => {
      if (assignedNames(node.left).includes("host")) {
        fault("host =");
      }
    },
    BlockStatement: blockOrBody,
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
    ExpressionStatement: (node) => {
      const call = node.expression;

      if (call.type !== "CallExpression" || call.callee.type !== "MemberExpression") {
        return;
      }

      const [first] = call.arguments;

      if (
        call.callee.object.type === "Identifier" &&
        call.callee.object.name === "Object" &&
        memberNameOf(call.callee) === "assign" &&
        first?.type === "Identifier" &&
        first.name === "window"
      ) {
        allowed.add(first);
      }
    },
    ForInStatement: block,
    "ForInStatement:exit": leave,
    ForOfStatement: block,
    "ForOfStatement:exit": leave,
    ForStatement: block,
    "ForStatement:exit": leave,
    FunctionDeclaration: (node) => {
      started(node);
      binding();
    },
    "FunctionDeclaration:exit": () => {
      leave();
      unbinding();
    },
    FunctionExpression: (node) => {
      started(node);
      binding();
    },
    "FunctionExpression:exit": () => {
      leave();
      unbinding();
    },
    Identifier: (node) => {
      const read =
        !unread.has(node) &&
        (replaceable.has(node.name) || (windowNames.has(node.name) && !allowed.has(node)));

      if (read) {
        reads.push({ attribute: node.name, host: false, object: null, scope });
      }
    },
    LabeledStatement: (node) => {
      unread.add(node.label);
    },
    MemberExpression: (node) => {
      const named = memberNameOf(node);

      if (!node.computed) {
        unread.add(node.property);
      }

      if (
        named !== null &&
        node.object.type === "Identifier" &&
        windowNames.has(node.object.name)
      ) {
        allowed.add(node.object);
      }

      if (named !== null && windowMembers.has(named)) {
        reads.push({ attribute: `.${named}`, host: false, object: null, scope });
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
    PropertyDefinition: (node) => {
      keyOnly(node);
      binding();
    },
    "PropertyDefinition:exit": unbinding,
    StaticBlock: () => {
      enter(true);
      binding();
    },
    "StaticBlock:exit": () => {
      leave();
      unbinding();
    },
    SwitchStatement: block,
    "SwitchStatement:exit": leave,
    ThisExpression: () => {
      if (binders === 0) {
        fault("this");
      }
    },
    UpdateExpression: (node) => {
      if (assignedNames(node.argument).includes("host")) {
        fault("host =");
      }
    },
    VariableDeclaration: (node) => {
      kinds.push(node.kind);
    },
    "VariableDeclaration:exit": () => {
      kinds.pop();
    },
    VariableDeclarator: (node) => {
      declare(node.id, kinds.at(-1) === "var" ? functionOf(scope) : scope, unread);

      if (
        node.id.type === "Identifier" &&
        node.id.name === "host" &&
        node.init !== null &&
        kinds.at(-1) === "const" &&
        scope === bootBody
      ) {
        hostInits.add(node.init);
      }
    },
  }).visit(program);

  const global = reads.filter(
    (read) =>
      read.attribute === "this" ||
      read.attribute === "host =" ||
      !declaredIn(read.scope, read.object ?? read.attribute),
  );
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
      replaceableReads(
        "function () { const host = window.parent; return [toolbar, clientInformation, navigation]; }",
      ),
      ["toolbar", "clientInformation", "navigation"],
      "the scan knows HTML's bars, `clientInformation` and `navigation`",
    );
    assert.deepStrictEqual(
      replaceableReads(
        "function () { const host = window.parent; switch (1) { case 1: const length = 2; } return length; }",
      ),
      ["length"],
      "a `const` of a `switch` case is the switch's, not the read's after it (COLD's P6)",
    );
    assert.deepStrictEqual(
      replaceableReads(
        "function () { const host = window.parent; function f(x = self) { var self; return x; } return f; }",
      ),
      ["self"],
      "a parameter's default reads past the body's own `var` of the same name (COLD's P7)",
    );
    assert.deepStrictEqual(
      replaceableReads(
        'function () { const host = window.parent; const key = "parent"; return window[key]; }',
      ),
      ["window"],
      "an index of the window is a fault",
    );
    assert.deepStrictEqual(
      replaceableReads(
        'function () { const host = window.parent; return [window["parent"], window[`top`]]; }',
      ),
      ["window.parent", "window.top"],
      "a member by a string or a plain template is the member it names",
    );
    assert.deepStrictEqual(
      replaceableReads(
        'function () { const host = window.parent; return [document["defaultView"].parent, document.body.ownerDocument[`defaultView`]]; }',
      ),
      [".defaultView", ".defaultView"],
      "a document's `defaultView` by a string is a fault (COLD's Q3 and Q11)",
    );
    assert.deepStrictEqual(
      replaceableReads(
        "() => { const host = window.parent; const f = function () { return this; }; class C { x = this; static { this.y = 1; } } return [() => this.parent, f, C]; }",
      ),
      ["this"],
      "a `this` the script's top gives, the window, is a fault, and one a function, a field or a static block binds is not (COLD's Q1)",
    );
    assert.deepStrictEqual(
      replaceableReads(
        "function () { const host = window.parent; Object.assign(window, {}); return Object.assign(window, {}).parent; }",
      ),
      ["window"],
      "`Object.assign(window, …)` is allowed only as a statement, whose window goes unused (COLD's Q2)",
    );
    assert.deepStrictEqual(
      replaceableReads(
        "function () { const host = window.parent; class C { static { const name = 1; } } return [C, name]; }",
      ),
      ["name"],
      "a static block's declarations are its own, not the read's after it (COLD's Q6)",
    );
    assert.deepStrictEqual(
      replaceableReads(
        "function () { let host = window.parent; const later = () => { host = window.parent; }; return later; }",
      ),
      ["window.parent", "host =", "window.parent", "0 declarations of host"],
      "`host` counts only as a `const`, and an assignment to it is a fault (COLD's Q8)",
    );
    assert.deepStrictEqual(
      replaceableReads(
        "function () { const host = window.parent; const { parent: p } = window; return p; }",
      ),
      ["window"],
      "a destructuring of the window is a fault",
    );
    assert.deepStrictEqual(
      replaceableReads(
        "function () { const host = window.parent; const w = window; return w.parent; }",
      ),
      ["window"],
      "an alias of the window is a fault",
    );
    assert.deepStrictEqual(
      replaceableReads(
        "function () { const host = window.parent; return document.defaultView.parent; }",
      ),
      [".defaultView"],
      "a document's `defaultView` is a fault",
    );
    assert.deepStrictEqual(
      replaceableReads("function () { const host = window.parent; return window.window.parent; }"),
      [".window"],
      "a window's own `window` is a fault",
    );
    assert.deepStrictEqual(
      replaceableReads("function () { const host = window.parent; return (0, window).parent; }"),
      ["window"],
      "the window in a sequence is a fault",
    );
    assert.deepStrictEqual(
      replaceableReads(
        "function () { const post = () => { const host = window.parent; return host; }; return post; }",
      ),
      ["window.parent", "0 declarations of host"],
      "`host` counts only in the script's own top-level body, not in a function it runs later (COLD's P8)",
    );
    assert.deepStrictEqual(
      replaceableReads(String(bootFrame)),
      [],
      "the boot reads its parent once, as `host`, and no other attribute a PCI's script could put its own value in place of",
    );
  });
});

/**
 * The frame's document laid out at one height of the frame: the root's border box in its used
 * writing mode, its inline and block sizes, and its content box's block size, each in the root's
 * own pixels, as a `ResizeObserver` reports them; its bounding rectangle's height, transforms and
 * zoom applied; and the height the document takes in the frame, what it paints and the margins
 * around it, in the frame's pixels.
 */
interface Laid {
  readonly block: number;
  readonly content: number;
  readonly inline: number;
  readonly rect: number;
  readonly taken: number;
}

/**
 * A box a `ResizeObserver` of the test's layout watches: the box it was asked for, the frame's
 * callback, that box's sizes when it last reported them, and the element.
 */
interface Watched {
  readonly box: ResizeObserverBoxOptions;
  last: string;
  readonly report: (entries: readonly ResizeObserverEntry[]) => void;
  readonly target: Element;
}

/**
 * A layout for the test's document: its element; a `ResizeObserver` that, as a browser's, reports
 * a change of the box it was asked to observe and of no other; and the layout's step, which lays
 * the document out at the frame's height and delivers each observation due.
 */
interface Layout {
  readonly layOut: (height: number) => Laid;
  readonly observer: ObserverClass;
  readonly root: Root;
}

/**
 * Give the observation of a document element laid out as given.
 *
 * @param target The element.
 * @param laid Its layout.
 * @returns The observation's entry.
 */
const entryOf = (target: Element, laid: Laid): ResizeObserverEntry => ({
  borderBoxSize: [{ blockSize: laid.block, inlineSize: laid.inline }],
  contentBoxSize: [{ blockSize: laid.content, inlineSize: laid.inline }],
  contentRect: {
    bottom: laid.content,
    height: laid.content,
    left: 0,
    right: laid.inline,
    toJSON: () => ({ height: laid.content, width: laid.inline }),
    top: 0,
    width: laid.inline,
    x: 0,
    y: 0,
  },
  devicePixelContentBoxSize: [{ blockSize: laid.content, inlineSize: laid.inline }],
  target,
});

/**
 * The frame's width, and its height before it has posted one, in CSS pixels: an iframe 600 px
 * wide and 300 px tall, as COLD's probe had it.
 */
const iframe = { firstHeight: 300, width: 600 } as const;

/**
 * Lay the test's document out as a browser would, observed by the frame's `ResizeObserver`.
 *
 * @param laidAt The document's layout at a height of the frame.
 * @param dataset The document element's data states, which the layout may read.
 * @returns The layout.
 */
const observedLayout = (laidAt: (height: number) => Laid, dataset: Root["dataset"]): Layout => {
  const watched: Watched[] = [];
  let laid = laidAt(iframe.firstHeight);

  return {
    layOut: (height) => {
      laid = laidAt(height);

      for (const each of watched) {
        const block = each.box === "border-box" ? laid.block : laid.content;
        const size = `${String(laid.inline)} ${String(block)}`;

        if (size !== each.last) {
          each.last = size;
          each.report([entryOf(each.target, laid)]);
        }
      }

      return laid;
    },
    observer: class {
      readonly #report: (entries: readonly ResizeObserverEntry[]) => void;

      constructor(report: (entries: readonly ResizeObserverEntry[]) => void) {
        this.#report = report;
      }

      observe(target: Element, ...options: readonly ResizeObserverOptions[]): void {
        watched.push({
          box: options[0]?.box ?? "content-box",
          last: "",
          report: this.#report,
          target,
        });
      }
    },
    root: {
      dataset,
      dir: "",
      getBoundingClientRect: () => ({ height: laid.rect }),
      lang: "",
    },
  };
};

/**
 * Lay the test's document out: its element 410 px of content, its bottom padding 40 px where its
 * `data-padded` state is on, as a stylesheet rule keyed on that state would lay it out.
 *
 * @returns The layout.
 */
const paddedLayout = (): Layout => {
  const content = 410;
  const dataset: Root["dataset"] = {};

  return observedLayout(() => {
    const border = content + (dataset.padded === undefined ? 0 : 40);

    return { block: border, content, inline: 1000, rect: border, taken: border };
  }, dataset);
};

/**
 * The fixture PCI's module, as its script runs it: a PCI whose `getInstance` turns on its
 * document's element's `data-padded` state, which grows that element's own bottom padding by 40 px,
 * a change of its border box and not of its content box, then tells the bridge it is ready.
 *
 * @param typeIdentifier Its type identifier.
 * @returns The module's factory, which registers the PCI with the bridge.
 */
const paddingGrowing =
  (typeIdentifier: string) =>
  (context: FixtureContext): void => {
    context.register({
      getInstance: (_dom, configuration) => {
        document.documentElement.dataset["padded"] = "";

        const instance: FixtureInstance = {
          getResponse: () => ({ base: { integer: 0 } }),
          getState: () => "",
        };

        configuration.onready(instance, "");

        return instance;
      },
      typeIdentifier,
    });
  };

/**
 * The heights a frame posted the island, in order.
 *
 * @param island The island.
 * @returns The heights, in pixels.
 */
const heightsOf = (island: Island): readonly number[] =>
  island.posted.flatMap((message) => (message.kind === "height" ? [message.pixels] : []));

describe("a PCI that grows its frame's root element's own padding", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("has the frame post the root's new height, its border box's", async () => {
    const layout = paddedLayout();
    const booting = booted(layout.root, layout.observer, horizontalOnly);
    const typeIdentifier = "urn:qti-pie:test:padding";

    layout.layOut(iframe.firstHeight);
    booting.receive(loadOfA, booting.island);
    booting.window.define?.(["qtiCustomInteractionContext"], paddingGrowing(typeIdentifier));
    booting.made[1]?.listeners.get("load")?.(new Event("load"));
    await booting.registered;
    booting.receive(instantiateOf(typeIdentifier), booting.island);
    layout.layOut(iframe.firstHeight);

    assert.deepStrictEqual(
      heightsOf(booting.island),
      [410, 450],
      "the frame posts its height once laid out, and again once the PCI's padding grows it by 40 px",
    );
  });
});

/**
 * A declaration a stylesheet or a `style` attribute makes on an element: its value, and whether it
 * is `!important`.
 */
interface Declared {
  readonly important: boolean;
  readonly value: string;
}

/**
 * The declarations a stylesheet or a `style` attribute makes on one element, by property.
 */
type Declarations = ReadonlyMap<string, Declared>;

/**
 * The longhands a one-value `margin` sets, the ones the test's layout reads.
 */
const marginSides = ["margin-bottom", "margin-left", "margin-right", "margin-top"] as const;

/**
 * Read declarations as a `style` attribute or a rule's block writes them: `property: value`, each
 * ended by `;`, and `!important` where it is. A `margin` of one value sets each of its sides.
 *
 * @param text The declarations' text.
 * @returns The declarations.
 */
const declarationsOf = (text: string): Declarations =>
  new Map(
    text.split(";").flatMap((written): (readonly [string, Declared])[] => {
      const [named = "", ...rest] = written.split(":");
      const property = named.trim();
      const stated = rest.join(":").trim();
      const important = stated.endsWith("!important");
      const declared = {
        important,
        value: important ? stated.slice(0, -"!important".length).trim() : stated,
      };

      if (property === "") {
        return [];
      }

      return property === "margin"
        ? marginSides.map((side) => [side, declared] as const)
        : [[property, declared] as const];
    }),
  );

/**
 * The initial value of each property the test's layout reads, where neither the frame page nor a
 * PCI's stylesheet sets it.
 */
const initialValues: ReadonlyMap<string, string> = new Map([
  ["contain", "none"],
  ["content-visibility", "visible"],
  ["height", "auto"],
  ["margin-bottom", "0"],
  ["margin-left", "0"],
  ["margin-right", "0"],
  ["margin-top", "0"],
  ["max-height", "none"],
  ["min-height", "auto"],
  ["offset-path", "none"],
  ["padding-bottom", "0"],
  ["position", "static"],
  ["rotate", "none"],
  ["scale", "none"],
  ["transform", "none"],
  ["translate", "none"],
  ["writing-mode", "horizontal-tb"],
  ["zoom", "1"],
]);

/**
 * The declarations the frame's root and body carry from one source: the frame page's `style`
 * attributes, or a PCI's stylesheet.
 */
interface Sourced {
  readonly body: Declarations;
  readonly root: Declarations;
}

/**
 * The `style` attribute of the frame page's `html` and `body` elements, in its HTML.
 */
const styleAttribute = {
  body: regex('<body style="(?<declared>[^"]*)"', "u"),
  root: regex('<html style="(?<declared>[^"]*)"', "u"),
} as const;

/**
 * Read the `style` attributes of the frame page's `html` and `body` elements from its HTML, none
 * where it writes none.
 *
 * @param html The page's HTML.
 * @returns Their declarations.
 */
const pinnedOf = (html: string): Sourced => ({
  body: declarationsOf(styleAttribute.body.exec(html)?.groups.declared ?? ""),
  root: declarationsOf(styleAttribute.root.exec(html)?.groups.declared ?? ""),
});

/**
 * An element of the frame's document whose properties the test's layout reads.
 */
type Styled = keyof Sourced;

/**
 * The value an element's property takes.
 */
type Style = (element: Styled, property: string) => string;

/**
 * Give the value each property of the root and the body takes: the `style` attribute's
 * `!important` declaration, then the stylesheet's, then the attribute's other one, then the
 * stylesheet's, as CSS Cascade 5 sorts them (importance first, then element-attached before rule
 * declarations); else, for the body's writing mode, the root's, which it inherits; else the
 * property's initial value.
 *
 * @param pinned The frame page's `style` attributes.
 * @param sheet A PCI's stylesheet's declarations on the root and the body.
 * @returns The value of a property of either element.
 */
const styleOf =
  (pinned: Sourced, sheet: Sourced): Style =>
  (element, property) => {
    const attribute = pinned[element].get(property);
    const rule = sheet[element].get(property);
    const declared =
      [attribute, rule].find((each) => each?.important === true) ?? attribute ?? rule;

    if (declared !== undefined) {
      return declared.value;
    }

    return element === "body" && property === "writing-mode"
      ? styleOf(pinned, sheet)("root", property)
      : (initialValues.get(property) ?? "");
  };

/**
 * What the frame's document holds: a block of a given height, or a run of text of a given
 * advance, which breaks into lines 20 px apart.
 */
type Content = { readonly block: number } | { readonly text: number };

/**
 * The body's margin, on each side, as a browser's own stylesheet gives it.
 */
const bodyMargin = 8;

/**
 * Give the extent the body takes in the root, margins included: a block's own height, or the
 * text's lines at the body's inline size, in the block direction of the root's writing mode.
 *
 * @param content The content.
 * @param inline The root's inline size.
 * @returns The extent.
 */
const flowOf = (content: Content, inline: number): number =>
  ("block" in content ? content.block : Math.ceil(content.text / (inline - 2 * bodyMargin)) * 20) +
  2 * bodyMargin;

/**
 * The unit of a length in pixels.
 */
const pixelUnit = regex("px$", "u");

/**
 * The two transforms the cases write: a scale, and a translation down.
 */
const transforms = {
  down: regex("^translateY\\((?<down>[\\d.]+)px\\)$", "u"),
  scale: regex("^scale\\((?<factor>[\\d.]+)\\)$", "u"),
} as const;

/**
 * Read a length in pixels, or a number, as written: `10px`, `0`, `2`.
 *
 * @param value The value.
 * @returns The number.
 */
const pixelsIn = (value: string): number => Number(value.replace(pixelUnit, ""));

/**
 * Read a length: pixels, or a percentage of the size given; `undefined` for `auto` or `none`.
 *
 * @param value The value, as written.
 * @param of The size a percentage is of.
 * @returns The length.
 */
const lengthOf = (value: string, of: number): number | undefined => {
  if (value.endsWith("%")) {
    return (Number(value.slice(0, -1)) / 100) * of;
  }

  return value === "auto" || value === "none" ? undefined : pixelsIn(value);
};

/**
 * The root's box before its transforms, in its own pixels: its border box's inline and block
 * sizes and its content box's block size, in its used writing mode; its physical width and height;
 * and the physical height its content reaches, which may overflow the box.
 */
interface Box {
  readonly block: number;
  readonly content: number;
  readonly height: number;
  readonly inline: number;
  readonly reach: number;
  readonly width: number;
}

/**
 * The viewport the root is laid out in, in its own pixels: the frame's, divided by its zoom.
 */
interface Viewport {
  readonly height: number;
  readonly width: number;
}

/**
 * Give one of the root's lengths, by property, in pixels: 0 where it sets none.
 *
 * @param style The root's and the body's styles.
 * @param property The property.
 * @param of The size a percentage is of.
 * @returns The length.
 */
const pixelsOf = (style: Style, property: string, of: number): number =>
  lengthOf(style("root", property), of) ?? 0;

/**
 * Tell whether the root is laid out as if it held nothing: size containment, by `contain` or by
 * `content-visibility: hidden`.
 *
 * @param style The root's and the body's styles.
 * @returns Whether it is.
 */
const sizeContained = (style: Style): boolean =>
  ["size", "strict"].includes(style("root", "contain")) ||
  style("root", "content-visibility") === "hidden";

/**
 * Lay the root out in a horizontal writing mode: its width the viewport's less its margins, its
 * height its content's, or the viewport's where it is positioned with insets 0, or its own
 * `height`, held to its `min-height` and `max-height`, then its bottom padding.
 *
 * @param style The root's and the body's styles.
 * @param content What the document holds.
 * @param viewport The viewport.
 * @returns The box.
 */
const horizontalBox = (style: Style, content: Content, viewport: Viewport): Box => {
  const inline =
    viewport.width - pixelsOf(style, "margin-left", 0) - pixelsOf(style, "margin-right", 0);
  const flow = flowOf(content, inline);
  const margins = pixelsOf(style, "margin-top", 0) + pixelsOf(style, "margin-bottom", 0);
  const auto = sizeContained(style) ? 0 : flow;
  const stated =
    style("root", "position") === "static"
      ? (lengthOf(style("root", "height"), viewport.height) ?? auto)
      : viewport.height - margins;
  const held = Math.min(
    Math.max(stated, pixelsOf(style, "min-height", viewport.height)),
    lengthOf(style("root", "max-height"), viewport.height) ?? Number.POSITIVE_INFINITY,
  );
  const block = held + pixelsOf(style, "padding-bottom", 0);

  return {
    block,
    content: held,
    height: block,
    inline,
    reach: Math.max(block, flow),
    width: inline,
  };
};

/**
 * Lay the root out in a vertical writing mode: its inline size, its physical height, the
 * viewport's height less its margins, or its own `height`; its block size, its physical width, the
 * text's columns at that height.
 *
 * @param style The root's and the body's styles.
 * @param content What the document holds.
 * @param viewport The viewport.
 * @returns The box.
 */
const verticalBox = (style: Style, content: Content, viewport: Viewport): Box => {
  const margins = pixelsOf(style, "margin-top", 0) + pixelsOf(style, "margin-bottom", 0);
  const inline = lengthOf(style("root", "height"), viewport.height) ?? viewport.height - margins;
  const block = sizeContained(style) ? 0 : flowOf(content, inline);

  return { block, content: block, height: inline, inline, reach: inline, width: block };
};

/**
 * Give how far below the root's box its painting reaches under a `transform` of `scale(…)` or
 * `translateY(…)`, the two the cases write.
 *
 * @param value The transform.
 * @param box The box.
 * @returns The depth.
 */
const transformOf = (value: string, box: Box): number => {
  const scale = transforms.scale.exec(value)?.groups.factor;

  return scale === undefined
    ? box.reach + Number(transforms.down.exec(value)?.groups.down ?? "0")
    : (box.reach * (1 + Number(scale))) / 2;
};

/**
 * Give how far below the root's box its painting reaches under one of its transforms, from the
 * top of its border box, in its own pixels, as each transform moves the box: a scale about its
 * centre, a translation down, a quarter turn about its centre, or a motion path from the origin
 * downwards, which centres the box on the path's start and turns it along the path.
 */
const transformed: readonly (readonly [string, (value: string, box: Box) => number])[] = [
  ["transform", (value, box) => transformOf(value, box)],
  ["scale", (value, box) => (box.reach * (1 + Number(value))) / 2],
  ["translate", (value, box) => box.reach + pixelsIn(value.split(" ").at(-1) ?? "0")],
  ["rotate", (_value, box) => (box.reach + box.width) / 2],
  ["offset-path", (_value, box) => box.width / 2],
];

/**
 * Lay the frame's document out at a height of the frame: the root in its used writing mode, the
 * body's, or its own where either has containment (CSS Writing Modes 4, §8); at its zoom; its
 * painting moved by its transforms.
 *
 * @param style The root's and the body's styles.
 * @param content What the document holds.
 * @param height The frame's height.
 * @returns The layout.
 */
const laidOut = (style: Style, content: Content, height: number): Laid => {
  const zoom = Number(style("root", "zoom"));
  const contained = style("root", "contain") !== "none" || style("body", "contain") !== "none";
  const mode = style(contained ? "root" : "body", "writing-mode");
  const viewport = { height: height / zoom, width: iframe.width / zoom };
  const box =
    mode === "horizontal-tb"
      ? horizontalBox(style, content, viewport)
      : verticalBox(style, content, viewport);
  let { reach } = box;

  for (const [property, depth] of transformed) {
    const value = style("root", property);

    if (value !== "none") {
      reach = Math.max(reach, depth(value, box));
    }
  }

  const scale = transforms.scale.exec(style("root", "transform"))?.groups.factor;
  const margins = pixelsOf(style, "margin-top", 0) + pixelsOf(style, "margin-bottom", 0);

  return {
    block: box.block,
    content: box.content,
    inline: box.inline,
    rect: zoom * box.height * Number(scale ?? "1"),
    taken: zoom * (margins + reach),
  };
};

/**
 * Follow the frame's posts as the island does, each written as the frame's height and the
 * document laid out again at it, until a post leaves the frame's height as it was, or the frame
 * has posted twenty.
 *
 * @param booting The frame.
 * @param layout The document's layout.
 * @param height The frame's height now.
 * @returns The layout at the frame's last height.
 */
const followed = (booting: Booted, layout: Layout, height: number): Laid => {
  const laid = layout.layOut(height);
  const heights = heightsOf(booting.island);
  const last = heights.at(-1);

  return last === undefined || last === height || heights.length >= 20
    ? laid
    : followed(booting, layout, last);
};

/**
 * A case of the frame's layout: what a PCI's stylesheet declares on the root and the body, and
 * what the document holds.
 */
interface HeightCase {
  readonly body: string;
  readonly content: Content;
  readonly name: string;
  readonly root: string;
}

/**
 * The text of COLD's vertical cases: 600 glyphs 16 px wide.
 */
const glyphs: Content = { text: 9600 };

/**
 * COLD i2's cases (C2–C15), RED i2's (its root at `height: 100%` with padding, and its margins),
 * and one more for each property the frame page pins that they leave out. Each, without its pin,
 * posts a height the document does not take, or posts without end; C14 and the padding are right
 * either way.
 */
const heightCases: readonly HeightCase[] = [
  {
    body: "",
    content: { block: 200 },
    name: "C2, the root's bottom padding",
    root: "padding-bottom: 40px",
  },
  { body: "", content: { block: 200 }, name: "C3, the root's margins", root: "margin: 10px" },
  {
    body: "",
    content: { block: 1000 },
    name: "C4, the root at the viewport's height",
    root: "height: 100%",
  },
  {
    body: "",
    content: { block: 20 },
    name: "C5, the root at half the viewport's height",
    root: "height: 50%",
  },
  { body: "", content: glyphs, name: "C6, the root vertical", root: "writing-mode: vertical-rl" },
  {
    body: "",
    content: glyphs,
    name: "C7, the root vertical, with margins",
    root: "writing-mode: vertical-rl; margin: 10px",
  },
  {
    body: "writing-mode: vertical-rl",
    content: glyphs,
    name: "C8, the body vertical and the root not",
    root: "",
  },
  { body: "", content: { block: 200 }, name: "C9, the root scaled", root: "transform: scale(2)" },
  { body: "", content: glyphs, name: "C10, the root sideways", root: "writing-mode: sideways-rl" },
  {
    body: "",
    content: glyphs,
    name: "C11, the root in the legacy tb-rl",
    root: "writing-mode: tb-rl",
  },
  { body: "", content: { block: 200 }, name: "C12, the root zoomed", root: "zoom: 2" },
  {
    body: "",
    content: { block: 200 },
    name: "C13, the root translated",
    root: "transform: translateY(100px)",
  },
  {
    body: "writing-mode: horizontal-tb",
    content: glyphs,
    name: "C14, the root vertical and the body not",
    root: "writing-mode: vertical-rl",
  },
  {
    body: "",
    content: { block: 200 },
    name: "C15, a scale, a zoom, margins and half the viewport's height, each !important",
    root: "transform: scale(2) !important; zoom: 2 !important; margin: 10px !important; height: 50% !important",
  },
  {
    body: "",
    content: { block: 200 },
    name: "RED's root at the viewport's height with bottom padding",
    root: "height: 100%; padding-bottom: 10px",
  },
  {
    body: "",
    content: { block: 200 },
    name: "RED's root bottom margin",
    root: "margin-bottom: 30px",
  },
  {
    body: "",
    content: { block: 200 },
    name: "the root at least the viewport's height, with bottom padding",
    root: "min-height: 100%; padding-bottom: 10px",
  },
  {
    body: "",
    content: { block: 200 },
    name: "the root at most half the viewport's height",
    root: "max-height: 50%",
  },
  {
    body: "",
    content: { block: 1000 },
    name: "the root positioned with insets 0",
    root: "position: absolute",
  },
  { body: "", content: { block: 200 }, name: "the root's size contained", root: "contain: size" },
  {
    body: "",
    content: { block: 200 },
    name: "the root's content hidden",
    root: "content-visibility: hidden",
  },
  { body: "", content: { block: 200 }, name: "the root scaled by `scale`", root: "scale: 2" },
  {
    body: "",
    content: { block: 200 },
    name: "the root translated by `translate`",
    root: "translate: 0 100px",
  },
  { body: "", content: { block: 200 }, name: "the root turned a quarter", root: "rotate: 90deg" },
  {
    body: "",
    content: { block: 200 },
    name: "the root on a motion path",
    root: "offset-path: path('M0,0 L0,100')",
  },
  {
    body: "contain: layout",
    content: glyphs,
    name: "the root vertical, and the body contained",
    root: "writing-mode: vertical-rl",
  },
];

describe("the frame's height, followed post by post as the island writes it", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("posts once for each of COLD's and RED's cases and each pin's, the height the document takes", async () => {
    const page = await Effect.runPromise(framePage.pipe(Effect.provide(Digest.layerWebCrypto)));
    const posted = heightCases.map(({ body, content, name, root }) => {
      const style = styleOf(pinnedOf(page.html), {
        body: declarationsOf(body),
        root: declarationsOf(root),
      });
      const layout = observedLayout((height) => laidOut(style, content, height), {});
      const booting = booted(layout.root, layout.observer, (element) => ({
        writingMode: style(element === layout.root ? "root" : "body", "writing-mode"),
      }));
      const laid = followed(booting, layout, iframe.firstHeight);

      return { expected: [Math.ceil(laid.taken)], heights: heightsOf(booting.island), name };
    });

    assert.deepStrictEqual(
      posted.map(({ heights, name }) => `${name}: ${heights.join(", ")}`),
      posted.map(({ expected, name }) => `${name}: ${expected.join(", ")}`),
      "each case posts once, the height the document takes in the frame: that post changes no box the frame observes, so nothing is clipped and no post follows",
    );
  });
});

/**
 * An event the run dispatches, with the members the frame or a planted read takes: a window
 * listener's `currentTarget` and `target`, a message's `data` and `source`, an input event's
 * `view`, an error's `message`, a rejection's `reason`, a `pagehide`'s `persisted`.
 */
interface RunEvent {
  readonly currentTarget?: object;
  readonly data?: object;
  readonly message?: string;
  readonly persisted?: boolean;
  readonly reason?: Error;
  readonly source?: object;
  readonly target?: object;
  readonly view?: object;
}

/**
 * An element of the run's document: the listeners the frame adds to it by type, the members it
 * writes, and its document.
 */
interface RunElement {
  readonly addEventListener: (type: string, listener: (event: RunEvent) => void) => void;
  readonly append: (...children: readonly unknown[]) => void;
  readonly dataset: { pciDom?: string };
  innerHTML: string;
  readonly listeners: Map<string, (event: RunEvent) => void>;
  readonly ownerDocument: object;
  src: string;
}

/**
 * Listeners by event type, each type's in the order they were added.
 */
type Listeners = Map<string, ((event: RunEvent) => void)[]>;

/**
 * A run of the frame page's script in a `node:vm` context of its own: the names read and the
 * moment `define` was installed, in order; the `define` installed; the context's window; the
 * island; the listeners added to the window and to the document; the elements the frame made, in
 * order; the island's posts; the timers the frame set; and its `ResizeObserver` callbacks.
 */
interface Run {
  readonly define: () => FixtureDefine | undefined;
  readonly elements: RunElement[];
  readonly global: object;
  readonly island: object;
  readonly log: string[];
  readonly observers: ((entries: readonly object[]) => void)[];
  readonly on: Listeners;
  readonly onDocument: Listeners;
  readonly posted: FrameToPage[];
  readonly timers: (() => void)[];
}

/**
 * Add a listener to a list of listeners by type.
 *
 * @param listeners The listeners, by type.
 * @param type The type.
 * @param listener The listener.
 */
const listen = (listeners: Listeners, type: string, listener: (event: RunEvent) => void): void => {
  listeners.set(type, [...(listeners.get(type) ?? []), listener]);
};

/**
 * Dispatch an event to the listeners of a type.
 *
 * @param listeners The listeners, by type.
 * @param type The type.
 * @param event The event.
 */
const dispatch = (listeners: Listeners, type: string, event: RunEvent): void => {
  for (const listener of listeners.get(type) ?? []) {
    listener(event);
  }
};

/**
 * Run a script in a `node:vm` context whose global records each read of every name in
 * {@link replaceable}, as the name, and the installing of `define`, as `"define"`. `parent` gives
 * the island, and every other name undefined. `window` is that global, and so are `this` at the
 * script's top, the document's `defaultView` and an element's `ownerDocument.defaultView`, so a
 * read through any of them reaches the same recording global.
 *
 * @param script The script's text.
 * @returns The run, its script evaluated.
 */
const ran = (script: string): Run => {
  const log: string[] = [];
  const posted: FrameToPage[] = [];
  const on: Listeners = new Map();
  const onDocument: Listeners = new Map();
  const elements: RunElement[] = [];
  const timers: (() => void)[] = [];
  const observers: ((entries: readonly object[]) => void)[] = [];
  let installed: FixtureDefine | undefined;
  let bridge: FixtureContext | undefined;
  const island = {
    postMessage: (message: FrameToPage) => {
      posted.push(message);
    },
  };
  const sandbox = {
    CustomEvent: class {
      readonly detail: unknown = undefined;
    },
    ResizeObserver: class {
      readonly observed: Element[] = [];

      constructor(report: (entries: readonly object[]) => void) {
        observers.push(report);
      }

      observe(target: Element): void {
        this.observed.push(target);
      }
    },
    addEventListener: (type: string, listener: (event: RunEvent) => void) => {
      listen(on, type, listener);
    },
    clearTimeout: () => {},
    location: { hash: `#${nonce}` },
    setTimeout: (later: () => void) => {
      timers.push(later);

      return timers.length;
    },
  };
  const documentOf = {
    addEventListener: (type: string, listener: (event: RunEvent) => void) => {
      listen(onDocument, type, listener);
    },
    body: { append: () => {}, ownerDocument: {} },
    createElement: (): RunElement => {
      const listeners = new Map<string, (event: RunEvent) => void>();
      const element: RunElement = {
        addEventListener: (type, listener) => {
          listeners.set(type, listener);
        },
        append: () => {},
        dataset: {},
        innerHTML: "",
        listeners,
        ownerDocument: documentOf,
        src: "",
      };

      elements.push(element);

      return element;
    },
    defaultView: sandbox,
    documentElement: { dataset: {}, dir: "", lang: "" },
    head: { append: () => {} },
    title: "",
  };

  documentOf.body.ownerDocument = documentOf;

  for (const name of replaceable) {
    Object.defineProperty(sandbox, name, {
      configurable: true,
      get: () => {
        log.push(name);

        return name === "parent" ? island : undefined;
      },
    });
  }

  Object.defineProperty(sandbox, "define", {
    configurable: true,
    get: () => installed,
    set: (value: FixtureDefine) => {
      log.push("define");
      installed = value;
    },
  });
  Object.defineProperty(sandbox, "qtiCustomInteractionContext", {
    configurable: true,
    get: () => bridge,
    set: (value: FixtureContext) => {
      bridge = value;
    },
  });
  Object.defineProperty(sandbox, "document", { value: documentOf });
  Object.defineProperty(sandbox, "window", { value: sandbox });
  runInContext(script, createContext(sandbox));

  return {
    define: () => installed,
    elements,
    global: sandbox,
    island,
    log,
    observers,
    on,
    onDocument,
    posted,
    timers,
  };
};

/**
 * Run every timer the frame has set, in order, and those they set.
 *
 * @param run The run.
 */
const ranOut = (run: Run): void => {
  for (const timer of run.timers.splice(0)) {
    timer();
  }
};

/**
 * Drive a run of the frame through every way it is entered: the island's `load`, the route's
 * module defined and its script loaded, the island's `instantiate`, a `ResizeObserver`
 * observation, an input event whose `view` is the frame's window, the PCI's
 * `qti-interaction-changed`, a message the frame posts itself, an uncaught error and an unhandled
 * rejection, the island's `complete`, and the `pagehide` that unloads the document. Each event
 * names the frame's window where a browser's would: a window listener's `currentTarget` and
 * `target`, a self-posted message's `source`, an input event's `view`.
 *
 * @param run The run, its script evaluated.
 * @returns Once the run has been driven.
 */
const driven = async (run: Run): Promise<void> => {
  const typeIdentifier = "urn:qti-pie:test:read";
  const response = { base: { integer: 1 } };
  const fromIsland = (data: PageMessage): RunEvent => ({
    currentTarget: run.global,
    data,
    source: run.island,
    target: run.global,
  });

  dispatch(run.on, "message", fromIsland(loadOfA));
  run.define()?.(["qtiCustomInteractionContext"], (context) => {
    context.register({
      getInstance: (_dom, configuration) => {
        const instance = { getResponse: () => response, getState: () => "" };

        configuration.onready(instance, "");

        return instance;
      },
      typeIdentifier,
    });
  });
  run.elements[1]?.listeners.get("load")?.({});
  await setImmediate();
  dispatch(run.on, "message", fromIsland(instantiateOf(typeIdentifier)));

  for (const observer of run.observers) {
    observer([{ borderBoxSize: [{ blockSize: 216, inlineSize: 600 }] }]);
  }

  dispatch(run.onDocument, "pointerup", { currentTarget: {}, target: {}, view: run.global });
  ranOut(run);
  run.elements[0]?.listeners.get("qti-interaction-changed")?.({});
  dispatch(run.on, "message", {
    currentTarget: run.global,
    data: { kind: "complete", nonce },
    source: run.global,
    target: run.global,
  });
  dispatch(run.on, "error", { currentTarget: run.global, message: "", target: run.global });
  dispatch(run.on, "unhandledrejection", {
    currentTarget: run.global,
    reason: new Error("rejected"),
    target: run.global,
  });
  dispatch(run.on, "message", fromIsland({ kind: "complete", nonce }));
  dispatch(run.on, "pagehide", { currentTarget: run.global, persisted: false, target: run.global });
  await setImmediate();
};

/**
 * The frame page's one script, inline.
 */
const inlineScript = regex("<script>(?<text>[\\s\\S]*)</script>", "u");

/**
 * The frame page's script, as its HTML carries it.
 *
 * @param html The page's HTML.
 * @returns The script's text.
 */
const scriptOf = (html: string): string => inlineScript.exec(html)?.groups.text ?? "";

describe("the frame's boot, run", () => {
  it("reads `parent` once, before it installs `define`, and no other replaceable attribute of its window, on every way the frame is entered", async () => {
    const page = await Effect.runPromise(framePage.pipe(Effect.provide(Digest.layerWebCrypto)));
    const run = ran(scriptOf(page.html));

    await driven(run);

    assert.deepStrictEqual(
      run.posted.map(({ kind }) => kind),
      ["booted", "registered", "ready", "height", "changed", "completed"],
      "the run is the frame's whole life: booted, its PCI registered, ready, sized, its response relayed, and completed",
    );
    assert.deepStrictEqual(
      run.log,
      ["parent", "define"],
      "the boot reads `parent` once, before any PCI's code can run, and reads no other attribute a PCI's script could put its own value in place of",
    );
  });

  it("records a read the syntax scan cannot see: through `this`, a value, an event's window, a computed member", async () => {
    const page = await Effect.runPromise(framePage.pipe(Effect.provide(Digest.layerWebCrypto)));
    const planted = [
      "(() => {",
      "  const own = this; void own.frames;",
      "  void Object.assign(window, {}).opener;",
      '  void document["defaultView"].length;',
      '  void document["default" + "View"].origin;',
      '  void document.body.ownerDocument["defaultView"].status;',
      "  class Late { static { void name; } } void Late;",
      '  addEventListener("message", (event) => { void [event.currentTarget.toolbar, event.target.menubar, event.source.personalbar]; });',
      '  document.addEventListener("pointerup", (event) => { void event.view.scrollbars; }, true);',
      "})();",
    ].join("\n");
    const run = ran(`${scriptOf(page.html)}\n${planted}`);

    await driven(run);

    assert.deepStrictEqual(
      [...new Set(run.log)].toSorted(),
      [
        "define",
        "frames",
        "length",
        "menubar",
        "name",
        "opener",
        "origin",
        "parent",
        "personalbar",
        "scrollbars",
        "status",
        "toolbar",
      ],
      "each planted read is recorded, however it reached the window: COLD's Q1–Q8 and RED's six",
    );
  });
});
