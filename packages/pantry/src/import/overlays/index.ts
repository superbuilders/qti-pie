/**
 * Every overlay builder's rows of one package, merged into one keyed set per relation (plan W5,
 * Q5.15; §C's `overlayRowsOf`).
 *
 * Each builder (`#pantry/import/overlays/<family>.ts`) reads one document's view, its rows under
 * the positions that name its nodes and their folds (`DocumentView` of `#pantry/import/fold.ts`),
 * and where it stands in its package, and returns each of its relations' rows as a `ReadonlyMap`
 * from the text of a row's key to the row. The merge keeps them a set (rule 0): a key met twice
 * with one value is one row, and a key met twice with two values is a defect of the builders,
 * reported as an {@link OverlayConflict} and never overwritten.
 *
 * Five builders also read the whole package: the tests' assemblies (Q5.13), what each test reads
 * of the documents it places and what each item ref names (Q5.10's, PE's), the sections'
 * placements under each test (Q5.09), the LOM records' objects (Q5.12) and the LOM languages'
 * witnesses (Q5.07). A builder joins {@link overlayRowsOf} when its module joins the schema
 * (`#pantry/qti/schema.ts`): a ChangeSet over the author role writes only the relations the schema
 * holds.
 */
import { Equal, Formatter, Option, Result, Schema, Struct } from "effect";
import { rowsOf as dataSsmlRowsOf } from "#pantry/import/overlays/data-ssml.ts";
import type { DataSsmlRows } from "#pantry/import/overlays/data-ssml.ts";
import { documentNamesOf } from "#pantry/import/overlays/declarations.ts";
import {
  numberedReadingRowsOf,
  readingDocumentOf,
  scopedReadingsOf,
} from "#pantry/import/overlays/readings.ts";
import type { NumberedReadingRows } from "#pantry/import/overlays/readings.ts";
import {
  assembledExpressionRowsOf,
  builtInTypeOf,
  declaredTypeIn,
  rowsOf as expressionRowsOf,
  placedRowsOf,
  placingPackageOf,
} from "#pantry/import/overlays/expressions.ts";
import type {
  AssembledExpressionRows,
  ExpressionRows,
  PlacedRows,
} from "#pantry/import/overlays/expressions.ts";
import {
  idValuesOf,
  placedIdRowsOf,
  rowsOf as identityRowsOf,
} from "#pantry/import/overlays/identity.ts";
import type { IdentityRows, PlacedIdRows } from "#pantry/import/overlays/identity.ts";
import {
  rowsOf as interactionRowsOf,
  placedBindingRowsOf,
  fragmentRowsOf,
} from "#pantry/import/overlays/interactions.ts";
import type {
  InteractionRows,
  PlacedBindingRows,
  FragmentRows,
} from "#pantry/import/overlays/interactions.ts";
import { mathmlRowsOf } from "#pantry/import/overlays/mathml.ts";
import type { MathmlRows } from "#pantry/import/overlays/mathml.ts";
import { placedShareRowsOf } from "#pantry/import/overlays/mathml-share.ts";
import type { PlacedShareRows } from "#pantry/import/overlays/mathml-share.ts";
import {
  noPackageRows,
  rowsOf as packageRowsOf,
  referenceCensus,
  referenceRowsOf,
  resourceTypesOf,
  typedPathsOf,
} from "#pantry/import/overlays/package.ts";
import type { PackageRows, ReferenceRows } from "#pantry/import/overlays/package.ts";
import { assembledRowsOf, rowsOf as testRowsOf } from "#pantry/import/overlays/tests.ts";
import type { AssembledRows, TestRows } from "#pantry/import/overlays/tests.ts";
import type { PlacedDocument } from "#pantry/import/write.ts";
import { overlayRelations } from "#pantry/import/roster.ts";
import { manifestPath } from "#pantry/vocab/terms/package.ts";

/**
 * Every overlay's rows of a package, one keyed set per relation: each document builder's, and the
 * four a package's documents build together.
 */
type OverlayRows = AssembledExpressionRows &
  AssembledRows &
  DataSsmlRows &
  ExpressionRows &
  IdentityRows &
  InteractionRows &
  MathmlRows &
  PackageRows &
  PlacedBindingRows &
  PlacedIdRows &
  PlacedRows &
  PlacedShareRows &
  ReferenceRows &
  FragmentRows &
  NumberedReadingRows &
  TestRows;

/**
 * One document's rows from every document builder.
 */
interface DocumentRows {
  readonly dataSsml: DataSsmlRows;
  readonly expressions: ExpressionRows;
  readonly identity: IdentityRows;
  readonly interactions: InteractionRows;
  readonly mathml: MathmlRows;
  readonly package: PackageRows;
  readonly references: ReferenceRows;
  readonly tests: TestRows;
}

/**
 * Run every document builder over one document: each finds the elements its overlays describe by
 * their kind, so a document that holds none gives it no row. The manifest overlays are the
 * package manifest's alone (`noPackageRows`): `rowsOf` of `#pantry/import/overlays/package.ts`
 * reads the manifest's tree, and a `cp:*` element of another document is no part of the package.
 *
 * @param document - The document, listed, placed and viewed.
 * @param document.ids - Where it stands in its package.
 * @param document.listed - The document as listed.
 * @param document.view - Its view.
 * @returns Every builder's rows.
 */
const documentRowsOf = ({ ids, listed: { path }, view }: PlacedDocument): DocumentRows => ({
  dataSsml: dataSsmlRowsOf(view, ids),
  expressions: expressionRowsOf(view, ids),
  identity: identityRowsOf(view, ids),
  interactions: interactionRowsOf(view, ids),
  mathml: mathmlRowsOf(view, ids),
  package: path === manifestPath ? packageRowsOf(view, ids) : noPackageRows,
  references: referenceRowsOf(view, ids, referenceCensus),
  tests: testRowsOf(view, ids),
});

/**
 * Two rows of one relation at one key that differ: a defect of the builders, which give one fact
 * per key, never something to overwrite.
 */
export class OverlayConflict extends Schema.TaggedError<OverlayConflict>()("OverlayConflict", {
  first: Schema.String,
  key: Schema.String,
  relation: Schema.String,
  second: Schema.String,
}) {
  /**
   * The relation, the key, both rows, and the repair.
   */
  override get message(): string {
    return `Two builders give ${this.relation} two different rows at the key ${this.key}: ${this.first} and ${this.second}. A key names one fact, so correct the builder that wrote the wrong row; the importer keeps neither.`;
  }
}

/**
 * Union one relation's keyed sets: a key met in several sets with equal rows (Effect's structural
 * equality) is one row, the first set's.
 *
 * @param relation - The relation's name, for the conflict.
 * @param sets - Its keyed sets, those the parts that hold it give it, in the parts' order.
 * @returns The union; or the {@link OverlayConflict} of the first key, in the sets' order, met
 *   with two different rows.
 */
export const unionOf = <Row>(
  relation: string,
  sets: readonly ReadonlyMap<string, Row>[],
): Result.Result<ReadonlyMap<string, Row>, OverlayConflict> => {
  const union = new Map<string, Row>();
  for (const set of sets) {
    for (const [key, row] of set) {
      const held = union.get(key);
      if (held === undefined) {
        union.set(key, row);
      } else if (!Equal.equals(held, row)) {
        return Result.fail(
          new OverlayConflict({
            first: Formatter.format(held),
            key,
            relation,
            second: Formatter.format(row),
          }),
        );
      }
    }
  }

  return Result.succeed(union);
};

/**
 * The union of one relation's keyed sets over every part ({@link unionOf}), as a type-level
 * function of the relation, so `Struct.map` gives each relation of `Rows` its own row type. The
 * relation's name, its key in the record mapped over, picks its keyed set out of each part.
 */
interface UnionAt<Rows> extends Struct.Lambda {
  <Name extends keyof Rows & string>(relation: {
    readonly name: Name;
  }): Result.Result<ReadonlyMap<string, Rows[Name]>, OverlayConflict>;
  readonly "~lambda.out": this["~lambda.in"] extends {
    readonly name: infer Name extends keyof Rows;
  }
    ? Result.Result<ReadonlyMap<string, Rows[Name]>, OverlayConflict>
    : never;
}

/**
 * Union every part's keyed sets, relation by relation: {@link unionOf} of each relation of
 * `relations` over the parts that hold it, so a relation no part holds is its empty set.
 * `relations` is a record of the relations themselves, each under its own name, the overlays' or
 * the document layer's, which `#pantry/import/roster.ts` reads from the schema, so a relation the
 * schema gains is unioned with no edit here. `Rows`, each relation's row type, is read from the
 * parts alone, and `Struct.map` over `relations` ({@link UnionAt}) gives each union those rows.
 *
 * @param relations - The relations, each under its own name: at least every relation of `Rows`.
 * @param parts - The builders' rows, each holding some of the relations' keyed sets.
 * @returns Every relation's union; or the {@link OverlayConflict} of the first relation, in
 *   `relations`' order, met with two different rows at one key.
 */
export const unionsOf = <Rows>(
  relations: NoInfer<{ readonly [Name in keyof Rows]: { readonly name: Name } }>,
  parts: readonly { readonly [Name in keyof Rows]?: ReadonlyMap<string, Rows[Name]> }[],
) =>
  Result.all(
    Struct.map(
      Struct.lambda<UnionAt<Rows>>(({ name }) =>
        unionOf(
          name,
          parts.flatMap((part) => Option.toArray(Option.fromUndefinedOr(part[name]))),
        ),
      ),
    )(relations),
  );

/**
 * Build every overlay builder's rows of one package, unmerged: each document builder's over each
 * document, then those of the builders that read the whole package, each a part holding every
 * relation its builder writes.
 *
 * @param documents - The package's documents, each listed and where it stands, the manifest among
 *   them, the one of type `manifest`.
 * @returns The parts, in the order {@link overlayRowsOf} merges them.
 */
export const overlayPartsOf = (
  documents: readonly PlacedDocument[],
): readonly Partial<OverlayRows>[] => {
  const built = documents.map((document) => ({ document, rows: documentRowsOf(document) }));
  const assembled = assembledRowsOf(
    built.map(({ document, rows }) => ({
      rootKind: document.view.tree.root.kind,
      rows: rows.tests,
    })),
  );
  const referenced = assembledExpressionRowsOf(
    built.map(({ document }) => ({ ids: document.ids, view: document.view })),
    built.flatMap(({ document, rows }) =>
      typedPathsOf(rows.package, resourceTypesOf(document.view)),
    ),
  );

  // Every document's IDs beside their values, as the database's `IdValue` reads them: the placed
  // IDs and the shares' targets copy them.
  const idValues = built.flatMap(({ document, rows }) =>
    idValuesOf(document.view, rows.identity.DocumentId.values()),
  );
  const placedIds = placedIdRowsOf({
    ids: idValues,
    instances: assembled.Instance.values(),
    targets: built.flatMap(({ rows }) => [...rows.identity.IdrefTarget.values()]),
  });

  const documentsByPath = new Map(
    built.map(({ document }) => [document.ids.path, document] as const),
  );
  const placedShares = placedShareRowsOf({
    ids: idValues,
    instances: assembled.Instance.values(),
    nodesOf: (document) => {
      const read = documentsByPath.get(document);

      return read === undefined ? [] : read.view.rows.nodes;
    },
    shares: built.flatMap(({ rows }) => [...rows.identity.ShareFragment.values()]),
    sites: built.flatMap(({ rows }) => [...rows.tests.Site.values()]),
  });

  const readingDocuments = built.map(({ document, rows }) =>
    readingDocumentOf({
      declared: documentNamesOf(document.view, document.ids).map(({ name }) => name),
      itemRefDocuments: referenced.ItemRefDocument.values(),
      names: rows.tests.Named.values(),
      path: document.ids.path,
      references: rows.expressions.VariableRef.values(),
      view: document.view,
    }),
  );
  const readings = numberedReadingRowsOf({
    documents: readingDocuments,
    instances: assembled.Instance.values(),
  });
  // Every placement types its documents' expressions and resolves their references in its
  // assembly (spec reading `fragment-placement`), a test's through its readings (spec reading `weighted-test-variables`).
  const placing = placingPackageOf(
    built.map(({ document, rows }) => ({
      ids: document.ids,
      paths: rows.references.ReferencePath.values(),
      references: rows.expressions.VariableRef.values(),
      view: document.view,
    })),
  );
  const placed = placedRowsOf({
    instances: assembled.Instance.values(),
    placing,
    readingsOf: scopedReadingsOf({
      documents: readingDocuments,
      instances: assembled.Instance.values(),
      readings,
      types: {
        builtIn: builtInTypeOf,
        declared: (path, name) => declaredTypeIn(placing, path, name),
      },
    }),
  });

  return [
    ...built.flatMap(({ rows }) => [
      rows.dataSsml,
      rows.expressions,
      rows.identity,
      rows.interactions,
      rows.mathml,
      rows.package,
      rows.references,
      rows.tests,
    ]),
    assembled,
    referenced,
    placed,
    readings,
    placedBindingRowsOf({
      adaptive: built.flatMap(({ rows }) => [...rows.interactions.ItemMode.values()]),
      choices: built.flatMap(({ rows }) => [...rows.interactions.Choice.values()]),
      hottexts: built.flatMap(({ rows }) => [...rows.interactions.Hottext.values()]),
      instances: assembled.Instance.values(),
      names: built.flatMap(({ rows }) => [...rows.interactions.BindingName.values()]),
    }),
    placedIds,
    placedShares,
    fragmentRowsOf({
      contexts: built.flatMap(({ rows }) => [...rows.interactions.FragmentContextName.values()]),
      feedbacks: built.flatMap(({ rows }) => [...rows.interactions.FragmentFeedbackName.values()]),
      instances: assembled.Instance.values(),
      prints: built.flatMap(({ rows }) => [...rows.interactions.FragmentPrintedName.values()]),
      templates: built.flatMap(({ rows }) => [...rows.interactions.FragmentTemplateName.values()]),
    }),
  ];
};

/**
 * Build every overlay's rows of one package: each document builder over each document, under its
 * ids, then those that read the whole package: the assemblies from every document's test rows
 * (`assembledRowsOf`), the sections' placements under each test from the declarations, the
 * assemblies and the sections' and fragments' references (`fragmentRowsOf`). The results are merged
 * into one keyed set per relation by {@link unionsOf}, over the overlay relations
 * `#pantry/import/roster.ts` reads from the schema (`overlayRelations`).
 *
 * @param documents - The package's documents, each listed and where it stands; the manifest is the
 *   one no resource names (type `manifest`).
 * @returns The rows, every relation of {@link OverlayRows} present; or the {@link OverlayConflict}
 *   of two builders that give one key two rows.
 */
export const overlayRowsOf = (
  documents: readonly PlacedDocument[],
): Result.Result<OverlayRows, OverlayConflict> =>
  unionsOf(overlayRelations, overlayPartsOf(documents));
