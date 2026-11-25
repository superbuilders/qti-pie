/**
 * The vocabularies the refusal suite's boxes are drawn from: the domain itself, never cases a
 * person chose.
 *
 * @module
 */
import { dictionary } from "@bjornpagen/testing/dictionary";
import type { ReaderRefusal } from "@qti-pie/crust/errors.ts";

/**
 * Every rule crust's reader refuses a document under (`ReaderRefusal`'s `rule`), each keyed by
 * itself: the record is keyed by the rule's type, so a rule the reader gains is a type error here
 * until it is named.
 */
const readerRuleNames: { readonly [R in ReaderRefusal["rule"]]: R } = {
  decode: "decode",
  "element-depth": "element-depth",
  "encoding-mismatch": "encoding-mismatch",
  "entity-cycle": "entity-cycle",
  "entity-expansion": "entity-expansion",
  nul: "nul",
  "undeclared-entity": "undeclared-entity",
  "unsupported-encoding": "unsupported-encoding",
};

/**
 * The first of {@link readerRuleNames}, and the rest.
 */
const { decode, ...laterReaderRules } = readerRuleNames;

/**
 * Every rule crust's reader refuses a document under, as a dictionary.
 */
export const readerRules = dictionary<ReaderRefusal["rule"]>([
  decode,
  ...Object.values(laterReaderRules),
]);
