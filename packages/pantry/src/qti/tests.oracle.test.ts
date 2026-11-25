/**
 * The test and bank layer's free tests: an external include is judged by Include target only where
 * its href stays in the package; and the laws over a test's assembly and a section document, each
 * case of a box written to break one law or none, judged by the law oracle and by the schema's laws
 * over the import's rows alike, and held to the law the information model names by hand.
 *
 * The overlay builders' tests (`#pantry/import/overlays/tests.test.ts`) judge the rows the laws
 * read.
 */
import * as NodeServices from "@effect/platform-node/NodeServices";
import { assert, describe, it, layer } from "@effect/vitest";
import { drawn, exhaust, explore } from "@bjornpagen/testing/explore";
import { noCoverage, requiredInSpace } from "@bjornpagen/testing/features";
import { element, int } from "@bjornpagen/testing/gen";
import type { Gen } from "@bjornpagen/testing/gen";
import { completeShrink } from "@bjornpagen/testing/shrink";
import { searched } from "@bjornpagen/testing/vitest";
import { Array as Arr, Duration, Effect, Option, Schema } from "effect";
import { grammar } from "#pantry/grammar/install.ts";
import { readProgram } from "#pantry/import/program.ts";
import { readEntries } from "#pantry/package/read.ts";
import { Qti } from "#pantry/qti/schema.ts";
import { testLaws } from "#pantry/qti/tests.ts";
import { branchTo, testText } from "#pantry/test/gen/base-test.ts";
import type { TestEdit } from "#pantry/test/gen/base-test.ts";
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
    // SitePath, then into its ReferencePath; "Section ref target" holds an in-package section ref
    // to its own, by a containment of its own sites.
    const sited = containmentsOf(
      ["Site", "package", "path", "start", "kind"],
      ["SitePath", "package", "path", "start", "kind"],
    );
    const [target, ...moreTargets] = sited.filter(({ left }) => selects(left, include));
    assert.isDefined(target, "Include target");
    assert.deepStrictEqual(moreTargets, [], "one containment judges an in-package include");
    assert.deepStrictEqual(
      sited.filter(({ left }) => selects(left, external)),
      [],
      "an external include is not judged",
    );

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
 * Set the test's outcome from one expression.
 *
 * @param expression - The expression.
 * @returns The processing's text.
 */
const setTotal = (expression: string): string =>
  `<qti-set-outcome-value identifier="TOTAL">${expression}</qti-set-outcome-value>`;

/**
 * One document a case lists beside the package's own: its path, its resource's type and its text.
 */
interface ListedDocument {
  readonly path: string;
  readonly text: string;
  readonly type: string;
}

/**
 * One case of the box as it is written: the edit of the bank's first item ref, the documents it
 * lists beside the package's own, the edit of the base test it lists beside the bank, and the laws
 * the information model names for it.
 */
interface StructureCaseSpec {
  readonly bank?: string;
  readonly documents?: readonly ListedDocument[];
  readonly laws: readonly string[];
  readonly test: Option.Option<TestEdit>;
}

/**
 * A section document at the package's root, `shared.xml`: a section of the third item, with a
 * rubric block holding the given content before it.
 *
 * @param rubric - The rubric block's content body's paragraph.
 * @returns The document.
 */
const sharedSection = (rubric: string): ListedDocument => ({
  path: "shared.xml",
  text: `<?xml version="1.0" encoding="UTF-8"?>\n<qti-assessment-section xmlns="http://www.imsglobal.org/xsd/imsqtiasi_v3p0" identifier="shared" title="Shared" visible="true"><qti-rubric-block use="instructions" view="candidate"><qti-content-body><p${rubric}</p></qti-content-body></qti-rubric-block><qti-assessment-item-ref identifier="item3" href="items/item3.xml"/></qti-assessment-section>\n`,
  type: "imsqti_section_xmlv3p0",
});

/**
 * A fragment at the package's root, `frag.xml`, whose root is an item ref of the third item.
 */
const itemRefFragment: ListedDocument = {
  path: "frag.xml",
  text: '<?xml version="1.0" encoding="UTF-8"?>\n<qti-assessment-item-ref xmlns="http://www.imsglobal.org/xsd/imsqtiasi_v3p0" identifier="item3" href="items/item3.xml"/>\n',
  type: "imsqti_fragment_xmlv3p0",
};

/**
 * An include of `frag.xml`.
 */
const fragmentInclude = '<xi:include xmlns:xi="http://www.w3.org/2001/XInclude" href="frag.xml"/>';

/**
 * A section document at the package's root, `limited.xml`: a section of the third item whose
 * pre-condition reads the test's `LIMIT` against a float, so each test that places it types the
 * comparison by its own declaration of `LIMIT` (spec reading 117).
 */
const limitedSection: ListedDocument = {
  path: "limited.xml",
  text: '<?xml version="1.0" encoding="UTF-8"?>\n<qti-assessment-section xmlns="http://www.imsglobal.org/xsd/imsqtiasi_v3p0" identifier="limited" title="Limited" visible="true"><qti-pre-condition><qti-gt><qti-variable identifier="LIMIT"/><qti-base-value base-type="float">0.0</qti-base-value></qti-gt></qti-pre-condition><qti-assessment-item-ref identifier="item3" href="items/item3.xml"/></qti-assessment-section>\n',
  type: "imsqti_section_xmlv3p0",
};

/**
 * A declaration of the test's `LIMIT`, single, of a base type.
 *
 * @param baseType - Its base type.
 * @returns Its text.
 */
const limitDeclaration = (baseType: string): string =>
  `<qti-outcome-declaration identifier="LIMIT" cardinality="single" base-type="${baseType}"/>`;

/**
 * A second test at the package's root, `limiting.xml`, that declares `LIMIT` of a base type and
 * places `limited.xml` by a section ref.
 *
 * @param baseType - Its `LIMIT`'s base type.
 * @returns The document.
 */
const limitingTest = (baseType: string): ListedDocument => ({
  path: "limiting.xml",
  text: `<?xml version="1.0" encoding="UTF-8"?>\n<qti-assessment-test xmlns="http://www.imsglobal.org/xsd/imsqtiasi_v3p0" identifier="test2" title="Another test">${limitDeclaration(baseType)}<qti-test-part identifier="part1" navigation-mode="linear" submission-mode="individual"><qti-assessment-section identifier="s1" title="A section" visible="true"><qti-assessment-section-ref identifier="placed" href="limited.xml"/></qti-assessment-section></qti-test-part></qti-assessment-test>\n`,
  type: "imsqti_test_xmlv3p0",
});

/**
 * One block of a shuffled pool: a visible section by its identifier, fixed or not, holding the
 * third item's ref or a branch rule to another block.
 */
interface PoolBlock {
  readonly fixed: boolean;
  readonly holds: "item3" | { readonly to: string };
  readonly identifier: string;
}

/**
 * A visible section that shuffles its blocks, each a section of its own (§5.98), placed after the
 * base test's item refs.
 *
 * @param blocks - The blocks, in document order.
 * @returns Its text.
 */
const shuffledPool = (blocks: readonly PoolBlock[]): string =>
  `<qti-assessment-section identifier="pool" title="Pool" visible="true"><qti-ordering shuffle="true"/>${blocks
    .map(
      ({ fixed, holds, identifier }) =>
        `<qti-assessment-section identifier="${identifier}" title="${identifier}" visible="true"${fixed ? ' fixed="true"' : ""}>${holds === "item3" ? '<qti-assessment-item-ref identifier="item3" href="items/item3.xml"/>' : branchTo(holds.to)}</qti-assessment-section>`,
    )
    .join("")}</qti-assessment-section>`;

/**
 * An outcome condition whose one branch sets the test's float outcome, under a condition.
 *
 * @param condition - The condition's expression.
 * @returns The condition's text.
 */
const outcomeIf = (condition: string): string =>
  `<qti-outcome-condition><qti-outcome-if>${condition}${setTotal('<qti-base-value base-type="float">1</qti-base-value>')}</qti-outcome-if></qti-outcome-condition>`;

/**
 * A `qti-gt` of a variable and a float.
 *
 * @param variable - The variable.
 * @returns Its text.
 */
const greaterThanOne = (variable: string): string =>
  `<qti-gt><qti-variable identifier="${variable}"/><qti-base-value base-type="float">1</qti-base-value></qti-gt>`;

/**
 * A test feedback shown at the test's end, naming an outcome.
 *
 * @param outcome - The outcome.
 * @returns Its text.
 */
const testFeedback = (outcome: string): string =>
  `<qti-test-feedback access="atEnd" outcome-identifier="${outcome}" show-hide="show" identifier="done" title="Done"><qti-content-body><p>Done.</p></qti-content-body></qti-test-feedback>`;

/**
 * A test rubric block that prints a variable.
 *
 * @param variable - The variable.
 * @returns Its text.
 */
const printingRubric = (variable: string): string =>
  `<qti-rubric-block use="instructions" view="candidate"><qti-content-body><p>So far: <qti-printed-variable identifier="${variable}"/></p></qti-content-body></qti-rubric-block>`;

/**
 * The test's identifier outcome, which its feedback names.
 */
const verdictDeclaration =
  '<qti-outcome-declaration identifier="VERDICT" cardinality="single" base-type="identifier"/>';

/**
 * Each case of the box: the edit of the base test (`#pantry/test/gen/base-test.ts`) it lists beside
 * the bank, or an edit of the bank alone, the documents it lists beside them, and the laws the
 * information model names for it, by hand.
 */
const structureCases = {
  "a bank": { laws: [], test: Option.none() },
  "a bank item ref holding a weight": {
    bank: '<qti-assessment-item-ref identifier="item1" href="items/item.xml"><qti-weight identifier="W" value="2"/></qti-assessment-item-ref>',
    laws: [],
    test: Option.none(),
  },
  "a bank item ref that writes required": {
    bank: '<qti-assessment-item-ref identifier="item1" href="items/item.xml" required="true"/>',
    laws: [],
    test: Option.none(),
  },
  "a bank selecting beyond its parts": {
    bank: '<qti-selection select="4"/><qti-assessment-item-ref identifier="item1" href="items/item.xml"/>',
    laws: ["Selection bound"],
    test: Option.none(),
  },
  "a branch rule backward": {
    laws: ["Branch forward"],
    test: Option.some({
      parts: `<qti-assessment-item-ref identifier="item3" href="items/item3.xml">${branchTo("item1")}</qti-assessment-item-ref>`,
    }),
  },
  "a branch rule backward between two fixed blocks": {
    laws: ["Branch forward"],
    test: Option.some({
      parts: shuffledPool([
        { fixed: true, holds: "item3", identifier: "early" },
        { fixed: true, holds: { to: "early" }, identifier: "late" },
      ]),
    }),
  },
  "a branch rule backward from a fixed block with unfixed blocks on both sides": {
    laws: [],
    test: Option.some({
      parts: shuffledPool([
        { fixed: false, holds: "item3", identifier: "early" },
        { fixed: true, holds: { to: "early" }, identifier: "middle" },
        { fixed: false, holds: { to: "EXIT_SECTION" }, identifier: "late" },
      ]),
    }),
  },
  "a branch rule backward from a fixed last block, every unfixed one before it": {
    laws: ["Branch forward"],
    test: Option.some({
      parts: shuffledPool([
        { fixed: false, holds: "item3", identifier: "early" },
        { fixed: false, holds: { to: "EXIT_SECTION" }, identifier: "middle" },
        { fixed: true, holds: { to: "early" }, identifier: "late" },
      ]),
    }),
  },
  // §4.2.3, §5.6.3: "If a child element is fixed it must never be shuffled".
  "a branch rule backward in a shuffle that fixes nothing": {
    laws: [],
    test: Option.some({
      parts: shuffledPool([
        { fixed: false, holds: "item3", identifier: "early" },
        { fixed: false, holds: { to: "early" }, identifier: "late" },
      ]),
    }),
  },
  "a branch rule backward to a fixed first block, every unfixed one after it": {
    laws: ["Branch forward"],
    test: Option.some({
      parts: shuffledPool([
        { fixed: true, holds: "item3", identifier: "early" },
        { fixed: false, holds: { to: "early" }, identifier: "middle" },
        { fixed: false, holds: { to: "EXIT_SECTION" }, identifier: "late" },
      ]),
    }),
  },
  "a branch rule backward under a shuffle": {
    laws: [],
    test: Option.some({
      parts: `<qti-assessment-item-ref identifier="item3" href="items/item3.xml">${branchTo("item1")}</qti-assessment-item-ref>`,
      section: '<qti-ordering shuffle="true"/>',
    }),
  },
  "a branch rule forward": { laws: [], test: Option.some({ item1: branchTo("item2") }) },
  "a branch rule of an item ref to a test part": {
    laws: ["Branch target"],
    test: Option.some({ item1: branchTo("part1") }),
  },
  "a branch rule to an exit": { laws: [], test: Option.some({ item1: branchTo("EXIT_TEST") }) },
  // §2.12 and §7.5: an included fragment's root is a target, standing where its include stands.
  "a branch rule to an included root after its source": {
    documents: [itemRefFragment],
    laws: [],
    test: Option.some({ item1: branchTo("item3"), parts: fragmentInclude }),
  },
  "a branch rule to an included root before its source": {
    documents: [itemRefFragment],
    laws: ["Branch forward"],
    test: Option.some({ item1: branchTo("item3"), section: fragmentInclude }),
  },
  "a branch rule to an included root in another test part": {
    documents: [itemRefFragment],
    laws: ["Branch target"],
    test: Option.some({
      item1: branchTo("item3"),
      part2: `<qti-test-part identifier="part2" navigation-mode="linear" submission-mode="individual"><qti-assessment-section identifier="later" title="Later" visible="true">${fragmentInclude}</qti-assessment-section></qti-test-part>`,
    }),
  },
  "a branch rule to an item ref a replacement repeats": {
    laws: ["Branch target"],
    test: Option.some({
      item1: branchTo("item3"),
      parts: `<qti-assessment-section identifier="s2" title="Inner" visible="true"><qti-selection select="1" with-replacement="true"/><qti-assessment-item-ref identifier="item3" href="items/item3.xml"/></qti-assessment-section>`,
    }),
  },
  "a branch rule to its own section": {
    laws: ["Branch forward"],
    test: Option.some({ item1: branchTo("s1") }),
  },
  "a branch rule to nothing": {
    laws: ["Branch target"],
    test: Option.some({ item1: branchTo("nowhere") }),
  },
  "a comparison of an item's float outcome": {
    laws: [],
    test: Option.some({ processing: outcomeIf(greaterThanOne("item1.SCORE")) }),
  },
  "a comparison of an item's identifier response": {
    laws: ["Operand fit"],
    test: Option.some({ processing: outcomeIf(greaterThanOne("item1.RESPONSE")) }),
  },
  "a condition of an item's float outcome alone": {
    laws: ["Condition type"],
    test: Option.some({ processing: outcomeIf('<qti-variable identifier="item1.SCORE"/>') }),
  },
  "a filter naming its section": {
    laws: [],
    test: Option.some({
      processing: setTotal(
        '<qti-sum><qti-test-variables variable-identifier="SCORE" section-identifier="s1"/></qti-sum>',
      ),
    }),
  },
  "a filter naming no section": {
    laws: ["Section identifier target"],
    test: Option.some({
      processing: setTotal(
        '<qti-sum><qti-test-variables variable-identifier="SCORE" section-identifier="item1"/></qti-sum>',
      ),
    }),
  },
  "a float outcome set from a section's duration": {
    laws: ["Set type"],
    test: Option.some({ processing: setTotal('<qti-variable identifier="s1.duration"/>') }),
  },
  // §7.47.2: "When applying a weight to the value of a variable with base-type integer the value is
  // subject to type promotion and the result of the expression has base-type float"; "If the item
  // variable is of any other type the weight is ignored".
  "a float outcome set from a sum of weighted integer reads": {
    laws: [],
    test: Option.some({
      processing: setTotal(
        '<qti-sum><qti-variable identifier="item1.COUNT" weight-identifier="W"/><qti-variable identifier="item1.COUNT" weight-identifier="W"/></qti-sum>',
      ),
    }),
  },
  "a float outcome set from an unweighted integer read": {
    laws: ["Set type"],
    test: Option.some({ processing: setTotal('<qti-variable identifier="item1.COUNT"/>') }),
  },
  "a fragment of an item ref included once": {
    documents: [itemRefFragment],
    laws: [],
    test: Option.some({ parts: fragmentInclude }),
  },
  // XInclude's merged document holds a fragment included twice twice, so one section holds two
  // item refs of one identifier (§4.2.1).
  "a fragment of an item ref included twice in one section": {
    documents: [itemRefFragment],
    laws: ["Test name key"],
    test: Option.some({ parts: `${fragmentInclude}${fragmentInclude}` }),
  },
  "a lookup of a test part's duration into an interpolated float outcome": {
    laws: [],
    test: Option.some({
      declarations:
        '<qti-outcome-declaration identifier="TIMED" cardinality="single" base-type="float"><qti-interpolation-table><qti-interpolation-table-entry source-value="0" target-value="1"/></qti-interpolation-table></qti-outcome-declaration>',
      processing:
        '<qti-lookup-outcome-value identifier="TIMED"><qti-variable identifier="part1.duration"/></qti-lookup-outcome-value>',
    }),
  },
  "a mapping from a template": {
    laws: ["Variable mapping source"],
    test: Option.some({
      item1: '<qti-variable-mapping source-identifier="SHOWN" target-identifier="MAPPED"/>',
    }),
  },
  "a mapping onto a session variable": {
    laws: ["Variable mapping target"],
    test: Option.some({
      item1: '<qti-variable-mapping source-identifier="SCORE" target-identifier="numAttempts"/>',
    }),
  },
  "a mapping onto another outcome": {
    laws: ["Variable mapping target"],
    test: Option.some({
      item1: '<qti-variable-mapping source-identifier="SCORE" target-identifier="COUNT"/>',
    }),
  },
  "a mapping's name read by the test": {
    laws: [],
    test: Option.some({
      item1: '<qti-variable-mapping source-identifier="SCORE" target-identifier="MAPPED"/>',
      processing: setTotal('<qti-variable identifier="item1.MAPPED"/>'),
    }),
  },
  "a match of a weighted identifier read": {
    laws: [],
    test: Option.some({
      processing: outcomeIf(
        '<qti-match><qti-variable identifier="item1.RESPONSE" weight-identifier="W"/><qti-base-value base-type="identifier">A</qti-base-value></qti-match>',
      ),
    }),
  },
  "a nested section in the bank": {
    bank: '<qti-assessment-section identifier="inner" title="Inner" visible="true"><qti-assessment-item-ref identifier="item1" href="items/item.xml"/></qti-assessment-section>',
    laws: [],
    test: Option.none(),
  },
  // A variable's name is an identifier (§4.5.1), so `remote.1.SCORE` reads no variable `1.SCORE`
  // through the link, only its numbered reading (reading 88).
  "a numbered reading through a repeated item ref outside the package": {
    laws: [],
    test: Option.some({
      parts:
        '<qti-assessment-section identifier="s2" title="Inner" visible="true"><qti-selection select="2" with-replacement="true"/><qti-assessment-item-ref identifier="remote" href="https://example.org/item.xml"/></qti-assessment-section>',
      processing: setTotal('<qti-variable identifier="remote.1.SCORE"/>'),
    }),
  },
  "a numbered reading under no replacement": {
    laws: ["Variable declared"],
    test: Option.some({ processing: setTotal('<qti-variable identifier="item1.1.SCORE"/>') }),
  },
  "a numbered reading under replacement": {
    laws: [],
    test: Option.some({
      processing: setTotal('<qti-variable identifier="item1.1.SCORE"/>'),
      section: '<qti-selection select="2" with-replacement="true"/>',
    }),
  },
  // Reading 166, §7.22: a map response "transforms it using the associated mapping, which must have
  // been declared", through the item ref as in the item.
  "a prefixed map response of a mapped response": {
    laws: [],
    test: Option.some({ processing: setTotal('<qti-map-response identifier="item1.RESPONSE"/>') }),
  },
  "a prefixed map response of a response with no mapping": {
    laws: ["Mapped response"],
    test: Option.some({ processing: setTotal('<qti-map-response identifier="item1.HOT"/>') }),
  },
  "a prefixed map response of an item built-in": {
    laws: ["Mapped response"],
    test: Option.some({
      processing: setTotal('<qti-map-response identifier="item1.numAttempts"/>'),
    }),
  },
  "a prefixed map response point of a response with no area mapping": {
    laws: ["Mapped response"],
    test: Option.some({
      processing: setTotal('<qti-map-response-point identifier="item1.RESPONSE"/>'),
    }),
  },
  // §6.9.46: a map response point "transforms it using the associated areaMapping".
  "a prefixed map response point of an area-mapped point": {
    laws: [],
    test: Option.some({
      processing: setTotal('<qti-map-response-point identifier="item1.SPOT"/>'),
    }),
  },
  "a reading through an item ref outside the package": {
    laws: [],
    test: Option.some({
      parts: '<qti-assessment-item-ref identifier="remote" href="https://example.org/item.xml"/>',
      processing: setTotal('<qti-variable identifier="remote.ANYTHING"/>'),
    }),
  },
  "a reference no reading resolves": {
    laws: ["Variable declared"],
    test: Option.some({ processing: setTotal('<qti-variable identifier="item1.NOPE"/>') }),
  },
  "a reference read two ways": {
    laws: ["Prefixed reference"],
    test: Option.some({
      declarations:
        '<qti-outcome-declaration identifier="item1.SCORE" cardinality="single" base-type="float"/>',
    }),
  },
  // Spec reading 145: a section document a test references resolves its references in the test's
  // declarations, once per placement.
  "a referenced section's rubric printing no variable": {
    documents: [sharedSection('>So far: <qti-printed-variable identifier="NOPE"/>')],
    laws: ["Printed variable reference"],
    test: Option.some({
      parts: '<qti-assessment-section-ref identifier="placed" href="shared.xml"/>',
    }),
  },
  "a referenced section's rubric printing the test's outcome": {
    documents: [sharedSection('>So far: <qti-printed-variable identifier="TOTAL"/>')],
    laws: [],
    test: Option.some({
      parts: '<qti-assessment-section-ref identifier="placed" href="shared.xml"/>',
    }),
  },
  // §7.5.3: "A test may refer to the same section multiple times within a test", so its two copies
  // hold the section document's ID once.
  "a section document holding an ID, referenced twice": {
    documents: [sharedSection(' id="x">Read.')],
    laws: [],
    test: Option.some({
      parts:
        '<qti-assessment-section-ref identifier="once" href="shared.xml"/><qti-assessment-section-ref identifier="twice" href="shared.xml"/>',
    }),
  },
  // Spec reading 117: a section document two tests place is typed in each, by that test's own
  // declaration of what it reads.
  "a section document two tests place, its limit a float in each": {
    documents: [limitedSection, limitingTest("float")],
    laws: [],
    test: Option.some({
      declarations: limitDeclaration("float"),
      parts: '<qti-assessment-section-ref identifier="placed" href="limited.xml"/>',
    }),
  },
  "a section document two tests place, its limit a float in one and an identifier in the other": {
    documents: [limitedSection, limitingTest("identifier")],
    laws: ["Operand fit"],
    test: Option.some({
      declarations: limitDeclaration("float"),
      parts: '<qti-assessment-section-ref identifier="placed" href="limited.xml"/>',
    }),
  },
  // Spec reading 167: a section's duration reads the test's duration built-in, typed duration, so
  // it sets a duration outcome and no float one.
  "a section's duration": {
    laws: [],
    test: Option.some({
      declarations:
        '<qti-outcome-declaration identifier="SPENT" cardinality="single" base-type="duration"/>',
      processing:
        '<qti-set-outcome-value identifier="SPENT"><qti-variable identifier="s1.duration"/></qti-set-outcome-value>',
    }),
  },
  "a selection beyond its parts": {
    laws: ["Selection bound"],
    test: Option.some({ section: '<qti-selection select="3"/>' }),
  },
  "a selection under its required parts": {
    laws: ["Selection required"],
    test: Option.some({
      parts: '<qti-assessment-item-ref identifier="item3" href="items/item3.xml" required="true"/>',
      section: '<qti-selection select="0"/>',
    }),
  },
  "a selection with replacement beyond its parts": {
    laws: [],
    test: Option.some({ section: '<qti-selection select="3" with-replacement="true"/>' }),
  },
  "a template default of a template": {
    laws: [],
    test: Option.some({
      item1:
        '<qti-template-default template-identifier="N"><qti-base-value base-type="integer">1</qti-base-value></qti-template-default>',
    }),
  },
  "a template default of an outcome": {
    laws: ["Template default target"],
    test: Option.some({
      item1:
        '<qti-template-default template-identifier="SCORE"><qti-base-value base-type="integer">1</qti-base-value></qti-template-default>',
    }),
  },
  "a template default under an item ref outside the package": {
    laws: [],
    test: Option.some({
      parts:
        '<qti-assessment-item-ref identifier="remote" href="https://example.org/item.xml"><qti-template-default template-identifier="N"><qti-base-value base-type="integer">1</qti-base-value></qti-template-default></qti-assessment-item-ref>',
    }),
  },
  "a test": { laws: [], test: Option.some({}) },
  // §5.157.2: a test feedback's outcome identifier names "an outcome variable" the test declares.
  "a test feedback naming no outcome": {
    laws: ["Feedback reference"],
    test: Option.some({ feedback: testFeedback("NOPE") }),
  },
  // §5.49.1, of the feedback's outcome: "base-type of identifier".
  "a test feedback naming the test's float outcome": {
    laws: ["Feedback outcome type"],
    test: Option.some({ feedback: testFeedback("TOTAL") }),
  },
  "a test feedback naming the test's identifier outcome": {
    laws: [],
    test: Option.some({ declarations: verdictDeclaration, feedback: testFeedback("VERDICT") }),
  },
  // The bank's item refs share the test's identifiers (reading 86), so the test's `item1.SCORE`
  // reads through two item refs, ambiguous (reading 48).
  "a test placing the bank by a section ref": {
    laws: ["Prefixed reference", "Test name key"],
    test: Option.some({
      parts: '<qti-assessment-section-ref identifier="placed" href="section.xml"/>',
    }),
  },
  // §7.30.6: a printed variable names "The outcome variable or template variable [that] must have
  // been defined".
  "a test rubric printing no variable": {
    laws: ["Printed variable reference"],
    test: Option.some({ declarations: printingRubric("NOPE") }),
  },
  "a test rubric printing the test's outcome": {
    laws: [],
    test: Option.some({ declarations: printingRubric("TOTAL") }),
  },
  "a test's section ref naming an item": {
    laws: ["Section ref target"],
    test: Option.some({
      parts: '<qti-assessment-section-ref identifier="placed" href="items/item.xml"/>',
    }),
  },
  "a weighted integer test variables": {
    laws: ["Weighted base"],
    test: Option.some({
      processing:
        '<qti-set-outcome-value identifier="COUNTED"><qti-sum><qti-test-variables variable-identifier="COUNT" weight-identifier="W" base-type="integer"/></qti-sum></qti-set-outcome-value>',
    }),
  },
  "a weighted variable of the test's own": {
    laws: ["Weighted variable"],
    test: Option.some({
      processing: setTotal('<qti-variable identifier="TOTAL" weight-identifier="W"/>'),
    }),
  },
  "a weighted variable through its item ref": {
    laws: [],
    test: Option.some({
      processing: setTotal('<qti-variable identifier="item1.SCORE" weight-identifier="W"/>'),
    }),
  },
  "an integer outcome set from a weighted integer read": {
    laws: ["Set type"],
    test: Option.some({
      processing:
        '<qti-set-outcome-value identifier="COUNTED"><qti-variable identifier="item1.COUNT" weight-identifier="W"/></qti-set-outcome-value>',
    }),
  },
  // Spec reading 167: a test types its prefixed references by the readings its assembly gives them.
  "an integer outcome set from an item's float outcome": {
    laws: ["Set type"],
    test: Option.some({
      processing:
        '<qti-set-outcome-value identifier="COUNTED"><qti-variable identifier="item1.SCORE"/></qti-set-outcome-value>',
    }),
  },
  // Spec readings 106 and 167: an item's built-in through its item ref is typed as the item's
  // built-in, `numAttempts` a single integer.
  "an item's built-in through its item ref": {
    laws: [],
    test: Option.some({
      processing:
        '<qti-set-outcome-value identifier="COUNTED"><qti-variable identifier="item2.numAttempts"/></qti-set-outcome-value>',
    }),
  },
  "two weights of one identifier": {
    laws: ["Weight key"],
    test: Option.some({
      item1: '<qti-weight identifier="W" value="2"/><qti-weight identifier="W" value="3"/>',
    }),
  },
} as const satisfies Readonly<Record<string, StructureCaseSpec>>;

/**
 * One case of the box.
 */
type StructureCase = keyof typeof structureCases;

/**
 * Every case of the box.
 */
const caseNames = Arr.match(
  Object.keys(structureCases).filter((name): name is StructureCase =>
    Object.hasOwn(structureCases, name),
  ),
  {
    onEmpty: () => {
      throw new Error(
        "The box of the tests' laws holds no case. Write its cases in structureCases.",
      );
    },
    onNonEmpty: (names) => names,
  },
);

/**
 * The bank's first item ref, as the every-relation package writes it.
 */
const firstRef = '<qti-assessment-item-ref identifier="item1" href="items/item.xml"/>';

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
      `The every-relation package's ${path} no longer writes ${search} once. Point the tests' box at its own text.`,
    );
  }

  return new Map([
    ...entries,
    [path, new TextEncoder().encode(text.replace(search, () => replacement))],
  ]);
};

/**
 * List the base test beside the every-relation package's bank, written with an edit.
 *
 * @param entries - The package's entries.
 * @param edit - The test's edit.
 * @returns The entries, the test among them.
 */
const withTest = (
  entries: ReadonlyMap<string, Uint8Array>,
  edit: TestEdit,
): ReadonlyMap<string, Uint8Array> =>
  replacedIn(
    new Map([...entries, ["test.xml", new TextEncoder().encode(testText(edit))]]),
    "imsmanifest.xml",
    '    <resource identifier="usage-res"',
    '    <resource identifier="test-res" type="imsqti_test_xmlv3p0" href="test.xml">\n      <file href="test.xml"/>\n      <dependency identifierref="item1-res"/>\n    </resource>\n    <resource identifier="usage-res"',
  );

/**
 * Build the every-relation package of a case: its documents listed, its bank's first item ref
 * rewritten, and its test listed beside the bank.
 *
 * @param name - The case.
 * @returns The package's entries, by path.
 */
const casePackage = (name: StructureCase): ReadonlyMap<string, Uint8Array> => {
  const spec: StructureCaseSpec = structureCases[name];
  let base = everyRelationPackage({ choices: 2, hotspots: 1, hottexts: 1 });
  for (const { path, text, type } of spec.documents ?? []) {
    base = replacedIn(
      new Map([...base, [path, new TextEncoder().encode(text)]]),
      "imsmanifest.xml",
      '    <resource identifier="usage-res"',
      `    <resource identifier="${path}-res" type="${type}" href="${path}">\n      <file href="${path}"/>\n    </resource>\n    <resource identifier="usage-res"`,
    );
  }

  const banked =
    spec.bank === undefined ? base : replacedIn(base, "section.xml", firstRef, spec.bank);

  return Option.match(spec.test, {
    onNone: () => banked,
    onSome: (edit) => withTest(banked, edit),
  });
};

layer(NodeServices.layer, { excludeTestServices: true })(
  "qti/tests.ts and qti/overlay-queries/tests.ts, the laws over tests and sections",
  (test) => {
    test.effect(
      "breaks each case's law and no other, by the law oracle and by the schema's laws over the import's rows",
      (ctx) =>
        // Oracle: two implementations side by side, the law oracle's test producers and the
        // schema's laws over the import's rows (`#pantry/test/host-judge.ts`), held to the law the
        // information model names for the case by hand (`structureCases`): the oracle breaks it
        // and no other, and the import's rows break no other.
        // Bound: every case of the box, one per law of a test's or a section's structure that a
        // test or a bank of the every-relation package can break, beside a valid twin of each.
        searched(
          ctx,
          exhaust(
            {
              box: "the every-relation package, its bank as written or rewritten, alone or beside a test that breaks one law of a test's structure, readings or item refs, or none",
              caseHang: Duration.seconds(120),
              coverage: requiredInSpace<StructureCase>(caseNames),
              generator: element(caseNames),
              literal: JSON.stringify,
              oracle: {
                kind: "second-implementation",
                name: "the law oracle's test producers and the schema's laws over the import's rows, held to the information model by hand",
              },
              suite: "qti/tests-structure",
            },
            (name: StructureCase, c) =>
              Effect.scoped(
                Effect.gen(function* structureCase() {
                  c.note(name);

                  const expected: readonly string[] = [...structureCases[name].laws];
                  const dir = yield* scopedPackage(casePackage(name));
                  const judgment = yield* judgeOracle(
                    yield* readEntries(dir),
                    grammar,
                    lawsOf(grammar),
                  );
                  assert.strictEqual(judgment._tag, "Judged", name);

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
                    `${name}: the law oracle breaks ${[...oracle].join(", ") || "no law"}`,
                  );
                  // The host judges no rule over a query, which only the database evaluates, so
                  // it breaks a case's law only where a stored relation's statement states it,
                  // and never one the information model does not name.
                  assert.deepStrictEqual(
                    [...lawNamesOf(host.broken)].filter((law) => !expected.includes(law)),
                    [],
                    `${name}: the import's rows break ${[...lawNamesOf(host.broken)].join(", ") || "no law"}`,
                  );
                }),
              ),
          ),
        ),
    );
  },
);

/**
 * A part the selection property adds to the base test's section, beside its two item refs, which
 * write no `required`: none, the third item, or a section that holds it, each required or not.
 */
type ExtraPart = "none" | "item" | "required item" | "section" | "required section";

/**
 * A section of the base test as the selection property draws it: its added part, and its
 * selection's `select` and `with-replacement`, written or not.
 */
interface DrawnSelection {
  readonly extra: ExtraPart;
  readonly replacement: Option.Option<boolean>;
  readonly select: number;
}

/**
 * Each added part's text.
 */
const extraParts: Readonly<Record<ExtraPart, string>> = {
  item: '<qti-assessment-item-ref identifier="item3" href="items/item3.xml"/>',
  none: "",
  "required item":
    '<qti-assessment-item-ref identifier="item3" href="items/item3.xml" required="true"/>',
  "required section":
    '<qti-assessment-section identifier="s2" title="Inner" visible="true" required="true"><qti-assessment-item-ref identifier="item3" href="items/item3.xml"/></qti-assessment-section>',
  section:
    '<qti-assessment-section identifier="s2" title="Inner" visible="true"><qti-assessment-item-ref identifier="item3" href="items/item3.xml"/></qti-assessment-section>',
};

/**
 * Draw a section: its added part, and a selection of zero to five, its replacement true, false or
 * unwritten.
 */
const drawnSelection: Gen<DrawnSelection> = (source) => ({
  extra: source.draw(
    element(["none", "item", "required item", "section", "required section"] as const),
  ),
  replacement: source.draw(
    element([Option.none(), Option.some(true), Option.some(false)] as const),
  ),
  select: source.draw(int(0, 5)),
});

/**
 * Write a drawn section's case.
 *
 * @param drawn - The section.
 * @returns The case.
 */
const shownSelection = ({ extra, replacement, select }: DrawnSelection): string =>
  `select ${String(select)}${Option.match(replacement, { onNone: () => "", onSome: (held) => ` with-replacement ${String(held)}` })}, adding ${extra}`;

/**
 * The package of a drawn section: the base test, its section holding the drawn selection and part.
 *
 * @param drawn - The section.
 * @returns The package's entries.
 */
const selectionPackage = ({
  extra,
  replacement,
  select,
}: DrawnSelection): ReadonlyMap<string, Uint8Array> =>
  withTest(everyRelationPackage({ choices: 2, hotspots: 1, hottexts: 1 }), {
    parts: extraParts[extra],
    section: `<qti-selection select="${String(select)}"${Option.match(replacement, { onNone: () => "", onSome: (held) => ` with-replacement="${String(held)}"` })}/>`,
  });

layer(NodeServices.layer, { excludeTestServices: true })(
  "qti/overlay-queries/tests.ts, a section's selection",
  (test) => {
    test.effect(
      "breaks Selection bound exactly where it selects more than its parts without replacement, and Selection required exactly where it selects fewer than its required parts",
      (ctx) =>
        // Oracle: the information model by hand: §5.129.1, "The number of children to select may
        // exceed the number of child elements defined only if with-replacement is true", each part
        // counted once (reading 79); and §4.2.2, "It is an error if a section contains a selection
        // rule that selects fewer child elements than the number of required elements it
        // contains". Bound: the base test's two item refs and none, the third item or a section
        // holding it, each required or not, a select of zero to five, and its replacement true,
        // false or unwritten; 40 runs.
        searched(
          ctx,
          explore(
            {
              caseHang: Duration.seconds(60),
              coverage: noCoverage,
              draw: drawn(drawnSelection),
              kept: [],
              literal: shownSelection,
              oracle: {
                kind: "specification",
                name: "the information model's selection bounds, by hand, against the law oracle",
              },
              runs: 40,
              shrink: completeShrink,
              steerEvery: 16,
              suite: "qti/tests-selection",
            },
            (drawnCase: DrawnSelection) =>
              Effect.scoped(
                Effect.gen(function* selectionCase() {
                  const parts = drawnCase.extra === "none" ? 2 : 3;
                  const required = drawnCase.extra.startsWith("required") ? 1 : 0;
                  const expected = [
                    ...(!Option.contains(drawnCase.replacement, true) && drawnCase.select > parts
                      ? ["Selection bound"]
                      : []),
                    ...(required > 0 && drawnCase.select < required ? ["Selection required"] : []),
                  ];
                  const dir = yield* scopedPackage(selectionPackage(drawnCase));
                  const judgment = yield* judgeOracle(
                    yield* readEntries(dir),
                    grammar,
                    lawsOf(grammar),
                  );
                  const broken = new Set<string>(
                    judgment._tag === "Judged" ? judgment.breaches.map(({ law }) => law) : [],
                  );
                  assert.deepStrictEqual(
                    [...broken].toSorted(),
                    expected,
                    `${shownSelection(drawnCase)}: the law oracle breaks ${[...broken].join(", ") || "no law"}`,
                  );
                }),
              ),
          ),
        ),
    );
  },
);
