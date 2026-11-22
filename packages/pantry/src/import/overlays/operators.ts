/**
 * The operator overlays' rows (spec readings 119 and 121, §C's `rowsOf`): from one document's view
 * (`DocumentView` of `#pantry/import/fold.ts`), the rows of every relation
 * `#pantry/qti/operators.ts` declares, each a keyed set.
 *
 * The rows restate what the tree says and nothing else: each rounding operator's element tuple and
 * what it holds, its `figures` as written where it writes one, and its `figures`' value (the host's
 * twin of `Attribute.value`, `attributeValueOf` of `#pantry/import/names.ts`) and mode in force
 * together where it has both; each `qti-equal`'s `tolerance` split into its values. On every form
 * AL1 admits, that value is `RoundingFigures`' collapse: the domain's leading members, the
 * integers, are collapsed, and its rest, a name, holds no whitespace.
 * The database proves every one of them (`operatorLaws`), so a row this builder gets wrong is
 * refused, never accepted. The mode in force and the `tolerance` as written are the database's
 * reads of `Attribute` (the queries `RoundingMode` and `ToleranceForm`), and reading 121's
 * presence reads `Attribute` and `Tolerance` alone, so none has rows of its own.
 */
import type { Addition } from "@bjornpagen/grizzle";
import { Option } from "effect";
import { governorOf, lexicalOf } from "#pantry/import/fold.ts";
import type { DocumentView } from "#pantry/import/fold.ts";
import { keyTextOf } from "#pantry/import/key-text.ts";
import { attributeValueOf } from "#pantry/import/names.ts";
import { tokensOf } from "#pantry/import/pieces.ts";
import type { Place } from "#pantry/import/write.ts";
import type {
  Rounding,
  RoundingFigures,
  RoundingModeFigures,
  Tolerance,
  ToleranceToken,
} from "#pantry/qti/operators.ts";
import { equalRoundedMode, roundingKinds } from "#pantry/vocab/terms/operators.ts";

/**
 * One value of a `tolerance` as its owner's family nests it: without the `package`, `path` and
 * `start` the nesting supplies, nor the `at` the family draws.
 */
type ToleranceTokenInsert = Omit<Addition<typeof ToleranceToken>, "package" | "path" | "start">;

/**
 * A `qti-equal`'s `tolerance`, with its values nested at its count field.
 */
export type ToleranceRow = Addition<typeof Tolerance> & {
  readonly tokens: readonly ToleranceTokenInsert[];
};

/**
 * A document's operator rows, one keyed set per relation: each map from the text of a row's key,
 * its element's place `(package, path, start)` as a JSON array, to the row as its writer writes it.
 */
export interface OperatorRows {
  readonly Rounding: ReadonlyMap<string, Addition<typeof Rounding>>;
  readonly RoundingFigures: ReadonlyMap<string, Addition<typeof RoundingFigures>>;
  readonly RoundingModeFigures: ReadonlyMap<string, Addition<typeof RoundingModeFigures>>;
  readonly Tolerance: ReadonlyMap<string, ToleranceRow>;
}

/**
 * The rounding operator kinds, each of which has its `Rounding` row.
 */
const rounders: ReadonlySet<string> = new Set(roundingKinds);

/**
 * A rounding operator's mode in force: its `rounding-mode` where written, else
 * {@link equalRoundedMode} on a `qti-equal-rounded`, else none, a `qti-round-to`'s that writes none,
 * which AL3 refuses.
 *
 * @param kind - The operator's kind.
 * @param written - Its `rounding-mode`, where written.
 * @returns The mode, where one is in force.
 */
const modeOf = (kind: string, written: Option.Option<string>): Option.Option<string> =>
  Option.orElse(written, () =>
    kind === "qti-equal-rounded" ? Option.some(equalRoundedMode) : Option.none(),
  );

/**
 * What a rounding operator holds (`RoundingHolds` of `#pantry/qti/operators.ts`): which of a
 * `figures` and a mode in force it has.
 *
 * @param figures - Its `figures`, where written.
 * @param mode - Its mode in force, where it has one.
 * @returns The `RoundingHolds` handle.
 */
const holdingsOf = (
  figures: Option.Option<string>,
  mode: Option.Option<string>,
): Addition<typeof Rounding>["holds"] => {
  if (Option.isSome(figures)) {
    return Option.isSome(mode) ? "both" : "figures";
  }

  return Option.isSome(mode) ? "mode" : "neither";
};

/**
 * Build a document's operator rows.
 *
 * Each rounding operator has its `Rounding` row, with what it holds, a mode where one is in force,
 * its `rounding-mode` or a `qti-equal-rounded`'s default; its `RoundingFigures` row where it writes
 * `figures`; and its `RoundingModeFigures` row where it has both. An
 * operator that leaves out a required attribute has no row of it, and AL3 refuses it alone. Each
 * `qti-equal` that writes `tolerance` has its {@link ToleranceRow}. A document with no such element
 * gives no row.
 *
 * @param view - The document's view: its rows.
 * @param place - Where the document stands in its package, the key every row holds.
 * @returns Every operator relation's rows.
 */
export const rowsOf = (view: DocumentView, place: Place): OperatorRows => {
  const { rows } = view;
  const operators = rows.nodes.filter(({ kind }) => rounders.has(kind) || kind === "qti-equal");
  const built = {
    Rounding: new Map<string, Addition<typeof Rounding>>(),
    RoundingFigures: new Map<string, Addition<typeof RoundingFigures>>(),
    RoundingModeFigures: new Map<string, Addition<typeof RoundingModeFigures>>(),
    Tolerance: new Map<string, ToleranceRow>(),
  };
  if (operators.length === 0) {
    return built;
  }

  for (const node of operators) {
    const key = keyTextOf(place.package, place.path, node.start);
    const at = { package: place.package, path: place.path, start: node.start };
    if (node.kind === "qti-equal") {
      for (const lexical of Option.toArray(lexicalOf(view, node.start, "tolerance"))) {
        built.Tolerance.set(key, { ...at, tokens: tokensOf(lexical) });
      }

      continue;
    }

    const figuresLexical = lexicalOf(view, node.start, "figures");
    const written = lexicalOf(view, node.start, "rounding-mode");
    const mode = modeOf(node.kind, written);
    built.Rounding.set(key, { ...at, holds: holdingsOf(figuresLexical, mode) });

    if (Option.isSome(figuresLexical)) {
      built.RoundingFigures.set(key, { ...at, figuresLexical: figuresLexical.value });
    }

    if (Option.isSome(figuresLexical) && Option.isSome(mode)) {
      built.RoundingModeFigures.set(key, {
        ...at,
        figures: attributeValueOf(
          governorOf(node.kind, node.governs),
          "figures",
          figuresLexical.value,
        ),
        mode: mode.value,
      });
    }
  }

  return built;
};
