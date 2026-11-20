import { assert, describe, it } from "@effect/vitest";
import { Option } from "effect";
import { attributePath } from "#plate/document/source.ts";
import type { SourceElement } from "#plate/document/source.ts";
import {
  coordsOf,
  doubleAttribute,
  floatAttribute,
  inadmissible,
  pathOf,
  xsBooleanOf,
  xsInt,
} from "#plate/model/attributes.ts";
import type { AttributeFault, ModelWalk } from "#plate/model/attributes.ts";
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

/**
 * Construct the defect of an element's attribute at that attribute's path, as a model build gives
 * {@link doubleAttribute}.
 *
 * @param build The walk of the element's document.
 * @param element The element whose attribute is at fault.
 * @returns The reader's fault of an attribute of `element`.
 */
const faultOn =
  (build: ModelWalk, element: SourceElement): AttributeFault =>
  (attribute, fault, detail) =>
    inadmissible(build, fault, attributePath(pathOf(build, element), attribute), detail);

describe("attributes", () => {
  it("reads xs:boolean's four lexical forms and nothing else", () => {
    assert.deepStrictEqual(xsBooleanOf("true"), Option.some(true));
    assert.deepStrictEqual(xsBooleanOf("false"), Option.some(false));
    assert.deepStrictEqual(xsBooleanOf("1"), Option.some(true));
    assert.deepStrictEqual(xsBooleanOf("0"), Option.some(false));
    assert.deepStrictEqual(xsBooleanOf("yes"), Option.none());
  });

  it("reads an xs:int", () => {
    const greatest = el("qti-text-entry-interaction", [attr("base", "2147483647")]);

    assert.deepStrictEqual(xsInt(walkOf(greatest), greatest, "base"), Option.some(2_147_483_647));
  });

  it("reads an xs:double beyond the largest finite double as an infinity of its sign, as XML Schema 1.1's doubleLexicalMap rounds it (Part 2 §3.3.5.2; reading 144)", () => {
    const declaration = el("qti-outcome-declaration", [
      attr("normal-maximum", "1e309"),
      attr("normal-minimum", "-1e309"),
    ]);
    const fault = faultOn(walkOf(declaration), declaration);

    assert.deepStrictEqual(
      doubleAttribute(declaration, "normal-maximum", fault),
      Option.some(Number.POSITIVE_INFINITY),
    );
    assert.deepStrictEqual(
      doubleAttribute(declaration, "normal-minimum", fault),
      Option.some(Number.NEGATIVE_INFINITY),
    );
  });

  it("reads a mapping's xs:double bounds with their outer whitespace collapsed, as XML Schema Part 2 §4.3.6 reads every atomic type but string", () => {
    const mapping = el("qti-mapping", [
      attr("default-value", " 0 "),
      attr("lower-bound", "\t-1.5\n"),
    ]);
    const build = walkOf(mapping);

    assert.deepStrictEqual(floatAttribute(build, mapping, "default-value"), Option.some(0));
    assert.deepStrictEqual(floatAttribute(build, mapping, "lower-bound"), Option.some(-1.5));
  });

  it("reads coords in written order, each with whether it is written with %", () => {
    const plain = el("qti-area-map-entry", [attr("coords", "10,20,30")]);
    assert.deepStrictEqual(coordsOf(walkOf(plain), plain), [
      [10, false],
      [20, false],
      [30, false],
    ]);

    const percent = el("qti-area-map-entry", [attr("coords", "10%,20,30")]);
    assert.deepStrictEqual(coordsOf(walkOf(percent), percent), [
      [10, true],
      [20, false],
      [30, false],
    ]);
  });
});
