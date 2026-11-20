/**
 * Plate's UI suite over the specimen's generated cases: every case of the floor
 * (`#specimen/floor.ts`), opened as content the database admitted, shown with the child's response
 * its description gives in answering, in review with the solution shown and withheld, and in
 * solution, keeps every rule of `#specimen/ui/rules.ts` but the known findings
 * (`#specimen/ui/findings.ts`), which the corpus suite holds to failing.
 *
 * The search draws one of the floor's cases and nothing else, unsteered, so a failing case's
 * `TEST_REPLAY` token names its place in `floorCases`.
 *
 * @module
 */
import { describe, it } from "@effect/vitest";
import { drawn, explore } from "@bjornpagen/testing/explore";
import type { Case } from "@bjornpagen/testing/explore";
import { required } from "@bjornpagen/testing/features";
import { notesOnly } from "@bjornpagen/testing/sense";
import { completeShrink } from "@bjornpagen/testing/shrink";
import { searched } from "@bjornpagen/testing/vitest";
import { Effect, Option, Record as Rec, Result } from "effect";
import { begin } from "@qti-pie/plate";
import { opened } from "#specimen/open.ts";
import { kindDimension } from "#specimen/kinds/index.ts";
import { floorCase } from "#specimen/floor.ts";
import { entriesOf } from "#specimen/specimen.ts";
import type { Case as Specimen, KindName } from "#specimen/specimen.ts";
import { clientExports } from "#specimen/ui/clients.ts";
import { known } from "#specimen/ui/findings.ts";
import { instance, rules, see } from "#specimen/ui/rules.ts";
import type { Seen, SourceItem } from "#specimen/ui/rules.ts";
import { givenShowings, showingName } from "#specimen/ui/showing.ts";
import type { ResponseClass, Showing } from "#specimen/ui/showing.ts";
import { itemFactsOf } from "#specimen/ui/source.ts";

/**
 * How long one case may run before the search reports it hung: a case opens its item and renders
 * four pages, tens of milliseconds, so thirty seconds catches only a case that stopped.
 */
const caseHang = "30 seconds";

/**
 * How long the search may take: about twelve seconds alone here, and the bound leaves room for a
 * loaded machine without letting a hung run stall the suite.
 */
const searchTimeoutMs = 600_000;

/**
 * How many rotating draws among the floor's cases a run makes, beside the floor stream's and the
 * steered phase's: as many as the specimen's own suite makes, so a run of the UI suite costs about
 * what that one does.
 */
const runs = 200;

/**
 * How many steered cases the search may run while a required situation is unreached. The search
 * draws the floor's cases unsteered, so these are more draws among them, every kind among them.
 */
const steeredCases = 600;

/**
 * A fact about a case the coverage counts: its kind of interaction in each mode, every kind the
 * specimen draws required in each, and the class of the response it draws.
 */
type Feature = `${KindName} in ${Showing["mode"]}` | `class ${ResponseClass}`;

/**
 * Give a generated case as the suite shows it: its item opened as a host opens it, the record a
 * templated item starts from, and the response its description gives, posted under the suite's
 * instance.
 *
 * @param held The case.
 * @returns The item; the case's refusal when plate does not accept its item.
 */
const sourceOf = (held: Specimen) =>
  Effect.map(opened(held.item, Option.none()), ({ accepted, configuration }): SourceItem => {
    const facts = itemFactsOf(held.item.xml);

    return {
      accepted,
      begun:
        accepted.item.templateProcessing.kind === "runs"
          ? Option.some(Result.getOrThrow(begin(accepted, { instance, seed: "1" })))
          : Option.none(),
      configuration,
      given: Option.some({
        described: held.description.answer,
        entries: entriesOf(held, instance),
      }),
      host: held.item.host,
      kinds: facts.kinds,
      location: held.item.location,
      offered: facts.offered,
      scoring: { kind: "predicted", score: held.response.score },
    };
  });

/**
 * Note a showing's features.
 *
 * @param c The case's handle.
 * @param held The case.
 * @param seen What the suite saw.
 */
const noteSeen = (c: Case<Feature>, held: Specimen, seen: Seen): void => {
  c.note(`${held.description.interaction.kind} in ${seen.showing.mode}`);
  c.note(`class ${seen.itemClass}`);
};

describe("plate's UI over the specimen", { timeout: searchTimeoutMs }, () => {
  it.effect(
    `every case of the floor keeps every rule in every showing: ${String(runs)} draws among them a run beside the witnesses`,
    (ctx) =>
      Effect.gen(function* specimenSuite() {
        const clients = yield* clientExports;

        return yield* searched(
          ctx,
          explore(
            {
              caseHang,
              coverage: required<Feature>(
                [
                  "class right",
                  "class partial",
                  "class wrong",
                  "class empty",
                  ...kindDimension.values.flatMap(({ value }) =>
                    (["answering", "review", "solution"] as const).map(
                      (mode): Feature => `${value} in ${mode}`,
                    ),
                  ),
                ],
                { cases: steeredCases, sense: notesOnly },
              ),
              draw: drawn(floorCase),
              kept: [],
              literal: (held) => JSON.stringify(held.description),
              oracle: {
                kind: "specification",
                name: Rec.keys(rules)
                  .map((name) => `${name}: ${rules[name].says}`)
                  .join("; "),
              },
              runs,
              shrink: completeShrink,
              steerEvery: 16,
              suite: "plate-ui/specimen",
            },
            (held, c) =>
              Effect.flatMap(sourceOf(held), (item) => {
                const offences = givenShowings.flatMap((showing) => {
                  const seen = see(item, showing, clients);

                  noteSeen(c, held, seen);

                  return Rec.keys(rules).flatMap((name) =>
                    rules[name]
                      .check(seen)
                      .filter((offence) => !known(name, offence, showing.mode))
                      .map(
                        (offence) =>
                          `${showingName(showing)}: ${name} (${rules[name].says}), ${offence.where}: ${offence.text}`,
                      ),
                  );
                });

                return offences.length === 0
                  ? Effect.void
                  : Effect.fail(
                      new Error(
                        `${held.item.location} breaks plate's UI rules:\n${offences.join("\n")}`,
                      ),
                    );
              }),
          ),
        );
      }),
  );
});
