/**
 * The six published response-processing templates (information model §2.5.1, reading 51), read from
 * their published files (`packages/processing/templates/`) by crust, as the element trees the
 * compiler reads: what `#processing/templates.generated.ts` holds, which `templates.test.ts` holds
 * to these files and `tools/generate-templates.ts` writes.
 *
 * @module
 */
import path from "node:path";
import { Effect, FileSystem } from "effect";
import { readXml } from "@qti-pie/crust/read.ts";
import type { Element } from "@qti-pie/crust/tree.ts";
import type { XmlElement, XmlNode } from "#processing/xml.ts";

/**
 * The templates' names, as their files are named.
 */
export const templateNames = [
  "CC2_map_response",
  "CC2_match",
  "CC2_match_basic",
  "map_response",
  "map_response_point",
  "match_correct",
] as const;

/**
 * The folder of the published files.
 */
const folder = path.resolve(import.meta.dirname, "..", "..", "templates");

/**
 * The compiler's view of a crust element: names, attributes and children, every other node kept by
 * its kind.
 *
 * @param element - The element.
 * @returns Its view.
 */
export const viewOf = (element: Element): XmlElement => ({
  attributes: element.attributes.map((attribute) => ({
    local: attribute.local,
    namespace: attribute.namespace,
    value: attribute.value,
  })),
  children: element.children.map((child): XmlNode => {
    if (child.kind === "element") {
      return viewOf(child);
    }

    return child.kind === "text" ? { kind: "text", value: child.value } : { kind: child.kind };
  }),
  kind: "element",
  local: element.local,
  namespace: element.namespace,
});

/**
 * Read every published template's file.
 *
 * @returns Each template's root element, by name.
 */
export const readTemplates = Effect.fn("test.readTemplates")(function* readTemplates() {
  const fs = yield* FileSystem.FileSystem;
  const trees: Record<string, XmlElement> = {};
  for (const name of templateNames) {
    const bytes = yield* fs.readFile(path.join(folder, `${name}.xml`));
    const document = yield* readXml(bytes);
    trees[name] = viewOf(document.root);
  }

  return trees;
});
