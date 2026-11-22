/**
 * The law-name dictionary's generator: `#pantry/vocab/law-names.json` from the schema's own naming
 * of its laws (`#pantry/test/law-namer.ts`) and the id grizzle's `lawsOf(Qti)` gives each, the
 * key a refused law carries (grizzle's `RefusedLaw.id`): a law of the theory's LawId, a text
 * pattern law's LawId under its installed domain, and a generated field's law's GeneratedLawId.
 * `law-names.committed.test.ts` holds the committed file to it.
 *
 * The dictionary stays for the laws no statement states, whose entry grizzle derives: a refusal of
 * one carries its law and that id, never the name pantry's law table gives it, which only the
 * schema's law model computes, and the importer names a refusal without building the schema
 * (`#pantry/import/refusal.ts`). A statement's law is named by the entry it carries.
 *
 * Run it from the package's folder:
 * `node src/test/law-names.ts` writes the file.
 */
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { lawsOf, sameLaw } from "@bjornpagen/grizzle";
import type { Law } from "@bjornpagen/grizzle";
import { Array as Arr, Function as Fn, Option, Order } from "effect";
import type { LawNamesFile, RefusalLaw } from "#pantry/import/refusal.ts";
import { Qti } from "#pantry/qti/schema.ts";
import { bucketOf, schemaLawNameOf } from "#pantry/test/law-namer.ts";

// GRIZZLE-PENDING: Q3. lawKeyOf would key a law's id by its law; until then the id is found by
// `sameLaw` within the law's bucket.
/**
 * The laws of `lawsOf(Qti)`, each with its id, grouped by bucket (`#pantry/test/law-namer.ts`
 * `bucketOf`) for the search {@link lawIdOf} makes. Built at its first read, which compiles Qti's
 * law model once with the namer's list (grizzle's `lawsOf`).
 */
const identifiedByBucket = Fn.memoize((schema: typeof Qti) =>
  Arr.groupBy(lawsOf(schema), ({ law }) => bucketOf(law)),
);

/**
 * Find a law's id, the one a refusal of it carries: the id `lawsOf(Qti)` lists beside the law
 * grizzle's `sameLaw` holds it to be, so a law pantry's own model builds finds its id too.
 *
 * @param law - A law of `lawsOf(Qti)`, or one pantry's own model builds.
 * @returns Its id, or none for a law `Qti` does not state.
 */
const lawIdOf = (law: Law): Option.Option<string> =>
  Option.map(
    Arr.findFirst(identifiedByBucket(Qti)[bucketOf(law)] ?? [], (held) => sameLaw(held.law, law)),
    ({ id }) => id,
  );

/**
 * Build a law of `lawsOf(Qti)` as a refusal of it carries it, by a statement: the law, and its id
 * ({@link lawIdOf}), empty for a law `Qti` does not state.
 *
 * @param law - A law of `lawsOf(Qti)`.
 * @returns The refused law.
 */
export const refusedOf = (law: Law): RefusalLaw => ({
  by: { kind: "statement" },
  id: Option.getOrElse(lawIdOf(law), () => ""),
  law,
});

/**
 * The committed dictionary's path.
 */
export const lawNamesPath: string = fileURLToPath(
  import.meta.resolve("#pantry/vocab/law-names.json"),
);

/**
 * Sort a record's entries by their keys' code points, so the file is one text for one dictionary.
 *
 * @param record - The record.
 * @returns The same entries, keys in code point order.
 */
const sortedRecord = <A>(record: Readonly<Record<string, A>>): Readonly<Record<string, A>> =>
  Object.fromEntries(Object.entries(record).toSorted(([x], [y]) => Order.String(x, y)));

/**
 * Build the dictionary from the schema: under its id, each named law of grizzle's `lawsOf(Qti)`
 * that no entry names, a check by its own name and a statement's law by the entry its statement
 * declares (`#pantry/qti/law-entries.ts`): the laws no statement states, a primary key, a pattern
 * law, a generated field's and a contract's. Two laws of one id named apart is a defect of
 * grizzle's ids or of the schema's naming, and the build throws naming it.
 *
 * @returns The dictionary.
 */
export const lawNamesOf = (): LawNamesFile => {
  const laws: Record<string, { readonly name: string }> = {};

  for (const { id, law } of lawsOf(Qti)) {
    const named = law.kind === "check" || law.entry.kind === "declared";
    for (const name of named ? [] : Option.toArray(schemaLawNameOf(law))) {
      const held = laws[id];
      if (held !== undefined && held.name !== name) {
        throw new Error(
          `Two laws of lawsOf(Qti) carry the one id ${id}, named ${held.name} and ${name}: the dictionary cannot name both.`,
        );
      }

      laws[id] = { name };
    }
  }

  return { laws: sortedRecord(laws) };
};

if (import.meta.main) {
  writeFileSync(lawNamesPath, `${JSON.stringify(lawNamesOf(), undefined, 2)}\n`);
}
