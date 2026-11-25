/**
 * The O3 overlays' free tests: the closed data the laws read is the grammar's: the content
 * references, the last-slot rules, the count pairs and the attributes copied. The built-in
 * variables the laws read are `BuiltInVariable`'s own rows, under each root
 * (`#pantry/test/built-in-roots.oracle.test.ts`).
 */
import type { Law } from "@bjornpagen/grizzle";
import * as NodeServices from "@effect/platform-node/NodeServices";
import { assert, describe, it } from "@effect/vitest";
import { Effect, Option, Result } from "effect";
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
    // Oracle: the oracle's `contentLawOf`, the law a reference by (kind, attribute) breaks.
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
          `${kind} ${attribute}`,
        );
      }
    }
  });

  it("reads every LastWhere rule over a shape of a hotspot kind under interactions, so each hotspot's shape states it", () => {
    // Oracle: the grammar's `lastWhere` rules, which the default-hotspot check is built from.
    assert.isNotEmpty(grammar.lastWhere);
    for (const { attribute, kind, parents } of grammar.lastWhere) {
      assert.strictEqual(attribute, "shape", kind);
      assert.include(hotspotKinds, kind);
      for (const parent of parents) {
        assert.include(interactionKinds, parent, kind);
      }
    }
  });

  it("holds every ChoiceBound kind an interaction or a choice, so an Interaction or a Choice row brings its CountBound", () => {
    // Oracle: the grammar's interaction roster and `choiceKinds`, against `ChoiceBound`'s rows.
    for (const { kind } of ChoiceBound.rows) {
      assert.isTrue(
        interactionKinds.includes(kind) || choiceKinds.some((choice) => choice === kind),
        kind,
      );
    }
  });

  it("reads reading 92's cardinality kinds' most count with an XSD default, so the law reads a known most", () => {
    // Oracle: the inventory leaf's attribute declarations, by way of `countDefault`, and
    // `ChoiceBound`'s max attributes.
    for (const kind of cardinalityKinds) {
      const bound = ChoiceBound.rows.find((row) => row.kind === kind);

      assert.isDefined(bound, kind);
      assert.include(["max-choices", "max-associations"], bound?.max, kind);
      assert.isTrue(Option.isSome(countDefault(kind, bound?.max ?? "max-choices")), kind);
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
    // Oracle: the information model's class descriptions: the custom, portable custom and order
    // interactions state no binding, so each binds a response of any type (§5.36, §5.106 and
    // §5.97; spec reading 172).
    assert.deepStrictEqual(
      [...anyTypeKinds].toSorted(),
      [
        "qti-custom-interaction",
        "qti-order-interaction",
        "qti-portable-custom-interaction",
      ].toSorted(),
    );
  });
});

/**
 * The `simple` fixture's item, the one document the reading-104 cases edit.
 */
const simpleItem = "choice.xml";

/**
 * A second choice interaction, bound to a declared response of its own, whose one simple choice is
 * named as given: the item-wide scope's case and its control.
 *
 * @param identifier - The simple choice's identifier.
 * @returns The interaction's markup.
 */
const secondInteraction = (identifier: string): string =>
  `<qti-choice-interaction response-identifier="RESPONSE2" max-choices="1"><qti-simple-choice identifier="${identifier}">x</qti-simple-choice></qti-choice-interaction>`;

/**
 * The second interaction's response declaration.
 */
const secondDeclaration =
  '<qti-response-declaration identifier="RESPONSE2" cardinality="single" base-type="identifier"/>';

/**
 * A declaration of a single response of a base type, named as given, for a case's added
 * interaction.
 *
 * @param identifier - The response's identifier.
 * @param baseType - Its base type.
 * @returns The declaration's markup.
 */
const responseDeclaration = (identifier: string, baseType: string): string =>
  `<qti-response-declaration identifier="${identifier}" cardinality="single" base-type="${baseType}"/>`;

/**
 * A gap match interaction bound to `RESPONSE2`, its one gap text and its one gap named as given:
 * reading 104's gap and gap text of one interaction, and their control.
 *
 * @param text - The gap text's identifier.
 * @param gap - The gap's identifier.
 * @returns The interaction's markup.
 */
const gapMatch = (text: string, gap: string): string =>
  `<qti-gap-match-interaction response-identifier="RESPONSE2" max-associations="1"><qti-gap-text identifier="${text}" match-max="1">x</qti-gap-text><p>Fill <qti-gap identifier="${gap}"/>.</p></qti-gap-match-interaction>`;

/**
 * The reading-104 cases over the `simple` fixture's item: each edit, written as search and
 * replacement pairs applied in order, and the laws of the two it must break.
 */
const choiceNameCases: readonly {
  readonly breaks: readonly ("Choice identifier key" | "Choice not variable")[];
  readonly edits: readonly (readonly [string, string])[];
  readonly name: string;
}[] = [
  { breaks: [], edits: [], name: "the item as it is" },
  {
    breaks: ["Choice not variable"],
    edits: [['identifier="ChoiceA"', 'identifier="SCORE"']],
    name: "a choice named as the declared SCORE",
  },
  {
    breaks: ["Choice not variable"],
    edits: [['identifier="ChoiceA"', 'identifier=" RESPONSE "']],
    name: "a choice named as the declared RESPONSE, padded",
  },
  {
    breaks: ["Choice not variable"],
    edits: [['identifier="ChoiceA"', 'identifier="numAttempts"']],
    name: "a choice named as the built-in numAttempts",
  },
  {
    breaks: ["Choice identifier key"],
    edits: [['identifier="ChoiceB"', 'identifier="ChoiceA"']],
    name: "two choices of one interaction named ChoiceA",
  },
  {
    breaks: ["Choice identifier key"],
    edits: [
      ["</qti-choice-interaction>", `</qti-choice-interaction>${secondInteraction("ChoiceA")}`],
      ["<qti-item-body>", `${secondDeclaration}<qti-item-body>`],
    ],
    name: "choices of two interactions named ChoiceA",
  },
  {
    breaks: [],
    edits: [
      ["</qti-choice-interaction>", `</qti-choice-interaction>${secondInteraction("ChoiceZ")}`],
      ["<qti-item-body>", `${secondDeclaration}<qti-item-body>`],
    ],
    name: "choices of two interactions named apart",
  },
  {
    breaks: ["Choice identifier key"],
    edits: [
      [
        "</qti-choice-interaction>",
        '</qti-choice-interaction><qti-hottext-interaction response-identifier="RESPONSE2" max-choices="1"><p><qti-hottext identifier="ChoiceA">x</qti-hottext></p></qti-hottext-interaction>',
      ],
      ["<qti-item-body>", `${secondDeclaration}<qti-item-body>`],
    ],
    name: "a hottext and a simple choice named ChoiceA, two classes",
  },
  {
    breaks: ["Choice identifier key"],
    edits: [
      [
        "</qti-choice-interaction>",
        '</qti-choice-interaction><p>Pick <qti-inline-choice-interaction response-identifier="RESPONSE2"><qti-inline-choice identifier="ChoiceA">x</qti-inline-choice></qti-inline-choice-interaction>.</p>',
      ],
      ["<qti-item-body>", `${secondDeclaration}<qti-item-body>`],
    ],
    name: "an inline choice and a simple choice named ChoiceA, two classes",
  },
  {
    breaks: [],
    edits: [
      ["</qti-choice-interaction>", `</qti-choice-interaction>${gapMatch("G", "G")}`],
      ["<qti-item-body>", `${responseDeclaration("RESPONSE2", "directedPair")}<qti-item-body>`],
    ],
    name: "a gap and a gap text of one gap match named G, each its own noun",
  },
  {
    breaks: [],
    edits: [
      ["</qti-choice-interaction>", `</qti-choice-interaction>${gapMatch("T", "ChoiceA")}`],
      ["<qti-item-body>", `${responseDeclaration("RESPONSE2", "directedPair")}<qti-item-body>`],
    ],
    name: "a gap and a simple choice named ChoiceA, a gap no choice",
  },
  {
    breaks: ["Choice identifier key"],
    edits: [
      ["</qti-choice-interaction>", `</qti-choice-interaction>${gapMatch("ChoiceA", "G")}`],
      ["<qti-item-body>", `${responseDeclaration("RESPONSE2", "directedPair")}<qti-item-body>`],
    ],
    name: "a gap text and a simple choice named ChoiceA, a gap text a choice",
  },
  {
    breaks: [],
    edits: [
      [
        "</qti-choice-interaction>",
        `</qti-choice-interaction>${gapMatch("H", "G")}<qti-hottext-interaction response-identifier="RESPONSE3" max-choices="1"><p><qti-hottext identifier="H">x</qti-hottext></p></qti-hottext-interaction>`,
      ],
      [
        "<qti-item-body>",
        `${responseDeclaration("RESPONSE2", "directedPair")}${responseDeclaration("RESPONSE3", "identifier")}<qti-item-body>`,
      ],
    ],
    name: "a gap text and a hottext named H, neither's noun the other's",
  },
  {
    breaks: ["Choice identifier key"],
    edits: [
      [
        "</qti-choice-interaction>",
        `</qti-choice-interaction><qti-gap-match-interaction response-identifier="RESPONSE2" max-associations="1"><qti-gap-text identifier="T" match-max="1">x</qti-gap-text><qti-gap-text identifier="T" match-max="1">y</qti-gap-text><p>Fill <qti-gap identifier="G"/>.</p></qti-gap-match-interaction>`,
      ],
      ["<qti-item-body>", `${responseDeclaration("RESPONSE2", "directedPair")}<qti-item-body>`],
    ],
    name: "two gap texts of one gap match named T, one class",
  },
  {
    breaks: [],
    edits: [
      ["</qti-choice-interaction>", `</qti-choice-interaction>${gapMatch("T", "G")}`],
      ["<qti-item-body>", `${responseDeclaration("RESPONSE2", "directedPair")}<qti-item-body>`],
    ],
    name: "a gap and a gap text of one gap match named apart",
  },
  {
    breaks: ["Choice identifier key"],
    edits: [
      [
        "</qti-choice-interaction>",
        '</qti-choice-interaction><qti-hotspot-interaction response-identifier="RESPONSE2" max-choices="1"><img src="images/sign.png" alt="Sign" width="100" height="100"/><qti-hotspot-choice identifier="H" shape="circle" coords="50,50,10"/></qti-hotspot-interaction><qti-hottext-interaction response-identifier="RESPONSE3" max-choices="1"><p><qti-hottext identifier="H">x</qti-hottext></p></qti-hottext-interaction>',
      ],
      [
        "<qti-item-body>",
        `${secondDeclaration}${responseDeclaration("RESPONSE3", "identifier")}<qti-item-body>`,
      ],
    ],
    name: "a hotspot choice and a hottext named H, two classes",
  },
];

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
 * The two laws of reading 104.
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
 * @returns Their names among reading 104's two.
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
 * @returns Their names among reading 104's two.
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
 * @returns Whether a name is shared where reading 104 bars it.
 */
const choiceShares = (named: readonly { readonly key: string; readonly kind: string }[]): boolean =>
  [...Map.groupBy(named, ({ key }) => key).values()].some(
    (held) =>
      new Set(held.map(({ kind }) => kind)).size < held.length ||
      (held.some(({ kind }) => choiceNouns.has(kind)) &&
        held.filter(({ kind }) => barredByChoice.has(kind)).length > 1),
  );

/**
 * The names of reading 104's two rules over queries (`#pantry/qti/queries.ts`) that the import's
 * rows break, restated on the host, which judges no derived relation (`#pantry/test/predicates.ts`
 * `judgedKinds`): "Choice identifier key" where a simple, inline, hotspot or simple associable
 * choice of a document bears the name of another element the information model calls a choice, of
 * whichever class, or one its assembly places does (`ChoiceSpaceName`, `PlacedChoiceSpaceName`);
 * the per-class keys over `ChoiceNode` and `PlacedChoiceNode`, derived too, where two elements of
 * one class share a name; and "Choice not variable" where a name one bears is a declaration's of
 * its document, or in an item a built-in variable's (`UnclaimedName`).
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

describe("qti/interactions.ts, reading 104 by the law oracle", () => {
  it.effect(
    "breaks Choice not variable and Choice identifier key exactly where reading 104 says, over edits of simple's item",
    () =>
      // Oracle: the specification as a checker, reading 104 as amended (§5.132.1, §5.55.1, §5.58.1,
      // §5.65.1, §5.67.1, §5.73.1, §6.17, §7.16, §2.2.2): each class's sentence bars its own noun,
      // so two elements of one class never share a name in a document, and the four whose noun is
      // "choice" share theirs with no other choice of any class, a gap being none; and no choice
      // names an item variable, declared or built in; each case's expected laws are read off its
      // edit. Bound: the `simple` fixture as it is and 15 edits of its item: a choice named as a
      // declared outcome, a declared response padded and a built-in, two choices of one
      // interaction and of two named alike, two interactions' choices named apart, a hottext, an
      // inline choice beside a simple choice of one name, a gap and a gap text of one gap match
      // named alike and apart, a gap and a gap text each beside a simple choice of its name, a gap
      // text beside a hottext of one name, two gap texts of one name, and a hotspot choice beside
      // a hottext of one name.
      Effect.gen(function* choiceNames() {
        const files = yield* readEntries(fixtures.simple);
        for (const { breaks, edits, name } of choiceNameCases) {
          const edited = editedItem(files, edits, name);
          const judgment = yield* judge(edited, grammar, oracleLaws);
          assert.strictEqual(judgment._tag, "Judged", name);

          const found = judgment._tag === "Judged" ? judgment.breaches.map(({ law }) => law) : [];
          assert.sameMembers(
            [
              ...new Set(
                found.filter(
                  (law) => law === "Choice identifier key" || law === "Choice not variable",
                ),
              ),
            ],
            [...breaks],
            name,
          );
        }
      }).pipe(Effect.provide(NodeServices.layer)),
  );

  it.effect(
    "breaks the same reading-104 laws by the schema's laws over the import's rows as by the law oracle",
    () =>
      // Oracle: two implementations side by side, the law oracle's choice names, which group the
      // document's choices by class and by identifier alone, and the schema's laws over the
      // import's rows (`#pantry/test/host-judge.ts`): the per-class keys, and the two rules over
      // queries restated on the host ({@link queryNameLawsOf}), which the host judge reads none
      // of; each must break exactly the case's laws among reading 104's two, and judge both.
      // Bound: the same 16 packages as the oracle's own test above.
      Effect.gen(function* choiceNamesByRows() {
        const files = yield* readEntries(fixtures.simple);
        for (const { breaks, edits, name } of choiceNameCases) {
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
          assert.sameMembers(oracle, [...breaks], `${name}: the oracle`);
          assert.sameMembers(
            [
              ...new Set([
                ...hostChoiceNameLawsOf(program.inputs, name),
                ...queryNameLawsOf(program.inputs),
              ]),
            ],
            [...breaks],
            `${name}: the rows`,
          );
        }
      }).pipe(Effect.scoped, Effect.provide(NodeServices.layer)),
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
const pciOf = ({ attribute, element }: ModuleForms, content: string) =>
  `<qti-portable-custom-interaction response-identifier="RESPONSE"${attribute ? ` module="m"` : ""} custom-interaction-type-identifier="t">${element ? moduleElement : ""}${content}</qti-portable-custom-interaction>`;

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

describe("qti/interactions.ts, PCI module source", () => {
  it.effect(
    "is broken once by a PCI with neither module form, and by none that writes `module`, `qti-interaction-modules` or both",
    () =>
      // Oracle: the information model's §5.106.2, "If this characteristic is provided the
      // qti-interaction-modules child attribute is not required, if omitted then the modules child
      // element is mandatory" (R10-a), read as a count of the forms each PCI writes, over the four
      // ways a PCI writes them.
      Effect.gen(function* moduleSource() {
        const neither = yield* pciBreachesOf({ attribute: false, element: false });
        assert.lengthOf(neither, 1, shown(neither));
        for (const forms of [
          { attribute: true, element: false },
          { attribute: false, element: true },
          { attribute: true, element: true },
        ]) {
          const held = yield* pciBreachesOf(forms);
          assert.lengthOf(held, 0, shown(held));
        }
      }),
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
    // Oracle: the information model's §2.2.2.1, "There is one built-in context variable:
    // 'QTI_CONTEXT'", and its issue #142, which makes a `qti-context-variable`'s `identifier` "an
    // open string" so that it names the built-in variable with no declaration.
    Effect.gen(function* undeclared() {
      const found = yield* lawsBreachedBy(contextPci("QTI_CONTEXT"), "");
      assert.notInclude(found, "Idref target", found.join(", "));
      assert.notInclude(found, "Context variable reference", found.join(", "));
    }),
  );

  it.effect("admits an item that declares a record context QTI_CONTEXT and names it", () =>
    Effect.gen(function* declared() {
      const found = yield* lawsBreachedBy(
        contextPci("QTI_CONTEXT"),
        '<qti-context-declaration identifier="QTI_CONTEXT" cardinality="record"/>',
      );
      assert.notInclude(found, "Idref target", found.join(", "));
      assert.notInclude(found, "Context variable reference", found.join(", "));
    }),
  );

  it.effect("admits a foreign element in a markup's template", () =>
    // Oracle: reading 57 and reading 6, a `template` of the markup holds foreign content, which
    // lax processing does not assess.
    Effect.gen(function* foreignTemplate() {
      const found = yield* lawsBreachedBy(
        contextPci(
          "QTI_CONTEXT",
          '<p>Tap</p><template><x:widget xmlns:x="urn:example:widget" size="3"/></template>',
        ),
        '<qti-context-declaration identifier="QTI_CONTEXT" cardinality="record"/>',
      );
      assert.deepStrictEqual(found, [], found.join(", "));
    }),
  );

  it.effect(
    "judges a custom interaction by Binding declared, and passes over the choice interaction in its content",
    () =>
      // Oracle: reading 57: a custom interaction's content is lax, and a `qti-choice-interaction`,
      // declared only locally, has no declaration lax processing finds, so the walk passes it over
      // and "Binding declared" does not judge its response (the custom interaction's own binding is
      // judged: the control).
      Effect.gen(function* customContent() {
        const inside = yield* lawsBreachedBy(
          `<qti-custom-interaction response-identifier="RESPONSE">${choiceInteraction.replace(
            'response-identifier="RESPONSE"',
            'response-identifier="NOWHERE"',
          )}</qti-custom-interaction>`,
          "",
        );
        assert.notInclude(inside, "Binding declared", inside.join(", "));

        const outside = yield* lawsBreachedBy(
          '<qti-custom-interaction response-identifier="NOWHERE"/>',
          "",
        );
        assert.include(outside, "Binding declared", outside.join(", "));
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
