import { assert, describe, it } from "@effect/vitest";
import { Effect } from "effect";
import { readSource } from "#plate/document/read.ts";
import { admitted } from "#plate/test/admitted.ts";
import { tables } from "#plate/validate/tables.ts";
import { checkAdmitted, unsupportedFeatures } from "#plate/validate/verdict.ts";
import type { Tables } from "#plate/validate/governing.ts";

/**
 * The namespace of the `onclick` {@link e3Item} carries, one the QTI XSD declares nothing in.
 */
const foreign = "urn:example:other";

/**
 * An item whose response processing sets `SCORE` through a `qti-custom-operator` carrying an
 * `onclick` in {@link foreign}, which only the operator's `##other` attribute wildcard admits, so
 * E3 removes and marks it.
 */
const e3Item: Uint8Array = new TextEncoder().encode(
  `<qti-assessment-item xmlns="http://www.imsglobal.org/xsd/imsqtiasi_v3p0" identifier="i" title="I" adaptive="false" time-dependent="false"><qti-outcome-declaration identifier="SCORE" cardinality="single" base-type="float"/><qti-item-body><p class="lead">Hi</p></qti-item-body><qti-response-processing><qti-set-outcome-value identifier="SCORE"><qti-custom-operator xmlns:x="${foreign}" class="org.example.Half" x:onclick="alert(1)"><qti-base-value base-type="float">1</qti-base-value></qti-custom-operator></qti-set-outcome-value></qti-response-processing></qti-assessment-item>`,
);

describe("validate/admitted.ts", () => {
  it("removes and marks the onclick E3 removes, by the declarations of the tables it is given", () => {
    const source = Effect.runSync(readSource("e3.xml", e3Item));
    const checked = Effect.runSync(admitted("e3.xml", e3Item));

    assert.deepStrictEqual(
      unsupportedFeatures(checked).filter((mark) => mark.feature.startsWith("attribute:")),
      [
        {
          feature: `attribute:{${foreign}}onclick`,
          path: "qti-assessment-item/qti-response-processing/qti-set-outcome-value/qti-custom-operator",
          shown: "mark",
        },
      ],
    );

    // The plant: tables in which the type qti-custom-operator is declared with, CustomOperatorDType,
    // declares onclick keep it, where the tables as they are remove it.
    const operator = tables.types["CustomOperatorDType"];
    assert.isDefined(operator, "the tables hold CustomOperatorDType");

    const planted: Tables = {
      ...tables,
      types: {
        ...tables.types,
        CustomOperatorDType: {
          ...operator,
          attributes: [...operator.attributes, { local: "onclick", namespace: foreign }],
        },
      },
    };
    assert.notDeepEqual(checkAdmitted(source, planted), checked);
  });

  it.effect(
    "secures a MathML URL as it secures the body's: javascript: and a path above the package root are dropped and marked",
    () =>
      Effect.gen(function* mathUrls() {
        const verdict = yield* admitted(
          "q.xml",
          new TextEncoder().encode(
            `<qti-assessment-item xmlns="http://www.imsglobal.org/xsd/imsqtiasi_v3p0" identifier="i" title="I" adaptive="false" time-dependent="false"><qti-item-body><p><math xmlns="http://www.w3.org/1998/Math/MathML" altimg="../x.png"><mi href="javascript:alert(1)">x</mi><mi href="#y">y</mi></math></p></qti-item-body></qti-assessment-item>`,
          ),
        );
        const math = "qti-assessment-item/qti-item-body/p/{http://www.w3.org/1998/Math/MathML}math";

        assert.deepStrictEqual(unsupportedFeatures(verdict), [
          { feature: "url-outside-package", path: math, shown: "mark" },
          {
            feature: "url-scheme:javascript",
            path: `${math}/{http://www.w3.org/1998/Math/MathML}mi[1]`,
            shown: "mark",
          },
        ]);
      }),
  );
});
