/**
 * The compiler of a stored document: an item (`qti-assessment-item`) or a test
 * (`qti-assessment-test`) into its compiled program, every expression typed and every reference
 * resolved, or the first refusal. The compiler is pure, so the shell caches a program by its
 * document's digest.
 *
 * @module
 */
import { collapsed } from "@bjornpagen/grizzle-text/text";
import { regex } from "arkregex";
import type { Digest } from "#processing/graded.ts";
import type { Expression, ExpressionKind, VariableRef } from "#processing/ir.ts";
import { interactionsOf } from "#processing/compile/body.ts";
import { resolveArea } from "#processing/compile/area.ts";
import type { ImageSize } from "#processing/compile/area.ts";
import type { Interaction } from "#processing/compile/body.ts";
import { childNamed, childrenNamed, declarationsOf } from "#processing/compile/declarations.ts";
import { expressionCompiler } from "#processing/compile/expression.ts";
import { outcomeRulesOf, responseRulesOf, templateRulesOf } from "#processing/compile/rules.ts";
import type { RulesContext } from "#processing/compile/rules.ts";
import { readBoolean } from "#processing/lexical.ts";
import { checked, refused } from "#processing/operators/operator.ts";
import type {
  Checked,
  CompileContext,
  DeclaredResponse,
  OperatorTable,
} from "#processing/operators/operator.ts";
import type {
  CompiledItem,
  CompiledItemRef,
  CompiledTest,
  Declaration,
  ResponseRule,
} from "#processing/program.ts";
import type { CustomOperator } from "#processing/operator.ts";
import { customOperatorOf } from "#processing/registry.ts";
import { publishedTemplates } from "#processing/templates.generated.ts";
import { attributeOf, qtiChildren, qtiNamespace, textOf } from "#processing/xml.ts";
import type { XmlElement } from "#processing/xml.ts";

/**
 * The two prefixes a published template is named under (reading `built-in-templates`).
 */
const templatePrefixes = [
  "https://purl.imsglobal.org/spec/qti/v3p0/rptemplates/",
  "https://www.imsglobal.org/question/qti_v3p0/rptemplates/",
] as const;

/**
 * The published template a `template` URI names: one of the two prefixes followed by the template's
 * name, with or without `.xml`, its white space collapsed (reading `built-in-templates`).
 *
 * @param uri - The URI as written.
 * @returns The template's `qti-response-processing`, or `undefined` where it names none.
 */
export const publishedTemplate = (uri: string): XmlElement | undefined => {
  const written = collapsed(uri);
  const prefix = templatePrefixes.find((each) => written.startsWith(each));
  if (prefix === undefined) {
    return undefined;
  }

  const file = written.slice(prefix.length);
  const name = file.endsWith(".xml") ? file.slice(0, -".xml".length) : file;

  return Object.hasOwn(publishedTemplates, name)
    ? Object.entries(publishedTemplates).find(([each]) => each === name)?.[1]
    : undefined;
};

/**
 * The refusal of a response processing the package cannot resolve, so no item is served with its
 * outcomes left at their defaults: where no rules are written inline and `template` names none of
 * QTI 3.0.1's published templates, a `template-location` (where to fetch the rules of a template
 * the delivery system does not know; the package fetches nothing), else the unknown `template`
 * (reading `built-in-templates`). A published template compiles to its rules, its
 * `template-location` a hint the package never needs; rules written inline compile as written;
 * no response processing at all is no rules.
 *
 * @param processing - The item's `qti-response-processing`.
 * @param place - Where it stands.
 * @param inline - How many rules it writes.
 * @param uri - Its `template`, if any.
 * @param template - The published template `uri` names, if any.
 * @returns The refusal, or `undefined` where the processing resolves.
 */
const unresolvedProcessing = (
  processing: XmlElement,
  place: number,
  inline: number,
  uri: string | undefined,
  template: XmlElement | undefined,
): Checked<CompiledItem> | undefined => {
  const location = attributeOf(processing, "template-location");
  if (location !== undefined && inline === 0 && template === undefined) {
    return refused(
      "template-location",
      place,
      `write the response processing inline or name a published template: the package fetches no template-location (${location})`,
    );
  }

  return inline === 0 && uri !== undefined && template === undefined
    ? refused(
        "unknown-template",
        place,
        `name one of QTI 3.0.1's published response processing templates, or write the rules inline: ${uri} is none`,
      )
    : undefined;
};

/**
 * The elements a response processing reads a response through: its value, its correct response, its
 * default, and its mapping (§5.113, §5.21, §5.38, §5.83, §5.84).
 */
const responseReaders: ReadonlySet<string> = new Set([
  "qti-correct",
  "qti-default",
  "qti-map-response",
  "qti-map-response-point",
  "qti-variable",
]);

/**
 * Every response identifier a response processing's rules read.
 *
 * @param rules - The rules, as written.
 * @returns The identifiers they read.
 */
const responsesRead = (rules: readonly XmlElement[]): ReadonlySet<string> => {
  const read = new Set<string>();
  const pending = [...rules];
  for (let next = pending.pop(); next !== undefined; next = pending.pop()) {
    const identifier = attributeOf(next, "identifier");
    if (responseReaders.has(next.local) && identifier !== undefined) {
      read.add(collapsed(identifier));
    }

    for (const child of qtiChildren(next)) {
      pending.push(child);
    }
  }

  return read;
};

/**
 * What a response processing's rules set SCORE to.
 */
interface ScoreSettings {
  /**
   * Each constant the rules set SCORE to.
   */
  readonly constants: readonly number[];
  /**
   * Whether they also set SCORE to anything else or map a response.
   */
  readonly computed: boolean;
}

/**
 * What a response processing's rules set SCORE to: each constant it sets SCORE to, and whether it
 * also sets SCORE to anything else or maps a response (`qti-map-response`,
 * `qti-map-response-point`, §5.83, §5.84), which makes its score able to fall between its
 * constants.
 *
 * @param rules - The rules, as written or as the published template writes them.
 * @returns Its constants and whether it scores by anything else.
 */
const scoreSettings = (rules: readonly XmlElement[]): ScoreSettings => {
  const constants: number[] = [];
  let computed = false;
  const pending = [...rules];
  for (let next = pending.pop(); next !== undefined; next = pending.pop()) {
    const target = collapsed(attributeOf(next, "identifier") ?? "");
    if (next.local === "qti-map-response" || next.local === "qti-map-response-point") {
      computed = true;
    } else if (next.local === "qti-lookup-outcome-value" && target === "SCORE") {
      computed = true;
    } else if (next.local === "qti-set-outcome-value" && target === "SCORE") {
      const [only, ...rest] = qtiChildren(next);
      const written = only?.local === "qti-base-value" ? Number(textOf(only)) : Number.NaN;
      if (rest.length === 0 && Number.isFinite(written)) {
        constants.push(written);
      } else {
        computed = true;
      }
    }

    for (const child of qtiChildren(next)) {
      pending.push(child);
    }
  }

  return { computed, constants };
};

/**
 * SCORE where it is declared as QTI's score is: one single float or integer outcome (§5.108).
 *
 * @param declaration - The declaration named SCORE, if any.
 * @returns It, or `undefined` where it is no such outcome.
 */
const numericScore = (declaration: Declaration | undefined): Declaration | undefined =>
  declaration?.role === "outcome" &&
  declaration.type.cardinality === "single" &&
  (declaration.type.base === "float" || declaration.type.base === "integer")
    ? declaration
    : undefined;

/**
 * A multi-part item's parts each declared: its rules written inline, since every published
 * template reads `RESPONSE` alone, and reading every part (§5.113).
 *
 * @param parts - Its scored responses.
 * @param rules - The rules written inline.
 * @param template - The published template it names, if any.
 * @param processing - Its `qti-response-processing`.
 * @returns The parts, or the refusal.
 */
const partsDeclared = (
  parts: readonly string[],
  rules: readonly XmlElement[],
  template: XmlElement | undefined,
  processing: XmlElement,
): Checked<readonly string[]> => {
  if (parts.length <= 1) {
    return checked(parts);
  }

  if (template !== undefined) {
    return refused(
      "undeclared-scoring",
      processing.start,
      `declare how each of the item's ${String(parts.length)} parts scores: write the response processing inline, since a published template scores RESPONSE alone (QTI 3.0.1 §5.113)`,
    );
  }

  const read = responsesRead(rules);
  const unread = parts.filter((part) => !read.has(part));

  return unread.length === 0
    ? checked(parts)
    : refused(
        "undeclared-scoring",
        processing.start,
        `declare how every part scores: the response processing reads no ${unread.join(", ")} (QTI 3.0.1 §5.113)`,
      );
};

/**
 * An all-or-nothing item's maximum: the one constant above 0 its rules set SCORE to, which a
 * declared `normal-maximum` must equal.
 *
 * @param award - The constant above 0, if any.
 * @param normalMaximum - SCORE's `normal-maximum`, if declared.
 * @param processing - Its `qti-response-processing`.
 * @returns The maximum, or the refusal.
 */
const awardOf = (
  award: number | undefined,
  normalMaximum: number | undefined,
  processing: XmlElement,
): Checked<number> => {
  if (award === undefined) {
    return refused(
      "undeclared-scoring",
      processing.start,
      "declare what the item awards: its response processing sets SCORE to no value above 0 (QTI 3.0.1 §5.113)",
    );
  }

  return normalMaximum === undefined || normalMaximum === award
    ? checked(award)
    : refused(
        "undeclared-scoring",
        processing.start,
        "declare one maximum: SCORE's normal-maximum is not the constant the response processing awards (QTI 3.0.1 §5.108)",
      );
};

/**
 * A partial-capable item's maximum: SCORE's `normal-maximum`, above 0, with every mapping bounded
 * within it: a container's `lower-bound` 0 or more and `upper-bound` at most the maximum, a single
 * response's default and every mapped value within [0, maximum], since a mapping's bounds apply to
 * a container's sum alone (§5.83, reading `mapping-bounds`).
 *
 * @param normalMaximum - SCORE's `normal-maximum`, if declared.
 * @param declarations - The item's declarations.
 * @param processing - Its `qti-response-processing`.
 * @returns The maximum, or the refusal.
 */
const partialMaximumOf = (
  normalMaximum: number | undefined,
  declarations: ReadonlyMap<string, Declaration>,
  processing: XmlElement,
): Checked<number> => {
  if (normalMaximum === undefined || !(normalMaximum > 0)) {
    return refused(
      "undeclared-scoring",
      processing.start,
      "declare the maximum of an item whose credit can be partial: SCORE's normal-maximum above 0 (QTI 3.0.1 §5.108)",
    );
  }

  const within = (value: number): boolean => value >= 0 && value <= normalMaximum;
  const unbounded = [...declarations.values()].some((declaration) =>
    [declaration.mapping, declaration.areaMapping].some((mapping) => {
      if (mapping === undefined) {
        return false;
      }

      return declaration.type.cardinality === "single"
        ? !within(mapping.defaultValue) || mapping.entries.some((entry) => !within(entry.value))
        : !(mapping.lowerBound >= 0 && mapping.upperBound <= normalMaximum);
    }),
  );

  return unbounded
    ? refused(
        "undeclared-scoring",
        processing.start,
        "bound every mapping within the item's maximum: a container's lower-bound of 0 or more and upper-bound of at most SCORE's normal-maximum, a single response's default and every mapped value within them (QTI 3.0.1 §5.83, §5.108; reading `mapping-bounds`)",
      )
    : checked(normalMaximum);
};

/**
 * The scoring law (the ruling of 2026-11-28: partial credit is kept, and is declared by the item
 * alone; the grader infers, defaults and patches none), and the maximum it fixes, the one source of
 * the item's credit:
 *
 * - A writing item, one with an Extended Text interaction, is scored outside the rules of its
 *   response processing (an essay's verdict is an input, D8), so the law does not judge it; its
 *   maximum is SCORE's `normal-maximum` where it declares one (GC-PARTIAL's PARTIAL-1).
 * - An item that scores a response declares its response processing (§5.113,
 *   `qti-response-processing`: "the process by which the values of response variables are used to
 *   assign values to outcome variables"): rules written inline or a published template. Without one
 *   no outcome is assigned and the item would be served at its defaults, so it is refused.
 * - A scored item, one with a response bound to an interaction that is scored (an End Attempt's,
 *   which ends an attempt, and a Media interaction's, which counts plays, are not), declares a
 *   single numeric SCORE; an item that scores no response has no maximum.
 * - A multi-part item, two scored responses or more, declares how every part scores: its rules are
 *   written inline, since every published template reads `RESPONSE` alone and would leave a part
 *   unscored, and they read each part.
 * - An item whose credit can be partial (multi-part, a mapping declared or applied, or SCORE set to
 *   anything but constants, or to two different positive ones) declares SCORE's `normal-maximum`
 *   above 0 (§5.108), which is its maximum, and bounds every mapping within it, a `lower-bound` of
 *   0 or more and an `upper-bound` of at most that maximum (§5.83).
 * - An all-or-nothing item (one part, no mapping, SCORE set only to constants, one of them above 0,
 *   as `match_correct` sets 1) takes that constant as its maximum, read from the document; a
 *   `normal-maximum` it also declares is that constant.
 *
 * @param root - The item.
 * @param processing - Its `qti-response-processing`, if any.
 * @param rules - The rules written inline.
 * @param template - The published template it names, if any.
 * @param interactions - Its interactions.
 * @param declarations - Its declarations.
 * @returns Its maximum (none for an item that scores no response), or the refusal.
 */
const scoringOf = (
  root: XmlElement,
  processing: XmlElement | undefined,
  rules: readonly XmlElement[],
  template: XmlElement | undefined,
  interactions: readonly Interaction[],
  declarations: ReadonlyMap<string, Declaration>,
): Checked<number | undefined> => {
  if (interactions.some((interaction) => interaction.kind === "extended-text")) {
    return checked(declarations.get("SCORE")?.normalMaximum);
  }

  const parts = [
    ...new Set(
      interactions
        .filter((interaction) => interaction.kind !== "end-attempt" && interaction.kind !== "media")
        .map((interaction) => interaction.response),
    ),
  ];
  if (parts.length === 0) {
    return checked(declarations.get("SCORE")?.normalMaximum);
  }

  if (processing === undefined || (rules.length === 0 && template === undefined)) {
    return refused(
      "no-response-processing",
      processing?.start ?? root.start,
      "declare the item's scoring: write its qti-response-processing, inline or as a published template (QTI 3.0.1 §5.113)",
    );
  }

  const score = numericScore(declarations.get("SCORE"));
  if (score === undefined) {
    return refused(
      "undeclared-scoring",
      processing.start,
      "declare the item's score: a single numeric SCORE (QTI 3.0.1 §5.108)",
    );
  }

  const parted = partsDeclared(parts, rules, template, processing);
  if (!parted.ok) {
    return parted;
  }

  const settings = scoreSettings(template === undefined ? rules : qtiChildren(template));
  const mapped = [...declarations.values()].some(
    (declaration) => declaration.mapping !== undefined || declaration.areaMapping !== undefined,
  );
  const positive = [...new Set(settings.constants.filter((constant) => constant > 0))];
  const allOrNothing =
    parts.length === 1 &&
    !mapped &&
    !settings.computed &&
    positive.length <= 1 &&
    settings.constants.every((constant) => constant >= 0);

  return allOrNothing
    ? awardOf(positive[0], score.normalMaximum, processing)
    : partialMaximumOf(score.normalMaximum, declarations, processing);
};

/**
 * Where a test's element stands: its `start`, pantry's.
 *
 * @param element - The element.
 * @returns Its place.
 */
const placeAtStart = (element: XmlElement): number => element.start;

/**
 * Every element of a tree, itself among them.
 *
 * @param root - The tree's root.
 * @returns Its elements.
 */
const elementsOf = (root: XmlElement): ReadonlySet<XmlElement> => {
  const elements = new Set<XmlElement>();
  const pending: XmlElement[] = [root];
  for (let next = pending.pop(); next !== undefined; next = pending.pop()) {
    elements.add(next);
    for (const child of next.children) {
      if (child.kind === "element") {
        pending.push(child);
      }
    }
  }

  return elements;
};

/**
 * Where each element stands: a document's element at its `start`, pantry's, and a published
 * template's elements, which no stored document holds, after the document's every element, each
 * at its own start past the document's last.
 *
 * @param root - The document's root.
 * @param template - The published template its response processing names, if any.
 * @returns The place of each element.
 */
const placesWith = (
  root: XmlElement,
  template: XmlElement | undefined,
): ((element: XmlElement) => number) => {
  const own = elementsOf(root);
  let past = 0;
  for (const element of own) {
    past = Math.max(past, element.start + 1);
  }

  return (element) =>
    own.has(element) || template === undefined ? element.start : past + element.start;
};

/**
 * What an item's weighted read names: nothing, since weights are a test's (reading
 * `weight-identifier-placement`).
 */
const noVariable: VariableRef | undefined = undefined;

/**
 * What a test's map-response names: nothing, since a test maps no response.
 */
const noResponse: DeclaredResponse | undefined = undefined;

/**
 * The weight an unweighted read takes: none.
 */
const noWeight: string | undefined = undefined;

/**
 * The size of the image each point response's interaction shows: a Select Point's image, a Position
 * Object's stage.
 *
 * @param interactions - The item's interactions.
 * @returns Each response's image size.
 */
const imagesOf = (interactions: readonly Interaction[]): ReadonlyMap<string, ImageSize> =>
  new Map(
    interactions.flatMap((interaction): readonly (readonly [string, ImageSize])[] => {
      if (interaction.kind === "select-point") {
        return [[interaction.response, interaction.image]];
      }

      return interaction.kind === "position-object"
        ? [[interaction.response, interaction.stage]]
        : [];
    }),
  );

/**
 * The size of the image a `qti-inside`'s area lies on: the image of the interaction whose response
 * its operand reads, where its operand is a `qti-variable` of a point response.
 *
 * @param element - The `qti-inside`.
 * @param images - Each response's image size.
 * @returns The size, where known.
 */
const imageOfOperand = (
  element: XmlElement,
  images: ReadonlyMap<string, ImageSize>,
): ImageSize | undefined => {
  const [operand] = qtiChildren(element);

  return operand?.local === "qti-variable"
    ? images.get(collapsed(attributeOf(operand, "identifier") ?? ""))
    : undefined;
};

/**
 * A variable's reference to a declaration of the program's own.
 *
 * @param declaration - The declaration.
 * @returns The reference.
 */
const ownRef = (declaration: Declaration): VariableRef => ({
  identifier: declaration.identifier,
  role: declaration.role,
  scope: "own",
  type: declaration.type,
});

/**
 * The custom operator a `definition` names, at compile time: the registry's, which every entry
 * binds; a test binds its own operators.
 */
export type CustomOperatorOf = (definition: string) => CustomOperator | undefined;

/**
 * Compile an item against the custom operators a lookup names.
 *
 * @param root - The item's `qti-assessment-item`.
 * @param digest - The stored document's digest.
 * @param table - The standard operators.
 * @param customOperator - The custom operator each `definition` names.
 * @returns The compiled item, or the first refusal.
 */
export const compileItemOver = <K extends ExpressionKind>(
  root: XmlElement,
  digest: Digest,
  table: OperatorTable<K>,
  customOperator: CustomOperatorOf,
): Checked<CompiledItem> => {
  if (root.namespace !== qtiNamespace || root.local !== "qti-assessment-item") {
    return refused("element", 0, "compile a qti-assessment-item");
  }

  const processing = childNamed(root, "qti-response-processing");
  const rules = processing === undefined ? [] : qtiChildren(processing);
  const templateUri = processing === undefined ? undefined : attributeOf(processing, "template");
  const template =
    rules.length === 0 && templateUri !== undefined ? publishedTemplate(templateUri) : undefined;
  const unresolved =
    processing === undefined
      ? undefined
      : unresolvedProcessing(processing, processing.start, rules.length, templateUri, template);
  if (unresolved !== undefined) {
    return unresolved;
  }

  const placeOf = placesWith(root, template);
  const typed = declarationsOf(root, "item", placeOf, { kind: "skip" });
  if (!typed.ok) {
    return typed;
  }

  const interactions = interactionsOf(childNamed(root, "qti-item-body"), typed.value, placeOf);
  if (!interactions.ok) {
    return interactions;
  }

  const images = imagesOf(interactions.value);
  const declarations = declarationsOf(root, "item", placeOf, {
    imageOf: (response) => images.get(response),
    kind: "resolve",
  });
  if (!declarations.ok) {
    return declarations;
  }

  const declared = declarations.value;
  const scoring = scoringOf(root, processing, rules, template, interactions.value, declared);
  if (!scoring.ok) {
    return scoring;
  }

  const context: CompileContext = {
    area: (element, place) => resolveArea(element, imageOfOperand(element, images), place),
    customOperator,
    document: "item",
    response: (identifier) => {
      const declaration = declared.get(identifier);

      return declaration?.role === "response"
        ? {
            areaMapping: declaration.areaMapping,
            mapping: declaration.mapping,
            variable: ownRef(declaration),
          }
        : undefined;
    },
    variable: (identifier) => {
      const declaration = declared.get(identifier);

      return declaration === undefined ? undefined : ownRef(declaration);
    },
    weightedVariable: () => noVariable,
  };
  const rulesContext: RulesContext = {
    compileExpression: expressionCompiler(table, context, placeOf),
    context,
    declarations: declared,
    placeOf,
  };
  const templateProcessing = childNamed(root, "qti-template-processing");
  const templates = templateRulesOf(
    templateProcessing === undefined ? [] : qtiChildren(templateProcessing),
    rulesContext,
    true,
  );
  if (!templates.ok) {
    return templates;
  }

  const responses: Checked<readonly ResponseRule[]> =
    template === undefined
      ? responseRulesOf(rules, rulesContext)
      : responseRulesOf(qtiChildren(template), rulesContext);
  if (!responses.ok) {
    return responses;
  }

  const adaptive = readBoolean(collapsed(attributeOf(root, "adaptive") ?? "false"));

  return adaptive === undefined
    ? refused("attribute", 0, "write the item's adaptive as true or false")
    : checked({
        adaptive,
        declarations: declared,
        digest,
        identifier: collapsed(attributeOf(root, "identifier") ?? ""),
        interactions: interactions.value,
        kind: "item",
        maximum: scoring.value,
        responseProcessing: responses.value,
        templateProcessing: templates.value,
      });
};

/**
 * Compile an item against the registry.
 *
 * @param root - The item's `qti-assessment-item`.
 * @param digest - The stored document's digest.
 * @param table - The standard operators.
 * @returns The compiled item, or the first refusal.
 */
export const compileItemWith = <K extends ExpressionKind>(
  root: XmlElement,
  digest: Digest,
  table: OperatorTable<K>,
): Checked<CompiledItem> => compileItemOver(root, digest, table, customOperatorOf);

/**
 * The item session control in force: whether the test part submits individually, and the nearest
 * `validate-responses` written, if any.
 */
interface SessionControl {
  readonly individual: boolean;
  readonly validate: boolean | undefined;
}

/**
 * The control in force under an element: a test part's `submission-mode`, and the
 * `validate-responses` of its `qti-item-session-control` where it writes one (QTI 3.0.1 §7.19: "a
 * setting at qti-test-part level affects all items in that part unless the setting is overridden
 * at the qti-assessment-section level or ultimately at the individual qti-assessment-item-ref").
 *
 * @param element - A test part, a section or an item ref.
 * @param control - The control in force around it.
 * @returns The control in force under it.
 */
const controlOf = (element: XmlElement, control: SessionControl): SessionControl => {
  const session = childNamed(element, "qti-item-session-control");
  const written = session === undefined ? undefined : attributeOf(session, "validate-responses");
  const validate = written === undefined ? control.validate : readBoolean(collapsed(written));
  const individual =
    element.local === "qti-test-part"
      ? collapsed(attributeOf(element, "submission-mode") ?? "") === "individual"
      : control.individual;

  return { individual, validate };
};

/**
 * Every item ref of a test with the sections that hold it, in document order.
 *
 * @param element - A test part or a section.
 * @param sections - The sections that hold it.
 * @returns Each item ref element and its sections.
 */
const itemRefsOf = (
  element: XmlElement,
  sections: readonly string[],
  control: SessionControl,
): readonly {
  readonly element: XmlElement;
  readonly sections: readonly string[];
  readonly validate: boolean;
}[] =>
  qtiChildren(element).flatMap((child) => {
    const held = controlOf(child, control);
    if (child.local === "qti-assessment-item-ref") {
      return [{ element: child, sections, validate: held.individual && held.validate === true }];
    }

    return child.local === "qti-assessment-section" || child.local === "qti-test-part"
      ? itemRefsOf(
          child,
          child.local === "qti-assessment-section"
            ? [...sections, collapsed(attributeOf(child, "identifier") ?? "")]
            : sections,
          held,
        )
      : [];
  });

/**
 * An occurrence number and the variable after it, as `N.VAR` writes them.
 */
const occurrencePrefix = regex("^(?<occurrence>[1-9][0-9]*)\\.(?<variable>.+)$", "u");

/**
 * The member variable a prefixed identifier names: `ITEMREF.VAR` or `ITEMREF.N.VAR` (reading
 * `numbered-reference`), the longest item ref identifier that prefixes it first, since identifiers
 * may hold `.` (reading `identifier-dot`).
 *
 * @param identifier - The identifier.
 * @param members - The test's item refs by identifier.
 * @param weight - The weight a `weight-identifier` names, if any.
 * @returns The reference, or `undefined` where it names no item's variable.
 */
const memberRef = (
  identifier: string,
  members: ReadonlyMap<string, CompiledItem>,
  weight: string | undefined,
): VariableRef | undefined => {
  const refs = [...members.keys()]
    .filter((ref) => identifier.startsWith(`${ref}.`))
    .toSorted((left, right) => right.length - left.length);
  for (const ref of refs) {
    const item = members.get(ref);
    const rest = identifier.slice(ref.length + 1);
    const numbered = occurrencePrefix.exec(rest)?.groups;
    const occurrence = numbered?.occurrence;
    const numberedVariable = numbered?.variable;
    const variable =
      numberedVariable !== undefined && item?.declarations.has(numberedVariable) === true
        ? numberedVariable
        : rest;
    const declaration = item?.declarations.get(variable);
    if (declaration !== undefined) {
      return {
        item: ref,
        occurrence:
          variable === numberedVariable && occurrence !== undefined
            ? BigInt(occurrence)
            : undefined,
        role: declaration.role,
        scope: "member",
        type: declaration.type,
        variable,
        weight,
      };
    }
  }

  return undefined;
};

/**
 * Compile a test, against its items' compiled programs.
 *
 * @param root - The test's `qti-assessment-test`.
 * @param digest - The stored document's digest.
 * @param items - Each item ref's compiled item, by the ref's identifier.
 * @param table - The standard operators.
 * @returns The compiled test, or the first refusal.
 */
export const compileTestWith = <K extends ExpressionKind>(
  root: XmlElement,
  digest: Digest,
  items: ReadonlyMap<string, CompiledItem>,
  table: OperatorTable<K>,
): Checked<CompiledTest> => {
  if (root.namespace !== qtiNamespace || root.local !== "qti-assessment-test") {
    return refused("element", 0, "compile a qti-assessment-test");
  }

  const declarations = declarationsOf(root, "test", placeAtStart, { kind: "skip" });
  if (!declarations.ok) {
    return declarations;
  }

  const declared = declarations.value;
  const context: CompileContext = {
    area: (element, place) => resolveArea(element, undefined, place),
    customOperator: customOperatorOf,
    document: "test",
    response: () => noResponse,
    variable: (identifier) => {
      const declaration = declared.get(identifier);

      return declaration === undefined
        ? memberRef(identifier, items, noWeight)
        : ownRef(declaration);
    },
    weightedVariable: (identifier, weight) => memberRef(identifier, items, weight),
  };
  const compileExpression = expressionCompiler(table, context, placeAtStart);
  const rulesContext: RulesContext = {
    compileExpression,
    context,
    declarations: declared,
    placeOf: placeAtStart,
  };
  const itemRefs: CompiledItemRef[] = [];
  for (const { element, sections, validate } of itemRefsOf(root, [], {
    individual: false,
    validate: undefined,
  })) {
    const identifier = collapsed(attributeOf(element, "identifier") ?? "");
    const item = items.get(identifier);
    if (item === undefined) {
      return refused(
        "unknown-identifier",
        placeAtStart(element),
        `compile the item ${identifier} refers to first`,
      );
    }

    const templateDefaults: CompiledItemRef["templateDefaults"][number][] = [];
    for (const templateDefault of childrenNamed(element, "qti-template-default")) {
      const [expressionElement] = qtiChildren(templateDefault);
      const expression: Checked<Expression> =
        expressionElement === undefined
          ? refused(
              "arity",
              placeAtStart(templateDefault),
              "give the template default its expression",
            )
          : compileExpression(expressionElement);
      if (!expression.ok) {
        return expression;
      }

      templateDefaults.push({
        expression: expression.value,
        template: collapsed(attributeOf(templateDefault, "template-identifier") ?? ""),
      });
    }

    const weights = new Map<string, number>();
    for (const weight of childrenNamed(element, "qti-weight")) {
      weights.set(
        collapsed(attributeOf(weight, "identifier") ?? ""),
        Number(collapsed(attributeOf(weight, "value") ?? "1")),
      );
    }

    itemRefs.push({
      categories: collapsed(attributeOf(element, "category") ?? "")
        .split(" ")
        .filter((category) => category !== ""),
      identifier,
      item,
      sections,
      templateDefaults,
      validate,
      weights,
    });
  }

  const processing = childNamed(root, "qti-outcome-processing");
  const outcomes = outcomeRulesOf(
    processing === undefined ? [] : qtiChildren(processing),
    rulesContext,
  );

  return outcomes.ok
    ? checked({
        declarations: declared,
        digest,
        identifier: collapsed(attributeOf(root, "identifier") ?? ""),
        itemRefs,
        kind: "test",
        outcomeProcessing: outcomes.value,
      })
    : outcomes;
};
