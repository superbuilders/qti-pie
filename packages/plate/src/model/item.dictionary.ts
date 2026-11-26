/**
 * The closed vocabularies `item.test.ts` exhausts, each the domain itself, never cases a person
 * chose: the views the XSD lets a rubric block name, xs:boolean's lexical space, and the
 * cardinalities of a container a string interaction binds.
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

/**
 * The lexical space of xs:boolean, each literal with the value it names (XML Schema Part 2 section
 * 3.2.2.1: `{true, false, 1, 0}`, 1 true and 0 false).
 */
export const xsBooleans = dictionary<{ readonly literal: string; readonly value: boolean }>([
  { literal: "true", value: true },
  { literal: "false", value: false },
  { literal: "1", value: true },
  { literal: "0", value: false },
]);

/**
 * The cardinalities of a container (the information model's CardinalityEnum): `multiple` and
 * `ordered`, the two whose value holds many strings.
 */
export const containerCardinalities = dictionary(["multiple", "ordered"]);
