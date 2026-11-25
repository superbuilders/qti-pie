import { assert, describe, it } from "@effect/vitest";
import { growthFactor } from "@qti-pie/crust/test/growth.ts";
import { Effect, Option } from "effect";
import { readSource } from "#plate/document/read.ts";
import { xmlNamespace } from "#plate/document/source.ts";
import type { SourceAttribute, SourceDocument, SourceElement } from "#plate/document/source.ts";
import type { ChoiceInteraction } from "#plate/interactions/choice.ts";
import type { ExtendedTextInteraction } from "#plate/interactions/extended-text.ts";
import type { InlineChoiceInteraction } from "#plate/interactions/inline-choice.ts";
import type { TextEntryInteraction } from "#plate/interactions/text-entry.ts";
import type { IntegerOrRef } from "#plate/model/integer-ref.ts";
import { admittedItem } from "#plate/test/admitted.ts";
import type {
  AreaMapping,
  BodyNode,
  Item,
  RecordDeclaration,
  TemplateDeclaration,
  TemplateVisibility,
} from "#plate/model/item.ts";
import type { RecordValue, Value } from "#plate/model/values.ts";
import { float, integer } from "#plate/test/fixtures.ts";
import {
  bindQuadratically,
  dedupeQuadratically,
  templated,
  textEntries,
} from "#plate/test/counted.ts";
import { blockGrowth, blockGrowthLimit } from "#plate/test/growth.ts";
import { attr, attrIn, declaration, doc, el, item, paragraph, text } from "#plate/test/source.ts";

/**
 * The path of the item root, which every path in these tests starts with.
 */
const root = "qti-assessment-item";

/**
 * The path of the item body.
 */
const body = `${root}/qti-item-body`;

/**
 * Construct a container of `qti-value` children, such as `qti-correct-response`.
 *
 * @param local The container's name.
 * @param values Each value's text.
 * @returns The container element.
 */
const values = (local: string, ...texts: readonly string[]): SourceElement =>
  el(
    local,
    [],
    texts.map((value) => el("qti-value", [], [text(value)])),
  );

/**
 * Construct a `qti-area-map-entry`.
 *
 * @param shape The `shape` value.
 * @param coords The `coords` value, as written.
 * @param mappedValue The `mapped-value` value.
 * @returns The entry element.
 */
const areaEntry = (shape: string, coords: string, mappedValue: string): SourceElement =>
  el(
    "qti-area-map-entry",
    [attr("coords", coords), attr("mapped-value", mappedValue), attr("shape", shape)],
    [],
  );

/**
 * Construct a `qti-area-mapping` of the circle `102,113,16`, mapped to 1, and then a rect whose
 * third coordinate is written as given, mapped to 0.5.
 *
 * @param attributes The mapping's attributes.
 * @param rectRight The rect's third coordinate, as written.
 * @returns The mapping element.
 */
const areaMapping = (attributes: readonly SourceAttribute[], rectRight: string): SourceElement =>
  el("qti-area-mapping", attributes, [
    areaEntry("circle", "102,113,16", "1"),
    areaEntry("rect", `0,0,${rectRight},40`, "0.5"),
  ]);

/**
 * Construct a `qti-simple-choice` holding only text.
 *
 * @param identifier The choice's identifier.
 * @param label The choice's text.
 * @returns The choice element.
 */
const choice = (identifier: string, label: string): SourceElement =>
  el("qti-simple-choice", [attr("identifier", identifier)], [text(label)]);

/**
 * Construct a `qti-response-processing` that names a built-in template by its purl URI.
 *
 * @param name The template's file name, with or without `.xml`.
 * @returns The processing element.
 */
const template = (name: string): SourceElement =>
  el(
    "qti-response-processing",
    [attr("template", `https://purl.imsglobal.org/spec/qti/v3p0/rptemplates/${name}`)],
    [],
  );

/**
 * Construct a `qti-set-outcome-value` of `SCORE` to a float base value.
 *
 * @param value The base value's text.
 * @returns The rule element.
 */
const setScore = (value: string): SourceElement =>
  el(
    "qti-set-outcome-value",
    [attr("identifier", "SCORE")],
    [el("qti-base-value", [attr("base-type", "float")], [text(value)])],
  );

/**
 * `match_correct`'s rules as the template's text gives them, written inline.
 *
 * @returns The inline processing element.
 */
const matchCorrectBlock = (): SourceElement =>
  el(
    "qti-response-processing",
    [],
    [
      el(
        "qti-response-condition",
        [],
        [
          el(
            "qti-response-if",
            [],
            [
              el(
                "qti-match",
                [],
                [
                  el("qti-variable", [attr("identifier", "RESPONSE")], []),
                  el("qti-correct", [attr("identifier", "RESPONSE")], []),
                ],
              ),
              setScore("1"),
            ],
          ),
          el("qti-response-else", [], [setScore("0")]),
        ],
      ),
    ],
  );

/**
 * A BG007-shaped item: an identifier `RESPONSE` whose correct response is `true`, a float `SCORE`
 * with default 1, and a two-choice interaction with `max-choices="1"`.
 *
 * @param processing The item's response processing.
 * @returns The document at `items/BG007.xml`.
 */
const bg007 = (processing: SourceElement): SourceDocument =>
  doc(
    "items/BG007.xml",
    el(
      root,
      [
        attr("identifier", "beginnersguide007"),
        attr("time-dependent", "false"),
        attr("title", "BG true false example "),
        attrIn(xmlNamespace, "lang", "en-US"),
      ],
      [
        declaration("qti-response-declaration", "RESPONSE", "identifier", "single", [
          values("qti-correct-response", "true"),
        ]),
        declaration("qti-outcome-declaration", "SCORE", "float", "single", [
          values("qti-default-value", "1"),
        ]),
        el(
          "qti-item-body",
          [],
          [
            el("p", [], [text("This is a True/False question?")]),
            el(
              "qti-choice-interaction",
              [attr("max-choices", "1"), attr("response-identifier", "RESPONSE")],
              [choice("true", "True"), choice("false", "False")],
            ),
          ],
        ),
        processing,
      ],
    ),
  );

/**
 * Construct a `qti-value` that writes one field of a record declaration's value.
 *
 * @param identifier The `field-identifier`, as written.
 * @param baseType The field's `base-type`.
 * @param written The value's text.
 * @returns The value element.
 */
const recordField = (identifier: string, baseType: string, written: string): SourceElement =>
  el(
    "qti-value",
    [attr("base-type", baseType), attr("field-identifier", identifier)],
    [text(written)],
  );

/**
 * An item whose body is one `qti-choice-interaction` bound to a single identifier response.
 *
 * @param attributes The interaction's attributes beside `response-identifier`.
 * @returns The document at `items/test.xml`.
 */
const choiceItem = (attributes: readonly SourceAttribute[]): SourceDocument =>
  item({
    body: [
      el(
        "qti-choice-interaction",
        [...attributes, attr("response-identifier", "RESPONSE")],
        [choice("A", "Ant"), choice("B", "Bee")],
      ),
      el("p", [attr("id", "intro")], [text("Pick one.")]),
    ],
    declarations: [declaration("qti-response-declaration", "RESPONSE", "identifier", "single", [])],
  });

/**
 * An item whose body is one `qti-text-entry-interaction` bound to a single integer response.
 *
 * @param attributes The interaction's attributes beside `response-identifier`.
 * @returns The document at `items/test.xml`.
 */
const textEntryItem = (attributes: readonly SourceAttribute[]): SourceDocument =>
  item({
    body: [
      el(
        "p",
        [],
        [
          el(
            "qti-text-entry-interaction",
            [...attributes, attr("response-identifier", "RESPONSE")],
            [],
          ),
        ],
      ),
    ],
    declarations: [declaration("qti-response-declaration", "RESPONSE", "integer", "single", [])],
  });

/**
 * An item whose body is one `qti-extended-text-interaction` bound to a string response.
 *
 * @param cardinality The response's cardinality.
 * @param attributes The interaction's attributes beside `response-identifier`.
 * @returns The document at `items/test.xml`.
 */
const extendedTextItem = (
  cardinality: string,
  attributes: readonly SourceAttribute[],
): SourceDocument =>
  item({
    body: [
      el(
        "qti-extended-text-interaction",
        [...attributes, attr("response-identifier", "RESPONSE")],
        [],
      ),
    ],
    declarations: [declaration("qti-response-declaration", "RESPONSE", "string", cardinality, [])],
  });

/**
 * Read an item written as XML text, at `items/test.xml`.
 *
 * @param xml The document's text.
 * @returns The source document, or the reader's refusal.
 */
const fromXml = (xml: string) => readSource("items/test.xml", new TextEncoder().encode(xml));

/**
 * Write an item whose body is one paragraph around an Inline Choice bound to a single identifier
 * `RESPONSE`, as XML text.
 *
 * @param interaction The `qti-inline-choice-interaction` element, as XML text.
 * @returns The item's text.
 */
const inlineChoiceXml = (interaction: string): string =>
  [
    '<qti-assessment-item xmlns="http://www.imsglobal.org/xsd/imsqtiasi_v3p0" identifier="item" time-dependent="false" title="Item">',
    '<qti-response-declaration base-type="identifier" cardinality="single" identifier="RESPONSE"/>',
    `<qti-item-body><p>The sky is ${interaction}.</p></qti-item-body>`,
    "</qti-assessment-item>",
  ].join("");

/**
 * Give each choice's identifier beside its template visibility.
 *
 * @param choices A Choice's or an Inline Choice's choices.
 * @returns The pairs, in document order.
 */
const visibilities = (choices: ChoiceInteraction["choices"]) =>
  choices.map((each) => [each.identifier, each.templateVisibility] as const);

/**
 * The path of the Inline Choice {@link inlineChoiceXml} writes.
 */
const inlinePath = `${body}/p/qti-inline-choice-interaction`;

/**
 * Find the one Choice model among body nodes.
 *
 * @param nodes The nodes to search.
 * @returns The Choice model; the test fails when there is none.
 */
const choiceIn = (nodes: readonly BodyNode[]): ChoiceInteraction => {
  const found = nodes.find((node): node is ChoiceInteraction => node.kind === "choice");
  assert.isDefined(found);

  return found;
};

/**
 * The children of a body element.
 *
 * @param node A body node.
 * @returns Its children; the test fails when it is not an element.
 */
const childrenOf = (node: BodyNode | undefined): readonly BodyNode[] => {
  assert.strictEqual(node?.kind, "element");

  return node?.kind === "element" ? node.children : [];
};

/**
 * The declarations each growth check builds first, before it builds {@link growthFactor} times as
 * many.
 */
const fewerDeclarations = 1000;

describe("buildItem", () => {
  it("builds BG007's Choice, the same whether its response processing names a template or writes it inline, with no mark", () => {
    const built: Item = admittedItem(bg007(template("match_correct")));
    const inline = admittedItem(bg007(matchCorrectBlock()));
    const interaction = choiceIn(built.body);

    assert.strictEqual(built.document, "items/BG007.xml");
    assert.strictEqual(built.identifier, "beginnersguide007");
    assert.strictEqual(built.title, "BG true false example ");
    assert.deepStrictEqual(built.lang, Option.some("en-US"));
    assert.deepStrictEqual(
      built.body.map((node) => node.kind),
      ["element", "choice"],
    );
    assert.deepStrictEqual(
      interaction.choices.map((option) => option.identifier),
      ["true", "false"],
    );
    assert.deepStrictEqual(interaction.choices[0]?.content, [{ kind: "text", text: "True" }]);
    assert.strictEqual(interaction.response, "RESPONSE");
    assert.strictEqual(interaction.cardinality, "single");
    assert.strictEqual(interaction.maxChoices, 1n);
    assert.strictEqual(interaction.minChoices, 0n);
    assert.strictEqual(interaction.shuffle, false);
    assert.strictEqual(interaction.path, `${body}/qti-choice-interaction`);
    assert.deepStrictEqual(
      built.responses.get("RESPONSE")?.correct,
      Option.some<Value>({
        baseType: "identifier",
        cardinality: "single",
        values: [{ baseType: "identifier", value: "true" }],
      }),
    );
    assert.deepStrictEqual(built.outcomes.get("SCORE")?.defaultValue, Option.some(float(1)));
    assert.deepStrictEqual(inline.body, built.body);
    assert.deepStrictEqual(built.unsupported, []);
    assert.deepStrictEqual(inline.unsupported, []);
  });

  it("reads a padded xs:double mapped-value and source-value with its whitespace collapsed, as the XSD does (reading 7)", () => {
    // XML Schema 1.0 Part 2 §4.3.6: xs:double's whiteSpace facet is collapse, fixed.
    const built = admittedItem(
      item({
        body: [paragraph],
        declarations: [
          declaration("qti-response-declaration", "WORD", "string", "single", [
            el(
              "qti-mapping",
              [],
              [el("qti-map-entry", [attr("map-key", "York"), attr("mapped-value", " 1 ")], [])],
            ),
          ]),
          declaration("qti-response-declaration", "POINT", "point", "single", [
            el("qti-area-mapping", [], [areaEntry("circle", "102,113,16", "\t0.5\n")]),
          ]),
          declaration("qti-outcome-declaration", "BAND", "identifier", "single", [
            el(
              "qti-interpolation-table",
              [],
              [
                el(
                  "qti-interpolation-table-entry",
                  [attr("source-value", " 2.5 "), attr("target-value", "HIGH")],
                  [],
                ),
              ],
            ),
          ]),
        ],
      }),
    );

    assert.deepStrictEqual(
      built.responses
        .get("WORD")
        ?.mapping.pipe(Option.map((mapping) => mapping.entries.map((entry) => entry.value))),
      Option.some([1]),
    );
    assert.deepStrictEqual(
      built.responses
        .get("POINT")
        ?.areaMapping.pipe(
          Option.map((mapping) => mapping.entries.map((entry) => entry.mappedValue)),
        ),
      Option.some([0.5]),
    );
    assert.deepStrictEqual(
      built.outcomes
        .get("BAND")
        ?.lookupTable.pipe(
          Option.map((table) =>
            table.kind === "interpolation" ? table.entries.map((entry) => entry.sourceValue) : [],
          ),
        ),
      Option.some([2.5]),
    );
  });

  it("holds a point declaration's qti-area-mapping, its entries in document order", () => {
    const built = admittedItem(
      item({
        after: [template("map_response_point")],
        body: [paragraph],
        declarations: [
          declaration("qti-response-declaration", "RESPONSE", "point", "single", [
            areaMapping([], "50"),
          ]),
          declaration("qti-response-declaration", "OTHER", "identifier", "single", []),
          declaration("qti-outcome-declaration", "SCORE", "float", "single", []),
        ],
      }),
    );

    assert.deepStrictEqual(
      built.responses.get("RESPONSE")?.areaMapping,
      Option.some<AreaMapping>({
        defaultValue: 0,
        entries: [
          { coords: [102, 113, 16], mappedValue: 1, shape: "circle" },
          { coords: [0, 0, 50, 40], mappedValue: 0.5, shape: "rect" },
        ],
        lowerBound: Option.none(),
        percent: false,
        upperBound: Option.none(),
      }),
    );
    assert.deepStrictEqual(built.responses.get("OTHER")?.areaMapping, Option.none());
    assert.deepStrictEqual(built.unsupported, []);
  });

  it("holds an area mapping's bounds and default, and percent for a coordinate 50%", () => {
    const built = admittedItem(
      item({
        body: [paragraph],
        declarations: [
          declaration("qti-response-declaration", "RESPONSE", "point", "multiple", [
            areaMapping(
              [attr("default-value", "-1"), attr("lower-bound", "0"), attr("upper-bound", "2")],
              "50%",
            ),
          ]),
        ],
      }),
    );

    assert.deepStrictEqual(
      built.responses.get("RESPONSE")?.areaMapping,
      Option.some<AreaMapping>({
        defaultValue: -1,
        entries: [
          { coords: [102, 113, 16], mappedValue: 1, shape: "circle" },
          { coords: [0, 0, 50, 40], mappedValue: 0.5, shape: "rect" },
        ],
        lowerBound: Option.some(0),
        percent: true,
        upperBound: Option.some(2),
      }),
    );
    assert.deepStrictEqual(built.unsupported, []);
  });

  it("leaves out a rubric block exactly when its view leaves out candidate, over every view list", () => {
    const views = ["author", "candidate", "proctor", "scorer", "testConstructor", "tutor"];
    /**
     * Every set of the XSD's six views (View.Type), the empty one first. Each nonempty set is
     * written as a list: the block is the Rubric Block module's content node, holding its content,
     * when the set holds candidate, and in no node or verdict otherwise.
     */
    const sets: (readonly string[])[] = [[]];
    for (const view of views) {
      sets.push(...sets.map((set) => [...set, view]));
    }
    for (const listed of sets.filter((set) => set.length > 0)) {
      const built = admittedItem(
        item({
          body: [
            el("p", [], [text("Before")]),
            el(
              "qti-rubric-block",
              [attr("use", "ext:criteria"), attr("view", ` ${listed.join("\t")} `)],
              [el("qti-content-body", [], [el("p", [], [text("Model answer")])])],
            ),
            el("p", [], [text("After")]),
          ],
          declarations: [],
        }),
      );
      const shown = listed.includes("candidate");

      assert.deepStrictEqual(
        built.body.map((node) => (node.kind === "content" ? `content:${node.element}` : node.kind)),
        shown ? ["element", "content:qti-rubric-block", "element"] : ["element", "element"],
        listed.join(" "),
      );
      assert.deepStrictEqual(built.unsupported, [], listed.join(" "));
      assert.strictEqual(JSON.stringify(built).includes("Model answer"), shown, listed.join(" "));
    }
  });

  it("shows an upload interaction as a notice and keeps the rest of the body", () => {
    const built = admittedItem(
      item({
        body: [
          el("p", [], [text("Photograph your working.")]),
          el(
            "qti-upload-interaction",
            [attr("response-identifier", "RESPONSE"), attr("type", "image/png")],
            [el("qti-prompt", [], [text("Upload the photograph")])],
          ),
          el("p", [], [text("After")]),
        ],
        declarations: [declaration("qti-response-declaration", "RESPONSE", "file", "single", [])],
      }),
    );
    const path = `${body}/qti-upload-interaction`;

    assert.deepStrictEqual(built.body[1], {
      feature: "qti-upload-interaction",
      kind: "unsupported",
      path,
    });
    assert.deepStrictEqual(
      built.body.map((node) => node.kind),
      ["element", "unsupported", "element"],
    );
    assert.deepStrictEqual(childrenOf(built.body[2]), [{ kind: "text", text: "After" }]);
    assert.deepStrictEqual(built.unsupported, [
      { feature: "qti-upload-interaction", path, shown: "notice" },
    ]);
  });

  it('builds shuffle="true" with no unsupported feature and keeps the choices in document order', () => {
    const built = admittedItem(
      item({
        body: [
          el(
            "qti-choice-interaction",
            [attr("response-identifier", "RESPONSE"), attr("shuffle", "true")],
            [choice("C", "Cat"), choice("A", "Ant"), choice("B", "Bee")],
          ),
        ],
        declarations: [
          declaration("qti-response-declaration", "RESPONSE", "identifier", "multiple", []),
        ],
      }),
    );
    const interaction = choiceIn(built.body);

    assert.deepStrictEqual(
      interaction.choices.map((option) => option.identifier),
      ["C", "A", "B"],
    );
    assert.strictEqual(interaction.shuffle, true);
    assert.strictEqual(interaction.cardinality, "multiple");
    assert.deepStrictEqual(built.unsupported, []);
  });

  it('reads each choice\'s fixed as an xs:boolean: true for "true" and "1", false for "false", "0" and none', () => {
    const built = admittedItem(
      item({
        body: [
          el(
            "qti-choice-interaction",
            [attr("response-identifier", "RESPONSE"), attr("shuffle", "true")],
            [
              el(
                "qti-simple-choice",
                [attr("fixed", "true"), attr("identifier", "T")],
                [text("True")],
              ),
              el("qti-simple-choice", [attr("fixed", "1"), attr("identifier", "O")], [text("One")]),
              el(
                "qti-simple-choice",
                [attr("fixed", "false"), attr("identifier", "F")],
                [text("False")],
              ),
              el(
                "qti-simple-choice",
                [attr("fixed", " 0 "), attr("identifier", "Z")],
                [text("Zero")],
              ),
              choice("N", "None"),
            ],
          ),
        ],
        declarations: [
          declaration("qti-response-declaration", "RESPONSE", "identifier", "single", []),
        ],
      }),
    );

    assert.deepStrictEqual(
      choiceIn(built.body).choices.map((option) => [option.identifier, option.fixed]),
      [
        ["T", true],
        ["O", true],
        ["F", false],
        ["Z", false],
        ["N", false],
      ],
    );
    assert.deepStrictEqual(built.unsupported, []);
  });

  it("reads adaptive and shuffle as true for true or 1 and false for false or 0, marking neither", () => {
    const cases = [
      ["true", true],
      ["1", true],
      [" 1 ", true],
      ["false", false],
      ["0", false],
    ] as const;

    for (const [written, on] of cases) {
      const built = admittedItem(
        item({
          attributes: [attr("adaptive", written)],
          body: [
            el(
              "qti-choice-interaction",
              [attr("response-identifier", "RESPONSE"), attr("shuffle", written)],
              [choice("A", "Ant"), choice("B", "Bee")],
            ),
          ],
          declarations: [
            declaration("qti-response-declaration", "RESPONSE", "identifier", "single", []),
          ],
        }),
      );

      assert.strictEqual(choiceIn(built.body).shuffle, on, written);
      assert.strictEqual(built.adaptive, on, written);
      assert.deepStrictEqual(built.unsupported, [], written);
    }
  });

  it("reads a Choice's aria-label and aria-labelledby, none when absent", () => {
    const named = choiceIn(
      admittedItem(
        choiceItem([attr("aria-label", "Pick a city"), attr("aria-labelledby", "intro")]),
      ).body,
    );
    const unnamed = choiceIn(admittedItem(choiceItem([])).body);

    assert.deepStrictEqual(named.ariaLabel, Option.some("Pick a city"));
    assert.deepStrictEqual(named.ariaLabelledby, Option.some("intro"));
    assert.deepStrictEqual(unnamed.ariaLabel, Option.none());
    assert.deepStrictEqual(unnamed.ariaLabelledby, Option.none());
  });

  it.effect(
    'builds an Inline Choice from XML with every field, reading required=" true " as true',
    () =>
      Effect.gen(function* buildsInlineChoice() {
        const built = admittedItem(
          yield* fromXml(
            inlineChoiceXml(
              [
                '<qti-inline-choice-interaction aria-label="Colour"',
                ' class="qti-input-width-10" data-min-selections-message="Pick a colour"',
                ' data-prompt="Choose" min-choices=" 1 " required=" true "',
                ' response-identifier="RESPONSE" shuffle=" 1 ">',
                "<qti-label>Sky <em>colour</em></qti-label>",
                '<qti-inline-choice identifier=" R ">red</qti-inline-choice>',
                '<qti-inline-choice fixed=" true " identifier="B">blue</qti-inline-choice>',
                '<qti-inline-choice fixed="0" identifier="G"><em>green</em></qti-inline-choice>',
                "</qti-inline-choice-interaction>",
              ].join(""),
            ),
          ),
        );
        const expected: InlineChoiceInteraction = {
          ariaLabel: Option.some("Colour"),
          ariaLabelledby: Option.none(),
          catalog: Option.none(),
          choices: [
            {
              catalog: Option.none(),
              content: [{ kind: "text", text: "red" }],
              fixed: false,
              identifier: "R",
              templateVisibility: Option.none(),
            },
            {
              catalog: Option.none(),
              content: [{ kind: "text", text: "blue" }],
              fixed: true,
              identifier: "B",
              templateVisibility: Option.none(),
            },
            {
              catalog: Option.none(),
              content: [
                {
                  attributes: [],
                  children: [{ kind: "text", text: "green" }],
                  kind: "element",
                  path: `${inlinePath}/qti-inline-choice[3]/em`,
                  tag: "em",
                },
              ],
              fixed: false,
              identifier: "G",
              templateVisibility: Option.none(),
            },
          ],
          class: Option.some("qti-input-width-10"),
          // The root's `data-*`, which securing keeps, ride on the node as an author's, as every
          // interaction module's do.
          data: [
            { name: "data-min-selections-message", value: "Pick a colour" },
            { name: "data-prompt", value: "Choose" },
          ],
          id: Option.none(),
          kind: "inline-choice",
          label: Option.some([
            { kind: "text", text: "Sky " },
            {
              attributes: [],
              children: [{ kind: "text", text: "colour" }],
              kind: "element",
              path: `${inlinePath}/qti-label/em`,
              tag: "em",
            },
          ]),
          messages: { min: Option.some("Pick a colour") },
          minChoices: 1n,
          path: inlinePath,
          placeholder: Option.some("Choose"),
          promptCatalog: Option.none(),
          required: true,
          response: "RESPONSE",
          shuffle: true,
        };

        assert.deepStrictEqual(childrenOf(built.body[0]), [
          { kind: "text", text: "The sky is " },
          expected,
          { kind: "text", text: "." },
        ]);
        assert.deepStrictEqual(built.unsupported, []);
      }),
  );

  it.effect("builds an Inline Choice with only its required attributes at the defaults", () =>
    Effect.gen(function* inlineChoiceDefaults() {
      const built = admittedItem(
        yield* fromXml(
          inlineChoiceXml(
            [
              '<qti-inline-choice-interaction response-identifier="RESPONSE">',
              '<qti-inline-choice identifier="R">red</qti-inline-choice>',
              "</qti-inline-choice-interaction>",
            ].join(""),
          ),
        ),
      );
      const expected: InlineChoiceInteraction = {
        ariaLabel: Option.none(),
        ariaLabelledby: Option.none(),
        catalog: Option.none(),
        choices: [
          {
            catalog: Option.none(),
            content: [{ kind: "text", text: "red" }],
            fixed: false,
            identifier: "R",
            templateVisibility: Option.none(),
          },
        ],
        class: Option.none(),
        data: [],
        id: Option.none(),
        kind: "inline-choice",
        label: Option.none(),
        messages: { min: Option.none() },
        minChoices: 0n,
        path: inlinePath,
        placeholder: Option.none(),
        promptCatalog: Option.none(),
        required: false,
        response: "RESPONSE",
        shuffle: false,
      };

      assert.deepStrictEqual(childrenOf(built.body[0])[1], expected);
      assert.deepStrictEqual(built.unsupported, []);
    }),
  );

  it("builds a Text Entry with its attributes and base 10 by default", () => {
    const built = admittedItem(
      item({
        body: [
          el(
            "p",
            [],
            [
              text("Capital: "),
              el(
                "qti-text-entry-interaction",
                [
                  attr("expected-length", " 12 "),
                  attr("placeholder-text", "a city"),
                  attr("response-identifier", "RESPONSE"),
                ],
                [],
              ),
            ],
          ),
        ],
        declarations: [declaration("qti-response-declaration", "RESPONSE", "string", "single", [])],
      }),
    );
    const expected: TextEntryInteraction = {
      ariaLabel: Option.none(),
      ariaLabelledby: Option.none(),
      base: 10,
      baseType: "string",
      cardinality: "single",
      catalog: Option.none(),
      class: Option.none(),
      data: [],
      expectedLength: Option.some(12n),
      id: Option.none(),
      kind: "text-entry",
      path: `${body}/p/qti-text-entry-interaction`,
      patternMask: Option.none(),
      patternMaskMessage: Option.none(),
      placeholder: Option.some("a city"),
      promptCatalog: Option.none(),
      response: "RESPONSE",
    };

    assert.deepStrictEqual(childrenOf(built.body[0]), [
      { kind: "text", text: "Capital: " },
      expected,
    ]);
  });

  it('builds a Text Entry with pattern-mask="[0-9]+" holding its pattern, with no notice', () => {
    const built = admittedItem(textEntryItem([attr("pattern-mask", "[0-9]+")]));
    const [entry] = childrenOf(built.body[0]);

    assert.strictEqual(entry?.kind, "text-entry");
    assert.deepStrictEqual(
      entry?.kind === "text-entry" ? entry.patternMask : Option.none(),
      Option.some("[0-9]+"),
    );
    assert.deepStrictEqual(built.unsupported, []);
  });

  it('keeps the notice pattern-mask on a pattern the translator refuses, pattern-mask="[0-9", and builds the item', () => {
    const built = admittedItem(textEntryItem([attr("pattern-mask", "[0-9")]));
    const path = `${body}/p/qti-text-entry-interaction`;

    assert.deepStrictEqual(childrenOf(built.body[0]), [
      { feature: "pattern-mask", kind: "unsupported", path },
    ]);
    assert.deepStrictEqual(built.unsupported, [{ feature: "pattern-mask", path, shown: "notice" }]);
  });

  it('builds an Extended Text with format="xhtml" and its pattern-mask, with no notice', () => {
    const built = admittedItem(
      item({
        body: [
          el(
            "qti-extended-text-interaction",
            [
              attr("format", "xhtml"),
              attr("pattern-mask", "[^<>]*"),
              attr("response-identifier", "RESPONSE"),
            ],
            [],
          ),
        ],
        declarations: [declaration("qti-response-declaration", "RESPONSE", "string", "single", [])],
      }),
    );
    const [node] = built.body;

    assert.strictEqual(node?.kind, "extended-text");
    assert.deepStrictEqual(node?.kind === "extended-text" ? [node.format, node.patternMask] : [], [
      "xhtml",
      Option.some("[^<>]*"),
    ]);
    assert.deepStrictEqual(built.unsupported, []);
  });

  it("builds an Extended Text with its prompt and format", () => {
    const built = admittedItem(
      item({
        body: [
          el(
            "qti-extended-text-interaction",
            [
              attr("expected-lines", "5"),
              attr("format", "preformatted"),
              attr("response-identifier", "RESPONSE"),
            ],
            [el("qti-prompt", [], [text("Write a poem.")])],
          ),
        ],
        declarations: [declaration("qti-response-declaration", "RESPONSE", "string", "single", [])],
      }),
    );
    const [node] = built.body;

    assert.strictEqual(node?.kind, "extended-text");
    assert.deepStrictEqual(
      node?.kind === "extended-text"
        ? [
            node.format,
            node.expectedLines,
            node.prompt,
            node.cardinality,
            node.maxStrings,
            node.minStrings,
          ]
        : [],
      [
        "preformatted",
        Option.some(5n),
        Option.some([{ kind: "text", text: "Write a poem." }]),
        "single",
        Option.none(),
        0n,
      ],
    );
  });

  for (const [cardinality, attributes, maxStrings, minStrings] of [
    ["ordered", [attr("max-strings", "3")], Option.some(3n), 0n],
    ["multiple", [attr("max-strings", "1000000000000")], Option.some(1_000_000_000_000n), 0n],
    ["ordered", [attr("max-strings", "200"), attr("min-strings", "100")], Option.some(200n), 100n],
    ["ordered", [attr("max-strings", "0")], Option.some(0n), 0n],
  ] as const) {
    it(`builds an Extended Text bound to ${cardinality} with ${attributes.map((attribute) => `${attribute.local}="${attribute.value}"`).join(" ")}, its counts held exactly, with no notice`, () => {
      const built = admittedItem(extendedTextItem(cardinality, attributes));
      const [node] = built.body;

      assert.strictEqual(node?.kind, "extended-text");
      assert.deepStrictEqual(
        node?.kind === "extended-text" ? [node.cardinality, node.maxStrings, node.minStrings] : [],
        [cardinality, maxStrings, minStrings],
      );
      assert.deepStrictEqual(built.unsupported, []);
    });
  }

  for (const [attributes, maxStrings, minStrings] of [
    [[attr("max-strings", "200"), attr("min-strings", "101")], Option.some(200n), 101n],
    [
      [attr("max-strings", "1000000000000"), attr("min-strings", "1000000000000")],
      Option.some(1_000_000_000_000n),
      1_000_000_000_000n,
    ],
  ] as const) {
    it(`builds an ordered Extended Text with ${attributes.map((attribute) => `${attribute.local}="${attribute.value}"`).join(" ")}, its counts held exactly, and shows min-strings>100 in place of its Controls`, () => {
      const built = admittedItem(extendedTextItem("ordered", attributes));
      const [node] = built.body;

      assert.strictEqual(node?.kind, "extended-text");
      assert.deepStrictEqual(
        node?.kind === "extended-text" ? [node.cardinality, node.maxStrings, node.minStrings] : [],
        ["ordered", maxStrings, minStrings],
      );
      assert.deepStrictEqual(built.unsupported, [
        {
          feature: "min-strings>100",
          path: `${body}/qti-extended-text-interaction`,
          shown: "notice",
        },
      ]);
    });
  }

  it("shows a drawing interaction as a notice", () => {
    const path = `${body}/qti-drawing-interaction`;
    const built = admittedItem(
      item({
        body: [
          el(
            "qti-drawing-interaction",
            [attr("response-identifier", "RESPONSE")],
            [
              el("qti-prompt", [], [text("Draw a square")]),
              el(
                "object",
                [
                  attr("data", "images/grid.png"),
                  attr("height", "240"),
                  attr("type", "image/png"),
                  attr("width", "320"),
                ],
                [text("A grid")],
              ),
            ],
          ),
        ],
        declarations: [declaration("qti-response-declaration", "RESPONSE", "file", "single", [])],
      }),
    );

    assert.deepStrictEqual(built.body, [
      { feature: "qti-drawing-interaction", kind: "unsupported", path },
    ]);
    assert.deepStrictEqual(built.unsupported, [
      { feature: "qti-drawing-interaction", path, shown: "notice" },
    ]);
  });

  it("holds a qti-printed-variable as a printed-variable node with every attribute it carries, and lists no unsupported feature for it", () => {
    const built = admittedItem(
      item({
        body: [
          el(
            "p",
            [],
            [
              text("Score: "),
              el(
                "qti-printed-variable",
                [
                  attr("base", "B"),
                  attr("delimiter", ", "),
                  attr("field", "x"),
                  attr("format", "%.1f"),
                  attr("identifier", " SCORE "),
                  attr("index", "2"),
                  attr("mapping-indicator", ":"),
                  attr("power-form", "true"),
                ],
                [],
              ),
            ],
          ),
        ],
        declarations: [
          declaration("qti-outcome-declaration", "B", "integer", "single", []),
          declaration("qti-outcome-declaration", "SCORE", "float", "single", []),
        ],
      }),
    );

    assert.deepStrictEqual(built.body, [
      {
        attributes: [],
        children: [
          { kind: "text", text: "Score: " },
          {
            base: { _tag: "ref", identifier: "B" },
            delimiter: ", ",
            field: Option.some("x"),
            format: Option.some("%.1f"),
            identifier: "SCORE",
            index: Option.some<IntegerOrRef>({ _tag: "literal", value: 2n }),
            kind: "printed-variable",
            mappingIndicator: ":",
            path: `${body}/p/qti-printed-variable`,
            powerForm: true,
          },
        ],
        kind: "element",
        path: `${body}/p`,
        tag: "p",
      },
    ]);
    assert.deepStrictEqual(built.unsupported, []);
  });

  it("holds a qti-printed-variable that carries only its identifier at the attributes' defaults: base 10, the delimiter ;, the mapping indicator =, no power form, and no format, field or index", () => {
    const built = admittedItem(
      item({
        body: [el("p", [], [el("qti-printed-variable", [attr("identifier", "SCORE")], [])])],
        declarations: [declaration("qti-outcome-declaration", "SCORE", "float", "single", [])],
      }),
    );

    assert.deepStrictEqual(built.body, [
      {
        attributes: [],
        children: [
          {
            base: { _tag: "literal", value: 10n },
            delimiter: ";",
            field: Option.none(),
            format: Option.none(),
            identifier: "SCORE",
            index: Option.none(),
            kind: "printed-variable",
            mappingIndicator: "=",
            path: `${body}/p/qti-printed-variable`,
            powerForm: false,
          },
        ],
        kind: "element",
        path: `${body}/p`,
        tag: "p",
      },
    ]);
    assert.deepStrictEqual(built.unsupported, []);
  });

  it("holds a qti-template-block and a qti-template-inline as body nodes with their identifier, template visibility and content, a block's content its qti-content-body's and its qti-stylesheet a mark", () => {
    const built = admittedItem(
      item({
        body: [
          el(
            "p",
            [],
            [
              text("Go by "),
              el(
                "qti-template-inline",
                [attr("identifier", " plane "), attr("template-identifier", " TRANSPORT ")],
                [el("em", [], [text("air")])],
              ),
            ],
          ),
          el(
            "qti-template-block",
            [
              attr("identifier", "SOLUTION"),
              attr("show-hide", "hide"),
              attr("template-identifier", "SHOWN"),
            ],
            [
              el("qti-stylesheet", [attr("href", "block.css"), attr("type", "text/css")], []),
              el("qti-content-body", [], [el("p", [], [text("Worked solution")])]),
            ],
          ),
        ],
        declarations: [
          el(
            "qti-template-declaration",
            [
              attr("base-type", "identifier"),
              attr("cardinality", "single"),
              attr("identifier", "SHOWN"),
            ],
            [],
          ),
          el(
            "qti-template-declaration",
            [
              attr("base-type", "identifier"),
              attr("cardinality", "single"),
              attr("identifier", "TRANSPORT"),
            ],
            [],
          ),
        ],
      }),
    );
    const block = `${body}/qti-template-block`;

    assert.deepStrictEqual(built.body, [
      {
        attributes: [],
        children: [
          { kind: "text", text: "Go by " },
          {
            content: [
              {
                attributes: [],
                children: [{ kind: "text", text: "air" }],
                kind: "element",
                path: `${body}/p/qti-template-inline/em`,
                tag: "em",
              },
            ],
            identifier: "plane",
            kind: "template-inline",
            path: `${body}/p/qti-template-inline`,
            responses: [],
            templateVisibility: { showHide: "show", templateIdentifier: "TRANSPORT" },
          },
        ],
        kind: "element",
        path: `${body}/p`,
        tag: "p",
      },
      {
        content: [
          {
            attributes: [],
            children: [{ kind: "text", text: "Worked solution" }],
            kind: "element",
            path: `${block}/qti-content-body/p`,
            tag: "p",
          },
        ],
        identifier: "SOLUTION",
        kind: "template-block",
        path: block,
        responses: [],
        templateVisibility: { showHide: "hide", templateIdentifier: "SHOWN" },
      },
    ]);
    assert.deepStrictEqual(built.unsupported, [
      { feature: "qti-stylesheet", path: `${block}/qti-stylesheet`, shown: "mark" },
    ]);
  });

  it("reads a qti-simple-choice's and a qti-inline-choice's template-identifier and show-hide into its template visibility, show when absent, and gives none to a choice with no template-identifier whatever its show-hide", () => {
    const built = admittedItem(
      item({
        body: [
          el(
            "qti-choice-interaction",
            [attr("response-identifier", "RESPONSE")],
            [
              el(
                "qti-simple-choice",
                [attr("identifier", "A"), attr("template-identifier", " SHOWN ")],
                [text("Ant")],
              ),
              el(
                "qti-simple-choice",
                [
                  attr("identifier", "B"),
                  attr("show-hide", "hide"),
                  attr("template-identifier", "HIDDEN"),
                ],
                [text("Bee")],
              ),
              el(
                "qti-simple-choice",
                [attr("identifier", "C"), attr("show-hide", "hide")],
                [text("Cat")],
              ),
            ],
          ),
          el(
            "p",
            [],
            [
              el(
                "qti-inline-choice-interaction",
                [attr("response-identifier", "COLOUR")],
                [
                  el(
                    "qti-inline-choice",
                    [
                      attr("identifier", "R"),
                      attr("show-hide", "hide"),
                      attr("template-identifier", "SHOWN"),
                    ],
                    [text("red")],
                  ),
                ],
              ),
            ],
          ),
        ],
        declarations: [
          el(
            "qti-template-declaration",
            [
              attr("base-type", "identifier"),
              attr("cardinality", "single"),
              attr("identifier", "HIDDEN"),
            ],
            [],
          ),
          el(
            "qti-template-declaration",
            [
              attr("base-type", "identifier"),
              attr("cardinality", "single"),
              attr("identifier", "SHOWN"),
            ],
            [],
          ),
          declaration("qti-response-declaration", "RESPONSE", "identifier", "single", []),
          declaration("qti-response-declaration", "COLOUR", "identifier", "single", []),
        ],
      }),
    );
    assert.deepStrictEqual(visibilities(choiceIn(built.body).choices), [
      ["A", Option.some<TemplateVisibility>({ showHide: "show", templateIdentifier: "SHOWN" })],
      ["B", Option.some<TemplateVisibility>({ showHide: "hide", templateIdentifier: "HIDDEN" })],
      ["C", Option.none()],
    ]);

    const [inline] = childrenOf(built.body[1]);
    assert.deepStrictEqual(inline?.kind === "inline-choice" ? visibilities(inline.choices) : [], [
      ["R", Option.some<TemplateVisibility>({ showHide: "hide", templateIdentifier: "SHOWN" })],
    ]);
    assert.deepStrictEqual(built.unsupported, []);
  });

  it("marks what it does not render outside the body and on body elements, and holds a modal feedback beside the body with no mark", () => {
    const built = admittedItem(
      item({
        after: [
          el(
            "qti-modal-feedback",
            [
              attr("identifier", "fb"),
              attr("outcome-identifier", "FEEDBACK"),
              attr("show-hide", "show"),
            ],
            [el("qti-content-body", [], [text("Well done")])],
          ),
        ],
        attributes: [attr("adaptive", "true")],
        body: [
          el(
            "p",
            [
              attrIn(xmlNamespace, "base", "images/"),
              attrIn(xmlNamespace, "lang", "fr"),
              attr("class", "lead"),
            ],
            [text("Bonjour")],
          ),
        ],
        declarations: [
          declaration("qti-response-declaration", "POINT", "point", "single", []),
          declaration("qti-outcome-declaration", "FEEDBACK", "identifier", "single", []),
          el(
            "qti-template-declaration",
            [attr("base-type", "integer"), attr("cardinality", "single"), attr("identifier", "T")],
            [],
          ),
        ],
      }),
    );

    assert.deepStrictEqual(built.body[0], {
      attributes: [
        { name: "xml:lang", value: "fr" },
        { name: "class", value: "lead" },
      ],
      children: [{ kind: "text", text: "Bonjour" }],
      kind: "element",
      path: `${body}/p`,
      tag: "p",
    });
    assert.deepStrictEqual(built.lang, Option.none());
    assert.deepStrictEqual([...built.responses.keys()], ["POINT"]);
    assert.isTrue(built.adaptive);
    assert.deepStrictEqual(built.unsupported, [
      { feature: "xml:base", path: `${body}/p`, shown: "mark" },
    ]);
    assert.deepStrictEqual(built.modalFeedback, [
      {
        content: [{ kind: "text", text: "Well done" }],
        feedbackVisibility: { outcomeIdentifier: "FEEDBACK", showHide: "show" },
        identifier: "fb",
        path: `${root}/qti-modal-feedback`,
        title: Option.none(),
      },
    ]);
  });

  it("builds a record-bound control: a Text Entry and an Extended Text bound to a record response the model holds are the string control of cardinality record, their attributes held as for a string binding, with no notice", () => {
    const built = admittedItem(
      item({
        body: [
          el(
            "p",
            [],
            [
              el(
                "qti-text-entry-interaction",
                [
                  attr("base", "16"),
                  attr("expected-length", "8"),
                  attr("pattern-mask", "[0-9]+"),
                  attr("placeholder-text", "a number"),
                  attr("response-identifier", "NUMBER"),
                ],
                [],
              ),
            ],
          ),
          el(
            "qti-extended-text-interaction",
            [
              attr("expected-lines", "3"),
              attr("max-strings", "4"),
              attr("min-strings", "1"),
              attr("response-identifier", "WORKING"),
            ],
            [el("qti-prompt", [], [text("Show your working.")])],
          ),
        ],
        declarations: [
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
        ],
      }),
    );
    const entry: TextEntryInteraction = {
      ariaLabel: Option.none(),
      ariaLabelledby: Option.none(),
      base: 16,
      baseType: "string",
      cardinality: "record",
      catalog: Option.none(),
      class: Option.none(),
      data: [],
      expectedLength: Option.some(8n),
      id: Option.none(),
      kind: "text-entry",
      path: `${body}/p/qti-text-entry-interaction`,
      patternMask: Option.some("[0-9]+"),
      patternMaskMessage: Option.none(),
      placeholder: Option.some("a number"),
      promptCatalog: Option.none(),
      response: "NUMBER",
    };
    const working: ExtendedTextInteraction = {
      ariaLabel: Option.none(),
      ariaLabelledby: Option.none(),
      base: 10,
      baseType: "string",
      cardinality: "record",
      catalog: Option.none(),
      class: Option.none(),
      data: [],
      expectedLength: Option.none(),
      expectedLines: Option.some(3n),
      format: "plain",
      id: Option.none(),
      kind: "extended-text",
      maxStrings: Option.some(4n),
      minStrings: 1n,
      path: `${body}/qti-extended-text-interaction`,
      patternMask: Option.none(),
      patternMaskMessage: Option.none(),
      placeholder: Option.none(),
      prompt: Option.some([{ kind: "text", text: "Show your working." }]),
      promptCatalog: Option.none(),
      response: "WORKING",
    };

    assert.deepStrictEqual(childrenOf(built.body[0]), [entry]);
    assert.deepStrictEqual(built.body[1], working);
    assert.deepStrictEqual([...built.records.keys()], ["NUMBER", "WORKING"]);
    assert.deepStrictEqual(built.unsupported, []);
  });

  it("holds a record response with a file field, its field a file single of the written name, and builds the record-bound Text Entry with no mark", () => {
    const built = admittedItem(
      item({
        body: [
          el(
            "p",
            [],
            [el("qti-text-entry-interaction", [attr("response-identifier", "UPLOAD")], [])],
          ),
        ],
        declarations: [
          el(
            "qti-response-declaration",
            [attr("cardinality", "record"), attr("identifier", "UPLOAD")],
            [el("qti-correct-response", [], [recordField("content", "file", "a.txt")])],
          ),
        ],
      }),
    );

    assert.deepStrictEqual(
      built.records,
      new Map<string, RecordDeclaration>([
        [
          "UPLOAD",
          {
            correct: Option.some<RecordValue>({
              cardinality: "record",
              fields: [
                {
                  identifier: "content",
                  value: { baseType: "file", value: { name: "a.txt", size: 0, type: "" } },
                },
              ],
            }),
            defaultValue: Option.none(),
            identifier: "UPLOAD",
          },
        ],
      ]),
    );
    assert.strictEqual(built.unheld.size, 0);
    assert.deepStrictEqual(
      built.body
        .flatMap((node) => (node.kind === "element" ? node.children : [node]))
        .map((node) =>
          node.kind === "text-entry" ? [node.baseType, node.cardinality] : node.kind,
        ),
      [["string", "record"]],
    );
    assert.deepStrictEqual(built.unsupported, []);
  });

  it("reads a response's qti-default-value through the value model, none without", () => {
    const built = admittedItem(
      item({
        body: [paragraph],
        declarations: [
          declaration("qti-response-declaration", "WITH", "integer", "single", [
            values("qti-default-value", " 7 "),
          ]),
          declaration("qti-response-declaration", "WITHOUT", "integer", "single", []),
        ],
      }),
    );

    assert.deepStrictEqual(
      built.responses.get("WITH")?.defaultValue,
      Option.some<Value>({
        baseType: "integer",
        cardinality: "single",
        values: [{ baseType: "integer", value: 7n }],
      }),
    );
    assert.deepStrictEqual(built.responses.get("WITHOUT")?.defaultValue, Option.none());
  });

  it("reads an integer correct response beyond 2^53 exactly", () => {
    const built = admittedItem(
      item({
        body: [paragraph],
        declarations: [
          declaration("qti-response-declaration", "RESPONSE", "integer", "single", [
            values("qti-correct-response", "9007199254740993"),
          ]),
        ],
      }),
    );

    assert.deepStrictEqual(
      built.responses.get("RESPONSE")?.correct,
      Option.some<Value>({
        baseType: "integer",
        cardinality: "single",
        values: [{ baseType: "integer", value: 2n ** 53n + 1n }],
      }),
    );
  });

  it("reads an integer map-key of 31 digits exactly", () => {
    const built = admittedItem(
      item({
        body: [paragraph],
        declarations: [
          declaration("qti-response-declaration", "RESPONSE", "integer", "single", [
            el(
              "qti-mapping",
              [],
              [
                el(
                  "qti-map-entry",
                  [attr("map-key", "-1000000000000000000000000000000"), attr("mapped-value", "1")],
                  [],
                ),
              ],
            ),
          ]),
        ],
      }),
    );

    assert.deepStrictEqual(
      built.responses.get("RESPONSE")?.mapping,
      Option.some({
        defaultValue: 0,
        entries: [
          {
            caseSensitive: false,
            key: { baseType: "integer", value: -(10n ** 30n) },
            value: 1,
          },
        ],
        lowerBound: Option.none(),
        upperBound: Option.none(),
      }),
    );
  });

  it("reads a duration qti-value as seconds in a double, INF, NaN and a negative included, and holds a file outcome beside it unmarked", () => {
    const cases: readonly (readonly [string, number])[] = [
      ["90.5", 90.5],
      ["89.95", 89.95],
      [" INF ", Number.POSITIVE_INFINITY],
      ["-INF", Number.NEGATIVE_INFINITY],
      ["NaN", Number.NaN],
      ["-1.5", -1.5],
    ];
    for (const [written, seconds] of cases) {
      const built = admittedItem(
        item({
          body: [paragraph],
          declarations: [
            declaration("qti-outcome-declaration", "TIME", "duration", "single", [
              values("qti-default-value", written),
            ]),
            declaration("qti-outcome-declaration", "UPLOAD", "file", "single", []),
          ],
        }),
      );

      assert.deepStrictEqual([...built.outcomes.keys()], ["TIME", "UPLOAD"], written);
      assert.deepStrictEqual(
        built.outcomes.get("TIME")?.defaultValue,
        Option.some({
          baseType: "duration",
          cardinality: "single",
          values: [{ baseType: "duration", value: seconds }],
        }),
        written,
      );
      assert.deepStrictEqual(built.outcomes.get("UPLOAD")?.defaultValue, Option.none());
      assert.deepStrictEqual(built.unsupported, [], written);
    }
  });

  it("holds each template declaration of a modelled type with its default, param-variable and math-variable, and marks only the others, by their type", () => {
    const built = admittedItem(
      item({
        body: [paragraph],
        declarations: [
          el(
            "qti-template-declaration",
            [
              attr("base-type", "integer"),
              attr("cardinality", "single"),
              attr("identifier", "T"),
              attr("param-variable", "true"),
            ],
            [values("qti-default-value", "7")],
          ),
          el(
            "qti-template-declaration",
            [
              attr("base-type", "string"),
              attr("cardinality", "multiple"),
              attr("identifier", "NAMES"),
              attr("math-variable", " 1 "),
              attr("param-variable", "0"),
            ],
            [values("qti-default-value", "a", "b")],
          ),
          el(
            "qti-template-declaration",
            [attr("base-type", "duration"), attr("cardinality", "single"), attr("identifier", "D")],
            [],
          ),
          el(
            "qti-template-declaration",
            [attr("cardinality", "record"), attr("identifier", "R")],
            [],
          ),
          el(
            "qti-template-declaration",
            [attr("base-type", "float"), attr("cardinality", "single"), attr("identifier", "P")],
            [],
          ),
        ],
      }),
    );
    const expected: readonly TemplateDeclaration[] = [
      {
        baseType: "integer",
        cardinality: "single",
        defaultValue: Option.some(integer(7n)),
        identifier: "T",
        mathVariable: false,
        paramVariable: true,
      },
      {
        baseType: "string",
        cardinality: "multiple",
        defaultValue: Option.some({
          baseType: "string",
          cardinality: "multiple",
          values: [
            { baseType: "string", value: "a" },
            { baseType: "string", value: "b" },
          ],
        }),
        identifier: "NAMES",
        mathVariable: true,
        paramVariable: false,
      },
      {
        baseType: "duration",
        cardinality: "single",
        defaultValue: Option.none(),
        identifier: "D",
        mathVariable: false,
        paramVariable: false,
      },
      {
        baseType: "float",
        cardinality: "single",
        defaultValue: Option.none(),
        identifier: "P",
        mathVariable: false,
        paramVariable: false,
      },
    ];

    assert.deepStrictEqual([...built.templates.keys()], ["T", "NAMES", "D", "P"]);
    assert.deepStrictEqual([...built.templates.values()], expected);
    assert.isFalse(built.templated);
    assert.deepStrictEqual(built.unsupported, [
      {
        feature: 'cardinality="record"',
        path: `${root}/qti-template-declaration[4]`,
        shown: "mark",
      },
    ]);
  });

  it("reads an outcome declaration's six reporting attributes as the XSD types them, none when absent", () => {
    const built = admittedItem(
      item({
        body: [paragraph],
        declarations: [
          el(
            "qti-outcome-declaration",
            [
              attr("base-type", "float"),
              attr("cardinality", "single"),
              attr("identifier", "SCORE"),
              attr("view", " candidate\n\ttutor  scorer "),
              attr("interpretation", " Points, out of 10 "),
              attr("long-interpretation", " https://example.org/scales/points\n"),
              attr("normal-maximum", " 10 "),
              attr("normal-minimum", "-1.5"),
              attr("mastery-value", "5"),
            ],
            [],
          ),
          declaration("qti-outcome-declaration", "MAXSCORE", "float", "single", []),
        ],
      }),
    );
    const score = built.outcomes.get("SCORE");
    const bare = built.outcomes.get("MAXSCORE");

    assert.deepStrictEqual(score?.view, Option.some(["candidate", "tutor", "scorer"]));
    assert.deepStrictEqual(score?.interpretation, Option.some(" Points, out of 10 "));
    assert.deepStrictEqual(
      score?.longInterpretation,
      Option.some("https://example.org/scales/points"),
    );
    assert.deepStrictEqual(score?.normalMaximum, Option.some(10));
    assert.deepStrictEqual(score?.normalMinimum, Option.some(-1.5));
    assert.deepStrictEqual(score?.masteryValue, Option.some(5));
    assert.deepStrictEqual(
      [
        bare?.view,
        bare?.interpretation,
        bare?.longInterpretation,
        bare?.normalMaximum,
        bare?.normalMinimum,
        bare?.masteryValue,
      ],
      [Option.none(), Option.none(), Option.none(), Option.none(), Option.none(), Option.none()],
    );
  });

  it("reads a match table's entries and default-value into its outcome's declaration (readings 7 and 8)", () => {
    const built = admittedItem(
      item({
        body: [paragraph],
        declarations: [
          declaration("qti-outcome-declaration", "GRADE", "float", "single", [
            el(
              "qti-match-table",
              [attr("default-value", "0")],
              [
                el(
                  "qti-match-table-entry",
                  [attr("source-value", "1"), attr("target-value", "0.5")],
                  [],
                ),
                el(
                  "qti-match-table-entry",
                  [attr("source-value", " -2 "), attr("target-value", "1e1")],
                  [],
                ),
              ],
            ),
          ]),
        ],
      }),
    );

    assert.deepStrictEqual(
      built.outcomes.get("GRADE")?.lookupTable,
      Option.some({
        defaultValue: Option.some({ baseType: "float", value: 0 }),
        entries: [
          { sourceValue: 1n, targetValue: { baseType: "float", value: 0.5 } },
          { sourceValue: -2n, targetValue: { baseType: "float", value: 10 } },
        ],
        kind: "match",
      }),
    );
  });

  it("reads an interpolation table's include-boundary, true when absent, and no default-value as none", () => {
    const built = admittedItem(
      item({
        body: [paragraph],
        declarations: [
          declaration("qti-outcome-declaration", "BAND", "identifier", "single", [
            el(
              "qti-interpolation-table",
              [],
              [
                el(
                  "qti-interpolation-table-entry",
                  [attr("source-value", "7.5"), attr("target-value", "HIGH")],
                  [],
                ),
                el(
                  "qti-interpolation-table-entry",
                  [
                    attr("include-boundary", "false"),
                    attr("source-value", "2"),
                    attr("target-value", "MID"),
                  ],
                  [],
                ),
                el(
                  "qti-interpolation-table-entry",
                  [
                    attr("include-boundary", "true"),
                    attr("source-value", "0"),
                    attr("target-value", "LOW"),
                  ],
                  [],
                ),
              ],
            ),
          ]),
        ],
      }),
    );

    assert.deepStrictEqual(
      built.outcomes.get("BAND")?.lookupTable,
      Option.some({
        defaultValue: Option.none(),
        entries: [
          {
            includeBoundary: true,
            sourceValue: 7.5,
            targetValue: { baseType: "identifier", value: "HIGH" },
          },
          {
            includeBoundary: false,
            sourceValue: 2,
            targetValue: { baseType: "identifier", value: "MID" },
          },
          {
            includeBoundary: true,
            sourceValue: 0,
            targetValue: { baseType: "identifier", value: "LOW" },
          },
        ],
        kind: "interpolation",
      }),
    );
  });

  it("marks nothing for an outcome declaration's lookup table, which the model reads", () => {
    const built = admittedItem(
      item({
        body: [paragraph],
        declarations: [
          declaration("qti-outcome-declaration", "GRADE", "identifier", "single", [
            values("qti-default-value", "F"),
            el(
              "qti-match-table",
              [attr("default-value", "F")],
              [
                el(
                  "qti-match-table-entry",
                  [attr("source-value", "1"), attr("target-value", "A")],
                  [],
                ),
              ],
            ),
          ]),
          declaration("qti-outcome-declaration", "BAND", "float", "single", [
            el(
              "qti-interpolation-table",
              [attr("default-value", "0")],
              [
                el(
                  "qti-interpolation-table-entry",
                  [attr("source-value", "1"), attr("target-value", "1")],
                  [],
                ),
              ],
            ),
          ]),
        ],
      }),
    );

    assert.deepStrictEqual(built.unsupported, []);
    assert.deepStrictEqual(
      [...built.outcomes.values()].map((outcome) =>
        outcome.lookupTable.pipe(Option.map((table) => table.kind)),
      ),
      [Option.some("match"), Option.some("interpolation")],
    );
  });

  it('reads base="-2147483648", the least xs:int', () => {
    const built = admittedItem(textEntryItem([attr("base", "-2147483648")]));
    const [entry] = childrenOf(built.body[0]);

    assert.strictEqual(entry?.kind === "text-entry" ? entry.base : undefined, -2_147_483_648);
  });

  it("holds expected-length and expected-lines exactly, with no bound", () => {
    const entry = admittedItem(textEntryItem([attr("expected-length", "9223372036854775808")]));
    const extended = admittedItem(
      item({
        body: [
          el(
            "qti-extended-text-interaction",
            [
              attr("expected-lines", "1000000000000000000000000000000"),
              attr("response-identifier", "RESPONSE"),
            ],
            [],
          ),
        ],
        declarations: [declaration("qti-response-declaration", "RESPONSE", "string", "single", [])],
      }),
    );
    const [node] = childrenOf(entry.body[0]);
    const [lines] = extended.body;

    assert.deepStrictEqual(
      node?.kind === "text-entry" ? node.expectedLength : undefined,
      Option.some(9_223_372_036_854_775_808n),
    );
    assert.deepStrictEqual(
      lines?.kind === "extended-text" ? lines.expectedLines : undefined,
      Option.some(10n ** 30n),
    );
  });

  it('binds response-identifier=" RESPONSE " to the declaration RESPONSE', () => {
    const built = admittedItem(
      item({
        body: [
          el(
            "qti-choice-interaction",
            [attr("response-identifier", " RESPONSE ")],
            [choice("A", "Ant"), choice("B", "Bee")],
          ),
        ],
        declarations: [
          declaration("qti-response-declaration", "RESPONSE", "identifier", "single", []),
        ],
      }),
    );

    assert.strictEqual(choiceIn(built.body).response, "RESPONSE");
  });

  it('keys a declaration identifier="\\tRESPONSE\\n" as RESPONSE', () => {
    const built = admittedItem(
      item({
        body: [
          el(
            "qti-choice-interaction",
            [attr("response-identifier", "RESPONSE")],
            [choice("A", "Ant"), choice("B", "Bee")],
          ),
        ],
        declarations: [
          declaration("qti-response-declaration", "\tRESPONSE\n", "identifier", "single", []),
        ],
      }),
    );

    assert.deepStrictEqual([...built.responses.keys()], ["RESPONSE"]);
    assert.strictEqual(built.responses.get("RESPONSE")?.identifier, "RESPONSE");
    assert.strictEqual(choiceIn(built.body).response, "RESPONSE");
  });

  it('reads a qti-simple-choice identifier=" A " as A', () => {
    const built = admittedItem(
      item({
        body: [
          el(
            "qti-choice-interaction",
            [attr("response-identifier", "RESPONSE")],
            [choice(" A ", "Ant"), choice("B", "Bee")],
          ),
        ],
        declarations: [
          declaration("qti-response-declaration", "RESPONSE", "identifier", "single", []),
        ],
      }),
    );

    assert.deepStrictEqual(
      choiceIn(built.body).choices.map((option) => option.identifier),
      ["A", "B"],
    );
  });

  it('reads a root identifier=" item-1 " as item-1', () => {
    const built = admittedItem(
      doc(
        "items/test.xml",
        el(
          root,
          [attr("identifier", " item-1 "), attr("time-dependent", "false"), attr("title", "Item")],
          [el("qti-item-body", [], [paragraph])],
        ),
      ),
    );

    assert.strictEqual(built.identifier, "item-1");
  });

  it("reads a root title holding a tab and a line feed with each a space", () => {
    // XSD gives the root's `title` `xs:normalizedString`, whose whiteSpace is `replace`: "All
    // occurrences of #x9 (tab), #xA (line feed) and #xD (carriage return) are replaced with #x20
    // (space)" (XML Schema 1.0 Part 2, 4.3.6). A character reference, such as `&#10;`, writes
    // them past the parser's attribute-value normalization.
    const built = admittedItem(
      doc(
        "items/test.xml",
        el(
          root,
          [
            attr("identifier", "item"),
            attr("time-dependent", "false"),
            attr("title", "Line\tone\nLine two\r"),
          ],
          [el("qti-item-body", [], [paragraph])],
        ),
      ),
    );

    assert.strictEqual(built.title, "Line one Line two ");
  });

  it.effect("records 8,000 unsupported declarations, its blocks growing linearly with them", () =>
    Effect.gen(function* recordsLinearly() {
      assert.lengthOf(admittedItem(templated(fewerDeclarations)).unsupported, fewerDeclarations);
      assert.lengthOf(
        admittedItem(templated(fewerDeclarations * growthFactor)).unsupported,
        fewerDeclarations * growthFactor,
      );

      const growth = yield* blockGrowth("records", fewerDeclarations);
      assert.isBelow(
        growth,
        blockGrowthLimit,
        `8 times the declarations ran ${growth.toFixed(1)} times the blocks`,
      );
    }),
  );

  it.effect(
    "binds 8,000 Text Entries to 8,000 declarations, its blocks growing linearly with them",
    () =>
      Effect.gen(function* bindsLinearly() {
        const built = admittedItem(textEntries(fewerDeclarations * growthFactor));
        const entries = childrenOf(built.body[0]);
        assert.strictEqual(entries.length, fewerDeclarations * growthFactor);
        assert.isTrue(entries.every((node) => node.kind === "text-entry"));
        assert.deepStrictEqual(built.unsupported, []);
        assert.deepStrictEqual(admittedItem(textEntries(fewerDeclarations)).unsupported, []);

        const growth = yield* blockGrowth("binds", fewerDeclarations);
        assert.isBelow(
          growth,
          blockGrowthLimit,
          `8 times the interactions ran ${growth.toFixed(1)} times the blocks`,
        );
      }),
  );

  it.effect("control: a quadratic binding of the same interactions fails the growth check", () =>
    Effect.gen(function* quadraticBindingControl() {
      const bound = bindQuadratically(textEntries(fewerDeclarations));
      assert.strictEqual(bound.length, fewerDeclarations);
      assert.isTrue(bound.every((found) => found !== undefined));

      const growth = yield* blockGrowth("quadraticBinding", fewerDeclarations);
      assert.isAtLeast(
        growth,
        blockGrowthLimit,
        `8 times the interactions ran ${growth.toFixed(1)} times the blocks`,
      );
    }),
  );

  it.effect("control: a quadratic dedupe of the same features fails the growth check", () =>
    Effect.gen(function* quadraticDedupeControl() {
      const features = admittedItem(templated(fewerDeclarations)).unsupported;
      assert.deepStrictEqual(dedupeQuadratically([...features, ...features]), features);

      const growth = yield* blockGrowth("quadraticDedupe", fewerDeclarations);
      assert.isAtLeast(
        growth,
        blockGrowthLimit,
        `8 times the features ran ${growth.toFixed(1)} times the blocks`,
      );
    }),
  );
});
