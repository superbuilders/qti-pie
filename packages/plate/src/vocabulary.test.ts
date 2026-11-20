import { readFileSync } from "node:fs";
import { assert, describe, it } from "@effect/vitest";
import { Effect, Option } from "effect";
import { noSupports } from "#plate/supports.ts";
import type { Supports } from "#plate/supports.ts";
import { growthFactor, growthLimit, growthRatio } from "#plate/test/growth.ts";
import { sourceModules } from "#plate/test/imports.ts";
import { tables } from "#plate/validate/tables.ts";
import {
  baseTypes,
  carriedClass,
  interactionNames,
  isAuthorData,
  modelled,
  templateName,
  templateNames,
  templatePrefixes,
} from "#plate/vocabulary.ts";

/**
 * Assert that a list holds each of its members once.
 *
 * @param list The list under test.
 */
const assertDistinct = (list: readonly string[]): void => {
  assert.strictEqual(new Set(list).size, list.length, `duplicates in ${list.join(", ")}`);
};

/**
 * The spaces inside the shorter URI the growth check reads, before it reads one with
 * {@link growthFactor} times as many: a run a backtracking trim of the outer whitespace scans from
 * each of its positions.
 */
const fewerSpaces = 4000;

/**
 * The timeout of the growth check, which samples each size several times, each sample at least
 * `growthRatio`'s minimum of thread CPU: under half a second alone, which a loaded machine
 * stretches toward vitest's default of 5 s. Vitest fails a test that ends after its timeout even
 * when it passes.
 */
const growthTimeoutMs = 60_000;

describe("templateName", () => {
  it("resolves all four spellings of each built-in to its name", () => {
    for (const name of templateNames) {
      for (const prefix of templatePrefixes) {
        for (const suffix of ["", ".xml"]) {
          assert.deepStrictEqual(templateName(`${prefix}${name}${suffix}`), Option.some(name));
        }
      }
    }
  });

  it("resolves the three CC2 templates to their names under either prefix", () => {
    for (const prefix of templatePrefixes) {
      for (const name of ["CC2_match", "CC2_match_basic", "CC2_map_response"] as const) {
        assert.deepStrictEqual(templateName(`${prefix}${name}.xml`), Option.some(name));
        assert.deepStrictEqual(templateName(`${prefix}${name}`), Option.some(name));
      }
    }
  });

  it("resolves an unknown URI to none", () => {
    for (const prefix of templatePrefixes) {
      assert.isTrue(Option.isNone(templateName(`${prefix}CC2_other.xml`)));
      assert.isTrue(Option.isNone(templateName(`${prefix}cc2_match.xml`)));
      assert.isTrue(Option.isNone(templateName(`${prefix}match_correct.json`)));
    }
    assert.isTrue(Option.isNone(templateName("https://example.com/rptemplates/match_correct.xml")));
    assert.isTrue(Option.isNone(templateName("match_correct")));
    assert.isTrue(Option.isNone(templateName("")));
  });

  it("resolves a built-in padded with XML whitespace to its name, as xs:anyURI collapses it", () => {
    for (const name of templateNames) {
      for (const prefix of templatePrefixes) {
        for (const padding of [" ", "\n\t"]) {
          assert.deepStrictEqual(
            templateName(`${padding}${prefix}${name}${padding}`),
            Option.some(name),
          );
        }
      }
    }
  });

  it("resolves a URI with whitespace inside its name to none", () => {
    for (const prefix of templatePrefixes) {
      assert.isTrue(Option.isNone(templateName(`${prefix}match_ correct`)));
      assert.isTrue(Option.isNone(templateName(`${prefix}match_\ncorrect`)));
    }
  });

  it.effect(
    "reads 8 times the spaces inside a URI in under 32 times the time",
    () =>
      Effect.gen(function* readsInLinearTime() {
        const fewer = `a${" ".repeat(fewerSpaces)}b`;
        const more = `a${" ".repeat(fewerSpaces * growthFactor)}b`;
        assert.isTrue(Option.isNone(templateName(more)));

        const growth = yield* growthRatio(
          () => {
            templateName(fewer);
          },
          () => {
            templateName(more);
          },
        );
        assert.isBelow(
          growth,
          growthLimit,
          `8 times the spaces took ${growth.toFixed(1)} times as long`,
        );
      }),
    growthTimeoutMs,
  );
});

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

  it("has every engine rule and every template rule in elements", () => {
    assert.includeMembers([...modelled.elements], [...modelled.engine]);
    assert.includeMembers([...modelled.elements], [...modelled.templateRules]);
  });

  it("lists exactly the elements the XSD admits in qti-template-processing and in a template condition", () => {
    const admitted = ["qti-template-processing", "qti-template-condition"].flatMap((parent) =>
      Object.keys(tables.elements[parent]?.children ?? {}).map((key) =>
        key.slice(key.indexOf("}") + 1),
      ),
    );

    assertDistinct(modelled.templateRules);
    assert.sameMembers([...modelled.templateRules], [...new Set(admitted)]);
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
