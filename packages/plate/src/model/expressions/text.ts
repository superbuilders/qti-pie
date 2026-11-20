/**
 * The text family of the item model: the kind rules and reader specs of `qti-string-match`,
 * `qti-substring`, `qti-pattern-match`, `qti-inside` and `qti-custom-operator`.
 *
 * `qti-string-match`, `qti-substring` and `qti-pattern-match` take single strings, and `qti-inside`
 * takes points; each gives a single boolean. `qti-pattern-match`'s `pattern` may name a string
 * variable, so its rule declares it in its reference facet. `qti-custom-operator`'s result "is
 * defined by the extension", so its rule types it unknown and judges no operand.
 *
 * It value-imports only `effect`, `#plate/model/expression.ts`, `#plate/model/regex.ts`,
 * `#plate/model/values.ts`, `#plate/vocabulary.ts` and the leaf `#plate/model/attributes.ts`, and
 * names the registry's reader types with `import type` only, so the registry in
 * `#plate/model/expressions/read.ts` may import it without a cycle.
 *
 * @module
 */
import { Option, Result, pipe } from "effect";
import {
  coordsOf,
  elementsOf,
  identifierOf,
  isQti,
  requiredBoolean,
  requiredListed,
  requiredValue,
  soleChild,
  valueOf,
  xsBoolean,
} from "#plate/model/attributes.ts";
import {
  acceptsAnyOperands,
  everyOperand,
  singleOf,
  stringOrRefOf,
} from "#plate/model/expression.ts";
import type { Expression, FamilyRules, KindRule } from "#plate/model/expression.ts";
import type { FamilyReaders, ReaderSpec, Variant } from "#plate/model/expressions/read.ts";
import { compile } from "#plate/model/regex.ts";
import { trimXmlSpace } from "#plate/model/values.ts";
import { areaGeometries } from "#plate/vocabulary.ts";

/**
 * The rule of `qti-string-match` and `qti-substring`: a single boolean, of two operands that must
 * each be a single string, so each operand of another type is a mismatch that accepts `string`,
 * `single`. The qti package refuses the same (P23, the `Operand fit` law in
 * `packages/pantry/src/qti/expressions.ts`, over the kinds' typings in `expressionTypings`,
 * `packages/pantry/src/grammar/expression.ts`).
 *
 * @see https://www.imsglobal.org/spec/qti/v3p0/info#OpStringMatch
 * @see https://www.imsglobal.org/spec/qti/v3p0/info#OpSubstring
 */
const stringRule: KindRule = {
  operandsAccept: everyOperand(["string"], ["single"]),
  references: [],
  resultType: () => singleOf("boolean"),
};

/**
 * The rule of `qti-pattern-match`: the rule of the other string kinds, with a reference facet for
 * its `pattern`, which may name a variable of base type string (`stringOrVariableRef`). A
 * reference there is checked: the database refuses one to a variable that is not a single string
 * template or outcome variable (P24), and the walks mark one the engine does not hold. A braced
 * name that names no variable is literal text, never a reference (§2.7.2).
 *
 * @see https://www.imsglobal.org/spec/qti/v3p0/info#OpPatternMatch
 */
const patternMatchRule: KindRule = {
  ...stringRule,
  references: [
    { attribute: "pattern", baseType: "string", checked: true, field: "pattern", list: false },
  ],
};

/**
 * The rule of `qti-inside`: a single boolean, of one operand that must be a point of any
 * cardinality but a record, so an operand of another type is a mismatch that accepts `point`,
 * and `multiple`, `ordered` and `single`, in the qti package's order (P23).
 *
 * @see https://www.imsglobal.org/spec/qti/v3p0/info#OpInside
 */
const insideRule: KindRule = {
  operandsAccept: everyOperand(["point"], ["multiple", "ordered", "single"]),
  references: [],
  resultType: () => singleOf("boolean"),
};

/**
 * The rule of `qti-custom-operator`: its result "is defined by the extension", so it is typed
 * unknown, which satisfies every rule above it, and none of its operands is judged, as the qti
 * package types it (its fixed `unknown` typing in `expressionTypings`,
 * `packages/pantry/src/grammar/expression.ts`).
 *
 * @see https://www.imsglobal.org/spec/qti/v3p0/info#OpCustomOp
 */
const customOperatorRule: KindRule = {
  operandsAccept: acceptsAnyOperands,
  references: [],
  resultType: () => ({ baseType: "unknown", cardinality: "unknown" }),
};

/**
 * The text family's kind rules by kind.
 */
export const textRules: FamilyRules<
  "custom-operator" | "inside" | "pattern-match" | "string-match" | "substring"
> = {
  "custom-operator": customOperatorRule,
  inside: insideRule,
  "pattern-match": patternMatchRule,
  "string-match": stringRule,
  substring: stringRule,
};

/**
 * The reader spec of `qti-string-match`: its two operands, its required `case-sensitive`, and its
 * `substring`, false when absent.
 *
 * A document outside admission's contract here is a defect (`InadmissibleDocument`): the
 * database refuses it.
 */
const stringMatchReader: ReaderSpec<"string-match"> = {
  _tag: "generic",
  arity: "two",
  attributes: (context, element) => {
    const caseSensitive = requiredBoolean(context.walk, element, "case-sensitive");
    const substring = xsBoolean(context.walk, element, "substring", false);

    return (operands) => ({ caseSensitive, kind: "string-match", operands, substring });
  },
};

/**
 * The reader spec of `qti-substring`: its two operands and its required `case-sensitive`.
 *
 * A document outside admission's contract here is a defect (`InadmissibleDocument`): the
 * database refuses it.
 */
const substringReader: ReaderSpec<"substring"> = {
  _tag: "generic",
  arity: "two",
  attributes: (context, element) =>
    pipe(
      requiredBoolean(context.walk, element, "case-sensitive"),
      (caseSensitive) => (operands) => ({ caseSensitive, kind: "substring", operands }),
    ),
};

/**
 * The reader spec of `qti-pattern-match`: its one operand and its required `pattern`, read whole.
 *
 * The pattern is split into literal text or a reference by `stringOrRefOf` against the item's
 * declared names, as written and untrimmed (reading 7): only `{name}` whose name names a variable
 * the item holds is a reference. A braced name that names no variable is literal text, braces kept,
 * and never refused as P8, since the information model treats a string attribute that "appears to
 * be a reference to a template or outcome variable but there is no variable with the given name"
 * as a string value (§2.7.2); the qti package stores it as written too.
 *
 * A literal is compiled here only to decide its mark: one `compile` in `#plate/model/regex.ts`
 * refuses (outside XML Schema's regular expressions, readings 55 and 58, or past the automaton's
 * limit) is the mark `pattern` at the element's path, and its operand is read after it, so every
 * element in it the engine does not run is marked too; it builds nothing. So a braced name that
 * names nothing, whose `{` opens no repetition count, is always marked `pattern`. A reference is
 * compiled when the engine evaluates it.
 *
 * An absent `pattern` is a defect (`InadmissibleDocument`): the database refuses it.
 */
const patternMatchReader: ReaderSpec<"pattern-match"> = {
  _tag: "custom",
  read: (context, element) => {
    const operand = soleChild(element);

    const pattern = stringOrRefOf(
      requiredValue(context.walk, element, "pattern"),
      context.declared,
    );
    const refused = pattern._tag === "literal" && Result.isFailure(compile(pattern.value));
    if (refused) {
      context.mark(element, "pattern");
    }

    const read = context.expression(operand);

    return refused
      ? Option.none()
      : read.pipe(
          Option.map((only): Variant<"pattern-match"> => ({
            kind: "pattern-match",
            operands: [only],
            pattern,
          })),
        );
  },
};

/**
 * The reader spec of `qti-inside`: its one operand, its required `shape`, one of the five area
 * shapes, and its required `coords`, each a number in written order, read as `qti-area-map-entry`'s
 * are.
 *
 * A coordinate written with `%` is the mark `area-coords-percent` at the element's path, as an area
 * mapping that holds one marks it, since a percentage is of a size the item does not give; its
 * operand is read after it, so every element in it the engine does not run is marked too, and it
 * builds nothing.
 *
 * A document outside admission's contract here is a defect (`InadmissibleDocument`): the
 * database refuses it.
 */
const insideReader: ReaderSpec<"inside"> = {
  _tag: "custom",
  read: (context, element) => {
    const operand = soleChild(element);

    const shape = requiredListed(context.walk, element, "shape", areaGeometries);
    const written = coordsOf(context.walk, element);
    const percent = written.some(([, isPercent]) => isPercent);
    if (percent) {
      context.mark(element, "area-coords-percent");
    }

    const read = context.expression(operand);

    return percent
      ? Option.none()
      : read.pipe(
          Option.map((only): Variant<"inside"> => ({
            coords: written.map(([number]) => number),
            kind: "inside",
            operands: [only],
            shape,
          })),
        );
  },
};

/**
 * The reader spec of `qti-custom-operator`: its operands, the QTI expressions among its children,
 * zero or more in document order, and its optional `class` and `definition`.
 *
 * The operator is the mark `qti-custom-operator` at its path, and its processing still runs, with
 * the operator's value NULL. Its foreign content is not read: an attribute in another
 * namespace, and an element in another namespace (its `grpLax.any`), are neither held nor marked.
 * Every operand is read, so every element in them the engine does not run is marked.
 *
 * `class` is an identifier, read with its outer whitespace gone; `definition` is an `xs:anyURI`,
 * whose whitespace facet collapses, so its outer whitespace goes too.
 */
const customOperatorReader: ReaderSpec<"custom-operator"> = {
  _tag: "custom",
  read: (context, element) => {
    context.mark(element, "qti-custom-operator");

    const read: Option.Option<Expression>[] = [];
    for (const child of elementsOf(element).filter((each) => isQti(each))) {
      read.push(context.expression(child));
    }

    return pipe(
      Option.all(read),
      Option.map((operands): Variant<"custom-operator"> => ({
        class: Option.map(valueOf(element, "class"), identifierOf),
        definition: Option.map(valueOf(element, "definition"), trimXmlSpace),
        kind: "custom-operator",
        operands,
      })),
    );
  },
};

/**
 * The text family's reader specs by kind.
 */
export const textReaders: FamilyReaders<
  "custom-operator" | "inside" | "pattern-match" | "string-match" | "substring"
> = {
  "custom-operator": customOperatorReader,
  inside: insideReader,
  "pattern-match": patternMatchReader,
  "string-match": stringMatchReader,
  substring: substringReader,
};
