/**
 * The oracle's engine port bound to `@qti-pie/processing`'s public entries, the only module that
 * imports the package's functions: a document is read by crust and compiled by `compileItem` or
 * `compileTest`; a take is `takeItem` under the item's processing seed; an attempt is
 * `gradeAnswer`; a sitting's close is `gradeSitting`. Values cross through the value bridge.
 *
 * No instant a replay reads decides a truth, so every write is read and saved at the epoch, and a
 * sitting starts at the epoch and is read its duration later.
 *
 * @module
 */
import { createHash } from "node:crypto";
import { readXml } from "@qti-pie/crust/read.ts";
import {
  compileItem,
  compileTest,
  customOperatorOf,
  gradeAnswer,
  gradeSitting,
  processingSeed,
  takeItem,
} from "@qti-pie/processing";
import { nullOf, recordOf, single } from "@qti-pie/processing/value.ts";
import type {
  CompiledItem,
  Digest,
  ItemResult,
  ProcessingFailure,
  ItemSession,
  Submitted,
  Take,
  XmlElement,
} from "@qti-pie/processing";
import type { Value } from "@qti-pie/processing/value.ts";
import { Effect, Exit } from "effect";
import type {
  AnswerView,
  Engine,
  ItemEngine,
  ItemSeed,
  Refused,
  SessionView,
  SittingView,
  TakeView,
  TestEngine,
} from "#processing-oracle/engine.ts";
import type { RecordedValues } from "#processing-oracle/recording.ts";
import { recordedOf, recordedValuesOf, valuesOf } from "#processing-oracle/values.ts";

/**
 * The instant every replayed write is read and saved at.
 */
const epoch = { microseconds: 0n } as const;

/**
 * A stored document read, or why it is none.
 *
 * @param bytes The document's bytes.
 * @returns Its root element, or a refusal.
 */
const rootOf = (bytes: Uint8Array): Refused | XmlElement => {
  const exit = Effect.runSyncExit(readXml(bytes));

  return Exit.isSuccess(exit)
    ? exit.value.root
    : { kind: "refused", reason: "the document is not well-formed XML" };
};

/**
 * A document's digest, which keys its program.
 *
 * @param bytes The document's bytes.
 * @returns The digest.
 */
const digestOf = (bytes: Uint8Array): Digest => ({
  sha256: createHash("sha256").update(bytes).digest("hex"),
});

/**
 * The places of a document's recorded operators in document order: each `qti-custom-operator`
 * whose definition the registry holds as recorded, by its element's pre-order index from the root
 * at 0, the place the package keys their answers and demands by.
 *
 * @param root The document's root.
 * @returns The places, the first recorded operator's first.
 */
const recordedPlaces = (root: XmlElement): readonly number[] => {
  const places: number[] = [];
  let next = 0;
  const visit = (element: XmlElement): void => {
    const place = next;
    next += 1;
    if (element.local === "qti-custom-operator") {
      const definition = element.attributes.find((a) => a.local === "definition")?.value ?? "";
      if (customOperatorOf(definition)?.kind === "recorded") {
        places.push(place);
      }
    }

    for (const child of element.children) {
      if (child.kind === "element") {
        visit(child);
      }
    }
  };
  visit(root);

  return places;
};

/**
 * A take in recorded form.
 *
 * @param take The take.
 * @returns Its view.
 */
const takeViewOf = (take: Take): TakeView => ({
  correct: recordedValuesOf(take.correct),
  defaults: recordedValuesOf(take.defaults),
  templates: recordedValuesOf(take.templates),
});

/**
 * A take view read back into the package's take.
 *
 * @param view The view.
 * @returns The take.
 */
const takeOf = (view: TakeView): Take => ({
  correct: valuesOf(view.correct),
  defaults: valuesOf(view.defaults),
  templates: valuesOf(view.templates),
});

/**
 * The item seed's processing seed.
 *
 * @param seed The item seed.
 * @returns The package's seed.
 */
const seedOf = (seed: ItemSeed) => processingSeed(seed.decisionSeed, seed.package, seed.identifier);

/**
 * An item session from the oracle's session view.
 *
 * @param seed The item's seed.
 * @param take The take it runs on.
 * @param view The session view.
 * @returns The session.
 */
const sessionOf = (seed: ItemSeed, take: TakeView, view: SessionView): ItemSession => ({
  duration: view.duration,
  numAttempts: BigInt(view.numAttempts),
  prior:
    view.prior === undefined
      ? { kind: "none" }
      : { at: epoch, kind: "processed", outcomes: valuesOf(view.prior) },
  seed: seedOf(seed),
  take: takeOf(take),
});

/**
 * Responses as one save at the epoch, total over the item's declared responses as the ledger's
 * boundary builds every saved map (a response the recording does not name is unanswered, NULL),
 * or the default submission where none was saved.
 *
 * @param item The item.
 * @param responses The responses.
 * @returns What the attempt submits.
 */
const submittedOf = (item: CompiledItem, responses: RecordedValues | undefined): Submitted => {
  if (responses === undefined) {
    return { kind: "default" };
  }

  const values = new Map(valuesOf(responses));
  for (const declaration of item.declarations.values()) {
    if (declaration.role === "response" && !values.has(declaration.identifier)) {
      values.set(declaration.identifier, nullOf(declaration.type));
    }
  }

  return { at: epoch, kind: "save", values };
};

/**
 * An item result in the oracle's view: a pending result's demands by their recorded operator's
 * ordinal (-1 for a place no recorded operator holds), a done result's every outcome with its
 * completion status.
 *
 * @param result The result.
 * @param places The document's recorded operators' places.
 * @returns The view.
 */
const resultView = (result: ItemResult, places: readonly number[]): AnswerView => {
  if (result.kind === "pending") {
    return { draws: result.demands.map((demand) => places.indexOf(demand.place)), kind: "pending" };
  }

  const status = recordedOf(result.completionStatus);
  const outcomes = recordedValuesOf(result.outcomes);

  return {
    credit: result.credit === undefined ? null : { ...result.credit },
    kind: "done",
    numAttempts: Number(result.numAttempts),
    outcomes: status === undefined ? outcomes : { ...outcomes, completionStatus: status },
  };
};

/**
 * Each recorded operator's answer, by ordinal, at its place: the record a recorded operator
 * answers with, its `score` field the score recorded.
 *
 * @param recorded The scores by ordinal.
 * @param places The recorded operators' places.
 * @returns The answers by place.
 */
const evaluationsOf = (
  recorded: ReadonlyMap<number, number>,
  places: readonly number[],
): ReadonlyMap<number, Value> =>
  new Map(
    [...recorded].flatMap(([ordinal, score]) => {
      const place = places[ordinal];

      return place === undefined
        ? []
        : [[place, recordOf([{ name: "score", value: single("float", score) }])] as const];
    }),
  );

/**
 * A failure's text: its kind, the place it stands at, and the variable it names where it names one.
 *
 * @param failure The failure.
 * @returns Its text.
 */
const failureText = (failure: ProcessingFailure): string => {
  switch (failure.kind) {
    case "computation-bound": {
      return `computation-bound ${failure.bound} at ${String(failure.place)}`;
    }
    case "set-type": {
      return `set-type ${failure.identifier} at ${String(failure.place)}`;
    }
    case "completion-status": {
      return `completion-status at ${String(failure.place)}`;
    }
    case "completion-mismatch": {
      return `completion-mismatch ${failure.given.sha256} ${failure.pending.sha256}`;
    }
  }
};

/**
 * The engine over one compiled item.
 *
 * @param item The compiled item.
 * @param places Its recorded operators' places.
 * @returns The engine.
 */
const itemEngineOf = (item: CompiledItem, places: readonly number[]): ItemEngine => ({
  answer: (input) => {
    const graded = gradeAnswer({
      context: new Map(),
      evaluations: evaluationsOf(input.recorded, places),
      item,
      readAt: epoch,
      responses: submittedOf(item, input.responses),
      session: sessionOf(input.seed, input.take, input.session),
      validate: input.validate,
    });
    if ("failure" in graded) {
      return { failure: failureText(graded.failure), kind: "failed" };
    }

    if (graded.result.kind === "refused") {
      const { reasons } = graded.result.admission;

      return {
        codes: [...new Set(reasons.map((reason) => reason.code))].toSorted(),
        endAttempt: item.interactions.some(
          (interaction) =>
            interaction.kind === "end-attempt" &&
            input.responses[interaction.response]?.values[0] === "true",
        ),
        kind: "refused",
        refused: reasons.map((reason) => reason.response),
      };
    }

    return resultView(graded.result, places);
  },
  identifier: item.identifier,
  kind: "item",
  take: (seed) => {
    const take = takeItem(item, seedOf(seed), new Map(), new Map());

    return "failure" in take ? { correct: {}, defaults: {}, templates: {} } : takeViewOf(take);
  },
});

/**
 * Compile an item's document.
 *
 * @param bytes The document's bytes.
 * @returns The compiled item and its recorded operators' places, or a refusal.
 */
const compiledItemOf = (
  bytes: Uint8Array,
):
  | Refused
  | { readonly item: CompiledItem; readonly kind: "item"; readonly places: readonly number[] } => {
  const root = rootOf(bytes);
  if (root.kind === "refused") {
    return root;
  }

  const compiled = compileItem(root, digestOf(bytes));

  return compiled.ok
    ? { item: compiled.value, kind: "item", places: recordedPlaces(root) }
    : { kind: "refused", reason: `${compiled.refusal.code}: ${compiled.refusal.detail}` };
};

/**
 * The engine over a compiled test and its member items.
 *
 * @param bytes The test document's bytes.
 * @param items Each member item's document bytes, by its item ref's identifier.
 * @returns The engine, or a refusal.
 */
const testEngineOf = (
  bytes: Uint8Array,
  items: ReadonlyMap<string, Uint8Array>,
): Refused | TestEngine => {
  const root = rootOf(bytes);
  if (root.kind === "refused") {
    return root;
  }

  const members = new Map<
    string,
    { readonly item: CompiledItem; readonly places: readonly number[] }
  >();
  for (const [ref, itemBytes] of items) {
    const compiled = compiledItemOf(itemBytes);
    if (compiled.kind === "refused") {
      return { kind: "refused", reason: `member ${ref}: ${compiled.reason}` };
    }

    members.set(ref, compiled);
  }

  const test = compileTest(
    root,
    digestOf(bytes),
    new Map([...members].map(([ref, { item }]) => [ref, item])),
  );
  if (!test.ok) {
    return { kind: "refused", reason: `${test.refusal.code}: ${test.refusal.detail}` };
  }

  return {
    close: (input): SittingView => {
      const closing = input.members.flatMap((member) => {
        const held = members.get(member.ref);
        if (held === undefined) {
          return [];
        }

        const seed = processingSeed(input.decisionSeed, test.value.identifier, member.ref);
        const take = takeItem(held.item, seed, new Map(), new Map());
        if ("failure" in take) {
          return [];
        }

        return [
          {
            evaluations: new Map<number, Value>(),
            item: held.item,
            ref: { identifier: member.ref, occurrence: 0n },
            responses: submittedOf(held.item, member.responses),
            session: {
              duration: member.duration,
              numAttempts: 0n,
              prior: { kind: "none" },
              seed,
              take,
            } satisfies ItemSession,
            validate: false,
          },
        ];
      });
      const presented = new Set(input.members.map((member) => member.ref));
      const unpresented = [...members]
        .filter(([ref]) => !presented.has(ref))
        .map(([ref, { item }]) => ({ item, ref: { identifier: ref, occurrence: 0n } }));
      const graded = gradeSitting({
        carried: [],
        closing,
        context: new Map(),
        endedBy: "system",
        pending: [],
        readAt: { microseconds: BigInt(Math.round(input.duration * 1_000_000)) },
        startedAt: epoch,
        test: test.value,
        testSeed: processingSeed(input.decisionSeed, test.value.identifier, test.value.identifier),
        unpresented,
      });
      if ("failure" in graded) {
        return { failure: failureText(graded.failure), kind: "failed" };
      }

      if (graded.kind === "pending") {
        return { kind: "pending" };
      }

      if (graded.kind === "refused") {
        return {
          codes: [
            ...new Set(
              graded.refusals.flatMap((refusal) =>
                refusal.admission.reasons.map((reason) => reason.code),
              ),
            ),
          ].toSorted(),
          kind: "refused",
        };
      }

      return {
        kind: "done",
        members: new Map(
          graded.members.map((member) => [
            member.ref.identifier,
            resultView(member.result, members.get(member.ref.identifier)?.places ?? []),
          ]),
        ),
        test: recordedValuesOf(graded.test),
      };
    },
    kind: "test",
  };
};

/**
 * The engine, bound to the package's public entries.
 */
export const engine: Engine = {
  item: (bytes) => {
    const compiled = compiledItemOf(bytes);

    return compiled.kind === "refused" ? compiled : itemEngineOf(compiled.item, compiled.places);
  },
  test: testEngineOf,
};
