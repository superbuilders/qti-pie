/**
 * Which items this deployment serves for credit: the delivery level's verdict, where what the
 * grader runs meets what the registry admits and what the package holds. Every relation here is
 * derived and stores nothing, and pantry admits every valid item: an item outside the verdict is
 * stored as written and never served, which the one law here holds ("Served for credit": every item
 * session is of a servable item).
 *
 * QTI 3.0 Conformance and Certification §3: "All QTI 3.0 certified applications must be able to
 * operate without failure when features beyond the minimum required features are included in the
 * content ... While certified applications don't need to support, or even store the 'extra'
 * features/data, the applications must be able to ignore or remove the unsupported data"; §4.4:
 * "Applications that do not support specific features can leave the exchangeable materials
 * unaltered, but not implement the unsupported features". So an item whose response processing
 * holds a part the grader does not run is never served for credit: neither refused at admission
 * (valid QTI 3.0.1 is never refused) nor scored with that part evaluated as NULL or left out, which
 * would report outcomes the item's rules never compute (SPEC-AUDIT SV-APP-05).
 *
 * An item is {@link servableOf}'s `Servable` where no document of its assembly holds a row of:
 *
 * - `UnresolvedProcessing`: a response processing that holds no rule of its own and writes a
 *   `template` or a `template-location` that names no processing the grader runs;
 * - `UnpackagedStimulus`: a stimulus ref whose href names no stimulus of the item's package;
 * - `UnassertableOutcome`: an outcome declared `external-scored` whose cardinality is not `single`,
 *   whose score no assertion of the ledger can hold;
 * - The registry's `OutsideProfile`: an element outside this deployment's profile, among them every
 *   custom operator no registered class defines and every portable custom interaction no registered
 *   module implements.
 *
 * Every pattern the grader reads runs (SPEC-AUDIT SV-PATTERN-01, fixed in the grader: an Appendix F
 * matcher with no bound, true or false for every pattern pantry's grammar admits), so no pattern
 * makes an item unservable.
 */
import { contained, derived, on, query, v } from "@bjornpagen/grizzle";
import { externallyScoredOf } from "#ledger/assertion-views.ts";
import type { LedgerLevel } from "#ledger/delivery.ts";
import { named } from "#ledger/laws.ts";

/**
 * An item's document's root: `qti-assessment-item` (information model §4.1, AssessmentItem).
 */
const itemRoot = "qti-assessment-item";

/**
 * The response processing element (information model §4.6, ResponseProcessing).
 */
const processingKind = "qti-response-processing";

/**
 * The relations of the delivery level that state which items are served for credit, and the queries
 * they are made of, which the level's own rules and statements match inline (a derived relation
 * reads only the levels below its own).
 *
 * @param ledger - The ledger level the delivery level extends.
 * @returns The relations and laws the delivery level spreads, and the queries `servableItems` and
 *   `unservableItems`.
 */
export const servableOf = (ledger: LedgerLevel) => {
  const {
    Attribute,
    Document,
    Instance,
    ItemSession,
    LocatedTemplate,
    Node,
    OutsideProfile,
    PublishedTemplateDocument,
    PublishedTemplateUri,
    Reference,
    TemplateProcessing,
  } = ledger.relations;
  const externallyScored = externallyScoredOf(ledger);

  /**
   * Every document of each item's assembly, by the item's document (`item`) and the document
   * (`path`): the item's own, the template document its response processing locates (pantry's
   * `LocatedTemplate`, whose rules run as the item's), and each document an include of the item
   * places in it (pantry's `Instance`, an assembly named by its head document's path; information
   * model §2.12 and spec reading 117: an included fragment is judged in place, as its merged
   * document holds it). What any of them holds is the item's.
   */
  const itemDocuments = query(ledger)
    .rule((r) => {
      const { package: pkg, path } = v(Document, "item");

      return r
        .match(Document, { package: pkg, path, rootKind: itemRoot })
        .find({ item: path, package: pkg, path });
    })
    .rule((r) => {
      const { package: pkg, path: item } = v(Document, "item");
      const { document } = v(Instance, "placed");

      return r
        .match(Document, { package: pkg, path: item, rootKind: itemRoot })
        .match(Instance, { assembly: item, document, package: pkg })
        .find({ item, package: pkg, path: document });
    })
    .rule((r) => {
      const { package: pkg, path: item } = v(Document, "item");
      const { template } = v(LocatedTemplate, "located");

      return r
        .match(Document, { package: pkg, path: item, rootKind: itemRoot })
        .match(LocatedTemplate, { package: pkg, path: item, template })
        .find({ item, package: pkg, path: template });
    });

  /**
   * The item documents whose response processing names a published template whose rules the grader
   * runs: pantry's `TemplateProcessing` (a `qti-response-processing` child of the item that holds
   * no element), whose `template` is a spelling of a published template (the ledger's
   * `PublishedTemplateUri`, its rows pantry's `urisOf`; spec reading 51), where that template's
   * document is stored (`PublishedTemplateDocument`: the reference package `qti-rptemplates`,
   * published as any package is), its root the template's `qti-response-processing`. It is the
   * resolution the SQL grader reads a published template's rules by, so an item is served exactly
   * where the grader holds the rules it runs.
   */
  const publishedProcessings = query(ledger).rule((r) => {
    const { package: pkg, path, value } = v(TemplateProcessing, "processing");
    const { template } = v(PublishedTemplateUri, "named");
    const { package: source, path: document } = v(PublishedTemplateDocument, "published");

    return r
      .match(TemplateProcessing, { package: pkg, path, value })
      .match(PublishedTemplateUri, { template, uri: value })
      .match(PublishedTemplateDocument, { package: source, path: document, template })
      .match(Node, {
        kind: processingKind,
        package: source,
        parentKind: "document",
        path: document,
      })
      .find({ package: pkg, path });
  });

  /**
   * Each response processing of an item that holds no rule of its own and writes `attribute`, where
   * its document is no {@link publishedProcessings}' and locates no template (pantry's
   * `LocatedTemplate`): by the item, its place and its document.
   *
   * @param attribute - The attribute that names the processing it takes from elsewhere.
   * @returns The query.
   */
  const unresolvedBy = (attribute: "template" | "template-location") =>
    query(ledger).rule((r) => {
      const { item, package: pkg, path } = v(itemDocuments, "document");
      const { start } = v(Node, "processing");

      return r
        .match(itemDocuments, { item, package: pkg, path })
        .match(Node, { elementChildren: 0n, kind: processingKind, package: pkg, path, start })
        .match(Attribute, { kind: processingKind, name: attribute, package: pkg, path, start })
        .where(
          r.not(publishedProcessings, { package: pkg, path }),
          r.not(LocatedTemplate, { package: pkg, path }),
        )
        .find({ item, package: pkg, path, start });
    });

  /**
   * Each response processing of an item whose rules the grader cannot obtain, by the item, its
   * document and its place: it holds no rule of its own, writes a `template` that names no
   * published template or a `template-location` with no `template` that does, and locates no
   * template document of its package.
   *
   * Information model §4.6.1, Table 4.6.1 (`template`): "If a template identifier is given it may
   * be used to locate an externally defined responseProcessing template. The rules obtained from
   * the external template may be used instead of the rules defined within the item itself, though
   * if both are given the internal rules are still preferred." So a processing that holds a rule
   * runs its rules, whatever it names, and one that holds none and names nothing runs nothing, its
   * outcomes keeping their defaults: both are the item's rules exactly, and the grader runs them.
   *
   * §4.6.2, Table 4.6.2 (`template-location`): it "can be used to obtain a copy of the response
   * processing template. If a delivery system is able to determine the correct behaviour from the
   * template identifier alone the template-location should be ignored." So a published template is
   * run from its stored document, whatever location is written beside it. Otherwise a location the
   * package resolves to a template document (pantry's `LocatedTemplate`: a Document of root
   * `qti-response-processing`) gives the rules the grader runs as the item's own, which pantry
   * types and judges in the item's own placement (`placedDocuments`: a variable "that has been
   * declared", §6.9.40; reading 233). A location outside the package, or to no template document,
   * gives none: it is stored as written and never fetched (reading 35).
   */
  const unresolvedProcessings = query(ledger)
    .rule((r) => {
      const { item, package: pkg, path, start } = v(unresolvedBy("template"), "named");

      return r
        .match(unresolvedBy("template"), { item, package: pkg, path, start })
        .find({ item, package: pkg, path, start });
    })
    .rule((r) => {
      const { item, package: pkg, path, start } = v(unresolvedBy("template-location"), "located");

      return r
        .match(unresolvedBy("template-location"), { item, package: pkg, path, start })
        .find({ item, package: pkg, path, start });
    });

  /**
   * Each stimulus ref of an item whose href names no stimulus of its package, by the item, its
   * document and its place: its `href`'s `Reference` row is not scoped `entry`, so it resolves
   * outside the package (`external`) or to the item's own document (`document`, an empty or
   * fragment-only href). An entry-scoped one names a stimulus document of the package by pantry's
   * law "Stimulus ref target".
   *
   * Information model Table 4.1.15 (`qti-assessment-stimulus-ref`): "Each identifier must resolve
   * to some AssessmentStimulus object that has been associated with the Item"; Table 7.6
   * (AssessmentStimulusRef): "The stimulus must be contained within its own instance", and Table
   * 7.6.2 (`href`): "The uri used to refer to the stimulus file (e.g. elsewhere in the same content
   * package)". Such an item is valid QTI pantry admits and stores (spec reading 35: an external
   * reference is stored as written and never fetched), and the delivery would present it without
   * its passage, so it is not served (IMPL-STIMULUS's clause, SPEC-AUDIT J1).
   */
  const unpackagedStimuli = query(ledger).rule((r) => {
    const { item, package: pkg, path } = v(itemDocuments, "document");
    const { scope, start } = v(Reference, "href");

    return r
      .match(itemDocuments, { item, package: pkg, path })
      .match(Reference, {
        kind: "qti-assessment-stimulus-ref",
        name: "href",
        package: pkg,
        path,
        scope,
        start,
      })
      .where(r.ne(scope, "entry"))
      .find({ item, package: pkg, path, start });
  });

  /**
   * Each outcome of an item declared `external-scored` whose cardinality is not `single`, by the
   * item, its document and the outcome's identifier (IMPL-ASSERT's `externallyScoredOf`, the one
   * reading of which outcomes are scored externally).
   *
   * Information model Table 4.5.10 (`external-scored`): "This identifies whether or not the value
   * for this outcome is produced by human or by machine scoring", with no condition on the
   * outcome's cardinality, so pantry admits it on an outcome of any cardinality (SPEC-AUDIT J1,
   * SV-ASSERT-01). The ledger's assertions hold one single value of each of the eleven base types
   * (`AssertedSingle<BaseType>`), so a score of any other cardinality has no assertion to arrive
   * in, and such an item is not served for credit: neither refused nor left waiting for a score
   * nobody can record.
   */
  const unassertableOutcomes = query(ledger).rule((r) => {
    const { item, package: pkg, path } = v(itemDocuments, "document");
    const { cardinality, identifier } = v(externallyScored, "outcome");

    return r
      .match(itemDocuments, { item, package: pkg, path })
      .match(externallyScored, { cardinality, identifier, package: pkg, path })
      .where(r.ne(cardinality, "single"))
      .find({ identifier, item, package: pkg, path });
  });

  /**
   * Each item that holds a reason it is not served for credit, by its document: an element of its
   * assembly that is {@link unresolvedProcessings}', {@link unpackagedStimuli}',
   * {@link unassertableOutcomes}' or the registry's `OutsideProfile`'s.
   */
  const unservableItems = query(ledger)
    .rule((r) => {
      const { item, package: pkg } = v(unresolvedProcessings, "processing");

      return r
        .match(unresolvedProcessings, { item, package: pkg })
        .find({ package: pkg, path: item });
    })
    .rule((r) => {
      const { item, package: pkg } = v(unpackagedStimuli, "stimulus");

      return r.match(unpackagedStimuli, { item, package: pkg }).find({ package: pkg, path: item });
    })
    .rule((r) => {
      const { item, package: pkg } = v(unassertableOutcomes, "outcome");

      return r
        .match(unassertableOutcomes, { item, package: pkg })
        .find({ package: pkg, path: item });
    })
    .rule((r) => {
      const { item, package: pkg, path } = v(itemDocuments, "document");

      return r
        .match(itemDocuments, { item, package: pkg, path })
        .match(OutsideProfile, { package: pkg, path })
        .find({ package: pkg, path: item });
    });

  /**
   * The items served for credit, by their document: every item document of no
   * {@link unservableItems} row.
   */
  const servableItems = query(ledger).rule((r) => {
    const { package: pkg, path } = v(Document, "item");

    return r
      .match(Document, { package: pkg, path, rootKind: itemRoot })
      .where(r.not(unservableItems, { package: pkg, path }))
      .find({ package: pkg, path });
  });

  /**
   * Each response processing the grader cannot obtain the rules of ({@link unresolvedProcessings}),
   * by its place.
   */
  const UnresolvedProcessing = derived(
    "UnresolvedProcessing",
    query(ledger).rule((r) => {
      const { package: pkg, path, start } = v(unresolvedProcessings, "processing");

      return r
        .match(unresolvedProcessings, { package: pkg, path, start })
        .find({ package: pkg, path, start });
    }),
  );

  /**
   * Each stimulus ref that names no stimulus of its item's package ({@link unpackagedStimuli}), by
   * its place.
   */
  const UnpackagedStimulus = derived(
    "UnpackagedStimulus",
    query(ledger).rule((r) => {
      const { package: pkg, path, start } = v(unpackagedStimuli, "stimulus");

      return r
        .match(unpackagedStimuli, { package: pkg, path, start })
        .find({ package: pkg, path, start });
    }),
  );

  /**
   * Each external-scored outcome no assertion can hold ({@link unassertableOutcomes}), by its
   * declaration's name.
   */
  const UnassertableOutcome = derived(
    "UnassertableOutcome",
    query(ledger).rule((r) => {
      const { identifier, package: pkg, path } = v(unassertableOutcomes, "outcome");

      return r
        .match(unassertableOutcomes, { identifier, package: pkg, path })
        .find({ identifier, package: pkg, path });
    }),
  );

  /**
   * The items served for credit ({@link servableItems}), by their document: what the delivery
   * serves and grades.
   */
  const Servable = derived("Servable", servableItems);

  /**
   * Served for credit: every item session is of an item served for credit, so an item outside the
   * verdict (an unresolved processing, an unpackaged stimulus, an unassertable outcome or an
   * element outside the profile) is stored as written and never served (Conformance §3, this
   * module's header), and a session start on it, of any program, a take or a test member's take
   * alike, is refused naming this law. An item whose response processing names a published template
   * the database does not hold has no rules to run (information model §4.6.1), so a session of it
   * would keep every outcome at its default, SCORE 0, with no rule run; it opens once the
   * template's document is stored.
   */
  const servedForCredit = named(
    "Served for credit",
    contained(on(ItemSession, "package", "path"), on(Servable, "package", "path")),
  );

  return {
    laws: [servedForCredit],
    relations: [UnresolvedProcessing, UnpackagedStimulus, UnassertableOutcome, Servable],
    servableItems,
    unservableItems,
  } as const;
};
