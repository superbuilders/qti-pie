/**
 * Every law's catalog entry, declared where the law comes from (grizzle's `law`): its name, the
 * law as the law table names it (`#pantry/vocab/laws.ts`), and its source, the table's citation of
 * the specification or the design. A statement declares the entry of every law it states, a
 * relation its primary key's, a generated field its own law's, a text type its pattern law's, and
 * the contract `natural` its own law's (`#pantry/grammar/install.ts` `natural`), each by its entry
 * (`#pantry/vocab/laws.ts` `entryOf`), so every refusal names each law it breaks by the entry the
 * law carries (`#pantry/import/refusal.ts`).
 *
 * @module
 */
import { law } from "@bjornpagen/grizzle";
import type { Statement } from "@bjornpagen/grizzle";
import { entryOf } from "#pantry/vocab/laws.ts";
import type { lawTable } from "#pantry/vocab/laws.ts";

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
