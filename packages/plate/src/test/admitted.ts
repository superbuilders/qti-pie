/**
 * The one way a plate test opens a QTI document: as content the database admitted.
 *
 * The database is the only judge of a document's validity (pantry's laws), and plate judges none.
 * So every document a free suite opens is one the database admitted, which is to say that its
 * SHA-256 is in {@link admittedDocuments}. The admission run (`packages/pantry/scripts/admit.ts`)
 * produces that set once per landing, through the machine's one database lock, from every document
 * the suites open and every QTI document of the trees they and plate's harnesses read whole. A test
 * holds no database of its own.
 *
 * {@link admitted} opens a test's document through `openAdmitted`, the host's own entry;
 * {@link admittedSource} judges a document a test builds as a source tree through `checkAdmitted`,
 * the tree written as crust writes XML, and {@link admittedItem} gives that tree's item model. Each
 * fails its test when the set lacks the document.
 * {@link isAdmitted} tells a sweep or a harness which documents of a tree are members at all: one
 * the database refuses is content plate is never given. With `QTI_PIE_ADMIT_COLLECT` naming a
 * directory, the suites collect instead of judging: each document they open is written there,
 * `<sha256>.xml`, with a line of `opens.jsonl` naming its location and its test. That is the
 * admission run's first step.
 *
 * @module
 */
import { createHash } from "node:crypto";
import { appendFileSync, mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import type { Attribute, AttributeReference, Child, Element } from "@qti-pie/crust/tree.ts";
import { Array as Arr, Config, Data, Effect, Option, pipe } from "effect";
import { expect } from "vitest";
import { xmlNamespace, xmlnsNamespace } from "#plate/document/source.ts";
import type { SourceAttribute, SourceDocument, SourceElement } from "#plate/document/source.ts";
import { writeDocument } from "#plate/document/write.ts";
import { admittedDocuments } from "#plate/test/admitted-digests.ts";
import { openAdmitted } from "#plate/validate/admitted.ts";
import { tables } from "#plate/validate/tables.ts";
import { acceptedItem, checkAdmitted } from "#plate/validate/verdict.ts";
import type { Item } from "#plate/model/item.ts";
import type { Verdict } from "#plate/validate/verdict.ts";

/**
 * The SHA-256 of a document's bytes, in lowercase hex: the key the admitted set holds it by.
 *
 * @param bytes The document's bytes.
 * @returns The digest.
 */
const digestOf = (bytes: Uint8Array): string => createHash("sha256").update(bytes).digest("hex");

/**
 * A test opened a document the database has not admitted: the admission run has not judged it, or
 * the database refused it.
 */
class NotAdmitted extends Data.TaggedError("NotAdmitted")<{
  readonly digest: string;
  readonly location: string;
}> {
  /**
   * What the test author does about it.
   */
  override get message(): string {
    return `The database has not admitted ${this.location} (sha256 ${this.digest}). A free suite opens only documents the admission run admitted: run it (packages/qti-pie/packages/pantry/scripts/admit.ts, as its header says), and where the database refuses the document, make it valid QTI 3.0.1 or delete the case.`;
  }
}

/**
 * Report whether the database admitted a document.
 *
 * @param bytes The document's bytes.
 * @returns Whether its digest is in {@link admittedDocuments}.
 */
export const isAdmitted = (bytes: Uint8Array): boolean => admittedDocuments.has(digestOf(bytes));

/**
 * Hold a document a test opens to the admitted set: under `QTI_PIE_ADMIT_COLLECT`, write it into
 * the collection, its bytes by digest and the line that names where and in which test it was
 * opened; otherwise die with {@link NotAdmitted} where the set lacks it.
 *
 * @param location The document's location.
 * @param bytes The document's bytes.
 * @returns Nothing, once the document is held.
 */
const held = Effect.fnUntraced(function* held(location: string, bytes: Uint8Array) {
  const digest = digestOf(bytes);
  const collecting = yield* Effect.orDie(
    Config.option(Config.NonEmptyString("QTI_PIE_ADMIT_COLLECT")),
  );

  if (Option.isSome(collecting)) {
    const { currentTestName, testPath } = expect.getState();
    const directory = collecting.value;

    mkdirSync(directory, { recursive: true });
    writeFileSync(path.join(directory, `${digest}.xml`), bytes);
    appendFileSync(
      path.join(directory, "opens.jsonl"),
      `${JSON.stringify({ digest, location, test: `${testPath ?? ""} > ${currentTestName ?? ""}` })}\n`,
    );
  } else if (!admittedDocuments.has(digest)) {
    yield* Effect.die(new NotAdmitted({ digest, location }));
  }
});

/**
 * Open a document a test holds, as plate opens content the database admitted: through
 * `openAdmitted`, once its digest is in {@link admittedDocuments}. A document the set lacks fails
 * the test, {@link NotAdmitted}; under `QTI_PIE_ADMIT_COLLECT` the document is collected and
 * opened.
 *
 * @param location The document's location, which the verdict carries.
 * @param bytes The document's bytes.
 * @returns The verdict `openAdmitted` gives.
 */
export const admitted = Effect.fnUntraced(function* admitted(
  location: string,
  bytes: Uint8Array,
): Effect.fn.Return<Verdict> {
  yield* held(location, bytes);

  return yield* openAdmitted(location, bytes);
});

/**
 * The prefixes a namespace is written under where no declaration of the tree names it.
 */
const knownPrefixes: ReadonlyMap<string, string> = new Map([
  ["http://www.w3.org/1999/xlink", "xlink"],
  ["http://www.w3.org/2001/XInclude", "xi"],
  ["http://www.w3.org/2001/XMLSchema-instance", "xsi"],
]);

/**
 * The namespaces in scope while a source tree is written: the default, and each prefix's.
 */
interface Scope {
  readonly fallback: string;
  readonly prefixes: ReadonlyMap<string, string>;
}

/**
 * A namespace declaration as crust's tree holds one.
 *
 * @param prefix The prefix it binds, `""` for the default namespace.
 * @param value The namespace it binds it to.
 * @returns The declaration.
 */
const declaration = (prefix: string, value: string): Attribute =>
  prefix === ""
    ? {
        local: "xmlns",
        namespace: xmlnsNamespace,
        prefix: "",
        qname: "xmlns",
        references: [],
        value,
      }
    : {
        local: prefix,
        namespace: xmlnsNamespace,
        prefix: "xmlns",
        qname: `xmlns:${prefix}`,
        references: [],
        value,
      };

/**
 * The offset of each unexpanded entity reference an attribute's value holds, in order.
 *
 * @param attribute The source attribute.
 * @returns The references.
 */
const referencesOf = (attribute: SourceAttribute): readonly AttributeReference[] => {
  const found: AttributeReference[] = [];
  let from = 0;
  for (const name of attribute.references) {
    const offset = attribute.value.indexOf(`&${name};`, from);

    found.push({ name, offset });
    from = offset + name.length + 2;
  }

  return found;
};

/**
 * The prefix an attribute of a namespace is written under: none in no namespace, `xml` in XML's,
 * and otherwise the one in scope, or one declared for it.
 *
 * @param namespace The attribute's namespace.
 * @param prefixFor The prefix in scope for a namespace, declaring one where none is.
 * @returns The prefix.
 */
const attributePrefixOf = (namespace: string, prefixFor: (namespace: string) => string): string => {
  if (namespace === "") {
    return "";
  }

  return namespace === xmlNamespace ? "xml" : prefixFor(namespace);
};

/**
 * Write a source element as crust's tree holds it, each name with the prefix its namespace is in
 * scope under, and a declaration where none is: the element's own namespace as the default, an
 * attribute's under its known prefix or one of its own.
 *
 * @param element The source element.
 * @param scope The namespaces in scope.
 * @returns The element.
 */
const crustElementOf = (element: SourceElement, scope: Scope): Element => {
  const own = element.attributes.filter((attribute) => attribute.namespace === xmlnsNamespace);
  const prefixes = new Map(scope.prefixes);
  for (const { local, value } of own) {
    if (local !== "xmlns") {
      prefixes.set(local, value);
    }
  }

  const declared = Option.fromUndefinedOr(own.find(({ local }) => local === "xmlns"));
  const inScope = pipe(
    declared,
    Option.map(({ value }) => value),
    Option.getOrElse(() => scope.fallback),
  );
  const added: Attribute[] = [];
  const elementPrefix = pipe(
    [...prefixes],
    Arr.findFirst(
      ([, uri]) => uri === element.namespace && element.namespace !== inScope && uri !== "",
    ),
  );
  const fallback =
    element.namespace === inScope || Option.isSome(elementPrefix) ? inScope : element.namespace;
  if (fallback !== inScope) {
    added.push(declaration("", fallback));
  }

  const prefixFor = (namespace: string): string => {
    const bound = [...prefixes].find(([prefix, uri]) => uri === namespace && prefix !== "");
    if (bound !== undefined) {
      return bound[0];
    }

    const fresh = knownPrefixes.get(namespace) ?? `ns${String(prefixes.size)}`;
    prefixes.set(fresh, namespace);
    added.push(declaration(fresh, namespace));

    return fresh;
  };
  const attributes = element.attributes.map((attribute): Attribute => {
    if (attribute.namespace === xmlnsNamespace) {
      return attribute.local === "xmlns"
        ? declaration("", attribute.value)
        : declaration(attribute.local, attribute.value);
    }

    const prefix = attributePrefixOf(attribute.namespace, prefixFor);

    return {
      local: attribute.local,
      namespace: attribute.namespace,
      prefix,
      qname: prefix === "" ? attribute.local : `${prefix}:${attribute.local}`,
      references: referencesOf(attribute),
      value: attribute.value,
    };
  });
  const prefix = Option.match(elementPrefix, { onNone: () => "", onSome: ([bound]) => bound });
  const inner: Scope = { fallback, prefixes };

  return {
    attributes: [...added, ...attributes],
    children: element.children.map((child): Child => {
      switch (child.kind) {
        case "element": {
          return crustElementOf(child, inner);
        }
        case "text": {
          return { cdata: false, kind: "text", value: child.text };
        }
        case "entity": {
          return { kind: "entityRef", name: child.name };
        }
        default: {
          return child satisfies never;
        }
      }
    }),
    kind: "element",
    local: element.local,
    namespace: element.namespace,
    prefix,
    qname: prefix === "" ? element.local : `${prefix}:${element.local}`,
  };
};

/**
 * Judge a document a test builds as a source tree, as plate judges content the database admitted:
 * through `checkAdmitted`, once the digest of the tree written as crust writes XML is in
 * {@link admittedDocuments}. A tree the set lacks fails the test, {@link NotAdmitted}; under
 * `QTI_PIE_ADMIT_COLLECT` the written tree is collected and judged.
 *
 * @param source The document.
 * @returns The verdict `checkAdmitted` gives.
 */
export const admittedSource = (source: SourceDocument): Verdict =>
  Effect.runSync(
    Effect.gen(function* judged() {
      const text = yield* Effect.orDie(
        Effect.fromResult(
          writeDocument(crustElementOf(source.root, { fallback: "", prefixes: new Map() })),
        ),
      );

      yield* held(source.location, new TextEncoder().encode(text));

      return checkAdmitted(source, tables);
    }),
  );

/**
 * A test handed {@link admittedItem} a document that is no item, or one plate leaves unchecked: a
 * defect of the test, never a verdict it asserts.
 */
class NotAnItem extends Data.TaggedError("NotAnItem")<{ readonly document: string }> {
  /**
   * What the test did wrong.
   */
  override get message(): string {
    return `admittedItem was handed ${this.document}, which checkAdmitted does not judge as an item; build the item a test reads with a qti-assessment-item root plate judges.`;
  }
}

/**
 * Give the item model of a document a test builds as a source view, as `checkAdmitted` builds an
 * admitted item, once the database admitted it ({@link admittedSource}).
 *
 * @param source The document.
 * @returns The accepted item's model.
 * @throws {NotAnItem} When the verdict is `unchecked` or accepts no item.
 */
export const admittedItem = (source: SourceDocument): Item =>
  Option.getOrThrowWith(
    acceptedItem(admittedSource(source)),
    () => new NotAnItem({ document: source.location }),
  ).item;
