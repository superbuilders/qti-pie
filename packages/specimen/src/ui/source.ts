/**
 * What plate's UI suite reads of an item's QTI XML, as its author wrote it: the identifiers each
 * interaction offers the candidate, the kinds of interaction it holds, and whether its response
 * processing is a template whose score the suite predicts.
 *
 * Test support for plate's UI suite under `src/ui/`. It parses the XML with linkedom's
 * `DOMParser`, from the library that reads the suite's pages, and reads elements by their QTI
 * names.
 *
 * @module
 */
import { collapseXmlSpace } from "@qti-pie/plate";
import { Option } from "effect";
import { parseHTML } from "linkedom";
import { interactionKinds } from "#specimen/ui/rendered.ts";
import type { InteractionKind } from "#specimen/ui/rendered.ts";
import type { Scoring } from "#specimen/ui/rules.ts";

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
  readonly scoring: Scoring;
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
 * The URI prefixes QTI 3 publishes its response-processing templates under.
 *
 * @see https://www.imsglobal.org/spec/qti/v3p0/impl#h.response-processing-templates
 */
const templatePrefixes = [
  "https://purl.imsglobal.org/spec/qti/v3p0/rptemplates/",
  "https://www.imsglobal.org/question/qti_v3p0/rptemplates/",
] as const;

/**
 * The templates that hold `match_correct`'s rules: `match_correct` and Common Cartridge's
 * `CC2_match`.
 */
const matchCorrectNames = ["match_correct", "CC2_match"] as const;

/**
 * Give how an item's responses are scored: `match-correct` when its `qti-response-processing`
 * holds no rules of its own, which would take precedence, and its `template`, an `xs:anyURI`
 * collapsed of white space, is a template of `match_correct`'s rules, with or without `.xml`;
 * otherwise `unpredicted`.
 *
 * @param processing The item's `qti-response-processing`, none when it has none.
 * @returns How it is scored.
 */
const scoringOf = (processing: Option.Option<Element>): Scoring => {
  const template = processing.pipe(
    Option.flatMap((element) =>
      element.children.length === 0
        ? Option.fromNullishOr(element.getAttribute("template"))
        : Option.none(),
    ),
    Option.map(collapseXmlSpace),
  );
  const names = new Set(
    templatePrefixes.flatMap((prefix) =>
      matchCorrectNames.flatMap((name) => [`${prefix}${name}`, `${prefix}${name}.xml`]),
    ),
  );

  return Option.exists(template, (uri) => names.has(uri))
    ? { kind: "match-correct" }
    : { kind: "unpredicted" };
};

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
    scoring: scoringOf(Option.fromNullishOr(document.querySelector("qti-response-processing"))),
  };
};
