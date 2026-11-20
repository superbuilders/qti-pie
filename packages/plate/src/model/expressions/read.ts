/**
 * The registry of the item model's expressions: every kind's rule and reader spec, by kind, from
 * the nine families under `#plate/model/expressions/`, and the one generic reader that reads every
 * expression element through them.
 *
 * The model and the engine read a kind through its entry here in place of a case
 * per kind, so a kind's rule and reader spec change in its family's own files alone. It
 * value-imports the nine families, which value-import `#plate/model/expression.ts` and the leaf
 * `#plate/model/attributes.ts`, never this module: they name its reader types with `import type`
 * only. So the value imports point one way: from the item model to here, and from here to the
 * families.
 *
 * @module
 */
import { Option } from "effect";
import type { SourceElement } from "#plate/document/source.ts";
import { childPair, elementsOf, isQti, soleChild, someChildren } from "#plate/model/attributes.ts";
import type { ModelWalk } from "#plate/model/attributes.ts";
import { expressionKinds } from "#plate/model/expression.ts";
import type { Expression, ExpressionKind, FamilyRules } from "#plate/model/expression.ts";
import { arithmeticReaders, arithmeticRules } from "#plate/model/expressions/arithmetic.ts";
import { comparisonReaders, comparisonRules } from "#plate/model/expressions/comparison.ts";
import { containersReaders, containersRules } from "#plate/model/expressions/containers.ts";
import { functionsReaders, functionsRules } from "#plate/model/expressions/functions.ts";
import { integersReaders, integersRules } from "#plate/model/expressions/integers.ts";
import { logicReaders, logicRules } from "#plate/model/expressions/logic.ts";
import { referencesReaders, referencesRules } from "#plate/model/expressions/references.ts";
import { roundingReaders, roundingRules } from "#plate/model/expressions/rounding.ts";
import { textReaders, textRules } from "#plate/model/expressions/text.ts";

/**
 * The variant of {@link Expression} of one kind.
 */
export type Variant<K extends ExpressionKind> = Extract<Expression, { readonly kind: K }>;

/**
 * What the item model gives the generic reader for one item: its walk, the names a string
 * attribute may name, and the two ways to record a mark. The item model builds it, so the build
 * that collects the marks stays private to it.
 */
export interface ExpressionReading {
  /**
   * The names of the variables the item holds: every declaration's identifier and the built-in
   * variables. `StringOrRef`'s classifier (`stringOrRefOf` in `#plate/model/expression.ts`) reads
   * a braced name as a reference only when it is one of them (§2.7.2), so a literal is split from
   * a reference at read time.
   */
  readonly declared: ReadonlySet<string>;
  /**
   * Record a mark at an element and keep reading, so its operands are still read and marked, as
   * the text family does for a `qti-pattern-match` literal pattern that `compile` in
   * `#plate/model/regex.ts` refuses, a `qti-inside` coordinate written with `%` and every
   * `qti-custom-operator`.
   *
   * @param element The element the mark sits on.
   * @param feature The mark's key.
   */
  readonly mark: (element: SourceElement, feature: string) => void;
  /**
   * Record a mark at an element, keyed by its name, and build nothing.
   *
   * @param element The element the engine does not run.
   * @returns None, so the rule tree that holds the element is none.
   */
  readonly unread: (element: SourceElement) => Option.Option<never>;
  /**
   * The walk a reader reads attributes and paths through, and locates its defects in.
   */
  readonly walk: ModelWalk;
}

/**
 * What a reader spec reads through: the item's {@link ExpressionReading}, and the recursion into
 * an operand, which reads it through the generic reader again.
 */
export interface ReaderContext extends ExpressionReading {
  /**
   * Read an operand element as an expression, through its own kind's reader spec.
   *
   * @param element The operand element.
   * @returns Its expression, none when it holds an element the engine does not run.
   */
  readonly expression: (element: SourceElement) => Option.Option<Expression>;
}

/**
 * The reader spec of a kind that reads itself: its operand count, its attributes, its marks and
 * its operands, in that order, through the context. `qti-base-value` reads its typed text and
 * `qti-custom-operator` marks itself and keeps reading.
 *
 * @template V The variant it reads.
 */
export interface CustomReader<V extends Expression> {
  readonly _tag: "custom";
  /**
   * Read the element.
   *
   * @param context The reader context.
   * @param element The kind's element.
   * @returns Its variant, none when it holds an element the engine does not run.
   */
  readonly read: (context: ReaderContext, element: SourceElement) => Option.Option<V>;
}

/**
 * The reader spec of a kind the generic reader reads as data: its operand count, and how its
 * attributes read into the typed build of its variant from its operands.
 *
 * The generic reader marks the element at its path and builds nothing when its element children
 * do not fit `arity`; otherwise it reads the attributes, then every operand, in document order, so
 * every element in them the engine does not run is marked.
 *
 * @template V The variant it builds.
 * @template A The operand count.
 * @template O The operands, as the count types them.
 */
interface GenericReader<V extends Expression, A extends string, O extends readonly Expression[]> {
  readonly _tag: "generic";
  /**
   * The operand count: `none`, `one`, `two`, `some` (one or more) or `any` (zero or more).
   */
  readonly arity: A;
  /**
   * Read the kind's attributes, each as its XSD type reads it, a reference attribute through its
   * classifier, and give the build of the variant from its operands. The build is typed by the
   * variant, so a spec cannot drift from it.
   *
   * @param context The reader context.
   * @param element The kind's element.
   * @returns The build.
   */
  readonly attributes: (context: ReaderContext, element: SourceElement) => (operands: O) => V;
}

/**
 * How the item model reads the expressions of one variant: a custom reader, or a generic spec of
 * one of the five operand counts, whose build takes the operands as the count types them.
 *
 * The readers are typed by the variant they build, never by its kind, because `V` sits only in
 * the readers' results, so TypeScript relates two specs by relating their variants. A spec typed
 * by the kind would hold the kind inside {@link Variant}'s conditional type, whose parameter
 * TypeScript cannot measure, so relating a kind's spec to the dispatcher's
 * `VariantSpec<Expression>` would compare the two readers member by member, for each of the 56
 * kinds and each of the six arms.
 *
 * @template V The variant read.
 */
export type VariantSpec<V extends Expression> =
  | CustomReader<V>
  | GenericReader<V, "any", readonly Expression[]>
  | GenericReader<V, "none", readonly []>
  | GenericReader<V, "one", readonly [Expression]>
  | GenericReader<V, "some", readonly [Expression, ...Expression[]]>
  | GenericReader<V, "two", readonly [Expression, Expression]>;

/**
 * How the item model reads one expression kind: the {@link VariantSpec} of its variant.
 *
 * @template K The kind.
 */
export type ReaderSpec<K extends ExpressionKind> = VariantSpec<Variant<K>>;

/**
 * A family's reader specs: one entry per kind of the family.
 */
export type FamilyReaders<K extends ExpressionKind> = { readonly [P in K]: ReaderSpec<P> };

/**
 * Every kind's rule: the nine families' tables in one, keyed by {@link ExpressionKind}. Its type
 * requires an entry for each of the 56 kinds, so a kind no family holds fails the type check.
 */
export const kindRules: FamilyRules<ExpressionKind> = {
  ...arithmeticRules,
  ...comparisonRules,
  ...containersRules,
  ...functionsRules,
  ...integersRules,
  ...logicRules,
  ...referencesRules,
  ...roundingRules,
  ...textRules,
};

/**
 * The registry's type: every kind's reader spec as the dispatcher reads it, a spec of any variant.
 * Each family's table holds its kinds to their own specs ({@link FamilyReaders}), so the registry
 * need not hold them again, and its index by a kind is one spec, not the union of the 56 kinds'.
 */
type KindReaders = { readonly [P in ExpressionKind]: VariantSpec<Expression> };

/**
 * Every kind's reader spec: the nine families' tables in one, keyed by {@link ExpressionKind}, so a
 * kind no family reads fails the type check.
 */
const kindReaders: KindReaders = {
  ...arithmeticReaders,
  ...comparisonReaders,
  ...containersReaders,
  ...functionsReaders,
  ...integersReaders,
  ...logicReaders,
  ...referencesReaders,
  ...roundingReaders,
  ...textReaders,
};

/**
 * Each kind, keyed by its element's local name, `qti-<kind>`.
 */
const kindsByElement: ReadonlyMap<string, ExpressionKind> = new Map(
  expressionKinds.map((kind) => [`qti-${kind}`, kind]),
);

/**
 * Read operand elements in document order, each through the generic reader, so every element in
 * them the engine does not run is marked, not only the first.
 *
 * @param context The reader context.
 * @param elements The operand elements.
 * @returns Their expressions, none when any holds an element the engine does not run.
 */
const readAll = (
  context: ReaderContext,
  elements: readonly SourceElement[],
): Option.Option<readonly Expression[]> => {
  const read: Option.Option<Expression>[] = [];
  for (const element of elements) {
    read.push(context.expression(element));
  }

  return Option.all(read);
};

/**
 * Read an element through a generic reader spec: its operand count first, then its attributes,
 * then its operands in document order.
 *
 * @param context The reader context.
 * @param element The kind's element.
 * @param spec The kind's generic spec.
 * @returns The variant, none when its children do not fit the count or an operand holds an element
 *   the engine does not run.
 */
const readGeneric = (
  context: ReaderContext,
  element: SourceElement,
  spec: Exclude<VariantSpec<Expression>, CustomReader<Expression>>,
): Option.Option<Expression> => {
  switch (spec.arity) {
    case "none": {
      const build = spec.attributes(context, element);

      return Option.some(build([]));
    }
    case "one": {
      const operand = soleChild(element);
      const build = spec.attributes(context, element);
      const read = context.expression(operand);

      return read.pipe(Option.map((only) => build([only])));
    }
    case "two": {
      const [left, right] = childPair(element);
      const build = spec.attributes(context, element);
      const read = Option.all([context.expression(left), context.expression(right)]);

      return read.pipe(Option.map((pair) => build(pair)));
    }
    case "some": {
      const [first, ...rest] = someChildren(element);
      const build = spec.attributes(context, element);
      const head = context.expression(first);
      const tail = readAll(context, rest);

      return Option.all([head, tail]).pipe(
        Option.map(([operand, operands]) => build([operand, ...operands])),
      );
    }
    case "any": {
      const build = spec.attributes(context, element);
      const read = readAll(context, elementsOf(element));

      return read.pipe(Option.map((operands) => build(operands)));
    }
    default: {
      return spec satisfies never;
    }
  }
};

/**
 * Read an expression element: one in the QTI namespace named `qti-<kind>` for one of the 56 kinds
 * by that kind's reader spec, and any other element as one the engine does not run, marked by its
 * name. Operands are read through this reader again.
 *
 * @param reading The item's reading context.
 * @param element The expression element.
 * @returns The expression, none when it holds anything the engine does not run, each such thing
 *   marked.
 */
export const readExpression = (
  reading: ExpressionReading,
  element: SourceElement,
): Option.Option<Expression> => {
  const kind = isQti(element) ? kindsByElement.get(element.local) : undefined;
  if (kind === undefined) {
    return reading.unread(element);
  }

  const context: ReaderContext = {
    ...reading,
    expression: (operand) => readExpression(reading, operand),
  };
  const spec = kindReaders[kind];
  switch (spec._tag) {
    case "custom": {
      return spec.read(context, element);
    }
    case "generic": {
      return readGeneric(context, element, spec);
    }
    default: {
      return spec satisfies never;
    }
  }
};
