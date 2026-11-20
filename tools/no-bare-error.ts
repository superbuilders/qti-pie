/**
 * The parts of a parsed syntax node the rule reads.
 */
interface SyntaxNode {
  type: string;
  name?: string;
  range: [number, number];
}

/**
 * A parsed `new` expression: what it constructs.
 */
interface NewExpressionNode {
  callee: SyntaxNode;
  range: [number, number];
}

/**
 * A parsed class, declared or written as an expression: what it extends, when it extends anything.
 */
interface ClassNode {
  superClass: SyntaxNode | null;
  range: [number, number];
}

/**
 * The part of Oxlint's rule context the rule reports through.
 */
interface RuleContext {
  report: (descriptor: {
    data: { name: string };
    messageId: "noBareError";
    node: SyntaxNode;
  }) => void;
}

/**
 * The rule's visitor: it inspects `new` expressions and classes.
 */
interface Visitor {
  ClassDeclaration: (node: ClassNode) => void;
  ClassExpression: (node: ClassNode) => void;
  NewExpression: (node: NewExpressionNode) => void;
}

/**
 * The rule summary exposed by Oxlint configuration and editor tooling.
 */
const description =
  "Fail with a tagged error class, never a bare `Error`, `RangeError` or `TypeError` or a class extending one.";

/**
 * The diagnostic.
 */
const message =
  "`{{name}}` has no tag a caller can match. Declare the failure with `Schema.TaggedError` (or `Data.TaggedError` where no Schema is loaded) and fail with that.";

/**
 * The built-in error constructors, by global name.
 */
const bareErrors: ReadonlySet<string> = new Set([
  "AggregateError",
  "Error",
  "EvalError",
  "RangeError",
  "ReferenceError",
  "SyntaxError",
  "TypeError",
  "URIError",
]);

/**
 * Give the built-in error a node names by its global name, if it names one.
 *
 * @param node - The constructed or extended expression.
 * @returns The name, or undefined for anything but an identifier naming a built-in error.
 */
const bareErrorOf = (node: SyntaxNode | null): string | undefined =>
  node?.type === "Identifier" && node.name !== undefined && bareErrors.has(node.name)
    ? node.name
    : undefined;

/**
 * Reports `new Error(…)`, or `new` of any other built-in error constructor, and a class that
 * extends one. A failure a caller can tell apart is a tagged error: its `_tag` is what
 * `Effect.catchTag` and a `Match` read, and a bare error carries none.
 */
const noBareError = {
  /**
   * @param context Oxlint rule context for reporting diagnostics.
   * @returns Visitor that inspects `new` expressions and classes.
   */
  create(context: RuleContext): Visitor {
    /**
     * @param node A class, declared or written as an expression.
     */
    const checkClass = (node: ClassNode): void => {
      const name = bareErrorOf(node.superClass);

      if (name !== undefined && node.superClass !== null) {
        context.report({ data: { name }, messageId: "noBareError", node: node.superClass });
      }
    };

    return {
      ClassDeclaration: checkClass,
      ClassExpression: checkClass,
      /**
       * @param node Parsed `new` expression candidate.
       */
      NewExpression(node: NewExpressionNode): void {
        const name = bareErrorOf(node.callee);

        if (name !== undefined) {
          context.report({ data: { name }, messageId: "noBareError", node: node.callee });
        }
      },
    };
  },
  meta: {
    docs: {
      description,
    },
    messages: {
      noBareError: message,
    },
    schema: [],
    type: "problem",
  },
};

export default noBareError;
