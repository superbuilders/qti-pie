/**
 * The parts of a parsed syntax node the rule reads.
 */
interface SyntaxNode {
  type: string;
  name?: string;
  computed?: boolean;
  object?: SyntaxNode;
  property?: SyntaxNode;
  range: [number, number];
}

/**
 * A parsed call expression: its callee and the node it sits in.
 */
interface CallExpressionNode {
  callee: SyntaxNode;
  parent: SyntaxNode;
  range: [number, number];
}

/**
 * An edit Oxlint's fixer makes: the text that replaces a range of the source.
 */
interface Fix {
  range: [number, number];
  text: string;
}

/**
 * The part of Oxlint's fixer the rule's fix uses.
 */
interface RuleFixer {
  insertTextBefore: (node: CallExpressionNode, text: string) => Fix;
}

/**
 * The part of Oxlint's rule context the rule reports through.
 */
interface RuleContext {
  report: (descriptor: {
    fix?: (fixer: RuleFixer) => Fix;
    messageId: "throwNewError";
    node: CallExpressionNode;
  }) => void;
}

/**
 * The rule's visitor: it inspects parsed call expressions.
 */
interface Visitor {
  CallExpression: (node: CallExpressionNode) => void;
}

/**
 * The rule summary exposed by Oxlint configuration and editor tooling.
 */
const description =
  "Require `new` when creating an error, except through Effect's tagged error class factories.";

/**
 * The diagnostic: unicorn's, which this rule replaces.
 */
const message =
  "Require `new` when throwing an error. Using `new` ensures the error is correctly initialized.";

/**
 * The class factories whose call names an error but builds a class, each an object and its member:
 * `Data.TaggedError(tag)`, which oxc's rule exempts itself, and `Schema.TaggedError<Self>()`, which
 * it does not.
 */
const factories: readonly (readonly [string, string])[] = [
  ["Data", "TaggedError"],
  ["Schema", "TaggedError"],
];

/**
 * Decide whether a callee is one of Effect's tagged error class factories.
 *
 * @param callee - The call's callee.
 * @returns Whether it is `Data.TaggedError` or `Schema.TaggedError`.
 */
const isFactory = (callee: SyntaxNode): boolean =>
  callee.type === "MemberExpression" &&
  callee.computed === false &&
  callee.object?.type === "Identifier" &&
  callee.property?.type === "Identifier" &&
  factories.some(
    ([object, member]) => callee.object?.name === object && callee.property?.name === member,
  );

/**
 * Decide whether a name is an error's: at least five characters, an ASCII capital first, and
 * `Error` last, as oxc's rule decides it.
 *
 * @param name - The called name.
 * @returns Whether it names an error.
 */
const isErrorName = (name: string | undefined): boolean =>
  name !== undefined && name.length >= 5 && /^[A-Z]/u.test(name) && name.endsWith("Error");

/**
 * Decide whether a call is made by an error's name: an identifier's, or a non-computed member's
 * property. Any other callee, a call or a computed member, names nothing, as oxc reads it.
 *
 * @param callee - The call's callee.
 * @returns Whether its name is an error's.
 */
const callsErrorName = (callee: SyntaxNode): boolean => {
  if (callee.type === "Identifier") {
    return isErrorName(callee.name);
  }

  return (
    callee.type === "MemberExpression" &&
    callee.computed === false &&
    callee.property?.type === "Identifier" &&
    isErrorName(callee.property.name)
  );
};

/**
 * Reports an error constructor called without `new`: oxlint's `unicorn/throw-new-error`, read as
 * oxc implements it (`crates/oxc_linter/src/rules/unicorn/throw_new_error.rs`), which exempts only
 * `Data.TaggedError`, with `Schema.TaggedError` exempt beside it. `Schema.TaggedError<Self>()` is a
 * class factory called once in an `extends` clause and never thrown, and the rule has no option to
 * exempt it.
 *
 * A call that is a decorator is no construction and is skipped. A call in an `extends` clause is
 * reported without a fix, and every other is fixed by writing `new` before it.
 */
const throwNewError = {
  /**
   * @param context Oxlint rule context for reporting diagnostics.
   * @returns Visitor that inspects parsed call expressions.
   */
  create(context: RuleContext): Visitor {
    return {
      /**
       * @param node Parsed call expression candidate.
       */
      CallExpression(node: CallExpressionNode): void {
        if (
          node.parent.type === "Decorator" ||
          isFactory(node.callee) ||
          !callsErrorName(node.callee)
        ) {
          return;
        }

        if (node.parent.type === "ClassDeclaration" || node.parent.type === "ClassExpression") {
          context.report({ messageId: "throwNewError", node });

          return;
        }

        context.report({
          fix: (fixer) => fixer.insertTextBefore(node, "new "),
          messageId: "throwNewError",
          node,
        });
      },
    };
  },
  meta: {
    docs: {
      description,
    },
    fixable: "code",
    messages: {
      throwNewError: message,
    },
    schema: [],
    type: "problem",
  },
} as const;

export default throwNewError;
