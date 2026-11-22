/**
 * Every law's catalog entry, declared where the law comes from (grizzle's `law`): its name, the
 * law as the law table names it (`#pantry/vocab/laws.ts`), and its source, the table's citation of
 * the specification or the design. A statement declares the entry of every law it states, a
 * relation its primary key's, a generated field its own law's, a text type its pattern law's, and
 * the contract `natural` its own law's ({@link natural}), so every refusal names each law it breaks
 * by the entry the law carries
 * (`#pantry/import/refusal.ts`).
 *
 * @module
 */
import { law, natural as builtinNatural } from "@bjornpagen/grizzle";
import type { Statement } from "@bjornpagen/grizzle";
import { lawTable } from "#pantry/vocab/laws.ts";

/**
 * A law's catalog entry: the law table's row of its name, its name and the table's source of it.
 *
 * @param name - The law's name, its row of the law table.
 * @returns The entry `law` declares.
 */
export const entryOf = (name: keyof typeof lawTable) => ({
  name,
  source: lawTable[name].source,
});

/**
 * Grizzle's contract `natural`, a bigint never below zero, with its law's entry: the type of every
 * count, position and bit set of the model, so every field pantry types a natural is of it. Each
 * natural the import writes is a count or a position of its own rows, or a set of a closed
 * relation's bits, and grizzle draws or accumulates the rest, so no row breaks it, and its law is
 * the law of the values the import derives, "E1 derived".
 */
export const natural = law(entryOf("E1 derived"), builtinNatural);

/**
 * The statements a module files under one law, each declaring that law's entry.
 *
 * @param name - The law's name, its row of the law table.
 * @param statements - The statements that state it, each one a law states (no `mutable` or `race`).
 * @returns The statements, each with the law's entry.
 */
export const declared = <S extends Extract<Parameters<typeof law>[1], Statement>>(
  name: keyof typeof lawTable,
  statements: readonly S[],
): readonly S[] => statements.map((statement) => law(entryOf(name), statement));
