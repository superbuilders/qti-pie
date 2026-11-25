/**
 * The closed vocabularies `item.test.ts` exhausts, each the domain itself, never cases a person
 * chose: the views the XSD lets a rubric block name.
 *
 * @module
 */
import { dictionary } from "@bjornpagen/testing/dictionary";

/**
 * The views a rubric block's `view` lists some of, the XSD's `View.Type` enumeration
 * (`imsqti_asiv3p0p1_v1p0.xsd`): its six values, in the XSD's order.
 */
export const rubricViews = dictionary([
  "author",
  "candidate",
  "proctor",
  "scorer",
  "testConstructor",
  "tutor",
]);
