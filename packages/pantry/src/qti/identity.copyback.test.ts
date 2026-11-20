/**
 * The copy-backs restated over a wider keyed selection (LP-3, the one-way rule), checked against
 * the containments into the narrower selections they replace, over every attribute row of the kind
 * each copies.
 *
 * The overlay's way back to its attribute was a containment into a selection of
 * `Attribute` with a key of its own over the element, which a wider key already implied: an
 * element holds at most one ID-typed attribute (`idAttributes` of `#pantry/qti/identity.ts`). Each
 * is now stated into a target whose conditions are the wider selection's and whose key is the
 * wider selection's, the target fixing what the narrower
 * selection read beyond it to a value outside its terms (grizzle's fixed target, `#fixedTarget` of
 * `packages/engine/src/laws/model/plan.ts:1526-1582` at `698880ac`), each side read at the
 * element, `(package, path, start)`:
 *
 * - **TableHeader:** `TableHeader(e) ⊆ headerIds(e)`, each `th`'s `id`, is now `TableHeader(e) ⊆
 *   thIdAttributes(e)`, held by `idAttributes`' key.
 *
 * A containment from a row at an element holds where some attribute at that element is in its
 * target, so the two laws are one exactly where the narrower selection holds an attribute row if
 * and only if the restated target does. No fixed field names the attribute: the kind's one ID-typed
 * attribute is the copied one, which this search proves. A row of another kind fails both laws, the
 * old by its kind and the new by the kind its target fixes, so the box is the kind's rows: each
 * type `GoverningOf` gives the kind, each name the governor's attribute model admits, the
 * manifest's path and another document's. Neither selection reads the lexical form, which AL1
 * holds to the attribute's domain (spec readings 152 and 156). The restated laws are read from the
 * schema's own statements (`#pantry/test/judged-laws.ts` `containmentsOf`), each target's
 * selection, its fixed fields included, evaluated as the statement holds it; the replaced ones are
 * restated over plain rows.
 */
import type { Law } from "@bjornpagen/grizzle";
import { assert, describe, it } from "@effect/vitest";
import { exhaust } from "@bjornpagen/testing/explore";
import { requiredInSpace } from "@bjornpagen/testing/features";
import { element } from "@bjornpagen/testing/gen";
import { searched } from "@bjornpagen/testing/vitest";
import { Array as Arr, Duration, Effect, Option } from "effect";
import { AttributeGrammar, AttributeModelOf, GoverningOf } from "#pantry/grammar/install.ts";
import { Qti } from "#pantry/qti/schema.ts";
import { manifestPath } from "#pantry/vocab/terms/package.ts";
import { containmentsOf } from "#pantry/test/judged-laws.ts";
import { manifestAttribute } from "#pantry/test/host-judge.ts";
import type { Containment } from "#pantry/test/host-judge.ts";
import { searchWidth } from "#pantry/test/settings.ts";

/**
 * One attribute row of the box, as both laws read it: its element's kind, governing type and
 * governor, its document's path, its name, and its lexical form.
 */
type AttributeCase = Readonly<{
  governor: string;
  governs: string;
  kind: string;
  lexical: string;
  name: string;
  path: string;
}>;

/**
 * A situation the box must reach: the copied attribute and another attribute of the kind.
 */
type Situation = "another attribute of the kind" | "the copied attribute";

/**
 * One restated copy-back: the relation it copies back from, the kind and name of the attribute it
 * copies, the selection it replaced restated over a plain row, and the situations its box reaches.
 */
interface CopyBack {
  readonly from: "TableHeader";
  readonly kind: "th";
  readonly name: "id" | "identifier";
  readonly replaced: (row: AttributeCase) => boolean;
  readonly situations: Arr.NonEmptyReadonlyArray<Situation>;
}

/**
 * The copy-back: `headerIds` of `#pantry/qti/html.ts` is a `th`'s `id`, in any document, whatever
 * its value: AL1 holds the value to its domain, and the selection reads none. The manifest's and
 * the resources' `identifier`s are no copies, but their attributes' `value` (`manifestIdentifiers`
 * and `resourceIdentifiers` of `#pantry/qti/overlay-queries/package.ts`), so they have no
 * copy-back.
 */
const copyBacks: readonly CopyBack[] = [
  {
    from: "TableHeader",
    kind: "th",
    name: "id",
    replaced: (row) => row.kind === "th" && row.name === "id",
    situations: ["the copied attribute", "another attribute of the kind"],
  },
];

/**
 * The lexical form every row of the box writes, an NCName with whitespace around it: neither
 * selection reads it.
 */
const lexical = " h1 ";

/**
 * The paths a row's document is at: the manifest's, and another document's.
 */
const paths = [manifestPath, "item.xml"] as const;

/**
 * Every attribute row of one kind the grammar admits, at each of {@link paths}: each `GoverningOf`
 * row of the kind, each name its governor's attribute model admits (`AttributeModelOf`,
 * `AttributeGrammar`).
 *
 * @param kind - The element's kind.
 * @returns The rows.
 */
const rowsOf = (kind: string): readonly AttributeCase[] =>
  GoverningOf.rows
    .filter((governing) => governing.kind === kind)
    .flatMap(({ governor, governs }) =>
      AttributeModelOf.rows
        .filter((model) => model.governor === governor)
        .flatMap(({ model }) => AttributeGrammar.rows.filter((slot) => slot.model === model))
        .flatMap(({ name }) =>
          paths.map((path) => ({ governor, governs, kind, lexical, name, path })),
        ),
    );

/**
 * Read the restated copy-back from the schema: its one containment from the relation into
 * `Attribute`, whose source pairs the element's key `(package, path, start)` with the attribute's
 * alone, so the law holds at an element exactly where some attribute row there is in its target's
 * selection, the fields it fixes included.
 *
 * @param from - The relation it copies back from.
 * @returns The containment.
 */
const restatedOf = (from: CopyBack["from"]): Containment => {
  const laws = containmentsOf(Qti, from).filter(({ to }) => to === "Attribute");
  assert.lengthOf(laws, 1, `${from}: its containments into Attribute`);

  const law = Option.getOrThrow(Arr.head(laws));
  assert.deepStrictEqual(
    Arr.zip(law.fromFields, law.toFields),
    [
      ["package", "package"],
      ["path", "path"],
      ["start", "start"],
    ],
    `${from}: the fields its source pairs`,
  );

  return law;
};

/**
 * Read the fields a containment's target fixes to a value, from its law as grizzle names it: each
 * conjunct of the target's selection that equates a field with a literal, in grizzle's canonical
 * form, the field first and the literal second (README, "Errors and outcomes").
 *
 * @param law - The containment's law.
 * @returns Each fixed field's value, by the field.
 */
const fixedOf = (law: Law): ReadonlyMap<string, unknown> =>
  new Map(
    law.kind === "contained"
      ? law.to.selection.conjuncts.flatMap((conjunct) =>
          conjunct.kind === "compare" &&
          conjunct.op === "eq" &&
          conjunct.left.kind === "field" &&
          conjunct.right.kind === "literal"
            ? [[conjunct.left.field, conjunct.right.value] as const]
            : [],
        )
      : [],
  );

/**
 * Name the situations one row reaches under a copy-back.
 *
 * @param copyBack - The copy-back.
 * @param row - The row.
 * @returns Its situations.
 */
const situationsOf = (copyBack: CopyBack, row: AttributeCase): readonly Situation[] => {
  const copied = row.name === copyBack.name;
  const reached: readonly (readonly [Situation, boolean])[] = [
    ["the copied attribute", copyBack.replaced(row)],
    ["another attribute of the kind", !copied],
  ];

  return reached.flatMap(([situation, holds]) => (holds ? [situation] : []));
};

/**
 * The timeout, in milliseconds, of each copy-back's test here: a hang guard.
 */
const testTimeoutMs = 120_000;

describe("qti/identity.ts, the copy-backs restated over the ID-typed attributes", () => {
  for (const copyBack of copyBacks) {
    it.effect(
      `holds ${copyBack.from} back to its ${copyBack.kind}'s ${copyBack.name} exactly as the containment into the narrower selection did`,
      (ctx) => {
        const law = restatedOf(copyBack.from);
        assert.strictEqual(
          fixedOf(law.law).get("kind"),
          copyBack.kind,
          `${copyBack.from}: the kind its target fixes`,
        );

        // Oracle: a specification, the containment into the narrower selection the restated law
        // replaced, restated over plain rows.
        // Bound: every attribute row of the copied kind the grammar admits, at the manifest's path
        // and another.
        return Arr.match(rowsOf(copyBack.kind), {
          onEmpty: () =>
            Effect.die(
              new Error(
                `The grammar admits no attribute of ${copyBack.kind}, so the search has no row to judge ${copyBack.from}'s copy-back by. Check the GoverningOf, AttributeModelOf and AttributeGrammar rows of the kind.`,
              ),
            ),
          onNonEmpty: (rows) =>
            searched(
              ctx,
              exhaust(
                {
                  box: `every attribute row of ${copyBack.kind} the grammar admits, at the manifest's path and another`,
                  caseHang: Duration.seconds(5),
                  concurrency: searchWidth,
                  coverage: requiredInSpace<Situation>(copyBack.situations),
                  generator: element<AttributeCase>(rows),
                  literal: (row) => JSON.stringify(row),
                  oracle: {
                    kind: "specification",
                    name: `the containment of ${copyBack.from} in its ${copyBack.kind}'s ${copyBack.name}`,
                  },
                  suite: `pantry/qti/identity-copy-back-${copyBack.from}`,
                },
                (row, c) =>
                  Effect.sync(() => {
                    c.noteAll(situationsOf(copyBack, row));

                    assert.strictEqual(
                      law.targeted({ ...manifestAttribute, ...row }),
                      copyBack.replaced(row),
                      JSON.stringify(row),
                    );
                  }),
              ),
            ),
        });
      },
      testTimeoutMs,
    );
  }
});
