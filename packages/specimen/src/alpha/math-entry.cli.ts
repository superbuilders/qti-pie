/**
 * The math entry's field as a command: key sequences in, the LaTeX the field leaves for each out,
 * for a grader's suite that checks every LaTeX a child can post grades as AlphaTest graded it.
 *
 * ```console
 * $ printf '%s\n' '[{"keycap":"\\frac{▢}{▢}"},{"typed":"3"}]' | node src/alpha/math-entry.cli.ts
 * {"keys":[{"keycap":"\\frac{▢}{▢}"},{"typed":"3"}],"latex":"\\frac{▢}{▢}3"}
 * $ node src/alpha/math-entry.cli.ts --draw 1000 --seed 7
 * ```
 *
 * With no flags it reads standard input, one key sequence per line as JSON (`KeySequenceSchema` in
 * `#specimen/alpha/math-entry.ts`: each key `{"keycap": <latex or label>}`, `{"typed":
 * <character>}` or `{"pressed": <key>}`), and writes one line per sequence, in the same order:
 * `{"keys": [...], "latex": "..."}`. With `--draw <count>` it draws that many sequences over every
 * key a child has on the keyboard (`keySequenceOn`), from the stream `--seed <integer>` fixes (0
 * when absent), and writes the same lines, so a seed reproduces its sequences. It types on one
 * field per core at once.
 *
 * @module
 */
import { availableParallelism } from "node:os";
import { text } from "node:stream/consumers";
import { parseArgs } from "node:util";
import { floorSeed, rotatingSeed } from "@bjornpagen/testing/random";
import { sample } from "@bjornpagen/testing/source";
import { Effect, Result, Schema } from "effect";
import {
  KeySequenceSchema,
  keyboards,
  keySequenceOn,
  mathEntryFields,
  setupOf,
  typedAll,
} from "#specimen/alpha/math-entry.ts";
import type { MathEntryKey } from "#specimen/alpha/math-entry.ts";

/**
 * Decode one line of standard input as a key sequence.
 */
const decodeLine = Schema.decodeUnknownEffect(Schema.fromJsonString(KeySequenceSchema));

const { values } = parseArgs({
  options: { draw: { type: "string" }, keyboard: { type: "string" }, seed: { type: "string" } },
  strict: true,
});

/**
 * The keyboard the sequences are typed on: plate's unless `--keyboard alphatest` names AlphaTest's.
 */
const keyboard = Schema.decodeUnknownSync(Schema.Literals(keyboards))(values.keyboard ?? "plate");

/**
 * The key sequences to type: drawn, or read from standard input.
 */
const sequences: Effect.Effect<readonly (readonly MathEntryKey[])[], Schema.SchemaError> =
  values.draw === undefined
    ? Effect.flatMap(
        Effect.promise(() => text(process.stdin)),
        (input) =>
          Effect.forEach(
            input.split("\n").filter((line) => line.trim() !== ""),
            (line) => decodeLine(line),
          ),
      )
    : Effect.succeed(
        sample(
          keySequenceOn(keyboard),
          rotatingSeed(Number(values.seed ?? "0"), floorSeed("specimen/math-entry")),
          Number(values.draw),
        ),
      );

await Effect.runPromise(
  Effect.scoped(
    Effect.gen(function* run() {
      const keys = yield* sequences;
      const fields = yield* mathEntryFields(
        Math.min(availableParallelism(), keys.length),
        setupOf(keyboard),
      );
      const typed = yield* typedAll(fields, keys);

      for (const [sequence, result] of keys.map((each, at) => [each, typed[at]] as const)) {
        const line =
          result === undefined
            ? { error: "not typed", keys: sequence }
            : Result.match(result, {
                onFailure: (failure) => ({ error: failure.message, keys: sequence }),
                onSuccess: (latex) => ({ keys: sequence, latex }),
              });

        process.stdout.write(`${JSON.stringify(line)}\n`);
      }
    }),
  ),
);
