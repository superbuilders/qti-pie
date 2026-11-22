import type { Generator } from "#tools/gen/generator.ts";
import { admissionStage } from "#tools/gen/grade/admission.ts";
import { baseStage } from "#tools/gen/grade/base.ts";
import { defaultsStage } from "#tools/gen/grade/defaults.ts";
import { readFragments } from "#tools/gen/grade/fragments.ts";
import { membersStage } from "#tools/gen/grade/members.ts";
import { sittingsStage } from "#tools/gen/grade/sittings.ts";
import { takeStage } from "#tools/gen/grade/take.ts";

/**
 * The ledger's grade.ts, whole, from its generator alone: the base stage (the grading statement's
 * readers and writes, gradeArgumentsOf, attemptArgumentsOf, gradeAttemptTables, gradeAttemptOf),
 * then the members stage (testTreeOf and memberValuesOf, from attemptArgumentsOf's rules), the
 * admission stage (admissionArgumentsOf and memberAdmissionArgumentsOf, one template, from
 * gradeArgumentsOf's and memberValuesOf's rules, and their call builders), the take stage
 * (takeArgumentsOf and takeValuesOf), the sittings stage (the subject sittings as the `sittings`
 * relation parameter) and the defaults stage (a DefaultSubmission attempt graded from its defaults
 * and written as submitted). Each stage is formatted, lint-fixed and formatted again, as qti-pie's
 * gate holds the file, and reads only what the stage before it wrote, never the committed file.
 */
export const generator: Generator = {
  generate: async ({ format, lintFix }) => {
    const fragment = await readFragments();
    const settled = async (text: string) => await format(await lintFix(await format(text)));
    const base = await settled(baseStage(fragment));
    const members = await settled(membersStage(base, fragment));
    const admission = await settled(admissionStage(members, fragment));
    const take = await settled(takeStage(admission, fragment));
    const sittings = await settled(sittingsStage(take, fragment));

    return await settled(defaultsStage(sittings, fragment));
  },
  reads: ["tools/gen/grade/fragments/"],
  target: "src/grade.ts",
};
