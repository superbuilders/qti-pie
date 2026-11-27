/**
 * The compiler of expressions: an element and its operands, depth first, into a typed node. Each
 * element is its kind's (its local name without `qti-`), read by that kind's operator: the operand
 * elements compiled first, in document order, then held to the kind's arity, its attributes read
 * and resolved, its static type found. Any refusal refuses the whole expression, the first one met
 * named.
 *
 * @module
 */
import { expressionKinds } from "#processing/ir.ts";
import type { Expression, ExpressionKind, KindNode } from "#processing/ir.ts";
import { invariant } from "#processing/invariant.ts";
import { checked, refused } from "#processing/operators/operator.ts";
import type {
  Checked,
  CompileContext,
  Operator,
  OperatorTable,
} from "#processing/operators/operator.ts";
import { qtiChildren, qtiNamespace } from "#processing/xml.ts";
import type { XmlElement } from "#processing/xml.ts";

/**
 * Whether a name is a kind a table holds.
 *
 * @param table - The operators.
 * @param name - The name.
 * @returns Whether the table holds it.
 */
const holds = <K extends ExpressionKind>(table: OperatorTable<K>, name: string): name is K =>
  Object.hasOwn(table, name);

/**
 * Whether a node built of one kind is an expression: its kind is one of the kinds, and a node of a
 * kind is the expression of that kind, which TypeScript cannot see through a kind it holds
 * generically.
 *
 * @param node - The node.
 * @returns Whether it is an expression.
 */
const isExpression = <P extends ExpressionKind>(
  node: KindNode<P>,
): node is KindNode<P> & Expression => expressionKinds.includes(node.kind);

/**
 * A compiler of a document's expressions.
 *
 * @param table - The operators, by kind.
 * @param context - The document's declarations.
 * @param placeOf - Where each of the document's elements stands.
 * @returns The compiler of one expression element.
 */
export const expressionCompiler = <K extends ExpressionKind>(
  table: OperatorTable<K>,
  context: CompileContext,
  placeOf: (element: XmlElement) => number,
): ((element: XmlElement) => Checked<Expression>) => {
  /**
   * Compile an element of a kind.
   *
   * @param kind - The kind.
   * @param element - The element.
   * @param place - Its place.
   * @param compileOperand - The compiler of its operand elements.
   * @returns Its node.
   */
  const compileKind = (
    kind: K,
    element: XmlElement,
    place: number,
    compileOperand: (operand: XmlElement) => Checked<Expression>,
  ): Checked<Expression> => {
    const operator: Operator<K> = table[kind];
    const operands: Expression[] = [];
    for (const child of qtiChildren(element)) {
      const operand = compileOperand(child);
      if (!operand.ok) {
        return operand;
      }

      operands.push(operand.value);
    }

    if (!operator.arity(operands)) {
      return refused("arity", place, `give qti-${kind} the operands its definition takes`);
    }

    const attributes = operator.read(element, context, place);
    if (!attributes.ok) {
      return attributes;
    }

    const type = operator.typing(operands, attributes.value, place);
    if (!type.ok) {
      return type;
    }

    const node: KindNode<K> = { ...attributes.value, kind, operands, place, type: type.value };
    invariant(isExpression(node), "a node of a kind is an expression");

    return checked(node);
  };

  const compile = (element: XmlElement): Checked<Expression> => {
    const place = placeOf(element);
    const name = element.local.slice("qti-".length);

    return element.namespace === qtiNamespace &&
      element.local.startsWith("qti-") &&
      holds(table, name)
      ? compileKind(name, element, place, compile)
      : refused("element", place, `${element.local} is no expression this package evaluates`);
  };

  return compile;
};
