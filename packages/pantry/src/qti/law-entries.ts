/**
 * Every statement's catalog entry, declared where the statement is stated (grizzle's `law`): its
 * name, the law it states as the law table names it (`#pantry/vocab/laws.ts`), and its source, the
 * table's citation of the specification or the design, so every refusal names each law it breaks
 * by the entry the law carries (`#pantry/import/refusal.ts`).
 *
 * @module
 */
import { law } from "@bjornpagen/grizzle";
import { lawTable } from "#pantry/vocab/laws.ts";

/**
 * The statements a module files under one law, each declaring that law's entry: its name and the
 * law table's source of it.
 *
 * @param name - The law's name, its row of the law table.
 * @param statements - The statements that state it, each one a law states (no `mutable` or `race`).
 * @returns The statements, each with the law's entry.
 */
export const declared = <S extends Parameters<typeof law>[1]>(
  name: keyof typeof lawTable,
  statements: readonly S[],
): readonly S[] =>
  statements.map((statement) => law({ name, source: lawTable[name].source }, statement));
