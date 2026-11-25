/**
 * A `lax` or `strict` wildcard admits a globally declared element as its kind only where a schema
 * set its parent's documents are assessed against declares it (spec reading 81; XML Schema 1.0 Part
 * 1, §3.10.4, Item Valid (Wildcard), clauses 1 and 2, and §3.3.4, Schema-Validity Assessment
 * (Element), clause 1.1.1.3.2: the element is found by its top-level declaration in the schema the
 * document is assessed against, and only there).
 *
 * Oracle: a second implementation of the schema sets. The test's own reading of the pinned XSDs
 * (`schemaSetOf`, `#pantry/test/xsd-catalog.ts`) takes each document root's XSD and every XSD it
 * imports, includes or redefines, transitively, beside the grammar's hand-stated sets
 * (`#pantry/vocab/open.ts` `wildcardReads`) and `globalKinds`. A kind of a vocabulary
 * stands in the documents of every root whose set lists its namespace, and one grammar serves them
 * all, so its wildcards read what any of those sets declares (reading 81's stated limit); a kind of
 * no vocabulary stands in every document.
 *
 * Bound: every (wildcard host, global kind), exhausted: each host is a kind whose content admits a
 * foreign kind, so it holds a non-`skip` wildcard, and each global kind is one of `globalKinds`, of
 * a namespace other than the host's. The box states one direction: an `Admission` row of such a
 * pair needs a root set holding both namespaces. It kills the composition's `wildcardReads`
 * conjunct dropped (compose.ts, 8,730 rows added).
 */
import * as NodeServices from "@effect/platform-node/NodeServices";
import { assert, beforeAll, describe, layer } from "@effect/vitest";
import { Effect, Option, Result } from "effect";
import { composed } from "#pantry/grammar/compose.ts";
import { isForeignKind } from "#pantry/grammar/kinds.ts";
import { schemaSetOf, xsdCachePresent } from "#pantry/test/xsd-catalog.ts";
import { globalKinds } from "#pantry/vocab/inventory/vocabularies.ts";
import { admittedOf } from "#pantry/test/indexes.ts";

/**
 * The composed grammar.
 */
const grammar = Result.getOrThrow(composed());

/**
 * Read a kind's namespace.
 *
 * @param kind - The kind.
 * @returns Its namespace, or none for a kind of no vocabulary, which names no element.
 */
const namespaceOf = (kind: string): Option.Option<string> =>
  Option.map(grammar.kinds.elementName.lookup({ kind }), ({ namespace }) => namespace);

describe("a wildcard's global elements", () => {
  beforeAll(xsdCachePresent);

  layer(NodeServices.layer)("the pinned XSDs' schema sets", (it) => {
    it.effect(
      "admit a global as its kind only where a root's schema set holds both namespaces: every host and global",
      () =>
        Effect.gen(function* everyPair() {
          const wrong: string[] = [];
          let pairs = 0;
          const rows = admittedOf(grammar.content.contentModelOf, grammar.content.admissionIn);
          const roots = [
            ...new Set(
              rows
                .filter((row) => row.parent === "document")
                .flatMap(({ child }) => Option.toArray(namespaceOf(child))),
            ),
          ];
          const sets: ReadonlySet<string>[] = [];
          for (const root of roots) {
            sets.push(yield* schemaSetOf(root).pipe(Effect.orDie));
          }

          const hosts = [
            ...new Set(
              rows.filter(({ child }) => isForeignKind(child)).map(({ parent }) => parent),
            ),
          ];
          for (const host of hosts) {
            const hostNamespace = namespaceOf(host);
            for (const { kind } of globalKinds) {
              for (const childNamespace of Option.toArray(namespaceOf(kind))) {
                if (Option.contains(hostNamespace, childNamespace)) {
                  continue;
                }

                pairs += 1;
                const shared = sets.some(
                  (set) =>
                    Option.match(hostNamespace, {
                      onNone: () => true,
                      onSome: (namespace) => set.has(namespace),
                    }) && set.has(childNamespace),
                );
                const admitted = Option.isSome(
                  grammar.admission.lookup({ child: kind, parent: host }),
                );
                if (admitted && !shared) {
                  wrong.push(
                    `${kind} under ${host}: admitted, no root's schema set holds both namespaces`,
                  );
                }
              }
            }
          }

          assert.isAbove(pairs, 0, "some host and global were paired");
          assert.deepStrictEqual(
            wrong.slice(0, 40),
            [],
            "no wildcard admits a global its schema sets do not declare",
          );
        }),
    );
  });
});
