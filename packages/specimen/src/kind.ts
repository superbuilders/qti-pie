/**
 * What a kind is to the specimen: its own dimensions, the settings it draws from them, the markup
 * it writes for them, and the responses they admit. Each kind is one file under `src/kinds/` and
 * one entry of the record in `src/kinds/index.ts`; the item around it (stimulus, prompt, layout,
 * feedback, session control) is the specimen's, never a kind's.
 *
 * @module
 */
import type { Option } from "effect";
import { map } from "@bjornpagen/testing/gen";
import type { Gen } from "@bjornpagen/testing/gen";
import type { HostFacts } from "@qti-pie/plate";
import type { Answers } from "#specimen/answer.ts";
import { picker } from "#specimen/dimension.ts";
import type { DimensionsOf, Picker, Query } from "#specimen/dimension.ts";
import type { Asset } from "#specimen/picture.ts";

/**
 * What the item gives a kind to write: its prompt's content, flow markup, or none when the case
 * has no prompt. A kind with a `qti-prompt` writes it there; one with none (an inline
 * interaction, a Position Object stage) writes it before its own content.
 */
export interface Context {
  readonly prompt: Option.Option<string>;
}

/**
 * How an item scores a kind's responses: response rules that add each response's credit to
 * `SCORE`, a float that starts at 0, and the most they give together, which the right response
 * scores; or no rules, so `SCORE` stays 0. The rules are written in place, never as a template, so
 * the item's feedback rule can follow them.
 */
export type Scoring =
  | { readonly kind: "scored"; readonly most: number; readonly rules: readonly string[] }
  | { readonly kind: "unscored" };

/**
 * What a kind writes for its settings: its response declarations, its markup for the item body,
 * how the item scores it, the files that markup names, and what the host must know to render it.
 */
export interface Written {
  readonly assets: readonly Asset[];
  readonly body: string;
  readonly declarations: readonly string[];
  readonly host: Option.Option<HostFacts>;
  readonly scoring: Scoring;
}

/**
 * A kind as its file declares it. `M` maps each of its dimension's names to its values, and `S`
 * is its settings.
 *
 * - `dimensions`: its own, keyed in the lab's address as `<kind>.<name>`.
 * - `settings`: a generator of its settings, drawing each dimension through `pick`, and only the ones
 *   its settings reach, so an enumeration of its cases holds no two alike. Everything else (which
 *   choice is right, the text, the identifiers) is a fixed function of the settings.
 * - `write`: its markup, declarations, scoring and files. Response identifiers are its own, never
 *   `SCORE`, `MAXSCORE` or `FEEDBACK`, which the item declares.
 * - `answers`: every response its settings admit, each once, with what the form posts and the score.
 */
interface Declared<M, S> {
  readonly answers: (settings: S) => Answers;
  readonly dimensions: DimensionsOf<M>;
  readonly label: string;
  readonly settings: (pick: Picker<M>) => Gen<S>;
  readonly write: (settings: S, context: Context) => Written;
}

/**
 * The description's interaction: a kind's name and its settings.
 */
export interface Arm<K, S> {
  readonly kind: K;
  readonly settings: S;
}

/**
 * One kind of interaction, named `K`, as the record of kinds holds it: what its file declares,
 * and its arm drawn under a query.
 */
export interface Kind<K extends string, M, S> {
  readonly answers: (settings: S) => Answers;
  readonly arm: (held: Query) => Gen<Arm<K, S>>;
  readonly dimensions: DimensionsOf<M>;
  readonly label: string;
  readonly name: K;
  readonly write: (settings: S, context: Context) => Written;
}

/**
 * Declare a kind. Its dimensions' values and its settings are inferred from what it writes:
 * annotate the settings parameter of `answers` and `write`, which come before `settings` in key
 * order, and the return of the generator `settings` gives.
 *
 * @param name The kind's name, its key in the record of kinds and its value in the lab's address.
 * @param declared The kind.
 * @returns The kind.
 */
export const kind = <const K extends string, M, S>(
  name: K,
  declared: Declared<M, S>,
): Kind<K, M, S> => ({
  answers: declared.answers,
  arm: (held) =>
    map(
      declared.settings(picker({ kind: "interaction", name }, declared.dimensions, held)),
      (settings) => ({ kind: name, settings }),
    ),
  dimensions: declared.dimensions,
  label: declared.label,
  name,
  write: declared.write,
});
