/**
 * How a Slider's island reads its response's number and writes it back: the one single of an
 * `integer` or a `float` response as a JavaScript number, the slider's own. The module is imported
 * by client modules only.
 *
 * @module
 */
import { Option } from "effect";
import type { SingleCodec } from "#plate/ui/responses.tsx";

/**
 * A Slider's number under each base type its binding takes: an `integer` response's exact integer
 * as a number, written back as the whole number nearest the thumb, and a `float` response's finite
 * number, written back as it is. A single of any other base type, or a float that is not finite,
 * which no slider sets, reads as no number.
 */
export const numberSingles: Readonly<Record<"float" | "integer", SingleCodec<number>>> = {
  float: {
    read: (single) =>
      single.baseType === "float" && Number.isFinite(single.value)
        ? Option.some(single.value)
        : Option.none(),
    write: (value) => ({ baseType: "float", value }),
  },
  integer: {
    read: (single) =>
      single.baseType === "integer" ? Option.some(Number(single.value)) : Option.none(),
    write: (value) => ({ baseType: "integer", value: BigInt(Math.round(value)) }),
  },
};
