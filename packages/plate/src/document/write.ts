/**
 * The adapter from a built XML tree to the shared XML writer, beside `read.ts`, which reads through
 * the shared reader.
 *
 * This is the only module that imports `@qti-pie/crust/write.ts`: a caller builds crust's element
 * tree, namespace declarations included, and gets the document's text back.
 *
 * @module
 */
import type { WriteRefusal } from "@qti-pie/crust/errors.ts";
import type { Element, XmlDeclaration } from "@qti-pie/crust/tree.ts";
import { writeXmlText } from "@qti-pie/crust/write.ts";
import { Option } from "effect";
import type { Result } from "effect";

/**
 * The declaration every written document opens with: XML 1.0, encoded in UTF-8.
 */
const declaration: XmlDeclaration = {
  encoding: Option.some("utf-8"),
  standalone: Option.none(),
  version: "1.0",
};

/**
 * Write a document whose root is `root`, after the XML declaration and with nothing else around it.
 *
 * Every element and attribute is written by its `qname`, so the tree carries the namespace
 * declarations its names need, as the reader's tree does. Every character is written as itself and
 * the declaration names `utf-8`, so a host stores or serves the text encoded as UTF-8, and no
 * encoder threshold applies, so writing fails only for a tree no XML 1.0 text can write.
 *
 * @param root The document's root element.
 * @returns The document's text: the declaration, a line feed, then the root; or crust's
 *   `WriteRefusal` naming the construct and the rule of XML 1.0 it breaks.
 */
export const writeDocument = (root: Element): Result.Result<string, WriteRefusal> =>
  writeXmlText({
    charset: "utf-8",
    declaration: Option.some(declaration),
    epilog: [],
    prolog: [],
    root,
  });
