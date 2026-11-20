"use client";

/**
 * Where a Portable Custom Interaction's failure goes: the host's, through `<PciFailures>`. The
 * island shows the child it failed (`plate-portable-custom-status`) and hands the host the reason,
 * which only the host can log: the frame is sandboxed, the island runs in the child's browser, and
 * plate has no log of its own. Outside a `<PciFailures>`, a failure reaches the child's status
 * alone.
 *
 * @module
 */
import { Function } from "effect";
import { createContext, use } from "react";
import type { ReactNode } from "react";

/**
 * A Portable Custom Interaction its frame could not run: the response it binds, its
 * `custom-interaction-type-identifier` as written, and why, one English sentence for the host's
 * log, never shown to the child.
 */
export interface PciFailure {
  readonly reason: string;
  readonly response: string;
  readonly typeIdentifier: string;
}

/**
 * What the host is told of each failure, once per failure, as it happens.
 */
type OnPciFailed = (failure: PciFailure) => void;

/**
 * The host's listener the islands inside a `<PciFailures>` tell; outside one, a listener that
 * hears nothing.
 */
const PciFailuresContext = createContext<OnPciFailed>(Function.constVoid);

/**
 * Tell the host of every Portable Custom Interaction inside it that fails.
 *
 * @param props.onFailed Called with each failure as its island meets it ({@link PciFailure}).
 * @param props.children The item, with its islands.
 * @returns The children, under the listener.
 */
export const PciFailures = ({
  onFailed,
  children,
}: Readonly<{ onFailed: OnPciFailed; children: ReactNode }>) => (
  <PciFailuresContext value={onFailed}>{children}</PciFailuresContext>
);

/**
 * Read the host's listener for the island's failures.
 *
 * @returns The listener of the nearest `<PciFailures>`, or one that hears nothing.
 */
export const usePciFailed = (): OnPciFailed => use(PciFailuresContext);
