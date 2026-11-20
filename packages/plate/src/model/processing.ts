/**
 * The item model's response processing: a `qti-response-processing` read into the rule tree the
 * engine runs, a built-in template resolved to the tree its text gives, and the analysis that
 * keeps a tree the engine can run, marking each identifier it does not hold and each need a
 * built-in template has that the item does not provide.
 *
 * @module
 */
import { Option, pipe } from "effect";
import { xincludeNamespace } from "#plate/document/source.ts";
import type { SourceElement } from "#plate/document/source.ts";
import {
  elementsOf,
  identifierAttribute,
  identifierOf,
  isQti,
  nameOf,
  pathOf,
  soleChild,
  valueOf,
} from "#plate/model/attributes.ts";
import { markAt, record } from "#plate/model/build.ts";
import { builtInNames } from "#plate/model/built-ins.ts";
import type { BuiltInName } from "#plate/model/built-ins.ts";
import type { Build } from "#plate/model/build.ts";
import { referencesOf } from "#plate/model/expression.ts";
import type {
  Branch,
  Expression,
  ExpressionKind,
  KindRule,
  Rule,
  TemplateRule,
} from "#plate/model/expression.ts";
import { kindRules, readExpression } from "#plate/model/expressions/read.ts";
import type { ExpressionReading } from "#plate/model/expressions/read.ts";
import type {
  OutcomeDeclaration,
  RecordDeclaration,
  ResponseDeclaration,
  TemplateDeclaration,
} from "#plate/model/item.ts";
import { completionStatus, qtiContextName } from "#plate/model/record.ts";
import { conditionParts } from "#plate/model/template.ts";
import { templateName } from "#plate/vocabulary.ts";
import type { TemplateName } from "#plate/vocabulary.ts";

/**
 * Record an element the engine does not run, as a mark keyed by its name or by its own feature.
 *
 * @param build The build.
 * @param element The element.
 * @param feature The mark's key, the element's name by default.
 * @returns None, so the rule tree that holds it is none.
 */
const unread = (
  build: Build,
  element: SourceElement,
  feature: string = nameOf(element),
): Option.Option<never> => {
  record(build, { feature, path: pathOf(build, element), shown: "mark" });

  return Option.none();
};

/**
 * Give the generic expression reader its context for a build: the walk, the names the item holds,
 * and the build's two ways to record a mark, so `record` and the build stay here.
 *
 * @param build The build.
 * @returns The reading context.
 */
export const readingOf = (build: Build): ExpressionReading => ({
  declared: build.names,
  mark: (element, feature) => {
    record(build, { feature, path: pathOf(build, element), shown: "mark" });
  },
  unread: (element) => unread(build, element),
  walk: build,
});

/**
 * Read an expression through the registry's generic reader (`readExpression` in
 * `#plate/model/expressions/read.ts`), each kind by its family's reader spec.
 *
 * Every operand is read, so every element the engine does not run is marked, not only the first. A
 * `qti-variable`'s optional `weight-identifier` is read and held; an item's processing never
 * evaluates it.
 *
 * @param build The build.
 * @param element The expression element.
 * @returns The expression, none when it holds anything the engine does not run.
 */
const expression = (build: Build, element: SourceElement): Option.Option<Expression> =>
  readExpression(readingOf(build), element);

/**
 * Construct a branch.
 *
 * @param when Its condition.
 * @param then The rules it runs.
 * @returns The branch.
 */
const branchOf = (when: Expression, body: readonly Rule[]): Branch => ({ rules: body, when });

/**
 * Read a sequence of response rules. A `qti-response-processing-fragment`'s rules take its place,
 * so the sequence holds no fragment.
 *
 * @param build The build.
 * @param elements The rule elements, in order.
 * @returns The rules, none when any holds an element the engine does not run.
 */
const rules = (
  build: Build,
  elements: readonly SourceElement[],
): Option.Option<readonly Rule[]> => {
  const read: Option.Option<readonly Rule[]>[] = [];
  for (const element of elements) {
    read.push(rule(build, element));
  }

  return Option.map(Option.all(read), (each) => each.flat());
};

/**
 * Read a `qti-response-condition`: its `qti-response-if` and each `qti-response-else-if` in order
 * as its branches, and its first `qti-response-else` as its otherwise, through the processing
 * condition reader template processing reads its conditions with (`conditionParts` in
 * `#plate/model/template.ts`).
 *
 * @param build The build.
 * @param element The condition.
 * @returns The rule, none when any part holds an element the engine does not run.
 */
const responseCondition = (build: Build, element: SourceElement): Option.Option<Rule> =>
  pipe(
    conditionParts<Rule>(
      {
        branches: ["qti-response-if", "qti-response-else-if"],
        expression: (test) => expression(build, test),
        otherwise: "qti-response-else",
        sequence: (elements) => rules(build, elements),
        unread: (part) => unread(build, part),
      },
      element,
    ),
    Option.map((parts): Rule => ({
      branches: parts.branches,
      kind: "condition",
      otherwise: parts.otherwise,
    })),
  );

/**
 * The mark of an XInclude `include` in response processing, which plate never fetches.
 */
const includeMark = "xi:include";

/**
 * Read the rule that holds one expression and names an outcome: a `qti-set-outcome-value` or a
 * `qti-lookup-outcome-value`.
 *
 * @param build The build.
 * @param element The rule element.
 * @param kind The rule's kind.
 * @returns The rule, none when it does not hold exactly one expression or its expression holds an
 *   element the engine does not run.
 */
const outcomeRule = (
  build: Build,
  element: SourceElement,
  kind: "lookup-outcome" | "set-outcome",
): Option.Option<Rule> => {
  const identifier = identifierAttribute(build, element, "identifier");
  const read = expression(build, soleChild(element));

  return read.pipe(Option.map((value): Rule => ({ expression: value, identifier, kind })));
};

/**
 * Read one response rule element into the rules it runs: a `qti-response-condition`, a
 * `qti-set-outcome-value`, a `qti-lookup-outcome-value` and a `qti-exit-response` are one rule
 * each, and a `qti-response-processing-fragment` is its own rules, read in place, nested fragments
 * included. An XInclude `include` is never fetched: it is marked `xi:include` at its path, so
 * the processing that holds it runs none.
 *
 * @param build The build.
 * @param element The rule element.
 * @returns The rules, none when it holds an element the engine does not run.
 */
const rule = (build: Build, element: SourceElement): Option.Option<readonly Rule[]> => {
  if (element.namespace === xincludeNamespace && element.local === "include") {
    return unread(build, element, includeMark);
  }

  if (isQti(element, "qti-response-processing-fragment")) {
    return rules(build, elementsOf(element));
  }

  if (isQti(element, "qti-exit-response")) {
    return Option.some<readonly Rule[]>([{ kind: "exit" }]);
  }

  if (isQti(element, "qti-set-outcome-value") || isQti(element, "qti-lookup-outcome-value")) {
    const kind = isQti(element, "qti-set-outcome-value") ? "set-outcome" : "lookup-outcome";
    const read = outcomeRule(build, element, kind);

    return read.pipe(Option.map((each) => [each]));
  }

  if (!isQti(element, "qti-response-condition")) {
    return unread(build, element);
  }

  const read = responseCondition(build, element);

  return read.pipe(Option.map((each) => [each]));
};

/**
 * Construct the rule that sets `SCORE`.
 *
 * @param operand Its value.
 * @returns The rule.
 */
const setScore = (operand: Expression): Rule => ({
  expression: operand,
  identifier: "SCORE",
  kind: "set-outcome",
});

/**
 * Construct a single float base value.
 *
 * @param value The number.
 * @returns The `base-value` expression of `value`.
 */
const floatValue = (value: number): Expression => ({
  kind: "base-value",
  operands: [],
  value: { baseType: "float", cardinality: "single", values: [{ baseType: "float", value }] },
});

/**
 * Construct a `qti-variable`.
 *
 * @param identifier The variable's identifier.
 * @returns The `variable` expression of `identifier`.
 */
const variableOf = (identifier: string): Expression => ({
  identifier,
  kind: "variable",
  operands: [],
  weightIdentifier: Option.none(),
});

/**
 * Construct the rule that sets an outcome to a single identifier base value.
 *
 * @param outcome The outcome's identifier.
 * @param value The identifier it is set to.
 * @returns The rule.
 */
const setIdentifier = (outcome: string, value: string): Rule => ({
  expression: {
    kind: "base-value",
    operands: [],
    value: {
      baseType: "identifier",
      cardinality: "single",
      values: [{ baseType: "identifier", value }],
    },
  },
  identifier: outcome,
  kind: "set-outcome",
});

/**
 * `match_correct`'s rules: `SCORE` is 1 when `RESPONSE` matches its correct response, else 0.
 * `CC2_match`'s file holds the same rules.
 */
const matchCorrect: readonly Rule[] = [
  {
    branches: [
      branchOf(
        {
          kind: "match",
          operands: [
            variableOf("RESPONSE"),
            { identifier: "RESPONSE", kind: "correct", operands: [] },
          ],
        },
        [setScore(floatValue(1))],
      ),
    ],
    kind: "condition",
    otherwise: Option.some([setScore(floatValue(0))]),
  },
];

/**
 * The built-in templates, as the rule trees their text gives: the files in QTI 3's `rptemplates`,
 * transcribed as data, so building an item reads no file. `map_response_point` is
 * `map_response` with `qti-map-response-point` in place of `qti-map-response`. Of the Common
 * Cartridge templates, `CC2_match` is `match_correct`; `CC2_match_basic` sets `SCORE` to `MAXSCORE`
 * and `FEEDBACKBASIC` to `correct` on a match, else `FEEDBACKBASIC` to `incorrect`; and
 * `CC2_map_response` is `map_response`, then sets `FEEDBACK` to `correct` when `MAXSCORE` and
 * `SCORE` are equal in `exact` mode, else to `incorrect`. A template's tree goes through
 * {@link runnable} as inline rules do, and is also checked for what it needs: one that names a
 * variable the item does not declare, such as `MAXSCORE`, is marked and never refused, and so is
 * one that needs a declaration the item does not provide, such as a `qti-mapping` or a `SCORE` of a
 * single float.
 */
const templates = {
  CC2_map_response: [
    {
      branches: [
        branchOf({ kind: "is-null", operands: [variableOf("RESPONSE")] }, [
          setScore(floatValue(0)),
        ]),
      ],
      kind: "condition",
      otherwise: Option.some([
        setScore({ identifier: "RESPONSE", kind: "map-response", operands: [] }),
      ]),
    },
    {
      branches: [
        branchOf(
          {
            includeLowerBound: true,
            includeUpperBound: true,
            kind: "equal",
            operands: [variableOf("MAXSCORE"), variableOf("SCORE")],
            tolerance: [],
            toleranceMode: "exact",
          },
          [setIdentifier("FEEDBACK", "correct")],
        ),
      ],
      kind: "condition",
      otherwise: Option.some([setIdentifier("FEEDBACK", "incorrect")]),
    },
  ],
  CC2_match: matchCorrect,
  CC2_match_basic: [
    {
      branches: [
        branchOf(
          {
            kind: "match",
            operands: [
              variableOf("RESPONSE"),
              { identifier: "RESPONSE", kind: "correct", operands: [] },
            ],
          },
          [setScore(variableOf("MAXSCORE")), setIdentifier("FEEDBACKBASIC", "correct")],
        ),
      ],
      kind: "condition",
      otherwise: Option.some([setIdentifier("FEEDBACKBASIC", "incorrect")]),
    },
  ],
  map_response: [
    {
      branches: [
        branchOf({ kind: "is-null", operands: [variableOf("RESPONSE")] }, [
          setScore(floatValue(0)),
        ]),
      ],
      kind: "condition",
      otherwise: Option.some([
        setScore({ identifier: "RESPONSE", kind: "map-response", operands: [] }),
      ]),
    },
  ],
  map_response_point: [
    {
      branches: [
        branchOf({ kind: "is-null", operands: [variableOf("RESPONSE")] }, [
          setScore(floatValue(0)),
        ]),
      ],
      kind: "condition",
      otherwise: Option.some([
        setScore({ identifier: "RESPONSE", kind: "map-response-point", operands: [] }),
      ]),
    },
  ],
  match_correct: matchCorrect,
} satisfies Record<TemplateName, readonly Rule[]>;

/**
 * The base type and cardinality a declaration has, as a value set to it must.
 */
type DeclaredType = Pick<OutcomeDeclaration, "baseType" | "cardinality">;

/**
 * One need a built-in template's tree has of the item for the engine to run it, named by the mark
 * it gives where the item does not provide it:
 *
 * - `mapping`: the response a `qti-map-response` names holds a `qti-mapping`, its mark
 *   `mapping:<response>`.
 * - `area-mapping`: the response a `qti-map-response-point` names holds a `qti-area-mapping`, its
 *   mark `area-mapping:<response>`.
 * - `outcome-type`: an outcome a `qti-set-outcome-value` sets to a literal is of the literal's type,
 *   its mark `outcome-type:<outcome>`.
 * - `outcome-variable`: an outcome a `qti-set-outcome-value` sets to a variable is of that variable's
 *   type, as `qti-variable` reads it, with the same mark.
 */
type TreeNeed =
  | { readonly kind: "area-mapping"; readonly response: string }
  | { readonly kind: "mapping"; readonly response: string }
  | { readonly kind: "outcome-type"; readonly outcome: string; readonly type: DeclaredType }
  | { readonly kind: "outcome-variable"; readonly outcome: string; readonly variable: string };

/**
 * The need of the `SCORE` every template but `CC2_match_basic` sets to a single float, its `0`,
 * its `1` or a mapped value.
 */
const floatScore: TreeNeed = {
  kind: "outcome-type",
  outcome: "SCORE",
  type: { baseType: "float", cardinality: "single" },
};

/**
 * The need of an outcome a Common Cartridge template sets to a single identifier, `correct` or
 * `incorrect`.
 *
 * @param outcome The outcome.
 * @returns Its need.
 */
const identifierFeedback = (outcome: string): TreeNeed => ({
  kind: "outcome-type",
  outcome,
  type: { baseType: "identifier", cardinality: "single" },
});

/**
 * What each built-in template's tree ({@link templates}) needs of the item, in the order the tree
 * first needs it, read off the tree: `SCORE` of the single float it is set to, `CC2_match_basic`'s
 * of its `MAXSCORE`'s type; the `qti-mapping` or `qti-area-mapping` of the `RESPONSE` it maps; and
 * the `FEEDBACK` or `FEEDBACKBASIC` a Common Cartridge template sets, a single identifier.
 * `qti-correct` and `qti-match` need nothing of their response: one with no correct response reads
 * NULL, which matches nothing.
 */
const treeNeeds: Readonly<Record<TemplateName, readonly TreeNeed[]>> = {
  CC2_map_response: [
    floatScore,
    { kind: "mapping", response: "RESPONSE" },
    identifierFeedback("FEEDBACK"),
  ],
  CC2_match: [floatScore],
  CC2_match_basic: [
    { kind: "outcome-variable", outcome: "SCORE", variable: "MAXSCORE" },
    identifierFeedback("FEEDBACKBASIC"),
  ],
  map_response: [floatScore, { kind: "mapping", response: "RESPONSE" }],
  map_response_point: [floatScore, { kind: "area-mapping", response: "RESPONSE" }],
  match_correct: [floatScore],
};

/**
 * A response processing's rule tree, and the built-in template it is.
 */
interface ProcessingTree {
  /**
   * The built-in template the tree is, none for inline rules.
   */
  readonly template: Option.Option<TemplateName>;
  readonly tree: readonly Rule[];
}

/**
 * Read a `qti-response-processing`.
 *
 * Inline rules take precedence over a template, as the information model says. A built-in
 * template becomes its rule tree; a `template` outside the built-ins is marked `template="<uri>"`
 * either way.
 *
 * @param build The build.
 * @param processing The processing element.
 * @returns The rule tree with the template it is, none when the engine cannot run it.
 */
export const processingOf = (
  build: Build,
  processing: SourceElement,
): Option.Option<ProcessingTree> => {
  const uri = valueOf(processing, "template");
  const builtIn = uri.pipe(Option.flatMap(templateName));
  if (Option.isSome(uri) && Option.isNone(builtIn)) {
    record(build, {
      feature: `template="${uri.value}"`,
      path: pathOf(build, processing),
      shown: "mark",
    });
  }

  const inline = elementsOf(processing);
  if (inline.length > 0 || Option.isNone(uri)) {
    return pipe(
      rules(build, inline),
      Option.map((tree) => ({ template: Option.none(), tree })),
    );
  }

  return builtIn.pipe(
    Option.map((name) => ({ template: Option.some(name), tree: templates[name] })),
  );
};

/**
 * The elements whose `identifier` declares an item variable.
 */
const declarationElements: readonly string[] = [
  "qti-context-declaration",
  "qti-outcome-declaration",
  "qti-response-declaration",
  "qti-template-declaration",
];

/**
 * Give the identifier of each variable an item's declarations declare: its response, outcome,
 * template and context declarations.
 *
 * @param root The item's root.
 * @returns The declared identifiers.
 */
export const declaredIdentifiers = (root: SourceElement): ReadonlySet<string> =>
  new Set(
    elementsOf(root)
      .filter((child) => declarationElements.some((local) => isQti(child, local)))
      .flatMap((declaration) =>
        Option.match(valueOf(declaration, "identifier"), {
          onNone: () => [],
          onSome: (identifier) => [identifierOf(identifier)],
        }),
      ),
  );

/**
 * The kind each built-in variable the engine holds stands as (reading 111, "a processing element's
 * `identifier` names a variable of the kind the element reads or sets"): the built-in response
 * `numAttempts` and the built-in outcome `completionStatus`. A rule that sets or reads a variable
 * of a kind names the built-ins of that kind too: `qti-set-outcome-value` and
 * `qti-lookup-outcome-value` set `completionStatus`, `qti-set-default-value` sets either one's
 * default, `qti-set-correct-response` sets the correct response of `numAttempts`, and `qti-correct`
 * reads it (`targetOf` in `#plate/engine/template.ts`, `evaluateCorrect` in
 * `#plate/engine/expressions/references.ts`).
 */
const builtInKinds: ReadonlyMap<string, "outcome" | "response"> = new Map<
  BuiltInName,
  "outcome" | "response"
>([
  [completionStatus, "outcome"],
  ["numAttempts", "response"],
]);

/**
 * The built-in variables the engine holds a value of for every item: each of {@link builtInKinds},
 * `numAttempts`, the attempt count `runAttempt` in `#plate/engine/attempt.ts` passes, and
 * `completionStatus`, which the session record holds among its outcomes (`outcomeDefaults` in
 * `#plate/model/record.ts`). No declaration of a checked item takes one's name, since the database
 * refuses it ("Declaration not reserved", sections 4.5.1, 5.34.1, 5.115.1 and 5.151.1), so no
 * declared variable stands in their place. `duration` is never held.
 */
export const heldBuiltIns: ReadonlySet<string> = new Set(builtInKinds.keys());

/**
 * Give the names of the variables an item holds: every identifier its declarations declare and
 * every built-in variable. `qti-pattern-match`'s `pattern` is a reference only when it braces one
 * of them, and an unchecked reference, such as a `qti-equal`'s `tolerance` token, is judged only
 * when it names one of them.
 *
 * @param root The item's root.
 * @returns The names.
 */
export const declaredNames = (root: SourceElement): ReadonlySet<string> =>
  new Set([...declaredIdentifiers(root), ...builtInNames]);

/**
 * The kinds of response and template rule that set a variable, each naming its target in
 * `identifier`.
 */
type SettingKind = Extract<Rule | TemplateRule, { readonly identifier: string }>["kind"];

/**
 * The kinds that read a record whole as an operand: `qti-field-value`, `qti-is-null` and
 * `qti-match` (`recordOrValue` in `#plate/engine/refs.ts`).
 */
const recordReaders: ReadonlySet<ExpressionKind> = new Set(["field-value", "is-null", "match"]);

/**
 * Report whether an operand names a record response the engine holds, as the engine reads one: a
 * `qti-variable`, a `qti-default` or a `qti-correct` of it.
 *
 * @param operand The operand.
 * @param heldRecords The record responses the engine holds while the tree runs.
 * @returns Whether it names one.
 */
const namesHeldRecord = (operand: Expression, heldRecords: ReadonlySet<string>): boolean =>
  (operand.kind === "variable" || operand.kind === "default" || operand.kind === "correct") &&
  heldRecords.has(operand.identifier);

/**
 * The context variables the engine holds while an item's processing runs: the built-in record
 * `QTI_CONTEXT`, unless a declaration of the item names a variable by that name, which then wins as
 * every declared variable does; and the context variables the model holds
 * ({@link Item.contexts}), each at its default.
 */
export interface HeldContexts {
  readonly builtIn: boolean;
  readonly declared: ReadonlySet<string>;
}

/**
 * Give each identifier a rule tree names that the engine does not hold, once, in the order the tree
 * first names it: a response processing's tree of {@link Rule} or a template processing's tree of
 * {@link TemplateRule}.
 *
 * The evaluator holds only the item's modelled responses, outcomes and template variables and the
 * built-in `numAttempts` and `completionStatus` ({@link heldBuiltIns}; `Variables` in
 * `#plate/engine/evaluate.ts`) and returns `UnknownIdentifierError` for any other identifier a rule
 * names, so `buildItem` runs no tree this walk finds a name in, and that failure stays
 * unreachable. A template variable the model holds is held while template processing runs, and
 * beside response processing only when template processing runs or is absent: the record then
 * holds its value, as template processing or its declared default left it. The walk reads each
 * expression through its kind's rule in the registry (`kindRules` in
 * `#plate/model/expressions/read.ts`), in place of a case per kind:
 *
 * - The declaration facet: the `identifier` of a kind that expects a response, such as `qti-correct`,
 *   `qti-map-response` and `qti-map-response-point`, names one the engine holds only among the
 *   responses, and, for `qti-correct`, the built-in response `numAttempts` the engine holds, whose
 *   correct response the engine reads (`evaluateCorrect` in
 *   `#plate/engine/expressions/references.ts`), though it holds no mapping of it; that of a kind
 *   that expects any variable, such as `qti-variable`, among the responses, the outcomes, the
 *   template variables and the built-in variables, and, for `qti-variable` alone, among the context
 *   variables the model holds ({@link HeldContexts}), which the engine holds at their defaults but
 *   whose default a `qti-default` does not read.
 * - The reference facet: each variable an attribute names (`referencesOf`), before the operands, in
 *   the facet's order. A checked reference names one the engine holds as `qti-variable` does. An
 *   unchecked one, a `qti-equal`'s `tolerance` token, is judged only when a declaration or a
 *   built-in names it: one that names nothing is never marked, and gives NULL at run time.
 * - The operands, which every kind holds in `operands`, so the walk recurses without a case per
 *   operator. A record response the engine holds is held as an operand of `qti-field-value`,
 *   `qti-is-null` or `qti-match`, the three kinds that read a record whole, named by a
 *   `qti-variable`, a `qti-default` or a `qti-correct` ({@link namesHeldRecord}); anywhere else it
 *   is a name the engine holds no value of. The built-in record `QTI_CONTEXT`, where no declaration
 *   names it, is held as such an operand when a `qti-variable` names it, in template and response
 *   processing alike, since the engine sets it before any processing runs.
 *
 * Each setting rule's target is judged as the engine finds it: `qti-set-outcome-value` and
 * `qti-lookup-outcome-value` set an outcome, or the built-in `completionStatus` where the engine
 * holds it ({@link builtInKinds}), never a template variable, which only template processing sets;
 * `qti-set-template-value` sets a template variable, `qti-set-correct-response` a response, the
 * built-in `numAttempts` where the engine holds it among them, and `qti-set-default-value` a
 * response or an outcome, either built-in among them (`targetOf` in `#plate/engine/template.ts`).
 * The names it finds are valid content, never refused (reading 1): a response, an
 * outcome or a template variable the engine does not hold (cardinality `record`, a record response
 * the model holds in `records` read other than as such an operand among them, or no base type), a
 * template variable beside template processing that does not run, the built-in
 * variable `duration`, read or set, which the engine holds no value for, and the built-in
 * `completionStatus` where a declaration names it. Reading 29 makes an item's `duration` a single
 * float, so it is a valid name in an item's rules. Template and response processing may read
 * `QTI_CONTEXT` and each variable a `qti-context-declaration` declares (section 5.34, and a
 * reference to `QTI_CONTEXT` "must succeed", section 2.2.2.1): the walk finds `QTI_CONTEXT`
 * read other than whole, a context variable of a type the model does not hold, and a context
 * variable read other than by `qti-variable`, which the engine holds no value of. An identifier
 * nothing declares is refused before the model is built when inline rules name it; the walk finds
 * it too. One a built-in template names, such as `MAXSCORE` or `FEEDBACK` in a `CC2_*` template, is
 * not in the document, so nothing refuses it: the walk finds it, and the processing is marked.
 *
 * @param tree The rule tree.
 * @param responses The responses the model holds.
 * @param outcomes The outcomes the model holds.
 * @param heldTemplates The template variables the engine holds a value of: the model's, or none
 *   beside template processing that does not run.
 * @param heldRecords The record responses the engine holds a record of while the tree runs: the
 *   model's `records` beside response processing, none in template processing, which the engine
 *   gives no response value.
 * @param builtIns The built-in variables the engine holds for this item ({@link heldBuiltIns}).
 * @param names The names of the variables the item holds ({@link declaredNames}).
 * @param contexts The context variables the engine holds while the tree runs.
 * @returns The identifiers the engine does not hold, empty when it can run the tree.
 */
export const unheldIdentifiers = (
  tree: readonly Rule[] | readonly TemplateRule[],
  responses: ReadonlyMap<string, ResponseDeclaration>,
  outcomes: ReadonlyMap<string, OutcomeDeclaration>,
  heldTemplates: ReadonlyMap<string, TemplateDeclaration>,
  heldRecords: ReadonlySet<string>,
  builtIns: ReadonlySet<string>,
  names: ReadonlySet<string>,
  contexts: HeldContexts,
): readonly string[] => {
  const unheld = new Set<string>();

  /**
   * Report whether the engine holds a variable of a name, as `qti-variable` reads it.
   *
   * @param identifier The name.
   * @returns Whether a response, an outcome, a template variable or a built-in variable the engine
   *   holds has it.
   */
  const isHeld = (identifier: string): boolean =>
    responses.has(identifier) ||
    outcomes.has(identifier) ||
    heldTemplates.has(identifier) ||
    builtIns.has(identifier);

  /**
   * Report whether the engine holds a built-in of a kind by a name ({@link builtInKinds}).
   *
   * @param kind The kind the built-in stands as.
   * @param identifier The name.
   * @returns Whether the engine holds a built-in of that kind by that name.
   */
  const isBuiltIn = (kind: "outcome" | "response", identifier: string): boolean =>
    builtIns.has(identifier) && builtInKinds.get(identifier) === kind;

  /**
   * Add each identifier an expression and its operands read that the engine does not hold: the
   * declaration its kind's declaration facet names, then each variable its attributes name, then
   * those of its operands, but for an operand that names a held record response under a kind that
   * reads a record whole ({@link namesHeldRecord}).
   *
   * @param operand The expression.
   */
  const read = (operand: Expression): void => {
    const kindRule: KindRule = kindRules[operand.kind];
    if (kindRule.declaration !== undefined && "identifier" in operand) {
      const held =
        kindRule.declaration.expected === "response"
          ? responses.has(operand.identifier) ||
            (operand.kind === "correct" && isBuiltIn("response", operand.identifier))
          : isHeld(operand.identifier) ||
            (operand.kind === "variable" && contexts.declared.has(operand.identifier));
      if (!held) {
        unheld.add(operand.identifier);
      }
    }

    for (const { checked, identifier } of referencesOf(operand, kindRule)) {
      if ((checked || names.has(identifier)) && !isHeld(identifier)) {
        unheld.add(identifier);
      }
    }

    const readsRecords = recordReaders.has(operand.kind);
    for (const each of operand.operands) {
      const namesQtiContext =
        contexts.builtIn && each.kind === "variable" && each.identifier === qtiContextName;
      if (!(readsRecords && (namesHeldRecord(each, heldRecords) || namesQtiContext))) {
        read(each);
      }
    }
  };

  /**
   * Report whether the engine holds an outcome a rule may set by a name: a modelled outcome, or the
   * built-in outcome it holds ({@link builtInKinds}).
   *
   * @param identifier The name.
   * @returns Whether a set or a lookup of it runs.
   */
  const isSettable = (identifier: string): boolean =>
    outcomes.has(identifier) || isBuiltIn("outcome", identifier);

  /**
   * Report whether the engine holds a response whose correct response or default a template rule
   * may set by a name: a modelled response, or the built-in response it holds ({@link
   * builtInKinds}).
   *
   * @param identifier The name.
   * @returns Whether a set of its correct response or default runs.
   */
  const isResponse = (identifier: string): boolean =>
    responses.has(identifier) || isBuiltIn("response", identifier);

  /**
   * Whether the engine holds the variable each kind of setting rule sets by a name.
   */
  const targets: Readonly<Record<SettingKind, (identifier: string) => boolean>> = {
    "lookup-outcome": isSettable,
    "set-correct-response": isResponse,
    "set-default-value": (identifier) => isResponse(identifier) || isSettable(identifier),
    "set-outcome": isSettable,
    "set-template-value": (identifier) => heldTemplates.has(identifier),
  };

  /**
   * Add each identifier a rule sequence names, nested branches included, that the engine does not
   * hold: each variable it sets or looks up, and each identifier its expressions read. An exit
   * names none.
   *
   * @param sequence The rules, in order.
   */
  const run = (sequence: readonly (Rule | TemplateRule)[]): void => {
    for (const each of sequence) {
      if (each.kind === "condition" || each.kind === "template-condition") {
        for (const branch of each.branches) {
          read(branch.when);
          run(branch.rules);
        }
        const otherwise: Option.Option<readonly (Rule | TemplateRule)[]> = each.otherwise;
        if (Option.isSome(otherwise)) {
          run(otherwise.value);
        }
      } else if (each.kind === "template-constraint") {
        read(each.expression);
      } else if (each.kind !== "exit" && each.kind !== "exit-template") {
        if (!targets[each.kind](each.identifier)) {
          unheld.add(each.identifier);
        }

        read(each.expression);
      }
    }
  };
  run(tree);

  return [...unheld];
};

/**
 * Give every expression a rule tree holds, operands and nested branches included, in the order the
 * tree names them.
 *
 * @param tree The rule tree.
 * @returns The expressions.
 */
const expressionsOf = (tree: readonly Rule[]): readonly Expression[] => {
  const found: Expression[] = [];

  /**
   * Add an expression and, after it, each of its operands.
   *
   * @param operand The expression.
   */
  const add = (operand: Expression): void => {
    found.push(operand);
    for (const each of operand.operands) {
      add(each);
    }
  };

  /**
   * Add the expressions of a rule sequence: a set's and a lookup's expression, and each branch's
   * condition and rules. An exit holds none.
   *
   * @param sequence The rules, in order.
   */
  const run = (sequence: readonly Rule[]): void => {
    for (const each of sequence) {
      if (each.kind === "condition") {
        for (const branch of each.branches) {
          add(branch.when);
          run(branch.rules);
        }
        if (Option.isSome(each.otherwise)) {
          run(each.otherwise.value);
        }
      } else if (each.kind !== "exit") {
        add(each.expression);
      }
    }
  };
  run(tree);

  return found;
};

/**
 * Report whether a rule tree maps a point through an area mapping that has a `%` coordinate, which
 * the engine does not run: the information model does not say what a percentage means in scoring.
 *
 * @param tree The rule tree.
 * @param responses The responses the model holds.
 * @returns Whether a `qti-map-response-point` in the tree names a response whose area mapping's
 *   `percent` is true.
 */
const readsPercentArea = (
  tree: readonly Rule[],
  responses: ReadonlyMap<string, ResponseDeclaration>,
): boolean =>
  expressionsOf(tree).some(
    (each) =>
      each.kind === "map-response-point" &&
      Option.exists(
        Option.flatMap(
          Option.fromUndefinedOr(responses.get(each.identifier)),
          (response) => response.areaMapping,
        ),
        (mapping) => mapping.percent,
      ),
  );

/**
 * Give the mark `outcome-type:<outcome>` where a value set to an outcome is not of its type.
 *
 * @param outcomes The outcomes the model holds.
 * @param outcome The outcome set.
 * @param value The type of the value it is set to, none when the engine holds no variable it reads.
 * @returns The mark, none when the outcome has the value's type or the engine holds no such
 *   outcome.
 */
const mistyped = (
  outcomes: ReadonlyMap<string, OutcomeDeclaration>,
  outcome: string,
  value: Option.Option<DeclaredType>,
): Option.Option<string> =>
  Option.all([Option.fromUndefinedOr(outcomes.get(outcome)), value]).pipe(
    Option.filter(
      ([declared, set]) =>
        set.baseType !== declared.baseType || set.cardinality !== declared.cardinality,
    ),
    Option.as(`outcome-type:${outcome}`),
  );

/**
 * Give the mark of one need of a built-in template's tree ({@link treeNeeds}) that the item does
 * not provide, as the engine would fail on it: `UnmappedResponseError` for a `qti-map-response` of
 * a response with no `qti-mapping` or a `qti-map-response-point` of one with no
 * `qti-area-mapping`, and `OutcomeMismatchError` for a `qti-set-outcome-value` whose value is not
 * of the outcome's type (`#plate/engine/evaluate.ts`). A need of a variable the engine does not
 * hold is not judged: {@link unheldIdentifiers} marks the variable, a `record` outcome among them.
 * A variable set to an outcome is read as `qti-variable` reads it, among the responses, the
 * outcomes and the template variables; no template reads a built-in.
 *
 * @param need The need.
 * @param responses The responses the model holds.
 * @param outcomes The outcomes the model holds.
 * @param heldTemplates The template variables the engine holds a value of
 *   ({@link unheldIdentifiers}).
 * @returns The need's mark, none when the item provides it.
 */
const unmetNeed = (
  need: TreeNeed,
  responses: ReadonlyMap<string, ResponseDeclaration>,
  outcomes: ReadonlyMap<string, OutcomeDeclaration>,
  heldTemplates: ReadonlyMap<string, TemplateDeclaration>,
): Option.Option<string> => {
  switch (need.kind) {
    case "area-mapping": {
      return Option.fromUndefinedOr(responses.get(need.response)).pipe(
        Option.filter((response) => Option.isNone(response.areaMapping)),
        Option.as(`area-mapping:${need.response}`),
      );
    }
    case "mapping": {
      return Option.fromUndefinedOr(responses.get(need.response)).pipe(
        Option.filter((response) => Option.isNone(response.mapping)),
        Option.as(`mapping:${need.response}`),
      );
    }
    case "outcome-type": {
      return mistyped(outcomes, need.outcome, Option.some(need.type));
    }
    case "outcome-variable": {
      return mistyped(
        outcomes,
        need.outcome,
        Option.fromUndefinedOr(
          responses.get(need.variable) ??
            outcomes.get(need.variable) ??
            heldTemplates.get(need.variable),
        ),
      );
    }
    default: {
      return need satisfies never;
    }
  }
};

/**
 * Give each declaration a built-in template's rule tree needs and the item does not provide, as
 * the mark that names it, in the order the tree first needs it ({@link treeNeeds}).
 *
 * The database refuses inline rules that map a response with no mapping or set an outcome to
 * another type (pantry's "Mapped response" and "Set type"), and a lookup of an outcome that is not
 * single (reading 100), so no inline rule has a need this judges. A built-in template's needs
 * neither the database nor plate judges, so this judges every need of a built-in template's tree,
 * and {@link runnable} runs no tree it finds a need in, so those failures stay unreachable from an
 * accepted item.
 *
 * @param template The built-in template.
 * @param responses The responses the model holds.
 * @param outcomes The outcomes the model holds.
 * @param heldTemplates The template variables the engine holds a value of
 *   ({@link unheldIdentifiers}).
 * @returns The marks, empty when every need is met.
 * @see https://www.imsglobal.org/spec/qti/v3p0/info#ExpMapResponse
 * @see https://www.imsglobal.org/spec/qti/v3p0/info#Data_SetValue
 */
const unmetNeeds = (
  template: TemplateName,
  responses: ReadonlyMap<string, ResponseDeclaration>,
  outcomes: ReadonlyMap<string, OutcomeDeclaration>,
  heldTemplates: ReadonlyMap<string, TemplateDeclaration>,
): readonly string[] =>
  treeNeeds[template].flatMap((need) =>
    Option.toArray(unmetNeed(need, responses, outcomes, heldTemplates)),
  );

/**
 * A response processing read into a rule tree, with where its marks go.
 */
export interface ReadProcessing extends ProcessingTree {
  /**
   * The number of marks recorded when the processing element was read, so the marks it gains later
   * keep document order.
   */
  readonly at: number;
  /**
   * The `qti-response-processing` element's path.
   */
  readonly path: string;
}

/**
 * A template processing read into its rules, with where its marks go.
 */
export interface ReadTemplateProcessing {
  /**
   * The number of marks recorded when its rules were read, so the marks it gains later keep
   * document order.
   */
  readonly at: number;
  /**
   * The `qti-template-processing` element's path.
   */
  readonly path: string;
  readonly tree: readonly TemplateRule[];
}

/**
 * Keep a response processing's rule tree the engine can run. Each identifier
 * {@link unheldIdentifiers} finds is the mark `variable:<identifier>` at the processing element's
 * path, each need {@link unmetNeeds} finds in a built-in template's tree is its mark there
 * (`mapping:<identifier>`, `area-mapping:<identifier>` or `outcome-type:<identifier>`), and a tree
 * that maps a point through
 * an area mapping with a `%` coordinate ({@link readsPercentArea}) is the mark
 * `area-coords-percent` there. The marks are placed among the others in document order
 * ({@link markAt}), and the tree is then none. So a built-in template the item does not provide
 * for, a `CC2_*` one or a canonical one whose `SCORE` has the base type
 * `template-requirements` asks for and another cardinality, is marked and does not run, and is
 * never refused. Inline rules are not judged for needs: the database refuses the inline rules that
 * have one (reading 100 for a lookup). `buildItem` judges a template
 * processing's
 * rules by {@link unheldIdentifiers} alone; the other needs here are response processing's.
 *
 * @param build The build.
 * @param read The processing as read.
 * @param responses The responses the model holds.
 * @param outcomes The outcomes the model holds.
 * @param heldTemplates The template variables the engine holds a value of: the model's, or none
 *   beside template processing that does not run.
 * @param records The record responses the model holds.
 * @param contexts The context variables the engine holds ({@link HeldContexts}).
 * @returns The tree, or none when it names an identifier the engine does not hold, is a built-in
 *   template that needs a declaration the item does not provide, or reads an area mapping with a
 *   `%` coordinate.
 */
export const runnable = (
  build: Build,
  read: ReadProcessing,
  responses: ReadonlyMap<string, ResponseDeclaration>,
  outcomes: ReadonlyMap<string, OutcomeDeclaration>,
  heldTemplates: ReadonlyMap<string, TemplateDeclaration>,
  records: ReadonlyMap<string, RecordDeclaration>,
  contexts: HeldContexts,
): Option.Option<readonly Rule[]> => {
  const features = [
    ...unheldIdentifiers(
      read.tree,
      responses,
      outcomes,
      heldTemplates,
      new Set(records.keys()),
      heldBuiltIns,
      build.names,
      contexts,
    ).map((identifier) => `variable:${identifier}`),
    ...Option.match(read.template, {
      onNone: () => [],
      onSome: (template) => unmetNeeds(template, responses, outcomes, heldTemplates),
    }),
  ];
  if (readsPercentArea(read.tree, responses)) {
    features.push("area-coords-percent");
  }

  markAt(build, read.at, read.path, features);

  return features.length === 0 ? Option.some(read.tree) : Option.none();
};
