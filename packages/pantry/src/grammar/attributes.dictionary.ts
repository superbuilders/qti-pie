/**
 * The closed lists the attribute grammar's suite (`attributes.test.ts`) reads its spec readings on:
 * the domain itself, each list as the reading, decision or specification that states it writes it,
 * never cases a person chose.
 *
 * @module
 */
import { dictionary } from "@bjornpagen/testing/dictionary";
import type { SourcePath } from "#pantry/vocab/derive/sources.ts";

/**
 * The typed-value attributes the XSD types `xs:double`, as reading `typed-value-whitespace` lists
 * them: `mapped-value` of a map entry and of an area map entry; a mapping's and an area mapping's
 * `lower-bound`, `upper-bound` and `default-value`; an interpolation table entry's `source-value`;
 * and the usage-data mapping's `defaultValue`, `lowerBound` and `upperBound` and its `ud:mapEntry`
 * entries' `mappedValue`, each by its kind and name.
 */
export const readingSevenDoubles = dictionary<{ readonly kind: string; readonly name: string }>([
  { kind: "qti-map-entry", name: "mapped-value" },
  { kind: "qti-area-map-entry", name: "mapped-value" },
  { kind: "qti-mapping", name: "lower-bound" },
  { kind: "qti-mapping", name: "upper-bound" },
  { kind: "qti-mapping", name: "default-value" },
  { kind: "qti-area-mapping", name: "lower-bound" },
  { kind: "qti-area-mapping", name: "upper-bound" },
  { kind: "qti-area-mapping", name: "default-value" },
  { kind: "qti-interpolation-table-entry", name: "source-value" },
  { kind: "ud:mapping", name: "defaultValue" },
  { kind: "ud:mapping", name: "lowerBound" },
  { kind: "ud:mapping", name: "upperBound" },
  { kind: "ud:mapEntry", name: "mappedValue" },
]);

/**
 * A text-entry interaction's two references reading `text-entry-idrefs` types `xs:IDREF`, as the
 * XSD does.
 */
export const readingFourteenReferences = dictionary(["response-identifier", "string-identifier"]);

/**
 * An `mglyph`'s three attributes reading `mathml-validity`'s decision 327 makes optional and
 * uncounted: its `alt`, `src` and `index`.
 */
export const mglyphOptional = dictionary(["alt", "src", "index"]);

/**
 * The count attributes reading `count-range` holds to the signed 64-bit range, as it lists them.
 */
export const readingFortySixCounts = dictionary([
  "max-choices",
  "min-choices",
  "max-associations",
  "min-associations",
  "match-max",
  "match-min",
  "max-plays",
  "min-plays",
]);

/**
 * The kinds whose `min-choices` is at least 1: the order and graphic-order interactions (reading
 * `order-min-choices`, the information model's sections 5.97.2 and 5.61.1) and the position object
 * interaction (reading `binding-and-count-sentences`, section 5.107.2).
 */
export const minChoicesFloored = dictionary([
  "qti-order-interaction",
  "qti-graphic-order-interaction",
  "qti-position-object-interaction",
]);

/**
 * The kinds whose `figures` reading `count-range` holds to the signed 64-bit range: `qti-round-to`
 * and `qti-equal-rounded`.
 */
export const readingFortySixFigures = dictionary(["qti-round-to", "qti-equal-rounded"]);

/**
 * The media URLs readings `source-attributes` and `track-srclang` hold to a character other than a
 * space, by kind and name: an `audio`'s and a `video`'s `src`, a `video`'s `poster`, a `source`'s
 * `src` and `srcset`, and a `track`'s `src` (the information model's sections 5.9.1, 5.166.1,
 * 5.166.9, 5.135.1, 5.135.3 and 5.163.2, and the HTML Standard's image candidate strings).
 */
export const mediaUrls = dictionary<{ readonly kind: string; readonly name: string }>([
  { kind: "audio", name: "src" },
  { kind: "source", name: "src" },
  { kind: "source", name: "srcset" },
  { kind: "track", name: "src" },
  { kind: "video", name: "poster" },
  { kind: "video", name: "src" },
]);

/**
 * The pinned schema sets the XSD reading of attribute uses walks: the ASI and content-packaging
 * XSDs.
 */
export const xsdUseSchemas = dictionary<SourcePath>([
  "imsqti_asiv3p0p1_v1p0.xsd",
  "imsqtiv3p0p1_imscpv1p2_v1p0.xsd",
]);

/**
 * Every pinned schema set a document is assessed against (spec reading
 * `wildcard-global-declarations`): the ASI, content-packaging, metadata and usage-data XSDs, whose
 * simple-content kinds A9 gives text.
 */
export const documentSchemas = dictionary<SourcePath>([
  "imsqti_asiv3p0p1_v1p0.xsd",
  "imsqtiv3p0p1_imscpv1p2_v1p0.xsd",
  "imsqti_metadatav3p0_v1p0.xsd",
  "usagedata/imsqti_usagedatav3p0_v1p0.xsd",
]);
