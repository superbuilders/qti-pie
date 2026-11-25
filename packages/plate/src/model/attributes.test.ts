import { assert, describe, it } from "@effect/vitest";
import { Option } from "effect";
import type { SourceElement } from "#plate/document/source.ts";
import { floatAttribute } from "#plate/model/attributes.ts";
import type { ModelWalk } from "#plate/model/attributes.ts";
import { pathsOf } from "#plate/model/build.ts";
import { attr, doc, el } from "#plate/test/source.ts";

/**
 * Construct the walk of a document whose root is one element, its paths as a model build walks
 * them.
 *
 * @param root The document's root element.
 * @returns The walk, every element of the document keyed to its path.
 */
const walkOf = (root: SourceElement): ModelWalk => {
  const document = doc("items/attributes.xml", root);

  return { document, paths: pathsOf(document) };
};

describe("attributes", () => {
  it("reads a mapping's xs:double bounds with their outer whitespace collapsed, as XML Schema Part 2 §4.3.6 reads every atomic type but string", () => {
    const mapping = el(
      "qti-mapping",
      [attr("default-value", " 0 "), attr("lower-bound", "\t-1.5\n")],
      [],
    );
    const build = walkOf(mapping);

    assert.deepStrictEqual(floatAttribute(build, mapping, "default-value"), Option.some(0));
    assert.deepStrictEqual(floatAttribute(build, mapping, "lower-bound"), Option.some(-1.5));
  });
});
