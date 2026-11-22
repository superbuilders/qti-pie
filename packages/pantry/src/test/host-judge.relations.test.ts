/**
 * The laws the host judge judges (`judgedLaws` of `#pantry/test/host-judge.ts`), and each
 * containment a test reads from one relation (`containmentsOf`), are named as the refusal names an
 * outcome's (`schemaLawNameOf` of `#pantry/import/refusal.ts`, by grizzle's `sameLaw`), so a test
 * that names the laws a package's rows break names each by its law, never by its shape. A law whose
 * sides' selections were left out was no law `sameLaw` knows, so every containment and key over a
 * selection went unnamed (6caa20ef).
 *
 * And both host judges, this one and the genetic search's (`evaluatedLaws` of
 * `#pantry/test/gen/genetic/host-laws.ts`), read every containment and key `Qti` states over the
 * relations whose rows the host holds, whatever kind of statement states it, so a law never drops
 * out of either judge with its statement's kind: an `alternatives`, which holds no side, states its
 * containments only as its laws.
 *
 * And the structure readers of `#pantry/test/predicates.ts` decode no statement over a derived
 * relation, a rule over a query, whose query only the database evaluates, and the oracle's key
 * copies (`copiesOf` of `#pantry/test/key-copies.ts`) skip it (`readsDerived`), since a query
 * stores no text.
 */
import {
  check,
  contained,
  derived,
  key,
  on,
  query,
  relation,
  schema,
  select,
  str,
  v,
} from "@bjornpagen/grizzle";
import type { Law } from "@bjornpagen/grizzle";
import { assert, describe, it } from "@effect/vitest";
import { Formatter, Option, Result, Schema } from "effect";
import { Qti } from "#pantry/qti/schema.ts";
import { evaluatedLaws } from "#pantry/test/gen/genetic/host-laws.ts";
import { heldRelations, judgedLaws } from "#pantry/test/host-judge.ts";
import { containmentsOf } from "#pantry/test/judged-laws.ts";
import { copiesOf } from "#pantry/test/key-copies.ts";
import { readsDerived, SideSchema, StatementSchema } from "#pantry/test/predicates.ts";
import { schemaLawNameOf, statedLaws } from "#pantry/test/law-namer.ts";

/**
 * The timeout, in milliseconds, of this file's tests that compile Qti's law model: a hang guard.
 */
const testTimeoutMs = 300_000;

/**
 * A two-level scratch schema in grizzle's own shape for rules over queries (README, "Rules over
 * queries"): a stored level of four relations, and a level over it whose derived relation joins
 * two of them. Each level states a check, a containment into a relation, one from a selection and a
 * key, the query level's each over the query, the stored level's the control.
 */
const twoLevel = (() => {
  const Path = str.regex("^[a-z]{1,8}$");
  const Resource = relation("Resource", { id: Path }, ["id"]);
  const ResourceHref = relation("ResourceHref", { path: Path, resource: Path }, ["resource"]);
  const ResourceTyped = relation("ResourceTyped", { resource: Path, type: Path }, ["resource"]);
  const Catalog = relation("Catalog", { path: Path, resource: Path, type: Path }, ["resource"]);
  const stored = {
    check: check("Catalog_typed", Catalog, (c) => c.ne(c.type, "x")),
    into: contained(on(ResourceHref, "resource"), on(Resource, "id")),
    key: key(on(Catalog, "path")),
    selected: contained(
      on(
        select(ResourceTyped, (t) => t.eq(t.type, "item")),
        "resource",
      ),
      on(Resource, "id"),
    ),
  };
  const Content = schema(
    "Content",
    [Catalog, Resource, ResourceHref, ResourceTyped],
    [stored.check, stored.into, stored.key, stored.selected],
  );
  const TypedHref = derived(
    "TypedHref",
    query(Content).rule((r) => {
      const { path, resource } = v(ResourceHref, "href");
      const { type } = v(ResourceTyped, "typed");

      return r
        .match(ResourceHref, { path, resource })
        .match(ResourceTyped, { resource, type })
        .find({ path, resource, type });
    }),
  );
  const queried = {
    check: check("Typed_href", TypedHref, (t) => t.ne(t.type, "x")),
    into: contained(
      on(Catalog, "resource", "path", "type"),
      on(TypedHref, "resource", "path", "type"),
    ),
    key: key(on(TypedHref, "path")),
    selected: contained(
      on(
        select(TypedHref, (t) => t.eq(t.type, "item")),
        "resource",
      ),
      on(Resource, "id"),
    ),
  };

  return {
    level: schema.extend(
      [Content],
      "Packaged",
      [TypedHref],
      [queried.check, queried.into, queried.key, queried.selected],
    ),
    queried,
    stored,
  };
})();

/**
 * Whether the host judges a containment or a key `Qti` states: every side of it reads a relation
 * whose rows the host holds (`heldRelations`). A rule over a query is the database's alone.
 *
 * @param law - The law, as grizzle's `lawsOf` lists it.
 * @returns Whether the host judges it.
 */
const judged = (law: Law): boolean =>
  law.kind === "contained"
    ? heldRelations.has(law.from.relation) && heldRelations.has(law.to.relation)
    : law.kind === "key" && heldRelations.has(law.side.relation);

describe("the host judge's laws", () => {
  it(
    "names every law it judges as a refusal names an outcome's law",
    () => {
      // Oracle: the refusal's own naming, grizzle's sameLaw against the laws lawsOf states. Bound:
      // every law of Qti the host judges.
      const unnamed = judgedLaws(Qti).flatMap(({ law }) =>
        Option.isNone(schemaLawNameOf(law)) ? [Formatter.format(law)] : [],
      );

      assert.deepStrictEqual(unnamed, [], "laws the refusal names none of");
    },
    testTimeoutMs,
  );

  it(
    "names every containment a test reads from a relation as a refusal names an outcome's law",
    () => {
      // Oracle: the refusal's own naming, as above. Bound: every containment Qti states, read from
      // each of its relations.
      const unnamed = Object.keys(Qti.relations).flatMap((from) =>
        containmentsOf(Qti, from).flatMap(({ law }) =>
          Option.isNone(schemaLawNameOf(law)) ? [Formatter.format(law)] : [],
        ),
      );

      assert.deepStrictEqual(unnamed, [], "containments the refusal names none of");
    },
    testTimeoutMs,
  );

  it(
    "judges every containment and key Qti states, in both host judges, whatever statement states it",
    () => {
      // Oracle: the laws Qti states, as the refusal names them (`statedLaws`, from grizzle's
      // `lawsOf`). Bound: every containment and key of every statement of Qti, an alternatives'
      // among them.
      const stated = statedLaws().flatMap(([law]) => (judged(law) ? [Formatter.format(law)] : []));
      const judges = [
        ["the host judge", judgedLaws(Qti).map(({ law }) => law)],
        ["the genetic search", evaluatedLaws],
      ] as const;

      for (const [label, laws] of judges) {
        const held = new Set(laws.map((law) => Formatter.format(law)));

        assert.deepStrictEqual(
          stated.filter((law) => !held.has(law)),
          [],
          `laws Qti states that ${label} judges not`,
        );
      }
    },
    testTimeoutMs,
  );

  it("decodes no statement over a derived relation, a check, a containment either way or a key", () => {
    // Oracle: grizzle's own two-level shape (README, "Rules over queries"): a rule over a derived
    // relation is the database's alone, so the host reads no side over one and no statement with
    // such a side. Bound: a rule of each kind over the query, a selection of it among them, each
    // beside its control over stored relations, which the host reads.
    const { level, queried, stored } = twoLevel;
    const decodes = Schema.is(StatementSchema);
    const side = Schema.is(SideSchema);

    assert.deepStrictEqual(
      [
        decodes(stored.check),
        decodes(stored.into),
        side(stored.into.left),
        side(stored.into.right),
        side(stored.key.side),
        decodes(stored.selected),
        side(stored.selected.left),
      ],
      [true, true, true, true, true, true, true],
      "the stored level's statements, which the host reads",
    );
    assert.deepStrictEqual(
      [
        decodes(queried.check),
        decodes(queried.into),
        side(queried.into.left),
        side(queried.into.right),
        side(queried.key.side),
        decodes(queried.selected),
        side(queried.selected.left),
        side(queried.selected.right),
      ],
      [false, false, true, false, false, false, false, true],
      "the query level's statements, which the host leaves to the database",
    );
    assert.deepStrictEqual(
      [...Object.values(stored), ...Object.values(queried)].map((statement) =>
        readsDerived(statement),
      ),
      [false, false, false, false, true, true, true, true],
      "the statements that read the query",
    );
    assert.deepStrictEqual(
      copiesOf(level.statements).flatMap((copy) =>
        Result.isFailure(copy) ? [Formatter.format(copy.failure)] : [],
      ),
      [],
      "statements the oracle's key copies cannot read",
    );
  });
});
