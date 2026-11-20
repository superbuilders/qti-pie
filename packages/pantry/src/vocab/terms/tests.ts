/**
 * The terms of banks and their assembly that the schema (`#pantry/qti/tests.ts`) and the importer
 * (`#pantry/import/overlays/tests.ts` and its siblings) both read: the kinds of a test's structure,
 * which roots assemble, which include parents splice, and the resource types an item ref names.
 * Each is a function of the grammar's rosters alone, so loading this module builds no relation of
 * the schema.
 */
import type { Kind, Name } from "#pantry/grammar/compose.ts";
import { includeKind as include } from "#pantry/grammar/include.ts";
import { includeParentKinds, ResourceType } from "#pantry/grammar/install.ts";

/**
 * The test's root kind, which no package holds ("Test structure").
 */
export const testKind = "qti-assessment-test" satisfies Kind;

/**
 * The item's root kind, the root of an assembly whose instances place their bindings (spec reading
 * 117).
 */
export const itemKind = "qti-assessment-item" satisfies Kind;

/**
 * The section's kind: a bank's root, and no other element ("Bank shape", "Test structure").
 */
export const sectionKind = "qti-assessment-section" satisfies Kind;

/**
 * The test part's kind, which no package holds ("Test structure").
 */
export const partKind = "qti-test-part" satisfies Kind;

/**
 * The item ref's kind: a bank's member, under its root ("Bank shape").
 */
export const itemRefKind = "qti-assessment-item-ref" satisfies Kind;

/**
 * The section ref's kind, which no package holds ("Test structure", "Bank shape").
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
 * The root kinds whose documents are in an assembly whether or not they hold a site: a bank's, a
 * section document, whose own chain of inclusions reading 85 refuses as the oracle does, over every
 * listed document. Each keeps its names (`TestDocument`); which documents head an assembly is
 * {@link splicingParents}'s.
 */
export const assembledRoots = [sectionKind] as const satisfies readonly Kind[];

/**
 * The include parents whose include splices its fragment in place, the one statement of which
 * documents head an assembly: a document heads its own unless an include under one of these places
 * it and may stand for its root (`IncludeRoot`, `Inclusion.splices`), since an included fragment is
 * judged in place, as its merged document holds it, and not alone (spec reading 117). An include
 * that may not stand for its target's root places no fragment there: "Include root" refuses it, and
 * the document it names is judged as its own. Every parent the information model gives an Include
 * is one but a section, whose include stands for an item ref, a section or a section ref alone
 * (`IncludeRoot`), which "Bank shape" refuses in a bank.
 *
 * The schema's heads (the query `HeadDocument`, `#pantry/qti/queries.ts`) and the import's
 * (`#pantry/import/overlays/tests.ts` `assembledRowsOf`) read this list and `IncludeRoot`, through
 * `Inclusion.splices`, and nothing else of them decides a head. The law oracle, the second
 * implementation, states its own from the grammar (`#pantry/test/oracle.ts` `splicingParentsOf` and
 * `standsFor`), and `splicing-parents.oracle.test.ts` holds the two lists equal.
 */
export const splicingParents = includeParentKinds.filter((kind) => kind !== sectionKind);

/**
 * The kinds whose identifiers name a bank and its members: a bank's root section and its item refs.
 */
export const namedKinds = [sectionKind, itemRefKind] as const satisfies readonly Kind[];

/**
 * The resource type of a bank, a standalone section document (the placement mandate, ruling 2): the
 * one type whose documents hold a section or an item ref ("Test structure").
 */
export const bankResourceType =
  "imsqti_section_xmlv3p0" satisfies (typeof ResourceType.handles)[number];

/**
 * The kinds a test's structure is made of, which no document but a bank holds ("Test structure"):
 * a test and its parts, and a section, a section ref and an item ref outside a bank.
 */
export const testStructureKinds = [
  testKind,
  partKind,
  sectionKind,
  sectionRefKind,
  itemRefKind,
] as const satisfies readonly Kind[];

/**
 * The attributes of an item ref that only a test's delivery reads, which a bank's item ref writes
 * none of ("Bank shape"): `required` and `fixed`, read by a parent's selection and ordering, and
 * `category`, read by a test's outcome processing (information model §5.6).
 */
export const bankUnreadAttributes = [
  "required",
  "fixed",
  "category",
] as const satisfies readonly Name[];

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
  ResourceType.handles.filter((type) => /^ims(?:basic)?ltia?_xmlv/u.test(type));
