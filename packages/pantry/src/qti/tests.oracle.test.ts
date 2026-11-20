/**
 * The bank layer's free tests: an external include is judged by Include target only where its href
 * stays in the package; and a test, or a section document that is no bank, breaks its stated limit
 * alone (spec reading 1), by the law oracle and by the schema's laws over the import's rows.
 *
 * The overlay builders' tests (`#pantry/import/overlays/tests.test.ts`) judge the rows the laws
 * read.
 */
import { NodeServices } from "@effect/platform-node";
import { assert, describe, it, layer } from "@effect/vitest";
import { exhaust } from "@bjornpagen/testing/explore";
import { requiredInSpace } from "@bjornpagen/testing/features";
import { element } from "@bjornpagen/testing/gen";
import { searched } from "@bjornpagen/testing/vitest";
import { Array as Arr, Duration, Effect, Option, Schema } from "effect";
import { grammar } from "#pantry/grammar/install.ts";
import { readProgram } from "#pantry/import/program.ts";
import { readEntries } from "#pantry/package/read.ts";
import { Qti } from "#pantry/qti/schema.ts";
import { testLaws } from "#pantry/qti/tests.ts";
import { everyRelationPackage, scopedPackage } from "#pantry/test/gen/every-relation.ts";
import { previewRowsOf, judge, judgedLaws } from "#pantry/test/host-judge.ts";
import { lawNamesOf } from "#pantry/test/host-law-names.ts";
import { judge as judgeOracle, lawsOf } from "#pantry/test/oracle.ts";
import { nameOf } from "#pantry/test/package-name.ts";

/**
 * A selection's predicate term as grizzle keeps it on its `desc`, read field by field: the shapes a
 * site's or a reference's selection is written in, each field optional.
 */
interface StoredTerm {
  readonly arg?: StoredTerm;
  readonly args?: readonly StoredTerm[];
  readonly field?: string;
  readonly kind: string;
  readonly left?: StoredTerm;
  readonly op?: string;
  readonly right?: StoredTerm;
  readonly value?: Value;
  readonly values?: readonly Value[];
}

/**
 * A value a selection compares: a field's, or a literal's, as the sites' and references' fields
 * hold them.
 */
type Value = boolean | string;

/**
 * The schema of a {@link Value}.
 */
const ValueSchema = Schema.Union([Schema.Boolean, Schema.String]);

/**
 * The schema of a {@link StoredTerm}.
 */
const StoredTermSchema: Schema.Codec<StoredTerm> = Schema.Struct({
  arg: Schema.optionalKey(Schema.suspend((): Schema.Codec<StoredTerm> => StoredTermSchema)),
  args: Schema.optionalKey(
    Schema.Array(Schema.suspend((): Schema.Codec<StoredTerm> => StoredTermSchema)),
  ),
  field: Schema.optionalKey(Schema.String),
  kind: Schema.String,
  left: Schema.optionalKey(Schema.suspend((): Schema.Codec<StoredTerm> => StoredTermSchema)),
  op: Schema.optionalKey(Schema.String),
  right: Schema.optionalKey(Schema.suspend((): Schema.Codec<StoredTerm> => StoredTermSchema)),
  value: Schema.optionalKey(ValueSchema),
  values: Schema.optionalKey(Schema.Array(ValueSchema)),
});

/**
 * A side of a statement as grizzle keeps it: a selection of a relation with its predicate, or a
 * whole relation, and its terms.
 */
const SideSchema = Schema.Struct({
  source: Schema.Union([
    Schema.Struct({
      desc: Schema.Struct({ predicate: StoredTermSchema }),
      relation: Schema.Struct({ name: Schema.String }),
    }),
    Schema.Struct({ name: Schema.String }),
  ]),
  terms: Schema.Array(Schema.Unknown),
});

/**
 * A containment as grizzle keeps it.
 */
const ContainedSchema = Schema.Struct({
  kind: Schema.Literal("contained"),
  left: SideSchema,
  right: SideSchema,
});

/**
 * A side as {@link SideSchema} reads it.
 */
type StoredSide = typeof SideSchema.Type;

/**
 * A row's values by field, as a selection's predicate reads them.
 */
type Row = Readonly<Record<string, Value>>;

/**
 * Evaluate a stored predicate term on a row: a field's value, a literal, and the comparisons and
 * connectives a selection is written in. A term of another kind is no value, so a predicate that
 * holds one never holds.
 *
 * @param term - The term.
 * @param row - The row.
 * @returns Its value, none for a term of another kind.
 */
const valueOf = (term: StoredTerm, row: Row): Value | undefined => {
  const holds = (operand: StoredTerm | undefined) =>
    operand !== undefined && valueOf(operand, row) === true;
  const readers = new Map<string, () => Value | undefined>([
    ["and", () => (term.args ?? []).every((arg) => holds(arg))],
    [
      "compare",
      () =>
        term.left !== undefined && term.right !== undefined
          ? (valueOf(term.left, row) === valueOf(term.right, row)) === (term.op === "eq")
          : undefined,
    ],
    ["field", () => (term.field === undefined ? undefined : row[term.field])],
    [
      "in",
      () => {
        const value = term.arg === undefined ? undefined : valueOf(term.arg, row);

        return value === undefined ? undefined : (term.values ?? []).includes(value);
      },
    ],
    ["literal", () => term.value],
    ["not", () => term.arg !== undefined && valueOf(term.arg, row) === false],
    ["or", () => (term.args ?? []).some((arg) => holds(arg))],
  ]);

  return readers.get(term.kind)?.();
};

/**
 * Whether a side of a statement holds a row: every row of a whole relation, and a selection's row
 * where its predicate holds.
 *
 * @param side - The side.
 * @param row - The row.
 * @returns Whether it holds it.
 */
const selects = (side: StoredSide, row: Row): boolean =>
  "desc" in side.source ? valueOf(side.source.desc.predicate, row) === true : true;

/**
 * The relation a side reads.
 *
 * @param side - The side.
 * @returns Its relation's name.
 */
const relationOf = (side: StoredSide): string =>
  "desc" in side.source ? side.source.relation.name : side.source.name;

/**
 * Whether two sides' terms are the same, field by field.
 */
const sameTerms = Arr.makeEquivalence<unknown>((a, b) => a === b);

/**
 * The test layer's containments from one relation's terms into another's, as grizzle keeps them.
 *
 * @param from - The contained side's relation and terms.
 * @param to - The containing side's relation and terms.
 * @returns The containments.
 */
const containmentsOf = (
  from: readonly [string, ...string[]],
  to: readonly [string, ...string[]],
): readonly (typeof ContainedSchema.Type)[] =>
  testLaws.flatMap((statement) =>
    Option.toArray(Schema.decodeUnknownOption(ContainedSchema)(statement)).filter(
      ({ left, right }) =>
        relationOf(left) === from[0] &&
        relationOf(right) === to[0] &&
        sameTerms(left.terms, from.slice(1)) &&
        sameTerms(right.terms, to.slice(1)),
    ),
  );

describe("qti/tests.ts, an external include", () => {
  it("judges Include target and the href's entry path only of a site whose href stays in the package, and proves the mark by the include's href reference", () => {
    // Oracle: reading 115 and the href scopes of readings 35 and 102: an include whose href
    // resolves outside the package is stored as written and never fetched, so it names no
    // document and breaks no law; one in the package names a listed document or is refused
    // "Include target".
    const include = { external: false, kind: "xi:include" };
    const external = { ...include, external: true };

    // A site's href is its SitePath (#46's row of its own): "Include target" is an include's
    // SitePath, then into its ReferencePath.
    const [target, ...moreTargets] = containmentsOf(
      ["Site", "package", "path", "start", "kind"],
      ["SitePath", "package", "path", "start", "kind"],
    );
    assert.isDefined(target, "Include target");
    assert.deepStrictEqual(moreTargets, []);
    if (target !== undefined) {
      assert.isTrue(selects(target.left, include), "an in-package include is judged");
      assert.isFalse(selects(target.left, external), "an external include is not");
    }

    const [reached, ...moreReached] = containmentsOf(
      ["SitePath", "package", "path", "start", "target"],
      ["ReferencePath", "package", "path", "start", "target"],
    );
    assert.isDefined(reached, "the site's href path");
    assert.deepStrictEqual(moreReached, []);
    if (reached !== undefined) {
      assert.isTrue(selects(reached.left, { entry: true, kind: include.kind }));
      assert.isTrue(selects(reached.left, { entry: false, kind: include.kind }));
    }

    const [mark, ...moreMarks] = containmentsOf(
      ["Site", "package", "path", "start"],
      ["Reference", "package", "path", "start"],
    );
    assert.isDefined(mark, "the external mark's proof");
    assert.deepStrictEqual(moreMarks, []);
    if (mark !== undefined) {
      assert.isTrue(selects(mark.left, external), "an external site is proven");
      assert.isFalse(selects(mark.left, include), "an in-package site has its entry path");
      assert.isTrue(selects(mark.right, { name: "href", scope: "external" }));
      assert.isFalse(selects(mark.right, { name: "href", scope: "entry" }));
      assert.isFalse(selects(mark.right, { name: "src", scope: "external" }));
    }
  });
});

/**
 * The ways the box writes the every-relation package: as it is, its bank holding only item refs;
 * with a test document beside it; with a section document whose root holds an ordering, a nested
 * section or a section ref; and with a bank item ref that writes `required` or a child element.
 */
const limitCases = [
  "a bank",
  "a test",
  "an ordering in the bank",
  "a nested section in the bank",
  "a section ref in the bank",
  "a required item ref",
  "a child of an item ref",
] as const;

/**
 * One way the box writes the package.
 */
type LimitCase = (typeof limitCases)[number];

/**
 * The law each case breaks, none for the bank as it is.
 */
const brokenBy: Readonly<Record<LimitCase, readonly string[]>> = {
  "a bank": [],
  "a child of an item ref": ["Bank shape"],
  "a nested section in the bank": ["Bank shape"],
  "a required item ref": ["Bank shape"],
  "a section ref in the bank": ["Bank shape"],
  "a test": ["Test structure"],
  "an ordering in the bank": ["Bank shape"],
};

/**
 * The bank's first item ref, as the every-relation package writes it.
 */
const firstRef = '<qti-assessment-item-ref identifier="item1" href="items/item.xml"/>';

/**
 * A test of one part and one section, placing the first item, valid but for being a test.
 */
const testDocument = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<qti-assessment-test xmlns="http://www.imsglobal.org/xsd/imsqtiasi_v3p0" identifier="test1" title="A test">',
  '  <qti-test-part identifier="part1" navigation-mode="linear" submission-mode="individual">',
  '    <qti-assessment-section identifier="s1" title="A section" visible="true">',
  '      <qti-assessment-item-ref identifier="item1" href="items/item.xml"/>',
  "    </qti-assessment-section>",
  "  </qti-test-part>",
  "</qti-assessment-test>",
  "",
].join("\n");

/**
 * Replace the one occurrence of a text in an entry of a package.
 *
 * @param entries - The package's entries.
 * @param path - The entry.
 * @param search - The text, which must occur exactly once.
 * @param replacement - Its replacement.
 * @returns The entries, that entry edited.
 * @throws {Error} When the entry does not hold the text once: the every-relation package changed.
 */
const replacedIn = (
  entries: ReadonlyMap<string, Uint8Array>,
  path: string,
  search: string,
  replacement: string,
): ReadonlyMap<string, Uint8Array> => {
  const text = new TextDecoder().decode(entries.get(path));
  if (text.split(search).length !== 2) {
    throw new Error(
      `The every-relation package's ${path} no longer writes ${search} once. Point the stated limits' box at its own text.`,
    );
  }

  return new Map([
    ...entries,
    [path, new TextEncoder().encode(text.replace(search, () => replacement))],
  ]);
};

/**
 * Build the every-relation package of a case.
 *
 * @param limit - The case.
 * @returns The package's entries, by path.
 */
const limitPackage = (limit: LimitCase): ReadonlyMap<string, Uint8Array> => {
  const base = everyRelationPackage({ choices: 2, hotspots: 1, hottexts: 1 });
  const inBank = (replacement: string) => replacedIn(base, "section.xml", firstRef, replacement);
  const cases: Readonly<Record<LimitCase, () => ReadonlyMap<string, Uint8Array>>> = {
    "a bank": () => base,
    "a child of an item ref": () =>
      inBank(
        '<qti-assessment-item-ref identifier="item1" href="items/item.xml"><qti-weight identifier="W" value="2"/></qti-assessment-item-ref>',
      ),
    "a nested section in the bank": () =>
      inBank(
        `<qti-assessment-section identifier="inner" title="Inner" visible="true">${firstRef}</qti-assessment-section>`,
      ),
    "a required item ref": () =>
      inBank('<qti-assessment-item-ref identifier="item1" href="items/item.xml" required="true"/>'),
    "a section ref in the bank": () =>
      inBank(`${firstRef}\n  <qti-assessment-section-ref identifier="ref" href="section.xml"/>`),
    "a test": () =>
      replacedIn(
        new Map([...base, ["test.xml", new TextEncoder().encode(testDocument)]]),
        "imsmanifest.xml",
        '    <resource identifier="usage-res"',
        '    <resource identifier="test-res" type="imsqti_test_xmlv3p0" href="test.xml">\n      <file href="test.xml"/>\n      <dependency identifierref="item1-res"/>\n    </resource>\n    <resource identifier="usage-res"',
      ),
    "an ordering in the bank": () =>
      replacedIn(
        base,
        "section.xml",
        `visible="false">\n  ${firstRef}`,
        `visible="false">\n  <qti-ordering shuffle="true"/>\n  ${firstRef}`,
      ),
  };

  return cases[limit]();
};

layer(NodeServices.layer, { excludeTestServices: true })(
  "qti/tests.ts, the stated limits",
  (test) => {
    test.effect(
      "refuses a test under Test structure alone and a section document that is no bank under Bank shape alone, by the law oracle and by the schema's laws over the import's rows, and accepts a bank",
      (ctx) =>
        // Oracle: two implementations side by side, the law oracle's bank laws and the schema's laws
        // over the import's rows (`#pantry/test/host-judge.ts`), held to spec reading 1's two stated
        // limits by hand (`brokenBy`).
        // Bound: the every-relation package as it is, with a test beside it, and with each of five
        // ways its bank holds what no bank holds, 7.
        searched(
          ctx,
          exhaust(
            {
              box: "the every-relation package, its bank as written, a test beside it, or its bank holding an ordering, a nested section, a section ref, a required item ref or an item ref's child",
              caseHang: Duration.seconds(120),
              concurrency: 1,
              coverage: requiredInSpace<LimitCase>([...limitCases]),
              generator: element(limitCases),
              literal: JSON.stringify,
              oracle: {
                kind: "second-implementation",
                name: "the law oracle's bank laws and the schema's laws over the import's rows, held to spec reading 1 by hand",
              },
              suite: "qti/tests-stated-limits",
            },
            (limit: LimitCase, c) =>
              Effect.scoped(
                Effect.gen(function* statedLimit() {
                  c.note(limit);

                  const expected = brokenBy[limit];
                  const dir = yield* scopedPackage(limitPackage(limit));
                  const judgment = yield* judgeOracle(
                    yield* readEntries(dir),
                    grammar,
                    lawsOf(grammar),
                  );
                  assert.strictEqual(judgment._tag, "Judged", limit);

                  const oracle = new Set<string>(
                    judgment._tag === "Judged" ? judgment.breaches.map(({ law }) => law) : [],
                  );
                  const host = judge(
                    previewRowsOf((yield* readProgram(dir, nameOf(dir))).inputs),
                    judgedLaws(Qti),
                  );
                  assert.deepStrictEqual(
                    [...oracle].toSorted(),
                    expected,
                    `${limit}: the law oracle breaks ${[...oracle].join(", ") || "no law"}`,
                  );
                  assert.deepStrictEqual(
                    [...lawNamesOf(host.broken)].toSorted(),
                    expected,
                    `${limit}: the import's rows break ${[...lawNamesOf(host.broken)].join(", ") || "no law"}`,
                  );
                }),
              ),
          ),
        ),
    );
  },
);
