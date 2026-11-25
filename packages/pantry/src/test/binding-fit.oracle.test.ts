/**
 * The bindings the fit laws judge, held three ways over one small scope (`#pantry/test/binding-
 * cases.ts`): the importer's rows, the law oracle, and the schema's fit relations read over those
 * rows.
 *
 * A binding resolves by its name to the response declaration of its item that holds it, whatever
 * the declaration's cardinality spells, and one whose name none holds resolves to none, which
 * "Binding declared" refuses (`#pantry/qti/overlay-queries/reference.ts`; lane NIL's audit, B1 and
 * B2; spec reading 159). The fit laws read that declaration's `DeclarationCardinality`, which only
 * a declaration whose cardinality spells a code has, through a query
 * (`#pantry/qti/overlay-queries/interaction.ts`), so they judge only a variable of a cardinality.
 * No row copies the resolution (decision S3), so this check resolves each binding over the import's
 * rows as those queries read them. Before it, an
 * item binding `RESP`, which no declaration names, was written beside a nil declaration of no base
 * type and cardinality `single`, and refused by the database under BindingFit and by the oracle
 * under "Binding declared" (lane N2's tier at dadbbbd4, the `undeclared-response` fixture).
 *
 * For every site and every state:
 *
 * - Every binding row of the site resolves to a response declaration exactly where one holds its
 *   name, its item's `NamedDeclaration` of the name;
 * - That declaration has its `DeclarationCardinality` exactly where it spells its cardinality, the
 *   one the case writes;
 * - The oracle raises "Binding declared" exactly when no response declaration holds the name;
 * - Over a declaration that spells its cardinality, the oracle raises each fit law the closed
 *   `BindingFit` and `RecordBindingFit` say the schema's statements refuse over the cardinality
 *   rows, and no other;
 * - Over one that writes none or none spelled, the oracle raises no fit law (the orchestrator's
 *   ruling of 2026-11-06), and the importer writes no `DeclarationCardinality` row for it and no
 *   cardinality row beside its bindings, so no law reads a cardinality it does not have (spec
 *   readings 158 and 159: a missing value is a row of its own relation, never a sentinel).
 *
 * A gap match interaction with two or more gaps binds a response of multiple cardinality (spec
 * reading 169, information model §5.57): the law oracle and the schema's laws over the import's
 * rows (`#pantry/test/host-judge.ts`) break "Binding cardinality" together exactly where a gap
 * match of two gaps binds a single response, whatever its `max-associations`.
 */
import * as NodeServices from "@effect/platform-node/NodeServices";
import { assert, describe, layer } from "@effect/vitest";
import { exhaust } from "@bjornpagen/testing/explore";
import { noCoverage } from "@bjornpagen/testing/features";
import { int } from "@bjornpagen/testing/gen";
import { searched } from "@bjornpagen/testing/vitest";
import type { Addition } from "@bjornpagen/grizzle";
import { Duration, Effect, Option } from "effect";
import { Qti } from "#pantry/qti/schema.ts";
import { BindingFit, grammar, RecordBindingFit } from "#pantry/grammar/install.ts";
import { readProgram } from "#pantry/import/program.ts";
import { readEntries } from "#pantry/package/read.ts";
import { anyTypeKinds } from "#pantry/qti/interactions.ts";
import type { BoundVariable, PlacedBinding } from "#pantry/qti/interactions.ts";
import type { PackageInputs } from "#pantry/import/write.ts";
import {
  bindingCase,
  bindingSites,
  bindingStates,
  expectationOf,
} from "#pantry/test/binding-cases.ts";
import type { BindingSite, BindingState } from "#pantry/test/binding-cases.ts";
import { everyRelationPackage, scopedPackage } from "#pantry/test/gen/every-relation.ts";
import type { PackageEntries } from "#pantry/test/gen/every-relation.ts";
import { previewRowsOf, judge as judgeHost, judgedLaws } from "#pantry/test/host-judge.ts";
import { lawNamesOf } from "#pantry/test/host-law-names.ts";
import { databaseJudgedLawNames } from "#pantry/test/law-namer.ts";
import { filesOf } from "#pantry/test/oracle-complete/mutation.ts";
import { judge, shownBreach } from "#pantry/test/oracle.ts";
import type { Breach, LawName } from "#pantry/test/oracle.ts";
import { laws } from "#pantry/test/installed-laws.ts";
import { nameOf } from "#pantry/test/package-name.ts";
import { viewedDeclarationsOf } from "#pantry/test/declaration-queries.ts";
import { nodePlacesOf, placeKey } from "#pantry/test/places.ts";

/**
 * Every law the host judges, read once.
 */
const hostLaws = judgedLaws(Qti);

/**
 * The every-relation package the cases edit.
 */
const base = everyRelationPackage({ choices: 2, hotspots: 1, hottexts: 1 });

/**
 * A binding row the importer writes, an item's own or one in place.
 */
type BindingRow = Addition<typeof BoundVariable> | Addition<typeof PlacedBinding>;

/**
 * A response declaration a binding's name resolves to, as the queries read it: its place in the
 * item, and its cardinality and base type, each none where it has none.
 */
interface Resolved {
  readonly baseType: Option.Option<string>;
  readonly cardinality: Option.Option<string>;
  readonly start: bigint;
}

/**
 * Resolve a name in a document's declarations as the database's queries do: its
 * `NamedDeclaration` of the name, the identifier collapsed, whose node is a
 * `qti-response-declaration`, with its `DeclarationCardinality` and `DeclarationBaseType` where it
 * has each (`#pantry/qti/overlay-queries/reference.ts`, `ResponseName`).
 *
 * @param inputs - The import's rows.
 * @param path - The document that declares, an item's own or a placed binding's assembly's.
 * @param identifier - The name.
 * @returns The declaration, none where no response declaration holds the name.
 */
const responseOf = (
  inputs: PackageInputs,
  path: string,
  identifier: string,
): Option.Option<Resolved> =>
  Option.map(
    Option.fromUndefinedOr(
      viewedDeclarationsOf(inputs).find(
        (declaration) =>
          declaration.path === path &&
          declaration.name === identifier &&
          declaration.kind === "qti-response-declaration",
      ),
    ),
    (declaration) => ({
      baseType: Option.fromUndefinedOr(declaration.baseType),
      cardinality: Option.fromUndefinedOr(declaration.cardinality),
      start: declaration.start,
    }),
  );

/**
 * The document a binding resolves its name in: its own, an item's, or its assembly's, a placed
 * one's.
 *
 * @param row - The binding.
 * @returns The document's path.
 */
const declaringOf = (row: BindingRow): string => ("assembly" in row ? row.assembly : row.path);

/**
 * The laws that judge a binding's type.
 */
const fitLaws: ReadonlySet<LawName> = new Set([
  "BindingFit",
  "Binding cardinality",
  "Max strings required",
  "RecordBindingFit",
]);

/**
 * The fit law the schema's statements refuse a typed binding under, by the closed relations they
 * contain it in: none for an interaction of any type; `RecordBindingFit` for a record its kind does
 * not take; `BindingFit` for a typed response whose (base type, cardinality, kind) `BindingFit`
 * holds no row of, and for a string identifier's record, which has no base type, or variable of a
 * base type other than string. A variable of no base type that is no record is judged by no fit
 * law over its base type: Declaration base type refuses it alone (lane NIL's audit, B12).
 *
 * @param row - The binding beside its declaration's cardinality.
 * @param row.attribute - The binding's attribute.
 * @param row.cardinality - Its declaration's cardinality.
 * @param kind - Its interaction's kind, its node's.
 * @param baseType - Its declaration's base type, none where it has none.
 * @returns The law, or none.
 */
const misfitOf = (
  row: { readonly attribute: string; readonly cardinality: string },
  kind: BindingSite["kind"],
  baseType: Option.Option<string>,
): LawName | undefined => {
  if (row.attribute === "string-identifier") {
    return row.cardinality === "record" || Option.exists(baseType, (held) => held !== "string")
      ? "BindingFit"
      : undefined;
  }

  if (anyTypeKinds.some((held) => held === kind)) {
    return undefined;
  }

  if (row.cardinality === "record") {
    return RecordBindingFit.rows.some((fit) => fit.kind === kind) ? undefined : "RecordBindingFit";
  }

  return Option.exists(
    baseType,
    (held) =>
      !BindingFit.rows.some(
        (fit) => fit.baseType === held && fit.cardinality === row.cardinality && fit.kind === kind,
      ),
  )
    ? "BindingFit"
    : undefined;
};

/**
 * Hold one case: the importer's binding rows of the site, their resolution over its rows, the
 * schema's fit relations over them and the oracle's breaches, to the case's expectation.
 *
 * @param site - The site.
 * @param state - The state.
 * @returns The check.
 */
const holds = (site: BindingSite, state: BindingState) =>
  Effect.gen(function* bindingHolds() {
    const label = `${site.kind} ${site.attribute} ${site.identifier} ${state}`;
    const expected = expectationOf(site, state);
    const entries = bindingCase(base, site, state);
    const program = yield* readProgram(yield* scopedPackage(entries), "scoped");
    const places = nodePlacesOf(program.inputs);
    const ofSite = <Row extends BindingRow>(rows: Iterable<Row>) =>
      [...rows].filter(
        (row) =>
          row.attribute === site.attribute &&
          places.get(placeKey(row.path, row.start))?.kind === site.kind &&
          row.identifier === expected.identifier,
      );
    const bindings: readonly BindingRow[] = [
      ...ofSite(program.inputs.BoundVariable.values()).filter(({ path }) => path === site.declared),
      ...ofSite(program.inputs.PlacedBinding.values()).filter(
        ({ assembly }) => assembly === site.declared,
      ),
    ];

    assert.isNotEmpty(bindings, `${label}: the importer writes no binding row`);

    const resolved = bindings.map((row) => ({
      row,
      variable: responseOf(program.inputs, declaringOf(row), row.identifier),
    }));
    for (const { variable } of resolved) {
      assert.strictEqual(
        Option.isSome(variable),
        expected.declared,
        `${label}: a binding resolves to ${Option.isSome(variable) ? "a" : "no"} response declaration`,
      );
      for (const declared of Option.toArray(variable)) {
        assert.strictEqual(
          Option.isSome(declared.cardinality),
          expected.typed,
          `${label}: the declaration's cardinality row`,
        );
        for (const cardinality of Option.toArray(declared.cardinality)) {
          assert.strictEqual(cardinality, expected.held, `${label}: the declaration's cardinality`);
        }
      }
    }

    const judgment = yield* judge(filesOf(entries), grammar, laws);
    assert.strictEqual(judgment._tag, "Judged", `${label}: the codec refuses the case`);

    const breaches = (judgment._tag === "Judged" ? judgment.breaches : []).filter(
      (breach: Breach) =>
        breach.document === site.declared && breach.keys["identifier"] === expected.identifier,
    );
    const shown = breaches.map((breach) => `  ${shownBreach(breach, grammar)}`).join("\n");
    const raised = new Set(breaches.map(({ law }) => law));

    assert.strictEqual(
      raised.has("Binding declared"),
      !expected.declared,
      `${label}: Binding declared, of the breaches:\n${shown}`,
    );

    const misfits = new Set(
      resolved.flatMap(({ row, variable }) =>
        Option.toArray(variable).flatMap((declared) =>
          Option.toArray(declared.cardinality).flatMap(
            (cardinality) =>
              misfitOf({ attribute: row.attribute, cardinality }, site.kind, declared.baseType) ??
              [],
          ),
        ),
      ),
    );
    if (expected.typed) {
      for (const law of ["BindingFit", "RecordBindingFit"] as const) {
        assert.strictEqual(
          raised.has(law),
          misfits.has(law),
          `${label}: ${law}, which the schema's statements ${misfits.has(law) ? "raise" : "do not raise"} over the importer's rows, of the breaches:\n${shown}`,
        );
      }

      return;
    }

    assert.deepStrictEqual(
      [...raised].filter((law) => fitLaws.has(law)),
      [],
      `${label}: a fit law judges an untyped binding:\n${shown}`,
    );

    const declared = responseOf(program.inputs, site.declared, expected.identifier);
    assert.isFalse(
      Option.exists(declared, ({ cardinality }) => Option.isSome(cardinality)),
      `${label}: a DeclarationCardinality stands for a declaration whose cardinality is unwritten or spells nothing`,
    );
  });

/**
 * Every (site, state) of the scope, by its number.
 */
const cases = bindingSites.flatMap((site) => bindingStates.map((state) => ({ site, state })));

describe("the bindings the fit laws judge", () => {
  layer(NodeServices.layer)("over the every-relation package", (it) => {
    it.effect(
      "resolve to a response declaration exactly where one holds the name, which the schema's fit relations judge as the oracle does",
      (ctx) =>
        // Oracle: a second implementation, the law oracle, against the importer's rows and the
        // schema's closed fit relations read over them. Bound: every site of
        // binding-cases.ts (a choice, a slider, a custom interaction, a text entry's string
        // identifier and a placed fragment's text entry) under every state (renamed to an
        // undeclared name, an outcome or a built-in; its declaration's cardinality dropped,
        // empty, unspelled, padded or each of the four spelled), exhausted.
        searched(
          ctx,
          exhaust(
            {
              box: "every binding site of binding-cases.ts under every state",
              caseHang: Duration.seconds(60),
              coverage: noCoverage,
              generator: int(0, cases.length - 1),
              literal: (at) => {
                const drawn = cases[at];

                return drawn === undefined ? String(at) : `${drawn.site.identifier} ${drawn.state}`;
              },
              oracle: { kind: "second-implementation", name: "the law oracle's binding laws" },
              suite: "pantry/binding-fit",
            },
            (at) =>
              Effect.gen(function* bindingCaseHolds() {
                const drawn = cases[at];
                assert.isDefined(drawn, `no case ${String(at)}`);
                if (drawn !== undefined) {
                  yield* holds(drawn.site, drawn.state);
                }
              }).pipe(Effect.scoped),
          ),
        ),
    );
  });
});

/**
 * One gap match case: its gaps, its `max-associations` where written, the cardinality of the
 * response it binds, and whether "Binding cardinality" breaks, by hand from reading 169 and
 * reading 92.
 */
interface GapCase {
  readonly breaks: boolean;
  readonly cardinality: "multiple" | "single";
  readonly gaps: number;
  readonly most: Option.Option<string>;
}

/**
 * The gap match cases: two gaps bound single, with `max-associations` unwritten (its default 1)
 * and with it 2; two gaps bound multiple; one gap bound single.
 */
const gapCases: readonly GapCase[] = [
  { breaks: true, cardinality: "single", gaps: 2, most: Option.none() },
  { breaks: false, cardinality: "multiple", gaps: 2, most: Option.none() },
  { breaks: false, cardinality: "single", gaps: 1, most: Option.none() },
  { breaks: true, cardinality: "single", gaps: 2, most: Option.some("2") },
];

/**
 * The QTI 3.0 namespace.
 */
const asi = "http://www.imsglobal.org/xsd/imsqtiasi_v3p0";

/**
 * Write an XML document: its declaration, then its text.
 *
 * @param text - The document's root element.
 * @returns The document's bytes.
 */
const xml = (text: string): Uint8Array =>
  new TextEncoder().encode(`<?xml version="1.0" encoding="UTF-8"?>\n${text}\n`);

/**
 * Build a gap match case's package: a manifest and an item that declares the directed pair response
 * `R` and binds it to a gap match interaction of one gap text and the case's gaps.
 *
 * @param drawn - The case.
 * @returns The package's entries.
 */
const gapPackageOf = (drawn: GapCase): PackageEntries => {
  const most = Option.match(drawn.most, {
    onNone: () => "",
    onSome: (value) => ` max-associations="${value}"`,
  });
  const gaps = Array.from(
    { length: drawn.gaps },
    (_, at) => `<qti-gap identifier="G${String(at + 1)}"/>`,
  ).join(" and ");

  return new Map([
    [
      "imsmanifest.xml",
      xml(
        '<manifest xmlns="http://www.imsglobal.org/xsd/qti/qtiv3p0/imscp_v1p1" identifier="M"><metadata><schema>QTI Package</schema><schemaversion>3.0.1</schemaversion></metadata><organizations/><resources><resource identifier="R0" type="imsqti_item_xmlv3p0" href="item.xml"><file href="item.xml"/></resource></resources></manifest>',
      ),
    ],
    [
      "item.xml",
      xml(
        `<qti-assessment-item xmlns="${asi}" identifier="item" title="Item" adaptive="false" time-dependent="false"><qti-response-declaration identifier="R" cardinality="${drawn.cardinality}" base-type="directedPair"/><qti-item-body><qti-gap-match-interaction response-identifier="R"${most}><qti-gap-text identifier="T" match-max="2">word</qti-gap-text><p>Put it at ${gaps}.</p></qti-gap-match-interaction></qti-item-body></qti-assessment-item>`,
      ),
    ],
  ]);
};

describe("a gap match interaction's gaps", () => {
  layer(NodeServices.layer, { excludeTestServices: true })("over a one-item package", (it) => {
    it.effect(
      "break Binding cardinality where two or more bind a single response, the law oracle and the import's rows alike",
      () =>
        // Oracle: two implementations side by side, the law oracle's binding laws and the schema's
        // laws over the import's rows, and reading 169's verdict written by hand. Bound: a gap
        // match of one or two gaps bound single or multiple, with max-associations unwritten or 2.
        Effect.forEach(
          gapCases,
          (drawn) =>
            Effect.scoped(
              Effect.gen(function* gapCaseHolds() {
                const label = `${String(drawn.gaps)} gaps bound ${drawn.cardinality}, max-associations ${Option.getOrElse(drawn.most, () => "unwritten")}`;
                const dir = yield* scopedPackage(gapPackageOf(drawn));
                const judgment = yield* judge(yield* readEntries(dir), grammar, laws);
                assert.strictEqual(judgment._tag, "Judged", label);

                const breaches = judgment._tag === "Judged" ? judgment.breaches : [];
                const oracle = new Set<string>(breaches.map(({ law }) => law));
                const program = yield* readProgram(dir, nameOf(dir));
                const host = judgeHost(previewRowsOf(program.inputs), hostLaws);
                const broken = lawNamesOf(host.broken);
                const unjudged = lawNamesOf(host.skipped);
                const shown = [
                  ...Iterator.from(broken)
                    .filter((law) => !oracle.has(law))
                    .map((law) => `import-only-law: ${law}`),
                  ...Iterator.from(oracle)
                    .filter(
                      (law) =>
                        !broken.has(law) && !unjudged.has(law) && !databaseJudgedLawNames.has(law),
                    )
                    .map((law) => `oracle-only-law: ${law}`),
                ].toSorted();

                assert.deepStrictEqual(
                  shown,
                  [],
                  `${label}: the oracle breaks ${[...oracle].toSorted().join(", ") || "no law"}; the import's rows break ${[...broken].toSorted().join(", ") || "no law"}`,
                );
                assert.strictEqual(
                  breaches.filter(({ law }) => law === "Binding cardinality").length,
                  drawn.breaks ? 1 : 0,
                  `${label}: the oracle's Binding cardinality breaches`,
                );

                /**
                 * Binding cardinality reads the gaps and the most through queries the database
                 * alone judges (`SingleResponseGap`, `SingleBindingMost`), so the import's rows are
                 * held to what those queries read of them: a single response's gap match encloses
                 * one gap at most, and its most, where it has one, is 1.
                 */
                const places = nodePlacesOf(program.inputs);
                const kindAt = (path: string, start: bigint) =>
                  places.get(placeKey(path, start))?.kind;
                const rowsBreak = [...program.inputs.BoundVariable.values()]
                  .filter(
                    (binding) =>
                      binding.attribute === "response-identifier" &&
                      Option.exists(
                        Option.flatMap(
                          responseOf(program.inputs, binding.path, binding.identifier),
                          ({ cardinality }) => cardinality,
                        ),
                        (held) => held === "single",
                      ) &&
                      kindAt(binding.path, binding.start) === "qti-gap-match-interaction",
                  )
                  .some((binding) => {
                    const gaps = [...program.inputs.ChoiceInteraction.values()].filter(
                      (owned) =>
                        owned.interactionPath === binding.path &&
                        owned.interaction === binding.start &&
                        kindAt(owned.path, owned.start) === "qti-gap",
                    );
                    const most = [...program.inputs.MostCount.values()].find(
                      (count) => count.path === binding.path && count.start === binding.start,
                    );

                    return gaps.length > 1 || (most !== undefined && most.mostValue !== 1n);
                  });
                assert.strictEqual(
                  rowsBreak,
                  drawn.breaks,
                  `${label}: the import's rows hold ${rowsBreak ? "" : "no "}single response bound past its gaps or its most`,
                );
              }),
            ),
          { discard: true },
        ),
    );
  });
});
