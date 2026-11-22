import { readFileSync } from "node:fs";
import { assert, describe, it } from "@effect/vitest";
import { Option } from "effect";
import { noSupports } from "#plate/supports.ts";
import type { Supports } from "#plate/supports.ts";
import { sourceModules } from "#plate/test/imports.ts";
import { tables } from "#plate/validate/tables.ts";
import {
  baseTypes,
  carriedClass,
  interactionNames,
  isAuthorData,
  modelled,
} from "#plate/vocabulary.ts";

/**
 * Assert that a list holds each of its members once.
 *
 * @param list The list under test.
 */
const assertDistinct = (list: readonly string[]): void => {
  assert.strictEqual(new Set(list).size, list.length, `duplicates in ${list.join(", ")}`);
};

describe("the closed value sets", () => {
  it("names only elements the XSD declares, each once", () => {
    assertDistinct(modelled.elements);
    for (const name of modelled.elements) {
      assert.isTrue(Object.hasOwn(tables.elements, name), name);
    }
  });

  it("shows no notice in place of a record-bound control: no notice rule names a cardinality, so a text interaction bound to a record response renders", () => {
    assert.deepStrictEqual(
      [...modelled.notices, ...modelled.controlNotices].flatMap((notice) =>
        "cardinality" in notice.when ? [notice.feature] : [],
      ),
      [],
    );
  });

  it("puts every notice on an interaction the item model reads", () => {
    for (const notice of [...modelled.notices, ...modelled.controlNotices]) {
      assert.includeMembers([...interactionNames], [...notice.on], notice.feature);
    }
  });

  it("marks no base type, since the value model holds all eleven", () => {
    for (const baseType of baseTypes) {
      assert.notInclude(
        modelled.marks.map((mark) => mark.feature),
        `base-type="${baseType}"`,
        baseType,
      );
    }
  });
});

describe("the class an interaction's root carries", () => {
  it("leaves qti-unselected-hidden off a Graphic Gap Match exactly when the PNP shows low vision, and nowhere else", () => {
    // Shared vocabulary 1.2.10.3: "If a candidate is known to have low-vision indications in their
    // PNP, the class should be ignored"; reading 192 names the indications. Hotspot's and Hot
    // Text's sections of the class (1.2.5.1, 1.2.6.3) say nothing of the PNP.
    const written = Option.some("qti-selections-dark qti-unselected-hidden");
    const lowVision: readonly Supports[] = [
      { ...noSupports, display: { ...noSupports.display, magnification: Option.some(2) } },
      { ...noSupports, display: { ...noSupports.display, invertDisplayPolarity: true } },
      { ...noSupports, catalog: new Set(["high-contrast"]) },
    ];

    for (const supports of lowVision) {
      assert.deepStrictEqual(
        carriedClass("graphic-gap-match", written, supports),
        Option.some("qti-selections-dark"),
      );
      assert.deepStrictEqual(carriedClass("hotspot", written, supports), written);
      assert.deepStrictEqual(carriedClass("hottext", written, supports), written);
      assert.deepStrictEqual(
        carriedClass("graphic-gap-match", Option.some("qti-unselected-hidden"), supports),
        Option.none(),
      );
    }
    assert.deepStrictEqual(carriedClass("graphic-gap-match", written, noSupports), written);
    assert.deepStrictEqual(
      carriedClass("graphic-gap-match", written, {
        ...noSupports,
        catalog: new Set(["glossary-on-screen"]),
      }),
      written,
    );
  });
});

/**
 * A `data-*` name plate's UI writes on a part of its own: a JSX attribute (`data-slot="…"`,
 * `data-mode={…}`), a key of an attribute object (`"data-slot":`), or an attribute a selector names
 * (`[data-picked]`).
 */
const writtenData =
  /(?<![\w-])(?<name>data-[a-z0-9][a-z0-9-]*)(?:=["{]|":)|\[(?<selected>data-[a-z0-9][a-z0-9-]*)[\]=~|^$*]/gu;

/**
 * Give the `data-*` names one source writes or selects ({@link writtenData}).
 *
 * @param source The source.
 * @returns The names.
 */
const dataNamesIn = (source: string): readonly string[] =>
  [...source.matchAll(writtenData)].flatMap((match) => {
    const name = match.groups?.["name"] ?? match.groups?.["selected"];

    return name === undefined ? [] : [name];
  });

describe("the reserved data-* names, against plate's UI (decision D24)", () => {
  it("hold every data-* name the UI writes on its parts or its stylesheet selects, so no author attribute securing keeps lands on one", () => {
    const written = new Set([
      ...[...sourceModules()].flatMap(([module, source]) =>
        module.startsWith("src/ui/") ? dataNamesIn(source) : [],
      ),
      ...["styles/base.css", "styles/theme.css"].flatMap((sheet) =>
        dataNamesIn(readFileSync(new URL(sheet, import.meta.url), "utf-8")),
      ),
    ]);

    assert.isAbove(written.size, 0, "the scan finds the UI's own data-* names");
    assert.deepStrictEqual(
      [...written].filter((name) => isAuthorData(name)),
      [],
      "a data-* name the UI writes that securing would keep for an author",
    );
  });
});
