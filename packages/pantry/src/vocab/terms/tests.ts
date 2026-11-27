/**
 * The terms of tests, sections, banks and their assembly that the schema (`#pantry/qti/tests.ts`,
 * `#pantry/qti/overlay-queries/tests.ts`) and the importer (`#pantry/import/overlays/tests.ts` and
 * its siblings) both read: the kinds of a test's structure, which roots assemble, which include
 * parents splice, the resource types an item ref names, and the reserved branch targets. Each is a
 * function of the grammar's rosters alone, so loading this module builds no relation of the
 * schema.
 */
import { regex } from "arkregex";
import type { Kind } from "#pantry/grammar/compose.ts";
import { includeKind as include } from "#pantry/grammar/include.ts";
import { grammar, includeParentKinds, NodeKind, ResourceType } from "#pantry/grammar/install.ts";

/**
 * The test's root kind: a test document's root, the head of its own assembly (information model
 * §4.4, AssessmentTest).
 */
export const testKind = "qti-assessment-test" satisfies Kind;

/**
 * The item's root kind, the root of an assembly whose instances place their bindings (spec reading
 * `fragment-placement`).
 */
export const itemKind = "qti-assessment-item" satisfies Kind;

/**
 * The section's kind: a section document's root, a bank's among them, and every section a test
 * part or a section holds.
 */
export const sectionKind = "qti-assessment-section" satisfies Kind;

/**
 * The test part's kind, which only a test holds.
 */
export const partKind = "qti-test-part" satisfies Kind;

/**
 * The item ref's kind: a bank's member, under its root, or a test's, under a section.
 */
export const itemRefKind = "qti-assessment-item-ref" satisfies Kind;

/**
 * The section ref's kind: a site that places its section document in its test's assembly, and a
 * name (information model §7.5).
 */
export const sectionRefKind = "qti-assessment-section-ref" satisfies Kind;

/**
 * XInclude's include (`#pantry/grammar/include.ts`), a production kind: a site (information model
 * §2.12).
 */
export const includeKind = include satisfies Kind;

/**
 * An item's reference to a shared stimulus (information model §7.6).
 */
export const stimulusRefKind = "qti-assessment-stimulus-ref" satisfies Kind;

/**
 * A section's selection (information model §5.129).
 */
export const selectionKind = "qti-selection" satisfies Kind;

/**
 * A section's adaptive selection (information model §4.2.13, the IMS CAT sequencing engine).
 */
export const adaptiveSelectionKind = "qti-adaptive-selection" satisfies Kind;

/**
 * A section's ordering (information model §5.98).
 */
export const orderingKind = "qti-ordering" satisfies Kind;

/**
 * A branch rule (information model §5.23).
 */
export const branchRuleKind = "qti-branch-rule" satisfies Kind;

/**
 * An item ref's variable mapping (information model §7.48).
 */
export const mappingKind = "qti-variable-mapping" satisfies Kind;

/**
 * An item ref's weight (information model §7.50).
 */
export const weightKind = "qti-weight" satisfies Kind;

/**
 * An item ref's template default (information model §5.152).
 */
export const templateDefaultKind = "qti-template-default" satisfies Kind;

/**
 * A scope's time limits (information model §7.40): a test's, a test part's, a section's or an item
 * ref's.
 */
export const timeLimitsKind = "qti-time-limits" satisfies Kind;

/**
 * A scope's item session control (information model §7.19): a test part's, a section's or an item
 * ref's.
 */
export const sessionControlKind = "qti-item-session-control" satisfies Kind;

/**
 * The root kinds whose documents are in an assembly whether or not they hold a site: a test, and a
 * section document, whose own chain of inclusions reading `inclusion-cycles` refuses as the oracle
 * does, over every listed document. Each keeps its names (`AssembledDocument`); which documents
 * head an assembly is {@link splicingParents}'s.
 */
export const assembledRoots = [testKind, sectionKind] as const satisfies readonly Kind[];

/**
 * The include parents whose include splices its fragment in place, the one statement of which
 * documents head an assembly: a document heads its own unless an include under one of these places
 * it and may stand for its root (`IncludeRoot`, `Inclusion.splices`), since an included fragment is
 * judged in place, as its merged document holds it, and not alone (spec reading
 * `fragment-placement`). An include that may not stand for its target's root places no fragment
 * there, and the document it names is judged as its own: "Include root" refuses it, unless its root
 * is the name of a kind the composition splits by context whose split kind it may stand for (spec
 * reading `fragment-root`), admitted and placed nowhere. Every parent the information model gives
 * an Include is one but a section, whose include stands for an item ref, a section or a section ref
 * alone (`IncludeRoot`) and places its fragment whole, as a section ref places its section document
 * (reading `fragment-placement`: "Reading `test-identifier-namespace`'s rule that a section
 * document a test places twice is written once is the information model's for section documents in
 * a test's assembly ... and includes in a section follow it").
 *
 * The schema's heads (the query `HeadDocument`, `#pantry/qti/queries.ts`) and the import's
 * (`#pantry/import/overlays/tests.ts` `assembledRowsOf`) read this list and `IncludeRoot`, through
 * `Inclusion.splices`, and nothing else of them decides a head. The law oracle, the second
 * implementation, states its own from the grammar (`#pantry/test/oracle.ts` `splicingParentsOf` and
 * `standsFor`).
 */
export const splicingParents = includeParentKinds.filter((kind) => kind !== sectionKind);

/**
 * The kinds whose identifiers are one namespace across an assembled test (reading
 * `test-identifier-namespace`): a test part, a section, a section ref and an item ref (information
 * model §4.2.1: "The identifier of the section or item reference must be unique within the test and
 * must not be the identifier of any testPart"; §5.159.1; §7.5.3: "each reference must have a unique
 * identifier").
 */
export const namedKinds = [
  partKind,
  sectionKind,
  sectionRefKind,
  itemRefKind,
] as const satisfies readonly Kind[];

/**
 * The kinds a section holds as its parts (`SectionPart`, information model §4.2.15): an item ref, a
 * section, a section ref, or an include standing in for one. Reading
 * `selection-without-replacement` counts each once.
 */
export const sectionParts: readonly Kind[] = NodeKind.handles.filter((kind) =>
  grammar.references.sectionPart.rows.some((row) => row.kind === kind),
);

/**
 * The reserved targets every branch rule may name (information model §5.23.1: "The following values
 * are reserved and have special meaning when used as a target identifier: EXIT_SECTION ...;
 * EXIT_TESTPART ... and EXIT_TEST").
 */
export const exits = ["EXIT_SECTION", "EXIT_TESTPART", "EXIT_TEST"] as const;

/**
 * The resource type of a standalone section document (the content-packaging profile's
 * `imsqti_section_xmlv3p0`), a bank's among them.
 */
export const bankResourceType =
  "imsqti_section_xmlv3p0" satisfies (typeof ResourceType.handles)[number];

/**
 * The resource type of an item document.
 */
export const itemResourceType =
  "imsqti_item_xmlv3p0" satisfies (typeof ResourceType.handles)[number];

/**
 * The resource types of an LTI link, the other target an item ref may name (the UP audit's B3,
 * R36; the implementation guide's §6.2.9, informative): the LTI types of the `ResourceType`
 * roster.
 */
export const linkResourceTypes: readonly (typeof ResourceType.handles)[number][] =
  ResourceType.handles.filter((type) => regex("^ims(?:basic)?ltia?_xmlv", "u").test(type));
