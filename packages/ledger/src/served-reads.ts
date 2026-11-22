/**
 * The reads an item is opened from, `@qti-pie/ledger/served-reads.ts`: an item document of the
 * database with what opening it reads ({@link itemRowsOf}), the files a document names that the
 * application serves and withholds, and the stimuli an item's refs name, each with its own. Each is
 * a query over pantry's package-media level (`QtiMedia`), concrete, so every application's own
 * reads attach the same builders, whatever level of its own it reads over, and the rows they
 * deliver are `#ledger/served-item.ts`'s `ItemRows` and `DocumentRead` as they are.
 *
 * @module
 */
import { query, v } from "@bjornpagen/grizzle";
import type { InputOrigin, Term } from "@bjornpagen/grizzle";
import { documentScanOf } from "@qti-pie/pantry/export/scan.ts";
import { QtiMedia } from "@qti-pie/pantry/qti/media.ts";

const { ObjectIdentifier, ReferencePath, ServedFile, WithheldFile } = QtiMedia.relations;

/**
 * A parent variable of a text field: a document key's `package` or `path`, as `attach` mints it
 * from a parent's head. It is concrete, never a type parameter, as pantry's `documentScanOf` takes
 * it, so a match on it fixes its field in the evidence the attachments read.
 */
type TextInput = Term<string, unknown, InputOrigin, "text">;

/**
 * A document's key as parent variables: its package's name and its path.
 */
export interface DocumentInput {
  readonly package: TextInput;
  readonly path: TextInput;
}

/**
 * Read each media file a document names that the application serves, by its path and the
 * SHA-256 of its bytes, which the application's content-addressed store and its address name it by:
 * pantry's `ServedFile`, every file a reference, an image candidate of a `srcset` or a text
 * reference of the document resolves to in the package, of an extension the media policy lists.
 *
 * @param document The document's key.
 * @returns The files, by path, an `"array"` attachment.
 */
export const filesOf = (document: DocumentInput) =>
  query(QtiMedia).rule((r) => {
    const { digest, target } = v(ServedFile, "served");

    return r
      .match(ServedFile, { digest, package: document.package, path: document.path, target })
      .find({ digest, path: target });
  });

/**
 * Read each media file a document names that the application withholds, by its path: pantry's
 * `WithheldFile`, of an extension the media policy does not list. The store serves none of them,
 * and plate renders the document without each (QTI 3.0 Conformance §3, "ignore or remove the
 * unsupported data").
 *
 * @param document The document's key.
 * @returns The files, by path, an `"array"` attachment.
 */
export const withheldOf = (document: DocumentInput) =>
  query(QtiMedia).rule((r) => {
    const { target } = v(WithheldFile, "withheld");

    return r
      .match(WithheldFile, { package: document.package, path: document.path, target })
      .find({ path: target });
  });

/**
 * Read the stimulus documents an item document's `qti-assessment-stimulus-ref`s name in its
 * package, each once, by its path, with the files it names that the application serves
 * ({@link filesOf}) and withholds ({@link withheldOf}), and its rows, pantry's `documentScanOf`,
 * which pantry's `documentXml` writes back as its XML. A ref's `href` resolved in the package is
 * its `ReferencePath`, whose target pantry's law "Stimulus ref target" holds to a document whose
 * root is a `qti-assessment-stimulus`, so every row is a stimulus document; a ref whose `href`
 * names no file of the package has none. A set, by path: two refs naming one stimulus read it
 * once.
 *
 * @param item The item document's key.
 * @returns Each stimulus's read, an `"array"` attachment.
 * @see QTI 3.0.1 information model §7.6: "the Item uses the 'qti-assessment-stimulus-ref'
 *   structure to provide the link between the Item and the Stimulus"; §4.3: "this shared stimulus
 *   content must be supplied in the same context for each of the Assessment Items that make use of
 *   it".
 */
export const stimuliOf = (item: DocumentInput) =>
  query(QtiMedia)
    .rule((r) => {
      const { package: pkg, target } = v(ReferencePath, "stimulus");

      return r
        .match(ReferencePath, {
          kind: "qti-assessment-stimulus-ref",
          name: "href",
          package: pkg,
          path: item.path,
          target,
        })
        .where(r.eq(pkg, item.package))
        .find({ package: pkg, path: target });
    })
    .attach("files", (stimulus) => filesOf(stimulus), "array")
    .attach("withheld", (stimulus) => withheldOf(stimulus), "array")
    .attach("document", (stimulus) => documentScanOf(stimulus), "array");

/**
 * Read an item document as opening it reads it, its `ItemRows`: its package and path, its item's
 * QTI `identifier`, the root element's, the files it names that the application serves and
 * withholds, its rows, and the stimuli its refs name, each with its own. An application attaches it
 * under its own read of the item it serves, so the item's content is part of that read's one
 * statement.
 *
 * @param item The item document's key.
 * @returns The item's read, an `"array"` attachment of at most one row.
 */
export const itemRowsOf = (item: DocumentInput) =>
  query(QtiMedia)
    .rule((r) => {
      const { package: pkg, path, value: identifier } = v(ObjectIdentifier, "identifier");

      return r
        .match(ObjectIdentifier, { package: pkg, path, value: identifier })
        .where(r.eq(pkg, item.package), r.eq(path, item.path))
        .find({ identifier, package: pkg, path });
    })
    .attach("files", (found) => filesOf(found), "array")
    .attach("withheld", (found) => withheldOf(found), "array")
    .attach("document", (found) => documentScanOf(found), "array")
    .attach("stimuli", (found) => stimuliOf(found), "array");
