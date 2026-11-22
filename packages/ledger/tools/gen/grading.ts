import type { Generator } from "#tools/gen/generator.ts";
import { uncookedBodies } from "#tools/gen/grading/cooked.ts";
import { machineModules } from "#tools/gen/grading/machine.ts";
import { outOfReach } from "#tools/gen/grading/reach.ts";

/**
 * `src/grading.ts`, the machine's module, from the SQL of the package's machine/ as it is when the
 * generator runs: formatted, every body held to its SQL byte for byte, and every row type a body
 * names within its reach, or no file.
 */
export const generator: Generator = {
  generate: async ({ format }) => {
    const { bodies, gradingModule } = machineModules();
    const text = await format(gradingModule);
    const uncooked = uncookedBodies(text, bodies);
    if (uncooked.length > 0) {
      throw new Error(
        `src/grading.ts's bodies do not read back as their SQL: ${uncooked.join(", ")}. The generator's escaping of machine/ is wrong for them: fix tools/gen/grading/machine.ts.`,
      );
    }

    const unreached = outOfReach(text);
    if (unreached.length > 0) {
      throw new Error(
        `src/grading.ts's bodies name headings out of their reach: ${unreached.join("; ")}. Pass the heading in the function's signature or a callee's.`,
      );
    }

    return text;
  },
  reads: ["machine/"],
  target: "src/grading.ts",
};
