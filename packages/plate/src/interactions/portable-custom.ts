/**
 * Portable Custom Interaction (Q-16, kind `portable-custom`): the model a `qti-portable-custom-
 * interaction` is read into, and the payload node the page is given of it.
 *
 * The readings that bind this module, by their wording: "A PCI has exactly one
 * `qti-interaction-markup`, which may be empty" (the database enforces it; an empty markup gives no
 * markup content), and "A PCI's secondary module configuration is `secondary-configuration`" (an
 * item writing `fallback-configuration` is refused by the database before this module reads it).
 *
 * `parse` reads the element through the kit the body walk hands it: its `custom-interaction-type-
 * identifier`, its `module`, its `response-identifier` and the declaration it names, its `data-*`
 * attributes as the `properties` a host passes a PCI, named as HTML's `dataset` names them
 * ({@link datasetName}), its `qti-prompt`, its `qti-interaction-modules` as written (the two
 * configurations, each `qti-interaction-module`'s `id` and paths), its one
 * `qti-interaction-markup` (its body content read as the body walk reads the item body, so its
 * printed variables, feedback and template content resolve as the body's do, and each HTML
 * `template` at its end kept apart), its `qti-template-variable` and `qti-context-variable`
 * identifiers, and its `qti-stylesheet` and `qti-catalog-info`, which are marks here (issue pci-05
 * renders them).
 *
 * {@link portableCustomModule}'s `redact` gives the page the type identifier; the configuration a
 * PCI is handed, its `properties`, its `responseIdentifier` and the template and context variable
 * identifiers, which issue pci-04's frame host reads; the name the response travels under
 * (decision D2); the Prompt, the markup (the content a PCI is handed as `dom`) and each
 * `template`'s content, kept apart to be written inert; the author's `class` and names; and, when
 * the host passes its `pci` facts (`RedactKit.host`, `PciHostFacts` in `#plate/pci/host.ts`) and
 * routed this PCI's response, what the host told it: the classified routes, the frame page's URL,
 * the `module` attribute as the entry when written, and each module the author named that the
 * host's routes do not cover. The server shell renders it (`#plate/ui/item/interactions/`). The
 * module facts as written (`module`, `modules`) stay on the model node, read by `parse` and handed
 * to nothing but the dropped modules and the routes' matching: only the host that holds the
 * package classifies them, and the page sees the host's routes, never an unclassified path.
 * Without host facts the payload node holds none, and the PCI cannot run on the page. The payload
 * holds no correct value and no template value: the bound variables' values reach the PCI through
 * the frame host, never through the page.
 *
 * @module
 */
import { Array as Arr, Option } from "effect";
import type { SourceElement } from "#plate/document/source.ts";
import { contentRegion, promptRegion } from "#plate/interactions/contract.ts";
import type {
  ByLevel,
  InteractionModule,
  ModuleInteraction,
  OwnRegion,
  ReaderKit,
} from "#plate/interactions/contract.ts";
import type { BodyNode, Level, ModelLevel, Nodes, RedactedLevel } from "#plate/model/item.ts";
import type { PciHostFacts, PciModuleRoute } from "#plate/pci/host.ts";

/**
 * Portable Custom Interaction's identifier in the QTI 3.0 conformance list, Appendix A.
 */
const feature = "Q-16";

/**
 * The QTI element Portable Custom Interaction is read from.
 */
const element = "qti-portable-custom-interaction";

/**
 * One `qti-interaction-module` of a Portable Custom Interaction (Q-16), as written: its `id`, and
 * its `primary-path` and `fallback-path`, each none when absent. The module resolves no path
 * (issue pci-01's `resolvePciModules` does); it carries them to the frame host.
 */
interface PortableCustomModuleRef {
  readonly fallbackPath: Option.Option<string>;
  readonly id: string;
  readonly primaryPath: Option.Option<string>;
}

/**
 * The schema's default for `qti-interaction-modules@primary-configuration`, read where the PCI
 * writes none, or writes no `qti-interaction-modules` at all.
 */
const defaultPrimaryConfiguration = "modules/module_resolution.js";

/**
 * The schema's default for `qti-interaction-modules@secondary-configuration`, read where the PCI
 * writes none, or writes no `qti-interaction-modules` at all.
 */
const defaultSecondaryConfiguration = "modules/fallback_module_resolution.js";

/**
 * A Portable Custom Interaction's (Q-16) `qti-interaction-modules`: its `primary-configuration` and
 * `secondary-configuration`, each the schema's default where it writes none, and its modules in
 * document order. A PCI with no `qti-interaction-modules` has the two defaults and no module, since
 * the element, where written, lists at least one.
 */
interface PortableCustomModules {
  readonly modules: readonly PortableCustomModuleRef[];
  readonly primaryConfiguration: string;
  readonly secondaryConfiguration: string;
}

/**
 * One property a host passes a Portable Custom Interaction (Q-16): a `data-*` attribute of the
 * element, its name as HTML's `dataset` names it ({@link datasetName}) and its value as written.
 */
interface PortableCustomProperty {
  readonly name: string;
  readonly value: string;
}

/**
 * The model node of a Portable Custom Interaction (Q-16, kind `portable-custom`): the fields every
 * module's node shares but the author's `data-*`, since a PCI's `data-*` are its properties
 * (`properties`), and what the element gives beyond them.
 *
 * @template L The level of its content.
 */
export interface PortableCustomInteraction<L extends Level = ModelLevel> extends Omit<
  ModuleInteraction<"portable-custom">,
  "data"
> {
  /**
   * The bound declaration's `base-type` as written, none when absent, outside the vocabulary or
   * undeclared: a PCI binds a response of any base type its module defines.
   */
  readonly baseType: Option.Option<string>;
  /**
   * The bound declaration's `cardinality` as written, none when absent, outside the vocabulary or
   * undeclared.
   */
  readonly cardinality: Option.Option<string>;
  /**
   * The author's `class`, as written, none when absent.
   */
  readonly class: Option.Option<string>;
  /**
   * The `identifier` of each `qti-context-variable`, in document order.
   */
  readonly contextVariables: readonly string[];
  /**
   * The children of each HTML `template` of the markup, in document order, each read as body
   * content, which the page copies inert.
   *
   * The name is not `templates`: `templates` is a key the redaction sweep refuses at any depth of
   * a redacted item, as the name of an item's template declarations and a record's template
   * values, which a page must never hold. This field holds neither: it is the author's inert
   * `template` content, which the PCI activates.
   */
  readonly inertTemplates: readonly Nodes<L>[];
  /**
   * The content of the one `qti-interaction-markup` but for its `template` elements, read as the
   * body walk reads the item body; empty for an empty markup.
   */
  readonly markup: Nodes<L>;
  /**
   * The `module` attribute, the AMD module id, none when absent (then `modules` names it).
   */
  readonly module: Option.Option<string>;
  readonly modules: PortableCustomModules;
  readonly properties: readonly PortableCustomProperty[];
  readonly prompt: Option.Option<Nodes<L>>;
  /**
   * The `template-identifier` of each `qti-template-variable`, in document order.
   */
  readonly templateVariables: readonly string[];
  /**
   * `custom-interaction-type-identifier`, the URI naming the PCI type, as written.
   */
  readonly typeIdentifier: string;
}

/**
 * A Portable Custom Interaction's model node at each level.
 */
interface PortableCustomByLevel extends ByLevel {
  readonly node: PortableCustomInteraction<this["level"]>;
}

/**
 * The configuration a Portable Custom Interaction (Q-16) is given, as the frame host (issue
 * pci-04) hands it to the PCI: the `properties`, the `responseIdentifier`, and the template and
 * context variable identifiers. It holds no value of
 * any variable, and no module fact: the module facts as written (`module`, `modules`) stay on the
 * model node for the host's resolution, and reach the page only as the host's classified routes
 * ({@link PortableCustomHost}), so an unclassified path never reaches it.
 */
interface PortableCustomConfiguration {
  readonly contextVariables: readonly string[];
  readonly properties: readonly PortableCustomProperty[];
  readonly responseIdentifier: string;
  readonly templateVariables: readonly string[];
}

/**
 * What the host told the module of this PCI through `RedactKit.host.pci` (`PciHostFacts` in
 * `#plate/pci/host.ts`), for the frame host (issue pci-04): the URL of the frame page the host
 * serves, which the PCI's frame loads, the classified routes the host resolved for the PCI's
 * response, in route order, and the entry module's id, the PCI's `module` attribute, when it
 * names one. `dropped` names each module the author wrote (`module`, and each
 * `qti-interaction-module`'s `id`) that no route covers, in the order written and each once, for
 * the page to name so an author sees it, not silence.
 */
export interface PortableCustomHost {
  readonly dropped: readonly string[];
  readonly entry: Option.Option<string>;
  readonly loader: string;
  readonly routes: readonly PciModuleRoute[];
}

/**
 * The payload node of a Portable Custom Interaction (Q-16, kind `portable-custom`): what the page
 * may know of the model node, its content copied through the payload's kit, the name its
 * response travels under, and what the host told the module of this PCI. It holds no correct
 * value, no template value and no stored value: the page posts the response (issue pci-05), and
 * the frame host of issue pci-04 hands the PCI its values.
 */
interface PortableCustomPayload {
  readonly ariaLabel: Option.Option<string>;
  readonly ariaLabelledby: Option.Option<string>;
  readonly class: Option.Option<string>;
  readonly configuration: PortableCustomConfiguration;
  /**
   * The name the response's controls post under: the view's name for it, else
   * `entryName(instance, response)`.
   */
  readonly formName: string;
  /**
   * What the host told the module of this PCI ({@link PortableCustomHost}); none when the host
   * passed no `pci` facts, or routed nothing for this PCI's response, and then the page has no
   * route, no loader and no entry, and the PCI cannot run there.
   */
  readonly host: Option.Option<PortableCustomHost>;
  /**
   * The content of each HTML `template` of the markup, copied through the payload's kit, which the
   * page writes inert.
   *
   * The name is not `templates`, for the reason {@link PortableCustomInteraction.inertTemplates}
   * gives: the redaction sweep refuses that key at any depth of a redacted item, and this field
   * holds the author's inert content, no template declaration and no template value (Q-16, issue
   * pci-03b).
   */
  readonly inertTemplates: readonly Nodes<RedactedLevel>[];
  readonly markup: Nodes<RedactedLevel>;
  readonly prompt: Option.Option<Nodes<RedactedLevel>>;
  readonly response: string;
  readonly typeIdentifier: string;
}

/**
 * The QTI children of the element this module owns inside the content it reads, which the body
 * walk would otherwise give a notice for; none of them sits inside the markup by the XSD, so the
 * list is the module's claim, not a transform.
 */
const ownedChildren = [
  "qti-interaction-modules",
  "qti-interaction-module",
  "qti-template-variable",
  "qti-context-variable",
] as const;

/**
 * Name a `data-*` attribute as HTML's `dataset` names it: the `data-` prefix removed, and each `-`
 * followed by an ASCII lowercase letter removed with that letter upper-cased, so
 * `data-max-choices-message` is `maxChoicesMessage` and `data-start_value-2` is `start_value-2`.
 *
 * @param local The attribute's local name, starting with `data-`.
 * @returns The dataset name.
 * @see https://html.spec.whatwg.org/multipage/dom.html#dom-dataset
 */
const datasetName = (local: string): string =>
  local
    .slice("data-".length)
    .replaceAll(/-(?<letter>[a-z])/gu, (_match, letter: string) => letter.toUpperCase());

/**
 * Read the `data-*` attributes of the element as the properties a host passes the PCI, in
 * document order.
 *
 * @param pci The element.
 * @returns The properties.
 */
const propertiesOf = (pci: SourceElement): readonly PortableCustomProperty[] =>
  pci.attributes.flatMap((attribute) =>
    attribute.namespace === "" && attribute.local.startsWith("data-")
      ? [{ name: datasetName(attribute.local), value: attribute.value }]
      : [],
  );

/**
 * Read the `qti-interaction-modules` of the element, each configuration the schema's default where
 * it writes none, and the defaults with no module when the element has none.
 *
 * @param read The kit.
 * @param pci The element.
 * @returns The modules.
 */
const modulesOf = (read: ReaderKit, pci: SourceElement): PortableCustomModules =>
  Option.match(Arr.head(read.childrenNamed(pci, "qti-interaction-modules")), {
    onNone: () => ({
      modules: [],
      primaryConfiguration: defaultPrimaryConfiguration,
      secondaryConfiguration: defaultSecondaryConfiguration,
    }),
    onSome: (modules) => {
      read.markElement(modules);

      const listed: PortableCustomModuleRef[] = [];
      for (const module of read.childrenNamed(modules, "qti-interaction-module")) {
        read.markElement(module);
        listed.push({
          fallbackPath: read.valueOf(module, "fallback-path"),
          id: read.requiredValue(module, "id"),
          primaryPath: read.valueOf(module, "primary-path"),
        });
      }

      return {
        modules: listed,
        primaryConfiguration: Option.getOrElse(
          read.valueOf(modules, "primary-configuration"),
          () => defaultPrimaryConfiguration,
        ),
        secondaryConfiguration: Option.getOrElse(
          read.valueOf(modules, "secondary-configuration"),
          () => defaultSecondaryConfiguration,
        ),
      };
    },
  });

/**
 * Read the one `qti-interaction-markup`: its children but for each HTML `template`, read as body
 * content with the module's own elements let through, and each `template`'s children read the
 * same way, kept apart. An absent or empty markup gives no content and no template.
 *
 * @param read The kit.
 * @param pci The element.
 * @returns The markup content and the templates' content.
 */
const markupOf = (read: ReaderKit, pci: SourceElement) => {
  const [found] = read.childrenNamed(pci, "qti-interaction-markup");
  if (found === undefined) {
    return { inertTemplates: [], markup: [] };
  }

  read.markElement(found);

  const isTemplate = (child: SourceElement): boolean => read.isQti(child, "template");
  const own = [...ownedChildren];
  const markup = read.nodes(found, {
    children: found.children.filter((child) => !(child.kind === "element" && isTemplate(child))),
    own,
  });
  const inertTemplates: (readonly BodyNode[])[] = [];
  for (const template of read.elementsOf(found).filter(isTemplate)) {
    read.markElement(template);
    inertTemplates.push(read.nodes(template, { own }));
  }

  return { inertTemplates, markup };
};

/**
 * Read the identifier attribute of each child of one name, in document order.
 *
 * @param read The kit.
 * @param pci The element.
 * @param local The children's local name.
 * @param name The attribute each carries.
 * @returns The identifiers.
 */
const identifiersOf = (
  read: ReaderKit,
  pci: SourceElement,
  local: string,
  name: string,
): readonly string[] => {
  const identifiers: string[] = [];
  for (const child of read.childrenNamed(pci, local)) {
    read.markElement(child);
    identifiers.push(read.identifierAttribute(child, name));
  }

  return identifiers;
};

/**
 * List the module ids the author wrote: the `module` attribute, then each listed
 * `qti-interaction-module`'s `id`, in document order and each once.
 *
 * @param interaction The model node.
 * @returns The ids named.
 */
const namedModules = (interaction: PortableCustomInteraction): readonly string[] => [
  ...new Set([
    ...Option.toArray(interaction.module),
    ...interaction.modules.modules.map((module) => module.id),
  ]),
];

/**
 * Read what the host told the module of one PCI: the routes the facts hold for its response, the
 * loader, the entry it names, and each named module no route covers (the dropped ones). None when
 * the host passed no `pci` facts, or routed nothing for the response.
 *
 * @param interaction The model node.
 * @param facts The host's `pci` facts, when it passed them.
 * @returns What the payload node holds of the host.
 */
const hostOf = (
  interaction: PortableCustomInteraction,
  facts: PciHostFacts | undefined,
): Option.Option<PortableCustomHost> =>
  Option.fromUndefinedOr(facts).pipe(
    Option.flatMap((pci) =>
      Option.map(Option.fromUndefinedOr(pci.modules.get(interaction.response)), (routes) => {
        const routed = new Set(routes.map((route) => route.id));

        return {
          dropped: namedModules(interaction).filter((id) => !routed.has(id)),
          entry: interaction.module,
          loader: pci.loader,
          routes,
        };
      }),
    ),
  );

/**
 * Give the regions of the Portable Custom Interaction's own content, in document order: its
 * Prompt, its markup, then each template's content, each of part `content` but the Prompt.
 *
 * @template L The level of its content.
 * @param interaction The Portable Custom Interaction.
 * @returns The regions, with no choice.
 */
const regionsOfPci = <L extends Level>(
  interaction: PortableCustomInteraction<L>,
): readonly OwnRegion<PortableCustomInteraction<L>, BodyNode<L>>[] => [
  ...promptRegion(interaction),
  contentRegion<PortableCustomInteraction<L>, BodyNode<L>>(interaction.markup, (each, markup) => ({
    ...each,
    markup,
  })),
  ...interaction.inertTemplates.map((nodes, index) =>
    contentRegion<PortableCustomInteraction<L>, BodyNode<L>>(nodes, (each, content) => ({
      ...each,
      inertTemplates: each.inertTemplates.map((held, at) => (at === index ? content : held)),
    })),
  ),
];

/**
 * The Portable Custom Interaction module (Q-16, kind `portable-custom`).
 */
export const portableCustomModule: InteractionModule<
  "portable-custom",
  PortableCustomByLevel,
  PortableCustomPayload
> = {
  /**
   * Any declared response: the Portable Custom Interaction's class states no binding (reading
   * 75), and the PCI decides what it posts.
   */
  binding: "any",
  element,
  feature,
  /**
   * The Portable Custom Interaction with its Prompt's, its markup's and its templates' content
   * emptied.
   */
  hollow: (interaction) => ({
    ...interaction,
    inertTemplates: interaction.inertTemplates.map(() => []),
    markup: [],
    prompt: interaction.prompt.pipe(Option.map(() => [])),
  }),
  kind: "portable-custom",
  /**
   * Read the element through the kit: its attributes, its Prompt, its modules as written, its
   * markup and templates, its variable identifiers, and a mark for each `qti-stylesheet` and
   * `qti-catalog-info` (issue pci-05 renders them).
   */
  parse: (pci, { bound, read }) => {
    read.markElement(pci);

    const response = bound.identifier;
    const typeIdentifier = read.requiredValue(pci, "custom-interaction-type-identifier");
    const prompt = read.content(pci, "qti-prompt");
    const modules = modulesOf(read, pci);
    const { inertTemplates, markup } = markupOf(read, pci);
    const templateVariables = identifiersOf(
      read,
      pci,
      "qti-template-variable",
      "template-identifier",
    );
    const contextVariables = identifiersOf(read, pci, "qti-context-variable", "identifier");
    for (const marked of ["qti-stylesheet", "qti-catalog-info"]) {
      for (const child of read.childrenNamed(pci, marked)) {
        read.mark(child, marked);
      }
    }

    return {
      ariaLabel: read.valueOf(pci, "aria-label"),
      ariaLabelledby: read.valueOf(pci, "aria-labelledby"),
      baseType: bound.cardinality === "record" ? Option.none() : Option.some(bound.baseType),
      cardinality: Option.some(bound.cardinality),
      class: read.valueOf(pci, "class"),
      contextVariables,
      inertTemplates,
      kind: "portable-custom",
      markup,
      module: read.valueOf(pci, "module"),
      modules,
      path: read.pathOf(pci),
      prompt,
      properties: propertiesOf(pci),
      response,
      templateVariables,
      typeIdentifier,
    };
  },
  /**
   * Copy the model node into its payload node: its content through the kit, the configuration,
   * the name the response travels under, and what the host told the module of this PCI through
   * `kit.host.pci` ({@link hostOf}): the routes for its response, the loader, the entry, and each
   * module the author named that the routes do not cover, for the page to name. The written
   * module facts reach the payload node through nothing else: the routes replace them. The kit's
   * shown values and seed are not read: the page shows no value of the response without script.
   */
  redact: (interaction, kit) => ({
    ariaLabel: interaction.ariaLabel,
    ariaLabelledby: interaction.ariaLabelledby,
    class: interaction.class,
    configuration: {
      contextVariables: interaction.contextVariables,
      properties: interaction.properties,
      responseIdentifier: interaction.response,
      templateVariables: interaction.templateVariables,
    },
    formName: kit.formName(interaction.response),
    host: hostOf(interaction, kit.host.pci),
    inertTemplates: interaction.inertTemplates,
    markup: interaction.markup,
    prompt: interaction.prompt,
    response: interaction.response,
    typeIdentifier: interaction.typeIdentifier,
  }),
  /**
   * The regions, in document order: the Prompt, the markup, then each template's content.
   */
  regions: regionsOfPci,
  /**
   * No message: the response's JSON binding is judged by issue pci-05.
   */
  validate: () => [],
};
