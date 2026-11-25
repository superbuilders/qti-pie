/**
 * Interactions and their bindings: the O3 overlays (plan §1.7; the W5 amendment's C15, C17, C18 and
 * C22 and its D entry for Q5.09; the tier-1 addendum's G-match, G-parse and "Text in keys").
 *
 * Every attribute an O3 law reads is copied once, from one selection of `Attribute`, into
 * {@link InteractionAttribute}, keyed by its element's place and its name, with its lexical form
 * and its value, the form collapsed (`Text.collapse`, XML Schema Part 2 §4.3.6). Every
 * identifier, count, number and flag these laws read is an atomic XSD type whose whiteSpace is
 * `collapse` (spec reading 7: "An attribute the XSD itself types ... is read as the XSD reads it,
 * outer whitespace collapsed"), so the value is the form its type's lexical space is read on, the
 * one a declared name's `value` holds. The copy claims no type of it: a value with
 * whitespace inside (`max-choices="1 2"`) is in no such type's lexical space, and its value domain
 * alone refuses it. One selection of `Attribute` costs one UNIQUE on it (the addendum's "Text in
 * keys"), so the overlays below read `InteractionAttribute` and never `Attribute`.
 *
 * Every row is keyed by QTI's own identity: an element by its place,
 * `(package, path, start)`, its package's name, its document's path in the package
 * and its pre-order position there; a link inside one document by the target's `start` alone
 * (`parent`, `nearest`, `declaration`); and an instance of an assembly by `(package, assembly,
 * instance)`, its assembly's head document's path and its position in that assembly's instance
 * tree (`Instance`). A placed row reads its declaration in the assembly's head document, at
 * `(package, assembly, declaration)`, and names its element in the instance's document, `path`, at
 * `start`; the instance names its document, so a placed row's key holds no `path`.
 *
 * - {@link Interaction}: every interaction element, in every document, owning its choices'
 *   {@link ChoiceInteraction} rows as a counted family (C15), its gaps those of them whose node is
 *   a gap, which "Binding cardinality" reads through a query (spec reading 169). A stimulus body
 *   holds interactions too (information model §5.137, StimulusBody: "The stimulus body contains the
 *   text, graphics, media objects and interactions"), so the item-only laws read
 *   {@link BoundVariable}.
 * - An interaction's binding: its read `response-identifier` (`InteractionAttribute`), its optional
 *   part, which only an interaction that writes one has, and AL3 refuses one that writes none.
 * - {@link PciModuleForm}: each form in which a portable custom interaction names its module, its
 *   `module` attribute and its `qti-interaction-modules` child, counted by
 *   `Interaction.moduleForms` so that "PCI module source" asks for at least one (§5.106.2, R10-a).
 * - {@link BoundVariable}: each attribute by which an item's interaction binds a response variable,
 *   its `response-identifier` and its `string-identifier` (§5.48.2, §5.162.3: "binding the
 *   interaction to a second response variable (of base-type string)"), which names a response
 *   declaration of the item, whatever its cardinality spells (spec reading 159): "Binding declared"
 *   joins the binding to the item's `NamedDeclaration` by its name, a rule over a query
 *   (`#pantry/qti/overlay-queries/reference.ts`). The fit laws read the declaration's cardinality
 *   and base type through the same join, which a declaration with no cardinality leaves the binding
 *   none of, so they judge only a variable whose cardinality spells a code. `key(document,
 *   identifier)` is "Binding unique" (reading 92: "Each response variable declared may be bound to
 *   one and only one interaction"), so an interaction whose string identifier is its response
 *   identifier, the old `string-identifier-distinct`, breaks that key.
 * - {@link Choice}: every choice, with its identifier distinct among its document's choices of its
 *   kind, and its {@link ChoiceInteraction}, its nearest interaction (N8) (§5.132.1 and the other
 *   choice classes': "This identifier must not be used by any other choice or item variable"; spec
 *   reading 104: the item is the scope, as §7.16 reads an identifier, "a logical reference to
 *   another object in the item, such as an itemVariable or choice"). Across the classes, a key over
 *   the query `ChoiceOrHottext` (`#pantry/qti/queries.ts`) holds it distinct among every choice and
 *   hottext of its document.
 * - {@link Hottext}: every hottext, its nearest interaction's kind, so a hottext interaction's
 *   hottexts are its choices; elsewhere a hottext is valid and owned by none (reading 38). Its
 *   identifier is distinct among its document's hottexts (§5.65.1, reading 104), and among its
 *   document's choices by that key.
 * - **choice names**, rules over queries (`#pantry/qti/queries.ts`): each class's sentence bars its
 *   own noun, and a simple, inline, hotspot or simple associable choice bears a name no other
 *   choice or hottext of its document or its assembly bears ("Choice identifier key"), a gap being
 *   no choice; and a choice's identifier is no item variable's: no declaration's of its document,
 *   and in an item no built-in variable's (reading 104, "Choice not variable").
 * - The hotspot choices and associable hotspots: their read `shape`, which the default-hotspot laws
 *   read beside their node's element rank and their parent's element count (reading 80).
 * - {@link CountBound}: every element whose counts `ChoiceBound` pairs, and whether it writes each;
 *   its least and most, where each has a value, written as an integer or its XSD default, typed by
 *   G-parse ({@link LeastCount}, {@link MostCount}; a bound both of whose counts have one is the
 *   two rows together, which "Choice bounds" reads through a query); "Choice bounds" (readings 18
 *   and 76) and "Binding cardinality" (reading 92) read the values, and `max-strings-required`
 *   (reading 19) whether `max-strings` is written.
 * - A slider's two bounds (reading 9, the Schematron's 14Ba) and an element's two ARIA range bounds
 *   (§5.2.31: "Authors MUST ensure the value of 'aria-valuemax' is greater than or equal to the
 *   value of 'aria-valuemin'"), each pair read from {@link InteractionAttribute} through a query
 *   (`#pantry/qti/overlay-queries/interaction.ts`); and {@link ItemMode}, an item's `adaptive`,
 *   which "AdaptiveFeedback" reads (§5.49, §5.52: "A feedback element that forms part of a
 *   Non-adaptive Item must not contain an interaction object, either directly or indirectly").
 * - The content references: {@link FeedbackRef}, {@link TemplateRef}, {@link PrintedVariableRef} (a
 *   printed variable's name, and its `base` or `index` where that names a variable) and
 *   {@link ContextRef}, each naming a declaration of a kind `ContentReference` allows, its
 *   document's `NamedDeclaration` of its name, whatever its cardinality spells (spec reading 159),
 *   read by a rule over a query (`#pantry/qti/overlay-queries/reference.ts`), or a built-in
 *   variable that stands as one (reading 77), in an item's own declarations, each built-in one its
 *   root holds (spec reading 29), so each reference carries the root kind it resolves under. A
 *   reference that names neither is refused by its law (never a sentinel).
 * - An included fragment's feedback, printed, template and context variables
 *   ({@link FragmentFeedbackName}, {@link FragmentPrintedName}, {@link FragmentTemplateName},
 *   {@link FragmentContextName}) resolve once per placement in each item that includes it (spec
 *   reading 117: {@link FragmentFeedbackRef}, {@link FragmentPrintedRef},
 *   {@link FragmentTemplateRef}, {@link FragmentContextRef}), each resolved by its name in its
 *   assembly's item's declarations, as an own reference is in its document's, every one of them
 *   under each placement ({@link FragmentScope}, whose counts of resolutions are its document's
 *   counts of references, {@link ReferringDocument}): a fragment declares nothing.
 *
 * A row a builder gets wrong is refused, never accepted: each overlay's element is a node of its
 * kinds, and each value that relaxes a law (a count written, an item adaptive) is proved both ways.
 * An overlay holds no copy of its node's kind, parent or nearest interaction (decision
 * S3): a law that reads one reads `Node` through a query, as a rule over a query
 * (`#pantry/qti/overlay-queries/interaction.ts`).
 *
 * Every check is named by its oracle law (`#pantry/test/oracle.ts` `LawName`) with spaces written
 * as underscores, since a check's name is an identifier; no law name holds an underscore. Every
 * other law is a key or a containment, which grizzle names by its sides (C22).
 *
 * @see {@link https://www.imsglobal.org/spec/qti/v3p0/info#Main2p4 | QTI 3.0 information model, §2.4 Interactions}
 */
import {
  Bits,
  check,
  closedId,
  contained,
  counted,
  Crypto,
  drawn,
  fin,
  generated,
  key,
  law,
  lexicalForm,
  Logic,
  mirrors,
  on,
  pg,
  relation,
  select,
  sha256,
  Text,
  Type,
} from "@bjornpagen/grizzle";
import type { RowScalars } from "@bjornpagen/grizzle";
import { pipe, Record as Rec } from "effect";
import { booleanTrue } from "#pantry/grammar/domains.ts";
import {
  AttributeName,
  BindingFit,
  BuiltInVariable,
  ChoiceBound,
  ChoiceCount,
  ContentReference,
  Enters,
  NodeKind,
  RecordBindingFit,
  anyText,
  interactionKinds,
  natural,
} from "#pantry/grammar/install.ts";
import { Attribute, namedOn } from "#pantry/qti/attributes.ts";
import { Document } from "#pantry/qti/chardata.ts";
import { namePattern } from "#pantry/qti/declarations.ts";
import { EntryPath, matchedText, PackageName, QtiIdentifier } from "#pantry/qti/limits.ts";
import { Node } from "#pantry/qti/node.ts";
import { Instance, itemInstances } from "#pantry/qti/tests.ts";

import {
  adaptiveName,
  ariaNames,
  bindingAttributes,
  choiceKinds,
  hottextKind,
  modulesKind,
  pciKind,
  readAttributes,
  references,
  referringRoots,
} from "#pantry/vocab/terms/interactions.ts";
import { itemKind } from "#pantry/vocab/terms/tests.ts";
import { declared } from "#pantry/qti/law-entries.ts";
import { entryOf } from "#pantry/vocab/laws.ts";

/**
 * A `NodeKind` handle.
 */
type Kind = (typeof NodeKind.handles)[number];

/**
 * An `AttributeName` handle.
 */
type Name = (typeof AttributeName.handles)[number];

/**
 * The hottext interaction's kind: the one interaction whose hottexts are its choices.
 */
export const hottextInteraction = "qti-hottext-interaction" satisfies Kind;

/**
 * The graphic gap match interaction, whose hotspots have no default (reading 80, §5.60.9: "The
 * default hotspot must not be defined").
 */
export const graphicGapMatch = "qti-graphic-gap-match-interaction" satisfies Kind;

/**
 * The `shape` of a default hotspot, the area that holds every point no other area holds, as
 * `ShapeDType` spells it.
 */
export const defaultArea = "default";

/**
 * A feedback block, the kind whose `Enters` row is the feedback flag `fb` alone, which every
 * feedback element (`qti-feedback-block`, its template form, `qti-feedback-inline`) enters.
 */
const feedbackKind = "qti-feedback-block" satisfies Kind;

/**
 * The interactions whose response cardinality their most count decides, spec reading 92: "If
 * max-choices is greater than 1 (or 0) then the interaction must be bound to a response with
 * multiple cardinality", of the `max-choices` of the choice (§5.30.2), hottext (§5.66.1), hotspot
 * (§5.68.2), position object (§5.107.3) and select point (§5.128.2) interactions, and the same
 * sentence of `max-associations` on the associate (§5.8.2), gap match (§5.57.3), graphic associate
 * (§5.59.2), graphic gap match (§5.60.2) and match (§5.89.2) interactions. A gap match's gaps
 * decide it too ({@link gapMatchKind}, spec reading 169).
 */
export const cardinalityKinds = [
  "qti-choice-interaction",
  "qti-hottext-interaction",
  "qti-hotspot-interaction",
  "qti-position-object-interaction",
  "qti-select-point-interaction",
  "qti-associate-interaction",
  "qti-gap-match-interaction",
  "qti-graphic-associate-interaction",
  "qti-graphic-gap-match-interaction",
  "qti-match-interaction",
] as const satisfies readonly Kind[];

/**
 * The gap match interaction's kind, whose response cardinality its count of gaps decides beside its
 * most, spec reading 169: "The GapMatchInteraction must be bound to a response variable with
 * base-type directedPair and either single or multiple cardinality, depending on the number of
 * gaps" (§5.57). Each gap takes a pair of its own and a single response holds one pair, so a gap
 * match with two or more gaps binds a response of multiple cardinality.
 */
export const gapMatchKind = "qti-gap-match-interaction" satisfies Kind;

/**
 * The interactions of any response type: those neither `BindingFit` nor `RecordBindingFit` names,
 * the custom, portable custom and order interactions, whose class descriptions (§5.36, §5.106 and
 * §5.97) state no binding, so each binds a declared response variable of any base type and
 * cardinality (reading 75 binds them all; spec reading 172 the order interaction).
 */
export const anyTypeKinds: readonly Kind[] = interactionKinds.filter(
  (kind) =>
    !BindingFit.rows.some((row) => row.kind === kind) &&
    !RecordBindingFit.rows.some((row) => row.kind === kind),
);

/**
 * The kinds whose counts `ChoiceBound` pairs, in its row order.
 */
export const boundKinds: readonly Kind[] = ChoiceBound.rows.map(({ kind }) => kind);

/**
 * The attributes of the least counts `ChoiceBound` names, each once.
 */
export const minNames: readonly Name[] = [...new Set(ChoiceBound.rows.map(({ min }) => min))];

/**
 * The attributes of the most counts `ChoiceBound` names, each once.
 */
export const maxNames: readonly Name[] = [...new Set(ChoiceBound.rows.map(({ max }) => max))];

/**
 * The kinds whose choices bound both of their counts (reading 18), `ChoiceCount`'s keys.
 */
export const choiceCountKinds: readonly Kind[] = ChoiceCount.rows.map(({ kind }) => kind);

/**
 * The portable custom interaction's template variable kind (§7.38.1), the one element that names a
 * template variable without stating its type: "Template variable type" leaves it free.
 */
export const templateVariableKind = "qti-template-variable" satisfies Kind;

/**
 * An attribute an O3 law reads, keyed by its element's place (`package`, `path`, `start`) and its
 * name: the element's kind and its document's root kind, the lexical form as written (C18's copy),
 * and `value`, that form collapsed (XML Schema Part 2, §4.3.6), which the database derives,
 * whatever the form: a value with whitespace inside is held as its type's whiteSpace reads it, and
 * is no value of its type, which its value domain refuses alone.
 *
 * The lexical form and its collapse are `matchedText` (`#pantry/qti/limits.ts`), of any length a
 * query's match reads, since QTI bounds no attribute's value; `lexicalDigest`, the form's SHA-256,
 * is what the copy's containment from `Attribute` holds, `Attribute.lexicalDigest`'s, so no key
 * holds the form itself, and `valueDigest`, the collapse's, is what a law that finds an attribute
 * by its value reads. A parse that reads
 * a value bounds its own operand
 * where it reads it ("Aria value range", `#pantry/qti/overlay-queries/interaction.ts`), so no
 * identifier O3 reads is held to a decimal's bound.
 */
export const InteractionAttribute = law(
  entryOf("E1 derived"),
  relation.generated(
    "InteractionAttribute",
    {
      kind: closedId(NodeKind),
      lexical: matchedText,
      name: closedId(AttributeName),
      package: PackageName,
      path: EntryPath,
      rootKind: closedId(NodeKind),
      start: natural,
    },
    ["package", "path", "start", "name"],
    (v) => {
      const value = Text.collapse(v.lexical);

      return {
        lexicalDigest: law(entryOf("E1 derived"), generated(sha256, Crypto.sha256(v.lexical))),
        value: law(entryOf("E1 derived"), generated(matchedText, value)),
        valueDigest: law(entryOf("E1 derived"), generated(sha256, Crypto.sha256(value))),
      };
    },
  ),
);

/**
 * An interaction element, in any document, keyed by its place: its count of
 * {@link ChoiceInteraction} rows, the choices whose nearest interaction it is, which the family
 * draws, and its count of {@link PciModuleForm} rows, the forms of a portable custom interaction's
 * module, which the second family draws. Every interaction has one, whether or not it
 * writes a `response-identifier`, so its choices' family always has its owner and a missing
 * response identifier is AL3's alone.
 */
export const Interaction = law(
  entryOf("E1 derived"),
  relation(
    "Interaction",
    {
      choices: drawn(natural),
      moduleForms: drawn(natural),
      package: PackageName,
      path: EntryPath,
      start: natural,
    },
    ["package", "path", "start"],
  ),
);

/**
 * One binding of an item's interaction to a response variable, keyed by the interaction's place
 * and the attribute that binds it: `response-identifier`, or `string-identifier`'s second variable,
 * where its value names a variable, an NCName ({@link namePattern}). Any other value binds nothing,
 * and its value domain refuses it alone (spec reading 152).
 *
 * Its fields, every one written by the host:
 *
 * - `identifier`, the attribute's value collapsed;
 * - `adaptive`, whether its item is adaptive, copied from {@link ItemMode}.
 *
 * Its interaction's kind is its node's, which the laws read through `Node`
 * (`#pantry/qti/overlay-queries/interaction.ts`).
 *
 * The variable it binds is the item's response declaration of its name, which "Binding declared"
 * reads through a query (`#pantry/qti/overlay-queries/reference.ts`).
 */
export const BoundVariable = law(
  entryOf("E1 derived"),
  relation(
    "BoundVariable",
    {
      adaptive: pg.boolean,
      attribute: closedId(AttributeName),
      identifier: QtiIdentifier,
      package: PackageName,
      path: EntryPath,
      start: natural,
    },
    ["package", "path", "start", "attribute"],
  ),
);

/**
 * One attribute by which an interaction of any document binds a response variable, keyed by the
 * interaction's place and the attribute (spec reading 117), where its value names a variable:
 * `identifier`, the attribute's value collapsed. A
 * fragment's interactions bind no variable of their own document, which declares none, but one of
 * each item that places the fragment ({@link PlacedBinding}); its rows count as
 * `Document.bindings`.
 *
 * The import writes its rows where its form names something (`namedBy` of
 * `#pantry/import/names.ts`, which lists every such relation), until it is a query over
 * `Attribute`.
 */
export const BindingName = law(
  entryOf("E1 derived"),
  relation(
    "BindingName",
    {
      attribute: closedId(AttributeName),
      identifier: QtiIdentifier,
      package: PackageName,
      path: EntryPath,
      start: natural,
    },
    ["package", "path", "start", "attribute"],
  ),
);

/**
 * One binding of an instance of an item's assembly (Q5.13's `Instance`, spec reading 117), keyed by
 * the instance (`package`, `assembly`, `instance`), the interaction's `start` in the instance's
 * document and the attribute: the item's own bindings under its root instance, and an included
 * fragment's under each instance that places it, so each placement binds the item's responses as
 * its merged document would ("interactions included from fragments must be correctly bound to
 * response variables declared in the items", information model §2.12). The instance names its
 * document, so `path` is no part of the key.
 *
 * Its fields, every one written by the host: `package`, `assembly` and `instance`, the instance's,
 * and `path`, its document's; `start`, `attribute` and `identifier`, its {@link BindingName}'s; and
 * `adaptive`, whether the item is adaptive. The variable it binds is the assembly's item's response
 * declaration of its name, read as an own binding's is.
 */
export const PlacedBinding = law(
  entryOf("E1 derived"),
  relation(
    "PlacedBinding",
    {
      adaptive: pg.boolean,
      assembly: EntryPath,
      attribute: closedId(AttributeName),
      identifier: QtiIdentifier,
      instance: natural,
      package: PackageName,
      path: EntryPath,
      start: natural,
    },
    ["package", "assembly", "instance", "start", "attribute"],
  ),
);

/**
 * One choice of an instance of an assembly (Q5.13's `Instance`, spec reading 117), keyed by the
 * instance and the choice's `start`: a {@link Choice} of the instance's document, `path`, under the
 * assembly, so an included fragment's choices count among its item's ("Choice identifier key" over
 * the assembly: "This identifier must not be used by any other choice", information model
 * §5.132.1, read across the nine choice classes by spec reading 104, so a key over the query
 * `PlacedChoiceOrHottext`, `#pantry/qti/queries.ts`, holds a name to one of them), and a fragment
 * placed twice in one item holds its choices twice. Its kind is its choice's node's, so "Choice
 * identifier key" keys an assembly's choices of one kind by the table itself.
 */
export const PlacedChoice = law(
  entryOf("E1 derived"),
  relation(
    "PlacedChoice",
    {
      assembly: EntryPath,
      identifier: QtiIdentifier,
      instance: natural,
      kind: closedId(NodeKind),
      package: PackageName,
      path: EntryPath,
      start: natural,
    },
    ["package", "assembly", "instance", "start"],
  ),
);

/**
 * One hottext of an instance of an assembly, keyed by the instance and the hottext's `start`: a
 * {@link Hottext} of the instance's document, under the assembly, as {@link PlacedChoice} is.
 */
export const PlacedHottext = law(
  entryOf("E1 derived"),
  relation(
    "PlacedHottext",
    {
      assembly: EntryPath,
      identifier: QtiIdentifier,
      instance: natural,
      package: PackageName,
      path: EntryPath,
      start: natural,
    },
    ["package", "assembly", "instance", "start"],
  ),
);

/**
 * Each document's binding attributes, counted by `Document.bindings`.
 */
const bindingNameFamily = counted(on(BindingName, "package", "path"), fin(Document, "bindings"));

/**
 * Each item instance's bindings, counted by `Instance.bindings`, its document's count.
 */
const placedBindingFamily = counted(
  on(PlacedBinding, "package", "assembly", "instance"),
  fin(Instance, "bindings"),
);

/**
 * A choice, keyed by its place: its identifier collapsed, and its kind, its node's ("E1 derived"
 * holds it there), stated beside the identifier so "Choice identifier key" keys a document's
 * choices of one kind by the table itself. Its nearest interaction is its
 * {@link ChoiceInteraction}'s, the node's nearest, which the laws read through `Node`
 * (`#pantry/qti/overlay-queries/interaction.ts`). It owns no sequence (C15).
 */
export const Choice = law(
  entryOf("E1 derived"),
  relation(
    "Choice",
    {
      identifier: QtiIdentifier,
      kind: closedId(NodeKind),
      package: PackageName,
      path: EntryPath,
      start: natural,
    },
    ["package", "path", "start"],
  ),
);

/**
 * A choice's interaction, keyed by the choice's place: its nearest interaction (N8), the
 * {@link Interaction} that counts it, at `(package, interactionPath, interaction)`. Only a choice an
 * interaction encloses, in its own document or through the include that places its fragment, has a
 * row; every choice must ("N8 nearest"), and a gap that no gap-match encloses breaks N6 first. It
 * owns no sequence (C15).
 *
 * `interaction` is the choice's `nearest`, a position; `interactionPath` is the document it is a
 * position in: the choice's own `path` where an interaction of its document encloses it, else its
 * document's context (`Document.contextPath` and `contextNearest`), the interaction its fragment's
 * include stands in (spec reading 117).
 */
export const ChoiceInteraction = law(
  entryOf("E1 derived"),
  relation(
    "ChoiceInteraction",
    {
      interaction: natural,
      interactionPath: EntryPath,
      package: PackageName,
      path: EntryPath,
      start: natural,
    },
    ["package", "path", "start"],
  ),
);

/**
 * Each interaction's choices, counted by `Interaction.choices` (C15): a flat row whose group,
 * `interaction`, names its owner.
 */
const choiceFamily = counted(
  on(ChoiceInteraction, "package", "interactionPath", "interaction"),
  fin(Interaction, "choices"),
);

/**
 * One form in which a portable custom interaction names its module, keyed by the interaction's
 * place and the form: `element` is false for the `module` attribute and true for the
 * `qti-interaction-modules` child (information model §5.106.2: "If this characteristic is provided
 * the qti-interaction-modules child attribute is not required, if omitted then the modules child
 * element is mandatory", R10-a). A form a PCI does not write has no row; "PCI module source" counts
 * the rows.
 *
 * Its rows are copies of the tree, both ways: an attribute form of each `module` attribute of a
 * portable custom interaction, an element form of each `qti-interaction-modules` child of one.
 */
export const PciModuleForm = law(
  entryOf("E1 derived"),
  relation(
    "PciModuleForm",
    { element: pg.boolean, package: PackageName, path: EntryPath, start: natural },
    ["package", "path", "start", "element"],
  ),
);

/**
 * Each interaction's module forms, counted by `Interaction.moduleForms`: a flat row whose group,
 * its place, names its owner.
 */
const pciModuleFamily = counted(
  on(PciModuleForm, "package", "path", "start"),
  fin(Interaction, "moduleForms"),
);

/**
 * The `module` attribute of a portable custom interaction: the attribute form of its module.
 */
const moduleAttributes = select(Attribute, (a) =>
  a.and(a.eq(a.kind, pciKind), a.eq(a.name, "module")),
);

/**
 * The `qti-interaction-modules` children of a portable custom interaction, by their parent: the
 * element form of its module.
 */
const moduleElements = select(Node, (n) =>
  n.and(n.eq(n.kind, modulesKind), n.eq(n.parentKind, pciKind)),
);

/**
 * The hottexts, each of which has its {@link Hottext} where its identifier names something.
 */
const hottextNodes = select(Node, (n) => n.eq(n.kind, hottextKind));

/**
 * The attribute forms among the {@link PciModuleForm} rows.
 */
const attributeForms = select(PciModuleForm, (f) => f.eq(f.element, false));

/**
 * The element forms among the {@link PciModuleForm} rows.
 */
const elementForms = select(PciModuleForm, (f) => f.eq(f.element, true));

/**
 * A hottext, keyed by its place: its identifier collapsed. Its nearest interaction, that
 * interaction's kind and the document it is a position in are its node's (`nearest`,
 * `nearestKind`, `nearestPath`), which the laws read through `Node`
 * (`#pantry/qti/overlay-queries/interaction.ts`).
 */
export const Hottext = law(
  entryOf("E1 derived"),
  relation(
    "Hottext",
    {
      identifier: QtiIdentifier,
      package: PackageName,
      path: EntryPath,
      start: natural,
    },
    ["package", "path", "start"],
  ),
);

/**
 * Each document's choices, counted by `Document.choices`.
 */
const documentChoiceFamily = counted(on(Choice, "package", "path"), fin(Document, "choices"));

/**
 * Each document's hottexts, counted by `Document.hottexts`.
 */
const documentHottextFamily = counted(on(Hottext, "package", "path"), fin(Document, "hottexts"));

/**
 * Each instance's choices, counted by `Instance.choices`, its document's count.
 */
const placedChoiceFamily = counted(
  on(PlacedChoice, "package", "assembly", "instance"),
  fin(Instance, "choices"),
);

/**
 * Each instance's hottexts, counted by `Instance.hottexts`, its document's count.
 */
const placedHottextFamily = counted(
  on(PlacedHottext, "package", "assembly", "instance"),
  fin(Instance, "hottexts"),
);

/**
 * An element whose least and most counts `ChoiceBound` pairs, keyed by its place: what it writes
 * of its two counts. Its kind is its node's, which the laws read through `Node`
 * (`#pantry/qti/overlay-queries/interaction.ts`).
 *
 * - `minName` and `maxName`, the attributes `ChoiceBound` names for its kind, and `minWritten` and
 *   `maxWritten`, whether it writes each;
 *
 * A count with a value is a row of its own, its {@link LeastCount} or {@link MostCount}, and one
 * with none has no row (a missing value is a row of its own relation, never a sentinel).
 */
export const CountBound = law(
  entryOf("E1 derived"),
  relation(
    "CountBound",
    {
      maxName: closedId(AttributeName),
      maxWritten: pg.boolean,
      minName: closedId(AttributeName),
      minWritten: pg.boolean,
      package: PackageName,
      path: EntryPath,
      start: natural,
    },
    ["package", "path", "start"],
  ),
);

/**
 * A bound's least count, where it has a value, keyed by its place: `least`, the count's value
 * collapsed where written, else its XSD default, and `leastValue`, its integer, which `E1_derived`
 * proves by G-parse's cast, written so a selection may read it. What its bound writes is its
 * {@link CountBound}'s, its kind its node's, and its interaction's choices its
 * {@link Interaction}'s, each of which the laws read through a query
 * (`#pantry/qti/overlay-queries/interaction.ts`).
 *
 * A count has a value where it writes an integer or, unwritten, has an XSD default. A count written
 * as no integer (`max-choices="1abc"`) has none, and its attribute's value domain refuses it alone;
 * an unwritten count with no default has none, and no law reads it (the law oracle's
 * `countAttribute`). A count is an `xs:nonNegativeInteger` held to the signed 64-bit range (reading
 * 46), so its value is in `lexicalForm(pg.bigint)`, which `E1_derived` requires.
 */
export const LeastCount = law(
  entryOf("E1 derived"),
  relation(
    "LeastCount",
    {
      least: anyText,
      leastValue: pg.bigint,
      package: PackageName,
      path: EntryPath,
      start: natural,
    },
    ["package", "path", "start"],
  ),
);

/**
 * A bound's most count, where it has a value, keyed by its place, as {@link LeastCount} is the
 * least's: `most` and `mostValue`.
 */
export const MostCount = law(
  entryOf("E1 derived"),
  relation(
    "MostCount",
    {
      most: anyText,
      mostValue: pg.bigint,
      package: PackageName,
      path: EntryPath,
      start: natural,
    },
    ["package", "path", "start"],
  ),
);

/**
 * A document's item mode, keyed by the document (`package`, `path`): whether it is an item whose
 * `adaptive` is true. Every adaptive item has its row, and so does every document a
 * {@link BoundVariable} names.
 */
export const ItemMode = law(
  entryOf("E1 derived"),
  relation("ItemMode", { adaptive: pg.boolean, package: PackageName, path: EntryPath }, [
    "package",
    "path",
  ]),
);

/**
 * The fields of a content reference: the referring element's place and kind, the root kind of the
 * assembly it resolves in, which for an item's own reference is its document's own root kind, the
 * attribute it refers by, and the name it refers to, collapsed. A value that is no NCName
 * ({@link namePattern}) names nothing and has no row: its value domain refuses it alone (spec
 * reading 152). The name resolves to its document's declaration of it, which a rule over a query
 * reads (`#pantry/qti/overlay-queries/reference.ts`), or to a built-in variable of that root, as
 * the installed `BuiltInVariable` holds each under its root (spec reading 29), or to nothing, which
 * its law refuses.
 */
const referenceFields = {
  assemblyKind: closedId(NodeKind),
  attribute: closedId(AttributeName),
  identifier: QtiIdentifier,
  kind: closedId(NodeKind),
  package: PackageName,
  path: EntryPath,
  start: natural,
} as const;

/**
 * A feedback element's outcome, keyed by its element's place and `outcome-identifier` (reading
 * 77).
 */
export const FeedbackRef = law(
  entryOf("E1 derived"),
  relation("FeedbackRef", referenceFields, ["package", "path", "start", "attribute"]),
);

/**
 * A template element's or a choice's template variable, keyed by its element's place and
 * `template-identifier` (§2.7.2: "A references must match the identifier in a corresponding
 * template declaration"). Of a template element or a choice the variable is of base type
 * identifier and of single or multiple cardinality (reading R15-l, "Template variable type"); a
 * portable custom interaction's `qti-template-variable` states no type.
 */
export const TemplateRef = law(
  entryOf("E1 derived"),
  relation("TemplateRef", referenceFields, ["package", "path", "start", "attribute"]),
);

/**
 * The variable a printed variable prints, keyed by its element's place and `identifier` (§7.30.6:
 * "The outcome variable or template variable must have been defined"), and the variable its `base`
 * or `index` names where that value is a name, not an integer, keyed by its element's place and the
 * attribute.
 */
export const PrintedVariableRef = law(
  entryOf("E1 derived"),
  relation("PrintedVariableRef", referenceFields, ["package", "path", "start", "attribute"]),
);

/**
 * The context variable a PCI's `qti-context-variable` binds, keyed by its element's place and
 * `identifier`
 * (reading 92: "the context variables are the declared ones and the built-in QTI_CONTEXT").
 */
export const ContextRef = law(
  entryOf("E1 derived"),
  relation("ContextRef", referenceFields, ["package", "path", "start", "attribute"]),
);

/**
 * The fields of a reference an included fragment makes: its element's place and kind, the attribute
 * it refers by, and its name collapsed. It resolves in no declaration of its own document, since a
 * fragment declares nothing, but once per item that includes it (spec reading 117).
 */
const fragmentNameFields = {
  attribute: closedId(AttributeName),
  identifier: QtiIdentifier,
  kind: closedId(NodeKind),
  package: PackageName,
  path: EntryPath,
  start: natural,
} as const;

/**
 * An included fragment's feedback outcome reference, a feedback element's `outcome-identifier`,
 * keyed by its element's place and attribute (spec reading 117).
 */
export const FragmentFeedbackName = law(
  entryOf("E1 derived"),
  relation("FragmentFeedbackName", fragmentNameFields, ["package", "path", "start", "attribute"]),
);

/**
 * An included fragment's printed variable reference, a printed variable's `identifier`, or its
 * `base` or `index` where it names a variable, keyed by its element's place and attribute (spec
 * reading 117).
 */
export const FragmentPrintedName = law(
  entryOf("E1 derived"),
  relation("FragmentPrintedName", fragmentNameFields, ["package", "path", "start", "attribute"]),
);

/**
 * An included fragment's template variable reference, a template element's or a choice's
 * `template-identifier`, keyed by its element's place and attribute (spec reading 117).
 */
export const FragmentTemplateName = law(
  entryOf("E1 derived"),
  relation("FragmentTemplateName", fragmentNameFields, ["package", "path", "start", "attribute"]),
);

/**
 * An included fragment's context variable reference, a `qti-context-variable`'s `identifier`,
 * keyed by its element's place and attribute (spec reading 117).
 */
export const FragmentContextName = law(
  entryOf("E1 derived"),
  relation("FragmentContextName", fragmentNameFields, ["package", "path", "start", "attribute"]),
);

/**
 * A document whose references resolve once per assembly that places it, keyed by the document
 * (`package`, `path`), a projection whose counts are its {@link FragmentFeedbackName},
 * {@link FragmentPrintedName}, {@link FragmentTemplateName} and {@link FragmentContextName} rows:
 * every document that is no item's has its row, its counts 0 where it makes none.
 */
export const ReferringDocument = law(
  entryOf("E1 derived"),
  relation(
    "ReferringDocument",
    {
      contexts: drawn(natural),
      feedbacks: drawn(natural),
      package: PackageName,
      path: EntryPath,
      prints: drawn(natural),
      templates: drawn(natural),
    },
    ["package", "path"],
  ),
);

/**
 * Each fragment's feedback references, counted by `ReferringDocument.feedbacks`.
 */
const fragmentFeedbackNameFamily = counted(
  on(FragmentFeedbackName, "package", "path"),
  fin(ReferringDocument, "feedbacks"),
);

/**
 * Each fragment's printed variable references, counted by `ReferringDocument.prints`.
 */
const fragmentPrintedNameFamily = counted(
  on(FragmentPrintedName, "package", "path"),
  fin(ReferringDocument, "prints"),
);

/**
 * Each fragment's template variable references, counted by
 * `ReferringDocument.templates`.
 */
const fragmentTemplateNameFamily = counted(
  on(FragmentTemplateName, "package", "path"),
  fin(ReferringDocument, "templates"),
);

/**
 * Each fragment's context variable references, counted by
 * `ReferringDocument.contexts`.
 */
const fragmentContextNameFamily = counted(
  on(FragmentContextName, "package", "path"),
  fin(ReferringDocument, "contexts"),
);

/**
 * One placement of an included fragment, or of a section document a test references, under an item
 * or a test (spec readings 117 and 145), keyed by its `Instance`
 * (`package`, `assembly`, `instance`): the document it places, `document`, the instance's, and the
 * assembly's root kind, whose built-in variables its references read, and its counts
 * of {@link FragmentFeedbackRef}, {@link FragmentPrintedRef}, {@link FragmentTemplateRef} and
 * {@link FragmentContextRef} rows, which the families draw.
 */
export const FragmentScope = law(
  entryOf("E1 derived"),
  relation(
    "FragmentScope",
    {
      assembly: EntryPath,
      assemblyKind: closedId(NodeKind),
      contexts: drawn(natural),
      document: EntryPath,
      feedbacks: drawn(natural),
      instance: natural,
      package: PackageName,
      prints: drawn(natural),
      templates: drawn(natural),
    },
    ["package", "assembly", "instance"],
  ),
);

/**
 * The fields of a fragment's reference placed under one assembly that places it: the placement's
 * instance (`package`, `assembly`, `instance`) and the assembly's root kind, and the reference's
 * fields, its element's place in the placed document. What its name resolves to among the
 * assembly's declarations is a row of its own, where it names a declaration
 * (`fragmentReferenceDeclarationFields`), and none where it names a built-in of the assembly's root
 * or nothing, as an own reference's is.
 */
const fragmentReferenceFields = {
  assembly: EntryPath,
  assemblyKind: closedId(NodeKind),
  attribute: closedId(AttributeName),
  identifier: QtiIdentifier,
  instance: natural,
  kind: closedId(NodeKind),
  package: PackageName,
  path: EntryPath,
  start: natural,
} as const;

/**
 * A fragment's feedback reference resolved under one placement, keyed by the placement's
 * instance and the reference's element's `start` and attribute. It is a relation of its own beside
 * {@link FragmentPrintedRef}, so each law that resolves one is a statement of its own, which a
 * refusal names by its relations and terms ("Feedback reference", "Printed variable reference").
 */
export const FragmentFeedbackRef = law(
  entryOf("E1 derived"),
  relation("FragmentFeedbackRef", fragmentReferenceFields, [
    "package",
    "assembly",
    "instance",
    "start",
    "attribute",
  ]),
);

/**
 * A fragment's printed variable reference resolved under one placement, keyed as
 * {@link FragmentFeedbackRef} is.
 */
export const FragmentPrintedRef = law(
  entryOf("E1 derived"),
  relation("FragmentPrintedRef", fragmentReferenceFields, [
    "package",
    "assembly",
    "instance",
    "start",
    "attribute",
  ]),
);

/**
 * A fragment's template variable reference resolved under one placement,
 * keyed as {@link FragmentFeedbackRef} is ("Template reference").
 */
export const FragmentTemplateRef = law(
  entryOf("E1 derived"),
  relation("FragmentTemplateRef", fragmentReferenceFields, [
    "package",
    "assembly",
    "instance",
    "start",
    "attribute",
  ]),
);

/**
 * A fragment's context variable reference resolved under one placement,
 * keyed as {@link FragmentFeedbackRef} is ("Context variable reference").
 */
export const FragmentContextRef = law(
  entryOf("E1 derived"),
  relation("FragmentContextRef", fragmentReferenceFields, [
    "package",
    "assembly",
    "instance",
    "start",
    "attribute",
  ]),
);

/**
 * Each placement's resolved feedback references, counted by `FragmentScope.feedbacks`, which equals
 * its document's count, so each placement resolves every one.
 */
const fragmentFeedbackFamily = counted(
  on(FragmentFeedbackRef, "package", "assembly", "instance"),
  fin(FragmentScope, "feedbacks"),
);

/**
 * Each placement's resolved printed variable references, counted by `FragmentScope.prints`.
 */
const fragmentPrintedFamily = counted(
  on(FragmentPrintedRef, "package", "assembly", "instance"),
  fin(FragmentScope, "prints"),
);

/**
 * Each placement's resolved template variable references, counted by `FragmentScope.templates`.
 */
const fragmentTemplateFamily = counted(
  on(FragmentTemplateRef, "package", "assembly", "instance"),
  fin(FragmentScope, "templates"),
);

/**
 * Each placement's resolved context variable references, counted by `FragmentScope.contexts`.
 */
const fragmentContextFamily = counted(
  on(FragmentContextRef, "package", "assembly", "instance"),
  fin(FragmentScope, "contexts"),
);

/**
 * The O3 overlays, in one list: the members `Qti` composes from this module.
 */
export const interactionRelations = [
  BindingName,
  BoundVariable,
  Choice,
  ChoiceInteraction,
  ContextRef,
  CountBound,
  FeedbackRef,
  Hottext,
  Interaction,
  InteractionAttribute,
  ItemMode,
  LeastCount,
  MostCount,
  PciModuleForm,
  PlacedBinding,
  PlacedChoice,
  PlacedHottext,
  PrintedVariableRef,
  ReferringDocument,
  FragmentContextName,
  FragmentContextRef,
  FragmentFeedbackName,
  FragmentFeedbackRef,
  FragmentPrintedName,
  FragmentPrintedRef,
  FragmentScope,
  FragmentTemplateName,
  FragmentTemplateRef,
  TemplateRef,
] as const;

/**
 * An `InteractionAttribute` row as a row check or a selection reads it.
 */
type AttributeRow = RowScalars<typeof InteractionAttribute>;

/**
 * The names of an item's built-in variables, `BuiltInVariable`'s rows under the item root:
 * `numAttempts`, `duration`, `completionStatus` and `QTI_CONTEXT` (§2.2.2, §2.2.2.1), which "Choice
 * not variable" holds an item's choices and hottexts apart from (`#pantry/qti/queries.ts`).
 */
export const itemBuiltInNames: readonly string[] = [
  ...new Set(
    BuiltInVariable.rows.filter(({ root }) => root === itemKind).map(({ variable }) => variable),
  ),
];

/**
 * Select the attributes O3 reads: each name of {@link readAttributes} on its kinds, and the ARIA
 * range attributes on every kind. It is the one copy source over `Attribute` for O3, read at
 * `(package, path, start, name)`, `Attribute`'s own key (an element writes each closed name once,
 * Namespaces in XML 1.0 §6.3), whose index serves the copy's reverse probe and keeps
 * `Attribute.lexical` out of every index.
 */
const o3Attributes = select(Attribute, (a) =>
  a.or(
    a.in(a.name, ariaNames),
    ...[...readAttributes].map(([name, kinds]) => namedOn(a, name, kinds)),
  ),
);

/**
 * Select the read attributes of some names on some kinds.
 *
 * @param names - The attributes' names.
 * @param kinds - Their elements' kinds.
 * @returns The selection of `InteractionAttribute`.
 */
const readOf = (names: readonly Name[], kinds: readonly Kind[]) =>
  select(InteractionAttribute, (v) => v.and(v.in(v.name, names), v.in(v.kind, kinds)));

/**
 * State that a read attribute is an interaction's binding that names a variable
 * ({@link namePattern}).
 *
 * @param v - The row.
 * @returns The predicate.
 */
const namedBinding = (v: AttributeRow) =>
  v.and(
    v.in(v.name, bindingAttributes),
    v.in(v.kind, interactionKinds),
    Text.matches(v.value, namePattern),
  );

/**
 * The bindings that name a variable, in every document: {@link BindingName}'s source.
 */
const namedBindings = select(InteractionAttribute, namedBinding);

/**
 * The bindings that name a variable in item documents: {@link BoundVariable}'s source.
 */
const itemBindings = select(InteractionAttribute, (v) =>
  v.and(namedBinding(v), v.eq(v.rootKind, itemKind)),
);

/**
 * Select the read attributes of some names on some kinds that name a variable ({@link namePattern})
 * in the documents whose references resolve in their own declarations, items and tests.
 *
 * @param names - The attributes' names.
 * @param kinds - Their elements' kinds.
 * @returns The selection of `InteractionAttribute`.
 */
const referenceReadOf = (names: readonly Name[], kinds: readonly Kind[]) =>
  select(InteractionAttribute, (v) =>
    v.and(
      v.in(v.name, names),
      v.in(v.kind, kinds),
      v.in(v.rootKind, referringRoots),
      Text.matches(v.value, namePattern),
    ),
  );

/**
 * The lexical form of a count that `Type.cast` reads exactly: `xs:integer`'s, within the signed
 * 64-bit range a count is held to (reading 46). A count's value is copied text, an
 * {@link InteractionAttribute}'s `matchedText`, whose form's leading zeros bound no length, so the
 * cast is guarded by the form and the form is required beside it.
 */
const bigintForm = lexicalForm(pg.bigint);

/**
 * The sign a count's form may carry beside {@link bigintForm}: none, a `+`, or a `-` before a zero
 * alone (`-0`, `-00`), which XML Schema 1.1 Part 2 §3.3.20 reads as 0. The two together are the
 * database's reading of which counts have a value: an `xs:nonNegativeInteger` within the signed
 * 64-bit range (reading 46). A count written as no such form, `1abc`, `-1` or past the range, has
 * none: its value domain is its law, and no other law reads it. The import reads the same forms by
 * its own map (`countValueOf` in `#pantry/import/overlays/interactions.ts`), and the law oracle by
 * its own (`integerOf` in `#pantry/test/oracle-view.ts`).
 */
const countSign = Text.pattern("^(?:[^-]|-0+$)");

/**
 * Select the read count attributes of some names, on the kinds whose counts `ChoiceBound` pairs,
 * that write an integer: each is its bound's {@link LeastCount} or {@link MostCount} value, and a
 * count written as no integer has none.
 *
 * @param names - The counts' attributes.
 * @returns The selection of `InteractionAttribute`.
 */
export const integerReadOf = (names: readonly Name[]) =>
  select(InteractionAttribute, (v) =>
    v.and(
      v.in(v.name, names),
      v.in(v.kind, boundKinds),
      Text.matches(v.value, countSign),
      Text.matches(v.value, bigintForm),
    ),
  );

/**
 * The read `response-identifier` of each interaction, one per interaction, keyed by its place: the
 * attribute's own key, whose name the selection fixes, so that a binding's attributes name it by
 * their place and kind.
 */
const responseIdentifiers = readOf(["response-identifier"], interactionKinds);

/**
 * The interactions not inside a feedback element: the one selection of `Node` O3 reads, a target,
 * so it adds a generated column and a UNIQUE to `Node` and no foreign key. A feedback element
 * enters `fb` (`Enters`, read as a set, since grizzle's set algebra takes no set literal), and an
 * interaction enters no `fb`, so its `ancestry` holds `fb` exactly where an ancestor is feedback.
 */
const outsideFeedback = select(Node, (n) =>
  n.and(
    n.in(n.kind, interactionKinds),
    n.eq(Bits.disjoint(n.ancestry, Enters.row(feedbackKind)), true),
  ),
);

/**
 * The read `adaptive` of each item whose value is true, found by its value's SHA-256: one of
 * {@link booleanTrue}'s.
 */
const adaptiveTrue = select(InteractionAttribute, (v) =>
  v.and(
    v.eq(v.name, adaptiveName),
    v.eq(v.kind, itemKind),
    v.or(
      ...booleanTrue.map((form) =>
        v.eq(v.valueDigest, Crypto.sha256(Type.literal(matchedText, form))),
      ),
    ),
  ),
);

/**
 * State that a read attribute is a printed variable's reference: its `identifier`, or its `base`
 * or `index`, where its value names a variable.
 *
 * @param v - The row.
 * @returns The predicate.
 */
const printedReference = (v: AttributeRow) =>
  v.and(
    Text.matches(v.value, namePattern),
    v.or(
      v.and(v.in(v.name, references.printed.attributes), v.in(v.kind, references.printed.kinds)),
      v.and(v.in(v.name, references.variable.attributes), v.in(v.kind, references.variable.kinds)),
    ),
  );

/**
 * The read attributes each content reference relation holds: those that name a variable, in items
 * and tests, each resolving in its own document's declarations.
 */
const referenceSources = {
  context: referenceReadOf(references.context.attributes, references.context.kinds),
  feedback: referenceReadOf(references.feedback.attributes, references.feedback.kinds),
  printed: select(InteractionAttribute, (v) =>
    v.and(v.in(v.rootKind, referringRoots), printedReference(v)),
  ),
  template: referenceReadOf(references.template.attributes, references.template.kinds),
} as const;

/**
 * Select the read attributes a fragment's references of one class are: the class's attributes on
 * its kinds that name a variable ({@link namePattern}), in a document that is no item, so each
 * resolves once per assembly that places it (spec reading 117).
 *
 * @param reference - The class's attributes and kinds.
 * @returns The selection of `InteractionAttribute`.
 */
const fragmentReferenceOf = (reference: {
  readonly attributes: readonly Name[];
  readonly kinds: readonly Kind[];
}) =>
  select(InteractionAttribute, (v) =>
    v.and(
      v.not(v.in(v.rootKind, referringRoots)),
      v.in(v.name, reference.attributes),
      v.in(v.kind, reference.kinds),
      Text.matches(v.value, namePattern),
    ),
  );

/**
 * The read attributes each section name relation holds: a fragment's references of each class, its
 * printed variables' names, bases and indices among them, where they name a variable.
 */
const fragmentSources = {
  context: fragmentReferenceOf(references.context),
  feedback: fragmentReferenceOf(references.feedback),
  printed: select(InteractionAttribute, (v) =>
    v.and(v.not(v.in(v.rootKind, referringRoots)), printedReference(v)),
  ),
  template: fragmentReferenceOf(references.template),
} as const;

/**
 * The placements `FragmentScope` holds: every instance of an assembly whose root's references
 * resolve in its own declarations, an item's or a test's ({@link referringRoots}), whose document's
 * resolve in no declarations of its own: an included fragment's, and a section document's a test
 * references, one per placement (spec readings 117 and 145). A bank heads its own assembly, which
 * resolves nothing.
 */
const fragmentPlacements = select(Instance, (i) =>
  i.and(i.in(i.assemblyKind, referringRoots), i.not(i.in(i.rootKind, referringRoots))),
);

/**
 * The content references, each under the law that resolves it: `check`, the law's check; `own`,
 * the relation of an item's references, resolved in its own document's declarations; `names`, the
 * relation of a fragment's names; and `placed`, the relation
 * that resolves those names under each placement, in its assembly's declarations.
 */
export const contentReferences = {
  "Context variable reference": {
    check: "Context_variable_reference",
    names: FragmentContextName,
    own: ContextRef,
    placed: FragmentContextRef,
  },
  "Feedback reference": {
    check: "Feedback_reference",
    names: FragmentFeedbackName,
    own: FeedbackRef,
    placed: FragmentFeedbackRef,
  },
  "Printed variable reference": {
    check: "Printed_variable_reference",
    names: FragmentPrintedName,
    own: PrintedVariableRef,
    placed: FragmentPrintedRef,
  },
  "Template reference": {
    check: "Template_reference",
    names: FragmentTemplateName,
    own: TemplateRef,
    placed: FragmentTemplateRef,
  },
} as const;

/**
 * A content reference of {@link contentReferences}.
 */
export type ContentReferenceOf = (typeof contentReferences)[keyof typeof contentReferences];

/**
 * A content reference's row as a row check reads it: the fields every content reference relation
 * holds, of any of them.
 */
type ReferenceRow = RowScalars<{ readonly heading: typeof referenceFields; readonly name: string }>;

/**
 * The roots that hold built-in variables, each with the names of its built-ins, as the installed
 * `BuiltInVariable` holds them (spec reading 29).
 */
const builtInRoots: readonly (readonly [Kind, readonly string[]])[] = [
  ...Map.groupBy(BuiltInVariable.rows, ({ root }) => root),
].map(([root, rows]) => [root, rows.map(({ variable }) => variable)] as const);

/**
 * Whether a reference names no built-in variable of the root of the assembly it resolves in.
 *
 * @param r - The reference's row.
 * @returns The predicate.
 */
export const namesNoBuiltIn = (r: ReferenceRow) =>
  r.and(
    ...builtInRoots.map(([root, names]) =>
      r.or(r.ne(r.assemblyKind, root), r.not(r.in(r.identifier, names))),
    ),
  );

/**
 * Each built-in variable with the references that may name it under its root, one entry per
 * attribute: the kinds whose references by the attribute `ContentReference` lets name the
 * declaration kind the variable stands as there (`BuiltInVariable`, keyed by root and variable).
 */
const builtInReferrers = BuiltInVariable.rows.flatMap(({ declaration, root, variable }) =>
  [
    ...Map.groupBy(
      ContentReference.rows.filter((row) => row.declaration === declaration),
      ({ attribute }) => attribute,
    ),
  ].map(([attribute, rows]) => ({
    attribute,
    kinds: rows.map(({ kind }) => kind),
    root,
    variable,
  })),
);

/**
 * Whether a reference that names a built-in variable of its assembly's root is one that may name
 * it: its kind and attribute are a pair `ContentReference` lets name the declaration kind the
 * variable stands as under that root. A reference that names a built-in names no declaration, so
 * this is its whole resolution; a name that is a built-in of another root only is no built-in here,
 * and resolves as any other name does.
 *
 * @param r - The reference's row.
 * @returns The predicate.
 */
const namesAllowedBuiltIn = (r: ReferenceRow) =>
  r.or(
    namesNoBuiltIn(r),
    ...builtInReferrers.map(({ attribute, kinds, root, variable }) =>
      r.and(
        r.eq(r.assemblyKind, root),
        r.eq(r.identifier, variable),
        r.eq(r.attribute, attribute),
        r.in(r.kind, kinds),
      ),
    ),
  );

/**
 * State one content reference's law over its relations, the half no query reads (the other,
 * `#pantry/qti/overlay-queries/reference.ts`, resolves each reference that names no built-in of
 * its root in its document's declarations, or a placed one's in its assembly's item's):
 *
 * - An own reference that names a built-in of its root names one it may;
 * - A placed reference is one of its document's names, and one that names a built-in of its
 *   assembly's root names one it may.
 *
 * @param reference - The content reference.
 * @returns The law's statements.
 */
const contentReferenceLaws = ({ check: rule, names, own, placed }: ContentReferenceOf) => [
  check(rule, own, namesAllowedBuiltIn),
  contained(
    on(placed, "package", "path", "start", "attribute", "kind", "identifier"),
    on(names, "package", "path", "start", "attribute", "kind", "identifier"),
  ),
  check(rule, placed, namesAllowedBuiltIn),
];

/**
 * The cardinalities a feedback element's outcome may have (§5.49.1, §5.52.1: "an outcome variable
 * of base-type identifier and single or multiple cardinality"): a record's is none of them, so
 * its whole value is judged by its cardinality alone.
 */
export const feedbackCardinalities = ["single", "multiple"] as const;

/**
 * A document's context interaction (spec reading 117): the document, then the document and
 * position its context's nearest interaction stands at, `Document.contextPath` and
 * `contextNearest`. A choice's or a hottext's nearest is a position in its own document, or, where
 * no interaction of its document encloses it, its document's context's: so a row that names its
 * nearest in another document names its document's context.
 */
const onContext = on(Document, "package", "path", "contextPath", "contextNearest");

/**
 * Every statement over the O3 overlays, each `check` named by its oracle law. A law that reads an
 * overlay's node's kind, parent or nearest interaction is a rule over a query
 * (`#pantry/qti/overlay-queries/interaction.ts`), named alike:
 *
 * - **the read attributes:** one copy from `Attribute` with the key that serves it, and the copy's
 *   reverse, so `InteractionAttribute` holds exactly the attributes O3 reads; each one's root kind
 *   its document's; `E1_derived`, its value its lexical form collapsed.
 * - **bindings in place** (spec reading 117): each interaction's binding attributes in every document
 *   ({@link BindingName}), counted per document; under each instance of an item's assembly, as many
 *   {@link PlacedBinding} rows as its document has binding attributes, each its document's and
 *   resolved among the item's declarations, under the item's own laws: "Binding declared",
 *   "BindingFit", "Binding unique" over the assembly (a fragment placed twice in one item binds its
 *   responses twice, as its merged document does), "Binding cardinality" and "AdaptiveFeedback",
 *   whose feedback ancestry an included fragment inherits from its context.
 * - **interactions:** each interaction's {@link Interaction} (a node's, of an interaction kind), the
 *   owner of its choices.
 * - **bindings:** each interaction's read `response-identifier`, where it writes one, the part of its
 *   {@link Interaction}, and the one every binding attribute of the interaction names; each item
 *   binding's {@link BoundVariable}, which names a response declaration of its item whatever its
 *   cardinality spells ("Binding declared", reading 75, reading 159); each declaration of a type
 *   `BindingFit` or `RecordBindingFit` admits, the custom, portable custom and order interactions
 *   of any type (spec reading 172), and a string binding's of base type string ("BindingFit"), each
 *   fit law over the declaration's cardinality and base type rows alone, read through its name, a
 *   rule over a query (`#pantry/qti/overlay-queries/reference.ts` and
 *   `#pantry/qti/overlay-queries/interaction.ts`); "Binding unique" (`key(package, path,
 *   identifier)`); "Binding cardinality" (a single response takes a most of 1, where its
 *   interaction's most has a value, and a gap match of at most one gap, its cardinality row's
 *   `gaps` copied from `Interaction`, spec reading 169); `max-strings-required`, its containment
 *   into `CountBound` over the place alone, a statement of its own beside "Binding cardinality"'s,
 *   which reads `MostCount` (a refusal names a law by its relations and terms, never its selection,
 *   C22); and "AdaptiveFeedback", an interaction inside feedback is in an adaptive item.
 * - **choices:** each choice's {@link ChoiceInteraction}, which every choice has ("N8 nearest"), its
 *   interaction the choice's nearest, in its own document or its document's context
 *   (`Document.contextPath` and `contextNearest`, spec reading 117), the counted family under
 *   `Interaction`, a gap's among them; its identifier distinct among its document's choices of its
 *   kind; each hottext's identifier distinct among its document's hottexts (reading 104); and in
 *   place (spec reading 117), under each instance of each assembly, as many {@link PlacedChoice}
 *   and {@link PlacedHottext} rows as its document has choices and hottexts, each its document's,
 *   their identifiers distinct over the assembly. Across the classes, "Choice identifier key" holds
 *   a "choice"'s name to no other choice or hottext, in the document and over its assembly, and
 *   "Choice not variable" each to no variable of its document, both rules over queries
 *   (`#pantry/qti/queries.ts`, reading 104).
 * - **the default hotspot** (reading 80): each hotspot's read shape, which
 *   `default_hotspot_last_slot` and `Graphic_gap_match_default_hotspot` read beside its node's rank
 *   and its parent's count, rules over a query.
 * - **counts:** each bound's counts written or defaulted, a row of its own where it has a value,
 *   typed by G-parse (`E1_derived`), and "Choice bounds" over the values a count has.
 * - **ranges**, rules over a query of each element's two read bounds: "Slider bounds" (reading 9, the
 *   Schematron's 14Ba), the bounds collapsed and ordered as `xs:double` values by `doublesInOrder`
 *   of `#pantry/qti/declarations.ts`. And "Aria value range" over the elements that carry both ARIA
 *   bounds, each value collapsed and read where it is in `xs:decimal`'s lexical space, grizzle's
 *   `decimalText`, the language pantry's own value domain admits (`decimalLexical` of
 *   `#pantry/grammar/domains.ts`): the decimal it names, exactly and of any digits, by grizzle's
 *   `Text.parseDecimal` (XML Schema 1.1's decimalLexicalMap, Part 2 §3.3.3.1), so a value past 256
 *   integer or 255 fraction digits is ordered as any other. A pair with a value that is no
 *   `xs:decimal` holds the law by its own arm, since its value domain alone refuses it; each
 *   parse's otherwise is never read, since that arm holds wherever its guard fails. The parse reads
 *   a text of at most grizzle's `decimalTextMaxBytes`, 16,384 (grizzle's README, "Parsing text",
 *   `Text.parseDecimal`), each value a `matchedText` of any length, so the parse stands under its
 *   own byte guard, and an ARIA bound past it, which names a decimal PostgreSQL's numeric may not
 *   hold, holds "Aria value range" by its own arm and is refused under "Key text bound", a stated
 *   limit of the representation.
 * - **fragments' references:** each one's row, counted per document and class; one placement row per
 *   instance of an item's assembly whose document is no item, an included fragment's (spec reading
 *   117), counting as many resolutions of each class as its document has references; each
 *   resolution its placement's and its reference's, resolved in the assembly's declarations or to a
 *   built-in of its root, its kind `FragmentScope.assemblyKind`, `Instance`'s, under "Feedback
 *   reference", "Printed variable reference", "Template reference" or "Context variable
 *   reference".
 * - **content references:** each relation's rows are its source's, its `assemblyKind` its document's
 *   root kind; a name that is a built-in's of that root is one its kind and attribute may name
 *   there, under its reference's law ("Feedback reference", "Template reference", "Printed variable
 *   reference", "Context variable reference"). A name that is no built-in's of that root names a
 *   declaration of a kind `ContentReference` allows for its kind and attribute, whatever its
 *   cardinality spells (spec reading 159), and "Feedback outcome type" (reading 77) and "Template
 *   variable type" (reading R15-l, decision 432) read that declaration's cardinality and base type,
 *   each a rule over a query (`#pantry/qti/overlay-queries/reference.ts`).
 */
export const interactionLawsByName = {
  ...pipe(
    contentReferences,
    Rec.map((reference, name) => declared(name, contentReferenceLaws(reference))),
  ),
  "Adaptive feedback": declared("Adaptive feedback", [
    contained(
      on(
        select(BoundVariable, (r) =>
          r.and(r.eq(r.attribute, "response-identifier"), r.eq(r.adaptive, false)),
        ),
        "package",
        "path",
        "start",
      ),
      on(outsideFeedback, "package", "path", "start"),
    ),
    contained(
      on(
        select(PlacedBinding, (r) =>
          r.and(r.eq(r.attribute, "response-identifier"), r.eq(r.adaptive, false)),
        ),
        "package",
        "path",
        "start",
      ),
      on(outsideFeedback, "package", "path", "start"),
    ),
  ]),
  "Binding unique": declared("Binding unique", [
    key(on(BoundVariable, "package", "path", "identifier")),
    key(on(PlacedBinding, "package", "assembly", "identifier")),
  ]),
  "Choice identifier key": declared("Choice identifier key", [
    key(on(Choice, "package", "path", "kind", "identifier")),
    key(on(Hottext, "package", "path", "identifier")),
    key(on(PlacedChoice, "package", "assembly", "kind", "identifier")),
    key(on(PlacedHottext, "package", "assembly", "identifier")),
  ]),
  "E1 derived": declared("E1 derived", [
    contained(
      on(Choice, "package", "path", "start", "kind"),
      on(Node, "package", "path", "start", "kind"),
    ),
    contained(
      on(PlacedChoice, "package", "path", "start", "kind"),
      on(Node, "package", "path", "start", "kind"),
    ),
    contained(
      on(o3Attributes, "package", "path", "start", "name", "kind", "lexicalDigest"),
      on(InteractionAttribute, "package", "path", "start", "name", "kind", "lexicalDigest"),
    ),
    contained(
      on(InteractionAttribute, "package", "path", "start", "name"),
      on(o3Attributes, "package", "path", "start", "name"),
    ),
    contained(
      on(InteractionAttribute, "package", "path", "rootKind"),
      on(Document, "package", "path", "rootKind"),
    ),
    contained(on(Interaction, "package", "path", "start"), on(Node, "package", "path", "start")),
    key(on(moduleElements, "package", "path", "parent")),
    contained(
      on(moduleAttributes, "package", "path", "start"),
      on(attributeForms, "package", "path", "start"),
    ),
    contained(
      on(attributeForms, "package", "path", "start"),
      on(moduleAttributes, "package", "path", "start"),
    ),
    contained(
      on(moduleElements, "package", "path", "parent"),
      on(elementForms, "package", "path", "start"),
    ),
    contained(
      on(elementForms, "package", "path", "start"),
      on(moduleElements, "package", "path", "parent"),
    ),
    pciModuleFamily,
    contained(
      on(responseIdentifiers, "package", "path", "start"),
      on(Interaction, "package", "path", "start"),
    ),
    contained(
      on(itemBindings, "package", "path", "start", "name", "value"),
      on(BoundVariable, "package", "path", "start", "attribute", "identifier"),
    ),
    contained(
      on(BoundVariable, "package", "path", "start"),
      on(responseIdentifiers, "package", "path", "start"),
    ),
    contained(
      on(BoundVariable, "package", "path", "adaptive"),
      on(ItemMode, "package", "path", "adaptive"),
    ),
    contained(
      on(namedBindings, "package", "path", "start", "name", "value"),
      on(BindingName, "package", "path", "start", "attribute", "identifier"),
    ),
    contained(
      on(BindingName, "package", "path", "start"),
      on(responseIdentifiers, "package", "path", "start"),
    ),
    bindingNameFamily,
    placedBindingFamily,
    contained(
      on(PlacedBinding, "package", "assembly", "instance", "path"),
      on(itemInstances, "package", "assembly", "start", "document"),
    ),
    contained(
      on(PlacedBinding, "package", "path", "start", "attribute", "identifier"),
      on(BindingName, "package", "path", "start", "attribute", "identifier"),
    ),
    contained(
      on(PlacedBinding, "package", "assembly", "adaptive"),
      on(ItemMode, "package", "path", "adaptive"),
    ),
    key(on(adaptiveTrue, "package", "path")),
    contained(
      on(
        select(ItemMode, (m) => m.eq(m.adaptive, true)),
        "package",
        "path",
      ),
      on(adaptiveTrue, "package", "path"),
    ),
    contained(
      on(adaptiveTrue, "package", "path"),
      on(
        select(ItemMode, (m) => m.eq(m.adaptive, true)),
        "package",
        "path",
      ),
    ),
    contained(
      on(readOf(["identifier"], choiceKinds), "package", "path", "start", "value"),
      on(Choice, "package", "path", "start", "identifier"),
    ),
    contained(
      on(Hottext, "package", "path", "start"),
      on(hottextNodes, "package", "path", "start"),
    ),
    contained(
      on(readOf(["identifier"], [hottextKind]), "package", "path", "start", "value"),
      on(Hottext, "package", "path", "start", "identifier"),
    ),
    documentChoiceFamily,
    documentHottextFamily,
    placedChoiceFamily,
    placedHottextFamily,
    contained(
      on(PlacedChoice, "package", "assembly", "instance", "path"),
      on(Instance, "package", "assembly", "start", "document"),
    ),
    contained(
      on(PlacedChoice, "package", "path", "start", "identifier"),
      on(Choice, "package", "path", "start", "identifier"),
    ),
    contained(
      on(PlacedHottext, "package", "assembly", "instance", "path"),
      on(Instance, "package", "assembly", "start", "document"),
    ),
    contained(
      on(PlacedHottext, "package", "path", "start", "identifier"),
      on(Hottext, "package", "path", "start", "identifier"),
    ),
    contained(on(CountBound, "package", "path", "start"), on(Node, "package", "path", "start")),
    mirrors(
      on(readOf(minNames, boundKinds), "package", "path", "start", "name"),
      on(
        select(CountBound, (b) => b.eq(b.minWritten, true)),
        "package",
        "path",
        "start",
        "minName",
      ),
    ),
    mirrors(
      on(readOf(maxNames, boundKinds), "package", "path", "start", "name"),
      on(
        select(CountBound, (b) => b.eq(b.maxWritten, true)),
        "package",
        "path",
        "start",
        "maxName",
      ),
    ),
    contained(
      on(LeastCount, "package", "path", "start"),
      on(CountBound, "package", "path", "start"),
    ),
    check("E1_derived", LeastCount, (l) =>
      l.and(
        Text.matches(l.least, countSign),
        Text.matches(l.least, bigintForm),
        l.eq(
          l.leastValue,
          Logic.when(Text.matches(l.least, bigintForm), (least) => Type.cast(least, pg.bigint), 0n),
        ),
      ),
    ),
    contained(
      on(MostCount, "package", "path", "start"),
      on(CountBound, "package", "path", "start"),
    ),
    check("E1_derived", MostCount, (m) =>
      m.and(
        Text.matches(m.most, countSign),
        Text.matches(m.most, bigintForm),
        m.eq(
          m.mostValue,
          Logic.when(Text.matches(m.most, bigintForm), (most) => Type.cast(most, pg.bigint), 0n),
        ),
      ),
    ),
    contained(
      on(
        referenceSources.feedback,
        "package",
        "path",
        "start",
        "name",
        "kind",
        "rootKind",
        "value",
      ),
      on(
        FeedbackRef,
        "package",
        "path",
        "start",
        "attribute",
        "kind",
        "assemblyKind",
        "identifier",
      ),
    ),
    contained(
      on(
        referenceSources.template,
        "package",
        "path",
        "start",
        "name",
        "kind",
        "rootKind",
        "value",
      ),
      on(
        TemplateRef,
        "package",
        "path",
        "start",
        "attribute",
        "kind",
        "assemblyKind",
        "identifier",
      ),
    ),
    contained(
      on(referenceSources.printed, "package", "path", "start", "name", "kind", "rootKind", "value"),
      on(
        PrintedVariableRef,
        "package",
        "path",
        "start",
        "attribute",
        "kind",
        "assemblyKind",
        "identifier",
      ),
    ),
    contained(
      on(referenceSources.context, "package", "path", "start", "name", "kind", "rootKind", "value"),
      on(ContextRef, "package", "path", "start", "attribute", "kind", "assemblyKind", "identifier"),
    ),
    contained(
      on(fragmentSources.feedback, "package", "path", "start", "name", "kind", "value"),
      on(FragmentFeedbackName, "package", "path", "start", "attribute", "kind", "identifier"),
    ),
    contained(
      on(fragmentSources.printed, "package", "path", "start", "name", "kind", "value"),
      on(FragmentPrintedName, "package", "path", "start", "attribute", "kind", "identifier"),
    ),
    contained(
      on(fragmentSources.template, "package", "path", "start", "name", "kind", "value"),
      on(FragmentTemplateName, "package", "path", "start", "attribute", "kind", "identifier"),
    ),
    contained(
      on(fragmentSources.context, "package", "path", "start", "name", "kind", "value"),
      on(FragmentContextName, "package", "path", "start", "attribute", "kind", "identifier"),
    ),
    fragmentFeedbackNameFamily,
    fragmentPrintedNameFamily,
    fragmentTemplateNameFamily,
    fragmentContextNameFamily,
    contained(
      on(fragmentPlacements, "package", "assembly", "start", "document", "assemblyKind"),
      on(FragmentScope, "package", "assembly", "instance", "document", "assemblyKind"),
    ),
    contained(
      on(FragmentScope, "package", "assembly", "instance", "document", "assemblyKind"),
      on(Instance, "package", "assembly", "start", "document", "assemblyKind"),
    ),
    contained(
      on(FragmentScope, "package", "document", "feedbacks", "prints", "templates", "contexts"),
      on(ReferringDocument, "package", "path", "feedbacks", "prints", "templates", "contexts"),
    ),
    fragmentFeedbackFamily,
    fragmentPrintedFamily,
    fragmentTemplateFamily,
    fragmentContextFamily,
    contained(
      on(FragmentFeedbackRef, "package", "assembly", "instance", "path", "assemblyKind"),
      on(FragmentScope, "package", "assembly", "instance", "document", "assemblyKind"),
    ),
    contained(
      on(FragmentPrintedRef, "package", "assembly", "instance", "path", "assemblyKind"),
      on(FragmentScope, "package", "assembly", "instance", "document", "assemblyKind"),
    ),
    contained(
      on(FragmentTemplateRef, "package", "assembly", "instance", "path", "assemblyKind"),
      on(FragmentScope, "package", "assembly", "instance", "document", "assemblyKind"),
    ),
    contained(
      on(FragmentContextRef, "package", "assembly", "instance", "path", "assemblyKind"),
      on(FragmentScope, "package", "assembly", "instance", "document", "assemblyKind"),
    ),
  ]),
  "N8 nearest": declared("N8 nearest", [
    contained(
      on(Choice, "package", "path", "start"),
      on(ChoiceInteraction, "package", "path", "start"),
    ),
    contained(
      on(
        select(ChoiceInteraction, (c) => c.ne(c.interactionPath, c.path)),
        "package",
        "path",
        "interactionPath",
        "interaction",
      ),
      onContext,
    ),
    choiceFamily,
  ]),
} as const;

/**
 * {@link interactionLawsByName}'s statements in one list, the module's laws as the schema composes
 * them.
 */
export const interactionLaws = Object.values(interactionLawsByName).flat();
