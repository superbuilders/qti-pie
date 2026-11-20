/**
 * The law catalog: every law's name, the rule its refusal keeps, the source its statement comes
 * from, and the precedence among the rules. It is data and holds no judgment, so the importer and
 * the law oracle both read it and neither reads the other: the importer states each law in its
 * schema module, and the oracle judges each by its own host predicate (`src/grammar/purity.test.ts`
 * holds the oracle to reading no statement of the schema or the importer).
 */

/**
 * Every rule a law keeps or will keep, most specific first: the order a refusal lists the rules
 * of its laws in (`ruleOrder` of `#pantry/import/refusal.ts`), when one PostgreSQL object
 * discharges several laws. It orders the rules for display and decides none: a refusal carries
 * every rule its laws carry.
 *
 * The tiers run from what pantry stores, through QTI's own rules, to the representation's:
 *
 * 0. Spec reading 1's stated limits on what pantry stores, content and banks and never a test
 *    (`#pantry/qti/tests.ts`): a test's structure outside a bank, then a bank's shape, so a package
 *    that holds a test or a section that is no bank is named for that first, whatever its
 *    structure's own faults;
 * 1. QTI's information model, its overlays O1 to O7 in the plan's order (§1.7), then packaging's P1 to
 *    P4 (§1.6);
 * 2. The embedded languages' readings (MathML, SSML);
 * 3. XML Schema's assessment of an element's governing type, its attributes and its text;
 * 4. The content model: the ancestry bans, the nearest interaction, then the automaton's order, the
 *    counts it relaxes, the family's end and admission;
 * 5. A package-media install's policy (`#pantry/qti/media.ts`), which only such an install states: a
 *    `data:` address, an address that names no file of the package, a file of a type the policy
 *    does not list, a style that fetches, markup pantry cannot read, then a file nothing names, so
 *    content that is not valid QTI is named by the rule that says so first;
 * 6. The document layer: the stated bound on a key's text, foreign names, derived fields and the tree.
 *
 * A specific law says what in the content to change, and a general one only that the representation
 * broke, so a QTI rule is listed before a tree law and a content-order law before a family law.
 * Every rule listed is a law's of the table, and every law's rule is listed once
 * (`refusal.oracle.test.ts`).
 */
export const precedence = [
  // What pantry stores: content and banks.
  "test-structure",
  "bank-shape",
  // O1, identity.
  "document-key",
  "item-key",
  "idref-target",
  "table-headers",
  "label-tool",
  "card-support",
  "card-default",
  "document-lang",
  // O2, declarations.
  "declaration-key",
  "declaration-reserved",
  "reserved-type",
  "declaration-type",
  "value-cardinality",
  "typed-copy",
  "mastery-range",
  // O3, interactions.
  "binding-declared",
  "binding-fit",
  "record-binding-fit",
  "binding-unique",
  "choice-bounds",
  "choice-identifier-distinct",
  "hotspot-default",
  "feedback-ref",
  "template-ref",
  "printed-variable-ref",
  "context-variable-ref",
  "pci-module-source",
  "slider-bounds",
  "max-strings-required",
  "aria-value-range",
  "adaptive-feedback",
  // HTML content.
  "source-srcset",
  "source-src",
  "track-srclang",
  "q-punctuation",
  // O4, expressions.
  "P2",
  "P8",
  "P10",
  "P36",
  "variable-kind",
  "P20",
  "P21",
  "P22",
  "P23",
  "P24",
  "P25",
  "P26",
  "P27",
  // O5 to O7: mapping, metadata, tests.
  "mapping-base-type",
  "lookup-cardinality",
  "lom-identifier",
  "lom-title",
  "lom-learning-resource-type",
  "structure-identifier",
  "bank-key",
  "stimulus-ref-key",
  "item-ref-target",
  "item-ref-identifier",
  "stimulus-ref-target",
  "include-target",
  "include-root",
  "inclusion-cycle",
  // P1 to P4, packaging.
  "entry-kind",
  "root-type-reverse",
  "file-listed",
  "file-exists",
  "href-listed",
  "self-dependency",
  // The embedded languages.
  "math-arity",
  "ssml-fragment",
  "include-href",
  // XML Schema's assessment.
  "xsi-type",
  "required-attribute",
  "attribute-count",
  "attribute-lexical",
  "text-copy",
  "attribute-admission",
  // The content model.
  "ancestry-ban",
  "owner-copy",
  "ordering",
  "child-set",
  "union-count",
  "admission",
  // A package-media install's policy.
  "media-data",
  "media-path",
  "media-type",
  "media-style",
  "media-entity",
  "media-foreign",
  "entry-used",
  // An install's LOM policy: each term and vCard a package's records write, then what a package
  // states in its manifest's record, then what its versions name.
  "lom-vocabulary",
  "lom-vcard",
  "package-identity",
  "package-classification",
  "package-credit",
  "source-pointer",
  "package-relation-target",
  "version-lesson",
  "one-head",
  "deletion-version",
  // The document layer: its stated limit, then its laws.
  "key-text-bound",
  "href-form",
  "fragment-context",
  "namespace-name",
  "well-formedness",
  "unmodeled-vocabulary",
  "derived",
  "reachability",
] as const;

/**
 * A law's rule and where its statement comes from: a reading of `docs/spec-readings.md`, an XML
 * Schema or XSD anchor, a specification section, or the design document a structural law follows.
 */
interface LawEntry {
  readonly rule: (typeof precedence)[number];
  readonly source: string;
}

/**
 * Every law the schema states, by name, with the rule its refusal keeps and its spec source: the
 * one statement of both, which the importer's refusals (`#pantry/import/refusal.ts`) and the law
 * oracle's verdicts (`#pantry/test/oracle.ts` `ruleOf`, `lawSources`) read alike.
 *
 * The oracle states a host predicate for most of them, under the same name. The rest are the laws
 * the oracle states none for: the tree as grizzle states it, the package's structure, the overlays'
 * reachability and the variable reference copy.
 */
export const lawTable = {
  "AL1 admission": {
    rule: "attribute-admission",
    source:
      "the XSDs' attribute declarations and wildcards as AttributeAdmission (fin.md D2); reading 13 for data-*, reading 47 for xsi:; and the declarations readings refuse (attributes.ts readingRefusals): 9 (role on source, the Schematron's RULE ARIA ROLE 1a) and 85 (xi:include's xpointer)",
  },
  "AL1 owner": {
    rule: "attribute-admission",
    source: "fin.md §16, the attribute family's owner copy (kind, version, document)",
  },
  "AL2 count": {
    rule: "attribute-admission",
    source: "fin.md §16, the attribute family's count",
  },
  "AL2 distinct": {
    rule: "attribute-admission",
    source:
      "XML 1.0 §3.1, WFC Unique Att Spec, and Namespaces in XML 1.0 §6.3: a closed attribute is its element's at its name, Attribute's key (package, path, start, name), an open class's attribute an OpenAttribute (fin.md §16, D2)",
  },
  "AL2 fold": {
    rule: "attribute-admission",
    source:
      "fin.md §16, attrs = the union of its closed attributes' slots, the end value of their counted family (qti/attributes.ts, AL2)",
  },
  "AL3 required": {
    rule: "required-attribute",
    source:
      "the XSDs' use=\"required\", and reading 123: https://www.imsglobal.org/spec/qti/v3p0/info#Data_BDO (§5.11: 'Authors must specify the dir attribute on this tag'), where the XSD declares bdo's dir optional (attributes.ts readingUses): AttributeAdmission's use side (Required)",
  },
  "AL4 data name": {
    rule: "attribute-admission",
    source:
      "reading 13 of docs/spec-readings.md: https://www.imsglobal.org/spec/qti/v3p0/info#Derived_DataHTML5Extension (§7.11, DataHTML5Extension: its pattern 'Default = \"(data-)[a-zA-Z0-9_\\-\\.]+\"', and 'contains no uppercase ASCII letters'), the stricter of the two on each point (readings 16 and 17): a data-* attribute's name is data-[a-z0-9_.-]+, and a no-namespace name of an element that is not foreign never begins data- (vocab/open.ts dataName, attributes.ts AL4_data_name)",
  },
  "AL4 declared data name": {
    rule: "attribute-admission",
    source:
      "goal part E: a data- name QTI declares is that attribute, never a custom one; reading 13",
  },
  "AL4 open name key": {
    rule: "attribute-admission",
    source:
      "fin.md D2 and Namespaces in XML 1.0 §6.3: an open-class attribute keeps its exact name, its expanded name its element's at most once, OpenAttribute's key (package, path, start, uri, local); reading 13",
  },
  "AL4 open names": {
    rule: "attribute-admission",
    source:
      "fin.md D2, an open-class attribute keeps its exact name: an Attribute's name is no open class, and an OpenAttribute's class is one; reading 13",
  },
  "AL5 attribute count": {
    rule: "attribute-count",
    source:
      "readings 41 and 43 (attributes.ts attributeCounts): https://www.w3.org/TR/speech-synthesis11/#S3.1.6 (SSML 1.1 §3.1.6, meta: 'Either a name or http-equiv attribute is required. It is an error to provide both name and http-equiv attributes'); https://www.w3.org/TR/speech-synthesis11/#S3.2.1 and #S3.2.4 (§3.2.1, voice, and §3.2.4, prosody: 'Although each attribute individually is optional, it is an error if no attributes are specified'), counting what §2.2.1's fragment removal keeps: SSML's own attributes, xml:lang and xml:base",
  },
  "Adaptive feedback": {
    rule: "adaptive-feedback",
    source:
      "https://www.imsglobal.org/spec/qti/v3p0/info#Data_FeedbackBlock (§5.49, FeedbackBlock, and §5.52, FeedbackInline: 'A feedback element that forms part of a Non-adaptive Item must not contain an interaction object, either directly or indirectly'), plan §1.7 O3 (Q5.09): a non-adaptive item binds no response variable whose interaction stands inside feedback, select(BoundVariable, response, adaptive = false) contained in the interactions outside every feedback flag",
  },
  "AreaMapping base type": {
    rule: "mapping-base-type",
    source:
      "https://www.imsglobal.org/spec/qti/v3p0/info#Data_AreaMapping (§5.5, the AreaMapping class: 'A special class used to create a mapping from a source set of point values to a target set of float values'): an area mapping's response declaration is no record, which has no base type, and is of base type point where it has one (overlay-queries/declaration.ts AreaMapping_base_type)",
  },
  "Aria value range": {
    rule: "aria-value-range",
    source:
      "https://www.imsglobal.org/spec/qti/v3p0/info#DataCharacteristic_ARIABase.Attr_aria-valuemax (§5.2.31, and §7.1.31 of ARIABaseEmpty: 'Authors MUST ensure the value of 'aria-valuemax' is greater than or equal to the value of 'aria-valuemin''), both read as xs:decimal, as the XSD types them, each collapsed value in xs:decimal's lexical space read as the decimal XML Schema 1.1's decimalLexicalMap maps it to (Part 2 §3.3.3.1; grizzle's Compute.parseDecimal), exactly and of any digits, a pair with a value outside it not judged, since its value domain alone refuses it (interactions.ts AriaRange); reading 91 makes the MUST a law",
  },
  Arity: {
    rule: "P2",
    source:
      "https://www.imsglobal.org/spec/qti/v3p0/info#Abstract_ExpressionGroup (§6.9, ExpressionGroup: each operator's attribute is of a container class whose logic attribute's multiplicity is its sub-expression count, §5.83.1 Logic0toMany '[0.. unbounded]', §5.84.1 Logic1toMany and §5.94.1 NumericLogic1toMany '[1.. unbounded]', §5.85.1 LogicPair '[2]' and §5.86.1 LogicSingle '[1]', or of its own class, whose logic attribute states its count, as §5.113.2 Repeat's '[1.. unbounded]' with §5.113's 'The repeat operator takes one or more sub-expressions', over §6.9.49's '0 or more'; a leaf class's children row reads 'There are no children.'; as §6.9.21, https://www.imsglobal.org/spec/qti/v3p0/info#AbstractAttribute_ExpressionGroup_qti-match, 'The match operator takes two sub-expressions') (expression.ts OperatorArity); reading 21",
  },
  "Attribute prefix": {
    rule: "attribute-admission",
    source:
      "reading 47 (an xsi: attribute is exported byte for byte, C54), with https://www.w3.org/TR/xml-names/#ns-decl (Namespaces in XML 1.0 §3: 'The prefix xml is by definition bound to the namespace name http://www.w3.org/XML/1998/namespace … Other prefixes MUST NOT be bound to this namespace name'; 'The prefix xmlns is used only to declare namespace bindings') and https://www.w3.org/TR/xml-names/#defaulting (§6.2: 'The namespace name for an unprefixed attribute name always has no value'): every attribute keeps the prefix its name is written with, empty for a name in no namespace, xml for the XML namespace's, and neither empty, xml nor xmlns for an xsi:, xlink: or namespaced open name (attributes.ts Attribute_prefix)",
  },
  "AttributeEntity owner": {
    rule: "attribute-lexical",
    source: "XML 1.0 §4.1 (entity references in attribute values), kept unexpanded (plan §1.4)",
  },
  "Author credit": {
    rule: "package-credit",
    source:
      "an install's LOM policy (lom.ts QtiLom, EduLLM's collections decisions, out/collections/DECISIONS.md): the manifest's record states a lifeCycle contribute of LOMv1.0 role author with an entity (IEEE 1484.12.1-2002 2.3.1, 2.3.2), and every author's vCard has an EMAIL, a local part and a domain around one @ (RFC 2426 §3.3.2), the content's point person (decisions 7, 12 and 14; lom.ts PackageFact, PackageCredit, Author_credit)",
  },
  "Bank key": {
    rule: "bank-key",
    source:
      "the placement mandate, ruling 2 (owner 2026-11-17: a bank is a standalone section document whose stable identifier is the bank) and ruling 7 (a bank is (package, section identifier)): no two banks of one package share their root section's identifier, compared collapsed (tests.ts bankSections); https://www.imsglobal.org/spec/qti/v3p0/info#RootCharacteristic_AssessmentSection.Attr_identifier (§4.2.1) makes a section's identifier unique only 'within the test', and a bank has none, so this narrows the slot",
  },
  "Bank shape": {
    rule: "bank-shape",
    source:
      "spec reading 1's stated limit 'Bank shape' and the placement mandate, ruling 2 (owner 2026-11-17: a bank lists its interchangeable item refs and nothing else); CAT's adaptive section, the CAT 1.0 implementation guide §2.3 ('An adaptive section must not have nested subsections', 'must specify all the items in the item pool directly'): in an imsqti_section_xmlv3p0 document every element is its root qti-assessment-section or a qti-assessment-item-ref that root holds, each an optional slot of AssessmentSectionDType and AssessmentItemRefDType left empty, and a bank's item ref writes no required, fixed or category, which only a test's selection, ordering and outcome processing read (tests.ts 'Bank shape': every Node and Attribute outside that shape stands in a Document of another type)",
  },
  "Binding cardinality": {
    rule: "binding-fit",
    source:
      "https://www.imsglobal.org/spec/qti/v3p0/info#DataCharacteristic_ChoiceInteraction.Attr_max-choices (§5.30.2: 'If max-choices is greater than 1 (or 0) then the interaction must be bound to a response with multiple cardinality'), and the same sentence of max-choices (§5.66.1, §5.68.2, §5.107.3, §5.128.2) and max-associations (§5.8.2, §5.57.3, §5.59.2, §5.60.2, §5.89.2), reading 92; the Schematron's RESPONSEDEC rule 2 is the choice interaction's case; a most left unwritten reads its XSD default; reading 169: https://www.imsglobal.org/spec/qti/v3p0/info#Data_GapMatchInteraction (§5.57: 'The GapMatchInteraction must be bound to a response variable with base-type directedPair and either single or multiple cardinality, depending on the number of gaps'): a gap match with two or more gaps, its own and an included fragment's, binds a response of multiple cardinality",
  },
  "Binding declared": {
    rule: "binding-declared",
    source:
      "reading 75: https://www.imsglobal.org/spec/qti/v3p0/info#Data_ResponseDeclaration (§5.115: 'Response variables are declared by response declarations and bound to interactions in the itemBody'), https://www.imsglobal.org/spec/qti/v3p0/info#DataCharacteristic_BasePromptInteraction.Attr_response-identifier (§5.15.7, and §5.18.6, §5.19.6, §5.45.1 and §5.162.1, each of multiplicity [1]: 'The response variable associated with the interaction') and each interaction class's binding sentence, as https://www.imsglobal.org/spec/qti/v3p0/info#Data_ChoiceInteraction (§5.30: 'The ChoiceInteraction must be bound to a response variable with a base-type of identifier and single or multiple cardinality'): an interaction's response-identifier names a response declaration of its item; the text entry interaction's response-identifier is the XSD's IDREF (reading 14), every other interaction's, the extended text interaction's among them, an IdentifierDType this law resolves",
  },
  "Binding unique": {
    rule: "binding-unique",
    source:
      "reading 92: https://www.imsglobal.org/spec/qti/v3p0/info#Data_ResponseDeclaration (§5.115: 'Each response variable declared may be bound to one and only one interaction'): no two interactions of an item name one response variable",
  },
  BindingFit: {
    rule: "binding-fit",
    source:
      "each interaction class's binding sentence, its typed rows every pairing of the base types and cardinalities it names: https://www.imsglobal.org/spec/qti/v3p0/info#Data_ChoiceInteraction (§5.30: 'The ChoiceInteraction must be bound to a response variable with a base-type of identifier and single or multiple cardinality'), and https://www.imsglobal.org/spec/qti/v3p0/info#Data_HotTextInteraction (§5.66) and https://www.imsglobal.org/spec/qti/v3p0/info#Data_HotspotInteraction (§5.68) alike; https://www.imsglobal.org/spec/qti/v3p0/info#Data_InlineChoiceInteraction (§5.74: 'with a base-type of identifier and single cardinality only'); https://www.imsglobal.org/spec/qti/v3p0/info#Data_GraphicOrderInteraction (§5.61: 'with a base-type of identifier and ordered cardinality'); https://www.imsglobal.org/spec/qti/v3p0/info#Data_AssociateInteraction (§5.8) and https://www.imsglobal.org/spec/qti/v3p0/info#Data_GraphicAssociateInteraction (§5.59: 'with base-type pair and either single or multiple cardinality'); https://www.imsglobal.org/spec/qti/v3p0/info#Data_MatchInteraction (§5.89) and https://www.imsglobal.org/spec/qti/v3p0/info#Data_GapMatchInteraction (§5.57: 'with base-type directedPair and either single or multiple cardinality'); https://www.imsglobal.org/spec/qti/v3p0/info#Data_GraphicGapMatchInteraction (§5.60: 'with base-type directedPair and multiple cardinality'); https://www.imsglobal.org/spec/qti/v3p0/info#Data_SelectPointInteraction (§5.128) and https://www.imsglobal.org/spec/qti/v3p0/info#Data_PositionObjectInteraction (§5.107: 'with a base-type of point and single or multiple cardinality'); https://www.imsglobal.org/spec/qti/v3p0/info#Data_SliderInteraction (§5.134: 'with single cardinality with a base-type of either integer or float'); https://www.imsglobal.org/spec/qti/v3p0/info#Data_MediaInteraction (§5.92: the response variable 'must be of base-type integer and single cardinality'); https://www.imsglobal.org/spec/qti/v3p0/info#Data_DrawingInteraction (§5.44) and https://www.imsglobal.org/spec/qti/v3p0/info#Data_UploadInteraction (§5.165: 'with base-type file and single cardinality'); https://www.imsglobal.org/spec/qti/v3p0/info#Data_EndAttemptInteraction (§5.45: 'with base-type boolean and single cardinality'); https://www.imsglobal.org/spec/qti/v3p0/info#Data_TextEntryInteraction (§5.162: 'If the response variable has single cardinality the base-type must be one of string, integer or float') and https://www.imsglobal.org/spec/qti/v3p0/info#Data_ExtendedTextInteraction (§5.48: 'must be bound to a response variable of single, multiple, ordered or record cardinality', and otherwise of 'a base-type of string, integer or float'), whose record is RecordBindingFit's. The order interaction's class description (https://www.imsglobal.org/spec/qti/v3p0/info#Data_OrderInteraction, §5.97) states no binding, so it has no row and binds any type, as the custom interactions do (reading 172) (facets.ts typedFits, expression.ts BindingFit)",
  },
  "Card default entry": {
    rule: "card-default",
    source:
      "reading R9-a: https://www.imsglobal.org/spec/qti/v3p0/info#Data_CardEntry (§5.27.2, CardEntry's default: 'Only one of the CardEntry instances can have a default designation'): a card holds at most one entry whose default, an xs:boolean collapsed, is true or 1 (overlay-queries/catalog.ts CardDefault)",
  },
  "Card support": {
    rule: "card-support",
    source:
      "reading R9-a: https://www.imsglobal.org/spec/qti/v3p0/info#Data_Card (§5.26.1, Card's support: 'Use only one card for any particular named support in a catalog'): a catalog holds one card for each support, compared by its value, the form as written: an ext: name's SupportExtStringDType replace class admits no whitespace to change, and a listed support's xs:string is preserve (XML Schema Part 2 §4.3.6, the union member that holds it) (overlay-queries/catalog.ts CatalogSupport)",
  },
  "Catalog reference": {
    rule: "idref-target",
    source:
      "reading R9-a: https://www.imsglobal.org/spec/qti/v3p0/info#Data_Catalog (§5.28.1, a catalog's id, which §5.15.9's data-catalog-idref names): each IDREF token of a data-catalog-idref, an xs:IDREF, is the id of a qti-catalog of its assembly (reading 117: its document with every fragment spliced in and every document its assembly places whole), and no other ID of it (catalog.ts CatalogTarget, CatalogId)",
  },
  "Choice bounds": {
    rule: "choice-bounds",
    source:
      "reading 76: https://www.imsglobal.org/spec/qti/v3p0/info#DataCharacteristic_ChoiceInteraction.Attr_min-choices (§5.30.3: 'min-choices must be less than or equal to the limit imposed by max-choices'; §5.30.2: 'If max-choices is 0 then there is no restriction'), the same sentence for min-associations (§5.8.3, §5.57.2, §5.59.1, §5.60.1, §5.89.3), match-min (§5.7.9, §5.56.6, §5.58.6, §5.131.7), min-choices (§5.66.2, §5.68.1, §5.107.2, §5.128.1) and min-strings (§5.48.7, with reading 53's 0); reading 18: https://www.imsglobal.org/spec/qti/v3p0/info#DataCharacteristic_OrderInteraction.Attr_max-choices (§5.97.3, and §5.61.2 of the graphic order interaction: 'Used in conjunction with min-choices, if specified, max-choices must be greater than or equal to min-choices and must not exceed the number of choices available'; §5.97.2, §5.61.1: min-choices 'must not exceed the number of choices available. If unspecified, all of the choices must be ordered and max-choices is ignored'), with no 0 exemption, read only where min-choices is written (references.ts ChoiceBound's counted zero and ChoiceCount); the media interaction's plays by reading 9, the Schematron's rule 13Ba read by intent, max-plays 0 no limit (§5.92.3)",
  },
  "Choice identifier key": {
    rule: "choice-identifier-distinct",
    source:
      'reading 104: https://www.imsglobal.org/spec/qti/v3p0/info#DataCharacteristic_SimpleChoice.Attr_identifier (§5.132.1, and §5.7.1, §5.55.1, §5.56.1, §5.58.1, §5.65.1, §5.67.1, §5.73.1 and §5.131.1: \'This identifier must not be used by any other choice or item variable\', five classes naming their own noun) and https://www.imsglobal.org/spec/qti/v3p0/info#Derived_Identifier (§7.16: an identifier is \'a logical reference to another object in the item, such as an itemVariable or choice\'); reading 104 as amended: the four classes\' \'any other choice\' is read across classes, and the nine share one space of identifiers, the stricter normative reading: no two choices or hottexts of a document share an identifier, of one class or of two, a gap and a gap text included, whichever interactions hold them, nor two its assembly places, compared collapsed (interactions.ts key(on(Choice, "document", "kind", "identifier")), key(on(Hottext, "document", "identifier")) and their placed keys, and queries.ts key(on(ChoiceOrHottext, "document", "identifier")) and key(on(PlacedChoiceOrHottext, "assembly", "identifier")))',
  },
  "Choice not variable": {
    rule: "choice-identifier-distinct",
    source:
      "reading 104: https://www.imsglobal.org/spec/qti/v3p0/info#DataCharacteristic_SimpleChoice.Attr_identifier (§5.132.1 and the other choice classes' identifier: 'This identifier must not be used by any other choice or item variable'), https://www.imsglobal.org/spec/qti/v3p0/info#Derived_Variable (§7.47: a variable is one 'declared in a corresponding variable declaration or is one of the built-in variables'), https://www.imsglobal.org/spec/qti/v3p0/info#DataCharacteristic_ResponseDeclaration.Attr_identifier (§5.115.1, and §4.5.1 and §5.151.1: 'The identifiers of the built-in session variables are reserved. They are completionStatus, numAttempts and duration') and https://www.imsglobal.org/spec/qti/v3p0/info#Data_ContextDeclaration (§5.34: 'There is one built-in context variable named \"QTI_CONTEXT\" with record cardinality'): no choice or hottext bears the identifier of a declaration of its document, nor in an item that of a built-in variable, compared collapsed (queries.ts ChoiceOrHottext and PlacedChoiceOrHottext in UnclaimedName)",
  },
  "Condition type": {
    rule: "P21",
    source:
      "https://www.imsglobal.org/spec/qti/v3p0/info#DataAttribute_ResponseCondition_qti-response-if (§5.114.1, and §5.114.2 and §5.117 of the response branches, §5.99.1, §5.99.2 and §5.101 of the outcome branches, and §5.149.1, §5.149.2 and §5.154 of the template branches: each 'consists of an expression which must have an effective base-type of boolean and single cardinality'), and https://www.imsglobal.org/spec/qti/v3p0/info#Data_TemplateConstraint (§5.150: 'A templateConstraint contains an expression which must have an effective base-type of boolean and single cardinality') (expressions.ts Condition_type; the old checker's P21)",
  },
  "Context variable reference": {
    rule: "context-variable-ref",
    source:
      "https://www.imsglobal.org/spec/qti/v3p0/info#DataAttribute_PortableCustomInteraction_qti-context-variable (§5.106.6: 'This allows an item author to bind a context variable to the PCI instance'), https://www.imsglobal.org/spec/qti/v3p0/info#Data_ContextDeclaration (§5.34: 'Context variables, variables declared by context declarations', and 'There is one built-in context variable named \"QTI_CONTEXT\" with record cardinality') and the Schematron's rule 20Ba (reading 9): a PCI's qti-context-variable names QTI_CONTEXT or a declared context variable (references.ts ContentReference)",
  },
  "Data SSML": {
    rule: "attribute-lexical",
    source:
      "reading 177, over R7-a: https://www.imsglobal.org/sites/default/files/spec/qti/v3/data-ssml_infobind/imsqtiv3p0_datassml_v1p0_InfoBind.html#JSOND (Data-SSML 1.0 §3.4, Description of the JSON Schema, NORMATIVE): a closed data-ssml holds one JSON object whose members are among break, phoneme, prosody, say-as and sub, each an object of the string properties the schema lists for it (break: strength, time; phoneme: ph, alphabet, type; prosody: rate; say-as: interpret-as; sub: alias), with ph, interpret-as and alias required, strength, alphabet, type and interpret-as enumerated, and time and rate normalized strings; a name written twice is admitted and each value judged (RFC 8259 §4). The importer reads the JSON into rows and the database judges them (data-ssml.ts DataSsml, DataSsmlMember, DataSsmlProperty, Data_SSML; queries.ts RequiredSsmlProperty)",
  },
  "Declaration base type": {
    rule: "declaration-type",
    source:
      "https://www.imsglobal.org/spec/qti/v3p0/info#RootCharacteristic_OutcomeDeclaration.Attr_base-type (§4.5.3, and §5.34.3, §5.115.3, §5.151.3: 'The value space from which the variable's value can be drawn (or in the case of containers, from which the individual values are drawn) is identified with a base-type', 'Variables with record cardinality have no base-type'): a record declares no base type (no DeclarationBaseType beside its DeclarationCardinality, a rule over their join), and every other variable writes one, each judged from the declaration's DeclarationCardinality where its cardinality spells a code; a base-type written but spelling nothing is its value domain's alone (spec reading 158)",
  },
  "Declaration key": {
    rule: "declaration-key",
    source:
      "reading 74: https://www.imsglobal.org/spec/qti/v3p0/info#RootCharacteristic_OutcomeDeclaration.Attr_identifier (§4.5.1, and §5.34.1, §5.115.1, §5.151.1: 'All item variables declared in an item share the same namespace'); a response's and a context's identifier is a UniqueIdentifier (§5.115.1, §5.34.1; §7.43: 'unique within the scope of the instance'), though the 3.0.1 XSD types the context's an IdentifierDType, an xs:NCName, so DocumentId key counts it among the IDs",
  },
  "Declaration not reserved": {
    rule: "declaration-reserved",
    source:
      "reading 72: https://www.imsglobal.org/spec/qti/v3p0/info#RootCharacteristic_OutcomeDeclaration.Attr_identifier (§4.5.1, §5.115.1, §5.151.1: 'The identifiers of the built-in session variables are reserved. They are completionStatus, numAttempts and duration'), each spelled exactly, with no alias, the identifier compared collapsed (references.ts BuiltInVariable, its session variables); reading 168: a test's processing holds duration and neither of the other two (§2.2.2, reading 29), so an item's declaration names none of the three and a test's declaration only duration, and a test's own numAttempts and completionStatus shadow no built-in and are accepted (declarations.ts itemSessionVariables and testSessionVariables, by the declaration's parent kind); the context variable QTI_CONTEXT is Reserved type's",
  },
  "Declaration overlay": {
    rule: "reachability",
    source:
      "plan §1.7 O2 and the W5 amendment's C18, under decision S3: a declaration, a value set and a value store nothing of their own: a set's and a value's place is its node's parent, which every law that pairs a set, a value or a field with its declaration reads through Node, a rule over a query; a declaration's kind is its element's, which the views of QtiViews read as a DeclarationKind, Declares of it; and its identifier, cardinality and base-type, a value's field-identifier and base-type, are its attributes' values, which no row copies: the views read each from Attribute (qti/names.ts), a code by its lexical relation (C17), present exactly where its element writes it and it spells something (Q5.08; spec readings 157 and 158), so a name has a type exactly where its declaration has one, and a record, which has no base type, is judged by its cardinality alone (AGENTS.md, Schema intent: a value that may be missing is a row of its own relation, or of a query; lane NIL's audit, B12); an outcome's mastery-value, normal-minimum and normal-maximum are each a row of its own (MasteryValue, NormalMinimum, NormalMaximum), its lexical form copied exactly where its element writes it, a normal-minimum it does not write being its XSD default (reading 149), and each pair of them Mastery range orders their join",
  },
  "Deletion version": {
    rule: "deletion-version",
    source:
      "an install's LOM policy (lom.ts QtiLom, EduLLM's collections decisions, out/collections/DECISIONS.md): a package is exactly one of a revision with content, whose manifest lists a resource, and a deletion version, whose manifest lists none (IMS CP 1.2, Resource 0..unbounded; QTI's CP profile, resource minOccurs=\"0\") and whose record's lifeCycle status is LOMv1.0 unavailable, 'the learning object itself is not available' (IEEE 1484.12.1-2002 2.2); so a withdrawn package holds no content and a package of no content is withdrawn (decisions 6b and 28; lom.ts PackageRevision)",
  },
  "Dependency target": {
    rule: "idref-target",
    source:
      'IMS Content Packaging 1.2: a dependency\'s identifierref names a resource of its manifest, contained(on(Dependency, "package", "start"), on(DependencyResolved, "package", "start")): every dependency has its DependencyResolved row, the resource whose collapsed identifier its collapsed identifierref is (overlay-queries/package.ts Dependency, DependencyResolved) (Q5.06)',
  },
  Document: {
    rule: "reachability",
    source:
      "the XDM document node as the Document row (plan §1.4), and its XML declaration as rows of their own, written where the document writes each part: XmlDecl where it writes a declaration, EncodingDecl and SdDecl where the declaration writes an encoding or a standalone, each a declaration's (https://www.w3.org/TR/xml/#NT-XMLDecl, XML 1.0 §2.8: \"XMLDecl ::= '<?xml' VersionInfo EncodingDecl? SDDecl? S? '?>'\") (chardata.ts)",
  },
  "Document entry": {
    rule: "entry-kind",
    source:
      "IMS Content Packaging 1.2: a listed document is an entry of the package, and one document: a resource names the document at its href, read as a document of its type (reading 93), so no path is listed as documents of two types (qti/package.ts, Document's key over package and path)",
  },
  "Document lang": {
    rule: "document-lang",
    source:
      "https://www.imsglobal.org/sites/default/files/spec/qti/v3/md-bind/index.html (QTI 3.0 Metadata §2.7.1.3, Language: 'There must be one value for each of the languages referred to by the language attributes on the associated assessmentItem, test or object bank and its 'bodyElements'', normative by its §1.2; ~/.cache/qti-pie/qti-md-bind/index.txt:1509 and :388): each language an item's or a test's xml:lang states (XML 1.0 §2.12, the empty one stating none) is listed by every general category of each record of the resource whose href names the document (queries.ts DescribedLang and DescribedAssembledLang, over namingGenerals); xml:lang compared by its collapsed xs:language value and the LOM language as written, both as tags without regard to case (RFC 5646 §2.1.1); reading R9-c: a catalog is outside the content body (information model §5.28: 'outside the content body node'), so the xml:lang of a catalog's cards, entries and HTML content is not counted (identity.ts CatalogScope)",
  },
  "DocumentId key": {
    rule: "document-key",
    source:
      "XML Schema Part 1, Validation Rule: Validation Root (the ID/IDREF table): no id's [binding] has more than one member, an attribute's binding its element, an ID-typed element text's its parent (§3.15.5; reading 101; identity.ts IdBinding); reading 14; reading 74: a context declaration's identifier, a UniqueIdentifier (https://www.imsglobal.org/spec/qti/v3p0/info#DataCharacteristic_ContextDeclaration.Attr_identifier, §5.34.1), is one of the document's IDs, though the 3.0.1 XSD types it an IdentifierDType; and IMS Content Packaging 1.2: the manifest's and its resources' identifiers, xs:IDs of imsmanifest.xml (imsqtiv3p0p1_imscpv1p2_v1p0.xsd lines 272 and 346), are one ID space, so a resource of its manifest's identifier is a second member of that binding",
  },
  "Double bound": {
    rule: "attribute-lexical",
    source:
      "XML Schema Part 2's minInclusive and minExclusive on a double's value (XML Schema 1.1 Part 2 §3.3.5.2, doubleLexicalMap: a literal rounds to its IEEE value, a magnitude below 2^-1075 to a zero of its sign, and -0 equals 0): NonNegativeDoubleDType's minInclusive 0.0 (imsqti_asiv3p0_v1p0.xsd:24034-24038, imsqti_asiv3p0p1_v1p0.xsd:24120-24124) and reading 16's minExclusive 0 for normal-maximum; reading 144",
  },
  "E1 derived": {
    rule: "derived",
    source:
      "fin.md §17, E1: the fields closed relations determine, and the string value (folds.ts)",
  },
  "Entry family": {
    rule: "reachability",
    source:
      "plan §1.6: the package's entries, one per path, Entry's key (package, path), each its package's; a set, since IMS Content Packaging 1.2 gives an entry's place in the zip no meaning",
  },
  "Entry kind": {
    rule: "reachability",
    source:
      "IMS Content Packaging 1.2 (imscp_infov1p2pd2.txt:409, InterchangePackage (b)): every file of a package is an entry, and each is exactly one of a document, held as its tree alone, and a media file, held as the SHA-256 of its bytes, which a content-addressed store holds under it; the database holds no file's bytes (package.ts Entry, EntryKind, Media: alternatives(Entry, kind, EntryKind, { document: Document, media: Media }))",
  },
  "Entry used": {
    rule: "entry-used",
    source:
      "a package-media install's policy (#pantry/db/install.ts, policy.json): every entry is the manifest, a document or the path a reference or a text reference resolves to in the package (package.ts Document, ReferencePath, TextReferencePath), the converse of File exists, so the files the install serves are exactly those its documents name; IMS Content Packaging 1.2 (imscp_infov1p2pd2.txt:409 and :411, InterchangePackage (b) and (d)) requires every file the manifest or a document names to be in the package and never the reverse, so this package's own install, which reads packages as the specifications do, states no such law (media.ts Entry_used over UnusedEntry)",
  },
  "Equal tolerance": {
    rule: "P36",
    source:
      "reading 121: https://www.imsglobal.org/spec/qti/v3p0/info#DataCharacteristic_Equal.Attr_tolerance (§5.46.2: 'If the tolerance mode is absolute or relative then the tolerance must be specified. The tolerance consists of two positive numbers, t0 and t1, that define the lower and upper bounds. If only one value is given it is used for both') and #DataModel_ToleranceList (§9.1.5: 'a space separated list of either strings (must not contain a space) or numbers'): a qti-equal whose tolerance-mode is absolute or relative writes tolerance, every tolerance holds one or two values, and each value in xs:double's lexical space is above 0, a string naming a variable read at run time (operators.ts Tolerance, toleranceRequired, Equal_tolerance)",
  },
  "Feedback outcome type": {
    rule: "feedback-ref",
    source:
      "reading 77: https://www.imsglobal.org/spec/qti/v3p0/info#DataCharacteristic_FeedbackBlock.Attr_outcome-identifier (§5.49.1, and §5.52.1, §5.93.1, §5.148.1, §5.157.2: 'The identifier of an outcome variable that must have a base-type of identifier and be of either single or multiple cardinality'); the built-in completionStatus is 'a single identifier' (§2.2.2.3)",
  },
  "Feedback reference": {
    rule: "feedback-ref",
    source:
      "reading 77: https://www.imsglobal.org/spec/qti/v3p0/info#DataCharacteristic_FeedbackBlock.Attr_outcome-identifier (§5.49.1, and §5.52.1, §5.93.1, §5.148.1, §5.157.2: 'The identifier of an outcome variable that must have a base-type of identifier and be of either single or multiple cardinality'), the built-in completionStatus among them (§2.2.2.3: 'a single identifier'); the outcome's base type and cardinality are Feedback outcome type's (references.ts ContentReference)",
  },
  "File exists": {
    rule: "file-exists",
    source:
      "imscp_infov1p2pd2.txt:409 and :411 (IMS Content Packaging 1.2, InterchangePackage (b): 'Any file described in the Manifest using a URI that resolves to a location within the InterchangePackage shall be included in the InterchangePackage'; (d): 'When a file contained in an InterchangePackage references another file using a URI that resolves to a location within the InterchangePackage, the referenced file shall be described in the InterchangePackage's Manifest'): a cp:file's href that resolves in the package names an entry, an external one left out (reading 35), and so does each reference a document resolves in the package (readings 102 and 103, package.ts ReferencePath), and each card file and resource icon a document resolves in the package (reading R9-b, package.ts TextReferencePath)",
  },
  "File listed": {
    rule: "file-listed",
    source: "IMS Content Packaging 1.2 and QTI packaging: every file is described; reading 33",
  },
  "Foreign attribute class": {
    rule: "attribute-admission",
    source:
      "XML Schema 1.0 Part 1 §3.10.4 (Wildcard allows Namespace Name), with Namespaces in XML 1.0 §2 for the absent namespace: an open attribute's class agrees with its stored namespace against its element's",
  },
  "Foreign element class": {
    rule: "unmodeled-vocabulary",
    source:
      "XML Schema 1.0 Part 1 §3.10.4 (Wildcard allows Namespace Name), with Namespaces in XML 1.0 §2 for the absent namespace: a foreign element's class agrees with its stored namespace against its parent's; and Namespaces in XML 1.0 §5 (Namespace constraint: No Prefix Undeclaring) with §6.2, a name in no namespace is unprefixed, so a no-namespace element is written with no prefix (C4)",
  },
  "Foreign simple content": {
    rule: "child-set",
    source:
      "reading 60: https://www.w3.org/TR/xmlschema-1/#cvc-type (XML Schema 1.0 Part 1 §3.3.4, Element Locally Valid (Type), clause 3.1.2: an element a simple type governs holds no element child), over each foreign element whose xsi:type names a simple type (attributes.ts Governor, TypeText); its attributes are AL1's under the governor, the four xsi: names alone (clause 3.1.1), and its text TextDomain's under the type (clause 3.1.3)",
  },
  "Fragment context": {
    rule: "fragment-context",
    source:
      "reading 117: https://www.imsglobal.org/spec/qti/v3p0/info#AbstractAttribute_FlowGroup_include (§6.15.8, and the include attribute of each class §9.4.1 lists: 'This provides the insertion of markup from external files. … When using XML this is achieved using the 'XInclude' approach') and https://www.w3.org/TR/xinclude-11/#creating-result (XInclude 1.1 §4.7: 'The result infoset is a copy of the source infoset, with each xi:include element processed as follows'): an included fragment's content is judged in place, as the including document's result infoset holds it; it is one written element per node, judged under the union of the ancestries of the includes that place it and under one nearest interaction; a fragment two includes place inside different interactions, or one inside an interaction and one outside, would need two rows per node, so it is refused: a stated limit of the representation, not a law of the specification",
  },
  "Graphic gap match default hotspot": {
    rule: "hotspot-default",
    source:
      "reading 80: https://www.imsglobal.org/spec/qti/v3p0/info#DataAttribute_GraphicGapMatchInteraction_qti-associable-hotspot (§5.60.9: 'The default hotspot must not be defined')",
  },
  "Href form": {
    rule: "href-form",
    source:
      "reading 102 (overlays/package.ts Limit): every href is resolved before its row is written, its value read by its whitespace class, its path merged with the xml:base in scope or its document's path, its dot segments removed and each segment percent-decoded (RFC 3986 §2.1, §5.2 and §6.2.2.2); a path with a scheme, a leading /, a climb above the package root or an external base is external (reading 35), admitted and never resolved where a cp:file or a content reference holds it, and refused where a law needs the href to name an entry; an empty path names its own document (§4.4). What stays refused is a stated limit of the representation, not a law of the specification: a % that starts no percent-encoding, octets that spell no UTF-8, a segment that decodes to / or U+0000, a backslash, a tab, line feed or carriage return a preserving type keeps, and a : in the first segment of a path with no scheme; a srcset's image candidates are each read by its URL, as any href (HTML, 'parse a srcset attribute')",
  },
  "Href listed": {
    rule: "href-listed",
    source:
      "imscp_infov1p2pd2.txt:770 (IMS Content Packaging 1.2, §6.6.2: 'A file reference declared in a Resource{ Href } shall have an associated declaration in a File object in the same Resource'): a resource href names the file one of its own files names, compared by resolved path in the package and as written outside it, its launch parameters aside (reading 102)",
  },
  "Idref target": {
    rule: "idref-target",
    source:
      "XML Schema Part 1, Validation Rule: Validation Root (the ID/IDREF table): an IDREF names an ID of its document, an attribute's tokens and an IDREF- or IDREFS-typed element text's alike (§3.15.5; reading 101); reading 14; reading 2 and https://www.w3.org/TR/MathML3/chapter4.html#contm.share (MathML 3 §4.2.7: a share's src names 'the id attribute of the root node of the expression tree' it stands for): a same-document fragment of an m:share's src, a # and the characters after it, names an ID of its document as an IDREF token does, and a src that is no fragment is reading 103's file reference, which is not read here (operator decision 321)",
  },
  "Include fragment identifier": {
    rule: "include-href",
    source:
      "reading 115: https://www.w3.org/TR/xinclude-11/#include_element (XInclude 1.1 §3.1, href: 'Fragment identifiers must not be used; their appearance is a fatal error'): an xi:include's href carries no #, wherever it stands after the path",
  },
  "Include root": {
    rule: "include-root",
    source:
      "reading 114: https://www.imsglobal.org/spec/qti/v3p0/info#Imported_Include (§9.4.1, Include's parent classes, and 'This denotes the use of the XInclude feature [XInclude, 16]'), https://www.imsglobal.org/spec/qti/v3p0/info#AbstractAttribute_FlowGroup_include (§6.15.8 and its siblings: 'This provides the insertion of markup from external files') and https://www.w3.org/TR/xinclude-11/#docii (XInclude 1.1 §4.2.1: an included document's 'set of top-level included items is the children of the acquired infoset's document information item'): an include under a parent whose model holds one stands for its fragment's root, which is one of its particle's choice-group alternatives, a kind whose position the parent's automaton follows and ends on as the include's",
  },
  "Include target": {
    rule: "include-target",
    source:
      "reading 115: https://www.imsglobal.org/spec/qti/v3p0/info#Imported_Include (§9.4.1: 'This denotes the use of the XInclude feature [XInclude, 16]'); https://www.w3.org/TR/xinclude-11/#include_element (XInclude 1.1 §3.1: 'If the href attribute is absent when XML processing is specified, the xpointer or fragid attribute must be present', and reading 85 refuses xpointer, and the pinned XInclude.xsd declares no fragid), https://www.w3.org/TR/xinclude-11/#xml-included-items (§4.2: 'Resources that are unavailable for any reason … result in a resource error') and https://www.w3.org/TR/xinclude-11/#fallback_element (§3.2: 'If the xi:fallback element is missing, a resource error results in a fatal error'): an include the information model reads names, by an href this representation resolves, a document its package lists; one that holds a fallback is refused alike, since the representation applies no fallback, a stated limit; an include whose href is external (reading 102) names a resource the package does not hold, and is admitted, stored as written and never fetched",
  },
  "Inclusion cycle": {
    rule: "inclusion-cycle",
    source:
      "reading 85: https://www.w3.org/TR/xinclude-11/#loops (XInclude 1.1 §4.2.7: 'it is a fatal error to process another xi:include element with an include location and xpointer attribute value that have already been processed in the inclusion chain'), the XInclude https://www.imsglobal.org/spec/qti/v3p0/info#Imported_Include (§9.4.1) names: no chain of xi:include hrefs, over the documents the manifest lists, returns to a document already on it",
  },
  "Item key": {
    rule: "item-key",
    source:
      "https://www.imsglobal.org/spec/qti/v3p0/info#RootCharacteristic_AssessmentItem.Attr_identifier (§4.1.1: 'The principal identifier of the item. This identifier must have a corresponding entry in the item's metadata'), an IdentifierDType that QTI makes unique nowhere: no two assessment objects of one package share an identifier, compared collapsed (metadata.ts ObjectIdentifier), so an item is (package, identifier), QTI's own identity, which a ledger's item sessions are held to (out/placement MANDATE ruling 7, owner 2026-11-17); a narrowing of the identifier's slot, never a new attribute",
  },
  "Item ref identifier": {
    rule: "item-ref-identifier",
    source:
      "https://www.imsglobal.org/spec/qti/v3p0/info#Root_AssessmentItem (§4.1.1, info301:6346: 'When an Item is referenced using a 'qti-assesasment-item-ref' the values of the two 'identifier' characteristics MUST be the same'): a bank member's identifier is its item's, both compared collapsed, so a member is its item (queries.ts BankMember into metadata.ts ObjectIdentifier); a bank holds each item once, so the rule holds without the conflict §5.6.1's repeated references raise in a test",
  },
  "Item ref target": {
    rule: "item-ref-target",
    source:
      "the UP audit's B2: https://www.imsglobal.org/spec/qti/v3p0/info#DataCharacteristic_AssessmentItemRef.Attr_href (§5.6.5: 'The URI used to refer to the item's file (e.g., elsewhere in the same content package)', info.txt:12356): an item ref's href names a document of the package, and that document's root is an item (queries.ts ItemRefTarget)",
  },
  "Key text bound": {
    rule: "key-text-bound",
    source:
      "src/qti/limits.ts: a text a key, a containment or a family's hidden columns hold takes its kind's one bound, the least every key of the kind leaves it under grizzle's representability rule, PostgreSQL's BTMaxItemSize (nbtree.h): a key text (keyText) at most keyTextBytes UTF-8 bytes, a namespace name (namespaceText) at most namespaceBytes, a local name at most localNameBytes, each what grizzle's keyTextBytes leaves beside its widest key's other fields; a stated limit of the representation, not a law of the specification",
  },
  "LOM learning resource type": {
    rule: "lom-learning-resource-type",
    source:
      "reading 122: https://www.imsglobal.org/sites/default/files/spec/qti/v3/md-bind/index.html (QTI 3.0 Metadata §2.7.5.1, Learning Resource Type: 'the LOM-defined values self assessment and exam are forbidden', normative by its §1.2): a learningResourceType of the LOM vocabulary holds neither, its term the LOM vocabulary's where its source is LOMv1.0, empty, or not written, which the loose binding defaults to LOMv1.0 (imsmd_loose_v1p3p2.xsd:1288); a term of another source is another vocabulary's, which the loose binding does not enforce (§3.6), and is not refused; source and value compared collapsed (queries.ts ForbiddenResourceType contained in OtherVocabularyType, over the learning resource type's folded lom:value and lom:source)",
  },
  "LOM vCard": {
    rule: "lom-vcard",
    source:
      "an install's LOM policy (lom.ts QtiLom, EduLLM's collections decisions, out/collections/DECISIONS.md): every contribute's entity in a record is a vCard 3.0 (IEEE 1484.12.1-2002 2.3.2 and 3.2.2, 'vCard, as defined by IMC vCard 3.0 (RFC 2425, RFC 2426)'), its first line BEGIN:VCARD and its last END:VCARD (RFC 2426 §5), with a VERSION:3.0 (§3.6.9), an N (§3.1.2) and an FN that names someone (§3.1.1), the properties RFC 2426 says 'MUST be present', each line's name compared without regard to case after an optional group (RFC 2425 §5.8.2); 1EdTech's own example writes no N and no VERSION (lom.ts LOM_vCard)",
  },
  "LOM vocabulary": {
    rule: "lom-vocabulary",
    source:
      "an install's LOM policy (lom.ts QtiLom, EduLLM's collections decisions, out/collections/DECISIONS.md): QTI 3.0 Metadata §3.6, a 'loose' binding that 'does not enforce any of the default enumerated vocabularies', narrowed: in every record a status's, a role's, a relation kind's and a classification purpose's source is LOMv1.0, written, empty or absent (the binding's default=\"LOMv1.0\", imsmd_loose_v1p3p2.xsd lines 1260, 1392, 1468 and 1513, reading 122), and each value is one of its vocabulary's tokens exactly: IEEE 1484.12.1-2002 2.2, 2.3.1 with 3.2.1's creator (a lom:value row cannot tell a lifeCycle role from a metaMetadata one), 7.1 with QTI 3.0 Metadata §2.7.7.1's precludes under LOMv1.0, which narrows LOM §4.4's guidance that only a value outside the standard should have another source, and 9.1 (lom.ts LOM_vocabulary)",
  },
  "Label tools": {
    rule: "label-tool",
    source:
      "https://www.imsglobal.org/spec/qti/v3p0/info#DataCharacteristic_BaseSequence.Attr_label (§5.16.5, and §5.15.5, §5.17.5 to §5.21.5 and §5.79.4: 'If an item uses labels then values for the associated toolName and toolVersion characteristics must also be provided'), of the label of each kind whose type takes it from one of those classes (labels.ts toolLabelKinds), and not of ItemFileInfo's ('A human readable label/short description for the file', §5.80.2) or PrintedVariable's ('such as would be appropriate for a tooltip', §7.30.4), which state none; reading 128: https://www.imsglobal.org/sites/default/files/spec/qti/v3/info/imsqti_asi_v3p0p1_infomodel_v1p0.html (QTI 3.0.1 §4.1.3, the item's label: 'If an item uses labels then values for the associated toolName and toolVersion attributes must also be provided'; ~/.cache/qti-pie/qti301/info301.txt:6420) of an item root's own label, AssessmentItemDType's (labels.ts toolLabelTypes); the sentence binds an item, not a stimulus or a test",
  },
  "Literal lexical": {
    rule: "attribute-lexical",
    source:
      "https://www.imsglobal.org/spec/qti/v3p0/info#Enumerated_BaseTypeEnum (§8.13, BaseTypeEnum, each base type's value set): a qti-base-value's text is a lexical form of its base-type, the same language as Typed value's (expression-types.ts BaseTypePattern; readings 7, 34, 45 and 71)",
  },
  LomObjectIdentifier: {
    rule: "lom-identifier",
    source:
      "https://www.imsglobal.org/sites/default/files/spec/qti/v3/md-bind/index.html (QTI 3.0 Metadata §2.7.1.1, Identifier: 'One of the values given for the identifier must have an entry that matches the identifier of the associated item, test or object bank', normative by its §1.2), over the general category's identifiers alone; info §4.1.1 and §4.4.1 ('MUST be the same'); reading 62 as UP's audit merges it (docs/research/up.md §2.2), the entry compared collapsed",
  },
  LomObjectTitle: {
    rule: "lom-title",
    source:
      "https://www.imsglobal.org/sites/default/files/spec/qti/v3/md-bind/index.html (QTI 3.0 Metadata §2.7.1.2, Title: 'The title must have a value that matches the value of the title attribute of the associated item, test or object bank. The language used to interpret the title is taken from the language attribute of the associated item, test or object bank', normative by its §1.2); info §4.1.2 and §4.4.2; reading 62 as UP's audit merges it (docs/research/up.md §2.2). Titles compare in xs:normalizedString's value space and language tags without regard to case (RFC 5646 §2.1.1; metadata.ts)",
  },
  "Lookup table cardinality": {
    rule: "lookup-cardinality",
    source:
      "https://www.imsglobal.org/spec/qti/v3p0/info#RootAttribute_OutcomeDeclaration_lookupTable (§4.5.13: a lookup table maps 'a numeric source value to a single outcome value in the declared value set'): a qti-match-table's or qti-interpolation-table's outcome declaration is of single cardinality (mapping.ts Lookup_table_cardinality)",
  },
  "Lookup type": {
    rule: "P22",
    source:
      "https://www.imsglobal.org/spec/qti/v3p0/info#DataAttribute_LookupOutcomeValue_expressionGroup (§5.87.2: 'An expression which must have single cardinality and an effective base-type of either integer, float or duration. Integer type is required when the associated table is a matchTable'), looked up in the outcome's table (§5.87: 'in the lookupTable associated with the outcome's declaration') (expressions.ts Lookup_type; the old checker's P22)",
  },
  "Manifest overlay": {
    rule: "reachability",
    source:
      "plan §1.6 and the W5 amendment's C18, under decision S3: each manifest overlay (ResourceHref, File) is its element's row, keyed by its node, and holds its own facts alone: it stands at a node of its kind (a constant pin) exactly where its href is written and holds its resolution, never its form, and a file's resource is its node's parent, which its laws read through Node; the manifest's identifier is its attribute's value (overlay-queries/package.ts manifestIdentifiers), one per package by the single root N5 admits (Q5.06)",
  },
  MappableBaseType: {
    rule: "mapping-base-type",
    source:
      "reading 78: https://www.imsglobal.org/spec/qti/v3p0/info#Data_Mapping (§5.88, the Mapping class: \"A special class used to create a mapping from a source set of any base-type (except file and duration) to a single 'float'\"), and its map response 'cannot be applied to variables of record cardinality' (§2.11.1.5): a mapping is of no record, judged by its cardinality alone, and of a base type MappableBaseType holds where its declaration has one (expression.ts MappableBaseType)",
  },
  "Mapped response": {
    rule: "P27",
    source:
      "https://www.imsglobal.org/spec/qti/v3p0/info#Derived_MapResponse (§7.22, MapResponse: it 'transforms it using the associated mapping, which must have been declared'; §6.9.46, MapResponsePoint: it takes 'a response variable that must be of base-type point, and transforms it using the associated areaMapping', which §5.115.7 says 'may only be present in declarations of variables with base-type point') (expressions.ts Mapped_response; the old checker's P27)",
  },
  "Mapping overlay": {
    rule: "reachability",
    source:
      "plan §1.7 O5 and the W5 amendment's C18: each O5 overlay (MapKey, LookupValue) is its element's row, keyed by its node: a map key names a map entry and copies its element's map-key attribute, and a lookup value its table entry's target-value or its table's default-value, each exactly where its element writes it (Q5.11); a mapping, an area mapping and a lookup table are their nodes, and each law over their declaration's cardinality or base type reads it through Node, where the declaration has one, a record's base type none (lane NIL's audit, B12; spec reading 158; decision S3)",
  },
  "Mastery range": {
    rule: "mastery-range",
    source:
      "reading 9: the Schematron's RULE SPECIFIC CLASS OUTCOMEDEC 1 (ASI 3.0.1 XSD, on qti-outcome-declaration: 'not(@mastery-value < @normal-minimum)', 'The mastery-value attribute value must not be less than the normal-minimum value'; 'not(@mastery-value > @normal-maximum)', 'The mastery-value attribute value must not be greater than the normal-maximum value'), read by its intent: each pair judged where both have a value, a normal-minimum an outcome declaration does not write being its XSD default 0.0 (reading 149), as xs:double values, each form collapsed as xs:double's whiteSpace collapses it (XML Schema Part 2 §4.3.6; reading 7) and, where it is in xs:double's lexical space (XML Schema 1.0's, reading 71's edition, operators.ts doublePattern), read as the double XML Schema 1.1's doubleLexicalMap maps it to (Part 2 §3.3.5.2, reading 144; grizzle's Compute.parseDouble), of any digits and any exponent, NaN ordered against nothing (declarations.ts doublesInOrder)",
  },
  "MathML align first": {
    rule: "ordering",
    source:
      "reading 2: https://www.w3.org/TR/MathML3/chapter3.html#presm.malign.group (MathML 3 §3.5.5.2: 'the first complete element must be an maligngroup element' in a table cell whose alignment groups are checked, a complete element being one with no element children); a cell is judged when it holds a group that stands where §3.5.5.2 lets it (the align placement law), and a group outside a cell or under an maction child that is not selected is not judged (§3.5.5.9)",
  },
  "MathML align placement": {
    rule: "admission",
    source:
      "reading 2: https://www.w3.org/TR/MathML3/chapter3.html#presm.malign.group (MathML 3 §3.5.5.2: an maligngroup in a table cell stands in the cell directly or inside an mrow or mstyle that changes no direction, mphantom, mfenced, the selected sub-expression of an maction, or semantics) and #presm.malign.mtable (§3.5.5.9); a group with no cell above it is ignored, only an maction's selected sub-expression is checked, and a change of direction is a dir other than the one the element inherits, so mrow dir='ltr' in a formula that reads left to right changes none (operator decision 321); m:math inherits none, since 'the dir attribute defaults to \"ltr\" on the math element' (MathML 3 §2.2.1, reading 164)",
  },
  "MathML arity": {
    rule: "math-arity",
    source:
      "reading 2 (expression.ts mathArities): https://www.w3.org/TR/MathML3/chapter4.html#contm.unary (MathML 3 §4.3.4.6: 'Unary operators take a single argument') and #contm.binary (§4.3.4.5: 'Binary operators take two arguments'), each operator's class from its syntax table in §4.4 (§4.1.5: the Class row 'indicate[s] how many arguments the operator represented by this element takes'); an apply with a qualifier or an interval beside its operator is not judged, and moment is left out, since §4.4.8.6's own example applies it to five arguments",
  },
  "MathML cn form": {
    rule: "attribute-lexical",
    source:
      "spec readings 2 and R6-hexdouble: https://www.w3.org/TR/MathML3/chapter4.html#contm.cn (MathML 3 §4.2.1: the content of a cn has the form its type implies, integer, real, double, hexdouble, e-notation, rational, complex-cartesian and complex-polar, split at m:sep; every other type is text), digits read in its base from 2 to 36; a part holding an element or an entity reference has its digits unjudged, and counts among the parts, and a base beyond the alphabet leaves the digits application specific (expression.ts cnForms and cnPatternOf)",
  },
  "MathML foreign element": {
    rule: "unmodeled-vocabulary",
    source:
      "MathML 3 RelaxNG mathml3-common.rnc: start = math (line 15) and anyElement = element (* - m:*) (line 61); MathML 3 §2.2, 'All other MathML content must be contained in a math element'; reading 2",
  },
  "MathML head qualifier": {
    rule: "admission",
    source:
      "spec reading R6-head-qualifiers (expression.ts mathHeadQualifiers) and MathML 3's §4.4 syntax tables: https://www.w3.org/TR/MathML3/chapter4.html#contm.root (§4.4.2.11), #contm.log (§4.4.7.7) and #contm.moment (§4.4.8.6) list degree, logbase and momentabout beside their operators; an apply whose first child is no built-in operator is not judged",
  },
  "MathML maction selection": {
    rule: "union-count",
    source:
      "reading 2: https://www.w3.org/TR/MathML3/chapter3.html#presm.maction (MathML 3 §3.7.1.1: 'If the value specified is out of range, it is an error' and 'If no selected sub-expression exists, it is a MathML error'): an maction has at least one element child and its selection, 1 when absent, is at most their number",
  },
  "MathML share cycle": {
    rule: "document-key",
    source:
      "reading 2: https://www.w3.org/TR/MathML3/chapter4.html#contm.share (MathML 3 §4.2.7, c4#contm.acyclicity: 'An element may not dominate itself'): an element dominates its children and, where it is an m:share whose src is a same-document fragment, the element that fragment names in its assembly (reading 117), per placement, so an m:share on a cycle of those edges is refused",
  },
  "Max strings required": {
    rule: "max-strings-required",
    source:
      "https://www.imsglobal.org/spec/qti/v3p0/info#DataCharacteristic_ExtendedTextInteraction.Attr_max-strings (§5.48.6: 'The max-strings characteristic is required when the interaction is bound to a response variable that is a container'): an extended text interaction bound to a multiple or ordered response writes max-strings, select(BindingCardinalityNode, response-identifier, extended text, multiple or ordered)(node) contained in select(CountBound, maxWritten)(node), a rule over a query (overlay-queries/interaction.ts, Q5.09)",
  },
  "Media data": {
    rule: "media-data",
    source:
      "a package-media install's policy (#pantry/db/install.ts, policy.json): no address carries a base64 payload, so no address uses the data: scheme, read as https://url.spec.whatwg.org/#concept-basic-url-parser reads a scheme (the leading C0 controls and spaces stripped, 'Remove all ASCII tab or newline from input', the scheme ASCII-lowercased): every attribute and element text whose domain is an xs:anyURI, and each token of xsi:schemaLocation's list (https://www.w3.org/TR/xmlschema-1/#xsi_schemaLocation) (media.ts Media_data)",
  },
  "Media entity": {
    rule: "media-entity",
    source:
      "a package-media install's policy (#pantry/db/install.ts, policy.json): nothing a player fetches by depends on an entity's replacement text the database never read. crust keeps an entity reference unexpanded only where its declaration may sit in an external subset or behind a parameter entity it does not read (https://www.w3.org/TR/xml/#entproc, XML 1.0 §4.4), and a player that reads the subset expands it, so a kept reference may hide an address, a srcset's second candidate or a style's url(: no fetched attribute, address list or style keeps one, no fetched text holds one, and no document type declaration names an external identifier, an external subset's, an entity's or a notation's (https://www.w3.org/TR/xml/#NT-ExternalID), which a player reading the declaration fetches from an address no law holds and whose declarations it applies to content the database judged without them (https://www.w3.org/TR/xml/#sec-external-ent, XML 1.0 §4.2.2; https://www.w3.org/TR/xml/#proc-types, §5.1) (media.ts Media_entity)",
  },
  "Media foreign": {
    rule: "media-foreign",
    source:
      "a package-media install's policy (#pantry/db/install.ts, policy.json): markup pantry keeps but cannot interpret could carry an address no other law of the policy reads, so a package-media install refuses every foreign element, whichever its namespace class, and every attribute of an open class but data-* (fin.md D2's foreign, no-namespace and own-namespace), keeping https://html.spec.whatwg.org/multipage/dom.html#embedding-custom-non-visible-data-with-the-data-*-attributes (media.ts Media_foreign)",
  },
  "Media path": {
    rule: "media-path",
    source:
      "a package-media install's policy (#pantry/db/install.ts, policy.json): every address a player fetches (#pantry/vocab/fetched.ts) names a file of the package, which file-exists holds to an entry: it is an attribute or a text the reference census resolves (ReferenceAttribute, textReferenceKinds), resolved in the package (HrefScope entry), and holds no scheme and starts with no / or \\ once the leading C0 controls and spaces are stripped and tabs and newlines removed, as https://url.spec.whatwg.org/#concept-basic-url-parser reads one; so a qti-file-href's text but a card's, and an attribute fetched under another kind's xsi:type governor, which no census resolves, are refused, and a qti-interaction-module's primary-path and fallback-path, census attributes since spec reading 201, name the file the loader loads, their path against the package's root with .js appended (media.ts Media_path)",
  },
  "Media source src": {
    rule: "source-src",
    source:
      "reading 124: https://www.imsglobal.org/spec/qti/v3p0/info#DataCharacteristic_Source.Attr_src (§5.135.1: 'The value must be a valid non-empty URL potentially surrounded by spaces. This characteristic must be present'), read in a media element as the HTML Standard it restates splits it (https://html.spec.whatwg.org/multipage/embedded-content.html#the-source-element: where 'The source element's parent is a media element', 'This attribute must be present'; where it is a picture element, 'The src attribute must not be present'): a source whose parent is an audio or a video carries src (html.ts Media_source_src)",
  },
  "Media style": {
    rule: "media-style",
    source:
      "a package-media install's policy (#pantry/db/install.ts, policy.json): no style attribute makes the player fetch, so none holds url(, @import, image-set( or src(, in any case, or a backslash, which begins an escape that could spell any of them (https://www.w3.org/TR/css-syntax-3/#consume-ident-like-token, https://www.w3.org/TR/css-syntax-3/#consume-escaped-code-point, https://www.w3.org/TR/css-cascade-4/#at-import, https://www.w3.org/TR/css-images-4/#image-set-notation, https://www.w3.org/TR/css-values-4/#urls) (media.ts Media_style)",
  },
  "Media type": {
    rule: "media-type",
    source:
      "a package-media install's policy (#pantry/db/install.ts, policy.json): every entry a fetched reference resolves to has an extension the policy's media record lists, matched case-sensitively, the text after the last . of its last segment where that . does not start the segment (https://nodejs.org/api/path.html#pathextnamepath), so the install knows the media type it serves the entry with (media.ts Media_type)",
  },
  "N1 one document node": {
    rule: "reachability",
    source: "XML 1.0 §2.1, one document entity; fin.md §12, entry 8",
  },
  "N1 sentinel": {
    rule: "reachability",
    source:
      "fin.md §12, entry 8: the document node is its own parent, document and nearest, at slot 0",
  },
  "N2 key": {
    rule: "reachability",
    source: "fin.md §5.2, the ordered family's key (parent, at)",
  },
  "N2 mirrors": {
    rule: "reachability",
    source: "fin.md §5.2, the ordered family: slots 0 to children − 1, each held",
  },
  "N2 tree": {
    rule: "reachability",
    source:
      'trees.md §2 to §4, T0 to T6: tree(on(Node, "parent", "at"), fin(Node, "children"), { root: "document" }), its key (parent, at), UNIQUE (document, start) and its interval checks (plan §1.3 N2, N9 and N10)',
  },
  "N4 kinds": {
    rule: "admission",
    source: "fin.md §17, the NodeKind roster",
  },
  "N5 Follow": {
    rule: "ordering",
    source:
      "XML Schema Part 1 §3.8, each content model as its Glushkov automaton (content.ts Follow; Bjorn's ruling of 2026-11-05)",
  },
  "N5 admitted": {
    rule: "admission",
    source: "the XSDs' content models as Admission (content.ts); reading 6 for wildcard content",
  },
  "N5 first slot": {
    rule: "ordering",
    source: "fin.md §4.3, each fold's identity at slot 0",
  },
  "N5 fold": {
    rule: "ordering",
    source: "fin.md §4.5a, the predecessor copy",
  },
  "N6 ancestry": {
    rule: "ancestry-ban",
    source:
      "fin.md §13 P3 and §16: the information model's nesting rules as Banned and Needs (ancestry.ts, facets.ts); readings 25 and 38",
  },
  "N7 Counted": {
    rule: "child-set",
    source:
      "XML Schema Part 1 §3.9 occurrence bounds of 2 to n, which a position automaton relaxes (content.ts Counted), and the loose LOM binding's Schematron caps: each element the binding bounds to one inside an unbounded choice stands at most once in its family (lom/imsmd_loose_v1p3p2.xsd:18-21 and 85-92, its 94 asserts at 93-911; reading 130)",
  },
  "N7 Last": {
    rule: "child-set",
    source:
      "XML Schema Part 1 §3.8, each content model as its Glushkov automaton (content.ts Last)",
  },
  "N7 barred by": {
    rule: "child-set",
    source:
      "the HTML Standard, colgroup: a span attribute bars col children (children.ts ChildBarredBy)",
  },
  "N7 empty family": {
    rule: "union-count",
    source: "fin.md §5.2, an empty family's end values are each fold's identity",
  },
  "N7 last slot": {
    rule: "union-count",
    source: "fin.md §5.2, the last-slot copy",
  },
  "N8 nearest": {
    rule: "owner-copy",
    source: "plan-qti-pie N8, the nearest interaction (fin.md §15, rule 3)",
  },
  "Namespace family": {
    rule: "reachability",
    source:
      "Namespaces in XML 1.0 §3 and the XML Infoset's [namespace attributes], a set: an element declares each prefix at most once, Namespace's key (package, path, start, prefix) (fin.md §5.2)",
  },
  "Namespace name": {
    rule: "namespace-name",
    source:
      "reading 131: https://www.w3.org/TR/xml-names/#ns-decl (Namespaces in XML 1.0 (Third Edition) §3: 'The attribute's normalized value MUST be either a URI reference — the namespace name identifying the namespace — or an empty string'; §2.1: 'An XML namespace is identified by a URI reference [RFC3986]'; a relative reference is deprecated, §2.2, not refused; §8 lets a processor leave it unchecked, which leaves the document's constraint standing): a namespace declaration's normalized value is RFC 3986's URI-reference (https://www.rfc-editor.org/rfc/rfc3986#appendix-A), the empty one a relative-ref of an empty path (chardata.ts NamespaceUri)",
  },
  "Node key": {
    rule: "reachability",
    source: "trees.md §1, the tree relation's key, id",
  },
  "One base": {
    rule: "P23",
    source:
      "https://www.imsglobal.org/spec/qti/v3p0/info#AbstractAttribute_ExpressionGroup_qti-multiple (§6.9.13, and §6.9.14 Ordered: 'Although the sub-expressions may be of any base-type they must all be of the same base-type'; §5.113, Repeat: 'all of which must have either single or ordered cardinality and the same base-type'; §6.9.21, Match: 'which must both have the same base-type and cardinality'; §6.9.33, Member, and §6.9.20, Delete: 'which must both have the same base-type'; §6.9.25, Contains: 'which must both have the same base-type and cardinality - either multiple or ordered'), a type no declaration says aside (reading 4) (expressions.ts One_base; the old checker's P23)",
  },
  "One head": {
    rule: "one-head",
    source:
      "an install's LOM policy (lom.ts QtiLom, EduLLM's collections decisions, out/collections/DECISIONS.md): each lesson, a (catalog, entry) of Lesson, has one head, the package of the lesson no stored package's isversionof names, so it has one current revision or none (decisions 2 and 5; lom.ts Head)",
  },
  OpenElementName: {
    rule: "unmodeled-vocabulary",
    source: "fin.md D2, a foreign element keeps its expanded name; reading 6",
  },
  "OpenElementName canonical": {
    rule: "unmodeled-vocabulary",
    source:
      "https://www.w3.org/TR/xmlschema-1/#cvc-assess-elt (XML Schema 1.0 Part 1 §3.3.4, Schema-Validity Assessment (Element), clauses 1.1.1.2 and 1.1.1.3.2: an element is assessed against the declaration its context determines or its name resolves to, a particle's own or a top-level one a lax or strict wildcard finds, §3.10.4 clause 2), so an element whose expanded name its parent admits there is that declaration's kind and never a foreign element (shred.ts childReadingOf; install.ts KindByNameUnder, the names each parent admits, C8)",
  },
  "Operand fit": {
    rule: "P23",
    source:
      "https://www.imsglobal.org/spec/qti/v3p0/info#AbstractAttribute_ExpressionGroup_qti-member (§6.9, ExpressionGroup, normative: each operator's sub-expression base types and cardinalities, as §6.9.33 qti-member and §6.9.20 qti-delete say: 'The first sub-expression must have single cardinality and the second must be a multiple or ordered container'), a type no declaration says aside (reading 4) (expression.ts expressionTypings, OperandBase, LeadCardinality and TailCardinality; the old checker's P23)",
  },
  "Outcome only": {
    rule: "P25",
    source:
      "https://www.imsglobal.org/spec/qti/v3p0/info#AbstractAttribute_ExpressionGroup_qti-number-correct (§6.9.58 to §6.9.64 and §6.9.41, normative: qti-number-correct, qti-number-incorrect, qti-number-presented, qti-number-responded, qti-number-selected, qti-outcome-minimum, qti-outcome-maximum and qti-test-variables, each 'which can only be used in outcomes processing'); and a qti-variable that writes weight-identifier, https://www.imsglobal.org/spec/qti/v3p0/info#DerivedCharacteristic_Variable.Attr_weight-identifier (§7.47.2: 'Weights are defined only in the test context (and hence only in outcomes processing)'; spec reading 199) (expressions.ts Outcome_only, its language Processing's; queries.ts Outcome only over WeightedVariable; the old checker's P25)",
  },
  "PCI module source": {
    rule: "pci-module-source",
    source:
      "R10-a: https://www.imsglobal.org/spec/qti/v3p0/info#DataCharacteristic_PortableCustomInteraction.Attr_module (§5.106.2: 'If this characteristic is provided the qti-interaction-modules child attribute is not required, if omitted then the modules child element is mandatory'): a portable custom interaction names its module by a module attribute, by a qti-interaction-modules child, or by both (interactions.ts PCI_module_source)",
  },
  "Package grade": {
    rule: "package-classification",
    source:
      "an install's LOM policy (lom.ts QtiLom, EduLLM's collections decisions, out/collections/DECISIONS.md): the manifest's record states a classification of LOMv1.0 purpose educational level with a taxon path naming its source and a taxon of an id (IEEE 1484.12.1-2002 9.1, 9.2; QTI 3.0 Metadata §2.7.9; IMS Meta-data 1.3 Best Practice, 'classification.purpose [Educational Level] may also be used to record level or grade-related information') (decisions 1 and 17; lom.ts PackageFact)",
  },
  "Package identity": {
    rule: "package-identity",
    source:
      "an install's LOM policy (lom.ts QtiLom, EduLLM's collections decisions, out/collections/DECISIONS.md): QTI 3.0 Metadata §2.7.1.1 at the manifest, the objectbank's record ('One of the values given for the identifier must have an entry that matches the identifier of the associated item, test or object bank'; the ASI binding §8.8.1, 'At the manifest level the metadata is for the PACKAGE as a whole'): the record's general category lists an identifier with a catalog whose entry is the manifest's identifier exactly, and exactly one, a package's lesson (decisions 3 and 15; lom.ts Lesson, PackageFact)",
  },
  "Package key": {
    rule: "reachability",
    source:
      "plan §1.6 and imscp_infov1p2pd2.txt §6.11.4 (IMS Content Packaging 1.2, the manifest's identifier: 'unique within the Manifest', and its version, which 'is used to distinguish between manifests with the same identifier'): one Package row per name, the name the importer's caller gives it and the key every row of the package holds, never the manifest's identifier, which two packages may share; an import only inserts, so the same package again under its name is unchanged and another package under a stored name is refused on the keys the two share, a name one revision for as long as it stands (logins.ts insertWrite)",
  },
  "Package relation target": {
    rule: "package-relation-target",
    source:
      "an install's LOM policy (lom.ts QtiLom, EduLLM's collections decisions, out/collections/DECISIONS.md): every relation's resource identifier in the catalog https://qti.edullm.ai/package names a stored package by its name exactly, a plain containment read as a name and no URL (IEEE 1484.12.1-2002 7.2.1; decision 4; lom.ts NamedPackage)",
  },
  "Package subject": {
    rule: "package-classification",
    source:
      "an install's LOM policy (lom.ts QtiLom, EduLLM's collections decisions, out/collections/DECISIONS.md): the manifest's record states a classification of LOMv1.0 purpose discipline with a taxon path naming its source and a taxon of an id (IEEE 1484.12.1-2002 9.1, 9.2; QTI 3.0 Metadata §2.7.9, 'The preferred solution for the description of an item's subject area is to used the LOM classification category with the value classification.purpose = \"discipline\"') (decisions 1 and 17; lom.ts PackageFact)",
  },
  "Picture source srcset": {
    rule: "source-srcset",
    source:
      "reading 124: https://www.imsglobal.org/spec/qti/v3p0/info#DataCharacteristic_Source.Attr_srcset (§5.135.3: \"This attribute is required when 'source' is used in 'picture'\"); https://html.spec.whatwg.org/multipage/embedded-content.html#the-source-element (where 'The source element's parent is a picture element', 'The srcset attribute must be present'): a source whose parent is a picture carries srcset (html.ts Picture_source_srcset)",
  },
  "Printed variable reference": {
    rule: "printed-variable-ref",
    source:
      "reading 77: https://www.imsglobal.org/spec/qti/v3p0/info#DerivedCharacteristic_PrintedVariable.Attr_identifier (§7.30.6: 'The outcome variable or template variable must have been defined. The values of response variables cannot be printed directly'), the built-in completionStatus among them (§2.2.2.3) (references.ts ContentReference)",
  },
  "Printed variable type": {
    rule: "printed-variable-ref",
    source:
      "reading 234: https://www.imsglobal.org/spec/qti/v3p0/info#Union_IntegerOrVariableRef (§9.3.3, IntegerOrVariableRef, normative: 'The type used for attributes of integer type that may be replaced with the value of a template or outcome variable of base type integer and single cardinality'), the type of a printed variable's base and index (https://www.imsglobal.org/spec/qti/v3p0/info#DerivedCharacteristic_PrintedVariable.Attr_base, §7.30.8 and §7.30.9): a base or index that names a declared variable names a single integer one, its cardinality and its base type each judged where the declaration spells one (readings 158 and 159), an item's own against its declarations and a fragment's per placement against its assembly's (reading 117); a check over the queries PrintedIntegerCardinality and PrintedIntegerBaseType (queries.ts)",
  },
  "Publisher credit": {
    rule: "package-credit",
    source:
      "an install's LOM policy (lom.ts QtiLom, EduLLM's collections decisions, out/collections/DECISIONS.md): the manifest's record states a lifeCycle contribute of LOMv1.0 role publisher with an entity (IEEE 1484.12.1-2002 2.3.1), and every publisher's vCard has an ORG that names it (RFC 2426 §3.5.5); the organization's name is the producer's fact, never the law's (decisions 7, 12 and 16; lom.ts PackageFact, PackageCredit, Publisher_credit)",
  },
  "Quotation punctuation": {
    rule: "q-punctuation",
    source:
      "reading 127: https://www.imsglobal.org/spec/qti/v3p0/info#Data_Q (§5.111, Q: 'Quotation punctuation (such as quotation marks) that is quoting the contents of the tag must not appear immediately before, after, or inside q tags; they will be inserted into the rendering by the user agent'; ~/.cache/qti-pie/anyuri-specs/qti/info.txt:38355, and the 3.0.1 model's ~/.cache/qti-pie/qti301/info301.txt:39222): a q is refused where the last character of its sibling before it, the first of its sibling after it, or the first or last character of its own content is a quotation mark, one of \" « » ‘ ‚ ‛ “ ” „ ‟ ‹ › (main's set, which leaves out the apostrophes ' and ’), each read off a text, whitespace or entity reference row, so an element, a comment or an instruction beside the q holds no punctuation (quotation.ts Quotation_punctuation)",
  },
  "Record field key": {
    rule: "value-cardinality",
    source:
      "https://www.imsglobal.org/spec/qti/v3p0/info#Enumerated_CardinalityEnum (§8.16, CardinalityEnum, record: 'a special container that contains a set of independent values each identified by its own identifier and having its own base-type'): no two fields of one record value share a field-identifier, compared collapsed",
  },
  RecordBindingFit: {
    rule: "record-binding-fit",
    source:
      "https://www.imsglobal.org/spec/qti/v3p0/info#Data_TextEntryInteraction (§5.162: 'The textEntryInteraction must be bound to a response variable with single or record cardinality only') and https://www.imsglobal.org/spec/qti/v3p0/info#Data_ExtendedTextInteraction (§5.48: 'The qti-extended-text-interaction must be bound to a response variable of single, multiple, ordered or record cardinality'); every other class's binding sentence names no record (§5.30 and BindingFit's others) (expression.ts RecordBindingFit)",
  },
  "Reference overlay": {
    rule: "reachability",
    source:
      "IMS Content Packaging 1.2 (b) and (d), and readings 102 and 103: each document's references (Reference) are an attribute's copy keyed by its node and name, and each the importer resolves in the package has its ReferencePath, in its document's package",
  },
  "Reference type": {
    rule: "P24",
    source:
      "https://www.imsglobal.org/spec/qti/v3p0/info#Union_IntegerOrVariableRef (§9.3.3, §9.3.1 and §9.3.4: an integerOrVariableRef, floatOrVariableRef or stringOrVariableRef names a template or outcome variable of that base type, single) (expression.ts ReferenceBase; the old checker's P24)",
  },
  "Reserved type": {
    rule: "reserved-type",
    source:
      "https://www.imsglobal.org/spec/qti/v3p0/info#Root_OutcomeDeclaration (§4.5, OutcomeDeclaration: 'SCORE needs to be a float.', 'MAXSCORE needs to be a float.', 'PASSED needs to be a boolean.'), of an outcome declaration of that identifier; https://www.imsglobal.org/spec/qti/v3p0/info#RootAttribute_AssessmentItem_qti-context-declaration (§4.1.10, and §4.4.7 of a test: 'An implementation MUST support the global variable \"QTI_CONTEXT\" with record cardinality') and https://www.imsglobal.org/spec/qti/v3p0/info#Data_ContextDeclaration (§5.34: 'There is one built-in context variable named \"QTI_CONTEXT\" with record cardinality'), which the implementation guide, a document with no normative mark, declares explicitly (its §3.7.11, 'an explicit (though unnecessary) <qti-context-declaration> of QTI_CONTEXT'): a declaration of QTI_CONTEXT is a record context declaration, since one of another kind or cardinality would make one identifier name two variables (reading 74)",
  },
  RootOfType: {
    rule: "root-type-reverse",
    source: "QTI 3 packaging: the document root of each resource type (package.ts)",
  },
  "Rounding figures": {
    rule: "P10",
    source:
      "reading 119: https://www.imsglobal.org/spec/qti/v3p0/info#DataCharacteristic_EqualRounded.Attr_figures (§5.47.2: 'If roundingMode= 'significantFigures', the value of figures must be a non-zero positive integer. If roundingMode='decimalPlaces', the value of figures must be an integer greater than or equal to zero') and #DataCharacteristic_RoundTo.Attr_figures (§5.119.2, the same of rounding-mode), under the EqualRounded default significantFigures (§5.47.1): a figures whose collapsed form is an integer is at least 1 under significantFigures and at least 0 under decimalPlaces, a variable's name read at run time (operators.ts RoundingModeFigures, Rounding_figures)",
  },
  "SSML lexicon reference": {
    rule: "ssml-fragment",
    source:
      "reading 3: https://www.w3.org/TR/speech-synthesis11/#S3.1.5.2 (SSML 1.1 §3.1.5.2: 'The ref attribute specifies a name that references a lexicon document as assigned by the xml:id attribute of the lexicon element') and #S3.1.5.1 (§3.1.5.1: 'The scope of this name is the current SSML document'), the document being the lookup's nearest speak (identity.ts ssmlLexiconReference, through SsmlScope)",
  },
  "SSML trim mark": {
    rule: "ssml-fragment",
    source:
      "reading 3: https://www.w3.org/TR/speech-synthesis11/#S3.1.1.1 (SSML 1.1 §3.1.1.1: 'Only markers defined once in the document, i.e. that are unique, are permitted as the value of either startmark or endmark'; 'It is an error if the value given for either startmark or endmark is not a valid mark in the document'), the document being the speak, each name an xs:token (§3.3.2) compared by its collapsed value (identity.ts ssmlTrimMark)",
  },
  "Self dependency": {
    rule: "self-dependency",
    source:
      "imscp_infov1p2pd2.txt:1105 (IMS Content Packaging 1.2, §6.11.5, the IdentifierRef class, rule B ii: an IdentifierRef child of a Dependency object 'Shall not reference the Dependency's parent Resource'): a cp:dependency's identifierref is not its own resource's identifier, compared as collapsed values (xs:IDREF and xs:ID are whiteSpace collapse types; decision 457 (3)) (package.ts Self_dependency)",
  },
  "Set type": {
    rule: "P20",
    source:
      "https://www.imsglobal.org/spec/qti/v3p0/info#Data_SetValue (§5.130, SetValue, normative, the class of every setter, outcome, response and template rules alike: 'floating point values can not be assigned to integer variables and vice-versa. The truncate, round or integerToFloat operators must be used to achieve numeric type conversion'; §5.130.2, its expression: 'The expression which must have an effective base-type and cardinality that matches the base-type and cardinality of the outcome variable being set') (expressions.ts Set_type; the old checker's P20)",
  },
  "Slider bounds": {
    rule: "slider-bounds",
    source:
      "reading 9, the Schematron's rule 14Ba (RULE_SET_INTERACTION_14B, ASI 3.0.1 XSD, on qti-slider-interaction: 'not(@upper-bound < @lower-bound)', 'The upper-bound attribute value must not be less than the lower-bound value'), its values collapsed and read as xs:double, each in xs:double's lexical space (XML Schema 1.0's, reading 71's edition, operators.ts doublePattern) as the double XML Schema 1.1's doubleLexicalMap maps it to (Part 2 §3.3.5.2, reading 144; grizzle's Compute.parseDouble), of any digits and any exponent, NaN ordered against nothing; the information model (§5.134.1-2) states no order",
  },
  "Source pointer": {
    rule: "source-pointer",
    source:
      "an install's LOM policy (lom.ts QtiLom, EduLLM's collections decisions, out/collections/DECISIONS.md): the manifest's record states exactly one relation of LOMv1.0 kind isbasedon (IEEE 1484.12.1-2002 7.1, 'DC.Source 7.2:Relation.Resource when the value of 7.1:Relation.Kind is \"IsBasedOn\"'), naming the producer's source file by its SHA-256, 64 lowercase hex digits (decision 7; lom.ts SourcePointer)",
  },
  "Stimulus ref key": {
    rule: "stimulus-ref-key",
    source:
      "https://www.imsglobal.org/spec/qti/v3p0/info#DerivedCharacteristic_AssessmentStimulusRef.Attr_identifier (§7.6.1: 'The unique identifier for the stimulus reference'; §7.6.2: 'each reference must have a unique identifier'), compared collapsed: no two stimulus refs of one item share an identifier (tests.ts StimulusRef)",
  },
  "Stimulus ref target": {
    rule: "stimulus-ref-target",
    source:
      "info.txt:74346 and :74420 (https://www.imsglobal.org/spec/qti/v3p0/info#Derived_AssessmentStimulusRef, §7.6: the stimulus ref 'enables reference to a 'qti-assessment-stimulus' instance', and its href is 'The uri used to refer to the stimulus file'): a stimulus ref's href that resolves in the package names a listed document whose root is a qti-assessment-stimulus; an external href is not resolved (reading 35's reading of an absolute URI) (package.ts ReferencePath, the UP audit's B5)",
  },
  "Strictly held": {
    rule: "unmodeled-vocabulary",
    source:
      "reading 81: https://www.w3.org/TR/xmlschema-1/#cvc-wildcard (XML Schema 1.0 Part 1 §3.10.4, Item Valid (Wildcard), clause 2: a strict wildcard's element has the context-determined declaration mustFind), with §3.3.4 clause 1.2 and §3.3.5 [validity] clause 1.1.3: an element only the strict wildcards of its parent's model hold (install.ts StrictlyHeld) stands only under an xsi:type naming a type of its document's schema set or a built-in, so it has a governing type, its OpenElementType row (C44; shred: strict-undeclared), but for reading 6's root whose declaration the wildcard finds (§3.10.4 clause 2, §3.3.4 clause 1.1.1.3.2), kept foreign and unrefused (install.ts HeldRootsUnder, C13)",
  },
  "Structure identifier": {
    rule: "structure-identifier",
    source:
      "reading 86: https://www.imsglobal.org/spec/qti/v3p0/info#RootCharacteristic_AssessmentSection.Attr_identifier (§4.2.1: 'The identifier of the section or item reference must be unique within the test'), read within a bank, which no test surrounds, compared collapsed: no two of a bank's section and item refs share an identifier, so no two members of one bank do (tests.ts Named)",
  },
  "T1 document order": {
    rule: "reachability",
    source: "trees.md §2, T1",
  },
  "T2 root": {
    rule: "reachability",
    source: "trees.md §2, T2",
  },
  "T3 first child": {
    rule: "reachability",
    source: "trees.md §2, T3, with the merged parent copy (trees.md §6)",
  },
  "T4 next sibling": {
    rule: "reachability",
    source: "trees.md §2, T4",
  },
  "T5 last child": {
    rule: "reachability",
    source: "trees.md §2, T5",
  },
  "T6 nonempty and leaf": {
    rule: "reachability",
    source: "trees.md §2, T6",
  },
  "Table headers": {
    rule: "table-headers",
    source:
      "reading 126: https://www.imsglobal.org/spec/qti/v3p0/info#DataCharacteristic_TDH.Attr_headers (§5.140.1: \"an unordered set of unique space-separated tokens that are case-sensitive, each of which must have the value of an ID of a 'th' tag taking part in the same table as the 'td' or 'th' tag\"); https://html.spec.whatwg.org/multipage/tables.html#attr-tdth-headers: a cell's headers tokens are unique, and each is the id of a th whose nearest table is the cell's, a cell no table holds taking part in none (html.ts TableScope, TableHeader, tableHeaders)",
  },
  "Template needs": {
    rule: "P8",
    source:
      "reading 233: https://www.imsglobal.org/spec/qti/v3p0/info#RootCharacteristic_ResponseProcessing.Attr_template (§4.6.1, ResponseProcessing's template, normative: 'If a template identifier is given it may be used to locate an externally defined responseProcessing template. The rules obtained from the external template may be used instead of the rules defined within the item itself, though if both are given the internal rules are still preferred'), so an item's qti-response-processing that names a published template (reading 51) and holds no rule of its own runs that template's published rules, which read RESPONSE as a response variable (§6.9.40, qti-variable: 'an itemVariable that has been declared in a corresponding variableDeclaration or is one of the built-in variables'; §6.9.27, qti-correct: 'looks up the declaration of a response variable'; §6.9.47, qti-map-response, and §6.9.46, qti-map-response-point: 'the value of a response variable'), set SCORE and the CC2 templates' FEEDBACK and FEEDBACKBASIC as outcomes (§6.39.4, qti-set-outcome-value: 'sets the value of an outcome variable') and read the CC2 templates' MAXSCORE as a declared variable (§6.9.40), and whose qti-map-response under map_response and CC2_map_response uses RESPONSE's mapping (https://www.imsglobal.org/spec/qti/v3p0/info#AbstractAttribute_ExpressionGroup_qti-map-response, §6.9.47, and §7.22, MapResponse, normative: 'transforms it using the associated mapping, which must have been declared'); reading 198 holds each CC2 template to its own published rules: select(TemplateProcessing, value)(package, path), its template URI one of the template's four (either published prefix, with or without .xml), contained in select(NamedDeclaration, identifier, declarationKind)(package, path) per need, and in MappedResponseDeclaration(package, path) under the mapping templates (queries.ts Template needs)",
  },
  "Template reads": {
    rule: "P26",
    source:
      "https://www.imsglobal.org/spec/qti/v3p0/info#Abstract_TemplateRuleGroup (§6.50: 'An expression used in a qti-template-rule must not refer to the value of a response variable or outcome variable. It may only refer to the values of the template variables'), with https://www.imsglobal.org/spec/qti/v3p0/info#Data_ContextDeclaration (§5.34: 'Context variables may be referenced in template processing, in response processing, and in outcome processing'): template processing reads template and context variables, QTI_CONTEXT among them, and no response, outcome or built-in session variable (expressions.ts Template_reads; the old checker's P26)",
  },
  "Template reference": {
    rule: "template-ref",
    source:
      "https://www.imsglobal.org/spec/qti/v3p0/info#DataCharacteristic_TemplateBlock.Attr_template-identifier (§5.145.1, and §5.155.1, §5.122.1, §5.124.1 and each choice's, as §5.132.3: 'The identifier of a template variable'), a template variable being one a template declaration declares (https://www.imsglobal.org/spec/qti/v3p0/info#Data_TemplateDeclaration, §5.151: 'Template declarations declare item variables that are to be used specifically for the purposes of cloning items') (references.ts ContentReference)",
  },
  "Template variable type": {
    rule: "template-ref",
    source:
      "reading R15-l: https://www.imsglobal.org/spec/qti/v3p0/info#DataCharacteristic_TemplateBlock.Attr_template-identifier (§5.145.1, and §5.7.2, §5.67.2, §5.122.1, §5.124.1, §5.155.1: 'The identifier of a template variable that must have a base-type of identifier and be of either single or multiple cardinality') and #DataCharacteristic_SimpleChoice.Attr_template-identifier (§5.132.3, and §5.55.2, §5.56.2, §5.58.2, §5.65.2, §5.73.3, §5.131.3: the same rule, written 'be either single of multiple cardinality'); a portable custom interaction's template variable (§7.38.1) states no type (interactions.ts Template_variable_type)",
  },
  "Test overlay": {
    rule: "reachability",
    source:
      "plan §1.7 O7 and the W5 amendment's C15, C18, under decision S3: each O7 overlay (TestDocument, Named, Site) is its element's row, keyed by its node, and holds its attributes' values, collapsed, each an identifier read where it stands (TestIdentifier, C18); TestDocument and Named hold no fact of their node or document, which their laws read through Node and Document (a document's root kind its Document's, at its (package, path)), while a Site holds its node's context (nodeContext: its kind, parent and parent's kind, ancestry, children, governor and nearest interaction), the copy routed with Document's context to the RULEREC follow-up; each exists exactly where its element does (Q5.13)",
  },
  "Test structure": {
    rule: "test-structure",
    source:
      "spec reading 1's stated limit 'Test structure' and the placement mandate, rulings 1 and 3 (owner 2026-11-17: QTI is content only, and no test document is read as a delivery sequence): https://www.imsglobal.org/spec/qti/v3p0/info#Root_AssessmentTest ('a group of assessmentItems with an associated set of rules that determine which of the items the candidate sees, in what order'): outside an imsqti_section_xmlv3p0 document, no qti-assessment-test, qti-test-part, qti-assessment-section, qti-assessment-section-ref or qti-assessment-item-ref, so a test document and a fragment of a test's structure are refused (tests.ts 'Test structure': every Node of those kinds stands in a Document of that type)",
  },
  TextDomain: {
    rule: "text-copy",
    source:
      "XML Schema Part 2, each simple-content kind's type compiled with its whiteSpace (domains.ts); reading 7; and https://www.w3.org/TR/xmlschema-2/#NOTATION (§3.2.19: 'The ·value space· of NOTATION is the set of QNames of notations declared in the current schema'), which no pinned XSD declares, so a text read in xs:NOTATION's empty domain, whose pattern is the empty language's, is refused (reading 60, C47)",
  },
  "Track srclang": {
    rule: "track-srclang",
    source:
      'reading 125: https://www.imsglobal.org/spec/qti/v3p0/info#DataCharacteristic_Track.Attr_srclang (§5.163.3: "This attribute must be present if the tag\'s kind attribute is in the subtitles state"); https://html.spec.whatwg.org/multipage/media.html#the-track-element (kind: "The attribute\'s missing value default is the subtitles state"): a track that writes no kind, or writes kind as subtitles, carries srclang (html.ts Track_srclang, subtitleTrackSrclang)',
  },
  "Typed attribute value": {
    rule: "attribute-lexical",
    source:
      "readings 7 and 8, and https://www.imsglobal.org/spec/qti/v3p0/info#Enumerated_BaseTypeEnum (§8.13, BaseTypeEnum, each base type's value set): a qti-map-entry's map-key is a value of its mapping's base type (§7.21.1, 'The source value'), and a lookup table entry's target-value and a table's default-value are values of its outcome's base type (§5.90.1, §5.78.1, §7.23.2, §7.18.3); each is written as its base type's lexical form with no whitespace around it unless the base type is string (mapping.ts Typed_attribute_value over expression-types.ts BaseTypePattern)",
  },
  "Typed value": {
    rule: "typed-copy",
    source:
      "https://www.imsglobal.org/spec/qti/v3p0/info#Derived_Value (§7.46, Value: 'The base-type is defined by the 'base-type' attribute of the declaration except in the case of variables with record cardinality') and https://www.imsglobal.org/spec/qti/v3p0/info#Enumerated_BaseTypeEnum (§8.13, BaseTypeEnum, each base type's value set): a qti-value's text is a lexical form of its base type, outer whitespace formatting but for string (reading 7): boolean true or false (reading 34), integer xs:integer unbounded (reading 45), float xs:double (reading 56) and duration xs:double (§8.13: 'Durations are represented using the 'xsd:double' datatype'), identifier IdentifierDType, uri xs:anyURI (reading 71), point two integers, pair and directedPair two identifiers; string and file any text",
  },
  "Usage typed value": {
    rule: "typed-copy",
    source:
      "reading 105: https://www.imsglobal.org/sites/default/files/spec/qti/v3/ud-bind/index.html (QTI 3.0 Usage Data binding §2.6.5, Value: 'A class that can represent a single value of any baseType'; §2.7.1, BaseTypeEnum) and https://www.imsglobal.org/spec/qti/v3p0/info#Enumerated_BaseTypeEnum (§8.13, BaseTypeEnum, each base type's value set): a ud:value that forms part of a record (it writes a fieldIdentifier) and writes baseType holds a lexical form of that base type, read as a qti-value's text is (readings 7, 34, 45 and 71), and any other ud:value, outside a record or writing no baseType, is xs:normalizedString text, accepted untyped (metadata.ts UsageValueBaseType over expression-types.ts BaseTypePattern)",
  },
  "Value cardinality": {
    rule: "value-cardinality",
    source:
      "https://www.imsglobal.org/spec/qti/v3p0/info#Enumerated_CardinalityEnum (§8.16, CardinalityEnum: single 'a single value'; record 'a set of independent values each identified by its own identifier and having its own base-type') and https://www.imsglobal.org/spec/qti/v3p0/info#Derived_Value (§7.46.1, §7.46.2: field-identifier and base-type are 'only used for' a value that forms part of a record): a single variable's default or correct value holds one qti-value, and a value is a record's field, with its field-identifier and base-type, exactly when its variable is a record",
  },
  "Variable declared": {
    rule: "P8",
    source:
      "https://www.imsglobal.org/spec/qti/v3p0/info#AbstractAttribute_ExpressionGroup_qti-variable (§6.9.40, qti-variable, normative: 'This expression looks up the value of an itemVariable that has been declared in a corresponding variableDeclaration or is one of the built-in variables'), https://www.imsglobal.org/spec/qti/v3p0/info#DerivedCharacteristic_Variable.Attr_identifier (§7.47.1, Variable's identifier: 'The identifier of the item variable that has been declared in a corresponding variable declaration or of the built-in variables') and https://www.imsglobal.org/spec/qti/v3p0/info#DataCharacteristic_SetValue.Attr_identifier (§5.130.1, a setter's: 'The identifier of the variable to be set') (references.ts); readings 4 and 29; and reading R15-k, https://www.imsglobal.org/spec/qti/v3p0/info#Union_StringOrVariableRef (§9.3.4, StringOrVariableRef: 'if a string appears to be a reference to a template or outcome variable but there is no variable with the given name it should be treated simply as string value'): a braced qti-pattern-match pattern that names no variable is a string value, not an undeclared reference",
  },
  "Variable kind": {
    rule: "variable-kind",
    source:
      "https://www.imsglobal.org/spec/qti/v3p0/info, each processing element's definition of the variable it reads or sets: §7.10.1 Correct ('The identifier of the associated response variable'), §7.22.1 MapResponse ('the associated Response variable'), §6.9.46 MapResponsePoint ('looks up the value of a response variable'), §5.87.1 and §6.32.1 LookupOutcomeValue ('the outcome variable to be set'), §6.32.3 and §6.39.4 SetOutcomeValue ('sets the value of an outcome variable'), §6.50.1 SetTemplateValue ('sets the value of a template variable'), §6.50.4 SetDefaultValue ('The response variable or outcome variable to have its default value set'), §6.50.5 SetCorrectResponse ('The response variable to have its correct value set'), and §7.47.1 Variable and §7.12.1 Default, any item variable (§2.2.2: 'context, response, outcome or template variables'): a reference by identifier names a declaration, or a built-in standing as one (BuiltInVariable), of a kind its element reads or sets (expression-types.ts ReferenceDeclaration, over VariableRef and PlacedVariableRef)",
  },
  "Version lesson": {
    rule: "version-lesson",
    source:
      "an install's LOM policy (lom.ts QtiLom, EduLLM's collections decisions, out/collections/DECISIONS.md): LOMv1.0 isversionof (IEEE 1484.12.1-2002 7.1) narrowed to 'an earlier revision of the same lesson': every isversionof names a package in the catalog https://qti.edullm.ai/package, and the package it names is stored and of the naming package's lesson (decisions 3 and 4; lom.ts VersionOf, VersionClaim)",
  },
  "XML production": {
    rule: "well-formedness",
    source:
      "XML 1.0 §2.2 Char, §2.5 Comment, §2.6 PI, §2.8 doctypedecl and VersionNum, §4.3.3 EncName, and Namespaces in XML 1.0 §3 NCName: a stored text outside its production is no well-formed XML, which crust's reader refuses before any row exists, so only an importer defect reaches the law",
  },
  "XsiType available": {
    rule: "xsi-type",
    source:
      "readings 60 and 81: https://www.w3.org/TR/xmlschema-1/#cvc-assess-elt (XML Schema 1.0 Part 1 §3.3.4, Schema-Validity Assessment (Element), clause 1.2: an element no declaration assesses is assessed against the type its xsi:type resolves to in the schema its document is assessed against), so a foreign element's governing type, where it has one (its OpenElementType row), is one of XML Schema's own or a type of a schema set its parent's namespace stands in (open.ts typeAvailable; install.ts TypeAvailable, C15 and C36); a parent in no vocabulary's namespace stands in documents of every set, and the document's own set is reading 81's recorded limit",
  },
  "XsiType derived": {
    rule: "xsi-type",
    source:
      "reading 47: https://www.w3.org/TR/xmlschema-1/#cvc-elt (XML Schema 1.0 Part 1 §3.3.4, Element Locally Valid (Element), clause 4.3: the local type definition 'must be validly derived from the {type definition}', §3.4.6 and §3.14.6), over the named type that governs each element of a vocabulary kind (its ElementType row: its xsi:type's, else its declared type; xsi.ts XsiType), which every element of a kind whose declared type is named has, and an element of an anonymous declared type has not (AnonymousType). Clauses 4.1 and 4.2, a value that is no QName in scope or names no type, are the codec's (shred: type-unresolved, type-unknown)",
  },
  "comment arm": {
    rule: "text-copy",
    source: "the XDM comment nodes as rows (plan §1.4)",
  },
  "default hotspot last slot": {
    rule: "hotspot-default",
    source:
      "reading 80: https://www.imsglobal.org/spec/qti/v3p0/info#DataAttribute_HotspotInteraction_qti-hotspot-choice (§5.68.6, and the HotspotChoice class description, §5.67: 'The default hotspot, if defined, must appear last'), of qti-hotspot-choice only, since the AssociableHotspot class (§5.7) and the graphic associate interaction's hotspots (§5.59.4) state no such rule; last among its parent's element children, so whitespace, comments and instructions after it do not count (children.ts LastWhere, ruling D3)",
  },
  "doctype arm": {
    rule: "text-copy",
    source: "the XDM doctype as a row (plan §1.4)",
  },
  "entityRef arm": {
    rule: "text-copy",
    source: "the XDM entity references as rows (plan §1.4)",
  },
  "pi arm": {
    rule: "text-copy",
    source: "the XDM processing instructions as rows (plan §1.4)",
  },
  "text arm": {
    rule: "text-copy",
    source: "the XDM text nodes as rows (plan §1.4)",
  },
  "value domain": {
    rule: "attribute-lexical",
    source:
      "XML Schema Part 2, each attribute's simple type compiled with its whiteSpace into its lexical space, a double's lower bound left to its typed value (domains.ts, Double bound); readings 7, 45, 46, 56 and 71; and the readings that hold a type to its stricter source (attributes.ts specReadings): 2 (MathML's number without a plus, and cn's base a positive integer), 9 (h1's role heading, tab or presentation, the Schematron's RULE ARIA ROLE 1b), 120 (qti-index's n at least 1), 123 (bdo's dir without auto), 124 and 125 (a media URL non-empty), 129 (xml:lang, lang and srclang BCP 47 language tags), 132 and 161 (a printed variable's format a printf format string over the listed conversion codes, of any number of conversions) and 135 (a MIME type RFC 2045's two tokens and a slash); and a usage statistic's lastUpdated, the usage data's DateDType (usagedata/imsqti_usagedatav3p0_v1p0.xsd:127-131, xs:date restricted by the pattern [0-9]{4}-[0-9]{2}-[0-9]{2}), the month lengths and the leap rule included (XML Schema 1.1 Part 2 §3.3.9, Day-of-month Representations)",
  },
  "ws arm": {
    rule: "text-copy",
    source: "the XDM whitespace nodes as rows (plan §1.4)",
  },
} as const satisfies Readonly<Record<string, LawEntry>>;
