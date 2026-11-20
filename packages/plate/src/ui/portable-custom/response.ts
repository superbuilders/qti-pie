/**
 * A Portable Custom Interaction's (Q-16) response between the PCI and the host's `<Responses>`:
 * the Appendix C JSON a PCI speaks, read and written by `#plate/pci/json.ts`, and the texts the
 * host's form posts, plate's lexical forms, written and read by `#plate/form/encoding.ts` under
 * the binding the server gives the response. So what the PCI says is what the form posts, by the
 * same two codecs the server decodes it with.
 *
 * The module is imported by client modules only.
 *
 * @module
 */
import { Result } from "effect";
import { decode, encode } from "#plate/form/encoding.ts";
import type { Binding, PostedBaseType } from "#plate/form/encoding.ts";
import { nullOf, nullRecord } from "#plate/model/values.ts";
import type { ResponseValue } from "#plate/model/values.ts";
import { toPciJson } from "#plate/pci/json.ts";
import type { PciJson, PciJsonRecordDeclared, PciJsonValueDeclared } from "#plate/pci/json.ts";

/**
 * How a PCI's response posts, as the server's posting of it binds it: a value of a base type the
 * form posts as text, `file` aside, of a `single`, `multiple` or `ordered` declaration; or a
 * record, which posts its `stringValue` field. A response of any other declaration posts nothing
 * from the island, so the server gives its PCI no island.
 */
export type PostedAs =
  | PciJsonRecordDeclared
  | (PciJsonValueDeclared & { readonly baseType: Exclude<PostedBaseType, "file"> });

/**
 * The entry name the island's binding reads and writes under: any name serves, since the texts
 * travel without it and `useResponse` names them.
 */
const entry = "response";

/**
 * Give the form binding a response posts under, named {@link entry}.
 *
 * @param posted How the response posts.
 * @returns The binding.
 */
const bindingOf = (posted: PostedAs): Binding =>
  posted.cardinality === "record"
    ? { cardinality: "record", name: entry }
    : { baseType: posted.baseType, cardinality: posted.cardinality, name: entry };

/**
 * Write a value the JSON binding read from a PCI's response as the texts the form posts.
 *
 * @param value The value, of the response's declaration.
 * @param posted How the response posts.
 * @returns The texts, none for NULL, each value one in plate's lexical form.
 */
export const textsOf = (value: ResponseValue, posted: PostedAs): readonly string[] =>
  encode(value, bindingOf(posted)).map(([, text]) => text);

/**
 * Write the texts a response holds as the JSON a PCI is bound to, its `boundTo`.
 *
 * @param texts The response's texts, as the host's `<Responses>` holds them.
 * @param posted How the response posts.
 * @returns The value's JSON; the NULL form of the declaration's cardinality when the texts hold
 *   no value, or none the binding reads.
 */
export const boundOf = (texts: readonly string[], posted: PostedAs): PciJson =>
  toPciJson(
    Result.getOrElse(
      decode(
        texts.map((text) => [entry, text] as const),
        bindingOf(posted),
      ),
      (): ResponseValue =>
        posted.cardinality === "record" ? nullRecord : nullOf(posted.baseType, posted.cardinality),
    ),
  );
