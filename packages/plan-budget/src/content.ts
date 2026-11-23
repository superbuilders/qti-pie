/**
 * The content a composition's student actions are measured over where its installation holds none
 * of its own: one package of twenty choice items, each with its own match-correct response
 * processing, and two tests over them, `std.xml` (nonlinear, simultaneous) and `rate.xml` (linear,
 * individual, the rate test's shape). It is AlphaTest's commonest shape, and small enough to
 * publish in seconds through any composition's own publish path; content is not the population's
 * axis, the children are.
 *
 * @module
 */
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";

/**
 * QTI 3.0.1's assessment namespace.
 */
const asi = "http://www.imsglobal.org/xsd/imsqtiasi_v3p0";

/**
 * How many items the package holds: a test's length, as AlphaTest's shorter tests run.
 *
 * @limitKind provisional
 * @owner the planning budget's measured content (#plan-budget/content.ts)
 * @unit items per test
 * @scope the one package every measured composition publishes where it holds no content of its own
 * @guards a test so short that an action over its members (a submit's every member) costs nothing
 * @measure the member counts of AlphaTest's tests in metis's converted corpus, and take their median
 * @origin PERF-COMMIT's package, 2026-11-22, with no evidence
 * @recorded 2026-11-23
 */
const itemCount = 20;

/**
 * The package's name.
 */
export const choicePackage = "plan-budget";

/**
 * The package's items' identifiers, in their order in both tests.
 */
export const choiceItems: readonly string[] = Array.from(
  { length: itemCount },
  (_, k) => `q${String(k + 1).padStart(2, "0")}`,
);

/**
 * The nonlinear, simultaneous test's path.
 */
export const stdTest = "std.xml";

/**
 * The linear, individual test's path.
 */
export const rateTest = "rate.xml";

/**
 * An item's path in the package.
 *
 * @param item - Its identifier.
 * @returns Its path.
 */
export const itemPathOf = (item: string): string => `items/${item}.xml`;

/**
 * The item after `item` in both tests, as an answer's `next` names it: none after the last.
 *
 * @param item - The item.
 * @returns The one after it, or none.
 */
export const nextOf = (item: string): readonly { readonly item: string }[] => {
  const following = choiceItems[choiceItems.indexOf(item) + 1];

  return following === undefined ? [] : [{ item: following }];
};

/**
 * An item's document: one choice of three, C correct, its SCORE set by its own match-correct
 * processing.
 *
 * @param id - Its identifier.
 * @returns Its XML.
 */
const itemXml = (id: string) => `<?xml version="1.0" encoding="UTF-8"?>
<qti-assessment-item xmlns="${asi}" identifier="${id}" title="${id}" adaptive="false" time-dependent="false" xml:lang="en">
<qti-response-declaration identifier="RESPONSE" cardinality="single" base-type="identifier"><qti-correct-response><qti-value>C</qti-value></qti-correct-response></qti-response-declaration>
<qti-outcome-declaration identifier="SCORE" cardinality="single" base-type="float"><qti-default-value><qti-value>0</qti-value></qti-default-value></qti-outcome-declaration>
<qti-outcome-declaration identifier="MAXSCORE" cardinality="single" base-type="float"><qti-default-value><qti-value>1</qti-value></qti-default-value></qti-outcome-declaration>
<qti-item-body><qti-choice-interaction response-identifier="RESPONSE" max-choices="1"><qti-prompt>${id}: which is even?</qti-prompt><qti-simple-choice identifier="A">7</qti-simple-choice><qti-simple-choice identifier="B">9</qti-simple-choice><qti-simple-choice identifier="C">10</qti-simple-choice></qti-choice-interaction></qti-item-body>
<qti-response-processing><qti-response-condition><qti-response-if><qti-match><qti-variable identifier="RESPONSE"/><qti-correct identifier="RESPONSE"/></qti-match><qti-set-outcome-value identifier="SCORE"><qti-base-value base-type="float">1</qti-base-value></qti-set-outcome-value></qti-response-if><qti-response-else><qti-set-outcome-value identifier="SCORE"><qti-base-value base-type="float">0</qti-base-value></qti-set-outcome-value></qti-response-else></qti-response-condition></qti-response-processing>
</qti-assessment-item>`;

/**
 * A test's document over every item: its SCORE and MAXSCORE the sums of its items'.
 *
 * @param id - Its identifier.
 * @param navigation - Its part's navigation mode.
 * @param submission - Its part's submission mode.
 * @returns Its XML.
 */
const testXml = (
  id: string,
  navigation: string,
  submission: string,
) => `<?xml version="1.0" encoding="UTF-8"?>
<qti-assessment-test xmlns="${asi}" identifier="${id}" title="${id}"><qti-outcome-declaration identifier="SCORE" cardinality="single" base-type="float"/><qti-outcome-declaration identifier="MAXSCORE" cardinality="single" base-type="float"/><qti-test-part identifier="P" navigation-mode="${navigation}" submission-mode="${submission}"><qti-assessment-section identifier="S" title="S" visible="true">${choiceItems.map((q) => `<qti-assessment-item-ref identifier="${q}" href="${itemPathOf(q)}"/>`).join("")}</qti-assessment-section></qti-test-part><qti-outcome-processing><qti-set-outcome-value identifier="SCORE"><qti-sum><qti-test-variables variable-identifier="SCORE"/></qti-sum></qti-set-outcome-value><qti-set-outcome-value identifier="MAXSCORE"><qti-sum><qti-test-variables variable-identifier="MAXSCORE"/></qti-sum></qti-set-outcome-value></qti-outcome-processing>
</qti-assessment-test>`;

/**
 * The package's manifest: both tests, each depending on every item, and the items.
 */
const manifest = () => {
  const dependencies = choiceItems.map((q) => `<dependency identifierref="${q}"/>`).join("");
  const tests = [
    ["std", stdTest],
    ["rate", rateTest],
  ]
    .map(
      ([id = "", href = ""]) =>
        `<resource identifier="${id}" type="imsqti_test_xmlv3p0" href="${href}"><file href="${href}"/>${dependencies}</resource>`,
    )
    .join("");
  const resources = choiceItems
    .map(
      (q) =>
        `<resource identifier="${q}" type="imsqti_item_xmlv3p0" href="${itemPathOf(q)}"><file href="${itemPathOf(q)}"/></resource>`,
    )
    .join("");

  return `<?xml version="1.0" encoding="UTF-8"?>
<manifest xmlns="http://www.imsglobal.org/xsd/qti/qtiv3p0/imscp_v1p1" identifier="${choicePackage}"><metadata><schema>QTI Package</schema><schemaversion>3.0.1</schemaversion></metadata><organizations/><resources>${tests}${resources}</resources></manifest>`;
};

/**
 * The package's files, written into `dir`, which pantry's `readPackage` then reads as any package
 * folder.
 *
 * @param dir - An empty folder.
 */
export const writeChoicePackage = (dir: string): void => {
  mkdirSync(path.join(dir, "items"), { recursive: true });
  writeFileSync(path.join(dir, "imsmanifest.xml"), manifest());
  writeFileSync(path.join(dir, stdTest), testXml("std", "nonlinear", "simultaneous"));
  writeFileSync(path.join(dir, rateTest), testXml("rate", "linear", "individual"));

  for (const q of choiceItems) {
    writeFileSync(path.join(dir, itemPathOf(q)), itemXml(q));
  }
};
