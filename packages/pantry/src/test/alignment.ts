import { XML_NAMESPACE } from "@qti-pie/crust/tree.ts";
/**
 * The spec-alignment census as code (slice A12): every XSD rule the pinned schemas state and every
 * spec reading, each joined to the composed grammar's relation that owns it, with its status.
 *
 * The XSD rules are read from the content-model and attribute IR (`#pantry/vocab/inventory/`),
 * which the deriver writes from the 23 pinned XSDs and whose own tests check a re-run reproduces
 * it byte for byte, so the census reads the schemas without reading the cache. Each rule is one
 * of:
 *
 * - `content:admission`, per kind: the children its model admits, element particles and what its
 *   wildcards read, against `Admission`'s children;
 * - `content:character`, per kind: whether character data may stand among its children, against
 *   `Admission`'s `text` child;
 * - `content:automaton`, per kind with element content: order, required particles, at-most-once and
 *   exclusive choice, which Bjorn's ruling of 2026-11-05 gives one owner, the Glushkov automaton
 *   (`Follow` and `Last`);
 * - `content:count`, per particle whose bound lies in 2…n: the count law `Counted`, which the
 *   automaton relaxes;
 * - `content:count-beyond`, per `Counted` row the XSD's particle does not state as a total: a
 *   reading's count ({@link readingCounts}), or a contradiction;
 * - `attribute:admission`, `attribute:type` and `attribute:required`, per declared (kind, name):
 *   `AttributeAdmission`'s row, its domain's enumeration against the XSD type's, and its use;
 * - `attribute:undeclared`, per admitted (kind, name) no declaration and no wildcard of the kind
 *   explains;
 * - `attribute:wildcard`, per kind whose attribute wildcard admits the XML namespace: `xml.xsd`'s
 *   four global attributes admitted, but on a kind the Schematron's extension rules cover, where
 *   spec reading 90 admits none the kind does not declare;
 * - `attribute:extension`, per kind the Schematron's extension rules cover: no name admitted but a
 *   declared one, `data-*`, an `xsi:` name and a reading's second spelling (spec readings 90 and
 *   10);
 * - `text:domain`, per simple-content kind: `TextDomain`'s row;
 * - `reading`, per spec reading of `docs/spec-readings.md`, with the status the alignment audit gives
 *   it after Bjorn's rulings.
 *
 * A status is `G` (the grammar states the rule), `reading` (it departs from the XSD by a recorded
 * spec reading), `R` (a ruled gap: reading 2's recorded MathML limits and reading 50), `P` (a named
 * slice owns it and nothing states it yet), `RG` (a representation gap Bjorn has not ruled),
 * `U` (nothing owns it: XSD-invalid content is accepted) or `X` (contradicted: the grammar refuses
 * XSD-valid content, or states a rule with no reading behind it). The value domains' lexical spaces
 * beyond their enumerations are `lexical.oracle.test.ts`'s, against `xmllint`.
 */
import { Option } from "effect";
import { readingRefusals, readingUses } from "#pantry/grammar/attributes.ts";
import type { Use, ValueDomain } from "#pantry/grammar/attributes.ts";
import { coveredBy } from "#pantry/grammar/compose.ts";
import type { ComposedGrammar } from "#pantry/grammar/compose.ts";
import { followPairsOf } from "#pantry/grammar/content.ts";
import { patternFlags } from "#pantry/grammar/domains.ts";
import { foreignKinds, isForeignKind, openClasses } from "#pantry/grammar/kinds.ts";
import { admittedOf, countBoundsOf } from "#pantry/test/indexes.ts";
import type { CountBounds } from "#pantry/test/indexes.ts";
import {
  attributeDeclarations,
  attributeWildcards,
  textTypes,
} from "#pantry/vocab/inventory/attributes.ts";
import { contentModels } from "#pantry/vocab/inventory/models.ts";
import type {
  AttributeDeclaration,
  ContentModel,
  Domain,
  NamespaceConstraint,
  Particle,
} from "#pantry/vocab/inventory/types.ts";
import { globalKinds } from "#pantry/vocab/inventory/vocabularies.ts";
import { namespaceClassesUnder, vocabularyNamespaces } from "#pantry/vocab/namespaces.ts";

/**
 * A rule's status, as the alignment audit's §2 defines it.
 */
export type Status = "G" | "P" | "R" | "RG" | "U" | "X" | "meta" | "reading";

/**
 * The statuses, in the order the census reports them.
 */
export const statuses = [
  "G",
  "reading",
  "R",
  "P",
  "RG",
  "U",
  "X",
  "meta",
] as const satisfies readonly Status[];

/**
 * One rule of the census: its family, the parent kind it holds in, what it is about, its owner,
 * its status and what the grammar states of it.
 */
export interface Rule {
  readonly detail: string;
  readonly family: string;
  readonly owner: string;
  readonly parent: string;
  readonly status: Status;
  readonly subject: string;
}

/**
 * A spec reading's entry: its status after Bjorn's rulings of 2026-11-05 and the slice or
 * relation that owns it, from the alignment audit's Matrix B (§7).
 */
interface ReadingEntry {
  readonly owner: string;
  readonly status: Status;
}

/**
 * Every spec reading's status and owner. Reading 14 is restated to follow the XSD (the text-entry
 * references are IDREFs), so the Idref family owns it; D4 is closed by the Glushkov ruling, so the
 * ruled gaps are reading 2's recorded MathML limits (reading 91) and reading 50; reading 60,
 * restated, checks a simple `xsi:type`'s text and leaves a complex one reading 50's. Readings 51 to
 * 55, 58, 59, 65, 68 and 69 bind plate, which delivers, scores and reports; pantry's part is to
 * store the values they read as written, which the codec does.
 */
export const readings: ReadonlyMap<number, ReadingEntry> = new Map<number, ReadingEntry>([
  [1, { owner: "every law", status: "meta" }],
  [
    2,
    {
      owner:
        "the automaton's restated models (`m:bvar`, `m:piecewise`, the `interval` qualifier's eight, `m:annotation-xml`, `m:lambda`'s ending), `m:semantics.contexp` beside `m:ci`, MathML's root (`roots`), the `math` ancestry flag, the notation domains (`mathmlNotationReadings`, `number` among them, `cnBaseReadings` for `m:cn`'s `base`, and `mathmlXrefReading` for `xref`), the `m:mstack` restatement and the `m:mlongdiv` ending, the restated `qualified` and `bind` models, the arity rows of `selector` and `partialdiff`, the MathML arity law and the laws `MathML head qualifier`, `MathML cn form`, `MathML maction selection`, `MathML align placement`, `MathML align first` and `MathML share cycle`; the MathML empty-content whitespace (`src/grammar/content.ts` `characterData`); the MathML foreign element law (QS); the Recommendation's other prose rules, the five recorded limits the reading lists and the known limits of its checks (reading 91)",
      status: "R",
    },
  ],
  [
    3,
    {
      owner:
        "identity.ts's SSML overlay (`SsmlScope`; `SsmlValue` of names.ts, each read attribute's `value` the lexical form collapsed, in its scope's fragment; `TrimmedMark`, `ssmlTrimMark`, `ssmlLexiconReference`); the oracle's SSML lexicon reference and SSML trim mark, names compared collapsed",
      status: "G",
    },
  ],
  [
    4,
    {
      owner:
        "`TestReading`'s rules over every placed reference of a test, its pre-conditions, branch rules, template defaults and outcome processing alike, the importer's `NumberedReading` among them (`src/qti/overlay-queries/readings.ts`, `src/import/overlays/readings.ts`); the oracle's readings (`src/test/oracle-laws/readings.ts`)",
      status: "G",
    },
  ],
  [
    5,
    {
      owner:
        "`testInstances`: a section document's references and `section-identifier`s placed once per test that places it (`PlacedTestReference`, `PlacedFilter`, `src/qti/overlay-queries/readings.ts` and `src/qti/overlay-queries/tests.ts`); the oracle's readings and \"Section identifier target\" (`src/test/oracle-laws/readings.ts`, `src/test/oracle-laws/tests.ts`)",
      status: "G",
    },
  ],
  [6, { owner: "N5 admission (`open.ts` `foreignRoots`), shred", status: "G" }],
  [
    7,
    {
      owner:
        "Q5.08's `Typed_value`, a typed value in element text read through its base type's domain with whitespace collapsed and a string's kept (`domainValues`, `src/qti/expression-types.ts`; `src/qti/mapping.ts`); the string-typed typed-value attributes exact (`specReadings`' `on(7, …, \"exact\")` rows for `map-key`, an interpolation entry's `target-value` and the two tables' `default-value`, `src/grammar/attributes.ts`), and the `xs:double` ones (`mapped-value`, the mappings' `lower-bound`, `upper-bound` and `default-value`, `source-value`, the `ud:` four) read collapsed, as the XSD reads them; plate refuses padding on the same string-typed attributes (`#plate/validate/structure.ts`) and reads the `xs:double` ones trimmed (`#plate/model/item.ts`, `#plate/model/attributes.ts`)",
      status: "G",
    },
  ],
  [8, { owner: "Q5.11 O5", status: "P" }],
  [
    9,
    {
      owner:
        "the Schematron the ASI XSDs embed, each rule to its law (docs/research/unowned-readings.md §9), its extension-attribute lists to reading 90's AL1 rows, and `RULE_SET_ARIA_ROLES_1` to AL1 (`headingRole`, `h1`'s `role` heading, tab or presentation; `readingRefusals`, no `role` on `source`, `src/grammar/attributes.ts`); mastery-range, string-identifier-distinct and reading 23 in W5",
      status: "P",
    },
  ],
  [
    10,
    {
      owner:
        "AL1: `aria-keyshorts` alone on the 11 kinds the information model's ARIABaseEmpty (§7.1.44), the XSD and the Schematron name it on, so ARIA's `aria-keyshortcuts` there is refused; every other kind declares `aria-keyshortcuts` alone (attributes.ts readDeclarations, no second spelling)",
      status: "G",
    },
  ],
  [11, { owner: "codec", status: "G" }],
  [12, { owner: "admission, TextDomain", status: "G" }],
  [
    13,
    {
      owner: "the codec's `data-name` and the laws AL4 data name and AL4 declared data name",
      status: "G",
    },
  ],
  [14, { owner: "the Idref family, contained in DocumentId (Q5.05)", status: "G" }],
  [15, { owner: "the Idref family, contained in DocumentId (Q5.05)", status: "X" }],
  [16, { owner: "AL1 (`positiveDouble`)", status: "G" }],
  [17, { owner: "AL1 (`viewList`)", status: "G" }],
  [
    18,
    {
      owner:
        "AL1 (`min-choices` at least 1); Choice bounds over ChoiceBound's `counted` zero and ChoiceCount (references.ts), pinned by `src/grammar/references.test.ts`, which holds each order interaction's `ChoiceBound` zero to `counted` (p15-3: a `max-choices` of 0 stays refused)",
      status: "G",
    },
  ],
  [19, { owner: "Q5.09 O3", status: "P" }],
  [20, { owner: "N5 / N7 (the XSD's `once`)", status: "G" }],
  [21, { owner: "O4 arity", status: "G" }],
  [22, { owner: "N5 (admission omits it)", status: "G" }],
  [23, { owner: "Q5.10 O4 (an ancestry flag)", status: "P" }],
  [24, { owner: "N5", status: "G" }],
  [
    25,
    {
      owner:
        "the ancestry facet's `test` flag, which a test's rubric block and test feedback enter and under which no interaction and no template sits (`asi`, `src/grammar/facets.ts`; `interactionBans`, `src/grammar/ancestry.ts`), under the ancestry laws, and a printed variable there resolves in the test's declarations (`referringRoots`, `src/vocab/terms/interactions.ts`); the oracle's ancestry laws read the composed grammar's, and its content references are `src/test/oracle-laws/content.ts`'s",
      status: "G",
    },
  ],
  [
    26,
    {
      owner:
        "the XSD's own section model, unedited, and no law: a section holds any number of parts, none included (§4.2.15)",
      status: "G",
    },
  ],
  [27, { owner: "AL1", status: "G" }],
  [28, { owner: "Q5.10 O4 (D5)", status: "P" }],
  [
    29,
    {
      owner:
        "the installed `BuiltInVariable` (`src/grammar/install.ts`, re-keyed (root, variable) by PG), read by `VariableRef`'s `E1_derived` and PE's `Reading` (`src/qti/expressions.ts`)",
      status: "G",
    },
  ],
  [30, { owner: "N5, shred", status: "G" }],
  [31, { owner: "the automaton (the XSD's card and card-entry models as written)", status: "G" }],
  [32, { owner: "N5", status: "G" }],
  [33, { owner: "P1 to P3 (Q5.06)", status: "G" }],
  [34, { owner: "Q5.08 O2", status: "P" }],
  [35, { owner: "AL1", status: "G" }],
  [36, { owner: "P3 adds no key (Q5.06)", status: "G" }],
  [37, { owner: "AL1", status: "G" }],
  [38, { owner: "N6", status: "G" }],
  [39, { owner: "AL1 (`version.datatype`, reading 39)", status: "G" }],
  [40, { owner: "the automaton", status: "G" }],
  [
    41,
    {
      owner: "AL5 attribute count (`AL5_attribute_count`, `#pantry/qti/attributes.ts`)",
      status: "G",
    },
  ],
  [42, { owner: "AL1 (`languages.datatype`, reading 42)", status: "G" }],
  [
    43,
    {
      owner: "AL5 attribute count (`AL5_attribute_count`, `#pantry/qti/attributes.ts`)",
      status: "G",
    },
  ],
  [
    44,
    {
      owner:
        "the restated `tokenType` of `ssml:token` and `ssml:w` (`facets.ts` `tokenEdits`); a `voice` there names no kind its parent admits, which the codec refuses (`unmodeled-vocabulary`)",
      status: "G",
    },
  ],
  [
    45,
    {
      owner: "G5, Q5.08; a value a key holds is held to reading 133's key-text bound",
      status: "P",
    },
  ],
  [46, { owner: "G5's derived `int8`", status: "P" }],
  [
    47,
    {
      owner:
        "`xsi:nil` admitted only on the foreign kinds (A6); XsiType derived (Q11's `XsiType`); the governing type's attributes and text under reading 84 (Governor, GovernedAttribute, TypeText)",
      status: "P",
    },
  ],
  [
    48,
    {
      owner:
        '"Prefixed reference", the key over `TestReading`, and "Variable declared" over `PlacedTestReference` into it (`src/qti/overlay-queries/readings.ts`); the oracle\'s readings (`src/test/oracle-laws/readings.ts`)',
      status: "G",
    },
  ],
  [49, { owner: "N5", status: "G" }],
  [50, { owner: "a ruled limit (decision 227)", status: "R" }],
  [51, { owner: "plate runs the templates; pantry records the name, as written", status: "G" }],
  [52, { owner: "plate scores; pantry stores the mapping as written", status: "G" }],
  [53, { owner: "plate delivers; pantry stores `max-strings` as written", status: "G" }],
  [54, { owner: "plate checks responses; pantry stores `pattern-mask` as written", status: "G" }],
  [55, { owner: "plate checks responses; pantry stores `pattern-mask` as written", status: "G" }],
  [
    56,
    {
      owner:
        "G5's typed `xs:double` values (Q5.08): `Type.cast` over `doubleForm` for `Mastery_range` (`src/qti/declarations.ts`) and for an interaction's bounds (`src/qti/interactions.ts`), and the query `MapKeyFloat`'s `value` (`src/qti/queries.ts`), each rounding the decimal once as XML Schema's mapping does; the stated limit: a float map key outside grizzle's `double precision` form (`floatKeyPattern`) has no typed value and is distinct by its spelling (the float map key row of `docs/grizzle-findings.md`)",
      status: "G",
    },
  ],
  [57, { owner: "the W5 overlays over every node the walk checks (Q5.09)", status: "P" }],
  [
    58,
    {
      owner:
        "the law `Pattern language` over `PatternText` (`src/qti/overlay-queries/interaction.ts`), grizzle's `Xml.isPattern`; the oracle's `writtenPatternOf` read by grizzle-text's `xsdPattern` (`src/test/oracle.ts`), held by `Pattern language` in `src/test/laws.oracle.test.ts` and its mutation in `src/test/oracle-complete/packages.ts`",
      status: "G",
    },
  ],
  [59, { owner: "plate scores; pantry stores `coords` as written", status: "G" }],
  [
    60,
    {
      owner:
        "the foreign governor laws: shred's foreign governs (type-unresolved, strict-undeclared), Governor's four xsi: names, TypeText under TextDomain, and Foreign simple content (node.ts `Foreign_simple_content`, C41)",
      status: "P",
    },
  ],
  [
    61,
    {
      owner:
        "`qti-ordering`'s restated model, `sequence(any ##any lax 0..n)` (`orderingModel`, `src/grammar/facets.ts`), under the content laws; the oracle reads the composed grammar's model",
      status: "G",
    },
  ],
  [
    62,
    {
      owner:
        "LomObjectIdentifier, LomObjectTitle, over the resource's own records, each a `lom:lom` of its `cp:metadata` (`namingRecords`, `src/qti/queries.ts`); the oracle's lom-identifier and lom-title over the same records, held by the cases `src/test/lom-records.ts` builds, a file's record naming another",
      status: "G",
    },
  ],
  [
    63,
    {
      owner: "withdrawn: plate's test-delivery engine is deleted",
      status: "meta",
    },
  ],
  [
    64,
    {
      owner: "withdrawn: plate's test-delivery engine is deleted",
      status: "meta",
    },
  ],
  [
    65,
    {
      owner: "plate shows section rubric; pantry stores `qti-rubric-block` as written",
      status: "G",
    },
  ],
  [
    66,
    {
      owner: "withdrawn: plate's test-delivery engine is deleted",
      status: "meta",
    },
  ],
  [
    67,
    {
      owner:
        "TextDomain over `cp:schemaversion`'s text, the 3.0.1 XSD's enumeration of the one value `3.0.1` (`text-copy`); the value domain of `cp:resource`'s `type`, the 3.0.1 XSD's enumeration (`attribute-lexical`), and E1_derived over `ResourceTypeLexical` (`src/qti/package.ts`); the 3.0.1 `cp:resource` model (`cpx:variant` 0..0)",
      status: "G",
    },
  ],
  [
    68,
    {
      owner:
        "plate writes results reports; pantry writes none, and reads a duration value as `xs:double` (`expression-types.ts` `domainValues`)",
      status: "G",
    },
  ],
  [69, { owner: "plate writes results reports; pantry neither writes nor reads one", status: "G" }],
  [
    70,
    {
      owner: "withdrawn: plate's test-delivery engine is deleted",
      status: "meta",
    },
  ],
  [
    71,
    {
      owner: "the anyURI domain's pattern, RFC 2396 with RFC 2732 (Q3's builtinDomainOf, Q9)",
      status: "G",
    },
  ],
  [72, { owner: "Variable declared (P8)", status: "G" }],
  [73, { owner: "the derived unsigned domains", status: "G" }],
  [74, { owner: "Declaration key", status: "G" }],
  [75, { owner: "Binding declared", status: "G" }],
  [76, { owner: "Choice bounds (references.ts ChoiceBound)", status: "G" }],
  [
    77,
    { owner: "Feedback reference, Feedback outcome type, Printed variable reference", status: "G" },
  ],
  [78, { owner: "MappableBaseType", status: "G" }],
  [
    79,
    {
      owner:
        '"Selection bound": `SelectionWithoutReplacement` into `BoundedSelection`, each part counted once (`src/qti/overlay-queries/tests.ts`); the oracle\'s `selectionLawsOf` (`src/test/oracle-laws/tests.ts`)',
      status: "G",
    },
  ],
  [
    80,
    {
      owner:
        "default hotspot last slot (`qti-hotspot-choice` only), Graphic gap match default hotspot",
      status: "G",
    },
  ],
  [
    81,
    {
      owner:
        "Admission under a wildcard by the document's schema set (`open.wildcardReads`), `StrictlyHeld` and shred's `strict-undeclared`, over the stored rows Strictly held (node.ts, C44) and XsiType available (chardata.ts, C15 and C36); the admissions of LOM's and the foreign kinds are its stated limit",
      status: "G",
    },
  ],
  [
    82,
    {
      owner:
        "the value domain of `cp:resource`'s `type` and RootOfType (facets.ts `package.roots`): `imsqti_resprocessing_xmlv3p0` admitted, the guide's spelling refused",
      status: "G",
    },
  ],
  [
    83,
    {
      owner:
        "shred's `type-unresolved` over `xsi:type` values (B2) and `prefix-unbound` over every other value of a QName domain, an attribute's and an element's text through one check (`resolvesIn`; `Qualified`, src/grammar/domains.ts; guard src/model/qname-scope.test.ts); element and attribute name prefixes held by crust's reader (`WellFormednessError`, Namespaces in XML 1.0 §5 Prefix Declared), with no law over the stored rows",
      status: "G",
    },
  ],
  [
    84,
    {
      owner: "Q5.05's AttributeGrammar keyed by the governing type; Q5.03's `Node.governor`",
      status: "P",
    },
  ],
  [
    85,
    {
      owner:
        "AL1 (`xi:include` `parse` is `xml` and `xpointer` refused, attributes.ts); the oracle's Inclusion cycle over a package; Q5.13's `Instance` tree, item-level includes among it",
      status: "P",
    },
  ],
  [
    86,
    {
      owner:
        '"Test name key", the key over `AssembledName`, a section document placed twice naming once, and "Structure identifier" over `Named` (`src/qti/overlay-queries/tests.ts`, `src/qti/tests.ts`); the oracle\'s `assemblyLawsOf` and `documentLawsOf` (`src/test/oracle-laws/tests.ts`)',
      status: "G",
    },
  ],
  [
    87,
    {
      owner:
        '"Branch target" (`BranchResolution` into `ResolvedBranchRule`) and "Branch forward" (`TargetedBranchRule` into `ForwardBranchRule`), per placement (`src/qti/overlay-queries/tests.ts`); the oracle\'s `branchLawsOf` (`src/test/oracle-laws/tests.ts`)',
      status: "G",
    },
  ],
  [
    88,
    {
      owner:
        "the importer's `NumberedReading` (`src/import/overlays/readings.ts`), proved by \"E1 derived\" (`NumberedSpelling`, `AssembledReplaceable`, `NumberedTarget`) and read by `TestReading` (`src/qti/overlay-queries/readings.ts`); the oracle's readings (`src/test/oracle-laws/readings.ts`)",
      status: "G",
    },
  ],
  [
    89,
    {
      owner:
        "withdrawn: a root in a namespace no vocabulary is in is refused as any unknown name is (`unmodeled-vocabulary`, reason `unnamed`)",
      status: "meta",
    },
  ],
  [
    90,
    {
      owner:
        "AL1: the composition's `coveredBy` over the Schematron's extension rules (`src/vocab/inventory/extensions.ts`)",
      status: "G",
    },
  ],
  [91, { owner: "every reading's law, or its recorded limit", status: "meta" }],
  [
    92,
    {
      owner:
        "AL1 (a position object's `min-choices` at least 1); Context variable reference (ContentReference); the oracle's Binding cardinality and Binding unique, Q5.09",
      status: "P",
    },
  ],
  [
    93,
    {
      owner:
        "P2 and P3 over the queries `TypedHref` and `TypedPath` (`src/qti/queries.ts`): a document-typed resource's href resolves in the package and names the document at its entry path, and every document but the manifest is one a resource names; the importer reads documents through `namedDocuments` (`src/import/overlays/package.ts`)",
      status: "G",
    },
  ],
  [
    94,
    {
      owner:
        "AL1: `xs:NCName` and the types derived from it, over XML 1.0 Second Edition's name tables (`src/grammar/domains.ts`, read from the cached specification by `domains.test.ts`, judged against xmllint by `lexical.oracle.test.ts`, where libxml2 2.15.2's Fifth Edition names are its recorded departure, `fifthEditionNames` in `src/test/lexical-harness.ts`); the oracle's bare variable reference; a name a key holds is held to reading 133's key-text bound; an open attribute's local name to 890 bytes (`OpenLocal`) and a namespace prefix to 1,802",
      status: "G",
    },
  ],
  [
    95,
    {
      owner:
        "the `entityRef_arm` check of `src/qti/chardata.ts`: a node of kind `entityRef` holds `&`, an NCName and `;`",
      status: "G",
    },
  ],
  [
    96,
    {
      owner:
        "content:automaton: `Follow` and `Last` keep the XSD's sequence order after a repeated wildcard; `content.test.ts`'s xmllint differential sets libxml2's widened verdict aside by this reading, and its reading-96 test exhausts the two widened models",
      status: "G",
    },
  ],
  [
    97,
    {
      owner:
        '"Variable mapping target": `ItemMapping` into `FreeMappingTarget` (`src/qti/overlay-queries/tests.ts`); the oracle\'s `itemRefLawsOf` (`src/test/oracle-laws/tests.ts`)',
      status: "G",
    },
  ],
  [
    98,
    {
      owner:
        "Q5.11's map keys (`src/qti/mapping.ts`): one `MapKey` row per `qti-map-entry`, a view of its `map-key` attribute, under no law of its own, so a repeat, as written or as a typed value, is admitted (reading 98, F5); `Typed_attribute_value` judges each key's lexical form; how a response meets a key, case-folded unless its entry is `case-sensitive=\"true\"`, is the scorer's, read from the entry's `case-sensitive` attribute; the oracle's mapping law raises no repeat (`src/test/oracle.ts`); held by `src/qti/mapping.oracle.test.ts`, `src/qti/attribute-views.db.test.ts` and `src/test/restored.oracle.test.ts`",
      status: "G",
    },
  ],
  [
    99,
    {
      owner:
        "Q5.11's `AreaMapping_base_type` checks (`src/qti/overlay-queries/declaration.ts`) over an area mapping's node beside its declaration's cardinality and base type, `AreaMappingCardinality` and `AreaMappingBaseType`; the oracle's `AreaMapping base type`",
      status: "G",
    },
  ],
  [
    100,
    {
      owner:
        "Q5.11's `Lookup_table_cardinality` check on `LookupTableCardinality`, a lookup table's node beside its declaration's cardinality, and `Typed_attribute_value` on `LookupValueType`, each `LookupValue` beside its table's declaration's base type (`src/qti/overlay-queries/declaration.ts`); the oracle's `Lookup table cardinality` and `Typed attribute value`",
      status: "G",
    },
  ],
  [
    101,
    {
      owner:
        "PI's `IdBinding` (`src/qti/overlay-queries/identity.ts`): each `DocumentId`'s value (`IdValue`, `src/qti/names.ts`) bound to its `owner`, an attribute's element or an ID-typed text's parent (`IdentityText`), the key (document, id) over the bindings, and Idref target over attribute and text tokens (`TextIdref`); the oracle's `DocumentId key` and `Idref target`",
      status: "G",
    },
  ],
  [
    102,
    {
      owner:
        "P's resolution at import (`src/import/overlays/package.ts` `resolveIn`, `baseIn`, `hrefResolverOf`; RFC 3986 §2.1 and §5.2, each value read by its whitespace class, `xml:base` and the manifest's Base resolved, dot segments removed, segments percent-decoded); `HrefScope` on `File`, `ResourceHref` and `Reference`, each of the first two beside the arm its scope names (`FilePath` and `ResourceHrefPath`, an entry path; `FileOutside` and `ResourceHrefOutside`, the path as written and its `targetDigest`; grizzle's `alternatives` under Manifest overlay), read through the queries `EntryFileTarget`, `ResourceFilePath`, `ResourceFileOutside` and `ResourceFileDocument` (`src/qti/overlay-queries/package.ts`), their resolved `path`, `Reference` `lead ‖ target ‖ params ‖ trail` and its scope's written-form implications (`E1_derived`), `resolvedPathPattern` (`E1_derived`), href-listed over each arm (entry paths, outside paths by digest then text, same-document headers), `Document_entry` on a document-typed href, the stated limit `Href_form` (`scope <> unresolved`, a reference's and a `srcset` candidate's), and a `srcset`'s image candidates, `Srcset`, `SrcsetCandidate` and `CandidatePath`, split by `srcsetCandidatesOf` (`src/import/pieces.ts`) and proved by their concatenation fold (`src/qti/package.ts`) against the attribute's form (`SrcsetForm`, `src/qti/overlay-queries/package.ts`); the oracle's own resolver `src/test/resolution.ts`, its candidate reading `oracleSrcsetOf`, and its Href form, Href listed, Document entry and File exists",
      status: "G",
    },
  ],
  [
    103,
    {
      owner:
        "the census `ReferenceAttribute` (`src/grammar/references.ts`, `asiCensus`, `xiCensus`, `mathmlCensus`, `ssmlCensus`; installed by `src/grammar/install.ts`), each value resolved by `src/import/overlays/package.ts` `referenceRowsOf` with the `xml:base` in scope (`basesOf`), read by R6 `file-exists` over `Reference` and `ReferencePath` (`src/qti/package.ts`)",
      status: "P",
    },
  ],
  [
    104,
    {
      owner:
        "PM's choice names: Choice identifier key's per-class keys `Choice(document, kind, identifier)` and `Hottext(document, identifier)` and their placed copies on the assembly (`src/qti/interactions.ts`), and the rules over queries (`src/qti/queries.ts`): the cross-class keys over `ChoiceSpaceName` and `PlacedChoiceSpaceName`, every simple, inline, hotspot and simple associable choice with every other choice or hottext bearing one of their names, and Choice not variable, each name of `ChoiceOrHottext` and `PlacedChoiceOrHottext` in `UnclaimedName`, which negates `DeclarationIdentifier` and in an item the built-ins, so each class's sentence bars its own noun and a 'choice' every class the model calls a choice, a gap none; the oracle's Choice not variable and Choice identifier key (`choiceNames`, `sharedNames`, `choiceNouns` and `barredByChoice`, `src/test/oracle.ts`); held by `src/qti/interactions.oracle.test.ts` (two classes named alike, a gap and a gap text of one gap match, a gap and a gap text each beside a simple choice, a gap text beside a hottext, two gap texts)",
      status: "G",
    },
  ],
  [
    105,
    {
      owner:
        "PM's view `UsageValueBaseType` (`src/qti/queries.ts`): a row only for a `ud:value` that writes a `fieldIdentifier` (inside a record) and a `baseType` that spells a code (decision 427), `Usage_typed_value` over `BaseTypePattern` on its text, folded by `copiedTextKinds` (`src/qti/node.ts`), and a `baseType` outside a record left untyped; the oracle's Usage typed value (`src/test/oracle.ts`), the same test",
      status: "G",
    },
  ],
  [
    106,
    {
      owner:
        "`TestReading`'s rules of an item's built-ins through its item ref (`src/qti/overlay-queries/readings.ts`); the oracle's readings (`src/test/oracle-laws/readings.ts`)",
      status: "G",
    },
  ],
  [
    107,
    {
      owner:
        "`itemVariables`' mapping rule, beside the item's own declarations (`src/qti/overlay-queries/readings.ts`); the oracle's readings (`src/test/oracle-laws/readings.ts`)",
      status: "G",
    },
  ],
  [
    108,
    {
      owner:
        "\"Template default target\": `PackagedTemplateDefault` into `ItemRefDocument` and `ItemTemplateDefault` into the item's template declarations (`src/qti/overlay-queries/tests.ts`); the oracle's `itemRefLawsOf` (`src/test/oracle-laws/tests.ts`)",
      status: "G",
    },
  ],
  [
    109,
    {
      owner:
        "AL1 admission: the composition's `admitsWild` (`src/grammar/compose.ts`) admits no wildcard `xml:id` on a kind or governor whose declared uses include an ID-derived one; `compose.test.ts`'s wild-ID test over every kind and governor; xmllint's unimplemented clause 5.2 recorded",
      status: "G",
    },
  ],
  [
    110,
    {
      owner:
        '"Variable mapping source" and "Template default target" over `ItemRefDocument`, and the importer\'s `LinkReading` through an item ref that names no item document (`src/qti/overlay-queries/tests.ts`, `src/import/overlays/readings.ts`); the oracle\'s `itemRefLawsOf` and readings',
      status: "G",
    },
  ],
  [
    111,
    {
      owner:
        "PE's `ReferenceDeclaration` (`src/qti/expression-types.ts`, each row cited), over `VariableRef` and a test's resolving `Reading` (`src/qti/expressions.ts`); the oracle's Variable kind",
      status: "G",
    },
  ],
  [
    112,
    {
      owner:
        "`prefixingReferences`, every placed reference but a setter's `identifier` (`src/qti/overlay-queries/readings.ts`); the oracle's readings (`src/test/oracle-laws/readings.ts`)",
      status: "G",
    },
  ],
  [
    113,
    {
      owner:
        "PG's `HeldRootsUnder` (`install.ts`), read by shred's `heldRoot` (`src/model/shred.ts`, so a held root is no `strict-undeclared`) and PN's `Strictly_held` on `OpenElementName` (`src/qti/chardata.ts`); the oracle's Strictly held",
      status: "G",
    },
  ],
  [
    114,
    {
      owner:
        "IN's `IncludeRoot` and `IncludeParent` (`src/grammar/include.ts`, `install.ts`), the fragment rows of `RootOfType` (`facets.ts` `fragmentRoots`) and the document node's roots; `Inclusion` into `IncludeRoot` (`src/qti/tests.ts`); `include.test.ts` against each parent's automaton; the oracle's Include root and its in-place splice",
      status: "G",
    },
  ],
  [
    115,
    {
      owner:
        "IN's `SiteTarget`, each site's target, a row only where its href names a document the manifest lists: `SiteTarget` into `Site` and into `Document`, every include an include parent reads its `Site`, and each such include that is not `external` its `SiteTarget` (`includeSites`, `src/qti/tests.ts`, Include target); a `Site` marked `external` is proven by its href's `Reference` row (`externalSites` into `externalHrefs`), stored as written and never fetched; and `Include_fragment_identifier` on `Reference` (`src/qti/package.ts`); the oracle's Include target, admitting an external href (`inclusionBreaches`, `src/test/oracle.ts`), and Include fragment identifier; and the schema's one cause per fault: a site's href is its `SitePath` (`src/qti/tests.ts`), written only where it resolves to a path of the package, its `entry` held by `File_exists` (\"File exists\"), every include that is not `external` has its `SitePath` (Include target), every section ref whose href stays in the package its `SitePath` (\"Document entry\"), and an external section ref is the stated limit \"Remote section ref\"'s alone (reading 170), and the oracle's Document entry, the box `src/test/gen/sites.test.ts` exhausts",
      status: "G",
    },
  ],
  [
    116,
    {
      owner:
        "IN's `fragmentRootsOf` (`src/grammar/include.ts`): a context-split kind roots no fragment, so `IncludeRoot` refuses an include where only it stands; a stated limit",
      status: "G",
    },
  ],
  [
    117,
    {
      owner:
        "IN's document context (`Document.context`, `contextNearest`, `src/qti/chardata.ts`, through its document node's fixed target; `SiteTarget`'s fold, `src/qti/tests.ts`, and `UnplacedInclude`'s `context`, `src/qti/overlay-queries/tests.ts`), `PlacedBinding`, `PlacedChoice`, `PlacedHottext`, the query `PlacedChoiceOrHottext` and the section references' fragment placements (`FragmentScope`, `FragmentTemplateRef`, `FragmentContextRef`, `src/qti/interactions.ts`) `IdrefTarget`, `PlacedId`, `AssembledId` and `PlacedIdref` (`src/qti/identity.ts`), `PlacedExpression` and `PlacedVariableRef` (`src/qti/expressions.ts`), every expression and reference typed per placement, a standalone document its own one placement and an item's own placement also its located template's (`placedDocuments`, `src/qti/overlay-queries/expression.ts`; `placedRowsOf`, `src/import/overlays/expressions.ts`), every type law stated once over them, `DescribedAssembledLang`, an item instance's languages as the join of its instance and its document's forms, and `AssembledCatalog` (`src/qti/catalog.ts`) with `PlacedReference`, each instance's document's catalog references as the join of the instance and the references (`src/qti/overlay-queries/catalog.ts`), `PlacedMathRank` and `PlacedShareTarget` (`src/qti/mathml-share.ts`), ranked per assembly by `placedShareRowsOf`, under Q5.13's `Instance`; the importer's `contextsOf` (`src/import/context.ts`); the oracle's in-place splice (`inPlaceBreaches`), Fragment context and Document lang over the merged item, and its catalog resolution over the assembly (`Assembly.catalogs`); the laws it lists are known under-refusals",
      status: "G",
    },
  ],
  [
    118,
    {
      owner:
        "IN's restated `xi:include` model (`facets.ts` `includeModel`) and `httpHeaderText` on `accept` and `accept-language` (`src/grammar/attributes.ts`); a fallback in wildcard content is a known under-refusal",
      status: "G",
    },
  ],
  [
    119,
    {
      owner:
        "O's `Rounding_figures` over the view `RoundingModeFigures`, each rounding operator's `figures` beside its mode in force, written or `qti-equal-rounded`'s default (`src/qti/overlay-queries/expression.ts`); held by `src/qti/operators.test.ts` and `src/qti/attribute-views.db.test.ts`",
      status: "G",
    },
  ],
  [
    120,
    {
      owner: "AL1 (`positiveIndex`, `qti-index`'s `n` at least 1 where it is a number)",
      status: "G",
    },
  ],
  [
    121,
    {
      owner:
        "O's `toleranceRequired` (a containment from the absolute or relative mode's `Attribute` selection into the `tolerance` attributes, `src/qti/operators.ts`) and the view `ToleranceToken`'s first value's containment and its `Equal_tolerance` check (`src/qti/overlay-queries/expression.ts`)",
      status: "G",
    },
  ],
  [
    122,
    {
      owner:
        "the law `lom-learning-resource-type` as a containment of a forbidden value's type in a source of another vocabulary (`ForbiddenResourceType` in `OtherVocabularyType`, `src/qti/queries.ts`), rules over queries over `Node.stringValue` folded by `copiedTextKinds` (`src/qti/node.ts`); the oracle's LOM learning resource type",
      status: "G",
    },
  ],
  [
    123,
    {
      owner:
        "AL1 (`overrideDirection`, `bdo`'s `dir` without `auto`) and AL3 (`readingUses` through `readDeclarations`, `bdo`'s `dir` required)",
      status: "G",
    },
  ],
  [
    124,
    {
      owner:
        "H's `Picture_source_srcset` and `Media_source_src`, checks on `Node` over `attrs` (`src/qti/html.ts`); AL1 (`nonEmptyUrl` on `audio`, `video` and `source` `src`, `video` `poster` and `source` `srcset`); the URL Standard's syntax is a stated limit",
      status: "G",
    },
  ],
  [
    125,
    {
      owner:
        "H's `Track_srclang`, a check on `Node` for a track that writes no kind, and `subtitleTrackSrclang`, a containment between two `Attribute` selections (`src/qti/html.ts`); AL1 (`nonEmptyUrl` on `track`'s `src`, and `languageOnly` on its `srclang`, reading 129)",
      status: "G",
    },
  ],
  [
    126,
    {
      owner:
        "H's views `HeaderToken` and `CellTable` (`src/qti/names.ts`) and `TableHeader` (`src/qti/overlay-queries/html.ts`), each of `Attribute` and `Node`: `CellToken`'s containment in `TableHeader` and `HeaderToken`'s key on (cell, token); held by `src/qti/attribute-views.db.test.ts`",
      status: "G",
    },
  ],
  [
    127,
    {
      owner:
        "Q's `Quotation_punctuation` check over the query `QuotationEnd` (`src/qti/overlay-queries/quotation.ts`), each end a neighbour's own `Node.first` or `Node.last`, which `E1_derived` proves (`src/qti/node.ts`); the oracle's Quotation punctuation; a `’` that closes a quote is a known under-refusal",
      status: "G",
    },
  ],
  [
    128,
    {
      owner:
        "identity.ts's Label tools (`labelAttributes` keeps the labels of `toolLabelKinds`, the kinds whose declared type states the tool sentence, read from the ASI XSD by `src/grammar/labels.ts` and installed by `src/grammar/install.ts`, the item root's own label among them, as a `LabelUse`; `itemLabels` contained in `toolNames` and `toolVersions`); the oracle's Label tools",
      status: "G",
    },
  ],
  [
    129,
    {
      owner:
        "AL1 (`languageTag`: `xmlLanguage` on every `xml:lang`, the document layer's and a `skip` wildcard's included, `rootLanguage` on the item and stimulus roots, `languageOrEmpty` on `lang`, `languageOnly` on `srclang`); RFC 5646 validity under the IANA registry is a stated limit",
      status: "G",
    },
  ],
  [
    130,
    {
      owner:
        "N7 Counted: the loose LOM binding's 82 capped pairs as `Counted` rows of 0 to 1 (`facets.ts` `lomCaps`, `content.ts` `cappedBy`), installed as `Capped` (`install.ts`) and held by the key over `Node`'s `(parent, state)` at a capped position (`node.ts` `cappedChildren`)",
      status: "G",
    },
  ],
  [
    131,
    {
      owner:
        "chardata.ts `NamespaceUri`, RFC 3986's URI-reference over `Namespace.uri` (law Namespace name, rule `namespace-name`); the oracle's Namespace name over its own Appendix A recogniser (`#pantry/test/uri-reference.ts`)",
      status: "G",
    },
  ],
  [
    132,
    {
      owner:
        "AL1 (`printfFormat` on `qti-printed-variable`'s `format`): each conversion specifier over the listed codes, `d` a listed code by reading 171; its one-specifier rule is set aside by reading 161",
      status: "G",
    },
  ],
  [
    133,
    {
      owner:
        "the key text types of `src/qti/limits.ts`, each a `str.bytes` bound of what one B-tree entry leaves the text in the widest key it stands in (a path's `entryPathBytes`, a QTI identifier's `identifierBytes` and the rest, each derived beside its type), the oracle's Key text bound (rule `key-text-bound`, measured in UTF-8 bytes) over the schema's key copies and the texts the host writes where they stand (`src/test/key-copies.ts`, `src/test/oracle.ts` `keyTexts`), held to the import's rows by `src/test/keys.oracle.test.ts`. The import writes every text whatever its length, so the database refuses an over-long one under `key-text-bound`, the oracle's rule",
      status: "G",
    },
  ],
  [
    134,
    {
      owner:
        "R26 `document-lang` (identity.ts `DocumentLang`'s and `AssembledLang`'s generated `value`, `lowerAscii(collapse(lang))`, and `ListedLang`'s `lang`, `lowerAscii` of a `lom:language`'s folded string value; `DescribedLang` and `DescribedAssembledLang`, `src/qti/queries.ts`); the oracle's Document lang",
      status: "G",
    },
  ],
  [
    135,
    {
      owner:
        "AL1 (`mediaType` through `mediaTypeReadings`, `src/grammar/attributes.ts`: every MimeTypeDType attribute, and each item of the upload interaction's list, RFC 2045's two tokens and a slash); IANA registration is the stated limit",
      status: "G",
    },
  ],
  [
    136,
    {
      owner:
        "AL3 (the XSD's `use=\"required\"` on the four shaped kinds' `coords`) and AL1 (`CoordsDType`), with no reading of its own in the grammar",
      status: "G",
    },
  ],
  [
    137,
    {
      owner:
        "the record: an element's attributes and declarations are sets (`counted` families `Node.attributes`, `Node.openAttributes` and `Node.namespaces`), and `unshred` writes declarations by prefix, then attributes by namespace name and local name, Canonical XML's order; no law reads either order, and shred's `refusalOrder` names a codec refusal by Canonical XML's keys (`attribute-order.export.test.ts`)",
      status: "G",
    },
  ],
  [
    138,
    {
      owner:
        "the package reader: `unsafeEntryPath` (`src/package/zip.ts`), which a zip's entry names and a package directory's file paths both meet (`readZip` under `href-path`, `readDirectoryEntry` under `entry-path`, which the import names `href-path`), held by `src/package/entry-path.test.ts`",
      status: "G",
    },
  ],
  [
    139,
    {
      owner:
        "the package reader: `locateDirectory` (`src/package/zip.ts`) requires the central directory's offset plus its size to be the end record's offset, refusing a gap under `zip-format` (ZIP64 records there are refused as ZIP64), held by `src/package/zip-gap.test.ts` and GEN-B's `src/test/genetic-zip.test.ts`",
      status: "G",
    },
  ],
  [
    140,
    {
      owner:
        "crust's DTD reader (`packages/crust/src/dtd.ts`): an attribute default referencing a general entity the subset declares after it is refused; WFC Entity Declared's scope decided at the internal subset's end, a parameter-entity reference taking a document out of it; held by `packages/crust/src/read.forward.test.ts`",
      status: "G",
    },
  ],
  [
    141,
    {
      owner:
        "crust's decoder and encoder (`packages/crust/src/decode.ts` `rows`, `asciiRow` and `decodeRow`, rule `encoding-mismatch`; `packages/crust/src/encode.ts` `encoders`): a document is read in the row of XML 1.0 Appendix F.1 its first bytes are in, under a label that row admits, and each UTF-16 scheme is written with the opening it is read by; held by `packages/crust/src/decode.detection.test.ts` against `packages/crust/src/test/appendix-f.ts`, and by `src/test/genetic-codec.test.ts`'s fixed seeds N3 and N4",
      status: "G",
    },
  ],
  [
    142,
    {
      owner:
        "crust's namespace pass (`packages/crust/src/namespaces.ts` `bindingViolation`, `namespacesVersionOf`) over `packages/crust/src/uri.ts` (`uriReference`, RFC 3986's URI-reference, which pantry's `NamespaceUri` reads; `isNamespaceName`, RFC 3987's IRI-reference under Namespaces 1.1); held by `packages/crust/src/uri.test.ts` against RFC 3987 §2.2's ranges, and `src/test/genetic-codec.test.ts`'s fixed seed N2",
      status: "G",
    },
  ],
  [
    143,
    {
      owner:
        "the grammar's `tmpl` flag (`src/grammar/facets.ts` `templateBlockKinds`), held by `src/test/template-interactions.oracle.test.ts` and `src/grammar/ancestry.test.ts`",
      status: "G",
    },
  ],
  [
    144,
    {
      owner:
        "the grammar's `DoubleBound` and `BoundFacet` (`src/grammar/domains.ts`, `src/grammar/install.ts`: a double's or a float's one lower bound, its pattern the lexical space less NaN); the schema's `Double_bound` checks on `Attribute` and `Node` (`src/qti/attributes.ts`), the value grizzle's `Text.parseDouble` of the collapsed form, under law Double bound (rule `attribute-lexical`); the oracle's Double bound, held by `src/qti/double-bound.oracle.test.ts` against XML Schema's value bound",
      status: "G",
    },
  ],
  [
    145,
    {
      owner:
        "`testInstances`: a spliced fragment is an instance of each test that places it, so its variable references are placed references (`src/qti/overlay-queries/readings.ts`), and every document a test places, a referenced section document among them, has a `FragmentScope` per placement whose content references resolve in the test's declarations (`referringRoots`, `src/vocab/terms/interactions.ts`; `src/qti/interactions.ts`); the oracle's readings and content references over `PackageRows.placements` (`src/test/oracle-laws/readings.ts`, `src/test/oracle-laws/content.ts`)",
      status: "G",
    },
  ],
  [
    146,
    {
      owner:
        "the import's listing, one document per path with the manifest's `manifest` first (`listDocuments`, `src/import/program.ts`), under \"Document entry\"'s key over `Document`'s (package, path) and its containment of each document-typed href in a resource's document of its type (`ResourceDocument`, `src/qti/package.ts`); the oracle's listing and its `typesAt` from the manifest's `manifest` (`judge`, `packageBreaches`, `src/test/oracle.ts`), held by `src/import/manifest-document.oracle.test.ts`",
      status: "G",
    },
  ],
  [
    147,
    {
      owner:
        "the import's `Named` and `StimulusRef` rows, written only for an element that writes its identifier (`namedOf`, `stimulusRefsOf`, `src/import/overlays/tests.ts`), under \"Test overlay\"'s containment of each such element's identifier attribute in its row (`src/qti/tests.ts`); the oracle's names, given only to an element that writes one (`assembledDocumentOf`, `src/test/oracle-laws/assembly.ts`); held by `src/import/overlays/tests.test.ts`'s names property and the genetic differential's fixed witnesses of the class (`fixed`, `src/test/gen/genetic/known.ts`)",
      status: "G",
    },
  ],
  [
    148,
    {
      owner:
        "`ObjectIdentifier` and `objectTitles`, the selections of an item root's attributes' `value`, none without its attribute, which the database's `MatchedIdentifier` and `MatchedTitle` match a record's entries and strings against (`src/qti/queries.ts`; `src/qti/metadata.ts`); the oracle's lom-identifier over the root's identifier, none where unwritten (`packageBreaches`, `src/test/oracle.ts`), and lom-title over its title, none where unwritten (`lomTitleLawsOf`, `src/test/oracle-laws/documents.ts`); held by `src/import/overlays/object-attributes.oracle.test.ts`",
      status: "G",
    },
  ],
  [
    149,
    {
      owner:
        "the view `NormalMinimum`, the double an outcome declaration's written `normal-minimum` names, or for one that writes none the XSD's default from the inventory leaf (`normalMinimumDefault`, `src/vocab/terms/declarations.ts`), its second rule (`src/qti/names.ts`), so `MasteryFloor` and Mastery range read it; the oracle's `normalMinimumByDefault` (`src/test/oracle-laws/documents.ts`), held by `src/test/normal-minimum-default.oracle.test.ts`",
      status: "G",
    },
  ],
  [
    150,
    {
      owner:
        "no law: an item's `time-dependent` is the XSD's required `xs:boolean`, which the grammar admits and AL3 requires, and no relation reads it, so an item's `duration` is read in the item or through an item ref whatever it says (`src/qti/expressions.ts`; the oracle's `referenceLaws`, `src/test/oracle-laws/expressions.ts`)",
      status: "G",
    },
  ],
  [
    151,
    {
      owner:
        "the database's `MatchedTitle` (`src/qti/queries.ts`), under which an object's `xml:lang` whose value is empty states no language (its `xml:lang` attribute with no `LangValue`, `src/qti/names.ts`), every other form outside its domain refused by AL1's immediate check before any rule over a query is judged; the oracle's lom-title over the root's `xml:lang` as its own AL1 reading reads it, none where it states none (`statedLanguage`, `lomTitleLawsOf`, `src/test/oracle-laws/documents.ts`); held by `src/import/overlays/object-lang.oracle.test.ts`",
      status: "G",
    },
  ],
  [
    152,
    {
      owner:
        "the grammar's one NCName, `ncNamePattern` (`src/grammar/domains.ts`), and its host reading, grizzle-text's `isNcName` over the same Second Edition tables (`regex/xml.ts`), read by the schema's sources of the content references and bindings (`referenceReadOf`, `printedReference`, `fragmentReferenceOf`, `namedBinding`, `src/qti/interactions.ts`), of the processing references (`namePattern`, `bareReference`, `bracedReference`, `src/qti/expressions.ts`), of the declaration and field names (`identifiers`, `namedFields`, `src/qti/declarations.ts`) and of the structure identifiers (`BankNaming`, `src/qti/overlay-queries/tests.ts`), and by the import's readers (`namedBy`, `src/import/names.ts`, the gate `referencesOf`, `fragmentNamesOf` and `nameOf`, `src/import/overlays/interactions.ts`, `spelledBy`, `src/import/overlays/expressions.ts`, `namedOf`, `src/import/overlays/tests.ts`, read; `namedPiecesOf`, `src/import/overlays/declarations.ts`, over `piecesOf`, `src/import/pieces.ts`); the oracle's bare reference and typed values (`referenced`, `typedValueOf`, `src/test/oracle.ts`); held by the genetic differential's fixed witness of the class (`fixed`, `src/test/gen/genetic/known.ts`)",
      status: "G",
    },
  ],
  [
    153,
    {
      owner:
        "`DeclarationBaseType`, a declaration's `base-type` attribute's code where it spells one (`src/qti/names.ts`), which no row copies, and the queries each law over a base type reads it through (`TypedValueText`, `MappingBaseType`, `MapKeyType`, `LookupValueType` and `TypedDeclarationName`, `src/qti/overlay-queries/declaration.ts`; `BindingBaseTypeNode` and `PlacedBindingBaseTypeNode`, `src/qti/overlay-queries/interaction.ts`; `FeedbackRefBaseType` and `TemplateRefBaseType`, `src/qti/overlay-queries/reference.ts`), with each record judged by its cardinality (`Reserved_type`, `MappableBaseType`, `AreaMapping_base_type`, `Feedback_outcome_type` and the string binding's `BindingFit`); the oracle's `typedValueOf` (`src/test/oracle-view.ts`), read by `baseTypeOf` and the laws over a type (`src/test/oracle.ts`, `src/test/oracle-laws/documents.ts`, `src/test/oracle-laws/expressions.ts`, `src/test/oracle-laws/tests.ts`); held by `src/test/record-declarations.oracle.test.ts`",
      status: "G",
    },
  ],
  [
    154,
    {
      owner:
        "the float base type's values read by `Text.parseDouble` where a law compares them (`src/qti/operators.ts` `doublePattern`); a float map key is its lexical form judged by `Typed_attribute_value`, and no law compares two keys (reading 98); the oracle's `numberOf` (`src/test/oracle.ts`)",
      status: "G",
    },
  ],
  [
    155,
    {
      owner:
        "the schema's \"Item ref target\" over the item refs that write an href (`attributesOf(\"href\", [itemRefKind])` into `ItemRefHref`, `src/qti/tests.ts`, and its target, the query `ItemRefTarget`, unless only a resource of an unread type names its path, `src/qti/queries.ts`) and its copy of a target's type into the assembly's lookup where it names a resource (`targetedItemRefs`, `src/qti/expressions.ts`); the oracle's item ref laws over every item ref, named or not (`itemRefsOf`, read by `itemRefLawsOf` and `documentLawsOf`, `src/test/oracle-laws/tests.ts`); held by `src/qti/item-ref-href.oracle.test.ts`",
      status: "G",
    },
  ],
  [
    156,
    {
      owner:
        "the value domains of the ID-typed attributes and texts (AL1 and TextDomain), whose patterns lie inside `ncNamePattern`'s with XML whitespace around it (`src/grammar/domains.ts`), so every `DocumentId` source (`idAttributes` and `idTextNodes`, `src/qti/identity.ts`), a `th`'s `id` (`TableHeader`, `src/qti/overlay-queries/html.ts`) and a catalog's (`CatalogId`, `src/qti/names.ts`) is each ID-typed form, no filter restating the domain, and each ID's value is its attribute's `value`, as `IdValue`'s is (`src/qti/names.ts`); the import's `documentIdOf` (`src/import/overlays/identity.ts`), its value by `attributeValueOf` (`src/import/names.ts`); the oracle's `idsOf` by each ID's value domain and `tableHeadersOf` by `nameForm` (`src/test/oracle.ts`)",
      status: "G",
    },
  ],
  [
    157,
    {
      owner:
        "`NamedDeclaration`, a declaration's name, its `identifier` attribute's value, which every reference by name joins by `(package, path, identifier)` and no row copies (`src/qti/names.ts`, `src/qti/overlay-queries/reference.ts`; `typedDeclarationOf`, `src/import/overlays/declarations.ts`), so a declaration whose identifier names nothing keeps its values, mapping, map keys and tables (`declarationsOf`, `src/import/overlays/expressions.ts`); the oracle's declaration laws over every declaration, named or not, and its names by their typed value (`declarationLawsOf`, `src/test/oracle-laws/documents.ts`; `overlayBreaches`, `src/test/oracle.ts`); held by `src/import/overlays/unnamed-declarations.oracle.test.ts`",
      status: "G",
    },
  ],
  [
    158,
    {
      owner:
        "every declaration element and its `DeclarationCardinality`, beside `DeclarationBaseType` and `NamedDeclaration`, each its attribute's value read only where it spells or names something (`src/qti/names.ts`; `typedDeclarationOf`, `src/import/overlays/declarations.ts`), and the queries each law over a cardinality reads it through (`SetCardinality`, `TypedValueText`, `FieldValueText`, `DeclarationName`, `MappingCardinality`, `AreaMappingCardinality` and `LookupTableCardinality`, `src/qti/overlay-queries/declaration.ts`), with Declaration base type stated from `DeclarationCardinality`; the oracle's declaration laws each where the attributes it reads spell something (`declarationLawsOf` and `valueSetLawsOf`, `src/test/oracle-laws/documents.ts`; `baseTypeOf`, `cardinalityOf` and `recordBreach`, `src/test/oracle.ts`); held by `src/import/overlays/untyped-declarations.oracle.test.ts`",
      status: "G",
    },
  ],
  [
    159,
    {
      owner:
        "`NamedDeclaration` (`src/qti/names.ts`), the one view a name resolves to by `(package, path, identifier)`, whatever its declaration's cardinality spells, joined by a query wherever a law reads the declaration (decision S3): the bindings' resolution, `ResponseName`, and the cardinality queries the fit laws, Binding cardinality and Max strings required read, `BindingCardinalityNode` and `PlacedBindingCardinalityNode` (`src/qti/overlay-queries/reference.ts`, `src/qti/overlay-queries/interaction.ts`), held by `src/import/overlays/untyped-bindings.oracle.test.ts`; the references' resolution, `ReferableName` and `PlacedVariableRefDeclaration`, with the cardinality queries Feedback outcome type, a variable reference's type and Reference type read, `FeedbackRefCardinality`, `TemplateRefCardinality` and `PlacedVariableCardinality` (`src/qti/overlay-queries/reference.ts`; `referencesOf`, `placedOf` and `fragmentRowsOf`, `src/import/overlays/interactions.ts`; `declarationsOf` and `placedRowsOf`, `src/import/overlays/expressions.ts`), and a choice's name against every named declaration (`UnclaimedName`, `src/qti/queries.ts`), held by the genetic differential's fixed witness of the class (`fixed`, `src/test/gen/genetic/known.ts`); the oracle's binding and reference laws, which resolve a name whatever the declaration's cardinality, and judge each half of Feedback outcome type where what it reads spells something (`src/test/oracle.ts`, `src/test/oracle-laws/tests.ts`, `src/test/oracle-laws/expressions.ts`)",
      status: "G",
    },
  ],
  [
    160,
    {
      owner:
        "the declaration's base type read by a mapping's keys only where it spells a code (the query `MapKeyType`, `src/qti/overlay-queries/declaration.ts`), no key over them (reading 98); the oracle's mapping law, reading a key in its base type only where it spells one (`src/test/oracle.ts`); held by `src/test/unspelled-declarations.oracle.test.ts`",
      status: "G",
    },
  ],
  [
    161,
    {
      owner:
        "AL1 (`printfFormat` on `qti-printed-variable`'s `format`, `src/grammar/attributes.ts`): text, `%%` and conversion specifiers over the listed codes (`d` a listed code by reading 171), any number of them, kept as the attribute's lexical form; the law oracle reads the same composed domain; held by `src/grammar/attributes.test.ts` (read 161, searched, against `printfSpecifiers`) and `src/test/rv-g.oracle.test.ts`",
      status: "G",
    },
  ],
  [
    162,
    {
      owner:
        "the import's `documentTypeOf` (`src/import/program.ts`), the type a path's document is read as among those its resources name, by its root's kind, and the law oracle's `typingResource` (`src/test/oracle.ts`), the same choice; held by `src/import/overlays/resource-types.oracle.test.ts` (simple's item path listed again under each other type `RootOfType` maps, before and after the item) and, on PostgreSQL, `src/import/program.oracle.db.test.ts` (reading 93's box)",
      status: "G",
    },
  ],
  [
    163,
    {
      owner:
        "no law: SCORE, MAXSCORE and PASSED are typed by no normative rule (§4.5's 'needs to be' is no RFC 2119 keyword, §1.3; §2.2.2.3 is NOT NORMATIVE; no XSD or Schematron rule), so `Reserved type` holds QTI_CONTEXT alone (`src/qti/overlay-queries/declaration.ts`; the oracle producer in `src/test/oracle-laws/documents.ts`), and its admission of each of any type is held by `Reserved type` in `src/test/laws.oracle.test.ts`",
      status: "G",
    },
  ],
  [
    164,
    {
      owner:
        "the law oracle's direction (`inheritedDirectionOf` and `changesDirection`, `src/test/oracle.ts`) and the builder's (`reading.owns`, `src/import/overlays/mathml-align.ts`): a formula's direction starts at its `m:math`, `ltr` unless it writes `rtl`, and an HTML ancestor's `dir` is not read; held by `src/test/align-direction.test.ts`",
      status: "G",
    },
  ],
  [
    165,
    {
      owner:
        "Q5.11's map keys (`src/qti/mapping.ts`): no key over a mapping's keys, so `York` and `york` and a key written twice are lawful entries in order, the first that matches giving the value, which plate's score reads; held by `src/test/restored.oracle.test.ts` and `src/import/program.oracle.db.test.ts`",
      status: "G",
    },
  ],
  [
    166,
    {
      owner:
        '"Variable kind" over `PrefixedDeclaration` (`src/qti/overlay-queries/readings.ts`): a prefixed `qti-correct` names a response; the oracle\'s readings (`src/test/oracle-laws/readings.ts`)',
      status: "G",
    },
  ],
  [
    167,
    {
      owner:
        "\"Weighted base\" (`WeightedBaseType`, `src/qti/overlay-queries/tests.ts`), a weighted test variables' float typing (`src/qti/expressions.ts`), and a test's prefixed references typed under each test by their one reading (`read`, `PlacedVariableRef`, `src/qti/expressions.ts`; `readDeclarations`, `ItemRead` and `ScopeDurationRead`, `src/qti/overlay-queries/readings.ts`; `scopedReadingsOf`, `src/import/overlays/readings.ts`); the oracle's `weightedBaseOf` and `attributeBaseOf` (`src/test/oracle-laws/tests.ts`, `src/test/oracle-laws/expressions.ts`)",
      status: "G",
    },
  ],
  [
    168,
    {
      owner:
        "\"Declaration not reserved\" by its document's root (`src/qti/overlay-queries/declaration.ts`); the oracle's `documentDocumentBreaches` (`src/test/oracle-laws/documents.ts`)",
      status: "G",
    },
  ],
  [
    169,
    {
      owner:
        "\"Binding cardinality\" (`src/qti/overlay-queries/interaction.ts`): `Binding_cardinality` over `SingleResponseGap` and `PlacedSingleResponseGap`, each a binding's response declaration of `single` cardinality joined through its name, a gap match bound to a `single` response only where `Interaction.gaps`, the count of its `GapInteraction` rows (its own gaps and an included fragment's), is at most one; the oracle's Binding cardinality over the gaps the interaction is nearest to (`src/test/oracle.ts`); held by `src/test/binding-fit.oracle.test.ts`",
      status: "G",
    },
  ],
  [
    170,
    {
      owner:
        '"Section ref target" over in-package section refs alone (`sectionRefSites`, `src/qti/tests.ts`) and `DeliverableTest` (`src/qti/overlay-queries/tests.ts`); the oracle\'s inclusion laws (`src/test/oracle.ts`)',
      status: "G",
    },
  ],
  [
    171,
    {
      owner:
        "AL1 (`printfFormat` on `qti-printed-variable`'s `format`, `src/grammar/attributes.ts`): `d` among the listed conversion codes, so `%d`, `%5d`, `%d %d` and `%i of %d` are admitted and stored as written, and `%q`, `2f%` and `%` stay refused under `attribute-lexical`; the law oracle reads the same composed domain; held by `src/grammar/attributes.test.ts`, `src/test/rv-g.oracle.test.ts` and the differential record of reading 132 (`src/test/lexical-harness.ts`)",
      status: "G",
    },
  ],
  [
    172,
    {
      owner:
        "no row: `BindingFit` holds none of the order interaction (`typedFits`, `src/grammar/facets.ts`) and `RecordBindingFit` none, so it is one of `anyTypeKinds` and binds a response of any type (`src/qti/interactions.ts`), judged only by Binding declared and Binding unique; the law oracle's Binding unique, over every interaction (`src/test/oracle.ts`); held by `src/grammar/expression.test.ts` (the binding sentences), `src/qti/interactions.oracle.test.ts` (`anyTypeKinds`), `src/import/refusal.sources.test.ts` (every law source normative, with no exception) and `src/test/laws.oracle.test.ts` (an order interaction binding a single string response and a record, the graphic order interaction refused; Binding unique over choice, order and custom interactions)",
      status: "G",
    },
  ],
  [
    173,
    {
      owner:
        "`shuffledSections`' loose rules, a section loose only where it writes `visible` and `keep-together` false (`src/qti/overlay-queries/tests.ts`); the oracle's `Section.loose` (`src/test/oracle-laws/assembly.ts`)",
      status: "G",
    },
  ],
  [
    174,
    {
      owner:
        "the schema's stated `xml:lang` forms, `LangValue` (`src/qti/names.ts`), each whose value is not empty, a tag for every form AL1 admits since each `xml:lang` domain lies inside a tag with whitespace around it or the empty form, read by R26's rules over queries (`DescribedLang`, `DescribedAssembledLang`, `src/qti/queries.ts`), a form outside its domain refused by AL1's immediate check before them; the oracle's Document lang (`documentLangBreaches`, `languageTagForm`, `src/test/oracle.ts`); held by `src/import/overlays/document-lang.oracle.test.ts`",
      status: "G",
    },
  ],
  [
    175,
    {
      owner:
        "the tables a declared reference reads are its declaration's own, under each placement: \"Mapped response\" and \"Lookup type\" hold each placed declared map response, map response point or lookup to a declaration that holds one of the tables its kind reads, and no row stands for a table it lacks (`readsItsTable`, `src/qti/overlay-queries/declaration.ts`; `placedTableReaders`, `src/qti/overlay-queries/reference.ts`); the law oracle's references' tables and kinds, none where they have none (`referenceBreachesOf`, `src/test/oracle-laws/expressions.ts`). A test's readings and their declarations went with the test (reading 228)",
      status: "G",
    },
  ],
  [
    176,
    {
      owner:
        "the `DocumentType` roster, `manifest` then the resource types, and `ResourceDocumentType` (`src/grammar/install.ts`); `Document.documentType`, the one row that holds a document's type, and the type of a resource's document as a row of its own, `ResourceDocument`, under \"RootOfType\", which holds the manifest to its path both ways, \"Document entry\" and `E1_derived` (`src/qti/package.ts`); the manifest attributes' selections (`manifestAttributes`, `src/qti/package.ts`) and the identifier copy-backs (`src/qti/identity.ts`) at the manifest's path, and `recordDocumentTypes` (`src/qti/metadata.ts`) through each record node's `Document`; the import's listing and `documentRowsOf` (`src/import/program.ts`, `src/import/write.ts`); the law oracle's `documentTypeOf` and `typesAt` (`src/test/oracle.ts`)",
      status: "G",
    },
  ],
  [
    177,
    {
      owner:
        'law "Data SSML" over `DataSsml`, `DataSsmlMember` and `DataSsmlProperty`, its `Data_SSML` checks over the table of the schema (`src/qti/data-ssml.ts`) and the rule over `RequiredSsmlProperty` (`src/qti/queries.ts`); the import\'s reading of the value into rows, judging nothing (`dataSsmlOf`, `src/vocab/data-ssml.ts`; `src/import/overlays/data-ssml.ts`); the law oracle\'s "Data SSML" over a document\'s rows (`dataSsmlBreachOf`, `src/test/oracle-laws/data-ssml.ts`; `src/test/oracle.ts`); held by `src/vocab/data-ssml.test.ts` and `src/test/oracle-laws/data-ssml.oracle.test.ts`, against the law restated over the rows (`src/test/data-ssml-law.ts`)',
      status: "G",
    },
  ],
  [
    178,
    {
      owner:
        "`Package` keyed by `package` (`PackageName`, `src/qti/limits.ts`), the key every relation's `package` holds and the Package unit's (`PackageUnit`) (`src/qti/package.ts`); the manifest identifier as the package's data, its attribute's `value` (`manifestIdentifiers`, `src/qti/overlay-queries/package.ts`), held by AL3, its value domain and \"DocumentId key\" over the manifest's IDs; `readPackage(dir, name)` and `BadPackageName` (`src/import/read.ts`), `importRowsOf` and `importPackage` under that name, `insertWrite`, which only inserts (`src/qti/logins.ts`), the command line's `import <dir> <name>` (`src/cli/import.ts`); held by `src/import/package.test.ts` and `src/cli/output.db.test.ts`",
      status: "G",
    },
  ],
  [
    179,
    {
      owner:
        "plate validates associations, its gap match the gap-text side alone today and both sides to come; pantry stores `match-group` as written in `Attribute` and judges it by its value domain alone",
      status: "G",
    },
  ],
  [
    180,
    {
      owner:
        "plate draws and hit-tests a circle's percentage radius on the smaller side of its image (`#plate/graphic/geometry.ts`); pantry stores a shape's `coords` as written in `Attribute` and judges it by its value domain alone, reading no percentage",
      status: "G",
    },
  ],
  [
    181,
    {
      owner:
        "plate reads a PNP's three sets in `readPnp` (`#plate/pnp/read.ts`), and `PnpSupports` states them (`#plate/supports.ts`); pantry reads no PNP document",
      status: "G",
    },
  ],
  [
    182,
    {
      owner:
        "plate's associate and graphic associate validation refuses a self pair and a pair given twice in either order in tier (a) (`#plate/interactions/associate.ts`, `#plate/interactions/graphic-associate.ts`), and the board of boxes both islands stand on refuses either before a response changes (`selfPair`, `pairMade`, `#plate/placement/machine.ts`); pantry stores no response",
      status: "G",
    },
  ],
  [
    183,
    {
      owner:
        "plate keeps a response's default in its binding where the interaction the page shows starts at it, a Choice and an End Attempt starting empty (`bindingsShown` and `startsAtDefault`, `#plate/redact/walk.ts`), and gives the entries it starts at as `Posting.start`; pantry stores a `qti-default-value` as written and judges it by its value domain alone",
      status: "G",
    },
  ],
  [
    184,
    {
      owner:
        "plate draws every graphic interaction's image at the scale `stageScaleOf` gives from its smallest tap region's `tapDiameterOf` (`#plate/graphic/geometry.ts`, `#plate/graphic/scale.ts`, `#plate/ui/graphic/frame.tsx`), its `coords` in the image's authored pixels; pantry stores the image's `width` and `height` and the areas' `coords` as written in `Attribute`",
      status: "G",
    },
  ],
  [
    185,
    {
      owner:
        "plate's Media validation refuses a negative count of plays in tier (a) as malformed (`#plate/interactions/media.ts`); pantry stores no response",
      status: "G",
    },
  ],
  [
    186,
    {
      owner:
        "plate's Media validation reads NULL as no play and refuses a count below `min-plays` in tier (b) (`#plate/interactions/media.ts`); pantry stores no response",
      status: "G",
    },
  ],
  [
    187,
    {
      owner:
        "plate's Media validation refuses a count above a `max-plays` that is not 0 in tier (a) (`#plate/interactions/media.ts`); pantry stores no response",
      status: "G",
    },
  ],
  [
    188,
    {
      owner:
        "plate counts a media interaction's plays in its island (`#plate/ui/media/plays.ts`, `#plate/ui/media/media.tsx`) and starts an `autostart` media there once it listens; pantry stores `autostart`, `loop`, `min-plays` and `max-plays` as written and counts no play",
      status: "G",
    },
  ],
  [
    189,
    {
      owner:
        'pantry\'s `expressionTypings`, which give `qti-index` an ordered operand and `qti-delete` no duration operand (`src/grammar/expression.ts`), judged under "Operand fit"',
      status: "G",
    },
  ],
  [
    190,
    {
      owner:
        "plate reads an unwritten `max-associations` as 1 and refuses a response over it in tier (a), and `min-associations` in tier (b) (`#plate/interactions/{associate,gap-match,graphic-associate,graphic-gap-match,match}.ts`); pantry stores `max-associations` as written and stores no response",
      status: "G",
    },
  ],
  [
    191,
    {
      owner:
        "plate reads a record response's number fields in `readRecord` (`numberFields`, `#plate/model/typed-text.ts`); pantry stores no response",
      status: "G",
    },
  ],
  [
    192,
    {
      owner:
        "plate leaves `qti-unselected-hidden` off a Graphic Gap Match's root for a candidate whose supports show magnification, inverted display polarity or the `high-contrast` catalog support (`carriedClass`, `#plate/vocabulary.ts`; `<Item>`'s class carrying, `#plate/ui/item/item.tsx`); pantry stores `class` as written in `Attribute` and reads no PNP",
      status: "G",
    },
  ],
  [
    193,
    {
      owner:
        'the count-range law refuses a `min-strings` above 1 on an extended-text interaction bound to a single or record response: in plate\'s validator (`#plate/validate/rules.ts`), and in pantry as a check over the query `NonContainerStrings` under "Choice bounds" (`src/qti/queries.ts`)',
      status: "G",
    },
  ],
  [
    194,
    {
      owner:
        "plate's Slider reads an unwritten `step` as continuous under a float binding and as 1 under an integer one (`#plate/interactions/slider.ts`); pantry stores `step` as written",
      status: "reading",
    },
  ],
  [
    195,
    {
      owner:
        "the QTI database's admission (`admissionOf`, `#ledger/grading.ts`) gives each interaction's tier (a) reasons whatever validate-responses says and its tier (b) reasons only under it, in the statement that grades the answer, which writes nothing for a refused one; pantry stores no response",
      status: "G",
    },
  ],
  [
    196,
    {
      owner:
        "withdrawn: plate and pantry hold one grammar, QTI 3.0.1's, so no document is judged under a version",
      status: "meta",
    },
  ],
  [
    197,
    {
      owner:
        'template-requirements refuses a qti-lookup-outcome-value whose outcome, declared or the built-in completionStatus, holds no lookup table, in plate\'s validator (`#plate/validate/rules.ts`, lookupTableRequirements); pantry refuses the same under "Lookup type", its `Lookup_type` checks over `VariableRef` and `PlacedVariableRef` (`src/qti/expressions.ts`)',
      status: "G",
    },
  ],
  [
    198,
    {
      owner:
        "template-requirements holds an item that names a `CC2_*` template to its canonical template's needs and to what its published rules read, in plate's validator (`#plate/validate/rules.ts`); pantry records the template an item names and runs no response processing",
      status: "G",
    },
  ],
  [
    199,
    {
      owner:
        "plate's validator refuses a weighted `qti-variable` outside a test's outcome processing as `expression-placement` at its `weight-identifier` (`#plate/validate/rules.ts`); pantry refuses the same under \"Outcome only\" (rule P25), its containment of `WeightedVariable` into the outcome-language expressions (`src/qti/queries.ts`)",
      status: "G",
    },
  ],
  [
    200,
    {
      owner:
        "plate's `isAuthorData` keeps `data-qti-aria-*` and `data-qti-a11y-content-role` out of its reserved `data-qti-` prefix (`#plate/vocabulary.ts`), so securing keeps both on their element (`#plate/validate/verdict.ts`); pantry admits and stores every `data-*` the attribute wildcard admits",
      status: "G",
    },
  ],
  [
    201,
    {
      owner:
        "pantry's census holds `qti-interaction-module@primary-path` and `@fallback-path` as form `module` and `qti-interaction-modules`' two configuration attributes as form `package` (`asiCensus`, `src/grammar/references.ts`), and `resolveFromRoot` resolves all four against the package root, a module location to its path with `.js` appended unless written (`moduleFileOf`, `src/import/overlays/package.ts`); plate's package check resolves the four so (`checkReferences`, `#plate/package/references.ts`), its resolver reads the extension so (`#plate/pci/resolve.ts`), and `baseLocationOf` gives the four the package root as their base, which `classifyUrlAt` and `assetPaths` read (`#plate/model/url.ts`)",
      status: "G",
    },
  ],
  [
    202,
    {
      owner:
        "plate's `parameterText` passes a container `param-variable`'s members joined by `;` and NULL as the empty string, as a printed variable with no `delimiter` prints them (`#plate/redact/print.ts`); pantry stores a `param`'s `value` as written and expands no template variable",
      status: "G",
    },
  ],
  [
    203,
    {
      owner:
        "plate's Media module gives no `absentValue`, so a Media whose island posted no count leaves its response NULL, or at the default reading 183 starts it at, while its validation reads NULL as no play (`#plate/interactions/media.ts`); pantry stores no response",
      status: "G",
    },
  ],
  [
    204,
    {
      owner:
        "plate's End Attempt reads `count-attempt` as `xs:boolean`, true when absent, and its `countsAttempt` keeps `numAttempts` only for a submission through a button written `false` (`#plate/interactions/end-attempt.ts`, `countsAttempt` in `#plate/model/interactions.ts`); pantry stores the attribute as written",
      status: "G",
    },
  ],
  [
    205,
    {
      owner:
        "plate's `startingValue` starts an outcome with no default at 0 only for a single integer or float and at NULL otherwise, for an item's and a test's outcomes alike (`#plate/model/record.ts`); pantry stores an outcome declaration as written and runs no processing",
      status: "G",
    },
  ],
  [
    206,
    {
      owner:
        "plate's MathML module replaces each `mi` and `ci` naming a `math-variable` template variable the values hold by an `mn` or `cn` holding its printed text (`substituted`, `#plate/content/mathml.ts`), which the print walk writes within the output budget (`mathValueOf` and `mathText`, `#plate/redact/print.ts`); pantry stores `math-variable` and the MathML as written and expands no template variable",
      status: "G",
    },
  ],
  [
    207,
    {
      owner:
        "the QTI database's grader (`@qti-pie/ledger`'s `grading.ts`, the port of plate's former engine, held equal to it on the golden recording) clamps a `multiple` or `ordered` response's mapped sum to `lower-bound` and `upper-bound`, and gives a `single` response's mapped value unbounded; pantry stores the bounds as written and scores nothing",
      status: "G",
    },
  ],
  [
    208,
    {
      owner:
        "the QTI database's grader (`@qti-pie/ledger`'s `grading.ts`, the port of plate's former engine, held equal to it on the golden recording) gives `qti-round`, `qti-truncate`, `floor` and `ceil` the integer NULL for INF, -INF and NaN; pantry runs no processing",
      status: "G",
    },
  ],
  [
    209,
    {
      owner:
        "plate's `formatPrinted` converts a float's exact value (`exactDecimal`), rounds it ties to even (`rounded`), rewrites every printed exponent under `power-form` (`powerFormed`) and fills the open points as the reading lists them (`#plate/redact/format.ts`); pantry stores `format`, `base`, `index` and `power-form` as written",
      status: "G",
    },
  ],
  [
    210,
    {
      owner:
        "the QTI database's grader (`@qti-pie/ledger`'s `grading.ts`, the port of plate's former engine, held equal to it on the golden recording) holds a relative `qti-equal` to `[x − |x|·t0/100, x + |x|·t1/100]`, `include-lower-bound` closing the `t0` end; pantry stores the tolerance as written",
      status: "G",
    },
  ],
  [
    211,
    {
      owner:
        "the QTI database's grader (`@qti-pie/ledger`'s `grading.ts`, the port of plate's former engine, held equal to it on the golden recording) makes a computed integer past 1,000,000 bits and a computed container past 1,000,000 values the NULL of their type; pantry runs no processing",
      status: "G",
    },
  ],
  [
    212,
    {
      owner:
        "the QTI database's grader (`@qti-pie/ledger`'s `grading.ts`, the port of plate's former engine, held equal to it on the golden recording) builds `qti-multiple`, `qti-ordered` and `qti-repeat` from their operands' run-time values, a `qti-field-value`'s among them, NULL when the non-NULL values differ in base type; pantry runs no processing",
      status: "G",
    },
  ],
  [
    213,
    {
      owner:
        "pantry's laws refuse a set of `completionStatus` to a literal outside its four values, and the QTI database's grader (`@qti-pie/ledger`'s `grading.ts`, the port of plate's former engine, held equal to it on the golden recording) refuses a run that sets it to one; pantry runs no processing",
      status: "G",
    },
  ],
  [
    214,
    {
      owner: "withdrawn: plate's test-delivery engine is deleted",
      status: "meta",
    },
  ],
  [
    215,
    {
      owner: "withdrawn: plate's test-delivery engine is deleted",
      status: "meta",
    },
  ],
  [
    216,
    {
      owner:
        "the QTI database's grader (`@qti-pie/ledger`'s `grading.ts`, the port of plate's former engine, held equal to it on the golden recording) gives NULL where the information model names no value, as the reading lists; pantry runs no processing",
      status: "G",
    },
  ],
  [
    217,
    {
      owner:
        "plate's `performIncludes` splices each package-local include that stands for an Include, rewrites the fragment's `uri` and `srcset` census references (`relativeReference`), keeping a PCI's package- and module-form references as written, takes an unresolvable include's `xi:fallback` or refuses `package-path-outside` or `package-file-missing` with `check: \"include\"`, and holds the chain to `includeDepthLimit` (`#plate/package/include.ts`); `readDocuments` judges the merged document and counts each include toward the assembly limit (`#plate/package/documents.ts`); pantry stores an include and its site as written (reading 115) and places no fallback",
      status: "G",
    },
  ],
  [
    218,
    {
      owner: "withdrawn: plate's test-delivery engine is deleted",
      status: "meta",
    },
  ],
  [
    219,
    {
      owner: "withdrawn: plate's test-delivery engine is deleted",
      status: "meta",
    },
  ],
  [
    220,
    {
      owner:
        "the QTI database counts an item's attempts (`CountedAttempt` and `CompletedSession`, `@qti-pie/ledger`'s Delivery level) for the test scope and the results report alike; pantry writes no report and runs no processing",
      status: "G",
    },
  ],
  [
    221,
    {
      owner: "withdrawn: plate's test-delivery engine is deleted",
      status: "meta",
    },
  ],
  [
    222,
    {
      owner:
        "plate's `format` writes a file value as its name (`#plate/model/values.ts`), and the results report writes each value through it (`valueElement` and `fieldElement` in `#plate/results/results.ts`); pantry writes no results report",
      status: "G",
    },
  ],
  [
    223,
    {
      owner:
        "plate's `packageFiles` refuses a rooted key and one holding a `..` segment `package-path-outside` (`outsideKey`, `#plate/package/store.ts`) and keys every other file by its name as written, which `checkFiles` compares with the manifest's resolved paths; pantry's `unsafeEntryPath` (`src/package/zip.ts`) refuses the same names under `href-path`",
      status: "G",
    },
  ],
  [224, { owner: "withdrawn: plate's test-delivery engine is deleted", status: "meta" }],
  [225, { owner: "withdrawn: plate's test-delivery engine is deleted", status: "meta" }],
  [226, { owner: "withdrawn: plate's test-delivery engine is deleted", status: "meta" }],
  [227, { owner: "withdrawn: plate's test-delivery engine is deleted", status: "meta" }],
  [
    228,
    {
      owner:
        "\"Item ref identifier\" (`NamedItemRef` into `ObjectIdentifier`, `src/qti/queries.ts`), a bank's members by its section document (`BankMember`), and every test law over the assembled test, with no stated limit on a test's structure and no key over banks, a section's identifier being its test's alone (§4.2.1); `DeliverableTest`, a reading, never a law; the oracle's producers in `src/test/oracle-laws/tests.ts` and `src/test/oracle-laws/readings.ts`",
      status: "G",
    },
  ],
  [
    229,
    {
      owner:
        "plate's `MediaReplay` (`#plate/ui/media/media.tsx`), which a review and a solution render (`#plate/ui/item/interactions/media.tsx`), handed no entry name and no limit, and plate's UI suite's J1 (`packages/specimen/src/ui/rules.ts`); pantry stores no response",
      status: "G",
    },
  ],
  [
    230,
    {
      owner:
        "plate's review marks against `<Item>`'s `graded` (`Graded` and `Reveals`, `#plate/ui/item/context.ts`), each missed part, a Control's right answer and a bank chip left behind drawn only where it reveals the solution (`missedShown`, `#plate/ui/item/interactions/marks.ts`), and plate's UI suite's M1 and M2 (`packages/specimen/src/ui/rules.ts`); pantry stores no response",
      status: "G",
    },
  ],
  [
    231,
    {
      owner:
        "plate's Feedback part, one per run of adjacent feedback blocks (`feedbackRunOf`, `#plate/ui/item/content.tsx`) and one after the body, its verdict from `Graded.credit` (`verdictOf`) and the explanation's title (`isExplanation`, `#plate/ui/item/feedback.tsx`), the redaction keeping a shown block's `identifier` alone (`shownBlock`, `#plate/redact/walk.ts`); pantry stores no response",
      status: "G",
    },
  ],
  [
    232,
    {
      owner:
        'AL1: a position object interaction\'s `center-point` domain, its `xs:int` list held to a `length` of 2 (`specReadings`, `src/grammar/attributes.ts`), refused under "value domain"',
      status: "G",
    },
  ],
  [
    233,
    {
      owner:
        "\"Template needs\" (P8): per need, `select(TemplateProcessing, value)`, its `template` URI one of the template's four, contained in `select(NamedDeclaration, identifier, declarationKind)`, and under the mapping templates in `MappedResponseDeclaration` (`src/qti/queries.ts`); the oracle's producer in `src/test/oracle-laws/documents.ts`",
      status: "G",
    },
  ],
  [
    234,
    {
      owner:
        "\"Printed variable type\" (`printed-variable-ref`): checks over the queries `PrintedIntegerCardinality` and `PrintedIntegerBaseType` (`src/qti/queries.ts`); the oracle's producer, an item's or a test's own references and those of every document a test places, in `src/test/oracle-laws/content.ts`",
      status: "G",
    },
  ],
  [
    235,
    {
      owner:
        "every float the model carries read in `xs:double`'s lexical space and computed as a binary64 double: the value domains' doubles (`src/grammar/domains.ts`), grizzle's `Text.parseDouble` in the schema's queries, plate's numbers, and the SQL grader's `float8`; no verdict moves",
      status: "G",
    },
  ],
  [
    236,
    {
      owner:
        "plate's catalog references of a `qti-prompt`, a `qti-simple-choice` and a `qti-inline-choice` beside every HTML element's; pantry's \"Catalog reference\" over every `data-catalog-idref` (`src/qti/catalog.ts`; the oracle's in `src/test/oracle.ts`)",
      status: "G",
    },
  ],
  [
    237,
    {
      owner:
        "plate's read-aloud control beside a body element at a flow position, a prompt, and a Choice's and an Order's choice, over an active `spoken` card's audio files; pantry stores the catalog as written",
      status: "G",
    },
  ],
  [
    238,
    {
      owner:
        "plate's and the SQL grader's exact rational comparison of a `qti-equal`'s range (p3's `bound_order`); pantry stores the tolerance as written",
      status: "G",
    },
  ],
  [
    239,
    {
      owner:
        "AL1: `col@span` and `colgroup@span` as `xs:int` with minInclusive 1 (`specReadings` of `src/grammar/attributes.ts`); recorded in the lexical differential (`src/test/lexical-harness.ts`); held by `src/qti/html-structure.oracle.test.ts`",
      status: "G",
    },
  ],
  [
    240,
    {
      owner:
        "N5 Follow: `table`'s model restated, its `col`s or its `colgroup`s in one optional choice (`tableColumnEdits` of `src/grammar/facets.ts`); exempted in the content differential (`src/grammar/content.test.ts`); held by `src/qti/html-structure.oracle.test.ts`",
      status: "G",
    },
  ],
  [
    241,
    {
      owner:
        "N7 Counted: `figcaption` capped at one in `figure` (`figcaptionCap` of `src/grammar/facets.ts`); held by `src/qti/html-structure.oracle.test.ts`",
      status: "G",
    },
  ],
  [
    242,
    {
      owner:
        "Arity: a math operator's count by its name, the check over `MathOperand` and the containment of `BinaryMathOperator` (`src/qti/overlay-queries/expression.ts`); the oracle's in `src/test/oracle.ts`; held by `src/qti/html-structure.oracle.test.ts`",
      status: "G",
    },
  ],
  [
    243,
    {
      owner:
        "\"Weight key\", the key over the weights' `identifier` attributes by their item ref, each attribute's `parent` (`src/qti/overlay-queries/tests.ts`); the oracle's `itemRefLawsOf` (`src/test/oracle-laws/tests.ts`)",
      status: "G",
    },
  ],
  [
    244,
    {
      owner:
        "the ledger's admission, matching an `xhtml` Extended Text's `pattern-mask` against `p3.xhtml_text` of its value (`machine/admission.sql`), held to plate's `textOfXhtml` by `xhtml-text.db.test.ts`; pantry stores `pattern-mask` as written",
      status: "G",
    },
  ],
]);

/**
 * The admissions a spec reading removes from a model: (parent, child) pairs the XSD admits and
 * the grammar refuses on purpose.
 */
const readingOmissions: ReadonlyMap<string, number> = new Map([
  ["qti-template-else qti-template-constraint", 22],
  ["qti-template-else-if qti-template-constraint", 22],
  ["qti-template-if qti-template-constraint", 22],
  ["ssml:token ssml:voice", 44],
  ["ssml:w ssml:voice", 44],
]);

/**
 * The admissions a spec reading adds to a model: (parent, child) pairs the XSD does not admit and
 * the grammar admits on purpose. Spec reading 2 follows the MathML 3 RelaxNG: its `ContExp` holds
 * `semantics-contexp` (`mathml3-strict-content.rnc` line 14), the kind `m:semantics.contexp`, under
 * every model that reads `ContExp`; and `annotation-xml`'s `MathExpression` holds `m:semantics`
 * (`mathml3-common.rnc` line 59), which no XSD declares globally, so its lax wildcard never admits
 * it.
 */
const readingAdmissions: ReadonlyMap<string, number> = new Map([
  ...[
    "m:apply",
    "m:bind",
    "m:lambda",
    "m:set",
    "m:list",
    "m:vector",
    "m:matrix",
    "m:matrixrow",
    "m:semantics.contexp",
    "m:cerror",
    "m:domainofapplication",
    "m:condition",
    "m:uplimit",
    "m:lowlimit",
    "m:degree",
    "m:momentabout",
    "m:logbase",
    "m:piece",
    "m:otherwise",
    "m:reln",
    "m:fn",
    "m:declare",
    "m:interval",
  ].map((parent): readonly [string, number] => [`${parent} m:semantics.contexp`, 2]),
  ["m:annotation-xml m:semantics", 2],
]);

/**
 * The wildcards a spec reading restates, by the model's kind, with the reading: spec reading 61
 * reads `qti-ordering`'s extension slot as `##any`, laxly, where the XSD writes `##other`, since
 * the information model says its child tags "may be new tags and reused QTI ASI tags" (§5.98.3).
 * Every child the restated wildcard admits and the XSD's does not is added by the reading.
 */
const readingWildcards: ReadonlyMap<string, readonly [NamespaceConstraint, number]> = new Map([
  ["qti-ordering", ["##any", 61]],
]);

/**
 * The attribute rules a spec reading departs from the XSD in, by `family parent subject`: a
 * value the XSD's enumeration lists that a reading refuses, an attribute a reading refuses
 * (`readingRefusals`), and an optional attribute a reading requires (`readingUses`).
 */
const readingDepartures: ReadonlyMap<string, number> = new Map([
  ["attribute:type bdo dir", 123],
  ["attribute:type h1 role", 9],
  ["attribute:type qti-match-table-entry target-value", 8],
  ["attribute:type xi:include parse", 85],
  ...readingRefusals.map(({ kind, name, reading }): readonly [string, number] => [
    `attribute:admission ${kind} ${name}`,
    reading,
  ]),
  ...readingUses.map(({ kind, name, reading }): readonly [string, number] => [
    `attribute:required ${kind} ${name}`,
    reading,
  ]),
]);

/**
 * The rules nothing states yet that a named slice owns, by `family parent subject`, with the
 * slice.
 */
const planned: ReadonlyMap<string, string> = new Map();

/**
 * The attribute names the document layer admits on every kind, beside the open classes: XML's
 * and XML Schema's own (`xml:` and `xsi:`), which no kind's declarations list.
 *
 * @param name - The attribute handle.
 * @returns Whether the layer admits it.
 */
const isLayerName = (name: string): boolean =>
  name.startsWith("xml:") || name.startsWith("xsi:") || openClasses.some((open) => open === name);

/**
 * The children a particle admits: the kinds its element particles name, and its wildcards'
 * namespace constraints.
 */
interface Children {
  readonly kinds: readonly string[];
  readonly wildcards: readonly NamespaceConstraint[];
}

/**
 * The children of a model with no particle.
 */
const noChildren: Children = { kinds: [], wildcards: [] };

/**
 * The child kinds a particle names, its wildcards' included as `any` markers.
 *
 * @param particle - The particle.
 * @returns The element kinds, and the wildcards' namespace constraints.
 */
const childrenOf = (particle: Particle): Children => {
  switch (particle._tag) {
    case "element": {
      return Option.contains(particle.occurs.max, 0)
        ? { kinds: [], wildcards: [] }
        : { kinds: particle.kinds, wildcards: [] };
    }
    case "any": {
      return {
        kinds: [],
        wildcards: Option.contains(particle.occurs.max, 0) ? [] : [particle.namespace],
      };
    }
    case "group": {
      const held = particle.particles.map(childrenOf);

      return Option.contains(particle.occurs.max, 0)
        ? { kinds: [], wildcards: [] }
        : {
            kinds: held.flatMap(({ kinds }) => kinds),
            wildcards: held.flatMap(({ wildcards }) => wildcards),
          };
    }
    default: {
      return particle satisfies never;
    }
  }
};

/**
 * The particles of a model numbered as the content grammar numbers positions: its element and
 * wildcard particles from 1, in tree order, each with whether a group that encloses it may repeat,
 * so that its own bound is per repeat and no total of the family's children.
 *
 * @param particle - The model's particle.
 * @returns Each element and wildcard particle with its position and whether it is repeated.
 */
const positionsOf = (particle: Particle): readonly (readonly [Particle, number, boolean])[] => {
  const out: (readonly [Particle, number, boolean])[] = [];
  const visit = (at: Particle, repeated: boolean): void => {
    if (at._tag === "group") {
      for (const inner of at.particles) {
        visit(
          inner,
          repeated || Option.getOrElse(at.occurs.max, () => Number.POSITIVE_INFINITY) > 1,
        );
      }
    } else {
      out.push([at, out.length + 1, repeated]);
    }
  };
  visit(particle, false);

  return out;
};

/**
 * Whether a wildcard's namespace constraint admits a namespace, `target` being the namespace of
 * the schema it is written in (XML Schema Part 1, 3.10.4).
 *
 * @param constraint - The constraint.
 * @param namespace - The namespace, empty for none.
 * @param target - The schema's target namespace.
 * @returns Whether it admits it.
 */
const admits = (constraint: NamespaceConstraint, namespace: string, target: string): boolean => {
  switch (constraint) {
    case "##any": {
      return true;
    }
    case "##local": {
      return namespace === "";
    }
    case "##other": {
      return namespace !== "" && namespace !== target;
    }
    default: {
      return constraint satisfies never;
    }
  }
};

/**
 * The enumeration values a resolved XSD domain lists, when it is an enumeration: an atomic type
 * whose facets enumerate, or a union of such.
 *
 * @param domain - The domain.
 * @returns The values, or none when the domain is no enumeration.
 */
const enumerationOf = (domain: Domain): Option.Option<ReadonlySet<string>> => {
  const own = domain.facets
    .filter(({ facet }) => facet === "enumeration")
    .map(({ value }) => value);

  if (domain._tag === "atomic") {
    return own.length === 0 ? Option.none() : Option.some(new Set(own));
  }

  if (domain._tag === "union") {
    const members = domain.members.map(enumerationOf);

    return members.every(Option.isSome)
      ? Option.some(
          new Set(
            members.flatMap((member) => [...Option.getOrElse(member, () => new Set<string>())]),
          ),
        )
      : Option.none();
  }

  return Option.none();
};

/**
 * What the census reads of a composed grammar, indexed once: each parent's admitted
 * children, each element kind's namespace, which parents have an automaton, `Counted`'s
 * rows, the domains, `AttributeAdmission`'s rows and `TextDomain`'s keys.
 */
interface Index {
  readonly admitted: ReadonlyMap<
    string,
    ComposedGrammar["attributes"]["admission"]["rows"][number]
  >;
  readonly automata: ReadonlySet<string>;
  readonly children: ReadonlyMap<string, ReadonlySet<string>>;
  readonly counted: ReadonlyMap<string, CountBounds>;
  readonly domains: ReadonlyMap<string, ValueDomain>;
  readonly namespaces: ReadonlyMap<string, string>;
  readonly texts: ReadonlySet<string>;
}

/**
 * Index a composed grammar for the census.
 *
 * @param grammar - The grammar.
 * @returns The index.
 */
const indexOf = (grammar: ComposedGrammar): Index => {
  const children = new Map<string, Set<string>>();
  for (const row of admittedOf(grammar.content.contentModelOf, grammar.content.admissionIn)) {
    children.set(row.parent, (children.get(row.parent) ?? new Set()).add(row.child));
  }

  // The content models whose automata state a row, every model but that of no model.
  const stated = new Set(
    [...followPairsOf(grammar.content), ...grammar.content.last.rows].map(({ model }) => model),
  );

  return {
    admitted: new Map(
      grammar.attributes.admission.rows.map((row) => [`${row.kind} ${row.name}`, row]),
    ),
    automata: new Set(
      grammar.content.contentModelOf.rows
        .filter(({ model }) => stated.has(model))
        .map((row) => row.parent),
    ),
    children,
    counted: new Map(
      countBoundsOf(grammar.content).map((row) => [`${row.parent} ${row.position}`, row]),
    ),
    domains: new Map(grammar.attributes.domains.map((domain) => [domain.handle, domain])),
    namespaces: new Map(grammar.kinds.elementName.rows.map((row) => [row.kind, row.namespace])),
    texts: new Set(grammar.attributes.text.rows.map((row) => row.kind)),
  };
};

/**
 * The kinds a schema declares globally, which a `lax` or `strict` wildcard reads.
 */
const globals: ReadonlySet<string> = new Set(globalKinds.map(({ kind }) => kind));

/**
 * The element-content particle of a model, none for empty or simple content.
 *
 * @param model - The model.
 * @returns Its particle.
 */
const particleOf = (model: ContentModel): Option.Option<Particle> =>
  model.content._tag === "element-only" || model.content._tag === "mixed"
    ? Option.some(model.content.particle)
    : Option.none();

/**
 * Write an occurrence's bounds, `n` for unbounded.
 *
 * @param min - The least count.
 * @param max - The greatest, none for unbounded.
 * @returns The bounds as `min..max`.
 */
const boundsText = (min: number, max: Option.Option<number>): string =>
  `${String(min)}..${Option.match(max, { onNone: () => "n", onSome: String })}`;

/**
 * The census of one model: its admission, its character content, its automaton and its counted
 * particles.
 *
 * @param index - The grammar's index.
 * @param model - The model.
 * @returns The rules.
 */
const modelRules = (index: Index, model: ContentModel): readonly Rule[] => {
  const parent = model.kind;
  const held = index.children.get(parent) ?? new Set<string>();
  const particle = particleOf(model);
  const { kinds, wildcards } = Option.match(particle, {
    onNone: () => noChildren,
    onSome: childrenOf,
  });
  const target = index.namespaces.get(parent) ?? "";
  const explainedUnder = (constraints: readonly NamespaceConstraint[], kind: string): boolean =>
    // A foreign kind is its namespace class (§3.10.1): a wildcard explains the classes its
    // constraint admits.
    constraints.some((constraint) =>
      namespaceClassesUnder[constraint].some(
        (namespaceClass) => foreignKinds[namespaceClass] === kind,
      ),
    ) ||
    constraints.some(
      (constraint) =>
        globals.has(kind) && admits(constraint, index.namespaces.get(kind) ?? "", target),
    );
  const explained = (kind: string): boolean =>
    kinds.includes(kind) || explainedUnder(wildcards, kind);
  const restated = Option.match(Option.fromUndefinedOr(readingWildcards.get(parent)), {
    onNone: (): readonly NamespaceConstraint[] => [],
    onSome: ([constraint]) => [constraint],
  });
  const elementChildren = [...held].filter(
    (kind) => index.namespaces.has(kind) || isForeignKind(kind),
  );
  const missing = [...new Set(kinds)].filter((kind) => !held.has(kind));
  const unread = missing.filter((kind) => !readingOmissions.has(`${parent} ${kind}`));
  const added = elementChildren.filter(
    (kind) =>
      !explained(kind) &&
      (readingAdmissions.has(`${parent} ${kind}`) || explainedUnder(restated, kind)),
  );
  const extra = elementChildren.filter((kind) => !explained(kind) && !added.includes(kind));
  const admission = ((): Status => {
    if (unread.length > 0 || extra.length > 0) {
      return "X";
    }

    return missing.length > 0 || added.length > 0 ? "reading" : "G";
  })();
  const wantsText = model.content._tag === "mixed" || model.content._tag === "simple";
  const base = { parent, subject: parent };
  const automaton = index.automata.has(parent);

  return [
    {
      ...base,
      detail: `refused [${unread.join(" ")}]; by reading [${missing.filter((kind) => !unread.includes(kind)).join(" ")}]; added by reading [${added.join(" ")}]; unexplained [${extra.join(" ")}]`,
      family: "content:admission",
      owner: "Admission",
      status: admission,
    },
    {
      ...base,
      detail: `${model.content._tag}; text admitted: ${String(held.has("text"))}`,
      family: "content:character",
      owner: "Admission (text)",
      status: wantsText === held.has("text") ? "G" : "X",
    },
    ...Option.toArray(particle).flatMap((found): readonly Rule[] => [
      {
        ...base,
        detail: automaton ? "automaton installed" : "no automaton",
        family: "content:automaton",
        owner: "Follow, Last (Glushkov)",
        status: automaton ? "G" : "P",
      },
      ...positionsOf(found).flatMap(([at, position]): readonly Rule[] => {
        const max = Option.getOrElse(at.occurs.max, () => Number.POSITIVE_INFINITY);
        if (at.occurs.min < 2 && !(max >= 2 && Number.isFinite(max))) {
          return [];
        }

        const row = index.counted.get(`${parent} ${String(position)}`);
        const stated =
          row !== undefined &&
          row.min === at.occurs.min &&
          (!Number.isFinite(max) || row.max === max);

        return [
          {
            ...base,
            detail: `position ${String(position)}: ${boundsText(at.occurs.min, at.occurs.max)}; ${row === undefined ? "no Counted row" : `Counted ${String(row.min)}..${String(row.max)}`}`,
            family: "content:count",
            owner: "Counted",
            status: stated ? "G" : "U",
            subject: at._tag === "element" ? at.kinds.join(" ") : "##any",
          },
        ];
      }),
    ]),
  ];
};

/**
 * The spec reading that states the count of a kind in a family beyond the XSD's particles: spec
 * reading 241 for a figure's caption, which the information model bounds to one (§5.54.1), spec
 * reading 130 for every LOM element under a LOM element, whose loose binding's Schematron caps
 * them, and none for any other.
 *
 * @param namespaces - Each element kind's namespace.
 * @param parent - The family's parent.
 * @param kinds - The kinds the counted particle names.
 * @returns The reading, or none.
 */
const readingCounts = (
  namespaces: ReadonlyMap<string, string>,
  parent: string,
  kinds: readonly string[],
): Option.Option<number> =>
  parent === "figure" && kinds.length === 1 && kinds[0] === "figcaption"
    ? Option.some(241)
    : Option.liftPredicate(130, () =>
        [parent, ...kinds].every(
          (kind) => namespaces.get(kind) === vocabularyNamespaces.lom.namespace,
        ),
      );

/**
 * The `Counted` rows the XSD does not state: a count whose particle the XSD bounds otherwise, or
 * bounds per repeat of a group that encloses it, so its bound is no total. A count a spec reading
 * states is the reading's ({@link readingCounts}); any other is contradicted.
 *
 * @param grammar - The grammar.
 * @returns One rule per such row.
 */
const countsBeyond = (grammar: ComposedGrammar): readonly Rule[] => {
  const namespaces = new Map(
    grammar.kinds.elementName.rows.map((row) => [row.kind, row.namespace]),
  );

  return countBoundsOf(grammar.content).flatMap((row): readonly Rule[] => {
    const model = contentModels.find(({ kind }) => kind === row.parent);
    const found = Option.flatMap(Option.fromNullishOr(model), particleOf).pipe(
      Option.flatMap((particle) =>
        Option.fromNullishOr(
          positionsOf(particle).find(([, position]) => String(position) === row.position),
        ),
      ),
      Option.map(([particle, , repeated]) => ({ particle, repeated })),
    );
    const same = Option.exists(
      found,
      ({ particle: { occurs }, repeated }) =>
        !repeated &&
        occurs.min === row.min &&
        Option.getOrElse(occurs.max, () => Number.POSITIVE_INFINITY) === row.max,
    );
    if (same) {
      return [];
    }

    const reading = found.pipe(
      Option.flatMap(({ particle }) =>
        particle._tag === "element"
          ? readingCounts(namespaces, row.parent, particle.kinds)
          : Option.none(),
      ),
    );

    return [
      {
        detail: `${row.relation} ${String(row.min)}..${String(row.max)} at position ${row.position}; XSD ${Option.match(found, { onNone: () => "no particle", onSome: ({ particle: { occurs }, repeated }) => `${boundsText(occurs.min, occurs.max)}${repeated ? " in a repeated group" : ""}` })}${Option.match(reading, { onNone: () => "", onSome: (held) => `; by reading ${String(held)}` })}`,
        family: "content:count-beyond",
        owner: row.relation,
        parent: row.parent,
        status: Option.isSome(reading) ? "reading" : "X",
        subject: Option.match(found, {
          onNone: () => row.position,
          onSome: ({ particle }) =>
            particle._tag === "element" ? particle.kinds.join(" ") : "##any",
        }),
      },
    ];
  });
};

/**
 * The status of a declared attribute's use against the grammar's.
 *
 * @param declared - The XSD's use.
 * @param stated - The grammar's.
 * @param key - The rule's `family parent subject`, which a planned owner and a reading that
 *   requires the attribute are looked up by.
 * @returns The status.
 */
const useStatus = (declared: Use, stated: Use, key: string): Status => {
  if (declared === stated) {
    return "G";
  }

  if (declared === "required") {
    return planned.has(key) ? "P" : "U";
  }

  return readingDepartures.has(key) ? "reading" : "X";
};

/**
 * The status of a domain's enumeration against the XSD type's.
 *
 * @param same - Whether they agree.
 * @param reading - The reading that departs from the XSD here, if any.
 * @returns The status.
 */
const typeStatus = (same: boolean, reading: number | undefined): Status => {
  if (same) {
    return "G";
  }

  return reading === undefined ? "X" : "reading";
};

/**
 * The census of a declared attribute's enumeration against its domain's compiled pattern: every
 * XSD value is matched. That the pattern matches nothing else is the lexical oracle's, against
 * `xmllint`.
 *
 * @param base - The rule's place.
 * @param base.parent - The kind.
 * @param base.subject - The attribute.
 * @param domain - The grammar's domain.
 * @param theirs - The XSD type's values.
 * @param row - The declaration.
 * @returns The rule.
 */
const typeRule = (
  base: Pick<Rule, "parent" | "subject">,
  domain: ValueDomain,
  theirs: ReadonlySet<string>,
  row: AttributeDeclaration,
): Rule => {
  const pattern = new RegExp(domain.pattern, patternFlags);
  const refused = [...theirs].filter((value) => !pattern.test(value));
  const reading = readingDepartures.get(`attribute:type ${row.kind} ${row.name}`);
  const read = refused.length === 0 || reading === undefined ? "" : `; reading ${String(reading)}`;

  return {
    ...base,
    detail: `${String(theirs.size)} XSD values; refused [${refused.join(" ")}]${read}`,
    family: "attribute:type",
    owner: "ValueDomain pattern (enumeration)",
    status: typeStatus(refused.length === 0, reading),
  };
};

/**
 * The census of one declared attribute: its admission, its enumeration and its use.
 *
 * @param index - The grammar's index.
 * @param row - The declaration.
 * @returns The rules.
 */
const attributeRules = (index: Index, row: AttributeDeclaration): readonly Rule[] => {
  const held = index.admitted.get(`${row.kind} ${row.name}`);
  const base = { parent: row.kind, subject: row.name };
  const refused = readingDepartures.get(`attribute:admission ${row.kind} ${row.name}`);
  const admission: Rule = {
    ...base,
    detail:
      held === undefined
        ? `not admitted${refused === undefined ? "" : `; reading ${String(refused)}`}`
        : `domain ${held.domain}`,
    family: "attribute:admission",
    owner: "AttributeAdmission",
    status: typeStatus(held !== undefined, refused),
  };
  if (held === undefined) {
    return [admission];
  }

  const domain = index.domains.get(held.domain);
  const theirs = enumerationOf(row.domain);
  const types =
    Option.isSome(theirs) && domain !== undefined
      ? [typeRule(base, domain, theirs.value, row)]
      : [];
  const key = `attribute:required ${row.kind} ${row.name}`;
  const status = useStatus(row.use, held.use, key);
  const requiredBy = readingDepartures.get(key);
  const uses: readonly Rule[] =
    row.use === "required" || held.use === "required"
      ? [
          {
            ...base,
            detail: `XSD ${row.use}; grammar ${held.use}${status === "P" ? `; ${planned.get(key) ?? ""}` : ""}${status === "reading" && requiredBy !== undefined ? `; reading ${String(requiredBy)}` : ""}`,
            family: "attribute:required",
            owner: "Required",
            status,
          },
        ]
      : [];

  return [admission, ...types, ...uses];
};

/**
 * The attributes the grammar admits that no declaration states and no wildcard of the kind admits,
 * the document layer's names aside: contradicted, or by a reading where a reading's second
 * spelling of a declared name explains it. On a kind the Schematron's extension rules cover, a
 * wildcard explains no name but the layer's `data-*` (spec reading 90).
 *
 * @param grammar - The grammar.
 * @param index - Its index.
 * @param declared - The declared `kind name` keys.
 * @returns One rule per such attribute.
 */
const undeclaredRules = (
  grammar: ComposedGrammar,
  index: Index,
  declared: ReadonlySet<string>,
): readonly Rule[] => {
  const covered = coveredBy(grammar.kinds);

  return grammar.attributes.admission.rows.flatMap((row): readonly Rule[] => {
    // A foreign element is assessed laxly against `xs:anyType`, whose attribute wildcard is a lax
    // `##any` (XML Schema 1.0 Part 1, §3.4.7).
    const wildcard = isForeignKind(row.kind)
      ? { namespace: "##any" as const }
      : attributeWildcards.find(({ kind }) => kind === row.kind);
    const namespace = row.name.startsWith("xlink:") ? "http://www.w3.org/1999/xlink" : "";
    const viaWildcard =
      wildcard !== undefined &&
      !covered(row.kind) &&
      admits(wildcard.namespace, namespace, index.namespaces.get(row.kind) ?? "");
    if (declared.has(`${row.kind} ${row.name}`) || isLayerName(row.name) || viaWildcard) {
      return [];
    }

    return [
      {
        detail: `domain ${row.domain}`,
        family: "attribute:undeclared",
        owner: "AttributeAdmission",
        parent: row.kind,
        status: "X",
        subject: row.name,
      },
    ];
  });
};

/**
 * The attributes `xml.xsd` declares globally, which a wildcard that admits the XML namespace
 * admits on its kind.
 */
const xmlGlobals = ["xml:base", "xml:id", "xml:lang", "xml:space"] as const;

/**
 * The covered kinds whose class states an `extension` characteristic beside its `dataExtension`,
 * by the specification: `qti-custom-interaction`'s, a `NamespaceLax` (information model §5.36.1),
 * which admits every name in another namespace and the `xml:` names (spec reading 90).
 */
const namespaceLax: ReadonlySet<string> = new Set(["qti-custom-interaction"]);

/**
 * The census of the attribute wildcards that admit the XML namespace: each admits `xml.xsd`'s four
 * global attributes on its kind (validated against their declarations under `lax` and `strict`,
 * unvalidated under `skip`), so `AttributeAdmission` must hold each; but on a kind the
 * Schematron's extension rules cover, spec reading 90 admits only those the kind declares, so a
 * name it does not declare is held by the reading when the grammar refuses it.
 *
 * @param grammar - The grammar.
 * @param index - Its index.
 * @param declared - The declared `kind name` keys.
 * @returns One rule per (kind, name).
 */
const wildcardXmlRules = (
  grammar: ComposedGrammar,
  index: Index,
  declared: ReadonlySet<string>,
): readonly Rule[] => {
  const covered = (kind: string) => coveredBy(grammar.kinds)(kind) && !namespaceLax.has(kind);

  return attributeWildcards.flatMap((wildcard) =>
    admits(wildcard.namespace, XML_NAMESPACE, index.namespaces.get(wildcard.kind) ?? "")
      ? xmlGlobals.map((name): Rule => {
          const held = index.admitted.has(`${wildcard.kind} ${name}`);
          const refused = covered(wildcard.kind) && !declared.has(`${wildcard.kind} ${name}`);
          // A custom interaction declares an ID-typed `id`, so its wildcard admits no wild `xml:id`
          // (XML Schema 1.0 Part 1 §3.4.4 clause 5.2, spec reading 109).
          const wildId = namespaceLax.has(wildcard.kind) && name === "xml:id";
          const status = ((): Status => {
            if (refused || wildId) {
              return held ? "X" : "reading";
            }

            return held ? "G" : "X";
          })();

          return {
            detail: `${wildcard.namespace} ${wildcard.processing}; ${held ? "admitted" : "not admitted"}${refused ? "; reading 90" : ""}`,
            family: "attribute:wildcard",
            owner: "AttributeAdmission (the document layer's xml: names)",
            parent: wildcard.kind,
            status,
            subject: name,
          };
        })
      : [],
  );
};

/**
 * The census of spec reading 90 on each kind the Schematron's extension rules cover:
 * every name `AttributeAdmission` holds there is one the kind declares, `data-*` or an `xsi:`
 * name. Any other is a name the reading refuses that the grammar admits.
 *
 * @param grammar - The grammar.
 * @param declared - The declared `kind name` keys.
 * @returns One rule per covered kind.
 */
const extensionRules = (
  grammar: ComposedGrammar,
  declared: ReadonlySet<string>,
): readonly Rule[] => {
  const covered = coveredBy(grammar.kinds);
  const byKind = Map.groupBy(
    grammar.attributes.admission.rows.filter(({ kind }) => covered(kind)),
    ({ kind }) => kind,
  );

  return [...byKind].map(([kind, rows]): Rule => {
    const extra = rows
      .filter(
        (row) =>
          !declared.has(`${row.kind} ${row.name}`) &&
          row.name !== "data-*" &&
          !row.name.startsWith("xsi:") &&
          !(namespaceLax.has(row.kind) && (row.name === "foreign" || row.name.startsWith("xml:"))),
      )
      .map(({ name }) => name);

    return {
      detail: `${String(rows.length)} names; beyond the reading [${extra.join(" ")}]`,
      family: "attribute:extension",
      owner: "AttributeAdmission (reading 90, compose.ts coveredBy)",
      parent: kind,
      status: extra.length === 0 ? "G" : "X",
      subject: kind,
    };
  });
};

/**
 * The census of the spec readings: each reading's entry, reading 15's status read from the grammar
 * (its attribute's domain, which reading 15, restated, holds to the XSD's `xs:IDREF`), every
 * other's as recorded.
 *
 * @param index - The grammar's index.
 * @returns One rule per reading.
 */
const readingRules = (index: Index): readonly Rule[] => {
  const variableRef = index.admitted.get("qti-outcome-declaration variable-identifier-ref");

  return [...readings].map(([reading, entry]): Rule => {
    const fifteen = reading === 15;
    const resolved = fifteen && variableRef !== undefined && /idref/iu.test(variableRef.domain);

    return {
      detail: fifteen ? `domain ${variableRef?.domain ?? "none"}` : "",
      family: "reading",
      owner: entry.owner,
      parent: "",
      status: resolved ? "G" : entry.status,
      subject: String(reading),
    };
  });
};

/**
 * Take the census of the XSD rules and spec readings against a composed grammar.
 *
 * @param grammar - The composed grammar.
 * @returns Every rule.
 */
export const census = (grammar: ComposedGrammar): readonly Rule[] => {
  const index = indexOf(grammar);
  const declared = new Set(attributeDeclarations.map((row) => `${row.kind} ${row.name}`));

  return [
    ...contentModels.flatMap((model) => modelRules(index, model)),
    ...countsBeyond(grammar),
    ...attributeDeclarations.flatMap((row) => attributeRules(index, row)),
    ...undeclaredRules(grammar, index, declared),
    ...wildcardXmlRules(grammar, index, declared),
    ...extensionRules(grammar, declared),
    ...textTypes.map((row): Rule => {
      const held = index.texts.has(row.kind);

      return {
        detail: held ? "TextDomain row" : "no TextDomain row",
        family: "text:domain",
        owner: "TextDomain",
        parent: row.kind,
        status: held ? "G" : "U",
        subject: row.kind,
      };
    }),
    ...readingRules(index),
  ];
};

/**
 * The census's counts: per family and status, and the rules that are contradicted or unowned.
 */
export interface Counts {
  readonly byFamily: Readonly<Record<string, Partial<Readonly<Record<Status, number>>>>>;
  readonly total: number;
  readonly unowned: number;
}

/**
 * Count a census by family and status.
 *
 * @param rules - The census.
 * @returns The counts.
 */
export const countsOf = (rules: readonly Rule[]): Counts => {
  const byFamily: Record<string, Partial<Record<Status, number>>> = {};
  for (const rule of rules) {
    const family = byFamily[rule.family] ?? {};
    family[rule.status] = (family[rule.status] ?? 0) + 1;
    byFamily[rule.family] = family;
  }

  return {
    byFamily,
    total: rules.length,
    unowned: rules.filter(({ status }) => status === "U").length,
  };
};
