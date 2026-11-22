import { assert, describe, it } from "@effect/vitest";
import { exhaust } from "@bjornpagen/testing/explore";
import { noCoverage } from "@bjornpagen/testing/features";
import { int } from "@bjornpagen/testing/gen";
import { searched } from "@bjornpagen/testing/vitest";
import { Array as Arr, Duration, Effect, Formatter, Option, Predicate, Schema } from "effect";
import { vocabularies } from "#pantry/grammar/compose.ts";
import {
  cnForms,
  cnPatternOf,
  mathArities,
  mathHeadOperators,
  mathHeadQualifiers,
} from "#pantry/grammar/expression.ts";
import { includeAlternativesOf } from "#pantry/grammar/include.ts";
import * as install from "#pantry/grammar/install.ts";
import { foreignKinds } from "#pantry/grammar/kinds.ts";
import { valueDomainRoster } from "#pantry/grammar/value-domain-roster.ts";
import { admittedOf, includeRowsOf, symbolRowsOf } from "#pantry/test/indexes.ts";
import { searchWidth } from "#pantry/test/settings.ts";

/**
 * The composed grammar, the generators' rows every declaration is compared with.
 */
const { grammar } = install;

/**
 * How long one exhaustive search here may take: each walks at most a few thousand cases of rows the
 * module already holds, in well under a second, so a minute only bounds a hang.
 */
const caseHang = Duration.minutes(1);

/**
 * A field's value in a closed relation's rows: a handle or a text, or a natural.
 */
const ValueSchema = Schema.Union([Schema.String, Schema.BigInt, Schema.Boolean]);

/**
 * A field's value in a closed relation's rows.
 */
type Value = typeof ValueSchema.Type;

/**
 * A closed relation's row: each field's value under its name.
 */
const RowSchema = Schema.Record(Schema.String, ValueSchema);

/**
 * A closed relation's row.
 */
type Row = typeof RowSchema.Type;

/**
 * Parse rows read from a declaration or a generator into {@link Row}s.
 */
const rowsOf = Schema.decodeUnknownSync(Schema.Array(RowSchema));

/**
 * A grizzle field descriptor as these laws read it: a closed id carries its roster.
 */
const Descriptor = Schema.Struct({
  roster: Schema.optional(
    Schema.Struct({ handles: Schema.Array(Schema.String), name: Schema.String }),
  ),
});

/**
 * An installed closed relation as these laws read it: its name, fields, key and rows.
 */
const InstalledSchema = Schema.Struct({
  fields: Schema.Record(Schema.String, Descriptor),
  key: Schema.Array(Schema.String),
  kind: Schema.Literal("closedRelation"),
  name: Schema.String,
  rows: Schema.Array(RowSchema),
});

/**
 * An installed closed relation.
 */
type Installed = typeof InstalledSchema.Type;

/**
 * An installed roster as these laws read it: its name and its handles in code order.
 */
const InstalledRosterSchema = Schema.Struct({
  handles: Schema.Array(Schema.String),
  kind: Schema.Literal("closed"),
  name: Schema.String,
});

/**
 * Every closed relation `install.ts` declares, in export order, each parsed from its export.
 */
const installed: readonly Installed[] = Object.values(install).flatMap((value) =>
  Option.toArray(Schema.decodeUnknownOption(InstalledSchema)(value)),
);

/**
 * Every roster `install.ts` declares, in export order, each parsed from its export.
 */
const rosters = Object.values(install).flatMap((value) =>
  Option.toArray(Schema.decodeUnknownOption(InstalledRosterSchema)(value)),
);

/**
 * Spell a value as text, a natural marked so no handle spells the same.
 *
 * @param value - A field's value.
 * @returns Its text.
 */
const textOf = (value: Value | undefined): string =>
  Predicate.isBigInt(value) ? `${value}n` : JSON.stringify(value ?? null);

/**
 * Spell a tuple of values as one text.
 *
 * @param values - The values, in order.
 * @returns Their texts, space-separated.
 */
const tupleText = (values: readonly (Value | undefined)[]): string => values.map(textOf).join(" ");

/**
 * Read rows as a keyed set: each row's text by its key's text (rule 7). A repeat, identical or not,
 * is refused: grizzle's closed relation holds one row per key, and an oracle that collapsed a
 * repeat would hide one.
 *
 * @param name - The relation, for the failure.
 * @param key - The key's fields.
 * @param rows - The rows.
 * @returns Each row's text by its key's text.
 */
const keyedSet = (
  name: string,
  key: readonly string[],
  rows: readonly Row[],
): ReadonlyMap<string, string> => {
  const set = new Map<string, string>();
  for (const row of rows) {
    const at = key.map((field) => textOf(row[field])).join(" ");
    assert.isFalse(set.has(at), `${name} states two rows at (${at})`);
    set.set(
      at,
      Object.keys(row)
        .toSorted()
        .map((field) => `${field}=${textOf(row[field])}`)
        .join(" "),
    );
  }

  return set;
};

/**
 * Find an installed relation by name.
 *
 * @param name - The relation's name.
 * @returns It.
 */
const relationNamed = (name: string): Installed =>
  Option.getOrThrowWith(
    Arr.findFirst(installed, (relation) => relation.name === name),
    () => new Error(`install.ts declares no closed relation ${name}.`),
  );

/**
 * One comparison of the rows law: an installed relation and the rows its generator states, as the
 * relation keys them, each built only when its case runs.
 */
interface Comparison {
  readonly expected: () => readonly object[];
  readonly name: string;
}

/**
 * Each family of the content grammar, its parent, in code order.
 */
const families = grammar.kinds.nodeKind.handles.map((parent) => ({ parent }));

/**
 * The generator's governor of each governed handle: its kind and governing type.
 */
const governed: ReadonlyMap<string, { readonly governs: string; readonly kind: string }> = new Map(
  grammar.attributes.governor.rows.map(({ governor, governs, kind }) => [
    governor,
    { governs, kind },
  ]),
);

/**
 * The relations stated one to one with a generator's, or as the rulings restate them over the
 * generator's rows: each the second implementation of its declaration.
 */
const comparisons: readonly Comparison[] = [
  { expected: () => grammar.content.strictlyHeld.rows, name: "StrictlyHeld" },
  // The content grammar is keyed by automaton where it is generated, so each relation is its
  // generator's rows one to one, and nothing regroups families into models here.
  // Each family's admission map's rows are held to rule 0 by the admission test below.
  { expected: () => grammar.content.contentModelOf.rows, name: "ContentModelOf" },
  { expected: () => grammar.content.admissionIn.rows, name: "AdmissionIn" },
  { expected: () => grammar.content.symbolSetOf.rows, name: "SymbolSetOf" },
  { expected: () => grammar.content.symbolMember.rows, name: "SymbolMember" },
  {
    expected: () =>
      grammar.content.modelPositions.rows.map(({ model, positions }) => ({
        model,
        positions: BigInt(positions),
      })),
    name: "ModelPositions",
  },
  {
    // `Last` is no relation of its own: each of its (model, state) rows is the `ends` of that
    // state's `FollowSetOf` row, and no other state's, so the installed `ends` are exactly the
    // generator's `Last`.
    expected: () => {
      const ending = new Set(
        grammar.content.last.rows.map(({ model, position }) => `${model} ${position}`),
      );

      return grammar.content.followSetOf.rows.map((row) => ({
        ...row,
        ends: ending.has(`${row.model} ${row.from}`),
      }));
    },
    name: "FollowSetOf",
  },
  { expected: () => grammar.content.followMember.rows, name: "FollowMember" },
  { expected: () => grammar.content.sharedModelOf.rows, name: "SharedModelOf" },
  { expected: () => grammar.ancestry.enters.rows, name: "Enters" },
  { expected: () => grammar.ancestry.banned.rows, name: "Banned" },
  { expected: () => grammar.ancestry.needs.rows, name: "Needs" },
  { expected: () => grammar.xsi.xsiType.rows, name: "XsiType" },
  { expected: () => grammar.xsi.anonymousType.rows, name: "AnonymousType" },
  { expected: () => grammar.attributes.valueDomain.rows, name: "ValueDomainOf" },
  {
    expected: () =>
      grammar.attributes.identity.rows.map(({ domain, identity }) => ({ domain, identity })),
    name: "ValueIdentity",
  },
  {
    expected: () => [
      ...grammar.kinds.nodeKind.handles.flatMap((kind) =>
        Option.toArray(grammar.attributes.text.lookup({ kind })).map(({ domain }) => ({
          domain,
          governor: kind,
        })),
      ),
      ...[...governed].flatMap(([governor, { governs }]) =>
        Option.toArray(grammar.attributes.typeText.lookup({ governs })).map(({ domain }) => ({
          domain,
          governor,
        })),
      ),
    ],
    name: "TextDomain",
  },
  {
    expected: () => [
      ...grammar.xsi.xsiType.rows.map(({ kind, type }) => ({
        governor: Option.match(grammar.attributes.governor.lookup({ governs: type, kind }), {
          onNone: () => kind,
          onSome: ({ governor }) => governor,
        }),
        governs: type,
        kind,
      })),
      ...Object.values(foreignKinds).flatMap((kind) =>
        grammar.xsi.typeName.handles.map((governs) => ({
          governor: Option.match(grammar.attributes.governor.lookup({ governs, kind }), {
            onNone: () => kind,
            onSome: ({ governor }) => governor,
          }),
          governs,
          kind,
        })),
      ),
    ],
    name: "GoverningOf",
  },
  {
    expected: () => grammar.kinds.nodeKind.handles.map((kind) => ({ governor: kind, kind })),
    name: "KindGovernor",
  },
  {
    expected: () =>
      grammar.kinds.elementName.rows.map(({ kind, namespace }) => ({ kind, namespace })),
    name: "KindNamespace",
  },
  { expected: () => grammar.operatorArity.rows, name: "OperatorArity" },
  { expected: () => grammar.operatorMax.rows, name: "OperatorMax" },
  {
    expected: () => [...mathArities].map(([kind, { min }]) => ({ kind, min: BigInt(min) })),
    name: "MathArity",
  },
  {
    expected: () =>
      [...mathArities].flatMap(([kind, { max }]) =>
        Number.isFinite(max) ? [{ kind, max: BigInt(max) }] : [],
      ),
    name: "MathMax",
  },
  {
    expected: () => [...mathHeadOperators].map((kind) => ({ kind })),
    name: "MathHeadOperator",
  },
  {
    expected: () => mathHeadQualifiers.map(({ head, qualifier }) => ({ head, qualifier })),
    name: "HeadQualifier",
  },
  {
    expected: () =>
      [...cnForms].flatMap(([type, forms]) =>
        forms.map((form, part) => ({ form, part: String(part), type })),
      ),
    name: "CnForm",
  },
  {
    expected: () => [...cnForms].map(([type, forms]) => ({ parts: BigInt(forms.length), type })),
    name: "CnParts",
  },
  {
    expected: () =>
      [...new Set([...cnForms.values()].flat())].flatMap((form) =>
        Arr.range(2, 36).flatMap((base) =>
          Option.toArray(cnPatternOf(form, base)).map((pattern) => ({
            base: String(base),
            form,
            pattern: `^(?:${pattern})$`,
          })),
        ),
      ),
    name: "CnPattern",
  },
  { expected: () => grammar.bindingFit.rows, name: "BindingFit" },
  { expected: () => grammar.recordBindingFit.rows, name: "RecordBindingFit" },
  { expected: () => grammar.mappableBaseType.rows, name: "MappableBaseType" },
  { expected: () => grammar.package.rootOfType.rows, name: "RootOfType" },
  { expected: () => grammar.references.declares.rows, name: "Declares" },
  { expected: () => grammar.references.builtIn.rows, name: "BuiltInVariable" },
  { expected: () => grammar.references.variableReference.rows, name: "VariableReference" },
  { expected: () => grammar.references.contentReference.rows, name: "ContentReference" },
  { expected: () => grammar.references.choiceBound.rows, name: "ChoiceBound" },
  { expected: () => grammar.references.choiceCount.rows, name: "ChoiceCount" },
  { expected: () => grammar.references.sectionPart.rows, name: "SectionPart" },
  { expected: () => grammar.references.referenceAttribute.rows, name: "ReferenceAttribute" },
  { expected: () => grammar.kindByNameUnder.rows, name: "KindByNameUnder" },
  { expected: () => grammar.heldRootsUnder.rows, name: "HeldRootsUnder" },
  { expected: () => grammar.typeAvailable.rows, name: "TypeAvailable" },
  {
    expected: () => grammar.baseTypes.handles.map((code) => ({ code, lexical: code })),
    name: "BaseTypeLexical",
  },
  {
    expected: () =>
      [...grammar.typedCardinalities.handles, "record"].map((code) => ({ code, lexical: code })),
    name: "CardinalityLexical",
  },
  {
    expected: () => grammar.package.resourceType.handles.map((code) => ({ code, lexical: code })),
    name: "ResourceTypeLexical",
  },
];

/**
 * Whether a generator states at most one row per parent's family.
 *
 * @param rows - The generator's rows.
 * @returns Whether no family has two.
 */
const oncePerFamily = (rows: readonly { readonly parent: string }[]): boolean =>
  [...Map.groupBy(rows, ({ parent }) => parent).values()].every((held) => held.length === 1);

/**
 * Find an installed roster's handles by name.
 *
 * @param name - The roster's name.
 * @returns Its handles, in code order.
 */
const handlesOf = (name: string): readonly string[] =>
  Option.getOrThrow(Arr.findFirst(rosters, (held) => held.name === name)).handles;

/**
 * How long each exhaustive search of every relation or family may run: a hang guard.
 */
const searchTimeout = 120_000;

/**
 * The empty set of row texts: a group no row is in.
 */
const noRows: ReadonlySet<string> = new Set();

/**
 * Index an installed relation's rows by a field, each row spelled by others.
 *
 * @param name - The relation's name.
 * @param by - The field whose value names a row's group.
 * @param fields - The fields that spell a row within its group.
 * @returns Each group's rows' texts, by the group's value's text.
 */
const groupedBy = (
  name: string,
  by: string,
  fields: readonly string[],
): ReadonlyMap<string, ReadonlySet<string>> => {
  const groups = new Map<string, Set<string>>();
  for (const row of relationNamed(name).rows) {
    const at = tupleText([row[by]]);
    groups.set(at, (groups.get(at) ?? new Set()).add(tupleText(fields.map((field) => row[field]))));
  }

  return groups;
};

/**
 * Every governor the `Governor` roster holds.
 */
const governors = handlesOf("Governor");

/**
 * Each governor's model, `AttributeModelOf`'s rows.
 */
const attributeModels: ReadonlyMap<string, string> = new Map(
  relationNamed("AttributeModelOf").rows.map((row) => [
    tupleText([row["governor"]]),
    tupleText([row["model"]]),
  ]),
);

/**
 * Each model's `AttributeGrammar` rows as (slot, name, domain, use).
 */
const attributeGrammar = groupedBy("AttributeGrammar", "model", ["slot", "name", "domain", "use"]);

/**
 * Each model's `Required` slots.
 */
const required = groupedBy("Required", "model", ["slot"]);

/**
 * Each model's `AttributeSlots` count.
 */
const attributeSlots: ReadonlyMap<string, Value | undefined> = new Map(
  relationNamed("AttributeSlots").rows.map((row) => [tupleText([row["model"]]), row["slots"]]),
);

/**
 * The generator's attribute rows of each governor: a kind's own under the kind, a governing type's
 * under its governor.
 */
const ownAttributes = Map.groupBy(
  [
    ...grammar.attributes.admission.rows.map(({ kind, ...row }) => ({ ...row, governor: kind })),
    ...grammar.attributes.governed.rows,
  ],
  ({ governor }) => governor,
);

/**
 * Each attribute row's (model, name, slot), its slot as AL1 and AL2 read it by name.
 *
 * @param rows - The rows.
 * @returns Each row's model, name and slot.
 */
const slotsOf = (
  rows: readonly { readonly model: string; readonly name: string; readonly slot: string }[],
) => rows.map(({ model, name, slot }) => ({ model, name, slot }));

describe("the installed relations", () => {
  it.effect(
    "hold exactly their generators' rows, as keyed sets, every relation stated over the generator's rows",
    (ctx) =>
      searched(
        ctx,
        exhaust(
          {
            box: "every relation stated one to one or restated over a generator's rows, every row",
            caseHang,
            concurrency: searchWidth,
            coverage: noCoverage,
            generator: int(0, comparisons.length - 1),
            literal: Formatter.format,
            oracle: { kind: "second-implementation", name: "composed()'s closed.ts relations" },
            suite: "grammar/install/rows",
          },
          (index) =>
            Effect.sync(() => {
              const { expected, name } = Arr.getUnsafe(comparisons, index);
              const relation = relationNamed(name);
              const fields = Object.keys(relation.fields);
              const stated = rowsOf(expected()).map((row) =>
                Object.fromEntries(
                  fields.flatMap((field) => {
                    const value = row[field];

                    return value === undefined ? [] : [[field, value] as const];
                  }),
                ),
              );

              assert.deepStrictEqual(
                keyedSet(name, relation.key, relation.rows),
                keyedSet(`${name}'s generator`, relation.key, stated),
                name,
              );
            }),
        ),
      ),
    searchTimeout,
  );

  it.effect(
    "give every governor its attribute model: the model's slots, names, domains, uses and required slots are the governor's own rows",
    (ctx) =>
      searched(
        ctx,
        exhaust(
          {
            box: "every governor of the Governor roster",
            caseHang,
            concurrency: searchWidth,
            coverage: noCoverage,
            generator: int(0, governors.length - 1),
            literal: Formatter.format,
            oracle: {
              kind: "second-implementation",
              name: "the governor's generated attribute rows",
            },
            suite: "grammar/install/attribute-models",
          },
          (index) =>
            Effect.sync(() => {
              const governor = Arr.getUnsafe(governors, index);
              const at = tupleText([governor]);
              const model = attributeModels.get(at) ?? assert.fail(`${at} has no attribute model`);
              const own = ownAttributes.get(governor) ?? [];

              assert.deepStrictEqual(
                attributeGrammar.get(model) ?? noRows,
                new Set(
                  own.map(({ domain, name, position, use }) =>
                    tupleText([position, name, domain, use]),
                  ),
                ),
                at,
              );
              assert.deepStrictEqual(
                required.get(model) ?? noRows,
                new Set(
                  own
                    .filter(({ use }) => use === "required")
                    .map(({ position }) => tupleText([position])),
                ),
                at,
              );
              assert.strictEqual(attributeSlots.get(model), BigInt(own.length), at);
            }),
        ),
      ),
    searchTimeout,
  );

  it(
    "give the host the generator's attribute rows, each (governor, name) once",
    () => {
      const fields = ["domain", "governor", "name", "position", "use"] as const;
      const spelled = (rows: readonly object[]) =>
        rowsOf(rows).map((row) =>
          Object.fromEntries(
            fields.flatMap((field) => {
              const value = row[field];

              return value === undefined ? [] : [[field, value] as const];
            }),
          ),
        );

      assert.deepStrictEqual(
        keyedSet("attributeRows", ["governor", "name"], spelled(install.attributeRows)),
        keyedSet(
          "the attribute generator",
          ["governor", "name"],
          spelled([...ownAttributes.values()].flat()),
        ),
      );
    },
    searchTimeout,
  );

  it("state Admission, ChildGrammar once, as each family's admission map, each distinct map once and held by a family, and read each (parent, child) at its position through its family's map", () => {
    // Oracle: rule 0, identical facts are one fact, over the content grammar's maps, which
    // install.ts states one to one (the rows law above): a map minted twice, a map no family holds,
    // or a child held twice in a map is a fact stated twice or one stated of nothing. And
    // `Admission.lookup`, the host's reading of the maps that N5's `AdmissionIn` at the family's
    // map restates, against the maps spelled out (`admittedOf`): every (parent, child)
    // they state, at its position.
    const { admissionIn, admissionMaps, contentModelOf } = grammar.content;
    const members = Map.groupBy(admissionIn.rows, ({ map }) => map);
    const spelled = admissionMaps.handles.map((map) =>
      (members.get(map) ?? []).map(({ child, position }) => `${child}:${position}`).join(" "),
    );
    const held = new Set(contentModelOf.rows.map(({ admission }) => admission));
    const admitted = admittedOf(contentModelOf, admissionIn);

    keyedSet("AdmissionIn", ["map", "child"], admissionIn.rows);
    assert.strictEqual(
      new Set(spelled).size,
      spelled.length,
      "two admission maps hold one set of children",
    );
    assert.deepStrictEqual(
      admissionMaps.handles.filter((map) => !held.has(map)),
      [],
      "admission maps no family holds",
    );
    assert.deepStrictEqual(
      admitted.filter(
        (row) =>
          !Option.contains(
            Option.map(grammar.admission.lookup(row), ({ position }) => position),
            row.position,
          ),
      ),
      [],
    );
    assert.isBelow(admissionIn.rows.length, admitted.length);
  });

  it("state each shared model's kinds' positions as symbol sets, each distinct set of positions once, held by the pairs it names and by no other", () => {
    // Oracle: rule 0, identical facts are one fact. The content grammar numbers each distinct set
    // of positions a shared model names a kind at once (`SymbolSetOf`, `SymbolMember`), and
    // install.ts states them one to one (the rows law above), so N5's
    // `SymbolMember.row(SymbolSetOf.at("set", m, k))` reads exactly the positions of the pair. A
    // set minted twice, a set no pair holds, or a position held twice in a set is a fact stated
    // twice or one stated of nothing.
    const { symbolMember, symbolSetOf, symbolSets } = grammar.content;
    const members = Map.groupBy(symbolMember.rows, ({ set }) => set);
    const spelled = symbolSets.handles.map((set) =>
      (members.get(set) ?? []).map(({ position }) => position).join(" "),
    );
    const held = new Set(symbolSetOf.rows.map(({ set }) => set));

    keyedSet("SymbolMember", ["set", "position"], symbolMember.rows);
    keyedSet("SymbolSetOf", ["model", "kind"], symbolSetOf.rows);
    assert.strictEqual(
      new Set(spelled).size,
      spelled.length,
      "two symbol sets hold one set of positions",
    );
    assert.isFalse(spelled.includes(""), "a symbol set holds no position");
    assert.deepStrictEqual(
      symbolSets.handles.filter((set) => !held.has(set)),
      [],
      "symbol sets no (model, kind) holds",
    );
    assert.isBelow(symbolMember.rows.length, symbolRowsOf(symbolSetOf, symbolMember).length);
  });

  it("state each include parent's include alternatives as its include set and each set's kinds, in the grammar and as installed: every (parent, kind), and no other", () => {
    // Oracle: the include alternatives of the vocabularies' models (`includeAlternativesOf`), the
    // (include parent, kind) rows an include stands for, against the include grammar's
    // `IncludeSetOf` and `IncludeMember` and the installed ones, each spelled out
    // (`includeRowsOf`). "Include root" and `placesAt` read the kinds as the set's members, so they
    // read the alternatives exactly when these sets do.
    const key = ["parent", "kind"];
    const alternatives = keyedSet(
      "the include alternatives",
      key,
      includeAlternativesOf(vocabularies.flatMap((entry) => entry.models)).map(
        ({ kind, parent }) => ({ kind, parent }),
      ),
    );

    assert.deepStrictEqual(
      keyedSet(
        "the grammar's include sets",
        key,
        includeRowsOf(grammar.include.includeSetOf, grammar.include.includeMember),
      ),
      alternatives,
    );
    assert.deepStrictEqual(
      keyedSet("the include sets", key, includeRowsOf(install.IncludeSetOf, install.IncludeMember)),
      alternatives,
    );
    assert.isBelow(install.IncludeMember.rows.length, alternatives.size);
  });

  it("state AttributeGrammar keyed both (model, name) and (model, slot): each name at its slot with its domain and use, and each (model, slot) one attribute's", () => {
    // Oracle: install.ts's attribute rows of each model's first governor. The laws read
    // `at("slot", m, name)`, `at("domain", m, name)` and `row(m)`, a name's slot and domain and a
    // model's names, so AttributeGrammar must hold those rows keyed by (model, name) and keyed by
    // (model, slot). `keyedSet` refuses a repeated key, so the second also holds (model, slot) to
    // one attribute, the key `Required` and `CountedSlot` state slots by.
    const modelOf = new Map(
      install.AttributeModelOf.rows.map(({ governor, model }) => [governor, model]),
    );
    const firstFamily = new Map<string, string>();
    for (const { governor, model } of install.AttributeModelOf.rows) {
      firstFamily.getOrInsert(model, governor);
    }
    const restated = install.attributeRows.flatMap(({ domain, governor, name, position, use }) => {
      const model = modelOf.get(governor);

      return model !== undefined && firstFamily.get(model) === governor
        ? [{ domain, model, name, slot: position, use }]
        : [];
    });
    const merged = install.AttributeGrammar.rows;

    assert.deepStrictEqual(
      keyedSet("AttributeGrammar by name", ["model", "name"], slotsOf(merged)),
      keyedSet("the first families' rows by name", ["model", "name"], slotsOf(restated)),
    );
    assert.deepStrictEqual(
      keyedSet("AttributeGrammar by slot", ["model", "slot"], merged),
      keyedSet("the first families' rows by slot", ["model", "slot"], restated),
    );
  });

  it("make ContentModelOf total, CountedOf and BarredOf exactly today's Counted but its caps and ChildBarredBy, SharedModelOf exactly the shared families, and Capped exactly Counted's caps", () => {
    const relation = relationNamed("ContentModelOf");
    assert.deepStrictEqual(
      new Set(keyedSet("ContentModelOf", relation.key, relation.rows).keys()),
      new Set(families.map(({ parent }) => tupleText([parent]))),
    );

    // A family whose kinds each name one position has no SharedModelOf row (README, "Closed
    // relations": a law reads its absence through `SharedModelOf.has`), so the relation holds the
    // shared families alone. Oracle: the admission maps spelled out, where an element kind at
    // position 0 is one several positions name.
    const nonElements: ReadonlySet<string> = new Set(install.nonElementKinds);
    const sharedFamilies = new Set(
      admittedOf(grammar.content.contentModelOf, grammar.content.admissionIn)
        .filter(({ child, position }) => position === "0" && !nonElements.has(child))
        .map(({ parent }) => tupleText([parent])),
    );
    assert.isAbove(sharedFamilies.size, 0);
    assert.deepStrictEqual(
      new Set(relationNamed("SharedModelOf").rows.map(({ parent }) => tupleText([parent]))),
      sharedFamilies,
    );

    // Oracle: the content grammar's own rows. A cap (spec reading 130) is a set row of Capped,
    // which a family may hold several of; a count is CountedOf's, its greatest CountedMax's, and
    // the generators state one counted and one barred position per family, which a function of
    // the parent needs.
    const capped = grammar.content.capped.rows;
    const counted = grammar.content.counted.rows;
    assert.isTrue(oncePerFamily(counted));
    assert.isTrue(oncePerFamily(grammar.barredBy.rows));

    assert.deepStrictEqual(
      new Set(
        relationNamed("CountedOf").rows.map(({ min, parent, position }) =>
          tupleText([parent, position, min]),
        ),
      ),
      new Set(
        counted.map(({ min, parent, position }) => tupleText([parent, position, BigInt(min)])),
      ),
    );
    assert.deepStrictEqual(
      new Set(relationNamed("CountedMax").rows.map(({ max, parent }) => tupleText([parent, max]))),
      new Set(
        grammar.content.countedMax.rows.map(({ max, parent }) => tupleText([parent, BigInt(max)])),
      ),
    );
    assert.strictEqual(counted.length, 1);
    assert.deepStrictEqual(
      new Set(
        relationNamed("Capped").rows.map(({ parent, position }) => tupleText([parent, position])),
      ),
      new Set(capped.map(({ parent, position }) => tupleText([parent, position]))),
    );
    // The loose LOM binding's 82 capped (parent, kind) pairs, and a figure's caption (spec reading
    // 252).
    assert.strictEqual(capped.length, 83);
    assert.deepStrictEqual(
      new Set(
        relationNamed("BarredOf").rows.map(({ parent, position, slot }) =>
          tupleText([parent, position, slot]),
        ),
      ),
      new Set(
        grammar.barredBy.rows.map(({ name, parent, position }) =>
          tupleText([
            parent,
            position,
            Option.getOrThrow(grammar.attributes.admission.lookup({ kind: parent, name })).position,
          ]),
        ),
      ),
    );
    assert.strictEqual(grammar.barredBy.rows.length, 1);
  });
});

describe("the MathML relations", () => {
  it("state the arity, head qualifier and cn form samples the laws read", () => {
    const row = (name: string, at: Readonly<Record<string, string | bigint>>) =>
      Arr.findFirst(relationNamed(name).rows, (candidate) =>
        Object.entries(at).every(([field, value]) => candidate[field] === value),
      );

    assert.deepStrictEqual(
      row("MathArity", { kind: "m:selector" }),
      Option.some({ kind: "m:selector", min: 1n }),
    );
    assert.isTrue(Option.isNone(row("MathMax", { kind: "m:selector" })));
    assert.isTrue(Option.isSome(row("HeadQualifier", { head: "m:log", qualifier: "m:logbase" })));
    assert.isTrue(Option.isNone(row("HeadQualifier", { head: "m:sin", qualifier: "m:logbase" })));
    assert.lengthOf(
      relationNamed("CnForm").rows.filter(({ type }) => type === "rational"),
      2,
    );
    assert.deepStrictEqual(
      row("CnParts", { type: "rational" }),
      Option.some({ parts: 2n, type: "rational" }),
    );
    assert.lengthOf(relationNamed("CnPattern").rows, 4 * 35);

    for (const { pattern } of relationNamed("CnPattern").rows) {
      assert.isTrue(String(pattern).startsWith("^(?:") && String(pattern).endsWith(")$"));
    }

    // PostgreSQL's `~` searches, so the payload is tried as a search, with no anchors of the test's own.
    const search = (form: string, base: string, text: string) =>
      new RegExp(String(Option.getOrThrow(row("CnPattern", { base, form }))["pattern"]), "u").test(
        text,
      );
    assert.isTrue(search("hexdouble", "10", "7ff8000000000000"));
    assert.isFalse(search("hexdouble", "10", "7F8000000000000000"));
    assert.isFalse(search("integer", "10", "12abc"));
  });
});

describe("the rosters", () => {
  it("number production's value domains as the ValueDomain roster states them: every domain it names, in the roster's order, and no other", () => {
    // Oracle: the ValueDomain roster as stated (value-domain-roster.ts), the codes an installation
    // holds; a reorder is refused by grizzle generate, so the grammar's roster is the stated one.
    assert.deepStrictEqual([...install.ValueDomain.handles], [...valueDomainRoster]);
  });

  it("hold every generator's handles in the generator's order, and no handle that stands for an absent value", () => {
    assert.deepStrictEqual(handlesOf("NodeKind"), grammar.kinds.nodeKind.handles);
    assert.deepStrictEqual(handlesOf("AttributeName"), grammar.kinds.attributeName.handles);
    assert.deepStrictEqual(handlesOf("TypeName"), grammar.xsi.typeName.handles);
    assert.notInclude(handlesOf("TypeName"), "none");
    assert.deepStrictEqual(handlesOf("BaseType"), grammar.baseTypes.handles);
    assert.deepStrictEqual(handlesOf("Cardinality"), [
      ...grammar.typedCardinalities.handles,
      "record",
    ]);
    assert.deepStrictEqual(handlesOf("ResourceType"), grammar.package.resourceType.handles);
    assert.notInclude(handlesOf("ResourceType"), "none");
    assert.deepStrictEqual(handlesOf("Position"), grammar.content.positions.handles);
    assert.deepStrictEqual(handlesOf("AttributeSlot"), grammar.attributes.positions.handles);
    assert.deepStrictEqual(handlesOf("Governor"), [
      ...grammar.kinds.nodeKind.handles,
      ...governed.keys(),
    ]);
    assert.deepStrictEqual(
      handlesOf("Identity"),
      grammar.attributes.identity.payload[0].roster.handles,
    );
    assert.deepStrictEqual(handlesOf("ContentModel"), grammar.content.models.handles);
    assert.deepStrictEqual(handlesOf("SharedModel"), grammar.content.sharedModels.handles);
    assert.notInclude(handlesOf("SharedModel"), "none");
    // Spec reading 118's include model is a model of its own, and names the ignored elements'
    // wildcards at two positions; spec reading 22's template branches, restated without a
    // `qti-template-constraint`, are one more.
    assert.lengthOf(handlesOf("SharedModel"), 25);
    assert.lengthOf(handlesOf("ContentModel"), 114);
  });

  it("list the handle sets the laws test membership in, each its generator's", () => {
    const isElement = new Set(grammar.kinds.isElement.rows.map(({ kind }) => kind));

    assert.deepStrictEqual(
      new Set(install.nonElementKinds),
      new Set(grammar.kinds.nodeKind.handles.filter((kind) => !isElement.has(kind))),
    );
    assert.deepStrictEqual(
      new Set(install.interactionKinds),
      new Set(grammar.kinds.interaction.rows.map(({ kind }) => kind)),
    );
    assert.lengthOf(install.interactionKinds, 22);
    assert.deepStrictEqual(
      new Set(install.openElementClasses),
      new Set(Object.values(foreignKinds)),
    );
    assert.deepStrictEqual(
      new Set(install.documentTypes),
      new Set(grammar.package.rootOfType.rows.map(({ type }) => type)),
    );
  });
});
