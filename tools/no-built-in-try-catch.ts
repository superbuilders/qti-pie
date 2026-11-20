/**
 * A parsed try statement: the rule reads only its handler.
 */
interface TryStatementNode {
  handler?: unknown;
}

/**
 * The part of Oxlint's rule context the rule reports through.
 */
interface RuleContext {
  report: (descriptor: { messageId: "noBuiltInTryCatch"; node: TryStatementNode }) => void;
}

/**
 * The rule's visitor: it inspects parsed try statements.
 */
interface Visitor {
  TryStatement: (node: TryStatementNode) => void;
}

/**
 * The rule summary exposed by Oxlint configuration and editor tooling.
 */
const description =
  "Disallow built-in try/catch blocks so recoverable failures use Effect error channels and explicit error handling.";

/**
 * The diagnostic explaining the required typed Effect boundary.
 */
const message = [
  "Avoid built-in try/catch blocks: they can wrap multiple operations and hide which operation failed.",
  "Use Effect.try or Effect.tryPromise around the failing operation and handle its typed error.",
].join(" ");

/**
 * Reports built-in try/catch blocks that obscure atomic failure boundaries.
 */
const noBuiltInTryCatch = {
  /**
   * @param context Oxlint rule context for reporting diagnostics.
   * @returns Visitor that inspects parsed try statements.
   */
  create(context: RuleContext): Visitor {
    return {
      /**
       * @param node Parsed try statement candidate.
       */
      TryStatement(node: TryStatementNode): void {
        if (node.handler === undefined) {
          return;
        }

        if (node.handler === null) {
          return;
        }

        context.report({
          messageId: "noBuiltInTryCatch",
          node,
        });
      },
    };
  },
  meta: {
    docs: {
      description,
    },
    messages: {
      noBuiltInTryCatch: message,
    },
    schema: [],
    type: "problem",
  },
};

export default noBuiltInTryCatch;
