/**
 * The pinned schema sets the content-model suite (`content.test.ts`) walks: the domain itself, the
 * entry documents 1EdTech publishes for each set a QTI document is assessed against, never cases a
 * person chose.
 *
 * @module
 */
import { dictionary } from "@bjornpagen/testing/dictionary";
import type { SourcePath } from "#pantry/vocab/derive/sources.ts";

/**
 * The pinned schema sets: the ASI, content-packaging and metadata XSDs.
 */
export const schemas = dictionary<SourcePath>([
  "imsqti_asiv3p0p1_v1p0.xsd",
  "imsqtiv3p0p1_imscpv1p2_v1p0.xsd",
  "imsqti_metadatav3p0_v1p0.xsd",
]);
