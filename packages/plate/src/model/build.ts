/**
 * The state of one item model build and the marks it records: what {@link Build} holds as the walk
 * reads a document, the vocabulary's `modelled` rules the walk records marks and notices by, and
 * the indexes a fresh build starts from. The declaration readers (`#plate/model/declarations.ts`),
 * the body walk (`#plate/model/body.ts`) and the processing readers (`#plate/model/processing.ts`)
 * all read and record through it; `buildItem` (`#plate/model/item.ts`) starts it.
 *
 * @module
 */
import { Option, Result } from "effect";
import type { CatalogReference } from "#plate/content/contract.ts";
import { walk } from "#plate/document/source.ts";
import type { SourceDocument, SourceElement } from "#plate/document/source.ts";
import {
  attributeOf,
  childrenNamed,
  elementsOf,
  identifierOf,
  integerOf,
  isQti,
  pathOf,
  valueOf,
  xsBooleanOf,
} from "#plate/model/attributes.ts";
import type { ModelWalk } from "#plate/model/attributes.ts";
import { expressionKinds } from "#plate/model/expression.ts";
import type { RecordDeclaration, UnsupportedFeature } from "#plate/model/item.ts";
import { compile } from "#plate/model/regex.ts";
import { parseLexical, trimXmlSpace } from "#plate/model/values.ts";
import { modelled, templateName } from "#plate/vocabulary.ts";
import type { Condition, FeatureRule } from "#plate/vocabulary.ts";

/**
 * What one item build reads and collects: the walk, the response declarations, the names of the
 * variables the item holds, and the unsupported features found so far, in document order.
 */
export interface Build extends ModelWalk {
  /**
   * The root's response declarations, keyed by their identifier as `identifierOf` reads it; the
   * last one when two share an identifier. Built once, so binding an interaction does not rescan
   * the root.
   */
  readonly declarations: ReadonlyMap<string, SourceElement>;
  /**
   * The names of the variables the item holds: every declaration's identifier and the built-in
   * variables ({@link declaredNames}). A reader splits a string attribute's literal from a
   * reference against them, and the walks judge an unchecked reference by them.
   */
  readonly names: ReadonlySet<string>;
  /**
   * The paths each feature in `unsupported` was recorded at, keyed by the feature, so
   * {@link record} finds a repeat without scanning the features recorded so far.
   */
  readonly recorded: Map<string, Set<string>>;
  /**
   * Every `data-catalog-idref` an element of the item body carries, in document order, which the
   * item root's walk hands the catalog module (`ItemParseContext.catalogReferences`).
   */
  readonly references: CatalogReference[];
  /**
   * The record responses the model holds, keyed by identifier, filled as their declarations are
   * read. The declarations precede the item body, so a text interaction bound to one finds it here.
   */
  readonly records: Map<string, RecordDeclaration>;
  /**
   * Whether the walk reads a stimulus document's body ({@link stimulusBody}), where an interaction
   * is the notice keyed by its element rather than a binding: a stimulus declares no response, so
   * there is nothing to bind it to.
   */
  readonly stimulus: boolean;
  readonly unsupported: UnsupportedFeature[];
}

/**
 * The `qti-*` elements the model reads or renders: those `modelled` lists, the engine's response
 * rules and the template rules among them, and the element of each of the 64 expression kinds,
 * every one of which the registry reads.
 */
export const readElements: ReadonlySet<string> = new Set([
  ...modelled.elements,
  ...expressionKinds.map((kind) => `qti-${kind}`),
]);

/**
 * The features marked on the verdict.
 */
const marks: readonly FeatureRule[] = modelled.marks;

/**
 * Read whether an item's root carries `adaptive` true, as XSD reads an `xs:boolean`: `true` or
 * `1` after XSD whitespace handling, and false when the attribute is absent, the XSD
 * default, or outside `xs:boolean`'s lexical space, which the database refuses before the model
 * reads the document.
 *
 * @param root The `qti-assessment-item` element.
 * @returns Whether the item is adaptive.
 */
export const adaptiveOf = (root: SourceElement): boolean =>
  Option.getOrElse(Option.flatMap(valueOf(root, "adaptive"), xsBooleanOf), () => false);

/**
 * The features shown as a notice in place of their interaction.
 */
export const notices: readonly FeatureRule[] = modelled.notices;

/**
 * The features shown as a notice in place of an interaction's Controls, the interaction still
 * built.
 */
export const controlNotices: readonly FeatureRule[] = modelled.controlNotices;

/**
 * The attributes a body element loses because a mark names them, such as `xml:base`.
 */
export const markedAttributes: ReadonlySet<string> = new Set(
  marks.flatMap((mark) =>
    mark.on === "body" && mark.when.kind === "attribute" ? [mark.when.name] : [],
  ),
);

/**
 * Record an unsupported feature, once per feature and path, in constant time.
 *
 * @param build The build that collects it.
 * @param entry The feature, its path and how it is shown.
 */
export const record = (build: Build, entry: UnsupportedFeature): void => {
  const paths = build.recorded.get(entry.feature) ?? new Set<string>();
  if (!paths.has(entry.path)) {
    paths.add(entry.path);
    build.recorded.set(entry.feature, paths);
    build.unsupported.push(entry);
  }
};

/**
 * Report whether a `modelled` condition holds on an element.
 *
 * @param condition The condition.
 * @param element The element.
 * @returns Whether the element carries the feature.
 */
export const holds = (condition: Condition, element: SourceElement): boolean => {
  if (condition.kind === "element") {
    return true;
  }

  if (condition.kind === "attribute") {
    return Option.isSome(attributeOf(element, condition.name));
  }

  if (condition.kind === "attribute-value") {
    return Option.getOrUndefined(valueOf(element, condition.name)) === condition.value;
  }

  if (condition.kind === "untyped") {
    return (
      Option.isNone(attributeOf(element, "base-type")) &&
      Option.getOrUndefined(valueOf(element, "cardinality")) !== "record"
    );
  }

  if (condition.kind === "refused-pattern") {
    return Option.exists(valueOf(element, condition.name), (pattern) =>
      Result.isFailure(compile(pattern)),
    );
  }

  if (condition.kind === "integer-above") {
    return Option.exists(valueOf(element, condition.name), (written) =>
      Option.exists(
        Result.getSuccess(parseLexical("integer", trimXmlSpace(written))),
        (single) => integerOf(single) > condition.limit,
      ),
    );
  }

  return (
    Option.getOrUndefined(Option.flatMap(valueOf(element, "template"), templateName)) ===
    condition.name
  );
};

/**
 * Report whether a feature can sit on an element.
 *
 * @param feature The feature.
 * @param element A QTI-namespace element.
 * @param inBody Whether the element is rendered in the item body.
 * @returns Whether the feature's `on` names the element.
 */
export const sitsOn = (feature: FeatureRule, element: SourceElement, inBody: boolean): boolean =>
  feature.on === "body" ? inBody : feature.on.includes(element.local);

/**
 * Record the marks an element carries.
 *
 * @param build The build.
 * @param element A QTI-namespace element the model reads.
 * @param inBody Whether the element is rendered in the item body.
 */
export const markElement = (build: Build, element: SourceElement, inBody: boolean): void => {
  for (const mark of marks) {
    if (sitsOn(mark, element, inBody) && holds(mark.when, element)) {
      record(build, { feature: mark.feature, path: pathOf(build, element), shown: "mark" });
    }
  }
};

/**
 * Record each `qti-*` element below an element that the model does not read, as a mark keyed by
 * its name. A marked element's own subtree is not searched.
 *
 * @param build The build.
 * @param element An element outside the body that the model reads, such as a declaration.
 */
export const markUnreadWithin = (build: Build, element: SourceElement): void => {
  for (const child of elementsOf(element)) {
    if (isQti(child) && child.local.startsWith("qti-") && !readElements.has(child.local)) {
      record(build, { feature: child.local, path: pathOf(build, child), shown: "mark" });
    } else {
      markUnreadWithin(build, child);
    }
  }
};

/**
 * Record marks at a processing element's path, placed among the marks already recorded in document
 * order: after the first `at`, which precede the element, and before the rest.
 *
 * @param build The build.
 * @param at The number of marks recorded when the element was read.
 * @param path The element's path.
 * @param features The features to mark.
 */
export const markAt = (
  build: Build,
  at: number,
  path: string,
  features: readonly string[],
): void => {
  const after = build.unsupported.splice(at);
  for (const feature of features) {
    build.unsupported.push({ feature, path, shown: "mark" });
  }
  for (const entry of after) {
    build.unsupported.push(entry);
  }
};

/**
 * Index every element of a document by its path.
 *
 * @param document The document.
 * @returns Each element's path, keyed by the element.
 */
export const pathsOf = (document: SourceDocument): ReadonlyMap<SourceElement, string> =>
  new Map(Array.from(walk(document), (visit) => [visit.element, visit.path]));

/**
 * Key a document's response declarations by their identifier, as {@link Build}'s `declarations`
 * holds them: a later declaration replaces an earlier one with the same identifier, and one without
 * an identifier binds nothing.
 *
 * @param document The document.
 * @returns Each response declaration, keyed by its identifier as `identifierOf` reads it.
 */
export const declarationsOf = (document: SourceDocument): ReadonlyMap<string, SourceElement> =>
  new Map(
    childrenNamed(document.root, "qti-response-declaration").flatMap((declaration) =>
      Option.match(valueOf(declaration, "identifier"), {
        onNone: () => [],
        onSome: (identifier) => [[identifierOf(identifier), declaration] as const],
      }),
    ),
  );
