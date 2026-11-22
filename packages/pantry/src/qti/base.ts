/**
 * The `Qti` schema's stored level, `QtiBase`, composed from lists: every roster and closed relation
 * `install.ts` declares, every stored relation of the `src/qti/` modules, and every module's laws
 * over them, each array once (plan §1.1, the W5 amendment's §C). `Qti` (`#pantry/qti/schema.ts`)
 * is the level over it that names the queries its rules read (`#pantry/qti/queries.ts`).
 *
 * No relation is `mutable`: qti-pie writes each package once, every owner inserted with its whole
 * family in one ChangeSet step (the W5 amendment's A). A module joins the composition when it
 * lands; `schema.test.ts` lists the modules composed and checks each law array is here once.
 */
import { schema } from "@bjornpagen/grizzle";
import { grammarRelations, grammarRosters } from "#pantry/grammar/install.ts";
import { attributeLaws, attributeRelations } from "#pantry/qti/attributes.ts";
import { chardataLaws, chardataRelations } from "#pantry/qti/chardata.ts";
import { catalogLaws, catalogRelations } from "#pantry/qti/catalog.ts";
import { dataSsmlLaws, dataSsmlRelations } from "#pantry/qti/data-ssml.ts";
import { htmlLaws, htmlRelations } from "#pantry/qti/html.ts";
import { identityLaws, identityRelations } from "#pantry/qti/identity.ts";
import { interactionLaws, interactionRelations } from "#pantry/qti/interactions.ts";
import { mappingLaws, mappingRelations } from "#pantry/qti/mapping.ts";
import { metadataLaws, metadataRelations } from "#pantry/qti/metadata.ts";
import { expressionLaws, expressionRelations } from "#pantry/qti/expressions.ts";
import { nodeLaws, nodeRelations } from "#pantry/qti/node.ts";
import { mathmlLaws, mathmlRelations } from "#pantry/qti/mathml.ts";
import { operatorLaws, operatorRelations } from "#pantry/qti/operators.ts";
import { packageLaws, packageRelations } from "#pantry/qti/package.ts";
import { testLaws, testRelations } from "#pantry/qti/tests.ts";

/**
 * One statement of any module, as its module states it. Written as a type, the union is reduced by
 * identity alone: an array literal of every module's statements would ask the checker to reduce it
 * by subtype, which past about a thousand statement types it refuses as too complex (TS2590).
 */
type QtiStatement =
  | (typeof nodeLaws)[number]
  | (typeof chardataLaws)[number]
  | (typeof attributeLaws)[number]
  | (typeof packageLaws)[number]
  | (typeof identityLaws)[number]
  | (typeof testLaws)[number]
  | (typeof mappingLaws)[number]
  | (typeof interactionLaws)[number]
  | (typeof expressionLaws)[number]
  | (typeof metadataLaws)[number]
  | (typeof htmlLaws)[number]
  | (typeof operatorLaws)[number]
  | (typeof mathmlLaws)[number]
  | (typeof catalogLaws)[number]
  | (typeof dataSsmlLaws)[number];

/**
 * Every module's statements, in module order, each module's list one element: a list of lists
 * holds fifteen types, where a list literal of every statement would hold them all.
 */
const moduleLaws: readonly (readonly QtiStatement[])[] = [
  nodeLaws,
  chardataLaws,
  attributeLaws,
  packageLaws,
  identityLaws,
  testLaws,
  mappingLaws,
  interactionLaws,
  expressionLaws,
  metadataLaws,
  htmlLaws,
  operatorLaws,
  mathmlLaws,
  catalogLaws,
  dataSsmlLaws,
];

/**
 * The relations of the QTI 3.0 schema: the grammar's rosters and closed relations, then each
 * module's relations, each under its own name. A scratch schema of a test reads them here, with no
 * schema built.
 */
export const qtiRelations = [
  ...grammarRosters,
  ...grammarRelations,
  ...nodeRelations,
  ...chardataRelations,
  ...attributeRelations,
  ...packageRelations,
  ...identityRelations,
  ...testRelations,
  ...mappingRelations,
  ...interactionRelations,
  ...expressionRelations,
  ...metadataRelations,
  ...htmlRelations,
  ...operatorRelations,
  ...mathmlRelations,
  ...catalogRelations,
  ...dataSsmlRelations,
] as const;

/**
 * The stored level of the QTI 3.0 schema: the relations and every module's laws. Its name, `Qti`,
 * names the installation: its PostgreSQL schema, which holds every table, and its migrations
 * folder, `migrations/qti/`.
 */
export const QtiBase = schema("Qti", qtiRelations, moduleLaws.flat());
