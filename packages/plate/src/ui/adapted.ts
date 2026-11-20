/**
 * A plate primitive as UI SDK's adapters take it: {@link adapted}. Safe to import on the server and
 * the client: it imports only plate's defects and UI SDK's types.
 *
 * @module
 */
import type { PropSpec } from "@ui-sdk/core";
import { PrimitiveWithoutOptions } from "#plate/ui/defects.ts";

/**
 * Give a primitive with its `options` schema typed present, as UI SDK's `Primitive` takes it for
 * `createParts` and `usePrimitive`. `definePrimitive` gives every primitive with an `options`
 * schema that schema, but types it `Record<string, PropSpec> | undefined`, which `Primitive`
 * refuses for its optional `options` under `exactOptionalPropertyTypes`. Writing the schema back,
 * the one it already holds, types it present with no assertion; every plate primitive declares one,
 * so a primitive without is a defect, thrown when its module loads.
 *
 * @template P The primitive.
 * @param primitive The primitive, as `definePrimitive` gave it.
 * @returns The same primitive, its `options` typed present.
 * @throws {PrimitiveWithoutOptions} For a primitive defined with no `options` schema.
 */
export const adapted = <P extends { options?: Record<string, PropSpec> | undefined }>(
  primitive: P,
): P & { options: Record<string, PropSpec> } => {
  const { options } = primitive;

  if (options === undefined) {
    throw new PrimitiveWithoutOptions();
  }

  return Object.assign(primitive, { options });
};
