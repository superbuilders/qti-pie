/**
 * The packages of an item whose response processing includes a response rules fragment, for the
 * oracle's box (`#pantry/qti/placed-types.oracle.test.ts`): a fragment's references are typed in
 * the item that includes it (spec reading 117), a map response by its declaration's mapping
 * ("Mapped response", reading 166) and a variable reference that is a whole condition by its
 * declaration's type ("Condition type", P21). Genetic repair round 4's inventory (research
 * aeced65a, classes O18 and O38) found the import accepting both.
 */
import type { PackageEntries } from "#pantry/test/gen/every-relation.ts";

/**
 * The text every XML file of the cases opens with.
 */
const declaration = '<?xml version="1.0" encoding="UTF-8"?>\n';

/**
 * The assessment items namespace declaration, which an item and a fragment root each write.
 */
const asi = 'xmlns="http://www.imsglobal.org/xsd/imsqtiasi_v3p0"';

/**
 * The manifest that lists the items, and with `fragment` the rules fragment they include.
 *
 * @param items - The items' paths.
 * @param fragment - Whether the manifest lists rules.xml.
 * @returns The manifest's text.
 */
const manifestOf = (items: readonly string[], fragment: boolean): string =>
  `${declaration}<manifest xmlns="http://www.imsglobal.org/xsd/qti/qtiv3p0/imscp_v1p1" identifier="M"><metadata><schema>QTI Package</schema><schemaversion>3.0.1</schemaversion></metadata><organizations/><resources>${items.map((item, at) => `<resource identifier="R${String(at + 1)}" type="imsqti_item_xmlv3p0" href="${item}"><file href="${item}"/></resource>`).join("")}${fragment ? `<resource identifier="R${String(items.length + 1)}" type="imsqti_fragment_xmlv3p0" href="rules.xml"><file href="rules.xml"/></resource>` : ""}</resources></manifest>`;

/**
 * The base type of an item's RESPONSE.
 */
export type ResponseType = "float" | "identifier";

/**
 * How an item writes a RESPONSE of each base type: its correct value, and the interaction that
 * sets it, a choice for an identifier and a slider, which binds a numeric response, for a float.
 */
export const responseWritings: Readonly<
  Record<ResponseType, { readonly correct: string; readonly interaction: string }>
> = {
  float: {
    correct: "1",
    interaction:
      '<qti-slider-interaction response-identifier="RESPONSE" lower-bound="0" upper-bound="1"/>',
  },
  identifier: {
    correct: "A",
    interaction:
      '<qti-choice-interaction response-identifier="RESPONSE" max-choices="1"><qti-simple-choice identifier="A">a</qti-simple-choice><qti-simple-choice identifier="B">b</qti-simple-choice></qti-choice-interaction>',
  },
};

/**
 * The item whose one response, RESPONSE, its interaction sets, its response processing's content
 * `rules`.
 *
 * @param identifier - The item's identifier.
 * @param response - RESPONSE's base type.
 * @param mapping - The response declaration's mapping as written, empty for none.
 * @param rules - The response processing's content.
 * @returns The item's text.
 */
const itemOf = (
  identifier: string,
  response: ResponseType,
  mapping: string,
  rules: string,
): string =>
  `${declaration}<qti-assessment-item ${asi} xmlns:xi="http://www.w3.org/2001/XInclude" identifier="${identifier}" title="t" adaptive="false" time-dependent="false"><qti-response-declaration identifier="RESPONSE" cardinality="single" base-type="${response}"><qti-correct-response><qti-value>${responseWritings[response].correct}</qti-value></qti-correct-response>${mapping}</qti-response-declaration><qti-outcome-declaration identifier="SCORE" cardinality="single" base-type="float"/><qti-item-body>${responseWritings[response].interaction}</qti-item-body><qti-response-processing>${rules}</qti-response-processing></qti-assessment-item>`;

/**
 * The response condition that sets SCORE to 1 where `condition` holds, its root declaring the
 * namespace as `attributes` give it.
 *
 * @param condition - The response if's condition.
 * @param attributes - The condition's attributes as written, empty for none.
 * @returns The condition's text.
 */
const conditionOf = (condition: string, attributes: string): string =>
  `<qti-response-condition${attributes}><qti-response-if>${condition}<qti-set-outcome-value identifier="SCORE"><qti-base-value base-type="float">1</qti-base-value></qti-set-outcome-value></qti-response-if></qti-response-condition>`;

/**
 * A condition that RESPONSE's mapped value exceeds 0.
 */
export const mapped =
  '<qti-gt><qti-map-response identifier="RESPONSE"/><qti-base-value base-type="float">0</qti-base-value></qti-gt>';

/**
 * A condition that is RESPONSE itself, an identifier single, which is no boolean.
 */
export const bare = '<qti-variable identifier="RESPONSE"/>';

/**
 * A condition that RESPONSE matches its correct value, a boolean single.
 */
export const matched =
  '<qti-match><qti-variable identifier="RESPONSE"/><qti-correct identifier="RESPONSE"/></qti-match>';

/**
 * A condition that RESPONSE exceeds a half: a `qti-gt`, whose operands are numeric
 * (`#pantry/grammar/expression.ts`), so an identifier RESPONSE breaks "Operand fit" (P23).
 */
export const overHalf =
  '<qti-gt><qti-variable identifier="RESPONSE"/><qti-base-value base-type="float">0.5</qti-base-value></qti-gt>';

/**
 * A mapping of RESPONSE: A maps to 1.
 */
export const mapping =
  '<qti-mapping default-value="0"><qti-map-entry map-key="A" mapped-value="1"/></qti-mapping>';

/**
 * The package of the files given, each path's text encoded as UTF-8.
 *
 * @param files - Each file's text, by its path.
 * @returns The package.
 */
const packageOf = (files: Readonly<Record<string, string>>): PackageEntries =>
  new Map(
    Object.entries(files).map(([path, text]) => [path, new TextEncoder().encode(text)] as const),
  );

/**
 * The package whose item includes the rules fragment that tests `condition`, its response declaring
 * `withMapping`.
 *
 * @param withMapping - The response declaration's mapping as written, empty for none.
 * @param condition - The fragment's condition.
 * @returns The package.
 */
export const includingOf = (withMapping: string, condition: string): PackageEntries =>
  packageOf({
    "imsmanifest.xml": manifestOf(["item.xml"], true),
    "item.xml": itemOf("i1", "identifier", withMapping, '<xi:include href="rules.xml"/>'),
    "rules.xml": `${declaration}${conditionOf(condition, ` ${asi}`)}`,
  });

/**
 * The package whose item tests `condition` in its own response processing, its response declaring
 * no mapping.
 *
 * @param condition - The condition.
 * @returns The package.
 */
export const inlineOf = (condition: string): PackageEntries =>
  packageOf({
    "imsmanifest.xml": manifestOf(["item.xml"], false),
    "item.xml": itemOf("i1", "identifier", "", conditionOf(condition, "")),
  });

/**
 * The package whose items each include the one rules fragment that tests whether RESPONSE exceeds a
 * half ({@link overHalf}), each item's RESPONSE of its own base type, so the fragment is typed once
 * in each item (spec reading 117).
 *
 * @param types - Each item's RESPONSE's base type, in order.
 * @returns The package.
 */
export const sharedOf = (types: readonly ResponseType[]): PackageEntries => {
  const items = types.map((response, at) => ({
    identifier: `i${String(at + 1)}`,
    path: `item${String(at + 1)}.xml`,
    response,
  }));

  return packageOf({
    "imsmanifest.xml": manifestOf(
      items.map(({ path }) => path),
      true,
    ),
    ...Object.fromEntries(
      items.map(({ identifier, path, response }) => [
        path,
        itemOf(identifier, response, "", '<xi:include href="rules.xml"/>'),
      ]),
    ),
    "rules.xml": `${declaration}${conditionOf(overHalf, ` ${asi}`)}`,
  });
};
