import { assert, describe, it } from "@effect/vitest";
import { exhaust } from "@bjornpagen/testing/explore";
import { noCoverage, requiredInSpace } from "@bjornpagen/testing/features";
import { array, constant, element, int, map, oneOf } from "@bjornpagen/testing/gen";
import type { Gen } from "@bjornpagen/testing/gen";
import { searched } from "@bjornpagen/testing/vitest";
import { growthFactor, growthLimit, growthRatio } from "@qti-pie/crust/test/growth.ts";
import { Duration, Effect, Formatter, Option } from "effect";
import { configure } from "#plate/configuration.ts";
import type { SourceAttribute, SourceDocument, SourceElement } from "#plate/document/source.ts";
import { choiceOrder } from "#plate/interactions/choice.ts";
import type { ChoiceInteraction, ChoicePayload } from "#plate/interactions/choice.ts";
import type {
  ExtendedTextInteraction,
  ExtendedTextPayload,
} from "#plate/interactions/extended-text.ts";
import type {
  InlineChoiceInteraction,
  InlineChoicePayload,
} from "#plate/interactions/inline-choice.ts";
import type { TextEntryInteraction, TextEntryPayload } from "#plate/interactions/text-entry.ts";
import { interactionsIn, redactedInteractionsIn } from "#plate/model/interactions.ts";
import type {
  BodyNode,
  Item,
  PrintedVariable,
  ResponseDeclaration,
  SimpleChoice,
  TemplateContent,
  TemplateDeclaration,
  TemplateVisibility,
  Unsupported,
  UnsupportedFeature,
} from "#plate/model/item.ts";
import { boxHolds } from "#plate/test/box.ts";
import { recordOf } from "#plate/test/records.ts";
import type { ItemRecord, RedactRecord, Showing } from "#plate/model/record.ts";
import { format, nullOf, nullRecord } from "#plate/model/values.ts";
import type { Declared, Responses, ResponseValue, Value } from "#plate/model/values.ts";
import { interactionPayload } from "#plate/payload.ts";
import type { PairedInteraction, View } from "#plate/payload.ts";
import { redact } from "#plate/redact.ts";
import { shownResponses, startingResponses } from "#plate/starting.ts";
import { hiddenOnlyResponses, redactItem, redactStructure } from "#plate/redact/walk.ts";
import type { Redacted } from "#plate/redact/walk.ts";
import { jsonField } from "#plate/test/fixtures.ts";
import {
  feedbackHidden,
  pageOf,
  presentedChoices,
  shownToCandidate,
  underRecord,
} from "#plate/test/page.ts";
import { attr, doc, el, text as sourceText } from "#plate/test/source.ts";
import { admittedSource } from "#plate/test/admitted.ts";
import { acceptedItem, acceptForTest } from "#plate/validate/verdict.ts";
import type { Accepted } from "#plate/validate/verdict.ts";

/**
 * The values a page must never hold of an item, read from its declarations: each response's
 * correct values and mapping keys and each outcome's default, which belong to the response
 * processing the QTI database runs, each in its lexical form. A response's own default is no
 * secret: the response starts at it (spec reading `response-default`).
 *
 * @param subject The item.
 * @returns The secrets, in declaration order.
 */
const secretsOf = (subject: Item): readonly string[] => [
  ...[...subject.responses.values()].flatMap((declaration) => [
    ...Option.toArray(declaration.correct).flatMap((value) => value.values.map(format)),
    ...Option.match(declaration.mapping, {
      onNone: () => [],
      onSome: (mapping) => mapping.entries.map((entry) => format(entry.key)),
    }),
  ]),
  ...[...subject.outcomes.values()].flatMap((declaration) =>
    Option.toArray(declaration.defaultValue).flatMap((value) => value.values.map(format)),
  ),
];

/**
 * The default of {@link item}'s `NAMED`, which a Text Entry binds: the value the response starts
 * at, which the redacted item keeps and the payload never holds (spec reading `response-default`).
 */
const responseDefault = "MarkerResponseDefault";

/**
 * The item instance every payload here is built for.
 */
const instance = "6f1c2e9a-0d4b-4f3e-9a51-3b7d2c8e1f40";

/**
 * Construct a single value.
 *
 * @param single The one value it holds.
 * @returns The value of `single`'s base type, of cardinality `single`.
 */
const one = (single: Value["values"][number]): Value => ({
  baseType: single.baseType,
  cardinality: "single",
  values: [single],
});

/**
 * Construct a text node of the body.
 *
 * @param value The text.
 * @returns The node.
 */
const text = (value: string): BodyNode => ({ kind: "text", text: value });

/**
 * Construct a paragraph that carries an authored id, which an `aria-labelledby` can name.
 *
 * @param id The id.
 * @returns The paragraph, which holds the id as text.
 */
const idParagraph = (id: string): BodyNode => ({
  attributes: [{ name: "id", value: id }],
  children: [text(id)],
  kind: "element",
  path: `qti-assessment-item/qti-item-body/p[@id="${id}"]`,
  tag: "p",
});

/**
 * Construct a Text Entry with no authored name, bound to a single string response.
 *
 * @param response The response it binds.
 * @returns The interaction.
 */
const textEntry = (response: string): TextEntryInteraction => ({
  ariaLabel: Option.none(),
  ariaLabelledby: Option.none(),
  base: 10,
  baseType: "string",
  cardinality: "single",
  catalog: Option.none(),
  class: Option.none(),
  data: [],
  expectedLength: Option.none(),
  id: Option.none(),
  kind: "text-entry",
  path: `qti-assessment-item/qti-item-body/p[2]/qti-text-entry-interaction[${response}]`,
  patternMask: Option.none(),
  patternMaskMessage: Option.none(),
  placeholder: Option.none(),
  promptCatalog: Option.none(),
  response,
});

/**
 * A Choice with a Prompt, bound to `CAPITAL`, whose correct response and mapping key are markers.
 */
const choice: ChoiceInteraction = {
  ariaLabel: Option.none(),
  ariaLabelledby: Option.none(),
  cardinality: "single",
  catalog: Option.none(),
  choices: [
    {
      catalog: Option.none(),
      content: [text("Paris")],
      fixed: false,
      identifier: "A",
      templateVisibility: Option.none(),
    },
    {
      catalog: Option.none(),
      content: [text("Lyon")],
      fixed: false,
      identifier: "B",
      templateVisibility: Option.none(),
    },
  ],
  class: Option.some("stacked"),
  data: [],
  id: Option.none(),
  kind: "choice",
  maxChoices: 1n,
  messages: { max: Option.none(), min: Option.none() },
  minChoices: 0n,
  orientation: "vertical",
  path: "qti-assessment-item/qti-item-body/qti-choice-interaction",
  prompt: Option.some([text("Which city is the capital of France?")]),
  promptCatalog: Option.none(),
  response: "CAPITAL",
  shades: [],
  shuffle: false,
};

/**
 * A shuffled single Choice of five planets, bound to `PLANET`, whose third choice, `P2`, is fixed.
 */
const planets: ChoiceInteraction = {
  ...choice,
  choices: ["Mercury", "Venus", "Earth", "Mars", "Jupiter"].map((planet, index) => ({
    catalog: Option.none(),
    content: [text(planet)],
    fixed: index === 2,
    identifier: `P${String(index)}`,
    templateVisibility: Option.none(),
  })),
  prompt: Option.some([text("Which planet is the largest?")]),
  response: "PLANET",
  shuffle: true,
};

/**
 * An Extended Text named by its Prompt, bound to `ESSAY`.
 */
const essay: ExtendedTextInteraction = {
  ...textEntry("ESSAY"),
  cardinality: "single",
  expectedLines: Option.some(3n),
  format: "plain",
  kind: "extended-text",
  maxStrings: Option.none(),
  minStrings: 0n,
  path: "qti-assessment-item/qti-item-body/qti-extended-text-interaction",
  prompt: Option.some([text("Why is it the capital?")]),
};

/**
 * A hand-built item: a paragraph, a Choice, a paragraph holding two unnamed Text Entries and one
 * named by `aria-label`, an Extended Text with a Prompt, and an unsupported feedback block. Its
 * correct responses, mapping key, `NAMED` default, `FEEDBACK` default and processing value are
 * markers, strings its body holds nowhere, so a page that holds one leaked it.
 */
const item: Item = {
  adaptive: false,
  body: [
    {
      attributes: [{ name: "class", value: "lead" }],
      children: [text("Answer each part.")],
      kind: "element",
      path: "qti-assessment-item/qti-item-body/p[1]",
      tag: "p",
    },
    choice,
    {
      attributes: [],
      children: [
        text("Two other cities: "),
        textEntry("FIRST"),
        text(" and "),
        textEntry("SECOND"),
        text(". A third: "),
        { ...textEntry("NAMED"), ariaLabel: Option.some("Third city") },
      ],
      kind: "element",
      path: "qti-assessment-item/qti-item-body/p[2]",
      tag: "p",
    },
    essay,
    {
      feature: "qti-feedback-block",
      kind: "unsupported",
      path: "qti-assessment-item/qti-item-body/qti-feedback-block",
    },
  ],
  content: {
    "qti-assessment-stimulus-ref": [],
    "qti-catalog-info": [],
    "qti-companion-materials-info": [],
  },
  contexts: new Map(),
  document: "items/capitals.xml",
  identifier: "capitals",
  lang: Option.none(),
  modalFeedback: [],
  outcomes: new Map([
    [
      "SCORE",
      {
        baseType: "float",
        cardinality: "single",
        defaultValue: Option.none(),
        identifier: "SCORE",
        interpretation: Option.none(),
        longInterpretation: Option.none(),
        lookupTable: Option.none(),
        masteryValue: Option.none(),
        normalMaximum: Option.none(),
        normalMinimum: Option.none(),
        view: Option.none(),
      },
    ],
    [
      "FEEDBACK",
      {
        baseType: "identifier",
        cardinality: "single",
        defaultValue: Option.some(one({ baseType: "identifier", value: "MarkerOutcomeDefault" })),
        identifier: "FEEDBACK",
        interpretation: Option.none(),
        longInterpretation: Option.none(),
        lookupTable: Option.none(),
        masteryValue: Option.none(),
        normalMaximum: Option.none(),
        normalMinimum: Option.none(),
        view: Option.none(),
      },
    ],
  ]),
  records: new Map(),
  responses: new Map([
    [
      "CAPITAL",
      {
        areaMapping: Option.none(),
        baseType: "identifier",
        cardinality: "single",
        correct: Option.some(one({ baseType: "identifier", value: "MarkerCorrectChoice" })),
        defaultValue: Option.none(),
        identifier: "CAPITAL",
        mapping: Option.some({
          defaultValue: 0,
          entries: [
            {
              caseSensitive: false,
              key: { baseType: "identifier", value: "MarkerMapKey" },
              value: 1,
            },
          ],
          lowerBound: Option.none(),
          upperBound: Option.none(),
        }),
      },
    ],
    [
      "FIRST",
      {
        areaMapping: Option.none(),
        baseType: "string",
        cardinality: "single",
        correct: Option.some(one({ baseType: "string", value: "MarkerCorrectText" })),
        defaultValue: Option.none(),
        identifier: "FIRST",
        mapping: Option.none(),
      },
    ],
    ...["SECOND", "NAMED", "ESSAY"].map(
      (identifier) =>
        [
          identifier,
          {
            areaMapping: Option.none(),
            baseType: "string",
            cardinality: "single",
            correct: Option.none(),
            defaultValue:
              identifier === "NAMED"
                ? Option.some(one({ baseType: "string", value: "MarkerResponseDefault" }))
                : Option.none(),
            identifier,
            mapping: Option.none(),
          },
        ] as const,
    ),
  ]),
  templated: false,
  templates: new Map(),
  title: "Capitals",
  unheld: new Map(),
  unsupported: [
    {
      feature: "qti-feedback-block",
      path: "qti-assessment-item/qti-item-body/qti-feedback-block",
      shown: "notice",
    },
  ],
};

/**
 * The item as the page may know it.
 */
const redacted = redactItem(item, shownToCandidate, feedbackHidden);

/**
 * The view of a first render: no values.
 */
const answering: View = { host: {}, instance, seed: "", values: new Map() };

/**
 * The characters a seed of the seed box is written with: a digit, a letter and the space. A seed is
 * any string a host chooses, used as given (`seed` in `#plate/configuration.ts`), so the box is
 * every short string of a few kinds of character, the empty one among them.
 */
const SEED_ALPHABET = ["7", "a", " "] as const;

/**
 * Draw a seed of the seed box: every string of 0 to 2 of {@link SEED_ALPHABET}.
 */
const seedBox: Gen<string> = map(array(element(SEED_ALPHABET), { max: 2, min: 0 }), (characters) =>
  characters.join(""),
);

/**
 * How many seeds {@link seedBox} draws.
 */
const SEEDS = 1 + 3 + 3 ** 2;

/**
 * A case of a search over a payload may run this long before it is stopped and reported.
 */
const caseHang = Duration.seconds(30);

/**
 * Draw an `aria-label` of the aria box: none, or every text of 0 to 2 of a letter, the space and
 * a character above 0x7f.
 */
const ariaLabelBox: Gen<Option.Option<string>> = oneOf([
  constant(Option.none()),
  map(array(element(["a", " ", "é"]), { max: 2, min: 0 }), (characters) =>
    Option.some(characters.join("")),
  ),
]);

/**
 * Draw an `aria-labelledby` of the aria box: none, the id of the paragraph beside the Choice, an id
 * no element carries, or both, an IDREFS of two.
 */
const ariaLabelledbyBox: Gen<Option.Option<string>> = oneOf([
  constant(Option.none()),
  map(element(["intro", "elsewhere", "intro elsewhere"]), Option.some),
]);

/**
 * Draw a case of the aria box: a Choice's `aria-label` and `aria-labelledby`.
 */
const ariaCase: Gen<Pick<ChoiceInteraction, "ariaLabel" | "ariaLabelledby">> = (source) => ({
  ariaLabel: source.draw(ariaLabelBox),
  ariaLabelledby: source.draw(ariaLabelledbyBox),
});

/**
 * How many cases {@link ariaCase} draws: 1 + 13 labels by 1 + 3 references.
 */
const ARIA_CASES = (1 + 13) * (1 + 3);

/**
 * The values the author's flow holds for this instance: `CAPITAL` answered `A` and `FIRST`
 * answered `Marseille`.
 */
const held: ReadonlyMap<string, Value> = new Map([
  ["CAPITAL", one({ baseType: "identifier", value: "A" })],
  ["FIRST", one({ baseType: "string", value: "Marseille" })],
]);

/**
 * Draw a view of the secrets box: every seed of {@link seedBox}, with no values or with
 * {@link held}.
 */
const viewCase: Gen<View> = (source) => ({
  ...answering,
  seed: source.draw(seedBox),
  values: source.draw(oneOf([constant<View["values"]>(new Map()), constant(held)])),
});

/**
 * Hand `startingResponses` a hand-built item, which its type refuses: the type test is the
 * `@ts-expect-error` below, which `tsc` fails on if the call ever type-checks. No test calls it.
 *
 * @returns What `startingResponses` would make of the item.
 */
const startOfItem = (): Responses =>
  // @ts-expect-error -- an `Item` is not `Accepted`: only `checkAdmitted` makes one, so a start reads only an admitted item.
  startingResponses(item, feedbackHidden);

/**
 * Write a value as JSON, with every `Map` and `Set` written as its entries, so nothing it holds is
 * hidden from a search of the text, and every bigint, such as a count, as its decimal digits, which
 * plain `JSON.stringify` refuses to write.
 *
 * @param value The value.
 * @returns Its JSON text.
 */
const json = (value: Item | readonly PairedInteraction[] | Redacted): string =>
  JSON.stringify(value, jsonField);

/**
 * A page: the redacted item and the view each interaction's payload node is given by.
 */
interface Built {
  readonly redacted: Redacted;
  readonly view: View;
}

/**
 * Give the page of a redacted item under a view.
 *
 * @param shown The redacted item.
 * @param view The view.
 * @returns The page.
 */
const pageFor = (shown: Redacted, view: View): Built => ({ redacted: shown, view });

/**
 * A Choice, an Extended Text, an Inline Choice or a Text Entry, paired with its payload node.
 */
type Shipped = Extract<
  PairedInteraction,
  { readonly kind: "choice" | "extended-text" | "inline-choice" | "text-entry" }
>;

/**
 * Tell whether a payload node is a Choice's, an Extended Text's, an Inline Choice's or a Text
 * Entry's.
 *
 * @param node The payload node.
 * @returns Whether it is one of the four.
 */
const isShipped = (node: PairedInteraction): node is Shipped =>
  node.kind === "choice" ||
  node.kind === "extended-text" ||
  node.kind === "inline-choice" ||
  node.kind === "text-entry";

/**
 * Give the payload node of each Choice, Extended Text, Inline Choice and Text Entry among a page's
 * interactions, in document order, inside elements included.
 *
 * @param built The page.
 * @returns The interaction payloads.
 */
const shippedIn = (built: Built): readonly Shipped[] =>
  redactedInteractionsIn(built.redacted.body).flatMap((interaction): readonly Shipped[] => {
    const node = interactionPayload(interaction, built.view);

    return isShipped(node) ? [node] : [];
  });

/**
 * Find the interaction payload bound to a response.
 *
 * @param built The page.
 * @param response The response identifier.
 * @returns The interaction payload; the test fails when there is none.
 */
const interactionFor = (built: Built, response: string): Shipped => {
  const found = shippedIn(built).find((interaction) => interaction.payload.response === response);

  return found ?? assert.fail(`no interaction is bound to ${response}`);
};

/**
 * Find the Choice payload bound to a response.
 *
 * @param built The page.
 * @param response The response identifier.
 * @returns The Choice payload; the test fails when the interaction is not a Choice.
 */
const choiceFor = (built: Built, response: string): ChoicePayload => {
  const found = interactionFor(built, response);

  return found.kind === "choice" ? found.payload : assert.fail(`${response} is not a Choice`);
};

/**
 * Find the text control payload bound to a response.
 *
 * @param built The page.
 * @param response The response identifier.
 * @returns The Text Entry or Extended Text payload; the test fails when it is a Choice or an
 *   Inline Choice.
 */
const textFor = (
  built: Built,
  response: string,
): Extract<Shipped, { readonly kind: "extended-text" | "text-entry" }> => {
  const found = interactionFor(built, response);

  switch (found.kind) {
    case "extended-text":
    case "text-entry": {
      return found;
    }
    case "choice": {
      return assert.fail(`${response} is a Choice`);
    }
    case "inline-choice": {
      return assert.fail(`${response} is an Inline Choice`);
    }
  }
};

/**
 * Give the identifiers of a Choice's choices in the order its payload presents them.
 *
 * @param interaction The Choice, the item's whole body.
 * @param view The view of the render.
 * @returns The identifiers, in presented order.
 */
const presentedOf = (interaction: ChoiceInteraction, view: View): readonly string[] =>
  choiceFor(
    pageFor(redactItem({ ...item, body: [interaction] }, shownToCandidate, feedbackHidden), view),
    interaction.response,
  ).choices.map((entry) => entry.identifier);

/**
 * Find the Extended Text payload bound to a response.
 *
 * @param built The page.
 * @param response The response identifier.
 * @returns The Extended Text payload; the test fails when the interaction is not an Extended Text.
 */
const extendedTextFor = (built: Built, response: string): ExtendedTextPayload => {
  const found = interactionFor(built, response);

  return found.kind === "extended-text"
    ? found.payload
    : assert.fail(`${response} is not an Extended Text`);
};

/**
 * Find the Inline Choice payload bound to a response.
 *
 * @param built The page.
 * @param response The response identifier.
 * @returns The Inline Choice payload; the test fails when the interaction is not an Inline Choice.
 */
const inlineChoiceFor = (built: Built, response: string): InlineChoicePayload => {
  const found = interactionFor(built, response);

  return found.kind === "inline-choice"
    ? found.payload
    : assert.fail(`${response} is not an Inline Choice`);
};

/**
 * An Inline Choice of two rivers with a Label, a placeholder and a too-few message, bound to the
 * single identifier response `RIVER`.
 */
const river: InlineChoiceInteraction = {
  ariaLabel: Option.none(),
  ariaLabelledby: Option.none(),
  catalog: Option.none(),
  choices: [
    {
      catalog: Option.none(),
      content: [text("Seine")],
      fixed: false,
      identifier: "S",
      templateVisibility: Option.none(),
    },
    {
      catalog: Option.none(),
      content: [text("Loire")],
      fixed: false,
      identifier: "L",
      templateVisibility: Option.none(),
    },
  ],
  class: Option.some("pick"),
  data: [],
  id: Option.none(),
  kind: "inline-choice",
  label: Option.some([text("River")]),
  messages: { min: Option.some("Pick a river.") },
  minChoices: 1n,
  path: "qti-assessment-item/qti-item-body/p/qti-inline-choice-interaction",
  placeholder: Option.some("Choose one"),
  promptCatalog: Option.none(),
  required: true,
  response: "RIVER",
  shuffle: false,
};

/**
 * An item whose one paragraph holds {@link river} in its sentence.
 */
const riverItem: Item = {
  ...item,
  body: [
    {
      attributes: [],
      children: [text("Paris stands on the "), river, text(".")],
      kind: "element",
      path: "qti-assessment-item/qti-item-body/p",
      tag: "p",
    },
  ],
  responses: new Map([
    [
      "RIVER",
      {
        areaMapping: Option.none(),
        baseType: "identifier",
        cardinality: "single",
        correct: Option.none(),
        defaultValue: Option.none(),
        identifier: "RIVER",
        mapping: Option.none(),
      },
    ],
  ]),
  unsupported: [],
};

/**
 * {@link riverItem}, redacted.
 */
const riverRedacted = redactItem(riverItem, shownToCandidate, feedbackHidden);

/**
 * Find the Text Entry payload bound to a response.
 *
 * @param built The page.
 * @param response The response identifier.
 * @returns The Text Entry payload; the test fails when the interaction is not a Text Entry.
 */
const textEntryFor = (built: Built, response: string): TextEntryPayload => {
  const found = interactionFor(built, response);

  return found.kind === "text-entry"
    ? found.payload
    : assert.fail(`${response} is not a Text Entry`);
};

/**
 * Construct an item whose body is one Extended Text bound to an ordered string response `LIST`,
 * with the counts given.
 *
 * @param maxStrings `max-strings`, none when absent.
 * @param minStrings `min-strings`.
 * @returns The item, redacted.
 */
const listOf = (maxStrings: Option.Option<bigint>, minStrings: bigint): Redacted =>
  redactItem(
    {
      ...item,
      body: [
        {
          ...essay,
          cardinality: "ordered",
          maxStrings,
          minStrings,
          path: "qti-assessment-item/qti-item-body/qti-extended-text-interaction[LIST]",
          response: "LIST",
        },
      ],
      responses: new Map([
        [
          "LIST",
          {
            areaMapping: Option.none(),
            baseType: "string",
            cardinality: "ordered",
            correct: Option.none(),
            defaultValue: Option.none(),
            identifier: "LIST",
            mapping: Option.none(),
          },
        ],
      ]),
      unsupported: [],
    },
    shownToCandidate,
    feedbackHidden,
  );

/**
 * Name the stages of a list, `stage 1` onwards.
 *
 * @param count How many.
 * @returns The names, in order.
 */
const stages = (count: number): readonly string[] =>
  Array.from({ length: count }, (_, index) => `stage ${String(index + 1)}`);

/**
 * Construct an ordered string value.
 *
 * @param members Its strings, in order.
 * @returns The value.
 */
const orderedOf = (members: readonly string[]): Value => ({
  baseType: "string",
  cardinality: "ordered",
  values: members.map((value) => ({ baseType: "string", value })),
});

describe("redactItem", () => {
  it("keeps no correct response, mapping key or outcome default, and keeps the response default a Text Entry starts at", () => {
    const written = json(redacted);
    const secrets = secretsOf(item);

    assert.isNotEmpty(secrets, "the item declares correct values, a mapping and outcome defaults");
    assert.deepStrictEqual(
      secrets.filter((secret) => written.includes(secret)),
      [],
      "the secrets the redacted item holds",
    );

    assert.include(written, "Which city is the capital of France?");
    assert.deepStrictEqual(
      redacted.responses.flatMap((binding) =>
        Option.isSome<ResponseValue>(binding.defaultValue) ? [binding.identifier] : [],
      ),
      ["NAMED"],
    );
    assert.include(written, responseDefault);
  });

  it("copies only the fields it names, and each response's binding", () => {
    /**
     * TypeScript admits a wider object wherever an `Item` is expected, so a field the model gains,
     * or one a caller adds, reaches `redactItem` with no cast; it must not reach the output.
     */
    const extra = "MarkerExtraField";
    const widened = {
      ...item,
      extra,
      responses: new Map(
        [...item.responses].map(([identifier, declaration]) => [
          identifier,
          { ...declaration, extra },
        ]),
      ),
    };
    const copied = redactItem(widened, shownToCandidate, feedbackHidden);

    assert.notInclude(json(copied), extra);
    assert.deepStrictEqual(Object.keys(copied).toSorted(), [
      "body",
      "content",
      "document",
      "identifier",
      "lang",
      "modalFeedback",
      "responses",
      "title",
      "unprinted",
    ]);
    assert.deepStrictEqual(copied.unprinted, Option.none());
    assert.deepStrictEqual(copied.responses, [
      {
        baseType: "identifier",
        cardinality: "single",
        defaultValue: Option.none(),
        identifier: "CAPITAL",
      },
      {
        baseType: "string",
        cardinality: "single",
        defaultValue: Option.none(),
        identifier: "FIRST",
      },
      {
        baseType: "string",
        cardinality: "single",
        defaultValue: Option.none(),
        identifier: "SECOND",
      },
      {
        baseType: "string",
        cardinality: "single",
        defaultValue: Option.some(one({ baseType: "string", value: responseDefault })),
        identifier: "NAMED",
      },
      {
        baseType: "string",
        cardinality: "single",
        defaultValue: Option.none(),
        identifier: "ESSAY",
      },
    ]);
    assert.strictEqual(copied.document, "items/capitals.xml");
    assert.strictEqual(copied.identifier, "capitals");
  });
});

/**
 * A `javascript:` URL, which `checkAdmitted` drops from a link.
 */
const scriptUrl = "javascript:alert(1)";

/**
 * The path of the item body, which every body path in the printed-variable cases starts with.
 */
const bodyPath = "qti-assessment-item/qti-item-body";

/**
 * Construct a printed variable at its attributes' defaults.
 *
 * @param identifier The variable it writes.
 * @param path Its path.
 * @returns The body node.
 */
const printed = (identifier: string, path: string): PrintedVariable => ({
  base: { _tag: "literal", value: 10n },
  delimiter: ";",
  field: Option.none(),
  format: Option.none(),
  identifier,
  index: Option.none(),
  kind: "printed-variable",
  mappingIndicator: "=",
  path,
  powerForm: false,
});

/**
 * Construct the notice a body part is shown as.
 *
 * @param feature The feature.
 * @param path The part's path.
 * @returns The body node.
 */
const noticeOf = (feature: string, path: string): Unsupported => ({
  feature,
  kind: "unsupported",
  path,
});

/**
 * The paths of the printed variables in {@link printing}, in document order: in a paragraph, in
 * the Choice's Prompt, in its second choice's content, and in a second paragraph.
 */
const printedPaths = [
  `${bodyPath}/p[1]/qti-printed-variable`,
  `${bodyPath}/qti-choice-interaction/qti-prompt/qti-printed-variable`,
  `${bodyPath}/qti-choice-interaction/qti-simple-choice[2]/qti-printed-variable`,
  `${bodyPath}/p[2]/qti-printed-variable`,
] as const;

/**
 * Construct the body of {@link printing} with each printed variable's place filled by a node.
 *
 * @param place The node for the printed variable at a path, given the variable's identifier.
 * @returns The body: a paragraph, an Upload's notice, a Choice, a second paragraph and a feedback
 *   block's notice.
 */
const printingBody = (
  place: (identifier: string, path: string) => BodyNode,
): readonly BodyNode[] => [
  {
    attributes: [],
    children: [text("Score: "), place("SCORE", printedPaths[0])],
    kind: "element",
    path: `${bodyPath}/p[1]`,
    tag: "p",
  },
  noticeOf("qti-upload-interaction", `${bodyPath}/qti-upload-interaction`),
  {
    ...choice,
    choices: [
      {
        catalog: Option.none(),
        content: [text("Paris")],
        fixed: false,
        identifier: "A",
        templateVisibility: Option.none(),
      },
      {
        catalog: Option.none(),
        content: [text("Lyon, "), place("ROUND", printedPaths[2])],
        fixed: false,
        identifier: "B",
        templateVisibility: Option.none(),
      },
    ],
    prompt: Option.some([text("Round "), place("ROUND", printedPaths[1])]),
  },
  {
    attributes: [],
    children: [place("TOTAL", printedPaths[3])],
    kind: "element",
    path: `${bodyPath}/p[2]`,
    tag: "p",
  },
  noticeOf("qti-feedback-block", `${bodyPath}/qti-feedback-block`),
];

/**
 * An item that prints variables at four places among two notices and a mark, as the model holds
 * it: each printed variable a body node, and none among the unsupported features. Its template
 * processing runs, so with no record `redactItem` withholds every printed variable.
 */
const printing: Item = {
  ...item,
  body: printingBody(printed),
  templated: true,
  unsupported: [
    {
      feature: "qti-upload-interaction",
      path: `${bodyPath}/qti-upload-interaction`,
      shown: "notice",
    },
    { feature: "qti-feedback-block", path: `${bodyPath}/qti-feedback-block`, shown: "notice" },
    { feature: "xml:base", path: `${bodyPath}/p[2]`, shown: "mark" },
  ],
};

describe("redactItem on printed variables", () => {
  it("withholds each printed variable of a templated item with no record behind its notice: the redaction of the item holding each as that notice", () => {
    const asNotices: Item = {
      ...printing,
      body: printingBody((_, path) => noticeOf("qti-printed-variable", path)),
      unsupported: [
        { feature: "qti-printed-variable", path: printedPaths[0], shown: "notice" },
        ...printing.unsupported.slice(0, 1),
        ...printedPaths
          .slice(1)
          .map((path) => ({ feature: "qti-printed-variable", path, shown: "notice" as const })),
        ...printing.unsupported.slice(1),
      ],
    };
    const withheld = redactItem(printing, shownToCandidate, feedbackHidden);

    assert.deepStrictEqual(withheld, redactItem(asNotices, shownToCandidate, feedbackHidden));
  });

  it("withholds a printed variable the record holds no value of behind its notice inside the link a URL was dropped from", () => {
    const verdict = admittedSource(
      doc(
        "item.xml",
        el(
          "qti-assessment-item",
          [
            attr("identifier", "printing"),
            attr("time-dependent", "false"),
            attr("title", "Printing"),
          ],
          [
            el(
              "qti-outcome-declaration",
              [
                attr("base-type", "float"),
                attr("cardinality", "single"),
                attr("identifier", "SCORE"),
              ],
              [],
            ),
            el(
              "qti-item-body",
              [],
              [
                el(
                  "p",
                  [],
                  [
                    el(
                      "a",
                      [attr("href", scriptUrl)],
                      [el("qti-printed-variable", [attr("identifier", "SCORE")], [])],
                    ),
                    sourceText("."),
                  ],
                ),
              ],
            ),
          ],
        ),
      ),
    );
    const accepted = Option.getOrThrow(acceptedItem(verdict));
    const withheld = redact(
      accepted,
      shownToCandidate,
      underRecord({
        attempt: "submitted",
        defaults: {},
        outcomes: {},
        templates: {},
      }),
    );
    const link = `${bodyPath}/p/a`;

    assert.deepStrictEqual(accepted.item.unsupported, [
      { feature: "url-scheme:javascript", path: link, shown: "notice" },
    ]);
    assert.deepStrictEqual<readonly BodyNode[]>(withheld.body, [
      {
        attributes: [],
        children: [
          {
            attributes: [],
            children: [noticeOf("qti-printed-variable", `${link}/qti-printed-variable`)],
            kind: "element",
            path: link,
            tag: "a",
          },
          noticeOf("url-scheme:javascript", link),
          text("."),
        ],
        kind: "element",
        path: `${bodyPath}/p`,
        tag: "p",
      },
    ]);
  });
});

/**
 * Construct a single integer value.
 *
 * @param value The integer.
 * @returns The value.
 */
const integerValue = (value: bigint): Value => one({ baseType: "integer", value });

/**
 * Construct a single float value.
 *
 * @param value The float.
 * @returns The value.
 */
const floatValue = (value: number): Value => one({ baseType: "float", value });

/**
 * Construct an ordered integer value.
 *
 * @param values The integers, in order.
 * @returns The value.
 */
const orderedIntegers = (values: readonly bigint[]): Value => ({
  baseType: "integer",
  cardinality: "ordered",
  values: values.map((value) => ({ baseType: "integer", value })),
});

/**
 * Construct a template declaration, neither a parameter nor a math variable.
 *
 * @param identifier The variable's identifier.
 * @param declared Its declared default, which gives its base type and cardinality; NULL declares
 *   none.
 * @returns The declaration.
 */
const templateOf = (identifier: string, declared: Value): TemplateDeclaration => ({
  baseType: declared.baseType,
  cardinality: declared.cardinality,
  defaultValue: declared.values.length === 0 ? Option.none() : Option.some(declared),
  identifier,
  mathVariable: false,
  paramVariable: false,
});

/**
 * The paragraph every printed variable of {@link templated} sits in.
 */
const printingParagraph = `${bodyPath}/p`;

/**
 * Give the path of a printed variable of {@link templated}'s paragraph.
 *
 * @param n Its position among them, from 1.
 * @returns The path.
 */
const printedAt = (n: number): string => `${printingParagraph}/qti-printed-variable[${String(n)}]`;

/**
 * An item whose template processing runs, with one paragraph that prints, each after a label: `N`
 * in its default form, `SCORE` through `%.2f`, the `POS`-th member of `LIST`, `N` through `%i` in
 * the base `RADIX` holds, and `SCORE` in its default form; then a feedback block's notice. `N`
 * defaults to 3, `RADIX` to 16 and `LIST` to 10, 20, 30, and `POS` declares no default.
 */
const templated: Item = {
  ...item,
  body: [
    {
      attributes: [],
      children: [
        text("N "),
        printed("N", printedAt(1)),
        text(", score "),
        { ...printed("SCORE", printedAt(2)), format: Option.some("%.2f") },
        text(", member "),
        {
          ...printed("LIST", printedAt(3)),
          index: Option.some({ _tag: "ref", identifier: "POS" }),
        },
        text(", hex "),
        {
          ...printed("N", printedAt(4)),
          base: { _tag: "ref", identifier: "RADIX" },
          format: Option.some("%i"),
        },
        text(", raw "),
        printed("SCORE", printedAt(5)),
      ],
      kind: "element",
      path: printingParagraph,
      tag: "p",
    },
    noticeOf("qti-feedback-block", `${bodyPath}/qti-feedback-block`),
  ],
  templated: true,
  templates: new Map(
    [
      templateOf("N", integerValue(3n)),
      templateOf("POS", nullOf("integer", "single")),
      templateOf("RADIX", integerValue(16n)),
      templateOf("LIST", orderedIntegers([10n, 20n, 30n])),
    ].map((declaration) => [declaration.identifier, declaration] as const),
  ),
  unsupported: [
    { feature: "qti-feedback-block", path: `${bodyPath}/qti-feedback-block`, shown: "notice" },
  ],
};

/**
 * {@link templated} without template processing, so with no record it reads as the record its
 * first attempt starts with: its declared values.
 */
const untemplated: Item = { ...templated, templated: false };

/**
 * The record of an attempt of {@link templated}: `N` 255, `POS` 2, `RADIX` 16, `LIST` 10, 20, 30,
 * and `SCORE` 2.675.
 */
const drawn: ItemRecord = {
  ...recordOf({}),
  attempt: "submitted",
  outcomes: { SCORE: floatValue(2.675) },
  templates: {
    LIST: orderedIntegers([10n, 20n, 30n]),
    N: integerValue(255n),
    POS: integerValue(2n),
    RADIX: integerValue(16n),
  },
};

/**
 * Construct a text node of the body for each string.
 *
 * @param texts The texts.
 * @returns The nodes.
 */
const texts = (...values: readonly string[]): readonly BodyNode[] => values.map(text);

/**
 * Give the nodes of a redacted item's first body element, the printing paragraph.
 *
 * @param redaction The redacted item.
 * @returns The paragraph's children.
 */
const paragraphOf = (redaction: Redacted): readonly BodyNode[] => {
  const [first] = redaction.body;

  return first?.kind === "element"
    ? first.children
    : assert.fail("The body starts with no element.");
};

/**
 * The notice of the printed variable at a position of {@link templated}'s paragraph.
 *
 * @param n Its position, from 1.
 * @returns The notice node.
 */
const printedNoticeAt = (n: number): Unsupported => noticeOf("qti-printed-variable", printedAt(n));

describe("redactItem with a record", () => {
  it("prints each printed variable from the record as text: a template value and an outcome value, through a format and in the default form, with an index and a base written as names read from the record", () => {
    const printedOut = redactItem(templated, shownToCandidate, underRecord(drawn));

    assert.deepStrictEqual(
      paragraphOf(printedOut),
      texts("N ", "255", ", score ", "2.67", ", member ", "20", ", hex ", "ff", ", raw ", "2.675"),
    );
  });

  it("prints nothing for a NULL value", () => {
    const empty = redactItem(
      templated,
      shownToCandidate,
      underRecord({
        ...drawn,
        templates: { ...drawn.templates, N: nullOf("integer", "single") },
      }),
    );

    assert.deepStrictEqual(
      paragraphOf(empty),
      texts("N ", ", score ", "2.67", ", member ", "20", ", hex ", ", raw ", "2.675"),
    );
  });

  it("leaves the notice where the record holds no value of the variable, or of the name its base or index names", () => {
    const gaps = redactItem(
      templated,
      shownToCandidate,
      underRecord({
        ...drawn,
        templates: { N: integerValue(255n), POS: integerValue(2n) },
      }),
    );

    assert.deepStrictEqual(paragraphOf(gaps), [
      ...texts("N ", "255", ", score ", "2.67", ", member "),
      printedNoticeAt(3),
      text(", hex "),
      printedNoticeAt(4),
      ...texts(", raw ", "2.675"),
    ]);
  });

  it("reads only the record's own entries, never a name an object inherits", () => {
    const inherited = redactItem(
      { ...templated, body: [{ ...printed("constructor", printedAt(1)) }], unsupported: [] },
      shownToCandidate,
      underRecord(drawn),
    );

    assert.deepStrictEqual(inherited.body, [printedNoticeAt(1)]);
  });

  it("with no record, withholds every printed variable of an item whose template processing runs", () => {
    const withheld = redactItem(templated, shownToCandidate, feedbackHidden);

    assert.deepStrictEqual(paragraphOf(withheld), [
      text("N "),
      printedNoticeAt(1),
      text(", score "),
      printedNoticeAt(2),
      text(", member "),
      printedNoticeAt(3),
      text(", hex "),
      printedNoticeAt(4),
      text(", raw "),
      printedNoticeAt(5),
    ]);
  });

  it("with no record, prints no template or outcome value, as an item with template processing does: each printed variable is its notice", () => {
    assert.deepStrictEqual(
      paragraphOf(redactItem(untemplated, shownToCandidate, feedbackHidden)),
      paragraphOf(redactItem(templated, shownToCandidate, feedbackHidden)),
    );
  });
});

/**
 * Construct a single identifier value.
 *
 * @param value The identifier.
 * @returns The value.
 */
const identifierValue = (value: string): Value => one({ baseType: "identifier", value });

/**
 * Construct a multiple identifier value.
 *
 * @param values The identifiers, in order.
 * @returns The value.
 */
const multipleOf = (...values: readonly string[]): Value => ({
  baseType: "identifier",
  cardinality: "multiple",
  values: values.map((value) => ({ baseType: "identifier", value })),
});

/**
 * Construct the template visibility of a part `VISIBLE` controls.
 *
 * @param showHide Its `show-hide`.
 * @returns The visibility.
 */
const byVisible = (showHide: TemplateVisibility["showHide"]): TemplateVisibility => ({
  showHide,
  templateIdentifier: "VISIBLE",
});

/**
 * The path of the template block every template case holds, at the top of the body.
 */
const blockPath = `${bodyPath}/qti-template-block`;

/**
 * The path of the template inline every template case holds, inside a paragraph.
 */
const inlinePath = `${bodyPath}/p/qti-template-inline`;

/**
 * Construct a template block or inline.
 *
 * @param kind Which of the two it is.
 * @param visibility Its template visibility.
 * @param content Its content.
 * @param responses The responses its content binds, as `buildItem` reads them; none by default,
 *   for content that holds no interaction.
 * @returns The body node, with the identifier `X`, at {@link blockPath} or {@link inlinePath}.
 */
const templatePart = (
  kind: TemplateContent["kind"],
  visibility: TemplateVisibility,
  content: readonly BodyNode[],
  responses: readonly string[],
): TemplateContent => ({
  content,
  identifier: "X",
  kind,
  path: kind === "template-block" ? blockPath : inlinePath,
  responses,
  templateVisibility: visibility,
});

/**
 * Construct the paragraph that holds the template inline, between two texts.
 *
 * @param inline What stands in the inline's place.
 * @returns The paragraph.
 */
const inlineParagraph = (...inline: readonly BodyNode[]): BodyNode => ({
  attributes: [],
  children: [text("before "), ...inline, text(" after")],
  kind: "element",
  path: `${bodyPath}/p`,
  tag: "p",
});

/**
 * Construct a choice of {@link visibleChoice}'s Choice.
 *
 * @param identifier Its identifier.
 * @param visibility Its template visibility, none for a choice always shown.
 * @returns The choice.
 */
const choiceShownBy = (
  identifier: string,
  visibility: Option.Option<TemplateVisibility>,
): SimpleChoice => ({
  catalog: Option.none(),
  content: [text(identifier)],
  fixed: false,
  identifier,
  templateVisibility: visibility,
});

/**
 * A Choice bound to `CAPITAL` whose choice `X` shows by `VISIBLE` (`show`), whose `Y` has no
 * template visibility, and whose `Z` hides by it (`hide`, so shown unless `VISIBLE` holds `Z`).
 */
const visibleChoice: ChoiceInteraction = {
  ...choice,
  choices: [
    choiceShownBy("X", Option.some(byVisible("show"))),
    choiceShownBy("Y", Option.none()),
    choiceShownBy("Z", Option.some(byVisible("hide"))),
  ],
};

/**
 * The template declaration of `VISIBLE`, a multiple identifier whose declared default holds `X`.
 */
const visibleDeclaration = templateOf("VISIBLE", multipleOf("X"));

/**
 * An item whose template processing runs, whose body holds a template block shown by `VISIBLE`
 * (`show`), a paragraph with a template inline hidden by it (`hide`), {@link visibleChoice}, and a
 * feedback block's notice.
 */
const visibility: Item = {
  ...item,
  body: [
    templatePart("template-block", byVisible("show"), [text("block")], []),
    inlineParagraph(templatePart("template-inline", byVisible("hide"), [text("inline")], [])),
    visibleChoice,
    noticeOf("qti-feedback-block", `${bodyPath}/qti-feedback-block`),
  ],
  templated: true,
  templates: new Map([["VISIBLE", visibleDeclaration]]),
  unsupported: [
    { feature: "qti-feedback-block", path: `${bodyPath}/qti-feedback-block`, shown: "notice" },
  ],
};

/**
 * Give the identifiers of the Choice of a redacted item, the first interaction its body holds.
 *
 * @param redaction The redacted item.
 * @returns The identifiers of its choices, in document order.
 */
const choicesShown = (redaction: Redacted): readonly string[] => {
  const found = redaction.body.find((node) => node.kind === "choice");

  return found?.kind === "choice"
    ? found.choices.map((entry) => entry.identifier)
    : assert.fail("The body holds no Choice.");
};

/**
 * The template values a record holds, with no outcome.
 *
 * @param templates The template values by identifier.
 * @returns The record's part `redact` reads.
 */
const holding = (templates: Readonly<Record<string, Value>>): RedactRecord => ({
  attempt: "none",
  defaults: {},
  outcomes: {},
  templates,
});

/**
 * Give a choice of {@link planets} the template visibility `hide` by `VISIBLE` when it is `P1`.
 *
 * @param entry The choice.
 * @returns The choice, `P1` hidden whenever `VISIBLE` holds `P1`.
 */
const hidingP1 = (entry: SimpleChoice): SimpleChoice =>
  entry.identifier === "P1"
    ? { ...entry, templateVisibility: Option.some(byVisible("hide")) }
    : entry;

/**
 * The identifiers a value of `VISIBLE` holds: `X`, the identifier of every template part here, and
 * `W` and `Y`, which match none.
 */
const VISIBLE_IDENTIFIERS = ["W", "X", "Y"] as const;

/**
 * Draw a value of `VISIBLE`: a single NULL or one of {@link VISIBLE_IDENTIFIERS}, or a multiple of
 * 0 to 2 of them in any order, the empty one NULL.
 */
const visibleValue: Gen<Value> = oneOf([
  constant(nullOf("identifier", "single")),
  map(element(VISIBLE_IDENTIFIERS), identifierValue),
  map(array(element(VISIBLE_IDENTIFIERS), { max: 2, min: 0 }), (members): Value => ({
    baseType: "identifier",
    cardinality: "multiple",
    values: members.map((value) => ({ baseType: "identifier", value })),
  })),
]);

/**
 * How many values {@link visibleValue} draws: a single NULL and 3 singles, and 1 + 3 + 9
 * multiples.
 */
const VISIBLE_VALUES = 1 + 3 + (1 + 3 + 3 ** 2);

/**
 * Draw the record a page is shown under, as far as `VISIBLE` goes: none, one holding no value of
 * it, or one holding each value of {@link visibleValue}.
 */
const visibleRecord: Gen<Option.Option<RedactRecord>> = oneOf([
  constant(Option.none()),
  constant(Option.some(holding({}))),
  map(visibleValue, (value) => Option.some(holding({ VISIBLE: value }))),
]);

/**
 * How many records {@link visibleRecord} draws.
 */
const VISIBLE_RECORDS = 1 + 1 + VISIBLE_VALUES;

/**
 * A case of the visibility rule: a template part's `show-hide` and the value `VISIBLE` holds.
 */
interface VisibilityCase {
  readonly showHide: TemplateVisibility["showHide"];
  readonly value: Value;
}

/**
 * Draw a case of the visibility rule: each `show-hide` under each value of {@link visibleValue}.
 */
const visibilityCase: Gen<VisibilityCase> = (source) => ({
  showHide: source.draw(element(["show", "hide"])),
  value: source.draw(visibleValue),
});

/**
 * Decide, as the information model's rule says and never from plate's code, whether a template
 * part with the identifier `X` shows: the value matches when it holds `X` as itself or a member,
 * NULL never; `show` shows the part exactly on a match and `hide` exactly on none (TemplateBlock,
 * 5.145, TemplateInline, 5.155).
 *
 * @param showHide The part's `show-hide`.
 * @param value `VISIBLE`'s value.
 * @returns Whether the part shows.
 */
const shownByRule = (showHide: TemplateVisibility["showHide"], value: Value): boolean =>
  value.values.some((single) => single.baseType === "identifier" && single.value === "X") ===
  (showHide === "show");

describe("redactItem on template blocks, inlines and choices", () => {
  it.effect(
    "copies a choice its template value shows with no template visibility, and the JSON of the redacted item holds no template-identifier, show-hide or template value",
    () =>
      Effect.gen(function* copiesShownChoice() {
        const accepted = yield* Effect.fromOption(
          acceptedItem(
            admittedSource(
              doc(
                "item.xml",
                el(
                  "qti-assessment-item",
                  [
                    attr("identifier", "visibility"),
                    attr("time-dependent", "false"),
                    attr("title", "Visibility"),
                  ],
                  [
                    el(
                      "qti-response-declaration",
                      [
                        attr("base-type", "identifier"),
                        attr("cardinality", "single"),
                        attr("identifier", "RESPONSE"),
                      ],
                      [],
                    ),
                    el(
                      "qti-template-declaration",
                      [
                        attr("base-type", "identifier"),
                        attr("cardinality", "multiple"),
                        attr("identifier", "VISIBLE"),
                      ],
                      [],
                    ),
                    el(
                      "qti-item-body",
                      [],
                      [
                        el(
                          "qti-choice-interaction",
                          [attr("max-choices", "1"), attr("response-identifier", "RESPONSE")],
                          [
                            el(
                              "qti-simple-choice",
                              [
                                attr("identifier", "A"),
                                attr("show-hide", "show"),
                                attr("template-identifier", "VISIBLE"),
                              ],
                              [sourceText("Ant")],
                            ),
                            el("qti-simple-choice", [attr("identifier", "B")], [sourceText("Bee")]),
                          ],
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ),
          ),
        );
        const shown = redact(
          accepted,
          shownToCandidate,
          underRecord(holding({ VISIBLE: multipleOf("A", "MarkerTemplate") })),
        );
        const [interaction] = shown.body;
        const written = json(shown);

        assert.deepStrictEqual<readonly SimpleChoice[]>(
          interaction?.kind === "choice" ? interaction.choices : [],
          [
            {
              catalog: Option.none(),
              content: [text("Ant")],
              fixed: false,
              identifier: "A",
              templateVisibility: Option.none(),
            },
            {
              catalog: Option.none(),
              content: [text("Bee")],
              fixed: false,
              identifier: "B",
              templateVisibility: Option.none(),
            },
          ],
        );
        for (const hidden of [
          "templateIdentifier",
          "template-identifier",
          "showHide",
          "show-hide",
          "VISIBLE",
          "MarkerTemplate",
        ]) {
          assert.notInclude(written, hidden);
        }
      }),
  );

  it.effect(
    `shows or hides a template block's and a template inline's content as the rule decides, under show and hide and every value of VISIBLE: its content in its place, or nothing: ${String(2 * VISIBLE_VALUES)} cases`,
    (ctx) =>
      Effect.andThen(
        boxHolds(visibilityCase, 2 * VISIBLE_VALUES),
        searched(
          ctx,
          exhaust(
            {
              box: "show and hide, under VISIBLE a single NULL, W, X or Y, or a multiple of 0 to 2 of W, X and Y",
              caseHang,
              coverage: requiredInSpace<"shown" | "hidden">(["shown", "hidden"]),
              generator: visibilityCase,
              literal: Formatter.format,
              oracle: {
                kind: "specification",
                name: "the information model's template visibility (TemplateBlock 5.145, TemplateInline 5.155), as shownByRule transcribes it: X matches as the value or a member, show shows exactly on a match and hide exactly on none",
              },
              suite: "plate/payload/template-visibility",
            },
            ({ showHide, value }, c) =>
              Effect.sync(() => {
                const shown = shownByRule(showHide, value);

                c.note(shown ? "shown" : "hidden");

                const parts: Item = {
                  ...visibility,
                  body: [
                    templatePart("template-block", byVisible(showHide), [text("block")], []),
                    inlineParagraph(
                      templatePart("template-inline", byVisible(showHide), [text("inline")], []),
                    ),
                  ],
                  unsupported: [],
                };
                const redaction = redactItem(
                  parts,
                  shownToCandidate,
                  underRecord(holding({ VISIBLE: value })),
                );

                assert.deepStrictEqual<readonly BodyNode[]>(
                  redaction.body,
                  shown ? [text("block"), inlineParagraph(text("inline"))] : [inlineParagraph()],
                );
              }),
          ),
        ),
      ),
  );

  it("shows a choice by its template value, keeps one with no template visibility, and leaves out one its value hides", () => {
    assert.deepStrictEqual(
      choicesShown(
        redactItem(
          visibility,
          shownToCandidate,
          underRecord(holding({ VISIBLE: multipleOf("X") })),
        ),
      ),
      ["X", "Y", "Z"],
    );
    assert.deepStrictEqual(
      choicesShown(
        redactItem(
          visibility,
          shownToCandidate,
          underRecord(holding({ VISIBLE: multipleOf("X", "Z") })),
        ),
      ),
      ["X", "Y"],
    );
    assert.deepStrictEqual(
      choicesShown(
        redactItem(
          visibility,
          shownToCandidate,
          underRecord(holding({ VISIBLE: multipleOf("Z") })),
        ),
      ),
      ["Y"],
    );
    assert.deepStrictEqual(
      choicesShown(
        redactItem(
          visibility,
          shownToCandidate,
          underRecord(holding({ VISIBLE: multipleOf("W") })),
        ),
      ),
      ["Y", "Z"],
    );
  });

  it.effect(
    `presents a shuffled Choice with a template-hidden choice in choiceOrder's order over the choices shown, under the same key: ${String(SEEDS)} seeds`,
    (ctx) => {
      const shuffled: Item = {
        ...visibility,
        body: [{ ...planets, choices: planets.choices.map(hidingP1) }],
        unsupported: [],
      };
      const redaction = redactItem(
        shuffled,
        shownToCandidate,
        underRecord(holding({ VISIBLE: identifierValue("P1") })),
      );
      const remaining = planets.choices.filter((entry) => entry.identifier !== "P1");

      return Effect.andThen(
        boxHolds(seedBox, SEEDS),
        searched(
          ctx,
          exhaust(
            {
              box: "every seed of 0 to 2 of a digit, a letter and the space",
              caseHang,
              coverage: noCoverage,
              generator: seedBox,
              literal: (seed) => JSON.stringify(seed),
              oracle: {
                kind: "second-implementation",
                name: "choiceOrder over the choices the template value leaves, under the seed: the order the page presents is choiceOrder's of what it shows, whatever the seed",
              },
              suite: "plate/payload/template-hidden-shuffle",
            },
            (seed) =>
              Effect.sync(() => {
                const presented = choiceFor(
                  pageFor(redaction, { ...answering, seed }),
                  "PLANET",
                ).choices.map((entry) => entry.identifier);

                assert.deepStrictEqual(
                  presented,
                  choiceOrder({ ...planets, choices: remaining }, seed),
                );
                assert.sameMembers([...presented], ["P0", "P2", "P3", "P4"]);
              }),
          ),
        ),
      );
    },
  );

  it("with no record, withholds a templated item's template block and inline behind their notices and leaves out each choice with a template visibility", () => {
    const withheld = redactItem(visibility, shownToCandidate, feedbackHidden);

    assert.deepStrictEqual<readonly BodyNode[]>(withheld.body, [
      noticeOf("qti-template-block", blockPath),
      inlineParagraph(noticeOf("qti-template-inline", inlinePath)),
      { ...visibleChoice, choices: [choiceShownBy("Y", Option.none())] },
      noticeOf("qti-feedback-block", `${bodyPath}/qti-feedback-block`),
    ]);
  });

  it("withholds a template block, inline or choice whose template variable the record holds no value of, as with no record", () => {
    assert.deepStrictEqual(
      redactItem(visibility, shownToCandidate, underRecord(holding({}))),
      redactItem(visibility, shownToCandidate, feedbackHidden),
    );
    assert.deepStrictEqual(
      redactItem(visibility, shownToCandidate, underRecord(holding({ OTHER: multipleOf("X") }))),
      redactItem(visibility, shownToCandidate, feedbackHidden),
    );
  });

  it("with no record, shows an item without template processing as one with it: no template value, so no template part's visibility is read", () => {
    const untemplatedParts: Item = { ...visibility, templated: false };

    assert.deepStrictEqual(
      redactItem(untemplatedParts, shownToCandidate, feedbackHidden),
      redactItem(visibility, shownToCandidate, feedbackHidden),
    );
  });

  it("shows a notice inside a template block only where its template value shows the block", () => {
    const upload = `${blockPath}/qti-content-body/qti-upload-interaction`;
    const holdingNotice: Item = {
      ...visibility,
      body: [
        templatePart(
          "template-block",
          byVisible("show"),
          [noticeOf("qti-upload-interaction", upload)],
          [],
        ),
        noticeOf("qti-feedback-block", `${bodyPath}/qti-feedback-block`),
      ],
      unsupported: [
        { feature: "qti-upload-interaction", path: upload, shown: "notice" },
        ...visibility.unsupported,
      ],
    };
    const shown = redactItem(
      holdingNotice,
      shownToCandidate,
      underRecord(holding({ VISIBLE: multipleOf("X") })),
    );
    const hidden = redactItem(
      holdingNotice,
      shownToCandidate,
      underRecord(holding({ VISIBLE: multipleOf("W") })),
    );

    assert.deepStrictEqual(shown.body, [
      noticeOf("qti-upload-interaction", upload),
      noticeOf("qti-feedback-block", `${bodyPath}/qti-feedback-block`),
    ]);
    assert.deepStrictEqual(hidden.body, [
      noticeOf("qti-feedback-block", `${bodyPath}/qti-feedback-block`),
    ]);
  });

  it("shows no response of an interaction a hidden template block holds", () => {
    const holdingEntry: Item = {
      ...visibility,
      body: [templatePart("template-block", byVisible("show"), [textEntry("FIRST")], ["FIRST"])],
      unsupported: [],
    };
    const postedOf = (value: Value): readonly string[] =>
      shownResponses(acceptForTest(holdingEntry), underRecord(holding({ VISIBLE: value })));

    assert.deepStrictEqual(postedOf(multipleOf("X")), ["FIRST"]);
    assert.deepStrictEqual(postedOf(multipleOf("W")), []);
  });
});

/**
 * Build a paragraph holding a template inline of `T`, shown when `T` holds its identifier, whose
 * `span` holds a Text Entry bound to the response given. A template block may hold no interaction
 * (reading `interaction-in-template`), so the interaction a template shows or hides sits in a
 * template inline.
 *
 * @param identifier The inline's identifier.
 * @param response The response its Text Entry binds.
 * @returns The paragraph's source element.
 */
const answeringInline = (identifier: string, response: string): SourceElement =>
  el(
    "p",
    [],
    [
      el(
        "qti-template-inline",
        [
          attr("identifier", identifier),
          attr("show-hide", "show"),
          attr("template-identifier", "T"),
        ],
        [
          el(
            "span",
            [],
            [el("qti-text-entry-interaction", [attr("response-identifier", response)], [])],
          ),
        ],
      ),
    ],
  );

/**
 * An item whose body holds two template inlines of `T`: `A`, whose Text Entry binds the string
 * response `SHOWN_ANSWER`, and `B`, whose Text Entry binds the float response `HIDDEN_ANSWER`.
 */
const inlineAnswers: SourceDocument = doc(
  "item.xml",
  el(
    "qti-assessment-item",
    [attr("identifier", "answers"), attr("time-dependent", "false"), attr("title", "Answers")],
    [
      el(
        "qti-response-declaration",
        [
          attr("base-type", "string"),
          attr("cardinality", "single"),
          attr("identifier", "SHOWN_ANSWER"),
        ],
        [],
      ),
      el(
        "qti-response-declaration",
        [
          attr("base-type", "float"),
          attr("cardinality", "single"),
          attr("identifier", "HIDDEN_ANSWER"),
        ],
        [],
      ),
      el(
        "qti-template-declaration",
        [attr("base-type", "identifier"), attr("cardinality", "single"), attr("identifier", "T")],
        [],
      ),
      el(
        "qti-item-body",
        [],
        [answeringInline("A", "SHOWN_ANSWER"), answeringInline("B", "HIDDEN_ANSWER")],
      ),
    ],
  ),
);

/**
 * Construct the declaration of a single string response with no correct response, mapping or
 * default.
 *
 * @param identifier The response's identifier.
 * @returns The declaration.
 */
const declaredString = (identifier: string): ResponseDeclaration => ({
  areaMapping: Option.none(),
  baseType: "string",
  cardinality: "single",
  correct: Option.none(),
  defaultValue: Option.none(),
  identifier,
  mapping: Option.none(),
});

/**
 * Build an item whose template processing runs, with `VISIBLE` its template variable, the body
 * given, a single string response declared for each identifier given, in that order, and each
 * notice given listed among its notice-shown features.
 *
 * @param body The body.
 * @param responses The identifiers of the responses it declares.
 * @param notices The notice nodes its body holds.
 * @returns The item.
 */
const bindingOf = (
  body: readonly BodyNode[],
  responses: readonly string[],
  notices: readonly Unsupported[],
): Item => ({
  ...visibility,
  body,
  responses: new Map(responses.map((identifier) => [identifier, declaredString(identifier)])),
  unsupported: notices.map(({ feature, path }): UnsupportedFeature => ({
    feature,
    path,
    shown: "notice",
  })),
});

/**
 * Give the identifiers of a redacted item's responses.
 *
 * @param redaction The redacted item.
 * @returns The identifiers, in the order of its `responses`.
 */
const respondedTo = (redaction: Redacted): readonly string[] =>
  redaction.responses.map((binding) => binding.identifier);

describe("redactItem on responses only hidden content binds", () => {
  it("lists no response only a template inline the record hides binds in the redacted item, and names that response as hidden-only", () => {
    const accepted = Option.getOrThrow(acceptedItem(admittedSource(inlineAnswers)));
    const showingA = holding({ T: identifierValue("A") });
    const shown = redact(accepted, shownToCandidate, underRecord(showingA));

    assert.deepStrictEqual(shown.responses, [
      {
        baseType: "string",
        cardinality: "single",
        defaultValue: Option.none(),
        identifier: "SHOWN_ANSWER",
      },
    ]);
    assert.deepStrictEqual(
      [...hiddenOnlyResponses(accepted.item, underRecord(showingA))],
      ["HIDDEN_ANSWER"],
    );
    assert.deepStrictEqual(shownResponses(accepted, underRecord(showingA)), ["SHOWN_ANSWER"]);

    const showingB = holding({ T: identifierValue("B") });

    assert.deepStrictEqual(respondedTo(redact(accepted, shownToCandidate, underRecord(showingB))), [
      "HIDDEN_ANSWER",
    ]);
    assert.deepStrictEqual(
      [...hiddenOnlyResponses(accepted.item, underRecord(showingB))],
      ["SHOWN_ANSWER"],
    );
  });

  it("counts a notice's response as hidden-only inside a template block the record hides, and passes it through inside one it shows", () => {
    const order = noticeOf(
      "qti-order-interaction",
      `${blockPath}/qti-content-body/qti-order-interaction`,
    );
    const holdingOrder = bindingOf(
      [templatePart("template-block", byVisible("show"), [order], ["R2"])],
      ["R2"],
      [order],
    );
    const hiding = holding({ VISIBLE: multipleOf("W") });
    const showing = holding({ VISIBLE: multipleOf("X") });

    assert.deepStrictEqual([...hiddenOnlyResponses(holdingOrder, underRecord(hiding))], ["R2"]);
    assert.deepStrictEqual(
      respondedTo(redactItem(holdingOrder, shownToCandidate, underRecord(hiding))),
      [],
    );
    assert.deepStrictEqual([...hiddenOnlyResponses(holdingOrder, underRecord(showing))], []);
    assert.deepStrictEqual(
      respondedTo(redactItem(holdingOrder, shownToCandidate, underRecord(showing))),
      ["R2"],
    );
  });

  it.effect(
    `passes through the response of a notice outside any template block, under every record of the box and none: ${String(VISIBLE_RECORDS)} records`,
    (ctx) => {
      const order = noticeOf("qti-order-interaction", `${bodyPath}/qti-order-interaction`);
      const loose = bindingOf([order], ["R2"], [order]);

      return Effect.andThen(
        boxHolds(visibleRecord, VISIBLE_RECORDS),
        searched(
          ctx,
          exhaust(
            {
              box: "no record, a record holding no VISIBLE, and a record holding VISIBLE at a single NULL, W, X or Y or a multiple of 0 to 2 of W, X and Y",
              caseHang,
              coverage: noCoverage,
              generator: visibleRecord,
              literal: Formatter.format,
              oracle: {
                kind: "specification",
                name: "the information model hides a response only with the template or feedback content that binds it (5.145, 5.49), so a response a notice outside any binds is posted under every record",
              },
              suite: "plate/payload/loose-notice",
            },
            (record) =>
              Effect.sync(() => {
                const showing = underRecord(Option.getOrUndefined(record));

                assert.deepStrictEqual([...hiddenOnlyResponses(loose, showing)], []);
                assert.deepStrictEqual(respondedTo(redactItem(loose, shownToCandidate, showing)), [
                  "R2",
                ]);
              }),
          ),
        ),
      );
    },
  );

  it.effect(
    `keeps a response a Choice in a template block binds when a Text Entry the page sees binds it too, under every record of the box and none: ${String(VISIBLE_RECORDS)} records`,
    (ctx) => {
      const twice = bindingOf(
        [
          templatePart(
            "template-block",
            byVisible("show"),
            [{ ...choice, response: "R1" }],
            ["R1"],
          ),
          textEntry("R1"),
        ],
        ["R1"],
        [],
      );

      return Effect.andThen(
        boxHolds(visibleRecord, VISIBLE_RECORDS),
        searched(
          ctx,
          exhaust(
            {
              box: "no record, a record holding no VISIBLE, and a record holding VISIBLE at a single NULL, W, X or Y or a multiple of 0 to 2 of W, X and Y",
              caseHang,
              coverage: noCoverage,
              generator: visibleRecord,
              literal: Formatter.format,
              oracle: {
                kind: "specification",
                name: "an interaction the page sees binds its response (5.145: only an interaction inside hidden content is hidden with it), so a response bound both inside a template block and outside one is posted under every record, the block shown or hidden",
              },
              suite: "plate/payload/bound-twice",
            },
            (record) =>
              Effect.sync(() => {
                const showing = underRecord(Option.getOrUndefined(record));

                assert.deepStrictEqual([...hiddenOnlyResponses(twice, showing)], []);
                assert.deepStrictEqual(respondedTo(redactItem(twice, shownToCandidate, showing)), [
                  "R1",
                ]);
              }),
          ),
        ),
      );
    },
  );

  it("with no record, names as hidden-only each response of an item whose template processing runs that only a template block or inline binds, and keeps one no interaction binds", () => {
    const inside = bindingOf(
      [
        templatePart("template-block", byVisible("show"), [textEntry("R1")], ["R1"]),
        inlineParagraph(
          templatePart("template-inline", byVisible("hide"), [textEntry("R3")], ["R3"]),
        ),
        textEntry("R2"),
      ],
      ["R1", "R2", "R3", "R4"],
      [],
    );

    assert.deepStrictEqual([...hiddenOnlyResponses(inside, feedbackHidden)], ["R1", "R3"]);
    assert.deepStrictEqual(respondedTo(redactItem(inside, shownToCandidate, feedbackHidden)), [
      "R2",
      "R4",
    ]);
  });
});

/**
 * A case of the Controls box: an ordered Extended Text's `max-strings` and `min-strings`, and how
 * many members the value the view restores holds.
 */
interface ControlsCase {
  readonly maxStrings: Option.Option<bigint>;
  readonly members: number;
  readonly minStrings: bigint;
}

/**
 * Draw a count around the bounds the Controls' rule turns on: 0 to 2, 9 to 12 around the 10 an
 * unrestricted container shows, and 99 to 102 around the cap of 100.
 */
const nearControlBounds: Gen<number> = oneOf([int(0, 2), int(9, 12), int(99, 102)]);

/**
 * Draw a case of the Controls box: `max-strings` absent, near a bound or 10^12; `min-strings` near
 * a bound; a restored value of 0 to 2 members, 11 or 12, beside the 10, or 100 or 101, beside the
 * cap.
 */
const controlsCase: Gen<ControlsCase> = (source) => ({
  maxStrings: source.draw(
    oneOf([
      constant(Option.none()),
      map(nearControlBounds, (count) => Option.some(BigInt(count))),
      constant(Option.some(1_000_000_000_000n)),
    ]),
  ),
  members: source.draw(oneOf([int(0, 2), int(11, 12), int(100, 101)])),
  minStrings: source.draw(map(nearControlBounds, BigInt)),
});

/**
 * How many cases {@link controlsCase} draws: 1 + 11 + 1 `max-strings`, 7 member counts and 11
 * `min-strings`.
 */
const CONTROLS_CASES = (1 + 11 + 1) * 7 * 11;

/**
 * The cap of the Controls an Extended Text shows, past which its notice `min-strings>100` shows.
 */
const controlCap = 100;

/**
 * The Controls an ordered Extended Text shows for a case, as reading `max-strings-zero` and the
 * payload's rule state them: a `min-strings` above the cap leaves none, its notice in their place;
 * else `max-strings` Controls when it restricts (it is not 0, reading `max-strings-zero`) and is at
 * most 10, else the greater of 10 and `min-strings`, enough besides for each member restored up to
 * a restricting `max-strings` and the cap, with the notice beside them when the members held pass
 * the cap. Each Control restores its member, the rest none.
 *
 * @param controls The case.
 * @returns How many Controls, what each restores, and the notice.
 */
const expectedControls = (
  controls: ControlsCase,
): {
  readonly n: number;
  readonly notice: Option.Option<string>;
  readonly restores: readonly string[];
} => {
  if (controls.minStrings > BigInt(controlCap)) {
    return { n: 0, notice: Option.some("min-strings>100"), restores: [] };
  }

  const restricting = Option.filter(controls.maxStrings, (maxStrings) => maxStrings > 0n);
  const asked = Option.match(
    Option.filter(restricting, (maxStrings) => maxStrings <= 10n),
    {
      onNone: () => Math.max(10, Number(controls.minStrings)),
      onSome: Number,
    },
  );
  const heldMembers = Option.match(restricting, {
    onNone: () => controls.members,
    onSome: (maxStrings) => Math.min(controls.members, Number(maxStrings)),
  });
  const n = Math.max(asked, Math.min(heldMembers, controlCap));

  return {
    n,
    notice: heldMembers > controlCap ? Option.some("min-strings>100") : Option.none(),
    restores: Array.from({ length: n }, (_, index) =>
      index < controls.members ? `stage ${String(index + 1)}` : "",
    ),
  };
};

/**
 * What a case of the Controls box reaches.
 */
const controlsSituations = [
  "min-strings past the cap",
  "members past the cap",
  "max-strings restricts to it",
  "10 or min-strings",
] as const;

/**
 * A {@link controlsSituations} member.
 */
type ControlsSituation = (typeof controlsSituations)[number];

/**
 * The situation a case of the Controls box reaches, the cap's first.
 *
 * @param controls The case.
 * @returns The situation.
 */
const controlsSituationOf = (controls: ControlsCase): ControlsSituation => {
  if (controls.minStrings > BigInt(controlCap)) {
    return "min-strings past the cap";
  }

  if (Option.isSome(expectedControls(controls).notice)) {
    return "members past the cap";
  }

  return Option.exists(controls.maxStrings, (maxStrings) => maxStrings > 0n && maxStrings <= 10n)
    ? "max-strings restricts to it"
    : "10 or min-strings";
};

describe("payload", () => {
  it.effect(
    `holds no correct response, mapping key or outcome default in any view: every seed of the seed box, with no values and with the values held: ${String(2 * SEEDS)} views`,
    (ctx) => {
      const secrets = secretsOf(item);

      return Effect.andThen(
        boxHolds(viewCase, 2 * SEEDS),
        searched(
          ctx,
          exhaust(
            {
              box: "every seed of 0 to 2 of a digit, a letter and the space, with no values and with a Choice's and a Text Entry's values",
              caseHang,
              coverage: noCoverage,
              generator: viewCase,
              literal: Formatter.format,
              oracle: {
                kind: "specification",
                name: "the item's declarations, read by secretsOf: its correct values, mapping keys and outcome defaults belong to the response processing the database runs, so no page holds one, whatever its view",
              },
              suite: "plate/payload/secrets",
            },
            (view) =>
              Effect.sync(() => {
                const written = json(redacted) + json(shippedIn(pageFor(redacted, view)));

                assert.include(written, "Which city is the capital of France?");
                assert.deepStrictEqual(
                  secrets.filter((secret) => written.includes(secret)),
                  [],
                  "the secrets the page holds",
                );
              }),
          ),
        ),
      );
    },
  );

  it("gives an Inline Choice its choices, its Label and its placeholder, and restores the view's value", () => {
    const opened = inlineChoiceFor(pageFor(riverRedacted, answering), "RIVER");

    assert.deepStrictEqual(opened.choices, [
      { content: [{ kind: "text", text: "Seine" }], identifier: "S" },
      { content: [{ kind: "text", text: "Loire" }], identifier: "L" },
    ]);
    assert.deepStrictEqual(opened.label, Option.some([{ kind: "text", text: "River" }]));
    assert.deepStrictEqual(opened.placeholder, Option.some("Choose one"));
    assert.deepStrictEqual(opened.declared, {
      baseType: "identifier",
      cardinality: "single",
      identifier: "RIVER",
    });
    assert.deepStrictEqual(opened.restore, Option.none());

    const valued: View = {
      ...answering,
      values: new Map([["RIVER", one({ baseType: "identifier", value: "S" })]]),
    };
    assert.deepStrictEqual(
      inlineChoiceFor(pageFor(riverRedacted, valued), "RIVER").restore,
      Option.some("S"),
    );
  });

  it("refuses a full item in its type", () => {
    assert.isFunction(startOfItem);
  });

  it("presents the choices in document order with the Prompt and the binding", () => {
    const capital = choiceFor(pageFor(redacted, answering), "CAPITAL");

    assert.deepStrictEqual(capital.choices, [
      { catalog: Option.none(), content: [{ kind: "text", text: "Paris" }], identifier: "A" },
      { catalog: Option.none(), content: [{ kind: "text", text: "Lyon" }], identifier: "B" },
    ]);
    assert.deepStrictEqual(
      capital.prompt,
      Option.some([{ kind: "text", text: "Which city is the capital of France?" }]),
    );
    assert.strictEqual(capital.cardinality, "single");
    assert.strictEqual(capital.maxChoices, 1n);
    assert.deepStrictEqual(capital.class, Option.some("stacked"));
    assert.deepStrictEqual(capital.restore, []);
  });

  it("presents a shuffled Choice in presentedOrder's order, keyed by the seed and the response", () => {
    assert.deepStrictEqual(
      presentedOf(planets, { ...answering, seed: "7" }),
      choiceOrder(planets, "7"),
    );
    assert.deepStrictEqual(presentedOf(planets, answering), choiceOrder(planets, ""));
    assert.deepStrictEqual(
      presentedOf(planets, { ...answering, seed: "7" }),
      ["P3", "P0", "P2", "P1", "P4"],
      "`printf 'PLANET\\037P<n>' | openssl dgst -sha256 -hmac 7` ranks P3, P0, P1, P4; under the empty key P0, P1, P3, P4.",
    );
    assert.deepStrictEqual(presentedOf(planets, answering), ["P0", "P1", "P2", "P3", "P4"]);
  });

  it("keeps a fixed choice at its index, and two instances present a shuffled Choice in the same order", () => {
    const first = presentedOf(planets, { ...answering, seed: "7" });
    const second = presentedOf(planets, { ...answering, instance: "q1", seed: "7" });

    assert.strictEqual(first[2], "P2");
    assert.deepStrictEqual(first, second);
    assert.sameMembers([...first], ["P0", "P1", "P2", "P3", "P4"]);
  });

  it.effect(
    `keeps document order when shuffle is false, whatever the seed: ${String(SEEDS)} seeds`,
    (ctx) => {
      const ordered = { ...planets, shuffle: false };

      return Effect.andThen(
        boxHolds(seedBox, SEEDS),
        searched(
          ctx,
          exhaust(
            {
              box: "every seed of 0 to 2 of a digit, a letter and the space",
              caseHang,
              coverage: noCoverage,
              generator: seedBox,
              literal: (seed) => JSON.stringify(seed),
              oracle: {
                kind: "specification",
                name: "the Choice's shuffle attribute: false keeps the choices in the order the document writes them, so no seed moves one",
              },
              suite: "plate/payload/unshuffled-order",
            },
            (seed) =>
              Effect.sync(() => {
                assert.deepStrictEqual(presentedOf(ordered, { ...answering, seed }), [
                  "P0",
                  "P1",
                  "P2",
                  "P3",
                  "P4",
                ]);
              }),
          ),
        ),
      );
    },
  );

  it.effect(
    `carries the Choice's aria-label and aria-labelledby as written: ${String(ARIA_CASES)} pairs`,
    (ctx) =>
      Effect.andThen(
        boxHolds(ariaCase, ARIA_CASES),
        searched(
          ctx,
          exhaust(
            {
              box: "aria-label absent or 0 to 2 of a letter, the space and é; aria-labelledby absent, the id beside it, an id nothing carries, or both",
              caseHang,
              coverage: noCoverage,
              generator: ariaCase,
              literal: Formatter.format,
              oracle: {
                kind: "specification",
                name: "WAI-ARIA's aria-label and aria-labelledby, which name the element as written: the payload carries each as the item wrote it, or none where it wrote none",
              },
              suite: "plate/payload/aria",
            },
            ({ ariaLabel, ariaLabelledby }) =>
              Effect.sync(() => {
                const capital = choiceFor(
                  pageFor(
                    redactItem(
                      {
                        ...item,
                        body: [idParagraph("intro"), { ...choice, ariaLabel, ariaLabelledby }],
                      },
                      shownToCandidate,
                      feedbackHidden,
                    ),
                    answering,
                  ),
                  "CAPITAL",
                );

                assert.deepStrictEqual(capital.ariaLabel, ariaLabel);
                assert.deepStrictEqual(capital.ariaLabelledby, ariaLabelledby);
              }),
          ),
        ),
      ),
  );

  it("restores the view's values, and nothing with none", () => {
    const built = pageFor(redacted, { ...answering, values: held });
    const opened = pageFor(redacted, answering);

    assert.deepStrictEqual(choiceFor(built, "CAPITAL").restore, ["A"]);
    assert.strictEqual(textEntryFor(built, "FIRST").restore, "Marseille");
    assert.strictEqual(textEntryFor(built, "SECOND").restore, "");
    assert.deepStrictEqual(choiceFor(opened, "CAPITAL").restore, []);
    assert.strictEqual(textEntryFor(opened, "FIRST").restore, "");
  });

  it("hands each control its response's declaration", () => {
    const plain = pageFor(redacted, answering);

    assert.deepStrictEqual(
      shippedIn(plain).map((interaction) => interaction.payload.declared),
      [
        { baseType: "identifier", cardinality: "single", identifier: "CAPITAL" },
        ...["FIRST", "SECOND", "NAMED", "ESSAY"].map((response): Declared<"string", "single"> => ({
          baseType: "string",
          cardinality: "single",
          identifier: response,
        })),
      ],
    );
  });

  it("restores an integer value in the interaction's base", () => {
    const hex: TextEntryInteraction = { ...textEntry("HEX"), base: 16, baseType: "integer" };
    const hexItem: Item = {
      ...item,
      body: [hex],
      responses: new Map([
        [
          "HEX",
          {
            areaMapping: Option.none(),
            baseType: "integer",
            cardinality: "single",
            correct: Option.none(),
            defaultValue: Option.none(),
            identifier: "HEX",
            mapping: Option.none(),
          },
        ],
      ]),
    };
    const view: View = {
      ...answering,
      values: new Map([["HEX", one({ baseType: "integer", value: 255n })]]),
    };

    assert.strictEqual(
      textEntryFor(pageFor(redactItem(hexItem, shownToCandidate, feedbackHidden), view), "HEX")
        .restore,
      "ff",
    );
  });

  it('carries an Extended Text\'s format, format="xhtml" included', () => {
    const xhtml: Item = {
      ...item,
      body: item.body.map((node) =>
        node.kind === "extended-text" ? { ...node, format: "xhtml" } : node,
      ),
    };
    const essayPayload = textFor(
      pageFor(redactItem(xhtml, shownToCandidate, feedbackHidden), answering),
      "ESSAY",
    );

    assert.strictEqual(essayPayload.kind, "extended-text");
    assert.strictEqual(
      essayPayload.kind === "extended-text" ? essayPayload.payload.format : undefined,
      "xhtml",
    );
  });

  it("gives a single Extended Text one Control, restoring the text its control shows", () => {
    const built = pageFor(redacted, {
      ...answering,
      values: new Map([["ESSAY", one({ baseType: "string", value: "Rivers" })]]),
    });
    const essayPayload = extendedTextFor(built, "ESSAY");

    assert.deepStrictEqual(
      [essayPayload.cardinality, essayPayload.n, essayPayload.restores, essayPayload.notice],
      ["single", 1, ["Rivers"], Option.none()],
    );
  });

  it(`gives an ordered Extended Text its Controls by max-strings, min-strings and the value it restores, as reading \`max-strings-zero\` and the cap of 100 decide: ${String(CONTROLS_CASES)} cases`, (ctx) =>
    Effect.andThen(
      boxHolds(controlsCase, CONTROLS_CASES),
      searched(
        ctx,
        exhaust(
          {
            box: "max-strings absent, 0 to 2, 9 to 12, 99 to 102 or 10^12; min-strings 0 to 2, 9 to 12 or 99 to 102; a restored value of 0 to 2, 11, 12, 100 or 101 members",
            caseHang: Duration.seconds(30),
            coverage: requiredInSpace<ControlsSituation>(controlsSituations),
            generator: controlsCase,
            literal: Formatter.format,
            oracle: {
              kind: "specification",
              name: "reading `max-strings-zero` (max-strings 0 restricts nothing) and the Extended Text payload's rule, transcribed in expectedControls: a min-strings above 100 leaves no Control beside its notice; else max-strings from 1 to 10 Controls, or the greater of 10 and min-strings, covering each member restored up to a restricting max-strings and the cap of 100, the notice beside them over it",
            },
            suite: "plate/payload/extended-text-controls",
          },
          (controls, c) =>
            Effect.sync(() => {
              c.note(controlsSituationOf(controls));

              const view: View =
                controls.members === 0
                  ? answering
                  : {
                      ...answering,
                      values: new Map([["LIST", orderedOf(stages(controls.members))]]),
                    };
              const list = extendedTextFor(
                pageFor(listOf(controls.maxStrings, controls.minStrings), view),
                "LIST",
              );
              const expected = expectedControls(controls);

              assert.deepStrictEqual(
                [list.cardinality, list.n, list.restores, list.notice],
                ["ordered", expected.n, expected.restores, expected.notice],
              );
            }),
        ),
      ),
    ));

  it("shows the first 100 members of a 150-member value and the cap's notice beside them", () => {
    const members = stages(150);
    const list = extendedTextFor(
      pageFor(listOf(Option.some(0n), 0n), {
        ...answering,
        values: new Map([["LIST", orderedOf(members)]]),
      }),
      "LIST",
    );

    assert.deepStrictEqual(
      [list.n, list.restores, list.notice],
      [100, members.slice(0, 100), Option.some("min-strings>100")],
    );
  });

  it('covers a value\'s members only up to max-strings="12", with no notice', () => {
    const members = stages(15);
    const list = extendedTextFor(
      pageFor(listOf(Option.some(12n), 0n), {
        ...answering,
        values: new Map([["LIST", orderedOf(members)]]),
      }),
      "LIST",
    );

    assert.deepStrictEqual(
      [list.n, list.restores, list.notice],
      [12, members.slice(0, 12), Option.none()],
    );
  });

  it("fills a container's Controls in order with its values", () => {
    const list = listOf(Option.some(3n), 0n);
    const shownValues = pageFor(list, {
      ...answering,
      values: new Map([
        [
          "LIST",
          {
            baseType: "string",
            cardinality: "ordered",
            values: [
              { baseType: "string", value: "evaporation" },
              { baseType: "string", value: "condensation" },
            ],
          },
        ],
      ]),
    });

    assert.deepStrictEqual(extendedTextFor(shownValues, "LIST").restores, [
      "evaporation",
      "condensation",
      "",
    ]);
  });
});

/**
 * The shuffled {@link planets} as the one interaction of an accepted item, redacted for a page.
 */
const planetsRedacted = redact(
  acceptForTest({
    ...item,
    body: [planets],
    responses: new Map([
      [
        "PLANET",
        {
          areaMapping: Option.none(),
          baseType: "identifier",
          cardinality: "single",
          correct: Option.none(),
          defaultValue: Option.none(),
          identifier: "PLANET",
          mapping: Option.none(),
        },
      ],
    ]),
  }),
  shownToCandidate,
  feedbackHidden,
);

/**
 * Give the choices the page of {@link planetsRedacted} presents, in order.
 *
 * @param seed The configuration's seed.
 * @param token The page's instance.
 * @returns Each choice's identifier, in presented order.
 */
const presentedOrder = Effect.fn(function* presentedOrder(seed: string, token: string) {
  const configuration = yield* configure({ seed });

  return presentedChoices(pageOf(planetsRedacted, { configuration, instance: token }), "PLANET");
});

/**
 * A case of the order box: the configuration's seed and the page's instance.
 */
interface OrderCase {
  readonly seed: string;
  readonly token: string;
}

/**
 * Draw a case of the order box: every seed of {@link seedBox} on two instances, the suite's and
 * another.
 */
const orderCase: Gen<OrderCase> = (source) => ({
  seed: source.draw(seedBox),
  token: source.draw(element([instance, "q1"])),
});

describe("choiceOrder", () => {
  it.effect(
    `gives the order the page presents for a shuffled Choice, under every seed of the box and two instances, the instance deciding nothing: ${String(SEEDS * 2)} pages`,
    (ctx) =>
      Effect.andThen(
        boxHolds(orderCase, SEEDS * 2),
        searched(
          ctx,
          exhaust(
            {
              box: "every seed of 0 to 2 of a digit, a letter and the space, on the suite's instance and another",
              caseHang,
              coverage: noCoverage,
              generator: orderCase,
              literal: Formatter.format,
              oracle: {
                kind: "second-implementation",
                name: "choiceOrder over the Choice and the seed alone: the page presents every choice once, in choiceOrder's order, whatever its instance",
              },
              suite: "plate/payload/choice-order",
            },
            ({ seed, token }) =>
              Effect.gen(function* presentsChoiceOrder() {
                const presented = yield* presentedOrder(seed, token);

                assert.lengthOf(presented, planets.choices.length);
                assert.deepStrictEqual(choiceOrder(planets, seed), presented);
              }),
          ),
        ),
      ),
  );

  it.effect(
    `keeps a fixed choice at its document index in a shuffled Choice, and document order in a Choice that is not shuffled, whatever the seed: ${String(SEEDS)} seeds`,
    (ctx) =>
      Effect.andThen(
        boxHolds(seedBox, SEEDS),
        searched(
          ctx,
          exhaust(
            {
              box: "every seed of 0 to 2 of a digit, a letter and the space",
              caseHang,
              coverage: noCoverage,
              generator: seedBox,
              literal: (seed) => JSON.stringify(seed),
              oracle: {
                kind: "specification",
                name: "the Choice's shuffle attribute and a choice's fixed: a fixed choice keeps its place when the rest are shuffled, and no choice moves when shuffle is false",
              },
              suite: "plate/payload/fixed-and-unshuffled",
            },
            (seed) =>
              Effect.sync(() => {
                assert.strictEqual(choiceOrder(planets, seed)[2], "P2");
                assert.deepStrictEqual(choiceOrder({ ...planets, shuffle: false }, seed), [
                  "P0",
                  "P1",
                  "P2",
                  "P3",
                  "P4",
                ]);
              }),
          ),
        ),
      ),
  );
});

/**
 * Construct the NULL a single response of a base type starts at.
 *
 * @param baseType Its declared base type.
 * @returns The NULL.
 */
const nullSingle = (baseType: Value["baseType"]): Value => nullOf(baseType, "single");

/**
 * The responses of the smaller item the growth check reads, each bound to its own Text Entry,
 * before it reads one with {@link growthFactor} times as many.
 */
const fewerEntries = 2000;

/**
 * Construct an item whose body is one paragraph of Text Entries, each bound to its own single
 * string response, `R1` to `R<count>`, accepted as it is.
 *
 * @param count How many responses and Text Entries it holds.
 * @returns The accepted item.
 */
const entriesItem = (count: number): Accepted => {
  const identifiers = Array.from({ length: count }, (_, index) => `R${String(index + 1)}`);

  return acceptForTest({
    ...item,
    body: [
      {
        attributes: [],
        children: identifiers.map((identifier) => textEntry(identifier)),
        kind: "element",
        path: "qti-assessment-item/qti-item-body/p",
        tag: "p",
      },
    ],
    responses: new Map(
      identifiers.map((identifier) => [
        identifier,
        {
          areaMapping: Option.none(),
          baseType: "string",
          cardinality: "single",
          correct: Option.none(),
          defaultValue: Option.none(),
          identifier,
          mapping: Option.none(),
        },
      ]),
    ),
  });
};

/**
 * Construct an End Attempt bound to a response, at a path, its `count-attempt` false.
 *
 * @param response The response it binds.
 * @param path Its element path.
 * @returns The End Attempt's model node.
 */
const endAttempt = (response: string, path: string) => ({
  ariaLabel: Option.none(),
  ariaLabelledby: Option.none(),
  catalog: Option.none(),
  class: Option.none(),
  countAttempt: false,
  data: [],
  id: Option.none(),
  kind: "end-attempt" as const,
  path,
  promptCatalog: Option.none(),
  response,
  title: response,
});

/**
 * Construct a single boolean response declaration, by identifier, as a response map's entry.
 *
 * @param identifier The response.
 * @param defaultValue Its default.
 * @returns The entry.
 */
const booleanResponse = (identifier: string, defaultValue: Option.Option<Value>) =>
  [
    identifier,
    {
      areaMapping: Option.none(),
      baseType: "boolean" as const,
      cardinality: "single" as const,
      correct: Option.none(),
      defaultValue,
      identifier,
      mapping: Option.none(),
    },
  ] as const;

describe("startingResponses", () => {
  it("starts each shown response at its start, in declaration order, and none no interaction binds", () => {
    const bound: Item = {
      ...item,
      body: [
        { ...essay, base: 8 },
        choice,
        { ...textEntry("FIRST"), base: 16 },
        {
          attributes: [],
          children: [{ ...textEntry("FIRST"), base: 2 }, textEntry("SECOND"), textEntry("NAMED")],
          kind: "element",
          path: "qti-assessment-item/qti-item-body/p",
          tag: "p",
        },
      ],
      responses: new Map([
        ...item.responses,
        [
          "POINT",
          {
            areaMapping: Option.none(),
            baseType: "point",
            cardinality: "single",
            correct: Option.none(),
            defaultValue: Option.none(),
            identifier: "POINT",
            mapping: Option.none(),
          },
        ],
      ]),
    };
    const accepted = acceptForTest(bound);

    assert.deepStrictEqual(shownResponses(accepted, feedbackHidden), [
      "CAPITAL",
      "FIRST",
      "SECOND",
      "NAMED",
      "ESSAY",
    ]);
    assert.deepStrictEqual(startingResponses(accepted, feedbackHidden), {
      CAPITAL: nullSingle("identifier"),
      ESSAY: nullSingle("string"),
      FIRST: nullSingle("string"),
      // A Text Entry starts at its response's default (spec reading `response-default`).
      NAMED: one({ baseType: "string", value: responseDefault }),
      SECOND: nullSingle("string"),
    });
  });

  it("starts every End Attempt the page does not show, inside hidden feedback, at false whatever its default, and one the page shows at false too, and shows only the one it shows (SV-RP-01)", () => {
    const yes: Value = {
      baseType: "boolean",
      cardinality: "single",
      values: [{ baseType: "boolean", value: true }],
    };
    const no: Value = {
      baseType: "boolean",
      cardinality: "single",
      values: [{ baseType: "boolean", value: false }],
    };
    const hidden: Item = {
      ...item,
      body: [
        endAttempt("HINT", "qti-assessment-item/qti-item-body/qti-end-attempt-interaction[1]"),
        {
          content: [
            endAttempt(
              "MORE",
              "qti-assessment-item/qti-item-body/qti-feedback-block/qti-end-attempt-interaction",
            ),
          ],
          feedbackVisibility: { outcomeIdentifier: "FEEDBACK", showHide: "show" },
          identifier: "clue",
          kind: "feedback-block",
          path: "qti-assessment-item/qti-item-body/qti-feedback-block",
          responses: ["MORE"],
        },
      ],
      responses: new Map([
        booleanResponse("HINT", Option.none()),
        booleanResponse("MORE", Option.some(yes)),
      ]),
    };
    const accepted = acceptForTest(hidden);

    assert.deepStrictEqual(shownResponses(accepted, feedbackHidden), ["HINT"]);
    assert.deepStrictEqual(startingResponses(accepted, feedbackHidden), { HINT: no, MORE: no });

    const shown: Item = { ...hidden, body: [hidden.body[0] ?? assert.fail("no body")] };
    assert.deepStrictEqual(startingResponses(acceptForTest(shown), feedbackHidden), { HINT: no });
  });

  it("shows an End Attempt inside feedback the record shows only where the page shows feedback, and starts it at false either way (show-feedback, 7.19.2)", () => {
    const no: Value = {
      baseType: "boolean",
      cardinality: "single",
      values: [{ baseType: "boolean", value: false }],
    };
    const clue: Item = {
      ...item,
      body: [
        {
          content: [
            endAttempt(
              "MORE",
              "qti-assessment-item/qti-item-body/qti-feedback-block/qti-end-attempt-interaction",
            ),
          ],
          feedbackVisibility: { outcomeIdentifier: "FEEDBACK", showHide: "hide" },
          identifier: "clue",
          kind: "feedback-block",
          path: "qti-assessment-item/qti-item-body/qti-feedback-block",
          responses: ["MORE"],
        },
      ],
      responses: new Map([booleanResponse("MORE", Option.none())]),
    };
    const accepted = acceptForTest(clue);
    /**
     * FEEDBACK at NULL, as the database's record holds it at the start: the hide block shows.
     */
    const start: RedactRecord = {
      attempt: "none",
      defaults: {},
      outcomes: { FEEDBACK: { baseType: "identifier", cardinality: "single", values: [] } },
      templates: {},
    };
    const fed: Showing = { record: start, showFeedback: true };

    assert.deepStrictEqual(shownResponses(accepted, fed), ["MORE"]);
    assert.deepStrictEqual(startingResponses(accepted, fed), { MORE: no });
    for (const unfed of [underRecord(start), feedbackHidden]) {
      assert.deepStrictEqual(shownResponses(accepted, unfed), []);
      assert.deepStrictEqual(startingResponses(accepted, unfed), { MORE: no });
    }
  });

  it("starts an Inline Choice's response at NULL", () => {
    assert.deepStrictEqual(startingResponses(acceptForTest(riverItem), feedbackHidden), {
      RIVER: nullSingle("identifier"),
    });
  });

  it("starts a record response a Text Entry binds at the NULL record, after the responses of a base type, and none a record response no interaction binds", () => {
    const answer = { correct: Option.none(), defaultValue: Option.none(), identifier: "ANSWER" };
    const recorded: Item = {
      ...item,
      body: [choice, textEntry("ANSWER")],
      records: new Map([
        ["ANSWER", answer],
        ["UNBOUND", { ...answer, identifier: "UNBOUND" }],
      ]),
    };
    const shown = redactItem(recorded, shownToCandidate, feedbackHidden);

    assert.deepStrictEqual(
      shown.responses.filter((binding) => binding.cardinality === "record"),
      [
        { cardinality: "record", defaultValue: Option.none(), identifier: "ANSWER" },
        { cardinality: "record", defaultValue: Option.none(), identifier: "UNBOUND" },
      ],
    );
    assert.deepStrictEqual(shownResponses(acceptForTest(recorded), feedbackHidden), [
      "CAPITAL",
      "ANSWER",
    ]);
    assert.deepStrictEqual(startingResponses(acceptForTest(recorded), feedbackHidden), {
      ANSWER: nullRecord,
      CAPITAL: nullSingle("identifier"),
    });
  });

  it("starts no declared response no interaction binds, so a post carries nothing over its record value", () => {
    const unbound: Item = { ...item, body: [choice] };

    assert.deepStrictEqual(startingResponses(acceptForTest(unbound), feedbackHidden), {
      CAPITAL: nullSingle("identifier"),
    });
  });

  it.effect(
    "starts 8 times the responses, each bound to its own Text Entry, in under 32 times the time",
    () =>
      Effect.gen(function* startsInLinearTime() {
        const fewer = entriesItem(fewerEntries);
        const more = entriesItem(fewerEntries * growthFactor);
        assert.lengthOf(
          Object.keys(startingResponses(more, feedbackHidden)),
          fewerEntries * growthFactor,
        );

        const growth = yield* growthRatio(
          () => {
            startingResponses(fewer, feedbackHidden);
          },
          () => {
            startingResponses(more, feedbackHidden);
          },
        );
        assert.isBelow(
          growth,
          growthLimit,
          `8 times the bound responses took ${growth.toFixed(1)} times as long`,
        );
      }),
  );
});

/**
 * The parameters of {@link parameterDocument}'s `object`, each a `name` and the `value` written:
 * one for each `param-variable` template variable, `N` an integer, `F` a float, `P` a point, `Q` a
 * pair, `D` a directed pair, `B` a boolean and `T` a duration; `PLAIN`, a template variable not
 * declared `param-variable`; and a literal no variable is named by.
 */
const writtenParameters = [
  ["count", "N"],
  ["ratio", "F"],
  ["spot", "P"],
  ["link", "Q"],
  ["arrow", "D"],
  ["flag", "B"],
  ["span", "T"],
  ["plain", "PLAIN"],
  ["literal", "hello"],
] as const;

/**
 * Construct a `qti-template-declaration` with a declared default.
 *
 * @param identifier The variable's identifier.
 * @param baseType Its base type.
 * @param lexical Its default, as written.
 * @param parameter Whether it is declared `param-variable="true"`.
 * @returns The element.
 */
const parameterDeclaration = (
  identifier: string,
  baseType: string,
  lexical: string,
  parameter: boolean,
) =>
  el(
    "qti-template-declaration",
    [
      attr("base-type", baseType),
      attr("cardinality", "single"),
      attr("identifier", identifier),
      ...(parameter ? [attr("param-variable", "true")] : []),
    ],
    [el("qti-default-value", [], [el("qti-value", [], [sourceText(lexical)])])],
  );

/**
 * An item whose template processing runs, with a paragraph holding an `object` whose parameters
 * are {@link writtenParameters}. Each template variable declares a default, and the processing
 * sets `N` to 255.
 */
const parameterDocument = doc(
  "item.xml",
  el(
    "qti-assessment-item",
    [attr("identifier", "parameters"), attr("time-dependent", "false"), attr("title", "Params")],
    [
      parameterDeclaration("N", "integer", "3", true),
      parameterDeclaration("F", "float", "0.5", true),
      parameterDeclaration("P", "point", "1 2", true),
      parameterDeclaration("Q", "pair", "C D", true),
      parameterDeclaration("D", "directedPair", "C D", true),
      parameterDeclaration("B", "boolean", "false", true),
      parameterDeclaration("T", "duration", "90.5", true),
      parameterDeclaration("PLAIN", "integer", "7", false),
      el(
        "qti-template-processing",
        [],
        [
          el(
            "qti-set-template-value",
            [attr("identifier", "N")],
            [el("qti-base-value", [attr("base-type", "integer")], [sourceText("255")])],
          ),
        ],
      ),
      el(
        "qti-item-body",
        [],
        [
          el(
            "p",
            [],
            [
              el(
                "object",
                [attr("data", "applet.html"), attr("type", "text/html")],
                [
                  ...writtenParameters.map(([name, value]) =>
                    el(
                      "param",
                      [attr("name", name), attr("value", value), attr("valuetype", "DATA")],
                      [],
                    ),
                  ),
                  sourceText("Applet"),
                ],
              ),
            ],
          ),
        ],
      ),
    ],
  ),
);

/**
 * The template values of an attempt of {@link parameterDocument}: `N` 255, `F` 1234567.5, `P` the
 * point 3 4, `Q` the pair A B, `D` the directed pair B A, `B` true, `T` 5400.25 seconds and
 * `PLAIN` 7.
 */
const parameterValues = holding({
  B: one({ baseType: "boolean", value: true }),
  D: one({ baseType: "directedPair", value: ["B", "A"] }),
  F: floatValue(1_234_567.5),
  N: integerValue(255n),
  P: one({ baseType: "point", value: [3n, 4n] }),
  PLAIN: integerValue(7n),
  Q: one({ baseType: "pair", value: ["A", "B"] }),
  T: one({ baseType: "duration", value: 5400.25 }),
});

/**
 * Give the children of the `object` in a body of {@link parameterDocument} or
 * {@link containerParameterDocument}: the paragraph's one element.
 *
 * @param body The body, as the model reads it or as a redaction leaves it.
 * @returns The object's children.
 */
const objectChildren = (body: readonly BodyNode[]): readonly BodyNode[] => {
  const [paragraph] = body;
  const [object] = paragraph?.kind === "element" ? paragraph.children : [];

  return object?.kind === "element" && object.tag === "object"
    ? object.children
    : assert.fail("The paragraph holds no object.");
};

/**
 * Give each `param` among some body nodes as its `name` and its `value`.
 *
 * @param nodes The nodes.
 * @returns Each parameter's name and value, in document order.
 */
const parametersOf = (nodes: readonly BodyNode[]): readonly (readonly [string, string])[] =>
  nodes.flatMap((node): readonly (readonly [string, string])[] => {
    if (node.kind !== "element" || node.tag !== "param") {
      return [];
    }

    const valueOf = (name: string): string =>
      node.attributes.find((entry) => entry.name === name)?.value ??
      assert.fail(`A param has no ${name}.`);

    return [[valueOf("name"), valueOf("value")]];
  });

/**
 * The parameters {@link parameterValues} gives {@link parameterDocument}'s `object`: each
 * `param-variable` value written as the information model's `param` `value` converts it, and the
 * others as written.
 */
const expandedParameters = [
  ["count", "255"],
  ["ratio", "1.23457E+06"],
  ["spot", "3 4"],
  ["link", "A B"],
  ["arrow", "B A"],
  ["flag", "true"],
  ["span", "5400.25"],
  ["plain", "PLAIN"],
  ["literal", "hello"],
] as const;

/**
 * The notice a withheld `param` of {@link parameterDocument} is shown as.
 *
 * @param node The `param` as the model reads it.
 * @returns The notice at its path.
 */
const parameterNoticeAt = (node: BodyNode | undefined): Unsupported =>
  node?.kind === "element"
    ? noticeOf("param", node.path)
    : assert.fail("The object holds fewer params.");

/**
 * Construct a `param-variable` `qti-template-declaration` with no declared default.
 *
 * @param identifier The variable's identifier.
 * @param baseType Its base type.
 * @param cardinality Its cardinality.
 * @returns The element.
 */
const unsetParameterDeclaration = (identifier: string, baseType: string, cardinality: string) =>
  el(
    "qti-template-declaration",
    [
      attr("base-type", baseType),
      attr("cardinality", cardinality),
      attr("identifier", identifier),
      attr("param-variable", "true"),
    ],
    [],
  );

/**
 * Construct a `qti-base-value` for each lexical value of one base type.
 *
 * @param baseType The base type.
 * @param lexicals The values, as written, in order.
 * @returns The elements.
 */
const baseValues = (baseType: string, lexicals: readonly string[]) =>
  lexicals.map((lexical) =>
    el("qti-base-value", [attr("base-type", baseType)], [sourceText(lexical)]),
  );

/**
 * An item whose template processing runs, with a paragraph holding an `object` whose parameters
 * name three `param-variable` template variables that hold no single value: `list` names `LIST`,
 * an ordered integer container, `set` names `SET`, a multiple identifier container, and `none`
 * names `NONE`, a single integer the processing sets to NULL.
 */
const containerParameterDocument = doc(
  "item.xml",
  el(
    "qti-assessment-item",
    [
      attr("identifier", "container-parameters"),
      attr("time-dependent", "false"),
      attr("title", "Params"),
    ],
    [
      unsetParameterDeclaration("LIST", "integer", "ordered"),
      unsetParameterDeclaration("SET", "identifier", "multiple"),
      unsetParameterDeclaration("NONE", "integer", "single"),
      el(
        "qti-template-processing",
        [],
        [
          el(
            "qti-set-template-value",
            [attr("identifier", "LIST")],
            [el("qti-ordered", [], baseValues("integer", ["1", "2", "3"]))],
          ),
          el(
            "qti-set-template-value",
            [attr("identifier", "SET")],
            [el("qti-multiple", [], baseValues("identifier", ["A", "B"]))],
          ),
          el("qti-set-template-value", [attr("identifier", "NONE")], [el("qti-null", [], [])]),
        ],
      ),
      el(
        "qti-item-body",
        [],
        [
          el(
            "p",
            [],
            [
              el(
                "object",
                [attr("data", "applet.html"), attr("type", "text/html")],
                [
                  ...(
                    [
                      ["list", "LIST"],
                      ["set", "SET"],
                      ["none", "NONE"],
                    ] as const
                  ).map(([name, value]) =>
                    el(
                      "param",
                      [attr("name", name), attr("value", value), attr("valuetype", "DATA")],
                      [],
                    ),
                  ),
                  sourceText("Applet"),
                ],
              ),
            ],
          ),
        ],
      ),
    ],
  ),
);

/**
 * The template values of an attempt of {@link containerParameterDocument}: `LIST` the ordered
 * integers 1, 2 and 3, `SET` the multiple identifiers A and B, and `NONE` NULL.
 */
const containerParameterValues = holding({
  LIST: orderedIntegers([1n, 2n, 3n]),
  NONE: nullOf("integer", "single"),
  SET: multipleOf("A", "B"),
});

describe("redactItem on param-variable parameters", () => {
  it.effect(
    "gives a param whose value names a param-variable template variable that variable's value from the record: an integer by %i, a float and a duration by %G, a point x then y, a pair and a directed pair as their identifiers, a boolean as true or false",
    () =>
      Effect.gen(function* passesParameterValues() {
        const accepted = yield* Effect.fromOption(acceptedItem(admittedSource(parameterDocument)));
        const expanded = redact(accepted, shownToCandidate, underRecord(parameterValues));

        assert.deepStrictEqual(parametersOf(objectChildren(expanded.body)), expandedParameters);
      }),
  );

  it.effect(
    "gives a param whose param-variable template variable holds a container its members joined by ; and one holding NULL the empty string",
    () =>
      Effect.gen(function* passesContainersAndNull() {
        const accepted = yield* Effect.fromOption(
          acceptedItem(admittedSource(containerParameterDocument)),
        );
        const expanded = redact(accepted, shownToCandidate, underRecord(containerParameterValues));
        const passed = [
          ["list", "1;2;3"],
          ["set", "A;B"],
          ["none", ""],
        ] as const;

        assert.deepStrictEqual(parametersOf(objectChildren(expanded.body)), passed);
      }),
  );

  it.effect(
    "keeps the written value of a param that names a template variable not declared param-variable, or names none",
    () =>
      Effect.gen(function* keepsWrittenValues() {
        const accepted = yield* Effect.fromOption(acceptedItem(admittedSource(parameterDocument)));
        const kept = parametersOf(
          objectChildren(redact(accepted, shownToCandidate, underRecord(parameterValues)).body),
        );

        assert.deepStrictEqual(kept.slice(-2), [
          ["plain", "PLAIN"],
          ["literal", "hello"],
        ]);
      }),
  );

  it.effect(
    "with no record, withholds each param-variable param of an item whose template processing runs behind its notice, param at its path",
    () =>
      Effect.gen(function* withholdsParameters() {
        const accepted = yield* Effect.fromOption(acceptedItem(admittedSource(parameterDocument)));
        const withheld = redact(accepted, shownToCandidate, feedbackHidden);
        const [count, ratio, spot, link, arrow, flag, span, ...rest] = objectChildren(
          accepted.item.body,
        );

        assert.deepStrictEqual(objectChildren(withheld.body), [
          ...[count, ratio, spot, link, arrow, flag, span].map(parameterNoticeAt),
          ...rest,
        ]);
      }),
  );

  it.effect(
    "withholds a param-variable param whose template variable the record holds no value of, as with no record",
    () =>
      Effect.gen(function* withholdsUnheldParameter() {
        const accepted = yield* Effect.fromOption(acceptedItem(admittedSource(parameterDocument)));
        const { N: _held, ...unheld } = parameterValues.templates;
        const gap = redact(accepted, shownToCandidate, underRecord(holding(unheld)));
        const [count] = objectChildren(accepted.item.body);
        const [, ...expandedOthers] = objectChildren(
          redact(accepted, shownToCandidate, underRecord(parameterValues)).body,
        );

        assert.deepStrictEqual(objectChildren(gap.body), [
          parameterNoticeAt(count),
          ...expandedOthers,
        ]);
      }),
  );

  it.effect(
    "with no record, gives an item without template processing's param-variable params no value, as an item with template processing",
    () =>
      Effect.gen(function* givesNoValues() {
        const accepted = yield* Effect.fromOption(acceptedItem(admittedSource(parameterDocument)));

        assert.deepStrictEqual(
          parametersOf(
            objectChildren(
              redactItem({ ...accepted.item, templated: false }, shownToCandidate, feedbackHidden)
                .body,
            ),
          ),
          parametersOf(
            objectChildren(
              redactItem({ ...accepted.item, templated: true }, shownToCandidate, feedbackHidden)
                .body,
            ),
          ),
        );
      }),
  );
});

/**
 * Construct an item whose template processing sets the ordered template variable `S` to a number
 * of copies of one value through a `qti-repeat`, and whose one paragraph prints `S` after the
 * label `Value: `.
 *
 * @param baseType `S`'s base type.
 * @param lexical The value repeated, as written.
 * @param count How many times `qti-repeat` repeats it.
 * @param printedAttributes The printed variable's attributes besides its `identifier`.
 * @returns The document.
 */
const repeatedDocument = (
  baseType: string,
  lexical: string,
  count: number,
  printedAttributes: readonly SourceAttribute[],
): SourceDocument =>
  doc(
    "item.xml",
    el(
      "qti-assessment-item",
      [attr("identifier", "repeated"), attr("time-dependent", "false"), attr("title", "Repeated")],
      [
        el(
          "qti-template-declaration",
          [attr("base-type", baseType), attr("cardinality", "ordered"), attr("identifier", "S")],
          [],
        ),
        el(
          "qti-template-processing",
          [],
          [
            el(
              "qti-set-template-value",
              [attr("identifier", "S")],
              [
                el(
                  "qti-repeat",
                  [attr("number-repeats", String(count))],
                  baseValues(baseType, [lexical]),
                ),
              ],
            ),
          ],
        ),
        el(
          "qti-item-body",
          [],
          [
            el(
              "p",
              [],
              [
                sourceText("Value: "),
                el("qti-printed-variable", [attr("identifier", "S"), ...printedAttributes], []),
              ],
            ),
          ],
        ),
      ],
    ),
  );

/**
 * Construct an ordered container that holds one string a number of times.
 *
 * @param value The string.
 * @param count How many times the container holds it.
 * @returns The value.
 */
const repeatedStrings = (value: string, count: number): Value => ({
  baseType: "string",
  cardinality: "ordered",
  values: Array.from({ length: count }, () => ({ baseType: "string", value })),
});

/**
 * The accepted items whose printed variable's whole text passes 1,000,000 characters, each with the
 * value its template processing sets: 600 integers printed under `%999999i`, and 1,000,000 strings
 * of 400 characters printed in the default form (a string a document writes holds at most the 428
 * bytes a key holds, reading `nothing-valid-refused`'s key-text bound, so the database admits it).
 */
const oversizedPrinting: readonly (readonly [SourceDocument, Value])[] = [
  [
    repeatedDocument("integer", "1", 600, [attr("format", "%999999i")]),
    orderedIntegers(Array.from({ length: 600 }, () => 1n)),
  ],
  [
    repeatedDocument("string", "y".repeat(400), 1_000_000, []),
    repeatedStrings("y".repeat(400), 1_000_000),
  ],
];

/**
 * The path of {@link repeatedDocument}'s printed variable, as `checkAdmitted` reads it.
 */
const repeatedPath = `${bodyPath}/p/qti-printed-variable`;

describe("redactItem on a printed variable whose text passes 1,000,000 characters", () => {
  it.effect(
    "returns with the printed variable's place empty and records it, the bound 1,000,000 and its path, for 600 integers under %999999i and for 1,000,000 strings of 400 characters, so render fails rather than show the blank",
    () =>
      Effect.gen(function* recordsOversizedText() {
        for (const [document, value] of oversizedPrinting) {
          const accepted = yield* Effect.fromOption(acceptedItem(admittedSource(document)));
          const emptied = redactItem(
            accepted.item,
            shownToCandidate,
            underRecord(holding({ S: value })),
          );

          assert.deepStrictEqual(paragraphOf(emptied), [text("Value: ")]);
          assert.deepStrictEqual(
            emptied.unprinted,
            Option.some({ bound: 1_000_000, identifier: "S", limit: "text", path: repeatedPath }),
          );
        }
      }),
  );

  it.effect(
    "records a printed variable under %1000001i, a conversion wider than 1,000,000 characters, and leaves its place empty",
    () =>
      Effect.gen(function* recordsWidenedConversion() {
        const document = repeatedDocument("integer", "5", 1, [attr("format", "%1000001i")]);
        const accepted = yield* Effect.fromOption(acceptedItem(admittedSource(document)));
        const emptied = redactItem(
          accepted.item,
          shownToCandidate,
          underRecord(holding({ S: orderedIntegers([5n]) })),
        );

        assert.deepStrictEqual(paragraphOf(emptied), [text("Value: ")]);
        assert.deepStrictEqual(
          emptied.unprinted,
          Option.some({ bound: 1_000_000, identifier: "S", limit: "text", path: repeatedPath }),
        );
      }),
  );

  it.effect(
    "prints the same item's text, and records nothing, when it stays within the bound",
    () =>
      Effect.gen(function* printsWithinBound() {
        const document = repeatedDocument("integer", "1", 3, [attr("format", "%2i")]);
        const accepted = yield* Effect.fromOption(acceptedItem(admittedSource(document)));
        const shown = redactItem(
          accepted.item,
          shownToCandidate,
          underRecord(holding({ S: orderedIntegers([1n, 1n, 1n]) })),
        );

        assert.deepStrictEqual(paragraphOf(shown), texts("Value: ", " 1; 1; 1"));
        assert.deepStrictEqual(shown.unprinted, Option.none());
      }),
  );
});

/**
 * Give what a body shows of its interactions: each one's kind, the response it binds and the
 * identifiers of its choices (none for a text control), in document order.
 *
 * @param body The body of a redaction or of a structure.
 * @returns The interactions, each as its kind, response and choices.
 */
const shownParts = (
  body: readonly BodyNode[],
): readonly (readonly [string, string, readonly string[]])[] =>
  interactionsIn(body).map((interaction) => [
    interaction.kind,
    interaction.response,
    interaction.kind === "choice" || interaction.kind === "inline-choice"
      ? interaction.choices.map((entry) => entry.identifier)
      : [],
  ]);

/**
 * Give the item `checkAdmitted` accepts from a document, failing the test otherwise.
 *
 * @param document The document.
 * @returns The item.
 */
const acceptedFrom = (document: SourceDocument): Item =>
  Option.getOrElse(acceptedItem(admittedSource(document)), () =>
    assert.fail(`${document.location} is not accepted.`),
  ).item;

/**
 * A value whose members count each read of them, and a faithful value otherwise.
 */
interface CountedValue {
  /**
   * How many times the members have been read.
   */
  readonly reads: () => number;
  readonly value: Value;
}

/**
 * Wrap a value so each read of its members counts. Printing a variable reads its members, and
 * deciding which parts the page shows never reads a printed variable's, so the count shows whether
 * a path printed it.
 *
 * @param value The value.
 * @returns The wrapped value and its count.
 */
const counted = (value: Value): CountedValue => {
  let reads = 0;

  return {
    reads: () => reads,
    value: {
      baseType: value.baseType,
      cardinality: value.cardinality,
      get values() {
        reads += 1;

        return value.values;
      },
    },
  };
};

/**
 * The templated fixtures redactStructure is held to redactItem over: the printed variables' item
 * with its template processing and without, the visibility item, the answering inlines, and the
 * items of parameters and of container parameters.
 */
const STRUCTURE_SUBJECTS = [
  "templated",
  "untemplated",
  "visibility",
  "answers",
  "parameters",
  "containers",
] as const;

/**
 * A fixture of {@link STRUCTURE_SUBJECTS}.
 */
type StructureSubject = (typeof STRUCTURE_SUBJECTS)[number];

/**
 * A case of the structure box: a fixture and the record its page is shown under, none for none.
 */
interface StructureCase {
  readonly record: Option.Option<RedactRecord>;
  readonly subject: StructureSubject;
}

/**
 * Draw the records a fixture is shown under: none; for the printed variables', their drawn
 * values; for the visibility item, every record of {@link visibleRecord}; for the answering
 * inlines, one holding no `T` and one holding each of `A` and `B`; and for each parameters' item,
 * one holding none of its values and one holding them all.
 *
 * @param subject The fixture.
 * @returns The records' generator.
 */
const structureRecords = (subject: StructureSubject): Gen<Option.Option<RedactRecord>> => {
  switch (subject) {
    case "templated": {
      return oneOf([constant(Option.none()), constant(Option.some(drawn))]);
    }
    case "untemplated": {
      return constant(Option.none());
    }
    case "visibility": {
      return visibleRecord;
    }
    case "answers": {
      return oneOf([
        constant(Option.none()),
        constant(Option.some(holding({}))),
        map(element(["A", "B"]), (chosen) => Option.some(holding({ T: identifierValue(chosen) }))),
      ]);
    }
    case "parameters": {
      return oneOf([
        constant(Option.none()),
        constant(Option.some(holding({}))),
        constant(Option.some(parameterValues)),
      ]);
    }
    case "containers": {
      return oneOf([
        constant(Option.none()),
        constant(Option.some(holding({}))),
        constant(Option.some(containerParameterValues)),
      ]);
    }
  }
};

/**
 * Draw a case of the structure box: each fixture under each of its records.
 */
const structureCase: Gen<StructureCase> = (source) => {
  const subject = source.draw(element(STRUCTURE_SUBJECTS));

  return { record: source.draw(structureRecords(subject)), subject };
};

/**
 * How many cases {@link structureCase} draws: 2 for the printed variables', 1 without template
 * processing, every record of {@link visibleRecord}, 4 for the answering inlines, and 3 for each
 * parameters' item.
 */
const STRUCTURE_CASES = 2 + 1 + VISIBLE_RECORDS + 4 + 3 + 3;

describe("redactStructure", () => {
  it.effect(
    `decides what redactItem decides over the templated fixtures: the same interactions and choices, responses and hidden-only responses, under each fixture's records: ${String(STRUCTURE_CASES)} pages`,
    (ctx) => {
      const subjects: Readonly<Record<StructureSubject, Item>> = {
        answers: acceptedFrom(inlineAnswers),
        containers: acceptedFrom(containerParameterDocument),
        parameters: acceptedFrom(parameterDocument),
        templated,
        untemplated,
        visibility,
      };

      return Effect.andThen(
        boxHolds(structureCase, STRUCTURE_CASES),
        searched(
          ctx,
          exhaust(
            {
              box: "the printed variables' item under its drawn values and none, and without template processing; the visibility item under every record of the VISIBLE box; the answering inlines under none, no T, A and B; each parameters' item under none, none of its values and all of them",
              caseHang,
              coverage: requiredInSpace<StructureSubject>(STRUCTURE_SUBJECTS),
              generator: structureCase,
              literal: Formatter.format,
              oracle: {
                kind: "second-implementation",
                name: "redactItem, the full redaction, and hiddenOnlyResponses: the structure decides the same parts, responses and hidden-only responses",
              },
              suite: "plate/payload/structure",
            },
            ({ record, subject }, c) =>
              Effect.sync(() => {
                c.note(subject);

                const subjectItem = subjects[subject];
                const showing = underRecord(Option.getOrUndefined(record));
                const full = redactItem(subjectItem, shownToCandidate, showing);
                const structure = redactStructure(subjectItem, showing);

                assert.deepStrictEqual(shownParts(structure.body), shownParts(full.body));
                assert.deepStrictEqual(structure.responses, full.responses);
                assert.deepStrictEqual(
                  [...structure.hiddenOnly],
                  [...hiddenOnlyResponses(subjectItem, showing)],
                );
              }),
          ),
        ),
      );
    },
  );

  it("holds no printed text: a printed variable the record covers leaves nothing in its place, one it does not cover keeps its notice, and a param-variable parameter keeps its value as written", () => {
    const [paragraph] = redactStructure(templated, underRecord(drawn)).body;
    const [uncovered] = redactStructure(templated, feedbackHidden).body;
    const parameters = acceptedFrom(parameterDocument);

    assert.deepStrictEqual(
      paragraph?.kind === "element" ? paragraph.children : assert.fail("No paragraph."),
      texts("N ", ", score ", ", member ", ", hex ", ", raw "),
    );
    assert.deepStrictEqual(
      uncovered?.kind === "element" ? uncovered.children : assert.fail("No paragraph."),
      paragraphOf(redactItem(templated, shownToCandidate, feedbackHidden)),
    );
    assert.deepStrictEqual(
      parametersOf(objectChildren(redactStructure(parameters, underRecord(parameterValues)).body)),
      writtenParameters,
    );
  });

  it("formats no printed variable or parameter, and neither does hiddenOnlyResponses, where redactItem formats each", () => {
    const parameters = acceptedFrom(parameterDocument);
    const list = counted(orderedIntegers([10n, 20n, 30n]));
    const count = counted(integerValue(255n));
    const covering: RedactRecord = {
      ...drawn,
      templates: { ...drawn.templates, LIST: list.value },
    };
    const passing = holding({ ...parameterValues.templates, N: count.value });
    redactStructure(templated, underRecord(covering));
    redactStructure(parameters, underRecord(passing));
    hiddenOnlyResponses(templated, underRecord(covering));
    hiddenOnlyResponses(parameters, underRecord(passing));

    assert.deepStrictEqual([list.reads(), count.reads()], [0, 0]);

    redactItem(templated, shownToCandidate, underRecord(covering));
    redactItem(parameters, shownToCandidate, underRecord(passing));

    assert.isAbove(list.reads(), 0);
    assert.isAbove(count.reads(), 0);
  });
});

describe("redactItem records the first text past its bound on content the page sees", () => {
  it("records only the first printed variable past the bound, in the order the walk meets them: the Choice's Prompt before its choices", () => {
    const huge = one({ baseType: "string", value: "y".repeat(1_000_001) });
    const emptied = redactItem(
      printing,
      shownToCandidate,
      underRecord(holding({ ROUND: huge, SCORE: floatValue(1.5), TOTAL: huge })),
    );

    assert.deepStrictEqual(
      emptied.unprinted,
      Option.some({
        bound: 1_000_000,
        identifier: "ROUND",
        limit: "text",
        path: printedPaths[1],
      }),
    );
    assert.deepStrictEqual(paragraphOf(emptied), texts("Score: ", "1.5"));
  });

  it("records a param-variable parameter whose value text passes 1,000,000 characters by its template variable, with its value left empty", () => {
    const containers = acceptedFrom(containerParameterDocument);
    const [, setParameter] = objectChildren(containers.body);
    const emptied = redactItem(
      containers,
      shownToCandidate,
      underRecord(
        holding({ ...containerParameterValues.templates, SET: multipleOf("y".repeat(1_000_001)) }),
      ),
    );

    assert.deepStrictEqual(parametersOf(objectChildren(emptied.body)), [
      ["list", "1;2;3"],
      ["set", ""],
      ["none", ""],
    ]);
    assert.deepStrictEqual(
      emptied.unprinted,
      Option.some({
        bound: 1_000_000,
        identifier: "SET",
        limit: "text",
        path:
          setParameter?.kind === "element"
            ? setParameter.path
            : assert.fail("The object holds no second parameter."),
      }),
    );
    assert.isTrue(
      Option.isNone(
        redactItem(containers, shownToCandidate, underRecord(containerParameterValues)).unprinted,
      ),
      "within the bound",
    );
  });

  it("formats nothing and records nothing on content the page does not see: a printed variable past the bound in a template block the record hides", () => {
    const lengthy = counted(one({ baseType: "string", value: "y".repeat(1_000_001) }));
    const hidden: Item = {
      ...visibility,
      body: [
        templatePart(
          "template-block",
          byVisible("show"),
          [printed("S", `${blockPath}/qti-printed-variable`)],
          [],
        ),
      ],
    };
    const redaction = redactItem(
      hidden,
      shownToCandidate,
      underRecord(holding({ S: lengthy.value, VISIBLE: identifierValue("OTHER") })),
    );

    assert.deepStrictEqual(redaction.body, []);
    assert.deepStrictEqual(redaction.unprinted, Option.none());
    assert.strictEqual(lengthy.reads(), 0);
    assert.deepStrictEqual(
      redactItem(
        hidden,
        shownToCandidate,
        underRecord(holding({ S: lengthy.value, VISIBLE: identifierValue("X") })),
      ).unprinted,
      Option.some({
        bound: 1_000_000,
        identifier: "S",
        limit: "text",
        path: `${blockPath}/qti-printed-variable`,
      }),
      "shown",
    );
  });
});

/**
 * The text each slot of {@link slotted} prints from the value its tests give `S`: 100 characters.
 */
const slotText = "y".repeat(100);

/**
 * Give the path of a slot of {@link slotted}.
 *
 * @param n The slot's position, from 1.
 * @returns Its path.
 */
const slotPath = (n: number): string => `${bodyPath}/p/qti-printed-variable[${String(n)}]`;

/**
 * Construct a paragraph of printed variables that each print `S` in its default form.
 *
 * @param count How many printed variables it holds.
 * @returns The paragraph, its printed variables at {@link slotPath}.
 */
const slots = (count: number): BodyNode => ({
  attributes: [],
  children: Array.from({ length: count }, (_, index) => printed("S", slotPath(index + 1))),
  kind: "element",
  path: `${bodyPath}/p`,
  tag: "p",
});

/**
 * Construct an item whose body is one paragraph that prints `S` in a number of slots, as the
 * re-audit's item of 4,500 slots does.
 *
 * @param count How many slots it holds.
 * @returns The item.
 */
const slotted = (count: number): Item => ({ ...templated, body: [slots(count)] });

describe("redactItem under an output budget", () => {
  it("stops formatting once the printed text passes the budget: 4,500 slots of 100 characters under { outputBudget: 10_000 } format at most 101, print the first 100, and record S with the bound 10,000", () => {
    const value = counted(one({ baseType: "string", value: slotText }));
    const redaction = redactItem(
      slotted(4500),
      { ...shownToCandidate, configuration: { outputBudget: 10_000 } },
      underRecord(holding({ S: value.value })),
    );

    assert.isAtMost(value.reads(), 101);
    assert.deepStrictEqual(
      paragraphOf(redaction),
      Array.from({ length: 100 }, () => text(slotText)),
    );
    assert.deepStrictEqual(
      redaction.unprinted,
      Option.some({ bound: 10_000, identifier: "S", limit: "budget", path: slotPath(101) }),
    );
  });

  it("prints every slot and records nothing under a budget of exactly the item's whole printed text, and records the last slot one character under it", () => {
    const whole = 4500 * slotText.length;
    const value = one({ baseType: "string", value: slotText });
    const exact = redactItem(
      slotted(4500),
      { ...shownToCandidate, configuration: { outputBudget: whole } },
      underRecord(holding({ S: value })),
    );
    const under = redactItem(
      slotted(4500),
      { ...shownToCandidate, configuration: { outputBudget: whole - 1 } },
      underRecord(holding({ S: value })),
    );

    assert.strictEqual(paragraphOf(exact).length, 4500);
    assert.deepStrictEqual(exact.unprinted, Option.none());
    assert.strictEqual(paragraphOf(under).length, 4499);
    assert.deepStrictEqual(
      under.unprinted,
      Option.some({ bound: whole - 1, identifier: "S", limit: "budget", path: slotPath(4500) }),
    );
  });

  it("formats nothing, spends nothing and records nothing in a template block the record hides: its 4,500 slots are never read, and the 50 slots after it all print under { outputBudget: 10_000 }", () => {
    const value = counted(one({ baseType: "string", value: slotText }));
    const hidden: Item = {
      ...visibility,
      body: [templatePart("template-block", byVisible("show"), [slots(4500)], []), slots(50)],
    };
    const redaction = redactItem(
      hidden,
      { ...shownToCandidate, configuration: { outputBudget: 10_000 } },
      underRecord(holding({ S: value.value, VISIBLE: identifierValue("OTHER") })),
    );

    assert.strictEqual(value.reads(), 50);
    assert.deepStrictEqual(
      paragraphOf(redaction),
      Array.from({ length: 50 }, () => text(slotText)),
    );
    assert.deepStrictEqual(redaction.unprinted, Option.none());
  });

  it("runs under the default budget, 16,777,216, when given none: 17 slots of 1,000,000 characters print 16 and record the 17th with that bound", () => {
    const value = counted(one({ baseType: "string", value: "y".repeat(1_000_000) }));
    const redaction = redactItem(
      slotted(17),
      shownToCandidate,
      underRecord(holding({ S: value.value })),
    );

    assert.strictEqual(value.reads(), 17);
    assert.strictEqual(paragraphOf(redaction).length, 16);
    assert.deepStrictEqual(
      redaction.unprinted,
      Option.some({ bound: 16_777_216, identifier: "S", limit: "budget", path: slotPath(17) }),
    );
  });

  it("spends the budget on a param-variable parameter's value too, recording the first to pass it by its template variable and passing the empty value from there on", () => {
    const containers = acceptedFrom(containerParameterDocument);
    const [, setParameter] = objectChildren(containers.body);
    const spent = redactItem(
      containers,
      { ...shownToCandidate, configuration: { outputBudget: 7 } },
      underRecord(containerParameterValues),
    );
    const fits = redactItem(
      containers,
      { ...shownToCandidate, configuration: { outputBudget: 8 } },
      underRecord(containerParameterValues),
    );

    assert.deepStrictEqual(parametersOf(objectChildren(spent.body)), [
      ["list", "1;2;3"],
      ["set", ""],
      ["none", ""],
    ]);
    assert.deepStrictEqual(
      spent.unprinted,
      Option.some({
        bound: 7,
        identifier: "SET",
        limit: "budget",
        path:
          setParameter?.kind === "element"
            ? setParameter.path
            : assert.fail("The object holds no second parameter."),
      }),
    );
    assert.deepStrictEqual(parametersOf(objectChildren(fits.body)), [
      ["list", "1;2;3"],
      ["set", "A;B"],
      ["none", ""],
    ]);
    assert.deepStrictEqual(fits.unprinted, Option.none());
  });
});

describe("redactItem names which limit a text passed", () => {
  it("records which limit, the budget, when a budget of exactly 1,000,000 runs out across several variables: three slots of 300,000 characters print and the fourth is recorded with the bound 1,000,000 and the limit budget", () => {
    const redaction = redactItem(
      slotted(4),
      { ...shownToCandidate, configuration: { outputBudget: 1_000_000 } },
      underRecord(holding({ S: one({ baseType: "string", value: "y".repeat(300_000) }) })),
    );

    assert.strictEqual(paragraphOf(redaction).length, 3);
    assert.deepStrictEqual(
      redaction.unprinted,
      Option.some({ bound: 1_000_000, identifier: "S", limit: "budget", path: slotPath(4) }),
    );
  });

  it("records which limit, the text, under the default budget for a conversion wider than 1,000,000 characters", () => {
    const widened: Item = {
      ...templated,
      body: [
        {
          attributes: [],
          children: [{ ...printed("N", slotPath(1)), format: Option.some("%1000001i") }],
          kind: "element",
          path: `${bodyPath}/p`,
          tag: "p",
        },
      ],
    };

    assert.deepStrictEqual(
      redactItem(widened, shownToCandidate, underRecord(holding({ N: integerValue(5n) })))
        .unprinted,
      Option.some({ bound: 1_000_000, identifier: "N", limit: "text", path: slotPath(1) }),
    );
  });

  it("records which limit, the text, under the default budget for a whole text longer than 1,000,000 characters", () => {
    const redaction = redactItem(
      slotted(1),
      shownToCandidate,
      underRecord(holding({ S: one({ baseType: "string", value: "y".repeat(1_000_001) }) })),
    );

    assert.deepStrictEqual(paragraphOf(redaction), []);
    assert.deepStrictEqual(
      redaction.unprinted,
      Option.some({ bound: 1_000_000, identifier: "S", limit: "text", path: slotPath(1) }),
    );
  });
});

/**
 * An item whose paragraph holds a Text Entry bound to the record response `NUMBER` and whose body
 * then holds an Extended Text bound to the record response `WORKING`, with a `max-strings` and a
 * `min-strings` a record binding does not count.
 */
const recordBound: SourceDocument = doc(
  "items/record-bound.xml",
  el(
    "qti-assessment-item",
    [attr("identifier", "record-bound"), attr("time-dependent", "false"), attr("title", "Number")],
    [
      el(
        "qti-response-declaration",
        [attr("cardinality", "record"), attr("identifier", "NUMBER")],
        [],
      ),
      el(
        "qti-response-declaration",
        [attr("cardinality", "record"), attr("identifier", "WORKING")],
        [],
      ),
      el(
        "qti-item-body",
        [],
        [
          el(
            "p",
            [],
            [
              sourceText("Your number: "),
              el("qti-text-entry-interaction", [attr("response-identifier", "NUMBER")], []),
            ],
          ),
          el(
            "qti-extended-text-interaction",
            [
              attr("max-strings", "4"),
              attr("min-strings", "1"),
              attr("response-identifier", "WORKING"),
            ],
            [],
          ),
        ],
      ),
    ],
  ),
);

describe("a record-bound control", () => {
  it("gives a record-bound control the string control's payload with no notice, its response's record declaration, and starts each at the NULL record", () => {
    const recordItem = acceptedFrom(recordBound);
    const shown = redactItem(recordItem, shownToCandidate, feedbackHidden);
    const built = pageFor(shown, answering);
    const entry = textEntryFor(built, "NUMBER");
    const working = extendedTextFor(built, "WORKING");

    assert.deepStrictEqual(
      [entry.baseType, entry.declared, entry.restore],
      ["string", { cardinality: "record", identifier: "NUMBER" }, ""],
    );
    assert.deepStrictEqual(
      [working.baseType, working.cardinality, working.declared, working.n, working.notice],
      ["string", "record", { cardinality: "record", identifier: "WORKING" }, 1, Option.none()],
    );
    assert.deepStrictEqual(startingResponses(acceptForTest(recordItem), feedbackHidden), {
      NUMBER: nullRecord,
      WORKING: nullRecord,
    });
  });
});

/**
 * An item whose one Slider root carries an author's `data-shade`, which plate does not reserve, and
 * `data-slot`, plate's own marker, which it does (`reservedDataNames` in `#plate/vocabulary.ts`).
 */
const authorDataItem = doc(
  "item.xml",
  el(
    "qti-assessment-item",
    [attr("identifier", "author-data"), attr("time-dependent", "false"), attr("title", "Data")],
    [
      el(
        "qti-response-declaration",
        [
          attr("base-type", "integer"),
          attr("cardinality", "single"),
          attr("identifier", "RESPONSE"),
        ],
        [],
      ),
      el(
        "qti-item-body",
        [],
        [
          el(
            "qti-slider-interaction",
            [
              attr("data-shade", "warm"),
              attr("data-slot", "author"),
              attr("lower-bound", "0"),
              attr("response-identifier", "RESPONSE"),
              attr("upper-bound", "10"),
            ],
            [],
          ),
        ],
      ),
    ],
  ),
);

describe("an author's data-* on a module interaction's root (decision D24)", () => {
  it("reaches the interaction's paired model node in document order, and a name plate reserves does not", () => {
    const accepted = Option.getOrThrow(acceptedItem(admittedSource(authorDataItem)));
    const [slider] = redactedInteractionsIn(
      redactItem(accepted.item, shownToCandidate, feedbackHidden).body,
    );
    const node =
      slider === undefined
        ? assert.fail("The body holds no Slider.")
        : interactionPayload(slider, answering);

    assert.deepStrictEqual(
      node.kind === "slider" ? node.model.data : assert.fail("The interaction is no Slider."),
      [{ name: "data-shade", value: "warm" }],
    );
    assert.isTrue(
      accepted.item.unsupported.some(({ feature }) => feature === "attribute:data-slot"),
      "securing marks the reserved name it removes",
    );
  });
});
