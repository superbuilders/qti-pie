/**
 * The parts of a typed `m:cn`, judged twice (spec reading 2, MathML 3 §4.2.1): the law oracle's
 * verdict over the package, and the schema's own laws over the import's rows
 * (`#pantry/test/host-judge.ts`), and the two must be one.
 *
 * The oracle counts the parts of every `cn` whose `type` lists a form, whatever its `base` and
 * whatever its parts hold, so a `cn` of `base` outside 2 to 36, or with a part that holds an
 * element, is refused for a wrong count as any other is. The host once judged only the `cn`s whose
 * digits it could read, so it accepted those (audit e8db90e1, F7). Each case is a `cn` written into
 * the base item; the controls have the right count and are accepted by both.
 *
 * The count of every `cn` whose `type` lists a form is the view `CnCount`'s
 * (`#pantry/qti/overlay-queries/expression.ts`), a rule over a query the host judge leaves to the
 * database, so the case restates it on the host over the import's rows ({@link miscounted}).
 */
import type { PreviewRows } from "@bjornpagen/grizzle";
import { NodeServices } from "@effect/platform-node";
import { assert, layer } from "@effect/vitest";
import { Array as Arr, Effect, Formatter, Option, Predicate } from "effect";
import { collapse } from "#pantry/grammar/domains.ts";
import { CnParts } from "#pantry/grammar/install.ts";
import { keyTextOf } from "#pantry/import/key-text.ts";
import { readProgram } from "#pantry/import/program.ts";
import { Qti } from "#pantry/qti/schema.ts";
import { scopedPackage } from "#pantry/test/gen/every-relation.ts";
import { previewRowsOf, judge, judgedLaws } from "#pantry/test/host-judge.ts";
import type { HeldRow } from "#pantry/test/host-judge.ts";
import { oracleVerdict } from "#pantry/test/oracle-verdict.ts";
import { itemResource, manifestOf, packageOf, withItem } from "#pantry/test/probe.ts";
import { rulesOf } from "#pantry/import/refusal.ts";
import { nameOf } from "#pantry/test/package-name.ts";
import { lawTable } from "#pantry/vocab/laws.ts";

/**
 * A `cn` case: its markup, whether both judges must accept it, and the rule they refuse it under.
 */
interface CnCase {
  readonly cn: string;
  readonly name: string;
  readonly refused: boolean;
}

/**
 * The cases: the audit's failing inputs, their controls, and the surplus the host already refused.
 */
const cases: readonly CnCase[] = [
  {
    cn: '<m:cn type="rational" base="40">1<m:sep/>2<m:sep/>3</m:cn>',
    name: "base 40 rational of three parts",
    refused: true,
  },
  {
    cn: '<m:cn type="rational" base="40">1<m:sep/>2<m:sep/>3<m:sep/>4</m:cn>',
    name: "base 40 rational of four parts",
    refused: true,
  },
  {
    cn: '<m:cn type="rational" base="40">1</m:cn>',
    name: "base 40 rational of one part",
    refused: true,
  },
  {
    cn: '<m:cn type="rational" base="">1<m:sep/>2<m:sep/>3</m:cn>',
    name: "empty base rational of three parts",
    refused: true,
  },
  {
    cn: '<m:cn type="rational" base="1">1<m:sep/>2<m:sep/>3</m:cn>',
    name: "base 1 rational of three parts",
    refused: true,
  },
  {
    cn: '<m:cn type="rational"><m:mglyph src="glyph.png"/><m:sep/>2<m:sep/>3</m:cn>',
    name: "mglyph part, rational of three parts",
    refused: true,
  },
  {
    cn: '<m:cn type="integer" base="40">1<m:sep/>2</m:cn>',
    name: "base 40 integer of two parts",
    refused: true,
  },
  {
    cn: '<m:cn type="rational">1<m:sep/>2<m:sep/>3</m:cn>',
    name: "rational surplus",
    refused: true,
  },
  { cn: '<m:cn type="real">1<m:sep/>2</m:cn>', name: "real surplus", refused: true },
  {
    cn: '<m:cn type="rational" base="40">1<m:sep/>2</m:cn>',
    name: "base 40 rational of two parts",
    refused: false,
  },
  {
    cn: '<m:cn type="rational"><m:mglyph src="glyph.png"/><m:sep/>2</m:cn>',
    name: "mglyph part, rational of two parts",
    refused: false,
  },
  {
    cn: '<m:cn type="rational">1<m:sep/>2</m:cn>',
    name: "rational of two parts",
    refused: false,
  },
  {
    cn: '<m:cn type="integer" base="40">1</m:cn>',
    name: "base 40 integer of one part",
    refused: false,
  },
  {
    cn: '<m:cn type="constant" base="40">1<m:sep/>2<m:sep/>3</m:cn>',
    name: "type no form lists, any parts",
    refused: false,
  },
];

/**
 * The base package with the case's `cn` in its item body, and the `glyph.png` an `mglyph` names.
 *
 * @param cn - The `cn`'s markup.
 * @returns The package's files by path.
 */
const filesOf = (cn: string) => {
  const edited = withItem(
    '<p id="intro">Pick one.</p>',
    `<p id="intro">Pick one.</p><m:math>${cn}</m:math>`,
  );

  return {
    "glyph.png": "png",
    "imsmanifest.xml": manifestOf(
      itemResource.replace(
        '<file href="item.xml"/>',
        '<file href="item.xml"/><file href="glyph.png"/>',
      ),
    ),
    "item.xml": edited["item.xml"].replace(
      "<qti-assessment-item ",
      '<qti-assessment-item xmlns:m="http://www.w3.org/1998/Math/MathML" ',
    ),
  };
};

/**
 * Read a row's field that holds a text or a position, as a key text reads it.
 *
 * @param row - The row.
 * @param field - The field.
 * @returns Its value.
 */
const at = (row: HeldRow, field: string): bigint | string => {
  const value = row[field];

  return Predicate.isString(value) || Predicate.isBigInt(value)
    ? value
    : assert.fail(`the row holds no text or position in ${field}`);
};

/**
 * Read the key text of the element a row's place names: its package, its path and the position
 * the row holds in `start`'s field.
 *
 * @param row - The row.
 * @param start - The field that holds the element's position.
 * @returns The element's key text.
 */
const placeOf = (row: HeldRow, start: string): string =>
  keyTextOf(at(row, "package"), at(row, "path"), at(row, start));

/**
 * Restate "MathML cn form" over the view `CnCount` (`#pantry/qti/overlay-queries/expression.ts`) on
 * the host, over the import's rows: each `m:cn` whose `type` lists a form, `real` where it writes
 * none and else its form collapsed (MathML 3 §4.2.1, §2.1.7), holds as many parts as
 * {@link CnParts} gives its type, one more than its `m:sep` children.
 *
 * @param rows - The import's rows as the database holds them.
 * @returns Whether some `cn` holds another count.
 */
const miscounted = (rows: PreviewRows<typeof Qti>): boolean => {
  const view: ReadonlyMap<string, readonly HeldRow[]> = new Map(Object.entries(rows));
  const rowsOf = (relation: string): readonly HeldRow[] => view.get(relation) ?? [];
  const types = new Map(
    rowsOf("Attribute")
      .filter((row) => row["kind"] === "m:cn" && row["name"] === "type")
      .map((row) => [placeOf(row, "start"), collapse(String(at(row, "lexical")))] as const),
  );
  const separators = Map.groupBy(
    rowsOf("Node").filter((row) => row["kind"] === "m:sep"),
    (row) => placeOf(row, "parent"),
  );

  return rowsOf("Node")
    .filter((row) => row["kind"] === "m:cn")
    .some((cn) => {
      const place = placeOf(cn, "start");
      const type = types.has(place) ? types.get(place) : "real";
      const parts = CnParts.rows.find((row) => row.type === type)?.parts;

      return parts !== undefined && BigInt((separators.get(place) ?? []).length + 1) !== parts;
    });
};

/**
 * Every law the host judges, read once.
 */
const laws = judgedLaws(Qti);

layer(NodeServices.layer, { excludeTestServices: true })("the parts of a typed cn", (it) => {
  it.effect("is counted whatever its base and whatever its parts hold, by both judges", () =>
    Effect.gen(function* eachCase() {
      for (const { cn, name, refused } of cases) {
        const files = filesOf(cn);
        const verdict = yield* oracleVerdict(packageOf(files));
        const entries = new Map(
          Object.entries(files).map(([path, text]) => [path, new TextEncoder().encode(text)]),
        );
        const { broken, rows } = yield* Effect.scoped(
          Effect.gen(function* host() {
            const dir = yield* scopedPackage(entries);
            const program = yield* readProgram(dir, nameOf(dir));
            const held = previewRowsOf(program.inputs);

            return { ...judge(held, laws), rows: held };
          }),
        );
        const [first, ...rest] = broken.map(({ law }) => law);
        const counted = miscounted(rows) ? lawTable["MathML cn form"].rule : "accepted";
        const rule =
          first === undefined
            ? counted
            : Option.getOrElse(Arr.head(rulesOf([first, ...rest])), () => "unnamed");
        const rules = verdict.kind === "accepted" ? new Set(["accepted"]) : verdict.rules;
        const shown = `${name}: the import's rows give ${rule} (${broken.map(({ law }) => Formatter.format(law)).join("; ") || "no law"}), the oracle ${[...rules].join(", ")}`;

        assert.strictEqual(verdict.kind === "accepted", !refused, shown);
        assert.isTrue(rules.has(rule), shown);
        if (refused) {
          assert.isTrue(rules.has("attribute-lexical"), shown);
        }
      }
    }),
  );
});
