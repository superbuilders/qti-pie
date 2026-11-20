/**
 * The item model's body walk: an item body, a stimulus body, a Prompt or a feedback's content read
 * into body nodes. Text and HTML elements are kept as written; each interaction is read through
 * its module (the table of modules in `#plate/model/interactions.ts`), after the walk judges its
 * binding; printed variables, template and feedback blocks and inlines become their nodes; a
 * content module's element its module's node; and any other `qti-*` element a notice.
 *
 * @module
 */
import { Array as Arr, Option, pipe } from "effect";
import type { ItemNodeOf, ItemParseContext } from "#plate/content/contract.ts";
import { bodyModuleFor, itemModuleFor, parseBodyContent } from "#plate/content/modules.ts";
import type { ItemContentElement, ItemModules } from "#plate/content/modules.ts";
import { attributePath } from "#plate/document/source.ts";
import type { SourceChild, SourceElement } from "#plate/document/source.ts";
import { misfitOf } from "#plate/interactions/contract.ts";
import type {
  BoundDeclaration,
  ParseContext,
  Parsed,
  ReaderKit,
} from "#plate/interactions/contract.ts";
import {
  attributeName,
  childrenNamed,
  elementsOf,
  enumerated,
  identifierAttribute,
  identifierOf,
  isQti,
  nameOf,
  pathOf,
  inadmissible,
  replaceXmlSpace,
  requiredAttribute,
  valueOf,
  xsBoolean,
} from "#plate/model/attributes.ts";
import {
  controlNotices,
  holds,
  markedAttributes,
  markElement,
  notices,
  readElements,
  record,
  sitsOn,
} from "#plate/model/build.ts";
import type { Build } from "#plate/model/build.ts";
import { integerOrRefOf } from "#plate/model/expression.ts";
import type { IntegerOrRef } from "#plate/model/expression.ts";
import { containerFor, modules, readerFor } from "#plate/model/interactions.ts";
import type { ModuleReader } from "#plate/model/interactions.ts";
import type {
  BodyAttribute,
  BodyElement,
  BodyNode,
  FeedbackContent,
  FeedbackVisibility,
  Interaction,
  ModalFeedback,
  PrintedVariable,
  TemplateContent,
  TemplateVisibility,
  Unsupported,
} from "#plate/model/item.ts";
import { readersOf } from "#plate/model/reader.ts";
import { baseTypes, cardinalities, isAuthorData } from "#plate/vocabulary.ts";

/**
 * Replace a body part with its notice, and record the notice.
 *
 * @param build The build.
 * @param feature The feature's key.
 * @param path The part's path.
 * @returns The unsupported node.
 */
const notice = (build: Build, feature: string, path: string): Unsupported => {
  record(build, { feature, path, shown: "notice" });

  return { feature, kind: "unsupported", path };
};

/**
 * Read a body element's attributes as written, without namespace declarations, attributes of
 * other namespaces, or the attributes a mark names.
 *
 * An author `data-*` is carried like any other attribute. `checkAdmitted` has already removed the
 * ones plate reserves, so this walk filters nothing by name; see the module's note on the drop.
 *
 * `data-ssml` and `data-qti-suppress-tts` are carried, not marked: QTI types `data-ssml` as "the
 * container for the equivalent JSON value that is to be passed to the SSML processor", and the
 * server shell writes both on the element unchanged, where a read-aloud engine finds the speech
 * plan.
 *
 * @param element The element.
 * @returns Its attributes, `xml:lang` named `xml:lang`.
 */
const bodyAttributes = (element: SourceElement): readonly BodyAttribute[] =>
  element.attributes.flatMap((attribute) =>
    Option.match(attributeName(attribute), {
      onNone: () => [],
      onSome: (name) => (markedAttributes.has(name) ? [] : [{ name, value: attribute.value }]),
    }),
  );

/**
 * Report whether a body child belongs in the candidate's view, the only view plate writes: in
 * `answering`, `review` and `solution` alike the page is the candidate's. A `qti-rubric-block` is
 * shown only in "The views in which the rubric block's content are to be shown" (QTI 3.0
 * information model, RubricBlock `view`), a list the XSD requires, so one whose `view` leaves out
 * `candidate`, a scorer's grading rubric among them, is in no page plate writes: it is no feature
 * plate fails to render, so it is neither a node nor a notice, and its content never reaches the
 * item. Every other child belongs.
 *
 * @param child The child.
 * @returns Whether the candidate's view holds it.
 */
const inCandidateView = (child: SourceChild): boolean =>
  child.kind !== "element" ||
  !isQti(child, "qti-rubric-block") ||
  Option.exists(valueOf(child, "view"), (views) =>
    views.split(/[\t\n\r ]+/u).includes("candidate"),
  );

/**
 * The `qti-*` elements a module owns inside the content the walk reads for it, by local name: the
 * walk reads each as an element in place of the notice it gives any other `qti-*` element. Empty
 * for the item body and for the content of a module that owns none.
 */
type Owned = ReadonlySet<string>;

/**
 * No owned element: what every walk but a module's reads under.
 */
const noneOwned: Owned = new Set();

/**
 * Read children of a body element, the item body included, that the candidate's view holds
 * ({@link inCandidateView}).
 *
 * @param build The build.
 * @param parent The element.
 * @param own The `qti-*` elements the module reading this content owns, none by default.
 * @param children The children to read, all of `parent`'s by default.
 * @returns Their body nodes, in document order.
 */
export const bodyNodes = (
  build: Build,
  parent: SourceElement,
  own: Owned = noneOwned,
  children: readonly SourceChild[] = parent.children,
): readonly BodyNode[] => {
  const nodes: BodyNode[] = [];
  for (const child of children.filter(inCandidateView)) {
    nodes.push(bodyNode(build, parent, child, own));
  }

  return nodes;
};

/**
 * Read the content of an interaction's first child of one name, such as its `qti-prompt` or an
 * Inline Choice's `qti-label`.
 *
 * @param build The build.
 * @param interaction The interaction.
 * @param local The child's local name.
 * @returns The child's content, none when it has no such child.
 */
const firstContent = (
  build: Build,
  interaction: SourceElement,
  local: string,
): Option.Option<readonly BodyNode[]> =>
  Option.map(Arr.head(childrenNamed(interaction, local)), (child) => {
    markElement(build, child, true);

    return bodyNodes(build, child);
  });

/**
 * The values of `show-hide`, whose XSD type is a string enumeration, so a value is read as written.
 */
const showHides = ["hide", "show"] as const;

/**
 * Read an element's `show-hide`, `show` when absent, beside the template variable that controls
 * it.
 *
 * @param build The build.
 * @param element A choice, a `qti-template-block` or a `qti-template-inline`.
 * @param templateIdentifier Its `template-identifier`, read as an identifier.
 * @returns Its template visibility.
 */
const templateVisibilityOf = (
  build: Build,
  element: SourceElement,
  templateIdentifier: string,
): TemplateVisibility =>
  pipe(enumerated(build, element, "show-hide", showHides), (showHide) => ({
    showHide: Option.getOrElse(showHide, () => "show" as const),
    templateIdentifier,
  }));

/**
 * Read a `qti-printed-variable` into its body node, with the marks it carries as a body element.
 * `identifier` is read as an identifier; `base` and `index` are each a literal or a name, split as
 * the database splits them ({@link integerOrRefOf}); `format`, `field`, `delimiter` and
 * `mapping-indicator` are `xs:normalizedString`s; and an absent attribute takes its default.
 *
 * @param build The build.
 * @param element The printed variable.
 * @returns Its body node.
 */
const printedVariable = (build: Build, element: SourceElement): PrintedVariable => {
  markElement(build, element, true);

  const identifier = identifierAttribute(build, element, "identifier");
  const powerForm = xsBoolean(build, element, "power-form", false);
  /**
   * Read one of the printed variable's `xs:normalizedString` attributes.
   *
   * @param name The attribute's name.
   * @returns Its value as XSD reads it ({@link replaceXmlSpace}), none when it is absent.
   */
  const normalized = (name: string): Option.Option<string> =>
    Option.map(valueOf(element, name), replaceXmlSpace);

  return {
    base: Option.match(valueOf(element, "base"), {
      onNone: (): IntegerOrRef => ({ _tag: "literal", value: 10n }),
      onSome: integerOrRefOf,
    }),
    delimiter: Option.getOrElse(normalized("delimiter"), () => ";"),
    field: normalized("field"),
    format: normalized("format"),
    identifier,
    index: Option.map(valueOf(element, "index"), integerOrRefOf),
    kind: "printed-variable",
    mappingIndicator: Option.getOrElse(normalized("mapping-indicator"), () => "="),
    path: pathOf(build, element),
    powerForm,
  };
};

/**
 * Read the content of a `qti-template-block`, a `qti-feedback-block` or a `qti-modal-feedback`:
 * the content of its `qti-content-body`, read as any body content is. Its `qti-stylesheet`s and
 * its `qti-catalog-info` (`TemplateBlockDType`, `FeedbackBlockDType`, `ModalFeedbackDType`), which
 * the page does not show, are each a mark keyed by its name, as an item's own are.
 *
 * @param build The build.
 * @param block The block.
 * @param own The `qti-*` elements the module reading this content owns.
 * @returns Its content.
 */
const contentBodyOf = (build: Build, block: SourceElement, own: Owned): readonly BodyNode[] => {
  const parts: (readonly BodyNode[])[] = [];
  for (const part of elementsOf(block)) {
    if (isQti(part, "qti-content-body")) {
      parts.push(bodyNodes(build, part, own));
    } else {
      record(build, { feature: nameOf(part), path: pathOf(build, part), shown: "mark" });
      parts.push([]);
    }
  }

  return parts.flat();
};

/**
 * Name the responses a template or feedback block's or inline's source content binds: the
 * `response-identifier` of every QTI element in it that carries one, each read as `identifierOf`
 * reads it, each once, in document order. A block's content is its `qti-content-body`'s; an
 * inline's, its own. It reads the source, not the body nodes, since a notice drops its subtree:
 * an interaction plate does not render binds its response as surely as one it does. Nested
 * template and feedback content is part of the content. The walk keeps its own stack, as `walk`
 * does, so deep content cannot exhaust the call stack.
 *
 * @param element The template or feedback block or inline.
 * @param block Whether it is a block, whose content is its `qti-content-body`'s.
 * @returns The responses, in document order.
 */
const boundResponses = (element: SourceElement, block: boolean): readonly string[] => {
  const roots = block ? childrenNamed(element, "qti-content-body") : [element];
  const pending = roots.flatMap((root) => elementsOf(root)).toReversed();
  const responses = new Set<string>();
  for (let next = pending.pop(); next !== undefined; next = pending.pop()) {
    const written = isQti(next) ? valueOf(next, "response-identifier") : Option.none();
    if (Option.isSome(written)) {
      responses.add(identifierOf(written.value));
    }

    for (const child of elementsOf(next).toReversed()) {
      pending.push(child);
    }
  }

  return [...responses];
};

/**
 * Read a `qti-template-block` or a `qti-template-inline` into its body node: its `identifier` and
 * `template-identifier`, each read as an identifier, its `show-hide`, `show` when absent, and its
 * content: a block's `qti-content-body`'s ({@link contentBodyOf}), an inline's own, each
 * read as any body content is, and the responses that content binds ({@link boundResponses}).
 *
 * @param build The build.
 * @param element The template block or inline.
 * @param kind Which of the two it is.
 * @param own The `qti-*` elements the module reading this content owns, which its content is read
 *   under too, so a module's element inside template content reaches the module.
 * @returns Its body node.
 */
const templateContent = (
  build: Build,
  element: SourceElement,
  kind: TemplateContent["kind"],
  own: Owned,
): TemplateContent => {
  markElement(build, element, true);

  const identifier = identifierAttribute(build, element, "identifier");
  const templateIdentifier = identifierAttribute(build, element, "template-identifier");
  const templateVisibility = templateVisibilityOf(build, element, templateIdentifier);
  const content =
    kind === "template-block" ? contentBodyOf(build, element, own) : bodyNodes(build, element, own);

  return {
    content,
    identifier,
    kind,
    path: pathOf(build, element),
    responses: boundResponses(element, kind === "template-block"),
    templateVisibility,
  };
};

/**
 * Read a feedback element's `outcome-identifier`, as an identifier, and its `show-hide`, `show`
 * when absent (the XSD's default for a block or an inline; a modal feedback's is required).
 *
 * @param build The build.
 * @param element A `qti-feedback-block`, a `qti-feedback-inline` or a `qti-modal-feedback`.
 * @returns Its feedback visibility.
 */
const feedbackVisibilityOf = (build: Build, element: SourceElement): FeedbackVisibility => {
  const outcomeIdentifier = identifierAttribute(build, element, "outcome-identifier");
  const showHide = enumerated(build, element, "show-hide", showHides);

  return { outcomeIdentifier, showHide: Option.getOrElse(showHide, () => "show" as const) };
};

/**
 * Read a `qti-feedback-block` or a `qti-feedback-inline` into its body node: its `identifier`,
 * read as an identifier, its feedback visibility ({@link feedbackVisibilityOf}), and its content: a
 * block's `qti-content-body`'s ({@link contentBodyOf}), an inline's own, each read as any body
 * content is, and the responses that content binds ({@link boundResponses}).
 *
 * @param build The build.
 * @param element The feedback block or inline.
 * @param kind Which of the two it is.
 * @param own The `qti-*` elements the module reading this content owns, which its content is read
 *   under too, so a module's element inside feedback content reaches the module.
 * @returns Its body node.
 */
const feedbackContent = (
  build: Build,
  element: SourceElement,
  kind: FeedbackContent["kind"],
  own: Owned,
): FeedbackContent => {
  markElement(build, element, true);

  const identifier = identifierAttribute(build, element, "identifier");
  const feedbackVisibility = feedbackVisibilityOf(build, element);
  const content =
    kind === "feedback-block" ? contentBodyOf(build, element, own) : bodyNodes(build, element, own);

  return {
    content,
    feedbackVisibility,
    identifier,
    kind,
    path: pathOf(build, element),
    responses: boundResponses(element, kind === "feedback-block"),
  };
};

/**
 * Read a `qti-modal-feedback`: its `identifier`, its feedback visibility, its `title` as an
 * `xs:normalizedString`, and the content of its `qti-content-body` ({@link contentBodyOf}), read
 * as any body content is, with the marks its elements carry as body elements, since the page shows
 * it.
 *
 * @param build The build.
 * @param element The modal feedback.
 * @returns It.
 */
export const modalFeedbackOf = (build: Build, element: SourceElement): ModalFeedback => {
  markElement(build, element, true);

  const identifier = identifierAttribute(build, element, "identifier");
  const feedbackVisibility = feedbackVisibilityOf(build, element);

  return {
    content: contentBodyOf(build, element, noneOwned),
    feedbackVisibility,
    identifier,
    path: pathOf(build, element),
    title: Option.map(valueOf(element, "title"), replaceXmlSpace),
  };
};

/**
 * Read one of a declaration's vocabulary attributes as the member it spells.
 *
 * @param declaration The declaration.
 * @param name The attribute's name.
 * @param vocabulary The attribute's values.
 * @returns The member, none when the declaration does not carry it.
 */
const spelled = <const V extends string>(
  declaration: SourceElement,
  name: string,
  vocabulary: readonly V[],
): Option.Option<V> =>
  Option.flatMap(valueOf(declaration, name), (written) =>
    Arr.findFirst(vocabulary, (member) => member === written),
  );

/**
 * Give the declaration an element's `response-identifier` names, as the walk hands it to a module:
 * its identifier, the key it was found under, and its cardinality, with its base type unless it is
 * a `record`, and nothing else of the declaration. The last declaration wins when two share the
 * identifier, and both sides are compared as `identifierOf` reads them ({@link declarationsOf}).
 * The database holds every declaration of a document it admits to a cardinality, and every one but
 * a `record` to a base type, each inside its vocabulary.
 *
 * @param build The build.
 * @param element An interaction.
 * @returns The bound declaration, or none when the element binds none the item declares.
 */
const boundOf = (build: Build, element: SourceElement): Option.Option<BoundDeclaration> =>
  Option.flatMap(Option.map(valueOf(element, "response-identifier"), identifierOf), (identifier) =>
    Option.flatMap(Option.fromUndefinedOr(build.declarations.get(identifier)), (declaration) =>
      Option.flatMap(
        spelled(declaration, "cardinality", cardinalities),
        (cardinality): Option.Option<BoundDeclaration> =>
          cardinality === "record"
            ? Option.some({ cardinality, identifier })
            : Option.map(spelled(declaration, "base-type", baseTypes), (baseType) => ({
                baseType,
                cardinality,
                identifier,
              })),
      ),
    ),
  );

/**
 * Build the kit a module's `parse` reads one element with: the attribute readers bound to the
 * build, the body walk for the element's content with the module's own elements let through, and
 * the ways to record a mark and a Controls notice.
 *
 * @param build The build.
 * @returns The kit.
 */
const readerKitOf = (build: Build): ReaderKit => ({
  ...readersOf(build),
  content: (parent, local) => firstContent(build, parent, local),
  controlNotices: (interaction) => {
    for (const feature of controlNotices) {
      if (sitsOn(feature, interaction, true) && holds(feature.when, interaction)) {
        record(build, {
          feature: feature.feature,
          path: pathOf(build, interaction),
          shown: "notice",
        });
      }
    }
  },
  location: build.document.location,
  mark: (marked, feature) => {
    record(build, { feature, path: pathOf(build, marked), shown: "mark" });
  },
  markElement: (marked) => {
    markElement(build, marked, true);
  },
  nodes: (parent, options = {}) =>
    bodyNodes(build, parent, new Set(options.own), options.children ?? parent.children),
  templateVisibility: (element) =>
    Option.map(valueOf(element, "template-identifier"), (written) =>
      templateVisibilityOf(build, element, identifierOf(written)),
    ),
});

/**
 * Give the feature of the vocabulary's `modelled.notices` an interaction carries, such as
 * `pattern-mask` for a pattern the translator refuses: what shows as a notice in place of the
 * whole interaction.
 *
 * @param interaction The interaction.
 * @returns The first such feature in the vocabulary's order, none when it carries none.
 */
const modelledNotice = (interaction: SourceElement): Option.Option<string> =>
  Option.map(
    Arr.findFirst(
      notices,
      (feature) => sitsOn(feature, interaction, true) && holds(feature.when, interaction),
    ),
    (feature) => feature.feature,
  );

/**
 * Build the context the body walk hands a module's or a body-placed content module's `parse` for
 * one element: its path, its notice, and the kit it is read with.
 *
 * @param build The build.
 * @param element The element being parsed.
 * @returns The context.
 */
const contextOf = (build: Build, element: SourceElement): ParseContext => {
  const path = pathOf(build, element);

  return {
    notice: (feature) => notice(build, feature, path),
    path,
    read: readerKitOf(build),
  };
};

/**
 * Read a QTI interaction element through its module. The walk refuses an interaction whose
 * `response-identifier` names no declaration the item makes as `undeclared-response`, gives the
 * notice of a feature of the vocabulary's `modelled.notices` it carries, then the notice
 * `cardinality="…"` or `base-type="…"` for a declaration outside the module's binding (`misfitOf`
 * in `#plate/interactions/contract.ts`), so no module checks its own binding; otherwise the
 * module's `parse` reads the element, handed its notice, path and kit and the declaration it binds.
 *
 * @param build The build.
 * @param element The interaction.
 * @param parent The element whose children it stands among.
 * @param reader The module's binding and `parse`.
 * @returns Its node as the module read it, or its notice.
 */
const moduleRead = (
  build: Build,
  element: SourceElement,
  parent: SourceElement,
  reader: ModuleReader,
): Parsed<Interaction> | Unsupported => {
  const context = contextOf(build, element);
  const written = requiredAttribute(build, element, "response-identifier");
  const bound = boundOf(build, element);
  if (Option.isNone(bound)) {
    return inadmissible(build, "undeclared-response", attributePath(context.path, written), {
      response: identifierOf(written.value),
    });
  }

  const shown = Option.orElse(modelledNotice(element), () => misfitOf(reader.binding, bound.value));
  if (Option.isSome(shown)) {
    return context.notice(shown.value);
  }

  return reader.parse(element, { ...context, bound: bound.value, parent });
};

/**
 * Read a QTI interaction element by its module ({@link moduleRead}). The context is built only
 * for an element a module reads.
 *
 * @param build The build.
 * @param element The element.
 * @param parent The element whose children it stands among.
 * @returns Its body node.
 */
const moduleNode = (
  build: Build,
  element: SourceElement,
  parent: SourceElement,
): Option.Option<Parsed<Interaction> | Unsupported> =>
  isQti(element)
    ? Option.map(readerFor(element.local), (reader) => moduleRead(build, element, parent, reader))
    : Option.none();

/**
 * Set the author's `data-*` of an interaction root on the node its module read:
 * each attribute securing kept that plate does not reserve (`isAuthorData`), in document order.
 * Securing already removed and marked each reserved name, so none is marked here. The module never
 * sees them, a notice carries none, and a Portable Custom Interaction keeps its own route: its
 * `data-*` are its properties, which its module reads.
 *
 * @param node The node the module read, or its notice.
 * @param element The interaction root.
 * @returns The node with its `data`, none listed where the root carries no author `data-*`; a PCI,
 *   which holds none, and the notice as they are.
 */
const withAuthorData = (
  node: Parsed<Interaction> | Unsupported,
  element: SourceElement,
): BodyNode => {
  if (node.kind === "unsupported" || node.kind === "portable-custom") {
    return node;
  }

  return {
    ...node,
    data: element.attributes.flatMap((attribute): readonly BodyAttribute[] =>
      attribute.namespace === "" && isAuthorData(attribute.local)
        ? [{ name: attribute.local, value: attribute.value }]
        : [],
    ),
  };
};

/**
 * The model node the module of the item-placed element K reads, `never` while it is a stub.
 *
 * @template K The element.
 */
type ItemNode<K extends ItemContentElement> = ItemNodeOf<ItemModules[K]>;

/**
 * One node an item-placed content module read, beside the element it was read from.
 *
 * @template K The element.
 */
interface ItemPartNode<K extends ItemContentElement> {
  readonly element: K;
  readonly node: ItemNode<K>;
}

/**
 * The item content as the item root's walk collects it ({@link ItemContent}).
 */
export type ItemContentBuild = { [K in ItemContentElement]: ItemNode<K>[] };

/**
 * Read a body element a content module reads, by its module's `parse` after its `normalise`, which
 * the element's notice, path and kit are handed to (`parseBodyContent` in
 * `#plate/content/modules.ts`). The context is built for the element as the document holds it, so
 * its path is the element's whatever `normalise` gives.
 *
 * @param build The build.
 * @param element The element.
 * @returns Its body node.
 */
const contentNode = (build: Build, element: SourceElement): Option.Option<BodyNode> =>
  Option.map(bodyModuleFor(element), (module) =>
    parseBodyContent(module, element, contextOf(build, element)),
  );

/**
 * Read an element an interaction module owns as the container of its interactions, by the module's
 * container `parse` (`containerFor` in `#plate/model/interactions.ts`): the element's children are
 * read as body nodes first, so the interactions inside it reach their own modules, then the
 * element, those nodes and the element's context are handed to the module.
 *
 * @param build The build.
 * @param element The element.
 * @param own The `qti-*` elements the module reading this content owns, passed to the children.
 * @returns Its body node.
 */
const containerNode = (build: Build, element: SourceElement, own: Owned): Option.Option<BodyNode> =>
  (isQti(element) ? containerFor(element.local) : Option.none()).pipe(
    Option.map((container) =>
      pipe(bodyNodes(build, element, own), (children) =>
        container.parse(element, children, contextOf(build, element)),
      ),
    ),
  );

/**
 * Read an item root child by the `parse` of the item-placed content module that reads it.
 *
 * @template K The child's element.
 * @param module The module.
 * @param part The child.
 * @param context The child's path and the way to record its mark.
 * @returns The node the module read, beside the child's element; none once it recorded the mark.
 */
const parseItemPart = <K extends ItemContentElement>(
  module: {
    readonly element: K;
    readonly parse: (
      element: SourceElement,
      context: ItemParseContext,
    ) => Option.Option<ItemNode<K>>;
  },
  part: SourceElement,
  context: ItemParseContext,
): Option.Option<ItemPartNode<K>> =>
  pipe(
    module.parse(part, context),
    Option.map((node) => ({ element: module.element, node })),
  );

/**
 * Read an item root child the root's walk has no branch of its own for: by its content module's
 * `parse` after its `normalise`, which the element's path, the way to record its mark and the
 * body's catalog references are handed to, when an item-placed module reads it; otherwise as the
 * mark keyed by its name, when the model does not read it.
 *
 * @param build The build.
 * @param part The child, its own marks recorded.
 * @returns The node its module read, beside its element; none when no module reads it or its module
 *   recorded the mark.
 */
export const itemPart = (
  build: Build,
  part: SourceElement,
): Option.Option<ItemPartNode<ItemContentElement>> => {
  const path = pathOf(build, part);
  const module = itemModuleFor(part);
  if (Option.isSome(module)) {
    const mark = (feature: string): Option.Option<never> => {
      record(build, { feature, path, shown: "mark" });

      return Option.none();
    };

    return parseItemPart(module.value, module.value.normalise(part), {
      catalogReferences: build.references,
      mark,
      path,
      read: readerKitOf(build),
    });
  }

  if (!readElements.has(part.local)) {
    record(build, { feature: part.local, path, shown: "mark" });
  }

  return Option.none();
};

/**
 * Add the node an item-placed content module read to the item content, after the nodes read
 * before it from its element.
 *
 * @template K The node's element.
 * @param content The item content collected so far, typed over K alone, so TypeScript relates the
 *   write of the node's element's list to the node's own type when the modules' node types differ.
 * @param read The node beside its element, or none when the module read none.
 */
export const collectItemPart = <K extends ItemContentElement>(
  content: { [P in K]: ItemNode<P>[] },
  read: Option.Option<ItemPartNode<K>>,
): void => {
  if (Option.isSome(read)) {
    const { element, node } = read.value;
    content[element].push(node);
  }
};

/**
 * Read a body element's catalog reference, its `data-catalog-idref`, and record it for the catalog
 * module (`Build.references`).
 *
 * @param build The build.
 * @param element The element.
 * @returns The element's `catalog` field, holding the idref as written; no field when the element
 *   references no catalog, so an element without one carries no `catalog` key.
 */
const catalogOf = (build: Build, element: SourceElement): Pick<BodyElement, "catalog"> =>
  Option.match(
    Arr.findFirst(
      element.attributes,
      (attribute) => attribute.namespace === "" && attribute.local === "data-catalog-idref",
    ),
    {
      onNone: () => ({}),
      onSome: (attribute) => {
        build.references.push({ idref: attribute.value, path: pathOf(build, element) });

        return { catalog: attribute.value };
      },
    },
  );

/**
 * Read a body element's stimulus reference, its `data-stimulus-idref`, as the element's `stimulus`
 * key. The attribute itself stays among the element's attributes ({@link bodyAttributes}): it is
 * an author `data-*` attribute, not a marked one.
 *
 * @param element The element.
 * @returns The element's `stimulus` field, holding the idref as written; no field when the element
 *   names no stimulus, so an element without one carries no `stimulus` key.
 */
const stimulusOf = (element: SourceElement): Pick<BodyElement, "stimulus"> =>
  Option.match(
    Arr.findFirst(
      element.attributes,
      (attribute) => attribute.namespace === "" && attribute.local === "data-stimulus-idref",
    ),
    { onNone: () => ({}), onSome: (attribute) => ({ stimulus: attribute.value }) },
  );

/**
 * The elements of every interaction the model reads, each module's.
 */
const interactionElements: ReadonlySet<string> = new Set(
  Object.values(modules).map((module) => module.element),
);

/**
 * Read an interaction met in a stimulus body as its notice, keyed by its element: a stimulus
 * declares no response, so the interaction has nothing to bind to ({@link Build.stimulus}). The
 * database admits one there, so the walk gives the notice.
 *
 * @param build The build.
 * @param child A QTI-namespace element of a stimulus body.
 * @returns The notice, when the build reads a stimulus body and the element is an interaction's.
 */
const stimulusInteraction = (build: Build, child: SourceElement): Option.Option<BodyNode> =>
  build.stimulus && isQti(child) && interactionElements.has(child.local)
    ? Option.some(notice(build, child.local, pathOf(build, child)))
    : Option.none();

/**
 * Read one child of a body element.
 *
 * @param build The build.
 * @param parent The element that holds it.
 * @param child The child.
 * @param own The `qti-*` elements the module reading this content owns, each read as an element.
 * @returns Its body node: text as itself, an HTML element with its subtree, an interaction's model
 *   or, for one a module reads, what its `parse` gives (in a stimulus body, an interaction's
 *   notice: {@link stimulusInteraction}), a feedback block's or inline's with its content, for an
 *   element a body-placed content module reads what its `parse` gives, a module's container with
 *   its children ({@link containerNode}), a printed variable's, a template block's or inline's with
 *   its content, a module's own element as an element with its subtree, or a notice for anything
 *   else, its subtree dropped.
 */
const bodyNode = (
  build: Build,
  parent: SourceElement,
  child: SourceChild,
  own: Owned,
): BodyNode => {
  if (child.kind === "text") {
    return { kind: "text", text: child.text };
  }

  if (child.kind === "entity") {
    return notice(build, `&${child.name};`, pathOf(build, parent));
  }

  const unbound = stimulusInteraction(build, child);
  if (Option.isSome(unbound)) {
    return unbound.value;
  }

  const interaction = moduleNode(build, child, parent);
  if (Option.isSome(interaction)) {
    return withAuthorData(interaction.value, child);
  }

  // The model reads feedback blocks and inlines itself, so they are read before the content
  // modules, whose feedback stubs would give their notice.
  if (isQti(child, "qti-feedback-block")) {
    return feedbackContent(build, child, "feedback-block", own);
  }

  if (isQti(child, "qti-feedback-inline")) {
    return feedbackContent(build, child, "feedback-inline", own);
  }

  const content = contentNode(build, child);
  if (Option.isSome(content)) {
    return content.value;
  }

  const container = containerNode(build, child, own);
  if (Option.isSome(container)) {
    return container.value;
  }

  if (isQti(child, "qti-printed-variable")) {
    return printedVariable(build, child);
  }

  if (isQti(child, "qti-template-block")) {
    return templateContent(build, child, "template-block", own);
  }

  if (isQti(child, "qti-template-inline")) {
    return templateContent(build, child, "template-inline", own);
  }

  if (!isQti(child) || (child.local.startsWith("qti-") && !own.has(child.local))) {
    return notice(build, nameOf(child), pathOf(build, child));
  }

  return (() => {
    markElement(build, child, true);

    const children = bodyNodes(build, child, own);

    return {
      attributes: bodyAttributes(child),
      children,
      kind: "element",
      path: pathOf(build, child),
      tag: child.local,
      ...catalogOf(build, child),
      ...stimulusOf(child),
    };
  })();
};
