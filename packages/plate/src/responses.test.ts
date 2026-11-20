import { assert, describe, it } from "@effect/vitest";
import { Effect, Option, Result } from "effect";
import { configure } from "#plate/configuration.ts";
import { Malformed } from "#plate/form/encoding.ts";
import type { ChoiceInteraction } from "#plate/interactions/choice.ts";
import type { ValidationMessage } from "#plate/interactions/contract.ts";
import type { ExtendedTextInteraction } from "#plate/interactions/extended-text.ts";
import type { InlineChoiceInteraction } from "#plate/interactions/inline-choice.ts";
import type { TextEntryInteraction } from "#plate/interactions/text-entry.ts";
import { message } from "#plate/messages.ts";
import { redactedInteractionsIn } from "#plate/model/interactions.ts";
import type {
  BodyNode,
  Item,
  RedactedNode,
  SimpleChoice,
  TemplateContent,
  TemplateVisibility,
} from "#plate/model/item.ts";
import type { RedactRecord } from "#plate/model/record.ts";
import type { RecordValue, Value } from "#plate/model/values.ts";
import { interactionPayload } from "#plate/payload.ts";
import type { View } from "#plate/payload.ts";
import { postings } from "#plate/postings.ts";
import { redactItem } from "#plate/redact/walk.ts";
import { checkResponses } from "#plate/responses.ts";
import { shownToCandidate } from "#plate/test/page.ts";
import { score } from "#plate/test/score.ts";
import { admitted } from "#plate/test/admitted.ts";
import { acceptForTest, acceptedItem } from "#plate/validate/verdict.ts";

/**
 * Write an item document whose template processing sets the ordered template variable `S` to a
 * number of copies of one value through a `qti-repeat`, whose paragraph prints `S`, and which holds
 * a single Choice bound to `RESPONSE` over `A` and `B`.
 *
 * @param baseType `S`'s base type.
 * @param lexical The value repeated, as written.
 * @param count How many times `qti-repeat` repeats it.
 * @param printing The printed variable's attributes besides its `identifier`, as written.
 * @returns The document's text.
 */
const repeatedItem = (baseType: string, lexical: string, count: number, printing: string): string =>
  `<qti-assessment-item xmlns="http://www.imsglobal.org/xsd/imsqtiasi_v3p0" identifier="repeated" title="Repeated" time-dependent="false"><qti-response-declaration identifier="RESPONSE" cardinality="single" base-type="identifier"/><qti-template-declaration identifier="S" cardinality="ordered" base-type="${baseType}"/><qti-template-processing><qti-set-template-value identifier="S"><qti-repeat number-repeats="${String(count)}"><qti-base-value base-type="${baseType}">${lexical}</qti-base-value></qti-repeat></qti-set-template-value></qti-template-processing><qti-item-body><p>Value: <qti-printed-variable identifier="S"${printing}/></p><qti-choice-interaction response-identifier="RESPONSE" max-choices="1"><qti-simple-choice identifier="A">One</qti-simple-choice><qti-simple-choice identifier="B">Two</qti-simple-choice></qti-choice-interaction></qti-item-body></qti-assessment-item>`;

/**
 * Construct an ordered container that holds one value of a base type a number of times.
 *
 * @param member The value.
 * @param count How many times the container holds it.
 * @returns The value.
 */
const repeated = (member: Value["values"][number], count: number): Value => ({
  baseType: member.baseType,
  cardinality: "ordered",
  values: Array.from({ length: count }, () => member),
});

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

describe("checkResponses and the printed variables of the item it judges", () => {
  it.effect(
    "formats no printed variable: it learns which interactions and choices the page shows from the walk that prints no text",
    () =>
      Effect.gen(function* judgesWithoutPrinting() {
        const document = repeatedItem("string", "y", 3, "");
        const verdict = yield* admitted("items/repeated.xml", new TextEncoder().encode(document));
        const accepted = Option.getOrElse(acceptedItem(verdict), () =>
          assert.fail(`The item is ${verdict.verdict}, not accepted.`),
        );
        const configuration = yield* configure({ seed: "", validateResponses: false });
        const printed = counted(repeated({ baseType: "string", value: "y" }, 3));

        assert.deepStrictEqual(
          checkResponses(accepted, {}, configuration, {
            attempt: "none",
            defaults: {},
            outcomes: {},
            templates: { S: printed.value },
          }),
          [],
        );
        assert.strictEqual(printed.reads(), 0);
      }),
  );
});

/**
 * A Text Entry bound to the record response `ANSWER`, the string control, with
 * `pattern-mask="[0-9]+"` and `expected-length="2"`.
 */
const answerEntry: TextEntryInteraction = {
  ariaLabel: Option.none(),
  ariaLabelledby: Option.none(),
  base: 10,
  baseType: "string",
  cardinality: "record",
  class: Option.none(),
  data: [],
  expectedLength: Option.some(2n),
  kind: "text-entry",
  path: "qti-assessment-item/qti-item-body/qti-text-entry-interaction",
  patternMask: Option.some("[0-9]+"),
  patternMaskMessage: Option.none(),
  placeholder: Option.none(),
  promptCatalog: Option.none(),
  response: "ANSWER",
};

/**
 * An item built by hand: {@link answerEntry} alone.
 */
const answerItem: Item = {
  adaptive: false,
  body: [answerEntry],
  content: {
    "qti-assessment-stimulus-ref": [],
    "qti-catalog-info": [],
    "qti-companion-materials-info": [],
  },
  contexts: new Map(),
  document: "items/answer.xml",
  identifier: "answer",
  lang: Option.none(),
  modalFeedback: [],
  outcomes: new Map(),
  processing: Option.none(),
  records: new Map([
    ["ANSWER", { correct: Option.none(), defaultValue: Option.none(), identifier: "ANSWER" }],
  ]),
  responses: new Map(),
  templateProcessing: { kind: "absent" },
  templates: new Map(),
  title: "Answer",
  unheld: new Map(),
  unsupported: [],
};

/**
 * Construct the record a candidate's text gives, holding only its `stringValue`, as a host may
 * build it; the NULL record for empty text.
 *
 * @param text The text as typed.
 * @returns The record.
 */
const typed = (text: string): RecordValue => ({
  cardinality: "record",
  fields:
    text === "" ? [] : [{ identifier: "stringValue", value: { baseType: "string", value: text } }],
});

/**
 * Give the message a mismatch on a response's `pattern-mask` earns, with no author's message.
 *
 * @param response The response identifier.
 * @returns The validation message.
 */
const mismatch = (response: string) => ({ response, text: message("en", "patternMismatch") });

describe("checkResponses and a record", () => {
  it.effect(
    "record binding in the page: checkResponses takes a record for a record-bound Text Entry and gives no message for it",
    () =>
      Effect.gen(function* takesRecord() {
        const configuration = yield* configure({ seed: "", validateResponses: true });
        const answer: RecordValue = {
          cardinality: "record",
          fields: [{ identifier: "stringValue", value: { baseType: "string", value: "12" } }],
        };

        assert.deepStrictEqual(
          checkResponses(acceptForTest(answerItem), { ANSWER: answer }, configuration),
          [],
        );
      }),
  );

  it.effect(
    "restores the record's text to its checks: under validate-responses pattern-mask [0-9]+ judges a record's stringValue as typed, accepting 12 and refusing 12.0, and expected-length gives no message",
    () =>
      Effect.gen(function* judgesTypedText() {
        const strict = yield* configure({ seed: "", validateResponses: true });
        const working: ExtendedTextInteraction = {
          ...answerEntry,
          expectedLength: Option.none(),
          expectedLines: Option.none(),
          format: "plain",
          kind: "extended-text",
          maxStrings: Option.none(),
          minStrings: 0n,
          path: "qti-assessment-item/qti-item-body/qti-extended-text-interaction",
          prompt: Option.none(),
          response: "WORKING",
        };
        const both = acceptForTest({
          ...answerItem,
          body: [answerEntry, working],
          records: new Map([
            ...answerItem.records,
            [
              "WORKING",
              { correct: Option.none(), defaultValue: Option.none(), identifier: "WORKING" },
            ],
          ]),
        });

        assert.deepStrictEqual(checkResponses(both, { ANSWER: typed("12") }, strict), []);
        assert.deepStrictEqual(
          checkResponses(both, { ANSWER: typed("12345"), WORKING: typed("12345") }, strict),
          [],
        );
        assert.deepStrictEqual(
          checkResponses(both, { ANSWER: typed("12.0"), WORKING: typed("1 2") }, strict),
          [mismatch("ANSWER"), mismatch("WORKING")],
        );
        assert.deepStrictEqual(checkResponses(both, { ANSWER: typed(" 12") }, strict), [
          mismatch("ANSWER"),
        ]);
        assert.deepStrictEqual(
          checkResponses(
            both,
            { ANSWER: typed("12.0"), WORKING: typed("1 2") },
            yield* configure({ seed: "", validateResponses: false }),
          ),
          [],
        );
      }),
  );

  it.effect(
    "restores the record's text to its checks: the NULL record and a record without a stringValue are not judged against the pattern-mask",
    () =>
      Effect.gen(function* untypedRecords() {
        const strict = yield* configure({ seed: "", validateResponses: true });
        const numbered: RecordValue = {
          cardinality: "record",
          fields: [{ identifier: "floatValue", value: { baseType: "float", value: 12.5 } }],
        };

        for (const answer of [typed(""), numbered]) {
          assert.deepStrictEqual(
            checkResponses(acceptForTest(answerItem), { ANSWER: answer }, strict),
            [],
          );
        }
      }),
  );
});

/**
 * The identifier of the response each templated item below binds.
 */
const templatedResponse = "RESPONSE";

/**
 * The item instance the templated items below are redacted for.
 */
const templatedInstance = "0b6c1f3e-2a4d-4c8e-9f17-5d2e8a3b6c40";

/**
 * Construct a value of identifiers of a cardinality.
 *
 * @param cardinality The value's cardinality.
 * @param identifiers The identifiers it holds, in order.
 * @returns The value.
 */
const identifiersOf = (
  cardinality: "multiple" | "single",
  ...identifiers: readonly string[]
): Value => ({
  baseType: "identifier",
  cardinality,
  values: identifiers.map((value) => ({ baseType: "identifier", value })),
});

/**
 * Construct a template visibility by the template variable `VISIBLE`.
 *
 * @param showHide Its `show-hide`.
 * @returns The visibility.
 */
const byVisible = (showHide: TemplateVisibility["showHide"]): TemplateVisibility => ({
  showHide,
  templateIdentifier: "VISIBLE",
});

/**
 * Construct the record part `checkResponses` and `redactItem` read, with `VISIBLE` holding one
 * identifier.
 *
 * @param identifier What `VISIBLE` holds.
 * @returns The record part.
 */
const visibleAs = (identifier: string): RedactRecord => ({
  attempt: "none",
  defaults: {},
  outcomes: {},
  templates: { VISIBLE: identifiersOf("single", identifier) },
});

/**
 * Construct the choices `A`, `B` and `C`, templated or not. Templated, `A` has no template
 * visibility, `B` is shown by `VISIBLE` (`show`) and `C` hidden by it (`hide`, so shown unless
 * `VISIBLE` holds `C`); otherwise none has one.
 *
 * @param templated Whether `B` and `C` carry their visibilities.
 * @returns The choices, in document order.
 */
const choicesOf = (templated: boolean): readonly SimpleChoice[] =>
  ["A", "B", "C"].map((identifier) => ({
    catalog: Option.none(),
    content: [{ kind: "text", text: identifier }],
    fixed: false,
    identifier,
    templateVisibility:
      !templated || identifier === "A"
        ? Option.none()
        : Option.some(byVisible(identifier === "B" ? "show" : "hide")),
  }));

/**
 * What the table below needs of one kind whose choices a template shows or hides: Choice, whose
 * content may stand in a template block, and Inline Choice, in a template inline.
 */
interface TemplatedKind {
  /**
   * The kind's own content node, a template block or a template inline, around its interaction.
   */
  readonly container: "template-block" | "template-inline";
  /**
   * Construct the interaction over choices `A`, `B` and `C` ({@link choicesOf}), which needs one
   * choice picked under `validateResponses` and takes at most two.
   */
  readonly interaction: (
    path: string,
    choices: readonly SimpleChoice[],
  ) => ChoiceInteraction | InlineChoiceInteraction;
  /**
   * The response's cardinality.
   */
  readonly cardinality: "multiple" | "single";
  /**
   * The interaction's local name, which ends its path.
   */
  readonly local: "qti-choice-interaction" | "qti-inline-choice-interaction";
  /**
   * Wrap body content as the kind stands in a body: a Choice as it is, an Inline Choice in a
   * paragraph.
   */
  readonly placed: (nodes: readonly BodyNode[]) => readonly BodyNode[];
  /**
   * A response a shown interaction refuses in tier (a), and the message it gives.
   */
  readonly refused: readonly [Value, ValidationMessage];
}

/**
 * Choice and Inline Choice, each as the table reads it.
 */
const templatedKinds: readonly (readonly [string, TemplatedKind])[] = [
  [
    "Choice",
    {
      cardinality: "multiple",
      container: "template-block",
      interaction: (path, choices) => ({
        ariaLabel: Option.none(),
        ariaLabelledby: Option.none(),
        cardinality: "multiple",
        choices,
        class: Option.none(),
        data: [],
        kind: "choice",
        maxChoices: 2n,
        messages: { max: Option.none(), min: Option.none() },
        minChoices: 1n,
        orientation: "vertical",
        path,
        prompt: Option.none(),
        promptCatalog: Option.none(),
        response: templatedResponse,
        shuffle: false,
      }),
      local: "qti-choice-interaction",
      placed: (nodes) => nodes,
      refused: [
        identifiersOf("multiple", "A", "B", "C"),
        { response: templatedResponse, text: message("en", "atMost", { n: "2" }) },
      ],
    },
  ],
  [
    "Inline Choice",
    {
      cardinality: "single",
      container: "template-inline",
      interaction: (path, choices) => ({
        ariaLabel: Option.none(),
        ariaLabelledby: Option.none(),
        choices,
        class: Option.none(),
        data: [],
        kind: "inline-choice",
        label: Option.none(),
        messages: { min: Option.none() },
        minChoices: 0n,
        path,
        placeholder: Option.none(),
        promptCatalog: Option.none(),
        required: true,
        response: templatedResponse,
        shuffle: false,
      }),
      local: "qti-inline-choice-interaction",
      placed: (nodes) => [
        {
          attributes: [],
          children: nodes,
          kind: "element",
          path: "qti-assessment-item/qti-item-body/p",
          tag: "p",
        },
      ],
      refused: [
        identifiersOf("single", "Z"),
        { response: templatedResponse, text: message("en", "unknownChoice") },
      ],
    },
  ],
];

/**
 * The path of a body child of a kind's own interaction, or of its container.
 *
 * @param kind The kind.
 * @param local The child's local name.
 * @returns The path.
 */
const pathIn = (kind: TemplatedKind, local: string): string =>
  kind.container === "template-block"
    ? `qti-assessment-item/qti-item-body/${local}`
    : `qti-assessment-item/qti-item-body/p/${local}`;

/**
 * Construct an item that declares `VISIBLE`, a single identifier with no default, around body
 * content, binding {@link templatedResponse} at the kind's cardinality.
 *
 * @param kind The kind.
 * @param nodes The body content, before the kind places it.
 * @param runs Whether its template processing runs (an empty `qti-template-processing`).
 * @returns The item.
 */
const templatedItem = (kind: TemplatedKind, nodes: readonly BodyNode[], runs: boolean): Item => ({
  adaptive: false,
  body: kind.placed(nodes),
  content: {
    "qti-assessment-stimulus-ref": [],
    "qti-catalog-info": [],
    "qti-companion-materials-info": [],
  },
  contexts: new Map(),
  document: "items/templated.xml",
  identifier: "templated",
  lang: Option.none(),
  modalFeedback: [],
  outcomes: new Map(),
  processing: Option.none(),
  records: new Map(),
  responses: new Map([
    [
      templatedResponse,
      {
        areaMapping: Option.none(),
        baseType: "identifier",
        cardinality: kind.cardinality,
        correct: Option.none(),
        defaultValue: Option.none(),
        identifier: templatedResponse,
        mapping: Option.none(),
      },
    ],
  ]),
  templateProcessing: runs ? { kind: "runs", rules: [] } : { kind: "absent" },
  templates: new Map([
    [
      "VISIBLE",
      {
        baseType: "identifier",
        cardinality: "single",
        defaultValue: Option.none(),
        identifier: "VISIBLE",
        mathVariable: false,
        paramVariable: false,
      },
    ],
  ]),
  title: "Templated",
  unheld: new Map(),
  unsupported: [],
});

/**
 * The view of a first render: no values.
 */
const firstRender: View = { host: {}, instance: templatedInstance, seed: "", values: new Map() };

/**
 * Give the identifiers of the choices the first Choice or Inline Choice of a redacted body
 * presents on a first render, inside elements too.
 *
 * @param nodes The redacted body.
 * @returns The identifiers, in presented order.
 */
const presentedIn = (nodes: readonly RedactedNode[]): readonly string[] => {
  for (const interaction of redactedInteractionsIn(nodes)) {
    const node = interactionPayload(interaction, firstRender);

    if (node.kind === "choice" || node.kind === "inline-choice") {
      return node.payload.choices.map(({ identifier }) => identifier);
    }
  }

  return assert.fail("The body holds no Choice and no Inline Choice.");
};

/**
 * Score an item's one response, and give the messages `score` refuses it with.
 *
 * @param item The item.
 * @param posted The value of {@link templatedResponse}.
 * @returns The messages of a `ResponsesRefused`, the tag of any other failure, or none.
 */
const refusedBy = (item: Item, posted: Value): readonly unknown[] =>
  Result.match(score(acceptForTest(item), { [templatedResponse]: posted }), {
    onFailure: (failure) =>
      failure._tag === "ResponsesRefused" ? failure.messages : [failure._tag],
    onSuccess: () => [],
  });

describe("checkResponses and template visibility, over Choice and Inline Choice", () => {
  for (const [label, kind] of templatedKinds) {
    const pick = (...identifiers: readonly string[]) =>
      identifiersOf(kind.cardinality, ...identifiers);
    const unknown = { response: templatedResponse, text: message("en", "unknownChoice") };
    const contained = (runs: boolean): Item =>
      templatedItem(
        kind,
        [
          {
            content: [
              kind.interaction(`${pathIn(kind, kind.container)}/${kind.local}`, choicesOf(false)),
            ],
            identifier: "X",
            kind: kind.container,
            path: pathIn(kind, kind.container),
            responses: [templatedResponse],
            templateVisibility: byVisible("show"),
          } satisfies TemplateContent,
        ],
        runs,
      );
    const bare = (runs: boolean): Item =>
      templatedItem(kind, [kind.interaction(pathIn(kind, kind.local), choicesOf(true))], runs);

    it.effect(
      `${label}: a choice its template hides is absent from the payload and from checkResponses, so posting it gives unknownChoice, and a shown one is judged`,
      () =>
        Effect.gen(function* hiddenChoice() {
          const configuration = yield* configure({ seed: "", validateResponses: false });
          const accepted = acceptForTest(bare(true));
          const hiding = visibleAs("C");
          const redacted = redactItem(accepted.item, shownToCandidate, hiding);

          assert.deepStrictEqual(presentedIn(redacted.body), ["A"]);
          assert.deepStrictEqual(
            postings(accepted, templatedInstance, hiding).map(({ identifier }) => identifier),
            [templatedResponse],
          );
          for (const hidden of ["B", "C"]) {
            assert.deepStrictEqual(
              checkResponses(
                accepted,
                { [templatedResponse]: pick(hidden) },
                configuration,
                hiding,
              ),
              [unknown],
              hidden,
            );
          }
          for (const shown of ["A", "B", "C"]) {
            assert.deepStrictEqual(
              checkResponses(
                accepted,
                { [templatedResponse]: pick(shown) },
                configuration,
                visibleAs("B"),
              ),
              [],
              shown,
            );
          }
          // With no record, a choice whose visibility a run of template processing decides is
          // withheld: the page shows it to no one yet.
          for (const withheld of ["B", "C"]) {
            assert.deepStrictEqual(
              checkResponses(accepted, { [templatedResponse]: pick(withheld) }, configuration),
              [unknown],
              withheld,
            );
          }
          assert.deepStrictEqual(
            checkResponses(accepted, { [templatedResponse]: pick("A") }, configuration),
            [],
          );
        }),
    );

    it.effect(
      `${label}: a response bound only to a hidden or withheld ${kind.container}'s interaction is ignored whatever it holds, and judged once the ${kind.container} shows`,
      () =>
        Effect.gen(function* hiddenContainer() {
          const strict = yield* configure({ seed: "", validateResponses: true });
          const accepted = acceptForTest(contained(true));
          const [breaking, refusal] = kind.refused;

          for (const record of [Option.some(visibleAs("W")), Option.none()]) {
            const judged = (responses: Readonly<Record<string, Value>>) =>
              Option.match(record, {
                onNone: () => checkResponses(accepted, responses, strict),
                onSome: (held) => checkResponses(accepted, responses, strict, held),
              });

            assert.deepStrictEqual(judged({ [templatedResponse]: breaking }), []);
            assert.deepStrictEqual(judged({}), []);
          }
          assert.deepStrictEqual(
            checkResponses(accepted, { [templatedResponse]: breaking }, strict, visibleAs("X")),
            [refusal],
          );
          assert.deepStrictEqual(checkResponses(accepted, {}, strict, visibleAs("X")), [
            { response: templatedResponse, text: message("en", "atLeast", { n: "1" }) },
          ]);
        }),
    );

    it(`${label}: score refuses a choice its template hides by default through ResponsesRefused, and no response of a hidden ${kind.container}`, () => {
      // `VISIBLE` declares no default, so with template processing not run it holds NULL: `B`'s
      // `show` hides it, `C`'s `hide` shows it, and the `show` container is hidden.
      assert.deepStrictEqual(refusedBy(bare(false), pick("B")), [unknown]);
      assert.deepStrictEqual(refusedBy(bare(false), pick("A")), []);
      assert.deepStrictEqual(refusedBy(contained(false), kind.refused[0]), []);
    });
  }
});

/**
 * Write the simple choices of a Choice, each its identifier as its content.
 *
 * @param identifiers The choices' identifiers, in document order.
 * @returns The `qti-simple-choice` elements.
 */
const simpleChoices = (...identifiers: readonly string[]): string =>
  identifiers
    .map(
      (identifier) =>
        `<qti-simple-choice identifier="${identifier}">${identifier}</qti-simple-choice>`,
    )
    .join("");

/**
 * An item document of three interactions, in document order: a single Choice `RESPONSE` of `A`,
 * `B` and `C`; a multiple Choice `PICK` of `P`, `Q`, `R` and `S` that takes exactly two
 * (`max-choices` and `min-choices` 2); and an integer Text Entry `NUMBER` in a paragraph. Each
 * choice identifier is the item's own once (reading 104).
 */
const choicesDocument = `<qti-assessment-item xmlns="http://www.imsglobal.org/xsd/imsqtiasi_v3p0" identifier="judged" title="Judged" time-dependent="false"><qti-response-declaration identifier="RESPONSE" cardinality="single" base-type="identifier"/><qti-response-declaration identifier="PICK" cardinality="multiple" base-type="identifier"/><qti-response-declaration identifier="NUMBER" cardinality="single" base-type="integer"/><qti-item-body><qti-choice-interaction response-identifier="RESPONSE" max-choices="1">${simpleChoices("A", "B", "C")}</qti-choice-interaction><qti-choice-interaction response-identifier="PICK" max-choices="2" min-choices="2">${simpleChoices("P", "Q", "R", "S")}</qti-choice-interaction><p>Pick a number: <qti-text-entry-interaction response-identifier="NUMBER"/></p></qti-item-body></qti-assessment-item>`;

/**
 * An item document whose one paragraph holds a required Inline Choice `TONE` of `A`, `B` and `C`.
 */
const toneDocument = `<qti-assessment-item xmlns="http://www.imsglobal.org/xsd/imsqtiasi_v3p0" identifier="tone" title="Tone" time-dependent="false"><qti-response-declaration identifier="TONE" cardinality="single" base-type="identifier"/><qti-item-body><p>The tone is <qti-inline-choice-interaction response-identifier="TONE" required="true"><qti-inline-choice identifier="A">A</qti-inline-choice><qti-inline-choice identifier="B">B</qti-inline-choice><qti-inline-choice identifier="C">C</qti-inline-choice></qti-inline-choice-interaction>.</p></qti-item-body></qti-assessment-item>`;

/**
 * Open an item document, which `check` must accept.
 *
 * @param location The document's location.
 * @param document The document's text.
 * @returns The accepted item.
 */
const accepting = Effect.fnUntraced(function* accepting(location: string, document: string) {
  const verdict = yield* admitted(location, new TextEncoder().encode(document));

  return Option.getOrElse(acceptedItem(verdict), () =>
    assert.fail(`The item is ${verdict.verdict}, not accepted.`),
  );
});

describe("checkResponses over Choice, Text Entry and Inline Choice", () => {
  it.effect(
    "gives tier (a) messages always, in document order, and min-choices only under validateResponses",
    () =>
      Effect.gen(function* tiers() {
        const accepted = yield* accepting("items/judged.xml", choicesDocument);
        const lenient = yield* configure({ seed: "", validateResponses: false });
        const strict = yield* configure({ seed: "", validateResponses: true });
        const tooMany = { PICK: identifiersOf("multiple", "P", "Q", "R") };
        const tooFew = { PICK: identifiersOf("multiple", "P") };
        const atMost = { response: "PICK", text: message("en", "atMost", { n: "2" }) };
        const atLeast = { response: "PICK", text: message("en", "atLeast", { n: "2" }) };

        assert.deepStrictEqual(checkResponses(accepted, tooMany, lenient), [atMost]);
        assert.deepStrictEqual(checkResponses(accepted, tooMany, strict), [atMost]);
        assert.deepStrictEqual(checkResponses(accepted, tooFew, lenient), []);
        assert.deepStrictEqual(checkResponses(accepted, tooFew, strict), [atLeast]);
        assert.deepStrictEqual(checkResponses(accepted, {}, lenient), []);
        assert.deepStrictEqual(checkResponses(accepted, {}, strict), [atLeast]);
        assert.deepStrictEqual(
          checkResponses(accepted, { ...tooMany, RESPONSE: identifiersOf("single", "Z") }, lenient),
          [{ response: "RESPONSE", text: message("en", "unknownChoice") }, atMost],
        );
      }),
  );

  it.effect(
    "gives an Inline Choice one unknownChoice for a stray identifier and none for a presented one",
    () =>
      Effect.gen(function* inlineChoice() {
        const accepted = yield* accepting("items/tone.xml", toneDocument);
        const lenient = yield* configure({ seed: "", validateResponses: false });
        const strict = yield* configure({ seed: "", validateResponses: true });

        assert.deepStrictEqual(
          checkResponses(accepted, { TONE: identifiersOf("single", "Z") }, lenient),
          [{ response: "TONE", text: message("en", "unknownChoice") }],
        );
        assert.deepStrictEqual(
          checkResponses(accepted, { TONE: identifiersOf("single", "B") }, strict),
          [],
        );
        assert.deepStrictEqual(checkResponses(accepted, {}, lenient), []);
        assert.deepStrictEqual(checkResponses(accepted, {}, strict), [
          { response: "TONE", text: message("en", "atLeast", { n: "1" }) },
        ]);
      }),
  );

  it.effect("gives a Malformed its interaction's message", () =>
    Effect.gen(function* malformed() {
      const accepted = yield* accepting("items/judged.xml", choicesDocument);

      assert.deepStrictEqual(
        checkResponses(
          accepted,
          {
            NUMBER: new Malformed({ entry: "q1.NUMBER", reason: "number" }),
            RESPONSE: new Malformed({ entry: "q1.RESPONSE", reason: "single-many" }),
          },
          yield* configure({ seed: "", validateResponses: false }),
        ),
        [
          { response: "RESPONSE", text: message("en", "atMost", { n: "1" }) },
          { response: "NUMBER", text: message("en", "malformedNumber") },
        ],
      );
    }),
  );
});
