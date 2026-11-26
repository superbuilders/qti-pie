/**
 * The Alpha truth: AlphaTest's own grader over Alpha's K-2 mastery-gate items (metis's K2 grader
 * map, frozen into the oracle's corpus as `k2/`). Each case is a scripted response to a canonical
 * QTI 3.0.1 item (the key, derived wrong answers, edges) and what AlphaTest's deployed grader
 * scored it on submit. Only a case the page can post is held to it: one whose entry the
 * interaction admits (`reachable`) and whose values read as their base type (`graded`). A case
 * the page cannot post is an impossible state of our one frontend, deleted rather than defended.
 *
 * @module
 */
import { Schema } from "effect";
import { RecordedValuesSchema } from "#processing-oracle/recording.ts";

/**
 * One scripted case of an item.
 */
const K2CaseSchema = Schema.Struct({
  case: Schema.String,
  expected: Schema.Struct({
    admission: Schema.Union([
      Schema.Literals(["graded", "undecodable"]),
      Schema.Struct({ refused: Schema.Array(Schema.String) }),
    ]),
    entry: Schema.Literals(["admitted", "refused"]),
    score: Schema.Number,
  }),
  id: Schema.String,
  kind: Schema.Literals(["blank", "derived-wrong", "edge", "key", "partial"]),
  qti: RecordedValuesSchema,
  reachable: Schema.Boolean,
});

/**
 * One scripted case.
 */
export type K2Case = typeof K2CaseSchema.Type;

/**
 * One item: its key in the map, its identifier, its XML and the SHA-256 of it, and its cases.
 */
const K2ItemSchema = Schema.Struct({
  cases: Schema.Array(K2CaseSchema),
  identifier: Schema.String,
  key: Schema.String,
  xml: Schema.String,
  xmlSha256: Schema.String,
});

/**
 * One item.
 */
export type K2Item = typeof K2ItemSchema.Type;

/**
 * The map's inputs, `k2/cases.json`.
 */
export const K2InputsSchema = Schema.Struct({
  items: Schema.Array(K2ItemSchema),
  schema: Schema.Literal("becky-k2-grader-harness/5"),
});

/**
 * What AlphaTest's grader gave one case on submit.
 */
const ObservedSchema = Schema.Struct({
  submit: Schema.Struct({
    ok: Schema.Literal(true),
    value: Schema.Struct({ score: Schema.Number }),
  }),
});

/**
 * AlphaTest's observations, `k2/alphatest.json`, by case id.
 */
export const K2ObservedSchema = Schema.Struct({
  cases: Schema.Record(Schema.String, ObservedSchema),
});

/**
 * Whether the page can post a case: its entry admitted and its values read as their base type.
 *
 * @param c The case.
 * @returns Whether the page posts it.
 */
export const postable = (c: K2Case): boolean => c.reachable && c.expected.admission === "graded";
