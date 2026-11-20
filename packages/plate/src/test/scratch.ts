/**
 * The package's folders plate's tests read and write: the fixture files they open
 * ({@link fixturesDirectory}) and the scratch folders they write to ({@link scratchFolder}).
 *
 * @module
 */
import { mkdirSync, mkdtempSync } from "node:fs";
import path from "node:path";

/**
 * The package's `fixtures/` folder, which holds the item and package files plate's tests open.
 */
export const fixturesDirectory = path.resolve(import.meta.dirname, "..", "..", "fixtures");

/**
 * The package's git-ignored `work/` folder, where every scratch folder lives.
 */
const workDirectory = path.resolve(import.meta.dirname, "..", "..", "work");

/**
 * Make a scratch folder a test run owns, under the package's git-ignored `work/`.
 *
 * `mkdtemp` names it: the prefix and six characters it picks, and it creates the folder only under
 * a name no folder holds, so two runs at once never share or remove each other's files. The run
 * removes the folder when it ends.
 *
 * @example
 *   scratchFolder("caches-test-"); // "<package>/work/caches-test-Xk3d9Q", created
 *
 * @param prefix The start of the folder's name.
 * @returns The folder's absolute path.
 */
export const scratchFolder = (prefix: string): string => {
  mkdirSync(workDirectory, { recursive: true });

  return mkdtempSync(path.join(workDirectory, prefix));
};
