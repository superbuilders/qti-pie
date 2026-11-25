/**
 * A page's element tree as a host ships it to the browser to hydrate, in the stand-in for React
 * Server Components' wire that plate's UI suite hydrates pages with (`#specimen/ui/hydrated.ts`):
 * enough for plate's item pages, whose server components are functions of their props, expanded as
 * an RSC renderer calls them, and whose client components, the islands, take props that are data
 * alone, as plate's types hold them to. So the wire holds host elements, fragments, Suspense
 * boundaries and islands by the name their module and export give them (`#specimen/ui/clients.ts`),
 * and JSON's values with `undefined`, big integers, maps, sets and plain objects beside them, each
 * tagged by its `kind`.
 *
 * Test support for plate's UI suite under `src/ui/`. It loads in Node and in the browser alike: it
 * imports only React's element API and `effect`.
 *
 * @module
 * @see https://react.dev/reference/rsc/use-client#serializable-types
 */
import { Data, Predicate, Schema } from "effect";
import { Component, Fragment, Suspense, createElement, isValidElement } from "react";
import type { ElementType, JSXElementConstructor, Key, ReactElement, ReactNode } from "react";

/**
 * A plain object as the wire holds it: each field's value, wired, by its name.
 */
interface WiredObject {
  readonly fields: Readonly<Record<string, Wire>>;
  readonly kind: "object";
}

/**
 * An element of the tree as the wire holds it: its type, by a tag name, by its island's name, or as
 * a fragment or Suspense boundary; its key, none for an element given none; and its props.
 */
type WiredElement =
  | {
      readonly key: string | null;
      readonly kind: "client";
      readonly name: string;
      readonly props: WiredObject;
    }
  | {
      readonly key: string | null;
      readonly kind: "fragment" | "suspense";
      readonly props: WiredObject;
    }
  | {
      readonly key: string | null;
      readonly kind: "host";
      readonly props: WiredObject;
      readonly tag: string;
    };

/**
 * A value as the wire holds it: JSON's own values, and the rest tagged by `kind`.
 */
export type Wire =
  | WiredElement
  | WiredObject
  | boolean
  | number
  | string
  | null
  | readonly Wire[]
  | { readonly digits: string; readonly kind: "bigint" }
  | { readonly entries: readonly (readonly [Wire, Wire])[]; readonly kind: "map" }
  | { readonly kind: "set"; readonly values: readonly Wire[] }
  | { readonly kind: "undefined" };

/**
 * A wired plain object's schema, its fields' values each read by `wire`.
 *
 * @param wire The schema of a wired value.
 * @returns The object's schema.
 */
const wiredObjectOf = (wire: Schema.Codec<Wire>) =>
  Schema.Struct({ fields: Schema.Record(Schema.String, wire), kind: Schema.Literal("object") });

/**
 * The schema of a value on the wire, which the page reads its data with: what `toWire` writes, as
 * JSON keeps it.
 */
export const WireSchema: Schema.Codec<Wire> = Schema.Union([
  Schema.Null,
  Schema.Boolean,
  Schema.Number,
  Schema.String,
  Schema.Array(Schema.suspend((): Schema.Codec<Wire> => WireSchema)),
  wiredObjectOf(Schema.suspend((): Schema.Codec<Wire> => WireSchema)),
  Schema.Struct({ digits: Schema.String, kind: Schema.Literal("bigint") }),
  Schema.Struct({
    entries: Schema.Array(
      Schema.Tuple([
        Schema.suspend((): Schema.Codec<Wire> => WireSchema),
        Schema.suspend((): Schema.Codec<Wire> => WireSchema),
      ]),
    ),
    kind: Schema.Literal("map"),
  }),
  Schema.Struct({
    kind: Schema.Literal("set"),
    values: Schema.Array(Schema.suspend((): Schema.Codec<Wire> => WireSchema)),
  }),
  Schema.Struct({ kind: Schema.Literal("undefined") }),
  Schema.Struct({
    key: Schema.NullOr(Schema.String),
    kind: Schema.Literal("client"),
    name: Schema.String,
    props: wiredObjectOf(Schema.suspend((): Schema.Codec<Wire> => WireSchema)),
  }),
  Schema.Struct({
    key: Schema.NullOr(Schema.String),
    kind: Schema.Literals(["fragment", "suspense"]),
    props: wiredObjectOf(Schema.suspend((): Schema.Codec<Wire> => WireSchema)),
  }),
  Schema.Struct({
    key: Schema.NullOr(Schema.String),
    kind: Schema.Literal("host"),
    props: wiredObjectOf(Schema.suspend((): Schema.Codec<Wire> => WireSchema)),
    tag: Schema.String,
  }),
]);

/**
 * A value the wire cannot hold, met where `toWire` names it: a function, a class instance, a
 * symbol, an async or class component, or an element of a type it cannot expand, none of which
 * plate's server shell hands an island; or an island no module the page loaded exports. A defect of
 * the page or of the wire, thrown, so a shell that starts handing one is seen at once rather than
 * shipped wrong.
 */
export class Unwired extends Data.TaggedError("Unwired")<{
  /**
   * What the value is.
   */
  readonly what: string;
  /**
   * Where in the tree it stands, from the root, as `toWire` walked it.
   */
  readonly where: string;
}> {
  /**
   * What the wire met, and where.
   */
  override get message(): string {
    return `The wire cannot hold ${this.what} at ${this.where}; teach it this value or keep it off the page.`;
  }
}

/**
 * An element's key, as the wire holds it: its text, none for an element given none.
 *
 * @param key The element's key.
 * @returns The key's text, or none.
 */
const keyText = (key: Key | null): string | null => (key === null ? null : String(key));

/**
 * Report whether a value is an object whose prototype is `Object`'s, or none: one whose fields are
 * all it holds.
 *
 * @param value The value.
 * @returns Whether it is a plain object.
 */
const isPlain = (value: unknown): value is Readonly<Record<string, unknown>> => {
  if (!Predicate.isObject(value) || Predicate.isFunction(value)) {
    return false;
  }

  const prototype: unknown = Object.getPrototypeOf(value);

  return prototype === Object.prototype || prototype === null;
};

/**
 * Tell whether an element type is a function component, which React renders by calling it with
 * its props: a function that is no class component, which React tells by the
 * `prototype.isReactComponent` that `Component` sets, as the island walk tells it
 * (`islandsIn` in `#specimen/ui/rendered.ts`, which loads the server shell, so not here).
 *
 * @param type The element's type.
 * @returns Whether it is a function component.
 * @see https://react.dev/reference/react/Component
 */
const isFunctionComponent = <P>(
  type: string | JSXElementConstructor<P>,
): type is (props: P) => ReactNode | Promise<ReactNode> =>
  Predicate.isFunction(type) && !(type.prototype instanceof Component);

/**
 * How {@link toWire} writes a value within the one it is writing, where it stands.
 */
type Wiring = (value: unknown, where: string) => Wire;

/**
 * Write a plain object's fields, each wired.
 *
 * @param fields The fields.
 * @param wiring How each field's value is written.
 * @param where Where the object stands.
 * @returns The object, wired.
 */
const objectWire = (
  fields: Readonly<Record<string, unknown>>,
  wiring: Wiring,
  where: string,
): WiredObject => ({
  fields: Object.fromEntries(
    Object.entries(fields).map(([name, each]) => [name, wiring(each, `${where}.${name}`)]),
  ),
  kind: "object",
});

/**
 * Write a collection, an array, a map or a set, each member wired; none for another value.
 *
 * @param value The value.
 * @param wiring How each member is written.
 * @param where Where the collection stands.
 * @returns It, wired, or none.
 */
const collectionWire = (value: unknown, wiring: Wiring, where: string): Wire | undefined => {
  if (Array.isArray(value)) {
    return value.map((each: unknown, index) => wiring(each, `${where}[${String(index)}]`));
  }

  if (value instanceof Map) {
    return {
      entries: Array.from(value, ([key, each]: readonly [unknown, unknown], index) => [
        wiring(key, `${where} key ${String(index)}`),
        wiring(each, `${where} value ${String(index)}`),
      ]),
      kind: "map",
    };
  }

  if (value instanceof Set) {
    return {
      kind: "set",
      values: Array.from(value, (each: unknown, index) =>
        wiring(each, `${where} member ${String(index)}`),
      ),
    };
  }

  return undefined;
};

/**
 * Write an element: an island by its name, a host element, a fragment or a Suspense boundary with
 * its props wired, and a server component expanded where it stands, by calling it with its props,
 * as an RSC renderer does.
 *
 * @param element The element.
 * @param clients Every export of plate's `"use client"` modules, by value, with its name.
 * @param wiring How its props, and what a server component renders, are written.
 * @param where Where it stands.
 * @returns It, wired.
 * @throws {Unwired} At an element of a type the wire cannot expand.
 */
const elementWire = (
  element: ReactElement<Readonly<Record<string, unknown>>>,
  clients: ReadonlyMap<unknown, string>,
  wiring: Wiring,
  where: string,
): Wire => {
  const { props, type } = element;
  const key = keyText(element.key);
  const name = clients.get(type);

  if (name !== undefined) {
    return { key, kind: "client", name, props: objectWire(props, wiring, `${where}<${name}>`) };
  }

  if (Predicate.isString(type)) {
    return { key, kind: "host", props: objectWire(props, wiring, `${where}<${type}>`), tag: type };
  }

  if (type === Fragment || type === Suspense) {
    return {
      key,
      kind: type === Fragment ? "fragment" : "suspense",
      props: objectWire(props, wiring, `${where}<>`),
    };
  }

  if (!isFunctionComponent(type)) {
    throw new Unwired({ what: "an element of a type that is no function component", where });
  }

  const rendered = type(props);

  if (rendered instanceof Promise) {
    throw new Unwired({ what: `the async component ${type.name}`, where });
  }

  const inner = wiring(rendered, `${where}<${type.name}>`);

  return key === null
    ? inner
    : { key, kind: "fragment", props: { fields: { children: inner }, kind: "object" } };
};

/**
 * Write a value as the wire holds it, expanding every server component in it.
 *
 * @param value The value: a page's element tree, or the responses it starts from.
 * @param clients Every export of plate's `"use client"` modules, by value, with its name, the
 *   islands the expansion stops at.
 * @param where Where the value stands, as a failure names it.
 * @returns The value, wired.
 * @throws {Unwired} At a value the wire cannot hold.
 */
export const toWire = (
  value: unknown,
  clients: ReadonlyMap<unknown, string>,
  where = "the root",
): Wire => {
  const wiring: Wiring = (each, at) => toWire(each, clients, at);

  if (value === undefined) {
    return { kind: "undefined" };
  }

  if (
    value === null ||
    Predicate.isString(value) ||
    Predicate.isBoolean(value) ||
    Predicate.isNumber(value)
  ) {
    return value;
  }

  if (Predicate.isBigInt(value)) {
    return { digits: String(value), kind: "bigint" };
  }

  const collection = collectionWire(value, wiring, where);

  if (collection !== undefined) {
    return collection;
  }

  if (isValidElement<Readonly<Record<string, unknown>>>(value)) {
    return elementWire(value, clients, wiring, where);
  }

  if (isPlain(value)) {
    return objectWire(value, wiring, where);
  }

  throw new Unwired({
    what: Predicate.isFunction(value) ? "a function" : "a class instance or symbol",
    where,
  });
};

/**
 * Tell whether a module's export may stand as an element's type: a function, or one of React's
 * exotic components (a memo, a forward ref, a lazy), an object React marks with `$$typeof`.
 *
 * @param value The export.
 * @returns Whether it may.
 */
const isComponent = (value: unknown): value is ElementType =>
  Predicate.isFunction(value) || Predicate.hasProperty(value, "$$typeof");

/**
 * Report whether a wired value is an array.
 *
 * @param wire The wired value.
 * @returns Whether it is one.
 */
export const isWireArray = (wire: Wire): wire is readonly Wire[] => Array.isArray(wire);

/**
 * Read a value back from the wire, each island by its name, as React elements for a page and as
 * data for responses.
 *
 * @param wire The wired value.
 * @param clients Every island by its name, as `toWire` named it.
 * @returns The value.
 * @throws {Unwired} For an island no module of `clients` exports.
 */
const fromWire = (wire: Wire, clients: ReadonlyMap<string, unknown>): unknown => {
  const propsOf = (props: WiredObject, key: string | null) => {
    const read = Object.fromEntries(
      Object.entries(props.fields).map(([name, each]) => [name, fromWire(each, clients)]),
    );

    return key === null ? read : { ...read, key };
  };

  if (
    wire === null ||
    Predicate.isString(wire) ||
    Predicate.isNumber(wire) ||
    Predicate.isBoolean(wire)
  ) {
    return wire;
  }

  if (isWireArray(wire)) {
    return wire.map((each) => fromWire(each, clients));
  }

  switch (wire.kind) {
    case "undefined": {
      return undefined;
    }
    case "bigint": {
      return BigInt(wire.digits);
    }
    case "map": {
      return new Map(
        wire.entries.map(([key, each]) => [fromWire(key, clients), fromWire(each, clients)]),
      );
    }
    case "set": {
      return new Set(wire.values.map((each) => fromWire(each, clients)));
    }
    case "object": {
      return propsOf(wire, null);
    }
    case "client": {
      const type = clients.get(wire.name);

      if (!isComponent(type)) {
        throw new Unwired({
          what: `the island ${wire.name}, which no module the page loaded exports`,
          where: "the page",
        });
      }

      return createElement(type, propsOf(wire.props, wire.key));
    }
    case "fragment": {
      return createElement(Fragment, propsOf(wire.props, wire.key));
    }
    case "suspense": {
      return createElement(Suspense, propsOf(wire.props, wire.key));
    }
    case "host": {
      return createElement(wire.tag, propsOf(wire.props, wire.key));
    }
    default: {
      return wire satisfies never;
    }
  }
};

/**
 * Read a page's tree back from the wire: the element `toWire` wrote of `<Item>`.
 *
 * @param wire The wired tree.
 * @param clients Every island by its name.
 * @returns The tree.
 * @throws {Unwired} For a wire that holds no element at its root, or an island no module of
 *   `clients` exports.
 */
export const treeFromWire = (wire: Wire, clients: ReadonlyMap<string, unknown>): ReactElement => {
  const tree = fromWire(wire, clients);

  if (!isValidElement(tree)) {
    throw new Unwired({ what: "a tree whose root is no element", where: "the root" });
  }

  return tree;
};
