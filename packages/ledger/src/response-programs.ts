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
 *   still preferred"); else the published template its `template` names (pantry's
 *   `TemplateProcessing`, the ledger's closed `PublishedTemplateUri`; spec reading 51), whose
 *   document is the reference package's (the closed `PublishedTemplateDocument`), §4.6.2: "If a
 *   delivery system is able to determine the correct behaviour from the template identifier alone
 *   the template-location should be ignored"; else the template document its `template-location`
 *   locates in its package (pantry's `LocatedTemplate`, §4.6.2). The grader reads the subtree's
 *   root at `source` and `document`, and its walk there (`#ledger/walks.ts`), so a template
 *   document's walk is stored once, however many items run it.
 *
 * Pantry's views make the three cases disjoint: a processing that holds a rule is neither
 * `LocatedTemplate`'s nor `TemplateProcessing`'s (each needs one of no element), and
 * `LocatedTemplate` holds no processing whose `template` names a published template. So an item is
 * at most one row, and one with none runs no rules (its outcomes keep their defaults) or names a
 * processing the grader cannot obtain (`UnresolvedProcessing`). Each row is a function of the
 * item's own package's rows and the closed facts alone; "Template held", below, holds the document
 * it names to the store.
 */
import { contained, derived, on, query, v } from "@bjornpagen/grizzle";
import type { LedgerLevel } from "#ledger/delivery.ts";
import { named } from "#ledger/laws.ts";

/**
 * The response processing element (information model §4.6, ResponseProcessing).
 */
const processingKind = "qti-response-processing";

/**
 * The items whose processing names a published template and holds no rule of its own, with the
 * template's document (`source`, `document`): `ResponseProgram`'s templated rows, the plain query,
 * which `#ledger/servable.ts` reads too.
 *
 * @param ledger - The ledger level.
 * @returns The query.
 */
export const templatedProgramsOf = (ledger: LedgerLevel) => {
  const { PublishedTemplateDocument, PublishedTemplateUri, TemplateProcessing } = ledger.relations;

  return query(ledger).rule((r) => {
    const { package: pkg, path, value } = v(TemplateProcessing, "processing");
    const { template } = v(PublishedTemplateUri, "named");
    const { package: source, path: document } = v(PublishedTemplateDocument, "published");

    return r
      .match(TemplateProcessing, { package: pkg, path, value })
      .match(PublishedTemplateUri, { template, uri: value })
      .match(PublishedTemplateDocument, { package: source, path: document, template })
      .find({ document, package: pkg, path, source });
  });
};

/**
 * The Delivery level's relations of the program an item's response processing runs.
 *
 * @param ledger - The ledger level the delivery level extends.
 * @returns The relations the delivery level spreads.
 */
export const responseProgramsOf = (ledger: LedgerLevel) => {
  const { Document, LocatedTemplate, Node } = ledger.relations;

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
        const templated = templatedProgramsOf(ledger);
        const { document, package: pkg, path, source } = v(templated, "templated");

        return r
          .match(templated, { document, package: pkg, path, source })
          .find({ document, package: pkg, path, source });
      })
      .rule((r) => {
        const { package: pkg, path, template } = v(LocatedTemplate, "located");

        return r
          .match(LocatedTemplate, { package: pkg, path, template })
          .find({ document: template, package: pkg, path, source: pkg });
      }),
  );

  /**
   * Template held: every document an item's response processing runs is one the store holds. An
   * item's own processing and the template document its `template-location` locates are documents
   * of its own package, so only a published template can be missing: a package whose item names one
   * is refused while the reference package (`#ledger/template-package.ts`) is not published, and an
   * installation publishes it before any such item. Information model §4.6.1, Table 4.6.1
   * (`template`): "If a template identifier is given it may be used to locate an externally defined
   * responseProcessing template. The rules obtained from the external template may be used instead
   * of the rules defined within the item itself"; §4.6.2: "If a delivery system is able to
   * determine the correct behaviour from the template identifier alone the template-location should
   * be ignored". A `template` that spells a published template names that template's rules, which
   * this delivery system holds as its document in the store to process the response; without it the
   * item would keep every outcome at its default with no rule run.
   */
  const templateHeld = named(
    "Template held",
    contained(on(ResponseProgram, "source", "document"), on(Document, "package", "path")),
  );

  return { laws: [templateHeld], relations: [ResponseProgram] } as const;
};
