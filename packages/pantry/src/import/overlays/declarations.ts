/**
 * A document's declarations as the import's other builders read them (plan §1.7): a declaration's
 * name, cardinality and base type, and a value's field and base type, are their attributes'
 * values, which the database reads where they stand (`#pantry/qti/names.ts`), so no row holds
 * them, and the builders read a declaration as its views do ({@link typedDeclarationOf}). An
 * outcome declaration's normal scale is its attributes' values too, read by the views
 * `MasteryValue`, `NormalMaximum` and `NormalMinimum` (`#pantry/qti/names.ts`), so this module
 * writes no row of its own.
 */
import { Array as Arr, Option } from "effect";
import type { DocumentView } from "#pantry/import/fold.ts";
import { spelledBaseTypes } from "#pantry/grammar/attributes.ts";
import type { BaseType } from "#pantry/grammar/install.ts";
import { Cardinality, DeclarationKind } from "#pantry/grammar/install.ts";
import { namedBy, valueAt } from "#pantry/import/names.ts";
import type { Place } from "#pantry/qti/schema.ts";

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
