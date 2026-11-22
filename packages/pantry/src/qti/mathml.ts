/**
 * The MathML laws (spec reading 2, MathML 3 validity), composed from the three families that store
 * rows: cn (the form of a number's content), align (action selection and alignment groups) and
 * share (the `share` cycle). The apply laws, "MathML arity" and "MathML head qualifier", read the
 * tree alone, so they are rules over queries and store nothing
 * (`#pantry/qti/overlay-queries/expression.ts`).
 *
 * {@link mathmlRelations} and {@link mathmlLaws} are `#pantry/qti/schema.ts`'s MathML members: the
 * three families' relations and laws, spread in that order; {@link mathmlLawsByName} names each law.
 */
import { alignLaws, alignRelations } from "#pantry/qti/mathml-align.ts";
import { cnCountLaws, cnLaws, cnRelations } from "#pantry/qti/mathml-cn.ts";
import { shareLaws, shareRelations, shareResolution } from "#pantry/qti/mathml-share.ts";
import { declared } from "#pantry/qti/law-entries.ts";

/**
 * The relations of the three MathML families, in one list, in the order cn, align, share.
 */
export const mathmlRelations = [...cnRelations, ...alignRelations, ...shareRelations] as const;

/**
 * The statements of the three MathML families, in the order cn, align, share, before
 * {@link mathmlLawsByName} gives each its law's entry.
 */
const mathmlStatements = [...cnLaws, ...alignLaws, ...shareLaws];

/**
 * The checks of {@link mathmlStatements} that one name names.
 *
 * @param name - The check's name.
 * @returns Those checks.
 */
const checksNamed = (name: string) =>
  mathmlStatements.filter((statement) => statement.kind === "check" && statement.name === name);

/**
 * Whether a statement is one {@link mathmlLawsByName} names apart from the restatements: a cn part
 * count containment or the share resolution.
 *
 * @param statement - A statement of {@link mathmlStatements}.
 * @returns Whether it is.
 */
const namedApart = (statement: (typeof mathmlStatements)[number]): boolean =>
  statement === shareResolution || Object.values(cnCountLaws).some((count) => count === statement);

/**
 * {@link mathmlStatements} by the law each states, the law's name its key, as every other module
 * names its laws where it states them (`namedLaws`, `#pantry/test/law-namer.ts`), each check in the
 * group of its own name:
 *
 * - **Idref target:** a share's resolution ({@link shareResolution}): a share of a document in no
 *   assembly has its target, which one whose id names nothing breaks beside that law's own
 *   statement over its id, so it is refused under that law alone (decision 428);
 * - **MathML cn form:** a `cn`'s four part count containments, over the judged `cn`s and over every
 *   typed `cn` ({@link cnCountLaws}): a wrong part count is a `cn` of the wrong form;
 * - **E1 derived:** every other statement of the three families, a restatement of the tree, the align
 *   family's keys of one `selection` per `m:maction` and one `dir` per element among them (decision
 *   426: uniqueness of derived rows, not a document's identity).
 */
export const mathmlLawsByName = {
  "E1 derived": declared(
    "E1 derived",
    mathmlStatements.filter((statement) =>
      statement.kind === "check" ? statement.name === "E1_derived" : !namedApart(statement),
    ),
  ),
  "Idref target": declared("Idref target", [shareResolution]),
  "MathML cn form": declared("MathML cn form", [
    ...Object.values(cnCountLaws),
    ...checksNamed("MathML_cn_form"),
  ]),
};

/**
 * The laws of the three MathML families, each with its entry: {@link mathmlLawsByName}'s groups,
 * then each check a group of its own name holds apart, which grizzle names by its own name.
 */
export const mathmlLaws = [
  ...Object.values(mathmlLawsByName).flat(),
  ...mathmlStatements.filter(
    (statement) =>
      statement.kind === "check" &&
      statement.name !== "E1_derived" &&
      statement.name !== "MathML_cn_form",
  ),
];
