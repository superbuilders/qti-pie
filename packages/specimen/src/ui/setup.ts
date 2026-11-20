/**
 * The UI suite's setup in each worker: it refuses to run a case in a worker Node started without
 * the hardened flags (`#specimen/ui/hardened.ts`).
 *
 * @module
 */
import { requireHardened } from "#specimen/ui/hardened.ts";

requireHardened();
