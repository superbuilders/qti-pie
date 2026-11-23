/**
 * Hot Text (Q-11), the `qti-hottext-interaction`: its model node, parse and redaction, on the
 * module shape the interaction-module contract states.
 *
 * A `qti-hottext-interaction` is a prompt interaction whose block content holds `qti-hottext`
 * choices at any depth. Reading 38 ("A `qti-gap` appears only within a gap-match interaction, and a
 * `qti-hottext` may appear in any flow or inline content") lets a hottext stand anywhere in flow or
 * inline content, so the module reads the hottexts of its own content, at any depth, and a hottext
 * outside it belongs to no interaction and stays as the body walk leaves it.
 *
 * {@link hottextModule}'s `redact` gives the page the Prompt, the author's block content with each
 * hottext in place as a `qti-hottext` element, each hottext's part ({@link HottextPart}),
 * `max-choices`, and the identifiers to show as chosen; the server shell renders
 * it (`#plate/ui/item/interactions/`), each choice a control whose name is the hottext's own text
 * (WCAG 2.5.3).
 *
 * A hottext the template variable it names hides (`template-identifier` and `show-hide`) "must
 * still be presented to the candidate as if it were simply part of the surrounding material": its
 * content stands in the sentence with no Choice and no Control. The model keeps that decision where
 * the redaction already makes it: each hottext holds a `qti-hottext-control` marker, and one with
 * a template visibility holds it inside a template inline, which `redact` shows or hides by the
 * template value as it does any template inline. So a redacted hottext is selectable exactly when
 * it holds the marker: `redact` reads that one fact once into each hottext's part, so the server
 * shell never sees the marker.
 *
 * The module value-imports nothing that reaches `#plate/model/interactions.ts`, which holds the
 * table of modules and so imports this file: `#plate/interactions/choice.ts` does reach it, so
 * loading this file first would read the table before the module it names exists.
 *
 * @module
 */
import { Option } from "effect";
import { boundIn, contentRegion, promptRegion } from "#plate/interactions/contract.ts";
import type {
  ByLevel,
  InteractionModule,
  ModuleInteraction,
  OwnRegion,
  RedactKit,
} from "#plate/interactions/contract.ts";
import { bodyAttributeOf } from "#plate/model/attributes.ts";
import type {
  BodyElement,
  BodyNode,
  Level,
  ModelLevel,
  Nodes,
  RedactedLevel,
  ReferencingChoice,
  TemplateContent,
  TemplateVisibility,
} from "#plate/model/item.ts";
import { format } from "#plate/model/values.ts";
import type { Declared } from "#plate/model/values.ts";

/**
 * Hot Text's identifier in the QTI 3.0 conformance list, Appendix A.
 */
const feature = "Q-11";

/**
 * The QTI element Hot Text is read from.
 */
const element = "qti-hottext-interaction";

/**
 * The binding Hot Text renders with: "The qti-hottext-interaction must be bound to a response
 * variable with a base-type of identifier and single or multiple cardinality" (section 5.66).
 */
const binding = { baseTypes: ["identifier"], cardinalities: ["single", "multiple"] } as const;

/**
 * The QTI element of one choice of Hot Text, which the body walk reads as an element of the
 * module's own content, where it writes a notice for any other `qti-*` element. The payload keeps
 * each hottext as an element of this tag, which the server shell finds by it.
 */
export const hottextTag = "qti-hottext";

/**
 * The tag of the marker a selectable hottext holds, which no QTI document writes: the model adds
 * it to each hottext it reads, as its first child, so a hottext with no template visibility holds
 * it and one with a template visibility holds it inside a template inline that the template value
 * shows or hides. `redact` reads it into each hottext's part, and the payload's content still holds
 * it, which the server shell never writes.
 */
const controlTag = "qti-hottext-control";

/**
 * The model node of a `qti-hottext-interaction` (Q-11), bound to an identifier response of single
 * or multiple cardinality: the fields every module's node shares, `max-choices` and `min-choices`
 * as counts held exactly (reading 46), the author's messages for the two bounds, the Prompt, and
 * the block content with every hottext in place, each holding the marker of a selectable choice
 * ({@link controlTag}).
 *
 * @template L The level of its content.
 */
interface HottextInteraction<L extends Level = ModelLevel> extends ModuleInteraction<"hottext"> {
  /**
   * The bound response's cardinality.
   */
  readonly cardinality: "multiple" | "single";
  /**
   * The author's `class`, as written, none when absent.
   */
  readonly class: Option.Option<string>;
  /**
   * The interaction's block content after its Prompt: the author's markup, with each `qti-hottext`
   * left in place as an element that holds its own content after its marker.
   */
  readonly content: Nodes<L>;
  /**
   * `max-choices`, 1 when absent: a count, 0 to 2^63-1, held exactly (reading 46). 0 limits
   * nothing.
   */
  readonly maxChoices: bigint;
  /**
   * The author's replacements for the too-many and too-few messages,
   * `data-max-selections-message` and `data-min-selections-message`.
   */
  readonly messages: { readonly max: Option.Option<string>; readonly min: Option.Option<string> };
  /**
   * `min-choices`, 0 when absent: a count, 0 to 2^63-1, held exactly (reading 46).
   */
  readonly minChoices: bigint;
  /**
   * The content of the interaction's first `qti-prompt`, none when it has none.
   */
  readonly prompt: Option.Option<Nodes<L>>;
}

/**
 * A Hot Text's model node at each level.
 */
interface HottextByLevel extends ByLevel {
  readonly node: HottextInteraction<this["level"]>;
}

/**
 * The payload node of a Hot Text (Q-11, the kind `hottext`): what its `redact` copies of the model
 * node, its Prompt and content as payload nodes, and what it reads of the view through the kit, so
 * the server shell sees the payload and none of the view beyond it.
 */
interface HottextPayload {
  /**
   * The author's `aria-label`, which names the group when it has no Prompt.
   */
  readonly ariaLabel: Option.Option<string>;
  /**
   * The author's `aria-labelledby`, the ids as written, which names the group when it has no
   * Prompt.
   */
  readonly ariaLabelledby: Option.Option<string>;
  /**
   * The author's `class`, as written, none when absent.
   */
  readonly class: Option.Option<string>;
  /**
   * The block content, its hottexts in place as `qti-hottext` elements, each one's part in
   * {@link hottexts}.
   */
  readonly content: Nodes<RedactedLevel>;
  /**
   * The response its island writes, as its declaration types it: an `identifier` response of the
   * Hot Text's cardinality.
   */
  readonly declared: Declared<"identifier", "multiple" | "single">;
  /**
   * Each hottext of the content, at any depth, by its `qti-hottext` element's path: what it stands
   * as in the passage, a choice or plain text ({@link HottextPart}).
   */
  readonly hottexts: ReadonlyMap<string, HottextPart>;
  /**
   * `max-choices` as the model holds it: 0 limits nothing.
   */
  readonly maxChoices: bigint;
  readonly prompt: Option.Option<Nodes<RedactedLevel>>;
  /**
   * The identifier of the response it binds.
   */
  readonly response: string;
  /**
   * The identifiers the Controls show checked: the view's values.
   */
  readonly restore: readonly string[];
}

/**
 * One hottext of a Hot Text's passage, as the page shows it: a `choice` the child may pick, its
 * `identifier` the value its pick posts and its `catalog` the one its `qti-hottext` references
 * (the body walk's `BodyElement.catalog`), or `plain` text, "simply part of the surrounding
 * material" (QTI 3.0 information model 5.65), for a hottext its template hides. `passage` is the
 * nodes it stands as in either case: its own content, inside a `span` that carries its authored
 * attributes but `identifier` when it has any, so a `class`, a `lang` or an `id` stays where the
 * author wrote it.
 */
export type HottextPart =
  | (ReferencingChoice & {
      readonly kind: "choice";
      readonly passage: Nodes<RedactedLevel>;
    })
  | { readonly kind: "plain"; readonly passage: Nodes<RedactedLevel> };

/**
 * Give the marker a hottext that writes an identifier holds: the marker itself, or, for a hottext
 * that names a template variable, a template inline holding it, which the redaction shows or hides
 * by the template value as it does any template inline.
 *
 * @param hottext The hottext element.
 * @param identifier Its identifier, read as an identifier attribute is.
 * @param identifierOf The reader of an identifier attribute's value.
 * @returns The marker, or the template inline around it.
 */
const controlOf = (
  hottext: BodyElement,
  identifier: string,
  identifierOf: (written: string) => string,
): BodyNode => {
  const path = `${hottext.path}/${controlTag}`;
  const marker: BodyElement = {
    attributes: [],
    children: [],
    kind: "element",
    path,
    tag: controlTag,
  };
  const visibility: Option.Option<TemplateVisibility> = Option.map(
    bodyAttributeOf(hottext.attributes, "template-identifier"),
    (written) => ({
      showHide: Option.contains(bodyAttributeOf(hottext.attributes, "show-hide"), "hide")
        ? "hide"
        : "show",
      templateIdentifier: identifierOf(written),
    }),
  );

  return Option.match(visibility, {
    onNone: (): BodyNode => marker,
    onSome: (templateVisibility): TemplateContent => ({
      content: [marker],
      identifier,
      kind: "template-inline",
      path,
      responses: [],
      templateVisibility,
    }),
  });
};

/**
 * Mark one hottext: put the marker first among its children, in a template inline when the hottext
 * names a template variable. A hottext that writes no `identifier`, which the database refuses
 * first, has no value to post, so it holds no marker and is never a choice.
 *
 * @param hottext The hottext element, its children already marked.
 * @param identifierOf The reader of an identifier attribute's value.
 * @returns The hottext without `template-identifier` and `show-hide`, holding the marker first
 *   when it writes an identifier.
 */
const marked = (hottext: BodyElement, identifierOf: (written: string) => string): BodyElement => {
  const attributes = hottext.attributes.filter(
    ({ name }) => name !== "template-identifier" && name !== "show-hide",
  );

  return Option.match(bodyAttributeOf(hottext.attributes, "identifier"), {
    onNone: () => ({ ...hottext, attributes }),
    onSome: (identifier) => ({
      ...hottext,
      attributes,
      children: [controlOf(hottext, identifierOf(identifier), identifierOf), ...hottext.children],
    }),
  });
};

/**
 * Add the marker to each hottext among body nodes, at any depth, so the model holds which hottexts
 * are selectable: a hottext with no `template-identifier` holds the marker as its first child, one
 * with it holds the marker inside a template inline that carries the visibility, and the hottext
 * loses both attributes, which the redaction settles and the page never knows.
 *
 * @param nodes The content the body walk read.
 * @param identifierOf The reader of an identifier attribute's value.
 * @returns The same nodes, each hottext marked.
 */
const withMarkers = (
  nodes: readonly BodyNode[],
  identifierOf: (written: string) => string,
): readonly BodyNode[] =>
  nodes.map((node): BodyNode => {
    if (node.kind === "template-block" || node.kind === "template-inline") {
      return { ...node, content: withMarkers(node.content, identifierOf) };
    }

    if (node.kind !== "element") {
      return node;
    }

    const children = withMarkers(node.children, identifierOf);

    return node.tag === hottextTag
      ? marked({ ...node, children }, identifierOf)
      : { ...node, children };
  });

/**
 * Read one hottext of the redacted content into its part: a choice when it holds the marker, which
 * the redaction keeps only where its template shows it, and writes an identifier; else plain text.
 *
 * @param hottext The `qti-hottext` element, as the redaction left it.
 * @returns Its part.
 */
const partOf = (hottext: BodyElement<RedactedLevel>): HottextPart => {
  const content = hottext.children.filter(
    (child) => !(child.kind === "element" && child.tag === controlTag),
  );
  const attributes = hottext.attributes.filter(({ name }) => name !== "identifier");
  const passage: Nodes<RedactedLevel> =
    attributes.length === 0
      ? content
      : [{ attributes, children: content, kind: "element", path: hottext.path, tag: "span" }];

  return Option.match(
    bodyAttributeOf(hottext.attributes, "identifier").pipe(
      Option.filter(() => content.length < hottext.children.length),
    ),
    {
      onNone: (): HottextPart => ({ kind: "plain", passage }),
      onSome: (identifier): HottextPart => ({
        catalog: Option.fromUndefinedOr(hottext.catalog),
        identifier,
        kind: "choice",
        passage,
      }),
    },
  );
};

/**
 * Collect the part of every hottext of the redacted content, by its element's path, at any depth:
 * below every element, and inside a hottext too, whose nested hottext QTI admits nowhere ("It must
 * not contain any nested interactions or other hottext areas", 5.65) and the page writes as text.
 *
 * @param nodes The redacted content.
 * @returns Each hottext's path and part, in document order.
 */
const partsIn = (nodes: Nodes<RedactedLevel>): readonly (readonly [string, HottextPart])[] =>
  nodes.flatMap((node): readonly (readonly [string, HottextPart])[] => {
    if (node.kind !== "element") {
      return [];
    }

    return node.tag === hottextTag
      ? [[node.path, partOf(node)], ...partsIn(node.children)]
      : partsIn(node.children);
  });

/**
 * Copy the Hot Text's model node into its payload node: its Prompt and content through the kit, and
 * what it shows of the view, baked in since the server shell sees the payload and none of the view
 * beyond it.
 *
 * `restore` holds the view's identifiers, which the module shows as they are.
 *
 * @param interaction The Hot Text's model node.
 * @param kit The payload's copy of body nodes and the view's facts about the interaction.
 * @returns Its payload node.
 */
const redact = (
  interaction: HottextInteraction<RedactedLevel>,
  kit: RedactKit,
): HottextPayload => ({
  ariaLabel: interaction.ariaLabel,
  ariaLabelledby: interaction.ariaLabelledby,
  class: interaction.class,
  content: interaction.content,
  declared: {
    baseType: "identifier",
    cardinality: interaction.cardinality,
    identifier: interaction.response,
  },
  hottexts: new Map(partsIn(interaction.content)),
  maxChoices: interaction.maxChoices,
  prompt: interaction.prompt,
  response: interaction.response,
  restore: kit.shown(interaction.response).map(format),
});

/**
 * Give the regions of the Hot Text's own content, in document order: its Prompt, then its content.
 * A hottext's content sits inside the content region, so no region of its own names a choice.
 *
 * @template L The level of its content.
 * @param interaction The Hot Text's model node.
 * @returns The regions.
 */
const regions = <L extends Level>(
  interaction: HottextInteraction<L>,
): readonly OwnRegion<HottextInteraction<L>, BodyNode<L>>[] => [
  ...promptRegion(interaction),
  contentRegion<HottextInteraction<L>, BodyNode<L>>(interaction.content, (each, content) => ({
    ...each,
    content,
  })),
];

/**
 * The type of {@link hottextModule}.
 */
type HottextModule = InteractionModule<"hottext", HottextByLevel, HottextPayload>;

/**
 * The Hot Text module (Q-11): the interaction module of the kind `hottext`, which reads and binds
 * `qti-hottext-interaction`; the server shell renders its payload node.
 */
export const hottextModule: HottextModule = {
  binding,
  element,
  feature,
  /**
   * The Hot Text with its Prompt's and its content emptied.
   */
  hollow: (interaction) => ({
    ...interaction,
    content: [],
    prompt: interaction.prompt.pipe(Option.map(() => [])),
  }),
  kind: "hottext",
  /**
   * Read a `qti-hottext-interaction` through the kit: its binding, `max-choices` and
   * `min-choices`, the author's messages, its Prompt, and its content with `qti-hottext` let
   * through as the module's own element, each hottext then marked ({@link withMarkers}).
   *
   * The body walk has bound it to an identifier response of single or multiple cardinality
   * ({@link binding}). Reading 38 gives the
   * module the hottexts of its own content alone: a hottext outside it is read by the body walk as
   * the notice `qti-hottext`.
   */
  parse: (source, { bound, path, read }) => {
    const { cardinality } = boundIn(binding, bound);
    read.markElement(source);

    const maxChoices = read.countAttribute(source, "max-choices");
    const minChoices = read.countAttribute(source, "min-choices");
    const prompt = read.content(source, "qti-prompt");
    const [firstPrompt] = read.childrenNamed(source, "qti-prompt");
    const content = read.nodes(source, {
      children: source.children.filter((child) => child !== firstPrompt),
      own: [hottextTag],
    });

    return {
      ariaLabel: read.valueOf(source, "aria-label"),
      ariaLabelledby: read.valueOf(source, "aria-labelledby"),
      cardinality,
      class: read.valueOf(source, "class"),
      content: withMarkers(content, read.identifierOf),
      kind: "hottext" as const,
      maxChoices: Option.getOrElse(maxChoices, () => 1n),
      messages: {
        max: read.valueOf(source, "data-max-selections-message"),
        min: read.valueOf(source, "data-min-selections-message"),
      },
      minChoices: Option.getOrElse(minChoices, () => 0n),
      path,
      prompt,
      response: bound.identifier,
    };
  },
  redact,
  regions,
};
