/**
 * The O3 overlays' free tests: the closed data the laws read is the grammar's: the content
 * references, the last-slot rules, the count pairs and the attributes copied. The built-in
 * variables the laws read are `BuiltInVariable`'s own rows, under each root
 * (`#pantry/test/built-in-roots.oracle.test.ts`).
 */
import type { Law } from "@bjornpagen/grizzle";
import * as NodeServices from "@effect/platform-node/NodeServices";
import { assert, describe, it } from "@effect/vitest";
import { exhaust } from "@bjornpagen/testing/explore";
import { noCoverage, requiredInSpace } from "@bjornpagen/testing/features";
import { array, boolean, element } from "@bjornpagen/testing/gen";
import type { Gen } from "@bjornpagen/testing/gen";
import { searched } from "@bjornpagen/testing/vitest";
import { Duration, Effect, Formatter, Option, Result } from "effect";
import { inject } from "vitest";
import {
  ChoiceBound,
  ContentReference,
  grammar,
  interactionKinds,
} from "#pantry/grammar/install.ts";
import { anyTypeKinds, cardinalityKinds, itemBuiltInNames } from "#pantry/qti/interactions.ts";
import { Qti } from "#pantry/qti/schema.ts";
import { readEntries } from "#pantry/package/read.ts";
import type { PackageFile } from "#pantry/package/read.ts";
import { readProgram } from "#pantry/import/program.ts";
import { viewedDeclarationsOf } from "#pantry/test/declaration-queries.ts";
import { boxHolds } from "#pantry/test/box.ts";
import { scopedPackage } from "#pantry/test/gen/every-relation.ts";
import { previewOf, judge as judgeRows, judgedLaws } from "#pantry/test/host-judge.ts";
import type { PackageInputs } from "#pantry/import/write.ts";
import { lawNamesOf } from "#pantry/test/host-law-names.ts";
import { itemKind } from "#pantry/vocab/terms/tests.ts";
import { contentLawOf, judge, lawsOf } from "#pantry/test/oracle.ts";
import {
  base,
  breachesOf,
  contextPci,
  edit,
  item,
  itemResource,
  judged,
  manifestOf,
  shown,
} from "#pantry/test/probe.ts";
import { attributeDeclarations } from "#pantry/vocab/inventory/attributes.ts";
import {
  choiceKinds,
  countDefault,
  hotspotKinds,
  readAttributes,
  references,
} from "#pantry/vocab/terms/interactions.ts";
import { nameOf } from "#pantry/test/package-name.ts";
import { nodePlacesOf, placeKey } from "#pantry/test/places.ts";

/**
 * The fixtures the global setup materializes: `simple` among them.
 */
const fixtures = inject("fixtures");

/**
 * The law oracle's tables, derived once.
 */
const oracleLaws = lawsOf(grammar);

/**
 * The law each content reference relation states for a name that resolves to no allowed variable,
 * by the relation's key in `references`.
 */
const referenceLaws = {
  context: "Context variable reference",
  feedback: "Feedback reference",
  printed: "Printed variable reference",
  template: "Template reference",
  variable: "Printed variable reference",
} as const satisfies Readonly<Record<keyof typeof references, string>>;

/**
 * The content reference relations, by their keys in `references`.
 */
const referenceRelations = [
  "context",
  "feedback",
  "printed",
  "template",
  "variable",
] as const satisfies readonly (keyof typeof references)[];

describe("qti/interactions.ts, the closed data its laws read", () => {
  it("holds every ContentReference row in exactly one reference relation, the one whose law the oracle names for it", () => {
    for (const { attribute, kind } of ContentReference.rows) {
      const holders = referenceRelations.filter(
        (relation) =>
          references[relation].attributes.some((name) => name === attribute) &&
          references[relation].kinds.some((holder) => holder === kind),
      );

      assert.strictEqual(holders.length, 1, `${kind} ${attribute}`);
      for (const relation of holders) {
        assert.isTrue(
          Option.contains(contentLawOf(kind, attribute), referenceLaws[relation]),
          `${kind} ${attribute}: the law the oracle's contentLawOf names for a reference by (kind, attribute)`,
        );
      }
    }
  });

  it("reads every LastWhere rule over a shape of a hotspot kind under interactions, so each hotspot's shape states it", () => {
    assert.isNotEmpty(
      grammar.lastWhere,
      "the grammar's lastWhere rules, which the default-hotspot check is built from",
    );
    for (const { attribute, kind, parents } of grammar.lastWhere) {
      assert.strictEqual(attribute, "shape", kind);
      assert.include(hotspotKinds, kind);
      for (const parent of parents) {
        assert.include(interactionKinds, parent, kind);
      }
    }
  });

  it("holds every ChoiceBound kind an interaction or a choice, so an Interaction or a Choice row brings its CountBound", () => {
    for (const { kind } of ChoiceBound.rows) {
      assert.isTrue(
        interactionKinds.includes(kind) || choiceKinds.some((choice) => choice === kind),
        `${kind}: in the grammar's interaction roster or choiceKinds`,
      );
    }
  });

  it("reads reading `binding-and-count-sentences`'s cardinality kinds' most count with an XSD default, so the law reads a known most", () => {
    for (const kind of cardinalityKinds) {
      const bound = ChoiceBound.rows.find((row) => row.kind === kind);

      assert.isDefined(bound, kind);
      assert.include(
        ["max-choices", "max-associations"],
        bound.max,
        `${kind}: one of ChoiceBound's max attributes`,
      );
      assert.isTrue(
        Option.isSome(countDefault(kind, bound.max)),
        `${kind}: the inventory leaf's attribute declarations give it an XSD default (countDefault)`,
      );
    }
  });

  it("copies only attributes the inventory declares on each kind they are read on", () => {
    /**
     * Oracle: the inventory leaf's attribute declarations.
     */
    const declared = new Set(attributeDeclarations.map(({ kind, name }) => `${kind} ${name}`));
    for (const [name, kinds] of readAttributes) {
      for (const kind of kinds) {
        assert.isTrue(declared.has(`${kind} ${name}`), `${kind} ${name}`);
      }
    }
  });

  it("lets the interactions no fit relation names bind any type, and no other", () => {
    assert.deepStrictEqual(
      [...anyTypeKinds].toSorted(),
      [
        "qti-custom-interaction",
        "qti-order-interaction",
        "qti-portable-custom-interaction",
      ].toSorted(),
      "the information model's class descriptions: the custom, portable custom and order interactions state no binding, so each binds a response of any type (§5.36, §5.106 and §5.97; spec reading `order-binding`)",
    );
  });
});

/**
 * The `simple` fixture's item, the one document the reading-104 cases edit.
 */
const simpleItem = "choice.xml";

/**
 * The classes of element the name box adds, each with the noun its identifier's sentence names
 * (reading `choice-identifier-scope`): a simple choice, an inline choice and a hotspot choice,
 * three of the four whose noun is "choice"; a hottext and a gap text, choices of another noun; and
 * a gap, which is no choice.
 */
const NAMED_KINDS = ["simple", "inline", "hotspot", "hottext", "gapText", "gap"] as const;

/**
 * A class of {@link NAMED_KINDS}.
 */
type NamedKind = (typeof NAMED_KINDS)[number];

/**
 * The classes whose sentence bars "any other choice": a simple choice, an inline choice and a
 * hotspot choice (§5.132.1, §5.73.1, §5.67.1).
 */
const FOUR_KINDS: ReadonlySet<NamedKind> = new Set(["simple", "inline", "hotspot"]);

/**
 * The classes the information model calls a choice: the four's, a hottext (§5.65.1) and a gap
 * text (§6.17). A gap is none.
 */
const CHOICE_KINDS: ReadonlySet<NamedKind> = new Set([...FOUR_KINDS, "hottext", "gapText"]);

/**
 * The names an added element of the name box bears: one of the item's own simple choices', and
 * another.
 */
const ADDED_NAMES = ["ChoiceA", "H"] as const;

/**
 * An element of a case: its class and its identifier.
 */
interface Named {
  readonly kind: NamedKind;
  readonly name: string;
}

/**
 * Draw a case of the name box: up to two elements, each of every class and every name, added to
 * `simple`'s item, each in an interaction of its own.
 */
const addedElements: Gen<readonly Named[]> = array(
  (source) => ({
    kind: source.draw(element(NAMED_KINDS)),
    name: source.draw(element(ADDED_NAMES)),
  }),
  { max: 2, min: 0 },
);

/**
 * How many cases {@link addedElements} draws: none, one of 6 classes by 2 names, or two.
 */
const ADDED_CASES = 1 + 12 + 12 ** 2;

/**
 * The elements of `simple`'s item before any is added: its three simple choices.
 */
const baseChoices: readonly Named[] = [
  { kind: "simple", name: "ChoiceA" },
  { kind: "simple", name: "ChoiceB" },
  { kind: "simple", name: "ChoiceC" },
];

/**
 * The name of a filler a gap or a gap text's interaction holds beside it, which no other element of
 * a case bears.
 *
 * @param at - The added element's place.
 * @returns The name.
 */
const fillerOf = (at: number): string => `F${String(at)}`;

/**
 * The interaction an added element stands in, bound to a response of its own, and that response's
 * declaration; a gap stands beside a filler gap text and a gap text beside a filler gap.
 *
 * @param added - The element.
 * @param at - Its place, which names its response and its filler.
 * @returns The interaction's markup and the declaration's.
 */
const interactionOf = ({ kind, name }: Named, at: number) => {
  const response = `RESPONSE${String(at + 2)}`;
  const declaration = (baseType: string) =>
    `<qti-response-declaration identifier="${response}" cardinality="single" base-type="${baseType}"/>`;
  const gapMatch = (text: string, gap: string) =>
    `<qti-gap-match-interaction response-identifier="${response}" max-associations="1"><qti-gap-text identifier="${text}" match-max="1">x</qti-gap-text><p>Fill <qti-gap identifier="${gap}"/>.</p></qti-gap-match-interaction>`;
  switch (kind) {
    case "simple": {
      return {
        declaration: declaration("identifier"),
        interaction: `<qti-choice-interaction response-identifier="${response}" max-choices="1"><qti-simple-choice identifier="${name}">x</qti-simple-choice></qti-choice-interaction>`,
      };
    }
    case "inline": {
      return {
        declaration: declaration("identifier"),
        interaction: `<p>Pick <qti-inline-choice-interaction response-identifier="${response}"><qti-inline-choice identifier="${name}">x</qti-inline-choice></qti-inline-choice-interaction>.</p>`,
      };
    }
    case "hotspot": {
      return {
        declaration: declaration("identifier"),
        interaction: `<qti-hotspot-interaction response-identifier="${response}" max-choices="1"><img src="images/sign.png" alt="Sign" width="100" height="100"/><qti-hotspot-choice identifier="${name}" shape="circle" coords="50,50,10"/></qti-hotspot-interaction>`,
      };
    }
    case "hottext": {
      return {
        declaration: declaration("identifier"),
        interaction: `<qti-hottext-interaction response-identifier="${response}" max-choices="1"><p><qti-hottext identifier="${name}">x</qti-hottext></p></qti-hottext-interaction>`,
      };
    }
    case "gapText": {
      return {
        declaration: declaration("directedPair"),
        interaction: gapMatch(name, fillerOf(at)),
      };
    }
    case "gap": {
      return {
        declaration: declaration("directedPair"),
        interaction: gapMatch(fillerOf(at), name),
      };
    }
  }
};

/**
 * The edits that add a case's elements to `simple`'s item: their interactions after its choice
 * interaction, their responses' declarations before its body.
 *
 * @param added - The elements.
 * @returns The search and replacement pairs, none for no element.
 */
const additionsOf = (added: readonly Named[]): readonly (readonly [string, string])[] => {
  const parts = added.map(interactionOf);

  return added.length === 0
    ? []
    : [
        [
          "</qti-choice-interaction>",
          `</qti-choice-interaction>${parts.map(({ interaction }) => interaction).join("")}`,
        ],
        [
          "<qti-item-body>",
          `${parts.map(({ declaration }) => declaration).join("")}<qti-item-body>`,
        ],
      ];
};

/**
 * An added element and the filler a gap or a gap text stands beside.
 *
 * @param named - The added element.
 * @param at - Its place, which names its filler.
 * @returns The element, and its filler where it has one.
 */
const withFiller = (named: Named, at: number): readonly Named[] => {
  switch (named.kind) {
    case "gapText": {
      return [named, { kind: "gap", name: fillerOf(at) }];
    }
    case "gap": {
      return [named, { kind: "gapText", name: fillerOf(at) }];
    }
    case "simple":
    case "inline":
    case "hotspot":
    case "hottext": {
      return [named];
    }
  }
};

/**
 * The elements a case's item holds: its own simple choices, each added element, and the filler a
 * gap or a gap text stands beside.
 *
 * @param added - The added elements.
 * @returns Every element of the nine classes the item holds.
 */
const elementsOf = (added: readonly Named[]): readonly Named[] => [
  ...baseChoices,
  ...added.flatMap(withFiller),
];

/**
 * Whether reading `choice-identifier-scope` bars two elements from sharing an identifier: each
 * class's sentence bars its own noun, so two of one class, and the four's "any other choice" bars
 * an element of the four and any choice of any class; a gap's sentence bars only gaps.
 *
 * @param left - One element.
 * @param right - The other.
 * @returns Whether one name for both breaks "Choice identifier key".
 */
const barredPair = (left: Named, right: Named): boolean =>
  left.kind === right.kind ||
  (FOUR_KINDS.has(left.kind) && CHOICE_KINDS.has(right.kind)) ||
  (FOUR_KINDS.has(right.kind) && CHOICE_KINDS.has(left.kind));

/**
 * The reading-104 laws an item of these elements breaks by its names: "Choice identifier key"
 * where two of them that {@link barredPair} bars share an identifier, in the one document whichever
 * interactions hold them.
 *
 * @param elements - The item's elements.
 * @returns The laws broken.
 */
const keyLawsOf = (elements: readonly Named[]): readonly string[] =>
  elements.some((left, at) =>
    elements.some(
      (right, other) => other > at && left.name === right.name && barredPair(left, right),
    ),
  )
    ? ["Choice identifier key"]
    : [];

/**
 * The names a simple choice of the variable box takes in place of `ChoiceA`: each item variable of
 * `simple`, its declared response and outcome, each built-in variable an item declares implicitly
 * (§2.2.2, §2.2.2.1), and a name no variable has.
 */
const VARIABLE_NAMES = [
  "RESPONSE",
  "SCORE",
  "completionStatus",
  "numAttempts",
  "duration",
  "QTI_CONTEXT",
  "Z",
] as const;

/**
 * A case of the variable box: the name `ChoiceA` takes, and whether it is written padded.
 */
interface VariableCase {
  readonly name: (typeof VARIABLE_NAMES)[number];
  readonly padded: boolean;
}

/**
 * Draw a case of the variable box: every name of {@link VARIABLE_NAMES}, bare and padded.
 */
const variableCase: Gen<VariableCase> = (source) => ({
  name: source.draw(element(VARIABLE_NAMES)),
  padded: source.draw(boolean),
});

/**
 * How many cases {@link variableCase} draws: 7 names, bare and padded.
 */
const VARIABLE_CASES = 7 * 2;

/**
 * Apply a reading-104 case's edits to the `simple` fixture's item, each search the item must hold.
 *
 * @param files - The fixture's files.
 * @param edits - The case's search and replacement pairs, in order.
 * @param name - The case's name, for the failure message.
 * @returns The files with the item edited.
 */
const editedItem = (
  files: readonly PackageFile[],
  edits: readonly (readonly [string, string])[],
  name: string,
): readonly PackageFile[] =>
  files.map((file) => {
    if (file.path !== simpleItem) {
      return file;
    }

    let text = new TextDecoder().decode(file.bytes);
    for (const [search, replacement] of edits) {
      assert.include(text, search, `${name}: the item holds ${search}`);
      text = text.replace(search, replacement);
    }

    return { ...file, bytes: new TextEncoder().encode(text) };
  });

/**
 * The two laws of reading `choice-identifier-scope`.
 */
const choiceNameLaws: ReadonlySet<string> = new Set([
  "Choice identifier key",
  "Choice not variable",
]);

/**
 * Every law the host judges, read once.
 */
const hostLaws = judgedLaws(Qti);

/**
 * Name the reading-104 laws a host judgment lists, each by its law's name.
 *
 * @param laws - The broken or skipped laws.
 * @returns Their names among reading `choice-identifier-scope`'s two.
 */
const choiceNameLawsOf = (laws: readonly { readonly law: Law }[]): readonly string[] =>
  [...lawNamesOf(laws)].filter((law) => choiceNameLaws.has(law));

/**
 * Name the reading-104 laws the schema's laws over the import's rows break. Two of the package's
 * own choices or hottexts of one key are refused before any SQL, on the key's law, as the write
 * refuses two rows one stratum adds at one key ("Choice identifier key" keys `Choice` and
 * `PlacedChoice` themselves, and `Hottext` and `PlacedHottext`); every other law is judged over the
 * rows the write stores, and must be.
 *
 * @param inputs - The import's rows.
 * @param name - The case, for a failure's words.
 * @returns Their names among reading `choice-identifier-scope`'s two.
 */
const hostChoiceNameLawsOf = (inputs: PackageInputs, name: string): readonly string[] => {
  const previewed = previewOf(inputs);
  if (Result.isFailure(previewed)) {
    const refusal = previewed.failure;

    return refusal._tag === "KeyConflict"
      ? choiceNameLawsOf([refusal])
      : assert.fail(`${name}: the write refuses the rows before any SQL, ${refusal._tag}`);
  }

  const host = judgeRows(previewed.success, hostLaws);
  assert.deepStrictEqual(choiceNameLawsOf(host.skipped), [], `${name}: judged`);

  return choiceNameLawsOf(host.broken);
};

/**
 * A name of a document, as {@link queryNameLawsOf} compares names: its document's place, its
 * package and path, and the identifier. An assembly is named by its head document's path, so a
 * placed name and a declared one meet at one key.
 *
 * @param pkg - The package's manifest identifier.
 * @param path - The document's path.
 * @param identifier - The name.
 * @returns The name's key.
 */
const nameKey = (pkg: string, path: string, identifier: string): string =>
  JSON.stringify([pkg, path, identifier]);

/**
 * The classes whose identifier sentence names the noun "choice" (§5.132.1, §5.73.1, §5.67.1 and
 * §5.131.1), restated apart from the schema's list.
 */
const choiceNouns: ReadonlySet<string> = new Set([
  "qti-hotspot-choice",
  "qti-inline-choice",
  "qti-simple-associable-choice",
  "qti-simple-choice",
]);

/**
 * The classes a "choice" bars: every class the information model calls a choice, all but the gap
 * (§6.17 GapChoice, §5.59, §5.65.1; §5.57's gaps are filled "from ... choices").
 */
const barredByChoice: ReadonlySet<string> = new Set([
  ...choiceNouns,
  "qti-associable-hotspot",
  "qti-gap-img",
  "qti-gap-text",
  "qti-hottext",
]);

/**
 * Whether some name of a scope is borne by two elements of one class, or by a "choice" and by
 * another element its sentence bars.
 *
 * @param named - Each element of the scope: its name's key and its kind.
 * @returns Whether a name is shared where reading `choice-identifier-scope` bars it.
 */
const choiceShares = (named: readonly { readonly key: string; readonly kind: string }[]): boolean =>
  [...Map.groupBy(named, ({ key }) => key).values()].some(
    (held) =>
      new Set(held.map(({ kind }) => kind)).size < held.length ||
      (held.some(({ kind }) => choiceNouns.has(kind)) &&
        held.filter(({ kind }) => barredByChoice.has(kind)).length > 1),
  );

/**
 * The names of reading `choice-identifier-scope`'s two rules over queries
 * (`#pantry/qti/queries.ts`) that the import's rows break, restated on the host, which judges no
 * derived relation (`#pantry/test/predicates.ts` `judgedKinds`): "Choice identifier key" where a
 * simple, inline, hotspot or simple associable choice of a document bears the name of another
 * element the information model calls a choice, of whichever class, or one its assembly places does
 * (`ChoiceSpaceName`, `PlacedChoiceSpaceName`); the per-class keys over `ChoiceNode` and
 * `PlacedChoiceNode`, derived too, where two elements of one class share a name; and "Choice not
 * variable" where a name one bears is a declaration's of its document, or in an item a built-in
 * variable's (`UnclaimedName`).
 *
 * @param inputs - The import's rows.
 * @returns The laws' names.
 */
const queryNameLawsOf = (inputs: PackageInputs): readonly string[] => {
  const places = nodePlacesOf(inputs);
  const kindAt = (path: string, start: bigint): string =>
    places.get(placeKey(path, start))?.kind ?? "";
  const chosenRows = [...inputs.Choice.values(), ...inputs.Hottext.values()];
  const placedRows = [...inputs.PlacedChoice.values(), ...inputs.PlacedHottext.values()];
  const chosen = chosenRows.map(({ identifier, package: pkg, path }) =>
    nameKey(pkg, path, identifier),
  );
  const placed = placedRows.map(({ assembly, identifier, package: pkg }) =>
    nameKey(pkg, assembly, identifier),
  );
  const shared =
    choiceShares(
      chosenRows.map(({ identifier, package: pkg, path, start }) => ({
        key: nameKey(pkg, path, identifier),
        kind: kindAt(path, start),
      })),
    ) ||
    choiceShares(
      placedRows.map(({ assembly, identifier, package: pkg, path, start }) => ({
        key: nameKey(pkg, assembly, identifier),
        kind: kindAt(path, start),
      })),
    );
  const declared = new Set(
    viewedDeclarationsOf(inputs).flatMap(({ name, package: pkg, path }) =>
      name === undefined ? [] : [nameKey(pkg, path, name)],
    ),
  );
  const builtIns = new Set(
    [...inputs.Document.values()].flatMap(({ package: pkg, path, rootKind }) =>
      rootKind === itemKind ? itemBuiltInNames.map((name) => nameKey(pkg, path, name)) : [],
    ),
  );
  const claimed = [...chosen, ...placed].some((name) => declared.has(name) || builtIns.has(name));

  return [
    ...(shared ? ["Choice identifier key"] : []),
    ...(claimed ? ["Choice not variable"] : []),
  ];
};

/**
 * Judge a case's edits of `simple`'s item by the law oracle and by the schema's laws over the
 * import's rows, and hold both to the reading-104 laws the case breaks.
 *
 * @param files - The fixture's files.
 * @param edits - The case's search and replacement pairs.
 * @param expected - The laws reading `choice-identifier-scope` says the case breaks.
 * @param name - The case, for a failure's words.
 * @returns Nothing; fails the case where either judge differs.
 */
const choiceNamesHold = (
  files: readonly PackageFile[],
  edits: readonly (readonly [string, string])[],
  expected: readonly string[],
  name: string,
) =>
  Effect.scoped(
    Effect.gen(function* choiceNamesJudged() {
      const edited = editedItem(files, edits, name);
      const judgment = yield* judge(edited, grammar, oracleLaws);
      assert.strictEqual(judgment._tag, "Judged", name);

      const oracle = [
        ...new Set(
          (judgment._tag === "Judged" ? judgment.breaches : [])
            .map(({ law }) => law)
            .filter((law) => choiceNameLaws.has(law)),
        ),
      ];
      const dir = yield* scopedPackage(new Map(edited.map((file) => [file.path, file.bytes])));
      const program = yield* readProgram(dir, nameOf(dir));
      assert.sameMembers(
        oracle,
        [...expected],
        `${name}: reading \`choice-identifier-scope\`, by the law oracle`,
      );
      assert.sameMembers(
        [
          ...new Set([
            ...hostChoiceNameLawsOf(program.inputs, name),
            ...queryNameLawsOf(program.inputs),
          ]),
        ],
        [...expected],
        `${name}: the schema's laws over the import's rows (#pantry/test/host-judge.ts), the per-class keys and the two rules over queries restated on the host (queryNameLawsOf), which the host judge reads none of`,
      );
    }),
  );

describe("qti/interactions.ts, reading `choice-identifier-scope` by the law oracle and the import's rows", () => {
  it.effect(
    `breaks Choice identifier key exactly where reading \`choice-identifier-scope\` bars two elements' shared name, over simple's item with up to two elements added: ${String(ADDED_CASES)} items`,
    (ctx) =>
      Effect.andThen(
        boxHolds(addedElements, ADDED_CASES),
        searched(
          ctx,
          Effect.gen(function* choiceNames() {
            const files = yield* readEntries(fixtures.simple);

            return yield* exhaust(
              {
                box: "simple's item with up to two elements added, each a simple choice, an inline choice, a hotspot choice, a hottext, a gap text or a gap, named ChoiceA, one of its own simple choices' names, or H, each in an interaction of its own",
                caseHang: Duration.seconds(30),
                coverage: requiredInSpace<"broken" | "held">(["broken", "held"]),
                generator: addedElements,
                literal: Formatter.format,
                oracle: {
                  kind: "specification",
                  name: "reading `choice-identifier-scope` as amended (§5.132.1, §5.55.1, §5.58.1, §5.65.1, §5.67.1, §5.73.1, §6.17, §7.16): each class's sentence bars its own noun, so two elements of one class never share a name in a document, the four whose noun is choice share theirs with no other choice of any class, and a gap is no choice (keyLawsOf); the law oracle and the schema's laws over the import's rows must both give it",
                },
                suite: "qti/interactions-choice-names",
              },
              (added, c) => {
                const expected = keyLawsOf(elementsOf(added));
                c.note(expected.length > 0 ? "broken" : "held");

                return choiceNamesHold(
                  files,
                  additionsOf(added),
                  expected,
                  Formatter.format(added),
                );
              },
            );
          }),
        ),
      ).pipe(Effect.provide(NodeServices.layer)),
  );

  it.effect(
    `breaks Choice not variable exactly where a choice bears an item variable's name, compared collapsed: ${String(VARIABLE_CASES)} items`,
    (ctx) =>
      Effect.andThen(
        boxHolds(variableCase, VARIABLE_CASES),
        searched(
          ctx,
          Effect.gen(function* choiceVariables() {
            const files = yield* readEntries(fixtures.simple);

            return yield* exhaust(
              {
                box: "simple's item with its choice ChoiceA named RESPONSE, SCORE, each built-in variable or Z, bare and padded with a space each side",
                caseHang: Duration.seconds(30),
                coverage: requiredInSpace<"broken" | "held">(["broken", "held"]),
                generator: variableCase,
                literal: Formatter.format,
                oracle: {
                  kind: "specification",
                  name: "reading `choice-identifier-scope`: no choice of an item bears the identifier of a declaration of its document or of a built-in variable, completionStatus, numAttempts, duration and QTI_CONTEXT (§2.2.2, §2.2.2.1), identifiers compared collapsed (reading `typed-value-whitespace`); the law oracle and the schema's laws over the import's rows must both give it",
                },
                suite: "qti/interactions-choice-variables",
              },
              ({ name, padded }, c) => {
                const expected = name === "Z" ? [] : ["Choice not variable"];
                c.note(expected.length > 0 ? "broken" : "held");

                return choiceNamesHold(
                  files,
                  [['identifier="ChoiceA"', `identifier="${padded ? ` ${name} ` : name}"`]],
                  expected,
                  `ChoiceA named ${JSON.stringify(padded ? ` ${name} ` : name)}`,
                );
              },
            );
          }),
        ),
      ).pipe(Effect.provide(NodeServices.layer)),
  );
});

/**
 * The base item's choice interaction, as written, which the PCI cases replace.
 */
const choiceInteraction = `<qti-choice-interaction response-identifier="RESPONSE" max-choices="1">
      <qti-simple-choice identifier="A">A</qti-simple-choice>
      <qti-simple-choice identifier="B">B</qti-simple-choice>
    </qti-choice-interaction>`;

/**
 * The element form of a PCI's module: the `qti-interaction-modules` child.
 */
const moduleElement = `<qti-interaction-modules><qti-interaction-module id="m"/></qti-interaction-modules>`;

/**
 * Which forms of its module a portable custom interaction writes.
 */
interface ModuleForms {
  /**
   * Whether it writes `module`.
   */
  readonly attribute: boolean;
  /**
   * Whether it writes `qti-interaction-modules`.
   */
  readonly element: boolean;
}

/**
 * A portable custom interaction of the base item, with or without each form of its module.
 *
 * @param forms - Which forms it writes.
 * @param content - What follows its module element, as written: by default its empty markup.
 * @returns The interaction's text.
 */
const pciOf = (forms: ModuleForms, content: string) =>
  `<qti-portable-custom-interaction response-identifier="RESPONSE"${forms.attribute ? ` module="m"` : ""} custom-interaction-type-identifier="t">${forms.element ? moduleElement : ""}${content}</qti-portable-custom-interaction>`;

/**
 * The base item with its choice interaction replaced.
 *
 * @param interaction - The text that replaces the choice interaction.
 * @returns The item's text.
 */
const itemWith = (interaction: string) => edit(item, choiceInteraction, interaction);

/**
 * The breaches of one law among a judgment's.
 *
 * @param law - The law's name.
 * @returns A function from a judgment to its breaches of the law.
 */
const breachesOfLaw = (law: string) => (judgment: Parameters<typeof breachesOf>[0]) =>
  breachesOf(judgment).filter((breach) => breach.law === law);

/**
 * The breaches of "PCI module source" in the base item with its choice interaction replaced by a
 * PCI.
 *
 * @param forms - Which forms of its module the PCI writes.
 * @returns The breaches.
 */
const pciBreachesOf = (forms: ModuleForms) =>
  Effect.map(
    judged({ ...base, "item.xml": itemWith(pciOf(forms, "<qti-interaction-markup/>")) }),
    breachesOfLaw("PCI module source"),
  );

/**
 * Draw a case of the module box: a PCI that writes `module` or not, and `qti-interaction-modules`
 * or not.
 */
const moduleForms: Gen<ModuleForms> = (source) => ({
  attribute: source.draw(boolean),
  element: source.draw(boolean),
});

/**
 * How many cases {@link moduleForms} draws: each form written or not.
 */
const MODULE_FORMS = 2 * 2;

describe("qti/interactions.ts, PCI module source", () => {
  it.effect(
    `is broken once by a PCI with neither module form, and by none that writes \`module\`, \`qti-interaction-modules\` or both: ${String(MODULE_FORMS)} PCIs`,
    (ctx) =>
      Effect.andThen(
        boxHolds(moduleForms, MODULE_FORMS),
        searched(
          ctx,
          exhaust(
            {
              box: "a PCI of the base item writing module or not and qti-interaction-modules or not",
              caseHang: Duration.seconds(30),
              coverage: noCoverage,
              generator: moduleForms,
              literal: Formatter.format,
              oracle: {
                kind: "specification",
                name: 'the information model\'s §5.106.2, "If this characteristic is provided the qti-interaction-modules child attribute is not required, if omitted then the modules child element is mandatory" (R10-a), read as a count of the forms each PCI writes: PCI module source breaks once where it writes neither',
              },
              suite: "qti/interactions-pci-module",
            },
            (forms) =>
              Effect.gen(function* moduleSource() {
                const breaches = yield* pciBreachesOf(forms);

                assert.lengthOf(
                  breaches,
                  forms.attribute || forms.element ? 0 : 1,
                  `${Formatter.format(forms)}: ${shown(breaches)}`,
                );
              }),
          ),
        ),
      ),
  );
});

/**
 * The laws a package breaches, in the base item with its choice interaction replaced.
 *
 * @param interaction - The text that replaces the choice interaction.
 * @param declarations - Text inserted before the item's first declaration.
 * @returns The distinct names of the laws breached.
 */
const lawsBreachedBy = (interaction: string, declarations: string) =>
  Effect.map(
    judged({
      "imsmanifest.xml": manifestOf(itemResource),
      "item.xml": edit(
        itemWith(interaction),
        "<qti-response-declaration",
        `${declarations}<qti-response-declaration`,
      ),
    }),
    (judgment) => [...new Set(breachesOf(judgment).map(({ law }) => law))],
  );

describe("qti/interactions.ts, the context variable and the markup's content", () => {
  it.effect("admits QTI_CONTEXT undeclared, the built-in context variable", () =>
    Effect.gen(function* undeclared() {
      const found = yield* lawsBreachedBy(contextPci("QTI_CONTEXT", ""), "");
      assert.notInclude(
        found,
        "Idref target",
        `${found.join(", ")}: the information model's §2.2.2.1, "There is one built-in context variable: 'QTI_CONTEXT'", and its issue #142, which makes a qti-context-variable's identifier "an open string" so that it names the built-in variable with no declaration`,
      );
      assert.notInclude(found, "Context variable reference", found.join(", "));
    }),
  );

  it.effect("admits an item that declares a record context QTI_CONTEXT and names it", () =>
    Effect.gen(function* declared() {
      const found = yield* lawsBreachedBy(
        contextPci("QTI_CONTEXT", ""),
        '<qti-context-declaration identifier="QTI_CONTEXT" cardinality="record"/>',
      );
      assert.notInclude(found, "Idref target", found.join(", "));
      assert.notInclude(found, "Context variable reference", found.join(", "));
    }),
  );

  it.effect("admits a foreign element in a markup's template", () =>
    Effect.gen(function* foreignTemplate() {
      const found = yield* lawsBreachedBy(
        contextPci(
          "QTI_CONTEXT",
          '<p>Tap</p><template><x:widget xmlns:x="urn:example:widget" size="3"/></template>',
        ),
        '<qti-context-declaration identifier="QTI_CONTEXT" cardinality="record"/>',
      );
      assert.deepStrictEqual(
        found,
        [],
        `${found.join(", ")}: readings \`lax-content-prose-rules\` and \`nested-root-in-wildcard\`, a template of the markup holds foreign content, which lax processing does not assess`,
      );
    }),
  );

  it.effect(
    "judges a custom interaction by Binding declared, and passes over the choice interaction in its content",
    () =>
      Effect.gen(function* customContent() {
        const inside = yield* lawsBreachedBy(
          `<qti-custom-interaction response-identifier="RESPONSE">${choiceInteraction.replace(
            'response-identifier="RESPONSE"',
            'response-identifier="NOWHERE"',
          )}</qti-custom-interaction>`,
          "",
        );
        assert.notInclude(
          inside,
          "Binding declared",
          `${inside.join(", ")}: reading \`lax-content-prose-rules\`, a custom interaction's content is lax, and a qti-choice-interaction, declared only locally, has no declaration lax processing finds, so the walk passes it over and Binding declared does not judge its response`,
        );

        const outside = yield* lawsBreachedBy(
          '<qti-custom-interaction response-identifier="NOWHERE"/>',
          "",
        );
        assert.include(
          outside,
          "Binding declared",
          `${outside.join(", ")}: the custom interaction's own binding is judged, the control`,
        );
      }),
  );

  it.effect("refuses a choice interaction in a div of a PCI's markup by N6 ancestry", () =>
    Effect.gen(function* nested() {
      const found = yield* lawsBreachedBy(
        contextPci("QTI_CONTEXT", `<div>${choiceInteraction}</div>`),
        '<qti-context-declaration identifier="QTI_CONTEXT" cardinality="record"/>',
      );
      assert.include(found, "N6 ancestry", found.join(", "));
    }),
  );
});
