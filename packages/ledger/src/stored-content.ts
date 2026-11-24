/**
 * The content of a package's documents the grader and response admission read, stored at its
 * publication: each relation a function of its package's own rows and the closed facts alone,
 * stored (grizzle's `derived.stored`, kept at COMMIT at every package a transaction writes, under
 * pantry's `Package` unit, every key leading with `package`), so an answer's admission, a take and
 * a grade read it by the document's key, as tables, and nothing rebuilds it per call.
 *
 * - **What admission reads of an item's body**: `ItemBodyElement`, each element node of its
 *   `qti-item-body`, the body among them, its kind by its name (`BodyNodeKind`), and
 *   `ItemBodyAttribute`, each attribute of one that admission reads (`AdmittedAttributeName`), as
 *   pantry's Attribute holds its value.
 * - **What the grader reads of a document's declarations**: `DeclarationElement`, each node of a kind
 *   the machine reads (`DeclarationNodeKind`: a variable declaration, its default and correct
 *   values and each value's `qti-value`), `DeclarationAttribute`, each attribute of one the machine
 *   reads (`GradedAttributeName`), and `DeclarationValueText`, each `qti-value`'s string value:
 *   what `declared` and `program_of` read.
 * - **A document's mappings and lookup tables, parsed**, each by its declaration's identifier and its
 *   element's place (`start`), as the machine's `inputs_of` reads them (information model §5.88,
 *   §5.6, §4.5.13): `DeclaredMapping` and `DeclaredAreaMapping`, each mapping's default and bounds
 *   (QTI's defaults 0, -INF and INF where unwritten); `DeclaredMapEntry`, each map entry's case
 *   sensitivity (default false) and mapped value; `DeclaredAreaEntry` and `DeclaredAreaCoord`, each
 *   area map entry's area kind (`area_kind_of`) and mapped value, and its coordinates (`coords_of`,
 *   none of a default shape's); `DeclaredLookup`, each lookup table's kind; `DeclaredMatchEntry`,
 *   each match table entry's integer source; and `DeclaredInterpolationEntry`, each interpolation
 *   table entry's float source and whether it includes the boundary (default true).
 * - **Each value of its declaration's base type they hold**, one an element: a map entry's `map-key`,
 *   its tabs, line feeds and carriage returns read as spaces (ValueDType, `xs:normalizedString`), a
 *   table entry's `target-value` and a table's `default-value`, each by its base type, by the
 *   element's place: `DeclaredValueText`, `DeclaredValueInteger`, `DeclaredValueFloat`,
 *   `DeclaredValueBoolean`, `DeclaredValuePair`, `DeclaredValueDirectedPair` and
 *   `DeclaredValuePoint`, the columns and the parse of the walk's base values (WALK-STORED's
 *   WalkLiteral relations): a text's, an identifier's and a URI's collapsed (XML Schema's
 *   whiteSpace collapse), a string's as written, an empty one NULL and no row; an integer's,
 *   collapsed, within QTI's integer; a float's and a duration's as XML Schema reads an `xs:double`
 *   (`Text.parseDouble`); a boolean's true where it reads `true` or `1`; a pair's, a directed
 *   pair's and a point's its first two tokens, a pair's least and greatest. A value of a base type
 *   none of them holds (a file) has no row, NULL. The parse's pattern, bound and guarded results
 *   are the walk's own (`#ledger/walks.ts`); its rules are the WalkLiteral relations' restated over
 *   an attribute's unbounded text, each match and decimal parse under the byte guard that text
 *   takes, since grizzle refuses one rule generic over relations of different headings (TODO.md,
 *   TYPEWRITE G4 part 1, parked).
 *
 * A stored row holds no NULL, so a parameter an element does not write has no row, and where QTI
 * documents a default a second rule states it where the attribute is absent. Each relation's key
 * is representable: every field is bounded, a union's rules told apart by a literal field (a
 * lookup table's kind, a value's base) or every field bounded.
 */
import {
  decimalTextMaxBytes,
  derived,
  doubleText,
  Fn,
  Logic,
  Num,
  pg,
  query,
  regexTextMaxBytes,
  Text,
  Type,
  v,
} from "@bjornpagen/grizzle";
import type { Rule } from "@bjornpagen/grizzle";
import type { AttributeName, NodeKind } from "@qti-pie/pantry/grammar/install.ts";
import type { LedgerLevel } from "#ledger/delivery.ts";
import {
  areaKindOf,
  coordsOf,
  DocAreaEntry,
  DocLookup,
  Single,
  xsBoolean,
} from "#ledger/grading.ts";
import { QtiFloat, QtiInteger } from "#ledger/scalars.ts";
import { integerBound, integerText, no, noFloat, noInteger, yes } from "#ledger/walks.ts";

/**
 * An element kind, as pantry's roster names it.
 */
type Kind = (typeof NodeKind.handles)[number];

/**
 * An attribute's name, as pantry's roster names it.
 */
type Name = (typeof AttributeName.handles)[number];

/**
 * The elements of a declaration the machine's inputs are read from (information model §4.5.13,
 * §5.5, §5.88): its mapping, area mapping and lookup table.
 */
const tableKinds = [
  "qti-area-mapping",
  "qti-interpolation-table",
  "qti-mapping",
  "qti-match-table",
] as const satisfies readonly Kind[];

/**
 * The lookup tables, each element kind with the machine's token of it (`lookup_table.kind`).
 */
const lookupKinds = [
  ["qti-interpolation-table", "interpolation"],
  ["qti-match-table", "match"],
] as const satisfies readonly (readonly [Kind, string])[];

/**
 * The stored content of a package's documents, over the ledger `ledger`.
 *
 * @param ledger - The ledger level the delivery level extends.
 * @returns The relations the delivery level spreads.
 */
export const storedContentOf = (ledger: LedgerLevel) => {
  const {
    AdmittedAttributeName,
    Attribute,
    BodyNodeKind,
    DeclarationNodeKind,
    GradedAttributeName,
    Node,
    TypedDeclarationName,
    ValueHolder,
  } = ledger.relations;

  /**
   * The item body's element nodes, its `qti-item-body` among them, each kind by its name.
   */
  const ItemBodyElement = derived.stored(
    "ItemBodyElement",
    query(ledger).rule((r) => {
      const { end: last, package: pkg, path, start: first } = v(Node, "itemBody");
      const { end, kind, parent, start } = v(Node, "bodyNode");
      const { token } = v(BodyNodeKind, "kind");

      return r
        .match(Node, {
          end: last,
          kind: "qti-item-body",
          package: pkg,
          parentKind: "qti-assessment-item",
          path,
          start: first,
        })
        .match(Node, { end, kind, package: pkg, parent, path, start })
        .match(BodyNodeKind, { kind, token })
        .where(r.ge(start, first), r.lt(start, last))
        .find({ end, kind: token, package: pkg, parent, path, start });
    }),
  );

  /**
   * The attributes of the body's elements admission reads, as pantry's Attribute holds their
   * values.
   */
  const ItemBodyAttribute = derived.stored(
    "ItemBodyAttribute",
    query(ledger).rule((r) => {
      const { end: last, package: pkg, path, start: first } = v(Node, "itemBody");
      const { name, start, value } = v(Attribute, "attribute");
      const { token } = v(AdmittedAttributeName, "name");

      return r
        .match(Node, {
          end: last,
          kind: "qti-item-body",
          package: pkg,
          parentKind: "qti-assessment-item",
          path,
          start: first,
        })
        .match(Attribute, { name, package: pkg, path, start, value })
        .match(AdmittedAttributeName, { name, token })
        .where(r.ge(start, first), r.lt(start, last))
        .find({ name: token, package: pkg, path, start, value });
    }),
  );

  /**
   * Each node of a document's declarations of a kind the machine reads, by the machine's token.
   */
  const DeclarationElement = derived.stored(
    "DeclarationElement",
    query(ledger).rule((r) => {
      const { end, kind, package: pkg, parent, path, start } = v(Node, "node");
      const { token } = v(DeclarationNodeKind, "kind");

      return r
        .match(Node, { end, kind, package: pkg, parent, path, start })
        .match(DeclarationNodeKind, { kind, token })
        .find({ end, kind: token, package: pkg, parent, path, start });
    }),
  );

  /**
   * Their attributes the machine reads, as pantry's Attribute holds their values.
   */
  const DeclarationAttribute = derived.stored(
    "DeclarationAttribute",
    query(ledger).rule((r) => {
      const { kind, package: pkg, path, start } = v(Node, "node");
      const { name, value } = v(Attribute, "attribute");
      const { token } = v(GradedAttributeName, "name");

      return r
        .match(Node, { kind, package: pkg, path, start })
        .match(DeclarationNodeKind, { kind })
        .match(Attribute, { name, package: pkg, path, start, value })
        .match(GradedAttributeName, { name, token })
        .find({ name: token, package: pkg, path, start, value });
    }),
  );

  /**
   * Each `qti-value`'s string value.
   */
  const DeclarationValueText = derived.stored(
    "DeclarationValueText",
    query(ledger).rule((r) => {
      const { package: pkg, path, start, stringValue } = v(Node, "value");

      return r
        .match(Node, { kind: "qti-value", package: pkg, path, start, stringValue })
        .find({ package: pkg, path, start, text: stringValue });
    }),
  );

  /**
   * Each response and outcome declaration of a base type, by its place, with its identifier and
   * base type: what a mapping and a lookup table read their values in (information model §2.11.1.5,
   * §4.5.13; a record holds neither, which pantry refuses).
   */
  const declarations = query(ledger).rule((r) => {
    const {
      baseType,
      declarationKind,
      identifier,
      package: pkg,
      path,
      start,
    } = v(TypedDeclarationName, "declaration");

    return r
      .match(TypedDeclarationName, {
        baseType,
        declarationKind,
        identifier,
        package: pkg,
        path,
        start,
      })
      .where(r.in(declarationKind, ["qti-outcome-declaration", "qti-response-declaration"]))
      .find({ baseType, identifier, package: pkg, path, start });
  });

  /**
   * Each mapping, area mapping and lookup table, a child of its declaration, by its place, with its
   * kind and its declaration's identifier and base type.
   */
  const tables = query(ledger).rule((r) => {
    const {
      baseType,
      identifier,
      package: pkg,
      path,
      start: declaration,
    } = v(declarations, "declaration");
    const { kind, start } = v(Node, "table");

    return r
      .match(declarations, { baseType, identifier, package: pkg, path, start: declaration })
      .match(Node, { kind, package: pkg, parent: declaration, path, start })
      .where(r.in(kind, tableKinds))
      .find({ baseType, identifier, kind, package: pkg, path, start });
  });

  /**
   * Each entry of a mapping, an area mapping or a lookup table, a child of it, by its place, with
   * its kind and its declaration's identifier and base type.
   */
  const entries = query(ledger).rule((r) => {
    const { baseType, identifier, package: pkg, path, start: table } = v(tables, "table");
    const { kind, start } = v(Node, "entry");

    return r
      .match(tables, { baseType, identifier, package: pkg, path, start: table })
      .match(Node, { kind, package: pkg, parent: table, path, start })
      .find({ baseType, identifier, kind, package: pkg, path, start });
  });

  /**
   * Every element the inputs are read from, a table or an entry, by its place, with its kind.
   */
  const elements = query(ledger)
    .rule((r) => {
      const { kind, package: pkg, path, start } = v(tables, "table");

      return r
        .match(tables, { kind, package: pkg, path, start })
        .find({ kind, package: pkg, path, start });
    })
    .rule((r) => {
      const { kind, package: pkg, path, start } = v(entries, "entry");

      return r
        .match(entries, { kind, package: pkg, path, start })
        .find({ kind, package: pkg, path, start });
    });

  /**
   * The value of an attribute `name` of each element of one of `kinds`, as pantry holds it.
   *
   * @param kinds - The elements' kinds.
   * @param name - The attribute.
   * @returns The query.
   */
  const written = (kinds: readonly Kind[], name: Name) =>
    query(ledger).rule((r) => {
      const { kind, package: pkg, path, start } = v(elements, "element");
      const { value } = v(Attribute, "attribute");

      return r
        .match(elements, { kind, package: pkg, path, start })
        .match(Attribute, { name, package: pkg, path, start, value })
        .where(r.in(kind, kinds))
        .find({ package: pkg, path, start, value });
    });

  /**
   * Each element of one of `kinds` that writes no attribute `name`.
   *
   * @param kinds - The elements' kinds.
   * @param name - The attribute.
   * @returns The query.
   */
  const unwritten = (kinds: readonly Kind[], name: Name) =>
    query(ledger).rule((r) => {
      const { kind, package: pkg, path, start } = v(elements, "element");

      return r
        .match(elements, { kind, package: pkg, path, start })
        .where(r.in(kind, kinds), r.not(Attribute, { name, package: pkg, path, start }))
        .find({ package: pkg, path, start });
    });

  /**
   * An `xs:double` attribute at each element of `kinds` that writes one, as XML Schema reads it
   * (`Text.parseDouble`): none where it reads as no double.
   *
   * @param kinds - The elements' kinds.
   * @param name - The attribute.
   * @returns The query.
   */
  const double = (kinds: readonly Kind[], name: Name) =>
    query(ledger).rule((r) => {
      const values = written(kinds, name);
      const { package: pkg, path, start, value } = v(values, "double");

      return r
        .match(values, { package: pkg, path, start, value })
        .where(
          r.eq(
            Logic.when(
              Num.within(Text.octetLength(value), 0, regexTextMaxBytes),
              () => Logic.cond(Text.matches(value, doubleText), yes, no),
              no,
            ),
            true,
          ),
        )
        .find({
          package: pkg,
          path,
          start,
          value: Logic.when(
            Num.within(Text.octetLength(value), 0, regexTextMaxBytes),
            () =>
              Logic.when(
                Text.matches(value, doubleText),
                (parsed) => Text.parseDouble(parsed),
                noFloat,
              ),
            noFloat,
          ),
        });
    });

  /**
   * An `xs:double` attribute at each element of `kinds` ({@link double}), and QTI's default
   * `absent` at each that writes none.
   *
   * @param kinds - The elements' kinds.
   * @param name - The attribute.
   * @param absent - QTI's default.
   * @returns The query.
   */
  const doubleOr = (kinds: readonly Kind[], name: Name, absent: number) =>
    query(ledger)
      .rule((r) => {
        const values = double(kinds, name);
        const { package: pkg, path, start, value } = v(values, "set");

        return r
          .match(values, { package: pkg, path, start, value })
          .find({ package: pkg, path, start, value });
      })
      .rule((r) => {
        const unset = unwritten(kinds, name);
        const { package: pkg, path, start } = v(unset, "unset");

        return r
          .match(unset, { package: pkg, path, start })
          .find({ package: pkg, path, start, value: Type.literal(QtiFloat, absent) });
      });

  /**
   * An `xs:boolean` attribute at each element of `kinds`, as `xs_boolean` reads it, and QTI's
   * default `absent` at each that writes none.
   *
   * @param kinds - The elements' kinds.
   * @param name - The attribute.
   * @param absent - QTI's default.
   * @returns The query.
   */
  const flag = (kinds: readonly Kind[], name: Name, absent: boolean) =>
    query(ledger)
      .rule((r) => {
        const values = written(kinds, name);
        const { package: pkg, path, start, value } = v(values, "set");

        return r
          .match(values, { package: pkg, path, start, value })
          .find({ on: Fn.call(xsBoolean, { dflt: absent, t: value }), package: pkg, path, start });
      })
      .rule((r) => {
        const unset = unwritten(kinds, name);
        const { package: pkg, path, start } = v(unset, "unset");

        return r
          .match(unset, { package: pkg, path, start })
          .find({ on: Type.literal(pg.boolean, absent), package: pkg, path, start });
      });

  /**
   * A mapping's or an area mapping's default and bounds, by its response (information model
   * §5.88.1-3, §5.5.1-3): `default-value` 0, `lower-bound` and `upper-bound` unbounded, where
   * unwritten.
   *
   * @param kind - The mapping's element.
   * @returns The query.
   */
  const mappingOf = (kind: "qti-area-mapping" | "qti-mapping") =>
    query(ledger).rule((r) => {
      const defaults = doubleOr([kind], "default-value", 0);
      const lowers = doubleOr([kind], "lower-bound", Number.NEGATIVE_INFINITY);
      const uppers = doubleOr([kind], "upper-bound", Number.POSITIVE_INFINITY);
      const { identifier, package: pkg, path, start } = v(tables, "mapping");
      const { value: dflt } = v(defaults, "default");
      const { value: lower } = v(lowers, "lower");
      const { value: upper } = v(uppers, "upper");

      return r
        .match(tables, { identifier, kind, package: pkg, path, start })
        .match(defaults, { package: pkg, path, start, value: dflt })
        .match(lowers, { package: pkg, path, start, value: lower })
        .match(uppers, { package: pkg, path, start, value: upper })
        .find({ dflt, identifier, lower, package: pkg, path, start, upper });
    });

  const DeclaredMapping = derived.stored("DeclaredMapping", mappingOf("qti-mapping"));

  const DeclaredAreaMapping = derived.stored("DeclaredAreaMapping", mappingOf("qti-area-mapping"));

  /**
   * Each map entry's case sensitivity (default false, information model §5.89.3) and mapped
   * value, by its place and its response.
   */
  const DeclaredMapEntry = derived.stored(
    "DeclaredMapEntry",
    query(ledger).rule((r) => {
      const sensitive = flag(["qti-map-entry"], "case-sensitive", false);
      const mapped = double(["qti-map-entry"], "mapped-value");
      const { identifier, package: pkg, path, start } = v(entries, "entry");
      const { on: caseSensitive } = v(sensitive, "sensitive");
      const { value } = v(mapped, "mapped");

      return r
        .match(entries, { identifier, kind: "qti-map-entry", package: pkg, path, start })
        .match(sensitive, { on: caseSensitive, package: pkg, path, start })
        .match(mapped, { package: pkg, path, start, value })
        .find({ caseSensitive, identifier, package: pkg, path, start, value });
    }),
  );

  /**
   * Each area map entry's shape as written (information model §5.6.1).
   */
  const outlines = written(["qti-area-map-entry"], "shape");

  /**
   * Each area map entry's coordinates as written.
   */
  const coordinates = written(["qti-area-map-entry"], "coords");

  /**
   * Each area map entry's mapped value.
   */
  const areaMapped = double(["qti-area-map-entry"], "mapped-value");

  /**
   * Each area map entry's area's kind (`area_kind_of`): its shape's, `everywhere` for a default,
   * or `nowhere` where its coordinates hold no point; and its mapped value, by its place and its
   * response.
   */
  const DeclaredAreaEntry = derived.stored(
    "DeclaredAreaEntry",
    query(ledger)
      .rule((r) => {
        const { identifier, package: pkg, path, start } = v(entries, "entry");
        const { value: outline } = v(outlines, "outline");
        const { value: listed } = v(coordinates, "coords");
        const { value } = v(areaMapped, "mapped");

        return r
          .match(entries, { identifier, kind: "qti-area-map-entry", package: pkg, path, start })
          .match(outlines, { package: pkg, path, start, value: outline })
          .match(coordinates, { package: pkg, path, start, value: listed })
          .match(areaMapped, { package: pkg, path, start, value })
          .find({
            identifier,
            kind: Fn.call(areaKindOf, { coords: listed, kind: outline }),
            package: pkg,
            path,
            start,
            value,
          });
      })
      .rule((r) => {
        const { identifier, package: pkg, path, start } = v(entries, "entry");
        const { value: outline } = v(outlines, "outline");
        const { value } = v(areaMapped, "mapped");

        return r
          .match(entries, { identifier, kind: "qti-area-map-entry", package: pkg, path, start })
          .match(outlines, { package: pkg, path, start, value: outline })
          .match(areaMapped, { package: pkg, path, start, value })
          .where(r.not(Attribute, { name: "coords", package: pkg, path, start }))
          .find({
            identifier,
            kind: Fn.call(areaKindOf, { coords: "", kind: outline }),
            package: pkg,
            path,
            start,
            value,
          });
      }),
  );

  /**
   * Each coordinate of an area map entry's area as written (`coords_of`), by its place from 1: none
   * of a default shape's, which reads none.
   */
  const DeclaredAreaCoord = derived.stored(
    "DeclaredAreaCoord",
    query(ledger).rule((r) => {
      const { package: pkg, path, start, value: outline } = v(outlines, "outline");
      const { value } = v(coordinates, "coords");
      const { c, place } = v(Fn.rows(coordsOf, { coords: value }), "coordinate");

      return r
        .match(outlines, { package: pkg, path, start, value: outline })
        .match(coordinates, { package: pkg, path, start, value })
        .match(Fn.rows(coordsOf, { coords: value }), { c, place })
        .where(
          r.ne(
            Fn.call(areaKindOf, { coords: value, kind: outline }),
            Type.literal(DocAreaEntry.fields.kind, "everywhere"),
          ),
        )
        .find({ c, package: pkg, path, place, start });
    }),
  );

  /**
   * One kind of lookup table, by its place and its outcome, with the machine's token of its kind.
   *
   * @param table - The table's element.
   * @param kind - The machine's token of it.
   * @returns The rule.
   */
  const lookupOf =
    ([table, kind]: (typeof lookupKinds)[number]) =>
    (r: Rule<LedgerLevel>) => {
      const { identifier, package: pkg, path, start } = v(tables, "table");

      return r.match(tables, { identifier, kind: table, package: pkg, path, start }).find({
        identifier,
        kind: Type.literal(DocLookup.fields.kind, kind),
        package: pkg,
        path,
        start,
      });
    };

  /**
   * Each lookup table's kind (information model §4.5.13), by its place and its outcome.
   */
  const DeclaredLookup = derived.stored(
    "DeclaredLookup",
    query(ledger).rule(lookupOf(lookupKinds[0])).rule(lookupOf(lookupKinds[1])),
  );

  /**
   * Each match table entry's source (information model §5.84.1), an integer, by its place and its
   * outcome.
   */
  const DeclaredMatchEntry = derived.stored(
    "DeclaredMatchEntry",
    query(ledger).rule((r) => {
      const sources = written(["qti-match-table-entry"], "source-value");
      const { identifier, package: pkg, path, start } = v(entries, "entry");
      const { value } = v(sources, "source");

      return r
        .match(entries, { identifier, kind: "qti-match-table-entry", package: pkg, path, start })
        .match(sources, { package: pkg, path, start, value })
        .where(
          r.eq(
            Logic.when(
              Num.within(Text.octetLength(value), 0, regexTextMaxBytes),
              () =>
                Logic.when(
                  Text.matches(value, integerText),
                  (digits) =>
                    Logic.when(
                      Num.within(Text.octetLength(digits), 0, decimalTextMaxBytes),
                      () =>
                        Logic.cond(
                          Num.within(Text.parseDecimal(digits), -integerBound, integerBound),
                          yes,
                          no,
                        ),
                      no,
                    ),
                  no,
                ),
              no,
            ),
            true,
          ),
        )
        .find({
          identifier,
          package: pkg,
          path,
          source: Logic.when(
            Num.within(Text.octetLength(value), 0, regexTextMaxBytes),
            () =>
              Logic.when(
                Text.matches(value, integerText),
                (digits) =>
                  Logic.when(
                    Num.within(Text.octetLength(digits), 0, decimalTextMaxBytes),
                    () =>
                      Logic.when(
                        Num.within(Text.parseDecimal(digits), -integerBound, integerBound),
                        (integer) => Type.cast(integer, QtiInteger),
                        noInteger,
                      ),
                    noInteger,
                  ),
                noInteger,
              ),
            noInteger,
          ),
          start,
        });
    }),
  );

  /**
   * Each interpolation table entry's source (information model §5.68.1), a float, and whether it
   * includes the boundary (default true, §5.68.3), by its place and its outcome.
   */
  const DeclaredInterpolationEntry = derived.stored(
    "DeclaredInterpolationEntry",
    query(ledger).rule((r) => {
      const boundaries = flag(["qti-interpolation-table-entry"], "include-boundary", true);
      const sources = double(["qti-interpolation-table-entry"], "source-value");
      const { identifier, package: pkg, path, start } = v(entries, "entry");
      const { on: boundary } = v(boundaries, "boundary");
      const { value: source } = v(sources, "source");

      return r
        .match(entries, {
          identifier,
          kind: "qti-interpolation-table-entry",
          package: pkg,
          path,
          start,
        })
        .match(boundaries, { on: boundary, package: pkg, path, start })
        .match(sources, { package: pkg, path, start, value: source })
        .find({ boundary, identifier, package: pkg, path, source, start });
    }),
  );

  /**
   * Each element that holds a value of its declaration's base type, by its place, with its kind and
   * the declaration's base type: a map entry, a match or interpolation table entry and a lookup
   * table (information model §5.89.1, §5.84.2, §5.68.2, §4.5.13.1).
   */
  const holders = query(ledger)
    .rule((r) => {
      const { baseType, kind, package: pkg, path, start } = v(tables, "table");

      return r
        .match(tables, { baseType, kind, package: pkg, path, start })
        .match(ValueHolder, { kind })
        .find({ baseType, package: pkg, path, start });
    })
    .rule((r) => {
      const { baseType, kind, package: pkg, path, start } = v(entries, "entry");

      return r
        .match(entries, { baseType, kind, package: pkg, path, start })
        .match(ValueHolder, { kind })
        .find({ baseType, package: pkg, path, start });
    });

  /**
   * Each value of its declaration's base type an element holds, as pantry's Attribute holds it,
   * with the base type: the one attribute its kind writes it in (`ValueHolder`), so the element's
   * place names it: a map entry's `map-key`, its tabs, line feeds and carriage returns read as
   * spaces as pantry holds it (ValueDType, `xs:normalizedString`, SV-VALUE-01), as inputs_of's
   * translate read it; a table entry's `target-value` and a lookup table's `default-value`.
   */
  const values = query(ledger).rule((r) => {
    const { baseType, package: pkg, path, start } = v(holders, "holder");
    const { kind } = v(Node, "element");
    const { name } = v(ValueHolder, "holds");
    const { value } = v(Attribute, "value");

    return r
      .match(holders, { baseType, package: pkg, path, start })
      .match(Node, { kind, package: pkg, path, start })
      .match(ValueHolder, { kind, name })
      .match(Attribute, { name, package: pkg, path, start, value })
      .find({ baseType, package: pkg, path, start, text: value });
  });

  /**
   * A text base type's values, by its base: an identifier's and a URI's collapsed (XML Schema's
   * whiteSpace collapse, as every atomic type but string reads it), a string's as written; an empty
   * one is NULL (information model, isNull), and has no row.
   *
   * @param base - The base type.
   * @returns The rule.
   */
  const textOf = (base: "identifier" | "string" | "uri") => (r: Rule<LedgerLevel>) => {
    const { package: pkg, path, start, text } = v(values, "text");
    const read = base === "string" ? text : Text.collapse(text);

    return r
      .match(values, { baseType: base, package: pkg, path, start, text })
      .where(r.ne(read, ""))
      .find({
        base: Type.literal(Single.fields.base, base),
        package: pkg,
        path,
        start,
        value: read,
      });
  };

  const DeclaredValueText = derived.stored(
    "DeclaredValueText",
    query(ledger).rule(textOf("identifier")).rule(textOf("uri")).rule(textOf("string")),
  );

  /**
   * Each integer value, collapsed, as QTI's integer.
   */
  const DeclaredValueInteger = derived.stored(
    "DeclaredValueInteger",
    query(ledger).rule((r) => {
      const { package: pkg, path, start, text } = v(values, "integer");
      const read = Text.collapse(text);

      return r
        .match(values, { baseType: "integer", package: pkg, path, start, text })
        .where(
          r.eq(
            Logic.when(
              Num.within(Text.octetLength(read), 0, regexTextMaxBytes),
              () =>
                Logic.when(
                  Text.matches(read, integerText),
                  (digits) =>
                    Logic.when(
                      Num.within(Text.octetLength(digits), 0, decimalTextMaxBytes),
                      () =>
                        Logic.cond(
                          Num.within(Text.parseDecimal(digits), -integerBound, integerBound),
                          yes,
                          no,
                        ),
                      no,
                    ),
                  no,
                ),
              no,
            ),
            true,
          ),
        )
        .find({
          package: pkg,
          path,
          start,
          value: Logic.when(
            Num.within(Text.octetLength(read), 0, regexTextMaxBytes),
            () =>
              Logic.when(
                Text.matches(read, integerText),
                (digits) =>
                  Logic.when(
                    Num.within(Text.octetLength(digits), 0, decimalTextMaxBytes),
                    () =>
                      Logic.when(
                        Num.within(Text.parseDecimal(digits), -integerBound, integerBound),
                        (integer) => Type.cast(integer, QtiInteger),
                        noInteger,
                      ),
                    noInteger,
                  ),
                noInteger,
              ),
            noInteger,
          ),
        });
    }),
  );

  /**
   * A float or duration value's double, collapsed and read as XML Schema reads an `xs:double`.
   *
   * @param base - The base type.
   * @returns The rule.
   */
  const floatOf = (base: "duration" | "float") => (r: Rule<LedgerLevel>) => {
    const { package: pkg, path, start, text } = v(values, "double");
    const read = Text.collapse(text);

    return r
      .match(values, { baseType: base, package: pkg, path, start, text })
      .where(
        r.eq(
          Logic.when(
            Num.within(Text.octetLength(read), 0, regexTextMaxBytes),
            () => Logic.cond(Text.matches(read, doubleText), yes, no),
            no,
          ),
          true,
        ),
      )
      .find({
        base: Type.literal(Single.fields.base, base),
        package: pkg,
        path,
        start,
        value: Logic.when(
          Num.within(Text.octetLength(read), 0, regexTextMaxBytes),
          () =>
            Logic.when(
              Text.matches(read, doubleText),
              (parsed) => Text.parseDouble(parsed),
              noFloat,
            ),
          noFloat,
        ),
      });
  };

  const DeclaredValueFloat = derived.stored(
    "DeclaredValueFloat",
    query(ledger).rule(floatOf("float")).rule(floatOf("duration")),
  );

  /**
   * Each boolean value: true where it reads `true` or `1` collapsed, else false.
   */
  const DeclaredValueBoolean = derived.stored(
    "DeclaredValueBoolean",
    query(ledger).rule((r) => {
      const { package: pkg, path, start, text } = v(values, "boolean");

      return r.match(values, { baseType: "boolean", package: pkg, path, start, text }).find({
        package: pkg,
        path,
        start,
        value: Logic.cond(
          Logic.or(Logic.eq(Text.collapse(text), "true"), Logic.eq(Text.collapse(text), "1")),
          yes,
          no,
        ),
      });
    }),
  );

  /**
   * Each pair value's two identifiers, its first two tokens, least and greatest: a pair is
   * unordered.
   */
  const DeclaredValuePair = derived.stored(
    "DeclaredValuePair",
    query(ledger).rule((r) => {
      const { package: pkg, path, start, text } = v(values, "pair");
      const { token: a } = v(r.tokens(text), "a");
      const { token: b } = v(r.tokens(text), "b");

      return r
        .match(values, { baseType: "pair", package: pkg, path, start, text })
        .match(r.tokens(text), { at: 0n, token: a })
        .match(r.tokens(text), { at: 1n, token: b })
        .find({
          greatest: Logic.greatest(a, b),
          least: Logic.least(a, b),
          package: pkg,
          path,
          start,
        });
    }),
  );

  /**
   * Each directed pair value's source and target, its first two tokens.
   */
  const DeclaredValueDirectedPair = derived.stored(
    "DeclaredValueDirectedPair",
    query(ledger).rule((r) => {
      const { package: pkg, path, start, text } = v(values, "directedPair");
      const { token: source } = v(r.tokens(text), "source");
      const { token: target } = v(r.tokens(text), "target");

      return r
        .match(values, { baseType: "directedPair", package: pkg, path, start, text })
        .match(r.tokens(text), { at: 0n, token: source })
        .match(r.tokens(text), { at: 1n, token: target })
        .find({ package: pkg, path, source, start, target });
    }),
  );

  /**
   * Each point value's coordinates, its first two tokens, each an integer.
   */
  const DeclaredValuePoint = derived.stored(
    "DeclaredValuePoint",
    query(ledger).rule((r) => {
      const { package: pkg, path, start, text } = v(values, "point");
      const { token: x } = v(r.tokens(text), "x");
      const { token: y } = v(r.tokens(text), "y");

      return r
        .match(values, { baseType: "point", package: pkg, path, start, text })
        .match(r.tokens(text), { at: 0n, token: x })
        .match(r.tokens(text), { at: 1n, token: y })
        .where(
          r.eq(
            Logic.when(
              Num.within(Text.octetLength(x), 0, regexTextMaxBytes),
              () =>
                Logic.when(
                  Text.matches(x, integerText),
                  (digits) =>
                    Logic.when(
                      Num.within(Text.octetLength(digits), 0, decimalTextMaxBytes),
                      () =>
                        Logic.cond(
                          Num.within(Text.parseDecimal(digits), -integerBound, integerBound),
                          yes,
                          no,
                        ),
                      no,
                    ),
                  no,
                ),
              no,
            ),
            true,
          ),
          r.eq(
            Logic.when(
              Num.within(Text.octetLength(y), 0, regexTextMaxBytes),
              () =>
                Logic.when(
                  Text.matches(y, integerText),
                  (digits) =>
                    Logic.when(
                      Num.within(Text.octetLength(digits), 0, decimalTextMaxBytes),
                      () =>
                        Logic.cond(
                          Num.within(Text.parseDecimal(digits), -integerBound, integerBound),
                          yes,
                          no,
                        ),
                      no,
                    ),
                  no,
                ),
              no,
            ),
            true,
          ),
        )
        .find({
          package: pkg,
          path,
          start,
          x: Logic.when(
            Num.within(Text.octetLength(x), 0, regexTextMaxBytes),
            () =>
              Logic.when(
                Text.matches(x, integerText),
                (digits) =>
                  Logic.when(
                    Num.within(Text.octetLength(digits), 0, decimalTextMaxBytes),
                    () =>
                      Logic.when(
                        Num.within(Text.parseDecimal(digits), -integerBound, integerBound),
                        (integer) => Type.cast(integer, QtiInteger),
                        noInteger,
                      ),
                    noInteger,
                  ),
                noInteger,
              ),
            noInteger,
          ),
          y: Logic.when(
            Num.within(Text.octetLength(y), 0, regexTextMaxBytes),
            () =>
              Logic.when(
                Text.matches(y, integerText),
                (digits) =>
                  Logic.when(
                    Num.within(Text.octetLength(digits), 0, decimalTextMaxBytes),
                    () =>
                      Logic.when(
                        Num.within(Text.parseDecimal(digits), -integerBound, integerBound),
                        (integer) => Type.cast(integer, QtiInteger),
                        noInteger,
                      ),
                    noInteger,
                  ),
                noInteger,
              ),
            noInteger,
          ),
        });
    }),
  );

  return {
    relations: [
      ItemBodyElement,
      ItemBodyAttribute,
      DeclarationElement,
      DeclarationAttribute,
      DeclarationValueText,
      DeclaredMapping,
      DeclaredAreaMapping,
      DeclaredMapEntry,
      DeclaredAreaEntry,
      DeclaredAreaCoord,
      DeclaredLookup,
      DeclaredMatchEntry,
      DeclaredInterpolationEntry,
      DeclaredValueText,
      DeclaredValueInteger,
      DeclaredValueFloat,
      DeclaredValueBoolean,
      DeclaredValuePair,
      DeclaredValueDirectedPair,
      DeclaredValuePoint,
    ],
  } as const;
};
