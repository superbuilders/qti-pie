import { Option, Predicate, Schema } from "effect";
import type { RuleTester } from "oxlint/plugins-dev";

/**
 * A rule as Oxlint's plugin API types it.
 */
type Rule = Parameters<RuleTester["run"]>[1];

/**
 * A rule written as a `create` function over its context.
 */
type CreateRule = Extract<Rule, { create: unknown }>;

/**
 * The context Oxlint hands a rule's `create`: the linted file, its options and its reports.
 */
type Context = Parameters<CreateRule["create"]>[0];

/**
 * The visitor a rule's `create` returns.
 */
type Visitor = ReturnType<CreateRule["create"]>;

/**
 * Any node of a parsed file.
 */
type AnyNode = Extract<
  Context["sourceCode"]["ast"]["body"][number],
  { type: "ExpressionStatement" }
>["parent"];

/**
 * The node of one type.
 */
type NodeOf<T extends AnyNode["type"]> = Extract<AnyNode, { type: T }>;

/**
 * The rule's options: the files that pass the author's QTI class through to the markup, each by
 * its path relative to qti-pie's root, decoded once where the rule is created.
 */
const Options = Schema.Struct({ passthrough: Schema.Array(Schema.String) });

/**
 * Decode the options Oxlint was configured with, none for options of another shape.
 */
const decodeOptions = Schema.decodeUnknownOption(Options);

/**
 * The diagnostic for a class plate writes outside the author's passthrough.
 */
const classMessage = [
  "plate's UI writes no class of its own: its look is the opt-in plate/src/styles/*.css, keyed on data-slot and data-* states.",
  "A class it writes is the author's QTI class, passed through at a site the rule's passthrough option lists.",
].join(" ");

/**
 * The diagnostic for a style plate writes.
 */
const styleMessage =
  "plate's UI writes no style: a part's look lives in plate/src/styles/*.css, keyed on data-slot and data-* states.";

/**
 * The diagnostic for a stylesheet plate's UI imports.
 */
const cssMessage =
  "plate's UI imports no stylesheet: a host imports @qti-pie/plate/styles/base.css and theme.css, or its own theme, itself.";

/**
 * Tell whether a name carries classes: `className`, `class`, or a component's `*ClassName` slot.
 *
 * @param name A JSX attribute's or an object key's name.
 * @returns Whether it carries classes.
 */
const isClassName = (name: string): boolean =>
  name === "className" || name === "class" || name.endsWith("ClassName");

/**
 * Read an object property's key as written, by an identifier or a string literal.
 *
 * @param property A property of an object literal.
 * @returns Its key's text, or `undefined` for a computed key.
 */
const keyOf = (property: NodeOf<"Property">): string | undefined => {
  if (property.computed) {
    return undefined;
  }

  if (property.key.type === "Identifier") {
    return property.key.name;
  }

  return property.key.type === "Literal" && Predicate.isString(property.key.value)
    ? property.key.value
    : undefined;
};

/**
 * Read the name a member expression reads, where it is written as a name.
 *
 * @param member A member expression.
 * @returns The property's name, or `undefined` for a computed one.
 */
const memberNameOf = (member: NodeOf<"MemberExpression">): string | undefined =>
  !member.computed && member.property.type === "Identifier" ? member.property.name : undefined;

/**
 * Tell whether a module specifier names a stylesheet.
 *
 * @param source A string literal or anything else a module's source is written as.
 * @returns Whether it is a `.css` specifier.
 */
const isStylesheet = (source: AnyNode | null): boolean =>
  source?.type === "Literal" && Predicate.isString(source.value) && source.value.endsWith(".css");

/**
 * Refuses a look written in plate's UI, on the files Oxlint's configuration runs it on: no class
 * (a JSX `className`, `class` or `*ClassName`, an object literal's key of those names, which a
 * spread writes as an attribute, a `.className` assignment or `.classList`), no style (a JSX
 * `style`, an object literal's `style`, a `.style` read or write) and no stylesheet import. Its
 * look is the separate imports `plate/src/styles/base.css` and `theme.css`, which a host chooses,
 * so a part names itself by `data-slot` and its state by `data-*`, and a new look replaces the
 * stylesheet alone. The one class plate writes is the author's QTI class, passed through at the
 * sites the `passthrough` option lists; a style or stylesheet has no such site.
 */
const classesLiveInStyles = {
  /**
   * @param context Oxlint rule context for the linted file, its options and its reports.
   * @returns Visitor that refuses the file's classes, styles and stylesheet imports.
   */
  create(context: Context): Visitor {
    const options = decodeOptions(context.options[0]);

    if (Option.isNone(options)) {
      return {
        /**
         * @param node The file, which the malformed options keep from being linted.
         */
        Program(node) {
          context.report({
            message: `${context.id} takes one object option, { passthrough: string[] }, the files that pass the author's class through.`,
            node,
          });
        },
      };
    }

    const passes = options.value.passthrough.some(
      (path) => context.filename === path || context.filename.endsWith(`/${path}`),
    );

    /**
     * @param node A class plate writes.
     */
    const reportClass = (node: AnyNode): void => {
      if (!passes) {
        context.report({ message: classMessage, node });
      }
    };

    /**
     * @param node A style plate writes.
     */
    const reportStyle = (node: AnyNode): void => {
      context.report({ message: styleMessage, node });
    };

    /**
     * @param node A stylesheet plate's UI imports.
     */
    const reportStylesheet = (node: AnyNode): void => {
      context.report({ message: cssMessage, node });
    };

    return {
      /**
       * @param node An assignment, a `.className` one among them.
       */
      AssignmentExpression(node) {
        if (node.left.type === "MemberExpression" && memberNameOf(node.left) === "className") {
          reportClass(node);
        }
      },
      /**
       * @param node An export that may re-export a stylesheet.
       */
      ExportAllDeclaration(node) {
        if (isStylesheet(node.source)) {
          reportStylesheet(node);
        }
      },
      /**
       * @param node An export that may re-export from a stylesheet.
       */
      ExportNamedDeclaration(node) {
        if (isStylesheet(node.source)) {
          reportStylesheet(node);
        }
      },
      /**
       * @param node An import, a stylesheet's among them.
       */
      ImportDeclaration(node) {
        if (isStylesheet(node.source)) {
          reportStylesheet(node);
        }
      },
      /**
       * @param node A dynamic import, a stylesheet's among them.
       */
      ImportExpression(node) {
        if (isStylesheet(node.source)) {
          reportStylesheet(node);
        }
      },
      /**
       * @param node A JSX attribute, a class or a style among them.
       */
      JSXAttribute(node) {
        if (node.name.type !== "JSXIdentifier") {
          return;
        }

        if (node.name.name === "style") {
          reportStyle(node);
        } else if (isClassName(node.name.name)) {
          reportClass(node);
        }
      },
      /**
       * @param node A member read or written: `.style`, `.classList`.
       */
      MemberExpression(node) {
        const name = memberNameOf(node);

        if (name === "style") {
          reportStyle(node);
        } else if (name === "classList") {
          reportClass(node);
        }
      },
      /**
       * @param node An object literal's property, which a spread writes as an attribute, or a
       *   pattern's, which only reads.
       */
      Property(node) {
        if (node.parent.type !== "ObjectExpression") {
          return;
        }

        const key = keyOf(node);

        if (key === "style") {
          reportStyle(node);
        } else if (key !== undefined && isClassName(key)) {
          reportClass(node);
        }
      },
    };
  },
  meta: {
    docs: {
      description:
        "Disallow classes, styles and stylesheet imports in plate's UI but the author's class at its passthrough sites, so plate's look is its separate stylesheets.",
    },
    schema: [{ type: "object" }],
    type: "problem",
  },
} satisfies CreateRule;

export default classesLiveInStyles;
