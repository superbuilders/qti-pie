/**
 * Match (`qti-match-interaction`): a set of 2 to 6 sources matched to a set of 2 to 4 targets, each
 * source matched once, each target taking one source or any number.
 *
 * @module
 */
import { Option } from "effect";
import type { Answered } from "#specimen/answer.ts";
import { directedPairValue, responding } from "#specimen/posted.ts";
import { mapped } from "#specimen/credit.ts";
import { counted, dimension } from "#specimen/dimension.ts";
import { kind } from "#specimen/kind.ts";
import { correctResponse, declaration, mapping } from "#specimen/response.ts";
import { length, run } from "#specimen/words.ts";
import type { Length } from "#specimen/words.ts";
import { element, text } from "#specimen/xml.ts";

/**
 * The response's identifier.
 */
const response = "RESPONSE";

/**
 * How many sources a target takes: one (`match-max="1"`), or any number (`match-max="0"`).
 */
const takes = dimension("Each target takes", [
  ["one", "One source", "one"],
  ["any", "Any number", "any"],
]);

/**
 * The `max-associations` an author writes: as many as there are right pairs, or none (0).
 */
const most = dimension("Most pairs", [
  ["right", "The right pairs' count", "right"],
  ["unlimited", "No limit (0)", "unlimited"],
]);

/**
 * A Match's settings.
 */
interface MatchSettings {
  readonly most: (typeof most.values)[number]["value"];
  readonly sources: number;
  readonly takes: (typeof takes.values)[number]["value"];
  readonly targets: number;
  readonly text: Length;
}

/**
 * A source's identifier.
 *
 * @param at Its place, from 0.
 * @returns `S1`, `S2`, …
 */
const sourceOf = (at: number): string => `S${String(at + 1)}`;

/**
 * A target's identifier.
 *
 * @param at Its place, from 0.
 * @returns `T1`, `T2`, …
 */
const targetOf = (at: number): string => `T${String(at + 1)}`;

/**
 * The right pairs, as source and target places: each source matched to the target at its place,
 * wrapping when a target takes any number, or only as many sources as there are targets when each
 * takes one.
 *
 * @param settings The settings.
 * @returns The pairs, by source.
 */
const rightPairs = (settings: MatchSettings): readonly (readonly [number, number])[] =>
  Array.from(
    {
      length:
        settings.takes === "one" ? Math.min(settings.sources, settings.targets) : settings.sources,
    },
    (_, at) => [at, at % settings.targets] as const,
  );

/**
 * A pair's identifiers, the source first.
 *
 * @param pair The source's and the target's places.
 * @returns `S<n>` and `T<m>`.
 */
const identifiersOf = ([source, target]: readonly [number, number]): readonly [string, string] => [
  sourceOf(source),
  targetOf(target),
];

/**
 * A pair in its lexical form, the source first.
 *
 * @param pair The source's and the target's places.
 * @returns `S<n> T<m>`.
 */
const lexical = (pair: readonly [number, number]): string => identifiersOf(pair).join(" ");

/**
 * The response a set of pairs gives: a `multiple` of directed pairs.
 *
 * @param made The pairs.
 * @returns The response, none for no pair.
 */
const posted = (made: readonly (readonly [number, number])[]): Answered["posted"] =>
  responding(response, directedPairValue("multiple", made.map(identifiersOf)));

/**
 * Match, as the record of kinds holds it.
 */
export const match = kind("match", {
  answers: (settings: MatchSettings) => {
    const rights = rightPairs(settings);
    const half = Math.floor(rights.length / 2);

    return [
      { answer: "right", posted: posted(rights), score: rights.length },
      { answer: "partial", posted: posted(rights.slice(0, half)), score: half },
      {
        answer: "wrong",
        posted: posted(
          rights.map(([source, target]) => [source, (target + 1) % settings.targets] as const),
        ),
        score: 0,
      },
      { answer: "empty", posted: {}, score: 0 },
    ];
  },
  dimensions: {
    most,
    sources: counted("Sources", 2, 6),
    takes,
    targets: counted("Targets", 2, 4),
    text: length,
  },
  label: "Match",
  settings:
    (pick) =>
    (source): MatchSettings => ({
      most: source.draw(pick("most")),
      sources: source.draw(pick("sources")),
      takes: source.draw(pick("takes")),
      targets: source.draw(pick("targets")),
      text: source.draw(pick("text")),
    }),
  write: (settings: MatchSettings, context) => {
    const rights = rightPairs(settings).map(lexical);
    const set = (count: number, idOf: (at: number) => string, matchMax: number, offset: number) =>
      element(
        "qti-simple-match-set",
        {},
        Array.from({ length: count }, (_, at) =>
          element("qti-simple-associable-choice", { identifier: idOf(at), "match-max": matchMax }, [
            text(run(settings.text, offset + at)),
          ]),
        ),
      );

    return {
      assets: [],
      body: element(
        "qti-match-interaction",
        {
          "max-associations": settings.most === "right" ? rights.length : 0,
          "response-identifier": response,
        },
        [
          ...Option.match(context.prompt, {
            onNone: () => [],
            onSome: (prompt) => [element("qti-prompt", {}, [prompt])],
          }),
          set(settings.sources, sourceOf, 1, 0),
          set(settings.targets, targetOf, settings.takes === "one" ? 1 : 0, settings.sources),
        ],
      ),
      declarations: [
        declaration(response, "multiple", "directedPair", [
          correctResponse(rights),
          mapping(rights),
        ]),
      ],
      host: Option.none(),
      scoring: { kind: "scored", most: rights.length, rules: [mapped(response)] },
    };
  },
});
