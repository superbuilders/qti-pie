import { readFile } from "node:fs/promises";
import path from "node:path";
import { must } from "#tools/gen/grade/text.ts";

/**
 * The verbatim texts the grade.ts generator's stages splice, by stage: each a file under
 * `fragments/` named `<name>.ts.txt`, a piece of TypeScript that is no module on its own, so no
 * typecheck, lint or format reads it. grade.ts's header is `base/pre-ledger-head`.
 */
const FRAGMENTS = [
  "admission/common",
  "admission/item-answered",
  "admission/item-call-tail",
  "admission/item-key",
  "admission/item-key-in",
  "admission/item-runs",
  "admission/member-answered",
  "admission/member-call-tail",
  "admission/member-key",
  "admission/member-key-in",
  "admission/member-runs",
  "base/attempt-arguments-head",
  "base/grade-arguments-head",
  "base/grade-attempt-head",
  "base/latest-readers",
  "base/num-attempts",
  "base/post-head",
  "base/post-tail",
  "base/pre-ledger-head",
  "base/readers",
  "base/readers-return",
  "base/retained",
  "base/retained-vars",
  "base/run-inputs",
  "base/sitting",
  "defaults/written",
  "members/test-tree-and-member-values",
  "sittings/graded-sitting",
  "sittings/sittings-in",
  "sittings/taken-sessions",
  "take/arguments-head",
  "take/roots",
  "take/runs",
  "take/template-roots",
  "take/values-head",
] as const;

/**
 * A fragment's text by its name.
 */
export type Fragments = (name: (typeof FRAGMENTS)[number]) => string;

/**
 * Reads every fragment, once.
 *
 * @returns Each fragment's text by its name.
 */
export const readFragments = async (): Promise<Fragments> => {
  const texts = new Map(
    await Promise.all(
      FRAGMENTS.map(
        async (name) =>
          [
            name,
            await readFile(path.join(import.meta.dirname, "fragments", `${name}.ts.txt`), "utf-8"),
          ] as const,
      ),
    ),
  );

  return (name) => {
    const text = texts.get(name);
    must(text !== undefined, `no fragment ${name}`);

    return text;
  };
};
