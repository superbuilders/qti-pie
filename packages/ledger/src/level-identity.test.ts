/**
 * A level keeps each relation's identity through `schema.extend([base], …)`: a derived relation
 * declared over a level above pantry's QtiMedia is a relation of every level above it, so a query
 * over the top level matches it. Before grizzle's LEVELDAG, the single-base form widened the
 * level's type, and such a match was refused at the type ("the relation is not in this query's
 * schema"); metis's METIS-ASSIGNMENT reproduced it in these lines, kept here so the check stays
 * proven. Its proof is the typecheck; the test builds the levels and the query at run time.
 */
import { derived, natural, query, relation, schema, v } from "@bjornpagen/grizzle";
import { assert, describe, it } from "@effect/vitest";
import { QtiMedia } from "@qti-pie/pantry/qti/media.ts";

const Thing = relation("ZzThing", { number: natural }, ["number"]);

const Base = schema.extend([QtiMedia], "ZzBase", [Thing], []);

const Seen = derived(
  "ZzSeen",
  query(Base).rule((r) => {
    const { number } = v(Thing, "t");

    return r.match(Thing, { number }).find({ number });
  }),
);

const Top = schema.extend([Base], "ZzTop", [Seen], []);

describe("a derived relation over a level above QtiMedia", () => {
  it("is matched by a query over the level above it", () => {
    const readsSeen = query(Top).rule((r) => {
      const { number } = v(Seen, "s");

      return r.match(Seen, { number }).find({ number });
    });

    assert.isDefined(readsSeen);
  });
});
