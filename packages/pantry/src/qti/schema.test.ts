/**
 * The composition of `Qti`, `Author` and `AuthorApp` against the W5 amendment's §C table, the
 * specification of which module exports which law array and which relations: each law array is in
 * the schema once, nothing else is, no relation is `mutable`, and the author role holds and writes
 * every stored relation.
 */
import { assert, describe, it } from "@effect/vitest";
import type { Statement } from "@bjornpagen/grizzle";
import { Predicate } from "effect";
import * as install from "#pantry/grammar/install.ts";
import * as attributes from "#pantry/qti/attributes.ts";
import { attributeLaws } from "#pantry/qti/attributes.ts";
import * as catalog from "#pantry/qti/catalog.ts";
import { catalogLaws } from "#pantry/qti/catalog.ts";
import * as chardata from "#pantry/qti/chardata.ts";
import { chardataLaws } from "#pantry/qti/chardata.ts";
import * as dataSsml from "#pantry/qti/data-ssml.ts";
import { dataSsmlLaws } from "#pantry/qti/data-ssml.ts";
import * as declarations from "#pantry/qti/declarations.ts";
import * as expressionTypes from "#pantry/qti/expression-types.ts";
import * as expressions from "#pantry/qti/expressions.ts";
import { expressionLaws } from "#pantry/qti/expressions.ts";
import * as html from "#pantry/qti/html.ts";
import { htmlLaws } from "#pantry/qti/html.ts";
import * as identity from "#pantry/qti/identity.ts";
import { identityLaws } from "#pantry/qti/identity.ts";
import * as interactions from "#pantry/qti/interactions.ts";
import { interactionLaws } from "#pantry/qti/interactions.ts";
import * as mapping from "#pantry/qti/mapping.ts";
import * as metadata from "#pantry/qti/metadata.ts";
import * as node from "#pantry/qti/node.ts";
import { nodeLaws } from "#pantry/qti/node.ts";
import * as mathml from "#pantry/qti/mathml.ts";
import { mathmlLaws } from "#pantry/qti/mathml.ts";
import * as operators from "#pantry/qti/operators.ts";
import { operatorLaws } from "#pantry/qti/operators.ts";
import * as pkg from "#pantry/qti/package.ts";
import { packageLaws } from "#pantry/qti/package.ts";
import { queryLawsByName } from "#pantry/qti/queries.ts";
import { Qti } from "#pantry/qti/schema.ts";
import { AuthorApp } from "#pantry/qti/logins.ts";
import { Author } from "#pantry/qti/roles.ts";
import * as tests from "#pantry/qti/tests.ts";
import { testLaws } from "#pantry/qti/tests.ts";

/**
 * Each §C module composed so far, with the law array it exports, by the name §C gives it.
 */
const composedLaws: readonly (readonly [string, readonly Statement[]])[] = [
  ["src/qti/node.ts nodeLaws", nodeLaws],
  ["src/qti/chardata.ts chardataLaws", chardataLaws],
  ["src/qti/attributes.ts attributeLaws", attributeLaws],
  ["src/qti/package.ts packageLaws", packageLaws],
  ["src/qti/package.ts PackageUnit, the unit every package's rows sit under", [pkg.PackageUnit]],
  ["src/qti/identity.ts identityLaws", identityLaws],
  ["src/qti/tests.ts testLaws", testLaws],
  ["src/qti/interactions.ts interactionLaws", interactionLaws],
  ["src/qti/expressions.ts expressionLaws", expressionLaws],
  ["src/qti/html.ts htmlLaws", htmlLaws],
  ["src/qti/operators.ts operatorLaws", operatorLaws],
  ["src/qti/mathml.ts mathmlLaws", mathmlLaws],
  ["src/qti/catalog.ts catalogLaws", catalogLaws],
  ["src/qti/data-ssml.ts dataSsmlLaws", dataSsmlLaws],
  [
    "src/qti/queries.ts queryLawsByName, the rules over the queries",
    queryLawsByName.flatMap((byName: Readonly<Partial<Record<string, readonly Statement[]>>>) =>
      Object.values(byName).flatMap((statements) => statements ?? []),
    ),
  ],
];

/**
 * Each §C module composed so far, as its namespace: every roster, closed relation and relation it
 * exports is one of `Qti`'s members.
 */
const composedModules = [
  ["src/grammar/install.ts", install],
  ["src/qti/node.ts", node],
  ["src/qti/chardata.ts", chardata],
  ["src/qti/attributes.ts", attributes],
  ["src/qti/package.ts", pkg],
  ["src/qti/identity.ts", identity],
  ["src/qti/declarations.ts", declarations],
  ["src/qti/tests.ts", tests],
  ["src/qti/mapping.ts", mapping],
  ["src/qti/interactions.ts", interactions],
  ["src/qti/metadata.ts", metadata],
  ["src/qti/expressions.ts", expressions],
  ["src/qti/expression-types.ts", expressionTypes],
  ["src/qti/html.ts", html],
  ["src/qti/operators.ts", operators],
  ["src/qti/mathml.ts", mathml],
  ["src/qti/catalog.ts", catalog],
  ["src/qti/data-ssml.ts", dataSsml],
] as const;

/**
 * The kinds of a schema member's value: a stored relation, a roster, a closed relation, and a
 * derived one, a query of the level of queries (`#pantry/qti/queries.ts`).
 */
const memberKinds: ReadonlySet<unknown> = new Set([
  "closed",
  "closedRelation",
  "derived",
  "relation",
]);

/**
 * Whether the author role holds a member of `Qti` whole: a stored relation, a roster, and a stored
 * derived relation, a table grizzle keeps equal to its definition; never a closed relation, whose
 * rows the role reads inline, nor a derived one that stores nothing, which a role reads through
 * the tables its definition reads (grizzle's README, "Derived tables").
 *
 * @param member - A member of `Qti`.
 * @returns Whether the role holds it whole.
 */
const heldWhole = (member: (typeof Qti.relations)[keyof typeof Qti.relations]): boolean =>
  member.kind === "derived" ? member.storage === "stored" : member.kind !== "closedRelation";

describe("qti/schema.ts, composed", () => {
  it("holds every roster, closed relation and relation each composed module exports, under its own name", () => {
    for (const [module, exports] of composedModules) {
      for (const [name, value] of Object.entries(exports)) {
        if (Predicate.hasProperty(value, "kind") && memberKinds.has(value.kind)) {
          const member: unknown = Object.getOwnPropertyDescriptor(Qti.relations, name)?.value;

          assert.isTrue(
            Predicate.hasProperty(value, "name") && value.name === name,
            `${module} ${name}`,
          );
          assert.strictEqual(member, value, `${module} exports ${name}, which Qti does not hold`);
        }
      }
    }
  });

  it("holds each module's law array once, each statement once, and no other statement", () => {
    const seen = new Map<Statement, string>();

    for (const [module, laws] of composedLaws) {
      for (const law of laws) {
        assert.isFalse(seen.has(law), `${module} repeats a statement of ${seen.get(law)}`);
        seen.set(law, module);
      }
    }

    for (const law of Qti.statements) {
      assert.isTrue(seen.has(law), `Qti holds a statement no composed module exports: ${law.kind}`);
    }

    assert.strictEqual(Qti.statements.length, seen.size);
  });

  it("declares no relation mutable", () => {
    const statements: readonly Statement[] = Qti.statements;

    assert.deepStrictEqual(
      statements.filter((statement) => statement.kind === "mutable"),
      [],
    );
  });
});

describe("qti/roles.ts, the author role", () => {
  it("holds every stored relation, roster and stored derived relation of Qti whole, and no closed relation or derived one that stores nothing", () => {
    for (const [name, member] of Object.entries(Qti.relations)) {
      const entry: unknown = Object.getOwnPropertyDescriptor(Author.relations, name)?.value;

      assert.strictEqual(entry, heldWhole(member) ? member : undefined, name);
    }

    assert.sameMembers(
      Object.keys(Author.relations),
      Object.entries(Qti.relations).flatMap(([name, member]) => (heldWhole(member) ? [name] : [])),
    );
  });

  it("writes exactly Qti's stored relations", () => {
    const stored = Object.entries(Qti.relations).flatMap(([name, member]) =>
      member.kind === "relation" ? [name] : [],
    );

    assert.sameMembers([...Author.insert, ...Author.write], stored);
  });
});

describe("qti/logins.ts, the author application", () => {
  it("opens the author role, and only it", () => {
    assert.deepStrictEqual(Object.keys(AuthorApp.roles), ["author"]);
    assert.strictEqual(AuthorApp.roles.author.role, Author);
  });
});
