/**
 * The template processing reader: a `qti-template-processing` read into the template rules the
 * item model holds as `Item.templateProcessing`.
 *
 * It reads each rule through the vocabulary's list of template rules (`modelled.templateRules` in
 * `#plate/vocabulary.ts`) and each expression through the registry's generic reader
 * (`readExpression` in `#plate/model/expressions/read.ts`), in the reading context the item model
 * builds, so the marks it records join the item's. Template processing that holds any element
 * outside that list, a rule of a malformed shape, or a rule that sets a record response is none,
 * each such element marked, as response processing is. It also holds the reader of a processing
 * condition's parts ({@link conditionParts}), which an item's response conditions
 * (`#plate/model/item.ts`) read through too. It value-imports the registry, the attribute leaf and
 * the vocabulary, never `#plate/model/item.ts`, which imports it.
 *
 * @module
 */
import { Array as Arr, Option, pipe } from "effect";
import type { SourceElement } from "#plate/document/source.ts";
import {
  elementsOf,
  identifierAttribute,
  isQti,
  soleChild,
  someChildren,
} from "#plate/model/attributes.ts";
import type { Expression, TemplateRule } from "#plate/model/expression.ts";
import { readExpression } from "#plate/model/expressions/read.ts";
import type { ExpressionReading } from "#plate/model/expressions/read.ts";
import { modelled } from "#plate/vocabulary.ts";

/**
 * The name of one template rule element, as the vocabulary lists it.
 */
type TemplateRuleName = (typeof modelled.templateRules)[number];

/**
 * What template processing reads through: the item's {@link ExpressionReading}, and the identifiers
 * of the item's record responses, which no template rule the engine runs may set.
 */
interface TemplateReading extends ExpressionReading {
  readonly recordResponses: ReadonlySet<string>;
}

/**
 * How one template rule element reads: into its rule, none when it holds anything the engine does
 * not run.
 */
type RuleReader = (reading: TemplateReading, element: SourceElement) => Option.Option<TemplateRule>;

/**
 * One branch of a processing condition, a `qti-<processing>-if` or `-else-if`: its condition and
 * the rules it runs, as `Branch` and `TemplateBranch` in `#plate/model/expression.ts` hold one.
 *
 * @template R The processing's rule.
 */
interface ConditionBranch<R> {
  readonly rules: readonly R[];
  readonly when: Expression;
}

/**
 * A processing condition's parts, read: its branches in document order, and its else's rules when
 * it has one.
 *
 * @template R The processing's rule.
 */
export interface ConditionParts<R> {
  readonly branches: readonly ConditionBranch<R>[];
  readonly otherwise: Option.Option<readonly R[]>;
}

/**
 * How one processing reads the parts of its condition element: the local names of its branch and
 * else elements, the expression reader of a branch's first child, the rule sequence of a branch's
 * rest and of the else's children, and the mark of a part that is none of them. Response,
 * template and outcome processing differ in these alone.
 *
 * @template R The processing's rule.
 */
export interface ConditionReading<R> {
  /**
   * The local names of the branch elements, the `-if` and the `-else-if`.
   */
  readonly branches: readonly [string, string];
  /**
   * The local name of the else element.
   */
  readonly otherwise: string;
  /**
   * Read a branch's condition.
   *
   * @param element The branch's first child element.
   * @returns The expression, none when it holds an element the engine does not run.
   */
  readonly expression: (element: SourceElement) => Option.Option<Expression>;
  /**
   * Read a sequence of rules, a branch's after its condition or an else's.
   *
   * @param elements The rule elements, in order.
   * @returns The rules, none when any holds an element the engine does not run.
   */
  readonly sequence: (elements: readonly SourceElement[]) => Option.Option<readonly R[]>;
  /**
   * Mark an element the engine does not run.
   *
   * @param element The element, marked by its name.
   * @returns None, so the condition that holds it is none.
   */
  readonly unread: (element: SourceElement) => Option.Option<never>;
}

/**
 * Construct a branch of a processing condition.
 *
 * @param when Its condition.
 * @param then The rules it runs.
 * @returns The branch.
 */
const branchOf = <R>(when: Expression, rules: readonly R[]): ConditionBranch<R> => ({
  rules,
  when,
});

/**
 * Read a branch of a processing condition: its first child is the condition and the rest are the
 * rules it runs.
 *
 * @param reading The processing's condition reading.
 * @param element The branch element.
 * @returns The branch, none when it holds no condition or an element the engine does not run.
 */
const branchIn = <R>(
  reading: ConditionReading<R>,
  element: SourceElement,
): Option.Option<ConditionBranch<R>> => {
  const [test, ...body] = someChildren(element);

  const when = reading.expression(test);
  const run = reading.sequence(body);

  return Option.all([when, run]).pipe(Option.map(([read, ran]) => branchOf(read, ran)));
};

/**
 * Report whether an element is a QTI element of one of some local names.
 *
 * @param element The element.
 * @param names The local names.
 * @returns Whether it is one of them.
 */
const isAmong = (element: SourceElement, names: readonly string[]): boolean =>
  names.some((name) => isQti(element, name));

/**
 * Read the parts of a processing condition element: each branch element in document order as its
 * branches, and its first else element as its otherwise; every other child is marked by its name.
 * Each part is read, so every element in each the engine does not run is marked, not only the
 * first. Response, template and outcome conditions differ only in what their
 * {@link ConditionReading} gives, so each can read its parts through this one reader.
 *
 * @param reading The processing's condition reading.
 * @param element The condition element.
 * @returns The parts, none when any part holds an element the engine does not run.
 */
export const conditionParts = <R>(
  reading: ConditionReading<R>,
  element: SourceElement,
): Option.Option<ConditionParts<R>> => {
  const parts = elementsOf(element);
  const branches: Option.Option<ConditionBranch<R>>[] = [];
  for (const part of parts.filter((each) => isAmong(each, reading.branches))) {
    branches.push(branchIn(reading, part));
  }

  const otherwise = Option.match(
    Arr.findFirst(parts, (part) => isQti(part, reading.otherwise)),
    {
      onNone: () => Option.some(Option.none<readonly R[]>()),
      onSome: (part) => pipe(reading.sequence(elementsOf(part)), Option.map(Option.some)),
    },
  );
  const strays: Option.Option<never>[] = [];
  for (const part of parts.filter(
    (each) => !isAmong(each, reading.branches) && !isQti(each, reading.otherwise),
  )) {
    strays.push(reading.unread(part));
  }

  return Option.all({
    branches: Option.all(branches),
    otherwise,
    strays: Option.all(strays),
  }).pipe(Option.map((read) => ({ branches: read.branches, otherwise: read.otherwise })));
};

/**
 * Read a sequence of template rules.
 *
 * @param reading The item's reading context.
 * @param elements The rule elements, in order.
 * @returns The rules, none when any holds an element the engine does not run.
 */
const sequence = (
  reading: TemplateReading,
  elements: readonly SourceElement[],
): Option.Option<readonly TemplateRule[]> => {
  const read: Option.Option<TemplateRule>[] = [];
  for (const element of elements) {
    read.push(rule(reading, element));
  }

  return Option.all(read);
};

/**
 * Read the one expression a setting rule or a `qti-template-constraint` holds.
 *
 * @param reading The item's reading context.
 * @param element The rule element.
 * @returns The expression; none when the element does not hold exactly one child element, the
 *   element then marked by its name, or when its expression holds an element the engine does not
 *   run.
 */
const soleExpression = (
  reading: TemplateReading,
  element: SourceElement,
): Option.Option<Expression> => readExpression(reading, soleChild(element));

/**
 * Read a rule that names its target variable and holds one expression: a
 * `qti-set-template-value`, a `qti-set-correct-response` or a `qti-set-default-value`.
 *
 * A `qti-set-correct-response` or `qti-set-default-value` whose target is a record response is
 * marked `record-set` at the rule, and its expression is still read, so what it holds is marked
 * too. An expression gives a value, never a record, so the engine sets no record, and such
 * template processing does not run: the response keeps the default and the correct response its
 * declaration writes. A record outcome or template variable is not a record response; a rule that
 * sets one is marked as a name the engine does not hold (`unheldIdentifiers` in
 * `#plate/model/processing.ts`).
 *
 * @param kind The rule's kind.
 * @returns Its reader: the rule, none when it sets a record response, when the element does not
 *   hold exactly one expression or when its expression holds an element the engine does not run.
 */
const setting =
  (kind: "set-correct-response" | "set-default-value" | "set-template-value"): RuleReader =>
  (reading, element) => {
    const identifier = identifierAttribute(reading.walk, element, "identifier");
    const setsRecord = kind !== "set-template-value" && reading.recordResponses.has(identifier);
    if (setsRecord) {
      reading.mark(element, "record-set");
    }

    const read = soleExpression(reading, element);

    return setsRecord
      ? Option.none()
      : read.pipe(Option.map((expression): TemplateRule => ({ expression, identifier, kind })));
  };

/**
 * Read a `qti-template-constraint`, which holds one expression.
 *
 * @param reading The item's reading context.
 * @param element The constraint.
 * @returns The rule, none when it does not hold exactly one expression or its expression holds an
 *   element the engine does not run.
 */
const constraint: RuleReader = (reading, element) => {
  const read = soleExpression(reading, element);

  return read.pipe(
    Option.map((expression): TemplateRule => ({ expression, kind: "template-constraint" })),
  );
};

/**
 * Read a `qti-template-condition`: its `qti-template-if` and each `qti-template-else-if` in order
 * as its branches, and its first `qti-template-else` as its otherwise, through
 * {@link conditionParts}, as a `qti-response-condition` reads its parts.
 *
 * @param reading The item's reading context.
 * @param element The condition.
 * @returns The rule, none when any part holds an element the engine does not run.
 */
const condition: RuleReader = (reading, element) =>
  pipe(
    conditionParts<TemplateRule>(
      {
        branches: ["qti-template-if", "qti-template-else-if"],
        expression: (test) => readExpression(reading, test),
        otherwise: "qti-template-else",
        sequence: (elements) => sequence(reading, elements),
        unread: (part) => reading.unread(part),
      },
      element,
    ),
    Option.map((parts): TemplateRule => ({
      branches: parts.branches,
      kind: "template-condition",
      otherwise: parts.otherwise,
    })),
  );

/**
 * Mark a part of a template condition met outside one, as a response rule reader marks an element
 * that is not a rule.
 *
 * @param reading The item's reading context.
 * @param element The part.
 * @returns None, so the processing that holds it is none.
 */
const misplaced: RuleReader = (reading, element) => reading.unread(element);

/**
 * Each template rule element's reader, by its name. The three parts of a template condition are
 * read by {@link condition}, so one met as a rule is misplaced.
 */
const readers = {
  "qti-exit-template": () => Option.some<TemplateRule>({ kind: "exit-template" }),
  "qti-set-correct-response": setting("set-correct-response"),
  "qti-set-default-value": setting("set-default-value"),
  "qti-set-template-value": setting("set-template-value"),
  "qti-template-condition": condition,
  "qti-template-constraint": constraint,
  "qti-template-else": misplaced,
  "qti-template-else-if": misplaced,
  "qti-template-if": misplaced,
} satisfies { readonly [Name in TemplateRuleName]: RuleReader };

/**
 * Read one template rule element through its reader; any element outside the vocabulary's template
 * rules is marked by its name.
 *
 * @param reading The item's reading context.
 * @param element The rule element.
 * @returns The rule, none when it holds an element the engine does not run.
 */
const rule = (reading: TemplateReading, element: SourceElement): Option.Option<TemplateRule> =>
  Option.match(
    Arr.findFirst(modelled.templateRules, (name) => isQti(element, name)),
    {
      onNone: () => reading.unread(element),
      onSome: (name) => readers[name](reading, element),
    },
  );

/**
 * Read a `qti-template-processing` into its template rules, in document order.
 *
 * A rule element outside the vocabulary's template rules, a rule of a malformed shape (a setting
 * rule or a constraint without exactly one expression, a branch with no condition, a stray part in
 * a condition), or a rule that sets a record response (`record-set`, {@link setting}) is marked at
 * its path, and the whole processing is then none, as `rules` in `#plate/model/processing.ts` reads
 * response processing. A `qti-exit-template` is read whatever it holds, as a `qti-exit-response`
 * is.
 *
 * @param reading The item's reading context, which `#plate/model/item.ts` builds for its build.
 * @param processing The `qti-template-processing` element.
 * @param recordResponses The identifiers of the item's record responses.
 * @returns The rules, none when any holds an element the engine does not run, each such element
 *   marked.
 */
export const templateRules = (
  reading: ExpressionReading,
  processing: SourceElement,
  recordResponses: ReadonlySet<string>,
): Option.Option<readonly TemplateRule[]> =>
  sequence({ ...reading, recordResponses }, elementsOf(processing));
