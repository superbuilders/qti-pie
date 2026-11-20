/**
 * The properties a Portable Custom Interaction's module is handed: the QTI 3 implementation guide's
 * PCI configuration object holds "properties: An object containing all of the key/value pairs from
 * the data- attributes set on the qti-portable-custom-interaction. The naming rules applied by
 * HTML5 for element.dataset should be followed here", so `data-max-choices-message="Too Many"` is
 * the property `maxChoicesMessage`.
 *
 * The oracle is that sentence and HTML's `dataset` naming, read by eye: the item written here sets
 * four `data-*` attributes on its PCI, three of them names plate reserves for its own markers
 * (`data-selected`, `data-mode`, `data-slot`), as 1EdTech's shading PCI sets `data-selected` for
 * the cells it starts shaded (`qtiv3-examples/packaging/pci/src/fractions1.xml`). Every one is a
 * property, and none is marked as an attribute removed. A `data-*` on an element of its markup is
 * an author attribute like any other, and a reserved one there is removed and marked.
 *
 * @module
 */
import { assert, describe, it } from "@effect/vitest";
import { Effect, Option } from "effect";
import { interactionsIn } from "#plate/model/interactions.ts";
import { admitted } from "#plate/test/admitted.ts";
import { acceptedItem } from "#plate/validate/verdict.ts";

/**
 * An item whose PCI sets `data-selected`, `data-mode`, `data-slot` and `data-max-choices-message`,
 * and whose markup's paragraph sets `data-mode`.
 */
const reservedProperties = [
  '<qti-assessment-item xmlns="http://www.imsglobal.org/xsd/imsqtiasi_v3p0" identifier="shading" title="Shading" adaptive="false" time-dependent="false">',
  '<qti-response-declaration identifier="RESPONSE" cardinality="single" base-type="integer"/>',
  "<qti-item-body>",
  '<qti-portable-custom-interaction response-identifier="RESPONSE" module="shading" custom-interaction-type-identifier="urn:example:shading" data-selected="0.0,1.0" data-mode="grid" data-slot="2" data-max-choices-message="Too Many">',
  '<qti-interaction-markup><p data-mode="x">Shade the cells.</p></qti-interaction-markup>',
  "</qti-portable-custom-interaction>",
  "</qti-item-body>",
  "</qti-assessment-item>",
].join("");

describe("the Portable Custom Interaction core's properties", () => {
  it.effect(
    "hands the module every data-* of the element as a property, named as dataset names it, the names plate reserves among them, and marks only the reserved data-* of its markup",
    () =>
      Effect.gen(function* reservedNames() {
        const verdict = yield* admitted(
          "shading.xml",
          new TextEncoder().encode(reservedProperties),
        );
        const accepted = Option.getOrElse(acceptedItem(verdict), () =>
          assert.fail(`shading.xml is not accepted: ${verdict.verdict}`),
        );
        const pci = interactionsIn(accepted.item.body).find(
          (node) => node.kind === "portable-custom",
        );

        assert.deepStrictEqual(pci?.kind === "portable-custom" ? pci.properties : undefined, [
          { name: "selected", value: "0.0,1.0" },
          { name: "mode", value: "grid" },
          { name: "slot", value: "2" },
          { name: "maxChoicesMessage", value: "Too Many" },
        ]);
        assert.deepStrictEqual(accepted.item.unsupported, [
          {
            feature: "attribute:data-mode",
            path: "qti-assessment-item/qti-item-body/qti-portable-custom-interaction/qti-interaction-markup/p",
            shown: "mark",
          },
        ]);
      }),
  );
});
