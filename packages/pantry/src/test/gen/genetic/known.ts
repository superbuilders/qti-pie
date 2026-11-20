/**
 * The genetic differential's known disagreements (`src/test/genetic.oracle.test.ts`): each class of
 * disagreement the search has met that a lane owns, keyed by its signature
 * (`#pantry/test/gen/genetic/judge.ts` `Signature`: its kind and grizzle's law, its selections
 * included, or the law name or the rules it names), with the lane that owns its
 * fix, the fix it waits on, and a package, reduced by the search, that shows it.
 *
 * The search fails on a class no entry records, and every run judges each entry's package on its
 * own and fails on an entry whose package no longer shows its class: the commit that lands an
 * owner's fix deletes the entries it closes, or moves them to {@link fixed}, whose packages must
 * never show their class again. An entry records a class, never a package: a fix that leaves the
 * class showing elsewhere keeps the entry, with a package that still shows it. A signature is a
 * class some package can show, a law the host judges, which the replay's guard holds every entry
 * to.
 *
 * A class spec reading 1 lists as a stated limit waits on no fix: its entry's owner is the decision
 * that states it, its fix what would lift it, and it stays while the limit stands.
 *
 * The host's judge is a fast pre-filter (`#pantry/test/gen/genetic/host-laws.ts`, the owner's Q4
 * ruling): a class it reports becomes an entry only once its package reproduces it on PostgreSQL.
 */
import type { PackageEntries } from "#pantry/test/gen/every-relation.ts";
import type { Signature } from "#pantry/test/gen/genetic/judge.ts";
import type { Noise } from "#pantry/test/gen/genetic/noise.ts";

/**
 * Who owns a disagreement's fix: the lane, and the fix it waits on.
 */
export interface Owned {
  readonly fix: string;
  readonly owner: string;
}

/**
 * One file of a known package: its path, and its text, or its bytes in base64 where it is no XML.
 */
type KnownFile = readonly [path: string, form: "b64" | "xml", content: string];

/**
 * One known disagreement, or one a fix closed: its class, its owner, the fix, its package's files,
 * and, for a noise's class, the noise and salt that make its package's noised twin.
 */
export interface Known extends Owned {
  readonly files: readonly KnownFile[];
  /**
   * The noise and salt of a `noise-moved` class: such a class shows only beside its package's
   * noised twin, as the search judges it, so the check judges the twin too.
   */
  readonly noised?: { readonly noise: Noise; readonly salt: number };
  readonly signature: Signature;
}

/**
 * A known entry's package, as the reader takes it.
 *
 * @param known - The entry.
 * @returns Its package's entries.
 */
export const knownEntries = (known: Known): PackageEntries =>
  new Map(
    known.files.map(([path, form, content]) => [
      path,
      form === "xml" ? new TextEncoder().encode(content) : Uint8Array.fromBase64(content),
    ]),
  );

/**
 * The known disagreements.
 */
export const known: readonly Known[] = [
  // Decision 449's two stated-limit classes over a record file whose root is a cp:manifest, its
  // record's naming and its learning resource type, have no entry: Qti states both, lom-identifier,
  // lom-title and LOM learning resource type, only as rules over queries over Node, which the host
  // never judges, so the search never shows one.
  // Nine of upstream's genetic repair round 4 known classes (284e13ab's known.ts; decisions 449, 463
  // and 467, issues #65 and #68) are no entries here: each is of a law Qti states only as a rule
  // over a query, which the host never judges (host-laws.ts: a statement over a derived relation is
  // unknown, never broken and never held), or of a relation Qti does not have, so the search never
  // shows one. Their packages, upstream's file for file, were #pantry/test/record-naming.ts's, which
  // #pantry/import/record-naming.db.test.ts judged on the database until the test cut of 2026-11-10
  // deleted both (they stand at 022b92f9):
  // - "import-only-law: E1 derived, contained GeneralObject(record, document) in LomObject(record,
  //   document)", under a record file whose root is a cp:manifest and under xml:base on a
  //   cp:resource;
  // - "import-only-law: LomObjectIdentifier, contained LomEntry(holderParent) in
  //   LomObjectIdentifier(record)", under the same two;
  // - "import-only-law: LomObjectTitle, contained LomTitle(record) in LomObjectTitle(record)", under
  //   a record file whose root is a cp:manifest, under a resource href the oracle reads unresolved
  //   (#65) and under xml:base on a cp:resource;
  // - "oracle-only-law: LomObjectTitle";
  // - "lone-refusal: RootOfType named lom-identifier, witness unreported", under a record file whose
  //   root is a cp:manifest.
  // Five `fixed` entries went with the declarationIdentifierRef ripple (follow-up 14, decision S3):
  // each guarded a law over a resolution row the import no longer writes, and every law that resolves
  // a name now matches a name view of `QtiViews` (`#pantry/qti/names.ts`), a rule over a query the
  // host never judges, so no package can show their classes here. Their packages stand in this file
  // at 1fcabfa34, for follow-up 13 to bring back once the host judges a rule over a query:
  // - "import-only-law: contained FragmentTemplateRef(not a built-in) in
  //   FragmentTemplateRefDeclaration", P-SCHEMA's (a section ref places only a test's or a
  //   section's root);
  // - "import-only-law: contained BoundVariable in BindingDeclaration", VD's (the variant class);
  // - "import-only-law: contained PlacedBinding in PlacedBindingDeclaration", genetic-repair gr-2's
  //   (a site places its target only where it may stand for its root);
  // - "import-only-law: check Reserved_type on DeclarationName", NIL's (B11: an absent or unspelled
  //   base type or cardinality is no row);
  // - "import-only-law: contained TemplateRef(not a built-in) in TemplateRefDeclaration",
  //   FIX-NCNAME's (spec reading 152: a value names something only where it is an NCName).
  // Three went with the declaration counts' lift (C18, decision S3), when a declaration's
  // cardinality and base type became its attributes' codes (`DeclarationCardinality` and
  // `DeclarationBaseType` of `#pantry/qti/names.ts`) and `Declaration` went: each guarded a stored
  // law that is now a rule over a query the host never judges ("Declaration base type"'s
  // non-record cardinality into the base types and "Declaration overlay"'s cardinality into its
  // attribute, NIL's B11), or a row the import no longer writes ("Declaration overlay"'s node into
  // `Declaration`, FIX-DECLCARD's). Their packages stand in this file at 49a8ebbdb, for
  // follow-up 13 to bring back once the host judges a rule over a query.
  // Three went with C18 (decision S3), when an item's root's `identifier` and `title` became
  // selections of its attributes' `value` (`ObjectIdentifier` and `objectTitles` of
  // `#pantry/qti/queries.ts`): each guarded a law over a copy the import no longer writes, the
  // `known` "check E1_derived on ObjectIdentifier" (an empty identifier) and the `fixed`
  // "contained Attribute(title) in ObjectTitle" and its identifier twin (FB-META's).
  // Two went with C18's `TestToken` (`TestIdentifier` of `#pantry/qti/overlay-queries/tests.ts`,
  // a selection of the attributes' `value`): each guarded a law over the copy the import no longer
  // writes, the `known` "check E1_derived on TestToken" (an empty item ref identifier, decision
  // 463's stated limit) and the `fixed` "contained Named in TestToken(identifier)" (FB-TESTS's).
  {
    files: [
      [
        "imsmanifest.xml",
        "xml",
        '<?xml version="1.0" encoding="UTF-8"?>\n<manifest identifier="MANIFEST" xmlns="http://www.imsglobal.org/xsd/qti/qtiv3p0/imscp_v1p1"><metadata><schemaversion>3.0.1</schemaversion></metadata><resources><resource type="imsqti_item_xmlv3p0" href="items/item.xml"/><resource type="imsqti_item_xmlv3p0" href="items/item2.xml"/><resource type="imsqti_fragment_xmlv3p0" href="items/fragment.xml"/></resources></manifest>',
      ],
      [
        "items/fragment.xml",
        "xml",
        '<?xml version="1.0" encoding="UTF-8"?>\n<div xmlns="http://www.imsglobal.org/xsd/imsqtiasi_v3p0"><qti-portable-custom-interaction response-identifier="WIDGET2"/></div>',
      ],
      [
        "items/item.xml",
        "xml",
        '<?xml version="1.0" encoding="UTF-8"?>\n<qti-assessment-item xmlns="http://www.imsglobal.org/xsd/imsqtiasi_v3p0"><qti-item-body><p><qti-feedback-inline><xi:include xmlns:xi="http://www.w3.org/2001/XInclude" href="fragment.xml"/></qti-feedback-inline></p></qti-item-body></qti-assessment-item>',
      ],
      [
        "items/item2.xml",
        "xml",
        '<?xml version="1.0" encoding="UTF-8"?>\n<qti-assessment-item xmlns="http://www.imsglobal.org/xsd/imsqtiasi_v3p0" xmlns:xi="http://www.w3.org/2001/XInclude"><qti-item-body><xi:include href="fragment.xml"/></qti-item-body></qti-assessment-item>',
      ],
    ],
    fix: "a stated limit (spec reading 1): one fragment holding a portable custom interaction is placed in two items, once inside qti-feedback-inline, and Adaptive feedback's PlacedBinding containment is judged per node, not per placement (spec reading 117's fragment-context kin); Binding declared refuses it on both sides; lifted by judging a fragment's feedback context per placement",
    owner: "decision 463",
    signature: {
      kind: "import-only-law",
      law: {
        from: {
          relation: "PlacedBinding",
          selection: {
            conjuncts: [
              {
                kind: "compare",
                left: { field: "adaptive", kind: "field" },
                op: "eq",
                right: { kind: "literal", value: false },
              },
              {
                kind: "compare",
                left: { field: "attribute", kind: "field" },
                op: "eq",
                right: { kind: "literal", value: "response-identifier" },
              },
            ],
          },
          terms: [
            { field: "package", kind: "field" },
            { field: "path", kind: "field" },
            { field: "start", kind: "field" },
          ],
        },
        kind: "contained",
        to: {
          relation: "Node",
          selection: {
            conjuncts: [
              {
                arg: { field: "kind", kind: "field" },
                kind: "in",
                values: [
                  "qti-associate-interaction",
                  "qti-choice-interaction",
                  "qti-custom-interaction",
                  "qti-drawing-interaction",
                  "qti-end-attempt-interaction",
                  "qti-extended-text-interaction",
                  "qti-gap-match-interaction",
                  "qti-graphic-associate-interaction",
                  "qti-graphic-gap-match-interaction",
                  "qti-graphic-order-interaction",
                  "qti-hotspot-interaction",
                  "qti-hottext-interaction",
                  "qti-inline-choice-interaction",
                  "qti-match-interaction",
                  "qti-media-interaction",
                  "qti-order-interaction",
                  "qti-portable-custom-interaction",
                  "qti-position-object-interaction",
                  "qti-select-point-interaction",
                  "qti-slider-interaction",
                  "qti-text-entry-interaction",
                  "qti-upload-interaction",
                ],
              },
              {
                kind: "compare",
                left: {
                  args: [
                    { field: "ancestry", kind: "field" },
                    {
                      args: [{ kind: "literal", value: "qti-feedback-block" }],
                      kind: "closedRow",
                      relation: "Enters",
                    },
                  ],
                  fn: "disjoint",
                  kind: "compute",
                },
                op: "eq",
                right: { kind: "literal", value: true },
              },
            ],
          },
          terms: [
            { field: "package", kind: "field" },
            { field: "path", kind: "field" },
            { field: "start", kind: "field" },
          ],
        },
      },
    },
  },
  {
    files: [
      [
        "imsmanifest.xml",
        "xml",
        '<?xml version="1.0" encoding="UTF-8"?>\n<manifest identifier="MANIFEST" xmlns="http://www.imsglobal.org/xsd/qti/qtiv3p0/imscp_v1p1"><metadata><schemaversion>3.0.1</schemaversion></metadata><resources><resource type="imsqti_fragment_xmlv3p0" href="rtest01/rtest01-fragment.xml"/></resources></manifest>',
      ],
      [
        "rtest01/rtest01-fragment.xml",
        "xml",
        '<?xml version="1.0" encoding="UTF-8"?>\n<div xmlns="http://www.imsglobal.org/xsd/imsqtiasi_v3p0" xmlns:xi="http://www.w3.org/2001/XInclude"><xi:include href="rtest01-fragment.xml"/><qti-hottext-interaction><p><qti-hottext identifier="-0"/></p></qti-hottext-interaction></div>',
      ],
    ],
    fix: "a stated limit (spec reading 1): in a fragment that includes itself the import still judges an attribute's value domain, while the law oracle reads no value domain there (decision 451's kin); Inclusion cycle refuses it on both sides; lifted by judging no value domain in a document an inclusion cycle refuses",
    owner: "decision 463",
    signature: {
      kind: "import-only-law",
      law: { kind: "check", name: "value_domain", relation: "Attribute" },
      limit: "an inclusion cycle",
    },
  },
  {
    files: [
      [
        "imsmanifest.xml",
        "xml",
        '<?xml version="1.0" encoding="UTF-8"?>\n<manifest identifier="MANIFEST" xmlns="http://www.imsglobal.org/xsd/qti/qtiv3p0/imscp_v1p1"><metadata><schemaversion>3.0.1</schemaversion></metadata><resources><resource type="imsqti_item_xmlv3p0" href="rtest01/rtest01-set03.xml"/><resource type="imsqti_fragment_xmlv3p0" href="rtest01/rtest01-fragment.xml"/></resources></manifest>',
      ],
      [
        "rtest01/rtest01-fragment.xml",
        "xml",
        '<?xml version="1.0" encoding="UTF-8"?>\n<p xmlns="http://www.imsglobal.org/xsd/imsqtiasi_v3p0"/>',
      ],
      [
        "rtest01/rtest01-set03.xml",
        "xml",
        '<?xml version="1.0" encoding="UTF-8"?>\n<qti-assessment-item xmlns="http://www.imsglobal.org/xsd/imsqtiasi_v3p0" xmlns:xi="http://www.w3.org/2001/XInclude"><qti-item-body><xi:include href="rtest01-fragment.xml"><p><qti-template-inline template-identifier="Kxx𝔸xéé語語語語éééxé𝔸x𝔸ééééx𝔸𝔸語語é𝔸𝔸xxé𝔸𝔸éxx𝔸x𝔸𝔸ééé語x語é語𝔸éé𝔸語𝔸xé語xéxx語𝔸𝔸xééxxéxx𝔸𝔸𝔸éé語𝔸𝔸x語éé語é𝔸𝔸𝔸x語xé語語é𝔸語xéxx𝔸éx語語x語語ééxé語語xxx語語é𝔸xéé𝔸𝔸語語ééé𝔸é𝔸𝔸𝔸語語𝔸語xx𝔸𝔸xé語xx語語x𝔸x𝔸x語xéé語éxxééxé語𝔸éxx𝔸x語é語xx𝔸éx𝔸𝔸語x𝔸語xxéx語éxéx𝔸𝔸é語語語é語é𝔸𝔸𝔸ééx𝔸é語𝔸xx𝔸語語ééééé𝔸𝔸𝔸éé語x𝔸éx語xé𝔸語é𝔸𝔸éé語語𝔸xxé𝔸éxxx𝔸é語xéé𝔸éx𝔸xéé𝔸é𝔸éééx𝔸é語x語éxéx𝔸𝔸語x𝔸語éééé𝔸語xxé語éé語xx𝔸é語éééx𝔸𝔸𝔸ééé𝔸語x𝔸xxéx語xx語x語x語語𝔸𝔸語語xxxéx語x語𝔸x𝔸𝔸語é𝔸語𝔸語𝔸xx語語é𝔸𝔸𝔸𝔸xé𝔸é𝔸𝔸ééééé𝔸𝔸é語xééx語𝔸é語xé𝔸ééx𝔸𝔸𝔸語𝔸x𝔸語𝔸語x𝔸𝔸語xéé𝔸𝔸éxéx語𝔸𝔸éé語éx語x𝔸éxxéx語ééx語xé𝔸x𝔸x𝔸𝔸xé𝔸語語語é語éxx語𝔸𝔸語ééxéx語é𝔸é𝔸𝔸é𝔸é𝔸ééx語éx𝔸語xx𝔸語x𝔸éx𝔸é𝔸xx語語語éé𝔸語ééxxxxéx語語𝔸éé語語𝔸𝔸𝔸𝔸語𝔸ééx𝔸𝔸x𝔸x語𝔸語éx語𝔸éé𝔸xéxé𝔸語𝔸語𝔸𝔸語𝔸é語𝔸é𝔸語éxx𝔸é𝔸𝔸é𝔸𝔸x語xé𝔸xéé𝔸x𝔸𝔸xéé語語語語é語é語語xxéx𝔸éxx𝔸éx語語語語語𝔸é語𝔸xxééxéxx𝔸xx語𝔸x𝔸𝔸éééxéxx語éé𝔸語語語語xxé語xx𝔸éx語語𝔸𝔸𝔸語xxxé語𝔸𝔸ééx𝔸語𝔸xxx𝔸語語é𝔸語éxéxéxé𝔸𝔸𝔸𝔸𝔸𝔸𝔸éx𝔸xééééxx語é語x語語𝔸語x語xéx𝔸𝔸語語xx𝔸𝔸éx語x語𝔸𝔸語語é𝔸𝔸é語𝔸語x語xx𝔸éxé𝔸x𝔸𝔸𝔸x語語𝔸x𝔸x語𝔸x語語語語x語語xéxé語é語語𝔸𝔸é𝔸x𝔸x𝔸𝔸𝔸𝔸x語語語x語éé𝔸xx語xxx語xxééx𝔸é語語語é𝔸𝔸語x語𝔸語xxéééé𝔸x𝔸xé語x語é語語𝔸é語語語𝔸𝔸𝔸語語é語x𝔸語語語x𝔸𝔸𝔸𝔸語𝔸語語𝔸語x𝔸xé𝔸語𝔸é語𝔸𝔸𝔸語𝔸éé語𝔸é語𝔸é𝔸𝔸xéx語x語xx𝔸x𝔸𝔸éx𝔸x語é𝔸𝔸語語語𝔸𝔸ééé𝔸𝔸é𝔸𝔸é語語語é𝔸é語語xx語xxx𝔸𝔸𝔸𝔸𝔸é𝔸xé𝔸𝔸é語𝔸é語𝔸xé𝔸語xxxéé𝔸é𝔸x𝔸語𝔸𝔸𝔸ééx𝔸éxxé語語𝔸𝔸語é𝔸𝔸𝔸𝔸é𝔸x語é𝔸𝔸語𝔸xxééx語語x語"/></p></xi:include></qti-item-body></qti-assessment-item>',
      ],
    ],
    fix: "reading 118 decided 2026-11-09; the law oracle should assess content outside xi:fallback laxly, as the importer does (#66)",
    owner: "decision 467",
    signature: {
      kind: "import-only-law",
      law: { kind: "check", name: "value_domain", relation: "Attribute" },
      limit: "content outside xi:fallback (#66)",
    },
  },
  {
    files: [
      [
        "imsmanifest.xml",
        "xml",
        '<?xml version="1.0" encoding="UTF-8"?>\n<manifest identifier="MANIFEST" xmlns="http://www.imsglobal.org/xsd/qti/qtiv3p0/imscp_v1p1"><metadata><schemaversion>3.0.1</schemaversion></metadata><resources><resource type="imsqti_fragment_xmlv3p0" href="items/media/pic.png"/><resource type="imsqti_test_xmlv3p0" href="test.xml"/></resources></manifest>',
      ],
      [
        "items/media/pic.png",
        "b64",
        "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAC0lEQVR4nGNgAAIAAAUAAXpeqz8AAAAASUVORK5CYII=",
      ],
      ["test.xml", "xml", '<?xml version="1.0" encoding="UTF-8"?>\n<qti-assessment-test/>'],
    ],
    fix: "a stated limit (spec reading 1): two documents fail the codec differently (a binary file typed as a fragment, a namespace-less root), and each side names the first in manifest order (the law oracle's judge in src/test/oracle.ts, the import's listDocuments in src/import/read.ts), so the rule named moves with resource order; the codec refuses it on both sides; lifted by a codec precedence that names one rule whatever the order",
    noised: { noise: "resource-order", salt: 90 },
    owner: "decision 463",
    signature: { kind: "noise-moved", noise: "resource-order", side: "import" },
  },
  {
    files: [
      [
        "imsmanifest.xml",
        "xml",
        '<?xml version="1.0" encoding="UTF-8"?>\n<manifest identifier="MANIFEST" xmlns="http://www.imsglobal.org/xsd/qti/qtiv3p0/imscp_v1p1"><metadata><schemaversion>3.0.1</schemaversion></metadata><resources><resource type="imsqti_fragment_xmlv3p0" href="items/media/pic.png"/><resource type="imsqti_test_xmlv3p0" href="test.xml"/></resources></manifest>',
      ],
      [
        "items/media/pic.png",
        "b64",
        "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAC0lEQVR4nGNgAAIAAAUAAXpeqz8AAAAASUVORK5CYII=",
      ],
      ["test.xml", "xml", '<?xml version="1.0" encoding="UTF-8"?>\n<qti-assessment-test/>'],
    ],
    fix: "a stated limit (spec reading 1): two documents fail the codec differently (a binary file typed as a fragment, a namespace-less root), and each side names the first in manifest order (the law oracle's judge in src/test/oracle.ts, the import's listDocuments in src/import/read.ts), so the rule named moves with resource order; the codec refuses it on both sides; lifted by a codec precedence that names one rule whatever the order",
    noised: { noise: "resource-order", salt: 90 },
    owner: "decision 463",
    signature: { kind: "noise-moved", noise: "resource-order", side: "oracle" },
  },
];

/**
 * The disagreements a fix closed, each kept as a seed: the closed class's signature, the lane that
 * fixed it, the fix, and the package that showed it, which must never show it again.
 */
export const fixed: readonly Known[] = [
  {
    files: [
      [
        "d0.xml",
        "xml",
        '<?xml version="1.0" encoding="UTF-8"?>\n<div xmlns="http://www.imsglobal.org/xsd/imsqtiasi_v3p0"><qti-hottext-interaction><p><qti-hottext identifier="N2"/></p></qti-hottext-interaction></div>',
      ],
      [
        "imsmanifest.xml",
        "xml",
        '<?xml version="1.0" encoding="UTF-8"?>\n<manifest identifier="MANIFEST" xmlns="http://www.imsglobal.org/xsd/qti/qtiv3p0/imscp_v1p1"><metadata><schemaversion>3.0.1</schemaversion></metadata><resources><resource type="imsqti_section_xmlv3p0" href="d0.xml"/><resource type="imsqti_test_xmlv3p0" href="test.xml"/></resources></manifest>',
      ],
      [
        "test.xml",
        "xml",
        '<?xml version="1.0" encoding="UTF-8"?>\n<qti-assessment-test xmlns="http://www.imsglobal.org/xsd/imsqtiasi_v3p0"><qti-test-part><qti-assessment-section><qti-assessment-section><qti-assessment-section-ref href="d0.xml"/><qti-assessment-section><qti-assessment-section-ref href="d0.xml"/></qti-assessment-section></qti-assessment-section></qti-assessment-section></qti-test-part></qti-assessment-test>',
      ],
    ],
    fix: "decision 463's limit lifted (spec reading 1): a section ref places its target only where the target's root is a test's or a section's (assembledRoots), as the law oracle places only those, so a document whose root its section type refuses is placed in no assembly and none of its references or choices is read there; Document entry and RootOfType refuse it on both sides",
    owner: "P-SCHEMA",
    signature: {
      kind: "import-only-law",
      law: {
        kind: "key",
        side: {
          relation: "PlacedHottext",
          selection: { conjuncts: [] },
          terms: [
            { field: "package", kind: "field" },
            { field: "assembly", kind: "field" },
            { field: "identifier", kind: "field" },
          ],
        },
      },
    },
  },
  {
    files: [
      [
        "imsmanifest.xml",
        "xml",
        '<?xml version="1.0" encoding="UTF-8"?>\n<manifest identifier="MANIFEST" xmlns="http://www.imsglobal.org/xsd/qti/qtiv3p0/imscp_v1p1"><metadata><schemaversion>3.0.1</schemaversion></metadata><resources><resource type="imsqti_fragment_xmlv3p0" href="rtest01/rtest01-fragment.xml"/><resource type="imsqti_test_xmlv3p0" href="test.xml"/></resources></manifest>',
      ],
      [
        "rtest01/rtest01-fragment.xml",
        "xml",
        '<?xml version="1.0" encoding="UTF-8"?>\n<div xmlns="http://www.imsglobal.org/xsd/imsqtiasi_v3p0"><qti-hottext-interaction><p><qti-hottext><xi:include xmlns:xi="http://www.w3.org/2001/XInclude" href="rtest01-fragment.xml"/></qti-hottext></p></qti-hottext-interaction></div>',
      ],
      [
        "test.xml",
        "xml",
        '<?xml version="1.0" encoding="UTF-8"?>\n<qti-assessment-test xmlns="http://www.imsglobal.org/xsd/imsqtiasi_v3p0"><qti-test-part><qti-assessment-section><qti-selection select="K語𝔸語é𝔸語xx語語𝔸ééx𝔸é𝔸xxééx𝔸xéxé語éx𝔸é語éé語xéx𝔸x語x語éx語é𝔸xxx語語éé語é語語𝔸x𝔸𝔸xx語𝔸x𝔸x語𝔸x語é𝔸x𝔸x語é𝔸éxééé語語xéé𝔸x𝔸é𝔸é語xéééx語é𝔸é語x𝔸語𝔸語語é𝔸語語éxé語éé語éé𝔸xééx𝔸x𝔸é語𝔸𝔸𝔸x語語x語𝔸語𝔸𝔸é𝔸𝔸éé𝔸xx語語x語xé𝔸語xx𝔸𝔸éx𝔸語x語𝔸語ééx𝔸éxx𝔸x語語語é語語𝔸éé語ééx語éééx𝔸語語x𝔸éé語x𝔸𝔸語é𝔸é𝔸xx語x語xééx語éxx語xx𝔸ééééx語語xé𝔸x𝔸é𝔸éxéx語éx語x𝔸ééx語xx語x語𝔸ééé語éx語𝔸語éx語𝔸ééxéé語é𝔸éé語𝔸x語é語xxx語éxé語語語x𝔸𝔸é𝔸𝔸x語語xx語𝔸𝔸語𝔸語語𝔸é語x𝔸x𝔸x語x𝔸xxé𝔸𝔸xx𝔸語x𝔸𝔸xé𝔸xé𝔸é𝔸x𝔸語ééé𝔸語é語𝔸xéx語é𝔸𝔸éé𝔸𝔸𝔸x語éxxxx𝔸𝔸é語語𝔸語語éé𝔸x𝔸𝔸語語xé𝔸𝔸é𝔸é𝔸𝔸x𝔸𝔸éx𝔸𝔸x𝔸語𝔸xxx𝔸𝔸xééé語語語xx語ééé語éxxéx𝔸é𝔸語éx語éx語xé𝔸𝔸é𝔸語é語éxéx𝔸𝔸𝔸𝔸é語é𝔸é𝔸𝔸éé語𝔸語𝔸語𝔸語語𝔸x語xé語語éx語𝔸x語語éééééé𝔸éé語é語éxx語é語x𝔸語語x𝔸語𝔸語é語𝔸éééxéé𝔸é語é𝔸𝔸語𝔸𝔸ééxé𝔸語é𝔸𝔸éxx語語𝔸𝔸𝔸語xéé𝔸xxéééxx語𝔸x語é𝔸語x𝔸語xx𝔸x語é𝔸語語𝔸xéx𝔸𝔸語𝔸éé語xx𝔸語é𝔸é𝔸𝔸é𝔸éxxxéx𝔸é語ééé𝔸é𝔸語é語𝔸𝔸é𝔸é𝔸x語x𝔸x語𝔸語éé𝔸xx語語x語𝔸𝔸語語é𝔸ééé𝔸𝔸xx𝔸x語é語x語é語éx語é語éé語𝔸𝔸𝔸x𝔸𝔸x語ééé𝔸語𝔸𝔸éé語x語𝔸𝔸xééx𝔸xé語語é語𝔸語x語𝔸éé𝔸𝔸éé𝔸x𝔸é𝔸語語xé語𝔸x語語xx𝔸xé𝔸éxx語x語𝔸𝔸語𝔸x𝔸𝔸語語é𝔸x語𝔸語x𝔸𝔸x語x語𝔸xx語x語𝔸é𝔸éxéé𝔸語é𝔸𝔸x語éx𝔸éx𝔸𝔸x𝔸é語𝔸𝔸語x𝔸éxéx語𝔸語éé語語ééxé𝔸語語語𝔸語xé語語x𝔸x𝔸é語語語𝔸𝔸xé語x語語é𝔸𝔸é語語éé語語x𝔸語𝔸é語é語xéx語xxé語é𝔸x𝔸語x語é語語𝔸x語語語xéé語語x𝔸𝔸語語語語é𝔸語𝔸語𝔸xx𝔸𝔸x𝔸𝔸語語𝔸é語𝔸𝔸𝔸x語é語éé語xéééé語語é𝔸語𝔸x語éx語𝔸xééé語é𝔸x𝔸éx語𝔸語x𝔸語語語𝔸éx𝔸𝔸𝔸𝔸𝔸x𝔸xé語é語x語𝔸é語𝔸éé𝔸𝔸𝔸𝔸語éx語éx語𝔸éx"/></qti-assessment-section></qti-test-part></qti-assessment-test>',
      ],
    ],
    fix: "issue #67 (decision 467), closed by 74db65bd: the import writes a SectionSelection row whatever its select holds, and SelectForm's pattern law refuses a form that names no integer, so a non-integer select past the key-text bound is keyed and bounded on the import's side as the law oracle bounds SectionSelection.selectLexical; the inclusion cycle is incidental, and value domain refuses it on both sides",
    owner: "decision 467",
    signature: { kind: "oracle-only-law", law: "Key text bound", limit: "an inclusion cycle" },
  },
  {
    files: [
      [
        "imsmanifest.xml",
        "xml",
        '<?xml version="1.0" encoding="UTF-8"?>\n<manifest identifier="MANIFEST" xmlns="http://www.imsglobal.org/xsd/qti/qtiv3p0/imscp_v1p1"><metadata><schemaversion>3.0.1</schemaversion></metadata><resources><resource type="imsqti_section_xmlv3p0" href="section.xml"/><resource type="imsqti_test_xmlv3p0" href="test.xml"/></resources></manifest>',
      ],
      [
        "section.xml",
        "xml",
        '<?xml version="1.0" encoding="UTF-8"?>\n<qti-assessment-section xmlns="http://www.imsglobal.org/xsd/imsqtiasi_v3p0"><qti-rubric-block><qti-content-body><div><qti-portable-custom-interaction><qti-context-variable identifier="CTX"/></qti-portable-custom-interaction></div></qti-content-body></qti-rubric-block></qti-assessment-section>',
      ],
      [
        "test.xml",
        "xml",
        '<?xml version="1.0" encoding="UTF-8"?>\n<qti-assessment-test xmlns="http://www.imsglobal.org/xsd/imsqtiasi_v3p0"><qti-test-part><qti-assessment-section><qti-assessment-section-ref href="section.xml"/></qti-assessment-section></qti-test-part></qti-assessment-test>',
      ],
    ],
    fix: "no longer shown since the merge of #96 (9cf1cc67) onto our model: a section document's context variable is written as one of its names (FragmentContextName, #pantry/qti/interactions.ts) and resolved under each placement, in a rubric's portable custom interaction too, so the import's rows break Context variable reference where the law oracle raises it; N6 ancestry refuses it on both sides",
    owner: "decision 463",
    signature: { kind: "oracle-only-law", law: "Context variable reference" },
  },
  {
    files: [
      [
        "choice.xml",
        "xml",
        `<?xml version="1.0" encoding="UTF-8"?>
<qti-assessment-item/>`,
      ],
      [
        "es/choice.xml",
        "xml",
        `<?xml version="1.0" encoding="UTF-8"?>
<qti-assessment-item/>`,
      ],
      [
        "images/sign.png",
        "b64",
        "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",
      ],
      [
        "imsmanifest.xml",
        "xml",
        `<?xml version="1.0" encoding="UTF-8"?>
<manifest xmlns="http://www.imsglobal.org/xsd/qti/qtiv3p0/imscp_v1p1" xmlns:cpx="http://www.imsglobal.org/xsd/qti/qtiv3p0/imscp_extensionv1p2" identifier="MANIFEST-85D76736-6D19-9DC0-7C0B-57C31A9FD390"><metadata><schema>QTI Package</schema><schemaversion>3.0.1</schemaversion></metadata><organizations/><resources><resource identifier="choice" type="imsqti_item_xmlv3p0"><file href="choice.xml"/><cpx:variant identifier="v1"/></resource><resource identifier="choice-twin" type="pls"><file href="images/sign.png"/><cpx:variant identifier="v1"/></resource><resource identifier="choice_es" type="imsqti_item_xmlv3p0"><file href="es/choice.xml"/></resource></resources></manifest>`,
      ],
    ],
    fix: "an element the grammar does not admit where it stands binds no ID (DocumentId.admitted, IdBinding.admitted), so a forbidden cpx:variant is refused under N5 admitted alone and DocumentId key reads only an admitted element's IDs (R2)",
    owner: "genetic-repair gr-4",
    signature: {
      importRule: "document-key",
      kind: "lone-refusal",
      law: "N5 admitted",
      witness: "unreported",
    },
  },
  {
    files: [
      [
        "imsmanifest.xml",
        "xml",
        `<?xml version="1.0" encoding="UTF-8"?>
<manifest xmlns="http://www.imsglobal.org/xsd/qti/qtiv3p0/imscp_v1p1" identifier="M"><metadata><schemaversion>3.0.1</schemaversion></metadata><resources><resource identifier="R" type="imsqti_item_xmlv3p0" href="item.xml"><file href="item.xml"/></resource></resources></manifest>`,
      ],
      [
        "item.xml",
        "xml",
        `<?xml version="1.0" encoding="UTF-8"?>
<qti-assessment-item xmlns="http://www.imsglobal.org/xsd/imsqtiasi_v3p0" identifier="i" title="t" adaptive="false" time-dependent="false"><qti-response-declaration identifier="" cardinality="many" base-type="identifier"><qti-mapping default-value="0"><qti-map-entry map-key="A" mapped-value="1"/></qti-mapping></qti-response-declaration></qti-assessment-item>`,
      ],
    ],
    fix: "spec readings 157 and 158: a response declaration keeps its Declaration row whatever its identifier, cardinality and base type spell, so its mapping and each map key have their rows, judged as any other's (FIX-DECLNAME closed a nameless declaration's case, FIX-DECLCARD one whose cardinality or base type spells nothing)",
    owner: "FIX-DECLCARD",
    signature: {
      kind: "import-only-law",
      law: {
        from: {
          relation: "Attribute",
          selection: {
            conjuncts: [
              {
                kind: "compare",
                left: { field: "kind", kind: "field" },
                op: "eq",
                right: { kind: "literal", value: "qti-map-entry" },
              },
              {
                kind: "compare",
                left: { field: "name", kind: "field" },
                op: "eq",
                right: { kind: "literal", value: "map-key" },
              },
            ],
          },
          terms: [
            { field: "package", kind: "field" },
            { field: "path", kind: "field" },
            { field: "start", kind: "field" },
          ],
        },
        kind: "contained",
        to: {
          relation: "MapKey",
          selection: { conjuncts: [] },
          terms: [
            { field: "package", kind: "field" },
            { field: "path", kind: "field" },
            { field: "start", kind: "field" },
          ],
        },
      },
    },
  },
  {
    files: [
      [
        "imsmanifest.xml",
        "xml",
        `<?xml version="1.0" encoding="UTF-8"?>
<manifest xmlns="http://www.imsglobal.org/xsd/qti/qtiv3p0/imscp_v1p1" identifier="M"><metadata><schemaversion>3.0.1</schemaversion></metadata><resources><resource identifier="R" type="imsqti_item_xmlv3p0" href="item.xml"><file href="item.xml"/></resource></resources></manifest>`,
      ],
      [
        "item.xml",
        "xml",
        `<?xml version="1.0" encoding="UTF-8"?>
<qti-assessment-item xmlns="http://www.imsglobal.org/xsd/imsqtiasi_v3p0" identifier="i" title="t" adaptive="false" time-dependent="false"><qti-item-body><p>a <qti-gap identifier="G1"/> b</p></qti-item-body></qti-assessment-item>`,
      ],
    ],
    fix: "N8: the oracle states the choice law the schema does, every choice that writes its identifier in an interaction, its nearest (the information model's parents of each choice class, §5.55's gap, reading 38), so a qti-gap outside every qti-gap-match-interaction breaks N8 beside N6 on both sides",
    owner: "OL",
    signature: {
      kind: "import-only-law",
      law: {
        from: {
          relation: "Choice",
          selection: { conjuncts: [] },
          terms: [
            { field: "package", kind: "field" },
            { field: "path", kind: "field" },
            { field: "start", kind: "field" },
          ],
        },
        kind: "contained",
        to: {
          relation: "ChoiceInteraction",
          selection: { conjuncts: [] },
          terms: [
            { field: "package", kind: "field" },
            { field: "path", kind: "field" },
            { field: "start", kind: "field" },
          ],
        },
      },
    },
  },
  {
    files: [
      [
        "imsmanifest.xml",
        "xml",
        `<?xml version="1.0" encoding="UTF-8"?>
<manifest identifier="MANIFEST" xmlns="http://www.imsglobal.org/xsd/qti/qtiv3p0/imscp_v1p1"><metadata><schemaversion>3.0.1</schemaversion></metadata><resources><resource type="imsqti_test_xmlv3p0" href="test.xml"/></resources></manifest>`,
      ],
      [
        "test.xml",
        "xml",
        `<?xml version="1.0" encoding="UTF-8"?>
<qti-assessment-test xmlns="http://www.imsglobal.org/xsd/imsqtiasi_v3p0"><qti-test-part><qti-assessment-section identifier="1x"/><qti-assessment-section identifier="1x"/></qti-test-part></qti-assessment-test>`,
      ],
    ],
    fix: "spec reading 152 and decision 457 (2): a test part's, section's, section ref's or item ref's identifier that is no NCName once collapsed names nothing, so it writes no Named row and its value domain refuses it alone, where the import wrote one for each and two such identifiers collided in Named's key",
    owner: "genetic-repair-2 gr2-3",
    signature: {
      kind: "import-only-law",
      law: {
        kind: "key",
        side: {
          relation: "Named",
          selection: { conjuncts: [] },
          terms: [
            { field: "package", kind: "field" },
            { field: "path", kind: "field" },
            { field: "identifier", kind: "field" },
          ],
        },
      },
    },
  },
  {
    files: [
      [
        "imsmanifest.xml",
        "xml",
        `<?xml version="1.0" encoding="UTF-8"?>
<manifest identifier="MANIFEST" xmlns="http://www.imsglobal.org/xsd/qti/qtiv3p0/imscp_v1p1" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"><metadata><schemaversion>3.0.1</schemaversion></metadata><resources><resource type="imsqti_item_xmlv3p0" href="rtest01/rtest01-set03.xml"/></resources></manifest>`,
      ],
      [
        "rtest01/rtest01-set03.xml",
        "xml",
        `<?xml version="1.0" encoding="UTF-8"?>
<qti-assessment-item xmlns="http://www.imsglobal.org/xsd/imsqtiasi_v3p0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xi="http://www.w3.org/2001/XInclude"><qti-item-body><xi:include/></qti-item-body></qti-assessment-item>`,
      ],
    ],
    fix: "25d16460 (SitePath) writes a site's href as a row of its own, only where the site writes one that resolves, so an include with no href has no stand-in path and Include target alone refuses it",
    owner: "NIL",
    signature: {
      kind: "import-only-law",
      law: {
        from: {
          relation: "SitePath",
          selection: { conjuncts: [] },
          terms: [
            { field: "package", kind: "field" },
            { field: "path", kind: "field" },
            { field: "start", kind: "field" },
            { field: "target", kind: "field" },
          ],
        },
        kind: "contained",
        to: {
          relation: "ReferencePath",
          selection: {
            conjuncts: [
              {
                kind: "compare",
                left: { field: "name", kind: "field" },
                op: "eq",
                right: { kind: "literal", value: "href" },
              },
            ],
          },
          terms: [
            { field: "package", kind: "field" },
            { field: "path", kind: "field" },
            { field: "start", kind: "field" },
            { field: "target", kind: "field" },
          ],
        },
      },
    },
  },
  {
    files: [
      [
        "es/choice.xml",
        "xml",
        `<?xml version="1.0" encoding="UTF-8"?>
<qti-assessment-item xmlns="http://www.imsglobal.org/xsd/imsqtiasi_v3p0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
    
    
    <qti-item-body>
        
        <p>
            <img aria-haspopup="x"/>
        </p>
        
    </qti-item-body>
    
</qti-assessment-item>`,
      ],
      [
        "imsmanifest.xml",
        "xml",
        `<?xml version="1.0" encoding="UTF-8"?>
<manifest identifier="MANIFEST" xmlns="http://www.imsglobal.org/xsd/qti/qtiv3p0/imscp_v1p1" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:cpx="http://www.imsglobal.org/xsd/qti/qtiv3p0/imscp_extensionv1p2">
    <metadata>
        
        <schemaversion>3.0.1</schemaversion>
        
    </metadata>
    
    <resources>
        <resource>
            
            
            
            <cpx:variant identifier="v1" identifierref="choice_es">
                
            </cpx:variant>
        </resource>
        <resource type="imsqti_item_xmlv3p0" href="es/choice.xml">
            
        </resource>
    </resources>
</manifest>`,
      ],
    ],
    fix: "the variant class: the 3.0.1 profile forbids cpx:variant (its maxOccurs is 0), and the oracle's fold now refuses the node, drops its subtree and folds the rest, so it judges every document's rows and precedence picks among every breach",
    owner: "VD",
    signature: {
      kind: "import-only-law",
      law: { kind: "check", name: "value_domain", relation: "Attribute" },
    },
  },
  {
    files: [
      [
        "imsmanifest.xml",
        "xml",
        `<?xml version="1.0" encoding="UTF-8"?>
<manifest identifier="MANIFEST" xmlns="http://www.imsglobal.org/xsd/qti/qtiv3p0/imscp_v1p1"><metadata><schemaversion>3.0.1</schemaversion></metadata><resources><resource type="resourceextmetadata/xml " href="item.xml"/><resource type="imsqti_test_xmlv3p0" href="test.xml"/></resources></manifest>`,
      ],
      [
        "test.xml",
        "xml",
        `<?xml version="1.0" encoding="UTF-8"?>
<qti-assessment-test xmlns="http://www.imsglobal.org/xsd/imsqtiasi_v3p0"><qti-test-part><qti-assessment-section><qti-assessment-section><qti-assessment-item-ref href="item.xml"/></qti-assessment-section></qti-assessment-section></qti-test-part></qti-assessment-test>`,
      ],
    ],
    fix: 'decision 454: an item ref whose path only a resource of an unread type names has an ItemRefHref and no target (the query UntargetedItemRef), contained in UnreadTypeHref, so "Item ref target" asks it for no target, as the law oracle names none; the package is R-O6, and its type="bogus" twin showed the same class',
    owner: "genetic-repair gr-5b",
    // His key, "contained Attribute(node) in ItemRefTarget(node)", is the law this fix split: an
    // item ref's href is held to its ItemRefHref, and its ItemRefHref to its targets, which the
    // database now derives (the query ItemRefTarget). Its class, an item ref href the rows leave
    // unheld, is the href's containment in ItemRefHref.
    signature: {
      kind: "import-only-law",
      law: {
        from: {
          relation: "Attribute",
          selection: {
            conjuncts: [
              {
                kind: "compare",
                left: { field: "kind", kind: "field" },
                op: "eq",
                right: { kind: "literal", value: "qti-assessment-item-ref" },
              },
              {
                kind: "compare",
                left: { field: "name", kind: "field" },
                op: "eq",
                right: { kind: "literal", value: "href" },
              },
            ],
          },
          terms: [
            { field: "package", kind: "field" },
            { field: "path", kind: "field" },
            { field: "start", kind: "field" },
          ],
        },
        kind: "contained",
        to: {
          relation: "ItemRefHref",
          selection: { conjuncts: [] },
          terms: [
            { field: "package", kind: "field" },
            { field: "path", kind: "field" },
            { field: "start", kind: "field" },
          ],
        },
      },
    },
  },
  {
    files: [
      [
        "imsmanifest.xml",
        "xml",
        `<?xml version="1.0" encoding="UTF-8"?>
<manifest identifier="MANIFEST" xmlns="http://www.imsglobal.org/xsd/qti/qtiv3p0/imscp_v1p1">
  <metadata>
    <schema>QTI Package</schema>
    <schemaversion>3.0.1</schemaversion>
  </metadata>
  <organizations/>
  <resources>
    <resource>
      <file href="item.xml"/>
    </resource>
    <resource identifier="test-res" type="imsqti_test_xmlv3p0" href="test.xml">
      <file href="test.xml"/>
      
    </resource>
  </resources>
</manifest>`,
      ],
      [
        "item.xml",
        "xml",
        `<?xml version="1.0" encoding="UTF-8"?>
<qti-assessment-item>
  
</qti-assessment-item>`,
      ],
      [
        "test.xml",
        "xml",
        `<?xml version="1.0" encoding="UTF-8"?>
<qti-assessment-test xmlns="http://www.imsglobal.org/xsd/imsqtiasi_v3p0">
  <qti-test-part>
    
    <qti-assessment-section identifier="s32">
      <qti-assessment-section identifier="s31">
        
        <qti-assessment-section identifier="s28" title="s28" visible="true">
          
          <qti-assessment-item-ref identifier="i27">
          </qti-assessment-item-ref>
        </qti-assessment-section>
        
      </qti-assessment-section>
    </qti-assessment-section>
    
  </qti-test-part>
</qti-assessment-test>`,
      ],
    ],
    fix: "spec reading 155: an item ref that writes no href names nothing, so the schema demands no ItemRefTarget, ReferencePath or NameLookup type of it and AL3 alone refuses it, and the law oracle judges an item ref's laws whether or not it, its sections or its part write an identifier",
    owner: "FIX-ITEMREF",
    signature: {
      importRule: "item-ref-target",
      kind: "lone-refusal",
      law: "AL3 required",
      witness: "unreported",
    },
  },
  {
    files: [
      [
        "imsmanifest.xml",
        "xml",
        `<?xml version="1.0" encoding="UTF-8"?>
<manifest xmlns="http://www.imsglobal.org/xsd/qti/qtiv3p0/imscp_v1p1" identifier="M"><metadata><schemaversion>3.0.1</schemaversion></metadata><resources><resource identifier="R" type="imsqti_item_xmlv3p0" href="item.xml"><file href="item.xml"/></resource></resources></manifest>`,
      ],
      [
        "item.xml",
        "xml",
        `<?xml version="1.0" encoding="UTF-8"?>
<qti-assessment-item xmlns="http://www.imsglobal.org/xsd/imsqtiasi_v3p0" identifier="i" title="t" adaptive="false" time-dependent="false"><qti-item-body><p>a <qti-gap identifier="G1"/> b</p></qti-item-body></qti-assessment-item>`,
      ],
    ],
    fix: "TD-B's or-n6-missing, kept as a planted bug: the oracle's N6 reads the flags a kind needs (Needs), so a qti-gap outside every qti-gap-match-interaction breaks N6 beside N5 Follow, and N5 Follow is never the oracle's lone law here",
    owner: "GEN-A",
    signature: {
      importRule: "owner-copy",
      kind: "lone-refusal",
      law: "N5 Follow",
      witness: "unreported",
    },
  },
  {
    files: [
      [
        "es/choice.xml",
        "xml",
        `<?xml version="1.0" encoding="UTF-8"?>
<qti-assessment-item xmlns="http://www.imsglobal.org/xsd/imsqtiasi_v3p0"><qti-item-body><p><img aria-haspopup="x"/></p></qti-item-body></qti-assessment-item>`,
      ],
      [
        "imsmanifest.xml",
        "xml",
        `<?xml version="1.0" encoding="UTF-8"?>
<manifest identifier="MANIFEST" xmlns="http://www.imsglobal.org/xsd/qti/qtiv3p0/imscp_v1p1" xmlns:cpx="http://www.imsglobal.org/xsd/qti/qtiv3p0/imscp_extensionv1p2"><metadata><schemaversion>3.0.1</schemaversion></metadata><resources><resource identifier="choice"><cpx:variant/></resource><resource identifier="choice_es" type="imsqti_item_xmlv3p0" href="es/choice.xml"><file href="es/choice.xml"/></resource></resources></manifest>`,
      ],
    ],
    fix: "the variant class: the 3.0.1 profile forbids cpx:variant (its maxOccurs is 0), and the oracle's fold now refuses the node, drops its subtree and folds the rest, so it judges every document's rows and precedence picks among every breach",
    owner: "VD",
    signature: {
      importRule: "attribute-lexical",
      kind: "lone-refusal",
      law: "N5 admitted",
      witness: "unreported",
    },
  },
  {
    files: [
      [
        "choice.xml",
        "xml",
        `<?xml version="1.0" encoding="UTF-8"?>
<qti-assessment-item xmlns="http://www.imsglobal.org/xsd/imsqtiasi_v3p0"><qti-item-body><qti-choice-interaction response-identifier="RESPONSE"/></qti-item-body></qti-assessment-item>`,
      ],
      [
        "imsmanifest.xml",
        "xml",
        `<?xml version="1.0" encoding="UTF-8"?>
<manifest identifier="MANIFEST" xmlns="http://www.imsglobal.org/xsd/qti/qtiv3p0/imscp_v1p1" xmlns:cpx="http://www.imsglobal.org/xsd/qti/qtiv3p0/imscp_extensionv1p2"><metadata><schemaversion>3.0.1</schemaversion></metadata><resources><resource type="imsqti_item_xmlv3p0" href="choice.xml"><cpx:variant/></resource></resources></manifest>`,
      ],
    ],
    fix: "the variant class: the 3.0.1 profile forbids cpx:variant (its maxOccurs is 0), and the oracle's fold now refuses the node, drops its subtree and folds the rest, so it judges every document's rows and precedence picks among every breach",
    owner: "VD",
    signature: {
      importRule: "binding-declared",
      kind: "lone-refusal",
      law: "N5 admitted",
      witness: "unreported",
    },
  },
  {
    files: [
      [
        "choice.xml",
        "xml",
        `<?xml version="1.0" encoding="UTF-8"?>
<qti-assessment-item/>`,
      ],
      [
        "es/choice.xml",
        "xml",
        `<?xml version="1.0" encoding="UTF-8"?>
<manifest xmlns="http://www.imsglobal.org/xsd/qti/qtiv3p0/imscp_v1p1" xmlns:imsmd="http://ltsc.ieee.org/xsd/LOM" identifier="MANIFEST-85D76736-6D19-9DC0-7C0B-57C31A9FD390"><metadata><schema>QTI Package</schema><schemaversion>3.0.1</schemaversion></metadata><organizations/><resources><resource identifier="choice" type="imsqti_item_xmlv3p0" href="choice.xml"><metadata><imsmd:lom><imsmd:general><imsmd:identifier><imsmd:entry/></imsmd:identifier></imsmd:general></imsmd:lom></metadata><file href="images/sign.png"/></resource></resources></manifest>`,
      ],
      [
        "images/sign.png",
        "b64",
        `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`,
      ],
      [
        "imsmanifest.xml",
        "xml",
        `<?xml version="1.0" encoding="UTF-8"?>
<manifest xmlns="http://www.imsglobal.org/xsd/qti/qtiv3p0/imscp_v1p1" identifier="MANIFEST-85D76736-6D19-9DC0-7C0B-57C31A9FD390"><metadata><schema>QTI Package</schema><schemaversion>3.0.1</schemaversion></metadata><organizations/><resources><resource identifier="choice" type="imsqti_item_xmlv3p0"><file href="choice.xml"/><file href="images/sign.png"/></resource><resource identifier="choice_es" type="imsqti_item_xmlv3p0" href="es/choice.xml"><file href="es/choice.xml"/></resource></resources></manifest>`,
      ],
    ],
    fix: "fix (3): a package's records are read from its manifest and its record files alone (recordDocumentTypes), and the Manifest overlay selections read the manifest's cp:* attributes alone, each read in the manifest alone, the document at imsmanifest.xml, and a record's document by its Document's type (170356bd's reading)",
    owner: "GEN-A",
    signature: {
      importRule: "lom-identifier",
      kind: "lone-refusal",
      law: "RootOfType",
      witness: "unreported",
    },
  },
  {
    files: [
      [
        "imsmanifest.xml",
        "xml",
        `<?xml version="1.0" encoding="UTF-8"?>
<manifest identifier="MANIFEST" xmlns="http://www.imsglobal.org/xsd/qti/qtiv3p0/imscp_v1p1"><metadata><schemaversion>3.0.1</schemaversion></metadata><resources><resource type="imsqti_item_xmlv3p0" href="item.xml"/></resources></manifest>`,
      ],
      [
        "item.xml",
        "xml",
        `<?xml version="1.0" encoding="UTF-8"?>
<manifest identifier="MANIFEST" xmlns="http://www.imsglobal.org/xsd/qti/qtiv3p0/imscp_v1p1"><resources><resource identifier="Ké𝔸語xx𝔸語x𝔸𝔸xxééé語𝔸語x語𝔸語語x𝔸語é𝔸𝔸語𝔸語語𝔸語語語x語𝔸語語x𝔸語x𝔸éxxx𝔸xx語xxx𝔸𝔸xx語𝔸x語xéxxéé語𝔸éé𝔸語𝔸語𝔸x語𝔸éx𝔸x𝔸語xéx𝔸𝔸xxé語𝔸語éé𝔸é𝔸𝔸𝔸語𝔸𝔸é語xxx語x𝔸𝔸xé語𝔸é𝔸語éxé𝔸éé語x𝔸𝔸語éxxéxé語x𝔸xx𝔸é𝔸語語éé語𝔸𝔸𝔸𝔸é𝔸𝔸語x語語語x𝔸é語é語語xxx語x𝔸𝔸𝔸語éé語é語é語語é語語𝔸語x語x𝔸語xxé語𝔸ééx語𝔸𝔸𝔸𝔸é𝔸語語xxééxé𝔸xé語語x𝔸語xx語語𝔸é𝔸x語語é𝔸x語𝔸𝔸éé𝔸語xé語語語xx語xxé語語語é語𝔸語xé語xé語é語x語語éxééé語語𝔸語x語𝔸𝔸éx𝔸語語é𝔸xxééé𝔸語xé語xéé𝔸𝔸x𝔸𝔸é𝔸éx𝔸x語ééééx語𝔸語xé語x𝔸語語xxxéé語é語x𝔸語𝔸é𝔸語x𝔸x語𝔸語語𝔸𝔸x語x語𝔸語𝔸語𝔸𝔸é𝔸𝔸𝔸𝔸𝔸éxééx語𝔸語𝔸é語語𝔸éxx𝔸ééx語éxé語x𝔸𝔸語xé𝔸𝔸xxé語xx語𝔸語語𝔸xéx語語𝔸x語x𝔸𝔸x語𝔸é語é語語𝔸語xéxxé𝔸éx語𝔸𝔸語x𝔸éé𝔸語xé𝔸x語xx語語語𝔸𝔸語語éx語éx語éxééé𝔸é𝔸x語𝔸é𝔸x語𝔸x語ééx語𝔸𝔸éxééé𝔸x𝔸語é𝔸語xéxxx𝔸語𝔸語éxxx𝔸é語𝔸語𝔸xxéx語xéx語é語𝔸𝔸𝔸𝔸𝔸éxxxé𝔸語語é語ééxéé語xéé𝔸xx語é𝔸𝔸𝔸𝔸éxé𝔸x語éx𝔸éé𝔸x語𝔸x語ééé𝔸𝔸𝔸éé語xé語𝔸é𝔸xx語é語𝔸x語é語éé語éxé𝔸𝔸x𝔸𝔸𝔸x𝔸𝔸é𝔸é𝔸éé𝔸éé語語xx𝔸𝔸xxééé𝔸xxé𝔸éx語語éxéx語語𝔸ééx語xx𝔸語語é𝔸x語𝔸é語éxééxé𝔸x語xxx語éxééé𝔸𝔸éx𝔸é語語x𝔸語語語é語éx語𝔸𝔸x語é𝔸語xxx𝔸語xéééx語語語𝔸éxéx語é𝔸éxx語é語xé𝔸𝔸x語é語xéx語語x語𝔸𝔸語xxé𝔸語xéxx語ééxé語𝔸語ééxé語é𝔸𝔸語xxéé𝔸xx𝔸éé語語éé語𝔸𝔸x語語x語xé語x𝔸éé語𝔸é𝔸xxé語x語x語語x𝔸xxxxx𝔸語xxxx語é𝔸é語é𝔸語x語xéé𝔸𝔸xxx𝔸𝔸𝔸𝔸x𝔸語語xxéxx語é語x語𝔸x語xé語éxxxxé語語語語x語𝔸語語é𝔸𝔸ééx𝔸é𝔸éx語é語𝔸xxxx語é𝔸éééx語xx語é語é𝔸𝔸é𝔸éx語語語語x𝔸éé𝔸ééé𝔸xééé𝔸xéé語xé語語xé𝔸xé𝔸éé𝔸x語𝔸éxééé語x語x𝔸𝔸xxxx𝔸xxx𝔸𝔸𝔸𝔸𝔸é語é語é語𝔸𝔸xéé語𝔸𝔸xx𝔸語ééé語éx語語𝔸x𝔸xxx"/></resources></manifest>`,
      ],
    ],
    fix: "fix (3): a package's records are read from its manifest and its record files alone (recordDocumentTypes), and the Manifest overlay selections read the manifest's cp:* attributes alone, each read in the manifest alone, the document at imsmanifest.xml, and a record's document by its Document's type (170356bd's reading)",
    owner: "GEN-A",
    signature: { kind: "oracle-only-law", law: "Key text bound" },
  },
  {
    files: [
      [
        "imsmanifest.xml",
        "xml",
        `<?xml version="1.0" encoding="UTF-8"?>
<manifest identifier="MANIFEST" xmlns="http://www.imsglobal.org/xsd/qti/qtiv3p0/imscp_v1p1"><metadata><schemaversion>3.0.1</schemaversion></metadata><resources><resource type="imsqti_test_xmlv3p0" href="test.xml"/></resources></manifest>`,
      ],
      [
        "test.xml",
        "xml",
        `<?xml version="1.0" encoding="UTF-8"?>
<qti-assessment-test xmlns="http://www.imsglobal.org/xsd/imsqtiasi_v3p0"><qti-test-part/><qti-test-part/></qti-assessment-test>`,
      ],
    ],
    fix: "efafab06, reading 147: an element that writes no identifier has no name in the law oracle, which read it as the empty one before, so two of one document, two test parts that write none, broke Structure identifier beside AL3 in the oracle alone (folded from import/overlays/unwritten-identifier.oracle.test.ts, unrun under the moratorium)",
    owner: "FB-TESTS",
    signature: { kind: "oracle-only-law", law: "Structure identifier" },
  },
];
