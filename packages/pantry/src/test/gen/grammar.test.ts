import { assert, beforeAll, describe, it } from "@effect/vitest";
import { Effect } from "effect";
import { XML_NAMESPACE } from "@qti-pie/crust/tree.ts";
import { composed } from "#pantry/grammar/compose.ts";
import type { SourcePath } from "#pantry/vocab/derive/sources.ts";
import { attributeDeclarations } from "#pantry/vocab/inventory/attributes.ts";
import { loadXsd, resolverOf, XsdOracleLayer, xsdContents } from "#pantry/test/gen/grammar.ts";
import { xsdCachePresent } from "#pantry/test/xsd-catalog.ts";

/**
 * The composed grammar of production, whose kind resolution the walk reads kinds through.
 */
const grammar = Effect.fromResult(composed());

/**
 * The ASI schema set, the only pinned one whose kinds declare `xml:` attributes.
 */
const root: SourcePath = "imsqti_asiv3p0p1_v1p0.xsd";

/**
 * The attributes `xml.xsd` declares in the XML namespace.
 */
const xmlAttributes: ReadonlySet<string> = new Set(["base", "id", "lang", "space"]);

describe("the XSD reader's QNames", () => {
  beforeAll(xsdCachePresent);

  it.effect(
    "reads the xml prefix as the XML namespace, so a kind declaring lang and xml:lang has two names",
    () =>
      // Oracle: Namespaces in XML 1.0 §3 binds `xml` with no declaration; and a second
      // implementation, the vocabulary deriver's attribute leaf, for which kinds declare both.
      Effect.gen(function* xmlPrefix() {
        const { kinds } = yield* grammar;
        const { set } = yield* loadXsd(root);
        const { contents } = xsdContents(set, resolverOf(kinds));
        const both = new Set<string>();
        const strays: string[] = [];
        for (const [kind, models] of contents) {
          for (const { attributes } of models) {
            const qualified = attributes.filter(({ name }) => name.namespace === XML_NAMESPACE);
            strays.push(
              ...qualified
                .filter(({ name }) => !xmlAttributes.has(name.local))
                .map(({ name }) => `${kind} ${name.local}`),
            );
            if (
              qualified.some(({ name }) => name.local === "lang") &&
              attributes.some(({ name }) => name.namespace === "" && name.local === "lang")
            ) {
              both.add(kind);
            }
          }
        }

        const declared = new Map<string, Set<string>>();
        for (const { kind, name } of attributeDeclarations) {
          declared.set(kind, (declared.get(kind) ?? new Set()).add(name));
        }

        const leaf = Iterator.from(declared)
          .filter(([, names]) => names.has("lang") && names.has("xml:lang"))
          .map(([kind]) => kind)
          .toArray();

        assert.isAbove(both.size, 0, root);
        assert.deepStrictEqual(strays, [], root);
        assert.deepStrictEqual([...both].toSorted(), leaf.toSorted(), root);
      }).pipe(Effect.provide(XsdOracleLayer)),
  );
});
