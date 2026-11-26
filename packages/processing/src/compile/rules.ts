/**
 * The compiler of the processing languages' rules: response processing (§4.6), template processing
 * (§5.156) and outcome processing (§5.102). A fragment is a grouping of rules and is spliced where
 * it stands (§5.118, reading 117); a condition's branches are its if and each else-if in order, and
 * its else; a set's or a lookup's target is resolved against the document's declarations.
 *
 * @module
 */
import type { Expression, VariableRef } from "#processing/ir.ts";
import { checked, refused } from "#processing/operators/operator.ts";
import type { Checked, CompileContext } from "#processing/operators/operator.ts";
import type {
  Branch,
  Declaration,
  LookupRule,
  OutcomeRule,
  ResponseRule,
  TemplateRule,
} from "#processing/program.ts";
import { attributeOf, collapseXmlSpace, qtiChildren } from "#processing/xml.ts";
import type { XmlElement } from "#processing/xml.ts";

/**
 * What a rules compiler reads with: the document's expression compiler, its declarations and
 * context, and where each element stands.
 */
export interface RulesContext {
  readonly compileExpression: (element: XmlElement) => Checked<Expression>;
  readonly context: CompileContext;
  readonly declarations: ReadonlyMap<string, Declaration>;
  readonly placeOf: (element: XmlElement) => number;
}

/**
 * The names of one language's condition parts, fragment and rules.
 */
interface Language {
  readonly condition: string;
  readonly else: string;
  readonly elseIf: string;
  readonly fragment: string | undefined;
  readonly if: string;
}

/**
 * The one expression a rule element holds.
 *
 * @param element - The rule.
 * @param rules - The compiler's context.
 * @returns The compiled expression.
 */
const soleExpression = (element: XmlElement, rules: RulesContext): Checked<Expression> => {
  const [expression, ...rest] = qtiChildren(element);

  return expression === undefined || rest.length > 0
    ? refused("arity", rules.placeOf(element), `give ${element.local} one expression`)
    : rules.compileExpression(expression);
};

/**
 * The variable a rule's `identifier` names, of the roles it may set.
 *
 * @param element - The rule.
 * @param rules - The compiler's context.
 * @param settable - The roles the rule may set, and `completionStatus` where it may set that.
 * @returns The variable.
 */
const targetOf = (
  element: XmlElement,
  rules: RulesContext,
  settable: readonly Declaration["role"][],
): Checked<VariableRef> => {
  const place = rules.placeOf(element);
  const identifier = collapseXmlSpace(attributeOf(element, "identifier") ?? "");
  const declaration = rules.declarations.get(identifier);
  const builtInSet = identifier === "completionStatus" && settable.includes("outcome");
  if (declaration === undefined || (!settable.includes(declaration.role) && !builtInSet)) {
    return refused(
      "unknown-identifier",
      place,
      `${element.local} sets ${identifier}, which declares no ${settable.join(" or ")}`,
    );
  }

  return checked({ identifier, role: declaration.role, scope: "own", type: declaration.type });
};

/**
 * A `qti-lookup-outcome-value`: an outcome with a lookup table, set to what it maps (§5.72). An
 * outcome without one, `completionStatus` among them, is refused (reading 197).
 *
 * @param element - The rule.
 * @param rules - The compiler's context.
 * @returns The rule.
 */
const lookupOf = (element: XmlElement, rules: RulesContext): Checked<LookupRule> => {
  const place = rules.placeOf(element);
  const target = targetOf(element, rules, ["outcome"]);
  if (!target.ok) {
    return target;
  }

  const table = rules.declarations.get(
    target.value.scope === "own" ? target.value.identifier : "",
  )?.lookup;
  if (table === undefined) {
    return refused(
      "unknown-identifier",
      place,
      "look up an outcome that declares a lookup table (reading 197)",
    );
  }

  const expression = soleExpression(element, rules);

  return expression.ok
    ? checked({
        expression: expression.value,
        kind: "lookup-outcome",
        place,
        table,
        target: target.value,
      })
    : expression;
};

/**
 * A condition of a language: its if, each else-if and its else.
 *
 * @param element - The condition.
 * @param language - The language's names.
 * @param rules - The compiler's context.
 * @param compileRules - The language's compiler of a list of rules.
 * @returns The condition's branches and else.
 */
const conditionOf = <R>(
  element: XmlElement,
  language: Language,
  rules: RulesContext,
  compileRules: (children: readonly XmlElement[]) => Checked<readonly R[]>,
): Checked<{ readonly branches: readonly Branch<R>[]; readonly otherwise: readonly R[] }> => {
  const branches: Branch<R>[] = [];
  let otherwise: readonly R[] = [];
  for (const part of qtiChildren(element)) {
    if (part.local === language.else) {
      const body = compileRules(qtiChildren(part));
      if (!body.ok) {
        return body;
      }

      otherwise = body.value;
    } else if (part.local === language.if || part.local === language.elseIf) {
      const [test, ...body] = qtiChildren(part);
      if (test === undefined) {
        return refused("arity", rules.placeOf(part), `give ${part.local} its expression`);
      }

      const when = rules.compileExpression(test);
      if (!when.ok) {
        return when;
      }

      const then = compileRules(body);
      if (!then.ok) {
        return then;
      }

      branches.push({ rules: then.value, when: when.value });
    } else {
      return refused(
        "element",
        rules.placeOf(part),
        `${part.local} stands in no ${language.condition}`,
      );
    }
  }

  return checked({ branches, otherwise });
};

/**
 * The language of response processing.
 */
const responseLanguage: Language = {
  condition: "qti-response-condition",
  else: "qti-response-else",
  elseIf: "qti-response-else-if",
  fragment: "qti-response-processing-fragment",
  if: "qti-response-if",
};

/**
 * The language of outcome processing.
 */
const outcomeLanguage: Language = {
  condition: "qti-outcome-condition",
  else: "qti-outcome-else",
  elseIf: "qti-outcome-else-if",
  fragment: "qti-outcome-processing-fragment",
  if: "qti-outcome-if",
};

/**
 * The language of template processing, which has no fragment.
 */
const templateLanguage: Language = {
  condition: "qti-template-condition",
  else: "qti-template-else",
  elseIf: "qti-template-else-if",
  fragment: undefined,
  if: "qti-template-if",
};

/**
 * A language's rules with every fragment spliced where it stands.
 *
 * @param children - The rule elements.
 * @param language - The language.
 * @returns The rule elements, fragments spliced, in order.
 */
const spliced = (children: readonly XmlElement[], language: Language): readonly XmlElement[] =>
  children.flatMap((child) =>
    child.local === language.fragment ? spliced(qtiChildren(child), language) : [child],
  );

/**
 * Compile response processing's rules.
 *
 * @param children - The rule elements, in order.
 * @param rules - The compiler's context.
 * @returns The rules.
 */
export const responseRulesOf = (
  children: readonly XmlElement[],
  rules: RulesContext,
): Checked<readonly ResponseRule[]> => {
  const compiled: ResponseRule[] = [];
  for (const child of spliced(children, responseLanguage)) {
    const place = rules.placeOf(child);
    const rule = ((): Checked<ResponseRule> => {
      switch (child.local) {
        case "qti-response-condition": {
          const condition = conditionOf(child, responseLanguage, rules, (body) =>
            responseRulesOf(body, rules),
          );

          return condition.ok
            ? checked({ ...condition.value, kind: "condition", place })
            : condition;
        }
        case "qti-set-outcome-value": {
          const target = targetOf(child, rules, ["outcome"]);
          const expression = soleExpression(child, rules);
          if (!target.ok) {
            return target;
          }

          return expression.ok
            ? checked({
                expression: expression.value,
                kind: "set-outcome",
                place,
                target: target.value,
              })
            : expression;
        }
        case "qti-lookup-outcome-value": {
          return lookupOf(child, rules);
        }
        case "qti-exit-response": {
          return checked({ kind: "exit-response", place });
        }
        default: {
          return refused("element", place, `${child.local} is no response processing rule`);
        }
      }
    })();
    if (!rule.ok) {
      return rule;
    }

    compiled.push(rule.value);
  }

  return checked(compiled);
};

/**
 * Compile outcome processing's rules.
 *
 * @param children - The rule elements, in order.
 * @param rules - The compiler's context.
 * @returns The rules.
 */
export const outcomeRulesOf = (
  children: readonly XmlElement[],
  rules: RulesContext,
): Checked<readonly OutcomeRule[]> => {
  const compiled: OutcomeRule[] = [];
  for (const child of spliced(children, outcomeLanguage)) {
    const place = rules.placeOf(child);
    const rule = ((): Checked<OutcomeRule> => {
      switch (child.local) {
        case "qti-outcome-condition": {
          const condition = conditionOf(child, outcomeLanguage, rules, (body) =>
            outcomeRulesOf(body, rules),
          );

          return condition.ok
            ? checked({ ...condition.value, kind: "condition", place })
            : condition;
        }
        case "qti-set-outcome-value": {
          const target = targetOf(child, rules, ["outcome"]);
          const expression = soleExpression(child, rules);
          if (!target.ok) {
            return target;
          }

          return expression.ok
            ? checked({
                expression: expression.value,
                kind: "set-outcome",
                place,
                target: target.value,
              })
            : expression;
        }
        case "qti-lookup-outcome-value": {
          return lookupOf(child, rules);
        }
        case "qti-exit-test": {
          return checked({ kind: "exit-test", place });
        }
        default: {
          return refused("element", place, `${child.local} is no outcome processing rule`);
        }
      }
    })();
    if (!rule.ok) {
      return rule;
    }

    compiled.push(rule.value);
  }

  return checked(compiled);
};

/**
 * Compile template processing's rules. A constraint stands only at the top level (reading 22).
 *
 * @param children - The rule elements, in order.
 * @param rules - The compiler's context.
 * @param top - Whether the rules are template processing's own, not a condition's.
 * @returns The rules.
 */
export const templateRulesOf = (
  children: readonly XmlElement[],
  rules: RulesContext,
  top: boolean,
): Checked<readonly TemplateRule[]> => {
  const compiled: TemplateRule[] = [];
  for (const child of children) {
    const place = rules.placeOf(child);
    const set = (
      kind: "set-correct" | "set-default" | "set-template",
      roles: readonly Declaration["role"][],
    ): Checked<TemplateRule> => {
      const target = targetOf(child, rules, roles);
      const expression = soleExpression(child, rules);
      if (!target.ok) {
        return target;
      }

      return expression.ok
        ? checked({ expression: expression.value, kind, place, target: target.value })
        : expression;
    };
    const rule = ((): Checked<TemplateRule> => {
      switch (child.local) {
        case "qti-template-condition": {
          const condition = conditionOf(child, templateLanguage, rules, (body) =>
            templateRulesOf(body, rules, false),
          );

          return condition.ok
            ? checked({ ...condition.value, kind: "condition", place })
            : condition;
        }
        case "qti-set-template-value": {
          return set("set-template", ["template"]);
        }
        case "qti-set-correct-response": {
          return set("set-correct", ["response"]);
        }
        case "qti-set-default-value": {
          return set("set-default", ["outcome", "response"]);
        }
        case "qti-template-constraint": {
          if (!top) {
            return refused(
              "element",
              place,
              "write a qti-template-constraint directly in qti-template-processing (reading 22)",
            );
          }

          const expression = soleExpression(child, rules);

          return expression.ok
            ? checked({ expression: expression.value, kind: "constraint", place })
            : expression;
        }
        case "qti-exit-template": {
          return checked({ kind: "exit-template", place });
        }
        default: {
          return refused("element", place, `${child.local} is no template processing rule`);
        }
      }
    })();
    if (!rule.ok) {
      return rule;
    }

    compiled.push(rule.value);
  }

  return checked(compiled);
};
