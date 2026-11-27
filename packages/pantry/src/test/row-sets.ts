/**
 * The one comparison of two XDM documents up to the order of their sets. An element's attributes
 * and namespace declarations have no position (XML Information Set §2.2, [attributes] and
 * [namespace attributes] unordered; spec reading `attribute-sets` as superseded on 2026-11-11), so
 * the read (`#pantry/model/assemble.ts`) lists them in an order of its own and the export
 * (`#pantry/model/unshred.ts`) in Canonical XML's. A round trip therefore compares documents as row
 * sets, never as trees whose lists carry an order no row states.
 */
import { Formatter } from "effect";
import { flatten } from "#pantry/model/xdm.ts";
import type { XdmDocument, XdmVocabulary } from "#pantry/model/xdm.ts";

/**
 * Write a document's rows as sets: each of `flatten`'s lists, each row written as text, in sorted
 * order, and the document row as it is. `flatten` writes every field the tree holds, so two
 * documents are one document exactly when their row sets are equal, whatever order either lists an
 * element's attributes and namespace declarations in.
 *
 * @param document - The document.
 * @returns Each list of the document's rows as sorted text, keyed by the list's name, and the
 *   document row.
 */
export const rowSetOf = <V extends XdmVocabulary>(document: XdmDocument<V>) =>
  Object.fromEntries(
    Object.entries(flatten(document)).map(([list, rows]) => [
      list,
      Array.isArray(rows) ? rows.map((row) => Formatter.format(row)).toSorted() : rows,
    ]),
  );
