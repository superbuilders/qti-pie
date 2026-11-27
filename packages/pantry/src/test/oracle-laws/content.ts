/**
 * The producers of the law oracle's laws over content references (lane OL): a feedback element's
 * outcome, a template element's or a choice's template variable, a printed variable's variable and
 * integers, and a portable custom interaction's context variable, each resolved among the
 * declarations of the document that holds the reference's scope, as the schema resolves them
 * (`ContentReference`, `#pantry/qti/interactions.ts`; `#pantry/qti/overlay-queries/reference.ts`).
 *
 * A reference's scope is the assembly root whose declarations it names (spec readings
 * `fragment-placement` and `spliced-fragment`):
 *
 * - An item's or a test's own references, a fragment it splices among them, resolve in its own
 *   declarations (`referringRoots`, `#pantry/vocab/terms/interactions.ts`): a test's feedback names
 *   "an outcome variable" (information model §5.157.2), and a printed variable in its rubric "The
 *   outcome variable or template variable [that] must have been defined" (§7.30.6);
 * - A document a test places whole, a section document a section ref places or a fragment a section
 *   includes, resolves once for each test that places it, in that test's declarations
 *   ({@link contentPackageBreaches});
 * - Every other document's references resolve nowhere, and no law reads them.
 *
 * The laws: `Feedback reference`, `Template reference`, `Printed variable reference` and `Context
 * variable reference`, a reference names a declaration of a kind its attribute may name, or a
 * built-in of its scope's root that stands as one; `Feedback outcome type` and `Template variable
 * type`, the variable it names is single or multiple, of base type identifier (§5.49.1, reading
 * `feedback-and-printed-variable-names`, decision 432); and `Printed variable type`, a printed
 * variable's `base` or `index` that names a variable names a single integer one (§9.3.3).
 */
import { regex } from "arkregex";
import { Option } from "effect";
import type { ComposedGrammar } from "#pantry/grammar/compose.ts";
import {
  assembledDocumentsOf,
  inRootCopy,
  testKinds,
  testsOf,
} from "#pantry/test/oracle-laws/assembly.ts";
import { ncNameForm } from "#pantry/test/oracle-laws/typed.ts";
import {
  breachAt,
  collapsed,
  contentLawOf,
  typedValueOf,
  valueOf,
} from "#pantry/test/oracle-view.ts";
import type { LawBreach, PackageRows, Row, View } from "#pantry/test/oracle-view.ts";

/**
 * The laws this module produces.
 */
export const contentLaws = [
  "Context variable reference",
  "Feedback reference",
  "Printed variable reference",
  "Template reference",
  "Feedback outcome type",
  "Template variable type",
  "Printed variable type",
] as const;

/**
 * A law of {@link contentLaws}.
 */
type ContentLaw = (typeof contentLaws)[number];

/**
 * A breach of one of this module's laws.
 */
type Breach = LawBreach<ContentLaw>;

/**
 * The declarations a document's content references resolve in: its scope's root's declarations by
 * identifier, the document that holds them, and the root's kind, whose built-in variables a
 * reference may name (`BuiltInVariable`, spec reading `duration-variable-type`).
 */
export interface ContentScope {
  readonly declared: ReadonlyMap<string, readonly Row[]>;
  readonly rootKind: string;
  readonly view: View;
}

/**
 * The root kinds whose references resolve in their own declarations: an item's and a test's.
 */
const referringRoots: ReadonlySet<string> = new Set([testKinds.item, testKinds.test]);

/**
 * A braced variable reference: `{identifier}`.
 */
const braced = regex("^\\{(?<identifier>[^{}]+)\\}$", "u");

/**
 * Read the variable a reference attribute's value names, by the reference's spelling: a bare
 * reference's collapsed value when it is an NCName, a braced reference's identifier between the
 * braces. Any other value is a literal and names nothing.
 *
 * @param form - The attribute's lexical form.
 * @param spelling - How its element's kind spells the attribute's references.
 * @returns The name, none for a literal.
 */
const referenced = (form: string, spelling: string): Option.Option<string> =>
  spelling === "braced"
    ? Option.fromNullishOr(braced.exec(form)?.groups.identifier)
    : Option.liftPredicate(collapsed(form), (value) => ncNameForm.test(value));

/**
 * The scope of a document whose references resolve in its own declarations, an item's or a
 * test's: its declarations by their identifier as their type reads it.
 *
 * @param rows - The document, with every fragment it splices.
 * @param grammar - The composed grammar, whose declaration kinds it reads.
 * @returns Its scope, none for a document of any other root.
 */
export const ownScopeOf = (rows: View, grammar: ComposedGrammar): Option.Option<ContentScope> =>
  rows.root.pipe(
    Option.filter(({ kind }) => referringRoots.has(kind)),
    Option.map(({ kind }) => {
      const declared = new Map<string, Row[]>();
      for (const node of rows.members) {
        if (grammar.references.declarationKind.has(node.kind)) {
          for (const identifier of Option.toArray(typedValueOf(rows, node.start, "identifier"))) {
            declared.set(identifier, [...(declared.get(identifier) ?? []), node]);
          }
        }
      }

      return { declared, rootKind: kind, view: rows };
    }),
  );

/**
 * One content reference a node makes: the attribute, the name it spells, and the declaration kinds
 * it may name (`ContentReference`).
 */
interface Reference {
  readonly attribute: string;
  readonly identifier: string;
  readonly targets: ReadonlySet<string>;
}

/**
 * Read the content references a node makes: each attribute its kind reads as a variable reference
 * (`VariableReference`) that `ContentReference` gives the declaration kinds it may name.
 *
 * @param rows - The node's document.
 * @param node - The node.
 * @param grammar - The composed grammar.
 * @returns Its references.
 */
const referencesOf = (rows: View, node: Row, grammar: ComposedGrammar): readonly Reference[] =>
  grammar.references.variableReference.rows
    .filter(({ kind }) => kind === node.kind)
    .flatMap(({ attribute, spelling }) => {
      const targets = new Set(
        grammar.references.contentReference.rows
          .filter((row) => row.kind === node.kind && row.attribute === attribute)
          .map(({ declaration }) => declaration),
      );

      return targets.size === 0
        ? []
        : Option.toArray(
            Option.flatMap(valueOf(rows, node.start, attribute), (form) =>
              referenced(form, spelling),
            ),
          ).map((identifier) => ({ attribute, identifier, targets }));
    });

/**
 * The declaration of one of some kinds a scope's root declares under a name.
 *
 * @param scope - The scope.
 * @param identifier - The name.
 * @param kinds - The declaration kinds.
 * @returns The first such declaration, none where the root declares none.
 */
const declarationOf = (
  scope: ContentScope,
  identifier: string,
  kinds: ReadonlySet<string>,
): Option.Option<Row> =>
  Option.fromNullishOr((scope.declared.get(identifier) ?? []).find(({ kind }) => kinds.has(kind)));

/**
 * Hold a declared variable to a single or multiple identifier, where each half spells something
 * (spec readings `unspelled-declaration` and `binding-by-name`): the keys of the breach it is, none
 * where it holds.
 *
 * @param scope - The scope that declares it.
 * @param declaration - The declaration.
 * @returns The breach's keys.
 */
const identifierTypeBreach = (
  scope: ContentScope,
  declaration: Row,
): Option.Option<Readonly<Record<string, string>>> => {
  const cardinality = typedValueOf(scope.view, declaration.start, "cardinality");
  const baseType = typedValueOf(scope.view, declaration.start, "base-type");

  return Option.exists(cardinality, (held) => held !== "single" && held !== "multiple") ||
    Option.exists(baseType, (held) => held !== "identifier")
    ? Option.some({
        ...Option.match(baseType, { onNone: () => ({}), onSome: (held) => ({ baseType: held }) }),
        ...Option.match(cardinality, {
          onNone: () => ({}),
          onSome: (held) => ({ cardinality: held }),
        }),
      })
    : Option.none();
};

/**
 * The outcome declaration kind a feedback names.
 */
const outcomes: ReadonlySet<string> = new Set(["qti-outcome-declaration"]);

/**
 * The template declaration kind a template reference names.
 */
const templates: ReadonlySet<string> = new Set(["qti-template-declaration"]);

/**
 * The declaration kinds a printed variable's integer may name: an outcome's or a template's.
 */
const printable: ReadonlySet<string> = new Set([...outcomes, ...templates]);

/**
 * Judge one node's content references within a scope.
 *
 * - An `outcome-identifier` names, by §5.49.1, "an outcome variable that must have a base-type of
 *   identifier and be of either single or multiple cardinality", a built-in by the type its name
 *   has (reading `feedback-and-printed-variable-names`).
 * - A `template-identifier` names a single or multiple identifier (decision 432), but on a portable
 *   custom interaction's `qti-template-variable`, which states no type.
 * - A printed variable's `base` and `index` are, by §9.3.3, "attributes of integer type that may be
 *   replaced with the value of a template or outcome variable of base type integer and single
 *   cardinality", each half where it spells something (spec readings `unspelled-declaration` and
 *   `binding-by-name`).
 *
 * @param rows - The node's document.
 * @param node - The node.
 * @param scope - The scope its references resolve in.
 * @param grammar - The composed grammar.
 * @returns The breaches.
 */
const nodeBreachesOf = (
  rows: View,
  node: Row,
  scope: ContentScope,
  grammar: ComposedGrammar,
): readonly Breach[] => {
  const builtIns = new Map(
    grammar.references.builtIn.rows
      .filter(({ root }) => root === scope.rootKind)
      .map((row) => [row.variable, row] as const),
  );
  const builtInBases = new Map(
    grammar.references.builtInBaseType.rows
      .filter(({ root }) => root === scope.rootKind)
      .map(({ baseType, variable }) => [variable, baseType] as const),
  );

  return referencesOf(rows, node, grammar).flatMap(
    ({ attribute, identifier, targets }): readonly Breach[] => {
      const declared = declarationOf(scope, identifier, targets);
      const builtIn = Option.fromNullishOr(builtIns.get(identifier));
      if (
        Option.isNone(declared) &&
        !Option.exists(builtIn, ({ declaration }) => targets.has(declaration))
      ) {
        return Option.toArray(contentLawOf(node.kind, attribute)).map((law) =>
          breachAt(rows, node, law, { attribute, identifier }),
        );
      }

      if (attribute === "outcome-identifier") {
        return Option.match(declarationOf(scope, identifier, outcomes), {
          onNone: () =>
            Option.exists(
              builtIn,
              ({ declaration }) => declaration === "qti-outcome-declaration",
            ) &&
            !(
              builtInBases.get(identifier) === "identifier" &&
              Option.exists(
                builtIn,
                ({ cardinality }) => cardinality === "single" || cardinality === "multiple",
              )
            )
              ? [
                  breachAt(rows, node, "Feedback outcome type", {
                    ...Option.match(Option.fromNullishOr(builtInBases.get(identifier)), {
                      onNone: () => ({}),
                      onSome: (held) => ({ baseType: held }),
                    }),
                    cardinality: Option.match(builtIn, {
                      onNone: () => "",
                      onSome: ({ cardinality }) => cardinality,
                    }),
                    identifier,
                  }),
                ]
              : [],
          onSome: (outcome) =>
            Option.toArray(identifierTypeBreach(scope, outcome)).map((keys) =>
              breachAt(rows, node, "Feedback outcome type", { ...keys, identifier }),
            ),
        });
      }

      if (attribute === "template-identifier" && node.kind !== "qti-template-variable") {
        return Option.toArray(declarationOf(scope, identifier, templates)).flatMap((template) =>
          Option.toArray(identifierTypeBreach(scope, template)).map((keys) =>
            breachAt(rows, node, "Template variable type", { ...keys, identifier }),
          ),
        );
      }

      if (node.kind === "qti-printed-variable" && (attribute === "base" || attribute === "index")) {
        return Option.toArray(declarationOf(scope, identifier, printable)).flatMap(
          (declaration) => {
            const types = [
              ...Option.toArray(typedValueOf(scope.view, declaration.start, "cardinality")).filter(
                (held) => held !== "single",
              ),
              ...Option.toArray(typedValueOf(scope.view, declaration.start, "base-type")).filter(
                (held) => held !== "integer",
              ),
            ];

            return types.length > 0
              ? [
                  breachAt(rows, node, "Printed variable type", {
                    attribute,
                    identifier,
                    type: types.join(" "),
                  }),
                ]
              : [];
          },
        );
      }

      return [];
    },
  );
};

/**
 * Judge every content reference of a document within a scope.
 *
 * @param rows - The document.
 * @param scope - The scope its references resolve in.
 * @param grammar - The composed grammar.
 * @returns The breaches.
 */
const scopedBreachesOf = (
  rows: View,
  scope: ContentScope,
  grammar: ComposedGrammar,
): readonly Breach[] => rows.members.flatMap((node) => nodeBreachesOf(rows, node, scope, grammar));

/**
 * Judge one folded document's own content references: an item's or a test's, in its own
 * declarations, a fragment it splices among them; none for a document of any other root.
 *
 * @param rows - The document, merged with what it splices.
 * @param grammar - The composed grammar.
 * @returns The breaches.
 */
export const contentDocumentBreaches = (rows: View, grammar: ComposedGrammar): readonly Breach[] =>
  Option.match(ownScopeOf(rows, grammar), {
    onNone: () => [],
    onSome: (scope) => scopedBreachesOf(rows, scope, grammar),
  });

/**
 * Judge the content references of every document a test places whole, once per test, in the test's
 * own declarations (spec reading `spliced-fragment`): each instance of its assembly whose document
 * is no item or test and lies outside the test's own merged document, judged over the document's
 * own rows, each fragment it splices an instance of its own.
 *
 * @param input - The package.
 * @param grammar - The composed grammar.
 * @returns The breaches, each once.
 */
export const contentPackageBreaches = (
  input: PackageRows,
  grammar: ComposedGrammar,
): readonly Breach[] => {
  const breaches = testsOf(input, assembledDocumentsOf(input, grammar)).flatMap(
    ({ instances, test }) =>
      Option.match(ownScopeOf(test.listed.rows, grammar), {
        onNone: () => [],
        onSome: (scope) =>
          instances
            .filter(
              (instance) =>
                !referringRoots.has(instance.document.rootKind) && !inRootCopy(instances, instance),
            )
            .flatMap(({ document }) => scopedBreachesOf(document.listed.rows, scope, grammar)),
      }),
  );

  return [...new Map(breaches.map((held) => [JSON.stringify(held), held] as const)).values()];
};
