/**
 * Scratch folders for tests, under the package's git-ignored `work/`. Each run's folder is a
 * prefix the test chooses and a random suffix, so two runs of a suite at once (the sentinel's, a
 * lane's) never write, read or remove each other's files, and it is removed when the run is done
 * with it.
 */
import { mkdirSync, mkdtempSync, rmSync } from "node:fs";
import path from "node:path";
import { afterAll } from "@effect/vitest";
import { Effect, FileSystem } from "effect";

/**
 * `packages/pantry/work`, which git ignores.
 */
export const workRoot = path.resolve(import.meta.dirname, "..", "..", "work");

/**
 * Make a fresh folder `work/<prefix><random>` for one test, removed with everything in it when the
 * scope closes.
 *
 * @param prefix - The folder's name before its random suffix, naming the test that writes it, as
 *   `xsd-lexical-`.
 * @returns The folder's absolute path.
 */
export const scratchDirectory = Effect.fn("test.scratch.directory")(function* scratchDirectory(
  prefix: string,
) {
  const fs = yield* FileSystem.FileSystem;

  yield* fs.makeDirectory(workRoot, { recursive: true });

  return yield* fs.makeTempDirectoryScoped({ directory: workRoot, prefix });
});

/**
 * Make a fresh folder `work/<prefix><random>` when a test file loads, for a file whose cases share
 * one folder, and remove it with everything in it after the file's last test. It is synchronous so
 * a file can name it in a module-level constant, as the CLI tests' environments do.
 *
 * @param prefix - The folder's name before its random suffix, naming the file that owns it, as
 *   `cli-export-`.
 * @returns The folder's absolute path.
 */
export const fileScratchDirectory = (prefix: string): string => {
  mkdirSync(workRoot, { recursive: true });

  const folder = mkdtempSync(path.join(workRoot, prefix));

  afterAll(() => {
    rmSync(folder, { force: true, recursive: true });
  });

  return folder;
};

/**
 * The environment that gives a CLI run a scratch home and names a server that is not there, so a
 * step that needs the database fails with kind `config` and reaches no server.
 */
type ScratchEnv = Readonly<{
  /**
   * The run's home, so it never reads the real one.
   */
  HOME: string;
  /**
   * A CA file that does not exist, so a step that needs the database fails with kind `config`.
   */
  QTI_PIE_PG_CA: string;
  /**
   * A port no server listens on.
   */
  QTI_PIE_PG_PORT: string;
  /**
   * A folder of the logins' password files that holds none.
   */
  QTI_PIE_PG_SECRETS: string;
  /**
   * The run's media store, under its home.
   */
  QTI_PIE_MEDIA: string;
}>;

/**
 * The scratch environment under `root`: a `home` folder there, with the run's media store in it, a
 * CA file there that no run writes, and a password folder there that holds no file.
 *
 * @param root - The folder one test file owns for the run, from {@link fileScratchDirectory}.
 */
export const scratchEnv = (root: string): ScratchEnv => ({
  HOME: path.join(root, "home"),
  QTI_PIE_MEDIA: path.join(root, "home", "media-store"),
  QTI_PIE_PG_CA: path.join(root, "no-such-ca.crt"),
  QTI_PIE_PG_PORT: "1",
  QTI_PIE_PG_SECRETS: path.join(root, "no-secrets"),
});

/**
 * Make the scratch home of `env`.
 */
export const makeScratch = Effect.fn("test.scratch.make")(function* makeScratch(env: ScratchEnv) {
  const fs = yield* FileSystem.FileSystem;

  yield* fs.makeDirectory(env.HOME, { recursive: true });
});
