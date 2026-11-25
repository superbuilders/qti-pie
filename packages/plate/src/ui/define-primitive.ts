/**
 * Plate's one way to define a UI SDK primitive: {@link definePrimitive}, UI SDK's own, which refuses
 * a definition one of whose slots' parts take props but carry no key. Safe to import on the server
 * and the client: it imports only UI SDK's kernel and plate's defects.
 *
 * UI SDK tells the parts of a slot apart by their key, a part's `id` prop, else its `value`, and
 * keeps one part per key: one set of props, one bound element and one set of handlers, which read
 * that part's props when an event fires. So every part of a slot whose props hold neither is the
 * one part keyed `""`, and an event on any of them reads the props of whichever rendered last. A
 * slot whose parts take props is rendered with different props, more than once; each of its parts
 * must be its own, and the slot says so by declaring `id: "id"`, which the adapter makes unique for
 * each part the renderer leaves it out of. A Position Object once declared its copies' controls
 * without one, so Delete on one copy's control took another copy off the stage, a tap on it picked
 * another up, and picking a copy up could move focus to its object, where the next press took the
 * copy off; with this check that definition fails where its module loads, before any part renders.
 * The lint's `no-restricted-imports` holds plate's other modules to this one.
 *
 * @module
 * @see https://ui-sdk.dev/docs/core/kernel/define-a-primitive
 */
import { definePrimitive as defineUiSdkPrimitive } from "@ui-sdk/core";
import { schemaOf } from "@ui-sdk/core/renderer";
import { PrimitiveSlotUnkeyed } from "#plate/ui/defects.ts";

/**
 * Define a UI SDK primitive, as UI SDK's `definePrimitive` defines it, once each of its slots
 * whose parts take props declares the `id` the adapter keys each part by, written `id: "id"`, the
 * kind whose value the adapter makes unique where the renderer leaves it out.
 *
 * @param definition The primitive's definition, as UI SDK's `definePrimitive` takes it.
 * @returns The primitive.
 * @throws {PrimitiveSlotUnkeyed} For a slot whose parts take props but no `id: "id"`, thrown where
 *   the primitive's module loads.
 */
export const definePrimitive: typeof defineUiSdkPrimitive = (definition) => {
  const primitive = defineUiSdkPrimitive(definition);

  for (const [slot, props] of Object.entries(schemaOf(primitive).slots)) {
    if (Object.keys(props).some((name) => name !== "id") && props["id"] !== "id") {
      throw new PrimitiveSlotUnkeyed({ primitive: definition.name, slot });
    }
  }

  return primitive;
};
