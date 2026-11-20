/**
 * Records the golden grading data: what today's grader, plate as the QTI app runs it, gives every
 * generated case of every item the bank and the corpus hold. The database grader is held to it
 * after plate's grader is gone, so the proof outlives the code it proves.
 *
 * ```sh
 * node packages/qti-pie/packages/plate/scripts/golden.ts [--out <dir>] [--set <name>]… [--processes <n>]
 * ```
 *
 * `--out` is the directory written, and it is replaced. Left out, the recording is kept under its
 * own digest, `~/.cache/qti-pie/grading-golden/<digest>`, the directory `src/test/golden.ts` reads
 * for the digest it pins: it is recorded into `grading-golden/recording.<pid>` and moved there once
 * its digest is known, replacing an earlier recording of the same digest, so recordings of other
 * pins stay beside it and each commit reads its own. `--set` names a source to record (`sources` in
 * `golden/sources.ts`), every one when left out. `--processes` names how many child processes
 * record, one shard of the items each, the machine's available parallelism when left out; each
 * renders its reviews in a Vite server of its own.
 *
 * It writes, under the directory:
 *
 * - `<set>.jsonl`: one line per item document, in code-point order of its package then path (a
 *   `GoldenItem` of `golden/record.ts`), each scored attempt with the marks its review draws
 *   (`golden/review.ts`);
 * - `documents/<set>/<package>/<path>`: each document recorded, byte for byte, so the golden data
 *   carries the content it was recorded from;
 * - `SHA256SUMS`: every file above with its SHA-256, in code-point order of its path.
 *
 * It prints the SHA-256 of `SHA256SUMS`, the one digest a suite pins the golden data by. The data
 * holds the bank's secure content and answer keys, so it never enters the repository.
 *
 * @module
 */
import { fork } from "node:child_process";
import { createHash } from "node:crypto";
import { once } from "node:events";
import { mkdir, readFile, readdir, rename, rm, writeFile } from "node:fs/promises";
import { availableParallelism, homedir } from "node:os";
import path from "node:path";
import { parseArgs } from "node:util";
import { Effect } from "effect";
import { recordItem } from "#scripts/golden/record.ts";
import { loadReview } from "#scripts/golden/review.ts";
import { assetsFor, filesOf, itemsOf, sources } from "#scripts/golden/sources.ts";
import type { Source } from "#scripts/golden/sources.ts";

/**
 * The directory that keeps each recording under its digest, when `--out` is left out.
 */
const recordings = path.join(homedir(), ".cache/qti-pie/grading-golden");

/**
 * The parsed command line.
 */
const { values: options } = parseArgs({
  options: {
    out: { type: "string" },
    processes: { type: "string" },
    set: { multiple: true, type: "string" },
    shard: { type: "string" },
    shards: { type: "string" },
  },
});

/**
 * The directory written: `--out`, else this run's own directory beside the recordings, which
 * {@link keptUnderDigest} moves under its digest.
 */
const out = path.resolve(options.out ?? path.join(recordings, `recording.${String(process.pid)}`));

/**
 * The directory the shards write into before the merge.
 */
const work = path.join(out, "work");

/**
 * The sources recorded: those `--set` names, every one when it names none.
 */
const chosen: readonly Source[] =
  options.set === undefined
    ? sources
    : sources.filter((source) => options.set?.includes(source.set) === true);

/**
 * Give the SHA-256 of some bytes or text, in hexadecimal.
 *
 * @param bytes The bytes, or text as UTF-8.
 * @returns The digest.
 */
const digestOf = (bytes: Uint8Array | string): string =>
  createHash("sha256").update(bytes).digest("hex");

/**
 * Compare two texts by code point, for a sort.
 *
 * @param left One text.
 * @param right The other.
 * @returns Negative, zero or positive as `left` sorts before, with or after `right`.
 */
const byCodePoint = (left: string, right: string): number =>
  Number(left > right) - Number(left < right);

/**
 * Write a file, its directory first.
 *
 * @param file The file.
 * @param bytes What it holds.
 * @returns Nothing, once it is written.
 */
const written = (file: string, bytes: Uint8Array | string) =>
  Effect.tryPromise(async () => {
    await mkdir(path.dirname(file), { recursive: true });
    await writeFile(file, bytes);
  });

/**
 * Record one shard of every chosen source's items into `work/<set>.<shard>`, one line per item:
 * its sort key (package, then path), a tab, then its golden line. The shard renders its reviews in
 * one Vite server of its own, closed once the shard is written.
 *
 * @param shard The shard, from 0.
 * @param shards How many shards there are.
 * @returns Nothing, once every shard file is written.
 */
const recordShard = (shard: number, shards: number) =>
  Effect.acquireUseRelease(
    Effect.tryPromise(() => loadReview(path.join(work, `vite.${String(shard)}`))),
    ({ api }) =>
      Effect.forEach(
        chosen,
        (source) =>
          Effect.flatMap(Effect.all([itemsOf(source), filesOf(source)]), ([items, files]) =>
            Effect.flatMap(
              Effect.forEach(
                items.filter((_, index) => index % shards === shard),
                (item) =>
                  Effect.map(
                    recordItem(item.place, item.bytes, {
                      api,
                      assets: assetsFor(files, item.place),
                    }),
                    (line) =>
                      `${item.place.package}\u0000${item.place.path}\t${JSON.stringify(line)}\n`,
                  ),
              ),
              (lines) => written(path.join(work, `${source.set}.${String(shard)}`), lines.join("")),
            ),
          ),
        { discard: true },
      ),
    ({ close }) => Effect.promise(close),
  );

/**
 * Run one shard in its own child process.
 *
 * @param shard The shard, from 0.
 * @param shards How many shards there are.
 * @returns Nothing, once the child exits with status 0; a failure otherwise.
 */
const runShard = (shard: number, shards: number) =>
  Effect.tryPromise(async () => {
    const child = fork(
      import.meta.filename,
      [
        "--out",
        out,
        "--shard",
        String(shard),
        "--shards",
        String(shards),
        ...chosen.flatMap((source) => ["--set", source.set]),
      ],
      { stdio: "inherit" },
    );
    await once(child, "exit");

    if (child.exitCode !== 0) {
      throw new Error(
        `Shard ${String(shard)} of ${String(shards)} exited with ${String(child.exitCode)}.`,
      );
    }
  });

/**
 * Merge one source's shard files into `<set>.jsonl` and copy its documents.
 *
 * @param source The source.
 * @returns The `SHA256SUMS` lines of the files it wrote.
 */
const mergeSource = (source: Source) =>
  Effect.gen(function* mergeSet() {
    const names = yield* Effect.tryPromise(() => readdir(work));
    const texts = yield* Effect.forEach(
      names.filter((name) => name.startsWith(`${source.set}.`)),
      (name) => Effect.tryPromise(() => readFile(path.join(work, name), "utf-8")),
    );
    const keyed = texts
      .flatMap((text) => text.split("\n"))
      .filter((line) => line !== "")
      .map((line) => {
        const tab = line.indexOf("\t");

        return { json: line.slice(tab + 1), key: line.slice(0, tab) };
      })
      .toSorted((left, right) => byCodePoint(left.key, right.key));
    const jsonl = keyed.map((line) => `${line.json}\n`).join("");
    const items = yield* itemsOf(source);
    const copies = yield* Effect.all(
      items.map((item) => {
        const relative = path.join("documents", source.set, item.place.package, item.place.path);

        return Effect.as(
          written(path.join(out, relative), item.bytes),
          `${digestOf(item.bytes)}  ${relative}`,
        );
      }),
    );

    yield* written(path.join(out, `${source.set}.jsonl`), jsonl);

    return [`${digestOf(jsonl)}  ${source.set}.jsonl`, ...copies];
  });

/**
 * Record every chosen source in shards, merge them, and write `SHA256SUMS`.
 *
 * @param processes How many shards, one child process each.
 * @returns The SHA-256 of `SHA256SUMS`.
 */
const recordAll = (processes: number) =>
  Effect.gen(function* record() {
    yield* Effect.tryPromise(() => rm(out, { force: true, recursive: true }));
    yield* Effect.forEach(
      Array.from({ length: processes }, (_, shard) => shard),
      (shard) => runShard(shard, processes),
      { concurrency: "unbounded", discard: true },
    );

    const sums = yield* Effect.all(chosen.map(mergeSource));
    const listed = `${sums
      .flat()
      .toSorted((left, right) => byCodePoint(left.slice(66), right.slice(66)))
      .join("\n")}\n`;

    yield* Effect.tryPromise(() => rm(work, { force: true, recursive: true }));
    yield* written(path.join(out, "SHA256SUMS"), listed);

    return digestOf(listed);
  });

/**
 * Move the recording under its digest beside the other recordings, replacing an earlier recording
 * of the same digest, which holds the same bytes.
 *
 * @param digest The SHA-256 of its `SHA256SUMS`.
 * @returns Nothing, once it is moved.
 */
const keptUnderDigest = (digest: string) =>
  Effect.gen(function* keep() {
    const kept = path.join(recordings, digest);
    yield* Effect.tryPromise(() => rm(kept, { force: true, recursive: true }));
    yield* Effect.tryPromise(() => rename(out, kept));
  });

if (options.shard !== undefined && options.shards !== undefined) {
  await Effect.runPromise(recordShard(Number(options.shard), Number(options.shards)));
} else {
  const digest = await Effect.runPromise(
    recordAll(Number(options.processes ?? availableParallelism())),
  );

  if (options.out === undefined) {
    await Effect.runPromise(keptUnderDigest(digest));
  }

  process.stdout.write(`golden ${digest}\n`);
}
