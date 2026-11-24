/**
 * The walk of every processing program a package holds (COMPILE-AT-PUBLISH C2, the walk): each
 * element of a document's `qti-response-processing`, `qti-template-processing` or
 * `qti-outcome-processing` subtree, and each parameter the SQL grader reads of it, parsed into its
 * typed relation, by the document that holds it (`package`, `path`) and the element's place
 * (`start`). Each is a function of its package's own rows, so it is known once the package is
 * published, and stored (grizzle's `derived.stored`, kept at COMMIT at every package a transaction
 * writes): a grade, a take and a test's outcome processing read a run's walk by key, and nothing
 * rebuilds it per run.
 *
 * A walk is its document's, not an item's: the readers find the document a run walks, the item's
 * own, the published template it names or the template document it locates (`ResponseProgram`), or
 * its test's, and the subtree by its root. So a template document's walk is stored once, however
 * many items run it, a published template's in the reference package that holds it.
 *
 * A stored row holds no NULL, so a parameter its element does not write has no row, and where QTI
 * 3.0.1 documents a default a second rule states it where the attribute is absent. Each parse is
 * the one the machine's `program_of` made on every grade, of pantry's `Attribute.value`, the
 * lexical form normalized by its domain's white space facet: every parameter here but `coords` is
 * of a collapsing type, so its value is `trim_xml`'s of it. An `xs:boolean` as `xs_boolean` reads
 * it, an IntegerOrVariableRef or a FloatOrVariableRef a literal where it reads as one and else a
 * variable's name, a list by its tokens, an area by `coords_of` and `area_kind_of`, a pattern by
 * `xsd_compile`, a base value by its base type.
 *
 * A stored relation's primary key holds no text of no byte bound (grizzle's `UnrepresentableKey`),
 * and a union's key is proven only where a literal tells its rules apart. So each relation either
 * proves a key of bounded fields (rules told apart by `field`, `filter`, `name` or `base`) or holds
 * only bounded fields: a mode as the machine's token, a variable's name as a `QtiIdentifier`.
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
  str,
  Text,
  Type,
  v,
  Xml,
} from "@bjornpagen/grizzle";
import type { Pattern, Rule } from "@bjornpagen/grizzle";
import type { AttributeName, NodeKind } from "@qti-pie/pantry/grammar/install.ts";
import { identifierBytes, keyedIdentifier } from "@qti-pie/pantry/qti/limits.ts";
import type { LedgerLevel } from "#ledger/delivery.ts";
import {
  Area,
  areaKindOf,
  coordsOf,
  DocWalkInteger,
  DocWalkName,
  PEqual,
  PFilter,
  PRound,
  Single,
  xsBoolean,
  xsdCompile,
} from "#ledger/grading.ts";
import { integerDigits, QtiFloat, QtiInteger } from "#ledger/scalars.ts";

/**
 * An element kind, as pantry's roster names it.
 */
type Kind = (typeof NodeKind.handles)[number];

/**
 * An attribute's name, as pantry's roster names it.
 */
type Name = (typeof AttributeName.handles)[number];

/**
 * A {@link WalkName} row's parameter.
 */
type NameField = "base" | "constant" | "field" | "math" | "section" | "stat" | "weight";

/**
 * A {@link WalkInteger}, {@link WalkFloat} or {@link WalkRef} row's parameter.
 */
type NumberField =
  | "any_n.max"
  | "any_n.min"
  | "equal.t0"
  | "equal.t1"
  | "frange.hi"
  | "frange.lo"
  | "int.value"
  | "range.hi"
  | "range.lo"
  | "range.step"
  | "round.figures";

/**
 * A number-or-variable parameter an attribute writes: its field, and its element's kind and the
 * attribute's name.
 */
interface NumberParameter {
  readonly field: NumberField;
  readonly kind: Kind;
  readonly name: Name;
}

/**
 * The expressions a test's outcome processing reads a test's items by (Tables 7.27, 7.28, 7.39):
 * each may name a section and filter the items by category.
 */
const testExpressions = [
  "qti-number-correct",
  "qti-number-incorrect",
  "qti-number-presented",
  "qti-number-responded",
  "qti-number-selected",
  "qti-outcome-maximum",
  "qti-outcome-minimum",
  "qti-test-variables",
] as const satisfies readonly Kind[];

/**
 * The integer-or-variable parameters, each by its field: an any-n's `min` and `max`, a random
 * integer's `min`, `max` and `step` (`range`), a rounding's `figures`, and an index's `n` or a
 * repeat's `number-repeats` (`int.value`).
 */
const integerParameters = [
  { field: "any_n.max", kind: "qti-any-n", name: "max" },
  { field: "any_n.min", kind: "qti-any-n", name: "min" },
  { field: "int.value", kind: "qti-index", name: "n" },
  { field: "int.value", kind: "qti-repeat", name: "number-repeats" },
  { field: "range.hi", kind: "qti-random-integer", name: "max" },
  { field: "range.lo", kind: "qti-random-integer", name: "min" },
  { field: "range.step", kind: "qti-random-integer", name: "step" },
  { field: "round.figures", kind: "qti-equal-rounded", name: "figures" },
  { field: "round.figures", kind: "qti-round-to", name: "figures" },
] as const satisfies readonly NumberParameter[];

/**
 * The float-or-variable parameters an attribute writes whole: a random float's `min` and `max`
 * (`frange`). An equal's `tolerance` lists its two.
 */
const floatParameters = [
  { field: "frange.hi", kind: "qti-random-float", name: "max" },
  { field: "frange.lo", kind: "qti-random-float", name: "min" },
] as const satisfies readonly NumberParameter[];

/**
 * The attribute a {@link WalkIdent} row's variable is named by.
 */
export const WalkIdentAttribute = str.regex(
  "^(identifier|outcome-identifier|variable-identifier)$",
);

/**
 * An IntegerOrVariableRef that reads as an integer (`int_ref_of`'s literal), and an integer base
 * value's text, a program's and a declaration's (`#ledger/stored-content.ts`).
 */
export const integerText = Text.pattern("^[+-]?[0-9]+$");

/**
 * A FloatOrVariableRef that reads as a float (`float_ref_of`'s literal), inside XML Schema's
 * `xs:double` lexical space, which `Text.parseDouble` reads.
 */
const floatText = Text.pattern(
  "^([+-]?([0-9]+(\\.[0-9]*)?|\\.[0-9]+)([eE][+-]?[0-9]+)?|-?INF|NaN)$",
);

/**
 * The machine's tolerance and rounding modes, its own tokens' patterns.
 */
const toleranceModes = Text.pattern(PEqual.fields.mode.patterns[0].source);

const roundingModes = Text.pattern(PRound.fields.mode.patterns[0].source);

/**
 * The greatest magnitude of QTI's integer as the ledger holds it, {@link integerDigits} digits: a
 * longer integer is none the grader reads, which `program_of`'s cast refused at every grade.
 */
export const integerBound = 10n ** BigInt(integerDigits) - 1n;

/**
 * A guarded match's true and false, as typed terms.
 */
export const yes = Type.literal(pg.boolean, true);

export const no = Type.literal(pg.boolean, false);

/**
 * What a guarded parse gives where its guard does not hold, which the query's own guard keeps from
 * standing: no row holds it.
 */
export const noInteger = Type.literal(QtiInteger, 0n);

export const noFloat = Type.literal(QtiFloat, 0);

/**
 * The relations of the walk, over the ledger `ledger`.
 *
 * @param ledger - The ledger level the delivery level extends.
 * @returns The relations the delivery level spreads.
 */
export const walksOf = (ledger: LedgerLevel) => {
  const { Attribute, Expression, Literal, Node, ProgramNodeKind } = ledger.relations;

  /**
   * Each element of a processing program, the root among them, by its document and place, with
   * its kind, end and parent as pantry stores them: every node of a kind the machine processes
   * (`ProgramNodeKind`) but an expression pantry places in no processing language (`Expression`'s
   * `none`: a test's branch rule or precondition, an item ref's template default). A root, a rule
   * and a fragment stand only in a program, and an expression in one carries its root's language
   * (pantry's `languagesOf`), so these are the machine's elements of the programs' spans, each one
   * row of `Node`, keyed by its place, as every relation of the walk is keyed by it.
   */
  const programNodes = query(ledger).rule((r) => {
    const { end, kind, package: pkg, parent, path, start } = v(Node, "node");

    return r
      .match(Node, { end, kind, package: pkg, parent, path, start })
      .match(ProgramNodeKind, { kind })
      .where(r.not(Expression, { language: "none", package: pkg, path, start }))
      .find({ end, kind, package: pkg, parent, path, start });
  });

  /**
   * The program's elements of a processing kind, by the machine's token (the closed
   * `ProgramNodeKind`): the walk's nodes.
   */
  const WalkNode = derived.stored(
    "WalkNode",
    query(ledger).rule((r) => {
      const { end, kind, package: pkg, parent, path, start } = v(programNodes, "node");
      const { token } = v(ProgramNodeKind, "kind");

      return r
        .match(programNodes, { end, kind, package: pkg, parent, path, start })
        .match(ProgramNodeKind, { kind, token })
        .find({ end, kind: token, package: pkg, parent, path, start });
    }),
  );

  /**
   * The value of an attribute `name` of each program element of one of `kinds`, as pantry holds it.
   *
   * @param kinds - The elements' kinds.
   * @param name - The attribute.
   * @returns The query.
   */
  const written = (kinds: readonly Kind[], name: Name) =>
    query(ledger).rule((r) => {
      const { kind, package: pkg, path, start } = v(programNodes, "node");
      const { value } = v(Attribute, "attribute");

      return r
        .match(programNodes, { kind, package: pkg, path, start })
        .match(Attribute, { name, package: pkg, path, start, value })
        .where(r.in(kind, kinds))
        .find({ package: pkg, path, start, value });
    });

  /**
   * The value of an attribute `name` of each program element that writes one, whatever its kind.
   *
   * @param name - The attribute.
   * @returns The query.
   */
  const writtenAnywhere = (name: Name) =>
    query(ledger).rule((r) => {
      const { package: pkg, path, start } = v(programNodes, "node");
      const { value } = v(Attribute, "attribute");

      return r
        .match(programNodes, { package: pkg, path, start })
        .match(Attribute, { name, package: pkg, path, start, value })
        .find({ package: pkg, path, start, value });
    });

  /**
   * Each program element of one of `kinds` that writes no attribute `name`.
   *
   * @param kinds - The elements' kinds.
   * @param name - The attribute.
   * @returns The query.
   */
  const unwritten = (kinds: readonly Kind[], name: Name) =>
    query(ledger).rule((r) => {
      const { kind, package: pkg, path, start } = v(programNodes, "node");

      return r
        .match(programNodes, { kind, package: pkg, path, start })
        .where(r.in(kind, kinds), r.not(Attribute, { name, package: pkg, path, start }))
        .find({ package: pkg, path, start });
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
        const elements = unwritten(kinds, name);
        const { package: pkg, path, start } = v(elements, "unset");

        return r
          .match(elements, { package: pkg, path, start })
          .find({ on: Type.literal(pg.boolean, absent), package: pkg, path, start });
      });

  /**
   * Each equal's tolerance mode, the machine's token (default `exact`), information model §5.46.
   */
  const toleranceModeOf = query(ledger)
    .rule((r) => {
      const values = written(["qti-equal"], "tolerance-mode");
      const { package: pkg, path, start, value } = v(values, "mode");

      return r
        .match(values, { package: pkg, path, start, value })
        .where(
          r.eq(
            Logic.when(
              Num.within(Text.octetLength(value), 0, regexTextMaxBytes),
              () => Logic.cond(Text.matches(value, toleranceModes), yes, no),
              no,
            ),
            true,
          ),
        )
        .find({
          mode: Logic.when(
            Num.within(Text.octetLength(value), 0, regexTextMaxBytes),
            () =>
              Logic.when(
                Text.matches(value, toleranceModes),
                (mode) => Type.cast(mode, PEqual.fields.mode),
                Type.literal(PEqual.fields.mode, "exact"),
              ),
            Type.literal(PEqual.fields.mode, "exact"),
          ),
          package: pkg,
          path,
          start,
        });
    })
    .rule((r) => {
      const elements = unwritten(["qti-equal"], "tolerance-mode");
      const { package: pkg, path, start } = v(elements, "unset");

      return r
        .match(elements, { package: pkg, path, start })
        .find({ mode: Type.literal(PEqual.fields.mode, "exact"), package: pkg, path, start });
    });

  /**
   * Each equal's tolerance mode and whether each bound is inside (default true), information model
   * §5.46.
   */
  const WalkEqual = derived.stored(
    "WalkEqual",
    query(ledger).rule((r) => {
      const lowers = flag(["qti-equal"], "include-lower-bound", true);
      const uppers = flag(["qti-equal"], "include-upper-bound", true);
      const { mode, package: pkg, path, start } = v(toleranceModeOf, "mode");
      const { on: lowerIn } = v(lowers, "lower");
      const { on: upperIn } = v(uppers, "upper");

      return r
        .match(toleranceModeOf, { mode, package: pkg, path, start })
        .match(lowers, { on: lowerIn, package: pkg, path, start })
        .match(uppers, { on: upperIn, package: pkg, path, start })
        .find({ lowerIn, mode, package: pkg, path, start, upperIn });
    }),
  );

  /**
   * Each rounding's mode, the machine's token (default `significantFigures`), information model
   * §5.47 and §5.119.
   */
  const WalkRound = derived.stored(
    "WalkRound",
    query(ledger)
      .rule((r) => {
        const values = written(["qti-equal-rounded", "qti-round-to"], "rounding-mode");
        const { package: pkg, path, start, value } = v(values, "mode");

        return r
          .match(values, { package: pkg, path, start, value })
          .where(
            r.eq(
              Logic.when(
                Num.within(Text.octetLength(value), 0, regexTextMaxBytes),
                () => Logic.cond(Text.matches(value, roundingModes), yes, no),
                no,
              ),
              true,
            ),
          )
          .find({
            mode: Logic.when(
              Num.within(Text.octetLength(value), 0, regexTextMaxBytes),
              () =>
                Logic.when(
                  Text.matches(value, roundingModes),
                  (mode) => Type.cast(mode, PRound.fields.mode),
                  Type.literal(PRound.fields.mode, "significantFigures"),
                ),
              Type.literal(PRound.fields.mode, "significantFigures"),
            ),
            package: pkg,
            path,
            start,
          });
      })
      .rule((r) => {
        const elements = unwritten(["qti-equal-rounded", "qti-round-to"], "rounding-mode");
        const { package: pkg, path, start } = v(elements, "unset");

        return r.match(elements, { package: pkg, path, start }).find({
          mode: Type.literal(PRound.fields.mode, "significantFigures"),
          package: pkg,
          path,
          start,
        });
      }),
  );

  /**
   * Whether a string match's or a substring's comparison is case sensitive (default true), and
   * whether a string match compares a substring (default false; a substring's never does).
   */
  const WalkText = derived.stored(
    "WalkText",
    query(ledger).rule((r) => {
      const sensitive = flag(["qti-string-match", "qti-substring"], "case-sensitive", true);
      const substrings = flag(["qti-string-match"], "substring", false).rule((s) => {
        const { package: pkg, path, start } = v(programNodes, "substring");

        return s
          .match(programNodes, { kind: "qti-substring", package: pkg, path, start })
          .find({ on: Type.literal(pg.boolean, false), package: pkg, path, start });
      });
      const { on: caseSensitive, package: pkg, path, start } = v(sensitive, "sensitive");
      const { on: substring } = v(substrings, "substring");

      return r
        .match(sensitive, { on: caseSensitive, package: pkg, path, start })
        .match(substrings, { on: substring, package: pkg, path, start })
        .find({ caseSensitive, package: pkg, path, start, substring });
    }),
  );

  /**
   * The variable an element names by `name`, with the attribute's name, which tells the rules
   * apart. QTI 3.0.1 writes each of these attributes on a processing element only where it names
   * the variable the element reads or sets (`identifier` on a variable, a correct, a default, a
   * mapping, a lookup and each setter; `variable-identifier` on a test variables;
   * `outcome-identifier` on an outcome minimum and maximum), which pantry's grammar holds.
   *
   * @param name - The attribute.
   * @returns The rule.
   */
  const identifiedBy =
    (name: "identifier" | "outcome-identifier" | "variable-identifier") =>
    (r: Rule<LedgerLevel>) => {
      const values = writtenAnywhere(name);
      const { package: pkg, path, start, value } = v(values, "identifier");

      return r.match(values, { package: pkg, path, start, value }).find({
        identifier: value,
        name: Type.literal(WalkIdentAttribute, name),
        package: pkg,
        path,
        start,
      });
    };

  /**
   * The variable each element reads or sets, by the attribute its kind names it by
   * ({@link identifiedBy}).
   */
  const WalkIdent = derived.stored(
    "WalkIdent",
    query(ledger)
      .rule(identifiedBy("identifier"))
      .rule(identifiedBy("variable-identifier"))
      .rule(identifiedBy("outcome-identifier")),
  );

  /**
   * One one-word parameter of `field`, from `name` at each element of `kinds`.
   *
   * @param field - The parameter.
   * @param kinds - The elements' kinds.
   * @param name - The attribute.
   * @returns The rule.
   */
  const named =
    (field: NameField, kinds: readonly Kind[], name: Name) => (r: Rule<LedgerLevel>) => {
      const values = written(kinds, name);
      const { package: pkg, path, start, value } = v(values, "name");

      return r.match(values, { package: pkg, path, start, value }).find({
        field: Type.literal(DocWalkName.fields.field, field),
        package: pkg,
        path,
        start,
        value,
      });
    };

  /**
   * Each one-word parameter an element writes, by which it is (the machine's roster,
   * `DocWalkName.field`).
   */
  const WalkName = derived.stored(
    "WalkName",
    query(ledger)
      .rule(named("base", ["qti-test-variables"], "base-type"))
      .rule(named("constant", ["qti-math-constant"], "name"))
      .rule(named("math", ["qti-math-operator"], "name"))
      .rule(named("stat", ["qti-stats-operator"], "name"))
      .rule(named("field", ["qti-field-value"], "field-identifier"))
      .rule(named("section", testExpressions, "section-identifier"))
      .rule(
        named(
          "weight",
          ["qti-outcome-maximum", "qti-outcome-minimum", "qti-test-variables", "qti-variable"],
          "weight-identifier",
        ),
      ),
  );

  /**
   * Each category filter a test expression writes, `include` or `exclude`: one that lists no
   * category is a filter all the same.
   */
  const WalkFilter = derived.stored(
    "WalkFilter",
    query(ledger)
      .rule((r) => {
        const lists = written(testExpressions, "include-category");
        const { package: pkg, path, start } = v(lists, "list");

        return r.match(lists, { package: pkg, path, start }).find({
          filter: Type.literal(PFilter.fields.filter, "include"),
          package: pkg,
          path,
          start,
        });
      })
      .rule((r) => {
        const lists = written(testExpressions, "exclude-category");
        const { package: pkg, path, start } = v(lists, "list");

        return r.match(lists, { package: pkg, path, start }).find({
          filter: Type.literal(PFilter.fields.filter, "exclude"),
          package: pkg,
          path,
          start,
        });
      }),
  );

  /**
   * Each category a test expression's filter lists, by the filter and its place in the list: the
   * tokens of its whitespace-separated list.
   *
   * @param filter - The filter.
   * @param name - Its attribute.
   * @returns The rule.
   */
  const listed =
    (filter: "exclude" | "include", name: "exclude-category" | "include-category") =>
    (r: Rule<LedgerLevel>) => {
      const lists = written(testExpressions, name);
      const { package: pkg, path, start, value } = v(lists, "list");
      const { at, token } = v(r.tokens(value), "category");

      return r
        .match(lists, { package: pkg, path, start, value })
        .match(r.tokens(value), { at, token })
        .find({
          at,
          category: token,
          filter: Type.literal(PFilter.fields.filter, filter),
          package: pkg,
          path,
          start,
        });
    };

  /**
   * Each category a test expression's filters list ({@link listed}).
   */
  const WalkCategory = derived.stored(
    "WalkCategory",
    query(ledger)
      .rule(listed("include", "include-category"))
      .rule(listed("exclude", "exclude-category")),
  );

  /**
   * Each inside's area as its `shape` attribute writes it (information model §5.71).
   */
  const outlines = written(["qti-inside"], "shape");

  /**
   * Each inside's coordinates as written.
   */
  const coordinates = written(["qti-inside"], "coords");

  /**
   * Each inside's area's kind (`area_kind_of`): its shape's, `everywhere` for a default, or
   * `nowhere` where its coordinates hold no point.
   */
  const WalkArea = derived.stored(
    "WalkArea",
    query(ledger)
      .rule((r) => {
        const { package: pkg, path, start, value: outline } = v(outlines, "outline");
        const { value } = v(coordinates, "coords");

        return r
          .match(outlines, { package: pkg, path, start, value: outline })
          .match(coordinates, { package: pkg, path, start, value })
          .find({
            kind: Fn.call(areaKindOf, { coords: value, kind: outline }),
            package: pkg,
            path,
            start,
          });
      })
      .rule((r) => {
        const { package: pkg, path, start, value: outline } = v(outlines, "outline");

        return r
          .match(outlines, { package: pkg, path, start, value: outline })
          .where(r.not(Attribute, { name: "coords", package: pkg, path, start }))
          .find({
            kind: Fn.call(areaKindOf, { coords: "", kind: outline }),
            package: pkg,
            path,
            start,
          });
      }),
  );

  /**
   * Each coordinate of an inside's area as written (`coords_of`), by its place from 1: none of a
   * default shape's, which reads none.
   */
  const WalkAreaCoord = derived.stored(
    "WalkAreaCoord",
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
            Type.literal(Area.fields.kind, "everywhere"),
          ),
        )
        .find({ c, package: pkg, path, place, start });
    }),
  );

  /**
   * An equal's `tolerance`, a list of one or two FloatOrVariableRefs (information model §5.46.2):
   * each token by its place from 0.
   */
  const toleranceTokens = query(ledger).rule((r) => {
    const values = written(["qti-equal"], "tolerance");
    const { package: pkg, path, start, value } = v(values, "tolerance");
    const { at, token } = v(r.tokens(value), "token");

    return r
      .match(values, { package: pkg, path, start, value })
      .match(r.tokens(value), { at, token })
      .find({ at, package: pkg, path, start, token });
  });

  /**
   * The tolerance's first and second as `program_of` read them, where it lists one or two: its
   * first, and its second, or its first again where it lists one.
   */
  const tolerances = query(ledger)
    .rule((r) => {
      const { package: pkg, path, start, token } = v(toleranceTokens, "first");

      return r
        .match(toleranceTokens, { at: 0n, package: pkg, path, start, token })
        .where(r.not(toleranceTokens, { at: 2n, package: pkg, path, start }))
        .find({
          field: Type.literal(DocWalkInteger.fields.field, "equal.t0"),
          package: pkg,
          path,
          start,
          text: token,
        });
    })
    .rule((r) => {
      const { package: pkg, path, start, token } = v(toleranceTokens, "second");

      return r
        .match(toleranceTokens, { at: 1n, package: pkg, path, start, token })
        .where(r.not(toleranceTokens, { at: 2n, package: pkg, path, start }))
        .find({
          field: Type.literal(DocWalkInteger.fields.field, "equal.t1"),
          package: pkg,
          path,
          start,
          text: token,
        });
    })
    .rule((r) => {
      const { package: pkg, path, start, token } = v(toleranceTokens, "only");

      return r
        .match(toleranceTokens, { at: 0n, package: pkg, path, start, token })
        .where(r.not(toleranceTokens, { at: 1n, package: pkg, path, start }))
        .find({
          field: Type.literal(DocWalkInteger.fields.field, "equal.t1"),
          package: pkg,
          path,
          start,
          text: token,
        });
    });

  /**
   * One integer parameter where it is a literal, by its field.
   *
   * @param parameter - The parameter.
   * @returns The rule.
   */
  const integerLiteral =
    ({ field, kind, name }: NumberParameter) =>
    (r: Rule<LedgerLevel>) => {
      const values = written([kind], name);
      const { package: pkg, path, start, value } = v(values, "integer");

      return r
        .match(values, { package: pkg, path, start, value })
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
          field: Type.literal(DocWalkInteger.fields.field, field),
          package: pkg,
          path,
          start,
          value: Logic.when(
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
        });
    };

  /**
   * QTI's default of an integer parameter at each element that writes none.
   *
   * @param parameter - The parameter.
   * @param absent - QTI's default.
   * @returns The rule.
   */
  const integerDefault =
    ({ field, kind, name }: NumberParameter, absent: bigint) =>
    (r: Rule<LedgerLevel>) => {
      const elements = unwritten([kind], name);
      const { package: pkg, path, start } = v(elements, "unset");

      return r.match(elements, { package: pkg, path, start }).find({
        field: Type.literal(DocWalkInteger.fields.field, field),
        package: pkg,
        path,
        start,
        value: Type.literal(QtiInteger, absent),
      });
    };

  const [anyMax, anyMin, indexN, repeats, rangeHi, rangeLo, rangeStep, figures, roundFigures] =
    integerParameters;

  /**
   * Each integer parameter that is a literal, by its field, and QTI's defaults: a random integer's
   * `min` 0 and `step` 1 (information model §5.110).
   */
  const WalkInteger = derived.stored(
    "WalkInteger",
    query(ledger)
      .rule(integerLiteral(anyMax))
      .rule(integerLiteral(anyMin))
      .rule(integerLiteral(indexN))
      .rule(integerLiteral(repeats))
      .rule(integerLiteral(rangeHi))
      .rule(integerLiteral(rangeLo))
      .rule(integerLiteral(rangeStep))
      .rule(integerLiteral(figures))
      .rule(integerLiteral(roundFigures))
      .rule(integerDefault(rangeLo, 0n))
      .rule(integerDefault(rangeStep, 1n)),
  );

  /**
   * One float parameter where it is a literal, by its field, read as XML Schema reads an
   * `xs:double` (`Text.parseDouble`).
   *
   * @param parameter - The parameter.
   * @returns The rule.
   */
  const floatLiteral =
    ({ field, kind, name }: NumberParameter) =>
    (r: Rule<LedgerLevel>) => {
      const values = written([kind], name);
      const { package: pkg, path, start, value } = v(values, "float");

      return r
        .match(values, { package: pkg, path, start, value })
        .where(
          r.eq(
            Logic.when(
              Num.within(Text.octetLength(value), 0, regexTextMaxBytes),
              () => Logic.cond(Text.matches(value, floatText), yes, no),
              no,
            ),
            true,
          ),
        )
        .find({
          field: Type.literal(DocWalkInteger.fields.field, field),
          package: pkg,
          path,
          start,
          value: Logic.when(
            Num.within(Text.octetLength(value), 0, regexTextMaxBytes),
            () =>
              Logic.when(
                Text.matches(value, floatText),
                (double) => Text.parseDouble(double),
                noFloat,
              ),
            noFloat,
          ),
        });
    };

  const [frangeHi, frangeLo] = floatParameters;

  /**
   * Each float parameter that is a literal, by its field, and QTI's default: a random float's
   * `min` 0 (information model §5.109).
   */
  const WalkFloat = derived.stored(
    "WalkFloat",
    query(ledger)
      .rule(floatLiteral(frangeHi))
      .rule(floatLiteral(frangeLo))
      .rule((r) => {
        const { field, package: pkg, path, start, text } = v(tolerances, "tolerance");

        return r
          .match(tolerances, { field, package: pkg, path, start, text })
          .where(
            r.eq(
              Logic.when(
                Num.within(Text.octetLength(text), 0, regexTextMaxBytes),
                () => Logic.cond(Text.matches(text, floatText), yes, no),
                no,
              ),
              true,
            ),
          )
          .find({
            field,
            package: pkg,
            path,
            start,
            value: Logic.when(
              Num.within(Text.octetLength(text), 0, regexTextMaxBytes),
              () =>
                Logic.when(
                  Text.matches(text, floatText),
                  (double) => Text.parseDouble(double),
                  noFloat,
                ),
              noFloat,
            ),
          });
      })
      .rule((r) => {
        const elements = unwritten(["qti-random-float"], "min");
        const { package: pkg, path, start } = v(elements, "unset");

        return r.match(elements, { package: pkg, path, start }).find({
          field: Type.literal(DocWalkInteger.fields.field, "frange.lo"),
          package: pkg,
          path,
          start,
          value: Type.literal(QtiFloat, 0),
        });
      }),
  );

  /**
   * One number-or-variable parameter where it is no literal of `literal`, by its field: the
   * variable's name it gives, as a key holds a QTI identifier (`keyedIdentifier`); a name past its
   * bytes names no variable, since no declaration's can be.
   *
   * @param parameter - The parameter.
   * @param literal - Its literal's pattern.
   * @returns The rule.
   */
  const reference =
    ({ field, kind, name }: NumberParameter, literal: Pattern) =>
    (r: Rule<LedgerLevel>) => {
      const values = written([kind], name);
      const { package: pkg, path, start, value } = v(values, "reference");

      return r
        .match(values, { package: pkg, path, start, value })
        .where(
          r.eq(
            Logic.when(
              Num.within(Text.octetLength(value), 0, regexTextMaxBytes),
              () => Logic.cond(Text.matches(value, literal), yes, no),
              no,
            ),
            false,
          ),
          Num.within(Text.octetLength(value), 0, identifierBytes),
        )
        .find({
          field: Type.literal(DocWalkInteger.fields.field, field),
          package: pkg,
          path,
          ref: keyedIdentifier(value),
          start,
        });
    };

  /**
   * Each number-or-variable parameter that is no literal, by its field: the variable's name it
   * gives (information model §9.3.1, §9.3.3).
   */
  const WalkRef = derived.stored(
    "WalkRef",
    query(ledger)
      .rule(reference(anyMax, integerText))
      .rule(reference(anyMin, integerText))
      .rule(reference(indexN, integerText))
      .rule(reference(repeats, integerText))
      .rule(reference(rangeHi, integerText))
      .rule(reference(rangeLo, integerText))
      .rule(reference(rangeStep, integerText))
      .rule(reference(figures, integerText))
      .rule(reference(roundFigures, integerText))
      .rule(reference(frangeHi, floatText))
      .rule(reference(frangeLo, floatText))
      .rule((r) => {
        const { field, package: pkg, path, start, text } = v(tolerances, "tolerance");

        return r
          .match(tolerances, { field, package: pkg, path, start, text })
          .where(
            r.eq(
              Logic.when(
                Num.within(Text.octetLength(text), 0, regexTextMaxBytes),
                () => Logic.cond(Text.matches(text, floatText), yes, no),
                no,
              ),
              false,
            ),
            Num.within(Text.octetLength(text), 0, identifierBytes),
          )
          .find({ field, package: pkg, path, ref: keyedIdentifier(text), start });
      }),
  );

  /**
   * Each distinct content pattern a package writes: a qti-pattern-match's `pattern` that is an XML
   * Schema 1.0 pattern (Appendix F), which every one that names no variable in braces is (pantry's
   * law). A braced name is none. A set, one row a text whatever elements of the package write it.
   */
  const patternTexts = query(ledger).rule((r) => {
    const { package: pkg, value } = v(Attribute, "pattern");

    return r
      .match(Attribute, { kind: "qti-pattern-match", name: "pattern", package: pkg, value })
      .where(r.eq(Xml.isPattern(value), true))
      .find({ package: pkg, pattern: value });
  });

  /**
   * Each distinct content pattern compiled (`xsd_compile`), one compile a text of the package
   * ({@link patternTexts}' rows), never one an element: gen:mathentry's 469,935 pattern matches
   * write 63 texts.
   */
  const compiledPatterns = query(ledger).rule((r) => {
    const { package: pkg, pattern } = v(patternTexts, "text");

    return r
      .match(patternTexts, { package: pkg, pattern })
      .find({ package: pkg, pattern, program: Fn.call(xsdCompile, { p: pattern }) });
  });

  /**
   * Each pattern match's program, where its pattern is an XML Schema pattern: what the machine
   * matches by, no grade compiling it. A pattern that names a variable in braces is the run's
   * reader's to resolve, by the declarations of the document it runs.
   */
  const WalkPattern = derived.stored(
    "WalkPattern",
    query(ledger).rule((r) => {
      const patterns = written(["qti-pattern-match"], "pattern");
      const { package: pkg, path, start, value } = v(patterns, "pattern");
      const { program } = v(compiledPatterns, "compiled");

      return r
        .match(patterns, { package: pkg, path, start, value })
        .match(compiledPatterns, { package: pkg, pattern: value, program })
        .find({ package: pkg, path, program, start });
    }),
  );

  /**
   * The program's base values: each `qti-base-value`'s text and base type, pantry's `Literal`.
   */
  const baseValues = query(ledger).rule((r) => {
    const { package: pkg, path, start } = v(programNodes, "value");
    const { baseType, text } = v(Literal, "literal");

    return r
      .match(programNodes, { kind: "qti-base-value", package: pkg, path, start })
      .match(Literal, { baseType, package: pkg, path, start, text })
      .find({ baseType, package: pkg, path, start, text });
  });

  /**
   * Each base value of a text base type, by its base: an identifier's and a URI's collapsed (XML
   * Schema's whiteSpace collapse, as every atomic type but string reads it) and a string's as
   * written; an empty one is NULL (information model, isNull), and has no row.
   */
  const WalkLiteralText = derived.stored(
    "WalkLiteralText",
    query(ledger)
      .rule((r) => {
        const { package: pkg, path, start, text } = v(baseValues, "identifier");

        return r
          .match(baseValues, { baseType: "identifier", package: pkg, path, start, text })
          .where(r.ne(Text.collapse(text), ""))
          .find({
            base: Type.literal(Single.fields.base, "identifier"),
            package: pkg,
            path,
            start,
            value: Text.collapse(text),
          });
      })
      .rule((r) => {
        const { package: pkg, path, start, text } = v(baseValues, "uri");

        return r
          .match(baseValues, { baseType: "uri", package: pkg, path, start, text })
          .where(r.ne(Text.collapse(text), ""))
          .find({
            base: Type.literal(Single.fields.base, "uri"),
            package: pkg,
            path,
            start,
            value: Text.collapse(text),
          });
      })
      .rule((r) => {
        const { package: pkg, path, start, text } = v(baseValues, "string");

        return r
          .match(baseValues, { baseType: "string", package: pkg, path, start, text })
          .where(r.ne(text, ""))
          .find({
            base: Type.literal(Single.fields.base, "string"),
            package: pkg,
            path,
            start,
            value: text,
          });
      }),
  );

  /**
   * Each integer base value, collapsed, as QTI's integer.
   */
  const WalkLiteralInteger = derived.stored(
    "WalkLiteralInteger",
    query(ledger).rule((r) => {
      const { package: pkg, path, start, text } = v(baseValues, "integer");

      return r
        .match(baseValues, { baseType: "integer", package: pkg, path, start, text })
        .where(
          r.eq(
            Logic.when(
              Text.matches(Text.collapse(text), integerText),
              (digits) =>
                Logic.cond(
                  Num.within(Text.parseDecimal(digits), -integerBound, integerBound),
                  yes,
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
            Text.matches(Text.collapse(text), integerText),
            (digits) =>
              Logic.when(
                Num.within(Text.parseDecimal(digits), -integerBound, integerBound),
                (integer) => Type.cast(integer, QtiInteger),
                noInteger,
              ),
            noInteger,
          ),
        });
    }),
  );

  /**
   * A float or duration base value's double, collapsed and read as XML Schema reads an `xs:double`.
   *
   * @param base - The base type.
   * @returns The rule.
   */
  const doubleOf = (base: "duration" | "float") => (r: Rule<LedgerLevel>) => {
    const { package: pkg, path, start, text } = v(baseValues, "double");

    return r
      .match(baseValues, { baseType: base, package: pkg, path, start, text })
      .where(Text.matches(Text.collapse(text), doubleText))
      .find({
        base: Type.literal(Single.fields.base, base),
        package: pkg,
        path,
        start,
        value: Logic.when(
          Text.matches(Text.collapse(text), doubleText),
          (double) => Text.parseDouble(double),
          noFloat,
        ),
      });
  };

  /**
   * Each float and duration base value, by its base.
   */
  const WalkLiteralFloat = derived.stored(
    "WalkLiteralFloat",
    query(ledger).rule(doubleOf("float")).rule(doubleOf("duration")),
  );

  /**
   * Each boolean base value: true where it reads `true` or `1` collapsed, else false.
   */
  const WalkLiteralBoolean = derived.stored(
    "WalkLiteralBoolean",
    query(ledger).rule((r) => {
      const { package: pkg, path, start, text } = v(baseValues, "boolean");

      return r.match(baseValues, { baseType: "boolean", package: pkg, path, start, text }).find({
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
   * Each pair base value's two identifiers, its first two tokens, least and greatest: a pair is
   * unordered.
   */
  const WalkLiteralPair = derived.stored(
    "WalkLiteralPair",
    query(ledger).rule((r) => {
      const { package: pkg, path, start, text } = v(baseValues, "pair");
      const { token: a } = v(r.tokens(text), "a");
      const { token: b } = v(r.tokens(text), "b");

      return r
        .match(baseValues, { baseType: "pair", package: pkg, path, start, text })
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
   * Each directed pair base value's source and target, its first two tokens.
   */
  const WalkLiteralDirectedPair = derived.stored(
    "WalkLiteralDirectedPair",
    query(ledger).rule((r) => {
      const { package: pkg, path, start, text } = v(baseValues, "directedPair");
      const { token: source } = v(r.tokens(text), "source");
      const { token: target } = v(r.tokens(text), "target");

      return r
        .match(baseValues, { baseType: "directedPair", package: pkg, path, start, text })
        .match(r.tokens(text), { at: 0n, token: source })
        .match(r.tokens(text), { at: 1n, token: target })
        .find({ package: pkg, path, source, start, target });
    }),
  );

  /**
   * Each point base value's coordinates, its first two tokens, each an integer.
   */
  const WalkLiteralPoint = derived.stored(
    "WalkLiteralPoint",
    query(ledger).rule((r) => {
      const { package: pkg, path, start, text } = v(baseValues, "point");
      const { token: x } = v(r.tokens(text), "x");
      const { token: y } = v(r.tokens(text), "y");

      return r
        .match(baseValues, { baseType: "point", package: pkg, path, start, text })
        .match(r.tokens(text), { at: 0n, token: x })
        .match(r.tokens(text), { at: 1n, token: y })
        .where(
          r.eq(
            Logic.when(
              Text.matches(x, integerText),
              (digits) =>
                Logic.cond(
                  Num.within(Text.parseDecimal(digits), -integerBound, integerBound),
                  yes,
                  no,
                ),
              no,
            ),
            true,
          ),
          r.eq(
            Logic.when(
              Text.matches(y, integerText),
              (digits) =>
                Logic.cond(
                  Num.within(Text.parseDecimal(digits), -integerBound, integerBound),
                  yes,
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
            Text.matches(x, integerText),
            (digits) =>
              Logic.when(
                Num.within(Text.parseDecimal(digits), -integerBound, integerBound),
                (integer) => Type.cast(integer, QtiInteger),
                noInteger,
              ),
            noInteger,
          ),
          y: Logic.when(
            Text.matches(y, integerText),
            (digits) =>
              Logic.when(
                Num.within(Text.parseDecimal(digits), -integerBound, integerBound),
                (integer) => Type.cast(integer, QtiInteger),
                noInteger,
              ),
            noInteger,
          ),
        });
    }),
  );

  return {
    relations: [
      WalkNode,
      WalkEqual,
      WalkRound,
      WalkText,
      WalkIdent,
      WalkName,
      WalkFilter,
      WalkCategory,
      WalkArea,
      WalkAreaCoord,
      WalkInteger,
      WalkFloat,
      WalkRef,
      WalkPattern,
      WalkLiteralText,
      WalkLiteralInteger,
      WalkLiteralFloat,
      WalkLiteralBoolean,
      WalkLiteralPair,
      WalkLiteralDirectedPair,
      WalkLiteralPoint,
    ],
  } as const;
};
