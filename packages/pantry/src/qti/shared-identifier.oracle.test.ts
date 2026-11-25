/**
 * Items of one package that share an identifier (SPEC-AUDIT SV-KEY-01): QTI types an item's
 * identifier `Identifier`, never `UniqueIdentifier` (information model §4.1.1, info:6346; §7.43,
 * info:83233, "A unique identifier is simply an identifier that is unique within the scope of the
 * instance"), and states no scope beyond its document, so a package may hold two items of one
 * identifier; 1EdTech's own `rtest01` writes `RTEST-01-SET-01` on its three set items. One test's
 * items are distinct by the base rule alone, an item ref's identifier its item's (info:6346) and
 * unique within the test (info:7241), which a test's own laws hold. The schema once keyed an item
 * by `(package, identifier)`, "Item key", and refused such a package; an item is now its document,
 * `(package, path)`.
 *
 * Oracle: the specification's text above, and a second implementation, the law oracle
 * (`#pantry/test/oracle.ts` `judge`), against the laws the import's rows break on the host
 * (`#pantry/test/gen/genetic/judge.ts` `judgeOne`): each case breaks no law on either side, and no
 * statement of `Qti` keys an item by its identifier.
 *
 * Bound: two or three items, each its own resource, under one identifier written as is, padded
 * before or after (one value collapsed), or under distinct identifiers: 8 packages, exhausted.
 */
import * as NodeServices from "@effect/platform-node/NodeServices";
import { assert, describe, it, layer } from "@effect/vitest";
import { exhaust } from "@bjornpagen/testing/explore";
import { requiredInSpace } from "@bjornpagen/testing/features";
import { int } from "@bjornpagen/testing/gen";
import { searched } from "@bjornpagen/testing/vitest";
import { Duration, Effect, Option } from "effect";
import { grammar } from "#pantry/grammar/install.ts";
import { ObjectIdentifier } from "#pantry/qti/queries.ts";
import { Qti } from "#pantry/qti/schema.ts";
import type { PackageEntries } from "#pantry/test/gen/every-relation.ts";
import { genomeOf } from "#pantry/test/gen/genetic/genome.ts";
import { judgeOne, shownDisagreement } from "#pantry/test/gen/genetic/judge.ts";
import { lawsOf } from "#pantry/test/oracle.ts";
import { scratchDirectory } from "#pantry/test/scratch.ts";

/**
 * The oracle's law tables over the composed grammar.
 */
const laws = lawsOf(grammar);

/**
 * The namespace of every item of the box.
 */
const asi = "http://www.imsglobal.org/xsd/imsqtiasi_v3p0";

/**
 * How a case writes its items' identifiers: one identifier as is, padded before, padded after, or
 * each its own.
 */
const spellings = ["same", "padded before", "padded after", "distinct"] as const;

/**
 * One case of the box: how many items, and how each writes its identifier.
 */
interface SharedCase {
  readonly items: 2 | 3;
  readonly spelling: (typeof spellings)[number];
}

/**
 * Every case of the box.
 */
const cases: readonly SharedCase[] = ([2, 3] as const).flatMap((items) =>
  spellings.map((spelling) => ({ items, spelling })),
);

/**
 * Write a case as text.
 *
 * @param input - The case.
 * @returns Its text.
 */
const literalOf = (input: SharedCase): string => `${String(input.items)} items, ${input.spelling}`;

/**
 * The identifier the item at an index writes under a case.
 *
 * @param input - The case.
 * @param at - The item's index.
 * @returns Its identifier as written.
 */
const identifierOf = (input: SharedCase, at: number): string => {
  switch (input.spelling) {
    case "same": {
      return "shared";
    }

    case "padded before": {
      return at === 0 ? "shared" : " shared";
    }

    case "padded after": {
      return at === 0 ? "shared" : "shared ";
    }

    case "distinct": {
      return `item${String(at)}`;
    }

    default: {
      return input.spelling satisfies never;
    }
  }
};

/**
 * Write a case's package: each item a resource of its own file, `items/i<n>.xml`.
 *
 * @param input - The case.
 * @returns Its entries.
 */
const packageOf = (input: SharedCase): PackageEntries => {
  const indices = Array.from({ length: input.items }, (_, at) => at);
  const resources = indices
    .map(
      (at) =>
        `<resource identifier="R${String(at)}" type="imsqti_item_xmlv3p0" href="items/i${String(at)}.xml"><file href="items/i${String(at)}.xml"/></resource>`,
    )
    .join("");
  const manifest = `<?xml version="1.0" encoding="UTF-8"?>
<manifest xmlns="http://www.imsglobal.org/xsd/qti/qtiv3p0/imscp_v1p1" identifier="M"><metadata><schema>QTI Package</schema><schemaversion>3.0.1</schemaversion></metadata><organizations/><resources>${resources}</resources></manifest>`;
  const text = new TextEncoder();

  return new Map([
    ["imsmanifest.xml", text.encode(manifest)],
    ...indices.map(
      (at) =>
        [
          `items/i${String(at)}.xml`,
          text.encode(`<?xml version="1.0" encoding="UTF-8"?>
<qti-assessment-item xmlns="${asi}" identifier="${identifierOf(input, at)}" title="I${String(at)}" adaptive="false" time-dependent="false"><qti-outcome-declaration identifier="SCORE" cardinality="single" base-type="float"/></qti-assessment-item>`),
        ] as const,
    ),
  ]);
};

/**
 * A situation the box must reach.
 */
type Situation = "three items share one identifier" | "two share it once collapsed";

describe("the schema's keys over items", () => {
  it("key no item by its identifier: no key of Qti is over ObjectIdentifier", () => {
    // Oracle: info:6346 and info:83233, which make an item's identifier unique nowhere. Bound:
    // every statement of `Qti`.
    for (const statement of Qti.statements) {
      if (statement.kind === "key") {
        assert.notStrictEqual<unknown>(
          statement.side.source,
          ObjectIdentifier,
          "Item key is stated",
        );
      }
    }
  });
});

layer(NodeServices.layer, { excludeTestServices: true })(
  "items that share an identifier",
  (scoped) => {
    scoped.effect("are admitted, on the import's rows as in the law oracle", (ctx) =>
      searched(
        ctx,
        Effect.gen(function* sharedIdentifierRuns() {
          const directory = yield* scratchDirectory("shared-identifier-");
          const bench = { directory, grammar, laws };

          return yield* exhaust(
            {
              box: "two or three items of one package, under one identifier as is or padded, or each its own",
              caseHang: Duration.minutes(5),
              concurrency: 1,
              coverage: requiredInSpace<Situation>([
                "three items share one identifier",
                "two share it once collapsed",
              ]),
              generator: int(0, cases.length - 1),
              literal: (at) =>
                Option.match(Option.fromUndefinedOr(cases[at]), {
                  onNone: () => String(at),
                  onSome: literalOf,
                }),
              oracle: {
                kind: "specification",
                name: "QTI 3.0 information model §4.1.1 (info:6346) and §7.43 (info:83233)",
              },
              suite: "pantry/shared-identifier",
            },
            (at, c) =>
              Effect.gen(function* sharedIdentifierCase() {
                const input = cases[at];
                assert.isDefined(input, `no case ${String(at)}`);
                if (input === undefined) {
                  return;
                }

                if (input.items === 3 && input.spelling === "same") {
                  c.note("three items share one identifier");
                }

                if (input.spelling === "padded before" || input.spelling === "padded after") {
                  c.note("two share it once collapsed");
                }

                const judged = yield* judgeOne(yield* genomeOf(packageOf(input)), bench, at);

                assert.deepStrictEqual(
                  judged.disagreements.map(shownDisagreement),
                  [],
                  literalOf(input),
                );
                assert.deepStrictEqual(
                  judged.summary,
                  { import: "built ", oracle: "laws " },
                  literalOf(input),
                );
              }),
          );
        }).pipe(Effect.scoped),
      ),
    );
  },
);
