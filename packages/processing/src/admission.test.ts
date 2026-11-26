import { assert, describe, it } from "@effect/vitest";
import { admit, alwaysCodes, validatedCodes } from "#processing/admission.ts";
import type { AdmissionCode } from "#processing/admission.ts";
import { compileItemWith } from "#processing/compile/document.ts";
import { gradeAnswerWith, proofOf } from "#processing/grade.ts";
import { customOperators } from "#processing/operators/custom.ts";
import { logicOperators } from "#processing/operators/logic.ts";
import { valuesOperators } from "#processing/operators/values.ts";
import type { CompiledItem } from "#processing/program.ts";
import { processingSeed } from "#processing/stream.ts";
import { element } from "#processing/test/run.ts";
import { container, isText, nullOf, recordOf, single } from "#processing/value.ts";
import type { BaseType, Text, Value } from "#processing/value.ts";
import type { XmlElement } from "#processing/xml.ts";

const table = Object.freeze({ ...customOperators, ...logicOperators, ...valuesOperators });

/**
 * A text the tests know is not empty.
 *
 * @param written - The text.
 * @returns It, as a Text.
 */
const word = (written: string): Text => (isText(written) ? written : assert.fail("empty text"));

/**
 * A response declaration.
 *
 * @param identifier - The response.
 * @param cardinality - Its cardinality.
 * @param base - Its base type.
 * @returns The element.
 */
const declared = (identifier: string, cardinality: string, base: BaseType): XmlElement =>
  element("qti-response-declaration", { "base-type": base, cardinality, identifier }, []);

/**
 * A record response declaration.
 *
 * @param identifier - The response.
 * @returns The element.
 */
const declaredRecord = (identifier: string): XmlElement =>
  element("qti-response-declaration", { cardinality: "record", identifier }, []);

/**
 * An outcome or template declaration of a multiple identifier.
 *
 * @param kind - The declaration element.
 * @param identifier - The variable.
 * @returns The element.
 */
const gateVariable = (kind: string, identifier: string): XmlElement =>
  element(kind, { "base-type": "identifier", cardinality: "multiple", identifier }, []);

/**
 * Compile an item of declarations and a body.
 *
 * @param declarations - The declarations.
 * @param body - The body's children.
 * @returns The compiled item.
 */
const itemOf = (declarations: readonly XmlElement[], body: readonly XmlElement[]): CompiledItem => {
  const compiled = compileItemWith(
    element("qti-assessment-item", { adaptive: "false", identifier: "q" }, [
      ...declarations,
      element("qti-item-body", {}, body),
    ]),
    { sha256: "2".repeat(64) },
    table,
  );

  return compiled.ok ? compiled.value : assert.fail(compiled.refusal.detail);
};

/**
 * A choice-like child.
 *
 * @param kind - Its element.
 * @param identifier - Its identifier.
 * @param attributes - Its other attributes.
 * @returns The element.
 */
const child = (
  kind: string,
  identifier: string,
  attributes: Readonly<Record<string, string>>,
): XmlElement => element(kind, { identifier, ...attributes }, []);

/**
 * An image of a size.
 *
 * @param width - Its width.
 * @param height - Its height.
 * @returns The element.
 */
const image = (width: number, height: number): XmlElement =>
  element("img", { height: String(height), src: "a.png", width: String(width) }, []);

/**
 * The codes an admission gives under values in force, in order.
 *
 * @param item - The item.
 * @param responses - The posted responses.
 * @param validate - Validate-responses.
 * @param held - The values in force.
 * @returns The codes.
 */
const codesHeld = (
  item: CompiledItem,
  responses: ReadonlyMap<string, Value>,
  validate: boolean,
  held: ReadonlyMap<string, Value>,
): readonly AdmissionCode[] =>
  admit(item, responses, held, validate).reasons.map((reason) => reason.code);

/**
 * The codes an admission gives, in order.
 *
 * @param item - The item.
 * @param responses - The posted responses.
 * @param validate - Validate-responses.
 * @returns The codes.
 */
const codes = (
  item: CompiledItem,
  responses: ReadonlyMap<string, Value>,
  validate: boolean,
): readonly AdmissionCode[] => codesHeld(item, responses, validate, new Map());

/**
 * A multiple of identifiers.
 *
 * @param members - The identifiers.
 * @returns The value.
 */
const identifiers = (members: readonly string[]): Value =>
  container("multiple", "identifier", members.map(word));

/**
 * A multiple of directed pairs.
 *
 * @param members - Each source and target.
 * @returns The value.
 */
const directed = (members: readonly (readonly [string, string])[]): Value =>
  container(
    "multiple",
    "directedPair",
    members.map(([source, target]) => ({ source: word(source), target: word(target) })),
  );

/**
 * A multiple of pairs.
 *
 * @param members - Each pair, as given.
 * @returns The value.
 */
const pairs = (members: readonly (readonly [string, string])[]): Value =>
  container(
    "multiple",
    "pair",
    members.map(([first, second]) => ({ first: word(first), second: word(second) })),
  );

/**
 * A multiple of points.
 *
 * @param members - Each x and y.
 * @returns The value.
 */
const points = (members: readonly (readonly [bigint, bigint])[]): Value =>
  container(
    "multiple",
    "point",
    members.map(([x, y]) => ({ x, y })),
  );

/**
 * Responses of one identifier.
 *
 * @param value - The value of `R`.
 * @returns The map.
 */
const posted = (value: Value): ReadonlyMap<string, Value> => new Map([["R", value]]);

/**
 * An Order interaction of choices A, B and C.
 *
 * @param attributes - Its attributes.
 * @returns The item.
 */
const orderItem = (attributes: Readonly<Record<string, string>>): CompiledItem =>
  itemOf(
    [declared("R", "ordered", "identifier")],
    [
      element("qti-order-interaction", { ...attributes, "response-identifier": "R" }, [
        child("qti-simple-choice", "A", {}),
        child("qti-simple-choice", "B", {}),
        child("qti-simple-choice", "C", {}),
      ]),
    ],
  );

/**
 * A Graphic Order interaction of areas H1, H2 and H3.
 *
 * @param attributes - Its attributes.
 * @returns The item.
 */
const graphicOrderItem = (attributes: Readonly<Record<string, string>>): CompiledItem =>
  itemOf(
    [declared("R", "ordered", "identifier")],
    [
      element("qti-graphic-order-interaction", { ...attributes, "response-identifier": "R" }, [
        image(10, 10),
        child("qti-hotspot-choice", "H1", {}),
        child("qti-hotspot-choice", "H2", {}),
        child("qti-hotspot-choice", "H3", {}),
      ]),
    ],
  );

/**
 * An ordered of identifiers.
 *
 * @param members - The identifiers.
 * @returns The value.
 */
const orderedOf = (members: readonly string[]): Value =>
  container("ordered", "identifier", members.map(word));

/**
 * A slider of a base type.
 *
 * @param base - Its response's base type.
 * @param attributes - Its attributes.
 * @returns The item.
 */
const sliderItem = (base: BaseType, attributes: Readonly<Record<string, string>>): CompiledItem =>
  itemOf(
    [declared("R", "single", base)],
    [element("qti-slider-interaction", { ...attributes, "response-identifier": "R" }, [])],
  );

describe("the closed roster", () => {
  it("holds 60 codes once each, tier (a)'s 40 then tier (b)'s 20, as plate's roster orders them (reading `response-limits`)", () => {
    const all = [...alwaysCodes, ...validatedCodes];
    assert.strictEqual(alwaysCodes.length, 40);
    assert.strictEqual(validatedCodes.length, 20);
    assert.strictEqual(new Set(all).size, all.length);
  });
});

describe("choice, hottext and hotspot picks", () => {
  const item = itemOf(
    [declared("R", "multiple", "identifier"), gateVariable("qti-template-declaration", "T")],
    [
      element(
        "qti-choice-interaction",
        { "max-choices": "2", "min-choices": "2", "response-identifier": "R" },
        [
          child("qti-simple-choice", "A", {}),
          child("qti-simple-choice", "B", {}),
          child("qti-simple-choice", "C", { "template-identifier": "T" }),
        ],
      ),
    ],
  );

  it("refuses a pick no presented choice carries or given twice, and more than max-choices, whatever validate-responses says (§5.21, §7.19.7)", () => {
    assert.deepStrictEqual(codes(item, posted(identifiers(["A", "D", "A"])), false), [
      "unknownChoice",
      "atMost",
    ]);

    const result = admit(item, posted(identifiers(["A", "D", "A"])), new Map(), false);
    assert.deepStrictEqual(result.counts, [{ name: "n", ord: 2n, value: 2n }]);
    assert.deepStrictEqual(
      result.reasons.map((reason) => reason.ord),
      [1n, 2n],
    );
  });

  it("hides a choice its template gate closes, and presents it once the template value names it (§5.148)", () => {
    assert.deepStrictEqual(codes(item, posted(identifiers(["A", "C"])), false), ["unknownChoice"]);
    assert.deepStrictEqual(
      codesHeld(item, posted(identifiers(["A", "C"])), false, new Map([["T", identifiers(["C"])]])),
      [],
    );
  });

  it("refuses fewer than min-choices only under validate-responses (tier b)", () => {
    assert.deepStrictEqual(codes(item, posted(identifiers(["A"])), false), []);
    assert.deepStrictEqual(codes(item, posted(identifiers(["A"])), true), ["atLeast"]);
  });

  it("takes max-choices 1 where unwritten", () => {
    const hottext = itemOf(
      [declared("R", "multiple", "identifier")],
      [
        element("qti-hottext-interaction", { "response-identifier": "R" }, [
          child("qti-hottext", "A", {}),
          child("qti-hottext", "B", {}),
        ]),
      ],
    );
    assert.deepStrictEqual(codes(hottext, posted(identifiers(["A", "B"])), false), ["atMost"]);
  });
});

describe("hidden interactions", () => {
  it("judge nothing in content the values in force close, and name their response as hidden", () => {
    const item = itemOf(
      [declared("R", "multiple", "identifier"), gateVariable("qti-outcome-declaration", "FB")],
      [
        element(
          "qti-feedback-block",
          { identifier: "x", "outcome-identifier": "FB", "show-hide": "show" },
          [
            element("qti-choice-interaction", { "response-identifier": "R" }, [
              child("qti-simple-choice", "A", {}),
            ]),
          ],
        ),
      ],
    );

    const closed = admit(item, posted(identifiers(["Z"])), new Map(), true);
    assert.deepStrictEqual(closed.reasons, []);
    assert.deepStrictEqual(closed.hidden, ["R"]);

    const open = admit(
      item,
      posted(identifiers(["Z"])),
      new Map([["FB", identifiers(["x"])]]),
      true,
    );
    assert.deepStrictEqual(
      open.reasons.map((reason) => reason.code),
      ["unknownChoice"],
    );
    assert.deepStrictEqual(open.hidden, []);
  });
});

describe("inline choice", () => {
  it("refuses an unknown choice, and no choice where it is required (default false), under validate-responses", () => {
    const item = itemOf(
      [declared("R", "single", "identifier")],
      [
        element("qti-inline-choice-interaction", { required: "true", "response-identifier": "R" }, [
          child("qti-inline-choice", "A", {}),
        ]),
      ],
    );
    assert.deepStrictEqual(codes(item, posted(single("identifier", word("B"))), false), [
      "unknownChoice",
    ]);
    assert.deepStrictEqual(
      codes(item, posted(nullOf({ base: "identifier", cardinality: "single" })), true),
      ["atLeast"],
    );
  });
});

describe("match", () => {
  const item = itemOf(
    [declared("R", "multiple", "directedPair")],
    [
      element(
        "qti-match-interaction",
        { "max-associations": "3", "min-associations": "6", "response-identifier": "R" },
        [
          element("qti-simple-match-set", {}, [
            child("qti-simple-associable-choice", "S1", { "match-group": "T2", "match-max": "1" }),
            child("qti-simple-associable-choice", "S2", { "match-max": "0" }),
          ]),
          element("qti-simple-match-set", {}, [
            child("qti-simple-associable-choice", "T1", { "match-group": "S1", "match-max": "0" }),
            child("qti-simple-associable-choice", "T2", { "match-max": "0", "match-min": "1" }),
          ]),
        ],
      ),
    ],
  );

  const given = directed([
    ["S1", "T1"],
    ["S1", "T1"],
    ["X", "T1"],
    ["S2", "T1"],
  ]);

  it("refuses an unknown choice, a pair given twice, a choice past match-max, a pair outside a group, and more than max-associations (tier a)", () => {
    assert.deepStrictEqual(codes(item, posted(given), false), [
      "unknownChoice",
      "matchRepeated",
      "matchChoiceAtMost",
      "matchNotInSourceGroup",
      "matchNotInTargetGroup",
      "atMost",
    ]);
  });

  it("refuses fewer than min-associations and a choice short of match-min under validate-responses (tier b)", () => {
    assert.deepStrictEqual(codes(item, posted(given), true).slice(-2), [
      "atLeast",
      "matchChoiceAtLeast",
    ]);

    const words = admit(item, posted(given), new Map(), false).words.filter(
      (each) => each.ord === 4n,
    );
    assert.deepStrictEqual(
      words.map((each) => [each.name, each.value]),
      [
        ["subject", "S1"],
        ["other", "T1"],
        ["group", "T2"],
      ],
    );
  });
});

describe("gap match", () => {
  it("refuses a gap filled twice, a choice past match-max, pairs outside groups, too many pairs; a required gap empty and a choice short of match-min under validate-responses", () => {
    const item = itemOf(
      [declared("R", "multiple", "directedPair")],
      [
        element(
          "qti-gap-match-interaction",
          { "max-associations": "2", "response-identifier": "R" },
          [
            child("qti-gap-text", "W1", { "match-group": "G2", "match-max": "1" }),
            child("qti-gap-text", "W2", { "match-max": "0", "match-min": "2" }),
            element("p", {}, [
              child("qti-gap", "G1", {}),
              child("qti-gap", "G2", { "match-group": "W1" }),
              child("qti-gap", "G3", { required: "true" }),
            ]),
          ],
        ),
      ],
    );

    const given = directed([
      ["W1", "G1"],
      ["W2", "G1"],
      ["W1", "G2"],
    ]);
    assert.deepStrictEqual(codes(item, posted(given), false), [
      "gapMatchGapFull",
      "gapMatchChoiceAtMost",
      "gapMatchNotInChoiceGroup",
      "atMost",
    ]);
    assert.deepStrictEqual(codes(item, posted(directed([["W2", "G2"]])), true), [
      "gapMatchNotInGapGroup",
      "gapMatchGapRequired",
      "gapMatchChoiceAtLeast",
    ]);
  });
});

describe("order", () => {
  it("refuses an unknown choice and one placed twice, and all of them short where min-choices is unwritten (§5.97)", () => {
    assert.deepStrictEqual(codes(orderItem({}), posted(orderedOf(["A", "A", "Z"])), true), [
      "unknownChoice",
      "orderRepeated",
      "orderAll",
    ]);
  });

  it("bounds the choices placed by min-choices and max-choices where min-choices is written", () => {
    assert.deepStrictEqual(
      codes(
        orderItem({ "max-choices": "1", "min-choices": "1" }),
        posted(orderedOf(["A", "B"])),
        false,
      ),
      ["orderAtMost"],
    );
    assert.deepStrictEqual(
      codes(orderItem({ "min-choices": "2" }), posted(orderedOf(["A"])), true),
      ["orderAtLeast"],
    );
  });
});

describe("associate", () => {
  it("counts each pair once in either order, and refuses unknown choices, a choice with itself, a repeat, a choice past match-max, a pair outside a group, too many pairs; too few under validate-responses", () => {
    const item = itemOf(
      [declared("R", "multiple", "pair")],
      [
        element(
          "qti-associate-interaction",
          { "max-associations": "1", "min-associations": "9", "response-identifier": "R" },
          [
            child("qti-simple-associable-choice", "A", { "match-group": "B", "match-max": "1" }),
            child("qti-simple-associable-choice", "B", { "match-max": "0", "match-min": "3" }),
            child("qti-simple-associable-choice", "C", { "match-max": "0" }),
          ],
        ),
      ],
    );

    const given = pairs([
      ["A", "B"],
      ["A", "C"],
      ["B", "A"],
      ["D", "C"],
      ["C", "C"],
    ]);
    assert.deepStrictEqual(codes(item, posted(given), true), [
      "associateUnknown",
      "associateItself",
      "associateRepeated",
      "associateChoiceAtMost",
      "associateOutsideGroup",
      "associateAtMost",
      "associateAtLeast",
      "associateChoiceAtLeast",
    ]);
  });
});

describe("graphic associate", () => {
  it("refuses unknown areas, an area with itself, a pair given twice, an area past match-max, a pair outside a group, too many pairs; too few under validate-responses", () => {
    const item = itemOf(
      [declared("R", "multiple", "pair")],
      [
        element(
          "qti-graphic-associate-interaction",
          { "max-associations": "2", "min-associations": "9", "response-identifier": "R" },
          [
            image(100, 100),
            child("qti-associable-hotspot", "H1", {
              "match-group": "H2",
              "match-max": "1",
            }),
            child("qti-associable-hotspot", "H2", {
              "match-max": "0",
            }),
            child("qti-associable-hotspot", "H3", {
              "match-max": "0",
              "match-min": "9",
            }),
          ],
        ),
      ],
    );

    const given = pairs([
      ["H1", "H3"],
      ["H3", "H1"],
      ["H2", "H2"],
      ["X", "H2"],
    ]);
    assert.deepStrictEqual(codes(item, posted(given), true), [
      "graphicAssociateUnknown",
      "graphicAssociateSelf",
      "graphicAssociateTwice",
      "graphicAssociateMatchMax",
      "graphicAssociateOutside",
      "graphicAssociateOutside",
      "graphicAssociateAtMost",
      "graphicAssociateAtLeast",
      "graphicAssociateMatchMin",
    ]);
  });
});

describe("graphic gap match", () => {
  it("refuses an unknown choice or area, an area or choice past match-max, pairs outside groups, too many pairs; too few under validate-responses", () => {
    const item = itemOf(
      [declared("R", "multiple", "directedPair")],
      [
        element(
          "qti-graphic-gap-match-interaction",
          { "max-associations": "2", "min-associations": "9", "response-identifier": "R" },
          [
            image(100, 100),
            child("qti-gap-img", "W1", { "match-group": "A2", "match-max": "1" }),
            child("qti-gap-img", "W2", { "match-max": "0", "match-min": "9" }),
            child("qti-associable-hotspot", "A1", {
              "match-max": "1",
            }),
            child("qti-associable-hotspot", "A2", {
              "match-group": "W1",
              "match-max": "0",
            }),
            child("qti-associable-hotspot", "A3", {
              "match-max": "0",
              "match-min": "9",
            }),
          ],
        ),
      ],
    );

    const given = directed([
      ["W1", "A1"],
      ["W1", "A1"],
      ["W2", "A2"],
      ["W9", "A1"],
    ]);
    assert.deepStrictEqual(codes(item, posted(given), true), [
      "unknownChoice",
      "graphicGapMatchAreaAtMost",
      "graphicGapMatchChoiceAtMost",
      "graphicGapMatchNotInChoiceGroup",
      "graphicGapMatchNotInAreaGroup",
      "atMost",
      "atLeast",
      "graphicGapMatchAreaAtLeast",
      "graphicGapMatchChoiceAtLeast",
    ]);
  });

  it("models no Graphic Gap Match without an image (the SQL grader's notice)", () => {
    const item = itemOf(
      [declared("R", "multiple", "directedPair")],
      [
        element("qti-graphic-gap-match-interaction", { "response-identifier": "R" }, [
          child("qti-gap-img", "W1", {}),
        ]),
      ],
    );
    assert.deepStrictEqual(item.interactions, []);
  });
});

describe("graphic order", () => {
  it("refuses an unknown area and one given twice, past its bounds, and short of them under validate-responses", () => {
    assert.deepStrictEqual(
      codes(
        graphicOrderItem({ "max-choices": "2", "min-choices": "1" }),
        posted(orderedOf(["H1", "H1", "X"])),
        false,
      ),
      ["graphicOrderUnknown", "graphicOrderTwice", "graphicOrderAtMost"],
    );
    assert.deepStrictEqual(
      codes(graphicOrderItem({ "min-choices": "2" }), posted(orderedOf(["H1"])), true),
      ["graphicOrderAtLeast"],
    );
  });
});

describe("position object", () => {
  it("refuses more than max-choices (default 1), and a point off its stage and fewer than min-choices under validate-responses", () => {
    const item = itemOf(
      [declared("R", "multiple", "point")],
      [
        element("qti-position-object-stage", {}, [
          image(100, 50),
          element(
            "qti-position-object-interaction",
            { "min-choices": "3", "response-identifier": "R" },
            [image(10, 10)],
          ),
        ]),
      ],
    );

    const result = admit(
      item,
      posted(
        points([
          [5n, 5n],
          [200n, 5n],
        ]),
      ),
      new Map(),
      true,
    );
    assert.deepStrictEqual(
      result.reasons.map((reason) => reason.code),
      ["positionObjectAtMost", "positionObjectOffStage", "positionObjectAtLeast"],
    );
    assert.deepStrictEqual(result.numbers, [
      { name: "width", ord: 2n, value: 100 },
      { name: "height", ord: 2n, value: 50 },
    ]);
  });
});

describe("select point", () => {
  it("refuses a coordinate below 0 always and one past the image under validate-responses, each point's x before its y", () => {
    const item = itemOf(
      [declared("R", "single", "point")],
      [element("qti-select-point-interaction", { "response-identifier": "R" }, [image(100, 50)])],
    );

    const point = single("point", { x: -1n, y: 60n });
    assert.deepStrictEqual(codes(item, posted(point), false), ["selectPointBelowZero"]);

    const result = admit(item, posted(point), new Map(), true);
    assert.deepStrictEqual(
      result.reasons.map((reason) => reason.code),
      ["selectPointBelowZero", "selectPointBeyond"],
    );
    assert.deepStrictEqual(
      result.counts.filter((each) => each.ord === 2n),
      [
        { name: "at", ord: 2n, value: 1n },
        { name: "extent", ord: 2n, value: 50n },
      ],
    );
  });

  it("refuses more than max-choices and fewer than min-choices of a multiple response", () => {
    const item = itemOf(
      [declared("R", "multiple", "point")],
      [
        element(
          "qti-select-point-interaction",
          { "max-choices": "1", "min-choices": "3", "response-identifier": "R" },
          [image(100, 50)],
        ),
      ],
    );
    assert.deepStrictEqual(
      codes(
        item,
        posted(
          points([
            [1n, 1n],
            [2n, 2n],
          ]),
        ),
        true,
      ),
      ["selectPointAtMost", "selectPointAtLeast"],
    );
  });
});

describe("slider", () => {
  it("refuses a value below or above its range, an integer slider's bounds outward to whole numbers, and one off its step", () => {
    assert.deepStrictEqual(
      codes(
        sliderItem("integer", { "lower-bound": "0.5", "upper-bound": "9.5" }),
        posted(single("integer", 11n)),
        false,
      ),
      ["sliderAbove"],
    );
    assert.deepStrictEqual(
      codes(
        sliderItem("integer", { "lower-bound": "0.5", "upper-bound": "9.5" }),
        posted(single("integer", 0n)),
        false,
      ),
      [],
    );
    assert.deepStrictEqual(
      codes(
        sliderItem("float", { "lower-bound": "0", "upper-bound": "10" }),
        posted(single("float", -1)),
        false,
      ),
      ["sliderBelow"],
    );
    assert.deepStrictEqual(
      codes(
        sliderItem("float", { "lower-bound": "0", step: "2", "upper-bound": "10" }),
        posted(single("float", 3)),
        false,
      ),
      ["sliderOffStep"],
    );
  });

  it("models no slider with an infinite bound", () => {
    assert.deepStrictEqual(
      sliderItem("float", { "lower-bound": "-INF", "upper-bound": "10" }).interactions,
      [],
    );
  });
});

describe("media", () => {
  const item = itemOf(
    [declared("R", "single", "integer")],
    [
      element(
        "qti-media-interaction",
        { "max-plays": "2", "min-plays": "1", "response-identifier": "R" },
        [],
      ),
    ],
  );

  it("refuses a negative count alone, more than max-plays, and fewer than min-plays under validate-responses", () => {
    assert.deepStrictEqual(codes(item, posted(single("integer", -1n)), true), ["mediaNegative"]);
    assert.deepStrictEqual(codes(item, posted(single("integer", 3n)), true), ["mediaAtMost"]);
    assert.deepStrictEqual(
      codes(item, posted(nullOf({ base: "integer", cardinality: "single" })), true),
      ["mediaAtLeast"],
    );
  });
});

describe("text entry and extended text", () => {
  it("refuses more than max-strings always, fewer than min-strings and a string its pattern-mask refuses under validate-responses (§5.48.4, §5.48.7)", () => {
    const item = itemOf(
      [declared("R", "multiple", "string")],
      [
        element(
          "qti-extended-text-interaction",
          {
            "max-strings": "1",
            "min-strings": "3",
            "pattern-mask": "[a-z]+",
            "response-identifier": "R",
          },
          [],
        ),
      ],
    );

    const given = container("multiple", "string", [word("ab"), word("A1")]);
    assert.deepStrictEqual(codes(item, posted(given), false), ["atMostStrings"]);
    assert.deepStrictEqual(codes(item, posted(given), true), [
      "atMostStrings",
      "atLeastStrings",
      "patternMismatch",
    ]);
  });

  it("matches a mask anchored at both ends, a number by its canonical text, a record's stringValue, and an xhtml value by its text (reading `xhtml-pattern-mask-text`)", () => {
    const entry = itemOf(
      [declared("R", "single", "float")],
      [
        element(
          "qti-text-entry-interaction",
          { "pattern-mask": "[0-9]+\\.[0-9]", "response-identifier": "R" },
          [],
        ),
      ],
    );
    assert.deepStrictEqual(codes(entry, posted(single("float", 2.5)), true), []);
    assert.deepStrictEqual(codes(entry, posted(single("float", 3)), true), ["patternMismatch"]);
    assert.deepStrictEqual(codes(entry, posted(single("float", 12.5)), true), []);

    const record = itemOf(
      [declaredRecord("R")],
      [
        element(
          "qti-text-entry-interaction",
          { "pattern-mask": "[a-z]+", "response-identifier": "R" },
          [],
        ),
      ],
    );
    assert.deepStrictEqual(
      codes(
        record,
        posted(recordOf([{ name: "stringValue", value: single("string", word("A")) }])),
        true,
      ),
      ["patternMismatch"],
    );

    const xhtml = itemOf(
      [declared("R", "single", "string")],
      [
        element(
          "qti-extended-text-interaction",
          { format: "xhtml", "pattern-mask": "[a-z]+", "response-identifier": "R" },
          [],
        ),
      ],
    );
    assert.deepStrictEqual(codes(xhtml, posted(single("string", word("<p>abc</p>"))), true), []);
  });

  it("gives no reason for a mask that is no Appendix F expression, which QTI gives no meaning", () => {
    const item = itemOf(
      [declared("R", "single", "string")],
      [
        element(
          "qti-text-entry-interaction",
          { "pattern-mask": "(", "response-identifier": "R" },
          [],
        ),
      ],
    );
    assert.deepStrictEqual(codes(item, posted(single("string", word("x"))), true), []);
  });
});

describe("end attempt", () => {
  it("carries count-attempt, true where unwritten (reading `end-attempt-count`)", () => {
    const item = itemOf(
      [declared("R", "single", "boolean"), declared("S", "single", "boolean")],
      [
        element("qti-end-attempt-interaction", { "response-identifier": "R", title: "end" }, []),
        element(
          "qti-end-attempt-interaction",
          { "count-attempt": "false", "response-identifier": "S", title: "hint" },
          [],
        ),
      ],
    );
    assert.deepStrictEqual(
      item.interactions.map((interaction) =>
        interaction.kind === "end-attempt" ? interaction.countAttempt : undefined,
      ),
      [true, false],
    );
  });
});

describe("an answer's grade", () => {
  const session = {
    duration: 0,
    numAttempts: 0n,
    prior: { kind: "none" },
    seed: processingSeed("d", "p", "q"),
    take: { correct: new Map(), defaults: new Map(), templates: new Map() },
  } as const;

  it("is a refusal, still a grade, where admission refuses the answer (G5 §5)", () => {
    const item = itemOf(
      [declared("R", "single", "identifier")],
      [
        element("qti-choice-interaction", { "response-identifier": "R" }, [
          child("qti-simple-choice", "A", {}),
        ]),
      ],
    );

    const graded = gradeAnswerWith(table, {
      context: new Map(),
      evaluations: new Map(),
      item,
      readAt: { microseconds: 1n },
      responses: {
        at: { microseconds: 1n },
        kind: "save",
        values: posted(single("identifier", word("Z"))),
      },
      session,
      validate: false,
    });
    assert.isTrue("result" in graded && graded.result.kind === "refused");
  });

  it("reads a hidden response as NULL, and a grade names the responses it graded, a posted answer's with no save and no instant", () => {
    const item = itemOf(
      [
        declared("R", "single", "identifier"),
        gateVariable("qti-outcome-declaration", "FB"),
        element(
          "qti-outcome-declaration",
          { "base-type": "identifier", cardinality: "single", identifier: "COPY" },
          [],
        ),
        element("qti-response-processing", {}, [
          element("qti-set-outcome-value", { identifier: "COPY" }, [
            element("qti-variable", { identifier: "R" }, []),
          ]),
        ]),
      ],
      [
        element("qti-feedback-block", { identifier: "x", "outcome-identifier": "FB" }, [
          element("qti-choice-interaction", { "response-identifier": "R" }, [
            child("qti-simple-choice", "A", {}),
          ]),
        ]),
      ],
    );

    const graded = gradeAnswerWith(table, {
      context: new Map(),
      evaluations: new Map(),
      item,
      readAt: { microseconds: 1n },
      responses: { kind: "posted", values: posted(single("identifier", word("A"))) },
      session,
      validate: true,
    });
    assert.deepStrictEqual(
      "responses" in graded ? graded.responses.get("R") : undefined,
      nullOf({ base: "identifier", cardinality: "single" }),
    );
    assert.deepStrictEqual(
      "responses" in graded ? proofOf(graded).responses[0]?.saved : undefined,
      { kind: "posted" },
    );
    assert.deepStrictEqual(
      "result" in graded && graded.result.kind === "done"
        ? graded.result.outcomes.get("COPY")
        : undefined,
      nullOf({ base: "identifier", cardinality: "single" }),
    );
  });
});
