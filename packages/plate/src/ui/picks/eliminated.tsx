"use client";

/**
 * The options a host has eliminated: a test's cross-out tool, which a child uses to strike an
 * option they have ruled out, as AlphaTest's player let them. The host holds which options are
 * struck as React state, as it holds the responses, and the picks groups read it through one
 * context: an eliminated option's control is disabled, so neither a press nor the arrow keys pick
 * it (UI SDK's radio group skips a disabled radio as it moves), and it carries its description,
 * "Crossed out", so a screen reader says so. Elimination is no response: it posts nothing, and the
 * host decides what a struck option that was picked keeps.
 *
 * @module
 */
import { createContext, use, useMemo } from "react";
import type { ReactNode } from "react";

/**
 * One eliminated option: the entry name its interaction's response posts under, from plate's
 * `entryName`, and the option's identifier.
 */
export type EliminatedOption = readonly [name: string, identifier: string];

/**
 * The eliminated options by the entry name their response posts under.
 */
type ByResponse = ReadonlyMap<string, ReadonlySet<string>>;

/**
 * No identifier eliminated.
 */
const noneEliminated: ReadonlySet<string> = new Set();

/**
 * The context's value outside an {@link Eliminated}: nothing eliminated.
 */
const nothing: ByResponse = new Map();

/**
 * The context the picks groups read the eliminated options from.
 */
const EliminatedContext = createContext<ByResponse>(nothing);

/**
 * Give the picks groups inside the options the host has eliminated.
 *
 * @param props.value The eliminated options, each its response's entry name and its identifier.
 * @param props.children The item, with its islands.
 * @returns The item.
 */
export const Eliminated = ({
  value,
  children,
}: Readonly<{ value: readonly EliminatedOption[]; children: ReactNode }>) => {
  const byResponse = useMemo(() => {
    const grouped = new Map<string, Set<string>>();

    for (const [name, identifier] of value) {
      grouped.set(name, (grouped.get(name) ?? new Set<string>()).add(identifier));
    }

    return grouped;
  }, [value]);

  return <EliminatedContext value={byResponse}>{children}</EliminatedContext>;
};

/**
 * Read the options eliminated of one response.
 *
 * @param name The entry name the response posts under.
 * @returns The identifiers eliminated, none outside an {@link Eliminated}.
 */
export const useEliminated = (name: string): ReadonlySet<string> =>
  use(EliminatedContext).get(name) ?? noneEliminated;
