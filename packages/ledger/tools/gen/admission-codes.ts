import type { Generator } from "#tools/gen/generator.ts";
import { admissionCodesModule } from "#tools/gen/grading/machine.ts";

/**
 * Plate's `src/admission-codes.ts`, admission's reason codes, from machine/admission.sql's
 * admission_one `codes` as it is when the generator runs.
 */
export const generator: Generator = {
  generate: ({ format }) => format(admissionCodesModule()),
  reads: ["machine/admission.sql"],
  target: "../plate/src/admission-codes.ts",
};
