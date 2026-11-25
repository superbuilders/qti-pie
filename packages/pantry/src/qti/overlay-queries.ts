/**
 * The overlays' laws over their node's place in the tree (decision S3: no copies). An overlay row
 * is keyed by its node, `(package, path, start)`, and holds only its own facts: never its node's
 * kind, parent or nearest interaction, which `Node` alone holds. A law that pairs an
 * overlay's fact with one of those reads `Node` through a query, so it is a rule over a query
 * (grizzle's README, "Rules over queries"), judged at COMMIT over the rows the transaction wrote.
 *
 * Each query is over the stored level (`#pantry/qti/base.ts` `QtiBase`), so these modules, like
 * `#pantry/qti/queries.ts`, which lists their relations and laws, are ones `base.ts` never imports.
 * Each domain's module (`#pantry/qti/overlay-queries/<domain>.ts`) groups its rules by the law each
 * states, the law's name the one the domain's own module used, so the schema's naming of its laws
 * reads them (`#pantry/test/law-namer.ts`).
 */
import {
  catalogOverlayLaws,
  catalogOverlayLawsByName,
  catalogOverlayRelations,
} from "#pantry/qti/overlay-queries/catalog.ts";
import {
  chardataOverlayLaws,
  chardataOverlayLawsByName,
  chardataOverlayRelations,
} from "#pantry/qti/overlay-queries/chardata.ts";
import {
  declarationOverlayLaws,
  declarationOverlayLawsByName,
  declarationOverlayRelations,
} from "#pantry/qti/overlay-queries/declaration.ts";
import {
  expressionOverlayLaws,
  expressionOverlayLawsByName,
  expressionOverlayRelations,
} from "#pantry/qti/overlay-queries/expression.ts";
import {
  htmlOverlayLaws,
  htmlOverlayLawsByName,
  htmlOverlayRelations,
} from "#pantry/qti/overlay-queries/html.ts";
import {
  identityOverlayLaws,
  identityOverlayLawsByName,
  identityOverlayRelations,
} from "#pantry/qti/overlay-queries/identity.ts";
import {
  interactionOverlayLaws,
  interactionOverlayLawsByName,
  interactionOverlayRelations,
} from "#pantry/qti/overlay-queries/interaction.ts";
import {
  packageOverlayLaws,
  packageOverlayLawsByName,
  packageOverlayRelations,
} from "#pantry/qti/overlay-queries/package.ts";
import {
  readingLaws,
  readingLawsByName,
  readingRelations,
} from "#pantry/qti/overlay-queries/readings.ts";
import {
  referenceOverlayLaws,
  referenceOverlayLawsByName,
  referenceOverlayRelations,
} from "#pantry/qti/overlay-queries/reference.ts";
import {
  quotationOverlayLaws,
  quotationOverlayLawsByName,
  quotationOverlayRelations,
} from "#pantry/qti/overlay-queries/quotation.ts";
import {
  testOverlayLaws,
  testOverlayLawsByName,
  testOverlayRelations,
} from "#pantry/qti/overlay-queries/tests.ts";

/**
 * Every query of these modules, each carrying its own name.
 */
export const overlayQueryRelations = [
  ...catalogOverlayRelations,
  ...chardataOverlayRelations,
  ...declarationOverlayRelations,
  ...expressionOverlayRelations,
  ...htmlOverlayRelations,
  ...identityOverlayRelations,
  ...interactionOverlayRelations,
  ...packageOverlayRelations,
  ...quotationOverlayRelations,
  ...readingRelations,
  ...referenceOverlayRelations,
  ...testOverlayRelations,
] as const;

/**
 * Each domain's rules over its overlays' nodes, grouped by the law each states, one record per
 * domain.
 */
export const overlayQueryLawsByName = [
  catalogOverlayLawsByName,
  chardataOverlayLawsByName,
  declarationOverlayLawsByName,
  expressionOverlayLawsByName,
  htmlOverlayLawsByName,
  identityOverlayLawsByName,
  interactionOverlayLawsByName,
  packageOverlayLawsByName,
  quotationOverlayLawsByName,
  readingLawsByName,
  referenceOverlayLawsByName,
  testOverlayLawsByName,
] as const;

/**
 * Every rule of these modules, each domain's record flattened on its own.
 */
export const overlayQueryLaws = [
  ...catalogOverlayLaws,
  ...chardataOverlayLaws,
  ...declarationOverlayLaws,
  ...expressionOverlayLaws,
  ...htmlOverlayLaws,
  ...identityOverlayLaws,
  ...interactionOverlayLaws,
  ...packageOverlayLaws,
  ...quotationOverlayLaws,
  ...readingLaws,
  ...referenceOverlayLaws,
  ...testOverlayLaws,
] as const;
