/**
 * The O2 overlay rows of a document (plan §1.7, §C's `rowsOf`): from a document's view (its rows,
 * each node at its `start`, and their folds) and its place in its package, the rows of every
 * overlay `#pantry/qti/declarations.ts` declares, each relation's rows a keyed set by its element's
 * place, `(package, path, start)`: an outcome declaration's mastery value, normal minimum and
 * normal maximum.
 *
 * The rows restate what the tree says and nothing else: each attribute's lexical form as written,
 * and a normal minimum the declaration does not write as the XSD's default. A declaration's name,
 * cardinality and base type, and a value's field and base type, are their attributes' values,
 * which the database reads where they stand (`#pantry/qti/names.ts`), so no row holds them; the
 * other builders read a declaration as its views do ({@link typedDeclarationOf}). The database
 * proves every row (`declarationLaws`), so a row this builder gets wrong is refused, never
 * accepted.
 */
import type { Addition } from "@bjornpagen/grizzle";
import { Array as Arr, Option, Struct } from "effect";
import { lexicalOf } from "#pantry/import/fold.ts";
import type { AttributeIndex, DocumentView } from "#pantry/import/fold.ts";
import { spelledBaseTypes } from "#pantry/grammar/attributes.ts";
import type { BaseType } from "#pantry/grammar/install.ts";
import { Cardinality, DeclarationKind } from "#pantry/grammar/install.ts";
import { namedBy, valueAt } from "#pantry/import/names.ts";
import type { Composed } from "#pantry/model/composed.ts";
import type { NodeRow } from "#pantry/model/xdm.ts";
import type { MasteryValue, NormalMaximum, NormalMinimum } from "#pantry/qti/declarations.ts";
import { normalMinimumDefault } from "#pantry/vocab/terms/declarations.ts";

/**
 * A document's O2 overlay rows, one keyed set per relation: each map from the text of its row's
 * key, its element's place ({@link keyTextOf}), to the row as its writer writes it.
 */
export interface DeclarationRows {
  readonly MasteryValue: ReadonlyMap<string, Addition<typeof MasteryValue>>;
  readonly NormalMaximum: ReadonlyMap<string, Addition<typeof NormalMaximum>>;
  readonly NormalMinimum: ReadonlyMap<string, Addition<typeof NormalMinimum>>;
}

/**
 * A row of one of the builder's relations, as its writer writes it.
 */
type RowOf<Relation extends keyof DeclarationRows> =
  DeclarationRows[Relation] extends ReadonlyMap<string, infer Row> ? Row : never;

/**
 * One relation's rows of a document, each at its element's `start`, as the relation's keyed set
 * holds them, by the text of the row's key ({@link keyTextOf}): a type-level function of the rows,
 * so `Struct.map` gives each relation of {@link DeclarationRows} its own row type.
 */
interface Keyed extends Struct.Lambda {
  <Row>(rows: ReadonlyMap<bigint, Row>): ReadonlyMap<string, Row>;
  readonly "~lambda.out": this["~lambda.in"] extends ReadonlyMap<bigint, infer Row>
    ? ReadonlyMap<string, Row>
    : never;
}

/**
 * Where a document stands in its package, as its rows hold it: its package's name and its path
 * there, which every row holds beside its element's `start`.
 */
export type Place = Pick<Addition<typeof MasteryValue>, "package" | "path">;

/**
 * The text of a row's key in its relation's keyed set: its document's package and path and its
 * element's `start`, as a JSON array, so the rows of two documents never meet at one key.
 *
 * @param place - The document's place.
 * @param start - The element's position in it.
 * @returns The key text.
 */
export const keyTextOf = (place: Place, start: bigint): string =>
  JSON.stringify([place.package, place.path, String(start)]);

/**
 * A `BaseType` handle.
 */
type BaseTypeHandle = (typeof BaseType.handles)[number];

/**
 * A `Cardinality` handle.
 */
type CardinalityHandle = (typeof Cardinality.handles)[number];

/**
 * The declaration kinds, each a `NodeKind` handle that is its own `DeclarationKind` handle.
 */
const declarationKinds: ReadonlySet<string> = new Set(DeclarationKind.handles);

/**
 * The declaration kind that writes a normal scale, `mastery-value`, `normal-minimum` and
 * `normal-maximum` (QTI 3.0 information model §4.5.7 to §4.5.9, OutcomeDeclaration).
 */
const outcomeKind = "qti-outcome-declaration";

/**
 * Read the code a `base-type` spells (C17): its lexical form, where that is one of
 * `BaseTypeLexical`'s, since each code is spelled as its lexical form.
 *
 * @param lexical - The lexical form, none where the attribute is unwritten.
 * @returns The handle it spells, none where it is unwritten or spells none, which its value domain
 *   refuses alone.
 */
export const spelledBaseTypeOf = (lexical: Option.Option<string>): Option.Option<BaseTypeHandle> =>
  lexical.pipe(Option.filter((spelled) => spelledBaseTypes.has(spelled)));

/**
 * Read the code a `cardinality` spells (C17): its lexical form, where that is one of the
 * `Cardinality` roster's handles, each spelled as its lexical form (`CardinalityLexical`), compared
 * as written, since the enumeration restricts `xs:string`, whose whitespace is preserved. It is the
 * one reading of a cardinality, so a declaration whose `cardinality` spells none has no
 * `DeclarationCardinality` and no law reads a cardinality of it (lane NIL's audit, B11; spec
 * reading 158).
 *
 * @param lexical - The lexical form, none where the attribute is unwritten.
 * @returns The handle it spells, none where it is unwritten or spells none, which AL3 or its value
 *   domain refuses alone.
 */
const spelledCardinalityOf = (lexical: Option.Option<string>): Option.Option<CardinalityHandle> =>
  lexical.pipe(
    Option.flatMap((spelled) => Arr.findFirst(Cardinality.handles, (code) => code === spelled)),
  );

/**
 * The three attributes a declaration's views read, each none where unwritten: its `base-type`'s and
 * its `cardinality`'s lexical forms, each of which spells its code as written, and its
 * `identifier`'s value ({@link valueAt}).
 */
interface DeclarationAttributes {
  readonly baseType: Option.Option<string>;
  readonly cardinality: Option.Option<string>;
  readonly identifier: Option.Option<string>;
}

/**
 * A declaration as its views read it: the code its `cardinality` spells, the code its `base-type`
 * spells, each spelled as its lexical form (`BaseTypeLexical`, `CardinalityLexical`), and its
 * name, each none where its attribute is unwritten or spells or names nothing.
 */
export interface TypedDeclaration {
  readonly baseType: Option.Option<BaseTypeHandle>;
  readonly cardinality: Option.Option<CardinalityHandle>;
  readonly name: Option.Option<string>;
}

/**
 * Read a declaration as its views read it (`#pantry/qti/names.ts`): its `cardinality` and its
 * `base-type` each where it is written and spells a handle (C17; an enumeration whose whitespace is
 * preserved, so a padded one spells none), and its name, its `identifier`'s value, where that is
 * written and names something ({@link namedBy}).
 *
 * Every declaration is judged whatever the three spell (spec readings 157 and 158): each that is
 * unwritten or spells nothing is only absent from its view, a missing value being no sentinel (lane
 * NIL's audit, B10 and B11). AL3 (a required `identifier` or `cardinality` unwritten) or the
 * attribute's value domain (written and spelling nothing) refuses it alone (the orchestrator's
 * ruling of 2026-11-06), and no law reads a type or a name the declaration does not have. The
 * builders that read declarations, the references' among them, read them through this, so they
 * agree on which have which.
 *
 * @param attributes - Its `base-type` and `cardinality` as written and its `identifier`'s value.
 * @returns The declaration.
 */
export const typedDeclarationOf = ({
  baseType,
  cardinality,
  identifier,
}: DeclarationAttributes): TypedDeclaration => ({
  baseType: spelledBaseTypeOf(baseType),
  cardinality: spelledCardinalityOf(cardinality),
  name: identifier.pipe(Option.flatMap(namedBy)),
});

/**
 * A name a document declares, by the document's path: a declaration's name
 * ({@link typedDeclarationOf}), which a reference of the document, or of a fragment an item's
 * assembly places, resolves against.
 */
export interface DocumentName {
  readonly name: string;
  readonly path: string;
}

/**
 * Read the names a document declares: each declaration's that names something
 * ({@link typedDeclarationOf}), a repeated one once for each declaration, which `Declaration key`
 * refuses.
 *
 * @param view - The document's view.
 * @param place - Where the document stands in its package.
 * @returns The names.
 */
export const documentNamesOf = (view: DocumentView, place: Place): readonly DocumentName[] =>
  view.rows.nodes.flatMap((node) =>
    declarationKinds.has(node.kind)
      ? Option.toArray(
          typedDeclarationOf({
            baseType: Option.none(),
            cardinality: Option.none(),
            identifier: valueAt(view, node, "identifier"),
          }).name,
        ).map((name) => ({ name, path: place.path }))
      : [],
  );

/**
 * What every row builder reads of a document: its place in its package, its attributes, and the
 * rows built so far, each by its element's `start`.
 */
interface Reading {
  readonly attributes: AttributeIndex;
  readonly place: Place;
  readonly rows: { readonly [Relation in keyof DeclarationRows]: Map<bigint, RowOf<Relation>> };
}

/**
 * Write a node's place, the key of every row of it: its document's package and path and its own
 * `start`.
 *
 * @param reading - The document.
 * @param node - The node.
 * @returns The place.
 */
const placeOf = (reading: Reading, node: NodeRow<Composed>) => ({
  package: reading.place.package,
  path: reading.place.path,
  start: node.start,
});

/**
 * Read an outcome declaration's normal minimum, which every one has (spec reading 149): its
 * `normal-minimum` as written, and else the XSD's default (`normalMinimumDefault`).
 *
 * @param reading - The document.
 * @param node - The declaration's node.
 * @returns The minimum's lexical form and whether it is written.
 */
const minimumOf = (
  reading: Reading,
  node: NodeRow<Composed>,
): { readonly lexical: string; readonly written: boolean } =>
  Option.match(lexicalOf(reading, node.start, "normal-minimum"), {
    onNone: () => ({ lexical: normalMinimumDefault, written: false }),
    onSome: (lexical) => ({ lexical, written: true }),
  });

/**
 * Add an outcome declaration's scale rows: each of its `mastery-value` and `normal-maximum` it
 * writes, and its normal minimum, written or the XSD's default ({@link minimumOf}, spec reading
 * 149). A value it does not have has no row; each pair of them `Mastery_range` orders is their
 * join.
 *
 * @param reading - The document.
 * @param node - The declaration's node.
 */
const addScale = (reading: Reading, node: NodeRow<Composed>): void => {
  const place = placeOf(reading, node);
  for (const lexical of Option.toArray(lexicalOf(reading, node.start, "mastery-value"))) {
    reading.rows.MasteryValue.set(node.start, { ...place, lexical });
  }

  reading.rows.NormalMinimum.set(node.start, { ...place, ...minimumOf(reading, node) });

  for (const lexical of Option.toArray(lexicalOf(reading, node.start, "normal-maximum"))) {
    reading.rows.NormalMaximum.set(node.start, { ...place, lexical });
  }
};

/**
 * Build the O2 overlay rows of a document: per scale attribute of an outcome declaration it
 * writes, and its normal minimum, written or the XSD's default.
 *
 * @param view - The document's view: its rows, each node at its `start`, and their folds under its
 *   context (spec reading 117), its own or, for an included fragment, the interaction its includes
 *   stand in, which its nodes take as their nearest.
 * @param place - Where the document stands in its package, the key every row holds.
 * @returns Every overlay's rows.
 */
export const rowsOf = (view: DocumentView, place: Place): DeclarationRows => {
  const reading: Reading = {
    attributes: view.attributes,
    place,
    rows: {
      MasteryValue: new Map(),
      NormalMaximum: new Map(),
      NormalMinimum: new Map(),
    },
  };

  for (const node of view.rows.nodes) {
    if (node.kind === outcomeKind) {
      addScale(reading, node);
    }
  }

  return Struct.map(
    Struct.lambda<Keyed>(
      (rows) => new Map([...rows].map(([start, row]) => [keyTextOf(place, start), row] as const)),
    ),
  )(reading.rows);
};
