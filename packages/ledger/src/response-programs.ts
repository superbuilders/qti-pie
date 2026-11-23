/**
 * The program an item's response processing runs, by the item (COMPILE-AT-PUBLISH C2), at the
 * Delivery level over the ledger: what the SQL grader reads by the item's key, and what the items
 * served for credit are judged by (`#ledger/servable.ts`). Each is a function of the item's own
 * package's rows and the closed facts alone, so it is known once the package is published, and
 * stored (grizzle's `derived.stored`, kept at COMMIT at every package a transaction writes).
 *
 * - **ResponseProgram**: the document whose `qti-response-processing` subtree the item runs, by the
 *   item's document (`package`, `path`): the item's own (`source`, `document` the item) where its
 *   processing holds a rule (information model §4.6.1, "if both are given the internal rules are
 *   still preferred"), else the template document its `template-location` locates in its package
 *   (pantry's `LocatedTemplate`, §4.6.2). The grader reads the subtree's root at `source` and
 *   `document`.
 * - **TemplatedProgram**: the published template whose rules the item runs, by the item's document:
 *   its processing holds no rule of its own and its `template` names a published template (pantry's
 *   `TemplateProcessing`, the ledger's closed `PublishedTemplateUri`; spec reading 51), whose rules
 *   are the ledger's closed `TemplateNode`, `TemplateAttribute` and `TemplateText`. §4.6.2: "If a
 *   delivery system is able to determine the correct behaviour from the template identifier alone
 *   the template-location should be ignored."
 *
 * Pantry's views make the three cases disjoint: a processing that holds a rule is neither
 * `LocatedTemplate`'s nor `TemplateProcessing`'s (each needs one of no element), and
 * `LocatedTemplate` holds no processing whose `template` names a published template. So an item is
 * at most one row of the two relations, and one with none runs no rules (its outcomes keep their
 * defaults) or names a processing the grader cannot obtain (`UnresolvedProcessing`).
 */
import { derived, query, v } from "@bjornpagen/grizzle";
import type { LedgerLevel } from "#ledger/delivery.ts";

/**
 * The response processing element (information model §4.6, ResponseProcessing).
 */
const processingKind = "qti-response-processing";

/**
 * The items whose processing names a published template and holds no rule of its own, with the
 * template: `TemplatedProgram`'s rows, the plain query, which `#ledger/servable.ts` reads too.
 *
 * @param ledger - The ledger level.
 * @returns The query.
 */
export const templatedProgramsOf = (ledger: LedgerLevel) => {
  const { PublishedTemplateUri, TemplateProcessing } = ledger.relations;

  return query(ledger).rule((r) => {
    const { package: pkg, path, value } = v(TemplateProcessing, "processing");
    const { template } = v(PublishedTemplateUri, "named");

    return r
      .match(TemplateProcessing, { package: pkg, path, value })
      .match(PublishedTemplateUri, { template, uri: value })
      .find({ package: pkg, path, template });
  });
};

/**
 * The Delivery level's relations of the program an item's response processing runs.
 *
 * @param ledger - The ledger level the delivery level extends.
 * @returns The relations the delivery level spreads.
 */
export const responseProgramsOf = (ledger: LedgerLevel) => {
  const { LocatedTemplate, Node } = ledger.relations;

  const ResponseProgram = derived.stored(
    "ResponseProgram",
    query(ledger)
      .rule((r) => {
        const { package: pkg, path, elementChildren } = v(Node, "processing");

        return r
          .match(Node, {
            elementChildren,
            kind: processingKind,
            package: pkg,
            parentKind: "qti-assessment-item",
            path,
          })
          .where(r.gt(elementChildren, 0n))
          .find({ document: path, package: pkg, path, source: pkg });
      })
      .rule((r) => {
        const { package: pkg, path, template } = v(LocatedTemplate, "located");

        return r
          .match(LocatedTemplate, { package: pkg, path, template })
          .find({ document: template, package: pkg, path, source: pkg });
      }),
  );

  const TemplatedProgram = derived.stored("TemplatedProgram", templatedProgramsOf(ledger));

  return { relations: [ResponseProgram, TemplatedProgram] } as const;
};
