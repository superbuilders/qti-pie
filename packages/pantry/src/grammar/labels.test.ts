/**
 * `labels.ts`'s tests: over every kind of the composition, the kinds whose `label` asks for its
 * tool are exactly the kinds whose `label` the pinned ASI XSD declares inside one of the types
 * whose characteristic states the tool sentence, and each declares a `label`.
 */
import * as NodeServices from "@effect/platform-node/NodeServices";
import { assert, beforeAll, describe, it } from "@effect/vitest";
import { Effect, Layer, Result } from "effect";
import { Digest } from "effect/crypto";
import type { Element } from "@qti-pie/crust/tree.ts";
import { composed } from "#pantry/grammar/compose.ts";
import { toolLabelKindsOf } from "#pantry/grammar/labels.ts";
import { readPlaced } from "#pantry/vocab/derive/sources.ts";
import type { SourcePath } from "#pantry/vocab/derive/sources.ts";
import { attributeDeclarations } from "#pantry/vocab/inventory/attributes.ts";
import { typeDerivations } from "#pantry/vocab/inventory/models.ts";
import { xsdCachePresent } from "#pantry/test/xsd-catalog.ts";

/**
 * The composed grammar whose kinds and declared types the tests read.
 */
const grammar = Result.getOrThrow(composed());

/**
 * The kinds whose `label` asks for its tool.
 */
const derived = toolLabelKindsOf({
  declaredType: grammar.xsi.declaredType,
  derivations: typeDerivations,
  kinds: grammar.kinds.nodeKind.handles,
});

/**
 * The pinned ASI XSD.
 */
const asiXsd: SourcePath = "imsqti_asiv3p0p1_v1p0.xsd";

/**
 * The ASI types whose `label` characteristic's description states the tool sentence, as the oracle
 * reads the information model's text, section by section, apart from `labels.ts`'s list:
 * BasePromptInteraction (§5.15.5), the six of the BaseSequence family (§5.16.5 to §5.21.5),
 * ItemBody (§5.79.4) and AssessmentItem (§4.1.3, `~/.cache/qti-pie/qti301/info301.txt:6420`, the
 * item root's own label).
 */
const sentenceTypes: ReadonlySet<string> = new Set([
  "BasePromptInteractionDType",
  "BaseSequenceDType",
  "BaseSequenceEmptyDType",
  "BaseSequenceFullDType",
  "BaseSequenceRIdentDType",
  "BaseSequenceXBaseDType",
  "BaseSequenceXBaseEmptyDType",
  "ItemBodyDType",
  "AssessmentItemDType",
]);

/**
 * Map the start line of each `xs:attribute name="label"` of an XSD to the named complex type it is
 * declared in, by walking the tree in the order its start lines are counted.
 *
 * @param root - The schema's root element.
 * @param lines - The start line of each element, in document order.
 * @returns Each label declaration's line, with its complex type's name.
 */
const labelOwnersOf = (root: Element, lines: readonly number[]): ReadonlyMap<number, string> => {
  const owners = new Map<number, string>();
  let at = 0;
  /**
   * Visit an element and its descendants in document order, each taking the next start line.
   *
   * @param element - The element.
   * @param owner - The named complex type it stands in, empty outside one.
   */
  const walk = (element: Element, owner: string) => {
    const line = lines[at] ?? 0;
    at += 1;
    const named = element.attributes.find(({ local }) => local === "name")?.value ?? "";
    const own = element.local === "complexType" && named !== "" ? named : owner;
    if (element.local === "attribute" && named === "label") {
      owners.set(line, owner);
    }

    for (const child of element.children) {
      if (child.kind === "element") {
        walk(child, own);
      }
    }
  };
  walk(root, "");

  return owners;
};

describe("grammar/labels.ts, the kinds whose label asks for its tool", () => {
  it("select only kinds that declare a label", () => {
    // Oracle: the leaf's attribute declarations, the kinds that declare a `label`. Bound: every
    // kind the list selects.
    const bearing = new Set(
      attributeDeclarations.filter(({ name }) => name === "label").map(({ kind }) => kind),
    );

    assert.deepStrictEqual(
      derived.filter((kind) => !bearing.has(kind)),
      [],
    );
  });
});

describe("grammar/labels.ts, against the pinned XSD", () => {
  beforeAll(xsdCachePresent);

  it.effect(
    "are exactly the kinds whose label the pinned ASI XSD declares inside a type whose characteristic states the tool sentence",
    () =>
      // Oracle: the pinned XSD itself, the complex type each kind's `label` declaration stands in,
      // read from the declaration's own source line, which no type derivation is consulted for.
      // Bound: every label declaration of the ASI XSD, 12 types'.
      Effect.gen(function* fromSourceLines() {
        const placed = yield* readPlaced(asiXsd);
        const owners = labelOwnersOf(placed.document.root, placed.lines);
        const named = attributeDeclarations.flatMap(({ kind, name, source }) =>
          name === "label" && source._tag === "xsd" && source.file === asiXsd
            ? [{ kind, owner: owners.get(source.line) ?? `line ${String(source.line)}` }]
            : [],
        );

        assert.deepStrictEqual(
          named
            .filter(({ owner }) => sentenceTypes.has(owner))
            .map(({ kind }) => kind)
            .toSorted(),
          [...derived].toSorted(),
        );
      }).pipe(Effect.provide(Layer.mergeAll(NodeServices.layer, Digest.layerWebCrypto))),
  );
});
