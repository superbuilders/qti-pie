import { toolchain } from "@bjornpagen/devtools/config";

/**
 * Qti-pie's toolchain, as far as qti-pie reads it: the packages that use no Effect.
 * oxlint.config.ts holds each to the effect-free rules (no Effect, Node module or platform SDK at
 * run time; no clock, timers, randomness, Promise, process or fetch), as grizzle holds its engine.
 * Its lint is qti-pie's own, so it rejects no preset rule and runs no pack.
 */
export default toolchain({
  bannedPackages: [],
  effectFree: ["packages/processing"],
  exceptions: [],
  packs: {},
  rejected: { diagnostics: {}, rules: {} },
});
