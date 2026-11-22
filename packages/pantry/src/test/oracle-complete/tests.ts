/**
 * The mutations of the law oracle's laws over tests, sections, banks and what they hold
 * (`#pantry/test/oracle-laws/tests.ts`, `#pantry/test/oracle-laws/readings.ts`), each drawn to
 * break exactly its law in an accepted package (`src/test/complete.oracle.test.ts`).
 *
 * Each edits the every-relation package's bank (`section.xml`: the bank `bank1` of the item refs
 * `item1`, `item2` and `item3`, each named by its item's identifier), its manifest or an item, or
 * lists the base test beside them (`#pantry/test/gen/base-test.ts`) and edits that. A mutation
 * never renames an element another reference names, since the reference would break a law of its
 * own first.
 */
import { element, int } from "@bjornpagen/testing/gen";
import type { Gen } from "@bjornpagen/testing/gen";
import { branchTo, testText } from "#pantry/test/gen/base-test.ts";
import type { TestEdit } from "#pantry/test/gen/base-test.ts";
import type { PackageEntries } from "#pantry/test/gen/every-relation.ts";
import {
  duplicateDrawn,
  editText,
  replaceOnce,
  textOf,
  withText,
} from "#pantry/test/oracle-complete/mutation.ts";
import type { Base, Mutation } from "#pantry/test/oracle-complete/mutation.ts";

/**
 * The every-relation bank.
 */
const bank = "section.xml";

/**
 * The every-relation manifest.
 */
const manifest = "imsmanifest.xml";

/**
 * The bank's item refs as the every-relation package writes them, each under its item's
 * identifier.
 */
const members = [
  { href: "items/item.xml", identifier: "item1" },
  { href: "items/item2.xml", identifier: "item2" },
  { href: "items/item3.xml", identifier: "item3" },
] as const;

/**
 * Write an item ref of the bank's.
 *
 * @param member - The item ref's identifier and href.
 * @param member.href - Its href.
 * @param member.identifier - Its identifier.
 * @returns The item ref's text.
 */
const refOf = ({ href, identifier }: { readonly href: string; readonly identifier: string }) =>
  `<qti-assessment-item-ref identifier="${identifier}" href="${href}"/>`;

/**
 * Draw one of a list of edits and apply it to the base.
 *
 * @param edits - The edits, each a drawn edit of the base's entries.
 * @returns The mutation's edit.
 */
const oneOf =
  (edits: readonly ((entries: PackageEntries) => Gen<PackageEntries>)[]) =>
  ({ entries }: Base): Gen<PackageEntries> =>
  (source) => {
    const edit = edits[source.draw(int(0, edits.length - 1))];
    if (edit === undefined) {
      throw new Error("no edit to draw");
    }

    return source.draw(edit(entries));
  };

/**
 * Edit one entry of a package by a fixed edit of its text.
 *
 * @param path - The entry's path.
 * @param edit - The edit.
 * @returns The drawn edit of the package, which draws nothing.
 */
const fixed =
  (path: string, edit: (text: string) => string) =>
  (entries: PackageEntries): Gen<PackageEntries> =>
  () =>
    editText(entries, path, edit);

/**
 * Edit one entry of a package by a drawn edit of its text.
 *
 * @param path - The entry's path.
 * @param edit - The drawn edit.
 * @returns The drawn edit of the package.
 */
const drawnIn =
  (path: string, edit: (text: string) => Gen<string>) =>
  (entries: PackageEntries): Gen<PackageEntries> =>
  (source) =>
    withText(entries, path, source.draw(edit(textOf(entries, path))));

/**
 * Add a document to a package beside a resource of its type that lists it, written before the
 * usage data's resource.
 *
 * @param entries - The package's entries.
 * @param document - The document: its path, its resource's identifier and type, and its text.
 * @param document.dependency - The resource its own depends on.
 * @param document.identifier - Its resource's identifier.
 * @param document.path - Its path.
 * @param document.text - Its text.
 * @param document.type - Its resource's type.
 * @returns The package's entries, the document among them.
 */
const listed = (
  entries: PackageEntries,
  document: {
    readonly dependency: string;
    readonly identifier: string;
    readonly path: string;
    readonly text: string;
    readonly type: string;
  },
): PackageEntries =>
  editText(withText(entries, document.path, document.text), manifest, (text) =>
    replaceOnce(
      text,
      '    <resource identifier="usage-res"',
      `    <resource identifier="${document.identifier}" type="${document.type}" href="${document.path}">\n      <file href="${document.path}"/>\n      <dependency identifierref="${document.dependency}"/>\n    </resource>\n    <resource identifier="usage-res"`,
    ),
  );

/**
 * List the base test beside the bank, written with a drawn edit of its places.
 *
 * @param edits - The drawn edit.
 * @returns The mutation's edit.
 */
const withTest =
  (edits: Gen<TestEdit>) =>
  ({ entries }: Base): Gen<PackageEntries> =>
  (source) =>
    listed(entries, {
      dependency: "item1-res",
      identifier: "test-res",
      path: "test.xml",
      text: testText(source.draw(edits)),
      type: "imsqti_test_xmlv3p0",
    });

/**
 * Draw one of a list of edits of the base test's places.
 *
 * @param edits - The edits.
 * @returns The drawn edit.
 */
const oneEdit = (edits: readonly TestEdit[] & Readonly<{ 0: TestEdit }>): Gen<TestEdit> =>
  element(edits);

/**
 * Draw one of the edits of the base test's places a list of values writes, one per value.
 *
 * @param values - The values.
 * @param edit - Each value's edit.
 * @returns The drawn edit.
 */
const eachEdit =
  <const A>(
    values: readonly A[] & Readonly<{ 0: A }>,
    edit: (value: A) => TestEdit,
  ): Gen<TestEdit> =>
  (source) =>
    edit(source.draw(element(values)));

/**
 * Each law's mutation, by law.
 */
export const testMutations = {
  // Branch forward (§5.23, §2.8.3.2, reading 87): an item ref's rule names itself, or the second
  // item ref's names the first, which comes before it in every order a delivery draws.
  "Branch forward": {
    law: "Branch forward",
    mutate: withTest(
      oneEdit([
        { item1: branchTo("item1") },
        { item1: branchTo("s1") },
        {
          parts: `<qti-assessment-item-ref identifier="item3" href="items/item3.xml">${branchTo("item1")}</qti-assessment-item-ref>`,
        },
      ]),
    ),
    over: "package",
  },
  // Branch target (§5.23, reading 87): an item ref's rule names nothing, or a test part.
  "Branch target": {
    law: "Branch target",
    mutate: withTest(oneEdit([{ item1: branchTo("nowhere") }, { item1: branchTo("part1") }])),
    over: "package",
  },
  // Item ref identifier (QTI §4.1.1): a bank member under another identifier than its item's.
  "Item ref identifier": {
    law: "Item ref identifier",
    mutate: oneOf(
      members.map((member) =>
        drawnIn(bank, (text) => (source) => {
          const identifier = source.draw(element(["itemX", "other", "item9"]));

          return replaceOnce(text, refOf(member), refOf({ href: member.href, identifier }));
        }),
      ),
    ),
    over: "package",
  },
  // Item ref target (B2, B3): an item ref whose href names the stimulus, the bank itself, the
  // usage data, a fragment, or a file no resource's href names; or an item resource's href whose
  // file the package does not hold, which names no item document (§5.6.5).
  "Item ref target": {
    law: "Item ref target",
    mutate: oneOf([
      ...members.map((member) =>
        drawnIn(bank, (text) => (source) => {
          const href = source.draw(
            element([
              "items/stimulus.xml",
              "section.xml",
              "usage.xml",
              "items/fragment.xml",
              "items/media/pic.png",
            ]),
          );

          return replaceOnce(text, refOf(member), refOf({ href, identifier: member.identifier }));
        }),
      ),
      (entries: PackageEntries): Gen<PackageEntries> =>
        (source) => {
          const member = source.draw(element(members));
          const ghosted = editText(entries, manifest, (text) =>
            replaceOnce(
              text,
              "  <resources>",
              '  <resources>\n    <resource identifier="ghost-res" type="imsqti_item_xmlv3p0" href="items/ghost.xml"><file href="items/ghost.xml"/></resource>',
            ),
          );

          return editText(ghosted, bank, (text) =>
            replaceOnce(
              text,
              refOf(member),
              refOf({ href: "items/ghost.xml", identifier: member.identifier }),
            ),
          );
        },
    ]),
    over: "package",
  },
  // Prefixed reference (reading 48): the test declares the name a prefixed reading also reads.
  "Prefixed reference": {
    law: "Prefixed reference",
    mutate: withTest(
      oneEdit([
        {
          declarations:
            '<qti-outcome-declaration identifier="item1.SCORE" cardinality="single" base-type="float"/>',
        },
      ]),
    ),
    over: "package",
  },
  // Section identifier target (§7.27.1, §7.28.1, §7.39.1): a filter names no section the test
  // places, or an item ref.
  "Section identifier target": {
    law: "Section identifier target",
    mutate: withTest(
      eachEdit(["nosuch", "item1", "part1"], (identifier) => ({
        processing: `<qti-set-outcome-value identifier="TOTAL"><qti-sum><qti-test-variables variable-identifier="SCORE" section-identifier="${identifier}"/></qti-sum></qti-set-outcome-value>`,
      })),
    ),
    over: "package",
  },
  // Section ref target (§7.5): a section ref names an item or the stimulus, no section document.
  "Section ref target": {
    law: "Section ref target",
    mutate: withTest(
      eachEdit(["items/item.xml", "items/stimulus.xml"], (href) => ({
        parts: `<qti-assessment-section-ref identifier="placed" href="${href}"/>`,
      })),
    ),
    over: "package",
  },
  // Selection bound (§5.129.1, reading 79): the section selects more than its two parts, without
  // replacement.
  "Selection bound": {
    law: "Selection bound",
    mutate: withTest(
      oneEdit([
        { section: '<qti-selection select="3"/>' },
        { section: '<qti-selection select="9" with-replacement="false"/>' },
      ]),
    ),
    over: "package",
  },
  // Selection required (§4.2.2): the section selects fewer than its required parts.
  "Selection required": {
    law: "Selection required",
    mutate: withTest(
      oneEdit([
        {
          parts:
            '<qti-assessment-item-ref identifier="item3" href="items/item3.xml" required="true"/>',
          section: '<qti-selection select="0"/>',
        },
        {
          parts:
            '<qti-assessment-item-ref identifier="item3" href="items/item3.xml" required="true"/><qti-assessment-section identifier="s2" title="Inner" visible="true" required="1"><qti-assessment-item-ref identifier="again" href="items/item3.xml"/></qti-assessment-section>',
          section: '<qti-selection select="1"/>',
        },
      ]),
    ),
    over: "package",
  },
  // Stimulus ref key (§7.6.2): a second stimulus ref of the item's identifier, beside the first.
  "Stimulus ref key": {
    law: "Stimulus ref key",
    mutate: ({ entries }) =>
      drawnIn("items/item.xml", (text) =>
        duplicateDrawn(text, /<qti-assessment-stimulus-ref identifier="[^"]+" href="[^"]+"\/>/u),
      )(entries),
    over: "package",
  },
  // Structure identifier (reading 86): a second item ref of the bank under a member's identifier,
  // naming that member's item, written after the bank's last item ref.
  "Structure identifier": {
    law: "Structure identifier",
    mutate: oneOf(
      members.map((member) =>
        fixed(bank, (text) =>
          replaceOnce(
            text,
            "</qti-assessment-section>",
            `  ${refOf(member)}\n</qti-assessment-section>`,
          ),
        ),
      ),
    ),
    over: "package",
  },
  // Template default target (§5.152.1, A37): a template default names a name its item declares no
  // template of.
  "Template default target": {
    law: "Template default target",
    mutate: withTest(
      eachEdit(["NOPE", "SCORE"], (template) => ({
        item1: `<qti-template-default template-identifier="${template}"><qti-base-value base-type="integer">1</qti-base-value></qti-template-default>`,
      })),
    ),
    over: "package",
  },
  // Test name key (reading 86): the test places the bank by a section ref, whose item refs share
  // the test's own item refs' identifiers.
  "Test name key": {
    law: "Test name key",
    mutate: withTest(
      oneEdit([
        { parts: '<qti-assessment-section-ref identifier="placed" href="section.xml"/>' },
        { section: '<qti-assessment-section-ref identifier="placed" href="section.xml"/>' },
      ]),
    ),
    over: "package",
  },
  // Variable mapping source (§7.48, A34): a mapping maps a name its item declares no outcome of.
  "Variable mapping source": {
    law: "Variable mapping source",
    mutate: withTest(
      eachEdit(["NOPE", "SHOWN"], (source) => ({
        item1: `<qti-variable-mapping source-identifier="${source}" target-identifier="MAPPED"/>`,
      })),
    ),
    over: "package",
  },
  // Variable mapping target (§7.48, readings 97 and 110): a mapping targets a session variable,
  // another variable of its item, or another mapping's target.
  "Variable mapping target": {
    law: "Variable mapping target",
    mutate: withTest(
      oneEdit([
        {
          item1:
            '<qti-variable-mapping source-identifier="SCORE" target-identifier="numAttempts"/>',
        },
        { item1: '<qti-variable-mapping source-identifier="SCORE" target-identifier="COUNT"/>' },
        {
          item1:
            '<qti-variable-mapping source-identifier="SCORE" target-identifier="MAPPED"/><qti-variable-mapping source-identifier="GRADE" target-identifier="MAPPED"/>',
        },
      ]),
    ),
    over: "package",
  },
  // Weight key (§7.50.1): two weights of one item ref share an identifier.
  "Weight key": {
    law: "Weight key",
    mutate: withTest(
      eachEdit(["W", " W "], (second) => ({
        item1: `<qti-weight identifier="W" value="2"/><qti-weight identifier="${second}" value="3"/>`,
      })),
    ),
    over: "package",
  },
  // Weighted base (§7.39.5, reading 167): a weighted test variables writes a base type other than
  // float.
  "Weighted base": {
    law: "Weighted base",
    mutate: withTest(
      oneEdit([
        {
          processing:
            '<qti-set-outcome-value identifier="COUNTED"><qti-sum><qti-test-variables variable-identifier="COUNT" weight-identifier="W" base-type="integer"/></qti-sum></qti-set-outcome-value>',
        },
      ]),
    ),
    over: "package",
  },
  // Weighted variable (§7.47.2): a weighted variable reads the test's own variable, or a part's
  // duration, through no item ref.
  // Each read is set into an outcome of its own type, so no Set type stands ahead: the test's float
  // TOTAL, and a part's duration, the test's duration built-in (spec reading 167), into a duration.
  "Weighted variable": {
    law: "Weighted variable",
    mutate: withTest(
      eachEdit(
        [
          { identifier: "TOTAL", into: "TOTAL" },
          { identifier: "part1.duration", into: "SPENT" },
        ],
        ({ identifier, into }) => ({
          declarations:
            '<qti-outcome-declaration identifier="SPENT" cardinality="single" base-type="duration"/>',
          processing: `<qti-set-outcome-value identifier="${into}"><qti-variable identifier="${identifier}" weight-identifier="W"/></qti-set-outcome-value>`,
        }),
      ),
    ),
    over: "package",
  },
} as const satisfies Readonly<Record<string, Mutation>>;
