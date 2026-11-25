import { regex } from "arkregex";
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { assert, describe, it } from "@effect/vitest";
import { exhaust } from "@bjornpagen/testing/explore";
import { requiredInSpace } from "@bjornpagen/testing/features";
import { array, boolean, constant, element, int, map, oneOf } from "@bjornpagen/testing/gen";
import type { Gen } from "@bjornpagen/testing/gen";
import { searched } from "@bjornpagen/testing/vitest";
import { Array as Arr, Duration, Effect, Formatter, Option } from "effect";
import { catalogSupports } from "#plate/supports.ts";
import type { CatalogSupport, Supports } from "#plate/supports.ts";
import { boxHolds } from "#plate/test/box.ts";
import { tables } from "#plate/validate/tables.ts";
import {
  baseTypes,
  carriedClass,
  interactionNames,
  isAuthorData,
  modelled,
  rendererClasses,
} from "#plate/vocabulary.ts";

/**
 * Read the package's modules, tests included, by path under the package (`src/<x>`), the UI's
 * `.tsx` among them: the text the censuses below read for data-* names and renderer classes. They
 * read text alone, no import; plate's module graph is the root's to read (`tools/module-graph.ts`).
 *
 * @returns Each `.ts` and `.tsx` file under `src/`, in path order.
 */
const sourceModules = (): ReadonlyMap<string, string> => {
  const root = new URL("./", import.meta.url);

  return new Map(
    readdirSync(root, { encoding: "utf-8", recursive: true })
      .filter((file) => regex("\\.tsx?$", "u").test(file))
      .toSorted()
      .map((file) => [
        `src/${file.split(path.sep).join("/")}`,
        readFileSync(new URL(file, root), "utf-8"),
      ]),
  );
};

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
    for (const notice of Arr.appendAll(modelled.notices, modelled.controlNotices)) {
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

/**
 * A case of the low-vision box: an interaction whose vocabulary section names
 * `qti-unselected-hidden`, the class its author wrote, and the candidate's supports.
 */
interface CarriedCase {
  readonly owner: "graphic-gap-match" | "hotspot" | "hottext";
  readonly supports: Pick<Supports, "catalog" | "display">;
  readonly written: Option.Option<string>;
}

/**
 * The interactions whose shared vocabulary sections name `qti-unselected-hidden`: Graphic Gap
 * Match's (1.2.10.3), Hotspot's (1.2.5.1) and Hot Text's (1.2.6.3).
 */
const UNSELECTED_HIDDEN_OWNERS = ["graphic-gap-match", "hotspot", "hottext"] as const;

/**
 * The tokens a written class of the box is made of: the class the PNP may leave off, and another
 * of the same sections, `qti-selections-dark`, which it never does.
 */
const CLASS_TOKENS = ["qti-unselected-hidden", "qti-selections-dark"] as const;

/**
 * Draw a case of the low-vision box: each owner; no class, or 0 to 2 of {@link CLASS_TOKENS}
 * space-separated; no magnification or a factor of 1 to 3; polarity inverted or not; keyword
 * emphasis on or off; and no catalog support or one of QTI's predefined ones.
 */
const carriedCase: Gen<CarriedCase> = (source) => ({
  owner: source.draw(element(UNSELECTED_HIDDEN_OWNERS)),
  supports: {
    catalog: source.draw(
      oneOf([
        constant(new Set<CatalogSupport>()),
        map(element(catalogSupports), (support) => new Set([support])),
      ]),
    ),
    display: {
      invertDisplayPolarity: source.draw(boolean),
      keywordEmphasis: source.draw(boolean),
      magnification: source.draw(oneOf([constant(Option.none()), map(int(1, 3), Option.some)])),
    },
  },
  written: source.draw(
    oneOf([
      constant(Option.none()),
      map(array(element(CLASS_TOKENS), { max: 2, min: 0 }), (tokens) =>
        Option.some(tokens.join(" ")),
      ),
    ]),
  ),
});

/**
 * How many cases {@link carriedCase} draws: 3 owners, 1 + 15 catalogs, 2 polarities, 2 emphases,
 * 1 + 3 magnifications, and 1 + (1 + 2 + 4) classes.
 */
const CARRIED_CASES = 3 * 16 * 2 * 2 * 4 * 8;

/**
 * Whether a candidate's supports show low-vision indications as reading `pnp-low-vision` names
 * them: the AfA PNP 3.0 features whose descriptions concern sight alone, magnification (4.1.23),
 * inverted display polarity (4.1.22) and the `high-contrast` catalog support (4.1.36), any of them
 * active.
 *
 * @param supports The supports.
 * @returns Whether any of the three is active.
 */
const lowVisionByReading = (supports: CarriedCase["supports"]): boolean =>
  Option.isSome(supports.display.magnification) ||
  supports.display.invertDisplayPolarity ||
  supports.catalog.has("high-contrast");

/**
 * The class the oracle expects an interaction's root to carry: the shared vocabulary's 1.2.10.3
 * ("If a candidate is known to have low-vision indications in their PNP, the class should be
 * ignored") leaves `qti-unselected-hidden` off a Graphic Gap Match for such a candidate, Hotspot's
 * and Hot Text's sections say nothing of the PNP, and a class of no token left is no class.
 *
 * @param drawn The case.
 * @returns The class; `None` where no token is left.
 */
const expectedClass = (drawn: CarriedCase): Option.Option<string> =>
  Option.flatMap(drawn.written, (written) => {
    const tokens = written === "" ? [] : written.split(" ");
    const ignored = drawn.owner === "graphic-gap-match" && lowVisionByReading(drawn.supports);
    const kept = ignored ? tokens.filter((token) => token !== "qti-unselected-hidden") : tokens;

    if (kept.length === 0) {
      return Option.none();
    }

    return Option.some(kept.length === tokens.length ? written : kept.join(" "));
  });

/**
 * What a case of the low-vision box reaches.
 */
const carriedSituations = [
  "left off",
  "kept for low vision",
  "kept without it",
  "no class",
] as const;

/**
 * A {@link carriedSituations} member.
 */
type CarriedSituation = (typeof carriedSituations)[number];

/**
 * The situation a case reaches: the class left off, kept on another owner for a candidate who shows
 * low vision, kept for one who shows none, or no class carried.
 *
 * @param drawn The case.
 * @returns The situation.
 */
const carriedSituationOf = (drawn: CarriedCase): CarriedSituation => {
  const expected = expectedClass(drawn);

  if (Option.isNone(expected)) {
    return "no class";
  }

  if (!Option.exists(drawn.written, (written) => written.includes("qti-unselected-hidden"))) {
    return "kept without it";
  }

  if (expected.value.includes("qti-unselected-hidden")) {
    return lowVisionByReading(drawn.supports) ? "kept for low vision" : "kept without it";
  }

  return "left off";
};

describe("the class an interaction's root carries", () => {
  it.effect(
    `leaves qti-unselected-hidden off a Graphic Gap Match exactly when the PNP shows low vision, and nowhere else: ${String(CARRIED_CASES)} cases`,
    (ctx) =>
      Effect.andThen(
        boxHolds(carriedCase, CARRIED_CASES),
        searched(
          ctx,
          exhaust(
            {
              box: "Graphic Gap Match, Hotspot and Hot Text; no class or 0 to 2 of qti-unselected-hidden and qti-selections-dark; no magnification or 1 to 3, polarity inverted or not, keyword emphasis on or off, and no catalog support or one of the 15 QTI predefines",
              caseHang: Duration.seconds(30),
              coverage: requiredInSpace<CarriedSituation>(carriedSituations),
              generator: carriedCase,
              literal: Formatter.format,
              oracle: {
                kind: "specification",
                name: "the shared vocabulary's 1.2.10.3, which ignores qti-unselected-hidden on a Graphic Gap Match for a candidate whose PNP shows low vision, with reading `pnp-low-vision`'s three features as that indication, and its 1.2.5.1 and 1.2.6.3, which say nothing of the PNP",
              },
              suite: "plate/vocabulary/carried-class",
            },
            (drawn, c) =>
              Effect.sync(() => {
                c.note(carriedSituationOf(drawn));

                assert.deepStrictEqual(
                  carriedClass(drawn.owner, drawn.written, drawn.supports),
                  expectedClass(drawn),
                );
              }),
          ),
        ),
      ),
  );
});

/**
 * A `data-*` name plate's UI writes on a part of its own: a JSX attribute (`data-slot="…"`,
 * `data-mode={…}`), a key of an attribute object (`"data-slot":`), or an attribute a selector names
 * (`[data-picked]`).
 */
const writtenData = regex(
  '(?<![\\w-])(?<name>data-[a-z0-9][a-z0-9-]*)(?:=["{]|":)|\\[(?<selected>data-[a-z0-9][a-z0-9-]*)[\\]=~|^$*]',
  "gu",
);

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

/**
 * Plate's two stylesheets, as a host imports them.
 */
const sheets = ["base.css", "theme.css"].map((sheet) =>
  readFileSync(new URL(`styles/${sheet}`, import.meta.url), "utf-8"),
);

/**
 * List the renderer classes nothing presents: no stylesheet selects the class, and no module reads
 * it with `carriesRendererClass`.
 *
 * @param classes The classes.
 * @param sources The package's modules, by path.
 * @param styles The stylesheets.
 * @returns Each class nothing presents.
 */
const unpresented = (
  classes: readonly string[],
  sources: ReadonlyMap<string, string>,
  styles: readonly string[],
): readonly string[] =>
  classes.filter(
    (name) =>
      !styles.some((sheet) => regex.as(`\\.${name}(?![\\w-])`, "u").test(sheet)) &&
      ![...sources].some(
        ([module, source]) =>
          !regex("\\.test\\.tsx?$", "u").test(module) &&
          source.includes(`carriesRendererClass(`) &&
          source.includes(`"${name}"`),
      ),
  );

describe("plate's renderer vocabulary", () => {
  it("names each class under plate's own prefix, never QTI's qti-, as QTI's implementation guide §3.2.1 asks", () => {
    for (const name of Object.keys(rendererClasses)) {
      assert.match(name, regex("^plate-[a-z0-9]+(?:-[a-z0-9]+)*$", "u"), name);
    }
  });

  it("presents every class: a stylesheet selects it or a module reads it", () => {
    assert.deepStrictEqual(unpresented(Object.keys(rendererClasses), sourceModules(), sheets), []);
  });

  it("names every plate- class a stylesheet selects", () => {
    const selected = new Set(
      sheets.flatMap((sheet) =>
        [...sheet.matchAll(regex("\\.(?<name>plate-[a-z0-9-]+)", "gu"))].map(
          (match) => match.groups?.["name"] ?? "",
        ),
      ),
    );

    assert.deepStrictEqual(
      [...selected].filter((name) => !Object.hasOwn(rendererClasses, name)),
      [],
      "a plate- class a stylesheet selects that the renderer vocabulary does not name",
    );
  });

  it("refuses a class nothing presents (the plant)", () => {
    assert.deepStrictEqual(
      unpresented([...Object.keys(rendererClasses), "plate-planted"], sourceModules(), sheets),
      ["plate-planted"],
    );
  });
});
