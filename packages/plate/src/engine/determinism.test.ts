/**
 * Determinism: one item with one seed gives the same template values, the same redaction and the
 * same outcomes on every run.
 *
 * The item is `src/test/determinism.ts`'s hand-built fixture. The item also runs
 * through the package's entries (`openAdmitted`, `begin`, `score`, `restore`).
 */
import { assert, describe, it } from "@effect/vitest";
import { Effect, Option, Result } from "effect";
import { begin } from "#plate/begin.ts";
import {
  drawBelow,
  drawFloat,
  drawStream,
  responseLabel,
  templateLabel,
} from "#plate/engine/random.ts";
import type { ItemRecord } from "#plate/model/record.ts";
import { nullOf } from "#plate/model/values.ts";
import type { RecordValue } from "#plate/model/values.ts";
import { redact } from "#plate/redact.ts";
import type { Redacted } from "#plate/redact/walk.ts";
import { restore } from "#plate/restore.ts";
import {
  determinismInstance,
  determinismItem,
  determinismLocation,
  determinismResponses,
  determinismSeed,
  determinismXml,
  observe,
  otherSeed,
  pinned,
  startRecord,
} from "#plate/test/determinism.ts";
import { float, integer } from "#plate/test/fixtures.ts";
import { shownToCandidate } from "#plate/test/page.ts";
import { score } from "#plate/test/score.ts";
import { admitted } from "#plate/test/admitted.ts";
import { acceptedItem } from "#plate/validate/verdict.ts";
import type { Accepted } from "#plate/validate/verdict.ts";

/**
 * Open the fixture's document, which `check` must accept.
 *
 * @returns The accepted item.
 */
const opened = Effect.fnUntraced(function* opened() {
  const verdict = yield* admitted(determinismLocation, new TextEncoder().encode(determinismXml));

  return Option.getOrElse(acceptedItem(verdict), () =>
    assert.fail(`${determinismLocation} is ${verdict.verdict}, not accepted`),
  );
});

/**
 * Redact an accepted item by a record, as a page is given it: a page is a function of the
 * redaction, the instance and the values it shows.
 *
 * @param accepted The accepted item.
 * @param record The record whose template and outcome values `redact` reads.
 * @returns The redacted item.
 */
const redactedFrom = (accepted: Accepted, record: ItemRecord): Redacted =>
  redact(accepted, shownToCandidate, record);

describe("the determinism fixture", () => {
  it("gives the pinned template values and outcomes from a fresh record", () => {
    assert.deepStrictEqual(Result.getOrThrow(observe(Result.getOrThrow(startRecord()))), pinned);
  });

  it.effect("gives other template values, and another redaction, under another seed", () =>
    Effect.gen(function* otherValues() {
      const accepted = yield* opened();
      const other = Result.getOrThrow(startRecord(otherSeed));

      for (const drawn of ["N", "X", "S", "M"]) {
        assert.notDeepEqual(other.templates[drawn], pinned.templates[drawn], drawn);
      }

      assert.notDeepEqual(
        redactedFrom(accepted, other),
        redactedFrom(accepted, Result.getOrThrow(startRecord())),
      );
    }),
  );

  it("ran its template processing: no template value is its declared default", () => {
    const { templates } = Result.getOrThrow(startRecord());

    assert.deepStrictEqual(
      Object.keys(templates).toSorted(),
      [...determinismItem.templates.keys()].toSorted(),
    );

    for (const [name, declaration] of determinismItem.templates) {
      assert.notDeepEqual(
        templates[name],
        Option.getOrElse(declaration.defaultValue, () =>
          nullOf(declaration.baseType, declaration.cardinality),
        ),
        name,
      );
    }
  });

  it("replays the pinned values from the documented draws: one restart, the qti-and operand after a false one drawn, no draw in the branch not taken", () => {
    const draw = drawStream(
      determinismSeed,
      templateLabel(determinismInstance, determinismItem.identifier),
    );
    const firstN = 1n + drawBelow(draw, 9n);
    const n = 1n + drawBelow(draw, 9n);
    const x = drawFloat(draw) * 10;
    const andOperand = drawBelow(draw, 100n);
    const m = 100n + drawBelow(draw, 100n);
    const drawn =
      1n + drawBelow(drawStream(determinismSeed, responseLabel(determinismInstance, 1)), 6n);

    assert.isBelow(Number(firstN), 5, "the first pass fails N >= 5, so the run restarts");
    assert.notStrictEqual(m, 100n + andOperand, "M had the qti-and stopped at its false operand");
    assert.deepStrictEqual(
      [pinned.templates["N"], pinned.templates["X"], pinned.templates["S"], pinned.templates["M"]],
      [integer(n), float(x), float(Math.sin(x)), integer(m)],
    );
    assert.deepStrictEqual(pinned.outcomes["DRAWN"], integer(drawn));
  });

  it.effect(
    "begin starts the pinned record: restored, it holds the pinned template values, and score's record holds the pinned outcomes",
    () =>
      Effect.gen(function* beginsThePinnedRecord() {
        const accepted = yield* opened();
        const begun = yield* Effect.fromResult(
          begin(accepted, { instance: determinismInstance, seed: determinismSeed }),
        );
        const scored = yield* Effect.fromResult(score(accepted, determinismResponses, begun));
        const before = yield* Effect.fromResult(restore(accepted, begun));
        const after = yield* Effect.fromResult(restore(accepted, scored));

        assert.deepStrictEqual(before.record.templates, pinned.templates);
        assert.deepStrictEqual(after.record.outcomes, pinned.outcomes);
      }),
  );

  it.effect("redacts alike from restore over begin's record and over score's record (H4)", () =>
    Effect.gen(function* rendersRestoredAlike() {
      const accepted = yield* opened();
      const begun = yield* Effect.fromResult(
        begin(accepted, { instance: determinismInstance, seed: determinismSeed }),
      );
      const before = yield* Effect.fromResult(restore(accepted, begun));
      const after = yield* Effect.fromResult(
        restore(accepted, yield* Effect.fromResult(score(accepted, determinismResponses, begun))),
      );

      assert.deepStrictEqual(after.values, determinismResponses);
      assert.deepStrictEqual(
        redactedFrom(accepted, before.record),
        redactedFrom(accepted, after.record),
      );
    }),
  );
});

/**
 * Where {@link recordAnswerXml} is opened from.
 */
const recordAnswerLocation = "items/record-answer.xml";

/**
 * A hand-built item whose `record` response `R`, which a Text Entry binds, sets the integer
 * outcome `COUNT` to its field `integerValue` plus the template value `SHIFT`, which template
 * processing draws, so its stored record holds a drawn value beside the record answer.
 */
const recordAnswerXml = `<?xml version="1.0" encoding="UTF-8"?>
<qti-assessment-item xmlns="http://www.imsglobal.org/xsd/imsqtiasi_v3p0" identifier="record-answer" title="Record answer" time-dependent="false" xml:lang="en">
  <qti-response-declaration identifier="R" cardinality="record"/>
  <qti-outcome-declaration identifier="COUNT" base-type="integer" cardinality="single"/>
  <qti-template-declaration identifier="SHIFT" base-type="integer" cardinality="single"/>
  <qti-template-processing>
    <qti-set-template-value identifier="SHIFT"><qti-random-integer min="1" max="9"/></qti-set-template-value>
  </qti-template-processing>
  <qti-item-body><p>Add <qti-printed-variable identifier="SHIFT"/> to <qti-text-entry-interaction response-identifier="R"/></p></qti-item-body>
  <qti-response-processing>
    <qti-set-outcome-value identifier="COUNT"><qti-sum><qti-field-value field-identifier="integerValue"><qti-variable identifier="R"/></qti-field-value><qti-variable identifier="SHIFT"/></qti-sum></qti-set-outcome-value>
  </qti-response-processing>
</qti-assessment-item>
`;

/**
 * The record a candidate's answer to `R` gives, as a host's `decode` builds it from typed text.
 */
const recordAnswer: RecordValue = {
  cardinality: "record",
  fields: [
    { identifier: "stringValue", value: { baseType: "string", value: "12" } },
    { identifier: "integerValue", value: { baseType: "integer", value: 12n } },
  ],
};

describe("determinism: a session with a record answer", () => {
  it.effect(
    "record answer determinism: a begin under the fixture's seed, scored with a record answer, stores the record answer, and restore gives it back",
    () =>
      Effect.gen(function* recordAnswerStored() {
        const verdict = yield* admitted(
          recordAnswerLocation,
          new TextEncoder().encode(recordAnswerXml),
        );
        const accepted = Option.getOrElse(acceptedItem(verdict), () =>
          assert.fail(`${recordAnswerLocation} is ${verdict.verdict}, not accepted`),
        );
        const begun = yield* Effect.fromResult(
          begin(accepted, { instance: determinismInstance, seed: determinismSeed }),
        );
        const scored = yield* Effect.fromResult(score(accepted, { R: recordAnswer }, begun));
        const restored = yield* Effect.fromResult(restore(accepted, scored));

        assert.deepStrictEqual(restored.record.records, { R: recordAnswer });
      }),
  );
});
