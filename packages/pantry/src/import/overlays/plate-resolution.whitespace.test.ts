/**
 * Plate's resolution of an item's package URLs (`@qti-pie/plate`'s `assetPaths`) against the
 * importer's (`resolveIn` and `resolveFromRoot`), over every run of whitespace around and inside a
 * name, for every URL attribute plate writes that the importer's reference census lists but
 * `srcset`, whose whitespace splits its image candidates.
 *
 * The importer reads an attribute's value by its whitespace class (`valueReadingOf`, the ASI XSD's
 * type: an `xs:anyURI` collapses, a `URLDType` replaces, `object@data`'s `xs:string` preserves; XML
 * Schema 1.0 Part 2 §4.3.6), sets the whitespace around it aside (`hrefTextOf`), and resolves what
 * remains (spec reading 102). Plate reads the same value (`urlValueOf` of `#plate/model/url.ts`)
 * before the URL parser does, which alone would keep an `xs:anyURI`'s inner run of spaces and
 * remove a tab a `URLDType` replaces, so the two must name one file for every form here. The
 * corpus holds no such value (`plate-resolution.corpus.test.ts`), so this box stands beside it, and
 * a planted resolver that reads the lexical form raw, its inner runs kept, shows the box tells the
 * two apart.
 *
 * Free: it opens no database and reads no corpus. plate is a devDependency of this package only,
 * so plate never depends on pantry.
 */
import { assert, describe, it } from "@effect/vitest";
import { Option } from "effect";
import { assetPaths } from "@qti-pie/plate";
import { valueReadingOf } from "#pantry/import/names.ts";
import {
  documentBase,
  hrefTextOf,
  referenceCensus,
  resolveFromRoot,
  resolveIn,
} from "#pantry/import/overlays/package.ts";
import { normalizedIn } from "#pantry/grammar/domains.ts";
import type { HrefResolution } from "#pantry/import/overlays/package.ts";

/**
 * Every URL attribute plate writes that the importer's census lists, but `source@srcset`: the ASI
 * XSD's `xs:anyURI` and `URLDType` attributes of the body, `object@data`, a stimulus ref's `href`
 * and a PCI's four module locations.
 */
const attributes = [
  ["a", "href"],
  ["audio", "src"],
  ["blockquote", "cite"],
  ["img", "longdesc"],
  ["img", "src"],
  ["object", "data"],
  ["q", "cite"],
  ["qti-assessment-stimulus-ref", "href"],
  ["qti-interaction-module", "fallback-path"],
  ["qti-interaction-module", "primary-path"],
  ["qti-interaction-modules", "primary-configuration"],
  ["qti-interaction-modules", "secondary-configuration"],
  ["source", "src"],
  ["track", "src"],
  ["video", "poster"],
  ["video", "src"],
] as const;

/**
 * The lexical forms of the box: a name `a…b.png` with each run of whitespace before it, inside it
 * and after it that a value of each class may hold.
 */
const lexicals = ["", " ", "\t", "\n", "\r"].flatMap((before) =>
  ["", " ", "  ", "\t", " \t", "\n\r"].flatMap((within) =>
    ["", " ", "\t"].map((after) => `${before}a${within}b.png${after}`),
  ),
);

/**
 * The item locations the box resolves against: the package's root and a folder below it.
 */
const locations = ["q1.xml", "items/q1.xml"] as const;

/**
 * A resolver of an item's package URL to the files it names, as plate's `assetPaths` is.
 */
type Resolver = (
  location: string,
  element: string,
  attribute: string,
  value: string,
) => readonly string[];

/**
 * Resolve one attribute's lexical form as the importer does: read by its whitespace class, the
 * whitespace around it set aside, then against the package's root for a PCI's module location (its
 * module to its `.js` file) and against the item's location for any other.
 *
 * @param location - The item's location.
 * @param element - The element's local name, its kind.
 * @param attribute - The attribute's local name.
 * @param lexical - Its lexical form.
 * @returns The importer's resolution.
 */
const importerOf = (
  location: string,
  element: string,
  attribute: string,
  lexical: string,
): HrefResolution => {
  const reading = valueReadingOf(element, attribute, lexical);
  const value = hrefTextOf(
    reading._tag === "admitted" ? normalizedIn(lexical, reading.whiteSpace) : lexical,
  );
  const form = Option.getOrThrow(referenceCensus(element, attribute));

  return form === "module" || form === "package"
    ? resolveFromRoot(form, value)
    : resolveIn(value, documentBase(location));
};

/**
 * The disagreements of a resolver with the importer over the box, each its place and the two
 * files named.
 *
 * @param resolver - The resolver.
 * @returns Each disagreement's message.
 */
const disagreementsOf = (resolver: Resolver): readonly string[] =>
  locations.flatMap((location) =>
    attributes.flatMap(([element, attribute]) =>
      lexicals.flatMap((lexical) => {
        const importer = importerOf(location, element, attribute, lexical);
        const named = resolver(location, element, attribute, lexical);
        // Plate's loader appends `.js` to a module location that does not end in it.
        const files =
          Option.getOrThrow(referenceCensus(element, attribute)) === "module"
            ? named.map((file) => (file.endsWith(".js") ? file : `${file}.js`))
            : named;

        // A value the importer refuses under a stated limit ("Href form", an `xs:string` holding a
        // control character) is no admitted item's, so it is not compared.
        if (importer.scope === "unresolved") {
          return [];
        }

        return importer.scope === "entry" && files.length === 1 && files[0] === importer.path
          ? []
          : [
              `${location}: ${element}@${attribute}=${JSON.stringify(lexical)}: plate names ${JSON.stringify(files)} where the importer resolves ${JSON.stringify(importer)}`,
            ];
      }),
    ),
  );

describe("plate's assetPaths against the importer over whitespace in and around a name", () => {
  it("names, for every URL attribute and every run of whitespace a value of its class holds, the one file the importer resolves it to", () => {
    // Oracle: a second implementation, the importer's resolution, its whitespace classes read from
    // the ASI XSD by pantry's grammar (`valueReadingOf`), never from plate's table.
    // Bound: 16 attributes, 90 forms, 2 locations.
    assert.strictEqual(attributes.length * lexicals.length * locations.length, 2880);
    assert.deepStrictEqual(disagreementsOf(assetPaths), []);
  });
});
