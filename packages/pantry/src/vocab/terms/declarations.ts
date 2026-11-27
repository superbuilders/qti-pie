/**
 * The terms of declarations that the schema (`#pantry/qti/declarations.ts`) and the importer
 * (`#pantry/import/overlays/declarations.ts`) both read. Each is a function of the attribute
 * inventory alone, so loading this module builds no relation of the schema.
 */
import { Array as Arr, Option } from "effect";
import { attributeDeclarations } from "#pantry/vocab/inventory/attributes.ts";

/**
 * The `normal-minimum` an outcome declaration has where it writes none (spec reading
 * `normal-minimum-default`): QTI 3.0.1's `default="0.0"` (`imsqti_asiv3p0p1_v1p0.xsd` line 30137;
 * information model §4.5.8, "Default = "0.0"" and "It is set to 0 by default"). Read from the
 * inventory's leaf, the one statement of the XSD's defaults. The pinned XSD states it, so an
 * inventory that holds none is a defect of the inventory, thrown where this module loads: the laws
 * that judge an unwritten minimum by it read it as present, and never lapse with it.
 */
export const normalMinimumDefault: string = Option.getOrThrowWith(
  Option.flatMap(
    Arr.findFirst(
      attributeDeclarations,
      ({ kind, name }) => kind === "qti-outcome-declaration" && name === "normal-minimum",
    ),
    ({ default: stated }) => stated,
  ),
  () =>
    new Error(
      "The attribute inventory states no default of qti-outcome-declaration's normal-minimum, which the pinned XSD gives as 0.0 and the normal-minimum laws read.",
    ),
);
