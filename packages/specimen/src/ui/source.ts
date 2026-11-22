/**
 * What plate's UI suite reads of an item's QTI XML, as its author wrote it: the identifiers each
 * interaction offers the candidate and the kinds of interaction it holds.
 *
 * Test support for plate's UI suite under `src/ui/`. It parses the XML with linkedom's
 * `DOMParser`, from the library that reads the suite's pages, and reads elements by their QTI
 * names.
 *
 * @module
 */
import { parseHTML } from "linkedom";
import { interactionKinds } from "#specimen/ui/rendered.ts";
import type { InteractionKind } from "#specimen/ui/rendered.ts";

/**
 * What the suite reads of an item's XML.
 */
export interface ItemFacts {
  /**
   * The kind of every interaction the XML holds, in document order.
   */
  readonly kinds: readonly InteractionKind[];
  /**
   * The identifiers each interaction offers the candidate, by the response it binds.
   */
  readonly offered: ReadonlyMap<string, readonly string[]>;
}

/**
 * The DOM's `DOMParser`, as linkedom's window gives it, typed as the DOM's own.
 */
const { DOMParser: XmlParser } = parseHTML("<!doctype html><html></html>");

/**
 * Each kind by the QTI element that writes it, `qti-<kind>-interaction`.
 */
const kindsByElement: ReadonlyMap<string, InteractionKind> = new Map(
  interactionKinds.map((kind) => [`qti-${kind}-interaction`, kind] as const),
);

/**
 * Read the facts of an item's XML.
 *
 * @param xml The item's XML text.
 * @returns Its facts: every interaction's kind, by the QTI element that writes it, and the
 *   `identifier` of every element inside one (its choices, hotspots, gaps, gap texts and
 *   hottexts), by the response its `response-identifier` names, in document order and each once.
 */
export const itemFactsOf = (xml: string): ItemFacts => {
  const document = new XmlParser().parseFromString(xml, "text/xml");
  const interactions = [...document.querySelectorAll("[response-identifier]")].flatMap(
    (element) => {
      const kind = kindsByElement.get(element.localName);

      return kind === undefined ? [] : [{ element, kind }];
    },
  );
  const offered = new Map<string, readonly string[]>();

  for (const { element } of interactions) {
    const response = element.getAttribute("response-identifier") ?? "";
    const identifiers = [...element.querySelectorAll("[identifier]")].map(
      (inside) => inside.getAttribute("identifier") ?? "",
    );

    offered.set(response, [...new Set([...(offered.get(response) ?? []), ...identifiers])]);
  }

  return {
    kinds: interactions.map(({ kind }) => kind),
    offered,
  };
};
