/**
 * The mutations of the law oracle's laws over banks and what they hold
 * (`#pantry/test/oracle-laws/tests.ts`), each drawn to break exactly its law in an accepted package
 * (`src/test/complete.oracle.test.ts`).
 *
 * Each edits the every-relation package's bank (`section.xml`: the bank `bank1` of the item refs
 * `item1`, `item2` and `item3`, each named by its item's identifier), its manifest or an item, or
 * adds a document beside them. A mutation never renames an element another reference names, since
 * the reference would break a law of its own first.
 */
import { element, int } from "@bjornpagen/testing/gen";
import type { Gen } from "@bjornpagen/testing/gen";
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
 * The QTI 3.0 assessment namespace every document of the package is written in.
 */
const asi = "http://www.imsglobal.org/xsd/imsqtiasi_v3p0";

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
 * The bank's first item ref, as the every-relation package writes it.
 */
const firstRef = '<qti-assessment-item-ref identifier="item1" href="items/item.xml"/>';

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
 * A test of one part and one section that places an item by its own identifier, valid QTI but for
 * being a test.
 *
 * @param member - The item ref it holds.
 * @param member.href - Its href.
 * @param member.identifier - Its identifier.
 * @returns The test's text.
 */
const testOf = (member: { readonly href: string; readonly identifier: string }): string =>
  [
    '<?xml version="1.0" encoding="UTF-8"?>',
    `<qti-assessment-test xmlns="${asi}" identifier="test1" title="A test">`,
    '  <qti-test-part identifier="part1" navigation-mode="linear" submission-mode="individual">',
    '    <qti-assessment-section identifier="s1" title="A section" visible="true">',
    `      ${refOf(member)}`,
    "    </qti-assessment-section>",
    "  </qti-test-part>",
    "</qti-assessment-test>",
    "",
  ].join("\n");

/**
 * What a bank holds besides its item refs, each in a place its section's content model admits: a
 * selection or an ordering before its parts, a rubric block, a nested section around its first
 * item ref, or a section ref after its last.
 */
const bankExtras = [
  { at: firstRef, text: `<qti-selection select="1"/>${firstRef}` },
  { at: firstRef, text: `<qti-ordering shuffle="true"/>${firstRef}` },
  {
    at: firstRef,
    text: `<qti-rubric-block use="instructions" view="candidate"><qti-content-body><p>Read.</p></qti-content-body></qti-rubric-block>${firstRef}`,
  },
  {
    at: firstRef,
    text: `<qti-assessment-section identifier="inner" title="Inner" visible="true">${firstRef}</qti-assessment-section>`,
  },
  {
    at: "</qti-assessment-section>",
    text: '<qti-assessment-section-ref identifier="ref" href="section.xml"/></qti-assessment-section>',
  },
] as const;

/**
 * Each law's mutation, by law.
 */
export const testMutations = {
  // Bank key (the placement mandate, ruling 2): a second bank listed beside the first under its
  // identifier, as written or padded, holding no item ref, so no member of the two repeats.
  "Bank key": {
    law: "Bank key",
    mutate:
      ({ entries }) =>
      (source) =>
        listed(entries, {
          dependency: "item1-res",
          identifier: "bank2-res",
          path: "bank2.xml",
          text: `<?xml version="1.0" encoding="UTF-8"?>\n<qti-assessment-section xmlns="${asi}" identifier="${source.draw(element(["bank1", " bank1", "bank1 "]))}" title="Another bank" visible="false"/>\n`,
          type: "imsqti_section_xmlv3p0",
        }),
    over: "package",
  },
  // Bank shape (spec reading 1's stated limit): the bank holding what only a test's structure
  // holds, a child under one of its item refs, or an item ref's attribute only a test's delivery
  // reads.
  "Bank shape": {
    law: "Bank shape",
    mutate: oneOf([
      drawnIn(bank, (text) => (source) => {
        const extra = source.draw(element(bankExtras));

        return replaceOnce(text, extra.at, extra.text);
      }),
      fixed(bank, (text) =>
        replaceOnce(
          text,
          firstRef,
          '<qti-assessment-item-ref identifier="item1" href="items/item.xml"><qti-weight identifier="W" value="2"/></qti-assessment-item-ref>',
        ),
      ),
      drawnIn(bank, (text) => (source) => {
        const attribute = source.draw(
          element(['required="true"', 'fixed="false"', 'category="c"']),
        );

        return replaceOnce(
          text,
          firstRef,
          `<qti-assessment-item-ref identifier="item1" href="items/item.xml" ${attribute}/>`,
        );
      }),
    ]),
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
  // Test structure (spec reading 1's stated limit): a test document listed beside the bank,
  // placing an item of the package under its own identifier.
  "Test structure": {
    law: "Test structure",
    mutate:
      ({ entries }) =>
      (source) => {
        const member = source.draw(element(members));

        return listed(entries, {
          dependency: `${member.identifier}-res`,
          identifier: "test-res",
          path: "test.xml",
          text: testOf(member),
          type: "imsqti_test_xmlv3p0",
        });
      },
    over: "package",
  },
} as const satisfies Readonly<Record<string, Mutation>>;
