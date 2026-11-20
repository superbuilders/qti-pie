import { assert, describe, it } from "@effect/vitest";
import { Effect, Option, Result } from "effect";
import { decodeValue, entryName, isPosted } from "#plate/form/encoding.ts";
import type { ChoiceInteraction } from "#plate/interactions/choice.ts";
import { isInteraction, regionsOf } from "#plate/model/interactions.ts";
import type {
  AreaMapping,
  BodyNode,
  Item,
  ResponseDeclaration,
  UnsupportedFeature,
} from "#plate/model/item.ts";
import type { ItemRecord } from "#plate/model/record.ts";
import { format } from "#plate/model/values.ts";
import type { Value } from "#plate/model/values.ts";
import { readCorpusFile } from "#plate/test/corpus.ts";
import { score } from "#plate/test/score.ts";
import { admitted } from "#plate/test/admitted.ts";
import { acceptedItem } from "#plate/validate/verdict.ts";
import type { Accepted } from "#plate/validate/verdict.ts";

/**
 * Each case opens one corpus item and scores it at most three times, which takes well under a
 * second here; the bound leaves room for a slow machine without letting a hung read stall the
 * suite.
 */
const corpusTimeoutMs = 60_000;

/**
 * The response every built-in template scores.
 */
const response = "RESPONSE";

/**
 * The instance token the text responses post under.
 */
const instance = "witness";

/**
 * The `ccPackage` items whose processing is the `CC2_match` template, by corpus path.
 */
const cc2MatchItems = [
  "qtiv3-examples/packaging/ccPackage/testitems/QUE_102010.xml",
  "qtiv3-examples/packaging/ccPackage/testitems/QUE_102012.xml",
  "qtiv3-examples/packaging/ccPackage/testitems/QUE_102013.xml",
  "qtiv3-examples/packaging/ccPackage/testitems/QUE_104045.xml",
  "qtiv3-examples/packaging/ccPackage/testitems/QUE_104047.xml",
  "qtiv3-examples/packaging/ccPackage/testitems/QUE_104048.xml",
  "qtiv3-examples/packaging/ccPackage/testitems/QUE_104049.xml",
  "qtiv3-examples/packaging/ccPackage/testitems/QUE_104051.xml",
] as const;

/**
 * The `ccPackage` items whose processing is the `CC2_map_response` template, by corpus path.
 */
const cc2MapResponseItems = [
  "qtiv3-examples/packaging/ccPackage/testitems/QUE_102011.xml",
  "qtiv3-examples/packaging/ccPackage/testitems/QUE_102015.xml",
] as const;

/**
 * The point items whose processing is the `map_response_point` template, which the engine runs, by
 * corpus path.
 */
const pointItems = [
  "QTI3_BPIG_Examples/BPIG_22April.zip.d/items/position-object-1.xml",
  "QTI3_BPIG_Examples/BPIG_22April.zip.d/items/select-point-item_1.xml",
  "QTI3_BPIG_Examples/items/position-object-1.xml",
  "QTI3_BPIG_Examples/items/select-point-item_1.xml",
  "qtiv3-examples/packaging/items/items.zip.d/position_object.xml",
  "qtiv3-examples/packaging/items/items.zip.d/select_point.xml",
  "qtiv3-examples/packaging/items/position_object.xml",
  "qtiv3-examples/packaging/items/select_point.xml",
] as const;

/**
 * The point items whose inline processing maps a point through `qti-inside`, which the engine runs
 * since the text family landed, by corpus path.
 */
const insideItems = [
  "qtiv3-examples/packaging/BBQsTest/BBQsTest.zip.d/id-992e8bd3c9ac/hotspot-maximum.xml",
  "qtiv3-examples/packaging/BBQsTest/id-992e8bd3c9ac/hotspot-maximum.xml",
] as const;

/**
 * Open a corpus item as a host opens a document it read from storage, and require an accepting
 * verdict.
 *
 * @param location The item's path under the corpus root, which `admitted` takes as its location.
 * @returns The accepting verdict, with the accepted item `acceptedItem` reads out of it.
 */
const openAccepted = Effect.fnUntraced(function* openAccepted(location: string) {
  const verdict = yield* admitted(location, yield* readCorpusFile(location));
  const accepted = Option.getOrElse(acceptedItem(verdict), () =>
    assert.fail(`${location} is ${verdict.verdict}, not accepted`),
  );

  return { accepted, verdict };
});

/**
 * Report whether a feature the verdict names is about the response processing: a template the
 * engine does not run (`template="…"`), a variable it does not hold (`variable:…`), or an
 * expression or any other processing feature, each of which sits at or under the processing
 * element.
 *
 * @param feature The feature.
 * @returns Whether it names the processing.
 */
const namesProcessing = (feature: UnsupportedFeature): boolean =>
  feature.feature.startsWith("template=") ||
  feature.feature.startsWith("variable:") ||
  feature.path.split("/").includes("qti-response-processing");

/**
 * Give an item's declaration of the response the templates score.
 *
 * @param item The item.
 * @returns The declaration.
 */
const declarationOf = (item: Item): ResponseDeclaration =>
  Option.getOrElse(Option.fromUndefinedOr(item.responses.get(response)), () =>
    assert.fail(`${item.document} holds no ${response} declaration`),
  );

/**
 * Score one attempt from a fresh record and give the outcomes of the record it returns.
 *
 * @param accepted The item.
 * @param responses The responses, none for no response.
 * @returns The outcomes after the attempt.
 */
const outcomesAfter = (
  accepted: Accepted,
  responses: Readonly<Record<string, Value>>,
): ItemRecord["outcomes"] =>
  Result.match(score(accepted, responses), {
    onFailure: (error) =>
      assert.fail(`${accepted.document}: scoring failed: ${error._tag}: ${error.message}`),
    onSuccess: (record) => record.outcomes,
  });

/**
 * Read a value as a single number.
 *
 * @param value The value, absent when the variable is not held.
 * @param what What the value is, for the failure.
 * @returns The number its single integer or float holds.
 */
const numberOf = (value: Value | undefined, what: string): number => {
  const [single] = value?.values ?? [];
  if (
    value?.cardinality === "single" &&
    value.values.length === 1 &&
    (single?.baseType === "float" || single?.baseType === "integer")
  ) {
    return Number(single.value);
  }

  return assert.fail(`${what} is not a single number`);
};

/**
 * Read a value as a single identifier.
 *
 * @param value The value, absent when the variable is not held.
 * @param what What the value is, for the failure.
 * @returns The identifier.
 */
const identifierOf = (value: Value | undefined, what: string): string => {
  const [single] = value?.values ?? [];
  if (value?.cardinality === "single" && value.values.length === 1 && single !== undefined) {
    return single.baseType === "identifier"
      ? single.value
      : assert.fail(`${what} is a ${single.baseType}, not an identifier`);
  }

  return assert.fail(`${what} is not a single identifier`);
};

/**
 * Collect the Choice interactions in body nodes, in document order.
 *
 * @param nodes The body nodes.
 * @returns The interactions.
 */
const choicesIn = (nodes: readonly BodyNode[]): readonly ChoiceInteraction[] =>
  nodes.flatMap((node): readonly ChoiceInteraction[] => {
    if (node.kind === "choice") {
      return [node];
    }

    return node.kind === "element" ? choicesIn(node.children) : [];
  });

/**
 * Count the feedback inlines a run of body nodes holds, at any depth: inside elements, template
 * and feedback content, Prompts, Labels and choices' content.
 *
 * @param nodes The body nodes.
 * @returns How many `feedback-inline` nodes they hold.
 */
const feedbackInlinesIn = (nodes: readonly BodyNode[]): number => {
  let count = 0;
  for (const node of nodes) {
    if (isInteraction(node)) {
      count += regionsOf(node).reduce((sum, region) => sum + feedbackInlinesIn(region.nodes), 0);
      continue;
    }

    switch (node.kind) {
      case "container":
      case "element": {
        count += feedbackInlinesIn(node.children);
        break;
      }
      case "feedback-inline": {
        count += 1 + feedbackInlinesIn(node.content);
        break;
      }
      case "feedback-block":
      case "template-block":
      case "template-inline": {
        count += feedbackInlinesIn(node.content);
        break;
      }
      case "content":
      case "printed-variable":
      case "text":
      case "unsupported": {
        break;
      }
      default: {
        node satisfies never;
      }
    }
  }

  return count;
};

/**
 * Clamp a container's mapped sum by an area mapping's bounds, as `qti-map-response-point` does,
 * and leave a single point's as it is (reading 207).
 *
 * @param mapping The area mapping.
 * @param cardinality The response's cardinality.
 * @param sum The sum.
 * @returns The sum within `lower-bound` and `upper-bound` for a container, else the sum.
 */
const clamped = (
  mapping: AreaMapping,
  cardinality: ResponseDeclaration["cardinality"],
  sum: number,
): number =>
  cardinality === "single"
    ? sum
    : Math.min(
        Option.getOrElse(mapping.upperBound, () => Number.POSITIVE_INFINITY),
        Math.max(
          Option.getOrElse(mapping.lowerBound, () => Number.NEGATIVE_INFINITY),
          sum,
        ),
      );

/**
 * Give a point no area of a mapping holds: both coordinates one past the sum of every coordinate's
 * magnitude, which lies beyond each circle's and ellipse's rightmost point and each rectangle's and
 * polygon's largest x. A `default` area holds every point, so a mapping with one has no such point.
 *
 * @param mapping The area mapping.
 * @returns The point.
 */
const pointOutside = (mapping: AreaMapping): readonly [bigint, bigint] => {
  assert.isFalse(
    mapping.entries.some((entry) => entry.shape === "default"),
    "a default area holds every point",
  );
  let magnitude = 0;
  for (const entry of mapping.entries) {
    for (const coordinate of entry.coords) {
      magnitude += Math.abs(coordinate);
    }
  }
  const beyond = BigInt(Math.ceil(magnitude)) + 1n;

  return [beyond, beyond];
};

/**
 * The path of a hand-built item's response processing, where its processing marks sit.
 */
const processingPath = "qti-assessment-item/qti-response-processing";

/**
 * Write a hand-built item a built-in template processes, as the bytes a host reads: a single
 * identifier `RESPONSE` whose correct response is `A`, with a `qti-mapping` of `A` to 1 when asked,
 * a Choice of `A` and `B` bound to it, and the outcomes given.
 *
 * @param template The template's name.
 * @param mapped Whether `RESPONSE` holds a `qti-mapping`.
 * @param outcomes The outcome declarations' XML, in document order.
 * @returns The document's bytes.
 */
const templatedBytes = (
  template: string,
  mapped: boolean,
  outcomes: readonly string[],
): Uint8Array =>
  new TextEncoder().encode(
    [
      `<qti-assessment-item xmlns="http://www.imsglobal.org/xsd/imsqtiasi_v3p0" identifier="cc2" title="CC2" adaptive="false" time-dependent="false">`,
      `<qti-response-declaration identifier="RESPONSE" cardinality="single" base-type="identifier">`,
      `<qti-correct-response><qti-value>A</qti-value></qti-correct-response>`,
      mapped
        ? `<qti-mapping default-value="0"><qti-map-entry map-key="A" mapped-value="1"/></qti-mapping>`
        : "",
      `</qti-response-declaration>`,
      ...outcomes,
      `<qti-item-body><qti-choice-interaction response-identifier="RESPONSE" max-choices="1">`,
      `<qti-simple-choice identifier="A">A</qti-simple-choice><qti-simple-choice identifier="B">B</qti-simple-choice>`,
      `</qti-choice-interaction></qti-item-body>`,
      `<qti-response-processing template="https://purl.imsglobal.org/spec/qti/v3p0/rptemplates/${template}.xml"/>`,
      `</qti-assessment-item>`,
    ].join(""),
  );

/**
 * A single identifier response of one choice.
 *
 * @param identifier The choice's identifier.
 * @returns The value.
 */
const chosen = (identifier: string): Value => ({
  baseType: "identifier",
  cardinality: "single",
  values: [{ baseType: "identifier", value: identifier }],
});

/**
 * Open a hand-built item whose template needs a declaration the item does not provide, and require
 * the template marked and not run: the verdict is `accepted-with-unsupported`, the one processing
 * feature is the mark given at the processing element, the item has no processing, and `score`
 * returns a record, never an engine failure, with the same outcomes for the correct response, a
 * wrong one and none.
 *
 * @param bytes The item's bytes.
 * @param feature The mark that names what the item does not provide.
 * @returns Nothing; it fails the test on the first broken requirement.
 */
const markedNotRun = Effect.fnUntraced(function* markedNotRun(bytes: Uint8Array, feature: string) {
  const verdict = yield* admitted("items/cc2.xml", bytes);
  const accepted = acceptedItem(verdict).pipe(
    Option.filter(() => verdict.verdict === "accepted-with-unsupported"),
    Option.getOrElse(() =>
      assert.fail(`the item is ${verdict.verdict}, not accepted-with-unsupported`),
    ),
  );
  const right = outcomesAfter(accepted, { [response]: chosen("A") });
  const wrong = outcomesAfter(accepted, { [response]: chosen("B") });
  const none = outcomesAfter(accepted, {});

  assert.deepStrictEqual(accepted.item.unsupported.filter(namesProcessing), [
    { feature, path: processingPath, shown: "mark" },
  ]);
  assert.isTrue(Option.isNone(accepted.item.processing));
  assert.deepStrictEqual(right, none);
  assert.deepStrictEqual(wrong, none);
});

describe("a canonical template whose tree needs what template-requirements does not judge (marked, never refused)", () => {
  it.effect(
    "map_response and match_correct are marked outcome-type:SCORE when SCORE is a float of multiple cardinality, and score runs neither",
    () =>
      Effect.gen(function* canonicalMultipleScore() {
        const multipleScore = `<qti-outcome-declaration identifier="SCORE" cardinality="multiple" base-type="float"/>`;

        yield* markedNotRun(
          templatedBytes("map_response", true, [multipleScore]),
          "outcome-type:SCORE",
        );
        yield* markedNotRun(
          templatedBytes("match_correct", false, [multipleScore]),
          "outcome-type:SCORE",
        );
      }),
  );
});

describe("the built-in templates over named corpus items", { tags: ["corpus"] }, () => {
  for (const location of cc2MatchItems) {
    it.effect(
      `${location} (CC2_match) is accepted with its modal and inline feedback, and scores its correct response 1, a choice outside it 0 and no response 0`,
      () =>
        Effect.gen(function* cc2Match() {
          const { accepted, verdict } = yield* openAccepted(location);
          const { item } = accepted;
          const { unsupported } = item;
          const declaration = declarationOf(item);
          const correct = Option.getOrElse(declaration.correct, () =>
            assert.fail(`${location} declares no correct response`),
          );
          const interaction = choicesIn(item.body).find((choice) => choice.response === response);
          const outside =
            interaction?.choices.find(
              (choice) =>
                !correct.values.some(
                  (single) =>
                    single.baseType === "identifier" && single.value === choice.identifier,
                ),
            ) ?? assert.fail(`${location} presents no choice outside its correct response`);

          assert.strictEqual(verdict.verdict, "accepted");
          assert.deepStrictEqual(unsupported, []);
          assert.isNotEmpty(item.modalFeedback, "a CC2_match item holds its qti-modal-feedback");
          assert.isAbove(
            feedbackInlinesIn(item.body),
            0,
            "a CC2_match item holds its qti-feedback-inline as a body node",
          );
          assert.isTrue(Option.isSome(item.processing));
          assert.strictEqual(
            numberOf(outcomesAfter(accepted, { [response]: correct })["SCORE"], "SCORE"),
            1,
          );
          assert.strictEqual(
            numberOf(
              outcomesAfter(accepted, {
                [response]: {
                  baseType: "identifier",
                  cardinality: declaration.cardinality,
                  values: [{ baseType: "identifier", value: outside.identifier }],
                },
              })["SCORE"],
              "SCORE",
            ),
            0,
          );
          assert.strictEqual(numberOf(outcomesAfter(accepted, {})["SCORE"], "SCORE"), 0);
        }),
      corpusTimeoutMs,
    );
  }

  for (const location of cc2MapResponseItems) {
    it.effect(
      `${location} (CC2_map_response) is accepted with its modal feedback, and maps its first key's text, a text no key matches and no response, setting FEEDBACK against MAXSCORE`,
      () =>
        Effect.gen(function* cc2MapResponse() {
          const { accepted, verdict } = yield* openAccepted(location);
          const { item } = accepted;
          const { unsupported } = item;
          const declaration = declarationOf(item);
          const mapping = Option.getOrElse(declaration.mapping, () =>
            assert.fail(`${location} declares no mapping`),
          );
          const first = mapping.entries[0] ?? assert.fail(`${location}'s mapping has no entry`);
          const maximum = numberOf(
            Option.getOrUndefined(
              Option.flatMap(
                Option.fromUndefinedOr(item.outcomes.get("MAXSCORE")),
                (outcome) => outcome.defaultValue,
              ),
            ),
            "MAXSCORE's default",
          );
          const keys = mapping.entries.map((entry) => format(entry.key));
          const { cardinality } = declaration;
          const baseType = isPosted(declaration.baseType)
            ? declaration.baseType
            : assert.fail(
                `${location}'s ${response} is a ${declaration.baseType}, which no text posts`,
              );
          const name = entryName(instance, response);
          const posted = (text: string): Value =>
            Result.getOrElse(
              decodeValue([[name, text]], { baseType, cardinality, name }),
              (malformed) =>
                assert.fail(`${location}: the text ${text} does not decode: ${malformed.message}`),
            );
          const matched = outcomesAfter(accepted, {
            [response]: posted(format(first.key)),
          });
          // Longer than every key, so it equals none of them, case folded or not.
          const unmatched = outcomesAfter(accepted, {
            [response]: posted(`${keys.join(" ")} (no key)`),
          });
          const none = outcomesAfter(accepted, {});

          assert.strictEqual(verdict.verdict, "accepted");
          assert.deepStrictEqual(unsupported, []);
          assert.isNotEmpty(
            item.modalFeedback,
            "a CC2_map_response item holds its qti-modal-feedback",
          );
          assert.isTrue(Option.isSome(item.processing));
          assert.isTrue(Option.isNone(declaration.correct));

          assert.strictEqual(numberOf(matched["SCORE"], "SCORE"), first.value);
          assert.strictEqual(
            identifierOf(matched["FEEDBACK"], "FEEDBACK"),
            first.value === maximum ? "correct" : "incorrect",
          );
          assert.strictEqual(numberOf(unmatched["SCORE"], "SCORE"), mapping.defaultValue);
          assert.strictEqual(identifierOf(unmatched["FEEDBACK"], "FEEDBACK"), "incorrect");
          assert.strictEqual(numberOf(none["SCORE"], "SCORE"), 0);
          assert.strictEqual(identifierOf(none["FEEDBACK"], "FEEDBACK"), "incorrect");
        }),
      corpusTimeoutMs,
    );
  }

  for (const location of pointItems) {
    it.effect(
      `${location} (map_response_point) scores its correct response at its areas' sum, no response 0 and a point in no area the default`,
      () =>
        Effect.gen(function* mapResponsePoint() {
          const { accepted } = yield* openAccepted(location);
          const { item } = accepted;
          const declaration = declarationOf(item);
          const correct = Option.getOrElse(declaration.correct, () =>
            assert.fail(`${location} declares no correct response`),
          );
          const mapping = Option.getOrElse(declaration.areaMapping, () =>
            assert.fail(`${location} declares no area mapping`),
          );
          let sum = 0;
          for (const entry of mapping.entries) {
            sum += entry.mappedValue;
          }
          const outside: Value = {
            baseType: "point",
            cardinality: declaration.cardinality,
            values: [{ baseType: "point", value: pointOutside(mapping) }],
          };

          assert.isTrue(Option.isSome(item.processing));
          assert.strictEqual(
            numberOf(outcomesAfter(accepted, { [response]: correct })["SCORE"], "SCORE"),
            clamped(mapping, declaration.cardinality, sum),
          );
          assert.strictEqual(numberOf(outcomesAfter(accepted, {})["SCORE"], "SCORE"), 0);
          assert.strictEqual(
            numberOf(outcomesAfter(accepted, { [response]: outside })["SCORE"], "SCORE"),
            clamped(mapping, declaration.cardinality, mapping.defaultValue),
          );
        }),
      corpusTimeoutMs,
    );
  }

  for (const location of insideItems) {
    it.effect(
      `${location} runs its qti-inside processing: no response scores 0, its correct point is Correct and a point outside its area Incorrect`,
      () =>
        Effect.gen(function* inside() {
          const { accepted } = yield* openAccepted(location);
          const { item } = accepted;
          const declaration = declarationOf(item);
          const correct = Option.getOrElse(declaration.correct, () =>
            assert.fail(`${location} declares no correct response`),
          );
          const mapping = Option.getOrElse(declaration.areaMapping, () =>
            assert.fail(`${location} declares no area mapping`),
          );
          const outside: Value = {
            baseType: "point",
            cardinality: declaration.cardinality,
            values: [{ baseType: "point", value: pointOutside(mapping) }],
          };

          assert.isTrue(Option.isSome(item.processing));
          assert.isFalse(
            accepted.item.unsupported.some((feature) => feature.feature === "qti-inside"),
            "qti-inside is no mark",
          );
          assert.strictEqual(numberOf(outcomesAfter(accepted, {})["SCORE"], "SCORE"), 0);
          assert.strictEqual(
            identifierOf(outcomesAfter(accepted, { [response]: correct })["FEEDBACK"], "FEEDBACK"),
            "Correct",
          );
          assert.strictEqual(
            identifierOf(outcomesAfter(accepted, { [response]: outside })["FEEDBACK"], "FEEDBACK"),
            "Incorrect",
          );
        }),
      corpusTimeoutMs,
    );
  }
});
