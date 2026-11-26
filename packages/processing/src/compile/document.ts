/**
 * The compiler of a stored document: an item (`qti-assessment-item`) or a test
 * (`qti-assessment-test`) into its compiled program, every expression typed and every reference
 * resolved, or the first refusal. The compiler is pure, so the shell caches a program by its
 * document's digest.
 *
 * @module
 */
import { regex } from "arkregex";
import type { Digest } from "#processing/graded.ts";
import type { Expression, ExpressionKind, VariableRef } from "#processing/ir.ts";
import { interactionsOf } from "#processing/compile/body.ts";
import { childNamed, childrenNamed, declarationsOf } from "#processing/compile/declarations.ts";
import { expressionCompiler, placesOf } from "#processing/compile/expression.ts";
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
import { customOperatorOf } from "#processing/registry.ts";
import { publishedTemplates } from "#processing/templates.generated.ts";
import { attributeOf, collapseXmlSpace, qtiChildren, qtiNamespace } from "#processing/xml.ts";
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
  const collapsed = collapseXmlSpace(uri);
  const prefix = templatePrefixes.find((each) => collapsed.startsWith(each));
  if (prefix === undefined) {
    return undefined;
  }

  const file = collapsed.slice(prefix.length);
  const name = file.endsWith(".xml") ? file.slice(0, -".xml".length) : file;

  return Object.hasOwn(publishedTemplates, name)
    ? Object.entries(publishedTemplates).find(([each]) => each === name)?.[1]
    : undefined;
};

/**
 * Where each element stands, a published template's elements placed after the document's own.
 *
 * @param root - The document's root.
 * @param template - The published template its response processing names, if any.
 * @returns The place of each element.
 */
const placesWith = (
  root: XmlElement,
  template: XmlElement | undefined,
): ((element: XmlElement) => number) => {
  const own = placesOf(root);
  const borrowed = template === undefined ? new Map<XmlElement, number>() : placesOf(template);

  return (element) => own.get(element) ?? own.size + (borrowed.get(element) ?? 0);
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
 * Compile an item.
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
): Checked<CompiledItem> => {
  if (root.namespace !== qtiNamespace || root.local !== "qti-assessment-item") {
    return refused("element", 0, "compile a qti-assessment-item");
  }

  const processing = childNamed(root, "qti-response-processing");
  const rules = processing === undefined ? [] : qtiChildren(processing);
  const templateUri = processing === undefined ? undefined : attributeOf(processing, "template");
  const template =
    rules.length === 0 && templateUri !== undefined ? publishedTemplate(templateUri) : undefined;
  const placeOf = placesWith(root, template);
  const declarations = declarationsOf(root, "item", placeOf);
  if (!declarations.ok) {
    return declarations;
  }

  const declared = declarations.value;
  const context: CompileContext = {
    customOperator: customOperatorOf,
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
    compileExpression: expressionCompiler(table, context, placesOf(root)),
    context,
    declarations: declared,
    placeOf,
  };
  const templateRulesContext: RulesContext =
    template === undefined
      ? rulesContext
      : {
          ...rulesContext,
          compileExpression: expressionCompiler(
            table,
            context,
            new Map(
              [...placesOf(template)].map(([element, place]) => [
                element,
                placesOf(root).size + place,
              ]),
            ),
          ),
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
      : responseRulesOf(qtiChildren(template), templateRulesContext);
  if (!responses.ok) {
    return responses;
  }

  const adaptive = readBoolean(collapseXmlSpace(attributeOf(root, "adaptive") ?? "false"));

  return adaptive === undefined
    ? refused("attribute", 0, "write the item's adaptive as true or false")
    : checked({
        adaptive,
        declarations: declared,
        digest,
        identifier: collapseXmlSpace(attributeOf(root, "identifier") ?? ""),
        interactions: interactionsOf(childNamed(root, "qti-item-body"), declared, placeOf),
        kind: "item",
        responseProcessing: responses.value,
        templateProcessing: templates.value,
      });
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
): readonly { readonly element: XmlElement; readonly sections: readonly string[] }[] =>
  qtiChildren(element).flatMap((child) => {
    if (child.local === "qti-assessment-item-ref") {
      return [{ element: child, sections }];
    }

    return child.local === "qti-assessment-section" || child.local === "qti-test-part"
      ? itemRefsOf(
          child,
          child.local === "qti-assessment-section"
            ? [...sections, collapseXmlSpace(attributeOf(child, "identifier") ?? "")]
            : sections,
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

  const places = placesOf(root);
  const placeOf = (element: XmlElement): number => places.get(element) ?? -1;
  const declarations = declarationsOf(root, "test", placeOf);
  if (!declarations.ok) {
    return declarations;
  }

  const declared = declarations.value;
  const context: CompileContext = {
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
  const compileExpression = expressionCompiler(table, context, places);
  const rulesContext: RulesContext = {
    compileExpression,
    context,
    declarations: declared,
    placeOf,
  };
  const itemRefs: CompiledItemRef[] = [];
  for (const { element, sections } of itemRefsOf(root, [])) {
    const identifier = collapseXmlSpace(attributeOf(element, "identifier") ?? "");
    const item = items.get(identifier);
    if (item === undefined) {
      return refused(
        "unknown-identifier",
        placeOf(element),
        `compile the item ${identifier} refers to first`,
      );
    }

    const templateDefaults: CompiledItemRef["templateDefaults"][number][] = [];
    for (const templateDefault of childrenNamed(element, "qti-template-default")) {
      const [expressionElement] = qtiChildren(templateDefault);
      const expression: Checked<Expression> =
        expressionElement === undefined
          ? refused("arity", placeOf(templateDefault), "give the template default its expression")
          : compileExpression(expressionElement);
      if (!expression.ok) {
        return expression;
      }

      templateDefaults.push({
        expression: expression.value,
        template: collapseXmlSpace(attributeOf(templateDefault, "template-identifier") ?? ""),
      });
    }

    const weights = new Map<string, number>();
    for (const weight of childrenNamed(element, "qti-weight")) {
      weights.set(
        collapseXmlSpace(attributeOf(weight, "identifier") ?? ""),
        Number(collapseXmlSpace(attributeOf(weight, "value") ?? "1")),
      );
    }

    itemRefs.push({
      categories: collapseXmlSpace(attributeOf(element, "category") ?? "")
        .split(" ")
        .filter((category) => category !== ""),
      identifier,
      item,
      sections,
      templateDefaults,
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
        identifier: collapseXmlSpace(attributeOf(root, "identifier") ?? ""),
        itemRefs,
        kind: "test",
        outcomeProcessing: outcomes.value,
      })
    : outcomes;
};
