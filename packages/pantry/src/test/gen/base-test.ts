/**
 * A valid test over the every-relation package's items (`#pantry/test/gen/every-relation.ts`),
 * written with a place for each edit a test of the laws over tests and sections writes into: the
 * completeness mutations (`#pantry/test/oracle-complete/tests.ts`) and the tests' law box
 * (`src/qti/tests.oracle.test.ts`) both list it beside the package's bank.
 *
 * The test is one part of one section that places the package's first two items by their own
 * identifiers (QTI §4.1.1) and sets its outcome from the first by a prefixed reading (spec reading
 * 48), so it breaks no law as written.
 */

/**
 * The QTI 3.0 assessment namespace.
 */
const asi = "http://www.imsglobal.org/xsd/imsqtiasi_v3p0";

/**
 * The places of {@link baseTest} an edit writes into: after its declarations, before its section's
 * item refs, inside the first item ref, after the item refs, after its test part, where a second
 * part stands, in its outcome processing, and after it, where a test's feedback stands.
 */
const testPlaces = [
  "declarations",
  "section",
  "item1",
  "parts",
  "part2",
  "processing",
  "feedback",
] as const;

/**
 * An edit of {@link baseTest}: the text each place it names holds.
 */
export type TestEdit = Readonly<Partial<Record<(typeof testPlaces)[number], string>>>;

/**
 * The test, each place written as a comment its edit replaces.
 */
const baseTest = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  `<qti-assessment-test xmlns="${asi}" identifier="test1" title="A test">`,
  '  <qti-outcome-declaration identifier="TOTAL" cardinality="single" base-type="float"/>',
  '  <qti-outcome-declaration identifier="COUNTED" cardinality="single" base-type="integer"/><!--declarations-->',
  '  <qti-test-part identifier="part1" navigation-mode="linear" submission-mode="individual">',
  '    <qti-assessment-section identifier="s1" title="A section" visible="true"><!--section-->',
  '      <qti-assessment-item-ref identifier="item1" href="items/item.xml"><!--item1--></qti-assessment-item-ref>',
  '      <qti-assessment-item-ref identifier="item2" href="items/item2.xml"/><!--parts-->',
  "    </qti-assessment-section>",
  "  </qti-test-part><!--part2-->",
  "  <qti-outcome-processing>",
  '    <qti-set-outcome-value identifier="TOTAL"><qti-variable identifier="item1.SCORE"/></qti-set-outcome-value><!--processing-->',
  "  </qti-outcome-processing><!--feedback-->",
  "</qti-assessment-test>",
  "",
].join("\n");

/**
 * Write the test with an edit: each place the edit names holds its text, and every other is empty.
 *
 * @param edit - The edit.
 * @returns The test's text.
 */
export const testText = (edit: TestEdit): string => {
  let text = baseTest;
  for (const place of testPlaces) {
    text = text.replace(`<!--${place}-->`, () => edit[place] ?? "");
  }

  return text;
};

/**
 * A branch rule that is always taken, to a target.
 *
 * @param target - Its target.
 * @returns Its text.
 */
export const branchTo = (target: string): string =>
  `<qti-branch-rule target="${target}"><qti-base-value base-type="boolean">true</qti-base-value></qti-branch-rule>`;
