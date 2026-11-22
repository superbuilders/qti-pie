import { assert, describe, it } from "@effect/vitest";
import { Effect, Option } from "effect";
import type { SourceElement } from "#plate/document/source.ts";
import { attr, doc, el, text as sourceText } from "#plate/test/source.ts";
import { admittedSource } from "#plate/test/admitted.ts";
import { acceptedItem } from "#plate/validate/verdict.ts";

/**
 * The identifier of the response the Extended Text here binds.
 */
const response = "ESSAY";

/**
 * Construct a `qti-simple-choice` holding only text.
 *
 * @param identifier The choice's identifier.
 * @param label The choice's text.
 * @returns The choice element.
 */
const simpleChoice = (identifier: string, label: string): SourceElement =>
  el("qti-simple-choice", [attr("identifier", identifier)], [sourceText(label)]);

/**
 * Construct a response declaration of a single value.
 *
 * @param identifier The declared identifier.
 * @param baseType The `base-type` value.
 * @returns The declaration element.
 */
const declaration = (identifier: string, baseType: string): SourceElement =>
  el("qti-response-declaration", [
    attr("base-type", baseType),
    attr("cardinality", "single"),
    attr("identifier", identifier),
  ]);

describe("an Extended Text the renderer does not support", () => {
  it.effect(
    'renders the notice in place of the Controls of an Extended Text whose min-strings="101"',
    () =>
      Effect.sync(() => {
        const path = "qti-assessment-item/qti-item-body/qti-extended-text-interaction";
        const verdict = admittedSource(
          doc(
            "items/over-cap.xml",
            el(
              "qti-assessment-item",
              [
                attr("identifier", "over-cap"),
                attr("time-dependent", "false"),
                attr("title", "Over the cap"),
              ],
              [
                declaration("RESPONSE", "identifier"),
                el("qti-response-declaration", [
                  attr("base-type", "string"),
                  attr("cardinality", "multiple"),
                  attr("identifier", response),
                ]),
                el(
                  "qti-item-body",
                  [],
                  [
                    el(
                      "qti-choice-interaction",
                      [attr("max-choices", "1"), attr("response-identifier", "RESPONSE")],
                      [simpleChoice("A", "Red"), simpleChoice("B", "Green")],
                    ),
                    el("qti-extended-text-interaction", [
                      attr("max-strings", "0"),
                      attr("min-strings", "101"),
                      attr("response-identifier", response),
                    ]),
                  ],
                ),
              ],
            ),
          ),
        );
        const accepted = acceptedItem(verdict).pipe(
          Option.filter(() => verdict.verdict === "accepted-with-unsupported"),
          Option.getOrElse(() =>
            assert.fail(`The item is ${verdict.verdict}, not accepted-with-unsupported.`),
          ),
        );

        assert.deepStrictEqual(accepted.item.unsupported, [
          { feature: "min-strings>100", path, shown: "notice" },
        ]);
      }),
  );
});
