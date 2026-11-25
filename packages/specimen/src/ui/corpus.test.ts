/**
 * Plate's UI suite over 1EdTech's QTI 3 example corpus: every accepted item of the corpus, in
 * every showing (`#specimen/ui/showing.ts`), keeps every rule of `#specimen/ui/rules.ts`, each
 * rule its own exhaustion, so a rule that breaks names itself and its case's replay token alone.
 *
 * Each case renders once, the first time a rule's exhaustion reaches it, and every rule reads the
 * same page. Items are the corpus document set's accepted items in its order
 * (`#specimen/ui/corpus.ts`); an item with template processing, which the QTI database runs at the
 * take, is shown with no record of it, since the suite holds no database.
 *
 * @module
 */
import { describe, it } from "@effect/vitest";
import { PropertyFalsified, exhaust } from "@bjornpagen/testing/explore";
import type { Case } from "@bjornpagen/testing/explore";
import { requiredInSpace } from "@bjornpagen/testing/features";
import type { Gen } from "@bjornpagen/testing/gen";
import { element, int } from "@bjornpagen/testing/gen";
import { searched } from "@bjornpagen/testing/vitest";
import { Array as Arr, Cause, Duration, Effect, Option, Record as Rec } from "effect";
import { clientExports } from "#specimen/ui/clients.ts";
import { corpusItems } from "#specimen/ui/corpus.ts";
import { findings, holds, known, sourceName } from "#specimen/ui/findings.ts";
import type { InteractionKind } from "#specimen/ui/rendered.ts";
import { rules, see } from "#specimen/ui/rules.ts";
import type { Offence, RuleName, Seen, SourceItem } from "#specimen/ui/rules.ts";
import { showingName, showings } from "#specimen/ui/showing.ts";
import type { ResponseClass, Showing } from "#specimen/ui/showing.ts";

/**
 * How long one case may run before the search reports it hung: a render takes about a millisecond
 * and a half here, so ten seconds catches only a case that stopped.
 */
const caseHang = Duration.seconds(10);

/**
 * The corpus as the suite shows it, with plate's client exports, read once per test file.
 */
const corpus = Effect.runSync(
  Effect.cached(Effect.all({ clients: clientExports, items: corpusItems })),
);

/**
 * One case: an item, by its place in the corpus's accepted items, in one showing.
 */
interface CorpusCase {
  readonly item: number;
  readonly showing: Showing;
}

/**
 * A fact about a case the coverage counts: a kind of interaction met in a mode, the class of the
 * shown responses, what became of the showing, an answering page whose islands the walk finds, so
 * J1's walk is seen to find islands where they are, a review or a solution whose only islands are a
 * Media's replay islands, so J1 is seen to judge one, and a review that shows the solution with
 * marks drawn, of a class, which M1 judges.
 */
type Feature =
  | `${InteractionKind} in ${Showing["mode"]}`
  | `class ${ResponseClass}`
  | `marked ${ResponseClass}`
  | `outcome ${Seen["outcome"]["kind"]}`
  | "islands in answering"
  | "replay islands in review";

/**
 * The kinds of interaction every rule's exhaustion must meet in the corpus: a record over every
 * kind plate parses, so a kind plate gains is one the corpus is asked to hold. The corpus holds all
 * nineteen.
 */
const corpusKinds = {
  associate: true,
  choice: true,
  "end-attempt": true,
  "extended-text": true,
  "gap-match": true,
  "graphic-associate": true,
  "graphic-gap-match": true,
  "graphic-order": true,
  hotspot: true,
  hottext: true,
  "inline-choice": true,
  match: true,
  media: true,
  order: true,
  "portable-custom": true,
  "position-object": true,
  "select-point": true,
  slider: true,
  "text-entry": true,
} as const satisfies { readonly [K in InteractionKind]: true };

/**
 * What every rule's exhaustion must reach in the corpus: every kind of interaction in every mode,
 * every class of response, and every outcome but a throw, what the corpus holds, so a kind or a
 * class the suite stops showing fails the run.
 */
const situations: readonly [Feature, ...Feature[]] = [
  "class right",
  "class wrong",
  "class partial",
  "class empty",
  "class unjudged",
  "outcome rendered",
  "outcome underived",
  "islands in answering",
  "replay islands in review",
  "marked right",
  "marked wrong",
  "marked partial",
  "marked empty",
  ...Rec.keys(corpusKinds).flatMap((kind) =>
    (["answering", "review", "solution"] as const).map((mode): Feature => `${kind} in ${mode}`),
  ),
];

/**
 * The case each item index and showing renders, by the item's index and the showing's name, kept
 * once rendered, so every rule's exhaustion reads the same page and renders it once: the suite
 * makes one and hands it to every exhaustion.
 */
type SeenCases = Map<string, Seen>;

/**
 * Show a case, or give the showing already seen.
 *
 * @param seenCases The cases the suite has shown.
 * @param item The item.
 * @param index Its place among the accepted items.
 * @param showing The showing.
 * @param clients Plate's client exports.
 * @returns What the suite saw.
 */
const seenOf = (
  seenCases: SeenCases,
  item: SourceItem,
  index: number,
  showing: Showing,
  clients: ReadonlyMap<unknown, string>,
): Seen => {
  const key = `${String(index)} ${showingName(showing)}`;
  const kept = seenCases.get(key);

  if (kept !== undefined) {
    return kept;
  }

  const seen = see(item, showing, clients);

  seenCases.set(key, seen);

  return seen;
};

/**
 * Note a case's features.
 *
 * @param c The case's handle.
 * @param seen What the suite saw.
 */
const noteSeen = (c: Case<Feature>, seen: Seen): void => {
  c.noteAll(seen.kinds.map((kind): Feature => `${kind} in ${seen.showing.mode}`));
  c.note(`class ${seen.itemClass}`);
  c.note(`outcome ${seen.outcome.kind}`);

  if (
    seen.outcome.kind === "rendered" &&
    seen.showing.mode === "answering" &&
    seen.outcome.page.islands.length > 0
  ) {
    c.note("islands in answering");
  }

  if (
    seen.outcome.kind === "rendered" &&
    seen.showing.mode !== "answering" &&
    seen.outcome.page.islands.length > 0
  ) {
    c.note("replay islands in review");
  }

  if (seen.outcome.kind === "rendered" && seen.showing.mode === "review") {
    c.noteAll(
      seen.showing.solution === "shown" && seen.outcome.page.facts.marks.length > 0
        ? [`marked ${seen.itemClass}`]
        : [],
    );
  }
};

/**
 * Exhaust one rule over every accepted corpus item in every showing, judging the offences a filter
 * keeps.
 *
 * @param seenCases The cases the suite has shown.
 * @param name The rule.
 * @param suite The search's name, which its replay token carries.
 * @param judged Whether an offence on a page of a mode is one this search judges.
 * @param ctx The test's context.
 * @returns The exhaustion; it fails on the first case with an offence it judges, with its replay
 *   token.
 */
const exhaustRule = (
  seenCases: SeenCases,
  name: RuleName,
  suite: string,
  judged: (offence: Offence, mode: Showing["mode"]) => boolean,
  ctx: Parameters<typeof searched>[0],
) =>
  Effect.gen(function* exhaustCases() {
    const { clients, items } = yield* corpus;
    const generator: Gen<CorpusCase> = (source) => ({
      item: source.draw(int(0, items.length - 1)),
      showing: source.draw(element(showings)),
    });
    const rule = rules[name];

    return yield* searched(
      ctx,
      exhaust(
        {
          box: `every accepted item of 1EdTech's QTI 3 examples (${String(items.length)}) in every showing (${String(showings.length)})`,
          caseHang,
          coverage: requiredInSpace<Feature>(situations),
          generator,
          literal: (value) =>
            `${JSON.stringify(value)} /* ${items[value.item]?.location ?? "no item"}, ${showingName(value.showing)} */`,
          oracle: { kind: "specification", name: `${name}: ${rule.says}` },
          suite,
        },
        (value, c) =>
          Option.match(Arr.get(items, value.item), {
            onNone: () => Effect.die(`no corpus item at ${String(value.item)}`),
            onSome: (item) => {
              const seen = seenOf(seenCases, item, value.item, value.showing, clients);

              noteSeen(c, seen);

              const offences = rule
                .check(seen)
                .filter((offence) => judged(offence, seen.showing.mode));

              return offences.length === 0
                ? Effect.void
                : Effect.fail(
                    new Error(
                      `${name} (${rule.says}) breaks on ${item.location}, ${showingName(value.showing)}:\n${offences.map((offence) => `${offence.where}: ${offence.text}`).join("\n")}`,
                    ),
                  );
            },
          }),
      ),
    );
  });

/**
 * Hold a known finding's search to failing for its own reason: it fails exactly when the search
 * falsifies its rule, so its test, which expects to fail, passes only while the finding stands.
 * A search that passes, the finding fixed, or that fails for any other reason, a corpus it cannot
 * read or a module that does not load, succeeds, and its test fails; the other reason is left on
 * the test as an annotation.
 *
 * @param search The finding's search.
 * @param suite The search's name.
 * @param ctx The test's context.
 * @returns The search's falsification, or success.
 */
const stillBreaks = <A, E, R>(
  search: Effect.Effect<A, E, R>,
  suite: string,
  ctx: Parameters<typeof searched>[0],
): Effect.Effect<void, PropertyFalsified, R> =>
  search.pipe(
    Effect.asVoid,
    Effect.catchCause((cause) =>
      Option.match(
        Option.flatMap(Cause.findErrorOption(cause), (found) =>
          found instanceof PropertyFalsified && found.suite === suite
            ? Option.some(found)
            : Option.none(),
        ),
        {
          onNone: () =>
            Effect.asVoid(
              Effect.promise(() =>
                ctx.annotate(
                  `${suite} did not falsify its rule, so the finding is not known to stand: ${Cause.pretty(cause)}`,
                ),
              ),
            ),
          onSome: (falsified) => Effect.fail(falsified),
        },
      ),
    ),
  );

describe("plate's UI over the corpus", () => {
  const seenCases: SeenCases = new Map();

  for (const name of Rec.keys(rules)) {
    it.effect(`${name}: ${rules[name].says}`, (ctx) =>
      exhaustRule(
        seenCases,
        name,
        `plate-ui/corpus/${name}`,
        (offence, mode) => !known(name, offence, mode),
        ctx,
      ),
    );
  }

  for (const finding of findings) {
    const suite = `plate-ui/corpus/${finding.rule}/${finding.where}`;

    it.effect.fails(
      `${sourceName(finding.source)}: ${finding.rule} breaks in ${finding.where} in ${finding.modes.join(" and ")}, ${finding.says}`,
      (ctx) =>
        stillBreaks(
          exhaustRule(
            seenCases,
            finding.rule,
            suite,
            (offence, mode) => holds(finding, finding.rule, offence, mode),
            ctx,
          ),
          suite,
          ctx,
        ),
    );
  }
});
