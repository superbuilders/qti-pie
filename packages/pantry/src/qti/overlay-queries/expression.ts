/**
 * The expression, operator and MathML overlays' rules over their node (decision S3): each law that
 * pairs an overlay's fact with its node's kind, parent or parent's kind, which only `Node` holds,
 * read through a query that matches the overlay with `Node` at its key
 * (`#pantry/qti/expressions.ts`, `#pantry/qti/operators.ts`, `#pantry/qti/mathml-*.ts`); and the
 * operators' laws over the views of their attributes no row copies (C18): a rounding operator's
 * `figures` beside its mode in force ({@link RoundingModeFigures}) and a tolerance's values
 * ({@link ToleranceToken}).
 *
 * The placements (spec reading 117) are stated here once, {@link placedDocuments}: every type law
 * reads an expression's type where a placement gives it, `PlacedExpression`, so each law is stated
 * once over the placed rows and judges each placement of a document on its own.
 */
import type { RelationName } from "@bjornpagen/grizzle";
import {
  Bits,
  check,
  contained,
  derived,
  key,
  Logic,
  mirrors,
  Num,
  on,
  pg,
  query,
  select,
  Text,
  Type,
  v,
} from "@bjornpagen/grizzle";
import {
  binaryMathOperators,
  mathHeadQualifiers,
  mathQualifiers,
} from "#pantry/grammar/expression.ts";
import {
  HeadQualifier,
  MathArity,
  MathHeadOperator,
  MathMax,
  NodeKind,
  nonElementKinds,
  OperatorArity,
  OperatorMax,
} from "#pantry/grammar/install.ts";
import { Attribute } from "#pantry/qti/attributes.ts";
import { QtiBase } from "#pantry/qti/base.ts";
import { Document } from "#pantry/qti/chardata.ts";
import {
  conditionKindHandles,
  containerKinds,
  firstKinds,
  LeadCardinality,
  numericKinds,
  oneBaseKinds,
  oneCardinalityKinds,
  OperandBase,
  outcomeOnlyKinds,
  ResultBase,
  ResultCardinality,
  rootKinds,
  secondKinds,
  TailCardinality,
} from "#pantry/qti/expression-types.ts";
import {
  Expression,
  Literal,
  LiteralTyped,
  PlacedExpression,
  Processing,
  silentBases,
} from "#pantry/qti/expressions.ts";
import {
  CellLeaf,
  MathAction,
  MathAlignGroup,
  MathAlignScope,
  MathCell,
} from "#pantry/qti/mathml-align.ts";
import {
  MathRank,
  PlacedMathRank,
  PlacedShareTarget,
  ShareTarget,
} from "#pantry/qti/mathml-share.ts";
import {
  attributeValues,
  LocatedTemplate,
  matched,
  QtiViews,
  unmatched,
} from "#pantry/qti/names.ts";
import { Node } from "#pantry/qti/node.ts";
import { integerForm, matchedTextBytes } from "#pantry/qti/limits.ts";
import { doublePattern, positivePattern, toleranceAttributes } from "#pantry/qti/operators.ts";
import { Instance } from "#pantry/qti/tests.ts";
import { attributeTypedKinds } from "#pantry/vocab/terms/expressions.ts";
import { equalRoundedMode, roundingKinds, roundingModes } from "#pantry/vocab/terms/operators.ts";
import {
  expressionKinds,
  rootLanguages,
  ruleKindHandles,
} from "#pantry/vocab/terms/expression-types.ts";
import { declared } from "#pantry/qti/law-entries.ts";

/**
 * Each document in no assembly as its own one placement (spec reading 117), by its path: numbered
 * as an assembly's root instance is, its `instance` the place of its document node, 0, its site.
 */
const standalonePlacements = query(QtiBase).rule((r) => {
  const { package: pkg, path } = v(Document, "document");
  const { start: instance } = v(Node, "documentNode");

  return r
    .match(Document, { assembled: false, package: pkg, path })
    .match(Node, { kind: "document", package: pkg, path, start: instance })
    .find({ instance, package: pkg, path });
});

/**
 * Each document's own placement, by its path: the root instance of the assembly it heads, the one
 * instance of that assembly that places its head, or its standalone one. A spliced fragment, which
 * heads no assembly, has none.
 */
const ownPlacements = query(QtiBase)
  .rule((r) => {
    const { document: path, package: pkg, start: instance } = v(Instance, "root");

    return r
      .match(Instance, { assembly: path, document: path, package: pkg, start: instance })
      .find({ instance, package: pkg, path });
  })
  .rule((r) => {
    const { instance, package: pkg, path } = v(standalonePlacements, "standalone");

    return r
      .match(standalonePlacements, { instance, package: pkg, path })
      .find({ instance, package: pkg, path });
  });

/**
 * Each document each placement types, by the placement, `(package, assembly, instance)`, and the
 * document's path (spec reading 117): the one document an instance of an assembly places
 * (`Instance`); a document in no assembly under its own one placement, its path its assembly's
 * ({@link standalonePlacements}); and, under an item's own placement, the response processing
 * template the item locates (`LocatedTemplate`, information model §4.6.1: "The rules obtained from
 * the external template may be used instead of the rules defined within the item itself"), whose
 * rules run as the item's own. Every type law reads a placed expression or reference, so a document
 * placed twice is judged under each placement: two tests that place one section document, two items
 * that splice one rules fragment, and an item and the template it locates, each typed in the
 * assembly that places it.
 */
export const placedDocuments = query(QtiViews)
  .rule((r) => {
    const { assembly, document: path, package: pkg, start: instance } = v(Instance, "instance");

    return r
      .match(Instance, { assembly, document: path, package: pkg, start: instance })
      .find({ assembly, instance, package: pkg, path });
  })
  .rule((r) => {
    const { instance, package: pkg, path } = v(standalonePlacements, "standalone");

    return r
      .match(standalonePlacements, { instance, package: pkg, path })
      .find({ assembly: path, instance, package: pkg, path });
  })
  .rule((r) => {
    const { instance, package: pkg, path: item } = v(ownPlacements, "item");
    const { template: path } = v(LocatedTemplate, "located");

    return r
      .match(ownPlacements, { instance, package: pkg, path: item })
      .match(LocatedTemplate, { package: pkg, path: item, template: path })
      .find({ assembly: item, instance, package: pkg, path });
  });

/**
 * The expressions each placement types, by the placement and the expression's place: every
 * expression of every document it places ({@link placedDocuments}). "E1 derived" holds
 * `PlacedExpression` to it both ways, so a placement types each of its expressions once, and
 * nothing else.
 */
const PlacedExpressionSite = derived(
  "PlacedExpressionSite",
  query(QtiViews).rule((r) => {
    const { assembly, instance, package: pkg, path } = v(placedDocuments, "placement");
    const { start } = v(Expression, "expression");

    return r
      .match(placedDocuments, { assembly, instance, package: pkg, path })
      .match(Expression, { package: pkg, path, start })
      .find({ assembly, instance, package: pkg, path, start });
  }),
);

/**
 * Each expression beside its node's kind, parent and parent's kind, by its place: its
 * {@link Expression} row and its language, matched with `Node` at its key.
 */
const ExpressionNode = derived(
  "ExpressionNode",
  query(QtiBase).rule((r) => {
    const { language, package: pkg, path, start } = v(Expression, "expression");
    const { kind, parent, parentKind } = v(Node, "node");

    return r
      .match(Expression, { language, package: pkg, path, start })
      .match(Node, { kind, package: pkg, parent, parentKind, path, start })
      .find({ kind, language, package: pkg, parent, parentKind, path, start });
  }),
);

/**
 * Each placed expression beside its node's kind, parent and parent's kind, by its placement and
 * place: its {@link PlacedExpression} row and its type there, matched with `Node` at its key.
 */
const PlacedExpressionNode = derived(
  "PlacedExpressionNode",
  query(QtiBase).rule((r) => {
    const {
      assembly,
      baseType,
      cardinality,
      instance,
      package: pkg,
      path,
      start,
    } = v(PlacedExpression, "expression");
    const { kind, parent, parentKind } = v(Node, "node");

    return r
      .match(PlacedExpression, {
        assembly,
        baseType,
        cardinality,
        instance,
        package: pkg,
        path,
        start,
      })
      .match(Node, { kind, package: pkg, parent, parentKind, path, start })
      .find({
        assembly,
        baseType,
        cardinality,
        instance,
        kind,
        package: pkg,
        parent,
        parentKind,
        path,
        start,
      });
  }),
);

/**
 * Each rule or processing element beside its node's kind, parent and parent's kind, by its place:
 * its {@link Processing} row matched with `Node` at its key.
 */
const ProcessingNode = derived(
  "ProcessingNode",
  query(QtiBase).rule((r) => {
    const { language, package: pkg, path, start } = v(Processing, "processing");
    const { kind, parent, parentKind } = v(Node, "node");

    return r
      .match(Processing, { language, package: pkg, path, start })
      .match(Node, { kind, package: pkg, parent, parentKind, path, start })
      .find({ kind, language, package: pkg, parent, parentKind, path, start });
  }),
);

/**
 * Each operand, by its place (C16): an expression whose node's parent is an expression, its
 * `operator`, with its `rank`, its node's element rank among its siblings, 1 to n, beside its
 * operator's node's kind. An expression's element children are its operands, so the ranks of an
 * operator's operands are 1 to its count. It is its document's fact, the same in every placement:
 * "Arity" reads it ({@link ExpressionOperand}), and each placement types it ({@link operands}).
 */
const operandRows = query(QtiBase).rule((r) => {
  const { package: pkg, path, start } = v(Expression, "operand");
  const { elements: rank, parent: operator } = v(Node, "operandNode");
  const { kind: operatorKind } = v(Node, "operatorNode");

  return r
    .match(Expression, { package: pkg, path, start })
    .match(Node, { elements: rank, package: pkg, parent: operator, path, start })
    .match(Expression, { package: pkg, path, start: operator })
    .match(Node, { kind: operatorKind, package: pkg, path, start: operator })
    .find({ operator, operatorKind, package: pkg, path, rank, start });
});

/**
 * {@link operandRows} as a relation of the schema, which "Arity" reads.
 */
const ExpressionOperand = derived("ExpressionOperand", operandRows);

/**
 * Each operand under each placement of its document, by the placement and its place: its
 * {@link operandRows} row, its own type there (`baseType`, `cardinality`, and their one-bit sets)
 * and its operator's (`operatorBase`, `operatorCardinality`), both its {@link PlacedExpression}
 * rows under the one placement. Every operand type law is a rule over it or over a query that
 * matches it, so no row stores an operator's count or its operands' types (grizzle, 2026-11-18).
 */
const operands = query(QtiBase).rule((r) => {
  const { operator, operatorKind, package: pkg, path, rank, start } = v(operandRows, "operand");
  const { assembly, baseType, baseTypeBit, cardinality, cardinalityBit, instance } = v(
    PlacedExpression,
    "placedOperand",
  );
  const { baseType: operatorBase, cardinality: operatorCardinality } = v(
    PlacedExpression,
    "placedOperator",
  );

  return r
    .match(operandRows, { operator, operatorKind, package: pkg, path, rank, start })
    .match(PlacedExpression, {
      assembly,
      baseType,
      baseTypeBit,
      cardinality,
      cardinalityBit,
      instance,
      package: pkg,
      path,
      start,
    })
    .match(PlacedExpression, {
      assembly,
      baseType: operatorBase,
      cardinality: operatorCardinality,
      instance,
      package: pkg,
      path,
      start: operator,
    })
    .find({
      assembly,
      baseType,
      baseTypeBit,
      cardinality,
      cardinalityBit,
      instance,
      operator,
      operatorBase,
      operatorCardinality,
      operatorKind,
      package: pkg,
      path,
      rank,
      start,
    });
});

/**
 * {@link operands} as a relation of the schema, which the operand type laws' checks and
 * containments read.
 */
const OperandOf = derived("OperandOf", operands);

/**
 * The base types that name no base an operand holds: `qti-null`'s `any` and `unknown`.
 */
const unknownBases = ["any", "unknown"] as const;

/**
 * Each operator's known operand bases under each placement, `(operator, base)`, of an operator
 * that takes one base (`oneBaseKinds`): an operand's base that is neither `any` nor `unknown`. "One
 * base" keys it by its operator's placement and place.
 */
const KnownOperandBase = derived(
  "KnownOperandBase",
  query(QtiBase).rule((r) => {
    const {
      assembly,
      baseType,
      instance,
      operator,
      operatorKind,
      package: pkg,
      path,
    } = v(operands, "operand");

    return r
      .match(operands, { assembly, baseType, instance, operator, operatorKind, package: pkg, path })
      .where(r.in(operatorKind, oneBaseKinds), Logic.not(r.in(baseType, unknownBases)))
      .find({ assembly, baseType, instance, operator, package: pkg, path });
  }),
);

/**
 * Each operator's known operand cardinalities under each placement, `(operator, cardinality)`, of
 * an operator that takes one cardinality (`oneCardinalityKinds`): an operand's cardinality that is
 * not `unknown`.
 */
const KnownOperandCardinality = derived(
  "KnownOperandCardinality",
  query(QtiBase).rule((r) => {
    const {
      assembly,
      cardinality,
      instance,
      operator,
      operatorKind,
      package: pkg,
      path,
    } = v(operands, "operand");

    return r
      .match(operands, {
        assembly,
        cardinality,
        instance,
        operator,
        operatorKind,
        package: pkg,
        path,
      })
      .where(r.in(operatorKind, oneCardinalityKinds), r.ne(cardinality, "unknown"))
      .find({ assembly, cardinality, instance, operator, package: pkg, path });
  }),
);

/**
 * The operators of the given kinds whose operands under a placement, of rank at least `least`,
 * hold two different bases neither of which is `any`, or one of base `unknown`: those whose result
 * is `unknown` there under a typing by their operands' one base (a container's, an Index's, a
 * Random's, a Delete's later operands').
 *
 * @param name - The derived relation's name.
 * @param kinds - The operator kinds it reads.
 * @param least - The least rank of the operands it reads.
 * @returns The derived relation, by the operator's placement and place.
 */
const unknownOfBases = <Name extends string>(
  name: RelationName<Name>,
  kinds: readonly (typeof NodeKind.handles)[number][],
  least: bigint,
) =>
  derived(
    name,
    query(QtiBase)
      .rule((r) => {
        const {
          assembly,
          baseType,
          instance,
          operator,
          operatorKind,
          package: pkg,
          path,
          rank,
        } = v(operands, "first");
        const { baseType: other, rank: otherRank } = v(operands, "second");

        return r
          .match(operands, {
            assembly,
            baseType,
            instance,
            operator,
            operatorKind,
            package: pkg,
            path,
            rank,
          })
          .match(operands, {
            assembly,
            baseType: other,
            instance,
            operator,
            package: pkg,
            path,
            rank: otherRank,
          })
          .where(
            r.in(operatorKind, kinds),
            r.ge(rank, least),
            r.ge(otherRank, least),
            r.ne(baseType, "any"),
            r.ne(other, "any"),
            r.ne(baseType, other),
          )
          .find({ assembly, instance, operator, package: pkg, path });
      })
      .rule((r) => {
        const {
          assembly,
          instance,
          operator,
          operatorKind,
          package: pkg,
          path,
          rank,
        } = v(operands, "operand");

        return r
          .match(operands, {
            assembly,
            baseType: "unknown",
            instance,
            operator,
            operatorKind,
            package: pkg,
            path,
            rank,
          })
          .where(r.in(operatorKind, kinds), r.ge(rank, least))
          .find({ assembly, instance, operator, package: pkg, path });
      }),
  );

/**
 * The containers, Indexes and Randoms whose operands' bases make them `unknown` under a placement.
 */
const UnknownOperandBase = unknownOfBases(
  "UnknownOperandBase",
  [...containerKinds, ...firstKinds],
  1n,
);

/**
 * The Deletes whose later operands' bases make them `unknown` under a placement.
 */
const UnknownTailBase = unknownOfBases("UnknownTailBase", secondKinds, 2n);

/**
 * The operands of a numeric aggregate under a placement whose base is neither `integer` nor `any`,
 * by their operator: a numeric aggregate with one of them is no integer there.
 */
const nonIntegerOperands = query(QtiBase).rule((r) => {
  const {
    assembly,
    baseType,
    instance,
    operator,
    operatorKind,
    package: pkg,
    path,
  } = v(operands, "operand");

  return r
    .match(operands, { assembly, baseType, instance, operator, operatorKind, package: pkg, path })
    .where(r.in(operatorKind, numericKinds), Logic.not(r.in(baseType, ["integer", "any"])))
    .find({ assembly, instance, operator, package: pkg, path });
});

/**
 * The numeric aggregates under a placement whose operands are all `integer` or `any`, one at least
 * `integer`, with their base type there: each is an integer (§6.9, the numeric aggregates' result
 * is integer where every operand is).
 */
const IntegerAggregate = derived(
  "IntegerAggregate",
  query(QtiBase).rule((r) => {
    const {
      assembly,
      instance,
      operator,
      operatorBase,
      operatorKind,
      package: pkg,
      path,
    } = v(operands, "operand");

    return r
      .match(operands, {
        assembly,
        baseType: "integer",
        instance,
        operator,
        operatorBase,
        operatorKind,
        package: pkg,
        path,
      })
      .where(r.in(operatorKind, numericKinds))
      .where(r.not(nonIntegerOperands, { assembly, instance, operator, package: pkg, path }))
      .find({ assembly, instance, operator, operatorBase, package: pkg, path });
  }),
);

/**
 * The later operands of a Delete under a placement whose cardinality is known, by their operator,
 * with it.
 */
const tailCardinalities = query(QtiBase).rule((r) => {
  const {
    assembly,
    cardinality,
    instance,
    operator,
    operatorKind,
    package: pkg,
    path,
    rank,
  } = v(operands, "operand");

  return r
    .match(operands, {
      assembly,
      cardinality,
      instance,
      operator,
      operatorKind,
      package: pkg,
      path,
      rank,
    })
    .where(r.in(operatorKind, secondKinds), r.gt(rank, 1n), r.ne(cardinality, "unknown"))
    .find({ assembly, cardinality, instance, operator, package: pkg, path });
});

/**
 * The Deletes under a placement whose later operands hold two different known cardinalities, by
 * their operator.
 */
const tailCardinalityPairs = query(QtiBase).rule((r) => {
  const {
    assembly,
    cardinality,
    instance,
    operator,
    package: pkg,
    path,
  } = v(tailCardinalities, "first");
  const { cardinality: other } = v(tailCardinalities, "second");

  return r
    .match(tailCardinalities, { assembly, cardinality, instance, operator, package: pkg, path })
    .match(tailCardinalities, {
      assembly,
      cardinality: other,
      instance,
      operator,
      package: pkg,
      path,
    })
    .where(r.ne(cardinality, other))
    .find({ assembly, instance, operator, package: pkg, path });
});

/**
 * The Deletes under a placement whose later operands hold exactly one known cardinality there, with
 * their own: each takes it (Table 6.9.20, a Delete's result is a container derived from its second
 * sub-expression).
 */
const OneTailCardinality = derived(
  "OneTailCardinality",
  query(QtiBase).rule((r) => {
    const { assembly, instance, operator, package: pkg, path } = v(tailCardinalities, "tail");
    const { cardinality } = v(PlacedExpression, "operator");

    return r
      .match(tailCardinalities, { assembly, instance, operator, package: pkg, path })
      .match(PlacedExpression, {
        assembly,
        cardinality,
        instance,
        package: pkg,
        path,
        start: operator,
      })
      .where(r.not(tailCardinalityPairs, { assembly, instance, operator, package: pkg, path }))
      .find({ assembly, cardinality, instance, operator, package: pkg, path });
  }),
);

/**
 * Each expression whose kind takes at least one operand, with that least number (`OperatorArity`):
 * "Arity" holds each to an operand of that rank, the ranks of its operands being 1 to n.
 */
const ArityFloor = derived(
  "ArityFloor",
  query(QtiBase).rule((r) => {
    const { package: pkg, path, start } = v(Expression, "expression");
    const { kind } = v(Node, "node");
    const { min } = v(OperatorArity, "arity");

    return r
      .match(Expression, { package: pkg, path, start })
      .match(Node, { kind, package: pkg, path, start })
      .match(OperatorArity, { kind, min })
      .where(r.ge(min, 1n))
      .find({ min, package: pkg, path, start });
  }),
);

/**
 * Each math operator's `name`, by its element's place, with its value.
 */
const mathOperatorNames = attributeValues("name", ["qti-math-operator"]);

/**
 * Each operand of a math operator, by its operator's place and its rank, with the operator's
 * `name`: "Arity" holds its rank to 2 where the name is one of `binaryMathOperators`
 * (`#pantry/grammar/expression.ts`) and to 1 under every other (spec reading 242).
 */
const MathOperand = derived(
  "MathOperand",
  query(QtiBase).rule((r) => {
    const { operator, package: pkg, path, rank } = v(operandRows, "operand");
    const { value: name } = v(mathOperatorNames, "name");

    return r
      .match(operandRows, { operator, operatorKind: "qti-math-operator", package: pkg, path, rank })
      .match(mathOperatorNames, { package: pkg, path, start: operator, value: name })
      .find({ name, operator, package: pkg, path, rank });
  }),
);

/**
 * Each math operator whose `name` takes two sub-expressions (`binaryMathOperators`), by its
 * element's place: "Arity" holds each to an operand of rank 2 (spec reading 242).
 */
const BinaryMathOperator = derived(
  "BinaryMathOperator",
  query(QtiBase).rule((r) => {
    const { package: pkg, path, start, value } = v(mathOperatorNames, "name");

    return r
      .match(mathOperatorNames, { package: pkg, path, start, value })
      .where(r.in(value, binaryMathOperators))
      .find({ package: pkg, path, start });
  }),
);

/**
 * The kinds typed by their operands' one base: the containers, Index and Random.
 */
const baseTypedKinds = [...containerKinds, ...firstKinds];

/**
 * Each rounding operator's written `rounding-mode`, by its element's place, with its value, the
 * form as written (`RoundingModeEnum`, an `xs:string` enumeration, `whiteSpace` preserve).
 */
const writtenModes = attributeValues("rounding-mode", roundingKinds);

/**
 * Each rounding operator's `figures` beside its mode in force (reading 119), by its element's
 * place, where it has both: `figures`, the attribute's `value` (the form collapsed, decision 123),
 * and `mode`, its `rounding-mode` where it writes one, else, on a `qti-equal-rounded` that writes
 * none, the XSD's default, {@link equalRoundedMode}. A `qti-round-to` that writes no mode, and an
 * operator with no `figures`, is AL3's, and has no row. No row copies either attribute (C18). It
 * stores nothing: a check over a stored view that reads a pattern does not compile at the pin
 * (`docs/grizzle-findings.md`).
 */
export const RoundingModeFigures = derived(
  "RoundingModeFigures",
  query(QtiBase)
    .rule((r) => {
      const { kind, package: pkg, path, start, value: figures } = v(Attribute, "figures");
      const { value: mode } = v(writtenModes, "written");

      return r
        .match(Attribute, { kind, name: "figures", package: pkg, path, start, value: figures })
        .where(r.in(kind, roundingKinds))
        .match(writtenModes, { package: pkg, path, start, value: mode })
        .find({ figures, mode, package: pkg, path, start });
    })
    .rule((r) => {
      const { package: pkg, path, start, value: figures } = v(Attribute, "figures");

      return r
        .match(Attribute, {
          kind: "qti-equal-rounded",
          name: "figures",
          package: pkg,
          path,
          start,
          value: figures,
        })
        .where(r.not(Attribute, { name: "rounding-mode", package: pkg, path, start }))
        .find({ figures, mode: equalRoundedMode, package: pkg, path, start });
    }),
);

/**
 * Each value of a `qti-equal`'s `tolerance` (reading 121), by the element's place and the value's
 * place among them, `at`, from 0: the attribute's lexical form collapsed and split at its spaces,
 * grizzle's whitespace list split (`r.tokens`), so the split is true by definition and no row holds
 * it. A form of whitespace alone has none. It stores nothing, as {@link RoundingModeFigures}.
 */
export const ToleranceToken = derived(
  "ToleranceToken",
  query(QtiBase).rule((r) => {
    const { lexical, package: pkg, path, start } = v(Attribute, "tolerance");
    const split = r.tokens(lexical);
    const { at, token } = v(split, "token");

    return r
      .match(Attribute, {
        kind: "qti-equal",
        lexical,
        name: "tolerance",
        package: pkg,
        path,
        start,
      })
      .match(split, { at, token })
      .find({ at, package: pkg, path, start, token });
  }),
);

/**
 * The first value of each `tolerance`, which a `tolerance` of one value or two holds.
 */
const firstTolerances = select(ToleranceToken, (t) => t.eq(t.at, 0n));

/**
 * The least `figures` each rounding mode admits (reading 119; info §5.47.2 and §5.119.2): 1 under
 * `significantFigures`, "a non-zero positive integer", and 0 under `decimalPlaces`, "an integer
 * greater than or equal to zero".
 */
const leastFigures = { decimalPlaces: 0n, significantFigures: 1n } as const;

/**
 * Reading 119 (law "Rounding figures", rule `P10`; info §5.47.2 and §5.119.2): a `figures` that is
 * an integer is at least its mode's {@link leastFigures}. A variable's name is no integer, and a
 * mode outside the enumeration (AL1's) binds no bound; an operator with no `figures` or no mode is
 * AL3's, and has no {@link RoundingModeFigures} row to judge. The cast reads only an integer's
 * form, which the guard proves, so its `otherwise` is the least itself, which the bound admits. QTI
 * bounds no `figures`, and a form past what PostgreSQL's regex engine reads (`matchedTextBytes`)
 * is no form the law can read, and is refused.
 */
const roundingFigures = check("Rounding_figures", RoundingModeFigures, (m) =>
  m.eq(
    Logic.when(
      Num.within(Text.octetLength(m.figures), 0, matchedTextBytes),
      () =>
        Logic.cond(
          m.or(
            m.not(Text.matches(m.figures, integerForm)),
            m.and(
              ...roundingModes.map((mode) =>
                m.or(
                  m.ne(m.mode, mode),
                  m.ge(
                    Logic.when(
                      Text.matches(m.figures, integerForm),
                      (figures) => Type.cast(figures, pg.bigint),
                      leastFigures[mode],
                    ),
                    leastFigures[mode],
                  ),
                ),
              ),
            ),
          ),
          matched,
          unmatched,
        ),
      unmatched,
    ),
    true,
  ),
);

/**
 * Reading 121's count (law "Equal tolerance", rule `P36`; info §5.46.2: "The tolerance consists of
 * two positive numbers, t0 and t1 ... If only one value is given it is used for both"): a
 * `tolerance` holds one value or two, so it has a first value ({@link firstTolerances}).
 */
const toleranceFirst = contained(
  on(toleranceAttributes, "package", "path", "start"),
  on(firstTolerances, "package", "path", "start"),
);

/**
 * Reading 121's count and sign over each value (law "Equal tolerance", rule `P36`; info §5.46.2,
 * "two positive numbers"): no value stands at place 2 or after, and a value in `xs:double`'s
 * lexical space is positive, a string naming a variable read at run time, and a value past what
 * PostgreSQL's regex engine reads (`matchedTextBytes`) is no form the law can read, and is refused.
 * One check states both, since a relation's checks are named apart.
 */
const toleranceValue = check("Equal_tolerance", ToleranceToken, (x) =>
  x.and(
    x.lt(x.at, 2n),
    x.eq(
      Logic.when(
        Num.within(Text.octetLength(x.token), 0, matchedTextBytes),
        () =>
          Logic.cond(
            x.or(
              x.not(Text.matches(x.token, doublePattern)),
              Text.matches(x.token, positivePattern),
            ),
            matched,
            unmatched,
          ),
        unmatched,
      ),
      true,
    ),
  ),
);

/**
 * Each ranked MathML element beside its node's kind and parent, by its place: its
 * {@link MathRank} row matched with `Node` at its key.
 */
const MathRankNode = derived(
  "MathRankNode",
  query(QtiBase).rule((r) => {
    const { package: pkg, path, rank, start } = v(MathRank, "ranked");
    const { kind, parent } = v(Node, "node");

    return r
      .match(MathRank, { package: pkg, path, rank, start })
      .match(Node, { kind, package: pkg, parent, path, start })
      .find({ kind, package: pkg, parent, path, rank, start });
  }),
);

/**
 * Each ranked MathML element beside its node's kind and its parent's rank, by its place: its
 * {@link MathRank} row, `Node` at its key, and its parent's row.
 */
const MathRankStep = derived(
  "MathRankStep",
  query(QtiBase).rule((r) => {
    const { package: pkg, path, rank, start } = v(MathRank, "ranked");
    const { kind, parent } = v(Node, "node");
    const { rank: parentRank } = v(MathRank, "parentRanked");

    return r
      .match(MathRank, { package: pkg, path, rank, start })
      .match(Node, { kind, package: pkg, parent, path, start })
      .match(MathRank, { package: pkg, path, rank: parentRank, start: parent })
      .find({ kind, package: pkg, parent, parentRank, path, rank, start });
  }),
);

/**
 * Each share of a document in no assembly beside its own rank and its target's, by the share's
 * place: its {@link ShareTarget} row and the two {@link MathRank} rows.
 */
const ShareRanks = derived(
  "ShareRanks",
  query(QtiBase).rule((r) => {
    const { package: pkg, path, start, targetStart } = v(ShareTarget, "share");
    const { rank: shareRank } = v(MathRank, "shareRanked");
    const { rank: targetRank } = v(MathRank, "targetRanked");

    return r
      .match(ShareTarget, { package: pkg, path, start, targetStart })
      .match(MathRank, { package: pkg, path, rank: shareRank, start })
      .match(MathRank, { package: pkg, path, rank: targetRank, start: targetStart })
      .find({ package: pkg, path, shareRank, start, targetRank });
  }),
);

/**
 * Each ranked MathML element of an instance beside its node's kind and parent, by its instance and
 * place: its {@link PlacedMathRank} row matched with `Node` at its node's key.
 */
const PlacedMathRankNode = derived(
  "PlacedMathRankNode",
  query(QtiBase).rule((r) => {
    const { assembly, instance, package: pkg, path, start } = v(PlacedMathRank, "ranked");
    const { kind, parent } = v(Node, "node");

    return r
      .match(PlacedMathRank, { assembly, instance, package: pkg, path, start })
      .match(Node, { kind, package: pkg, parent, path, start })
      .find({ assembly, instance, kind, package: pkg, parent, path, start });
  }),
);

/**
 * Each ranked MathML element of an instance beside its node's kind and its parent's rank under the
 * same instance, by its instance and place.
 */
const PlacedMathRankStep = derived(
  "PlacedMathRankStep",
  query(QtiBase).rule((r) => {
    const { assembly, instance, package: pkg, path, rank, start } = v(PlacedMathRank, "ranked");
    const { kind, parent } = v(Node, "node");
    const { rank: parentRank } = v(PlacedMathRank, "parentRanked");

    return r
      .match(PlacedMathRank, { assembly, instance, package: pkg, path, rank, start })
      .match(Node, { kind, package: pkg, parent, path, start })
      .match(PlacedMathRank, { assembly, instance, package: pkg, rank: parentRank, start: parent })
      .find({ assembly, instance, kind, package: pkg, parent, parentRank, rank, start });
  }),
);

/**
 * Each placed share beside its own rank under its instance and its target's under the target's,
 * by the share's instance and place: its {@link PlacedShareTarget} row and the two
 * {@link PlacedMathRank} rows.
 */
const PlacedShareRanks = derived(
  "PlacedShareRanks",
  query(QtiBase).rule((r) => {
    const {
      assembly,
      instance,
      package: pkg,
      start,
      targetInstance,
      targetStart,
    } = v(PlacedShareTarget, "share");
    const { rank: shareRank } = v(PlacedMathRank, "shareRanked");
    const { rank: targetRank } = v(PlacedMathRank, "targetRanked");

    return r
      .match(PlacedShareTarget, {
        assembly,
        instance,
        package: pkg,
        start,
        targetInstance,
        targetStart,
      })
      .match(PlacedMathRank, { assembly, instance, package: pkg, rank: shareRank, start })
      .match(PlacedMathRank, {
        assembly,
        instance: targetInstance,
        package: pkg,
        rank: targetRank,
        start: targetStart,
      })
      .find({ assembly, instance, package: pkg, shareRank, start, targetRank });
  }),
);

/**
 * Each `m:maction` beside its node's element count, by its place: its {@link MathAction} row
 * matched with `Node` at its key.
 */
const MathActionNode = derived(
  "MathActionNode",
  query(QtiBase).rule((r) => {
    const { package: pkg, path, selection, start } = v(MathAction, "action");
    const { elementChildren } = v(Node, "node");

    return r
      .match(MathAction, { package: pkg, path, selection, start })
      .match(Node, { elementChildren, package: pkg, path, start })
      .find({ elementChildren, package: pkg, path, selection, start });
  }),
);

/**
 * Each element inside a table cell beside its node's kind, parent, parent's kind, element rank and
 * element count, by its place: its {@link MathAlignScope} row matched with `Node` at its key.
 */
const ScopeNode = derived(
  "ScopeNode",
  query(QtiBase).rule((r) => {
    const {
      cell,
      chosen,
      inherited,
      own,
      package: pkg,
      passes,
      path,
      received,
      start,
      state,
    } = v(MathAlignScope, "scope");
    const { elementChildren, elements, kind, parent, parentKind } = v(Node, "node");

    return r
      .match(MathAlignScope, {
        cell,
        chosen,
        inherited,
        own,
        package: pkg,
        passes,
        path,
        received,
        start,
        state,
      })
      .match(Node, {
        elementChildren,
        elements,
        kind,
        package: pkg,
        parent,
        parentKind,
        path,
        start,
      })
      .find({
        cell,
        chosen,
        elementChildren,
        elements,
        inherited,
        kind,
        own,
        package: pkg,
        parent,
        parentKind,
        passes,
        path,
        received,
        start,
        state,
      });
  }),
);

/**
 * Each complete element of a table cell beside its node's kind and its cell's group count, by its
 * place: its {@link CellLeaf} row, `Node` at its key and its cell's {@link MathCell} row.
 */
const CellLeafNode = derived(
  "CellLeafNode",
  query(QtiBase).rule((r) => {
    const { at, cell, package: pkg, path, start } = v(CellLeaf, "leaf");
    const { kind } = v(Node, "node");
    const { groups } = v(MathCell, "cell");

    return r
      .match(CellLeaf, { at, cell, package: pkg, path, start })
      .match(Node, { kind, package: pkg, path, start })
      .match(MathCell, { groups, package: pkg, path, start: cell })
      .find({ at, cell, groups, kind, package: pkg, path, start });
  }),
);

/**
 * The kinds that let an alignment group through to its cell whatever their direction
 * (MathML 3 §3.5.5.2): an `m:mtd` is the cell itself, and an `maction` lets its selected child
 * through.
 */
const letKinds = ["m:maction", "m:mfenced", "m:mphantom", "m:semantics", "m:mtd"] as const;

/**
 * The kinds that let an alignment group through where they change no direction (MathML 3 §3.5.5.2).
 */
const directedKinds = ["m:mrow", "m:mstyle"] as const;

/**
 * The scope rows below a cell's root: every row but an `m:mtd`'s, each tied to its parent's row.
 */
const innerScopes = select(ScopeNode, (s) => s.ne(s.kind, "m:mtd"));

/**
 * The scope rows below an `m:maction`, each of which copies that action's selection.
 */
const actionChildren = select(ScopeNode, (s) =>
  s.and(s.ne(s.kind, "m:mtd"), s.eq(s.parentKind, "m:maction")),
);

/**
 * The scope rows of an `m:maligngroup` whose state is `open`, each of which holds a
 * {@link MathAlignGroup} row.
 */
const openGroups = select(ScopeNode, (s) =>
  s.and(s.eq(s.kind, "m:maligngroup"), s.eq(s.state, "open")),
);

/**
 * The scope rows of a complete element of a cell: no element child, and no `m:mtd`. Each holds a
 * {@link CellLeaf} row.
 */
const leafScopes = select(ScopeNode, (s) =>
  s.and(s.eq(s.elementChildren, 0n), s.ne(s.kind, "m:mtd")),
);

/**
 * The `NodeKind` handles among some names, so a query reads them as handles.
 *
 * @param names - Kind names.
 * @returns The handles of the roster the names spell, in the roster's order.
 */
const handlesOf = (names: ReadonlySet<string>): readonly (typeof NodeKind.handles)[number][] =>
  NodeKind.handles.filter((handle) => names.has(handle));

/**
 * The qualifiers that belong to a head, `degree`, `momentabout` and `logbase`
 * ({@link mathHeadQualifiers}): an application owns one beside a head operator
 * (`MathHeadOperator`), and its pair is "MathML head qualifier"'s.
 */
const headQualifierKinds = handlesOf(new Set(mathHeadQualifiers.map(({ qualifier }) => qualifier)));

/**
 * The qualifier kinds of Content MathML's `apply` that no head owns ({@link mathQualifiers} but the
 * head qualifiers): an application that holds one is a binding or qualified one, whose argument
 * count no class states.
 */
const unownedQualifierKinds = handlesOf(mathQualifiers).filter(
  (kind) => !headQualifierKinds.includes(kind),
);

/**
 * The qualifier kinds of Content MathML's `apply`, none of which is an argument.
 */
const qualifierKinds = handlesOf(mathQualifiers);

/**
 * The operators whose syntax table lists a head qualifier (`MathHeadOperator`).
 */
const headOperatorKinds = MathHeadOperator.rows.map(({ kind }) => kind);

/**
 * The operators {@link MathArity} holds that take at least one argument. MathML 3's classes take one
 * or two (§4.3.4.5, §4.3.4.6; an n-ary operator has no greatest), and the arity law is stated by
 * the arguments and the pairs of arguments an application holds, so a class of more is no class it
 * can state, which the module refuses below.
 */
const leastOneKinds = MathArity.rows.flatMap(({ kind, min }) => (min >= 1n ? [kind] : []));

/**
 * The operators {@link MathArity} holds that take at least two arguments.
 */
const leastTwoKinds = MathArity.rows.flatMap(({ kind, min }) => (min >= 2n ? [kind] : []));

/**
 * The operators {@link MathMax} bounds at one argument.
 */
const mostOneKinds = MathMax.rows.flatMap(({ kind, max }) => (max === 1n ? [kind] : []));

/**
 * The operators {@link MathMax} bounds at two arguments.
 */
const mostTwoKinds = MathMax.rows.flatMap(({ kind, max }) => (max === 2n ? [kind] : []));

if (
  MathArity.rows.some(({ min }) => min > 2n) ||
  MathMax.rows.some(({ max }) => max < 1n || max > 2n)
) {
  throw new Error(
    "MathArity or MathMax holds an operator of a least above 2 or a most other than 1 or 2, and the arity law states only one or two arguments. State the class's count by a wider tuple of arguments.",
  );
}

/**
 * The applications that hold a qualifier no head owns, by the application's place: an element child
 * of an `m:apply` after its operator whose kind is one of {@link unownedQualifierKinds}, or a head
 * qualifier beside an operator that is no head operator. The arity law judges no such application
 * (MathML 3 §4.3.3: a qualified application's argument count is its operator's to say).
 */
const unownedQualifiers = query(QtiBase)
  .rule((r) => {
    const { elements, kind, package: pkg, parent, path } = v(Node, "qualifier");

    return r
      .match(Node, { elements, kind, package: pkg, parent, parentKind: "m:apply", path })
      .where(r.in(kind, unownedQualifierKinds), r.gt(elements, 1n))
      .find({ package: pkg, parent, path });
  })
  .rule((r) => {
    const { elements, kind, package: pkg, parent, path } = v(Node, "qualifier");
    const { kind: head } = v(Node, "operator");

    return r
      .match(Node, { elements, kind, package: pkg, parent, parentKind: "m:apply", path })
      .match(Node, { elements: 1n, kind: head, package: pkg, parent, path })
      .where(
        r.in(kind, headQualifierKinds),
        r.gt(elements, 1n),
        Logic.not(r.in(head, nonElementKinds)),
        Logic.not(r.in(head, headOperatorKinds)),
      )
      .find({ package: pkg, parent, path });
  });

/**
 * The applications whose operator takes at least one argument and that the arity law judges, by the
 * application's place: its first element child, its operator, of {@link leastOneKinds}, and no
 * qualifier no head owns ({@link unownedQualifiers}).
 */
const LeastOneApply = derived(
  "LeastOneApply",
  query(QtiBase).rule((r) => {
    const { kind: operator, package: pkg, parent: apply, path } = v(Node, "operator");

    return r
      .match(Node, {
        elements: 1n,
        kind: operator,
        package: pkg,
        parent: apply,
        parentKind: "m:apply",
        path,
      })
      .where(r.in(operator, leastOneKinds))
      .where(r.not(unownedQualifiers, { package: pkg, parent: apply, path }))
      .find({ apply, package: pkg, path });
  }),
);

/**
 * The judged applications whose operator takes at least two arguments, as {@link LeastOneApply}
 * reads them, of {@link leastTwoKinds}.
 */
const LeastTwoApply = derived(
  "LeastTwoApply",
  query(QtiBase).rule((r) => {
    const { kind: operator, package: pkg, parent: apply, path } = v(Node, "operator");

    return r
      .match(Node, {
        elements: 1n,
        kind: operator,
        package: pkg,
        parent: apply,
        parentKind: "m:apply",
        path,
      })
      .where(r.in(operator, leastTwoKinds))
      .where(r.not(unownedQualifiers, { package: pkg, parent: apply, path }))
      .find({ apply, package: pkg, path });
  }),
);

/**
 * Each argument of an `m:apply`, by its place: an element child after its operator that is none of
 * Content MathML's qualifier kinds.
 */
const ApplyArgument = derived(
  "ApplyArgument",
  query(QtiBase).rule((r) => {
    const { elements, kind, package: pkg, parent: apply, path, start } = v(Node, "argument");

    return r
      .match(Node, {
        elements,
        kind,
        package: pkg,
        parent: apply,
        parentKind: "m:apply",
        path,
        start,
      })
      .where(
        r.gt(elements, 1n),
        Logic.not(r.in(kind, nonElementKinds)),
        Logic.not(r.in(kind, qualifierKinds)),
      )
      .find({ apply, package: pkg, path, start });
  }),
);

/**
 * Each pair of arguments of an `m:apply`, the first before the second in document order, by the
 * application's place and the pair's two places.
 */
const ApplyArgumentPair = derived(
  "ApplyArgumentPair",
  query(QtiBase).rule((r) => {
    const { elements, kind, package: pkg, parent: apply, path, start: first } = v(Node, "first");
    const { elements: laterElements, kind: laterKind, start: second } = v(Node, "second");

    return r
      .match(Node, {
        elements,
        kind,
        package: pkg,
        parent: apply,
        parentKind: "m:apply",
        path,
        start: first,
      })
      .match(Node, {
        elements: laterElements,
        kind: laterKind,
        package: pkg,
        parent: apply,
        path,
        start: second,
      })
      .where(
        r.gt(elements, 1n),
        Logic.not(r.in(kind, nonElementKinds)),
        Logic.not(r.in(kind, qualifierKinds)),
        r.gt(laterElements, elements),
        Logic.not(r.in(laterKind, nonElementKinds)),
        Logic.not(r.in(laterKind, qualifierKinds)),
      )
      .find({ apply, first, package: pkg, path, second });
  }),
);

/**
 * Each argument of a judged application whose operator takes at most one, by its place: its
 * operator of {@link mostOneKinds}, its application holding no qualifier no head owns.
 */
const MostOneArgument = derived(
  "MostOneArgument",
  query(QtiBase).rule((r) => {
    const { kind: operator, package: pkg, parent: apply, path } = v(Node, "operator");
    const { elements, kind, start } = v(Node, "argument");

    return r
      .match(Node, {
        elements: 1n,
        kind: operator,
        package: pkg,
        parent: apply,
        parentKind: "m:apply",
        path,
      })
      .match(Node, { elements, kind, package: pkg, parent: apply, path, start })
      .where(
        r.in(operator, mostOneKinds),
        r.gt(elements, 1n),
        Logic.not(r.in(kind, nonElementKinds)),
        Logic.not(r.in(kind, qualifierKinds)),
      )
      .where(r.not(unownedQualifiers, { package: pkg, parent: apply, path }))
      .find({ apply, package: pkg, path, start });
  }),
);

/**
 * Each pair of arguments of a judged application whose operator takes at most two, as
 * {@link ApplyArgumentPair} pairs them, its operator of {@link mostTwoKinds}.
 */
const MostTwoArgumentPair = derived(
  "MostTwoArgumentPair",
  query(QtiBase).rule((r) => {
    const { kind: operator, package: pkg, parent: apply, path } = v(Node, "operator");
    const { elements, kind, start: first } = v(Node, "first");
    const { elements: laterElements, kind: laterKind, start: second } = v(Node, "second");

    return r
      .match(Node, {
        elements: 1n,
        kind: operator,
        package: pkg,
        parent: apply,
        parentKind: "m:apply",
        path,
      })
      .match(Node, { elements, kind, package: pkg, parent: apply, path, start: first })
      .match(Node, {
        elements: laterElements,
        kind: laterKind,
        package: pkg,
        parent: apply,
        path,
        start: second,
      })
      .where(
        r.in(operator, mostTwoKinds),
        r.gt(elements, 1n),
        Logic.not(r.in(kind, nonElementKinds)),
        Logic.not(r.in(kind, qualifierKinds)),
        r.gt(laterElements, elements),
        Logic.not(r.in(laterKind, nonElementKinds)),
        Logic.not(r.in(laterKind, qualifierKinds)),
      )
      .where(r.not(unownedQualifiers, { package: pkg, parent: apply, path }))
      .find({ apply, first, package: pkg, path, second });
  }),
);

/**
 * Each head qualifier beside a head operator, by the qualifier's place: an element child of an
 * `m:apply` after its operator whose kind is `degree`, `momentabout` or `logbase`, with its
 * application's operator as its `head`, an operator `MathHeadOperator` holds.
 */
const HeadQualifierPair = derived(
  "HeadQualifierPair",
  query(QtiBase).rule((r) => {
    const { elements, kind, package: pkg, parent, path, start } = v(Node, "qualifier");
    const { kind: head } = v(Node, "operator");

    return r
      .match(Node, { elements, kind, package: pkg, parent, parentKind: "m:apply", path, start })
      .match(Node, { elements: 1n, kind: head, package: pkg, parent, path })
      .where(r.in(kind, headQualifierKinds), r.gt(elements, 1n), r.in(head, headOperatorKinds))
      .find({ head, kind, package: pkg, path, start });
  }),
);

/**
 * The placed expressions `ResultBase` judges: every one but an attribute-typed expression of an
 * `unknown` base type, the type the import gives one whose typing attribute spells no base, which
 * AL1's value domain refuses alone and the query `ExpressionAttribute` types nothing by.
 * `ResultBase` is the information model's table of each kind's result bases, and states no
 * `unknown` for a kind whose attribute must spell one.
 */
const resultTyped = select(PlacedExpressionNode, (e) =>
  e.or(e.not(e.in(e.kind, attributeTypedKinds)), e.ne(e.baseType, "unknown")),
);

/**
 * The placed base values, each typed as its {@link Literal}.
 */
const baseValues = select(PlacedExpressionNode, (e) => e.eq(e.kind, "qti-base-value"));

/**
 * The placed base values whose `base-type` spells a base: each has its {@link LiteralTyped}. A base
 * value of an `unknown` base has none, since its text has no type to be read in.
 */
const typedBaseValues = select(PlacedExpressionNode, (e) =>
  e.and(e.eq(e.kind, "qti-base-value"), e.ne(e.baseType, "unknown")),
);

/**
 * The expressions whose parent is an expression: the operands, each of which has its
 * {@link OperandOf} row and takes its operator's language.
 */
const operandExpressions = select(ExpressionNode, (e) => e.in(e.parentKind, expressionKinds));

/**
 * The expression, operator and MathML laws that read an overlay's node's kind, parent or parent's
 * kind (`#pantry/qti/expressions.ts`, `#pantry/qti/operators.ts`, `#pantry/qti/mathml-share.ts`),
 * each named by its oracle law: `Arity` (P2; a math operator's count by its name, spec reading 241,
 * over {@link ExpressionOperand}, {@link MathOperand} and {@link BinaryMathOperator}),
 * `Condition_type` (P21) over {@link PlacedExpressionNode}, `One_base` and `Operand_fit` (P23) over
 * {@link OperandOf}, and `Outcome_only` (P25) over {@link ExpressionNode}; and `E1_derived`, each
 * placement's expressions exactly its documents' ({@link PlacedExpressionSite}), the result type
 * each kind derives under each placement, a base value's its literal's, each expression's language
 * its parent's or a rule's root's, every operand's row, each operand's operator and rank its
 * node's, and each ranked MathML element's rank below its parent's; "Equal tolerance" and
 * "Rounding figures" (readings 121 and 119) over {@link ToleranceToken} and
 * {@link RoundingModeFigures}; `MathML_share_cycle`, a share's rank above its target's; "MathML
 * arity" (MathML 3 §4.3.4.5 and §4.3.4.6, each operator's class from its §4.4
 * syntax table): a judged application, one whose every qualifier its head owns, holds at least one
 * argument where its class takes one and a pair of them where it takes two, and at most one
 * argument where its class takes one and one pair where it takes two, so no count is stored; and
 * "MathML head qualifier" (spec reading R6-head-qualifiers): each head qualifier beside a head
 * operator is a pair its syntax table lists.
 */
const expressionLawsByName = {
  Arity: declared("Arity", [
    // At least its least number: an operand of that rank.
    contained(
      on(ArityFloor, "package", "path", "start", "min"),
      on(ExpressionOperand, "package", "path", "operator", "rank"),
    ),
    // At most its greatest: no operand past it.
    check("Arity", ExpressionOperand, (o) =>
      o.or(
        o.not(OperatorMax.has(o.operatorKind)),
        o.le(o.rank, OperatorMax.at("max", o.operatorKind)),
      ),
    ),
    // A math operator's name fixes its count (spec reading 242): two sub-expressions for atan2,
    // one for every other name.
    contained(
      on(BinaryMathOperator, "package", "path", "start"),
      on(
        select(ExpressionOperand, (o) => o.eq(o.rank, 2n)),
        "package",
        "path",
        "operator",
      ),
    ),
    check("Arity", MathOperand, (o) =>
      o.or(o.le(o.rank, 1n), o.and(o.in(o.name, binaryMathOperators), o.le(o.rank, 2n))),
    ),
  ]),
  "Condition type": declared("Condition type", [
    check("Condition_type", PlacedExpressionNode, (e) =>
      e.or(
        e.not(e.in(e.parentKind, conditionKindHandles)),
        e.and(
          e.in(e.baseType, ["boolean", ...silentBases]),
          e.in(e.cardinality, ["single", "unknown"]),
        ),
      ),
    ),
  ]),
  "E1 derived": declared("E1 derived", [
    mirrors(
      on(PlacedExpression, "package", "assembly", "instance", "path", "start"),
      on(PlacedExpressionSite, "package", "assembly", "instance", "path", "start"),
    ),
    contained(
      on(
        select(ExpressionNode, (e) => e.in(e.parentKind, ruleKindHandles)),
        "package",
        "path",
        "parent",
        "language",
      ),
      on(Processing, "package", "path", "start", "language"),
    ),
    contained(
      on(operandExpressions, "package", "path", "parent", "language"),
      on(Expression, "package", "path", "start", "language"),
    ),
    contained(on(resultTyped, "kind", "baseType"), on(ResultBase, "kind", "base")),
    contained(
      on(PlacedExpressionNode, "kind", "cardinality"),
      on(ResultCardinality, "kind", "cardinality"),
    ),
    check("E1_derived", ExpressionNode, (e) =>
      e.or(
        e.in(e.parentKind, ruleKindHandles),
        e.in(e.parentKind, expressionKinds),
        e.eq(e.language, "none"),
      ),
    ),
    // The result type each dependent typing derives from its operands, operand by operand: a
    // numeric aggregate is unknown where an operand is, integer only where every operand is
    // integer or any; a container's, an Index's or a Random's base is each operand's that is not
    // any, else unknown; a Delete's base and cardinality are its later operands' the same way.
    check("E1_derived", OperandOf, (o) =>
      o.and(
        o.or(
          o.not(o.in(o.operatorKind, numericKinds)),
          o.and(
            o.or(o.ne(o.baseType, "unknown"), o.eq(o.operatorBase, "unknown")),
            o.or(o.ne(o.operatorBase, "integer"), o.in(o.baseType, ["integer", "any"])),
          ),
        ),
        o.or(
          o.not(o.in(o.operatorKind, baseTypedKinds)),
          o.eq(o.baseType, "any"),
          o.eq(o.operatorBase, o.baseType),
          o.eq(o.operatorBase, "unknown"),
        ),
        o.or(
          o.not(o.in(o.operatorKind, secondKinds)),
          o.le(o.rank, 1n),
          o.and(
            o.or(
              o.eq(o.baseType, "any"),
              o.eq(o.operatorBase, o.baseType),
              o.eq(o.operatorBase, "unknown"),
            ),
            o.or(
              o.eq(o.cardinality, "unknown"),
              o.eq(o.operatorCardinality, o.cardinality),
              o.eq(o.operatorCardinality, "unknown"),
            ),
          ),
        ),
      ),
    ),
    // A numeric aggregate that is unknown has an unknown operand, and one that is integer an
    // integer operand; one whose every operand is integer or any, one of them integer, is integer.
    // Every other numeric aggregate is float because `ResultBase` admits only integer, float and
    // unknown for the numeric kinds (`#pantry/grammar/expression.ts`), so these rules and that
    // containment together state the numeric typing's three arms.
    contained(
      on(
        select(PlacedExpressionNode, (e) =>
          e.and(e.in(e.kind, numericKinds), e.eq(e.baseType, "unknown")),
        ),
        "package",
        "assembly",
        "instance",
        "path",
        "start",
      ),
      on(
        select(OperandOf, (o) => o.eq(o.baseType, "unknown")),
        "package",
        "assembly",
        "instance",
        "path",
        "operator",
      ),
    ),
    contained(
      on(
        select(PlacedExpressionNode, (e) =>
          e.and(e.in(e.kind, numericKinds), e.eq(e.baseType, "integer")),
        ),
        "package",
        "assembly",
        "instance",
        "path",
        "start",
      ),
      on(
        select(OperandOf, (o) => o.eq(o.baseType, "integer")),
        "package",
        "assembly",
        "instance",
        "path",
        "operator",
      ),
    ),
    check("E1_derived", IntegerAggregate, (a) => a.eq(a.operatorBase, "integer")),
    // A container, an Index or a Random of a base other than any has an operand that is not any,
    // and one that is unknown has two operands of two bases, or an unknown one.
    contained(
      on(
        select(PlacedExpressionNode, (e) =>
          e.and(e.in(e.kind, baseTypedKinds), e.ne(e.baseType, "any")),
        ),
        "package",
        "assembly",
        "instance",
        "path",
        "start",
      ),
      on(
        select(OperandOf, (o) => o.ne(o.baseType, "any")),
        "package",
        "assembly",
        "instance",
        "path",
        "operator",
      ),
    ),
    contained(
      on(
        select(PlacedExpressionNode, (e) =>
          e.and(e.in(e.kind, baseTypedKinds), e.eq(e.baseType, "unknown")),
        ),
        "package",
        "assembly",
        "instance",
        "path",
        "start",
      ),
      on(UnknownOperandBase, "package", "assembly", "instance", "path", "operator"),
    ),
    // A Delete the same way over its later operands, and its cardinality known where exactly one
    // known cardinality stands among them.
    contained(
      on(
        select(PlacedExpressionNode, (e) =>
          e.and(e.in(e.kind, secondKinds), e.ne(e.baseType, "any")),
        ),
        "package",
        "assembly",
        "instance",
        "path",
        "start",
      ),
      on(
        select(OperandOf, (o) => o.and(o.gt(o.rank, 1n), o.ne(o.baseType, "any"))),
        "package",
        "assembly",
        "instance",
        "path",
        "operator",
      ),
    ),
    contained(
      on(
        select(PlacedExpressionNode, (e) =>
          e.and(e.in(e.kind, secondKinds), e.eq(e.baseType, "unknown")),
        ),
        "package",
        "assembly",
        "instance",
        "path",
        "start",
      ),
      on(UnknownTailBase, "package", "assembly", "instance", "path", "operator"),
    ),
    contained(
      on(
        select(PlacedExpressionNode, (e) =>
          e.and(e.in(e.kind, secondKinds), e.ne(e.cardinality, "unknown")),
        ),
        "package",
        "assembly",
        "instance",
        "path",
        "start",
      ),
      on(
        select(OperandOf, (o) => o.and(o.gt(o.rank, 1n), o.ne(o.cardinality, "unknown"))),
        "package",
        "assembly",
        "instance",
        "path",
        "operator",
      ),
    ),
    check("E1_derived", OneTailCardinality, (t) => t.ne(t.cardinality, "unknown")),
    // A base value is typed as its literal in every placement, and one of a base its literal's
    // code.
    contained(
      on(baseValues, "package", "path", "start", "baseType"),
      on(Literal, "package", "path", "start", "baseType"),
    ),
    contained(
      on(typedBaseValues, "package", "path", "start"),
      on(LiteralTyped, "package", "path", "start"),
    ),
    contained(
      on(
        select(ProcessingNode, (p) =>
          p.and(p.not(p.in(p.kind, rootKinds)), p.in(p.parentKind, ruleKindHandles)),
        ),
        "package",
        "path",
        "parent",
        "language",
      ),
      on(Processing, "package", "path", "start", "language"),
    ),
    contained(
      on(
        select(MathRankNode, (m) => m.and(m.ne(m.kind, "m:math"), m.ne(m.start, m.parent))),
        "package",
        "path",
        "parent",
      ),
      on(MathRank, "package", "path", "start"),
    ),
    check("E1_derived", MathRankStep, (m) =>
      m.or(m.eq(m.kind, "m:math"), m.eq(m.start, m.parent), m.lt(m.rank, m.parentRank)),
    ),
    contained(
      on(
        select(PlacedMathRankNode, (m) => m.and(m.ne(m.kind, "m:math"), m.ne(m.start, m.parent))),
        "package",
        "assembly",
        "instance",
        "parent",
      ),
      on(PlacedMathRank, "package", "assembly", "instance", "start"),
    ),
    check("E1_derived", PlacedMathRankStep, (m) =>
      m.or(m.eq(m.kind, "m:math"), m.eq(m.start, m.parent), m.lt(m.rank, m.parentRank)),
    ),
    contained(
      on(innerScopes, "package", "path", "parent", "cell", "received", "inherited"),
      on(MathAlignScope, "package", "path", "start", "cell", "passes", "own"),
    ),
    contained(
      on(actionChildren, "package", "path", "parent", "chosen"),
      on(MathAction, "package", "path", "start", "selection"),
    ),
    check("E1_derived", ScopeNode, (s) =>
      s.and(
        s.or(
          s.and(s.eq(s.kind, "m:mtd"), s.eq(s.cell, s.start), s.eq(s.state, "open")),
          s.and(
            s.ne(s.kind, "m:mtd"),
            s.ne(s.cell, s.start),
            s.or(s.eq(s.parentKind, "m:maction"), s.eq(s.chosen, 0n)),
            s.or(
              s.and(
                s.eq(s.parentKind, "m:maction"),
                s.ne(s.elements, s.chosen),
                s.eq(s.state, "unjudged"),
              ),
              s.and(
                s.or(s.ne(s.parentKind, "m:maction"), s.eq(s.elements, s.chosen)),
                s.eq(s.state, s.received),
              ),
            ),
          ),
        ),
        s.or(
          s.and(s.eq(s.state, "unjudged"), s.eq(s.passes, "unjudged")),
          s.and(s.eq(s.state, "closed"), s.eq(s.passes, "closed")),
          s.and(
            s.eq(s.state, "open"),
            s.eq(s.passes, "open"),
            s.or(
              s.in(s.kind, letKinds),
              s.and(s.in(s.kind, directedKinds), s.eq(s.own, s.inherited)),
            ),
          ),
          s.and(
            s.eq(s.state, "open"),
            s.eq(s.passes, "closed"),
            s.not(s.in(s.kind, letKinds)),
            s.or(s.not(s.in(s.kind, directedKinds)), s.ne(s.own, s.inherited)),
          ),
        ),
      ),
    ),
    contained(
      on(MathAlignGroup, "package", "path", "start"),
      on(openGroups, "package", "path", "start"),
    ),
    contained(
      on(openGroups, "package", "path", "start", "cell"),
      on(MathAlignGroup, "package", "path", "start", "cell"),
    ),
    contained(on(CellLeaf, "package", "path", "start"), on(leafScopes, "package", "path", "start")),
    contained(on(leafScopes, "package", "path", "start"), on(CellLeaf, "package", "path", "start")),
    check("E1_derived", ProcessingNode, (p) =>
      p.or(
        ...rootLanguages.map(([kind, language]) =>
          p.and(p.eq(p.kind, kind), p.eq(p.language, language)),
        ),
        p.and(p.not(p.in(p.kind, rootKinds)), p.in(p.parentKind, ruleKindHandles)),
        p.and(
          p.not(p.in(p.kind, rootKinds)),
          p.not(p.in(p.parentKind, ruleKindHandles)),
          p.eq(p.language, "none"),
        ),
      ),
    ),
  ]),
  "Equal tolerance": declared("Equal tolerance", [toleranceFirst, toleranceValue]),
  "MathML align first": declared("MathML align first", [
    check("MathML_align_first", CellLeafNode, (l) =>
      l.or(l.ne(l.at, 0n), l.eq(l.groups, 0n), l.eq(l.kind, "m:maligngroup")),
    ),
  ]),
  "MathML align placement": declared("MathML align placement", [
    check("MathML_align_placement", ScopeNode, (s) =>
      s.or(s.ne(s.kind, "m:maligngroup"), s.ne(s.state, "closed")),
    ),
  ]),
  "MathML arity": declared("MathML arity", [
    contained(
      on(LeastOneApply, "package", "path", "apply"),
      on(ApplyArgument, "package", "path", "apply"),
    ),
    contained(
      on(LeastTwoApply, "package", "path", "apply"),
      on(ApplyArgumentPair, "package", "path", "apply"),
    ),
    key(on(MostOneArgument, "package", "path", "apply")),
    key(on(MostTwoArgumentPair, "package", "path", "apply")),
  ]),
  "MathML head qualifier": declared("MathML head qualifier", [
    contained(on(HeadQualifierPair, "head", "kind"), on(HeadQualifier, "head", "qualifier")),
  ]),
  "MathML maction selection": declared("MathML maction selection", [
    check("MathML_maction_selection", MathActionNode, (m) =>
      m.and(
        m.gt(m.elementChildren, 0n),
        m.ge(m.selection, 1n),
        m.le(m.selection, m.elementChildren),
      ),
    ),
  ]),
  "MathML share cycle": declared("MathML share cycle", [
    check("MathML_share_cycle", ShareRanks, (s) => s.gt(s.shareRank, s.targetRank)),
    check("MathML_share_cycle", PlacedShareRanks, (s) => s.gt(s.shareRank, s.targetRank)),
  ]),
  "One base": declared("One base", [
    key(on(KnownOperandBase, "package", "assembly", "instance", "path", "operator")),
    key(on(KnownOperandCardinality, "package", "assembly", "instance", "path", "operator")),
  ]),
  "Operand fit": declared("Operand fit", [
    check("Operand_fit", OperandOf, (o) =>
      o.and(
        o.eq(Bits.subset(o.baseTypeBit, OperandBase.row(o.operatorKind)), true),
        o.or(
          o.ne(o.rank, 1n),
          o.eq(Bits.subset(o.cardinalityBit, LeadCardinality.row(o.operatorKind)), true),
        ),
        o.or(
          o.le(o.rank, 1n),
          o.eq(Bits.subset(o.cardinalityBit, TailCardinality.row(o.operatorKind)), true),
        ),
      ),
    ),
  ]),
  "Outcome only": declared("Outcome only", [
    check("Outcome_only", ExpressionNode, (e) =>
      e.or(e.not(e.in(e.kind, outcomeOnlyKinds)), e.eq(e.language, "outcome")),
    ),
  ]),
  "Rounding figures": declared("Rounding figures", [roundingFigures]),
} as const;

/**
 * The rules of this module, grouped by the law each states, one record per module of the domain.
 */
export const expressionOverlayLawsByName = expressionLawsByName;

/**
 * The queries of this module, each carrying its own name.
 */
export const expressionOverlayRelations = [
  ArityFloor,
  BinaryMathOperator,
  IntegerAggregate,
  KnownOperandBase,
  KnownOperandCardinality,
  OneTailCardinality,
  UnknownOperandBase,
  UnknownTailBase,
  ApplyArgument,
  ApplyArgumentPair,
  CellLeafNode,
  ExpressionNode,
  ExpressionOperand,
  HeadQualifierPair,
  LeastOneApply,
  LeastTwoApply,
  MathActionNode,
  MathOperand,
  MathRankNode,
  MathRankStep,
  MostOneArgument,
  MostTwoArgumentPair,
  OperandOf,
  PlacedExpressionNode,
  PlacedExpressionSite,
  PlacedMathRankNode,
  PlacedMathRankStep,
  PlacedShareRanks,
  ProcessingNode,
  RoundingModeFigures,
  ScopeNode,
  ShareRanks,
  ToleranceToken,
] as const;

/**
 * The rules of this module, {@link expressionOverlayLawsByName} flattened.
 */
export const expressionOverlayLaws = Object.values(expressionLawsByName).flat();
